import { DIAGNOSTIC_REASSESSMENT_INTERVAL_DAYS } from "@/lib/diagnostic/policy";
import {
  PLAN_CAPABILITIES,
  PLAN_CATALOG,
  type EntitlementKey,
  type PlanKey,
} from "@/lib/entitlements/catalog";

export type PublicFeatureKey =
  | "listeningReading"
  | "manualPractice"
  | "recommendations"
  | "mistakeBank"
  | "fullMock"
  | "diagnostic"
  | "targeting"
  | "progress"
  | "mockHistory"
  | "explanations"
  | "ranking";

export type PublicFeature = {
  key: PublicFeatureKey;
  free: string;
  premium: string;
  featured?: boolean;
};

type Unit = { singular: string; plural: string };

function formatQuota(
  locale: "vi" | "en",
  plan: PlanKey,
  key: EntitlementKey,
  unit: Unit,
) {
  const value = PLAN_CATALOG[plan].entitlements[key];
  if (value.type === "UNLIMITED") {
    return locale === "vi" ? "Không giới hạn" : "Unlimited";
  }

  const period =
    value.period === "DAY"
      ? locale === "vi"
        ? "ngày"
        : "day"
      : locale === "vi"
        ? "tháng"
        : "month";
  const noun = value.count === 1 ? unit.singular : unit.plural;
  return `${value.count} ${noun}/${period}`;
}

export function publicPlanFeatures(locale: "vi" | "en"): PublicFeature[] {
  const vi = locale === "vi";
  const quota = (
    plan: PlanKey,
    key: EntitlementKey,
    enUnit: Unit,
  ) =>
    formatQuota(
      locale,
      plan,
      key,
      vi ? { singular: "lượt", plural: "lượt" } : enUnit,
    );

  return [
    {
      key: "listeningReading",
      free: vi ? "Có" : "Included",
      premium: vi ? "Có" : "Included",
      featured: true,
    },
    {
      key: "manualPractice",
      free: quota("FREE", "MANUAL_PRACTICE", {
        singular: "session",
        plural: "sessions",
      }),
      premium: quota("PREMIUM", "MANUAL_PRACTICE", {
        singular: "session",
        plural: "sessions",
      }),
      featured: true,
    },
    {
      key: "recommendations",
      free: quota("FREE", "TODAYS_WORKOUT", {
        singular: "workout",
        plural: "workouts",
      }),
      premium: quota("PREMIUM", "TODAYS_WORKOUT", {
        singular: "workout",
        plural: "workouts",
      }),
      featured: true,
    },
    {
      key: "mistakeBank",
      free: quota("FREE", "MASTERY_REVIEW", {
        singular: "review",
        plural: "reviews",
      }),
      premium: quota("PREMIUM", "MASTERY_REVIEW", {
        singular: "review",
        plural: "reviews",
      }),
      featured: true,
    },
    {
      key: "fullMock",
      free: quota("FREE", "FULL_MOCK", {
        singular: "new mock",
        plural: "new mocks",
      }),
      premium: quota("PREMIUM", "FULL_MOCK", {
        singular: "new mock",
        plural: "new mocks",
      }),
      featured: true,
    },
    {
      key: "diagnostic",
      free: vi ? "1 bài đánh giá đầu vào" : "1 baseline diagnostic",
      premium: vi
        ? `Đầu vào + đánh giá lại mỗi ${DIAGNOSTIC_REASSESSMENT_INTERVAL_DAYS} ngày`
        : `Baseline + reassessment every ${DIAGNOSTIC_REASSESSMENT_INTERVAL_DAYS} days`,
    },
    {
      key: "targeting",
      free: vi
        ? "Lọc theo Part, skill và subskill"
        : "Part, skill and subskill filters",
      premium: vi
        ? "Thêm ưu tiên điểm yếu, lỗi sai và câu chưa làm"
        : "Adds weakness, mistake and unseen-first targeting",
    },
    {
      key: "progress",
      free: vi
        ? `Xu hướng ${PLAN_CAPABILITIES.FREE.historyWindowDays} ngày + tổng quan từng Part`
        : `${PLAN_CAPABILITIES.FREE.historyWindowDays}-day trends + Part summaries`,
      premium: vi
        ? `Xu hướng ${PLAN_CAPABILITIES.PREMIUM.historyWindowDays} ngày + phân tích skill/subskill`
        : `${PLAN_CAPABILITIES.PREMIUM.historyWindowDays}-day trends + skill/subskill analysis`,
      featured: true,
    },
    {
      key: "mockHistory",
      free: vi ? "Kết quả gần đây" : "Recent results",
      premium: vi
        ? "Toàn bộ lịch sử + xu hướng và so sánh theo Part"
        : "Full history + trends and Part comparisons",
    },
    {
      key: "explanations",
      free: vi
        ? "Tiếng Anh, Tiếng Việt hoặc song ngữ"
        : "English, Vietnamese or both",
      premium: vi
        ? "Tiếng Anh, Tiếng Việt hoặc song ngữ"
        : "English, Vietnamese or both",
    },
    {
      key: "ranking",
      free: vi ? "Có · không tính quota gói" : "Included · no plan quota",
      premium: vi ? "Có · không tính quota gói" : "Included · no plan quota",
    },
  ];
}

export function publicPlanNotes(locale: "vi" | "en") {
  return locale === "vi"
    ? {
        reset:
          "Quota ngày và tháng đặt lại lúc 00:00 theo giờ Việt Nam. Tiếp tục bài đang làm không tốn thêm lượt.",
        mock:
          "Listening Mock, Reading Mock và Full Mock dùng chung quota tạo bài mới. Quota được tính khi tạo bài; chỉ các mode có nội dung READY mới bắt đầu được.",
      }
    : {
        reset:
          "Daily and monthly quotas reset at 00:00 Vietnam time. Resuming an active session does not use another allowance.",
        mock:
          "Listening, Reading and Full Mock share the new-mock allowance. It is consumed when a run is created, and only content-ready modes can start.",
      };
}

export const PUBLIC_ACTIVATION_HREF = "/challenge/part-5";
