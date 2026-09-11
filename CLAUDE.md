# Instructions for Claude Code

This is a personal recipe site for one person, served by GitHub Pages from the
`main` branch. There is no CI. Whatever is committed is what goes live.

## Standing workflow

These rules apply to any request that changes a file — including one that's
a single short sentence with no other instructions attached. They are not
conditional on being asked for; follow them by default:

If the request is a question or is exploratory and nothing needs changing,
answer it and stop. Don't install, build, commit or push.

1. Always run `npm install` then `npm run build` before committing anything.
   The sandbox starts empty each session; `esbuild` is a devDependency and
   the build fails without installing first.
2. `npm run build` runs the audit first, then regenerates `recipes.md`,
   `dist/recipe-book.jsx` and `dist/app.js`. The audit exits non-zero on
   failure and stops the chain. Never skip the build and never commit around
   a failing audit — find the reported cause and fix it.
3. Always commit **everything** the build changed, including the files in
   `dist/`. GitHub Pages serves `dist/app.js` as-is with no build step of its
   own, so an un-rebuilt `dist/app.js` means the site silently keeps showing
   old content. This is the single most likely way to break this repo.
4. Always push directly to `main`. Never leave work sitting on a branch —
   there is no CI here, so a change that sits on a branch is a change that
   hasn't happened. Only use a branch or open a pull request if explicitly
   asked to.
5. Always finish by running `git log --oneline -1` and reporting the
   resulting commit.

## What to edit

| Change | File |
|---|---|
| Add a recipe, change a quantity, fix a note | `data/recipes.js` |
| Add an ingredient or change what's in stock | `data/pantry.js` |
| Change how the app behaves or looks | `src/RecipeBook.jsx` |
| Change offline/caching behaviour | `tools/sw-template.js` |

Never hand-edit `recipes.md`, `dist/app.js`, `dist/recipe-book.jsx` or `sw.js`
(root). They are generated. Changes to them will be overwritten by the next
build. `sw.js` is stamped from `tools/sw-template.js` with a cache version
derived from `dist/app.js`'s content hash — editing `sw.js` directly both
gets overwritten and breaks that version link.

## Rules the audit enforces

- Every `{token}` in a method resolves to an ingredient in that recipe
- Every ingredient name appears in `INGREDIENT_MAP` in `data/pantry.js`
- A recipe's stated `totalMins` matches where its timeline actually ends
- Anything with `confirmed: false` has an `untestedNote` explaining why
- A recipe cannot be both `fromFrozen` and `needsAhead`
- Every side in `SIDES` has a `prep` note

## Conventions that matter

**One portion means one dinner for one person.** Never write a recipe at two
portions because it seems more natural.

**`confirmed: true` means it has actually been cooked.** Do not flip this
because a recipe looks fine. Only Aiden can confirm it, by having eaten it.

**Frozen or thawed is part of the recipe.** A method written for frozen meat and
one written for thawed meat are different recipes with different timings, not
one recipe with a fallback paragraph in the notes. Use `fromFrozen` or
`needsAhead`, never both.

**Sides never block a meal.** Greens are an accompaniment. Cookability is judged
on the core ingredients only.

**Don't hedge quantities you're guessing at — mark them.** If a timing or an
amount is an estimate rather than something that's been cooked, say so in
`untestedNote` rather than presenting it with the same confidence as a tested one.

## Kitchen constraints every recipe is written around

Gas oven and hob, no oven-safe pans (plastic handles), unmatched lids except one
deep frying pan, no rice — lower-carb by preference. Rich, salty, strong flavours
are the target. See the Kitchen section of the app for the full list.
