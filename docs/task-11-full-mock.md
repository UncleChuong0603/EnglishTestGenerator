# Task 11 — Full Listening & Reading Mock

## Kiến trúc

`full_mock_runs` là parent đã xác thực, sở hữu bảy `practice_sessions` con tương ứng Part 1–7. Câu hỏi/nhóm được chọn và đóng băng khi tạo; chấm điểm vẫn dùng `attempt_answers`. Unique partial index bảo đảm mỗi user chỉ có một run `LISTENING`/`READING`.

Blueprint bắt buộc: P1 6, P2 25, P3 13 nhóm/39 câu, P4 10 nhóm/30 câu, P5 30, P6 4 nhóm/16 câu, P7 10 single/29 câu và 5 double-or-triple/25 câu. Không có câu hoặc group trùng trong một form.

## Readiness và nội dung

Chạy `npm run validate:mock-readiness`. Command trả exit code khác 0 nếu không thể dựng form hợp lệ từ nội dung published, lời giải/explanation, transcript và media CONTENT/READY. API tạo run kiểm tra lại readiness phía server và trả `CONTENT_NOT_READY` thay vì tạo đề thiếu.

Ngân hàng hiện tại có Listening P1 5/6, P2 10/25, P3 5/13 nhóm và P4 5/10 nhóm, do đó production phải báo `READY: NO`. Không thêm nội dung giả; fixture 200 câu chỉ nằm trong test.

## Lifecycle và bảo mật

Listening có deadline server 45 phút; Reading có deadline mới 75 phút khi transition bắt đầu. Không pause, refresh/đóng tab không đặt lại giờ. Autosave nằm trong `full_mock_answers`, xác minh owner, assignment, option/question và deadline, không trả correctness. Khi kết thúc section, dữ liệu mới được chấm vào `attempt_answers`.

Trong khi parent chưa `COMPLETED`, result/review bị chặn; Progress/Diagnosis và Mistake Bank lọc parent chưa hoàn tất. Chỉ sau khi cả hai section hoàn tất mới reconcile câu sai vào mastery. Completion và transition khóa row, có tính idempotent.

Playback: `PRACTICE` cho replay và speed control; `MOCK_TEST` không replay/speed control; `REVIEW` cho replay sau hoàn tất. Đây là hành vi UX, không phải DRM hay cơ chế thi có giám sát.

## Kết quả và triển khai

Kết quả chỉ gồm Listening đúng/100, Reading đúng/100, tổng đúng/200 và breakdown Part 1–7. Không sinh điểm /495, /990, điểm dự đoán hay quy đổi TOEIC.

Triển khai migration `0007_full_mock_test.sql` sau `0006_mistake_mastery.sql`, rồi redeploy ứng dụng. Không có biến môi trường mới. CTA khởi tạo vẫn fail-closed/hiển thị “Sắp ra mắt” cho tới khi content pipeline cung cấp đủ ngân hàng hợp lệ. Rollback ứng dụng an toàn khi giữ nguyên các bảng append-only; chỉ xóa schema mới nếu đã xác nhận không có run cần bảo toàn.

## Smoke test sau khi content đủ

Đăng nhập → Start Full Mock → Listening 45 phút/no replay → transition → Reading 75 phút → submit/timeout → raw result → review → kiểm tra Progress, Mistake Bank và Today's Workout. Real R2 phải được kiểm tra riêng với signed URL production.
