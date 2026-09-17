# Task 13 — Free / Premium entitlements

## Mô hình sản phẩm

`FREE` là gói mặc định của mọi tài khoản đã xác thực khi không có grant Premium hợp lệ; không tạo bản ghi FREE. `PREMIUM` được cấp bằng các bản ghi lịch sử trong `user_plan_memberships`. Guest là chế độ riêng và không có plan.

`PLAN_CATALOG` là nguồn chính thức duy nhất: FREE có Today's Workout 1/ngày, Manual Practice 3/ngày dùng chung Listening/Reading, Mastery Review 1/ngày và Full Mock 1/tháng; Premium dùng kiểu `UNLIMITED` rõ ràng cho cả bốn quyền. Diagnostic, Reading Demo, Progress, kết quả và Mistake Bank không bị tính quota.

## Thời gian và usage

Các cửa sổ ngày/tháng dùng giờ máy chủ và `Asia/Ho_Chi_Minh`, đầu khoảng inclusive và `resetAt` exclusive. Không có cron reset. `usage_consumptions` là event log append-only, có identity duy nhất `(user, entitlement, source_type, source_id)` nên retry không tính hai lần. Không backfill session lịch sử; quota bắt đầu tự nhiên sau migration.

Mỗi luồng tạo khóa advisory theo user, kiểm tra plan và tổng usage, ghi consumption rồi tạo resource trong cùng PostgreSQL transaction. Concurrent request được tuần tự hóa; lỗi tạo resource rollback cả consumption. Resource đang hoạt động được tìm trước consumption đối với Today's Workout, Mastery Review và Full Mock. Việc hết hạn/revoke Premium không làm mất quyền resume/review resource đã sở hữu.

## Membership

Grant hợp lệ khi `starts_at <= now`, chưa revoke, và `ends_at` null hoặc lớn hơn `now`. Grant tương lai, hết hạn hoặc revoked không có hiệu lực. Nhiều grant được giải quyết xác định; chỉ cần một grant hợp lệ là Premium, ưu tiên expiry mở/xa nhất khi hiển thị. Nguồn hỗ trợ `MANUAL`, `PROMOTION`, `PAYMENT`; PAYMENT chỉ là giá trị dự phòng, không có logic thanh toán.

## UI và vận hành

Dashboard hiển thị plan và bốn usage status. `/pricing` lấy hạn mức trực tiếp từ catalog, không công bố giá và chỉ báo thanh toán Premium sắp ra mắt. Các lỗi quota được chuyển thành trạng thái an toàn và dẫn đến `/pricing`; không làm lộ ID nội bộ.

Lệnh vận hành (không tự tạo user, email được normalize, không in secret):

```bash
npm run plan:inspect -- --email learner@example.com
npm run plan:grant -- --email learner@example.com --plan PREMIUM --days 30
npm run plan:revoke -- --email learner@example.com
```

Grant mới nối tiếp expiry đang còn hiệu lực nên không vô tình rút ngắn quyền; lịch sử không bị xóa. Revoke có hiệu lực ngay cho hoạt động mới.

## Deploy và rollback

Thứ tự: `0007_full_mock_test` → `0008_entitlements_usage`, chạy bằng `npm run db:migrate`; không chạy SQL thủ công và không cần biến môi trường mới. Rollback ứng dụng cần giữ hai bảng để bảo toàn audit history; chỉ drop bảng khi đã sao lưu và chủ động chấp nhận mất lịch sử entitlement/usage.

Payment tương lai chỉ cần, sau khi xác minh thanh toán thành công, tạo hoặc gia hạn membership Premium. Feature code tiếp tục gọi `getEffectivePlan()` và không biết provider.

## Checklist trình duyệt production

- FREE: dashboard hiện Free và usage; lần tạo Manual thứ 4, Workout/Mastery thứ 2 trong ngày, Full Mock thứ 2 trong tháng bị chặn; resume/review và `/pricing` vẫn hoạt động.
- PREMIUM: grant bằng CLI; dashboard hiện Premium/unlimited; tạo vượt giới hạn FREE; revoke hoặc expiry đưa hoạt động mới về FREE.
- Xác nhận Diagnostic, Reading Demo, Progress, Mistake Bank, media ownership và Full Mock anti-leak không thay đổi.
