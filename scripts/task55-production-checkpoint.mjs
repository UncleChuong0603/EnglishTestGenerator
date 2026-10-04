// Read-only, aggregate-only Task 55 production checkpoint. Run from the Dokploy
// checkout using the Dokploy container's Node runtime. Never emit learner IDs,
// email addresses, event properties, free text, tokens or environment values.
import { execFileSync } from "node:child_process";

const project = "toeic-gym-frontend-bhwkds";
const child = String.raw`
const { Client } = require("pg");
const client = new Client({ connectionString: process.env.DATABASE_URL });
let stage = "startup";
const query = async (text) => (await client.query(text)).rows;
const one = async (text) => (await client.query(text)).rows[0];
const eligible = "with eligible_users as (select u.id,u.created_at,u.email_verified_at from users u where u.deleted_at is null and u.email_normalized not like '%@qa.invalid' and u.email_normalized not like '%@example.invalid' and u.email_normalized not like '%@isolated.test' and not exists (select 1 from user_roles r where r.user_id=u.id and r.role='ADMIN' and r.revoked_at is null))";
const meaningful = eligible + ", meaningful as (select ps.id,ps.user_id,ps.source,ps.submitted_at,(ps.submitted_at at time zone 'Asia/Ho_Chi_Minh')::date local_day from practice_sessions ps join eligible_users u on u.id=ps.user_id where ps.status='submitted' and ps.submitted_at is not null and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type<>'demo_test' and exists(select 1 from attempt_answers aa where aa.session_id=ps.id and aa.user_id=ps.user_id and aa.answered_at is not null))";
(async () => {
  stage = "connect";
  await client.connect();
  await client.query("BEGIN READ ONLY");

  stage = "exclusions";
  const exclusions = await one("select count(*) filter (where deleted_at is not null)::int deleted, count(*) filter (where email_normalized like '%@qa.invalid' or email_normalized like '%@example.invalid' or email_normalized like '%@isolated.test')::int qa, count(*) filter (where exists(select 1 from user_roles r where r.user_id=users.id and r.role='ADMIN' and r.revoked_at is null))::int admins from users");
  stage = "baseline";
  const baseline = await one(meaningful + ", per_user as (select u.id,u.created_at,u.email_verified_at,count(distinct m.local_day)::int learning_days,min(m.submitted_at) first_learning_at from eligible_users u left join meaningful m on m.user_id=u.id group by u.id,u.created_at,u.email_verified_at) select count(*)::int registered,count(*) filter(where email_verified_at is not null)::int verified,count(*) filter(where learning_days>0)::int activated,coalesce(sum(learning_days),0)::int meaningful_learning_days,count(*) filter(where created_at<=now()-interval '2 days')::int mature_2d,count(*) filter(where created_at<=now()-interval '2 days' and learning_days>=2)::int returned_2plus,count(*) filter(where created_at<=now()-interval '3 days')::int mature_3d,count(*) filter(where created_at<=now()-interval '3 days' and learning_days>=3)::int returned_3plus,count(*) filter(where learning_days=1)::int exactly_one_day from per_user");

  stage = "learning";
  const learning = await one(meaningful + " select count(*) filter(where source='recommended')::int workout_completed,count(distinct user_id) filter(where source='recommended')::int workout_users,count(*) filter(where source='mastery_review')::int mistake_review_completed,count(distinct user_id) filter(where source='mastery_review')::int mistake_review_users,count(*)::int meaningful_sessions,count(distinct user_id)::int meaningful_users from meaningful");
  const weeklyPlan = await one(eligible + " select count(*)::int snapshots,count(distinct w.user_id)::int users from weekly_plan_snapshots w join eligible_users u on u.id=w.user_id");

  stage = "loop";
  const loop = await one(eligible + ", wrong as (select aa.user_id,aa.session_id,aa.question_id from attempt_answers aa join eligible_users u on u.id=aa.user_id join practice_sessions ps on ps.id=aa.session_id and ps.user_id=aa.user_id where aa.is_correct=false and aa.answered_at is not null and ps.status='submitted'), classified as (select distinct w.user_id,w.session_id,w.question_id from wrong w join mistake_reason_classifications c on c.user_id=w.user_id and c.session_id=w.session_id and c.question_id=w.question_id), remediation as (select distinct w.user_id,w.session_id,w.question_id,r.session_id remediation_session_id from wrong w join remediation_session_contexts r on r.user_id=w.user_id and r.source_session_id=w.session_id and r.source_question_id=w.question_id), completed as (select distinct r.user_id,r.session_id,r.question_id from remediation r join practice_sessions ps on ps.id=r.remediation_session_id where ps.status='submitted'), mastered as (select distinct r.user_id,r.session_id,r.question_id from remediation r join question_mastery qm on qm.user_id=r.user_id and qm.question_id=r.question_id and qm.status='MASTERED') select (select count(*)::int from wrong) wrong,(select count(*)::int from classified) reason_captured,(select count(*)::int from remediation) remediation_started,(select count(*)::int from completed) drill_completed,(select count(*)::int from mastered) mastered_after_remediation,(select count(distinct user_id)::int from wrong) wrong_users");

  stage = "features";
  const features = await query(eligible + " select * from (select 'TODAYS_WORKOUT' feature,count(distinct ps.user_id)::int users,count(*)::int uses from practice_sessions ps join eligible_users u on u.id=ps.user_id where ps.source='recommended' and ps.status='submitted' union all select 'WEEKLY_PLAN',count(distinct w.user_id)::int,count(*)::int from weekly_plan_snapshots w join eligible_users u on u.id=w.user_id union all select 'MISTAKE_BANK',count(distinct q.user_id)::int,count(*)::int from question_mastery q join eligible_users u on u.id=q.user_id union all select 'MISTAKE_REASON',count(distinct c.user_id)::int,count(*)::int from mistake_reason_classifications c join eligible_users u on u.id=c.user_id union all select 'REMEDIATION',count(distinct r.user_id)::int,count(*)::int from remediation_session_contexts r join eligible_users u on u.id=r.user_id union all select 'VOCAB_SRS',count(distinct v.user_id)::int,coalesce(sum(v.review_count),0)::int from user_vocabulary v join eligible_users u on u.id=v.user_id union all select 'DICTATION',count(distinct d.user_id)::int,count(*)::int from dictation_sessions d join eligible_users u on u.id=d.user_id union all select 'DIAGNOSTIC',count(distinct d.user_id)::int,count(*)::int from diagnostic_runs d join eligible_users u on u.id=d.user_id where d.status='COMPLETED' union all select 'FULL_MOCK',count(distinct f.user_id)::int,count(*)::int from full_mock_runs f join eligible_users u on u.id=f.user_id where f.status='COMPLETED' union all select 'RANKED_CHALLENGE',count(distinct r.user_id)::int,count(*)::int from ranked_challenge_runs r join eligible_users u on u.id=r.user_id where r.status='COMPLETED') x order by feature");

  stage = "skill_tools";
  const vocabulary = await one(eligible + " select count(*)::int cards,count(distinct v.user_id)::int savers,count(*) filter(where v.review_count>0)::int reviewed_cards,count(distinct v.user_id) filter(where v.review_count>0)::int reviewers,coalesce(sum(v.review_count),0)::int reviews from user_vocabulary v join eligible_users u on u.id=v.user_id");
  const dictation = await one(eligible + " select count(*)::int sessions,count(distinct d.user_id)::int users,count(*) filter(where d.status='MASTERED')::int mastered,count(*) filter(where d.hint_used)::int hint_used,coalesce(sum(d.attempts_count),0)::int attempts from dictation_sessions d join eligible_users u on u.id=d.user_id");

  stage = "monetization";
  const monetization = await one(eligible + ", meaningful_users as (select distinct ps.user_id from practice_sessions ps join eligible_users u on u.id=ps.user_id where ps.status='submitted' and ps.submitted_at is not null and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type<>'demo_test' and exists(select 1 from attempt_answers aa where aa.session_id=ps.id and aa.user_id=ps.user_id and aa.answered_at is not null)), trial_users as (select distinct m.user_id,m.starts_at,m.ends_at,m.revoked_at from user_plan_memberships m join eligible_users u on u.id=m.user_id where m.source='TRIAL'), paid_users as (select distinct m.user_id,m.source,m.starts_at,m.ends_at,m.revoked_at from user_plan_memberships m join eligible_users u on u.id=m.user_id where m.source in ('PAYOS','APPLE_IAP','GOOGLE_PLAY')), expired as (select distinct m.user_id,coalesce(m.ends_at,m.revoked_at) ended_at from user_plan_memberships m join eligible_users u on u.id=m.user_id where (m.ends_at<=now() or m.revoked_at is not null)) select (select count(distinct e.user_id)::int from product_events e join eligible_users u on u.id=e.user_id where e.event_name='trial_eligible') trial_eligible,(select count(distinct user_id)::int from trial_users) trial_started,(select count(distinct user_id)::int from trial_users where ends_at<=now() or revoked_at is not null) trial_expired,(select count(distinct t.user_id)::int from trial_users t join paid_users p on p.user_id=t.user_id and p.starts_at>=t.starts_at) trial_to_paid,(select count(distinct user_id)::int from paid_users) paid_lifetime,(select count(distinct user_id)::int from paid_users where revoked_at is null and starts_at<=now() and (ends_at is null or ends_at>now())) paid_active,(select count(distinct m.user_id)::int from user_plan_memberships m join eligible_users u on u.id=m.user_id where m.source in ('PROMOTION','ADMIN') and m.revoked_at is null and m.starts_at<=now() and (m.ends_at is null or m.ends_at>now())) granted_active,(select count(*)::int from eligible_users u where exists(select 1 from meaningful_users m where m.user_id=u.id) and not exists(select 1 from user_plan_memberships p where p.user_id=u.id and p.revoked_at is null and p.starts_at<=now() and (p.ends_at is null or p.ends_at>now()))) useful_free_users,(select count(distinct e.user_id)::int from expired e join practice_sessions ps on ps.user_id=e.user_id and ps.status='submitted' and ps.submitted_at>e.ended_at) returned_after_expiry");
  const payments = await query("select provider,status,count(*)::int orders from payment_orders group by provider,status order by provider,status");
  const stores = await query("select provider,environment,status,count(*)::int purchases from store_purchases group by provider,environment,status order by provider,environment,status");

  stage = "acquisition_events";
  const eventCounts = await query(eligible + ", filtered as (select e.* from product_events e left join eligible_users u on u.id=e.user_id where e.user_id is null or u.id is not null) select event_name,count(*)::int lifetime,count(*) filter(where occurred_at>=now()-interval '30 days')::int last_30d from filtered group by event_name order by event_name");
  stage = "challenge";
  const challenge = await one(eligible + ", filtered as (select e.* from product_events e left join eligible_users u on u.id=e.user_id where e.user_id is null or u.id is not null), views as (select case when user_id is not null then 'u:'||user_id::text else 'g:'||guest_reference end actor,min(occurred_at) at from filtered where event_name='challenge_viewed' and (user_id is not null or guest_reference is not null) group by 1), starts as (select distinct v.actor,e.session_id,e.occurred_at at from views v join filtered e on e.event_name='challenge_started' and (case when e.user_id is not null then 'u:'||e.user_id::text else 'g:'||e.guest_reference end)=v.actor and e.occurred_at>=v.at and e.session_id is not null), completions as (select distinct s.actor,s.session_id,e.occurred_at at from starts s join filtered e on e.event_name='challenge_completed' and e.session_id=s.session_id and e.occurred_at>=s.at), signups as (select distinct c.actor,e.user_id,e.occurred_at at from completions c join filtered e on e.event_name='signup_after_challenge' and e.session_id=c.session_id and e.user_id is not null and e.occurred_at>=c.at), workouts as (select distinct s.user_id from signups s join filtered e on e.event_name='first_authenticated_workout_after_challenge' and e.user_id=s.user_id and e.occurred_at>=s.at), second_days as (select s.user_id from signups s join practice_sessions ps on ps.user_id=s.user_id and ps.status='submitted' and ps.submitted_at>=s.at and ps.source not in ('diagnostic','full_mock','ranked_challenge') and ps.practice_type<>'demo_test' group by s.user_id having count(distinct (ps.submitted_at at time zone 'Asia/Ho_Chi_Minh')::date)>=2) select (select count(*)::int from views) viewed,(select count(distinct actor)::int from starts) started,(select count(distinct actor)::int from completions) completed,(select count(distinct user_id)::int from signups) signup,(select count(*)::int from workouts) first_workout,(select count(*)::int from second_days) second_learning_day");
  const acquisition = await query(eligible + " select c.acquisition_source source,count(*)::int learners from learner_contexts c join eligible_users u on u.id=c.user_id where c.acquisition_source is not null group by c.acquisition_source order by c.acquisition_source");

  stage = "mobile";
  const mobile = await one(eligible + " select (select count(*)::int from mobile_push_devices d join eligible_users u on u.id=d.user_id) devices,(select count(distinct d.user_id)::int from mobile_push_devices d join eligible_users u on u.id=d.user_id) device_users,(select count(*)::int from mobile_push_devices d join eligible_users u on u.id=d.user_id where d.platform='android') android_devices,(select count(*)::int from mobile_push_devices d join eligible_users u on u.id=d.user_id where d.platform='ios') ios_devices,(select count(*)::int from mobile_notification_preferences p join eligible_users u on u.id=p.user_id where p.enabled) push_opt_in_users,(select count(*)::int from mobile_push_deliveries d join eligible_users u on u.id=d.user_id) push_deliveries,(select count(*)::int from mobile_push_deliveries d join eligible_users u on u.id=d.user_id where d.status='DELIVERED') delivered,(select count(*)::int from mobile_push_deliveries d join eligible_users u on u.id=d.user_id where d.status='FAILED') failed");

  stage = "quality";
  const reports = await query("select status,reason,count(*)::int reports from question_reports group by status,reason order by status,reason");
  const issueReports = await query("select source,issue_type,status,count(*)::int reports from question_issue_reports group by source,issue_type,status order by source,issue_type,status");
  const duplicateScans = await one("select count(*)::int parts_scanned,coalesce(sum(scanned_count),0)::int groups_scanned,coalesce(sum(detected_count),0)::int duplicates_detected,max(scanned_at) last_scanned_at from question_duplicate_scans");
  const media = await query("select kind,status,count(*)::int assets from media_assets group by kind,status order by kind,status");
  const support = await query("select category,status,count(*)::int tickets from support_tickets group by category,status order by category,status");

  const runtimeConfig = {
    payos: process.env.PAYMENT_PROVIDER === "PAYOS" && Boolean(process.env.PAYOS_CLIENT_ID && process.env.PAYOS_API_KEY && process.env.PAYOS_CHECKSUM_KEY),
    appleStore: Boolean(process.env.APPLE_BUNDLE_ID && process.env.APPLE_APP_ID && process.env.APPLE_ROOT_CA_B64 && process.env.APPLE_IAP_PRODUCT_IDS),
    googlePlay: Boolean(process.env.GOOGLE_PLAY_PACKAGE_NAME && process.env.GOOGLE_PLAY_PRODUCT_IDS && process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON_B64),
    expoPush: Boolean(process.env.EXPO_PUSH_ACCESS_TOKEN),
  };
  console.log(JSON.stringify({ generatedAt: new Date().toISOString(), thresholds: { minimumDecisionCohort: 20, maturity2Days: 2, maturity3Days: 3 }, exclusions, baseline, learning, weeklyPlan, loop, features, vocabulary, dictation, monetization, payments, stores, eventCounts, challenge, acquisition, mobile, reports, issueReports, duplicateScans, media, support, runtimeConfig }));
  await client.query("ROLLBACK");
  await client.end();
})().catch((error) => {
  const code = typeof error?.code === "string" && /^[A-Z0-9]+$/.test(error.code) ? error.code : "unknown";
  console.log(JSON.stringify({ auditFailed: true, stage, errorCode: code }));
  process.exit(1);
});
`;

try {
  const runInsideApp = process.env.TASK55_INSIDE_APP === "1";
  const command = runInsideApp ? process.execPath : "docker";
  const args = runInsideApp
    ? ["-e", child]
    : ["exec", `${project}-app-1`, "node", "-e", child];
  const output = execFileSync(command, args, {
    encoding: "utf8",
    timeout: 60_000,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  const result = JSON.parse(output);
  console.log(JSON.stringify(result, null, 2));
  if (result.auditFailed) process.exitCode = 1;
} catch (error) {
  const safeOutput = typeof error?.stdout === "string" ? error.stdout.trim() : "";
  try {
    const result = JSON.parse(safeOutput);
    console.log(JSON.stringify(result, null, 2));
  } catch {
    console.log(JSON.stringify({ auditFailed: true }));
  }
  process.exitCode = 1;
}
