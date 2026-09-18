import { NextResponse } from "next/server";
import { processWebhook } from "@/lib/payments/service";

export async function POST(request: Request) {
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  try { await processWebhook(body); return NextResponse.json({ success: true }); }
  catch (error) { console.warn("payment_webhook_rejected", { provider: "PAYOS", reason: error instanceof Error ? error.name : "unknown" }); return NextResponse.json({ error: "invalid_webhook" }, { status: 400 }); }
}
