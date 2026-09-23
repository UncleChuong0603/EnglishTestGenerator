module.exports=[48501,a=>{"use strict";var b=a.i(4415);function c(a=new Date){let d=(0,b.getDailyUsageWindow)(a);return{start:new Date(d.start.getTime()-5184e5),end:d.resetAt}}a.i(66710);let d={ACCOUNT:{vi:"Tài khoản",en:"Account"},GOAL:{vi:"Mục tiêu",en:"Goal"},DIAGNOSTIC:{vi:"Chẩn đoán",en:"Diagnostic"},PRACTICE:{vi:"Luyện tập",en:"Practice"},WORKOUT:{vi:"Bài hôm nay",en:"Workout"},REVIEW:{vi:"Ôn câu sai",en:"Review"},MOCK:{vi:"Thi thử",en:"Mock"},PREMIUM:{vi:"Premium",en:"Premium"},PRODUCT:{vi:"Sản phẩm",en:"Product"}},e={ACCOUNT_CREATED:{vi:"Tạo tài khoản",en:"Account created"},ACCOUNT_VERIFIED:{vi:"Xác minh email",en:"Email verified"},ACCOUNT_ACTIVATED:{vi:"Kích hoạt tài khoản",en:"Account activated"},ACCOUNT_SUSPENDED:{vi:"Tạm khóa tài khoản",en:"Account suspended"},ACCOUNT_REACTIVATED:{vi:"Mở khóa tài khoản",en:"Account reactivated"},ADMIN_ROLE_GRANTED:{vi:"Cấp quyền Admin",en:"Admin role granted"},ADMIN_ROLE_REVOKED:{vi:"Thu hồi quyền Admin",en:"Admin role revoked"},PASSWORD_UPDATED:{vi:"Cập nhật mật khẩu",en:"Password updated"},GOOGLE_LINKED:{vi:"Liên kết Google",en:"Google linked"},SESSION_REVOKED:{vi:"Thu hồi phiên đăng nhập",en:"Session revoked"},SIGNED_IN:{vi:"Đăng nhập",en:"Signed in"},GOAL_CONFIGURED:{vi:"Thiết lập mục tiêu",en:"Goal configured"},DIAGNOSTIC_STARTED:{vi:"Bắt đầu chẩn đoán",en:"Diagnostic started"},DIAGNOSTIC_COMPLETED:{vi:"Hoàn thành chẩn đoán",en:"Diagnostic completed"},PRACTICE_STARTED:{vi:"Bắt đầu luyện tập",en:"Practice started"},PRACTICE_COMPLETED:{vi:"Hoàn thành luyện tập",en:"Practice completed"},WORKOUT_STARTED:{vi:"Bắt đầu bài hôm nay",en:"Workout started"},WORKOUT_COMPLETED:{vi:"Hoàn thành bài hôm nay",en:"Workout completed"},REVIEW_STARTED:{vi:"Bắt đầu ôn câu sai",en:"Mistake review started"},REVIEW_COMPLETED:{vi:"Hoàn thành ôn câu sai",en:"Mistake review completed"},MOCK_STARTED:{vi:"Bắt đầu thi thử",en:"Mock started"},MOCK_COMPLETED:{vi:"Hoàn thành thi thử",en:"Mock completed"},TRY_VIEWED:{vi:"Mở bài thử",en:"Opened Try"},PRICING_VIEWED:{vi:"Xem bảng giá",en:"Pricing viewed"},CHECKOUT_STARTED:{vi:"Bắt đầu thanh toán",en:"Checkout started"},PREMIUM_ACTIVATED:{vi:"Kích hoạt Premium",en:"Premium activated"},PREMIUM_REVOKED:{vi:"Thu hồi Premium",en:"Premium revoked"}},f={NO_LEARNING_YET:{vi:"Chưa học",en:"No learning yet"},ONE_DAY_LEARNER:{vi:"Học 1 ngày",en:"One-day learner"},RETURNING_LEARNER:{vi:"Đã quay lại học",en:"Returning learner"},INACTIVE:{vi:"Chưa học trong 7 ngày",en:"No learning in 7 days"}},g=new Set(["part","questionCount","correctCount","totalCount","accuracy","targetScore","dailyStudyMinutes","studyDaysPerWeek"]),h=new Set(["skillArea","practiceSource","examDate","diagnosticPurpose","mockMode","planSource","orderStatus","route"]);b.PRODUCT_TIME_ZONE,a.s(["getLearnerActivityState",0,function(a){return a.learningDays&&a.lastLearningAt?a.lastLearningAt<c(a.now).start?"INACTIVE":1===a.learningDays?"ONE_DAY_LEARNER":"RETURNING_LEARNER":"NO_LEARNING_YET"},"getRetentionProductWindow",0,c,"learnerActivityStateLabel",0,function(a,b){return f[a][b?"vi":"en"]},"safeUserActivityMetadata",0,function(a){if(!a||"object"!=typeof a||Array.isArray(a))return{};let b={};for(let[c,d]of Object.entries(a))g.has(c)&&"number"==typeof d&&Number.isFinite(d)&&(b[c]=d),h.has(c)&&"string"==typeof d&&d.length<=160&&(b[c]=d);return b},"userActivityActionLabel",0,function(a,b){return e[a][b?"vi":"en"]},"userActivityCategoryLabel",0,function(a,b){return d[a][b?"vi":"en"]}])},35059,a=>a.a(async(b,c)=>{try{var d=a.i(51674),e=a.i(94758),f=a.i(14422),g=a.i(48501),h=b([e]);[e]=h.then?(await h)():h;let r=a=>a instanceof Date?a:new Date(String(a)),s=a=>null==a?null:r(a),t=a=>null==a?null:Number(a),u=a=>"string"==typeof a?a:null;function i(a){let b;return{key:String(a.activityKey),occurredAt:r(a.occurredAt),category:String(a.category),action:String(a.action),source:String(a.source),summary:u(a.summary),metadata:(0,g.safeUserActivityMetadata)(a.metadata),priority:(b=a.priority,Number(b??0))}}function j(a){let b=d.sql.join(a.map(a=>d.sql`(${a}::uuid)`),d.sql`, `);return d.sql`select user_id from (values ${b}) as selected(user_id)`}function k(){let a=(0,f.meaningfulLearningSessionSql)("ps");return d.sql`
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
    where ${a}

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
  `}function l(a){return null===a.targetScore&&null===a.examDate&&null===a.dailyStudyMinutes&&null===a.studyDaysPerWeek?null:{targetScore:t(a.targetScore),examDate:u(a.examDate),dailyStudyMinutes:t(a.dailyStudyMinutes),studyDaysPerWeek:t(a.studyDaysPerWeek)}}async function m(a,b=20){var c;let g,h,i=Math.min(1e5,Math.max(1,a.page??1)),j=new Date,k=(g=(0,f.meaningfulLearningSessionSql)("ps"),d.sql`
    meaningful_sessions as (
      select ps.id, ps.user_id, ps.submitted_at
      from practice_sessions ps
      where ${g}
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
          when exists(select 1 from user_plan_memberships m where m.user_id = u.id and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${j} and (m.ends_at is null or m.ends_at > ${j})) then 'PREMIUM'
          when exists(select 1 from user_plan_memberships m where m.user_id = u.id and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${j} and m.ends_at <= ${j}) then 'EXPIRED'
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
  `),n=function(a,b){let c=[],e=a.search?.trim().toLowerCase().slice(0,200);if(e){let a=`%${e}%`;c.push(d.sql`(email_normalized ilike ${a} or full_name ilike ${a})`)}return["active","disabled","pending_verification"].includes(a.status??"")&&c.push(d.sql`status = ${a.status}`),"premium"===a.plan&&c.push(d.sql`plan_status = 'PREMIUM'`),"free"===a.plan&&c.push(d.sql`plan_status = 'FREE'`),"expired"===a.plan&&c.push(d.sql`plan_status = 'EXPIRED'`),"admin"===a.role&&c.push(d.sql`is_admin`),"learner"===a.role&&c.push(d.sql`not is_admin`),"yes"===a.verified&&c.push(d.sql`email_verified_at is not null`),"no"===a.verified&&c.push(d.sql`email_verified_at is null`),"recent"===a.activity&&c.push(d.sql`last_login_at >= ${new Date(b.getTime()-2592e6)}`),"never"===a.activity&&c.push(d.sql`last_login_at is null`),"none"===a.learning&&c.push(d.sql`learning_days = 0`),"one"===a.learning&&c.push(d.sql`learning_days = 1`),"returning"===a.learning&&c.push(d.sql`learning_days >= 2`),"habit"===a.learning&&c.push(d.sql`learning_days >= 3`),c.length?d.sql`where ${d.sql.join(c,d.sql` and `)}`:d.sql``}(a,j),o=(c=a.sort,"created_asc"===c?d.sql`created_at asc, id asc`:"learning_recent"===c?d.sql`last_learning_at desc nulls last, id asc`:"learning_oldest"===c?d.sql`last_learning_at asc nulls first, id asc`:"login"===c?d.sql`last_login_at desc nulls last, id asc`:"identity"===c?d.sql`email_normalized asc, id asc`:d.sql`created_at desc, id asc`),[q,t]=await Promise.all([e.db.execute(d.sql`
      with ${k}
      select id, email, full_name as "fullName", status,
        email_verified_at as "emailVerifiedAt", created_at as "createdAt", last_login_at as "lastLoginAt",
        is_admin as "isAdmin", plan_status as "planStatus", learning_days as "learningDays",
        sessions, questions, last_learning_at as "lastLearningAt", target_score as "targetScore",
        exam_date::text as "examDate", daily_study_minutes as "dailyStudyMinutes", study_days_per_week as "studyDaysPerWeek"
      from base_users
      ${n}
      order by ${o}
      limit ${b} offset ${(i-1)*b}
    `),e.db.execute(d.sql`with ${k} select count(*)::int as total from base_users ${n}`)]),v=q.rows,w=await p(v.map(a=>String(a.id)));return{rows:v.map(a=>{let b,c,d;return{id:String(a.id),email:String(a.email),name:u(a.fullName),status:String(a.status),emailVerifiedAt:s(a.emailVerifiedAt),createdAt:r(a.createdAt),lastLoginAt:s(a.lastLoginAt),admin:!!a.isAdmin,plan:String(a.planStatus),learningDays:(b=a.learningDays,Number(b??0)),sessions:(c=a.sessions,Number(c??0)),questions:(d=a.questions,Number(d??0)),lastLearningAt:s(a.lastLearningAt),goal:l(a),lastAction:w.get(String(a.id))??null}}),total:(h=t.rows[0]?.total,Number(h??0)),page:i,pageSize:b}}async function n(a=new Date){let b,c,h,i,j,k,l,m,o,p=(0,g.getRetentionProductWindow)(a),q=(0,f.meaningfulLearningSessionSql)("ps"),r=(await e.db.execute(d.sql`
    with learner_users as (
      select u.id, u.created_at
      from users u
      where not exists(select 1 from user_roles r where r.user_id = u.id and r.role = 'ADMIN' and r.revoked_at is null)
    ),
    meaningful_sessions as (
      select ps.id, ps.user_id, ps.submitted_at, ps.source
      from practice_sessions ps
      inner join learner_users u on u.id = ps.user_id
      where ${q}
    ),
    lifetime as (
      select user_id, count(*)::int as sessions
      from meaningful_sessions
      group by user_id
    ),
    window_days as (
      select user_id, count(distinct (timezone('Asia/Ho_Chi_Minh', submitted_at))::date)::int as learning_days
      from meaningful_sessions
      where submitted_at >= ${p.start} and submitted_at < ${p.end}
      group by user_id
    ),
    workout_days as (
      select user_id, count(distinct (timezone('Asia/Ho_Chi_Minh', submitted_at))::date)::int as learning_days
      from meaningful_sessions
      where source = 'recommended'
      group by user_id
    )
    select count(*)::int as "totalLearners",
      count(*) filter (where u.created_at >= ${p.start} and u.created_at < ${p.end})::int as "signups7d",
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
  `)).rows[0];return{totalLearners:(b=r.totalLearners,Number(b??0)),signups7d:(c=r.signups7d,Number(c??0)),activated:(h=r.activated,Number(h??0)),oneLearningDay7d:(i=r.oneLearningDay7d,Number(i??0)),returned2Days7d:(j=r.returned2Days7d,Number(j??0)),returned3Days7d:(k=r.returned3Days7d,Number(k??0)),noMeaningfulLearning:(l=r.noMeaningfulLearning,Number(l??0)),workoutCompleters:(m=r.workoutCompleters,Number(m??0)),workoutReturnedDifferentDay:(o=r.workoutReturnedDifferentDay,Number(o??0)),windowStart:p.start,windowEnd:p.end}}async function o(a,b=new Date){let c,h,i,j,k=(0,g.getRetentionProductWindow)(b),m=(0,f.meaningfulLearningSessionSql)("ps"),n=e.db.execute(d.sql`
    with meaningful_sessions as (
      select ps.id, ps.submitted_at
      from practice_sessions ps
      where ps.user_id = ${a}::uuid and ${m}
    ),
    learning as (
      select count(distinct ms.id)::int as sessions,
        count(distinct (timezone('Asia/Ho_Chi_Minh', ms.submitted_at))::date)::int as learning_days,
        count(distinct (timezone('Asia/Ho_Chi_Minh', ms.submitted_at))::date) filter (where ms.submitted_at >= ${k.start} and ms.submitted_at < ${k.end})::int as learning_days_7d,
        max(ms.submitted_at) as last_learning_at,
        count(aa.id) filter (where aa.answered_at is not null)::int as questions
      from meaningful_sessions ms
      left join attempt_answers aa on aa.session_id = ms.id and aa.user_id = ${a}::uuid
    )
    select u.created_at as "joinedAt", l.last_learning_at as "lastLearningAt",
      coalesce(l.learning_days, 0)::int as "learningDays", coalesce(l.learning_days_7d, 0)::int as "learningDays7d",
      coalesce(l.sessions, 0)::int as sessions, coalesce(l.questions, 0)::int as questions,
      case
        when exists(select 1 from user_plan_memberships m where m.user_id = u.id and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${b} and (m.ends_at is null or m.ends_at > ${b})) then 'PREMIUM'
        when exists(select 1 from user_plan_memberships m where m.user_id = u.id and m.plan_key = 'PREMIUM' and m.revoked_at is null and m.starts_at <= ${b} and m.ends_at <= ${b}) then 'EXPIRED'
        else 'FREE' end as "planStatus",
      g.target_score as "targetScore", g.exam_date::text as "examDate",
      g.daily_study_minutes as "dailyStudyMinutes", g.study_days_per_week as "studyDaysPerWeek"
    from users u
    cross join learning l
    left join learner_goals g on g.user_id = u.id
    where u.id = ${a}::uuid
    limit 1
  `),[q,t]=await Promise.all([n,p([a])]),u=q.rows[0];return u?{joinedAt:r(u.joinedAt),lastLearningAt:s(u.lastLearningAt),learningDays:(c=u.learningDays,Number(c??0)),learningDays7d:(h=u.learningDays7d,Number(h??0)),sessions:(i=u.sessions,Number(i??0)),questions:(j=u.questions,Number(j??0)),plan:String(u.planStatus),goal:l(u),lastAction:t.get(a)??null}:null}async function p(a){if(!a.length)return new Map;let b=j(a),c=k(),f=await e.db.execute(d.sql`
    with target_users as (${b}), activity as (${c})
    select distinct on (user_id) user_id as "userId", activity_key as "activityKey",
      occurred_at as "occurredAt", category, action, source, summary, metadata, priority
    from activity
    order by user_id, occurred_at desc, priority desc, activity_key desc
  `);return new Map(f.rows.map(a=>[String(a.userId),i(a)]))}async function q(a,b=1,c=30){let f,g=Math.min(1e4,Math.max(1,b)),h=Math.min(50,Math.max(1,c)),l=j([a]),m=k(),[n,o]=await Promise.all([e.db.execute(d.sql`
      with target_users as (${l}), activity as (${m})
      select activity_key as "activityKey", occurred_at as "occurredAt", category, action, source, summary, metadata, priority
      from activity
      order by occurred_at desc, priority desc, activity_key desc
      limit ${h} offset ${(g-1)*h}
    `),e.db.execute(d.sql`with target_users as (${l}), activity as (${m}) select count(*)::int as total from activity`)]);return{rows:n.rows.map(i),total:(f=o.rows[0]?.total,Number(f??0)),page:g,pageSize:h}}a.s(["getAdminUserLearningSummary",0,o,"getRetentionDiagnostics",0,n,"getUserActivityTimeline",0,q,"listAdminUsersWithActivity",0,m]),c()}catch(a){c(a)}},!1)];

//# sourceMappingURL=src_lib_admin_0stbzhq._.js.map