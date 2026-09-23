import { createHash } from "node:crypto";
import { mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

import { productionListening } from "./content-manifest.mjs";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const generated = resolve(root, ".content-generated");
const newItem = (item) => item.externalId.startsWith("L-P1-FORM25-") ||
  item.part >= 2 && /^L-P[234]-BANK-/.test(item.externalId) &&
  Number(item.externalId.match(/(\d+)$/)?.[1] ?? 0) >= ({ 2: 251, 3: 131, 4: 101 })[item.part];
const items = productionListening.filter(newItem);

function stableUuid(value) {
  const hex = createHash("sha256").update(value).digest("hex").slice(0, 32).split("");
  hex[12] = "5"; hex[16] = ((Number.parseInt(hex[16], 16) & 3) | 8).toString(16);
  const id = hex.join("");
  return `${id.slice(0, 8)}-${id.slice(8, 12)}-${id.slice(12, 16)}-${id.slice(16, 20)}-${id.slice(20)}`;
}

function audioDurationMs(body) {
  let offset = 0;
  if (body.length >= 10 && body[0] === 0x49 && body[1] === 0x44 && body[2] === 0x33) offset = 10 + ((body[6] & 127) << 21) + ((body[7] & 127) << 14) + ((body[8] & 127) << 7) + (body[9] & 127);
  const mpeg1 = [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320];
  const mpeg2 = [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160];
  for (let i = offset; i + 4 <= body.length; i++) {
    if (body[i] !== 255 || (body[i + 1] & 224) !== 224) continue;
    const version = (body[i + 1] >> 3) & 3, layer = (body[i + 1] >> 1) & 3, bitrateIndex = (body[i + 2] >> 4) & 15;
    if (version === 1 || layer !== 1 || bitrateIndex < 1 || bitrateIndex > 14) continue;
    const bitrate = (version === 3 ? mpeg1 : mpeg2)[bitrateIndex];
    return Math.round((body.length - i) * 8 / bitrate);
  }
  throw new Error("Unreadable MP3 duration");
}

async function mediaFor(item, spec) {
  const extension = spec.role === "AUDIO" ? "mp3" : "png";
  const body = await readFile(resolve(generated, `${item.externalId}.${extension}`));
  if (!body.length || body.length > (spec.role === "AUDIO" ? 15 : 5) * 1024 * 1024) throw new Error(`Invalid media size: ${item.externalId}.${extension}`);
  const audio = spec.role === "AUDIO";
  if (audio && body[0] !== 0x49 && body[0] !== 0xff || !audio && !body.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) throw new Error(`Invalid media type: ${item.externalId}.${extension}`);
  const dimensions = audio ? null : { width: body.readUInt32BE(16), height: body.readUInt32BE(20) };
  if (dimensions && (!dimensions.width || !dimensions.height || dimensions.width > 10000 || dimensions.height > 10000)) throw new Error(`Invalid image dimensions: ${item.externalId}`);
  const storageKey = `content/listening/${audio ? "audio" : "images"}/${item.externalId}.${extension}`;
  const target = resolve(process.env.LOCAL_MEDIA_ROOT, storageKey);
  await mkdir(resolve(process.env.LOCAL_MEDIA_ROOT, `content/listening/${audio ? "audio" : "images"}`), { recursive: true });
  const temp = `${target}.${process.pid}.tmp`;
  await writeFile(temp, body);
  await rename(temp, target);
  if ((await stat(target)).size !== body.length) throw new Error(`Media upload failed: ${storageKey}`);
  return {
    id: stableUuid(`task12-media:${item.externalId}:${spec.role}`), role: spec.role, storageKey,
    mimeType: audio ? "audio/mpeg" : "image/png", byteSize: body.length,
    checksum: createHash("sha256").update(body).digest("hex"),
    audioDurationMs: audio ? audioDurationMs(body) : null,
    imageWidth: dimensions?.width ?? null, imageHeight: dimensions?.height ?? null,
  };
}

async function publishItem(client, item) {
  const media = await Promise.all(item.media.map((spec) => mediaFor(item, spec)));
  const setId = stableUuid(`task12-set:${item.externalId}`);
  await client.query("begin");
  try {
    const setType = item.part === 1 ? "part1" : item.part === 2 ? "part2" : item.type;
    await client.query(`insert into passage_sets(id,toeic_part,skill_area,set_type,title,metadata,status)
      values($1,$2,'LISTENING',$3,$4,$5,'published') on conflict(id) do update set status='published',updated_at=now()`,
    [setId,item.part,setType,item.externalId,{ external_id: item.externalId, version: item.version, source: "task_12_production" }]);
    for (const asset of media) {
      await client.query(`insert into media_assets(id,kind,access_scope,storage_provider,storage_key,mime_type,byte_size,checksum,status,audio_duration_ms,image_width,image_height)
        values($1,$2,'CONTENT','LOCAL',$3,$4,$5,$6,'READY',$7,$8,$9) on conflict(id) do update set status='READY',checksum=excluded.checksum,byte_size=excluded.byte_size,updated_at=now()`,
      [asset.id,asset.role,asset.storageKey,asset.mimeType,asset.byteSize,asset.checksum,asset.audioDurationMs,asset.imageWidth,asset.imageHeight]);
      await client.query(`insert into question_group_media(question_group_id,media_asset_id,role,position,alt_text) values($1,$2,$3,1,$4)
        on conflict(question_group_id,role,position) do update set media_asset_id=excluded.media_asset_id,alt_text=excluded.alt_text`,
      [setId,asset.id,asset.role,item.media.find((spec) => spec.role === asset.role)?.altText ?? null]);
    }
    await client.query(`insert into listening_transcripts(id,question_group_id,content) values($1,$2,$3)
      on conflict(id) do update set content=excluded.content,updated_at=now()`,
    [stableUuid(`task12-transcript:${item.externalId}`),setId,item.transcript]);
    for (const question of item.questions ?? [item.question]) {
      const questionId = stableUuid(`task12-question:${item.externalId}:${question.order}`);
      await client.query(`insert into questions(id,toeic_part,skill_area,question_type,response_type,skill,sub_skill,difficulty,question_text,metadata,status,passage_set_id,question_order)
        values($1,$2,'LISTENING',$3,'MULTIPLE_CHOICE',$4,$5,$6,$7,$8,'published',$9,$10)
        on conflict(id) do update set status='published',updated_at=now()`,
      [questionId,item.part,item.type,question.skill,question.subSkill,question.difficulty ?? item.difficulty,question.text,{ external_id: `${item.externalId}-Q${question.order}`, source: "task_12_production" },setId,question.order]);
      for (let index = 0; index < question.options.length; index++) {
        const option = question.options[index];
        const optionId = stableUuid(`task12-option:${item.externalId}:${question.order}:${option.key}`);
        await client.query(`insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,$3,$4,$5)
          on conflict(id) do update set option_text=excluded.option_text,display_order=excluded.display_order`,
        [optionId,questionId,option.key,option.text,index+1]);
        if (option.key === question.correctKey) await client.query(`insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi)
          values($1,$2,$3,$4) on conflict(question_id) do update set correct_option_id=excluded.correct_option_id,explanation_en=excluded.explanation_en,explanation_vi=excluded.explanation_vi,updated_at=now()`,
        [questionId,optionId,question.explanationEn,question.explanationVi]);
      }
    }
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw new Error(`${item.externalId}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

async function run() {
  if (items.length !== 810 || items.reduce((count, item) => count + (item.questions?.length ?? 1), 0) !== 1500) throw new Error("Unexpected 25-form Listening distribution");
  for (const item of items) for (const spec of item.media) await stat(resolve(generated, `${item.externalId}.${spec.role === "AUDIO" ? "mp3" : "png"}`));
  if (process.argv.includes("--dry-run")) { console.log(`Media ready for ${items.length} new Listening groups and 1,500 questions.`); return; }
  if (!process.env.DATABASE_URL || !process.env.LOCAL_MEDIA_ROOT) throw new Error("DATABASE_URL and LOCAL_MEDIA_ROOT are required");
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const client = await pool.connect();
  try {
    for (const [index, item] of items.entries()) {
      await publishItem(client, item);
      if ((index + 1) % 50 === 0) console.log(`Published ${index + 1}/${items.length} Listening groups`);
    }
    const ids = items.flatMap((item) => (item.questions ?? [item.question]).map((question) => stableUuid(`task12-question:${item.externalId}:${question.order}`)));
    const result = await client.query(`select count(*)::int as total from questions where id=any($1::uuid[]) and status='published'`, [ids]);
    if (result.rows[0].total !== 1500) throw new Error(`Expected 1,500 new published Listening questions; found ${result.rows[0].total}`);
    console.log("Verified 1,500 new published Listening questions.");
  } finally {
    client.release(); await pool.end();
  }
}

run().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
