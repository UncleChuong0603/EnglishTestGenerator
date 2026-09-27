// Read-only production diagnostics. Run on the VPS from the Dokploy checkout.
// This script prints states and variable names only, never process arguments,
// Docker environment values, Compose config, logs, tokens, or encoded env data.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const project = "toeic-gym-frontend-bhwkds";
const run = (command, args) => execFileSync(command, args, { encoding: "utf8", timeout: 10_000 }).trim();
const service = (name) => {
  try {
    const value = run("docker", ["inspect", "-f", "{{.State.Status}} {{if .State.Health}}{{.State.Health.Status}}{{else}}none{{end}} {{.RestartCount}}", `${project}-${name}-1`]);
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
const env = readFileSync(".env", "utf8");
const configuredNames = env.split(/\r?\n/).flatMap(line => {
  const match = /^([A-Z][A-Z_0-9]*)=/.exec(line);
  return match && allowedNames.has(match[1]) ? [match[1]] : [];
});
console.log(JSON.stringify({
  revision: run("git", ["rev-parse", "HEAD"]),
  app: service("app"), scheduler: service("lifecycle-scheduler"),
  postgres: service("postgres"), migrate: service("migrate"),
  configuredCredentialNames: configuredNames.sort(),
}));
