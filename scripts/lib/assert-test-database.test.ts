import { describe, expect, it } from "vitest";
import { assertTestDatabase } from "./assert-test-database.mjs";

describe("integration database guard", () => {
  it.each([
    "postgresql://toeicgym_test:password@postgres:5432/toeicgym_task17",
    "postgresql://toeicgym_test:password@127.0.0.1:15433/toeicgym",
    "postgresql://app:password@127.0.0.1:15433/toeicgym_task17",
    "postgresql://toeicgym_test:password@localhost:15433/toeicgym_task17",
  ])("rejects a non-test target before connection", async (url) => {
    await expect(assertTestDatabase(url)).rejects.toThrow("TEST_DATABASE_IDENTITY_REJECTED");
  });
});
