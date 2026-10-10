import type { InterfaceLanguage } from "@/lib/i18n/config";

type FeatureAccess = "guest" | "preview" | "account" | "availability";
type FeatureCopy = { title: string; description: string; action: string };
type Feature = {
  id: string;
  href: string;
  access: FeatureAccess;
  vi: FeatureCopy;
  en: FeatureCopy;
};

// Public descriptions reflect the basic Free experience, not Premium capabilities.
export const productFeatures = [
  { id: "quick", href: "/challenge/part-5", access: "guest",
    vi: { title: "10 câu Part 5", description: "Làm ngay không cần đăng nhập. Nộp bài để xem câu đúng, câu sai và lời giải.", action: "Làm thử 10 câu" },
    en: { title: "10 Part 5 questions", description: "Start without signing in. Submit to see correct answers, mistakes and explanations.", action: "Try 10 questions" } },
  { id: "parts", href: "/practice", access: "account",
    vi: { title: "Luyện riêng từng Part 1–7", description: "Tự chọn phần nghe hoặc đọc và số câu cho buổi luyện. Xem lời giải sau khi nộp.", action: "Chọn bài luyện" },
    en: { title: "Practice Parts 1–7", description: "Choose a Listening or Reading Part and set size. Review explanations after submission.", action: "Choose a practice set" } },
  { id: "diagnostic", href: "/diagnostic", access: "guest",
    vi: { title: "Đánh giá đầu vào", description: "Làm bài Listening và Reading để có mốc ban đầu, nhận diện Part cần ưu tiên luyện.", action: "Xem bài đánh giá" },
    en: { title: "Baseline diagnostic", description: "Take Listening and Reading questions to establish a baseline and identify Parts to work on.", action: "View the diagnostic" } },
  { id: "mock", href: "/full-mock", access: "availability",
    vi: { title: "Thi thử có đồng hồ", description: "Chọn Reading, Listening hoặc toàn bài. Trang thi thử cho biết dạng nào đã đủ nội dung để bắt đầu.", action: "Xem các dạng thi thử" },
    en: { title: "Timed mock tests", description: "Choose Reading, Listening or a full test. The mock hub shows which formats have enough content to start.", action: "View mock formats" } },
  { id: "listening", href: "/listening-lessons", access: "preview",
    vi: { title: "Nghe theo transcript", description: "Chọn audio 1, 3, 5 hoặc 10 phút. Theo dõi từng câu, ẩn transcript để tự nghe và chỉnh tốc độ phát.", action: "Chọn bài nghe" },
    en: { title: "Listen with a transcript", description: "Choose 1, 3, 5 or 10-minute audio. Follow each sentence, hide the transcript and adjust playback speed.", action: "Choose a talk" } },
  { id: "vocabulary", href: "/vocabulary", access: "preview",
    vi: { title: "Từ vựng & flashcards", description: "Học theo chủ đề, làm trắc nghiệm nghĩa, nghe phát âm và lưu từ gặp trong bài để ôn lại.", action: "Mở kho từ vựng" },
    en: { title: "Vocabulary & flashcards", description: "Study by topic, quiz word meanings, hear pronunciation and save words from practice for review.", action: "Open vocabulary" } },
  { id: "mistakes", href: "/mistakes", access: "account",
    vi: { title: "Luyện lại đúng lỗi sai", description: "Tự động gom câu đã sai, nhận ra lỗi lặp, xem lại lời giải và luyện lại đến khi kiến thức vững hơn.", action: "Mở ngân hàng lỗi sai" },
    en: { title: "Practice your real mistakes", description: "Automatically collect missed questions, spot repeated errors, revisit explanations and practice until the idea is stronger.", action: "Open your Mistake Bank" } },
  { id: "grammar", href: "/ngu-phap", access: "guest",
    vi: { title: "Ngữ pháp TOEIC A–Z", description: "Học từ khung câu, loại từ và thì đến cách áp dụng ngữ pháp khi nghe, đọc trong Part 1–7.", action: "Chọn bài ngữ pháp" },
    en: { title: "TOEIC Grammar A–Z", description: "Move from sentence structure, word forms and tense to grammar support for Listening and Reading Parts 1–7.", action: "Choose a grammar lesson" } },
  { id: "workout", href: "/dashboard", access: "account",
    vi: { title: "Bài nên học hôm nay", description: "TOEIC GYM tự chọn một buổi luyện từ kết quả theo Part và nhịp học gần đây — bạn chỉ cần mở ra và bắt đầu.", action: "Mở bài hôm nay" },
    en: { title: "What to study today", description: "TOEIC GYM selects one useful session from your Part results and recent study balance — just open it and begin.", action: "Open today’s session" } },
  { id: "progress", href: "/progress", access: "account",
    vi: { title: "Theo dõi tiến độ", description: "Xem kết quả Listening, Reading và từng Part qua lịch sử luyện để chọn phần cần ôn tiếp.", action: "Xem tiến độ học" },
    en: { title: "Track your progress", description: "Review Listening, Reading and Part results across your practice history to choose what to study next.", action: "View your progress" } },
  { id: "ranking", href: "/ranking", access: "guest",
    vi: { title: "Bảng xếp hạng", description: "Xem thứ hạng theo tuần, tháng hoặc từ trước đến nay. Đăng nhập để tích RP từ luyện tập, giữ chuỗi học và theo dõi vị trí của bạn.", action: "Xem bảng xếp hạng" },
    en: { title: "Leaderboard", description: "See rankings for the week, month, or all time. Sign in to earn RP through practice, build a study streak and follow your rank.", action: "View the leaderboard" } },
  { id: "checklist", href: "/toeic/checklist-hoc-tuan", access: "guest",
    vi: { title: "Checklist tuần học", description: "Ghi mục tiêu, câu mới đã làm và lỗi cần sửa. Dùng checklist để lên việc học cho từng buổi.", action: "Dùng checklist tuần" },
    en: { title: "Weekly study checklist", description: "Record your goals, new questions and mistakes to fix. Use the checklist to plan each study session.", action: "Use the weekly checklist" } },
  { id: "goal", href: "/settings?section=goal", access: "account",
    vi: { title: "Mục tiêu & lịch học", description: "Đặt điểm mục tiêu, ngày thi, thời gian học mỗi ngày và số buổi mỗi tuần để sắp xếp nhịp luyện.", action: "Đặt mục tiêu học" },
    en: { title: "Goals & study schedule", description: "Set a target, exam date, daily study time and weekly sessions to organize your practice.", action: "Set your study goal" } },
  { id: "weekly-plan", href: "/dashboard#weekly-plan-heading", access: "account",
    vi: { title: "Lộ trình học theo tuần", description: "Xếp các buổi luyện và ôn lỗi theo mục tiêu, thời lượng học và kết quả thật; ưu tiên được điều chỉnh lại sau mỗi tuần.", action: "Xem lộ trình tuần" },
    en: { title: "Adaptive weekly study path", description: "Arrange practice and mistake review around your goal, study time and real results, with priorities adjusted after each week.", action: "View your weekly path" } },
  { id: "weekly-review", href: "/dashboard#weekly-review", access: "account",
    vi: { title: "Tổng kết & điều chỉnh tuần", description: "Xem số ngày học, buổi hoàn thành, độ chính xác và phần cần ưu tiên để lộ trình tuần mới sát với hoạt động thật.", action: "Mở tổng kết tuần" },
    en: { title: "Weekly review & adjustment", description: "Review study days, completed sessions, accuracy and supported priorities so the new week reflects real activity.", action: "Open your weekly review" } },
  { id: "ranked-challenges", href: "/ranking?tab=READING_100", access: "guest",
    vi: { title: "Thử thách Reading & Listening", description: "Xem các thử thách được công bố, lịch bắt đầu và kết quả. Dùng tài khoản miễn phí để tham gia khi thử thách mở.", action: "Xem lịch thử thách" },
    en: { title: "Reading & Listening challenges", description: "See published challenges, start times and results. Join with a free account when a challenge is open.", action: "View challenge schedules" } },
] as const satisfies readonly Feature[];

export const featureGroups = [
  { id: "adaptive", vi: "Luyện theo lỗi sai & biết hôm nay học gì", en: "Practice from mistakes & know what to study today", features: ["workout", "mistakes", "weekly-plan", "weekly-review"] },
  { id: "tools", vi: "Công cụ học miễn phí", en: "Free learning tools", features: ["listening", "vocabulary", "grammar"] },
  { id: "practice", vi: "Làm bài & biết mình đang ở đâu", en: "Practice & find your starting point", features: ["quick", "parts", "diagnostic", "mock"] },
  { id: "habit", vi: "Mục tiêu, tiến độ & thói quen", en: "Goals, progress & study habits", features: ["goal", "progress", "checklist"] },
  { id: "community", vi: "Luyện cùng cộng đồng", en: "Practice with the community", features: ["ranking", "ranked-challenges"] },
] as const;

export function featureAccessLabel(access: FeatureAccess, locale: InterfaceLanguage) {
  if (access === "guest") return locale === "vi" ? "Miễn phí · mở ngay" : "Free · open now";
  if (access === "preview") return locale === "vi" ? "Dùng thử miễn phí · đăng nhập để mở đầy đủ" : "Free trial · sign in for full access";
  if (access === "availability") return locale === "vi" ? "Tài khoản miễn phí · theo trạng thái mở" : "Free account · subject to availability";
  return locale === "vi" ? "Với tài khoản miễn phí" : "With a free account";
}
