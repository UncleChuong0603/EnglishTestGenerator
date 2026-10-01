# TOEIC GYM: entity and content-transparency page — 2026-10-01

## What changed

This batch adds `/ve-toeic-gym`, a public bilingual page explaining what TOEIC GYM is, how public sample content is authored, what each result means and how learners can report an issue. The page links to the free practice path, Part hub, weekly checklist and blog. It is linked from the shared footer, registered in `STATIC_PUBLIC_PATHS` and included in the sitemap.

The homepage WebSite JSON-LD now connects to the same `Organization` entity. The new AboutPage also references that entity. The organization markup contains only the brand name, official URL, logo and the existing Facebook page/group URLs. No address, rating, award, teacher credential or affiliation was invented.

## Why this supports SEO

Google's current documentation recommends crawlable links, a sitemap, clear site identity and structured data that represents visible page content. It also warns that structured data enables eligibility but does not guarantee a rich result or ranking. The new page gives learners and crawlers one stable place to understand the product and its content boundaries while keeping the existing article and practice URLs as the primary topic pages.

This is a supporting entity/trust page, not a keyword doorway. It does not duplicate the Part guides or create a page for every long-tail variation. The Vietnamese and English interface selections receive matching copy and metadata; the page has one H1, self canonical, breadcrumb JSON-LD and an AboutPage/Organization graph.

## Verification

- Build and TypeScript will be run in a temporary worktree based on the current branch, excluding unrelated workspace changes.
- The SEO suites will check the existing editorial library and the new organization schema unit test. Targeted lint will cover the new page, homepage schema, footer, route list and smoke script.
- Browser checks will cover anonymous Vietnamese and English interfaces at 375, 768, 1024 and 1440px, one H1, canonical, AboutPage/Organization JSON-LD, footer link, no horizontal overflow, keyboard focus and no page errors.

The change is local until deployment. After deployment, run `node scripts/seo-smoke.mjs https://toeicgym.net` and confirm the route in the live sitemap. Search Console remains intentionally outside this workflow.

## Sources

- [Google: add business details with Organization structured data](https://developers.google.com/search/docs/appearance/establish-business-details)
- [Google: site names and WebSite structured data](https://developers.google.com/search/docs/appearance/site-names)
- [Google: general structured-data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google: crawlable links and site structure](https://developers.google.com/search/docs/fundamentals/get-started-developers)
