import { describe, expect, it } from "vitest";
import { isToeicGymAuthor } from "./article-author";
import { articleStructuredData } from "./article-structured-data";

describe("article structured data", () => {
  it("connects TOEIC GYM articles to the identified publisher", () => {
    const data = articleStructuredData({
      base: "https://toeicgym.net",
      url: "https://toeicgym.net/blog/example",
      title: "Bài mẫu",
      description: "Mô tả bài mẫu",
      publishedAt: new Date("2026-09-20T00:00:00.000Z"),
      updatedAt: new Date("2026-10-02T00:00:00.000Z"),
      image: "https://toeicgym.net/blog/example.webp",
      authorName: "TOEICGym Editorial",
      breadcrumbs: [
        { name: "Kiến thức TOEIC", url: "https://toeicgym.net/blog" },
        { name: "Bài mẫu", url: "https://toeicgym.net/blog/example" },
      ],
    });

    const [article, breadcrumb, organization] = data["@graph"];
    expect(article).toMatchObject({
      "@type": "BlogPosting",
      "@id": "https://toeicgym.net/blog/example#article",
      mainEntityOfPage: "https://toeicgym.net/blog/example",
      dateModified: "2026-10-02T00:00:00.000Z",
      author: { "@id": "https://toeicgym.net#organization" },
      publisher: { "@id": "https://toeicgym.net#organization" },
    });
    expect(breadcrumb).toMatchObject({ "@type": "BreadcrumbList" });
    expect(organization).toMatchObject({
      "@type": "Organization",
      "@id": "https://toeicgym.net#organization",
      url: "https://toeicgym.net",
    });
  });

  it("keeps a named human author distinct from the publisher", () => {
    expect(isToeicGymAuthor("TOEIC GYM")).toBe(true);
    expect(isToeicGymAuthor("TOEICGym Editorial")).toBe(true);
    expect(isToeicGymAuthor("Lan Nguyen")).toBe(false);

    const data = articleStructuredData({
      base: "https://toeicgym.net",
      url: "https://toeicgym.net/blog/example",
      title: "Bài mẫu",
      description: "Mô tả bài mẫu",
      publishedAt: null,
      updatedAt: new Date("2026-10-02T00:00:00.000Z"),
      image: null,
      authorName: "Lan Nguyen",
      breadcrumbs: [],
    });
    expect(data["@graph"][0]).toMatchObject({ author: { "@type": "Person", name: "Lan Nguyen" } });
  });
});
