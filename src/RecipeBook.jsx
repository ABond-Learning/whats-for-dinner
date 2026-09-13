import React, { useState, useEffect, useMemo, useRef } from "react";
import { DINNERS, COMPONENTS, KITCHEN, STORAGE, WONT_WORK, HOWTO } from "../data/recipes.js";
import { PANTRY, pantryItem, checkRecipe, stateOf, OPTIONAL, SIDES, INGREDIENT_MAP } from "../data/pantry.js";


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

function PantryPage({ pantry, setPantry }) {
  const cats = [...new Set(PANTRY.filter((p) => p.defaultState !== "always").map((p) => p.cat))];
  const set = (id, v) => setPantry({ ...pantry, [id]: v });
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
            return (
              <div className="prow" key={p.id}>
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
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const raw = await store.get("recipe-servings");
      if (raw) { try { setServingsMap(JSON.parse(raw)); } catch { /* corrupt, ignore */ } }
      const praw = await store.get("pantry-state");
      if (praw) { try { setPantryState(JSON.parse(praw)); } catch { /* corrupt, ignore */ } }
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

            {section === "pantry" && <PantryPage pantry={pantry} setPantry={setPantry} />}

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
