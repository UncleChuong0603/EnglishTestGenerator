# DEVELOPMENT / FORMAT EXAMPLES

Các ví dụ dưới đây chỉ minh họa cấu trúc, không seed/import production tự động. Dùng metadata batch từ `template-v1.json`; thay `items` bằng item tương ứng.

- Listening P1: `setType=photographs`, 1 question, transcript, `media.audio` và `media.image` (dùng `pending:true` khi chưa upload).
- Listening P2: `setType=question_response`, 1 question, 3 options, transcript, audio.
- Listening P3: `setType=conversation`, đúng 3 questions, transcript, shared audio, image tùy chọn.
- Listening P4: `setType=talk`, đúng 3 questions, transcript, shared audio, image tùy chọn.
- Reading P5: xem `../template-v1.json`.
- Reading P6: `setType=part6`, 1 passage và đúng 4 questions.
- Reading P7: `setType=single|double|triple`, lần lượt đúng 1/2/3 passages; questions dùng cùng group.

## Listening Part 1 item

```json
{"externalItemId":"P1-EXAMPLE-001","part":1,"title":"DEVELOPMENT / FORMAT EXAMPLE — P1","setType":"photographs","passages":[],"transcript":"A person is arranging files on a shelf.","media":{"audio":{"pending":true},"image":{"pending":true,"altText":"A person at a shelf"}},"questions":[{"externalQuestionId":"P1-EXAMPLE-001-Q1","text":"","options":[{"key":"A","text":"A person is arranging files."},{"key":"B","text":"The shelf is empty."},{"key":"C","text":"People are leaving."},{"key":"D","text":"A door is being painted."}],"correctOptionKey":"A","explanation":{"en":"Option A matches the scene.","vi":"Phương án A phù hợp cảnh."},"skill":"photographs","subSkill":"action","difficulty":"easy"}]}
```

## Listening Part 2 item

```json
{"externalItemId":"P2-EXAMPLE-001","part":2,"title":"DEVELOPMENT / FORMAT EXAMPLE — P2","setType":"question_response","passages":[],"transcript":"Where is the meeting room?","media":{"audio":{"pending":true}},"questions":[{"externalQuestionId":"P2-EXAMPLE-001-Q1","text":"","options":[{"key":"A","text":"On the second floor."},{"key":"B","text":"At three o'clock."},{"key":"C","text":"With the sales team."}],"correctOptionKey":"A","explanation":{"en":"A location answers where.","vi":"Địa điểm trả lời câu hỏi where."},"skill":"question_response","subSkill":"direct_response","difficulty":"easy"}]}
```

## Listening Parts 3 and 4

Use the P2 shape with 4 options per question. For P3 use `conversation/detail`; for P4 use `talk/detail`; include three uniquely keyed question objects and shared transcript/audio.

## Reading Part 6

Use one passage object such as `{"content":"To all staff: The office will close early Friday."}`, `setType:"part6"`, and four uniquely keyed questions using documented P6 taxonomy.

## Reading Part 7

Use `setType:"triple"` with three passage objects (or single/double with one/two), and one or more questions using P7 taxonomy such as `detail/explicit_information` or `cross_text/information_synthesis`.

Mọi ví dụ phải giữ nhãn **DEVELOPMENT / FORMAT EXAMPLE** và không được coi là câu hỏi production.
