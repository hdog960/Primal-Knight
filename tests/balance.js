// Alpha 0.9.0 deterministic thirty-tier endgame battle simulations.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('game.js','utf8');
function createWorld(seedValue=117){
 let seed=seedValue>>>0;
 const seededMath=Object.create(Math);
 seededMath.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.classList={add(){},remove(){},toggle(){}};this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;this.onclick=null;this.listeners={};this.scrollTop=0;this.width=960;this.height=540;}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(obj,key){return obj[key]||(()=>{});},set(obj,key,value){obj[key]=value;return true;}});}
  addEventListener(type,cb){this.listeners[type]=cb;}
  querySelectorAll(){return[];}querySelector(){return null;}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class FakeImage{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const sandbox={Image:FakeImage,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},window:{__PK_TEST__:true,addEventListener(){}},
  localStorage:{getItem(){return null;},setItem(){}},Math:seededMath,Date,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},
  performance:{now:()=>1000},console,confirm(){return true;},Blob,URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(code,sandbox,{filename:'game.js'});
 const hooks=sandbox.window.__PK_TEST_TOOLS__;
 assert(hooks,'Game exposes test hooks');
 return {hooks,sandbox};
}
const gearSlots=['amulet','chest','helm','legs','boots','gauntlets','ring1','ring2','ring3','ring4'];
function buildProfile(hooks,peak=false){
 const p=hooks.p();
 const training=peak
  ?{power:1200,haste:500,fort:1000,crit:220,critDmg:500,pierce:250,regen:500,resist:200,multishot:40,range:350,boss:500,shock:150}
  :{power:300,haste:170,fort:450,crit:110,critDmg:110,pierce:100,regen:100,resist:100,multishot:24,range:100,boss:100,shock:45};
 const ascension=peak
  ?{vanguard:40,bastion:40,sunder:30,epoch:40,volley:36}
  :{vanguard:3,bastion:3,sunder:0,epoch:0,volley:0};
 Object.assign(p.training,training);Object.assign(p.ascension,ascension);
 p.level=peak?1000:180;
 Object.assign(p.skills,peak?{
  aim:5,quiver:5,penetrate:5,double:5,focus:5,storm:5,ember:5,frost:5,spark:5,inferno:5,hail:5,tempest:5,
  stone:5,mend:5,thorns:5,ward:5,bulwark:5,laststand:5,fortune:5,scavenger:5,wisdom:5,midas:5,salvage:5,prosperity:5
 }:{aim:5,quiver:5,penetrate:3,double:3,focus:3,stone:5,mend:3,ward:3,bulwark:3,fortune:3});
 Object.assign(p.stations,peak?{ballista:80,thunder:80,cryo:80,gravity:80,midas:80}:{ballista:20,thunder:10,cryo:10,gravity:10});
 Object.assign(p.research,{calibration:peak?15:10,masonry:peak?16:10,attunement:peak?12:6});
 Object.assign(p.legacy,peak?{siegebreaker:30,guardianOath:35,goldenTouch:40}:{siegebreaker:10,guardianOath:10,goldenTouch:5});
 p.inventory=[];p.equipped={};p.socketed={};
 gearSlots.forEach((slot,i)=>{
  const id='sim-gear-'+i;
  const underlying=slot.startsWith('ring')?'ring':slot;
  p.inventory.push({id,slot:underlying,rarity:peak?8:4,plus:peak?50:12});
  p.equipped[slot]=id;
 });
 return p;
}
function simulate({tier,wave,peak=false,crest=false,maxSeconds=40,seed=117}){
 const {hooks}=createWorld(seed);buildProfile(hooks,peak);
 if(crest)for(let t=17;t<=30;t++)hooks.p().dominionCrests[t]=t===30?3:4; // Final seal must be earned by finishing Tier XXX
 const run=hooks.run();
 run.phase='ready';run.wave=wave;run.tier=tier;run.speed=1;
 run.maxHealth=hooks.maxWall();run.health=run.maxHealth;
 hooks.beginWave();
 let maxEnemies=0,maxShots=0,maxParticles=0,maxFloats=0,seconds=0;
 for(let frame=0;frame<maxSeconds*20&&run.phase==='fighting';frame++){
  hooks.tick(.05);seconds=(frame+1)*.05;
  maxEnemies=Math.max(maxEnemies,run.enemies.length);
  maxShots=Math.max(maxShots,run.shots.length);
  maxParticles=Math.max(maxParticles,run.particles.length);
  maxFloats=Math.max(maxFloats,run.floats.length);
 }
 assert(maxEnemies<=24,'Bounded enemies per wave');
 assert(maxShots<=48,'Bounded projectiles per wave');
 assert(maxParticles<=140,'Bounded particle effects');
 assert(maxFloats<=28,'Bounded floating combat text');
 return {tier,wave,profile:peak?'endgame':'midgame',result:run.phase,seconds:+seconds.toFixed(1),survivingWall:Math.round(run.health),startingWall:run.maxHealth,
  escaped:run.breaches,enemyCount:run.total,maxEnemies,maxShots,maxParticles,maxFloats};
}
const tier13Entry=simulate({tier:13,wave:20,peak:false,maxSeconds:45});
const midOldTierEnd=simulate({tier:1,wave:10000,peak:false,maxSeconds:45});
const endgameTierOne=simulate({tier:1,wave:10000,peak:true,maxSeconds:45});
const endgameTierSixteen=simulate({tier:16,wave:10000,peak:true,maxSeconds:45});
const midgameTierSeventeen=simulate({tier:17,wave:20,peak:false,maxSeconds:45});
const endgameTierThirty=simulate({tier:30,wave:10000,peak:true,maxSeconds:45});
const ascendantTierThirty=simulate({tier:30,wave:10000,peak:true,crest:true,maxSeconds:45});
const trialSeeds=[117,320,941,2027].map(seed=>({seed,unprepared:simulate({tier:30,wave:10000,peak:true,crest:false,maxSeconds:45,seed}),prepared:simulate({tier:30,wave:10000,peak:true,crest:true,maxSeconds:45,seed})}));
console.log('TIER XXX SEED STRESS',JSON.stringify(trialSeeds.map(x=>({seed:x.seed,unprepared:x.unprepared.result,prepared:x.prepared.result}))));
console.log('BALANCE TEST SCENARIOS');
console.log(JSON.stringify([tier13Entry,midOldTierEnd,endgameTierOne,endgameTierSixteen,midgameTierSeventeen,endgameTierThirty,ascendantTierThirty],null,2));
assert(tier13Entry.result==='intermission','Midgame build must clear Tier XIII entry at wave 20');
assert(midOldTierEnd.result!=='completed'&&midOldTierEnd.result!=='intermission','Same midgame build cannot finish Tier I at wave 10000');
assert(endgameTierOne.result==='completed','Fully developed build can conquer Tier I wave 10000');
assert(endgameTierSixteen.result==='completed','Maximum build can eventually conquer Tier XVI wave 10000');
assert(endgameTierThirty.result==='fallen','Top tier cannot be trivialized with maxed old progression alone');
assert(ascendantTierThirty.result==='completed','Completed earlier Dominion crests make the Tier XXX ultimate wave achievable');
for(const scenario of trialSeeds)assert(scenario.prepared.result==='completed','Crest-prepared Tier XXX victory remains attainable for battle seed '+scenario.seed);

// A long ladder needs an attainable permanent economy and item rarity progression.
const {hooks:economyHooks}=createWorld(320);
const economy=economyHooks.p();
const allMilestones=[5,10,15,20,35,50,75,100,150,250,400,500,750,1000,1500,2000,2500,3000,4000,5000,6000,7500,8000,9000,10000];
let allSigilRewards=0;
for(let tier=1;tier<=16;tier++)for(const wave of allMilestones){
 const prize=economyHooks.tierMilestone(tier,wave);
 if(['sigils','deepSigils','path','eternal','tier','legacy'].includes(prize.kind))allSigilRewards+=prize.amount;
 else if(prize.kind==='century')allSigilRewards+=12+tier*3;
}
const ascFullCosts=[[8,40],[9,40],[13,30],[19,40],[26,36]]
 .reduce((total,[base,max])=>total+Array.from({length:max},(_,rank)=>Math.ceil(base*(1+rank*.12+rank*rank*.018))).reduce((sum,cost)=>sum+cost,0),0);
const legacyFullCosts=[[2,30],[2,35],[3,40]]
 .reduce((total,[base,max])=>total+Array.from({length:max},(_,rank)=>Math.ceil(base*(1+rank*.35+Math.pow(rank,1.35)*.26))).reduce((sum,cost)=>sum+cost,0),0);
assert(allSigilRewards>=ascFullCosts+legacyFullCosts,'All one-time milestones can ultimately fund the full Ascension and Legacy trees');
assert(allSigilRewards<60000,'Sigil rewards do not inflate without limit');
const lootRarities=depth=>{
 economy.bestByTier[1]=depth;
 const found=new Set();
 for(let i=0;i<12000;i++)found.add(economyHooks.randomGear().rarity);
 return found;
};
const noMastery=lootRarities(0);
assert(Math.max(...noMastery)<=5,'Pre-ascension loot cannot bypass endgame rarity gates');
const ancientLoot=lootRarities(1000);
assert(ancientLoot.has(6)&&!ancientLoot.has(7)&&!ancientLoot.has(8),'Ancient rarity unlocks at wave 1000 only');
const celestialLoot=lootRarities(2500);
assert(celestialLoot.has(7)&&!celestialLoot.has(8),'Celestial rarity unlocks at wave 2500');
const eternalLoot=lootRarities(6000);
assert(eternalLoot.has(8),'Eternal rarity becomes obtainable at wave 6000');
console.log('ECONOMY CHECK',JSON.stringify({oneTimeSigils:allSigilRewards,fullAscensionCosts:ascFullCosts,fullLegacyCosts:legacyFullCosts,rarityGates:[0,1000,2500,6000]}));

console.log('PASS: Tier XIII access does not imply Tier I 10000 mastery; advanced progression makes deep waves achievable; object pools bounded.');
