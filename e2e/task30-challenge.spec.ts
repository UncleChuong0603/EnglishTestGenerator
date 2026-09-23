import { expect, test, type Page } from "@playwright/test";
import pg from "pg";

const base = process.env.TASK30_BASE_URL ?? "";
const mailpit = process.env.TASK30_MAILPIT_URL ?? "";
const databaseUrl = process.env.DATABASE_URL ?? "";
const pool = new pg.Pool({ connectionString: databaseUrl });
test.skip(!base || !mailpit || !databaseUrl.includes("127.0.0.1:15434/task30"), "Requires isolated Task 30 QA environment");

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function startAndSubmit(page: Page) {
  await page.goto(`${base}/challenge/part-5`);
  await expect(page.getByRole("button", { name: /Bắt đầu ngay|Start now/ })).toBeVisible();
  await page.getByRole("button", { name: /Bắt đầu ngay|Start now/ }).click();
  await expect(page).toHaveURL(/\/challenge\/part-5\/[0-9a-f-]+$/);
  const sessionId = page.url().split("/").at(-1)!;
  const session = (await pool.query("select practice_type,part,question_count,requested_question_count,source,user_id,guest_owner_hash from practice_sessions where id=$1", [sessionId])).rows[0];
  expect(session.practice_type).toBe("part_5");
  expect([session.part, session.question_count, session.requested_question_count]).toEqual([5, 10, 10]);
  const assigned = await pool.query("select q.toeic_part from practice_session_questions psq join questions q on q.id=psq.question_id where psq.session_id=$1", [sessionId]);
  expect(assigned.rows).toHaveLength(10);
  expect(assigned.rows.every((row) => row.toeic_part === 5)).toBe(true);
  const html = await page.content();
  expect(html).not.toContain("correctOptionId");
  expect(html).not.toContain("explanationVi");
  await page.getByRole("radio").first().check();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Nộp bài|Submit/i }).click();
  await expect(page).toHaveURL(new RegExp(`/challenge/part-5/${sessionId}/result$`));
  return { sessionId, session };
}

test("guest challenge has a real result, explanations and safe ownership at every width", async ({ browser }) => {
  test.setTimeout(180_000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto(`${base}/challenge`);
  await expect(page.getByRole("heading", { name: /Thử sức với TOEIC|Test yourself/ })).toBeVisible();
  const { sessionId, session } = await startAndSubmit(page);
  expect(session.user_id).toBeNull();
  expect(session.guest_owner_hash).toBeTruthy();
  const persisted = (await pool.query("select score_correct,score_total from practice_sessions where id=$1", [sessionId])).rows[0];
  expect([persisted.score_correct, persisted.score_total]).toEqual([1, 10]);
  await expect(page.getByRole("heading", { name: /1\/10/ })).toBeVisible();
  await expect(page.getByText(/Độ chính xác: 10%|Accuracy: 10%/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Xem lại 9 câu sai|Review 9 missed questions/ })).toBeVisible();
  await expect(page.getByText("Ngôi thứ ba số ít dùng -s.").first()).toBeVisible();
  await expect(page.getByRole("link", { name: /Tiếp tục luyện miễn phí|Continue practicing free/ })).toHaveAttribute("href", /\/sign-up\?from=guest-result&next=/);
  for (const width of [360, 390, 430, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await noOverflow(page);
    if (process.env.TASK30_CAPTURE === "1") await page.screenshot({ path: `test-results/task30-result-${width}.png` });
    await page.goto(`${base}/challenge/part-5`);
    await noOverflow(page);
    if (process.env.TASK30_CAPTURE === "1") await page.screenshot({ path: `test-results/task30-landing-${width}.png` });
    await page.goto(`${base}/challenge/part-5/${sessionId}`);
    await expect(page).toHaveURL(new RegExp(`/challenge/part-5/${sessionId}/result$`));
  }
  const stranger = await browser.newContext();
  const other = await stranger.newPage();
  await other.goto(`${base}/challenge/part-5/${sessionId}/result`);
  await expect(other).toHaveURL(`${base}/challenge/part-5`);
  await stranger.close();
  await context.close();
});

test("guest signs up, claims result, and continues with server recommendation", async ({ browser }) => {
  test.setTimeout(180_000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const { sessionId } = await startAndSubmit(page);
  await page.getByRole("link", { name: /Tiếp tục luyện miễn phí|Continue practicing free/ }).click();
  await expect(page).toHaveURL(/\/sign-up\?from=guest-result/);
  const email = `task30-new-${Date.now()}@qa.invalid`;
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill("Task30TestPassword123!");
  await page.locator('input[name="confirmPassword"]').fill("Task30TestPassword123!");
  await page.getByRole("button", { name: /Tạo tài khoản|Create account/ }).click();
  await expect.poll(async () => {
    const response = await page.request.get(`${mailpit}/api/v1/messages`);
    return (await response.json()).messages.filter((message: { To: Array<{ Address: string }> }) => message.To.some((recipient) => recipient.Address === email));
  }).toHaveLength(1);
  const inbox = await page.request.get(`${mailpit}/api/v1/messages`);
  const message = (await inbox.json()).messages.find((item: { To: Array<{ Address: string }> }) => item.To.some((recipient) => recipient.Address === email));
  const detail = await page.request.get(`${mailpit}/api/v1/message/${message.ID}`);
  const body = (await detail.json()).Text as string;
  const token = new URL(body.match(/https?:\/\/[^\s]+\/verify-email\?token=[^\s]+/)![0]).searchParams.get("token")!;
  await page.goto(`${base}/verify-email?token=${encodeURIComponent(token)}`);
  await page.getByRole("button", { name: /Xác minh tài khoản/ }).click();
  await expect(page).toHaveURL(/\/sign-in\?verified=1&next=/);
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill("Task30TestPassword123!");
  await page.getByRole("button", { name: /Đăng nhập|Sign in/ }).click();
  await expect(page).toHaveURL(new RegExp(`/continue-learning\\?result=${sessionId}`));
  await expect(page.getByRole("heading", { name: /Kết quả của bạn đã được lưu|Your result is saved/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Bài nên làm tiếp theo|Your next practice/ })).toBeVisible();
  const saved = (await pool.query("select user_id,guest_owner_hash,score_correct,score_total from practice_sessions where id=$1", [sessionId])).rows[0];
  expect(saved.user_id).toBeTruthy();
  expect(saved.guest_owner_hash).toBeNull();
  expect([saved.score_correct, saved.score_total]).toEqual([1, 10]);
  await noOverflow(page);
  await page.getByRole("button", { name: /Tiếp tục luyện|Continue practicing/ }).click();
  await expect(page).toHaveURL(/\/practice\/[0-9a-f-]+$/);
  const nextSessionId = page.url().split("/").at(-1)!;
  const nextSession = (await pool.query("select user_id,source,question_count from practice_sessions where id=$1", [nextSessionId])).rows[0];
  expect(nextSession.user_id).toBe(saved.user_id);
  expect(nextSession.source).toBe("recommended");
  expect(nextSession.question_count).toBeGreaterThan(0);
  await context.close();
});

test.afterAll(async () => pool.end());
