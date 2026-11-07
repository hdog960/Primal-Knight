// Alpha 0.15.7 — precise long-siege hotpath equivalence and fixed trail lifecycle.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const nodes=new Map(),saved=Object.create(null);
class Element {
 constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.textContent='';this.innerHTML='';this.scrollTop=0;this.width=960;this.height=540;this.hidden=false;this.disabled=false;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(name,fn){this.listeners[name]=fn;}querySelectorAll(){return [];}querySelector(){return null;}
}
const el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return saved[k]??null;},setItem(k,v){saved[k]=String(v);},removeItem(k){delete saved[k];}},
 setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},performance:{now(){return 1000;}},URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(source,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,run=h.run(),p=h.p();
const baseline=JSON.stringify(p);
const casterTypes=['shaman','frostbinder','thornweaver'];
const cappedTypes=['shaman','frostbinder','sapper','banneret','thornweaver','riftstalker'];
const allTypes=['goblin','skeleton','warg','raider','guardian','shaman','frostbinder','sapper','banneret','thornweaver','riftstalker'];
const previousSpecialist=(type,units)=>{
 if(casterTypes.includes(type)&&units.filter(u=>!u.dead&&casterTypes.includes(u.type)).length>=3)return 'skeleton';
 if(cappedTypes.includes(type)&&units.filter(u=>!u.dead&&u.type===type).length>=2)return 'skeleton';
 return type;
};
let seed=1234567;function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
for(let attempt=0;attempt<350;attempt++){
 const units=Array.from({length:24},()=>({type:allTypes[Math.floor(random()*allTypes.length)],dead:random()<.25}));
 for(const type of allTypes)assert.equal(h.allowedSpecialist(type,units),previousSpecialist(type,units),'Existing specialist safety caps remain exact');
}
function unit(x,y,hp=100,max=100,extra={}){return{x,y,hp,max,dead:false,type:'goblin',...extra};}
const caster=unit(450,220,100,100,{type:'shaman'});
function referenceRitual(c,units){
 const order=units.filter(u=>u&&!u.dead&&u!==c&&Math.abs(u.y-c.y)<130&&u.hp<u.max)
  .sort((a,b)=>a.hp/a.max-b.hp/b.max).slice(0,2);
 for(const u of order)u.hp=Math.min(u.max,u.hp+u.max*.06);
 return order.length;
}
for(let attempt=0;attempt<240;attempt++){
 const data=[caster], expected=[{...caster}];
 for(let j=0;j<18;j++){
  const y=100+Math.floor(random()*260),health=[10,25,40,50,75,100][Math.floor(random()*6)];
  const extra={dead:random()<.2,type:j%2?'guardian':'goblin'};
  data.push(unit(100+j*18,y,health,100,extra));
  expected.push(unit(100+j*18,y,health,100,extra));
 }
 const expectedNum=referenceRitual(expected[0],expected);
 const actualNum=h.healShamanAllies(data[0],data);
 assert.equal(actualNum,expectedNum,'Ritual recipient count matches original stable sorted results');
 assert.deepEqual(data.map(u=>u.hp),expected.map(u=>u.hp),'Ritual heals the exact original two allies for exact amounts');
}
const ties=[caster,unit(220,215,20,100),unit(300,215,20,100),unit(390,215,20,100)];
assert.equal(h.healShamanAllies(caster,ties),2,'Both equally injured first allies are eligible');
assert.equal(ties[1].hp,26);assert.equal(ties[2].hp,26);
assert.equal(ties[3].hp,20,'Third equally injured ally retains stable unhealed order');
assert.equal(h.healShamanAllies(caster,[caster]),0,'No allies yields no ritual heal');

const origin=unit(400,210),a=unit(405,210),b=unit(395,210),c=unit(405,215),dead=unit(401,210,100,100,{dead:true});
assert.strictEqual(h.nearestShockTarget(origin,[origin,dead,a,b,c]),a,'Nearest equal-distance ties retain insertion order');
assert.equal(h.nearestShockTarget(origin,[origin,dead]),null,'Dead/self never chain');
for(let attempt=0;attempt<350;attempt++){
 const units=[origin];
 for(let j=0;j<24;j++)units.push(unit(100+Math.floor(random()*650),100+Math.floor(random()*240),100,100,{dead:random()<.25}));
 const expected=units.filter(u=>u!==origin&&!u.dead).sort((x,y)=>Math.hypot(x.x-origin.x,x.y-origin.y)-Math.hypot(y.x-origin.x,y.y-origin.y))[0]||null;
 assert.strictEqual(h.nearestShockTarget(origin,units),expected,'Chain target matches the original nearest-distance stable sort');
}
run.shots=[];run.flashes=0;
const target=unit(760,110);
h.shoot(target,20,'arrow',496,390);
assert.equal(run.shots.length,1,'Real shooter still launches a projectile');
const shot=run.shots[0],trail=shot.trail;
assert(ArrayBuffer.isView(trail)&&Object.prototype.toString.call(trail)==='[object Float32Array]'&&trail.length===14,'Projectile allocates exactly seven coordinate pairs once');
assert.equal(shot.trailCount,0);assert.equal(shot.trailHead,0);
const originalHistory=[];
for(let k=0;k<400;k++){
 shot.x=200+k*.25;shot.y=280+k*.125;
 originalHistory.push([shot.x,shot.y]);if(originalHistory.length>7)originalHistory.shift();
 h.recordShotTrail(shot);
 assert.strictEqual(shot.trail,trail,'Repeated frames retain the same coordinate storage');
 assert.equal(shot.trailCount,Math.min(k+1,7),'History length remains limited to seven');
 const t=shot.trailHead*2;
 assert.equal(shot.trail[t],Math.fround(originalHistory[0][0]),'Oldest X matches seven-point scrolling trail');
 assert.equal(shot.trail[t+1],Math.fround(originalHistory[0][1]),'Oldest Y matches seven-point scrolling trail');
}
for(let k=1;k<48;k++)h.shoot(target,20);
assert.equal(run.shots.length,48,'Existing 48-projectile cap unchanged');
h.shoot(target,20);assert.equal(run.shots.length,48,'Excess projectile cannot exceed old cap');
assert.equal(JSON.stringify(p),baseline,'Hotpath tests never mutate permanent currency or saved progression');
assert.equal(saved.primal_knight_onslaught_save_v1,undefined,'Hotpath tests do not write saves');
assert(!source.includes('s.trail.push([s.x,s.y])'),'Per-frame projectile pair allocations removed');
assert(html.includes('ALPHA 0.15.7')&&html.includes('game.js?v=0.15.7')&&html.includes('style.css?v=0.15.7'),'Safari asset versions match the new release');
console.log('PASS: 3,850 specialist choices vs legacy, 240 stable shaman rituals, 350 chain-target comparisons, 400 ring-trail updates and 48-shot cap; no permanent save changes.');
console.log('LIMIT: reduced allocations are source/logic verified, not a measured iPhone FPS, battery or temperature result.');
