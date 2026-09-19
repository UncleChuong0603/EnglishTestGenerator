# Task 20 — Local VPS media storage

## Kiến trúc

`MediaStorage` vẫn là ranh giới duy nhất của nghiệp vụ. `MEDIA_STORAGE_PROVIDER` chọn `LOCAL` hoặc `R2`; database chỉ lưu khóa logic. Với LOCAL, ứng dụng ghi atomically vào volume `toeicgym_media_data`. Nginx chỉ mount volume dạng read-only. Traefik chỉ đưa `/api/media/local` tới Nginx; Nginx gọi Next.js để xác thực HMAC và thời hạn, sau đó xử lý `X-Accel-Redirect`. `/protected-media/` là location `internal`, hỗ trợ Range của Nginx và không có router công khai độc lập.

URL được ký có hạn 60–3600 giây. Response xác thực dùng `private, no-store`; nội dung sau redirect dùng private cache một giờ. Không dùng shared-cache cho Listening hoặc media riêng. Blog cover hiện cũng dùng URL có hạn để giữ một cơ chế bảo vệ thống nhất.

Tự lưu media chuyển chi phí và trách nhiệm bandwidth sang VPS, và không loại bỏ rủi ro DDoS. Cloudflare/Traefik có thể tiếp tục bảo vệ lớp ngoài. Upload giới hạn 15 MB audio MP3 và 5 MB ảnh JPEG/PNG/WebP, kiểm tra magic bytes và không dùng tên file của người dùng làm khóa.

## Kiểm tra vận hành

```sh
docker compose -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run media:preflight
docker compose -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run media:status
```

Các lệnh chỉ in trạng thái cấu hình, quyền đọc/ghi, số file, dung lượng dùng và dung lượng trống; không in secret hay credentials.

## Cutover R2 sang LOCAL

1. Deploy code hỗ trợ cả hai provider và migration `0020`; giữ `MEDIA_STORAGE_PROVIDER=R2`.
2. Tạo volume `toeicgym_media_data`, chạy `npm run media:preflight` trong app với cấu hình LOCAL dự kiến.
3. Backup PostgreSQL và R2; không xóa object R2.
4. Chạy `docker compose -f docker-compose.dokploy.yml --profile tools run --rm db-tools npm run media:migrate-to-local -- --dry-run`.
5. Chạy lại với `--execute`; lệnh kiểm size và SHA-256, bỏ qua file local đã có và có thể chạy lại.
6. Chạy lại dry run/status, rồi đặt `MEDIA_STORAGE_PROVIDER=LOCAL`, `LOCAL_MEDIA_ROOT=/var/lib/toeicgym/media`, `MEDIA_SIGNING_SECRET` ngẫu nhiên ít nhất 32 ký tự và redeploy.
7. Smoke test Admin upload/preview, Listening P1–P4, Practice khách/đăng nhập, Diagnostic, Full Mock và blog cover. Theo dõi 403/404, dung lượng và bandwidth.

## Rollback

Đặt `MEDIA_STORAGE_PROVIDER=R2`, giữ nguyên credentials R2, rồi redeploy và smoke test. Migration không xóa object R2 hoặc đổi storage key nên rollback vẫn dùng cùng media identity.

## Backup và restore

Volume cần backup là `toeicgym_media_data` (`/var/lib/toeicgym/media` trong app). Dừng thao tác upload hoặc đưa ứng dụng vào maintenance ngắn, sau đó archive volume từ container tạm:

```sh
docker run --rm -v toeicgym_media_data:/data:ro -v "$PWD":/backup alpine tar -C /data -czf /backup/toeicgym-media.tgz .
```

Restore vào volume trống/được kiểm soát, giữ owner UID/GID `1001` cho app và quyền thư mục `0755`, file `0644`; volume của Nginx vẫn là read-only và không được route trực tiếp. Khôi phục DB và media từ cùng mốc backup, chạy preflight/status rồi smoke test trước khi mở traffic.
