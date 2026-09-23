# Review UI/UX TOEIC GYM trên bản live — 23/09/2026

## Phạm vi và cách kiểm tra

- Vai người học mới, chưa đăng nhập; trình duyệt Edge, màn hình 390 × 844 và 1440 × 900.
- Đã mở toàn bộ 21 URL trong [sitemap live](https://toeicgym.net/sitemap.xml): 14 trang công khai và 7 bài blog. Đã mở thêm các trang đăng nhập, đăng ký, khôi phục tài khoản, thử thách, thanh toán và các đường dẫn khu vực học viên.
- Đã bấm bắt đầu thử thách Part 5, đánh giá đầu vào, bài thử Listening và Reading; thử tìm kiếm blog, quiz Word Form, liên kết mua gói. Không tạo tài khoản, thanh toán hay gửi yêu cầu hỗ trợ.
- Các trang học viên và admin yêu cầu tài khoản nên chưa đánh giá được giao diện sau đăng nhập. Một số lần tải liên tiếp bị HTTP 429; các URL công khai đã được mở lại thành công, vì vậy 429 không được tính là lỗi UX trong báo cáo này.

## Các URL trong sitemap

| Nhóm | URL đã kiểm tra | Kết quả |
| --- | --- | --- |
| Bắt đầu | [/](https://toeicgym.net/), [/try](https://toeicgym.net/try), [/diagnostic](https://toeicgym.net/diagnostic), [/pricing](https://toeicgym.net/pricing) | Tải được; vấn đề nằm ở các bước bắt đầu và thông tin chưa nhất quán. |
| Kiến thức | [/toeic](https://toeicgym.net/toeic), [/luyen-thi-toeic-online](https://toeicgym.net/luyen-thi-toeic-online), [/toeic/part-5](https://toeicgym.net/toeic/part-5), [/toeic/part-5/word-form](https://toeicgym.net/toeic/part-5/word-form), [/toeic/part-6](https://toeicgym.net/toeic/part-6), [/toeic/part-7](https://toeicgym.net/toeic/part-7) | Tải được; quiz Word Form có vấn đề khi kiểm tra lúc chưa chọn đáp án. |
| Blog và hỗ trợ | [/blog](https://toeicgym.net/blog), [/support](https://toeicgym.net/support), [/privacy](https://toeicgym.net/privacy), [/terms](https://toeicgym.net/terms) | Tải được; tìm kiếm blog có trạng thái không kết quả rõ ràng. |
| Bài viết | [/blog/chien-luoc-tang-diem-toeic-450-den-700](https://toeicgym.net/blog/chien-luoc-tang-diem-toeic-450-den-700), [/blog/cach-luyen-nghe-toeic-part-3-4](https://toeicgym.net/blog/cach-luyen-nghe-toeic-part-3-4), [/blog/quan-ly-thoi-gian-toeic-reading-75-phut](https://toeicgym.net/blog/quan-ly-thoi-gian-toeic-reading-75-phut), [/blog/ngu-phap-toeic-part-5-can-hoc](https://toeicgym.net/blog/ngu-phap-toeic-part-5-can-hoc), [/blog/tu-vung-toeic-theo-chu-de-cong-so](https://toeicgym.net/blog/tu-vung-toeic-theo-chu-de-cong-so), [/blog/lo-trinh-hoc-toeic-30-ngay-cho-nguoi-ban-ron](https://toeicgym.net/blog/lo-trinh-hoc-toeic-30-ngay-cho-nguoi-ban-ron), [/blog/kinh-nghiem-thi-toeic-ngay-thi](https://toeicgym.net/blog/kinh-nghiem-thi-toeic-ngay-thi) | Cả 7 bài tải HTTP 200 trên mobile; ảnh đầu bài tải được và có văn bản thay thế. |

## Vấn đề và đề xuất nâng cấp

| Ưu tiên | Quan sát trên bản live | Tác động đối với người học | Đề xuất và tiêu chí hoàn thành |
| --- | --- | --- | --- |
| **P0** | Từ [/challenge/part-5](https://toeicgym.net/challenge/part-5), bấm **Bắt đầu ngay** ở hai phiên trình duyệt mới đều tạo URL bài làm rồi hiện **“Đã xảy ra lỗi”**. Từ [/try](https://toeicgym.net/try), bấm **Bắt đầu ngay** tại bài thử Reading cũng cho cùng màn lỗi. | Hai cửa vào bài luyện miễn phí bị chặn ngay sau thao tác chính. | Sửa lỗi ở màn bài làm hoặc dữ liệu phiên; kiểm tra đầu đến cuối: bắt đầu → trả lời → nộp → xem kết quả trên desktop/mobile, với người chưa đăng nhập. Gắn mã sự cố và nút quay về lựa chọn bài khi lỗi vẫn xảy ra. |
| **P0** | Bài thử Listening từ [/try](https://toeicgym.net/try) mở được, nhưng câu hỏi hiển thị `What will the man ask ${b} to do?`; lựa chọn có chuỗi như `Restaurant reservation 45`, `Equipment 45 is broken`. | Nội dung trông như dữ liệu mẫu chưa hoàn thiện, có thể khiến người học chọn sai hoặc mất niềm tin vào lời giải. | Rà soát toàn bộ câu hỏi đang xuất bản để chặn ký hiệu mẫu `${...}`, số thứ tự thừa và đáp án vô nghĩa. Kiểm tra bước tạo/nhập dữ liệu trước khi xuất bản; thay hoặc ẩn các câu bị ảnh hưởng. Một bài thử mới không còn câu chứa ký hiệu mẫu. |
| **P1** | Trên [/pricing](https://toeicgym.net/pricing), chọn gói 30 ngày dẫn tới trang đăng nhập, nhưng URL cuối là `/sign-in` không giữ gói đã chọn. Mã hiện tại cũng chuyển người chưa đăng nhập từ trang xác nhận về `/sign-in` rồi đăng nhập mặc định về `/dashboard`. | Người mua phải tự quay lại bảng giá và chọn gói lần nữa. | Giữ đường dẫn `/billing/confirm?product=...` an toàn qua đăng nhập, đăng ký và xác minh email; sau đăng nhập quay đúng trang xác nhận gói. |
| **P1** | Trang chủ có **“Thử thách Part 5 miễn phí”** dẫn đến bài 10 câu, thanh điều hướng có **“Đánh giá miễn phí”** dẫn tới [/try](https://toeicgym.net/try), rồi [/diagnostic](https://toeicgym.net/diagnostic) mới bắt đầu đánh giá. `/try` ghi “khoảng 24 câu”; phiên đánh giá đã mở ghi 29 câu, còn trang diagnostic ghi 25–35 câu. | Người mới khó phân biệt thử thách, bài thử ngắn và đánh giá đầu vào; thời lượng dự kiến thiếu nhất quán. | Dùng ba tên cố định kèm số câu và thời gian: “Thử thách Part 5 · 10 câu”, “Bài thử nhanh · 9–10 câu”, “Đánh giá đầu vào · 25–35 câu”. Nêu rõ mỗi lựa chọn cho kết quả gì và cập nhật số câu từ cấu hình thực tế. |
| **P2** | Tại [/toeic/part-5/word-form](https://toeicgym.net/toeic/part-5/word-form), bấm **Kiểm tra đáp án** khi chưa chọn câu nào vẫn hiển thị **“Bạn đúng 0/5 câu”** và công bố đáp án/giải thích. | Người học thấy kết quả như đã hoàn thành, đồng thời mất cơ hội tự làm bài. | Yêu cầu trả lời đủ hoặc hiển thị rõ câu chưa trả lời trước khi chấm. Chỉ công bố lời giải khi người học chủ động nộp bài; kiểm tra trạng thái chọn một phần và sửa đáp án. |
| **P2** | Khi bài làm lỗi, màn hình chỉ có nút **Thử lại** và thông điệp chung; không có lối quay lại bài khác hoặc thông tin để báo hỗ trợ. | Người học mắc kẹt, nhất là sau khi đã bắt đầu phiên. | Thêm “Quay về bài thử”, “Bắt đầu phiên mới” nếu an toàn, và mã lỗi để gửi hỗ trợ; ưu tiên khôi phục phiên đang làm thay vì bắt đầu lại. |
| **P3** | Mobile blog có thanh danh mục cuộn ngang và trang danh sách dài. Bố cục đẹp nhưng dấu hiệu có thêm danh mục ở bên phải khá kín đáo. | Khám phá nội dung trên màn nhỏ cần nhiều thao tác cuộn. | Thêm chỉ dấu cuộn hoặc nút “Chủ đề”, giữ tìm kiếm dễ thấy; kiểm tra xem người học có tìm được bài theo mục tiêu trong một vài thao tác. |

## Điểm đang làm tốt

- Phần lớn trang công khai mở được, không thấy tràn ngang khi CSS đã tải xong ở 390 px; điều hướng mobile và nút chính đủ lớn để chạm.
- Trang đánh giá nói rõ kết quả không phải điểm TOEIC chính thức, cho biết có thể tiếp tục trong 7 ngày, và phiên đánh giá thực sự mở được.
- Bảng giá trình bày Free/Premium, giá theo kỳ hạn và quyền lợi tương đối rõ; blog có lọc chủ đề, tìm kiếm và trạng thái không tìm thấy bài.
- Đăng nhập/đăng ký trên mobile có nhãn trường, hiện mật khẩu và liên kết khôi phục; form hỗ trợ có mục loại vấn đề và trường URL trang gặp lỗi.

## Thứ tự thực hiện đề xuất

1. Khôi phục hai luồng bài luyện hỏng và kiểm định ngân hàng câu hỏi đang xuất bản.
2. Thử toàn bộ hành trình người mới từ trang chủ đến kết quả và từ bảng giá qua đăng nhập đến xác nhận gói.
3. Chuẩn hóa tên gọi, số câu, thời gian giữa các trang; cải thiện xử lý lỗi và quiz Word Form.
4. Tối ưu khám phá bài viết trên mobile, rồi đánh giá tiếp khu vực học viên/admin bằng tài khoản thử.
