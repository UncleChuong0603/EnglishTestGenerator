# TOEICGym SEO release — 2026-09-27

## Repository and deployment

The task began in the existing EnglishTestGenerator workspace on local `main` at `671ddb2`. The repository already had 46 bundled blog posts, public TOEIC hubs, canonical metadata, robots, JSON-LD, a dynamic sitemap and a CMS overlay with editing, preview, publishing and noindex controls. The baseline public sitemap had 65 URLs.

During implementation, remote main advanced through question-bank and operations changes to `e880eb8`. SEO changes were cherry-picked onto that revision in an isolated worktree. Migration 0041 was already used by the bank rollout, so the SEO migration was regenerated as **0042_modern_jocasta.sql**, with a strictly increasing journal timestamp. No learner, account, payment or question-bank data was modified by this SEO release.

Application commits pushed to main: `4c71c9e`, `958af15`, `2af9066`. Production serves both new URLs and the revised sitemap. Follow-up `c9efb82` improves the read-only smoke script after a fast full-site sweep encountered edge HTTP 429 responses.

## Technical changes

- Extended the existing CMS to manage eight code-owned hub/practice routes, preserving the established canonical URLs.
- Added archive, optional permanent redirect, content origin and review timestamp. Publication runs the deterministic gate again in a database transaction; concurrent publication is serialized.
- Blocked duplicate slugs/canonicals/titles/exact intent, empty or malformed content, unsupported score claims, detected copyright/endorsement risk, broken internal references, missing local images and invalid original practice answer structures. Warnings remain separate from blocking failures.
- CMS read failures no longer silently restore content that an owner may have unpublished or archived.
- Published sitemap rows honor CMS state, noindex and canonical ownership. Only meaningful content edits update lastmod. Static pages do not invent a modification timestamp.
- Blog search/category variants use noindex, follow and canonical `/blog`. Managed CMS slugs do not create duplicate `/blog/seo-*` routes.
- Corrected homepage calls to action to point to available learning and Challenge flows. Added topic → practice → Challenge links and a review-errors guide.
- Admin shows URL, category/type, intent/topic, origin, status, canonical, noindex, dates and internal-link count. Bundled content can be copied to a CMS draft, previewed and published; the existing live version remains available while editing the draft.

## Content decisions and exact URLs

See [the complete 55-record inventory](seo-content-inventory.md) for every bundled blog and managed hub decision. Pre-existing supporting pages remain at their current URLs. **No merge, redirect or archive was applied to live content in this batch**: no clearly justified duplicate destination was established. No content was scheduled and no runtime AI generation or scheduler was introduced.

All paths below resolve under `https://toeicgym.net`; they are published library defaults and indexable unless an owner subsequently changes the CMS override.

| URL | Type | Intent | Action | Status | Indexable | Primary next action |
| --- | --- | --- | --- | --- | --- | --- |
| `/toeic` | Hub | Learn | Expand / CMS-managed | Published | Yes | Part 5 hub |
| `/luyen-thi-toeic-online` | Hub | Learn | Expand / CMS-managed | Published | Yes | Start practice |
| `/toeic/part-5` | Hub | Learn | Expand | Published | Yes | Choose a topic |
| `/toeic/part-6` | Guide | Learn | Preserve guide / CMS-managed | Published | Yes | Reading practice |
| `/toeic/part-7` | Guide | Learn | Preserve guide / CMS-managed | Published | Yes | Reading practice |
| `/toeic/part-5/word-form` | Practice | Practice | Rewrite | Published | Yes | Mixed practice |
| `/toeic/part-5/thi-dong-tu` | Practice | Practice | Rewrite | Published | Yes | Mixed practice |
| `/toeic/part-5/practice` | Practice | Practice | New | Published, HTTP 200 verified | Yes | Part 5 Challenge |
| `/blog/cach-review-loi-sai-toeic` | Guide | Learn | New | Published, HTTP 200 verified | Yes | Review one error, retry |
| `/blog/ngu-phap-toeic-part-5-can-hoc` | Guide | Learn | Rewrite | Published | Yes | Focused topic practice |
| `/blog/meo-lam-toeic-part-5-trong-thoi-gian-gioi-han` | Guide | Learn | Expand | Published | Yes | Timed Challenge |
| `/blog/chien-luoc-tang-diem-toeic-450-den-700` | Roadmap | Plan | Rewrite claims/planning | Published | Yes | Diagnostic and review |
| `/blog/sua-de-mau-ets-toeic-2025-reading-part-5-6-7` | Guide | Learn | Replace reproduced answer discussion with original examples | Published | Yes | Review original examples |
| `/challenge/part-5` | Challenge | Practice | Audit / retain | Published, smoke verified | Yes | Start Challenge |

Seven existing topic articles also gained original interactive exercises and next-step links: `/blog/loai-tu-trong-toeic-part-5`, `/blog/thi-va-dang-dong-tu-toeic`, `/blog/hoa-hop-chu-ngu-dong-tu-toeic`, `/blog/gioi-tu-toeic-trong-cong-viec`, `/blog/lien-tu-va-tu-noi-toeic`, `/blog/menh-de-quan-he-toeic`, and `/blog/tu-vung-toeic-theo-chu-de-cong-so`. The vocabulary exercises cover workplace collocations without creating another competing URL.

The broader touched count exceeds 15 because the audit also corrected ambiguous choices in eight existing grammar articles and migrated existing hubs into Admin management. Only **two new URLs** were added. The batch contains 21 original mini questions across seven topics, reused appropriately in the mixed and topic practice pages. These questions are independent of the learner question bank.

## Verification evidence

- Initial workspace: TypeScript passed; lint passed with two pre-existing warnings; 762 unit tests passed, one skipped; production build passed.
- Integrated with current main: 725 unit tests passed, one skipped. The different count reflects upstream test inventory changes. The additional SEO migration test passed both checks separately. TypeScript passed after `next typegen`; lint passed with the same two existing warnings.
- Clean checkout with dependencies installed directly: `npm run build` passed, including all 73 generated static pages and the dynamic practice route.
- Final production `npm run seo:smoke`: **PASS**. Validated 67 sitemap entries for duplicates, canonical form and private/session leakage; fetched 13 representative public pages and seven private/app routes. Checked titles, descriptions, social images, canonicals, robots, JSON-LD and canonical-host redirects.
- Additional production checks: new practice and review guide return 200 with one H1; mixed practice server-renders seven questions; filtered blog pages are noindex with canonical `/blog`; `/blog/seo-part5` returns 404; trailing-slash variant returns 308.
- Anonymous Playwright mobile check at 390 × 844: seven questions rendered, answering and submitting displayed a `/7` result, and no horizontal overflow was detected. This did not create a learner session.
- A full fast sweep initially triggered edge 429 responses. The smoke script now validates all sitemap entries and fetches representative pages sequentially; repeat checks passed. This is not evidence of a page metadata defect.

## Limits and remaining owner actions

Authenticated Admin edit/unpublish/archive actions were not executed against production because no authorized Admin browser session was available. Their schema, service and rendering logic were verified locally; migration behavior was checked using PGlite. The production checks establish public behavior, not direct inspection of every CMS override or draft. No Core Web Vitals field data or Google indexing/ranking result is claimed.

The deterministic gate catches specific structural patterns; it cannot mathematically establish copyright originality, factual truth or semantic uniqueness of every possible future English exercise. The release questions were reviewed with a reason for each distractor. Future content still needs an actual editorial correctness check, which Codex may perform under the autonomous workflow.

Owner-only Google actions are listed in [the Search Console checklist](seo-google-launch-checklist.md): verify the Domain property if needed, submit the sitemap, inspect priority URLs and Google-selected canonicals, then review indexing and query/page performance. Follow [the operating loop](seo-operating-loop.md) and [the authority plan](seo-authority-plan.md); no outreach was sent.

The next expansion should follow observed Search Console queries within Part 5: improve weak subject–verb agreement, preposition or collocation examples first, rather than creating another URL for every query variant.

The original workspace contains unrelated uncommitted operations changes and an older local branch. The release was built and pushed from `C:/Users/CHUONG/AppData/Local/Temp/toeicgym-seo-final`; those unrelated changes were preserved.
