import {copyFile, mkdir, readFile, writeFile, access, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {EdgeTTS} from 'node-edge-tts';
import ffmpeg from 'ffmpeg-static';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'public');
const storyPath = path.join(root, 'storyboard.json');
const story = JSON.parse(await readFile(storyPath, 'utf8'));
const exists = async file => access(file).then(() => true, () => false);
await Promise.all(['fonts', 'audio'].map(dir => mkdir(path.join(publicDir, dir), {recursive: true})));
await copyFile(path.join(root, '../public/mascot/milo-coach.webp'), path.join(publicDir, 'milo-coach.webp'));
await copyFile(path.join(root, '../public/brand/toeic-gym-mark.png'), path.join(publicDir, 'brand-mark.png'));

for (const weight of ['Regular', 'SemiBold', 'Bold']) {
  const filename = `BeVietnamPro-${weight}.ttf`;
  const target = path.join(publicDir, 'fonts', filename);
  if (!await exists(target)) {
    const url = `https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/${filename}`;
    const response = await fetch(url, {signal: AbortSignal.timeout(30000)});
    if (!response.ok) throw new Error(`Font download failed: ${response.status} ${filename}`);
    await writeFile(target, Buffer.from(await response.arrayBuffer()));
  }
}
const license = path.join(publicDir, 'fonts/OFL.txt');
if (!await exists(license)) {
  const response = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/bevietnampro/OFL.txt', {signal: AbortSignal.timeout(30000)});
  if (!response.ok) throw new Error(`Font license download failed: ${response.status}`);
  await writeFile(license, await response.text());
}

const voiceover = !process.argv.includes('--no-voice');
if (voiceover) {
  for (const scene of story.scenes) {
    const target = path.join(publicDir, 'audio', `${scene.id}.mp3`);
    if (!await stat(target).then(info => info.size > 1000, () => false)) {
      console.log(`Synthesizing Vietnamese narration: ${scene.id}`);
      try {
        if (process.argv.includes('--python-tts')) {
          const result = spawnSync('python', [path.join(root, 'synthesize.py'), scene.narration, target], {
            env: {...process.env, PYTHONPATH: path.join(root, '../.tmp/video-tts')},
            encoding: 'utf8', windowsHide: true, timeout: 60000,
          });
          if (result.status !== 0) throw new Error(result.stderr || result.error?.message || 'Python TTS failed');
        } else {
          const tts = new EdgeTTS({voice: 'vi-VN-HoaiMyNeural', lang: 'vi-VN', rate: '+6%', outputFormat: 'audio-24khz-96kbitrate-mono-mp3', timeout: 20000});
          await tts.ttsPromise(scene.narration, target);
        }
      } catch (error) {
        throw new Error(`Narration failed for ${scene.id}. Retry preparation or explicitly use --no-voice. ${error.message}`);
      }
    }
    const probe = spawnSync(ffmpeg, ['-hide_banner', '-i', target], {encoding: 'utf8', windowsHide: true});
    const match = probe.stderr?.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
    if (!match) throw new Error(`Invalid narration audio: ${scene.id}`);
    const seconds = Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]);
    scene.seconds = Math.max(scene.seconds, Math.ceil(seconds + 1));
    console.log(`${scene.id}: voice ${seconds.toFixed(2)}s / scene ${scene.seconds}s`);
  }
}
await writeFile(storyPath, JSON.stringify(story, null, 2) + '\n');
await writeFile(path.join(root, 'assets.json'), JSON.stringify({voiceover}, null, 2) + '\n');

// Original instrumental: soft D-major/B-minor arpeggios, bass and a restrained beat.
// No third-party music samples or external runtime requests.
const seconds = story.scenes.reduce((n, scene) => n + scene.seconds, 0);
const rate = 44100;
const count = seconds * rate;
const samples = new Float32Array(count);
const beat = 60 / 96;
const chords = [[50, 57, 61, 66], [47, 54, 59, 62], [43, 50, 57, 59], [45, 52, 57, 61]];
const freq = midi => 440 * 2 ** ((midi - 69) / 12);
const add = (start, duration, sample) => {
  const from = Math.round(start * rate);
  const len = Math.min(Math.round(duration * rate), count - from);
  for (let i = 0; i < len; i++) samples[from + i] += sample(i / rate);
};
for (let b = 0; b * beat < seconds; b++) {
  const chord = chords[Math.floor(b / 8) % chords.length];
  if (b % 4 === 0) {
    add(b * beat, 2.9, t => chord.reduce((n, note) => n + Math.sin(2 * Math.PI * freq(note + 12) * t), 0) * .025 * Math.min(1, t * 5) * Math.exp(-t * 1.1));
    add(b * beat, beat * 3.5, t => Math.sin(2 * Math.PI * freq(chord[0] - 12) * t) * .13 * Math.min(1, t * 35) * Math.exp(-t * 2));
  }
  add(b * beat, .18, t => Math.sin(2 * Math.PI * (48 * t + 4 * (1 - Math.exp(-t * 30)))) * Math.exp(-t * 30) * .12);
  for (let sub = 0; sub < 2; sub++) {
    const note = chord[(b * 2 + sub) % 4] + 24;
    add((b + sub / 2) * beat, .9, t => (Math.sin(2 * Math.PI * freq(note) * t) + .2 * Math.sin(2 * Math.PI * freq(note) * 2 * t)) * Math.min(1, t * 150) * Math.exp(-t * 7) * .085);
    add((b + sub / 2) * beat, .05, t => Math.sin(t * 18017 + Math.sin(t * 19571) * 19) * Math.exp(-t * 95) * .018);
  }
}
let peak = .001;
for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
const wav = Buffer.alloc(44 + count * 2);
wav.write('RIFF', 0); wav.writeUInt32LE(36 + count * 2, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(count * 2, 40);
for (let i = 0; i < count; i++) {
  const fade = Math.min(1, i / rate, (count - i) / (rate * 2));
  wav.writeInt16LE(Math.round(samples[i] / peak * .72 * fade * 32767), 44 + i * 2);
}
await writeFile(path.join(publicDir, 'audio/bed.wav'), wav);

const timestamp = seconds => {
  const ms = Math.round(seconds * 1000);
  return `${String(Math.floor(ms / 3600000)).padStart(2, '0')}:${String(Math.floor(ms / 60000) % 60).padStart(2, '0')}:${String(Math.floor(ms / 1000) % 60).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};
let offset = 0;
const subtitles = story.scenes.map((scene, index) => {
  const from = offset;
  offset += scene.seconds;
  return `${index + 1}\n${timestamp(from + .4)} --> ${timestamp(offset - .2)}\n${scene.narration}\n`;
}).join('\n');
await mkdir(path.join(root, '../out'), {recursive: true});
await writeFile(path.join(root, '../out/toeic-gym-intro.vi.srt'), subtitles);
console.log(`Prepared ${seconds}s video assets. Voiceover: ${voiceover}.`);
