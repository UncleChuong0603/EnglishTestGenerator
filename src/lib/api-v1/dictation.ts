import "server-only";
import { ApiV1Error } from "./errors";
import { DictationError } from "@/lib/dictation/service";

export function mapDictationError(error: unknown): never {
  if (error instanceof DictationError) {
    if (error.code === "NOT_FOUND")
      throw new ApiV1Error(
        404,
        "NOT_FOUND",
        "Dictation session or content was not found.",
      );
    if (error.code === "ANSWER_REQUIRED")
      throw new ApiV1Error(400, "VALIDATION_FAILED", "An answer is required.");
    throw new ApiV1Error(
      409,
      "CONFLICT",
      "This dictation content changed. Start a new session.",
    );
  }
  throw error;
}
