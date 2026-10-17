import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/public-header", () => ({ PublicHeader: ({ locale }: { locale: string }) => <header data-locale={locale}>Header</header> }));
vi.mock("@/components/public-footer", () => ({ PublicFooter: ({ locale }: { locale: string }) => <footer data-locale={locale}>Footer</footer> }));
vi.mock("@/components/seo/breadcrumb-trail", () => ({ BreadcrumbTrail: () => <nav>Breadcrumb</nav> }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/i18n/get-translations", () => ({ getCookieLanguage: vi.fn().mockResolvedValue("en") }));

import Page from "./page";

describe("TOEIC Part 4 guide page", () => {
  it("turns the sample talk into a role-based listening path", async () => {
    const html = renderToStaticMarkup(await Page());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("30 câu được tổ chức như thế nào?");
    expect(html).toContain("10");
    expect(html).toContain("Nghe loại bài nói trước, rồi mới giữ chi tiết");
    expect(html).toContain("Biến ba câu hỏi thành ba nhiệm vụ");
    expect(html).toContain("Nếu sai theo kiểu này, hãy sửa như sau");
    expect(html).toContain("Dùng transcript để gắn vai trò cho thông tin");
    expect(html).toContain('src="/seo/toeic-part-4-sample.mp3"');
    expect(html).toContain('href="/blog/toeic-part-4-cau-hoi-bang-bieu"');
    expect(html).toContain('"@type":"LearningResource"');
    expect(html).toContain('"numberOfQuestions":3');
    expect(html.match(/data-locale="en"/g)).toHaveLength(2);
  });
});
