# Task 21 — Admin Content Review & Publishing

## Mô hình hiện hữu đã audit

- Question Bank: `/admin/content/questions`; detail: `/admin/content/questions/[id]`; tạo Draft: `/admin/content/new`.
- Canonical content giữ nguyên: `passage_sets` là đơn vị lifecycle/group; `passages`, `listening_transcripts`, `questions`, `question_options`, `question_solutions` và `question_group_media` chứa stimulus, câu hỏi, đáp án, lời giải và media.
- Lifecycle hiện hữu là `draft → published → archived`. Published content không sửa trực tiếp; `Clone as Draft` tạo revision mới và lưu `revision_of_id`.
- Publish dùng validator server `validateContent`, kiểm tra taxonomy, số câu/option, đáp án, giải thích EN/VI, passage/transcript và media READY. Publish group, passages và questions trong transaction, đồng thời ghi `admin_audit_logs`.
- Import JSON schema `1.0` đã có `question_import_batches`/`question_import_items`, `batch_key`, `external_item_id`; `externalQuestionId` nằm trong metadata câu hỏi. Batch giữ provenance, rights note, review status, operator và fingerprint. Import luôn tạo Draft trong một transaction.
- RBAC hiện hữu dùng role `ADMIN` với `CONTENT_READ`/`CONTENT_MANAGE`; mọi mutation kiểm tra lại quyền trên server. Learner DTO là allowlist riêng và không bị thay đổi.

## Hành vi được bổ sung

- Detail có queue Previous/Next/Skip và Publish & Next. Queue giữ filter từ Question Bank; fallback là Part hiện tại và Draft. Thứ tự cố định: Part, `created_at`, ID.
- Publish & Next gọi đúng `publishContent`; lỗi validation giữ người dùng tại item hiện tại. Pending state khóa nút chống submit lặp.
- Batch Review ở `/admin/content/batches/[batchKey]` tổng hợp trạng thái và chạy validator canonical cho mọi Draft. Bulk publish fail-closed, khóa lại rows, kiểm tra `updated_at`, publish toàn bộ trong một transaction và ghi một audit record có batch/count/lifecycle.
- Export yêu cầu chọn Part, áp dụng status/difficulty/skill/subskill/provenance/batch, bảo toàn group/stimulus/question và phát JSON import schema `1.0`. Export tự validate trước khi tải. External IDs được giữ khi có; không xuất content database ID, storage key, URL riêng tư hay secret. Media được biểu diễn `pending:true`, vì vậy Listening export round-trip hợp lệ nhưng phải nối lại media trước khi publish.

Không có migration mới và không thay đổi learner API/DTO.
