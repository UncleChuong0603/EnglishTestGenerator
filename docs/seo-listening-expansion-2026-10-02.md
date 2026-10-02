# TOEIC GYM: mở rộng bài luyện Listening và nội dung Part 2

Ngày thực hiện: 02/10/2026. Phạm vi: thay đổi local, chưa deploy production.

## Khoảng trống và quyết định

Trang `/toeic/part-2` trước đây chỉ có một câu trả lời trực tiếp về thời gian. Bài blog phương pháp có nói đến phản hồi gián tiếp nhưng chưa dẫn người học tới một nhóm audio để thực hành dạng này. Lời giải của bài mẫu Part 1, 2 và 4 chỉ xuất hiện sau khi chấm bằng JavaScript.

Đợt này mở rộng trang luyện hiện có, bổ sung ba câu audio gốc và lời giải của từng phương án. Bài blog phương pháp giữ vai trò giải thích chiến thuật và dẫn tới bài luyện; không tạo URL mới cùng ý định tìm kiếm.

## Đối chiếu nguồn và kỹ thuật SEO hiện tại

- [Google: tối ưu cho tính năng AI trong Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide?version=published), đọc ngày 02/10/2026: SEO nền tảng vẫn áp dụng; ưu tiên nội dung riêng có ích, tổ chức rõ, dễ truy cập và trải nghiệm sử dụng tốt. Google không yêu cầu llms.txt hay định dạng riêng để xuất hiện trong AI Search. Áp dụng bằng bài luyện thực tế, audio, bằng chứng đáp án và HTML đọc được trước tương tác.
- [ETS: đề mẫu Listening & Reading](https://www.ets.org/content/dam/ets-org/fr/pdfs/toeic/toeic-listening-reading-sample-test.pdf), phần hướng dẫn Part 2: một câu hỏi hoặc phát biểu, ba phản hồi được nghe; chọn phản hồi phù hợp nhất. Không sao chép câu hỏi chính thức. Trang học hiện chữ lựa chọn để ôn tập và giải thích rõ sự khác biệt với việc tự kiểm tra bằng nghe.
- [Bài đối thủ về câu trả lời gián tiếp](https://luyenthitoeic.online/cau-tra-loi-gian-tiep-part-2/), quan sát kết quả tìm kiếm ngày 02/10/2026: đây là chủ đề đã có nội dung cạnh tranh. Không dùng các khẳng định về tỷ lệ đúng hoặc thay đổi tần suất ra đề của bài đó làm căn cứ. Các câu mới được viết độc lập.

Đây là nghiên cứu định tính về nội dung. Chưa có dữ liệu Search Console, lượng tìm kiếm, độ khó từ khóa hoặc thứ hạng theo vị trí tại Việt Nam; không kết luận trang đã lên top.

## Những gì đã bổ sung

| Trang | Thay đổi có ích cho người học |
| --- | --- |
| `/toeic/part-2` | Từ 1 thành 4 câu, gồm phản hồi trực tiếp và ba phản hồi gián tiếp: thông tin chưa chốt, hỏi người biết, từ chối lời nhờ bằng lý do. Mỗi câu có audio, transcript, giải thích đáp án và phương án sai. |
| `/toeic/part-2` | Giải thích bản chất phản hồi gián tiếp, cách tránh bẫy lặp từ, quy trình sửa bài khoảng 10 phút và giới hạn suy luận từ bằng chứng nghe được. |
| `/toeic/part-1`, `/toeic/part-2`, `/toeic/part-4` | Lời giải trong native `details` có sẵn trong HTML, đóng ban đầu, mở khi chấm; tự chấm được khi tắt JavaScript. |
| `/toeic/part-4` | Bổ sung lý do loại từng phương án của cả ba câu, phân biệt lịch cũ, lịch mới và hạn báo vắng. |
| Blog phương pháp Part 2 | Thêm liên kết tới nhóm 4 audio và cập nhật ngày sửa thật. Trang luyện cũng dẫn lại bài phương pháp. |

Component bài nghe dùng radio độc lập giữa các audio, có kết quả đúng/sai bằng chữ, thông báo live, tập trung vào câu còn thiếu và nút làm lại. Điều khiển hỗ trợ vi/en; nội dung hướng dẫn và lời giải vẫn là tiếng Việt, câu hỏi/transcript là tiếng Anh và có thuộc tính `lang` phù hợp. Các trang hướng dẫn hiện vẫn dùng giao diện tiếng Việt như trước.

Audio được tạo bằng `EdgeContentTtsProvider`, giọng tổng hợp `en-US-AriaNeural`; trang công khai nêu rõ mục đích luyện tập. Ba file mới tổng cộng 454.176 byte (~444 KiB). Không tái tạo hoặc thay audio cũ.

```powershell
node --import tsx scripts/generate-seo-listening-samples.mts --additional-part2
```

Metadata Part 2 mô tả đúng bốn câu đã có. Sitemap ghi ngày sửa cố định 02/10/2026 cho ba trang Listening thực sự thay đổi; không dùng ngày hiện tại tự tăng mỗi request. Script `seo-smoke.mjs` kiểm tra số câu, disclosures và ba media mới.

## Kiểm tra và giới hạn

- 84 tests trong 11 files về SEO và nội dung đã qua; lint các file thay đổi và TypeScript đã qua.
- Build Next.js 16.3.4 production thành công, 89 mục được xử lý ở bước tạo trang.
- HTTP từ bản standalone local: ba trang HTTP 200, canonical production đúng, tên thương hiệu không lặp và đủ 1/4/3 câu cùng lời giải trong HTML. Ba MP3 mới HTTP 200 và `audio/mpeg`.
- Bằng chứng HTTP: `artifacts/seo-listening-expansion-2026-10-02/http-verification.json`.
- 42 trường hợp trình duyệt đã qua: 24 trường hợp component SSR/hydration (3 Part × 2 ngôn ngữ điều khiển × 4 kích thước 375/768/1024/1440px), 6 trường hợp không JavaScript, 12 trường hợp toàn trang tiếng Việt. Kiểm tra chấm đúng/sai, làm lại, câu còn thiếu, focus bàn phím, radio độc lập, phát audio, disclosures và không tràn ngang.
- Sau khi xem ảnh, chỉnh số thứ tự câu/lời giải Part 2 để khớp 1–4 giữa các khối audio; 5 tests liên quan, lint và build production được chạy lại và qua. Thêm 4 trường hợp kiểm tra nhãn, focus và bố cục ở 375/1440px, vi/en; tất cả qua.
- Bằng chứng trình duyệt: `artifacts/seo-listening-expansion-2026-10-02/verification.json`, `label-verification.json` và PNG toàn trang/chi tiết. Ảnh Part 2 đã được cập nhật sau chỉnh nhãn.

HTTP local dùng môi trường xác thực giả và không truy cập database. Không kiểm tra CMS overrides hoặc sitemap qua database production. Kiểm tra trình duyệt dùng component thật và CSS ứng dụng; ghi rõ phạm vi trong JSON. Kiểm tra phát audio xác nhận khả năng giải mã/phát, không thay cho việc nghe duyệt bởi biên tập viên.

Sau khi phát hành, so sánh nhóm truy vấn Part 2 và các trang liên quan trong Search Console theo cửa sổ 28 ngày: impressions, clicks, CTR, vị trí và canonical được chọn. Kết quả tìm kiếm cần được đo sau deploy và crawl lại; bản local chưa tạo tác động tới thứ hạng.
