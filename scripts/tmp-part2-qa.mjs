import { chromium } from "@playwright/test";
import { writeFileSync } from "node:fs";

const browser = await chromium.launch({ headless: true });
const results = [];

for (const width of [375, 768, 1024, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: width === 375 ? 812 : 900 } });
  const page = await context.newPage();
  const response = await page.goto("http://localhost:3015/toeic/part-2", { waitUntil: "networkidle" });
  const audit = await page.evaluate(() => {
    const schema = JSON.parse(document.querySelector('script[type="application/ld+json"]')?.textContent || "{}");
    const cta = document.querySelector('a[href="#bai-nghe-mau"]');
    const box = cta?.getBoundingClientRect();
    return {
      h1: document.querySelectorAll("h1").length,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      audio: document.querySelectorAll("audio").length,
      schemaAudio: schema.hasPart?.filter((part) => part["@type"] === "AudioObject").length,
      quizQuestions: schema.hasPart?.find((part) => part["@type"] === "Quiz")?.numberOfQuestions,
      ctaHeight: box?.height,
      ctaOutline: cta ? getComputedStyle(cta).outlineStyle : null,
    };
  });
  await page.locator('a[href="#bai-nghe-mau"]').focus();
  audit.ctaFocusedOutline = await page.locator('a[href="#bai-nghe-mau"]').evaluate((element) => getComputedStyle(element).outlineStyle);
  results.push({ width, status: response?.status(), ...audit });
  if (width === 375 || width === 1440) {
    for (const section of await page.locator("main section").all()) {
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
    }
    await page.evaluate(() => scrollTo(0, 0));
    await page.waitForTimeout(250);
    await page.screenshot({ path: `part2-${width}.png`, fullPage: true });
  }
  await context.close();
}

const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
await context.addCookies([{ name: "toeic_interface_language", value: "en", domain: "localhost", path: "/" }]);
const page = await context.newPage();
await page.goto("http://localhost:3015/toeic/part-2", { waitUntil: "networkidle" });
const sections = ["bai-nghe-mau", "phan-hoi-chua-quyet-dinh", "phan-hoi-chuyen-nguoi", "phan-hoi-tu-choi"];
const correct = [0, 1, 2, 0];
await page.locator(`#${sections[0]} button`).filter({ hasText: "Kiểm tra đáp án" }).click();
const emptyError = await page.locator(`#${sections[0]} [aria-live="polite"]`).textContent();
for (let index = 0; index < sections.length; index += 1) {
  const section = page.locator(`#${sections[index]}`);
  await section.locator(`input[type="radio"]`).nth(correct[index]).check();
  await section.getByRole("button", { name: "Kiểm tra đáp án" }).click();
}
await page.locator(`#${sections[3]} details`).last().locator("summary").focus();
await page.keyboard.press("Enter");
const interactive = await page.evaluate((ids) => ({
  lang: document.documentElement.lang,
  articleLang: document.querySelector("article")?.lang,
  home: document.body.textContent?.includes("Home"),
  statuses: ids.map((id) => document.querySelector(`#${id} [aria-live="polite"]`)?.textContent),
  explanationsOpen: ids.map((id) => document.querySelector(`#${id} fieldset details`)?.hasAttribute("open")),
  transcriptOpen: document.querySelector(`#${ids[3]} > details:last-of-type`)?.hasAttribute("open"),
  hiddenContent: [...document.querySelectorAll("main section")].some((element) => getComputedStyle(element).visibility === "hidden" || getComputedStyle(element).opacity === "0"),
}), sections);
results.push({ localeAndInteraction: { emptyError, ...interactive } });
await context.close();

const landscape = await browser.newContext({ viewport: { width: 667, height: 375 } });
const landscapePage = await landscape.newPage();
await landscapePage.goto("http://localhost:3015/toeic/part-2", { waitUntil: "networkidle" });
results.push({ landscapeOverflow: await landscapePage.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) });
await landscape.close();

await browser.close();
writeFileSync("part2-qa-results.json", JSON.stringify(results, null, 2));
