// Concatenates data/recipes.js + src/RecipeBook.jsx into a single .jsx file
// that renders as a Claude artifact. Artifacts must be one file; the repo
// keeps them separate. Run after any change to either source.
import fs from 'fs';

const strip = (f) => fs.readFileSync(f, 'utf8')
  .replace(/^\/\/.*$/gm, '')                 // drop header comment lines
  .replace(/^export const /gm, 'const ')
  .replace(/^export function /gm, 'function ')
  .trim();

const data = strip('data/recipes.js') + '\n\n' + strip('data/pantry.js');

const comp = fs.readFileSync('src/RecipeBook.jsx', 'utf8')
  .replace(/^import \{[^}]*\} from "\.\.\/data\/[a-z]+\.js";\n/gm, '');

const [imports, rest] = [
  comp.match(/^import React.*$/m)[0],
  comp.replace(/^import React.*$\n/m, ''),
];

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/recipe-book.jsx', `${imports}\n\n${data}\n\n${rest}`);
console.log('dist/recipe-book.jsx written:', fs.statSync('dist/recipe-book.jsx').size, 'bytes');
