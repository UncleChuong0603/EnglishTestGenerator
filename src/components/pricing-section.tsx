import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { PremiumProductKey } from "@/lib/payments/catalog";
import { publicPlanFeatures } from "@/lib/public-product";

type Product = { key: PremiumProductKey; days: number; amountVnd: number | null; purchasable: boolean };
type Props = { locale: InterfaceLanguage; compact?: boolean; startHref?: string; products?: Product[]; currentPlan?: "FREE" | "PREMIUM" };

const featureNames = {
  listeningReading: { vi: "Luyện Listening + Reading", en: "Listening + Reading practice" },
  recommendations: { vi: "Bài luyện hôm nay", en: "Today's Workout" },
  mistakeBank: { vi: "Ôn ngân hàng câu sai", en: "Mistake Bank review" },
  progress: { vi: "Lịch sử tiến độ", en: "Progress history" },
  fullMock: { vi: "Thi thử Full Mock", en: "Full Mock tests" },
} as const;

const premiumOutcomes = {
  vi: [
    ["Tập trung đúng điểm yếu", "Bài luyện tự ưu tiên skill yếu, lỗi lặp lại và câu chưa từng gặp."],
    ["Biến câu sai thành điểm số", "Smart Review đưa lỗi chưa làm chủ trở lại đúng lúc để bạn sửa thật sự."],
    ["Nhìn thấy tiến bộ dài hạn", "Theo dõi 90 ngày, phân tích skill/subskill và so sánh các lần đánh giá."],
    ["Luyện không bị ngắt quãng", "Không giới hạn bài luyện, ôn lỗi và Full Mock khi kho đề sẵn sàng."],
  ],
  en: [
    ["Train the right weaknesses", "Workouts prioritize weak skills, repeated mistakes, and unseen questions."],
    ["Turn mistakes into points", "Smart Review brings back unresolved errors when they matter most."],
    ["See long-term progress", "Track 90 days, analyze skills and subskills, and compare reassessments."],
    ["Practice without interruption", "Unlimited workouts, mistake review, and Full Mocks when content is ready."],
  ],
} as const;

export function PricingSection({ locale, compact = false, startHref = "/try", products = [], currentPlan }: Props) {
  const vi = locale === "vi";
  const purchasableProducts = products.filter((product): product is Product & { amountVnd: number } => product.purchasable && product.amountVnd !== null);

  if (compact) return <CompactPricing locale={locale} />;

  return (
    <section className="relative overflow-hidden pb-20 pt-10 sm:pb-24 sm:pt-14" id="pricing">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[42rem] bg-[radial-gradient(circle_at_15%_10%,rgba(45,212,191,.18),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(251,191,36,.16),transparent_28%)]" />
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[.16em] text-teal-800 shadow-sm"><span className="size-2 rounded-full bg-teal-500" />{vi ? "Premium cho người học nghiêm túc" : "Premium for serious learners"}</div>
          <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">{currentPlan === "PREMIUM" ? (vi ? "Giữ nhịp tiến bộ của bạn." : "Keep your momentum going.") : (vi ? "Đừng chỉ luyện nhiều hơn. Hãy luyện đúng hơn." : "Don't just practice more. Practice smarter.")}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">{vi ? "Premium biến dữ liệu học của bạn thành bài luyện ưu tiên rõ ràng, giúp sửa lỗi lặp lại và theo dõi tiến bộ thực sự." : "Premium turns your learning data into clear training priorities, helping you fix repeated errors and see real progress."}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-sm font-bold text-slate-700"><span>✓ {vi ? "Thanh toán một lần" : "One-time payment"}</span><span>✓ {vi ? "Không tự động gia hạn" : "No auto-renewal"}</span><span>✓ {vi ? "Giữ dữ liệu khi hết hạn" : "Keep your data after expiry"}</span></div>
        </div>

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {premiumOutcomes[locale].map(([title, body], index) => <article className="rounded-2xl border border-slate-200/80 bg-white/90 p-5 shadow-sm backdrop-blur" key={title}><span className="grid size-10 place-items-center rounded-xl bg-teal-50 text-lg font-black text-teal-800">{index + 1}</span><h2 className="mt-4 font-black text-slate-950">{title}</h2><p className="mt-2 text-sm leading-6 text-slate-600">{body}</p></article>)}
        </div>

        <div className="mt-14 scroll-mt-6" id="plans">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end"><div><p className="text-sm font-black uppercase tracking-[.16em] text-teal-700">{vi ? "Chọn thời gian phù hợp" : "Choose your pace"}</p><h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">{vi ? "Một Premium. Ba lựa chọn đơn giản." : "One Premium. Three simple options."}</h2></div><p className="text-sm font-semibold text-slate-500">{vi ? "Quyền lợi giống nhau ở mọi gói" : "Same benefits on every option"}</p></div>
          {purchasableProducts.length ? <div className="mt-7 grid items-stretch gap-5 lg:grid-cols-3">{purchasableProducts.map((product) => <ProductCard key={product.key} product={product} locale={locale} currentPlan={currentPlan} />)}</div> : <div className="mt-7 rounded-3xl border border-amber-200 bg-amber-50 p-6 text-amber-950"><p className="font-black">{vi ? "Thanh toán đang tạm gián đoạn" : "Payments are temporarily unavailable"}</p><p className="mt-2 text-sm">{vi ? "Bạn vẫn có thể tiếp tục học với gói Free. Vui lòng quay lại sau để nâng cấp." : "You can keep learning on Free. Please return later to upgrade."}</p></div>}
          <p className="mt-5 text-center text-sm text-slate-500">{vi ? "Thanh toán an toàn qua PayOS · Kích hoạt sau khi xác nhận thanh toán" : "Secure payment via PayOS · Activates after payment confirmation"}</p>
        </div>

        <div className="mt-20 grid gap-8 lg:grid-cols-[.75fr_1.25fr] lg:items-start">
          <div><p className="text-sm font-black uppercase tracking-[.16em] text-teal-700">{vi ? "So sánh rõ ràng" : "Clear comparison"}</p><h2 className="mt-3 text-3xl font-black tracking-tight">{vi ? "Free để bắt đầu. Premium để tăng tốc." : "Free to begin. Premium to accelerate."}</h2><p className="mt-4 leading-7 text-slate-600">{vi ? "Bạn không mất dữ liệu và không bị trừ tiền tự động. Chỉ nâng cấp khi cần một nhịp luyện nghiêm túc hơn." : "You keep your data and are never charged automatically. Upgrade only when you want a more focused training cycle."}</p><Link className="mt-6 inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-black hover:border-slate-400" href={startHref}>{vi ? "Tiếp tục với Free" : "Continue with Free"}</Link></div>
          <Comparison locale={locale} />
        </div>

        <div className="mx-auto mt-20 max-w-3xl"><p className="text-center text-sm font-black uppercase tracking-[.16em] text-teal-700">FAQ</p><h2 className="mt-3 text-center text-3xl font-black">{vi ? "Trước khi bạn nâng cấp" : "Before you upgrade"}</h2><div className="mt-8 grid gap-3"><Faq question={vi ? "Premium có tự động gia hạn không?" : "Does Premium auto-renew?"} answer={vi ? "Không. Đây là thanh toán một lần cho số ngày bạn chọn. Bạn chủ động gia hạn khi muốn." : "No. Each option is a one-time payment for the selected number of days. You decide when to extend."} /><Faq question={vi ? "Hết hạn thì dữ liệu học có mất không?" : "Do I lose my learning data when Premium expires?"} answer={vi ? "Không. Lịch sử học vẫn được giữ an toàn và bạn tiếp tục dùng các tính năng Free." : "No. Your learning history stays safe and Free features remain available."} /><Faq question={vi ? "Premium có đảm bảo tăng điểm TOEIC không?" : "Does Premium guarantee a higher TOEIC score?"} answer={vi ? "Không nền tảng nào có thể đảm bảo điểm số. Premium giúp bạn luyện có trọng tâm hơn bằng dữ liệu điểm yếu, lỗi lặp lại và tiến độ cá nhân." : "No platform can guarantee a score. Premium helps you train deliberately using weaknesses, repeated errors, and personal progress."} /></div></div>
      </div>
    </section>
  );
}

function CompactPricing({ locale }: { locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  return <section className="mx-auto max-w-7xl px-5 py-16 sm:px-6 sm:py-20" id="pricing"><div className="overflow-hidden rounded-[2rem] bg-slate-950 px-6 py-10 text-white shadow-xl shadow-slate-900/10 sm:px-10 lg:grid lg:grid-cols-[1.1fr_.9fr] lg:gap-12 lg:px-14 lg:py-14"><div><p className="text-sm font-black uppercase tracking-[.18em] text-teal-300">Premium</p><h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-4xl">{vi ? "Luyện đúng chỗ yếu. Tiến bộ nhanh hơn." : "Train your weak spots. Improve faster."}</h2><p className="mt-4 max-w-xl leading-7 text-slate-300">{vi ? "Mở khóa lộ trình cá nhân hóa, Smart Review và phân tích đủ sâu để biết buổi học tiếp theo nên làm gì." : "Unlock personalized targeting, Smart Review, and analysis that tells you what to train next."}</p></div><div className="mt-8 grid content-center gap-3 lg:mt-0">{premiumOutcomes[locale].slice(0, 3).map(([title]) => <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3" key={title}><span className="grid size-7 shrink-0 place-items-center rounded-full bg-teal-300 font-black text-slate-950">✓</span><span className="font-bold">{title}</span></div>)}<Link className="mt-2 inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-300 px-5 font-black text-slate-950 hover:bg-teal-200" href="/pricing">{vi ? "Khám phá Premium" : "Explore Premium"}<span className="ml-2">→</span></Link></div></div></section>;
}

function ProductCard({ product, locale, currentPlan }: { product: Product & { amountVnd: number }; locale: InterfaceLanguage; currentPlan?: "FREE" | "PREMIUM" }) {
  const vi = locale === "vi";
  const recommended = product.days === 90;
  const dailyPrice = Math.round(product.amountVnd / product.days);
  return <article className={`relative flex flex-col rounded-[1.75rem] border bg-white p-6 ${recommended ? "border-teal-600 shadow-xl shadow-teal-900/10 ring-1 ring-teal-600" : "border-slate-200 shadow-sm"}`}>{recommended ? <p className="absolute -top-3 left-6 rounded-full bg-teal-700 px-3 py-1 text-xs font-black uppercase tracking-wider text-white">{vi ? "Phổ biến nhất" : "Most popular"}</p> : null}<p className="text-sm font-black uppercase tracking-wider text-slate-500">Premium</p><h3 className="mt-3 text-2xl font-black">{product.days} {vi ? "ngày" : "days"}</h3><p className="mt-5 text-4xl font-black tracking-tight">{new Intl.NumberFormat("vi-VN").format(product.amountVnd)} ₫</p><p className="mt-2 text-sm font-semibold text-slate-500">≈ {new Intl.NumberFormat("vi-VN").format(dailyPrice)} ₫/{vi ? "ngày" : "day"}</p><ul className="my-6 grid flex-1 gap-3 text-sm font-semibold text-slate-700"><li>✓ {vi ? "Luyện tập và ôn lỗi không giới hạn" : "Unlimited practice and mistake review"}</li><li>✓ {vi ? "Phân tích skill/subskill chuyên sâu" : "Advanced skill and subskill analysis"}</li><li>✓ {vi ? "Lộ trình ưu tiên theo điểm yếu" : "Weakness-based training priorities"}</li></ul><Link href={`/billing/confirm?product=${product.key}`} className={`inline-flex min-h-12 items-center justify-center rounded-xl px-5 font-black ${recommended ? "bg-teal-700 text-white hover:bg-teal-800" : "bg-slate-950 text-white hover:bg-slate-800"}`}>{currentPlan === "PREMIUM" ? (vi ? "Gia hạn Premium" : "Extend Premium") : (vi ? `Chọn gói ${product.days} ngày` : `Choose ${product.days} days`)}</Link></article>;
}

function Comparison({ locale }: { locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  const features = publicPlanFeatures(locale);
  return <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="grid divide-y sm:hidden">{features.map((feature) => <div className="p-4" key={feature.key}><p className="font-bold">{featureNames[feature.key][locale]}</p><div className="mt-3 grid grid-cols-2 gap-2 text-sm"><div className="rounded-xl bg-slate-50 p-3"><span className="block text-xs font-bold uppercase text-slate-500">Free</span><span className="mt-1 block">{feature.free}</span></div><div className="rounded-xl bg-teal-50 p-3"><span className="block text-xs font-bold uppercase text-teal-700">Premium</span><span className="mt-1 block font-bold">{feature.premium}</span></div></div></div>)}</div><table className="hidden w-full min-w-[38rem] text-left sm:table"><caption className="sr-only">{vi ? "So sánh gói" : "Plan comparison"}</caption><thead><tr className="border-b bg-slate-50"><th className="p-5">{vi ? "Tính năng" : "Feature"}</th><th className="p-5">Free</th><th className="bg-teal-50 p-5 text-teal-900">Premium</th></tr></thead><tbody>{features.map((feature) => <tr className="border-b last:border-0" key={feature.key}><th className="p-5 font-semibold">{featureNames[feature.key][locale]}</th><td className="p-5 text-slate-600">{feature.free}</td><td className="bg-teal-50/50 p-5 font-bold">{feature.premium}</td></tr>)}</tbody></table><p className="border-t bg-amber-50 p-4 text-sm leading-6 text-amber-950">{vi ? "Full Mock chỉ khả dụng khi kho nội dung đạt kiểm tra readiness; hạn mức không đồng nghĩa luôn có đề sẵn." : "Full Mock is available only after content-readiness checks pass; an entitlement does not guarantee ready test content."}</p></div>;
}

function Faq({ question, answer }: { question: string; answer: string }) {
  return <details className="group rounded-2xl border border-slate-200 bg-white px-5 py-4 open:shadow-sm"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black">{question}<span className="text-xl text-teal-700 transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{answer}</p></details>;
}
