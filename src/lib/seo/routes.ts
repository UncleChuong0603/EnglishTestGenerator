// Route ownership stays in code; editors cannot turn a post into an arbitrary app route.
export const MANAGED_SEO_ROUTES: Record<string, string> = {
  "seo-toeic": "/toeic",
  "seo-online": "/luyen-thi-toeic-online",
  "seo-part5": "/toeic/part-5",
  "seo-part6": "/toeic/part-6",
  "seo-part7": "/toeic/part-7",
  "seo-word-form": "/toeic/part-5/word-form",
  "seo-tenses": "/toeic/part-5/thi-dong-tu",
  "seo-part5-practice": "/toeic/part-5/practice",
};

export const STATIC_PUBLIC_PATHS = [
  "/", "/toeic/listening", "/toeic/part-1", "/toeic/part-2", "/toeic/part-3", "/toeic/part-4",
  "/toeic/part-6/dien-cau-vao-doan-van", "/toeic/part-6/dien-tu-va-cum-tu", "/toeic/part-7/cau-hoi-suy-luan", "/toeic/part-7/paraphrase-tu-dong-nghia", "/toeic/part-7/doc-hieu-mot-doan-van", "/toeic/part-7/doc-hieu-hai-doan-van", "/toeic/part-7/doc-hieu-ba-van-ban",
  "/toeic/checklist-hoc-tuan", "/toeic/flashcards-tu-vung-cong-so", "/toeic/tu-vung", "/toeic/thang-diem", "/ve-toeic-gym", "/thi-thu-toeic-online", "/blog", "/blog/ngu-phap", "/pricing", "/try",
  "/diagnostic", "/challenge", "/challenge/part-5", "/support", "/privacy", "/terms",
] as const;

export function contentPath(slug: string) {
  return MANAGED_SEO_ROUTES[slug] ?? `/blog/${slug}`;
}

export function isManagedSeoSlug(slug: string) {
  return Object.hasOwn(MANAGED_SEO_ROUTES, slug);
}
