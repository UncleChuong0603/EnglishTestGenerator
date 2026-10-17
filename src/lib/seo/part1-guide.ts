import { getSiteUrl } from "./site-url";

export const PART1_FORMAT = [
  ["6", "câu hỏi trong Part 1"],
  ["1", "bức ảnh dùng cho mỗi câu"],
  ["4", "câu mô tả bằng tiếng Anh để lựa chọn"],
] as const;

export const PART1_SCAN_LAYERS = [
  {
    label: "Chủ thể",
    question: "Người hay vật nào là trọng tâm? Có bao nhiêu và họ đang ở vị trí nào?",
    note: "Giữ danh từ chắc chắn nhìn thấy; đừng tự thêm nghề nghiệp hoặc quan hệ giữa những người trong ảnh.",
  },
  {
    label: "Hành động",
    question: "Ai đang làm gì với vật nào ngay trong khoảnh khắc này?",
    note: "Tạo cụm chủ thể–động từ–tân ngữ, chẳng hạn woman–arranging–folders.",
  },
  {
    label: "Trạng thái",
    question: "Vật đang mở, đóng, xếp chồng, trống hay đã được bố trí ra sao?",
    note: "Phân biệt trạng thái nhìn thấy với hành động đang diễn ra, như is closed và is being closed.",
  },
  {
    label: "Vị trí",
    question: "Vật nào ở cạnh, phía sau, trên, dưới hoặc dọc theo vật khác?",
    note: "Kiểm tra cả hai vật mốc trước khi giữ một giới từ hoặc quan hệ không gian.",
  },
] as const;

export const PART1_ERROR_ROUTES = [
  {
    symptom: "Tôi nghe đúng tên đồ vật nên chọn ngay.",
    cause: "Đáp án nhắc vật có trong ảnh nhưng gắn cho nó một hành động hoặc vị trí không đúng.",
    repair: "Kiểm tra đủ ba phần: chủ thể, động từ và vật/vị trí liên quan; một phần mâu thuẫn rõ là đủ để loại.",
  },
  {
    symptom: "Tôi nhầm trạng thái với hành động đang diễn ra.",
    cause: "Bạn xem are arranged và are being arranged như nhau dù câu thứ hai cần dấu hiệu của quá trình đang xảy ra.",
    repair: "Hỏi xem ảnh có cho thấy người đang thực hiện hành động hay chỉ cho thấy kết quả/trạng thái hiện tại.",
  },
  {
    symptom: "Tôi tự thêm người hoặc mục đích không có trong ảnh.",
    cause: "Bối cảnh quen thuộc khiến bạn suy ra câu chuyện trước hoặc sau khoảnh khắc được chụp.",
    repair: "Chỉ giữ điều có thể chỉ trực tiếp trên ảnh; đổi 'chắc là' thành một mô tả nhìn thấy được.",
  },
  {
    symptom: "Tôi nghe sai giới từ hoặc chiều của hành động.",
    cause: "Các từ ngắn dễ bị bỏ lỡ, còn động từ như take off và put on có thể dùng cùng danh từ nhưng đảo hướng.",
    repair: "Nghe lại cả cụm động từ–giới từ, rồi dùng hai vật trong ảnh để kiểm chứng quan hệ thay vì dịch từ rời.",
  },
] as const;

export const PART1_REVIEW_PASSES = [
  ["Lượt 1 · Nhìn rồi nghe", "Quét ảnh theo bốn lớp, nghe một lượt và chọn câu mô tả phù hợp nhất."],
  ["Lượt 2 · Chỉ bằng chứng", "Với từng câu, chỉ đúng chi tiết trong ảnh xác nhận hoặc bác bỏ chủ thể, hành động và vị trí."],
  ["Lượt 3 · Mở transcript", "Khoanh từ hoặc cụm đã nghe nhầm; ghi lỗi là âm, động từ, trạng thái, vị trí hay suy diễn."],
  ["Lượt 4 · Đóng transcript", "Nghe lại và tự nói một câu mô tả đúng khác nhưng vẫn chỉ dùng bằng chứng trong ảnh."],
] as const;

export function part1StructuredData(base = getSiteUrl()) {
  const url = new URL("/toeic/part-1", base).toString();
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    "@id": `${url}#learning-resource`,
    url,
    name: "Luyện nghe TOEIC Part 1 bằng ảnh, audio và lời giải",
    description: "Bản đồ 6 câu TOEIC Part 1, ảnh và audio tự biên soạn, câu hỏi tương tác, transcript cùng quy trình sửa lỗi.",
    inLanguage: "vi",
    learningResourceType: "Practice problem",
    educationalLevel: "TOEIC Listening Part 1",
    isAccessibleForFree: true,
    hasPart: [
      {
        "@type": "ImageObject",
        name: "Ảnh bài luyện TOEIC Part 1 về nhân viên sắp xếp tài liệu",
        contentUrl: new URL("/seo/toeic-part-1-office-folders.webp", base).toString(),
        encodingFormat: "image/webp",
      },
      {
        "@type": "AudioObject",
        name: "Bốn câu mô tả cho ảnh mẫu TOEIC Part 1",
        contentUrl: new URL("/seo/toeic-part-1-sample.mp3", base).toString(),
        encodingFormat: "audio/mpeg",
        inLanguage: "en",
      },
      {
        "@type": "Quiz",
        name: "Câu hỏi mô tả ảnh mẫu TOEIC Part 1",
        about: "TOEIC Listening Part 1",
        numberOfQuestions: 1,
      },
    ],
  };
}
