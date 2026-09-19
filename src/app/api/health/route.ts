import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { getServerEnv } from "@/lib/env";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    getServerEnv();
  } catch (error) {
    console.error("Health check failed: invalid server environment", {
      reason: error instanceof Error ? error.message : "unknown",
    });
    return NextResponse.json({ status: "unhealthy", database: "unknown" }, { status: 503 });
  }

  try {
    await db.execute(sql`select 1`);
    return NextResponse.json({ status: "ok", database: "reachable" });
  } catch (error) {
    console.error("Database health check failed", {
      type: error instanceof Error ? error.name : "unknown",
    });
    return NextResponse.json({ status: "unhealthy", database: "unreachable" }, { status: 503 });
  }
}
