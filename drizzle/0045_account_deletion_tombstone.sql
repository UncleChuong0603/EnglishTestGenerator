ALTER TABLE "users" ADD COLUMN "deleted_at" timestamp with time zone;
--> statement-breakpoint
-- Preserve the tombstone even when an old administrative action attempts to
-- reactivate a disabled account. User-owned writes cannot recreate erased data.
CREATE FUNCTION account_deletion_tombstone_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.deleted_at IS NOT NULL AND (
    NEW.deleted_at IS DISTINCT FROM OLD.deleted_at OR NEW.status <> 'disabled' OR
    NEW.password_hash IS NOT NULL OR NEW.email_verified_at IS NOT NULL OR
    NEW.email IS DISTINCT FROM OLD.email OR NEW.email_normalized IS DISTINCT FROM OLD.email_normalized
  ) THEN
    RAISE EXCEPTION 'ACCOUNT_DELETED' USING ERRCODE = '23514';
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER users_deletion_tombstone_guard BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION account_deletion_tombstone_guard();
--> statement-breakpoint
CREATE FUNCTION account_deletion_owned_write_guard() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE
  owner_id uuid;
  erased_at timestamptz;
BEGIN
  owner_id := (to_jsonb(NEW) ->> TG_ARGV[0])::uuid;
  IF owner_id IS NOT NULL THEN
    -- Serialize with the deletion's FOR UPDATE lock. After deletion commits,
    -- reject any delayed request which authenticated before session invalidation.
    SELECT deleted_at INTO erased_at FROM users WHERE id = owner_id FOR KEY SHARE;
    IF erased_at IS NOT NULL THEN
      RAISE EXCEPTION 'ACCOUNT_DELETED' USING ERRCODE = '23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;
--> statement-breakpoint
DO $$
DECLARE
  owned_table text;
BEGIN
  FOREACH owned_table IN ARRAY ARRAY[
    'user_sessions','auth_identities','email_verification_tokens','password_reset_tokens',
    'account_activation_tokens','practice_sessions','attempt_answers','demo_test_answers',
    'full_mock_answers','diagnostic_runs','full_mock_runs','ranked_challenge_runs',
    'learner_goals','learner_contexts','weekly_plan_snapshots','question_mastery',
    'user_vocabulary','study_streaks','gamification_events','usage_consumptions',
    'user_plan_memberships','lifecycle_emails','support_tickets','product_events','security_events','user_roles'
  ] LOOP
    EXECUTE format('CREATE TRIGGER %I BEFORE INSERT OR UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION account_deletion_owned_write_guard(%L)',
      owned_table || '_deletion_guard', owned_table, 'user_id');
  END LOOP;
END;
$$;
--> statement-breakpoint
CREATE TRIGGER profiles_deletion_guard BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION account_deletion_owned_write_guard('id');
--> statement-breakpoint
CREATE TRIGGER oauth_states_deletion_guard BEFORE INSERT OR UPDATE ON oauth_states
FOR EACH ROW EXECUTE FUNCTION account_deletion_owned_write_guard('link_user_id');
--> statement-breakpoint
CREATE TRIGGER payment_orders_deletion_guard BEFORE INSERT ON payment_orders
FOR EACH ROW EXECUTE FUNCTION account_deletion_owned_write_guard('user_id');
