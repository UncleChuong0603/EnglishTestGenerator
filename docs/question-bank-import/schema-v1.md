# TOEICGym Question Import JSON — schema 1.0

Top-level bắt buộc và strict: `schemaVersion`, `batch`, `items`.

`batch`: `batchKey`, `name`, `sourceType` (`ORIGINAL|AI_ASSISTED_ORIGINAL|LICENSED|OTHER_APPROVED`), `rightsNote`, `reviewStatus` (`UNREVIEWED|HUMAN_REVIEWED`). Tùy chọn: `description`, `author`, `generator`, ISO `createdAt`, `language` (`en|vi|bilingual`), `contentVersion`. Không ghi prompt bí mật/API key.

Mỗi item là atomic group với `externalItemId`, `part`, `title`, `setType`, `passages`, `questions`; Listening thêm `transcript`, `media.audio/image`. Media là `{ "assetId": "existing UUID" }` hoặc `{ "pending": true }`, không được tự bịa ID. Mỗi question có `externalQuestionId`, `text`, options `{key,text}`, `correctOptionKey`, explanation `{en,vi}`, `skill`, `subSkill`, `difficulty` (`easy|medium|hard`).

Part/setType: P1 `photographs`; P2 `question_response`; P3 `conversation`; P4 `talk`; P5 `standalone`; P6 `part6`; P7 `single|double|triple`. P1/P2/P5 có 1 câu, P3/P4 có 3, P6 có 4; P7 có ít nhất 1. P6 có 1 passage; P7 có 1/2/3 passage theo setType. Allowed taxonomy nằm trong template/example và `src/lib/question-import/schema.ts`.

Severity: `ERROR` chặn batch; `WARNING` cho phép Draft nhưng cần xử lý; `INFO` chỉ thông tin. Codes ổn định gồm `MALFORMED_JSON`, `FILE_TOO_LARGE`, `UNSUPPORTED_SCHEMA_VERSION`, `SCHEMA_VALIDATION_ERROR`, `INVALID_SET_TYPE`, `GROUP_SIZE_MISMATCH`, `STIMULUS_COUNT_MISMATCH`, `MISSING_TRANSCRIPT`, `INVALID_OPTION_COUNT`, `INVALID_CORRECT_ANSWER`, `DUPLICATE_OPTION`, `UNKNOWN_TAXONOMY`, `MEDIA_PENDING`, `MEDIA_NOT_FOUND`, `MEDIA_TYPE_MISMATCH`, `MEDIA_NOT_READY`, `DUPLICATE_IN_BATCH`, `DUPLICATE_IMPORT_KEY`, `DUPLICATE_EXISTING`, `POTENTIAL_CONTENT_DUPLICATE`, `ALREADY_IMPORTED`, `BATCH_KEY_CONFLICT`.
