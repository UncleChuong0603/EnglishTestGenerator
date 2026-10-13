import { syncDuplicateQuestionReports } from "../src/lib/admin/question-issue-reports";

const parts = [1, 2, 3, 4, 5, 6, 7];
const results = [];
for (const part of parts) {
  const result = await syncDuplicateQuestionReports(part);
  results.push({ part, ...result, scannedAt: result.scannedAt.toISOString() });
}
console.log(JSON.stringify(results, null, 2));

