import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {ToeicGymIntro, durationInFrames, FPS} from './toeic-gym-intro';

const Root: React.FC = () => <>
  <Composition id="ToeicGymIntro" component={ToeicGymIntro} width={1920} height={1080} fps={FPS} durationInFrames={durationInFrames} />
  <Composition id="ToeicGymIntroVertical" component={ToeicGymIntro} width={1080} height={1920} fps={FPS} durationInFrames={durationInFrames} />
</>;

registerRoot(Root);
