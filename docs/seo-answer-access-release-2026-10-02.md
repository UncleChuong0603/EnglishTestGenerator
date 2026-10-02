# TOEIC GYM: answer access and existing-content SEO — 2026-10-02

## Changes

- All public `MiniPractice` exercises now render the correct answer and the reason each distractor fails in native `details` elements. These can be opened with a keyboard or with JavaScript disabled. Answers stay collapsed until the learner chooses to read them; automatic grading still checks every question, announces the result and clears it when an answer changes. An incomplete submission focuses the first unanswered question. The blog passes the interface language into the controls, while English questions and Vietnamese explanations declare their own language.
- Expanded `/blog/menh-de-quan-he-toeic` on its existing canonical: six independently authored questions, a direct opening explanation, worked `where/which` contrasts, comma rules, `to whom`, omission of object relative pronouns and transfer to Parts 6–7. New links lead to existing sentence-insertion, double-passage and reduced-clause lessons. Close query variants belong to this URL; no additional keyword landing page was created. Only this article's editorial modification date changes. CMS overrides can supersede the code-owned article.
- `/seo/toeic-100-tu-vung.pdf` declares its complete HTML counterpart through an HTTP `Link` canonical header. The weekly checklist's existing noindex policy remains appropriate to that separate worksheet.
- Fixed the shared metadata helper so a page title that already names TOEIC GYM uses an absolute title and does not receive another brand suffix. This addresses the duplicated title observed on the live about page.
- Extended the read-only SEO smoke script to check the relative-clause article, server-rendered questions and answer disclosures, and the PDF canonical header.

## Research and scope

Google's current [AI Search guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) emphasizes useful original content, crawlable pages, a clear site structure and a good visitor experience. It says special AI files and markup are not required for Google visibility. The native disclosures support an actual learner task and provide the same answer content to people and crawlers; this does not guarantee indexing or AI citation.

[Google's canonical documentation](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls) supports HTTP canonical headers for PDFs and other non-HTML documents. The vocabulary PDF duplicates the HTML collection, so that collection is the appropriate preferred URL. Search engines can still choose a different canonical.

Search samples for Vietnamese relative-clause exercises showed existing explanatory lessons and practice collections. This suggests a learner task to improve on the existing article, not measured search volume, keyword difficulty or TOEIC GYM rankings. Grammar review used [British Council's defining relative clauses](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/relative-clauses-defining-relative-clauses) and the article's existing Cambridge reference. Examples and exercises were written independently.

## Validation

- Final production build passed, including TypeScript and generation of 89 static-page build entries. Standalone `tsc --noEmit`, targeted ESLint and `git diff --check` passed. The eight SEO test files passed all 70 tests, including initial-HTML answer access, language annotations, title-template regression and PDF canonicals for production/development origins.
- The local production standalone server returned HTTP 200 and `application/pdf` for the vocabulary PDF with the expected canonical HTTP header. The anonymous about page returned HTTP 200, one H1, its self canonical and exactly one TOEIC GYM occurrence in the title. See [HTTP verification](../artifacts/seo-answer-access-2026-10-02/http-verification.json). The local server used an unused placeholder database connection; these two routes did not require database queries.

The actual practice and Markdown components were server-rendered and hydrated in an isolated browser harness using the project CSS. Eight cases cover Vietnamese and English interfaces at 375, 768, 1024 and 1440px; two additional cases disable JavaScript. Checks cover one H1, six questions, no horizontal overflow, keyboard opening and visible focus, incomplete-answer focus, correct 6/6 grading, result reset and all three distractor explanations without JavaScript. No page errors occurred. The harness does not verify application database access or the full page shell; no local database is configured in this workspace.

Artifacts: [verification results](../artifacts/seo-answer-access-2026-10-02/verification.json), [375px Vietnamese](../artifacts/seo-answer-access-2026-10-02/relative-vi-375.png), [1440px English](../artifacts/seo-answer-access-2026-10-02/relative-en-1440.png).

The live read-only smoke checked 79 sitemap URLs, 26 representative public pages and seven application routes. It found the about-page brand duplication and four checks that require this local release: six relative-clause questions, answer disclosures, mixed-practice answer HTML and the PDF canonical header. This release has not been deployed. Those expected failures must be rechecked after deployment; they are not proof of a ranking problem.

## Next operating cycle

1. Deploy through the existing release process, then run `node scripts/seo-smoke.mjs https://toeicgym.net`. Inspect the actual article for a CMS override before assuming the new code-owned content is live.
2. Record the release date and compare equal 28-day periods for the primary URL and query group: `mệnh đề quan hệ TOEIC`, `bài tập mệnh đề quan hệ có đáp án`, `who whom whose which where`. Read impressions, clicks, CTR and selected landing page together. A short-term position change does not establish causation.
3. Improve an existing page with relevant impressions before creating another URL. Prioritize original worked examples, complete explanations and a useful next exercise. Use field Core Web Vitals data when available; screenshots and a successful build do not establish field performance.
4. Promote the useful vocabulary PDF, worksheet or worked exercise through relevant communities or teachers only with permission and genuine relevance. Avoid purchased ranking links, automated comments and manufactured endorsements. No outreach was sent in this task.

No ranking, indexing, traffic improvement or top position is claimed from this release alone.
