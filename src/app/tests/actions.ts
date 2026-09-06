"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { generateReadingTest } from "@/lib/tests/generator";
import { saveGeneratedTest } from "@/lib/tests/data";
import { generationOptionsSchema } from "@/lib/tests/schema";
import { z } from "zod";

export type ActionResult = { ok: true; id: string } | { ok: false; message: string };

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

export async function generateTest(input: unknown): Promise<ActionResult> {
  const parsed = generationOptionsSchema.safeParse(input);
  if (!parsed.success) return { ok: false, message: "Choose valid test options." };
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Sign in before generating a test." };

  const oneMinuteAgo = new Date(Date.now() - 60_000).toISOString();
  const { count } = await supabase.from("tests").select("id", { count: "exact", head: true }).eq("created_by", user.id).gte("created_at", oneMinuteAgo);
  if (count && count > 0) return { ok: false, message: "Please wait a minute before generating another test." };

  try {
    const generated = await generateReadingTest(parsed.data);
    const id = await saveGeneratedTest(user.id, generated, parsed.data);
    return { ok: true, id };
  } catch (error) {
    console.error("Reading test generation failed", error instanceof Error ? error.message : "unknown error");
    return { ok: false, message: "We could not generate a test right now. Please try again." };
  }
}

export async function startAttempt(testId: string): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(testId).success) return { ok: false, message: "This test is unavailable." };
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Sign in to start a test." };
  const { data: test } = await supabase.from("tests").select("id").eq("id", testId).eq("created_by", user.id).maybeSingle();
  if (!test) return { ok: false, message: "This test is unavailable." };
  const admin = createAdminClient();
  const { data: existing } = await admin.from("attempts").select("id").eq("user_id", user.id).eq("test_id", testId).eq("status", "in_progress").maybeSingle();
  if (existing) return { ok: true, id: existing.id };
  const { data, error } = await admin.from("attempts").insert({ user_id: user.id, test_id: testId }).select("id").single();
  if (error || !data) {
    // A second near-simultaneous click may lose the unique-index race; reuse the winner.
    const { data: racedAttempt } = await admin.from("attempts").select("id").eq("user_id", user.id).eq("test_id", testId).eq("status", "in_progress").maybeSingle();
    if (racedAttempt) return { ok: true, id: racedAttempt.id };
    return { ok: false, message: "We could not start this test. Please try again." };
  }
  return { ok: true, id: data.id };
}

const submittedAnswersSchema = z.array(z.object({ questionId: z.string().uuid(), selectedAnswer: z.enum(["A", "B", "C", "D"]).nullable() })).max(20);

export async function submitAttempt(attemptId: string, answers: unknown): Promise<ActionResult> {
  if (!z.string().uuid().safeParse(attemptId).success) return { ok: false, message: "This attempt is unavailable." };
  const parsed = submittedAnswersSchema.safeParse(answers);
  if (!parsed.success) return { ok: false, message: "Some answers were invalid. Please reload and try again." };
  const { supabase, user } = await getUser();
  if (!user) return { ok: false, message: "Your session expired. Please sign in again." };
  const { data: attempt } = await supabase.from("attempts").select("id, status").eq("id", attemptId).eq("user_id", user.id).maybeSingle();
  if (!attempt) return { ok: false, message: "This attempt is unavailable." };
  if (attempt.status === "submitted") return { ok: true, id: attemptId };
  const admin = createAdminClient();
  const { error } = await admin.rpc("submit_reading_attempt", { p_attempt_id: attemptId, p_user_id: user.id, p_answers: parsed.data });
  if (error) { console.error("Attempt submission failed", error.code); return { ok: false, message: "We could not submit your answers. Please try again." }; }
  return { ok: true, id: attemptId };
}
