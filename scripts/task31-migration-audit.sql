BEGIN READ ONLY;
SELECT schemaname, tablename FROM pg_tables WHERE tablename = '__drizzle_migrations';
SELECT id, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at DESC LIMIT 5;
SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'product_events'::regclass AND conname = 'product_events_name_check';
ROLLBACK;
