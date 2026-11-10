// Alpha 0.15.27 source shell; Alpha 0.15.27 original-engine Pioneer Sweep guard.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,f){this.listeners[k]=f;}querySelectorAll(){return [];}querySelector(){return null;}
}
function world(seed0=1527,source=null){
 let seed=seed0>>>0,rand=Object.create(Math);
 rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.assign(Object.create(null),source||{});
 const box={Math:rand,Date,Image,Blob,console,confirm(){return true;},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{hidden:false,getElementById:el,querySelectorAll(){return[];},addEventListener(){}},
 localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,box,{filename:'game.js'});
 assert(box.window.__PK_TEST_TOOLS__);
 return {h:box.window.__PK_TEST_TOOLS__,el,store};
}
assert(html.includes('ALPHA 0.15.27')&&css.includes('.veteran-pioneer-sweep>button{'));
assert(css.includes('min-height:48px'));
const w=world(),h=w.h,p=h.p();
assert.equal(h.veteranPioneerSweep(),null,'Novice without qualifying Watch cannot see late-game guide');
p.firstWatchClaimed=Array.from({length:12},(_,i)=>i);
p.battleSeconds=403*60;p.uniqueClears=506;p.unlockedTier=4;
p.bestByTier={1:30,2:24,3:20,4:0};
const prior=JSON.stringify(p),first=h.veteranPioneerSweep();
assert(first&&first.tier===4,'Untried route has zero historical replay distance');
assert.equal(first.startWave,1);assert.equal(first.replayWaves,0);
assert.equal(first.nextWave,1);assert.equal(first.remaining,99);
assert.equal(first.secondsLeft,0,'Earned Chapter XIII time gate is met');
assert(h.renderVeteranPioneerSweep().includes('ACTIVE-TIME REQUIREMENT MET'));
assert(h.renderVeteranPioneerSweep().includes('PIONEER SWEEP · CHAPTER XIII'));
assert.equal(JSON.stringify(p),prior,'Guide cannot mutate user save/economy/milestones');
function record(id,tier,earned){
 return {id,reason:'fallen',tier,startWave:1,lastWave:21,cleared:20,
  offenseTracked:true,wavePressureTracked:true,earned:{firstClears:earned}};
}
p.siegeHistory=h.normalizeSiegeHistory([
 record(1,4,0),record(2,4,0),record(3,3,4),record(4,2,1)]);
const after=h.veteranPioneerSweep();
assert.equal(after.tier,3,'Two genuinely measured zero-first-clear sorties skip stalled Tier IV');
assert.equal(after.recordedZero,false);
assert.equal(after.replayWaves,20);
assert.equal(after.recentAttempts,1);
assert(h.renderVeteranPioneerSweep().includes('NEXT UNCLAIMED WAVE 21'));
assert(h.renderVeteranPioneerSweep().includes('VERIFIED PRESSURE RECORDS 1/2'),'Guide displays real measured sample size');
assert(h.renderVeteranPioneerSweep().includes('INSUFFICIENT MEASURED EVIDENCE'),'One measured sortie cannot establish absence of a stall');
// A selected non-stalled territory must beat an unselected proven stalled one.
p.selectedTier=3;
assert.equal(h.veteranPioneerSweep().tier,3,
 'Do not recommend a measured stalled alternative just to avoid the selected tier');
p.selectedTier=1;
const snapshot=JSON.stringify(p);
h.renderTierLobby();
const container=w.el('milestoneList'); container.scrollTop=131;
const chosen={dataset:{veteranPioneer:'3'},disabled:false};
container.listeners.click({target:{closest(sel){return sel==='[data-veteran-pioneer]'?chosen:null;}}});
assert.equal(p.selectedTier,3,'Real guarded selector picks earned territory');
assert.equal(container.scrollTop,131,'Preserves mobile scroll');
assert.equal(JSON.parse(w.store['primal_knight_onslaught_save_v1']).selectedTier,3);
assert.equal(p.uniqueClears,506);assert.equal(p.gold,JSON.parse(snapshot).gold);
assert.equal(h.selectFrontierTier(5),false,'Locked realm cannot be reached via Pioneer Sweep');
const absent=world(1528),ah=absent.h,ap=ah.p();
ap.firstWatchClaimed=Array.from({length:11},(_,i)=>i);ap.unlockedTier=2;
ap.uniqueClears=450;ap.battleSeconds=0;ap.bestByTier={1:23,2:25};
assert(ah.veteranPioneerSweep().secondsLeft>0);
assert(ah.renderVeteranPioneerSweep().includes('ACTIVE MINUTES STILL NEEDED'));
ap.siegeHistory=ah.normalizeSiegeHistory([
 {id:1,reason:'fallen',tier:1,startWave:1,lastWave:24,cleared:23,earned:{firstClears:0}},
 {id:2,reason:'fallen',tier:1,startWave:1,lastWave:24,cleared:23,earned:{firstClears:0}}
]);
assert.equal(ah.veteranPioneerSweep().tier,2,
 'Guide suggests the other unlocked route instead of its already-selected territory');
assert(ah.selectFrontierTier(2));
assert.equal(ah.veteranPioneerSweep().tier,1,
 'Legacy unmeasured archive must not be treated as proven repeated zero-clear evidence');
assert.equal(ah.veteranPioneerSweep().recordedZero,false);
assert.equal(ah.veteranPioneerSweep().measuredAttempts,0);
assert(ah.renderVeteranPioneerSweep().includes('VERIFIED PRESSURE RECORDS 0/2'),'Legacy history must not masquerade as measured evidence');
assert(!Object.hasOwn(p,'pioneerSweep'),'No new player schema field');
p.firstWatchClaimed=Array.from({length:16},(_,i)=>i);
assert.equal(h.veteranPioneerSweep(),null,'Once actual Watch is fully awarded, hide the guide');
console.log('PASS Alpha 0.15.27: real selected unlocked territory, original save integrity, measured stalled-run evidence, legacy unknowns, mobile touch/scroll, 403m/605-clear guide, no free rewards or hidden progress');
console.log('LIMIT: True Chapter XIII award only verified by original engine in extended earned long-career regression.');
