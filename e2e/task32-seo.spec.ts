import { expect, test } from "@playwright/test";

const base = process.env.TASK32_BASE_URL;
test.skip(!base, "Requires an isolated Task 32 app and question bank");

test("Part 5 product pages are indexable, linked, responsive, and reveal answers only after submission", async ({ page, request }) => {
  for (const [path, title] of [
    ["/toeic/part-5", "TOEIC Part 5: cách làm và bài tập ví dụ"],
    ["/toeic/part-5/word-form", "Bài tập Word Form TOEIC Part 5 có đáp án"],
  ]) {
    const response = await request.get(`${base}${path}`);
    expect(response.status()).toBe(200);
    const html = await response.text();
    expect(html).toContain(`<link rel="canonical" href="${base}${path}"`);
    expect(html).toContain(title);
    expect(html).toContain('name="description"');
    expect(html).not.toContain('name="robots" content="noindex');
    if (path.endsWith("word-form")) {
      expect(html).not.toContain("correctOptionId");
      expect(html).not.toContain("explanationVi");
      expect(html).not.toContain("explanationEn");
    }
    await page.goto(`${base}${path}`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.getByRole("link", { name: /Part 5 Challenge|10 câu Part 5/ }).first()).toHaveAttribute("href", "/challenge/part-5");
    for (const width of [360, 390, 430, 1024, 1440]) {
      await page.setViewportSize({ width, height: width < 500 ? 844 : 1000 });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${path} at ${width}px`).toBe(true);
    }
  }
  await expect(page.getByRole("link", { name: "Xem cách luyện Part 5" })).toHaveAttribute("href", "/toeic/part-5");
  const quiz = page.locator("#quiz");
  await expect(quiz.locator("fieldset")).toHaveCount(5);
  await expect(quiz.getByText(/Đáp án đúng:|Bạn đúng \d\/5/)).toHaveCount(0);
  await quiz.getByRole("button", { name: "Kiểm tra đáp án" }).click();
  await expect(quiz.getByText("Hãy chọn đáp án cho đủ 5 câu trước khi kiểm tra.")).toBeVisible();
  for (const fieldset of await quiz.locator("fieldset").all()) await fieldset.getByRole("radio").first().check();
  await quiz.getByRole("button", { name: "Kiểm tra đáp án" }).click();
  await expect(quiz.getByText(/Bạn đúng \d\/5 câu/)).toBeVisible();
  await expect(quiz.locator("fieldset p")).toHaveCount(5);
  await quiz.locator("fieldset").first().getByRole("radio").last().check();
  await expect(quiz.getByText(/Bạn đúng \d\/5 câu/)).toHaveCount(0);
  const sitemap = await request.get(`${base}/sitemap.xml`);
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toContain(`${base}/toeic/part-5</loc>`);
  expect(xml).toContain(`${base}/toeic/part-5/word-form</loc>`);
});
