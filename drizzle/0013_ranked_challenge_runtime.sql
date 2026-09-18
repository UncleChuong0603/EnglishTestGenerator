ALTER TABLE "ranked_challenge_runs" ADD COLUMN "section" text;
ALTER TABLE "ranked_challenge_runs" ADD COLUMN "listening_deadline" timestamptz;
ALTER TABLE "ranked_challenge_runs" ADD COLUMN "reading_deadline" timestamptz;
ALTER TABLE "ranked_challenge_runs" ADD CONSTRAINT "ranked_challenge_runs_section_check" CHECK ("section" IS NULL OR "section" in ('LISTENING','READING'));
ALTER TABLE "practice_sessions" ADD COLUMN "ranked_challenge_run_id" uuid REFERENCES "ranked_challenge_runs"("id") ON DELETE CASCADE;
ALTER TABLE "practice_sessions" ADD COLUMN "ranked_challenge_order" smallint;
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_ranked_challenge_link_check" CHECK (("source"='ranked_challenge' AND "ranked_challenge_run_id" IS NOT NULL AND "ranked_challenge_order" between 1 and 7 AND "user_id" IS NOT NULL AND "guest_owner_hash" IS NULL) OR ("source"<>'ranked_challenge' AND "ranked_challenge_run_id" IS NULL AND "ranked_challenge_order" IS NULL));
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_ranked_order_unique" UNIQUE ("ranked_challenge_run_id","ranked_challenge_order");
DROP INDEX "practice_sessions_one_open_practice_idx";
CREATE UNIQUE INDEX "practice_sessions_one_open_practice_idx" ON "practice_sessions" ("user_id") WHERE "status"='in_progress' AND "practice_type"<>'demo_test' AND "source" not in ('diagnostic','full_mock','ranked_challenge') AND "user_id" IS NOT NULL;
CREATE INDEX "practice_sessions_ranked_run_idx" ON "practice_sessions" ("ranked_challenge_run_id","ranked_challenge_order");
CREATE FUNCTION protect_active_challenge_content() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.status='archived' AND OLD.status='published' AND EXISTS (
    SELECT 1 FROM ranked_challenge_items i JOIN ranked_challenges c ON c.id=i.challenge_id
    WHERE (i.group_id=OLD.id OR i.question_id IN (SELECT id FROM questions WHERE passage_set_id=OLD.id))
      AND c.status='PUBLISHED' AND c.ends_at>now()
  ) THEN RAISE EXCEPTION 'CONTENT_USED_BY_ACTIVE_CHALLENGE' USING ERRCODE='check_violation'; END IF;
  RETURN NEW;
END $$;
CREATE TRIGGER passage_sets_active_challenge_archive_guard BEFORE UPDATE OF status ON passage_sets FOR EACH ROW EXECUTE FUNCTION protect_active_challenge_content();
