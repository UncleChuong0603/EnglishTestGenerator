# Migration sang backend tự host

## Mô hình và quyền sở hữu

`users` là identity ứng dụng. `auth_identities` chỉ chứa Google subject; mật khẩu Argon2id nằm trên `users`. `profiles.id` dùng cùng UUID với user để giữ quan hệ lịch sử. Mọi truy vấn profile, practice, answer và Demo Test đều nhận `userId` từ session server và thêm điều kiện ownership; đây là lớp thay thế RLS.

## Nhập dữ liệu hiện có từ Supabase

1. Đóng ghi hoặc đặt maintenance window; tạo backup đầy đủ trước khi export.
2. Export `auth.users` thành `migration-export/users.json` với các trường đã chuẩn hóa: `id`, `email`, `email_verified_at`, tùy chọn `google_subject`. Export `profiles` và các bảng ứng dụng thành file JSON cùng tên bảng trong thư mục đó; tool tự ghép profile/preference theo UUID.
3. Nhập `users` trước, giữ UUID. Nhập profile/content/history theo thứ tự khóa ngoại. Đổi mọi FK trước đây trỏ `auth.users` sang `users`.
4. Google user: nếu export có Google subject đáng tin cậy, nhập vào `auth_identities`. Nếu không có, không suy đoán/merge. Người dùng đăng nhập bằng phương thức hiện hữu hoặc qua quy trình hỗ trợ đã xác minh, rồi kết nối Google rõ ràng trong Settings.
5. Cấu hình SMTP và chạy `npm run db:migrate:legacy -- migration-export`. Tool chạy transaction, giữ UUID, không nhập password/provider token; Google subject đã xác minh được liên kết, còn user email đã xác minh không có Google subject nhận activation token 24 giờ (DB chỉ lưu hash).
6. Đối soát số bản ghi, UUID/FK, tổng điểm với answer rows, 100 câu mỗi Demo Test, rồi chạy smoke test user isolation.
7. Chỉ ngắt dự án Supabase sau thời gian read-only, đối soát và rollback window.

Không log token raw/provider token. File export và backup chứa dữ liệu nhạy cảm; mã hóa, giới hạn quyền và xóa an toàn sau khi hết thời gian rollback.

## RLS cũ sang authorization mới

| Dữ liệu | Quy tắc mới |
|---|---|
| Profile/preferences | `profiles.id = authenticated user.id` |
| Practice session | `practice_sessions.user_id = authenticated user.id` |
| Session questions | Chỉ đọc sau khi session ownership đúng |
| Answers/history | `attempt_answers.user_id = authenticated user.id` |
| Demo answer/test | Cả `session_id` và `user_id` phải khớp; timer server quyết định |
| Question bank | Chỉ DAL server trả nội dung published; solution không có trong DTO trước submit |

## SMTP

Ứng dụng dùng SMTP chuẩn và không phụ thuộc nhà cung cấp. Local dùng Mailpit chỉ bind loopback. Production có thể dùng mail server tự host hoặc relay; cần SPF/DKIM/DMARC nếu gửi Internet. Không public Mailpit.

Việc ngắt riêng một phương thức đăng nhập được hoãn: Settings không cho xóa password hoặc Google identity, nên không thể vô tình xóa phương thức đăng nhập cuối cùng. Có thể bổ sung disconnect sau khi có luồng recent-auth và kiểm thử recovery riêng.
