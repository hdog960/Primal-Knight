// Alpha 0.15.12: genuine post-Chapter-V Tier III expedition and owned item readiness.
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

assert(html.includes('ALPHA 0.15.12')&&html.includes('game.js?v=0.15.12')&&html.includes('style.css?v=0.15.12'));
assert(css.includes('.march-build-audit')&&css.includes('.march-build-sections'));
assert(css.includes('@media(max-width:760px){.march-build-sections{grid-template-columns:1fr}}'));
assert(css.includes('min-height:44px'));
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


// Clearly synthetic fixture — ONLY tests the UI and arithmetic. Not earned progress.
const absent=world(15900),ah=absent.h;
assert.equal(ah.marchBuildAudit(),null);
assert.equal(ah.renderMarchBuildAudit(),'');
ah.renderTierLobby();assert(!absent.el('milestoneList').innerHTML.includes('march-build-audit'));
const fixture=world(15901),h=fixture.h,p=h.p();
p.firstWatchClaimed=[0,1,2,3,4,5,6];
p.battleSeconds=77*60;p.uniqueClears=116;
const unchanged=JSON.stringify(p),audit=h.marchBuildAudit();
assert(audit,'Chapter VII fixture can see audit');
assert(audit.damage>0&&audit.wall>0&&audit.shotSeconds>0);
assert.equal(audit.ownedGear,4);assert.equal(audit.ownedRunes,2);
assert.equal(audit.upgrades.length,0,'Starter equipped gear has no higher-scoring candidates');
assert.equal(audit.effects.length,4);
assert(audit.effects.every(x=>x.effectPct===0),'No rune components active while sockets are empty');
const quoteMap=Object.fromEntries(audit.quotes.map(x=>[x.key,x]));
assert.deepEqual(Object.keys(quoteMap).sort(),['attunement','fort','power']);
assert(quoteMap.power.cost>0&&quoteMap.fort.cost>0&&quoteMap.attunement.cost>0);
for(const quote of audit.quotes){
 assert.equal(quote.shortfall,Math.max(0,quote.cost-quote.balance));
 assert.equal(quote.affordable,quote.balance>=quote.cost);
}
const markup=h.renderMarchBuildAudit();
assert(markup.includes('ARMORY FIELD AUDIT'));
for(const tab of ['equipment','runes','training','research'])
 assert(markup.includes('data-march-build-open="'+tab+'"'));
h.renderTierLobby();
assert(fixture.el('milestoneList').innerHTML.includes('march-build-audit'));
assert.equal(JSON.stringify(p),unchanged,'Read-only audit must not touch the character or money');
for(const tab of ['equipment','runes','training','research']){
 const e=fixture.el('milestoneList'),target={disabled:false,dataset:{marchBuildOpen:tab}};
 e.listeners.click({target:{closest(sel){return sel==='[data-march-build-open]'?target:null;}}});
 assert.equal(fixture.el('panel').hidden,false,'Actual chamber opened');
 assert(fixture.el('panelContent').innerHTML.length>100);
 h.openTab('battle');
}
assert.equal(JSON.stringify(p),unchanged,'Panel navigation does not auto-spend');
p.firstWatchClaimed.push(7,8,9);
assert.equal(h.renderMarchBuildAudit(),'','Audit vanishes after Chapter X');

// Authentic earned-character workshop actions; same in both compared route policies.
function prepareMidgameBuild(w){
 const h=w.h,p=h.p();
 assert(p.firstWatchClaimed.includes(6),'Legitimate Chapter VII required');
 const audit=h.marchBuildAudit(),beforeSigils=p.sigils;
 assert(audit&&audit.effects.some(x=>x.type==='frost'&&x.slotted===1),'Earned Chapter V Frost socket is present');
 const item=p.inventory.find(g=>g.id==='first_watch_gear_2');
 assert(item&&Object.values(p.equipped).includes(item.id),'Original earned Chapter III gear still equipped');
 const previousPlus=item.plus,previousGold=p.gold;
 assert(previousGold>100,'Real earned Gold is available for paid enhancement');
 h.action('enhance:'+item.id);
 assert.equal(item.plus,previousPlus+1,'Genuine one-rank equipment enhancement');
 assert(p.gold<previousGold,'Paid the real nonzero Gold cost');
 const paidGold=previousGold-p.gold;
 const alternative=p.runes.find(r=>r.type==='ember'&&!Object.values(p.socketed).includes(r.id));
 assert(alternative,'Alternate Ember rune came from actual earned loot, not fabricated inventory');
 h.openTab('runes');
 clickPanel(w,{socketSlot:'helm'});
 clickPanel(w,{socketRune:'helm:'+alternative.id});
 assert.equal(p.socketed.helm,alternative.id,'Real Rune Workshop selected an owned Ember rune');
 const after=h.marchBuildAudit();
 assert(after);
 assert.equal(after.effects.find(x=>x.type==='frost').slotted,0);
 assert(after.effects.find(x=>x.type==='ember').slotted,1);
 assert(after.effects.find(x=>x.type==='frost').effectPct===0);
 assert(after.effects.find(x=>x.type==='ember').effectPct>0);
 const power=after.quotes.find(x=>x.key==='power');
 let powerCost=null;
 if(power.affordable){
  const rank=p.training.power||0,beforeEssence=p.essence;
  h.action('train:power');
  assert.equal(p.training.power,rank+1,'Earned Might rank purchased');
  assert.equal(p.essence,beforeEssence-power.cost,'Original Might cost paid exactly');
  powerCost=power.cost;
 }else assert(power.shortfall>0||power.maxed,'Unaffordable rank reported without spending');
 assert.equal(p.sigils,beforeSigils,'No fake or consumed finite Sigils in build inspection');
 assert(h.save(),'Paid build changes saved in original character schema');
 h.openTab('battle');
 const saved=JSON.parse(w.store[SAVE]);
 assert.equal(saved.socketed.helm,alternative.id);
 assert(saved.inventory.some(g=>g.id===item.id&&g.plus===previousPlus+1));
 return {paidGold,powerCost,ember:alternative.id};
}

const cohorts=[];
for(const seed of [15411,15423]){
 for(const route of ['repeat-IV','push-V-VI']){
  const w=world(seed),h=w.h,p=h.p(),history=[];
  let build=null;
  for(let n=1;n<=18;n++){
   spendSkills(h);spendCombat(h);spendSkills(h);
   let tier=n>=4&&n%3!==0&&p.unlockedTier>=2?2:1;
   if(n>=11){
    assert(p.firstWatchClaimed.includes(4));
    assert(p.unlockedTier>=3,'Real Tier III unlock retained');
    tier=3;
   }
   if(n===11)prepareOwnedItems(w);
   if(n>=13){
    assert(p.firstWatchClaimed.includes(5));
    assert(p.unlockedTier>=4);
    tier=4;
   }
   if(n===15){
    assert(p.firstWatchClaimed.includes(6),'Legitimately earned VII, not a fixture');
    assert(p.unlockedTier>=5,'Tier V requires authentic Tier IV wave-20 milestone');
    build=prepareMidgameBuild(w);
    const report=h.marchBuildAudit();
    assert(report&&report.damage>0&&report.wall>0);
    const original=JSON.stringify(p);
    h.renderTierLobby();assert(w.el('milestoneList').innerHTML.includes('march-build-audit'));
    assert.equal(JSON.stringify(p),original,'Audit render is passive even after paid actions');
   }
   if(n>=15&&route==='push-V-VI'){
    tier=n<=16?5:(p.unlockedTier>=6?6:5);
   }
   if(tier!==p.selectedTier){
    h.renderTierLobby();clickTier(w,tier,false);
   }
   assert.equal(p.selectedTier,tier,'Only normal unlocked tier navigation');
   const previous=p.uniqueClears;
   const result=siege(h,n<=7?35:n<=9?50:65);
   assert.equal(result.tier,tier);
   assert(p.uniqueClears>=previous,'Only authentic new wave progress');
   const saved=JSON.parse(w.store[SAVE]);
   assert.equal(saved.selectedTier,tier);
   assert.equal(saved.uniqueClears,p.uniqueClears);
   assert.equal(saved.battleSeconds,p.battleSeconds);
   assert.deepEqual(saved.firstWatchClaimed,Array.from(p.firstWatchClaimed));
   assert.equal(p.uniqueClears,trueBestSum(p),'No duplicated new-wave victories');
   history.push({n,...result});
  }
  assert(build,'Build was prepared using actual earned inventory');
  const loaded=world(seed+1800,w.store);
  assert.equal(loaded.h.p().uniqueClears,p.uniqueClears);
  assert.equal(loaded.h.p().battleSeconds,p.battleSeconds);
  assert.deepEqual(Array.from(loaded.h.p().firstWatchClaimed),Array.from(p.firstWatchClaimed));
  assert.equal(loaded.h.p().socketed.helm,build.ember);
  assert(loaded.h.p().inventory.some(g=>g.id==='first_watch_gear_2'&&g.plus>=1));
  if(route==='push-V-VI')assert((p.bestByTier[5]||0)>0,'Genuine Tier V victories');
  else assert.equal(p.bestByTier[5]||0,0,'Comparison does not receive Tier V clears');
  const next=h.firstWatchHorizon(1)[0];
  const counts={};
  for(let tier=1;tier<=6;tier++)counts[tier]=p.bestByTier[tier]||0;
  cohorts.push({seed,route,attempts:history.length,minutes:+(p.battleSeconds/60).toFixed(2),
   uniqueClears:p.uniqueClears,chapters:p.firstWatchClaimed.length,
   best:counts,unlocked:p.unlockedTier,
   essence:p.essence,knowledge:p.knowledge,gold:p.gold,
   paidGearGold:build.paidGold,paidMightEssence:build.powerCost,
   next:next?{chapter:next.index+1,minutesLeft:+(next.timeRemainingSeconds/60).toFixed(2),wavesLeft:next.waveRemaining}:null,
   lastFour:history.slice(-4).map(r=>({tier:r.tier,best:r.best,chapters:r.chapters}))});
 }
}
assert.equal(cohorts.length,4);
assert(cohorts.every(x=>x.attempts===18));
console.log('EARNED MIDGAME TIER V/VI BUILD COHORTS '+JSON.stringify(cohorts));
console.log('PASS Alpha 0.15.12: build score and rune contributions, purchased upgrade prices, real earned gear enhancement/alternate rune, Tier V/VI progression, one-time First Watch/Sigil and original save/reload');
console.log('LIMIT: 18 scripted earned attempts per seed/route. This does not demonstrate full 750-minute onboarding, all Chapters VIII–X, endgame economics or physical iPhone performance.');
