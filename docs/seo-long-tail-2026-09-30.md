# TOEIC GYM: long-tail SEO rollout (2026-09-30)

## What the search sample shows

Vietnamese results for queries about Part 6 sentence insertion, Part 7 multi-document reading and Part 5 conjunctions/prepositions contain dedicated lesson pages with exercises from sites such as STUDY4, ZIM and Đăng Nhật Education. These observations identify search intent; they are not a rank, demand or difficulty estimate. The existing TOEIC GYM Part 6/7 pages explain the Parts, while the new pages answer two narrower exercise intents.

## Live intent map for this code batch

| Query family | Preferred URL | Distinct value | Status |
| --- | --- | --- | --- |
| `toeic part 6 điền câu vào đoạn văn`, `bài tập part 6 điền câu` | `/toeic/part-6/dien-cau-vao-doan-van` | Original email, sentence insertion, reason for every option | Live on production; HTTP 200 and in sitemap on 2026-10-01 |
| `toeic part 7 hai đoạn văn`, `bài tập part 7 double passage` | `/toeic/part-7/doc-hieu-hai-doan-van` | Two original emails, three evidence-based questions | Live on production; HTTP 200 and in sitemap on 2026-10-01 |
| `toeic part 7 ba văn bản`, `bài tập triple passage có lời giải` | `/toeic/part-7/doc-hieu-ba-van-ban` | Original event notice and two emails; five questions with cross-document evidence | October 1 batch; not deployed by this task |
| `toeic part 6`, `cách làm part 6` | `/toeic/part-6` | Broad Part guide | Existing |
| `toeic part 7`, `cách làm part 7` | `/toeic/part-7` | Broad Part guide | Existing |
| `toeic part 5 loại từ`, `toeic part 5 thì động từ` | `/toeic/part-5/word-form`, `/toeic/part-5/thi-dong-tu` | Original topic practice | Existing |
| `luyện nghe toeic part 1/2/3/4` | `/toeic/part-1` through `/toeic/part-4` | Public audio sample, transcript and explanation | Previous local batch |

One search intent should have one primary URL. Fold close variants into the same title, headings and answer text; do not create a new page for each wording variation.

## Next editorial queue

1. **Part 7 triple passage — implemented October 1**: One original three-document scenario with five questions. Questions about event readiness and late delivery require evidence from the event notice and the final supplier email. The page is linked from Part 7, the double-passage exercise and the existing Part 7 blog; its route is in the sitemap and release smoke checks. Deployment and post-release verification remain.
2. **Part 6 word/phrase vs. sentence insertion — expanded October 1**: The parent Part 6 guide now contrasts the two reading tasks with original examples and an actionable checklist. This extends the existing intent rather than creating another overlapping URL.
3. **Part 5 conjunction vs. preposition — expanded October 1**: The existing `/blog/lien-tu-va-tu-noi-toeic` now has six original interactive questions with feedback for every option, a structure/meaning/punctuation procedure, paired examples and a Part 6 transfer task. Its existing Part 5 incoming link remains. No overlapping article URL was added.
4. **Target-score learning plans — expanded October 1**: The existing 450-to-700 guide now includes prerequisites, a four-week review cycle and a link to `/toeic/checklist-hoc-tuan`. The new public resource supports editable fields, printing and a free blank A4 PDF; it is linked from the TOEIC parent and included in the sitemap. Add another target only if the curriculum and diagnostic data can support a genuinely different plan. Never imply a guaranteed score increase. Release details and validation: [useful resources batch](seo-authority-release-2026-10-01.md). These changes are local until deployment.
5. **Vocabulary in work situations**: Expand the existing office-vocabulary post into a topic hub with original sentence examples and a recall exercise; add child pages only when they represent distinct contexts such as invoices or meetings.

## Distribution and authority

- Link each child page from its Part parent, its neighboring lesson and the appropriate learner path. Use descriptive anchor text; avoid repeating identical keyword-heavy links across the site.
- Publish a small shareable resource that a teacher or university English club would actually use, such as an original Part 7 evidence worksheet. Offer it to relevant educators for editorial feedback and voluntary citation. Do not buy backlinks or use link exchanges.
- Keep original examples, explanations and source provenance with each page. Review older content when the task format or product flow changes; do not edit dates just to signal freshness.
- Improve the path from public exercise to a useful next practice step. Keep the sample and explanation accessible before signup.

## Operating loop without Search Console

For each new URL record: target query family, intended learner task, reviewer, sample source, release date, internal incoming links and conversion event. At release, check anonymous HTTP 200, one H1, title, description, self canonical, breadcrumbs, sitemap, rendered exercise and mobile layout. Once a month, sample Google Vietnam results from a consistent device/location and record position as an *observed sample*, plus first-party landing-page traffic, practice starts and completions. Compare the new page with its parent: if they rank for the same query and neither serves a distinct task, consolidate the weaker page and redirect it. If the page gets visitors but few practice starts, improve the exercise and next-step link before producing more pages.

No number of articles guarantees a top ranking. Google recommends original, useful content and warns against many low-value pages made primarily to capture search variations. Search position depends on competing pages and Google's systems after deployment and indexing.

## October 1 verification and follow-up

The two new URLs return HTTP 200 on `toeicgym.net`, show one H1, a self canonical and the intended sample questions, and appear in the live sitemap. The Part 6 and Part 7 parent pages link to their new child page. Both parent pages still show a primary practice link to `/toeic/part-5/practice` in production; the code now sends each parent to its matching Reading sample and adds Reading-specific follow-up links. That follow-up is local until another release. The focused SEO content suite passed 57 tests. A full workspace typecheck on October 1 is blocked by unrelated in-progress practice-service type errors and a stale generated `vocabulary/explore` route reference; it does not establish a failure in these SEO files.

## Sources

- [Google: creating helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Google: SEO starter guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Google: link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: AI features and scaled content guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [STUDY4: Part 6 sentence insertion](https://study4.com/posts/2851/cach-lam-dang-cau-hoi-dien-cau-vao-doan-van-trong-toeic-reading-part-6/)
- [ZIM: Part 6 traps and exercises](https://zim.vn/cach-tranh-bay-toeic-reading-part-6-va-bai-tap)
- [STUDY4: conjunctions and prepositions in Part 5](https://study4.com/posts/2313/cach-lam-dang-bai-ve-lien-tu-va-gioi-tu-trong-toeic-part-5/)
