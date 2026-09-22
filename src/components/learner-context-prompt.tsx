import type { InterfaceLanguage } from "@/lib/i18n/config";
import { ContextForm } from "@/app/settings/context-form";
import { dismissContextPrompt } from "@/app/settings/context-actions";

export function LearnerContextPrompt({ locale }: { locale: InterfaceLanguage }) {
  const vi = locale === "vi";
  return <section className="mt-4 rounded-2xl border border-amber-200 bg-[linear-gradient(135deg,#fffbeb,#ffffff)] p-5 shadow-sm sm:p-6" aria-labelledby="learner-context-heading"><div className="max-w-2xl"><p className="text-xs font-black uppercase tracking-[.16em] text-amber-700">{vi ? "Một phút để hiểu bạn hơn" : "One minute to know you better"}</p><h2 className="mt-2 text-xl font-black" id="learner-context-heading">{vi ? "Giúp TOEICGym hiểu mục tiêu của bạn" : "Help TOEICGym understand your goals"}</h2><p className="mt-2 text-sm text-slate-600">{vi ? "Bạn đã hoàn thành hoạt động học đầu tiên. Hai câu trả lời tùy chọn này giúp chúng tôi hiểu người học, không thay đổi bài đề xuất." : "You've completed your first learning activity. These optional answers help us understand learners and do not change recommendations."}</p></div><ContextForm context={null} locale={locale} compact/><form action={dismissContextPrompt} className="mt-3"><button className="min-h-11 px-2 font-semibold text-slate-600" type="submit">{vi ? "Bỏ qua lúc này" : "Skip for now"}</button></form></section>;
}
