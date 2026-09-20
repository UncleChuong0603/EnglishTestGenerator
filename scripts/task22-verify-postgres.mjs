import { spawnSync } from "node:child_process";
import { assertTestDatabase } from "./lib/assert-test-database.mjs";

const compose = ["compose", "-f", "docker-compose.test.yml"];
const testUrl = "postgresql://toeicgym_test:isolated_test_only@127.0.0.1:15433/toeicgym_task17";
const results = new Map();
let started = false;

function run(command, args, env = process.env, quiet = false) {
  const result = spawnSync(command, args, { cwd: process.cwd(), env, encoding: "utf8", stdio: quiet ? "pipe" : "inherit", shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = quiet ? `${result.stdout ?? ""}\n${result.stderr ?? ""}`.replace(/postgres(?:ql)?:\/\/[^\s]+/gi, "[REDACTED_DATABASE_URL]").trim().slice(-4000) : "";
    throw new Error(`${command} ${args.join(" ")} exited ${result.status}${detail ? `\n${detail}` : ""}`);
  }
}

async function main() {
  console.log("TASK22 POSTGRES VERIFICATION\n");
  run("docker", ["--version"], process.env, true);
  run("docker", ["compose", "version"], process.env, true);
  results.set("Docker", "PASS");
  run("docker", [...compose, "up", "-d", "--wait", "postgres"]);
  started = true;
  results.set("PostgreSQL 17 test container", "PASS");
  const identity = await assertTestDatabase(testUrl);
  console.log(`Safe DB identity: database=${identity.database} user=${identity.username} address=${identity.address} port=${identity.port}`);
  results.set("DB identity", "PASS");
  const env = { ...process.env, DATABASE_URL: testUrl, TASK17_TEST_DATABASE_URL: testUrl, TASK16_TEST_DATABASE_URL: testUrl, TASK19_DB_INTEGRATION: "1", NODE_ENV: "test" };
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["run", "test:integration:payments"], env, true);
  results.set("Clean migration chain", "PASS");
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["test", "--", "src/lib/question-import/service.integration.test.ts"], env, true);
  results.set("PostgreSQL integration tests", "PASS");
  run(process.platform === "win32" ? "npm.cmd" : "npm", ["test", "--", "src/db", "--maxWorkers=1"], env, true);
  results.set("Schema compatibility", "PASS");
}

try {
  await main();
} catch (error) {
  console.error(`Action required: ${error instanceof Error ? error.message : "verification failed"}`);
  process.exitCode = 1;
} finally {
  if (started) {
    try { run("docker", [...compose, "down", "--remove-orphans"], process.env, true); }
    catch { console.error("Cleanup failed; run: npm run task22:verify:postgres:cleanup"); process.exitCode = 1; }
  }
  console.log("\nTASK22 POSTGRES VERIFICATION\n");
  for (const label of ["Docker", "PostgreSQL 17 test container", "DB identity", "Clean migration chain", "PostgreSQL integration tests", "Schema compatibility"]) console.log(`${label}: ${results.get(label) ?? "FAIL"}`);
  console.log(`\nRESULT: ${process.exitCode ? "FAIL" : "PASS"}`);
}
