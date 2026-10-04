import { expect, test, type Page } from "@playwright/test";

const transcriptOpening = "On my first day at a new job";

async function setLanguage(page: Page, language: "vi" | "en") {
  const response = await page.evaluate(async (interfaceLanguage) => {
    const result = await fetch("/api/v1/me/preferences", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ interfaceLanguage, explanationLanguage: "both" }),
    });
    return result.status;
  }, language);
  expect(response).toBe(200);
}

async function assertResponsiveCatalog(page: Page, language: "vi" | "en") {
  await setLanguage(page, language);
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/listening-lessons/dictation");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      language === "vi" ? "Nghe – chép chính tả" : "Listening dictation",
    );
    await expect(
      page
        .getByRole("button", {
          name: language === "vi" ? "Bắt đầu nghe – chép" : "Start dictation",
        })
        .first(),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const box = await page
      .getByRole("button", {
        name: language === "vi" ? "Bắt đầu nghe – chép" : "Start dictation",
      })
      .first()
      .boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
}

test("dictation is responsive, keyboard-visible, and discloses transcript only after an attempt", async ({
  page,
}) => {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill("learner@task50.invalid");
  await page.locator('input[name="password"]').fill("Task50-Strong-Password");
  await page.locator('button[type="submit"], form button').last().click();
  await expect(page).toHaveURL(/\/dashboard/);

  await assertResponsiveCatalog(page, "vi");
  await assertResponsiveCatalog(page, "en");
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/listening-lessons/dictation");
  const start = page.getByRole("button", { name: "Start dictation" }).first();
  await page.keyboard.press("Tab");
  await start.focus();
  const outline = await start.evaluate(
    (element) => getComputedStyle(element).outlineWidth,
  );
  expect(Number.parseFloat(outline)).toBeGreaterThanOrEqual(2);
  await start.click();
  await expect(page).toHaveURL(/\/listening-lessons\/dictation\/[0-9a-f-]+$/);
  await expect(page.getByText(transcriptOpening, { exact: false })).toHaveCount(
    0,
  );
  const audioSource = await page.locator("audio").getAttribute("src");
  expect(audioSource).toMatch(/^\/listening-talks\/.+\.mp3$/);
  expect((await page.request.get(audioSource!)).status()).toBe(200);
  await page.getByLabel("What you heard").fill("not the transcript");
  await page.getByRole("button", { name: "Check" }).click();
  await expect(
    page.getByText(transcriptOpening, { exact: false }),
  ).toBeVisible();
  await expect(
    page.getByText(/not converted into a TOEIC score/i),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByText(transcriptOpening, { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
