// Alpha 0.15.28 — native Pioneer routebook with three genuinely unlocked options.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,f){this.listeners[k]=f;}querySelectorAll(){return [];}querySelector(){return null;}
}
function world(seed0=1528){
 let seed=seed0>>>0,rand=Object.create(Math);
 rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
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
assert(html.includes('ALPHA 0.15.28'));
assert(css.includes('.veteran-pioneer-alternatives button{'));
assert(css.includes('@media(max-width:700px){.veteran-pioneer-alternatives{grid-template-columns:1fr}}'));
const w=world(),h=w.h,p=h.p();
assert.equal(h.veteranPioneerRoutes().length,0,'Novice cannot see Veteran Watch targets');
p.unlockedTier=5;p.firstWatchClaimed=Array.from({length:12},(_,i)=>i);
p.uniqueClears=565;p.battleSeconds=403*60;
p.bestByTier={1:44,2:36,3:28,4:18,5:0};
const mk=(id,tier,gain)=>({id,reason:'retreated',tier,startWave:1,lastWave:26,
 cleared:25,offenseTracked:true,wavePressureTracked:true,earned:{firstClears:gain}});
p.siegeHistory=h.normalizeSiegeHistory([
 mk(1,2,8),mk(2,2,5),mk(3,1,2),mk(4,3,1),mk(5,2,1)]);
const original=JSON.stringify(p),routes=h.veteranPioneerRoutes();
assert.equal(routes.length,3);
assert.deepEqual(Array.from(routes.map(r=>r.kind)),['SHORT REPLAY','FRESH GROUND','RECENT MOMENTUM']);
assert.deepEqual(Array.from(routes.map(r=>r.tier)),[5,4,2]);
assert.equal(routes[2].recent.firstClears,14);
assert(new Set(routes.map(r=>r.tier)).size===3);
assert(routes.every(r=>r.tier<=p.unlockedTier&&r.nextWave===r.best+1));
assert.equal(JSON.stringify(p),original,'Read-only routebook never grants rewards or mutates character');
assert(h.renderVeteranPioneerSweep().includes('FRESH GROUND'));
assert(h.renderVeteranPioneerSweep().includes('RECENT MOMENTUM'));
assert(h.renderVeteranPioneerSweep().includes('14 ACTUAL RECENT FIRST CLEARS'));
h.renderTierLobby();
const list=w.el('milestoneList');list.scrollTop=143;
const option={disabled:false,dataset:{veteranPioneer:'2'}};
list.listeners.click({target:{closest(selector){return selector==='[data-veteran-pioneer]'?option:null;}}});
assert.equal(p.selectedTier,2,'Alternate picks use the original guarded real-game saved tier selector');
assert.equal(JSON.parse(w.store['primal_knight_onslaught_save_v1']).selectedTier,2);
assert.equal(list.scrollTop,143,'One-tap action preserves mobile lobby scrolling');
assert.equal(p.uniqueClears,565,'No new first clears from route selection');
assert.equal(h.selectFrontierTier(6),false,'Locked territory still impossible to choose');
assert(!Object.hasOwn(p,'pioneerRoutebook'),'No new saved player fields');
const w2=world(1529),z=w2.h,j=z.p();
j.firstWatchClaimed=Array.from({length:12},(_,i)=>i);
j.unlockedTier=1;j.uniqueClears=565;j.bestByTier={1:25};
assert.equal(z.veteranPioneerRoutes().length,1,'A character with one unlocked tier sees only real choices');
j.firstWatchClaimed=Array.from({length:16},(_,i)=>i);
assert.equal(z.veteranPioneerRoutes().length,0,'Completed Watch hides the late-game guide');
console.log('PASS Alpha 0.15.28: unique three-way original-game route choices, historical first clears, earned-tier/waystone guards, iPhone scrolling, save persistence and no unearned rewards');
console.log('LIMIT: The original-engine earned 12-siege routebook continuation separately reports actual Chapter XIII progress.');
