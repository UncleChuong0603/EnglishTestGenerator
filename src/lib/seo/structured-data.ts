import { getSiteUrl } from "./site-url";

export type BreadcrumbItem = { name: string; path: string };

export function breadcrumbStructuredData(items: readonly BreadcrumbItem[]) {
  const base = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: new URL(item.path, base).toString(),
    })),
  };
}

export function serializeStructuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
