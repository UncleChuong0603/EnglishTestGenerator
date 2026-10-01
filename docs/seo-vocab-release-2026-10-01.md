# TOEIC GYM: office vocabulary topic expansion — 2026-10-01

## Scope

The next queued topic was the existing office-vocabulary article, `/blog/tu-vung-toeic-theo-chu-de-cong-so`. The page keeps one primary URL for the topic and now gives learners a distinct next action: identify the business situation, choose the collocation and recall it later in a new sentence.

The update adds:

- four short sections on easily confused business collocations and context clues;
- two original Part 5 examples for `issue an invoice` and `extend a deadline`;
- a seven-day recall task linked to mixed Part 5 practice;
- three additional original interactive questions, bringing the vocabulary mini-practice to six questions. Each question has a reason for the correct answer and for every distractor.

Examples are written for TOEIC GYM and are not taken from ETS or a competitor. The article still explains that vocabulary practice does not predict an official score.

## Search and content decision

The target is a topic family such as `từ vựng TOEIC công sở`, `collocation TOEIC`, `issue an invoice TOEIC` and `meet/extend a deadline TOEIC`. Close wording variants stay on the same page; no page was created for each phrase. This keeps the article useful to a learner who wants a work-context vocabulary plan while letting the interactive questions serve immediate practice intent.

Google's current guidance recommends content that is original, useful and organized for people, and says there is no special AI markup or ideal page length that replaces those fundamentals. The page therefore adds examples and retrieval practice instead of keyword-only paragraphs or mass-produced variants.

## Internal path

Existing links from the Part 5 guide, Part 5 mixed practice and Part 7 review continue to point to the article. The updated article links back to mixed Part 5 practice and the Part 7 evidence guide. The article's canonical URL, BlogPosting JSON-LD, breadcrumb, title and description remain managed by the existing blog route. Its modification date is set to October 1, 2026 because the content and practice materially changed.

## Verification

- In an isolated worktree based on commit `6241ddd`, the focused SEO/editorial suites passed **73 tests**.
- The production build passed, including TypeScript and the existing public routes.
- Targeted ESLint passed for the changed editorial and mini-practice files.
- The existing publication-quality checks verified the article's internal links, one rendered H1, no replacement characters, original question IDs, four unique options and explanations for all distractors.

This batch has not been deployed. After deployment, run the read-only SEO smoke script and verify the live article's canonical, updated date, six question fieldsets and incoming links. Search Console remains outside this workflow; monthly observed search results and first-party practice starts are the practical follow-up measures.

## Sources

- [Google: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google: helpful, reliable, people-first content](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
