# TOEIC GYM: review UI/UX admin trên bản live — 23/09/2026

## Phạm vi

- Đã cấp quyền `ADMIN` cho `lovetobangbang@gmail.com` trên production; xác minh tài khoản active và quyền có hiệu lực. Bản ghi `ADMIN_ROLE_GRANTED` đã được ghi vào audit. Không đổi mật khẩu hay các phiên đăng nhập sẵn có.
- Tạo một phiên admin tạm thời 45 phút để kiểm tra trực tiếp, rồi thu hồi ngay sau khi xong. Không sửa học liệu, người dùng, thanh toán hay cài đặt production.
- Mở **14 tuyến admin chính** trên Edge ở kích thước 1440 × 900 và 390 × 844; mở thêm chi tiết một nhóm câu hỏi, một người dùng và một đơn hàng trên mobile. Tất cả các màn được mở đều hiển thị nội dung admin, không báo lỗi JavaScript.
- Đã kiểm tra 21 URL công khai từ sitemap ở vòng review trước; xem [review public](ux-review-live-2026-09-23.md). Báo cáo này tập trung vào admin.

## Kết quả theo khu vực

| Khu vực | URL đã mở | Kết quả |
| --- | --- | --- |
| Tổng quan | `/admin`, `/admin/analytics` | Mở được trên desktop/mobile. Dashboard có hàng chờ, chỉ số và lối vào tác vụ. Analytics mobile dài khoảng 6.174 px. |
| Học liệu | `/admin/content`, `/admin/content/questions`, `/admin/content/similarity`, `/admin/content/media`, `/admin/content/import`, `/admin/content/posts` | Mở được. Bảng câu hỏi cuộn trong khung trên mobile; trang Media làm tràn toàn trang ở 390 px. |
| Người học | `/admin/users`, `/admin/support` | Mở được. Trang Users mobile dài khoảng 5.302 px; mục tìm kiếm nằm sau khối chỉ số. Support hiện không có ticket để thử luồng xử lý. |
| Vận hành | `/admin/challenges`, `/admin/payments`, `/admin/audit`, `/admin/settings` | Mở được. Challenges hiện không có sự kiện; đã mở chi tiết một đơn hàng. Audit có nhiều bản ghi và không có bộ lọc. |
| Chi tiết | `/admin/content/questions/[id]`, `/admin/users/[userId]`, `/admin/payments/[id]` | Cả ba mở được trên mobile. Trang chi tiết câu hỏi có thanh tác vụ cố định dưới màn hình; tiêu đề dạng slug dài bị ngắt nhiều dòng. |

## Phát hiện và đề xuất

| Ưu tiên | Phát hiện có bằng chứng | Tác động | Đề xuất và tiêu chí hoàn thành |
| --- | --- | --- | --- |
| **P1** | `/admin/content/media` có **632 media** trên production, nhưng code chỉ lấy **20 mục/trang**; UI không có nút Trước/Sau hoặc tìm kiếm. | Admin không thể duyệt phần lớn media qua giao diện thông thường. | Thêm phân trang, tổng số trang và tìm kiếm ID/loại/trạng thái/tham chiếu. Từ UI mở được cả mục ở trang cuối mà không sửa URL. |
| **P1** | Trang Media ở 390 px có `scrollWidth = 432 px`. File picker đẩy qua mép phải; bảng dùng cuộn riêng nhưng form upload không co theo màn hình. | Trang bị kéo ngang, thao tác chọn tệp khó trên điện thoại. | Giới hạn chiều rộng input tệp trong form, kiểm tra bảng cuộn trong khung; `documentElement.scrollWidth <= 390` ở màn 390 px. |
| **P1** | `/admin/users` mobile dài khoảng **5.302 px**; bốn thẻ thống kê và khối retention đứng trước nút mở bộ lọc/tìm kiếm. | Khi xử lý yêu cầu cụ thể, admin phải cuộn qua phần tổng quan mới tra cứu được tài khoản. | Đưa tìm kiếm nhanh lên ngay dưới tiêu đề, chuyển thống kê/retention xuống sau danh sách hoặc panel thu gọn. Từ đầu trang tìm được email trong một thao tác. |
| **P1** | Khi chưa đăng nhập, mở sâu `/admin/users` hoặc `/admin/analytics` chuyển về `/sign-in?next=/admin`. Mã nguồn `requireAdmin()` đặt cứng đường về này. | Sau đăng nhập, admin mất trang chi tiết đang định mở. | Giữ deep link ban đầu qua đăng nhập bằng đường dẫn nội bộ đã kiểm tra an toàn; quay đúng URL và bộ lọc. |
| **P2** | `/admin/analytics` dài khoảng **6.174 px** trên mobile; các chỉ số xếp một cột và phải cuộn lâu để tới retention, phễu và Premium. | Khó quét tình hình để quyết định ưu tiên trong ngày. | Tạo mục lục nhanh hoặc tab theo chủ đề, gộp các KPI ngắn thành lưới hai cột phù hợp 390 px, giữ định nghĩa chỉ số gần biểu đồ. |
| **P2** | `/admin/audit` dài gần **5.000 px** trên mobile trong lần xem, có phân trang nhưng không lọc theo hành động, người thao tác, đối tượng hoặc ngày. | Truy nguyên một thay đổi cụ thể tốn nhiều lần cuộn/chuyển trang. | Thêm bộ lọc và liên kết từ chi tiết người dùng/đơn hàng đến audit liên quan. |
| **P2** | `/admin/content/questions` hiển thị **2.045 câu / 1.055 nhóm**. Bảng trên mobile cuộn trong khung và chỉ thấy vài cột đầu; thao tác Review ở cột cuối khó nhận ra. | Admin có thể bỏ qua trạng thái hoặc thao tác chính của hàng. | Dùng thẻ tóm tắt trên mobile hoặc giữ cột tên + Review cố định, báo hiệu bảng còn nội dung bên phải. |
| **P2** | Trang chi tiết câu hỏi dùng tiêu đề dạng slug như `TOEICGym Part 5 p5x-...`, ngắt thành nhiều dòng trên mobile; thanh cố định có các nút tiếng Anh `Previous`, `Archive`, `Clone as Draft`. | Giảm khả năng quét hàng chờ và làm giao diện VI/EN thiếu nhất quán. | Hiển thị tiêu đề biên tập ngắn, đưa ID/slug vào dòng phụ có thể sao chép; dịch nhãn theo ngôn ngữ chọn. |
| **P2** | `/admin/support` hiện **0 ticket**, nên chưa kiểm chứng trực tiếp tải danh sách lớn. Code chỉ lấy tối đa **100 ticket/trạng thái** và không phân trang. | Khi lượng ticket tăng, ticket cũ có thể biến mất khỏi giao diện. | Thêm phân trang, tìm theo email/chủ đề/ID và lọc quá hạn; kiểm thử với hơn 100 ticket cùng trạng thái. |
| **P3** | Nhiều nhãn vẫn pha Việt/Anh, ví dụ `Question Bank Import`, `Upload media`, `Review queue`, `7 days`. | Admin phải đổi ngữ cảnh ngôn ngữ khi thao tác. | Hoàn thiện từ điển VI/EN cho tiêu đề, nút, trạng thái rỗng và thông báo lỗi. |

## Điểm đang làm tốt

- Điều hướng admin chia bốn nhóm rõ ràng; tab hiện tại có trạng thái nổi bật trên desktop và mobile.
- Dashboard đưa công việc chờ xử lý lên trước các chỉ số. Trang chi tiết thanh toán tách thông tin đơn hàng, quyền Premium và sự kiện xử lý.
- Các trang đã mở không có lỗi JavaScript trong lượt kiểm tra; đa số trang không làm tràn toàn màn hình ở 390 px.

## Giới hạn kiểm thử

- Chỉ thao tác đọc; chưa thử upload, xuất bản, đổi trạng thái ticket, cấp/thu hồi Premium hay chỉnh cài đặt production.
- Support không có ticket và Challenges không có sự kiện, nên các màn chi tiết và luồng xử lý của hai khu vực này chưa được xác nhận bằng dữ liệu thật.
- Không dùng ảnh chụp màn hình trong báo cáo vì ảnh admin có thể chứa dữ liệu cá nhân hoặc giao dịch.

## Thứ tự thực hiện

1. Hoàn thiện Media: phân trang/tìm kiếm và sửa tràn ngang mobile.
2. Đưa tìm kiếm người dùng lên đầu trang, giữ deep link admin qua đăng nhập.
3. Rút ngắn đường đi tới thông tin Analytics/Audit và cải thiện bảng câu hỏi trên mobile.
4. Đồng bộ ngôn ngữ và thử lại Support/Challenges bằng dữ liệu kiểm thử cô lập.
