import type { EditorialPost } from "@/lib/blog/editorial";
import { guides } from "./guides";
import { contentPath } from "./routes";

const revisedAt = new Date("2026-09-26T18:00:00.000Z");
const listeningReleaseAt = new Date("2026-09-29T17:00:00.000Z");
const readingReleaseAt = new Date("2026-10-01T09:00:00.000Z");

function document(slug: string, title: string, excerpt: string, content: string, intent = "LEARN"): EditorialPost {
  const updatedAt = slug === "seo-part5" || slug === "seo-toeic" ? new Date("2026-10-02T00:00:00.000Z") : slug === "seo-online" ? listeningReleaseAt
    : slug === "seo-part7" ? new Date("2026-10-02T00:00:00.000Z") : slug === "seo-part6" ? readingReleaseAt : revisedAt;
  const category = slug === "seo-toeic" || slug === "seo-online" ? "TOEIC_STRATEGY"
    : slug === "seo-part6" || slug === "seo-part7" ? "READING" : "GRAMMAR";
  return { id: slug, slug, title, excerpt, content, status: "PUBLISHED", category,
    seoTitle: title, seoDescription: excerpt, canonicalPath: contentPath(slug), coverMediaId: null,
    coverAlt: "", editorialCover: "/brand/toeic-gym-social.png", socialTitle: title, socialDescription: excerpt,
    contentOrigin: "AI_ASSISTED", authorName: "TOEICGym", targetTopic: title, searchIntent: intent, noindex: false,
    createdAt: revisedAt, updatedAt, publishedAt: revisedAt, createdBy: "editorial", updatedBy: "editorial", tags: [],
  };
}

export const MANAGED_SEO_DOCUMENTS: EditorialPost[] = Object.entries(guides).map(([key, guide]) => document(
  `seo-${key}`, guide.title, guide.intro,
  [
    ...guide.sections.map(section => `## ${section.title}\n\n${section.paragraphs.join("\n\n")}\n\n${"points" in section ? section.points?.map(point => `- ${point}`).join("\n") : ""}`),
    ...("example" in guide ? [`## ${guide.example.title}\n\n${guide.example.question}\n\n${guide.example.options.join("\n\n")}\n\n${guide.example.answer}\n\nVí dụ do TOEICGym tự biên soạn.`] : []),
    `## Học tiếp theo chủ đề\n\n${guide.links.map(link => `- [${link.label}](${link.href}): ${link.description}`).join("\n")}`,
    `## Bước tiếp theo\n\n${guide.cta.description}\n\n[${guide.cta.label}](${guide.cta.href})`,
  ].join("\n\n"),
));

MANAGED_SEO_DOCUMENTS.push(
  document("seo-word-form", "Word Form TOEIC Part 5: bài tập loại từ có lời giải",
    "Chọn danh từ, động từ, tính từ hay trạng từ từ vị trí trong câu. Thử ba câu Word Form tự biên soạn, xem lời giải và cách loại từng đáp án.",
    `## Nhìn nhiệm vụ của chỗ trống

Trước danh từ, một tính từ có thể mô tả danh từ đó: a practical solution. Nếu chỗ trống mô tả cách thực hiện hành động, thử trạng từ: explain clearly. Nếu câu thiếu người, vật hoặc sự việc, kiểm tra xem có cần danh từ: written permission.

Đuôi từ chỉ là gợi ý. Friendly là tính từ dù tận cùng bằng -ly. Sau the vẫn có thể là tính từ rồi mới đến danh từ, như the revised schedule. Luôn đọc lại cả câu sau khi chọn.

## Sửa lỗi sau khi làm bài

Ghi ba mục: từ bạn đã chọn, nhiệm vụ thật của chỗ trống và cấu trúc đúng. Ví dụ: clear → cần từ bổ nghĩa cho explained → explained clearly. Lần sau thử một câu khác cùng cấu trúc để xem bạn hiểu quy tắc hay chỉ nhớ đáp án.

[Đọc hướng dẫn loại từ](/blog/loai-tu-trong-toeic-part-5), [luyện Part 5 hỗn hợp](/toeic/part-5/practice) hoặc quay lại [hub Part 5](/toeic/part-5).`, "PRACTICE"),
  document("seo-tenses", "Bài tập thì động từ TOEIC Part 5 có đáp án",
    "Luyện ba câu thì động từ TOEIC Part 5 miễn phí: xác định mốc thời gian, thứ tự sự kiện và hành động đang diễn ra. Có giải thích từng lựa chọn.",
    `## Ba câu hỏi khi chọn dạng động từ

1. Hành động diễn ra lúc nào? Yesterday chỉ một mốc quá khứ đã kết thúc; right now thường chỉ việc đang diễn ra lúc nói.
2. Việc nào xảy ra trước? Khi có hai mốc quá khứ, quá khứ hoàn thành diễn tả hành động đã xong trước hành động còn lại.
3. Chủ ngữ thực hiện hay nhận hành động? A schedule will be sent là bị động; an assistant will send the schedule là chủ động.

## Tránh chọn thì bằng một từ khóa

Một câu có tomorrow vẫn có thể kiểm tra chủ động và bị động. Một câu có since cần được đọc đủ để biết từ này chỉ thời gian hay nguyên nhân. Hãy tìm cả cấu trúc lẫn ý nghĩa trước khi quyết định.

## Luyện tiếp

Với mỗi câu sai, ghi mốc thời gian đã bỏ qua và giải thích tại sao ba lựa chọn còn lại sai. [Đọc hướng dẫn thì và dạng động từ](/blog/thi-va-dang-dong-tu-toeic), sau đó thử [bài Part 5 hỗn hợp](/toeic/part-5/practice) hoặc [10 câu Challenge](/challenge/part-5).`, "PRACTICE"),
  document("seo-part5-practice", "Bài tập TOEIC Part 5 miễn phí: 7 câu hỗn hợp có lời giải",
    "Làm ngay bảy câu Part 5 về loại từ, thì, hòa hợp, giới từ, liên từ, mệnh đề quan hệ và từ vựng. Không cần tài khoản; có giải thích từng đáp án.",
    `## Chọn bài ôn theo lỗi vừa mắc

- Sai loại từ: [xác định vị trí và nhiệm vụ của từ](/blog/loai-tu-trong-toeic-part-5).
- Sai thì: [tìm mốc thời gian và thứ tự sự kiện](/blog/thi-va-dang-dong-tu-toeic).
- Sai hòa hợp: [tìm chủ ngữ chính](/blog/hoa-hop-chu-ngu-dong-tu-toeic).
- Sai giới từ: [học cả cụm công việc](/blog/gioi-tu-toeic-trong-cong-viec).
- Sai liên từ: [phân biệt mệnh đề với cụm danh từ](/blog/lien-tu-va-tu-noi-toeic).
- Sai mệnh đề quan hệ: [xem phần còn thiếu sau chỗ trống](/blog/menh-de-quan-he-toeic).
- Sai từ vựng: [học từ trong tình huống công sở](/blog/tu-vung-toeic-theo-chu-de-cong-so).

## Làm gì sau khi xem đáp án?

Chọn một câu sai hoặc đúng do đoán. Che lời giải và nói lại tín hiệu quyết định bằng một câu ngắn. Sau một vài ngày, làm câu mới cùng dạng; đừng dùng việc thuộc đáp án của bảy câu này để kết luận bạn đã vững cả Part 5.

Tiếp tục với [10 câu Part 5 Challenge](/challenge/part-5). Nếu cần phương pháp làm trước, xem [hub Part 5](/toeic/part-5) và [cách review lỗi sai](/blog/cach-review-loi-sai-toeic).`, "PRACTICE"),
);

export function getManagedSeoDocument(slug: string) {
  return MANAGED_SEO_DOCUMENTS.find(post => post.slug === slug) ?? null;
}
