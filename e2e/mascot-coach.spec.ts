import { expect, test } from "@playwright/test";

const promptAtKey = "toeic-gym:milo-prompt-at";
const hiddenUntilKey = "toeic-gym:milo-hidden-until";

async function hideDevelopmentChrome(page: import("@playwright/test").Page) {
  // Keep Next.js development controls from covering the product's fixed bottom-left control.
  await page.addStyleTag({ content: "nextjs-portal { display: none !important; }" });
}

async function resetMilo(page: import("@playwright/test").Page, holdPrompt = false) {
  await page.goto("/");
  await page.evaluate(({ promptKey, hiddenKey, hold }) => {
    if (hold) window.localStorage.setItem(promptKey, String(Date.now() + 60_000));
    else window.localStorage.removeItem(promptKey);
    window.localStorage.removeItem(hiddenKey);
  }, { promptKey: promptAtKey, hiddenKey: hiddenUntilKey, hold: holdPrompt });
  await page.reload();
  await hideDevelopmentChrome(page);
}

test("Milo proactively suggests, snoozes, hides, and checks back in", async ({ page }) => {
  test.setTimeout(45_000);
  await resetMilo(page);

  const coach = page.locator(".mascot-coach");
  const bubble = page.locator(".mascot-coach-bubble");
  await expect(coach).toBeVisible();
  await expect(bubble).toBeHidden();
  await expect(bubble).toBeVisible({ timeout: 10_000 });

  await page.getByRole("button", { name: "Đóng lời khuyên và nhắc lại sau 5 phút" }).first().click();
  await expect(bubble).toBeHidden();
  const promptDelay = await page.evaluate((key) => Number(window.localStorage.getItem(key)) - Date.now(), promptAtKey);
  expect(promptDelay).toBeGreaterThan(4 * 60_000);
  expect(promptDelay).toBeLessThanOrEqual(5 * 60_000);

  await page.evaluate((key) => window.localStorage.setItem(key, String(Date.now() - 1)), promptAtKey);
  await page.reload();
  await hideDevelopmentChrome(page);
  await expect(bubble).toContainText("Milo · ghé lại nè");

  await page.getByRole("button", { name: "Tạm ẩn Milo · 30 phút" }).click();
  await expect(coach).toHaveCount(0);
  const hiddenDelay = await page.evaluate((key) => Number(window.localStorage.getItem(key)) - Date.now(), hiddenUntilKey);
  expect(hiddenDelay).toBeGreaterThan(29 * 60_000);
  expect(hiddenDelay).toBeLessThanOrEqual(30 * 60_000);

  await page.evaluate((key) => window.localStorage.setItem(key, String(Date.now() - 1)), hiddenUntilKey);
  await page.reload();
  await hideDevelopmentChrome(page);
  await expect(bubble).toContainText("Milo · ghé lại nè");
});

test("Milo is not mounted on admin routes at supported widths or locales", async ({ page }) => {
  test.setTimeout(90_000);
  for (const locale of ["vi", "en"] as const) {
    await page.context().addCookies([{
      name: "toeic_interface_language",
      value: locale,
      domain: "127.0.0.1",
      path: "/",
    }]);
    for (const width of [375, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await resetMilo(page, true);
      await expect(page.locator(".mascot-coach")).toBeVisible();

      await page.evaluate(() => window.history.pushState({}, "", "/admin/content"));

      await expect(page.locator(".mascot-coach")).toHaveCount(0);
    }
  }
});

for (const locale of ["vi", "en"] as const) {
  for (const width of [375, 768, 1024, 1440]) {
    test(`Milo stays operable at ${width}px in ${locale}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.context().addCookies([{
        name: "toeic_interface_language",
        value: locale,
        domain: "127.0.0.1",
        path: "/",
      }]);
      await resetMilo(page, true);

      const coach = page.locator(".mascot-coach");
      const trigger = page.getByRole("button", { name: locale === "vi" ? "Hỏi Milo" : "Ask Milo" });
      await expect(trigger).toBeVisible();
      await trigger.click();
      await expect(page.locator(".mascot-coach-bubble")).toBeVisible();
      await expect(page.getByRole("button", { name: locale === "vi" ? "Tạm ẩn Milo · 30 phút" : "Hide Milo · 30 minutes" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);

      const box = await coach.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);

      if (width >= 1024) {
        await page.evaluate(() => {
          const sidebar = document.createElement("aside");
          sidebar.className = "learner-navigation";
          sidebar.dataset.collapsed = "false";
          sidebar.dataset.testSidebar = "true";
          document.body.append(sidebar);
        });
        await expect.poll(async () => (await coach.boundingBox())?.x ?? 0).toBeGreaterThan(200);
        await page.evaluate(() => {
          document.querySelector<HTMLElement>("[data-test-sidebar]")!.dataset.collapsed = "true";
        });
        await expect.poll(async () => (await coach.boundingBox())?.x ?? 999).toBeLessThan(40);
      }

      await page.screenshot({ path: test.info().outputPath(`milo-${locale}-${width}.png`) });
    });
  }
}
