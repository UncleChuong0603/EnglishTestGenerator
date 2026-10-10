import Link from "next/link";
import Image from "next/image";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getMarketingTranslations } from "@/lib/i18n/marketing";

export function PublicFooter({ locale, tone = "light" }: { locale: InterfaceLanguage; tone?: "light" | "dark" }) {
  const t = getMarketingTranslations(locale);
  const vi = locale === "vi";
  const dark = tone === "dark";
  const footerLink = `inline-flex min-h-11 items-center py-2 text-sm leading-6 underline-offset-4 transition-colors hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${dark ? "text-[#a9c0b5] hover:text-[#7be5bd] focus-visible:outline-[#7be5bd]" : "text-[#45584d] hover:text-[#245a43] focus-visible:outline-[#245a43]"}`;
  const utilityLink = `inline-flex min-h-11 items-center text-sm underline-offset-4 transition-colors hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 ${dark ? "text-[#a9c0b5] hover:text-[#7be5bd] focus-visible:outline-[#7be5bd]" : "text-[#45584d] hover:text-[#245a43] focus-visible:outline-[#245a43]"}`;
  const practiceLinks = [
    ["/try", vi ? "Bài luyện miễn phí" : "Free practice"],
    ["/toeic", vi ? "Hướng dẫn Part 1–7" : "Parts 1–7 guides"],
    ["/ngu-phap", vi ? "Ngữ pháp TOEIC A–Z" : "TOEIC Grammar A–Z"],
    ["/listening-lessons", vi ? "Nghe theo transcript" : "Audio with transcripts"],
    ["/vocabulary", vi ? "Từ vựng & flashcards" : "Vocabulary & flashcards"],
    ["/blog", vi ? "Kiến thức TOEIC" : "TOEIC articles"],
  ];
  const productLinks = [
    ["/dashboard", vi ? "Workout hôm nay" : "Today’s workout"],
    ["/ranking", vi ? "Bảng xếp hạng" : "Leaderboard"],
    ["/mistakes", vi ? "Ôn câu sai" : "Mistake review"],
    ["/#features", vi ? "Tất cả tính năng" : "All features"],
    ["/ve-toeic-gym", vi ? "Về TOEIC GYM" : "About TOEIC GYM"],
  ];
  return <footer className={`border-t ${dark ? "border-[#21463b] bg-[#061511] text-[#eef9f2]" : "border-[#dce3d9] bg-[#f7f6f1] text-[#172821]"}`}>
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10 lg:grid lg:grid-cols-[minmax(15.5rem,.9fr)_minmax(0,2.1fr)] lg:gap-16 lg:py-12">
      <div className={`flex items-start gap-4 border-b pb-7 lg:block lg:border-0 lg:pb-0 ${dark ? "border-[#21463b]" : "border-[#dce3d9]"}`}>
        <Link aria-label={vi ? "Trang chủ TOEIC GYM" : "TOEIC GYM home"} className="shrink-0 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#245a43]" href="/" prefetch={false}>
          <Image src="/brand/toeic-gym-logo.png" alt="" width={72} height={72} />
        </Link>
        <p className={`max-w-sm text-sm leading-6 lg:mt-4 ${dark ? "text-[#a9c0b5]" : "text-[#45584d]"}`}>{vi ? "Nền tảng luyện TOEIC độc lập, không liên kết hoặc được ETS bảo trợ. Kết quả là độ chính xác thô, không phải điểm TOEIC chính thức." : "An independent TOEIC practice platform, not affiliated with or endorsed by ETS. Results are raw accuracy, not official TOEIC scores."}</p>
      </div>

      <nav aria-label={vi ? "Liên kết chân trang" : "Footer links"} className="mt-7 grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 sm:gap-x-8 lg:mt-0">
        <section aria-labelledby="footer-practice-title">
          <h2 className="text-sm font-extrabold leading-6" id="footer-practice-title">{vi ? "Bài luyện & bài học" : "Practice & lessons"}</h2>
          <ul className="mt-2 grid">
            {practiceLinks.map(([href, label]) => <li key={href}><Link className={footerLink} href={href} prefetch={false}>{label}</Link></li>)}
          </ul>
        </section>

        <section aria-labelledby="footer-product-title">
          <h2 className="text-sm font-extrabold leading-6" id="footer-product-title">{t.footer.product}</h2>
          <ul className="mt-2 grid">
            {productLinks.map(([href, label]) => <li key={href}><Link className={footerLink} href={href} prefetch={false}>{label}</Link></li>)}
          </ul>
        </section>

        <section aria-labelledby="footer-support-title" className="col-span-2 sm:col-span-1">
          <h2 className="text-sm font-extrabold leading-6" id="footer-support-title">{vi ? "Hỗ trợ & cộng đồng" : "Support & community"}</h2>
          <ul className="mt-2 grid grid-cols-2 gap-x-6 sm:grid-cols-1">
            <li><Link className={footerLink} href="/support" prefetch={false}>{vi ? "Trung tâm trợ giúp" : "Help center"}</Link></li>
            <li><Link className={footerLink} href="/support#feedback" prefetch={false}>{vi ? "Gửi phản hồi" : "Send feedback"}</Link></li>
            <li><a className={footerLink} href="https://www.facebook.com/profile.php?id=61594521208737" target="_blank" rel="noopener noreferrer">{vi ? "Trang Facebook" : "Facebook Page"}<span className="sr-only">{vi ? " (mở trong tab mới)" : " (opens in a new tab)"}</span></a></li>
            <li><a className={footerLink} href="https://www.facebook.com/groups/1632623558419538" target="_blank" rel="noopener noreferrer">{vi ? "Nhóm Facebook" : "Facebook Group"}<span className="sr-only">{vi ? " (mở trong tab mới)" : " (opens in a new tab)"}</span></a></li>
          </ul>
        </section>
      </nav>
    </div>

    <div className={`border-t ${dark ? "border-[#21463b]" : "border-[#dce3d9]"}`}>
      <div className="mx-auto flex max-w-7xl flex-col px-5 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6">
        <p className={`py-2 text-sm leading-6 ${dark ? "text-[#a9c0b5]" : "text-[#45584d]"}`}>© {new Date().getFullYear()} TOEIC GYM. {t.footer.rights}</p>
        <nav aria-label={vi ? "Pháp lý" : "Legal"}>
          <ul className="flex flex-wrap gap-x-5">
            <li><Link className={utilityLink} href="/privacy" prefetch={false}>{t.footer.privacy}</Link></li>
            <li><Link className={utilityLink} href="/terms" prefetch={false}>{t.footer.terms}</Link></li>
            <li><Link className={utilityLink} href="/delete-account" prefetch={false}>{vi ? "Xóa tài khoản" : "Delete account"}</Link></li>
          </ul>
        </nav>
      </div>
    </div>
  </footer>;
}
