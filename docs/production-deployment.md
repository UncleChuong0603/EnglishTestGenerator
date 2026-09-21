# Triển khai production trên một VPS

Tài liệu này là nguồn vận hành cho kiến trúc `Internet -> Nginx -> Next.js -> PostgreSQL`. PostgreSQL và ứng dụng không publish cổng ra host; Google chỉ cung cấp danh tính OAuth, SMTP chỉ vận chuyển email. Thư mục chuẩn là `/opt/toeic-app`, volume dữ liệu là `toeic_app_postgres_data`, backup mặc định ở `/opt/toeic-app/backups`.

## 1. Điều kiện trước khi triển khai

- DNS `A` của domain (và `www` nếu dùng) trỏ tới `42.96.4.79`.
- VPS Ubuntu/Debian cập nhật, có Docker Engine và Compose plugin.
- Operator đăng nhập bằng SSH key trên cổng `26266`; không đưa password hoặc private key vào repo.
- Có SMTP production; Google OAuth là tùy chọn. Cần export Supabase đã kiểm tra nếu còn chuyển dữ liệu cũ.
- Clone repo vào `/opt/toeic-app`, thuộc sở hữu của user deploy, không chạy app trực tiếp từ `/root`.

Tạo secret trên server, không ghi kết quả vào terminal history hoặc log chia sẻ:

```sh
umask 077
openssl rand -base64 48
openssl rand -base64 32
```

Secret thứ nhất dùng cho `SESSION_SECRET`; secret 32 byte dùng cho `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`. Tạo DB password riêng với password manager hoặc `openssl rand -base64 36`.

## 2. Environment production

Sao chép `.env.example` thành `.env.production`, thay toàn bộ placeholder và chạy `chmod 600 .env.production`. Không commit file này. Các biến bắt buộc:

- `DATABASE_URL=postgresql://USER:PASSWORD@postgres:5432/DB` (URL-encode password khi cần).
- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` phải khớp URL.
- `SESSION_SECRET`, `APP_URL=https://domain`, `DOMAIN=domain`.
- `MEDIA_ENABLED=true`, `MEDIA_STORAGE_PROVIDER=LOCAL`, `LOCAL_MEDIA_ROOT=/var/lib/toeicgym/media`.
- `MEDIA_SIGNING_SECRET` ngẫu nhiên tối thiểu 32 ký tự. Không cấu hình credential R2/S3/object storage.
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD`, `SMTP_FROM`, `SMTP_SECURE`.
- `NGINX_CONFIG=http.conf.template` trong giai đoạn cấp certificate; đổi thành `https.conf.template` sau đó.

Không biến bí mật nào được có tiền tố `NEXT_PUBLIC_`. Startup production chủ động thất bại nếu thiếu DB/session/domain HTTPS/Google/SMTP hoặc dùng session secret dạng placeholder.

## 3. Triển khai lần đầu và HTTPS

Build và khởi động tạm qua HTTP để Let's Encrypt xác minh domain:

```sh
cd /opt/toeic-app
chmod +x scripts/*.sh
./scripts/deploy-production.sh
docker compose --env-file .env.production --profile tools run --rm certbot certonly --webroot -w /var/www/certbot --email operator@example.com --agree-tos --no-eff-email -d app.example.com
```

Không `source .env.production`. Thay email/domain công khai trong lệnh Certbot; tuyệt đối không echo secrets. Sau khi certificate tồn tại, sửa `NGINX_CONFIG=https.conf.template` rồi chạy:

```sh
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.https.yml up -d nginx
curl -fsSI "https://$DOMAIN/api/health"
curl -fsSI "http://$DOMAIN/"
```

Kết quả HTTP phải redirect sang HTTPS; certificate phải đúng hostname. HSTS chỉ có trong template HTTPS, vì vậy không được bật trước khi HTTPS ổn định.

Google Console cần Authorized redirect URI chính xác `https://DOMAIN/auth/callback` và origin `https://DOMAIN`. Không giữ Supabase callback hoặc chỉ giữ localhost cho production. Link email dùng `APP_URL`, do đó cũng phải là HTTPS domain cuối cùng.

## 4. Migration, seed và xác minh dữ liệu

Migration Drizzle là forward-only và không reset database:

```sh
docker compose --env-file .env.production run --rm migrate
docker compose --env-file .env.production run --rm db-tools npm run seed:reading:production
docker compose --env-file .env.production run --rm db-tools npm run verify:production-db
```

Seed dùng UUID ổn định và upsert, có thể chạy lại; không xóa user/history. Verifier báo count, email/Google trùng, profile thiếu, ownership sai, câu published thiếu 4 lựa chọn/solution/giải thích và khả năng ghép Demo Test 30/16/54.

Chuyển dữ liệu Supabase chỉ khi có export đã chuẩn hóa và đã dừng ghi hệ thống cũ:

```sh
docker compose --env-file .env.production run --rm -v /ABSOLUTE/migration-export:/migration-export:ro db-tools npm run db:migrate:legacy:production -- /migration-export
docker compose --env-file .env.production run --rm db-tools npm run verify:production-db
```

Thứ tự importer: users/Google identity/profile, passage sets, passages, questions, options, solutions, practice sessions, session questions, attempt answers, Demo answers. UUID được giữ nguyên. Password và provider token cũ không được nhập; user password cũ nhận activation link. Google subject chỉ được nối khi export đáng tin cậy và email đã verified; xung đột identity làm toàn transaction thất bại thay vì tự merge.

## 5. Backup, restore và retention

Backup thủ công:

```sh
./scripts/backup-db.sh /opt/toeic-app/backups
./scripts/test-restore-db.sh /opt/toeic-app/backups/english-test-TIMESTAMP.dump
```

`pg_dump -Fc` chạy trong container, file có `umask 077`, kiểm tra không rỗng và tự xóa file cũ hơn 14 ngày. Restore test dùng database tạm rồi xóa, không đụng production. Restore thật dừng app, tạo safety backup, restore, khởi động lại và chạy integrity verifier:

```sh
./scripts/restore-db.sh /ABSOLUTE/PATH/english-test-TIMESTAMP.dump
```

Cron hàng ngày lúc 02:00 theo timezone của host (khuyến nghị đặt host UTC):

```cron
0 2 * * * cd /opt/toeic-app && ./scripts/backup-db.sh /opt/toeic-app/backups >> /var/log/toeic-backup.log 2>&1
20 2 * * * cd /opt/toeic-app && docker compose --env-file .env.production --profile tools run --rm certbot renew --quiet && docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.https.yml exec -T nginx nginx -s reload
```

Copy `ops/logrotate/toeic-app` vào `/etc/logrotate.d/toeic-app` với owner root để log backup không tăng vô hạn. Docker app/Nginx/Postgres đã dùng `json-file` tối đa 5 file x 10 MB mỗi container. Kiểm tra cron và renewal bằng `certbot renew --dry-run`. Chuẩn bị bản sao off-server được mã hóa; backup cùng VPS không bảo vệ khi mất toàn server.

## 6. Firewall, SSH và Fail2ban

Chỉ mở `26266/tcp`, `80/tcp`, `443/tcp`. Không mở `3000` hoặc `5432`:

```sh
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 26266/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status verbose
```

Không harden SSH trong một phiên duy nhất. Tạo user deploy, thêm public key, mở phiên thứ hai để xác minh key và `sudo`, giữ phiên cũ mở; sau đó mới đặt `PermitRootLogin no`, `PasswordAuthentication no`, `PubkeyAuthentication yes`, `Port 26266`, kiểm tra `sudo sshd -t` rồi reload. Cài Fail2ban profile `sshd` với port 26266 và xác minh bằng `fail2ban-client status sshd`. Nếu chưa xác minh được key ở phiên thứ hai thì không tắt root/password.

## 7. Update và rollback

```sh
cd /opt/toeic-app
./scripts/backup-db.sh /opt/toeic-app/backups
git fetch --all --prune
git switch --detach COMMIT_DA_KIEM_TRA
./scripts/deploy-production.sh
```

Script kiểm tra Compose, build image trước, khởi động DB, chạy migration, seed idempotent, integrity verifier, cập nhật app/Nginx rồi chờ health. Nếu build thất bại, container đang chạy không bị thay. Rollback code bằng commit/image trước chỉ khi migration tương thích ngược; nếu không, dừng ghi và restore safety backup đã test.

## 8. Smoke test bắt buộc

Không dùng tài khoản thật cho automation. Với test account có nhãn rõ ràng, kiểm tra: homepage/sign-in/sign-up/pricing và đổi ngôn ngữ; signup -> verify -> login -> profile -> logout; forgot/reset/change password; Google mới và quay lại; Google-first -> Set Password; password-first -> Connect Google; không tạo user/profile trùng; P5/P6/P7/Mixed/Recommended/Custom; submit/result/review; progress/recommendation; Demo 100 câu 30/16/54, timer 75 phút, refresh/resume/submit/result/review/history.

SMTP failure phải để user có thể resend verification hoặc yêu cầu reset lại. Theo dõi log nhưng không ghi password/hash, URL DB, session/OAuth/reset/verification token hay SMTP password.

## 9. Reboot và tài nguyên

Sau khi có cửa sổ bảo trì được duyệt, reboot VPS và kiểm tra `docker compose ps`, HTTPS và health. `restart: unless-stopped` áp dụng cho Postgres/app/Nginx. Không reboot bất ngờ.

Các lệnh baseline:

```sh
nproc
free -h
df -h
docker system df
docker stats --no-stream
docker compose --env-file .env.production exec -T postgres sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c "select pg_size_pretty(pg_database_size(current_database()));"'
curl -sS -o /dev/null -w '%{http_code} %{time_total}\n' "https://$DOMAIN/"
```

## 10. Checklist ngắt Supabase (không tự động xóa)

Chỉ shutdown sau khi có full export + backup/restore test; count và UUID/FK user/profile/question/history/Demo khớp; Google/password/verification/recovery/linking pass; production chạy qua một rollback window mà không có network/runtime dependency Supabase. Giữ dự án cũ read-only trong thời gian đối soát. Việc xóa Supabase luôn là thao tác riêng cần operator phê duyệt.
