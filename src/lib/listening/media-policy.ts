export function isAuthorizedListeningMedia(candidate: { sessionUserId: string; requesterUserId: string; attachedQuestionId: string; requestedQuestionId: string; attachedAssetId: string; requestedAssetId: string; skillArea: string; status: string; accessScope: string }) {
  return candidate.sessionUserId === candidate.requesterUserId && candidate.attachedQuestionId === candidate.requestedQuestionId && candidate.attachedAssetId === candidate.requestedAssetId && candidate.skillArea === "LISTENING" && candidate.status === "READY" && candidate.accessScope === "CONTENT";
}
