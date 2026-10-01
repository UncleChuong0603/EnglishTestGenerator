import type { z } from "zod";
import { apiErrorCodeSchema, type ApiErrorResponse } from "./contracts";

export type ApiErrorCode = z.infer<typeof apiErrorCodeSchema>;

export class ApiV1Error extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiErrorCode,
    message: string,
    readonly details?: Record<string, unknown>,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
  }
}

export function apiErrorBody(error: ApiV1Error, requestId: string): ApiErrorResponse {
  return {
    error: {
      code: error.code,
      message: error.message,
      requestId,
      ...(error.details ? { details: error.details } : {}),
      ...(error.retryAfterSeconds ? { retryAfterSeconds: error.retryAfterSeconds } : {}),
    },
  };
}
