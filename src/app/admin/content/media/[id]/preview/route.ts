import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaAssets } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/authorization";
import { createAuthorizedReadUrl } from "@/lib/media/ingestion"; import type { MediaAssetRecord } from "@/lib/media/types";
import { createMediaStorage } from "@/lib/media/storage";
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) { const admin = await requireAdmin("MEDIA_READ"); const { id } = await params; const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1); if (!asset) return new NextResponse("Not found", { status: 404 }); const url = await createAuthorizedReadUrl(createMediaStorage(), asset as MediaAssetRecord, { userId: admin.id, isAdmin: true }); return NextResponse.redirect(url); }
