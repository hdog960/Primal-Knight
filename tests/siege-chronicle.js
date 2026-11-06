// Alpha 0.10.13 — real per-siege combat stats, deep-waystone accuracy and endings.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
function world(seedValue=1313){
 let seed=seedValue>>>0;
 const math=Object.create(Math);
 math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.classList={add(){},remove(){},toggle(){}};
   this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;this.scrollTop=0;this.width=960;this.height=540;this.listeners={};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,val){o[k]=val;return true;}});}
  addEventListener(t,cb){this.listeners[t]=cb;}querySelectorAll(){return [];}querySelector(){return null;}
 }
 const els=new Map(),el=id=>els.get(id)||(els.set(id,new Element(id)),els.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null);
 const sandbox={Image,window:{__PK_TEST__:true,addEventListener(){}},
 document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
 localStorage:{getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
 Math:math,Date,setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 performance:{now:()=>1000},console,confirm(){return true;},Blob,
 URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(code,sandbox,{filename:'game.js'});
 const h=sandbox.window.__PK_TEST_TOOLS__;assert(h,'Real game exposes after-action test hooks');
 return {h,el,store};
}
const w=world(),h=w.h,r=h.run(),p=h.p();
assert.equal(h.siegeReport(),null,'Fresh install has no fake battle report');
assert.equal(w.el('siegeReport').hidden,true,'No after-action panel before first siege');
p.milestones['1:100']=true;
h.enterSiege();
assert.equal(r.startWave,100,'Waystone starts this session at wave 100');
assert.equal(r.wave,100,'Boss chapter entry is genuinely started from checkpoint');
assert.equal(r.wavesCleared,0,'Earlier wave clears are never attributed to the new siege');

// A real kill, a successful boss ward break, and a specialist cast interruption.
const fallenEnemy={type:'goblin',x:340,y:230,hp:40,max:40,armor:0,speed:0,
 valued:10,wobble:0,buildup:0,dead:false,slow:0,burn:0,golden:false};
r.enemies=[fallenEnemy];h.hurt(fallenEnemy,80,'ballista');
assert.equal(fallenEnemy.dead,true,'Real combat damage kills the enemy');
assert.equal(r.enemiesDefeated,1,'Chronicle accumulates a genuine enemy kill');
const iron={type:'warlord',isBoss:true,x:410,y:225,max:1000,hp:850,armor:0,valued:65,slow:0,burn:0,buildup:0,bossWardTimer:2.2,bossExposedTimer:0,dead:false};
assert.equal(h.bossCounterplay(iron,105),true,'Real boss ward shatter is registered');
r.enemies=[iron];
h.hurt(iron,1800,'ballista');
assert.equal(iron.dead,true,'Real combat kills the chapter warlord before crediting its victory');
const frost={type:'frostbinder',x:390,y:240,max:1000,hp:850,frostWindup:.7,spellBreakDamage:0,dead:false};
assert.equal(h.specialistCounterplay(frost,190),true,'Real specialist cast break is registered');
assert.equal(r.totalBossBreaks,1);
assert.equal(r.totalSpecialistBreaks,1);

h.completeWave();
assert.equal(r.wavesCleared,1,'Completing wave 100 increments this-run wave count only once');
assert.equal(r.bossVictories,1,'Defeating a chapter wave counts a boss victory');
assert.equal(r.wave,101);
assert.equal(r.bossCounters,1,'Per-wave boss interrupt count is still separate');
h.beginWave();
assert.equal(r.bossCounters,0,'Existing per-wave boss interrupt counter resets on next wave');
assert.equal(r.totalBossBreaks,1,'Chronicle tracks boss interrupts across waves');

const breach={type:'goblin',x:490,y:429.5,hp:1000,max:1000,armor:0,speed:50,
 valued:10,wobble:0,dead:false,slow:0,burn:0,buildup:0};
r.enemies=[breach];r.maxHealth=10000;r.health=10000;
h.tick(.05);
assert.equal(breach.dead,true,'Actual enemy movement reaches fortress wall');
assert.equal(r.breaches,1,'Original breach counter still tracks this wave');
assert.equal(r.totalBreaches,1,'Report counts the breach across the whole siege');
r.enemies=[];
h.completeWave();
assert.equal(r.wavesCleared,2,'Second actual wave clear increments session count');
h.retreatFromSiege();
const report=h.siegeReport();
assert.equal(report.reason,'retreated');
assert.equal(report.tier,1);
assert.equal(report.startWave,100,'Start wave was preserved for an unlocked waystone');
assert.equal(report.lastWave,102);
assert.equal(report.cleared,2,'Run starting at wave 100 reports two clears, NOT 101');
assert.equal(report.enemies,2,'Enemy kill count includes the actual defeated major boss');
assert.equal(report.bossBreaks,1,'Real interrupted boss cast is shown');
assert.equal(report.specialistBreaks,1,'Real interrupted specialist attack is shown');
assert.equal(report.bosses,1,'Real chapter victory is shown');
assert.equal(report.breaches,1,'Total breach count survives wave resets');
assert.equal(w.el('siegeReport').hidden,false,'Report is actually visible in returned Battle lobby');
assert(w.el('lobbySummary').textContent.includes('Cleared 2 this run'),'Fixed retreat summary does not confuse global wave with session clear count');
assert(w.el('siegeReportTitle').textContent.includes('HONORABLE RETREAT'),'Visible Chronicle identifies actual run end');
assert(w.el('siegeReportSummary').textContent.includes('2 WAVES · 2 FOES · 1 BREACHES'),'Compact Chronicle provides clear player feedback');
assert(w.el('siegeReportMetrics').innerHTML.includes('SPECIALISTS STOPPED'),'Expanded Chronicle shows specialist interrupts');
assert(w.el('siegeReportMetrics').innerHTML.includes('BOSSES DEFEATED'),'Expanded Chronicle shows boss victories');
assert(w.el('siegeReportRange').textContent.includes('STARTED WAVE 100'),'Player can verify deep-waystone run baseline');
const serialized=JSON.parse(w.store.primal_knight_onslaught_save_v1);
for(const key of ['wavesCleared','enemiesDefeated','totalBossBreaks','totalSpecialistBreaks','totalBreaches']){
 assert.equal(Object.prototype.hasOwnProperty.call(serialized,key),false,'Session-only field '+key+' cannot corrupt save schema');
}
h.showLobby('REOPENED LOBBY');
assert.equal(w.el('siegeReport').hidden,false,'Chronicle stays visible on return without inventing new stats');
assert.equal(h.siegeReport().cleared,2,'Re-rendering lobby cannot double-count progress');

h.enterSiege();
assert.equal(h.siegeReport(),null,'Starting a new run removes the prior transient Chronicle');
assert.equal(w.el('siegeReport').hidden,true,'Old report does not overlay new siege');
assert.equal(r.startWave,100,'New waystone run retains correct checkpoint');
assert.equal(r.wavesCleared,0,'Run counters reset at new session');
assert.equal(r.enemiesDefeated,0,'Past kills do not spill into new run');
assert.equal(r.totalBossBreaks,0,'Past interruptions do not spill into new run');
assert.equal(r.totalBreaches,0,'Past breaches do not spill into new run');
h.retreatFromSiege();
assert.equal(h.siegeReport().cleared,0,'Retreat without clearing a wave reports zero, not 99');
assert(w.el('lobbySummary').textContent.includes('Cleared 0 this run'),'Immediate retreat has honest summary');

const fall=world(1413),fh=fall.h,fr=fh.run();fall.h.enterSiege();
fr.maxHealth=100;fr.health=1;
fr.enemies=[{type:'goblin',x:500,y:429.8,hp:1000,max:1000,armor:0,speed:100,
 valued:10,wobble:0,dead:false,slow:0,burn:0,buildup:0}];
fh.tick(.06);
assert.equal(fr.phase,'fallen','Actual wall impact ends siege');
assert.equal(fh.siegeReport().reason,'fallen','Defeat builds a real after-action report');
assert.equal(fh.siegeReport().breaches,1,'Defeat records its final fatal breach');
assert.equal(fh.siegeReport().cleared,0,'Defeat before first clear cannot invent victories');
assert(fall.el('siegeReportTitle').textContent.includes('FORTRESS FALLEN'),'Defeat title is correctly visible');

const conquer=world(1513),ch=conquer.h,cr=ch.run();
ch.enterSiege();
cr.tier=30;cr.wave=10000;cr.startWave=10000;cr.phase='fighting';cr.encounter=ch.encounterDirector(10000,30);
cr.enemies=[{type:'warlord',isBoss:true,x:480,y:240,max:100,hp:60,armor:0,valued:65,
 dead:false,slow:0,burn:0,buildup:0,bossPhase:2,bossExposedTimer:0,bossWardTimer:0}];
ch.hurt(cr.enemies[0],300,'ballista');
assert.equal(cr.enemies[0].dead,true,'Final wave boss must truly die before Chronicle can count victory');
ch.completeWave();
assert.equal(cr.phase,'completed','Wave 10,000 still triggers original Eternal Victory behavior');
assert.equal(ch.siegeReport().reason,'victory','Eternal Victory produces after-action report');
assert.equal(ch.siegeReport().cleared,1,'Victory at wave 10,000 reports actual one-wave test session');
assert.equal(ch.siegeReport().bosses,1,'Final chapter victory included in boss count');
assert(conquer.el('siegeReportTitle').textContent.includes('ETERNAL VICTORY'),'Victory report uses correct tone');
assert(conquer.el('siegeReportRange').textContent.includes('LAST REACHED 10,000'),'Deep-wave victory notation remains readable');

assert(html.includes('ALPHA 0.14.1')&&html.includes('game.js?v=0.14.1'),'iPhone release uses fresh Safari asset URLs');
assert(html.includes('id="siegeReport"')&&html.includes('id="siegeReportMetrics"'),'Battle lobby contains actual Chronicle UI');
assert(css.includes('.siege-report[hidden]')&&css.includes('grid-template-columns:repeat(2,minmax(0,1fr))'),
 'Responsive 2-column detail grid and hidden status are styled');
console.log('PASS: Alpha 0.10.13 real waystone clear counts, per-run boss/specialist counters, defeats, breaches, 3 actual endings, after-action UI, reset, and unchanged permanent saves.');
