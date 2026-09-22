"use client";

import Form from "next/form";
import { useState, type ChangeEvent } from "react";
import { useFormStatus } from "react-dom";

const thresholdOptions = [
  { value: 0.48, label: "Rộng · bắt nhiều nghi ngờ" },
  { value: 0.58, label: "Cân bằng" },
  { value: 0.7, label: "Chặt · chỉ các cặp rất giống" },
  { value: 0.85, label: "Gần như trùng" },
];

function ScanButton({ part }: { part: number }) {
  const { pending } = useFormStatus();

  return (
    <button
      className="self-end rounded-lg bg-teal-700 px-5 py-3 font-black text-white disabled:cursor-wait disabled:opacity-70"
      disabled={pending}
      type="submit"
    >
      {pending ? `Đang quét Part ${part}…` : `Quét Part ${part}`}
    </button>
  );
}

export function SimilarityFilters({
  part,
  lifecycle,
  threshold,
}: {
  part: number;
  lifecycle?: string;
  threshold: number;
}) {
  const [selectedPart, setSelectedPart] = useState(part);
  const hasPresetThreshold = thresholdOptions.some((option) => option.value === threshold);

  function applyPart(event: ChangeEvent<HTMLSelectElement>) {
    setSelectedPart(Number(event.currentTarget.value));
    event.currentTarget.form?.requestSubmit();
  }

  return (
    <Form
      action="/admin/content/similarity"
      className="mt-6 grid gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur sm:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto]"
      replace
    >
      <label className="text-sm font-bold">
        Part
        <select
          className="mt-1 block w-full rounded-lg border p-2.5"
          name="part"
          onChange={applyPart}
          value={selectedPart}
        >
          {[1, 2, 3, 4, 5, 6, 7].map((value) => (
            <option key={value} value={value}>Part {value}</option>
          ))}
        </select>
      </label>
      <label className="text-sm font-bold">
        Trạng thái
        <select className="mt-1 block w-full rounded-lg border p-2.5" defaultValue={lifecycle ?? ""} name="lifecycle">
          <option value="">Tất cả</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </label>
      <label className="text-sm font-bold">
        Độ nhạy
        <select className="mt-1 block w-full rounded-lg border p-2.5" defaultValue={String(threshold)} name="threshold">
          {!hasPresetThreshold && <option value={threshold}>Đang dùng · {Math.round(threshold * 100)}%</option>}
          {thresholdOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </label>
      <ScanButton part={selectedPart} />
    </Form>
  );
}
