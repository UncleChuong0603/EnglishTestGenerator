import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { expect, test, type Browser, type Page } from "@playwright/test";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL ?? "";
const url = new URL(databaseUrl);
if (
  url.hostname !== "127.0.0.1" ||
  url.port !== "15441" ||
  url.pathname !== "/toeicgym_task41" ||
  url.username !== "toeicgym_test"
) {
  throw new Error("Task 41 Playwright requires its isolated PostgreSQL 17 database.");
}
const sessionSecret = process.env.SESSION_SECRET ?? "";
if (sessionSecret.length < 32) throw new Error("Task 41 Playwright requires SESSION_SECRET.");
const pool = new pg.Pool({ connectionString: databaseUrl });

type Learner = { userId: string; token: string; sessionId: string };
const learners: Record<string, Learner> = {};
const questions: Record<string, { id: string; correctOptionId: string; wrongOptionId: string }> = {};

async function createQuestion(label: string, text: string, correctText: string) {
  const id = randomUUID();
  const optionIds = Array.from({ length: 4 }, () => randomUUID());
  await pool.query(
    "insert into questions(id,toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,status,question_order,bank_pool) values($1,5,'READING','standalone','grammar','verb_tense','medium',$2,'published',1,'PRACTICE')",
    [id, text],
  );
  const options = ["complete", correctText, "completing", "completion"];
  for (const [index, option] of options.entries()) {
    await pool.query(
      "insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,$3,$4,$5)",
      [optionIds[index], id, String.fromCharCode(65 + index), option, index + 1],
    );
  }
  await pool.query(
    "insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi) values($1,$2,$3,$4)",
    [id, optionIds[1], `${label}: the time marker determines the verb tense.`, `${label}: dấu hiệu thời gian quyết định thì của động từ.`],
  );
  questions[label] = { id, correctOptionId: optionIds[1], wrongOptionId: optionIds[0] };
}

async function createUser(label: string, lifecycle: "FREE" | "PREMIUM" | "TRIAL" | "EXPIRED") {
  const email = `task41-${label}@qa.invalid`;
  const user = (
    await pool.query<{ id: string }>(
      "insert into users(email,email_normalized,email_verified_at,status) values($1,$1,now(),'active') returning id",
      [email],
    )
  ).rows[0];
  await pool.query(
    "insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility) values($1,$2,'vi','both','HIDDEN')",
    [user.id, `Task 41 ${label}`],
  );
  if (lifecycle !== "FREE") {
    const active = lifecycle !== "EXPIRED";
    await pool.query(
      "insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM',$2,now()-interval '2 days',now()+$3::interval)",
      [user.id, lifecycle === "TRIAL" ? "TRIAL" : "ADMIN", active ? "2 days" : "-1 day"],
    );
  }
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", sessionSecret).update(token).digest("hex");
  await pool.query(
    "insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 day')",
    [user.id, hash],
  );
  return { userId: user.id, token };
}

async function createSubmittedAnswer(userId: string, questionId: string, selectedOptionId: string, isCorrect: boolean) {
  const session = (
    await pool.query<{ id: string }>(
      "insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total) values($1,'READING','part_5',5,'submitted',1,1,'custom',now(),$2,1) returning id",
      [userId, isCorrect ? 1 : 0],
    )
  ).rows[0];
  await pool.query(
    "insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,1)",
    [session.id, questionId],
  );
  await pool.query(
    "insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,$5,now())",
    [session.id, userId, questionId, selectedOptionId, isCorrect],
  );
  return session.id;
}

async function browserPage(browser: Browser, learner: Learner, width = 390) {
  const context = await browser.newContext({ viewport: { width, height: width <= 430 ? 844 : 1000 } });
  await context.addCookies([
    { name: "etg_session", value: learner.token, url: "http://localhost:3102", httpOnly: true, sameSite: "Lax" },
  ]);
  return { context, page: await context.newPage() };
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
}

test.beforeAll(async () => {
  await createQuestion("source", "The team ____ the report yesterday.", "completed");
  await createQuestion("recent", "The analyst ____ the file last night.", "completed");
  await createQuestion("unseen", "The manager ____ the review last week.", "completed");

  for (const [label, lifecycle] of [
    ["free", "FREE"],
    ["premium", "PREMIUM"],
    ["trial", "TRIAL"],
    ["expired", "EXPIRED"],
    ["limited", "FREE"],
  ] as const) {
    const learner = await createUser(label, lifecycle);
    await createSubmittedAnswer(learner.userId, questions.recent.id, questions.recent.correctOptionId, true);
    const sessionId = await createSubmittedAnswer(learner.userId, questions.source.id, questions.source.wrongOptionId, false);
    await pool.query(
      "insert into question_mastery(user_id,question_id,status,first_missed_at,last_missed_at) values($1,$2,'UNRESOLVED',now(),now())",
      [learner.userId, questions.source.id],
    );
    learners[label] = { ...learner, sessionId };
  }
  for (let index = 0; index < 2; index += 1) {
    await pool.query(
      "insert into usage_consumptions(user_id,entitlement_key,source_type,source_id) values($1,'MASTERY_REVIEW','PRACTICE_SESSION',$2)",
      [learners.limited.userId, randomUUID()],
    );
  }
});

test.afterAll(async () => pool.end());
test.describe.configure({ mode: "serial" });

test("wrong answer shows real explanation, taxonomy, status, and focused replacement", async ({ browser }) => {
  const { context, page } = await browserPage(browser, learners.free);
  await page.goto(`/practice/${learners.free.sessionId}/results`);
  await expect(page.getByRole("heading", { name: "Củng cố đúng dạng vừa sai" })).toBeVisible();
  await expect(page.getByText("Vì sao đáp án này đúng")).toBeVisible();
  await expect(page.getByText("Cần ôn", { exact: true })).toBeVisible();
  await expect(page.getByText("source: dấu hiệu thời gian quyết định thì của động từ.")).toBeVisible();
  const action = page.getByRole("button", { name: "Ôn dạng này" });
  await action.focus();
  await expect(action).toBeFocused();
  await action.click();
  await expect(page).toHaveURL(/\/practice\/[0-9a-f-]+\?remediation=focused/);
  await expect(page.getByText("The manager ____ the review last week.")).toBeVisible();
  await expect(page.getByText("The team ____ the report yesterday.")).toHaveCount(0);
  const completedAnswer = page.getByRole("radio", { name: "B completed" });
  await completedAnswer.check();
  await expect(completedAnswer).toBeChecked();
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page).toHaveURL(/\/practice\/[0-9a-f-]+\/results/);
  await page.goto("/mistakes?tab=strengthening");
  await expect(page.getByText("Đang củng cố", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/1 \/ 2 lần đúng liên tiếp/)).toBeVisible();
  const afterFocusedReview = (
    await pool.query<{ status: string; streak: number; attempts: number }>(
      "select status,review_success_streak as streak,review_attempt_count as attempts from question_mastery where user_id=$1 and question_id=$2",
      [learners.free.userId, questions.source.id],
    )
  ).rows[0];
  expect(afterFocusedReview).toEqual({ status: "UNRESOLVED", streak: 1, attempts: 1 });

  await page.getByRole("button", { name: "Ôn lỗi sai" }).click();
  await expect(page).toHaveURL(/\/practice\/[0-9a-f-]+$/);
  const sourceCorrectAnswer = page.getByRole("radio", { name: "B completed" });
  await sourceCorrectAnswer.check();
  await page.getByRole("button", { name: "Nộp bài" }).click();
  await expect(page).toHaveURL(/\/practice\/[0-9a-f-]+\/results/);
  await page.goto("/mistakes?tab=mastered");
  await expect(page.getByText("Đã nắm", { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/2 \/ 2 lần đúng liên tiếp/)).toBeVisible();
  const afterSecondReview = (
    await pool.query<{ status: string; streak: number; attempts: number }>(
      "select status,review_success_streak as streak,review_attempt_count as attempts from question_mastery where user_id=$1 and question_id=$2",
      [learners.free.userId, questions.source.id],
    )
  ).rows[0];
  expect(afterSecondReview).toEqual({ status: "MASTERED", streak: 2, attempts: 2 });
  await context.close();
});

test("Premium, active Trial, and expired Premium retain the remediation card", async ({ browser }) => {
  for (const label of ["premium", "trial", "expired"] as const) {
    const { context, page } = await browserPage(browser, learners[label]);
    await page.goto(`/practice/${learners[label].sessionId}/results`);
    await expect(page.getByRole("button", { name: "Ôn dạng này" })).toBeVisible();
    await expect(page.getByText("source: the time marker determines the verb tense.")).toBeVisible();
    await context.close();
  }
});

test("Free quota remains authoritative and explanations stay visible", async ({ browser }) => {
  const { context, page } = await browserPage(browser, learners.limited);
  await page.goto(`/practice/${learners.limited.sessionId}/results`);
  await expect(page.getByText("source: dấu hiệu thời gian quyết định thì của động từ.")).toBeVisible();
  await page.getByRole("button", { name: "Ôn dạng này" }).click();
  await expect(page).toHaveURL(/\/mistakes\?error=usage_limit/);
  await expect(page.getByRole("heading", { name: "Bạn đã dùng 2/2 lượt ôn Free hôm nay" })).toBeVisible();
  await context.close();
});

test("a learner cannot read another learner's remediation result", async ({ browser }) => {
  const { context, page } = await browserPage(browser, learners.premium);
  await page.goto(`/practice/${learners.limited.sessionId}/results`);
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Ôn dạng này" })).toHaveCount(0);
  await expect(page.getByText("source: the time marker determines the verb tense.")).toHaveCount(0);
  await context.close();
});

test("Result and Mistake Bank fit required widths in both interface languages", async ({ browser }) => {
  const { context, page } = await browserPage(browser, learners.premium);
  for (const width of [360, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
    await page.goto(`/practice/${learners.premium.sessionId}/results`);
    await expect(page.getByRole("button", { name: "Ôn dạng này" })).toBeVisible();
    await noOverflow(page);
    await page.goto("/mistakes");
    await expect(page.getByRole("heading", { name: "Ngân hàng lỗi sai" })).toBeVisible();
    await noOverflow(page);
  }
  await pool.query("update profiles set interface_language='en',explanation_language='en' where id=$1", [learners.premium.userId]);
  await page.goto(`/practice/${learners.premium.sessionId}/results`);
  await expect(page.getByRole("button", { name: "Review this skill" })).toBeVisible();
  await page.goto("/mistakes?tab=strengthening");
  await expect(page.getByRole("link", { name: /Strengthening/ })).toBeVisible();
  await noOverflow(page);
  await context.close();
});
