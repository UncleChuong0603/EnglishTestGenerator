import { expect, test, type Page } from "@playwright/test";

async function setLanguage(page: Page, interfaceLanguage: "vi" | "en") {
  const status = await page.evaluate(async (language) => (await fetch("/api/v1/me/preferences", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ interfaceLanguage: language, explanationLanguage: "both" }),
  })).status, interfaceLanguage);
  expect(status).toBe(200);
}

test("exam readiness stays evidence-led, bilingual, responsive, and keyboard visible", async ({ page }) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("learner@task50.invalid");
  await page.locator('input[name="password"]').fill("Task50-Strong-Password");
  await page.locator('button[type="submit"], form button').last().click();
  await expect(page).toHaveURL(/\/dashboard/);

  for (const language of ["vi", "en"] as const) {
    await setLanguage(page, language);
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      await page.goto("/progress");
      await expect(page.getByRole("heading", { name: language === "vi" ? "Mức sẵn sàng dựa trên bằng chứng" : "Evidence-based exam readiness" })).toBeVisible();
      await expect(page.getByText(language === "vi" ? "Dựa trên 60 câu đã trả lời." : "Based on 60 answered questions.").first()).toBeVisible();
      await expect(page.getByText(language === "vi" ? "Làm Full Mock" : "Take a Full Mock")).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      const action = page.getByRole("link", { name: new RegExp(language === "vi" ? "Làm Full Mock" : "Take a Full Mock") });
      expect((await action.boundingBox())?.height).toBeGreaterThanOrEqual(44);
      await action.focus();
      expect(Number.parseFloat(await action.evaluate((element) => getComputedStyle(element).outlineWidth))).toBeGreaterThanOrEqual(2);
    }
  }

  const response = await page.request.get("/api/v1/progress");
  expect(response.status()).toBe(200);
  const payload = await response.json();
  expect(payload.data.readiness.listening).toMatchObject({ state: "STRONG", answered: 60, correct: 52 });
  expect(payload.data.readiness.reading).toMatchObject({ state: "STABLE", answered: 60, correct: 45 });
  expect(payload.data.readiness.mocks).toMatchObject({ completed: 1, recommended: true });
  expect(JSON.stringify(payload)).not.toMatch(/predictedScore|readinessPercentage|targetProbability/);
});
