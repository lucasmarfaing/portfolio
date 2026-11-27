// Windows Smart App Control can block some native .node binaries ("An Application Control policy has blocked this file").
// sharp (image optimisation), satteri (Astro's markdown engine) and Astro's compiler all fall back to a WebAssembly build when it is
// installed, so on Windows we add those builds locally after each install. They are not saved in package.json,
// so Linux/macOS machines and CI are untouched.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

if (process.platform !== 'win32') process.exit(0);

const versionOf = (name) => JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8')).version;

const fallbacks = [
  { base: 'sharp', wasm: '@img/sharp-wasm32' },
  { base: 'satteri', wasm: '@bruits/satteri-wasm32-wasi' },
  { base: '@astrojs/compiler-binding', wasm: '@astrojs/compiler-binding-wasm32-wasi' },
];

const wanted = fallbacks.filter(({ base }) => existsSync(`node_modules/${base}`));

// npm removes unsaved packages on each install, so they are always installed together
if (wanted.some(({ wasm }) => !existsSync(`node_modules/${wasm}`))) {
  const specs = wanted.map(({ base, wasm }) => `${wasm}@${versionOf(base)}`);
  console.log(`[windows] Installing WebAssembly fallbacks: ${specs.join(', ')}`);
  execSync(`npm install --no-save --force --ignore-scripts ${specs.join(' ')}`, { stdio: 'inherit' });
}
