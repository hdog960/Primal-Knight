// Alpha 0.11.5 — real cost-aware, one-tap War Council Quartermaster.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
function world(seedValue=1155){
 let seed=seedValue>>>0;
 const random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';
   this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;
   this.width=960;this.height=540;this.scrollTop=0;this.listeners={};
   this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},
   {get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(name,fn){this.listeners[name]=fn;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const storage=Object.create(null);
 const sandbox={Math:random,Image,Date,Blob,console,confirm(){return true;},
  window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
  localStorage:{getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=String(v);},removeItem(k){delete storage[k];}},
  performance:{now:()=>1000},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 assert(sandbox.window.__PK_TEST_TOOLS__,'Real game exports Quartermaster hooks');
 return {h:sandbox.window.__PK_TEST_TOOLS__,el,storage};
}
const {h,el,storage}=world(),p=h.p(),r=h.run();
const startEssence=p.essence,startGold=p.gold,startSigils=p.sigils;
const originalItems=JSON.stringify(p.inventory),originalRunes=JSON.stringify(p.runes);
assert.equal(p.level,1,'New characters begin level 1');
assert.equal(startEssence,180,'New characters own the original Essence starter budget');
const first=h.councilTrainingOffers(h.warCouncilPlan(1,1));
assert.equal(first.length,3,'Three original permanent training lines are visible');
assert.equal(new Set(first.map(o=>o.id)).size,3,'No repeated upgrade cards');
assert.equal(first[0].id,'power','Earned First Watch evidence favors Might as the first available investment');
assert.equal(first[0].cost,8,'Might cost comes from the live Training formula');
assert(first.every(o=>o.affordable),'Starter budget supports each available first rank');
const shields=h.councilTrainingOffers(h.warCouncilPlan(2,20));
assert.equal(shields[0].id,'power','Shielded formation favors attack investment');
const casters=h.councilTrainingOffers(h.warCouncilPlan(3,20));
assert.equal(casters[0].id,'haste','Spell support emphasizes attack tempo');
let markup=h.renderWarCouncil(1,1);
assert(markup.includes('THE FIELD QUARTERMASTER'),'The live War Council includes the permanent training interface');
assert(markup.includes('data-council-train="fort"'),'Button directs a real Fortitude upgrade');
assert(markup.includes('data-council-train="power"'),'Button directs a real Might upgrade');
assert(markup.includes('data-council-train="haste"'),'Button directs a real Reflexes upgrade');
assert(markup.includes('TRAIN · 8 ESSENCE'),'Displayed cost matches the real Power purchase cost');
h.renderTierLobby();
assert(el('milestoneList').innerHTML.includes('THE FIELD QUARTERMASTER'),'Real Battle lobby displays Quartermaster cards');
const clickHandler=el('milestoneList').listeners.click;
assert.equal(typeof clickHandler,'function','Actual touch click handler is registered');
el('milestoneList').scrollTop=154;
const fakeButton={disabled:false,dataset:{councilTrain:'fort'}};
clickHandler({target:{closest(selector){
 if(selector==='[data-council-train]')return fakeButton;
 return null;
}}});
assert.equal(p.training.fort,1,'A real Battle-lobby tap buys precisely one permanent Fortitude rank');
assert.equal(p.essence,startEssence-10,'The exact quoted Hero Essence cost is deducted once');
assert.equal(p.gold,startGold,'Training never consumes Gold');
assert.equal(p.sigils,startSigils,'Training never consumes finite Sigils');
assert.equal(JSON.stringify(p.inventory),originalItems,'Existing equipped/owned items survive');
assert.equal(JSON.stringify(p.runes),originalRunes,'Rune ownership and sockets survive');
assert.equal(el('milestoneList').scrollTop,154,'Long mobile lobby retains scroll position after training');
assert.equal(h.councilTrainingOffers(h.warCouncilPlan(1,1)).find(o=>o.id==='fort').rank,1,
 'The new rank appears immediately in the pre-siege interface');
assert.equal(JSON.parse(storage.primal_knight_onslaught_save_v1).training.fort,1,
 'Real click persists rank under the unchanged iPhone local save key');
const oldHealth=r.maxHealth;
assert.equal(r.maxHealth,h.maxWall(),'Wall maximum is recalculated after the new Fortitude rank');
assert.equal(h.purchaseCouncilTraining('power'),true,'A separate valid offensive upgrade also works');
assert.equal(p.training.power,1,'Might rank increases exactly once');
assert.equal(h.purchaseCouncilTraining('haste'),true,'A separate valid attack-tempo upgrade also works');
assert.equal(p.training.haste,1,'Reflexes rank increases exactly once');
assert(r.maxHealth>=oldHealth,'Training cannot lower the fortress maximum');
const snapshot=JSON.stringify({training:p.training,essence:p.essence,equipped:p.equipped});
assert.equal(h.purchaseCouncilTraining('fortune'),false,'Arbitrary training IDs cannot be purchased');
assert.equal(h.purchaseCouncilTraining('__proto__'),false,'Unsafe forged training IDs are rejected');
assert.equal(JSON.stringify({training:p.training,essence:p.essence,equipped:p.equipped}),snapshot,
 'Rejected requests make no save or currency changes');
p.essence=0;
assert.equal(h.purchaseCouncilTraining('fort'),false,'No upgrade if Hero Essence is insufficient');
assert(h.renderWarCouncil(1,1).includes('NEED '),'The visible button explains an unaffordable upgrade');
p.essence=100000;
p.training.fort=1000;
assert.equal(h.purchaseCouncilTraining('fort'),false,'Hard training cap never overflows');
assert(h.renderWarCouncil(1,1).includes('MAX RANK'),'A capped upgrade is not offered for purchase');
p.training.fort=1;
r.phase='fighting';
const beforeFighting=JSON.stringify({training:p.training,essence:p.essence});
assert.equal(h.purchaseCouncilTraining('fort'),false,'Pre-siege Quartermaster cannot purchase during a battle');
assert.equal(JSON.stringify({training:p.training,essence:p.essence}),beforeFighting,
 'No extra healing or free rank can be gained through a forged mid-battle click');
r.phase='intermission';
assert.equal(h.purchaseCouncilTraining('fort'),false,'Between-wave waits cannot bypass purchase restriction');
assert(html.includes('ALPHA 0.12.12')&&html.includes('style.css?v=0.12.12')&&html.includes('game.js?v=0.12.12'),
 'iPhone web assets and release banner display latest version');
assert(css.includes('.war-quartermaster-grid')&&css.includes('min-height:44px'),
 'Original art-consistent Quartermaster cards have large touch targets');
assert(css.includes('@media(max-width:750px)')||css.includes('@media(max-width:750px),'),
 'Mobile-first layout remains responsive');
console.log('PASS: Alpha 0.11.5 real touch-driven Quartermaster upgrade, exact live prices, new-save persistence, rank caps, affordability, active-siege refusal, no duplicate items, mobile sizing and unchanged currency economy.');
