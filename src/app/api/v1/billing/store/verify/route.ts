import {
  verifyStorePurchaseRequestSchema,
  verifyStorePurchaseResponseSchema,
} from "@/lib/api-v1/contracts";
import { ApiV1Error } from "@/lib/api-v1/errors";
import {
  apiHandler,
  jsonResponse,
  parseJson,
  parseResponse,
  requireApiActor,
  requireIdempotencyKey,
} from "@/lib/api-v1/http";
import { StoreVerificationError } from "@/lib/store-billing/types";
import { verifyStorePurchase } from "@/lib/store-billing/service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    requireIdempotencyKey(request);
    const input = await parseJson(request, verifyStorePurchaseRequestSchema);
    try {
      const membership = await verifyStorePurchase(actor.user.id, input);
      return jsonResponse(
        parseResponse(verifyStorePurchaseResponseSchema, {
          data: {
            effectivePlan: membership.status === "ACTIVE" ? "PREMIUM" : "FREE",
            membershipStatus: membership.status,
            premiumExpiresAt: membership.expiresAt?.toISOString() ?? null,
          },
        }),
      );
    } catch (error) {
      if (error instanceof StoreVerificationError) {
        if (error.code === "STORE_NOT_CONFIGURED")
          throw new ApiV1Error(
            503,
            "INTERNAL_ERROR",
            "Store billing is not available yet.",
          );
        if (error.code === "ACCOUNT_MISMATCH")
          throw new ApiV1Error(
            409,
            "CONFLICT",
            "This purchase belongs to another account.",
          );
        throw new ApiV1Error(
          400,
          "VALIDATION_FAILED",
          "The store could not verify this purchase.",
        );
      }
      throw error;
    }
  });
}
