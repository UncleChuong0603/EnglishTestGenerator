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
