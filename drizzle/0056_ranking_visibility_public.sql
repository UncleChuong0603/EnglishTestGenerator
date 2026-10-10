ALTER TABLE "profiles" ALTER COLUMN "ranking_visibility" SET DEFAULT 'PUBLIC';
--> statement-breakpoint
UPDATE "profiles"
SET "ranking_visibility" = 'PUBLIC', "updated_at" = now()
WHERE "ranking_visibility" = 'ANONYMOUS';
