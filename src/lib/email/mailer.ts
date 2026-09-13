import "server-only";
import nodemailer from "nodemailer";
import { getServerEnv } from "@/lib/env";

type AuthEmail = { to: string; subject: string; text: string };
export async function sendAuthEmail(message: AuthEmail) {
  if (process.env.NODE_ENV === "test") return;
  const env = getServerEnv();
  if (!env.SMTP_HOST) { console.warn("SMTP_HOST is not configured; transactional email was not delivered"); return; }
  const transport = nodemailer.createTransport({ host: env.SMTP_HOST, port: env.SMTP_PORT, secure: env.SMTP_SECURE === "true", auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASSWORD } : undefined });
  await transport.sendMail({ from: env.SMTP_FROM, ...message });
}
