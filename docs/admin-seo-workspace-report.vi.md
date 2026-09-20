# Báo cáo nâng cấp không gian bài viết SEO

## Kiến trúc và vấn đề ban đầu

Admin Posts dùng PostgreSQL `content_posts`, thẻ chuẩn hóa, server actions có quyền `CONTENT_MANAGE`, audit log, Markdown renderer viết bằng React, Media CONTENT, preview Admin `noindex`, route `/blog/[slug]`, metadata Next.js, JSON-LD `BlogPosting`, robots và sitemap động. Form trước đây là một cột dài; SEO ở cuối; danh sách hiển thị enum tiếng Anh; thiếu kiểm tra khi viết, SERP preview, dàn ý và gợi ý liên kết.

## Thay đổi đã thực hiện

- Editor hai cột: vùng nội dung rộng và sidebar sticky ở desktop, tự xếp chồng trên màn hẹp. Sidebar có Tổng quan, SEO, Liên kết, Social, Schema và Nâng cao. Dàn ý lấy từ heading Markdown.
- Checklist phân biệt lỗi chặn xuất bản (tiêu đề, slug, tóm tắt, nội dung) và gợi ý (mô tả tìm kiếm, ảnh, alt, liên kết, heading, trùng title/meta và văn bản giữ chỗ). Không chấm điểm SEO, mật độ từ khóa hoặc độ dài bài viết.
- SERP preview dùng title/meta hoặc fallback đã có; ghi rõ đây là mô phỏng vì Google có thể thay đổi title/snippet. Chủ đề và search intent chỉ hỗ trợ biên tập.
- Slug bài đã xuất bản bị khóa cả ở UI và server vì chưa có redirect. Canonical tự tham chiếu khi bỏ trống; custom canonical phải là đường dẫn nội bộ hợp lệ.
- Thêm `noindex`, tác giả hiển thị, alt ảnh bìa, OG title/description, chủ đề và search intent vào schema. Bài `noindex` nhận robots noindex và bị loại khỏi sitemap. OG fallback về SEO/article metadata. JSON-LD lấy tác giả thật nếu có, mặc định TOEICGym.
- Ảnh Media hiển thị kích thước và cảnh báo nhẹ nếu nhỏ; alt được xuất ra HTML. Sidebar hiển thị gợi ý liên kết từ tối đa 100 bài đã xuất bản và thống kê link Markdown. Liên kết blog không tìm thấy được đánh dấu để người viết kiểm tra.
- Danh sách bài viết dùng nhãn tiếng Việt, tìm theo tiêu đề/slug/tag, lọc trạng thái/danh mục/gợi ý SEO. Preview có nút quay lại chỉnh sửa và vẫn dùng `ArticleView` công khai.
- Server action và preview vẫn yêu cầu quyền Admin. Markdown tiếp tục render thành React text; HTML thô không được thực thi, URL `javascript:`/`data:` không trở thành liên kết.

## Xác minh

- Lint: 0 lỗi, 4 cảnh báo `<img>` đã có trong khu vực ảnh.
- Test: 436 passed, 1 skipped. Test SEO/migration: 8 passed.
- Production build: thành công.
- Typecheck riêng: chưa xanh do `.next/types/validator.ts` trỏ tới `src/app/admin/payments/page.tsx` đang bị xóa trong working tree từ thay đổi ngoài phạm vi task. Build đã hoàn tất bước TypeScript trước khi file này bị xóa.

## Chưa triển khai và cần con người xử lý

- Chưa có Markdown preview tức thời dùng cùng renderer trên nội dung chưa lưu, toolbar định dạng, tag chips, bộ kiểm tra liên kết ngoài theo mạng, xác thực tự động mọi route nội bộ, hay phép đo chất lượng nội dung chủ quan.
- Chưa có redirect cho slug đã xuất bản, nên slug được khóa. Chưa có lịch xuất bản, người kiểm duyệt, thư viện tác giả, ảnh OG riêng, hoặc FAQ schema.
- Kiểm tra trùng title/meta và gợi ý liên kết lấy từ tối đa 100 bài xuất bản; đây là gợi ý UI, không phải kiểm tra DB toàn cục. Danh sách SEO chỉ tóm tắt hai gợi ý cơ bản. Chưa có kiểm thử browser desktop/mobile trong lần thay đổi này.
- Cần chạy migration `0024_seo_workspace` trên môi trường đích trước khi phát hành. Biên tập viên cần xác nhận tác giả, alt ảnh, chất lượng ví dụ/nguồn và nội dung cuối cùng; không có công cụ nào trong thay đổi này bảo đảm thứ hạng tìm kiếm.

Hướng dẫn biên tập bám theo [Google Search Central về nội dung hữu ích](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) và [cách Google tạo snippet](https://developers.google.com/search/docs/appearance/snippet).
