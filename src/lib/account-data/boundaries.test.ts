import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  user: vi.fn(), exportData: vi.fn(), deleteData: vi.fn(), rate: vi.fn(), clearCookie: vi.fn(),
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.user, SESSION_COOKIE: "toeic_session" }));
vi.mock("@/lib/auth/rate-limit", () => ({ enforceRateLimit: mocks.rate }));
vi.mock("@/lib/account-data/service", () => ({
  exportLearningData: mocks.exportData, deleteAccount: mocks.deleteData,
  AccountDataError: class extends Error {},
}));
vi.mock("next/headers", () => ({ cookies: async () => ({ delete: mocks.clearCookie }) }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => { throw Object.assign(new Error(url), { digest: "NEXT_REDIRECT" }); },
}));

import { GET } from "@/app/api/account/data-export/route";
import { deleteAccountAction } from "@/app/settings/account-data-actions";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.user.mockResolvedValue({ id: "authenticated-owner" });
  mocks.exportData.mockResolvedValue({ format: "toeicgym-learning-data" });
  mocks.rate.mockResolvedValue(undefined);
  mocks.deleteData.mockResolvedValue({ status: "deleted" });
});

describe("account data transport authorization", () => {
  it("rejects anonymous export and deletion without reaching data services", async () => {
    mocks.user.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
    await expect(deleteAccountAction({ ok: false }, new FormData())).rejects.toThrow("/sign-in");
    expect(mocks.exportData).not.toHaveBeenCalled();
    expect(mocks.deleteData).not.toHaveBeenCalled();
  });

  it("exports only the session-derived owner with private no-store headers", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("content-disposition")).toContain("attachment");
    expect(mocks.exportData).toHaveBeenCalledWith("authenticated-owner");
  });

  it("ignores a forged userId and clears the session cookie after confirmed deletion", async () => {
    const input = new FormData();
    input.set("userId", "victim");
    input.set("confirmationEmail", "owner@example.com");
    input.set("acknowledge", "yes");
    await expect(deleteAccountAction({ ok: false }, input)).rejects.toThrow("/account-deleted");
    expect(mocks.deleteData).toHaveBeenCalledWith("authenticated-owner", "owner@example.com");
    expect(mocks.clearCookie).toHaveBeenCalledWith("toeic_session");
  });

  it("requires acknowledgement before calling deletion", async () => {
    const input = new FormData();
    input.set("confirmationEmail", "owner@example.com");
    expect(await deleteAccountAction({ ok: false }, input)).toEqual({ ok: false, error: "invalid" });
    expect(mocks.deleteData).not.toHaveBeenCalled();
  });

  it("rate-limits both operations without invoking a destructive service", async () => {
    mocks.rate.mockRejectedValue(new Error("RATE_LIMITED"));
    const response = await GET();
    expect(response.status).toBe(429);
    expect(response.headers.get("retry-after")).toBe("3600");
    const input = new FormData();
    input.set("confirmationEmail", "owner@example.com");
    input.set("acknowledge", "yes");
    expect(await deleteAccountAction({ ok: false }, input)).toEqual({ ok: false, error: "rate_limited" });
    expect(mocks.deleteData).not.toHaveBeenCalled();
  });
});
