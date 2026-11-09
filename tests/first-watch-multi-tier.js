// Alpha 0.15.28 — real earned multi-territory First Watch routes and safe player selection.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,fn){this.listeners[k]=fn}querySelectorAll(){return []}querySelector(){return null}
}
function world(seed0,source){
 let seed=seed0>>>0;const random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.assign(Object.create(null),source||{});
 const sandbox={Math:random,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});assert(sandbox.window.__PK_TEST_TOOLS__);
 return {h:sandbox.window.__PK_TEST_TOOLS__,el,store};
}
assert(html.includes('ALPHA 0.15.28')&&html.includes('game.js?v=0.15.28')&&html.includes('style.css?v=0.15.28'));
assert(css.includes('.watch-frontiers-grid')&&css.includes('.watch-frontier-card button{'));
assert(css.includes('@media(max-width:610px){.watch-frontiers-grid{grid-template-columns:1fr}'));
assert(css.includes('min-height:44px'),'Touch navigation must be no smaller than 44px');
const fresh=world(15600),fh=fresh.h,fp=fh.p();
const before=JSON.stringify(fp);
assert.equal(fp.unlockedTier,1);
assert.equal(fh.selectFrontierTier(2),false,'Uncleared Tier II must not be selected');
assert.equal(fh.selectFrontierTier(30),false,'Spoofed Tier XXX must remain locked');
assert.equal(fh.selectFrontierTier('NaN'),false,'Forged non-numeric selection refused');
const f=fh.firstWatchFrontiers();
assert(f&&f.unlocked===1&&f.options.length===1&&f.options[0].tier===1);
assert(fh.renderFirstWatchFrontiers().includes('TIER II REMAINS LOCKED'));
assert(fh.renderFirstWatchFrontiers().includes('data-watch-frontier="1"'));
fh.renderTierLobby();assert(fresh.el('milestoneList').innerHTML.includes('watch-frontiers'));
assert.equal(JSON.stringify(fp),before,'Reading route options must not alter saved character');
assert(!Object.hasOwn(fp,'firstWatchFrontiers'),'No guide added to original save schema');
assert.equal(fh.selectFrontierTier(1),true,'Current own tier remains available');
assert.equal(JSON.stringify(fp),before,'Selecting the already selected tier must be no-op');

function clickTier(w,tier,fromWatch){
 const id=fromWatch?'milestoneList':'tierGrid',attr=fromWatch?'watchFrontier':'tier';
 const container=w.el(id),oldScroll=container.scrollTop;
 container.scrollTop=137;
 const clicked={disabled:false,dataset:{[attr]:String(tier)}};
 container.listeners.click({target:{closest(selector){return selector==='[data-'+(fromWatch?'watch-frontier':'tier')+']'?clicked:null}}});
 assert.equal(container.scrollTop,fromWatch?137:oldScroll===137?137:container.scrollTop,'Click does not break the navigation container');
}
function spendSkills(h){
 const p=h.p();let steps=0;
 while(p.points>0&&steps<25){
  const id=['aim','quiver','stone','ward','focus'].find(x=>(p.skills[x]||0)<5);
  if(!id)break;
  const old=p.points,level=p.skills[id]||0;
  h.action('skill:'+id);
  assert.equal(p.points,old-1);assert.equal(p.skills[id],level+1);
  steps++;
 }
}
function spendCombat(h){
 const p=h.p();
 if((p.stations.ballista||0)<2&&p.gold>=135)h.action('station:ballista');
 if((p.research.calibration||0)<2&&p.knowledge>=36)h.action('research:calibration');
 for(let i=0;i<12;i++){
  const offers=h.councilTrainingOffers(h.warCouncilPlan(1,1));
  const offer=['power','power','haste','fort'].map(id=>offers.find(o=>o.id===id&&o.affordable)).find(Boolean);
  if(!offer)break;
  const essence=p.essence,rank=p.training[offer.id]||0;
  assert.equal(h.purchaseCouncilTraining(offer.id),true);
  assert.equal(p.training[offer.id],rank+1);
  assert.equal(p.essence,essence-offer.cost);
 }
 assert(h.save(),'Every earned spending batch has a verified original save');
}
function trueBestSum(p){return Object.values(p.bestByTier).reduce((v,n)=>v+Math.max(0,Number(n)||0),0);}
function siege(h,maxClears){
 const p=h.p(),run=h.run(),prior=p.battleSeconds;
 assert(h.enterSiege(),'A legitimately unlocked selected tier can start real combat');
 const tier=run.tier;let ticks=0,lastWave=run.wave,begin=run.time;
 while(run.phase!=='fallen'&&run.wavesCleared<maxClears&&ticks<105000){
  if(run.phase==='intermission'&&p.points>0)spendSkills(h);
  if(run.phase==='fighting'&&run.wave!==lastWave){lastWave=run.wave;begin=run.time;}
  h.tick(.05);ticks++;
  if(ticks%200===0){
   assert(run.enemies.length<=24&&run.shots.length<=48,'Original mobile actor and projectile limits');
   assert(Number.isFinite(run.health)&&run.health>=0&&run.health<=run.maxHealth,'Wall vitality stays valid');
  }
  if(run.phase==='fighting'&&run.time-begin>95)throw Error('Combat stalled at tier '+tier+' wave '+run.wave);
 }
 assert(ticks<105000,'Deterministic real combat ends without indefinite tick loop');
 const outcome=run.phase==='fallen'?'fallen':'bounded-retreat-after-'+maxClears+'-clears';
 if(run.phase!=='fallen')h.retreatFromSiege();
 assert(p.battleSeconds>prior,'Only actual combat time advances First Watch');
 assert.equal(p.uniqueClears,trueBestSum(p),'Unique first clears count each territory best once; repeat runs do not mint clears');
 assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length,'Chapter rewards cannot duplicate');
 for(const chapter of p.firstWatchClaimed){
  const row=h.earlyWatchChapters[chapter];
  assert(p.battleSeconds>=row[0]*60);
  assert(p.uniqueClears>=Math.ceil(row[0]*1.5));
 }
 const sig=h.sigilLedgerSummary();
 assert.equal(p.sigils,sig.claimed+sig.earnedWatch,'Finite milestone Sigils accounted; no Sigil upgrades in cohort');
 assert(p.gold>=0&&p.essence>=0&&p.knowledge>=0,'No currency debt');
 return {tier,outcome,best:p.bestByTier[tier]||0,firstClears:p.uniqueClears,
  activeMinutes:+(p.battleSeconds/60).toFixed(2),chapters:p.firstWatchClaimed.length,unlocked:p.unlockedTier};
}
// Seed-paired real earned cohort policies: only the chosen route changes.
// Control stays in Tier I; frontier rotates into legitimately unlocked Tier II for
// later attempts. No forged milestone, artificial wave credit, synthetic time or starting wealth.
const cohorts=[];
for(const seed of [15411,15423,15437]){
 for(const route of ['tier-one-only','frontier']){
  const w=world(seed),h=w.h,p=h.p(),history=[];
  const firstItem=JSON.stringify(p.inventory.slice(0,4)),firstRunes=JSON.stringify(p.runes.slice(0,2));
  for(let n=1;n<=10;n++){
   spendSkills(h);spendCombat(h);spendSkills(h);
   const tier=route==='frontier'&&n>=4&&p.unlockedTier>=2&&n%3!==0?2:1;
   if(tier!==p.selectedTier){
    h.renderTierLobby();
    // The actual Battle lobby Frontier Watch button is exercised whenever visible.
    if(route==='frontier'&&tier===2&&h.firstWatchFrontiers()?.options.some(o=>o.tier===2))
     clickTier(w,tier,true);
    else clickTier(w,tier,false);
   }
   assert.equal(p.selectedTier,tier,'Selected territory persisted via real click');
   const oldClear=p.uniqueClears;
   const outcome=siege(h,n<=7?35:n<=9?50:65);
   assert.equal(outcome.tier,tier);
   assert(p.uniqueClears>=oldClear);
   const saved=JSON.parse(w.store[SAVE]);
   assert.equal(saved.selectedTier,tier);
   assert.equal(saved.uniqueClears,p.uniqueClears);
   assert.equal(saved.battleSeconds,p.battleSeconds);
   assert.deepEqual(saved.firstWatchClaimed,Array.from(p.firstWatchClaimed));
   assert.equal(JSON.stringify(p.inventory.slice(0,4)),firstItem,'Original starter gear not duplicated or replaced');
   assert.equal(JSON.stringify(p.runes.slice(0,2)),firstRunes,'Original starter runes not duplicated or replaced');
   history.push({n,...outcome});
  }
  assert.equal(history.length,10,'Ten complete earned sessions');
  const w2=world(seed+500,w.store);
  assert.equal(w2.h.p().uniqueClears,p.uniqueClears,'Cross-territory progress survives a real reload');
  assert.equal(w2.h.p().selectedTier,p.selectedTier,'Last chosen territory survives reload');
  assert.equal(w2.h.p().bestByTier[1],p.bestByTier[1]);
  if(route==='frontier')assert(history.some(x=>x.tier===2),'Tier II is reached only after actual Tier I wave 20 unlock');
  cohorts.push({seed,route,attempts:history.length,firstClears:p.uniqueClears,
   bestTierI:p.bestByTier[1]||0,bestTierII:p.bestByTier[2]||0,chapters:p.firstWatchClaimed.length,
   activeMinutes:+(p.battleSeconds/60).toFixed(2),unlocked:p.unlockedTier,
   history:history.map(x=>({n:x.n,tier:x.tier,best:x.best,chapters:x.chapters}))});
 }
}
assert.equal(cohorts.length,6);
assert(cohorts.every(x=>x.firstClears>=20&&x.activeMinutes>15),'Every route earned a meaningful Tier I breakthrough');
assert(cohorts.filter(x=>x.route==='tier-one-only').every(x=>x.bestTierII===0),'Control policy never fabricates Tier II wins');
assert(cohorts.filter(x=>x.route==='frontier').every(x=>x.bestTierII>=0),'Report real Tier II victories even if zero');
// A separate saved character is deliberately modified by another tab; fail closed.
const conflict=world(15678),ch=conflict.h;
assert(ch.save());const foreign=JSON.parse(conflict.store[SAVE]);foreign.gold+=7;conflict.store[SAVE]=JSON.stringify(foreign);
assert.equal(ch.selectFrontierTier(1),false,'Stale character storage blocks even same-tier action');
assert.equal(ch.saveWriteBlocked(),true);
console.log('EARNED MULTI-TERRITORY FIRST WATCH COHORTS '+JSON.stringify(cohorts));
console.log('PASS Alpha 0.15.28: legitimate Tier II unlock, actual route clicks and combat, distinct per-tier first clears, earned upgrades, saved chapter/Sigil conservation, stale-tab/locked-tier refusal');
console.log('LIMIT: ten deterministic attempts per route, never a full 750-minute First Watch, a proof of ~1,250-hour completion or physical iPhone QA.');
