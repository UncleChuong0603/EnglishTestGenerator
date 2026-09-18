# Task 15 — Admin Content

## Kiến trúc và vòng đời

Admin Content mở rộng trực tiếp `passage_sets`, `passages`, `questions`, `question_options`, `question_solutions`, transcript và quan hệ media hiện hữu. Không có question bank thứ hai. `draft` được sửa/validate nhưng không được selector chọn; `published` là semantic snapshot bất biến; `archived` không vào phiên mới nhưng ID và dữ liệu vẫn còn để review lịch sử. Nội dung mới dùng provenance `ADMIN`; dữ liệu cũ được backfill `SEEDED` và giữ nguyên ID.

Muốn sửa nội dung đã publish, Admin dùng **Clone as Draft**. Clone có identity mới, lưu `revision_of_id`, tái sử dụng media reference (không thay bytes), sau đó validate và publish. Không chuyển attempt/mastery sang revision mới.

## Mô hình và validation

- P1/P2 là group một câu; P1 cần audio + image, P2 cần audio.
- P3/P4 cần transcript, audio READY và đúng 3 câu.
- P5 là câu độc lập về mặt học tập nhưng có container Admin để lifecycle/audit nguyên tử.
- P6 cần passage và đúng 4 câu.
- P7 hỗ trợ single/double/triple; tài liệu trong form được ngăn bằng dòng `---`.
- Mỗi câu dùng taxonomy trung tâm theo Part, difficulty hiện hữu, option có thứ tự A–D (P2 A–C), đúng một solution và giải thích EN/VI.

Validation và publish chạy server-side. Publish cập nhật group, stimuli và toàn bộ câu trong một DB transaction. Published/Archived không có đường semantic update. `updated_at` chống ghi đè từ tab cũ và publish là idempotent.

## Media và R2

`/admin/content/media` dùng `ingestMedia` + `R2MediaStorage`: server kiểm MIME lẫn magic bytes, giới hạn audio 15 MB/image 5 MB, tự sinh key và chỉ đánh dấu READY sau upload + verify. Nếu DB finalize thất bại, service cố xóa object và đánh dấu FAILED. Preview là signed URL ngắn hạn, yêu cầu `MEDIA_READ`; bucket không public và URL không được lưu DB. Không có UI thay bytes hoặc physical delete. Media đã tham chiếu/published chỉ được giữ lịch sử; unused asset cleanup là workflow operator tương lai.

## Full Mock và lịch sử

Archive khóa row và dựng lại toàn bộ eligible published units bằng chính `assembleFullMock`. Nếu exact blueprint không còn khả thi (kể cả P7 single 10/29 và multiple 5/25), thao tác trả `CONTENT_REQUIRED_FOR_FULL_MOCK`, không đổi lifecycle và không ghi audit thành công. Session đã frozen tham chiếu question ID bằng FK `restrict`, nên archive không ảnh hưởng review, progress, mastery hoặc kết quả cũ.

## Audit và quyền

ADMIN nhận thêm `CONTENT_READ`, `CONTENT_MANAGE`, `MEDIA_READ`, `MEDIA_MANAGE`. Mọi action kiểm quyền lại ở server; actor lấy từ session. Migration 0010 mở rộng constraint audit nhưng giữ đủ sáu action Task 14. Metadata chỉ chứa ID, Part, lifecycle và kích thước; mutation nội dung và audit nằm cùng transaction.

## Triển khai

1. Deploy code tương thích.
2. Chạy `npm run db:migrate`; journal áp dụng `0009_admin_rbac` trước `0010_admin_content` nếu production chưa có 0009.
3. Chạy `npm run admin:inspect`, sau đó bootstrap/verify ADMIN theo runbook Task 14 (không dùng SQL thủ công).
4. Mở `/admin`, `/admin/content`, `/admin/content/questions`, `/admin/content/media`.
5. Chạy `npm run validate:mock-readiness`; production kỳ vọng `Mode: PRODUCTION DATABASE`, `READY: YES`.
6. Tạo một P5 Draft, sửa/validate và xác nhận learner không thấy; chỉ publish nội dung thực sau review.

## Khôi phục vận hành

- Upload lỗi: asset không READY; thử upload asset mới. Object orphan traceable/cleanup bằng operator workflow.
- Publish lỗi: transaction rollback, toàn group vẫn Draft.
- Draft sai: sửa rồi validate lại hoặc Discard Draft (soft archive).
- Archive: tạo clone Draft và publish revision mới; historical record vẫn nguyên vẹn.
- Không chỉnh SQL production là đường khôi phục bình thường.

Bulk CSV/Excel và AI generation nằm ngoài V1; pipeline Task 12 tiếp tục là lựa chọn batch và cùng ghi vào mô hình chung.
