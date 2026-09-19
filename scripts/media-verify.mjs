import { createHash } from "node:crypto";
import { readdir, readFile, realpath, stat } from "node:fs/promises";
import path from "node:path";
import pg from "pg";

const provider = process.env.MEDIA_STORAGE_PROVIDER ?? "R2";
const root = process.env.LOCAL_MEDIA_ROOT;
const r2Configured = ["R2_ENDPOINT", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME"].every((name) => Boolean(process.env[name]));
console.log(`Provider: ${provider}`);
console.log(`LOCAL root: ${root || "NOT CONFIGURED"}`);
console.log(`R2 rollback config: ${r2Configured ? "CONFIGURED" : "NOT CONFIGURED"}`);
if (provider !== "LOCAL" || !root || !process.env.DATABASE_URL) {
  console.error("LOCAL_VERIFY_CONFIGURATION_INCOMPLETE"); process.exitCode = 1;
} else {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1, connectionTimeoutMillis: 5000 });
  try {
    const base = await realpath(root);
    const { rows } = await pool.query("select storage_key, byte_size, checksum, mime_type from media_assets where storage_provider='LOCAL' and status='READY'");
    const known = new Set(rows.map((row) => row.storage_key));
    let missing = 0, invalid = 0, files = 0, orphans = 0;
    for (const row of rows) {
      const key = row.storage_key;
      const target = path.resolve(base, key);
      if (!key || key.includes("\\") || key.split("/").includes("..") || !target.startsWith(base + path.sep)) { invalid++; continue; }
      try {
        const actual = await realpath(target);
        if (!actual.startsWith(base + path.sep)) { invalid++; continue; }
        const info = await stat(actual);
        if (!info.isFile()) { invalid++; continue; }
        const body = await readFile(actual);
        if (info.size !== Number(row.byte_size) || createHash("sha256").update(body).digest("hex") !== row.checksum ||
            !["audio/mpeg", "image/jpeg", "image/png", "image/webp"].includes(row.mime_type)) invalid++;
      } catch (error) { if (error.code === "ENOENT") missing++; else invalid++; }
    }
    async function walk(dir, prefix = "") {
      for (const entry of await readdir(dir, { withFileTypes: true })) {
        const key = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) await walk(path.join(dir, entry.name), key);
        else if (entry.isFile() && !entry.name.endsWith(".tmp")) { files++; if (!known.has(key)) orphans++; }
        else if (entry.isSymbolicLink()) invalid++;
      }
    }
    await walk(base);
    console.log(`DB LOCAL READY assets: ${rows.length}`);
    console.log(`LOCAL files: ${files}`);
    console.log(`Missing: ${missing}; invalid metadata/content: ${invalid}; unexpected files: ${orphans}`);
    console.log(`LOCAL readiness: ${missing === 0 && invalid === 0 ? "PASS" : "FAIL"}`);
    if (missing || invalid) process.exitCode = 1;
  } catch { console.error("LOCAL_VERIFY_FAILED: database or media root unavailable"); process.exitCode = 1; }
  finally { await pool.end(); }
}
