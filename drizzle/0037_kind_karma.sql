CREATE TABLE "listening_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"toeic_part" smallint NOT NULL,
	"transcript" text NOT NULL,
	"transcript_fingerprint" text NOT NULL,
	"audio_storage_key" text NOT NULL,
	"audio_checksum" text NOT NULL,
	"audio_duration_ms" integer,
	"image_storage_key" text,
	"image_checksum" text,
	"image_alt" text,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listening_lessons_part_check" CHECK ("listening_lessons"."toeic_part" between 1 and 4),
	CONSTRAINT "listening_lessons_status_check" CHECK ("listening_lessons"."status" in ('DRAFT','PUBLISHED','ARCHIVED')),
	CONSTRAINT "listening_lessons_image_check" CHECK (("listening_lessons"."image_storage_key" is null) = ("listening_lessons"."image_checksum" is null))
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_action_check";--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD COLUMN "source_session_id" uuid;--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD COLUMN "source_question_number" smallint;--> statement-breakpoint
CREATE INDEX "listening_lessons_status_part_idx" ON "listening_lessons" USING btree ("status","toeic_part","published_at");--> statement-breakpoint
CREATE UNIQUE INDEX "listening_lessons_transcript_fingerprint_uidx" ON "listening_lessons" USING btree ("transcript_fingerprint");--> statement-breakpoint
CREATE UNIQUE INDEX "listening_lessons_audio_checksum_uidx" ON "listening_lessons" USING btree ("audio_checksum");--> statement-breakpoint
ALTER TABLE "user_vocabulary" ADD CONSTRAINT "user_vocabulary_source_session_id_practice_sessions_id_fk" FOREIGN KEY ("source_session_id") REFERENCES "public"."practice_sessions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_action_check" CHECK ("admin_audit_logs"."action" in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED','CONTENT_DRAFT_CREATED','CONTENT_DRAFT_UPDATED','CONTENT_CLONED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','CONTENT_DRAFT_DISCARDED','CONTENT_UNARCHIVED','CONTENT_DUPLICATE_DELETED','MEDIA_UPLOADED','CHALLENGE_DRAFT_CREATED','CHALLENGE_FORM_GENERATED','CHALLENGE_PUBLISHED','CHALLENGE_CANCELLED','SEO_POST_CREATED','SEO_POST_UPDATED','SEO_POST_PUBLISHED','SEO_POST_UNPUBLISHED','SEO_POST_DELETED','IMPORT_VALIDATED','IMPORT_COMMITTED','IMPORT_FAILED','QUESTION_BANK_BLUEPRINT_UPDATED','CONTENT_QUALITY_SETTINGS_UPDATED','SUPPORT_SETTINGS_UPDATED','LISTENING_LESSON_CREATED','LISTENING_LESSON_UPDATED','LISTENING_LESSON_PUBLISHED','LISTENING_LESSON_ARCHIVED'));
--> statement-breakpoint
CREATE FUNCTION prevent_lesson_transcript_in_question_bank() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(72831501);
  IF EXISTS (
    SELECT 1 FROM listening_lessons l
    WHERE l.status IN ('PUBLISHED', 'ARCHIVED')
      AND lower(btrim(regexp_replace(regexp_replace(l.transcript, '[^[:alnum:][:space:]]', '', 'g'), '[[:space:]]+', ' ', 'g')))
        = lower(btrim(regexp_replace(regexp_replace(NEW.content, '[^[:alnum:][:space:]]', '', 'g'), '[[:space:]]+', ' ', 'g')))
  ) THEN
    RAISE EXCEPTION 'LISTENING_LESSON_CONTENT_REUSED_IN_QUESTION_BANK';
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER listening_transcript_lesson_separation
BEFORE INSERT OR UPDATE OF content ON listening_transcripts
FOR EACH ROW EXECUTE FUNCTION prevent_lesson_transcript_in_question_bank();
--> statement-breakpoint
CREATE FUNCTION prevent_lesson_audio_in_question_bank() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  PERFORM pg_advisory_xact_lock(72831501);
  IF NEW.role = 'AUDIO' AND EXISTS (
    SELECT 1 FROM media_assets m JOIN listening_lessons l ON l.audio_checksum = m.checksum
    WHERE m.id = NEW.media_asset_id AND l.status IN ('PUBLISHED', 'ARCHIVED')
  ) THEN
    RAISE EXCEPTION 'LISTENING_LESSON_AUDIO_REUSED_IN_QUESTION_BANK';
  END IF;
  RETURN NEW;
END $$;
--> statement-breakpoint
CREATE TRIGGER question_group_media_lesson_separation
BEFORE INSERT OR UPDATE OF media_asset_id, role ON question_group_media
FOR EACH ROW EXECUTE FUNCTION prevent_lesson_audio_in_question_bank();
--> statement-breakpoint
CREATE TRIGGER stimulus_media_lesson_separation
BEFORE INSERT OR UPDATE OF media_asset_id, role ON stimulus_media
FOR EACH ROW EXECUTE FUNCTION prevent_lesson_audio_in_question_bank();
