import {
  accountDataExportResponseSchema,
} from "@/lib/api-v1/contracts";
import {
  apiHandler,
  jsonResponse,
  parseResponse,
  requireApiActor,
} from "@/lib/api-v1/http";
import {
  AccountDataError,
  exportLearningData,
} from "@/lib/account-data/service";
import { enforceRateLimit } from "@/lib/auth/rate-limit";
import { ApiV1Error } from "@/lib/api-v1/errors";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return apiHandler(async () => {
    const actor = await requireApiActor(request);
    try {
      await enforceRateLimit("account_export", actor.user.id);
      const data = await exportLearningData(actor.user.id);
      const date = new Date().toISOString().slice(0, 10);
      return jsonResponse(
        parseResponse(accountDataExportResponseSchema, { data }),
        200,
        {
          "Content-Disposition": `attachment; filename="toeicgym-learning-data-${date}.json"`,
        },
      );
    } catch (error) {
      if (error instanceof Error && error.message === "RATE_LIMITED") {
        throw new ApiV1Error(
          429,
          "RATE_LIMITED",
          "Please retry the export later.",
          undefined,
          3600,
        );
      }
      if (error instanceof AccountDataError && error.code === "NOT_FOUND") {
        throw new ApiV1Error(404, "NOT_FOUND", "The account was not found.");
      }
      throw error;
    }
  });
}
