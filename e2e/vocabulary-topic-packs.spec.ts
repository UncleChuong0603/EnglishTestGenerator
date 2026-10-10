import { expect, test } from "@playwright/test";

const widths = [375, 768, 1024, 1440] as const;

for (const locale of ["vi", "en"] as const) {
  test(`vocabulary packs work responsively in ${locale}`, async ({ context, page }, testInfo) => {
    await context.addCookies([{ name: "toeic_interface_language", value: locale, url: "http://127.0.0.1:3100" }]);

    for (const width of widths) {
      await page.setViewportSize({ width, height: width === 375 ? 812 : 900 });
      await page.goto("/vocabulary", { waitUntil: "domcontentloaded" });

      const packHeading = locale === "vi" ? "Chọn chủ đề từ vựng" : "Choose a vocabulary topic";
      await expect(page.getByRole("heading", { name: packHeading })).toBeVisible();
      await expect(page.getByRole("button", { name: new RegExp(locale === "vi" ? "Văn phòng & email" : "Office & email") })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

      const officePack = page.getByRole("button", { name: new RegExp(locale === "vi" ? "Văn phòng & email" : "Office & email") });
      await officePack.focus();
      await expect(officePack).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/topic=office/);
      await expect(page.getByRole("heading", { name: locale === "vi" ? "Văn phòng & email" : "Office & email" })).toBeFocused();
      await expect(page.getByRole("button", { name: locale === "vi" ? "Mở nghĩa" : "Reveal meaning" })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

      await page.getByRole("button", { name: locale === "vi" ? "Mở nghĩa" : "Reveal meaning" }).click();
      await expect(page.getByRole("region", { name: new RegExp("agenda", "i") })).toBeVisible();
      await page.screenshot({ path: testInfo.outputPath(`vocabulary-${locale}-${width}.png`), fullPage: true });

      await page.goBack();
      await expect(page.getByRole("heading", { name: packHeading })).toBeVisible();
      await expect(page).not.toHaveURL(/topic=/);
    }
  });
}
