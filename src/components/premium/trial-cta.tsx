import { activateTrialAction } from "@/app/trial/actions";
import Link from "next/link";
import { TRIAL_DURATION_DAYS } from "@/lib/premium/trial-policy";

export function TrialCta({ locale, canActivate = true }: { locale: "vi" | "en"; canActivate?: boolean }) {
  const vi = locale === "vi";
  return <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6" aria-label={vi ? "Dùng thử Premium" : "Try Premium"}>
    <h2 className="text-xl font-black">{vi ? `Trải nghiệm Premium miễn phí ${TRIAL_DURATION_DAYS} ngày` : `Try Premium free for ${TRIAL_DURATION_DAYS} days`}</h2>
    <p className="mt-2 leading-7 text-slate-700">{vi ? `Kích hoạt một lần sau khi xác minh email. Không cần thẻ, không tự gia hạn và không phát sinh thanh toán. Hết ${TRIAL_DURATION_DAYS} ngày dùng thử, tài khoản trở lại Free nếu bạn chưa mua gói; toàn bộ dữ liệu học vẫn được giữ.` : `Activate once after verifying your email. No card, automatic renewal, or charge. After your ${TRIAL_DURATION_DAYS}-day trial, your account returns to Free unless you have purchased a plan; your learning data stays saved.`}</p>
    {canActivate ? <form action={activateTrialAction} className="mt-4">
      <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-800 px-5 py-3 font-bold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto" type="submit">{vi ? `Dùng thử Premium ${TRIAL_DURATION_DAYS} ngày` : `Try Premium for ${TRIAL_DURATION_DAYS} days`}</button>
    </form> : <Link className="mt-4 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-800 px-5 py-3 font-bold text-white hover:bg-teal-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 sm:w-auto" href="/sign-up">{vi ? "Tạo tài khoản để dùng thử" : "Create an account to try Premium"}</Link>}
  </section>;
}
