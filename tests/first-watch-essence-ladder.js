// Alpha 0.15.24: genuine post-Chapter-V Tier III expedition and owned item readiness.
// Reuses the Alpha 0.15.24 deterministic combat harness and verified existing save behavior.
// Alpha 0.15.24 — real earned multi-territory First Watch routes and safe player selection.
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

assert(html.includes('ALPHA 0.15.24')&&html.includes('game.js?v=0.15.24')&&html.includes('style.css?v=0.15.24'));
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


// Explicit synthetic UI arithmetic fixtures, NOT earned game time or chapters.
const beginner=world(151000);
assert.equal(beginner.h.essencePriceLadder(),null,'New characters have no Chapter VIII view');
assert.equal(beginner.h.renderEssencePriceLadder(),'');
const fixture=world(151001),fh=fixture.h,fp=fh.p();
fp.firstWatchClaimed=[0,1,2,3,4,5,6,7];fp.battleSeconds=108*60;fp.uniqueClears=162;
fp.essence=100;
const original=JSON.stringify(fp),quotes=fh.essencePriceLadder();
assert(quotes&&quotes.paths.length===4,'All four real Training paths');
assert.equal(quotes.balance,100);
const model={power:[8,1.125,1200],haste:[8,1.155,500],fort:[10,1.12,1000],essence:[30,1.17,600]};
const price=(id,lv)=>{const [base,mul]=model[id];
 return Math.floor(base*(1+lv*.075+lv*lv*.004)*Math.pow(1+(mul-1)*.07,Math.min(lv,120))*Math.pow(1.002,Math.max(0,lv-120)))};
for(const q of quotes.paths){
 const expected=[price(q.id,0),price(q.id,1),price(q.id,2)];
 assert.deepEqual(Array.from(q.prices),expected,'Next three prices match independent original formula for '+q.id);
 assert.equal(q.next,expected[0]);assert.equal(q.threeCost,expected.reduce((a,b)=>a+b,0));
 assert.equal(q.shortfallNext,Math.max(0,q.next-100));
 assert.equal(q.shortfallThree,Math.max(0,q.threeCost-100));
 assert(q.affordableRanks>=0&&q.affordableRanks<=3);
}
assert.equal(quotes.chapter.index,8,'Next after eighth chapter is IX');
assert.equal(quotes.chapter.waves,221);
const htmlMarkup=fh.renderEssencePriceLadder();
assert(htmlMarkup.includes('ESSENCE LADDER')&&htmlMarkup.includes('data-essence-ladder-open="training"'));
fh.renderTierLobby();assert(fixture.el('milestoneList').innerHTML.includes('essence-price-ladder'));
assert.equal(JSON.stringify(fp),original,'Display and render do not spend Essence or mutate saves');
const btn={disabled:false,dataset:{essenceLadderOpen:'training'}};
fixture.el('milestoneList').listeners.click({target:{closest(sel){return sel==='[data-essence-ladder-open]'?btn:null;}}});
assert.equal(fixture.el('panel').hidden,false);
assert(fixture.el('panelContent').innerHTML.length>100,'Real Training menu opens');
assert.equal(JSON.stringify(fp),original,'Opening Training does not auto-purchase');
fp.essence=0;fp.training.power=1200;fp.training.haste=499;fp.training.fort=998;fp.training.essence=600;
const high=fh.essencePriceLadder();
const mapped=Object.fromEntries(high.paths.map(x=>[x.id,x]));
assert.equal(mapped.power.levelsQuoted,0,'No ranks after Might cap');
assert.equal(mapped.power.next,null);
assert.equal(mapped.haste.levelsQuoted,1,'Only one rank remains before Reflexes cap');
assert.equal(mapped.fort.levelsQuoted,2,'Only two remain before Fortitude cap');
assert.equal(mapped.essence.levelsQuoted,0,'Attunement at cap');
for(const q of high.paths){
 for(let i=0;i<q.prices.length;i++)assert.equal(q.prices[i],price(q.id,q.rank+i));
 assert.equal(q.affordableRanks,0,'No Essence cannot afford positive price');
 assert.equal(q.shortfallNext,q.next);
}
fp.firstWatchClaimed.push(8,9);
assert.equal(fh.renderEssencePriceLadder(),'','No stale planning view after completing chapter X');

// Fully earned, same-seed cohorts: matching I–VI baseline through 18 real
// consecutive sieges, then hold VI or explore VII+ only if actually unlocked.
const cohorts=[];
for(const seed of [15411,15423]){
 for(const policy of ['repeat-VI','frontier-VII-plus']){
  const w=world(seed),h=w.h,p=h.p(),history=[],checkpoints=[];
  let build=null;
  for(let n=1;n<=28;n++){
   spendSkills(h);spendCombat(h);spendSkills(h);
   let tier=n>=4&&n%3!==0&&p.unlockedTier>=2?2:1;
   if(n>=11){
    assert(p.firstWatchClaimed.includes(4),'Chapter V genuinely earned');
    assert(p.unlockedTier>=3,'Tier III legitimately unlocked');
    tier=3;
   }
   if(n===11)prepareOwnedItems(w);
   if(n>=13){
    assert(p.firstWatchClaimed.includes(5),'Chapter VI genuinely earned');
    assert(p.unlockedTier>=4,'Tier IV legitimately unlocked');
    tier=4;
   }
   if(n===15){
    assert(p.firstWatchClaimed.includes(6),'Chapter VII genuinely earned');
    assert(p.unlockedTier>=5);
    build=prepareMidgameBuild(w);
   }
   if(n>=15)tier=n<=16?5:(p.unlockedTier>=6?6:5);
   if(n>=19){
    assert(p.firstWatchClaimed.includes(7),'Chapter VIII must be naturally earned before later study');
    assert(p.unlockedTier>=7,'Tier VII earned via VI wave-20');
    tier=policy==='frontier-VII-plus'?
      Math.min(p.unlockedTier,7+Math.floor((n-19)/2)):6;
    if([19,22,25,28].includes(n)){
     const ladder=h.essencePriceLadder(),next=h.firstWatchHorizon(1)[0];
     const quote=ladder?.paths.find(x=>x.id==='power')||null;
     assert(ladder===null||ladder.balance===p.essence,'Current earned Essence must equal displayed balance');
     if(quote&&quote.next!==null){
      assert.equal(quote.next,price('power',quote.rank),'Exact high-rank Might formula');
      assert.equal(quote.shortfallNext,Math.max(0,quote.next-p.essence));
      assert.equal(quote.affordableRanks>=1,p.essence>=quote.next);
     }
     checkpoints.push({n,heldEssence:p.essence,mightRank:p.training.power||0,
       mightNext:quote?.next??null,mightDeficit:quote?.shortfallNext??null,
       nextChapter:next?.index+1??null,
       newWavesStillNeeded:next?.waveRemaining??0});
    }
   }
   if(tier!==p.selectedTier){h.renderTierLobby();clickTier(w,tier,false);}
   assert.equal(p.selectedTier,tier,'Real unlocked lobby selection');
   assert(tier<=p.unlockedTier,'Never enter a locked territory');
   const before=p.uniqueClears;
   const result=siege(h,n<=7?35:n<=9?50:65);
   assert.equal(result.tier,tier);
   assert(p.uniqueClears>=before);
   const saved=JSON.parse(w.store[SAVE]);
   assert.equal(saved.uniqueClears,p.uniqueClears);
   assert.equal(saved.battleSeconds,p.battleSeconds);
   assert.equal(saved.selectedTier,tier);
   assert.deepEqual(saved.firstWatchClaimed,Array.from(p.firstWatchClaimed));
   history.push({n,...result});
  }
  assert(build&&history.length===28);
  const loaded=world(seed+15100,w.store),saved=loaded.h.p();
  assert.equal(saved.uniqueClears,p.uniqueClears);
  assert.equal(saved.battleSeconds,p.battleSeconds);
  assert.deepEqual(Array.from(saved.firstWatchClaimed),Array.from(p.firstWatchClaimed));
  assert.equal(saved.socketed.helm,build.ember,'Earned Ember socket persisted');
  assert(saved.inventory.some(g=>g.id==='first_watch_gear_2'&&g.plus>=1));
  assert.equal(p.uniqueClears,trueBestSum(p));
  assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length);
  const next=h.firstWatchHorizon(1)[0];
  const best={};for(let t=1;t<=12;t++)best[t]=p.bestByTier[t]||0;
  const finalLadder=h.essencePriceLadder();
  cohorts.push({seed,policy,attempts:28,minutes:+(p.battleSeconds/60).toFixed(2),
   uniqueClears:p.uniqueClears,chapters:p.firstWatchClaimed.length,
   best,unlocked:p.unlockedTier,
   essence:p.essence,gold:p.gold,knowledge:p.knowledge,
   finalMight:finalLadder?.paths.find(x=>x.id==='power')||null,
   next:next?{chapter:next.index+1,timeLeftMinutes:+(next.timeRemainingSeconds/60).toFixed(2),
    wavesLeft:next.waveRemaining}:null,checkpoints,
   tail:history.slice(-5).map(x=>({tier:x.tier,best:x.best,chapters:x.chapters}))});
 }
}
assert.equal(cohorts.length,4);
assert(cohorts.every(x=>x.attempts===28));
assert(cohorts.filter(x=>x.policy==='repeat-VI').every(x=>!x.best[7]),'Control never gets Tier VII first clears');
assert(cohorts.filter(x=>x.policy==='frontier-VII-plus').every(x=>x.best[7]>0),'Frontier earns real Tier VII wins');
console.log('EARNED CHAPTER IX-X ESSENCE LADDER COHORTS '+JSON.stringify(cohorts));
console.log('PASS Alpha 0.15.24: original exact 1–3 rank cost quotes, high-rank caps, affordability, genuine 28-siege frontiers, chapter/Sigil integrity, actual paid build and original save reload');
console.log('LIMIT: scripted engine-driven 28-attempt policies are not an end-to-end 750-minute human playthrough, 1,250-hour finish proof or physical iPhone acceptance.');
