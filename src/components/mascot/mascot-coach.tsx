"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "@/components/locale-provider";

type CoachMessage = { eyebrow: string; text: string; action?: string; href?: string };
type CoachPrompt = { at: number; kind: "intro" | "follow-up" };

const COACH_PROMPT_AT_KEY = "toeic-gym:milo-prompt-at";
const COACH_HIDDEN_UNTIL_KEY = "toeic-gym:milo-hidden-until";
const INTRO_DELAY_MS = 6_000;
const ADVICE_SNOOZE_MS = 5 * 60_000;
const COACH_HIDE_MS = 30 * 60_000;
const ADMIN_ROUTE = /^\/admin(?:\/|$)/;
const FOCUS_ROUTE = /^\/(?:practice|diagnostic|demo-test|full-mock|ranking\/challenges\/run|challenge\/part-5)\//;

function readTimestamp(key: string) {
  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

function storeTimestamp(key: string, value: number | null) {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(value));
  } catch {
    // Milo still works for this visit when browser storage is unavailable.
  }
}

function routeMessage(pathname: string, vi: boolean): CoachMessage {
  if (FOCUS_ROUTE.test(pathname)) return vi
    ? { eyebrow: "Milo · chế độ tập trung", text: "Đọc hết câu và loại từng đáp án. Mình sẽ ở gọn tại đây, không làm gián đoạn bài của bạn." }
    : { eyebrow: "Milo · focus mode", text: "Read the whole prompt and eliminate options one by one. I’ll stay out of your way." };
  if (pathname.includes("result") || pathname.includes("results")) return vi
    ? { eyebrow: "Milo · cùng xem lại", text: "Điểm số cho biết kết quả; lời giải và lỗi lặp lại mới chỉ ra buổi học tiếp theo.", action: "Ôn lỗi sai", href: "/mistakes" }
    : { eyebrow: "Milo · review together", text: "A score shows the result. Explanations and repeated mistakes reveal the next useful session.", action: "Review mistakes", href: "/mistakes" };
  if (pathname === "/dashboard" || pathname === "/progress") return vi
    ? { eyebrow: "Milo · coach hôm nay", text: "Hãy bắt đầu bằng bài được đề xuất. Đường xu hướng chỉ phản ánh các câu bạn thực sự đã làm.", action: "Xem bài hôm nay", href: "/dashboard#today-workout" }
    : { eyebrow: "Milo · today’s coach", text: "Start with the recommended workout. Your trend only reflects questions you actually answered.", action: "See today’s workout", href: "/dashboard#today-workout" };
  return vi
    ? { eyebrow: "Milo · TOEIC GYM coach", text: "Làm thử 10 câu trước. Sau đó mình sẽ giúp bạn biến lỗi sai thành bài nên học tiếp theo.", action: "Làm thử 10 câu", href: "/challenge/part-5" }
    : { eyebrow: "Milo · TOEIC GYM coach", text: "Try 10 questions first. Then I’ll help turn mistakes into your next useful practice.", action: "Try 10 questions", href: "/challenge/part-5" };
}

export function MascotCoach() {
  const pathname = usePathname();

  if (ADMIN_ROUTE.test(pathname)) return null;

  return <MascotCoachContent pathname={pathname} />;
}

function MascotCoachContent({ pathname }: { pathname: string }) {
  const locale = useLocale();
  const vi = locale === "vi";
  const base = useMemo(() => routeMessage(pathname, vi), [pathname, vi]);
  const focused = FOCUS_ROUTE.test(pathname);
  const [ready, setReady] = useState(false);
  const [hiddenUntil, setHiddenUntil] = useState<number | null>(null);
  const [prompt, setPrompt] = useState<CoachPrompt | null>(null);
  const [checkingIn, setCheckingIn] = useState(false);
  const [open, setOpen] = useState(false);
  const [progressMessage, setProgressMessage] = useState<{ pathname: string; message: CoachMessage } | null>(null);
  const previousPathname = useRef(pathname);
  const initialPathname = useRef(pathname);
  const checkIn = useMemo<CoachMessage>(() => vi
    ? { ...base, eyebrow: "Milo · ghé lại nè", text: "Mình vẫn ở đây nếu bạn muốn một bước tiếp theo ngắn gọn. Bạn có muốn xem gợi ý không?" }
    : { ...base, eyebrow: "Milo · checking in", text: "I’m still here if you want one clear next step. Would you like a suggestion?" }, [base, vi]);
  const message = progressMessage?.pathname === pathname ? progressMessage.message : checkingIn ? checkIn : base;

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const now = Date.now();
      const storedHiddenUntil = readTimestamp(COACH_HIDDEN_UNTIL_KEY);
      const storedPromptAt = readTimestamp(COACH_PROMPT_AT_KEY);
      const startsFocused = FOCUS_ROUTE.test(initialPathname.current);

      if (storedHiddenUntil && storedHiddenUntil > now) {
        setHiddenUntil(storedHiddenUntil);
      } else if (storedHiddenUntil) {
        storeTimestamp(COACH_HIDDEN_UNTIL_KEY, null);
        if (startsFocused) {
          storeTimestamp(COACH_PROMPT_AT_KEY, now);
          setPrompt({ at: now, kind: "follow-up" });
        } else {
          setCheckingIn(true);
          setOpen(true);
        }
      } else if (storedPromptAt) {
        if (!startsFocused && storedPromptAt <= now) {
          storeTimestamp(COACH_PROMPT_AT_KEY, null);
          setCheckingIn(true);
          setOpen(true);
        } else {
          setPrompt({ at: storedPromptAt, kind: "follow-up" });
        }
      } else if (!startsFocused) {
        setPrompt({ at: now + INTRO_DELAY_MS, kind: "intro" });
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready || hiddenUntil === null) return;
    const timer = window.setTimeout(() => {
      storeTimestamp(COACH_HIDDEN_UNTIL_KEY, null);
      setHiddenUntil(null);
      if (focused) {
        const nextPromptAt = Date.now();
        storeTimestamp(COACH_PROMPT_AT_KEY, nextPromptAt);
        setPrompt({ at: nextPromptAt, kind: "follow-up" });
        return;
      }
      setCheckingIn(true);
      setOpen(true);
    }, Math.max(0, hiddenUntil - Date.now()));
    return () => window.clearTimeout(timer);
  }, [focused, hiddenUntil, ready]);

  useEffect(() => {
    if (!ready || hiddenUntil !== null || focused || !prompt || previousPathname.current !== pathname) return;
    const timer = window.setTimeout(() => {
      storeTimestamp(COACH_PROMPT_AT_KEY, null);
      setPrompt(null);
      setCheckingIn(prompt.kind === "follow-up");
      setOpen(true);
    }, Math.max(0, prompt.at - Date.now()));
    return () => window.clearTimeout(timer);
  }, [focused, hiddenUntil, pathname, prompt, ready]);

  useEffect(() => {
    if (!ready || previousPathname.current === pathname) return;
    const timer = window.setTimeout(() => {
      previousPathname.current = pathname;
      setProgressMessage(null);
      setCheckingIn(false);
      setOpen(false);
      if (!focused && hiddenUntil === null && prompt === null) {
        setPrompt({ at: Date.now() + INTRO_DELAY_MS, kind: "intro" });
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [focused, hiddenUntil, pathname, prompt, ready]);

  useEffect(() => {
    const handle = (event: Event) => {
      const detail = (event as CustomEvent<{ answered?: number; total?: number }>).detail;
      if (!detail?.answered || !detail.total) return;
      setProgressMessage({ pathname, message: vi
        ? { eyebrow: "Milo · nhịp làm bài", text: `Bạn đã chọn ${detail.answered}/${detail.total} câu. Cứ giữ nhịp, chưa cần vội nộp.` }
        : { eyebrow: "Milo · practice pace", text: `You’ve answered ${detail.answered}/${detail.total}. Keep your pace and review before submitting.` } });
    };
    window.addEventListener("toeicgym:coach-progress", handle);
    return () => window.removeEventListener("toeicgym:coach-progress", handle);
  }, [pathname, vi]);

  function openCoach() {
    storeTimestamp(COACH_PROMPT_AT_KEY, null);
    setPrompt(null);
    setCheckingIn(false);
    setOpen(true);
  }

  function snoozeAdvice() {
    const nextPromptAt = Date.now() + ADVICE_SNOOZE_MS;
    storeTimestamp(COACH_PROMPT_AT_KEY, nextPromptAt);
    setPrompt({ at: nextPromptAt, kind: "follow-up" });
    setOpen(false);
  }

  function hideCoach() {
    const nextAppearance = Date.now() + COACH_HIDE_MS;
    storeTimestamp(COACH_PROMPT_AT_KEY, null);
    storeTimestamp(COACH_HIDDEN_UNTIL_KEY, nextAppearance);
    setPrompt(null);
    setHiddenUntil(nextAppearance);
    setOpen(false);
  }

  if (!ready || hiddenUntil !== null) return null;

  return <aside className={`mascot-coach print:hidden ${focused ? "mascot-coach-focus" : ""}`} data-open={open} aria-label={vi ? "Milo, linh vật TOEIC GYM" : "Milo, TOEIC GYM mascot"}>
    {open ? <div className="mascot-coach-bubble">
      <button className="mascot-coach-close" type="button" onClick={snoozeAdvice} title={vi ? "Nhắc lại sau 5 phút" : "Remind me again in 5 minutes"} aria-label={vi ? "Đóng lời khuyên và nhắc lại sau 5 phút" : "Close advice and remind me again in 5 minutes"}>×</button>
      <div role="status" aria-live="polite" aria-atomic="true">
        <p>{message.eyebrow}</p>
        <strong>{message.text}</strong>
      </div>
      <div className="mascot-coach-actions">
        {message.href && message.action ? <Link href={message.href} onClick={() => setOpen(false)}>{message.action}<span aria-hidden="true"> →</span></Link> : null}
        <button className="mascot-coach-hide" type="button" onClick={hideCoach}>
          <svg aria-hidden="true" fill="none" height="16" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24" width="16"><path d="M3 3l18 18M10.6 10.7a2 2 0 0 0 2.7 2.7M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.5 4 9.5 6.1a4.4 4.4 0 0 1 0 3.8 12 12 0 0 1-2.2 3.1M6.2 6.2a12.3 12.3 0 0 0-3.7 3.9 4.4 4.4 0 0 0 0 3.8C3.5 16 7 20 12 20a10.8 10.8 0 0 0 4-.8" /></svg>
          {vi ? "Tạm ẩn Milo · 30 phút" : "Hide Milo · 30 minutes"}
        </button>
      </div>
    </div> : null}
    <button className="mascot-coach-trigger" type="button" aria-expanded={open} aria-label={open ? (vi ? "Đóng lời khuyên và nhắc lại sau 5 phút" : "Close advice and remind me again in 5 minutes") : (vi ? "Hỏi Milo" : "Ask Milo")} onClick={open ? snoozeAdvice : openCoach}>
      <Image src="/mascot/milo-coach.webp" alt="" width={88} height={96} />
      {!open ? <span>{vi ? "Hỏi Milo" : "Ask Milo"}</span> : null}
    </button>
  </aside>;
}
