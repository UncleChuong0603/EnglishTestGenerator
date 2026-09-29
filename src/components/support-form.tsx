"use client";

import { useId, useState, type FormEvent } from "react";
import { submitFeedback, type FeedbackResult } from "@/app/support/actions";
import type { InterfaceLanguage } from "@/lib/i18n/config";

const fieldClass = "mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#245a43] focus:ring-2 focus:ring-[#245a43]/15";

export function SupportForm({ locale, email = "" }: { locale: InterfaceLanguage; email?: string }) {
  const vi = locale === "vi";
  const id = useId();
  const [pending, setPending] = useState(false);
  const [status, setStatus] = useState<FeedbackResult["status"] | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    // Include page context without copying query strings or auth tokens.
    formData.set("pageUrl", `${window.location.origin}${window.location.pathname}`.slice(0, 500));
    setPending(true);
    setStatus(null);
    try {
      setStatus((await submitFeedback(formData)).status);
    } catch {
      setStatus("failed");
    } finally {
      setPending(false);
    }
  }

  return <>
    {status === "success" ? <div className="py-6 text-center" role="status">
      <span aria-hidden="true" className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-700">✓</span>
      <p className="mt-4 font-bold text-slate-900">{vi ? "Đã nhận góp ý của bạn!" : "Your feedback is in!"}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{vi ? "Cảm ơn bạn. Đội ngũ sẽ liên hệ qua email nếu cần trao đổi thêm." : "Thank you. Our team will follow up by email if needed."}</p>
      <button type="button" onClick={() => setStatus(null)} className="mt-4 min-h-11 text-sm font-semibold text-[#245a43] underline underline-offset-4">{vi ? "Gửi góp ý khác" : "Send another message"}</button>
    </div> : <form onSubmit={handleSubmit} className="grid gap-4" aria-busy={pending}>
      <div className="sr-only" aria-hidden="true"><label htmlFor={`${id}-website`}>Website</label><input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" /></div>
      <label className="text-sm font-semibold text-slate-700" htmlFor={`${id}-email`}>Email
        <input className={fieldClass} id={`${id}-email`} name="email" type="email" autoComplete="email" defaultValue={email} placeholder={vi ? "Email để nhận phản hồi" : "Email for our reply"} maxLength={254} required />
      </label>
      <label className="text-sm font-semibold text-slate-700" htmlFor={`${id}-category`}>{vi ? "Bạn muốn góp ý về" : "What is this about?"}
        <select className={fieldClass} id={`${id}-category`} name="category" defaultValue="SUGGESTION">
          <option value="SUGGESTION">{vi ? "Góp ý tính năng" : "Feature suggestion"}</option>
          <option value="TECHNICAL">{vi ? "Báo lỗi kỹ thuật" : "Technical issue"}</option>
          <option value="CONTENT">{vi ? "Nội dung học tập" : "Learning content"}</option>
          <option value="PAYMENT">{vi ? "Tài khoản / thanh toán" : "Account / payment"}</option>
          <option value="OTHER">{vi ? "Vấn đề khác" : "Other"}</option>
        </select>
      </label>
      <label className="text-sm font-semibold text-slate-700" htmlFor={`${id}-message`}>{vi ? "Nội dung" : "Message"}
        <textarea className={`${fieldClass} min-h-28 resize-y py-3 font-normal leading-6`} id={`${id}-message`} name="message" rows={4} minLength={20} maxLength={4000} placeholder={vi ? "Chia sẻ góp ý hoặc vấn đề bạn gặp (ít nhất 20 ký tự)…" : "Share your feedback or describe the issue (at least 20 characters)…"} required />
      </label>
      {status && <p className="rounded-xl bg-red-50 px-3 py-2 text-sm leading-6 text-red-700" role="alert">{status === "rate"
        ? vi ? "Bạn đã gửi nhiều phản hồi. Vui lòng thử lại sau hoặc liên hệ Zalo bên dưới." : "You have sent several messages. Please try later or contact us on Zalo below."
        : status === "invalid"
          ? vi ? "Kiểm tra email và nhập nội dung từ 20 đến 4.000 ký tự." : "Check your email and enter a message of 20–4,000 characters."
          : vi ? "Chưa gửi được. Bạn có thể thử lại hoặc liên hệ Zalo bên dưới." : "Could not send. Please retry or contact us on Zalo below."}</p>}
      <button className="min-h-11 rounded-xl bg-[#245a43] px-4 text-sm font-bold text-white transition hover:bg-[#184631] disabled:cursor-wait disabled:opacity-60" type="submit" disabled={pending}>{pending ? vi ? "Đang gửi…" : "Sending…" : vi ? "Gửi góp ý" : "Send feedback"}</button>
    </form>}
    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="text-xs text-slate-500">{vi ? "Cần hỗ trợ gấp? Liên hệ qua Zalo" : "Need urgent help? Contact us on Zalo"}</p>
      <a className="mt-2 inline-flex min-h-11 w-full items-center justify-between rounded-xl bg-blue-50 px-3 text-sm font-bold text-blue-700 hover:bg-blue-100" href="https://zalo.me/0389217724" target="_blank" rel="noopener noreferrer"><span>Zalo · 0389217724</span><span aria-hidden="true">↗</span></a>
    </div>
  </>;
}
