import { expect, test, type Browser, type BrowserContext, type Page } from "@playwright/test";
import { createHmac, randomBytes } from "node:crypto";
import pg from "pg";

const databaseUrl = new URL(process.env.DATABASE_URL ?? "");
if (
  databaseUrl.hostname !== "127.0.0.1" ||
  databaseUrl.port !== "15433" ||
  databaseUrl.pathname !== "/toeicgym_task17" ||
  databaseUrl.username !== "toeicgym_test"
) {
  throw new Error("Navigation QA refuses a database other than the isolated task17 database.");
}

const pool = new pg.Pool({ connectionString: databaseUrl.href });

async function authenticatedPage(browser: Browser, email: string, width: number) {
  const user = (await pool.query("select id from users where email_normalized=$1", [email])).rows[0];
  if (!user) throw new Error(`Missing QA user: ${email}`);
  const token = randomBytes(32).toString("base64url");
  const hash = createHmac("sha256", process.env.SESSION_SECRET ?? "").update(token).digest("hex");
  await pool.query("insert into user_sessions(user_id,session_token_hash,expires_at) values($1,$2,now()+interval '2 hours')", [user.id, hash]);
  const context = await browser.newContext({ viewport: { width, height: 900 } });
  await context.addCookies([{ name: "etg_session", value: token, domain: "127.0.0.1", path: "/", httpOnly: true, sameSite: "Lax" }]);
  return { context, page: await context.newPage(), userId: user.id as string };
}

async function expectNoOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1)).toBe(true);
}

async function close(contexts: BrowserContext[]) {
  await Promise.all(contexts.map((context) => context.close()));
}

test("learner and admin navigation adapt at product breakpoints in both languages", async ({ browser }) => {
  test.setTimeout(180_000);
  const contexts: BrowserContext[] = [];
  const identities = (await pool.query(
    "select u.id,u.email_normalized,p.interface_language from users u join profiles p on p.id=u.id where u.email_normalized in ('free.learner@ui.invalid','premium.learner@ui.invalid')",
  )).rows;
  const adminIdentity = (await pool.query(
    "select u.id,u.email_normalized,p.interface_language from users u join profiles p on p.id=u.id join user_roles r on r.user_id=u.id where r.role='ADMIN' and r.revoked_at is null and u.email_normalized='admin@task18b.invalid' limit 1",
  )).rows[0];
  if (adminIdentity) identities.push(adminIdentity);
  const originalLanguages = new Map<string, string>(identities.map((row) => [row.id, row.interface_language]));

  try {
    const premium = identities.find((row) => row.email_normalized === "premium.learner@ui.invalid");
    const admin = identities.find((row) => row.email_normalized === adminIdentity?.email_normalized);
    if (!premium || !admin) throw new Error("Required learner/admin QA fixtures are missing.");
    await pool.query("update profiles set interface_language='en' where id in ($1,$2)", [premium.id, admin.id]);

    for (const [email, width, expectedLabel] of [
      ["free.learner@ui.invalid", 1440, "Học tập"],
      ["premium.learner@ui.invalid", 1024, "Learning"],
    ] as const) {
      const fixture = await authenticatedPage(browser, email, width);
      contexts.push(fixture.context);
      await fixture.page.goto("/dashboard", { waitUntil: "networkidle" });
      const sidebar = fixture.page.locator(".learner-navigation");
      await expect(sidebar).toBeVisible();
      await expect(fixture.page.locator(".learner-sidebar-groups")).toBeVisible();
      await expect(fixture.page.locator(".learner-sidebar-group").first()).toContainText(expectedLabel);
      await expect(fixture.page.locator(".learner-bottom-navigation")).toBeHidden();
      await expect(sidebar).toHaveCSS("position", "fixed");
      await expect(fixture.page.locator('.learner-sidebar-group a[aria-current="page"]')).toHaveAttribute("href", "/dashboard");
      expect((await sidebar.boundingBox())?.width).toBeGreaterThan(240);
      expect(Number.parseFloat(await fixture.page.locator("main").evaluate((element) => getComputedStyle(element).paddingLeft))).toBeGreaterThan(240);
      await expectNoOverflow(fixture.page);
      const accountMenu = fixture.page.locator('.learner-sidebar-account details');
      await accountMenu.locator('summary').focus();
      await fixture.page.keyboard.press('Enter');
      await expect(accountMenu).toHaveAttribute('open', '');
      await expect(accountMenu.locator('a[href="/settings"]')).toBeInViewport();
      await fixture.page.keyboard.press('Escape');
      await expect(accountMenu.locator('summary')).toBeFocused();
      await fixture.page.screenshot({ path: test.info().outputPath(`learner-${width}.png`), fullPage: true });
    }

    for (const width of [375, 768]) {
      const fixture = await authenticatedPage(browser, "free.learner@ui.invalid", width);
      contexts.push(fixture.context);
      await fixture.page.goto("/dashboard", { waitUntil: "networkidle" });
      await expect(fixture.page.locator(".learner-sidebar-groups")).toBeHidden();
      await expect(fixture.page.locator(".learner-bottom-navigation")).toBeVisible();
      await expect(fixture.page.locator(".learner-navigation")).toHaveCSS("position", "relative");
      await expect(fixture.page.locator(".learner-bottom-navigation > a, .learner-bottom-navigation > details")).toHaveCount(4);
      await expectNoOverflow(fixture.page);
      const bottomNav = fixture.page.locator('.learner-bottom-navigation');
      expect((await bottomNav.boundingBox())!.y).toBeGreaterThan(800);
      await fixture.page.evaluate(() => window.scrollTo(0, 500));
      expect((await bottomNav.boundingBox())!.y).toBeGreaterThan(800);
      await bottomNav.locator('summary').focus();
      await fixture.page.keyboard.press('Enter');
      await expect(bottomNav.locator('details')).toHaveAttribute('open', '');
      await expect(bottomNav.locator('a[href="/listening-lessons"]')).toBeInViewport();
      await fixture.page.keyboard.press('Escape');
      await expect(bottomNav.locator('summary')).toBeFocused();
      await fixture.page.evaluate(() => window.scrollTo(0, 0));
      await fixture.page.screenshot({ path: test.info().outputPath(`learner-${width}.png`), fullPage: true });
    }

    for (const width of [1024, 1440]) {
      const fixture = await authenticatedPage(browser, admin.email_normalized, width);
      contexts.push(fixture.context);
      await fixture.page.goto("/admin", { waitUntil: "networkidle" });
      await expect(fixture.page.locator(".admin-navigation")).toBeVisible();
      await expect(fixture.page.locator(".admin-mobile-bar")).toBeHidden();
      await expect(fixture.page.locator(".admin-navigation")).toHaveCSS("position", "fixed");
      await expect(fixture.page.locator('.admin-navigation a[aria-current="page"]')).toHaveAttribute("href", "/admin");
      await expect(fixture.page.locator(".admin-navigation-groups")).toContainText("Overview");
      await expectNoOverflow(fixture.page);
      await fixture.page.screenshot({ path: test.info().outputPath(`admin-${width}.png`), fullPage: true });
    }

    for (const width of [375, 768]) {
      const fixture = await authenticatedPage(browser, admin.email_normalized, width);
      contexts.push(fixture.context);
      await fixture.page.goto("/admin", { waitUntil: "networkidle" });
      await expect(fixture.page.locator(".admin-mobile-bar")).toBeVisible();
      await expect(fixture.page.locator(".admin-navigation")).toBeHidden();
      await fixture.page.locator(".admin-mobile-bar button").click();
      await expect(fixture.page.locator(".admin-navigation")).toBeVisible();
      await expect(fixture.page.locator(".admin-mobile-bar button")).toHaveAttribute("aria-expanded", "true");
      await expect(fixture.page.locator('.admin-navigation')).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
      await fixture.page.keyboard.press("Tab");
      await expectNoOverflow(fixture.page);
      await fixture.page.screenshot({ path: test.info().outputPath(`admin-${width}.png`), fullPage: true });
    }
  } finally {
    await close(contexts);
    await Promise.all([...originalLanguages].map(([id, language]) => pool.query("update profiles set interface_language=$1 where id=$2", [language, id])));
  }
});

test.afterAll(async () => { await pool.end(); });
