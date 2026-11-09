// Alpha 0.15.27: genuine post-Chapter-V Tier III expedition and owned item readiness.
// Reuses the Alpha 0.15.27 deterministic combat harness and verified existing save behavior.
// Alpha 0.15.27 — real earned multi-territory First Watch routes and safe player selection.
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

assert(html.includes('ALPHA 0.15.27')&&html.includes('game.js?v=0.15.27')&&html.includes('style.css?v=0.15.27'));
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
assert(html.includes('ALPHA 0.15.27')&&html.includes('game.js?v=0.15.27'));
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

const snapshots=new Map(),offenseBases=new Map(),results=[],seeds=[15411,15423];
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
   assert(report.wavePressureTracked===true&&report.wavePressureSamples.length>0&&report.wavePressureSamples.length<=6,
    'Genuine late-game siege preserves six most recent combat waves');
   assert(report.wavePressureSamples.at(-1).wave<=report.lastWave&&
    (report.reason!=='fallen'||report.wavePressureSamples.at(-1).wave===report.lastWave),
    'Failed waves are recorded; an intermission retreat must not invent the next unplayed wave');
   assert(report.wavePressureSamples.every((q,i,a)=>q.wave>=report.startWave&&q.wave<=report.lastWave&&
    (i===0||q.wave>a[i-1].wave)&&q.projectilesLanded<=q.projectilesFired),
    'Latest individual wave evidence stays chronological and conserves hits');
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
    if(latePolicy==='mixed'){
     assert(w.store[SAVE],'Actual 66-siege checkpoint must be in the unmodified primary save');
     offenseBases.set(seed,{raw:w.store[SAVE],spentSince19});
    }
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
// Alpha 0.15.27: Replay the exact genuinely earned 66-siege checkpoint for
// a controlled next-20-sortie intervention. Both policies start with identical
// stored character bytes and the same newly seeded RNG stream; outcomes and
// cumulative actual Essence expenditures may diverge after the first fight.
// No forged tiers, rewards, chapter clocks, character stats or Sigils.
const lateOffensivePairs=[];
for(const seed of seeds){
 const base=offenseBases.get(seed);
 assert(base?.raw,'A genuinely earned, fully saved mixed-policy siege-66 character exists');
 const before=JSON.parse(base.raw);
 assert(before.unlockedTier>=16,'Real opening career must unlock Tier XVI before study');
 for(const policy of ['might','mixed']){
  const w=world(seed+1717,{[SAVE]:base.raw}),h=w.h,p=h.p();
  assert.equal(JSON.stringify(p.bestByTier),JSON.stringify(before.bestByTier),'No frontier records fabricated on checkpoint reload');
  assert.equal(p.uniqueClears,before.uniqueClears);
  assert.equal(p.sigils,before.sigils);
  assert.equal(p.essence,before.essence);
  assert.equal(JSON.stringify(p.training),JSON.stringify(before.training));
  let paid=base.spentSince19,spentAfter66=0;
  const offense={launched:0,landed:0,lost:0,directHp:0,lastLineKills:0,breaches:0,wallHp:0};
  const samples=[];
  for(let n=67;n<=86;n++){
   spendSkills(h);
   const purchased=spendUnderSharedCumulativeCap(h,policy,paid,n);
   paid+=purchased.spent;spentAfter66+=purchased.spent;
   const route=navigateEarned(w,n);
   const battle=siege(h,95),report=h.siegeReport();
   assert.equal(route.tier,battle.tier);
   assert(report&&report.offenseTracked&&report.wallPressureTracked);
   assert(report.projectilesLanded+report.projectilesLost<=report.projectilesFired);
   assert.equal(p.siegeHistory[0].projectilesFired,report.projectilesFired);
   assert.equal(p.uniqueClears,trueBestSum(p));
   const sig=h.sigilLedgerSummary();assert.equal(p.sigils,sig.claimed+sig.earnedWatch);
   offense.launched+=report.projectilesFired;offense.landed+=report.projectilesLanded;
   offense.lost+=report.projectilesLost;offense.directHp+=report.directHitHpRemoved;
   offense.lastLineKills+=report.lastLineKills;offense.breaches+=report.breaches;
   offense.wallHp+=report.wallBreachDamage+report.wallSabotageDamage;
   if(n>=82)samples.push({n,tier:route.tier,wave:report.lastWave,
    firstClears:p.uniqueClears,breaches:report.breaches,directHp:report.directHitHpRemoved});
  }
  assert((p.bestByTier[16]||0)>=before.bestByTier[16],'Already earned Tier XVI records never regress');
  if(p.unlockedTier>=17){
   assert(p.milestones['16:20']&&p.bestByTier[16]>=20,'Tier XVII unlock requires a real completed Tier XVI wave 20');
  }
  const load=world(seed+1817,{[SAVE]:w.store[SAVE]});
  assert.equal(load.h.p().uniqueClears,p.uniqueClears);
  assert.equal(load.h.p().sigils,p.sigils);
  assert.equal(load.h.p().siegeHistory[0].offenseTracked,true);
  lateOffensivePairs.push({seed,policy,lateSieges:20,paidEssenceAfter66:spentAfter66,
   activeMinutes:+(p.battleSeconds/60).toFixed(2),
   firstClears:p.uniqueClears,watchChapters:p.firstWatchClaimed.length,
   unlockedTier:p.unlockedTier,tier16Best:p.bestByTier[16]||0,
   attackDamage:+h.damage().toFixed(1),attackSeconds:+h.attackInterval().toFixed(3),
   wall:h.maxWall(),offense,samples});
 }
}
assert.equal(lateOffensivePairs.length,4);
console.log('ALPHA 0.15.27 EXACT EARNED CHECKPOINT · SEEDED LATE OFFENSIVE VS MIXED '+JSON.stringify(lateOffensivePairs));
// 0.15.27 — target-order intervention ONLY, with unchanged original
// mixed Training purchases. Reuse the identical, legitimately earned siege-66
// character bytes per seed and use an identical fresh seed for both stances.
// Real events and affordable purchases may diverge after stance selection.
const targetingPairs=[];
for(const seed of seeds){
 const base=offenseBases.get(seed);assert(base?.raw,'Real earned siege-66 save required for stance comparison');
 for(const focusStance of ['threat','wallguard']){
  const w=world(seed+1818,{[SAVE]:base.raw}),h=w.h,p=h.p();
  const checkpoint=JSON.parse(base.raw);
  assert.equal(JSON.stringify(p.training),JSON.stringify(checkpoint.training));
  assert.equal(p.essence,checkpoint.essence);
  assert.equal(p.uniqueClears,checkpoint.uniqueClears);
  assert.equal(p.sigils,checkpoint.sigils);
  assert(h.setFocusStance(focusStance),'Select stance honestly before the original siege');
  let paid=base.spentSince19,paidSince66=0;
  const observed={fired:0,landed:0,redirects:0,breaches:0,wallHpLost:0,nearWallKills:0,directHp:0};
  const waveTally=Object.create(null),late=[];
  for(let n=67;n<=86;n++){
   spendSkills(h);
   const purchase=spendUnderSharedCumulativeCap(h,'mixed',paid,n);
   paid+=purchase.spent;paidSince66+=purchase.spent;
   const route=navigateEarned(w,n);
   const outcome=siege(h,95),report=h.siegeReport();
   assert.equal(outcome.tier,route.tier,'No fabricated target tier');
   assert.equal(report.focusStance,focusStance,'Actually ran requested stance');
   assert(Number.isSafeInteger(report.focusRedirects)&&report.focusRedirects>=0);
   if(focusStance==='threat')assert.equal(report.focusRedirects,0,'Original stance never redirects targeting');
   assert(report.offenseTracked&&report.wallPressureTracked);
   assert(report.wavePressureTracked&&report.wavePressureSamples.length>0&&report.wavePressureSamples.length<=6);
   assert(report.wavePressureSamples.at(-1).wave<=report.lastWave&&
    (report.reason!=='fallen'||report.wavePressureSamples.at(-1).wave===report.lastWave),
    'Final failed wave exists; an unstarted post-clear intermission wave is not invented');
   for(const q of report.wavePressureSamples){
    assert(q.projectilesLanded<=q.projectilesFired&&q.nearWallKills<=q.enemiesDefeated);
    assert(q.wallHpEnd<=q.wallMaxStart);
    if(q.wave>=16&&q.wave<=21){
     const row=waveTally[q.wave]??={wave:q.wave,observedRuns:0,cleared:0,fallen:0,
      wallHpLost:0,breaches:0,directHp:0,nearWallKills:0};
     row.observedRuns++;
     if(q.outcome==='cleared')row.cleared++;
     if(q.outcome==='fallen')row.fallen++;
     row.wallHpLost+=q.wallBreachDamage+q.wallSabotageDamage;
     row.breaches+=q.breaches;row.directHp+=q.directHitHpRemoved;
     row.nearWallKills+=q.nearWallKills;
    }
   }
   assert.equal(p.siegeHistory[0].focusStance,focusStance,'Persist actual stance per recorded siege');
   observed.fired+=report.projectilesFired;observed.landed+=report.projectilesLanded;
   observed.redirects+=report.focusRedirects;observed.breaches+=report.breaches;
   observed.wallHpLost+=report.wallBreachDamage+report.wallSabotageDamage;
   observed.nearWallKills+=report.lastLineKills;observed.directHp+=report.directHitHpRemoved;
   assert.equal(p.uniqueClears,trueBestSum(p),'Real waves only');
   assert.equal(p.sigils,h.sigilLedgerSummary().claimed+h.sigilLedgerSummary().earnedWatch,'No invented finite Sigils');
   if(n>=82)late.push({n,tier:route.tier,wave:report.lastWave,breaches:report.breaches,
    redirects:report.focusRedirects,firstClears:p.uniqueClears});
  }
  if(p.unlockedTier>=17)assert(p.milestones['16:20']&&(p.bestByTier[16]||0)>=20,'Original wave 20 gate cannot be bypassed');
  assert(h.save());
  const loaded=world(seed+1819,{[SAVE]:w.store[SAVE]});
  assert.equal(loaded.h.p().uniqueClears,p.uniqueClears);
  assert.equal(loaded.h.p().sigils,p.sigils);
  assert.equal(loaded.h.p().siegeHistory[0].focusStance,focusStance);
  targetingPairs.push({seed,focusStance,realSieges:20,actualEssenceSpentAfter66:paidSince66,
   chapters:p.firstWatchClaimed.length,firstClears:p.uniqueClears,unlockedTier:p.unlockedTier,
   tier16Best:p.bestByTier[16]||0,attackDamage:+h.damage().toFixed(1),
   attackSeconds:+h.attackInterval().toFixed(3),wall:h.maxWall(),observed,
   waveTally:Object.values(waveTally).sort((a,b)=>a.wave-b.wave),late});
 }
}
assert.equal(targetingPairs.length,4);
console.log('ALPHA 0.15.27 IDENTICAL EARNED CHECKPOINT · THREAT SENSE VS WALLGUARD '+JSON.stringify(targetingPairs));
console.log('LIMIT: Original prices/characters conserved, but after each targeting decision actual fight duration, drops and purchase affordability can diverge. No equal-lifetime-spend or universal winning stance claimed.');

// Alpha 0.15.27: real intervention, not another mock character. Compare
// FULL unlocked Aegis+Sentinel+Crisis+Wallguard against
// Vanguard+Hunter+Rapid+Wallguard from exact earned siege-66 save bytes.
// Both plans combine existing, paid/unlocked abilities and use the same
// following mixed Training purchase priority. A tactical plan is not a stat buff.
const frontierContinuationSaves=new Map(),planPairs=[];
for(const seed of seeds){
 const base=offenseBases.get(seed);assert(base?.raw,'A genuine saved Tier XVI siege-66 character is required for both plans');
 const checkpoint=JSON.parse(base.raw);
 for(const planId of ['vanguard','bastion']){
  const w=world(seed+2020,{[SAVE]:base.raw}),h=w.h,p=h.p();
  assert.equal(p.uniqueClears,checkpoint.uniqueClears);
  assert.equal(p.essence,checkpoint.essence);
  assert.equal(p.sigils,checkpoint.sigils);
  assert.equal(JSON.stringify(p.training),JSON.stringify(checkpoint.training));
  assert(h.siegePlanStatus(planId).unlocked,'A plan must use only already-earned character level unlocks');
  assert(h.applySiegePlan(planId),'Apply genuine saved existing-ability battle plan before siege');
  const plan=h.siegePlanData.find(row=>row.id===planId);
  assert.equal(p.combatDoctrine,plan.doctrine);
  assert.equal(p.combatPassive,plan.passive);
  assert.equal(p.doctrineTactic,plan.tactic);
  assert.equal(h.selectedFocusStance(),plan.focus);
  assert.equal(p.uniqueClears,checkpoint.uniqueClears,'No artificial first clears from plan selection');
  assert.equal(p.sigils,checkpoint.sigils,'No artificial Sigils from plan selection');
  let paid=base.spentSince19,spentAfter66=0;
  const totals={breaches:0,wallHpLost:0,nearWallKills:0,directHp:0,redirects:0,casts:0};
  const waves=Object.create(null),late=[];
  for(let n=67;n<=86;n++){
   spendSkills(h);
   const purchase=spendUnderSharedCumulativeCap(h,'mixed',paid,n);
   paid+=purchase.spent;spentAfter66+=purchase.spent;
   const route=navigateEarned(w,n),outcome=siege(h,95),report=h.siegeReport();
   assert.equal(route.tier,outcome.tier,'Real original unlocked territory, no fabricated progression');
   assert(report.offenseTracked&&report.wallPressureTracked&&report.wavePressureTracked);
   assert.equal(report.focusStance,plan.focus);
   assert.equal(report.doctrineTactic,plan.tactic);
   assert(report.wavePressureSamples.length>0&&report.wavePressureSamples.length<=6);
   totals.breaches+=report.breaches;
   totals.wallHpLost+=report.wallBreachDamage+report.wallSabotageDamage;
   totals.nearWallKills+=report.lastLineKills;
   totals.directHp+=report.directHitHpRemoved;
   totals.redirects+=report.focusRedirects;
   totals.casts+=report.doctrineCasts;
   for(const q of report.wavePressureSamples){
    assert(q.projectilesLanded<=q.projectilesFired&&q.nearWallKills<=q.enemiesDefeated);
    if(q.wave>=16&&q.wave<=20){
     const row=waves[q.wave]??={wave:q.wave,reached:0,cleared:0,fallen:0,
      breaches:0,wallHpLost:0};
     row.reached++;
     if(q.outcome==='cleared')row.cleared++;
     if(q.outcome==='fallen')row.fallen++;
     row.breaches+=q.breaches;
     row.wallHpLost+=q.wallBreachDamage+q.wallSabotageDamage;
    }
   }
   assert.equal(p.uniqueClears,trueBestSum(p),'Only real first-cleared waves count');
   const ledger=h.sigilLedgerSummary();
   assert.equal(p.sigils,ledger.claimed+ledger.earnedWatch,'One-time Sigils stay finite');
   if(n>=82)late.push({n,tier:route.tier,lastWave:report.lastWave,
    cleared:report.cleared,breaches:report.breaches,firstClears:p.uniqueClears});
  }
  if(p.unlockedTier>=17)
   assert(p.milestones['16:20']===true&&(p.bestByTier[16]||0)>=20,
    'Tier XVII is ONLY earned after truly clearing Tier XVI wave 20');
  assert(h.save());
  // Keep exact earned post-86 original-character bytes for a separate, longer
  // lawful frontier continuation. Do not inject Tier XVII or fake minutes.
  if(seed===15423&&planId==='vanguard'&&p.unlockedTier>=17)
   frontierContinuationSaves.set(seed,{raw:w.store[SAVE],paid,focus:w.store[h.focusStanceKey]});
  const fresh=world(seed+2021,{[SAVE]:w.store[SAVE]});
  assert.equal(fresh.h.p().uniqueClears,p.uniqueClears,'Save and reload original earned progress');
  assert.equal(fresh.h.p().sigils,p.sigils);
  assert.equal(fresh.h.p().siegeHistory[0].wavePressureTracked,true);
  planPairs.push({seed,planId,realSieges:20,essenceSpentAfter66:spentAfter66,
   uniqueClears:p.uniqueClears,watchChapters:p.firstWatchClaimed.length,
   tier16Best:p.bestByTier[16]||0,unlockedTier:p.unlockedTier,
   health:h.maxWall(),attackDamage:+h.damage().toFixed(1),
   attackSeconds:+h.attackInterval().toFixed(3),totals,
   waves:Object.values(waves).sort((a,b)=>a.wave-b.wave),late});
 }
}
assert.equal(planPairs.length,4);
// Alpha 0.15.27: extend the actually victorious Tier XVI Arrowstorm career
// beyond siege 86 into Tier XVII under the original fully earned economy.
const deeperFrontier=[];
for(const [seed,baseline] of frontierContinuationSaves){
 const checkpoint=JSON.parse(baseline.raw);
 assert(checkpoint.milestones['16:20']===true&&checkpoint.unlockedTier>=17,
  'Frontier study must begin only with genuine previous wave-20 success');
 assert.equal(baseline.focus,'wallguard','Exact earned Arrowstorm targeting preference must be retained');
 const w=world(seed+2222,{[SAVE]:baseline.raw,primal_knight_onslaught_focus_stance_v1:baseline.focus}),h=w.h,p=h.p();
 assert(h.siegePlanStatus('vanguard').active,'True Arrowstorm doctrine, passive, timing and focus survive checkpoint re-entry');
 assert.equal(p.uniqueClears,checkpoint.uniqueClears);
 assert.equal(p.sigils,checkpoint.sigils);
 assert.equal(p.essence,checkpoint.essence);
 assert.equal(JSON.stringify(p.training),JSON.stringify(checkpoint.training));
 let paid=baseline.paid,paidAfter86=0;
 const routes=[],waveTotals={};
 for(let n=87;n<=106;n++){
  spendSkills(h);
  const purchase=spendUnderSharedCumulativeCap(h,'mixed',paid,n);
  paid+=purchase.spent;paidAfter86+=purchase.spent;
  const route=navigateEarned(w,n);
  // Actual route is selected through existing saved Battle lobby buttons.
  assert(route.tier<=p.unlockedTier);
  const outcome=siege(h,95),report=h.siegeReport();
  assert.equal(outcome.tier,route.tier);
  assert(report.wavePressureTracked&&report.offenseTracked&&report.wallPressureTracked);
  assert.equal(p.uniqueClears,trueBestSum(p));
  assert.equal(p.sigils,h.sigilLedgerSummary().claimed+h.sigilLedgerSummary().earnedWatch);
  if(p.unlockedTier>=18)
   assert(p.milestones['17:100']===true&&(p.bestByTier[17]||0)>=100,
    'Tier XVIII demands a genuinely completed Tier XVII wave 100');
  for(const row of report.wavePressureSamples){
   const key=route.tier+':'+row.wave;
   const value=waveTotals[key]??={tier:route.tier,wave:row.wave,reached:0,cleared:0,fallen:0};
   value.reached++;if(row.outcome==='cleared')value.cleared++;if(row.outcome==='fallen')value.fallen++;
  }
  routes.push({siege:n,tier:route.tier,lastReached:report.lastWave,wavesCleared:report.cleared,
   uniqueClears:p.uniqueClears,tier17Best:p.bestByTier[17]||0,chapters:p.firstWatchClaimed.length});
 }
 assert.equal(routes.length,20,'20 independent original-engine late continuation sorties');
 assert(routes.some(r=>r.tier>=17),'Actually unlocked Tier XVII was genuinely played');
 const next=h.firstWatchHorizon(1)[0];
 const reload=world(seed+2233,{[SAVE]:w.store[SAVE]});
 assert.equal(reload.h.p().uniqueClears,p.uniqueClears);
 assert.equal(reload.h.p().sigils,p.sigils);
 assert.equal(reload.h.p().unlockedTier,p.unlockedTier);
 deeperFrontier.push({seed,continuedEarnedSieges:20,actualEssencePaidAfter86:paidAfter86,
  oldUniqueClears:checkpoint.uniqueClears,newUniqueClears:p.uniqueClears,
  newFirstClears:p.uniqueClears-checkpoint.uniqueClears,
  tier17Best:p.bestByTier[17]||0,tier17Wave100Cleared:(p.bestByTier[17]||0)>=100,
  nextGate:next?{chapter:next.index+1,remainingDistinctClears:next.waveRemaining,
   remainingActiveMinutes:+(next.timeRemainingSeconds/60).toFixed(2)}:null,
  genuineWatchChapters:p.firstWatchClaimed.length,highestLegitimatelyUnlocked:p.unlockedTier,
  actualWavePressure:Object.values(waveTotals).filter(r=>r.tier>=17).sort((a,b)=>a.wave-b.wave),
  lastOutcomes:routes.slice(-8)});
}

/* Alpha 0.15.27 — independent genuinely earned First Watch backtracking
   continuation. Uses identical 86-siege original save as the Tier XVII
   twenty-siege push, with distinct route decisions. Counts only real clears. */
const earnedRecordStretch=[];
for(const [seed,baseline] of frontierContinuationSaves){
 assert.equal(baseline.focus,'wallguard');
 const w=world(seed+2222,{[SAVE]:baseline.raw,primal_knight_onslaught_focus_stance_v1:baseline.focus});
 const h=w.h,p=h.p(),checkpoint=JSON.parse(baseline.raw);
 assert(h.siegePlanStatus('vanguard').active);
 assert.equal(JSON.stringify(p.bestByTier),JSON.stringify(checkpoint.bestByTier));
 assert.equal(p.uniqueClears,checkpoint.uniqueClears);
 let paid=baseline.paid,spentAfter86=0;
 const sessions=[];
 for(let n=87;n<=110;n++){
  spendSkills(h);
  const investment=spendUnderSharedCumulativeCap(h,'mixed',paid,n);
  paid+=investment.spent;spentAfter86+=investment.spent;
  const guide=h.veteranClearRoutes();
  assert(guide&&guide.routes.length>0&&guide.index>=11,
   'A genuine late First Watch career may continue into Chapter XIII if Chapter XII is earned');
  const candidate=guide.routes[(n-87)%guide.routes.length];
  assert(candidate.tier<=p.unlockedTier&&candidate.startWave<=candidate.nextWave);
  assert.equal(candidate.replayWaves,Math.max(0,candidate.best-candidate.startWave+1));
  assert(h.selectFrontierTier(candidate.tier),'Existing guarded Battle tier selector used');
  const before=p.uniqueClears,output=siege(h,95),report=h.siegeReport();
  assert.equal(report.tier,candidate.tier);
  assert(report.wavePressureTracked&&report.offenseTracked&&report.wallPressureTracked);
  assert.equal(p.uniqueClears,trueBestSum(p));
  assert.equal(p.sigils,h.sigilLedgerSummary().claimed+h.sigilLedgerSummary().earnedWatch);
  const earned=p.uniqueClears-before;
  assert(earned>=0&&earned<=report.cleared,'Only truly completed new waves contribute');
  if(p.unlockedTier>=18)
   assert(p.milestones['17:100']&&p.bestByTier[17]>=100,'Tier XVIII remains genuinely gated');
  sessions.push({n,tier:candidate.tier,replayed: candidate.replayWaves,
   start:report.startWave,cleared:report.cleared,earned,
   uniqueClears:p.uniqueClears,chapterCount:p.firstWatchClaimed.length,
   unlockedTier:p.unlockedTier});
 }
 assert.equal(sessions.length,24);
 // 0.15.27: genuine source-engine Pioneer Sweep continuation after the
 // existing 24 legitimately earned Record Stretch sorties. No synthetic
 // purchases, simulated wave clears, instant rewards, or award fixtures.
 const beforePioneer=p.uniqueClears,pioneerSessions=[];
 for(let n=111;n<=122;n++){
  spendSkills(h);
  const paidChange=spendUnderSharedCumulativeCap(h,'mixed',paid,n);
  paid+=paidChange.spent;spentAfter86+=paidChange.spent;
  const choice=h.veteranPioneerSweep();
  assert(choice&&choice.tier<=p.unlockedTier&&choice.nextWave===choice.best+1,
   'Only already legitimately unlocked unfinished realms can be suggested');
  assert(choice.startWave<=choice.nextWave);
  assert(h.selectFrontierTier(choice.tier),'Original protected tier selection honored');
  const prior=p.uniqueClears,priorTime=p.battleSeconds;
  siege(h,95);
  const report=h.siegeReport(),earned=p.uniqueClears-prior;
  assert(report.tier===choice.tier&&earned>=0&&earned<=report.cleared,
   'Only actual wave completions earn first clears');
  assert(p.battleSeconds>priorTime,'Actual combat time must pass');
  assert.equal(p.uniqueClears,trueBestSum(p));
  assert.equal(p.sigils,h.sigilLedgerSummary().claimed+h.sigilLedgerSummary().earnedWatch);
  if(p.firstWatchClaimed.includes(12)){
   assert(p.uniqueClears>=605,'Genuine Chapter XIII requires 605 unique victories');
   assert(p.battleSeconds>=403*60,'Genuine Chapter XIII requires 403 active minutes');
  }
  if(p.unlockedTier>=18)assert(p.milestones['17:100']&&p.bestByTier[17]>=100,
   'Original Tier XVIII gate remains a real wave-100 victory');
  pioneerSessions.push({n,tier:choice.tier,replayed:choice.replayWaves,
   measuredZero:choice.recordedZero,cleared:report.cleared,
   earned,uniqueClears:p.uniqueClears,watch:p.firstWatchClaimed.length});
 }
 assert.equal(pioneerSessions.length,12);
 const pioneerGain=p.uniqueClears-beforePioneer;
 console.log('ALPHA 0.15.27 EARNED PIONEER SWEEP '+JSON.stringify({
  seed,startUniqueClears:beforePioneer,endUniqueClears:p.uniqueClears,
  trulyNewFirstClears:pioneerGain,realSieges:12,chapterXIIIClaimed:p.firstWatchClaimed.includes(12),
  earnedChapterCount:p.firstWatchClaimed.length,highestUnlockedTier:p.unlockedTier,
  actualPaidAfterOriginal86:spentAfter86,sessions:pioneerSessions}));
 const verify=world(seed+2223,{[SAVE]:w.store[SAVE]});
 assert.equal(verify.h.p().uniqueClears,p.uniqueClears);
 assert.equal(verify.h.p().sigils,p.sigils);
 assert.equal(verify.h.p().unlockedTier,p.unlockedTier);
 assert.equal(verify.h.p().firstWatchClaimed.length,p.firstWatchClaimed.length,
  'Chapter awards only from actual combat persist on original save reload');
 // Only the actual engine may claim Chapter XII, and both original gates
 // must be satisfied before that reward is persisted or reported.
 if(p.firstWatchClaimed.includes(11)){
  assert(p.uniqueClears>=483,'Real Chapter XII demands 483 unique first clears');
  assert(p.battleSeconds>=322*60,'Real Chapter XII demands 322 active minutes');
  assert(verify.h.p().firstWatchClaimed.includes(11),'Actual earned Chapter XII reward survives reload');
 }
 assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length);
 const next=h.firstWatchHorizon(1)[0];
 earnedRecordStretch.push({seed,sessions:24,actualEssencePaid:spentAfter86,
  initialClears:checkpoint.uniqueClears,finalClears:p.uniqueClears,
  genuinelyNewFirstClears:p.uniqueClears-checkpoint.uniqueClears,
  nextChapter:next?{chapter:next.index+1,remainingUniqueClears:next.waveRemaining,
   remainingActiveMinutes:+(next.timeRemainingSeconds/60).toFixed(2)}:null,
  chapterXIIClaimed:p.firstWatchClaimed.includes(11),
  chaptersClaimed:p.firstWatchClaimed.length,unlockedTier:p.unlockedTier,
  routes:sessions});
}
assert.equal(earnedRecordStretch.length,1);
console.log('ALPHA 0.15.27 ACTUAL EARNED FIRST-WATCH RECORD STRETCH '+JSON.stringify(earnedRecordStretch));
console.log('LIMIT: 24 real later sorties under an alternative unlocked-territory route, not an equivalent-spend controlled experiment, no Watch chapter award unless the original engine triggers it.');

assert.equal(deeperFrontier.length,1,'Original previously proven earned Tier XVII branch remains available');
console.log('ALPHA 0.15.27 LEGITIMATELY EARNED TIER XVII CONTINUATION '+JSON.stringify(deeperFrontier));
console.log('LIMIT: One scripted earned character, twenty further original-engine sieges and true purchases, NOT independent players, a complete First Watch, Tier XXX, 1,250h or iPhone signoff.');
console.log('ALPHA 0.15.27 ACTUAL EARNED TIER XVI BATTLE PLANS · OFFENSE VS BASTION '+JSON.stringify(planPairs));
console.log('LIMIT: The 80 real additional sieges branch only two genuinely earned characters, with paired initial RNG; combat after selection, earned drops, actual spend and outcome paths may diverge. Neither plan guarantees a breakthrough. No synthetic Tier XVII, Chapter XII, 750 human minutes or 1,250-hour completion counts.');

// Historical retained 504 late-original-engine siege trials plus these 80 plan
// trials = 584 actual engine-run late career sieges, excluding early short tests.
console.log('LIMIT: both policies replay genuine checkpoint save bytes with the same fresh RNG seed, not identical later events or actual Essence expenditure. No full 750-minute First Watch, 1,250h completion or device acceptance claim.');
console.log('ALPHA 0.15.27 LATE TIER XVI TRUE SIEGE PRESSURE AND PAID STRATEGIES '+JSON.stringify(results));
console.log('PASS Alpha 0.15.27: correct genuine wall-breach/sabotage damage accounting, old save distinction, bounded archive metrics, 344 genuinely engine-executed sieges, paired earned 66-siege baselines, legal gate unlocks, original save/reload and Sigil integrity');
console.log('LIMIT: Scripted deterministic runs do not prove human 750-minute First Watch, 1,250-hour completion or physical iPhone acceptance. Never invent Chapter XII or Tier XVII; report only if awarded by normal engine.');
