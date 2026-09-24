import { expect, test } from "@playwright/test";
const slug = "task-18b-playwright";
async function signIn(page: import("@playwright/test").Page) { await page.goto("/sign-in"); await page.locator('input[name="email"]').fill("admin@task18b.invalid"); await page.locator('input[name="password"]').fill("Task18b-browser-2026!"); await page.locator('button[type="submit"], form button').last().click(); await expect(page).toHaveURL(/\/dashboard/); }
test.describe.serial("Task 18 CMS publishing workflow", () => {
  test("Admin draft to public publish and unpublish", async ({ page }) => {
    test.setTimeout(120_000);
    await signIn(page); await page.goto("/admin/posts/new");
    await expect(page.getByRole("heading", { name: /Bài viết mới/i })).toBeVisible();
    await page.locator('input[name="title"]').fill("Task 18B Playwright"); await page.locator('input[name="title"]').blur(); await expect(page.locator('input[name="slug"]')).toHaveValue(slug);
    await page.locator('textarea[name="excerpt"]').fill("Bài viết kiểm thử tích hợp SEO CMS.");
    await page.locator('textarea[name="content"]').fill("## Chiến lược Part 5\n\nNội dung **an toàn** với [luyện tập](/try).\n\n<script>alert(1)</script> [x](javascript:alert(1))");
    await page.locator('select[name="category"]').selectOption("GRAMMAR"); await page.locator('input[name="tags"]').fill("Part 5, Ngữ pháp");
    await page.locator('input[name="seoTitle"]').fill("Task 18B SEO title"); await page.locator('textarea[name="seoDescription"]').fill("Mô tả SEO dành cho kiểm thử Task 18B."); await page.locator('input[name="canonicalPath"]').fill(`/blog/${slug}`);
    await page.getByRole("button", { name: "Lưu bài viết" }).click(); await expect(page).toHaveURL(/\/admin\/posts\/[0-9a-f-]{36}\?saved=1/, { timeout: 20_000 });
    const editUrl=page.url(); const draftResponse=await page.goto(`/blog/${slug}`); expect(draftResponse?.status()).toBe(404); await page.goto(editUrl);
    await page.getByRole("link", { name: "Xem trước" }).click(); await expect(page.getByText(/Bản xem trước/)).toBeVisible(); await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex.*nofollow|nofollow.*noindex/); await expect(page.locator("article script")).toHaveCount(0); expect(await page.evaluate(() => (globalThis as typeof globalThis & { __task18Xss?: boolean }).__task18Xss)).toBeUndefined();
    await page.goto(editUrl); await page.getByRole("button", { name: "Xuất bản" }).click(); await expect(page).toHaveURL(/published=1/, { timeout: 20_000 });
    await page.goto("/blog"); await expect(page.getByRole("link", { name: "Task 18B Playwright" })).toBeVisible(); await page.setViewportSize({ width: 390, height: 844 }); await page.reload(); await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await page.goto(`/blog/${slug}`); await expect(page.getByRole("heading", { name: "Task 18B Playwright" })).toBeVisible(); await expect(page.getByText("#Part 5")).toBeVisible(); await expect(page.getByText("#Ngữ pháp")).toBeVisible(); await expect(page.locator("article script")).toHaveCount(0); expect(await page.evaluate(() => (globalThis as typeof globalThis & { __task18Xss?: boolean }).__task18Xss)).toBeUndefined();
    await expect(page).toHaveTitle(/Task 18B SEO title/); await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", "Mô tả SEO dành cho kiểm thử Task 18B."); await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Task 18B SEO title"); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/blog/${slug}$`)); expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain("BlogPosting");
    expect(await (await page.request.get("/sitemap.xml")).text()).toContain(`/blog/${slug}`); expect(await (await page.request.get("/robots.txt")).text()).toContain("Disallow: /admin/");
    await page.goto(editUrl); await page.getByRole("button", { name: "Gỡ xuất bản" }).click(); await expect(page).toHaveURL(/unpublished=1/, { timeout: 20_000 }); const unavailable=await page.goto(`/blog/${slug}`); expect(unavailable?.status()).toBe(404); expect(await (await page.request.get("/sitemap.xml")).text()).not.toContain(`/blog/${slug}`);
  });
});
