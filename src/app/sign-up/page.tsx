import { SignUpForm } from "@/components/auth/sign-up-form";

/**
 * Google OAuth creates a Supabase user on first sign-in, so a separate sign-up page is unnecessary.
 */
export default function SignUpPage() {
  return <SignUpForm />;
}
