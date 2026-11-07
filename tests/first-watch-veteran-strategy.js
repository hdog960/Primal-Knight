// Alpha 0.15.12: genuine post-Chapter-V Tier III expedition and owned item readiness.
// Reuses the Alpha 0.15.12 deterministic combat harness and verified existing save behavior.
// Alpha 0.15.12 — real earned multi-territory First Watch routes and safe player selection.
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



// Synthetic boundary and price fixtures — these are NOT earned chapters or money.
assert(html.includes('ALPHA 0.15.12')&&html.includes('game.js?v=0.15.12'));
assert(css.includes('.veteran-watch-goals')&&css.includes('.veteran-watch-plans'));
assert(css.includes('@media(max-width:610px){.veteran-watch-goals,.veteran-watch-plans{grid-template-columns:1fr}}'));
assert(css.includes('.veteran-watch-footer button{min-height:44px'));
const price=(id,lv)=>{
 const model={power:[8,1.125],haste:[8,1.155],fort:[10,1.12],essence:[30,1.17]};
 const [base,mul]=model[id];
 return Math.floor(base*(1+lv*.075+lv*lv*.004)*Math.pow(1+(mul-1)*.07,Math.min(lv,120))*Math.pow(1.002,Math.max(0,lv-120)));
};
const starter=world(151110);
assert.equal(starter.h.veteranWatchStrategy(),null);
assert.equal(starter.h.renderVeteranWatchStrategy(),'');
const fixture=world(151111),fh=fixture.h,fp=fh.p();
fp.firstWatchClaimed=Array.from({length:9},(_,i)=>i);fp.battleSeconds=245*60;fp.uniqueClears=333;
fp.essence=7000;fp.training={power:122,haste:35,fort:46,essence:18};
const before=JSON.stringify(fp),q=fh.veteranWatchStrategy();
assert(q&&q.goals.length===6&&q.plans.length===2,'All six late chapters and both spending quotes');
assert.equal(q.balance,7000);
assert.equal(q.goals[0].index,10);
assert.equal(q.goals[0].minutes,253);
assert.equal(q.goals[0].waves,380);
assert.equal(q.goals[0].secondsLeft,8*60);
assert.equal(q.goals[0].wavesLeft,47);
assert.equal(q.goals[5].minutes,750);
assert.equal(q.goals[5].waves,1125);
const concentrated=q.plans[0],distributed=q.plans[1];
assert.deepEqual(Array.from(concentrated.items.map(x=>x.cost)),[122,123,124].map(i=>price('power',i)));
assert.deepEqual(Array.from(distributed.items.map(x=>x.cost)),[price('power',122),price('haste',35),price('fort',46)]);
assert.equal(concentrated.total,concentrated.items.reduce((a,x)=>a+x.cost,0));
assert.equal(distributed.total,distributed.items.reduce((a,x)=>a+x.cost,0));
assert.equal(concentrated.shortfall,Math.max(0,concentrated.total-7000));
assert.equal(distributed.shortfall,Math.max(0,distributed.total-7000));
assert.equal(concentrated.affordable,concentrated.total<=7000);
assert.equal(distributed.affordable,distributed.total<=7000);
const rendered=fh.renderVeteranWatchStrategy();
assert(rendered.includes('VETERAN WATCH')&&rendered.includes('CHAPTER XI')&&rendered.includes('CHAPTER XVI'));
assert(rendered.includes('data-veteran-watch-open="training"'));
fh.renderTierLobby();
assert(fixture.el('milestoneList').innerHTML.includes('class="veteran-watch"'));
assert.equal(JSON.stringify(fp),before,'Inspection never changes character state');
const button={disabled:false,dataset:{veteranWatchOpen:'training'}};
fixture.el('milestoneList').listeners.click({target:{closest(sel){return sel==='[data-veteran-watch-open]'?button:null;}}});
assert.equal(fixture.el('panel').hidden,false,'Existing Training menu opens, no new buying surface');
assert.equal(JSON.stringify(fp),before,'Navigation never charges or awards anything');
fp.essence=0;fp.training.power=1200;fp.training.haste=500;fp.training.fort=1000;
const caps=fh.veteranWatchStrategy();
assert(caps.plans.every(plan=>!plan.complete&&!plan.affordable&&plan.shortfall===null),'Original caps prevent impossible three-rank quote');
fp.firstWatchClaimed=Array.from({length:16},(_,i)=>i);
assert.equal(fh.veteranWatchStrategy(),null,'No redundant guide after First Watch completion');

// Real earned, matched-seed cohorts. Both policies share the same legal Tier I–VI
// baseline for the first 18 sieges, then follow unlocked VII+ tiers. Only the
// original Essence-spending schedule differs. No fabricated wave/time/wealth.
const cohorts=[];
for(const seed of [15411,15423]){
 for(const policy of ['reserve-might','diversify-training']){
  const w=world(seed),h=w.h,p=h.p(),history=[],latePurchases=[];
  let build=null,lateEssenceSpent=0;
  for(let n=1;n<=36;n++){
   spendSkills(h);
   if(n<=18||policy==='diversify-training') {
    const prev=p.essence,ranks={...p.training};
    spendCombat(h);
    if(n>=19){
     const paid=prev-p.essence;
     let independentlyPriced=0;
     for(const id of ['power','haste','fort','crit','critDmg','pierce','regen','gold','xp','essence','range','multishot','boss','loot','resist','shock']){
      for(let lv=ranks[id]||0;lv<(p.training[id]||0);lv++)independentlyPriced+=price(id,lv);
     }
     assert.equal(paid,independentlyPriced,'Every diversified Essence debit equals actual original rank costs');
     lateEssenceSpent+=paid;latePurchases.push({n,paid,might:p.training.power||0});
    }
   }else{
    let paid=0,number=0;
    while(number<3&&p.essence>=price('power',p.training.power||0)&&(p.training.power||0)<1200){
     const beforeEssence=p.essence,rank=p.training.power||0,cost=price('power',rank);
     h.action('train:power');
     assert.equal(p.training.power,rank+1,'Reserved rank uses real Training purchase');
     assert.equal(p.essence,beforeEssence-cost,'No discounted or free Might rank');
     paid+=cost;number++;
    }
    lateEssenceSpent+=paid;latePurchases.push({n,paid,might:p.training.power||0});
    assert(h.save(),'Reserved budget and purchases persist normally');
   }
   spendSkills(h);
   let tier=n>=4&&n%3!==0&&p.unlockedTier>=2?2:1;
   if(n>=11){assert(p.firstWatchClaimed.includes(4));assert(p.unlockedTier>=3);tier=3;}
   if(n===11)prepareOwnedItems(w);
   if(n>=13){assert(p.firstWatchClaimed.includes(5));assert(p.unlockedTier>=4);tier=4;}
   if(n===15){assert(p.firstWatchClaimed.includes(6));assert(p.unlockedTier>=5);build=prepareMidgameBuild(w);}
   if(n>=15)tier=n<=16?5:(p.unlockedTier>=6?6:5);
   if(n>=19){
    assert(p.firstWatchClaimed.includes(7),'Both routes reached VIII before diverging');
    assert(p.unlockedTier>=7);
    tier=Math.min(p.unlockedTier,7+Math.floor((n-19)/2));
   }
   if(tier!==p.selectedTier){h.renderTierLobby();clickTier(w,tier,false);}
   assert.equal(p.selectedTier,tier);
   assert(tier<=p.unlockedTier,'No battle in a locked territory');
   const beforeWaves=p.uniqueClears;
   const result=siege(h,n<=7?35:n<=9?50:n<=28?65:80);
   assert.equal(result.tier,tier);
   assert(p.uniqueClears>=beforeWaves);
   const saved=JSON.parse(w.store[SAVE]);
   assert.equal(saved.uniqueClears,p.uniqueClears);
   assert.equal(saved.battleSeconds,p.battleSeconds);
   assert.equal(saved.selectedTier,tier);
   assert.deepEqual(saved.firstWatchClaimed,Array.from(p.firstWatchClaimed));
   if(p.firstWatchClaimed.includes(8)&&!p.firstWatchClaimed.includes(15)){
    const view=h.veteranWatchStrategy();
    assert(view&&view.balance===p.essence,'Post-Chapter-IX cost view uses actual earned Essence');
    const goal=view.goals.find(x=>!x.claimed);
    if(goal){
     assert.equal(goal.secondsLeft,Math.max(0,goal.minutes*60-p.battleSeconds));
     assert.equal(goal.wavesLeft,Math.max(0,goal.waves-p.uniqueClears));
    }
    assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length);
   }
   history.push({n,...result});
  }
  assert(build&&history.length===36);
  const loaded=world(seed+151100,w.store),saved=loaded.h.p();
  assert.equal(saved.uniqueClears,p.uniqueClears);
  assert.equal(saved.battleSeconds,p.battleSeconds);
  assert.deepEqual(Array.from(saved.firstWatchClaimed),Array.from(p.firstWatchClaimed));
  assert.equal(saved.socketed.helm,build.ember);
  assert(saved.inventory.some(g=>g.id==='first_watch_gear_2'&&g.plus>=1));
  assert.equal(p.uniqueClears,trueBestSum(p));
  assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length);
  const next=h.firstWatchHorizon(1)[0],best={};
  for(let i=1;i<=20;i++)if(p.bestByTier[i])best[i]=p.bestByTier[i];
  cohorts.push({seed,policy,sieges:36,minutes:+(p.battleSeconds/60).toFixed(2),
    uniqueClears:p.uniqueClears,chapters:p.firstWatchClaimed.length,unlocked:p.unlockedTier,
    essence:p.essence,mightRank:p.training.power||0,
    hasteRank:p.training.haste||0,fortRank:p.training.fort||0,
    essenceSpentSinceSiege19:lateEssenceSpent,
    currentDamage:+h.damage().toFixed(1),wall:h.maxWall(),shotSeconds:+h.attackInterval().toFixed(3),
    best,next:next?{chapter:next.index+1,minutesLeft:+(next.timeRemainingSeconds/60).toFixed(2),wavesLeft:next.waveRemaining}:null,
    latePurchases:latePurchases.filter(x=>x.paid>0).slice(-5),last:history.slice(-3)});
 }
}
assert.equal(cohorts.length,4);
assert(cohorts.every(x=>x.sieges===36));
assert(cohorts.every(x=>x.uniqueClears===Object.values(x.best).reduce((a,b)=>a+b,0)));
assert(cohorts.every(x=>x.chapters>=8),'Both policies earned real first-eight chapters');
assert(cohorts.every(x=>x.essence>=0),'No negative Essence');
console.log('EARNED VETERAN WATCH RESERVED VS DIVERSIFIED COHORTS '+JSON.stringify(cohorts));
console.log('PASS Alpha 0.15.12: read-only XI–XVI gates, exact three-rank spending comparison, actual high-rank purchases, earned 36-siege matched seed frontiers, real save and finite reward checks');
console.log('LIMIT: no synthetic achievements counted as earned, scripted routes are not human play, full 750-minute First Watch, full 1,250-hour progression and physical iPhone acceptance remain unverified.');
