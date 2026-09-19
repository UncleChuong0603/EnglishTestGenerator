ALTER TABLE "passage_sets" DROP CONSTRAINT "passage_sets_part_type_check";
ALTER TABLE "passage_sets" ADD CONSTRAINT "passage_sets_part_type_check" CHECK (
  (skill_area = 'LISTENING' AND ((toeic_part = 1 AND set_type IN ('part1','photographs')) OR (toeic_part = 2 AND set_type IN ('part2','question_response')) OR (toeic_part = 3 AND set_type = 'conversation') OR (toeic_part = 4 AND set_type = 'talk')))
  OR (skill_area = 'READING' AND ((toeic_part = 5 AND set_type = 'standalone') OR (toeic_part = 6 AND set_type = 'part6') OR (toeic_part = 7 AND set_type IN ('single','double','triple'))))
);
