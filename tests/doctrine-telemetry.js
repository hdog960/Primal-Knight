// 0.11.10: real cast trigger, held-time, HUD and after-action regression.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const nodes=new Map(),storage=Object.create(null);
class El{constructor(id){this.id=id;this.style={};this.dataset={};this.listeners={};this.innerHTML='';this.textContent='';this.hidden=false;this.disabled=false;this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}}}getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}addEventListener(k,v){this.listeners[k]=v}querySelectorAll(){return []}querySelector(){return null}}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
const sandbox={Math,Date,Image,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){}},
 document:{getElementById:el,querySelectorAll(){return []},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(source,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
const prior=JSON.stringify({inventory:p.inventory,runes:p.runes,gold:p.gold,essence:p.essence,sigils:p.sigils});
assert.equal(p.doctrineTactic,'rapid');assert.equal(h.doctrineTacticAssessment().reason,'rapid');
assert.equal(h.doctrineCanCastNow(),false);
assert(h.chooseDoctrineTactic('horde'));h.enterSiege();
assert.equal(r.doctrineHeldSeconds,0);assert.equal(r.doctrineHoldEvents,0);
r.doctrineClock=0;r.enemies=[];h.refreshDoctrineHud();
assert.equal(el('doctrineTimer').textContent,'WAITING');
assert.equal(h.advanceCombatDoctrine(.4),false);assert.equal(r.doctrineHeldSeconds,0);
const makeEnemy=(i=0)=>({type:'goblin',x:240+i*40,y:180,hp:100,max:100,armor:0,speed:0,dead:false,burn:0,buildup:0,slow:0,valued:10});
r.enemies=[makeEnemy()];r.doctrineClock=0;
assert.equal(h.doctrineTacticAssessment().reason,'hold');
assert.equal(h.advanceCombatDoctrine(.4),false);h.refreshDoctrineHud();
assert.equal(el('doctrineTimer').textContent,'HELD');
assert.equal(h.advanceCombatDoctrine(.25),false);
assert.equal(r.doctrineHoldEvents,1);assert(Math.abs(r.doctrineHeldSeconds-.65)<1e-5);
r.enemies=[makeEnemy(),makeEnemy(1),makeEnemy(2),makeEnemy(3)];
assert.equal(h.doctrineTacticAssessment().reason,'crowd');
assert.equal(h.advanceCombatDoctrine(.05),true);
assert.equal(r.doctrineCasts,1);assert.equal(r.doctrineCastReasons.crowd,1);
assert(r.doctrineClock>0);assert.equal(r.doctrineHolding,false);
r.phase='ready';assert(h.chooseDoctrineTactic('crisis'));r.phase='fighting';r.doctrineClock=0;
r.enemies=[makeEnemy()];r.enemies[0].y=315;assert.equal(h.doctrineTacticAssessment().reason,'frontline');
assert.equal(h.advanceCombatDoctrine(.05),true);assert.equal(r.doctrineCastReasons.frontline,1);
r.phase='ready';p.level=5;assert(h.chooseCombatDoctrine('aegis'));r.phase='fighting';r.health=r.maxHealth*.85;
r.enemies=[makeEnemy()];r.doctrineClock=0;assert.equal(h.doctrineTacticAssessment().reason,'repair');
const before=r.health;assert(h.advanceCombatDoctrine(.05));assert(r.health>before);assert.equal(r.doctrineCastReasons.repair,1);
r.phase='ready';assert(h.chooseCombatDoctrine('vanguard'));assert(h.chooseDoctrineTactic('horde'));r.phase='fighting';r.doctrineClock=0;r.health=r.maxHealth;
r.enemies=[makeEnemy()];r.enemies[0].bossWardTimer=.7;
assert.equal(h.doctrineTacticAssessment().reason,'urgent');
assert(h.advanceCombatDoctrine(.05));assert.equal(r.doctrineCastReasons.urgent,1);
h.retreatFromSiege();const report=h.siegeReport();
assert.equal(report.doctrineCasts,4);
assert.equal(report.doctrineHoldEvents,1);assert(Math.abs(report.doctrineHeldSeconds-.65)<1e-5);
assert.equal(report.doctrineCastReasons.urgent,1);
assert.equal(report.doctrineTactic,'horde');
assert(el('siegeReportMetrics').innerHTML.includes('SIGNATURE AUTO-CASTS'));
assert(el('siegeReportMetrics').innerHTML.includes('CHARGE HOLDS'));
assert(el('siegeReportMetrics').innerHTML.includes('0.7s'));
assert(el('siegeReportRange').textContent.includes('HORDE TIMING'));
assert(el('siegeReportRange').textContent.includes('1 URGENT CASTS'));
assert.equal(JSON.stringify({inventory:p.inventory,runes:p.runes,gold:p.gold,essence:p.essence,sigils:p.sigils}),prior,
 'Tactic and telemetry never consume currencies or alter gear');
for(const key of ['doctrineHeldSeconds','doctrineHoldEvents','doctrineCastReasons','doctrineHolding'])
 assert(!Object.prototype.hasOwnProperty.call(JSON.parse(storage.primal_knight_onslaught_save_v1),key),
  'Session-only telemetry never leaks into the persistent save');
const frozen=JSON.stringify(report);h.showLobby('REOPENED');
assert.equal(JSON.stringify(h.siegeReport()),frozen,'Lobby reopen never double-counts casts');
h.enterSiege();
assert.equal(h.siegeReport(),null);assert.equal(r.doctrineHoldEvents,0);
assert.equal(r.doctrineCasts,0);assert.equal(r.doctrineHeldSeconds,0);
assert.equal(Object.keys(r.doctrineCastReasons).length,0);
assert(html.includes('ALPHA 0.15.20')&&html.includes('game.js?v=0.15.20')&&html.includes('style.css?v=0.15.20'));
console.log('PASS: live cast reasons, held combat seconds, Waiting/Held UI, genuine Siege Chronicle report, save and clean retry.');
