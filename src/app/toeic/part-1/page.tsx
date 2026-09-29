import { ListeningGuidePage } from "@/components/seo/listening-guide-page";
import { listeningGuides } from "@/lib/seo/listening-guides";
import { publicPageMetadata } from "@/lib/seo/public-metadata";

const guide = listeningGuides[1];
export const metadata = publicPageMetadata({ title: guide.title, description: guide.description, canonical: "/toeic/part-1", image: "/seo/toeic-part-1-office-folders.webp" });
export default function Page() { return <ListeningGuidePage guide={guide} />; }
