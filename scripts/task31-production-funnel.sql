BEGIN READ ONLY;
SELECT current_database() AS database, count(*) AS product_events_total
FROM product_events;
SELECT event_name, count(*) AS events_last_7_days
FROM product_events
WHERE occurred_at >= now() - interval '7 days'
  AND event_name IN (
    'challenge_viewed', 'challenge_started', 'challenge_completed',
    'signup_after_challenge', 'first_authenticated_workout_after_challenge'
  )
GROUP BY event_name ORDER BY event_name;
SELECT conname, pg_get_constraintdef(oid) LIKE '%challenge_viewed%' AS task31_migration_applied
FROM pg_constraint
WHERE conrelid = 'product_events'::regclass AND conname = 'product_events_name_check';
ROLLBACK;
