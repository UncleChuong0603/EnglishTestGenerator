"use server";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { supportTickets } from "@/db/schema";
import { requireAdmin } from "@/lib/admin/authorization";
export async function updateTicketStatus(formData: FormData) { await requireAdmin("USER_READ"); const id=String(formData.get("id")??""),status=String(formData.get("status")??""); if(!id||!["NEW","IN_PROGRESS","RESOLVED"].includes(status)) redirect("/admin/support?error=invalid"); await db.update(supportTickets).set({status,updatedAt:new Date()}).where(eq(supportTickets.id,id)); revalidatePath("/admin/support"); }
