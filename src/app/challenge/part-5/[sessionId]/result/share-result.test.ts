import { describe, expect, it, vi } from "vitest";
import { sharePart5Result } from "./share-result";

const origin = "https://toeicgym.example";
describe("Part 5 result sharing", () => {
  it("uses native share with a score and the public challenge URL only", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const clipboard = { writeText: vi.fn() };
    expect(await sharePart5Result({ share, clipboard } as unknown as Navigator, 7, "en", origin)).toBe("shared");
    expect(share).toHaveBeenCalledWith({ title: "TOEIC Part 5 Challenge", text: "I got 7/10 in the Part 5 Challenge. Your turn!", url: `${origin}/challenge/part-5` });
    expect(clipboard.writeText).not.toHaveBeenCalled();
  });
  it("copies the public URL when native share is unavailable or fails", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    expect(await sharePart5Result({ clipboard: { writeText } } as unknown as Navigator, 2, "vi", origin)).toBe("copied");
    expect(await sharePart5Result({ share: vi.fn().mockRejectedValue(new Error("unsupported")), clipboard: { writeText } } as unknown as Navigator, 2, "vi", origin)).toBe("copied");
    expect(writeText).toHaveBeenCalledWith(`${origin}/challenge/part-5`);
    const share = vi.fn();
    expect(await sharePart5Result({ share, clipboard: { writeText } } as unknown as Navigator, 2, "vi", origin, false)).toBe("copied");
    expect(share).not.toHaveBeenCalled();
  });
  it("does not copy when the user cancels native share", async () => {
    const writeText = vi.fn();
    const share = vi.fn().mockRejectedValue(new DOMException("Cancelled", "AbortError"));
    expect(await sharePart5Result({ share, clipboard: { writeText } } as unknown as Navigator, 2, "vi", origin)).toBe("cancelled");
    expect(writeText).not.toHaveBeenCalled();
  });
});
