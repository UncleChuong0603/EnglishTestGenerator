import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({ title: "TOEIC Part 7: chiến lược đọc hiểu có bằng chứng", description: guides.part7.intro, canonical: "/toeic/part-7" });
export default function Page() { return <GuidePage breadcrumbs={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }, { name: "Part 7", path: "/toeic/part-7" }]} guide={guides.part7} />; }
