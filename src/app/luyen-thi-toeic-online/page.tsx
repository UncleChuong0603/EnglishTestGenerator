import { ManagedPage, managedMetadata } from "@/components/seo/managed-page";

export const dynamic = "force-dynamic";
export function generateMetadata() { return managedMetadata("seo-online"); }
export default function Page() { return <ManagedPage slug="seo-online" />; }
