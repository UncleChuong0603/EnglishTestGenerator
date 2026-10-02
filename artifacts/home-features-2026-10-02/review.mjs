import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';

const root = path.resolve('artifacts/home-features-2026-10-02');
await mkdir(root, { recursive: true });
const browser = await chromium.launch({ headless: true });
const records = [];
const routes = ['/challenge/part-5', '/practice', '/diagnostic', '/full-mock', '/listening-lessons', '/vocabulary', '/mistakes', '/blog/ngu-phap', '/dashboard', '/progress', '/ranking', '/toeic/checklist-hoc-tuan', '/settings?section=goal', '/dashboard#weekly-plan-heading', '/dashboard#weekly-review', '/ranking?tab=READING_100'];
try {
  for (const locale of ['vi', 'en']) {
    const context = await browser.newContext();
    await context.addCookies([{ name: 'toeic_interface_language', value: locale, url: 'http://127.0.0.1:3100' }]);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const route of ['/', '/ve-toeic-gym']) {
      const response = await page.goto(`http://127.0.0.1:3100${route}`, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200);
      const directory = page.locator(route === '/' ? '#features' : '#about-features');
      for (const href of routes) assert.equal(await directory.locator(`a[href="${href}"]`).count(), 1, `${locale} ${route}: ${href}`);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(await page.locator('main').getAttribute('lang') ?? await page.locator('article').getAttribute('lang'), locale);
      for (const width of [375, 768, 1024, 1440]) {
        await page.setViewportSize({ width, height: 960 });
        await page.goto(`http://127.0.0.1:3100${route}`, { waitUntil: 'networkidle' });
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' });
        const overflow = await page.evaluate(() => ({ width: innerWidth, scroll: document.documentElement.scrollWidth }));
        assert.ok(overflow.scroll <= width, `${locale} ${route} overflow: ${JSON.stringify(overflow)}`);
        const clipped = await page.locator('main a, main button, main h1, main h2, main h3, main h4').evaluateAll(nodes => nodes.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && (rect.left < -1 || rect.right > innerWidth + 1);
        }).map(el => el.textContent));
        assert.deepEqual(clipped, [], `${locale} ${route} clipped controls at ${width}`);
        const screenshot = `${route === '/' ? 'home' : 'about'}-${locale}-${width}.png`;
        await page.screenshot({ path: path.join(root, screenshot), fullPage: true });
        await page.keyboard.press('Control+Home');
        await page.keyboard.press('Tab');
        const skip = await page.evaluate(() => ({ href: document.activeElement.getAttribute('href'), top: document.activeElement.getBoundingClientRect().top }));
        assert.equal(skip.href, '#main-content');
        assert.ok(skip.top >= 0, 'Skip link must be visible on focus');
        await page.keyboard.press('Enter');
        await page.keyboard.press('Tab');
        const focus = await page.evaluate(() => {
          const el = document.activeElement;
          const style = getComputedStyle(el);
          return { tag: el.tagName, outline: style.outlineStyle, width: style.outlineWidth };
        });
        assert.notEqual(focus.outline, 'none', `${locale} ${route} keyboard focus at ${width}`);
        records.push({ locale, route, width, screenshot, overflow: false, keyboardFocus: focus });
      }
    }
    await page.setViewportSize({ width: 375, height: 960 });
    await page.goto('http://127.0.0.1:3100/');
    await page.locator('header summary').focus();
    await page.keyboard.press('Enter');
    assert.ok(await page.locator('header details').getAttribute('open') !== null, 'Keyboard opens mobile menu');
    await page.locator('header details a[href="/#features"]').click();
    await page.waitForURL('**/#features');
    assert.ok(page.url().endsWith('/#features'));
    await page.locator('#features a[href="/listening-lessons"]').click();
    await page.waitForURL(url => url.pathname === '/sign-in' && url.searchParams.get('next') === '/listening-lessons');
    assert.deepEqual(errors, [], `${locale}: browser runtime errors`);
    await context.close();
  }
  await writeFile(path.join(root, 'review.json'), JSON.stringify({ passed: true, records }, null, 2));
  console.log(`PASS: ${records.length} responsive/language reviews, feature destinations, keyboard focus, mobile menu and listening sign-in redirect.`);
} finally {
  await browser.close();
}
