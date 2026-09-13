"use server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { PASSWORD_MIN_LENGTH } from "@/lib/auth/crypto";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { authenticatePassword, changePassword, consumeActivationToken, registerPasswordUser, requestPasswordReset, resendVerification, resetPassword, verifyEmailToken } from "@/lib/auth/service";
import { createSession, getCurrentSession, requireUser, revokeAllUserSessions, revokeCurrentSession } from "@/lib/auth/session";

export type AuthActionState = { ok: boolean; error?: string; message?: string };
const passwordSchema = z.string().min(PASSWORD_MIN_LENGTH).max(1024);
const emailSchema = z.email().max(320);
async function clientKey(email = "") { const h = await headers(); return `${h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? "unknown"}:${email}`; }

export async function signUpAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = z.object({ email: emailSchema, password: passwordSchema, confirmPassword: z.string() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) return { ok: false, error: "Thông tin đăng ký không hợp lệ hoặc mật khẩu xác nhận không khớp." };
  try { await enforceRateLimit("signup", await clientKey(parsed.data.email)); const created = await registerPasswordUser(parsed.data.email, parsed.data.password); return { ok: true, message: created ? "Hãy kiểm tra email để xác minh tài khoản." : "Nếu địa chỉ này có thể đăng ký, hướng dẫn xác minh đã được gửi." }; }
  catch (error) { return { ok: false, error: error instanceof Error && error.message === "RATE_LIMITED" ? "Bạn thao tác quá nhanh. Vui lòng thử lại sau." : "Không thể tạo tài khoản lúc này." }; }
}

export async function signInAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = z.object({ email: emailSchema, password: z.string().max(1024), next: z.string().optional() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Email hoặc mật khẩu không đúng." };
  try { await enforceRateLimit("login", await clientKey(parsed.data.email)); const user = await authenticatePassword(parsed.data.email, parsed.data.password); if (!user) return { ok: false, error: "Email hoặc mật khẩu không đúng." }; await createSession(user.id); const next = parsed.data.next?.startsWith("/") && !parsed.data.next.startsWith("//") ? parsed.data.next : "/dashboard"; redirect(next); }
  catch (error) { if (typeof error === "object" && error && "digest" in error) throw error; return { ok: false, error: error instanceof Error && error.message === "RATE_LIMITED" ? "Bạn thao tác quá nhanh. Vui lòng thử lại sau." : "Email hoặc mật khẩu không đúng." }; }
}

export async function forgotPasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const email = emailSchema.safeParse(formData.get("email")); if (!email.success) return { ok: true, message: "Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi." };
  try { await enforceRateLimit("forgot_password", await clientKey(email.data)); await requestPasswordReset(email.data); } catch { /* Always generic. */ }
  return { ok: true, message: "Nếu tài khoản tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi." };
}

export async function resetPasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = z.object({ token: z.string().min(20), password: passwordSchema, confirmPassword: z.string() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) return { ok: false, error: "Mật khẩu không hợp lệ hoặc không khớp." };
  try { await enforceRateLimit("reset_password", await clientKey()); return await resetPassword(parsed.data.token, parsed.data.password) ? { ok: true, message: "Mật khẩu đã được đặt lại. Hãy đăng nhập lại." } : { ok: false, error: "Liên kết không hợp lệ, đã hết hạn hoặc đã được sử dụng." }; } catch { return { ok: false, error: "Không thể đặt lại mật khẩu lúc này." }; }
}

export async function changePasswordAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const user = await requireUser(); const session = await getCurrentSession();
  const parsed = z.object({ currentPassword: z.string().optional(), password: passwordSchema, confirmPassword: z.string() }).safeParse(Object.fromEntries(formData));
  if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) return { ok: false, error: "Mật khẩu mới không hợp lệ hoặc không khớp." };
  const result = await changePassword(user.id, parsed.data.currentPassword || null, parsed.data.password, session?.sessionId);
  return result === "ok" ? { ok: true, message: "Mật khẩu đã được cập nhật; các phiên khác đã bị đăng xuất." } : { ok: false, error: result === "wrong_password" ? "Mật khẩu hiện tại không đúng." : "Không thể cập nhật mật khẩu." };
}

export async function signOutAction() { await revokeCurrentSession(); redirect("/"); }
export async function signOutAllAction() { const user = await requireUser(); await revokeAllUserSessions(user.id); (await cookies()).delete("etg_session"); redirect("/"); }
export async function verifyEmailAction(formData: FormData) { const token = String(formData.get("token") ?? ""); if (token.length >= 20 && await verifyEmailToken(token)) redirect("/sign-in?verified=1"); redirect("/verify-email?error=invalid"); }
export async function resendVerificationAction(formData: FormData) { const parsed = emailSchema.safeParse(formData.get("email")); if (parsed.success) { try { await enforceRateLimit("resend_verification", await clientKey(parsed.data)); await resendVerification(parsed.data); } catch { /* Generic response prevents enumeration. */ } } redirect("/verify-email?resent=1"); }
export async function activateAccountAction(_state: AuthActionState, formData: FormData): Promise<AuthActionState> { const parsed = z.object({ token: z.string().min(20), password: passwordSchema, confirmPassword: z.string() }).safeParse(Object.fromEntries(formData)); if (!parsed.success || parsed.data.password !== parsed.data.confirmPassword) return { ok: false, error: "Mật khẩu không hợp lệ hoặc không khớp." }; return await consumeActivationToken(parsed.data.token, parsed.data.password) ? { ok: true, message: "Tài khoản đã được kích hoạt. Hãy đăng nhập." } : { ok: false, error: "Liên kết không hợp lệ, đã hết hạn hoặc đã được dùng." }; }
