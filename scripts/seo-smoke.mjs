// Read-only release check for the public sitemap and representative app routes.
// Usage: node scripts/seo-smoke.mjs [https://toeicgym.net]
const origin = new URL(process.argv[2] ?? "https://toeicgym.net").origin;
const privatePaths = ["/demo-test", "/practice", "/continue-learning", "/billing", "/admin", "/api/health", "/auth/callback"];
const breadcrumbPaths = new Set(["/toeic", "/luyen-thi-toeic-online", "/toeic/part-5", "/toeic/part-5/word-form", "/toeic/part-6", "/toeic/part-7"]);
const failures = [];
const warnings = [];

function decodeXml(value) {
  return value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

function tagValue(head, pattern) {
  return decodeXml(head.match(pattern)?.[1] ?? "");
}

function structuredData(html) {
  const scripts = [...html.matchAll(/<script\b(?=[^>]*\btype="application\/ld\+json")[^>]*>([\s\S]*?)<\/script>/gi)];
  return scripts.flatMap((match) => {
    try {
      const value = JSON.parse(match[1]);
      return Array.isArray(value["@graph"]) ? value["@graph"] : [value];
    } catch {
      return [];
    }
  });
}

async function request(path, options = {}) {
  const response = await fetch(new URL(path, origin), {
    headers: { "user-agent": "Googlebot" },
    signal: AbortSignal.timeout(20000),
    ...options,
  });
  return { response, body: await response.text() };
}

try {
  const { response, body } = await request("/robots.txt");
  if (!response.ok) failures.push(`robots.txt: HTTP ${response.status}`);
  if (!body.includes(`Sitemap: ${origin}/sitemap.xml`)) failures.push("robots.txt: sitemap URL does not match the site origin");
  if (/^Disallow:\s*\/(?:admin|dashboard|practice|demo-test|billing)/m.test(body)) failures.push("robots.txt: app routes are blocked before crawlers can read noindex");

  const sitemap = await request("/sitemap.xml");
  if (!sitemap.response.ok) throw new Error(`sitemap.xml: HTTP ${sitemap.response.status}`);
  const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeXml(match[1]));
  if (urls.length === 0) failures.push("sitemap.xml: no URLs found");
  if (new Set(urls).size !== urls.length) failures.push("sitemap.xml: duplicate URLs found");

  // Keep the audit light enough to run against production after a deployment.
  for (let offset = 0; offset < urls.length; offset += 4) {
    await Promise.all(urls.slice(offset, offset + 4).map(async (url) => {
      try {
        if (!url.startsWith(`${origin}/`) && url !== origin) {
          failures.push(`${url}: sitemap URL is outside ${origin}`);
          return;
        }
        const first = await request(url);
        let page = first.response;
        let html = first.body;
        let head = first.body.split("</head>", 1)[0];
        let title = tagValue(head, /<title>([^<]*)<\/title>/i);
        let description = tagValue(head, /<meta\s+name="description"\s+content="([^"]*)"/i);
        let canonical = tagValue(head, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
        if (page.ok && (!title || !description || !canonical)) {
          const retry = await request(url);
          const retryHead = retry.body.split("</head>", 1)[0];
          if (tagValue(retryHead, /<title>([^<]*)<\/title>/i) && tagValue(retryHead, /<meta\s+name="description"\s+content="([^"]*)"/i) && tagValue(retryHead, /<link\s+rel="canonical"\s+href="([^"]*)"/i)) warnings.push(`${url}: first response omitted metadata; retry succeeded`);
          page = retry.response;
          html = retry.body;
          head = retryHead;
          title = tagValue(head, /<title>([^<]*)<\/title>/i);
          description = tagValue(head, /<meta\s+name="description"\s+content="([^"]*)"/i);
          canonical = tagValue(head, /<link\s+rel="canonical"\s+href="([^"]*)"/i);
        }
        const robots = tagValue(head, /<meta\s+name="robots"\s+content="([^"]*)"/i);
        const shareImage = tagValue(head, /<meta\s+property="og:image"\s+content="([^"]*)"/i);
        if (!page.ok) failures.push(`${url}: HTTP ${page.status}`);
        if (!title) failures.push(`${url}: missing title`);
        if (!description) failures.push(`${url}: missing description`);
        if (!shareImage) failures.push(`${url}: missing social image`);
        if (canonical !== url) failures.push(`${url}: canonical is ${canonical || "missing"}`);
        if (/noindex/i.test(robots) || /noindex/i.test(page.headers.get("x-robots-tag") ?? "")) failures.push(`${url}: sitemap page is noindex`);
        if ((title.match(/TOEIC\s*GYM/gi) ?? []).length > 1) failures.push(`${url}: repeated brand in title`);
        const pathname = new URL(url).pathname;
        const schemas = structuredData(html);
        if (pathname === "/" && !schemas.some((schema) => schema["@type"] === "WebSite" && schema.name === "TOEIC GYM" && schema.url === canonical)) failures.push(`${url}: missing WebSite site-name data`);
        if (breadcrumbPaths.has(pathname) && !schemas.some((schema) => schema["@type"] === "BreadcrumbList" && schema.itemListElement?.at(-1)?.item === url)) failures.push(`${url}: missing matching BreadcrumbList data`);
        if (pathname.startsWith("/blog/") && !schemas.some((schema) => schema["@type"] === "BlogPosting" && schema.url === url)) failures.push(`${url}: missing matching BlogPosting data`);
      } catch (error) {
        failures.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }));
  }

  for (const path of privatePaths) {
    try {
      const { response: page } = await request(path, { redirect: "manual" });
      if (!/noindex/i.test(page.headers.get("x-robots-tag") ?? "")) failures.push(`${path}: missing X-Robots-Tag noindex`);
    } catch (error) {
      failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  if (origin === "https://toeicgym.net") {
    for (const source of ["http://toeicgym.net/", "http://www.toeicgym.net/", "https://www.toeicgym.net/"]) {
      try {
        const { response } = await request(source, { redirect: "manual" });
        if (response.status !== 301 || response.headers.get("location") !== `${origin}/`) {
          failures.push(`${source}: expected one permanent redirect to ${origin}/`);
        }
      } catch (error) {
        failures.push(`${source}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  console.log(`SEO smoke: ${urls.length} sitemap URLs and ${privatePaths.length} app routes checked at ${origin}`);
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const failure of failures) console.error(`FAIL ${failure}`);
console.log(failures.length ? `SEO smoke: ${failures.length} issue(s)` : `SEO smoke: PASS${warnings.length ? ` (${warnings.length} transient warning(s))` : ""}`);
if (failures.length) process.exitCode = 1;
