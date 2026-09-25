# TOEIC GYM SEO launch check

## Live audit on 2026-09-23 (before deploying this change)

- `https://toeicgym.net/`, `/blog`, `/pricing`, `/try`, `/diagnostic`, `/support`, `/privacy`, and `/terms` returned HTTP 200 without a login redirect.
- `http://toeicgym.net/`, `http://www.toeicgym.net/`, and `https://www.toeicgym.net/` redirected to `https://toeicgym.net/`.
- The homepage and a published blog article had HTTPS canonical URLs on `toeicgym.net`; neither exposed a `noindex` meta tag.
- **Blocker:** live `robots.txt` advertised `Sitemap: http://localhost:3000/sitemap.xml`. The route now uses the production site URL helper; deploying this code is required to fix the live response.
- The live sitemap returned HTTP 200 and contained published editorial articles, but did not yet contain the new topic pages.

## Verify after deployment

1. Open `https://toeicgym.net/robots.txt` and confirm `Sitemap: https://toeicgym.net/sitemap.xml`.
2. Open `https://toeicgym.net/sitemap.xml` and confirm the new `/toeic`, `/luyen-thi-toeic-online`, `/toeic/part-5`, `/toeic/part-5/word-form`, `/toeic/part-6`, and `/toeic/part-7` URLs are present.
3. Open each new URL without signing in. Confirm HTTP 200, its own HTTPS canonical, a descriptive title, visible text in the HTML, and no `noindex` or `X-Robots-Tag: noindex`.
4. In Google Search Console, verify the **Domain property** for `toeicgym.net` using the DNS record it provides. Submit `https://toeicgym.net/sitemap.xml` under Sitemaps. Inspect the homepage and the six new topic URLs, then request indexing for the most important URLs if the live tests pass.
5. Review the Page indexing report over the following weeks. Sitemap submission and indexing requests do not guarantee indexing.

The Domain property and Search Console actions require access to the domain DNS and the site's Google account; they cannot be completed from this repository alone.

## SEO release check (2026-09-25)

Run `npm run seo:smoke` after every deploy. It checks the live robots file, every URL in the sitemap, and representative application routes. Public sitemap URLs must return 200 with a unique title, description, social image, self canonical, and no `noindex`. Application routes must return `X-Robots-Tag: noindex`.

The 2026-09-25 live run passed for 36 sitemap URLs and 5 application routes. The release check now also covers `/api/health` and `/auth/callback`, including redirect responses. The site owner confirmed that `https://toeicgym.net/sitemap.xml` was submitted to Search Console on 2026-09-24; the Sitemaps report shows it was read successfully on 2026-09-25 and 36 page URLs were discovered. The next measurement is how many of those 36 URLs Google actually indexed, the exclusion reasons, and Performance queries for the public URLs.

The public TOEIC guides and article bodies remain Vietnamese. An English interface cookie can make the root `<html lang>` English, while those articles are marked `lang="vi"`. If English organic traffic becomes a goal, create fully translated pages on dedicated English URLs and link the language versions with `hreflang`; do not advertise the current Vietnamese pages as English alternatives.

## Search Console review (2026-09-25)

- URL Inspection shows `https://toeicgym.net/` indexed, crawl and fetch successful, indexing allowed, and Google-selected canonical equal to the inspected URL.
- The three reported redirect examples are `http://www.toeicgym.net/`, `https://www.toeicgym.net/`, and `https://toeicgym.net/practice`. Both `www` variants currently return a one-hop 301 to the canonical HTTPS homepage. `/practice` currently returns `X-Robots-Tag: noindex, nofollow` and may be reported from a crawl before the noindex change or from an authentication redirect. It is an application URL, not a sitemap URL.
- Next.js emits the homepage canonical without a trailing slash. The homepage sitemap entry and `WebSite` URL use the same form, while Google displays the indexed homepage with `/`. Google selected the inspected homepage itself as canonical, so the screenshots do not show a canonical conflict. The successful Sitemaps report resolves the earlier uncertainty raised by “No referring sitemaps detected” in the homepage URL Inspection result.
- Performance shows 4 impressions and 1 click for the selected three-month window. That sample is too small to infer a stable ranking or click-through trend.
- The submitted sitemap was processed successfully on 2026-09-25 and lists 36 discovered pages. The browser's “This XML file does not appear to have any style information” message only describes how raw XML is displayed. Discovered pages are not the same as indexed pages.
- A live crawl on 2026-09-25 found that all 36 sitemap URLs returned HTTP 200 and each had at least one internal link from another sitemap page. This does not establish their indexing status.

Next, open the sitemap's **See page indexing** report (or filter **Page indexing** by this sitemap) and record **Indexed**, **Not indexed**, and the reasons for each group. Inspect one representative URL from each non-indexed reason, starting with a guide page and an article. Recheck after Google has had time to crawl; do not resubmit the successful sitemap solely because URL Inspection says “No referring sitemaps detected.”

## Page indexing follow-up (2026-09-26)

- The owner provided the **Indexed pages → Examples** list: `/blog` (last crawl 2026-09-20), `/` (2026-09-19), and `/pricing`, `/sign-in`, `/terms`, `/privacy` (2026-09-15). The screenshot shows six examples, not the report's summary counts or a sitemap filter. Do not infer that exactly six of the 36 sitemap URLs are indexed from this list alone.
- `/sign-in` is absent from the sitemap. Live production returns `X-Robots-Tag: noindex, nofollow` and an HTML `noindex` directive; `robots.txt` allows crawling so Google can see the directive. Its last crawl in the screenshot predates the 2026-09-25 sitemap read, and the indexed status can lag until a recrawl. The page does not need a `robots.txt` disallow, which would prevent Google from reading `noindex`.
- The three redirect examples are unchanged: two `www` homepage variants and `/practice`. They are not evidence of a sitemap processing error.
- The live `npm run seo:smoke` check on 2026-09-26 passed all 36 sitemap URLs and 7 application routes.

Next evidence to collect: the Page indexing summary cards (**Indexed** and **Not indexed**) with the view filtered to `https://toeicgym.net/sitemap.xml`, plus the **Not indexed → Why pages aren't indexed** reasons. Use URL Inspection for `/toeic` and one recent `/blog/[slug]` article to distinguish “discovered,” “crawled,” and “indexed.” Inspect `/sign-in` separately after Google recrawls it; if its live test sees `noindex`, allow the report to update.
