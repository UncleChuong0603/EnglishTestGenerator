import { saveLessonAction } from "@/app/admin/listening-lessons/actions";

type Lesson = { id: string; title: string; description: string; toeicPart: number; transcript: string; imageAlt: string | null; imageStorageKey: string | null };

export function ListeningLessonForm({ lesson }: { lesson?: Lesson | null }) {
  return <form action={saveLessonAction} className="mt-6 space-y-5 rounded-2xl border bg-white p-5 sm:p-7">
    {lesson && <input name="id" type="hidden" value={lesson.id} />}
    <label className="block font-bold">Tiêu đề<input className="mt-1 block w-full rounded-lg border p-3" defaultValue={lesson?.title} maxLength={160} name="title" required /></label>
    <label className="block font-bold">Mô tả ngắn<textarea className="mt-1 block min-h-20 w-full rounded-lg border p-3" defaultValue={lesson?.description} maxLength={500} name="description" /></label>
    <label className="block font-bold">Dạng nghe<select className="mt-1 block w-full rounded-lg border p-3" defaultValue={lesson?.toeicPart ?? 3} name="toeicPart">{[1, 2, 3, 4].map(part => <option key={part} value={part}>Part {part}</option>)}</select></label>
    <label className="block font-bold">Audio MP3 (tối đa 10 phút) {lesson ? "(để trống nếu giữ file cũ)" : "*"}<input accept="audio/mpeg" className="mt-1 block w-full rounded-lg border p-3" name="audio" required={!lesson} type="file" /></label>
    <label className="block font-bold">Ảnh minh họa {lesson ? "(để trống nếu giữ ảnh cũ)" : ""}<input accept="image/jpeg,image/png,image/webp" className="mt-1 block w-full rounded-lg border p-3" name="image" type="file" /></label>
    {lesson?.imageStorageKey && <label className="flex items-center gap-2 text-sm"><input name="removeImage" type="checkbox" />Bỏ ảnh hiện tại</label>}
    <label className="block font-bold">Mô tả ảnh cho trình đọc màn hình<input className="mt-1 block w-full rounded-lg border p-3" defaultValue={lesson?.imageAlt ?? ""} maxLength={240} name="imageAlt" /></label>
    <label className="block font-bold">Transcript<textarea className="mt-1 block min-h-72 w-full rounded-lg border p-3 font-mono leading-7" defaultValue={lesson?.transcript} maxLength={20_000} name="transcript" required /></label>
    <p className="text-sm text-slate-600">Bài học này tách khỏi ngân hàng câu hỏi. Audio và transcript trùng với ngân hàng sẽ bị chặn.</p>
    <button className="min-h-12 rounded-xl bg-teal-700 px-6 font-bold text-white" type="submit">Lưu bản nháp</button>
  </form>;
}
