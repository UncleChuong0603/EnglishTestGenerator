import { ListeningGuidePage } from "@/components/seo/listening-guide-page";
import { listeningGuides } from "@/lib/seo/listening-guides";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

const guide = listeningGuides[4];
export const metadata = publicPageMetadata({ title: guide.title, description: guide.description, canonical: "/toeic/part-4" });
export default function Page() { return <ListeningGuidePage guide={guide} />; }
