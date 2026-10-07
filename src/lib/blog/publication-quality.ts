import { isValidSlug, safeHref, validatePost, type PostInput } from "./core";
import { contentPath, MANAGED_SEO_ROUTES, STATIC_PUBLIC_PATHS } from "@/lib/seo/routes";
import { practiceForSlug } from "@/lib/seo/mini-practice";

export type PublicationPeer = {
  slug: string;
  title: string;
  noindex?: boolean;
  canonicalPath?: string | null;
  targetTopic?: string | null;
  searchIntent?: string | null;
};

export type PublicationQuality = { errors: string[]; warnings: string[] };

const publicRoutes = new Set<string>(STATIC_PUBLIC_PATHS);
const linkableRoutes = new Set<string>([
  ...STATIC_PUBLIC_PATHS,
  ...Object.values(MANAGED_SEO_ROUTES),
  // This authenticated practice destination is intentionally noindex, but it
  // is still a valid next step from the public TOEIC landing page.
  "/full-mock",
]);

const normalize = (value: string) => value.normalize("NFKC").trim().toLocaleLowerCase("vi-VN").replace(/\s+/g, " ");
const canonicalOf = (post: PublicationPeer) => post.canonicalPath || contentPath(post.slug);

export function validRedirectDestination(path: string, sourceSlug: string, peers: PublicationPeer[]): boolean {
  return path !== contentPath(sourceSlug) && (path === "/" || /^\/(?!\/)[a-z0-9/-]+$/.test(path)) &&
    (publicRoutes.has(path) || peers.some((peer) => !peer.noindex && contentPath(peer.slug) === path));
}

/** A conservative pre-publication check. Editorial judgment still belongs in the content itself. */
export function checkPublication(input: PostInput, peers: PublicationPeer[]): PublicationQuality {
  const errors = validatePost(input, true);
  const warnings: string[] = [];
  const self = contentPath(input.slug);
  const canonical = input.canonicalPath || self;
  if (publicRoutes.has(self)) errors.push("RESERVED_ROUTE");
  if (input.canonicalPath && canonical !== self) errors.push("CANONICAL_NOT_SELF");
  if (peers.some((peer) => peer.slug === input.slug)) errors.push("SLUG_TAKEN");
  if (peers.some((peer) => canonicalOf(peer) === canonical)) errors.push("CANONICAL_COLLISION");
  if (peers.some((peer) => normalize(peer.title) === normalize(input.title))) errors.push("TITLE_DUPLICATE");
  if (input.targetTopic && input.searchIntent && peers.some((peer) =>
    peer.targetTopic && peer.searchIntent && normalize(peer.targetTopic) === normalize(input.targetTopic!) && normalize(peer.searchIntent) === normalize(input.searchIntent!))) {
    errors.push("SEARCH_INTENT_DUPLICATE");
  }
  if (/^#\s+/m.test(input.content)) errors.push("SECOND_H1");
  if (!/^##\s+\S/m.test(input.content)) warnings.push("NO_SECTION_HEADINGS");
  if (/\b(?:todo|lorem ipsum|placeholder)\b/i.test(input.content)) errors.push("PLACEHOLDER_CONTENT");
  if (/<\/?[a-z][^>]*>/i.test(input.content) || (input.content.match(/```/g)?.length ?? 0) % 2) errors.push("UNSUPPORTED_OR_BROKEN_MARKUP");
  if (/\uFFFD|Ã[\u0080-\u00ff]|Â[\u0080-\u00ff]/.test(`${input.title} ${input.content}`)) errors.push("TEXT_ENCODING_INVALID");
  if (peers.some(peer => "content" in peer && typeof peer.content === "string" && normalize(peer.content) === normalize(input.content))) errors.push("DUPLICATE_CONTENT");
  if (/(?:official\s+(?:ets|iig)|(?:ets|iig)\s+(?:official|endorsed)|(?:đề|câu hỏi)\s+(?:gốc|chính thức)\s+(?:ets|iig))/i.test(`${input.title} ${input.content}`)) errors.push("COPYRIGHT_OR_ENDORSEMENT_RISK");
  if (/(?:tăng|đạt|cam kết|đảm bảo|improve|guarantee)[^.!?\n]{0,70}(?:\d{2,4}\s*(?:điểm|points)|\d+\s*%)/i.test(`${input.title} ${input.excerpt} ${input.content}`)) errors.push("UNSUPPORTED_SCORE_CLAIM");
  if (/(?:full\s*mock|thi\s*thử\s*đầy\s*đủ)[^.!?\n]{0,40}(?:miễn\s*phí|không\s*cần\s*đăng\s*nhập)/i.test(`${input.title} ${input.excerpt} ${input.content}`)) errors.push("UNAVAILABLE_FEATURE_CLAIM");

  const known = new Set([...linkableRoutes, ...peers.map((peer) => contentPath(peer.slug)), self]);
  const links = [...input.content.matchAll(/(?<!!)\[[^\]]+\]\(([^)]+)\)/g)].map((match) => match[1].trim().split(/\s+['"]/)[0]);
  for (const [, alt, source] of input.content.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)) {
    if (!alt.trim() || !source.startsWith("/") || source.startsWith("//") || /[?#]/.test(source) || !safeHref(source)) {
      errors.push("IMAGE_REFERENCE_INVALID");
    }
  }
  for (const href of links) {
    if (!safeHref(href)) { errors.push("UNSAFE_LINK"); continue; }
    if (href.startsWith("#")) { errors.push("UNSUPPORTED_ANCHOR_REFERENCE"); continue; }
    const localHref = /^https?:\/\/(?:www\.)?toeicgym\.net(?:\/|$)/i.test(href) ? new URL(href).pathname + new URL(href).hash : href;
    if (!localHref.startsWith("/") || localHref.startsWith("//")) continue;
    const path = localHref.split(/[?#]/, 1)[0].replace(/\/$/, "") || "/";
    if (!known.has(path) && !(path.startsWith("/blog/") && isValidSlug(path.slice(6)) && peers.some((peer) => peer.slug === path.slice(6)))) errors.push(`BROKEN_INTERNAL_LINK:${path}`);
  }
  for (const question of practiceForSlug(input.slug)) {
    if (question.origin !== "TOEICGYM_ORIGINAL" || question.options.length !== 4 || new Set(question.options).size !== 4 ||
      !Number.isInteger(question.answer) || question.answer < 0 || question.answer > 3 || !question.explanation.trim() || question.distractors.some(reason => !reason.trim())) {
      errors.push(`PRACTICE_ANSWER_INVALID:${question.id}`);
    }
  }
  if (!links.some((href) => href.startsWith("/"))) warnings.push("NO_INTERNAL_LINKS");
  if (!input.seoDescription?.trim()) warnings.push("META_DESCRIPTION_FALLBACK");
  if (!input.coverMediaId) warnings.push("NO_COVER_IMAGE");
  return { errors: [...new Set(errors)], warnings: [...new Set(warnings)] };
}
