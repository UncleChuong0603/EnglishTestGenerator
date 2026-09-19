"use client";

import { useId, useState } from "react";
import { fieldClassName } from "./auth-ui";

type PasswordFieldProps = {
  name: string;
  label: string;
  autoComplete: "current-password" | "new-password";
  hint?: string;
  minLength?: number;
  hideLabel?: boolean;
};

export function PasswordField({ name, label, autoComplete, hint, minLength = 10, hideLabel = false }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return <div>
    <div className={hideLabel ? "sr-only" : "flex items-center justify-between gap-4"}><label className="text-sm font-bold text-slate-800" htmlFor={id}>{label}</label></div>
    <div className="relative">
      <input aria-describedby={hintId} autoComplete={autoComplete} className={`${fieldClassName} pr-14`} id={id} minLength={minLength} name={name} required type={visible ? "text" : "password"} />
      <button aria-label={visible ? `Ẩn ${label.toLowerCase()}` : `Hiện ${label.toLowerCase()}`} aria-pressed={visible} className="absolute bottom-0 right-0 top-1.5 grid w-12 place-items-center rounded-r-xl text-slate-500 transition-colors hover:text-teal-700 focus-visible:z-10" onClick={() => setVisible((value) => !value)} type="button">
        <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24"><path d={visible ? "M4 4l16 16M9.9 9.9a3 3 0 0 0 4.2 4.2M6.7 6.7C4.8 8 3.5 10 3 12c1.2 4 4.7 7 9 7 1.3 0 2.5-.3 3.6-.8M10.6 5.1A8.6 8.6 0 0 1 12 5c4.3 0 7.8 3 9 7-.4 1.3-1.1 2.5-2 3.5" : "M3 12c1.2-4 4.7-7 9-7s7.8 3 9 7c-1.2 4-4.7 7-9 7s-7.8-3-9-7Zm9 3a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>
      </button>
    </div>
    {hint ? <p className="mt-1.5 text-xs leading-5 text-slate-500" id={hintId}>{hint}</p> : null}
  </div>;
}
