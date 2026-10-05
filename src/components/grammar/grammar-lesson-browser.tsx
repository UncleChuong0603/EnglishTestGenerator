"use client";

import Link from "next/link";
import { FormEvent, type ReactNode, useMemo, useRef, useState } from "react";
import { filterGrammarUnits, type SearchableGrammarUnit } from "@/lib/blog/grammar-search";
import type { InterfaceLanguage } from "@/lib/i18n/config";

function SearchIcon({ className = "" }: { className?: string }) {
  return <svg aria-hidden="true" className={`size-5 ${className}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeLinecap="round" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>;
}

export function GrammarLessonBrowser({ children, locale, units }: { children?: ReactNode; locale: InterfaceLanguage; units: SearchableGrammarUnit[] }) {
  const vi = locale === "vi";
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const filteredUnits = useMemo(() => filterGrammarUnits(units, query), [query, units]);
  const resultCount = filteredUnits.reduce((total, unit) => total + unit.lessons.length, 0);
  const hasQuery = query.trim().length > 0;

  function clearSearch() {
    setQuery("");
    inputRef.current?.focus();
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    document.getElementById("grammar-results")?.scrollIntoView({ block: "start" });
  }

  return <>
    <section aria-labelledby="grammar-search-title" className="mt-8 rounded-2xl border border-[#cbd7cb] bg-white p-5 sm:p-6">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,34rem)] lg:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[.18em] text-[#245a43]">{vi ? "TÌM ĐÚNG CHỦ ĐIỂM" : "FIND THE RIGHT TOPIC"}</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight" id="grammar-search-title">{vi ? "Bạn đang gặp dấu hiệu nào?" : "Which grammar signal did you see?"}</h2>
          <p className="mt-2 leading-7 text-[#45584d]">{vi ? "Tìm theo tên bài hoặc nhập từ/cấu trúc trong câu, ví dụ: who, her, more than." : "Search by lesson name or a word or structure from the sentence, such as who, her, or more than."}</p>
        </div>
        <form className="min-w-0" onSubmit={submitSearch} role="search">
          <label className="mb-2 block text-sm font-bold text-[#172821]" htmlFor="grammar-search">{vi ? "Tìm bài ngữ pháp" : "Search grammar lessons"}</label>
          <div className="flex min-w-0 gap-2">
            <div className="relative min-w-0 flex-1">
              <SearchIcon className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#45584d]" />
              <input
                autoComplete="off"
                className="min-h-12 w-full rounded-lg border border-[#9caaa0] bg-white py-3 pl-11 pr-12 text-base text-[#172821] outline-none placeholder:text-[#687970] focus:border-[#245a43] focus:ring-2 focus:ring-[#245a43]/25"
                id="grammar-search"
                onChange={(event) => setQuery(event.target.value)}
                placeholder={vi ? "Tên bài hoặc dấu hiệu..." : "Lesson or grammar signal..."}
                ref={inputRef}
                type="search"
                value={query}
              />
              {hasQuery ? <button aria-label={vi ? "Xóa nội dung tìm kiếm" : "Clear search"} className="absolute right-1 top-1 grid size-10 place-items-center rounded-md text-xl text-[#45584d] hover:bg-[#eef3eb] focus-visible:outline-2 focus-visible:outline-[#245a43]" onClick={clearSearch} type="button">×</button> : null}
            </div>
            <button className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-lg bg-[#245a43] px-4 font-bold text-white hover:bg-[#184631] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" type="submit"><SearchIcon /><span className="hidden sm:inline">{vi ? "Tìm" : "Search"}</span></button>
          </div>
        </form>
      </div>
      <p aria-live="polite" className="mt-4 text-sm font-semibold text-[#45584d]" role="status">
        {hasQuery ? (vi ? `${resultCount} bài phù hợp với “${query.trim()}”` : `${resultCount} lessons match “${query.trim()}”`) : (vi ? `${resultCount} bài trong thư viện` : `${resultCount} lessons in the library`)}
      </p>
    </section>

    {!hasQuery ? children : null}

    {!hasQuery ? <nav aria-label={vi ? "Mục lục lộ trình ngữ pháp" : "Grammar path contents"} className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {units.map((unit) => <Link className="flex min-h-24 flex-col justify-between rounded-xl border border-[#dce3d9] bg-white px-5 py-4 font-bold text-[#245a43] hover:border-[#245a43] hover:bg-[#eef3eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href={`#${unit.id}`} key={unit.id}>
        <span>{unit.title}</span>
        <span className="mt-2 text-sm font-medium text-[#45584d]">{unit.lessons.length} {vi ? "bài" : "lessons"}</span>
      </Link>)}
    </nav> : null}

    <div className="mt-12 scroll-mt-6 space-y-12" id="grammar-results">
      {filteredUnits.map((unit) => <section aria-labelledby={`${unit.id}-title`} className="scroll-mt-8" id={unit.id} key={unit.id}>
        <div className="grid gap-3 border-b border-[#cbd7cb] pb-5 xl:grid-cols-[minmax(0,1fr)_minmax(18rem,30rem)] xl:items-end">
          <h2 className="text-2xl font-black tracking-tight sm:text-3xl" id={`${unit.id}-title`}>{unit.title}</h2>
          <p className="leading-7 text-[#45584d]">{unit.intro}</p>
        </div>
        <ol className="mt-5 grid gap-4 xl:grid-cols-2">
          {unit.lessons.map((lesson) => <li className="min-w-0 rounded-xl border border-[#dce3d9] bg-white p-5" key={lesson.slug}>
            <p className="text-xs font-black uppercase tracking-wider text-[#9a5d38]">{vi ? "Bài" : "Lesson"} {String(lesson.number).padStart(2, "0")}</p>
            <h3 className="mt-2 text-xl font-black leading-snug"><Link className="underline-offset-4 hover:text-[#245a43] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href={`/blog/${lesson.slug}`}>{lesson.label}</Link></h3>
            <p className="mt-2 leading-7 text-[#45584d]">{lesson.summary}</p>
            <Link className="mt-4 inline-flex min-h-11 items-center font-bold text-[#245a43] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" href={`/blog/${lesson.slug}`}>{vi ? "Đọc bài và tự kiểm tra" : "Read the Vietnamese lesson"}<span aria-hidden="true" className="ml-2">→</span></Link>
          </li>)}
        </ol>
      </section>)}

      {resultCount === 0 ? <section className="rounded-2xl border border-dashed border-[#9caaa0] bg-white px-5 py-10 text-center" role="region">
        <h2 className="text-xl font-black">{vi ? "Chưa tìm thấy bài phù hợp" : "No matching lesson yet"}</h2>
        <p className="mx-auto mt-2 max-w-xl leading-7 text-[#45584d]">{vi ? "Thử một từ ngắn hơn như “who”, “her”, “since”, hoặc tìm theo tên chủ điểm như “mệnh đề quan hệ”." : "Try a shorter signal such as “who”, “her”, or “since”, or search for a topic such as “relative clause”."}</p>
        <button className="mt-5 min-h-11 rounded-lg border border-[#245a43] px-4 font-bold text-[#245a43] hover:bg-[#eef3eb] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245a43]" onClick={clearSearch} type="button">{vi ? "Xóa tìm kiếm" : "Clear search"}</button>
      </section> : null}
    </div>
  </>;
}
