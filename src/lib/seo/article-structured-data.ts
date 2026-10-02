import { toeicGymOrganizationStructuredData } from "./site-structured-data";
import { isToeicGymAuthor } from "./article-author";

export type ArticleBreadcrumb = {
  name: string;
  url: string;
};

type ArticleStructuredDataInput = {
  base: string;
  url: string;
  title: string;
  description: string;
  publishedAt: Date | null;
  updatedAt: Date;
  image: string | null;
  authorName?: string | null;
  breadcrumbs: readonly ArticleBreadcrumb[];
};

export function articleStructuredData(input: ArticleStructuredDataInput) {
  const organizationId = `${input.base}#organization`;
  const author = isToeicGymAuthor(input.authorName)
    ? { "@id": organizationId }
    : { "@type": "Person", name: input.authorName };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${input.url}#article`,
        mainEntityOfPage: input.url,
        headline: input.title,
        description: input.description,
        inLanguage: "vi",
        datePublished: input.publishedAt?.toISOString(),
        dateModified: input.updatedAt.toISOString(),
        url: input.url,
        image: input.image,
        author,
        publisher: { "@id": organizationId },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: input.breadcrumbs.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          item: item.url,
        })),
      },
      toeicGymOrganizationStructuredData(input.base),
    ],
  };
}
