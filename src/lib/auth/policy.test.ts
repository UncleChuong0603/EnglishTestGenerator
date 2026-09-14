import { describe, expect, it } from "vitest";
import { decideGoogleAccount } from "./policy";

describe("Google account linking policy", () => {
  it("creates an account for a new verified Google identity", () => {
    expect(decideGoogleAccount({ googleEmail: "new@example.com" })).toBe("create_google_user");
  });
  it("logs a returning Google identity into its existing local user", () => {
    expect(decideGoogleAccount({ identityUserId: "user-a", googleEmail: "a@example.com" })).toBe("login_linked_identity");
  });
  it("never silently merges an unauthenticated email collision", () => {
    expect(decideGoogleAccount({ emailOwnerUserId: "password-user", googleEmail: "same@example.com" })).toBe("require_explicit_link");
  });
  it("allows explicit same-email linking by the authenticated owner", () => {
    expect(decideGoogleAccount({ linkUserId: "user-a", currentUserId: "user-a", currentUserEmail: "same@example.com", googleEmail: "same@example.com" })).toBe("link_to_authenticated_user");
  });
  it("rejects mismatched users, emails, and identities already owned elsewhere", () => {
    expect(decideGoogleAccount({ linkUserId: "user-a", currentUserId: "user-b", currentUserEmail: "same@example.com", googleEmail: "same@example.com" })).toBe("reject_link_context");
    expect(decideGoogleAccount({ linkUserId: "user-a", currentUserId: "user-a", currentUserEmail: "a@example.com", googleEmail: "b@example.com" })).toBe("reject_link_context");
    expect(decideGoogleAccount({ identityUserId: "user-b", linkUserId: "user-a", googleEmail: "a@example.com" })).toBe("reject_identity_owned_by_another_user");
  });
});
