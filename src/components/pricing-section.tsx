import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { PremiumProductKey } from "@/lib/payments/catalog";
import {
  publicPlanFeatures,
  publicPlanNotes,
  type PublicFeatureKey,
} from "@/lib/public-product";

type Product = {
  key: PremiumProductKey;
  days: number;
  amountVnd: number | null;
  purchasable: boolean;
};

type Props = {
  locale: InterfaceLanguage;
  compact?: boolean;
  showIntro?: boolean;
  startHref?: string;
  products?: Product[];
  currentPlan?: "FREE" | "PREMIUM";
};

const featureNames: Record<
  PublicFeatureKey,
  Record<InterfaceLanguage, string>
> = {
  listeningReading: {
    vi: "Luyện Listening + Reading",
    en: "Listening + Reading practice",
  },
  manualPractice: {
    vi: "Luyện tập tự chọn",
    en: "Custom practice",
  },
  recommendations: {
    vi: "Bài hôm nay",
    en: "Today's Workout",
  },
  mistakeBank: {
    vi: "Ôn Ngân hàng lỗi sai",
    en: "Mistake Bank review",
  },
  fullMock: {
    vi: "Tạo bài Mock mới",
    en: "New Mock Tests",
  },
  diagnostic: {
    vi: "Đánh giá năng lực",
    en: "Diagnostic assessment",
  },
  targeting: {
    vi: "Nhắm mục tiêu luyện tập",
    en: "Practice targeting",
  },
  progress: {
    vi: "Tiến độ và phân tích",
    en: "Progress and analytics",
  },
  mockHistory: {
    vi: "Lịch sử thi thử",
    en: "Mock history",
  },
  explanations: {
    vi: "Ngôn ngữ giải thích",
    en: "Explanation language",
  },
  ranking: {
    vi: "Xếp hạng và thử thách",
    en: "Ranking and challenges",
  },
};

export function PricingSection({
  locale,
  compact = false,
  showIntro = true,
  startHref = "/try",
  products = [],
  currentPlan,
}: Props) {
  const vi = locale === "vi";
  const features = publicPlanFeatures(locale);
  const featured = features.filter((feature) => feature.featured);
  const purchasable = products.some((product) => product.purchasable);
  const freeActionLabel = currentPlan
    ? vi
      ? "Tiếp tục học"
      : "Continue learning"
    : vi
      ? "Làm đánh giá miễn phí"
      : "Take free diagnostic";

  return (
    <section
      className={`pricing-section mx-auto max-w-7xl px-5 sm:px-6 ${showIntro ? "py-16 sm:py-20" : "pb-16 pt-8 sm:pb-20 sm:pt-10"}`}
      id="pricing"
    >
      {showIntro ? (
        <>
          <p className="section-kicker">
            {vi ? "Gói học minh bạch" : "Clear learning plans"}
          </p>
          <h2 className="mt-3 max-w-3xl text-3xl font-black sm:text-4xl">
            {currentPlan === "PREMIUM"
              ? vi
                ? "Bạn đang dùng Premium. Mua thêm thời hạn khi cần."
                : "You have Premium. Add more time when you need it."
              : vi
                ? "Bắt đầu miễn phí. Nâng cấp khi bạn cần luyện nhiều hơn."
                : "Start free. Upgrade when you need more practice."}
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
            {vi
              ? "Free phù hợp để tạo thói quen hằng ngày. Premium tăng hạn mức và mở các công cụ ôn tập, phân tích sâu hơn."
              : "Free supports a daily habit. Premium raises limits and unlocks deeper review and analysis tools."}
          </p>
        </>
      ) : (
        <h2 className="text-2xl font-black sm:text-3xl">
          {vi ? "Chọn gói học" : "Choose your plan"}
        </h2>
      )}
      <p className="mt-3 text-sm font-semibold text-slate-700">
        {vi
          ? "Thanh toán một lần · Không tự động gia hạn"
          : "One-time payment · No automatic renewal"}
      </p>

      <div className="mt-7 grid items-start gap-5 lg:grid-cols-2">
        <Plan
          title="Free"
          badge={
            currentPlan === "FREE"
              ? vi
                ? "Gói hiện tại"
                : "Current plan"
              : vi
                ? "Luôn khả dụng"
                : "Always available"
          }
          body={
            vi
              ? "Dành cho thói quen học đều mỗi ngày. Không cần thẻ thanh toán."
              : "For building a consistent daily habit. No payment card required."
          }
          features={featured.map(
            (feature) =>
              `${featureNames[feature.key][locale]}: ${feature.free}`,
          )}
          action={
            <Link
              className="inline-flex min-h-12 items-center rounded-xl bg-teal-700 px-5 font-black text-white"
              href={startHref}
            >
              {freeActionLabel}
            </Link>
          }
        />
        <Plan
          title="Premium"
          badge={
            currentPlan === "PREMIUM"
              ? vi
                ? "Gói hiện tại"
                : "Current plan"
              : purchasable
                ? vi
                  ? "Có thể mua"
                  : "Available to purchase"
                : vi
                  ? "Chưa mở bán"
                  : "Not on sale"
          }
          body={
            vi
              ? "Dành cho cường độ luyện cao, ôn lỗi thông minh và phân tích chi tiết hơn."
              : "For higher-volume practice, smarter review and deeper analysis."
          }
          features={featured.map(
            (feature) =>
              `${featureNames[feature.key][locale]}: ${feature.premium}`,
          )}
          action={
            purchasable ? (
              <div className="grid gap-3">
                {products
                  .filter((product) => product.purchasable)
                  .map((product) => (
                    <Link
                      className="flex min-h-12 flex-wrap items-center justify-between gap-3 rounded-xl border p-3"
                      href={`/billing/confirm?product=${product.key}`}
                      key={product.key}
                    >
                      <span className="font-bold">
                        {product.days} {vi ? "ngày" : "days"}
                        <br />
                        <span className="text-sm text-slate-600">
                          {new Intl.NumberFormat("vi-VN").format(
                            product.amountVnd!,
                          )}{" "}
                          ₫
                        </span>
                      </span>
                      <span className="rounded-xl bg-slate-900 px-4 py-3 font-bold text-white">
                        {currentPlan === "PREMIUM"
                          ? vi
                            ? "Gia hạn"
                            : "Extend"
                          : vi
                            ? "Chọn gói"
                            : "Choose"}
                      </span>
                    </Link>
                  ))}
              </div>
            ) : (
              <p className="rounded-xl bg-slate-100 p-4 text-sm font-semibold text-slate-600">
                {vi
                  ? "Premium hiện chưa thể mua. Bạn vẫn có thể sử dụng đầy đủ gói Free."
                  : "Premium is not currently available to purchase. The complete Free plan remains available."}
              </p>
            )
          }
        />
      </div>

      {compact ? (
        <div className="mt-8 text-center">
          <Link className="font-black text-teal-800" href="/pricing">
            {vi ? "Xem so sánh đầy đủ" : "See full comparison"} →
          </Link>
        </div>
      ) : (
        <Comparison locale={locale} />
      )}
    </section>
  );
}

function Plan({
  title,
  badge,
  body,
  features,
  action,
}: {
  title: string;
  badge: string;
  body: string;
  features: string[];
  action: React.ReactNode;
}) {
  return (
    <article className="pricing-plan border border-slate-200 bg-white p-7 sm:p-9">
      <p className="text-sm font-black uppercase tracking-wider text-teal-700">
        {badge}
      </p>
      <h3 className="mt-3 text-2xl font-black">{title}</h3>
      <p className="mt-3 text-slate-600">{body}</p>
      <ul className="mt-6 grid gap-3 text-sm font-semibold">
        {features.map((feature) => (
          <li className="flex gap-2" key={feature}>
            <span aria-hidden="true" className="text-teal-700">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <div className="mt-8">{action}</div>
    </article>
  );
}

function Comparison({ locale }: { locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  const features = publicPlanFeatures(locale);
  const upgrades = features.filter((feature) => feature.free !== feature.premium);
  const shared = features.filter((feature) => feature.free === feature.premium);
  const notes = publicPlanNotes(locale);

  return (
    <section className="mt-14" aria-labelledby="plan-comparison-title">
      <h3 className="text-2xl font-black sm:text-3xl" id="plan-comparison-title">
        {vi ? "Premium thêm gì so với Free?" : "What does Premium add?"}
      </h3>
      <p className="mt-2 max-w-2xl leading-7 text-slate-600">
        {vi
          ? "So sánh từng quyền lợi để chọn gói phù hợp. Các tính năng có ở cả hai gói được liệt kê riêng bên dưới."
          : "Compare each benefit to find the right plan. Features included in both plans appear separately below."}
      </p>

      <div className="mt-6 grid gap-3 lg:hidden">
        {upgrades.map((feature) => (
          <article
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            key={feature.key}
          >
            <h4 className="font-black">{featureNames[feature.key][locale]}</h4>
            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">Free</dt>
                <dd className="mt-1 leading-6 text-slate-700">{feature.free}</dd>
              </div>
              <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3">
                <dt className="text-xs font-black uppercase tracking-wide text-teal-800">
                  Premium <span aria-hidden="true">✦</span>
                </dt>
                <dd className="mt-1 font-bold leading-6 text-teal-950">
                  {feature.premium}
                </dd>
              </div>
            </dl>
          </article>
        ))}
        <h4 className="mt-5 text-lg font-black">
          {vi ? "Có trong cả hai gói" : "Included in both plans"}
        </h4>
        {shared.map((feature) => (
          <article
            className="flex flex-wrap items-start justify-between gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3"
            key={feature.key}
          >
            <h5 className="font-semibold">{featureNames[feature.key][locale]}</h5>
            <p className="text-sm text-slate-600">{feature.free}</p>
          </article>
        ))}
      </div>

      <div className="mt-6 hidden overflow-hidden rounded-2xl border border-slate-200 bg-white lg:block">
        <table className="w-full table-fixed text-left">
          <caption className="sr-only">
            {vi ? "So sánh gói" : "Plan comparison"}
          </caption>
          <colgroup>
            <col className="w-[28%]" />
            <col className="w-[32%]" />
            <col className="w-[40%]" />
          </colgroup>
          <thead>
            <tr className="bg-slate-100 text-slate-900">
              <th className="px-5 py-4" scope="col">{vi ? "Tính năng" : "Feature"}</th>
              <th className="px-5 py-4" scope="col">Free</th>
              <th className="bg-teal-800 px-5 py-4 text-white" scope="col">
                Premium <span className="ml-2 text-sm font-medium text-teal-100">{vi ? "Nhiều hơn" : "More included"}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-sm font-black uppercase tracking-wide text-teal-800" colSpan={3} scope="rowgroup">
                {vi ? "Quyền lợi được nâng cấp" : "Premium upgrades"}
              </th>
            </tr>
            {upgrades.map((feature) => (
              <tr className="border-t border-slate-200" key={feature.key}>
                <th className="px-5 py-4 font-semibold leading-6" scope="row">
                  {featureNames[feature.key][locale]}
                </th>
                <td className="px-5 py-4 align-top leading-6 text-slate-600">{feature.free}</td>
                <td className="border-l border-teal-100 bg-teal-50 px-5 py-4 align-top font-bold leading-6 text-teal-950">
                  <span aria-hidden="true" className="mr-2 text-teal-700">✦</span>
                  {feature.premium}
                </td>
              </tr>
            ))}
          </tbody>
          <tbody>
            <tr className="border-t border-slate-200 bg-slate-50">
              <th className="px-5 py-3 text-sm font-black uppercase tracking-wide text-slate-600" colSpan={3} scope="rowgroup">
                {vi ? "Có trong cả hai gói" : "Included in both plans"}
              </th>
            </tr>
            {shared.map((feature) => (
              <tr className="border-t border-slate-200 last:border-0" key={feature.key}>
                <th className="px-5 py-4 font-semibold leading-6" scope="row">
                  {featureNames[feature.key][locale]}
                </th>
                <td className="px-5 py-4 align-top leading-6 text-slate-600">{feature.free}</td>
                <td className="px-5 py-4 align-top leading-6 text-slate-600">{feature.premium}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-slate-700">
          {notes.reset}
        </p>
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-950">
          {notes.mock}
        </p>
      </div>
    </section>
  );
}
