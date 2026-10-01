# TOEIC GYM: useful resources and existing-content expansion

Release date: 2026-10-01. Code batch follows Reading release `9953200`. Search Console is outside this workflow.

## Search observations and implementation

Search samples for because/because of and although/despite show explanatory lessons with exercises, including The MVP TOEIC's free practice and Vietop's exercise collection. This supports improving an existing lesson with original practice; it does not establish keyword volume, difficulty or TOEIC GYM's rank. Google's current AI Search guidance still emphasizes useful original content, clear technical access and good page experience. There is no special Google markup or AI file required for this batch.

| Query family / learner task | Primary URL | Change |
| --- | --- | --- |
| `liên từ và giới từ TOEIC`, `because because of bài tập`, `although despite however` | `/blog/lien-tu-va-tu-noi-toeic` | Expanded the existing lesson with a structure/meaning/punctuation procedure, paired original examples, common errors and a Part 6 transfer example. Six interactive original questions now have feedback for every option. |
| `lộ trình TOEIC 450 đến 700` | `/blog/chien-luoc-tang-diem-toeic-450-den-700` | Added prerequisites, a four-week review cycle, adjustments for limited time or persistent errors, and a link to the worksheet. The cycle organizes learning; it does not promise a target score in four weeks. |
| `checklist học TOEIC`, `kế hoạch học TOEIC một tuần PDF` | `/toeic/checklist-hoc-tuan` | A public worksheet with two skill goals, five study sessions, editable results and next-week notes. Print a filled copy or download an original blank A4 PDF without signing up. |

The lesson and roadmap retain their existing canonical URLs. Close keyword variants are handled within those pages. The new worksheet serves a separate task: using a printable tool rather than reading a long study-plan article.

## Resource, links and crawl controls

- The resource has a self canonical, title/description, social metadata, one H1 and breadcrumb structured data. Main content and fields are rendered on the server; only the print button needs JavaScript. The PDF link and browser print command also work without JavaScript.
- Incoming links are added from the TOEIC parent and the existing 450-to-700 roadmap. The resource links to Part 5 practice, Listening, the roadmap and the error-review guide. The conjunction lesson already receives a Part 5 parent link and now points to Part 6 practice as well.
- `/toeic/checklist-hoc-tuan` is registered in `STATIC_PUBLIC_PATHS`, so it is included in the sitemap and accepted by editorial internal-link validation. It is also included in breadcrumb smoke checks.
- `/seo/toeic-checklist-hoc-tuan.pdf` is downloadable but excluded from the sitemap and gets `X-Robots-Tag: noindex`. The HTML page is the intended search landing page; the PDF is its printable companion.
- The worksheet contains TOEIC GYM's source URL and permission to print/share the complete resource with attribution. This makes it ready for educators and English clubs to use. No external outreach, backlink placement or publication was performed.
- Only the materially edited conjunction lesson, roadmap and TOEIC parent receive a new modification date. No site-wide freshness change or fabricated reviewer credential was added. CMS overrides can supersede bundled editorial defaults after deployment.
- Browser fields are not persisted or sent to the server. The page explains saving a filled copy through print-to-PDF. No new analytics event, conversion count or measured ranking is claimed.

## Verification

- Built the batch over `9953200` in a separate temporary checkout, keeping unrelated workspace changes outside the validation. `npm run build` passed, including TypeScript and the new public route. The checkout uses a dependency junction and a temporary Turbopack root at their common parent; that root change is not part of the shipped config.
- Existing SEO content, structured-data, site-URL, editorial and publication-quality suites passed **73 tests**. They check original-question IDs/options/explanations, canonical ownership, publication rules and rendered editorial internal links. Targeted ESLint passed.
- The compiled anonymous resource returns HTTP 200 with one H1, the expected canonical/description and breadcrumbs. Playwright exercised both interface-language cookies at 375, 768, 1024 and 1440px without horizontal overflow or page JavaScript errors. The editorial content is explicitly Vietnamese; shared navigation, print and download actions follow the interface language.
- Keyboard Enter invokes print; Space toggles the completion checkbox. The print action has a visible 3px focus outline. A filled checklist prints as **one A4 page** in both interface selections, with website navigation hidden. The downloadable blank PDF returns HTTP 200 with PDF content type and the intended noindex header.
- Screenshots were reviewed across the four sizes and both language selections. Mobile placeholders were shortened, with the result-recording instructions visible outside the fields. Representative artifacts: [mobile](../artifacts/seo-authority-2026-10-01/checklist-mobile.png), [desktop EN](../artifacts/seo-authority-2026-10-01/checklist-desktop-en.png).
- The PDF is generated from the compiled resource page using `node scripts/render-toeic-checklist.mjs http://127.0.0.1:3000` against a local server. The generator uses a fresh anonymous Vietnamese browser context and waits for fonts before export.

These checks use dummy server settings without a live database. They verify the worksheet flow and bundled editorial content, not live CMS overrides, the production sitemap or authenticated learning flows. This task does not deploy the batch.

## Next steps after deployment

1. Run `node scripts/seo-smoke.mjs https://toeicgym.net`; verify both updated blogs, the parent-to-resource link, the downloadable PDF and its noindex header. Check for CMS overrides before assuming bundled content is live.
2. Make the worksheet available in the website's existing learning/community channels. Any direct messages to educators or clubs require a separate authorized distribution task. Seek practical feedback and voluntary citations; a worksheet alone does not create backlinks.
3. Keep the next editorial batch focused on office vocabulary with original context and recall exercises. Add invoice or meeting child pages only when each has a different learner task and enough original material.
4. Record release date, monthly observed Vietnam search results under consistent conditions, and available first-party landing/practice data. Dedicated worksheet view/print/download analytics remain a future instrumentation task. Do not report them as current tracked conversions.

## Sources

- [Google: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [The MVP TOEIC: because / because of lesson](https://www.themvptoeic.com/blog/because-because-of)
- [Vietop: because / although exercise collection](https://vietop.edu.vn/blog/bai-tap-because-va-because-of-though-va-although/)

Competitor material informed the intent observation only. The new examples, questions and worksheet are original to this implementation; no competitor worksheet or ETS exercise was copied.
