import { getSiteUrl } from "./site-url";

export const PART2_FORMAT = [
  ["25", "câu hỏi trong Part 2"],
  ["1", "câu hỏi hoặc câu nói ở mỗi lượt"],
  ["3", "phản hồi bằng tiếng Anh để lựa chọn"],
] as const;

export const PART2_INTENT_MAP = [
  {
    cue: "Who / Where / When / Why / How",
    intent: "Tìm loại thông tin được yêu cầu",
    listenFor: "Tên người, nơi chốn, thời điểm, lý do hoặc cách thực hiện — kể cả khi người đáp chỉ cách tìm thông tin thay vì nói thẳng.",
  },
  {
    cue: "Do / Did / Is / Are / Have…?",
    intent: "Xác nhận một sự việc",
    listenFor: "Một xác nhận, đính chính, phương án khác hoặc lời nói cho thấy người đáp chưa biết; đáp án không bắt buộc mở đầu bằng Yes hay No.",
  },
  {
    cue: "Could / Would / Can you…?",
    intent: "Đề nghị hoặc nhờ thực hiện hành động",
    listenFor: "Khả năng nhận việc, thời điểm khác hoặc lý do không thể làm; đừng hiểu câu này chỉ như câu hỏi về năng lực.",
  },
  {
    cue: "Câu trần thuật hoặc câu hỏi đuôi",
    intent: "Tiếp nối cuộc hội thoại",
    listenFor: "Phản ứng hợp lý với thông tin vừa nêu: đồng tình, bổ sung, sửa lại, hỏi tiếp hoặc đề xuất bước kế tiếp.",
  },
] as const;

export const PART2_ERROR_ROUTES = [
  {
    symptom: "Tôi chọn đáp án vì nghe thấy một từ được lặp lại.",
    cause: "Từ giống nhau tạo cảm giác liên quan, nhưng hai câu có thể nói về nghĩa hoặc đối tượng khác nhau.",
    repair: "Tóm tắt ý định của câu đầu bằng vài từ, rồi kiểm tra từng phản hồi có giúp cuộc hội thoại tiến tiếp hay không.",
  },
  {
    symptom: "Câu hỏi Where nên tôi chỉ chờ một địa điểm.",
    cause: "Bạn ghép từ hỏi với một loại từ cố định và bỏ qua phản hồi gián tiếp như chỉ người đang giữ thông tin.",
    repair: "Cho phép đáp án giải quyết nhu cầu của người hỏi, chẳng hạn chỉ người cần hỏi hoặc nói rằng thông tin chưa được quyết định.",
  },
  {
    symptom: "Câu hỏi Yes/No mà đáp án không có Yes hoặc No thì tôi loại.",
    cause: "Bạn nghe theo hình thức ngữ pháp thay vì chức năng giao tiếp của lời đáp.",
    repair: "Đổi câu trả lời thành ý ngầm: xác nhận, phủ định, chưa biết, sửa thông tin hay đưa ra lựa chọn khác.",
  },
  {
    symptom: "Tôi suy luận thêm quá nhiều từ một lời đáp gián tiếp.",
    cause: "Bạn xây tiếp câu chuyện vượt quá điều audio cho biết và tự thêm người, nơi hoặc thời điểm.",
    repair: "Chỉ giữ kết luận tối thiểu cần để phản hồi câu hỏi; ghi rõ cụm âm thanh làm bằng chứng cho kết luận đó.",
  },
] as const;

export const PART2_REVIEW_PASSES = [
  ["Lượt 1 · Nghe không transcript", "Nghe câu đầu, gọi tên ý định giao tiếp rồi chọn phản hồi phù hợp nhất."],
  ["Lượt 2 · Nói quan hệ hỏi–đáp", "Diễn đạt bằng tiếng Việt vì sao đáp án giải quyết nhu cầu của người nói, kể cả khi câu trả lời gián tiếp."],
  ["Lượt 3 · Mở transcript", "Khoanh tín hiệu đầu câu, cụm mang ý chính và từ khiến bạn chọn nhầm; phân loại lỗi là âm, từ hay chức năng."],
  ["Lượt 4 · Đóng transcript", "Nghe lại, nhắc lại phản hồi đúng và tự tạo thêm một phản hồi khác có cùng chức năng."],
] as const;

const PART2_AUDIO = [
  ["Câu 1: trả lời trực tiếp về thời gian", "/seo/toeic-part-2-sample.mp3"],
  ["Câu 2: thông tin chưa được quyết định", "/seo/toeic-part-2-undecided.mp3"],
  ["Câu 3: chuyển sang người có thông tin", "/seo/toeic-part-2-ask-colleague.mp3"],
  ["Câu 4: từ chối yêu cầu bằng lý do", "/seo/toeic-part-2-unavailable.mp3"],
] as const;

export function part2StructuredData(base = getSiteUrl()) {
  const url = new URL("/toeic/part-2", base).toString();
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${url}#learning-resource`,
    url,
    name: "Luyện nghe TOEIC Part 2 với 4 câu hỏi–đáp có audio",
    description: "Hướng dẫn cấu trúc 25 câu TOEIC Part 2, bốn bài nghe tự biên soạn, transcript, lời giải và quy trình phân tích phản hồi trực tiếp lẫn gián tiếp.",
    inLanguage: "vi",
    learningResourceType: "Practice problem",
    educationalLevel: "TOEIC Listening Part 2",
    isAccessibleForFree: true,
    hasPart: [
      ...PART2_AUDIO.map(([name, path]) => ({
        "@type": "AudioObject",
        name,
        contentUrl: new URL(path, base).toString(),
        encodingFormat: "audio/mpeg",
        inLanguage: "en",
      })),
      {
        "@type": "Quiz",
        name: "Bốn câu hỏi–đáp mẫu TOEIC Part 2",
        about: "TOEIC Listening Part 2",
        numberOfQuestions: 4,
      },
    ],
  };
}
