# What's for dinner

A personal recipe book. Eleven recipes that work on a gas hob with unmatched
lids, one portion each, with portion scaling, a clock-time generator and a
step-at-a-time cook mode.

## Layout

```
data/recipes.js          Recipes. Single source of truth.
data/pantry.js           Ingredient catalogue + what you have in.
src/RecipeBook.jsx       The app. Imports the data, contains no recipes.
src/web-entry.jsx        Mounts the app in the browser. React is bundled.
tools/audit.mjs          Structural checks. Run before every commit.
tools/generate-markdown.mjs   Rebuilds recipes.md from the data.
tools/build-artifact.mjs      Rebuilds the single-file Claude artifact.
tools/build-web.mjs      Bundles dist/app.js and stamps sw.js from sw-template.js.
tools/sw-template.js     Service worker source. Edit this, not sw.js.
dist/recipe-book.jsx     Generated. Paste into Claude to render as an artifact.
dist/app.js              Generated. The built site bundle. Committed on purpose.
recipes.md               Generated. Plain-text copy. Never hand-edit.
index.html               GitHub Pages entry point.
manifest.json            Web app manifest — name, icon, standalone display.
icon.svg                 App icon, referenced by manifest.json and index.html.
sw.js                    Generated. Service worker. Never hand-edit — see tools/sw-template.js.
```

## Changing anything

Every recipe lives in `data/recipes.js`. Nothing else contains recipe content.

```bash
node tools/audit.mjs && node tools/generate-markdown.mjs && node tools/build-artifact.mjs
```

The audit exits non-zero on failure, so the chain stops before regenerating
anything from broken data.

## What the audit checks

- Every `{token}` in a method resolves to an ingredient in that recipe
- No duplicate ingredient ids
- No ingredient listed but never used in the method
- Step offsets ascend
- The stated total time matches where the timeline actually ends

## The pantry

`data/pantry.js` holds every distinct ingredient a recipe can call for, and
`INGREDIENT_MAP` connects recipe ingredient names to catalogue items. The audit
fails if a recipe uses an ingredient that isn't mapped, so "can I cook this?"
can never be silently wrong.

The design assumption is that **you will not maintain this**, so `defaultState`
does the work:

| State | Meaning | Applies to |
|---|---|---|
| `have` | Assume present until you say otherwise | Cupboard, freezer, fridge condiments |
| `out` | Assume gone until you say you've bought it | Fresh greens, chorizo, lemons |
| `always` | Never missing, never on a shopping list | Water, salt, pepper |

So an untouched pantry says two recipes are cookable, because nine of eleven
need fresh greens. Mark the fresh things in after a shop and it's eleven. That
asymmetry is deliberate: it fails towards telling you to check, not towards
telling you you can cook something you can't.

`OPTIONAL` lists ingredients whose absence doesn't block a recipe — they show
as a note rather than a missing item.

### Sides are not requirements

`SIDES` holds accompaniments: tenderstem, pak choi, cauliflower rice. These
recipes were written with greens, but the dish is the dish — a missing side
must never make a recipe read as uncookable, or the pantry would tell you that
you can't cook chicken because you're out of broccoli.

So cookability is judged on core ingredients only. Missing sides show as a soft
note suggesting what else is in, or nothing. In the ingredients tab they sit
under a separate "To serve — swap or skip" heading.

One exception, handled in `checkRecipe`: if a recipe consists of nothing *but*
sides — the greens method — then the sides are the dish and they do count.

Adding a new side is one line in `PANTRY` plus adding its id to `SIDES`. It
doesn't need to appear in any recipe; the audit exempts sides from the
unused-item check precisely so alternatives can exist.

### Adding an ingredient

1. Add it to `PANTRY` with a category and a `defaultState`.
2. Add its exact recipe name to `INGREDIENT_MAP`.
3. Run the audit. It fails if you did only one of the two.

## Recipe fields

| Field | Meaning |
|---|---|
| `servingsBase` | Always 1. One portion is one dinner for one person. |
| `at` | Minutes from the start of cooking. Negative for prep before. |
| `warn` | Marks a step where something burns, catches or overcooks. |
| `fromFrozen` | The method is written for frozen meat and works as-is. |
| `needsAhead` | `{ label, mins }`. The method needs thawed meat and cannot start without it. |
| `scale: false` | Quantity is genuinely portion-independent (oil depth, "per thigh"). |
| `roundUp` | Scales, then rounds up to a whole unit. Eggs. |

`scale: false` is the field most likely to be wrong. Use it only when the unit
already encodes the scaling. Water, lemons and aromatics all scale.

## Frozen or thawed is part of the recipe

A recipe is written for one state of the ingredient. Roasting bone-in thighs
from frozen is a different method from browning diced thigh — different timings,
different results — so they are different recipes, not one recipe with a
fallback paragraph.

`fromFrozen` and `needsAhead` are mutually exclusive and the audit enforces it.
"Can cook now" hides anything with `needsAhead`, because you can't.

If you want a from-frozen version of a thaw-first recipe, write it as its own
entry with its own timings. Don't bolt an alternative onto the notes.

## Known limitations

- `dist/app.js` is a build output that is committed to the repo, which is
  normally bad practice. It's deliberate: GitHub Pages serves files as-is with
  no build step, so the bundle has to be in the repo. Run `npm run build` and
  commit the result after any change to `data/` or `src/`.
- Portion preferences persist per browser. They do not sync between devices.
- `roast-method` in Components is the same technique the three roast dinners
  spell out in full. It's a reference, not a meal. If it stops earning its
  place, delete it — nothing depends on it.
- The three roast dinners each repeat the base roast method. Change one and you
  must change all three; the audit will not catch a mismatch.
- The pantry is binary: in or out. It doesn't know quantities, so it can't tell
  you that you have 50g of chorizo when the recipe wants 75g.
- Method steps still name greens directly. If you serve something else, the
  timings for that step won't match. The cookability logic knows sides are
  swappable; the prose doesn't.
- Pantry state is per browser and doesn't sync between devices.
