// Alpha 0.15.21 — real earned plan-at-siege evidence and safe legacy normalization.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8'),SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,f){this.listeners[k]=f;}querySelectorAll(){return [];}querySelector(){return null;}
}
function world(seed0=1521,source){
 let seed=seed0>>>0,rand=Object.create(Math);rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.assign(Object.create(null),source||{});
 const box={Math:rand,Date,Image,Blob,console,confirm(){return true;},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[];},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
  performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(game,box,{filename:'game.js'});
 assert(box.window.__PK_TEST_TOOLS__);
 return {h:box.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.21')&&css.includes('.battle-plan-ledger'));
const old=world(),h=old.h,p=h.p();
assert.equal(h.battlePlanLedger(1),null);
const illegal=h.normalizeSiegeHistory([{id:1,reason:'fallen',tier:1,startWave:1,lastWave:3,cleared:2,
 battlePlan:'forged',wavePressureTracked:true,wavePressureSamples:[{wave:3,outcome:'fallen'}]}])[0];
assert(illegal&&illegal.battlePlan===null);
p.siegeHistory=[illegal];assert.equal(h.battlePlanLedger(1),null);
const legacy=h.normalizeSiegeHistory([{id:2,reason:'fallen',tier:1,startWave:1,lastWave:4,cleared:3}])[0];
assert.equal(legacy.battlePlan,null);
p.siegeHistory=[legacy];assert.equal(h.renderBattlePlanLedger(1),'');
const before=JSON.stringify(p);h.renderTierLobby();assert.equal(JSON.stringify(p),before);
const results=[];
for(const seed of [15411,15423]){
 const w=world(seed),t=w.h,c=t.p(),r=t.run();
 for(let i=0;i<6;i++)assert(t.purchaseCouncilTraining('power'),'Paid original Might rank');
 assert(t.applySiegePlan('vanguard'));assert(t.enterSiege());
 assert.equal(r.battlePlan,'vanguard');
 assert.equal(t.applySiegePlan('bastion'),false);
 let ticks=0;
 while(r.phase!=='fallen'&&r.phase!=='completed'&&r.wavesCleared<8&&ticks<95000){
  t.tick(.05);ticks++;
  assert(r.enemies.length<=24&&r.shots.length<=48);
 }
 assert(ticks<95000&&r.wavesCleared>=6);
 if(r.phase!=='fallen'&&r.phase!=='completed')t.retreatFromSiege();
 assert(c.level>=5,'Earned Guardian level during original combat');
 const first=c.siegeHistory[0];
 assert.equal(first.battlePlan,'vanguard');
 assert.equal(first.earned.firstClears,r.wavesCleared);
 assert(first.wavePressureTracked);
 const report=t.battlePlanLedger(1);
 assert(report&&report.records.length===1&&report.records[0].name==='ARROWSTORM ADVANCE');
 assert.equal(report.records[0].lastClearedWave,first.startWave+first.cleared-1);
 assert.equal(t.battlePlanLedger(2),null,'Locked tier should be hidden');
 const oldRecord=JSON.stringify(c);t.renderBattlePlanLedger(1);assert.equal(JSON.stringify(c),oldRecord);
 assert(t.applySiegePlan('bastion'));assert(t.enterSiege());assert.equal(r.battlePlan,'bastion');
 let count=0;while(r.phase!=='fallen'&&r.phase!=='completed'&&r.wavesCleared<4&&count<95000){t.tick(.05);count++;}
 assert(count<95000&&r.wavesCleared>=1);
 if(r.phase!=='fallen'&&r.phase!=='completed')t.retreatFromSiege();
 assert.equal(c.siegeHistory[0].battlePlan,'bastion');assert.equal(c.siegeHistory[1].battlePlan,'vanguard');
 assert.equal(t.battlePlanLedger(1).records.length,2);
 t.renderTierLobby();assert(w.el('milestoneList').innerHTML.includes('BATTLE PLAN FIELD LEDGER'));
 assert(t.save());
 const again=world(seed,{[SAVE]:w.store[SAVE],[t.focusStanceKey]:w.store[t.focusStanceKey]});
 assert.equal(again.h.battlePlanLedger(1).records.length,2);
 assert.equal(again.h.p().uniqueClears,c.uniqueClears);
 assert.equal(again.h.p().sigils,c.sigils);
 assert(!Object.hasOwn(JSON.parse(w.store[SAVE]),'battlePlan'),'No top-level save field');
 results.push({seed,earnedLevel:c.level,realFirstClears:c.uniqueClears,siegePlanRows:2});
}
console.log('PASS Alpha 0.15.21: '+JSON.stringify(results));
