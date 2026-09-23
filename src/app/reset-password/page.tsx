import type { Metadata } from "next";
import { ResetForm } from "@/components/auth/recovery-forms";
export const metadata: Metadata = { title: "Đặt lại mật khẩu", robots: { index: false, follow: false } };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { return <ResetForm token={(await searchParams).token ?? ""} />; }
