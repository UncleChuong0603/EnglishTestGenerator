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

The 2026-09-25 live run passed for 36 sitemap URLs and 5 application routes. A `google-site-verification` TXT record is published for `toeicgym.net`; this confirms the DNS record exists, not that the current Google account has Search Console access or that the sitemap was submitted. The next measurement is Search Console's Page indexing and Performance reports, including Google-selected canonical, impressions, clicks, and queries for the public URLs.

The public TOEIC guides and article bodies remain Vietnamese. An English interface cookie can make the root `<html lang>` English, while those articles are marked `lang="vi"`. If English organic traffic becomes a goal, create fully translated pages on dedicated English URLs and link the language versions with `hreflang`; do not advertise the current Vietnamese pages as English alternatives.
