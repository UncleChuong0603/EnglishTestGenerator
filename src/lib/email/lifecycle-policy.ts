import { productWeekWindow } from "@/lib/weekly-plan/policy";
import type { InterfaceLanguage } from "@/lib/i18n/config";

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

export type LifecycleMessageDetails = {
  locale?: InterfaceLanguage;
  sessions?: number;
  learningDays?: number;
  answered?: number;
  accuracy?: number | null;
  focusPart?: number | null;
  hasGoal?: boolean;
};

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

export function lifecycleMessage(type: LifecycleType, url: string, unsubscribeUrl: string, details: LifecycleMessageDetails = {}) {
  const vi = (details.locale ?? "vi") === "vi";
  const link = `${url}${type === "weekly_review" ? "/dashboard#weekly-review" : details.hasGoal ? "/dashboard#weekly-plan-heading" : "/dashboard#today-workout"}`;
  const sessions = details.sessions ?? 1;
  const weeklyFacts = vi
    ? [details.learningDays === undefined ? null : `${details.learningDays} ngày học`, `${sessions} buổi học`, details.answered === undefined ? null : `${details.answered} câu đã trả lời`, details.accuracy === null || details.accuracy === undefined ? null : `độ chính xác ${details.accuracy}%`].filter(Boolean).join(" · ")
    : [details.learningDays === undefined ? null : `${details.learningDays} learning days`, `${sessions} completed sessions`, details.answered === undefined ? null : `${details.answered} questions answered`, details.accuracy === null || details.accuracy === undefined ? null : `${details.accuracy}% accuracy`].filter(Boolean).join(" · ");
  const focus = details.focusPart
    ? vi ? `Gợi ý tuần này: tiếp tục luyện Part ${details.focusPart}.` : `Suggested focus this week: continue with Part ${details.focusPart}.`
    : vi ? "Mở tổng kết để chọn bước học tiếp theo." : "Open your review to choose the next useful practice step.";
  const content: Record<LifecycleType, { subject: string; body: string; action: string }> = {
    weekly_review: vi
      ? { subject: "Tổng kết tuần TOEIC của bạn", body: `Tuần vừa rồi: ${weeklyFacts}.\n${focus}`, action: "Xem tổng kết và kế hoạch tuần mới" }
      : { subject: "Your TOEIC weekly review", body: `Last week: ${weeklyFacts}.\n${focus}`, action: "View your review and new weekly plan" },
    inactive_3d: vi
      ? { subject: "Tiếp tục luyện tập khi bạn sẵn sàng", body: "Bài luyện và kế hoạch hiện tại vẫn ở đây. Bạn có thể quay lại với một buổi học ngắn.", action: "Tiếp tục luyện tập" }
      : { subject: "Continue practicing when you're ready", body: "Your current practice and plan are still here. Return with one short learning session when you're ready.", action: "Continue practicing" },
    day1_return: vi
      ? { subject: "Tiếp tục sau buổi học đầu tiên", body: "Bạn đã hoàn thành buổi học đầu tiên. Bài luyện hôm nay đã sẵn sàng khi bạn muốn tiếp tục.", action: "Làm bài luyện hôm nay" }
      : { subject: "Continue after your first learning session", body: "You completed your first learning session. Today's practice is ready whenever you want to continue.", action: "Start today's practice" },
    signup_no_learning: vi
      ? { subject: "Bắt đầu buổi luyện đầu tiên", body: "Tài khoản TOEICGym của bạn đã sẵn sàng. Hãy bắt đầu với một bài luyện ngắn để hệ thống dần cá nhân hóa lộ trình.", action: "Bắt đầu luyện tập" }
      : { subject: "Start your first TOEIC practice", body: "Your TOEICGym account is ready. Start with a short practice so your learning path can become more personalized.", action: "Start practicing" },
  };
  const message = content[type];
  const unsubscribe = vi ? "Không muốn nhận email học tập?" : "Don't want learning emails?";
  const text = `${message.body}\n\n${message.action}: ${link}\n\n${unsubscribe} ${vi ? "Hủy đăng ký" : "Unsubscribe"}: ${unsubscribeUrl}`;
  const htmlBody = message.body.split("\n").map(line => `<p style="margin:0 0 12px;line-height:1.65">${escapeHtml(line)}</p>`).join("");
  const html = `<!doctype html><html lang="${vi ? "vi" : "en"}"><body style="margin:0;background:#f7f6f1;color:#172821;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 12px"><tr><td align="center"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#fff;border:1px solid #dce3d9;border-radius:16px"><tr><td style="padding:28px"><p style="margin:0 0 10px;color:#245a43;font-size:12px;font-weight:700;letter-spacing:.12em">TOEIC GYM</p><h1 style="margin:0 0 20px;font-size:24px;line-height:1.3">${escapeHtml(message.subject)}</h1>${htmlBody}<p style="margin:24px 0"><a href="${escapeHtml(link)}" style="display:inline-block;border-radius:10px;background:#245a43;color:#fff;padding:13px 18px;font-weight:700;text-decoration:none">${escapeHtml(message.action)}</a></p><p style="margin:24px 0 0;color:#45584d;font-size:12px;line-height:1.6">${escapeHtml(unsubscribe)} <a href="${escapeHtml(unsubscribeUrl)}" style="color:#245a43">${vi ? "Hủy đăng ký" : "Unsubscribe"}</a>.</p></td></tr></table></td></tr></table></body></html>`;
  return { subject: message.subject, text, html, headers: { "List-Unsubscribe": `<${unsubscribeUrl}>` } };
}
