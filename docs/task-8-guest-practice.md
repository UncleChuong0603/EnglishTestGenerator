# Task 8 — Guest Practice và chuyển bài làm vào tài khoản

## Kiến trúc và vòng đời

Khách được nhận token ngẫu nhiên do server tạo trong cookie `tg_guest`. Cookie là
`HttpOnly`, `SameSite=Lax`, chỉ bật `Secure` ở production, áp dụng toàn site và hết
hạn sau 7 ngày. Database chỉ lưu SHA-256 của token trong
`practice_sessions.guest_owner_hash`; không lưu IP, fingerprint hay token thô.

Mỗi practice session bắt buộc có đúng một owner: `user_id` hoặc
`guest_owner_hash`. Guest session có `expires_at` bằng 7 ngày kể từ lúc tạo. Reading
dùng selector mixed hiện hữu với mục tiêu 10 câu và giữ trọn group; Listening dùng
3 group Part 3, tức 9 câu. Cả hai chỉ chọn nội dung published/eligible hiện hữu.

## Nộp bài, media và review

Server Action lấy owner từ auth session hoặc cookie, khóa session trước khi chấm,
và chỉ chấp nhận question/option đã gán. Part 3 vẫn nộp nguyên nhóm 3 câu. Signed
R2 URL chỉ được tạo khi cookie sở hữu đúng session, question/group và asset READY
CONTENT. Correct answer, transcript và explanation chỉ mở theo quy tắc review cũ.

## Chuyển đổi guest → account

Sau password sign-in hoặc Google OAuth callback, server lấy user đã xác thực và
hash từ cookie rồi chạy một transaction. Tất cả session guest `submitted`, chưa
hết hạn và chưa có user được đổi owner; answer rows được gắn cùng user. Incomplete
hoặc expired session không được chuyển. Update có điều kiện `user_id IS NULL`, vì
vậy retry/callback lặp là idempotent. Không deduplicate question giữa các attempt.
Cookie guest chỉ bị xóa sau commit thành công; lỗi transaction giữ nguyên dữ liệu
để retry. Signup email chưa bypass verification: bài được chuyển ở lần sign-in an
toàn đầu tiên sau xác minh. Dashboard, Progress và Diagnosis đọc attempt rows như
bài account bình thường ngay sau chuyển đổi.

## Migration và cleanup

Migration `0004_guest_practice.sql` làm `practice_sessions.user_id` và
`attempt_answers.user_id` nullable, thêm `guest_owner_hash`, ownership CHECK, index
lookup và unique partial index cho guest session đang mở. Dữ liệu account cũ không
bị thay đổi. Chưa có cron cleanup; vận hành sau này có thể xóa guest sessions có
`expires_at < now()` và `user_id IS NULL` theo cascade.

## Smoke test

1. Logout, vào `/try`, hoàn tất Reading, review, đăng ký/xác minh/đăng nhập và kiểm
   tra Dashboard + Progress có bài vừa làm.
2. Logout, vào `/try`, hoàn tất Listening; xác nhận audio tải được và từng group
   Part 3 chỉ mở transcript sau khi nộp đủ 3 câu.
3. Lặp bằng tài khoản có sẵn và Google; refresh callback/dashboard nhiều lần, xác
   nhận không có session/answer trùng.
4. Dùng cookie khác thử URL session và refresh asset: phải bị từ chối/404.
5. Đặt `expires_at` về quá khứ: session không truy cập hoặc claim được.

## Production troubleshooting

Nếu domain trả 404, kiểm tra Dokploy domain phải trỏ service `app`, container port
`3000`, path `/`, và tắt Isolated Deployments vì app đã nối `dokploy-network`.
Kiểm tra lần lượt log `preflight`, `migrate`, `app`, rồi gọi `/api/health`. DNS đúng
không chứng minh Traefik router/container đang hoạt động.
