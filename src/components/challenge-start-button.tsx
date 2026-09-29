"use client";

import { useFormStatus } from "react-dom";

export function ChallengeStartButton({ className, label, pendingLabel }: { className: string; label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return <button aria-busy={pending} className={className} disabled={pending} type="submit">{pending ? pendingLabel : label}{!pending && <span aria-hidden="true">↗</span>}</button>;
}
