CREATE TABLE "question_import_batches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "batch_key" text NOT NULL,
  "fingerprint" text NOT NULL,
  "filename" text NOT NULL,
  "schema_version" text NOT NULL,
  "name" text NOT NULL,
  "source_type" text NOT NULL,
  "rights_note" text NOT NULL,
  "author" text,
  "generator" text,
  "review_status" text NOT NULL,
  "status" text DEFAULT 'COMMITTED' NOT NULL,
  "item_count" integer NOT NULL,
  "question_count" integer NOT NULL,
  "warning_count" integer DEFAULT 0 NOT NULL,
  "created_by" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  CONSTRAINT "question_import_batches_source_check" CHECK ("source_type" in ('ORIGINAL','AI_ASSISTED_ORIGINAL','LICENSED','OTHER_APPROVED')),
  CONSTRAINT "question_import_batches_review_check" CHECK ("review_status" in ('UNREVIEWED','HUMAN_REVIEWED')),
  CONSTRAINT "question_import_batches_status_check" CHECK ("status" in ('COMMITTED','FAILED'))
);
CREATE TABLE "question_import_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "import_batch_id" uuid NOT NULL,
  "external_item_id" text NOT NULL,
  "content_fingerprint" text NOT NULL,
  "question_group_id" uuid NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);
ALTER TABLE "question_import_batches" ADD CONSTRAINT "question_import_batches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE restrict ON UPDATE no action;
ALTER TABLE "question_import_items" ADD CONSTRAINT "question_import_items_import_batch_id_question_import_batches_id_fk" FOREIGN KEY ("import_batch_id") REFERENCES "public"."question_import_batches"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "question_import_items" ADD CONSTRAINT "question_import_items_question_group_id_passage_sets_id_fk" FOREIGN KEY ("question_group_id") REFERENCES "public"."passage_sets"("id") ON DELETE restrict ON UPDATE no action;
CREATE UNIQUE INDEX "question_import_batches_fingerprint_uidx" ON "question_import_batches" USING btree ("fingerprint");
CREATE UNIQUE INDEX "question_import_batches_batch_key_uidx" ON "question_import_batches" USING btree ("batch_key");
CREATE INDEX "question_import_batches_created_idx" ON "question_import_batches" USING btree ("created_at");
CREATE UNIQUE INDEX "question_import_items_batch_external_unique" ON "question_import_items" USING btree ("import_batch_id","external_item_id");
CREATE UNIQUE INDEX "question_import_items_content_fingerprint_uidx" ON "question_import_items" USING btree ("content_fingerprint");
CREATE INDEX "question_import_items_group_idx" ON "question_import_items" USING btree ("question_group_id");
ALTER TABLE "admin_audit_logs" DROP CONSTRAINT "admin_audit_logs_action_check";
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_action_check" CHECK ("action" in ('ADMIN_ROLE_GRANTED','ADMIN_ROLE_REVOKED','USER_SUSPENDED','USER_REACTIVATED','PREMIUM_GRANTED','PREMIUM_REVOKED','CONTENT_DRAFT_CREATED','CONTENT_DRAFT_UPDATED','CONTENT_CLONED','CONTENT_PUBLISHED','CONTENT_ARCHIVED','CONTENT_DRAFT_DISCARDED','MEDIA_UPLOADED','IMPORT_VALIDATED','IMPORT_COMMITTED','IMPORT_FAILED'));
