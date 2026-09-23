import { NextResponse } from "next/server";
import { CATEGORY_LABELS, POST_CATEGORIES, type PostCategory } from "@/lib/blog/core";

const palettes: Record<PostCategory, [string, string, string]> = {
  TOEIC_STRATEGY: ["#0f172a", "#0f766e", "#99f6e4"], LISTENING: ["#082f49", "#0369a1", "#bae6fd"],
  READING: ["#451a03", "#c2410c", "#fed7aa"], GRAMMAR: ["#3b0764", "#7e22ce", "#e9d5ff"],
  VOCABULARY: ["#052e16", "#15803d", "#bbf7d0"], STUDY_PLAN: ["#422006", "#ca8a04", "#fef08a"],
  EXAM_TIPS: ["#450a0a", "#be123c", "#fecdd3"],
  EXAM_REVIEW: ["#172554", "#4f46e5", "#c7d2fe"],
};

export async function GET(_: Request, { params }: { params: Promise<{ category: string }> }) {
  const raw = (await params).category.toUpperCase() as PostCategory;
  const category = POST_CATEGORIES.includes(raw) ? raw : "TOEIC_STRATEGY";
  const [dark, mid, light] = palettes[category];
  const label = CATEGORY_LABELS[category].vi;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="675" viewBox="0 0 1200 675" role="img" aria-label="${label}"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${dark}"/><stop offset="1" stop-color="${mid}"/></linearGradient><pattern id="p" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0v48" fill="none" stroke="${light}" stroke-opacity=".1"/></pattern></defs><rect width="1200" height="675" rx="36" fill="url(#g)"/><rect width="1200" height="675" rx="36" fill="url(#p)"/><circle cx="1000" cy="120" r="190" fill="${light}" fill-opacity=".13"/><circle cx="1030" cy="560" r="250" fill="none" stroke="${light}" stroke-opacity=".18" stroke-width="2"/><text x="78" y="105" fill="${light}" font-family="Arial,sans-serif" font-size="24" font-weight="700" letter-spacing="5">TOEIC GYM · FIELD NOTES</text><text x="78" y="340" fill="#fff" font-family="Arial,sans-serif" font-size="76" font-weight="800">${label}</text><text x="82" y="405" fill="${light}" font-family="Arial,sans-serif" font-size="28">Học đúng trọng tâm · Tiến bộ có dữ liệu</text><path d="M82 500h360" stroke="${light}" stroke-width="12" stroke-linecap="round"/><path d="M82 540h230" stroke="#fff" stroke-opacity=".5" stroke-width="12" stroke-linecap="round"/></svg>`;
  return new NextResponse(svg, { headers: { "Content-Type": "image/svg+xml; charset=utf-8", "Cache-Control": "public, max-age=31536000, immutable" } });
}
