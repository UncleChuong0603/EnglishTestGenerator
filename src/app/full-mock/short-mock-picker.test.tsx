import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ShortMockPicker } from "./short-mock-picker";

vi.mock("./actions", () => ({ startShortMock: vi.fn() }));

const readiness = { easy: true, hard: true, medium: true } as const;

describe("ShortMockPicker", () => {
  it("lets guests inspect difficulty choices but asks them to sign in to start", () => {
    const html = renderToStaticMarkup(
      <ShortMockPicker active={null} locale="en" readiness={readiness} signedIn={false} />,
    );

    expect(html).toContain("Choose difficulty");
    expect(html).toContain("Sign in to start");
    expect(html).toContain('href="/sign-in?next=%2Ffull-mock"');
    expect(html).not.toContain("<form");
    expect(html).not.toContain('type="submit"');
  });

  it("keeps the real start action for signed-in learners", () => {
    const html = renderToStaticMarkup(
      <ShortMockPicker active={null} locale="en" readiness={readiness} signedIn />,
    );

    expect(html).toContain("Start short mock");
    expect(html).toContain('type="submit"');
    expect(html).not.toContain("Sign in to start");
  });
});
