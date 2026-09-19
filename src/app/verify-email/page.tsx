import Link from "next/link";
import { resendVerificationAction, verifyEmailAction } from "@/app/auth/actions";
import { AuthAlert, AuthShell, AuthSuccessState, fieldClassName, linkClassName, primaryButtonClassName } from "@/components/auth/auth-ui";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string; error?: string; resent?: string }> }) {
  const params = await searchParams;
  const hasValidTokenContext = Boolean(params.token && !params.error);
  return <AuthShell eyebrow="Xác minh email" title={hasValidTokenContext ? "Xác minh tài khoản của bạn" : "Kiểm tra hộp thư của bạn"} intro={hasValidTokenContext ? "Liên kết xác minh đã sẵn sàng. Xác nhận để hoàn tất tạo tài khoản." : "Chúng tôi đã gửi liên kết xác minh nếu địa chỉ email đủ điều kiện đăng ký."}>
    {params.resent ? <AuthSuccessState title="Email xác minh đã được gửi"><p>Nếu tài khoản đang chờ xác minh, bạn sẽ sớm nhận được một email mới. Hãy kiểm tra cả thư mục spam.</p></AuthSuccessState> : null}
    {hasValidTokenContext ? <form action={verifyEmailAction} className="mt-7"><input name="token" type="hidden" value={params.token} /><button className={primaryButtonClassName}>Xác minh tài khoản</button></form> : !params.resent ? <>
      {params.error ? <AuthAlert type="error">Liên kết không hợp lệ, đã hết hạn hoặc đã được sử dụng.</AuthAlert> : <AuthAlert type="info">Liên kết có thể mất vài phút để đến. Hãy kiểm tra cả mục Quảng cáo hoặc Thư rác.</AuthAlert>}
      <form action={resendVerificationAction} className="mt-5 space-y-4"><div><label className="text-sm font-bold text-slate-800" htmlFor="verification-email">Gửi lại đến email</label><input autoComplete="email" className={fieldClassName} id="verification-email" name="email" required type="email" /></div><button className={primaryButtonClassName}>Gửi lại email xác minh</button></form>
    </> : null}
    <p className="mt-6 text-center text-sm"><Link className={linkClassName} href="/sign-in">← Quay lại đăng nhập</Link></p>
  </AuthShell>;
}
