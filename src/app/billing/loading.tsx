export default function BillingLoading() {
  return <main className="min-h-screen bg-[#f7f9f8] px-4 py-6" aria-label="Đang tải trang thanh toán" aria-busy="true">
    <div className="mx-auto max-w-6xl animate-pulse space-y-8 py-8 sm:py-10">
      <div className="h-14 rounded-2xl bg-slate-200" />
      <div className="space-y-3"><div className="h-9 w-64 rounded-lg bg-slate-200" /><div className="h-5 max-w-xl rounded-lg bg-slate-200" /></div>
      <div className="h-64 rounded-[20px] bg-teal-100" />
      <div className="grid gap-4 md:grid-cols-3">{[0, 1, 2].map(item => <div key={item} className="h-80 rounded-[20px] bg-slate-200" />)}</div>
      <div className="h-56 rounded-[20px] bg-slate-200" />
    </div>
  </main>;
}
