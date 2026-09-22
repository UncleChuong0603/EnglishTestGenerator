import { PRODUCT_TIME_ZONE, getDailyUsageWindow } from "@/lib/entitlements/catalog";
import { getVietnamLocalDate } from "@/lib/gamification/time";

export const RETENTION_WINDOW_DAYS = 7;

export const MEANINGFUL_LEARNING_EXCLUDED_SOURCES = [
  "diagnostic",
  "full_mock",
  "ranked_challenge",
] as const;

export const RETENTION_METRIC_DEFINITIONS = {
  ACTIVATED:
    "Registered learner with at least one meaningful submitted learning session at any time.",
  LEARNING_DAY:
    "Asia/Ho_Chi_Minh product day with at least one meaningful submitted learning session.",
  RETURNED_2_DAYS_7D:
    "Registered learner with meaningful learning on at least two distinct product days in the current seven-product-day window.",
  RETURNED_3_DAYS_7D:
    "Registered learner with meaningful learning on at least three distinct product days in the current seven-product-day window.",
  NO_MEANINGFUL_LEARNING:
    "Registered learner who has never completed a meaningful submitted learning session.",
} as const;

export type RetentionMetricKey = keyof typeof RETENTION_METRIC_DEFINITIONS;

export type UserActivityCategory =
  | "ACCOUNT"
  | "GOAL"
  | "DIAGNOSTIC"
  | "PRACTICE"
  | "WORKOUT"
  | "REVIEW"
  | "MOCK"
  | "PREMIUM"
  | "PRODUCT";

export type UserActivityAction =
  | "ACCOUNT_CREATED"
  | "ACCOUNT_VERIFIED"
  | "ACCOUNT_ACTIVATED"
  | "ACCOUNT_SUSPENDED"
  | "ACCOUNT_REACTIVATED"
  | "ADMIN_ROLE_GRANTED"
  | "ADMIN_ROLE_REVOKED"
  | "PASSWORD_UPDATED"
  | "GOOGLE_LINKED"
  | "SESSION_REVOKED"
  | "SIGNED_IN"
  | "GOAL_CONFIGURED"
  | "DIAGNOSTIC_STARTED"
  | "DIAGNOSTIC_COMPLETED"
  | "PRACTICE_STARTED"
  | "PRACTICE_COMPLETED"
  | "WORKOUT_STARTED"
  | "WORKOUT_COMPLETED"
  | "REVIEW_STARTED"
  | "REVIEW_COMPLETED"
  | "MOCK_STARTED"
  | "MOCK_COMPLETED"
  | "TRY_VIEWED"
  | "PRICING_VIEWED"
  | "CHECKOUT_STARTED"
  | "PREMIUM_ACTIVATED"
  | "PREMIUM_REVOKED";

export type UserActivityMetadata = {
  part?: number;
  skillArea?: "LISTENING" | "READING";
  practiceSource?: string;
  questionCount?: number;
  correctCount?: number;
  totalCount?: number;
  accuracy?: number;
  targetScore?: number;
  examDate?: string;
  dailyStudyMinutes?: number;
  studyDaysPerWeek?: number;
  diagnosticPurpose?: string;
  mockMode?: string;
  planSource?: string;
  orderStatus?: string;
  route?: string;
};

export type UserActivityItem = {
  key: string;
  occurredAt: Date;
  category: UserActivityCategory;
  action: UserActivityAction;
  source: string;
  summary: string | null;
  metadata: UserActivityMetadata;
  priority: number;
};

export type LearnerActivityState =
  | "NO_LEARNING_YET"
  | "ONE_DAY_LEARNER"
  | "RETURNING_LEARNER"
  | "INACTIVE";

export function getRetentionProductWindow(now = new Date()) {
  const current = getDailyUsageWindow(now);
  return {
    start: new Date(current.start.getTime() - (RETENTION_WINDOW_DAYS - 1) * 86_400_000),
    end: current.resetAt,
  };
}

export function getProductDay(date: Date) {
  return getVietnamLocalDate(date);
}

export function countProductDays(dates: readonly Date[]) {
  return new Set(dates.map(getProductDay)).size;
}

export function getLearnerActivityState(input: {
  learningDays: number;
  lastLearningAt: Date | null;
  now?: Date;
}): LearnerActivityState {
  if (!input.learningDays || !input.lastLearningAt) return "NO_LEARNING_YET";
  if (input.lastLearningAt < getRetentionProductWindow(input.now).start) return "INACTIVE";
  return input.learningDays === 1 ? "ONE_DAY_LEARNER" : "RETURNING_LEARNER";
}

export function getLastMeaningfulAction(items: readonly UserActivityItem[]) {
  return [...items].sort(
    (a, b) =>
      b.occurredAt.getTime() - a.occurredAt.getTime() ||
      b.priority - a.priority ||
      b.key.localeCompare(a.key),
  )[0] ?? null;
}

const categoryLabels: Record<UserActivityCategory, { vi: string; en: string }> = {
  ACCOUNT: { vi: "Tài khoản", en: "Account" },
  GOAL: { vi: "Mục tiêu", en: "Goal" },
  DIAGNOSTIC: { vi: "Chẩn đoán", en: "Diagnostic" },
  PRACTICE: { vi: "Luyện tập", en: "Practice" },
  WORKOUT: { vi: "Bài hôm nay", en: "Workout" },
  REVIEW: { vi: "Ôn câu sai", en: "Review" },
  MOCK: { vi: "Thi thử", en: "Mock" },
  PREMIUM: { vi: "Premium", en: "Premium" },
  PRODUCT: { vi: "Sản phẩm", en: "Product" },
};

const actionLabels: Record<UserActivityAction, { vi: string; en: string }> = {
  ACCOUNT_CREATED: { vi: "Tạo tài khoản", en: "Account created" },
  ACCOUNT_VERIFIED: { vi: "Xác minh email", en: "Email verified" },
  ACCOUNT_ACTIVATED: { vi: "Kích hoạt tài khoản", en: "Account activated" },
  ACCOUNT_SUSPENDED: { vi: "Tạm khóa tài khoản", en: "Account suspended" },
  ACCOUNT_REACTIVATED: { vi: "Mở khóa tài khoản", en: "Account reactivated" },
  ADMIN_ROLE_GRANTED: { vi: "Cấp quyền Admin", en: "Admin role granted" },
  ADMIN_ROLE_REVOKED: { vi: "Thu hồi quyền Admin", en: "Admin role revoked" },
  PASSWORD_UPDATED: { vi: "Cập nhật mật khẩu", en: "Password updated" },
  GOOGLE_LINKED: { vi: "Liên kết Google", en: "Google linked" },
  SESSION_REVOKED: { vi: "Thu hồi phiên đăng nhập", en: "Session revoked" },
  SIGNED_IN: { vi: "Đăng nhập", en: "Signed in" },
  GOAL_CONFIGURED: { vi: "Thiết lập mục tiêu", en: "Goal configured" },
  DIAGNOSTIC_STARTED: { vi: "Bắt đầu chẩn đoán", en: "Diagnostic started" },
  DIAGNOSTIC_COMPLETED: { vi: "Hoàn thành chẩn đoán", en: "Diagnostic completed" },
  PRACTICE_STARTED: { vi: "Bắt đầu luyện tập", en: "Practice started" },
  PRACTICE_COMPLETED: { vi: "Hoàn thành luyện tập", en: "Practice completed" },
  WORKOUT_STARTED: { vi: "Bắt đầu bài hôm nay", en: "Workout started" },
  WORKOUT_COMPLETED: { vi: "Hoàn thành bài hôm nay", en: "Workout completed" },
  REVIEW_STARTED: { vi: "Bắt đầu ôn câu sai", en: "Mistake review started" },
  REVIEW_COMPLETED: { vi: "Hoàn thành ôn câu sai", en: "Mistake review completed" },
  MOCK_STARTED: { vi: "Bắt đầu thi thử", en: "Mock started" },
  MOCK_COMPLETED: { vi: "Hoàn thành thi thử", en: "Mock completed" },
  TRY_VIEWED: { vi: "Mở bài thử", en: "Opened Try" },
  PRICING_VIEWED: { vi: "Xem bảng giá", en: "Pricing viewed" },
  CHECKOUT_STARTED: { vi: "Bắt đầu thanh toán", en: "Checkout started" },
  PREMIUM_ACTIVATED: { vi: "Kích hoạt Premium", en: "Premium activated" },
  PREMIUM_REVOKED: { vi: "Thu hồi Premium", en: "Premium revoked" },
};

const stateLabels: Record<LearnerActivityState, { vi: string; en: string }> = {
  NO_LEARNING_YET: { vi: "Chưa học", en: "No learning yet" },
  ONE_DAY_LEARNER: { vi: "Học 1 ngày", en: "One-day learner" },
  RETURNING_LEARNER: { vi: "Đã quay lại học", en: "Returning learner" },
  INACTIVE: { vi: "Chưa học trong 7 ngày", en: "No learning in 7 days" },
};

export function userActivityCategoryLabel(category: UserActivityCategory, vi: boolean) {
  return categoryLabels[category][vi ? "vi" : "en"];
}

export function userActivityActionLabel(action: UserActivityAction, vi: boolean) {
  return actionLabels[action][vi ? "vi" : "en"];
}

export function learnerActivityStateLabel(state: LearnerActivityState, vi: boolean) {
  return stateLabels[state][vi ? "vi" : "en"];
}

const numericMetadata = new Set([
  "part",
  "questionCount",
  "correctCount",
  "totalCount",
  "accuracy",
  "targetScore",
  "dailyStudyMinutes",
  "studyDaysPerWeek",
]);
const stringMetadata = new Set([
  "skillArea",
  "practiceSource",
  "examDate",
  "diagnosticPurpose",
  "mockMode",
  "planSource",
  "orderStatus",
  "route",
]);

export function safeUserActivityMetadata(value: unknown): UserActivityMetadata {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const safe: Record<string, string | number> = {};
  for (const [key, item] of Object.entries(value)) {
    if (numericMetadata.has(key) && typeof item === "number" && Number.isFinite(item)) safe[key] = item;
    if (stringMetadata.has(key) && typeof item === "string" && item.length <= 160) safe[key] = item;
  }
  return safe as UserActivityMetadata;
}

export const RETENTION_PRODUCT_TIME_ZONE = PRODUCT_TIME_ZONE;
