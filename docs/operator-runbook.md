# Runbook vận hành production

Chạy tại `/opt/toeic-app`. Mọi lệnh Compose dùng `--env-file .env.production`; không in nội dung file này.

```sh
# Trạng thái và health
docker compose --env-file .env.production ps
curl -fsS https://DOMAIN/api/health

# Log giới hạn; không paste log chưa rà soát secrets
docker compose --env-file .env.production logs --since=30m --tail=300 app nginx postgres

# Restart app
docker compose --env-file .env.production restart app

# Migration, seed và integrity
docker compose --env-file .env.production run --rm migrate
docker compose --env-file .env.production run --rm db-tools npm run seed:reading:production
docker compose --env-file .env.production run --rm db-tools npm run verify:production-db

# Backup/restore test/restore thật
./scripts/backup-db.sh /opt/toeic-app/backups
./scripts/test-restore-db.sh /opt/toeic-app/backups/FILE.dump
./scripts/restore-db.sh /opt/toeic-app/backups/FILE.dump

# Deploy update
./scripts/deploy-production.sh

# Certificate
docker compose --env-file .env.production --profile tools run --rm certbot renew --dry-run
docker compose --env-file .env.production -f docker-compose.yml -f docker-compose.https.yml exec -T nginx nginx -s reload

# Disk, volume, container
df -h
du -sh /opt/toeic-app/backups
docker system df
docker volume inspect toeic_app_postgres_data
docker stats --no-stream
```

Nếu health fail: xem `migrate` và `app` log, xác minh container Postgres healthy, dung lượng đĩa, DNS/certificate và biến bắt buộc theo tên (không echo giá trị). Không chạy reset schema, `DROP DATABASE`, seed development phá hủy dữ liệu hoặc xóa volume. Khi nghi ngờ compromise, giữ bằng chứng/log, chặn truy cập ở firewall nếu cần và rotate secrets qua một cửa sổ bảo trì.

## Kiểm tra an toàn sau sự cố lộ môi trường (Task 36B)

Trong checkout Dokploy, chạy `scripts/task36b-safe-status.mjs` bằng Node của container Dokploy (host production không cài Node). Ví dụ: `docker exec -w /etc/dokploy/compose/toeic-gym-frontend-bhwkds/code <dokploy-container> node scripts/task36b-safe-status.mjs`. Script chỉ in revision, trạng thái service, restart count và **tên** credential; không in giá trị môi trường. Kiểm tra `/api/health` qua HTTPS riêng.

Không chạy hoặc chia sẻ `ps ... args`, `docker inspect .Config.Env`, `docker compose config`, nội dung `.env`, full Dokploy deployment command/log, hay chuỗi base64. Các đầu ra này có thể tái tạo toàn bộ môi trường production, kể cả khi được gọi là “encoded”. Nếu cần điều tra lỗi deploy, chỉ báo trạng thái và loại lỗi đã lọc; không dán log thô vào ticket/chat.

Task 42B bổ sung `scripts/task42b-production-audit.mjs`, chạy bằng Node trong container Dokploy tại checkout của dự án như script Task 36B. Script chỉ xuất tên credential, revision, trạng thái/exit code/restart count và boolean đối chiếu toàn bộ journal với hash SQL trong DB. Truy vấn schema chạy trong transaction `READ ONLY`; không sửa migration ledger hoặc dữ liệu learner. Lỗi subprocess cũng bị chặn, không xuất stderr có thể chứa credential. Không dùng revision checkout làm bằng chứng duy nhất cho image: đối chiếu deployment thành công và image đang chạy hoặc build/recreate từ checkout đã xác minh.

Khi cần xem environment, chỉ xuất **tên biến** đã cho phép; không xuất giá trị, độ dài, prefix, suffix, hash credential hoặc bản base64. Với log deploy/runtime, thu thập riêng trên VPS và báo số lượng/loại lỗi đã lọc. Không chuyển log thô vào chat hoặc Git. Scan cây Git hiện tại và history riêng; cây hiện tại sạch không đồng nghĩa history sạch. Nếu scan phát hiện exposure, chỉ báo đường dẫn và tên credential, rồi rotate/revoke tại provider. Giữ bằng chứng trong thư mục riêng trên VPS với quyền `0700`, file `0600`; không commit artifact chứa môi trường.

## Chẩn đoán lỗi tải image trên Dokploy

Khi rotate `NEXT_SERVER_ACTIONS_ENCRYPTION_KEY`, BuildKit secret không tự làm mất hiệu lực cache. Build lại app với `--no-cache` qua Compose của dự án và xác minh key trong server-reference manifest khớp cấu hình authoritative **chỉ bằng boolean**. Không in manifest hoặc key. Chỉ recreate app sau khi build thành công.

Credential bên ngoài phải revoke tại provider, không chỉ thay biến trong Dokploy. Cập nhật tại Compose → Environment: Resend (`SMTP_PASSWORD`, `SMTP_USER` nếu thay đổi), Google (`GOOGLE_CLIENT_SECRET`), payOS (`PAYOS_API_KEY`, `PAYOS_CHECKSUM_KEY`, `PAYOS_CLIENT_ID` nếu được cấp lại), Cloudflare/R2 (`R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`). Với R2 legacy không còn dùng, revoke key tại Cloudflare rồi xóa biến cũ. Không chuyển secret qua chat/ticket. Redeploy bằng Dokploy và chỉ verify kết nối, không gửi mail hoặc tạo payment thật.

Task 36B phát hiện secret trong lịch sử build artifact `.next-seo-audit` ở commit `917aaf9`; commit `957a622` xóa artifact khỏi cây hiện tại nhưng không xóa khỏi history. Phạm vi gồm cache Turbopack, `.rscinfo` và server-reference manifest. Rotate credential trước. Việc rewrite history, phối hợp clone/fork và xử lý cache của Git hosting phải có xác nhận phạm vi riêng; không tự force-push main.

Lỗi `TLS handshake timeout` tới `registry-1.docker.io` xảy ra trước khi build
ứng dụng. Chạy các lệnh đọc-only sau trên VPS:

```sh
getent hosts registry-1.docker.io
curl -Iv --connect-timeout 10 https://registry-1.docker.io/v2/
docker pull docker/dockerfile:1.7
docker pull node:22-bookworm-slim
docker pull alpine:3.22
docker pull postgres:17-alpine
docker pull nginx:1.29-alpine
docker info
cat /etc/resolv.conf
systemctl status docker --no-pager
journalctl -u docker --since "30 minutes ago" --no-pager
```

HTTP `401 Unauthorized` từ endpoint `/v2/` là dấu hiệu kết nối TLS tới registry
đã hoạt động. Diễn giải kết quả:

- `curl` và `docker pull` cùng timeout: đường outbound/DNS/TLS của VPS có lỗi;
  thay đổi repo không thể tự sửa hạ tầng này.
- `curl` thành công nhưng `docker pull` thất bại: kiểm tra DNS, proxy và kết nối
  registry của Docker daemon.
- Pull thủ công thành công và redeploy thành công: nhiều khả năng sự cố mạng
  VPS/Docker Hub chỉ là tạm thời.
- `docker/dockerfile:1.7` pull được nhưng `node:22-bookworm-slim` không pull được:
  build vẫn phụ thuộc Docker Hub và mạng host vẫn cần được sửa.

Các image Docker Hub bắt buộc hiện tại là `node:22-bookworm-slim`,
`alpine:3.22`, `postgres:17-alpine` và `nginx:1.29-alpine`. Image đã có trong
cache host có thể không cần tải lại, nhưng không được giả định cache tồn tại.
`docker/dockerfile:1.7` không còn là dependency của build repo; lệnh pull ở trên
chỉ dùng để đối chiếu chẩn đoán. Không tắt xác minh TLS, không cấu hình insecure
registry và không đổi sang mirror không tin cậy.

Nếu bằng chứng chỉ ra Docker daemon dùng DNS sai, trước tiên kiểm tra file hiện
có (không in file nếu nó chứa thông tin proxy nhạy cảm):

```sh
sudo test -f /etc/docker/daemon.json && sudo cat /etc/docker/daemon.json
```

Chỉ trong cửa sổ bảo trì, merge khóa `dns` vào JSON hiện hữu thay vì ghi đè các
cấu hình khác, ví dụ `"dns": ["1.1.1.1", "8.8.8.8"]`, rồi xác thực JSON và cấu
hình Docker theo quy trình của host. VPS đang chạy workload production; restart
Docker có thể ảnh hưởng container đang chạy. Không tự động restart Docker. Khi
đã được phê duyệt mới chạy `sudo systemctl restart docker`, rồi lặp lại các lệnh
`docker pull` và redeploy trên Dokploy.
