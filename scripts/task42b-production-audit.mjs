// Read-only, allowlisted diagnostics. Never emit raw subprocess errors or env.
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const project = "toeic-gym-frontend-bhwkds";
const run = (command, args) => execFileSync(command, args, {
  encoding: "utf8", timeout: 20_000, stdio: ["ignore", "pipe", "pipe"],
}).trim();
const credentialNames = new Set([
  "SESSION_SECRET", "DATABASE_URL", "APP_DATABASE_PASSWORD", "POSTGRES_ADMIN_PASSWORD",
  "SMTP_USER", "SMTP_PASSWORD", "MEDIA_SIGNING_SECRET", "GOOGLE_CLIENT_SECRET",
  "PAYOS_CLIENT_ID", "PAYOS_API_KEY", "PAYOS_CHECKSUM_KEY",
  "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY", "LIFECYCLE_JOB_SECRET", "INTERNAL_SECRET",
  "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "CASSO_WEBHOOK_SECRET",
]);
function service(name) {
  try {
    const text = run("docker", ["inspect", "--format",
      "{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} {{.RestartCount}} {{.State.ExitCode}}",
      `${project}-${name}-1`]);
    if (!/^(created|running|paused|restarting|removing|exited|dead) (none|starting|healthy|unhealthy) \d+ \d+$/.test(text)) return { state: "unknown" };
    const [state, health, restarts, exitCode] = text.split(" ");
    return { state, health, restarts: Number(restarts), exitCode: Number(exitCode) };
  } catch { return { state: "missing" }; }
}
try {
  const revision = run("git", ["rev-parse", "HEAD"]);
  const envNames = readFileSync(".env", "utf8").split(/\r?\n/).flatMap(line => {
    const match = /^([A-Z][A-Z_0-9]*)=/.exec(line);
    return match && credentialNames.has(match[1]) ? [match[1]] : [];
  });
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  const entries = journal.entries;
  const ordered = entries.every((entry, index) => entry.idx === index && (index === 0 || entry.when > entries[index - 1].when));
  const expected = entries.map(entry => ({ tag: entry.tag, when: String(entry.when), hash: createHash("sha256").update(readFileSync(`drizzle/${entry.tag}.sql`, "utf8")).digest("hex") }));
  // The child can use its DATABASE_URL; only fixed booleans/counts leave it.
  const code = `const {Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL});(async()=>{await c.connect();await c.query('BEGIN READ ONLY');const rows=(await c.query('select hash,created_at from drizzle.__drizzle_migrations order by id')).rows;const expected=${JSON.stringify(expected)};const mismatchTags=expected.filter((e,i)=>!rows[i]||rows[i].hash!==e.hash||String(rows[i].created_at)!==e.when).map(e=>e.tag);if(rows.length>expected.length)mismatchTags.push('unexpected_database_entries');const chainMatches=rows.length===expected.length&&mismatchTags.length===0;const historical0017Drift=rows.length===expected.length&&mismatchTags.length===1&&mismatchTags[0]==='0017_question_bank_import';const tables=(await c.query("select to_regclass('public.question_reports') is not null as reports,to_regclass('public.question_issue_reports') is not null as issues,to_regclass('public.question_duplicate_scans') is not null as scans")).rows[0];const last=expected.at(-1);console.log(JSON.stringify({migrationCount:rows.length,chainMatches,historical0017Drift,mismatchTags,latestMigrationApplied:rows.some(r=>r.hash===last.hash&&String(r.created_at)===last.when),questionReports:tables.reports,questionIssueReports:tables.issues,questionDuplicateScans:tables.scans}));await c.query('ROLLBACK');await c.end()})().catch(()=>{console.log('{"auditFailed":true}');process.exit(1)})`;
  const raw = JSON.parse(run("docker", ["exec", `${project}-app-1`, "node", "-e", code]));
  const allowedMigrationFields = ["migrationCount", "chainMatches", "historical0017Drift", "latestMigrationApplied", "questionReports", "questionIssueReports", "questionDuplicateScans"];
  const migration = Object.fromEntries(Object.entries(raw).filter(([key, value]) => allowedMigrationFields.includes(key) && (typeof value === "boolean" || (typeof value === "number" && Number.isInteger(value)))));
  migration.mismatchTags = Array.isArray(raw.mismatchTags) ? raw.mismatchTags.filter(tag => typeof tag === "string" && /^[0-9]{4}_[a-z0-9_]+$|^unexpected_database_entries$/.test(tag)) : ["audit_failed"];
  console.log(JSON.stringify({
    revision: /^[a-f0-9]{40}$/.test(revision) ? revision : "unknown",
    journalOrdered: ordered, journalCount: entries.length,
    configuredCredentialNames: [...new Set(envNames)].sort(),
    app: service("app"), scheduler: service("lifecycle-scheduler"), mobileScheduler: service("mobile-retention-scheduler"),
    postgres: service("postgres"), media: service("media-server"), migrate: service("migrate"),
    migration,
  }));
  const acceptedChain = migration.chainMatches || migration.historical0017Drift;
  if (!ordered || !acceptedChain || !migration.latestMigrationApplied) process.exitCode = 1;
} catch {
  console.log(JSON.stringify({ auditFailed: true }));
  process.exitCode = 1;
}
