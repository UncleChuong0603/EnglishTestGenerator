import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/app/auth/actions", () => ({ changePasswordAction: vi.fn() }));
import { AccountSecurity } from "./account-security";

describe("AccountSecurity", () => {
  it("uses visible Vietnamese labels and password autocomplete semantics", () => {
    const html = renderToStaticMarkup(<AccountSecurity hasPassword vi />);
    expect(html).toContain("Mật khẩu hiện tại");
    expect(html).toContain("Xác nhận mật khẩu mới");
    expect(html).toContain('autoComplete="current-password"');
    expect(html).toContain('autoComplete="new-password"');
  });

  it("renders the English set-password state without a current password field", () => {
    const html = renderToStaticMarkup(<AccountSecurity hasPassword={false} vi={false} />);
    expect(html).toContain("Set password");
    expect(html).not.toContain("Current password");
    expect(html).toContain("At least 10 characters");
  });
});
