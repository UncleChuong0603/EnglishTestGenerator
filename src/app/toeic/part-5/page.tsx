import type { Metadata } from "next";
import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";

export const metadata: Metadata = { title: "TOEIC Part 5: cách làm và bài tập ví dụ", description: guides.part5.intro, alternates: { canonical: "/toeic/part-5" } };
export default function Page() { return <GuidePage guide={guides.part5} />; }
