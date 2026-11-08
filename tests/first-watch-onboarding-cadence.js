// Alpha 0.15.20: verify the opening First Watch reward in real novice combat.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.innerHTML='';this.textContent='';this.hidden=false;this.className='';this.scrollTop=0;this.disabled=false;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};this.listeners={};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}
 addEventListener(k,fn){this.listeners[k]=fn}setAttribute(k,v){this.attrs[k]=String(v)}querySelectorAll(){return []}querySelector(){return null}
}
function world(initialSeed){
 let seed=initialSeed>>>0;
 const rng=Object.create(Math);rng.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=120;this.naturalHeight=120}}
 const store=Object.create(null);
 const env={Math:rng,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(js,env,{filename:'game.js'});
 return {h:env.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.20')&&html.includes('game.js?v=0.15.20')&&html.includes('style.css?v=0.15.20'));
const base=world(11601),schedule=base.h.earlyWatchChapters;
assert.equal(schedule.length,16,'Original sixteen finite First Watch chapters retained');
assert.equal(schedule[0][0],2,'First Blood must arrive at two real active minutes');
assert.equal(schedule[0][1],'First Blood');
assert.equal(schedule[0][2],220);assert.equal(schedule[0][3],45);
assert.equal(schedule[0][5],0,'No early Sigil handout');
assert.equal(schedule[1][0],7);assert.equal(schedule[15][0],750,'The 12.5-hour finish stays locked');
assert.equal(schedule[15][1],'The First Watch Complete');
for(let i=1;i<schedule.length;i++){
 assert(schedule[i][0]>schedule[i-1][0],'Reward time must increase');
 assert(Math.ceil(schedule[i][0]*1.5)>Math.ceil(schedule[i-1][0]*1.5),'True unique-clear gates increase');
 for(let k=2;k<=5;k++)assert(schedule[i][k]>=0,'Rewards are nonnegative');
}
const sums=schedule.reduce((a,r)=>a.map((v,i)=>v+r[i+2]),[0,0,0,0]);
assert.equal(sums[0],67120,'Gold reward conservation');
assert.equal(sums[1],23910,'Essence reward conservation');
assert.equal(sums[2],17,'Skill point reward conservation');
assert.equal(sums[3],127,'Sigil reward conservation');
const logs=[];
for(const seed of [11601,11617,11633]){
 const {h,store}=world(seed),p=h.p(),r=h.run();
 assert.equal(p.level,1);assert.equal(p.gold,520);assert.equal(p.essence,180);
 const starterGear=JSON.stringify(p.inventory.slice(0,4)),starterRunes=JSON.stringify(p.runes.slice(0,2));
 assert.equal(h.enterSiege(),true);
 let sawFirst=false,firstAt=0,firstClears=0,frames=0,prevGold=p.gold,prevEssence=p.essence,prevClears=0,wasMidwave=false;
 while(r.phase!=='fallen'&&r.wavesCleared<20&&frames<56000){
  h.tick(.05);frames++;
  if(!sawFirst&&p.firstWatchClaimed.includes(0)){
   sawFirst=true;firstAt=p.battleSeconds;firstClears=p.uniqueClears;
   assert(firstAt>=120&&firstAt<180,'First Blood earned in the revised two-to-three-minute window');
   assert(firstClears>=3,'No First Watch award without genuine first-clear progress');
   assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length);
   const saved=JSON.parse(store[SAVE]);
   assert(saved.firstWatchClaimed.includes(0),'Award was persisted before another wave completed');
   assert.equal(saved.gold,p.gold);assert.equal(saved.essence,p.essence);
   wasMidwave=r.phase==='fighting';
   if(prevClears===r.wavesCleared){
    assert.equal(p.gold-prevGold,220,'First Blood pays original 220 Gold exactly');
    assert.equal(p.essence-prevEssence,45,'First Blood pays original 45 Essence exactly');
   }
  }
  prevGold=p.gold;prevEssence=p.essence;prevClears=r.wavesCleared;
 }
 assert(frames<56000,'Real combat reaches a loss or first twenty waves without timing out');
 assert.equal(r.phase,'fallen','Uninvested original starter strategy still experiences a genuine first loss');
 assert(sawFirst,'A no-spend new player earns First Blood before first real defeat');
 assert(firstAt<p.battleSeconds,'First Blood arrives while the first real siege is still active');
 assert.equal(p.firstWatchClaimed.filter(x=>x===0).length,1);
 assert.equal(JSON.stringify(p.inventory.slice(0,4)),starterGear,'All original starter gear intact');
 assert.equal(JSON.stringify(p.runes.slice(0,2)),starterRunes,'All original starter runes intact');
 const before=JSON.stringify({gold:p.gold,essence:p.essence,points:p.points,sigils:p.sigils,claimed:p.firstWatchClaimed});
 h.awardFirstWatch();
 assert.equal(JSON.stringify({gold:p.gold,essence:p.essence,points:p.points,sigils:p.sigils,claimed:p.firstWatchClaimed}),before,'First Blood cannot be farmed after defeat');
 assert.equal(p.uniqueClears,r.wavesCleared,'Real clear count comes from actual combat, not a test fixture');
 logs.push({seed,firstAtMinutes:Number((firstAt/60).toFixed(2)),uniqueClearsAtReward:firstClears,midWave:wasMidwave,realFirstLoss:r.wave,realClears:r.wavesCleared});
}
// Unit boundary fixtures below are NOT simulated earned-player sessions.
const gate=world(6),gh=gate.h,gp=gh.p(),gr=gh.run();
assert.equal(gh.enterSiege(),true);
gp.battleSeconds=119.99;gp.uniqueClears=2;
gh.tick(.05);
assert(!gp.firstWatchClaimed.includes(0),'Two real-clears requirement not met; clock alone does not pay');
gp.uniqueClears=3;gh.awardFirstWatch();
assert(gp.firstWatchClaimed.includes(0),'Late-arriving third unique clear releases earned chapter');
const future=world(7),fh=future.h,fp=fh.p(),fr=fh.run();
assert.equal(fh.enterSiege(),true);
fp.firstWatchClaimed=[0];fp.uniqueClears=11;fp.battleSeconds=7*60-.03;
const sigils=fp.sigils;fh.tick(.05);
assert(fp.firstWatchClaimed.includes(1),'Later chapter can award mid-wave at actual threshold');
assert.equal(fp.sigils,sigils+1,'Existing one-time Sigil amount unchanged');
assert(JSON.parse(future.store[SAVE]).firstWatchClaimed.includes(1),'Later timed award persists');
const beforeSecond=fp.sigils;fh.awardFirstWatch();assert.equal(fp.sigils,beforeSecond);
console.log('FIRST WATCH OPENING REAL-ENGINE NOVICE COHORT '+JSON.stringify(logs));
console.log('PASS Alpha 0.15.20: 3 natural no-spend first sieges earn First Blood before defeat, original budget, instant durable payment, exact time and first-clear gates, finite 16-chapter ledger');
console.log('LIMIT: Three seeded first-siege combat simulations and deterministic clock fixtures, not a full 12.5h campaign, physical iPhone QA, or a measured 1,250h playthrough.');
