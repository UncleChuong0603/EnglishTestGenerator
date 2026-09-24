import type { Metadata } from "next";
import Link from "next/link";
import { LearnerNav } from "@/components/learner-nav";
import { requireUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/i18n/get-translations";
import { getPaymentCatalog } from "@/lib/payments/catalog";
import { listUserOrders } from "@/lib/payments/service";
import { getPremiumAccount } from "@/lib/premium/presentation";
import { getPremiumValueRecap } from "@/lib/premium/value-recap";
import { PremiumValueRecapView } from "@/components/premium/premium-value-recap";

export const metadata: Metadata = { title: "Thanh toán và gói", robots: { index: false, follow: false } };

const money = (value: number) => `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;
const productName = (key: string, vi: boolean) => {
  const days = /^PREMIUM_(30|90|365)_DAYS$/.exec(key)?.[1];
  return days ? `Premium ${days} ${vi ? "ngày" : "days"}` : key;
};
const statusLabels: Record<string, [string, string]> = {
  PAID: ["Đã thanh toán", "Paid"],
  PENDING: ["Đang xác nhận", "Pending"],
  CANCELLED: ["Đã hủy", "Cancelled"],
  EXPIRED: ["Hết hạn", "Expired"],
  FAILED: ["Thất bại", "Failed"],
};
// Premium is fixed-duration access; extending adds time and never creates a recurring charge.

export default async function BillingPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const [prefs, account, orders, recap] = await Promise.all([getPreferences(user.id), getPremiumAccount(user.id, user.email), listUserOrders(user.id), getPremiumValueRecap(user.id)]);
  const vi = prefs.interfaceLanguage === "vi";
  const expiry = account.expiresAt?.toLocaleDateString(vi ? "vi-VN" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  });
  const date = (value: Date) =>
    value.toLocaleDateString(vi ? "vi-VN" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "Asia/Ho_Chi_Minh",
    });
  const badge = (status: string) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${status === "PAID" ? "bg-emerald-100 text-emerald-900" : status === "PENDING" ? "bg-amber-100 text-amber-950" : "bg-slate-100 text-slate-700"}`}>{statusLabels[status]?.[vi ? 0 : 1] ?? status}</span>;

  return (
    <main className="min-h-screen bg-[#f7f9f8] px-4 py-6 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <LearnerNav locale={prefs.interfaceLanguage} />
        <div className="space-y-8 py-8 sm:space-y-10 sm:py-10">
          <header className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[.18em] text-teal-700">TOEICGym Membership</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{vi ? "Thanh toán và gói" : "Billing & plan"}</h1>
            <p className="mt-3 leading-7 text-slate-600">{vi ? "Quản lý gói hiện tại, chọn thêm thời hạn Premium và xem lại giao dịch của bạn." : "Manage your plan, add Premium access, and review your transactions."}</p>
          </header>
          {(await searchParams).error ? (
            <div className="rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-950" role="alert">
              {vi ? "Chưa thể bắt đầu thanh toán. Vui lòng thử lại sau hoặc chọn gói khác." : "Payment could not be started. Please try again later or choose another plan."}
            </div>
          ) : null}
          {account.membershipStatus === "EXPIRED" ? (
            <section className="rounded-[20px] border border-slate-300 bg-white p-6" aria-label={vi ? "Premium đã hết hạn" : "Premium expired"}>
              <h2 className="text-xl font-black">{vi ? "Premium đã hết hạn" : "Premium expired"}</h2>
              <p className="mt-2 leading-7 text-slate-600">{vi ? "Tiến độ, lịch sử và Mistake Bank của bạn vẫn được lưu. Bạn tiếp tục dùng các tính năng Free; gia hạn để mở lại lịch sử 90 ngày, phân tích skill/subskill và hạn mức Premium." : "Your progress, history, and Mistake Bank remain stored. Free capabilities stay available; renew to restore 90-day history, skill/subskill analysis, and Premium allowances."}</p>
              {account.expiresAt ? (
                <p className="mt-3 text-sm font-semibold">
                  {vi ? "Đã hết hạn" : "Expired"}: {expiry}
                </p>
              ) : null}
              <a className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-teal-800 px-5 font-bold text-white" href="#billing-plans">
                {vi ? "Gia hạn Premium" : "Renew Premium"}
              </a>
            </section>
          ) : null}
          <section aria-labelledby="current-plan" className={`rounded-[20px] border p-6 shadow-sm sm:p-8 ${account.isPremium ? "border-amber-200 bg-[#fffaf0]" : "border-teal-200 bg-[#eff8f6]"}`}>
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-2xl">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase tracking-wide ${account.isPremium ? "bg-amber-200 text-amber-950" : "bg-white text-teal-900"}`}>{account.isPremium ? (vi ? "Premium đang hoạt động" : "Premium active") : vi ? "Gói hiện tại · Free" : "Current plan · Free"}</span>
                <h2 id="current-plan" className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                  {account.isPremium ? (vi ? "Tiếp tục học không gián đoạn" : "Keep learning without interruption") : vi ? "Bắt đầu với Free, tiến xa hơn cùng Premium" : "Start with Free, go further with Premium"}
                </h2>
                <p className="mt-3 leading-7 text-slate-700">{account.isPremium ? (vi ? "Quyền truy cập Premium của bạn đang có hiệu lực." : "Your Premium access is active.") : vi ? "Bạn đang sử dụng trải nghiệm học tập Free của TOEICGym. Chọn một thời hạn bên dưới khi sẵn sàng nâng cấp." : "You are using TOEICGym Free. Choose a duration below when ready to upgrade."}</p>
                {account.isPremium && expiry ? (
                  <p className="mt-3 font-bold">
                    {vi ? "Hết hạn vào" : "Expires on"} <time dateTime={account.expiresAt!.toISOString()}>{expiry}</time>
                  </p>
                ) : null}
                {account.isPremium ? <p className="mt-1 text-sm text-slate-600">{vi ? "Thanh toán một lần · Không tự động gia hạn" : "One-time payment · No automatic renewal"}</p> : null}
              </div>
              <a href="#billing-plans" className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-teal-800 px-6 font-bold text-white transition-colors duration-150 hover:bg-teal-900">
                {account.isPremium ? (vi ? "Mua thêm thời hạn" : "Add more time") : vi ? "Khám phá các gói" : "Explore plans"}
              </a>
            </div>
          </section>
          {account.isPremium && account.daysRemaining !== null ? <p className="text-sm font-semibold text-slate-700">{vi ? `Còn ${account.daysRemaining} ngày Premium · Thanh toán một lần · Không tự động gia hạn` : `${account.daysRemaining} Premium days remaining · One-time payment · No automatic renewal`}</p> : null}
          <PremiumValueRecapView locale={prefs.interfaceLanguage} recap={recap} />
          <section id="billing-plans" aria-labelledby="billing-plans-heading" className="scroll-mt-6">
            <h2 id="billing-plans-heading" className="text-2xl font-black">
              {vi ? "Chọn thời hạn Premium" : "Choose Premium duration"}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{vi ? "Thanh toán một lần · Không tự động gia hạn" : "One-time payment · No automatic renewal"}</p>
            {account.isPremium ? <p className="mt-2 text-sm font-semibold">{vi ? "Thời gian mới sẽ được cộng sau ngày hết hạn hiện tại." : "New time is added after your current expiry date."}</p> : null}
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {getPaymentCatalog().map((product) => (
                <article key={product.key} className="flex flex-col rounded-[20px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h3 className="text-2xl font-black">
                    {product.days} {vi ? "ngày" : "days"}
                  </h3>
                  <p className="mt-2 text-3xl font-black text-teal-900">{product.amountVnd ? money(product.amountVnd) : vi ? "Đang cập nhật" : "Updating"}</p>
                  {product.amountVnd ? (
                    <p className="mt-1 text-sm text-slate-500">
                      ~{money(Math.round(product.amountVnd / product.days))}/{vi ? "ngày" : "day"}
                    </p>
                  ) : null}
                  <p className="my-6 text-sm text-slate-600">{vi ? "Thanh toán một lần · Không tự động gia hạn" : "One-time payment · No automatic renewal"}</p>
                  {product.purchasable ? (
                    <Link href={`/billing/confirm?product=${product.key}`} className="mt-auto flex min-h-12 items-center justify-center rounded-xl bg-slate-900 px-4 font-bold text-white">
                      {account.isPremium ? (vi ? "Mua thêm thời hạn" : "Add more time") : account.membershipStatus === "EXPIRED" ? (vi ? "Khôi phục Premium" : "Restore Premium") : vi ? "Chọn gói" : "Choose plan"}
                    </Link>
                  ) : (
                    <p className="mt-auto rounded-xl bg-slate-100 p-3 text-center text-sm">{vi ? "Không thể tải thanh toán. Vui lòng thử lại sau." : "Could not load checkout. Please try again later."}</p>
                  )}
                </article>
              ))}
            </div>
          </section>
          <section aria-labelledby="billing-confidence" className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 id="billing-confidence" className="text-xl font-black">
              {vi ? "Thanh toán rõ ràng, học tập an tâm" : "Clear payments, confident learning"}
            </h2>
            <div className="mt-5 grid gap-4 text-sm sm:grid-cols-3">
              {[
                [vi ? "Thanh toán một lần" : "One-time payment", vi ? "Không tự động gia hạn hoặc phát sinh phí định kỳ." : "No automatic renewal or recurring charge."],
                [vi ? "Quyền truy cập được cập nhật" : "Access is updated", vi ? "Thời hạn được cộng sau khi giao dịch được xác nhận thành công." : "Access is added after payment is confirmed."],
                [vi ? "Có thể kiểm tra giao dịch" : "Review transactions", vi ? "Theo dõi trạng thái đơn hàng trong lịch sử bên dưới." : "Track order status in the history below."],
              ].map(([title, body]) => (
                <div className="rounded-2xl bg-slate-50 p-4" key={title}>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 leading-6 text-slate-600">{body}</p>
                </div>
              ))}
            </div>
          </section>
          <section aria-labelledby="payment-history" className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div>
                <h2 id="payment-history" className="text-2xl font-black">
                  {vi ? "Lịch sử thanh toán" : "Payment history"}
                </h2>
                <p className="mt-2 text-sm text-slate-600">{vi ? "Xem trạng thái các giao dịch gần đây." : "Review the status of recent transactions."}</p>
              </div>
              {orders.length ? (
                <span className="text-sm font-semibold text-slate-500">
                  {orders.length} {vi ? "giao dịch" : "transactions"}
                </span>
              ) : null}
            </div>
            {orders.length ? (
              <div className="mt-6">
                <div className="hidden overflow-hidden rounded-xl border border-slate-200 md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                      <tr>
                        {[vi ? "Gói" : "Plan", vi ? "Số tiền" : "Amount", vi ? "Trạng thái" : "Status", vi ? "Ngày tạo" : "Created", vi ? "Thanh toán" : "Paid"].map((label) => (
                          <th scope="col" className="p-4" key={label}>
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((order) => (
                        <tr key={order.id}>
                          <th scope="row" className="p-4 font-bold">
                            <Link className="text-teal-800 underline-offset-4 hover:underline" href={`/billing/return?order=${order.id}`}>
                              {productName(order.productKey, vi)}
                            </Link>
                          </th>
                          <td className="p-4 tabular-nums">{money(order.amount)}</td>
                          <td className="p-4">{badge(order.status)}</td>
                          <td className="p-4 text-slate-600">{date(order.createdAt)}</td>
                          <td className="p-4 text-slate-600">{order.paidAt ? date(order.paidAt) : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="grid gap-3 md:hidden">
                  {orders.map((order) => (
                    <article className="rounded-2xl border border-slate-200 p-4" key={order.id}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <Link className="font-bold text-teal-800 underline-offset-4 hover:underline" href={`/billing/return?order=${order.id}`}>
                          {productName(order.productKey, vi)}
                        </Link>
                        {badge(order.status)}
                      </div>
                      <p className="mt-3 font-bold tabular-nums">{money(order.amount)}</p>
                      <p className="mt-2 text-xs text-slate-600">
                        {vi ? "Tạo" : "Created"}: {date(order.createdAt)}
                        {order.paidAt ? ` · ${vi ? "Thanh toán" : "Paid"}: ${date(order.paidAt)}` : ""}
                      </p>
                    </article>
                  ))}
                </div>
              </div>
            ) : (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 text-xl text-teal-800" aria-hidden="true">
                  ◎
                </div>
                <h3 className="mt-4 font-bold">{vi ? "Chưa có giao dịch nào" : "No transactions yet"}</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{vi ? "Các giao dịch của bạn sẽ xuất hiện ở đây sau khi bắt đầu thanh toán." : "Your transactions will appear here after you start a payment."}</p>
                <a className="mt-4 inline-flex min-h-11 items-center font-bold text-teal-800 underline-offset-4 hover:underline" href="#billing-plans">
                  {vi ? "Xem các gói Premium" : "Explore Premium plans"}
                </a>
              </div>
            )}
          </section>
          <p className="text-center text-sm text-slate-500">
            {vi ? "Cần xem lại các quyền lợi?" : "Want to compare plan benefits?"}{" "}
            <Link className="font-bold text-teal-800 underline-offset-4 hover:underline" href="/pricing">
              {vi ? "So sánh Free và Premium" : "Compare Free and Premium"}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
