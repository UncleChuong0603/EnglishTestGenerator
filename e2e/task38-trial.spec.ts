import { createHmac, randomBytes } from "node:crypto";
import { expect, test } from "@playwright/test";
import pg from "pg";

const databaseUrl = process.env.DATABASE_URL ?? "";
const url = new URL(databaseUrl);
if (url.hostname !== "127.0.0.1" || url.port !== "15438" || url.pathname !== "/toeicgym_task38") throw new Error("Task 38 browser QA requires the isolated PostgreSQL database");
const secret = process.env.SESSION_SECRET;
if (!secret) throw new Error("Task 38 browser QA requires SESSION_SECRET");
const pool = new pg.Pool({ connectionString: databaseUrl });

async function signIn(page: import("@playwright/test").Page, label: "cta" | "eligible") {
  const row = (await pool.query(`select id from users where email_normalized like $1 order by created_at desc limit 1`, [`task38-%-${label}@qa.invalid`])).rows[0];
  if (!row) throw new Error(`Missing Task 38 ${label} QA fixture`);
  const token = randomBytes(32).toString("base64url");
  const digest = createHmac("sha256", secret!).update(token).digest("hex");
  await pool.query(`insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 day')`, [row.id, digest]);
  await page.context().addCookies([{ name: "etg_session", value: token, url: "http://127.0.0.1:3100", httpOnly: true, sameSite: "Lax" }]);
}

test.afterAll(async () => { await pool.end(); });

test("eligible learner activates by explicit click and sees trial as trial", async ({ page }) => {
  await signIn(page, "cta");
  await page.goto("/pricing");
  await expect(page.getByRole("button", { name: "Dùng thử Premium 3 ngày" })).toBeVisible();
  await expect(page.getByText("Không cần thẻ", { exact: false }).first()).toBeVisible();
  await page.getByRole("button", { name: "Dùng thử Premium 3 ngày" }).click();
  await expect(page).toHaveURL(/\/billing\?trial=started/);
  await expect(page.locator("section[aria-labelledby='current-plan']").getByText("Premium dùng thử", { exact: true })).toBeVisible();
  await expect(page.locator("time[datetime]").first()).toBeVisible();
  await page.goto("/settings?section=plan");
  await expect(page.locator("section[aria-labelledby='section-title']").getByText("Premium dùng thử", { exact: true })).toBeVisible();
});

test("trial pages fit 360, 390, 430, 1024 and 1440 pixels", async ({ page }) => {
  await signIn(page, "eligible");
  for (const width of [360, 390, 430, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ["/pricing", "/billing", "/dashboard"]) {
      await page.goto(route);
      await expect(page.locator("main:not([aria-busy])").first()).toBeVisible();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, `${route} at ${width}px`).toBeLessThanOrEqual(1);
    }
  }
});
