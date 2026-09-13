import "server-only";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const globalDb = globalThis as typeof globalThis & { __englishTestPool?: Pool };

export const pool = globalDb.__englishTestPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
if (process.env.NODE_ENV !== "production") globalDb.__englishTestPool = pool;
export const db = drizzle(pool, { schema });
