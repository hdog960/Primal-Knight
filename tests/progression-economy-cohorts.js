// Alpha 0.15.13: real-price three-currency ledger and longer earned economy cohorts.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,fn){this.listeners[k]=fn}querySelectorAll(){return []}querySelector(){return null}
}
function world(seed0,saveSource){
 let seed=seed0>>>0;const random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.assign(Object.create(null),saveSource||{});
 const sandbox={Math:random,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});
 assert(sandbox.window.__PK_TEST_TOOLS__,'Actual game hooks loaded');
 return {h:sandbox.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.13')&&html.includes('game.js?v=0.15.13')&&html.includes('style.css?v=0.15.13'));
assert(css.includes('.prosperity-grid')&&css.includes('min-height:44px'));
assert(css.includes('@media(max-width:610px){.prosperity-grid{grid-template-columns:1fr}'));
const test=world(15401),h=test.h,p=h.p();
assert.equal(p.level,1);assert.equal(p.essence,180);assert.equal(p.knowledge,60);assert.equal(p.gold,520);
assert.equal(h.prosperityInvestments.length,3);
assert.equal(h.prosperityLedgerQuote('forged'),null);
assert.equal(h.purchaseProsperityLedgerRank('forged'),false);
const initialQuotes={essence:h.prosperityLedgerQuote('essence'),knowledge:h.prosperityLedgerQuote('knowledge'),gold:h.prosperityLedgerQuote('gold')};
assert.equal(initialQuotes.essence.cost,30,'Attunement uses original first rank cost');
assert.equal(initialQuotes.knowledge.cost,26,'Advanced Studies uses original research price');
assert.equal(initialQuotes.gold.cost,175,'Midas Projector uses original station price');
for(const [id,q] of Object.entries(initialQuotes)){
 assert(q.affordable&&q.rank===0&&q.deficit===0);
 assert.equal(q.currency,id);assert(q.action.includes(':'));
}
assert(h.renderProsperityLedger().includes('THE PROSPERITY LEDGER'));
h.renderTierLobby();
const markup=test.el('milestoneList').innerHTML;
for(const id of ['essence','knowledge','gold'])
 assert(markup.includes('data-prosperity="'+id+'"'),'The real Battle lobby exposes '+id);
const originalGear=JSON.stringify(p.inventory),originalRunes=JSON.stringify(p.runes);
for(const id of ['essence','knowledge','gold']){
 const before=h.prosperityLedgerQuote(id),oldGold=p.gold,oldEssence=p.essence,oldKnowledge=p.knowledge;
 const list=test.el('milestoneList');list.scrollTop=159;
 list.listeners.click({target:{closest(sel){
  return sel==='[data-prosperity]'?{disabled:false,dataset:{prosperity:id}}:null;
 }}});
 assert.equal(list.scrollTop,159,'Mobile scroll survives a real economic purchase');
 assert.equal(h.prosperityLedgerQuote(id).rank,before.rank+1,'One click purchases exactly one rank');
 assert.equal(p[id],before.balance-before.cost,'Only expected currency deducted at normal price');
 for(const [other,old] of [['gold',oldGold],['essence',oldEssence],['knowledge',oldKnowledge]])
  if(other!==id)assert.equal(p[other],old,'No silent unrelated-currency costs');
 assert.equal(JSON.parse(test.store[SAVE])[id],p[id],'Price expense read back from actual iPhone character save');
 assert.equal(JSON.parse(test.store[SAVE])[before.source==='training'?'training':before.source==='research'?'research':'stations'][before.id],before.rank+1);
}
assert.equal(JSON.stringify(p.inventory),originalGear);
assert.equal(JSON.stringify(p.runes),originalRunes);
assert.equal(p.sigils,0,'No free finite Sigils');
assert(!Object.hasOwn(JSON.parse(test.store[SAVE]),'prosperityLedger'),'No new saved schema fields');
const reloaded=world(15402,test.store);
for(const id of ['essence','knowledge','gold']){
 assert.equal(reloaded.h.prosperityLedgerQuote(id).rank,h.prosperityLedgerQuote(id).rank,'All three real purchased ranks survive reload');
 assert.equal(reloaded.h.prosperityLedgerQuote(id).cost,h.prosperityLedgerQuote(id).cost,'Costs remain exact after reload');
}
const lack=world(15403);
lack.h.p().gold=0;lack.h.p().essence=0;lack.h.p().knowledge=0;
for(const id of ['gold','essence','knowledge']){
 const q=lack.h.prosperityLedgerQuote(id);
 assert.equal(q.affordable,false);assert.equal(q.deficit,q.cost);
 assert.equal(lack.h.purchaseProsperityLedgerRank(id),false,'Insufficient currency never creates rank');
}
const cap=world(15404);
cap.h.p().training.essence=600;cap.h.p().research.studies=40;cap.h.p().stations.midas=80;
for(const id of ['gold','essence','knowledge']){
 const q=cap.h.prosperityLedgerQuote(id);
 assert(q.maxed&&!q.affordable&&q.cost===null);
 assert.equal(cap.h.purchaseProsperityLedgerRank(id),false,'Maxed permanent upgrade cannot overflow');
}
const during=world(15405);
assert.equal(during.h.enterSiege(),true);
for(const id of ['gold','essence','knowledge'])
 assert.equal(during.h.purchaseProsperityLedgerRank(id),false,'No lobby purchase while combat is active');
const locked=world(15406);
assert(locked.h.save());
const foreign=JSON.parse(locked.store[SAVE]);foreign.gold+=1;locked.store[SAVE]=JSON.stringify(foreign);
assert.equal(locked.h.purchaseProsperityLedgerRank('essence'),false,'External character update is not overwritten');
assert.equal(locked.h.saveWriteBlocked(),true,'Stale tab is fail-closed before purchase');

function skillSpend(h){
 const p=h.p();let spent=0;
 while(p.points>0&&spent<25){
  const id=['aim','quiver','stone','ward','focus'].find(x=>(p.skills[x]||0)<5);
  if(!id)break;
  const before=p.points,rank=p.skills[id]||0;
  h.action('skill:'+id);
  assert.equal(p.points,before-1);assert.equal(p.skills[id],rank+1);spent++;
 }
 return spent;
}
function buyTraining(h,policy){
 const p=h.p(),order=policy==='growth'?['power','haste','power','fort']:['power','power','haste','fort'];
 let bought=0,spent=0;
 for(let i=0;i<12;i++){
  const offers=h.councilTrainingOffers(h.warCouncilPlan(1,1));
  const pick=order.map(id=>offers.find(o=>o.id===id&&o.affordable)).find(Boolean);
  if(!pick)break;
  const before=p.essence,rank=p.training[pick.id]||0;
  assert(h.purchaseCouncilTraining(pick.id),'True permanent one-rank purchase');
  assert.equal(p.essence,before-pick.cost);
  assert.equal(p.training[pick.id],rank+1);
  bought++;spent+=pick.cost;
 }
 assert(h.save(),'Exact earned Training spend saved');
 return {bought,spent};
}
function investEconomy(h,policy){
 const p=h.p(),changes={essence:0,knowledge:0,gold:0},spent={essence:0,knowledge:0,gold:0};
 if(policy==='growth'){
  for(const id of ['essence','knowledge','gold']){
   const q=h.prosperityLedgerQuote(id);
   if(q.rank>=3||!q.affordable)continue;
   const old=p[id];assert(h.purchaseProsperityLedgerRank(id));
   changes[id]++;spent[id]+=q.cost;
   assert.equal(p[id],old-q.cost,'Actual growth investment paid for');
  }
 }else{
  if((p.stations.ballista||0)<2&&p.gold>=135){
   const old=p.stations.ballista||0,prior=p.gold;
   h.action('station:ballista');
   if((p.stations.ballista||0)===old+1)spent.gold+=prior-p.gold;
  }
  if((p.research.calibration||0)<2&&p.knowledge>=36){
   const old=p.research.calibration||0,prior=p.knowledge;
   h.action('research:calibration');
   if((p.research.calibration||0)===old+1)spent.knowledge+=prior-p.knowledge;
  }
 }
 return {changes,spent};
}
function attempt(h){
 const p=h.p(),r=h.run(),prior=p.battleSeconds,best=p.bestByTier[1]||0;
 assert.equal(h.enterSiege(),true);
 let ticks=0,lastWave=r.wave,begin=r.time;
 while(r.phase!=='fallen'&&r.wavesCleared<35&&ticks<56000){
  if(r.phase==='fighting'&&r.wave!==lastWave){lastWave=r.wave;begin=r.time;}
  h.tick(.05);ticks++;
  if(ticks%160===0){
   assert(r.enemies.length<=24&&r.shots.length<=48,'Original phone-friendly entity caps');
   assert(Number.isFinite(r.health)&&r.health>=0&&r.health<=r.maxHealth);
  }
  if(r.phase==='fighting'&&r.time-begin>95)throw Error('Combat stalled on wave '+r.wave);
 }
 assert(ticks<56000,'Real deterministic siege remains bounded');
 const end=r.phase==='fallen'?'fallen':'voluntary-retreat-after-35-clears';
 if(r.phase!=='fallen')h.retreatFromSiege();
 assert(p.battleSeconds>prior,'Actual combat time—not fabricated wall clock—advanced');
 assert(p.bestByTier[1]>=best,'Permanent wave record cannot regress');
 assert.equal(p.uniqueClears,p.bestByTier[1],'Repeat victories never count as new ones');
 return {end,cleared:r.wavesCleared,best:p.bestByTier[1],minutes:+((p.battleSeconds-prior)/60).toFixed(2),
  totalMinutes:+(p.battleSeconds/60).toFixed(2),chapters:p.firstWatchClaimed.length};
}
// Complete real sessions; policy decisions are scripted, rewards are never fabricated.
const cohorts=[];
for(const seed of [15411,15423,15437]){
 for(const policy of ['combat','growth']){
  const w=world(seed),h=w.h,p=h.p(),r=h.run(),sessions=[],paid={essence:0,knowledge:0,gold:0};
  const starterGear=JSON.stringify(p.inventory.slice(0,4)),starterRunes=JSON.stringify(p.runes.slice(0,2));
  for(let n=1;n<=12;n++){
   skillSpend(h);
   const investments=investEconomy(h,policy);
   for(const currency of ['essence','knowledge','gold'])paid[currency]+=investments.spent[currency];
   const training=buyTraining(h,policy);skillSpend(h);
   const prior=p.battleSeconds,best=p.bestByTier[1]||0;
   assert.equal(h.enterSiege(),true);
   let ticks=0,lastWave=r.wave,begin=r.time;
   // Prevent the previous 35-wave test harness from artificially capping the later frontier.
   const checkpointCap=n<=7?35:n<=9?50:n<=11?65:80;
   while(r.phase!=='fallen'&&r.wavesCleared<checkpointCap&&ticks<100000){
    if(r.phase==='intermission'&&p.points>0)skillSpend(h);
    if(r.phase==='fighting'&&r.wave!==lastWave){lastWave=r.wave;begin=r.time;}
    h.tick(.05);ticks++;
    if(ticks%180===0){
     assert(r.enemies.length<=24&&r.shots.length<=48,'Actual mobile actor ceilings');
     assert(Number.isFinite(r.health)&&r.health>=0&&r.health<=r.maxHealth);
    }
    if(r.phase==='fighting'&&r.time-begin>95)throw Error('Timed out real battle at wave '+r.wave);
   }
   assert(ticks<100000,'Bounded genuine wave simulation');
   const outcome=r.phase==='fallen'?'fallen':'retreated-after-'+checkpointCap+'-earned-clears';
   if(r.phase!=='fallen')h.retreatFromSiege();
   assert(p.battleSeconds>prior);assert(p.bestByTier[1]>=best);
   assert.equal(p.uniqueClears,p.bestByTier[1],'No repeat farming of First Watch wave gates');
   assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length,'Finite chapters never duplicate');
   for(const chapter of p.firstWatchClaimed){
    const row=h.earlyWatchChapters[chapter];
    assert(row&&p.battleSeconds>=row[0]*60);
    assert(p.uniqueClears>=Math.ceil(row[0]*1.5),'Each claimed chapter has genuine first clears');
   }
   assert.equal(JSON.stringify(p.inventory.slice(0,4)),starterGear,'Starter equipment unchanged');
   assert.equal(JSON.stringify(p.runes.slice(0,2)),starterRunes,'Starter runes unchanged');
   assert(p.essence>=0&&p.knowledge>=0&&p.gold>=0,'No negative currency debt');
   const sig=h.sigilLedgerSummary();
   assert.equal(p.sigils,sig.claimed+sig.earnedWatch,'No unauthorized finite Sigil creation');
   assert.equal(sig.held+sig.future,sig.claimed+sig.unclaimed+sig.earnedWatch+sig.unclaimedWatch);
   const saved=JSON.parse(w.store[SAVE]);
   assert.equal(saved.uniqueClears,p.uniqueClears);
   assert.equal(saved.battleSeconds,p.battleSeconds);
   assert.equal(saved.essence,p.essence);assert.equal(saved.gold,p.gold);assert.equal(saved.knowledge,p.knowledge);
   sessions.push({n,outcome,clears:r.wavesCleared,best:p.bestByTier[1],minutes:+(p.battleSeconds/60).toFixed(2),
    chapters:p.firstWatchClaimed.length,level:p.level,rankSpent:training.spent,frontierCap:checkpointCap,perks:investments.changes});
  }
  assert.equal(sessions.length,12,'Twelve actual attempts, not a fabricated future-state fixture');
  const after=world(seed+500,w.store);
  assert.equal(after.h.p().uniqueClears,p.uniqueClears,'Real siege history persists after reload');
  assert.equal(after.h.p().siegeHistory.length,p.siegeHistory.length);
  for(const id of ['essence','knowledge','gold'])
   assert.equal(after.h.prosperityLedgerQuote(id).rank,h.prosperityLedgerQuote(id).rank);
  cohorts.push({policy,seed,sessions,
   chapters:p.firstWatchClaimed.length,best:p.bestByTier[1],
   activeMinutes:+(p.battleSeconds/60).toFixed(2),level:p.level,
   gold:p.gold,essence:p.essence,knowledge:p.knowledge,
   ranks:{attunement:p.training.essence||0,studies:p.research.studies||0,midas:p.stations.midas||0},
   growthCost:paid,history:p.siegeHistory.length});
 }
}
assert.equal(cohorts.length,6,'Three random seeds × two real spending policies');
assert(cohorts.every(x=>x.best>=5&&x.activeMinutes>=2),'Each cohort actually progresses and earns time');
assert(cohorts.filter(x=>x.policy==='growth').every(x=>x.ranks.attunement>0&&x.ranks.studies>0&&x.ranks.midas>0),'Growth choice purchases all 3 resources with earned balances');
console.log('TWELVE-ATTEMPT EARNED ECONOMY COHORTS '+JSON.stringify(cohorts));
console.log('FIRST WATCH REAL-COHORT CHAPTERS '+JSON.stringify(cohorts.map(x=>({policy:x.policy,seed:x.seed,chapters:x.chapters,best:x.best,activeMinutes:x.activeMinutes}))));
console.log('PASS Alpha 0.15.13: live three-currency prices, real one-click purchases, no double-spend, cap/insufficiency/save locks, 72 actual seeded sieges, honest finite one-time progress and original save reload');
console.log('LIMIT: twelve deterministic attempts per cohort, not full 750-minute First Watch, physical iPhone acceptance, or verified ~1250-hour completion.');
