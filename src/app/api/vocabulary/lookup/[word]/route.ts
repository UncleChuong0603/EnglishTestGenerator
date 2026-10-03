import { lookupDictionaryWord } from "@/lib/vocabulary/dictionary";

export async function GET(request: Request, { params }: { params: Promise<{ word: string }> }) {
  const { word } = await params;
  const context = new URL(request.url).searchParams.get("context") ?? "";
  const card = await lookupDictionaryWord(word, context);
  return card ? Response.json(card, { headers: { "Cache-Control": "public, max-age=3600" } }) : Response.json({ error: "not_found" }, { status: 404 });
}
