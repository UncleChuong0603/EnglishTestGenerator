# Task 14 — Admin Foundation, RBAC và quản lý người dùng/gói

## Kiến trúc quyền

`user_roles` lưu lịch sử vai trò. Một partial unique index chỉ cho phép một bản ghi `ADMIN` đang hoạt động trên mỗi user; bản ghi đã revoke được giữ lại. Người học bình thường không cần role row. `src/lib/admin/permissions.ts` ánh xạ role `ADMIN` sang `ADMIN_DASHBOARD_READ`, `USER_READ`, `USER_STATUS_MANAGE`, `PLAN_MANAGE`, và `AUDIT_READ` để có thể thêm role mới về sau mà không đổi cơ chế authorization.

`getCurrentActor`, `hasRole`, và `requireAdmin` là cổng authorization tập trung. Trang admin kiểm tra quyền trước khi đọc dữ liệu; mutation lấy actor từ session phía server và kiểm tra lại role trong transaction. Cookie, email, `role`, `isAdmin`, hoặc `actorUserId` từ client không phải nguồn thẩm quyền.

## Route và chức năng

- `/admin`: tổng user, active, disabled, Free, Premium, user mới 7/30 ngày bằng aggregate/set-based query.
- `/admin/users`: tìm email chuẩn hóa hoặc full name, 20 bản ghi/trang, thứ tự `created_at desc, id asc`; plan dùng correlated `exists`, không N+1.
- `/admin/users/[userId]`: thông tin tài khoản an toàn, effective plan, quota hiện tại, 20 membership gần nhất, tóm tắt học tập và thao tác admin.
- `/admin/audit`: 30 sự kiện/trang, mới nhất trước, hiển thị actor/target/action/time.

Không có password hash, token, OAuth secret, session ID, answer-level history, xóa user, quota reset, payment hoặc CMS.

## Premium và trạng thái tài khoản

Admin UI và CLI gọi chung `grantPremiumWithTx`/`revokePremiumWithTx` của Task 13. Grant nối tiếp expiry đang có nên không rút ngắn quyền; grant vô hạn đang có được giữ nguyên. Revoke chỉ đánh dấu grant active, không xóa history. Usage là read-only và dùng `getUsageStatus`.

Schema hiện có dùng `active`, `disabled`, `pending_verification`; UI gọi `disabled` là suspended. Khi suspend, service đổi trạng thái và revoke toàn bộ session trong cùng transaction với audit. `getCurrentSession`, password login và Google OAuth callback đều đọc trạng thái hiện tại, vì vậy session cũ và cả hai phương thức đăng nhập đều không vượt qua suspension. Admin không thể tự suspend.

## Audit và tính nguyên tử

`admin_audit_logs` chỉ được ghi từ domain service, không có UI sửa/xóa. Các action hợp lệ: `ADMIN_ROLE_GRANTED`, `ADMIN_ROLE_REVOKED`, `USER_SUSPENDED`, `USER_REACTIVATED`, `PREMIUM_GRANTED`, `PREMIUM_REVOKED`. Mutation và audit cùng transaction; no-op/failed mutation không ghi success giả. Metadata chỉ chứa ID, duration, trạng thái trước/sau và nguồn CLI.

## Bootstrap và operator CLI

Sau migration, user phải đăng ký sẵn rồi chạy:

```bash
npm run admin:inspect -- --email admin@example.com
npm run admin:grant -- --email admin@example.com
npm run admin:revoke -- --email admin@example.com
```

CLI normalize email, không tạo user và không in secret. Grant/revoke role dùng advisory transaction lock. Không thể revoke active ADMIN cuối cùng. Task 13 CLI giữ contract:

```bash
npm run plan:inspect -- --email user@example.com
npm run plan:grant -- --email user@example.com --plan PREMIUM --days 30
npm run plan:revoke -- --email user@example.com
```

## Triển khai và rollback

Thứ tự migration: `0008_entitlements_usage` → `0009_admin_rbac`. Không có biến môi trường hoặc secret mới. Chạy `npm run db:migrate`, bootstrap ADMIN, đăng xuất/đăng nhập lại hoặc refresh rồi mở `/admin`.

Rollback ứng dụng có thể deploy lại phiên bản trước mà không ảnh hưởng learner data; hai bảng mới có thể để nguyên. Nếu buộc rollback schema, chỉ drop `admin_audit_logs` và `user_roles` sau khi đã xuất audit cần lưu. Không sửa hoặc rollback migration 0000–0008.

## Checklist thủ công

Tạo hai test user và bootstrap một admin. Xác nhận normal user bị từ chối `/admin`; admin mở được overview, search/pagination/detail. Trên test learner: grant/revoke Premium, suspend rồi xác nhận session/login password và Google bị chặn, reactivate và đăng nhập lại. Kiểm tra mỗi mutation thành công xuất hiện đúng một lần ở Audit. Không suspend admin duy nhất.

## Biên Task 15

Task 14 chỉ dựng nền admin/RBAC/user/plan/audit. Question bank editor, passage editor, upload/media browser và content publishing thuộc Task 15, chưa được triển khai.
