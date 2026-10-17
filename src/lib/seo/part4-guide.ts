import { getSiteUrl } from "./site-url";

export const PART4_FORMAT = [
  ["30", "câu hỏi trong Part 4"],
  ["10", "bài nói, mỗi bài đi cùng 3 câu"],
  ["1", "người nói xuyên suốt mỗi bài"],
] as const;

export const PART4_TALK_MAP = [
  {
    type: "Thông báo",
    opening: "Nghe điều gì đang thay đổi hoặc được nhắc lại.",
    evidence: "Giữ lịch cũ, lịch mới, địa điểm và việc người nghe phải làm.",
  },
  {
    type: "Tin nhắn hoặc lời nhắn",
    opening: "Xác định người gọi, người nhận và lý do liên hệ.",
    evidence: "Giữ vấn đề, yêu cầu phản hồi và cách liên hệ lại.",
  },
  {
    type: "Giới thiệu hoặc hướng dẫn",
    opening: "Xác định người nghe đang ở đâu và hoạt động sắp diễn ra.",
    evidence: "Giữ thứ tự bước, vị trí, điều kiện và lưu ý an toàn.",
  },
  {
    type: "Quảng cáo hoặc giới thiệu dịch vụ",
    opening: "Xác định sản phẩm, nhóm khách hàng và lợi ích chính.",
    evidence: "Giữ giá, thời hạn, ưu đãi và hành động đăng ký hoặc mua.",
  },
] as const;

export const PART4_ERROR_ROUTES = [
  {
    symptom: "Tôi nghe được nhiều mốc giờ nhưng chọn nhầm mốc.",
    cause: "Bạn giữ con số nhưng chưa gắn cho nó vai trò như lịch cũ, lịch mới hay hạn chót.",
    repair: "Ghi nhãn old, new, deadline ngay cạnh từng mốc; ưu tiên câu có tín hiệu change, instead, now hoặc by.",
  },
  {
    symptom: "Tôi hiểu từng câu nhưng không biết mục đích toàn bài.",
    cause: "Bạn đang gom chi tiết mà chưa xác định loại bài nói và lý do người nói phát thông báo.",
    repair: "Sau hai câu đầu, tự hoàn thành mẫu: Người nói đang ___ để người nghe ___. Sau đó kiểm tra lại khi bài kết thúc.",
  },
  {
    symptom: "Tôi chọn một chi tiết đúng nhưng không trả lời câu hỏi.",
    cause: "Phương án dùng thông tin có trong audio nhưng đổi vai trò của nó, chẳng hạn biến yêu cầu phụ thành ý chính.",
    repair: "Đọc lại từ hỏi: mainly about, when, where hay what should. Chỉ giữ bằng chứng đúng loại thông tin đó.",
  },
  {
    symptom: "Tôi bỏ lỡ câu cuối vì còn kiểm tra câu trước.",
    cause: "Bạn cố xác nhận đáp án trong khi bài nói vẫn tiếp tục và thường để lọt yêu cầu hoặc bước tiếp theo.",
    repair: "Đánh dấu phương án có bằng chứng tốt nhất rồi chuyển mắt xuống câu kế; chỉ review sau khi audio kết thúc.",
  },
] as const;

export const PART4_REVIEW_PASSES = [
  ["Lượt 1 · Không chữ", "Nghe liền mạch, trả lời ba câu và đánh dấu câu đúng do đoán."],
  ["Lượt 2 · Gắn vai trò", "Nghe lại và ghi loại bài nói, mục đích, mốc thay đổi cùng hành động cần làm."],
  ["Lượt 3 · Mở transcript", "Khoanh câu chứa bằng chứng, tín hiệu chuyển ý và cách audio paraphrase đáp án."],
  ["Lượt 4 · Đóng transcript", "Nghe lại toàn bài; kiểm tra bạn nhận ra đúng vai trò của từng mốc bằng tai."],
] as const;

export function part4StructuredData(base = getSiteUrl()) {
  const url = new URL("/toeic/part-4", base).toString();
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${url}#learning-resource`,
    url,
    name: "Luyện nghe TOEIC Part 4 bằng bài nói, audio và transcript",
    description: "Bản đồ 30 câu TOEIC Part 4, bài nói tự biên soạn có audio, ba câu hỏi, transcript và quy trình sửa lỗi.",
    inLanguage: "vi",
    learningResourceType: "Practice problem",
    educationalLevel: "TOEIC Listening Part 4",
    isAccessibleForFree: true,
    hasPart: [
      {
        "@type": "AudioObject",
        name: "Bài nói mẫu TOEIC Part 4 về thay đổi lịch workshop",
        contentUrl: new URL("/seo/toeic-part-4-sample.mp3", base).toString(),
        encodingFormat: "audio/mpeg",
        inLanguage: "en",
      },
      {
        "@type": "Quiz",
        name: "Ba câu hỏi bài nói mẫu TOEIC Part 4",
        about: "TOEIC Listening Part 4",
        numberOfQuestions: 3,
      },
    ],
  };
}
