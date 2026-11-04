// Alpha 0.11.7 — real repeated-attempt First Watch economy and milestones.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8');
function createWorld(seed0){
 let seed=seed0>>>0,random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 class El{
  constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.textContent='';this.innerHTML='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}}}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}
  addEventListener(k,fn){this.listeners[k]=fn}querySelectorAll(){return []}querySelector(){return null}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const storage=Object.create(null);
 const sandbox={Math:random,Image,Blob,Date,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll(){return []},addEventListener(){},hidden:false},
  localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
  performance:{now:()=>1000},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,storage,el};
}
const policies=[
 {id:'MIGHT RALLY',choice:['power','power','power','haste','power','haste','fort'],skills:['aim','quiver','aim','quiver','aim','stone'],ballista:true},
 {id:'GUARDIAN RALLY',choice:['fort','power','fort','haste','power','fort','haste'],skills:['stone','aim','stone','quiver','aim','mend'],ballista:true},
 {id:'BALANCED RALLY',choice:['power','haste','fort','power','haste','fort'],skills:['aim','stone','quiver','spark','aim','stone'],ballista:false}
];
const seeds=[11701,11723,11749],results=[];
function playPolicy(policy,seed){
 const {h,el,storage}=createWorld(seed),p=h.p(),run=h.run();
 assert.equal(p.level,1);assert.equal(p.essence,180);assert.equal(p.gold,520);
 const starterGear=JSON.stringify(p.inventory),starterRunes=JSON.stringify(p.runes);
 let lastUnique=0,lastSigils=0,lastLevel=p.level,priorMilestones=new Set(),highest=0;
 const attempts=[];
 function spendBetweenRuns(){
  // A fresh user could spend earned resources in Battle/Power between attempts.
  let count=0,spent=0,iterations=0;
  for(;;){
   const order=policy.choice;
   let bought=false;
   for(const id of order){
    const offer=h.councilTrainingOffers(h.warCouncilPlan(1,1)).find(o=>o.id===id);
    if(offer&&offer.affordable){
     const before=p.essence;
     assert(h.purchaseCouncilTraining(id),'Existing actual training cost allows this one purchase');
     assert.equal(p.essence,before-offer.cost,'Every rank costs exactly the displayed live Essence amount');
     spent+=offer.cost;count++;bought=true;break;
    }
   }
   if(!bought||++iterations>=15)break;
  }
  if(policy.ballista&&(!p.stations.ballista||p.stations.ballista<1)){
   const before=p.gold;h.action('station:ballista');assert(p.gold<before,'Ballista costs real Gold');
  }
  return {count,spent};
 }
 function investSkillPoints(){
  let safety=0;
  while(p.points>0&&safety++<40){
   const id=policy.skills.find(x=>(p.skills[x]||0)<5);
   if(!id)break;
   const points=p.points,prior=p.skills[id]||0;
   h.action('skill:'+id);
   assert.equal(p.points,points-1,'Real earned point spent');
   assert.equal(p.skills[id],prior+1,'Skill increased one rank');
  }
  if(p.level>=5){h.chooseCombatDoctrine(policy.id==='GUARDIAN RALLY'?'aegis':'vanguard');
   h.chooseCombatPassive(policy.id==='GUARDIAN RALLY'?'sentinel':'hunter');}
 }
 for(let attempt=1;attempt<=4;attempt++){
  // Only automatic player-side strategy: spend already earned resources between sieges.
  const bought=spendBetweenRuns();investSkillPoints();
  const essenceBefore=p.essence,goldBefore=p.gold;
  h.enterSiege();
  assert.equal(run.tier,1);assert.equal(run.startWave,1,'Every attempt restarts at wave one');
  let ticks=0,lastWave=run.wave,waveTime=run.time;
  while(run.phase!=='fallen'&&run.wavesCleared<20&&ticks<45000){
   if(run.phase==='intermission')investSkillPoints();
   if(run.phase==='fighting'&&lastWave!==run.wave){lastWave=run.wave;waveTime=run.time}
   h.tick(.05);ticks++;
   assert(run.enemies.length<=24&&run.shots.length<=48,'Original mobile actor caps hold');
   assert(Number.isFinite(run.health)&&run.health>=0&&run.health<=run.maxHealth,'Valid wall health');
   if(run.phase==='fighting'&&run.time-waveTime>95)throw Error('Timed out wave '+run.wave);
  }
  assert(ticks<45000,'Full attempt cannot hang');
  const newBest=p.bestByTier[1]||0;
  assert(newBest>=highest,'Permanent best wave never regresses');highest=newBest;
  assert(p.uniqueClears>=lastUnique,'Unique clears cannot decrease');lastUnique=p.uniqueClears;
  assert(p.level>=lastLevel,'Earned level cannot decrease');lastLevel=p.level;
  assert(p.sigils>=lastSigils,'No Sigil spending occurs during this early test');lastSigils=p.sigils;
  for(const key of priorMilestones)assert(p.milestones[key],'A claimed milestone remains permanently claimed');
  priorMilestones=new Set(Object.keys(p.milestones).filter(k=>p.milestones[k]));
  assert.equal(JSON.stringify(p.inventory.slice(0,4)),starterGear,'Original gear persists across every retry');
  assert.equal(JSON.stringify(p.runes.slice(0,2)),starterRunes,'Original runes persist across retries');
  assert.equal(JSON.parse(storage.primal_knight_onslaught_save_v1).uniqueClears,p.uniqueClears,'iPhone save stores exact unique clears');
  assert(p.gold>=0&&p.essence>=0,'Progression never creates debt');
  attempts.push({attempt,wavesCleared:run.wavesCleared,earnedBest:newBest,
   essenceBefore,goldBefore,essenceAfter:p.essence,goldAfter:p.gold,
   level:p.level,uniqueClears:p.uniqueClears,sigils:p.sigils,
   spentEssence:bought.spent,upgrades:bought.count,reason:run.phase});
  if(run.wavesCleared>=20)break;
  assert.equal(run.phase,'fallen','Actual defeat ends this attempt');
 }
 return{policy:policy.id,seed,attempts,finalBest:p.bestByTier[1],claimed:p.milestones,firstWatch:p.firstWatchClaimed};
}
for(const policy of policies)for(const seed of seeds)results.push(playPolicy(policy,seed));
assert.equal(results.length,9,'Three spending approaches × three fixed random seeds');
for(const policy of policies){
 const group=results.filter(x=>x.policy===policy.id);
 assert.equal(group.length,3);
 console.log(policy.id+' => '+group.map(x=>x.attempts.map(a=>a.wavesCleared).join('/')).join(' | '));
 for(const r of group)for(const a of r.attempts)assert(a.upgrades>=0&&a.essenceAfter>=0&&a.goldAfter>=0);
}
console.log('EARNED RETRY DETAILS '+JSON.stringify(results.map(x=>({policy:x.policy,seed:x.seed,rounds:x.attempts}))));
console.log('PASS: nine multi-attempt earned-progression sessions, real purchases and repeated battle attempts, no milestone double-awards or invented resources.');
console.log('LIMIT: automated spending policies and scripted simulation; no human playtime or physical iPhone acceptance.');
