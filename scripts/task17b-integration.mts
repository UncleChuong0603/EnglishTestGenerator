import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import pg from "pg";
import { assertTestDatabase } from "./lib/assert-test-database.mjs";

const testUrl = process.env.TASK17_TEST_DATABASE_URL ?? process.env.TASK16_TEST_DATABASE_URL;
if (!testUrl) throw new Error("TASK17_TEST_DATABASE_URL_REQUIRED");
const source = new URL(testUrl);
await assertTestDatabase(source.href);
process.env.DATABASE_URL = source.href;
process.env.PAYMENT_PROVIDER = "FAKE";
process.env.PREMIUM_30_PRICE_VND = "59000"; process.env.PREMIUM_90_PRICE_VND = "139000"; process.env.PREMIUM_365_PRICE_VND = "399000";
const databaseName = source.pathname.slice(1);
if (!/^[a-zA-Z0-9_]+$/.test(databaseName)) throw new Error("INVALID_TEST_DATABASE_NAME");
const pool = new pg.Pool({ connectionString: source.href, max: 12 });

async function freshMigrate() {
  await pool.query("drop schema public cascade"); await pool.query("create schema public");
  const journal = JSON.parse(readFileSync("drizzle/meta/_journal.json", "utf8"));
  for (const entry of journal.entries) { const client=await pool.connect(); try { await client.query("begin"); await client.query(readFileSync(`drizzle/${entry.tag}.sql`,"utf8")); await client.query("commit"); } catch(e){await client.query("rollback");throw e} finally{client.release()} }
  assert.equal(journal.entries.at(-1).tag,"0022_advanced_practice_targeting");
}
async function user(email:string){const id=randomUUID();await pool.query(`insert into users(id,email,email_normalized,status,email_verified_at) values($1,$2,$2,'active',now())`,[id,email]);await pool.query(`insert into profiles(id,full_name) values($1,$2)`,[id,email]);return id}
async function orderRow(id:string){return (await pool.query(`select * from payment_orders where id=$1`,[id])).rows[0]}
async function memberships(userId:string){return (await pool.query(`select * from user_plan_memberships where user_id=$1 order by created_at`,[userId])).rows}

async function main(){
  await freshMigrate();
  const version=(await pool.query(`show server_version`)).rows[0].server_version; assert.match(version,/^17\./);
  const constraints=(await pool.query(`select constraint_name from information_schema.table_constraints where table_name in ('payment_orders','payment_events','user_plan_memberships')`)).rows.map(r=>r.constraint_name);
  for(const name of ["payment_orders_amount_check","payment_orders_currency_check","payment_orders_provider_check","payment_orders_status_check","payment_events_provider_key_unique","user_plan_memberships_payment_source_check"])assert.ok(constraints.includes(name),name);

  const [{FakePaymentProvider},{createPaymentOrder,applyVerifiedPayment,getUserOrder,reconcileOrder,cancelOrder},{getEffectivePlan},{grantPremiumWithTx},{db}]=await Promise.all([import("../src/lib/payments/provider.ts"),import("../src/lib/payments/service.ts"),import("../src/lib/entitlements/service.ts"),import("../src/lib/entitlements/service.ts"),import("../src/db/index.ts")]);
  const fake=new FakePaymentProvider(); const alice=await user("alice@task17.invalid"),bob=await user("bob@task17.invalid");
  const created=await createPaymentOrder(alice,"PREMIUM_30_DAYS",fake); assert.equal(created.status,"PENDING");
  const duplicate=await createPaymentOrder(alice,"PREMIUM_30_DAYS",fake); assert.equal(duplicate.id,created.id);
  const event={eventKey:"success-30",orderCode:created.orderCode,amountVnd:created.amount,currency:"VND" as const,providerPaymentId:created.providerPaymentId!,paid:true};
  await applyVerifiedPayment(event,"FAKE"); assert.equal((await orderRow(created.id)).status,"PAID"); assert.equal(await getEffectivePlan(alice),"PREMIUM");
  let member=await memberships(alice); assert.equal(member.length,1); assert.equal(member[0].source,"PAYMENT"); assert.equal(member[0].payment_order_id,created.id);
  for(let i=0;i<10;i++)await applyVerifiedPayment(event,"FAKE"); assert.equal((await memberships(alice)).length,1);
  await applyVerifiedPayment({...event,eventKey:"success-30-other"},"FAKE"); assert.equal((await memberships(alice)).length,1);

  for(const [key,days] of [["PREMIUM_90_DAYS",90],["PREMIUM_365_DAYS",365]] as const){const o=await createPaymentOrder(alice,key,fake);await applyVerifiedPayment({eventKey:`paid-${days}`,orderCode:o.orderCode,amountVnd:o.amount,currency:"VND",providerPaymentId:o.providerPaymentId!,paid:true},"FAKE");}
  member=await memberships(alice); assert.equal(member.length,3); const firstEnd=new Date(member[0].ends_at).getTime(),lastEnd=new Date(member[2].ends_at).getTime();assert.equal(Math.round((lastEnd-firstEnd)/86400000),455);

  const concurrent=await createPaymentOrder(bob,"PREMIUM_30_DAYS",fake);const ce={eventKey:"concurrent-same",orderCode:concurrent.orderCode,amountVnd:concurrent.amount,currency:"VND" as const,providerPaymentId:concurrent.providerPaymentId!,paid:true};await Promise.all(Array.from({length:8},()=>applyVerifiedPayment(ce,"FAKE")));assert.equal((await memberships(bob)).length,1);
  const bob2=await user("bob2@task17.invalid"),cd=await createPaymentOrder(bob2,"PREMIUM_30_DAYS",fake);await Promise.all(["different-a","different-b"].map(eventKey=>applyVerifiedPayment({...ce,eventKey,orderCode:cd.orderCode,providerPaymentId:cd.providerPaymentId!},"FAKE")));assert.equal((await memberships(bob2)).length,1);

  const rollbackUser=await user("rollback@task17.invalid"),ro=await createPaymentOrder(rollbackUser,"PREMIUM_30_DAYS",fake),re={...ce,eventKey:"rollback",orderCode:ro.orderCode,providerPaymentId:ro.providerPaymentId!};await assert.rejects(applyVerifiedPayment(re,"FAKE",true),/INJECTED_ROLLBACK/);assert.equal((await orderRow(ro.id)).status,"PENDING");assert.equal((await memberships(rollbackUser)).length,0);await applyVerifiedPayment(re,"FAKE");assert.equal((await memberships(rollbackUser)).length,1);

  const mismatchUser=await user("mismatch@task17.invalid"),mo=await createPaymentOrder(mismatchUser,"PREMIUM_30_DAYS",fake);await applyVerifiedPayment({...ce,eventKey:"mismatch",orderCode:mo.orderCode,amountVnd:mo.amount+1,providerPaymentId:mo.providerPaymentId!},"FAKE");assert.equal((await orderRow(mo.id)).status,"PENDING");assert.equal((await memberships(mismatchUser)).length,0);
  await assert.rejects(applyVerifiedPayment({...ce,eventKey:"wrong-order",orderCode:999999999},"FAKE"),/PAYMENT_ORDER_NOT_FOUND/);
  assert.equal(await getUserOrder(bob,created.id),null);await assert.rejects(reconcileOrder(created.id,bob,fake),/ORDER_NOT_FOUND/);await assert.rejects(cancelOrder(mo.id,bob,fake),/ORDER_NOT_FOUND/);
  const cancelUser=await user("cancel@task17.invalid"),co=await createPaymentOrder(cancelUser,"PREMIUM_30_DAYS",fake);await cancelOrder(co.id,cancelUser,fake);assert.equal((await orderRow(co.id)).status,"CANCELLED");assert.equal(await getEffectivePlan(cancelUser),"FREE");await applyVerifiedPayment({...ce,eventKey:"cancel-late",orderCode:co.orderCode,providerPaymentId:co.providerPaymentId!},"FAKE");assert.equal((await orderRow(co.id)).status,"PAID");assert.equal(await getEffectivePlan(cancelUser),"PREMIUM");

  const lateUser=await user("late@task17.invalid"),late=await createPaymentOrder(lateUser,"PREMIUM_30_DAYS",fake);await pool.query(`update payment_orders set expires_at=now()-interval '1 minute' where id=$1`,[late.id]);await applyVerifiedPayment({...ce,eventKey:"late",orderCode:late.orderCode,providerPaymentId:late.providerPaymentId!},"FAKE");assert.equal((await orderRow(late.id)).status,"PAID");
  const failUser=await user("failure@task17.invalid");const failing={...fake,name:"FAKE" as const,create:async()=>{throw new Error("FAKE_CREATE_FAILURE")}};await assert.rejects(createPaymentOrder(failUser,"PREMIUM_30_DAYS",failing),/FAKE_CREATE_FAILURE/);assert.equal((await pool.query(`select status from payment_orders where user_id=$1`,[failUser])).rows[0].status,"FAILED");assert.equal(await getEffectivePlan(failUser),"FREE");

  const manual=await user("manual@task17.invalid");await db.transaction(tx=>grantPremiumWithTx(tx,{userId:manual,days:30}));const manualRows=await memberships(manual);assert.equal(manualRows[0].source,"MANUAL");assert.equal(manualRows[0].payment_order_id,null);assert.equal((await pool.query(`select count(*)::int n from payment_orders where user_id=$1`,[manual])).rows[0].n,0);
  const expired=await user("expired@task17.invalid");await pool.query(`insert into user_plan_memberships(user_id,plan_key,source,starts_at,ends_at) values($1,'PREMIUM','MANUAL',now()-interval '2 day',now()-interval '1 day')`,[expired]);assert.equal(await getEffectivePlan(expired),"FREE");
  const eventCounts=(await pool.query(`select count(*)::int events,count(*) filter(where processing_status='REJECTED')::int rejected from payment_events`)).rows[0];assert.ok(eventCounts.rejected>=1);
  console.log("TASK17B_POSTGRES_INTEGRATION_PASS");console.log(JSON.stringify({postgresVersion:version.split(".")[0],host:"127.0.0.1",port:15433,migrations:"0000-0015",sameEvent:true,differentEvents:true,concurrency:true,rollback:true,amountMismatch:true,crossUser:true,latePayment:true,realPayosCalls:0}));
}
try{await main()}finally{await pool.end();const {pool:appPool}=await import("../src/db/index.ts");await appPool.end()}
