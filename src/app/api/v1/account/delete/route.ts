import {
  deleteAccountRequestSchema,
  deleteAccountResponseSchema,
} from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import {
  apiHandler,
  jsonResponse,
  parseJson,
  parseResponse,
  requireApiActor,
} from "@/lib/api-v1/http";
import { AccountDataError, deleteAccount } from "@/lib/account-data/service";
import { enforceRateLimit } from "@/lib/auth/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    const body = await parseJson(request, deleteAccountRequestSchema);
    try {
      await enforceRateLimit("account_delete", actor.user.id);
      const result = await deleteAccount(
        actor.user.id,
        body.confirmationEmail,
      );
      return jsonResponse(
        parseResponse(deleteAccountResponseSchema, {
          data: { deleted: true, deletedAt: result.deletedAt.toISOString() },
        }),
      );
    } catch (error) {
      if (error instanceof Error && error.message === "RATE_LIMITED") {
        throw new ApiV1Error(
          429,
          "RATE_LIMITED",
          "Please retry account deletion later.",
          undefined,
          3600,
        );
      }
      if (error instanceof AccountDataError) {
        if (error.code === "CONFIRMATION_MISMATCH") {
          throw new ApiV1Error(
            400,
            "VALIDATION_FAILED",
            "The confirmation email does not match this account.",
          );
        }
        if (error.code === "NOT_FOUND") {
          throw new ApiV1Error(404, "NOT_FOUND", "The account was not found.");
        }
        throw new ApiV1Error(
          409,
          "CONFLICT",
          "This account needs support assistance before it can be deleted.",
        );
      }
      throw error;
    }
  });
}
