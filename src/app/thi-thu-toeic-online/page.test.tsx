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

describe("online TOEIC mock test landing page", () => {
  it("helps anonymous learners choose a test and act on the result", async () => {
    const html = renderToStaticMarkup(await Page());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("So sánh 4 chế độ trước khi bắt đầu");
    expect(html).toContain("Listening Mock");
    expect(html).toContain("Reading Mock");
    expect(html).toContain("Full Mock");
    expect(html).toContain("20 phút sau khi nộp");
    expect(html).toContain('href="/try#quick-practice"');
    expect(html).toContain('href="/diagnostic"');
    expect(html).toContain('href="/toeic/thang-diem"');
    expect(html).toContain("không phải đề thi chính thức");
    expect(html).toContain('"@type":"CollectionPage"');
    expect(html).toContain('"numberOfItems":4');
    expect(html.match(/data-locale="en"/g)).toHaveLength(2);
  });
});
