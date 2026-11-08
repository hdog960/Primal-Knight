// Alpha 0.15.23 — offensive tempo telemetry and legitimately earned original-engine comparison.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){
  this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;
  this.disabled=false;this.innerHTML='';this.textContent='';this.className='';
  this.scrollTop=0;this.width=960;this.height=540;
  this.classList={add(){},remove(){},toggle(){}};
 }
 getContext(){
  return new Proxy({createLinearGradient(){return {addColorStop(){}}}},
   {get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});
 }
 addEventListener(k,fn){this.listeners[k]=fn;}
 querySelectorAll(){return [];}
 querySelector(){return null;}
}
function world(seed0=1516,source){
 let seed=seed0>>>0;
 const math=Object.create(Math);
 math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.assign(Object.create(null),source||{});
 const sandbox={Math:math,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null;},
    setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},
  requestAnimationFrame(){},URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});
 assert(sandbox.window.__PK_TEST_TOOLS__);
 return {h:sandbox.window.__PK_TEST_TOOLS__,el,store};
}
assert(html.includes('ALPHA 0.15.23')&&html.includes('game.js?v=0.15.23')&&html.includes('style.css?v=0.15.23'),
 'Production shell and assets must be version synchronized');
const legacy=world();
const old=legacy.h.normalizeSiegeHistory([{
 id:1,finishedAt:1,reason:'fallen',tier:1,startWave:1,lastWave:3,
 cleared:2,enemies:12,breaches:4,wallPressureTracked:true,
 wallBreachDamage:123,wallSabotageDamage:4
}])[0];
assert(old.wallPressureTracked&&!old.offenseTracked);
assert(!legacy.h.renderSiegeHistory().includes('OFFENSIVE TEMPO'));
const forged=legacy.h.normalizeSiegeHistory([{
 id:2,reason:'fallen',tier:1,startWave:1,lastWave:4,cleared:3,enemies:5,
 offenseTracked:true,projectilesFired:4,projectilesLanded:900,
 projectilesLost:900,lastLineKills:999,directHitHpRemoved:-9,
 combatSeconds:Infinity
}])[0];
assert.equal(forged.projectilesFired,4);
assert.equal(forged.projectilesLanded,4);
assert.equal(forged.projectilesLost,0);
assert.equal(forged.lastLineKills,5);
assert.equal(forged.directHitHpRemoved,0);
assert.equal(forged.combatSeconds,0);
const results=[];
for(const seed of [15411,15423]){
 for(const policy of ['might','fortitude']){
  const w=world(seed),h=w.h,p=h.p(),r=h.run();
  const initialEssence=p.essence;
  const target=policy==='might'?'power':'fort';
  let bought=0;
  while(bought<6&&h.purchaseCouncilTraining(target))bought++;
  const actualSpend=initialEssence-p.essence;
  assert(bought>0&&actualSpend>0&&p.essence>=0,'All purchases spend real initial Essence');
  assert.equal(p.unlockedTier,1,'Opening cohort does not inherit a cheated frontier');
  assert(h.save(),'Pre-siege purchased build is stored under the original character key');
  assert(h.enterSiege(),'Normal Tier I siege must launch');
  let ticks=0;
  while(r.phase!=='fallen'&&r.phase!=='completed'&&r.wavesCleared<6&&ticks<70000){
   h.tick(.05);ticks++;
   assert(r.enemies.length<=24,'Original enemy cap must hold');
   assert(r.shots.length<=48,'Original projectile cap must hold');
  }
  assert(ticks<70000,'Combat must progress to a real outcome');
  assert(r.projectilesFired>0&&r.projectilesLanded>0,'Original combat fired and landed real shots');
  assert(r.directHitHpRemoved>0,'Direct HP removed is measured after armor and target HP');
  assert(r.combatSeconds>0&&r.lastLineKills>=0,'Real fight time and last line kills are recorded');
  assert(r.projectilesLanded+r.projectilesLost<=r.projectilesFired,'No projectile counted twice');
  assert(r.wavesCleared>=1,'The opening character must honestly clear at least one wave');
  if(r.phase!=='fallen'&&r.phase!=='completed')h.retreatFromSiege();
  const report=h.siegeReport();
  assert(report.offenseTracked&&report.projectilesFired===r.projectilesFired);
  assert(report.projectilesLanded===r.projectilesLanded);
  assert(report.projectilesLost===r.projectilesLost);
  assert(report.directHitHpRemoved===Math.round(r.directHitHpRemoved));
  assert.equal(report.lastLineKills,r.lastLineKills);
  assert(report.wallPressureTracked,'Existing wall pressure accounting retained');
  assert.equal(p.siegeHistory.length,1,'Exactly one finished sortie archived');
  assert(p.siegeHistory[0].offenseTracked,'New archive record marks actual measurement');
  assert(p.siegeHistory[0].projectilesFired===report.projectilesFired);
  assert(h.renderSiegeHistory().includes('OFFENSIVE TEMPO'));
  h.renderSiegeReport();
  assert(w.el('siegeReportMetrics').innerHTML.includes('PROJECTILES LANDED'));
  assert(w.el('siegeReportMetrics').innerHTML.includes('DIRECT HIT HP REMOVED'));
  assert(h.save());
  const saved=JSON.parse(w.store[SAVE]);
  assert(saved.siegeHistory[0].offenseTracked);
  assert.equal(saved.siegeHistory[0].directHitHpRemoved,report.directHitHpRemoved);
  assert.equal(saved.selectedTier,1);
  const again=world(seed,{[SAVE]:w.store[SAVE]});
  assert(again.h.p().siegeHistory[0].offenseTracked,'New fields survive old-key reload');
  assert(again.h.renderSiegeHistory().includes('OFFENSIVE TEMPO'));
  results.push({seed,policy,paidEssence:actualSpend,ranks:bought,
   realClears:r.wavesCleared,projectiles:r.projectilesFired,
   landed:r.projectilesLanded,lost:r.projectilesLost,
   directHp:report.directHitHpRemoved,lastLineKills:r.lastLineKills,
   breaches:r.totalBreaches||0,wallHpLost:report.wallBreachDamage,
   realFightSeconds:report.combatSeconds});
 }
}
assert.equal(results.length,4);
console.log('Alpha 0.15.23: four authentic, original-priced opening sieges with conserved rewards and bounded telemetry');
for(const result of results)console.log(JSON.stringify(result));
