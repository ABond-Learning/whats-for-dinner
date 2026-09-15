// The pantry catalogue: every distinct thing a recipe can call for.
//
// The point of `defaultState` is that the pantry should be roughly right
// WITHOUT you maintaining it. A pantry you have to keep updating goes stale,
// and a stale pantry is worse than none — it tells you you can cook something
// when you can't.
//
//   "have"    Long shelf life. Assume it's there until you say otherwise.
//             Cupboard staples, freezer stock, condiments.
//   "out"     Perishable. Assume it's gone until you say you've bought it.
//             Fresh greens, fresh meat, lemons.
//   "always"  Never counts as missing and never appears in a shopping list.
//             Water, salt, pepper.
//
// `keeps` is a human note shown in the pantry list — it's the reason the
// default is what it is, so future-you can argue with it.

export const PANTRY = [
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
  { id: "cream", name: "Double cream", cat: "Fresh", defaultState: "out", keeps: "About a week in the fridge once opened." },

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
  { id: "parmesan", name: "Parmesan", cat: "Fridge", defaultState: "out", keeps: "Weeks in the fridge, wrapped." },
  { id: "anchovies", name: "Anchovies", cat: "Fridge", defaultState: "have", keeps: "About two weeks once opened, kept under their oil." },
];

// Maps every ingredient name used in data/recipes.js to a catalogue id.
// tools/audit.mjs fails the build if a recipe uses a name that isn't here.
export const INGREDIENT_MAP = {
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
  "double cream": "cream",
  "parmesan, finely grated": "parmesan",
  "anchovy fillets": "anchovies",
  "water": "water",
  "water, for the greens": "water",
  "water, for the sauce": "water",
};

// Ingredients whose absence shouldn't stop you cooking.
export const OPTIONAL = new Set(["sultanas", "fz-spinach", "sesameoil"]);

// Accompaniments, not the dish. Greens are what these recipes happen to have
// been written with, but the dish stands without them — so their absence must
// never make a recipe read as uncookable. Serve with whatever's in, or nothing.
export const SIDES = new Set(["tenderstem", "pakchoi", "fz-cauli"]);

export const isSide = (id) => SIDES.has(id);

export const pantryItem = (id) => PANTRY.find((p) => p.id === id);

// Which catalogue ids a recipe needs, ignoring water/salt/pepper.
export function recipeNeeds(recipe) {
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

// state: { [id]: "have" | "out" }. Anything absent falls back to the default.
export function stateOf(id, state) {
  if (state && state[id]) return state[id];
  const item = pantryItem(id);
  return item ? item.defaultState : "have";
}

// Whether a catalogue item tracks frozen/thawed at all — only the meat that
// cooks differently in each state does.
export const tracksThaw = (id) => !!pantryItem(id)?.thawState;

// meatState: { [id]: "frozen" | "thawed" }. Anything absent falls back to
// the catalogue default (frozen). Returns null for items that don't track it.
export function thawStateOf(id, meatState) {
  if (meatState && meatState[id]) return meatState[id];
  const item = pantryItem(id);
  return item?.thawState ?? null;
}

export function checkRecipe(recipe, state) {
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
