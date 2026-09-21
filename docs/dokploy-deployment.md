# Triển khai TOEICGym trên Dokploy + Traefik hiện hữu

## Kiến trúc và quyết định triển khai

Triển khai này là một **Dokploy Docker Compose** độc lập, dùng
`docker-compose.dokploy.yml`. Không dùng Docker Stack vì Stack không hỗ trợ
`build`; repo cần build ba target `runner`, `migrator` và `database-tools`.

Luồng public là Internet → Traefik của Dokploy → `app:3000`. `app` lắng nghe
`0.0.0.0:3000`; không có port host. PostgreSQL riêng của TOEICGym chỉ nối mạng
`database` có `internal: true`, dùng volume `toeicgym_postgres_data`, và không
publish 5432. Tuyệt đối không dùng hoặc thao tác `dokploy-postgres`.

Các service runtime là `preflight`, `postgres`, `migrate`, `app`. `db-tools`
chỉ bật theo profile `tools`. Dokploy không chạy `nginx` hoặc `certbot`; hai
service này vẫn còn trong cấu hình dedicated-server cũ để không phá use case đó.

Mạng `frontend` ánh xạ tới external network `dokploy-network` và chỉ `app` tham
gia. `app` đồng thời tham gia mạng `database`; Traefik không cần và không được
nối tới PostgreSQL. Trong Advanced/Utilities của Compose, **tắt Isolated
Deployments** cho project này: tùy chọn đó tự thêm mọi service (kể cả database)
vào cùng mạng do Dokploy tạo. Cấu hình repo đã tự cô lập đúng và dùng
`dokploy-network` hiện hữu cho `app`.

## Biến môi trường production

Trong tab Environment của Compose, nhập các tên sau (không commit giá trị):

```dotenv
APP_URL=https://toeicgym.net
DATABASE_URL=postgresql://toeicgym_app:PASSWORD_URL_ENCODED@postgres:5432/toeicgym
SESSION_SECRET=RANDOM_AT_LEAST_32_CHARACTERS
POSTGRES_DB=toeicgym
POSTGRES_ADMIN_USER=toeicgym_admin
POSTGRES_ADMIN_PASSWORD=RANDOM_AT_LEAST_24_CHARACTERS
APP_DATABASE_USER=toeicgym_app
APP_DATABASE_PASSWORD=RANDOM_AT_LEAST_24_CHARACTERS
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_SERVER_ACTIONS_ENCRYPTION_KEY=BASE64_AES_KEY
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM=TOEICGym <noreply@toeicgym.net>
SMTP_SECURE=false
MEDIA_ENABLED=true
MEDIA_ENABLED=true
MEDIA_STORAGE_PROVIDER=LOCAL
LOCAL_MEDIA_ROOT=/var/lib/toeicgym/media
MEDIA_SIGNING_SECRET=<random secret, at least 32 characters>
```

`POSTGRES_ADMIN_*` chỉ bootstrap/backup; app và migration dùng `DATABASE_URL`
với `APP_DATABASE_*`. Hai username và hai password phải khác nhau. Nếu password
có ký tự đặc biệt, phần password trong `DATABASE_URL` phải percent-encode; giá
trị `APP_DATABASE_PASSWORD` vẫn là password nguyên bản. Không đổi các biến
bootstrap trên một volume đã khởi tạo rồi kỳ vọng entrypoint tự rotate role.

Tạo secret bằng password manager. Riêng Server Actions key phải là base64 của
16, 24 hoặc 32 byte; khuyến nghị 32 byte:

```sh
openssl rand -base64 32
```

SMTP có thể để trống lúc dựng hạ tầng; app vẫn chạy nhưng email xác minh/reset
sẽ chỉ ghi cảnh báo và **chưa được coi là hoạt động production hoàn chỉnh**.
Google OAuth là tùy chọn: cấu hình cả `GOOGLE_CLIENT_ID` và
`GOOGLE_CLIENT_SECRET`, hoặc để trống cả hai. Email/password local vẫn hoạt động
khi Google không được cấu hình hay tạm thời không khả dụng.

## Build secret Server Actions

Compose khai báo `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY` thành BuildKit secret
`next_server_actions_encryption_key`. Dockerfile chỉ mount secret trong lệnh
`next build` và build sẽ dừng nếu secret không được mount; không dùng `ARG` và
không copy secret vào layer. Giữ cùng một key
qua mọi lần build/replica. Dokploy ghi Environment vào file `.env`; Docker
Compose dùng giá trị đó làm nguồn cho secret khi deploy.

Dockerfile không pin `# syntax=docker/dockerfile:1.7`. Pin này buộc BuildKit tải
thêm image frontend `docker/dockerfile:1.7` từ Docker Hub trước khi đọc
Dockerfile, tạo thêm một điểm lỗi mạng không cần thiết. Cú pháp duy nhất cần
BuildKit là `RUN --mount=type=secret,...,required=true`; frontend tích hợp trong
Docker Engine/BuildKit hiện đại hỗ trợ cú pháp này. Host vẫn phải bật BuildKit
và dùng Docker Compose plugin hiện đại; không được đổi secret mount thành `ARG`
hoặc `ENV`.

Trước lần deploy đầu, mở **Preview Compose** và xác nhận phần build của `app` có
secret trên. Nếu phiên bản Docker Compose của host báo không hỗ trợ
`secrets.<name>.environment`, nâng Docker Compose plugin; không chuyển key sang
build arg. Có thể dùng secret provider của Dokploy thay cho giá trị thô trong UI
nếu hệ thống đã cấu hình vault.

## Các bước chính xác trên giao diện Dokploy

1. Tạo Project tên `TOEICGym`, tạo Environment production.
2. Trong project, Create Service → **Docker Compose**; không chọn Stack.
3. Chọn provider GitHub, kết nối repository này và chọn branch production
   (thông thường `main`).
4. Đặt Compose Path là `./docker-compose.dokploy.yml`, lưu cấu hình.
5. Trong Environment, thêm toàn bộ biến ở mục trên. Không paste chúng vào log,
   issue hoặc Git. Xác nhận key Server Actions xuất hiện trong Preview Compose
   dưới dạng build secret, không phải build arg.
6. Trong Advanced/Utilities, tắt **Isolated Deployments** vì file đã nối riêng
   `app` vào external `dokploy-network`, còn DB phải ở mạng internal.
7. Bấm Deploy. Thứ tự tự động là: `preflight` thành công → PostgreSQL healthy →
   `migrate` chạy `drizzle-kit migrate` → `app` khởi động. Migration chỉ áp dụng
   file pending; không drop/recreate database. Xem log riêng của `preflight`,
   `postgres`, `migrate`, `app` nếu deployment fail.
8. Seed đúng **một lần** sau deploy bằng Terminal của Compose (hoặc SSH tại thư
   mục checkout do Dokploy quản lý):

   ```sh
   docker compose --env-file .env -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run seed:reading:production
   docker compose --env-file .env -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run verify:production-db
   ```

   Seed dùng UUID ổn định và upsert transaction nên idempotent, nhưng không tự
   chạy mỗi deploy. Kết quả chuẩn: P5 200; P6 20 bộ/80 câu; P7 single 20 bộ/80
   câu; double 10 bộ/50 câu; triple 5 bộ/20 câu; tổng 430 câu.
9. Mở Domains → Add Domain: host `toeicgym.net`, service **`app`**, container
   port **`3000`**, path `/`; bật HTTPS và Let's Encrypt. Container Port chỉ để
   Traefik route nội bộ, không thêm port trong Advanced → Ports.
10. Sau khi DNS A `toeicgym.net → 42.96.4.79` hoạt động, kiểm tra certificate và
    `https://toeicgym.net/api/health` trả HTTP 200 với `database: reachable`.
11. Tạo CNAME `www → toeicgym.net` ở DNS. Thêm domain `www.toeicgym.net` trong
    Dokploy rồi chọn redirect preset **www to non-www**, đích
    `https://toeicgym.net`. DNS không được quản lý từ repo.
12. Xem Logs theo từng service; khi chia sẻ log phải rà secret/token trước.

Google Cloud Console phải có Authorized JavaScript origin
`https://toeicgym.net` và Authorized redirect URI chính xác:

```text
https://toeicgym.net/auth/callback
```

Đường dẫn này lấy trực tiếp từ `src/app/api/auth/google/route.ts` và
`src/app/auth/callback/route.ts`.

## Backup, restore và kiểm thử restore

Chạy từ checkout Compose trên VPS. Đặt `COMPOSE_PROJECT_NAME` bằng **App Name**
Dokploy hiển thị cho Compose (không phải tên project giao diện). Các biến sau
buộc scripts dùng đúng project/file Dokploy; lệnh `exec postgres` chỉ target
PostgreSQL của project TOEICGym:

```sh
COMPOSE_PROJECT_NAME=TEN_APP_COMPOSE_DOKPLOY \
  COMPOSE_ENV_FILE=.env COMPOSE_FILE_PATH=docker-compose.dokploy.yml \
  ./scripts/backup-db.sh /opt/toeicgym/backups

COMPOSE_PROJECT_NAME=TEN_APP_COMPOSE_DOKPLOY \
  COMPOSE_ENV_FILE=.env COMPOSE_FILE_PATH=docker-compose.dokploy.yml \
  ./scripts/test-restore-db.sh /opt/toeicgym/backups/english-test-TIMESTAMP.dump

COMPOSE_PROJECT_NAME=TEN_APP_COMPOSE_DOKPLOY \
  COMPOSE_ENV_FILE=.env COMPOSE_FILE_PATH=docker-compose.dokploy.yml \
  BACKUP_DIR=/opt/toeicgym/backups \
  ./scripts/restore-db.sh /opt/toeicgym/backups/english-test-TIMESTAMP.dump
```

Backup là `pg_dump -Fc`, `umask 077`, kiểm tra file không rỗng và xóa bản cũ
hơn 14 ngày. Restore thật dừng ghi từ `app`, tạo safety backup, restore bằng
admin role, khởi động app và chạy integrity verifier. `test-restore-db.sh` tạo
database tạm rồi luôn xóa nó. Cần thêm bản sao off-server được mã hóa.

Cron ví dụ (đổi đường dẫn checkout Dokploy thực tế):

```cron
0 2 * * * cd /DUONG_DAN_CHECKOUT && COMPOSE_ENV_FILE=.env COMPOSE_FILE_PATH=docker-compose.dokploy.yml ./scripts/backup-db.sh /opt/toeicgym/backups >> /var/log/toeicgym-backup.log 2>&1
```

## Vận hành và quy trình cập nhật

Quy trình đề nghị: Codex task → PR → lint/typecheck/test/build và review local →
merge `main` → Deploy/Redeploy trong Dokploy → theo dõi migration → health check
→ smoke test đăng nhập, OAuth, luyện tập, kết quả và email (khi SMTP đã có).

Lần đầu nên deploy thủ công. Sau khi ổn định, có thể bật GitHub automatic deploy
webhook trong phần Deployments/Git provider của Compose; vẫn giữ branch
production được bảo vệ và không tự chạy seed. Mỗi lần cập nhật, bấm Redeploy và
kiểm tra log `migrate`, `/api/health`, rồi smoke test. Không stop/reconfigure
`dokploy`, `dokploy-traefik`, `dokploy-postgres`, `dokploy-redis`,
`khch-frontend` hay workload `sanxeghep.vn`.

## Checklist sau deploy

- `app` healthy; `migrate` exit code 0; PostgreSQL healthy.
- Không có mapping host `80`, `443`, `3000`, `5432` trong Preview Compose.
- `toeicgym.net` có HTTPS hợp lệ; `www` redirect về non-www.
- `/api/health` trả 200 và xác nhận DB reachable.
- Verifier báo đúng 430 câu và demo-ready.
- Nếu bật Google OAuth: Google login callback thành công; nếu không bật: local login vẫn thành công.
- Nếu SMTP trống: ghi nhận email/password flow chưa production-verified.
- Có backup, test restore gần nhất và bản sao off-server.
