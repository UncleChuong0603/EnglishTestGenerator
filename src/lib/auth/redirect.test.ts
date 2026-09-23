import { describe, expect, it } from "vitest";
import { guestContinuationPath, safeGuestContinuation, safeInternalReturnTo } from "./redirect";

describe("authentication return destinations", () => {
  it("keeps internal paths and their query string", () => {
    expect(safeInternalReturnTo("/continue-learning?result=abc")).toBe(
      "/continue-learning?result=abc",
    );
  });

  it.each([
    "https://evil.example/path",
    "//evil.example/path",
    "/\\evil.example/path",
    "javascript:alert(1)",
    "%2F%2Fevil.example/path",
    "/\nlocation",
    "/%2F%2Fevil.example",
    "/%5Cevil.example",
  ])("rejects unsafe destination %s", (value) => {
    expect(safeInternalReturnTo(value)).toBe("/dashboard");
  });

  it("encodes the result reference", () => {
    expect(guestContinuationPath("result/id")).toBe(
      "/continue-learning?result=result%2Fid",
    );
  });

  it("accepts only a UUID result reference for guest continuation", () => {
    const id = "123e4567-e89b-12d3-a456-426614174000";
    expect(safeGuestContinuation(guestContinuationPath(id))).toBe(guestContinuationPath(id));
    expect(safeGuestContinuation("/continue-learning?result=not-a-uuid")).toBeNull();
    expect(safeGuestContinuation("/dashboard?result=" + id)).toBeNull();
    expect(safeGuestContinuation("//evil.example/continue-learning?result=" + id)).toBeNull();
  });
});
