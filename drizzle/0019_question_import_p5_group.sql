ALTER TABLE "questions" DROP CONSTRAINT "questions_group_association_check";
ALTER TABLE "questions" ADD CONSTRAINT "questions_group_association_check" CHECK (
  (toeic_part BETWEEN 1 AND 4 AND passage_set_id IS NOT NULL)
  OR (toeic_part = 5 AND passage_id IS NULL)
  OR (toeic_part = 6 AND passage_set_id IS NOT NULL AND passage_id IS NOT NULL)
  OR (toeic_part = 7 AND passage_set_id IS NOT NULL)
);
