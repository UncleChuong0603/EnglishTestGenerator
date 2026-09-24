import { test, expect, type Browser } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "15433" || url.pathname !== "/toeicgym_task17" || url.username !== "toeicgym_test") throw new Error("TASK34_REQUIRES_ISOLATED_DATABASE");
const pool = new pg.Pool({ connectionString: url.href });

async function openDashboard(browser: Browser, state: string, width: number) {
  // Next dev needs eval for hydration; the deployed CSP remains untouched.
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 1000 }, bypassCSP: true });
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
  const user = (await pool.query<{ id: string }>("select id from users where email_normalized=$1", [`task26b-${state}@qa.invalid`])).rows[0];
  if (!user) throw new Error(`Missing isolated fixture ${state}`);
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 hour')", [user.id, hash]);
  await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
  const page = await context.newPage();
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Road to Target|Mục tiêu TOEIC|Hành trình học/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Kế hoạch học đầy đủ|Gợi ý cho tuần này|Full study plan|This week's suggestions/ })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.locator("body").innerText()).not.toMatch(/predicted TOEIC|estimated TOEIC|readiness %|xác suất đạt|còn \+\d+ điểm/i);
  return { context, page };
}

test("Road to Target responsive matrix and server actions", async ({ browser }) => {
  test.setTimeout(300_000);
  await mkdir("artifacts/task34", { recursive: true });
  for (const width of [360, 390, 430, 1024, 1440]) {
    const { context, page } = await openDashboard(browser, "active", width);
    await expect(page.getByText("800", { exact: false }).first()).toBeVisible();
    await expect(page.locator("#today-workout")).toBeAttached();
    await expect(page.locator("#daily-goal-heading")).toBeVisible();
    expect(await page.locator("#road-to-target-heading").evaluate(node => { const today = document.querySelector("#today-workout"); return today ? Boolean(node.compareDocumentPosition(today) & Node.DOCUMENT_POSITION_FOLLOWING) : false; })).toBe(true);
    await page.screenshot({ path: `artifacts/task34/dashboard-${width}.png`, fullPage: true });
    await context.close();
  }
  for (const state of ["no-goal", "partial-goal", "premium", "quota", "complete", "new"]) {
    const { context, page } = await openDashboard(browser, state, 390);
    const cards = page.locator("section[aria-labelledby='weekly-plan-heading'] ol > li");
    if (state === "premium") {
      await expect(page.locator("#weekly-plan-heading")).toContainText("Kế hoạch học đầy đủ");
      await expect(cards).toHaveCount(5);
    }
    if (state === "no-goal") await expect(cards).toHaveCount(3);
    if (state === "no-goal") await expect(page.getByRole("link", { name: "Thiết lập mục tiêu" }).first()).toBeVisible();
    if (state === "quota") await expect(cards.filter({ hasText: "Tạm chưa khả dụng" }).first()).toBeVisible();
    await context.close();
  }
});

test("a plan CTA creates a server-selected session in the isolated database", async ({ browser }) => {
  test.setTimeout(60_000);
  const user = (await pool.query<{ id: string }>("select id from users where email_normalized='task26b-no-goal@qa.invalid'")).rows[0];
  await pool.query("delete from practice_sessions where user_id=$1 and source='recommended'", [user.id]);
  await pool.query("delete from usage_consumptions where user_id=$1 and entitlement_key='TODAYS_WORKOUT'", [user.id]);
  const { context, page } = await openDashboard(browser, "no-goal", 390);
  await page.locator("section[aria-labelledby='weekly-plan-heading'] ol > li").first().getByRole("button", { name: "Bắt đầu" }).click({ noWaitAfter: true });
  await expect.poll(async () => {
    const rows = await pool.query<{ question_count: number; assigned: number }>("select ps.question_count,count(psq.question_id)::int assigned from practice_sessions ps left join practice_session_questions psq on psq.session_id=ps.id where ps.user_id=$1 and ps.source='recommended' group by ps.id order by ps.started_at desc limit 1", [user.id]);
    const row = rows.rows[0];
    return Boolean(row && row.question_count === row.assigned && row.assigned > 0);
  }, { timeout: 20000 }).toBe(true);
  await context.close();
});

test.afterAll(async () => { await pool.end(); });
