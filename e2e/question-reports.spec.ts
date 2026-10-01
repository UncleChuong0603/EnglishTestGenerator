import { expect, test } from "@playwright/test";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "15433" || url.pathname !== "/toeicgym_task17" || url.username !== "toeicgym_test") {
  throw new Error("Question reports QA requires the isolated task17 database.");
}

test("automatic reports support bilingual responsive review and legacy links", async ({ browser }, testInfo) => {
  test.setTimeout(240_000);
  const pool = new pg.Pool({ connectionString: url.href });
  const adminId = randomUUID();
  const groupIds = [randomUUID(), randomUUID()];
  const questionIds = [randomUUID(), randomUUID()];
  const title = `Duplicate QA ${randomUUID()}`;
  const context = await browser.newContext({ reducedMotion: "reduce" });
  try {
    const identity = (await pool.query("select current_database() as database,current_user as username")).rows[0];
    expect(identity).toEqual({ database: "toeicgym_task17", username: "toeicgym_test" });
    await pool.query("insert into users(id,email,email_normalized,status,email_verified_at) values($1,$2,$2,'active',now())", [adminId, `${adminId}@question-reports.invalid`]);
    await pool.query("insert into user_roles(user_id,role) values($1,'ADMIN')", [adminId]);
    await pool.query("insert into profiles(id,full_name,interface_language) values($1,'Question report QA','vi')", [adminId]);
    for (let index = 0; index < 2; index++) {
      await pool.query("insert into passage_sets(id,toeic_part,skill_area,set_type,title,status,provenance) values($1,5,'READING','standalone',$2,'draft','ADMIN')", [groupIds[index], `${title} ${index + 1}`]);
      await pool.query("insert into questions(id,toeic_part,skill_area,question_type,skill,sub_skill,difficulty,question_text,passage_set_id,status) values($1,5,'READING','standalone','grammar','verb_tense','easy',$2,$3,'draft')", [questionIds[index], `The ${title} team will submit the quarterly report on Friday.`, groupIds[index]]);
      const optionId = randomUUID();
      await pool.query("insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,'A','Friday afternoon',1)", [optionId, questionIds[index]]);
      await pool.query("insert into question_solutions(question_id,correct_option_id,explanation_en) values($1,$2,'The date is given in the sentence.')", [questionIds[index], optionId]);
    }
    const token = randomBytes(32).toString("base64url");
    const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
    await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 hour')", [adminId, hash]);
    await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
    const page = await context.newPage();
    const browserErrors: string[] = [];
    page.on("pageerror", (error) => browserErrors.push(error.message));
    for (const language of ["vi", "en"] as const) {
      await pool.query("update profiles set interface_language=$1 where id=$2", [language, adminId]);
      for (const width of [375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 1000 });
        await page.goto("/admin/content/reports?part=5&type=DUPLICATE&status=OPEN", { waitUntil: "networkidle" });
        await expect(page.getByRole("heading", { name: language === "vi" ? "Báo lỗi câu hỏi" : "Question reports", exact: true })).toBeVisible();
        await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
        const card = page.locator("article").filter({ has: page.getByRole("heading", { name: `${title} 1`, exact: true }) }).filter({ has: page.getByRole("heading", { name: `${title} 2`, exact: true }) });
        await expect(card).toHaveCount(1);
        await expect(card).toContainText("100%");
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
        await expect(page.locator('a[href="/admin/content/similarity"]')).toHaveCount(0);
        const filterButton = page.getByRole("button", { name: /^(Bộ lọc|Filters)/ });
        await filterButton.focus();
        await page.keyboard.press("Enter");
        await expect(filterButton).toHaveAttribute("aria-expanded", "true");
        await page.keyboard.press("Tab");
        const focused = page.locator(":focus");
        expect(await focused.evaluate((element) => Number.parseFloat(getComputedStyle(element).outlineWidth))).toBeGreaterThan(0);
        await expect(page.getByLabel(language === "vi" ? "Loại báo cáo" : "Report type", { exact: true })).toHaveValue("DUPLICATE");
        await page.screenshot({ path: testInfo.outputPath(`reports-${language}-${width}.png`) });
        await card.screenshot({ path: testInfo.outputPath(`report-card-${language}-${width}.png`) });
      }
    }
    await page.goto("/admin/content/similarity?part=5", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/admin\/content\/reports\?.*type=DUPLICATE.*part=5/);
    const exactCard = page.locator("article").filter({ has: page.getByRole("heading", { name: `${title} 1`, exact: true }) }).filter({ has: page.getByRole("heading", { name: `${title} 2`, exact: true }) });
    await exactCard.getByLabel("Review status").selectOption("DISMISSED");
    await exactCard.getByRole("button", { name: "Save status", exact: true }).click();
    await expect(page.getByText("Report status updated.", { exact: true })).toBeVisible();
    const stored = (await pool.query("select status from question_issue_reports where primary_group_id=any($1::uuid[]) and related_group_id=any($1::uuid[])", [groupIds])).rows;
    expect(stored).toEqual([{ status: "DISMISSED" }]);
    await page.goto("/admin/content/reports?part=5&type=DUPLICATE&status=DISMISSED", { waitUntil: "networkidle" });
    await expect(exactCard).toHaveCount(1);
    await page.goto("/admin/content/reports?part=5&type=MEDIA_ERROR&status=OPEN", { waitUntil: "networkidle" });
    await expect(page.getByRole("heading", { name: "No matching reports" })).toBeVisible();
    await page.getByRole("button", { name: /^Filters/ }).click();
    await page.getByLabel("Report type", { exact: true }).selectOption("DUPLICATE");
    await page.getByRole("button", { name: "Apply", exact: true }).click();
    await expect(page).toHaveURL(/type=DUPLICATE/);
    await expect(page.getByText(/matching reports$/)).toBeVisible();
    expect(browserErrors).toEqual([]);
  } finally {
    await context.close();
    await pool.query("delete from question_solutions where question_id=any($1::uuid[])", [questionIds]);
    await pool.query("delete from question_options where question_id=any($1::uuid[])", [questionIds]);
    await pool.query("delete from questions where id=any($1::uuid[])", [questionIds]);
    await pool.query("delete from passage_sets where id=any($1::uuid[])", [groupIds]);
    await pool.query("delete from admin_audit_logs where actor_user_id=$1", [adminId]);
    await pool.query("delete from user_roles where user_id=$1", [adminId]);
    await pool.query("delete from users where id=$1", [adminId]);
    await pool.end();
  }
});
