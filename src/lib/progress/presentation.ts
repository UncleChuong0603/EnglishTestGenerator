import { MIN_ATTEMPTS_FOR_CLASSIFICATION } from "@/lib/analytics/calculate";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import type { ProgressCounts } from "./types";

export function formatBreakdownMetric(
  metric: Pick<ProgressCounts, "accuracy" | "attemptedCount">,
  locale: InterfaceLanguage,
) {
  const { accuracy, attemptedCount } = metric;
  if (attemptedCount < MIN_ATTEMPTS_FOR_CLASSIFICATION || accuracy === null) {
    return locale === "vi"
      ? `Đã làm ${attemptedCount}/${MIN_ATTEMPTS_FOR_CLASSIFICATION} câu`
      : `${attemptedCount}/${MIN_ATTEMPTS_FOR_CLASSIFICATION} answers`;
  }
  return `${accuracy}% · ${attemptedCount} ${locale === "vi" ? "câu" : "answers"}`;
}
