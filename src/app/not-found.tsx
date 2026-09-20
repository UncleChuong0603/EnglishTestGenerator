import Link from "next/link";
import { LanguageSwitcher } from "@/components/language-switcher";
import { getCookieLanguage } from "@/lib/i18n/get-translations";

export default async function NotFound() {
  const locale = await getCookieLanguage();
  const vi = locale === "vi";
  return <main className="grid min-h-screen place-items-center bg-slate-50 px-5"><div className="max-w-xl text-center"><div className="mb-8 flex justify-center"><LanguageSwitcher locale={locale} /></div><p className="text-sm font-bold uppercase tracking-wider text-teal-700">404</p><h1 className="mt-3 text-4xl font-black">{vi ? "Không tìm thấy trang" : "Page not found"}</h1><p className="mt-3 text-slate-600">{vi ? "Liên kết có thể đã thay đổi. Bạn vẫn có thể bắt đầu một bài đánh giá miễn phí." : "This link may have changed. You can still start a free diagnostic."}</p><div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row"><Link className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-5 font-bold text-white" href="/try">{vi ? "Làm đánh giá miễn phí" : "Start free diagnostic"}</Link><Link className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 font-bold" href="/">{vi ? "Trang chủ" : "Home"}</Link></div></div></main>;
}
