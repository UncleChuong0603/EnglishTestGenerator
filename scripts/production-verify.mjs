import { constants } from "node:fs";
import { access, realpath } from "node:fs/promises";
import pg from "pg";

const provider = process.env.MEDIA_STORAGE_PROVIDER;
const requiredTables = ["users", "questions", "media_assets", "passage_sets"];
let pool;
try {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");
  if (provider !== "LOCAL") throw new Error("MEDIA_STORAGE_PROVIDER_MUST_BE_LOCAL");
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 5000 });
  const client = await pool.connect();
  try {
    await client.query("begin read only");
    const { rows:[identity] } = await client.query("select current_database() database, current_user username, inet_server_addr()::text address, inet_server_port() port");
    console.log(`Database identity: database=${identity.database} user=${identity.username} address=${identity.address ?? "local-socket"} port=${identity.port}`);
    const { rows } = await client.query("select table_name from information_schema.tables where table_schema='public' and table_name = any($1::text[])", [requiredTables]);
    const present = new Set(rows.map((row) => row.table_name));
    const missing = requiredTables.filter((table) => !present.has(table));
    if (missing.length) throw new Error(`EXPECTED_TABLES_MISSING:${missing.join(",")}`);
    const migration = await client.query("select to_regclass('drizzle.__drizzle_migrations') migration_table");
    if (!migration.rows[0].migration_table) throw new Error("MIGRATION_STATE_UNAVAILABLE");
    await client.query("rollback");
  } finally { client.release(); }
  console.log(`Media provider: ${provider}`);
  if (!process.env.LOCAL_MEDIA_ROOT) throw new Error("LOCAL_MEDIA_ROOT_REQUIRED");
  const root = await realpath(process.env.LOCAL_MEDIA_ROOT);
  await access(root, constants.R_OK);
  console.log("LOCAL media root: READABLE");
  console.log("Production read-only verification: PASS");
} catch (error) {
  console.error(`Production read-only verification: FAIL (${error instanceof Error ? error.message : "unknown error"})`);
  process.exitCode = 1;
} finally { await pool?.end(); }
