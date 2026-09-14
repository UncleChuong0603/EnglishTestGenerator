import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  APP_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string().min(1).optional(),
  GOOGLE_CLIENT_SECRET: z.string().min(1).optional(),
  SMTP_HOST: z.string().min(1).optional(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(1025),
  SMTP_USER: z.string().optional(), SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().min(1).default("English Test <noreply@localhost>"),
  SMTP_SECURE: z.enum(["true", "false"]).default("false"),
});

export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Invalid server environment: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  if (Boolean(parsed.data.GOOGLE_CLIENT_ID) !== Boolean(parsed.data.GOOGLE_CLIENT_SECRET)) throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together");
  if (process.env.NODE_ENV === "production" && (!parsed.data.GOOGLE_CLIENT_ID || !parsed.data.GOOGLE_CLIENT_SECRET)) throw new Error("Google OAuth credentials are required in production");
  if (process.env.NODE_ENV === "production" && new URL(parsed.data.APP_URL).protocol !== "https:") throw new Error("APP_URL must use HTTPS in production");
  return parsed.data;
}
