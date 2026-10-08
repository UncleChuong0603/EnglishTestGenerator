import type { EditorialPost } from "./editorial";

const dates = {
  publishedAt: new Date("2026-10-08T03:00:00.000Z"),
  createdAt: new Date("2026-10-08T03:00:00.000Z"),
  updatedAt: new Date("2026-10-08T03:00:00.000Z"),
};

function pronunciationPost(input: Omit<EditorialPost, "status" | "coverMediaId" | "noindex" | "createdBy" | "updatedBy" | "contentOrigin" | "publishedAt" | "createdAt" | "updatedAt">): EditorialPost {
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

export const PRONUNCIATION_GROWTH_POSTS: EditorialPost[] = [
  pronunciationPost({
    id: "editorial-final-consonants-english",
    slug: "am-cuoi-tieng-anh-cach-phat-am-khong-them-am",
    title: "Âm cuối tiếng Anh: cách nghe và phát âm rõ mà không thêm âm",
    excerpt: "Phân biệt âm cuối hữu thanh, vô thanh và âm chặn; sửa lỗi bỏ âm hoặc thêm “ờ” bằng câu công sở và quy trình nghe–ghi âm ngắn.",
    category: "LISTENING",
    seoTitle: "Âm cuối tiếng Anh: cách phát âm không thêm âm",
    seoDescription: "Học âm cuối tiếng Anh bằng cặp từ, câu công sở và quy trình nghe–ghi âm. Sửa lỗi bỏ âm, thêm âm “ờ” và nghe thiếu dấu hiệu ngữ pháp.",
    canonicalPath: "/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am",
    coverAlt: "Sơ đồ nhận diện phụ âm cuối trong một câu tiếng Anh công việc",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Đừng bật thêm “ờ”: luyện âm cuối để nghe tiếng Anh rõ hơn",
    socialDescription: "Một quy trình ngắn để nhận ra và phát âm âm cuối mà không tách câu thành từng chữ.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "âm cuối tiếng Anh cách phát âm ending sounds",
    searchIntent: "FINAL_CONSONANTS_LISTENING_PRACTICE",
    tags: [{ name: "Phát âm tiếng Anh", slug: "phat-am-tieng-anh" }, { name: "TOEIC Listening", slug: "toeic-listening" }],
    content: `## Âm cuối tiếng Anh là gì?

Âm cuối là âm đứng ở cuối một âm tiết hoặc một từ. Trong **desk** /desk/, phần kết thúc là cụm /sk/; trong **need** /niːd/, âm cuối là /d/. Chữ viết chỉ giúp bạn đoán, còn âm thực tế phải được kiểm tra bằng phiên âm và audio của từ điển.

Với người học Việt Nam, khó khăn không chỉ là “đọc cho hay”. Nếu bỏ /s/ trong **reports**, /d/ trong **revised** hoặc /z/ trong **needs**, bạn có thể mất luôn dấu hiệu số nhiều, quá khứ hoặc động từ ngôi thứ ba khi nghe. TOEIC Listening không hỏi tên âm, nhưng các dấu hiệu này giúp bạn xác định ai làm gì và việc đã xảy ra hay chưa.

## Ba lỗi âm cuối thường làm câu khó hiểu

### Bỏ hẳn âm cuối

Nếu **rice** và **rise**, **back** và **bag**, **seat** và **seed** đều kết thúc giống nhau trong cách bạn nghe hoặc nói, thông tin phân biệt từ đã biến mất. Hãy luyện cặp từ trong câu ngắn, không chỉ đọc hai từ rời.

### Thêm một nguyên âm sau phụ âm

Người học đôi khi biến **desk** thành gần giống “desk-cờ” hoặc **need** thành “need-đờ”. Cách này tạo thêm một âm tiết không có trong từ. Với /p, b, t, d, k, g/, mục tiêu có thể chỉ là chặn luồng hơi hoặc đặt đúng vị trí miệng; không nhất thiết bật phụ âm thật mạnh.

### Đọc mọi phụ âm cuối quá mạnh

Âm cuối cần đủ rõ để giữ nghĩa nhưng không phải lúc nào cũng được nhả mạnh như khi đứng đầu từ. Trong lời nói tự nhiên, phụ âm tắc cuối có thể ít được giải phóng, đặc biệt trước một phụ âm khác. “Không bật mạnh” khác với “xóa âm”: người nghe vẫn nhận ra vị trí đóng và chuyển động sang từ kế tiếp.

## Phân biệt hữu thanh và vô thanh bằng cảm giác rung

Đặt nhẹ ngón tay lên cổ họng. Khi nói /z/, /v/, /d/ hoặc /g/, bạn thường cảm thấy dây thanh rung; với /s/, /f/, /t/ hoặc /k/, độ rung không giống vậy. Các cặp đáng luyện gồm:

- /s/ và /z/: **rice – rise**, **price – prize**;
- /f/ và /v/: **safe – save**, **proof – prove**;
- /t/ và /d/: **seat – seed**, **wait – weighed**;
- /k/ và /g/: **back – bag**, **pick – pig**.

Đừng chỉ nhìn chữ cuối. **Laugh** kết thúc bằng âm /f/ dù chữ cuối là *gh*; **use** có thể kết thúc /s/ ở danh từ và /z/ ở động từ. Khi chưa chắc, tra phiên âm và nghe cả từ trong câu.

## Cách phát âm phụ âm chặn mà không thêm “ờ”

Với /p, b/, khép hai môi rồi dừng. Với /t, d/, đầu lưỡi chạm vùng ngay sau răng trên. Với /k, g/, phần sau lưỡi chạm vòm mềm. Giữ vị trí kết thúc trong một nhịp rất ngắn rồi chuyển sang từ sau; không mở miệng để tạo thêm nguyên âm.

Thử câu tự biên soạn: **The client sent the updated contract.** Chia thành ba cụm: *the client* | *sent the updated* | *contract*. Đọc chậm để giữ /t/ cuối *client*, /t/ cuối *sent* và /t/ cuối *contract*, sau đó tăng tốc nhưng không chèn nguyên âm giữa các từ.

Khi phụ âm cuối đứng trước nguyên âm, nó có thể nối mượt sang từ sau. **Send it** nghe liền hơn hai từ tách biệt, nhưng /d/ vẫn thuộc về *send*. Đọc [hướng dẫn connected speech](/blog/noi-am-tieng-anh-cach-nghe-connected-speech) để luyện ranh giới từ mà không xóa dấu hiệu ngữ pháp.

## Âm cuối mang thông tin ngữ pháp trong câu công việc

Hãy đánh dấu ba loại tín hiệu:

- số nhiều: **reports, files, invoices, offices**;
- ngôi thứ ba số ít: **needs, checks, processes**;
- quá khứ hoặc phân từ: **revised, shipped, approved**.

Trong câu **The manager needs the revised files**, *needs* và *files* kết thúc /z/, còn *revised* kết thúc /d/. Nếu bỏ cả ba, câu vẫn có thể đoán được bằng ngữ cảnh nhưng người nghe phải làm nhiều việc hơn và dễ nhầm số lượng hoặc thời gian.

Hai nhóm đuôi có quy tắc riêng. Học [cách phát âm -s/-es](/blog/cach-phat-am-s-es-tieng-anh) để phân biệt /s/, /z/, /ɪz/ và [cách phát âm -ed](/blog/cach-phat-am-ed-tieng-anh) để phân biệt /t/, /d/, /ɪd/.

## Quy trình nghe–ghi âm trong tám phút

1. Chọn một câu 5–10 giây từ [thư viện bài nghe](/listening-lessons).
2. Nghe không transcript và ghi các từ bạn nhận ra.
3. Mở transcript, khoanh âm cuối đã bỏ lỡ.
4. Nghe lại ở tốc độ gốc, tập trung vào một âm duy nhất.
5. Đọc theo từng cụm rồi ghi âm câu của mình.
6. So xem bạn bỏ âm, thêm nguyên âm hay bật âm quá mạnh.
7. Ghi một lỗi cụ thể, ví dụ “bỏ /d/ trong revised”.
8. Ngày hôm sau nghe lại đúng câu trước khi lấy câu mới.

[Dictation tiếng Anh](/blog/dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh) phù hợp khi bạn thường viết thiếu *-s*, *-ed* hoặc từ chức năng. Nếu đã nghe ra từ nhưng miệng chưa theo kịp, chuyển sang [shadowing theo cụm](/blog/shadowing-la-gi-cach-luyen-tieng-anh).

## Cách tự kiểm tra thay vì chỉ đọc quy tắc

Tạo ba cột: “nghe thấy”, “phiên âm đúng”, “lỗi của tôi”. Với **approved** /əˈpruːvd/, nếu bạn nghe thành *approve*, lỗi là bỏ /d/. Với **reports** /rɪˈpɔːrts/, nếu bạn thêm một âm tiết sau /s/, lỗi là thêm nguyên âm.

Không cần sửa mười âm trong một buổi. Chọn một cặp như /s–z/ hoặc /t–d/, thu năm câu công sở và nghe lại sau 24 giờ. Mục tiêu là người nghe nhận đúng từ và dấu hiệu ngữ pháp, không phải xóa giọng Việt.

## Lộ trình tiếp theo cho TOEIC Listening

Sau mini-practice ở đầu bài, mở [hub luyện nghe TOEIC](/toeic/listening), chọn Part bạn đang yếu rồi tìm một câu có đuôi mục tiêu. Với câu hỏi–đáp ngắn, [Part 2](/toeic/part-2) giúp bạn nghe quan hệ giữa thì, chủ thể và phản hồi. Với đoạn dài, ghi lỗi theo transcript thay vì nghe lặp lại vô hạn.

[British Council khuyên ghi cả âm và trọng âm khi học từ mới](https://learnenglish.britishcouncil.org/level/improve-your-english-level/six-tips-speaking-english-internationally). Thêm phiên âm, âm cuối và một câu ngữ cảnh vào cùng thẻ từ giúp phát âm phục vụ nghe hiểu, thay vì trở thành một danh sách ký hiệu riêng.`
  }),
  pronunciationPost({
    id: "editorial-s-es-pronunciation",
    slug: "cach-phat-am-s-es-tieng-anh",
    title: "Cách phát âm s/es: phân biệt /s/, /z/, /ɪz/ bằng âm cuối",
    excerpt: "Quy tắc phát âm -s/-es dựa trên âm cuối, ví dụ công sở, cách đếm âm tiết và bài luyện giúp nghe rõ số nhiều lẫn động từ ngôi thứ ba.",
    category: "LISTENING",
    seoTitle: "Cách phát âm s/es: /s/, /z/, /ɪz/ dễ nhớ",
    seoDescription: "Nắm cách phát âm s/es theo âm cuối, không học mẹo chữ cái máy móc. Có ví dụ TOEIC công sở, lỗi thường gặp và bài tập kèm lời giải.",
    canonicalPath: "/blog/cach-phat-am-s-es-tieng-anh",
    coverAlt: "Ba nhóm phát âm đuôi s es trong các từ tiếng Anh công sở",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Đuôi s/es không chỉ có âm /s/",
    socialDescription: "Phân loại /s/, /z/, /ɪz/ bằng âm cuối và luyện ngay với từ công việc.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "cách phát âm s es tiếng Anh",
    searchIntent: "S_ES_PRONUNCIATION_PRACTICE",
    tags: [{ name: "Phát âm s/es", slug: "phat-am-s-es" }, { name: "Phát âm tiếng Anh", slug: "phat-am-tieng-anh" }],
    content: `## Vì sao cùng viết s/es nhưng có ba cách đọc?

Đuôi **-s/-es** có thể đánh dấu danh từ số nhiều, động từ ngôi thứ ba số ít hoặc dạng sở hữu. Cách đọc không được quyết định đơn giản bởi chữ cái cuối, mà bởi **âm cuối của từ gốc**. Ba kết quả phổ biến là /s/, /z/ và /ɪz/.

Ví dụ: **reports** kết thúc /s/, **plans** kết thúc /z/, còn **offices** có thêm âm tiết /ɪz/. Nhìn cả ba từ đều có chữ *s* không đủ để chọn cách đọc.

## Nhóm 1: đọc /s/ sau âm vô thanh không xì

Đọc /s/ sau các âm vô thanh /p, t, k, f, θ/. Cổ họng không rung khi đọc phần kết thúc.

- **reports** /rɪˈpɔːrts/: từ gốc kết thúc /t/;
- **desks** /desks/: từ gốc kết thúc /k/;
- **graphs** /ɡræfs/: từ gốc kết thúc /f/;
- **months** /mʌnθs/: từ gốc kết thúc /θ/;
- **stops** /stɒps/: từ gốc kết thúc /p/.

Đừng thêm nguyên âm sau /s/. **Reports** vẫn có hai âm tiết như *report*, không trở thành *report-sờ*.

## Nhóm 2: đọc /z/ sau nguyên âm hoặc âm hữu thanh

Sau nguyên âm và các phụ âm hữu thanh không thuộc nhóm âm xì, đuôi đọc /z/. Bạn có thể cảm thấy cổ họng rung.

- **plans** /plænz/ sau /n/;
- **files** /faɪlz/ sau /l/;
- **meetings** /ˈmiːtɪŋz/ sau /ŋ/;
- **employees** /ɪmˈplɔɪ.iːz/ sau nguyên âm;
- **calls** /kɔːlz/ sau /l/;
- **receives** /rɪˈsiːvz/ sau /v/.

Lỗi phổ biến là đọc mọi chữ *s* thành /s/. Trong câu **The manager needs the files**, cả *needs* và *files* đều kết thúc bằng /z/.

## Nhóm 3: đọc /ɪz/ sau âm xì

Khi từ gốc kết thúc /s, z, ʃ, ʒ, tʃ, dʒ/, thêm một âm tiết /ɪz/. Miệng cần khoảng chuyển tiếp vì hai âm xì đứng sát nhau khó đọc trực tiếp.

- **offices** /ˈɒfɪsɪz/ sau /s/;
- **changes** /ˈtʃeɪndʒɪz/ sau /dʒ/;
- **messages** /ˈmesɪdʒɪz/ sau /dʒ/;
- **watches** /ˈwɒtʃɪz/ sau /tʃ/;
- **packages** /ˈpækɪdʒɪz/ sau /dʒ/;
- **revises** /rɪˈvaɪzɪz/ sau /z/.

[Cambridge Grammar xác nhận -es sau các âm như /tʃ/ hoặc /s/ được phát âm /ɪz/](https://dictionary.cambridge.org/us/grammar/british-grammar/plurals). Hãy nghe từ điển khi một từ có biến thể phát âm theo giọng.

## Quy tắc một dòng và điểm dễ nhầm

Quy trình chọn:

1. Bỏ đuôi *-s/-es* để tìm từ gốc.
2. Xác định **âm cuối**, không phải chữ cuối.
3. Nếu là âm xì, chọn /ɪz/.
4. Nếu không phải âm xì nhưng vô thanh, chọn /s/.
5. Các âm còn lại chọn /z/.

Ví dụ **laughs** có từ gốc *laugh* kết thúc /f/, nên đuôi là /s/. **Goes** có từ gốc *go* kết thúc bằng nguyên âm, nên đuôi là /z/, không phải /ɪz/. Chính tả *-es* không tự động tạo /ɪz/.

## S/es giúp nghe ngữ pháp trong TOEIC thế nào?

Trong Listening, âm cuối giúp phân biệt:

- **The assistant checks the schedule**: động từ hiện tại ngôi thứ ba;
- **The assistants check the schedule**: danh từ số nhiều, động từ nguyên mẫu;
- **The office closes at six**: *office* là số ít, *closes* có /ɪz/;
- **The offices close at six**: *offices* có /ɪz/, động từ không thêm *-s*.

Nếu chỉ nghe từ khóa *assistant, check, schedule*, bạn vẫn có thể bỏ lỡ ai là chủ thể và có một hay nhiều người. Kết hợp bài này với [hòa hợp chủ ngữ–động từ](/blog/hoa-hop-chu-ngu-dong-tu-toeic) để nối âm thanh với cấu trúc.

## Bài luyện theo cụm công việc

Đọc ba lượt, mỗi lượt giữ nhịp tự nhiên:

- /s/: **weekly reports**, **payment receipts**, **product checks**;
- /z/: **travel plans**, **digital files**, **sales calls**;
- /ɪz/: **branch offices**, **schedule changes**, **email messages**.

Sau đó đặt từng cụm vào câu: **The branch offices receive weekly reports.** Đánh dấu *offices* /ɪz/, *receives* /z/ nếu đổi chủ thể thành số ít, và *reports* /s/. Thu âm cả câu để kiểm tra bạn có thêm âm tiết sai sau /s/ hoặc /z/ không.

## Quy trình nghe và sửa lỗi trong bảy phút

1. Chọn một đoạn ngắn trong [thư viện Listening](/listening-lessons).
2. Ghi lại mọi từ bạn nghĩ có số nhiều hoặc động từ thêm *-s*.
3. Mở transcript và xác định âm cuối của từ gốc.
4. Phân loại /s/, /z/ hoặc /ɪz/.
5. Nghe lại đúng vị trí đó ba lần.
6. Đọc theo cả cụm, không đọc đuôi riêng lẻ.
7. Ngày hôm sau làm lại không nhìn quy tắc.

Nếu bạn thường bỏ cả phụ âm cuối của từ gốc, học [âm cuối tiếng Anh](/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am) trước. Nếu vấn đề là người nói nối từ khiến bạn không tìm thấy ranh giới, chuyển sang [connected speech](/blog/noi-am-tieng-anh-cach-nghe-connected-speech).

## Checklist tự chấm

- Tôi xác định bằng âm cuối thay vì nhìn chữ cái chưa?
- Tôi có thêm một âm tiết chỉ ở nhóm /ɪz/ không?
- /z/ có độ rung nhưng không biến thành “dờ” không?
- Tôi giữ được dấu hiệu số nhiều hoặc ngôi thứ ba trong cả câu không?
- Tôi đã nghe mẫu từ điển trước khi ghi âm chưa?

Làm mini-practice ở đầu bài, rồi chọn một bài dictation trong [thư viện luyện nghe](/listening-lessons). Khi chấm, đừng chỉ ghi “sai phát âm”; hãy ghi rõ “đọc /s/ thay vì /z/ sau /n/” hoặc “thêm âm tiết vào reports”. Lỗi càng cụ thể, buổi ôn sau càng ngắn.`
  }),
  pronunciationPost({
    id: "editorial-ed-pronunciation",
    slug: "cach-phat-am-ed-tieng-anh",
    title: "Cách phát âm ed: chọn /t/, /d/, /ɪd/ theo âm cuối",
    excerpt: "Hiểu ba cách đọc -ed bằng âm cuối của động từ gốc, luyện với động từ công sở và tránh thêm âm tiết vào mọi từ quá khứ.",
    category: "LISTENING",
    seoTitle: "Cách phát âm ed: /t/, /d/, /ɪd/ kèm bài tập",
    seoDescription: "Quy tắc phát âm ed theo âm cuối của động từ gốc, ví dụ công sở và bài tập có lời giải. Phân biệt /t/, /d/, /ɪd/ không học vẹt.",
    canonicalPath: "/blog/cach-phat-am-ed-tieng-anh",
    coverAlt: "Ba cách phát âm đuôi ed trong động từ tiếng Anh công việc",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Đuôi -ed không phải lúc nào cũng thành một âm tiết",
    socialDescription: "Nhìn âm cuối của động từ gốc để chọn /t/, /d/ hoặc /ɪd/.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "cách phát âm ed tiếng Anh",
    searchIntent: "ED_PRONUNCIATION_PRACTICE",
    tags: [{ name: "Phát âm -ed", slug: "phat-am-ed" }, { name: "Phát âm tiếng Anh", slug: "phat-am-tieng-anh" }],
    content: `## Ba cách phát âm -ed

Với động từ có quy tắc, **-ed** thường được đọc /t/, /d/ hoặc /ɪd/. Cách chọn phụ thuộc vào **âm cuối của động từ gốc**, không phụ thuộc vào chữ cái đứng trước *ed* theo cách nhìn đơn giản.

- **checked** /tʃekt/: /t/;
- **planned** /plænd/: /d/;
- **needed** /ˈniːdɪd/: /ɪd/.

Chỉ nhóm /ɪd/ tạo thêm một âm tiết. Vì vậy, *checked* vẫn là một âm tiết, *approved* có hai âm tiết như động từ gốc *approve*, còn *needed* có hai âm tiết thay vì một.

## Khi nào -ed đọc /ɪd/?

Sau /t/ hoặc /d/, đọc /ɪd/. Một nguyên âm ngắn được thêm vào để hai âm tắc không dồn sát nhau.

- **wanted** /ˈwɒntɪd/;
- **needed** /ˈniːdɪd/;
- **updated** /ʌpˈdeɪtɪd/;
- **attended** /əˈtendɪd/;
- **started** /ˈstɑːtɪd/;
- **decided** /dɪˈsaɪdɪd/.

Hãy nghe số âm tiết. **Update** có hai âm tiết, **updated** có ba. Đây là nhóm duy nhất trong quy tắc cơ bản mà *-ed* tạo thêm âm tiết.

## Khi nào -ed đọc /t/?

Sau phụ âm vô thanh /p, k, f, s, ʃ, tʃ, θ/, đọc /t/. Cả âm gốc và đuôi đều vô thanh.

- **stopped** /stɒpt/ sau /p/;
- **checked** /tʃekt/ sau /k/;
- **laughed** /læft/ sau /f/;
- **processed** /ˈprəʊsest/ sau /s/;
- **finished** /ˈfɪnɪʃt/ sau /ʃ/;
- **watched** /wɒtʃt/ sau /tʃ/;
- **shipped** /ʃɪpt/ sau /p/.

Không đọc *checked* thành “check-id”. Khép từ ở cụm /kt/ mà không thêm nguyên âm giữa hoặc sau hai phụ âm.

## Khi nào -ed đọc /d/?

Sau nguyên âm hoặc phụ âm hữu thanh còn lại, trừ /d/, đọc /d/.

- **planned** /plænd/ sau /n/;
- **approved** /əˈpruːvd/ sau /v/;
- **cleaned** /kliːnd/ sau /n/;
- **called** /kɔːld/ sau /l/;
- **received** /rɪˈsiːvd/ sau /v/;
- **agreed** /əˈɡriːd/ sau nguyên âm;
- **confirmed** /kənˈfɜːmd/ sau /m/.

Bạn có thể dùng cảm giác rung ở cổ họng để phân biệt nhóm /d/ và /t/, nhưng vẫn nên nghe mẫu vì cụm phụ âm cuối có thể khó nhận ra ở tốc độ tự nhiên.

## Sơ đồ chọn trong năm giây

1. Trở về động từ gốc: *updated → update*.
2. Tìm âm cuối của từ gốc: *update* kết thúc /t/.
3. Nếu /t/ hoặc /d/, chọn /ɪd/.
4. Nếu là phụ âm vô thanh còn lại, chọn /t/.
5. Nếu không thuộc hai nhóm trên, chọn /d/.

[Cambridge Grammar liệt kê cùng ba nhóm phát âm của động từ có quy tắc](https://dictionary.cambridge.org/us/grammar/british-grammar/past-simple/). Quy tắc này không thay thế việc tra từ: một số tính từ kết thúc *-ed* hoặc cách dùng đặc biệt có thể có cách đọc riêng.

## Lỗi cần tránh khi học bằng mẹo chữ cái

**Nhìn chữ cuối thay vì âm cuối:** *laugh* viết bằng *gh* nhưng kết thúc /f/, nên *laughed* có /t/. **Thêm /ɪd/ cho mọi từ:** điều này làm *worked* và *planned* có thêm âm tiết sai. **Bật âm /t/ hoặc /d/ quá mạnh:** mục tiêu là giữ dấu hiệu quá khứ, không tách đuôi thành một từ mới.

Đừng trộn quy tắc phát âm với quy tắc chính tả. *Study → studied* đổi *y* thành *i* là chính tả; cách đọc cuối vẫn dựa vào âm trước đuôi. *Stop → stopped* gấp đôi *p* khi viết, nhưng phát âm đuôi vẫn là /t/.

## -ed giúp nghe thì và thể bị động

So sánh:

- **The team checks the equipment**: thói quen hiện tại;
- **The team checked the equipment**: hành động quá khứ;
- **The equipment was checked**: bị động quá khứ.

Trong câu cuối, cụm /kt/ ở *checked* cùng *was* cho biết thiết bị nhận hành động. Nếu bỏ /t/, người nghe dễ dựa hoàn toàn vào trợ động từ. Ôn thêm [quá khứ đơn và quá khứ tiếp diễn](/blog/qua-khu-don-va-qua-khu-tiep-dien) và [câu bị động TOEIC](/blog/cau-bi-dong-toeic-part-5) để nối âm thanh với ngữ pháp.

## Bài luyện với chuỗi sự kiện công việc

Đọc đoạn tự biên soạn:

**The supplier confirmed the order, packed the items, and updated the delivery date. The boxes were shipped on Friday.**

Phân loại:

- *confirmed* /d/;
- *packed* /t/;
- *updated* /ɪd/;
- *shipped* /t/.

Đọc từng cụm ý rồi nối thành hai câu. Sau đó che văn bản, nghe bản ghi của chính bạn và viết lại các động từ. Nếu bạn không phân biệt được *pack* với *packed*, tập riêng cụm cuối /kt/ trước khi tăng tốc.

## Quy trình luyện nghe trong một tuần

- Ngày 1: phân loại 15 động từ thành ba nhóm.
- Ngày 2: nghe từ điển và đánh dấu số âm tiết.
- Ngày 3: đọc năm câu có /t/.
- Ngày 4: đọc năm câu có /d/.
- Ngày 5: đọc năm câu có /ɪd/.
- Ngày 6: làm [dictation](/blog/dictation-la-gi-cach-nghe-chep-chinh-ta-tieng-anh) từ một đoạn quá khứ.
- Ngày 7: làm câu mới không nhìn nhóm và giải thích bằng âm cuối.

Kết hợp [âm cuối tiếng Anh](/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am) nếu bạn thường thêm “ờ” sau /t/ hoặc /d/. Sau đó dùng [thư viện bài nghe](/listening-lessons) để tìm các câu quá khứ trong ngữ cảnh thật.

## Checklist tự chấm

- Tôi đã tìm động từ gốc chưa?
- Tôi dựa vào âm cuối thay vì chữ cuối chưa?
- Tôi chỉ thêm âm tiết ở nhóm /ɪd/ chưa?
- Tôi giữ được dấu hiệu quá khứ khi đọc cả câu chưa?
- Tôi có thể nghe và viết lại *checked/planned/needed* không?

Làm mini-practice ở đầu bài trước khi xem lại quy tắc. Khi sai, ghi “nhầm /d/ thành /ɪd/ sau /n/” thay vì chỉ ghi “sai -ed”. Sau vài ngày, kiểm tra trong [TOEIC Listening Part 3](/toeic/part-3), nơi các sự kiện đã hoàn tất, thay đổi lịch và xác nhận đơn hàng xuất hiện thường xuyên.`
  }),
  pronunciationPost({
    id: "editorial-word-stress-english",
    slug: "trong-am-tu-tieng-anh-quy-tac-cach-tra",
    title: "Trọng âm từ tiếng Anh: cách tra, quy tắc và từ công sở thường gặp",
    excerpt: "Đọc dấu trọng âm trong từ điển, nhận diện hậu tố và cặp danh từ–động từ; luyện từ công sở theo âm tiết thay vì học mẹo tuyệt đối.",
    category: "LISTENING",
    seoTitle: "Trọng âm tiếng Anh: quy tắc, cách tra và bài tập",
    seoDescription: "Học trọng âm từ tiếng Anh bằng dấu phiên âm, hậu tố và từ công sở. Có quy trình tra từ, lỗi thường gặp và bài tập kèm lời giải.",
    canonicalPath: "/blog/trong-am-tu-tieng-anh-quy-tac-cach-tra",
    coverAlt: "Các âm tiết được đánh dấu trọng âm trong từ tiếng Anh công sở",
    editorialCover: "/blog/cover/listening",
    socialTitle: "Đừng đoán trọng âm chỉ bằng một mẹo",
    socialDescription: "Cách đọc dấu từ điển, nhận ra quy luật và luyện trọng âm trong cả câu.",
    authorName: "TOEIC GYM Editorial",
    targetTopic: "trọng âm từ tiếng Anh quy tắc cách tra",
    searchIntent: "WORD_STRESS_DICTIONARY_PRACTICE",
    tags: [{ name: "Trọng âm tiếng Anh", slug: "trong-am-tieng-anh" }, { name: "Phát âm tiếng Anh", slug: "phat-am-tieng-anh" }],
    content: `## Trọng âm từ là gì?

Trong một từ nhiều âm tiết, một âm tiết thường nổi bật hơn về độ dài, độ rõ, độ lớn và thay đổi cao độ. Đó là trọng âm chính. Ví dụ **manager** thường được chia *MAN-a-ger*. **Employee** có cả cách *em-PLOY-ee* và *em-ploy-EE*, vì vậy từ điển đáng tin hơn một mẹo đơn lẻ.

Trọng âm không chỉ giúp nói dễ hiểu hơn. Khi nghe, bạn thường nhận ra “khung” của từ qua âm tiết được nhấn và các âm tiết yếu quanh nó. Nếu cố nghe mọi âm tiết mạnh như nhau, từ dài trong thông báo hoặc hội thoại công việc trở nên khó nhận diện.

## Cách đọc dấu trọng âm trong từ điển

Dấu **ˈ** đứng ngay trước âm tiết mang trọng âm chính. Ví dụ:

- **manager** /ˈmæn.ɪ.dʒər/: nhấn âm đầu;
- **approval** /əˈpruː.vəl/: nhấn âm thứ hai;
- **employee** /ɪmˈplɔɪ.iː/: nhấn phần *ploy* trong cách đọc phổ biến này;
- **presentation** /ˌprez.ənˈteɪ.ʃən/: có trọng âm phụ /ˌ/ và trọng âm chính /ˈ/.

Phiên âm có thể khác nhẹ giữa Anh–Anh và Anh–Mỹ. Mục tiêu đầu tiên là nhận đúng âm tiết chính trong biến thể bạn đang nghe, không phải pha trộn ký hiệu của nhiều giọng vào một lần luyện.

## Trước khi áp dụng quy tắc: đếm âm tiết đúng

Âm tiết xoay quanh một nguyên âm phát ra, không phải số nguyên âm trong chữ viết. **Business** thường có hai âm tiết, **comfortable** có thể được nói với số âm tiết khác cách người mới đoán từ chữ, và **employee** không được đếm chỉ bằng số chữ *e*.

Cách làm:

1. nghe từ điển một lần;
2. gõ nhịp theo từng âm tiết;
3. nghe âm tiết nổi bật;
4. mở phiên âm để xác nhận;
5. đọc lại cả từ, không tách từng âm tiết quá lâu.

[British Council hướng dẫn](https://learnenglish.britishcouncil.org/comment/198955) dùng âm tiết, các từ tương tự và hậu tố để đưa ra dự đoán, nhưng cũng lưu ý chữ viết không biểu diễn phát âm hoàn hảo.

## Xu hướng ở từ hai âm tiết

Nhiều danh từ và tính từ hai âm tiết nhấn âm đầu, trong khi nhiều động từ hai âm tiết nhấn âm sau. Đây là **xu hướng**, không phải luật không ngoại lệ.

- danh từ/tính từ: **PROject**, **PREsent**, **PERmit**;
- động từ: **proJECT**, **preSENT**, **perMIT**.

So sánh câu:

- **The team presented a PREsent to the guest.**
- **Please REcord the meeting and send me the reCORD.**
- **Exports increased after the company began to exPORT the new model.**

Không phải mọi từ đổi trọng âm theo từ loại. Khi một từ mới xuất hiện, tra từ điển trước rồi dùng quy tắc để nhóm và ghi nhớ.

## Hậu tố thường gợi vị trí trọng âm

### -tion và -sion

Trọng âm thường rơi vào âm tiết ngay trước hậu tố: presen**TA**tion, appli**CA**tion, de**CI**sion, ex**PAN**sion.

### -ic và -ical

Trọng âm thường đứng trước hậu tố: eco**NO**mic, stra**TE**gic, prac**TI**cal, tech**NI**cal. So sánh **PHOtograph**, pho**TOGraphy**, photo**GRAPHic** để thấy họ từ có thể dịch chuyển trọng âm.

### -ity

Hậu tố này thường kéo trọng âm về phần ngay trước nó trong cấu trúc âm tiết: a**BI**lity, possi**BI**lity, produc**TI**vity. Đừng chỉ giữ trọng âm của từ gốc mà không nghe dạng mới.

### -ee và -eer

Các hậu tố này thường có thể hút trọng âm: train**EE**, interview**EE**, engin**EER**, volunt**EER**. Tuy vậy, **employee** có cả cách nhấn em-**PLOY**-ee và em-ploy-**EE** được từ điển ghi nhận, nên không dùng một từ làm “luật tuyệt đối”. [Cambridge cung cấp audio cho cả hai biến thể của employee](https://dictionary.cambridge.org/us/pronunciation/english/employee).

[British Council lưu ý trọng âm tiếng Anh không luôn ở âm đầu và khuyến khích tìm pattern](https://africa.teachingenglish.org.uk/classroom/pronunciation/word-stress), đồng thời thừa nhận biến thể nên không học quy tắc như cam kết tuyệt đối.

## 24 từ công sở nên ghi kèm trọng âm

Nhóm âm đầu:

- **MANager, CUS-tomer, MAR-keting, CON-ference**;
- **BUD-get, DEAD-line, IN-voice, DOC-ument**.

Nhóm âm giữa hoặc sau:

- a**GEN**da, ap**PROV**al, de**LIV**ery, re**CEIPT**;
- em**PLOY**ee, engin**EER**, volun**TEER**, guaran**TEE**.

Nhóm có hậu tố:

- appli**CA**tion, presen**TA**tion, negoti**A**tion, infor**MA**tion;
- eco**NO**mic, stra**TE**gic, possi**BI**lity, produc**TI**vity.

Ký hiệu in đậm ở đây chỉ giúp nhìn vị trí nhấn; hãy nghe từ điển để lấy nguyên âm và biến thể giọng chính xác. Khi tạo [flashcard từ vựng công sở](/toeic/flashcards-tu-vung-cong-so), thêm dấu trọng âm và một câu, không chỉ thêm bản dịch.

## Trọng âm từ thay đổi thế nào trong câu?

Một từ có trọng âm riêng, nhưng khi vào câu nó còn chịu trọng âm câu. Trong **Please SEND the REvised CONtract**, các từ mang nội dung nổi bật; các từ chức năng thường nhẹ hơn. Tuy vậy, âm tiết chính bên trong *revised* và *contract* không bị chọn lại tùy ý.

Luyện theo hai tầng: đầu tiên đọc đúng trọng âm từng từ, sau đó đặt từ vào cụm ý. [Shadowing](/blog/shadowing-la-gi-cach-luyen-tieng-anh) giúp bắt nhịp câu, còn [connected speech](/blog/noi-am-tieng-anh-cach-nghe-connected-speech) giúp hiểu vì sao âm tiết yếu khác với cách đọc từng từ riêng.

## Quy trình học một từ mới trong ba mươi giây

1. Đoán số âm tiết và trọng âm.
2. Tra phiên âm; tìm dấu /ˈ/.
3. Nghe Anh–Anh hoặc Anh–Mỹ nhất quán trong lượt đó.
4. Nhại lại từ ba lần, giữ âm tiết yếu nhẹ hơn.
5. Đọc một câu có từ đó.
6. Ghi từ theo mẫu: *approval /əˈpruː.vəl/ – receive approval*.

Sau năm từ, đóng từ điển và tự đánh dấu trọng âm. Active recall có giá trị hơn việc nghe một từ hai mươi lần trong khi vẫn nhìn đáp án.

## Bài luyện với câu công việc

Đọc các câu tự biên soạn:

- **The MANager approved the appliCAtion.**
- **Please preSENT the PROject update on Friday.**
- **The enginEER reviewed the TECHnical document.**
- **Employee producTIvity increased after the training.**

Thu âm một lượt chậm và một lượt tự nhiên. Nếu mọi âm tiết dài và mạnh như nhau, giảm các âm tiết không nhấn thay vì chỉ làm âm nhấn to hơn.

## Lộ trình bảy ngày và bước tiếp theo

- Ngày 1: học cách đọc dấu /ˈ/ và /ˌ/.
- Ngày 2: phân loại tám từ hai âm tiết.
- Ngày 3: luyện bốn cặp danh từ–động từ.
- Ngày 4: nhóm từ theo hậu tố.
- Ngày 5: đọc từ trong câu.
- Ngày 6: nghe–chép một đoạn ngắn trong [thư viện bài nghe](/listening-lessons).
- Ngày 7: làm mini-practice và tra lại chỉ những từ sai.

Nếu bạn nhận ra trọng âm nhưng vẫn mất phần kết thúc của từ, quay lại [bài âm cuối](/blog/am-cuoi-tieng-anh-cach-phat-am-khong-them-am). Sau đó thử [TOEIC Listening Part 4](/toeic/part-4), nơi thông báo và bài nói có nhiều danh từ dài như *reservation, information, application*.`
  }),
];
