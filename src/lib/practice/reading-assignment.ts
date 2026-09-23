/** Part 5 questions are standalone, including older assignments that retained their source set. */
export function validReadingAssignment(part: number, questionSetId: string | null, assignedSetId: string | null) {
  if (part === 5) return assignedSetId === null || (questionSetId !== null && assignedSetId === questionSetId);
  return (part === 6 || part === 7) && assignedSetId !== null && questionSetId === assignedSetId;
}

export function readingAssignmentSetId(part: number, assignedSetId: string | null) {
  return part === 5 ? null : assignedSetId;
}
