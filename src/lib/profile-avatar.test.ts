import { describe, expect, it } from "vitest";
import { avatarAssetId, buildAvatarUrl, canViewAvatar, isAvatarAssetId } from "./profile-avatar";

const id = "11111111-1111-4111-8111-111111111111";

describe("profile avatar URLs", () => {
  it("builds and recognizes only the app avatar route", () => {
    const url = buildAvatarUrl("https://toeicgym.net", id);
    expect(url).toBe(`https://toeicgym.net/api/profile/avatar/${id}`);
    expect(avatarAssetId(url)).toBe(id);
    expect(avatarAssetId("https://images.example/avatar.jpg")).toBeNull();
    expect(avatarAssetId("https://toeicgym.net/api/profile/avatar/not-a-uuid")).toBeNull();
    expect(isAvatarAssetId(id)).toBe(true);
    expect(isAvatarAssetId("not-a-uuid")).toBe(false);
  });

  it("allows the owner or a public-profile viewer", () => {
    expect(canViewAvatar("owner", "ANONYMOUS", "owner")).toBe(true);
    expect(canViewAvatar("owner", "PUBLIC", null)).toBe(true);
    expect(canViewAvatar("owner", "ANONYMOUS", "other")).toBe(false);
    expect(canViewAvatar("owner", "HIDDEN", null)).toBe(false);
  });
});
