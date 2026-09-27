import { test, expect, type Browser } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "15433" || url.pathname !== "/toeicgym_task17" || url.username !== "toeicgym_test") throw new Error("TASK36_REQUIRES_ISOLATED_DATABASE");
if (!process.env.SESSION_SECRET || process.env.SMTP_HOST) throw new Error("TASK36_REQUIRES_QA_SESSION_AND_DISABLED_SMTP");
const pool = new pg.Pool({ connectionString: url.href });
const hash = (token: string) => createHmac("sha256", process.env.SESSION_SECRET!).update(token).digest("hex");
const users: string[] = [];

async function fixture(browser: Browser, premium = false, admin = false) {
  const email = `task36-${randomBytes(8).toString("hex")}@qa.invalid`;
  const { rows: [user] } = await pool.query("insert into users(email,email_normalized,status,email_verified_at) values($1,$1,'active',now()) returning id", [email]);
  users.push(user.id);
  await pool.query("insert into profiles(id,interface_language) values($1,'vi')", [user.id]);
  if (premium) await pool.query("insert into user_plan_memberships(user_id,plan_key,source,starts_at) values($1,'PREMIUM','MANUAL',now())", [user.id]);
  if (admin) await pool.query("insert into user_roles(user_id,role) values($1,'ADMIN')", [user.id]);
  const token = randomBytes(32).toString("base64url");
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 hour')", [user.id, hash(token)]);
  const context = await browser.newContext({ bypassCSP: true, viewport: { width: 390, height: 844 } });
  await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
  return { id: user.id as string, context, page: await context.newPage() };
}
async function enabled(id: string) {
  return (await pool.query("select learning_email_enabled from profiles where id=$1", [id])).rows[0].learning_email_enabled as boolean;
}

for (const premium of [false, true]) test(`email preference persists for ${premium ? "Premium" : "Free"}`, async ({ browser }) => {
  const f = await fixture(browser, premium);
  try {
    await f.page.goto("/settings?section=email");
    await expect(f.page.locator('input[name="learningEmailEnabled"][value="false"]')).toBeChecked();
    await expect(f.page.getByText("Email xác minh và bảo mật không phụ thuộc lựa chọn này.", { exact: false })).toBeVisible();
    for (const value of [true, false]) {
      await f.page.locator(`input[name="learningEmailEnabled"][value="${value}"]`).check();
      await f.page.getByRole("button", { name: "Lưu lựa chọn" }).click();
      await expect.poll(() => enabled(f.id)).toBe(value);
      await f.page.reload();
      await expect(f.page.locator(`input[name="learningEmailEnabled"][value="${value}"]`)).toBeChecked();
    }
  } finally { await f.context.close(); }
});

test("anonymous unsubscribe requires valid single-use token; GET is safe", async ({ browser }) => {
  const f = await fixture(browser);
  await f.context.close();
  const token = randomBytes(32).toString("base64url");
  await pool.query("update profiles set learning_email_enabled=true where id=$1", [f.id]);
  await pool.query("insert into lifecycle_emails(user_id,type,window_key,status,unsubscribe_token_hash) values($1,'signup_no_learning','qa','sent',$2)", [f.id, hash(token)]);
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    await page.goto(`/unsubscribe?token=${token}`);
    expect(await enabled(f.id)).toBe(true);
    await page.getByRole("button", { name: "Hủy đăng ký email học tập" }).click();
    await expect(page.getByText("Đã tắt email học tập.", { exact: false })).toBeVisible();
    expect(await enabled(f.id)).toBe(false);
    expect((await page.request.post("/unsubscribe", { form: { token } })).status()).toBe(400);
    expect((await page.request.post("/unsubscribe", { form: { token: randomBytes(32).toString("base64url") } })).status()).toBe(400);
  } finally { await context.close(); }
});

test("admin lifecycle summary and learner authorization", async ({ browser }) => {
  const f = await fixture(browser, false, true);
  const learner = await fixture(browser);
  try {
    await f.page.goto("/admin/email");
    await expect(f.page.getByRole("heading", { name: "Email học tập", exact: true })).toBeVisible();
    await expect(f.page.locator("tbody tr")).toHaveCount(4);
    for (const name of ["Đã gửi", "Bỏ qua", "Lỗi", "Quay lại học"]) await expect(f.page.getByRole("columnheader", { name, exact: true })).toBeVisible();
    await learner.page.goto("/admin/email");
    await expect(learner.page.getByRole("heading", { name: "Email học tập", exact: true })).toHaveCount(0);
  } finally { await f.context.close(); await learner.context.close(); }
});

test.afterAll(async () => {
  if (users.length) await pool.query("delete from users where id=any($1::uuid[])", [users]);
  await pool.end();
});
