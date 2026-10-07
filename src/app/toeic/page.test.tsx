import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/challenge/actions", () => ({ startPart5Challenge: vi.fn() }));
vi.mock("@/components/challenge-start-button", () => ({
  ChallengeStartButton: ({ className, label }: { className?: string; label: string }) => (
    <button className={className} type="submit">{label}</button>
  ),
}));
vi.mock("@/components/blog/markdown", () => ({
  Markdown: ({ content }: { content: string }) => <div className="article-body">{content}</div>,
}));
vi.mock("@/components/marketing/home-scroll-effects", () => ({ HomeScrollEffects: () => null }));
vi.mock("@/components/public-header", () => ({
  PublicHeader: ({ tone }: { tone: string }) => <header data-tone={tone}>Header</header>,
}));
vi.mock("@/components/public-footer", () => ({
  PublicFooter: ({ tone }: { tone: string }) => <footer data-tone={tone}>Footer</footer>,
}));
vi.mock("@/components/seo/breadcrumb-trail", () => ({ BreadcrumbTrail: () => <nav>Breadcrumb</nav> }));
vi.mock("@/components/seo/managed-page", () => ({ managedMetadata: vi.fn() }));
vi.mock("@/components/seo/toeic-format-table", () => ({
  ToeicFormatTable: ({ id, tone }: { id: string; tone: string }) => <section data-tone={tone} id={id}>Format table</section>,
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: vi.fn().mockResolvedValue(null) }));
vi.mock("@/lib/blog/service", () => ({
  getPostRedirect: vi.fn().mockResolvedValue(null),
  getPublishedPost: vi.fn().mockResolvedValue({
    content: "Long-form TOEIC guide",
    excerpt: "A clear overview of all seven Parts.",
    title: "TOEIC Listening & Reading: 7 Parts, 200 questions",
  }),
}));

import Page from "./page";

describe("TOEIC overview page", () => {
  it("uses the homepage dark shell and keeps a useful guest action", async () => {
    const html = renderToStaticMarkup(await Page());

    expect(html).toContain("data-home-page");
    expect(html.match(/data-tone="dark"/g)).toHaveLength(3);
    expect(html).toContain("TOEIC Listening &amp; Reading: 7 Parts, 200 questions");
    expect(html).toContain("Làm thử 10 câu miễn phí");
    expect(html).toContain('id="toeic-format"');
    expect(html).toContain('href="/full-mock"');
    expect(html).toContain("Long-form TOEIC guide");
  });
});
