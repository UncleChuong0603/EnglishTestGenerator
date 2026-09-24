import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({ title: "TOEIC Part 5: cách làm và bài tập ví dụ", description: guides.part5.intro, canonical: "/toeic/part-5" });
export default function Page() { return <GuidePage guide={guides.part5} />; }
