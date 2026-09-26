// Read-only production diagnostics. Run on the VPS from the Dokploy checkout.
// This script prints states and variable names only, never process arguments,
// Docker environment values, Compose config, logs, tokens, or encoded env data.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const project = "toeic-gym-frontend-bhwkds";
const run = (command, args) => execFileSync(command, args, { encoding: "utf8", timeout: 10_000, stdio: ["ignore", "pipe", "ignore"] }).trim();
const service = (name) => {
  try {
    const value = run("docker", ["inspect", "-f", "{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} {{.RestartCount}}", `${project}-${name}-1`]);
    if (!/^(created|running|paused|restarting|removing|exited|dead) (none|starting|healthy|unhealthy) \d+$/.test(value)) return { state: "unknown" };
    const [state, health, restarts] = value.split(" ");
    return { state, health, restarts: Number(restarts) };
  } catch { return { state: "missing" }; }
};

const allowedNames = new Set([
  "SESSION_SECRET", "APP_DATABASE_PASSWORD", "POSTGRES_ADMIN_PASSWORD", "DATABASE_URL",
  "SMTP_USER", "SMTP_PASSWORD", "MEDIA_SIGNING_SECRET", "GOOGLE_CLIENT_SECRET",
  "PAYOS_API_KEY", "PAYOS_CHECKSUM_KEY", "PAYOS_CLIENT_ID", "CASSO_WEBHOOK_SECRET",
  "NEXT_SERVER_ACTIONS_ENCRYPTION_KEY", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY",
]);
let env = "";
let environmentFilePresent = false;
try { env = readFileSync(".env", "utf8"); environmentFilePresent = true; } catch { /* Checkout can be replaced during deploy. */ }
const configuredNames = env.split(/\r?\n/).flatMap(line => {
  const match = /^([A-Z][A-Z_0-9]*)=/.exec(line);
  return match && allowedNames.has(match[1]) ? [match[1]] : [];
});
let revision = "unknown";
try { revision = run("git", ["rev-parse", "HEAD"]); } catch { /* Deploy in progress. */ }
console.log(JSON.stringify({
  revision: /^[a-f0-9]{40}$/.test(revision) ? revision : "unknown",
  environmentFilePresent,
  app: service("app"), scheduler: service("lifecycle-scheduler"),
  postgres: service("postgres"), migrate: service("migrate"),
  configuredCredentialNames: configuredNames.sort(),
}));
