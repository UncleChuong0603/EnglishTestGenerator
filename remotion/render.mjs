import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import sharp from 'sharp';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, '../out');
await mkdir(output, {recursive: true});
const story = JSON.parse(await readFile(path.join(root, 'storyboard.json'), 'utf8'));
console.log('Bundling the local Remotion project...');
let bundleStep = -1;
const serveUrl = await bundle({entryPoint: path.join(root, 'index.tsx'), publicDir: path.join(root, 'public'),
  onProgress: progress => {const step = Math.floor(progress / 20); if (step > bundleStep) {bundleStep = step; console.log(`Bundle: ${step * 20}%`);}},
});
const landscape = await selectComposition({serveUrl, id: 'ToeicGymIntro'});
const vertical = await selectComposition({serveUrl, id: 'ToeicGymIntroVertical'});

if (process.argv.includes('--previews')) {
  const previews = [];
  let offset = 0;
  for (const scene of story.scenes) {
    const frame = offset + Math.min(scene.seconds * story.fps - 25, 120);
    previews.push({id: scene.id, frame});
    offset += scene.seconds * story.fps;
  }
  for (const composition of [landscape, vertical]) {
    const portrait = composition.height > composition.width;
    const label = portrait ? 'vertical' : 'landscape';
    const tiles = [];
    for (const {id, frame} of previews) {
      const file = path.join(output, `preview-${label}-${id}.png`);
      await renderStill({serveUrl, composition, frame, output: file, imageFormat: 'png', logLevel: 'error'});
      console.log(`Checked ${label} / ${id} / frame ${frame}`);
      tiles.push(await sharp(file).resize(portrait ? 270 : 480).png().toBuffer());
    }
    const tileWidth = portrait ? 270 : 480;
    const tileHeight = portrait ? 480 : 270;
    await sharp({create: {width: tileWidth * (portrait ? 7 : 2), height: tileHeight * (portrait ? 1 : 4), channels: 3, background: '#04110e'}})
      .composite(tiles.map((input, i) => ({input, left: (i % (portrait ? 7 : 2)) * tileWidth, top: Math.floor(i / (portrait ? 7 : 2)) * tileHeight})))
      .png().toFile(path.join(output, `storyboard-${label}.png`));
  }
  await writeFile(path.join(output, 'preview-frames.json'), JSON.stringify(previews, null, 2));
} else {
  for (const composition of process.argv.includes('--vertical') ? [vertical] : process.argv.includes('--all') ? [landscape, vertical] : [landscape]) {
    const filename = composition.id === 'ToeicGymIntro' ? 'toeic-gym-intro.mp4' : 'toeic-gym-intro-vertical.mp4';
    let last = -1;
    await renderMedia({serveUrl, composition, codec: 'h264', crf: 18, pixelFormat: 'yuv420p', audioCodec: 'aac', audioBitrate: '192k', outputLocation: path.join(output, filename), concurrency: 4,
      onProgress: ({progress}) => {const step = Math.floor(progress * 10); if (step > last) {last = step; console.log(`${filename}: ${step * 10}%`);}},
    });
    console.log(`Rendered ${filename}`);
  }
}
