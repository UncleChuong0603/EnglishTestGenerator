import { expect, test, type Browser, type Page } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import pg from "pg";

const base = process.env.TASK29_BASE_URL ?? "";
const mailpit = process.env.TASK29_MAILPIT_URL ?? "";
const cookieDomain = base ? new URL(base).hostname : "localhost";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const secret = process.env.SESSION_SECRET ?? "";
test.skip(!base || !mailpit || !process.env.DATABASE_URL || !secret, "Requires isolated Task 29 browser environment");

async function guestResult(browser: Browser, width: number) {
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 1000 } });
  const page = await context.newPage();
  await page.goto(`${base}/try`);
  await page.getByRole("button", { name: /Bắt đầu ngay|Start now/ }).last().click();
  await expect(page).toHaveURL(/\/practice\/[0-9a-f-]+$/, { timeout: 30_000 });
  const sessionId = page.url().split("/").at(-1)!;
  await page.getByRole("radio").first().check();
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: /Nộp bài|Submit/i }).click();
  await expect(page).toHaveURL(new RegExp(`/practice/${sessionId}/results`), { timeout: 30_000 });
  return { context, page, sessionId };
}

async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function ownedSession(sessionId: string) {
  return (await pool.query("select user_id,guest_owner_hash,status,score_correct,score_total from practice_sessions where id=$1", [sessionId])).rows[0];
}

test("existing account keeps guest result, owns it once, and continues", async ({ browser }) => {
  test.setTimeout(180_000);
  const { context, page, sessionId } = await guestResult(browser, 390);
  const before = await ownedSession(sessionId);
  expect(before.user_id).toBeNull();
  await page.getByRole("link", { name: /Tôi đã có tài khoản|I already have an account/ }).click();
  await expect(page).toHaveURL(/\/sign-in\?next=/);
  await page.getByLabel("Email").fill("task29-existing@qa.invalid");
  await page.locator('input[name="password"]').fill("Task29TestPassword123!");
  await page.getByRole("button", { name: /Đăng nhập|Sign in/ }).click();
  await expect(page).toHaveURL(new RegExp(`/continue-learning\\?result=${sessionId}`));
  await expect(page.getByRole("heading", { name: /Kết quả của bạn đã được lưu|Your result is saved/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Bài nên làm tiếp theo|Your next practice/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Giúp TOEICGym hiểu mục tiêu/ })).toHaveCount(0);
  await noOverflow(page);
  const after = await ownedSession(sessionId);
  expect(after.user_id).toBeTruthy();
  expect(after.guest_owner_hash).toBeNull();
  expect(after.score_correct).toBe(before.score_correct);
  expect(after.score_total).toBe(before.score_total);
  await page.reload();
  expect((await ownedSession(sessionId)).user_id).toBe(after.user_id);
  expect(Number((await pool.query("select count(*) from attempt_answers where session_id=$1", [sessionId])).rows[0].count)).toBe(Number(before.score_total));
  await page.getByRole("link", { name: /Xem lại kết quả vừa lưu|Review saved result/ }).click();
  await expect(page).toHaveURL(new RegExp(`/practice/${sessionId}/results`));
  await context.close();
});

test("new signup keeps the result through verification and continues", async ({ browser }) => {
  test.setTimeout(180_000);
  const { context, page, sessionId } = await guestResult(browser, 1440);
  await page.getByRole("link", { name: /Lưu kết quả & tiếp tục miễn phí|Save result & continue free/ }).last().click();
  await expect(page).toHaveURL(/\/sign-up\?from=guest-result/);
  await expect(page.getByRole("heading", { name: /Lưu kết quả của bạn|Save your result/ })).toBeVisible();
  const email = `task29-new-${Date.now()}@qa.invalid`;
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill("Task29TestPassword123!");
  await page.locator('input[name="confirmPassword"]').fill("Task29TestPassword123!");
  await page.getByRole("button", { name: /Tạo tài khoản|Create account/ }).click();
  await expect(page.getByText(/hướng dẫn xác minh đã được gửi/)).toBeVisible();
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
  await page.locator('input[name="password"]').fill("Task29TestPassword123!");
  await page.getByRole("button", { name: /Đăng nhập|Sign in/ }).click();
  await expect(page).toHaveURL(new RegExp(`/continue-learning\\?result=${sessionId}`));
  await expect(page.getByRole("heading", { name: /Kết quả của bạn đã được lưu|Your result is saved/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Bài nên làm tiếp theo|Your next practice/ })).toBeVisible();
  expect((await ownedSession(sessionId)).user_id).toBeTruthy();
  await noOverflow(page);
  await context.close();
});

test("expired guest data and another account's result are never claimed", async ({ browser }) => {
  test.setTimeout(120_000);
  const existing = (await pool.query("select id,password_hash from users where email_normalized='task29-existing@qa.invalid'")).rows[0];
  const other = (await pool.query("insert into users(email,email_normalized,password_hash,email_verified_at,status) values('task29-other@qa.invalid','task29-other@qa.invalid',$1,now(),'active') on conflict(email_normalized) do update set password_hash=excluded.password_hash returning id", [existing.password_hash])).rows[0];
  await pool.query("insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility) values($1,'Task 29 Other','vi','both','HIDDEN') on conflict(id) do nothing", [other.id]);
  const migrated = (await pool.query("select id from practice_sessions where user_id=$1 and source='guest' and status='submitted' order by submitted_at desc limit 1", [existing.id])).rows[0];
  expect(migrated?.id).toBeTruthy();
  const guestToken = randomBytes(32).toString("base64url");
  const guestHash = createHmac("sha256", secret).update(guestToken).digest("hex");
  const expired = (await pool.query("insert into practice_sessions(guest_owner_hash,skill_area,practice_type,part,status,question_count,requested_question_count,source,started_at,submitted_at,expires_at,score_correct,score_total) values($1,'READING','part_5',5,'submitted',1,1,'guest',now()-interval '2 days',now()-interval '2 days',now()-interval '1 day',1,1) returning id", [guestHash])).rows[0];
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await context.addCookies([{ name: "tg_guest", value: guestToken, domain: cookieDomain, path: "/", httpOnly: true, secure: base.startsWith("https:"), sameSite: "Lax" }]);
  const page = await context.newPage();
  await page.goto(`${base}/sign-in?next=${encodeURIComponent(`/continue-learning?result=${expired.id}`)}`);
  await page.getByLabel("Email").fill("task29-other@qa.invalid");
  await page.locator('input[name="password"]').fill("Task29TestPassword123!");
  await page.getByRole("button", { name: /Đăng nhập|Sign in/ }).click();
  await expect(page).toHaveURL(new RegExp(`/continue-learning\\?result=${expired.id}`), { timeout: 30_000 });
  await expect(page.getByRole("heading", { name: /Tiếp tục học cùng TOEICGym|Continue learning with TOEICGym/ })).toBeVisible();
  expect((await ownedSession(expired.id)).user_id).toBeNull();
  await page.goto(`${base}/continue-learning?result=${migrated.id}`);
  await expect(page.getByRole("heading", { name: /Tiếp tục học cùng TOEICGym|Continue learning with TOEICGym/ })).toBeVisible();
  await page.goto(`${base}/practice/${migrated.id}/results`);
  await expect(page.getByRole("heading", { name: /Không tìm thấy trang|Page not found/ })).toBeVisible();
  expect((await ownedSession(migrated.id)).user_id).toBe(existing.id);
  await context.close();
});

test("an authenticated learner can retry a deferred guest migration", async ({ browser }) => {
  test.setTimeout(120_000);
  const { context, page, sessionId } = await guestResult(browser, 390);
  const user = (await pool.query("select id from users where email_normalized='task29-existing@qa.invalid'")).rows[0];
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", secret).update(token).digest("hex");
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 hour')", [user.id, hash]);
  await context.addCookies([{ name: "etg_session", value: token, domain: cookieDomain, path: "/", httpOnly: true, secure: base.startsWith("https:"), sameSite: "Lax" }]);
  await page.goto(`${base}/continue-learning?result=${sessionId}`);
  await expect(page.getByRole("button", { name: /Thử lưu lại kết quả|Retry saving result/ })).toBeVisible();
  await page.getByRole("button", { name: /Thử lưu lại kết quả|Retry saving result/ }).click();
  await expect(page.getByRole("heading", { name: /Kết quả của bạn đã được lưu|Your result is saved/ })).toBeVisible();
  expect((await ownedSession(sessionId)).user_id).toBe(user.id);
  await context.close();
});

test("guest result and continuation fit required widths", async ({ browser }) => {
  test.setTimeout(240_000);
  const { context, page, sessionId } = await guestResult(browser, 390);
  for (const width of [360, 390, 430, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    await page.reload();
    await expect(page.getByRole("link", { name: /Lưu kết quả & tiếp tục miễn phí|Save result & continue free/ }).last()).toBeVisible();
    await noOverflow(page);
  }
  await page.goto(`${base}/continue-learning?result=${sessionId}`);
  await noOverflow(page);
  await context.close();
  const existing = (await pool.query("select id from users where email_normalized='task29-existing@qa.invalid'")).rows[0];
  for (const width of [390, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const token = randomBytes(32).toString("base64url");
    const hash = createHmac("sha256", secret).update(token).digest("hex");
    await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 hour')", [existing.id, hash]);
    await context.addCookies([{ name: "etg_session", value: token, domain: cookieDomain, path: "/", httpOnly: true, secure: base.startsWith("https:"), sameSite: "Lax" }]);
    const page = await context.newPage();
    await page.goto(`${base}/continue-learning`);
    await expect(page.getByRole("heading", { name: /Tiếp tục học cùng TOEICGym|Continue learning with TOEICGym/ })).toBeVisible();
    await noOverflow(page);
    await context.close();
  }
});

test.afterAll(async () => pool.end());
