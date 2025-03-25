// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
  const input: Record<string, string> = {
    game: resolve(__dirname, 'index.html'),
  };

  if (command === 'serve') {
    input.host = resolve(__dirname, 'host.html');
  }

  return {
    server: {
        open: '/host.html',
    },
    build: {
      rollupOptions: {
        input,
      },
    },
  };
});
