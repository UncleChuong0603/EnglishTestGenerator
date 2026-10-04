// Runs inside the isolated Compose network; the signed endpoint is not public automation.
import { createHmac } from "node:crypto";
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  console.error("Mobile retention scheduler disabled: SESSION_SECRET is invalid");
  process.exit(1);
}
const secret = createHmac("sha256", sessionSecret).update("mobile-retention-job:v1").digest("base64url");
const url = process.env.MOBILE_RETENTION_JOB_URL || "http://app:3000/api/internal/mobile-retention";
const INTERVAL_MS = 15 * 60_000;
async function run() {
  try {
    const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(10 * 60_000) });
    const body = await response.json().catch(() => null);
    console.info("Mobile retention job completed", { status: response.status, sent: Number(body?.dispatch?.sent ?? 0), failed: Number(body?.dispatch?.failed ?? 0), receipts: Number(body?.receipts?.checked ?? 0) });
  } catch (error) {
    console.error("Mobile retention job request failed", { type: error instanceof Error ? error.name : "unknown" });
  }
  setTimeout(() => void run(), INTERVAL_MS);
}
void run();
