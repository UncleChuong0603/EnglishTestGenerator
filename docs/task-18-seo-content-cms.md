# Task 18 — SEO Content CMS

## Routes

- Admin list: `/admin/content/posts`
- New article: `/admin/content/posts/new`
- Edit: `/admin/content/posts/[id]`
- Admin-only, `noindex` preview: `/admin/content/posts/[id]/preview`
- Public hub: `/blog`
- Published article: `/blog/[slug]`

All Admin routes reuse Task 14 database-backed `ADMIN` authorization. Draft and unpublished records are never returned by the public slug query.

## Editorial workflow

1. Open Admin → Bài viết → Bài viết mới.
2. Write the title, excerpt and Markdown body; choose category and tags.
3. Review the generated slug and optionally select a ready Content image from the existing media library.
4. Save the draft and use **Xem trước**. Preview requires Admin authorization and is `noindex`.
5. Fill optional SEO title, meta description and canonical path. Article values are used as fallbacks.
6. Publish. The public route, index and sitemap are revalidated without a deployment.
7. Use **Gỡ xuất bản** to remove the article from public access and sitemap while retaining its data.

## Model and states

`content_posts` stores `DRAFT`, `PUBLISHED`, or `UNPUBLISHED`. `content_tags` and `content_post_tags` normalize tags. Category is a small validated enum-like key. `published_at` is set on first publication and retained across unpublishing. Published rows cannot be physically deleted from the UI; draft/unpublished deletion is explicit.

Slugs are lowercase ASCII, unique, URL-safe, capped at 120 characters, generated from Vietnamese titles, and manually editable. After publication they remain unchanged unless an Admin deliberately edits the field.

## Content and security

The editor stores Markdown. Supported primitives are headings, paragraphs, bold, italic, links, lists, quotes, inline code and images. Rendering uses React text nodes: raw HTML is not executed. Links only accept internal paths, fragments, `http(s)` and `mailto`; `javascript:` and `data:` are rendered as inert text.

Publishing requires title, valid unique slug, excerpt and body. Drafts may omit SEO fields. Excerpts, SEO descriptions and canonical paths have length/shape validation.

## SEO and freshness

Article metadata is generated server-side with title/description fallbacks, canonical and Open Graph article fields. Published pages emit `BlogPosting` JSON-LD with TOEICGym represented accurately as an Organization. The dynamic sitemap includes only published posts and their last-modified timestamps. Robots allow `/blog` and block `/admin/`; preview metadata also sets `noindex, nofollow`.

Create, edit, publish, unpublish and delete actions write concise events to the existing Admin audit log and trigger targeted revalidation for `/blog`, the article URL and `/sitemap.xml`.

## Media and future compatibility

Posts store nullable `cover_media_id`, a provider-independent foreign key into the existing `media_assets` abstraction. No R2 URL is stored in article data. Task 20 may replace the storage provider without changing the article schema. No external CMS, search service or paid SaaS was added.
