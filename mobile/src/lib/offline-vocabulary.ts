import AsyncStorage from "@react-native-async-storage/async-storage";
import type { VocabularyResponse } from "@/api/types";

const CARDS_KEY = "toeicgym.offline.vocabulary.cards.v1";
const QUEUE_KEY = "toeicgym.offline.vocabulary.queue.v1";
export type QueuedVocabularyReview = { id: string; remembered: boolean; idempotencyKey: string; queuedAt: string };

export function createQueuedVocabularyReview(id: string, remembered: boolean, now = new Date()): QueuedVocabularyReview {
  return { id, remembered, idempotencyKey: `${now.getTime()}-${id}`, queuedAt: now.toISOString() };
}

export async function cacheVocabularyCards(cards: VocabularyResponse["data"]) {
  await AsyncStorage.setItem(CARDS_KEY, JSON.stringify(cards));
}

export async function readCachedVocabularyCards(): Promise<VocabularyResponse["data"]> {
  try { return JSON.parse(await AsyncStorage.getItem(CARDS_KEY) ?? "[]") as VocabularyResponse["data"]; } catch { return []; }
}

export async function readVocabularyQueue(): Promise<QueuedVocabularyReview[]> {
  try { return JSON.parse(await AsyncStorage.getItem(QUEUE_KEY) ?? "[]") as QueuedVocabularyReview[]; } catch { return []; }
}

export async function queueVocabularyReview(review: QueuedVocabularyReview) {
  const queue = await readVocabularyQueue();
  if (!queue.some((item) => item.id === review.id)) queue.push(review);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function writeVocabularyQueue(queue: QueuedVocabularyReview[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function clearOfflineVocabulary() {
  await AsyncStorage.multiRemove([CARDS_KEY, QUEUE_KEY]);
}
