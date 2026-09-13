# Development plan

What's being built and in what order. Finished items are deleted from this
file rather than ticked off — `git log` is the record of what shipped, not
this document.

## Now

**Meat state, and what defrosting unlocks.** The biggest constraint on what
can be cooked on a given evening is whether the meat is frozen, and
defrosting in the morning opens up recipes that are otherwise unavailable
all day. The app should surface that while it can still be acted on, not
report it as a blocker at 6pm.

Three parts, in order:

1. Give frozen meat items in `data/pantry.js` a state beyond in/out —
   frozen or thawed, defaulting to frozen. Covers bone-in thighs, boneless
   thighs, and raw king prawns. Switched with one tap in the Pantry tab.
2. Make cookability read it: a `fromFrozen` recipe is cookable in either
   state; a `needsAhead` recipe only once its meat is marked thawed. This
   replaces the current blanket exclusion of `needsAhead` from "Can cook
   now".
3. Prompt forward on the Dinners tab: if marking something thawed would
   unlock recipes, name them. Show this only when it would actually change
   something.

Known weakness: none of this works unless the pantry actually gets tapped
when meat comes out of the freezer. Nothing further should be built on meat
state until that habit has held for a few weeks.

## Next

**Frozen and thawed variants for the four roasts.** `honey-soy`,
`miso-butter`, `gochujang` and `coconut-curry` work from either state and
differ only in timing:

- From frozen: 60 minutes, oil and salt at the 30-minute tip-out — neither
  sticks to frozen skin.
- From thawed: 40–45 minutes, oil and salt at the start.

Implement as a per-recipe `variants` block, each variant carrying its own
complete timings, selected by the meat's pantry state. Never a global
toggle: `gochujang-pan`, `thai-chicken`, `katsu` and `braise` need thawed
meat because the method dices, flattens or browns it, and both prawn dishes
are written from frozen — so six of the ten dinners have exactly one valid
state, and a global toggle would misrepresent that.

The audit must reject a variant with no timings of its own, and must still
reject any recipe claiming both `fromFrozen` and `needsAhead`.

## Later

Nothing agreed yet.

## Decided against

- **Recipe or documentation files in Claude project knowledge** — they go
  stale within days, and the repo can be read live.
- **A global frozen/thawed toggle on all meat dishes** — see the Next
  section above: different dishes need different states, and a single
  toggle can't represent that.
- **Tested/untested flags on recipes** — if something doesn't work, that
  gets said and fixed, rather than tracked as a flag on the recipe.
