# TOEIC GYM Reading SEO release — October 1, 2026

## Search intent and scope

Search samples for Vietnamese queries about TOEIC Part 7 triple passages show guidance, exercise explanations and multi-document reading strategies. This supports a focused public practice page; the sample does not establish Vietnamese keyword volume, difficulty or a measured rank. TOEIC GYM already has a Part 7 overview, an editorial strategy article and a double-passage exercise, so this release adds one distinct triple-passage task and connects the existing pages.

Primary URL: `/toeic/part-7/doc-hieu-ba-van-ban`. Query family: `TOEIC Part 7 ba văn bản`, `bài tập triple passage`, `triple passage có lời giải`. Close wording variants such as `ba đoạn văn` belong to the same page if they describe the same learner task.

## Content and links

- An original event notice, purchase email and supplier update with five multiple-choice questions. Two answers require matching the event schedule with the revised delivery schedule; the loaner-chair question also checks the confirmation deadline.
- Vietnamese guidance on mapping the three documents, identifying changed information and reviewing evidence. The English passages and questions are independently authored for TOEIC GYM and do not reproduce an ETS test. The practice is a short instructional sample, not a complete exam or official score estimate.
- Distinct breadcrumb labels for sentence insertion, double passages and triple passages; a self canonical and metadata through the existing public metadata helper.
- Incoming links from the Part 7 overview, double-passage exercise and existing Part 7 blog. Outgoing links support a shorter double-passage exercise, the overview and the strategy article. The new route is included in the public sitemap and production smoke script.
- The Part 6 parent guide now explains word completion versus sentence insertion using two original examples. Only the revised Part 6/7 guide defaults and Part 7 blog have updated modification dates. CMS overrides may supersede code-owned editorial defaults.

## Next actions after release

1. Check the new page anonymously for HTTP 200, self canonical, one H1, breadcrumbs and five rendered questions; confirm the new URL is in the live sitemap and that all three incoming links work.
2. Sample the target query family monthly under a consistent location and device. Record observed positions separately from first-party landing visits, practice starts and completions. Search Console is outside this workflow.
3. Improve the existing conjunction/preposition blog with richer feedback before creating more Part 5 pages. Expand the existing target-score plan with a practical checklist before adding another score-target URL.
4. Review this page against its parent and blog after there is traffic evidence. Consolidate only if the pages cease to serve distinct learner tasks; do not merge simply because they share the words Part 7.

## Verification

- Built the SEO changes over commit `d35b026` in a separate temporary worktree with the existing installed dependencies. `npm run build` passed, including TypeScript, and lists the new route. The temporary checkout's Turbopack root was widened to the common parent of the checkout and linked dependencies because Turbopack cannot resolve a dependency symlink outside its root. The main project's Next configuration was not changed. Unrelated in-progress workspace edits were not part of this build.
- Targeted ESLint passed. The existing SEO content, structured-data and site-URL suites passed 61 tests, including editorial publication and internal-link validation.
- The compiled standalone app returned HTTP 200, one H1, the expected self canonical, matching breadcrumbs and five question fieldsets on the new page. The double-passage page links to the new triple-passage page; the two existing Reading sample routes still return HTTP 200.
- Playwright checked incomplete submission, 0/5 and 5/5 grading, changing answers after submission and keyboard submission. The focused submit button has a visible 3px outline. No page JavaScript errors occurred.
- At 375, 768, 1024 and 1440px, both interface-language selections had no horizontal overflow. The header and footer follow the selected interface language; the Vietnamese editorial article remains explicitly marked `lang="vi"`. Screenshots were reviewed at all four sizes. Representative artifacts: [375px](../artifacts/seo-reading-2026-10-01/part-7-triple-mobile.png) and [1440px with English interface](../artifacts/seo-reading-2026-10-01/part-7-triple-desktop-en.png).
- These checks used an anonymous session and dummy server settings without a live database connection. They verify this code batch's public practice flow, not production deployment or authenticated exercises. The live sitemap and managed CMS overrides must be checked after release.

## Sources

- [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: generative AI content guidance](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)
- [ETS: TOEIC Listening and Reading](https://www.ets.org/toeic/about/listening-reading.html)
- [Tiếng Anh Mỗi Ngày: Part 7 guide](https://tienganhmoingay.com/meo-thi-toeic/meo-thi-toeic-part-7/)
- [Anh Ngữ Ms Hoa: Reading strategies](https://www.anhngumshoa.com/tin-tuc/toeic-reading-37630.html)

The competitor pages informed the search-intent observation only. The example passages, questions and explanations in this release are original. No target ranking or score increase is promised.
