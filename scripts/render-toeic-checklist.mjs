// Run against a local build to regenerate the original blank A4 worksheet.
// Usage: node scripts/render-toeic-checklist.mjs http://127.0.0.1:3000
import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const origin = new URL(process.argv[2] ?? "http://127.0.0.1:3000").origin;
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext();
  await context.addCookies([{ name: "toeic_interface_language", value: "vi", url: origin }]);
  const page = await context.newPage();
  const response = await page.goto(`${origin}/toeic/checklist-hoc-tuan`, { waitUntil: "networkidle" });
  if (response?.status() !== 200 || await page.locator('input[type="checkbox"]').count() !== 5) throw new Error("Checklist page is not ready");
  await page.evaluate(() => document.fonts.ready);
  await mkdir("public/seo", { recursive: true });
  await page.pdf({ path: "public/seo/toeic-checklist-hoc-tuan.pdf", format: "A4", preferCSSPageSize: true, printBackground: false });
  console.log("Generated public/seo/toeic-checklist-hoc-tuan.pdf from the blank checklist page.");
} finally {
  await browser.close();
}
