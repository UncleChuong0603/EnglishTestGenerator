import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { expect, test, type Browser, type Page } from "@playwright/test";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL ?? "";
const url = new URL(databaseUrl);
if (url.hostname !== "127.0.0.1" || url.port !== "15440" || url.pathname !== "/toeicgym_task40" || url.username !== "toeicgym_test") throw new Error("Task 40 Playwright requires its isolated PostgreSQL 17 database.");
const sessionSecret = process.env.SESSION_SECRET ?? "";
if (sessionSecret.length < 32) throw new Error("Task 40 Playwright requires SESSION_SECRET.");
const pool = new pg.Pool({ connectionString: databaseUrl });

type Fixture = { userId: string; sessionId: string; token: string };
const fixtures: Record<string, Fixture> = {};
let adminToken = "";
let questionId = "";
let listeningSessionId = "";

async function createUser(label: string, plan: "FREE" | "PREMIUM" | "TRIAL") {
  const email = `task40-${label}@qa.invalid`;
  const user = (await pool.query<{ id: string }>("insert into users(email,email_normalized,email_verified_at,status) values($1,$1,now(),'active') returning id", [email])).rows[0];
  await pool.query("insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility) values($1,$2,'vi','both','HIDDEN')", [user.id, `Task 40 ${label}`]);
  if (plan !== "FREE") await pool.query("insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM',$2,now()-interval '1 day',now()+interval '2 days')", [user.id, plan === "TRIAL" ? "TRIAL" : "MANUAL"]);
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", sessionSecret).update(token).digest("hex");
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 day')", [user.id, hash]);
  return { userId: user.id, token };
}

async function createSubmittedSession(userId: string, targetQuestionId: string, part: number, groupId: string, correctOptionId: string, selectedOptionId: string) {
  const session = (await pool.query<{ id: string }>("insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total) values($1,$2,$3,$4,'submitted',1,1,'custom',now(),0,1) returning id", [userId, part <= 4 ? "LISTENING" : "READING", part <= 4 ? `listening_part_${part}` : `part_${part}`, part])).rows[0];
  await pool.query("insert into practice_session_questions(session_id,question_id,display_order,passage_set_id) values($1,$2,1,$3)", [session.id, targetQuestionId, groupId]);
  await pool.query("insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,$5,now())", [session.id, userId, targetQuestionId, selectedOptionId, selectedOptionId === correctOptionId]);
  return session.id;
}

async function contextFor(browser: Browser, token: string, width = 390) {
  const context = await browser.newContext({ viewport: { width, height: width <= 430 ? 844 : 1000 } });
  await context.addCookies([{ name: "etg_session", value: token, url: "http://127.0.0.1:3100", httpOnly: true, sameSite: "Lax" }]);
  return context;
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
}

async function submitReport(page: Page, reason: string, description: string) {
  await page.getByRole("button", { name: "Báo lỗi câu hỏi" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Báo lỗi câu hỏi" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Loại lỗi").selectOption(reason);
  await dialog.getByLabel("Mô tả thêm (không bắt buộc)").fill(description);
  await dialog.getByRole("button", { name: "Gửi báo cáo" }).click();
  await expect(dialog.getByText("Đã gửi báo cáo", { exact: true })).toBeVisible();
  await dialog.getByRole("button", { name: "Tiếp tục học" }).click();
}

test.beforeAll(async () => {
  const groupId = randomUUID();
  questionId = randomUUID();
  await pool.query("insert into passage_sets(id,toeic_part,skill_area,set_type,title,status,provenance) values($1,5,'READING','standalone','Task 40 report fixture','published','ADMIN')", [groupId]);
  await pool.query("insert into questions(id,toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,status,passage_set_id,question_order) values($1,5,'READING','standalone','grammar','verb_tense','medium','The analyst ____ the report yesterday.','published',$2,1)", [questionId, groupId]);
  const optionIds = [randomUUID(), randomUUID(), randomUUID(), randomUUID()];
  for (const [index, text] of ["finish", "finished", "finishes", "finishing"].entries()) await pool.query("insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,$3,$4,$5)", [optionIds[index], questionId, String.fromCharCode(65 + index), text, index + 1]);
  await pool.query("insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi) values($1,$2,'Yesterday requires the simple past.','Yesterday yêu cầu thì quá khứ đơn.')", [questionId, optionIds[1]]);

  for (const [label, plan] of [["free", "FREE"], ["premium", "PREMIUM"], ["trial", "TRIAL"], ["explanation", "FREE"], ["other", "FREE"]] as const) {
    const user = await createUser(label, plan);
    const sessionId = await createSubmittedSession(user.userId, questionId, 5, groupId, optionIds[1], optionIds[0]);
    fixtures[label] = { ...user, sessionId };
  }

  const admin = await createUser("admin", "FREE");
  await pool.query("insert into user_roles(user_id,role,created_by) values($1,'ADMIN',$1)", [admin.userId]);
  adminToken = admin.token;

  const listeningGroupId = randomUUID();
  const listeningQuestionId = randomUUID();
  const listeningOptions = [randomUUID(), randomUUID(), randomUUID()];
  const mediaId = randomUUID();
  await pool.query("insert into passage_sets(id,toeic_part,skill_area,set_type,title,status,provenance) values($1,2,'LISTENING','question_response','Task 40 listening fixture','published','ADMIN')", [listeningGroupId]);
  await pool.query("insert into questions(id,toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,status,passage_set_id,question_order) values($1,2,'LISTENING','question_response','question_response','direct_response','easy','When will the shipment arrive?','published',$2,1)", [listeningQuestionId, listeningGroupId]);
  for (const [index, text] of ["At the loading dock.", "Tomorrow morning.", "By express mail."].entries()) await pool.query("insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,$3,$4,$5)", [listeningOptions[index], listeningQuestionId, String.fromCharCode(65 + index), text, index + 1]);
  await pool.query("insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi) values($1,$2,'The response gives a time.','Câu trả lời cung cấp thời gian.')", [listeningQuestionId, listeningOptions[1]]);
  await pool.query("insert into listening_transcripts(question_group_id,content) values($1,'When will the shipment arrive? Tomorrow morning.')", [listeningGroupId]);
  await pool.query("insert into media_assets(id,kind,access_scope,storage_provider,storage_key,mime_type,byte_size,checksum,status,audio_duration_ms) values($1,'AUDIO','CONTENT','LOCAL','task40/audio.mp3','audio/mpeg',100,$2,'READY',2000)", [mediaId, "4".repeat(64)]);
  await pool.query("insert into question_group_media(question_group_id,media_asset_id,role,position) values($1,$2,'AUDIO',1)", [listeningGroupId, mediaId]);
  listeningSessionId = await createSubmittedSession(fixtures.free.userId, listeningQuestionId, 2, listeningGroupId, listeningOptions[1], listeningOptions[0]);
});

test.afterAll(async () => { await pool.end(); });
test.describe.configure({ mode: "serial" });

test("Free, Premium, and Trial learners can report without interrupting result review", async ({ browser }) => {
  const reasons = { free: "ANSWER_INCORRECT", premium: "AMBIGUOUS", trial: "TYPO_GRAMMAR", explanation: "EXPLANATION_ISSUE", other: "OTHER" };
  for (const label of ["free", "premium", "trial", "explanation", "other"] as const) {
    const context = await contextFor(browser, fixtures[label].token);
    const page = await context.newPage();
    await page.goto(`/practice/${fixtures[label].sessionId}/results`);
    await expect(page.getByText("B. finished")).toBeVisible();
    await submitReport(page, reasons[label], `${label} evidence from submitted result`);
    await expect(page.getByText("B. finished")).toBeVisible();
    await context.close();
  }
  const reports = await pool.query("select reason,count(*)::int count from question_reports where question_id=$1 group by reason", [questionId]);
  expect(reports.rows).toHaveLength(5);
});

test("duplicate reporting is blocked and learner result fits all required widths", async ({ browser }) => {
  const context = await contextFor(browser, fixtures.free.token);
  const page = await context.newPage();
  for (const width of [360, 390, 430, 1024, 1440]) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
    await page.goto(`/practice/${fixtures.free.sessionId}/results`);
    await expect(page.getByRole("button", { name: "Báo lỗi câu hỏi" })).toBeVisible();
    await noOverflow(page);
  }
  await page.getByRole("button", { name: "Báo lỗi câu hỏi" }).click();
  const dialog = page.getByRole("dialog", { name: "Báo lỗi câu hỏi" });
  await dialog.getByLabel("Loại lỗi").selectOption("OTHER");
  await dialog.getByRole("button", { name: "Gửi báo cáo" }).click();
  await expect(dialog.getByText("Bạn đã báo câu hỏi này", { exact: false })).toBeVisible();
  expect(Number((await pool.query("select count(*)::int count from question_reports where question_id=$1 and reporter_user_id=$2", [questionId, fixtures.free.userId])).rows[0].count)).toBe(1);
  await context.close();
});

test("Listening media issues use the same protected report path", async ({ browser }) => {
  const context = await contextFor(browser, fixtures.free.token);
  const page = await context.newPage();
  await page.goto(`/practice/${listeningSessionId}/results`);
  await expect(page.locator("audio")).toHaveCount(1);
  await submitReport(page, "MEDIA_BROKEN", "Audio does not play on this device");
  expect((await pool.query("select reason from question_reports where practice_session_id=$1", [listeningSessionId])).rows[0].reason).toBe("MEDIA_BROKEN");
  await context.close();
});

test("admin authorization, evidence priority, filters, history, and workflow are responsive", async ({ browser }) => {
  const anonymousContext = await browser.newContext();
  const anonymous = await anonymousContext.newPage();
  await anonymous.goto("/admin/content/reports");
  await expect(anonymous).toHaveURL(/\/sign-in\?next=/);
  await anonymousContext.close();

  const context = await contextFor(browser, adminToken);
  const page = await context.newPage();
  for (const width of [360, 390, 430, 1024, 1440]) {
    await page.setViewportSize({ width, height: width <= 430 ? 844 : 1000 });
    await page.goto("/admin/content/reports?status=OPEN&part=5");
    await expect(page.getByRole("heading", { name: "Báo lỗi câu hỏi" })).toBeVisible();
    await expect(page.getByText("HIGH", { exact: true }).first()).toBeVisible();
    await noOverflow(page);
  }
  await page.getByRole("link", { name: "Kiểm tra →" }).first().click();
  await expect(page.getByText("Lịch sử báo cáo (5)")).toBeVisible();
  await expect(page.getByText("Bài đã nộp", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Tạo bản sửa nháp trong editor" }).first()).toBeVisible();
  const firstReport = (await pool.query("select id from question_reports where question_id=$1 order by created_at limit 1", [questionId])).rows[0];
  const card = page.locator("article").filter({ has: page.locator(`input[name='reportId'][value='${firstReport.id}']`) });
  await card.getByRole("button", { name: "Kiểm tra", exact: true }).click();
  await expect(page.getByText("Đã chuyển báo cáo sang trạng thái đang kiểm tra.")).toBeVisible();
  expect((await pool.query("select status from question_reports where id=$1", [firstReport.id])).rows[0].status).toBe("IN_REVIEW");
  await context.close();
});
