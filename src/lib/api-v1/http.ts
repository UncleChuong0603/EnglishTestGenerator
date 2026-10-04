import "server-only";

import { randomUUID } from "node:crypto";
import { ZodError, type ZodType } from "zod";
import { getSessionByToken, SESSION_COOKIE } from "@/lib/auth/session-core";
import { ApiV1Error, apiErrorBody } from "./errors";

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  Pragma: "no-cache",
  "X-Content-Type-Options": "nosniff",
} as const;

export type ApiActor = NonNullable<
  Awaited<ReturnType<typeof getSessionByToken>>
>;

export function jsonResponse(
  body: unknown,
  status = 200,
  extraHeaders?: HeadersInit,
) {
  return Response.json(body, {
    status,
    headers: { ...PRIVATE_HEADERS, ...extraHeaders },
  });
}

export function parseResponse<T>(schema: ZodType<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) throw new Error("API_RESPONSE_CONTRACT_VIOLATION");
  return result.data;
}

export async function parseJson<T>(
  request: Request,
  schema: ZodType<T>,
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiV1Error(
      400,
      "BAD_REQUEST",
      "Request body must be valid JSON.",
    );
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiV1Error(
      400,
      "VALIDATION_FAILED",
      "The request is not valid.",
      {
        fields: parsed.error.issues.map((issue) => ({
          path: issue.path.join("."),
          message: issue.message,
        })),
      },
    );
  }
  return parsed.data;
}

export function clientIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip")?.trim() ??
    "unknown"
  );
}

export async function requireApiActor(request: Request): Promise<ApiActor> {
  const authorization = request.headers.get("authorization");
  const cookie = request.headers.get("cookie") ?? "";
  if (authorization && /(?:^|;\s*)etg_session=/.test(cookie)) {
    throw new ApiV1Error(
      400,
      "BAD_REQUEST",
      "Use one authentication method per request.",
    );
  }
  const match = authorization?.match(/^Bearer\s+([^\s]+)$/i);
  const cookieToken = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`))
    ?.slice(SESSION_COOKIE.length + 1);
  const session = await getSessionByToken(match?.[1] ?? cookieToken);
  if (!session)
    throw new ApiV1Error(
      401,
      "UNAUTHENTICATED",
      "Your session is invalid or has expired.",
    );
  return session;
}

export function requireIdempotencyKey(request: Request) {
  const value = request.headers.get("idempotency-key")?.trim();
  if (
    !value ||
    value.length < 8 ||
    value.length > 128 ||
    !/^[A-Za-z0-9._:-]+$/.test(value)
  ) {
    throw new ApiV1Error(
      400,
      "VALIDATION_FAILED",
      "A valid Idempotency-Key header is required.",
    );
  }
  return value;
}

export async function apiHandler(
  run: (requestId: string) => Promise<Response>,
) {
  const requestId = randomUUID();
  try {
    return await run(requestId);
  } catch (error) {
    if (error instanceof ApiV1Error) {
      const headers = error.retryAfterSeconds
        ? { "Retry-After": String(error.retryAfterSeconds) }
        : undefined;
      return jsonResponse(
        apiErrorBody(error, requestId),
        error.status,
        headers,
      );
    }
    if (error instanceof ZodError) {
      return jsonResponse(
        apiErrorBody(
          new ApiV1Error(400, "VALIDATION_FAILED", "The request is not valid."),
          requestId,
        ),
        400,
      );
    }
    console.error("[api-v1] request failed", {
      requestId,
      error: error instanceof Error ? error.message : "unknown",
    });
    return jsonResponse(
      apiErrorBody(
        new ApiV1Error(
          500,
          "INTERNAL_ERROR",
          "The request could not be completed.",
        ),
        requestId,
      ),
      500,
    );
  }
}
