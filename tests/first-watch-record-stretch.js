// Alpha 0.15.24 baseline; Alpha 0.15.24 checkpoint-aware veteran clear guidance.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,f){this.listeners[k]=f;}querySelectorAll(){return [];}querySelector(){return null;}
}
function world(seed0=1524){
 let seed=seed0>>>0,rand=Object.create(Math);rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null);
 const box={Math:rand,Date,Image,Blob,console,confirm(){return true;},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{hidden:false,getElementById:el,querySelectorAll(){return[];},addEventListener(){}},
 localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(game,box,{filename:'game.js'});
 assert(box.window.__PK_TEST_TOOLS__);
 return {h:box.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.24')&&css.includes('.veteran-route-grid'));
const w=world(),h=w.h,p=h.p();
assert.equal(h.veteranClearRoutes(),null,'No novice route override');
p.firstWatchClaimed=Array.from({length:11},(_,i)=>i);
p.battleSeconds=322*60;p.uniqueClears=425;p.unlockedTier=17;
p.bestByTier={1:33,2:44,3:0,4:10000,5:20,17:24};
const before=JSON.stringify(p),q=h.veteranClearRoutes();
assert(q&&q.index===11&&q.waveGate===483&&q.missingClears===58);
assert.equal(q.routes.length,4);
assert.deepEqual(Array.from(q.routes.map(row=>row.tier)),[3,6,7,8],
 'Untried lower unlocked territories outrank huge replay routes');
assert(q.routes.every(row=>row.tier<=17&&row.startWave===1&&row.replayWaves===0));
assert(q.routes.every(row=>row.potential===10));
assert(h.renderVeteranClearRoutes().includes('UNTRIED · BEGIN WAVE 1'));
assert.equal(JSON.stringify(p),before,'Read-only route inspection changes no character data');
const z=world(1525),f=z.h,fp=f.p();
fp.firstWatchClaimed=Array.from({length:9},(_,i)=>i);
fp.unlockedTier=3;fp.uniqueClears=222;fp.bestByTier={1:105,2:26,3:10000};
fp.milestones['1:100']=true; // Clearly synthetic earned-waystone fixture
const routes=f.veteranClearRoutes().routes;
assert.deepEqual(Array.from(routes.map(row=>row.tier)),[1,2]);
assert.equal(routes[0].startWave,100,'Only a recorded earned waystone permits short record replays');
assert.equal(routes[0].replayWaves,6);
assert.equal(routes[1].replayWaves,26);
assert.equal(f.renderVeteranClearRoutes().includes('START WAVE 100 · 6 ALREADY CLEARED WAVES TO REPLAY'),true);
assert.equal(fp.uniqueClears,222);
fp.milestones['1:100']=false;
assert.equal(f.veteranClearRoutes().routes[0].tier,2,'Without real waystone award the shortcut disappears');
assert.equal(f.veteranClearRoutes().routes.find(row=>row.tier===1).startWave,1);
assert.equal(f.veteranClearRoutes().routes.find(row=>row.tier===1).replayWaves,105);
assert.equal(f.selectFrontierTier(4),false,'Never allow a locked tier through any guide');
assert(!Object.hasOwn(fp,'recordStretch'),'No new character schema field');
console.log('PASS Alpha 0.15.24: waystone-aware existing Veteran Watch routes, old record replay distance, both chapter gates preserved, no phantom checkpoints or free rewards; full original-engine earned continuation lives in first-watch-siege-pressure');
