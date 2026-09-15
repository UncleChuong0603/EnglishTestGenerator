import { describe, expect, it } from "vitest";
import { isAuthorizedListeningMedia } from "./media-policy";

const owned = { sessionUserId: "learner-1", requesterUserId: "learner-1", attachedQuestionId: "q1", requestedQuestionId: "q1", attachedAssetId: "audio-1", requestedAssetId: "audio-1", skillArea: "LISTENING", status: "READY", accessScope: "CONTENT" };
describe("Listening signed URL authorization", () => {
  it("allows the owner to refresh attached READY CONTENT media", () => expect(isAuthorizedListeningMedia(owned)).toBe(true));
  it("rejects a different user", () => expect(isAuthorizedListeningMedia({ ...owned, requesterUserId: "learner-2" })).toBe(false));
  it("rejects an arbitrary unattached asset", () => expect(isAuthorizedListeningMedia({ ...owned, requestedAssetId: "other" })).toBe(false));
  it("rejects an asset attached to a different question", () => expect(isAuthorizedListeningMedia({ ...owned, requestedQuestionId: "q2" })).toBe(false));
  it("rejects PRIVATE_USER and non-ready media", () => { expect(isAuthorizedListeningMedia({ ...owned, accessScope: "PRIVATE_USER" })).toBe(false); expect(isAuthorizedListeningMedia({ ...owned, status: "ARCHIVED" })).toBe(false); });
  it("permits regeneration after expiry because authorization is independent of the old URL", () => expect(isAuthorizedListeningMedia(owned)).toBe(true));
});
