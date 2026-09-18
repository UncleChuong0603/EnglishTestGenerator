import { readFileSync } from "node:fs";
import pg from "pg";
const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "15433") throw new Error("TASK16C_REFUSES_NON_ISOLATED_DATABASE");
const pool = new pg.Pool({ connectionString: url.href, max: 2 });
try {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) {
    const client = await pool.connect();
    try { await client.query("begin"); await client.query(readFileSync(`drizzle/${entry.tag}.sql`, "utf8")); await client.query("commit"); console.log(`APPLIED ${entry.tag}`); }
    catch (error) { await client.query("rollback"); throw error; } finally { client.release(); }
  }
  const result = await pool.query("select current_setting('server_version') version, count(*)::int tables from information_schema.tables where table_schema='public'");
  console.log(JSON.stringify(result.rows[0]));
} finally { await pool.end(); }
