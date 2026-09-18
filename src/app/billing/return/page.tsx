import Link from "next/link";
import { requireUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getUserOrder } from "@/lib/payments/service";
import { recheckOrderAction } from "../actions";

export default async function PaymentReturnPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const user = await requireUser(); const prefs = await getPreferences(user.id); const vi = prefs.interfaceLanguage === "vi"; const id = (await searchParams).order ?? ""; const order = await getUserOrder(user.id, id);
  const labels: Record<string, string> = { PENDING: vi ? "Đang xác nhận thanh toán" : "Waiting for confirmation", PAID: vi ? "Thanh toán đã xác nhận" : "Payment confirmed", CANCELLED: vi ? "Thanh toán đã hủy" : "Payment cancelled", EXPIRED: vi ? "Thanh toán đã hết hạn" : "Payment expired", FAILED: vi ? "Thanh toán thất bại" : "Payment failed" };
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-4"><section className="w-full max-w-lg rounded-3xl border bg-white p-7 text-center"><h1 className="text-2xl font-black">{order ? labels[order.status] : vi ? "Không tìm thấy đơn hàng" : "Order not found"}</h1>{order?.status === "PENDING" ? <form action={recheckOrderAction} className="mt-6"><input name="orderId" type="hidden" value={order.id}/><button className="min-h-11 rounded-xl bg-teal-700 px-5 font-bold text-white">{vi ? "Kiểm tra lại" : "Check again"}</button></form> : null}<Link className="mt-6 inline-flex font-bold text-teal-700" href="/billing">{vi ? "Về trang thanh toán" : "Back to billing"}</Link></section></main>;
}
