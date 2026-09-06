import "server-only";

import { generatedTestSchema, validateGeneratedTest } from "./schema";
import type { Difficulty, Focus } from "./types";
import type { z } from "zod";

type GeneratedTest = z.infer<typeof generatedTestSchema>;

const responseSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "passage", "questions"],
  properties: {
    title: { type: "string" },
    passage: { type: "string" },
    questions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["order", "question", "options", "correctAnswer", "explanation", "skill", "subSkill", "difficulty"],
        properties: {
          order: { type: "integer" }, question: { type: "string" },
          options: { type: "array", items: { type: "object", additionalProperties: false, required: ["key", "text"], properties: { key: { enum: ["A", "B", "C", "D"] }, text: { type: "string" } } } },
          correctAnswer: { enum: ["A", "B", "C", "D"] }, explanation: { type: "string" },
          skill: { enum: ["vocabulary", "main_idea", "detail", "inference", "reference", "purpose_tone"] },
          subSkill: { type: "string" }, difficulty: { enum: ["B1", "B2", "C1"] },
        },
      },
    },
  },
};

export async function generateReadingTest(options: { difficulty: Difficulty; focus: Focus; questionCount: number }): Promise<GeneratedTest> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is not configured");

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4o-mini",
        messages: [
          { role: "system", content: "You create original, accurate VSTEP-style English reading practice. Never copy a known test. Return only the requested structured JSON." },
          { role: "user", content: `Create one ${options.difficulty} reading passage and exactly ${options.questionCount} multiple-choice questions. Focus: ${options.focus}. Use a balanced mix of valid reading skills when focus is mixed. Explanations must justify the correct option from the passage. Question orders must be 1 through ${options.questionCount}.` },
        ],
        max_completion_tokens: options.questionCount === 20 ? 12000 : 7000,
        response_format: { type: "json_schema", json_schema: { name: "vstep_reading_test", strict: true, schema: responseSchema } },
      }),
      cache: "no-store",
    });

    if (!response.ok) throw new Error("AI provider request failed");
    const body = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = body.choices?.[0]?.message?.content;
    if (!content) continue;

    try {
      const parsed: unknown = JSON.parse(content);
      const validated = validateGeneratedTest(parsed, options.questionCount);
      if (validated.success) return validated.data;
    } catch {
      // Retry once when the provider returns malformed JSON.
    }
  }

  throw new Error("AI response did not match the reading test schema");
}
