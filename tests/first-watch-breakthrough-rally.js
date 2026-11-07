// Alpha 0.15.4: real saved defensive-to-offensive recovery and seeded retries.
'use strict';
const fs=require('node:fs'),assert=require('node:assert/strict'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,fn){this.listeners[k]=fn}querySelector(){return null}querySelectorAll(){return []}
}
function world(seed0,saveData){
 let seed=seed0>>>0,rng=Object.create(Math);
 rng.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.assign(Object.create(null),saveData||{});
 const env={Math:rng,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,env,{filename:'game.js'});
 return {h:env.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.4')&&html.includes('style.css?v=0.15.4')&&html.includes('game.js?v=0.15.4'));
assert(css.includes('.watch-breakthrough button')&&css.includes('min-height:44px'));
assert(css.includes('@media(max-width:610px){.watch-breakthrough-heading'));
const fresh=world(15300),fp=fresh.h.p(),fh=fresh.h;
assert.equal(fh.breakthroughRallyQuote(),null,'Never show stall guidance on a new character');
assert.equal(fh.purchaseBreakthroughRallyRank(),false,'No arbitrary early purchase');
assert.equal(fh.renderBreakthroughRally(),'','No fake chapter or rank conditions');
assert.equal(fp.gold,520);assert.equal(fp.essence,180);
function opening(w){
 const p=w.h.p(),h=w.h;
 let count=0,spent=0;
 while(h.firstWatchInvestmentQuote('guardian').missingRanks){
  const quote=h.firstWatchInvestmentQuote('guardian');
  assert(quote.nextAffordable);
  const cost=quote.nextCost,before=p.essence,rank=p.training[quote.nextId]||0;
  assert(h.purchaseFirstWatchInvestmentRank('guardian'),'True Battle Quartermaster paid one rank');
  assert(h.save(),'Actual original character storage accepts purchased rank');
  assert.equal(p.essence,before-cost);
  assert.equal(p.training[quote.nextId],rank+1);
  spent+=cost;count++;
  assert(count<=6);
 }
 assert.equal(count,6);assert.equal(spent,59);
 assert.equal(p.training.fort,4);assert.equal(p.training.power,1);assert.equal(p.training.haste,1);
 assert.equal(h.breakthroughRallyQuote(),null,'Without earned waves, defense ranks alone cannot activate guidance');
 return spent;
}
function fight(w){
 const {h,store}=w,p=h.p(),r=h.run(),start=p.battleSeconds,priorBest=p.bestByTier[1]||0;
 assert.equal(h.enterSiege(),true);
 assert.equal(h.purchaseBreakthroughRallyRank(),false,'No training possible while an actual siege fights');
 let frames=0,lastWave=r.wave,at=r.time;
 while(r.phase!=='fallen'&&r.wavesCleared<20&&frames<52000){
  if(r.phase==='fighting'&&r.wave!==lastWave){lastWave=r.wave;at=r.time;}
  h.tick(.05);frames++;
  if(frames%115===0){
   assert(r.enemies.length<=24&&r.shots.length<=48,'Mobile combat entity caps');
   assert(Number.isFinite(r.health)&&r.health>=0&&r.health<=r.maxHealth);
  }
  if(r.phase==='fighting'&&r.time-at>95)throw Error('Wave timeout '+r.wave);
 }
 assert(frames<52000,'Bounded real siege');
 assert.equal(p.uniqueClears,p.bestByTier[1],'Real Tier I unique clears, no fake rewards');
 assert(p.bestByTier[1]>=priorBest,'No cleared-wave regression');
 assert.equal(JSON.parse(store[SAVE]).uniqueClears,p.uniqueClears,'Earned wave record saved in original key');
 assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length,'One-time First Watch');
 const ledger=h.sigilLedgerSummary();
 assert.equal(ledger.held+ledger.future,ledger.claimed+ledger.unclaimed+ledger.earnedWatch+ledger.unclaimedWatch,'Finite Sigil budget');
 if(p.firstWatchClaimed.includes(1)){
  assert(p.battleSeconds>=420,'Second chapter requires seven active minutes');
  assert(p.uniqueClears>=11,'Second chapter requires 11 earned unique waves');
 }
 return {wave:r.wave,clears:r.wavesCleared,best:p.bestByTier[1],
  newClears:p.bestByTier[1]-priorBest,minutes:+((p.battleSeconds-start)/60).toFixed(2),
  totalMinutes:+(p.battleSeconds/60).toFixed(2),watch:p.firstWatchClaimed.length,
  essence:p.essence,level:p.level,sigils:p.sigils,phase:r.phase};
}
function investSkillPoints(w){
 const h=w.h,p=h.p();
 let count=0;
 while(p.points>0&&count<16){
  const id=(p.skills.aim||0)<5?'aim':(p.skills.quiver||0)<5?'quiver':(p.skills.stone||0)<5?'stone':null;
  if(!id)break;
  const before=p.points,rank=p.skills[id]||0;
  h.action('skill:'+id);
  assert.equal(p.points,before-1,'Only previously earned skill points can be invested');
  assert.equal(p.skills[id],rank+1);
  count++;
 }
 return count;
}
function buyBaseline(w){
 const h=w.h,p=h.p();
 let count=0,spent=0;
 for(let i=0;i<12;i++){
  const offer=h.councilTrainingOffers(h.warCouncilPlan(1,1)).find(x=>x.id==='fort');
  if(!offer||!offer.affordable)break;
  const before=p.essence,rank=p.training.fort;
  assert(h.purchaseCouncilTraining('fort'),'No speculative or free Fortitude ranks');
  assert.equal(p.essence,before-offer.cost);assert.equal(p.training.fort,rank+1);
  spent+=offer.cost;count++;
 }
 assert(h.save());
 return {count,spent};
}
function buyRally(w){
 const {h,p}= {h:w.h,p:w.h.p()};
 let count=0,spent=0,visible=false;
 for(let i=0;i<16;i++){
  const quote=h.breakthroughRallyQuote();
  if(!quote||!quote.affordable)break;
  visible=true;
  assert(quote.uniqueRemaining>0,'No free already-earned chapter');
  assert(quote.nextId==='power'||quote.nextId==='haste','Rally never adds more wall HP');
  const prior=p.essence,rank=p.training[quote.nextId]||0;
  h.renderTierLobby();
  const markup=w.el('milestoneList').innerHTML;
  assert(markup.includes('BREAKTHROUGH RALLY · STONEGUARD RECOVERY'),'Actual Battle lobby has priced recovery');
  assert(markup.includes('data-breakthrough-rally="one"'));
  w.el('milestoneList').scrollTop=144;
  w.el('milestoneList').listeners.click({target:{closest(sel){
   return sel==='[data-breakthrough-rally]'?{disabled:false,dataset:{breakthroughRally:'one'}}:null;
  }}});
  assert.equal(w.el('milestoneList').scrollTop,144,'Actual click preserves mobile scroll');
  assert.equal(p.training[quote.nextId],rank+1,'Only one real offensive rank purchased');
  assert.equal(p.essence,prior-quote.nextCost,'No free upgrades or altered cost');
  assert.equal(JSON.parse(w.store[SAVE]).training[quote.nextId],rank+1,'Rank persisted immediately');
  assert.equal(JSON.parse(w.store[SAVE]).essence,p.essence);
  spent+=quote.nextCost;count++;
 }
 return {count,spent,visible};
}
function policy(id,seed){
 const w=world(seed),p=w.h.p(),h=w.h,initialGear=JSON.stringify(p.inventory.slice(0,4)),
  initialRunes=JSON.stringify(p.runes.slice(0,2));
 const starterSpent=opening(w),attempts=[],purchases=[];
 attempts.push(fight(w));
 assert(attempts[0].clears>=5,'Original paid Stoneguard earns its first real wave milestones');
 assert(p.siegeHistory.length>0,'First real siege writes a valid saved chronology record');
 const quote=h.breakthroughRallyQuote();
 assert(quote&&quote.uniqueRemaining>0,'An actual defensive stall activates the rally');
 assert.equal(quote.might,1);assert.equal(quote.reflexes,1);assert.equal(quote.fortitude,4);
 assert(quote.remainingCost>0&&quote.nextCost>0);
 const reloaded=world(seed+1000,w.store);
 const persistedQuote=reloaded.h.breakthroughRallyQuote();
 assert.equal(reloaded.h.p().siegeHistory.length,p.siegeHistory.length,'Real historical sieges survive reload without initialization crash');
 assert(persistedQuote,'Recovery still visible from original save after app restart');
 assert.equal(persistedQuote.remainingCost,quote.remainingCost);
 assert.equal(persistedQuote.uniqueRemaining,quote.uniqueRemaining);
 for(let attempt=2;attempt<=3;attempt++){
  const invested=investSkillPoints(w);
  const paid=id==='rally'?buyRally(w):buyBaseline(w);
  purchases.push({...paid,invested,attempt});
  attempts.push(fight(w));
  if(p.firstWatchClaimed.includes(1))break;
 }
 assert.equal(JSON.stringify(p.inventory.slice(0,4)),initialGear,'Starter gear persists');
 assert.equal(JSON.stringify(p.runes.slice(0,2)),initialRunes,'Starter runes persist');
 assert(!Object.hasOwn(JSON.parse(w.store[SAVE]),'breakthroughRally'),'No new save fields');
 const summary=h.sigilLedgerSummary();
 assert.equal(p.sigils,summary.claimed+summary.earnedWatch,'No Sigil spending in this cohort');
 return {id,seed,starterSpent,attempts,purchases,finalBest:p.bestByTier[1],firstWatchTwo:p.firstWatchClaimed.includes(1),
  totalMinutes:+(p.battleSeconds/60).toFixed(2),fortitude:p.training.fort,might:p.training.power,reflexes:p.training.haste};
}
const results=[];
for(const seed of [15311,15313,15317]){
 const baseline=policy('defense-only',seed);
 const rally=policy('rally',seed);
 assert.equal(baseline.attempts[0].clears,rally.attempts[0].clears,'Paired characters identical before recovery');
 assert.equal(baseline.starterSpent,rally.starterSpent,'Both begin with genuine same-cost defense');
 results.push({seed,baseline,rally,clearGain:rally.finalBest-baseline.finalBest});
}
assert.equal(results.length,3,'Same three original Stoneguard seed profiles compared');
assert(results.some(x=>x.rally.purchases.some(p=>p.count>0)),'Recovery must enable at least one actual purchase');
// The seeded policy comparison is a measurement, not a promise that a
// particular purchase plan will dominate every RNG profile.
console.log('STONEGUARD OFFENSE RALLY EARNED-COHORT RESULTS '+JSON.stringify(results));
console.log('STONEGUARD CHAPTER TWO GATES '+JSON.stringify({
 defenseOnly:results.filter(x=>x.baseline.firstWatchTwo).length,
 breakthroughRally:results.filter(x=>x.rally.firstWatchTwo).length,
 trueClearGains:results.map(x=>x.clearGain)
}));
console.log('PASS Alpha 0.15.4: priced persistent Stoneguard recovery, real UI one-rank taps, saved upgrades and earned First Watch and Sigil gates across paired seeds');
console.log('LIMIT: Three short seeded Tier I spending strategies, not a full 750-minute campaign, player preference study, iPhone device QA or measured 1250-hour completion.');
