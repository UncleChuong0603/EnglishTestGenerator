import type { CreatePracticeRequest, CreatePracticeResponse, DashboardResponse, EntitlementsResponse, GetPracticeResponse, LoginResponse, MeResponse, PlanResponse, ProgressResponse, SubmitPracticeResponse } from "../../../src/lib/api-v1/contracts";
export type { CreatePracticeRequest, CreatePracticeResponse, DashboardResponse, EntitlementsResponse, GetPracticeResponse, LoginResponse, MeResponse, PlanResponse, ProgressResponse, SubmitPracticeResponse };
export type PracticeSession = Extract<GetPracticeResponse["data"], { status: "in_progress" }>;
export type PracticeResult = Extract<GetPracticeResponse["data"], { status: "submitted" }>;
