import assert from "node:assert/strict";
import net from "node:net";
import pg from "pg";

const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
assert.deepEqual({ host: databaseUrl.hostname, port: databaseUrl.port, database: databaseUrl.pathname, user: databaseUrl.username },
  { host: "127.0.0.1", port: "15433", database: "/toeicgym_task17", user: "toeicgym_test" });
process.env.NODE_ENV = "development";
process.env.SESSION_SECRET = "task36-isolated-qa-secret-0000000000000000";
process.env.APP_URL = "http://localhost:3000";
process.env.SMTP_HOST = "127.0.0.1";
process.env.SMTP_FROM = "QA <qa@qa.invalid>";
process.env.SMTP_SECURE = "false";
delete process.env.SMTP_USER;
delete process.env.SMTP_PASSWORD;

const messages: string[] = [];
let rejectFailure = true;
const server = net.createServer(socket => {
  socket.write("220 qa-smtp ESMTP\r\n");
  let buffer = "", data = false, message = "";
  socket.on("data", chunk => {
    buffer += chunk.toString();
    while (buffer.includes("\r\n")) {
      const end = buffer.indexOf("\r\n");
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      if (data) {
        if (line === ".") { messages.push(message); message = ""; data = false; socket.write("250 queued\r\n"); }
        else message += `${line}\n`;
      } else if (/^EHLO|^HELO/i.test(line)) socket.write("250 qa-smtp\r\n");
      else if (/^MAIL FROM:/i.test(line)) socket.write("250 ok\r\n");
      else if (/^RCPT TO:/i.test(line)) socket.write(rejectFailure && line.includes("task36-failure@qa.invalid") ? "550 rejected\r\n" : "250 ok\r\n");
      else if (/^DATA/i.test(line)) { data = true; socket.write("354 end with dot\r\n"); }
      else if (/^QUIT/i.test(line)) { socket.write("221 bye\r\n"); socket.end(); }
      else socket.write("250 ok\r\n");
    }
  });
});
await new Promise<void>(resolve => server.listen(0, "127.0.0.1", resolve));
process.env.SMTP_PORT = String((server.address() as net.AddressInfo).port);

const pool = new pg.Pool({ connectionString: databaseUrl.href });
const { runLifecycleEmails, unsubscribeLearningEmail, updateReturnedToLearning } = await import("../src/lib/email/lifecycle.ts");
const { sendAuthEmail } = await import("../src/lib/email/mailer.ts");
const { POST: scheduledEndpoint } = await import("../src/app/api/internal/lifecycle-email/route.ts");
const now = new Date("2026-09-28T01:15:00.000Z");
const before = (hours: number) => new Date(now.getTime() - hours * 3_600_000);
const email = (name: string) => `task36-${name}@qa.invalid`;
const ids: Record<string, string> = {};
async function addUser(name: string, createdHours: number, enabled = true) {
  const address = email(name);
  const row = await pool.query("insert into users(email,email_normalized,email_verified_at,status,created_at) values($1,$1,$2,'active',$3) returning id", [address, before(createdHours), before(createdHours)]);
  const id = row.rows[0].id as string;
  ids[name] = id;
  await pool.query("insert into profiles(id,learning_email_enabled) values($1,$2)", [id, enabled]);
  return id;
}
async function addSession(userId: string, at: Date) {
  const question = await pool.query("select q.id,qs.correct_option_id from questions q join question_solutions qs on qs.question_id=q.id where q.status='published' and q.toeic_part=5 limit 1");
  assert(question.rows.length, "QA database needs a published Part 5 question");
  const session = await pool.query("insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,started_at,submitted_at,score_correct,score_total) values($1,'READING','part_5',5,'submitted',1,1,'custom',$2,$2,1,1) returning id", [userId, at]);
  await pool.query("insert into practice_session_questions(session_id,question_id,display_order) values($1,$2,1)", [session.rows[0].id, question.rows[0].id]);
  await pool.query("insert into attempt_answers(session_id,user_id,question_id,selected_option_id,is_correct,answered_at) values($1,$2,$3,$4,true,$5)", [session.rows[0].id, userId, question.rows[0].id, question.rows[0].correct_option_id, at]);
}

try {
  assert.equal((await scheduledEndpoint(new Request("http://localhost:3000/api/internal/lifecycle-email", { method: "POST" }))).status, 401);
  await pool.query("delete from users where email_normalized like 'task36-%@qa.invalid'");
  await addUser("signup", 36);
  await addSession(await addUser("day1", 240), before(36));
  await addSession(await addUser("inactive", 240), before(75));
  await addSession(await addUser("weekly", 240), before(75));
  await addUser("optout", 36, false);
  const unverified = await addUser("unverified", 36);
  await pool.query("update users set email_verified_at=null,status='pending_verification' where id=$1", [unverified]);
  await addUser("failure", 36);
  const capped = await addUser("cap", 36);
  await pool.query("insert into lifecycle_emails(user_id,type,window_key,status,sent_at) values($1,'inactive_3d','older','sent',$2)", [capped, before(1)]);
  const premium = await addUser("premium", 36);
  await pool.query("insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM','ADMIN',$2,$3)", [premium, before(24), new Date(now.getTime() + 30 * 86_400_000)]);
  const first = await runLifecycleEmails(now);
  assert.equal(first.sent, 5); // signup, day1, inactive, weekly, premium
  assert.equal(first.failed, 1);
  assert.equal(messages.length, 5);
  const rows = await pool.query("select u.email_normalized,l.type,l.status,l.reason,l.attempts from lifecycle_emails l join users u on u.id=l.user_id where u.email_normalized like 'task36-%@qa.invalid'");
  const byName = (name: string) => rows.rows.filter(row => row.email_normalized === email(name));
  assert.equal(byName("weekly").find(row => row.status === "sent")?.type, "weekly_review");
  assert.equal(byName("failure")[0].reason, "safe_pre_accept");
  assert.equal(byName("cap").find(row => row.type === "signup_no_learning")?.reason, "frequency");
  assert.equal(byName("optout").length, 0);
  assert.equal(byName("unverified").length, 0);
  rejectFailure = false;
  const second = await runLifecycleEmails(now);
  assert.equal(second.sent, 1); // only the explicitly rejected RCPT can retry
  assert.equal(messages.length, 6);
  assert.equal((await pool.query("select attempts from lifecycle_emails where user_id=$1 and type='signup_no_learning'", [ids.failure])).rows[0].attempts, 2);
  const signupMessage = messages.find(message => message.includes("task36-signup@qa.invalid"));
  assert(signupMessage);
  const decoded = signupMessage.replace(/=\n/g, "").replace(/=3D/gi, "=");
  const token = decoded.match(/\/unsubscribe\?token=([A-Za-z0-9_-]+)/)?.[1];
  assert(token);
  assert.equal(await unsubscribeLearningEmail(token), true);
  assert.equal(await unsubscribeLearningEmail(token), false);
  assert.equal((await pool.query("select learning_email_enabled from profiles where id=$1", [ids.signup])).rows[0].learning_email_enabled, false);
  await addSession(ids.signup, new Date(Date.now() + 60_000));
  await updateReturnedToLearning();
  assert((await pool.query("select returned_at from lifecycle_emails where user_id=$1 and type='signup_no_learning'", [ids.signup])).rows[0].returned_at);
  await sendAuthEmail({ to: email("signup"), subject: "Security QA", text: "Security message" });
  assert.equal(messages.length, 7);
  console.log("Task 36 isolated PostgreSQL + mock SMTP matrix passed", { first, second, messages: messages.length });
} finally {
  await pool.query("delete from users where email_normalized like 'task36-%@qa.invalid'");
  await pool.end();
  await new Promise<void>(resolve => server.close(() => resolve()));
}
