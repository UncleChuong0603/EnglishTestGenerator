import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type {
  PremiumPreviewData,
  PremiumValueKey,
} from "@/lib/premium/preview";

const labels: Record<PremiumValueKey, { vi: string; en: string }> = {
  analytics: {
    vi: "Phân tích skill/subskill và lịch sử dài hơn",
    en: "Skill/subskill analysis and longer history",
  },
  smartReview: {
    vi: "Smart Review cho các lỗi chưa làm chủ",
    en: "Smart Review for unresolved mistakes",
  },
  smartPriority: {
    vi: "Ưu tiên câu đã sai nhiều lần",
    en: "Prioritize repeatedly missed questions",
  },
  mockHistory: {
    vi: "So sánh các lần thi thử tương thích",
    en: "Compare compatible mock attempts",
  },
  reassessment: {
    vi: "Đánh giá lại và so sánh với mốc ban đầu",
    en: "Reassess and compare with your baseline",
  },
  targeting: {
    vi: "Target Weakness, Review Mistakes và Prefer Unseen",
    en: "Target Weakness, Review Mistakes, and Prefer Unseen",
  },
};

export function PremiumUpgradeCTA({
  locale,
  label,
  href = "/pricing",
}: {
  locale: InterfaceLanguage;
  label?: string;
  href?: string;
}) {
  return (
    <Link
      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-slate-900 px-5 py-3 font-bold text-white outline-offset-2 focus-visible:outline-2 focus-visible:outline-teal-700"
      href={href}
    >
      {label ??
        (locale === "vi" ? "Xem Premium dành cho tôi" : "See Premium for me")}
    </Link>
  );
}

export function PremiumValueList({
  locale,
  values,
}: {
  locale: InterfaceLanguage;
  values: PremiumValueKey[];
}) {
  return (
    <ul className="grid gap-2 text-sm text-slate-700">
      {values.map((value) => (
        <li className="flex gap-2" key={value}>
          <span aria-hidden="true" className="font-black text-teal-700">
            ✓
          </span>
          <span>{labels[value][locale]}</span>
        </li>
      ))}
    </ul>
  );
}

export function PremiumPreviewCard({
  locale,
  title,
  body,
  values = [],
  cta,
  href,
}: {
  locale: InterfaceLanguage;
  title: string;
  body: React.ReactNode;
  values?: PremiumValueKey[];
  cta?: string;
  href?: string;
}) {
  return (
    <section
      className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6"
      aria-label={title}
    >
      <p className="text-xs font-black uppercase tracking-[.14em] text-teal-700">
        Premium
      </p>
      <h2 className="mt-2 text-xl font-black">{title}</h2>
      <div className="mt-2 leading-7 text-slate-600">{body}</div>
      {values.length ? (
        <div className="mt-4">
          <PremiumValueList locale={locale} values={values} />
        </div>
      ) : null}
      <div className="mt-5">
        <PremiumUpgradeCTA locale={locale} label={cta} href={href} />
      </div>
    </section>
  );
}

export function PremiumRenewalCard({
  locale,
  title,
  body,
}: {
  locale: InterfaceLanguage;
  title: string;
  body: React.ReactNode;
}) {
  return (
    <section
      className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6"
      aria-label={title}
    >
      <p className="text-xs font-black uppercase tracking-[.14em] text-amber-800">
        {locale === "vi" ? "Premium đã hết hạn" : "Premium expired"}
      </p>
      <h2 className="mt-2 text-xl font-black">{title}</h2>
      <div className="mt-2 leading-7 text-slate-700">{body}</div>
      <div className="mt-5">
        <PremiumUpgradeCTA
          href="/billing"
          label={locale === "vi" ? "Khôi phục Premium" : "Restore Premium"}
          locale={locale}
        />
      </div>
    </section>
  );
}

export function PersonalizedPremiumSummary({
  locale,
  preview,
}: {
  locale: InterfaceLanguage;
  preview: PremiumPreviewData;
}) {
  if (!preview.visible || preview.values.length === 0) return null;
  const metrics = [
    preview.progress.answeredCount > 0
      ? [
          preview.progress.answeredCount,
          locale === "vi" ? "câu đã luyện" : "questions answered",
        ]
      : null,
    preview.mistakes.unresolvedCount > 0
      ? [
          preview.mistakes.unresolvedCount,
          locale === "vi" ? "lỗi chưa làm chủ" : "unresolved mistakes",
        ]
      : null,
    preview.mock.completedCount > 0
      ? [
          preview.mock.completedCount,
          locale === "vi" ? "Mock đã hoàn thành" : "completed mocks",
        ]
      : null,
  ].filter(Boolean) as Array<[number, string]>;
  return (
    <section
      className="mx-auto mt-8 max-w-5xl rounded-3xl border border-teal-200 bg-white p-6 sm:p-8"
      aria-labelledby="personal-premium"
    >
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">
        Premium
      </p>
      <h2 className="mt-2 text-2xl font-black" id="personal-premium">
        {locale === "vi" ? "Premium dành cho bạn" : "Premium for you"}
      </h2>
      <p className="mt-2 text-slate-600">
        {locale === "vi"
          ? "Đây là những quyền lợi Premium đã phù hợp với dữ liệu học tập hiện tại của bạn."
          : "Based on your current learning data, these Premium capabilities are relevant now."}
      </p>
      {metrics.length ? (
        <dl className="mt-6 grid gap-3 sm:grid-cols-3">
          {metrics.map(([value, label]) => (
            <div className="rounded-xl bg-slate-50 p-4" key={label}>
              <dd className="text-3xl font-black">{value}</dd>
              <dt className="mt-1 text-sm text-slate-600">{label}</dt>
            </div>
          ))}
        </dl>
      ) : null}
      <div className="mt-6">
        <h3 className="mb-3 text-sm font-black uppercase tracking-[.12em] text-slate-500">
          {locale === "vi" ? "Premium có thể mở" : "Premium can unlock"}
        </h3>
        <PremiumValueList locale={locale} values={preview.values} />
      </div>
    </section>
  );
}
