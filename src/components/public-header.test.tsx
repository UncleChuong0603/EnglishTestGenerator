import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PublicHeader } from "./public-header";

vi.mock("@/app/challenge/actions", () => ({
  startPart5Challenge: vi.fn(),
}));

vi.mock("@/components/language-switcher", () => ({
  LanguageSwitcher: () => null,
}));

describe("PublicHeader", () => {
  it.each([
    ["vi", "Từ vựng"],
    ["en", "Vocabulary"],
  ] as const)("links to the vocabulary preview in the %s desktop and mobile navigation", (locale, label) => {
    const html = renderToStaticMarkup(<PublicHeader locale={locale} />);

    expect(html.match(new RegExp(`href="/vocabulary"[^>]*>${label}</a>`, "g"))).toHaveLength(2);
  });

  it.each([
    ["vi", "TOEIC là gì", "Ngữ Pháp", "Luyện nghe", "Thi Thử"],
    ["en", "What is TOEIC?", "Grammar", "Listening", "Mock Test"],
  ] as const)("shows the updated %s learning links in the desktop and mobile navigation", (locale, toeicLabel, grammarLabel, listeningLabel, mockLabel) => {
    const html = renderToStaticMarkup(<PublicHeader locale={locale} />);

    expect(html.match(new RegExp(`href="/toeic"[^>]*>${toeicLabel.replace("?", "\\?")}</a>`, "g"))).toHaveLength(2);
    expect(html.match(new RegExp(`href="/ngu-phap"[^>]*>${grammarLabel}</a>`, "g"))).toHaveLength(2);
    expect(html.match(new RegExp(`href="/listening-lessons"[^>]*>${listeningLabel}</a>`, "g"))).toHaveLength(2);
    expect(html.match(new RegExp(`href="/full-mock"[^>]*>${mockLabel}</a>`, "g"))).toHaveLength(2);
    expect(html).not.toContain('href="/thi-thu-toeic-online"');
  });

  it.each([
    ["vi", "Thi Thử"],
    ["en", "Mock Test"],
  ] as const)("sends signed-in %s learners to the same mock hub", (locale, label) => {
    const html = renderToStaticMarkup(<PublicHeader locale={locale} signedIn />);

    expect(html.match(new RegExp(`href="/full-mock"[^>]*>${label}</a>`, "g"))).toHaveLength(2);
    expect(html).not.toContain('href="/thi-thu-toeic-online"');
  });

  it.each([
    ["vi", "Tiến độ", "Mở tiến độ"],
    ["en", "Progress", "Open progress"],
  ] as const)("shows one learner-home action per signed-in %s header layout", (locale, dashboardLabel, continueLabel) => {
    const html = renderToStaticMarkup(<PublicHeader locale={locale} signedIn />);

    expect(html).not.toContain(`>${dashboardLabel}</a>`);
    expect(html.match(new RegExp(`>${continueLabel}(?: <!-- -->)?`, "g"))).toHaveLength(2);
    expect(html.match(/href="\/progress"/g)).toHaveLength(2);
  });

  it.each([
    ["vi", "Tiến độ", "Mở tiến độ"],
    ["en", "Progress", "Open progress"],
  ] as const)("keeps the signed-in %s learner-home link when the primary action is hidden", (locale, dashboardLabel, continueLabel) => {
    const html = renderToStaticMarkup(<PublicHeader locale={locale} showPrimary={false} signedIn />);

    expect(html.match(new RegExp(`>${dashboardLabel}</a>`, "g"))).toHaveLength(2);
    expect(html.match(/href="\/progress"/g)).toHaveLength(2);
    expect(html).not.toContain(continueLabel);
  });

  it("supports the homepage's signed-in today action", () => {
    const html = renderToStaticMarkup(
      <PublicHeader
        locale="vi"
        signedIn
        signedInPrimaryHref="/dashboard"
        signedInPrimaryLabel="Bài hôm nay"
      />,
    );

    expect(html.match(/href="\/dashboard"/g)).toHaveLength(2);
    expect(html.match(/>Bài hôm nay(?: <!-- -->)?/g)).toHaveLength(2);
    expect(html).not.toContain('href="/progress"');
  });
});
