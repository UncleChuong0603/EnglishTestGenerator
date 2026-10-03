import type { ReadingLongTailGuide } from "./reading-long-tail";
import { getSiteUrl } from "./site-url";
import { toeicGymOrganizationStructuredData } from "./site-structured-data";

export function readingGuideStructuredData(guide: ReadingLongTailGuide) {
  const base = getSiteUrl();
  const url = new URL(guide.path, base).toString();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    mainEntityOfPage: url,
    headline: guide.title,
    description: guide.description,
    image: `${base}/brand/toeic-gym-social.png`,
    inLanguage: "vi",
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    author: {
      "@type": "Organization",
      "@id": `${base}#editorial-team`,
      name: "TOEIC GYM Editorial",
      url: `${base}/ve-toeic-gym`,
    },
    publisher: toeicGymOrganizationStructuredData(base),
  };
}
