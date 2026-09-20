import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import pg from "pg";

const migrationPath = "drizzle/0025_product_analytics.sql";
const migrationCreatedAt = 1791504000000;
const expectedIndexes = [
  "product_events_name_occurred_idx",
  "product_events_occurred_idx",
  "product_events_user_occurred_idx",
  "product_events_guest_occurred_idx",
  "product_events_dedup_uidx",
];

let pool;
try {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");
  const migrationSql = await readFile(migrationPath, "utf8");
  const expectedHash = createHash("sha256").update(migrationSql).digest("hex");
  pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 5000, statement_timeout: 15000 });
  const client = await pool.connect();
  try {
    await client.query("begin read only");
    const { rows: [identity] } = await client.query("select current_database() database, current_user username, inet_server_addr()::text address, inet_server_port() port, current_setting('server_version_num')::int version_num");
    console.log(`Database identity: database=${identity.database} user=${identity.username} address=${identity.address ?? "local-socket"} port=${identity.port} PostgreSQL=${Math.floor(identity.version_num / 10000)}`);
    if (Math.floor(identity.version_num / 10000) !== 17) throw new Error("POSTGRESQL_17_REQUIRED");

    const migrationState = await client.query("select hash, created_at from drizzle.__drizzle_migrations where created_at=$1", [migrationCreatedAt]);
    if (migrationState.rowCount !== 1) throw new Error("MIGRATION_0025_NOT_APPLIED");
    if (migrationState.rows[0].hash !== expectedHash) throw new Error("MIGRATION_0025_HASH_MISMATCH");

    const schema = await client.query(`
      select
        to_regclass('public.product_events')::text product_events,
        exists(select 1 from pg_constraint where conrelid='public.product_events'::regclass and conname='product_events_name_check') event_name_constraint,
        exists(select 1 from pg_constraint where conrelid='public.product_events'::regclass and conname='product_events_actor_check') actor_constraint`);
    if (schema.rows[0].product_events !== "product_events") throw new Error("PRODUCT_EVENTS_MISSING");
    if (!schema.rows[0].event_name_constraint || !schema.rows[0].actor_constraint) throw new Error("PRODUCT_EVENTS_CONSTRAINT_MISSING");

    const indexRows = await client.query("select indexname from pg_indexes where schemaname='public' and tablename='product_events'");
    const indexes = new Set(indexRows.rows.map(row => row.indexname));
    const missingIndexes = expectedIndexes.filter(name => !indexes.has(name));
    if (missingIndexes.length) throw new Error(`PRODUCT_EVENTS_INDEX_MISSING:${missingIndexes.join(",")}`);

    const critical = await client.query("select to_regclass('public.users') users, to_regclass('public.practice_sessions') practice_sessions, to_regclass('public.diagnostic_runs') diagnostic_runs, to_regclass('public.full_mock_runs') full_mock_runs, to_regclass('public.payment_orders') payment_orders");
    if (Object.values(critical.rows[0]).some(value => !value)) throw new Error("APP_CRITICAL_TABLE_MISSING");

    const analytics = await client.query(`
      with recent as (select now() - interval '7 day' since)
      select
        (select count(*)::int from product_events, recent where occurred_at >= since) event_count,
        (select count(*)::int from practice_sessions, recent where status='submitted' and submitted_at >= since) completed_sessions,
        (select coalesce(sum(question_count),0)::int from practice_sessions, recent where status='submitted' and submitted_at >= since) questions_practiced,
        (select count(*)::int from diagnostic_runs, recent where completed_at >= since) diagnostics_completed,
        (select count(*)::int from full_mock_runs, recent where completed_at >= since) mocks_completed,
        (select count(*)::int from payment_orders, recent where status='PAID' and paid_at >= since) premium_activations`);

    const sanity = await client.query(`
      select
        count(*)::int total,
        count(*) filter (where user_id is not null and guest_reference is not null)::int invalid_dual_actor,
        count(*) filter (where jsonb_typeof(properties) <> 'object')::int invalid_properties,
        count(*) filter (where deduplication_key is not null)::int deduplicated_events,
        count(distinct deduplication_key) filter (where deduplication_key is not null)::int unique_deduplication_keys
      from product_events`);
    const s = sanity.rows[0];
    if (s.invalid_dual_actor !== 0 || s.invalid_properties !== 0 || s.deduplicated_events !== s.unique_deduplication_keys) throw new Error("PRODUCT_EVENTS_DATA_INVALID");

    await client.query("rollback");
    console.log("Migration 0025: APPLIED");
    console.log(`Product analytics schema: PASS (${expectedIndexes.length} required indexes)`);
    console.log(`Aggregate query: PASS (events=${analytics.rows[0].event_count}, completed_sessions=${analytics.rows[0].completed_sessions}, questions=${analytics.rows[0].questions_practiced}, diagnostics=${analytics.rows[0].diagnostics_completed}, mocks=${analytics.rows[0].mocks_completed}, premium=${analytics.rows[0].premium_activations})`);
    console.log(`Data sanity: PASS (total_events=${s.total}, invalid_actor=0, invalid_properties=0, duplicate_deduplication_keys=0)`);
    console.log("Task 23 production read-only verification: PASS");
  } finally {
    client.release();
  }
} catch (error) {
  console.error(`Task 23 production read-only verification: FAIL (${error instanceof Error ? error.message : "unknown error"})`);
  process.exitCode = 1;
} finally {
  await pool?.end();
}
