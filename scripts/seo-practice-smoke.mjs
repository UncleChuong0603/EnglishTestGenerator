import { chromium } from 'playwright';

// Public, anonymous mini-practice only; does not create a learner session.
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  await page.goto('https://toeicgym.net/toeic/part-5/practice', { waitUntil: 'networkidle' });
  const fields = page.locator('fieldset');
  const count = await fields.count();
  for (let i = 0; i < count; i++) await fields.nth(i).locator('input').first().check();
  await page.locator('#bai-tap button').click();
  const result = await page.locator('#bai-tap [aria-live]').textContent();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  const passed = count === 7 && result.includes('/7') && !overflow;
  console.log(JSON.stringify({ questions: count, resultVisible: result.includes('/7'), horizontalOverflow: overflow, passed }));
  if (!passed) process.exitCode = 1;
} finally {
  await browser.close();
}
