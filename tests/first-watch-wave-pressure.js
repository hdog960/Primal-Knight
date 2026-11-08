// Alpha 0.15.19 — real per-wave pre-heal siege diagnostics, bounded history, no progression grants.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,f){this.listeners[k]=f}
 querySelectorAll(){return []}
 querySelector(){return null}
}
function world(seed0=1519,source){
 let seed=seed0>>>0,rand=Object.create(Math);
 rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.assign(Object.create(null),source||{});
 const box={Math:rand,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,box,{filename:'game.js'});
 assert(box.window.__PK_TEST_TOOLS__,'Original test instrumentation must remain enabled');
 return {h:box.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.19')&&html.includes('game.js?v=0.15.19')&&html.includes('style.css?v=0.15.19'),'Versioned iPhone assets');
assert(css.includes('.wave-pressure-ledger')&&css.includes('@media(max-width:760px){.wave-pressure-grid{grid-template-columns:1fr}}'));
const empty=world(151901);
assert.equal(empty.h.wavePressureLedger(1),null,'No invented evidence before actual wave');
assert.equal(empty.h.renderWavePressureLedger(1),'');
assert.equal(empty.h.wavePressureLedger(2),null,'Never show locked territory');
const legacy=empty.h.normalizeSiegeHistory([{
 reason:'fallen',tier:1,startWave:1,lastWave:2,cleared:1,enemies:8,
 wallPressureTracked:true,offenseTracked:true
}])[0];
assert.equal(legacy.wavePressureTracked,false);
assert.equal(legacy.wavePressureSamples.length,0);
empty.h.p().siegeHistory=[legacy];
assert.equal(empty.h.renderWavePressureLedger(1),'','No counterfeit old recordings');
const broken=empty.h.normalizeSiegeHistory([{
 reason:'fallen',tier:1,startWave:1,lastWave:4,cleared:3,enemies:5,
 wavePressureTracked:true,wavePressureSamples:[
  {wave:1,outcome:'cleared',projectilesFired:3,projectilesLanded:999,nearWallKills:90,enemiesDefeated:2,wallHpStart:999,wallHpEnd:600,wallMaxStart:200,wallBreachDamage:Infinity},
  {wave:1,outcome:'fallen',projectilesFired:10},
  {wave:10000,outcome:'fallen'},
  {wave:2,outcome:'impossible'},
  {wave:3,outcome:'fallen',combatSeconds:-22}
 ]
}])[0];
assert(broken.wavePressureTracked);
assert.equal(broken.wavePressureSamples.length,2);
assert.equal(broken.wavePressureSamples[0].wave,1);
assert.equal(broken.wavePressureSamples[0].projectilesLanded,3);
assert.equal(broken.wavePressureSamples[0].nearWallKills,2);
assert.equal(broken.wavePressureSamples[0].wallHpStart,200);
assert.equal(broken.wavePressureSamples[0].wallHpEnd,200);
assert.equal(broken.wavePressureSamples[0].wallBreachDamage,0);
assert.equal(broken.wavePressureSamples[1].wave,3);
assert.equal(broken.wavePressureSamples[1].combatSeconds,0);
const records=[];
for(const seed of [15411,15423]){
 const w=world(seed),h=w.h,p=h.p(),r=h.run();
 const before=p.essence;
 assert(h.purchaseCouncilTraining('power'),'Actual original-price Might purchase');
 assert(p.essence<before);
 assert(h.save());
 assert(h.enterSiege(),'Original game engine enters actual siege');
 const waveAtStart=r.wave;
 assert.equal(r.wavePressureStart.wave,waveAtStart);
 let ticks=0;
 while(r.phase!=='fallen'&&r.phase!=='completed'&&r.wavesCleared<8&&ticks<95000){
  h.tick(.05);ticks++;
  assert(r.enemies.length<=24&&r.shots.length<=48,'Original mobile actor limits');
 }
 assert(ticks<95000&&r.wavesCleared>=6,'Earned multi-wave real siege');
 if(r.phase!=='fallen'&&r.phase!=='completed')h.retreatFromSiege();
 const report=h.siegeReport();
 assert(report.wavePressureTracked===true);
 assert(report.wavePressureSamples.length>0&&report.wavePressureSamples.length<=6,'Bounded last-six-wave memory');
 const arr=report.wavePressureSamples;
 for(let i=0;i<arr.length;i++){
  const q=arr[i];
  if(i>0)assert(q.wave>arr[i-1].wave,'Chronological wave samples only');
  assert(q.wave>=report.startWave&&q.wave<=report.lastWave);
  assert(q.projectilesLanded<=q.projectilesFired,'Projectile conservation');
  assert(q.nearWallKills<=q.enemiesDefeated,'Measured near-wall kills');
  assert(q.wallHpEnd<=q.wallMaxStart&&q.wallHpStart<=q.wallMaxStart);
  assert(q.wallBreachDamage>=0&&q.wallSabotageDamage>=0);
  if(i<arr.length-1)assert.equal(q.outcome,'cleared','Earlier actually completed waves remain cleared');
 }
 assert.equal(arr[arr.length-1].outcome,report.reason==='retreated'?'cleared':report.reason==='fallen'?'fallen':'cleared');
 assert(p.siegeHistory[0].wavePressureTracked===true);
 assert.equal(p.siegeHistory[0].wavePressureSamples.length,arr.length);
 assert(h.wavePressureLedger(1)?.samples.length===arr.length,'Real selected territory shown');
 const beforeRender=JSON.stringify(p);
 assert(h.renderWavePressureLedger(1).includes('WAVE PRESSURE · TIER I'));
 assert(h.renderWavePressureLedger(1).includes('WALL HP LOST · BREACH / SAPPER'));
 h.renderTierLobby();
 assert(w.el('milestoneList').innerHTML.includes('WAVE PRESSURE'),'Battle UI shows measured wave panel');
 assert.equal(JSON.stringify(p),beforeRender,'Read-only analysis cannot alter earned resources');
 assert(h.save());
 const saved=JSON.parse(w.store[SAVE]);
 assert.equal(saved.siegeHistory[0].wavePressureSamples.length,arr.length);
 assert(!Object.hasOwn(saved,'wavePressureSamples'),'New evidence belongs only in bounded siege archive');
 const again=world(seed,{[SAVE]:w.store[SAVE]});
 assert(again.h.wavePressureLedger(1),'Original character reload keeps the bounded archive');
 assert.equal(again.h.p().uniqueClears,p.uniqueClears);
 assert.equal(again.h.p().sigils,p.sigils);
 assert(again.h.wavePressureLedger(2)===null);
 records.push({seed,legitimateClears:r.wavesCleared,measuredWaves:arr.length,
  finalWave:arr.at(-1).wave,finalOutcome:arr.at(-1).outcome,
  totalBreaches:report.breaches,wallHpLost:report.wallBreachDamage});
}
// Explicit synthetic finish-and-cancel fixture (not earned progression).
const cancel=world(151902),hc=cancel.h,rc=hc.run();
assert(hc.enterSiege());
for(let i=0;i<18;i++)hc.tick(.05);
assert.equal(rc.wavePressureSamples.length,0);
hc.retreatFromSiege();
assert.equal(rc.wavePressureSamples.length,1);
assert.equal(rc.wavePressureSamples[0].outcome,'retreated');
assert.equal(hc.p().siegeHistory[0].wavePressureSamples[0].outcome,'retreated');
assert.equal(rc.wavePressureStart,null);
assert.equal(hc.captureWavePressure('retreated'),false,'No duplicate unfinished wave');
console.log('ALPHA 0.15.19 ACTUAL WAVE RECORDS '+JSON.stringify(records));
console.log('PASS Alpha 0.15.19: authentic earned before-heal individual wave accounting, original paid Training, bounded 6-wave archive, strict legacy and invalid-input handling, real save/reload, single unfinished-wave capture, responsive player-visible wave review, unchanged first-clear and Sigil constraints');
