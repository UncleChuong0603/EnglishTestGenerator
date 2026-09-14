import { createHmac, randomBytes } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import nodemailer from "nodemailer";
import { createPool, upsertRows } from "./lib/seed-pg.mjs";

const sourceDir = resolve(process.argv[2] ?? "migration-export");
const order = ["passage_sets", "passages", "questions", "question_options", "question_solutions", "practice_sessions", "practice_session_questions", "attempt_answers", "demo_test_answers"];
const conflicts = { passage_sets: "id", passages: "id", questions: "id", question_options: "id", question_solutions: "question_id", practice_sessions: "id", practice_session_questions: "session_id,question_id", attempt_answers: "id", demo_test_answers: "session_id,question_id" };
const required = ["DATABASE_URL", "SESSION_SECRET", "APP_URL"];
for (const name of required) if (!process.env[name]) throw new Error(`${name} is required`);
const tokenHash = (token) => createHmac("sha256", process.env.SESSION_SECRET).update(token).digest("hex");
async function json(name, optional = false) { try { return JSON.parse(await readFile(resolve(sourceDir, `${name}.json`), "utf8")); } catch (error) { if (optional && error?.code === "ENOENT") return []; throw error; } }

async function run() {
  const names = new Set(await readdir(sourceDir)); if (!names.has("users.json")) throw new Error("migration-export/users.json is required");
  const sourceUsers = await json("users"); const sourceProfiles = await json("profiles", true); const profileById = new Map(sourceProfiles.map((profile) => [profile.id, profile])); const pool = createPool(); const client = await pool.connect(); const activationEmails = [];
  const userIds = new Set(); const emails = new Set(); const googleSubjects = new Set();
  for (const user of sourceUsers) {
    const normalized = String(user.email ?? "").trim().normalize("NFKC").toLowerCase();
    if (!user.id || !normalized) throw new Error("Every source user requires id and email");
    if (userIds.has(user.id)) throw new Error(`Duplicate source user id: ${user.id}`);
    if (emails.has(normalized)) throw new Error(`Duplicate normalized source email: ${normalized}`);
    if (user.google_subject && googleSubjects.has(user.google_subject)) throw new Error("Duplicate Google subject in source export");
    userIds.add(user.id); emails.add(normalized); if (user.google_subject) googleSubjects.add(user.google_subject);
  }
  try {
    await client.query("begin");
    for (const user of sourceUsers) {
      if (!user.id || !user.email) throw new Error("Every source user requires id and email"); const profile = profileById.get(user.id) ?? {}; const email = String(user.email).trim(); const normalized = email.normalize("NFKC").toLowerCase(); const verified = user.email_verified_at ? new Date(user.email_verified_at) : null; const googleSub = typeof user.google_subject === "string" ? user.google_subject : null;
      await client.query(`insert into users (id,email,email_normalized,email_verified_at,status) values ($1,$2,$3,$4,$5) on conflict (id) do update set email=excluded.email,email_normalized=excluded.email_normalized,email_verified_at=excluded.email_verified_at,updated_at=now()`, [user.id, email, normalized, verified, googleSub && verified ? "active" : "pending_verification"]);
      await client.query(`insert into profiles (id,full_name,avatar_url,interface_language,explanation_language) values ($1,$2,$3,$4,$5) on conflict (id) do update set full_name=excluded.full_name,avatar_url=excluded.avatar_url,interface_language=excluded.interface_language,explanation_language=excluded.explanation_language,updated_at=now()`, [user.id, profile.full_name ?? user.full_name ?? null, profile.avatar_url ?? user.avatar_url ?? null, profile.interface_language ?? user.interface_language ?? "vi", profile.explanation_language ?? user.explanation_language ?? "both"]);
      if (googleSub && verified) {
        const existing = await client.query("select user_id from auth_identities where provider='google' and provider_account_id=$1", [googleSub]);
        if (existing.rows[0] && existing.rows[0].user_id !== user.id) throw new Error("Google identity conflict; refusing unsafe account merge");
        await client.query(`insert into auth_identities (user_id,provider,provider_account_id,provider_email) values ($1,'google',$2,$3) on conflict (provider,provider_account_id) do update set provider_email=excluded.provider_email,updated_at=now()`, [user.id, googleSub, email]);
      } else if (verified) {
        const raw = randomBytes(32).toString("base64url");
        await client.query("update account_activation_tokens set used_at=now() where user_id=$1 and used_at is null", [user.id]);
        await client.query(`insert into account_activation_tokens (user_id,token_hash,expires_at) values ($1,$2,now()+interval '24 hours')`, [user.id, tokenHash(raw)]);
        activationEmails.push({ to: email, url: `${process.env.APP_URL}/activate-account?token=${encodeURIComponent(raw)}` });
      }
    }
    for (const table of order) { const rows = await json(table, true); if (rows.length) await upsertRows(client, table, rows, conflicts[table]); }
    await client.query("commit");
  } catch (error) { await client.query("rollback"); throw error; } finally { client.release(); await pool.end(); }
  if (activationEmails.length) {
    if (!process.env.SMTP_HOST || !process.env.SMTP_FROM) throw new Error("Data imported, but SMTP_HOST/SMTP_FROM are required to deliver activation links");
    const transport = nodemailer.createTransport({ host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 25), secure: process.env.SMTP_SECURE === "true", auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined });
    for (const item of activationEmails) await transport.sendMail({ from: process.env.SMTP_FROM, to: item.to, subject: "Activate your migrated English Test account", text: `Set your local password: ${item.url}` });
  }
  console.log(`Imported ${sourceUsers.length} users and queued ${activationEmails.length} activation emails. No password or provider tokens were imported.`);
}
run().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
