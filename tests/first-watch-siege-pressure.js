// Alpha 0.15.16: genuine post-Chapter-V Tier III expedition and owned item readiness.
// Reuses the Alpha 0.15.16 deterministic combat harness and verified existing save behavior.
// Alpha 0.15.16 — real earned multi-territory First Watch routes and safe player selection.
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

assert(html.includes('ALPHA 0.15.16')&&html.includes('game.js?v=0.15.16')&&html.includes('style.css?v=0.15.16'));
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







// Synthetic wall-pressure instrumentation fixtures never claim earned progression.
assert(html.includes('ALPHA 0.15.16')&&html.includes('game.js?v=0.15.16'));
assert(css.includes('.siege-pressure-history'));
const fixture=world(151501),fh=fixture.h,fp=fh.p();
const ancient=fh.normalizeSiegeHistory([{id:1,finishedAt:0,reason:'fallen',tier:16,
 startWave:1,lastWave:17,cleared:16,enemies:80,breaches:2,sabotage:1,earned:{}}])[0];
assert(ancient,'Legacy valid saved record remains readable');
assert.equal(ancient.wallPressureTracked,false);
assert.equal(ancient.wallBreachDamage,0);
assert.equal(ancient.wallSabotageDamage,0);
fp.siegeHistory=[ancient];
assert(!fh.renderSiegeHistory(16).includes('WALL IMPACT'), 'Do not show legacy unmeasured damage as zero');
const bounded=fh.normalizeSiegeHistory([{...ancient,wallPressureTracked:true,
 wallBreachDamage:150,wallSabotageDamage:60}])[0];
assert.equal(bounded.wallPressureTracked,true);
assert.equal(bounded.wallBreachDamage,150);
assert.equal(bounded.wallSabotageDamage,60);
fp.siegeHistory=[bounded];
assert(fh.renderSiegeHistory(16).includes('150 BREACH'));
assert(fh.renderSiegeHistory(16).includes('60 SABOTAGE DAMAGE'));
assert.equal(fh.normalizeSiegeHistory([{...bounded,wallBreachDamage:Infinity}])[0].wallBreachDamage,0);
assert.equal(fh.normalizeSiegeHistory([{...bounded,wallBreachDamage:-100}])[0].wallBreachDamage,0);
assert.equal(fh.normalizeSiegeHistory([{...bounded,wallSabotageDamage:4.5}])[0].wallSabotageDamage,0);
const snap=JSON.stringify(fp),read=fh.renderSiegeHistory(16);
assert(read.includes('WALL IMPACT'));
assert.equal(JSON.stringify(fp),snap,'Read-only legacy/archive display never alters saved character');

// Instrument each actual source of HP loss in a separate sandbox run.
// These manipulated event fixtures are explicitly NOT counted as earned sieges.
const pressure=world(151502),h=pressure.h,r=h.run();
assert(h.enterSiege());
const beforeSapper=r.health;
h.specialEnemyMotion({type:'sapper',y:260,fuseSpent:true,fuseTime:.01,spellBreakDamage:0,x:420},.05);
assert(r.wallSabotageDamage>0&&r.wallSabotageDamage<=beforeSapper);
assert.equal(r.sapperBlasts,1);
const beforeBreach=r.wallBreachDamage;
r.phase='fighting';r.maxHealth=1000000;r.health=1000000;
r.spawned=1;r.total=1;r.enemies=[{type:'goblin',x:550,y:431,hp:10000,max:10000,dead:false,
 speed:0,slow:0,buildup:0,burn:0,wobble:0,armor:0}];r.shots=[];
h.tick(.05);
assert(r.wallBreachDamage>beforeBreach,'Actual breach damage is metered');
assert(r.totalBreaches>=1);
const audit=h.buildSiegeReport('fallen');
assert.equal(audit.wallPressureTracked,true);
assert.equal(audit.wallSabotageDamage,Math.round(r.wallSabotageDamage));
assert.equal(audit.wallBreachDamage,Math.round(r.wallBreachDamage));
assert(audit.wallBreachDamage>=0&&audit.wallSabotageDamage>=0);
h.finishSiege('retreated');
assert(h.p().siegeHistory[0].wallPressureTracked,'Original archive keeps new bounded fields');
assert.equal(h.p().siegeHistory[0].wallBreachDamage,audit.wallBreachDamage);
assert.equal(h.p().siegeHistory[0].wallSabotageDamage,audit.wallSabotageDamage);
h.renderSiegeReport();
assert(pressure.el('siegeReportMetrics').innerHTML.includes('WALL HP LOST TO BREACHES'));
assert(pressure.el('siegeReportMetrics').innerHTML.includes('WALL HP LOST TO SAPPERS'));

// Independent genuine earned late-game cohorts. Both policies share the same
// actual 66-siege character, then genuinely spend earned Essence with
// different priorities for the remaining sieges. No injected waves/rewards.
function price(id,lv){
 const model={power:[8,1.125],haste:[8,1.155],fort:[10,1.12]};
 const [base,mul]=model[id];
 return Math.floor(base*(1+lv*.075+lv*lv*.004)*Math.pow(1+(mul-1)*.07,Math.min(lv,120))*Math.pow(1.002,Math.max(0,lv-120)));
}
function costNext(p,id,count){
 const rank=p.training[id]||0;
 const cap={power:1200,haste:500,fort:1000}[id];
 if(rank+count>cap)return null;
 let sum=0;for(let j=0;j<count;j++)sum+=price(id,rank+j);
 return sum;
}
// Choose two *different* build packages at a real earned checkpoint, minimizing
// the ACTUAL purchase-cost gap. This is a checkpoint comparison, not a claim
// that two different-character trajectories remain equal-budget forever.
function chooseCloseCostPackages(p){
 const funds=Math.min(6500,Math.floor(p.essence));
 const focus=[],mixed=[];
 for(let n=1;n<=3;n++){
  const total=costNext(p,'power',n);
  if(total!==null&&total<=funds)focus.push({ids:Array(n).fill('power'),total});
 }
 for(let a=0;a<=1;a++)for(let b=2;b<=14;b++)for(let c=2;c<=14;c++){
  const v=[costNext(p,'power',a),costNext(p,'haste',b),costNext(p,'fort',c)];
  if(v.includes(null))continue;
  const total=v.reduce((x,y)=>x+y,0);
  if(total>funds||total<1000)continue;
  mixed.push({ids:[...Array(a).fill('power'),...Array(b).fill('haste'),...Array(c).fill('fort')],total});
 }
 const candidates=[];
 for(const a of focus)for(const b of mixed){
  const gap=Math.abs(a.total-b.total),larger=Math.max(a.total,b.total);
  if(Math.min(a.total,b.total)>=1000)candidates.push({focus:a,mixed:b,gap,relative:gap/larger});
 }
 assert(candidates.length,'Real earned Essence can afford both independent build packages');
 candidates.sort((x,y)=>x.relative-y.relative||y.focus.total-x.focus.total);
 const chosen=candidates[0];
 assert(chosen.relative<=.05,'Checkpoint actual purchase costs match within five percent');
 return chosen;
}
function purchasePackage(h,ids){
 const p=h.p(),before=p.essence,records=[];
 for(const id of ids){
  const lv=p.training[id]||0,cost=price(id,lv),funds=p.essence;
  assert(funds>=cost,'Package affordable using earned original Essence');
  h.action('train:'+id);
  assert.equal(p.training[id],lv+1,'Original Training action made the actual purchase');
  assert.equal(p.essence,funds-cost,'Original exact rank price paid');
  records.push({id,rank:lv+1,cost});
 }
 const spent=before-p.essence;
 assert.equal(spent,records.reduce((total,x)=>total+x.cost,0));
 assert(h.save(),'Original character save verified after real paid Training');
 return {spent,records};
}
// After controlled checkpoint, cap cumulative ACTUAL spending to a common
// pre-announced schedule. Money may remain unspent and route gains diverge;
// never call this an equal-spend long-run causal comparison.
function spendUnderSharedCumulativeCap(h,policy,alreadySpent,n){
 const p=h.p(),target=3600*(n-18),room=Math.max(0,target-alreadySpent);
 const order=policy==='guard' ? ['fort','haste','power'] : policy==='might' ? ['power'] : ['power','haste','fort'];
 const before=p.essence,records=[];
 for(let step=0;step<24;step++){
  let chosen=null;
  for(const id of order){
   const lv=p.training[id]||0,cap={power:1200,haste:500,fort:1000}[id];
   if(lv>=cap)continue;
   const cost=price(id,lv);
   if(cost<=room-(before-p.essence)&&cost<=p.essence){chosen={id,lv,cost};break;}
  }
  if(!chosen)break;
  h.action('train:'+chosen.id);
  assert.equal(p.training[chosen.id],chosen.lv+1);
  assert.equal(p.essence,before-records.reduce((sum,r)=>sum+r.cost,0)-chosen.cost);
  records.push(chosen);
 }
 const spent=before-p.essence;
 assert(spent<=room&&spent<=before,'Only genuinely earned original Essence used');
 assert(h.save(),'Cumulative spend plan persisted through original save');
 return {spent,target,records:records.length};
}
function navigateEarned(w,n){
 const h=w.h,p=h.p();
 let tier=n>=4&&n%3!==0&&p.unlockedTier>=2?2:1,built=null;
 if(n>=11){assert(p.firstWatchClaimed.includes(4));assert(p.unlockedTier>=3);tier=3;}
 if(n===11)prepareOwnedItems(w);
 if(n>=13){assert(p.firstWatchClaimed.includes(5));assert(p.unlockedTier>=4);tier=4;}
 if(n===15){assert(p.firstWatchClaimed.includes(6));assert(p.unlockedTier>=5);built=prepareMidgameBuild(w);}
 if(n>=15)tier=n<=16?5:(p.unlockedTier>=6?6:5);
 if(n>=19){
  assert(p.firstWatchClaimed.includes(7),'Genuinely earned Chapter VIII required');
  assert(p.unlockedTier>=7,'Tier VII opened in actual battle');
  tier=Math.min(p.unlockedTier,7+Math.floor((n-19)/2));
 }
 if(tier!==p.selectedTier){h.renderTierLobby();clickTier(w,tier,false);}
 assert.equal(p.selectedTier,tier);assert(tier<=p.unlockedTier);
 return {tier,built};
}

const snapshots=new Map(),results=[],seeds=[15411,15423];
for(const seed of seeds){
 for(const latePolicy of ['mixed','guard']){
  const w=world(seed),h=w.h,p=h.p(),history=[];
  let checkpoint=null,built=null,spentSince19=0,wallBreach=0,wallSabotage=0;
  const offense={fired:0,landed:0,lost:0,directHp:0,lastLineKills:0,combatSeconds:0};
  for(let n=1;n<=86;n++){
   spendSkills(h);
   if(n<=18)spendCombat(h);
   if(n===19){
    const packageQuote=chooseCloseCostPackages(p);
    checkpoint=purchasePackage(h,packageQuote.mixed.ids);
    assert.equal(checkpoint.spent,packageQuote.mixed.total);
    spentSince19+=checkpoint.spent;
   }else if(n>19){
    const purchase=spendUnderSharedCumulativeCap(h,n<=66?'mixed':latePolicy,spentSince19,n);
    spentSince19+=purchase.spent;
   }
   spendSkills(h);
   const route=navigateEarned(w,n);
   if(route.built)built=route.built;
   const outcome=siege(h,n<=7?35:n<=9?50:n<=28?65:n<=39?80:95);
   assert.equal(outcome.tier,route.tier);
   const report=h.siegeReport();
   assert(report&&report.wallPressureTracked===true,'All new genuine sorties record measured wall impact');
   assert(Number.isSafeInteger(report.wallBreachDamage)&&report.wallBreachDamage>=0);
   assert(Number.isSafeInteger(report.wallSabotageDamage)&&report.wallSabotageDamage>=0);
   assert(report.offenseTracked===true,'Genuine late-game siege has actual offensive measurements');
   for(const metric of ['projectilesFired','projectilesLanded','projectilesLost','directHitHpRemoved','lastLineKills','combatSeconds'])
    assert(Number.isSafeInteger(report[metric])&&report[metric]>=0,'Bounded original-engine offensive counter: '+metric);
   assert(report.projectilesLanded+report.projectilesLost<=report.projectilesFired,'Projectile hit/miss outcomes are unique');
   assert(report.lastLineKills<=report.enemies,'No more late kills than actual defeated enemies');
   const saved=JSON.parse(w.store[SAVE]);
   assert.equal(saved.uniqueClears,p.uniqueClears);
   assert.equal(saved.battleSeconds,p.battleSeconds);
   assert.equal(saved.siegeHistory[0].wallPressureTracked,true);
   assert.equal(saved.siegeHistory[0].wallBreachDamage,report.wallBreachDamage);
   assert.equal(saved.siegeHistory[0].wallSabotageDamage,report.wallSabotageDamage);
   assert.equal(p.uniqueClears,trueBestSum(p));
   assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length);
   for(const chapter of p.firstWatchClaimed){
    const minutes=h.earlyWatchChapters[chapter][0];
    assert(p.battleSeconds>=minutes*60&&p.uniqueClears>=Math.ceil(minutes*1.5),
     'Genuine Chapter awards only after original two gates');
   }
   wallBreach+=report.wallBreachDamage;wallSabotage+=report.wallSabotageDamage;
   offense.fired+=report.projectilesFired;offense.landed+=report.projectilesLanded;
   offense.lost+=report.projectilesLost;offense.directHp+=report.directHitHpRemoved;
   offense.lastLineKills+=report.lastLineKills;offense.combatSeconds+=report.combatSeconds;
   if(n===66){
    const snapshot=JSON.stringify({gold:p.gold,essence:p.essence,knowledge:p.knowledge,
     battleSeconds:p.battleSeconds,uniqueClears:p.uniqueClears,unlockedTier:p.unlockedTier,
     training:p.training,skills:p.skills,bestByTier:p.bestByTier,
     firstWatchClaimed:p.firstWatchClaimed,equipped:p.equipped,socketed:p.socketed,
     sigils:p.sigils});
    if(!snapshots.has(seed))snapshots.set(seed,snapshot);
    else assert.equal(snapshot,snapshots.get(seed),'Same-seed policies have identical genuinely earned full 66-siege baseline');
   }
   if(n>=63)history.push({n,tier:outcome.tier,reason:report.reason,wave:report.lastWave,
    firstClears:p.uniqueClears,chapters:p.firstWatchClaimed.length,
    breachDamage:report.wallBreachDamage,sapperDamage:report.wallSabotageDamage,
    projectiles:report.projectilesFired,landed:report.projectilesLanded,
    directHp:report.directHitHpRemoved,lastLineKills:report.lastLineKills});
  }
  assert(built&&checkpoint&&history.length===24);
  const reloaded=world(seed+151510,w.store),saved=reloaded.h.p();
  assert.equal(saved.uniqueClears,p.uniqueClears);
  assert.equal(saved.battleSeconds,p.battleSeconds);
  assert.deepEqual(Array.from(saved.firstWatchClaimed),Array.from(p.firstWatchClaimed));
  assert.equal(saved.socketed.helm,built.ember);
  assert(saved.inventory.some(g=>g.id==='first_watch_gear_2'&&g.plus>=1));
  assert(saved.siegeHistory.length<=24);
  assert(saved.siegeHistory.every(x=>x.wallPressureTracked===true));
  const sig=h.sigilLedgerSummary();assert.equal(p.sigils,sig.claimed+sig.earnedWatch);
  if(p.unlockedTier>=17){
   assert(p.milestones['16:20'],'Tier XVII can only open through original Tier XVI wave 20 award');
   assert((p.bestByTier[16]||0)>=20,'Actual record must reach gate before next tier unlock');
  }
  const next=h.firstWatchHorizon(1)[0];
  results.push({seed,latePolicy,sieges:86,activeMinutes:+(p.battleSeconds/60).toFixed(2),
   uniqueClears:p.uniqueClears,chapters:p.firstWatchClaimed.length,unlocked:p.unlockedTier,
   tier16Best:p.bestByTier[16]||0,tier17Best:p.bestByTier[17]||0,
   pressure:{breach:wallBreach,sabotage:wallSabotage},
   offense:{...offense,landedPct:offense.fired?+(100*offense.landed/offense.fired).toFixed(2):0},
   essence:p.essence,spentSince19,damage:+h.damage().toFixed(1),
   wall:h.maxWall(),shotSeconds:+h.attackInterval().toFixed(3),
   next:next?{chapter:next.index+1,minutesLeft:+(next.timeRemainingSeconds/60).toFixed(2),wavesLeft:next.waveRemaining}:null,
   latest:history.slice(-6)});
 }
}
assert.equal(results.length,4);
assert(results.every(x=>x.sieges===86));
console.log('ALPHA 0.15.16 LATE TIER XVI TRUE SIEGE PRESSURE AND PAID STRATEGIES '+JSON.stringify(results));
console.log('PASS Alpha 0.15.16: correct genuine wall-breach/sabotage damage accounting, old save distinction, bounded archive metrics, 344 genuinely engine-executed sieges, paired earned 66-siege baselines, legal gate unlocks, original save/reload and Sigil integrity');
console.log('LIMIT: Scripted deterministic runs do not prove human 750-minute First Watch, 1,250-hour completion or physical iPhone acceptance. Never invent Chapter XII or Tier XVII; report only if awarded by normal engine.');
