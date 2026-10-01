# Báo lỗi câu hỏi: tự phát hiện trùng lặp

Mục “Trùng lặp” được gộp vào `/admin/content/reports`. Đường dẫn cũ `/admin/content/similarity` chuyển tới hàng đợi báo lỗi với bộ lọc `DUPLICATE`, giữ lại Part nếu có.

## Hoạt động

- Hệ thống quét sau khi tạo, sửa, nhân bản, import, lưu trữ, bỏ bản nháp, khôi phục nội dung hoặc thay đổi ngưỡng tương đồng. Quét nền dùng `after` của Next.js; trang báo lỗi tự đồng bộ để bổ sung nội dung cũ và khắc phục lần quét nền chưa hoàn tất.
- Phát hiện theo nhóm `passage_sets` còn hoạt động trong cùng Part, gồm câu hỏi, lựa chọn, đoạn đọc và transcript. Câu hỏi standalone không thuộc nhóm và nội dung nhị phân của media chưa được so sánh. Admin cần đối chiếu cả đáp án và media trước khi kết luận.
- Báo cáo có nguồn “Hệ thống”, bằng chứng chung, độ tương đồng và liên kết tới hai nhóm. Không tự sửa, xuất bản hoặc xóa nội dung trong quá trình quét.
- Mỗi cặp có một fingerprint ổn định. Các lần quét không tạo báo cáo lặp và không ghi đè quyết định đã xử lý/bỏ qua của admin.
- Báo cáo đang mở/đang kiểm tra tự đóng khi cặp không còn được phát hiện; chỉ báo cáo do hệ thống tự đóng mới được tự mở lại khi cặp xuất hiện lại.
- Admin chọn Đang mở / Đang kiểm tra / Đã xử lý / Bỏ qua. Thao tác kiểm tra quyền ở server, chống ghi đè trạng thái cũ và có audit log.
- Bộ lọc hỗ trợ Part, loại báo cáo, trạng thái; danh sách phân trang 20 báo cáo. Nội dung và ngưỡng không đổi thì bỏ qua bước so sánh cặp. Quét cùng Part được tuần tự hóa; báo cáo và dấu lần quét được lưu trong cùng transaction.

## Triển khai và kiểm tra

Chạy migration theo journal trước khi dùng trang mới: `0046_narrow_vertigo` tạo báo cáo/audit action; `0047_duplicate_scan_state` lưu dấu lần quét. Các migration trước đó vẫn là điều kiện tiên quyết. Không cần biến môi trường mới.

Kiểm tra service thực bằng PostgreSQL nhúng: phát hiện chính xác/gần trùng, idempotency, thay đổi lựa chọn/ngưỡng, tự đóng/mở lại, quyết định của admin, quyền, stale update, rollback transaction, bộ lọc và phân trang.

Kiểm tra trình duyệt: `playwright.question-reports.config.ts` và `e2e/question-reports.spec.ts`, tiếng Việt/Anh ở 375, 768, 1024, 1440px, focus bàn phím, không tràn ngang, bộ lọc, lưu trạng thái, trạng thái rỗng và redirect cũ. Runner chỉ chấp nhận database QA riêng `127.0.0.1:15433/toeicgym_task17` với user `toeicgym_test`; fixture tạo riêng và được dọn sau test. Không chạy seed hoặc migration QA trên production.
