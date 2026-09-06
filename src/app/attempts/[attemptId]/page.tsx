import { notFound, redirect } from "next/navigation";
import { TestRunner } from "@/components/tests/test-runner";
import { createClient } from "@/lib/supabase/server";
import { getAttemptContent } from "@/lib/tests/data";

export default async function AttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/sign-in");
  const result = await getAttemptContent(attemptId, user.id); if (!result) return notFound(); if (result.attempt.status === "submitted") redirect(`/results/${attemptId}`);
  return <TestRunner attemptId={attemptId} questions={result.questions} title={`${result.attempt.difficulty} adaptive reading practice`}/>;
}
