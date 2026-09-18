import pg from "pg";
const url = new URL(process.env.TASK16_TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "15433") throw new Error("TASK16C_REFUSES_NON_ISOLATED_DATABASE");
const pool = new pg.Pool({ connectionString: url.href, max: 1 });
try {
  await pool.query("drop schema public cascade");
  await pool.query("create schema public");
  console.log("TASK16_TEST_DATABASE_RESET");
} finally { await pool.end(); }
