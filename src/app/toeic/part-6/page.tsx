import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({ title: "TOEIC Part 6: hoàn thành đoạn văn theo ngữ cảnh", description: guides.part6.intro, canonical: "/toeic/part-6" });
export default function Page() { return <GuidePage guide={guides.part6} />; }
