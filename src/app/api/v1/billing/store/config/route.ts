import { storeBillingConfigResponseSchema } from "@/lib/api-v1/contracts";
import {
  apiHandler,
  jsonResponse,
  parseResponse,
  requireApiActor,
} from "@/lib/api-v1/http";
import { storeBillingClientConfig } from "@/lib/store-billing/service";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    return jsonResponse(
      parseResponse(storeBillingConfigResponseSchema, {
        data: storeBillingClientConfig(actor.user.id),
      }),
    );
  });
}
