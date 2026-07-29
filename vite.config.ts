/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { fileURLToPath, URL } from 'node:url';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgr({
      svgrOptions: {
        icon: true,              // width/height = 1em → se cale sur font-size
        // vite-plugin-svgr n'embarque pas @svgr/plugin-svgo, donc svgoConfig
        // serait ignoré. On convertit les couleurs en dur via plugin-jsx :
        replaceAttrValues: {
          black: 'currentColor',
          '#000': 'currentColor',
          '#000000': 'currentColor',
        },
      },
    })],
  resolve: {
    // Force une seule copie de React (sinon framer-motion en tire une 2e →
    // "Invalid hook call / more than one copy of React").
    dedupe: ['react', 'react-dom'],
    // Tier-aware aliases first so they match before the generic '@'.
    alias: [
      { find: '@/atoms', replacement: fileURLToPath(new URL('./src/components/atoms', import.meta.url)) },
      { find: '@/molecules', replacement: fileURLToPath(new URL('./src/components/molecules', import.meta.url)) },
      { find: '@/organisms', replacement: fileURLToPath(new URL('./src/components/organisms', import.meta.url)) },
      { find: '@/icons', replacement: fileURLToPath(new URL('./src/assets/icons', import.meta.url)) },
      { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
    ],
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Co-located tests: src/**/Component.test.tsx
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.{test,spec}.{ts,tsx}', 'src/test/**', 'src/**/index.ts', 'src/vite-env.d.ts'],
    },
  },
});
