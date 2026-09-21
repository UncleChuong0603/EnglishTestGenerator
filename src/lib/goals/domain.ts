import { z } from "zod";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { PRODUCT_TIME_ZONE } from "@/lib/entitlements/catalog";

export const TARGET_SCORE_PRESETS = [450, 550, 650, 750, 850] as const;
export const DAILY_STUDY_MINUTES = [10, 20, 30, 45, 60] as const;
export const STUDY_DAYS_PER_WEEK = [3, 5, 7] as const;
export const GOAL_TIME_ZONE = PRODUCT_TIME_ZONE;

const optionalInteger = (schema: z.ZodType<number>) =>
  z.preprocess((value) => value === "" || value === null || value === undefined ? null : Number(value), schema.nullable());

export const goalProfileSchema = z.object({
  targetScore: optionalInteger(z.number().int().min(10).max(990).refine(value => value % 5 === 0, "score_step")),
  examDate: z.preprocess(value => value === "" || value === undefined ? null : value, z.string().date().nullable()),
  dailyStudyMinutes: optionalInteger(z.number().int().refine(value => DAILY_STUDY_MINUTES.includes(value as never), "study_minutes")),
  studyDaysPerWeek: optionalInteger(z.number().int().refine(value => STUDY_DAYS_PER_WEEK.includes(value as never), "study_days")),
}).strict();

export type GoalProfileInput = z.infer<typeof goalProfileSchema>;
export type GoalProfile = GoalProfileInput & { updatedAt: string };

export function dateInTimeZone(date = new Date(), timeZone = GOAL_TIME_ZONE) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(date);
  const read = (type: Intl.DateTimeFormatPartTypes) => parts.find(part => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}`;
}

export function parseGoalProfile(input: unknown, today = dateInTimeZone()) {
  const parsed = goalProfileSchema.safeParse(input);
  if (!parsed.success) return parsed;
  if (parsed.data.examDate && parsed.data.examDate < today) {
    return { success: false as const, error: new z.ZodError([{ code: "custom", path: ["examDate"], message: "past_date" }]) };
  }
  return parsed;
}

export function formatExamDate(value: string, locale: InterfaceLanguage) {
  const [year, month, day] = value.split("-").map(Number);
  return new Intl.DateTimeFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    timeZone: "UTC", year: "numeric", month: locale === "vi" ? "2-digit" : "short", day: "2-digit",
  }).format(new Date(Date.UTC(year, month - 1, day)));
}

export function daysUntilExam(value: string, today = dateInTimeZone()) {
  const toDayNumber = (date: string) => Math.floor(Date.parse(`${date}T00:00:00Z`) / 86_400_000);
  return toDayNumber(value) - toDayNumber(today);
}
