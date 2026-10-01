CREATE TABLE "question_duplicate_scans" (
	"toeic_part" smallint PRIMARY KEY NOT NULL,
	"content_version" text NOT NULL,
	"scanned_count" integer NOT NULL,
	"detected_count" integer NOT NULL,
	"threshold_percent" smallint NOT NULL,
	"scanned_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "question_duplicate_scans_part_check" CHECK ("question_duplicate_scans"."toeic_part" between 1 and 7),
	CONSTRAINT "question_duplicate_scans_counts_check" CHECK ("question_duplicate_scans"."scanned_count" >= 0 and "question_duplicate_scans"."detected_count" >= 0),
	CONSTRAINT "question_duplicate_scans_threshold_check" CHECK ("question_duplicate_scans"."threshold_percent" between 25 and 95)
);
