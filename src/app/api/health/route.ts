import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { getServerEnv } from "@/lib/env";
export const dynamic = "force-dynamic";
export async function GET() { try { getServerEnv(); await db.execute(sql`select 1`); return NextResponse.json({ status: "ok", database: "reachable" }); } catch (error) { console.error("Health check failure", error); return NextResponse.json({ status: "unhealthy", database: "unreachable" }, { status: 503 }); } }
