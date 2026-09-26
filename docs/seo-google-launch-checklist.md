# Google Search Console launch checklist

Use the canonical host `https://toeicgym.net`. Deployment and sitemap availability do not prove that Google has indexed a page.

1. Open [Google Search Console](https://search.google.com/search-console). Add a **Domain property** with `toeicgym.net` (no scheme or path). A Domain property covers both www and non-www. If this property already exists, use it.
2. If Search Console requests ownership proof, copy its exact DNS TXT record into the domain's DNS provider. Wait for propagation, then select **Verify** in Search Console. Keep the TXT record in DNS. This step needs access to the domain owner account; no value should be copied into this repository.
3. In **Sitemaps**, submit `https://toeicgym.net/sitemap.xml` (or enter `sitemap.xml` for the Domain property). Confirm its fetch status and inspect any parsing errors.
4. In **URL Inspection**, inspect `https://toeicgym.net/toeic/part-5`, `https://toeicgym.net/toeic/part-5/practice`, one rewritten blog post and `https://toeicgym.net/challenge/part-5`. Check the indexed version and **Test live URL** separately. Confirm fetch success, indexability, user-declared canonical and **Google-selected canonical**. A live test does not prove indexing.
5. Use **Page indexing** to examine important URLs and reasons for exclusion. Draft, archived, private and filter URLs should not appear as indexable sitemap entries. A duplicate or intentionally noindex page need not be indexed.
6. In **Performance → Search results**, compare pages and queries over consistent date ranges. Record clicks, impressions, CTR and average position for the Part 5 hub, practice and articles. Segment by country/device when relevant. Allow time for data to accumulate.
7. Request indexing only for a newly published or substantially fixed priority URL when needed. Sitemap submission is the normal way to notify Google about multiple changes. A request never guarantees indexing.

Official guidance: [property and DNS verification](https://support.google.com/webmasters/answer/34592?hl=en), [sitemaps](https://support.google.com/webmasters/answer/7451001?hl=en), [URL Inspection](https://support.google.com/webmasters/answer/9012289?hl=en), [Page indexing](https://support.google.com/webmasters/answer/7440203?hl=en), [Performance](https://support.google.com/webmasters/answer/7576553?hl=en).
