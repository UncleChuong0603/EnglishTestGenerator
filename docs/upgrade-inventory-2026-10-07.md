# Danh sách URL, resource và material cần quyết định

Ngày rà soát: 07/10/2026

Mục tiêu của danh sách này là tách phần đang dùng trong cấu trúc mới khỏi phần cũ hoặc trùng vai trò. Chưa xóa URL hay asset nào chỉ vì ít được tham chiếu: trước khi xóa hoặc 301 cần đối chiếu access log, Google Search Console, backlink và chiến dịch bên ngoài.

## 1. Đã loại khỏi luồng sản phẩm hiện tại

| Hạng mục | Hiện trạng | Xử lý trong batch này | Bước quyết định tiếp theo |
| --- | --- | --- | --- |
| Dữ liệu BXH cộng đồng giả | `src/lib/gamification/community-leaderboard.ts` tạo 12 tên và điểm mô phỏng | `getWeeklyLeaderboard` chỉ trả người học và RP thật; trạng thái rỗng của trang được giữ nguyên | Nếu không còn dùng cho story/demo riêng, xóa module và test tương ứng |
| Link nội bộ `/practice/part-5` trong kho đề | URL này chỉ chuyển hướng về `/practice` | Link trong `/full-mock` đã trỏ thẳng tới `/practice` | Giữ redirect cũ cho bookmark trong thời gian theo dõi log |

## 2. URL có dấu hiệu legacy hoặc thiếu vai trò rõ ràng

| URL | Bằng chứng trong code ngày 07/10/2026 | Khuyến nghị mặc định |
| --- | --- | --- |
| `/practice/part-5` | Page tự ghi là “Backward-compatible entry point” và redirect sang `/practice`; chỉ còn 3 file tham chiếu trong `src` sau khi bỏ link từ kho đề | Giữ redirect tạm thời; không phát triển UI riêng. Sau khi kiểm tra log 60–90 ngày, chuyển thành permanent redirect hoặc xóa route nếu không có traffic |
| `/practice/part-5/[sessionId]` | Chỉ kiểm tra ownership rồi redirect sang `/practice/[sessionId]` | Giữ để không làm hỏng bookmark/session cũ; cân nhắc permanent redirect sau khi kiểm tra log |
| `/practice/part-5/[sessionId]/results` | Chỉ kiểm tra ownership rồi redirect sang `/practice/[sessionId]/results` | Giữ để tương thích lịch sử; không thêm feature mới |
| `/luyen-thi-toeic-online` | Là managed SEO page nhưng chỉ có 1 tham chiếu code trực tiếp là khai báo route; không xuất hiện như một entry rõ trong navigation | Kiểm tra impression/click/backlink. Nếu có giá trị tìm kiếm thì giữ như landing SEO độc lập; nếu không, 301 về `/try` hoặc landing phù hợp nhất. Không cố thêm link chỉ để “cứu” URL |
| `/blog/ngu-phap` | Đã có permanent redirect sang `/ngu-phap` trong `next.config.ts` | Giữ redirect vì đây là xử lý đúng cho URL cũ; không khôi phục page cũ |
| `/admin/content/posts/:path*` | Đã có permanent redirect sang `/admin/posts/:path*` | Giữ redirect; không khôi phục cấu trúc admin cũ |

## 3. URL trùng chủ đề nhưng chưa nên gộp

Các nhóm dưới đây có vẻ giống nhau ở tên gọi nhưng đang phục vụ các intent khác nhau. Không xem là URL chết nếu chưa có dữ liệu hành vi.

| Nhóm | Vai trò hiện tại | Điều cần đo trước khi đổi |
| --- | --- | --- |
| `/try`, `/challenge/part-5`, `/diagnostic` | `/try` là trang chọn trải nghiệm; hai URL sau là hai bài guest khác nhau | Tỷ lệ click từ `/try`, tỷ lệ bắt đầu/hoàn thành từng bài, tỷ lệ signup sau kết quả |
| `/practice`, `/toeic/part-5/practice`, `/challenge/part-5` | App luyện cá nhân hóa có đăng nhập; landing SEO; thử thách guest | Không canonical hoặc redirect chéo máy móc. Đo query search và conversion theo từng intent |
| `/full-mock`, `/demo-test`, `/thi-thu-toeic-online` | Kho đề trong app; bài Reading 100 câu cũ nhưng còn hoạt động; landing SEO công khai | Kiểm tra số lượt dùng `/demo-test`. Nếu thấp và toàn bộ chức năng đã có trong `/full-mock`, lập kế hoạch migrate session trước khi bỏ |
| `/vocabulary`, `/toeic/tu-vung`, `/toeic/flashcards-tu-vung-cong-so` | App SRS cá nhân; bộ từ vựng SEO; flashcard SEO theo chủ đề | Giữ ranh giới app/search. Chỉ gộp hai trang SEO nếu Search Console cho thấy cannibalization cùng query |
| `/listening-lessons`, `/toeic/listening` | Thư viện bài nghe công khai; hub kiến thức/SEO | Đo search intent và đường đi sang bài luyện; không gộp chỉ vì cùng từ khóa “listening” |

## 4. Resource không có tham chiếu runtime trong code

| Resource | Bằng chứng | Khuyến nghị |
| --- | --- | --- |
| `public/images/study-desk.webp` | Không có tham chiếu trong `src`, `scripts`, `docs`, `design-system`, config hoặc package scripts | Ứng viên xóa. Trước khi xóa, kiểm tra CMS/database và URL asset có được dùng trong quảng cáo hay bài đăng ngoài repo không |
| `public/brand/toeic-gym-cover.png` | Không có tham chiếu code; metadata hiện dùng `public/brand/toeic-gym-social.png` | Ứng viên chuyển sang kho brand/archive hoặc xóa sau khi kiểm tra chiến dịch ngoài hệ thống |
| `src/lib/gamification/community-leaderboard.ts` | Không còn được production query gọi; chỉ còn test trực tiếp | Nếu không cần fixture cho demo nội bộ, xóa cả module và `community-leaderboard.test.ts` |

## 5. Material lịch sử không thuộc runtime

| Thư mục | Snapshot | Khuyến nghị |
| --- | --- | --- |
| `design/` | 6 file, khoảng 3.8 MB | Giữ `UI-REVIEW.md` hoặc direction còn hiệu lực; chuyển mockup cũ sang archive nếu không còn là source of truth |
| `artifacts/` | 253 file tracked, khoảng 49.2 MB | Chia thành “release evidence còn cần” và screenshot tạm. Archive hoặc dùng Git LFS cho ảnh cần giữ; xóa script/screenshot tái tạo được sau khi review |

Các file trong hai thư mục này không được phục vụ trực tiếp bởi Next.js, nhưng vẫn làm repository nặng và dễ khiến người phát triển hiểu nhầm screenshot cũ là UI hiện hành.

## 6. Resource đang dùng — không đưa vào cleanup

- `public/brand/toeic-gym-logo.png`, `toeic-gym-mark.png`, `toeic-gym-social.png`: đang được header, footer, metadata và structured data sử dụng.
- `public/listening-talks/*`: đang được thư viện listening và manifest test sử dụng.
- `public/seo/*`: đang được các landing TOEIC, sample quiz và tài liệu tải về sử dụng.
- `public/vocabulary-data-attribution.txt`: nên giữ vì là thông tin nguồn dữ liệu, không phải asset giao diện cũ.

## 7. Thứ tự ra quyết định đề xuất

1. Xóa module BXH giả sau khi xác nhận không còn nhu cầu demo nội bộ.
2. Kiểm tra CMS và traffic ngoài hệ thống cho hai asset public không có tham chiếu; xóa nếu không dùng.
3. Dùng access log để đánh giá ba redirect `/practice/part-5*` và `/demo-test`.
4. Dùng Search Console để quyết định `/luyen-thi-toeic-online` và các cặp landing SEO có chồng intent hay không.
5. Archive screenshot/material lịch sử theo từng đợt; không trộn việc cleanup bằng chứng release với thay đổi sản phẩm.
