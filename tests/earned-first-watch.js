// Alpha 0.11.6 — earn-first continuous First Watch combat evidence.
// Fresh real starter characters, legitimate purchases, naturally earned XP/rewards.
// No direct p.level, p.gold, p.essence, p.skills, equipment or milestone fabrication.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8');
function world(initialSeed){
 let seed=initialSeed>>>0;
 const random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class El{
  constructor(id){this.id=id;this.style={};this.dataset={};this.innerHTML='';this.textContent='';this.hidden=false;this.disabled=false;this.className='';this.listeners={};this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(t,fn){this.listeners[t]=fn;}querySelectorAll(){return [];}querySelector(){return null;}
 }
 const els=new Map(),el=id=>els.get(id)||(els.set(id,new El(id)),els.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null);
 const sandbox={Math:random,Image,Date,Blob,console,confirm(){return true;},
  window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
  localStorage:{getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
  performance:{now:()=>1000},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});
 const h=sandbox.window.__PK_TEST_TOOLS__;
 assert(h,'Game must expose actual combat/test hooks');
 return {h,store,el};
}
const policies=[
 {id:'NO SPEND',training:[],station:false,skills:[],doctrine:'vanguard',passive:'hunter'},
 {id:'MIGHT FIRST',training:['power','power','power','power','power','power','power','power','haste','haste','haste','haste'],station:true,skills:['aim','aim','aim','quiver','quiver','stone'],doctrine:'vanguard',passive:'hunter'},
 {id:'GUARDIAN FIRST',training:['fort','fort','fort','fort','fort','fort','fort','fort','haste','haste','haste'],station:true,skills:['stone','stone','stone','bulwark','bulwark','aim'],doctrine:'aegis',passive:'sentinel'},
 {id:'MIXED QUARTERMASTER',training:['fort','fort','fort','fort','power','power','power','power','haste','haste','haste','haste'],station:true,skills:['aim','aim','spark','spark','stone','quiver'],doctrine:'storm',passive:'conductor'}
];
const seeds=[11601,11617,11633];
const results=[];
function play(policy,seed){
 const {h,store,el}=world(seed),p=h.p(),r=h.run();
 assert.equal(p.level,1);assert.equal(p.gold,520);assert.equal(p.essence,180);
 assert.equal(p.unlockedTier,1);assert.equal(p.highestWave,1);
 const initialItems=JSON.stringify(p.inventory.slice());
 const initialRunes=JSON.stringify(p.runes.slice());
 let spentEssence=0,spentGold=0,trained=0;
 for(const id of policy.training){
  const before=p.essence,was=p.training[id]||0;
  if(h.purchaseCouncilTraining(id)){
   spentEssence+=before-p.essence;trained++;
   assert.equal(p.training[id],was+1,'Training is purchased one rank at a time');
  }
 }
 if(policy.station){const gold=p.gold;h.action('station:ballista');spentGold=gold-p.gold;assert(spentGold>0,'Station requires legitimately held Gold');}
 assert.equal(180-p.essence,spentEssence,'Exactly the starter Essence spend is accounted');
 assert.equal(520-p.gold,spentGold,'Exactly the starter Gold spend is accounted');
 r.tier=1;r.wave=1;r.phase='ready';r.maxHealth=h.maxWall();r.health=r.maxHealth;
 h.beginWave();
 let lastClears=0,frames=0,firstLoss=0,timedOut=false,enemyCap=0,shotsCap=0;
 let measuredWave=0,measuredStart=0;
 function investEarnedPoints(){
  for(const id of policy.skills){
   if(p.points<=0)break;
   const before=p.points,rank=p.skills[id]||0;
   if(rank>=5)continue;
   h.action('skill:'+id);
   assert.equal(p.points,before-1,'Earned skill point spent once through actual UI action');
  }
  if(p.level>=5){
   h.chooseCombatDoctrine(policy.doctrine);
   h.chooseCombatPassive(policy.passive);
  }else if(p.level>=3&&policy.doctrine==='storm'){
   h.chooseCombatDoctrine('storm');h.chooseCombatPassive('conductor');
  }
 }
 while(r.phase!=='fallen' && r.wavesCleared<20 && frames<56000){
  // No forged wave completions, free XP, artificial wall health, or ability casts.
  if(r.phase==='intermission'&&r.wavesCleared!==lastClears){
   lastClears=r.wavesCleared;investEarnedPoints();
  }
  if(r.phase==='fighting'&&measuredWave!==r.wave){measuredWave=r.wave;measuredStart=r.time;}
  h.tick(.05);frames++;
  if(r.phase==='fighting'&&r.wave===measuredWave&&r.time-measuredStart>90){timedOut=true;break;}
  enemyCap=Math.max(enemyCap,r.enemies.length);shotsCap=Math.max(shotsCap,r.shots.length);
  assert(r.enemies.length<=24&&r.shots.length<=48,'Mobile actor caps');
  assert(Number.isFinite(r.health)&&r.health>=0&&r.health<=r.maxHealth,'Legal wall HP');
  assert(Number.isFinite(p.essence)&&p.essence>=0&&Number.isFinite(p.gold)&&p.gold>=0,'Legal currencies');
 }
 firstLoss=r.phase==='fallen'?r.wave:0;
 const postBattleEssence=p.essence;
 let rallyPurchased=false,postRallyRank=null;
 if(r.phase==='fallen'){
  const advice=h.councilRecoveryAdvice(1);
  assert(advice,'Genuinely fallen First Watch produces the optional recovery advice');
  assert.equal(advice.wave,firstLoss,'Advice cites the actual defeat wave');
  assert.equal(advice.cleared,r.wavesCleared,'Advice cites actual clear count');
  assert.equal(advice.essence,p.essence,'Advice includes the currently earned Essence budget');
  assert.equal(h.councilRecoveryAdvice(2),null,'Other tiers never inherit an unrelated defeat');
  assert(h.renderWarCouncil(1,1).includes('RALLY AFTER DEFEAT'),'The real Battle lobby shows the rally');
  if(advice.offer&&advice.offer.affordable){
   const offer=advice.offer,oldEssence=p.essence,rank=p.training[offer.id]||0;
   h.renderTierLobby();
   el('milestoneList').scrollTop=173;
   el('milestoneList').listeners.click({target:{closest(selector){
    if(selector==='[data-council-train]')return {disabled:false,dataset:{councilTrain:offer.id}};
    return null;
   }}});
   assert.equal(el('milestoneList').scrollTop,173,'Defeat rally preserves iPhone lobby scroll');
   assert.equal(JSON.parse(store.primal_knight_onslaught_save_v1).training[offer.id],rank+1,
    'Real rally tap saves a new permanent training rank in the original save key');
   assert.equal(p.essence,oldEssence-offer.cost,'The rally does not discount or create Essence');
   assert.equal(p.training[offer.id],rank+1,'Only one purchased permanent rank is granted');
   rallyPurchased=true;postRallyRank=offer.id;
  }
 }
 const saved=JSON.parse(store.primal_knight_onslaught_save_v1||'null');
 assert(saved,'Real battle persisted an iPhone player save');
 assert.equal(saved.unlockedTier,p.unlockedTier,'Actual tier unlock is persisted');
 assert.equal(JSON.stringify(p.inventory.slice(0,4)),initialItems,'Original owned gear is never replaced by earned drops');
 assert.equal(JSON.stringify(p.runes.slice(0,2)),initialRunes,'Starter runes remain owned');
 assert.equal(p.uniqueClears,r.wavesCleared,'Continuous First Watch contains exactly its unique clears');
 for(let wave=1;wave<=Math.min(20,r.wavesCleared);wave++)
  if([1,2,3,5,8,10,12,15,20].includes(wave))
   assert(p.milestones['1:'+wave]||!h.tierMilestones(1).includes(wave),'Real cleared achievement recorded once');
 return {policy:policy.id,seed,clears:r.wavesCleared,latestWave:r.wave,firstLoss,
  phase:r.phase,timedOut,level:p.level,active: p.combatDoctrine,passive:p.combatPassive,
  essenceSpent:spentEssence,goldSpent:spentGold,trainingRanks:trained,
  earnedEssence:postBattleEssence,postRallyEssence:p.essence,rallyPurchased,postRallyRank,
  earnedGold:p.gold,earnedSigils:p.sigils,
  minutes:Number((p.battleSeconds/60).toFixed(2)),maxActors:enemyCap,maxShots:shotsCap};
}
for(const policy of policies)for(const seed of seeds)results.push(play(policy,seed));
assert.equal(results.length,12,'Four real starter spending policies × three deterministic combat seeds');
for(const id of policies.map(p=>p.id)){
 const rows=results.filter(r=>r.policy===id);
 assert.equal(rows.length,3);
 const mean=rows.reduce((n,r)=>n+r.clears,0)/rows.length;
 console.log(id.padEnd(22)+' mean cleared '+mean.toFixed(1)+
  ' / 20 · actual clears '+rows.map(r=>r.clears).join('/')+
  ' · spent Essence '+rows[0].essenceSpent+' · training ranks '+rows[0].trainingRanks+
  ' · end levels '+rows.map(r=>r.level).join('/'));
 for(const r of rows)assert(!r.timedOut,'A first-session test must not confuse a timed-out wave with a lost battle');
}
console.log('FIRST WATCH EARNED-BUDGET FULL RESULTS '+JSON.stringify(results));
console.log('PASS: twelve continuous actual first-session runs with natural XP, wave rewards, live priced purchases, real ability unlocks, permanent equipment/reward integrity and no fabricated economy.');
console.log('LIMIT: deterministic automated novice purchase policies, not physical iPhone playtesting or verified human choices.');
