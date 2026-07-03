import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import obfuscator from 'rollup-plugin-obfuscator';

const root = resolve(dirname(fileURLToPath(import.meta.url)));
const isProd = (mode) => mode === 'production';
/** Новый id на каждый build → новый хеш у index-*.js (см. settings.js). */
const buildId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

/** Надёжное копирование assets/, lib/settings.json, models/ в dist после сборки. */
function copyStaticDirs() {
  return {
    name: 'copy-static-dirs',
    closeBundle() {
      const out = resolve(root, 'dist');

      if (existsSync(resolve(root, 'assets'))) {
        cpSync(resolve(root, 'assets'), resolve(out, 'assets'), { recursive: true });
      }

      mkdirSync(resolve(out, 'lib'), { recursive: true });
      cpSync(resolve(root, 'lib/settings.json'), resolve(out, 'lib/settings.json'));

      if (existsSync(resolve(root, 'models'))) {
        cpSync(resolve(root, 'models'), resolve(out, 'models'), { recursive: true });
      }

      writeFileSync(resolve(out, 'build-id.txt'), `${buildId}\n`, 'utf8');
    },
  };
}

export default defineConfig(({ mode }) => ({
  base: './',

  define: {
    __BUILD_ID__: JSON.stringify(buildId),
  },

  server: {
    port: 5173,
    open: true,
  },

  preview: {
    port: 4173,
  },

  build: {
    outDir: 'dist',
    assetsDir: '_bundle',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'esbuild',
    target: 'es2020',
    cssMinify: true,
    rollupOptions: {
      output: {
        entryFileNames: '_bundle/[name]-[hash].js',
        chunkFileNames: '_bundle/[name]-[hash].js',
        assetFileNames: '_bundle/[name]-[hash][extname]',
        manualChunks(id) {
          if (id.includes('/lib/index.js') || id.includes('\\lib\\index.js')) {
            return 'vendor';
          }
        },
      },
    },
  },

  plugins: [
    copyStaticDirs(),
    isProd(mode) &&
      obfuscator({
        global: false,
        include: ['src/sctipts/**'],
        exclude: ['lib/**', '**/vendor*.js'],
        options: {
          compact: true,
          controlFlowFlattening: false,
          deadCodeInjection: false,
          debugProtection: false,
          disableConsoleOutput: false,
          identifierNamesGenerator: 'hexadecimal',
          renameGlobals: false,
          selfDefending: false,
          simplify: true,
          // stringArray ломает пути ./assets/... в рантайме
          stringArray: false,
          transformObjectKeys: false,
          unicodeEscapeSequence: false,
        },
      }),
  ].filter(Boolean),
}));
