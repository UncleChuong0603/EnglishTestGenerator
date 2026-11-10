# TOEIC GYM introduction video

Vietnamese product introduction built with Remotion. The two compositions share a storyboard and adapt their layout to 16:9 and 9:16.

```powershell
npm run video:prepare
npm run video:studio
npm run video:render
npm run video:render:vertical
```

For all seven scene previews in both orientations, run `node remotion/render.mjs --previews`. Contact sheets are saved in `out/storyboard-landscape.png` and `out/storyboard-vertical.png`. Render both formats with one bundle using `node remotion/render.mjs --all`.

Outputs are `out/toeic-gym-intro.mp4`, `out/toeic-gym-intro-vertical.mp4` and `out/toeic-gym-intro.vi.srt`. H.264, 30 fps, 1920×1080 or 1080×1920. `out/` is ignored by Git.

`storyboard.json` controls narration, chapters and scene lengths. Preparation extends each scene when necessary so narration finishes before the next scene. `toeic-gym-intro.tsx` contains frame-based animation; there are no time-based CSS animations or remote render dependencies. Font and image loading use Remotion's render lifecycle.

When editing a scene's narration, delete that scene's cached `public/audio/<id>.mp3` and rerun preparation. Preview again before rendering.

`npm run video:typecheck` checks this standalone toolchain. The web application's `tsconfig.json` excludes the Remotion sources and config so Next.js does not load the video toolchain during its own typecheck. `npm run video:verify` validates both final files, checks dimensions, duration, H.264/AAC and 30 fps, and fully decodes both videos to catch damaged frames or audio.

The asset preparation command downloads Be Vietnam Pro from the Google Fonts repository and generates Vietnamese narration with `vi-VN-HoaiMyNeural` through the existing `node-edge-tts` dependency. These requests send only public marketing narration. Generated assets are kept locally so rendering and subsequent previews work offline. Use `node remotion/prepare-assets.mjs --no-voice` for an explicitly music-only version.

If the Node TTS client is rejected by the service, the optional Python backend can be installed locally and used without changing the app's dependencies:

```powershell
python -m pip install --no-user --target .tmp/video-tts edge-tts==7.3.1
node remotion/prepare-assets.mjs --python-tts
```

The instrumental soundtrack is synthesized by `prepare-assets.mjs` from original notes without third-party music samples. Font license: `public/fonts/OFL.txt`. Brand mark and Milo are copied from this repository's production assets.

Product claims are grounded in `src/lib/marketing/features.ts`, `src/app/page.tsx`, and the weekly-plan/workout policies. The Part 5 example is the homepage's actual sample. The listening excerpt comes from `src/lib/listening-lessons/talks.ts`. Educational examples are labeled; the film contains no invented learner results, score improvements, testimonials or fabricated application screenshots. The public address comes from `src/lib/seo/site-url.ts`.

The video focuses on the documented practice → explanation → review → next practice loop. It does not promise a score, advertise plan quotas, or imply gated mock formats are immediately available.

Rendering reference: [Remotion CLI](https://www.remotion.dev/docs/cli/render).
