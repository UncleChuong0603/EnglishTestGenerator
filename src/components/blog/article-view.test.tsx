import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ArticleView } from "./article-view";

vi.mock("@/lib/blog/service", () => ({ readingMinutes: () => 1 }));

const date = new Date("2026-10-18T10:00:00.000Z");

describe("ArticleView search landing experience", () => {
  it("answers the search intent before offering practice and uses an exam-guide next step", () => {
    const html = renderToStaticMarkup(
      <ArticleView
        coverUrl={null}
        locale="vi"
        post={{
          slug: "thi-toeic-bao-lau-co-ket-qua",
          title: "Thi TOEIC bao lâu có kết quả?",
          excerpt: "Mốc trả kết quả theo hình thức thi.",
          content: "## Câu trả lời nhanh\n\nListening & Reading có mốc riêng.",
          category: "EXAM_TIPS",
          publishedAt: date,
          updatedAt: date,
          tags: [],
        }}
      />,
    );

    expect(html.indexOf("Câu trả lời nhanh")).toBeLessThan(html.indexOf("Làm thử 4 câu có lời giải"));
    expect(html).toContain("Làm bài đánh giá miễn phí");
    expect(html).toContain('href="/try"');
  });

  it("keeps contextual navigation accessible and responsive in English", () => {
    const related = ["one", "two", "three"].map((slug) => ({
      id: slug,
      slug,
      title: `Related ${slug}`,
      excerpt: "A related article",
      content: "## Lesson",
      category: "GRAMMAR",
      publishedAt: date,
    }));
    const html = renderToStaticMarkup(
      <ArticleView
        coverUrl={null}
        locale="en"
        post={{
          slug: "grammar-guide",
          title: "Grammar guide",
          excerpt: "A focused grammar explanation.",
          content: "## Direct answer\n\nUse the rule in context.",
          category: "GRAMMAR",
          publishedAt: date,
          updatedAt: date,
          tags: [],
        }}
        related={related}
      />,
    );

    expect(html).toContain('href="/ngu-phap"');
    expect(html).toContain('href="/toeic/part-5/practice"');
    expect(html).toContain("md:grid-cols-2 lg:grid-cols-3");
    expect(html).toContain("min-h-12");
    expect(html).toContain("focus-visible:outline-2");
  });
});
