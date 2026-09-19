# Kiểm kê UI số liệu và kiến trúc analytics

## Chính sách dữ liệu

- Nguồn học tập chuẩn: `attempt_answers`, chỉ qua `practice_sessions.status = submitted`; Full Mock chỉ được tính khi `full_mock_runs.status = COMPLETED`.
- Taxonomy chuẩn: `questions.skill_area`, `toeic_part`, `skill`, `sub_skill`.
- Độ chính xác làm tròn về số nguyên gần nhất. Không có câu trả lời là `null`/“Chưa có dữ liệu”; có câu trả lời nhưng không đúng câu nào là `0%`.
- Ngày analytics và cửa sổ quota đều dùng `Asia/Ho_Chi_Minh` (UTC+7). Điểm trend theo ngày; ngày không hoạt động có `answeredCount = 0`, `accuracy = null` và không được vẽ như 0%.
- Free được xem 7/30 ngày; Premium thêm 90 ngày. Đây là mở rộng phạm vi xem, không thay đổi entitlement tạo bài.

## Inventory

| Surface | Số liệu | Nguồn chuẩn | Dạng | Trực quan | Quyền |
| --- | --- | --- | --- | --- | --- |
| Dashboard | quota đã dùng/giới hạn | `usage_consumptions` + catalog entitlement | ratio | progress bar | Free/Premium |
| Dashboard | accuracy, số câu, lỗi chưa xử lý | answer aggregate + `question_mastery` | snapshot | KPI + trend 7 ngày | Free/Premium, chính chủ |
| Practice setup | accuracy và cỡ mẫu theo Part | answer aggregate + taxonomy | snapshot | text nhỏ trong card | Free/Premium, chính chủ |
| Practice result | đúng/sai, Part, skill | session/result DTO | ratio/category | summary + bar khi có nhiều nhóm | chủ session/guest owner |
| Progress | tổng, Listening/Reading, Part 1–7 | answer aggregate + taxonomy | snapshot/category | KPI + horizontal bars | Free/Premium, chính chủ |
| Progress | accuracy theo ngày | answer timestamps | time series | line 7/30/90 ngày | Free 7/30; Premium 7/30/90 |
| Mistake Bank | unresolved/mastered | `question_mastery` | current snapshot | counter/filter | Free/Premium, chính chủ |
| Diagnostic result | Listening/Reading, Part signals | completed diagnostic child sessions | ratio/category | bars | owner; không phải điểm TOEIC |
| Mock result | section/overall/Part raw score | completed mock child sessions | ratio/category | cards + bars | chính chủ |
| Ranking | điểm/xếp hạng hiện tại | ranked challenge run | snapshot | không thêm chart | theo policy challenge |
| Billing | plan, membership dates, payment history | memberships + payment orders | snapshot/list | không thêm chart | chính chủ |
| Pricing | giá và giới hạn gói | product/payment catalog | reference | không thêm chart | public |
| Admin overview | user/status/plan/new registrations | users + active memberships | count/ratio | KPI + plan distribution | Admin permission |
| Admin users | plan/status/activity summary | users + canonical learning tables | snapshot/list | không thêm chart | Admin permission |
| Admin content/questions | status/Part/import counts | questions/import batches | count/distribution | bảng operational hiện có | Admin permission |
| Admin media/readiness | READY/blocked và blueprint | media/content validators | readiness | status/readiness, không suy diễn | Admin permission |
| Admin payments | orders/amount/status | payment orders/events | list | không thêm chart khi chưa có series đáng tin | Admin permission |

## Các quyết định không dùng biểu đồ

- Pricing, account menu, billing history, ranking hiện tại và danh sách Admin giữ dạng text/card/table: đây là giá trị đơn hoặc trạng thái hiện tại, chart không cải thiện khả năng hiểu.
- Mistake Bank không có trend “đã sửa theo thời gian”: snapshot mastery không thể tái tạo lịch sử trạng thái một cách trung thực.
- Không tạo MAU/DAU, retention, churn, conversion, study minutes hay TOEIC scaled score vì schema hiện tại không có canonical event/duration/scale phù hợp.
- Content/media/mock readiness tiếp tục dựa validator và trạng thái vận hành; không biến trạng thái nhị phân thành dashboard trang trí.

## Hiệu năng, riêng tư và accessibility

- Snapshot dùng một grouped SQL query; trend dùng một bounded grouped SQL query (tối đa hai kỳ), không tải lịch sử câu trả lời vào browser và không có N+1.
- Query learner luôn nhận `userId` từ session server; không có API cho client truyền user khác. Admin page đi qua `requireAdmin`/permission hiện có.
- DTO chart chỉ chứa ngày, tổng số câu, số đúng, accuracy; không chứa đáp án đúng hay nội dung câu hỏi.
- Mọi bar/line/donut đều có nhãn văn bản/ARIA; cỡ mẫu luôn hiển thị. Line chart có danh sách screen-reader và empty state khi ít hơn hai ngày có dữ liệu.
- Chart dùng HTML/SVG/CSS nhẹ, responsive, không animation và không thêm dependency.
