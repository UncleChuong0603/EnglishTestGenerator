import { describe, expect, it } from "vitest";
import { en } from "./en";
import { vi } from "./vi";

function keys(value: unknown, prefix = ""): string[] {
  if (Array.isArray(value)) return value.flatMap((item, index) => keys(item, `${prefix}[${index}]`));
  if (value && typeof value === "object") return Object.entries(value).flatMap(([key, child]) => keys(child, prefix ? `${prefix}.${key}` : key));
  return [prefix];
}

describe("translation dictionaries", () => {
  it("keeps English and Vietnamese keys structurally consistent", () => {
    expect(keys(vi).sort()).toEqual(keys(en).sort());
  });
});
