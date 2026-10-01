import { vocabularyStudyTopics } from "@/lib/vocabulary/study-list";

// The first ten topics are the editorially reviewed foundational TOEIC set.
// Keep this public collection finite so the page remains a useful reference,
// while the full learner catalog stays behind the signed-in study flow.
export const PUBLIC_TOEIC_VOCABULARY_TOPICS = vocabularyStudyTopics.slice(0, 10);
export const PUBLIC_TOEIC_VOCABULARY_ENTRIES = PUBLIC_TOEIC_VOCABULARY_TOPICS.flatMap((topic) => topic.entries);
