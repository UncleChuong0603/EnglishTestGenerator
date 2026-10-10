import Link from "next/link";
import Image from "next/image";
import { startPart5Challenge } from "@/app/challenge/actions";
import { ChallengeStartButton } from "@/components/challenge-start-button";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { getMarketingTranslations } from "@/lib/i18n/marketing";

type PublicHeaderProps = {
  locale: InterfaceLanguage;
  signedIn?: boolean;
  signedInPrimaryHref?: string;
  signedInPrimaryLabel?: string;
  showPrimary?: boolean;
  tone?: "light" | "dark";
};

export function PublicHeader({ locale, signedIn = false, signedInPrimaryHref = "/progress", signedInPrimaryLabel, showPrimary = true, tone = "light" }: PublicHeaderProps) {
  const t = getMarketingTranslations(locale);
  const dark = tone === "dark";
  const accountHref = signedIn ? "/progress" : "/sign-in";
  const showAccountLink = !signedIn || !showPrimary;
  const primaryLabel = signedIn ? (signedInPrimaryLabel ?? t.nav.continue) : locale === "vi" ? "Thử 10 câu miễn phí" : "Try 10 free questions";
  const pendingLabel = locale === "vi" ? "Đang chuẩn bị bài…" : "Preparing your questions…";
  const navLink = `inline-flex min-h-11 shrink-0 items-center whitespace-nowrap px-3 py-2 text-sm font-semibold transition focus-visible:outline-2 ${dark ? "text-[#b7c9c0] hover:text-[#7be5bd]" : "text-[#42584b] hover:text-[#245a43]"}`;
  const mobileLink = `block min-h-11 border-b px-2 py-3 text-sm font-semibold ${dark ? "border-[#21463b] text-[#d9e9e1] hover:text-[#7be5bd]" : "border-[#e2e9df]"}`;
  const headerAction = `inline-flex min-h-11 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-md px-4 text-center text-sm font-bold disabled:cursor-wait disabled:opacity-70 ${dark ? "bg-[#7be5bd] text-[#071915] hover:bg-[#9aefd0]" : "bg-[#245a43] text-white hover:bg-[#184631]"}`;
  return <header className={`public-header border-b ${dark ? "sticky top-0 z-40 border-[#21463b] bg-[#071915]/95 text-white backdrop-blur-xl" : "border-[#dce3d9] bg-[#f7f6f1]"}`}>
    <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
      <Link className={`inline-flex shrink-0 items-center gap-2 text-lg font-black tracking-tight ${dark ? "text-white" : "text-[#183e2b]"}`} href="/" aria-label="TOEIC GYM home"><Image src="/brand/toeic-gym-mark.png" alt="" width={36} height={36} /><span>TOEIC<span className="font-semibold"> GYM</span></span></Link>
      <nav className="hidden items-center gap-1 xl:flex" aria-label="Public navigation">
        <Link className={navLink} href="/toeic">{locale === "vi" ? "TOEIC là gì" : "What is TOEIC?"}</Link>
        <Link className={navLink} href="/ngu-phap">{locale === "vi" ? "Ngữ Pháp" : "Grammar"}</Link>
        <Link className={navLink} href="/vocabulary">{locale === "vi" ? "Từ vựng" : "Vocabulary"}</Link>
        <Link className={navLink} href="/listening-lessons">{locale === "vi" ? "Luyện nghe" : "Listening"}</Link>
        <Link className={navLink} href="/full-mock">{locale === "vi" ? "Thi Thử" : "Mock Test"}</Link>
        <Link className={navLink} href="/ranking">{locale === "vi" ? "Xếp hạng" : "Rankings"}</Link>
        <Link className={navLink} href="/blog">Blog</Link>
      </nav>
      <div className="hidden items-center gap-2 xl:flex">
        <LanguageSwitcher locale={locale} />
        {showAccountLink ? <Link className={navLink} href={accountHref}>{signedIn ? t.nav.dashboard : t.nav.signIn}</Link> : null}
        {showPrimary && (signedIn ? <Link className={headerAction} href={signedInPrimaryHref}>{primaryLabel} <span className="ml-3" aria-hidden="true">↗</span></Link> : <form action={startPart5Challenge}><ChallengeStartButton className={`${headerAction} gap-3`} label={primaryLabel} pendingLabel={pendingLabel} /></form>)}
      </div>
      <details className="group relative xl:hidden">
        <summary className={`flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-md border ${dark ? "border-[#315c4d] text-[#7be5bd]" : "border-[#cbd7cb] text-[#245a43]"}`} aria-label={locale === "vi" ? "Mở menu" : "Open menu"}><svg aria-hidden="true" fill="none" height="22" viewBox="0 0 24 24" width="22"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" /></svg></summary>
        <nav className={`absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] border p-3 shadow-xl ${dark ? "border-[#315c4d] bg-[#0b211b] text-white" : "border-[#cbd7cb] bg-[#f7f6f1]"}`} aria-label="Public mobile navigation">
          <Link className={mobileLink} href="/#features">{locale === "vi" ? "Tất cả tính năng miễn phí" : "All free features"}</Link>
          <Link className={mobileLink} href={signedIn ? "/practice" : "/try"}>{locale === "vi" ? "Bài luyện ngắn" : "Short practice"}</Link>
          <Link className={mobileLink} href="/diagnostic">{locale === "vi" ? "Đánh giá đầu vào" : "Diagnostic"}</Link>
          <Link className={mobileLink} href="/toeic">{locale === "vi" ? "TOEIC là gì" : "What is TOEIC?"}</Link>
          <Link className={mobileLink} href="/ngu-phap">{locale === "vi" ? "Ngữ Pháp" : "Grammar"}</Link>
          <Link className={mobileLink} href="/vocabulary">{locale === "vi" ? "Từ vựng" : "Vocabulary"}</Link>
          <Link className={mobileLink} href="/listening-lessons">{locale === "vi" ? "Luyện nghe" : "Listening"}</Link>
          <Link className={mobileLink} href="/full-mock">{locale === "vi" ? "Thi Thử" : "Mock Test"}</Link>
          <Link className={mobileLink} href="/ranking">{locale === "vi" ? "Bảng xếp hạng" : "Leaderboard"}</Link>
          <Link className={mobileLink} href="/ve-toeic-gym">{locale === "vi" ? "Về TOEIC GYM" : "About TOEIC GYM"}</Link>
          <Link className={mobileLink} href="/blog">Blog</Link>
          {showAccountLink ? <Link className={mobileLink} href={accountHref}>{signedIn ? t.nav.dashboard : t.nav.signIn}</Link> : null}
          <div className="px-2 py-3"><LanguageSwitcher locale={locale} /></div>
          {showPrimary && (signedIn ? <Link className={headerAction} href={signedInPrimaryHref}>{primaryLabel}</Link> : <form action={startPart5Challenge}><ChallengeStartButton className={`${headerAction} w-full justify-center gap-3`} label={primaryLabel} pendingLabel={pendingLabel} /></form>)}
        </nav>
      </details>
    </div>
  </header>;
}
