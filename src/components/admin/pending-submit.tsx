"use client";
import { useFormStatus } from "react-dom";

export function PendingSubmit({ children, pendingLabel = "Đang xử lý…", className, confirmMessage }: { children: React.ReactNode; pendingLabel?: string; className?: string; confirmMessage?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" disabled={pending} onClick={(event) => { if (confirmMessage && !window.confirm(confirmMessage)) event.preventDefault(); }} className={`${className ?? ""} disabled:cursor-wait disabled:opacity-50`}>{pending ? pendingLabel : children}</button>;
}
