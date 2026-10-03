// Runs in the isolated Compose network. No public timer or external queue.
import { createHmac } from "node:crypto";
const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret || sessionSecret.length < 32) {
  console.error("Lifecycle scheduler disabled: SESSION_SECRET is invalid");
  process.exit(1);
}
const secret = createHmac("sha256", sessionSecret).update("lifecycle-email-job:v1").digest("base64url");
const url = process.env.LIFECYCLE_JOB_URL || "http://app:3000/api/internal/lifecycle-email";
const HOUR = 3_600_000;
function nextRun(now) {
  const local = new Date(now.getTime() + 7 * HOUR);
  const scheduled = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate(), 8, 15) - 7 * HOUR;
  return scheduled > now.getTime() ? scheduled : scheduled + 24 * HOUR;
}
async function loop() {
  const delay = nextRun(new Date()) - Date.now();
  await new Promise(resolve => setTimeout(resolve, delay));
  try {
    const response = await fetch(url, { method: "POST", headers: { Authorization: `Bearer ${secret}` }, signal: AbortSignal.timeout(10 * 60_000) });
    const body = await response.json().catch(() => null);
    console.info("Lifecycle job completed", { status: response.status, sent: Number(body?.sent ?? 0), suppressed: Number(body?.suppressed ?? 0), failed: Number(body?.failed ?? 0) });
  } catch (error) {
    console.error("Lifecycle job request failed", { type: error instanceof Error ? error.name : "unknown" });
  }
  void loop();
}
void loop();
