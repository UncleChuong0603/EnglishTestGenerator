import { vocabularyCatalog } from "@/lib/vocabulary/catalog";

export async function GET(_request: Request, { params }: { params: Promise<{ word: string }> }) {
  const { word } = await params;
  if (!vocabularyCatalog.some((entry) => entry.kind === "word" && entry.term === word)) return new Response(null, { status: 404 });
  try {
    const dictionary = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`, { signal: AbortSignal.timeout(4000), next: { revalidate: 86400 } });
    if (!dictionary.ok) return new Response(null, { status: 404 });
    const data: unknown = await dictionary.json();
    const entries = Array.isArray(data) ? data : [];
    const phonetics = entries.flatMap((entry) => entry && typeof entry === "object" && "phonetics" in entry && Array.isArray(entry.phonetics) ? entry.phonetics : []);
    const audioUrl = phonetics.find((item) => item && typeof item === "object" && "audio" in item && typeof item.audio === "string" && item.audio)?.audio;
    if (typeof audioUrl !== "string") return new Response(null, { status: 404 });
    const url = new URL(audioUrl.startsWith("//") ? `https:${audioUrl}` : audioUrl);
    if (url.protocol !== "https:" || url.hostname !== "ssl.gstatic.com") return new Response(null, { status: 404 });
    const audio = await fetch(url, { signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } });
    if (!audio.ok || !audio.headers.get("content-type")?.startsWith("audio/") || Number(audio.headers.get("content-length") || 0) > 1_000_000) return new Response(null, { status: 404 });
    const bytes = await audio.arrayBuffer();
    if (bytes.byteLength > 1_000_000) return new Response(null, { status: 404 });
    return new Response(bytes, { headers: { "Content-Type": audio.headers.get("content-type") || "audio/mpeg", "Cache-Control": "public, max-age=86400" } });
  } catch { return new Response(null, { status: 404 }); }
}
