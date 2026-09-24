import { execFile } from "node:child_process";
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";
import { EdgeContentTtsProvider } from "../src/lib/content/tts.ts";
import { partExercises } from "../src/lib/listening-lessons/part-exercises.ts";

const directory = resolve("public/listening-exercises");
const provider = new EdgeContentTtsProvider();
const execFileAsync = promisify(execFile);
const force = process.argv.includes("--force");
await mkdir(directory, { recursive: true });

function person(x: number, y: number, shirt = "#25677a") {
  return `<g transform="translate(${x} ${y})"><circle cx="0" cy="-70" r="24" fill="#f2c7a5"/><path d="M-25-41 Q0-53 25-41 L30 38 H-30Z" fill="${shirt}"/><path d="M-26 37 L-38 100 M26 37 L42 100" stroke="#25364a" stroke-width="16" stroke-linecap="round"/><path d="M-25-30 L-52 22 M25-30 L53 22" stroke="#f2c7a5" stroke-width="13" stroke-linecap="round"/></g>`;
}

const scenes = [
  `${person(290,270)}<rect x="370" y="260" width="230" height="17" rx="8" fill="#9a694d"/><path d="M391 277v109m185-109v109" stroke="#694737" stroke-width="16"/><rect x="435" y="163" width="125" height="88" rx="9" fill="#283f57"/><rect x="445" y="173" width="105" height="66" fill="#9fd8e5"/><path d="M425 251h145" stroke="#283f57" stroke-width="12"/>`,
  `${person(265,280,"#b25d42")}<path d="M340 288 Q425 205 464 263" fill="none" stroke="#4d9cb1" stroke-width="12"/><circle cx="430" cy="263" r="10" fill="#4d9cb1"/><rect x="490" y="316" width="115" height="71" rx="10" fill="#b86f4c"/><path d="M546 315v-143m0 96q-78-20-64-82 60 0 64 82m0-26q67-22 55-80-55 2-55 80" fill="#469478" stroke="#317459" stroke-width="9"/>`,
  `<rect x="144" y="295" width="474" height="25" rx="8" fill="#875c47"/><path d="M180 320v76m405-76v76" stroke="#875c47" stroke-width="20"/>${person(325,275,"#556b9f")}<path d="M374 242l95 13-9 53-96-13z" fill="#faf4df" stroke="#8f7969" stroke-width="5"/><path d="M409 255l-7 43" stroke="#8f7969" stroke-width="4"/><circle cx="679" cy="132" r="37" fill="#f3cb72"/>`,
  `${person(260,275,"#ca7455")}<rect x="400" y="305" width="145" height="80" rx="5" fill="#b78a63"/><rect x="434" y="231" width="145" height="74" rx="5" fill="#d2a67c"/><rect x="463" y="163" width="120" height="68" rx="5" fill="#b78a63"/><path d="M472 163h95m-124 68h122m-159 74h131" stroke="#926d52" stroke-width="5"/>`,
  `${person(250,275,"#9170a1")}<circle cx="480" cy="326" r="62" fill="none" stroke="#263b4d" stroke-width="13"/><circle cx="656" cy="326" r="62" fill="none" stroke="#263b4d" stroke-width="13"/><path d="M480 326l75-100 101 100H480l90-2-15-98m0 0h68" fill="none" stroke="#338b98" stroke-width="11" stroke-linecap="round"/><path d="M618 215h61" stroke="#263b4d" stroke-width="10"/>`,
  `${person(300,275,"#456d62")}<rect x="333" y="224" width="183" height="13" rx="7" fill="#6d8290"/><path d="M370 224l16-49h78l16 49" fill="#eef3f3" stroke="#6d8290" stroke-width="7"/><circle cx="406" cy="195" r="12" fill="#df9c64"/><circle cx="441" cy="198" r="12" fill="#eab275"/><rect x="540" y="320" width="184" height="15" rx="7" fill="#8c604b"/><path d="M559 335v62m151-62v62" stroke="#8c604b" stroke-width="13"/>`,
  `<rect x="380" y="140" width="354" height="202" rx="28" fill="#e7b86c"/><rect x="427" y="171" width="193" height="91" rx="8" fill="#a3d9e4"/><rect x="640" y="171" width="65" height="144" rx="4" fill="#718e9e"/><circle cx="457" cy="349" r="35" fill="#304c5a"/><circle cx="660" cy="349" r="35" fill="#304c5a"/>${person(294,285,"#627ba1")}<path d="M339 290l64-31" stroke="#f2c7a5" stroke-width="12"/>`,
  `${person(257,276,"#d09b5d")}<rect x="392" y="166" width="244" height="17" fill="#835c4c"/><rect x="392" y="247" width="244" height="17" fill="#835c4c"/><rect x="392" y="328" width="244" height="17" fill="#835c4c"/><path d="M409 162q23-53 47 0zm74 0q23-53 47 0zm75 0q23-53 47 0zM409 243q23-53 47 0zm74 0q23-53 47 0z" fill="#d1a464" stroke="#ad7c47" stroke-width="4"/><path d="M398 345v52m232-52v52" stroke="#835c4c" stroke-width="13"/>`,
  `${person(274,277,"#487d91")}${person(503,277,"#a97862")}<path d="M324 266l115-4m18 0l-18 0" stroke="#f2c7a5" stroke-width="17" stroke-linecap="round"/><circle cx="444" cy="262" r="15" fill="#e9bc98"/><rect x="150" y="345" width="500" height="13" fill="#c7d2d5"/>`,
  `${person(264,285,"#597595")}<path d="M365 315h316v69H365z" fill="#596e81"/><path d="M415 315l49-73h136l54 73" fill="#a2c2cc" stroke="#596e81" stroke-width="8"/><circle cx="434" cy="383" r="29" fill="#263b4d"/><circle cx="612" cy="383" r="29" fill="#263b4d"/><path d="M470 254v53m120-53v53" stroke="#d9e9e8" stroke-width="6"/>`,
];

function svg(scene: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" role="img"><defs><linearGradient id="bg" x2="0" y2="1"><stop stop-color="#e9f6f3"/><stop offset="1" stop-color="#f6f0e5"/></linearGradient></defs><rect width="800" height="450" fill="url(#bg)"/><path d="M0 392h800" stroke="#b4c9c2" stroke-width="5"/><path d="M80 90h140v115H80z" fill="#d8edf0" stroke="#b4d0d0" stroke-width="7"/><path d="M150 90v115m-70-58h140" stroke="#b4d0d0" stroke-width="5"/>${scene}</svg>`;
}

async function dialogueAudio(transcript: string) {
  if (!ffmpegPath) throw new Error("FFMPEG_NOT_FOUND");
  const turns = [...transcript.matchAll(/(Woman|Man):\s*(.*?)(?=\s+(?:Woman|Man):|$)/g)];
  if (turns.length < 2) throw new Error("DIALOGUE_INVALID");
  const temp = await mkdtemp(join(tmpdir(), "toeicgym-dialogue-"));
  try {
    for (const [index, turn] of turns.entries()) {
      const bytes = await provider.synthesize({ text: turn[2], voice: turn[1] === "Woman" ? "en-US-AriaNeural" : "en-US-GuyNeural", locale: "en-US", outputFormat: "mp3" });
      await writeFile(join(temp, `${index}.mp3`), bytes);
    }
    await writeFile(join(temp, "concat.txt"), turns.map((_, index) => `file '${index}.mp3'`).join("\n"));
    const output = join(temp, "dialogue.mp3");
    await execFileAsync(ffmpegPath, ["-hide_banner", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", join(temp, "concat.txt"), "-c:a", "libmp3lame", "-q:a", "4", "-y", output]);
    return new Uint8Array(await readFile(output));
  } finally {
    await rm(temp, { recursive: true, force: true });
  }
}

for (const [index, scene] of scenes.entries()) {
  await writeFile(resolve(directory, `part-1-${String(index + 1).padStart(2, "0")}.svg`), svg(scene));
}

let next = 0;
async function worker() {
  while (next < partExercises.length) {
    const lesson = partExercises[next++];
    const path = resolve(directory, `${lesson.slug}.mp3`);
    if (!force) {
      try { await access(path); process.stdout.write(`${lesson.slug}: exists\n`); continue; } catch { /* generate missing audio */ }
    }
    const bytes = lesson.toeicPart === 3
      ? await dialogueAudio(lesson.transcript)
      : await provider.synthesize({ text: lesson.transcript, voice: "en-US-AriaNeural", locale: "en-US", outputFormat: "mp3" });
    await writeFile(path, bytes);
    process.stdout.write(`${lesson.slug}: ${bytes.byteLength} bytes\n`);
  }
}

await Promise.all(Array.from({ length: 3 }, () => worker()));
