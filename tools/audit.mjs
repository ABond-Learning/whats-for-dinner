// Structural audit of the recipe data. Run before committing any change.
// Checks: unresolved {ingredient} tokens, duplicate ids, ingredients never
// used in a method, step offsets out of order, and stated time vs timeline.
import { DINNERS, COMPONENTS } from '../data/recipes.js';
import { PANTRY, INGREDIENT_MAP, pantryItem, checkRecipe, SIDES } from '../data/pantry.js';
import fs from 'fs';

const all = [...DINNERS, ...COMPONENTS];
const issues = [];

for (const r of all) {
  const ids = r.ingredients.map(i => i.id);
  const dup = ids.filter((x, i) => ids.indexOf(x) !== i);
  if (dup.length) issues.push(`${r.id}: duplicate ingredient ids -> ${[...new Set(dup)].join(', ')}`);

  const toks = [...new Set(r.steps.flatMap(s => [...s.body.matchAll(/\{([a-z]+)\}/g)].map(m => m[1])))];
  const missing = toks.filter(t => !ids.includes(t));
  if (missing.length) issues.push(`${r.id}: unresolved tokens -> ${missing.join(', ')}`);

  const unused = ids.filter(i => !toks.includes(i));
  if (unused.length) issues.push(`${r.id}: ingredient never used in method -> ${unused.join(', ')}`);

  const ats = r.steps.filter(s => s.at !== undefined).map(s => s.at);
  if (ats.length) {
    const last = Math.max(...ats);
    if (last !== r.totalMins) issues.push(`${r.id}: card says ${r.totalMins} min, timeline ends at ${last}`);
    if (!ats.every((v, i, a) => i === 0 || a[i - 1] <= v)) issues.push(`${r.id}: step offsets out of order`);
  }

  if (!r.confirmed && !r.untestedNote) issues.push(`${r.id}: marked untested but gives no reason`);

  // Every ingredient must map to a pantry catalogue item, or the
  // "can I cook this" answer is silently wrong.
  for (const ing of r.ingredients) {
    const mapped = INGREDIENT_MAP[ing.name];
    if (!mapped) issues.push(`${r.id}: "${ing.name}" is not in INGREDIENT_MAP`);
    else if (!pantryItem(mapped)) issues.push(`${r.id}: "${ing.name}" maps to unknown pantry id "${mapped}"`);
  }
  if (!r.subtitle || !r.effort) issues.push(`${r.id}: missing subtitle or effort`);
  if (r.fromFrozen && r.needsAhead) issues.push(`${r.id}: claims both fromFrozen and needsAhead — a recipe is written for one state of the ingredient, not both`);
  if (r.needsAhead && (!r.needsAhead.label || !r.needsAhead.mins)) issues.push(`${r.id}: needsAhead must have a label and mins`);
}

// Catalogue hygiene
const pIds = PANTRY.map(p => p.id);
const dupP = pIds.filter((x,i)=>pIds.indexOf(x)!==i);
if (dupP.length) issues.push(`pantry: duplicate ids -> ${[...new Set(dupP)].join(', ')}`);
const used = new Set(Object.values(INGREDIENT_MAP));
// Sides may exist as alternatives without appearing in any recipe.
const orphan = pIds.filter(id =>
  !used.has(id) && pantryItem(id).defaultState !== 'always' && !SIDES.has(id));
if (orphan.length) issues.push(`pantry: catalogue item never used by any recipe -> ${orphan.join(', ')}`);
for (const id of SIDES)
  if (!pantryItem(id)?.prep) issues.push(`pantry: side "${id}" has no prep note — sides aren't recipes, so the method has to live here`);
for (const [name, id] of Object.entries(INGREDIENT_MAP))
  if (!pIds.includes(id)) issues.push(`pantry: INGREDIENT_MAP "${name}" -> unknown id "${id}"`);

// Build outputs must be self-contained: a surviving import compiles fine
// but fails at runtime, which the parse check does not catch.
for (const f of ['dist/recipe-book.jsx', 'src/RecipeBook.web.jsx']) {
  if (!fs.existsSync(f)) continue;
  const txt = fs.readFileSync(f, 'utf8');
  const stray = [...txt.matchAll(/^import .*data\/[a-z]+\.js.*$/gm)].map(m => m[0].trim());
  if (stray.length) issues.push(`${f}: build output still imports source data -> ${stray.join(' | ')}`);
}

console.log(`${all.length} recipes (${DINNERS.length} dinners, ${COMPONENTS.length} components)`);
if (issues.length) { console.error('\nFAILED:\n' + issues.join('\n')); process.exit(1); }
// With a default pantry, how many recipes are cookable right now?
const cookable = all.filter(r => checkRecipe(r, {}).canCook && !r.needsAhead);
console.log(`pantry: ${PANTRY.length} catalogue items, ${cookable.length}/${all.length} recipes cookable from defaults (sides ignored, thaw-first excluded)`);
const blocked = all.filter(r => !checkRecipe(r, {}).canCook);
for (const r of blocked)
  console.log(`   blocked: ${r.id} -> ${checkRecipe(r, {}).missing.map(i => pantryItem(i).name).join(', ')}`);
console.log('audit clean');
