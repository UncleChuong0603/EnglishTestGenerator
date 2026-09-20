export function statusLabel(status: string, vi: boolean) {
  const labels: Record<string, [string,string]> = { PENDING:["Đang chờ","Pending"], PAID:["Đã thanh toán","Paid"], EXPIRED:["Hết hạn","Expired"], CANCELLED:["Đã hủy","Cancelled"], FAILED:["Thất bại","Failed"] };
  return labels[status]?.[vi?0:1] ?? (vi?"Không xác định":"Unknown");
}
export function statusTone(status: string) { return status === "PAID" ? "bg-emerald-100 text-emerald-800" : status === "PENDING" ? "bg-amber-100 text-amber-900" : "bg-slate-200 text-slate-800"; }
export function productLabel(key: string, vi: boolean) { const days = /^PREMIUM_(30|90|365)_DAYS$/.exec(key)?.[1]; return days ? `Premium · ${days} ${vi?"ngày":"days"}` : "Premium"; }
export function money(amount: number, currency: string, locale: "vi"|"en") { return new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-US", { style:"currency", currency }).format(amount); }
export function paymentDate(date: Date | null, locale: "vi"|"en") { return date ? new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-US", { year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",timeZone:"Asia/Ho_Chi_Minh" }).format(date) : "—"; }
