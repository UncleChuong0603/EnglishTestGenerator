import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { taxonomyLabel } from "./labels";

describe("language access and learner-facing labels", () => {
  it.each(["visual_detail", "next_action", "explicit_information"])("does not expose raw taxonomy value %s", (value) => {
    expect(taxonomyLabel(value, "vi")).not.toBe(value);
    expect(taxonomyLabel(value, "en")).not.toBe(value);
  });

  it.each(["src/app/not-found.tsx", "src/app/error.tsx", "src/components/auth/auth-ui.tsx"])("keeps a language control on %s", (file) => {
    expect(readFileSync(file, "utf8")).toMatch(/LanguageSwitcher|AuthLanguageControl/);
  });

  it("keeps interface and explanation preferences as separate fields", () => {
    const source = readFileSync("src/app/settings/actions.ts", "utf8");
    expect(source).toContain("interfaceLanguage");
    expect(source).toContain("explanationLanguage");
  });
});
