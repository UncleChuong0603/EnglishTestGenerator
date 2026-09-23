import type { Metadata } from "next";
import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";

export const metadata: Metadata = { title: "Luyện thi TOEIC online miễn phí theo điểm yếu", description: guides.online.intro, alternates: { canonical: "/luyen-thi-toeic-online" } };
export default function Page() { return <GuidePage guide={guides.online} />; }
