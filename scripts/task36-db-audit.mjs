import pg from "pg";
const url = new URL(process.env.DATABASE_URL ?? "");
if (url.hostname !== "127.0.0.1" || url.port !== "15433" || url.pathname !== "/toeicgym_task17") throw new Error("Isolated QA database only");
const pool = new pg.Pool({ connectionString: url.href });
try {
  for (const query of [
    "select current_database(), current_user, inet_server_addr(), inet_server_port()",
    "select column_name from information_schema.columns where table_name='profiles' and column_name='learning_email_enabled'",
    "select table_schema,table_name from information_schema.tables where table_name='lifecycle_emails'",
    "select id, created_at from drizzle.__drizzle_migrations order by id desc limit 4",
  ]) console.log((await pool.query(query)).rows);
} finally { await pool.end(); }
