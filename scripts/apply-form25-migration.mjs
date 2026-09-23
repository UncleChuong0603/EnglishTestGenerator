import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import pg from "pg";

const migration = fileURLToPath(new URL("../drizzle/0035_windy_sir_ram.sql", import.meta.url));
const createdAt = 1792368000000;

async function run() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const content = await readFile(migration, "utf8");
  const hash = createHash("sha256").update(content).digest("hex");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client = await pool.connect();
  try {
    await client.query("begin");
    await client.query("select pg_advisory_xact_lock(hashtextextended('form25-migration',0))");
    const existing = await client.query("select hash,created_at from drizzle.__drizzle_migrations order by created_at desc limit 1");
    const last = existing.rows[0];
    if (last?.created_at === String(createdAt) || Number(last?.created_at) === createdAt) {
      if (last.hash !== hash) throw new Error("Form 25 migration timestamp has a different hash");
      await client.query("commit");
      console.log("25-form migration already applied.");
      return;
    }
    if (last && Number(last.created_at) >= createdAt) throw new Error("Migration order is not monotonic");
    for (const statement of content.split("--> statement-breakpoint").map((sql) => sql.trim()).filter(Boolean)) await client.query(statement);
    await client.query("insert into drizzle.__drizzle_migrations(hash,created_at) values($1,$2)", [hash,createdAt]);
    await client.query("commit");
    console.log("Applied and recorded 25-form migration.");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    client.release(); await pool.end();
  }
}

run().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
