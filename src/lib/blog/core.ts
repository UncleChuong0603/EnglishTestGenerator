export const POST_STATUSES = ["DRAFT", "PUBLISHED", "UNPUBLISHED"] as const;
export const POST_CATEGORIES = ["TOEIC_STRATEGY", "LISTENING", "READING", "GRAMMAR", "VOCABULARY", "STUDY_PLAN", "EXAM_TIPS"] as const;
export type PostStatus = (typeof POST_STATUSES)[number];
export type PostCategory = (typeof POST_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<PostCategory, { vi: string; en: string }> = {
  TOEIC_STRATEGY: { vi: "Chiến lược TOEIC", en: "TOEIC Strategy" }, LISTENING: { vi: "Listening", en: "Listening" },
  READING: { vi: "Reading", en: "Reading" }, GRAMMAR: { vi: "Ngữ pháp", en: "Grammar" },
  VOCABULARY: { vi: "Từ vựng", en: "Vocabulary" }, STUDY_PLAN: { vi: "Kế hoạch học", en: "Study Plan" },
  EXAM_TIPS: { vi: "Mẹo thi", en: "Exam Tips" },
};

export function slugify(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D")
    .toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}
export function isValidSlug(value: string) { return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) && value.length <= 120; }
export function safeHref(value: string) {
  const href = value.trim();
  return (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#") || /^https?:\/\//i.test(href) || /^mailto:/i.test(href) ? href : null;
}
export const STATUS_LABELS: Record<PostStatus,string> = { DRAFT:"Bản nháp", PUBLISHED:"Đã xuất bản", UNPUBLISHED:"Chưa xuất bản" };
export function validCanonical(path:string) { return !path || /^\/(?!\/)[a-z0-9/_-]*$/.test(path); }
export function validatePost(input: PostInput, publishing = false) {
  const errors: string[] = [];
  if (!input.title.trim()) errors.push("TITLE_REQUIRED");
  if (!isValidSlug(input.slug)) errors.push("SLUG_INVALID");
  if (input.excerpt.length > 320) errors.push("EXCERPT_TOO_LONG");
  if (input.canonicalPath && !validCanonical(input.canonicalPath)) errors.push("CANONICAL_PATH_INVALID");
  if (publishing && !input.content.trim()) errors.push("CONTENT_REQUIRED");
  if (publishing && !input.excerpt.trim()) errors.push("EXCERPT_REQUIRED");
  return errors;
}
export type PostInput = { title: string; slug: string; excerpt: string; content: string; category: PostCategory; seoTitle?: string; seoDescription?: string; canonicalPath?: string; coverMediaId?: string; coverAlt?: string; socialTitle?: string; socialDescription?: string; authorName?: string; targetTopic?: string; searchIntent?: string; noindex?: boolean; tags: string[] };
