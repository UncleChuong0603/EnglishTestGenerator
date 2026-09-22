# Audit sản phẩm và gói Free / Premium

Ngày audit: 2026-09-22

## Kết luận nhanh

TOEICGym đã có ranh giới Free/Premium khá tốt ở backend: quota được kiểm tra trong transaction, có khóa chống race condition, event usage chống tính trùng và plan được xác định từ membership phía server. Điểm yếu lớn nhất nằm ở cách truyền đạt: trang Pricing trước đây không công bố đủ quota luyện tự chọn, quyền đánh giá lại, targeting, Smart Review và Mock History; bảng so sánh trên mobile còn che cột Premium sau vùng cuộn ngang.

Audit này đã sửa các điểm có thể thay đổi an toàn mà không tác động economics. Những thay đổi làm thay đổi giá trị gói, đặc biệt policy Full Mock, được giữ thành đề xuất cần quyết định sản phẩm.

## Mô hình plan hiện tại

- `FREE`: plan mặc định của tài khoản đã đăng nhập khi không có membership Premium đang hoạt động.
- `PREMIUM`: quyền truy cập theo thời hạn cố định 30, 90 hoặc 365 ngày. Giá được đọc từ biến môi trường, thanh toán một lần và không tự động gia hạn.
- `Guest`: trải nghiệm riêng cho bài thử/đánh giá đầu vào; không phải một plan và không dùng quota tài khoản.
- Một grant Premium hợp lệ khi đã đến thời điểm bắt đầu, chưa bị revoke và chưa hết hạn. Mua/gia hạn khi Premium còn hiệu lực nối thêm thời gian vào ngày hết hạn hiện tại.

## Ma trận tính năng và quota

| Tính năng | Free | Premium | Cách enforce hiện tại |
| --- | --- | --- | --- |
| Listening + Reading Parts 1-7 | Có, tùy content/media đã READY | Có, tùy content/media đã READY | Readiness và published content phía server |
| Luyện tập tự chọn | 3 phiên/ngày, dùng chung Listening và Reading | Không giới hạn | `MANUAL_PRACTICE` |
| Bài hôm nay | 1 phiên/ngày | Không giới hạn | `TODAYS_WORKOUT` |
| Bộ lọc luyện tập | Part, skill, subskill và số câu | Như Free, thêm ưu tiên điểm yếu, lỗi sai và câu chưa làm | Capability `canUseAdvancedTargeting` |
| Đánh giá đầu vào | 1 baseline; có thể tiếp tục trong 7 ngày | Baseline và đánh giá lại mỗi 30 ngày | Capability `canUseDiagnosticReassessment` + cooldown |
| Ngân hàng lỗi sai | Xem câu cần ôn/đã làm chủ, lọc theo area/Part | Như Free, thêm repeated-miss filter và nhiều kiểu sắp xếp | Capability `canUseSmartMistakeReview` |
| Phiên ôn lỗi sai | 1 phiên/ngày; batch chuẩn 10 câu, có thể ít hơn do nhóm nội dung/readiness | Không giới hạn; chọn mục tiêu 5/10/15/20 và ưu tiên thông minh | `MASTERY_REVIEW` |
| Tiến độ tổng | Tổng quan lifetime, Listening/Reading và Part 1-7 | Như Free | Aggregate từ câu trả lời đã nộp |
| Xu hướng tiến độ | 7 hoặc 30 ngày | 7, 30 hoặc 90 ngày | `historyWindowDays` |
| Phân tích skill/subskill | Không | Có, chỉ kết luận khi đủ cỡ mẫu | Capability `canUseSkillBreakdown` |
| Tạo Mock mới | 1 lần/tháng, dùng chung Listening 100, Reading 100 và Full 200 | Không giới hạn | `FULL_MOCK` |
| Kết quả Mock | Xem kết quả từng bài và các kết quả gần đây | Như Free | Ownership + run đã hoàn thành |
| Mock History nâng cao | Không | Toàn bộ lịch sử, xu hướng cùng mode, so sánh theo Part | Capability `canUseAdvancedMockHistory` |
| Giải thích đáp án | English, Vietnamese hoặc song ngữ | English, Vietnamese hoặc song ngữ | Preference tài khoản |
| Ranking, XP, streak và ranked challenges | Có; không dùng quota plan | Có; không dùng quota plan | Policy gamification/challenge riêng |
| Mục tiêu học, hồ sơ, cài đặt và support | Có | Có | Không metered theo plan |

## Quy tắc quota cần biết

- Quota ngày reset lúc 00:00 mỗi ngày; quota tháng reset lúc 00:00 ngày đầu tháng theo `Asia/Ho_Chi_Minh`.
- Quota được tính khi một resource mới được tạo thành công trong cùng transaction. Tiếp tục resource đang làm không tính thêm lượt.
- Retry cùng resource không tính hai lần nhờ unique identity của usage event.
- Premium đang hoạt động không ghi usage consumption và được bỏ qua giới hạn Free.
- Khi Premium hết hạn hoặc bị revoke, resource đã sở hữu vẫn có thể tiếp tục/xem lại; hoạt động mới quay về policy Free.
- Quota không đảm bảo content sẵn sàng. Listening, Mock và challenge vẫn phụ thuộc published content, media và readiness validator.
- Cả ba mode Mock dùng chung một quota. Bắt đầu một bài 100 câu hoặc 200 câu đều dùng một lượt; lượt được tính khi tạo run, không phải khi hoàn thành.

## Sản phẩm Premium đang bán

| Sản phẩm | Thời hạn | Giá |
| --- | --- | --- |
| `PREMIUM_30_DAYS` | 30 ngày | `PREMIUM_30_PRICE_VND` |
| `PREMIUM_90_DAYS` | 90 ngày | `PREMIUM_90_PRICE_VND` |
| `PREMIUM_365_DAYS` | 365 ngày | `PREMIUM_365_PRICE_VND` |

Checkout chỉ xuất hiện khi payment provider và giá tương ứng được cấu hình hợp lệ. Không có subscription hoặc auto-renew trong model hiện tại.

## Phát hiện và thay đổi đã thực hiện

| Mức độ | Phát hiện | Trạng thái |
| --- | --- | --- |
| Cao | Pricing không liệt kê `MANUAL_PRACTICE`, dù đây là quota Free quan trọng nhất sau daily workout | Đã sửa; dữ liệu lấy trực tiếp từ catalog |
| Cao | Pricing không nói rõ reassessment 30 ngày, advanced targeting, Smart Review, 90-day analytics và Mock History | Đã sửa bằng ma trận đầy đủ EN/VI |
| Cao | Bảng so sánh mobile yêu cầu cuộn ngang nên người dùng thường chỉ thấy cột Free | Đã thay bằng comparison cards hai cột trên mobile; desktop giữ table |
| Trung bình | CTA guest trên `/pricing` ghi đánh giá miễn phí nhưng dẫn đến đăng nhập | Đã sửa để dẫn đến `/try`; tài khoản đã đăng nhập tiếp tục vào dashboard |
| Trung bình | Điều kiện nhận diện Premium bị lặp ở nhiều query; nhánh quota bypass không tự nói rõ `plan_key = PREMIUM` | Đã gom thành một predicate server dùng chung và thêm regression test |
| Thấp | Capability `canUseAdvancedAnalytics` tồn tại nhưng không được enforce ở đâu | Đã bỏ; các quyền analytics thực tế dùng `historyWindowDays`, skill breakdown và Mock History |
| Cần quyết định | Một Reading/Listening Mock 100 câu tốn cùng quota với Full Mock 200 câu; abandon sau khi tạo vẫn mất lượt | Chưa đổi economics; xem đề xuất bên dưới |

## Đề xuất tiếp theo

### P1 - Quyết định lại economics của Mock

Chọn một trong hai model và A/B test sau khi có đủ usage data:

1. Tách `SECTION_MOCK` và `FULL_MOCK`: Free có 1 section/tháng và 1 full mock/quý; Premium không giới hạn.
2. Dùng credit: section 100 câu = 1 credit, full 200 câu = 2 credits; Free có 2 credits/tháng.
3. Giữ policy hiện tại nhưng thêm grace rule chỉ hoàn lại lượt khi run chưa có câu trả lời và bị hủy trong vài phút. Cần rate limit và audit để tránh abuse.

Không nên chuyển sang “chỉ tính khi hoàn thành” vì có thể tạo vô hạn run rồi giữ content đã cấp.

### P1 - Hiển thị usage tại điểm ra quyết định

Dashboard đã có usage meter, nhưng Billing/Settings nên có cùng snapshot: đã dùng, còn lại và reset lúc nào. Điều này giảm cảm giác bị chặn bất ngờ và giảm support ticket. Dữ liệu đã có trong `getUsageStatus`, không cần schema mới.

### P2 - Version hóa catalog thương mại

Quota hiện là code constant, còn giá là environment variable. Khi cần thử nghiệm plan hoặc thay đổi quota, nên thêm version cho catalog và audit log thay vì sửa rời rạc. UI vẫn phải đọc từ cùng nguồn canonical; backend không nhận plan/quota do client gửi lên.

### P2 - Làm rõ content readiness trước checkout

Nếu một mode Mock chưa READY, Pricing/Billing nên hiển thị trạng thái đó ngay cạnh quyền lợi. Premium mở quota nhưng không thể mở khóa content chưa sẵn sàng; công bố sớm tránh kỳ vọng sai.

### P2 - Đo funnel trước khi thêm plan mới

Theo dõi tối thiểu: chạm quota, xem Pricing, bắt đầu checkout, thanh toán thành công, sử dụng quyền Premium lần đầu và gia hạn. Chỉ sau đó mới quyết định trial, weekly pass hoặc plan theo tháng. Không nên thêm nhiều SKU khi chưa biết điểm chuyển đổi thực tế.

## Nguồn sự thật kỹ thuật

- Quota và capability: `src/lib/entitlements/catalog.ts`
- Enforcement và usage: `src/lib/entitlements/service.ts`
- Ma trận public: `src/lib/public-product.ts`
- UI Pricing: `src/components/pricing-section.tsx`
- Sản phẩm thanh toán: `src/lib/payments/catalog.ts`
- Diagnostic cooldown: `src/lib/diagnostic/policy.ts`

## Checklist regression

- Free bị chặn ở phiên Manual thứ 4/ngày, Workout thứ 2/ngày, Mastery Review thứ 2/ngày và Mock mới thứ 2/tháng.
- Resume resource đang hoạt động không ghi thêm consumption.
- Premium đang hoạt động vượt được cả bốn quota; expiry/revoke đưa hoạt động mới về Free.
- Pricing EN/VI có cùng số hàng, mọi entitlement metered đều xuất hiện và giá trị lấy từ catalog.
- Mobile hiển thị đồng thời giá trị Free/Premium mà không cần cuộn ngang.
- Guest CTA Pricing mở `/try`; signed-in CTA mở `/dashboard`.
