# SEO post JSON import

Trang `/admin/content/posts/new` nhận JSON phiên bản 1 để điền một bản nháp. Import không tự lưu và không tự xuất bản.

Tải schema mẫu trực tiếp bằng nút **Tải JSON mẫu** trong editor. Các giá trị `category` hợp lệ là:

`TOEIC_STRATEGY`, `LISTENING`, `READING`, `GRAMMAR`, `VOCABULARY`, `STUDY_PLAN`, `EXAM_TIPS`.

## Prompt gợi ý cho AI

```text
Hãy viết một bài blog tiếng Việt chuẩn SEO cho TOEICGym về [CHỦ ĐỀ].
Chỉ trả về JSON hợp lệ, không bọc trong markdown fence và không thêm giải thích.
Dùng đúng cấu trúc của file toeicgym-seo-post-v1.json.
Nội dung trong field content phải là Markdown, không thêm H1 vì title đã là H1.
Thêm H2/H3 hợp lý, ví dụ thực tế, FAQ khi phù hợp và liên kết nội bộ dạng /blog/slug nếu được cung cấp.
Không bịa số liệu, nghiên cứu hoặc trích dẫn.
```

## Quy trình biên tập

1. Chọn file JSON hoặc dán JSON, sau đó bấm **Nhập vào bản nháp**.
2. Kiểm tra nội dung, slug, SEO, social, canonical và các cảnh báo.
3. Tải JPG, PNG hoặc WebP từ máy, nhập alt text và xác nhận ảnh đã được chọn.
4. Bấm **Lưu bài viết**. Bài vẫn là draft cho tới khi Admin chủ động xuất bản.
