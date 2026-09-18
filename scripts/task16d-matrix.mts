import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import pg from "pg";

const url = new URL(process.env.TASK16_TEST_DATABASE_URL ?? process.env.DATABASE_URL ?? "");
assert.equal(url.hostname, "127.0.0.1");
assert.equal(url.port, "15433");
process.env.DATABASE_URL = url.href;
const pool = new pg.Pool({ connectionString: url.href, max: 4 });
const adminApi = await import("../src/lib/challenges/admin.ts");
const service = await import("../src/lib/challenges/service.ts");
const challengeQueries = await import("../src/lib/challenges/queries.ts");
const practiceQueries = await import("../src/lib/practice/queries.ts");
const { percentile } = await import("../src/lib/gamification/ranking.ts");
const admin = (await pool.query(`select id from users where email_normalized='admin@task16c.invalid'`)).rows[0].id;
await pool.query(`delete from users where email_normalized like '%@task16d.invalid'`);
await pool.query(`delete from ranked_challenges where title_en like '% DB E2E' or title_en like '% timing' or title_en in ('Ranking matrix','Rollback matrix')`);

async function user(label: string, visibility = "PUBLIC", premium = false) {
  const id = randomUUID();
  const email = `${label}-${id}@task16d.invalid`;
  await pool.query(`insert into users(id,email,email_normalized,status,email_verified_at) values($1,$2,$2,'active',now())`, [id, email]);
  await pool.query(`insert into profiles(id,full_name,ranking_visibility) values($1,$2,$3)`, [id, label, visibility]);
  if (premium) await pool.query(`insert into user_plan_memberships(user_id,plan_key,source,starts_at) values($1,'PREMIUM','MANUAL',now())`, [id]);
  return id;
}

async function form(runId: string) {
  return (await pool.query(`select ps.ranked_challenge_order part,psq.display_order,psq.question_id,psq.passage_set_id from practice_sessions ps join practice_session_questions psq on psq.session_id=ps.id where ps.ranked_challenge_run_id=$1 order by part,display_order`, [runId])).rows;
}

async function independent(type: "READING_100" | "LISTENING_100", baseYear: number) {
  const duration = type === "READING_100" ? 75 : 45;
  const now = new Date(`${baseYear}-01-01T00:00:00Z`);
  const challengeId = await adminApi.createChallengeDraft(admin, { type, titleEn: `${type} DB E2E`, titleVi: `${type} DB E2E`, startsAt: new Date(now.getTime() - 1000), endsAt: new Date(now.getTime() + (duration + 10) * 60_000) });
  assert.equal(await adminApi.generateChallengeForm(admin, challengeId), 100);
  await adminApi.publishChallenge(admin, challengeId);
  const a = await user(`${type}-A`); const b = await user(`${type}-B`);
  const [sa, sb] = await Promise.all([service.startRankedChallenge(challengeId, a, now), service.startRankedChallenge(challengeId, b, now)]);
  assert.ok(sa.ok && sb.ok); assert.deepEqual(await form(sa.runId), await form(sb.runId)); assert.equal((await form(sa.runId)).length, 100);
  const resumed = await service.startRankedChallenge(challengeId, a, now); assert.ok(resumed.ok && resumed.resumed && resumed.runId === sa.runId);
  const run = await service.getRankedRun(sa.runId, a); assert.ok(run);
  if (type === "LISTENING_100") {
    const live = await service.getRankedAttemptContent(sa.runId, a, now); assert.ok(live);
    assert.match(JSON.stringify(live), /example\.invalid/); assert.doesNotMatch(JSON.stringify(live), /storageKey|storage_key|transcript/i);
    assert.equal(await service.getRankedAttemptContent(sa.runId, b, now), null);
    assert.equal(await service.getRankedAttemptContent(sa.runId, randomUUID(), now), null);
  }
  const first = (await pool.query(`select ps.id session_id,psq.question_id,qo.id option_id from practice_sessions ps join practice_session_questions psq on psq.session_id=ps.id join question_solutions qs on qs.question_id=psq.question_id join question_options qo on qo.id=qs.correct_option_id where ps.ranked_challenge_run_id=$1 order by ps.ranked_challenge_order,psq.display_order limit 1`, [sa.runId])).rows[0];
  assert.deepEqual(await service.saveRankedAnswer({ runId: sa.runId, sessionId: first.session_id, questionId: first.question_id, optionId: first.option_id, userId: a, now }), { ok: true });
  const expected = type === "READING_100" ? "READING" : "LISTENING";
  await service.finalizeRankedSection(sa.runId, a, expected, new Date(now.getTime() + (duration + 1) * 60_000));
  const completed = await service.getRankedRun(sa.runId, a); assert.equal(completed?.run.status, "COMPLETED"); assert.equal(completed?.run.totalScore, 1);
  assert.equal((await pool.query(`select count(*)::int n from usage_consumptions where user_id=$1`, [a])).rows[0].n, 0);
  assert.equal(await practiceQueries.getPracticeResult(completed!.sessions[0].id, { userId: a }), null);
  await pool.query(`update ranked_challenges set starts_at=$2,ends_at=$3 where id=$1`, [challengeId, new Date(Date.now() - 7_200_000), new Date(Date.now() - 1000)]);
  const closedReview = await practiceQueries.getPracticeResult(completed!.sessions[0].id, { userId: a }); assert.notEqual(closedReview, null);
  if (type === "LISTENING_100") assert.match(JSON.stringify(closedReview), /Task 16C integration transcript/);
  assert.equal(await practiceQueries.getPracticeResult(completed!.sessions[0].id, { userId: b }), null);
  const bonus = await pool.query(`select count(*)::int n,sum(xp_awarded)::int xp from gamification_events where user_id=$1 and event_type='CHALLENGE_COMPLETE'`, [a]);
  assert.deepEqual(bonus.rows[0], { n: 1, xp: 25 });
  return { challengeId, runId: sa.runId };
}

async function timing(type: "READING_100" | "LISTENING_100" | "FULL_200", year: number) {
  const minutes = type === "READING_100" ? 75 : type === "LISTENING_100" ? 45 : 120;
  const now = new Date(`${year}-01-01T00:00:00Z`);
  const id = await adminApi.createChallengeDraft(admin, { type, titleEn: `${type} timing`, titleVi: `${type} timing`, startsAt: new Date(now.getTime() - 1000), endsAt: new Date(now.getTime() + (minutes * 60_000) + 1000) });
  await adminApi.generateChallengeForm(admin, id); await adminApi.publishChallenge(admin, id);
  const allowed = await user(`${type}-allowed`); const blocked = await user(`${type}-blocked`);
  assert.equal((await service.startRankedChallenge(id, allowed, now)).ok, true);
  const result = await service.startRankedChallenge(id, blocked, new Date(now.getTime() + 2000));
  assert.deepEqual(result, { ok: false, reason: "CHALLENGE_START_WINDOW_CLOSED" });
  assert.equal((await pool.query(`select count(*)::int n from ranked_challenge_runs where challenge_id=$1 and user_id=$2`, [id, blocked])).rows[0].n, 0);
}

async function rankingPrivacy() {
  const now = new Date("2040-01-01T00:00:00Z");
  const id = await adminApi.createChallengeDraft(admin, { type: "READING_100", titleEn: "Ranking matrix", titleVi: "Ranking matrix", startsAt: new Date(now.getTime() - 1000), endsAt: new Date(now.getTime() + 90 * 60_000) });
  await adminApi.generateChallengeForm(admin, id); await adminApi.publishChallenge(admin, id);
  const scores = [100, 98, 98, 90];
  for (let i = 0; i < scores.length; i++) { const u = await user(`rank-${i}`); await pool.query(`insert into ranked_challenge_runs(challenge_id,user_id,status,total_score,reading_score,started_at,completed_at) values($1,$2,'COMPLETED',$3,$3,$4,$5)`, [id, u, scores[i], new Date(now.getTime() + i * 1000), new Date(now.getTime() + (9 - i) * 1000)]); }
  const anonymous = await user("anon", "ANONYMOUS"); const hidden = await user("hidden", "HIDDEN"); const progress = await user("progress");
  await pool.query(`insert into ranked_challenge_runs(challenge_id,user_id,status,total_score,reading_score,started_at,completed_at) values($1,$2,'COMPLETED',80,80,$4,$4),($1,$3,'COMPLETED',99,99,$4,$4)`, [id, anonymous, hidden, now]);
  await pool.query(`insert into ranked_challenge_runs(challenge_id,user_id,status,section,reading_deadline,started_at) values($1,$2,'IN_PROGRESS','READING',$3,$4)`, [id, progress, new Date(now.getTime() + 75 * 60_000), now]);
  const detail = await challengeQueries.getChallengeDetail(id);
  assert.deepEqual(detail!.leaderboard.slice(0, 4).map((x) => x.rank), [1, 2, 2, 4]);
  assert.equal(detail!.leaderboard.some((x) => x.userId === hidden), false); assert.equal(detail!.leaderboard.some((x) => x.userId === progress), false);
  const anon = detail!.leaderboard.find((x) => x.userId === anonymous)!; assert.equal(anon.name, null); assert.equal(anon.avatarUrl, null); assert.equal(anon.publicProfileId, null);
  for (let i = 0; i < 14; i++) { const u = await user(`participant-${i}`); await pool.query(`insert into ranked_challenge_runs(challenge_id,user_id,status,total_score,reading_score,started_at,completed_at) values($1,$2,'COMPLETED',70,70,$3,$3)`, [id, u, now]); }
  const nineteen = await challengeQueries.getChallengeDetail(id); assert.equal(nineteen!.participants, 19); assert.equal(percentile(1, nineteen!.participants), null);
  const twentieth = await user("participant-20"); await pool.query(`insert into ranked_challenge_runs(challenge_id,user_id,status,total_score,reading_score,started_at,completed_at) values($1,$2,'COMPLETED',60,60,$3,$3)`, [id, twentieth, now]);
  const twenty = await challengeQueries.getChallengeDetail(id); assert.equal(twenty!.participants, 20); assert.equal(percentile(1, twenty!.participants), 5);
}

async function rollbackAndFairness() {
  const now = new Date("2036-01-01T00:00:00Z");
  const id = await adminApi.createChallengeDraft(admin, { type: "READING_100", titleEn: "Rollback matrix", titleVi: "Rollback matrix", startsAt: new Date(now.getTime() - 1000), endsAt: new Date(now.getTime() + 90 * 60_000) });
  await adminApi.generateChallengeForm(admin, id); await adminApi.publishChallenge(admin, id);
  const rollbackUser = await user("rollback");
  service.installTask16TestHooks({ afterStartWork: () => { throw new Error("INJECT_START_ROLLBACK"); } });
  await assert.rejects(service.startRankedChallenge(id, rollbackUser, now), /INJECT_START_ROLLBACK/);
  assert.equal((await pool.query(`select count(*)::int n from ranked_challenge_runs where challenge_id=$1 and user_id=$2`, [id, rollbackUser])).rows[0].n, 0);
  assert.equal((await pool.query(`select count(*)::int n from practice_sessions where user_id=$1 and source='ranked_challenge'`, [rollbackUser])).rows[0].n, 0);
  service.installTask16TestHooks(undefined);
  const started = await service.startRankedChallenge(id, rollbackUser, now); assert.ok(started.ok);
  service.installTask16TestHooks({ afterFinalizeWork: () => { throw new Error("INJECT_FINALIZE_ROLLBACK"); } });
  await assert.rejects(service.finalizeRankedSection(started.runId, rollbackUser, "READING", new Date(now.getTime() + 76 * 60_000)), /INJECT_FINALIZE_ROLLBACK/);
  assert.equal((await service.getRankedRun(started.runId, rollbackUser))?.run.status, "IN_PROGRESS");
  assert.equal((await pool.query(`select count(*)::int n from gamification_events where user_id=$1 and event_type='CHALLENGE_COMPLETE'`, [rollbackUser])).rows[0].n, 0);
  service.installTask16TestHooks(undefined);
  await service.finalizeRankedSection(started.runId, rollbackUser, "READING", new Date(now.getTime() + 76 * 60_000));
  assert.equal((await pool.query(`select count(*)::int n from gamification_events where user_id=$1 and event_type='CHALLENGE_COMPLETE'`, [rollbackUser])).rows[0].n, 1);
  for (const premium of [false, true]) { const u = await user(premium ? "premium" : "free", "PUBLIC", premium); const first = await service.startRankedChallenge(id, u, now); const second = await service.startRankedChallenge(id, u, now); assert.ok(first.ok && second.ok && first.runId === second.runId); assert.equal((await pool.query(`select count(*)::int n from ranked_challenge_runs where challenge_id=$1 and user_id=$2`, [id, u])).rows[0].n, 1); }
}

try {
  await independent("READING_100", 2031);
  await independent("LISTENING_100", 2032);
  await timing("READING_100", 2033); await timing("LISTENING_100", 2034); await timing("FULL_200", 2035);
  await rankingPrivacy();
  await rollbackAndFairness();
  console.log("TASK16D_MATRIX_PASS");
} finally { await pool.end(); const { pool: appPool } = await import("../src/db/index.ts"); await appPool.end(); }
