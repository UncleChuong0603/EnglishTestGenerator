import { redirect } from "next/navigation";

/**
 * Google OAuth creates a Supabase user on first sign-in, so a separate sign-up page is unnecessary.
 */
export default function SignUpPage() {
  redirect("/sign-in");
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return <SignUpForm />;
}
