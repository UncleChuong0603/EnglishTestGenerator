import type { Metadata } from "next";
import { PublicFooter } from "@/components/public-footer";
import { PublicHeader } from "@/components/public-header";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { submitFeedback } from "./actions";

export const metadata: Metadata = { title: "Hỗ trợ TOEIC GYM", description: "Tìm câu trả lời thường gặp và gửi yêu cầu hỗ trợ cho đội ngũ TOEIC GYM.", alternates: { canonical: "/support" } };

const faq = {
  vi: [
    ["Kết quả luyện tập được tính như thế nào?", "Kết quả trên TOEIC GYM là độ chính xác thô dựa trên câu bạn đã làm, không phải điểm TOEIC chính thức."],
    ["Tôi gặp lỗi khi đang làm bài thì sao?", "Hãy ghi rõ trang, thời điểm và thao tác ngay trước khi lỗi xảy ra. Nếu có thể, thêm đường dẫn trang để đội ngũ kiểm tra nhanh hơn."],
    ["Tôi có thể góp ý về câu hỏi hoặc đáp án không?", "Có. Chọn mục Nội dung học tập và ghi Part, nội dung câu hỏi hoặc vấn đề bạn nhận thấy."],
    ["Khi nào tôi nhận được phản hồi?", "Phản hồi được ghi nhận ngay. Các vấn đề tài khoản và thanh toán sẽ được ưu tiên xử lý trước."],
  ],
  en: [
    ["How are practice results calculated?", "TOEIC GYM reports raw accuracy from completed questions. It is not an official TOEIC score."],
    ["What should I include when reporting a bug?", "Tell us the page, approximate time, and what you did immediately before the issue. Add the page URL when possible."],
    ["Can I report a question or answer?", "Yes. Choose Learning content and include the Part, question text, or the issue you noticed."],
    ["When will I hear back?", "Your message is recorded immediately. Account and payment issues receive priority."],
  ],
} as const;

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ sent?: string; error?: string }> }) {
  const user = await getCurrentUser();
  const preferences = await getPreferences(user?.id);
  const vi = preferences.interfaceLanguage === "vi";
  const query = await searchParams;
  const error = query.error === "rate" ? (vi ? "Bạn đã gửi khá nhiều phản hồi. Vui lòng thử lại sau." : "You have sent several messages. Please try again later.") : query.error ? (vi ? "Chưa thể gửi phản hồi. Kiểm tra các trường và thử lại." : "We could not send your feedback. Check the fields and try again.") : null;
  return <main className="min-h-screen bg-[#f4f8f6] text-slate-900">
    <PublicHeader locale={preferences.interfaceLanguage} signedIn={Boolean(user)} />
    <section className="overflow-hidden border-b border-emerald-100 bg-[radial-gradient(circle_at_top_right,_#ccfbf1,_transparent_42%),linear-gradient(135deg,#f0fdfa,#ffffff_58%)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_.8fr] lg:items-center">
        <div><p className="text-sm font-black uppercase tracking-[.18em] text-teal-700">{vi ? "Trung tâm trợ giúp" : "Help center"}</p><h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">{vi ? "Bạn cần hỗ trợ? Chúng tôi đang lắng nghe." : "Need a hand? We are listening."}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">{vi ? "Tìm câu trả lời nhanh hoặc gửi vấn đề trực tiếp. Mô tả càng cụ thể, đội ngũ càng có thể hỗ trợ bạn nhanh hơn." : "Find a quick answer or send the issue directly. The more detail you share, the faster the team can help."}</p></div>
        <div className="rounded-3xl border border-white/80 bg-white/85 p-6 shadow-xl shadow-teal-900/5 backdrop-blur"><p className="text-sm font-bold text-teal-800">{vi ? "Để được hỗ trợ nhanh" : "For faster help"}</p><ol className="mt-4 space-y-3 text-sm leading-6 text-slate-600"><li><strong className="text-slate-900">1.</strong> {vi ? "Chọn đúng loại vấn đề." : "Choose the closest issue type."}</li><li><strong className="text-slate-900">2.</strong> {vi ? "Ghi rõ bạn đang ở trang nào." : "Tell us which page you were on."}</li><li><strong className="text-slate-900">3.</strong> {vi ? "Không gửi mật khẩu hoặc thông tin thẻ." : "Never share passwords or card details."}</li></ol></div>
      </div>
    </section>
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:py-16">
      <section aria-labelledby="faq-title"><p className="text-sm font-black uppercase tracking-[.16em] text-teal-700">FAQ</p><h2 className="mt-2 text-3xl font-black" id="faq-title">{vi ? "Câu hỏi thường gặp" : "Common questions"}</h2><div className="mt-6 space-y-3">{faq[vi ? "vi" : "en"].map(([question, answer]) => <details className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={question}><summary className="flex min-h-7 cursor-pointer list-none items-start justify-between gap-4 font-bold"><span>{question}</span><span aria-hidden className="text-xl text-teal-700 group-open:rotate-45">+</span></summary><p className="mt-3 pr-8 text-sm leading-6 text-slate-600">{answer}</p></details>)}</div></section>
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8" id="feedback" aria-labelledby="feedback-title"><p className="text-sm font-black uppercase tracking-[.16em] text-teal-700">{vi ? "Phản hồi" : "Feedback"}</p><h2 className="mt-2 text-3xl font-black" id="feedback-title">{vi ? "Gửi yêu cầu hỗ trợ" : "Send a support request"}</h2><p className="mt-3 text-sm leading-6 text-slate-600">{vi ? "Thông tin này chỉ được dùng để xử lý yêu cầu của bạn." : "We only use this information to handle your request."}</p>
        {query.sent === "1" ? <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-950" role="status"><strong>{vi ? "Đã gửi phản hồi." : "Feedback sent."}</strong><p className="mt-1 text-sm">{vi ? "Cảm ơn bạn đã giúp TOEIC GYM tốt hơn." : "Thank you for helping make TOEIC GYM better."}</p></div> : null}
        {error ? <p className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800" role="alert">{error}</p> : null}
        <form action={submitFeedback} className="mt-6 grid gap-5"><div className="sr-only" aria-hidden="true"><label htmlFor="website">Website</label><input autoComplete="off" id="website" name="website" tabIndex={-1} /></div><div><label className="text-sm font-bold" htmlFor="email">Email</label><input className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4 focus:border-teal-700" defaultValue={user?.email ?? ""} id="email" maxLength={254} name="email" required type="email" /></div><div><label className="text-sm font-bold" htmlFor="category">{vi ? "Loại vấn đề" : "Issue type"}</label><select className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-4" defaultValue="TECHNICAL" id="category" name="category"><option value="TECHNICAL">{vi ? "Lỗi kỹ thuật" : "Technical issue"}</option><option value="CONTENT">{vi ? "Nội dung học tập" : "Learning content"}</option><option value="PAYMENT">{vi ? "Tài khoản hoặc thanh toán" : "Account or payment"}</option><option value="SUGGESTION">{vi ? "Góp ý tính năng" : "Feature suggestion"}</option><option value="OTHER">{vi ? "Vấn đề khác" : "Other"}</option></select></div><div><label className="text-sm font-bold" htmlFor="subject">{vi ? "Tiêu đề" : "Subject"}</label><input className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4" id="subject" maxLength={120} minLength={4} name="subject" required /></div><div><label className="text-sm font-bold" htmlFor="message">{vi ? "Mô tả chi tiết" : "Details"}</label><textarea className="mt-2 min-h-36 w-full resize-y rounded-xl border border-slate-300 p-4" id="message" maxLength={4000} minLength={20} name="message" placeholder={vi ? "Bạn đang làm gì, điều gì đã xảy ra và bạn mong đợi điều gì?" : "What were you doing, what happened, and what did you expect?"} required /></div><div><label className="text-sm font-bold" htmlFor="pageUrl">{vi ? "Đường dẫn trang (không bắt buộc)" : "Page URL (optional)"}</label><input className="mt-2 min-h-12 w-full rounded-xl border border-slate-300 px-4" id="pageUrl" maxLength={500} name="pageUrl" placeholder="https://..." type="url" /></div><button className="min-h-12 rounded-xl bg-teal-700 px-5 font-black text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700" type="submit">{vi ? "Gửi phản hồi" : "Send feedback"}</button></form>
      </section>
    </div>
    <PublicFooter locale={preferences.interfaceLanguage} />
  </main>;
}
