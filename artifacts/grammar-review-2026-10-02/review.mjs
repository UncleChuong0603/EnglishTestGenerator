import { chromium } from "@playwright/test";
import { writeFile } from "node:fs/promises";

const origin = process.argv[2] ?? "http://127.0.0.1:3000";
const sizes = [
  { name: "375", width: 375, height: 812 },
  { name: "768", width: 768, height: 1024 },
  { name: "1024", width: 1024, height: 900 },
  { name: "1280", width: 1280, height: 900 },
  { name: "1440", width: 1440, height: 1000 },
];
const browser = await chromium.launch({ headless: true });
const results = [];

for (const locale of ["vi", "en"]) {
  for (const size of sizes) {
    const context = await browser.newContext({ viewport: size });
    await context.addCookies([{ name: "toeic_interface_language", value: locale, url: origin }]);
    const page = await context.newPage();
    const consoleErrors = [];
    page.on("console", (message) => {
      if (message.type() === "error" && !message.text().includes("React DevTools") && !message.text().includes("eval() is not supported") && !message.text().includes("/_next/hmr")) {
        consoleErrors.push(message.text());
      }
    });
    const response = await page.goto(`${origin}/ngu-phap`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `artifacts/grammar-review-2026-10-02/${locale}-${size.name}.png` });

    const metrics = await page.evaluate(({ locale, width }) => {
      const headerGrammarLinks = [...document.querySelectorAll('header a[href="/ngu-phap"]')];
      const desktopGrammarLink = headerGrammarLinks.find((link) => {
        const box = link.getBoundingClientRect();
        return box.width > 0 && box.height > 0;
      });
      const cards = document.querySelectorAll('section[aria-labelledby="coverage-title"] a[href^="/blog/"]');
      const lessons = document.querySelectorAll("main section[id] > ol > li");
      return {
        lang: document.documentElement.lang,
        title: document.querySelector("h1")?.textContent?.trim(),
        horizontalOverflow: document.documentElement.scrollWidth - window.innerWidth,
        coverageCards: cards.length,
        lessons: lessons.length,
        visibleHeaderGrammarLink: Boolean(desktopGrammarLink),
        headerGrammarTargetHeight: desktopGrammarLink?.getBoundingClientRect().height ?? 0,
        mobileMenuExpected: width < 1280,
        canonical: document.querySelector('link[rel="canonical"]')?.href,
        localeExpected: locale,
      };
    }, { locale, width: size.width });

    let mobileMenu = null;
    if (size.width < 1280) {
      await page.locator("header summary").click();
      const link = page.locator('header nav[aria-label="Public mobile navigation"] a[href="/ngu-phap"]');
      mobileMenu = {
        visible: await link.isVisible(),
        height: (await link.boundingBox())?.height ?? 0,
      };
      await page.locator("header summary").click();
    }

    await page.keyboard.press("Home");
    await page.keyboard.press("Tab");
    const focus = await page.evaluate(() => {
      const active = document.activeElement;
      const style = active ? getComputedStyle(active) : null;
      return {
        tag: active?.tagName,
        text: active?.textContent?.trim().slice(0, 80),
        outlineStyle: style?.outlineStyle,
        outlineWidth: style?.outlineWidth,
      };
    });

    await page.locator("#nen-tang").scrollIntoViewIfNeeded();
    await page.screenshot({ path: `artifacts/grammar-review-2026-10-02/${locale}-${size.name}-lessons.png` });

    results.push({ locale, viewport: size, status: response?.status(), metrics, mobileMenu, focus, consoleErrors });
    await context.close();
  }
}

await browser.close();
await writeFile("artifacts/grammar-review-2026-10-02/review.json", JSON.stringify(results, null, 2));

const failures = results.flatMap((result) => {
  const issues = [];
  if (result.status !== 200) issues.push(`HTTP ${result.status}`);
  if (result.metrics.lang !== result.locale) issues.push(`lang=${result.metrics.lang}`);
  if (result.metrics.horizontalOverflow > 0) issues.push(`overflow=${result.metrics.horizontalOverflow}`);
  if (result.metrics.coverageCards !== 4) issues.push(`coverage=${result.metrics.coverageCards}`);
  if (result.metrics.lessons < 40) issues.push(`lessons=${result.metrics.lessons}`);
  if (!result.metrics.visibleHeaderGrammarLink) issues.push("grammar nav hidden");
  if (result.metrics.headerGrammarTargetHeight < 44) issues.push(`nav target=${result.metrics.headerGrammarTargetHeight}`);
  if (result.mobileMenu && (!result.mobileMenu.visible || result.mobileMenu.height < 44)) issues.push("mobile grammar link inaccessible");
  if (result.focus.outlineStyle === "none" || result.focus.outlineWidth === "0px") issues.push("first focus has no outline");
  if (result.consoleErrors.length) issues.push(`console=${result.consoleErrors.join(" | ")}`);
  return issues.map((issue) => `${result.locale}-${result.viewport.name}: ${issue}`);
});

console.log(JSON.stringify({ reviews: results.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
