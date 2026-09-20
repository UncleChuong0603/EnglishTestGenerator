import { requireAdmin } from "@/lib/admin/authorization";
import { periodDays, productAnalyticsCsv } from "@/lib/product-analytics/calculate";
import { getProductAnalytics } from "@/lib/product-analytics/queries";

export async function GET(request: Request) {
  await requireAdmin("ADMIN_DASHBOARD_READ");
  const period = periodDays(new URL(request.url).searchParams.get("period") ?? undefined);
  const generatedAt = new Date().toISOString();
  const csv = productAnalyticsCsv(await getProductAnalytics(period), period, generatedAt);
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename=toeicgym-analytics-${period}-${generatedAt.slice(0, 10)}.csv`, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
}
