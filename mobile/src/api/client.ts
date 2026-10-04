import type { CreatePracticeRequest, CreatePracticeResponse, DashboardResponse, EntitlementsResponse, GetPracticeResponse, LoginResponse, MeResponse, PlanResponse, ProgressResponse, SaveMistakeReasonRequest, SaveMistakeReasonResponse, StartRemediationRequest, StartRemediationResponse, SubmitPracticeResponse } from "./types";

const productionBaseUrl = "https://toeicgym.net/api/v1";
const configuredBaseUrl = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "");
export const apiBaseUrl = configuredBaseUrl ?? (__DEV__ ? "http://10.0.2.2:3000/api/v1" : productionBaseUrl);
if (!__DEV__ && !apiBaseUrl.startsWith("https://")) throw new Error("Production API URL must use HTTPS.");

export type ApiErrorCode = "BAD_REQUEST" | "VALIDATION_FAILED" | "UNAUTHENTICATED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "RATE_LIMITED" | "USAGE_LIMIT_REACHED" | "IDEMPOTENCY_CONFLICT" | "INTERNAL_ERROR" | "NETWORK_ERROR" | "TIMEOUT";
export class MobileApiError extends Error { constructor(readonly code: ApiErrorCode, message: string, readonly status = 0, readonly retryAfterSeconds?: number) { super(message); } }
const messages: Record<ApiErrorCode, string> = { BAD_REQUEST: "Yêu cầu chưa hợp lệ.", VALIDATION_FAILED: "Dữ liệu gửi lên chưa hợp lệ.", UNAUTHENTICATED: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", FORBIDDEN: "Bạn chưa có quyền thực hiện thao tác này.", NOT_FOUND: "Không tìm thấy buổi luyện tập.", CONFLICT: "Dữ liệu đã thay đổi. Vui lòng tải lại.", RATE_LIMITED: "Bạn thao tác quá nhanh. Vui lòng thử lại sau.", USAGE_LIMIT_REACHED: "Bạn đã dùng hết lượt của gói hiện tại.", IDEMPOTENCY_CONFLICT: "Yêu cầu bị trùng nhưng nội dung không khớp.", INTERNAL_ERROR: "Máy chủ đang gặp sự cố. Vui lòng thử lại.", NETWORK_ERROR: "Không thể kết nối mạng. Hãy kiểm tra Internet và thử lại.", TIMEOUT: "Kết nối mất quá nhiều thời gian. Vui lòng thử lại." };
function idempotencyKey() { return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`; }

async function request<T>(path: string, options: { token?: string; method?: "GET" | "POST"; body?: unknown; idempotent?: boolean; retry?: boolean } = {}): Promise<T> {
  const key = options.idempotent ? idempotencyKey() : undefined;
  const execute = async () => {
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(`${apiBaseUrl}${path}`, { method: options.method ?? "GET", headers: { Accept: "application/json", "Content-Type": "application/json", ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}), ...(key ? { "Idempotency-Key": key } : {}) }, body: options.body === undefined ? undefined : JSON.stringify(options.body), signal: controller.signal });
      const payload = await response.json().catch(() => null) as { error?: { code?: ApiErrorCode; retryAfterSeconds?: number } } | null;
      if (!response.ok) { const code = payload?.error?.code ?? "INTERNAL_ERROR"; throw new MobileApiError(code, messages[code], response.status, payload?.error?.retryAfterSeconds); }
      return payload as T;
    } catch (error) {
      if (error instanceof MobileApiError) throw error;
      if (error instanceof Error && error.name === "AbortError") throw new MobileApiError("TIMEOUT", messages.TIMEOUT);
      throw new MobileApiError("NETWORK_ERROR", messages.NETWORK_ERROR);
    } finally { clearTimeout(timeout); }
  };
  try { return await execute(); } catch (error) { if (options.retry && error instanceof MobileApiError && ["NETWORK_ERROR", "TIMEOUT"].includes(error.code)) return execute(); throw error; }
}

export const api = {
  login: (email: string, password: string) => request<LoginResponse>("/auth/login", { method: "POST", body: { email, password } }),
  logout: (token: string) => request<{ data: { revoked: true } }>("/auth/logout", { token, method: "POST", body: {} }), me: (token: string) => request<MeResponse>("/me", { token }), dashboard: (token: string) => request<DashboardResponse>("/dashboard", { token }), plan: (token: string) => request<PlanResponse>("/plan", { token }), entitlements: (token: string) => request<EntitlementsResponse>("/entitlements", { token }), progress: (token: string) => request<ProgressResponse>("/progress", { token }),
  startPractice: (token: string, body: CreatePracticeRequest) => request<CreatePracticeResponse>("/practice", { token, method: "POST", body, idempotent: true, retry: true }), practice: (token: string, id: string) => request<GetPracticeResponse>(`/practice/${id}`, { token }), answer: (token: string, id: string, body: { questionId: string; selectedOptionId: string; responseTimeMs?: number }) => request<{ data: { accepted: true } }>(`/practice/${id}/answer`, { token, method: "POST", body, idempotent: true, retry: true }), submit: (token: string, id: string) => request<SubmitPracticeResponse>(`/practice/${id}/submit`, { token, method: "POST", body: {}, idempotent: true, retry: true }),
  saveMistakeReason: (token: string, id: string, body: SaveMistakeReasonRequest) => request<SaveMistakeReasonResponse>(`/practice/${id}/reason`, { token, method: "POST", body, retry: true }),
  startRemediation: (token: string, id: string, body: StartRemediationRequest) => request<StartRemediationResponse>(`/practice/${id}/remediation`, { token, method: "POST", body, idempotent: true, retry: true }),
};
