# Kiểm kê giao diện Admin hiện tại

Chụp từ database test cục bộ `127.0.0.1:15433/toeicgym_task17` với tài khoản fixture. Không dùng dữ liệu production. Viewport: desktop 1440×1000, mobile 390×844.

| Route | Màn hình | Trạng thái | Desktop | Mobile | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| `/admin` | Tổng quan | populated | [PNG](desktop/dashboard-tong-quan-populated-desktop.png) | [PNG](mobile/dashboard-tong-quan-populated-mobile.png) |  |
| `/admin/users` | Danh sách người dùng | populated | [PNG](desktop/users-danh-sach-nguoi-dung-populated-desktop.png) | [PNG](mobile/users-danh-sach-nguoi-dung-populated-mobile.png) |  |
| `/admin/users?q=khong-co-fixture%40invalid` | Tìm kiếm người dùng | empty search | [PNG](desktop/users-tim-kiem-nguoi-dung-empty-search-desktop.png) | [PNG](mobile/users-tim-kiem-nguoi-dung-empty-search-mobile.png) |  |
| `/admin/users/1ecca1ca-e266-4d1e-a4ad-94893a09ac63` | Chi tiết Free | FREE | [PNG](desktop/users-chi-tiet-free-free-desktop.png) | [PNG](mobile/users-chi-tiet-free-free-mobile.png) |  |
| `/admin/users/40aa7140-b0e0-435e-bc0a-cc4143f64643` | Chi tiết Premium | PREMIUM | [PNG](desktop/users-chi-tiet-premium-premium-desktop.png) | [PNG](mobile/users-chi-tiet-premium-premium-mobile.png) |  |
| `/admin/users/5c147abe-9748-4192-8739-576771ba0189` | Chi tiết Admin | ADMIN/self action | [PNG](desktop/users-chi-tiet-admin-admin-self-action-desktop.png) | [PNG](mobile/users-chi-tiet-admin-admin-self-action-mobile.png) |  |
| `/admin/content` | Tổng quan nội dung | populated | [PNG](desktop/content-tong-quan-noi-dung-populated-desktop.png) | [PNG](mobile/content-tong-quan-noi-dung-populated-mobile.png) |  |
| `/admin/content/questions` | Câu hỏi và nhóm | populated | [PNG](desktop/content-cau-hoi-va-nhom-populated-desktop.png) | [PNG](mobile/content-cau-hoi-va-nhom-populated-mobile.png) |  |
| `/admin/content/questions?part=7` | Lọc Part 7 | filtered | [PNG](desktop/content-loc-part-7-filtered-desktop.png) | [PNG](mobile/content-loc-part-7-filtered-mobile.png) |  |
| `/admin/content/questions?search=khong-co-fixture` | Tìm câu hỏi | empty search | [PNG](desktop/content-tim-cau-hoi-empty-search-desktop.png) | [PNG](mobile/content-tim-cau-hoi-empty-search-mobile.png) |  |
| `/admin/content/new` | Tạo nhóm Draft | create form | [PNG](desktop/content-tao-nhom-draft-create-form-desktop.png) | [PNG](mobile/content-tao-nhom-draft-create-form-mobile.png) |  |
| `/admin/content/import` | Nhập câu hỏi | disabled upload action | [PNG](desktop/content-nhap-cau-hoi-disabled-upload-action-desktop.png) | [PNG](mobile/content-nhap-cau-hoi-disabled-upload-action-mobile.png) |  |
| `/admin/content/media` | Media và tải lên | empty | [PNG](desktop/media-media-va-tai-len-empty-desktop.png) | [PNG](mobile/media-media-va-tai-len-empty-mobile.png) |  |
| `/admin/content/posts` | Danh sách bài viết | populated | [PNG](desktop/posts-danh-sach-bai-viet-populated-desktop.png) | [PNG](mobile/posts-danh-sach-bai-viet-populated-mobile.png) |  |
| `/admin/content/posts/new` | Tạo bài viết | create form | [PNG](desktop/posts-tao-bai-viet-create-form-desktop.png) | [PNG](mobile/posts-tao-bai-viet-create-form-mobile.png) |  |
| `/admin/challenges` | Danh sách thử thách | empty | [PNG](desktop/challenges-danh-sach-thu-thach-empty-desktop.png) | [PNG](mobile/challenges-danh-sach-thu-thach-empty-mobile.png) |  |
| `/admin/challenges/new` | Tạo thử thách | create form | [PNG](desktop/challenges-tao-thu-thach-create-form-desktop.png) | [PNG](mobile/challenges-tao-thu-thach-create-form-mobile.png) |  |
| `/admin/payments` | Lịch sử thanh toán | empty | [PNG](desktop/payments-lich-su-thanh-toan-empty-desktop.png) | [PNG](mobile/payments-lich-su-thanh-toan-empty-mobile.png) |  |
| `/admin/audit` | Nhật ký quản trị | current data | [PNG](desktop/audit-nhat-ky-quan-tri-current-data-desktop.png) | [PNG](mobile/audit-nhat-ky-quan-tri-current-data-mobile.png) |  |
| `/admin/access-denied` | Từ chối truy cập | direct route | [PNG](desktop/states-tu-choi-truy-cap-direct-route-desktop.png) | [PNG](mobile/states-tu-choi-truy-cap-direct-route-mobile.png) |  |
| `/admin/content/questions/b3e6cf27-0042-493a-89a7-7f7155f93a43` | Chi tiết nhóm Part 1 | draft | [PNG](desktop/content-chi-tiet-nhom-part-1-draft-desktop.png) | [PNG](mobile/content-chi-tiet-nhom-part-1-draft-mobile.png) |  |
| `/admin/content/questions/7b2c7505-c337-4eea-94b0-04f492c03c03` | Chi tiết nhóm Part 2 | draft | [PNG](desktop/content-chi-tiet-nhom-part-2-draft-desktop.png) | [PNG](mobile/content-chi-tiet-nhom-part-2-draft-mobile.png) |  |
| `/admin/content/questions/5d0e53c9-4eb1-4e20-ae19-ab9ce9cdac1c` | Chi tiết nhóm Part 3 | draft | [PNG](desktop/content-chi-tiet-nhom-part-3-draft-desktop.png) | [PNG](mobile/content-chi-tiet-nhom-part-3-draft-mobile.png) |  |
| `/admin/content/questions/7930e960-8205-41f7-a867-105527e08b53` | Chi tiết nhóm Part 4 | draft | [PNG](desktop/content-chi-tiet-nhom-part-4-draft-desktop.png) | [PNG](mobile/content-chi-tiet-nhom-part-4-draft-mobile.png) |  |
| `/admin/content/questions/878e9306-f362-4938-bf29-090046e4f4b4` | Chi tiết nhóm Part 5 | draft | [PNG](desktop/content-chi-tiet-nhom-part-5-draft-desktop.png) | [PNG](mobile/content-chi-tiet-nhom-part-5-draft-mobile.png) |  |
| `/admin/content/questions/0a8c3cc9-4e89-5a54-b8dd-795cf4e85285` | Chi tiết nhóm Part 6 | published | [PNG](desktop/content-chi-tiet-nhom-part-6-published-desktop.png) | [PNG](mobile/content-chi-tiet-nhom-part-6-published-mobile.png) |  |
| `/admin/content/questions/128cfce1-536e-5509-a7fc-d4859e4c6c8d` | Chi tiết nhóm Part 7 | published | [PNG](desktop/content-chi-tiet-nhom-part-7-published-desktop.png) | [PNG](mobile/content-chi-tiet-nhom-part-7-published-mobile.png) |  |
| `/admin/content/questions/276abd84-ee48-5f29-b161-c19d3df73d79` | Chi tiết Part 7 double | published | [PNG](desktop/content-chi-tiet-part-7-double-published-desktop.png) | [PNG](mobile/content-chi-tiet-part-7-double-published-mobile.png) |  |
| `/admin/content/questions/1b9587fa-4f3e-52c1-b5bb-a2e498c13c7c` | Chi tiết Part 7 triple | published | [PNG](desktop/content-chi-tiet-part-7-triple-published-desktop.png) | [PNG](mobile/content-chi-tiet-part-7-triple-published-mobile.png) |  |
| `/admin/content/posts/674e0e68-c809-4915-b553-ac3df905d4ae` | Sửa bài viết | PUBLISHED | [PNG](desktop/posts-sua-bai-viet-published-desktop.png) | [PNG](mobile/posts-sua-bai-viet-published-mobile.png) |  |
| `/admin/content/posts/674e0e68-c809-4915-b553-ac3df905d4ae/preview` | Xem trước bài viết | PUBLISHED | [PNG](desktop/posts-xem-truoc-bai-viet-published-desktop.png) | [PNG](mobile/posts-xem-truoc-bai-viet-published-mobile.png) |  |

## Giới hạn dữ liệu và route

- Database hiện không có media, payment order hay ranked challenge. Trang danh sách tương ứng được chụp ở trạng thái rỗng; route chi tiết challenge và media preview không có ID hợp lệ để render.
- Không có route Admin riêng cho role/permission, passage, stimulus, option, solution, billing entitlement, system settings. Các thông tin này nằm trong trang người dùng hoặc chi tiết nhóm câu hỏi khi có.
- Part 5 trong dữ liệu có thể là câu hỏi standalone; danh sách Admin chỉ liệt kê `passage_sets`, nên không thể mở từng câu standalone từ danh sách này.
- Giao diện Admin dùng header và hàng liên kết có wrap trên màn hình hẹp; không có sidebar hoặc menu collapse. Một số bảng có `min-width` và vùng cuộn ngang. Form tạo Challenge không hiển thị AdminNav.
- Kiểm tra ảnh mobile câu hỏi/nhóm: bảng nội dung chỉ hiện cột đầu trong khung cuộn ngang; trạng thái, nguồn và số câu không nhìn thấy đồng thời. Header không có chỉ báo route đang chọn. Trang chi tiết nhóm lấy dữ liệu media nhưng không hiển thị association media trong JSX hiện tại.
- Chưa có fixture an toàn cho media READY/unready, payment history và ranked challenge; vì vậy chưa thể kiểm toán các trạng thái này. Chưa chụp xác nhận hành động phá hủy, validation tương tác hoặc feedback thành công/thất bại; các trạng thái này cần lượt audit riêng với fixture reset được.
- Không thực hiện hành động ghi nội dung, upload, cấp quyền, suspend, thanh toán hay đổi trạng thái.

## Tái tạo

Chạy `node --env-file=.env.local node_modules/@playwright/test/cli.js test e2e/admin-ui-audit.spec.ts --config=playwright.ui-screenshots.config.ts` sau khi chuẩn bị database test cục bộ bằng fixture hiện có. Test từ chối kết nối database khác địa chỉ, cổng, tên database và user test nêu trên. Session được tạo trong database test qua cơ chế session hiện có.
