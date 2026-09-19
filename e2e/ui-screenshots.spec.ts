import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const root = path.resolve("artifacts/ui-screenshots");
const password = "Ui-review-2026!";
const records: Array<{ image: string; route: string; state: string; viewport: string; description: string }> = [];
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function shot(page: Page, folder: string, name: string, route: string, state: string, mobile = false, description = "") {
  await page.setViewportSize(mobile ? { width: 390, height: 844 } : { width: 1440, height: 1000 });
  await page.goto(route, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(350);
  await page.addStyleTag({ content: "*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important}" });
  const relative = `${folder}/${name}.png`;
  await mkdir(path.join(root, folder), { recursive: true });
  await page.screenshot({ path: path.join(root, relative), fullPage: true, animations: "disabled" });
  records.push({ image: relative, route, state, viewport: mobile ? "390×844" : "1440×1000", description });
}

async function signIn(page: Page, email: string) {
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await page.locator('button[type="submit"]').click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function contextFor(browser: Browser, email: string) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await signIn(page, email);
  return { context, page };
}

async function practiceSession(email: string, part: 5 | 6 | 7, submitted = false) {
  const user = (await pool.query(`select id from users where email_normalized=$1`, [email])).rows[0];
  await pool.query(`update practice_sessions set status='abandoned' where user_id=$1 and status='in_progress'`, [user.id]);
  const selected = (await pool.query(
    `select q.id,q.passage_set_id from questions q where q.status='published' and q.toeic_part=$1 order by q.question_order,q.id limit $2`,
    [part, part === 5 ? 5 : part === 6 ? 4 : 5],
  )).rows;
  const session = (await pool.query(
    `insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total)
     values($1,'READING',$2,$3,$4,$5,$5,'custom',$6,$7,$8) returning id`,
    [user.id, `part_${part}`, part, submitted ? "submitted" : "in_progress", selected.length, submitted ? new Date() : null, submitted ? Math.max(1, selected.length - 1) : null, submitted ? selected.length : null],
  )).rows[0];
  for (const [index, q] of selected.entries()) {
    await pool.query(`insert into practice_session_questions(session_id,question_id,display_order,passage_set_id) values($1,$2,$3,$4)`, [session.id, q.id, index + 1, q.passage_set_id]);
    if (submitted) {
      const option = (await pool.query(
        index === 0
          ? `select qo.id from question_options qo join question_solutions qs on qs.question_id=qo.question_id and qs.correct_option_id<>qo.id where qo.question_id=$1 limit 1`
          : `select correct_option_id id from question_solutions where question_id=$1`,
        [q.id],
      )).rows[0];
      await pool.query(`insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,$5,now())`, [session.id, user.id, q.id, option.id, index !== 0]);
    }
  }
  return session.id as string;
}

test("export complete user-facing UI", async ({ browser, page }) => {
  test.setTimeout(900_000);
  await mkdir(root, { recursive: true });

  await shot(page, "public", "public-home-desktop", "/", "Anonymous", false, "Trang chủ đầy đủ header/footer");
  await shot(page, "mobile", "public-home-mobile", "/", "Anonymous", true, "Trang chủ mobile");
  await shot(page, "public", "public-pricing-desktop", "/pricing", "Anonymous", false, "Bảng giá công khai");
  await shot(page, "mobile", "public-pricing-mobile", "/pricing", "Anonymous", true, "Bảng giá mobile");
  await shot(page, "public", "public-try-desktop", "/try", "Anonymous", false, "Trang dùng thử");
  await shot(page, "public", "public-privacy-desktop", "/privacy", "Anonymous", false, "Chính sách bảo mật");
  await shot(page, "public", "public-terms-desktop", "/terms", "Anonymous", false, "Điều khoản");
  await shot(page, "blog", "blog-index-desktop", "/blog", "Published fixture", false, "Danh sách bài viết");
  await shot(page, "mobile", "blog-index-mobile", "/blog", "Published fixture", true, "Danh sách blog mobile");
  await shot(page, "blog", "blog-article-desktop", "/blog/chien-luoc-toeic-part-5-ui-review", "Published fixture", false, "Bài blog có heading/list/link/tag/CTA");
  await shot(page, "mobile", "blog-article-mobile", "/blog/chien-luoc-toeic-part-5-ui-review", "Published fixture", true, "Bài blog mobile");

  for (const [name, route, description] of [
    ["auth-sign-in-desktop", "/sign-in", "Đăng nhập"], ["auth-sign-up-desktop", "/sign-up", "Đăng ký"],
    ["auth-forgot-password-desktop", "/forgot-password", "Quên mật khẩu"], ["auth-reset-password-desktop", "/reset-password", "Đặt lại mật khẩu"],
    ["auth-verify-email-desktop", "/verify-email", "Xác minh email"], ["auth-activate-account-desktop", "/activate-account", "Kích hoạt tài khoản"],
  ] as const) await shot(page, "auth", name, route, "Default", false, description);
  await shot(page, "mobile", "auth-sign-in-mobile", "/sign-in", "Default", true, "Đăng nhập mobile");
  await shot(page, "public", "system-404-desktop", "/ui-review-route-does-not-exist", "404", false, "Trang không tìm thấy");

  const free = await contextFor(browser, "free.learner@ui.invalid");
  await shot(free.page, "learner-free", "free-dashboard-desktop", "/dashboard", "FREE with progress", false, "Dashboard FREE");
  await shot(free.page, "mobile", "free-dashboard-mobile", "/dashboard", "FREE with progress", true, "Dashboard FREE mobile");
  await shot(free.page, "learner-free", "free-practice-setup-desktop", "/practice", "FREE", false, "Thiết lập Listening/Reading");
  await shot(free.page, "diagnostic", "diagnostic-start-desktop", "/diagnostic", "FREE", false, "Giới thiệu diagnostic");
  await shot(free.page, "mistakes", "mistake-bank-desktop", "/mistakes", "FREE with unresolved/mastered fixtures", false, "Mistake Bank và mastery");
  await shot(free.page, "learner-free", "progress-desktop", "/progress", "FREE with progress", false, "Tiến độ học tập");
  await shot(free.page, "ranking", "ranking-desktop", "/ranking", "FREE ranked fixture", false, "Bảng xếp hạng tuần");
  await shot(free.page, "mobile", "ranking-mobile", "/ranking", "FREE ranked fixture", true, "Ranking mobile");
  await shot(free.page, "ranking", "ranked-challenge-empty-desktop", "/ranking?tab=READING_100", "No active challenge", false, "Trạng thái challenge trống");
  await shot(free.page, "billing", "free-billing-desktop", "/billing", "FREE", false, "Billing FREE");
  await shot(free.page, "settings", "free-settings-desktop", "/settings", "FREE", false, "Settings FREE");
  await shot(free.page, "learner-free", "free-pricing-desktop", "/pricing", "Authenticated FREE", false, "Pricing khi đăng nhập FREE");
  await shot(free.page, "full-mock", "full-mock-landing-unavailable-desktop", "/full-mock", "Content bank unavailable", false, "Full Mock landing theo trạng thái thật");

  await free.page.setViewportSize({ width: 1440, height: 1000 });
  await free.page.goto("/dashboard");
  await free.page.locator("details").last().locator("summary").click();
  await free.page.screenshot({ path: path.join(root, "learner-free/free-account-dropdown-desktop.png"), fullPage: false });
  records.push({ image: "learner-free/free-account-dropdown-desktop.png", route: "/dashboard", state: "FREE account menu", viewport: "1440×1000", description: "Menu tài khoản FREE" });

  for (const part of [5, 6, 7] as const) {
    const id = await practiceSession("free.learner@ui.invalid", part);
    await shot(free.page, "practice", `practice-part${part}-desktop`, `/practice/${id}`, `Reading Part ${part} active`, false, `Bố cục Part ${part}`);
    if (part === 5) await shot(free.page, "mobile", "practice-part5-mobile", `/practice/${id}`, "Reading Part 5 active", true, "Practice mobile");
    await pool.query(`update practice_sessions set status='abandoned' where id=$1`, [id]);
  }
  const resultId = await practiceSession("free.learner@ui.invalid", 5, true);
  await shot(free.page, "practice", "practice-result-desktop", `/practice/${resultId}/results`, "Completed with one incorrect", false, "Kết quả và giải thích");
  await free.context.close();

  const premium = await contextFor(browser, "premium.learner@ui.invalid");
  await shot(premium.page, "learner-premium", "premium-dashboard-desktop", "/dashboard", "PREMIUM with progress", false, "Dashboard PREMIUM");
  await shot(premium.page, "mobile", "premium-dashboard-mobile", "/dashboard", "PREMIUM with progress", true, "Dashboard PREMIUM mobile");
  await shot(premium.page, "billing", "premium-billing-desktop", "/billing", "PREMIUM", false, "Billing PREMIUM");
  await shot(premium.page, "mobile", "premium-billing-mobile", "/billing", "PREMIUM", true, "Billing PREMIUM mobile");
  await shot(premium.page, "settings", "premium-settings-desktop", "/settings", "PREMIUM", false, "Settings PREMIUM");
  await shot(premium.page, "mobile", "premium-settings-mobile", "/settings", "PREMIUM", true, "Settings mobile");
  await shot(premium.page, "learner-premium", "premium-pricing-desktop", "/pricing", "Authenticated PREMIUM", false, "Pricing PREMIUM");
  await premium.page.setViewportSize({ width: 1440, height: 1000 });
  await premium.page.goto("/dashboard");
  await premium.page.locator("details").last().locator("summary").click();
  await premium.page.screenshot({ path: path.join(root, "learner-premium/premium-account-dropdown-desktop.png"), fullPage: false });
  records.push({ image: "learner-premium/premium-account-dropdown-desktop.png", route: "/dashboard", state: "PREMIUM account menu", viewport: "1440×1000", description: "Menu tài khoản PREMIUM" });
  await premium.context.close();

  const header = `# TOEICGym UI Screenshot Index\n\nGenerated from the current rendered application using isolated test fixtures. Admin UI is excluded.\n\n| Image | Route | State | Viewport | Description |\n| --- | --- | --- | --- | --- |\n`;
  await writeFile(path.join(root, "README.md"), header + records.map(r => `| [${r.image}](${r.image}) | \`${r.route}\` | ${r.state} | ${r.viewport} | ${r.description} |`).join("\n") + "\n");
  const groups = [...new Set(records.map(r => r.image.split("/")[0]))];
  const html = `<!doctype html><meta charset="utf-8"><title>TOEICGym UI Gallery</title><style>body{font-family:system-ui;margin:24px;background:#e2e8f0;color:#0f172a}h1,h2{margin:24px 0 12px}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}figure{margin:0;background:white;padding:12px;border-radius:12px}img{width:100%;height:260px;object-fit:contain;background:#f8fafc}figcaption{font-weight:700;margin-top:8px;overflow-wrap:anywhere}</style><h1>TOEICGym UI Gallery</h1>${groups.map(g => `<h2>${g}</h2><div class="grid">${records.filter(r=>r.image.startsWith(g+"/")).map(r=>`<figure><a href="${r.image}"><img loading="lazy" src="${r.image}"></a><figcaption>${r.image}<br><small>${r.route} · ${r.state} · ${r.viewport}</small></figcaption></figure>`).join("")}</div>`).join("")}`;
  await writeFile(path.join(root, "index.html"), html);

  for (const [contactName, filter] of [
    ["contact-public", (r: typeof records[number]) => ["public", "auth", "blog"].includes(r.image.split("/")[0]) && r.viewport.startsWith("1440")],
    ["contact-learner", (r: typeof records[number]) => ["learner-free", "practice", "diagnostic", "mistakes", "ranking", "full-mock"].includes(r.image.split("/")[0])],
    ["contact-premium", (r: typeof records[number]) => r.image.includes("premium") && r.viewport.startsWith("1440")],
    ["contact-mobile", (r: typeof records[number]) => r.viewport.startsWith("390")],
  ] as const) {
    const selected = records.filter(filter).slice(0, 16);
    const cards = await Promise.all(selected.map(async r => `<figure><img src="data:image/png;base64,${(await readFile(path.join(root, r.image))).toString("base64")}"><figcaption>${r.image}</figcaption></figure>`));
    const contact = await browser.newPage({ viewport: { width: 1400, height: 1000 } });
    await contact.setContent(`<style>body{margin:20px;font:14px system-ui;background:#cbd5e1}.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}figure{margin:0;background:#fff;padding:8px;border-radius:8px}img{width:100%;height:190px;object-fit:contain}figcaption{font-weight:700;overflow-wrap:anywhere}</style><h1>${contactName}</h1><div class="grid">${cards.join("")}</div>`);
    await contact.screenshot({ path: path.join(root, `${contactName}.png`), fullPage: true });
    await contact.close();
  }
});

test.afterAll(async () => { await pool.end(); });
