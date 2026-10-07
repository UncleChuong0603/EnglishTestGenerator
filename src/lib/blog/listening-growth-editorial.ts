import type { EditorialPost } from "./editorial";

const dates = {
  publishedAt: new Date("2026-10-07T10:00:00.000Z"),
  createdAt: new Date("2026-10-07T10:00:00.000Z"),
  updatedAt: new Date("2026-10-07T10:00:00.000Z"),
};

function listeningPost(input: Omit<EditorialPost, "status" | "coverMediaId" | "noindex" | "createdBy" | "updatedBy" | "contentOrigin" | "publishedAt" | "createdAt" | "updatedAt">): EditorialPost {
  return {
    ...input,
    ...dates,
    status: "PUBLISHED",
    coverMediaId: null,
    noindex: false,
    createdBy: "editorial",
    updatedBy: "editorial",
    contentOrigin: "AI_ASSISTED",
  };
}

export const LISTENING_GROWTH_POSTS: EditorialPost[] = [
  listeningPost({
    id: "editorial-listening-beginner",
    slug: "cach-luyen-nghe-tieng-anh-cho-nguoi-mat-goc",
    title: "Cách luyện nghe tiếng Anh cho người mất gốc: nghe ngắn, sửa đúng lỗi",
    excerpt: "Lộ trình luyện nghe từ câu ngắn đến hội thoại: phân biệt thiếu từ vựng với không nhận ra âm, dùng transcript đúng lúc và đo tiến bộ bằng audio mới.",
    category: "LISTENING",
    seoTitle: "Cách luyện nghe tiếng Anh cho người mất gốc từng bước",
    seoDescription: "Lộ trình luyện nghe tiếng Anh cho người mất gốc: chọn audio vừa sức, nghe trước transcript, chép câu ngắn, shadowing và kiểm tra bằng bài nghe mới.",
    canonicalPath: "/blog/cach-luyen-nghe-tieng-anh-cho-nguoi-mat-goc",
    coverAlt: "Người mới học nghe một đoạn tiếng Anh ngắn và đối chiếu transcript",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Mất gốc luyện nghe thế nào để không chỉ bật audio cho có?",
    socialDescription: "Một quy trình nghe ngắn, tìm đúng nguyên nhân không hiểu và thử lại bằng nội dung mới.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "cách luyện nghe tiếng Anh cho người mất gốc",
    searchIntent: "BEGINNER_LISTENING_ROADMAP",
    tags: [{ name: "Luyện nghe tiếng Anh", slug: "luyen-nghe-tieng-anh" }, { name: "Mất gốc", slug: "mat-goc" }],
    content: `## Bắt đầu bằng việc xác định bạn đang “không nghe được” ở đâu

Người mới thường nói “em nghe không hiểu gì”, nhưng câu này có thể chứa bốn vấn đề khác nhau: bạn chưa biết từ; biết từ khi đọc nhưng không nhận ra âm; nhận ra từng từ nhưng không theo kịp cả câu; hoặc nghe được câu nhưng không nối thành ý. Mỗi vấn đề cần một bài tập khác nhau.

Lấy câu tự biên soạn **The meeting has been moved to Friday afternoon**. Nếu nhìn transcript vẫn không hiểu *has been moved*, bạn cần học từ/cấu trúc. Nếu đọc hiểu ngay nhưng audio nghe thành một chuỗi mơ hồ, bạn cần luyện nhận âm và lời nói nối liền. Nếu hiểu câu này nhưng bỏ lỡ câu tiếp theo, vấn đề có thể là tốc độ xử lý hoặc bạn đang cố dịch từng từ.

## Chọn audio ngắn và vừa sức

Trong giai đoạn đầu, một đoạn 20–60 giây có transcript hữu ích hơn một podcast dài khiến bạn mất dấu ngay phút đầu. Chủ đề nên quen thuộc, số người nói ít và âm thanh rõ. Bạn không cần hiểu 100%, nhưng phải nhận ra đủ từ khóa để đoán được ai đang nói, tình huống gì và hành động chính là gì.

Mở [thư viện luyện nghe có audio và transcript](/listening-lessons), chọn một bài ngắn và chỉ dùng một phần nhỏ trong buổi đầu. Với mục tiêu TOEIC, bạn có thể thử [câu hỏi–đáp Part 2](/toeic/part-2) trước khi chuyển sang [hội thoại Part 3](/toeic/part-3). Độ dài cần tăng sau khi bạn đã sửa được lỗi ở đoạn ngắn, không tăng chỉ vì thấy nội dung ngắn là “quá dễ”.

## Quy trình nghe năm lượt có mục đích

### Lượt 1: nghe ý chính, không dừng

Trước khi phát, đọc tiêu đề hoặc nhìn bối cảnh nếu có. Nghe một lần và trả lời ba câu: ai đang nói, họ đang ở đâu hoặc làm gì, điều gì thay đổi? Không mở transcript và không cố ghi từng chữ.

### Lượt 2: nghe để tìm điểm gãy

Nghe lại, dừng sau một câu hoặc cụm ngắn. Ghi những gì bạn chắc chắn nghe được và đặt dấu gạch ở phần mất. Mục tiêu là xác định vị trí lỗi, không phải tạo bản chép hoàn hảo.

### Lượt 3: kiểm tra transcript

So bản nghe với transcript. Đánh dấu mỗi chỗ thiếu bằng một trong bốn nhãn: **từ mới**, **biết từ nhưng không nhận âm**, **mất dấu vì tốc độ**, **nghe đủ nhưng hiểu sai ý**. Chỉ tra những từ đang cản trở ý chính; đừng biến buổi nghe thành việc tra mọi từ lạ.

### Lượt 4: nghe và nói lại

Nghe từng câu, tạm dừng và nói lại theo cụm. Khi đã quen, thử nói bám sau người nói. [Hướng dẫn shadowing tiếng Anh](/blog/shadowing-la-gi-cach-luyen-tieng-anh) giải thích cách tăng từ echo sang shadowing mà không ép người mới nói đồng thời ngay từ lượt đầu.

### Lượt 5: đóng transcript và kiểm tra

Nghe lại toàn đoạn không nhìn chữ. Viết một câu tóm tắt bằng tiếng Việt hoặc tiếng Anh đơn giản. Nếu chỉ đọc transcript nhiều lần mà không quay lại audio, bạn đang luyện đọc chứ chưa xác nhận khả năng nghe.

## Dùng transcript đúng thời điểm

Transcript không phải “gian lận”; nó là công cụ phản hồi. Vấn đề nằm ở thời điểm dùng. Mở transcript ngay từ đầu khiến mắt giải mã thay tai và bạn khó biết mình thật sự nghe được gì. Ngược lại, nghe lặp vô hạn một đoạn không hiểu cũng không tạo thêm thông tin để sửa lỗi.

Quy tắc thực tế: nghe một đến hai lượt trước, kiểm tra chữ, phân tích một vài điểm gãy rồi đóng chữ để nghe lại. Với câu khó, khoanh cụm thay vì tách mọi từ. Trong lời nói tự nhiên, ranh giới từ không rõ như khoảng trắng trên trang giấy; [bài nối âm và dạng yếu](/blog/noi-am-tieng-anh-cach-nghe-connected-speech) giúp bạn nhận ra vì sao từ quen có thể nghe khác.

## Khi nào nên chép chính tả?

Nghe–chép phù hợp khi bạn đọc hiểu transcript nhưng thường bỏ sót âm cuối, giới từ, trợ động từ hoặc cụm nối. Chọn 1–3 câu, nghe theo cụm và đối chiếu chính xác. Không cần chép cả bài mười phút.

Ví dụ với **The reports were sent to the regional office yesterday**, nếu bạn viết *The report was sent...*, hãy xác định mình bỏ lỡ âm số nhiều hay chưa phân biệt được chủ ngữ–động từ. [Quy trình dictation](/blog/dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh) có bảng phân loại lỗi để biến phần chép sai thành bài luyện tiếp theo.

## Lịch 14 ngày cho người mới

- **Ngày 1–3:** mỗi ngày một đoạn 20–30 giây; nghe ý chính, kiểm tra 2–3 câu và ghi loại lỗi.
- **Ngày 4–6:** giữ độ dài, thêm chép một câu có nhiều điểm gãy và nói lại sau audio.
- **Ngày 7:** nghe một đoạn mới cùng độ khó, không dùng câu đã thuộc để tự đánh giá.
- **Ngày 8–10:** tăng lên 40–60 giây hoặc thêm người nói; tiếp tục chỉ sửa những lỗi ảnh hưởng ý.
- **Ngày 11–13:** trộn nghe ý chính, chi tiết và hành động tiếp theo; với TOEIC thử một nhóm Part 2 hoặc Part 3.
- **Ngày 14:** làm lại phép đo bằng audio mới, so số điểm gãy và khả năng tóm tắt với ngày 1.

Một buổi 20 phút có thể chia 3 phút đoán bối cảnh, 5 phút nghe không chữ, 7 phút kiểm tra và sửa, 5 phút đóng chữ nghe lại. Nếu quá tải, giảm độ dài audio thay vì bỏ bước phản hồi.

## Cách biết bạn đang tiến bộ

Không dùng cảm giác “audio này nghe quen hơn” làm thước đo duy nhất. Theo dõi ba tín hiệu trên nội dung mới: bạn xác định ý chính sau ít lượt hơn; số cụm biết mặt chữ nhưng không nhận ra âm giảm; và bạn tiếp tục theo dõi được câu sau dù vừa bỏ lỡ một từ.

Mỗi tuần giữ lại một bản ghi ngắn: tên audio, lượt đầu hiểu gì, ba điểm gãy, nguyên nhân và kết quả khi đóng transcript. Sau hai tuần, lỗi lặp lại sẽ cho biết nên học từ vựng, connected speech, dictation hay chiến thuật theo dõi ý. Với mục tiêu TOEIC, đọc thêm [cách luyện Part 3–4 bằng transcript](/blog/cach-luyen-nghe-toeic-part-3-4) để chuyển quy trình này sang nhóm câu hỏi dài.

## Những cách luyện dễ tốn thời gian mà ít phản hồi

- Bật tiếng Anh cả ngày nhưng không có một khoảng nghe chủ động để kiểm tra mình bỏ lỡ gì.
- Chọn audio quá khó rồi tra gần như toàn bộ transcript.
- Xem phụ đề tiếng Việt và nghĩ mình đang nhận diện âm tiếng Anh.
- Nghe thuộc một đoạn rồi lấy chính đoạn đó để đo tiến bộ.
- Chép mọi từ nhưng không phân loại nguyên nhân sai và không nghe lại.

Mục tiêu đầu tiên không phải nghe được mọi giọng và mọi chủ đề. Hãy làm cho vòng **nghe → phát hiện điểm gãy → kiểm tra → nghe lại → thử audio mới** hoạt động đều. Khi vòng này rõ, bạn sẽ biết buổi sau cần làm gì thay vì chỉ “nghe thêm”.`
  }),
  listeningPost({
    id: "editorial-shadowing-method",
    slug: "shadowing-la-gi-cach-luyen-tieng-anh",
    title: "Shadowing là gì? Cách luyện tiếng Anh từ echo đến nói bám audio",
    excerpt: "Shadowing là nói bám gần như đồng thời với audio. Người mới nên đi từ hiểu nội dung, lặp lại có dừng, đánh dấu nhịp rồi mới shadowing và tự nghe bản ghi.",
    category: "LISTENING",
    seoTitle: "Shadowing là gì? Cách luyện tiếng Anh đúng từng bước",
    seoDescription: "Hiểu phương pháp shadowing, phân biệt với nghe rồi lặp lại và luyện theo 6 bước: chọn audio, hiểu ý, đánh dấu nhịp, echo, nói bám và tự sửa.",
    canonicalPath: "/blog/shadowing-la-gi-cach-luyen-tieng-anh",
    coverAlt: "Hai dạng sóng âm minh họa người học nói bám theo audio tiếng Anh",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Shadowing không phải bật audio rồi cố nói đuổi theo",
    socialDescription: "Đi từ echo đến nói bám audio bằng một quy trình có transcript, bản ghi và tiêu chí tự sửa.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "shadowing là gì cách luyện tiếng Anh",
    searchIntent: "SHADOWING_METHOD",
    tags: [{ name: "Shadowing", slug: "shadowing" }, { name: "Phát âm tiếng Anh", slug: "phat-am-tieng-anh" }],
    content: `## Shadowing là gì?

Shadowing là kỹ thuật nghe và lặp lại lời nói gần như đồng thời, bám sau người nói một khoảng rất ngắn như “cái bóng”. Bạn không chỉ đọc đúng từ mà còn cố theo cụm, trọng âm, nhịp, chỗ ngắt và ngữ điệu của bản gốc.

Shadowing khác **listen and repeat** hoặc **echo**. Với echo, bạn nghe hết một câu, tạm dừng rồi nói lại. Với shadowing, audio tiếp tục chạy khi bạn nói. Echo nhẹ hơn và là bước chuẩn bị tốt cho người chưa thể vừa nghe vừa nói. [British Council cũng hướng dẫn](https://africa.teachingenglish.org.uk/classroom/pronunciation/shadowing) đi từ nghe, bắt chước im lặng, nói nhỏ theo audio đến nói không cần audio.

## Shadowing luyện được gì và không thay thế điều gì?

Phương pháp này làm bạn chú ý đến cách câu thực sự được phát ra: từ nào được nhấn, từ chức năng nào yếu đi, âm cuối nối vào từ sau và người nói chia câu thành cụm thế nào. Việc nói ra cũng giúp bạn so cảm giác phát âm của mình với mẫu nghe.

Tuy nhiên, shadowing không tự dạy nghĩa từ mới hoặc bảo đảm bạn hiểu nội dung. Bạn có thể nhại đúng âm mà không biết câu đang nói gì. Nó cũng không thay thế hội thoại tự do, nơi bạn phải tự chọn ý và từ. Hãy dùng shadowing như một bài tập nhận âm–nhịp–phát âm trong lộ trình nghe và nói rộng hơn.

## Chọn audio thế nào để shadowing không thành nói lắp đuổi theo?

Chọn đoạn 10–30 giây, một người nói, âm thanh rõ, có transcript và nội dung bạn hiểu phần lớn. Tốc độ nên cho phép bạn lặp lại từng câu bằng echo sau vài lượt. Nếu ngay cả khi nhìn transcript bạn vẫn không hiểu cấu trúc, hãy học đoạn đó trước hoặc đổi audio dễ hơn.

Bạn có thể mở [audio tiếng Anh kèm transcript của TOEIC GYM](/listening-lessons), chọn một bài ngắn rồi chỉ lấy hai hoặc ba câu. Nội dung ở đây do TOEIC GYM biên soạn, có thể nghe từng câu và theo dõi script. Nếu đang luyện thi, [Part 4](/toeic/part-4) phù hợp để luyện theo một người nói; hội thoại nhiều người ở Part 3 nên dùng sau khi đã giữ được nhịp với monologue.

## Quy trình shadowing sáu bước

### 1. Nghe toàn đoạn để hiểu tình huống

Nghe không nói và không nhìn chữ ở lượt đầu. Ghi một câu về chủ đề. Shadowing khi chưa biết đoạn nói về gì khiến toàn bộ chú ý bị hút vào việc chạy theo âm.

### 2. Đọc transcript và xử lý từ cản trở ý

Tra từ hoặc cấu trúc khiến bạn không hiểu câu. Đánh dấu cụm ý bằng dấu gạch chéo. Ví dụ tự biên soạn:

**The revised schedule / will be available online / after the meeting.**

Ba cụm này hữu ích hơn việc cố nói bảy từ tách rời. Gạch chân *revised*, *available* và *after the meeting* nếu đó là các điểm mang thông tin chính.

### 3. Nghe và đánh dấu nhịp

Không phát âm vội. Nghe người nói nhấn từ nào, giảm nhẹ từ nào và dừng ở đâu. [Connected speech](https://www.teachingenglish.org.uk/teaching-resources/teaching-adults/activities/pre-intermediate-a2/shadow-reading) có thể làm ranh giới giữa các từ khác với chữ viết; đánh dấu điều bạn thật sự nghe chứ không áp một quy tắc máy móc.

### 4. Echo từng cụm

Phát một cụm, dừng, nói lại rồi nghe mẫu lần nữa. Ưu tiên rõ và đúng nhịp trước tốc độ. Nếu một cụm liên tục hỏng, rút ngắn nó hoặc đọc chậm không audio rồi quay lại bản gốc.

### 5. Nói bám audio

Phát cả câu và bắt đầu sau người nói một vài từ. Giữ audio chạy. Nếu mất nhịp, bỏ phần vừa lỡ và vào lại ở cụm tiếp theo thay vì dừng giữa lượt. Làm ba lượt: nói nhỏ để theo được, nói rõ hơn, rồi một lượt không nhìn transcript.

### 6. Thu âm và so một tiêu chí mỗi lượt

Thu bản nói không có tiếng mẫu hoặc dùng tai nghe để bản ghi dễ nghe. Lượt đầu chỉ so chỗ ngắt; lượt sau so từ nhấn; lượt tiếp theo mới nhìn âm cuối hoặc nguyên âm cụ thể. Sửa tất cả cùng lúc khiến bạn khó biết thay đổi nào có tác dụng.

## Bảng tự chấm sau một câu

Đừng chấm chung “giống người bản xứ hay chưa”. Dùng bốn câu hỏi có thể quan sát:

- Tôi có bắt đầu và kết thúc các cụm gần đúng vị trí không?
- Từ mang ý chính có được nói rõ hơn từ chức năng không?
- Âm cuối làm thay đổi nghĩa hoặc ngữ pháp có bị mất không?
- Tôi có hiểu và có thể diễn đạt lại ý của câu không?

Mỗi câu chỉ cần chọn một mục để sửa. Ví dụ, nếu **The reports were sent yesterday** bị nói thành *The report was sent*, ưu tiên số nhiều và hòa hợp trước khi lo giọng có tự nhiên hay không.

## Shadowing cho người mới bắt đầu

Người mới không cần vào thẳng full shadowing. Dùng thang bốn mức:

1. Nghe và chỉ vào transcript theo từng cụm.
2. Nghe hết cụm rồi echo.
3. Đọc cùng transcript và audio.
4. Nói bám không nhìn chữ.

Chỉ tăng mức khi bạn vẫn hiểu nội dung và không phải bỏ phần lớn câu. Nếu liên tục hụt hơi hoặc mất ba cụm liền, quay về echo. Đây là điều chỉnh độ khó, không phải thất bại.

## Shadowing để luyện nghe TOEIC

Trong TOEIC, mục tiêu không phải nói trong bài Listening. Giá trị của shadowing nằm ở việc buộc bạn nhận ra cách cụm quen thuộc phát ra ở tốc độ liền mạch. Với Part 2, luyện câu hỏi ngắn và chú ý từ đầu câu. Với Part 3–4, chọn câu chứa vấn đề, thay đổi lịch hoặc hành động tiếp theo rồi nói theo cụm.

Sau khi shadowing, đóng transcript và làm một câu hỏi về ý. Nếu nói bám tốt nhưng vẫn trả lời sai nội dung, quay lại kỹ năng nghe ý chính và bằng chứng. [Quy trình luyện Part 3–4](/blog/cach-luyen-nghe-toeic-part-3-4) giúp kết hợp đọc trước câu hỏi, nghe paraphrase và review transcript.

## Lịch 10 phút mỗi ngày

- 1 phút nghe toàn đoạn.
- 2 phút đọc hiểu và chia cụm.
- 2 phút echo câu khó.
- 3 phút shadowing ba lượt.
- 2 phút thu âm, chọn một lỗi và nói lại.

Dùng cùng một đoạn tối đa vài ngày để sửa kỹ, sau đó chuyển sang audio mới để kiểm tra khả năng chuyển giao. Nếu chỉ nói trôi chảy đoạn đã thuộc, bạn đang nhớ bài chứ chưa chắc nghe tốt hơn. Kết hợp một ngày shadowing với một ngày [nghe–chép chính tả](/blog/dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh) sẽ giúp phân biệt lỗi nhịp nói và lỗi nhận diện từng âm/cụm. Nếu chưa biết nên chọn kỹ thuật nào trước, quay lại [lộ trình luyện nghe cho người mất gốc](/blog/cach-luyen-nghe-tieng-anh-cho-nguoi-mat-goc) và phân loại lỗi bằng một đoạn mới.`
  }),
  listeningPost({
    id: "editorial-dictation-method",
    slug: "dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh",
    title: "Dictation là gì? Cách nghe–chép chính tả tiếng Anh mà không chép cả bài",
    excerpt: "Dùng dictation với đoạn 20–60 giây để tìm âm và từ bị bỏ lỡ, phân loại lỗi bằng transcript rồi nghe lại thay vì chép một bài dài cho đủ.",
    category: "LISTENING",
    seoTitle: "Dictation là gì? Cách nghe chép chính tả tiếng Anh",
    seoDescription: "Hướng dẫn dictation tiếng Anh theo 7 bước: chọn audio ngắn, nghe ý, chép theo cụm, đánh dấu chỗ trống, đối chiếu transcript và sửa lỗi nghe.",
    canonicalPath: "/blog/dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh",
    coverAlt: "Bản chép tiếng Anh có chỗ trống được đối chiếu với sóng âm và transcript",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Dictation hiệu quả không nằm ở việc chép càng dài càng tốt",
    socialDescription: "Chép một đoạn ngắn, phân loại chính xác chỗ nghe thiếu và đóng transcript để kiểm tra lại.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "dictation là gì nghe chép chính tả tiếng Anh",
    searchIntent: "DICTATION_METHOD",
    tags: [{ name: "Dictation", slug: "dictation" }, { name: "Luyện nghe tiếng Anh", slug: "luyen-nghe-tieng-anh" }],
    content: `## Dictation là gì?

Dictation trong học ngoại ngữ là nghe một đoạn nói và viết lại những gì bạn nghe được, sau đó đối chiếu với transcript. Bản chép không phải sản phẩm cuối. Giá trị nằm ở khoảng cách giữa điều người nói đã nói và điều tai bạn nhận ra.

Nếu transcript có **We’ll send an updated invoice by noon** nhưng bạn chép *We send update invoice noon*, các phần thiếu cho thấy nhiều khả năng khác nhau: không nhận ra dạng rút gọn *we’ll*, bỏ đuôi *-ed*, không nghe mạo từ và giới từ. Chỉ nhìn số từ sai sẽ không nói bạn nên luyện gì; phân loại từng lỗi mới tạo ra bài học.

## Dictation phù hợp với lỗi nào?

Phương pháp này hữu ích khi bạn biết từ trên giấy nhưng bỏ lỡ nó trong audio, thường nghe thiếu âm cuối/từ chức năng, hoặc không tách được ranh giới giữa các từ. Nó cũng cho thấy lỗi chính tả của từ bạn đã nghe đúng âm nhưng chưa viết đúng.

Dictation kém phù hợp nếu transcript chứa quá nhiều từ và cấu trúc bạn chưa biết. Khi đó, vấn đề chính là kiến thức ngôn ngữ, không chỉ nhận âm. Nó cũng không thay thế luyện nghe ý chính: chép đúng từng từ của một câu không bảo đảm bạn theo được mục đích của cả cuộc hội thoại.

## Chọn đoạn nghe: ngắn hơn bạn nghĩ

Bắt đầu bằng 20–60 giây, âm thanh rõ, có transcript chính xác và phần lớn từ vựng quen. Một đến ba câu đủ cho buổi đầu. Bài dài khiến thời gian bị dùng vào gõ/chấm thay vì sửa lỗi.

Bạn có thể nghe các bài tự biên soạn trong [thư viện audio và transcript](/listening-lessons), rồi chọn một đoạn nhỏ để chép. Khu Dictation trong sản phẩm dành cho tài khoản học tập; trang thư viện công khai vẫn cho phép nghe và theo dõi câu để bạn tự thực hiện quy trình. Với TOEIC ngắn, [Part 2](/toeic/part-2) phù hợp để bắt đầu; khi đã ổn, dùng một phần hội thoại [Part 3](/toeic/part-3).

## Quy trình dictation bảy bước

### 1. Nghe toàn đoạn một lần

Không viết. Ghi chủ đề, người nói và hành động chính. Bước này giữ kỹ năng hiểu ý, tránh biến nghe thành bài chính tả thuần túy.

### 2. Chia audio thành cụm ngắn

Nghe 3–7 giây rồi tạm dừng. Nếu công cụ không chia câu, tự chọn điểm dừng tự nhiên. Đừng dừng sau mỗi từ vì lời nói được xử lý theo cụm.

### 3. Viết phần chắc chắn nghe được

Dùng gạch dưới cho phần thiếu và dấu hỏi cho từ không chắc. Không đoán bằng ngữ pháp ngay lập tức. Ví dụ: **The shipment ___ delayed ___ the storm.** Việc giữ chỗ trống giúp bạn biết chính xác cần nghe lại đâu.

### 4. Nghe lại có giới hạn

Nghe mỗi cụm thêm hai hoặc ba lượt. Nếu vẫn không nghe được, giữ chỗ trống và đi tiếp. Lặp mười lần cùng một âm không có phản hồi thường chỉ làm bạn mệt.

### 5. Đối chiếu transcript theo cụm

Dùng màu hoặc ký hiệu khác để sửa, đừng xóa bản đầu. Giữ bằng chứng giúp bạn nhận ra lỗi lặp. Nếu câu gốc là **The shipment was delayed because of the storm**, phần *was* và *because of* cần được đánh dấu riêng.

### 6. Gắn nhãn nguyên nhân

- **V:** vocabulary — chưa biết từ hoặc cụm.
- **S:** sound — biết từ nhưng không nhận ra âm.
- **B:** boundary — không tách được ranh giới giữa các từ.
- **G:** grammar — nghe gần đúng nhưng điền sai dạng vì chưa hiểu cấu trúc.
- **Sp:** spelling — nhận đúng từ nhưng viết sai.

Mỗi buổi chỉ chọn một hoặc hai lỗi lặp để sửa. Nếu mọi từ đều được đánh dấu, audio đang quá khó.

### 7. Nghe lại và đọc/nói theo

Mở transcript, nghe một lượt và chỉ vào các cụm. Sau đó đóng transcript, nghe lại và kiểm tra chỗ từng bị thiếu. Cuối cùng echo hoặc [shadowing](/blog/shadowing-la-gi-cach-luyen-tieng-anh) một câu quan trọng để nối nhận âm với cách phát ra.

## Ví dụ chữa một câu TOEIC tự biên soạn

Audio: **Could you send me the revised floor plan by Thursday?**

Bản chép đầu: *Could send me revise floor plan Thursday?*

- Thiếu *you*: có thể là từ chức năng phát nhẹ hoặc người học tập trung quá sớm vào động từ chính.
- *revised* thành *revise*: bỏ âm cuối /d/, vừa là lỗi âm vừa làm mất vai trò tính từ.
- Thiếu *the* và *by*: các từ ngắn ít được nhấn nhưng *by Thursday* quyết định hạn chót.

Bài sửa không phải chép lại câu mười lần. Hãy nghe cụm **the revised floor plan**, echo ba lần, rồi dùng một câu mới như **the updated seating chart** để kiểm tra xem bạn có nhận ra cùng mẫu hay chỉ thuộc câu cũ.

## Dictation và TOEIC Listening

Với Part 1–2, bạn có thể chép cả câu vì câu ngắn. Với Part 3–4, không nên chép toàn hội thoại hoặc bài nói trong lúc làm đề; hãy dùng dictation ở bước chữa bài, chỉ chọn câu chứa đáp án, paraphrase hoặc điểm bạn mất dấu.

Ví dụ câu hỏi hỏi hành động tiếp theo, transcript có **I’ll contact the supplier this afternoon** còn đáp án viết *Call a vendor*. Chép và phân tích cụm đó giúp bạn vừa nhận âm vừa thấy paraphrase. [Cách luyện Part 3–4](/blog/cach-luyen-nghe-toeic-part-3-4) đặt dictation vào quy trình đọc câu hỏi, nghe và sửa transcript đầy đủ hơn.

## Lịch dictation 15 phút

- 2 phút nghe ý chính.
- 5 phút chép 1–3 câu với số lượt nghe giới hạn.
- 4 phút đối chiếu và gắn nhãn lỗi.
- 2 phút nghe lại, đóng transcript.
- 2 phút echo câu khó hoặc thử một câu mới cùng đặc điểm.

Sau bảy ngày, đếm loại lỗi thay vì chỉ đếm số từ. Nếu lỗi S/B chiếm đa số, học [nối âm và dạng yếu](/blog/noi-am-tieng-anh-cach-nghe-connected-speech). Nếu lỗi V nhiều, giảm độ khó và học cụm từ theo ngữ cảnh. Nếu bạn chép khá đúng nhưng không trả lời được câu hỏi, tăng bài nghe ý chính và tóm tắt.

## Sai lầm thường gặp

- Chép đoạn quá dài để cảm thấy mình học nhiều.
- Mở transcript trước lượt nghe đầu.
- Đoán câu theo ngữ pháp rồi tưởng mình đã nghe được.
- Chỉ sửa chính tả mà không nghe lại phần sai.
- Luyện mãi một audio đã thuộc.
- Xem mọi từ thiếu là do “tai kém” dù thực tế chưa biết cụm từ.

Một buổi dictation tốt kết thúc bằng việc bạn biết **vì sao** mình bỏ lỡ âm và có một lượt nghe lại không nhìn chữ. Bản chép chỉ là công cụ làm lỗi nghe trở nên nhìn thấy được.`
  }),
  listeningPost({
    id: "editorial-connected-speech",
    slug: "noi-am-tieng-anh-cach-nghe-connected-speech",
    title: "Nối âm tiếng Anh và connected speech: vì sao biết từ mà vẫn nghe không ra?",
    excerpt: "Nhận diện nối phụ âm–nguyên âm, âm yếu, co rút và âm cuối trong câu nói tự nhiên; luyện để nghe rõ hơn mà không cần cố bắt chước giọng bản xứ.",
    category: "LISTENING",
    seoTitle: "Nối âm tiếng Anh: cách nghe connected speech dễ hơn",
    seoDescription: "Hiểu nối âm tiếng Anh, dạng yếu, co rút và âm cuối bằng ví dụ công việc. Luyện nghe connected speech theo cụm để nhận ra những từ đã biết.",
    canonicalPath: "/blog/noi-am-tieng-anh-cach-nghe-connected-speech",
    coverAlt: "Các từ tiếng Anh được nối thành cụm trên một dải sóng âm",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Biết từ nhưng nghe không ra: hãy nhìn vào connected speech",
    socialDescription: "Bốn hiện tượng làm câu nói khác chữ viết và một quy trình nghe–đánh dấu–thử lại bằng câu mới.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "nối âm tiếng Anh connected speech",
    searchIntent: "CONNECTED_SPEECH_LISTENING",
    tags: [{ name: "Nối âm tiếng Anh", slug: "noi-am-tieng-anh" }, { name: "Connected speech", slug: "connected-speech" }],
    content: `## Connected speech là gì?

Connected speech là cách các âm thay đổi hoặc liên kết khi từ được nói trong một chuỗi tự nhiên. Trên trang giấy, **pick / it / up** có ba từ với khoảng trắng. Khi nói liền, phụ âm cuối của *pick* chảy sang nguyên âm đầu của *it*, khiến người mới khó tìm ranh giới từ.

Đây là một lý do phổ biến khiến bạn biết mọi từ trong transcript nhưng không nhận ra chúng trong audio. [British Council mô tả](https://www.britishcouncil.org/voices-magazine/pop-songs-connected-speech-fluent-english) các hiện tượng như nối phụ âm–nguyên âm, lược âm và dạng yếu. Mục tiêu của người học trước hết là **nhận ra khi nghe**; bạn không cần bắt chước mọi biến đổi để nói giống một giọng bản xứ.

## 1. Nối phụ âm cuối với nguyên âm đầu

Khi một từ kết thúc bằng âm phụ âm và từ sau bắt đầu bằng âm nguyên âm, hai âm thường được nói liền. Ví dụ tự biên soạn:

- **send it** nghe như một cụm, không có khoảng dừng sau *send*;
- **pick up an order** có các ranh giới *pick‿up* và *up‿an*;
- **leave at eight** nối *leave‿at* và *at‿eight*.

Đừng học bằng chữ cái cuối/đầu một cách máy móc; điều quyết định là **âm**. Hãy nghe cụm, gạch một vòng cung giữa hai từ rồi echo cả cụm. Sau đó thử câu mới có cùng cấu trúc âm để tránh chỉ thuộc một ví dụ.

## 2. Từ chức năng và dạng yếu

Các từ mang nội dung như danh từ, động từ chính và tính từ thường nổi bật hơn. Mạo từ, giới từ, trợ động từ và đại từ có thể ngắn hoặc nhẹ đi trong câu. Vì vậy, người học dễ nghe **report sent manager** nhưng bỏ lỡ *the*, *was* và *to* trong **The report was sent to the manager**.

Từ yếu không phải lúc nào cũng không quan trọng. *Was sent* cho biết bị động; *to the manager* cho biết người nhận. Khi luyện, nghe cả cụm và đoán vai trò ngữ pháp trước khi phát lại. [British Council lưu ý](https://www.britishcouncil.org/voices-magazine/how-teach-english-lingua-franca-elf) nhận biết connected speech có ích cho kỹ năng nghe, trong khi người học không nhất thiết phải sản xuất mọi đặc điểm để giao tiếp rõ.

## 3. Dạng rút gọn

Trong lời nói, **I’ll, we’re, they’ve, didn’t, can’t** xuất hiện thường xuyên. Nếu bạn chỉ quen dạng đầy đủ trên giấy, đầu câu **We’ll email the receipt** có thể bị nghe nhầm thành một âm không mang nghĩa.

Luyện theo cặp nhưng đặt trong câu:

- **We will send it** → **We’ll send it.**
- **They have changed the date** → **They’ve changed the date.**
- **She is waiting outside** → **She’s waiting outside.**

Nghe câu, xác định chủ ngữ và thời gian, rồi mới nhìn transcript. Việc hiểu cấu trúc giúp não dự đoán loại âm ngắn có thể đứng ở đó.

## 4. Âm cuối có thể nhẹ nhưng vẫn mang thông tin

Âm cuối của số nhiều, quá khứ hoặc phân từ dễ bị bỏ lỡ trong chuỗi nói. **report/reports**, **change/changed** và **work/worked** có thể làm thay đổi số lượng hoặc thời gian. Trong TOEIC, chi tiết đó có thể quyết định đáp án.

Ví dụ: **The updated contracts were emailed yesterday.** Nếu chỉ nghe *contract* và *email*, bạn có thể bỏ qua số nhiều, bị động và mốc thời gian. Khi chữa, đánh dấu *-s*, *were* và *-ed*; nghe lại cả cụm **contracts were emailed**, không cô lập một chữ cái.

## Nối âm không có nghĩa nói càng nhanh càng tốt

Connected speech xuất hiện vì người nói tổ chức âm thành cụm và nhịp, không phải vì họ cố nuốt mọi từ. Bắt chước bằng cách xóa âm tùy ý có thể làm câu khó hiểu hơn. Với người học, ưu tiên phát âm rõ âm mang nghĩa, đặt trọng âm hợp lý và nối tự nhiên khi hai âm gặp nhau.

Khi nghe, cũng đừng cố “bắt” đủ từng từ trước khi hiểu. Dùng từ nội dung để dựng bối cảnh, sau đó quay lại từ yếu ở bước chữa. [British Council gợi ý](https://www.britishcouncil.org/voices-magazine/five-essential-listening-skills-english-learners) nghe từ nội dung để tạo bức tranh chung và nhận các tín hiệu tổ chức ý.

## Quy trình luyện connected speech với một câu

Dùng câu tự biên soạn **Could you look over the updated estimate before our meeting?**

1. Nghe không nhìn chữ và ghi các từ nổi bật bạn nhận ra.
2. Mở transcript, khoanh cụm *look over*, *updated estimate*, *before our meeting*.
3. Đánh dấu nơi phụ âm nối nguyên âm và các từ có thể nhẹ đi.
4. Nghe lại ở tốc độ gốc, chỉ tay theo cụm thay vì từng từ.
5. Echo từng cụm, sau đó [shadowing](/blog/shadowing-la-gi-cach-luyen-tieng-anh) cả câu.
6. Đóng transcript và chép lại một lượt.
7. Thử câu mới: **Please check over the agenda before our call.**

Bước 7 quan trọng vì nó kiểm tra khả năng nhận mẫu trong câu mới. Nói trôi chảy duy nhất câu đã nghe mười lần chưa chứng minh bạn sẽ nhận ra hiện tượng đó ở bài khác.

## Áp dụng vào TOEIC Listening

### Part 1–2

Chú ý cụm động từ, giới từ vị trí và dạng rút gọn ở đầu câu hỏi. Nếu bỏ lỡ từ hỏi hoặc trợ động từ, bạn có thể chọn đáp án có từ trùng nhưng sai ý. Thử [mẫu Part 2 có giải thích](/toeic/part-2) và ghi cụm đã nghe nhầm.

### Part 3–4

Không dừng tinh thần ở một từ mất. Theo dõi các từ nội dung: người, vấn đề, thời gian và hành động tiếp theo. Khi chữa, chỉ chọn câu chứa bằng chứng hoặc nơi bạn mất chuỗi để phân tích connected speech. [Bài luyện Part 3–4](/blog/cach-luyen-nghe-toeic-part-3-4) giúp đặt kỹ thuật này vào quy trình làm câu hỏi.

## Kết hợp dictation và shadowing

[Dictation](/blog/dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh) cho biết chính xác từ hoặc âm bạn bỏ lỡ. Shadowing giúp bạn cảm nhận nhịp và cách cụm được phát ra. Một buổi có thể chép hai câu, phân loại lỗi connected speech, rồi shadowing đúng hai câu đó.

Mở [thư viện audio có transcript](/listening-lessons), chọn đoạn ngắn và giữ bảng lỗi gồm: cụm nghe nhầm, transcript đúng, hiện tượng âm, ý nghĩa của cụm và một câu mới. Sau một tuần, nếu cùng loại lỗi tiếp tục xuất hiện, tập trung thêm vào nó; nếu lỗi giảm trên audio mới, chuyển sang đoạn dài hơn.

## Checklist khi “biết từ mà nghe không ra”

- Tôi có biết nghĩa cả cụm hay chỉ biết từng từ?
- Có dạng rút gọn hoặc từ chức năng phát nhẹ không?
- Phụ âm cuối có nối sang nguyên âm đầu từ sau không?
- Tôi bỏ lỡ âm cuối mang số nhiều/thì/bị động không?
- Tôi đã nghe lại không transcript sau khi phân tích chưa?
- Tôi có thử một câu mới cùng hiện tượng không?

Connected speech không phải danh sách mẹo để đoán đề. Nó là cầu nối giữa từ bạn thấy trên trang và chuỗi âm bạn thực sự nghe. Luyện theo cụm, có phản hồi và kiểm tra bằng audio mới sẽ hữu ích hơn cố ghi nhớ một cách đọc duy nhất cho mọi giọng.`
  }),
];
