import { beforeEach, describe, expect, it, vi } from "vitest";

const { execute, getServerEnv } = vi.hoisted(() => ({
  execute: vi.fn(),
  getServerEnv: vi.fn(),
}));

vi.mock("@/db", () => ({ db: { execute } }));
vi.mock("@/lib/env", () => ({ getServerEnv }));

import { GET } from "./route";

beforeEach(() => {
  vi.clearAllMocks();
  getServerEnv.mockReturnValue({ MEDIA_ENABLED: "false" });
  execute.mockResolvedValue({ rows: [{ "?column?": 1 }] });
});

describe("GET /api/health", () => {
  it("returns 200 when required environment and PostgreSQL are healthy", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok", database: "reachable" });
  });

  it("does not require an unrelated optional integration", async () => {
    getServerEnv.mockReturnValue({ MEDIA_ENABLED: "false", MEDIA_STORAGE_PROVIDER: "LOCAL" });
    expect((await GET()).status).toBe(200);
  });

  it("returns 503 when PostgreSQL is unavailable", async () => {
    execute.mockRejectedValue(new Error("connection refused"));
    const response = await GET();
    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({ status: "unhealthy", database: "unreachable" });
  });
});
