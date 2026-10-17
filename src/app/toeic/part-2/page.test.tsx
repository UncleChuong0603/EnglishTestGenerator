import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/public-header", () => ({ PublicHeader: ({ locale }: { locale: string }) => <header data-locale={locale}>Header</header> }));
vi.mock("@/components/public-footer", () => ({ PublicFooter: ({ locale }: { locale: string }) => <footer data-locale={locale}>Footer</footer> }));
vi.mock("@/components/seo/breadcrumb-trail", () => ({ BreadcrumbTrail: () => <nav>Breadcrumb</nav> }));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/i18n/get-translations", () => ({ getCookieLanguage: vi.fn().mockResolvedValue("en") }));

import Page from "./page";

describe("TOEIC Part 2 guide page", () => {
  it("turns four samples into an intent-led listening path", async () => {
    const html = renderToStaticMarkup(await Page());

    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain("25 câu được tổ chức như thế nào?");
    expect(html).toContain("Đổi tín hiệu đầu câu thành ý định hội thoại");
    expect(html).toContain("Nghe trực tiếp trước, rồi mở rộng sang câu trả lời gián tiếp");
    expect(html).toContain("Nếu sai theo kiểu này, hãy sửa như sau");
    expect(html).toContain("Dùng transcript để gọi đúng tên quan hệ");
    expect(html).toContain('src="/seo/toeic-part-2-sample.mp3"');
    expect(html).toContain('src="/seo/toeic-part-2-undecided.mp3"');
    expect(html).toContain('src="/seo/toeic-part-2-ask-colleague.mp3"');
    expect(html).toContain('src="/seo/toeic-part-2-unavailable.mp3"');
    expect(html).toContain('href="/blog/toeic-part-2-cau-tra-loi-gian-tiep"');
    expect(html).toContain('"@type":"LearningResource"');
    expect(html.match(/"@type":"AudioObject"/g)).toHaveLength(4);
    expect(html).toContain('"numberOfQuestions":4');
    expect(html.match(/data-locale="en"/g)).toHaveLength(2);
  });
});
