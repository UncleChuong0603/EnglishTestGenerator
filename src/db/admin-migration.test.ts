import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const database = new PGlite();
beforeAll(async () => { const journal=JSON.parse(readFileSync("drizzle/meta/_journal.json","utf8")); for(const entry of journal.entries) await database.exec(readFileSync(`drizzle/${entry.tag}.sql`,"utf8")); }, 30_000);
afterAll(async()=>database.close());
const first="10000000-0000-4000-8000-000000000091"; const second="10000000-0000-4000-8000-000000000092";

describe("Task 14 admin migration",()=>{
  it("is append-only after Task 13 and creates RBAC/audit tables",async()=>{ const journal=JSON.parse(readFileSync("drizzle/meta/_journal.json","utf8")); const tags=journal.entries.map((entry:{tag:string})=>entry.tag); expect(tags.indexOf("0009_admin_rbac")).toBe(tags.indexOf("0008_entitlements_usage")+1); const result=await database.query<{table_name:string}>("select table_name from information_schema.tables where table_schema='public'"); expect(result.rows.map(r=>r.table_name)).toEqual(expect.arrayContaining(["user_roles","admin_audit_logs"])); });
  it("allows role history but rejects duplicate active ADMIN and arbitrary roles",async()=>{ await database.exec(`insert into users(id,email,email_normalized,status) values ('${first}','admin1@example.com','admin1@example.com','active'),('${second}','admin2@example.com','admin2@example.com','active')`); await database.exec(`insert into user_roles(user_id,role) values ('${first}','ADMIN')`); await expect(database.exec(`insert into user_roles(user_id,role) values ('${first}','ADMIN')`)).rejects.toThrow(); await database.exec(`update user_roles set revoked_at=now() where user_id='${first}'`); await database.exec(`insert into user_roles(user_id,role) values ('${first}','ADMIN')`); await expect(database.exec(`insert into user_roles(user_id,role) values ('${second}','GODMODE')`)).rejects.toThrow(); });
  it("accepts only strongly typed audit actions",async()=>{ await database.exec(`insert into admin_audit_logs(action,target_user_id,metadata) values ('ADMIN_ROLE_GRANTED','${first}','{"role":"ADMIN"}')`); await expect(database.exec(`insert into admin_audit_logs(action) values ('PASSWORD_DUMPED')`)).rejects.toThrow(); });
});
