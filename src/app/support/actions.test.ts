import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  values: vi.fn(),
  getCurrentUser: vi.fn(),
  enforceRateLimit: vi.fn(),
}));
vi.mock("@/db", () => ({ db: { insert: () => ({ values: mocks.values }) } }));
vi.mock("@/db/schema", () => ({ supportTickets: {} }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/auth/rate-limit", () => ({ enforceRateLimit: mocks.enforceRateLimit }));

import { submitFeedback } from "./actions";

function feedback(overrides: Record<string, string> = {}) {
  const data = new FormData();
  Object.entries({ email: "Learner@example.com", category: "SUGGESTION", message: "Please add more listening exercises.\nThank you!", pageUrl: "https://toeicgym.net/practice", ...overrides }).forEach(([key, value]) => data.set(key, value));
  return data;
}

beforeEach(() => {
  vi.resetAllMocks();
  mocks.getCurrentUser.mockResolvedValue(null);
  mocks.values.mockResolvedValue(undefined);
  mocks.enforceRateLimit.mockResolvedValue(undefined);
});

describe("compact support form submission", () => {
  it("saves a guest message with a derived subject and returns success without redirecting", async () => {
    await expect(submitFeedback(feedback())).resolves.toEqual({ status: "success" });
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({
      email: "learner@example.com", category: "SUGGESTION",
      subject: "Please add more listening exercises. Thank you!",
      pageUrl: "https://toeicgym.net/practice",
    }));
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith("support_feedback", "Learner@example.com");
  });

  it("associates feedback with the signed-in user and limits the generated subject", async () => {
    mocks.getCurrentUser.mockResolvedValue({ id: "user-1" });
    await submitFeedback(feedback({ message: "A".repeat(160) }));
    expect(mocks.values).toHaveBeenCalledWith(expect.objectContaining({ userId: "user-1", subject: "A".repeat(120) }));
    expect(mocks.enforceRateLimit).toHaveBeenCalledWith("support_feedback", "user-1");
  });

  it.each<Record<string, string>>([
    { email: "invalid" }, { message: "too short" }, { message: " ".repeat(30) },
    { category: "UNKNOWN" }, { website: "spam" }, { pageUrl: "javascript:alert(1)" },
  ])("rejects invalid or bot submissions before writing: %j", async (overrides) => {
    await expect(submitFeedback(feedback(overrides))).resolves.toEqual({ status: "invalid" });
    expect(mocks.values).not.toHaveBeenCalled();
    expect(mocks.enforceRateLimit).not.toHaveBeenCalled();
  });

  it("reports rate limiting without saving a ticket", async () => {
    mocks.enforceRateLimit.mockRejectedValue(new Error("RATE_LIMITED"));
    await expect(submitFeedback(feedback())).resolves.toEqual({ status: "rate" });
    expect(mocks.values).not.toHaveBeenCalled();
  });

  it("does not report success if persistence fails", async () => {
    mocks.values.mockRejectedValue(new Error("database unavailable"));
    await expect(submitFeedback(feedback())).resolves.toEqual({ status: "failed" });
  });
});
