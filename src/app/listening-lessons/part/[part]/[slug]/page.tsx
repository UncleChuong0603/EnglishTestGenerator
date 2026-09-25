import { redirect } from "next/navigation";

// Retired question-format audio is no longer part of the shadowing library.
export default function RetiredPartExercisePage() {
  redirect("/listening-lessons");
}
