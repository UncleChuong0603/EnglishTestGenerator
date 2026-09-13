import { ActivationForm } from "@/components/auth/recovery-forms";
export default async function ActivateAccountPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) { return <ActivationForm token={(await searchParams).token ?? ""} />; }
