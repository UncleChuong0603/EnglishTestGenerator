import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { dictionaryCandidates, lookupDictionaryWord, normalizeDictionaryWord } from "./dictionary";

afterEach(() => vi.unstubAllGlobals());
const payload = [{ word: "invoice", phonetics: [{ text: "/ˈɪnvɔɪs/", audio: "https://api.dictionaryapi.dev/media/pronunciations/en/invoice-us.mp3" }], meanings: [{ partOfSpeech: "noun", definitions: [{ definition: "A bill for goods.", example: "Please pay the invoice." }] }], sourceUrls: ["https://en.wiktionary.org/wiki/invoice"], license: { name: "CC BY-SA 3.0", url: "https://creativecommons.org/licenses/by-sa/3.0" } }];

describe("free dictionary lookup", () => {
  it("normalizes punctuation and rejects paths or oversized inputs without making requests", async () => {
    const fetcher = vi.fn(); vi.stubGlobal("fetch", fetcher);
    expect(normalizeDictionaryWord(" CAN’T ")).toBe("can't");
    for (const input of ["../invoice", "https://evil.test", "a".repeat(49), "two words"]) expect(await lookupDictionaryWord(input)).toBeNull();
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("returns IPA, same-origin audio, meaning, example and attribution", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json(payload)));
    const card = await lookupDictionaryWord("Invoice");
    expect(card).toMatchObject({ term: "invoice", phonetic: "/ˈɪnvɔɪs/", audioUrl: "/api/vocabulary/audio/invoice", meaningEn: "A bill for goods.", example: "Please pay the invoice.", sourceUrl: "https://en.wiktionary.org/wiki/invoice" });
    expect(card?.meaningVi).toBeTruthy();
  });
  it("resolves inflections to a locally known base form before requesting an upstream", async () => {
    const fetcher = vi.fn().mockResolvedValue(Response.json(payload));
    vi.stubGlobal("fetch", fetcher);
    expect((await lookupDictionaryWord("invoices"))?.term).toBe("invoice");
    expect(String(fetcher.mock.calls[0][0])).toContain("/invoice");
    expect(dictionaryCandidates("drew")[0]).toBe("draw");
    expect(dictionaryCandidates("joined")[0]).toBe("join");
  });
  it("survives a translation outage and missing pronunciation/example", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json([{ meanings: [{ definitions: [{ definition: "An unusual item." }] }] }])).mockRejectedValueOnce(new Error("offline")));
    expect(await lookupDictionaryWord("testwordxyz")).toMatchObject({ meaningEn: "An unusual item.", meaningVi: "", phonetic: "", audioUrl: null, example: "" });
  });
  it("uses the local catalog when the primary dictionary is unavailable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await lookupDictionaryWord("invoice")).toMatchObject({ term: "invoice", meaningVi: "hóa đơn", source: "toeic_gym", meaningViSource: "toeic_gym" });
  });
  it("prefers a known plain Vietnamese gloss and adds the sentence translation", async () => {
    const context = "It made a big impression during her first week.";
    vi.stubGlobal("fetch", vi.fn(async (input: string | URL | Request) => {
      const url = new URL(String(input));
      if (url.hostname === "api.dictionaryapi.dev") return new Response(null, { status: 503 });
      const query = url.searchParams.get("q");
      if (query === "week") return Response.json({ responseStatus: 200, responseData: { translatedText: "thứ hai" }, matches: [{ translation: "thứ hai", quality: 74, match: 1 }, { translation: "tuần", quality: 74, match: 0.99 }] });
      return Response.json({ responseStatus: 200, responseData: { translatedText: "Nó đã gây ấn tượng lớn trong tuần đầu tiên của cô ấy" } });
    }));
    expect(await lookupDictionaryWord("week", context)).toMatchObject({ meaningVi: "tuần", contextVi: "Nó đã gây ấn tượng lớn trong tuần đầu tiên của cô ấy", meaningViSource: "mymemory", contextViSource: "mymemory" });
  });
  it("handles upstream outages and malformed payloads for words outside the local catalog", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await lookupDictionaryWord("zzunknownwordzz")).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ unexpected: true })));
    expect(await lookupDictionaryWord("zzunknownwordzz")).toBeNull();
  });
});
