import { createHash } from "node:crypto";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const provider = process.env.MEDIA_STORAGE_PROVIDER ?? "R2";
const root = process.env.LOCAL_MEDIA_ROOT;
const r2Configured = ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"].every((name) => Boolean(process.env[name]));
console.log(`Provider: ${provider}`);
console.log(`LOCAL root: ${root ? "CONFIGURED" : "NOT CONFIGURED"}`);
console.log(`R2 rollback config: ${r2Configured ? "CONFIGURED" : "NOT CONFIGURED"}`);
if (provider === "R2") {
  console.log("LOCAL media verification: NOT APPLICABLE / PROVIDER IS R2");
} else if (provider !== "LOCAL" || !root || !process.env.DATABASE_URL) {
  console.error("LOCAL media verification: FAIL (configuration incomplete)"); process.exitCode = 1;
} else {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 5000 });
  try {
    const base = await realpath(root);
    const { rows } = await pool.query("select storage_key, byte_size, checksum, mime_type from media_assets where storage_provider='LOCAL' and status='READY'");
    const { rows: [{ remaining }] } = await pool.query("select count(*)::int as remaining from media_assets where storage_provider='R2' and status='READY'");
    const known = new Set(rows.map((row) => row.storage_key));
    let missing = 0, unsafe = 0, sizeMismatch = 0, checksumMismatch = 0, metadataMismatch = 0, files = 0, orphans = 0;
    for (const row of rows) {
      const key = row.storage_key;
      const target = path.resolve(base, key);
      if (!key || key.includes("\\") || key.split("/").includes("..") || !target.startsWith(base + path.sep)) { unsafe++; continue; }
      try {
        const actual = await realpath(target);
        if (!actual.startsWith(base + path.sep)) { unsafe++; continue; }
        const info = await stat(actual);
        if (!info.isFile()) { metadataMismatch++; continue; }
        const body = await readFile(actual);
        if (info.size !== Number(row.byte_size)) sizeMismatch++;
        if (row.checksum && createHash("sha256").update(body).digest("hex") !== row.checksum) checksumMismatch++;
        if (!["audio/mpeg", "image/jpeg", "image/png", "image/webp"].includes(row.mime_type)) metadataMismatch++;
      } catch (error) { if (error.code === "ENOENT") missing++; else metadataMismatch++; }
    }
    async function walk(dir, prefix = "") {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const key = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) await walk(path.join(dir, entry.name), key);
        else if (entry.isFile() && !entry.name.endsWith(".tmp")) { files++; if (!known.has(key)) orphans++; }
        else if (entry.isSymbolicLink()) unsafe++;
      }
    }
    await walk(base);
    console.log(`DB LOCAL READY assets: ${rows.length}`);
    console.log(`DB R2 READY assets awaiting migration: ${remaining}`);
    console.log(`LOCAL files: ${files}`);
    console.log(`Missing DB-backed files: ${missing}`);
    console.log(`Size mismatch: ${sizeMismatch}; SHA-256 mismatch: ${checksumMismatch}; metadata mismatch: ${metadataMismatch}`);
    console.log(`Unsafe entries: ${unsafe}; unexpected/orphan files: ${orphans}`);
    const failed = missing + unsafe + sizeMismatch + checksumMismatch + metadataMismatch + orphans + remaining;
    console.log(`LOCAL media verification: ${failed === 0 ? "PASS" : "FAIL"}`);
    if (failed) process.exitCode = 1;
  } catch { console.error("LOCAL media verification: FAIL (database or media root unavailable)"); process.exitCode = 1; }
  finally { await pool.end(); }
}
