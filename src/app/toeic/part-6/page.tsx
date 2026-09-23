import type { Metadata } from "next";
import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";

export const metadata: Metadata = { title: "TOEIC Part 6: hoàn thành đoạn văn theo ngữ cảnh", description: guides.part6.intro, alternates: { canonical: "/toeic/part-6" } };
export default function Page() { return <GuidePage guide={guides.part6} />; }
