import { test, expect, type Browser } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "15433" || url.pathname !== "/toeicgym_task17" || url.username !== "toeicgym_test") throw new Error("TASK35_REQUIRES_ISOLATED_DATABASE");
const pool = new pg.Pool({ connectionString: url.href });

async function dashboard(browser: Browser, state: string, width: number) {
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 1000 }, bypassCSP: true });
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
  const user = (await pool.query<{ id: string }>("select id from users where email_normalized=$1", [`task26b-${state}@qa.invalid`])).rows[0];
  if (!user) throw new Error(`Missing isolated fixture ${state}`);
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 hour')", [user.id, hash]);
  await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.locator("#weekly-review-heading")).toBeVisible();
  await expect(page.locator("#today-workout")).toBeAttached();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  return { page, context };
}

test("weekly review is responsive and uses actual Free and Premium data", async ({ browser }) => {
  test.setTimeout(300_000);
  await mkdir("artifacts/task35", { recursive: true });
  for (const width of [360, 390, 430, 1024, 1440]) {
    const { page, context } = await dashboard(browser, "active", width);
    const review = page.locator("#weekly-review");
    await expect(review).toContainText("10");
    await expect(review).toContainText("50%");
    await expect(review).toContainText("1/3");
    await expect(review).not.toContainText("Chi tiết có đủ dữ liệu");
    await expect(page.getByRole("link", { name: "Xem tổng kết tuần" })).toBeVisible();
    await page.screenshot({ path: `artifacts/task35/dashboard-${width}.png`, fullPage: true });
    await context.close();
  }
  const premium = await dashboard(browser, "premium", 390);
  await expect(premium.page.locator("#weekly-review")).toContainText("Chi tiết có đủ dữ liệu");
  await expect(premium.page.locator("#weekly-review")).toContainText("So với tuần trước");
  await premium.context.close();
  const noData = await dashboard(browser, "no-goal", 390);
  await expect(noData.page.locator("#weekly-review")).toContainText("Chưa có hoạt động học");
  await expect(noData.page.locator("#weekly-review")).not.toContainText("0/0");
  await noData.context.close();
});

test.afterAll(async () => { await pool.end(); });
