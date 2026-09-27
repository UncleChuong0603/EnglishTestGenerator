import { test, expect, type Browser } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "15433" || url.pathname !== "/toeicgym_task17" || url.username !== "toeicgym_test") {
  throw new Error("TASK37_REQUIRES_ISOLATED_DATABASE");
}
const pool = new pg.Pool({ connectionString: url.href });
let expiredMembershipId: string | null = null;
let quotaUsageId: string | null = null;

test.beforeAll(async () => {
  const user = (await pool.query<{ id: string }>("select id from users where email_normalized='task26b-complete@qa.invalid'" )).rows[0];
  if (!user) throw new Error("Missing isolated QA learner");
  const row = await pool.query<{ id: string }>("insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM','MANUAL',now()-interval '40 days',now()-interval '10 days') returning id", [user.id]);
  expiredMembershipId = row.rows[0].id;
  const quotaUser = (await pool.query<{ id: string }>("select id from users where email_normalized='task26b-quota@qa.invalid'" )).rows[0];
  if (!quotaUser) throw new Error("Missing isolated quota learner");
  quotaUsageId = (await pool.query<{ id: string }>("insert into usage_consumptions(user_id,entitlement_key,quantity,source_type,source_id) values($1,'TODAYS_WORKOUT',1,'PRACTICE_SESSION',gen_random_uuid()) returning id", [quotaUser.id])).rows[0].id;
});

test.afterAll(async () => {
  if (expiredMembershipId) await pool.query("delete from user_plan_memberships where id=$1", [expiredMembershipId]);
  if (quotaUsageId) await pool.query("delete from usage_consumptions where id=$1", [quotaUsageId]);
  await pool.end();
});

async function learner(browser: Browser, state: string, width = 390) {
  const context = await browser.newContext({ viewport: { width, height: 844 } });
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
  const user = (await pool.query<{ id: string }>("select id from users where email_normalized=$1", [`task26b-${state}@qa.invalid`])).rows[0];
  if (!user) throw new Error(`Missing isolated QA learner ${state}`);
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 hour')", [user.id, hash]);
  await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
  return context;
}

test("pricing remains readable at required widths and gates Mock claims", async ({ browser }) => {
  test.setTimeout(240_000);
  for (const width of [360, 390, 430, 1024, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 } });
    const page = await context.newPage();
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "Premium thêm gì so với Free?" })).toBeVisible();
    await expect(page.locator("h4:visible, th:visible").filter({ hasText: "Kế hoạch học tuần" }).first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  }
});

test("Free, Premium and expired membership show real plan state", async ({ browser }) => {
  test.setTimeout(180_000);
  for (const [state, expected] of [["new", "Gói hiện tại"], ["premium", "Bạn đang dùng Premium"], ["complete", "Premium đã hết hạn"]] as const) {
    const context = await learner(browser, state);
    const page = await context.newPage();
    await page.goto("/pricing", { waitUntil: "domcontentloaded" });
    await expect(page.getByText(expected).first()).toBeVisible();
    if (state === "new") {
      await expect(page.getByText("Bạn chưa có đủ dữ liệu học tập để gợi ý quyền lợi riêng.", { exact: false })).toBeVisible();
      await expect(page.getByText("Nội dung cần cải thiện", { exact: true })).toHaveCount(0);
      await page.goto("/full-mock/history", { waitUntil: "domcontentloaded" });
      await expect(page.getByRole("heading", { name: "Chưa có lịch sử thi thử" })).toBeVisible();
      await expect(page.getByRole("heading", { name: "So sánh lịch sử dành cho Premium" })).toHaveCount(0);
    }
    if (state === "complete") {
      await expect(page.getByText("Dữ liệu học tập của bạn vẫn an toàn", { exact: false })).toBeVisible();
      await page.goto("/progress", { waitUntil: "domcontentloaded" });
      await expect(page.getByText("10 câu", { exact: false }).first()).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await context.close();
  }
});

test("Free workout quota shows available and reached states from stored usage", async ({ browser }) => {
  test.setTimeout(120_000);
  for (const [state, usage] of [["active", "0 / 1"], ["quota", "1 / 1"]] as const) {
    const context = await learner(browser, state);
    const page = await context.newPage();
    await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("progressbar", { name: new RegExp(`Bài hôm nay: ${usage}`) })).toBeVisible();
    await context.close();
  }
});
