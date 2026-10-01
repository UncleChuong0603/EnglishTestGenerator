import { redirect } from "next/navigation";

export default async function SimilarityRedirect({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const query = await searchParams;
  const target = new URLSearchParams({ type: "DUPLICATE", status: "OPEN" });
  if (query.part) target.set("part", query.part);
  redirect(`/admin/content/reports?${target}`);
}
