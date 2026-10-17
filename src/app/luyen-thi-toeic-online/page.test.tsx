import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/public-header", () => ({
  PublicHeader: ({ locale }: { locale: string }) => <header data-locale={locale}>Header</header>,
}));
vi.mock("@/components/public-footer", () => ({
  PublicFooter: ({ locale }: { locale: string }) => <footer data-locale={locale}>Footer</footer>,
}));
vi.mock("@/components/seo/breadcrumb-trail", () => ({ BreadcrumbTrail: () => <nav>Breadcrumb</nav> }));
vi.mock("@/components/seo/managed-page", () => ({ managedMetadata: vi.fn() }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/i18n/get-translations", () => ({ getCookieLanguage: vi.fn().mockResolvedValue("en") }));
vi.mock("@/lib/blog/service", () => ({
  getPostRedirect: vi.fn().mockResolvedValue(null),
  getPublishedPost: vi.fn().mockResolvedValue({
    title: "Luyện thi TOEIC online: bắt đầu bằng bài ngắn, học từ lỗi sai",
    excerpt: "Một lộ trình học từ dữ liệu thật.",
    content: "## Nội dung CMS\n\nHướng dẫn biên tập vẫn hiển thị.",
  }),
}));

import Page from "./page";

describe("online TOEIC study hub page", () => {
  it("adds a stable learner journey around managed editorial content", async () => {
    const html = renderToStaticMarkup(await Page());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("Bạn đang ở tình huống nào?");
    expect(html).toContain("Vòng học 4 bước");
    expect(html).toContain("Ba buổi vẫn đủ để tạo một vòng phản hồi");
    expect(html).toContain("Bốn tín hiệu tốt hơn một con số tổng");
    expect(html).toContain("Hướng dẫn biên tập vẫn hiển thị");
    expect(html).toContain('href="/diagnostic"');
    expect(html).toContain('href="/toeic/checklist-hoc-tuan"');
    expect(html).toContain('href="/thi-thu-toeic-online"');
    expect(html).toContain('"@type":"WebPage"');
    expect(html).toContain('"numberOfItems":4');
    expect(html.match(/data-locale="en"/g)).toHaveLength(2);
  });
});
