import { NextResponse } from "next/server";
import { PaymentWebhookError, processWebhook } from "@/lib/payments/service";

export async function POST(request: Request) {
  let body: unknown; try { body = await request.json(); } catch { return NextResponse.json({ error: "invalid_request" }, { status: 400 }); }
  try { await processWebhook(body); return NextResponse.json({ success: true }); }
  catch (error) {
    const verificationFailed=error instanceof PaymentWebhookError&&error.code==="VERIFICATION_FAILED";
    console.warn("payment_webhook_rejected",{provider:"PAYOS",stage:verificationFailed?"verification":"processing"});
    return NextResponse.json({error:verificationFailed?"invalid_webhook":"webhook_processing_unavailable"},{status:verificationFailed?400:503});
  }
}
