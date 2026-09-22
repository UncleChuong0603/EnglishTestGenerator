import { expect, test, type Browser } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
async function signedIn(browser: Browser, name: string, width: number) {
  const context = await browser.newContext({ viewport: { width, height: width < 500 ? 844 : 1000 } });
  const user = (await pool.query("select id from users where email_normalized=$1", [`task28b-${name}@qa.invalid`])).rows[0];
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '2 hours')", [user.id, hash]);
  await context.addCookies([{ name: "etg_session", value: token, domain: "app", path: "/", httpOnly: true, sameSite: "Lax" }]);
  return { context, userId: user.id as string };
}
const noOverflow = async (page: import("@playwright/test").Page) => expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

test("learner eligibility, responsive prompt and save both", async ({ browser }) => {
  test.setTimeout(180_000);
  const eligibleUser=(await pool.query("select id from users where email_normalized='task28b-eligible@qa.invalid'")).rows[0]; await pool.query("delete from learner_contexts where user_id=$1",[eligibleUser.id]);
  for (const width of [360,390,430]) {
    const { context } = await signedIn(browser,"eligible",width); const page=await context.newPage(); await page.goto("http://app:3000/dashboard",{waitUntil:"networkidle"});
    const hero=page.locator("#today-workout"); const prompt=page.getByRole("heading",{name:"Giúp TOEICGym hiểu mục tiêu của bạn"});
    await expect(hero).toBeVisible(); await expect(prompt).toBeVisible(); expect((await prompt.boundingBox())!.y).toBeGreaterThan((await hero.boundingBox())!.y); await noOverflow(page); await context.close();
  }
  const {context}=await signedIn(browser,"inactive",390); const page=await context.newPage(); await page.goto("http://app:3000/dashboard"); await expect(page.getByRole("heading",{name:"Giúp TOEICGym hiểu mục tiêu của bạn"})).toHaveCount(0); await context.close();
  const diagnostic=await signedIn(browser,"diagnostic-only",390); const diagnosticPage=await diagnostic.context.newPage(); await diagnosticPage.goto("http://app:3000/dashboard"); await expect(diagnosticPage.getByRole("heading",{name:"Giúp TOEICGym hiểu mục tiêu của bạn"})).toHaveCount(0); await diagnostic.context.close();
  const active=await signedIn(browser,"eligible",390); await pool.query("delete from learner_contexts where user_id=$1",[active.userId]); const save=await active.context.newPage(); await save.goto("http://app:3000/dashboard"); await save.getByLabel("Xin việc / phục vụ công việc").check(); await save.getByLabel("Facebook Group").check(); await save.getByRole("button",{name:"Lưu",exact:true}).click(); await expect.poll(async()=>Number((await pool.query("select count(*) from learner_contexts where user_id=$1 and study_purpose='JOB_CAREER' and acquisition_source='FACEBOOK_GROUP'",[active.userId])).rows[0].count)).toBe(1); await save.reload(); await expect(save.getByRole("heading",{name:"Giúp TOEICGym hiểu mục tiêu của bạn"})).toHaveCount(0); await active.context.close();
});

test("partial saves, OTHER clearing, skip and settings preserve goals", async ({ browser }) => {
  test.setTimeout(180_000); await pool.query("delete from learner_contexts where user_id in (select id from users where email_normalized in ('task28b-purpose-only@qa.invalid','task28b-source-only@qa.invalid','task28b-skip@qa.invalid'))");
  const partial=await signedIn(browser,"purpose-only",390); let page=await partial.context.newPage(); await page.goto("http://app:3000/dashboard"); await page.getByLabel("Chuẩn đầu ra").check(); await page.getByRole("button",{name:"Lưu",exact:true}).click(); expect((await pool.query("select study_purpose,acquisition_source from learner_contexts where user_id=$1",[partial.userId])).rows[0]).toMatchObject({study_purpose:"GRADUATION_REQUIREMENT",acquisition_source:null}); await partial.context.close();
  const source=await signedIn(browser,"source-only",390); page=await source.context.newPage(); await page.goto("http://app:3000/dashboard"); await page.getByLabel("Google").check(); await page.getByRole("button",{name:"Lưu",exact:true}).click(); expect((await pool.query("select study_purpose,acquisition_source from learner_contexts where user_id=$1",[source.userId])).rows[0]).toMatchObject({study_purpose:null,acquisition_source:"GOOGLE"}); await source.context.close();
  const other=await signedIn(browser,"xss",390); page=await other.context.newPage(); await page.goto("http://app:3000/settings?section=context"); await page.getByLabel("Xin việc / phục vụ công việc").check(); await page.getByLabel("Google").check(); await page.getByRole("button",{name:"Lưu",exact:true}).click(); expect((await pool.query("select study_purpose_other,acquisition_source_other from learner_contexts where user_id=$1",[other.userId])).rows[0]).toMatchObject({study_purpose_other:null,acquisition_source_other:null}); await noOverflow(page); await other.context.close();
  const skip=await signedIn(browser,"skip",390); page=await skip.context.newPage(); await page.goto("http://app:3000/dashboard"); await page.getByRole("button",{name:"Bỏ qua lúc này"}).click(); await page.reload(); await expect(page.getByRole("heading",{name:"Giúp TOEICGym hiểu mục tiêu của bạn"})).toHaveCount(0); await page.goto("http://app:3000/settings?section=context"); await expect(page.getByRole("heading",{name:"Thông tin học tập"})).toBeVisible(); await skip.context.close();
  const goal=await signedIn(browser,"goal",1024); page=await goal.context.newPage(); const before=(await pool.query("select * from learner_goals where user_id=$1",[goal.userId])).rows[0]; await page.goto("http://app:3000/settings?section=context"); await page.getByLabel("Cải thiện tiếng Anh").check(); await page.getByRole("button",{name:"Lưu",exact:true}).click(); const after=(await pool.query("select * from learner_goals where user_id=$1",[goal.userId])).rows[0]; expect(after).toMatchObject({target_score:before.target_score,exam_date:before.exam_date,daily_study_minutes:before.daily_study_minutes,study_days_per_week:before.study_days_per_week}); await goal.context.close();
});

test("free and premium use the same context surface", async ({browser})=>{for(const name of ["partial","premium"]){const {context}=await signedIn(browser,name,390);const page=await context.newPage();await page.goto("http://app:3000/settings?section=context");await expect(page.getByRole("heading",{name:"Thông tin học tập"})).toBeVisible();await context.close();}});

test("admin detail, aggregates, escaping, responsive layout and authorization", async ({browser,page})=>{
  test.setTimeout(180_000); const target=(await pool.query("select id from users where email_normalized='task28b-other@qa.invalid'")).rows[0];
  for(const width of [390,1024,1440]){const {context}=await signedIn(browser,"admin",width);const admin=await context.newPage();await admin.goto(`http://app:3000/admin/users/${target.id}?tab=learning`,{waitUntil:"networkidle"});await expect(admin.getByRole("heading",{name:"Thông tin người học"})).toBeVisible();await expect(admin.getByText("Trường yêu cầu chứng chỉ")).toBeVisible();await expect(admin.getByText("<img src=x onerror=alert(1)>")).toBeVisible();expect(await admin.locator("img[src='x']").count()).toBe(0);await noOverflow(admin);await admin.goto("http://app:3000/admin/analytics",{waitUntil:"networkidle"});await expect(admin.getByRole("heading",{name:"Bối cảnh người học"})).toBeVisible();await expect(admin.getByRole("listitem").filter({hasText:"Chuẩn đầu ra"})).toContainText("2");await expect(admin.getByRole("listitem").filter({hasText:"Xin việc / phục vụ công việc"})).toContainText("3");await expect(admin.getByRole("listitem").filter({hasText:"Facebook Group"})).toContainText("2");await expect(admin.getByRole("listitem").filter({hasText:"Google"})).toContainText("2");await noOverflow(admin);await context.close();}
  await page.goto("http://app:3000/admin/analytics");await expect(page).toHaveURL(/sign-in/);const learner=await signedIn(browser,"partial",390);const denied=await learner.context.newPage();await denied.goto("http://app:3000/admin/analytics");await expect(denied).toHaveURL(/admin\/access-denied/);await learner.context.close();
});

test.afterAll(async()=>pool.end());
