# TOEIC GYM: Part 7 topic completion and article trust signals — 2026-10-02

## Why this batch exists

TOEIC GYM already had a general Part 7 guide and original exercises for two and three related documents. It did not have a focused first step for learners searching for a single passage or one-document exercise. Current Vietnamese search results distinguish single-passage practice from multiple-passage strategy, so the new URL serves a separate learner task instead of repeating the Part 7 hub.

Google's current guidance for AI features says ordinary SEO foundations still apply and recommends useful, original, non-commodity content over AEO/GEO hacks or unnecessary AI files. Its link guidance recommends crawlable links with descriptive anchor text and at least one internal path to every important page. Its Article documentation recommends identifying authors with the appropriate type and a URL or connected entity.

Sources reviewed on 2026-10-02:

- [Google: optimizing for generative AI features](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?version=published)
- [Google: link best practices](https://developers.google.com/search/docs/crawling-indexing/links-crawlable)
- [Google: Article structured data and author markup](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Google: byline date guidance](https://developers.google.com/search/docs/appearance/publication-dates)

## New learner resource

`/toeic/part-7/doc-hieu-mot-doan-van` contains one original workplace email and four questions covering:

- the purpose of the email;
- a location detail;
- the action a visitor should take;
- the meaning of a word in context.

Every answer explanation points to evidence in the email and explains why the other choices do not answer the question. The page is public, requires no account and links forward to the two-document and three-document exercises. Those pages link back to the new first step. The Part 7 hub now presents the progression in order.

## Article trust and date consistency

- TOEIC GYM editorial bylines link to the existing `/ve-toeic-gym` page, where readers can see how public questions and explanations are produced and how to report a problem.
- A materially revised article shows both its publication date and update date. An article edited on the same calendar day does not get a separate freshness label.
- `BlogPosting` JSON-LD now connects `author` and `publisher` to the site's identified `Organization` node, includes `mainEntityOfPage` and `inLanguage`, and retains visible breadcrumb, image and date fields.
- The visible update date and `dateModified` use the same stored timestamp. Dates are not changed merely to simulate freshness.

## Release checks

- Validate all long-tail routes, unique answer options and answer indices.
- Render the article byline and publication/update dates in Vietnamese and English.
- Validate the Article graph, publisher identity and breadcrumb graph.
- Confirm the new canonical URL appears once in the sitemap with its real modification date.
- After deployment, run the read-only SEO smoke script against production and monitor the new URL as part of the Part 7 query group over several weeks.
