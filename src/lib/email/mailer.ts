import "server-only";
import nodemailer from "nodemailer";
import { getServerEnv } from "@/lib/env";

type AuthEmail = { to: string; subject: string; text: string };
export async function sendAuthEmail(message: AuthEmail) {
  if (process.env.NODE_ENV === "test") return;
  const env = getServerEnv();
  if (!env.SMTP_HOST) throw new Error("SMTP_HOST is not configured; transactional email cannot be delivered");
  const transport = nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE === "true", auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined });
  const result = await transport.sendMail({ from: env.SMTP_FROM, ...message });
  const accepted = Array.isArray(result.accepted) ? result.accepted.length : 0;
  const rejected = Array.isArray(result.rejected) ? result.rejected.length : 0;
  if (accepted === 0) throw new Error(`SMTP did not accept any recipient (rejected: ${rejected})`);
  console.info(`[auth:email] SMTP accepted ${accepted} recipient(s); rejected ${rejected}`);
}
