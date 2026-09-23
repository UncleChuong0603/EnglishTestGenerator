import type { Metadata } from "next";
import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";

export const metadata: Metadata = { title: "TOEIC Part 7: chiến lược đọc hiểu có bằng chứng", description: guides.part7.intro, alternates: { canonical: "/toeic/part-7" } };
export default function Page() { return <GuidePage guide={guides.part7} />; }
