import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({ title: "TOEIC Listening & Reading: cấu trúc và cách bắt đầu", description: guides.toeic.intro, canonical: "/toeic" });
export default function Page() { return <GuidePage breadcrumbs={[{ name: "Trang chủ", path: "/" }, { name: "TOEIC", path: "/toeic" }]} guide={guides.toeic} />; }
