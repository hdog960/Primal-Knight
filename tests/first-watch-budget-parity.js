// Alpha 0.15.14: genuine post-Chapter-V Tier III expedition and owned item readiness.
// Reuses the Alpha 0.15.14 deterministic combat harness and verified existing save behavior.
// Alpha 0.15.14 — real earned multi-territory First Watch routes and safe player selection.
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

assert(html.includes('ALPHA 0.15.14')&&html.includes('game.js?v=0.15.14')&&html.includes('style.css?v=0.15.14'));
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




// Alpha 0.15.14: UI-only price fixtures. All synthetic chapter flags and
// balances below are boundaries, NEVER claimed as earned play.
assert(html.includes('ALPHA 0.15.14')&&html.includes('game.js?v=0.15.14'));
assert(css.includes('.veteran-envelope')&&css.includes('.veteran-envelope-paths'));
assert(css.includes('@media(max-width:610px){.veteran-envelope-paths{grid-template-columns:1fr}}'));
const price=(id,lv)=>{
 const model={power:[8,1.125],haste:[8,1.155],fort:[10,1.12]};
 const [base,mul]=model[id];
 return Math.floor(base*(1+lv*.075+lv*lv*.004)*Math.pow(1+(mul-1)*.07,Math.min(lv,120))*Math.pow(1.002,Math.max(0,lv-120)));
};
const fresh=world(151201);
assert.equal(fresh.h.veteranWatchEnvelope(),null);
assert.equal(fresh.h.renderVeteranWatchEnvelope(),'');
const fixture=world(151202),fh=fixture.h,fp=fh.p();
fp.firstWatchClaimed=Array.from({length:10},(_,i)=>i);
fp.battleSeconds=205*60;fp.uniqueClears=313;fp.essence=7000;
fp.training={power:122,haste:35,fort:46};
const original=JSON.stringify(fp),q=fh.veteranWatchEnvelope();
assert(q&&q.held===7000&&q.budget===3500);
assert.equal(q.paths.length,2);
for(const route of q.paths){
 assert(route.spent<=3500&&route.remaining===3500-route.spent);
 assert(route.items.length<=6);
 const currentRanks={power:122,haste:35,fort:46};let verifiedSpend=0;
 for(const purchase of route.items){
  const lv=currentRanks[purchase.id]++;
  assert.equal(purchase.rank,lv+1);
  assert.equal(purchase.price,price(purchase.id,lv));
  verifiedSpend+=purchase.price;
 }
 assert.equal(route.spent,verifiedSpend,'Exact original sequential cost');
 if(route.blocked?.price!==null&&route.blocked){
  assert(route.blocked.price>route.remaining,'Sequence ends only when next price exceeds remaining envelope');
 }
}
assert.equal(fh.veteranWatchStrategy().goals[0].minutes,253);
const view=fh.renderVeteranWatchStrategy();
assert(view.includes('FIELD SPENDING ENVELOPE')&&view.includes('50% OF HELD ESSENCE'));
assert(view.includes('REVIEW HERO TRAINING'));
fh.renderTierLobby();
assert(fixture.el('milestoneList').innerHTML.includes('class="veteran-envelope"'));
assert.equal(JSON.stringify(fp),original,'Full render has no purchase or save effects');
fp.essence=1;assert.equal(fh.veteranWatchEnvelope().budget,0);
assert(fh.veteranWatchEnvelope().paths.every(x=>x.spent===0&&x.items.length===0));
fp.essence=123456;fp.training={power:1200,haste:500,fort:1000};
assert(fh.veteranWatchEnvelope().paths.every(x=>x.items.length===0&&x.blocked.reason==='MAX RANK'));
fp.firstWatchClaimed=Array.from({length:16},(_,i)=>i);
assert.equal(fh.veteranWatchEnvelope(),null,'Completed Watch does not show old budget planner');
fp.firstWatchClaimed=Array.from({length:9},(_,i)=>i);
assert.equal(fh.veteranWatchEnvelope(),null,'Chapter X gate is actually required');

// Comparable **nominal** per-attempt budget, not fabricated equal purchases.
// Every purchased rank is debited by the real game action; unused budget
// stays held. Actual spent totals may differ and must be reported honestly.
function spendMatched(h,policy){
 const p=h.p(),before=p.essence,allowance=Math.min(8000,Math.floor(before)),purchases=[];
 const route=policy==='might-envelope'?['power','power','power','power','power','power']:
 ['power','haste','fort','power','haste','fort'];
 let spent=0,stop='';
 for(const id of route){
  const rank=p.training[id]||0,cap={power:1200,haste:500,fort:1000}[id];
  if(rank>=cap){stop='CAP';break;}
  const cost=price(id,rank);
  if(cost>allowance-spent){stop='ENVELOPE';break;}
  const old=p.essence;h.action('train:'+id);
  assert.equal(p.training[id],rank+1,'Original Training action buys exact chosen rank');
  assert.equal(p.essence,old-cost,'Exact original price, no invented income');
  purchases.push({id,rank:rank+1,paid:cost});spent+=cost;
 }
 assert.equal(before-p.essence,spent,'Actual Essence debit equals summed paid costs');
 assert(spent<=allowance&&allowance<=8000,'Original held-Essence limit enforced');
 assert(h.save(),'Every matched purchase state saved to the real key');
 return {allowance,spent,unspent:allowance-spent,purchases,stop};
}
function continueCommonProgress(w,n){
 const h=w.h,p=h.p();let tier=n>=4&&n%3!==0&&p.unlockedTier>=2?2:1;
 if(n>=11){assert(p.firstWatchClaimed.includes(4));assert(p.unlockedTier>=3);tier=3;}
 if(n===11)prepareOwnedItems(w);
 if(n>=13){assert(p.firstWatchClaimed.includes(5));assert(p.unlockedTier>=4);tier=4;}
 let built=null;
 if(n===15){assert(p.firstWatchClaimed.includes(6));assert(p.unlockedTier>=5);built=prepareMidgameBuild(w);}
 if(n>=15)tier=n<=16?5:(p.unlockedTier>=6?6:5);
 if(n>=19){
  assert(p.firstWatchClaimed.includes(7),'Genuinely earned Chapter VIII before diverging');
  assert(p.unlockedTier>=7);
  tier=Math.min(p.unlockedTier,7+Math.floor((n-19)/2));
 }
 if(tier!==p.selectedTier){h.renderTierLobby();clickTier(w,tier,false);}
 assert.equal(p.selectedTier,tier);
 assert(tier<=p.unlockedTier);
 return {tier,built};
}
const cohorts=[],prefixes=new Map();
for(const seed of [15411,15423]){
 for(const policy of ['might-envelope','mixed-envelope']){
  const w=world(seed),h=w.h,p=h.p(),history=[],spending=[];
  let built=null,prefixSnapshot=null;
  for(let n=1;n<=48;n++){
   spendSkills(h);
   if(n<=18)spendCombat(h);
   else spending.push({n,...spendMatched(h,policy)});
   spendSkills(h);
   const plan=continueCommonProgress(w,n);if(plan.built)built=plan.built;
   const {tier}=plan;
   const beforeClears=p.uniqueClears;
   const result=siege(h,n<=7?35:n<=9?50:n<=28?65:n<=39?80:95);
   assert.equal(result.tier,tier);
   assert(p.uniqueClears>=beforeClears&&p.uniqueClears===trueBestSum(p));
   const stored=JSON.parse(w.store[SAVE]);
   assert.equal(stored.uniqueClears,p.uniqueClears);
   assert.equal(stored.battleSeconds,p.battleSeconds);
   assert.deepEqual(stored.firstWatchClaimed,Array.from(p.firstWatchClaimed));
   assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length);
   if(p.firstWatchClaimed.includes(9)&&!p.firstWatchClaimed.includes(15)){
    const envelope=h.veteranWatchEnvelope();
    assert(envelope&&envelope.held===p.essence&&envelope.budget===Math.floor(p.essence/2));
    assert(envelope.paths.every(x=>x.spent<=envelope.budget),'Real earned budget quotes never overspend');
    const next=h.firstWatchHorizon(1)[0];
    if(next){
     assert(next.timeRemainingSeconds===Math.max(0,next.minutes*60-p.battleSeconds));
     assert(next.waveRemaining===Math.max(0,next.waveGate-p.uniqueClears));
    }
   }
   if(n===18){
    prefixSnapshot=JSON.stringify({gold:p.gold,essence:p.essence,knowledge:p.knowledge,
     battleSeconds:p.battleSeconds,uniqueClears:p.uniqueClears,
     firstWatchClaimed:p.firstWatchClaimed,training:p.training,unlockedTier:p.unlockedTier,
     bestByTier:p.bestByTier});
    if(!prefixes.has(seed))prefixes.set(seed,prefixSnapshot);
    else assert.equal(prefixSnapshot,prefixes.get(seed),'Same-seed cohorts have identical actually earned pre-divergence characters');
   }
   history.push(result);
  }
  assert(built&&history.length===48&&spending.length===30);
  const loaded=world(seed+151210,w.store),saved=loaded.h.p();
  assert.equal(saved.uniqueClears,p.uniqueClears);
  assert.equal(saved.battleSeconds,p.battleSeconds);
  assert.deepEqual(Array.from(saved.firstWatchClaimed),Array.from(p.firstWatchClaimed));
  assert.equal(saved.socketed.helm,built.ember,'Original earned Ember remains equipped');
  assert(saved.inventory.some(g=>g.id==='first_watch_gear_2'&&g.plus>=1));
  const sig=h.sigilLedgerSummary();assert.equal(p.sigils,sig.claimed+sig.earnedWatch);
  const totalSpent=spending.reduce((n,x)=>n+x.spent,0);
  const totalAllowance=spending.reduce((n,x)=>n+x.allowance,0);
  assert(totalSpent<=totalAllowance,'Cumulative actual spending under nominal ceilings');
  const next=h.firstWatchHorizon(1)[0];
  cohorts.push({seed,policy,sieges:48,minutes:+(p.battleSeconds/60).toFixed(2),
   firstClears:p.uniqueClears,chapters:p.firstWatchClaimed.length,unlockedTier:p.unlockedTier,
   endingEssence:p.essence,might:p.training.power||0,reflexes:p.training.haste||0,
   fortitude:p.training.fort||0,spent:totalSpent,allowed:totalAllowance,
   damage:+h.damage().toFixed(1),wall:h.maxWall(),shotInterval:+h.attackInterval().toFixed(3),
   next:next?{chapter:next.index+1,minutesLeft:+(next.timeRemainingSeconds/60).toFixed(2),wavesLeft:next.waveRemaining}:null,
   last:history.slice(-3).map(x=>({tier:x.tier,best:x.best,chapters:x.chapters}))});
 }
}
assert.equal(cohorts.length,4);
assert(cohorts.every(x=>x.sieges===48&&x.spent<=x.allowed));
assert(cohorts.every(x=>x.chapters>=8),'All real routes reach at least Chapter VIII');
console.log('ALPHA 0.15.14 MATCHED PER-ATTEMPT BUDGET CAPS '+JSON.stringify(cohorts));
console.log('PASS Alpha 0.15.14: price-exact read-only 50% Essence envelope, cap and gate fixtures, 192 earned real sieges with common opening, 8k per-attempt ceilings, exact purchase debits, distinct first-clear/Sigil accounting and real save/reload');
console.log('LIMIT: identical nominal per-attempt spending ceilings are NOT equal actual spending. No synthetic Chapter XII is counted as earned; fixed scripted route/cap observations are not human play, not a full 750-minute Watch, not a measured 1,250-hour completion, and not physical iPhone QA.');
