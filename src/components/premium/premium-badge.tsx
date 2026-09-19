export function PremiumBadge({ className = "" }: { className?: string }) {
  return <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border border-amber-300/80 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-900 shadow-sm ${className}`}><span aria-hidden="true">✦</span><span>Premium</span></span>;
}
