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
assert(game.includes("const locked=saveWriteBlocked||run.phase==='fighting'||run.phase==='intermission'||!verifyPrimaryContinuity();\n return '<section class=\"veteran-pioneer-sweep\""),
 'Pioneer Sweep route controls must mirror the guarded selector continuity check');
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
assert.equal(first.potentialFirstClears,10,'Only ten genuine future victories are previewed, not awarded');
assert(h.renderVeteranPioneerSweep().includes('NO VICTORY IS GUARANTEED.'));
p.unlockedTier=1;p.bestByTier[1]=9998;
assert.equal(h.veteranPioneerSweep().potentialFirstClears,2,'Preview cannot exceed remaining real territory waves');
p.unlockedTier=4;p.bestByTier[1]=30;
assert(h.renderVeteranPioneerSweep().includes('ACTIVE-TIME REQUIREMENT MET'));
assert(h.renderVeteranPioneerSweep().includes('PIONEER SWEEP · CHAPTER XIII'));
assert.equal(JSON.stringify(p),prior,'Guide cannot mutate user save/economy/milestones');
function record(id,tier,earned){
 return {id,reason:'fallen',tier,startWave:1,lastWave:21,cleared:20,
  offenseTracked:true,wavePressureTracked:true,combatSeconds:60,earned:{firstClears:earned}};
}
p.siegeHistory=h.normalizeSiegeHistory([
 record(1,4,0),record(2,4,0),record(3,3,4),record(4,2,1)]);
const after=h.veteranPioneerSweep();
// Zero-duration records cannot establish that the hero actually fought and stalled.
p.siegeHistory=h.normalizeSiegeHistory([
 {...record(9,4,0),combatSeconds:0}, {...record(8,4,0),combatSeconds:0},
 record(3,3,4),record(4,2,1)]);
assert.equal(h.veteranPioneerSweep().tier,4,'No-combat sorties cannot falsely stall a zero-replay route');
assert.equal(h.veteranPioneerSweep().measuredAttempts,0,'No-combat sorties are not measured combat evidence');
p.siegeHistory=h.normalizeSiegeHistory([
 record(1,4,0),record(2,4,0),record(3,3,4),record(4,2,1)]);
// Replay-only sorties that never reach the current record frontier are not failed pushes.
p.bestByTier[4]=30;
p.bestByTier[1]=p.bestByTier[2]=p.bestByTier[3]=10000;
p.siegeHistory=h.normalizeSiegeHistory([record(15,4,0),record(14,4,0),record(3,3,4)]);
assert.equal(h.veteranPioneerSweep().measuredAttempts,0,
 'Replays ending below wave 31 cannot prove that the current record frontier is stalled');
assert.equal(h.veteranPioneerSweep().recordedZero,false,
 'A pair of replay-only sorties cannot be mistaken for two failed record pushes');
p.bestByTier={1:30,2:24,3:20,4:0};
// A victorious sortie cannot establish a failed frontier push, even if its
// imported counters are inconsistent with the earned first-clear ledger.
p.siegeHistory=h.normalizeSiegeHistory([
 {...record(21,4,0),reason:'victory'},record(20,4,0),record(3,3,4)]);
assert.equal(h.veteranPioneerSweep().measuredAttempts,1,
 'A victory must not count as a measured failed frontier push');
assert.equal(h.veteranPioneerSweep().recordedZero,false,
 'A victory paired with one loss cannot prove a two-failure stall');
// An intervening newer unmeasured sortie breaks a consecutive measured-stall claim.
p.siegeHistory=h.normalizeSiegeHistory([
 record(12,4,0), {...record(11,4,0),offenseTracked:false},
 record(10,4,0), record(3,3,4)]);
assert.equal(h.veteranPioneerSweep().tier,4,
 'Old measured failures separated by a newer unmeasured sortie cannot prove two recent stalls');
assert.equal(h.veteranPioneerSweep().measuredAttempts,1,
 'Only the two latest territory sorties may count toward recent stall evidence');
p.siegeHistory=h.normalizeSiegeHistory([
 record(1,4,0),record(2,4,0),record(3,3,4),record(4,2,1)]);
const afterCombat=h.veteranPioneerSweep();
assert.equal(after.tier,3,'Two genuinely measured zero-first-clear sorties skip stalled Tier IV');
assert.equal(after.recordedZero,false);
assert.equal(after.replayWaves,20);
assert.equal(after.otherRoutes.length,2,'Pioneer Sweep exposes two real earned alternatives');
assert(after.otherRoutes.every(x=>x.tier<=p.unlockedTier&&x.tier!==after.tier),
 'Alternative routes must be unlocked, distinct from recommendation');
assert(h.renderVeteranPioneerSweep().includes('TIER IV · NEXT UNCLAIMED 1 · START 1 · 0 REPLAY WAVES'),
 'Alternative territory exposes the earned start and next unclaimed wave, not just replay cost');
assert(h.renderVeteranPioneerSweep().includes('TWO MEASURED STALLS'),
 'Alternative route accurately discloses its own two measured stalls');
assert(!h.renderVeteranPioneerSweep().includes('ALL ROUTES MAY BE STALLED'),
 'A stall on one territory must not be generalized to every available route');
assert(game.includes('aria-disabled="true"'),
 'Pioneer Sweep disabled buttons must expose aria-disabled');
assert(h.renderVeteranPioneerSweep().includes('OTHER EARNED ROUTES'),
 'Players can compare alternative territories without leaving Veteran Watch');
assert(h.renderVeteranPioneerSweep().includes('data-veteran-pioneer="4"'),
 'Existing guarded tier selector is reused for alternate territory');
assert.equal(after.recentAttempts,1);
assert(h.renderVeteranPioneerSweep().includes('NEXT UNCLAIMED WAVE 21'));
assert(h.renderVeteranPioneerSweep().includes('VERIFIED PRESSURE RECORDS 1/2'),'Guide displays real measured sample size');
assert(h.renderVeteranPioneerSweep().includes('INSUFFICIENT MEASURED EVIDENCE'),'One measured sortie cannot establish absence of a stall');
// A selected non-stalled territory must beat an unselected proven stalled one.
p.selectedTier=3;
assert.equal(h.veteranPioneerSweep().replayWaves,20,'Best genuinely earned replay remains shortest');
assert.equal(h.veteranPioneerSweep().tier,3,
 'Do not recommend a measured stalled alternative just to avoid the selected tier');
p.selectedTier=1;
const snapshot=JSON.stringify(p);
h.renderTierLobby();
const container=w.el('milestoneList'); container.scrollTop=131;
const chosen={dataset:{veteranPioneer:'3'},disabled:false};
container.listeners.click({target:{closest(sel){return sel==='[data-veteran-pioneer]'?chosen:null;}}});
assert.equal(p.selectedTier,3,'Real guarded selector picks earned territory');
// An alternative uses the same save-protected selection path, not a bypass.
const alternate={dataset:{veteranPioneer:'4'},disabled:false};
container.listeners.click({target:{closest(sel){return sel==='[data-veteran-pioneer]'?alternate:null;}}});
assert.equal(p.selectedTier,4,'Alternate Pioneer route can be prepared through the guarded selector');
assert.equal(JSON.parse(w.store['primal_knight_onslaught_save_v1']).selectedTier,4,
 'Alternative route selection persists the actual unlocked tier');
assert(h.selectFrontierTier(3),'Restore recommended tier for remaining regression checks');
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
assert.equal(ah.veteranPioneerSweep().tier,1,
 'Shortest legitimately earned replay must beat a longer unselected route, even with legacy unmeasured failures');
assert.equal(ah.veteranPioneerSweep().replayWaves,23,
 'Unmeasured historical failures cannot override the shorter earned replay');
assert(ah.selectFrontierTier(2));
assert.equal(ah.veteranPioneerSweep().tier,1,
 'Legacy unmeasured archive must not be treated as proven repeated zero-clear evidence');
assert.equal(ah.veteranPioneerSweep().recordedZero,false);
assert.equal(ah.veteranPioneerSweep().measuredAttempts,0);
assert(ah.renderVeteranPioneerSweep().includes('VERIFIED PRESSURE RECORDS 0/2'),'Legacy history must not masquerade as measured evidence');
// Route controls must visibly honor the same siege/save guard as the selector.
const routeMarkup=h.renderVeteranClearRoutes();
assert(routeMarkup.includes('data-veteran-clear-route='),'Veteran Watch has territory route buttons');
assert(!routeMarkup.includes('aria-disabled="true"'),'Idle, verified-save routes remain usable');
const sourceContract=game.slice(game.indexOf('function renderVeteranClearRoutes(){'),game.indexOf('function renderVeteranWatchStrategy(){'));
assert(sourceContract.includes("run.phase==='fighting'"),'Active combat disables route buttons');
assert(sourceContract.includes("run.phase==='intermission'"),'Intermission disables route buttons');
assert(sourceContract.includes('saveWriteBlocked'),'Save protection disables route buttons');
assert(sourceContract.includes('selectionLocked?\' disabled aria-disabled="true"'),'Disabled routes disclose their inaccessible state');
assert(!Object.hasOwn(p,'pioneerSweep'),'No new player schema field');
p.firstWatchClaimed=Array.from({length:16},(_,i)=>i);
assert.equal(h.veteranPioneerSweep(),null,'Once actual Watch is fully awarded, hide the guide');
console.log('PASS Alpha 0.15.27: real selected unlocked territory, original save integrity, measured stalled-run evidence, legacy unknowns, mobile touch/scroll, 403m/605-clear guide, no free rewards or hidden progress');
console.log('LIMIT: True Chapter XIII award only verified by original engine in extended earned long-career regression.');
