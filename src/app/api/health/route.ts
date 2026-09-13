import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
export const dynamic = "force-dynamic";
export async function GET() { try { await db.execute(sql`select 1`); return NextResponse.json({ status: "ok", database: "reachable" }); } catch (error) { console.error("Health check database failure", error); return NextResponse.json({ status: "unhealthy", database: "unreachable" }, { status: 503 }); } }
