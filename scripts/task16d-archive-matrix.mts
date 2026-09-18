import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";
const url=new URL(process.env.TASK16_TEST_DATABASE_URL??process.env.DATABASE_URL??"");assert.equal(url.hostname,"127.0.0.1");assert.equal(url.port,"15433");process.env.DATABASE_URL=url.href;
const pool=new pg.Pool({connectionString:url.href});
const challenge=await import("../src/lib/challenges/admin.ts");const content=await import("../src/lib/admin/content.ts");
const service=await import("../src/lib/challenges/service.ts");const practice=await import("../src/lib/practice/queries.ts");
const admin=(await pool.query(`select id from users where email_normalized='admin@task16c.invalid'`)).rows[0].id;
try{
  await pool.query(`update ranked_challenges set status='CANCELLED',cancelled_at=now() where status='PUBLISHED'`);
  const source=(await pool.query(`select id from passage_sets where toeic_part=1 and status='published' limit 1`)).rows[0].id;const extra=randomUUID();
  await pool.query(`insert into passage_sets(id,toeic_part,skill_area,set_type,title,status,provenance,published_at) select $1,toeic_part,skill_area,set_type,'Task16D archive surplus',status,provenance,now() from passage_sets where id=$2`,[extra,source]);
  await pool.query(`insert into question_group_media(question_group_id,media_asset_id,role,position,alt_text) select $1,media_asset_id,role,position,alt_text from question_group_media where question_group_id=$2`,[extra,source]);
  await pool.query(`insert into listening_transcripts(question_group_id,content) select $1,content from listening_transcripts where question_group_id=$2`,[extra,source]);
  const sourceQ=(await pool.query(`select id from questions where passage_set_id=$1`,[source])).rows[0].id;const q=randomUUID();
  await pool.query(`insert into questions(id,toeic_part,skill_area,question_type,response_type,skill,sub_skill,difficulty,question_text,status,provenance,published_at,passage_set_id,question_order) select $1,toeic_part,skill_area,question_type,response_type,skill,sub_skill,difficulty,question_text,status,provenance,now(),$2,1 from questions where id=$3`,[q,extra,sourceQ]);
  const options=(await pool.query(`select * from question_options where question_id=$1 order by display_order`,[sourceQ])).rows;let correct="";const sourceCorrect=(await pool.query(`select correct_option_id from question_solutions where question_id=$1`,[sourceQ])).rows[0].correct_option_id;
  for(const option of options){const id=randomUUID();if(option.id===sourceCorrect)correct=id;await pool.query(`insert into question_options(id,question_id,option_key,option_text,display_order) values($1,$2,$3,$4,$5)`,[id,q,option.option_key,option.option_text,option.display_order]);}
  await pool.query(`insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi) values($1,$2,'Archive matrix','Archive matrix')`,[q,correct]);
  const now=new Date();const draft=await challenge.createChallengeDraft(admin,{type:"FULL_200",titleEn:"Archive matrix",titleVi:"Archive matrix",startsAt:new Date(now.getTime()+60_000),endsAt:new Date(now.getTime()+130*60_000)});await challenge.generateChallengeForm(admin,draft);
  const referenced=(await pool.query(`select group_id from ranked_challenge_items where challenge_id=$1 and part=1 limit 1`,[draft])).rows[0].group_id;
  await content.archiveContent(admin,referenced);
  await assert.rejects(challenge.publishChallenge(admin,draft),/INVALID_FORM/);
  await pool.query(`update passage_sets set status='published',archived_at=null where id=$1`,[referenced]);await pool.query(`update questions set status='published',archived_at=null where passage_set_id=$1`,[referenced]);
  await challenge.generateChallengeForm(admin,draft);await challenge.publishChallenge(admin,draft);
  const activeGroup=(await pool.query(`select group_id from ranked_challenge_items where challenge_id=$1 and part=1 limit 1`,[draft])).rows[0].group_id;
  await assert.rejects(content.archiveContent(admin,activeGroup),e=>e instanceof content.ContentAdminError&&e.code==="CONTENT_USED_BY_ACTIVE_CHALLENGE");
  await pool.query(`update ranked_challenges set starts_at=now()-interval '1 minute',ends_at=now()+interval '3 hours' where id=$1`,[draft]);
  await assert.rejects(content.archiveContent(admin,activeGroup),e=>e instanceof content.ContentAdminError&&e.code==="CONTENT_USED_BY_ACTIVE_CHALLENGE");
  const reviewer=randomUUID(),email=`archive-${reviewer}@task16d.invalid`;await pool.query(`insert into users(id,email,email_normalized,status,email_verified_at) values($1,$2,$2,'active',now())`,[reviewer,email]);await pool.query(`insert into profiles(id,full_name,ranking_visibility) values($1,'Archive reviewer','PUBLIC')`,[reviewer]);
  const started=await service.startRankedChallenge(draft,reviewer,new Date());assert.ok(started.ok);await service.finalizeRankedSection(started.runId,reviewer,"LISTENING",new Date());const transitioned=await service.getRankedRun(started.runId,reviewer);await service.finalizeRankedSection(started.runId,reviewer,"READING",new Date(transitioned!.run.readingDeadline!.getTime()+1));
  await pool.query(`update ranked_challenges set starts_at=now()-interval '4 hours',ends_at=now()-interval '1 second' where id=$1`,[draft]);
  await content.archiveContent(admin,activeGroup);assert.equal((await pool.query(`select status from passage_sets where id=$1`,[activeGroup])).rows[0].status,"archived");
  const completed=await service.getRankedRun(started.runId,reviewer);assert.notEqual(await practice.getPracticeResult(completed!.sessions[0].id,{userId:reviewer}),null);
  console.log("TASK16D_ARCHIVE_MATRIX_PASS");
}finally{await pool.end();const{pool:appPool}=await import("../src/db/index.ts");await appPool.end();}
