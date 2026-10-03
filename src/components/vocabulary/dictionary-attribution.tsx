import type { DictionaryCard } from "@/lib/vocabulary/dictionary-types";

export function DictionaryAttribution({ card }: { card: DictionaryCard }) {
  const toeicGymMeaning = card.meaningViSource === "toeic_gym" && card.source !== "toeic_gym";
  const myMemoryTranslation = card.meaningViSource === "mymemory" || card.contextViSource === "mymemory";
  return <p className="mt-3 text-[11px] text-slate-500">
    {card.source === "toeic_gym" ? "TOEIC GYM" : card.source === "datamuse" ? <a className="underline" href="https://www.datamuse.com/api/" rel="noreferrer" target="_blank">Datamuse</a> : <a className="underline" href="https://dictionaryapi.dev/" rel="noreferrer" target="_blank">Free Dictionary API</a>}
    {card.sourceUrl ? <> · <a className="underline" href={card.sourceUrl} rel="noreferrer" target="_blank">Wiktionary</a></> : null}
    {card.license ? <> · <a className="underline" href={card.license.url} rel="noreferrer" target="_blank">{card.license.name}</a></> : null}
    {toeicGymMeaning ? <> · TOEIC GYM</> : null}
    {myMemoryTranslation ? <> · <a className="underline" href="https://mymemory.translated.net/" rel="noreferrer" target="_blank">MyMemory</a></> : null}
  </p>;
}
