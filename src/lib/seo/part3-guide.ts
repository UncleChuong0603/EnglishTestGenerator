import { getSiteUrl } from "./site-url";

export const PART3_FORMAT = [
  ["39", "câu hỏi trong Part 3"],
  ["13", "hội thoại, mỗi hội thoại 3 câu"],
  ["2–3", "người nói có thể xuất hiện trong hội thoại"],
] as const;

export const PART3_ERROR_ROUTES = [
  {
    symptom: "Tôi hiểu chủ đề nhưng nhầm ai sẽ làm việc gì.",
    cause: "Bạn đang giữ nội dung nhưng chưa gắn hành động với đúng người nói.",
    repair: "Ghi nhanh vai trò A/B/C và động từ hành động khi nghe lời đề nghị, quyết định hoặc lời hứa.",
  },
  {
    symptom: "Tôi chọn phương án có từ giống audio.",
    cause: "Bạn đang đối chiếu từ đơn thay vì quan hệ ý; đáp án đúng thường paraphrase bằng cách diễn đạt khác.",
    repair: "Nói lại ý bằng từ của mình trước khi chọn, rồi kiểm tra người, thời điểm và kết quả có khớp không.",
  },
  {
    symptom: "Tôi bỏ lỡ thay đổi lịch, địa điểm hoặc kế hoạch.",
    cause: "Thông tin đầu tiên vẫn còn trong trí nhớ dù người nói đã sửa hoặc thay thế nó.",
    repair: "Đánh dấu old/new và chú ý but, actually, instead, now, no longer hoặc câu đề xuất mới.",
  },
  {
    symptom: "Tôi còn nghĩ câu trước nên mất luôn câu sau.",
    cause: "Bạn dành thời gian xác minh một đáp án trong khi audio tiếp tục chạy.",
    repair: "Chọn phương án có bằng chứng tốt nhất, đánh dấu câu chưa chắc rồi chuyển mắt sang câu kế tiếp.",
  },
] as const;

export const PART3_REVIEW_PASSES = [
  ["Lượt 1 · Không transcript", "Nghe liền mạch, trả lời ba câu và đánh dấu câu đúng do đoán."],
  ["Lượt 2 · Tìm đúng câu", "Nghe lại, dừng ở đoạn chứa bằng chứng và nói ai làm gì, khi nào hoặc vì sao."],
  ["Lượt 3 · Đối chiếu chữ", "Mở transcript để xác nhận cụm bị bỏ lỡ, paraphrase hoặc chỗ đổi người nói."],
  ["Lượt 4 · Đóng transcript", "Nghe lại toàn hội thoại và kiểm tra bạn có nhận ra bằng chứng bằng tai hay chưa."],
] as const;

export function part3StructuredData(base = getSiteUrl()) {
  const url = new URL("/toeic/part-3", base).toString();
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${url}#learning-resource`,
    url,
    name: "Luyện nghe TOEIC Part 3 bằng hội thoại, audio và transcript",
    description: "Bản đồ 39 câu TOEIC Part 3, một hội thoại tự biên soạn có audio, ba câu hỏi, transcript và quy trình sửa lỗi.",
    inLanguage: "vi",
    learningResourceType: "Practice problem",
    educationalLevel: "TOEIC Listening Part 3",
    isAccessibleForFree: true,
    hasPart: [
      {
        "@type": "AudioObject",
        name: "Hội thoại mẫu TOEIC Part 3 về thiệp mời sự kiện",
        contentUrl: new URL("/seo/toeic-part-3-sample.mp3", base).toString(),
        encodingFormat: "audio/mpeg",
        inLanguage: "en",
      },
      {
        "@type": "Quiz",
        name: "Ba câu hỏi hội thoại mẫu TOEIC Part 3",
        about: "TOEIC Listening Part 3",
        numberOfQuestions: 3,
      },
    ],
  };
}
