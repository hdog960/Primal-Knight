// Alpha 0.15.23: earned first-watch investment planner, real tap purchases & combat cohorts.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;this.scrollTop=0;this.className='';this.width=960;this.height=540;this.listeners={};this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,f){this.listeners[k]=f}querySelectorAll(){return []}querySelector(){return null}
}
function world(startSeed){
 let seed=startSeed>>>0;const rng=Object.create(Math);
 rng.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.create(null);
 const env={Math:rng,Date,Blob,Image,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(js,env,{filename:'game.js'});return {h:env.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.23')&&html.includes('game.js?v=0.15.23')&&html.includes('style.css?v=0.15.23'));
assert(css.includes('.watch-investment-card button')&&css.includes('min-height:44px'));
assert(css.includes('@media(max-width:610px){.watch-investment-grid{grid-template-columns:1fr}'));
const expect={
 might:{power:4,haste:2,fort:0},
 balanced:{power:2,haste:2,fort:2},
 guardian:{power:1,haste:1,fort:4}
};
const fresh=world(15101),fh=fresh.h,fp=fh.p();
assert.equal(fh.firstWatchInvestmentPaths.length,3);
assert.equal(fh.firstWatchInvestmentQuote('bogus'),null);
assert.equal(fh.purchaseFirstWatchInvestmentRank('bogus'),false);
assert.equal(fp.essence,180);assert.equal(fp.gold,520);
assert(fh.renderFirstWatchInvestmentPaths().includes('BLADE FIRST'));
assert(fh.renderTierLobby()===undefined);
assert(fresh.el('milestoneList').innerHTML.includes('FIRST WATCH · CHOOSE YOUR INVESTMENT'));
const preview=fresh.el('milestoneList').innerHTML;
assert(preview.includes('data-first-watch-invest="might"'));
assert(preview.includes('data-first-watch-invest="balanced"'));
assert(preview.includes('data-first-watch-invest="guardian"'));
assert(!JSON.stringify(fp).includes('firstWatchInvestmentPaths'),'No plan state written to player character');
const costs=[];
for(const path of ['might','balanced','guardian']){
 const q=fh.firstWatchInvestmentQuote(path);
 assert.equal(q.missingRanks,6,'Each optional path contains six actual permanent ranks');
 assert(q.nextAffordable&&q.planAffordable,'Starting 180 Essence can fund each individual six-rank plan');
 assert(q.remainingCost>0&&q.remainingCost<=180,'Quote uses plausible real rank prices');
 costs.push({path,essence:q.remainingCost,firstRank:q.nextId,cost:q.nextCost});
}
const pref=world(15102),ph=pref.h,pp=ph.p();
const costBefore=ph.firstWatchInvestmentQuote('might').remainingCost;
ph.action('train:power');
assert.equal(ph.firstWatchInvestmentQuote('might').missingRanks,5,'Ranks bought in Power → Training count toward the plan');
assert(ph.firstWatchInvestmentQuote('might').remainingCost<costBefore);
assert.equal(ph.purchaseFirstWatchInvestmentRank('missing'),false);
const cohort=[];
for(const [pathIndex,path] of ['might','balanced','guardian'].entries()){
 for(const seed of [15111,15113,15117]){
  const {h,p,store,el}=(()=>{const w=world(seed+pathIndex*100);return{...w,p:w.h.p()}})(),r=h.run();
  const originalGear=JSON.stringify(p.inventory.slice(0,4)),originalRunes=JSON.stringify(p.runes.slice(0,2));
  assert.equal(p.level,1);assert.equal(p.essence,180);
  const upfront=h.firstWatchInvestmentQuote(path);
  let spent=0,taps=0;
  while(h.firstWatchInvestmentQuote(path).missingRanks){
   const quote=h.firstWatchInvestmentQuote(path),previous=p.essence,oldRank=p.training[quote.nextId]||0;
   const offer=h.councilTrainingOffers(h.warCouncilPlan(1,1)).find(o=>o.id===quote.nextId);
   assert.equal(offer.cost,quote.nextCost,'Planner uses identical live Quartermaster cost');
   assert.equal(offer.affordable,true);
   h.renderTierLobby();el('milestoneList').scrollTop=192;
   const target={closest(sel){return sel==='[data-first-watch-invest]'?{disabled:false,dataset:{firstWatchInvest:path}}:null}};
   el('milestoneList').listeners.click({target});
   assert.equal(el('milestoneList').scrollTop,192,'Touch purchase preserves Battle-lobby scroll');
   assert.equal(p.training[quote.nextId],oldRank+1,'One tap purchases exactly one permanent rank');
   assert.equal(p.essence,previous-quote.nextCost,'No free Essence, discounts or duplicated ranks');
   assert.equal(p.gold,520,'Training never secretly costs Gold');
   assert.equal(p.sigils,0,'Training cannot spend or grant Sigils');
   assert.equal(JSON.parse(store[SAVE]).training[quote.nextId],oldRank+1,'Actual tap persists immediately');
   assert.equal(JSON.parse(store[SAVE]).essence,p.essence,'Verified save matches spent budget');
   spent+=quote.nextCost;taps++;
   assert(taps<=6,'Finite six-rank plan');
  }
  const q=h.firstWatchInvestmentQuote(path);
  assert.equal(taps,6);assert.equal(q.missingRanks,0);
  assert.equal(spent,upfront.remainingCost,'Cumulative exact rank costs match preview');
  assert.equal(p.essence,180-spent);
  for(const [id,rank] of Object.entries(expect[path]))assert.equal(p.training[id]||0,rank);
  assert.equal(h.purchaseFirstWatchInvestmentRank(path),false,'Completed plan never buys an extra rank');
  assert.equal(h.purchaseFirstWatchInvestmentRank('bogus'),false);
  assert.equal(h.enterSiege(),true);
  const beforeBattle=p.essence;
  assert.equal(h.purchaseFirstWatchInvestmentRank(path),false,'No planner purchase during real siege');
  assert.equal(p.essence,beforeBattle);
  let ticks=0,lastWave=r.wave,started=r.time;
  while(r.phase!=='fallen'&&r.wavesCleared<20&&ticks<50000){
   if(r.phase==='fighting'&&r.wave!==lastWave){lastWave=r.wave;started=r.time;}
   h.tick(.05);ticks++;
   assert(r.enemies.length<=24&&r.shots.length<=48,'Same bounded mobile actors');
   if(r.phase==='fighting'&&r.time-started>90)throw Error('Encounter timeout wave '+r.wave);
  }
  assert(ticks<50000,'Early actual combat completes within bounded frames');
  assert(p.uniqueClears>=3,'A purchased real starter build earns at least 3 true clears');
  assert(p.firstWatchClaimed.includes(0),'Each cohort earned the two-minute First Blood through actual combat');
  assert.equal(p.uniqueClears,p.bestByTier[1],'True Tier I clears, not fabricated milestones');
  assert.equal(JSON.stringify(p.inventory.slice(0,4)),originalGear,'Starter gear remains owned');
  assert.equal(JSON.stringify(p.runes.slice(0,2)),originalRunes,'Starter runes remain owned');
  assert(!Object.hasOwn(JSON.parse(store[SAVE]),'firstWatchInvestmentPaths'),'No new character save fields');
  const beforeAwards=JSON.stringify({claimed:p.firstWatchClaimed,sigils:p.sigils});
  h.awardFirstWatch();
  assert.equal(JSON.stringify({claimed:p.firstWatchClaimed,sigils:p.sigils}),beforeAwards,'No repeatable chapter or Sigils');
  cohort.push({path,seed:seed+pathIndex*100,clears:r.wavesCleared,phase:r.phase,level:p.level,activeMinutes:+(p.battleSeconds/60).toFixed(2),spentEssence:spent,firstWatch:p.firstWatchClaimed.length});
 }
}
assert.equal(cohort.length,9);
assert.equal(new Set(cohort.map(x=>x.path)).size,3);
for(const path of ['might','balanced','guardian']){
 const rows=cohort.filter(x=>x.path===path);
 assert.equal(rows.length,3);
 assert(rows.every(x=>x.clears>=3),'All strategies must produce earned advancement');
 console.log('EARNED FIRST WATCH '+path.toUpperCase()+' · clears '+rows.map(x=>x.clears).join('/')+' · actual budget '+rows[0].spentEssence+' Essence');
}
console.log('CUMULATIVE REAL TRAINING PRICE QUOTES '+JSON.stringify(costs));
console.log('NINE PURCHASED-BUILD REAL COMBAT COHORTS '+JSON.stringify(cohort));
console.log('PASS Alpha 0.15.23: 3 live-cost rank targets, explicit mobile UI one-rank purchases, nine seed-paired starter combats, original saves and finite reward economy');
console.log('LIMIT: Short scripted first attempts, not full 12.5h earned progression, measured player win rates, iPhone manual QA or 1250h completion.');
