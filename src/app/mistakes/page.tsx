import Link from "next/link";
import { LearnerNav } from "@/components/learner-nav";
import { requireUser } from "@/lib/auth/session";
import { getEffectiveCapabilities } from "@/lib/entitlements/service";
import { getPreferences } from "@/lib/i18n/get-translations";
import {
  getMistakeBank,
  getMistakeCounts,
  type MistakeStatus,
} from "@/lib/mastery/queries";
import {
  compareReviewPriority,
  priorityReason,
  REPEATED_MISS_THRESHOLD,
} from "@/lib/mastery/priority";
import { startMasteryReview } from "./actions";
import {
  PremiumPreviewCard,
  PremiumRenewalCard,
} from "@/components/premium/premium-preview";
import { getPremiumPreview } from "@/lib/premium/preview";

export default async function MistakesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const user = await requireUser();
  const query = await searchParams;
  const [preferences, capabilities, counts, preview] = await Promise.all([
    getPreferences(user.id),
    getEffectiveCapabilities(user.id),
    getMistakeCounts(user.id),
    getPremiumPreview(),
  ]);
  const premium = capabilities.canUseSmartMistakeReview;
  const vi = preferences.interfaceLanguage === "vi";
  const status: MistakeStatus =
    query.tab === "mastered" ? "MASTERED" : "UNRESOLVED";
  const part = [1, 2, 3, 4, 5, 6, 7].includes(Number(query.part))
    ? Number(query.part)
    : undefined;
  const area =
    query.area === "LISTENING" || query.area === "READING"
      ? query.area
      : undefined;
  const sort =
    premium && ["recent", "oldest", "most"].includes(String(query.sort))
      ? String(query.sort)
      : "priority";
  const repeated = premium && query.filter === "repeated";
  const rows = await getMistakeBank(user.id, status, { part, skillArea: area });
  const items = repeated
    ? rows.filter((row) => row.wrongCount >= REPEATED_MISS_THRESHOLD)
    : rows;
  if (premium && status === "UNRESOLVED")
    items.sort((a, b) => {
      if (sort === "recent")
        return (
          b.lastMissedAt.getTime() - a.lastMissedAt.getTime() ||
          a.questionId.localeCompare(b.questionId)
        );
      if (sort === "oldest")
        return (
          a.firstMissedAt.getTime() - b.firstMissedAt.getTime() ||
          a.questionId.localeCompare(b.questionId)
        );
      if (sort === "most")
        return (
          b.wrongCount - a.wrongCount ||
          a.questionId.localeCompare(b.questionId)
        );
      return compareReviewPriority(a, b);
    });
  const href = (changes: Record<string, string | undefined>) =>
    `/mistakes?${new URLSearchParams(Object.entries({ tab: status === "MASTERED" ? "mastered" : "review", area, part: part?.toString(), filter: repeated ? "repeated" : undefined, sort: premium ? sort : undefined, ...changes }).filter((entry): entry is [string, string] => Boolean(entry[1])))}`;
  const total = counts.unresolved + counts.mastered;
  const eligible = rows.filter((row) => row.available).length;
  const reviewUsage = preview.usage.MASTERY_REVIEW;
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 pb-20 text-slate-900 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <LearnerNav locale={preferences.interfaceLanguage} />
        <header className="mt-8">
          <p className="text-sm font-black uppercase tracking-wider text-teal-700">
            TOEIC GYM
          </p>
          <h1 className="mt-2 text-3xl font-black">
            {vi ? "Ngân hàng lỗi sai" : "Mistake Bank"}
          </h1>
          <p className="mt-2 text-slate-600">
            {vi
              ? "Theo dõi câu cần ôn và tiến độ làm chủ từ những lần trả lời thực tế."
              : "Review real mistakes and track your progress toward mastery."}
          </p>
        </header>
        {query.error === "usage_limit" && preview.visible ? (
          <div className="mt-5">
            <PremiumPreviewCard
              locale={preferences.interfaceLanguage}
              title={
                vi
                  ? `Bạn đã dùng ${reviewUsage.used}/${reviewUsage.type === "LIMITED" ? reviewUsage.limit : reviewUsage.used} lượt ôn Free hôm nay`
                  : `You used ${reviewUsage.used}/${reviewUsage.type === "LIMITED" ? reviewUsage.limit : reviewUsage.used} Free reviews today`
              }
              body={
                vi ? (
                  <>
                    Bạn vẫn còn{" "}
                    <strong>{preview.mistakes.unresolvedCount}</strong> lỗi chưa
                    làm chủ
                    {preview.mistakes.repeatedMistakeCount > 0 ? (
                      <>
                        {" "}
                        và{" "}
                        <strong>
                          {preview.mistakes.repeatedMistakeCount}
                        </strong>{" "}
                        câu đã sai nhiều lần
                      </>
                    ) : null}
                    .
                  </>
                ) : (
                  <>
                    You still have{" "}
                    <strong>{preview.mistakes.unresolvedCount}</strong>{" "}
                    unresolved mistakes
                    {preview.mistakes.repeatedMistakeCount > 0 ? (
                      <>
                        {" "}
                        and{" "}
                        <strong>
                          {preview.mistakes.repeatedMistakeCount}
                        </strong>{" "}
                        repeatedly missed questions
                      </>
                    ) : null}
                    .
                  </>
                )
              }
              values={
                preview.mistakes.repeatedMistakeCount > 0
                  ? ["smartReview", "smartPriority"]
                  : ["smartReview"]
              }
              cta={vi ? "Xem Smart Review" : "See Smart Review"}
            />
          </div>
        ) : query.error === "usage_limit" &&
          preview.lifecycle === "EXPIRED" ? (
          <div className="mt-5">
            <PremiumRenewalCard
              locale={preferences.interfaceLanguage}
              title={
                vi
                  ? "Khôi phục Smart Review của bạn"
                  : "Restore your Smart Review access"
              }
              body={
                vi
                  ? `Gói trước đây đã hết hạn. ${preview.mistakes.unresolvedCount} lỗi chưa làm chủ vẫn được lưu an toàn để bạn tiếp tục ôn sau khi khôi phục.`
                  : `Your previous plan expired. ${preview.mistakes.unresolvedCount} unresolved mistakes remain safely saved for your next review.`
              }
            />
          </div>
        ) : query.error ? (
          <p
            className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-900"
            role="alert"
          >
            {query.error === "usage_limit"
              ? vi
                ? "Bạn đã dùng hết lượt ôn miễn phí hôm nay."
                : "Today's free review has been used."
              : query.error === "premium_required"
                ? vi
                  ? "Ôn ưu tiên chỉ dành cho Premium đang hoạt động."
                  : "Priority review requires active Premium."
                : vi
                  ? "Hiện chưa có câu đủ điều kiện để tạo phiên ôn."
                  : "No eligible questions are available for a review session."}
          </p>
        ) : null}
        {total > 0 ? (
          <section
            className="mt-7 rounded-2xl border border-slate-200 bg-white p-5"
            aria-label={vi ? "Tóm tắt lỗi sai" : "Mistake summary"}
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">
                  {vi ? "Cần ôn" : "To review"}
                </p>
                <p className="text-3xl font-black">{counts.unresolved}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">
                  {vi ? "Đã làm chủ" : "Mastered"}
                </p>
                <p className="text-3xl font-black">{counts.mastered}</p>
              </div>
            </div>
            <div
              className="mt-4 flex h-3 overflow-hidden rounded-full bg-slate-100"
              role="img"
              aria-label={`${counts.unresolved} ${vi ? "cần ôn" : "to review"}, ${counts.mastered} ${vi ? "đã làm chủ" : "mastered"}`}
            >
              <div
                className="bg-teal-600"
                style={{ width: `${(counts.unresolved / total) * 100}%` }}
              />
              <div
                className="bg-emerald-500"
                style={{ width: `${(counts.mastered / total) * 100}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-slate-500">
              {vi
                ? `Tổng ${total} câu từng sai`
                : `${total} questions missed at least once`}
            </p>
          </section>
        ) : null}
        {counts.unresolved > 0 ? (
          <section className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-5">
            <h2 className="text-lg font-black">
              {premium
                ? vi
                  ? "Ôn ưu tiên"
                  : "Priority review"
                : vi
                  ? "Ôn lỗi sai"
                  : "Review mistakes"}
            </h2>
            <p className="mt-1 text-sm text-slate-700">
              {eligible
                ? vi
                  ? `${eligible} câu phù hợp trong bộ lọc hiện tại; câu theo nhóm sẽ được ôn cùng toàn bộ ngữ cảnh.`
                  : `${eligible} eligible questions in the current filter; grouped questions retain their context.`
                : vi
                  ? "Các câu hiện tại chưa đủ điều kiện nội dung hoặc media để ôn."
                  : "Current questions are unavailable because content or media is not ready."}
            </p>
            {eligible ? (
              <form
                action={startMasteryReview}
                className="mt-4 flex flex-wrap items-end gap-3"
              >
                <input name="part" type="hidden" value={part ?? ""} />
                {premium ? (
                  <>
                    <input name="smart" type="hidden" value="true" />
                    <label className="text-sm font-bold">
                      {vi ? "Số câu mục tiêu" : "Target size"}
                      <select
                        className="mt-1 block rounded-lg border border-slate-300 bg-white px-3 py-2"
                        name="size"
                        defaultValue="10"
                      >
                        {[5, 10, 15, 20].map((size) => (
                          <option key={size} value={size}>
                            {size}
                          </option>
                        ))}
                      </select>
                    </label>
                  </>
                ) : null}
                <button className="min-h-11 rounded-xl bg-teal-700 px-5 py-2 font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700">
                  {premium
                    ? vi
                      ? "Ôn ưu tiên"
                      : "Priority review"
                    : vi
                      ? "Ôn lỗi sai"
                      : "Review mistakes"}
                </button>
              </form>
            ) : null}
          </section>
        ) : null}
        <nav
          className="mt-7 flex flex-wrap gap-2"
          aria-label={vi ? "Trạng thái" : "Status"}
        >
          <Link
            className={`rounded-full px-4 py-2 font-bold ${status === "UNRESOLVED" ? "bg-slate-900 text-white" : "bg-white"}`}
            href={href({ tab: "review", filter: undefined })}
          >
            {vi ? "Cần ôn" : "To review"} · {counts.unresolved}
          </Link>
          <Link
            className={`rounded-full px-4 py-2 font-bold ${status === "MASTERED" ? "bg-slate-900 text-white" : "bg-white"}`}
            href={href({ tab: "mastered", filter: undefined })}
          >
            {vi ? "Đã làm chủ" : "Mastered"} · {counts.mastered}
          </Link>
        </nav>
        <div
          className="mt-5 flex flex-wrap gap-2"
          aria-label={vi ? "Bộ lọc" : "Filters"}
        >
          {["ALL", "LISTENING", "READING"].map((value) => (
            <Link
              aria-current={(area ?? "ALL") === value ? "page" : undefined}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold focus-visible:outline-2"
              href={href({
                area: value === "ALL" ? undefined : value,
                part: undefined,
              })}
              key={value}
            >
              {value === "ALL" ? (vi ? "Tất cả" : "All") : value}
            </Link>
          ))}
          {[1, 2, 3, 4, 5, 6, 7].map((value) => (
            <Link
              aria-current={part === value ? "page" : undefined}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold focus-visible:outline-2"
              href={href({ part: String(value), area: undefined })}
              key={value}
            >
              Part {value}
            </Link>
          ))}
        </div>
        {premium ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-bold"
              href={href({ filter: repeated ? undefined : "repeated" })}
            >
              {vi ? "Sai nhiều lần" : "Repeated misses"}
              {repeated ? " ✓" : ""}
            </Link>
            {status === "UNRESOLVED"
              ? (["priority", "recent", "oldest", "most"] as const).map(
                  (value) => (
                    <Link
                      key={value}
                      aria-current={sort === value ? "page" : undefined}
                      className={`rounded-lg px-3 py-2 text-sm font-bold ${sort === value ? "bg-slate-900 text-white" : "bg-white"}`}
                      href={href({ sort: value })}
                    >
                      {value === "priority"
                        ? vi
                          ? "Ưu tiên"
                          : "Priority"
                        : value === "recent"
                          ? vi
                            ? "Mới sai"
                            : "Recent"
                          : value === "oldest"
                            ? vi
                              ? "Cũ nhất"
                              : "Oldest"
                            : vi
                              ? "Sai nhiều"
                              : "Most misses"}
                    </Link>
                  ),
                )
              : null}
          </div>
        ) : null}
        {!items.length ? (
          <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center">
            <h2 className="text-2xl font-black">
              {total === 0
                ? vi
                  ? "Chưa có lỗi sai cần ôn"
                  : "No mistakes yet"
                : status === "UNRESOLVED" && counts.unresolved === 0
                  ? vi
                    ? "Bạn đã làm chủ mọi lỗi sai"
                    : "All mistakes mastered"
                  : vi
                    ? "Không có câu trong bộ lọc này"
                    : "No questions match this filter"}
            </h2>
            <p className="mt-2 text-slate-600">
              {vi
                ? "Những câu bạn làm sai sẽ xuất hiện tại đây để bạn có thể luyện lại."
                : "Questions you miss will appear here for later review."}
            </p>
            <Link
              className="mt-5 inline-flex rounded-xl border border-teal-700 px-5 py-3 font-bold text-teal-800"
              href="/practice"
            >
              {vi ? "Luyện tập" : "Practice"}
            </Link>
          </section>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {items.map((item) => (
              <article
                className="rounded-2xl border border-slate-200 bg-white p-5"
                key={item.questionId}
              >
                <p className="text-sm font-black text-teal-700">
                  {item.skillArea} · Part {item.part}
                </p>
                <h2 className="mt-2 text-lg font-black">{item.skill}</h2>
                <p className="text-sm text-slate-600">{item.subSkill}</p>
                {premium ? (
                  <p className="mt-3 text-sm text-slate-700">
                    {vi
                      ? `Sai ${item.wrongCount} lần · Ôn ${item.reviewAttemptCount} lần`
                      : `${item.wrongCount} misses · ${item.reviewAttemptCount} reviews`}
                  </p>
                ) : null}
                <p className="mt-3 text-sm text-slate-600">
                  {vi ? "Sai gần nhất" : "Last missed"}:{" "}
                  {item.lastMissedAt.toLocaleDateString(vi ? "vi-VN" : "en-US")}
                </p>
                {item.status === "MASTERED" ? (
                  <p className="mt-2 font-bold text-emerald-700">
                    {vi ? "Đã làm chủ" : "Mastered"}
                  </p>
                ) : (
                  <p className="mt-2 font-bold">
                    {item.reviewSuccessStreak} / 2{" "}
                    {vi
                      ? "lần đúng liên tiếp khi ôn"
                      : "consecutive correct reviews"}
                  </p>
                )}
                {premium && item.status === "UNRESOLVED" ? (
                  <p className="mt-2 text-sm font-semibold text-teal-800">
                    {priorityReason(item) === "repeated"
                      ? vi
                        ? `Ưu tiên ôn: đã sai ${item.wrongCount} lần`
                        : `Review priority: missed ${item.wrongCount} times`
                      : priorityReason(item) === "unfinished"
                        ? vi
                          ? "Ưu tiên ôn: chưa đủ chuỗi đúng để làm chủ"
                          : "Review priority: mastery streak incomplete"
                        : vi
                          ? "Ưu tiên ôn theo lần sai gần nhất"
                          : "Prioritized by latest miss"}
                  </p>
                ) : null}
                {[3, 4, 6, 7].includes(item.part) ? (
                  <p className="mt-2 text-xs text-slate-500">
                    {vi
                      ? "Ôn cùng toàn bộ nhóm câu và ngữ cảnh"
                      : "Reviewed with the full question group and context"}
                  </p>
                ) : null}
                {!item.available ? (
                  <p className="mt-3 text-sm font-bold text-amber-700">
                    {vi
                      ? "Tạm thời chưa thể ôn do nội dung hoặc media"
                      : "Temporarily unavailable for review"}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        )}
        {!premium &&
        preview.visible &&
        preview.mistakes.unresolvedCount > 0 &&
        query.error !== "usage_limit" ? (
          <div className="mt-6">
            <PremiumPreviewCard
              locale={preferences.interfaceLanguage}
              title={
                vi
                  ? `${preview.mistakes.unresolvedCount} lỗi chưa làm chủ`
                  : `${preview.mistakes.unresolvedCount} unresolved mistakes`
              }
              body={
                preview.mistakes.repeatedMistakeCount > 0
                  ? vi
                    ? `${preview.mistakes.repeatedMistakeCount} câu đã sai nhiều lần. Premium có thể ưu tiên chúng trước.`
                    : `${preview.mistakes.repeatedMistakeCount} questions were missed repeatedly. Premium can prioritize them first.`
                  : vi
                    ? "Premium Smart Review có thể sắp xếp các lỗi cần ôn trước."
                    : "Premium Smart Review can prioritize what to review first."
              }
              values={
                preview.mistakes.repeatedMistakeCount > 0
                  ? ["smartReview", "smartPriority"]
                  : ["smartReview"]
              }
              cta={vi ? "Xem Smart Review" : "See Smart Review"}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
