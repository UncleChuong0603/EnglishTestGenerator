import { db } from "@/db";
import { adminAuditLogs } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/authorization";
import { ingestMedia } from "@/lib/media/ingestion";
import { DrizzleMediaAssetRepository } from "@/lib/media/repository";
import { createMediaStorage, getMediaProvider } from "@/lib/media/storage";
export async function POST(request:Request){const actor=await requireAdmin("MEDIA_MANAGE");try{const data=await request.formData(),file=data.get("file");if(!(file instanceof File))return Response.json({error:"INVALID_UPLOAD"},{status:400});const asset=await ingestMedia({storage:createMediaStorage(),repository:new DrizzleMediaAssetRepository(),provider:getMediaProvider()},{kind:"IMAGE",accessScope:"CONTENT",mimeType:file.type,body:new Uint8Array(await file.arrayBuffer())});await db.insert(adminAuditLogs).values({actorUserId:actor.id,action:"MEDIA_UPLOADED",metadata:{mediaId:asset.id,kind:asset.kind,byteSize:asset.byteSize,source:"BLOG_EDITOR"}});return Response.json({image:{id:asset.id,storageKey:asset.storageKey,imageWidth:asset.imageWidth,imageHeight:asset.imageHeight}});}catch(error){return Response.json({error:error instanceof Error?error.message:"FAILED"},{status:400});}}
