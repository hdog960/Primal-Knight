// Alpha 0.11.9 — real game automatic timing comparisons, not guessed win rates.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const tactics=['rapid','horde','crisis'],abilities=['vanguard','storm','aegis'],seeds=[11901,11939],waves=[1,25,50];
function world(seed0){
 let seed=seed0>>>0,random=Object.create(Math);random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class El{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.innerHTML='';this.textContent='';this.hidden=false;this.disabled=false;this.scrollTop=0;this.width=960;this.height=540;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(k,fn){this.listeners[k]=fn;}querySelectorAll(){return [];}querySelector(){return null;}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.create(null);
 const sandbox={Math:random,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll(){return []},addEventListener(){},hidden:false},
  localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 return sandbox.window.__PK_TEST_TOOLS__;
}
const rows=[];
for(const tactic of tactics)for(const ability of abilities)for(const wave of waves)for(const seed of seeds){
 const h=world(seed+wave*23),p=h.p(),r=h.run();
 // Intentional isolated non-earned profile; ONLY mode and active ability differ.
 p.level=7;p.training.power=12;p.training.haste=7;p.training.fort=12;p.stations.ballista=1;
 assert(h.chooseCombatDoctrine(ability));
 assert(h.chooseDoctrineTactic(tactic));
 r.tier=1;r.wave=wave;r.phase='ready';r.maxHealth=h.maxWall();r.health=r.maxHealth;r.speed=1;
 h.beginWave();let maxActors=0,maxShots=0,firstCast=null,firstHeld=null;
 const beginning=JSON.stringify({inventory:p.inventory,runes:p.runes,sigils:p.sigils,training:p.training,doctrineTactic:p.doctrineTactic});
 for(let i=0;i<1300&&r.phase==='fighting';i++){
  h.tick(.05);
  maxActors=Math.max(maxActors,r.enemies.length);maxShots=Math.max(maxShots,r.shots.length);
  assert(r.enemies.length<=24&&r.shots.length<=48,'Original combat pools remain bounded');
  assert(Number.isFinite(r.health)&&r.health>=0&&r.health<=r.maxHealth,'Wall HP is finite and legal');
  assert(Number.isFinite(r.doctrineClock)&&r.doctrineClock>=0&&r.doctrineClock<=14,'Auto-cast cooldown never goes negative or creates a free charge');
  if(firstHeld===null&&r.doctrineClock===0&&r.enemies.some(e=>!e.dead)&&!h.doctrineTacticEligible())firstHeld=r.time;
  if(firstCast===null&&r.doctrineCasts>0)firstCast=r.time;
 }
 assert.equal(JSON.stringify({inventory:p.inventory.slice(0,4),runes:p.runes.slice(0,2),sigils:p.sigils,training:p.training,doctrineTactic:p.doctrineTactic}),beginning,
 'Tactics never edit owned items, paid training, finite Sigils or saved choice');
 rows.push({tactic,ability,wave,seed,casts:r.doctrineCasts||0,phase:r.phase,firstCast,firstHeld,seconds:Number(r.time.toFixed(1)),maxActors,maxShots});
}
assert.equal(rows.length,54);
let actualHolds=0,castStarts=0;
for(const x of rows){if(x.firstHeld!==null)actualHolds++;if(x.firstCast!==null)castStarts++;}
assert(actualHolds>0,'At least one real battlefield legitimately holds a ready signature ability');
assert(castStarts>0,'At least one real battlefield produces a signature ability cast');
for(const ability of abilities){
 for(const wave of waves){
  const rapid=rows.filter(x=>x.ability===ability&&x.wave===wave&&x.tactic==='rapid');
  const crisis=rows.filter(x=>x.ability===ability&&x.wave===wave&&x.tactic==='crisis');
  assert.equal(rapid.length,2);assert.equal(crisis.length,2);
  console.log(ability+' W'+wave+': rapid casts '+rapid.map(x=>x.casts).join('/')+
   ', horde '+rows.filter(x=>x.ability===ability&&x.wave===wave&&x.tactic==='horde').map(x=>x.casts).join('/')+
   ', crisis '+crisis.map(x=>x.casts).join('/')+' · early HOLD seen '+crisis.filter(x=>x.firstHeld!==null).length+'/2');
 }
}
console.log('PASS: 54 real game combat slices with three fully automatic modes, honest HOLD vs CAST timings, original mobile caps, intact items/training/sigils and no free cooldown resets.');
console.log('LIMIT: small synthetic level-7 investment fixtures and deterministic battles; not measured player win rates or physical iPhone acceptance.');
