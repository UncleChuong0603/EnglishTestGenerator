import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/public-header", () => ({ PublicHeader: ({ locale }: { locale: string }) => <header data-locale={locale}>Header</header> }));
vi.mock("@/components/public-footer", () => ({ PublicFooter: ({ locale }: { locale: string }) => <footer data-locale={locale}>Footer</footer> }));
vi.mock("@/components/seo/breadcrumb-trail", () => ({ BreadcrumbTrail: () => <nav>Breadcrumb</nav> }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/i18n/get-translations", () => ({ getCookieLanguage: vi.fn().mockResolvedValue("en") }));

import Page from "./page";

describe("TOEIC Part 1 guide page", () => {
  it("turns the sample photograph into an evidence-led listening path", async () => {
    const html = renderToStaticMarkup(await Page());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("6 câu được tổ chức như thế nào?");
    expect(html).toContain("Quét ảnh theo bốn lớp bằng chứng");
    expect(html).toContain("Nếu sai theo kiểu này, hãy sửa như sau");
    expect(html).toContain("Dùng transcript để gọi đúng tên lỗi");
    expect(html).toContain("%2Fseo%2Ftoeic-part-1-office-folders.webp");
    expect(html).toContain('src="/seo/toeic-part-1-sample.mp3"');
    expect(html).toContain('href="/blog/meo-lam-toeic-part-1-mo-ta-tranh"');
    expect(html).toContain('"@type":"LearningResource"');
    expect(html).toContain('"@type":"ImageObject"');
    expect(html).toContain('"numberOfQuestions":1');
    expect(html.match(/data-locale="en"/g)).toHaveLength(2);
  });
});
