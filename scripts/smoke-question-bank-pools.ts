import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { pool } from "../src/db";
import { selectListeningPractice, selectReadingPractice } from "../src/lib/practice/selector";
import { getFullMockReadiness, getChallengeFormReadiness } from "../src/lib/full-mock/service";
import { createConfiguredMediaStorage, mediaPublishingConfigFromEnv } from "../src/lib/media/configured-storage";
import { safeMediaPath } from "../src/lib/media/local-storage";

async function requirePool(ids: string[], expected: string) {
  assert.ok(ids.length > 0);
  const { rows } = await pool.query("select id,bank_pool from questions where id=any($1::uuid[])", [ids]);
  assert.equal(rows.length, ids.length);
  assert.ok(rows.every(row => row.bank_pool === expected), `Unexpected pool; expected ${expected}`);
}

async function main() {
  assert.equal(process.env.PRACTICE_POOL_ISOLATED, "true");
  for (const part of [1, 2, 3, 4] as const) {
    const selected = await selectListeningPractice(part, 3);
    const ids = selected.map(question => question.id);
    await requirePool(ids, "PRACTICE");
    console.log(`Part ${part}: selected ${ids.length} Practice questions`);
  }
  for (const part of [5, 6, 7] as const) {
    const selected = await selectReadingPractice({ mode: `part_${part}`, targetQuestionCount: 10, source: "custom" });
    await requirePool(selected.questionIds, "PRACTICE");
    console.log(`Part ${part}: selected ${selected.actualQuestionCount} Practice questions`);
  }
  const mock = await getFullMockReadiness();
  assert.equal(mock.ready, true);
  assert.equal(mock.form?.questionIds.length, 200);
  await requirePool(mock.form!.questionIds, "MOCK");
  const challenge = await getChallengeFormReadiness();
  assert.equal(challenge.ready, true);
  assert.equal(challenge.form?.questionIds.length, 200);
  await requirePool(challenge.form!.questionIds, "PRACTICE");
  console.log("Full Mock and Challenge: 200 questions each, separate pools");

  const config = mediaPublishingConfigFromEnv();
  const storage = createConfiguredMediaStorage(config);
  const { rows: assets } = await pool.query(`select distinct m.id,m.kind,m.storage_key,m.byte_size,m.checksum
    from media_assets m join question_group_media gm on gm.media_asset_id=m.id
    join questions q on q.passage_set_id=gm.question_group_id
    where q.bank_pool='PRACTICE' and q.status='published'`);
  assert.equal(assets.length, 1600);
  const sampledKinds = new Set<string>();
  for (const asset of assets) {
    const body = await readFile(safeMediaPath(config.localRoot!, asset.storage_key));
    assert.equal(body.length, Number(asset.byte_size));
    assert.equal(createHash("sha256").update(body).digest("hex"), asset.checksum);
    if (!sampledKinds.has(asset.kind)) {
      const response = await fetch(await storage.createReadUrl(asset.storage_key), { signal: AbortSignal.timeout(20_000) });
      assert.equal(response.status, 200, `Public ${asset.kind} request failed`);
      assert.equal(createHash("sha256").update(new Uint8Array(await response.arrayBuffer())).digest("hex"), asset.checksum);
      sampledKinds.add(asset.kind);
    }
  }
  console.log("All 1,600 media checksums verified; public audio and image requests passed");
}

main().catch(error => { console.error(error); process.exitCode = 1; }).finally(() => pool.end());
