import { getSiteUrl } from "./site-url";

export type ListeningHubPart = {
  number: 1 | 2 | 3 | 4;
  questions: number;
  title: string;
  task: string;
  sample: string;
  href: string;
};

export const LISTENING_HUB_PARTS: readonly ListeningHubPart[] = [
  {
    number: 1,
    questions: 6,
    title: "Mô tả tranh",
    task: "Quan sát chủ thể, hành động và trạng thái rồi nghe bốn câu mô tả.",
    sample: "Ảnh gốc + 1 câu audio có giải thích",
    href: "/toeic/part-1",
  },
  {
    number: 2,
    questions: 25,
    title: "Hỏi đáp",
    task: "Giữ ý định của câu hỏi hoặc phát biểu và chọn một phản hồi phù hợp.",
    sample: "4 câu hỏi–đáp có transcript và lời giải",
    href: "/toeic/part-2",
  },
  {
    number: 3,
    questions: 39,
    title: "Hội thoại",
    task: "Theo dõi người nói, vấn đề và hành động tiếp theo trong từng cuộc trao đổi.",
    sample: "Hội thoại + 3 câu có lời giải",
    href: "/toeic/part-3",
  },
  {
    number: 4,
    questions: 30,
    title: "Bài nói ngắn",
    task: "Nghe thông báo hoặc hướng dẫn, tách mục đích, chi tiết và hành động.",
    sample: "Thông báo + 3 câu có transcript",
    href: "/toeic/part-4",
  },
] as const;

export const LISTENING_ERROR_ROUTES = [
  {
    symptom: "Tôi nhìn thấy đúng vật nhưng vẫn chọn sai hành động.",
    diagnosis: "Bạn có thể đang ghép một danh từ có trong ảnh với động từ không xảy ra.",
    action: "Luyện đối chiếu chủ ngữ – động từ – tân ngữ ở Part 1.",
    href: "/toeic/part-1",
    label: "Thử bài mô tả tranh",
  },
  {
    symptom: "Tôi nghe được từ khóa nhưng chọn phản hồi không hợp câu hỏi.",
    diagnosis: "Lỗi thường nằm ở ý định giao tiếp hoặc bẫy lặp từ, không phải thiếu từ vựng.",
    action: "Luyện câu trả lời trực tiếp và gián tiếp ở Part 2.",
    href: "/toeic/part-2",
    label: "Thử 4 câu hỏi–đáp",
  },
  {
    symptom: "Tôi hiểu chủ đề cuộc nói chuyện nhưng nhầm ai sẽ làm gì.",
    diagnosis: "Bạn cần gắn từng hành động với đúng người nói và mốc thời gian.",
    action: "Đọc câu hỏi trước, rồi tìm bằng chứng cho người và hành động ở Part 3.",
    href: "/toeic/part-3",
    label: "Thử hội thoại Part 3",
  },
  {
    symptom: "Tôi mất dấu khi thông báo đổi lịch hoặc nêu nhiều mốc giờ.",
    diagnosis: "Bạn có thể nghe ra từng mốc nhưng chưa phân biệt lịch cũ, lịch mới và hạn chót.",
    action: "Luyện gắn vai trò cho từng mốc thông tin ở Part 4.",
    href: "/toeic/part-4",
    label: "Thử bài nói Part 4",
  },
] as const;

export function listeningHubStructuredData(base = getSiteUrl()) {
  const url = new URL("/toeic/listening", base).toString();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "Luyện nghe TOEIC online theo Part 1–4",
    description: "Bản đồ 100 câu TOEIC Listening, bài nghe mẫu có transcript và lộ trình sửa lỗi theo từng Part.",
    inLanguage: "vi",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: LISTENING_HUB_PARTS.length,
      itemListElement: LISTENING_HUB_PARTS.map((part, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: `TOEIC Listening Part ${part.number}: ${part.title}`,
        url: new URL(part.href, base).toString(),
      })),
    },
  };
}
