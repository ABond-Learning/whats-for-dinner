import React, { useState, useEffect, useMemo, useRef } from "react";

/* ------------------------------------------------------------------ */
/* Shared ingredient blocks                                            */
/* ------------------------------------------------------------------ */

const GREENS = [
  { id: "ts", name: "tenderstem broccoli", qty: 150, unit: "g" },
  { id: "pc", name: "pak choi", qty: 2, unit: "" },
];

const ROAST_BASE = [
  { id: "thigh", name: "bone-in, skin-on chicken thighs", qty: 2, unit: "" },
  { id: "oil", name: "olive oil", qty: 2, unit: "tsp" },
  { id: "salt", name: "flaky salt", qty: 1, unit: "generous pinch per thigh", scale: false },
];

/* ------------------------------------------------------------------ */
/* Dinners — complete meals                                            */
/* ------------------------------------------------------------------ */

const DINNERS = [
  {
    id: "honey-soy",
    name: "Honey and soy roast thighs",
    subtitle: "The first thing you cooked. Sticky, salty, sweet, with greens.",
    protein: "Chicken",
    totalMins: 60,
    effort: "Low",
    fromFrozen: true,
    servingsBase: 1,
    ingredients: [
      ...ROAST_BASE,
      { id: "soy", name: "soy sauce", qty: 3, unit: "tbsp" },
      { id: "honey", name: "honey", qty: 2, unit: "tbsp" },
      { id: "vin", name: "rice vinegar", qty: 1, unit: "tbsp" },
      { id: "garlic", name: "frozen chopped garlic", qty: 2, unit: "tsp" },
      { id: "ginger", name: "frozen chopped ginger", qty: 1, unit: "tbsp" },
      ...GREENS,
      { id: "water", name: "water, for the greens", qty: 2, unit: "tbsp" },
    ],
    steps: [
      { at: -15, title: "Oven on", body: "Gas Mark 6, a full 15 minutes — gas ovens under-read early. Separate {thigh}; cold water over the block for a minute if they're stuck." },
      { at: 0, title: "Chicken in, bare", body: "{thigh} into the tin dry and bare, skin-side up, spaced apart, upper-middle shelf. No oil, no salt yet — neither sticks to frozen skin.", timer: 30 },
      { at: 10, title: "Prep the greens", body: "Trim 1–2cm off the ends of {ts}; leave the stems whole. Halve {pc} lengthways and rinse the cut faces hard — grit collects at the base." },
      { at: 30, title: "Tip the water out", warn: true, body: "Chicken out. Tip all the water out of the tin — frozen chicken sheds a lot and it poaches the underside. Rub the skin with {oil} and {salt}. Turn the tin round, back in, up to Gas Mark 7.", timer: 10 },
      { at: 40, title: "Down to Gas 6, make the glaze", body: "Simmer {soy}, {honey}, {vin}, {garlic}, {ginger} and a grind of pepper for 5–6 minutes until it coats a spoon. Keep it moving so the honey doesn't catch.", timer: 6 },
      { at: 45, title: "Half the glaze on", warn: true, body: "Brush thinly. Back in for the last 10 minutes. Never roast with this on from the start — it'll be black before the chicken is done.", timer: 10 },
      { at: 50, title: "Second coat, greens on", body: "Rest of the glaze on the chicken. {ts} in a pan with {water}, lid on, 4 minutes. {pc} cut-side down for the last 2. Drain hard." },
      { at: 55, title: "Chicken out", body: "75°C at the thickest part away from the bone, or juices completely clear. Pink at the bone means 5 more minutes and check again." },
      { at: 60, title: "Rest and plate", body: "5 minutes' rest. Greens down, chicken on top, tin juices spooned over.", timer: 5 },
    ],
    notes: [
      "From thawed, drop about 20 minutes: 40–45 total, and oil and salt at the start instead of at 0:30.",
      "Make the glaze near the end. It stiffens as it cools and you'd have to loosen it with water.",
    ],
  },
  {
    id: "miso-butter",
    name: "Miso butter roast thighs",
    subtitle: "Richer than the honey version. The same butter seasons the greens.",
    protein: "Chicken",
    totalMins: 60,
    effort: "Low",
    fromFrozen: true,
    servingsBase: 1,
    ingredients: [
      ...ROAST_BASE,
      { id: "butter", name: "butter, softened", qty: 30, unit: "g" },
      { id: "miso", name: "barley miso", qty: 1, unit: "tbsp" },
      { id: "ginger", name: "frozen chopped ginger", qty: 2, unit: "tsp" },
      { id: "garlic", name: "frozen chopped garlic", qty: 1, unit: "tsp" },
      ...GREENS,
      { id: "pep", name: "frozen chopped peppers", qty: 60, unit: "g" },
      { id: "poil", name: "olive oil, for the greens", qty: 1, unit: "tbsp" },
      { id: "water", name: "water, for the greens", qty: 75, unit: "ml" },
      { id: "rv", name: "rice vinegar", qty: 1, unit: "tsp" },
    ],
    steps: [
      { at: -15, title: "Oven on, butter out", body: "Gas Mark 6, full 15 minutes. Separate {thigh}. Get {butter} out to soften and tip {ginger} and {garlic} into a saucer to thaw." },
      { at: 0, title: "Chicken in, bare", body: "{thigh} into the tin dry and bare, skin-side up, spaced, upper-middle shelf. No oil, no salt yet.", timer: 30 },
      { at: 5, title: "Mash the miso butter", body: "{butter}, {miso}, {ginger}, {garlic} and a grind of pepper, mashed with a fork until evenly streaked. Leave at room temperature — it has to be spreadable at 0:45." },
      { at: 15, title: "Prep the greens", body: "Trim {ts}. Halve {pc} lengthways and rinse the cut faces hard." },
      { at: 30, title: "Tip the water out", warn: true, body: "Chicken out. Tip all the water out of the tin. Rub the skin with {oil} and {salt}. Turn the tin round, back in, up to Gas Mark 7.", timer: 10 },
      { at: 40, title: "Down to Gas Mark 5", body: "Not 6. Miso catches faster than a honey glaze, and the crisping is already done." },
      { at: 45, title: "Half the butter on", warn: true, body: "Spread thinly with the back of a spoon. Back in for the last 10 minutes. Don't open the door again until 0:55.", timer: 10 },
      { at: 47, title: "Greens", body: "{pep} into a hot dry pan, 3 minutes until the water's hissed off. {poil} and {ts}, 2 minutes. {water} in, lid on, 3 minutes. {pc} cut-side down, lid on, 2 minutes." },
      { at: 55, title: "Chicken out", body: "75°C at the thickest part away from the bone, or juices completely clear." },
      { at: 57, title: "Finish the greens", body: "Lid off, reduce until the liquid is glossy and just coats the stems — watch the pan, not the clock. Off the heat, stir in half the remaining butter, taste, then add the rest only if it needs it. Then {rv}." },
      { at: 60, title: "Plate", body: "Greens in a bowl, chicken on top so the skin stays out of the liquid." },
    ],
    notes: [
      "No soy anywhere in this. The miso carries all the salt.",
      "If the butter melts to liquid while it waits, fridge for 15 minutes and stir it back together. Melted butter won't hold the miso and runs off the skin.",
      "The vinegar goes in off the heat at the very end — it cuts the fat, and boiling it off wastes it.",
    ],
  },
  {
    id: "gochujang",
    name: "Gochujang roast thighs",
    subtitle: "Same method, Korean chilli paste instead of miso.",
    protein: "Chicken",
    totalMins: 60,
    effort: "Low",
    fromFrozen: true,
    servingsBase: 1,
    ingredients: [
      ...ROAST_BASE,
      { id: "gochu", name: "gochujang paste", qty: 2, unit: "tbsp" },
      { id: "soy", name: "soy sauce", qty: 1, unit: "tbsp" },
      { id: "garlic", name: "frozen chopped garlic", qty: 1, unit: "tsp" },
      { id: "fish", name: "fish sauce", qty: 0.5, unit: "tsp" },
      ...GREENS,
      { id: "water", name: "water, for the greens", qty: 2, unit: "tbsp" },
    ],
    steps: [
      { at: -15, title: "Oven on", body: "Gas Mark 6, full 15 minutes. Separate {thigh}." },
      { at: 0, title: "Chicken in, bare", body: "Dry and bare, skin-side up, spaced, upper-middle shelf.", timer: 30 },
      { at: 5, title: "Mix the glaze", body: "{gochu}, {soy}, {garlic} and {fish}. No cooking needed." },
      { at: 15, title: "Prep the greens", body: "Trim {ts}. Halve {pc} lengthways and rinse the cut faces hard." },
      { at: 30, title: "Tip the water out", warn: true, body: "Chicken out. Tip all the water out. Rub with {oil} and {salt}. Turn the tin, back in, up to Gas Mark 7.", timer: 10 },
      { at: 40, title: "Down to Gas Mark 5", body: "Shop gochujang lists glucose syrup first, so it burns like a sugar glaze." },
      { at: 45, title: "Glaze on", warn: true, body: "Thin coat. Last 10 minutes only.", timer: 10 },
      { at: 50, title: "Greens", body: "{ts} with {water}, lid on, 4 minutes. {pc} for the last 2." },
      { at: 55, title: "Chicken out", body: "75°C at the thickest part away from the bone." },
      { at: 60, title: "Rest and plate", body: "5 minutes' rest, then greens down, chicken on top.", timer: 5 },
    ],
    notes: [
      "Don't add honey — the paste is already sweet.",
      "The tube's own version uses 4 tbsp paste and 3 tbsp soy for two. Cut down here because it read salty on the label.",
      "Gochujang keeps three weeks in the fridge once opened. Shorter than most pastes.",
      "The paste and soy amounts are an estimate rather than a tested balance — taste the glaze before committing to the full quantity.",
    ],
  },
  {
    id: "coconut-curry",
    name: "Coconut Japanese curry",
    subtitle: "Roast thighs, no glaze, with Golden Curry sauce and greens as the base.",
    protein: "Chicken",
    totalMins: 60,
    effort: "Medium",
    fromFrozen: true,
    servingsBase: 1,
    ingredients: [
      ...ROAST_BASE,
      { id: "pep", name: "frozen chopped peppers", qty: 60, unit: "g" },
      { id: "coil", name: "olive oil, for the sauce", qty: 1, unit: "tbsp" },
      { id: "garlic", name: "frozen chopped garlic", qty: 1, unit: "tsp" },
      { id: "ginger", name: "frozen chopped ginger", qty: 2, unit: "tsp" },
      { id: "water", name: "water, for the sauce", qty: 175, unit: "ml" },
      { id: "roux", name: "Golden Curry roux", qty: 18, unit: "g" },
      { id: "coco", name: "creamed coconut, chopped small", qty: 15, unit: "g" },
      { id: "sult", name: "sultanas (optional)", qty: 1, unit: "tbsp" },
      ...GREENS,
    ],
    steps: [
      { at: -15, title: "Oven on", body: "Gas Mark 6, full 15 minutes. Separate {thigh}." },
      { at: 0, title: "Chicken in, bare", body: "Dry and bare, skin-side up, spaced, upper-middle shelf. No glaze on this one at any point.", timer: 30 },
      { at: 15, title: "Prep the greens", body: "Trim {ts}. Halve {pc} lengthways and rinse the cut faces hard." },
      { at: 30, title: "Tip the water out", warn: true, body: "Chicken out. Tip all the water out. Rub with {oil} and {salt}. Turn the tin, back in, up to Gas Mark 7.", timer: 10 },
      { at: 40, title: "Down to Gas 6, start the sauce", body: "{pep} into a hot dry pan, 3 minutes until the hissing stops. Then {coil}, 2 minutes. {garlic} and {ginger}, 30 seconds.", timer: 5 },
      { at: 45, title: "Water and roux", warn: true, body: "{water} in, bring to a simmer. Take the pan off the heat, break in {roux}, stir until completely dissolved. Lumps won't come out later." },
      { at: 47, title: "Coconut", body: "Back on low. {coco} and {sult} in. 5 minutes, stirring — it thickens fast and will catch.", timer: 5 },
      { at: 50, title: "Greens into the sauce", body: "{ts} in, lid on, 4 minutes. {pc} in, lid on, 2 minutes. They pick up the sauce this way." },
      { at: 55, title: "Chicken out", body: "75°C at the thickest part away from the bone." },
      { at: 60, title: "Plate", body: "Sauce and greens in a bowl, chicken on top so the skin stays out of the liquid." },
    ],
    notes: [
      "No glaze and no soy. The roux is heavily salted and soy on top makes it inedible.",
      "No chilli — the roux is already medium hot. No cornflour — it thickens itself.",
      "Box ratio is 92g to 720ml for 5 servings, so one portion is 18g to about 145ml. 175ml here because there's no rice and you want enough sauce.",
      "Don't braise bone-in thighs in the roux. It catches on the bottom and you can't judge doneness in an opaque sauce.",
      "The sauce quantities are a starting point rather than a tested balance — taste before deciding it needs more roux or coconut.",
    ],
  },
  {
    id: "gochujang-pan",
    name: "Gochujang chicken",
    subtitle: "Boneless thighs, browned then braised in their own sauce. Thirty minutes.",
    protein: "Chicken",
    totalMins: 30,
    effort: "Medium",
    needsAhead: { label: "Thaw the thighs — about an hour in cold water, or overnight in the fridge", mins: 60 },
    servingsBase: 1,
    ingredients: [
      { id: "thigh", name: "boneless, skinless chicken thighs", qty: 2, unit: "" },
      { id: "oil", name: "sunflower oil", qty: 1, unit: "tbsp" },
      { id: "onion", name: "frozen diced onions", qty: 100, unit: "g" },
      { id: "garlic", name: "frozen chopped garlic", qty: 1, unit: "tsp" },
      { id: "ginger", name: "frozen chopped ginger", qty: 2, unit: "tsp" },
      { id: "gochu", name: "gochujang paste", qty: 1.5, unit: "tbsp" },
      { id: "soy", name: "soy sauce", qty: 2, unit: "tsp" },
      { id: "vin", name: "rice vinegar", qty: 1, unit: "tsp" },
      { id: "water", name: "water", qty: 150, unit: "ml" },
      { id: "butter", name: "butter", qty: 10, unit: "g" },
      { id: "sesame", name: "toasted sesame oil (optional)", qty: 1, unit: "tsp" },
      ...GREENS,
    ],
    steps: [
      { at: 0, title: "Brown the thighs", body: "Pat {thigh} dry and salt lightly. {oil} in the deep pan, medium-high. Thighs in flat, 4 minutes undisturbed until properly browned. Turn, 2 minutes. Out onto a plate — they won't be cooked through yet, and shouldn't be.", timer: 6 },
      { at: 6, title: "Onions", body: "{onion} into the same pan, 5 minutes until soft and the water's gone.", timer: 5 },
      { at: 11, title: "Aromatics", body: "{garlic} and {ginger}. 30 seconds." },
      { at: 12, title: "Paste off the heat", warn: true, body: "Take the pan off the heat. {gochu} in, stir 20 seconds in the residual heat. It's glucose-syrup-first, so on a hot pan it catches and goes bitter — the same failure as the paprika in the braise." },
      { at: 13, title: "Liquid", body: "{water}, {soy} and {vin} in. Back on the heat, scrape the base, bring to a simmer." },
      { at: 14, title: "Braise", body: "Thighs back in with any juices from the plate. Lid on, low, 12 minutes, turning once. {ts} and {pc} in alongside for the last 6 if you're having them.", timer: 12 },
      { at: 26, title: "Check and reduce", body: "Thighs out. 75°C at the thickest part, or cut it and look for no pink. Boil the sauce hard 2–3 minutes until it coats a spoon.", timer: 3 },
      { at: 29, title: "Finish", body: "Off the heat. {butter} in, swirl until glossy. {sesame} now. Taste — it shouldn't need more soy." },
      { at: 30, title: "Plate", body: "Slice the thighs thickly and put them back into the sauce." },
    ],
    notes: [
      "Boneless thighs have no bone to buffer them and no skin to protect them, so they can't take the 60-minute roast the other gochujang recipe uses. Browning then braising is what keeps them from drying out.",
      "Don't add honey. Shop gochujang lists glucose syrup before the miso paste.",
      "Gochujang keeps three weeks in the fridge once opened.",
    ],
  },
  {
    id: "thai-chicken",
    name: "Thai red curry with chicken",
    subtitle: "Boneless thighs in coconut and red curry paste. Thirty minutes, one pan.",
    protein: "Chicken",
    totalMins: 30,
    effort: "Low",
    needsAhead: { label: "Thaw the thighs — about an hour in cold water, or overnight in the fridge", mins: 60 },
    servingsBase: 1,
    ingredients: [
      { id: "thigh", name: "boneless, skinless chicken thighs", qty: 2, unit: "" },
      { id: "oil", name: "sunflower oil", qty: 1, unit: "tbsp" },
      { id: "onion", name: "frozen diced onions", qty: 100, unit: "g" },
      { id: "garlic", name: "frozen chopped garlic", qty: 1, unit: "tsp" },
      { id: "ginger", name: "frozen chopped ginger", qty: 2, unit: "tsp" },
      { id: "paste", name: "Thai red curry paste", qty: 1.5, unit: "tbsp" },
      { id: "coco", name: "coconut milk", qty: 200, unit: "ml" },
      { id: "water", name: "water", qty: 100, unit: "ml" },
      { id: "fish", name: "fish sauce", qty: 1, unit: "tbsp" },
      { id: "honey", name: "honey", qty: 1, unit: "tsp" },
      { id: "lem", name: "lemon", qty: 0.5, unit: "" },
      { id: "spin", name: "frozen spinach (optional)", qty: 60, unit: "g" },
      ...GREENS,
    ],
    steps: [
      { at: 0, title: "Dice and brown", body: "Cut {thigh} into rough 3cm pieces — they shrink, so don't go smaller. Pat dry, salt lightly. {oil} in the pan, high heat. Chicken in, 4 minutes without moving it, until browned on one side. Out onto a plate; it won't be cooked through.", timer: 5 },
      { at: 5, title: "Onions", body: "{onion} into the same pan, 5 minutes until soft and the water's gone.", timer: 5 },
      { at: 10, title: "Aromatics", body: "{garlic} and {ginger}. 30 seconds." },
      { at: 11, title: "Fry the paste", warn: true, body: "{paste} in, 1 minute, stirring. It'll smell sharp, then sweet. Frying the paste is what wakes it up — skip this and the whole thing tastes flat.", timer: 1 },
      { at: 12, title: "Liquid", body: "{coco} and {water} in. Scrape the base. Bring to a simmer." },
      { at: 13, title: "Simmer the chicken", body: "Chicken back in with any juices from the plate. Lid on, low, 12 minutes. Thigh is forgiving — it gets more tender, not less, in a wet sauce.", timer: 12 },
      { at: 25, title: "Greens", body: "{ts} in, lid on, 4 minutes. {pc} in for the last 2. {spin} now if you're using it." },
      { at: 29, title: "Season", warn: true, body: "Off the heat. {fish}, {honey}, then the juice of half a {lem}. Taste between each — this is the whole dish. It'll want more fish sauce and more acid than feels right." },
      { at: 30, title: "Serve", body: "Bowl and spoon. Check a thick piece is cooked through before you sit down." },
    ],
    notes: [
      "Boneless thighs need thawing — you can't dice them frozen. Fridge overnight is the reliable route. Cold water works but takes longer than it sounds: separate them under running cold water first (5–10 minutes), then a sealed bag in a bowl of cold water for 30–45 minutes, changing the water halfway. Cold only, never warm, and cook the same day.",
      "Aim for firm, not soft. Partly frozen meat dices better — the knife doesn't drag and the pieces stay square. If the centres are still icy, wait; don't cook it half-frozen and hope.",
      "Don't use bone-in skin-on for this. The skin goes flabby in sauce and bones are awkward in a bowl.",
      "The honey isn't sweetness for its own sake — it's balancing the salt and acid. Leave it out and taste before deciding you needed it.",
      "Half a tin of coconut milk left: fridge 3–4 days, or freeze it.",
    ],
  },
  {
    id: "katsu",
    name: "Chicken katsu curry",
    subtitle: "The only one that needs real attention and a pan of hot oil.",
    protein: "Chicken",
    totalMins: 40,
    effort: "High",
    needsAhead: { label: "Thaw the thighs — about an hour in cold water, or overnight in the fridge", mins: 60 },
    servingsBase: 1,
    ingredients: [
      { id: "thigh", name: "boneless, skinless chicken thighs", qty: 2, unit: "" },
      { id: "flour", name: "plain flour, seasoned with salt and pepper", qty: 3, unit: "tbsp" },
      { id: "egg", name: "egg, beaten", qty: 1, unit: "", roundUp: true },
      { id: "panko", name: "panko breadcrumbs", qty: 60, unit: "g" },
      { id: "fryoil", name: "sunflower oil", qty: 1, unit: "cm depth in the pan", scale: false },
      { id: "soil", name: "sunflower oil, for the sauce", qty: 1, unit: "tbsp" },
      { id: "onion", name: "frozen diced onions", qty: 100, unit: "g" },
      { id: "garlic", name: "frozen chopped garlic", qty: 1, unit: "tsp" },
      { id: "ginger", name: "frozen chopped ginger", qty: 2, unit: "tsp" },
      { id: "water", name: "water", qty: 300, unit: "ml" },
      { id: "roux", name: "Golden Curry roux", qty: 36, unit: "g" },
      ...GREENS,
      { id: "gwater", name: "water, for the greens", qty: 2, unit: "tbsp" },
    ],
    steps: [
      { at: 0, title: "Sauce first", body: "{soil} in a pan, {onion}, 8 minutes on medium until soft and colouring. {garlic} and {ginger}, 30 seconds. {water}, simmer 5 minutes. Off the heat, break in {roux}, stir until dissolved. Back on low, 4 minutes. Set aside — it reheats fine.", timer: 18 },
      { at: 18, title: "Three plates", body: "{flour} on one, {egg} on the second, {panko} on the third." },
      { at: 20, title: "Flatten the thighs", warn: true, body: "Open {thigh} out flat and bash the thick parts with the base of a pan to an even 1.5cm. This is what stops the crumb burning before the middle cooks." },
      { at: 22, title: "Coat", body: "Flour, shake off the excess. Egg, let it drip. Panko, pressed on firmly. Wet crumbs fall off in the pan." },
      { at: 26, title: "Fry", body: "{fryoil}, medium-high. Ready when a crumb sizzles steadily — roughly 170°C. 4–5 minutes a side, turned once. Go by colour, not the clock: deep golden brown, not pale. Still pale after a turn each means the oil is too cool — turn it up.", timer: 10 },
      { at: 28, title: "Greens", body: "{ts} in a pan with {gwater}, lid on, 4 minutes. {pc} for the last 2." },
      { at: 36, title: "Check and rest", body: "75°C at the thickest part. Panko hides how far along the inside is. Rest on a plate, not kitchen paper, or the underside softens." },
      { at: 40, title: "Plate", body: "Slice before saucing, not after. Greens down, sliced katsu on top, sauce poured over the chicken." },
    ],
    notes: [
      "One egg coats two thighs comfortably. Don't scale it below one — beat a second in if you're doing four.",
      "Oil depth scales with pan diameter, not portions. A 28cm pan takes close to a litre at 1cm.",
      "Variation: swap 100ml of the sauce water for coconut milk. Rounder and sweeter — closer to a British takeaway katsu than a Japanese one.",
      "Used oil: cool completely, then strain back into a bottle through a sieve (good for 2–3 more fries), or pour into something disposable and bin it. Never down the sink.",
    ],
  },
  {
    id: "braise",
    name: "Chicken and chorizo braise",
    subtitle: "Worth doubling — it reheats better than anything else here.",
    protein: "Chicken",
    totalMins: 70,
    effort: "Medium",
    doubleHint: true,
    needsAhead: { label: "Thaw the thighs — bone-in, so overnight in the fridge", mins: 480 },
    servingsBase: 1,
    ingredients: [
      { id: "thigh", name: "bone-in, skin-on chicken thighs, thawed", qty: 2, unit: "" },
      { id: "chor", name: "cooking chorizo, sliced 1cm thick", qty: 75, unit: "g" },
      { id: "onion", name: "frozen diced onions", qty: 100, unit: "g" },
      { id: "garlic", name: "frozen chopped garlic", qty: 1, unit: "tsp" },
      { id: "pep", name: "frozen chopped peppers", qty: 50, unit: "g" },
      { id: "pap", name: "smoked paprika", qty: 1.5, unit: "tsp" },
      { id: "pur", name: "tomato purée", qty: 2, unit: "tsp" },
      { id: "water", name: "water", qty: 200, unit: "ml" },
      { id: "vin", name: "rice vinegar", qty: 1, unit: "tsp" },
      ...GREENS,
      { id: "gwater", name: "water, for the greens", qty: 2, unit: "tbsp" },
    ],
    steps: [
      { at: 0, title: "Render the chorizo", body: "Pat {thigh} dry, salt and pepper the skin. Deep pan, no oil, medium heat. {chor} in, 5 minutes until it's rendered a pool of orange fat and crisped at the edges. Lift it out with a slotted spoon; leave the fat.", timer: 5 },
      { at: 5, title: "Brown the chicken", body: "Thighs skin-side down in that fat, 6–7 minutes undisturbed, until deep brown. Turn, 2 minutes. Out onto a plate.", timer: 9 },
      { at: 14, title: "Onions and peppers", warn: true, body: "Tip off all but 2 tbsp of the fat. {onion} in, 8 minutes until soft and browning. {garlic} and {pep}, 3 minutes. Watch the peppers — anything scorched in the base ends up in the sauce when you deglaze.", timer: 11 },
      { at: 25, title: "Spices off the heat", warn: true, body: "Take the pan off the heat. {pap} and {pur} in, stir 20 seconds in the residual heat, then the water immediately. Ground paprika burns fast in a hot pan and burnt paprika is distinctly bitter." },
      { at: 26, title: "Deglaze", body: "{water} in. Scrape the bottom of the pan properly — that brown residue is most of the flavour." },
      { at: 27, title: "Braise", body: "Chorizo back in. Thighs back in skin-side up, sitting on top of the liquid rather than under it. Lid on, lowest heat that keeps it barely bubbling, 35 minutes. Check at 15 and 25; add 50ml water if it's drying out.", timer: 35 },
      { at: 62, title: "Finish the sauce", body: "Chicken out, check 75°C. Lid off, boil the sauce hard until it coats a spoon. Off the heat, {vin} in. Taste for salt — the chorizo has done most of it." },
      { at: 65, title: "Greens", body: "{ts} in a separate pan with {gwater}, lid on, 5 minutes. {pc} for the last 3." },
      { at: 70, title: "Plate", body: "Chicken back into the sauce, greens alongside." },
    ],
    notes: [
      "Hob only. No pan here is oven-safe. If you want the oven, brown in the pan then tip into an oven dish, covered with foil, Gas Mark 4 for 35 minutes.",
      "Needs thawed chicken — you can't brown frozen skin. Fridge overnight.",
      "If you smell scorching, take the pan straight off the heat, don't stir, and pour the contents into another pan leaving what's stuck behind.",
    ],
  },
  {
    id: "prawns",
    name: "Garlic butter prawns",
    subtitle: "Sixteen minutes, one pan. For nights you can't face cooking.",
    protein: "Prawns",
    totalMins: 16,
    effort: "Low",
    fromFrozen: true,
    servingsBase: 1,
    ingredients: [
      { id: "prawn", name: "raw king prawns, from frozen", qty: 200, unit: "g" },
      { id: "butter", name: "butter", qty: 30, unit: "g" },
      { id: "oil", name: "olive oil", qty: 1, unit: "tbsp" },
      { id: "garlic", name: "frozen chopped garlic", qty: 2, unit: "tsp" },
      { id: "chilli", name: "frozen chopped chilli", qty: 0.5, unit: "tsp" },
      { id: "fish", name: "fish sauce", qty: 1, unit: "tsp" },
      { id: "lem", name: "lemon", qty: 0.5, unit: "" },
      ...GREENS,
      { id: "water", name: "water, for the greens", qty: 2, unit: "tbsp" },
    ],
    steps: [
      { at: 0, title: "Thaw the prawns", body: "{prawn} into a sieve, cold water running over them for 5 minutes until separated. Leave draining.", timer: 5 },
      { at: 2, title: "Prep the greens", body: "Trim {ts}. Halve {pc} lengthways and rinse the cut faces hard." },
      { at: 5, title: "Greens first", body: "{oil} in the pan, {ts}, 2 minutes. {water} in, lid on, 3 minutes. {pc} cut-side down for the last 2. Tip into your bowl.", timer: 7 },
      { at: 12, title: "Butter and aromatics", body: "Same pan, high heat, {butter}. As soon as it foams, {garlic} and {chilli}. 20 seconds." },
      { at: 13, title: "Prawns", warn: true, body: "Shake the sieve hard — wet prawns steam instead of frying. {prawn} in, 2–3 minutes, no more. Done when pink and curled into a C. A tight O is overcooked.", timer: 3 },
      { at: 16, title: "Finish", body: "Off the heat. {fish}, the juice of half a {lem}, black pepper. Swirl the pan, then pour prawns and all the butter over the greens. The butter is the sauce — don't leave it behind." },
    ],
    notes: [
      "The only way to get this wrong is the prawns. Three minutes, then off, even if you think they need longer.",
      "The seasoning at the end is an estimate — taste after the fish sauce and lemon go in rather than trusting the quantities outright.",
    ],
  },
  {
    id: "coconut-broth",
    name: "Coconut prawn broth",
    subtitle: "Nearly as fast, but properly saucy. Eat it with a spoon.",
    protein: "Prawns",
    totalMins: 26,
    effort: "Low",
    fromFrozen: true,
    servingsBase: 1,
    ingredients: [
      { id: "prawn", name: "raw king prawns, from frozen", qty: 200, unit: "g" },
      { id: "oil", name: "olive oil", qty: 1, unit: "tbsp" },
      { id: "onion", name: "frozen diced onions", qty: 100, unit: "g" },
      { id: "garlic", name: "frozen chopped garlic", qty: 2, unit: "tsp" },
      { id: "ginger", name: "frozen chopped ginger", qty: 2, unit: "tsp" },
      { id: "chilli", name: "frozen chopped chilli", qty: 0.5, unit: "tsp" },
      { id: "paste", name: "Thai red curry paste", qty: 1, unit: "tbsp" },
      { id: "coco", name: "coconut milk", qty: 200, unit: "ml" },
      { id: "water", name: "water", qty: 100, unit: "ml" },
      { id: "fish", name: "fish sauce", qty: 1, unit: "tbsp" },
      { id: "spin", name: "frozen spinach (optional)", qty: 60, unit: "g" },
      { id: "lem", name: "lemon", qty: 0.5, unit: "" },
      ...GREENS,
    ],
    steps: [
      { at: 0, title: "Thaw the prawns", body: "{prawn} into a sieve under cold running water, 5 minutes. Drain hard. Trim {ts}, halve and rinse {pc}.", timer: 5 },
      { at: 5, title: "Onions", body: "{oil} in the pan, {onion} from frozen, 5 minutes until soft and the water's gone.", timer: 5 },
      { at: 10, title: "Aromatics", body: "{garlic}, {ginger}, {chilli}. 30 seconds." },
      { at: 11, title: "Fry the paste", warn: true, body: "{paste} in, 1 minute, stirring. It'll smell sharp, then sweet. Frying the paste is what wakes it up — skip this and the whole thing tastes flat.", timer: 1 },
      { at: 12, title: "Liquid", body: "{coco} and {water} in. Simmer 5 minutes.", timer: 5 },
      { at: 17, title: "Greens", body: "{ts} in, lid on, 4 minutes. {pc} in, lid on, 2 minutes. {spin} now if you're using it.", timer: 6 },
      { at: 23, title: "Prawns", body: "In for 3 minutes, until pink and curled into a C.", timer: 3 },
      { at: 26, title: "Season", body: "Off the heat. {fish} and the juice of half a {lem}. Taste — it'll want more of both than you expect. Add in half-teaspoons." },
    ],
    notes: [
      "For a thicker sauce rather than a broth, 1 tsp cornflour slaked in cold water at the liquid stage.",
      "Opened coconut milk: out of the tin, fridge, 3–4 days. Or freeze it — it goes lumpy on thawing but whisks back once hot.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Components — building blocks, not dinners                           */
/* ------------------------------------------------------------------ */

const COMPONENTS = [
  {
    id: "roast-method",
    name: "Roasting thighs from frozen",
    subtitle: "The skeleton under three of the dinners.",
    protein: "Method",
    totalMins: 60,
    effort: "Low",
    fromFrozen: true,
    servingsBase: 1,
    ingredients: ROAST_BASE,
    steps: [
      { at: -15, title: "Oven on", body: "Gas Mark 6, a full 15 minutes." },
      { at: 0, title: "In bare", body: "{thigh} dry and bare, skin-side up, spaced, upper-middle shelf.", timer: 30 },
      { at: 30, title: "Tip and season", warn: true, body: "Tip all the water out of the tin, then {oil} and {salt}. Turn the tin, up to Gas Mark 7.", timer: 10 },
      { at: 40, title: "Back to Gas 6", body: "Or Gas Mark 5 if the glaze contains sugar or miso." },
      { at: 45, title: "Glaze on", body: "Last 10 minutes only.", timer: 10 },
      { at: 55, title: "Check", body: "75°C away from the bone." },
      { at: 60, title: "Rest", body: "5 minutes.", timer: 5 },
    ],
    notes: [
      "From thawed: 40–45 minutes, and oil and salt at the start.",
      "The skin will be good but never shattering. Butter or glaze on top softens it; the Gas Mark 7 window does most of the work.",
    ],
  },
  {
    id: "glazes",
    name: "Glazes at a glance",
    subtitle: "Swap any of these onto roast thighs or fish.",
    protein: "Method",
    totalMins: 6,
    effort: "Low",
    servingsBase: 1,
    ingredients: [],
    steps: [
      { title: "Honey and soy", body: "3 tbsp soy, 2 tbsp honey, 1 tbsp rice vinegar, 2 tsp garlic, 1 tbsp ginger, pepper. Simmer 5–6 minutes until it coats a spoon. Gas Mark 6, last 10 minutes." },
      { title: "Miso butter", body: "30g soft butter, 1 tbsp barley miso, 2 tsp ginger, 1 tsp garlic. No cooking. Gas Mark 5, last 10 minutes. Half on the meat, half stirred through the greens off the heat." },
      { title: "Gochujang", body: "2 tbsp gochujang, 1 tbsp soy, 1 tsp garlic, ½ tsp fish sauce. No cooking. Gas Mark 5, last 10 minutes." },
      { title: "Mustard butter", body: "30g soft butter, 2 tsp Dijon, black pepper. Best on fish — 15 minutes at Gas Mark 5, and the glaze can go on from the start since fish cooks fast." },
    ],
    notes: [
      "Anything with sugar, honey or miso goes on in the last 10 minutes at Gas Mark 5. Never earlier, never hotter.",
      "Never stack two salty ferments. Miso and soy, or gochujang and soy at full strength, is salt on salt.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Kitchen reference                                                   */
/* ------------------------------------------------------------------ */

const KITCHEN = [
  ["Oven marks", "Gas 4 = 180°C. Gas 5 = 190°C. Gas 6 = 200°C. Gas 7 = 220°C."],
  ["Gas oven", "Hotter at the top, and humid, because burning gas produces water vapour. Crisping is harder than electric. Upper-middle shelf, turn the tin once."],
  ["No oven-safe pans", "Every pan here is hob-only — plastic handles and lid knobs. Oven work goes in a dish or a tin."],
  ["Chicken doneness", "75°C at the thickest part, away from the bone. Or juices completely clear. Bone-in thighs are forgiving — five extra minutes won't dry them out."],
  ["From frozen", "Safe provided it reaches temperature. Takes roughly 50% longer, and the skin never crisps as well."],
  ["Frozen aromatics", "Loose, not cubes. 1 tsp garlic is about 1½ cloves. Level spoons, not heaped — heaped roughly doubles it."],
  ["Frozen vegetables", "Wet. Dry-fry in a hot pan with no oil until the hissing stops, then add fat. Skip it and they steam."],
  ["Loose lids", "Nothing has a tight lid except the deep frying pan. Add a minute to any lidded step, and expect more reduction while the lid is on."],
];

const STORAGE = [
  ["Fridge once opened", "Gochujang (3 weeks), Thai red curry paste (~6 weeks), tomato purée, anchovies under their oil (~2 weeks), Dijon, barley miso (months), creamed coconut wrapped tight (~2 weeks). Sesame oil is officially cupboard, but fridge it if you use it slowly."],
  ["Cupboard", "Fish sauce — about a quarter salt, keeps a year plus. Plain flour, sunflower oil, unopened coconut tins, Golden Curry roux."],
  ["Opened coconut milk", "Out of the tin, into the fridge, 3–4 days. Or freeze it."],
  ["Cooked chicken", "Fridge within 2 hours, eat within 2 days, reheat once until piping hot. Oven at 190°C for 12–15 minutes uncovered beats the microwave. Cold off the bone is often better than either."],
  ["Greens", "Pak choi 4–5 days, tenderstem about a week. Store unwashed."],
  ["Raw chicken and fish", "Freezer on the day you buy it unless you're cooking within 48 hours. Check fish packs — much supermarket fish has been frozen and thawed already and can't be refrozen."],
];

const HOWTO = [
  ["Cooking tonight", "Open Dinners, tap Can cook now to see what's actually doable, and pick anything marked Ready to cook. Missing N means N core ingredients are short — sides don't count."],
  ["Updating the pantry after shopping", "Open Pantry, tap In or Out next to whatever changed. After a big shop, use \"Just shopped — mark all in\" under Fresh rather than ticking each one."],
  ["Correcting a quantity or timing", "Tell Claude what's wrong and what it should be instead. It edits data/recipes.js and rebuilds the site — you never need to touch the file yourself."],
  ["When the site looks out of date", "Hard refresh the page first — it's usually just the browser holding an old copy. Still stale after that means the last change probably wasn't rebuilt and pushed; ask Claude to check."],
];

const WONT_WORK = [
  "Honey or miso glaze on from the start — black before the chicken is done",
  "Frozen peppers in the roasting tin — they water the pan and steam the skin",
  "Skipping the tip-out at 0:30 — the biggest single cause of poor skin",
  "Soy on top of Golden Curry roux, or on top of miso — salt on salt",
  "Coconut in a vinegar-based sauce — splits the roundness, tastes sour and fatty at once",
  "Ground paprika into a hot pan — bitter, and it doesn't cook out",
  "Reheated cooked greens — grey and limp. Four minutes fresh instead.",
];

const PANTRY = [
  // --- always available -------------------------------------------------
  { id: "water", name: "Water", cat: "Always", defaultState: "always" },
  { id: "salt", name: "Salt", cat: "Always", defaultState: "always" },
  { id: "pepper", name: "Black pepper", cat: "Always", defaultState: "always" },

  // --- freezer ----------------------------------------------------------
  // thawState is a second axis, independent of defaultState/"have"/"out":
  // whether the meat itself is frozen or has been thawed. It only exists on
  // items where that distinction changes what's cookable. Defaults to
  // frozen — that's how it comes out of the freezer.
  { id: "thighs-bone", name: "Chicken thighs, bone-in", cat: "Freezer", defaultState: "have", thawState: "frozen", keeps: "Months frozen. Needs a day in the fridge before any recipe that browns the skin." },
  { id: "thighs-boneless", name: "Chicken thighs, boneless", cat: "Freezer", defaultState: "have", thawState: "frozen", keeps: "Months frozen." },
  { id: "prawns", name: "Raw king prawns", cat: "Freezer", defaultState: "have", thawState: "frozen", keeps: "Months frozen. Cook straight from frozen after a 5-minute rinse." },
  { id: "fz-garlic", name: "Frozen chopped garlic", cat: "Freezer", defaultState: "have", keeps: "Months." },
  { id: "fz-ginger", name: "Frozen chopped ginger", cat: "Freezer", defaultState: "have", keeps: "Months." },
  { id: "fz-chilli", name: "Frozen chopped chilli", cat: "Freezer", defaultState: "have", keeps: "Months." },
  { id: "fz-peppers", name: "Frozen chopped peppers", cat: "Freezer", defaultState: "have", keeps: "Months." },
  { id: "fz-onions", name: "Frozen diced onions", cat: "Freezer", defaultState: "have", keeps: "Months." },
  { id: "fz-spinach", name: "Frozen spinach", cat: "Freezer", defaultState: "have", keeps: "Months." },
  { id: "fz-cauli", name: "Frozen cauliflower rice", cat: "Freezer", defaultState: "out", keeps: "Months.",
    prep: "Dry pan, high heat, no oil, 4–5 minutes until the water has steamed off. Only then add fat or seasoning, or it turns to mush." },

  // --- fresh ------------------------------------------------------------
  { id: "tenderstem", name: "Tenderstem broccoli", cat: "Fresh", defaultState: "out", keeps: "About a week in the fridge, stored unwashed.",
    prep: "Trim 1–2cm off the ends; leave the stems whole. Pan with 2 tbsp water, lid on, 4 minutes — 5 if the lid is loose. Or straight into whatever sauce the dish has, so it picks it up." },
  { id: "pakchoi", name: "Pak choi", cat: "Fresh", defaultState: "out", keeps: "Four or five days. The first thing to go over.",
    prep: "Halve lengthways and rinse the cut faces hard — grit collects at the base. Cut-side down, lid on, 2 minutes, 3 with a loose lid. Raw works too: sliced crossways into 3–4mm ribbons, stems and all." },
  { id: "lemon", name: "Lemon", cat: "Fresh", defaultState: "out", keeps: "Weeks in the fridge. Halved, about a week cut-side down." },
  { id: "chorizo", name: "Cooking chorizo", cat: "Fresh", defaultState: "out", keeps: "Weeks unopened in the fridge. About a week once cut." },
  { id: "butter", name: "Butter", cat: "Fresh", defaultState: "have", keeps: "Weeks in the fridge." },
  { id: "eggs", name: "Eggs", cat: "Fresh", defaultState: "have", keeps: "Weeks." },

  // --- cupboard ---------------------------------------------------------
  { id: "soy", name: "Soy sauce", cat: "Cupboard", defaultState: "have", keeps: "Years." },
  { id: "fishsauce", name: "Fish sauce", cat: "Cupboard", defaultState: "have", keeps: "A year plus. It's about a quarter salt — it preserves itself." },
  { id: "honey", name: "Honey", cat: "Cupboard", defaultState: "have", keeps: "Indefinitely." },
  { id: "ricevinegar", name: "Rice vinegar", cat: "Cupboard", defaultState: "have", keeps: "Years." },
  { id: "oliveoil", name: "Olive oil", cat: "Cupboard", defaultState: "have", keeps: "A year or so." },
  { id: "sesameoil", name: "Toasted sesame oil", cat: "Cupboard", defaultState: "have", keeps: "Unrefined, so it goes rancid. Officially cupboard; fridge it, since you get through it slowly." },
  { id: "sunfloweroil", name: "Sunflower oil", cat: "Cupboard", defaultState: "have", keeps: "A year. Strained frying oil keeps for two or three more fries." },
  { id: "flour", name: "Plain flour", cat: "Cupboard", defaultState: "have", keeps: "Months." },
  { id: "panko", name: "Panko breadcrumbs", cat: "Cupboard", defaultState: "have", keeps: "Months sealed." },
  { id: "paprika", name: "Smoked paprika", cat: "Cupboard", defaultState: "have", keeps: "A year or two, but it fades." },
  { id: "sultanas", name: "Sultanas", cat: "Cupboard", defaultState: "have", keeps: "Months." },
  { id: "goldencurry", name: "Golden Curry roux", cat: "Cupboard", defaultState: "have", keeps: "Months. 92g box is five portions." },
  { id: "coconutmilk", name: "Coconut milk, tinned", cat: "Cupboard", defaultState: "have", keeps: "Years unopened. Three or four days once opened, or freeze it." },
  { id: "creamedcoconut", name: "Creamed coconut sachets", cat: "Cupboard", defaultState: "have", keeps: "Unopened sachets keep in the cupboard. Opened: fridge, wrapped, about two weeks." },

  // --- fridge, opened ---------------------------------------------------
  { id: "miso", name: "Barley miso", cat: "Fridge", defaultState: "have", keeps: "Months in the fridge once opened." },
  { id: "gochujang", name: "Gochujang paste", cat: "Fridge", defaultState: "have", keeps: "Three weeks once opened. The shortest clock in the cupboard." },
  { id: "currypaste", name: "Thai red curry paste", cat: "Fridge", defaultState: "have", keeps: "About six weeks once opened." },
  { id: "tomatopuree", name: "Tomato purée", cat: "Fridge", defaultState: "have", keeps: "Weeks in the fridge once opened. Tube, not tin — no waste." },
];



const INGREDIENT_MAP = {
  "bone-in, skin-on chicken thighs": "thighs-bone",
  "bone-in, skin-on chicken thighs, thawed": "thighs-bone",
  "boneless, skinless chicken thighs": "thighs-boneless",
  "raw king prawns, from frozen": "prawns",
  "cooking chorizo, sliced 1cm thick": "chorizo",
  "tenderstem broccoli": "tenderstem",
  "pak choi": "pakchoi",
  "lemon": "lemon",
  "butter": "butter",
  "butter, softened": "butter",
  "egg, beaten": "eggs",
  "frozen chopped garlic": "fz-garlic",
  "frozen chopped ginger": "fz-ginger",
  "frozen chopped chilli": "fz-chilli",
  "frozen chopped peppers": "fz-peppers",
  "frozen diced onions": "fz-onions",
  "frozen spinach (optional)": "fz-spinach",
  "soy sauce": "soy",
  "fish sauce": "fishsauce",
  "honey": "honey",
  "rice vinegar": "ricevinegar",
  "olive oil": "oliveoil",
  "olive oil, for the greens": "oliveoil",
  "olive oil, for the sauce": "oliveoil",
  "sunflower oil": "sunfloweroil",
  "toasted sesame oil (optional)": "sesameoil",
  "sunflower oil, for the sauce": "sunfloweroil",
  "plain flour, seasoned with salt and pepper": "flour",
  "panko breadcrumbs": "panko",
  "smoked paprika": "paprika",
  "sultanas (optional)": "sultanas",
  "Golden Curry roux": "goldencurry",
  "coconut milk": "coconutmilk",
  "creamed coconut, chopped small": "creamedcoconut",
  "barley miso": "miso",
  "gochujang paste": "gochujang",
  "Thai red curry paste": "currypaste",
  "tomato purée": "tomatopuree",
  "flaky salt": "salt",
  "water": "water",
  "water, for the greens": "water",
  "water, for the sauce": "water",
};


const OPTIONAL = new Set(["sultanas", "fz-spinach", "sesameoil"]);




const SIDES = new Set(["tenderstem", "pakchoi", "fz-cauli"]);

const isSide = (id) => SIDES.has(id);

const pantryItem = (id) => PANTRY.find((p) => p.id === id);


function recipeNeeds(recipe) {
  const ids = [];
  for (const ing of recipe.ingredients) {
    const id = INGREDIENT_MAP[ing.name];
    if (!id) continue;
    const item = pantryItem(id);
    if (!item || item.defaultState === "always") continue;
    if (!ids.includes(id)) ids.push(id);
  }
  return ids;
}


function stateOf(id, state) {
  if (state && state[id]) return state[id];
  const item = pantryItem(id);
  return item ? item.defaultState : "have";
}



const tracksThaw = (id) => !!pantryItem(id)?.thawState;



function thawStateOf(id, meatState) {
  if (meatState && meatState[id]) return meatState[id];
  const item = pantryItem(id);
  return item?.thawState ?? null;
}

function checkRecipe(recipe, state) {
  const needs = recipeNeeds(recipe);
  const out = (id) => stateOf(id, state) === "out";
  // Core = what the dish actually is. Only this decides cookability.
  // A recipe is a self-contained meal; sides never block one.
  const missing = needs.filter((id) => out(id) && !OPTIONAL.has(id) && !SIDES.has(id));
  const missingOptional = needs.filter((id) => out(id) && OPTIONAL.has(id));
  const missingSides = needs.filter((id) => out(id) && SIDES.has(id));
  const sidesIn = [...SIDES].filter((id) => !out(id));
  return { needs, missing, missingOptional, missingSides, sidesIn, canCook: missing.length === 0 };
}



/* ------------------------------------------------------------------ */
/* Storage                                                             */
/* ------------------------------------------------------------------ */
// Claude artifacts expose window.storage. On GitHub Pages it doesn't exist,
// so fall back to localStorage there. Never localStorage inside an artifact.
const store = {
  async get(key) {
    if (typeof window !== "undefined" && window.storage) {
      try { const r = await window.storage.get(key); return r?.value ?? null; }
      catch { return null; }
    }
    try { return window.localStorage.getItem(key); } catch { return null; }
  },
  async set(key, value) {
    if (typeof window !== "undefined" && window.storage) {
      try { await window.storage.set(key, value); } catch { /* non-fatal */ }
      return;
    }
    try { window.localStorage.setItem(key, value); } catch { /* non-fatal */ }
  },
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const FRACTIONS = { 0.25: "¼", 0.5: "½", 0.75: "¾" };

function fmtQty(n) {
  if (n === 0) return "";
  const whole = Math.floor(n);
  const rem = Math.round((n - whole) * 100) / 100;
  const frac = FRACTIONS[rem];
  if (frac) return whole ? `${whole}${frac}` : frac;
  if (n < 10) return String(Math.round(n * 100) / 100);
  return String(Math.round(n));
}

function scaled(ing, mult) {
  let q;
  if (ing.scale === false) q = ing.qty;
  else if (ing.roundUp) q = Math.ceil(ing.qty * mult);
  else q = ing.qty * mult;
  return {
    ...ing,
    display: [fmtQty(q), ing.unit].filter(Boolean).join(" ").trim(),
    fixed: ing.scale === false,
    rounded: !!ing.roundUp && mult !== 1,
  };
}

function renderBody(body, ings, mult) {
  const map = {};
  ings.forEach((i) => {
    map[i.id] = `${scaled(i, mult).display} ${i.name}`.trim();
  });
  return body.split(/(\{[a-z]+\})/g).map((p, i) => {
    const m = p.match(/^\{([a-z]+)\}$/);
    if (m && map[m[1]]) return <b key={i} className="amt">{map[m[1]]}</b>;
    return <span key={i}>{p}</span>;
  });
}

const clockAt = (start, off) =>
  new Date(start.getTime() + off * 60000).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

const fmtOffset = (m) =>
  `${m < 0 ? "−" : ""}${Math.floor(Math.abs(m) / 60)}:${String(Math.abs(m) % 60).padStart(2, "0")}`;

/* ------------------------------------------------------------------ */
/* Styles                                                              */
/* ------------------------------------------------------------------ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Serif:wght@600&display=swap');

.rb { --base:#EFF1F4; --card:#FFF; --ink:#14171C; --mute:#666E7A; --line:#D7DCE3;
  --flame:#1B4FD1; --flame-2:#E8EEFC; --ember:#B23C0A; --ember-2:#FBEDE5;
  font-family:'IBM Plex Sans',system-ui,sans-serif; color:var(--ink);
  background:var(--base); min-height:100vh; font-feature-settings:'tnum' 1;
  -webkit-font-smoothing:antialiased; }
.rb * { box-sizing:border-box; }
.wrap { max-width:640px; margin:0 auto; padding:0 18px 90px; }

.masthead { padding:32px 0 4px; }
.masthead h1 { font-family:'IBM Plex Serif',Georgia,serif; font-weight:600; font-size:32px;
  line-height:1.05; margin:0; letter-spacing:-.015em; }

.nav { display:flex; border-bottom:1px solid var(--line); margin:22px 0 20px; }
.nav button { background:none; border:none; border-bottom:2px solid transparent;
  padding:11px 0; margin-right:26px; font-family:inherit; font-size:15px; font-weight:500;
  color:var(--mute); cursor:pointer; margin-bottom:-1px; }
.nav button[data-on="1"] { color:var(--ink); border-bottom-color:var(--flame); }

.blurb { margin:0 0 18px; color:var(--mute); font-size:14px; line-height:1.55; }

.filters { display:flex; gap:7px; flex-wrap:wrap; margin-bottom:16px; }
.chip { border:1px solid var(--line); background:var(--card); color:var(--mute);
  border-radius:999px; padding:6px 13px; font-size:13px; font-weight:500; cursor:pointer;
  font-family:inherit; }
.chip[data-on="1"] { background:var(--flame); border-color:var(--flame); color:#fff; }
.chip:focus-visible,.btn:focus-visible,.row:focus-visible,.nav button:focus-visible
  { outline:2px solid var(--flame); outline-offset:2px; }

.row { display:flex; gap:16px; align-items:flex-start; width:100%; text-align:left;
  background:var(--card); border:1px solid var(--line); border-left:3px solid var(--flame);
  padding:15px 16px; margin-bottom:9px; cursor:pointer; font-family:inherit; border-radius:3px; }
.row[data-method="1"] { border-left-color:var(--mute); }
.row:hover { border-left-color:var(--ember); }
.row .clock { font-size:25px; font-weight:600; line-height:1; letter-spacing:-.03em; min-width:50px; }
.row .clock small { display:block; font-size:10px; font-weight:500; color:var(--mute); margin-top:4px; }
.row h3 { margin:0 0 3px; font-size:16px; font-weight:600; letter-spacing:-.01em; }
.row p { margin:0; font-size:13px; color:var(--mute); line-height:1.45; }
.tagline { margin-top:7px; display:flex; gap:6px; flex-wrap:wrap; }
.tag { font-size:11px; font-weight:500; color:var(--mute); border:1px solid var(--line);
  padding:2px 7px; border-radius:2px; }
.tag[data-x="1"] { color:var(--ember); border-color:#EBC8B4; background:var(--ember-2); }

.back { background:none; border:none; color:var(--flame); font-family:inherit; font-size:14px;
  font-weight:500; padding:24px 0 10px; cursor:pointer; }
.dhead h2 { font-family:'IBM Plex Serif',Georgia,serif; font-size:26px; font-weight:600;
  margin:0 0 5px; line-height:1.15; letter-spacing:-.015em; }
.dhead > p { margin:0 0 18px; color:var(--mute); font-size:14px; line-height:1.5; }

.portions { display:flex; align-items:center; gap:14px; background:var(--card);
  border:1px solid var(--line); padding:12px 14px; border-radius:3px; margin-bottom:6px; }
.portions .lab { font-size:13px; color:var(--mute); flex:1; }
.stepper { display:flex; align-items:center; gap:2px; }
.stepper button { width:32px; height:32px; border:1px solid var(--line); background:var(--card);
  font-size:17px; cursor:pointer; font-family:inherit; color:var(--ink); border-radius:2px; }
.stepper button:disabled { opacity:.3; cursor:default; }
.stepper span { min-width:34px; text-align:center; font-weight:600; font-size:16px; }
.hint { font-size:12px; color:var(--mute); margin:0 0 16px; line-height:1.5; }

.tabs { display:flex; border-bottom:1px solid var(--line); margin-bottom:18px; }
.tabs button { flex:1; background:none; border:none; border-bottom:2px solid transparent;
  padding:11px 4px; font-family:inherit; font-size:14px; font-weight:500; color:var(--mute);
  cursor:pointer; margin-bottom:-1px; }
.tabs button[data-on="1"] { color:var(--flame); border-bottom-color:var(--flame); }

.ing { display:flex; gap:12px; padding:11px 0; border-bottom:1px solid var(--line);
  font-size:15px; line-height:1.4; }
.ing .q { font-weight:600; min-width:100px; }
.ing[data-fixed="1"] .q { color:var(--mute); }
.fixnote { font-size:11px; color:var(--mute); display:block; font-weight:400; }

.rail { position:relative; padding-left:26px; }
.rail::before { content:''; position:absolute; left:7px; top:8px; bottom:8px; width:1px;
  background:var(--line); }
.step { position:relative; padding:0 0 22px; }
.step::before { content:''; position:absolute; left:-23px; top:6px; width:9px; height:9px;
  background:var(--flame); border-radius:50%; }
.step[data-warn="1"]::before { background:var(--ember); }
.step .when { font-size:12px; font-weight:600; color:var(--flame); }
.step[data-warn="1"] .when { color:var(--ember); }
.step h4 { margin:2px 0 5px; font-size:16px; font-weight:600; letter-spacing:-.01em; }
.step p { margin:0; font-size:15px; line-height:1.55; }
.step .amt { font-weight:600; background:var(--flame-2); padding:0 3px; border-radius:2px; }
.step[data-warn="1"] .amt { background:var(--ember-2); }
.timer { margin-top:9px; }

.btn { background:var(--flame); color:#fff; border:none; padding:13px 18px; font-family:inherit;
  font-size:15px; font-weight:600; width:100%; cursor:pointer; border-radius:3px; }
.btn[data-ghost="1"] { background:var(--card); color:var(--flame); border:1px solid var(--line); }
.btn.sm { width:auto; padding:7px 13px; font-size:13px; font-weight:500; }

.timebox { background:var(--card); border:1px solid var(--line); padding:14px; border-radius:3px;
  margin-bottom:18px; }
.timebox label { display:block; font-size:13px; color:var(--mute); margin-bottom:8px; }
.timebox input { font-family:inherit; font-size:17px; padding:9px 11px; border:1px solid var(--line);
  border-radius:2px; width:100%; color:var(--ink); background:var(--base); }

.panel { background:var(--card); border:1px solid var(--line); border-radius:3px;
  padding:15px 17px; margin-bottom:12px; }
.panel h5 { margin:0 0 11px; font-size:13px; font-weight:600; color:var(--mute); }
.panel ul { margin:0; padding-left:17px; }
.panel li { font-size:14px; line-height:1.55; margin-bottom:9px; }
.panel li:last-child { margin-bottom:0; }
.panel dl { margin:0; }
.panel dt { font-size:14px; font-weight:600; margin-bottom:3px; }
.panel dd { margin:0 0 13px; font-size:14px; line-height:1.55; color:var(--mute); }
.panel dd:last-child { margin-bottom:0; }

.cook { position:fixed; inset:0; background:var(--card); z-index:50; display:flex;
  flex-direction:column; padding:22px 20px; }
.cook .idx { font-size:13px; color:var(--mute); font-weight:500; }
.cook .body { flex:1; display:flex; flex-direction:column; justify-content:center; }
.cook h3 { font-size:15px; font-weight:600; color:var(--flame); margin:0 0 12px; }
.cook p { font-size:22px; line-height:1.45; margin:0; }
.cook .amt { font-weight:600; background:var(--flame-2); padding:0 4px; }
.cook .nav2 { display:flex; gap:10px; }

.status { font-size:11px; font-weight:600; padding:2px 7px; border-radius:2px;
  border:1px solid transparent; white-space:nowrap; }
.status[data-s="ready"] { color:#0F6A3A; background:#E4F3EA; border-color:#BEE0CD; }
.status[data-s="near"]  { color:var(--ember); background:var(--ember-2); border-color:#EBC8B4; }
.status[data-s="no"]    { color:var(--mute); background:var(--base); border-color:var(--line); }

.prow { display:flex; align-items:center; gap:12px; padding:12px 0;
  border-bottom:1px solid var(--line); }
.prow .pn { flex:1; font-size:15px; line-height:1.35; }
.prow .pk { display:block; font-size:12px; color:var(--mute); line-height:1.45; margin-top:2px; }
.toggle { display:flex; border:1px solid var(--line); border-radius:2px; overflow:hidden; }
.toggle button { background:var(--card); border:none; font-family:inherit; font-size:13px;
  font-weight:500; padding:7px 12px; cursor:pointer; color:var(--mute); }
.toggle button[data-on="1"] { background:var(--flame); color:#fff; }
.toggle button[data-on="1"][data-neg="1"] { background:var(--ember); }
.prow[data-sub="1"] { padding-top:0; }
.prow[data-sub="1"] .pn { color:var(--mute); font-size:13px; }
.cat { font-size:13px; font-weight:600; color:var(--mute); margin:22px 0 2px; }
.cat:first-of-type { margin-top:4px; }

.missing { background:var(--ember-2); border:1px solid #EBC8B4; border-radius:3px;
  padding:13px 15px; margin-bottom:16px; }
.missing h5 { margin:0 0 8px; font-size:13px; font-weight:600; color:var(--ember); }
.missing ul { margin:0; padding-left:17px; }
.missing li { font-size:14px; line-height:1.5; margin-bottom:4px; }
.ahead { background:var(--flame-2); border:1px solid #C3D3F5; border-radius:3px;
  padding:12px 15px; margin-bottom:16px; font-size:14px; line-height:1.5; color:var(--ink); }
.ahead b { color:var(--flame); }
.ready { background:#E4F3EA; border:1px solid #BEE0CD; border-radius:3px;
  padding:11px 15px; margin-bottom:16px; font-size:14px; color:#0F6A3A; font-weight:500; }

@media (prefers-reduced-motion:reduce){ .rb * { transition:none !important; } }
`;

/* ------------------------------------------------------------------ */
/* Components                                                          */
/* ------------------------------------------------------------------ */

function Timer({ mins }) {
  const [left, setLeft] = useState(null);
  const ref = useRef(null);
  useEffect(() => () => clearInterval(ref.current), []);
  const start = () => {
    clearInterval(ref.current);
    setLeft(mins * 60);
    ref.current = setInterval(() => {
      setLeft((v) => {
        if (v <= 1) { clearInterval(ref.current); return 0; }
        return v - 1;
      });
    }, 1000);
  };
  if (left === null)
    return <button className="btn sm" data-ghost="1" onClick={start}>Start {mins} min timer</button>;
  return (
    <button className="btn sm" data-ghost="1" onClick={() => { clearInterval(ref.current); setLeft(null); }}>
      {left === 0 ? "Time — tap to reset" : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")} — tap to stop`}
    </button>
  );
}

function CookMode({ recipe, mult, onClose }) {
  const [i, setI] = useState(0);
  const s = recipe.steps[i];
  return (
    <div className="cook">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="idx">Step {i + 1} of {recipe.steps.length}</span>
        <button className="btn sm" data-ghost="1" onClick={onClose}>Close</button>
      </div>
      <div className="body">
        <h3>{s.title}</h3>
        <p>{renderBody(s.body, recipe.ingredients, mult)}</p>
        {s.timer && <div className="timer"><Timer mins={s.timer} /></div>}
      </div>
      <div className="nav2">
        <button className="btn" data-ghost="1" disabled={i === 0} onClick={() => setI(i - 1)}>Back</button>
        <button className="btn" disabled={i === recipe.steps.length - 1} onClick={() => setI(i + 1)}>Next</button>
      </div>
    </div>
  );
}

function Detail({ recipe, onBack, servings, setServings, pantry }) {
  const [tab, setTab] = useState("method");
  const [cooking, setCooking] = useState(false);
  const [eatAt, setEatAt] = useState("");
  const mult = servings / recipe.servingsBase;
  const timed = recipe.steps.some((s) => s.at !== undefined);
  const hasIngredients = recipe.ingredients.length > 0;
  const fixedAny = recipe.ingredients.some((x) => x.scale === false || x.roundUp);

  const start = useMemo(() => {
    if (!eatAt || !timed) return null;
    const [h, m] = eatAt.split(":").map(Number);
    if (isNaN(h)) return null;
    const end = new Date();
    end.setHours(h, m, 0, 0);
    const last = Math.max(...recipe.steps.map((s) => s.at ?? 0));
    return new Date(end.getTime() - last * 60000);
  }, [eatAt, recipe, timed]);

  const { missing, missingOptional, missingSides, sidesIn } = checkRecipe(recipe, pantry);
  const isSideIng = (ing) => SIDES.has(INGREDIENT_MAP[ing.name]);
  const coreIngs = recipe.ingredients.filter((i) => !isSideIng(i));
  const sideIngs = recipe.ingredients.filter(isSideIng);

  return (
    <>
      {cooking && <CookMode recipe={recipe} mult={mult} onClose={() => setCooking(false)} />}
      <button className="back" onClick={onBack}>← Back</button>
      <div className="dhead">
        <h2>{recipe.name}</h2>
        <p>{recipe.subtitle}</p>
      </div>

      {recipe.needsAhead && (
        <div className="ahead">
          <b>Start this first.</b> {recipe.needsAhead.label}. Nothing else in the method works
          until it's done — this isn't a version of the recipe that cooks from frozen.
        </div>
      )}
      {hasIngredients && missing.length > 0 && (
        <div className="missing">
          <h5>{missing.length === 1 ? "You're missing one thing" : `You're missing ${missing.length} things`}</h5>
          <ul>{missing.map((id) => <li key={id}>{pantryItem(id).name}</li>)}</ul>
        </div>
      )}
      {hasIngredients && missing.length === 0 && (
        <div className="ready">
          Everything for this is in.
          {missingOptional.length > 0 && ` Except ${missingOptional.map((id) => pantryItem(id).name.toLowerCase()).join(" and ")}, which is optional.`}
        </div>
      )}
      {hasIngredients && sideIngs.length > 0 && missingSides.length > 0 && (
        <p className="hint" style={{ marginTop: -8 }}>
          No {missingSides.map((id) => pantryItem(id).name.toLowerCase()).join(" or ")} in.
          {sidesIn.length > 0
            ? ` Serve it with ${sidesIn.map((id) => pantryItem(id).name.toLowerCase()).join(" or ")} instead, or on its own — the dish doesn't need them.`
            : " Serve it on its own, or with whatever's in. The dish doesn't need them."}
        </p>
      )}

      {hasIngredients && (
        <>
          <div className="portions">
            <span className="lab">Portions</span>
            <div className="stepper">
              <button onClick={() => setServings(Math.max(1, servings - 1))} disabled={servings <= 1} aria-label="Fewer portions">−</button>
              <span>{servings}</span>
              <button onClick={() => setServings(Math.min(8, servings + 1))} aria-label="More portions">+</button>
            </div>
          </div>
          <p className="hint">
            One portion is one dinner for you.
            {recipe.doubleHint && " Worth cooking at two — the sauce improves overnight and it reheats better than anything else here."}
            {fixedAny && " Amounts in grey don't scale the way the rest do — check the note under each."}
          </p>
        </>
      )}

      <div className="tabs">
        <button data-on={tab === "method" ? 1 : 0} onClick={() => setTab("method")}>Method</button>
        {hasIngredients && <button data-on={tab === "ing" ? 1 : 0} onClick={() => setTab("ing")}>Ingredients</button>}
        {timed && <button data-on={tab === "time" ? 1 : 0} onClick={() => setTab("time")}>Timeline</button>}
      </div>

      {tab === "ing" && (() => {
        const row = (ing) => {
          const s = scaled(ing, mult);
          return (
            <div className="ing" key={ing.id} data-fixed={s.fixed || s.rounded ? 1 : 0}>
              <span className="q">{s.display}
                {s.fixed && <span className="fixnote">doesn't scale</span>}
                {s.rounded && <span className="fixnote">rounded up to a whole one</span>}
              </span>
              <span>{ing.name}</span>
            </div>
          );
        };
        if (sideIngs.length === 0) return <div>{coreIngs.map(row)}</div>;
        return (
          <div>
            <div className="cat" style={{ marginTop: 0 }}>The dish</div>
            {coreIngs.map(row)}
            <div className="cat">To serve — swap or skip</div>
            {sideIngs.map(row)}
            <p className="hint" style={{ marginTop: 10 }}>
              These are what the method was written with. Anything green works, or nothing at all —
              the recipe is cookable without them. How to cook each one is on the Pantry tab.
            </p>
          </div>
        );
      })()}

      {tab === "method" && (
        <>
          <div className="rail">
            {recipe.steps.map((s, i) => (
              <div className="step" key={i} data-warn={s.warn ? 1 : 0}>
                {s.at !== undefined && <div className="when">{fmtOffset(s.at)}</div>}
                <h4>{s.title}</h4>
                <p>{renderBody(s.body, recipe.ingredients, mult)}</p>
                {s.timer && <div className="timer"><Timer mins={s.timer} /></div>}
              </div>
            ))}
          </div>
          <button className="btn" onClick={() => setCooking(true)}>Cook this — one step at a time</button>
        </>
      )}

      {tab === "time" && (
        <>
          <div className="timebox">
            <label htmlFor="eat">What time do you want to eat?</label>
            <input id="eat" type="time" value={eatAt} onChange={(e) => setEatAt(e.target.value)} />
          </div>
          {!start && <p className="hint">Set a time and every step gets a clock time.</p>}
          {start && (
            <div className="rail">
              {recipe.steps.map((s, i) => (
                <div className="step" key={i} data-warn={s.warn ? 1 : 0}>
                  <div className="when">{clockAt(start, s.at ?? 0)}</div>
                  <h4>{s.title}</h4>
                  <p>{renderBody(s.body, recipe.ingredients, mult)}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {recipe.notes?.length > 0 && (
        <div className="panel" style={{ marginTop: 22 }}>
          <h5>Worth knowing</h5>
          <ul>{recipe.notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
        </div>
      )}
    </>
  );
}


function statusOf(recipe, pantry) {
  const { missing } = checkRecipe(recipe, pantry);
  if (missing.length === 0) {
    if (recipe.needsAhead) return { s: "ready", label: "Ready once thawed" };
    return { s: "ready", label: "Ready to cook" };
  }
  const s = missing.length <= 2 ? "near" : "no";
  if (recipe.needsAhead) return { s, label: `Missing ${missing.length} · thaw first` };
  return { s, label: `Missing ${missing.length}` };
}

function PantryPage({ pantry, setPantry, meatState, setMeatState }) {
  const cats = [...new Set(PANTRY.filter((p) => p.defaultState !== "always").map((p) => p.cat))];
  const set = (id, v) => setPantry({ ...pantry, [id]: v });
  const setThaw = (id, v) => setMeatState({ ...meatState, [id]: v });
  const allIn = (cat) => {
    const next = { ...pantry };
    PANTRY.filter((p) => p.cat === cat).forEach((p) => { next[p.id] = "have"; });
    setPantry(next);
  };
  return (
    <>
      <p className="blurb">
        Defaults do most of the work: cupboard and freezer items are assumed present until you
        say otherwise, fresh things are assumed gone until you say you've bought them. You should
        only need to touch this after a shop, or when something runs out.
      </p>
      {cats.map((cat) => (
        <div key={cat}>
          <div className="cat">
            {cat}
            {cat === "Fresh" && (
              <button className="btn sm" data-ghost="1" style={{ marginLeft: 10 }} onClick={() => allIn(cat)}>
                Just shopped — mark all in
              </button>
            )}
          </div>
          {PANTRY.filter((p) => p.cat === cat).map((p) => {
            const st = stateOf(p.id, pantry);
            const thaw = tracksThaw(p.id) ? thawStateOf(p.id, meatState) : null;
            return (
              <React.Fragment key={p.id}>
                <div className="prow">
                  <span className="pn">
                    {p.name}
                    {OPTIONAL.has(p.id) && " (optional in recipes)"}
                    {p.keeps && <span className="pk">{p.keeps}</span>}
                    {p.prep && <span className="pk" style={{ marginTop: 4 }}><b>Cooking it.</b> {p.prep}</span>}
                  </span>
                  <span className="toggle">
                    <button data-on={st === "have" ? 1 : 0} onClick={() => set(p.id, "have")}>In</button>
                    <button data-on={st === "out" ? 1 : 0} data-neg="1" onClick={() => set(p.id, "out")}>Out</button>
                  </span>
                </div>
                {thaw && (
                  <div className="prow" data-sub="1">
                    <span className="pn">Frozen or thawed</span>
                    <span className="toggle">
                      <button data-on={thaw === "frozen" ? 1 : 0} onClick={() => setThaw(p.id, "frozen")}>Frozen</button>
                      <button data-on={thaw === "thawed" ? 1 : 0} onClick={() => setThaw(p.id, "thawed")}>Thawed</button>
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      ))}
    </>
  );
}

function List({ items, filterable, onOpen, method, pantry }) {
  const [filter, setFilter] = useState("All");
  const [readyOnly, setReadyOnly] = useState(false);
  const proteins = ["All", ...Array.from(new Set(items.map((r) => r.protein)))];
  let shown = filter === "All" ? items : items.filter((r) => r.protein === filter);
  if (readyOnly) shown = shown.filter((r) => checkRecipe(r, pantry).canCook && !r.needsAhead);
  return (
    <>
      {filterable && (
        <div className="filters">
          <button className="chip" data-on={readyOnly ? 1 : 0} onClick={() => setReadyOnly(!readyOnly)}>
            Can cook now
          </button>
          {proteins.map((p) => (
            <button key={p} className="chip" data-on={filter === p ? 1 : 0} onClick={() => setFilter(p)}>{p}</button>
          ))}
        </div>
      )}
      {readyOnly && shown.length === 0 && (
        <p className="hint">Nothing is cookable right now. "Can cook now" hides anything that needs thawing first, as well as anything the pantry says you're short of.</p>
      )}
      {shown.map((r) => (
        <button className="row" key={r.id} data-method={method ? 1 : 0} onClick={() => onOpen(r.id)}>
          <div className="clock">{r.totalMins}<small>MINS</small></div>
          <div style={{ flex: 1 }}>
            <h3>{r.name}</h3>
            <p>{r.subtitle}</p>
            <div className="tagline">
              <span className="status" data-s={statusOf(r, pantry).s}>{statusOf(r, pantry).label}</span>
              <span className="tag">{r.effort} effort</span>
              {r.fromFrozen && <span className="tag">Cooks from frozen</span>}
              {r.doubleHint && <span className="tag">Worth doubling</span>}
            </div>
          </div>
        </button>
      ))}
    </>
  );
}

export default function RecipeBook() {
  const [section, setSection] = useState("dinners");
  const [open, setOpen] = useState(null);
  const [servingsMap, setServingsMap] = useState({});
  const [pantry, setPantryState] = useState({});
  const [meatState, setMeatStateRaw] = useState({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await store.get("recipe-servings");
      if (raw) { try { setServingsMap(JSON.parse(raw)); } catch { /* corrupt, ignore */ } }
      const praw = await store.get("pantry-state");
      if (praw) { try { setPantryState(JSON.parse(praw)); } catch { /* corrupt, ignore */ } }
      const mraw = await store.get("meat-state");
      if (mraw) { try { setMeatStateRaw(JSON.parse(mraw)); } catch { /* corrupt, ignore */ } }
      setLoaded(true);
    })();
  }, []);

  const setServings = (id, n) => {
    const next = { ...servingsMap, [id]: n };
    setServingsMap(next);
    store.set("recipe-servings", JSON.stringify(next));
  };

  const setPantry = (next) => {
    setPantryState(next);
    store.set("pantry-state", JSON.stringify(next));
  };

  const setMeatState = (next) => {
    setMeatStateRaw(next);
    store.set("meat-state", JSON.stringify(next));
  };

  const all = [...DINNERS, ...COMPONENTS];
  const recipe = all.find((r) => r.id === open);
  const go = (s) => { setSection(s); setOpen(null); };

  return (
    <div className="rb">
      <style>{CSS}</style>
      <div className="wrap">
        {!recipe && (
          <>
            <div className="masthead"><h1>What's for dinner</h1></div>
            <div className="nav">
              <button data-on={section === "dinners" ? 1 : 0} onClick={() => go("dinners")}>Dinners</button>
              <button data-on={section === "components" ? 1 : 0} onClick={() => go("components")}>Components</button>
              <button data-on={section === "pantry" ? 1 : 0} onClick={() => go("pantry")}>Pantry</button>
              <button data-on={section === "kitchen" ? 1 : 0} onClick={() => go("kitchen")}>Kitchen</button>
              <button data-on={section === "howto" ? 1 : 0} onClick={() => go("howto")}>How to</button>
            </div>

            {section === "dinners" && (
              <>
                <p className="blurb">Complete meals, greens included. Portions are for one unless you change them.</p>
                <List items={DINNERS} filterable onOpen={setOpen} pantry={pantry} />
              </>
            )}

            {section === "components" && (
              <>
                <p className="blurb">Building blocks rather than dinners. The greens go with everything; the glazes swap onto any roast.</p>
                <List items={COMPONENTS} onOpen={setOpen} method pantry={pantry} />
              </>
            )}

            {section === "pantry" && (
              <PantryPage pantry={pantry} setPantry={setPantry} meatState={meatState} setMeatState={setMeatState} />
            )}

            {section === "kitchen" && (
              <>
                <p className="blurb">The constraints every recipe here is written around.</p>
                <div className="panel">
                  <h5>This kitchen</h5>
                  <dl>{KITCHEN.map(([k, v], i) => <React.Fragment key={i}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>
                </div>
                <div className="panel">
                  <h5>Where things live</h5>
                  <dl>{STORAGE.map(([k, v], i) => <React.Fragment key={i}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>
                </div>
                <div className="panel">
                  <h5>Things that didn't work</h5>
                  <ul>{WONT_WORK.map((w, i) => <li key={i}>{w}</li>)}</ul>
                </div>
              </>
            )}

            {section === "howto" && (
              <>
                <p className="blurb">Short answers to the things that come up again and again.</p>
                <div className="panel">
                  <dl>{HOWTO.map(([k, v], i) => <React.Fragment key={i}><dt>{k}</dt><dd>{v}</dd></React.Fragment>)}</dl>
                </div>
              </>
            )}
          </>
        )}

        {recipe && loaded && (
          <Detail
            recipe={recipe}
            onBack={() => setOpen(null)}
            servings={servingsMap[recipe.id] || recipe.servingsBase}
            setServings={(n) => setServings(recipe.id, n)}
            pantry={pantry}
          />
        )}
      </div>
    </div>
  );
}
