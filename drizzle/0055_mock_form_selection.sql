ALTER TABLE "full_mock_runs" DROP CONSTRAINT "full_mock_runs_form_number_check";
ALTER TABLE "full_mock_runs" ADD CONSTRAINT "full_mock_runs_form_number_check" CHECK ("form_number" IS NULL OR "form_number" BETWEEN 1 AND 25);
