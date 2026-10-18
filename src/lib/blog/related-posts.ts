type Tag = { name: string; slug: string };

export type RelatedPostCandidate = {
  slug: string;
  title: string;
  category: string;
  targetTopic?: string | null;
  noindex?: boolean;
  publishedAt: Date | null;
  tags?: Tag[];
};

const STOP_WORDS = new Set(["cach", "cho", "cua", "dung", "hoc", "lam", "the", "tieng", "toeic", "trong", "voi"]);

function topicTokens(post: Pick<RelatedPostCandidate, "title" | "targetTopic">) {
  return new Set(`${post.title} ${post.targetTopic ?? ""}`
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 3 && !STOP_WORDS.has(token)));
}

/** Select contextually close, indexable articles instead of repeating the same newest cards everywhere. */
export function selectRelatedPosts<T extends RelatedPostCandidate>(
  current: RelatedPostCandidate,
  candidates: readonly T[],
  preferredSlugs: readonly string[] = [],
  limit = 3,
): T[] {
  const currentTokens = topicTokens(current);
  const currentTags = new Set(current.tags?.map(tag => tag.slug) ?? []);
  const preferredRank = new Map(preferredSlugs.map((slug, index) => [slug, preferredSlugs.length - index]));

  return candidates
    .filter(candidate => candidate.slug !== current.slug && !candidate.noindex)
    .map((candidate, originalIndex) => {
      const sharedTokens = [...topicTokens(candidate)].filter(token => currentTokens.has(token)).length;
      const sharedTags = candidate.tags?.filter(tag => currentTags.has(tag.slug)).length ?? 0;
      const score = (preferredRank.get(candidate.slug) ?? 0) * 1_000
        + (candidate.category === current.category ? 100 : 0)
        + sharedTags * 20
        + sharedTokens * 4;
      return { candidate, originalIndex, score };
    })
    .sort((a, b) => b.score - a.score
      || (b.candidate.publishedAt?.getTime() ?? 0) - (a.candidate.publishedAt?.getTime() ?? 0)
      || a.originalIndex - b.originalIndex)
    .slice(0, limit)
    .map(item => item.candidate);
}

