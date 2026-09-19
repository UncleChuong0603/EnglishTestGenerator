import pg from "pg";

export async function assertTestDatabase(connectionString) {
  let url;
  try { url = new URL(connectionString); } catch { throw new Error("TEST_DATABASE_URL_INVALID"); }
  if (!["postgres:", "postgresql:"].includes(url.protocol) ||
      url.hostname !== "127.0.0.1" || url.port !== "15433" ||
      url.pathname !== "/toeicgym_task17" || url.username !== "toeicgym_test" ||
      !url.password) throw new Error("TEST_DATABASE_IDENTITY_REJECTED");
  const pool = new pg.Pool({ connectionString, max: 1, connectionTimeoutMillis: 3000 });
  try {
    const { rows: [identity] } = await pool.query("select current_database() as database, current_user as username, inet_server_addr()::text as address, inet_server_port() as port");
    if (identity.database !== "toeicgym_task17" || identity.username !== "toeicgym_test" ||
        !identity.address || identity.port !== 5432)
      throw new Error("TEST_DATABASE_IDENTITY_REJECTED");
    return { database: identity.database, username: identity.username, address: identity.address, port: identity.port };
  } finally { await pool.end(); }
}
