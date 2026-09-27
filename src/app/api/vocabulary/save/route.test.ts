import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ user: vi.fn(), save: vi.fn(), revalidate: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user }));
vi.mock("@/lib/vocabulary/service", () => ({ saveDictionaryVocabulary: mocks.save }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidate }));
import { POST } from "./route";

const request = (body: unknown, origin = "https://toeicgym.net") => new Request("https://toeicgym.net/api/vocabulary/save", { method: "POST", headers: { origin, host: "toeicgym.net", "content-type": "application/json" }, body: JSON.stringify(body) });
beforeEach(() => { vi.clearAllMocks(); mocks.user.mockResolvedValue({ id: "owner" }); mocks.save.mockResolvedValue(true); });
describe("save dictionary API", () => {
  it("rejects other and malformed origins before any save", async () => {
    for (const origin of ["https://other.test", "null", "invalid"]) expect((await POST(request({}, origin))).status).toBe(403);
    expect(mocks.user).not.toHaveBeenCalled(); expect(mocks.save).not.toHaveBeenCalled();
  });
  it("requires authentication and validates the payload", async () => {
    mocks.user.mockResolvedValueOnce(null);
    expect((await POST(request({ word: "invoice", context: "test", part: 5 }))).status).toBe(401);
    expect((await POST(request({ word: "invoice", context: "test", part: 9 }))).status).toBe(400);
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it("uses the authenticated owner and ignores client-supplied dictionary definitions", async () => {
    expect((await POST(request({ word: "invoice", context: "Please pay.", part: 5, userId: "other", dictionaryCard: { meaningEn: "forged" } }))).status).toBe(200);
    expect(mocks.save).toHaveBeenCalledWith("owner", "invoice", "Please pay.", 5);
    expect(mocks.revalidate).toHaveBeenCalledWith("/vocabulary");
  });
});
