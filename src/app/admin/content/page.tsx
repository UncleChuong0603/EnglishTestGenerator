import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/authorization";
import { getContentOverview } from "@/lib/admin/content";
import {
  getQuestionBankCapacity,
  recommendContentCoverage,
  type ContentCoverage,
} from "@/lib/admin/content-coverage";
import { getQuestionBankSettings } from "@/lib/admin/question-bank-settings";
import { getPreferences } from "@/lib/i18n/get-translations";

export default async function Page() {
  const actor = await requireAdmin("CONTENT_READ");
  const [prefs, data, blueprint] = await Promise.all([
    getPreferences(actor.id),
    getContentOverview(),
    getQuestionBankSettings(),
  ]);
  const vi = prefs.interfaceLanguage === "vi";
  const targetForms = blueprint.targetForms;

  const coverageRows: ContentCoverage[] = [
    { part: 1, label: "Part 1", groups: data.listening.p1, questions: data.listening.p1, groupsPerForm: 6, questionsPerForm: 6 },
    { part: 2, label: "Part 2", groups: data.listening.p2, questions: data.listening.p2, groupsPerForm: 25, questionsPerForm: 25 },
    { part: 3, label: "Part 3", groups: data.listening.p3Groups, questions: data.listening.p3Questions, groupsPerForm: 13, questionsPerForm: 39 },
    { part: 4, label: "Part 4", groups: data.listening.p4Groups, questions: data.listening.p4Questions, groupsPerForm: 10, questionsPerForm: 30 },
    { part: 5, label: "Part 5", groups: data.reading.p5, questions: data.reading.p5, groupsPerForm: 30, questionsPerForm: 30 },
    { part: 6, label: "Part 6", groups: data.reading.p6Groups, questions: data.reading.p6Questions, groupsPerForm: 4, questionsPerForm: 16 },
    { part: 7, label: "Part 7 · Single", setType: "single", groups: data.reading.p7SingleGroups, questions: data.reading.p7SingleQuestions, groupsPerForm: 10, questionsPerForm: 29 },
    { part: 7, label: "Part 7 · Multiple", setType: "multiple", groups: data.reading.p7MultipleGroups, questions: data.reading.p7MultipleQuestions, groupsPerForm: 5, questionsPerForm: 25 },
  ];
  const recommendations = recommendContentCoverage(coverageRows, targetForms);
  const bankCapacity = getQuestionBankCapacity(coverageRows);
  const statuses = [
    [vi ? "Đề Listening" : "Listening mock", data.listeningReady],
    [vi ? "Đề Reading" : "Reading mock", data.readingReady],
    [vi ? "Đề đầy đủ" : "Full mock", data.ready],
  ] as const;
  const parts = coverageRows.map((row) => ({
    ...row,
    area: row.part <= 4 ? "Listening" : "Reading",
    count: row.groups === row.questions
      ? vi ? `${row.questions} câu` : `${row.questions} questions`
      : vi ? `${row.groups} nhóm · ${row.questions} câu` : `${row.groups} groups · ${row.questions} questions`,
  }));

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <AdminNav locale={prefs.interfaceLanguage} />
        <header className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black">{vi ? "Ngân hàng câu hỏi" : "Question Bank"}</h1>
            <p className="mt-1 text-slate-600">{vi ? "Độ phủ, quy mô chống lặp và quản lý nội dung TOEIC." : "TOEIC coverage, repeat-safe capacity and content management."}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link className="rounded-lg bg-teal-700 px-4 py-2 font-bold text-white" href="/admin/content/new">{vi ? "+ Tạo nội dung" : "+ Create content"}</Link>
            <Link className="rounded-lg border bg-white px-4 py-2 font-bold" href="/admin/content/import">{vi ? "Nhập JSON" : "Import JSON"}</Link>
            <Link className="rounded-lg border bg-white px-4 py-2 font-bold" href="/admin/content/questions">{vi ? "Duyệt và xuất JSON" : "Browse and export JSON"}</Link>
            <Link className="rounded-lg border bg-white px-4 py-2 font-bold" href="/admin/content/media">Media</Link>
          </div>
        </header>

        <section className="mt-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">{vi ? "Khả năng tạo đề" : "Mock capacity"}</h2>
          <div className="mt-3 grid gap-3 lg:grid-cols-4">
            <article className={`rounded-2xl border p-5 lg:col-span-1 ${bankCapacity >= targetForms ? "border-emerald-300 bg-emerald-50" : "border-orange-300 bg-orange-50"}`}>
              <p className="text-sm font-bold text-slate-600">{vi ? "Đề full không lặp câu" : "No-repeat full mocks"}</p>
              <p className="mt-2 text-4xl font-black">{bankCapacity}</p>
              <p className="mt-2 text-sm leading-5 text-slate-700">{vi ? `Mục tiêu vận hành: ít nhất ${targetForms} đề. Part yếu nhất quyết định con số này.` : `Operating target: at least ${targetForms}. The weakest Part sets this number.`}</p>
            </article>
            <div className="grid gap-3 sm:grid-cols-3 lg:col-span-3">
              {statuses.map(([label, ready]) => (
                <article className={`rounded-2xl border p-5 ${ready ? "border-emerald-300 bg-emerald-50" : "border-amber-300 bg-amber-50"}`} key={label}>
                  <h3 className="font-black">{label}</h3>
                  <p className="mt-2 font-semibold">{ready ? (vi ? "Đủ cấu trúc 1 đề" : "1-form ready") : (vi ? "Chưa ghép được đề" : "Cannot assemble yet")}</p>
                  <p className="mt-2 text-sm text-slate-700">{vi ? "Chỉ xác nhận có thể ghép đúng format, không có nghĩa ngân hàng đã đủ lớn." : "Confirms the official structure only; it does not mean the bank is large enough."}</p>
                </article>
              ))}
            </div>
          </div>

          <details className="mt-3 rounded-xl border bg-white p-4 text-sm">
            <summary className="cursor-pointer font-bold">{vi ? "Vì sao Part 7 cần kiểm tra riêng?" : "Why Part 7 has a separate format check"}</summary>
            <p className="mt-3 max-w-4xl leading-6 text-slate-700">{vi ? "Một đề Reading chuẩn cần đúng 10 bài single-passage với tổng 29 câu và 5 bài double/triple-passage với tổng 25 câu. Kiểm tra này ngăn hệ thống báo sẵn sàng khi tổng 54 câu đủ nhưng sai cơ cấu đề thật." : "A real Reading form needs exactly 10 single-passage sets totaling 29 questions and 5 double/triple-passage sets totaling 25 questions. This prevents a false ready state when 54 questions exist but the official structure cannot be assembled."}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <p className="rounded-lg bg-slate-50 p-3"><strong>Single:</strong> {data.reading.p7SingleGroups} / 10 {vi ? "nhóm" : "groups"} · {data.reading.p7SingleQuestions} / 29 {vi ? "câu cho 1 đề" : "questions for one form"}</p>
              <p className="rounded-lg bg-slate-50 p-3"><strong>Double / Triple:</strong> {data.reading.p7MultipleGroups} / 5 {vi ? "nhóm" : "groups"} · {data.reading.p7MultipleQuestions} / 25 {vi ? "câu cho 1 đề" : "questions for one form"}</p>
            </div>
          </details>
        </section>

        <section className="mt-8 rounded-3xl border border-orange-200 bg-gradient-to-br from-orange-50 via-white to-teal-50 p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[.18em] text-orange-700">{vi ? "Kế hoạch mở rộng ngân hàng" : "Question bank growth plan"}</p>
              <h2 className="mt-2 text-2xl font-black">{vi ? "Part nào đang gây nguy cơ lặp câu?" : "Which Part creates the highest repeat risk?"}</h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{vi ? `Blueprint ở đây là cơ cấu câu hỏi chính thức của một đề TOEIC, nhân với mục tiêu ${targetForms} đề full không dùng lại câu (${(targetForms * 200).toLocaleString(vi ? "vi-VN" : "en-US")} câu). Chỉ tính nội dung đã xuất bản và đúng cấu trúc nhóm.` : `Here, blueprint means the official TOEIC form structure multiplied by a target of ${targetForms} full mocks without reusing questions (${(targetForms * 200).toLocaleString("en-US")} questions). Only published, structurally valid content counts.`}</p>
            </div>
            <div className="flex flex-wrap gap-2"><Link className="rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-black text-slate-900" href="/admin/settings#question-bank-blueprint">{vi ? "Cài đặt blueprint" : "Blueprint settings"}</Link><Link className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-black text-white" href="/admin/content/new">{vi ? "+ Tạo draft" : "+ Create draft"}</Link></div>
          </div>
          {recommendations.length ? (
            <div className="mt-5 grid gap-3 lg:grid-cols-3">
              {recommendations.map((item, index) => (
                <article className="rounded-2xl border bg-white p-5 shadow-sm" key={`${item.part}-${item.setType ?? "all"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black text-orange-900">#{index + 1} {vi ? "ưu tiên" : "priority"}</span>
                    <span className="text-sm font-black text-slate-500">{Math.min(100, Math.round(item.coverage * 100))}%</span>
                  </div>
                  <h3 className="mt-4 text-xl font-black">{item.label}</h3>
                  <p className="mt-2 text-sm font-bold text-slate-800">{vi ? `Hiện đủ khoảng ${item.uniqueFormCapacity} đề không lặp` : `Currently supports about ${item.uniqueFormCapacity} no-repeat forms`}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{vi ? `Cần thêm ${item.questionDeficit} câu${item.groupDeficit ? ` và ${item.groupDeficit} nhóm` : ""} để đạt mục tiêu ${item.targetForms} đề.` : `Add ${item.questionDeficit} questions${item.groupDeficit ? ` and ${item.groupDeficit} groups` : ""} to reach the ${item.targetForms}-form target.`}</p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(100, item.coverage * 100)}%` }} /></div>
                  <Link className="mt-4 inline-block text-sm font-black text-teal-800 underline" href={`/admin/content/questions?part=${item.part}${item.setType ? `&setType=${item.setType}` : ""}`}>{vi ? "Xem nội dung hiện có →" : "Review current content →"}</Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 font-bold text-emerald-900">{vi ? `Tất cả Part đã đủ cho mục tiêu ${targetForms} đề không lặp. Bước tiếp theo là cân bằng kỹ năng, chủ đề và độ khó.` : `Every Part meets the ${targetForms}-form no-repeat target. Next, balance skills, topics and difficulty.`}</div>
          )}
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500">{vi ? "Câu hỏi theo Part" : "Questions by Part"}</h2>
          {["Listening", "Reading"].map((area) => <div key={area}><h3 className="mt-5 text-xl font-black">{area}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{parts.filter((part) => part.area === area).map((part) => <Link href={`/admin/content/questions?part=${part.part}${part.setType ? `&setType=${part.setType}` : ""}`} className="rounded-2xl border bg-white p-5 transition hover:border-teal-500 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-teal-700" key={part.label}><span className="font-bold text-teal-800">{part.label} →</span><span className="mt-2 block text-lg font-black">{part.count}</span></Link>)}</div></div>)}
        </section>

        <section className="mt-8 rounded-2xl border bg-white p-5">
          <h2 className="font-black">{vi ? "Vòng đời nội dung" : "Content lifecycle"}</h2>
          <div className="mt-3 flex flex-wrap gap-3">{[["draft", vi ? "Bản nháp" : "Draft"], ["published", vi ? "Đã xuất bản" : "Published"], ["archived", vi ? "Đã lưu trữ" : "Archived"]].map(([key, label]) => <Link className="rounded-lg border px-4 py-3 font-semibold hover:border-teal-500" href={`/admin/content/questions?lifecycle=${key}`} key={key}>{label}: {data.lifecycle[key] ?? 0} →</Link>)}</div>
        </section>
      </div>
    </main>
  );
}
