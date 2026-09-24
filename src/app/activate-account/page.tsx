import type { Metadata } from "next";
import { ActivationForm } from "@/components/auth/recovery-forms";

export const metadata: Metadata = { title: "Kích hoạt tài khoản", robots: { index: false, follow: false } };
export default async function ActivateAccountPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { return <ActivationForm token={(await searchParams).token ?? ""} />; }
