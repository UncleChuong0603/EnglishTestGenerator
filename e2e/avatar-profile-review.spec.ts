import { expect, test, type Browser } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
if (databaseUrl.hostname !== "127.0.0.1" || databaseUrl.port !== "15433" || databaseUrl.pathname !== "/toeicgym_task17" || databaseUrl.username !== "toeicgym_test") {
  throw new Error("Avatar review requires the isolated task17 database.");
}
const pool = new pg.Pool({ connectionString: databaseUrl.href });
const email = "task26b-new@qa.invalid";
const base = "http://127.0.0.1:3102";

async function signedIn(browser: Browser, width: number) {
  const user = (await pool.query("select id from users where email_normalized=$1", [email])).rows[0];
  if (!user) throw new Error("Missing isolated avatar QA user.");
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '2 hours')", [user.id, hash]);
  const context = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 } });
  await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
  return { context, page: await context.newPage(), userId: user.id as string };
}

test("avatar profile UI is responsive, bilingual, keyboard accessible, and persists safely", async ({ browser, request }) => {
  test.setTimeout(120_000);
  await mkdir(path.resolve("artifacts/avatar-profile"), { recursive: true });
  const image = await readFile(path.resolve("public/brand/toeic-gym-mark.png"));
  const original = (await pool.query("select avatar_url,interface_language,ranking_visibility from profiles where id=(select id from users where email_normalized=$1)", [email])).rows[0];
  const contexts = [];
  try {
    for (const [width, language] of [[375, "vi"], [768, "en"], [1024, "vi"], [1440, "en"]] as const) {
      await pool.query("update profiles set interface_language=$1,avatar_url=null where id=(select id from users where email_normalized=$2)", [language, email]);
      const fixture = await signedIn(browser, width); contexts.push(fixture.context);
      await fixture.page.goto(`${base}/settings?section=profile`, { waitUntil: "networkidle" });
      await expect(fixture.page.getByRole("heading", { name: language === "vi" ? "Hồ sơ" : "Profile" })).toBeVisible();
      const fileInput = fixture.page.locator('input[name="avatar"]');
      await fileInput.setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer: image });
      await expect(fixture.page.getByRole("button", { name: language === "vi" ? "Lưu ảnh" : "Save photo" })).toBeVisible();
      await fileInput.focus();
      await expect(fileInput).toBeFocused();
      expect(await fixture.page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
      await fixture.page.screenshot({ path: path.resolve(`artifacts/avatar-profile/profile-${language}-${width}.png`), fullPage: true });
    }

    const action = await signedIn(browser, 375); contexts.push(action.context);
    await pool.query("update profiles set interface_language='vi',avatar_url=null where id=$1", [action.userId]);
    await action.page.goto(`${base}/settings?section=profile`, { waitUntil: "networkidle" });
    await action.page.locator('input[name="avatar"]').setInputFiles({ name: "avatar.png", mimeType: "image/png", buffer: image });
    await action.page.getByRole("button", { name: "Lưu ảnh" }).click();
    await expect(action.page.getByRole("status")).toContainText("Đã cập nhật ảnh đại diện");
    const saved = (await pool.query("select avatar_url from profiles where id=$1", [action.userId])).rows[0].avatar_url as string;
    expect(saved).toMatch(/^http:\/\/127\.0\.0\.1:3102\/api\/profile\/avatar\/[0-9a-f-]{36}$/);
    expect((await action.context.request.get(saved, { maxRedirects: 0 })).status()).toBe(307);
    expect((await request.get(saved, { maxRedirects: 0 })).status()).toBe(404);
    await pool.query("update profiles set ranking_visibility='PUBLIC' where id=$1", [action.userId]);
    expect((await request.get(saved, { maxRedirects: 0 })).status()).toBe(307);
    const assetId = saved.split("/").at(-1);
    await action.page.getByRole("button", { name: "Xóa ảnh" }).click();
    await expect(action.page.getByRole("status")).toContainText("Đã xóa ảnh đại diện");
    expect((await pool.query("select avatar_url from profiles where id=$1", [action.userId])).rows[0].avatar_url).toBeNull();
    expect(Number((await pool.query("select count(*) from media_assets where id=$1", [assetId])).rows[0].count)).toBe(0);
  } finally {
    await Promise.all(contexts.map(context => context.close()));
    await pool.query("update profiles set avatar_url=$1,interface_language=$2,ranking_visibility=$3 where id=(select id from users where email_normalized=$4)", [original.avatar_url, original.interface_language, original.ranking_visibility, email]);
    await pool.end();
  }
});
