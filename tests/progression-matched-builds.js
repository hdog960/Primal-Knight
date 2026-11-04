// Alpha 0.11.4 — progression-matched nine-build comparisons using real game combat.
// These are explicit plausible INVESTMENT FIXTURES, not reconstructed player save files,
// measured completion-time curves, or a claim of globally balanced win rates.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const doctrines=['vanguard','storm','aegis'];
const passives=['hunter','conductor','sentinel'];
const seeds=[11441,11447];
const slots=['helm','amulet','chest','legs','boots','gauntlets','charm','ring1','ring2','ring3','ring4'];

function world(seedValue){
 let seed=seedValue>>>0;
 const random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';
   this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;
   this.listeners={};this.scrollTop=0;this.width=960;this.height=540;
   this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},
   {get(obj,key){return obj[key]||(()=>{});},set(obj,key,value){obj[key]=value;return true;}});}
  addEventListener(type,cb){this.listeners[type]=cb;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const nodes=new Map();
 const el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const storage=Object.create(null);
 const sandbox={Math:random,Image,Date,Blob,console,confirm(){return true;},
  window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
  localStorage:{getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=String(v);},removeItem(k){delete storage[k];}},
  performance:{now:()=>1000},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 assert(sandbox.window.__PK_TEST_TOOLS__,'Real combat hooks must load');
 return sandbox.window.__PK_TEST_TOOLS__;
}
const skills=['aim','quiver','penetrate','double','focus','storm','ember','frost','spark','inferno','hail','tempest',
 'stone','mend','thorns','ward','bulwark','laststand','fortune','scavenger','wisdom','midas','salvage','prosperity'];
// Progression stages intentionally vary levels, training, equipment and legacy systems,
// instead of repeating the level-20 hero at every Tier I–XXX encounter.
const stages=[
 {id:'FIRST WATCH',tier:1,wave:20,level:8,rarity:1,plus:1,skill:0,
  training:{power:8,haste:6,fort:12,pierce:2,multishot:0,resist:3},
  overrides:{aim:2,quiver:2,spark:1,stone:1},stations:{ballista:1},duration:40},
 {id:'FRONTIER ENTRY',tier:13,wave:20,level:180,rarity:4,plus:12,skill:3,
  training:{power:300,haste:170,fort:450,crit:110,critDmg:110,pierce:100,regen:100,resist:100,multishot:24,range:100,boss:100,shock:45},
  stations:{ballista:20,thunder:10,cryo:10,gravity:10},
  research:{calibration:10,masonry:10,attunement:6},
  legacy:{siegebreaker:10,guardianOath:10,goldenTouch:5},
  ascension:{vanguard:3,bastion:3},duration:45},
 {id:'OUTER TERRITORY',tier:24,wave:250,level:480,rarity:7,plus:30,skill:5,
  training:{power:780,haste:350,fort:780,crit:180,critDmg:340,pierce:180,regen:320,resist:160,multishot:32,range:240,boss:320,shock:100},
  stations:{ballista:52,thunder:45,cryo:40,gravity:35,midas:35},
  research:{calibration:15,masonry:16,attunement:12},
  legacy:{siegebreaker:25,guardianOath:28,goldenTouch:30},
  ascension:{vanguard:24,bastion:24,sunder:16,epoch:16,volley:18},
  sovereignOaths:{sovereignBlade:12,sovereignAegis:9},duration:45},
 {id:'CREST PREPARED ENDGAME',tier:30,wave:10000,level:1000,rarity:8,plus:50,skill:5,
  training:{power:1200,haste:500,fort:1000,crit:220,critDmg:500,pierce:250,regen:500,resist:200,multishot:40,range:350,boss:500,shock:150},
  stations:{ballista:80,thunder:80,cryo:80,gravity:80,midas:80},
  research:{calibration:15,masonry:16,attunement:12},
  legacy:{siegebreaker:30,guardianOath:35,goldenTouch:40},
  ascension:{vanguard:40,bastion:40,sunder:30,epoch:40,volley:36},
  sovereignOaths:{sovereignBlade:58,sovereignAegis:58,sovereignTribute:58,sovereignJudgment:58},
  crests:true,duration:45}
];
function prepare(h,stage,doctrine,passive){
 const p=h.p();
 p.level=stage.level;
 p.combatDoctrine=doctrine;p.combatPassive=passive;
 Object.assign(p.training,stage.training);
 for(const s of skills)p.skills[s]=stage.skill;
 Object.assign(p.skills,stage.overrides||{});
 Object.assign(p.stations,stage.stations||{});
 Object.assign(p.research,stage.research||{});
 Object.assign(p.legacy,stage.legacy||{});
 Object.assign(p.ascension,stage.ascension||{});
 Object.assign(p.sovereignOaths,stage.sovereignOaths||{});
 if(stage.crests){
  for(let t=17;t<=29;t++)p.dominionCrests[t]=4;
  p.dominionCrests[30]=3;
 }
 p.inventory=[];p.equipped={};p.socketed={};
 for(const [i,slot] of slots.entries()){
  const id='qa-'+i;
  p.inventory.push({id,slot:slot.startsWith('ring')?'ring':slot,rarity:stage.rarity,plus:stage.plus});
  p.equipped[slot]=id;
 }
 assert.equal(p.inventory.length,11,'Full, unique equipment inventory is equipped');
 assert.equal(new Set(Object.values(p.equipped)).size,11,'No QA profile duplicates equipment IDs');
 assert.equal(h.chosenDoctrine().id,doctrine,'The real combat engine recognizes the selected ability');
 return p;
}
const rows=[];
for(const stage of stages){
 for(const seed of seeds){
  for(const doctrine of doctrines){
   for(const passive of passives){
    const h=world(seed+stage.tier*1009+stage.wave),p=prepare(h,stage,doctrine,passive),r=h.run();
    const initialSave=JSON.stringify({inventory:p.inventory,equipped:p.equipped,training:p.training,
     ascension:p.ascension,sovereignOaths:p.sovereignOaths,dominionCrests:p.dominionCrests});
    r.phase='ready';r.tier=stage.tier;r.wave=stage.wave;r.speed=1;
    r.maxHealth=h.maxWall();r.health=r.maxHealth;
    assert(Number.isFinite(h.damage())&&h.damage()>0,'Profile has legitimate finite attack power');
    h.beginWave();
    assert.equal(r.encounter.wave,stage.wave,'The actual encounter director owns the wave');
    assert(r.total>0&&r.total<=24,'Genuine bounded enemy formation is scheduled');
    let maxEnemies=0,maxShots=0,ticks=0;
    for(let step=0;step<stage.duration*20&&r.phase==='fighting';step++){
     h.tick(.05);ticks++;
     maxEnemies=Math.max(maxEnemies,r.enemies.length);
     maxShots=Math.max(maxShots,r.shots.length);
     assert(r.enemies.length<=24&&r.shots.length<=48,'Mobile actor and shot caps hold');
     assert(r.particles.length<=140&&r.floats.length<=28,'Mobile visual caps hold');
     assert(Number.isFinite(r.health)&&Number.isFinite(r.time),'Combat stays numerically stable');
     assert(r.health>=0&&r.health<=r.maxHealth,'Fortress health stays bounded');
    }
    assert(ticks>0,'Actual game ticks ran');
    assert(['fighting','intermission','completed','fallen'].includes(r.phase),'Real combat conclusion remains legal');
    assert.equal(JSON.stringify({inventory:p.inventory.slice(0,11),equipped:p.equipped,training:p.training,
     ascension:p.ascension,sovereignOaths:p.sovereignOaths,dominionCrests:p.dominionCrests}),initialSave,
     'No test battle modifies an existing item or permanent investment');
    rows.push({stage:stage.id,tier:stage.tier,wave:stage.wave,seed,doctrine,passive,
     killed:r.enemiesDefeated||0,breaches:r.totalBreaches||0,casts:r.doctrineCasts||0,
     remaining:Number((r.health/r.maxHealth).toFixed(4)),phase:r.phase,
     seconds:Number(r.time.toFixed(2)),maxEnemies,maxShots});
   }
  }
 }
}
assert.equal(rows.length,stages.length*seeds.length*doctrines.length*passives.length,
 'All identical-investment nine-build comparisons complete');
const isClear=x=>x.phase==='intermission'||x.phase==='completed';
let totalCasts=0;
for(const stage of stages){
 const stageRows=rows.filter(x=>x.stage===stage.id);
 assert.equal(stageRows.length,18,'Every stage has two seeds for all nine build choices');
 const heading=stage.id+' | T'+stage.tier+' W'+stage.wave+' | L'+stage.level;
 console.log('\n'+heading+' | paired seed, identical gear/training/ascension/oaths');
 for(const doctrine of doctrines){
  for(const passive of passives){
   const chosen=stageRows.filter(x=>x.doctrine===doctrine&&x.passive===passive);
   const sum=k=>chosen.reduce((acc,x)=>acc+x[k],0);
   const label=(doctrine+'+'+passive).padEnd(20);
   console.log(label+' clear='+chosen.filter(isClear).length+'/2'+
    ' kills='+String(sum('killed')/2).padStart(5)+
    ' breach='+String(sum('breaches')/2).padStart(5)+
    ' wall='+String((sum('remaining')/2).toFixed(3)).padStart(5)+
    ' casts='+sum('casts'));
   totalCasts+=sum('casts');
  }
 }
 const noClear=stageRows.filter(x=>!isClear(x)).length;
 const allClear=stageRows.filter(isClear).length===stageRows.length;
 if(noClear===stageRows.length)console.log('DIAGNOSTIC: No build cleared in allotted time; do NOT infer all nine builds are weak.');
 if(allClear)console.log('DIAGNOSTIC: Every build cleared; this stage alone cannot identify a dominant build.');
}
assert(totalCasts>0,'At least one realistic wave produces a real hero ability cast');
console.log('\nPASS: '+rows.length+' progression-matched, seed-paired real combat slices across 4 investment profiles.');
console.log('LIMIT: These authored investment fixtures are NOT earned player saves, full waves-to-10k runs,');
console.log('      measured win probabilities, iPhone visual QA, or proof of 1,250-hour endgame pacing.');
