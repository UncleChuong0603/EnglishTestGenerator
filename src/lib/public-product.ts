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
  | "smartReview"
  | "weeklyPlan"
  | "weeklyReview"
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
  availability: "AVAILABLE_NOW" | "READINESS_GATED";
};

/** The mock engine and its history are advertised only while a startable mock mode exists. */
export const PUBLIC_FEATURE_AVAILABILITY: Record<PublicFeatureKey, PublicFeature["availability"]> = {
  listeningReading: "AVAILABLE_NOW", manualPractice: "AVAILABLE_NOW", recommendations: "AVAILABLE_NOW",
  mistakeBank: "AVAILABLE_NOW", smartReview: "AVAILABLE_NOW", weeklyPlan: "AVAILABLE_NOW",
  weeklyReview: "AVAILABLE_NOW", fullMock: "READINESS_GATED", diagnostic: "AVAILABLE_NOW",
  targeting: "AVAILABLE_NOW", progress: "AVAILABLE_NOW", mockHistory: "READINESS_GATED",
  explanations: "AVAILABLE_NOW", ranking: "AVAILABLE_NOW",
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

export function publicPlanFeatures(locale: "vi" | "en", mockReady = false): PublicFeature[] {
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

  const features: Omit<PublicFeature, "availability">[] = [
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
      key: "smartReview",
      free: vi ? "Ngân hàng lỗi sai và ôn cơ bản" : "Mistake Bank and basic review",
      premium: vi ? "Thêm Smart Review ưu tiên lỗi cần ôn" : "Adds Smart Review for mistakes needing attention",
      featured: true,
    },
    {
      key: "weeklyPlan",
      free: vi ? "Kế hoạch tuần cơ bản đầy đủ" : "Full basic weekly plan",
      premium: vi ? "Kế hoạch theo mục tiêu và điểm yếu, kèm lịch sử học" : "Goal and weakness focused plan with study history",
      featured: true,
    },
    {
      key: "weeklyReview",
      free: vi ? "Tổng kết hoạt động và độ chính xác" : "Activity and accuracy summary",
      premium: vi ? "Thêm phân tích Part, kỹ năng và so sánh khi đủ dữ liệu" : "Adds Part, skill and prior-week comparisons when supported by data",
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
        ? `Đầu vào + đánh giá lại sau thời gian chờ ${DIAGNOSTIC_REASSESSMENT_INTERVAL_DAYS} ngày`
        : `Baseline + reassessment after a ${DIAGNOSTIC_REASSESSMENT_INTERVAL_DAYS}-day cooldown`,
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
  return features.filter(feature => mockReady || PUBLIC_FEATURE_AVAILABILITY[feature.key] === "AVAILABLE_NOW")
    .map(feature => ({ ...feature, availability: PUBLIC_FEATURE_AVAILABILITY[feature.key] }));
}

export function publicPlanNotes(locale: "vi" | "en") {
  return locale === "vi"
    ? {
        reset:
          "Quota ngày và tháng đặt lại lúc 00:00 theo giờ Việt Nam. Tiếp tục bài đang làm không tốn thêm lượt.",
        mock:
          "Các bài Mock tạo qua hệ thống thi thử dùng chung quota tạo bài mới; bài Reading demo là trải nghiệm riêng. Quota được tính khi tạo bài Mock; chỉ mode có nội dung READY mới bắt đầu được.",
      }
    : {
        reset:
          "Daily and monthly quotas reset at 00:00 Vietnam time. Resuming an active session does not use another allowance.",
        mock:
          "New runs in the Mock system share the new-mock allowance; the Reading demo is separate. The allowance is consumed when a Mock run is created, and only content-ready modes can start.",
      };
}

export const PUBLIC_ACTIVATION_HREF = "/challenge/part-5";
