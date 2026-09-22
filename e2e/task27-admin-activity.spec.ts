import { expect, test, type Browser, type BrowserContext } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function authenticatedContext(browser: Browser, email: string, width = 390) {
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 1000 } });
  const user = (await pool.query("select id from users where email_normalized=$1", [email])).rows[0];
  if (!user) throw new Error(`Missing Task 27 fixture: ${email}`);
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '2 hours')", [user.id, hash]);
  await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
  return { context, userId: user.id as string };
}

async function noHorizontalOverflow(context: BrowserContext) {
  const page = context.pages()[0] ?? await context.newPage();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("Admin user activity is responsive and filterable", async ({ browser }) => {
  test.setTimeout(180_000);
  for (const width of [390, 1024, 1440]) {
    const { context } = await authenticatedContext(browser, "task27-admin@qa.invalid", width);
    const page = await context.newPage();
    await page.goto("/admin/users?q=task27-&learning=returning&sort=learning_recent", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: /Users|Người dùng/ })).toBeVisible();
    await expect(page.getByText(/Learners returning on 2\+ days|Người học quay lại ít nhất 2 ngày/)).toBeVisible();
    await expect(page.getByRole("link", { name: "QA JOURNEY" }).first()).toBeVisible();
    await noHorizontalOverflow(context);
    await context.close();
  }
});

test("Admin can open the normalized timeline", async ({ browser }) => {
  const { context } = await authenticatedContext(browser, "task27-admin@qa.invalid", 390);
  const page = await context.newPage();
  const journey = (await pool.query("select id from users where email_normalized='task27-journey@qa.invalid'")).rows[0];
  await page.goto(`/admin/users/${journey.id}?tab=activity`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Activity timeline|Dòng thời gian hoạt động/ })).toBeVisible();
  await expect(page.getByText(/Mistake review completed|Hoàn thành ôn câu sai/, { exact: true }).first()).toBeVisible();
  await expect(page.getByText(/Question content and secrets are excluded|Không hiển thị nội dung câu hỏi/)).toBeVisible();
  await noHorizontalOverflow(context);
  await context.close();
});

test("Admin authorization protects the surfaces", async ({ browser, page }) => {
  await page.goto("/admin/users");
  await expect(page).toHaveURL(/\/sign-in\?next=%2Fadmin|\/sign-in\?next=\/admin/);

  const { context } = await authenticatedContext(browser, "task27-one-day@qa.invalid");
  const learnerPage = await context.newPage();
  await learnerPage.goto("/admin/users");
  await expect(learnerPage).toHaveURL(/\/admin\/access-denied/, { timeout: 20_000 });
  await context.close();
});

test.afterAll(async () => { await pool.end(); });
