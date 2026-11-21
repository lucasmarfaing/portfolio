// Windows Smart App Control can block some native .node binaries ("An Application Control policy has blocked this file").
// sharp (image optimisation) and satteri (Astro's markdown engine) both fall back to a WebAssembly build when it is
// installed, so on Windows we add those builds locally after each install. They are not saved in package.json,
// so Linux/macOS machines and CI are untouched.
import { execSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';

if (process.platform !== 'win32') process.exit(0);

const versionOf = (name) => JSON.parse(readFileSync(`node_modules/${name}/package.json`, 'utf8')).version;

const fallbacks = [
  { base: 'sharp', wasm: '@img/sharp-wasm32' },
  { base: 'satteri', wasm: '@bruits/satteri-wasm32-wasi' },
];

const missing = fallbacks
  .filter(({ base, wasm }) => existsSync(`node_modules/${base}`) && !existsSync(`node_modules/${wasm}`))
  .map(({ base, wasm }) => `${wasm}@${versionOf(base)}`);

if (missing.length > 0) {
  console.log(`[windows] Installing WebAssembly fallbacks: ${missing.join(', ')}`);
  execSync(`npm install --no-save --force --ignore-scripts ${missing.join(' ')}`, { stdio: 'inherit' });
}
