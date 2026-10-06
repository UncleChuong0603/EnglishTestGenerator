"use client";

import { useActionState } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { saveLearningEmailPreference, type LearningEmailActionState } from "./actions";

const initialState: LearningEmailActionState = { ok: false };

export function LearningEmailForm({ enabled, locale }: { enabled: boolean; locale: InterfaceLanguage }) {
  const [state, action, pending] = useActionState(saveLearningEmailPreference, initialState);
  const vi = locale === "vi";
  const selected = state.ok && typeof state.enabled === "boolean" ? state.enabled : enabled;
  return <form action={action} aria-busy={pending} className="space-y-6">
    <fieldset>
      <legend className="font-bold">{vi ? "Email học tập & nhắc luyện" : "Learning reports & reminders"}</legend>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#52645a]">
        {vi
          ? "Nhận tổng kết tuần dựa trên dữ liệu học thật và lời nhắc ngắn để quay lại đúng bài tiếp theo. TOEIC GYM gửi tối đa một email trong 24 giờ."
          : "Receive a weekly report based on your real learning activity and short reminders that link to your next useful practice. TOEIC GYM sends at most one email in 24 hours."}
      </p>
      <ul className="mt-5 grid gap-3 text-sm text-[#294838] sm:grid-cols-2">
        <li className="rounded-xl border border-[#dce3d9] bg-[#f3f8f1] px-4 py-3 font-semibold">{vi ? "Tổng kết: ngày học, số câu và độ chính xác" : "Review: learning days, questions and accuracy"}</li>
        <li className="rounded-xl border border-[#dce3d9] bg-[#f3f8f1] px-4 py-3 font-semibold">{vi ? "Nhắc sau buổi đầu hoặc khi nghỉ học 3 ngày" : "Reminders after your first session or 3 inactive days"}</li>
      </ul>
      <div className="mt-4 space-y-2">
        {([
          ["true", vi ? "Bật email học tập" : "Turn on learning emails", vi ? "Cho phép gửi báo cáo và lời nhắc học." : "Allow learning reports and reminders."],
          ["false", vi ? "Tắt email học tập" : "Turn off learning emails", vi ? "Không gửi báo cáo hoặc lời nhắc học." : "Do not send learning reports or reminders."],
        ] as const).map(([value, label, help]) => <label className="flex min-h-16 cursor-pointer items-start gap-3 rounded-xl border border-[#cbd7cb] p-4 transition-colors hover:bg-[#f7faf6] focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#245a43] has-checked:border-[#245a43] has-checked:bg-[#edf5ef]" key={value}>
          <input aria-describedby={`learning-email-${value}-help`} className="mt-0.5 size-5 shrink-0 accent-[#245a43]" defaultChecked={selected === (value === "true")} name="learningEmailEnabled" required type="radio" value={value} />
          <span><span className="block font-semibold text-[#172821]">{label}</span><span className="mt-1 block text-sm leading-5 text-[#52645a]" id={`learning-email-${value}-help`}>{help}</span></span>
        </label>)}
      </div>
    </fieldset>
    <p className="rounded-xl border border-[#dce3d9] bg-[#fbfcfa] p-4 text-sm leading-6 text-[#52645a]">
      {vi
        ? "Bạn có thể đổi lựa chọn hoặc hủy đăng ký bằng liên kết trong mỗi email. Email xác minh và bảo mật không phụ thuộc lựa chọn này."
        : "You can change this choice or unsubscribe from any learning email. Verification and security emails are not affected."}
    </p>
    {state.error ? <p className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
      {vi ? "Không thể lưu lựa chọn. Vui lòng thử lại." : "We couldn't save your choice. Please try again."}
    </p> : state.ok ? <p className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800" role="status">
      {state.enabled
        ? vi ? "Đã bật email học tập." : "Learning emails are on."
        : vi ? "Đã tắt email học tập." : "Learning emails are off."}
    </p> : null}
    <div className="border-t border-[#edf1eb] pt-6"><button className="min-h-12 rounded-xl bg-[#245a43] px-5 py-3 font-bold text-white transition-colors hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43] disabled:cursor-not-allowed disabled:opacity-50" disabled={pending} type="submit">
      {pending ? (vi ? "Đang lưu…" : "Saving…") : (vi ? "Lưu lựa chọn" : "Save choice")}
    </button></div>
  </form>;
}
