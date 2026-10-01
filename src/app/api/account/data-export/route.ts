import { getCurrentUser } from "@/lib/auth/session";
import { AccountDataError, exportLearningData } from "@/lib/account-data/service";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return Response.json({ error: { code: "UNAUTHENTICATED", message: "Authentication is required." } }, {
      status: 401,
      headers: { "Cache-Control": "no-store" },
    });
  }

  try {
    await enforceRateLimit("account_export", user.id);
    const payload = await exportLearningData(user.id);
    const date = new Date().toISOString().slice(0, 10);
    return new Response(JSON.stringify(payload, null, 2), {
      status: 200,
      headers: {
        "Cache-Control": "no-store, private",
        "Content-Disposition": `attachment; filename="toeicgym-learning-data-${date}.json"`,
        "Content-Type": "application/json; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "RATE_LIMITED") {
      return Response.json({ error: { code: "RATE_LIMITED", message: "Please retry later." } }, {
        status: 429, headers: { "Cache-Control": "no-store", "Retry-After": "3600" },
      });
    }
    if (!(error instanceof AccountDataError && error.code === "NOT_FOUND")) {
      console.error("[account:data_export]", error);
    }
    return Response.json({ error: { code: "EXPORT_UNAVAILABLE", message: "The export could not be created." } }, {
      status: 500,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
