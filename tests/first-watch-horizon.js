// Alpha 0.15.21: read-only multi-chapter First Watch horizon, genuine first siege and boundary fixtures.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8'),css=fs.readFileSync('style.css','utf8'),html=fs.readFileSync('index.html','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,fn){this.listeners[k]=fn}querySelectorAll(){return []}querySelector(){return null}
}
function world(seed0,source){
 let seed=seed0>>>0;const random=Object.create(Math);random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.assign(Object.create(null),source||{});
 const sandbox={Math:random,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});assert(sandbox.window.__PK_TEST_TOOLS__);
 return {h:sandbox.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.21')&&html.includes('game.js?v=0.15.21')&&html.includes('style.css?v=0.15.21'));
assert(css.includes('.watch-horizon-grid')&&css.includes('@media(max-width:610px){.watch-horizon-grid{grid-template-columns:1fr}'));
assert(css.includes('.watch-horizon summary{')&&css.includes('min-height:44px'));
const w=world(15551),h=w.h,p=h.p();
assert.equal(h.earlyWatchChapters.length,16);
const fresh=h.firstWatchHorizon();
assert.equal(fresh.length,3);
assert.equal(fresh[0].index,0);assert.equal(fresh[0].name,'First Blood');
assert.equal(fresh[0].minutes,2);assert.equal(fresh[0].waveGate,3);
assert.equal(fresh[0].timeRemainingSeconds,120);assert.equal(fresh[0].waveRemaining,3);
assert.equal(fresh[1].name,'The First Standard');
assert.equal(fresh[1].waveGate,11);
assert.equal(fresh[2].minutes,13);assert.equal(fresh[2].waveGate,20);
const original=JSON.stringify(p);assert(!Object.hasOwn(p,'firstWatchHorizon'));
assert(h.renderFirstWatchHorizon().includes('THREE-CHAPTER HORIZON'));
h.renderTierLobby();assert(w.el('milestoneList').innerHTML.includes('watch-horizon'));
assert.equal(JSON.stringify(p),original,'Read-only forecast never mutates permanent character or rewards');
assert.equal(h.firstWatchHorizon(1).length,1);
const begin=p.battleSeconds;
assert.equal(h.enterSiege(),true,'Actual natural opening siege');
let ticks=0;
while(h.run().phase!=='fallen'&&ticks<30000){h.tick(.05);ticks++;}
assert(ticks<30000,'Natural no-spend starter eventually falls in real engine');
assert(p.battleSeconds>=120&&p.battleSeconds>begin,'Two real active minutes elapsed, no fake time');
assert(p.uniqueClears>=3,'At least three actual first-cleared waves');
assert(p.firstWatchClaimed.includes(0),'First Blood truly earned through both gates');
assert.equal(new Set(p.firstWatchClaimed).size,p.firstWatchClaimed.length,'Reward earned only once');
assert.equal(h.firstWatchHorizon()[0].index,1,'Horizon advances only after real chapter claim');
assert.equal(h.firstWatchHorizon()[0].name,'The First Standard');
assert(h.firstWatchHorizon()[0].waveGate===11);
assert(h.save());
const saved=JSON.parse(w.store[SAVE]);
assert.equal(saved.battleSeconds,p.battleSeconds);
assert.equal(saved.uniqueClears,p.uniqueClears);
assert.deepEqual(saved.firstWatchClaimed,Array.from(p.firstWatchClaimed));
assert(!Object.hasOwn(saved,'firstWatchHorizon'),'No saved forecast state');
const restored=world(15552,w.store);
assert.equal(restored.h.firstWatchHorizon()[0].index,1,'Real earned next chapter survives reload');
assert.equal(restored.h.p().sigils,p.sigils,'No phantom finite Sigils');
assert.equal(restored.h.p().gold,p.gold,'No reward replay on reload');
assert.equal(restored.h.p().essence,p.essence);
// Independent synthetic boundary fixtures: these are NOT earned 750-minute simulations.
const fixture=world(15553),f=fixture.h.p();
f.firstWatchClaimed=[0];f.battleSeconds=7*60;f.uniqueClears=3;
let row=fixture.h.firstWatchHorizon()[0];
assert.equal(row.name,'The First Standard');assert.equal(row.timeRemainingSeconds,0);
assert.equal(row.timeReady,true);assert.equal(row.waveReady,undefined);
assert.equal(row.wavesReady,false);assert.equal(row.waveRemaining,8);
assert(fixture.h.renderFirstWatchHorizon().includes('✓ TIME MET'));
assert(fixture.h.renderFirstWatchHorizon().includes('8 FIRST CLEARS NEEDED'));
f.battleSeconds=6*60+1;f.uniqueClears=11;
row=fixture.h.firstWatchHorizon()[0];
assert.equal(row.timeRemainingSeconds,59);assert.equal(row.waveRemaining,0);
assert.equal(row.wavesReady,true);assert.equal(row.timeReady,false);
assert(fixture.h.renderFirstWatchHorizon().includes('1 MIN STILL NEEDED'));
f.firstWatchClaimed=Array.from({length:16},(_,i)=>i);
assert.equal(fixture.h.firstWatchHorizon().length,0);
assert.equal(fixture.h.renderFirstWatchHorizon(),'','Completed First Watch has no redundant guide');
console.log('FIRST WATCH HORIZON NATURAL STARTER: '+JSON.stringify({seed:15551,ticks,realActiveMinutes:+(p.battleSeconds/60).toFixed(2),firstClears:p.uniqueClears,chapters:p.firstWatchClaimed.length}));
console.log('PASS Alpha 0.15.21: honest next-three separate time/clear gates, natural earned first chapter, actual save/reload and fixture-only boundary cases');
console.log('LIMIT: one natural starter siege plus synthetic boundary fixtures; no assertion of full 750-minute player experience or physical iPhone approval.');
