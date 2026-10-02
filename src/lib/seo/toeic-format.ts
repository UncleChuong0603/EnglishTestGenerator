export type ToeicFormatRow = {
  section: "Listening" | "Reading";
  part: number;
  task: string;
  questions: number;
};

export const TOEIC_FORMAT_ROWS: readonly ToeicFormatRow[] = [
  { section: "Listening", part: 1, task: "Mô tả tranh (Photographs)", questions: 6 },
  { section: "Listening", part: 2, task: "Hỏi – đáp (Question–Response)", questions: 25 },
  { section: "Listening", part: 3, task: "Hội thoại (Conversations)", questions: 39 },
  { section: "Listening", part: 4, task: "Bài nói ngắn (Talks)", questions: 30 },
  { section: "Reading", part: 5, task: "Hoàn thành câu (Incomplete Sentences)", questions: 30 },
  { section: "Reading", part: 6, task: "Hoàn thành đoạn (Text Completion)", questions: 16 },
  { section: "Reading", part: 7, task: "Đọc hiểu (Reading Comprehension)", questions: 54 },
] as const;

export const TOEIC_SECTION_TIMES = {
  Listening: 45,
  Reading: 75,
} as const;

export function toeicFormatTotals(rows: readonly ToeicFormatRow[] = TOEIC_FORMAT_ROWS) {
  return rows.reduce((totals, row) => {
    totals[row.section] += row.questions;
    totals.all += row.questions;
    return totals;
  }, { Listening: 0, Reading: 0, all: 0 });
}
