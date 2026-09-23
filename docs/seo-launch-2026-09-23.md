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
