import type { Metadata } from "next";
import { ForgotForm } from "@/components/auth/recovery-forms";
export const metadata: Metadata = { title: "Quên mật khẩu", robots: { index: false, follow: false } };
export default function ForgotPasswordPage() { return <ForgotForm />; }
