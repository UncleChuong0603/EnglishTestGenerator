import { redirect } from "next/navigation";

// Retired short exercises now point to the continuous listening library.
export default function RetiredIndependentLessonPage() {
  redirect("/listening-lessons");
}
