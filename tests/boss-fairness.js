// Alpha 0.10.14 — major boss defeat evidence and Iron Ward fairness.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
function game(seedValue=1014){
 let seed=seedValue>>>0;
 const random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';
   this.classList={add(){},remove(){},toggle(){}};
   this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;
   this.scrollTop=0;this.width=960;this.height=540;this.listeners={};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},
   {get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(type,callback){this.listeners[type]=callback;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const els=new Map(),el=id=>els.get(id)||(els.set(id,new Element(id)),els.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null);
 const sandbox={Image,window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
  localStorage:{getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
  Math:random,Date,performance:{now:()=>1000},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
  console,confirm(){return true;},Blob,URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 const h=sandbox.window.__PK_TEST_TOOLS__;
 assert(h,'Real game exports required boss-fairness methods');
 return {h,el,store};
}
function boss(type='warlord',params={}){
 return {type,isBoss:true,x:470,y:238,hp:900,max:1000,speed:0,armor:0,
  valued:65,dead:false,slow:0,burn:0,buildup:0,wobble:0,golden:false,
  bossPhase:2,bossStyle:type==='warlord'?'iron':null,
  bossWardTimer:0,bossWardDamage:0,bossExposedTimer:0,bossCastDamage:0,
  bossFuryWindup:0,bossBlinkWindup:0,crushWindup:0,
  ...params};
}

// Focused auto-combat must genuinely offer a way to break the 2.2s Iron Ward.
const combat=game(5014),h=combat.h,r=h.run();
r.phase='fighting';r.wave=100;r.tier=1;r.maxHealth=h.maxWall();r.health=r.maxHealth;
r.encounter=h.encounterDirector(100,1);r.total=22;r.spawned=0;r.spawnClock=1;
const iron=boss('warlord',{bossWardTimer:2.2,bossWardDamage:45});
const approaching={type:'goblin',isBoss:false,x:550,y:414,hp:100,max:100,speed:0,
 armor:0,dead:false,slow:0,burn:0,buildup:0,wobble:0,valued:10};
r.enemies=[iron,approaching];
assert(h.threatPriority(iron)>h.threatPriority(approaching),
 'Hero considers an active Iron Ward urgent enough to focus over ordinary nearby troops');
const beforeWard=iron.bossWardTimer;
h.tick(.05);
assert(r.shots.some(s=>s.target===iron),'Real automatic hero shoots at Iron Ward during its short counter window');
assert(iron.bossWardTimer<beforeWard&&iron.bossWardTimer>0,'Ward protection has a genuine finite lifetime');
const fuse={type:'sapper',y:346,x:620,dead:false,fuseTime:.8};
assert(h.threatPriority(fuse)>h.threatPriority(iron),
 'A lit Sapper near the wall takes precedence over breaking a still-distant Iron Ward');
iron.bossWardTimer=0;
assert(h.threatPriority(approaching)>h.threatPriority(iron),
 'After Iron Ward expires, normal wall-defense targeting resumes');
iron.bossWardTimer=2.2;r.shots=[];
h.refreshHUD();
const cast=combat.el('bossCastTrack'),label=combat.el('bossCastBreak');
assert.equal(cast.hidden,false,'Iron Ward active timer is rendered inside boss health HUD');
assert.equal(label.textContent,'BREAK 45%','Ward meter reflects actual 45% damage toward the 10% max-HP interruption requirement');
assert.equal(combat.el('bossCastFill').style.width,'100%','Ward duration bar begins at 100% remaining');
const interrupted=h.bossCounterplay(iron,55);
assert.equal(interrupted,true,'Exactly another 55 HP of live counter damage shatters 100-HP Iron Ward threshold');
assert.equal(iron.bossWardTimer,0,'Interrupted ward actually loses protection');
assert.equal(r.totalBossBreaks,1,'True ward interruption increments the real boss-break counter');
h.refreshHUD();
assert.equal(cast.hidden,true,'Ward duration/progress UI clears on interruption');

r.enemies=[boss('warlord',{bossStyle:'ember',bossFuryWindup:.45,bossCastDamage:27})];
r.encounter=h.encounterDirector(200,1);
h.refreshHUD();
assert.equal(label.textContent,'BREAK 30%','Ember Charge progress uses its separate 9% max-HP threshold');
assert(combat.el('bossCastLabel').textContent.includes('EMBER CHARGE'),'Ember charging state is explicit');
r.enemies[0].bossFuryWindup=0;
r.enemies[0].bossBlinkWindup=.45;r.enemies[0].bossCastDamage=45;
h.refreshHUD();
assert.equal(label.textContent,'BREAK 50%','Void Step disruption displays actual running damage');
r.enemies=[boss('siegebeast',{crushWindup:.55,bossCastDamage:36})];
r.encounter=h.encounterDirector(25,1);r.wave=25;
h.refreshHUD();
assert.equal(label.textContent,'BREAK 40%','Crusher attack disruption percentage uses live 9% threshold');
r.enemies=[];h.refreshHUD();
assert.equal(cast.hidden,true,'Dead or missing boss does not leave stale break progress');

// A major boss breaching the wall must never be falsely counted as a defeated boss.
const escapedWorld=game(6014),e=escapedWorld.h,er=e.run();
er.tier=1;er.wave=100;er.phase='ready';er.maxHealth=100000;er.health=100000;
e.beginWave();er.maxHealth=100000;er.health=100000;
const escaped=boss('warlord',{x:500,y:429.8,speed:60,hp:500,max:500});
er.enemies=[escaped];er.spawnClock=1;er.shotClock=10;er.stationClock=10;
e.tick(.05);
assert.equal(escaped.dead,true,'The real combat loop records a live major boss reaching the fortress');
assert.equal(er.totalBreaches,1,'Breach still damages the wall through existing logic');
assert.equal(er.bossEscapes,1,'Escaped major boss is recorded independently from defeats');
assert.equal(er.bossesKilledThisWave,0,'Breaching is not a boss death');
assert.equal(er.health<er.maxHealth,true,'Allowing a boss through inflicts normal costly wall damage');
assert.equal(er.phase,'fighting','Fortress can survive a major boss escape');
e.completeWave();
assert.equal(er.wavesCleared,1,'Surviving a boss breach still clears the wave as before');
assert.equal(er.bossVictories,0,'Chronicle never credits a boss kill for merely surviving the wave');
assert.equal(er.bossEscapes,1,'Escape persists across subsequent wave transitions');
e.retreatFromSiege();
assert.equal(e.siegeReport().bosses,0,'After-action report honestly shows zero boss defeats');
assert.equal(e.siegeReport().bossEscapes,1,'After-action report counts one breached major boss');
assert(escapedWorld.el('siegeReportMetrics').innerHTML.includes('BOSSES BREACHED'),
 'Battle debrief exposes boss escapes instead of silently hiding them');
assert(escapedWorld.el('siegeReportMetrics').innerHTML.includes('BOSSES DEFEATED'),
 'Actual defeated bosses remain a distinct statistic');
assert(escapedWorld.el('siegeReportMetrics').innerHTML.includes('>1</strong>'),
 'Real breach values are visible in the expanded Chronicle');
const saved=JSON.parse(escapedWorld.store.primal_knight_onslaught_save_v1);
for(const key of ['bossEscapes','bossesKilledThisWave','bossVictories']){
 assert.equal(Object.prototype.hasOwnProperty.call(saved,key),false,
 'Combat-only boss metric '+key+' never enters permanent player save');
}
e.enterSiege();
assert.equal(er.bossEscapes,0,'A new siege does not inherit boss escape statistics');
assert.equal(er.bossesKilledThisWave,0,'New wave starts with zero credited boss kills');

for(const [seed,wave,type] of [[7001,25,'siegebeast'],[7002,100,'warlord'],[7003,200,'warlord'],[7004,300,'warlord']]){
 const scenario=game(seed),check=scenario.h,run=check.run();
 run.tier=1;run.wave=wave;run.phase='ready';check.beginWave();
 // Use the actual spawn director, not an invented dummy boss.
 run.spawned=run.total-1;check.spawnEnemy();
 const bossOnField=run.enemies.find(x=>x.isBoss);
 assert(bossOnField&&bossOnField.type===type,'Actual scheduled boss spawns in encounter '+wave);
 const normalBossMax=bossOnField.max;
 bossOnField.armor=0;bossOnField.hp=Math.max(1,normalBossMax*.01);
 // This hit is sufficient to kill, but never artificially triggers a second phase.
 check.hurt(bossOnField,normalBossMax,'ballista');
 assert.equal(bossOnField.dead,true,'The actual major boss is defeated by a combat hit');
 assert.equal(run.bossesKilledThisWave,1,'A major boss death records exactly once');
 assert.equal(run.bossEscapes,0,'Defeated boss never records a false escape');
 check.completeWave();
 assert.equal(run.bossVictories,1,'Only a confirmed defeated boss is credited for encounter '+wave);
 check.beginWave();
 assert.equal(run.bossesKilledThisWave,0,'Defeat flag resets across subsequent waves');
 assert.equal(run.bossVictories,1,'Lifetime Chronicle keeps the legitimate prior boss victory');
}
assert(html.includes('ALPHA 0.15.22')&&html.includes('game.js?v=0.15.22'),
 'iPhone cache correctly identifies the new release');
assert(html.includes('id="bossCastBreak"'),'Real HUD includes percentage-based boss break text');
assert(css.includes('.siege-report-metrics{grid-template-columns:repeat(4,minmax(0,1fr))}'),
 'Compact 7-stat report has a four-column desktop layout');
assert(css.includes('.siege-report-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}'),
 'Seven Chronicle stats remain legible in a narrow portrait layout');
console.log('PASS: Alpha 0.10.14 boss kill vs escape accounting, honest Chronicle, actual scheduled boss defeats, focused Iron Ward targeting and live damage-based counter percentages.');
