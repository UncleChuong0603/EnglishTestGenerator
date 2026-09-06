import { z } from "zod";

import { answerKeys, difficulties, focuses, skills } from "./types";

export const generationOptionsSchema = z.object({
  difficulty: z.enum(difficulties),
  focus: z.enum(focuses),
  questionCount: z.union([z.literal(10), z.literal(20)]),
});

const optionSchema = z.object({
  key: z.enum(answerKeys),
  text: z.string().trim().min(1).max(300),
});

const generatedQuestionSchema = z
  .object({
    order: z.number().int().positive(),
    question: z.string().trim().min(5).max(500),
    options: z.array(optionSchema).length(4),
    correctAnswer: z.enum(answerKeys),
    explanation: z.string().trim().min(5).max(700),
    skill: z.enum(skills),
    subSkill: z.string().trim().min(2).max(80),
    difficulty: z.enum(difficulties),
  })
  .superRefine((question, context) => {
    const keys = question.options.map((option) => option.key);
    if (new Set(keys).size !== 4 || answerKeys.some((key) => !keys.includes(key))) {
      context.addIssue({ code: "custom", message: "Options must contain A, B, C, and D exactly once." });
    }
  });

export const generatedTestSchema = z.object({
  title: z.string().trim().min(3).max(120),
  passage: z.string().trim().min(300).max(7000),
  questions: z.array(generatedQuestionSchema).min(10).max(20),
});

export function validateGeneratedTest(input: unknown, expectedQuestionCount: number) {
  return generatedTestSchema.superRefine((test, context) => {
    if (test.questions.length !== expectedQuestionCount) {
      context.addIssue({ code: "custom", message: "Question count does not match the request." });
    }
    test.questions.forEach((question, index) => {
      if (question.order !== index + 1) {
        context.addIssue({ code: "custom", path: ["questions", index, "order"], message: "Question order must be sequential." });
      }
    });
  }).safeParse(input);
}
