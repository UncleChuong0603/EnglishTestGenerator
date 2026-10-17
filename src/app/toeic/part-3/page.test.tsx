import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/public-header", () => ({ PublicHeader: ({ locale }: { locale: string }) => <header data-locale={locale}>Header</header> }));
vi.mock("@/components/public-footer", () => ({ PublicFooter: ({ locale }: { locale: string }) => <footer data-locale={locale}>Footer</footer> }));
vi.mock("@/components/seo/breadcrumb-trail", () => ({ BreadcrumbTrail: () => <nav>Breadcrumb</nav> }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/i18n/get-translations", () => ({ getCookieLanguage: vi.fn().mockResolvedValue("en") }));

import Page from "./page";

describe("TOEIC Part 3 guide page", () => {
  it("turns the sample conversation into a diagnosis-led listening path", async () => {
    const html = renderToStaticMarkup(await Page());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("39 câu được tổ chức như thế nào?");
    expect(html).toContain("13");
    expect(html).toContain("Biến ba câu hỏi thành ba ô thông tin");
    expect(html).toContain("Nếu sai theo kiểu này, hãy sửa như sau");
    expect(html).toContain("Dùng transcript sau khi đã thử bằng tai");
    expect(html).toContain('src="/seo/toeic-part-3-sample.mp3"');
    expect(html).toContain('href="/try#quick-practice"');
    expect(html).toContain('"@type":"LearningResource"');
    expect(html).toContain('"numberOfQuestions":3');
    expect(html.match(/data-locale="en"/g)).toHaveLength(2);
  });
});
