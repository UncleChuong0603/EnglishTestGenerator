export function isToeicGymAuthor(authorName?: string | null) {
  return !authorName || /^TOEIC\s*GYM(?:\s+Editorial)?$/i.test(authorName);
}
