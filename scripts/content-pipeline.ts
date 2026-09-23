import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { deflateSync } from "node:zlib";
import pg from "pg";
import { listeningManifest, productionListening } from "./content-manifest.mjs";
import { validateMediaUpload } from "../src/lib/media/validation";
import { createConfiguredMediaStorage, mediaPublishingConfigFromEnv } from "../src/lib/media/configured-storage";
import { createContentTtsProvider, selectContentVoice, type ContentTtsProviderName } from "../src/lib/content/tts";
import { planListeningAudio, synthesizeListeningAudio } from "../src/lib/content/audio-segments";

const generatedDir = resolve(".content-generated");
const isDryRun = process.argv.includes("--dry-run");
const includeBaseline = process.argv.includes("--include-baseline");
const forceGeneration = process.argv.includes("--force");
const selectedId = process.argv.find(arg => arg.startsWith("--id="))?.slice(5);
const selectedParts = process.argv.find(arg => arg.startsWith("--parts="))?.slice(8).split(",").map(Number);
const audioOnly = process.argv.includes("--audio-only");
if (selectedParts && (selectedParts.length === 0 || selectedParts.some(part => ![1, 2, 3, 4].includes(part)))) throw new Error("INVALID_LISTENING_PARTS");
const command = process.argv.find(arg => ["validate", "generate-media", "publish", "report"].includes(arg)) ?? "validate";
const audioTimingVersion = 2;
const audioFingerprint = (item: { transcript: string; part: number; question?: { options: { key: string; text: string }[] } }, voice: string, providerName: ContentTtsProviderName) =>
  createHash("sha256").update(JSON.stringify({ segments: planListeningAudio(item), voice, providerName, model: process.env.CONTENT_TTS_MODEL, audioTimingVersion })).digest("hex");
for (const item of productionListening) {
  const fields = [item.transcript, ...(item.questions ?? [item.question]).flatMap(question => [question.text, question.explanationEn, question.explanationVi, ...question.options.map(option => option.text)])];
  if (fields.some(value => /\$\{[^}]+\}/.test(value ?? ""))) throw new Error(`UNRESOLVED_CONTENT_TEMPLATE:${item.externalId}`);
}
const stableUuid = (value: string) => { const h = createHash("sha256").update(value).digest("hex").slice(0, 32).split(""); h[12] = "5"; h[16] = ((Number.parseInt(h[16], 16) & 3) | 8).toString(16); const s = h.join(""); return `${s.slice(0,8)}-${s.slice(8,12)}-${s.slice(12,16)}-${s.slice(16,20)}-${s.slice(20)}`; };
const crcTable = Array.from({ length: 256 }, (_, n) => { let c=n; for(let k=0;k<8;k++) c=(c&1)?0xedb88320^(c>>>1):c>>>1; return c>>>0; });
const crc = (b: Buffer) => { let c=0xffffffff; for(const x of b)c=crcTable[(c^x)&255]^(c>>>8); return (c^0xffffffff)>>>0; };
const chunk = (name: string, data: Buffer) => { const n=Buffer.from(name); const out=Buffer.alloc(data.length+12); out.writeUInt32BE(data.length); n.copy(out,4); data.copy(out,8); out.writeUInt32BE(crc(Buffer.concat([n,data])),8+data.length); return out; };
function courierPng() { const w=960,h=540, raw=Buffer.alloc((w*4+1)*h); for(let y=0;y<h;y++){const row=y*(w*4+1); for(let x=0;x<w;x++){const i=row+1+x*4; const counter=y>330; raw[i]=counter?126:232;raw[i+1]=counter?91:238;raw[i+2]=counter?62:242;raw[i+3]=255;} } const rect=(x0:number,y0:number,x1:number,y1:number,r:number,g:number,b:number)=>{for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=y*(w*4+1)+1+x*4;raw[i]=r;raw[i+1]=g;raw[i+2]=b;}}; rect(610,265,790,370,190,132,55);rect(250,170,330,330,38,93,130);rect(220,120,350,190,62,125,168);rect(405,240,600,335,219,174,92); const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6; return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk("IHDR",ih),chunk("IDAT",deflateSync(raw)),chunk("IEND",Buffer.alloc(0))]); }
async function validate() { const ids=new Set<string>(),distractorSets=new Map<string,string>();const mojibake=/(?:Ã.|Â.|Ä.|Æ.|â€|ï¿½)/;for(const item of productionListening){if(ids.has(item.externalId))throw new Error(`DUPLICATE_CONTENT_ID:${item.externalId}`);ids.add(item.externalId);if(!item.transcript?.trim())throw new Error(`MISSING_TRANSCRIPT:${item.externalId}`);for(const question of item.questions??[item.question]){const text=[item.transcript,question.text,question.explanationEn,question.explanationVi,...question.options.map((option:{text:string})=>option.text)];if(text.some(value=>mojibake.test(value)))throw new Error(`MOJIBAKE_DETECTED:${item.externalId}`);if(item.part>=3){const distractors=question.options.filter((option:{key:string})=>option.key!==question.correctKey).map((option:{text:string})=>option.text.trim().toLowerCase()).sort().join("|");const previous=distractorSets.get(distractors);if(previous)throw new Error(`REUSED_DISTRACTOR_SET:${previous}:${item.externalId}:Q${question.order}`);distractorSets.set(distractors,`${item.externalId}:Q${question.order}`);}}}console.log(`Manifest valid: ${productionListening.length} groups, ${productionListening.reduce((n,i)=>n+(i.questions?.length??1),0)} questions.`); }
async function generate() {
  await mkdir(generatedDir, { recursive: true });
  let generated = 0, skipped = 0;
  const allItems = includeBaseline ? productionListening : listeningManifest;
  const items = allItems.filter(item => (!selectedId || item.externalId === selectedId) && (!selectedParts || selectedParts.includes(item.part)));
  if (selectedId && !items.length) throw new Error(`LISTENING_AUDIO_ID_NOT_FOUND:${selectedId}`);
  for (const item of items) for (const spec of (audioOnly ? [] : item.media.filter(m => m.role === "IMAGE"))) {
    const image = resolve(generatedDir, `${item.externalId}.png`);
    if (existsSync(image) && !forceGeneration) { skipped++; continue; }
    const authored = resolve(spec.assetRef);
    await writeFile(image, existsSync(authored) ? await readFile(authored) : courierPng());
    generated++;
  }
  const providerName = (process.env.CONTENT_TTS_PROVIDER || "edge").toLowerCase() as ContentTtsProviderName;
  const provider = createContentTtsProvider({ provider: providerName, openAiApiKey: process.env.OPENAI_API_KEY, openAiModel: process.env.CONTENT_TTS_MODEL });
  for (const item of items) {
    const path = resolve(generatedDir, `${item.externalId}.mp3`);
    const metadataPath = `${path}.json`;
    const voice = selectContentVoice(providerName, item.externalId);
    const segments = planListeningAudio(item);
    const fingerprint = audioFingerprint(item, voice, providerName);
    const current = existsSync(metadataPath) ? JSON.parse(await readFile(metadataPath, "utf8")) as { fingerprint?: string } : null;
    if (existsSync(path) && !forceGeneration && (item.part > 2 || current?.fingerprint === fingerprint)) { skipped++; continue; }
    let body: Uint8Array | undefined;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try { body = await synthesizeListeningAudio(provider, { voice, locale: "en-US", outputFormat: "mp3" }, segments); break; }
      catch (error) {
        if (attempt === 3) throw error;
        console.warn(`Retrying audio ${item.externalId} after attempt ${attempt}`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
      }
    }
    if (!body) throw new Error(`LISTENING_AUDIO_GENERATION_FAILED:${item.externalId}`);
    await writeFile(path, body);
    await writeFile(metadataPath, JSON.stringify({ fingerprint, audioTimingVersion }) + "\n");
    generated++;
    console.log(`Generated audio ${item.externalId} (${generated}/${items.length})`);
  }
  console.log(`TTS provider: ${providerName}`);
  console.log(`Generated: ${generated}`);
  console.log(`Skipped: ${skipped}`);
  console.log("Failed: 0");
}
async function publish() {
  await validate(); const additions=includeBaseline?productionListening:listeningManifest;
  for(const item of additions){item.type??=item.part===1?"photograph":"question_response";item.difficulty??="medium";for(const [index,question] of (item.questions??[item.question]).entries())question.order??=index+1;}
  if(isDryRun){console.log(`DRY RUN: would publish ${additions.length} groups and ${additions.reduce((n,i)=>n+(i.questions?.length??1),0)} questions; would upload ${additions.reduce((n,i)=>n+i.media.length,0)} media assets.`);return;}
  const providerName = (process.env.CONTENT_TTS_PROVIDER || "edge").toLowerCase() as ContentTtsProviderName;
  for (const item of additions.filter(item => item.part <= 2)) {
    const metadataPath = resolve(generatedDir, `${item.externalId}.mp3.json`);
    const metadata = existsSync(metadataPath) ? JSON.parse(await readFile(metadataPath, "utf8")) as { fingerprint?: string } : null;
    if (metadata?.fingerprint !== audioFingerprint(item, selectContentVoice(providerName, item.externalId), providerName)) {
      throw new Error(`LISTENING_AUDIO_REGENERATION_REQUIRED:${item.externalId}`);
    }
  }
  if(!process.env.DATABASE_URL)throw new Error("MISSING_ENV:DATABASE_URL");
  const storageConfig=mediaPublishingConfigFromEnv(); const storage=createConfiguredMediaStorage(storageConfig); const pool=new pg.Pool({connectionString:process.env.DATABASE_URL}); const client=await pool.connect();
  try { await client.query("begin");try{await client.query(`update questions set status='archived',updated_at=now() where passage_set_id in (select id from passage_sets where metadata->>'external_id' like 'dev-listening-%')`);await client.query(`update passage_sets set status='archived',updated_at=now() where metadata->>'external_id' like 'dev-listening-%'`);await client.query("commit");}catch(e){await client.query("rollback");throw e;}for(const item of additions){const mediaRows=[];for(const spec of item.media){const ext=spec.role==="AUDIO"?"mp3":"png";const local=resolve(generatedDir,`${item.externalId}.${ext}`);if(!existsSync(local))throw new Error(`MISSING_GENERATED_MEDIA:${item.externalId}.${ext}`);const body=new Uint8Array(await readFile(local));const meta=await validateMediaUpload({kind:spec.role,accessScope:"CONTENT",mimeType:spec.role==="AUDIO"?"audio/mpeg":"image/png",body});if(spec.role==="AUDIO"&&!meta.audioDurationMs)throw new Error(`AUDIO_DURATION_UNREADABLE:${item.externalId}`);const id=stableUuid(`task12-media:${item.externalId}:${spec.role}`),storageKey=`content/listening/${spec.role==="AUDIO"?"audio":"images"}/${item.externalId}.${ext}`;await storage.upload({key:storageKey,body,contentType:meta.mimeType});if(!await storage.exists(storageKey))throw new Error(`UPLOAD_NOT_VERIFIED:${item.externalId}`);mediaRows.push({id,role:spec.role,storageKey,...meta});}
    await client.query("begin");try{const setId=stableUuid(`task12-set:${item.externalId}`);const setType=item.part===1?"part1":item.part===2?"part2":item.type;await client.query(`insert into passage_sets(id,toeic_part,skill_area,set_type,title,metadata,status) values($1,$2,'LISTENING',$3,$4,$5,'published') on conflict(id) do update set metadata=excluded.metadata,status='published',updated_at=now()`,[setId,item.part,setType,item.externalId,{external_id:item.externalId,version:item.version,source:"task_12_production"}]);for(const m of mediaRows){await client.query(`insert into media_assets(id,kind,access_scope,storage_provider,storage_key,mime_type,byte_size,checksum,status,audio_duration_ms,image_width,image_height) values($1,$2,'CONTENT','LOCAL',$3,$4,$5,$6,'READY',$7,$8,$9) on conflict(id) do update set storage_provider=excluded.storage_provider,status='READY',checksum=excluded.checksum,byte_size=excluded.byte_size,updated_at=now()`,[m.id,m.role,m.storageKey,m.mimeType,m.byteSize,m.checksum,m.audioDurationMs,m.imageWidth,m.imageHeight]);await client.query(`insert into question_group_media(question_group_id,media_asset_id,role,position,alt_text) values($1,$2,$3,1,$4) on conflict(question_group_id,role,position) do update set media_asset_id=excluded.media_asset_id,alt_text=excluded.alt_text`,[setId,m.id,m.role,item.media.find(x=>x.role===m.role)?.altText??null]);}await client.query(`delete from listening_transcripts where question_group_id=$1`,[setId]);await client.query(`insert into listening_transcripts(id,question_group_id,content) values($1,$2,$3)`,[stableUuid(`task12-transcript:${item.externalId}`),setId,item.transcript]);const questions=item.questions??[item.question];for(const question of questions){const qid=stableUuid(`task12-question:${item.externalId}:${question.order}`);await client.query(`insert into questions(id,toeic_part,skill_area,question_type,response_type,skill,sub_skill,difficulty,question_text,metadata,status,passage_set_id,question_order) values($1,$2,'LISTENING',$3,'MULTIPLE_CHOICE',$4,$5,$6,$7,$8,'published',$9,$10) on conflict(id) do update set question_text=excluded.question_text,metadata=excluded.metadata,status='published',updated_at=now()`,[qid,item.part,item.type,question.skill,question.subSkill,question.difficulty??item.difficulty,question.text,{external_id:`${item.externalId}-Q${question.order}`,source:"task_12_production"},setId,question.order]);for(let x=0;x<question.options.length;x++){const o=question.options[x],oid=stableUuid(`task12-option:${item.externalId}:${question.order}:${o.key}`);await client.query(`insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,$3,$4,$5) on conflict(id) do update set option_text=excluded.option_text,display_order=excluded.display_order`,[oid,qid,o.key,o.text,x+1]);if(o.key===question.correctKey)await client.query(`insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi) values($1,$2,$3,$4) on conflict(question_id) do update set correct_option_id=excluded.correct_option_id,explanation_en=excluded.explanation_en,explanation_vi=excluded.explanation_vi,updated_at=now()`,[qid,oid,question.explanationEn,question.explanationVi]);}}await client.query("commit");}catch(e){await client.query("rollback");throw e;}}
    console.log(`Published ${additions.length} Listening groups idempotently.`);
  } finally {client.release();await pool.end();}
}
async function report(){await validate();await mkdir(generatedDir,{recursive:true});const rows=productionListening.map(i=>`| ${i.externalId} | ${i.part} | ${i.questions?.length??1} | ${existsSync(resolve(generatedDir,`${i.externalId}.mp3`))?"GENERATED":"PENDING"} |`);await writeFile(resolve(generatedDir,"review-report.md"),`# Listening content review\n\n| Content ID | Part | Questions | Audio |\n|---|---:|---:|---|\n${rows.join("\n")}\n`);console.log("Wrote .content-generated/review-report.md");}
async function main() {
  const handler = { validate, "generate-media": generate, publish, report }[command] as () => Promise<void>;
  await handler();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
