// Read-only release check for the public sitemap and representative app routes.
// Usage: node scripts/seo-smoke.mjs [https://toeicgym.net]
const origin = new URL(process.argv[2] ?? "https://toeicgym.net").origin;
const privatePaths = ["/demo-test", "/practice", "/continue-learning", "/billing", "/admin", "/api/health", "/auth/callback"];
const breadcrumbPaths = new Set(["/toeic", "/luyen-thi-toeic-online", "/toeic/listening", "/toeic/part-1", "/toeic/part-2", "/toeic/part-3", "/toeic/part-4", "/thi-thu-toeic-online", "/toeic/part-5", "/toeic/part-5/word-form", "/toeic/part-5/thi-dong-tu", "/toeic/part-5/practice", "/toeic/part-6", "/toeic/part-6/dien-cau-vao-doan-van", "/toeic/part-7", "/toeic/part-7/doc-hieu-mot-doan-van", "/toeic/part-7/doc-hieu-hai-doan-van", "/toeic/part-7/doc-hieu-ba-van-ban", "/toeic/flashcards-tu-vung-cong-so", "/toeic/tu-vung", "/ve-toeic-gym"]);
const failures = [];
breadcrumbPaths.add("/toeic/checklist-hoc-tuan");
const warnings = [];
const practiceQuestionCounts = new Map([
  ["/blog/menh-de-quan-he-toeic", 6],
  ["/blog/cau-bi-dong-toeic-part-5", 6],
  ["/blog/ving-va-to-infinitive-toeic", 6],
  ["/toeic/part-5/practice", 7],
  ["/toeic/part-7/doc-hieu-mot-doan-van", 4],
]);

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

  const favicon = await fetch(new URL("/favicon.ico", origin), {
    headers: { "user-agent": "Googlebot-Image" },
    signal: AbortSignal.timeout(20000),
  });
  if (!favicon.ok) failures.push(`favicon.ico: HTTP ${favicon.status}`);
  if (!/^image\/(?:x-icon|vnd\.microsoft\.icon)/i.test(favicon.headers.get("content-type") ?? "")) {
    failures.push("favicon.ico: missing ICO content type");
  }

  const sitemap = await request("/sitemap.xml");
  if (!sitemap.response.ok) throw new Error(`sitemap.xml: HTTP ${sitemap.response.status}`);
  const urls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => decodeXml(match[1]));
  if (urls.length === 0) failures.push("sitemap.xml: no URLs found");
  if (new Set(urls).size !== urls.length) failures.push("sitemap.xml: duplicate URLs found");
  const excludedPrefixes = [
    "/admin", "/auth", "/dashboard", "/practice", "/demo-test", "/full-mock",
    "/billing", "/api", "/continue-learning", "/onboarding", "/progress",
    "/settings", "/mistakes", "/ranking", "/learners",
  ];
  for (const url of urls) {
    try {
      const parsed = new URL(url);
      if (parsed.origin !== origin || parsed.search || parsed.hash || (parsed.pathname !== "/" && parsed.pathname.endsWith("/"))) {
        failures.push(`${url}: sitemap entry is not a clean canonical URL`);
      }
      if (excludedPrefixes.some((prefix) => parsed.pathname === prefix || parsed.pathname.startsWith(`${prefix}/`))
        || /^\/(?:diagnostic|challenge\/part-5)\/.+/.test(parsed.pathname)) {
        failures.push(`${url}: private or session URL in sitemap`);
      }
    } catch {
      failures.push(`${url}: invalid sitemap URL`);
    }
  }

  // Check every sitemap entry for syntax and duplicates, then fetch representative
  // pages slowly enough to avoid tripping the production edge rate limit.
  const samplePaths = [
    "/", "/toeic", "/toeic/listening", "/toeic/part-1", "/toeic/part-2", "/toeic/part-3", "/toeic/part-4", "/thi-thu-toeic-online", "/toeic/part-5", "/toeic/part-5/practice",
    "/toeic/part-5/word-form", "/toeic/part-5/thi-dong-tu",
    "/toeic/part-6", "/toeic/part-6/dien-cau-vao-doan-van", "/toeic/part-7", "/toeic/part-7/doc-hieu-mot-doan-van", "/toeic/part-7/doc-hieu-hai-doan-van", "/toeic/part-7/doc-hieu-ba-van-ban", "/toeic/flashcards-tu-vung-cong-so", "/toeic/tu-vung", "/ve-toeic-gym", "/blog", "/blog/ngu-phap",
    "/blog/cach-review-loi-sai-toeic", "/blog/chien-luoc-tang-diem-toeic-450-den-700",
    "/blog/menh-de-quan-he-toeic",
    "/blog/cau-bi-dong-toeic-part-5", "/blog/ving-va-to-infinitive-toeic", "/blog/quan-ly-thoi-gian-toeic-reading-75-phut",
    "/challenge/part-5",
  ];
  for (const path of samplePaths) {
    if (!urls.includes(path === "/" ? origin : `${origin}${path}`)) failures.push(`${path}: missing from sitemap`);
  }
  const sampleUrls = urls.filter((url) => samplePaths.includes(new URL(url).pathname));
  for (const url of sampleUrls) {
      try {
        if (!url.startsWith(`${origin}/`) && url !== origin) {
          failures.push(`${url}: sitemap URL is outside ${origin}`);
          continue;
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
        if (new URL(url).pathname === "/" && !/<link\s+rel="icon"\s+href="\/favicon\.ico(?:\?[^\"]*)?"/i.test(head)) {
          failures.push(`${url}: missing favicon link`);
        }
        if (canonical !== url) failures.push(`${url}: canonical is ${canonical || "missing"}`);
        if (/noindex/i.test(robots) || /noindex/i.test(page.headers.get("x-robots-tag") ?? "")) failures.push(`${url}: sitemap page is noindex`);
        if ((title.match(/TOEIC\s*GYM/gi) ?? []).length > 1) failures.push(`${url}: repeated brand in title`);
        const pathname = new URL(url).pathname;
        const schemas = structuredData(html);
        if (practiceQuestionCounts.has(pathname)) {
          const expectedQuestions = practiceQuestionCounts.get(pathname);
          if ((html.match(/<fieldset\b/g) ?? []).length !== expectedQuestions) failures.push(`${url}: expected ${expectedQuestions} server-rendered practice questions`);
          if ((html.match(/<details\b/g) ?? []).length < expectedQuestions) failures.push(`${url}: missing server-rendered answer disclosures`);
          if (!html.includes("Đáp án") || (pathname === "/blog/menh-de-quan-he-toeic" && !html.includes("Which"))) failures.push(`${url}: missing practice explanations in HTML`);
        }
        if (pathname === "/blog/quan-ly-thoi-gian-toeic-reading-75-phut" && (!html.includes('id="chia-thoi-gian"') || !html.includes("Part 7 còn 50 phút"))) failures.push(`${url}: missing server-rendered Reading time planner`);
        if (["/toeic/part-1", "/toeic/part-2", "/toeic/part-4"].includes(pathname)) {
          const count = pathname === "/toeic/part-2" ? 4 : pathname === "/toeic/part-4" ? 3 : 1;
          if ((html.match(/<fieldset\b/g) ?? []).length !== count) failures.push(`${url}: expected ${count} server-rendered Listening questions`);
          if ((html.match(/<details\b/g) ?? []).length < count + (pathname === "/toeic/part-2" ? 4 : 1)) failures.push(`${url}: missing Listening explanations or transcripts in HTML`);
          if (!html.includes("Đáp án:")) failures.push(`${url}: missing Listening answers before interaction`);
        }
        if (pathname === "/" && !schemas.some((schema) => schema["@type"] === "WebSite" && schema.name === "TOEIC GYM" && schema.url === canonical)) failures.push(`${url}: missing WebSite site-name data`);
        if (pathname === "/" && !schemas.some((schema) => schema["@type"] === "Organization" && schema["@id"] === `${origin}#organization`)) failures.push(`${url}: missing Organization identity data`);
        if (pathname === "/toeic/flashcards-tu-vung-cong-so" && !schemas.some((schema) => schema["@type"] === "Quiz" && schema.hasPart?.length === 8)) failures.push(`${url}: missing eight-card Quiz data`);
        if (pathname === "/toeic/tu-vung" && !schemas.some((schema) => schema["@type"] === "CollectionPage" && schema.mainEntity?.["@type"] === "ItemList" && schema.mainEntity.numberOfItems === 100)) failures.push(`${url}: missing 100-term vocabulary collection data`);
        if (breadcrumbPaths.has(pathname) && !schemas.some((schema) => schema["@type"] === "BreadcrumbList" && schema.itemListElement?.at(-1)?.item === url)) failures.push(`${url}: missing matching BreadcrumbList data`);
        if (pathname === "/blog/ngu-phap") {
          if (!schemas.some((schema) => schema["@type"] === "CollectionPage" && schema.url === url && schema.mainEntity?.["@type"] === "ItemList")) failures.push(`${url}: missing grammar CollectionPage and ItemList data`);
        } else if (pathname.startsWith("/blog/") && !schemas.some((schema) => schema["@type"] === "BlogPosting" && schema.url === url)) failures.push(`${url}: missing matching BlogPosting data`);
      } catch (error) {
        failures.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
      }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  for (const path of privatePaths) {
    try {
      const { response: page } = await request(path, { redirect: "manual" });
      if (!/noindex/i.test(page.headers.get("x-robots-tag") ?? "")) failures.push(`${path}: missing X-Robots-Tag noindex`);
    } catch (error) {
      failures.push(`${path}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  for (const [path, contentType] of [
    ["/seo/toeic-part-1-office-folders.webp", "image/webp"],
    ["/seo/toeic-part-1-sample.mp3", "audio/mpeg"],
    ["/seo/toeic-part-2-sample.mp3", "audio/mpeg"],
    ["/seo/toeic-part-2-undecided.mp3", "audio/mpeg"],
    ["/seo/toeic-part-2-ask-colleague.mp3", "audio/mpeg"],
    ["/seo/toeic-part-2-unavailable.mp3", "audio/mpeg"],
    ["/seo/toeic-part-4-sample.mp3", "audio/mpeg"],
    ["/seo/toeic-100-tu-vung.pdf", "application/pdf"],
  ]) {
    try {
      const asset = await fetch(new URL(path, origin), { method: "HEAD", signal: AbortSignal.timeout(20000) });
      if (!asset.ok) failures.push(`${path}: HTTP ${asset.status}`);
      if (!(asset.headers.get("content-type") ?? "").startsWith(contentType)) failures.push(`${path}: unexpected content type`);
      if (path === "/seo/toeic-100-tu-vung.pdf" && asset.headers.get("link") !== `<${origin}/toeic/tu-vung>; rel="canonical"`) failures.push(`${path}: missing canonical HTTP header to vocabulary collection`);
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

  console.log(`SEO smoke: ${urls.length} sitemap URLs validated, ${sampleUrls.length} representative pages and ${privatePaths.length} app routes fetched at ${origin}`);
} catch (error) {
  failures.push(error instanceof Error ? error.message : String(error));
}

for (const warning of warnings) console.warn(`WARN ${warning}`);
for (const failure of failures) console.error(`FAIL ${failure}`);
console.log(failures.length ? `SEO smoke: ${failures.length} issue(s)` : `SEO smoke: PASS${warnings.length ? ` (${warnings.length} transient warning(s))` : ""}`);
if (failures.length) process.exitCode = 1;
