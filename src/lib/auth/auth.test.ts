import { readFileSync } from "node:fs";
import { beforeAll, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
beforeAll(() => { process.env.SESSION_SECRET = "test-secret-that-is-at-least-thirty-two-characters"; process.env.DATABASE_URL = "postgresql://unused"; process.env.APP_URL = "http://localhost:3000"; });
describe("password and bearer-token security", () => {
  it("normalizes email casing and whitespace", async () => { const { normalizeEmail } = await import("./crypto"); expect(normalizeEmail("  USER@Example.COM ")).toBe("user@example.com"); });
  it("hashes and verifies passwords with Argon2id", async () => { const { hashPassword, verifyPassword } = await import("./crypto"); const hash = await hashPassword("a long password from a manager"); expect(hash).toContain("$argon2id$"); expect(await verifyPassword(hash, "a long password from a manager")).toBe(true); expect(await verifyPassword(hash, "wrong password")).toBe(false); });
  it("stores deterministic hashes rather than raw bearer tokens", async () => { const { createToken, hashToken } = await import("./crypto"); const token = createToken(); expect(token.length).toBeGreaterThan(30); expect(hashToken(token)).not.toContain(token); expect(hashToken(token)).toBe(hashToken(token)); });
});
describe("auth flow contracts", () => {
  const service = readFileSync("src/lib/auth/service.ts", "utf8"); const callback = readFileSync("src/app/auth/callback/route.ts", "utf8"); const googleStart = readFileSync("src/app/api/auth/google/route.ts", "utf8"); const sessions = readFileSync("src/lib/auth/session.ts", "utf8");
  it("uses single-use expiring verification and reset tokens", () => { expect(service).toContain("isNull(emailVerificationTokens.usedAt)"); expect(service).toContain("gt(emailVerificationTokens.expiresAt"); expect(service).toContain("isNull(passwordResetTokens.usedAt)"); expect(service).toContain("gt(passwordResetTokens.expiresAt"); });
  it("revokes sessions after reset and other sessions after password change", () => { expect(service).toContain("tx.update(userSessions).set({ revokedAt: now })"); expect(service).toContain("ne(userSessions.id, keepSessionId)"); });
  it("uses browser-bound state, PKCE, verified Google email and explicit collision linking", () => { expect(callback).toContain('get("etg_oauth_state")'); expect(callback).toContain("timingSafeEqual"); expect(callback).toContain("oauthStates.stateHash"); expect(callback).toContain("codeVerifier"); expect(callback).toContain("payload.email_verified !== true"); expect(callback).toContain("EXPLICIT_LINK_REQUIRED"); });
  it("builds every OAuth redirect from the configured public app origin", () => { expect(callback).not.toContain("new URL(oauthState.returnTo, request.url)"); expect(callback).not.toMatch(/new URL\([^\n]+request\.url/); expect(googleStart).not.toMatch(/new URL\([^\n]+request\.url/); expect(callback).toContain("new URL(env.APP_URL)"); expect(googleStart).toContain("new URL(env.APP_URL)"); });
  it("uses one HttpOnly local cookie for both methods", () => { expect(sessions).toContain("httpOnly: true"); expect(sessions).toContain('sameSite: "lax"'); expect(sessions).toContain("sessionTokenHash: hashToken(raw)"); });
});
