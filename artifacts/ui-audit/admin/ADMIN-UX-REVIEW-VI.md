# Rà soát UX Admin và quyết định sản phẩm: Sự kiện xếp hạng

Ngày rà soát: 20/09/2026. Bằng chứng lấy từ mã nguồn và bộ ảnh fixture trong `ADMIN-UI-INVENTORY.md`; không xác nhận trạng thái dữ liệu production. Thay đổi của lượt này tập trung vào điều hướng, sự kiện, nhật ký và trạng thái tải/lỗi. Các mục còn thiếu được ghi rõ dưới đây.

## 1. Kiểm kê route và công việc

| Route | Công việc quản trị và nguồn dữ liệu | Quyền đọc/truy cập | Tình trạng |
| --- | --- | --- | --- |
| `/admin` | Số người dùng, trạng thái và gói từ `getAdminOverview` | `ADMIN_DASHBOARD_READ` | Có dữ liệu fixture |
| `/admin/users`, `/admin/users/[userId]` | Tìm, xem và quản lý người dùng từ `users`, profile và gói | `USER_READ`; thao tác có quyền riêng | Có dữ liệu fixture |
| `/admin/content` | Mức độ sẵn sàng câu hỏi và full mock từ `getContentOverview` | `CONTENT_READ` | Có dữ liệu fixture |
| `/admin/content/questions`, `/admin/content/questions/[id]` | Tra cứu nhóm/câu hỏi; xem nội dung và trạng thái | `CONTENT_READ` | Có dữ liệu fixture; danh sách chưa bao quát câu standalone Part 5 |
| `/admin/content/new` | Tạo nhóm nội dung nháp | `CONTENT_MANAGE` | Có form |
| `/admin/content/import`, `/admin/content/batches/[batchKey]` | Kiểm tra, nhập và xem lô câu hỏi | `CONTENT_MANAGE` / `CONTENT_READ` | Có luồng; ảnh audit cho thấy trạng thái upload bị vô hiệu |
| `/admin/content/media`, `/admin/content/media/[id]/preview` | Tải lên, xem media và trạng thái | `MEDIA_READ`; upload dùng quyền thao tác | Fixture chưa có media |
| `/admin/content/posts`, `/new`, `/[id]`, `/[id]/preview` | Tạo, sửa, công bố, xem trước bài viết | `CONTENT_READ` / `CONTENT_MANAGE` | Có dữ liệu fixture |
| `/admin/challenges`, `/new`, `/[id]` | Tạo và công bố sự kiện thi có thời hạn | `CHALLENGE_MANAGE` | Fixture chưa có sự kiện; giao diện đã được giải thích lại |
| `/admin/payments` | Tra cứu đơn hàng từ `listAdminPayments` | `ADMIN_DASHBOARD_READ` | Fixture chưa có đơn hàng; hiện chỉ xem |
| `/admin/audit` | Xem nhật ký phân trang từ `admin_audit_logs` | `AUDIT_READ` | Có dữ liệu fixture; đã thêm nhãn dễ đọc |
| `/admin/access-denied` | Thông báo từ chối quyền | Luồng ủy quyền | Có ảnh fixture |
| `loading.tsx`, `error.tsx` | Chờ dữ liệu và thử lại khi lỗi | Theo route cha | Đã thay loading chữ trống bằng skeleton; lỗi không lộ backend |

`Khu học tập` là đường **rời Admin sang dashboard người học**, không phải một nhóm chức năng quản trị. Điều hướng mới đặt nó cạnh bộ chọn EN/VI và ghi rõ “Đến khu học tập”. Các nhóm Admin là Bắt đầu, Học liệu, Người học và Vận hành, chỉ dùng route hiện có. Ở màn hẹp, các nhóm xếp theo cột; không dùng dải điều hướng cuộn ngang.

## 2. Kiến trúc và quyết định về sự kiện

**Phân loại: KEEP — BUT MERGE UNDER “RANKING & EVENTS” về mặt sản phẩm; hiện tên menu là “Sự kiện xếp hạng”.** Đây là tính năng có thật nhưng không bắt buộc cho thời điểm ra mắt bảng tuần. Không xóa schema hoặc dữ liệu.

- Bảng tuần dùng tổng `gamification_events.rank_points_awarded` theo tuần trong `getWeeklyLeaderboard`. Truy vấn này không join `ranked_challenges`. Một số hoàn thành sự kiện có thể tạo gamification event theo cơ chế thưởng hiện tại, nhưng việc tạo sự kiện không phải điều kiện để bảng tuần hoạt động.
- Người học có tab sự kiện ở `/ranking`, chi tiết `/ranking/challenges/[challengeId]`, lượt làm và kết quả riêng. Trang hồ sơ công khai cũng hiện sự kiện đã hoàn thành.
- Schema có `ranked_challenges`, `ranked_challenge_items`, `ranked_challenge_runs`. Loại đề chỉ gồm Reading 100, Listening 100 và Full 200; đề lấy từ học liệu đủ điều kiện bằng `getFullMockReadiness`. Người đăng nhập có một lượt/sự kiện. Điểm là số câu đúng, không phải điểm TOEIC quy đổi.
- Trạng thái lưu trữ là `DRAFT`, `PUBLISHED`, `CANCELLED`. `challengePhase` suy ra Đã lên lịch, Đang diễn ra và Đã kết thúc từ `startsAt`/`endsAt`; không có tác vụ chuyển trạng thái định kỳ. Thời gian hiển thị theo `Asia/Ho_Chi_Minh`.
- Admin tạo nháp, tạo đề, kiểm tra bản xem trước rồi công bố. Backend chỉ cho tạo lại đề khi còn nháp; không có API sửa sự kiện đã công bố. Lượt làm kiểm tra thời hạn và quyền sở hữu. Có guard chống lưu trữ học liệu đang dùng trong sự kiện hoạt động.
- Không có lựa chọn đối tượng tham gia hay Part tùy chỉnh; giao diện không đưa ra những tùy chọn không được backend hỗ trợ. Chưa có chỉnh sửa nháp; nếu cần đổi tiêu đề/lịch phải tạo nháp mới. Đây là hạn chế cần xử lý trước khi vận hành chiến dịch thường xuyên.

**Lý do giữ:** có tích hợp người học và luồng chấm điểm riêng, khác với RP tuần. **Lý do chưa coi là launch critical:** bảng tuần hoạt động độc lập; fixture audit chưa có sự kiện nên chưa xác nhận nhu cầu vận hành thực tế. Chỉ nên tổ chức sự kiện đầu tiên sau khi có đề đủ điều kiện và kiểm tra trên dữ liệu thử.

## 3. Thay đổi giao diện và an toàn

- Danh sách sự kiện giải thích mục đích, quan hệ với bảng tuần, có trạng thái rỗng, giới hạn 100 sự kiện mới nhất, trạng thái người đọc hiểu được và số **kết quả hoàn thành** lấy từ `ranked_challenge_runs`. Đây không phải tổng người đã bắt đầu.
- Form chia thông tin hiển thị, đề/cách chấm và lịch. Giờ nhập được hiểu là GMT+7 và backend từ chối loại/ngày không hợp lệ. Trang chi tiết tóm tắt tiêu đề hai ngôn ngữ, thời gian, thể lệ và số câu từng Part trước khi công bố.
- Công bố có bước đánh dấu đã rà soát; hủy nằm sau phần mở rộng và xác nhận. Các checkbox giúp tránh thao tác nhầm trong trình duyệt; bảo vệ cốt lõi vẫn là `CHALLENGE_MANAGE` và kiểm tra trạng thái/đề ở server. Backend khóa tạo lại đề sau công bố. Không có thao tác sửa sự kiện đang diễn ra.
- Nhật ký giữ action code gốc trong chi tiết, nhưng danh sách hiện nhãn Việt/Anh. Chi tiết chỉ lấy các khóa metadata nằm trong allowlist, không render toàn bộ JSON, secret hoặc token. Cột đối tượng trống được bỏ khỏi danh sách; email/ID đích hiện khi có. Truy vấn vẫn phân trang ở server.
- Admin dùng `LanguageSwitcher` dùng chung với hệ thống. Skeleton áp dụng cho Admin, người dùng và nhật ký; lỗi Admin có nút thử lại và không hiển thị lỗi backend. Liên kết và form có nhãn/focus cơ bản; cần kiểm thử bàn phím và viewport 768/1024/360 thực tế trước khi kết luận đạt WCAG.

## 4. Những điểm còn cần xử lý

1. `listDiscoverableChallenges` lấy toàn bộ sự kiện đã công bố/hủy, chưa phân trang hoặc giới hạn theo thời gian. `getWeeklyLeaderboard` đọc toàn bộ điểm tuần rồi mới cắt top 100 ở ứng dụng. Cần đánh giá tải khi dữ liệu lớn.
2. Trang danh sách Admin chỉ hiện 100 sự kiện mới nhất, chưa có phân trang/lọc; đủ tránh tải vô hạn ở giao diện, chưa đủ cho lịch sử dài. Nhật ký có phân trang nhưng chưa có lọc actor/action/ngày.
3. Màn thanh toán, Media, bài viết và nhập câu hỏi vẫn có chuỗi tiếng Anh/enum kỹ thuật; trạng thái rỗng chưa đồng đều. Dashboard đang thiên về số người dùng/gói, chưa có chỉ báo lỗi vận hành có nguồn dữ liệu xác thực.
4. Chưa có fixture sự kiện, media và thanh toán để kiểm thử thao tác hoàn chỉnh, xem trước sự kiện đang diễn ra/kết thúc, responsive và truy cập bàn phím. Chưa kiểm tra tương tác với backend production.
5. Chưa thêm phần thưởng, coupon, badge, template, analytics mới hay thay đổi cách tính bảng tuần.

## 5. Kiểm tra và hành động người vận hành

Vitest `src/lib/gamification/gamification.test.ts`: 7/7 test đạt. `next build` không hoàn tất do `EPERM` khi xóa tệp `.next/static` trong workspace OneDrive. `npx tsc --noEmit` không còn báo lỗi ở tệp sửa trong lượt này; còn 5 lỗi `PageProps` ở các route luyện tập/try ngoài phạm vi. Ảnh audit trước thay đổi có desktop 1440×1000 và mobile 390×844; chưa có ảnh sau thay đổi ở 768/1024. Chủ sản phẩm cần quyết định có chiến dịch đầu tiên hay không, chuẩn bị ngân hàng câu hỏi đủ điều kiện, kiểm tra sự kiện trên môi trường thử và xác nhận nội dung/tên/lịch trước khi công bố. Không cần tạo sự kiện để vận hành bảng xếp hạng tuần.
