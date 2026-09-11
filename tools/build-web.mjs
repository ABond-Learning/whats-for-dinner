// Bundles the app into dist/app.js for GitHub Pages.
// React and ReactDOM come from the CDN scripts in index.html, so they are
// aliased out rather than bundled. No transpiling happens in the browser.
import { build } from 'esbuild';

await build({
  entryPoints: ['src/web-entry.jsx'],
  bundle: true,
  minify: true,
  format: 'iife',
  target: ['es2020'],
  alias: { react: './src/react-shim.js' },
  outfile: 'dist/app.js',
  logLevel: 'warning',
});
console.log('dist/app.js written');
