// @ts-check
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://lucasmarfaing.pro',
  // Every page is pre-rendered to static HTML (served by nginx).
  // Only routes marked `prerender = false` (the contact API) run on the small Node server.
  output: 'static',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  // Bundle every library into dist/server, so the server only needs dist/ and Node (no npm install there).
  // Build only: the dev server needs the libraries left external.
  vite: process.argv.includes('build') ? { ssr: { noExternal: true } } : {},
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
});
