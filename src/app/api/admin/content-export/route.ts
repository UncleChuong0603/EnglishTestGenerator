import { requireAdmin } from "@/lib/admin/authorization";
import { ContentAdminError, exportQuestions } from "@/lib/admin/content";

export async function GET(request: Request) {
  await requireAdmin("CONTENT_READ");
  const params = new URL(request.url).searchParams;
  const part = Number(params.get("part"));
  try {
    if (params.get("scope") === "selected" && !params.has("id")) throw new ContentAdminError("INVALID_SELECTION");
    const payload = await exportQuestions({
      part, lifecycle: params.get("lifecycle") || undefined, difficulty: params.get("difficulty") || undefined,
      skill: params.get("skill") || undefined, subSkill: params.get("subSkill") || undefined,
      provenance: params.get("provenance") || undefined, batch: params.get("batch") || undefined,
      setType: params.get("setType") || undefined, search: params.get("search") || undefined,
      ids: params.has("id") ? params.getAll("id") : undefined,
    });
    const date = new Date().toISOString().slice(0, 10);
    return new Response(`${JSON.stringify(payload, null, 2)}\n`, { headers: { "content-type": "application/json; charset=utf-8", "content-disposition": `attachment; filename="toeicgym-part${part}-${date}.json"`, "cache-control": "private, no-store" } });
  } catch (error) {
    const detail = error instanceof ContentAdminError ? { error: error.code, issues: error.issues } : { error: "EXPORT_FAILED" };
    return Response.json(detail, { status: 400 });
  }
}
