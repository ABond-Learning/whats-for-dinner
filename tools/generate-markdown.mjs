import fs from 'fs';
import { DINNERS, COMPONENTS, KITCHEN, STORAGE, WONT_WORK } from '../data/recipes.js';
const FR={0.25:"¼",0.5:"½",0.75:"¾"};
const fmt=n=>{if(n===0)return"";const w=Math.floor(n),r=Math.round((n-w)*100)/100,f=FR[r];
 if(f)return w?`${w}${f}`:f; if(n<10)return String(Math.round(n*100)/100); return String(Math.round(n));};
const off=m=>`${m<0?'−':''}${Math.floor(Math.abs(m)/60)}:${String(Math.abs(m)%60).padStart(2,'0')}`;

const body=(t,ings)=>t.replace(/\{([a-z]+)\}/g,(_,id)=>{
  const i=ings.find(x=>x.id===id); if(!i) return _;
  return `**${[fmt(i.qty),i.unit].filter(Boolean).join(' ').trim()} ${i.name}**`;
});

function recipe(r){
  let o=`## ${r.name}\n\n${r.subtitle}\n\n`;
  o+=`*${r.totalMins} minutes · ${r.effort} effort · one portion`;
  if(r.fromFrozen) o+=' · cooks from frozen';
  o+=`*\n\n`;
  if(!r.confirmed) o+=`> **Not cooked yet.** ${r.untestedNote||"Adapted from the manufacturer's own recipe, not tested in your kitchen."}\n\n`;
  if(r.ingredients.length){
    o+=`### Ingredients\n\n`;
    for(const i of r.ingredients){
      const q=[fmt(i.qty),i.unit].filter(Boolean).join(' ').trim();
      let note='';
      if(i.scale===false) note=' *(doesn\'t scale with portions)*';
      if(i.roundUp) note=' *(round up to a whole one)*';
      o+=`- ${q} ${i.name}${note}\n`;
    }
    o+=`\n`;
  }
  o+=`### Method\n\n`;
  for(const s of r.steps){
    const when=s.at!==undefined?`**${off(s.at)}** — `:'';
    o+=`${when}**${s.title}.** ${body(s.body,r.ingredients)}`;
    if(s.warn) o+=` ⚠️`;
    o+=`\n\n`;
  }
  if(r.notes?.length){
    o+=`### Worth knowing\n\n`;
    for(const n of r.notes) o+=`- ${n}\n`;
    o+=`\n`;
  }
  return o+`---\n\n`;
}

let md=`# Recipe Book\n\n`;
md+=`Generated from the recipe app on ${new Date().toISOString().slice(0,10)}. Don't hand-edit this file — change the app data and regenerate, or the two will drift apart.\n\n`;
md+=`Every recipe is one portion: one dinner for one person. UK units throughout. ⚠️ marks a step where something burns, catches or overcooks if you get it wrong.\n\n---\n\n`;
md+=`# Dinners\n\nComplete meals, greens included.\n\n---\n\n`;
for(const r of DINNERS) md+=recipe(r);
md+=`# Components\n\nBuilding blocks rather than dinners.\n\n---\n\n`;
for(const r of COMPONENTS) md+=recipe(r);
md+=`# This kitchen\n\n`;
for(const [k,v] of KITCHEN) md+=`**${k}.** ${v}\n\n`;
md+=`---\n\n# Where things live\n\n`;
for(const [k,v] of STORAGE) md+=`**${k}.** ${v}\n\n`;
md+=`---\n\n# Things that didn't work\n\n`;
for(const w of WONT_WORK) md+=`- ${w}\n`;
md+=`\n`;
fs.writeFileSync('recipes.md',md);
console.log('written, bytes:',md.length);
