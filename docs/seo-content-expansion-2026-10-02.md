# TOEIC GYM: useful content expansion — 2026-10-02

## Search intent and competitive observations

This batch strengthens three existing URLs. Search samples identify the kind of learner task visible in results; they do not measure keyword volume, difficulty, Vietnamese Google rankings or likely traffic.

| Learner need / query family | Existing URL | Added value |
| --- | --- | --- |
| `câu bị động TOEIC`, `bài tập bị động Part 5 có đáp án`, `being và been` | `/blog/cau-bi-dong-toeic-part-5` | Six original questions, automatic grading, explanations for every option, active/passive contrasts, auxiliary chains, tense/agreement errors and transfer to Part 6. |
| `V-ing to V TOEIC`, `bài tập to-infinitive`, `look forward to V-ing` | `/blog/ving-va-to-infinitive-toeic` | Six original questions, verb patterns in workplace contexts, prepositional `to`, changes in meaning with remember/stop, bare infinitives and passive make. |
| `chia 75 phút TOEIC Reading`, `thời gian Part 5 6 7`, `Part 7 không kịp` | `/blog/quan-ly-thoi-gian-toeic-reading-75-phut` | A working time planner with countdown checkpoints, an initial HTML table, manual calculation without JavaScript, an example and a review procedure that distinguishes knowledge from time pressure. |

[Edusa's grammar practice page](https://edusa.vn/tong-hop-bai-tap-ngu-phap-toeic-tu-co-ban-den-nang-cao/) presents topic exercises, answer explanations and next-study guidance. [The MVP TOEIC's Reading overview](https://www.themvptoeic.com/blog/toeic-reading-gom-nhung-gi) covers Parts 5–7, timing and practice choices. These are observed content patterns, not evidence of which feature caused a ranking. TOEIC GYM's contribution here is independently written questions with a reason for each rejected option, targeted contrasts and an adjustable calculator on the relevant existing page. No competitor exercise was imported or rewritten.

## Implementation and editorial checks

- The passive exercise includes an active sentence so learners must identify the subject's role instead of assuming every answer on a passive lesson is passive. The six items cover modal, past simple, past perfect, present continuous, future and active present simple. The verb-pattern exercise covers agree, remind, before, look forward to, avoid and in order to; each item has one intended grammatical answer.
- Both exercises use native answer disclosures from the previous release. Full explanations are in initial HTML and accessible without signing in or enabling JavaScript. Interface controls support Vietnamese and English; English questions and Vietnamese explanations declare their language.
- The planner accepts whole minutes, requires positive budgets for Parts 5 and 6, allows zero review time and rejects a total that leaves no time for Part 7. An invalid submission keeps the last valid plan. It calculates a 75-minute allocation; it neither measures real performance nor predicts a TOEIC score. The default is 12 + 10 + 50 + 3. A 10 + 8 + 3 input gives Part 7 54 minutes, starting with 57 on the countdown.
- The Reading article explains the difference between allocation and countdown, gives a complete worked example and recommends recording correct answers, time-driven guesses and actual stage changes on unfamiliar questions. It removes the unsupported assertion that every question has the same official point value. Suggested timing remains practice guidance, not an ETS rule.
- The Part 5 hub links directly to both six-question lessons and the planner. The expanded articles link to existing foundations, tense, prepositions, reduced clauses, Part 6, double/triple-passage practice and the weekly checklist. Only the revised articles and the revised Part 5 hub receive this batch's modification date; existing publication dates and canonical URLs stay stable.
- The mixed Part 5 sample now selects its seven advertised topics explicitly. Adding a lesson no longer silently changes that sample to nine questions. A regression check records the seven original question IDs.
- The release smoke script checks both new six-question lesson blocks and the planner's initial HTML in addition to the previous SEO checks. CMS overrides can supersede code-owned article copy; review live content after deployment.

## Sources and SEO direction

[Google's current AI Search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide) continues to emphasize useful original content and technical clarity. [Google's people-first guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) includes useful tools and interactive features among a page's main content. This batch applies those principles to concrete study tasks on existing URLs. Special AI files, keyword-stuffed variants and extra schema are not prerequisites for this work.

[ETS describes Reading as 100 questions in 75 minutes](https://www.eu.ets.org/toeic/about/listening-reading.html). The calculator's Part budgets are TOEIC GYM practice choices. Grammar references: [British Council passives](https://learnenglish.britishcouncil.org/free-resources/grammar/b1-b2/passives) and [verb patterns](https://learnenglish.britishcouncil.org/free-resources/grammar/a1-a2/verbs-followed-ing-or-infinitive). Workplace examples and questions were authored independently with AI assistance and checked against the specific sentence structure; no human teacher credentials or external editorial approval are claimed.

## Release and measurement

Validation passed:

- 87 tests across the SEO, editorial library, grammar learning path and publication-quality suites. After the final Markdown formatting adjustment, the 62 content/planner tests passed again.
- Production build, including TypeScript and 89 static-page generation entries; standalone TypeScript and targeted ESLint checks; `git diff --check`.
- Thirty browser cases: three real article components × two interface languages × four widths (375, 768, 1024, 1440), plus six cases with JavaScript disabled. Tests cover initial content, six questions per lesson, 6/6 grading, result reset, keyboard disclosures/focus, planner checkpoints, zero review time, invalid/blank/fractional budgets, unchanged results on invalid submission, no horizontal overflow and no page errors.

The browser harness uses the actual `ArticleView`, practice, planner and Markdown components with application CSS. It isolates only the reading-time helper from the database. It does not verify live CMS overrides, database access or the public page header/footer. The local production build validates application compilation; screenshots are not Core Web Vitals field measurements.

Artifacts: [verification results](../artifacts/seo-content-expansion-2026-10-02/verification.json), [Reading planner at 375px in Vietnamese](../artifacts/seo-content-expansion-2026-10-02/quan-ly-thoi-gian-toeic-reading-75-phut-vi-375.png), [passive lesson at 1440px in English](../artifacts/seo-content-expansion-2026-10-02/cau-bi-dong-toeic-part-5-en-1440.png).

The batch is local and has not been deployed. A read-only request confirmed the live passive lesson returns 200 with its old metadata and zero interactive question fieldsets. Local changes do not establish a search-ranking improvement.

After release, run `node scripts/seo-smoke.mjs https://toeicgym.net` and inspect the three pages anonymously, including CMS overrides, canonical, modification date, six questions on each grammar lesson and the planner's 50-minute default. These URLs already exist; adding duplicate keyword pages is unnecessary.

Compare equal 28-day periods using page/query pairs where Search Console data is available. Track impressions, clicks, CTR and the actual landing URL together; distinguish organic visits from exercise completion. Prioritize further edits where a query exposes an unanswered learner question or a confusing example. Search position alone is not evidence of cause, and this release does not promise a top ranking.
