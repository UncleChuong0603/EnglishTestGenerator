const present = (name) => Boolean(process.env[name]?.trim());
const complete = (names) => names.every(present);
const partial = (names) => names.some(present) && !complete(names);
const line = (label, value) => console.log(`${label}: ${value}`);

let failed = false;
const requireGroup = (label, names) => {
  const ok = complete(names);
  line(label, ok ? "PASS" : "FAIL");
  if (!ok) failed = true;
};

requireGroup("Core config", ["SESSION_SECRET", "APP_URL"]);
requireGroup("Database config", ["DATABASE_URL"]);

const mediaEnabled = process.env.MEDIA_ENABLED === "true";
const mediaProvider = process.env.MEDIA_STORAGE_PROVIDER ?? "R2";
let mediaState = mediaEnabled ? mediaProvider : "DISABLED";
if (mediaEnabled && mediaProvider === "LOCAL") {
  if (!complete(["LOCAL_MEDIA_ROOT", "MEDIA_SIGNING_SECRET"])) { mediaState = "INVALID"; failed = true; }
} else if (mediaEnabled && mediaProvider === "R2") {
  if (!complete(["R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET_NAME", "R2_ENDPOINT"])) { mediaState = "INVALID"; failed = true; }
} else if (mediaEnabled) { mediaState = "INVALID"; failed = true; }
line("Media provider", mediaState);

const paymentNames = ["PAYOS_CLIENT_ID", "PAYOS_API_KEY", "PAYOS_CHECKSUM_KEY"];
line("Payment provider", complete(paymentNames) ? "PAYOS CONFIGURED" : partial(paymentNames) ? "PAYOS PARTIAL" : "PAYOS DISABLED");
if (partial(paymentNames)) failed = true;

const smtpNames = ["SMTP_USER", "SMTP_PASSWORD"];
line("Email", present("SMTP_HOST") && !partial(smtpNames) ? "CONFIGURED" : present("SMTP_HOST") || partial(smtpNames) ? "PARTIAL" : "NOT CONFIGURED");
if (partial(smtpNames)) failed = true;

const googleNames = ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"];
line("Google OAuth", complete(googleNames) ? "CONFIGURED" : partial(googleNames) ? "PARTIAL" : "NOT CONFIGURED");
if (partial(googleNames)) failed = true;

line("External AI dependency", "NONE (runtime core)");
line("Network calls", "NONE");
if (failed) process.exitCode = 1;

