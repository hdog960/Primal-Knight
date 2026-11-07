// Alpha 0.15.9: genuine post-Chapter-V Tier III expedition and owned item readiness.
// Reuses the Alpha 0.15.6 deterministic combat harness and verified existing save behavior.
// Alpha 0.15.6 — real earned multi-territory First Watch routes and safe player selection.
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

assert(html.includes('ALPHA 0.15.9')&&html.includes('game.js?v=0.15.9')&&html.includes('style.css?v=0.15.9'));
assert(css.includes('.expedition-readiness-grid')&&css.includes('.expedition-readiness-grid article button{'));
assert(css.includes('@media(max-width:610px){.expedition-readiness-grid{grid-template-columns:1fr}'));
const untouched=world(15700);
const starter=JSON.stringify(untouched.h.p());
assert.equal(untouched.h.expeditionReadiness(),null,'Unavailable before legitimately earned Chapter V');
assert.equal(untouched.h.renderExpeditionReadiness(),'');
untouched.h.renderTierLobby();
assert(!untouched.el('milestoneList').innerHTML.includes('expedition-readiness'));
assert.equal(untouched.h.selectFrontierTier(3),false,'Tier III remains locked for new characters');
assert.equal(JSON.stringify(untouched.h.p()),starter,'Absent panel does not mutate any character field');
const fixture=world(15701),fp=fixture.h.p();
fp.firstWatchClaimed=[0,1,2,3,4];fp.battleSeconds=35*60;fp.uniqueClears=53;fp.unlockedTier=3;fp.bestByTier[1]=33;fp.bestByTier[2]=20;
const fixtureBefore=JSON.stringify(fp); // Synthetic UI fixture, NOT a claim of earned progression.
const readiness=fixture.h.expeditionReadiness();
assert(readiness&&readiness.tierIII);
assert.equal(readiness.equipped,4);
assert.equal(readiness.gearSlots,11);
assert.equal(readiness.owned,4);
assert.equal(readiness.runes,2);
assert.equal(readiness.socketed,0);
assert.equal(readiness.unsocketed,2);
assert(readiness.training&&Number.isFinite(readiness.training.cost));
assert(readiness.training.cost>=0&&readiness.training.rank>=0);
const panel=fixture.h.renderExpeditionReadiness();
assert(panel.includes('EXPEDITION READINESS')&&panel.includes('data-expedition-open="equipment"'));
assert(panel.includes('data-expedition-open="runes"')&&panel.includes('data-expedition-open="training"'));
assert(panel.includes('data-watch-frontier="3"'));
fixture.h.renderTierLobby();assert(fixture.el('milestoneList').innerHTML.includes('expedition-readiness'));
assert.equal(JSON.stringify(fp),fixtureBefore,'Rendering does not alter saved character, money, Sigils or inventory');
function navOpen(w,destination){
 const container=w.el('milestoneList');
 const button={dataset:{expeditionOpen:destination},disabled:false};
 container.listeners.click({target:{closest(selector){return selector==='[data-expedition-open]'?button:null;}}});
 assert.equal(w.el('panel').hidden,false,'Real Forge/Armory panel appears');
 assert(w.el('panelTitle').textContent.length>1);
 assert(w.el('panelContent').innerHTML.length>50);
}
navOpen(fixture,'equipment');
assert(fixture.el('panelTitle').textContent.toUpperCase().includes('EQUIPMENT')||fixture.el('panelContent').innerHTML.includes('Leather Cowl'));
fixture.h.openTab('battle');navOpen(fixture,'runes');
assert(fixture.el('panelContent').innerHTML.includes('Rune Workshop')||fixture.el('panelContent').innerHTML.includes('seedember'));
fixture.h.openTab('battle');navOpen(fixture,'training');
assert(fixture.el('panelContent').innerHTML.includes('data-action="train:power"'));
assert.equal(JSON.stringify(fp),fixtureBefore,'Opening preparation chambers must not spend or equip');
const didSelect=fixture.h.selectFrontierTier(3);
assert.equal(didSelect,true,'Explicitly unlocked fixture Tier III prepares via original save-verification gate');
assert.equal(fp.selectedTier,3);
assert.equal(fixture.h.run().phase,'ready','Selecting III does not auto-start combat');
function clickPanel(w,data){
 const b={dataset:data,disabled:false};
 w.el('panelContent').listeners.click({target:{closest(sel){return sel==='button'?b:null;}}});
}
function prepareOwnedItems(w){
 const h=w.h,p=h.p(),gear=p.inventory.find(g=>g.id==='first_watch_gear_2'),
  rune=p.runes.find(r=>r.id==='first_watch_4');
 assert(gear,'Chapter III legitimately earned its equipment reward');
 assert(rune&&rune.type==='frost'&&rune.tier===2,'Chapter V genuinely awarded its Frost Rune');
 const beforeInventory=p.inventory.length,beforeRune=p.runes.length;
 const resources={gold:p.gold,essence:p.essence,knowledge:p.knowledge,sigils:p.sigils};
 h.openTab('equipment');
 clickPanel(w,{action:'equip:'+gear.id});
 assert(Object.values(p.equipped).includes(gear.id),'Existing gear equipped by real Equipment action');
 h.openTab('runes');
 clickPanel(w,{socketSlot:'helm'});
 clickPanel(w,{socketRune:'helm:'+rune.id});
 assert.equal(p.socketed.helm,rune.id,'Original earned Frost Rune socketed by existing workshop action');
 assert.equal(p.inventory.length,beforeInventory,'Equipping never duplicates equipment');
 assert.equal(p.runes.length,beforeRune,'Socketing never duplicates a finite rune');
 for(const k of Object.keys(resources))assert.equal(p[k],resources[k],'Item assignment never charges resources');
 assert(h.save(),'Equipped gear and owned rune persist in original character schema');
 h.openTab('battle');
 const saved=JSON.parse(w.store[SAVE]);
 assert(Object.values(saved.equipped).includes(gear.id));
 assert.equal(saved.socketed.helm,rune.id);
 return {gear:gear.id,rune:rune.id};
}
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

// Seed-paired route comparison uses naturally earned chapter five, owned gear
// and workshop-selected frost rune. Only post-Chapter-V destination differs.
const cohorts=[];
for(const seed of [15411,15423]){
 for(const route of ['hold-II','try-III']){
  const w=world(seed),h=w.h,p=h.p(),history=[];
  for(let n=1;n<=12;n++){
   spendSkills(h);spendCombat(h);spendSkills(h);
   let tier=n>=4&&n%3!==0&&p.unlockedTier>=2?2:1;
   if(n>=11){
    assert(p.firstWatchClaimed.includes(4),'First Watch chapter V earned before Tier III decision');
    assert(p.unlockedTier>=3,'Tier III earned through actual Tier II wave 20 before any III start');
    tier=route==='try-III'?3:2;
   }
   if(n===11){
    const q=h.expeditionReadiness();
    assert(q&&q.tierIII,'Post-fifth-chapter readiness reports earned Tier III');
    assert(q.training===null||q.training.cost>=0,'Training is the current original purchase quote');
    const resources=JSON.stringify({gold:p.gold,essence:p.essence,knowledge:p.knowledge,sigils:p.sigils});
    h.renderTierLobby();
    assert(w.el('milestoneList').innerHTML.includes('expedition-readiness'));
    assert.equal(JSON.stringify({gold:p.gold,essence:p.essence,knowledge:p.knowledge,sigils:p.sigils}),resources);
    const chosen=prepareOwnedItems(w);
    assert(chosen.gear&&chosen.rune);
   }
   if(tier!==p.selectedTier){
    h.renderTierLobby();
    if(tier===3){
     const button={disabled:false,dataset:{watchFrontier:'3'}};
     w.el('milestoneList').listeners.click({target:{closest(sel){return sel==='[data-watch-frontier]'?button:null;}}});
    }else clickTier(w,tier,false);
   }
   assert.equal(p.selectedTier,tier,'Selected tier is the actual saved tier');
   const prior=p.uniqueClears;const result=siege(h,n<=7?35:n<=9?50:65);
   assert.equal(result.tier,tier);
   assert(p.uniqueClears>=prior);
   const saved=JSON.parse(w.store[SAVE]);
   assert.equal(saved.selectedTier,tier);
   assert.equal(saved.uniqueClears,p.uniqueClears);
   assert.equal(saved.battleSeconds,p.battleSeconds);
   assert.deepEqual(saved.firstWatchClaimed,Array.from(p.firstWatchClaimed));
   history.push({n,...result});
  }
  assert.equal(history.length,12);
  const loaded=world(seed+1000,w.store);
  assert.equal(loaded.h.p().uniqueClears,p.uniqueClears);
  assert.equal(loaded.h.p().firstWatchClaimed.length,p.firstWatchClaimed.length);
  assert.equal(loaded.h.p().selectedTier,p.selectedTier);
  assert.equal(loaded.h.p().socketed.helm,'first_watch_4');
  assert(Object.values(loaded.h.p().equipped).includes('first_watch_gear_2'));
  assert.equal(p.uniqueClears,trueBestSum(p),'No invented unique wave credits');
  if(route==='try-III')assert(history.some(x=>x.tier===3),'Legitimate new Tier III battles actually executed');
  else assert(!history.some(x=>x.tier===3),'Comparison route does not visit Tier III');
  cohorts.push({seed,route,attempts:12,clears:p.uniqueClears,chapters:p.firstWatchClaimed.length,
    minutes:+(p.battleSeconds/60).toFixed(2),bestI:p.bestByTier[1]||0,
    bestII:p.bestByTier[2]||0,bestIII:p.bestByTier[3]||0,
    trainingEssence:p.essence,ownedGear:p.inventory.length,ownedRunes:p.runes.length,
    lastTwo:history.slice(-2).map(x=>({tier:x.tier,best:x.best,chapters:x.chapters}))});
 }
}
assert.equal(cohorts.length,4);
console.log('EARNED POST-CHAPTER-V EXPEDITIONS '+JSON.stringify(cohorts));
console.log('PASS Alpha 0.15.9: real Chapter V→Tier III unlock, original gear and rune equip, earned first-clear/Sigil accounting, actual upgrade affordability, read-only readiness, old save reload');
console.log('LIMIT: twelve scripted attempts per route across two seeds; no human iPhone play, full 750-minute First Watch, mid/endgame affordability or 1,250-hour completion proof.');
