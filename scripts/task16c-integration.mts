import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";

const url = new URL(process.env.DATABASE_URL ?? "");
assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.port, "15433");

const pool = new pg.Pool({ connectionString: url.href, max: 4 });
const ids = { admin: randomUUID(), alice: randomUUID(), bob: randomUUID(), hidden: randomUUID() };

async function query(text: string, values: unknown[] = []) {
  return pool.query(text, values);
}

async function seedUser(id: string, name: string, visibility: string) {
  await query(
    `insert into users(id,email,email_normalized,status,email_verified_at)
     values($1,$2,$2,'active',now())`,
    [id, `${name.toLowerCase()}@task16c.invalid`],
  );
  await query(
    `insert into profiles(id,full_name,ranking_visibility) values($1,$2,$3)`,
    [id, name, visibility],
  );
}

type GroupSpec = { part: number; type: string; questions: number; documents?: number };

async function seedGroup(spec: GroupSpec, ordinal: number) {
  const area = spec.part <= 4 ? "LISTENING" : "READING";
  const setId = randomUUID();
  await query(
    `insert into passage_sets(id,toeic_part,skill_area,set_type,title,status,published_at)
     values($1,$2,$3,$4,$5,'published',now())`,
    [setId, spec.part, area, spec.type, `Task16C P${spec.part} G${ordinal}`],
  );

  let firstPassageId: string | null = null;
  for (let position = 1; position <= (spec.documents ?? (spec.part >= 6 ? 1 : 0)); position++) {
    const passageId = randomUUID();
    firstPassageId ??= passageId;
    await query(
      `insert into passages(id,toeic_part,passage_type,title,content,status,passage_set_id,position,document_type)
       values($1,$2,$3,$4,$5,'published',$6,$7,'email')`,
      [passageId, spec.part, "document", `Document ${position}`, "Fixture document", setId, position],
    );
  }

  if (spec.part <= 4) {
    const audio = randomUUID();
    await query(
      `insert into media_assets(id,kind,access_scope,storage_key,mime_type,byte_size,checksum,status,audio_duration_ms)
       values($1,'AUDIO','CONTENT',$2,'audio/mpeg',100,'fixture','READY',1000)`,
      [audio, `task16c/audio/${setId}.mp3`],
    );
    await query(
      `insert into question_group_media(question_group_id,media_asset_id,role,position)
       values($1,$2,'AUDIO',1)`,
      [setId, audio],
    );
    if (spec.part === 1) {
      const image = randomUUID();
      await query(
        `insert into media_assets(id,kind,access_scope,storage_key,mime_type,byte_size,checksum,status,image_width,image_height)
         values($1,'IMAGE','CONTENT',$2,'image/jpeg',100,'fixture','READY',640,480)`,
        [image, `task16c/image/${setId}.jpg`],
      );
      await query(
        `insert into question_group_media(question_group_id,media_asset_id,role,position)
         values($1,$2,'IMAGE',1)`,
        [setId, image],
      );
    }
    await query(
      `insert into listening_transcripts(question_group_id,content) values($1,$2)`,
      [setId, "Task 16C integration transcript"],
    );
  }

  for (let order = 1; order <= spec.questions; order++) {
    const questionId = randomUUID();
    await query(
      `insert into questions(id,toeic_part,skill_area,question_type,skill,sub_skill,difficulty,
       question_text,status,published_at,passage_set_id,passage_id,question_order)
       values($1,$2,$3,$4,'fixture','fixture','medium',$5,'published',now(),$6,$7,$8)`,
      [questionId, spec.part, area, spec.type, `Question ${order}`, setId, spec.part === 6 ? firstPassageId : null, order],
    );
    const optionCount = spec.part === 2 ? 3 : 4;
    let correct = "";
    for (let option = 1; option <= optionCount; option++) {
      const optionId = randomUUID();
      if (option === 1) correct = optionId;
      await query(
        `insert into question_options(id,question_id,option_key,option_text,display_order)
         values($1,$2,$3,$4,$5)`,
        [optionId, questionId, String.fromCharCode(64 + option), `Option ${option}`, option],
      );
    }
    await query(
      `insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi)
       values($1,$2,'Fixture explanation','Giải thích fixture')`,
      [questionId, correct],
    );
  }
}

async function seedFixture() {
  await seedUser(ids.admin, "Admin", "PUBLIC");
  await seedUser(ids.alice, "Alice", "PUBLIC");
  await seedUser(ids.bob, "Bob", "ANONYMOUS");
  await seedUser(ids.hidden, "Hidden", "HIDDEN");
  await query(`insert into user_roles(user_id,role,created_by) values($1,'ADMIN',$1)`, [ids.admin]);

  const groups: GroupSpec[] = [
    ...Array.from({ length: 6 }, () => ({ part: 1, type: "part1", questions: 1 })),
    ...Array.from({ length: 25 }, () => ({ part: 2, type: "part2", questions: 1 })),
    ...Array.from({ length: 13 }, () => ({ part: 3, type: "conversation", questions: 3 })),
    ...Array.from({ length: 10 }, () => ({ part: 4, type: "talk", questions: 3 })),
    ...Array.from({ length: 4 }, () => ({ part: 6, type: "part6", questions: 4, documents: 1 })),
    ...Array.from({ length: 9 }, () => ({ part: 7, type: "single", questions: 3, documents: 1 })),
    { part: 7, type: "single", questions: 2, documents: 1 },
    ...Array.from({ length: 5 }, () => ({ part: 7, type: "double", questions: 5, documents: 2 })),
  ];
  for (let index = 0; index < groups.length; index++) await seedGroup(groups[index], index + 1);

  for (let index = 1; index <= 30; index++) {
    const questionId = randomUUID();
    await query(
      `insert into questions(id,toeic_part,skill_area,question_type,skill,sub_skill,difficulty,
       question_text,status,published_at,question_order)
       values($1,5,'READING','standalone','fixture','fixture','medium',$2,'published',now(),1)`,
      [questionId, `Part 5 question ${index}`],
    );
    let correct = "";
    for (let option = 1; option <= 4; option++) {
      const optionId = randomUUID();
      if (option === 1) correct = optionId;
      await query(
        `insert into question_options(id,question_id,option_key,option_text,display_order)
         values($1,$2,$3,$4,$5)`,
        [optionId, questionId, String.fromCharCode(64 + option), `Option ${option}`, option],
      );
    }
    await query(
      `insert into question_solutions(question_id,correct_option_id,explanation_en,explanation_vi)
       values($1,$2,'Fixture explanation','Giải thích fixture')`,
      [questionId, correct],
    );
  }
  const count = await query(`select count(*)::int count from questions`);
  assert.equal(count.rows[0].count, 200);
}

async function main() {
  await seedFixture();
  const admin = await import("../src/lib/challenges/admin.ts");
  const service = await import("../src/lib/challenges/service.ts");
  const queries = await import("../src/lib/challenges/queries.ts");
  const readiness = await import("../src/lib/full-mock/service.ts");
  const contentAdmin = await import("../src/lib/admin/content.ts");

  const ready = await readiness.getFullMockReadiness();
  assert.equal(ready.ready, true);
  assert.equal(ready.form?.questionIds.length, 200);

  const now = new Date();
  const challengeId = await admin.createChallengeDraft(ids.admin, {
    type: "FULL_200",
    titleEn: "Task 16C Full",
    titleVi: "Task 16C Đầy đủ",
    startsAt: new Date(now.getTime() - 60_000),
    endsAt: new Date(now.getTime() + 121 * 60_000),
  });
  assert.equal(await admin.generateChallengeForm(ids.admin, challengeId), 200);
  assert.equal(await admin.publishChallenge(ids.admin, challengeId), true);
  assert.equal(await admin.publishChallenge(ids.admin, challengeId), false);

  const starts = await Promise.all(
    Array.from({ length: 8 }, () => service.startRankedChallenge(challengeId, ids.alice, now)),
  );
  assert.ok(starts.every((result) => result.ok));
  const runIds = new Set(starts.filter((result) => result.ok).map((result) => result.runId));
  assert.equal(runIds.size, 1);
  const runId = [...runIds][0];

  const live = await service.getRankedAttemptContent(runId, ids.alice, now);
  assert.ok(live && live.sessions.length === 4 && live.expired === false);
  const first = live.sessions[0].questions[0];
  assert.equal("correctOptionId" in first, false);
  const option = await query(
    `select id from question_options where question_id=$1 order by display_order limit 1`,
    [first.id],
  );
  assert.deepEqual(
    await service.saveRankedAnswer({
      runId,
      sessionId: live.sessions[0].session.id,
      questionId: first.id,
      optionId: option.rows[0].id,
      userId: ids.alice,
      now,
    }),
    { ok: true },
  );

  const listeningFinalize = await Promise.all(
    Array.from({ length: 6 }, () => service.finalizeRankedSection(runId, ids.alice, "LISTENING", now)),
  );
  assert.ok(listeningFinalize.every((result) => result.ok));
  const afterListening = await service.getRankedRun(runId, ids.alice);
  assert.equal(afterListening?.run.section, "READING");
  const readingDeadline = afterListening?.run.readingDeadline;
  assert.ok(readingDeadline);
  const readingFinalize = await Promise.all(
    Array.from({ length: 6 }, () =>
      service.finalizeRankedSection(runId, ids.alice, "READING", new Date(readingDeadline!.getTime() + 1)),
    ),
  );
  assert.ok(readingFinalize.every((result) => result.ok && result.status === "COMPLETED"));

  const completed = await service.getRankedRun(runId, ids.alice);
  assert.equal(completed?.run.status, "COMPLETED");
  assert.equal(completed?.run.totalScore, 1);
  const attempts = await query(
    `select count(*)::int count from attempt_answers where user_id=$1`,
    [ids.alice],
  );
  assert.equal(attempts.rows[0].count, 200);
  const quota = await query(`select count(*)::int count from usage_consumptions where user_id=$1`, [ids.alice]);
  assert.equal(quota.rows[0].count, 0);
  const awards = await query(
    `select count(*)::int count from gamification_events where user_id=$1 and event_type='CHALLENGE_COMPLETE'`,
    [ids.alice],
  );
  assert.equal(awards.rows[0].count, 1);

  const detail = await queries.getChallengeDetail(challengeId, ids.alice);
  assert.equal(detail?.own?.rank, 1);
  assert.equal(detail?.leaderboard[0].name, "Alice");

  const activeGroupId = live.sessions[0].groups[0].id;
  await assert.rejects(
    query(`update passage_sets set status='archived',archived_at=now() where id=$1`, [activeGroupId]),
    /CONTENT_USED_BY_ACTIVE_CHALLENGE/,
  );
  await assert.rejects(
    contentAdmin.archiveContent(ids.admin, activeGroupId),
    (error: unknown) => error instanceof contentAdmin.ContentAdminError && error.code === "CONTENT_USED_BY_ACTIVE_CHALLENGE",
  );

  const boundaryId = await admin.createChallengeDraft(ids.admin, {
    type: "READING_100",
    titleEn: "Boundary",
    titleVi: "Ranh giới",
    startsAt: new Date(now.getTime() - 60_000),
    endsAt: new Date(now.getTime() + 75 * 60_000),
  });
  await admin.generateChallengeForm(ids.admin, boundaryId);
  await admin.publishChallenge(ids.admin, boundaryId);
  const atBoundary = await service.startRankedChallenge(boundaryId, ids.bob, now);
  assert.equal(atBoundary.ok, true);
  const tooLate = await service.startRankedChallenge(
    boundaryId,
    ids.hidden,
    new Date(now.getTime() + 1),
  );
  assert.deepEqual(tooLate, { ok: false, reason: "CHALLENGE_START_WINDOW_CLOSED" });

  const expiredRunId = atBoundary.ok ? atBoundary.runId : "";
  const expired = await service.getRankedRun(expiredRunId, ids.bob);
  assert.ok(expired?.run.readingDeadline);
  const expiredContent = await service.getRankedAttemptContent(
    expiredRunId,
    ids.bob,
    new Date(expired!.run.readingDeadline!.getTime() + 1),
  );
  assert.equal(expiredContent?.expired, true);

  console.log("TASK16C_INTEGRATION_PASS");
  console.log(JSON.stringify({ questions: 200, challengeId, runId, postgres: true }));
}

try {
  await main();
} finally {
  await pool.end();
  const { pool: appPool } = await import("../src/db/index.ts");
  await appPool.end();
}
