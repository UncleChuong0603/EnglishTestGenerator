import "server-only";
import { sql, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { meaningfulLearningSessionSql } from "@/lib/learning/query-policy";
import {
  getRetentionProductWindow,
  safeUserActivityMetadata,
  type UserActivityAction,
  type UserActivityCategory,
  type UserActivityItem,
} from "./user-activity-policy";

export type AdminUserActivityFilters = {
  search?: string;
  plan?: string;
  status?: string;
  role?: string;
  verified?: string;
  activity?: string;
  learning?: string;
  sort?: string;
  page?: number;
};

export type PlanLifecycle = "FREE" | "PREMIUM" | "EXPIRED";

export type AdminUserActivityRow = {
  id: string;
  email: string;
  name: string | null;
  status: string;
  emailVerifiedAt: Date | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  admin: boolean;
  plan: PlanLifecycle;
  learningDays: number;
  sessions: number;
  questions: number;
  lastLearningAt: Date | null;
  goal: {
    targetScore: number | null;
    examDate: string | null;
    dailyStudyMinutes: number | null;
    studyDaysPerWeek: number | null;
  } | null;
  lastAction: UserActivityItem | null;
};

export type RetentionDiagnostics = {
  totalLearners: number;
  signups7d: number;
  activated: number;
  oneLearningDay7d: number;
  returned2Days7d: number;
  returned3Days7d: number;
  noMeaningfulLearning: number;
  workoutCompleters: number;
  workoutReturnedDifferentDay: number;
  windowStart: Date;
  windowEnd: Date;
};

export type AdminUserLearningSummary = {
  joinedAt: Date;
  lastLearningAt: Date | null;
  learningDays: number;
  learningDays7d: number;
  sessions: number;
  questions: number;
  plan: PlanLifecycle;
  goal: AdminUserActivityRow["goal"];
  lastAction: UserActivityItem | null;
};

export type UserActivityPage = {
  rows: UserActivityItem[];
  total: number;
  page: number;
  pageSize: number;
};

type RawRow = Record<string, unknown>;

const asNumber = (value: unknown) => Number(value ?? 0);
const asDate = (value: unknown) => value instanceof Date ? value : new Date(String(value));
const asNullableDate = (value: unknown) => value === null || value === undefined ? null : asDate(value);
const asNullableNumber = (value: unknown) => value === null || value === undefined ? null : Number(value);
const asNullableString = (value: unknown) => typeof value === "string" ? value : null;

function parseActivity(row: RawRow): UserActivityItem {
  return {
    key: String(row.activityKey),
    occurredAt: asDate(row.occurredAt),
    category: String(row.category) as UserActivityCategory,
    action: String(row.action) as UserActivityAction,
    source: String(row.source),
    summary: asNullableString(row.summary),
    metadata: safeUserActivityMetadata(row.metadata),
    priority: asNumber(row.priority),
  };
}

function targetUsersSql(userIds: readonly string[]) {
  const values = sql.join(userIds.map((id) => sql`(${id}::uuid)`), sql`, `);
  return sql`select user_id from (values ${values}) as selected(user_id)`;
}

function activityUnionSql() {
  const meaningful = meaningfulLearningSessionSql("ps");
  return sql`
    select u.id as user_id,
      'account:' || u.id::text as activity_key,
      u.created_at as occurred_at,
      'ACCOUNT'::text as category,
      'ACCOUNT_CREATED'::text as action,
      'users'::text as source,
      null::text as summary,
      '{}'::jsonb as metadata,
      10::int as priority
    from users u
    inner join target_users t on t.user_id = u.id

    union all
    select g.user_id,
      'goal:' || g.user_id::text,
      g.updated_at,
      'GOAL',
      'GOAL_CONFIGURED',
      'learner_goals',
      null::text,
      jsonb_strip_nulls(jsonb_build_object(
        'targetScore', g.target_score,
        'examDate', g.exam_date,
        'dailyStudyMinutes', g.daily_study_minutes,
        'studyDaysPerWeek', g.study_days_per_week
      )),
      50
    from learner_goals g
    inner join target_users t on t.user_id = g.user_id

    union all
    select d.user_id,
      'diagnostic-start:' || d.id::text,
      d.created_at,
      'DIAGNOSTIC',
      'DIAGNOSTIC_STARTED',
      'diagnostic_runs',
      null::text,
      jsonb_build_object('diagnosticPurpose', d.purpose),
      60
    from diagnostic_runs d
    inner join target_users t on t.user_id = d.user_id

    union all
    select d.user_id,
      'diagnostic-complete:' || d.id::text,
      d.completed_at,
      'DIAGNOSTIC',
      'DIAGNOSTIC_COMPLETED',
      'diagnostic_runs',
      null::text,
      jsonb_build_object('diagnosticPurpose', d.purpose),
      80
    from diagnostic_runs d
    inner join target_users t on t.user_id = d.user_id
    where d.completed_at is not null

    union all
    select ps.user_id,
      'practice-start:' || ps.id::text,
      ps.started_at,
      case when ps.source = 'recommended' then 'WORKOUT'
        when ps.source = 'mastery_review' then 'REVIEW'
        else 'PRACTICE' end,
      case when ps.source = 'recommended' then 'WORKOUT_STARTED'
        when ps.source = 'mastery_review' then 'REVIEW_STARTED'
        else 'PRACTICE_STARTED' end,
      'practice_sessions',
      case when ps.part is not null then 'Part ' || ps.part::text else ps.skill_area end,
      jsonb_strip_nulls(jsonb_build_object(
        'part', ps.part,
        'skillArea', ps.skill_area,
        'practiceSource', ps.source,
        'questionCount', ps.question_count
      )),
      60
    from practice_sessions ps
    inner join target_users t on t.user_id = ps.user_id
    where ps.source not in ('diagnostic','full_mock','ranked_challenge')
      and ps.practice_type <> 'demo_test'

    union all
    select ps.user_id,
      'practice-complete:' || ps.id::text,
      ps.submitted_at,
      case when ps.source = 'recommended' then 'WORKOUT'
        when ps.source = 'mastery_review' then 'REVIEW'
        else 'PRACTICE' end,
      case when ps.source = 'recommended' then 'WORKOUT_COMPLETED'
        when ps.source = 'mastery_review' then 'REVIEW_COMPLETED'
        else 'PRACTICE_COMPLETED' end,
      'practice_sessions',
      case when ps.part is not null then 'Part ' || ps.part::text else ps.skill_area end,
      jsonb_strip_nulls(jsonb_build_object(
        'part', ps.part,
        'skillArea', ps.skill_area,
        'practiceSource', ps.source,
        'questionCount', (select count(*)::int from attempt_answers aa where aa.session_id = ps.id and aa.answered_at is not null),
        'correctCount', ps.score_correct,
        'totalCount', ps.score_total,
        'accuracy', case when coalesce(ps.score_total, 0) > 0 then round(ps.score_correct::numeric * 100 / ps.score_total)::int end
      )),
      80
    from practice_sessions ps
    inner join target_users t on t.user_id = ps.user_id
    where ${meaningful}

    union all
    select m.user_id,
      'mock-start:' || m.id::text,
      coalesce(m.listening_started_at, m.reading_started_at, m.created_at),
      'MOCK',
      'MOCK_STARTED',
      'full_mock_runs',
      m.mode,
      jsonb_build_object('mockMode', m.mode),
      60
    from full_mock_runs m
    inner join target_users t on t.user_id = m.user_id

    union all
    select m.user_id,
      'mock-complete:' || m.id::text,
      m.completed_at,
      'MOCK',
      'MOCK_COMPLETED',
      'full_mock_runs',
      m.mode,
      jsonb_build_object('mockMode', m.mode),
      80
    from full_mock_runs m
    inner join target_users t on t.user_id = m.user_id
    where m.completed_at is not null

    union all
    select p.user_id,
      'checkout:' || p.id::text,
      p.created_at,
      'PREMIUM',
      'CHECKOUT_STARTED',
      'payment_orders',
      p.product_key,
      jsonb_build_object('orderStatus', p.status),
      65
    from payment_orders p
    inner join target_users t on t.user_id = p.user_id

    union all
    select m.user_id,
      'premium:' || m.id::text,
      m.starts_at,
      'PREMIUM',
      'PREMIUM_ACTIVATED',
      'user_plan_memberships',
      m.plan_key,
      jsonb_build_object('planSource', m.source),
      85
    from user_plan_memberships m
    inner join target_users t on t.user_id = m.user_id

    union all
    select e.user_id,
      'product-event:' || e.id::text,
      e.occurred_at,
      case when e.event_name = 'checkout_started' then 'PREMIUM' else 'PRODUCT' end,
      case e.event_name
        when 'login_completed' then 'SIGNED_IN'
        when 'try_viewed' then 'TRY_VIEWED'
        when 'pricing_viewed' then 'PRICING_VIEWED'
        else 'CHECKOUT_STARTED' end,
      'product_events',
      null::text,
      jsonb_strip_nulls(jsonb_build_object('route', e.route)),
      case when e.event_name = 'checkout_started' then 65 else 40 end
    from product_events e
    inner join target_users t on t.user_id = e.user_id
    where e.event_name in ('login_completed','try_viewed','pricing_viewed','checkout_started')
      and (e.event_name <> 'checkout_started' or not exists (
        select 1 from payment_orders p
        where p.user_id = e.user_id
          and p.created_at >= e.occurred_at - interval '2 minutes'
          and p.created_at <= e.occurred_at + interval '5 minutes'
      ))

    union all
    select s.user_id,
      'security:' || s.id::text,
      s.created_at,
      'ACCOUNT',
      case s.event_type
        when 'email_verified' then 'ACCOUNT_VERIFIED'
        when 'account_activated' then 'ACCOUNT_ACTIVATED'
        when 'google_linked' then 'GOOGLE_LINKED'
        when 'session_revoked' then 'SESSION_REVOKED'
        when 'login_success' then 'SIGNED_IN'
        else 'PASSWORD_UPDATED' end,
      'security_events',
      null::text,
      '{}'::jsonb,
      case when s.event_type = 'login_success' then 40 else 45 end
    from security_events s
    inner join target_users t on t.user_id = s.user_id
    where s.event_type in ('email_verified','account_activated','google_linked','session_revoked','login_success','password_reset','password_changed','password_set')

    union all
    select a.target_user_id,
      'admin-audit:' || a.id::text,
      a.created_at,
      case when a.action = 'PREMIUM_REVOKED' then 'PREMIUM' else 'ACCOUNT' end,
      case a.action
        when 'USER_SUSPENDED' then 'ACCOUNT_SUSPENDED'
        when 'USER_REACTIVATED' then 'ACCOUNT_REACTIVATED'
        when 'ADMIN_ROLE_GRANTED' then 'ADMIN_ROLE_GRANTED'
        when 'ADMIN_ROLE_REVOKED' then 'ADMIN_ROLE_REVOKED'
        else 'PREMIUM_REVOKED' end,
      'admin_audit_logs',
      null::text,
      '{}'::jsonb,
      75
    from admin_audit_logs a
    inner join target_users t on t.user_id = a.target_user_id
    where a.action in ('USER_SUSPENDED','USER_REACTIVATED','ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','PREMIUM_REVOKED')
  `;
}

function baseUsersCte(now: Date) {
  const meaningful = meaningfulLearningSessionSql("ps");
  return sql`
    meaningful_sessions as (
      select ps.id, ps.user_id, ps.submitted_at
      from practice_sessions ps
      where ${meaningful}
    ),
    learning as (
      select ms.user_id,
        count(distinct ms.id)::int as sessions,
        count(distinct (timezone('Asia/Ho_Chi_Minh', ms.submitted_at))::date)::int as learning_days,
        max(ms.submitted_at) as last_learning_at,
        count(aa.id) filter (where aa.answered_at is not null)::int as questions
      from meaningful_sessions ms
      left join attempt_answers aa on aa.session_id = ms.id and aa.user_id = ms.user_id
      group by ms.user_id
    ),
    base_users as (
      select u.id, u.email, u.email_normalized, p.full_name, u.status,
        u.email_verified_at, u.created_at, u.last_login_at,
        exists(select 1 from user_roles r where r.user_id = u.id and r.role = 'ADMIN' and r.revoked_at is null) as is_admin,
        case
          when exists(select 1 from user_plan_memberships m where m.user_id = u.id and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${now} and (m.ends_at is null or m.ends_at > ${now})) then 'PREMIUM'
          when exists(select 1 from user_plan_memberships m where m.user_id = u.id and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${now} and m.ends_at <= ${now}) then 'EXPIRED'
          else 'FREE' end as plan_status,
        coalesce(l.sessions, 0)::int as sessions,
        coalesce(l.learning_days, 0)::int as learning_days,
        coalesce(l.questions, 0)::int as questions,
        l.last_learning_at,
        g.target_score, g.exam_date, g.daily_study_minutes, g.study_days_per_week
      from users u
      left join profiles p on p.id = u.id
      left join learning l on l.user_id = u.id
      left join learner_goals g on g.user_id = u.id
    )
  `;
}

function filtersSql(filters: AdminUserActivityFilters, now: Date) {
  const conditions: SQL[] = [];
  const normalized = filters.search?.trim().toLowerCase().slice(0, 200);
  if (normalized) {
    const pattern = `%${normalized}%`;
    conditions.push(sql`(email_normalized ilike ${pattern} or full_name ilike ${pattern})`);
  }
  if (["active", "disabled", "pending_verification"].includes(filters.status ?? "")) conditions.push(sql`status = ${filters.status}`);
  if (filters.plan === "premium") conditions.push(sql`plan_status = 'PREMIUM'`);
  if (filters.plan === "free") conditions.push(sql`plan_status = 'FREE'`);
  if (filters.plan === "expired") conditions.push(sql`plan_status = 'EXPIRED'`);
  if (filters.role === "admin") conditions.push(sql`is_admin`);
  if (filters.role === "learner") conditions.push(sql`not is_admin`);
  if (filters.verified === "yes") conditions.push(sql`email_verified_at is not null`);
  if (filters.verified === "no") conditions.push(sql`email_verified_at is null`);
  if (filters.activity === "recent") conditions.push(sql`last_login_at >= ${new Date(now.getTime() - 30 * 86_400_000)}`);
  if (filters.activity === "never") conditions.push(sql`last_login_at is null`);
  if (filters.learning === "none") conditions.push(sql`learning_days = 0`);
  if (filters.learning === "one") conditions.push(sql`learning_days = 1`);
  if (filters.learning === "returning") conditions.push(sql`learning_days >= 2`);
  if (filters.learning === "habit") conditions.push(sql`learning_days >= 3`);
  return conditions.length ? sql`where ${sql.join(conditions, sql` and `)}` : sql``;
}

function orderSql(sort?: string) {
  if (sort === "created_asc") return sql`created_at asc, id asc`;
  if (sort === "learning_recent") return sql`last_learning_at desc nulls last, id asc`;
  if (sort === "learning_oldest") return sql`last_learning_at asc nulls first, id asc`;
  if (sort === "login") return sql`last_login_at desc nulls last, id asc`;
  if (sort === "identity") return sql`email_normalized asc, id asc`;
  return sql`created_at desc, id asc`;
}

function parseGoal(row: RawRow): AdminUserActivityRow["goal"] {
  if (row.targetScore === null && row.examDate === null && row.dailyStudyMinutes === null && row.studyDaysPerWeek === null) return null;
  return {
    targetScore: asNullableNumber(row.targetScore),
    examDate: asNullableString(row.examDate),
    dailyStudyMinutes: asNullableNumber(row.dailyStudyMinutes),
    studyDaysPerWeek: asNullableNumber(row.studyDaysPerWeek),
  };
}

export async function listAdminUsersWithActivity(filters: AdminUserActivityFilters, pageSize = 20) {
  const page = Math.min(100_000, Math.max(1, filters.page ?? 1));
  const now = new Date();
  const base = baseUsersCte(now);
  const where = filtersSql(filters, now);
  const order = orderSql(filters.sort);
  const [rowsResult, totalResult] = await Promise.all([
    db.execute(sql`
      with ${base}
      select id, email, full_name as "fullName", status,
        email_verified_at as "emailVerifiedAt", created_at as "createdAt", last_login_at as "lastLoginAt",
        is_admin as "isAdmin", plan_status as "planStatus", learning_days as "learningDays",
        sessions, questions, last_learning_at as "lastLearningAt", target_score as "targetScore",
        exam_date::text as "examDate", daily_study_minutes as "dailyStudyMinutes", study_days_per_week as "studyDaysPerWeek"
      from base_users
      ${where}
      order by ${order}
      limit ${pageSize} offset ${(page - 1) * pageSize}
    `),
    db.execute(sql`with ${base} select count(*)::int as total from base_users ${where}`),
  ]);

  const rawRows = rowsResult.rows as RawRow[];
  const lastActions = await getLastMeaningfulActions(rawRows.map((row) => String(row.id)));
  const rows: AdminUserActivityRow[] = rawRows.map((row) => ({
    id: String(row.id),
    email: String(row.email),
    name: asNullableString(row.fullName),
    status: String(row.status),
    emailVerifiedAt: asNullableDate(row.emailVerifiedAt),
    createdAt: asDate(row.createdAt),
    lastLoginAt: asNullableDate(row.lastLoginAt),
    admin: Boolean(row.isAdmin),
    plan: String(row.planStatus) as PlanLifecycle,
    learningDays: asNumber(row.learningDays),
    sessions: asNumber(row.sessions),
    questions: asNumber(row.questions),
    lastLearningAt: asNullableDate(row.lastLearningAt),
    goal: parseGoal(row),
    lastAction: lastActions.get(String(row.id)) ?? null,
  }));
  return { rows, total: asNumber((totalResult.rows[0] as RawRow | undefined)?.total), page, pageSize };
}

export async function getRetentionDiagnostics(now = new Date()): Promise<RetentionDiagnostics> {
  const window = getRetentionProductWindow(now);
  const meaningful = meaningfulLearningSessionSql("ps");
  const result = await db.execute(sql`
    with learner_users as (
      select u.id, u.created_at
      from users u
      where not exists(select 1 from user_roles r where r.user_id = u.id and r.role = 'ADMIN' and r.revoked_at is null)
    ),
    meaningful_sessions as (
      select ps.id, ps.user_id, ps.submitted_at, ps.source
      from practice_sessions ps
      inner join learner_users u on u.id = ps.user_id
      where ${meaningful}
    ),
    lifetime as (
      select user_id, count(*)::int as sessions
      from meaningful_sessions
      group by user_id
    ),
    window_days as (
      select user_id, count(distinct (timezone('Asia/Ho_Chi_Minh', submitted_at))::date)::int as learning_days
      from meaningful_sessions
      where submitted_at >= ${window.start} and submitted_at < ${window.end}
      group by user_id
    ),
    workout_days as (
      select user_id, count(distinct (timezone('Asia/Ho_Chi_Minh', submitted_at))::date)::int as learning_days
      from meaningful_sessions
      where source = 'recommended'
      group by user_id
    )
    select count(*)::int as "totalLearners",
      count(*) filter (where u.created_at >= ${window.start} and u.created_at < ${window.end})::int as "signups7d",
      count(*) filter (where coalesce(l.sessions, 0) > 0)::int as activated,
      count(*) filter (where coalesce(w.learning_days, 0) = 1)::int as "oneLearningDay7d",
      count(*) filter (where coalesce(w.learning_days, 0) >= 2)::int as "returned2Days7d",
      count(*) filter (where coalesce(w.learning_days, 0) >= 3)::int as "returned3Days7d",
      count(*) filter (where coalesce(l.sessions, 0) = 0)::int as "noMeaningfulLearning",
      count(*) filter (where coalesce(wo.learning_days, 0) >= 1)::int as "workoutCompleters",
      count(*) filter (where coalesce(wo.learning_days, 0) >= 2)::int as "workoutReturnedDifferentDay"
    from learner_users u
    left join lifetime l on l.user_id = u.id
    left join window_days w on w.user_id = u.id
    left join workout_days wo on wo.user_id = u.id
  `);
  const row = result.rows[0] as RawRow;
  return {
    totalLearners: asNumber(row.totalLearners),
    signups7d: asNumber(row.signups7d),
    activated: asNumber(row.activated),
    oneLearningDay7d: asNumber(row.oneLearningDay7d),
    returned2Days7d: asNumber(row.returned2Days7d),
    returned3Days7d: asNumber(row.returned3Days7d),
    noMeaningfulLearning: asNumber(row.noMeaningfulLearning),
    workoutCompleters: asNumber(row.workoutCompleters),
    workoutReturnedDifferentDay: asNumber(row.workoutReturnedDifferentDay),
    windowStart: window.start,
    windowEnd: window.end,
  };
}

export async function getAdminUserLearningSummary(userId: string, now = new Date()): Promise<AdminUserLearningSummary | null> {
  const window = getRetentionProductWindow(now);
  const meaningful = meaningfulLearningSessionSql("ps");
  const summaryPromise = db.execute(sql`
    with meaningful_sessions as (
      select ps.id, ps.submitted_at
      from practice_sessions ps
      where ps.user_id = ${userId}::uuid and ${meaningful}
    ),
    learning as (
      select count(distinct ms.id)::int as sessions,
        count(distinct (timezone('Asia/Ho_Chi_Minh', ms.submitted_at))::date)::int as learning_days,
        count(distinct (timezone('Asia/Ho_Chi_Minh', ms.submitted_at))::date) filter (where ms.submitted_at >= ${window.start} and ms.submitted_at < ${window.end})::int as learning_days_7d,
        max(ms.submitted_at) as last_learning_at,
        count(aa.id) filter (where aa.answered_at is not null)::int as questions
      from meaningful_sessions ms
      left join attempt_answers aa on aa.session_id = ms.id and aa.user_id = ${userId}::uuid
    )
    select u.created_at as "joinedAt", l.last_learning_at as "lastLearningAt",
      coalesce(l.learning_days, 0)::int as "learningDays", coalesce(l.learning_days_7d, 0)::int as "learningDays7d",
      coalesce(l.sessions, 0)::int as sessions, coalesce(l.questions, 0)::int as questions,
      case
        when exists(select 1 from user_plan_memberships m where m.user_id = u.id and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${now} and (m.ends_at is null or m.ends_at > ${now})) then 'PREMIUM'
        when exists(select 1 from user_plan_memberships m where m.user_id = u.id and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${now} and m.ends_at <= ${now}) then 'EXPIRED'
        else 'FREE' end as "planStatus",
      g.target_score as "targetScore", g.exam_date::text as "examDate",
      g.daily_study_minutes as "dailyStudyMinutes", g.study_days_per_week as "studyDaysPerWeek"
    from users u
    cross join learning l
    left join learner_goals g on g.user_id = u.id
    where u.id = ${userId}::uuid
    limit 1
  `);
  const [summaryResult, lastActions] = await Promise.all([summaryPromise, getLastMeaningfulActions([userId])]);
  const row = summaryResult.rows[0] as RawRow | undefined;
  if (!row) return null;
  return {
    joinedAt: asDate(row.joinedAt),
    lastLearningAt: asNullableDate(row.lastLearningAt),
    learningDays: asNumber(row.learningDays),
    learningDays7d: asNumber(row.learningDays7d),
    sessions: asNumber(row.sessions),
    questions: asNumber(row.questions),
    plan: String(row.planStatus) as PlanLifecycle,
    goal: parseGoal(row),
    lastAction: lastActions.get(userId) ?? null,
  };
}

export async function getLastMeaningfulActions(userIds: readonly string[]) {
  if (!userIds.length) return new Map<string, UserActivityItem>();
  const target = targetUsersSql(userIds);
  const activity = activityUnionSql();
  const result = await db.execute(sql`
    with target_users as (${target}), activity as (${activity})
    select distinct on (user_id) user_id as "userId", activity_key as "activityKey",
      occurred_at as "occurredAt", category, action, source, summary, metadata, priority
    from activity
    order by user_id, occurred_at desc, priority desc, activity_key desc
  `);
  return new Map((result.rows as RawRow[]).map((row) => [String(row.userId), parseActivity(row)]));
}

export async function getUserActivityTimeline(userId: string, page = 1, pageSize = 30): Promise<UserActivityPage> {
  const safePage = Math.min(10_000, Math.max(1, page));
  const safeSize = Math.min(50, Math.max(1, pageSize));
  const target = targetUsersSql([userId]);
  const activity = activityUnionSql();
  const [rowsResult, countResult] = await Promise.all([
    db.execute(sql`
      with target_users as (${target}), activity as (${activity})
      select activity_key as "activityKey", occurred_at as "occurredAt", category, action, source, summary, metadata, priority
      from activity
      order by occurred_at desc, priority desc, activity_key desc
      limit ${safeSize} offset ${(safePage - 1) * safeSize}
    `),
    db.execute(sql`with target_users as (${target}), activity as (${activity}) select count(*)::int as total from activity`),
  ]);
  return {
    rows: (rowsResult.rows as RawRow[]).map(parseActivity),
    total: asNumber((countResult.rows[0] as RawRow | undefined)?.total),
    page: safePage,
    pageSize: safeSize,
  };
}
