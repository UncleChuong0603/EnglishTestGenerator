# Task 19 — Question Bank Bulk Import & QA Pipeline

## Luồng vận hành

Admin mở `/admin/content/import`, tải JSON v1, chạy **Validate / Dry run**, sửa mọi `ERROR`, đọc preview/report rồi xác nhận. Server validate lại ngay trước khi ghi và tạo toàn bộ `passage_sets`, `passages`, `questions`, options, solutions, transcript, media relation trong một PostgreSQL transaction. Mọi content mới là `draft`; Admin tiếp tục review/edit/publish bằng Task 15. Selector learner chỉ lấy `published` nên import không làm nội dung AI tự động live.

Validation dùng staging trong bộ nhớ vì giới hạn 2 MiB và 500 atomic groups đủ cho batch hiện tại. Raw payload không được lưu. Lịch sử chỉ lưu metadata, fingerprint, provenance, count và operator. Import cùng fingerprint/batch hoặc content fingerprint bị chặn; text trùng chuẩn hóa với content cũ là cảnh báo. Không overwrite dữ liệu cũ.

## An toàn và quyền nội dung

Chỉ `CONTENT_MANAGE` được validate/commit và `CONTENT_READ` được tải template. JSON dùng parser chuẩn + Zod strict, không `eval`, không SQL động. Media dùng UUID của `media_assets`; server kiểm tra tồn tại, type, `CONTENT/READY`. Có thể ghi `pending:true` để tạo Draft thiếu media, nhưng readiness/publish hiện hữu vẫn chặn. Không lưu URL R2, key storage hay credential.

Chỉ import nội dung TOEICGym có quyền sử dụng: original, AI-assisted original, licensed hoặc nguồn khác đã được phê duyệt. Không sao chép ETS/sách/web, không gắn nhãn “official TOEIC”. Importer không gọi AI hay dịch vụ trả phí.

## Giới hạn và tương thích

- schema `1.0`; unknown field bị từ chối. Bản `1.x/2.x` tương lai không tự động tương thích nếu chưa có validator rõ ràng.
- 2 MiB/tệp, 1–500 groups, tối đa 20 câu/group; P3/P4 đúng 3, P6 đúng 4, P7 single/double/triple đúng số document.
- P2 có 3 options; Parts khác 4. Explanation EN và VI bắt buộc.
- Dry run không mutation. Commit toàn batch; lỗi sẽ rollback, không có orphan/group partial.
- Draft nhập vào dùng scorer, learner DTO, adaptive/practice và Full Mock canonical sau khi được human QA và publish; không có scoring/selection path thứ hai.

CLI read-only: `npm run content:validate-import -- docs/question-bank-import/template-v1.json`.
