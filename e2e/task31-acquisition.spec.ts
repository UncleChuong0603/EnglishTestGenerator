import { expect, test, type Page } from "@playwright/test";
import pg from "pg";

const base = process.env.TASK31_BASE_URL ?? "";
const mailpit = process.env.TASK31_MAILPIT_URL ?? "";
const databaseUrl = process.env.DATABASE_URL ?? "";
const pool = new pg.Pool({ connectionString: databaseUrl });
test.skip(!base || !mailpit || !databaseUrl.includes("127.0.0.1:15435/task31"), "Requires isolated Task 31 QA environment");

async function eventCount(eventName: string, sessionId?: string) {
  const result = await pool.query("select count(*)::int n from product_events where event_name=$1 and ($2::uuid is null or session_id=$2::uuid)", [eventName, sessionId ?? null]);
  return result.rows[0].n as number;
}
async function submit(page: Page) {
  await page.getByRole("radio").first().check();
  page.once("dialog", dialog => dialog.accept());
  await page.getByRole("button", { name: /Nộp bài|Submit/i }).click();
}

test("Part 5 share and acquisition funnel stay private and linked within one guest flow", async ({ browser }) => {
  test.setTimeout(240_000);
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const initialViews = await eventCount("challenge_viewed");
  await page.goto(`${base}/admin/analytics`);
  await expect(page).toHaveURL(/\/sign-in/, { timeout: 30_000 });
  await page.goto(`${base}/challenge/part-5`);
  await expect.poll(() => eventCount("challenge_viewed"), { timeout: 20_000 }).toBe(initialViews + 1);
  for (const width of [360, 390, 430, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole("button", { name: /Bắt đầu ngay|Start now/ }).click();
  await expect(page).toHaveURL(/\/challenge\/part-5\/[0-9a-f-]+$/);
  const challengeId = page.url().split("/").at(-1)!;
  expect(await eventCount("challenge_started", challengeId)).toBe(1);
  await submit(page);
  await expect(page).toHaveURL(new RegExp(`/challenge/part-5/${challengeId}/result$`));
  await expect.poll(() => eventCount("challenge_completed", challengeId)).toBe(1);
  for (const width of [360, 390, 430, 1024, 1440]) {
    await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.evaluate(() => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async (value: string) => { (window as typeof window & { task31Copied?: string }).task31Copied = value; } } });
  });
  await page.getByRole("button", { name: /Chia sẻ \/ Sao chép link|Share \/ Copy link/ }).click();
  expect(await page.evaluate(() => (window as typeof window & { task31Copied?: string }).task31Copied)).toBe(`${base}/challenge/part-5`);
  await page.evaluate(() => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => query === "(pointer: coarse)" ? { matches: true } as MediaQueryList : original(query)) as typeof window.matchMedia;
    Object.defineProperty(navigator, "share", { configurable: true, value: async (data: ShareData) => { (window as typeof window & { task31Shared?: ShareData }).task31Shared = data; } });
  });
  await page.getByRole("button", { name: /Chia sẻ \/ Sao chép link|Share \/ Copy link/ }).click();
  const shared = await page.evaluate(() => (window as typeof window & { task31Shared?: ShareData }).task31Shared);
  expect(shared?.url).toBe(`${base}/challenge/part-5`);
  expect(shared?.text).toContain("1/10");
  expect(JSON.stringify(shared)).not.toContain(challengeId);
  await page.reload();
  expect(await eventCount("challenge_completed", challengeId)).toBe(1);

  await page.getByRole("link", { name: /Tiếp tục luyện miễn phí|Continue practicing free/ }).click();
  const email = `task31-new-${Date.now()}@qa.invalid`;
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill("Task31TestPassword123!");
  await page.locator('input[name="confirmPassword"]').fill("Task31TestPassword123!");
  await page.getByRole("button", { name: /Tạo tài khoản|Create account/ }).click();
  await expect.poll(() => eventCount("signup_after_challenge", challengeId)).toBe(1);
  await expect.poll(async () => {
    const response = await page.request.get(`${mailpit}/api/v1/messages`);
    return (await response.json()).messages.filter((message: { To: Array<{ Address: string }> }) => message.To.some(recipient => recipient.Address === email)).length;
  }).toBe(1);
  const inbox = await page.request.get(`${mailpit}/api/v1/messages`);
  const message = (await inbox.json()).messages.find((item: { To: Array<{ Address: string }> }) => item.To.some((recipient) => recipient.Address === email));
  const detail = await page.request.get(`${mailpit}/api/v1/message/${message.ID}`);
  const token = new URL(((await detail.json()).Text as string).match(/https?:\/\/[^\s]+\/verify-email\?token=[^\s]+/)![0]).searchParams.get("token")!;
  await page.goto(`${base}/verify-email?token=${encodeURIComponent(token)}`);
  await page.getByRole("button", { name: /Xác minh tài khoản/ }).click();
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill("Task31TestPassword123!");
  await page.getByRole("button", { name: /Đăng nhập|Sign in/ }).click();
  await expect(page).toHaveURL(new RegExp(`/continue-learning\\?result=${challengeId}`));
  await page.goto(`${base}/admin/analytics`);
  await expect(page).toHaveURL(/\/admin\/access-denied/);
  await page.goto(`${base}/continue-learning?result=${challengeId}`);
  await page.getByRole("button", { name: /Tiếp tục luyện|Continue practicing/ }).click();
  await expect(page).toHaveURL(/\/practice\/[0-9a-f-]+$/);
  const workoutId = page.url().split("/").at(-1)!;
  await submit(page);
  await expect.poll(() => eventCount("first_authenticated_workout_after_challenge", workoutId)).toBe(1);

  const admin = await browser.newContext();
  const adminPage = await admin.newPage();
  await adminPage.goto(`${base}/sign-in`);
  await adminPage.getByLabel("Email").fill("task31-admin@qa.invalid");
  await adminPage.locator('input[name="password"]').fill("Task31TestPassword123!");
  await adminPage.getByRole("button", { name: /Đăng nhập|Sign in/ }).click();
  await expect(adminPage).toHaveURL(/\/dashboard/);
  await adminPage.goto(`${base}/admin/analytics?period=7d`);
  const funnel = adminPage.getByRole("region", { name: "Part 5 Challenge funnel" });
  await expect(funnel).toBeVisible();
  for (const label of ["Viewed", "Started", "Completed", "Signup", "First workout"]) await expect(funnel.getByText(label, { exact: true })).toBeVisible();
  await expect(funnel.getByText(/mẫu bước trước dưới 20|prior step under 20/).first()).toBeVisible();
  expect(await eventCount("challenge_started", challengeId)).toBe(1);
  expect(await eventCount("challenge_completed", challengeId)).toBe(1);
  expect(await eventCount("signup_after_challenge", challengeId)).toBe(1);
  expect(await eventCount("first_authenticated_workout_after_challenge", workoutId)).toBe(1);
  await admin.close();
  await context.close();
});

test.afterAll(async () => pool.end());
