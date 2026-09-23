/** Part 5 questions are standalone even when the import retained a source set. */
export function validReadingAssignment(part: number, questionSetId: string | null, assignedSetId: string | null) {
  if (part === 5) return assignedSetId === null;
  return (part === 6 || part === 7) && assignedSetId !== null && questionSetId === assignedSetId;
}
