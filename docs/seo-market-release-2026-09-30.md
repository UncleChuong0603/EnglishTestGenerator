# TOEIC GYM search-market SEO batch — 2026-09-30

## Search observations used

Search samples for Vietnamese queries around `luyện TOEIC Part 1/2/4 online` and `thi thử TOEIC online` showed competitors presenting dedicated Part entry points, full-test choices, audio/transcripts and answer explanations. Examples: [TestTOEIC](https://testtoeic.com/vi), [Đậu TOEIC](https://dautoeic.vn/), [TOEIC Lab](https://toeiclab.info.vn/) and [STUDY4](https://study4.com/tests/toeic/). These are product/page observations, not measured Google Vietnam ranks or keyword volumes. The official [ETS format page](https://www.ets.org/toeic/about/listening-reading.html) supports the 100-question, 45-minute Listening and 100-question, 75-minute Reading descriptions.

## Implemented in the repository

- Public Listening hub `/toeic/listening` with distinct paths to Parts 1–4.
- Original, no-login audio exercises with transcript and explanations at `/toeic/part-1`, `/toeic/part-2` and `/toeic/part-4`. Part 1 includes an original generated office photograph. Part 3 retains its existing original conversation exercise.
- Public `/thi-thu-toeic-online` comparison of quick practice, Reading and longer Mock modes. The page states that longer modes need an account and validated content readiness; it makes no score-conversion claim.
- Canonicals and descriptions through the existing metadata helper; the five new URLs are in the sitemap route list. Homepage, public header, TOEIC overview, online-practice guide and Part 3 now link into the new cluster. The production smoke script checks their presence, metadata and breadcrumbs after release.
- The revised date for the two changed managed guide defaults advances only those documents; other bundled pages retain their prior last-modified value. A live CMS override can supersede these defaults.

## Asset provenance

The Part 1 image was generated using the built-in imagegen tool, then converted to a 1,200px WebP for the site. Prompt: photorealistic office meeting room with one woman visibly arranging three folders on a table, two empty chairs and a closed laptop, natural daylight, no text, logo, brand or other people. Audio was generated from the source text in `src/lib/seo/listening-samples.ts` by `scripts/generate-seo-listening-samples.mts` using the project's Edge TTS authoring adapter. The exercises do not reproduce ETS material.

## Verification and remaining release work

- `npm run typecheck`, targeted ESLint and the 57-case SEO content release suite passed.
- Final `npm run build` passed and lists all five new routes. One intermediate build collided with an in-progress homepage CSS import in the shared workspace; the CSS file was then completed and the final build passed.
- The three MP3 assets decode with ffmpeg (approximately 13, 13 and 25 seconds). The image is 67 KB WebP.
- Anonymous local dev responses for the five new routes and Part 3 returned HTTP 200, one H1, a title, description, production self canonical and no `noindex`. All new MP3 and WebP URLs returned HTTP 200 with the expected media type. Local sitemap returned 500 because the configured QA PostgreSQL tunnel at `127.0.0.1:15433` was closed; this is an environment dependency, not a new sitemap route error.
- Read-only inspection over `ssh english-vps` found zero CMS overrides, 25 configured 200-question mock forms, and no missing, unpublished or wrong-pool questions among their 5,000 assignments. This supports the site's content readiness but does not prove every runtime mode is currently open to every account.
- The standalone production build ran locally with a nonproduction test environment and no live database connection. After copying Next's generated static assets into the standalone output as the production image does, anonymous Playwright checks passed incomplete-answer validation and post-submit feedback on Parts 1, 2 and 4. At 390px, the five new pages had no horizontal overflow. This tests the compiled browser flow; it does not exercise authenticated Mock starts.
- After release, run `npm run seo:smoke` against the new deployment and check the three audio URLs and image URL in an anonymous browser. The current production sitemap will remain at its old URL count until the application is deployed. Search Console is deliberately outside this batch's workflow.

Ranking is an external outcome. This batch supplies distinct public practice value and discoverable links; it does not establish a future position in Google results.
