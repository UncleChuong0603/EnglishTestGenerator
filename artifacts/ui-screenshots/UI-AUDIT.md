# TOEICGym UI Audit

Phạm vi: giao diện người dùng được render từ trạng thái repository hiện tại. Không bao gồm Admin. Audit này không thay đổi UI.

## Các vấn đề đáng chú ý

### 1. Ngân hàng Listening và Full Mock chưa sẵn sàng

- Route: `/practice`, `/diagnostic`, `/full-mock`
- Screenshot: `learner-free/free-practice-setup-desktop.png`, `full-mock/full-mock-landing-unavailable-desktop.png`
- Severity: HIGH
- Issue: UI hiển thị các lối vào Listening nhưng isolated database không có Listening/media hợp lệ; Full Mock chỉ hiển thị trạng thái "Sắp ra mắt". Không thể review các màn active/result quan trọng.
- Recommendation: hoàn thiện test content pack có media cô lập cho Parts 1–4 và bộ Full Mock 200 câu trước vòng redesign.

### 2. Mobile navigation dùng hàng ngang dày đặc

- Route: `/dashboard`, `/ranking`, `/settings`
- Screenshot: `mobile/free-dashboard-mobile.png`, `mobile/ranking-mobile.png`, `mobile/premium-settings-mobile.png`
- Severity: HIGH
- Issue: header learner phải chứa nhiều link, language, identity và account control trong chiều ngang 390px. Thứ bậc và khả năng khám phá kém, có nguy cơ overflow/scroll ngang.
- Recommendation: thiết kế mobile navigation riêng (menu gọn hoặc bottom navigation) và giữ account actions trong một entry rõ ràng.

### 3. Settings mobile quá dài

- Route: `/settings`
- Screenshot: `mobile/premium-settings-mobile.png`
- Severity: HIGH
- Issue: nhiều nhóm form xếp nối tiếp tạo trang cuộn rất dài; các hành động lưu và hành động nguy hiểm không có thứ bậc đủ mạnh.
- Recommendation: chia thành section/accordion hoặc sub-navigation, thêm summary plan/account ở đầu trang và tách danger zone.

### 4. Practice desktop sử dụng không gian chưa cân đối

- Route: `/practice/[sessionId]`
- Screenshot: `practice/practice-part5-desktop.png`, `practice/practice-part6-desktop.png`, `practice/practice-part7-desktop.png`
- Severity: MEDIUM
- Issue: khối câu hỏi nhỏ trong viewport 1440px và để lại nhiều khoảng trắng; pagination/action bị tách xa nội dung. Part 6/7 chưa tận dụng bố cục passage + question.
- Recommendation: xác lập max-width theo loại part, dùng split pane cho passage và sticky action/pagination.

### 5. Practice result quá dài và khó quét

- Route: `/practice/[sessionId]/results`
- Screenshot: `practice/practice-result-desktop.png`
- Severity: MEDIUM
- Issue: tất cả câu, đáp án và giải thích xếp dọc tạo trang rất dài; không thấy bộ lọc nhanh cho câu sai.
- Recommendation: thêm summary bám dính, filter All/Incorrect/Correct và collapse explanation theo câu.

### 6. Mistake Bank fixture có mastery nhưng UI vẫn trống

- Route: `/mistakes`
- Screenshot: `mistakes/mistake-bank-desktop.png`
- Severity: MEDIUM
- Issue: trang hiển thị empty state dù isolated fixture có cả `UNRESOLVED` và `MASTERED`. Điều này cho thấy điều kiện hiển thị/phân trang cần được xác minh trước khi audit visual chi tiết.
- Recommendation: chuẩn hóa fixture theo đúng query contract của Mistake Bank, sau đó review card/status/filter cho hai trạng thái.

### 7. Ranking trống tạo cảm giác trang chưa hoàn thiện

- Route: `/ranking?tab=READING_100`
- Screenshot: `ranking/ranked-challenge-empty-desktop.png`
- Severity: MEDIUM
- Issue: empty state chỉ là một dòng trong card rộng, không giải thích chu kỳ challenge hoặc hành động tiếp theo.
- Recommendation: thêm minh họa nhẹ, thông tin lịch/chu kỳ và CTA quay lại practice hoặc nhận thông báo.

### 8. Auth desktop có quá nhiều khoảng trắng

- Route: `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`
- Screenshot: `auth/auth-sign-in-desktop.png`, `auth/auth-sign-up-desktop.png`
- Severity: LOW
- Issue: form rất nhỏ và nằm giữa nền trống lớn; khó truyền tải giá trị sản phẩm hoặc tạo cảm giác tin cậy.
- Recommendation: giữ form gọn nhưng bổ sung brand context/social proof tinh gọn, không làm loãng nhiệm vụ chính.

### 9. Pricing FREE/PREMIUM khó nhận ra khác biệt khi quét nhanh

- Route: `/pricing`
- Screenshot: `learner-free/free-pricing-desktop.png`, `learner-premium/premium-pricing-desktop.png`
- Severity: LOW
- Issue: trạng thái gói hiện tại và CTA không đủ nổi bật để người dùng nhận biết ngay mình đang ở FREE hay PREMIUM.
- Recommendation: dùng nhãn "Gói hiện tại" nhất quán, vô hiệu hóa CTA không phù hợp và đưa renewal/end date đến gần summary.

### 10. Hệ thống width/card style chưa thật nhất quán

- Route: nhiều route public và learner
- Screenshot: `public/public-try-desktop.png`, `diagnostic/diagnostic-start-desktop.png`, `billing/premium-billing-desktop.png`, `settings/premium-settings-desktop.png`
- Severity: LOW
- Issue: các trang dùng nhiều max-width, radius, padding và cách đặt heading khác nhau. Chuyển route tạo cảm giác mỗi trang thuộc một hệ con riêng.
- Recommendation: định nghĩa page shell, section header, card density và spacing scale chung trong vòng redesign sau.

## TOP 10 UI improvements

1. Chuẩn bị isolated Listening/Full Mock content pack để mở khóa review toàn bộ luồng cốt lõi.
2. Thiết kế lại learner navigation trên mobile.
3. Chia nhỏ và rút ngắn Settings mobile.
4. Tối ưu bố cục Practice riêng cho Part 5, 6 và 7.
5. Thêm filter/collapse/sticky summary cho Practice Result.
6. Xác minh data contract và audit lại Mistake Bank/Mastery với dữ liệu hiển thị thật.
7. Nâng cấp empty state cho Ranked Challenges và các khu vực chưa có dữ liệu.
8. Chuẩn hóa page shell, max-width, card radius và spacing scale.
9. Làm rõ trạng thái gói hiện tại trên Pricing/Billing/Settings.
10. Tăng brand context và độ tin cậy cho các màn Auth desktop.
