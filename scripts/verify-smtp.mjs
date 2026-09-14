import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST?.trim();
const port = Number(process.env.SMTP_PORT || 587);
const secure = process.env.SMTP_SECURE === "true";
const user = process.env.SMTP_USER?.trim();
const password = process.env.SMTP_PASSWORD;

if (!host) throw new Error("SMTP_HOST is required");
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("SMTP_PORT is invalid");
if (Boolean(user) !== Boolean(password)) throw new Error("SMTP_USER and SMTP_PASSWORD must be configured together");

const transport = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user ? { user, pass: password } : undefined,
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 15_000,
});

await transport.verify();
transport.close();
console.log(`SMTP connection and authentication succeeded (${host}:${port}, secure=${secure})`);
