import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import pg from "pg";
import { assertTestDatabase } from "./lib/assert-test-database.mjs";

const testUrl =
  process.env.TASK50_TEST_DATABASE_URL ?? process.env.TASK17_TEST_DATABASE_URL;
if (!testUrl) throw new Error("TASK50_TEST_DATABASE_URL_REQUIRED");
await assertTestDatabase(testUrl);
process.env.DATABASE_URL = testUrl;
process.env.SESSION_SECRET =
  "task50-isolated-integration-secret-with-at-least-32-characters";
process.env.APP_URL = "http://task50.local";

const pool = new pg.Pool({ connectionString: testUrl, max: 8 });
const password = "Task50-Strong-Password";
const actor = { id: randomUUID(), email: "learner@task50.invalid" };
const foreign = { id: randomUUID(), email: "foreign@task50.invalid" };

async function freshMigrate() {
  await pool.query("drop schema public cascade");
  await pool.query("create schema public");
  const journal = JSON.parse(
    readFileSync("drizzle/meta/_journal.json", "utf8"),
  ) as { entries: Array<{ tag: string }> };
  for (const entry of journal.entries)
    await pool.query(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
  return journal.entries.at(-1)!.tag;
}

function request(
  path: string,
  input: { token?: string; cookieToken?: string; body?: unknown } = {},
) {
  return new Request(`http://task50.local/api/v1${path}`, {
    method: input.body === undefined ? "GET" : "POST",
    headers: {
      "content-type": "application/json",
      ...(input.token ? { authorization: `Bearer ${input.token}` } : {}),
      ...(input.cookieToken
        ? { cookie: `etg_session=${input.cookieToken}` }
        : {}),
    },
    body: input.body === undefined ? undefined : JSON.stringify(input.body),
  });
}

async function json<T>(response: Response) {
  return (await response.json()) as T;
}

async function main() {
  const latestMigration = await freshMigrate();
  const [
    { hashPassword },
    loginRoute,
    catalogRoute,
    sessionRoute,
    attemptRoute,
    hintRoute,
    historyRoute,
    talks,
  ] = await Promise.all([
    import("../src/lib/auth/crypto.ts"),
    import("../src/app/api/v1/auth/login/route.ts"),
    import("../src/app/api/v1/dictation/route.ts"),
    import("../src/app/api/v1/dictation/[id]/route.ts"),
    import("../src/app/api/v1/dictation/[id]/attempts/route.ts"),
    import("../src/app/api/v1/dictation/[id]/hint/route.ts"),
    import("../src/app/api/v1/dictation/history/route.ts"),
    import("../src/lib/listening-lessons/talks.ts"),
  ]);
  const passwordHash = await hashPassword(password);
  for (const user of [actor, foreign]) {
    await pool.query(
      "insert into users(id,email,email_normalized,password_hash,email_verified_at,status) values($1,$2,$2,$3,now(),'active')",
      [user.id, user.email, passwordHash],
    );
    await pool.query("insert into profiles(id,full_name) values($1,$2)", [
      user.id,
      user === actor ? "Dictation Learner" : "Other Learner",
    ]);
  }
  async function signIn(email: string) {
    const response = await loginRoute.POST(
      request("/auth/login", { body: { email, password } }),
    );
    assert.equal(response.status, 200);
    return (await json<{ data: { token: string } }>(response)).data.token;
  }
  const [token, foreignToken] = await Promise.all([
    signIn(actor.email),
    signIn(foreign.email),
  ]);
  assert.equal((await catalogRoute.GET(request("/dictation"))).status, 401);

  const catalog = await catalogRoute.GET(request("/dictation", { token }));
  assert.equal(catalog.status, 200);
  const catalogBody = await json<{
    data: { items: Array<{ sourceRef: string; minutes: number }> };
  }>(catalog);
  assert.ok(catalogBody.data.items.length >= 3);
  assert.ok(catalogBody.data.items.every((item) => item.minutes === 1));
  const sourceRef = catalogBody.data.items[0]!.sourceRef;

  const started = await catalogRoute.POST(
    request("/dictation", { token, body: { sourceRef } }),
  );
  assert.equal(started.status, 201, await started.clone().text());
  const initial = (
    await json<{
      data: { id: string; transcript: string | null; attemptsCount: number };
    }>(started)
  ).data;
  assert.equal(
    initial.transcript,
    null,
    "start response must not disclose transcript",
  );
  assert.equal(initial.attemptsCount, 0);

  const ownedFromCookie = await sessionRoute.GET(
    request(`/dictation/${initial.id}`, { cookieToken: token }),
    { params: Promise.resolve({ id: initial.id }) },
  );
  assert.equal(
    ownedFromCookie.status,
    200,
    "web cookie and mobile bearer must share the same session state",
  );
  assert.equal(
    (
      await sessionRoute.GET(
        request(`/dictation/${initial.id}`, { token: foreignToken }),
        { params: Promise.resolve({ id: initial.id }) },
      )
    ).status,
    404,
  );

  const hint = await hintRoute.POST(
    request(`/dictation/${initial.id}/hint`, { token, body: {} }),
    { params: Promise.resolve({ id: initial.id }) },
  );
  assert.equal(hint.status, 200);
  const firstAttempt = await attemptRoute.POST(
    request(`/dictation/${initial.id}/attempts`, {
      token,
      body: { answer: "not the transcript" },
    }),
    { params: Promise.resolve({ id: initial.id }) },
  );
  assert.equal(firstAttempt.status, 200);
  const afterMiss = (
    await json<{
      data: {
        transcript: string | null;
        attemptsCount: number;
        status: string;
      };
    }>(firstAttempt)
  ).data;
  assert.ok(
    afterMiss.transcript,
    "transcript is disclosed after a real attempt",
  );
  assert.equal(afterMiss.attemptsCount, 1);
  assert.equal(afterMiss.status, "IN_PROGRESS");

  const transcript = talks.getListeningTalk(sourceRef)!.transcript;
  const retry = await attemptRoute.POST(
    request(`/dictation/${initial.id}/attempts`, {
      token,
      body: { answer: transcript.toUpperCase().replaceAll(".", "") },
    }),
    { params: Promise.resolve({ id: initial.id }) },
  );
  assert.equal(retry.status, 200);
  const mastered = (
    await json<{
      data: {
        attemptsCount: number;
        status: string;
        result: { exact: boolean; accuracy: number };
      };
    }>(retry)
  ).data;
  assert.deepEqual(
    {
      attemptsCount: mastered.attemptsCount,
      status: mastered.status,
      exact: mastered.result.exact,
      accuracy: mastered.result.accuracy,
    },
    { attemptsCount: 2, status: "MASTERED", exact: true, accuracy: 100 },
  );

  for (let index = 0; index < 21; index += 1) {
    const response = await catalogRoute.POST(
      request("/dictation", { token, body: { sourceRef } }),
    );
    assert.equal(response.status, 201);
  }
  const history = await historyRoute.GET(
    request("/dictation/history", { token }),
  );
  assert.equal(history.status, 200);
  assert.equal(
    (await json<{ data: unknown[] }>(history)).data.length,
    20,
    "history response remains bounded",
  );
  const attemptColumns = (
    await pool.query(
      "select column_name from information_schema.columns where table_name='dictation_attempts'",
    )
  ).rows.map((row) => row.column_name);
  assert.equal(
    attemptColumns.includes("answer"),
    false,
    "raw learner answers are not persisted",
  );

  console.log("TASK50_DICTATION_INTEGRATION_PASS");
  console.log(
    JSON.stringify({
      postgres: (await pool.query("show server_version")).rows[0]
        .server_version,
      latestMigration,
      catalogSegments: catalogBody.data.items.length,
      transcriptDisclosure: true,
      retryMastery: true,
      webMobileSync: true,
      ownership: true,
      boundedHistory: 20,
      rawAnswerStored: false,
    }),
  );
}

try {
  await main();
} finally {
  const { pool: applicationPool } = await import("../src/db/index.ts");
  await Promise.all([pool.end(), applicationPool.end()]);
}
