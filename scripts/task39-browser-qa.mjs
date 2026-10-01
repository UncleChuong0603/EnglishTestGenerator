import assert from "node:assert/strict";
import { createHmac, randomBytes, randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import pg from "pg";
import { chromium } from "playwright";

const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
assert.deepEqual(
  { host: databaseUrl.hostname, port: databaseUrl.port, database: databaseUrl.pathname, user: databaseUrl.username },
  { host: "127.0.0.1", port: "15433", database: "/toeicgym_task17", user: "toeicgym_test" },
  "Task 39 browser QA refuses every database except the isolated QA database.",
);
const baseUrl = new URL(process.env.TASK39_BASE_URL ?? "");
assert.deepEqual(
  { protocol: baseUrl.protocol, host: baseUrl.hostname, port: baseUrl.port },
  { protocol: "http:", host: "127.0.0.1", port: "3139" },
  "Task 39 browser QA refuses a non-local application URL.",
);
const sessionSecret = process.env.SESSION_SECRET ?? "";
assert.ok(sessionSecret.length >= 32, "SESSION_SECRET must match the isolated app.");

const pool = new pg.Pool({ connectionString: databaseUrl.href });
const widths = [360, 390, 430, 768, 1024, 1440];
const report = { viewports: {}, plans: {}, routes: {}, interactions: {} };

async function createUser(label, plan = "FREE") {
  const email = `task39-${label}@qa.invalid`;
  const user = (await pool.query(
    `insert into users(email,email_normalized,email_verified_at,status)
     values($1,$1,now(),'active') returning id`,
    [email],
  )).rows[0];
  await pool.query(
    `insert into profiles(id,full_name,interface_language,explanation_language,ranking_visibility)
     values($1,$2,'vi','both','HIDDEN')`,
    [user.id, `Task 39 ${label}`],
  );
  if (plan !== "FREE") await pool.query(
    `insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at)
     values($1,'PREMIUM',$2,now()-interval '1 day',now()+interval '2 days')`,
    [user.id, plan === "TRIAL" ? "TRIAL" : "MANUAL"],
  );
  return { id: user.id, email };
}

async function readingQuestions(part, count) {
  if (part === 5) return (await pool.query(
    `select q.id, q.passage_set_id
     from questions q
     join question_options qo on qo.question_id=q.id
     where q.status='published' and q.toeic_part=5
     group by q.id, q.passage_set_id
     order by max(length(qo.option_text)) desc, q.id
     limit $1`,
    [count],
  )).rows;
  const set = (await pool.query(
    `select ps.id
     from passage_sets ps
     join questions q on q.passage_set_id=ps.id and q.status='published'
     join passages p on p.passage_set_id=ps.id and p.status='published'
     where ps.status='published' and ps.toeic_part=$1
     group by ps.id
     having count(distinct q.id) >= $2 and count(distinct p.id) >= 1
     order by ps.id limit 1`,
    [part, count],
  )).rows[0];
  assert.ok(set, `Missing Part ${part} passage set`);
  return (await pool.query(
    `select id, passage_set_id from questions
     where status='published' and toeic_part=$1 and passage_set_id=$2
     order by question_order,id limit $3`,
    [part, set.id, count],
  )).rows;
}

async function createPractice(userId, part, { count = part === 5 ? 5 : 4, submitted = false } = {}) {
  const selected = await readingQuestions(part, count);
  assert.equal(selected.length, count, `Part ${part} fixture count`);
  const session = (await pool.query(
    `insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total)
     values($1,'READING',$2,$3,$4,$5,$5,'custom',$6,$7,$8) returning id`,
    [userId, `part_${part}`, part, submitted ? "submitted" : "in_progress", count, submitted ? new Date() : null, submitted ? count - 1 : null, submitted ? count : null],
  )).rows[0];
  for (const [index, question] of selected.entries()) {
    await pool.query(
      `insert into practice_session_questions(session_id,question_id,display_order,passage_set_id)
       values($1,$2,$3,$4)`,
      [session.id, question.id, index + 1, part === 5 ? null : question.passage_set_id],
    );
    if (submitted) {
      const solution = (await pool.query(
        `select qs.correct_option_id,
                (select id from question_options where question_id=$1 and id<>qs.correct_option_id order by display_order limit 1) wrong_option_id
         from question_solutions qs where qs.question_id=$1`,
        [question.id],
      )).rows[0];
      const isCorrect = index !== 0;
      await pool.query(
        `insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at)
         values($1,$2,$3,$4,$5,now())`,
        [session.id, userId, question.id, isCorrect ? solution.correct_option_id : solution.wrong_option_id, isCorrect],
      );
    }
  }
  return session.id;
}

async function createListening(userId) {
  const audioCandidates = [
    "audio/L-P1-PROD-001.mp3",
    "audio/L-P1-BANK-007.mp3",
    "audio/L-P2-BANK-001.mp3",
    "audio/L-P2-BANK-007.mp3",
    "audio/L-P2-PROD-001.mp3",
  ];
  const storageKey = audioCandidates.find((candidate) => existsSync(`/app/content/listening/${candidate}`));
  assert.ok(storageKey, "No authored Listening audio is available in the isolated checkout.");
  const setId = randomUUID();
  const questionId = randomUUID();
  let mediaId = (await pool.query("select id from media_assets where storage_key=$1", [storageKey])).rows[0]?.id;
  if (!mediaId) mediaId = randomUUID();
  await pool.query(
    `insert into passage_sets(id,toeic_part,skill_area,set_type,title,status)
     values($1,2,'LISTENING','question_response','Task 39 listening fixture','published')`,
    [setId],
  );
  await pool.query(
    `insert into questions(id,toeic_part,skill_area,question_type,response_type,skill,sub_skill,difficulty,question_text,status,passage_set_id,question_order)
     values($1,2,'LISTENING','question_response','MULTIPLE_CHOICE','listening','response_intent','medium','[Spoken prompt and responses only]','published',$2,1)`,
    [questionId, setId],
  );
  const optionIds = [];
  for (const [index, text] of ["At the front desk.", "Tomorrow afternoon.", "Yes, I sent it."].entries()) {
    const optionId = randomUUID();
    optionIds.push(optionId);
    await pool.query(
      `insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,$3,$4,$5)`,
      [optionId, questionId, String.fromCharCode(65 + index), text, index + 1],
    );
  }
  await pool.query(
    `insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi)
     values($1,$2,'The time response directly answers when.','Câu trả lời về thời gian đáp trực tiếp câu hỏi khi nào.')`,
    [questionId, optionIds[1]],
  );
  await pool.query(
    `insert into listening_transcripts(question_group_id,content)
     values($1,'Task 39 transcript sentinel: When will the shipment arrive?')`,
    [setId],
  );
  await pool.query(
    `insert into media_assets(id,kind,access_scope,storage_provider,storage_key,mime_type,byte_size,checksum,status)
     values($1,'AUDIO','CONTENT','LOCAL',$2,'audio/mpeg',1,$3,'READY')
     on conflict(storage_key) do nothing`,
    [mediaId, storageKey, "0".repeat(64)],
  );
  await pool.query(
    `insert into question_group_media(question_group_id,media_asset_id,role,position,alt_text)
     values($1,$2,'AUDIO',1,'TOEIC Listening audio')`,
    [setId, mediaId],
  );
  const session = (await pool.query(
    `insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source)
     values($1,'LISTENING','part_2',2,'in_progress',1,1,'custom') returning id`,
    [userId],
  )).rows[0];
  await pool.query(
    `insert into practice_session_questions(session_id,question_id,display_order,passage_set_id) values($1,$2,1,$3)`,
    [session.id, questionId, setId],
  );
  return session.id;
}

async function createMock(userId) {
  const questions = await readingQuestions(5, 2);
  const run = (await pool.query(
    `insert into full_mock_runs(user_id,mode,status,reading_started_at,reading_deadline)
     values($1,'READING','READING',now(),now()+interval '75 minutes') returning id`,
    [userId],
  )).rows[0];
  const session = (await pool.query(
    `insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,full_mock_run_id,full_mock_order)
     values($1,'READING','full_mock_part_5',5,'in_progress',2,2,'full_mock',$2,5) returning id`,
    [userId, run.id],
  )).rows[0];
  for (const [index, question] of questions.entries()) await pool.query(
    `insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,$3)`,
    [session.id, question.id, index + 1],
  );
  return run.id;
}

async function authenticatedContext(browser, userId, width, reducedMotion = "no-preference") {
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", sessionSecret).update(token).digest("hex");
  await pool.query(
    `insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 day')`,
    [userId, hash],
  );
  const context = await browser.newContext({
    viewport: { width, height: width <= 430 ? 844 : 1000 },
    reducedMotion,
  });
  await context.addCookies([{
    name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax",
    expires: Math.floor(Date.now() / 1000) + 86_400,
  }]);
  return context;
}

async function goto(page, route) {
  const response = await page.goto(new URL(route, baseUrl).href, { waitUntil: "domcontentloaded" });
  if (response) assert.ok(response.status() < 400, `${route} returned ${response.status()}`);
  assert.equal(new URL(page.url()).pathname, route, `${route} navigation was interrupted`);
  await page.waitForTimeout(150);
  const metrics = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  assert.ok(metrics.scrollWidth <= metrics.clientWidth + 1, `${route} overflows horizontally: ${JSON.stringify(metrics)}`);
  return metrics;
}

async function assertMobileNavigation(page, route) {
  await goto(page, route);
  const nav = page.locator("nav.fixed.inset-x-0.bottom-0");
  assert.equal(await nav.isVisible(), true, `${route} mobile navigation is hidden`);
  assert.equal(await nav.locator(":scope > *").count(), 4, `${route} mobile navigation must have four primary items`);
  assert.equal(await nav.locator('a[aria-current="page"]').count(), 1, `${route} needs one active mobile destination`);
  const summary = nav.locator("summary");
  await summary.click();
  for (const href of ["/mistakes", "/full-mock", "/settings", "/pricing", "/billing"]) {
    assert.equal(await nav.locator(`a[href="${href}"]`).isVisible(), true, `More menu lost ${href}`);
  }
  assert.equal(await nav.getByRole("button", { name: /Đăng xuất|Sign out/ }).isVisible(), true, "More menu lost account logout");
  await page.keyboard.press("Escape");
  assert.equal(await summary.evaluate((element) => element === document.activeElement), true, "Escape should restore focus to More");
}

async function assertTapTargets(page, selector) {
  const undersized = await page.locator(selector).evaluateAll((elements) => elements
    .filter((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.visibility !== "hidden" && style.display !== "none" && rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
    })
    .map((element) => ({ text: element.textContent?.trim(), rect: element.getBoundingClientRect().toJSON() })));
  assert.deepEqual(undersized, [], `Undersized controls: ${JSON.stringify(undersized)}`);
}

async function run() {
  const identity = (await pool.query("select current_database() database,current_user db_user")).rows[0];
  assert.deepEqual(identity, { database: "toeicgym_task17", db_user: "toeicgym_test" });
  await pool.query("delete from users where email_normalized like 'task39-%@qa.invalid'");

  const free = await createUser("free");
  const premium = await createUser("premium", "PREMIUM");
  const trial = await createUser("trial", "TRIAL");
  const listeningUser = await createUser("listening");
  const mockUser = await createUser("mock");
  const p5Session = await createPractice(free.id, 5);
  const p6Session = await createPractice(premium.id, 6);
  const p7Session = await createPractice(trial.id, 7, { count: 2 });
  const resultSession = await createPractice(free.id, 5, { submitted: true });
  const challengeSession = await createPractice(free.id, 5, { count: 10, submitted: true });
  const listeningSession = await createListening(listeningUser.id);
  const mockRun = await createMock(mockUser.id);
  const missedQuestion = (await pool.query("select question_id from practice_session_questions where session_id=$1 order by display_order limit 1", [resultSession])).rows[0];
  await pool.query(
    `insert into question_mastery(user_id,question_id,status,first_missed_at,last_missed_at)
     values($1,$2,'UNRESOLVED',now()-interval '1 day',now())`,
    [free.id, missedQuestion.question_id],
  );
  const diagnostic = (await pool.query(
    `select id,user_id from diagnostic_runs where status='COMPLETED' and user_id is not null order by completed_at desc limit 1`,
  )).rows[0];
  assert.ok(diagnostic, "A completed isolated diagnostic fixture is required.");

  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of widths) {
      const context = await authenticatedContext(browser, free.id, width, width === 390 ? "reduce" : "no-preference");
      const page = await context.newPage();
      await goto(page, "/dashboard");
      if (width <= 430) {
        await assertMobileNavigation(page, "/dashboard");
        await assertTapTargets(page, "nav.fixed.inset-x-0.bottom-0 a, nav.fixed.inset-x-0.bottom-0 summary");
      }
      if (width === 390) {
        await page.keyboard.press("Tab");
        const focus = await page.evaluate(() => {
          const element = document.activeElement;
          if (!(element instanceof HTMLElement)) return null;
          const style = getComputedStyle(element);
          return { tag: element.tagName, outlineStyle: style.outlineStyle, outlineWidth: style.outlineWidth };
        });
        assert.ok(focus && focus.tag !== "BODY", "Keyboard focus did not enter the page");
        assert.notEqual(focus.outlineStyle, "none", "Focused control lost its visible outline");
        assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior), "auto");
      }
      report.viewports[width] = "PASS";
      await context.close();
    }

    for (const [name, user] of [["Free", free], ["Premium", premium], ["Trial", trial]]) {
      const context = await authenticatedContext(browser, user.id, 390);
      const page = await context.newPage();
      await assertMobileNavigation(page, "/dashboard");
      report.plans[name] = "PASS";
      await context.close();
    }

    const freeContext = await authenticatedContext(browser, free.id, 390);
    const freePage = await freeContext.newPage();
    await goto(freePage, `/practice/${p5Session}`);
    assert.ok(await freePage.locator('input[type="radio"]').count(), "Part 5 answer options are missing");
    await assertTapTargets(freePage, "main label, main button");
    const actionBar = freePage.locator("div.fixed.inset-x-0.bottom-0").last();
    const actionBox = await actionBar.boundingBox();
    assert.ok(actionBox && actionBox.y + actionBox.height <= 845, "Practice actions are outside the mobile viewport");
    await freePage.locator('input[type="radio"]').first().check();
    freePage.once("dialog", (dialog) => dialog.accept());
    await freePage.getByRole("button", { name: /Nộp bài|Submit/i }).click();
    await freePage.waitForURL(new RegExp(`/practice/${p5Session}/results$`));
    await goto(freePage, `/practice/${resultSession}/results`);
    assert.equal(await freePage.locator('.result-review[data-review-filter="incorrect"]').count(), 1);
    const filters = freePage.locator('.result-review [role="group"] button');
    assert.equal(await filters.count(), 3);
    await filters.nth(2).click();
    assert.equal(await freePage.locator('.result-review[data-review-filter="correct"]').count(), 1);
    await filters.nth(1).click();
    const details = freePage.locator("article details").first();
    if (await details.count()) {
      await details.locator("summary").click();
      assert.equal(await details.getAttribute("open"), "");
    }
    assert.ok(await freePage.locator('nav[aria-label*="câu"], nav[aria-label*="question"]').count(), "Result quick jump is missing");
    await freePage.reload({ waitUntil: "domcontentloaded" });
    const resultUrl = freePage.url();
    await goto(freePage, "/settings");
    await freePage.goBack({ waitUntil: "domcontentloaded" });
    assert.equal(freePage.url(), resultUrl, "Browser Back did not restore the result route");
    await freePage.goForward({ waitUntil: "domcontentloaded" });
    assert.equal(freePage.url(), new URL("/settings", baseUrl).href, "Browser Forward did not restore Settings");
    await goto(freePage, "/mistakes");
    await goto(freePage, "/settings");
    report.interactions.practiceSubmit = "PASS";
    report.interactions.resultFilters = "PASS";
    report.routes.mistakes = "PASS";
    report.routes.settings = "PASS";
    await freeContext.close();

    for (const [part, user, sessionId] of [[6, premium, p6Session], [7, trial, p7Session]]) {
      const context = await authenticatedContext(browser, user.id, 1440);
      const page = await context.newPage();
      await goto(page, `/practice/${sessionId}`);
      const passage = await page.locator("#passage").boundingBox();
      const question = await page.locator('[id^="question-"]').first().boundingBox();
      assert.ok(passage && question && passage.x < question.x && passage.width >= 300 && question.width >= 300, `Part ${part} desktop split layout failed`);
      report.routes[`P${part}`] = "PASS";
      await context.close();
    }

    const listeningContext = await authenticatedContext(browser, listeningUser.id, 390);
    const listeningPage = await listeningContext.newPage();
    await goto(listeningPage, `/practice/${listeningSession}`);
    assert.equal((await listeningPage.locator("body").innerText()).includes("Task 39 transcript sentinel"), false, "Listening transcript leaked before submit");
    const audio = listeningPage.locator("audio");
    assert.equal(await audio.count(), 1, "Listening audio player is missing");
    const playerBox = await listeningPage.getByRole("button", { name: /Phát|Play|Tạm dừng|Pause/ }).boundingBox();
    assert.ok(playerBox && playerBox.width <= 358, "Listening player overflows mobile width");
    await assertTapTargets(listeningPage, "main label, main button, main a");
    report.routes.Listening = "PASS";
    await listeningContext.close();

    const challengeContext = await authenticatedContext(browser, free.id, 390);
    const challengePage = await challengeContext.newPage();
    await goto(challengePage, `/challenge/part-5/${challengeSession}/result`);
    assert.equal(await challengePage.locator(".result-review").count(), 1, "Challenge result did not reuse result review controls");
    assert.ok(await challengePage.locator('a[href*="continue-learning"], a[href="/practice"]').count(), "Challenge continuation CTA is missing");
    report.routes.Challenge = "PASS";
    await challengeContext.close();

    const diagnosticContext = await authenticatedContext(browser, diagnostic.user_id, 390);
    const diagnosticPage = await diagnosticContext.newPage();
    await goto(diagnosticPage, `/diagnostic/${diagnostic.id}/result`);
    assert.equal(await diagnosticPage.locator("nav.fixed.inset-x-0.bottom-0").isVisible(), true, "Diagnostic result lost learner navigation");
    report.routes.Diagnostic = "PASS";
    await diagnosticContext.close();

    const mockContext = await authenticatedContext(browser, mockUser.id, 390);
    const mockPage = await mockContext.newPage();
    await goto(mockPage, `/full-mock/${mockRun}`);
    const mockHeader = mockPage.locator("header.sticky");
    assert.equal(await mockHeader.isVisible(), true, "Mock compact top bar is missing");
    assert.ok(await mockHeader.locator('[role="progressbar"]').count(), "Mock progress is missing");
    assert.match(await mockHeader.innerText(), /Reading/i);
    assert.match(await mockHeader.innerText(), /Part 5/i);
    assert.ok(await mockHeader.getByRole("link").count(), "Mock exit control is missing");
    assert.ok(await mockHeader.getByRole("button").count(), "Mock submit control is missing");
    report.routes.Mock = "PASS";
    await mockContext.close();

    console.log("TASK39_BROWSER_QA_PASS");
    console.log(JSON.stringify(report, null, 2));
  } finally {
    await browser.close();
  }
}

try {
  await run();
} finally {
  await pool.end();
}
