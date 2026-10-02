# TOEIC GYM: Search Console signal expansion — 2026-10-02

## Baseline supplied by the owner

The Search Console screenshots supplied on 2026-10-02 show the three-month view with 4 clicks, 42 impressions, 9.5% average CTR and 12.7 average position. Example queries shown include `ets toeic 2025 pdf`, `yesterday dùng since hay for`, `said told`, `part 3 4 toeic`, `ngữ pháp toeic part 5`, `part 7 toeic` and `get used to và be used to`.

Each displayed query has only one impression, so this batch treats them as discovery signals rather than statistically reliable rankings. It does not create one page per query.

## Changes

- The official ETS sample review now answers whether there is a verified “ETS TOEIC 2025 PDF”, links to ETS directly and explains how to verify the source without redistributing ETS material.
- The existing present-perfect page directly distinguishes `yesterday`, `since yesterday` and `for one day`.
- The existing reported-speech page adds a concise `said` / `told` / `asked` decision list.
- The existing `used to` page adds a concise comparison of `used to`, `be used to` and `get used to`.
- The existing Part 3–4 guide explains the task difference and links to both original public audio samples.
- Modification dates change only on the pages materially expanded in this batch.

The broad `ngữ pháp TOEIC Part 5` and `Part 7 TOEIC` signals already map to established hub/guide pages with exercises and internal links, so no duplicate URL was added.

## Google Starter Guide alignment

This release follows the [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide?hl=vi): organize readable original content, anticipate the language readers use, keep titles and snippets descriptive, connect related resources with descriptive links and avoid keyword stuffing. Google explicitly states there is no technique that guarantees first place and that changes can take weeks or months to affect Search.

## Verification

- Editorial/content tests cover the five expanded answers and the Part 4 internal link.
- Existing canonical URLs are unchanged.
- Targeted ESLint and the blog test suite must pass before release.
- After deployment, compare page and query impressions over several weeks; do not judge a content change from a one-impression row.
