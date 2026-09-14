# English Test Generator

Ứng dụng Next.js 16 tự host dành cho luyện TOEIC Reading. PostgreSQL là nguồn dữ liệu duy nhất; Google chỉ là nhà cung cấp danh tính OAuth.

## Chạy local

Yêu cầu Node.js 20.9+, Docker và Docker Compose.

```bash
docker compose -f docker-compose.dev.yml up -d
cp .env.example .env.local
npm install
npm run db:migrate
npm run seed:reading
npm run dev
```

Khi chạy app trực tiếp trên máy, đặt `DATABASE_URL` trỏ tới `127.0.0.1:5432`, `SMTP_HOST=127.0.0.1`, `APP_URL=http://localhost:3000`. Mailpit UI chỉ nghe local tại `http://127.0.0.1:8025`.

## Xác thực

- Email/mật khẩu: mật khẩu tối thiểu 10 ký tự, Argon2id; đăng ký phải xác minh email.
- Google OAuth: callback `/auth/callback`, dùng state + PKCE; Google không giữ session ứng dụng.
- Session: token opaque 256-bit trong cookie HttpOnly, hash HMAC-SHA-256 trong PostgreSQL, hết hạn sau 30 ngày.
- Khi trùng email giữa Google và tài khoản mật khẩu, hệ thống không tự gộp. Người dùng đăng nhập trước rồi chọn **Kết nối Google** trong Settings.
- Đổi mật khẩu giữ phiên hiện tại và thu hồi các phiên khác. Reset mật khẩu thu hồi toàn bộ phiên.

## Database và seed

```bash
npm run db:generate
npm run db:migrate
npm run db:studio
npm run validate:reading
npm run seed:reading
npm run verify:reading
```

Seed dùng `DATABASE_URL`, được validate và upsert theo UUID ổn định. Đáp án đúng chỉ được đọc trong DAL server sau khi nộp bài.

## Production một VPS

1. Cài Docker Engine/Compose; clone repo và tạo `.env.production` với secrets thật.
2. Thay `example.com` trong `docker/nginx/default.conf`; cấp chứng thư Let's Encrypt vào `./certbot/conf` trước khi bật cấu hình HTTPS.
3. `docker compose build`; service `migrate` sẽ chạy Drizzle migration một lần trước khi app khởi động.
4. Chạy production seed từ checkout bằng `npm ci && npm run seed:reading` với `DATABASE_URL` nội bộ/an toàn.
5. `docker compose up -d` và kiểm tra `https://DOMAIN/api/health`.

Chỉ Nginx publish 80/443. App và PostgreSQL không publish port ra host. Firewall chỉ mở SSH, 80, 443. Google Console phải khai báo redirect URI chính xác `https://DOMAIN/auth/callback`.

Nâng cấp: backup, pull, build image mới, chạy migration tương thích tiến, rồi `docker compose up -d`. Rollback code chỉ an toàn khi migration tương thích ngược; nếu cần rollback dữ liệu, dừng app và restore backup đã kiểm chứng.

## Backup và restore

```bash
POSTGRES_DB=english_test POSTGRES_USER=english_test BACKUP_DIR=/srv/backups/english-test sh scripts/backup-db.sh
POSTGRES_DB=english_test POSTGRES_USER=english_test sh scripts/restore-db.sh /srv/backups/english-test/english-test-YYYYMMDDTHHMMSSZ.dump
```

Backup có password hash/session và phải có quyền thư mục hạn chế, không đặt trong web root. Nên sao chép định kỳ sang nơi lưu trữ ngoài VPS đã mã hóa.

## Biến môi trường

Bắt buộc: `DATABASE_URL`, `SESSION_SECRET`, `APP_URL`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`. Google cần cặp `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`. Email dùng `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE`. Production nhiều build/instance nên đặt `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`.

Xem [hướng dẫn migration dữ liệu](docs/self-hosted-migration.md) trước khi tắt hệ thống cũ. Không deploy production tự động từ repo này.
