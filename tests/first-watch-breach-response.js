// Alpha 0.15.17 — real measured Breach Response Ledger and exact original Training quotes.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;
  this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,f){this.listeners[k]=f}
 querySelector(){return null}
 querySelectorAll(){return []}
}
function world(seed0=1517,source){
 let seed=seed0>>>0;const rand=Object.create(Math);
 rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.assign(Object.create(null),source||{});
 const sandbox={Math:rand,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});assert(sandbox.window.__PK_TEST_TOOLS__);
 return {h:sandbox.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.17')&&html.includes('game.js?v=0.15.17')&&html.includes('style.css?v=0.15.17'));
assert(css.includes('.breach-response-ledger')&&css.includes('@media(max-width:760px){.breach-response-grid{grid-template-columns:1fr}'));
assert(css.includes('min-height:44px'));
// No old save metrics or empty shells should generate a recommendation or false data.
const w=world(15411),h=w.h,p=h.p(),r=h.run();
assert.equal(h.breachResponseLedger(1),null,'No invented observations before an actual siege');
assert.equal(h.renderBreachResponseLedger(1),'');
assert.equal(h.breachResponseLedger(2),null,'Locked territories cannot be previewed');
assert.equal(h.breachResponseLedger(0),null);
const legacy=h.normalizeSiegeHistory([{reason:'fallen',tier:1,startWave:1,lastWave:2,enemies:8,
 wallPressureTracked:true,wallBreachDamage:17,breaches:2}])[0];
p.siegeHistory=[legacy];
assert.equal(h.breachResponseLedger(1),null,'Old archives do not claim new offensive measurements');
p.siegeHistory=[];
const oldEssence=p.essence;
assert(h.purchaseCouncilTraining('power'),'Original early Training purchase, not a mock');
assert(p.essence<oldEssence);
assert(h.save());
assert(h.enterSiege(),'Real original-engine battle launches');
let ticks=0;
while(r.phase!=='fallen'&&r.phase!=='completed'&&r.wavesCleared<6&&ticks<75000){
 h.tick(.05);ticks++;
 assert(r.enemies.length<=24&&r.shots.length<=48,'No actor cap bypass');
}
assert(ticks<75000&&r.wavesCleared>=1);
if(r.phase!=='fallen'&&r.phase!=='completed')h.retreatFromSiege();
const report=h.siegeReport();
assert(report.offenseTracked&&report.wallPressureTracked);
assert(p.siegeHistory.length===1&&p.siegeHistory[0].offenseTracked);
const goldAtReview=p.gold,sigilsAtReview=p.sigils;
const before=JSON.stringify(p),q=h.breachResponseLedger(1),rendered=h.renderBreachResponseLedger(1);
assert(q&&q.records.length===1);
assert.equal(q.records[0].fired,report.projectilesFired);
assert.equal(q.records[0].landed,report.projectilesLanded);
assert.equal(q.records[0].directHp,report.directHitHpRemoved);
assert.equal(q.records[0].wallBreachDamage,report.wallBreachDamage);
assert.equal(q.records[0].lastLineKills,report.lastLineKills);
assert.equal(q.records[0].hitPercent,Math.round(100*report.projectilesLanded/report.projectilesFired));
assert.equal(q.records[0].hitHpPerSecond,report.combatSeconds?Math.round(report.directHitHpRemoved/report.combatSeconds):null);
assert.equal(q.mixedStartingWaves,false);
assert(rendered.includes('BREACH RESPONSE')&&rendered.includes('PROJECTILES LANDED'));
assert(rendered.includes('DIRECT HP / SIMULATED SECOND'));
assert(rendered.includes('WALL BREACH DAMAGE'));
assert(rendered.includes('data-veteran-watch-open="training"'));
assert.deepEqual(Array.from(q.offers.map(o=>o.id)),['power','haste','fort']);
assert.equal(q.held,p.essence);
for(const offer of q.offers){
 assert.equal(offer.rank,p.training[offer.id]||0);
 assert(offer.cost===null||Number.isSafeInteger(offer.cost)&&offer.cost>=0);
 assert.equal(offer.affordable,offer.cost!==null&&p.essence>=offer.cost);
}
assert.equal(JSON.stringify(p),before,'Ledger rendering cannot spend/alter saved character');
h.renderTierLobby();
assert(w.el('milestoneList').innerHTML.includes('BREACH RESPONSE'));
assert.equal(p.gold,goldAtReview,'Read-only ledger did not consume legitimately earned Gold');
assert.equal(p.sigils,sigilsAtReview,'Read-only ledger did not consume legitimately earned milestone Sigils');
assert(h.save());
const restored=world(15411,{[SAVE]:w.store[SAVE]});
assert(restored.h.breachResponseLedger(1),'Genuine saved telemetry survives normal character save/load');
// Explicit synthetic UI-only archive fixtures, not counted as earned progress.
const p2=restored.h.p(),valid=restored.h.normalizeSiegeHistory;
const injected=valid([{
 reason:'fallen',tier:1,startWave:100,lastWave:107,cleared:7,enemies:34,
 wallPressureTracked:true,wallBreachDamage:98,wallSabotageDamage:0,
 offenseTracked:true,projectilesFired:100,projectilesLanded:77,projectilesLost:20,
 directHitHpRemoved:5900,combatSeconds:0,lastLineKills:11,breaches:6
}])[0];
p2.siegeHistory.unshift(injected);
const q2=restored.h.breachResponseLedger(1);
assert(q2.mixedStartingWaves,'Different earned-looking checkpoint labels must warn non-comparability');
assert.equal(q2.records[0].hitPercent,77);
assert.equal(q2.records[0].hitHpPerSecond,null,'Never divide by 0 or invent DPS');
assert(restored.h.renderBreachResponseLedger(1).includes('Different starting waystones'));
assert(restored.h.breachResponseLedger(2)===null,'Synthetic first-tier records cannot spill into other territory');
assert(restored.h.breachResponseLedger(31)===null,'Invalid tiers rejected');
console.log('PASS Alpha 0.15.17: genuine original-price earned combat, live read-only Breach Response Ledger, 44px iPhone layout, accurate per-tier pressure and costs, legacy isolation, save/reload, maliciously missing durations and mixed-waystone honesty');
