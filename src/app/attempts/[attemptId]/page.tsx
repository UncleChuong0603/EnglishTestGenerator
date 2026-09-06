import { notFound, redirect } from "next/navigation";
import { TestRunner } from "@/components/tests/test-runner";
import { createClient } from "@/lib/supabase/server";
import { getOwnedTest } from "@/lib/tests/data";

export default async function AttemptPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = await params; const supabase = await createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect("/sign-in");
  const { data: attempt } = await supabase.from("attempts").select("id, test_id, status").eq("id", attemptId).eq("user_id", user.id).maybeSingle(); if (!attempt) notFound(); if (attempt.status === "submitted") redirect(`/results/${attemptId}`);
  const result = await getOwnedTest(attempt.test_id, user.id); if (!result) notFound();
  return <TestRunner attemptId={attemptId} passage={result.test.passage} questions={result.questions} title={result.test.title}/>;
}
