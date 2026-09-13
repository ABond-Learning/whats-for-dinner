// Bundles the app into dist/app.js for GitHub Pages, then stamps ./sw.js
// from tools/sw-template.js with a cache version derived from the bundle's
// own content hash — so any deploy that changes the app ships a service
// worker with different bytes, which is what makes the browser notice
// there's an update at all and purge the old cache on activate.
import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

await build({
  entryPoints: ['src/web-entry.jsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  outfile: 'dist/app.js',
  logLevel: 'warning',
});
console.log('dist/app.js written');

const bundle = readFileSync('dist/app.js');
const version = createHash('sha256').update(bundle).digest('hex').slice(0, 10);
const swTemplate = readFileSync('tools/sw-template.js', 'utf8');
writeFileSync('sw.js', swTemplate.replaceAll('__CACHE_VERSION__', version));
console.log(`sw.js written (cache v${version})`);
