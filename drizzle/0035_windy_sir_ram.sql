CREATE TABLE "full_mock_form_questions" (
	"form_number" smallint NOT NULL,
	"position" smallint NOT NULL,
	"part" smallint NOT NULL,
	"question_id" uuid NOT NULL,
	CONSTRAINT "full_mock_form_questions_form_number_position_pk" PRIMARY KEY("form_number","position"),
	CONSTRAINT "full_mock_form_questions_question_unique" UNIQUE("question_id"),
	CONSTRAINT "full_mock_form_questions_number_check" CHECK ("full_mock_form_questions"."form_number" between 1 and 25),
	CONSTRAINT "full_mock_form_questions_position_check" CHECK ("full_mock_form_questions"."position" between 1 and 200),
	CONSTRAINT "full_mock_form_questions_part_check" CHECK ("full_mock_form_questions"."part" between 1 and 7)
);
--> statement-breakpoint
ALTER TABLE "full_mock_runs" ADD COLUMN "form_number" smallint;--> statement-breakpoint
ALTER TABLE "full_mock_form_questions" ADD CONSTRAINT "full_mock_form_questions_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "full_mock_runs" ADD CONSTRAINT "full_mock_runs_form_number_check" CHECK ("full_mock_runs"."form_number" is null or ("full_mock_runs"."mode"='FULL' and "full_mock_runs"."form_number" between 1 and 25));