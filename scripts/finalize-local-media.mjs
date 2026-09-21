import { createHash } from "node:crypto";
import { readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

if (!process.argv.includes("--execute")) throw new Error("Pass --execute after copying and backing up all media");
if (!process.env.DATABASE_URL || !process.env.LOCAL_MEDIA_ROOT) throw new Error("DATABASE_URL and LOCAL_MEDIA_ROOT are required");

const root = await realpath(process.env.LOCAL_MEDIA_ROOT);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
let client;
try {
  client = await pool.connect();
  const { rows } = await client.query(
    "select id, storage_key, byte_size, checksum from media_assets where storage_provider <> 'LOCAL' and status = 'READY' order by id",
  );
  for (const row of rows) {
    const target = path.resolve(root, row.storage_key);
    if (!target.startsWith(root + path.sep)) throw new Error(`UNSAFE_MEDIA_KEY:${row.id}`);
    const actual = await realpath(target);
    if (!actual.startsWith(root + path.sep)) throw new Error(`MEDIA_PATH_ESCAPE:${row.id}`);
    const info = await stat(actual);
    const body = await readFile(actual);
    if (!info.isFile() || info.size !== Number(row.byte_size)) throw new Error(`MEDIA_SIZE_MISMATCH:${row.id}`);
    if (row.checksum && createHash("sha256").update(body).digest("hex") !== row.checksum) throw new Error(`MEDIA_CHECKSUM_MISMATCH:${row.id}`);
  }
  await client.query("begin");
  await client.query("update media_assets set storage_provider = 'LOCAL', updated_at = now() where storage_provider <> 'LOCAL'");
  await client.query("commit");
  console.log(`Finalized ${rows.length} READY media assets as LOCAL after filesystem verification.`);
} catch (error) {
  if (client) await client.query("rollback").catch(() => undefined);
  throw error;
} finally {
  client?.release();
  await pool.end();
}
