import {spawnSync} from 'node:child_process';
import {stat, writeFile, readFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import ffmpeg from 'ffmpeg-static';

const root = path.dirname(fileURLToPath(import.meta.url));
const story = JSON.parse(await readFile(path.join(root, 'storyboard.json'), 'utf8'));
const expectedSeconds = story.scenes.reduce((sum, scene) => sum + scene.seconds, 0);
const results = [];
for (const [filename, dimensions] of [['toeic-gym-intro.mp4', '1920x1080'], ['toeic-gym-intro-vertical.mp4', '1080x1920']]) {
  const file = path.join(root, '../out', filename);
  const metadata = spawnSync(ffmpeg, ['-hide_banner', '-i', file], {encoding: 'utf8', windowsHide: true});
  const description = metadata.stderr || '';
  if (!description.includes(dimensions) || !description.includes('Video: h264') || !description.includes('Audio: aac') || !description.includes('30 fps')) {
    throw new Error(`${filename}: missing expected video/audio format\n${description}`);
  }
  const duration = description.match(/Duration: (\d+):(\d+):(\d+\.\d+)/);
  const seconds = duration ? Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]) : NaN;
  if (Math.abs(seconds - expectedSeconds) > .1) throw new Error(`${filename}: unexpected duration ${seconds}`);
  const decode = spawnSync(ffmpeg, ['-v', 'error', '-i', file, '-f', 'null', '-'], {encoding: 'utf8', windowsHide: true, timeout: 180000});
  if (decode.status !== 0 || decode.stderr.trim()) throw new Error(`${filename}: decode failed ${decode.stderr}`);
  const audio = spawnSync(ffmpeg, ['-hide_banner', '-nostats', '-i', file, '-vn', '-af', 'volumedetect', '-f', 'null', '-'], {encoding: 'utf8', windowsHide: true, timeout: 60000});
  const meanVolumeDb = Number(audio.stderr?.match(/mean_volume: (-?[\d.]+) dB/)?.[1]);
  const peakVolumeDb = Number(audio.stderr?.match(/max_volume: (-?[\d.]+) dB/)?.[1]);
  if (audio.status !== 0 || !Number.isFinite(meanVolumeDb) || meanVolumeDb < -45) throw new Error(`${filename}: silent or invalid audio`);
  const info = {filename, dimensions, seconds, fps: 30, videoCodec: 'h264', audioCodec: 'aac', meanVolumeDb, peakVolumeDb, bytes: (await stat(file)).size, fullDecodePassed: true};
  console.log(JSON.stringify(info));
  results.push(info);
}
await writeFile(path.join(root, '../out/verification.json'), JSON.stringify(results, null, 2));
