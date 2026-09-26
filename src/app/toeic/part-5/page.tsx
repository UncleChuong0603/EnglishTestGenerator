import { ManagedPage, managedMetadata } from "@/components/seo/managed-page";

export const dynamic = "force-dynamic";
export function generateMetadata() { return managedMetadata("seo-part5"); }
export default function Page() { return <ManagedPage slug="seo-part5" />; }
