import { defineConfig } from 'vite';
import electron from 'vite-plugin-electron';
import renderer from 'vite-plugin-electron-renderer';

export default defineConfig({
  plugins: [
    electron([
      {
        // Main process entry
        entry: 'main.js',
      },
      {
        // Preload scripts
        entry: 'preload.js',
        onstart(options) {
          options.reload();
        },
      },
    ]),
    renderer(),
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      external: ['electron']
    }
  }
});
