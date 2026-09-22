import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
import {
  getAdminUserLearningSummary,
  getRetentionDiagnostics,
  getUserActivityTimeline,
  listAdminUsersWithActivity,
} from "../src/lib/admin/user-activity";

const rawUrl = process.env.DATABASE_URL ?? "";
const url = new URL(rawUrl);
assert.deepEqual(
  { host: url.hostname, port: url.port, database: url.pathname, user: url.username },
  { host: "127.0.0.1", port: "15433", database: "/toeicgym_task17", user: "toeicgym_test" },
);

const pool = new pg.Pool({ connectionString: rawUrl });
const prefix = "task27-";
const at = (day: number, hour = 3) => `2026-09-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00.000Z`;

async function createUser(label: string, createdAt = at(16)) {
  const email = `${prefix}${label}@qa.invalid`;
  const row = (await pool.query(
    `insert into users(email,email_normalized,password_hash,email_verified_at,status,created_at,updated_at)
     values($1,$1,'qa-only',$2,'active',$2,$2) returning id`,
    [email, createdAt],
  )).rows[0];
  await pool.query(
    `insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility)
     values($1,$2,'vi','both','HIDDEN')`,
    [row.id, `QA ${label.toUpperCase()}`],
  );
  return row.id as string;
}

async function ensureQuestion() {
  const setId = randomUUID();
  const questionId = randomUUID();
  const optionId = randomUUID();
  await pool.query(
    `insert into passage_sets(id,toeic_part,skill_area,set_type,title,status) values($1,5,'READING','standalone','Task 27 fixture','published')`,
    [setId],
  );
  await pool.query(
    `insert into questions(id,toeic_part,skill_area,question_type,response_type,skill,sub_skill,difficulty,question_text,status,passage_set_id,question_order)
     values($1,5,'READING','single','MULTIPLE_CHOICE','grammar','grammar','medium','Fixture question','published',$2,1)`,
    [questionId, setId],
  );
  await pool.query(
    `insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,'A','Fixture option',1)`,
    [optionId, questionId],
  );
  await pool.query(
    `insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi)
     values($1,$2,'Synthetic Task 27 fixture explanation.','Giải thích fixture tổng hợp cho Task 27.')`,
    [questionId, optionId],
  );
  return { questionId, optionId };
}

async function submitted(userId: string, submittedAt: string, source = "custom", answered = true) {
  const session = (await pool.query(
    `insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,started_at,submitted_at,score_correct,score_total)
     values($1,'READING','part_5',5,'submitted',1,1,$2,$3::timestamptz - interval '10 minutes',$3,$4,1) returning id`,
    [userId, source, submittedAt, answered ? 1 : 0],
  )).rows[0];
  await pool.query(
    `insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,1)`,
    [session.id, fixtureQuestion.questionId],
  );
  await pool.query(
    `insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at)
     values($1,$2,$3,$4,$5,$6)`,
    [session.id, userId, fixtureQuestion.questionId, answered ? fixtureQuestion.optionId : null, answered, answered ? submittedAt : null],
  );
  return session.id as string;
}

let fixtureQuestion: Awaited<ReturnType<typeof ensureQuestion>>;

try {
  await pool.query(`delete from users where email_normalized like $1`, [`${prefix}%@qa.invalid`]);
  fixtureQuestion = await ensureQuestion();

  const signupOnly = await createUser("signup-only");
  const oneDay = await createUser("one-day");
  const twoDays = await createUser("two-days");
  const threeDays = await createUser("three-days");
  const journey = await createUser("journey");
  const premium = await createUser("premium");

  await submitted(oneDay, at(22), "recommended");
  await submitted(twoDays, at(21));
  await submitted(twoDays, at(22), "recommended");
  await submitted(threeDays, at(20));
  await submitted(threeDays, at(21), "mastery_review");
  await submitted(threeDays, at(22));
  await submitted(journey, at(21), "recommended");
  await submitted(journey, at(22), "mastery_review");
  await submitted(premium, at(20), "recommended");
  await submitted(premium, at(22), "recommended");
  await submitted(signupOnly, at(22), "custom", false);

  await pool.query(
    `insert into learner_goals(user_id,target_score,exam_date,daily_study_minutes,study_days_per_week,created_at,updated_at)
     values($1,750,'2026-12-20',20,5,$2,$2)`,
    [journey, at(19)],
  );
  await pool.query(
    `insert into diagnostic_runs(user_id,status,created_at,expires_at,completed_at,blueprint_version,purpose)
     values($1,'COMPLETED',$2,$3,$3,'qa','BASELINE')`,
    [journey, at(18), at(18, 4)],
  );
  await pool.query(
    `insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at,created_at,updated_at)
     values($1,'PREMIUM','MANUAL',$2,$3,$2,$2)`,
    [premium, at(19), "2027-01-01T00:00:00.000Z"],
  );

  const now = new Date("2026-09-22T12:00:00.000Z");
  const metrics = await getRetentionDiagnostics(now);
  assert.deepEqual(
    {
      total: metrics.totalLearners,
      none: metrics.noMeaningfulLearning,
      one: metrics.oneLearningDay7d,
      two: metrics.returned2Days7d,
      three: metrics.returned3Days7d,
      workout: metrics.workoutCompleters,
      workoutReturn: metrics.workoutReturnedDifferentDay,
    },
    { total: 6, none: 1, one: 1, two: 4, three: 1, workout: 4, workoutReturn: 1 },
  );

  const list = await listAdminUsersWithActivity({ search: prefix, sort: "learning_recent", page: 1 }, 20);
  assert.equal(list.total, 6);
  const journeyRow = list.rows.find((row) => row.id === journey);
  assert.deepEqual(
    { days: journeyRow?.learningDays, sessions: journeyRow?.sessions, questions: journeyRow?.questions, goal: journeyRow?.goal?.targetScore },
    { days: 2, sessions: 2, questions: 2, goal: 750 },
  );

  const summary = await getAdminUserLearningSummary(journey, now);
  assert.deepEqual(
    { days: summary?.learningDays, days7: summary?.learningDays7d, sessions: summary?.sessions, questions: summary?.questions, plan: summary?.plan },
    { days: 2, days7: 2, sessions: 2, questions: 2, plan: "FREE" },
  );

  const timeline = await getUserActivityTimeline(journey, 1, 3);
  assert.equal(timeline.pageSize, 3);
  assert.ok(timeline.total >= 7);
  assert.deepEqual(timeline.rows.map((row) => row.action), ["REVIEW_COMPLETED", "REVIEW_STARTED", "WORKOUT_COMPLETED"]);
  assert.ok(timeline.rows.every((row) => !("passwordHash" in row.metadata) && !("questionText" in row.metadata)));

  const boundaryUser = await createUser("boundary");
  await submitted(boundaryUser, "2026-09-21T16:59:59.000Z");
  await submitted(boundaryUser, "2026-09-21T17:00:00.000Z");
  const boundarySummary = await getAdminUserLearningSummary(boundaryUser, now);
  assert.equal(boundarySummary?.learningDays, 2);

  const admin = await createUser("admin");
  await pool.query(`insert into user_roles(user_id,role,created_by) values($1,'ADMIN',$1)`, [admin]);

  const version = (await pool.query("show server_version")).rows[0].server_version as string;
  console.log("TASK27_POSTGRES_INTEGRATION_PASS", JSON.stringify({ version, users: 6, timezoneBoundary: true, timeline: true, retention: true }));
} finally {
  await pool.end();
}
