import Link from "next/link";
import Image from "next/image";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getMarketingTranslations } from "@/lib/i18n/marketing";

const footerLink = "inline-flex min-h-11 items-center hover:text-[#245a43] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]";

export function PublicFooter({ locale }: { locale: InterfaceLanguage }) {
  const t = getMarketingTranslations(locale);
  const vi = locale === "vi";
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
    ["/ranking", vi ? "Bảng xếp hạng tuần" : "Weekly leaderboard"],
    ["/mistakes", vi ? "Ôn câu sai" : "Mistake review"],
    ["/#features", vi ? "Tất cả tính năng" : "All features"],
    ["/ve-toeic-gym", vi ? "Về TOEIC GYM" : "About TOEIC GYM"],
  ];
  return <footer className="border-t border-[#dce3d9] bg-white">
    <div className="mx-auto grid max-w-7xl gap-8 px-5 py-10 sm:px-6 md:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))]">
      <div><Image src="/brand/toeic-gym-logo.png" alt="TOEIC GYM" width={96} height={96} /><p className="mt-3 max-w-md text-sm leading-7 text-[#45584d]">{vi ? "Nền tảng luyện TOEIC độc lập, không liên kết hoặc được ETS bảo trợ. Kết quả là độ chính xác thô, không phải điểm TOEIC chính thức." : "An independent TOEIC practice platform, not affiliated with or endorsed by ETS. Results are raw accuracy, not official TOEIC scores."}</p></div>
      <div><p className="font-black">{vi ? "Bài luyện & bài học" : "Practice & lessons"}</p><div className="mt-3 grid text-sm text-[#45584d]">{practiceLinks.map(([href, label]) => <Link className={footerLink} href={href} key={href}>{label}</Link>)}</div></div>
      <div><p className="font-black">{t.footer.product}</p><div className="mt-3 grid text-sm text-[#45584d]">{productLinks.map(([href, label]) => <Link className={footerLink} href={href} key={href}>{label}</Link>)}</div></div>
      <div><p className="font-black">{vi ? "Hỗ trợ & cộng đồng" : "Support & community"}</p><div className="mt-3 grid text-sm text-[#45584d]">
        <Link className={footerLink} href="/support">{vi ? "Trung tâm trợ giúp" : "Help center"}</Link>
        <Link className={footerLink} href="/support#feedback">{vi ? "Gửi phản hồi" : "Send feedback"}</Link>
        <a className={footerLink} href="https://www.facebook.com/profile.php?id=61594521208737" target="_blank" rel="noopener noreferrer">{vi ? "Trang Facebook" : "Facebook Page"}</a>
        <a className={footerLink} href="https://www.facebook.com/groups/1632623558419538" target="_blank" rel="noopener noreferrer">{vi ? "Nhóm Facebook" : "Facebook Group"}</a>
        <Link className={footerLink} href="/privacy">{t.footer.privacy}</Link>
        <Link className={footerLink} href="/terms">{t.footer.terms}</Link>
      </div></div>
    </div>
    <div className="border-t border-[#dce3d9] px-5 py-5 text-center text-xs text-[#45584d]">© {new Date().getFullYear()} TOEIC GYM. {t.footer.rights}</div>
  </footer>;
}
