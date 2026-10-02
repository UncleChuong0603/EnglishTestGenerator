# TOEIC GYM: official format and score utility — 2026-10-02

## Search gap

Vietnamese search results for `cấu trúc đề TOEIC` and `thang điểm TOEIC` commonly combine current-format facts with estimated raw-to-scaled conversion tables. TOEIC GYM already had a broad `/toeic` hub, but it did not show the exact question count for each Part. It also had no focused URL explaining how official Listening and Reading scaled scores are combined.

This batch strengthens the existing hub for format intent and adds one distinct score-intent page. It does not create year variants or separate pages for close wording variants.

## `/toeic`: exact test structure

The hub now answers the format question above the long guide content with a server-rendered table:

- Listening: Part 1 = 6, Part 2 = 25, Part 3 = 39, Part 4 = 30; 100 questions in about 45 minutes.
- Reading: Part 5 = 30, Part 6 = 16, Part 7 = 54; 100 questions in 75 minutes.
- Total: 200 questions and 120 minutes of testing time, excluding test-center administration.

The visible table cites the ETS TOEIC Listening & Reading Score User Guide and links to the new score page. The title and summary now answer `cấu trúc đề thi TOEIC` directly while retaining links to practice for every Part.

## `/toeic/thang-diem`: honest score interpretation

The new page explains:

- Listening and Reading are reported separately on a 5–495 scaled-score range.
- Total score is the sum of both section scores, producing a 10–990 range.
- ETS converts correct responses using a statistical process intended to preserve score meaning across administrations; a single unofficial raw-score table should not be presented as exact for every form.
- TOEIC Listening & Reading has no universal pass/fail threshold; receiving organizations set requirements for their own needs.

An interactive calculator adds two scaled section scores and reports the remaining gap to a user-entered target. It deliberately does not estimate an ETS score from a short practice result or a raw correct-answer count.

## Sources reviewed

- [ETS TOEIC Listening & Reading Score User Guide](https://www.ets.org/pdfs/toeic/toeic-listening-reading-score-user-guide.pdf), especially the format and score interpretation sections.
- [ETS TOEIC Listening & Reading FAQ](https://www.ets.org/content/ets-org/ca/en/toeic/test-takers/faq/product-specific-faq/toeic-listening-reading.html), for the 5–495 section range and 10–990 total range.
- [ETS Listening & Reading Score Descriptors](https://www.ets.org/content/dam/ets-org/pdfs/toeic/toeic-listening-reading-score-descriptors.pdf), linked for readers who want ability descriptions.
- [Google AI Search guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?version=published), applied through original utility, accurate sourcing and crawlable internal links instead of GEO/AEO hacks.

## Release checks

- Verify the seven Part counts total 100 Listening, 100 Reading and 200 overall.
- Verify score inputs accept only the official section and total ranges.
- Render useful calculator defaults, labels and live result text before interaction.
- Review `/toeic` and `/toeic/thang-diem` at 375, 768, 1024 and 1440 px, including keyboard focus and both interface languages.
- Confirm both canonical URLs occur once in the sitemap after deployment.
