import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");

const confirmed = process.argv.includes("--confirm-all-payment-data");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

try {
  const preview = await pool.query(`
    select
      (select count(*)::int from payment_orders) as orders,
      (select count(*)::int from payment_events) as events,
      (select count(*)::int from user_plan_memberships where source = 'PAYMENT') as memberships,
      (select coalesce(sum(amount), 0)::bigint from payment_orders where status = 'PAID') as paid_revenue_vnd
  `);
  console.log(JSON.stringify({ mode: confirmed ? "DELETE" : "PREVIEW", ...preview.rows[0] }, null, 2));

  if (!confirmed) {
    console.log("No data changed. Re-run with --confirm-all-payment-data after reviewing the preview.");
    process.exitCode = 2;
  } else {
    const client = await pool.connect();
    try {
      await client.query("begin");
      const memberships = await client.query("delete from user_plan_memberships where source = 'PAYMENT'");
      const events = await client.query("delete from payment_events");
      const orders = await client.query("delete from payment_orders");
      await client.query("commit");
      console.log(JSON.stringify({ deleted: { memberships: memberships.rowCount, events: events.rowCount, orders: orders.rowCount } }, null, 2));
    } catch (error) {
      await client.query("rollback");
      throw error;
    } finally {
      client.release();
    }
  }
} finally {
  await pool.end();
}
