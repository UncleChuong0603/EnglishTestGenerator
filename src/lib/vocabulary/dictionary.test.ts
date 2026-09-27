import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { lookupDictionaryWord, normalizeDictionaryWord } from "./dictionary";

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
  it("tries the base form only after a missing inflection", async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, { status: 404 })).mockResolvedValueOnce(Response.json(payload));
    vi.stubGlobal("fetch", fetcher);
    expect((await lookupDictionaryWord("invoices"))?.term).toBe("invoice");
    expect(fetcher.mock.calls[1][0]).toContain("/invoice");
  });
  it("survives a translation outage and missing pronunciation/example", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(Response.json([{ meanings: [{ definitions: [{ definition: "An unusual item." }] }] }])).mockRejectedValueOnce(new Error("offline")));
    expect(await lookupDictionaryWord("testwordxyz")).toMatchObject({ meaningEn: "An unusual item.", meaningVi: "", phonetic: "", audioUrl: null, example: "" });
  });
  it("handles dictionary outages and malformed payloads", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    expect(await lookupDictionaryWord("invoice")).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ unexpected: true })));
    expect(await lookupDictionaryWord("invoice")).toBeNull();
  });
});
