import { join } from 'node:path';

import type { ForgeConfig } from '@electron-forge/shared-types';
import { VitePlugin } from '@electron-forge/plugin-vite';

const projectDir = import.meta.dirname;

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
  },
  rebuildConfig: {},
  makers: [],
  plugins: [
    new VitePlugin({
      build: [
        {
          entry: join(projectDir, 'src/main/index.ts'),
          config: join(projectDir, 'vite.main.config.ts'),
          target: 'main',
        },
        {
          entry: join(projectDir, 'src/preload/index.ts'),
          config: join(projectDir, 'vite.preload.config.ts'),
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: join(projectDir, 'vite.renderer.config.ts'),
        },
      ],
    }),
  ],
};

export default config;
