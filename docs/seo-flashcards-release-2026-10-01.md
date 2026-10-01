# TOEIC GYM: flashcard từ vựng công sở — 2026-10-01

## Phạm vi

Batch này thêm trang `/toeic/flashcards-tu-vung-cong-so` cho ý định tìm kiếm flashcard và ôn nhớ cụm từ, tách khỏi bài hướng dẫn từ vựng công sở. Trang có 8 flashcard hiển thị trực tiếp, mỗi thẻ gồm câu hỏi, đáp án, cụm từ mẫu và giải thích ngắn. Bài từ vựng công sở liên kết tới trang flashcard để tạo đường dẫn nội bộ theo đúng nhu cầu tiếp theo của người học.

## Structured data

Trang dùng `Quiz` với 8 `Question`/`Answer` và `eduQuestionType: "Flashcard"`. Đây là mô hình Education Q&A phù hợp cho trang flashcard theo tài liệu chính thức của Google; nội dung trong JSON-LD khớp với các thẻ hiển thị trên trang. Không dùng `FAQPage` hoặc `QAPage` cho nội dung không đúng mục đích.

- [Education Q&A structured data](https://developers.google.com/search/docs/appearance/structured-data/education-qa)
- [General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)

Structured data giúp máy tìm kiếm hiểu nội dung và có thể mở thêm cơ hội hiển thị; Google không đảm bảo rich result hoặc thứ hạng chỉ vì có markup.

## Crawl path

- Route được đưa vào `STATIC_PUBLIC_PATHS`, vì vậy được đưa vào sitemap public.
- Trang có canonical, breadcrumb và liên kết `<a>` tới bài liên quan và bài luyện Part 5.
- Smoke test kiểm tra HTTP, H1, canonical và `Quiz` có đúng 8 câu.
- Nội dung là một tài nguyên lá cụ thể, không tạo hàng loạt trang mỏng theo từng biến thể từ khóa.

## Verification

- Vitest: 5 file, 71 test pass.
- ESLint mục tiêu cho các file thay đổi: pass.
- Next build với biến môi trường kiểm thử: pass, 88 route được build.
- Browser QA tiếng Việt và tiếng Anh ở 375, 768, 1024 và 1440 px: HTTP 200, không tràn ngang, có focus keyboard, Enter mở thẻ, không có lỗi JavaScript.
- Ảnh QA: [mobile](../artifacts/seo-flashcards-2026-10-01/flashcards-mobile.png), [desktop English](../artifacts/seo-flashcards-2026-10-01/flashcards-desktop-en.png).

Production smoke test trước batch này đã pass với 77 URL sitemap, 22 trang đại diện và 7 route ứng dụng. Route flashcard mới cần được deploy rồi chạy lại smoke test production; batch này không tự deploy.
