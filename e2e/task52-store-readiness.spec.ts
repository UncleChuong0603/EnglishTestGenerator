import { expect, test } from "@playwright/test";

const viewports = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1024, height: 900 },
  { width: 1440, height: 900 },
] as const;

for (const locale of ["vi", "en"] as const) {
  for (const viewport of viewports) {
    test(`${locale} public privacy and deletion pages at ${viewport.width}px`, async ({
      context,
      page,
    }) => {
      await page.setViewportSize(viewport);
      await context.addCookies([
        {
          name: "toeic_interface_language",
          value: locale,
          url: "http://127.0.0.1:3100",
        },
      ]);

      await page.goto("/delete-account");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        locale === "vi"
          ? "Xóa tài khoản TOEIC GYM"
          : "Delete your TOEIC GYM account",
      );
      await expect(
        page.getByRole("link", {
          name:
            locale === "vi"
              ? "Đăng nhập để tiếp tục"
              : "Sign in to continue",
        }),
      ).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      await page.keyboard.press("Tab");
      await expect(page.locator(":focus")).toBeVisible();

      await page.goto("/privacy");
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        locale === "vi" ? "Quyền riêng tư" : "Privacy",
      );
      await expect(page.getByRole("heading", { level: 2 })).toHaveCount(7);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
    });
  }
}
