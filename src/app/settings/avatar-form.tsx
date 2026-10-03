"use client";

/* eslint-disable @next/next/no-img-element -- The preview can be a blob or an arbitrary OAuth image URL. */
import { useEffect, useRef, useState, useTransition } from "react";
import type { InterfaceLanguage } from "@/lib/i18n/config";
import { saveAvatar, type AvatarActionState } from "./actions";

const initialState: AvatarActionState = { status: "idle" };
const supportedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxBytes = 5 * 1024 * 1024;

export function AvatarForm({ avatarUrl, locale, name, email }: { avatarUrl: string | null; locale: InterfaceLanguage; name: string; email: string }) {
  const vi = locale === "vi";
  const [state, setState] = useState<AvatarActionState>(initialState);
  const [pending, startTransition] = useTransition();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(avatarUrl);
  const [clientError, setClientError] = useState<string | null>(null);
  const objectUrl = useRef<string | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const initials = name.trim().split(/\s+/).slice(-2).map(part => part[0]?.toUpperCase()).join("") || "TG";

  useEffect(() => () => { if (objectUrl.current) URL.revokeObjectURL(objectUrl.current); }, []);

  function submit(formData: FormData) {
    startTransition(async () => {
      try {
        const result = await saveAvatar(state, formData);
        setState(result);
        if (result.status === "saved" || result.status === "removed") {
          if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
          objectUrl.current = null;
          setPreview(result.status === "saved" ? result.avatarUrl : null);
          setFile(null);
          if (input.current) input.current.value = "";
        }
      } catch {
        setState({ status: "error", error: "save_failed" });
      }
    });
  }

  function chooseAvatar(next: File | null) {
    setClientError(null);
    setState(initialState);
    if (objectUrl.current) URL.revokeObjectURL(objectUrl.current);
    objectUrl.current = null;
    if (!next) { setFile(null); setPreview(avatarUrl); return; }
    if (!supportedTypes.includes(next.type)) {
      setClientError(vi ? "Chọn ảnh JPG, PNG hoặc WebP." : "Choose a JPG, PNG, or WebP image.");
      setFile(null); setPreview(avatarUrl); if (input.current) input.current.value = ""; return;
    }
    if (next.size > maxBytes) {
      setClientError(vi ? "Ảnh phải nhỏ hơn 5 MB." : "The image must be smaller than 5 MB.");
      setFile(null); setPreview(avatarUrl); if (input.current) input.current.value = ""; return;
    }
    objectUrl.current = URL.createObjectURL(next);
    setFile(next); setPreview(objectUrl.current);
  }

  const serverError = state.status === "error" ? ({
    invalid: vi ? "Không tìm thấy tệp ảnh hợp lệ." : "Choose a valid image file.",
    too_large: vi ? "Ảnh phải nhỏ hơn 5 MB." : "The image must be smaller than 5 MB.",
    unsupported: vi ? "Chọn ảnh JPG, PNG hoặc WebP." : "Choose a JPG, PNG, or WebP image.",
    corrupt: vi ? "Không thể đọc ảnh này. Hãy chọn ảnh khác." : "We couldn't read this image. Choose another one.",
    rate: vi ? "Bạn thao tác quá nhanh. Vui lòng thử lại sau." : "You're updating too quickly. Please try again later.",
    unauthorized: vi ? "Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại." : "Your session expired. Sign in again.",
    save_failed: vi ? "Chưa thể lưu ảnh. Vui lòng thử lại." : "We couldn't save your photo. Please try again.",
  } as const)[state.error] : null;
  const error = clientError ?? serverError;

  return <form action={submit} className="space-y-4">
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-100 text-xl font-black text-teal-800 ring-1 ring-slate-200" role="img" aria-label={vi ? `Ảnh đại diện của ${name}` : `${name}'s profile photo`}>
        {preview ? <img alt="" className="size-full object-cover" height="80" src={preview} width="80" /> : initials}
      </div>
      <div className="min-w-0 flex-1"><p className="truncate text-lg font-bold">{name}</p><p className="break-all text-sm text-slate-500">{email}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold hover:bg-slate-50 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-teal-700">
            <svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h2l1.2-1.5h4.6L15.5 5h2A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5Z"/><circle cx="12" cy="12" r="3.25"/></svg>
            {preview ? (vi ? "Chọn ảnh khác" : "Choose another") : (vi ? "Chọn ảnh" : "Choose photo")}
            <input ref={input} accept="image/jpeg,image/png,image/webp" aria-describedby="avatar-help avatar-message" className="sr-only" name="avatar" type="file" onChange={event => chooseAvatar(event.target.files?.[0] ?? null)} />
          </label>
          {preview && !file ? <button className="min-h-11 rounded-xl px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 focus-visible:outline-2 focus-visible:outline-red-700 disabled:opacity-50" disabled={pending} formNoValidate name="intent" type="submit" value="remove">{pending ? (vi ? "Đang lưu…" : "Saving…") : (vi ? "Xóa ảnh" : "Remove photo")}</button> : null}
        </div>
      </div>
    </div>
    <p className="text-xs leading-5 text-slate-500" id="avatar-help">{vi ? "JPG, PNG hoặc WebP, tối đa 5 MB. Ảnh vuông sẽ hiển thị đẹp nhất." : "JPG, PNG, or WebP, up to 5 MB. Square images work best."}</p>
    {error ? <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700" id="avatar-message" role="alert">{error}</p> : state.status === "saved" || state.status === "removed" ? <p className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800" id="avatar-message" role="status">{state.status === "saved" ? (vi ? "Đã cập nhật ảnh đại diện." : "Profile photo updated.") : (vi ? "Đã xóa ảnh đại diện." : "Profile photo removed.")}</p> : <span className="sr-only" id="avatar-message" />}
    {file ? <button className="min-h-11 rounded-xl bg-teal-700 px-4 py-2 font-semibold text-white hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700 disabled:cursor-not-allowed disabled:opacity-60" disabled={pending} type="submit">{pending ? (vi ? "Đang tải lên…" : "Uploading…") : (vi ? "Lưu ảnh" : "Save photo")}</button> : null}
  </form>;
}
