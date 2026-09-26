import { productWeekWindow } from "@/lib/weekly-plan/policy";

export type LifecycleType = "weekly_review" | "inactive_3d" | "day1_return" | "signup_no_learning";
export type LearningFacts = { createdAt: Date; sessions: Date[]; sessionCount?: number; previousWeekSessions: number };
export type LifecycleCandidate = { type: LifecycleType; windowKey: string };
const HOUR = 3_600_000;
const DAY = 24 * HOUR;

/** Submitted ordinary learning only. Weekly review outranks every return reminder. */
export function lifecycleCandidates(facts: LearningFacts, now: Date): LifecycleCandidate[] {
  const sessions = [...facts.sessions].sort((a, b) => a.getTime() - b.getTime());
  const first = sessions[0];
  const last = sessions.at(-1);
  const age = (date: Date) => now.getTime() - date.getTime();
  const result: LifecycleCandidate[] = [];
  const week = productWeekWindow(now);
  // Review is sent only once the completed week has ended, and after 08:00 in Vietnam.
  const hoursIntoWeek = (now.getTime() - week.start.getTime()) / HOUR;
  if (facts.previousWeekSessions > 0 && hoursIntoWeek >= 8 && hoursIntoWeek < 72)
    result.push({ type: "weekly_review", windowKey: new Date(week.start.getTime() - 7 * DAY + 7 * HOUR).toISOString().slice(0, 10) });
  if (last && age(last) >= 3 * DAY && age(last) < 4 * DAY)
    result.push({ type: "inactive_3d", windowKey: last.toISOString() });
  if (first && (facts.sessionCount ?? sessions.length) === 1 && age(first) >= DAY && age(first) < 2 * DAY)
    result.push({ type: "day1_return", windowKey: first.toISOString() });
  if (!first && age(facts.createdAt) >= DAY && age(facts.createdAt) < 2 * DAY)
    result.push({ type: "signup_no_learning", windowKey: facts.createdAt.toISOString() });
  return result;
}

export function lifecycleMessage(type: LifecycleType, url: string, unsubscribeUrl: string, details?: { sessions?: number; hasGoal?: boolean }) {
  const link = `${url}${type === "weekly_review" ? "/dashboard#weekly-review" : details?.hasGoal ? "/dashboard#weekly-plan-heading" : "/dashboard#today-workout"}`;
  const content: Record<LifecycleType, { subject: string; body: string }> = {
    weekly_review: { subject: "Tuần học vừa rồi của bạn", body: `Bạn đã hoàn thành ${details?.sessions ?? 1} buổi học trong tuần vừa rồi. Xem lại những gì đã học và chọn bước tiếp theo:` },
    inactive_3d: { subject: "Tiếp tục luyện tập khi bạn sẵn sàng", body: "Bạn đã có buổi học trên TOEICGym. Bài luyện và kế hoạch hiện tại vẫn ở đây để bạn tiếp tục:" },
    day1_return: { subject: "Tiếp tục sau buổi học đầu tiên", body: "Bạn đã hoàn thành buổi học đầu tiên. Khi có thời gian, bạn có thể tiếp tục với bài luyện hôm nay:" },
    signup_no_learning: { subject: "Bắt đầu buổi luyện đầu tiên", body: "Bạn đã tạo tài khoản TOEICGym. Có một bài luyện ngắn để bắt đầu khi bạn sẵn sàng:" },
  };
  return { subject: content[type].subject, text: `${content[type].body}\n${link}\n\nKhông muốn nhận email học tập? Hủy đăng ký: ${unsubscribeUrl}` };
}
