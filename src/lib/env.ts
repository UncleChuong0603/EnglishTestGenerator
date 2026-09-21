import "server-only";
import { z } from "zod";

function parseUrl(value: string, name: string) {
  try { return new URL(value); } catch { throw new Error(`${name} is not a valid URL`); }
}

const optionalString = (minimumLength = 1) => z.preprocess(
  (value) => value === "" ? undefined : value,
  z.string().min(minimumLength).optional(),
);

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  APP_URL: z.url(),
  GOOGLE_CLIENT_ID: optionalString(),
  GOOGLE_CLIENT_SECRET: optionalString(),
  SMTP_HOST: optionalString(),
  SMTP_PORT: z.coerce.number().int().min(1).max(65535).default(1025),
  SMTP_USER: optionalString(), SMTP_PASSWORD: optionalString(),
  SMTP_FROM: z.string().min(1).default("English Test <noreply@localhost>"),
  SMTP_SECURE: z.enum(["true", "false"]).default("false"),
  MEDIA_ENABLED: z.enum(["true", "false"]).default("false"),
  MEDIA_STORAGE_PROVIDER: z.literal("LOCAL").default("LOCAL"),
  LOCAL_MEDIA_ROOT: optionalString(),
  MEDIA_SIGNING_SECRET: optionalString(32),
});

export function getServerEnv() {
  const parsed = serverEnvSchema.safeParse(process.env);
  if (!parsed.success) throw new Error(`Invalid server environment: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`);
  if (Boolean(parsed.data.GOOGLE_CLIENT_ID) !== Boolean(parsed.data.GOOGLE_CLIENT_SECRET)) throw new Error("GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET must be configured together");
  if (Boolean(parsed.data.SMTP_USER) !== Boolean(parsed.data.SMTP_PASSWORD)) throw new Error("SMTP_USER and SMTP_PASSWORD must be configured together");
  if (parsed.data.MEDIA_ENABLED === "true" && (!parsed.data.LOCAL_MEDIA_ROOT || !parsed.data.MEDIA_SIGNING_SECRET)) throw new Error("Local media root and signing secret are required when media is enabled");
  if (process.env.NODE_ENV === "production") {
    const appUrl = parseUrl(parsed.data.APP_URL, "APP_URL");
    if (appUrl.protocol !== "https:") throw new Error("APP_URL must use HTTPS in production");
    if (["localhost", "127.0.0.1", "::1"].includes(appUrl.hostname)) throw new Error("APP_URL must not use a local hostname in production");
    if (appUrl.pathname !== "/" || appUrl.search || appUrl.hash || appUrl.username || appUrl.password) throw new Error("APP_URL must be a bare HTTPS origin");
    const databaseUrl = parseUrl(parsed.data.DATABASE_URL, "DATABASE_URL");
    if (!["postgres:", "postgresql:"].includes(databaseUrl.protocol)) throw new Error("DATABASE_URL must use PostgreSQL");
    if (["localhost", "127.0.0.1", "::1"].includes(databaseUrl.hostname) || databaseUrl.hostname.endsWith(".supabase.co")) throw new Error("DATABASE_URL must use the private production PostgreSQL service");
    if (parsed.data.SMTP_HOST && ["localhost", "127.0.0.1", "mailpit"].includes(parsed.data.SMTP_HOST.toLowerCase())) throw new Error("SMTP_HOST must use a production mail transport");
    if (parsed.data.SMTP_HOST && parsed.data.SMTP_FROM.toLowerCase().includes("@localhost")) throw new Error("SMTP_FROM must use a deliverable production address");
    if (/^(change[_-]?me|development|default|secret)/i.test(parsed.data.SESSION_SECRET)) throw new Error("SESSION_SECRET must not use a placeholder in production");
  }
  return parsed.data;
}
