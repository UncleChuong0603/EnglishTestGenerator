import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";
import type { AnalyticsPeriod, ProductAnalyticsSnapshot } from "./calculate";

export type ChallengeFunnelCounts = { viewed: number; started: number; completed: number; signup: number; firstWorkout: number };
export async function getChallengeFunnel(period: AnalyticsPeriod): Promise<ChallengeFunnelCounts> {
  const days = daysFor(period);
  const result = await db.execute(sql`
    with views as (
      select case when user_id is not null then 'u:' || user_id::text else 'g:' || guest_reference end actor,
             min(occurred_at) viewed_at
      from product_events
      where event_name = 'challenge_viewed' and occurred_at >= now() - (${days} * interval '1 day')
        and (user_id is not null or guest_reference is not null)
      group by 1
    ), starts as (
      select distinct v.actor, e.session_id, e.occurred_at
      from views v join product_events e on e.event_name = 'challenge_started'
        and (case when e.user_id is not null then 'u:' || e.user_id::text else 'g:' || e.guest_reference end) = v.actor
        and e.occurred_at >= v.viewed_at and e.session_id is not null
    ), completions as (
      select distinct s.actor, s.session_id, e.occurred_at
      from starts s join product_events e on e.event_name = 'challenge_completed'
        and e.session_id = s.session_id and e.occurred_at >= s.occurred_at
    ), signups as (
      select distinct c.actor, e.user_id, e.occurred_at
      from completions c join product_events e on e.event_name = 'signup_after_challenge'
        and e.session_id = c.session_id and e.user_id is not null and e.occurred_at >= c.occurred_at
    ), workouts as (
      select distinct s.actor
      from signups s join product_events e on e.event_name = 'first_authenticated_workout_after_challenge'
        and e.user_id = s.user_id and e.occurred_at >= s.occurred_at
    )
    select (select count(*)::int from views) viewed,
           (select count(distinct actor)::int from starts) started,
           (select count(distinct actor)::int from completions) completed,
           (select count(distinct actor)::int from signups) signup,
           (select count(*)::int from workouts) "firstWorkout"
  `);
  const row = result.rows[0];
  return { viewed: Number(row.viewed), started: Number(row.started), completed: Number(row.completed), signup: Number(row.signup), firstWorkout: Number(row.firstWorkout) };
}

const daysFor = (period: AnalyticsPeriod) => period === "today" ? 1 : period === "30d" ? 30 : 7;

export async function getProductAnalytics(period: AnalyticsPeriod) {
  const days = daysFor(period);
  const result = await db.execute(sql`
    with bounds as (select now() - (${days} * interval '1 day') as since),
    raw_counts as (select event_name, count(*)::int value from product_events, bounds where occurred_at >= since and event_name not in ('signup_completed','checkout_started') group by event_name),
    authoritative_counts as (
      select 'diagnostic_started' event_name, count(*)::int value from diagnostic_runs, bounds where created_at >= since
      union all select 'diagnostic_completed', count(*)::int from diagnostic_runs, bounds where completed_at >= since
      union all select 'guest_practice_started', count(*)::int from practice_sessions, bounds where created_at >= since and guest_owner_hash is not null and source <> 'diagnostic'
      union all select 'guest_practice_completed', count(*)::int from practice_sessions, bounds where submitted_at >= since and guest_owner_hash is not null and source <> 'diagnostic'
      union all select 'signup_completed', count(*)::int from users, bounds where created_at >= since
      union all select 'checkout_started', count(*)::int from payment_orders, bounds where created_at >= since
      union all select 'workout_completed', count(*)::int from practice_sessions, bounds where submitted_at >= since and source='recommended'
      union all select 'mistake_review_completed', count(*)::int from practice_sessions, bounds where submitted_at >= since and source='mastery_review'
      union all select 'mock_completed', count(*)::int from full_mock_runs, bounds where completed_at >= since
    ),
    event_counts as (select event_name, sum(value)::int value from (select * from raw_counts union all select * from authoritative_counts) counts group by event_name),
    completed as (select count(*)::int sessions, coalesce(sum(question_count),0)::int questions, count(distinct user_id)::int active from practice_sessions, bounds where status='submitted' and submitted_at >= since and user_id is not null),
    signups as (select count(*)::int value from users, bounds where created_at >= since),
    activated as (select count(*)::int value from (select user_id, min(submitted_at) first_completed from practice_sessions where status='submitted' and user_id is not null group by user_id) firsts, bounds where first_completed >= since),
    wau as (select count(distinct user_id)::int value from practice_sessions where status='submitted' and submitted_at >= now() - interval '7 day' and user_id is not null),
    dau as (select count(distinct user_id)::int value from practice_sessions where status='submitted' and submitted_at >= date_trunc('day', now() at time zone 'Asia/Ho_Chi_Minh') at time zone 'Asia/Ho_Chi_Minh' and user_id is not null),
    payments as (select count(*) filter (where created_at >= (select since from bounds))::int checkout_created, count(*) filter (where paid_at >= (select since from bounds))::int premium_activated from payment_orders),
    active_premium as (select count(distinct user_id)::int value from user_plan_memberships where plan_key = 'PREMIUM' and revoked_at is null and starts_at <= now() and (ends_at is null or ends_at > now())),
    retention as (
      select n, count(*)::int cohort, count(*) filter (where exists(select 1 from practice_sessions p where p.user_id=u.id and p.status='submitted' and p.submitted_at >= u.created_at + (n || ' day')::interval and p.submitted_at < u.created_at + ((n+1) || ' day')::interval))::int returned
      from users u cross join (values (1),(7),(30)) d(n) where u.created_at < now() - (n || ' day')::interval group by n
    )
    select json_build_object(
      'events', coalesce((select json_object_agg(event_name,value) from event_counts),'{}'::json),
      'sessions',(select sessions from completed),'questions',(select questions from completed),'active',(select active from completed),
      'signups',(select value from signups),'activated',(select value from activated),'dau',(select value from dau),'wau',(select value from wau),
      'checkoutCreated',(select checkout_created from payments),'premiumActivated',(select premium_activated from payments),'activePremiumUsers',(select value from active_premium),
      'retention',coalesce((select json_object_agg(n,json_build_object('cohort',cohort,'returned',returned)) from retention),'{}'::json)
    ) data`);
  return result.rows[0].data as ProductAnalyticsSnapshot;
}
