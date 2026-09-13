import { describe, expect, it } from "vitest";
import { formatTimer, selectExactUnits, validateDemoComposition } from "./composition";
import type { DemoSelectionUnit } from "./types";

const unit = (id: string, part: 5 | 6 | 7, count: number, setType: DemoSelectionUnit["setType"]): DemoSelectionUnit => ({
  id, part, setType, questionIds: Array.from({ length: count }, (_, index) => `${id}-${index}`),
});

describe("demo test composition", () => {
  it("finds an exact deterministic whole-set combination", () => {
    const selected = selectExactUnits([unit("a", 7, 5, "single"), unit("b", 7, 10, "double"), unit("c", 7, 9, "triple"), unit("d", 7, 4, "single")], 19);
    expect(selected?.map((item) => item.id)).toEqual(["b", "c"]);
  });

  it("does not return a partial set when the target is impossible", () => {
    expect(selectExactUnits([unit("a", 6, 4, "part6"), unit("b", 6, 4, "part6")], 7)).toBeNull();
  });

  it("validates the required 30/16/54 distribution", () => {
    const units = [
      ...Array.from({ length: 30 }, (_, index) => unit(`p5-${index}`, 5, 1, "standalone")),
      ...Array.from({ length: 4 }, (_, index) => unit(`p6-${index}`, 6, 4, "part6")),
      unit("p7-single", 7, 29, "single"), unit("p7-double", 7, 10, "double"), unit("p7-triple", 7, 15, "triple"),
    ];
    expect(validateDemoComposition(units)).toBe(true);
  });

  it("formats a stable countdown", () => expect(formatTimer(4472)).toBe("74:32"));
});

