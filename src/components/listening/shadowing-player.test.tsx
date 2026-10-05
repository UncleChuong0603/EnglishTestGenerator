import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ShadowingPlayer } from "./shadowing-player";

describe("audio shadowing", () => {
  it("shows duration choices up to ten minutes with the transcript beside audio and no answer controls", () => {
    const html = renderToStaticMarkup(<ShadowingPlayer clips={[{ id: "sample", minutes: 1, title: "A sample", audioUrl: "/sample.mp3", transcript: "Listen and speak along." }, { id: "another", minutes: 1, title: "Another topic", audioUrl: "/another.mp3", transcript: "A second, different story." }, { id: "long", minutes: 10, title: "A long talk", audioUrl: "/long.mp3", transcript: "A longer story." }]} locale="vi" />);
    expect(html).toContain("10 phút");
    expect(html).toContain("Another topic");
    expect(html.match(/1 phút/g)).toHaveLength(1);
    expect(html).toContain("Transcript");
    expect(html.replace(/<[^>]*>/g, "")).toContain("Listen and speak along.");
    expect(html).toContain("/sample.mp3");
    expect(html).not.toContain("type=\"radio\"");
    expect(html).not.toContain("Kiểm tra đáp án");
  });

  it("lets guests play one complete sample and gates the rest of the library", () => {
    const html = renderToStaticMarkup(<ShadowingPlayer clips={[{ id: "sample", minutes: 1, title: "A sample", audioUrl: "/sample.mp3", transcript: "Listen and speak along." }, { id: "another", minutes: 1, title: "Another topic", audioUrl: "/another.mp3", transcript: "Another transcript." }, { id: "long", minutes: 10, title: "A long talk", audioUrl: "/long.mp3", transcript: "Long transcript." }]} locale="en" signedIn={false} />);

    expect(html).toContain("Choose the audio length");
    expect(html.replace(/<[^>]*>/g, "")).toContain("Listen and speak along.");
    expect(html).toContain("Free sample.");
    expect(html).toContain("/sign-in?next=%2Flistening-lessons");
    expect(html).toContain("<audio");
    expect(html).toContain("/sample.mp3");
    expect(html).not.toContain("/another.mp3");
  });
});
