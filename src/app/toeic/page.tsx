import type { Metadata } from "next";
import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";

export const metadata: Metadata = { title: "TOEIC Listening & Reading: cấu trúc và cách bắt đầu", description: guides.toeic.intro, alternates: { canonical: "/toeic" } };
export default function Page() { return <GuidePage guide={guides.toeic} />; }
