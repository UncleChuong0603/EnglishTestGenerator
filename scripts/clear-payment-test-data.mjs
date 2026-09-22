import pg from "pg";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL_REQUIRED");

const confirmed = process.argv.includes("--confirm-all-payment-data");
const preserveEmailArg = process.argv.find((arg) => arg.startsWith("--preserve-premium-email="));
const preserveEmail = preserveEmailArg?.slice("--preserve-premium-email=".length).trim().toLowerCase() || null;
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 1 });

try {
  const preview = await pool.query(`
    select
      (select count(*)::int from payment_orders) as orders,
      (select count(*)::int from payment_events) as events,
      (select count(*)::int from user_plan_memberships where source = 'PAYMENT') as memberships,
      (select coalesce(sum(amount), 0)::bigint from payment_orders where status = 'PAID') as paid_revenue_vnd
  `);
  const preserved = preserveEmail ? await pool.query(`
    select u.id, u.email,
      count(m.id)::int as active_memberships,
      count(m.id) filter (where m.source = 'PAYMENT')::int as active_payment_memberships
    from users u
    left join user_plan_memberships m on m.user_id = u.id
      and m.revoked_at is null
      and m.starts_at <= now()
      and (m.ends_at is null or m.ends_at > now())
    where u.email_normalized = $1
    group by u.id, u.email
  `, [preserveEmail]) : { rows: [] };
  console.log(JSON.stringify({ mode: confirmed ? "DELETE" : "PREVIEW", preservePremiumFor: preserved.rows[0] ?? null, ...preview.rows[0] }, null, 2));

  if (!confirmed) {
    console.log("No data changed. Re-run with --confirm-all-payment-data after reviewing the preview.");
    process.exitCode = 2;
  } else {
    const client = await pool.connect();
    try {
      await client.query("begin");
      let preservedMemberships = 0;
      if (preserveEmail) {
        const preservedUser = preserved.rows[0];
        if (!preservedUser) throw new Error("PRESERVE_PREMIUM_USER_NOT_FOUND");
        if (preservedUser.active_memberships < 1) throw new Error("PRESERVE_PREMIUM_HAS_NO_ACTIVE_MEMBERSHIP");
        const result = await client.query(`
          update user_plan_memberships m
          set source = 'MANUAL', payment_order_id = null, updated_at = now()
          from users u
          where m.user_id = u.id
            and u.email_normalized = $1
            and m.source = 'PAYMENT'
            and m.revoked_at is null
            and m.starts_at <= now()
            and (m.ends_at is null or m.ends_at > now())
        `, [preserveEmail]);
        preservedMemberships = result.rowCount;
      }
      const memberships = await client.query("delete from user_plan_memberships where source = 'PAYMENT'");
      const events = await client.query("delete from payment_events");
      const orders = await client.query("delete from payment_orders");
      await client.query("commit");
      console.log(JSON.stringify({ preservedMemberships, deleted: { memberships: memberships.rowCount, events: events.rowCount, orders: orders.rowCount } }, null, 2));
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
