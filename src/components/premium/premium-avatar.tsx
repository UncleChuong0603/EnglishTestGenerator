export function PremiumAvatar({ name, avatarUrl, premium, size = "md" }: { name: string; avatarUrl?: string | null; premium: boolean; size?: "sm" | "md" }) {
  const initials=name.trim().split(/\s+/).slice(-2).map(part=>part[0]?.toUpperCase()).join("")||"TG";
  const dimensions=size==="sm"?"size-9 text-xs":"size-12 text-sm";
  return <span className={`inline-grid shrink-0 rounded-full ${premium?"bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-700 p-[2px] shadow-[0_0_14px_rgba(217,119,6,.18)]":"bg-slate-200 p-px"}`} data-premium-avatar={premium?"true":"false"}>
    <span aria-label={name} className={`${dimensions} grid place-items-center rounded-full bg-slate-900 bg-cover bg-center font-black text-white`} role="img" style={avatarUrl?{backgroundImage:`url(${JSON.stringify(avatarUrl).slice(1,-1)})`}:undefined}>{avatarUrl?<span className="sr-only">{name}</span>:initials}</span>
  </span>;
}
