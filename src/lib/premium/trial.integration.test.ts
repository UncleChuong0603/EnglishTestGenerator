import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import type { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/db", async () => {
  const { PGlite } = await import("@electric-sql/pglite");
  const { drizzle } = await import("drizzle-orm/pglite");
  const client = new PGlite();
  return { db: drizzle(client), pool: client };
});

import { pool } from "@/db";
import { getEffectivePlan, getMembershipState, getUsageStatus } from "@/lib/entitlements/service";
import { activateTrial, getActiveTrial, getTrialEligibility } from "./trial";
import { TRIAL_DURATION_MS } from "./trial-policy";

const database = pool as unknown as PGlite;
beforeAll(async () => {
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8")) as { entries: Array<{ tag: string }> };
  for (const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`, "utf8"));
}, 60_000);
afterAll(async () => database.close());

async function learner(verified = true, status = "active") {
  const id = randomUUID();
  const email = `${id}@trial.invalid`;
  await database.query("insert into users(id,email,email_normalized,status,email_verified_at) values($1,$2,$2,$3,$4)", [id, email, status, verified ? new Date() : null]);
  return id;
}

describe("30-day Premium trial", () => {
  it("lets a verified learner start immediately without any learning history", async () => {
    const id = await learner();
    expect(await getTrialEligibility(id)).toMatchObject({ eligible: true, learningDays: 0, answeredQuestions: 0 });
    expect((await activateTrial(id)).status).toBe("STARTED");
    const trial = await getActiveTrial(id);
    expect(trial!.endsAt!.getTime() - trial!.startsAt.getTime()).toBe(TRIAL_DURATION_MS);
    expect(await getEffectivePlan(id)).toBe("PREMIUM");
    expect((await getUsageStatus(id)).entitlements.MANUAL_PRACTICE.type).toBe("UNLIMITED");
    expect((await database.query("select count(*)::int n from payment_orders where user_id=$1", [id])).rows[0]).toEqual({ n: 0 });
  });

  it.each([[false, "active"], [true, "disabled"], [true, "pending_verification"]])("rejects ineligible accounts (verified=%s, status=%s)", async (verified, status) => {
    const id = await learner(verified, status);
    expect(await getTrialEligibility(id)).toMatchObject({ eligible: false, reason: "ACCOUNT" });
    expect(await activateTrial(id)).toMatchObject({ status: "INELIGIBLE", reason: "ACCOUNT" });
    expect(await getEffectivePlan(id)).toBe("FREE");
  });

  it("rejects administrators, current Premium members and pending checkouts", async () => {
    const admin = await learner();
    await database.query("insert into user_roles(user_id,role) values($1,'ADMIN')", [admin]);
    expect((await activateTrial(admin)).status).toBe("INELIGIBLE");
    const paid = await learner();
    await database.query("insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM','ADMIN',now(),now()+interval '30 days')", [paid]);
    expect(await activateTrial(paid)).toMatchObject({ status: "INELIGIBLE", reason: "PREMIUM" });
    const pending = await learner();
    await database.query("insert into payment_orders(user_id,product_key,provider,order_code,amount,status,expires_at) values($1,'PREMIUM_30_DAYS','FAKE',987654321,29000,'PENDING',now()+interval '30 minutes')", [pending]);
    expect(await activateTrial(pending)).toMatchObject({ status: "INELIGIBLE", reason: "PENDING_PAYMENT" });
  });

  it("creates one membership and event when activation is repeated", async () => {
    const id = await learner();
    expect((await activateTrial(id)).status).toBe("STARTED");
    const first = await getActiveTrial(id);
    for (let i = 0; i < 3; i++) expect((await activateTrial(id)).status).toBe("ALREADY_STARTED");
    expect(await getActiveTrial(id)).toEqual(first);
    expect((await database.query("select count(*)::int n from user_plan_memberships where user_id=$1", [id])).rows[0]).toEqual({ n: 1 });
    expect((await database.query("select count(*)::int n from product_events where user_id=$1 and event_name='trial_started'", [id])).rows[0]).toEqual({ n: 1 });
  });

  it("returns to Free at the exact expiry without deleting learning data", async () => {
    const id = await learner();
    await database.query("insert into practice_sessions(user_id,skill_area,practice_type,part,status,question_count,requested_question_count,source,started_at,submitted_at,score_correct,score_total) values($1,'READING','part_5',5,'submitted',10,10,'custom',now()-interval '10 minutes',now(),7,10)", [id]);
    await activateTrial(id);
    const trial = (await getActiveTrial(id))!;
    const expiry = trial.endsAt!;
    expect(await getEffectivePlan(id, new Date(expiry.getTime() - 1))).toBe("PREMIUM");
    expect(await getEffectivePlan(id, expiry)).toBe("FREE");
    expect((await getMembershipState(id, expiry)).status).toBe("EXPIRED");
    expect((await getUsageStatus(id, expiry)).entitlements.MANUAL_PRACTICE.type).toBe("LIMITED");
    expect((await database.query("select score_correct,score_total from practice_sessions where user_id=$1", [id])).rows[0]).toEqual({ score_correct: 7, score_total: 10 });
  });

  it("never restarts expired or revoked trials", async () => {
    for (const revoked of [false, true]) {
      const id = await learner();
      await database.query("insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at,revoked_at) values($1,'PREMIUM','TRIAL',now()-interval '31 days',now()+$2::interval,$3)", [id, revoked ? "1 day" : "-1 day", revoked ? new Date() : null]);
      expect((await getTrialEligibility(id)).reason).toBe("PREVIOUS_TRIAL");
      expect((await activateTrial(id)).status).toBe("ALREADY_USED");
      expect(await getEffectivePlan(id)).toBe("FREE");
    }
  });
});
