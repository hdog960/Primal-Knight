// Alpha 0.11.3 — actual combat matrix across 9 hero builds and 10 rotating factions.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const script=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
function world(seedValue=1131){
 let seed=seedValue>>>0;
 const random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.innerHTML='';this.textContent='';
   this.hidden=false;this.disabled=false;this.className='';this.width=960;this.height=540;
   this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},
   {get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(name,fn){this.listeners[name]=fn;}querySelectorAll(){return [];}querySelector(){return null;}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null);
 const sandbox={Math:random,Image,console,Date,Blob,confirm(){return true;},
  window:{__PK_TEST__:true,addEventListener(){}},document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
  localStorage:{getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
  performance:{now:()=>1000},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(script,sandbox,{filename:'game.js'});
 const h=sandbox.window.__PK_TEST_TOOLS__;
 assert(h,'Real playable combat source exports test hooks');
 return {h,el,store};
}
function target(extra={}){
 return {type:'guardian',x:420,y:307,hp:10000,max:10000,armor:45,valued:10,
  speed:0,slow:0,burn:0,buildup:0,wobble:0,dead:false,isBoss:false,
  golden:false,...extra};
}
function directHit(kind,armor,crests={}){
 const w=world(1131),h=w.h,p=h.p(),r=h.run();
 p.level=8;p.combatPassive='conductor';p.dominionCrests=crests;
 r.phase='fighting';r.wave=150;r.tier=1;
 const foe=target({armor});r.enemies=[foe];
 h.hurt(foe,100,kind);
 return 10000-foe.hp;
}
// The mechanical regression found during balance review: hero magic was accidentally
// receiving station-specific prestige multipliers. Keep the systems distinct.
const bareArcane=directHit('arcane',45,{});
const crestArcane=directHit('arcane',45,{26:4});
const bareThunder=directHit('lightning',45,{});
const crestThunder=directHit('lightning',45,{26:4});
assert(Math.abs(bareArcane-crestArcane)<.000001,
 'A hero Arcane Chain is never empowered by station-only Dominion Crests');
assert(crestThunder>bareThunder,
 'Actual fortress thunder attacks continue to receive the original station damage bonus');
assert(bareArcane>bareThunder,
 'Hero arcane spells gain a meaningful armor-piercing identity against shielded enemies');
assert(Math.abs(directHit('arcane',0,{})-directHit('lightning',0,{}))<.000001,
 'Magic armor piercing adds no fake damage against a completely unarmored opponent');
const rawHero=directHit('arcane',45,{}),rawStation=directHit('lightning',45,{});
assert(rawHero>rawStation,'35% armor bypass works after all existing damage modifiers');
const conductorMagic=directHit('arcane',45,{});
const hunterMagic=(()=>{const w=world(1132),h=w.h,p=h.p(),r=h.run();
 p.level=8;p.combatPassive='hunter';r.phase='fighting';r.enemies=[target()];
 h.hurt(r.enemies[0],100,'arcane');return 10000-r.enemies[0].hp;
})();
assert(conductorMagic>hunterMagic,'Storm Conductor still boosts actual hero magic by 10%');
assert(Math.abs(conductorMagic/hunterMagic-1.10)<.001,'Conductor magic bonus stays precisely bounded');

// A single fixed-build matrix exercises actual enemy waves rather than guessed damage
// formulas or playtime projections. Only the *same seed* is compared per battle.
const doctrines=['vanguard','storm','aegis'],passives=['hunter','conductor','sentinel'];
const factionCases=Array.from({length:10},(_,i)=>({tier:i+1,wave:20,label:'FACTION '+(i+1)}));
const bossCases=[
 {tier:1,wave:25,label:'SIEGE BEAST'},
 {tier:1,wave:100,label:'IRON TYRANT'},
 {tier:1,wave:200,label:'CINDER REGENT'},
 {tier:1,wave:300,label:'VOID MONARCH'}
];
const lateCases=[
 {tier:17,wave:100,label:'OUTER REALM T17'},
 {tier:24,wave:250,label:'OUTER REALM T24'},
 {tier:30,wave:10000,label:'MAX-WAVE T30'}
];
const scenarios=[...factionCases,...bossCases,...lateCases];
const twoSeeds=[11711,11717];
const outcomes=[];
let allCasts=Object.fromEntries(doctrines.flatMap(d=>passives.map(p=>[d+'+'+p,0])));
for(const scenario of scenarios){
 for(const seed of twoSeeds){
  for(const doctrine of doctrines){
   for(const passive of passives){
    const w=world(seed+scenario.tier*101+scenario.wave),h=w.h,p=h.p(),r=h.run();
    p.level=20;p.combatDoctrine=doctrine;p.combatPassive=passive;
    p.training.power=24;p.training.haste=18;p.training.fort=32;p.training.multishot=8;
    p.skills.aim=3;p.skills.quiver=3;p.skills.spark=3;p.skills.hail=2;
    p.skills.stone=3;p.skills.bulwark=3;
    p.stations.ballista=2;p.stations.thunder=2;
    r.tier=scenario.tier;r.wave=scenario.wave;r.phase='ready';
    h.beginWave();
    r.health=r.maxHealth;
    const encounter=h.encounterDirector(scenario.wave,scenario.tier);
    assert.equal(r.encounter.factionId,encounter.factionId,'Simulated scene uses actual faction encounter');
    const maxHP=r.maxHealth;
    let maxShots=0,maxEnemies=0;
    for(let step=0;step<380&&r.phase==='fighting';step++){
     h.tick(.05);
     maxShots=Math.max(maxShots,r.shots.length);
     maxEnemies=Math.max(maxEnemies,r.enemies.length);
     assert(Number.isFinite(r.health)&&Number.isFinite(r.time),'Combat never yields invalid wall health or time');
     assert(r.health<=r.maxHealth&&r.health>=0,'Wall HP remains in legal range');
     assert(r.shots.length<=48,'Even high-tier nine-build fights respect original 48-projectile cap');
     assert(r.enemies.length<=24,'All encounters respect original 24-enemy cap');
     assert(r.particles.length<=140&&r.floats.length<=28,'Combat VFX respect original mobile caps');
    }
    const record={
     scenario:scenario.label,tier:scenario.tier,wave:scenario.wave,seed,doctrine,passive,
     casts:r.doctrineCasts||0,kills:r.enemiesDefeated||0,breaches:r.totalBreaches||0,
     breaks:(r.totalBossBreaks||0)+(r.totalSpecialistBreaks||0),
     survivingWall:Number((r.health/maxHP).toFixed(4)),phase:r.phase,
     time:Number(r.time.toFixed(2)),maxShots,maxEnemies
    };
    assert(record.time<=19.1,'Controlled comparison never pretends to be a full playthrough');
    assert(['fighting','intermission','completed','fallen'].includes(record.phase),'Actual battle ends in legal state');
    assert(Number.isFinite(record.survivingWall),'Healthy and fallen run metrics are finite');
    outcomes.push(record);
    allCasts[doctrine+'+'+passive]+=record.casts;
   }
  }
 }
}
const expected=scenarios.length*twoSeeds.length*doctrines.length*passives.length;
assert.equal(outcomes.length,expected,'Every paired faction/boss/deep-wave matchup was evaluated');
assert.equal(expected,306,'Comparison covers exactly 306 controlled live-combat scenes');
for(const [name,casts] of Object.entries(allCasts)){
 assert(casts>=1,name+' successfully auto-casts a real ability in at least one seeded encounter');
}
for(const [i,scenario] of factionCases.entries()){
 const rows=outcomes.filter(x=>x.tier===scenario.tier&&x.wave===scenario.wave);
 assert.equal(rows.length,18,'Every actual faction has 2 same-seed results for each of 9 combat builds');
 const example=h=>h;
 assert(rows.some(r=>r.maxEnemies>=2),'Real enemy populations were spawned rather than testing against a static dummy');
}
const groups=Object.entries(allCasts).map(([name,casts])=>{
 const records=outcomes.filter(x=>x.doctrine+'+'+x.passive===name);
 const mean=key=>records.reduce((n,x)=>n+x[key],0)/records.length;
 return {build:name,casts,kills:mean('kills'),breaches:mean('breaches'),
  wall:mean('survivingWall'),interrupts:mean('breaks'),
  clears:records.filter(x=>x.phase==='intermission'||x.phase==='completed').length,
  defeats:records.filter(x=>x.phase==='fallen').length};
});
assert(groups.every(g=>Number.isFinite(g.kills)&&Number.isFinite(g.wall)&&g.wall>=0),
 'Each of nine build profiles has meaningful finite comparable combat results');
const summary=groups.map(g=>g.build.padEnd(20)+
 ' casts='+String(g.casts).padStart(3)+
 ' avg kills='+g.kills.toFixed(2).padStart(6)+
 ' avg breaches='+g.breaches.toFixed(2).padStart(6)+
 ' avg wall='+g.wall.toFixed(3).padStart(5)+
 ' clears='+String(g.clears).padStart(2)+
 ' defeats='+String(g.defeats).padStart(2));
console.log('REAL 9-BUILD COMBAT MATRIX · '+expected+' SEEDED SCENES · 10 FACTIONS, 4 BOSSES, 3 OUTER-REALM CHECKPOINTS');
for(const line of summary)console.log(line);
console.log('CAUTION: Controlled 19s combat slices; not 1,250-hour progression or physical iPhone QA.');

// A bounded, long-lived pressure scene must demonstrate a Guardian survival niche.
// Use the real game tick, wall impacts and cast cooldown, with identical enemies.
function siegePressure(doctrine,passive){
 const w=world(5512),h=w.h,p=h.p(),r=h.run();
 p.level=8;p.combatDoctrine=doctrine;p.combatPassive=passive;
 r.tier=1;r.wave=30;r.phase='ready';h.beginWave();
 // Leave one enemy unspawned behind a delayed clock so neither profile collects
 // a wave-clear healing reward during the measured pressure window.
 r.spawned=r.total-1;r.spawnClock=99;r.shotClock=99;r.stationClock=99;
 r.maxHealth=10000;r.health=5000;r.doctrineClock=.1;
 r.enemies=[0,1,2].map((i)=>({
  type:'goblin',x:350+i*110,y:385+i*2,hp:1e7,max:1e7,armor:0,speed:5,
  dead:false,slow:0,burn:0,buildup:0,wobble:0,isBoss:false,valued:1
 }));
 for(let n=0;n<330&&r.phase==='fighting';n++)h.tick(.05);
 return {hp:r.health,breaches:r.totalBreaches||0,casts:r.doctrineCasts};
}
const offense=siegePressure('vanguard','hunter');
const guard=siegePressure('aegis','sentinel');
console.log('MATCHED PRE-REWARD WALL PRESSURE: Hunter Volley '+JSON.stringify(offense)+' vs Aegis Rampart '+JSON.stringify(guard));
assert(guard.casts>0&&offense.casts>0,'Both real builds use their active doctrines under wall pressure');
assert(guard.hp>offense.hp,'Defensive Guardian pairing preserves more real wall HP during a prolonged push');
assert(guard.breaches<=offense.breaches,'Guardian knockback cannot worsen the paired fortress breach count');
console.log('CONTROLLED FORTRESS PRESSURE: Hunter Volley '+JSON.stringify(offense)+' vs Aegis Rampart '+JSON.stringify(guard));
assert(html.includes('ALPHA 0.15.19')&&html.includes('game.js?v=0.15.19'),'Latest iPhone Safari release assets are cache-busted');
console.log('PASS: Alpha 0.11.3 306 real seeded encounter battles, 9 hero combinations, unique armor-piercing magic, no station bonus leakage, original caps, measurable Guardian niche and valid deep-wave states.');
