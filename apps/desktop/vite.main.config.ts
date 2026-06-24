import { builtinModules } from 'node:module';

import { defineConfig } from 'vite';

export default defineConfig({
  define: {
    MAIN_WINDOW_VITE_DEV_SERVER_URL: 'undefined',
    MAIN_WINDOW_VITE_NAME: JSON.stringify('main_window'),
  },
  build: {
    outDir: '.vite/build',
    emptyOutDir: true,
    lib: {
      entry: 'src/main/index.ts',
      formats: ['es'],
      fileName: () => 'main.js',
    },
    rollupOptions: {
      external: [
        'electron',
        'electron-squirrel-startup',
        ...builtinModules,
        ...builtinModules.map((moduleName) => `node:${moduleName}`),
      ],
    },
  },
});
