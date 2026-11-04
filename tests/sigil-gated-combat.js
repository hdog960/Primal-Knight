// Alpha 0.11.8 — milestone-budget-constrained *hypothetical* late-stage combat.
// Assumed earlier milestone victories are granted ONLY by rewardMilestone(), which
// uses the real game's one-time awards; none is misrepresented as a played wave.
// Non-Sigil level/gear/training remain explicitly synthetic investment assumptions.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const source=fs.readFileSync('game.js','utf8');
const doctrines=['vanguard','storm','aegis'],passives=['hunter','conductor','sentinel'];
const seeds=[11809,11841];
const scenarios=[
 {id:'ENTER DOMINION',tier:17,wave:100,level:190,rarity:4,plus:12,
  train:{power:300,haste:180,fort:380,pierce:100,regen:100,resist:90,multishot:10},station:15,
  research:{calibration:8,masonry:8},returnVisits:false},
 {id:'MID DOMINION',tier:24,wave:150,level:420,rarity:6,plus:22,
  train:{power:650,haste:300,fort:650,crit:130,critDmg:250,pierce:150,regen:200,resist:130,multishot:24,range:200,boss:200},station:36,
  research:{calibration:12,masonry:14,attunement:8},returnVisits:true},
 {id:'FINAL FRONTIER',tier:30,wave:250,level:700,rarity:7,plus:35,
  train:{power:950,haste:420,fort:860,crit:195,critDmg:400,pierce:200,regen:350,resist:180,multishot:34,range:250,boss:390,shock:100},station:64,
  research:{calibration:15,masonry:16,attunement:12},returnVisits:true}
];
const slots=['helm','amulet','chest','legs','boots','gauntlets','charm','ring1','ring2','ring3','ring4'];
function world(initialSeed){
 let seed=initialSeed>>>0,random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 class El{
  constructor(id){this.id=id;this.style={};this.dataset={};this.listeners={};this.className='';this.textContent='';this.innerHTML='';this.hidden=false;this.disabled=false;this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(k,fn){this.listeners[k]=fn;}querySelectorAll(){return []}querySelector(){return null}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.create(null);
 const sandbox={Math:random,Date,Blob,Image,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll(){return []},addEventListener(){},hidden:false},
  localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 return sandbox.window.__PK_TEST_TOOLS__;
}
function grantAssumedMilestones(h,s){
 const p=h.p();let awards=0;
 const claimed=new Set();
 function award(t,w){
  if(claimed.has(t+':'+w))return;
  const sigils=p.sigils;
  assert(h.rewardMilestone(t,w),'Assumed one-time victory is a valid live milestone');
  awards+=p.sigils-sigils;claimed.add(t+':'+w);
 }
 for(let tier=1;tier<=s.tier;tier++){
  const limit=tier===s.tier?s.wave-1:h.tierAdvanceWave(tier);
  assert(tier<=p.unlockedTier,'Tier must be unlocked by the prior gate (no invented territory access)');
  for(const w of h.tierMilestones(tier).filter(w=>w<=limit))award(tier,w);
  if(s.returnVisits&&tier>=17&&tier<s.tier){
   for(const w of h.tierMilestones(tier).filter(w=>w<=250))award(tier,w);
  }
 }
 assert.equal(p.unlockedTier,s.tier,'Assumed milestone-gated path unlocks precisely the checkpoint tier');
 assert.equal(p.sigils,awards,'Every Sigil in budget came from original milestone reward functions');
 assert.equal(new Set(Object.keys(p.milestones)).size,Object.keys(p.milestones).length);
 return {awards,achievements:claimed.size,crests:Object.values(p.dominionCrests).reduce((a,b)=>a+b,0)};
}
const policies=[
 {id:'ATTACK',priority:['oath:sovereignBlade','ascension:vanguard','ascension:sunder','ascension:volley','ascension:epoch','legacy:siegebreaker','ascension:bastion']},
 {id:'FORTRESS',priority:['oath:sovereignAegis','ascension:bastion','legacy:guardianOath','ascension:vanguard','legacy:siegebreaker','ascension:sunder']},
 {id:'SPLIT',priority:['ascension:vanguard','ascension:bastion','ascension:sunder','oath:sovereignBlade','oath:sovereignAegis','ascension:epoch','legacy:siegebreaker']}
];
function invest(h,policy){
 const p=h.p(),initial=p.sigils;let count=0;
 for(let attempt=0;attempt<80;attempt++){
  const choices=policy.priority.map(v=>v.split(':'));
  const kindToRank=(kind,id)=>kind==='legacy'?p.legacy[id]||0:kind==='ascension'?p.ascension[id]||0:p.sovereignOaths[id]||0;
  // Alternate across priorities in groups of 4 so one path cannot absorb the full budget.
  const [kind,id]=choices[Math.floor(attempt/4)%choices.length];
  const previous=kindToRank(kind,id),before=p.sigils;
  const bought=h.purchaseWarChest(kind,id);
  if(bought){
   assert(kindToRank(kind,id)===previous+1,'Only paid permanent upgrades can increase a Sigil rank');
   assert(before>p.sigils&&Number.isSafeInteger(before-p.sigils),'Each Sigil rank has a positive exact cost');
   count++;
  } else assert.equal(p.sigils,before,'Unavailable upgrade cannot spend finite Sigils');
 }
 const cost=initial-p.sigils;
 assert(cost>=0&&cost<=initial,'The strategy never spends more Sigils than won by milestones');
 return {count,cost,remaining:p.sigils};
}
function equipAssumedNonSigilInvestments(h,s,doctrine,passive){
 const p=h.p();p.level=s.level;p.combatDoctrine=doctrine;p.combatPassive=passive;
 Object.assign(p.training,s.train);
 Object.assign(p.research,s.research);
 for(const k of ['aim','quiver','penetrate','double','focus','storm','ember','frost','spark','inferno','hail','tempest','stone','mend','thorns','ward','bulwark','laststand'])p.skills[k]=5;
 Object.assign(p.stations,{ballista:s.station,thunder:Math.max(0,s.station-5),cryo:s.station,gravity:s.station,midas:Math.max(0,s.station-10)});
 p.inventory=[];p.equipped={};
 for(const [i,slot] of slots.entries()){
  const id='non-sigil-fixture-'+i;
  p.inventory.push({id,slot:slot.startsWith('ring')?'ring':slot,rarity:s.rarity,plus:s.plus});
  p.equipped[slot]=id;
 }
 assert.equal(new Set(Object.values(p.equipped)).size,11,'Gear fixture contains unique owned IDs');
}
const rows=[];
for(const s of scenarios)for(const policy of policies)for(const seed of seeds){
 const h=world(seed+s.tier*37),p=h.p(),r=h.run();
 const income=grantAssumedMilestones(h,s),budget=h.sigilLedgerSummary().eventualCapacity;
 const spending=invest(h,policy);
 assert.equal(h.sigilLedgerSummary().eventualCapacity,budget-spending.cost,
  'Sigil Ledger tracks each legal mastery purchase exactly');
 assert(p.sigils>=0,'No fabricated endgame resource balance');
 for(const doctrine of doctrines)for(const passive of passives){
  // Pair all nine builds on identical *purchased Sigil investments* and genuine
  // earned crest ranks. Restore the investment fixture between each battle.
  const rankSnapshot=JSON.stringify({legacy:p.legacy,ascension:p.ascension,sovereignOaths:p.sovereignOaths,dominionCrests:p.dominionCrests});
  equipAssumedNonSigilInvestments(h,s,doctrine,passive);
  r.phase='ready';r.tier=s.tier;r.wave=s.wave;r.speed=1;r.maxHealth=h.maxWall();r.health=r.maxHealth;
  r.enemies=[];r.shots=[];r.particles=[];r.floats=[];r.time=0;r.shotClock=0;r.stationClock=0;r.doctrineClock=3.5;r.doctrineCasts=0;
  h.beginWave();const start=r.time;
  for(let i=0;i<900&&r.phase==='fighting';i++){
   h.tick(.05);
   assert(r.enemies.length<=24&&r.shots.length<=48,'Mobile combat actor limits hold');
   assert(Number.isFinite(r.health)&&Number.isFinite(r.maxHealth),'Late combat does not overflow numeric state');
  }
  assert.equal(JSON.stringify({legacy:p.legacy,ascension:p.ascension,sovereignOaths:p.sovereignOaths,dominionCrests:p.dominionCrests}),rankSnapshot,
   'A wave must not remove paid ranks or earned Crests');
  rows.push({stage:s.id,policy:policy.id,seed,tier:s.tier,wave:s.wave,doctrine,passive,
   availableSigils:income.awards,spentSigils:spending.cost,bankedSigils:spending.remaining,
   boughtRanks:spending.count,earnedCrests:income.crests,
   phase:r.phase,seconds:Number((r.time-start).toFixed(1)),remainingWall:Number((r.health/r.maxHealth).toFixed(3)),
   enemyKills:r.kills||0});
 }
}
assert.equal(rows.length,scenarios.length*policies.length*seeds.length*9);
for(const s of scenarios){
 console.log('\n'+s.id+' | T'+s.tier+' W'+s.wave+' | NON-SIGIL LEVEL/GEAR/TRAINING REMAIN ASSUMED');
 for(const policy of policies){
  const x=rows.filter(v=>v.stage===s.id&&v.policy===policy.id);
  const clear=x.filter(v=>['intermission','completed'].includes(v.phase)).length;
  const d=x[0];console.log(policy.id.padEnd(10)+' earned-assumed milestone Sigils '+d.availableSigils+
   ' spent '+d.spentSigils+' remaining '+d.bankedSigils+' ranks '+d.boughtRanks+' earned-Crest seals '+d.earnedCrests+
   ' | paired combat clears '+clear+'/18; note: shared persistent scenario for abilities, no player win-rate claims');
 }
}
console.log('PASS: '+rows.length+' late-wave real-combat slices with finite Sigils awarded via original one-time gated milestones, actual priced mastery purchases and genuine crest awards.');
console.log('LIMIT: Assumed checkpoint victories are not battles physically won; other non-Sigil upgrades are synthetic, gear costs & 1,250h pacing unmeasured.');
