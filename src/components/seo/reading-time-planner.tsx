"use client";

import { useId, useRef, useState } from "react";
import { readingTimePlan, READING_MINUTES } from "@/lib/seo/reading-time-plan";

export function ReadingTimePlanner({ locale = "vi" }: { locale?: "vi" | "en" }) {
  const id = useId();
  const vi = locale === "vi";
  const [plan, setPlan] = useState(() => readingTimePlan(12, 10, 3)!);
  const [error, setError] = useState(false);
  const firstInput = useRef<HTMLInputElement>(null);
  const fields = [
    { name: "part5", label: "Part 5", value: 12, min: 1 },
    { name: "part6", label: "Part 6", value: 10, min: 1 },
    { name: "review", label: vi ? "Rà đáp án cuối bài" : "Final answer review", value: 3, min: 0 },
  ];
  return <section id="chia-thoi-gian" lang={locale} aria-labelledby={`${id}-title`} className="my-8 rounded-lg border border-[var(--line)] bg-[var(--paper)] p-5 sm:p-7">
    <h2 id={`${id}-title`} className="text-2xl font-bold text-[var(--ink)]">{vi ? "Tự chia 75 phút TOEIC Reading" : "Plan your 75-minute TOEIC Reading session"}</h2>
    <p id={`${id}-hint`} className="mt-3 leading-7 text-[var(--muted)]">{vi ? "Nhập số phút bạn muốn dành cho Part 5, Part 6 và rà đáp án. Phần còn lại dành cho Part 7. Đây là kế hoạch để thử khi luyện, không phải mốc bắt buộc của ETS." : "Choose minutes for Part 5, Part 6 and final review. The rest goes to Part 7. Use this as a practice plan; ETS does not prescribe these checkpoints."}</p>
    <form noValidate className="mt-5" aria-describedby={`${id}-hint`} onSubmit={event => {
      event.preventDefault();
      const data = new FormData(event.currentTarget);
      const values = fields.map(field => {
        const value = String(data.get(field.name) ?? "").trim();
        return value ? Number(value) : NaN;
      });
      const next = readingTimePlan(values[0], values[1], values[2]);
      setError(!next);
      if (next) setPlan(next);
      else firstInput.current?.focus();
    }}>
      <div className="grid gap-4 sm:grid-cols-3">{fields.map((field, index) => <div key={field.name}>
        <label htmlFor={`${id}-${field.name}`} className="block font-semibold text-[var(--ink)]">{field.label} ({vi ? "phút" : "min"})</label>
        <input ref={index === 0 ? firstInput : undefined} id={`${id}-${field.name}`} name={field.name} type="number" inputMode="numeric" min={field.min} max={READING_MINUTES - 1} step="1" defaultValue={field.value} required aria-describedby={error ? `${id}-error` : undefined} className="mt-2 min-h-12 w-full rounded-md border border-[var(--line)] bg-white px-3 text-[var(--ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green)]" />
      </div>)}</div>
      <button type="submit" className="mt-5 min-h-12 rounded-md bg-[var(--green)] px-5 font-bold text-white hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--green)]">{vi ? "Tính mốc thời gian" : "Calculate checkpoints"}</button>
      <p id={`${id}-error`} role="alert" className="mt-3 font-semibold text-[var(--ink)]">{error ? (vi ? "Dùng số phút nguyên: Part 5 và 6 ít nhất 1 phút, rà đáp án từ 0 phút. Tổng ba mục phải dưới 75 phút để còn thời gian cho Part 7. Kế hoạch bên dưới chưa thay đổi." : "Use whole minutes: at least 1 each for Parts 5 and 6, and 0 or more for review. Their total must be under 75 to leave time for Part 7. The plan below has not changed.") : ""}</p>
    </form>
    <div className="mt-5 border-t border-[var(--line)] pt-5">
      <p aria-live="polite" aria-atomic="true" className="font-bold text-[var(--ink)]">{vi ? `Part 7 còn ${plan.part7} phút; bắt đầu khi đồng hồ còn ${plan.part7 + plan.review} phút.` : `Part 7 has ${plan.part7} minutes; start it with ${plan.part7 + plan.review} minutes remaining.`}</p>
      <table className="mt-4 w-full text-left text-[var(--ink)]">
        <caption className="mb-3 text-left text-sm leading-6 text-[var(--muted)]">{vi ? "“Còn lại” là số phút trên đồng hồ đếm ngược khi kết thúc mỗi chặng." : "“Remaining” is the countdown clock at the end of each stage."}</caption>
        <thead><tr className="border-b border-[var(--line)]"><th scope="col" className="py-3">{vi ? "Chặng" : "Stage"}</th><th scope="col" className="px-2 py-3">{vi ? "Phút" : "Minutes"}</th><th scope="col" className="py-3">{vi ? "Còn lại" : "Remaining"}</th></tr></thead>
        <tbody>{plan.checkpoints.map(row => <tr key={row.part} className="border-b border-[var(--line)]"><th scope="row" className="py-3 font-semibold">{row.part === "review" ? (vi ? "Rà đáp án" : "Review") : row.part}</th><td className="px-2 py-3 tabular-nums">{row.minutes}</td><td className="py-3 tabular-nums">{row.remaining}</td></tr>)}</tbody>
      </table>
      <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{vi ? "Thử trên câu chưa làm; ghi số đúng, số đoán vì hết giờ và mốc thực tế. Điều chỉnh thời gian sau khi sửa lỗi." : "Try this on unfamiliar questions. Record correct answers, time-driven guesses and actual checkpoints, then adjust after reviewing mistakes."}</p>
      <noscript><p className="mt-3 leading-7">{vi ? "Bảng mặc định dùng được ngay. Để tự đổi khung khi tắt JavaScript: thời gian Part 7 = 75 − Part 5 − Part 6 − rà đáp án." : "The default plan works without JavaScript. To adjust manually: Part 7 minutes = 75 − Part 5 − Part 6 − final review."}</p></noscript>
    </div>
  </section>;
}
