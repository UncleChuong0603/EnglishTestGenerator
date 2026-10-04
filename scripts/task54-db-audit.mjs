// Read-only production database structure and workload signals. Output is
// limited to schema names, counts, sizes and PostgreSQL statistics.
import { execFileSync } from "node:child_process";

const project = "toeic-gym-frontend-bhwkds";
const code = String.raw`
const { Client } = require("pg");
const client = new Client({ connectionString: process.env.DATABASE_URL });
(async () => {
  await client.connect();
  await client.query("BEGIN READ ONLY");
  const one = async (text) => (await client.query(text)).rows[0];
  const rows = async (text) => (await client.query(text)).rows;
  const version = await one("select current_setting('server_version_num')::int as number");
  const integrity = await one("select count(*) filter (where not i.indisvalid)::int as invalid_indexes, count(*) filter (where not i.indisready)::int as unready_indexes from pg_index i join pg_class c on c.oid=i.indexrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public'");
  const constraints = await one("select count(*) filter (where not convalidated)::int as unvalidated_constraints from pg_constraint c join pg_namespace n on n.oid=c.connamespace where n.nspname='public'");
  const artifacts = await rows("select relname as name from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') and relname ~* '(^|_)(old|tmp|temp|backup|bak)(_|$)' order by relname");
  const withoutPrimaryKey = await rows("select c.relname as name from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('r','p') and not exists (select 1 from pg_index i where i.indrelid=c.oid and i.indisprimary) order by c.relname");
  const topTables = await rows("select relname as table, seq_scan::bigint, idx_scan::bigint, n_live_tup::bigint from pg_stat_user_tables order by seq_tup_read desc nulls last, relname limit 12");
  const capabilities = await one("select exists(select 1 from pg_extension where extname='pg_stat_statements') as pg_stat_statements");
  const size = await one("select pg_database_size(current_database())::bigint as bytes");
  console.log(JSON.stringify({
    postgresMajor: Math.floor(version.number / 10000),
    databaseBytes: Number(size.bytes),
    invalidIndexes: integrity.invalid_indexes,
    unreadyIndexes: integrity.unready_indexes,
    unvalidatedConstraints: constraints.unvalidated_constraints,
    orphanLikeRelations: artifacts.map((row) => row.name),
    tablesWithoutPrimaryKey: withoutPrimaryKey.map((row) => row.name),
    pgStatStatements: capabilities.pg_stat_statements,
    topTables: topTables.map((row) => ({
      table: row.table,
      seqScan: Number(row.seq_scan),
      idxScan: Number(row.idx_scan),
      estimatedRows: Number(row.n_live_tup),
    })),
  }));
  await client.query("ROLLBACK");
  await client.end();
})().catch(() => {
  console.log(JSON.stringify({ auditFailed: true }));
  process.exit(1);
});
`;

try {
  const output = execFileSync("docker", ["exec", `${project}-app-1`, "node", "-e", code], {
    encoding: "utf8",
    timeout: 30_000,
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
  const result = JSON.parse(output);
  console.log(JSON.stringify(result));
  if (result.auditFailed || result.postgresMajor !== 17 || result.invalidIndexes !== 0 || result.unreadyIndexes !== 0 || result.unvalidatedConstraints !== 0 || result.orphanLikeRelations?.length) process.exitCode = 1;
} catch {
  console.log(JSON.stringify({ auditFailed: true }));
  process.exitCode = 1;
}
