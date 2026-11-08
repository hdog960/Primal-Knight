// Alpha 0.15.24 — earned frontier quick travel and lawful outer-tier gates.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8'),SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,f){this.listeners[k]=f;}querySelectorAll(){return [];}querySelector(){return null;}
}
function world(seed0=1522,source){
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
assert(html.includes('ALPHA 0.15.24')&&html.includes('id="frontierNav"'));
assert(css.includes('.outer-frontier-actions button{')&&css.includes('min-height:64px'));
assert(css.includes('@media(max-width:760px){.outer-frontier-actions{grid-template-columns:1fr}}'));
function click(w,tier){
 const b={disabled:false,dataset:{frontierJump:String(tier)}};
 w.el('frontierNav').listeners.click({target:{closest(s){return s==='[data-frontier-jump]'?b:null;}}});
}
function spendSkills(h){
 const p=h.p();let steps=0;
 while(p.points>0&&steps<25){
  const id=['aim','quiver','stone','ward','focus'].find(key=>(p.skills[key]||0)<5);
  if(!id)break;
  h.action('skill:'+id);steps++;
 }
}
function spendCombat(h){
 const p=h.p();
 if((p.stations.ballista||0)<2&&p.gold>=135)h.action('station:ballista');
 if((p.research.calibration||0)<2&&p.knowledge>=36)h.action('research:calibration');
 for(let i=0;i<12;i++){
  const offers=h.councilTrainingOffers(h.warCouncilPlan(1,1));
  const affordable=['power','power','haste','fort'].map(id=>offers.find(o=>o.id===id&&o.affordable)).find(Boolean);
  if(!affordable)break;
  const old=p.essence,rank=p.training[affordable.id]||0;
  assert(h.purchaseCouncilTraining(affordable.id));
  assert.equal(p.essence,old-affordable.cost);assert.equal(p.training[affordable.id],rank+1);
 }
 assert(h.save());
}
function siege(h){
 const p=h.p(),r=h.run(),prior=p.battleSeconds;
 assert(h.enterSiege());
 let ticks=0;
 while(r.phase!=='fallen'&&r.phase!=='completed'&&r.wavesCleared<35&&ticks<105000){
  if(r.phase==='intermission'&&p.points>0)spendSkills(h);
  h.tick(.05);ticks++;
  assert(r.enemies.length<=24&&r.shots.length<=48);
 }
 assert(ticks<105000);
 if(r.phase!=='fallen'&&r.phase!=='completed')h.retreatFromSiege();
 assert(p.battleSeconds>prior);
 assert.equal(p.uniqueClears,Object.values(p.bestByTier).reduce((n,v)=>n+Math.max(0,Number(v)||0),0));
 assert.equal(p.sigils,h.sigilLedgerSummary().claimed+h.sigilLedgerSummary().earnedWatch);
}
const fresh=world(15411),h=fresh.h,p=h.p(),atStart=JSON.stringify(p);
assert.equal(h.outerFrontierTargets().unlocked,1);
assert.equal(h.outerFrontierTargets().gate,20);
assert.equal(h.outerFrontierTargets().latest.tier,1);
assert.equal(h.outerFrontierTargets().least,null);
assert(h.renderOuterFrontierNavigator().includes('Clear Tier I wave 20'));
assert.equal(h.selectFrontierTier(2),false,'Locked Tier II still inaccessible');
h.renderTierLobby();
assert(fresh.el('frontierNav').innerHTML.includes('FRONTIER MARCH'));
assert.equal(JSON.stringify(p),atStart,'Read-only frontier banner cannot grant upgrades or saves');
for(let n=1;n<=10&&p.unlockedTier<2;n++){
 spendSkills(h);spendCombat(h);spendSkills(h);siege(h);
}
assert(p.unlockedTier>=2&&p.milestones['1:20'],'Original engine earned Tier II through real wave-20 clear');
assert(p.bestByTier[1]>=20);
assert.equal(h.outerFrontierTargets().latest.tier,p.unlockedTier);
assert.equal(h.outerFrontierTargets().least.tier,1);
const before={currencies:[p.gold,p.essence,p.knowledge,p.sigils],clears:p.uniqueClears,time:p.battleSeconds};
h.renderTierLobby();click(fresh,2);
assert.equal(p.selectedTier,2,'Actual quick-travel tap selected only earned territory');
assert.equal(JSON.parse(fresh.store[SAVE]).selectedTier,2,'Original protected save persisted selection');
assert.deepEqual([p.gold,p.essence,p.knowledge,p.sigils],before.currencies);
assert.equal(p.uniqueClears,before.clears);assert.equal(p.battleSeconds,before.time);
const reloaded=world(15412,{[SAVE]:fresh.store[SAVE]});
assert.equal(reloaded.h.p().selectedTier,2);
assert.equal(reloaded.h.p().unlockedTier,p.unlockedTier);
const priorTier=p.selectedTier;click(fresh,30);
assert.equal(p.selectedTier,priorTier,'Unauthorized Tier XXX never becomes selectable');
assert(!Object.hasOwn(p,'frontierMarch'),'No extra character-save schema');
const synthetic=world(15413),sh=synthetic.h,sp=sh.p();
sp.unlockedTier=17;sp.bestByTier={1:30,2:40,3:15,16:20,17:4};
sp.battleSeconds=322*60;sp.uniqueClears=421;
sp.firstWatchClaimed=Array.from({length:11},(_,i)=>i);
const snap=JSON.stringify(sp),outer=sh.outerFrontierTargets();
assert.equal(outer.latest.tier,17);assert.equal(outer.gate,100);
assert.equal(outer.remaining,96);assert.equal(outer.watch.uniqueNeeded,62);
assert(sh.renderOuterFrontierNavigator().includes('WAVE 100'));
assert(sh.renderOuterFrontierNavigator().includes('62 MORE DISTINCT CLEARS'));
assert.equal(JSON.stringify(sp),snap,'Synthetic outer-tier UI fixture is read-only, not genuine combat');
const savedBefore=p.selectedTier;
const foreign=JSON.parse(fresh.store[SAVE]);foreign.gold+=7;fresh.store[SAVE]=JSON.stringify(foreign);
click(fresh,1);assert.equal(p.selectedTier,savedBefore,'External-tab conflict blocks actual navigation');
assert.equal(h.saveWriteBlocked(),true);
console.log('PASS Alpha 0.15.24: original earned Tier II unlock and direct saved quick travel, dynamic real outer-wave-100 and Watch gating, read-only invalid/custom tier handling, mobile buttons, safe conflict rejection');
console.log('LIMIT: Tier XVII fixture tests UI math only. Real deep-tier character advancement is separately tested from genuinely earned seed-15423 post-86 checkpoint in first-watch-siege-pressure.');
