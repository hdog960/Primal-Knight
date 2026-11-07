// Alpha 0.15.3 — optional pause-only safety during long, genuinely played sieges.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const storage=Object.create(null),nodes=new Map();
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.innerHTML='';this.textContent='';this.scrollTop=0;this.className='';this.hidden=false;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});}});}
 addEventListener(){} setAttribute(k,v){this.attrs[k]=String(v)} querySelectorAll(){return []} querySelector(){return null}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=120;this.naturalHeight=120;}}
const sandbox={Math,Date,Image,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(js,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.15.3')&&html.includes('game.js?v=0.15.3'));
assert(html.includes('id="siegeGuardLobby"')&&html.includes('id="siegeGuardStatus"'));
assert(css.includes('.siege-guard-panel'));
assert.equal(h.siegeGuard.waves,0);assert.equal(h.siegeGuard.minutes,0);assert.equal(h.siegeGuard.wall,false);
assert.equal(h.siegeGuardSettings().includes('OPTIONAL REST CONTROLS'),true);
const original=JSON.stringify(p);
assert.equal(h.setSiegeGuardOption('guardWaves','25'),true);
assert.equal(h.setSiegeGuardOption('guardMinutes','15'),true);
assert.equal(h.setSiegeGuardOption('guardWall','on'),true);
assert.equal(h.setSiegeGuardOption('guardWaves','banana'),false);
assert.equal(h.setSiegeGuardOption('guardMinutes','9'),false);
assert.equal(h.setSiegeGuardOption('guardWall','yes'),false);
assert.equal(JSON.stringify(p),original,'Device preferences cannot enter exported character state');
assert.equal(storage[h.siegeGuardKey]!==undefined,true);
assert.equal(JSON.parse(storage[h.siegeGuardKey]).waves,25);
assert.equal(h.siegeGuardWaveRest(25),true);
assert.equal(h.siegeGuardWaveRest(26),false);
// Real battle must launch before any auto-rest can stop it.
h.enterSiege();assert.equal(r.phase,'fighting');assert.equal(r.guardActiveSeconds,0);
r.wave=25;r.phase='fighting';r.encounter=h.encounterDirector(25,1);
const before=p.gold,priorHistory=p.siegeHistory.length;
h.completeWave();
assert.equal(r.phase,'intermission');
assert.equal(r.wave,26);
assert.equal(r.speed,0,'25th legitimate clear must pause before wave 26');
assert.equal(r.guardReason.includes('25'),true);
assert(p.gold>before,'Original wave rewards granted prior to pause');
assert.equal(p.siegeHistory.length,priorHistory,'Pause cannot finish a sortie');
assert.equal(el('siegeGuardStatus').hidden,false);
assert(el('siegeGuardStatus').textContent.includes('TAP ▶ TO RESUME'));
h.tick(2);assert.equal(r.phase,'intermission','Paused wave countdown stays frozen');
assert.equal(h.toggleBattlePause(),false);
assert.equal(r.guardReason,'');
h.tick(2);assert.equal(r.phase,'fighting','Only explicit resume allows the next wave');
h.toggleBattlePause();assert.equal(r.speed,0);
h.cycleBattleSpeed();assert.equal(r.speed,0,'Speed toggled while paused must not resume');
h.toggleBattlePause();assert.equal(r.speed,2,'2× still available after manual pause');
assert.equal(h.setSiegeGuardOption('guardWaves','0'),true);
// Time safety uses active seconds, not 2× simulation time. Reset the timer on rest.
r.guardActiveSeconds=15*60-.03;r.phase='fighting';r.speed=2;r.total=10;r.spawned=0;r.enemies=[];r.health=r.maxHealth;
const beforeTime=p.battleSeconds;
h.tick(.05);
assert.equal(r.speed,0);assert.equal(r.guardActiveSeconds,0);
assert.equal(p.battleSeconds,beforeTime,'No extra combat tick after rest triggers');
assert(r.guardReason.includes('15 MIN'));
h.toggleBattlePause();
assert.equal(r.speed,2);assert.equal(r.guardReason,'');
assert.equal(r.guardActiveSeconds,0,'Time rest does not instantly repeat after manual resume');
// Critical integrity: one alert, no repeated pause until wall recovers.
assert.equal(h.setSiegeGuardOption('guardMinutes','0'),true);
r.guardWallLatched=false;r.phase='fighting';r.total=10;r.spawned=0;r.enemies=[];r.health=r.maxHealth*.15;
h.tick(.01);assert.equal(r.speed,0);assert.equal(r.guardWallLatched,true);
assert(r.guardReason.includes('FORTRESS'));
h.toggleBattlePause();h.tick(.01);assert.equal(r.speed,2,'Critical wall alert must be latched');
r.health=r.maxHealth*.45;h.tick(.01);assert.equal(r.guardWallLatched,false);
r.health=r.maxHealth*.15;h.tick(.01);assert.equal(r.speed,0,'Alert re-arms after actual recovery');
h.toggleBattlePause();
assert.equal(h.setSiegeGuardOption('guardWall','off'),true);
assert.equal(h.setSiegeGuardOption('guardWaves','500'),true);
r.startWave=750;r.wave=999;
assert.equal(h.siegeGuardWaveRest(500),false,'Skipped earlier checkpoint cannot trip new rest');
assert.equal(h.siegeGuardWaveRest(1000),true,'Deep 10,000-wave runs retain schedule');
assert.equal(h.siegeGuardWaveRest(10000),false,'Final victory must complete normally');
assert.equal(h.siegeGuardWaveRest(10001),false);
assert.equal(h.siegeGuardSettings().includes('500'),true);
assert.equal(h.siegeGuardSettings().includes('PAUSE AT 20% HP'),true);
assert.equal(JSON.stringify(p).includes('guardWallLatched'),false);
assert.equal(JSON.stringify(p).includes('siegeGuard'),false);
h.retreatFromSiege();assert.equal(p.siegeHistory.length,1,'Real retreat still writes only one Chronicle record');
console.log('PASS Alpha 0.15.3 Siege Guard: real wave/time/HP rest, speed safety, persistence, earned-only rewards');
