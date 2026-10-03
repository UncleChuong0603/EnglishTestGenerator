import "server-only";

import { createHash } from "node:crypto";
import { and, eq, gt, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { apiIdempotencyKeys } from "@/db/schema";
import { hashToken } from "@/lib/auth/crypto";
import { ApiV1Error } from "./errors";

export type ApiTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
const TTL_MS = 24 * 60 * 60 * 1000;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export async function idempotent<T extends Record<string, unknown>>(input: {
  userId: string;
  operation: string;
  key: string;
  body: unknown;
  status?: number;
  execute: (tx: ApiTransaction) => Promise<T>;
}): Promise<{ body: T; replayed: boolean }> {
  const keyHash = hashToken(input.key);
  const requestHash = createHash("sha256").update(canonical(input.body)).digest("hex");
  return db.transaction(async (tx) => {
    await tx.execute(sql`select pg_advisory_xact_lock(hashtextextended(${`${input.userId}:${input.operation}:${keyHash}`}, 0))`);
    const [existing] = await tx.select({ requestHash: apiIdempotencyKeys.requestHash, responseBody: apiIdempotencyKeys.responseBody })
      .from(apiIdempotencyKeys)
      .where(and(
        eq(apiIdempotencyKeys.userId, input.userId),
        eq(apiIdempotencyKeys.operation, input.operation),
        eq(apiIdempotencyKeys.keyHash, keyHash),
        gt(apiIdempotencyKeys.expiresAt, new Date()),
      )).limit(1);
    if (existing) {
      if (existing.requestHash !== requestHash) throw new ApiV1Error(409, "IDEMPOTENCY_CONFLICT", "This idempotency key was used for a different request.");
      return { body: existing.responseBody as T, replayed: true };
    }
    // The unique scope remains after the replay window. Remove only this
    // expired key while holding its advisory lock so a legitimate later reuse
    // cannot collide with the durable row.
    await tx.delete(apiIdempotencyKeys).where(and(
      eq(apiIdempotencyKeys.userId, input.userId),
      eq(apiIdempotencyKeys.operation, input.operation),
      eq(apiIdempotencyKeys.keyHash, keyHash),
      lte(apiIdempotencyKeys.expiresAt, new Date()),
    ));
    const body = await input.execute(tx);
    await tx.insert(apiIdempotencyKeys).values({
      userId: input.userId,
      operation: input.operation,
      keyHash,
      requestHash,
      responseStatus: input.status ?? 200,
      responseBody: body,
      expiresAt: new Date(Date.now() + TTL_MS),
    });
    return { body, replayed: false };
  });
}
