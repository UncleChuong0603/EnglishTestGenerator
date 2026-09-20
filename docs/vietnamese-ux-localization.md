# TOEICGym — quy chuẩn bản địa hóa tiếng Việt

## Nguyên tắc viết

1. Viết cho người học TOEIC tại Việt Nam, không dịch từng chữ từ tiếng Anh.
2. Ưu tiên động từ ngắn, quen thuộc trong ngữ cảnh học và làm bài.
3. Dùng sentence case; giữ nguyên TOEIC, Listening, Reading, Part 1–7, Premium và Google.
4. Nút phải mô tả đúng hành động; lỗi phải nêu cách khắc phục an toàn.
5. Trạng thái trống cần giải thích dữ liệu sẽ xuất hiện thế nào và người học nên làm gì tiếp.
6. Dùng “bạn” nhất quán; tránh văn phong hành chính, phô trương hoặc tạo khẩn cấp giả.
7. Không dịch câu hỏi, lựa chọn, bài đọc, transcript hoặc audio TOEIC khi đổi ngôn ngữ giao diện.
8. Ngôn ngữ giao diện và ngôn ngữ giải thích là hai tùy chọn độc lập.

## Thuật ngữ chuẩn

| Khái niệm | English | Tiếng Việt | Ghi chú |
|---|---|---|---|
| Dashboard | Home | Trang chủ | Không dùng “Bảng điều khiển” |
| Practice | Practice | Luyện tập | CTA có thể dùng “Luyện ngay” |
| Today's Workout | Today's practice | Bài luyện hôm nay | Tránh dịch theo nghĩa phòng gym |
| Mistake Bank | Questions to review | Câu cần ôn | Hành động: “Ôn câu sai” |
| To Review | To review | Cần ôn | Trạng thái ngắn |
| Mastered | Mastered | Đã nắm vững | Không dùng “Đã thành thạo” như trạng thái máy |
| Progress | Progress | Tiến độ | — |
| Accuracy | Correct rate | Tỷ lệ đúng | Dùng cho kết quả làm bài |
| Diagnostic | Diagnostic | Đánh giá đầu vào | — |
| Recommendation | Recommended next | Bài nên luyện tiếp | — |
| Full Mock | Mock test | Thi thử | Giữ “Full Mock” chỉ khi là tên kỹ thuật |
| Ranking | Ranking | Xếp hạng | — |
| Rank Points | Rank points | Điểm xếp hạng | — |
| Streak | Learning streak | Chuỗi ngày học | Nếu là mastery: “Chuỗi lần đúng” |
| Billing | Billing | Thanh toán | “Quản lý gói” cho hành động |
| Plan | Plan | Gói | — |
| Submit | Submit | Nộp bài | Không dùng “Gửi bài” |
| Review | Review | Xem lại / Ôn lại | Chọn theo ngữ cảnh |
| Explanation | Answer explanation | Giải thích đáp án | — |

## Kiến trúc và phạm vi route đã kiểm kê

- Public: `/`, `/pricing`, `/blog`, `/blog/[slug]`, `/try`, `/privacy`, `/terms`, 404.
- Auth: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/activate-account`, `/verify-email`, callback OAuth.
- Guest/diagnostic: `/diagnostic`, `/diagnostic/[runId]`, `/diagnostic/[runId]/result`, các phiên practice/result có guest identity.
- Learner: `/dashboard`, `/practice`, `/practice/[sessionId]`, result, Part 5, `/progress`, `/mistakes`, `/ranking`, challenges/run/result, `/settings`, `/billing`, return/cancel, `/demo-test`, `/full-mock` và history/result.
- System: root `error.tsx`, `not-found.tsx`, loading states; admin có shell/error/access-denied riêng và được xem là công cụ vận hành.

Locale giao diện dùng cookie first-party `toeic_interface_language`; khi đăng nhập, `profiles.interfaceLanguage` là nguồn ưu tiên và thao tác đổi ngôn ngữ cập nhật cả cookie lẫn hồ sơ. `profiles.explanationLanguage` độc lập. Root layout đọc locale phía server và đặt `html[lang]`, metadata, dictionary tương ứng.

## Ma trận shell đổi ngôn ngữ

| Nhóm màn hình | Vị trí switch | Mobile | Desktop | Lưu qua refresh |
|---|---|---:|---:|---:|
| Public, legal, blog, pricing, try | Public header/menu | Có | Có | Có |
| Learner, result, billing, settings | Account/menu của learner | Có | Có | Có |
| Auth/recovery/verification | Auth shell | Có | Có | Có |
| 404 | Error shell | Có | Có | Có |
| Generic error | Error shell | Có | Có | Có |

## Giới hạn SEO

Locale hiện dựa trên cookie, không nằm trong URL. Metadata được bản địa hóa theo request nhưng không thể cung cấp URL/hreflang riêng ổn định cho từng ngôn ngữ. Chưa chuyển sang route `/en` và `/vi` vì đó là thay đổi kiến trúc SEO lớn ngoài phạm vi đợt sửa copy này.
