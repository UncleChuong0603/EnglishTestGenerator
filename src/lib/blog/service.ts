import "server-only";
import { existsSync } from "node:fs";
import { resolve, sep } from "node:path";
import { cache } from "react";
import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { adminAuditLogs, contentPosts, contentPostTags, contentTags, mediaAssets } from "@/db/schema";
import { CONTENT_ORIGINS, isEditorialVisible, POST_CATEGORIES, slugify, validatePost, type PostCategory, type PostInput, type PostStatus } from "./core";
import { createMediaStorage } from "@/lib/media/storage";
import { EDITORIAL_POSTS } from "./editorial";
import { MANAGED_SEO_DOCUMENTS } from "@/lib/seo/managed-content";
import { contentPath, isManagedSeoSlug } from "@/lib/seo/routes";
import { checkPublication, validRedirectDestination, type PublicationPeer } from "./publication-quality";

export class BlogAdminError extends Error { constructor(public code: string) { super(code); } }
type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Row = typeof contentPosts.$inferSelect;
const library = [...EDITORIAL_POSTS, ...MANAGED_SEO_DOCUMENTS];
export function getEditableEditorialPost(slug: string) { return library.find(post => post.slug === slug) ?? null; }
// Fail closed: a DB outage must not restore archived or unpublished content.
const loadRows = cache(async () => db.select().from(contentPosts).orderBy(desc(contentPosts.updatedAt)));
function visibleLibrary(rows: { slug: string; status: string }[]) {
  const statuses = new Map(rows.map(row => [row.slug, row.status as PostStatus]));
  return library.filter(post => isEditorialVisible(statuses.get(post.slug)));
}
export async function listAdminPosts() {
  const rows = await loadRows();
  return [...rows.map(row => ({ ...row, source: "cms" as const })),
    ...library.filter(post => !rows.some(row => row.slug === post.slug)).map(row => ({ ...row, source: "editorial" as const }))];
}
export async function listAdminPostTags() {
  return db.select({ postId: contentPostTags.postId, name: contentTags.name }).from(contentPostTags).innerJoin(contentTags, eq(contentPostTags.tagId, contentTags.id));
}
export async function listPublishedPosts(limit = 200) {
  const rows = await loadRows();
  return [...rows.filter(post => post.status === "PUBLISHED"), ...visibleLibrary(rows)].filter(post => !isManagedSeoSlug(post.slug))
    .sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0)).slice(0, limit);
}
export async function getPostById(id: string) {
  const post = (await db.select().from(contentPosts).where(eq(contentPosts.id, id)).limit(1))[0];
  return post ? { ...post, tags: await tagsFor(post.id) } : null;
}
export const getPublishedPost = cache(async (slug: string) => {
  const post = (await loadRows()).find(row => row.slug === slug);
  if (post?.status === "PUBLISHED") return { ...post, tags: await tagsFor(post.id) };
  return isEditorialVisible(post?.status as PostStatus | undefined) ? getEditableEditorialPost(slug) : null;
});
export async function getPostRedirect(slug: string): Promise<string | null> {
  const row = (await loadRows()).find(row => row.slug === slug);
  return row?.status === "ARCHIVED" ? row.redirectPath : null;
}
async function tagsFor(postId: string) {
  return db.select({ name: contentTags.name, slug: contentTags.slug }).from(contentPostTags).innerJoin(contentTags, eq(contentPostTags.tagId, contentTags.id)).where(eq(contentPostTags.postId, postId));
}
export async function listReadyCoverImages() {
  return db.select({ id: mediaAssets.id, storageKey: mediaAssets.storageKey, imageWidth: mediaAssets.imageWidth, imageHeight: mediaAssets.imageHeight }).from(mediaAssets)
    .where(and(eq(mediaAssets.kind, "IMAGE"), eq(mediaAssets.status, "READY"), eq(mediaAssets.accessScope, "CONTENT"))).orderBy(desc(mediaAssets.createdAt)).limit(100);
}
export async function listPostSuggestions(id?: string) {
  const rows = await loadRows();
  return [...rows.filter(row => row.status === "PUBLISHED" && row.id !== id), ...visibleLibrary(rows)]
    .filter(row => row.slug !== rows.find(post => post.id === id)?.slug)
    .map(({ id, title, slug, category, seoTitle, seoDescription, canonicalPath, targetTopic, searchIntent }) =>
      ({ id, title, slug, category, seoTitle, seoDescription, canonicalPath, targetTopic, searchIntent }));
}
async function lockPublication(tx: Tx) { await tx.execute(sql.raw("select pg_advisory_xact_lock(80731)")); }
async function publicationPeers(tx: Tx, exceptId: string, replacingSlug: string): Promise<PublicationPeer[]> {
  const rows = await tx.select().from(contentPosts);
  return [...rows.filter(row => row.id !== exceptId && row.status === "PUBLISHED"), ...visibleLibrary(rows).filter(post => post.slug !== replacingSlug)];
}
function toInput(post: Row): PostInput {
  return { title: post.title, slug: post.slug, excerpt: post.excerpt, content: post.content, category: post.category as PostCategory,
    seoTitle: post.seoTitle ?? undefined, seoDescription: post.seoDescription ?? undefined, canonicalPath: post.canonicalPath ?? undefined,
    coverMediaId: post.coverMediaId ?? undefined, targetTopic: post.targetTopic ?? undefined, searchIntent: post.searchIntent ?? undefined, noindex: post.noindex, tags: [] };
}
async function assertPublishable(tx: Tx, input: PostInput, id: string) {
  const result = checkPublication(input, await publicationPeers(tx, id, input.slug));
  result.errors.push(...missingLocalImages(input.content));
  if (result.errors.length) throw new BlogAdminError(result.errors.join(", "));
  if (input.coverMediaId) {
    const cover = (await tx.select({ id: mediaAssets.id }).from(mediaAssets).where(and(eq(mediaAssets.id, input.coverMediaId), eq(mediaAssets.kind, "IMAGE"), eq(mediaAssets.status, "READY"), eq(mediaAssets.accessScope, "CONTENT"))))[0];
    if (!cover) throw new BlogAdminError("COVER_NOT_READY");
  }
}
export async function getPublicationQuality(id: string) {
  return db.transaction(async tx => {
    const post = (await tx.select().from(contentPosts).where(eq(contentPosts.id, id)))[0];
    if (!post) return null;
    const result = checkPublication(toInput(post), await publicationPeers(tx, id, post.slug));
    result.errors.push(...missingLocalImages(post.content));
    return result;
  });
}
function missingLocalImages(content: string) {
  const root = resolve("public");
  return [...content.matchAll(/!\[[^\]]*\]\((\/[^)]+)\)/g)]
    .map(([, source]) => ({ source, file: resolve(root, `.${source}`) }))
    .filter(({ file }) => !file.startsWith(root + sep) || !existsSync(file))
    .map(({ source }) => `IMAGE_NOT_FOUND:${source}`);
}
async function replaceTags(tx: Tx, postId: string, names: string[]) {
  await tx.delete(contentPostTags).where(eq(contentPostTags.postId, postId));
  const used = new Set<string>();
  for (const name of [...new Set(names.map(x => x.trim()).filter(Boolean))].slice(0, 12)) {
    const slug = slugify(name); if (!slug || used.has(slug)) continue; used.add(slug);
    const [tag] = await tx.insert(contentTags).values({ name, slug }).onConflictDoUpdate({ target: contentTags.slug, set: { name } }).returning({ id: contentTags.id });
    await tx.insert(contentPostTags).values({ postId, tagId: tag.id });
  }
}
export async function savePost(actorId: string, input: PostInput, id?: string) {
  const data = { ...input, title: input.title.trim(), slug: input.slug.trim(), content: input.content.trim(), excerpt: input.excerpt.trim() };
  const errors = validatePost(data); if (errors.length) throw new BlogAdminError(errors.join(", "));
  if (!POST_CATEGORIES.includes(data.category)) throw new BlogAdminError("CATEGORY_INVALID");
  if (data.contentOrigin && !CONTENT_ORIGINS.includes(data.contentOrigin)) throw new BlogAdminError("ORIGIN_INVALID");
  const values = { title: data.title, slug: data.slug, excerpt: data.excerpt, content: data.content, category: data.category,
    seoTitle: data.seoTitle?.trim() || null, seoDescription: data.seoDescription?.trim() || null, canonicalPath: data.canonicalPath?.trim() || null,
    coverMediaId: data.coverMediaId || null, coverAlt: data.coverAlt?.trim() || null, socialTitle: data.socialTitle?.trim() || null, socialDescription: data.socialDescription?.trim() || null,
    authorName: data.authorName?.trim() || null, targetTopic: data.targetTopic?.trim() || null, searchIntent: data.searchIntent?.trim() || null, noindex: Boolean(data.noindex) };
  try {
    return await db.transaction(async tx => {
      await lockPublication(tx); let postId = id;
      const current = id ? (await tx.select().from(contentPosts).where(eq(contentPosts.id, id)))[0] : undefined;
      if (id && !current) throw new BlogAdminError("NOT_FOUND");
      if (current) {
        if ((current.publishedAt || isManagedSeoSlug(current.slug)) && current.slug !== data.slug) throw new BlogAdminError("PUBLISHED_SLUG_LOCKED");
        if (current.status === "PUBLISHED") await assertPublishable(tx, data, current.id);
        const previousTags = (await tx.select({ name: contentTags.name }).from(contentPostTags)
          .innerJoin(contentTags, eq(contentPostTags.tagId, contentTags.id)).where(eq(contentPostTags.postId, current.id)))
          .map(tag => tag.name).sort();
        const nextTags = [...new Set(data.tags.map(tag => tag.trim()).filter(Boolean))].slice(0, 12).sort();
        const changed = Object.entries(values).some(([key, value]) => current[key as keyof Row] !== value)
          || JSON.stringify(previousTags) !== JSON.stringify(nextTags);
        await tx.update(contentPosts).set({ ...values, contentOrigin: data.contentOrigin ?? current.contentOrigin, updatedBy: actorId,
          updatedAt: changed ? new Date() : current.updatedAt, lastReviewedAt: current.status === "PUBLISHED" ? new Date() : current.lastReviewedAt }).where(eq(contentPosts.id, current.id));
      } else {
        [{ id: postId }] = await tx.insert(contentPosts).values({ ...values, contentOrigin: data.contentOrigin ?? "HUMAN", createdBy: actorId, updatedBy: actorId }).returning({ id: contentPosts.id });
      }
      await replaceTags(tx, postId!, data.tags);
      await tx.insert(adminAuditLogs).values({ actorUserId: actorId, action: id ? "SEO_POST_UPDATED" : "SEO_POST_CREATED", metadata: { postId, slug: data.slug, previous: current ?? null } });
      return postId!;
    });
  } catch (error) {
    const code = error as { code?: string; cause?: { code?: string } };
    if (code.code === "23505" || code.cause?.code === "23505") throw new BlogAdminError("SLUG_TAKEN"); throw error;
  }
}
async function assertNoIncomingRedirect(tx: Tx, slug: string) {
  const rows = await tx.select({ id: contentPosts.id }).from(contentPosts).where(and(eq(contentPosts.status, "ARCHIVED"), eq(contentPosts.redirectPath, contentPath(slug))));
  if (rows.length) throw new BlogAdminError("REDIRECT_TARGET_IN_USE");
}
export async function setPostPublished(actorId: string, id: string, publish: boolean) {
  await db.transaction(async tx => {
    await lockPublication(tx);
    const post = (await tx.select().from(contentPosts).where(eq(contentPosts.id, id)))[0]; if (!post) throw new BlogAdminError("NOT_FOUND");
    if (publish) await assertPublishable(tx, toInput(post), id); else await assertNoIncomingRedirect(tx, post.slug);
    await tx.update(contentPosts).set({ status: publish ? "PUBLISHED" : "UNPUBLISHED", redirectPath: null,
      publishedAt: publish ? (post.publishedAt ?? new Date()) : post.publishedAt, lastReviewedAt: publish ? new Date() : post.lastReviewedAt, updatedBy: actorId }).where(eq(contentPosts.id, id));
    await tx.insert(adminAuditLogs).values({ actorUserId: actorId, action: publish ? "SEO_POST_PUBLISHED" : "SEO_POST_UNPUBLISHED",
      metadata: { postId: id, slug: post.slug, qualityGate: publish ? "PASS" : null, previousStatus: post.status } });
  });
}
export async function archivePost(actorId: string, id: string, destination?: string) {
  await db.transaction(async tx => {
    await lockPublication(tx);
    const post = (await tx.select().from(contentPosts).where(eq(contentPosts.id, id)))[0]; if (!post) throw new BlogAdminError("NOT_FOUND");
    await assertNoIncomingRedirect(tx, post.slug);
    const target = destination?.trim() || null;
    if (target && !validRedirectDestination(target, post.slug, await publicationPeers(tx, id, post.slug))) throw new BlogAdminError("REDIRECT_DESTINATION_INVALID");
    await tx.update(contentPosts).set({ status: "ARCHIVED", redirectPath: target, updatedBy: actorId }).where(eq(contentPosts.id, id));
    await tx.insert(adminAuditLogs).values({ actorUserId: actorId, action: "SEO_POST_ARCHIVED", metadata: { postId: id, slug: post.slug, redirectPath: target, previousStatus: post.status } });
  });
}
export async function deleteDraft(actorId: string, id: string) {
  await db.transaction(async tx => {
    await lockPublication(tx);
    const post = (await tx.select().from(contentPosts).where(eq(contentPosts.id, id)))[0];
    if (!post || post.publishedAt || getEditableEditorialPost(post.slug)) throw new BlogAdminError("ARCHIVE_INSTEAD_OF_DELETE");
    const deleted = await tx.delete(contentPosts).where(and(eq(contentPosts.id, id), inArray(contentPosts.status, ["DRAFT", "UNPUBLISHED"]))).returning({ id: contentPosts.id });
    if (!deleted.length) throw new BlogAdminError("PUBLISHED_DELETE_FORBIDDEN");
    await tx.insert(adminAuditLogs).values({ actorUserId: actorId, action: "SEO_POST_DELETED", metadata: { postId: id, slug: post.slug } });
  });
}
export async function publishedSitemapRows() {
  const rows = await loadRows();
  return [...rows.filter(row => row.status === "PUBLISHED"), ...visibleLibrary(rows)]
    .filter(row => !row.noindex && (!row.canonicalPath || row.canonicalPath === contentPath(row.slug)))
    .map(row => ({ slug: row.slug, path: contentPath(row.slug), updatedAt: row.updatedAt }));
}
export function readingMinutes(content: string) { return Math.max(1, Math.ceil(content.trim().split(/\s+/).length / 220)); }
export async function coverUrl(mediaId: string | null) {
  if (!mediaId) return null;
  const asset = (await db.select({ key: mediaAssets.storageKey }).from(mediaAssets).where(and(eq(mediaAssets.id, mediaId), eq(mediaAssets.kind, "IMAGE"), eq(mediaAssets.status, "READY"), eq(mediaAssets.accessScope, "CONTENT"))).limit(1))[0];
  return asset ? createMediaStorage().createReadUrl(asset.key, 3600) : null;
}
