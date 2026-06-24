import { join } from 'node:path';

import type { ForgeConfig } from '@electron-forge/shared-types';
import { VitePlugin } from '@electron-forge/plugin-vite';

const projectDir = import.meta.dirname;
const appBundleId = 'com.sarushili0430.slack-reply-board';
const entitlementsPath = join(projectDir, 'build/entitlements.mac.plist');
const signingIdentity = process.env.APPLE_SIGNING_IDENTITY;
const appleId = process.env.APPLE_ID;
const appleIdPassword = process.env.APPLE_ID_PASSWORD;
const teamId = process.env.APPLE_TEAM_ID;

const osxSign =
  signingIdentity === undefined || signingIdentity.length === 0
    ? undefined
    : {
        identity: signingIdentity,
        hardenedRuntime: true,
        entitlements: entitlementsPath,
      };

const osxNotarize =
  appleId === undefined ||
  appleId.length === 0 ||
  appleIdPassword === undefined ||
  appleIdPassword.length === 0 ||
  teamId === undefined ||
  teamId.length === 0
    ? undefined
    : {
        appleId,
        appleIdPassword,
        teamId,
      };

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'SlackReplyBoard',
    appBundleId,
    ...(osxSign === undefined ? {} : { osxSign }),
    ...(osxNotarize === undefined ? {} : { osxNotarize }),
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
