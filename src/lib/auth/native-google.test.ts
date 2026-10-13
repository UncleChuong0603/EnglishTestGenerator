import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => readFileSync(path, "utf8");

describe("native Google authentication boundary", () => {
  it("verifies the Google ID token and audience only on the server", () => {
    const service = read("src/lib/auth/google-id-token.ts");
    expect(service).toContain("verifyIdToken");
    expect(service).toContain("audience: clientId");
    expect(service).toContain("payload.email_verified !== true");
    expect(service).toContain("tokenNonce !== nonce");
    expect(service).toContain("native-google-id-token");
    expect(service).not.toContain("decode(");
  });

  it("uses the explicit collision policy and issues only an opaque app session", () => {
    const service = read("src/lib/auth/google-id-token.ts");
    const route = read("src/app/api/v1/auth/google/route.ts");
    expect(service).toContain("decideGoogleAccount");
    expect(service).toContain("EXPLICIT_LINK_REQUIRED");
    expect(route).toContain("issueSessionToken(result.userId)");
    expect(route).not.toMatch(/payload\.(email|sub)/);
  });
});
