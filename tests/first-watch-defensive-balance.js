// Alpha 0.15.16: matched-seed early Fortitude comparison and earned second attempts.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const wardTerm='*(1-fortitudeBreachWard())';
assert.equal(source.split(wardTerm).length-1,1,'One precise Fortitude ward multiplier in actual breach damage');
const oldFormulaSource=source.replace(wardTerm,'');
assert(html.includes('ALPHA 0.15.16')&&html.includes('game.js?v=0.15.16')&&html.includes('style.css?v=0.15.16'));
const SAVE='primal_knight_onslaught_save_v1',paths=['might','balanced','guardian'];
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.attrs={};this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;this.className='';this.scrollTop=0;this.width=960;this.height=540;this.listeners={};this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,f){this.listeners[k]=f}querySelectorAll(){return []}querySelector(){return null}
}
function world(code,startSeed){
 let seed=startSeed>>>0;
 const rng=Object.create(Math);rng.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.create(null);
 const env={Math:rng,Date,Blob,Image,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(code,env,{filename:'game.js'});
 return {h:env.window.__PK_TEST_TOOLS__,store,el};
}
const guard=world(source,15200),gh=guard.h,gp=gh.p();
assert.equal(gh.fortitudeBreachWard(),0);
gp.training.fort=1;assert(Math.abs(gh.fortitudeBreachWard()-.04)<1e-10);
gp.training.fort=4;assert(Math.abs(gh.fortitudeBreachWard()-.16)<1e-10);
gp.training.fort=6;assert(Math.abs(gh.fortitudeBreachWard()-.24)<1e-10);
gp.training.fort=600;assert(Math.abs(gh.fortitudeBreachWard()-.24)<1e-10,'Ward remains capped for deep upgrades');
assert(gh.maxWall()>145,'Fortitude still grows fortress maximum HP');
assert(gh.firstWatchInvestmentPaths.some(x=>x.id==='guardian'),'Original Stoneguard plan preserved');
assert(gh.renderFirstWatchInvestmentPaths().includes('STONEGUARD'));
assert(gh.councilTrainingOffers(gh.warCouncilPlan(1,1)).find(x=>x.id==='fort').note.includes('24%'));
const spendingOrders={might:['power','haste','power','haste'],balanced:['power','haste','fort','power'],guardian:['fort','power','haste','fort']};
const actual=[];
function buyPath(w,path){
 const {h,store}=w,p=h.p();
 let bought=0,spent=0;
 while(h.firstWatchInvestmentQuote(path).missingRanks){
  const q=h.firstWatchInvestmentQuote(path);
  assert(q.nextAffordable,'Starter can afford next true rank');
  const prior=p.essence,rank=p.training[q.nextId]||0;
  // Use the real selectable Battle-lobby purchase handler and save.
  h.renderTierLobby();
  w.el('milestoneList').listeners.click({target:{closest(sel){
   return sel==='[data-first-watch-invest]'?{disabled:false,dataset:{firstWatchInvest:path}}:null;
  }}});
  assert.equal(p.training[q.nextId],rank+1,'One real purchased rank per tap');
  assert.equal(p.essence,prior-q.nextCost,'No hidden discount or free currency');
  assert.equal(JSON.parse(store[SAVE]).essence,p.essence,'Exact paid rank persisted on original key');
  spent+=q.nextCost;bought++;
  assert(bought<=6,'No auto-buy loop');
 }
 assert.equal(bought,6);
 return {bought,spent};
}
function buyEarnedRetry(w,path){
 const {h,store}=w,p=h.p(),order=spendingOrders[path];
 let ranks=0,totalSpent=0;
 for(let i=0;i<12;i++){
  let purchased=false;
  for(const id of order){
   const offer=h.councilTrainingOffers(h.warCouncilPlan(1,1)).find(o=>o.id===id);
   if(!offer||!offer.affordable)continue;
   const prev=p.essence,rank=p.training[id]||0;
   if(!h.purchaseCouncilTraining(id))continue;
   assert.equal(p.training[id],rank+1,'Earned retry buys a legitimate next rank');
   assert.equal(p.essence,prev-offer.cost,'Retry cost is live, with no grants');
   purchased=true;totalSpent+=offer.cost;ranks++;break;
  }
  if(!purchased)break;
 }
 assert(h.save(),'Retry training persists before siege');
 assert.equal(JSON.parse(store[SAVE]).essence,p.essence);
 return {ranks,totalSpent};
}
function realBattle(w){
 const {h,store}=w,p=h.p(),r=h.run(),startActive=p.battleSeconds;
 assert.equal(h.enterSiege(),true,'Only an unlocked, saveable Tier I siege starts');
 const startUnique=p.uniqueClears;
 let frames=0,lastWave=r.wave,started=r.time,healthAtFive=null;
 while(r.phase!=='fallen'&&r.wavesCleared<20&&frames<60000){
  if(r.phase==='fighting'&&r.wave!==lastWave){lastWave=r.wave;started=r.time;}
  h.tick(.05);frames++;
  if(r.wavesCleared===5&&healthAtFive===null)healthAtFive=r.health;
  if(frames%70===0){
   assert(r.enemies.length<=24&&r.shots.length<=48,'Mobile entity limits');
   assert(Number.isFinite(r.health)&&r.health>=0&&r.health<=r.maxHealth);
  }
  if(r.phase==='fighting'&&r.time-started>95)throw Error('Combat timed out on wave '+r.wave);
 }
 assert(frames<60000,'Bounded actual wave simulation');
 assert(p.uniqueClears>=startUnique&&p.uniqueClears>=r.wavesCleared,'Unique-clear ledger only grows from real combat');
 assert(p.firstWatchClaimed.includes(0),'First Blood earned on real active play');
 assert.equal(JSON.parse(store[SAVE]).uniqueClears,p.uniqueClears,'Original save commits actual first clears');
 const ledger=h.sigilLedgerSummary();
 assert.equal(ledger.held+ledger.future,ledger.claimed+ledger.unclaimed+ledger.earnedWatch+ledger.unclaimedWatch,'One-time Sigil conservation');
 const claims=JSON.stringify(p.firstWatchClaimed),sigils=p.sigils;
 h.awardFirstWatch();assert.equal(JSON.stringify(p.firstWatchClaimed),claims);
 assert.equal(p.sigils,sigils,'No repeatable Sigil rewards');
 return {clears:r.wavesCleared,phase:r.phase,breaches:r.totalBreaches,wallAtFive:healthAtFive,
  activeMin:+((p.battleSeconds-startActive)/60).toFixed(2),totalMin:+(p.battleSeconds/60).toFixed(2),
  firstWatch:p.firstWatchClaimed.length,best:p.bestByTier[1]||0,level:p.level,sigils:p.sigils};
}
function study(code,path,seed){
 const w=world(code,seed),p=w.h.p(),gear=JSON.stringify(p.inventory.slice(0,4)),runes=JSON.stringify(p.runes.slice(0,2));
 assert.equal(p.level,1);assert.equal(p.essence,180);
 const opening=buyPath(w,path),first=realBattle(w);
 let retry=null,earned=null,third=null,thirdEarned=null;
 if(first.phase==='fallen'&&first.clears<20){
  earned=buyEarnedRetry(w,path);
  retry=realBattle(w);
  // A second early defeat is measured pacing evidence, not a reason to
  // fabricate rewards. Continue using only genuinely earned resources.
  if(retry.phase==='fallen'&&retry.clears<20){
   thirdEarned=buyEarnedRetry(w,path);
   third=realBattle(w);
  }
 }
 assert.equal(JSON.stringify(p.inventory.slice(0,4)),gear,'Starter gear remains owned');
 assert.equal(JSON.stringify(p.runes.slice(0,2)),runes,'Starter runes remain owned');
 assert(!Object.hasOwn(JSON.parse(w.store[SAVE]),'fortitudeBreachWard'),'No new saved fields');
 return {opening,first,retry,third,earned,thirdEarned,finalRank:p.training.fort||0,minutes:+(p.battleSeconds/60).toFixed(2)};
}
for(const [index,path] of paths.entries()){
 for(const seed0 of [15111,15113,15117]){
  const seed=seed0+index*100;
  const before=study(oldFormulaSource,path,seed),after=study(source,path,seed);
  assert.equal(before.opening.spent,after.opening.spent,'Paired budgets and ranks must match');
  assert.equal(before.opening.bought,6);assert.equal(after.opening.bought,6);
  // Opening purchases match exactly; later earned budgets may legitimately
  // diverge if one strategy survives longer and wins more wave resources.
  if(path==='might'){
   assert.equal(before.first.clears,after.first.clears,'No-Fortitude offense control must remain unchanged');
   assert.equal(before.first.breaches,after.first.breaches,'No-Fortitude control must retain identical breaches');
  }else{
   assert(after.first.clears>=before.first.clears,'Mitigation must not lose early waves under identical seeds');
  }
  actual.push({path,seed,before,after,deltaClears:after.first.clears-before.first.clears,
   retryDelta:(after.retry?.clears??0)-(before.retry?.clears??0)});
 }
}
const guarded=actual.filter(x=>x.path==='guardian'),balanced=actual.filter(x=>x.path==='balanced');
assert.equal(guarded.length,3);assert.equal(balanced.length,3);
assert(actual.some(x=>x.after.retry),'Earned resources produce a real second attempt');
const reachedChapterTwo=actual.filter(x=>(x.after.third||x.after.retry||x.after.first).firstWatch>=2);
const chapterTwoGap=actual.filter(x=>(x.after.third||x.after.retry||x.after.first).firstWatch<2)
 .map(x=>({path:x.path,seed:x.seed,minutes:x.after.minutes,highestEarnedWave:x.after.third?.best??x.after.retry?.best??x.after.first.best}));
for(const row of reachedChapterTwo){
 const result=row.after.third||row.after.retry||row.after.first;
 assert(result.totalMin>=7,'Second chapter requires seven actual active minutes');
 assert(result.best>=11,'Second chapter requires eleven genuine new first clears');
}
console.log('SECOND FIRST WATCH CHAPTER REAL-COHORT RESULT '+JSON.stringify({
 reached:reachedChapterTwo.length,total:actual.length,unreached:chapterTwoGap
}));
for(const path of paths){
 const rows=actual.filter(x=>x.path===path);
 console.log('PAIRED FORTITUDE '+path.toUpperCase()+' · first clears old '+rows.map(x=>x.before.first.clears).join('/')+
  ' vs new '+rows.map(x=>x.after.first.clears).join('/')+
  ' · retry old '+rows.map(x=>x.before.retry?.clears??'-').join('/')+
  ' vs new '+rows.map(x=>x.after.retry?.clears??'-').join('/')+
  ' · third old '+rows.map(x=>x.before.third?.clears??'-').join('/')+
  ' vs new '+rows.map(x=>x.after.third?.clears??'-').join('/'));
}
console.log('FORTITUDE PAIRED EARNED-RETRY RESULTS '+JSON.stringify(actual));
console.log('PASS Alpha 0.15.16: capped 24% Fortitude breach ward, 18 matched actual first sieges and up to three earned attempts each, finite rewards and verified saves');
console.log('LIMIT: seeded Tier I up-to-three-attempt cohorts, not a full 750-minute player progression or 1,250-hour completion proof.');
