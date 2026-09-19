import Link from "next/link";

type AuthShellProps = {
  children: React.ReactNode;
  title: string;
  intro: string;
  eyebrow?: string;
};

export function BrandMark() {
  return (
    <Link aria-label="TOEICGym — Trang chủ" className="inline-flex items-center gap-3 rounded-lg text-slate-950" href="/">
      <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-sm font-black tracking-tight text-white shadow-sm">TG</span>
      <span className="text-xl font-black tracking-[-0.04em]">TOEIC<span className="text-teal-700">Gym</span></span>
    </Link>
  );
}

function CheckIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="none" viewBox="0 0 24 24"><path d="m5 12.5 4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
}

export function AuthShell({ children, title, intro, eyebrow }: AuthShellProps) {
  return (
    <main className="min-h-[100svh] bg-[#f6f8f8] text-slate-950 lg:grid lg:grid-cols-[minmax(0,1.08fr)_minmax(480px,.92fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#092f35] px-10 py-9 text-white lg:flex lg:flex-col lg:[&_a]:text-white xl:px-16 xl:py-12">
        <div aria-hidden="true" className="absolute -left-24 top-1/3 size-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div aria-hidden="true" className="absolute -right-24 bottom-0 size-96 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="relative z-10 flex h-full max-w-2xl flex-col">
          <BrandMark />
          <div className="my-auto py-12">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-teal-200">Học tập có trọng tâm</p>
            <h2 className="mt-5 max-w-xl text-4xl font-black leading-[1.18] tracking-[-0.04em] xl:text-5xl">Luyện đúng điểm yếu.<br /><span className="text-teal-300">Tiến bộ mỗi ngày.</span></h2>
            <div className="mt-8 grid gap-3 text-[15px] text-slate-200">
              {[
                "Bài tập được cá nhân hóa theo năng lực",
                "Theo dõi tiến độ từng Part TOEIC",
                "Ôn lại lỗi sai theo cách thông minh",
              ].map((item) => <div className="flex items-center gap-3" key={item}><span className="grid size-7 place-items-center rounded-full bg-teal-400/15 text-teal-300"><CheckIcon /></span><span>{item}</span></div>)}
            </div>
            <div className="mt-10 max-w-md rounded-[20px] border border-white/15 bg-white/[0.08] p-5 shadow-2xl shadow-black/10 backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-200">Bài luyện hôm nay</p><p className="mt-2 text-lg font-bold">Part 7 · Inference</p></div>
                <span className="rounded-full bg-teal-300 px-3 py-1 text-xs font-black text-[#073138]">12 phút</span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[68%] rounded-full bg-teal-300" /></div>
              <div className="mt-3 flex justify-between text-xs text-slate-300"><span>10 câu hỏi trọng tâm</span><span>Sẵn sàng</span></div>
            </div>
          </div>
          <p className="text-xs text-slate-400">© {new Date().getFullYear()} TOEICGym · Luyện tập hiệu quả, tiến bộ bền vững.</p>
        </div>
      </aside>

      <section className="flex min-h-[100svh] items-start justify-center px-4 py-4 sm:px-8 sm:py-10 lg:items-center lg:px-10 lg:py-12">
        <div className="w-full max-w-[460px]">
          <div className="mb-5 flex items-center justify-between sm:mb-8 lg:hidden"><BrandMark /><Link className="text-sm font-bold text-slate-500 transition-colors hover:text-teal-700" href="/">Trang chủ</Link></div>
          <div className="rounded-[20px] border border-slate-200/90 bg-white p-5 shadow-[0_20px_60px_-36px_rgba(15,23,42,.35)] sm:p-8">
            {eyebrow ? <p className="text-xs font-black uppercase tracking-[0.18em] text-teal-700">{eyebrow}</p> : null}
            <h1 className={`${eyebrow ? "mt-3" : ""} text-[1.75rem] font-black leading-tight tracking-[-0.035em] text-slate-950 sm:text-[2rem]`}>{title}</h1>
            <p className="mt-2 text-[15px] leading-6 text-slate-600">{intro}</p>
            {children}
          </div>
        </div>
      </section>
    </main>
  );
}

export function GoogleButton({ next, label = "Tiếp tục với Google" }: { next?: string | null; label?: string }) {
  return <Link className="mt-7 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition-colors duration-150 hover:border-slate-400 hover:bg-slate-50 active:bg-slate-100" href={`/api/auth/google${next ? `?next=${encodeURIComponent(next)}` : ""}`}><GoogleIcon />{label}</Link>;
}

function GoogleIcon() {
  return <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24"><path d="M21.35 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.54h3.14c1.84-1.69 2.91-4.19 2.91-7.33Z" fill="#4285F4"/><path d="M12 21.75c2.62 0 4.82-.87 6.44-2.36l-3.14-2.54c-.87.58-1.98.93-3.3.93-2.53 0-4.67-1.71-5.44-4.01H3.32v2.62A9.73 9.73 0 0 0 12 21.75Z" fill="#34A853"/><path d="M6.56 13.77A5.85 5.85 0 0 1 6.25 12c0-.62.11-1.22.31-1.77V7.61H3.32A9.72 9.72 0 0 0 2.25 12c0 1.57.38 3.06 1.07 4.39l3.24-2.62Z" fill="#FBBC05"/><path d="M12 6.22c1.43 0 2.71.49 3.72 1.45l2.79-2.79A9.34 9.34 0 0 0 12 2.25a9.73 9.73 0 0 0-8.68 5.36l3.24 2.62c.77-2.3 2.91-4.01 5.44-4.01Z" fill="#EA4335"/></svg>;
}

export function AuthDivider() { return <div className="my-5 flex items-center gap-3 text-xs font-semibold text-slate-400"><span className="h-px flex-1 bg-slate-200" /><span>hoặc</span><span className="h-px flex-1 bg-slate-200" /></div>; }

export const fieldClassName = "mt-1.5 min-h-12 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-base text-slate-950 outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-slate-400 hover:border-slate-400 focus:border-teal-700 focus:ring-4 focus:ring-teal-700/10";
export const primaryButtonClassName = "flex min-h-12 w-full items-center justify-center rounded-xl bg-teal-700 px-4 py-3 text-sm font-black text-white shadow-sm transition-colors duration-150 hover:bg-teal-800 active:bg-teal-900 disabled:cursor-not-allowed disabled:opacity-60";
export const linkClassName = "rounded font-bold text-teal-700 underline-offset-4 transition-colors hover:text-teal-900 hover:underline";

export function AuthAlert({ type, children }: { type: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = type === "error" ? "border-red-200 bg-red-50 text-red-800" : type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-sky-200 bg-sky-50 text-sky-900";
  return <div aria-live="polite" className={`mt-5 rounded-xl border p-3.5 text-sm leading-5 ${styles}`} role={type === "error" ? "alert" : "status"}>{children}</div>;
}

export function AuthSuccessState({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="mt-7 text-center" role="status"><span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-emerald-700"><svg aria-hidden="true" className="size-7" fill="none" viewBox="0 0 24 24"><path d="m5 12.5 4 4L19 7" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.25" /></svg></span><h2 className="mt-4 text-lg font-black text-slate-950">{title}</h2><div className="mt-2 text-sm leading-6 text-slate-600">{children}</div></div>;
}
