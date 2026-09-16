# Task 10 — Mistake Bank + Mastery Review

## Kiến trúc

- Danh tính lỗi sai là duy nhất theo `(user_id, question_id)` trong `question_mastery`; `attempt_answers` vẫn là lịch sử chuẩn.
- Sai ở practice/recommended/diagnostic hoặc sau guest claim tạo hay mở lại `UNRESOLVED`.
- Đúng ở practice thường không tăng streak. Chỉ session `source = mastery_review` mới tăng streak.
- Hai lần review đúng liên tiếp chuyển sang `MASTERED`; review sai hoặc một lần sai bình thường đặt streak về 0 và mở lại lỗi.
- Migration `0006_mistake_mastery.sql` backfill idempotent các lần sai lịch sử đã submit. Diagnostic chỉ được backfill khi parent `COMPLETED`.

## Bảo mật và nội dung

- `/mistakes` lấy user từ session phía server và mọi query đều scope theo user đó.
- Evidence của diagnostic `IN_PROGRESS` bị loại khỏi danh sách lẫn selector review.
- DTO trước submit tiếp tục dùng practice learner-safe DTO, không có đáp án, transcript hay explanation.
- Review Listening dùng lại signed URL authorization theo ownership/session/question. Part 3/4 giữ nguyên group; Part 6/7 giữ nguyên passage set.
- Câu archived/unpublished hoặc thiếu solution/options/media/transcript/passage bắt buộc vẫn giữ mastery record nhưng bị loại khỏi session và hiển thị unavailable.

## Chọn review

- Batch mặc định 10, chọn một Part cho mỗi session để giữ invariants hiện có.
- Ưu tiên deterministic: chưa review/lâu nhất, miss cũ hơn, số review nhiều hơn, streak thấp hơn.
- Mỗi question/unit chỉ xuất hiện một lần; grouped content được mở rộng nguyên nhóm.
- Mastery cập nhật theo từng child question, không theo cả group.

## Smoke test thủ công

1. Làm sai Part 5, mở `/mistakes`, xác nhận item xuất hiện ở Cần ôn.
2. Review đúng một lần, xác nhận streak 1/2 và vẫn Cần ôn.
3. Tạo review sau, trả lời đúng, xác nhận item sang Đã thành thạo.
4. Làm sai lại câu đó trong practice thường, xác nhận item mở lại và streak 0.
5. Với Part 3, xác nhận cả group 3 câu được tải và transcript chỉ mở sau submit group.
6. Với Part 6/7, xác nhận nguyên passage set được tải.
7. Khi diagnostic còn `IN_PROGRESS`, xác nhận lỗi của child session không xuất hiện trong Mistake Bank.
8. Làm sai với guest rồi đăng nhập, xác nhận chỉ một mastery record được tạo.
