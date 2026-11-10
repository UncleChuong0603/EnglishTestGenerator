import React, {type CSSProperties, useEffect, useState} from 'react';
import {AbsoluteFill, Html5Audio, Img, Sequence, cancelRender, continueRender, delayRender, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import storyboard from './storyboard.json';
import assets from './assets.json';
import './styles.css';

export const FPS = storyboard.fps;
export const durationInFrames = storyboard.scenes.reduce((sum, scene) => sum + scene.seconds * FPS, 0);
const C = {night: '#071915', raised: '#0b211b', deep: '#04110e', paper: '#eef9f2', sage: '#a9c0b5', mint: '#7be5bd', rule: '#21463b', warm: '#efb58e'};
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const mono: CSSProperties = {fontVariantNumeric: 'tabular-nums', letterSpacing: 2};

function Reveal({children, delay = 0, style}: {children: React.ReactNode; delay?: number; style?: CSSProperties}) {
  const f = useCurrentFrame();
  const p = spring({frame: f - delay, fps: FPS, config: {damping: 200, stiffness: 110, mass: .9}});
  return <div style={{opacity: p, transform: `translateY(${(1 - p) * 34}px)`, ...style}}>{children}</div>;
}

function Arrow({size = 32}: {size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M6 16h20M17 7l9 9-9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Check({size = 28}: {size?: number}) {
  return <svg width={size} height={size} viewBox="0 0 28 28" fill="none" aria-hidden="true"><path d="m6 14 5 5L22 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Eyebrow({children}: {children: React.ReactNode}) {
  return <div style={{fontSize: 21, fontWeight: 600, letterSpacing: 3, color: C.mint, marginBottom: 27}}>{children}</div>;
}

function Title({children, size = 82}: {children: React.ReactNode; size?: number}) {
  return <div style={{fontSize: size, fontWeight: 700, lineHeight: 1.22, letterSpacing: -3, margin: 0}}>{children}</div>;
}

function Note({children, style}: {children: React.ReactNode; style?: CSSProperties}) {
  return <div style={{fontSize: 27, lineHeight: 1.65, color: C.sage, marginTop: 30, ...style}}>{children}</div>;
}

function Primary({children}: {children: React.ReactNode}) {
  return <div style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, background: C.mint, color: C.deep, padding: '25px 34px', borderRadius: 9, fontSize: 29, fontWeight: 700}}>{children}<Arrow /></div>;
}

function Shell({index, children}: {index: number; children: React.ReactNode}) {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  const scene = storyboard.scenes[index];
  const start = storyboard.scenes.slice(0, index).reduce((n, s) => n + s.seconds * FPS, 0);
  const elapsed = start + f;
  const endOpacity = interpolate(f, [scene.seconds * FPS - 10, scene.seconds * FPS - 1], [1, 0], clamp);
  return <AbsoluteFill style={{backgroundColor: C.night, color: C.paper, fontFamily: 'Be Vietnam Pro, sans-serif'}}>
    <AbsoluteFill style={{opacity: .38, backgroundImage: `linear-gradient(${C.rule} 1px, transparent 1px), linear-gradient(90deg, ${C.rule} 1px, transparent 1px)`, backgroundSize: '96px 96px'}} />
    <AbsoluteFill style={{padding: vertical ? '72px 68px' : '52px 96px'}}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 27, borderBottom: `1px solid ${C.rule}`}}>
        <div style={{display: 'flex', gap: 18, alignItems: 'center', fontSize: 29, fontWeight: 700, letterSpacing: -1}}><Img src={staticFile('brand-mark.png')} style={{width: 48, height: 48, objectFit: 'contain'}} />TOEIC GYM</div>
        <div style={{fontSize: vertical ? 18 : 19, color: C.sage, ...mono}}>YOUR DAILY PRACTICE</div>
      </div>
      <div style={{position: 'absolute', top: vertical ? 235 : 177, left: vertical ? 68 : 96, right: vertical ? 68 : 96, bottom: vertical ? 300 : 205, opacity: endOpacity}}>{children}</div>
      <div style={{position: 'absolute', left: vertical ? 68 : 96, right: vertical ? 68 : 96, bottom: vertical ? 162 : 108, minHeight: vertical ? 95 : 60, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: endOpacity}}>
        <div style={{maxWidth: vertical ? 920 : 1590, textAlign: 'center', fontSize: vertical ? 28 : 25, lineHeight: 1.6, color: C.paper}}>{scene.narration}</div>
      </div>
      <div style={{position: 'absolute', left: vertical ? 68 : 96, right: vertical ? 68 : 96, bottom: vertical ? 63 : 37}}>
        <div style={{display: 'flex', gap: 8, marginBottom: 18}}>{storyboard.scenes.map((s, i) => <div key={s.id} style={{height: 3, flex: 1, background: C.rule}}><div style={{height: '100%', background: C.mint, transformOrigin: 'left', transform: `scaleX(${i < index ? 1 : i === index ? f / (s.seconds * FPS) : 0})`}} /></div>)}</div>
        <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 17, color: C.sage, letterSpacing: 1.5}}><span>toeicgym.net</span><span>{vertical ? `${String(index + 1).padStart(2, '0')} / 07` : scene.chapter}</span><span style={mono}>{String(Math.floor(elapsed / FPS)).padStart(2, '0')} / {String(durationInFrames / FPS).padStart(2, '0')}</span></div>
      </div>
    </AbsoluteFill>
  </AbsoluteFill>;
}

function Split({left, right}: {left: React.ReactNode; right: React.ReactNode}) {
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  return <div style={{display: 'grid', gridTemplateColumns: vertical ? '1fr' : '.94fr 1.06fr', gap: vertical ? 68 : 90, height: '100%', alignItems: 'center'}}><div>{left}</div><div style={{minWidth: 0}}>{right}</div></div>;
}

function PromiseScene() {
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  return <Split left={<><Reveal><Eyebrow>LUYỆN TOEIC CÙNG MILO</Eyebrow></Reveal><Reveal delay={7}><Title size={vertical ? 87 : 96}>Luyện đúng<br />lỗi sai.<br /><span style={{color: C.mint}}>Mỗi ngày biết<br />nên học gì.</span></Title></Reveal><Reveal delay={23}><Note>Một bước luyện tập.<br />Một hướng đi rõ ràng.</Note></Reveal></>} right={<Reveal delay={14} style={{display: 'flex', justifyContent: 'center', position: 'relative'}}><div style={{position: 'absolute', width: vertical ? 510 : 560, height: vertical ? 510 : 560, border: `1px solid ${C.rule}`, borderRadius: '50%', top: 15}} /><Img src={staticFile('milo-coach.webp')} style={{position: 'relative', width: vertical ? 440 : 540, height: vertical ? 460 : 560, objectFit: 'contain'}} /></Reveal>} />;
}

function StartScene() {
  const f = useCurrentFrame();
  const selected = f >= 64;
  const explain = interpolate(f, [96, 112], [0, 1], clamp);
  return <Split left={<><Reveal><Eyebrow>01 / LÀM THỬ MIỄN PHÍ</Eyebrow><Title>Bắt đầu với<br /><span style={{color: C.mint}}>10 câu Part 5.</span></Title></Reveal><Reveal delay={15}><Note>Không cần tài khoản.<br />Có lời giải sau khi nộp.</Note></Reveal></>} right={<Reveal delay={12} style={{background: C.raised, border: `1px solid ${C.rule}`, borderRadius: 14, padding: 44}}><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 18, letterSpacing: 2, color: C.sage, marginBottom: 30}}><span>PART 5 / CÂU MẪU</span><span>GIỚI TỪ</span></div><div style={{fontSize: 37, lineHeight: 1.5, fontWeight: 600}}>Please submit the report <span style={{color: selected ? C.mint : C.paper}}>{selected ? 'by' : '___'}</span> Friday.</div><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginTop: 28}}>{['at', 'by', 'on', 'for'].map((word, i) => <div key={word} style={{padding: '18px 22px', border: `1px solid ${selected && i === 1 ? C.mint : C.rule}`, background: selected && i === 1 ? C.mint : 'transparent', color: selected && i === 1 ? C.deep : C.paper, fontSize: 27, display: 'flex', justifyContent: 'space-between'}}><span><span style={{opacity: .65, marginRight: 18}}>{'ABCD'[i]}</span>{word}</span>{selected && i === 1 ? <Check /> : null}</div>)}</div><div style={{opacity: explain, borderLeft: `3px solid ${C.mint}`, paddingLeft: 23, marginTop: 30, fontSize: 24, lineHeight: 1.6}}><span style={{color: C.mint, fontWeight: 600}}>“By Friday” = hạn chót.</span><br /><span style={{color: C.sage}}>Nộp trước hoặc chậm nhất vào thứ Sáu.</span></div></Reveal>} />;
}

function PathScene() {
  const f = useCurrentFrame();
  return <Split left={<><Reveal><Eyebrow>02 / ĐỊNH HƯỚNG MỖI NGÀY</Eyebrow><Title>Một bài nên học.<br /><span style={{color: C.mint}}>Đúng lúc<br />bạn cần.</span></Title></Reveal><Reveal delay={18}><Note>Kết quả luyện → bài hôm nay<br />→ lộ trình tuần được điều chỉnh.</Note><div style={{marginTop: 28, fontSize: 22, lineHeight: 1.6, color: C.sage}}>Gợi ý cụ thể hơn khi có đủ dữ liệu học tập.</div></Reveal></>} right={<div style={{borderTop: `1px solid ${C.rule}`}}>{[{label: 'TỪ LỊCH SỬ LUYỆN', title: 'Nhận diện phần cần ôn', detail: 'Câu đã làm · lỗi lặp · kết quả theo Part'}, {label: 'HÔM NAY', title: 'Mở ra là có bài nên học', detail: 'Cân bằng trọng tâm, hỗ trợ và duy trì'}, {label: 'MỖI TUẦN', title: 'Sắp lại bước tiếp theo', detail: 'Theo mục tiêu, thời lượng và hoạt động thật'}].map((item, i) => <Reveal key={item.label} delay={20 + i * 22} style={{padding: '28px 0', display: 'flex', gap: 27, borderBottom: `1px solid ${C.rule}`}}><div style={{fontSize: 23, color: f >= 45 + i * 30 ? C.mint : C.sage, paddingTop: 3, ...mono}}>0{i + 1}</div><div><div style={{fontSize: 17, letterSpacing: 2, color: C.mint, marginBottom: 12}}>{item.label}</div><div style={{fontSize: 34, fontWeight: 600, marginBottom: 9}}>{item.title}</div><div style={{fontSize: 22, color: C.sage, lineHeight: 1.6}}>{item.detail}</div></div></Reveal>)}</div>} />;
}

function MistakesScene() {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  const steps = [{title: 'Gom câu sai', sub: 'Lưu lại điều còn vướng'}, {title: 'Hiểu lời giải', sub: 'Nhận ra nguyên nhân'}, {title: 'Luyện lại', sub: 'Củng cố kiến thức'}];
  return <><Reveal><Eyebrow>03 / NGÂN HÀNG LỖI SAI</Eyebrow><Title size={vertical ? 82 : 94}>Mỗi lỗi sai.<br /><span style={{color: C.mint}}>Một cơ hội hiểu sâu hơn.</span></Title></Reveal><div style={{display: 'grid', gridTemplateColumns: vertical ? '1fr' : '1fr 1fr 1fr', gap: vertical ? 20 : 44, marginTop: vertical ? 65 : 74}}>{steps.map((s, i) => <Reveal key={s.title} delay={22 + i * 22} style={{borderTop: `2px solid ${f >= 45 + i * 25 ? C.mint : C.rule}`, paddingTop: 27, paddingBottom: vertical ? 30 : 0}}><div style={{display: 'flex', justifyContent: 'space-between', color: C.mint, alignItems: 'center'}}><span style={{fontSize: 21, ...mono}}>0{i + 1}</span>{i === 2 ? <Check size={34} /> : <Arrow size={34} />}</div><div style={{fontSize: 43, fontWeight: 600, marginTop: 25}}>{s.title}</div><div style={{fontSize: 26, color: C.sage, marginTop: 13}}>{s.sub}</div></Reveal>)}</div><Reveal delay={95}><Note style={{marginTop: 45}}>Ôn đúng câu đã sai. Nhìn ra lỗi lặp. Luyện đến khi vững hơn.</Note></Reveal></>;
}

function ListeningScene() {
  const f = useCurrentFrame();
  const words = ['Last spring,', 'I started taking', 'a short walk', 'before work.'];
  const active = Math.floor(interpolate(f, [35, 165], [0, 4], clamp));
  return <Split left={<><Reveal><Eyebrow>04 / NGHE THEO TRANSCRIPT</Eyebrow><Title>Nghe rõ hơn.<br /><span style={{color: C.mint}}>Hiểu từng câu.</span></Title></Reveal><Reveal delay={18}><Note>Theo dõi transcript.<br />Ẩn lời để tự nghe.<br />Chọn tốc độ phù hợp.</Note></Reveal><Reveal delay={35}><div style={{display: 'flex', gap: 24, color: C.mint, fontSize: 25, marginTop: 30}}>{['1', '3', '5', '10'].map(n => <span key={n} style={{borderBottom: `1px solid ${C.rule}`, paddingBottom: 10}}>{n} phút</span>)}</div></Reveal></>} right={<Reveal delay={12} style={{padding: '40px 0', borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}`}}><div style={{fontSize: 17, color: C.sage, letterSpacing: 2}}>TRÍCH TRANSCRIPT TỪ THƯ VIỆN</div><div style={{fontSize: 27, fontWeight: 600, marginTop: 22, color: C.mint}}>A Walk That Taught Me to Listen</div><div style={{display: 'flex', alignItems: 'center', gap: 6, height: 95, marginTop: 28}}>{Array.from({length: 53}, (_, i) => <div key={i} style={{width: 7, borderRadius: 4, height: 12 + (Math.sin(i * 1.9) + 1) * 24 + Math.sin(f / 9 + i / 3) * 9, background: i < (f - 15) / 3 ? C.mint : C.rule}} />)}</div><div style={{fontSize: 39, lineHeight: 1.8, marginTop: 22}}>{words.map((w, i) => <React.Fragment key={w}><span style={{color: active === i ? C.deep : active > i ? C.paper : C.sage, background: active === i ? C.mint : 'transparent', padding: '4px 6px', borderRadius: 4}}>{w}</span>{' '}</React.Fragment>)}</div><div style={{marginTop: 30, color: C.sage, fontSize: 22, lineHeight: 1.6}}>Mùa xuân năm ngoái, tôi bắt đầu đi bộ một chút trước giờ làm.</div></Reveal>} />;
}

function PracticeScene() {
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  return <><Reveal><Eyebrow>05 / LUYỆN TẬP & CỦNG CỐ</Eyebrow><Title size={vertical ? 80 : 91}>Đủ 7 Part.<br /><span style={{color: C.mint}}>Chọn đúng phần cần tập.</span></Title></Reveal><div style={{display: 'flex', gap: 18, marginTop: 53}}>{[1, 2, 3, 4, 5, 6, 7].map((n, i) => <Reveal key={n} delay={18 + i * 6} style={{flex: 1, border: `1px solid ${C.rule}`, background: C.raised, padding: vertical ? '22px 0' : '25px 20px', textAlign: 'center'}}><div style={{fontSize: 16, color: C.sage, letterSpacing: 2}}>PART</div><div style={{fontSize: vertical ? 48 : 64, fontWeight: 600, color: C.mint, marginTop: 6}}>{n}</div></Reveal>)}</div><Reveal delay={66}><div style={{display: 'flex', justifyContent: 'space-between', marginTop: 18, color: C.sage, fontSize: 19, letterSpacing: 2}}><span>01—04 / LISTENING</span><span>05—07 / READING</span></div></Reveal><div style={{display: 'grid', gridTemplateColumns: vertical ? '1fr' : '1fr 1fr', gap: 34, marginTop: vertical ? 65 : 42}}>{[{label: 'TỪ VỰNG & FLASHCARDS', text: 'Học từ trong ngữ cảnh'}, {label: 'NGỮ PHÁP TOEIC', text: 'Hiểu cách dùng. Áp dụng ngay.'}].map((item, i) => <Reveal key={item.label} delay={80 + i * 16} style={{borderTop: `1px solid ${C.rule}`, paddingTop: 23}}><div style={{fontSize: 17, letterSpacing: 2, color: C.mint}}>{item.label}</div><div style={{fontSize: 30, fontWeight: 600, marginTop: 13}}>{item.text}</div></Reveal>)}</div></>;
}

function CtaScene() {
  const {width, height} = useVideoConfig();
  const vertical = height > width;
  return <Split left={<><Reveal><Eyebrow>BẮT ĐẦU NHỎ. HỌC CÓ HƯỚNG.</Eyebrow><Title size={vertical ? 91 : 103}>Bắt đầu bằng<br /><span style={{color: C.mint}}>10 câu.</span></Title></Reveal><Reveal delay={16}><Note style={{fontSize: 31}}>TOEIC GYM lo bước tiếp theo.</Note></Reveal><Reveal delay={30} style={{marginTop: 42}}><Primary>Làm thử miễn phí</Primary><div style={{fontSize: 24, color: C.sage, marginTop: 23}}>Không cần tài khoản để bắt đầu.</div></Reveal><Reveal delay={44}><div style={{fontSize: 37, color: C.mint, fontWeight: 600, marginTop: 31}}>toeicgym.net</div></Reveal></>} right={<Reveal delay={13} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}><Img src={staticFile('milo-coach.webp')} style={{width: vertical ? 390 : 530, height: vertical ? 410 : 550, objectFit: 'contain'}} /><div style={{fontSize: 18, letterSpacing: 3, color: C.sage, marginTop: 15}}>MILO / NGƯỜI BẠN ĐỒNG HÀNH</div></Reveal>} />;
}

const scenes = [PromiseScene, StartScene, PathScene, MistakesScene, ListeningScene, PracticeScene, CtaScene];

export const ToeicGymIntro: React.FC = () => {
  const [fontHandle] = useState(() => delayRender('Loading local Vietnamese fonts'));
  useEffect(() => {
    Promise.all([
      {weight: '400', file: 'Regular'},
      {weight: '600', file: 'SemiBold'},
      {weight: '700', file: 'Bold'},
    ].map(async ({weight, file}) => {
      const font = new FontFace('Be Vietnam Pro', `url("${staticFile(`fonts/BeVietnamPro-${file}.ttf`)}")`, {weight});
      await font.load();
      document.fonts.add(font);
    }))
      .then(() => continueRender(fontHandle))
      .catch(cancelRender);
  }, [fontHandle]);
  return <AbsoluteFill style={{background: C.night}}>
    <Html5Audio src={staticFile('audio/bed.wav')} volume={f => interpolate(f, [0, 30, durationInFrames - 55, durationInFrames - 1], [0, assets.voiceover ? .19 : .45, assets.voiceover ? .19 : .45, 0], clamp)} />
    {storyboard.scenes.map((scene, index) => {
      const from = storyboard.scenes.slice(0, index).reduce((sum, item) => sum + item.seconds * FPS, 0);
      const Component = scenes[index];
      return <Sequence key={scene.id} from={from} durationInFrames={scene.seconds * FPS} name={scene.chapter}>
        <Shell index={index}><Component /></Shell>
        {assets.voiceover ? <Sequence from={12}><Html5Audio src={staticFile(`audio/${scene.id}.mp3`)} volume={.95} /></Sequence> : null}
      </Sequence>;
    })}
  </AbsoluteFill>;
};
