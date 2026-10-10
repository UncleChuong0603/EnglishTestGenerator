"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { saveStudyVocabularyAction } from "@/app/vocabulary/actions";
import type { StudyTopic } from "@/lib/vocabulary/study-list";
import { VocabularyMeaningQuiz } from "./meaning-quiz";
import { PronunciationButton } from "./pronunciation-button";

type CollectionId = "topics" | "practice" | "common";

const collectionOrder: CollectionId[] = ["topics", "practice", "common"];

function collectionForTopic(topicId: string): CollectionId {
  if (topicId.startsWith("frequent-")) return "practice";
  if (topicId.startsWith("common-")) return "common";
  return "topics";
}

function ArrowIcon({ direction = "right" }: { direction?: "left" | "right" }) {
  return <svg aria-hidden="true" className={`size-5 shrink-0 ${direction === "left" ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24"><path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" /></svg>;
}

function BookIcon() {
  return <svg aria-hidden="true" className="size-6" fill="none" viewBox="0 0 24 24"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5v-16ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5a2.5 2.5 0 0 1 2.5 2.5v-16Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" /></svg>;
}

function SaveButton({ locale }: { locale: "vi" | "en" }) {
  const { pending } = useFormStatus();
  return <button className="min-h-11 rounded-lg bg-teal-800 px-4 text-sm font-bold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900 disabled:cursor-wait disabled:opacity-65" disabled={pending} type="submit">{pending ? (locale === "vi" ? "Đang lưu…" : "Saving…") : (locale === "vi" ? "Lưu để ôn" : "Save to review")}</button>;
}

export function StudyBrowser({ topics, savedKeys, locale, signedIn = true, initialTopicId }: { topics: StudyTopic[]; savedKeys: string[]; locale: "vi" | "en"; signedIn?: boolean; initialTopicId?: string }) {
  const vi = locale === "vi";
  const topicIds = useMemo(() => new Set(topics.map((topic) => topic.id)), [topics]);
  const saved = useMemo(() => new Set(savedKeys), [savedKeys]);
  const [activeCollection, setActiveCollection] = useState<CollectionId>("topics");
  const [activeTopicId, setActiveTopicId] = useState<string | null>(() => initialTopicId && topicIds.has(initialTopicId) ? initialTopicId : null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [meaningVisible, setMeaningVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [onlyUnfinished, setOnlyUnfinished] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const studyHeadingRef = useRef<HTMLHeadingElement>(null);
  const previousTopicRef = useRef<string | null>(null);
  const total = topics.reduce((sum, topic) => sum + topic.entries.length, 0);
  const totalLabel = total.toLocaleString(vi ? "vi-VN" : "en-US");
  const normalized = deferredQuery.trim().toLocaleLowerCase(vi ? "vi-VN" : "en-US");

  const collectionCopy: Record<CollectionId, { label: string; description: string }> = {
    topics: {
      label: vi ? "Chủ đề TOEIC" : "TOEIC topics",
      description: vi ? "Các tình huống thường gặp trong bài thi và nơi làm việc." : "Common test situations and workplace contexts.",
    },
    practice: {
      label: vi ? "Từ trong đề luyện" : "Practice vocabulary",
      description: vi ? "Các gói ưu tiên từ nội dung luyện tập TOEIC GYM." : "Priority packs drawn from TOEIC GYM practice content.",
    },
    common: {
      label: vi ? "Từ thông dụng" : "Common vocabulary",
      description: vi ? "Các gói bổ sung theo tần suất tiếng Anh phổ thông." : "Additional packs based on general English frequency.",
    },
  };

  const visibleTopics = useMemo(() => topics.filter((topic) => {
    if (collectionForTopic(topic.id) !== activeCollection) return false;
    if (onlyUnfinished && topic.entries.every((entry) => saved.has(entry.key))) return false;
    if (!normalized) return true;
    const titleMatches = [topic.titleVi, topic.titleEn].some((title) => title.toLocaleLowerCase(vi ? "vi-VN" : "en-US").includes(normalized));
    return titleMatches || topic.entries.some((entry) => [entry.term, entry.meaningVi, entry.meaningEn].some((value) => value.toLocaleLowerCase(vi ? "vi-VN" : "en-US").includes(normalized)));
  }), [activeCollection, normalized, onlyUnfinished, saved, topics, vi]);

  const activeTopic = activeTopicId ? topics.find((topic) => topic.id === activeTopicId) : undefined;
  const availableEntries = activeTopic ? (signedIn ? activeTopic.entries : activeTopic.entries.slice(0, 8)) : [];
  const activeEntry = availableEntries[currentIndex];

  useEffect(() => {
    const handlePopState = () => {
      const topicId = new URL(window.location.href).searchParams.get("topic");
      setActiveTopicId(topicId && topicIds.has(topicId) ? topicId : null);
      setCurrentIndex(0);
      setMeaningVisible(false);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [topicIds]);

  useEffect(() => {
    if (activeTopicId && activeTopicId !== previousTopicRef.current) {
      const frame = window.requestAnimationFrame(() => {
        studyHeadingRef.current?.focus();
        studyHeadingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      previousTopicRef.current = activeTopicId;
      return () => window.cancelAnimationFrame(frame);
    }
    previousTopicRef.current = activeTopicId;
  }, [activeTopicId]);

  function updateTopicUrl(topicId: string | null) {
    const url = new URL(window.location.href);
    if (topicId) url.searchParams.set("topic", topicId);
    else url.searchParams.delete("topic");
    window.history.pushState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }

  function openTopic(topic: StudyTopic) {
    const matchingIndex = normalized ? topic.entries.findIndex((entry) => [entry.term, entry.meaningVi, entry.meaningEn].some((value) => value.toLocaleLowerCase(vi ? "vi-VN" : "en-US").includes(normalized))) : -1;
    const firstUnfinished = signedIn ? topic.entries.findIndex((entry) => !saved.has(entry.key)) : -1;
    const nextIndex = matchingIndex >= 0 ? matchingIndex : firstUnfinished >= 0 ? firstUnfinished : 0;
    setCurrentIndex(signedIn ? nextIndex : Math.min(nextIndex, 7));
    setMeaningVisible(false);
    setActiveTopicId(topic.id);
    updateTopicUrl(topic.id);
  }

  function closeTopic() {
    setActiveTopicId(null);
    setCurrentIndex(0);
    setMeaningVisible(false);
    updateTopicUrl(null);
  }

  function showEntry(index: number) {
    setCurrentIndex(index);
    setMeaningVisible(false);
  }

  if (activeTopic && activeEntry) {
    const progress = ((currentIndex + 1) / availableEntries.length) * 100;
    const savedCount = activeTopic.entries.filter((entry) => saved.has(entry.key)).length;
    const atEnd = currentIndex === availableEntries.length - 1;
    const signInTarget = `/sign-in?next=${encodeURIComponent(`/vocabulary?topic=${activeTopic.id}`)}`;

    return <section className="mt-10 scroll-mt-6" id="toeic-study-list" aria-labelledby="active-vocabulary-pack-title">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 bg-slate-900 p-5 text-white sm:p-7">
          <button className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-bold text-teal-200 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300" onClick={closeTopic} type="button"><ArrowIcon direction="left" />{vi ? "Tất cả gói từ vựng" : "All vocabulary packs"}</button>
          <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[.16em] text-teal-300">{vi ? "Đang học theo gói" : "Studying a pack"}</p>
              <h2 className="mt-2 scroll-mt-6 text-2xl font-black outline-none sm:text-3xl" id="active-vocabulary-pack-title" ref={studyHeadingRef} tabIndex={-1}>{vi ? activeTopic.titleVi : activeTopic.titleEn}</h2>
              <p className="mt-2 text-sm font-semibold text-slate-300">{signedIn ? (vi ? `${savedCount}/${activeTopic.entries.length} từ đã lưu để ôn` : `${savedCount}/${activeTopic.entries.length} saved for review`) : (vi ? `Xem trước ${availableEntries.length}/${activeTopic.entries.length} từ` : `Previewing ${availableEntries.length}/${activeTopic.entries.length} terms`)}</p>
            </div>
            <label className="block min-w-52 text-sm font-bold text-slate-200"><span>{vi ? "Đi đến từ" : "Jump to term"}</span><select className="mt-1 min-h-11 w-full rounded-lg border border-slate-600 bg-slate-800 px-3 text-white outline-offset-2 focus:outline-2 focus:outline-teal-300" onChange={(event) => showEntry(Number(event.target.value))} value={currentIndex}>{availableEntries.map((entry, index) => <option key={entry.key} value={index}>{index + 1}. {entry.term}</option>)}</select></label>
          </div>
          <div className="mt-5 flex items-center gap-3"><div aria-label={vi ? `Tiến độ ${currentIndex + 1} trên ${availableEntries.length}` : `Progress ${currentIndex + 1} of ${availableEntries.length}`} aria-valuemax={availableEntries.length} aria-valuemin={1} aria-valuenow={currentIndex + 1} className="h-2 flex-1 overflow-hidden rounded-full bg-slate-700" role="progressbar"><div className="h-full rounded-full bg-teal-300 transition-[width] motion-reduce:transition-none" style={{ width: `${progress}%` }} /></div><span aria-live="polite" className="min-w-16 text-right text-sm font-bold tabular-nums text-slate-200">{currentIndex + 1}/{availableEntries.length}</span></div>
        </header>

        <div className="p-4 sm:p-7">
          <article className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-8" aria-labelledby="active-vocabulary-term">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[.16em] text-teal-800">{activeEntry.kind === "phrase" ? (vi ? "Cụm từ" : "Phrase") : (vi ? "Từ vựng" : "Word")}</p>
                <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl" id="active-vocabulary-term" lang="en">{activeEntry.term}</h3>
              </div>
              {saved.has(activeEntry.key) ? <span className="rounded-full bg-teal-100 px-3 py-1.5 text-xs font-black text-teal-900">{vi ? "Đã lưu" : "Saved"}</span> : null}
            </div>
            <p className="mt-6 rounded-xl border border-slate-200 bg-white p-4 leading-7 text-slate-700" lang="en">{activeEntry.example}</p>

            {!meaningVisible ? <div className="mt-6 border-t border-slate-200 pt-6"><p className="text-sm leading-6 text-slate-600">{vi ? "Tự nhớ lại nghĩa của từ trong câu ví dụ, sau đó mở đáp án để kiểm tra." : "Recall the meaning from the example, then reveal the answer to check."}</p><button className="mt-4 min-h-12 w-full rounded-lg bg-teal-800 px-5 font-bold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900 sm:w-auto" onClick={() => setMeaningVisible(true)} type="button">{vi ? "Mở nghĩa" : "Reveal meaning"}</button></div> : <div className="mt-6 border-t border-teal-200 pt-6" role="region" aria-label={vi ? `Nghĩa của ${activeEntry.term}` : `Meaning of ${activeEntry.term}`}>
              <p className="text-lg font-black text-slate-950">{vi ? activeEntry.meaningVi : activeEntry.meaningEn}</p>
              <p className="mt-2 leading-6 text-slate-600">{vi ? activeEntry.meaningEn : activeEntry.meaningVi}</p>
              <div className="mt-5 flex flex-wrap items-center gap-3"><PronunciationButton kind={activeEntry.kind} locale={locale} term={activeEntry.term} />{saved.has(activeEntry.key) ? <span className="inline-flex min-h-11 items-center text-sm font-bold text-teal-900">{vi ? "Từ này đã có trong lịch ôn." : "This term is already in your review schedule."}</span> : signedIn ? <form action={saveStudyVocabularyAction}><input name="entryKey" type="hidden" value={activeEntry.key} /><SaveButton locale={locale} /></form> : <Link className="inline-flex min-h-11 items-center rounded-lg border border-teal-800 px-4 text-sm font-bold text-teal-900 transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900" href={signInTarget}>{vi ? "Đăng nhập để lưu từ" : "Sign in to save"}</Link>}</div>
            </div>}
          </article>

          {!signedIn && activeTopic.entries.length > availableEntries.length ? <p className="mx-auto mt-4 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">{vi ? `Bạn đang xem trước ${availableEntries.length} từ đầu tiên. Đăng nhập miễn phí khi học hết phần xem trước để tiếp tục gói.` : `You are previewing the first ${availableEntries.length} terms. Sign in free when you finish the preview to continue this pack.`}</p> : null}

          <nav aria-label={vi ? "Điều hướng trong gói từ vựng" : "Vocabulary pack navigation"} className="mx-auto mt-6 flex max-w-3xl items-center justify-between gap-3">
            <button className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 px-4 font-bold text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 disabled:cursor-not-allowed disabled:opacity-40" disabled={currentIndex === 0} onClick={() => showEntry(currentIndex - 1)} type="button"><ArrowIcon direction="left" /><span className="hidden sm:inline">{vi ? "Từ trước" : "Previous"}</span></button>
            {atEnd && !signedIn && activeTopic.entries.length > availableEntries.length ? <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-800 px-5 font-bold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900" href={signInTarget}>{vi ? "Đăng nhập để học tiếp" : "Sign in to continue"}<ArrowIcon /></Link> : <button className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-teal-800 px-5 font-bold text-white transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-900" onClick={() => atEnd ? closeTopic() : showEntry(currentIndex + 1)} type="button">{atEnd ? (vi ? "Hoàn tất gói" : "Finish pack") : (vi ? "Từ tiếp theo" : "Next term")}<ArrowIcon /></button>}
          </nav>
        </div>
      </div>
    </section>;
  }

  return <section className="mt-10 scroll-mt-6" id="toeic-study-list" aria-labelledby="vocabulary-pack-library-title">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-black uppercase tracking-[.16em] text-teal-800">{vi ? "Học theo từng gói" : "Learn one pack at a time"}</p>
        <h2 className="mt-1 text-2xl font-black sm:text-3xl" id="vocabulary-pack-library-title">{vi ? "Chọn chủ đề từ vựng" : "Choose a vocabulary topic"}</h2>
        <p className="mt-3 max-w-3xl leading-7 text-slate-600">{vi ? `${totalLabel} từ được chia thành các gói ngắn. Chọn một gói để học từng từ với ví dụ, nghĩa và phát âm.` : `${totalLabel} terms are organized into focused packs. Choose one to study each term with an example, meaning, and pronunciation.`}</p>
      </div>
      {signedIn ? <p className="shrink-0 text-sm font-semibold text-slate-600">{vi ? `${saved.size}/${totalLabel} từ đã lưu` : `${saved.size}/${totalLabel} saved`}</p> : <span className="w-fit shrink-0 rounded-full bg-[#eef3eb] px-3 py-1 text-xs font-bold text-[#245a43]">{vi ? "XEM TRƯỚC MIỄN PHÍ" : "FREE PREVIEW"}</span>}
    </div>

    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div aria-label={vi ? "Nhóm gói từ vựng" : "Vocabulary pack groups"} className="flex flex-wrap gap-2">{collectionOrder.map((collection) => <button aria-pressed={activeCollection === collection} className={`min-h-11 rounded-full border px-4 text-sm font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 ${activeCollection === collection ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-teal-700 hover:text-teal-900"}`} key={collection} onClick={() => setActiveCollection(collection)} type="button">{collectionCopy[collection].label}<span className="ml-1.5 text-xs opacity-70">{topics.filter((topic) => collectionForTopic(topic.id) === collection).length}</span></button>)}</div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{collectionCopy[activeCollection].description}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="block"><span className="text-sm font-bold text-slate-700">{vi ? "Tìm chủ đề hoặc từ" : "Find a topic or term"}</span><input className="mt-1 min-h-11 w-full rounded-lg border border-slate-300 px-3 outline-offset-2 focus:outline-2 focus:outline-teal-700" onChange={(event) => setQuery(event.target.value)} placeholder={vi ? "Ví dụ: văn phòng, invoice…" : "e.g. office, invoice…"} type="search" value={query} /></label>
        {signedIn ? <label className="flex min-h-11 items-center gap-2 self-end text-sm font-semibold text-slate-700"><input checked={onlyUnfinished} className="size-4 accent-teal-800" onChange={(event) => setOnlyUnfinished(event.target.checked)} type="checkbox" />{vi ? "Chỉ gói còn từ mới" : "Packs with new terms"}</label> : null}
      </div>
    </div>

    <p aria-live="polite" className="mt-4 text-sm font-semibold text-slate-600">{vi ? `${visibleTopics.length} gói phù hợp` : `${visibleTopics.length} matching packs`}</p>
    {visibleTopics.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleTopics.map((topic) => {
      const savedCount = topic.entries.filter((entry) => saved.has(entry.key)).length;
      const preview = topic.entries.slice(0, 3).map((entry) => entry.term).join(" · ");
      return <button className="group flex min-h-56 cursor-pointer flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left transition-[border-color,background-color,box-shadow] hover:border-teal-500 hover:bg-teal-50/40 hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800" key={topic.id} onClick={() => openTopic(topic)} type="button">
        <span className="grid size-11 place-items-center rounded-xl bg-slate-900 text-teal-200"><BookIcon /></span>
        <span className="mt-5 text-lg font-black leading-7 text-slate-950">{vi ? topic.titleVi : topic.titleEn}</span>
        <span className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600" lang="en">{preview}</span>
        <span className="mt-auto flex w-full items-end justify-between gap-3 pt-5"><span className="text-sm font-bold text-slate-600">{signedIn && savedCount ? (vi ? `${savedCount}/${topic.entries.length} từ đã lưu` : `${savedCount}/${topic.entries.length} saved`) : (vi ? `${topic.entries.length} từ` : `${topic.entries.length} terms`)}</span><span className="inline-flex items-center gap-1 font-bold text-teal-800 group-hover:text-teal-950">{vi ? "Học gói này" : "Study pack"}<ArrowIcon /></span></span>
      </button>;
    })}</div> : <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-6 text-slate-600">{vi ? "Không tìm thấy gói phù hợp. Thử từ khóa hoặc nhóm khác." : "No matching packs. Try another search or group."}</div>}

    <div className="mt-12"><VocabularyMeaningQuiz locale={locale} signedIn={signedIn} topics={topics} /></div>
    <p className="mt-8 text-xs leading-5 text-slate-500">{vi ? "100 từ đầu theo chủ đề TOEIC; 900 từ kế tiếp ưu tiên theo kho đề luyện TOEIC GYM; 4.000 từ cuối được chọn theo tần suất tiếng Anh phổ thông. Nghĩa từ điển ở nhóm cuối có thể cần chỉnh sửa thêm. Đây không phải bảng xếp hạng chính thức của ETS." : "The first 100 terms follow TOEIC topics; the next 900 are prioritized from our practice bank; the final 4,000 use general English frequency. Dictionary senses in the final sets may need further review. This is not an official ETS ranking."} <a className="font-semibold text-teal-800 underline" href="https://www.eu.ets.org/content/dam/ets-org/eu/pdfs/toeic/toeic-listening-reading-test.pdf" rel="noopener noreferrer" target="_blank">{vi ? "Sổ tay ETS" : "ETS handbook"}</a>.</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">Dữ liệu từ điển: Từ điển Anh–Việt thichhoc.com (thichhoc-dict), giấy phép CC BY-SA 4.0. <a className="font-semibold text-teal-800 underline" href="https://github.com/thichhoc-org/thichhoc-dict" rel="noopener noreferrer" target="_blank">Nguồn gốc</a>: WordNet 3.1 (Princeton), CMUdict (CMU), Wiktionary. Đã chỉnh sửa dữ liệu. <a className="font-semibold text-teal-800 underline" href="/vocabulary-data-attribution.txt" target="_blank">{vi ? "Ghi nguồn đầy đủ" : "Full attribution"}</a>.</p>
  </section>;
}
