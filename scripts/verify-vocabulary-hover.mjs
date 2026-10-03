// Browser checks using the real components/styles, mocked API responses and no app database.
import { build } from "esbuild";
import { chromium, expect } from "@playwright/test";
import postcss from "postcss";
import tailwind from "@tailwindcss/postcss";
import { readFile } from "node:fs/promises";
import path from "node:path";

const bundle = await build({
  stdin: { contents: `import React from 'react'; import {createRoot} from 'react-dom/client'; import {HoverWords} from './src/components/vocabulary/hover-words'; import {QuestionBlock} from './src/components/practice/question-block';
    const q={id:'q',number:1,part:5,text:'Please pay the invoice.',options:[{id:'a',key:'A',text:'invoice'},{id:'b',key:'B',text:'shipment'}]};
    createRoot(document.getElementById('root')).render(<main className="p-6"><div id="practice"><QuestionBlock vocabulary locale="en" question={q} onChoose={()=>{}} /></div><div id="mock"><QuestionBlock locale="en" question={q} onChoose={()=>{}} /></div><p className="mt-5" id="transcript"><HoverWords locale="en" part={3} text="The shipment arrived." /></p><p className="mt-5" id="transcript-vi"><HoverWords locale="vi" part={3} text="It made a big impression during her first week." /></p></main>);`, loader: "tsx", resolveDir: process.cwd() },
  bundle: true, write: false, format: "iife", jsx: "automatic", define: { "process.env.NODE_ENV": '"production"', "process.env": "{}" },
});
const cssFile = path.resolve("src/app/globals.css");
const css = await postcss([tailwind()]).process(await readFile(cssFile, "utf8"), { from: cssFile });
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1000, height: 800 }, hasTouch: true });
  const errors = []; page.on("pageerror", error => { errors.push(error.message); console.error(error.message); });
  let lookups = 0; let saves = 0;
  await page.route("http://vocabulary.test/**", async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith("/api/vocabulary/lookup/")) {
      lookups++;
      const term = decodeURIComponent(url.pathname.split("/").at(-1));
      const contextual = url.searchParams.has("context");
      await route.fulfill({ json: { term, phonetic: "/test/", audioUrl: null, partOfSpeech: "noun", meaningEn: contextual ? "A period of seven days." : "A bill for goods.", meaningVi: contextual ? "Tuần" : "Hóa đơn", contextVi: contextual ? "Nó đã gây ấn tượng lớn trong tuần đầu tiên của cô ấy." : undefined, example: contextual ? "It made a big impression during her first week." : "Please pay the invoice." } }); return;
    }
    if (url.pathname === "/api/vocabulary/save") {
      saves++; expect(route.request().postDataJSON().part).toBe(5);
      await route.fulfill({ json: { saved: true } }); return;
    }
    await route.fulfill({ contentType: "text/html", body: `<html><head><style>${css.css}</style></head><body><div id="root"></div><script>${bundle.outputFiles[0].text.replaceAll("</script>", "<\\/script>")}</script></body></html>` });
  });
  await page.goto("http://vocabulary.test/");
  await expect(page.locator("#mock [aria-haspopup=dialog]")).toHaveCount(0);
  const word = page.locator("#practice h2 [role=button]", { hasText: /^invoice$/ });
  await word.hover();
  const dialog = page.getByRole("dialog");
  await expect(dialog.getByRole("heading", { name: "invoice" })).toBeVisible();
  await dialog.getByRole("button", { name: "Save to review" }).click();
  await expect(dialog.getByRole("button", { name: "Saved", exact: true })).toBeDisabled();
  expect(saves).toBe(1);
  await dialog.getByRole("button", { name: "Close card" }).click();
  await expect(dialog).toHaveCount(0);
  await word.focus(); await word.press("Enter");
  await expect(dialog.getByRole("button", { name: "Close card" })).toBeFocused();
  await page.keyboard.press("Escape"); await expect(dialog).toHaveCount(0);
  expect(lookups).toBe(1);
  await page.setViewportSize({ width: 375, height: 667 });
  await word.tap();
  await expect(dialog.getByRole("heading", { name: "invoice" })).toBeVisible();
  const bounds = await dialog.boundingBox();
  expect(bounds.x).toBeGreaterThanOrEqual(0); expect(bounds.x + bounds.width).toBeLessThanOrEqual(375);
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(667);
  await page.locator("#transcript [role=button]", { hasText: /^shipment$/ }).click();
  await expect(dialog).toHaveCount(1);
  await expect(dialog.getByRole("heading", { name: "shipment" })).toBeVisible();
  await page.mouse.click(2, 2); await expect(dialog).toHaveCount(0);
  for (const width of [375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 800 });
    await page.locator("#transcript-vi [role=button]", { hasText: /^week$/ }).click();
    await expect(dialog.getByText("Nghĩa trong câu")).toBeVisible();
    const responsiveBounds = await dialog.boundingBox();
    expect(responsiveBounds.x).toBeGreaterThanOrEqual(0); expect(responsiveBounds.x + responsiveBounds.width).toBeLessThanOrEqual(width);
    if (process.env.VISUAL_REVIEW) await page.screenshot({ path: `.tmp/vocabulary-hover-${width}.png`, fullPage: true });
    await dialog.getByRole("button", { name: "Đóng thẻ" }).click();
  }
  expect(errors).toEqual([]);
  console.log("PASS: desktop hover/save, keyboard/Escape, caching, 375/768/1024/1440 bounds, Vietnamese context, one card, outside dismissal, mock exclusion.");
} finally { await browser.close(); }
