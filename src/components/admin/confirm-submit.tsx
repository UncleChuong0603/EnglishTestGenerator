"use client";
import type { MouseEvent, ReactNode } from "react";

export function ConfirmSubmit({ children, message, className }: { children: ReactNode; message: string; className?: string }) {
  function confirm(event: MouseEvent<HTMLButtonElement>) { if (!window.confirm(message)) event.preventDefault(); }
  return <button className={className} onClick={confirm} type="submit">{children}</button>;
}
