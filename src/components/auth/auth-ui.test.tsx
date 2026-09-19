import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { AuthAlert } from "./auth-ui";
import { PasswordField } from "./password-field";

describe("auth UI primitives", () => {
  it("announces authentication errors", () => {
    const html = renderToStaticMarkup(<AuthAlert type="error">Thông tin không hợp lệ.</AuthAlert>);
    expect(html).toContain('role="alert"');
    expect(html).toContain('aria-live="polite"');
  });

  it("keeps password-manager semantics and an accessible visibility control", () => {
    const html = renderToStaticMarkup(<PasswordField autoComplete="new-password" label="Mật khẩu mới" name="password" />);
    expect(html).toContain('autoComplete="new-password"');
    expect(html).toContain('minLength="10"');
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain("Hiện mật khẩu mới");
  });
});
