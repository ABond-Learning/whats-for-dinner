# Instructions for Claude Code

This is a personal recipe site for one person, served by GitHub Pages from the
`main` branch. There is no CI. Whatever is committed is what goes live.

## Branching

This repo has no CI and GitHub Pages serves directly from `main`, so commit
and push to `main` directly unless explicitly asked for a branch or pull
request. A change that sits on a branch is a change that hasn't happened.

## Before you change anything

```bash
npm install
```

The sandbox starts empty. `esbuild` is a devDependency and the build will fail
without this step. Do it once per session, before anything else.

## After you change anything

```bash
npm run build
```

This runs the audit, then regenerates `recipes.md`, `dist/recipe-book.jsx` and
`dist/app.js`. **The audit exits non-zero on failure and stops the chain.** If it
fails, fix the reported problem — do not skip the build or commit around it.

Then commit **all** changed files, including the ones in `dist/`. GitHub Pages
serves files as-is with no build step, so an un-rebuilt `dist/app.js` means the
site silently keeps showing the old content. This is the single most likely way
to break this repo.

## What to edit

| Change | File |
|---|---|
| Add a recipe, change a quantity, fix a note | `data/recipes.js` |
| Add an ingredient or change what's in stock | `data/pantry.js` |
| Change how the app behaves or looks | `src/RecipeBook.jsx` |

Never hand-edit `recipes.md`, `dist/app.js` or `dist/recipe-book.jsx`. They are
generated. Changes to them will be overwritten by the next build.

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
