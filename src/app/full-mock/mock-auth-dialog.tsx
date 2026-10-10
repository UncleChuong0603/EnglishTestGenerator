"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { signInAction, type AuthActionState } from "@/app/auth/actions";
import type { InterfaceLanguage } from "@/lib/i18n/config";

const initialState: AuthActionState = { ok: false };
const fieldClassName = "mt-1.5 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10";
const linkClassName = "rounded font-bold text-teal-700 underline-offset-4 transition-colors hover:text-teal-900 hover:underline";

type Props = {
  context: string;
  locale: InterfaceLanguage;
  triggerClassName: string;
  triggerLabel: string;
};

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24">
      <path d="m6 6 12 12M18 6 6 18" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}

function GoogleIcon() {
  return <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24"><path d="M21.35 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.54h3.14c1.84-1.69 2.91-4.19 2.91-7.33Z" fill="#4285F4"/><path d="M12 21.75c2.62 0 4.82-.87 6.44-2.36l-3.14-2.54c-.87.58-1.98.93-3.3.93-2.53 0-4.67-1.71-5.44-4.01H3.32v2.62A9.73 9.73 0 0 0 12 21.75Z" fill="#34A853"/><path d="M6.56 13.77A5.85 5.85 0 0 1 6.25 12c0-.62.11-1.22.31-1.77V7.61H3.32A9.72 9.72 0 0 0 2.25 12c0 1.57.38 3.06 1.07 4.39l3.24-2.62Z" fill="#FBBC05"/><path d="M12 6.22c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.34 9.34 0 0 0 12 2.25a9.73 9.73 0 0 0-8.68 5.36l3.24 2.62c.77-2.3 2.91-4.01 5.44-4.01Z" fill="#EA4335"/></svg>;
}

export function MockAuthDialog({ context, locale, triggerClassName, triggerLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [state, action, pending] = useActionState(signInAction, initialState);
  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const vi = locale === "vi";

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    const dialog = dialogRef.current;
    const focusable = dialog?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );
    focusable?.[0]?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab" || !focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <>
      <button className={triggerClassName} onClick={() => setOpen(true)} ref={triggerRef} type="button">
        {triggerLabel}
        <svg aria-hidden="true" className="size-4" fill="none" viewBox="0 0 20 20">
          <path d="M4 10h11m-4-4 4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
        </svg>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-[#031a1f]/80 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            aria-describedby={descriptionId}
            aria-labelledby={titleId}
            aria-modal="true"
            className="relative my-auto grid w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/10 bg-white shadow-[0_32px_100px_rgba(0,0,0,.45)] md:grid-cols-[1.08fr_.92fr]"
            ref={dialogRef}
            role="dialog"
          >
            <button
              aria-label={vi ? "Đóng cửa sổ đăng nhập" : "Close sign-in dialog"}
              className="absolute right-3 top-3 z-10 grid size-11 place-items-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600 md:text-white md:hover:bg-white/10 md:hover:text-white"
              onClick={() => setOpen(false)}
              type="button"
            >
              <CloseIcon />
            </button>

            <section className="px-5 py-7 sm:px-9 sm:py-9">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">TOEIC GYM</p>
              <h2 className="mt-2 pr-10 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl" id={titleId}>
                {vi ? "Đăng nhập để vào phòng thi" : "Sign in to enter the test room"}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600" id={descriptionId}>
                {vi ? `Lưu tiến độ và tiếp tục ${context} trên mọi thiết bị.` : `Save your progress and continue ${context} on any device.`}
              </p>

              <Link className="mt-7 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition-colors hover:border-slate-400 hover:bg-slate-50" href="/api/auth/google?next=%2Ffull-mock">
                <GoogleIcon />{vi ? "Tiếp tục với Google" : "Continue with Google"}
              </Link>
              <div className="my-5 flex items-center gap-3 text-xs font-semibold text-slate-400">
                <span className="h-px flex-1 bg-slate-200" />
                <span>{vi ? "hoặc" : "or"}</span>
                <span className="h-px flex-1 bg-slate-200" />
              </div>

              <form action={action} aria-busy={pending} className="space-y-4">
                <input name="next" type="hidden" value="/full-mock" />
                <div>
                  <label className="text-sm font-bold text-slate-800" htmlFor={`${titleId}-email`}>Email</label>
                  <input autoComplete="email" className={fieldClassName} id={`${titleId}-email`} name="email" required type="email" />
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between gap-4">
                    <span className="text-sm font-bold text-slate-800">{vi ? "Mật khẩu" : "Password"}</span>
                    <Link className={`${linkClassName} text-xs`} href="/forgot-password">{vi ? "Quên mật khẩu?" : "Forgot password?"}</Link>
                  </div>
                  <div className="relative">
                    <input autoComplete="current-password" className={`${fieldClassName} pr-14`} minLength={1} name="password" required type={passwordVisible ? "text" : "password"} />
                    <button
                      aria-label={passwordVisible ? (vi ? "Ẩn mật khẩu" : "Hide password") : (vi ? "Hiện mật khẩu" : "Show password")}
                      aria-pressed={passwordVisible}
                      className="absolute bottom-0 right-0 top-1.5 grid w-12 place-items-center rounded-r-xl text-slate-500 hover:text-teal-700"
                      onClick={() => setPasswordVisible((value) => !value)}
                      type="button"
                    >
                      <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d={passwordVisible ? "M4 4l16 16M9.9 9.9a3 3 0 0 0 4.2 4.2M6.7 6.7C4.8 8 3.5 10 3 12c1.2 4 4.7 7 9 7 1.3 0 2.5-.3 3.6-.8M10.6 5.1A8.6 8.6 0 0 1 12 5c4.3 0 7.8 3 9 7-.4 1.3-1.1 2.5-2 3.5" : "M3 12c1.2-4 4.7-7 9-7s7.8 3 9 7c-1.2 4-4.7 7-9 7s-7.8-3-9-7Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>
                    </button>
                  </div>
                </div>
                <button className="flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-black text-white shadow-sm transition-colors hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">
                  {pending ? (vi ? "Đang đăng nhập…" : "Signing in…") : (vi ? "Đăng nhập & bắt đầu" : "Sign in & start")}
                </button>
              </form>

              {state.error ? <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">{state.error}</p> : null}
              <p className="mt-5 text-center text-sm text-slate-600">
                {vi ? "Chưa có tài khoản?" : "New to TOEICGym?"}{" "}
                <Link className={linkClassName} href="/sign-up?next=%2Ffull-mock">{vi ? "Tạo tài khoản" : "Create account"}</Link>
              </p>
            </section>

            <aside className="relative hidden min-h-full overflow-hidden bg-[#0b3b42] p-8 text-white md:flex md:flex-col md:items-center md:justify-center">
              <div aria-hidden="true" className="absolute -right-20 -top-20 size-64 rounded-full bg-teal-300/15 blur-3xl" />
              <div className="relative flex w-full flex-col items-center text-center">
                <div className="relative h-64 w-full max-w-[300px]">
                  <Image alt="" className="object-contain" fill loading="eager" sizes="300px" src="/mascot/milo-coach.webp" />
                </div>
                <p className="mt-2 text-xl font-black">{vi ? "Sẵn sàng chinh phục mục tiêu?" : "Ready to reach your target?"}</p>
                <p className="mt-2 max-w-xs text-sm leading-6 text-teal-50/80">
                  {vi ? "Milo sẽ giữ nhịp bài thi, lưu câu trả lời và đưa bạn trở lại đúng chỗ đang làm." : "Milo keeps your test on track, saves answers, and brings you back to the right place."}
                </p>
              </div>
            </aside>
          </div>
        </div>
      ) : null}
    </>
  );
}
