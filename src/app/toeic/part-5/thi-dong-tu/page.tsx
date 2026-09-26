import { ManagedPage, managedMetadata } from "@/components/seo/managed-page";

export const dynamic = "force-dynamic";
export function generateMetadata() { return managedMetadata("seo-tenses"); }
export default function Page() { return <ManagedPage slug="seo-tenses" />; }
