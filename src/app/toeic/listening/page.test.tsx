import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/public-header", () => ({
  PublicHeader: ({ locale }: { locale: string }) => <header data-locale={locale}>Header</header>,
}));
vi.mock("@/components/public-footer", () => ({
  PublicFooter: ({ locale }: { locale: string }) => <footer data-locale={locale}>Footer</footer>,
}));
vi.mock("@/components/seo/breadcrumb-trail", () => ({
  BreadcrumbTrail: () => <nav>Breadcrumb</nav>,
}));
vi.mock("@/lib/auth/session", () => ({
  getCurrentUser: vi.fn().mockResolvedValue(null),
}));
vi.mock("@/lib/i18n/get-translations", () => ({
  getCookieLanguage: vi.fn().mockResolvedValue("en"),
}));

import Page from "./page";

describe("TOEIC Listening hub page", () => {
  it("turns the format overview into a diagnosis-led public practice path", async () => {
    const html = renderToStaticMarkup(await Page());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("100 câu Listening được chia như thế nào?");
    expect(html).toContain("Phiên luyện 20 phút");
    expect(html).toContain("Mẫu nhật ký sửa lỗi");
    for (const part of [1, 2, 3, 4]) {
      expect(html).toContain(`href="/toeic/part-${part}"`);
    }
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"numberOfItems":4');
    expect(html).toContain('href="/try#quick-practice"');
    expect(html).toContain("không phải đề hoặc điểm TOEIC chính thức");
    expect(html.match(/data-locale="en"/g)).toHaveLength(2);
  });
});
