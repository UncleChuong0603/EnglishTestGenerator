import { test, expect, type Browser } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const output = "/tmp/task26b-screenshots";
async function pageFor(browser: Browser, state: string, width: number, height: number) {
  const context = await browser.newContext({ viewport: { width, height } });
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
  const user = (await pool.query(`select id from users where email_normalized=$1`, [`task26b-${state}@qa.invalid`])).rows[0];
  await pool.query(`insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 day')`, [user.id, hash]);
  await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax", expires: Math.floor(Date.now() / 1000) + 3600 }]);
  return { context, page: await context.newPage() };
}
async function verify(browser: Browser, state: string, width: number, height: number) {
  const { context, page } = await pageFor(browser, state, width, height);
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.locator("main h1")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const hero = page.locator("main section").first();
  await expect(hero).toBeVisible();
  await expect(hero.locator("a,button").first()).toBeVisible();
  await page.screenshot({ path: `${output}/task26-${state}-${width}.png`, fullPage: true });
  await context.close();
}
test("Task 26 lifecycle and responsive matrix", async ({ browser }) => {
  test.setTimeout(300_000); await mkdir(output, { recursive: true });
  for (const width of [360, 390, 430, 1024, 1440]) await verify(browser, "active", width, width < 500 ? 844 : 1000);
  for (const state of ["new", "diagnosed", "resumable", "complete", "quota", "premium", "no-goal", "partial-goal"]) {
    await verify(browser, state, 390, 844); await verify(browser, state, 1440, 1000);
  }
});
test.afterAll(async () => { await pool.end(); });
