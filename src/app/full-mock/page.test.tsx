import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getActiveDemoTest: vi.fn(),
  getActiveMock: vi.fn(),
  getActiveShortMock: vi.fn(),
  getCurrentUser: vi.fn().mockResolvedValue(null),
  getEffectiveCapabilities: vi.fn(),
  getFullMockHistory: vi.fn(),
  getPremiumPreview: vi.fn(),
}));

vi.mock("@/lib/auth/session", () => ({ getCurrentUser: mocks.getCurrentUser }));
vi.mock("@/lib/full-mock/service", () => ({
  getActiveMock: mocks.getActiveMock,
  getFullMockHistory: mocks.getFullMockHistory,
  getMockFormCatalog: vi.fn().mockResolvedValue(
    Array.from({ length: 25 }, (_, index) => ({
      formNumber: index + 1,
      ready: true,
      difficulty: { FULL: "medium", LISTENING: "medium", READING: "medium" },
    })),
  ),
  getMockHubReadiness: vi.fn().mockResolvedValue({
    full: { ready: true },
    listening: { ready: true },
    reading: { ready: true },
  }),
}));
vi.mock("@/lib/i18n/get-translations", () => ({
  getCookieLanguage: vi.fn().mockResolvedValue("en"),
  getPreferences: vi.fn().mockResolvedValue({
    explanationLanguage: "vi",
    interfaceLanguage: "en",
  }),
}));
vi.mock("@/lib/demo-test/queries", () => ({
  getActiveDemoTest: mocks.getActiveDemoTest,
}));
vi.mock("@/lib/entitlements/service", () => ({
  getEffectiveCapabilities: mocks.getEffectiveCapabilities,
}));
vi.mock("@/lib/premium/preview", () => ({
  getPremiumPreview: mocks.getPremiumPreview,
}));
vi.mock("@/lib/short-mock/service", () => ({
  getActiveShortMock: mocks.getActiveShortMock,
  getShortMockReadiness: vi.fn().mockResolvedValue({
    easy: true,
    hard: true,
    medium: true,
  }),
}));
vi.mock("@/components/learner-nav", () => ({
  LearnerNav: () => <nav data-testid="learner-nav">Learner sidebar</nav>,
}));
vi.mock("@/components/premium/premium-preview", () => ({
  PremiumPreviewCard: () => null,
  PremiumRenewalCard: () => null,
}));
vi.mock("./short-mock-picker", () => ({
  ShortMockPicker: ({ signedIn }: { signedIn: boolean }) => (
    <div data-signed-in={String(signedIn)}>Short mock picker</div>
  ),
}));
vi.mock("./actions", () => ({ startMock: vi.fn() }));

import FullMockPage from "./page";

describe("FullMockPage guest preview", () => {
  it("shows the mock-test interface and gates starting actions behind sign-in", async () => {
    const page = await FullMockPage({ searchParams: Promise.resolve({}) });
    const html = renderToStaticMarkup(page);

    expect(html).toContain("Learner sidebar");
    expect(html).toContain("Complete mock test bank");
    expect(html).toContain('data-signed-in="false"');
    expect(html.match(/href="\/sign-in\?next=%2Ffull-mock"/g)?.length).toBeGreaterThanOrEqual(1);
    expect(html).not.toContain('type="submit"');
    expect(mocks.getActiveMock).not.toHaveBeenCalled();
    expect(mocks.getFullMockHistory).not.toHaveBeenCalled();
    expect(mocks.getActiveDemoTest).not.toHaveBeenCalled();
    expect(mocks.getEffectiveCapabilities).not.toHaveBeenCalled();
    expect(mocks.getPremiumPreview).not.toHaveBeenCalled();
    expect(mocks.getActiveShortMock).not.toHaveBeenCalled();
  });
});
