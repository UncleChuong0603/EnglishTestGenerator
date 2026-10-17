import { getSiteUrl } from "./site-url";

export const ONLINE_STUDY_STARTS = [
  {
    id: "baseline",
    situation: "Chưa biết Part nào đang yếu",
    action: "Làm bài đánh giá đầu vào để có độ chính xác theo Part và gợi ý bài tiếp theo.",
    detail: "Khoảng 25–35 câu Listening và Reading; có thể tiếp tục trong 7 ngày.",
    href: "/diagnostic",
    cta: "Làm đánh giá đầu vào",
  },
  {
    id: "quick",
    situation: "Muốn thử ngay, chưa cần tài khoản",
    action: "Làm một bài Listening hoặc Reading ngắn, rồi xem câu cần ôn lại.",
    detail: "Khoảng 7–10 phút; kết quả là độ chính xác của bài luyện.",
    href: "/try#quick-practice",
    cta: "Chọn bài thử nhanh",
  },
  {
    id: "skill",
    situation: "Đã biết dạng lỗi đang lặp lại",
    action: "Đi thẳng vào đúng Part, học một thao tác và kiểm tra lại bằng câu mới.",
    detail: "Có bài nghe Part 1–4 và bài Reading theo chủ điểm, kèm lời giải.",
    href: "/toeic",
    cta: "Chọn Part cần luyện",
  },
  {
    id: "stamina",
    situation: "Cần kiểm tra tốc độ và sức bền",
    action: "Chọn Listening, Reading hoặc Full Mock theo quỹ thời gian và mục tiêu.",
    detail: "Các mode dài cần tài khoản và chỉ mở khi bộ đề tương ứng sẵn sàng.",
    href: "/thi-thu-toeic-online",
    cta: "So sánh bài thi thử",
  },
] as const;

export const ONLINE_STUDY_LOOP = [
  ["Đo bằng câu chưa biết", "Làm một nhóm câu mới trong một lượt và ghi cả thời gian lẫn câu đúng do đoán."],
  ["Gắn nguyên nhân cho lỗi", "Tách lỗi kiến thức, bỏ sót bằng chứng, nghe không ra cụm từ và thiếu thời gian."],
  ["Luyện một thao tác", "Chỉ chọn một việc như nhận diện loại từ, theo dõi mốc giờ hoặc tìm paraphrase."],
  ["Kiểm tra lại bằng nội dung mới", "Sau 1–3 ngày, làm câu tương đương chưa gặp để xem lỗi có còn lặp lại."],
] as const;

export const ONLINE_STUDY_SIGNALS = [
  ["Độ chính xác trên câu mới", "Số đúng / tổng câu, không tính câu đã thuộc đáp án", "Cho biết kỹ năng có chuyển sang nội dung khác hay chưa"],
  ["Câu đúng do đoán", "Đánh dấu riêng dù hệ thống chấm đúng", "Tránh hiểu nhầm may mắn thành tiến bộ ổn định"],
  ["Thời gian thực tế", "Tổng phút và câu còn bỏ trống", "Phân biệt thiếu kiến thức với thiếu nhịp làm bài"],
  ["Lỗi còn lặp lại", "Một nhãn ngắn và bằng chứng đã bỏ sót", "Biến kết quả thành mục tiêu cụ thể cho buổi sau"],
] as const;

export function onlineStudyHubStructuredData(base = getSiteUrl()) {
  const url = new URL("/luyen-thi-toeic-online", base).toString();
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${url}#webpage`,
    url,
    name: "Luyện thi TOEIC online: lộ trình từ đánh giá đến thi thử",
    description: "Chọn điểm bắt đầu, luyện theo vòng sửa lỗi và theo dõi tiến bộ bằng dữ liệu từ câu hỏi mới.",
    inLanguage: "vi",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: ONLINE_STUDY_STARTS.length,
      itemListElement: ONLINE_STUDY_STARTS.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.situation,
        description: item.action,
        url: new URL(item.href, base).toString(),
      })),
    },
  };
}
