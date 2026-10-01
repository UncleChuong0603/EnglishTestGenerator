import { test, expect, type BrowserContext } from "@playwright/test";
import { randomUUID, randomBytes, createHmac } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
if (process.env.TASK42_QA !== "isolated-task42" || url.hostname !== "task42-postgres" || url.pathname !== "/toeicgym_task42") throw new Error("Refusing non-isolated QA database");
const pool = new pg.Pool({ connectionString: url.href });
async function login(context: BrowserContext, locale = "en") {
  const id = randomUUID(), email = id + "@task42.invalid", raw = randomBytes(32).toString("base64url");
  await pool.query("insert into users(id,email,email_normalized,status,email_verified_at) values($1,$2,$2,'active',now())", [id,email]);
  await pool.query("insert into profiles(id,full_name,interface_language) values($1,'QA learner',$2)", [id,locale]);
  await pool.query("insert into learner_goals(user_id,target_score) values($1,750)", [id]);
  const hashed = createHmac("sha256",process.env.SESSION_SECRET!).update(raw).digest("hex");
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '30 days')", [id,hashed]);
  await context.addCookies([
    { name: "etg_session", value: raw, url: "http://127.0.0.1:30442", httpOnly:true, sameSite:"Lax" },
    { name: "toeic_interface_language", value:locale, url:"http://127.0.0.1:30442" },
  ]);
  return {id,email,raw};
}
test.afterAll(async () => pool.end());
test("anonymous routes are protected", async ({page, request}) => {
  await page.goto("/settings?section=data");
  await expect(page).toHaveURL(/sign-in/);
  expect((await request.get("/api/account/data-export")).status()).toBe(401);
});

for (const locale of ["en","vi"]) for (const width of [375,768,1024,1440]) {
  test("layout and keyboard " + locale + " " + width, async ({page,context}, testInfo) => {
    await login(context,locale);
    await page.setViewportSize({width,height:1000});
    await page.goto("/settings?section=data");
    await expect(page.getByRole("heading",{name:locale==="en"?"Export learning data":"Xuất dữ liệu học tập"})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator(".feedback-widget")).toBeHidden();
    const input = page.locator("#confirmationEmail");
    await input.focus();
    await expect(input).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.locator('input[name="acknowledge"]')).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button",{name:locale==="en"?"Permanently delete account":"Xóa vĩnh viễn tài khoản",exact:true})).toBeFocused();
    await page.screenshot({path:testInfo.outputPath("account-data-"+locale+"-"+width+".png"),fullPage:true});
    await page.goto("/account-deleted");
    await expect(page.getByRole("heading",{name:locale==="en"?"Account deleted":"Tài khoản đã được xóa",exact:true})).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.screenshot({path:testInfo.outputPath("deleted-"+locale+"-"+width+".png"),fullPage:true});
  });
}

test("export download, explicit confirmation and every-session invalidation", async ({page,context,browser}) => {
  const owner = await login(context);
  const otherDevice = await browser.newContext();
  await otherDevice.addCookies([{name:"etg_session",value:owner.raw,url:"http://127.0.0.1:30442",httpOnly:true}]);
  await page.goto("/settings?section=data");
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button",{name:"Download JSON data",exact:true}).click();
  const download = await downloadPromise;
  const payload = JSON.parse(await readFile((await download.path())!,"utf8"));
  expect(payload.account.id).toBe(owner.id);
  expect(payload.learningGoal.targetScore).toBe(750);
  expect(JSON.stringify(payload)).not.toContain(owner.raw);
  await page.locator("#confirmationEmail").fill("wrong@task42.invalid");
  await page.locator('input[name="acknowledge"]').check();
  await page.getByRole("button",{name:"Permanently delete account",exact:true}).click();
  const confirmationError = page.locator('form p[role="alert"]');
  await expect(confirmationError).toContainText("does not match");
  await expect(confirmationError).toBeFocused();
  expect((await pool.query("select status from users where id=$1",[owner.id])).rows[0].status).toBe("active");
  await page.locator("#confirmationEmail").fill(owner.email);
  await page.locator('input[name="acknowledge"]').check();
  await page.getByRole("button",{name:"Permanently delete account",exact:true}).click();
  await expect(page).toHaveURL(/account-deleted/);
  expect((await otherDevice.request.get("http://127.0.0.1:30442/api/account/data-export")).status()).toBe(401);
  expect((await pool.query("select count(*)::int as n from user_sessions where user_id=$1",[owner.id])).rows[0].n).toBe(0);
  expect((await pool.query("select count(*)::int as n from learner_goals where user_id=$1",[owner.id])).rows[0].n).toBe(0);
  await otherDevice.close();
});

test("existing learner screens and practice remain reachable", async ({page,context}) => {
  await login(context);
  for (const route of ["/dashboard","/practice","/mistakes","/vocabulary","/progress","/full-mock","/settings?section=security"]) {
    const response = await page.goto(route);
    expect(response?.status()).toBeLessThan(400);
    await expect(page).not.toHaveURL(/sign-in/);
  }
});
