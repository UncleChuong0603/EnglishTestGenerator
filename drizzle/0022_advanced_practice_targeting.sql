ALTER TABLE "practice_sessions" DROP CONSTRAINT "practice_sessions_source_check";
ALTER TABLE "practice_sessions" ADD CONSTRAINT "practice_sessions_source_check" CHECK ("source" in ('recommended','custom','demo_test','guest','diagnostic','mastery_review','target_weakness','prefer_unseen','full_mock','ranked_challenge'));
