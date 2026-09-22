import { z } from "zod";
import type { InterfaceLanguage } from "@/lib/i18n/config";

export const STUDY_PURPOSES = ["GRADUATION_REQUIREMENT", "JOB_CAREER", "UPCOMING_EXAM", "ENGLISH_IMPROVEMENT", "OTHER"] as const;
export const ACQUISITION_SOURCES = ["FACEBOOK_GROUP", "FACEBOOK_PAGE", "THREADS", "LINKEDIN", "GOOGLE", "FRIEND_REFERRAL", "OTHER"] as const;
export type StudyPurpose = (typeof STUDY_PURPOSES)[number];
export type AcquisitionSource = (typeof ACQUISITION_SOURCES)[number];

const optionalChoice = <T extends readonly [string, ...string[]]>(values: T) => z.preprocess(value => value === "" || value == null ? null : value, z.enum(values).nullable());
const otherText = z.preprocess(value => typeof value === "string" ? value.trim() || null : null, z.string().max(120).nullable());
export const learnerContextSchema = z.object({
  studyPurpose: optionalChoice(STUDY_PURPOSES),
  studyPurposeOther: otherText,
  acquisitionSource: optionalChoice(ACQUISITION_SOURCES),
  acquisitionSourceOther: otherText,
}).transform(value => ({
  ...value,
  studyPurposeOther: value.studyPurpose === "OTHER" ? value.studyPurposeOther : null,
  acquisitionSourceOther: value.acquisitionSource === "OTHER" ? value.acquisitionSourceOther : null,
}));

export type LearnerContextInput = z.input<typeof learnerContextSchema>;
export type LearnerContextValues = z.output<typeof learnerContextSchema>;
export type LearnerContext = LearnerContextValues & { promptDismissedAt: string | null; updatedAt: string };

const purposeLabels: Record<StudyPurpose, [string, string]> = {
  GRADUATION_REQUIREMENT: ["Chuẩn đầu ra", "Graduation requirement"], JOB_CAREER: ["Xin việc / phục vụ công việc", "Job / career"],
  UPCOMING_EXAM: ["Chuẩn bị cho kỳ thi TOEIC sắp tới", "Upcoming TOEIC exam"], ENGLISH_IMPROVEMENT: ["Cải thiện tiếng Anh", "Improve English"], OTHER: ["Khác", "Other"],
};
const sourceLabels: Record<AcquisitionSource, [string, string]> = {
  FACEBOOK_GROUP: ["Facebook Group", "Facebook Group"], FACEBOOK_PAGE: ["Facebook Page", "Facebook Page"], THREADS: ["Threads", "Threads"], LINKEDIN: ["LinkedIn", "LinkedIn"], GOOGLE: ["Google", "Google"], FRIEND_REFERRAL: ["Bạn bè / người quen giới thiệu", "Friend / referral"], OTHER: ["Khác", "Other"],
};
export const studyPurposeLabel = (value: StudyPurpose, locale: InterfaceLanguage) => purposeLabels[value][locale === "vi" ? 0 : 1];
export const acquisitionSourceLabel = (value: AcquisitionSource, locale: InterfaceLanguage) => sourceLabels[value][locale === "vi" ? 0 : 1];
