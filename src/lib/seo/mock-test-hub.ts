import { getSiteUrl } from "./site-url";

export type MockTestHubMode = {
  id: "quick" | "listening" | "reading" | "full";
  title: string;
  scope: string;
  time: string;
  access: string;
  bestFor: string;
  result: string;
  href: string;
  cta: string;
};

export const MOCK_TEST_HUB_MODES: readonly MockTestHubMode[] = [
  {
    id: "quick",
    title: "Bài thử nhanh",
    scope: "Listening khoảng 9 câu hoặc Reading 10–15 câu",
    time: "Khoảng 7–10 phút",
    access: "Không cần tài khoản",
    bestFor: "Bắt đầu ngay, kiểm tra một nhóm kỹ năng và tìm Part nên luyện tiếp.",
    result: "Độ chính xác và câu cần xem lại ngay sau khi nộp.",
    href: "/try#quick-practice",
    cta: "Làm bài thử miễn phí",
  },
  {
    id: "listening",
    title: "Listening Mock",
    scope: "100 câu · Part 1–4",
    time: "45 phút",
    access: "Cần tài khoản; mở khi bộ đề đã sẵn sàng",
    bestFor: "Kiểm tra khả năng giữ nhịp nghe liên tục và độ chính xác giữa bốn Part.",
    result: "Số câu đúng và độ chính xác theo Part Listening.",
    href: "/full-mock#full-tests",
    cta: "Xem đề Listening",
  },
  {
    id: "reading",
    title: "Reading Mock",
    scope: "100 câu · Part 5–7",
    time: "75 phút",
    access: "Cần tài khoản; mở khi bộ đề đã sẵn sàng",
    bestFor: "Kiểm tra tốc độ đọc, cách phân bổ thời gian và câu bỏ trống cuối bài.",
    result: "Số câu đúng và độ chính xác theo Part Reading.",
    href: "/full-mock#full-tests",
    cta: "Xem đề Reading",
  },
  {
    id: "full",
    title: "Full Mock",
    scope: "200 câu · Part 1–7",
    time: "120 phút làm bài",
    access: "Cần tài khoản; mở khi cả hai phần đã sẵn sàng",
    bestFor: "Tập sức bền và chuyển nhịp từ Listening sang Reading trước ngày thi.",
    result: "Độ chính xác tổng, từng kỹ năng và từng Part.",
    href: "/full-mock#full-tests",
    cta: "Xem đề Full Mock",
  },
] as const;

export function mockTestHubStructuredData(base = getSiteUrl()) {
  const url = new URL("/thi-thu-toeic-online", base).toString();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#collection`,
    url,
    name: "Thi thử TOEIC online: chọn bài ngắn hoặc Full Mock",
    description: "So sánh bài thử nhanh, Listening Mock, Reading Mock và Full Mock theo số câu, thời gian, điều kiện truy cập và kết quả nhận được.",
    inLanguage: "vi",
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: MOCK_TEST_HUB_MODES.length,
      itemListElement: MOCK_TEST_HUB_MODES.map((mode, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: mode.title,
        description: `${mode.scope}. ${mode.time}. ${mode.bestFor}`,
        url: new URL(mode.href, base).toString(),
      })),
    },
  };
}
