import { createHmac, randomBytes } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { expect, test, type BrowserContext } from "@playwright/test";
import pg from "pg";

const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
if (
  databaseUrl.hostname !== "127.0.0.1" ||
  databaseUrl.port !== "15433" ||
  databaseUrl.pathname !== "/toeicgym_task17" ||
  databaseUrl.username !== "toeicgym_test"
) {
  throw new Error("TASK57_REQUIRES_ISOLATED_DATABASE");
}

const pool = new pg.Pool({ connectionString: databaseUrl.toString(), max: 2 });
let sessionId = "";
let userId = "";
let originalLocale = "vi";
const sessionHashes: string[] = [];

async function authenticatedContext(context: BrowserContext) {
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
  sessionHashes.push(hash);
  await pool.query(
    "insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '1 day')",
    [userId, hash],
  );
  await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax", expires: Math.floor(Date.now() / 1000) + 86_400 }]);
}

test.beforeAll(async () => {
  const user = (await pool.query<{ id: string; interface_language: string }>(
    "select u.id,p.interface_language from users u join profiles p on p.id=u.id where u.email_normalized='free.learner@ui.invalid'",
  )).rows[0];
  if (!user) throw new Error("TASK57_FIXTURE_USER_MISSING");
  userId = user.id;
  originalLocale = user.interface_language;
  const questions = (await pool.query<{ id: string; passage_set_id: string | null }>(
    "select id,passage_set_id from questions where status='published' and toeic_part=5 order by question_order,id limit 5",
  )).rows;
  if (questions.length < 5) throw new Error("TASK57_FIXTURE_CONTENT_MISSING");
  const session = (await pool.query<{ id: string }>(
    `insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,submitted_at,score_correct,score_total)
     values($1,'READING','part_5',5,'submitted',5,5,'custom',now(),4,5) returning id`,
    [userId],
  )).rows[0];
  sessionId = session.id;
  for (const [index, question] of questions.entries()) {
    await pool.query(
      "insert into practice_session_questions(session_id,question_id,display_order,passage_set_id) values($1,$2,$3,$4)",
      [sessionId, question.id, index + 1, question.passage_set_id],
    );
    const option = (await pool.query<{ id: string }>(
      index === 0
        ? "select qo.id from question_options qo join question_solutions qs on qs.question_id=qo.question_id and qs.correct_option_id<>qo.id where qo.question_id=$1 limit 1"
        : "select correct_option_id id from question_solutions where question_id=$1",
      [question.id],
    )).rows[0];
    await pool.query(
      "insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,$5,now())",
      [sessionId, userId, question.id, option.id, index !== 0],
    );
  }
});

test.afterAll(async () => {
  await pool.query("update profiles set interface_language=$1 where id=$2", [originalLocale, userId]);
  if (sessionHashes.length) await pool.query("delete from user_sessions where session_token_hash=any($1::text[])", [sessionHashes]);
  if (sessionId) await pool.query("delete from practice_sessions where id=$1", [sessionId]);
  await pool.end();
});

test("result handoff is bilingual, keyboard reachable and responsive", async ({ browser }) => {
  test.setTimeout(180_000);
  await mkdir(path.resolve("artifacts/task57"), { recursive: true });
  for (const locale of ["vi", "en"] as const) {
    await pool.query("update profiles set interface_language=$1 where id=$2", [locale, userId]);
    const context = await browser.newContext();
    await authenticatedContext(context);
    const page = await context.newPage();
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
      await page.goto(`/practice/${sessionId}/results`, { waitUntil: "networkidle" });
      await expect(page.getByRole("heading", { name: locale === "vi" ? /1 câu chưa đúng/ : /1 incorrect answer/ })).toBeVisible();
      await expect(page.getByText(locale === "vi" ? /dữ liệu thật/ : /real evidence/)).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
      const actions = page.getByRole("button");
      await actions.first().focus();
      await expect(actions.first()).toBeFocused();
      expect((await actions.first().boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(44);
      await page.screenshot({ path: `artifacts/task57/retention-result-${locale}-${width}.png`, fullPage: true, animations: "disabled" });
    }
    await context.close();
  }
});
