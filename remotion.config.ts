import {Config} from '@remotion/cli/config';

Config.setEntryPoint('./remotion/index.tsx');
Config.setPublicDir('./remotion/public');
Config.setCodec('h264');
Config.setPixelFormat('yuv420p');
Config.setCrf(18);
Config.setOverwriteOutput(true);
