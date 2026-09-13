import { ResetForm } from "@/components/auth/recovery-forms";
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { return <ResetForm token={(await searchParams).token ?? ""} />; }
