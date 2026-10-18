# Audit SEO từ Google Search Console — 18/10/2026

## Phạm vi và giới hạn dữ liệu

Nguồn là file xuất **Hiệu suất trên Tìm kiếm** ngày 18/10/2026, bộ lọc Web trong 3 tháng. File thực tế có dữ liệu theo ngày từ 20/09 đến 16/10/2026. Các bảng truy vấn và trang được xuất riêng, nên không thể ghép chính xác từng truy vấn với từng URL; các cặp bên dưới là suy luận từ slug, chủ đề và vị trí gần nhau.

Report này không có dữ liệu Indexing, Core Web Vitals, backlink hoặc conversion. Vì vậy, kết luận tập trung vào mức hiển thị, CTR, vị trí, search intent và kiểm tra kỹ thuật trực tiếp trên website.

## Tóm tắt điều hành

- 19 click / 586 impression, CTR toàn site **3,24%**.
- 7 ngày đầu có 16 impression; 7 ngày cuối có 431 impression, tăng **2.594%**. Website đang ở giai đoạn Google mở rộng thử nghiệm truy vấn, nên ưu tiên củng cố các URL đã có tín hiệu thay vì xuất bản hàng loạt chủ đề mới.
- Mobile tạo 15 click / 266 impression, CTR **5,64%**, vị trí trung bình 8,03. Desktop có 4 click / 315 impression, CTR **1,27%**, vị trí 20,68. Cần theo dõi desktop riêng nhưng chưa đủ dữ liệu để kết luận do mix truy vấn khác nhau.
- Trang chủ hoạt động tốt với 7 click / 15 impression, CTR 46,67%, vị trí 1,73.
- Cơ hội lớn nhất nằm ở bài kết quả thi TOEIC và cụm ngữ pháp said/told.

## Cơ hội theo ưu tiên

| Ưu tiên | URL / cụm | Dữ liệu | Chẩn đoán | Hành động |
| --- | --- | --- | --- | --- |
| P0 | `/blog/thi-toeic-bao-lau-co-ket-qua` | 171 impression, 6 click, CTR 3,51%, vị trí 8,44 | Đã ở trang 1 nhưng snippet chưa đưa câu trả lời định lượng lên trước; quiz đứng trước nội dung trả lời | Đưa mốc 5–21 ngày vào title/meta/H1, trả lời bằng danh sách ngắn đầu bài, chuyển quiz xuống sau nội dung |
| P0 | `/blog/cau-tuong-thuat-tieng-anh-said-told-asked` | 62 impression, 0 click, vị trí 10,15 | Title rộng hơn ý định thực tế: “said/told khác nhau” và “told to V hay V-ing” | Viết lại title/meta/H1 theo đúng câu hỏi; thêm câu trả lời trực tiếp và ví dụ |
| P1 | `/blog/cach-phat-am-s-es-tieng-anh` | 38 impression, CTR 2,63%, vị trí 17,03 | Có tín hiệu nhưng còn ở trang 2 | Tăng internal link từ hub Listening và các bài âm cuối; theo dõi thêm trước khi đổi title |
| P1 | `/blog/cach-phat-am-ed-tieng-anh` | 34 impression, CTR 2,94%, vị trí 15,18 | Tương tự s/es | Củng cố cụm pronunciation và tiếp tục đo |
| P1 | `/blog/cau-tuong-thuat...`, danh từ, email, lịch thi, mệnh đề thời gian | vị trí 6,77–10,15 nhưng CTR 0% trên mẫu 11–62 impression | Một số snippet chưa khớp câu hỏi; mẫu phần lớn còn nhỏ | Chỉ sửa URL có ≥30 impression trước; tránh overfit cho URL 10–17 impression |
| P2 | `/toeic/part-1`, `/toeic/part-4`, `/toeic/thang-diem` | vị trí 22–58 | Chưa đủ authority/relevance cho head term | Tiếp tục xây cụm nội dung và internal link theo Part, không kỳ vọng quick win từ title |

## Kiểm tra kỹ thuật

- `robots.txt` trả 200 và khai báo sitemap đúng.
- Sitemap live có 128 URL, không chứa route tài khoản/session chính.
- Canonical, title, meta description, Open Graph và `BlogPosting` + breadcrumb JSON-LD có trên bài mẫu.
- `/sign-in` có 8 impression trong kỳ báo cáo nhưng bản live đã trả cả meta `noindex` và `X-Robots-Tag: noindex`; cần để Google tiếp tục crawl để xử lý loại URL, không chặn bằng robots.txt.
- Các public route mẫu trả 200; TTFB đo nhanh nằm khoảng 0,18–0,76 giây. `/blog` nặng hơn vì trước đây render toàn bộ thư viện trên một response.

## Thay đổi đã triển khai

1. Tối ưu bài kết quả TOEIC theo đúng truy vấn, đưa mốc chính thức IIG lên đầu và cập nhật ngày kiểm tra nguồn.
2. Tối ưu bài said/told cho hai ý định đang có impression: phân biệt said/told và `told + to V`.
3. Trên mọi bài có mini practice, nội dung trả lời hiện trước bài luyện; bài luyện trở thành bước tiếp theo sau khi người đọc đã nhận câu trả lời.
4. CTA của bài nhóm `EXAM_TIPS` dẫn khách mới tới bài đánh giá miễn phí thay vì CTA luyện tập chung chung.
5. Hub `/blog` đồng bộ title/H1 với “Kiến thức TOEIC” và phân trang 24 bài/trang để giảm HTML ban đầu. Trang lọc, tìm kiếm và phân trang dùng `noindex, follow`, canonical vẫn về `/blog`.

## Mở rộng tối ưu cho toàn bộ URL

Các nguyên tắc trên đã được đưa xuống lớp dùng chung thay vì tiếp tục sửa rời rạc từng trang:

1. Mọi trang public dùng metadata mặc định hoặc `publicPageMetadata` đều cho phép Google tạo snippet đầy đủ, ảnh preview lớn và video preview khi phù hợp. Canonical riêng của từng trang vẫn được giữ nguyên.
2. Toàn bộ 96 bài viết và trang nội dung được bundle có quality contract cho title 30–65 ký tự, meta description 110–165 ký tự, target topic, search intent, canonical và internal link. Ba meta description quá dài ở hub `/toeic`, `/toeic/part-5` và `/toeic/part-7` đã được rút gọn.
3. CTA cuối bài được chọn theo intent: Listening về hub Part 1–4, Grammar về bài Part 5 có lời giải, Vocabulary về flashcard, Exam Review về hub thi thử, còn chiến lược/lộ trình/mẹo thi về đánh giá đầu vào hoặc dashboard.
4. Mỗi bài có thêm đường dẫn về topic hub tương ứng và tối đa ba bài đọc tiếp được xếp theo learning path, category, tag và mức độ gần chủ đề; bài `noindex` không được đưa vào gợi ý.
5. Quality gate của CMS cảnh báo trước khi xuất bản nếu title/meta quá ngắn hoặc quá dài, hoặc thiếu target topic/search intent. Nhờ vậy URL mới tiếp tục tuân theo cùng tiêu chuẩn.
6. `/delete-account` vẫn truy cập công khai để phục vụ người dùng và yêu cầu của nền tảng ứng dụng, nhưng đã dùng `noindex, follow`, có `X-Robots-Tag` dự phòng và bị loại khỏi sitemap vì đây không phải search landing page.

Không thay hàng loạt title của các URL chỉ có 1–17 impression. Với mẫu nhỏ, thay đổi đồng loạt dễ làm mất tín hiệu hiện có; các URL này nhận lợi ích từ internal link, CTA và metadata kỹ thuật chung trước, sau đó chỉ sửa title khi cửa sổ 28 ngày mới cho thấy đủ impression và CTR thấp.

## Kế hoạch đo trong 28 ngày sau deploy

- Ghi ngày deploy và so sánh hai cửa sổ 14 ngày trước/sau; không so vài ngày đầu vì Google cần recrawl.
- Theo dõi riêng ba URL: bài kết quả TOEIC, bài said/told và `/blog`.
- Chỉ số chính: impression, CTR, vị trí trung bình và click sang `/try` từ organic landing page.
- Mục tiêu định hướng, không phải cam kết thứ hạng: giữ hoặc cải thiện vị trí trong khi CTR bài kết quả tăng; bài said/told bắt đầu có click; giảm kích thước response và cải thiện trải nghiệm `/blog`.
- Sau 28 ngày, ưu tiên vòng tiếp theo cho URL có ít nhất 30 impression và vị trí 4–15 nhưng CTR thấp. Không chỉnh title liên tục khi mẫu còn quá nhỏ.

## Backlog khuyến nghị

- Bổ sung dashboard/annotation cho organic landing → `/try` → bắt đầu bài đánh giá → hoàn tất, để SEO được đo bằng user có hành động chứ không chỉ click.
- Củng cố internal link cho cụm phát âm s/es, ed, âm cuối và connected speech bằng anchor mô tả tự nhiên.
- Xuất thêm report Search Console gồm Pages + Queries theo cùng bộ lọc hoặc dùng API để có cặp query–page chính xác.
- Lấy thêm report Indexing và Core Web Vitals trước vòng audit kỹ thuật tiếp theo.

