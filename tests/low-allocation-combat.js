'use strict';
// Alpha 0.14.2 — actual battle render order and reusable combat scratch.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const drawn=[],store=Object.create(null),nodes=new Map();
let gradients=0;
const canvas=new Proxy({
 clearRect(){},drawImage(im){drawn.push(im.src)},
 createLinearGradient(){gradients++;return{addColorStop(){}}}
},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.listeners={};
 this.hidden=id==='worldAtlas';this.disabled=false;this.textContent='';this.innerHTML='';
 this.scrollTop=0;this.width=960;this.height=540;this.className='';
 this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return canvas}
 addEventListener(k,v){this.listeners[k]=v}
 querySelectorAll(){return []}querySelector(){return null}focus(){}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=120;this.naturalHeight=120;}}
const sandbox={Math,Date,Image,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return []},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
 performance:{now(){return 1000}},requestAnimationFrame(){},setTimeout(){return 0},clearTimeout(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(src,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,run=h.run(),p=h.p();
assert(html.includes('ALPHA 0.14.2')&&html.includes('game.js?v=0.14.2'));
function unit(type,y){
 return{type,x:320,y,hp:100000,max:100000,dead:false,armor:0,speed:0,
  wobble:0,burn:0,slow:0,buildup:0,valued:10,ritualClock:20,
  dashClock:0,dashTime:0,fuseTime:0,blinkWindup:0,frostWindup:0,thornWindup:0}
}
const units=[unit('imp',230),unit('goblin',320),unit('skeleton',230),unit('ogre',180),unit('warg',260)];
units[3].dead=true;run.enemies=units;
const pBefore=JSON.stringify(p),before=Array.from(run.enemies);
const render=h.sortedRenderEnemies(),targets=h.sortedTargetEnemies();
assert.deepEqual(Array.from(render).map(e=>e.type),['imp','skeleton','warg','goblin']);
const expected=Array.from(units).filter(e=>!e.dead).sort((a,b)=>h.threatPriority(b)-h.threatPriority(a));
assert.deepEqual(Array.from(targets),expected,'Target priority matches original stable sort');
assert.notStrictEqual(render,targets,'Painter and targeting do not share scratch storage');
for(let n=0;n<500;n++){
 assert.strictEqual(h.sortedRenderEnemies(),render);
 assert.strictEqual(h.sortedTargetEnemies(),targets);
 assert.deepEqual(Array.from(render).map(e=>e.type),['imp','skeleton','warg','goblin']);
}
assert.deepEqual(Array.from(run.enemies),before,'Simulation order cannot be reordered');
for(let n=0;n<40;n++){
 drawn.length=0;h.draw();
 const foes=drawn.filter(x=>['assets/imp.png','assets/skeleton.png','assets/warg.png','assets/goblin.png','assets/ogre.png'].includes(x));
 assert.deepEqual(foes,['assets/imp.png','assets/skeleton.png','assets/warg.png','assets/goblin.png']);
 assert.strictEqual(h.renderScratch(),render);
 assert.equal(render.length,0,'Paint cannot retain dead or old enemy references');
}
assert.equal(gradients,1,'Static battle gradient is reused, not reallocated');
assert.equal(JSON.stringify(p),pBefore,'Painting leaves permanent currency, gear and milestones intact');
assert.deepEqual(Array.from(run.enemies),before);
const gone=units.map(e=>({...e,dead:true}));
assert.equal(h.sortedTargetEnemies(gone).length,0);
assert.equal(h.sortedRenderEnemies(gone).length,0);
run.enemies=[unit('sapper',280),unit('goblin',330),unit('skeleton',240)];
run.enemies[0].fuseTime=1.1;run.phase='fighting';run.speed=1;
run.wave=5;run.tier=1;run.maxHealth=100000;run.health=100000;
run.spawnClock=10;run.spawned=0;run.total=15;run.shotClock=0;run.stationClock=0;
run.shots=[];run.particles=[];run.floats=[];run.encounter={kind:'standard',wave:5};
const prior=Array.from(run.enemies),preferred=Array.from(run.enemies).sort((a,b)=>h.threatPriority(b)-h.threatPriority(a));
assert.equal(preferred[0].type,'sapper');
h.tick(.01);
assert(run.shots.length>=1,'Real battle fires at an enemy');
assert.strictEqual(run.shots[0].target,preferred[0],'Priority selection is unchanged');
assert.deepEqual(Array.from(run.enemies),prior);
assert.strictEqual(h.targetScratch(),targets);
assert.equal(targets.length,0,'Combat clears target references after firing');
assert.equal(h.renderScratch().length,0);
assert.equal(store.primal_knight_onslaught_save_v1,undefined);
console.log('PASS: 500 repeated stable sorts, 40 actual canvas paints in original y order, live sapper target priority, cleared temporary references, no character save mutations.');
console.log('LIMIT: buffer reuse is tested, but physical Safari thermal, FPS and battery improvements are not measured.');
