# TOEIC GYM: public vocabulary collection — 2026-10-01

## Why this batch exists

The public site had a workplace flashcard page, while the signed-in vocabulary catalog already contained a reviewed foundational set. Search results for Vietnamese TOEIC vocabulary commonly expose topic collections with examples and practice paths, so this release makes the first 100 reviewed entries crawlable at `/toeic/tu-vung` instead of leaving the useful catalog behind an account wall.

Observed market references:

- [990TOEIC vocabulary topics and flashcards](https://990toeic.com/tu-vung)
- [HOCTOEIC topic vocabulary and spaced review](https://hoctoeic.vn/tu-vung)

These pages informed the intent shape only. TOEIC GYM's meanings and examples come from its existing editorial vocabulary set.

## Scope

- One canonical page: `/toeic/tu-vung`.
- Ten workplace topics and 100 visible entries.
- Every entry has an English term, Vietnamese meaning, English definition or usage context, and an original example sentence.
- Topic anchors, flashcard follow-up, Part 5 practice and the existing collocation guide form the learning path.
- CollectionPage/ItemList JSON-LD contains the same 100 visible terms.

The page deliberately remains one substantial collection. It does not create a separate thin URL for every word or topic variation.

## Crawl and release checks

- Added to `STATIC_PUBLIC_PATHS` and sitemap coverage.
- Added to the TOEIC hub's crawlable link list.
- Smoke test checks one H1, self canonical, matching breadcrumb and an ItemList with exactly 100 entries.
- Browser check: Vietnamese and English at 375, 768, 1024 and 1440 px; HTTP 200, no horizontal overflow, visible keyboard focus and correct language/canonical/schema.
- Vitest: 120 tests pass in the focused SEO/content run.
- ESLint: changed files pass.
- Next build: pass; 89 routes generated.

## Editorial guardrail

Google recommends people-first content and crawlable links. The collection must be expanded only when new entries receive the same editorial review and a useful example; do not generate pages from keyword permutations. [Helpful content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content), [crawlable links](https://developers.google.com/search/docs/crawling-indexing/links-crawlable).

This batch is local until deployed. After deployment, run `node scripts/seo-smoke.mjs https://toeicgym.net` and verify the new URL is present in the live sitemap.
