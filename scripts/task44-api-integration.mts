import assert from "node:assert/strict";
import { eq, inArray } from "drizzle-orm";
import { db, pool } from "@/db";
import { apiIdempotencyKeys, practiceSessions, profiles, usageConsumptions, users } from "@/db/schema";
import { hashPassword } from "@/lib/auth/crypto";
import { deleteAccount } from "@/lib/account-data/service";
import { getDashboardData } from "@/lib/dashboard/service";
import { getToeicProgress } from "@/lib/progress/queries";
import { loadUnits } from "@/lib/practice/selector";
import { idempotent } from "@/lib/api-v1/idempotency";
import { createPractice as createPracticeWithTx } from "@/lib/api-v1/practice";
import { POST as login } from "@/app/api/v1/auth/login/route";
import { POST as logout } from "@/app/api/v1/auth/logout/route";
import { GET as me } from "@/app/api/v1/me/route";
import { GET as dashboard } from "@/app/api/v1/dashboard/route";
import { GET as plan } from "@/app/api/v1/plan/route";
import { GET as entitlements } from "@/app/api/v1/entitlements/route";
import { GET as progress } from "@/app/api/v1/progress/route";
import { POST as createPractice } from "@/app/api/v1/practice/route";
import { GET as getPractice } from "@/app/api/v1/practice/[id]/route";
import { POST as answerPractice } from "@/app/api/v1/practice/[id]/answer/route";
import { POST as submitPractice } from "@/app/api/v1/practice/[id]/submit/route";

const BASE = "http://task44.local/api/v1";
process.env.PRACTICE_POOL_ISOLATED = "true";
const password = "Task44-Strong-Password";
const actor = { id: "a4400000-0000-4000-8000-000000000001", email: "task44-mobile@example.invalid" };
const foreign = { id: "a4400000-0000-4000-8000-000000000002", email: "task44-foreign@example.invalid" };

function request(path: string, input: { token?: string; body?: unknown; key?: string } = {}) {
  return new Request(`${BASE}${path}`, { method: input.body === undefined ? "GET" : "POST", headers: { "content-type": "application/json", ...(input.token ? { authorization: `Bearer ${input.token}` } : {}), ...(input.key ? { "idempotency-key": input.key } : {}) }, body: input.body === undefined ? undefined : JSON.stringify(input.body) });
}
async function body<T>(response: Response) { return await response.json() as T; }
async function signIn(email: string) {
  const response = await login(request("/auth/login", { body: { email, password } }));
  assert.equal(response.status, 200);
  return (await body<{ data: { token: string } }>(response)).data.token;
}

async function main() {
  console.log("task44: setup");
  const passwordHash = await hashPassword(password);
  await db.delete(users).where(inArray(users.id, [actor.id, foreign.id]));
  for (const account of [actor, foreign]) {
    await db.insert(users).values({ id: account.id, email: account.email, emailNormalized: account.email, passwordHash, emailVerifiedAt: new Date(), status: "active" });
    await db.insert(profiles).values({ id: account.id, fullName: account === actor ? "Mobile Learner" : "Foreign Learner" });
  }
  const [token, foreignToken] = await Promise.all([signIn(actor.email), signIn(foreign.email)]);

  console.log("task44: projections");
  for (const [name, handler] of [["me", me], ["dashboard", dashboard], ["plan", plan], ["entitlements", entitlements], ["progress", progress]] as const) {
    const response = await handler(request(`/${name}`, { token }));
    assert.equal(response.status, 200, `${name} should load`);
  }
  assert.equal((await me(request("/me"))).status, 401, "protected route rejects anonymous requests");
  assert.ok((await loadUnits(5)).length >= 10, "isolated QA has enough practice-pool Part 5 content");

  const startBody = { kind: "CUSTOM", skillArea: "READING", part: 5, questionCount: 10 } as const;
  console.log("task44: atomic create rollback");
  await assert.rejects(idempotent({
    userId: actor.id,
    operation: "practice:create",
    key: "task44-create-custom",
    body: startBody,
    status: 201,
    execute: async (tx) => {
      await createPracticeWithTx(actor.id, startBody, tx);
      throw new Error("TASK44_INJECTED_FAILURE_AFTER_CREATE");
    },
  }), /TASK44_INJECTED_FAILURE_AFTER_CREATE/);
  assert.equal((await db.select({ id: practiceSessions.id }).from(practiceSessions).where(eq(practiceSessions.userId, actor.id))).length, 0, "failed create rolls back its session");
  assert.equal((await db.select({ id: usageConsumptions.id }).from(usageConsumptions).where(eq(usageConsumptions.userId, actor.id))).length, 0, "failed create rolls back quota consumption");
  assert.equal((await db.select({ id: apiIdempotencyKeys.id }).from(apiIdempotencyKeys).where(eq(apiIdempotencyKeys.userId, actor.id))).length, 0, "failed create does not commit an idempotency ledger row");

  console.log("task44: create");
  const firstStart = await createPractice(request("/practice", { token, body: startBody, key: "task44-create-custom" }));
  assert.equal(firstStart.status, 201, await firstStart.clone().text());
  const sessionId = (await body<{ data: { id: string } }>(firstStart)).data.id;
  const replayStart = await createPractice(request("/practice", { token, body: startBody, key: "task44-create-custom" }));
  assert.equal(replayStart.status, 200); assert.equal(replayStart.headers.get("Idempotency-Replayed"), "true");
  const conflictStart = await createPractice(request("/practice", { token, body: { ...startBody, questionCount: 15 }, key: "task44-create-custom" }));
  assert.equal(conflictStart.status, 409);

  const open = await getPractice(request(`/practice/${sessionId}`, { token }), { params: Promise.resolve({ id: sessionId }) });
  console.log("task44: read and answer");
  assert.equal(open.status, 200);
  const openPayload = await body<{ data: { status: string; questions: Array<{ id: string; selectedOptionId: string | null; options: Array<{ id: string }> }> } }>(open);
  assert.equal(openPayload.data.status, "in_progress"); assert.equal(openPayload.data.questions.length, 10);
  assert.equal(JSON.stringify(openPayload).includes("correctOptionId"), false, "in-progress response must not leak answers");

  const firstQuestion = openPayload.data.questions[0]; const selectedOptionId = firstQuestion.options[0].id;
  const answerBody = { questionId: firstQuestion.id, selectedOptionId };
  const answer = await answerPractice(request(`/practice/${sessionId}/answer`, { token, body: answerBody, key: "task44-answer-1" }), { params: Promise.resolve({ id: sessionId }) });
  assert.equal(answer.status, 200); assert.equal(JSON.stringify(await body(answer)).includes("isCorrect"), false);
  const answerReplay = await answerPractice(request(`/practice/${sessionId}/answer`, { token, body: answerBody, key: "task44-answer-1" }), { params: Promise.resolve({ id: sessionId }) });
  assert.equal(answerReplay.headers.get("Idempotency-Replayed"), "true");
  const answerConflict = await answerPractice(request(`/practice/${sessionId}/answer`, { token, body: { ...answerBody, selectedOptionId: firstQuestion.options[1].id }, key: "task44-answer-1" }), { params: Promise.resolve({ id: sessionId }) });
  assert.equal(answerConflict.status, 409);

  const restored = await getPractice(request(`/practice/${sessionId}`, { token }), { params: Promise.resolve({ id: sessionId }) });
  const restoredPayload = await body<{ data: { questions: Array<{ id: string; selectedOptionId: string | null }> } }>(restored);
  assert.equal(restoredPayload.data.questions.find((item) => item.id === firstQuestion.id)?.selectedOptionId, selectedOptionId);
  const foreignRead = await getPractice(request(`/practice/${sessionId}`, { token: foreignToken }), { params: Promise.resolve({ id: sessionId }) });
  assert.equal(foreignRead.status, 404, "foreign session is hidden");

  const submitted = await submitPractice(request(`/practice/${sessionId}/submit`, { token, body: {}, key: "task44-submit-custom" }), { params: Promise.resolve({ id: sessionId }) });
  console.log("task44: submit and sync");
  assert.equal(submitted.status, 200);
  const result = await body<{ data: { status: string; scoreTotal: number; results: Array<{ correctOptionId: string; explanationVi: string | null }> } }>(submitted);
  assert.equal(result.data.status, "submitted"); assert.equal(result.data.scoreTotal, 10); assert.equal(result.data.results.length, 10); assert.ok(result.data.results[0].correctOptionId); assert.ok(result.data.results.some((item) => item.explanationVi));
  const submitReplay = await submitPractice(request(`/practice/${sessionId}/submit`, { token, body: {}, key: "task44-submit-custom" }), { params: Promise.resolve({ id: sessionId }) });
  assert.equal(submitReplay.headers.get("Idempotency-Replayed"), "true");

  const [webDashboard, webProgress, mobileDashboard, mobileProgress] = await Promise.all([getDashboardData(actor.id), getToeicProgress(actor.id), dashboard(request("/dashboard", { token })), progress(request("/progress", { token }))]);
  const mobileDashboardPayload = await body<{ data: { progress: { answered: number } } }>(mobileDashboard);
  const mobileProgressPayload = await body<{ data: { overall: { answered: number } } }>(mobileProgress);
  assert.equal(webDashboard.progress.attemptedCount, 10); assert.equal(webProgress.attemptedCount, 10); assert.equal(mobileDashboardPayload.data.progress.answered, 10); assert.equal(mobileProgressPayload.data.overall.answered, 10);

  const workout = await createPractice(request("/practice", { token, body: { kind: "TODAYS_WORKOUT" }, key: "task44-workout-1" }));
  console.log("task44: workout quota");
  assert.equal(workout.status, 201, "server-selected Today’s Workout starts");
  const workoutId = (await body<{ data: { id: string } }>(workout)).data.id;
  await submitPractice(request(`/practice/${workoutId}/submit`, { token, body: {}, key: "task44-submit-workout" }), { params: Promise.resolve({ id: workoutId }) });
  const quota = await createPractice(request("/practice", { token, body: { kind: "TODAYS_WORKOUT" }, key: "task44-workout-2" }));
  assert.equal(quota.status, 403); assert.equal((await body<{ error: { code: string } }>(quota)).error.code, "USAGE_LIMIT_REACHED");

  const deletionToken = foreignToken;
  console.log("task44: revoke and cleanup");
  await deleteAccount(foreign.id, foreign.email);
  assert.equal((await me(request("/me", { token: deletionToken }))).status, 401, "account deletion invalidates bearer session");
  const logoutResponse = await logout(request("/auth/logout", { token, body: {} })); assert.equal(logoutResponse.status, 200);
  assert.equal((await me(request("/me", { token }))).status, 401, "logout revokes bearer session");

  console.log(JSON.stringify({ status: "PASS", auth: true, ownership: true, noAnswerLeakage: true, idempotency: true, answerRestore: true, authoritativeSubmit: true, quota: true, accountDeletionRevocation: true, mobileToWebSync: true, webToMobileProjection: true, database: "PostgreSQL 17 isolated QA" }));
  await db.delete(users).where(eq(users.id, actor.id));
}

main().finally(() => pool.end()).catch((error) => { console.error(error); process.exitCode = 1; });
