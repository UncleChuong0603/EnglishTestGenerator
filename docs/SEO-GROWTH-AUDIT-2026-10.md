# TOEIC GYM SEO growth audit — 2026-10-06

## Executive finding

TOEIC GYM is technically crawlable and already has a stronger product-to-content loop than many article-only competitors: HTTPS returns 200, `robots.txt` allows crawling, the sitemap exposes 93 canonical URLs, public pages have titles/descriptions/canonicals and article pages emit `BlogPosting` data. The critical issue is discovery/indexing: live checks for `site:toeicgym.net` returned no indexed results on 2026-10-05/06.

The next constraint is not raw article count. The library has broad grammar coverage, but its non-grammar clusters are shallow and several articles are only 350–600 words. The site needs fewer “one keyword, one thin page” releases and more pages that fully complete a learner task, connect to a real practice action and demonstrate first-party experience through explanations, questions and review workflows.

## Market snapshot

| Competitor / pattern | What currently wins clicks | Gap TOEIC GYM can exploit |
| --- | --- | --- |
| STUDY4 | Large test library, familiar exam UI, answer review, notes/flashcards and progress tracking; strong community familiarity. | Lead with original practice, weakness diagnosis and a concrete next workout; avoid competing only on “number of ETS tests”. |
| PREP | Very wide topic coverage and strong category hubs across TOEIC plus general English; aggressive internal linking and commercial brand demand. | Some indexed pages still contain stale factual claims such as Part 5 having 40 questions. TOEIC GYM can become the careful, sourced reference with current 30/16/54 Reading structure. |
| ZIM / ILA / education publishers | High domain authority, polished long-form explainers, topical breadth and frequent year modifiers in titles. | Make yearless facts genuinely evergreen, show reviewed dates only when material changes, and attach interactive practice rather than ending at prose. |
| Cày TOEIC / focused niche products | Dense Part 5 grammar taxonomy and a large visible question bank; strong match between lesson and practice. | Build equally clear clusters for Listening and Part 7, where TOEIC GYM already has audio, transcript and passage infrastructure. |
| toeic.ai / toeic-training / testtoeic | Strong conversion copy around free, no-account, timed practice; clear test-size choices and immediate action. | TOEIC GYM should expose honest “5–10 câu thử ngay” paths from every relevant article and explain what the result unlocks next. |

Primary sources for format and score facts:

- ETS test format: https://www.ets.org/toeic/test-takers/about/listening-reading.html
- ETS test-taker resources and sample tests: https://www.ets.org/toeic/test-takers.html
- ETS Listening & Reading FAQ and score explanation: https://www.ets.org/toeic/test-takers/faq/product-specific-faq/toeic-listening-reading.html

Observed competitor examples:

- STUDY4 practice workflow: https://study4.com/posts/4447/huong-dan-luyen-de-toeic-tren-study4-hieu-qua/
- PREP TOEIC hub: https://prepedu.com/vi/blog/toeic
- Cày TOEIC grammar hub: https://caytoeic.com/ngu-phap
- Free full-test positioning: https://toeic.ai/practice-test

## Current strengths

- Strong, correct canonical architecture with `/toeic`, Part hubs, a grammar hub, vocabulary, score guide and practice routes.
- Real product evidence: original questions, Listening audio/transcripts, Part 6/7 passages, diagnostics and mistake review.
- Useful structured data: `WebSite`, `Organization`, `BlogPosting`, `BreadcrumbList`, `Quiz`, `CollectionPage` where applicable.
- Honest score language: raw accuracy is not presented as official TOEIC score.
- Clear editorial safeguards for duplicate intent, unsafe links, canonical collisions, unsupported score claims and copyright/endorsement risk.

## Critical gaps

### P0 — indexing and measurement

1. Verify `https://toeicgym.net` as a Domain property in Google Search Console.
2. Submit `https://toeicgym.net/sitemap.xml` and inspect `/`, `/toeic`, `/blog`, `/thi-thu-toeic-online` and one article.
3. Export Page indexing, Sitemaps, Core Web Vitals and Performance data weekly. Store query, page, country, device, impressions, clicks, CTR and position.
4. Check DNS and redirect ownership for `http://`, `www` and non-`www`; the existing SEO smoke test already asserts one permanent redirect.
5. Configure `GOOGLE_SITE_VERIFICATION` in production when using the HTML-tag verification method. Code support is included in this batch.

No code change can substitute for Search Console ownership and sitemap submission. Until the property is verified, claims about ranking progress are guesses.

### P0 — improve pages already closest to demand

- `/toeic`: own “cấu trúc đề thi TOEIC”, with exact 7-Part counts and a short action per Part.
- `/thi-thu-toeic-online`: own transactional “thi thử TOEIC online miễn phí”; make test length, account requirement, scoring limits and next step explicit above the fold.
- `/toeic/thang-diem`: own “thang điểm / cách tính điểm TOEIC”; keep the strong no-fake-conversion position and add examples around score-component planning.
- `/blog/sua-de-mau-ets-toeic-2025-reading-part-5-6-7`: now covers the complete 101–200 correction workflow rather than merely pointing to ETS.
- `/ngu-phap`: retain the broad grammar collection but merge or expand any page that cannot offer a distinct decision, example and practice task.

### P1 — topic clusters to publish deeply

| Cluster | Hub | Supporting intent pages | Product action |
| --- | --- | --- | --- |
| TOEIC beginner | `/toeic` | TOEIC là gì; mất gốc; 450/650/800 planning; study time; choosing L&R vs S&W | `/try` |
| Test format and scoring | `/toeic`, `/toeic/thang-diem` | question counts; time management; raw vs scaled score; score validity; result interpretation | diagnostic / score component calculator |
| Listening | `/toeic/listening` | Part 1–4 strategies; accents; transcript review; dictation; shadowing; missed-answer recovery | public audio sample, then listening lessons |
| Reading | Part 5/6/7 hubs | 75-minute plan; word form; tenses; sentence insertion; inference; double/triple passage; 100-question review | original practice for each sub-skill |
| Vocabulary | `/toeic/tu-vung` | vocabulary by workplace topic; collocations; phrasal verbs; confusing pairs; seven-day review | flashcards |
| General-English adjacency | `/ngu-phap` and vocabulary hub | sentence structure, pronunciation for listening, vocabulary method, email/workplace English | relevant TOEIC sample, not a generic content dead end |
| Exam logistics | future evergreen hub | registration flow, required documents, result timing, certificate validity | always cite and link IIG/ETS; review monthly because facts change |

Do not try to cover every generic English query immediately. That dilutes topical authority and produces thin pages. Expand outward only where TOEIC GYM can provide a real exercise, explanation or learner workflow.

## Editorial definition of done

Every new indexed article must:

1. Answer the query in the first two paragraphs.
2. State scope and caveats where facts vary by test form, location or date.
3. Include at least one original worked example or first-party workflow.
4. Link to at least three relevant internal pages: parent hub, supporting explanation and next practice.
5. End in the next useful learner action, not a generic sign-up CTA.
6. Use primary sources for ETS/IIG facts; never add a year modifier without a material yearly change.
7. Be reviewed in Vietnamese and English UI at 375, 768, 1024 and 1440 px.
8. Pass the content release tests and live SEO smoke test.

## Implemented in this batch

- Expanded the ETS/Reading article into a complete 100-question correction workflow with current 30/16/29/25 ranges, original examples, a mistake-log template, timing diagnosis and a seven-day next plan.
- Added deep pages for “TOEIC là gì”, “lộ trình TOEIC cho người mất gốc”, “TOEIC 650 cần đúng bao nhiêu câu” and the adjacent general-English intent “cách học từ vựng nhớ lâu”.
- Added automated depth assertions for those growth pages so they cannot regress to placeholders.
- Added optional Google Search Console HTML-tag verification through `GOOGLE_SITE_VERIFICATION`.
- Kept every new page in the existing dynamic sitemap and article schema pipeline.

## 90-day operating cadence

### Days 0–14

- Verify Search Console and submit sitemap.
- Request indexing only for the canonical hub and the strongest supporting pages, not every URL blindly.
- Record baseline indexed count, non-indexed reasons, impressions and branded/non-branded queries.
- Refresh homepage, `/toeic`, test-online and score pages based on actual query data.

### Days 15–45

- Publish two high-quality supporting pages per week, one cluster at a time.
- Add an original five-question sample or existing product action to every eligible page.
- Consolidate pages that compete for the same intent; redirect the weaker canonical.
- Earn initial links through useful assets: printable weekly checklist, accurate format table, public original sample and university/student resource outreach.

### Days 46–90

- Update titles/descriptions where impressions are growing but CTR is below query intent.
- Expand pages ranking positions 6–20 with missing subquestions, examples and internal links.
- Build an exam-logistics cluster only with an owner and monthly source review.
- Compare assisted conversions: search landing → practice start → explanation viewed → return session, rather than measuring article traffic alone.

## KPI hierarchy

1. Indexed canonical pages and indexing error rate.
2. Non-brand impressions and count of queries in positions 1–20.
3. CTR by query intent and device.
4. Organic landing → first practice start.
5. Practice completion → explanation viewed → next recommended activity.
6. Returning organic learners within 7 and 28 days.

Traffic without a useful next practice action is not the target outcome.
