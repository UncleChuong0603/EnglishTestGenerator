import Link from "next/link";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export function NextLearningStep({
  locale,
  wrongCount,
  hasRecommendation,
}: {
  locale: InterfaceLanguage;
  wrongCount: number;
  hasRecommendation: boolean;
}) {
  const vi = locale === "vi";
  return (
    <section
      aria-labelledby="next-learning-step-heading"
      className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5 text-slate-900 sm:p-6"
    >
      <p className="text-xs font-black uppercase tracking-[.16em] text-teal-700">
        {vi ? "Bước học tiếp theo" : "Your next learning step"}
      </p>
      <h2 className="mt-2 text-xl font-black" id="next-learning-step-heading">
        {wrongCount > 0
          ? vi
            ? `${wrongCount} câu chưa đúng đã sẵn sàng để xem lại`
            : `${wrongCount} incorrect ${wrongCount === 1 ? "answer is" : "answers are"} ready to review`
          : vi
            ? "Kết quả này đã được lưu vào lịch sử học"
            : "This result is saved to your learning history"}
      </h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-700">
        {hasRecommendation
          ? vi
            ? "Bài luyện bên dưới được tính lại từ dữ liệu thật sau phiên này. Lần học tới, Dashboard sẽ tiếp tục từ bài đang dở hoặc bước phù hợp nhất còn lại."
            : "The practice below was recalculated from real evidence after this session. Next time, Dashboard will resume unfinished work or show the most useful available step."
          : vi
            ? "Lần học tới, Dashboard sẽ dùng lịch sử đã lưu để hiển thị bước phù hợp đang có."
            : "Next time, Dashboard will use your saved history to show the most useful available step."}
      </p>
      {!hasRecommendation ? (
        <Link
          className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-teal-700 px-5 py-3 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
          href="/dashboard#today-workout"
        >
          {vi ? "Mở bước học tiếp theo" : "Open your next learning step"}
        </Link>
      ) : null}
    </section>
  );
}
