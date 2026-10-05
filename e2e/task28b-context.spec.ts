import { expect, test, type Browser } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import pg from "pg";

const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
if (
  databaseUrl.hostname !== "task28b-pg-20260922" ||
  databaseUrl.pathname !== "/task28b"
) {
  throw new Error(
    "Task 28B UI checks refuse a database other than the isolated task28b database.",
  );
}
const pool = new pg.Pool({ connectionString: databaseUrl.href });

async function signedIn(browser: Browser, name: string, width: number) {
  const context = await browser.newContext({
    viewport: { width, height: width < 500 ? 844 : 1000 },
  });
  const user = (
    await pool.query("select id from users where email_normalized=$1", [
      `task28b-${name}@qa.invalid`,
    ])
  ).rows[0];
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "")
    .update(token)
    .digest("hex");
  await pool.query(
    "insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '2 hours')",
    [user.id, hash],
  );
  await context.addCookies([
    {
      name: "etg_session",
      value: token,
      domain: "app",
      path: "/",
      httpOnly: true,
      sameSite: "Lax",
    },
  ]);
  return { context, userId: user.id as string };
}

const noOverflow = async (page: import("@playwright/test").Page) =>
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);

test("learner context is absent from learner UI in both languages and all review widths", async ({
  browser,
}) => {
  test.setTimeout(240_000);
  for (const [name, locale] of [
    ["eligible", "vi"],
    ["premium", "en"],
  ] as const) {
    await pool.query(
      "update profiles set interface_language=$1 where id=(select id from users where email_normalized=$2)",
      [locale, `task28b-${name}@qa.invalid`],
    );
    for (const width of [375, 768, 1024, 1440]) {
      const { context } = await signedIn(browser, name, width);
      const page = await context.newPage();
      await page.goto("/dashboard", { waitUntil: "networkidle" });
      await expect(
        page.locator('[name="studyPurpose"], [name="acquisitionSource"]'),
      ).toHaveCount(0);
      await expect(
        page.getByText(
          locale === "vi" ? "Bối cảnh người học" : "Learner context",
          { exact: true },
        ),
      ).toHaveCount(0);
      await noOverflow(page);

      await page.goto("/settings?section=context", {
        waitUntil: "networkidle",
      });
      await expect(
        page.locator('a[href="/settings?section=context"]'),
      ).toHaveCount(0);
      await expect(
        page.locator('[name="studyPurpose"], [name="acquisitionSource"]'),
      ).toHaveCount(0);
      await expect(
        page.getByRole("heading", {
          name: locale === "vi" ? "Hồ sơ" : "Profile",
        }),
      ).toBeVisible();
      await noOverflow(page);
      await context.close();
    }
  }
});

test("learner context is absent from admin detail and analytics in both languages", async ({
  browser,
}) => {
  test.setTimeout(240_000);
  const target = (
    await pool.query(
      "select id from users where email_normalized='task28b-other@qa.invalid'",
    )
  ).rows[0];
  for (const locale of ["vi", "en"] as const) {
    await pool.query(
      "update profiles set interface_language=$1 where id=(select id from users where email_normalized='task28b-admin@qa.invalid')",
      [locale],
    );
    for (const width of [375, 768, 1024, 1440]) {
      const { context } = await signedIn(browser, "admin", width);
      const page = await context.newPage();
      await page.goto(`/admin/users/${target.id}?tab=learning`, {
        waitUntil: "networkidle",
      });
      await expect(
        page.getByRole("heading", {
          name: locale === "vi" ? "Tổng quan học tập" : "Learning overview",
        }),
      ).toBeVisible();
      await expect(
        page.getByText(
          locale === "vi" ? "Thông tin người học" : "Learner context",
          { exact: true },
        ),
      ).toHaveCount(0);
      await noOverflow(page);

      await page.goto("/admin/analytics", { waitUntil: "networkidle" });
      await expect(
        page.getByText(
          locale === "vi" ? "Bối cảnh người học" : "Learner context",
          { exact: true },
        ),
      ).toHaveCount(0);
      await noOverflow(page);
      await context.close();
    }
  }
});

test("admin must record a reason and can see it after suspending an account", async ({
  browser,
}) => {
  test.setTimeout(120_000);
  const target = (
    await pool.query(
      "select id from users where email_normalized='task28b-eligible@qa.invalid'",
    )
  ).rows[0];
  await pool.query("update users set status='active' where id=$1", [target.id]);
  await pool.query(
    "update profiles set interface_language='vi' where id=(select id from users where email_normalized='task28b-admin@qa.invalid')",
  );
  const { context } = await signedIn(browser, "admin", 375);
  const page = await context.newPage();
  await page.goto(`/admin/users/${target.id}?tab=security`, {
    waitUntil: "networkidle",
  });
  await page
    .getByLabel("Lý do tạm khóa")
    .fill("Vi phạm quy định tài khoản trong bài kiểm tra QA");
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Tạm khóa tài khoản" }).click();
  await expect(page).toHaveURL(
    new RegExp(`/admin/users/${target.id}\\?tab=security`),
  );
  await expect(
    page.getByText("Vi phạm quy định tài khoản trong bài kiểm tra QA").first(),
  ).toBeVisible();
  await expect(
    page.getByText("task28b-admin@qa.invalid").first(),
  ).toBeVisible();
  await noOverflow(page);
  const audit = await pool.query(
    "select metadata->>'reason' reason from admin_audit_logs where target_user_id=$1 and action='USER_SUSPENDED' order by created_at desc limit 1",
    [target.id],
  );
  expect(audit.rows[0]?.reason).toBe(
    "Vi phạm quy định tài khoản trong bài kiểm tra QA",
  );

  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Mở khóa tài khoản" }).click();
  await expect
    .poll(
      async () =>
        (await pool.query("select status from users where id=$1", [target.id]))
          .rows[0]?.status,
    )
    .toBe("active");
  await context.close();
});

test.afterAll(async () => pool.end());
