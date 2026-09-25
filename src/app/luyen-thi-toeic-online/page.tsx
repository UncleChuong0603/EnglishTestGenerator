import { GuidePage } from "@/components/seo/guide-page";
import { guides } from "@/lib/seo/guides";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

export const metadata = publicPageMetadata({ title: "Luyện thi TOEIC online miễn phí theo điểm yếu", description: guides.online.intro, canonical: "/luyen-thi-toeic-online" });
export default function Page() { return <GuidePage breadcrumbs={[{ name: "Trang chủ", path: "/" }, { name: "Luyện thi TOEIC online", path: "/luyen-thi-toeic-online" }]} guide={guides.online} />; }
