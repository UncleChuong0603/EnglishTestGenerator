import { expect, test } from "@playwright/test";

test("Admin validates, previews, imports Draft, and rejects duplicate", async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill("admin@task18b.invalid");
  await page.locator('input[name="password"]').fill("Task18b-browser-2026!");
  await page.locator('button[type="submit"], form button').last().click();
  await expect(page).toHaveURL(/\/dashboard/);
  await page.goto("/admin/content/import");
  await expect(page.getByRole("heading",{name:"Question Bank Import"})).toBeVisible();
  const template=await page.request.get("/api/admin/content-import/template");
  expect(template.ok()).toBe(true);
  const payload=await template.json();
  const stamp=Date.now().toString(36);
  payload.batch.batchKey=`e2e-task19-${stamp}`;
  payload.batch.name=`Task 19 E2E ${stamp}`;
  payload.items[0].externalItemId=`P5-E2E-${stamp}`;
  payload.items[0].title=`DEVELOPMENT / FORMAT EXAMPLE ${stamp}`;
  payload.items[0].questions[0].externalQuestionId=`P5-E2E-${stamp}-Q1`;
  payload.items[0].questions[0].text=`The manager ${stamp} _____ the report yesterday.`;
  const file={name:"task19-e2e.json",mimeType:"application/json",buffer:Buffer.from(JSON.stringify(payload))};
  await page.locator('input[type="file"]').setInputFiles(file);
  await page.getByRole("button",{name:"Validate / Dry run"}).click();
  await expect(page.getByText("HỢP LỆ")).toBeVisible();
  await expect(page.getByText(payload.items[0].questions[0].text)).toBeVisible();
  page.once("dialog",(dialog)=>dialog.accept());
  await page.getByRole("button",{name:"Xác nhận import Draft"}).click();
  await expect(page.getByRole("heading",{name:"Import thành công"})).toBeVisible();
  await page.getByRole("link",{name:"Mở Admin Content để review"}).click();
  await expect(page.getByRole("link",{name:payload.items[0].title})).toBeVisible();
  await page.goto("/admin/content/import");
  await page.locator('input[type="file"]').setInputFiles(file);
  await page.getByRole("button",{name:"Validate / Dry run"}).click();
  await expect(page.getByText("ALREADY_IMPORTED")).toBeVisible();
});

test("Admin sees malformed JSON error on mobile", async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto("/sign-in");
  await page.locator('input[name="email"]').fill("admin@task18b.invalid");
  await page.locator('input[name="password"]').fill("Task18b-browser-2026!");
  await page.locator('button[type="submit"], form button').last().click();
  await page.goto("/admin/content/import");
  await page.locator('input[type="file"]').setInputFiles({name:"bad.json",mimeType:"application/json",buffer:Buffer.from("{")});
  await page.getByRole("button",{name:"Validate / Dry run"}).click();
  await expect(page.getByText("MALFORMED_JSON")).toBeVisible();
});
