import { expect, test } from "@playwright/test";
import pg from "pg";

async function signIn(page: import("@playwright/test").Page, email: string) {
  await page.goto("/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.locator('input[name="password"]').fill("Task16c-browser-2026!");
  await page.locator('button[type="submit"], form button').last().click();
  await expect(page).toHaveURL(/\/dashboard/);
}

test("admin challenge page is protected and loads for ADMIN", async ({ page }) => {
  const url = new URL(process.env.TASK16_TEST_DATABASE_URL ?? ""); expect(url.hostname).toBe("127.0.0.1"); expect(url.port).toBe("15433");
  await signIn(page, "admin@task16c.invalid");
  await page.goto("/admin/challenges");
  await expect(page.getByRole("heading", { name: /Challenge/i }).first()).toBeVisible();
  await page.goto("/admin/challenges/new");
  await page.locator('input[name="titleVi"]').fill("Playwright Reading Challenge");
  await page.locator('input[name="titleEn"]').fill("Playwright Reading Challenge");
  await page.locator('select[name="type"]').selectOption("READING_100");
  await page.locator('input[name="startsAt"]').fill("2045-01-01T00:00"); await page.locator('input[name="endsAt"]').fill("2045-01-01T02:00");
  await page.locator("form button").click(); await expect(page).toHaveURL(/\/admin\/challenges\/[0-9a-f-]{36}$/, { timeout: 15_000 });
  await page.getByRole("button", { name: /Generate/i }).click(); await expect(page.getByText(/Frozen form: 100/)).toBeVisible();
  await page.getByRole("button", { name: "Publish" }).click(); await expect(page.getByRole("button", { name: "Cancel" })).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();
});

test("learner sees ranked challenge and LIVE result hides detailed review", async ({ page }) => {
  await signIn(page, "alice@task16c.invalid");
  await page.goto("/ranking");
  await expect(page.getByText(/Xếp hạng|Ranking/i).first()).toBeVisible();
  const url = new URL(process.env.TASK16_TEST_DATABASE_URL ?? "");
  expect(url.hostname).toBe("127.0.0.1");
  expect(url.port).toBe("15433");
  const pool = new pg.Pool({ connectionString: url.href });
  const result = await pool.query(`select r.id from ranked_challenge_runs r join users u on u.id=r.user_id where u.email_normalized='alice@task16c.invalid' and r.status='COMPLETED' order by r.completed_at desc limit 1`);
  await pool.end();
  await page.goto(`/ranking/challenges/run/${result.rows[0].id}/result`);
  await expect(page.getByText(/Chi tiết đáp án sẽ mở|answer details/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Xem lại chi tiết/i })).toHaveCount(0);
});

test("owner sees detailed review after Challenge closes", async ({ page }) => {
  const url = new URL(process.env.TASK16_TEST_DATABASE_URL ?? "");
  expect(url.hostname).toBe("127.0.0.1"); expect(url.port).toBe("15433");
  const pool = new pg.Pool({ connectionString: url.href });
  const row = (await pool.query(`select r.id,c.id challenge_id from ranked_challenge_runs r join ranked_challenges c on c.id=r.challenge_id join users u on u.id=r.user_id where u.email_normalized='alice@task16c.invalid' and r.status='COMPLETED' order by r.completed_at desc limit 1`)).rows[0];
  await pool.query(`update ranked_challenges set starts_at=now()-interval '4 hours',ends_at=now()-interval '1 second' where id=$1`, [row.challenge_id]);
  await pool.end();
  await signIn(page, "alice@task16c.invalid");
  await page.goto(`/ranking/challenges/run/${row.id}/result`);
  await expect(page.getByRole("heading", { name: /Xem lại chi tiết/i })).toBeVisible();
});

for (const type of ["LISTENING_100", "FULL_200"] as const) test(`${type} starts in Listening and resumes the same run`, async ({ page }) => {
  const url = new URL(process.env.TASK16_TEST_DATABASE_URL ?? ""); expect(url.hostname).toBe("127.0.0.1"); expect(url.port).toBe("15433");
  const pool = new pg.Pool({ connectionString: url.href });
  const row = (await pool.query(`select r.id,u.email_normalized email from ranked_challenge_runs r join ranked_challenges c on c.id=r.challenge_id join users u on u.id=r.user_id where c.type=$1 and r.status='IN_PROGRESS' and r.section='LISTENING' order by r.started_at desc limit 1`, [type])).rows[0]; await pool.end();
  expect(row).toBeTruthy(); await signIn(page, row.email); await page.goto(`/ranking/challenges/run/${row.id}`); await expect(page.getByRole("heading", { name: "LISTENING" })).toBeVisible();
  const before = page.url(); await page.reload(); await expect(page).toHaveURL(before); await expect(page.getByRole("heading", { name: "LISTENING" })).toBeVisible();
});
