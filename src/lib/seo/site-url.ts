const PRODUCTION_SITE_URL = "https://toeicgym.net";

export function getSiteUrl(): string {
  if (process.env.NODE_ENV === "production") return PRODUCTION_SITE_URL;

  const configured = process.env.APP_URL;
  if (!configured) return "http://localhost:3000";

  try {
    return new URL(configured).origin;
  } catch {
    return "http://localhost:3000";
  }
}
