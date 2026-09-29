import { activateTrialAction } from "@/app/trial/actions";

export function TrialCta({ locale }: { locale: "vi" | "en" }) {
  const vi = locale === "vi";
  return <section className="rounded-2xl border border-teal-200 bg-teal-50 p-5 sm:p-6" aria-label={vi ? "Dùng thử Premium" : "Try Premium"}>
    <h2 className="text-xl font-black">{vi ? "Dữ liệu học của bạn đã sẵn sàng cho Premium" : "Your learning data is ready for Premium"}</h2>
    <p className="mt-2 leading-7 text-slate-700">{vi ? "Dùng thử Premium miễn phí 3 ngày. Không cần thẻ, không tự gia hạn và không phát sinh thanh toán. Hết 72 giờ, tài khoản trở lại Free; toàn bộ dữ liệu học vẫn được giữ." : "Try Premium free for 3 days. No card, automatic renewal, or charge. After 72 hours your account returns to Free and your learning data stays saved."}</p>
    <form action={activateTrialAction} className="mt-4">
      <button className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-800 px-5 font-bold text-white hover:bg-teal-900 sm:w-auto" type="submit">{vi ? "Dùng thử Premium 3 ngày" : "Try Premium for 3 days"}</button>
    </form>
  </section>;
}
