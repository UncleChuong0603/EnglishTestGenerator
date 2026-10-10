import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { MockFormPicker } from "./mock-form-picker";

vi.mock("./actions", () => ({ startMock: vi.fn() }));
vi.mock("@/app/auth/actions", () => ({ signInAction: vi.fn() }));

const catalog = Array.from({ length: 25 }, (_, index) => ({
  formNumber: index + 1,
  ready: true,
  difficulty: {
    FULL: index < 8 ? "easy" as const : index < 17 ? "medium" as const : "hard" as const,
    LISTENING: "medium" as const,
    READING: "hard" as const,
  },
}));

const emptyActives = { FULL: null, LISTENING: null, READING: null };

describe("MockFormPicker", () => {
  it("lets guests inspect named forms and difficulty but requires sign-in to start", () => {
    const html = renderToStaticMarkup(
      <MockFormPicker actives={emptyActives} catalog={catalog} locale="vi" signedIn={false} />,
    );

    expect(html).toContain("Thi thử Full TOEIC");
    expect(html).toContain("Danh sách đề");
    expect(html).toContain("Dễ");
    expect(html).toContain("Vừa");
    expect(html).toContain("Khó");
    expect(html).toContain("Thi thử");
    expect(html).not.toContain('href="/sign-in?next=%2Ffull-mock"');
    expect(html).not.toContain("<form");
  });

  it("posts the selected form for signed-in learners", () => {
    const html = renderToStaticMarkup(
      <MockFormPicker actives={emptyActives} catalog={catalog} locale="en" signedIn />,
    );

    expect(html).toContain("<form");
    expect(html).toContain('name="formNumber"');
    expect(html).toContain("Take test");
    expect(html).not.toContain("Sign in to take a mock");
  });

  it("prioritizes continuing an active form over starting another", () => {
    const html = renderToStaticMarkup(
      <MockFormPicker
        actives={{ ...emptyActives, FULL: { id: "run-1", formNumber: 7 } }}
        catalog={catalog}
        locale="en"
        signedIn
      />,
    );

    expect(html).toContain("Form 07");
    expect(html).toContain('href="/full-mock/run-1"');
    expect(html).not.toContain("<form");
  });
});
