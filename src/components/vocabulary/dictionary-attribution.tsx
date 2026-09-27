import type { DictionaryCard } from "@/lib/vocabulary/dictionary-types";

export function DictionaryAttribution({ card }: { card: DictionaryCard }) {
  return <p className="mt-3 text-[11px] text-slate-500">
    <a className="underline" href="https://dictionaryapi.dev/" rel="noreferrer" target="_blank">Free Dictionary API</a>
    {card.sourceUrl ? <> · <a className="underline" href={card.sourceUrl} rel="noreferrer" target="_blank">Wiktionary</a></> : null}
    {card.license ? <> · <a className="underline" href={card.license.url} rel="noreferrer" target="_blank">{card.license.name}</a></> : null}
  </p>;
}
