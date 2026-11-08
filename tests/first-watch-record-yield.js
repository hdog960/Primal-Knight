// Alpha 0.15.24 shell; Alpha 0.15.25 saved-record yield is observational only.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,f){this.listeners[k]=f;}querySelectorAll(){return [];}querySelector(){return null;}
}
function world(seed0=1525){
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
 return {h:box.window.__PK_TEST_TOOLS__,store};
}
assert(html.includes('ALPHA 0.15.24')&&css.includes('.veteran-route-evidence'));
const w=world(),h=w.h,p=h.p();
assert.equal(h.recentVeteranRouteEvidence(2),null,'Only unlocked territories are inspected');
assert.equal(h.recentVeteranRouteEvidence(1).sorties,0);
assert.equal(h.recentVeteranRouteEvidence('1.5'),null);
const record=(id,tier,startWave,lastWave,cleared,firstClears,breaches)=>({
 id,reason:'retreated',tier,startWave,lastWave,cleared,breaches,
 earned:{firstClears}
});
p.unlockedTier=4;p.firstWatchClaimed=Array.from({length:11},(_,i)=>i);
p.battleSeconds=322*60;p.uniqueClears=474;
p.bestByTier={1:40,2:35,3:20,4:0};
p.siegeHistory=h.normalizeSiegeHistory([
 record(1,2,1,26,25,7,1),
 record(2,1,1,41,40,1,2),
 record(3,2,1,28,27,3,0),
 record(4,2,1,23,22,5,4),
 record(5,2,1,22,21,100,99),
 record(6,4,1,1,0,0,0)
]);
const before=JSON.stringify(p);
const q=h.recentVeteranRouteEvidence(2);
assert.equal(q.sorties,3,'Only the three most recent recorded tier entries');
assert.equal(q.firstClears,15,'Never include fourth or older record first clears');
assert.equal(q.breaches,5);
assert.equal(q.lastCleared,25,'Most recent truly cleared wave is not last reached wave');
assert.equal(h.recentVeteranRouteEvidence(4).lastCleared,null);
const route=h.veteranClearRoutes();
assert(route&&route.index===11&&route.waveGate===483&&route.missingClears===9);
assert.equal(route.routes.find(r=>r.tier===2).recent.firstClears,15);
const view=h.renderVeteranClearRoutes();
assert(view.includes('15 ACTUALLY EARNED FIRST CLEARS'));
assert(view.includes('MOST RECENT LAST CLEARED 25'));
assert(route.routes.find(r=>r.tier===4).recent.sorties===1,'A failed run still counts as an archived sortie');
assert(view.includes('LATEST 1 ARCHIVED SORTIE'),'Recorded Tier IV failure must not disappear');
assert(view.includes('NO RECENT SORTIE RECORDED'),'Other unlocked routes with no stored attempts are clearly labeled');
assert.equal(JSON.stringify(p),before,'Read-only Veteran Watch never modifies progress/currency or saves');
const cloned=JSON.parse(JSON.stringify(p.siegeHistory));
p.siegeHistory=[];
assert.equal(h.recentVeteranRouteEvidence(2).sorties,0);
assert(h.renderVeteranClearRoutes().includes('NO RECENT SORTIE RECORDED'));
assert(!Object.hasOwn(p,'routeYield'),'No additional character-save field');
p.siegeHistory=cloned;
const currentP=JSON.stringify(p);
h.renderTierLobby();
assert.equal(JSON.stringify(p),currentP,'No progress mutation from normal Battle screen');
console.log('PASS Alpha 0.15.25: original bounded siege history only, correct last true cleared wave and <=3 recent sorties, no older record contamination, no fake success on failed wave, no currency or save mutation.');
console.log('LIMIT: Historical results are observational; separate genuine earned-career sixteen-session backtracking study controls original unlock and chapter-claim assertions.');
