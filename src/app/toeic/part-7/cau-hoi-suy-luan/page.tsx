import { ReadingLongTailPage } from "@/components/seo/reading-long-tail-page";
import { publicPageMetadata } from "@/lib/seo/public-metadata";
import { readingLongTailGuides } from "@/lib/seo/reading-long-tail";

const guide = readingLongTailGuides.inference;

export const metadata = publicPageMetadata({
  title: guide.title,
  description: guide.description,
  canonical: guide.path,
});

export default function Page() {
  return <ReadingLongTailPage guide={guide} />;
}
