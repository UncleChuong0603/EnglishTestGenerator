import { redirect } from "next/navigation";

/** Backward-compatible entry point for existing bookmarks. */
export default function LegacyPart5StartPage() {
  redirect("/practice");
}
