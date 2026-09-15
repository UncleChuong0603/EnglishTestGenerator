CREATE TABLE "listening_transcripts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_group_id" uuid,
	"stimulus_id" uuid,
	"media_asset_id" uuid,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "listening_transcripts_parent_check" CHECK (num_nonnulls("listening_transcripts"."question_group_id", "listening_transcripts"."stimulus_id", "listening_transcripts"."media_asset_id") = 1)
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"access_scope" text NOT NULL,
	"storage_provider" text DEFAULT 'R2' NOT NULL,
	"storage_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"checksum" text NOT NULL,
	"status" text DEFAULT 'UPLOADING' NOT NULL,
	"owner_user_id" uuid,
	"audio_duration_ms" integer,
	"image_width" integer,
	"image_height" integer,
	"archived_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "media_assets_kind_check" CHECK ("media_assets"."kind" in ('AUDIO','IMAGE')),
	CONSTRAINT "media_assets_access_scope_check" CHECK ("media_assets"."access_scope" in ('CONTENT','PRIVATE_USER')),
	CONSTRAINT "media_assets_provider_check" CHECK ("media_assets"."storage_provider" = 'R2'),
	CONSTRAINT "media_assets_status_check" CHECK ("media_assets"."status" in ('UPLOADING','READY','FAILED','ARCHIVED')),
	CONSTRAINT "media_assets_size_check" CHECK ("media_assets"."byte_size" > 0),
	CONSTRAINT "media_assets_owner_scope_check" CHECK (("media_assets"."access_scope" = 'CONTENT' and "media_assets"."owner_user_id" is null) or ("media_assets"."access_scope" = 'PRIVATE_USER' and "media_assets"."owner_user_id" is not null))
);
--> statement-breakpoint
CREATE TABLE "question_group_media" (
	"question_group_id" uuid NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"role" text NOT NULL,
	"position" smallint DEFAULT 1 NOT NULL,
	"alt_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_group_media_question_group_id_media_asset_id_pk" PRIMARY KEY("question_group_id","media_asset_id"),
	CONSTRAINT "question_group_media_role_position_unique" UNIQUE("question_group_id","role","position"),
	CONSTRAINT "question_group_media_role_check" CHECK ("question_group_media"."role" in ('AUDIO','IMAGE')),
	CONSTRAINT "question_group_media_position_check" CHECK ("question_group_media"."position" > 0)
);
--> statement-breakpoint
CREATE TABLE "stimulus_media" (
	"stimulus_id" uuid NOT NULL,
	"media_asset_id" uuid NOT NULL,
	"role" text NOT NULL,
	"position" smallint DEFAULT 1 NOT NULL,
	"alt_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "stimulus_media_stimulus_id_media_asset_id_pk" PRIMARY KEY("stimulus_id","media_asset_id"),
	CONSTRAINT "stimulus_media_role_position_unique" UNIQUE("stimulus_id","role","position"),
	CONSTRAINT "stimulus_media_role_check" CHECK ("stimulus_media"."role" in ('AUDIO','IMAGE'))
);
--> statement-breakpoint
ALTER TABLE "listening_transcripts" ADD CONSTRAINT "listening_transcripts_question_group_id_passage_sets_id_fk" FOREIGN KEY ("question_group_id") REFERENCES "public"."passage_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_transcripts" ADD CONSTRAINT "listening_transcripts_stimulus_id_passages_id_fk" FOREIGN KEY ("stimulus_id") REFERENCES "public"."passages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listening_transcripts" ADD CONSTRAINT "listening_transcripts_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_group_media" ADD CONSTRAINT "question_group_media_question_group_id_passage_sets_id_fk" FOREIGN KEY ("question_group_id") REFERENCES "public"."passage_sets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question_group_media" ADD CONSTRAINT "question_group_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stimulus_media" ADD CONSTRAINT "stimulus_media_stimulus_id_passages_id_fk" FOREIGN KEY ("stimulus_id") REFERENCES "public"."passages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stimulus_media" ADD CONSTRAINT "stimulus_media_media_asset_id_media_assets_id_fk" FOREIGN KEY ("media_asset_id") REFERENCES "public"."media_assets"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "media_assets_storage_key_uidx" ON "media_assets" USING btree ("storage_key");--> statement-breakpoint
CREATE INDEX "media_assets_checksum_idx" ON "media_assets" USING btree ("checksum");--> statement-breakpoint
CREATE INDEX "media_assets_owner_idx" ON "media_assets" USING btree ("owner_user_id");