import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const origin = process.argv[2] ?? "http://127.0.0.1:3100";
const outputDir = "artifacts/blog-content-review";
const slug = "mao-tu-a-an-the-va-khong-mao-tu";
const viewports = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 900 },
  { name: "1440", width: 1440, height: 1000 },
];

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];

for (const locale of ["vi", "en"]) {
  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    await context.addCookies([{ name: "toeic_interface_language", value: locale, url: origin }]);
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", message => {
      if (message.type() === "error" && !message.text().includes("eval() is not supported")) consoleErrors.push(message.text());
    });

    const response = await page.goto(`${origin}/blog/${slug}`, { waitUntil: "networkidle" });
    const question = page.locator('section[aria-label="Câu hỏi ví dụ"]').first();
    await question.scrollIntoViewIfNeeded();
    await page.screenshot({ path: `${outputDir}/${locale}-${viewport.name}.png`, fullPage: false });

    const metrics = await page.evaluate(() => {
      const questionElement = document.querySelector('section[aria-label="Câu hỏi ví dụ"]');
      const grid = questionElement?.querySelector('ol[aria-label="Các lựa chọn"]');
      const cards = grid ? [...grid.children] : [];
      return {
        articleLang: document.querySelector("article")?.lang,
        horizontalOverflow: document.documentElement.scrollWidth - innerWidth,
        questionCount: document.querySelectorAll('section[aria-label="Câu hỏi ví dụ"]').length,
        firstChoiceCount: cards.length,
        gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns.split(" ").length : 0,
        labels: cards.map(card => card.firstElementChild?.textContent?.trim()),
        answerCallouts: document.querySelectorAll(".article-body aside.border-l-4").length,
      };
    });

    results.push({ locale, viewport, status: response?.status(), metrics, consoleErrors });
    await context.close();
  }
}

await browser.close();
await writeFile(`${outputDir}/review.json`, JSON.stringify(results, null, 2));

const failures = results.flatMap(result => {
  const issues = [];
  if (result.status !== 200) issues.push(`HTTP ${result.status}`);
  if (result.metrics.articleLang !== "vi") issues.push(`article lang=${result.metrics.articleLang}`);
  if (result.metrics.horizontalOverflow > 0) issues.push(`overflow=${result.metrics.horizontalOverflow}`);
  if (result.metrics.questionCount < 3) issues.push(`questions=${result.metrics.questionCount}`);
  if (result.metrics.firstChoiceCount !== 4) issues.push(`choices=${result.metrics.firstChoiceCount}`);
  if (result.viewport.width < 640 && result.metrics.gridColumns !== 1) issues.push(`mobile columns=${result.metrics.gridColumns}`);
  if (result.viewport.width >= 640 && result.metrics.gridColumns !== 2) issues.push(`wide columns=${result.metrics.gridColumns}`);
  if (result.metrics.labels.join("") !== "ABCD") issues.push(`labels=${result.metrics.labels.join("")}`);
  if (result.metrics.answerCallouts < 2) issues.push(`answers=${result.metrics.answerCallouts}`);
  if (result.consoleErrors.length) issues.push(`console=${result.consoleErrors.join(" | ")}`);
  return issues.map(issue => `${result.locale}-${result.viewport.name}: ${issue}`);
});

console.log(JSON.stringify({ reviews: results.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
