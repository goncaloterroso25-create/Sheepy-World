import { defineConfig } from 'vitest/config';
import type { Connect, Plugin } from 'vite';
import approvedRuntimeMedia from './scripts/approved-runtime-media.mjs';

function blockPrivateReferences(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next): void => {
    let pathname = req.originalUrl ?? '';
    try { pathname = decodeURIComponent(pathname); } catch { /* malformed URLs stay blocked by Vite */ }
    const normalized = pathname.replaceAll('\\', '/').toLowerCase();
    if (['/references/', '/private-assets/', '/raw-assets/'].some((folder) => normalized.includes(folder))) {
      res.statusCode = 404;
      res.end();
      return;
    }
    next();
  };
  return {
    name: 'block-private-references',
    configureServer: (server) => {
      server.middlewares.use(middleware);
    },
    configurePreviewServer: (server) => {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [blockPrivateReferences(), approvedRuntimeMedia()],
  server: {
    watch: {
      ignored: ['**/references/**', '**/private-assets/**', '**/raw-assets/**'],
    },
    fs: {
      deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/references/**', '**/private-assets/**', '**/raw-assets/**'],
    },
  },
  build: {
    sourcemap: false,
    copyPublicDir: false,
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.js'],
  },
});
