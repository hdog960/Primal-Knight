// Alpha 0.11.0 — three real auto-cast combat doctrines and save-compatible selection.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
function createWorld(seedValue=11011){
 let seed=seedValue>>>0;
 const random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';
   this.classList={add(){},remove(){},toggle(){}};this.innerHTML='';this.textContent='';
   this.disabled=false;this.hidden=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.onclick=null;}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},
   {get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(name,callback){this.listeners[name]=callback;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null);
 const sandbox={Image,Math:random,Date,console,confirm(){return true;},Blob,
  window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
  localStorage:{getItem(key){return store[key]??null;},setItem(key,value){store[key]=String(value);},removeItem(key){delete store[key];}},
  requestAnimationFrame(){},performance:{now:()=>1000},setTimeout(){return 0;},clearTimeout(){},
  URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 const h=sandbox.window.__PK_TEST_TOOLS__;
 assert(h,'Live game exposes combat doctrine tests');
 return {h,el,store};
}
function target(type='goblin',extra={}){
 return {type,x:400,y:320,hp:5000,max:5000,armor:0,speed:0,
  dead:false,isBoss:false,slow:0,burn:0,buildup:0,wobble:0,valued:12,golden:false,
  ...extra};
}
const world=createWorld(),h=world.h,p=h.p(),r=h.run();
assert.equal(p.combatDoctrine,'vanguard','Original and first-time saves select the basic Marksman doctrine');
assert.equal(h.chosenDoctrine().name,"HUNTER'S VOLLEY",'Starting hero has an auto-cast ability');
assert.equal(h.combatDoctrineData.vanguard.level,1);
assert.equal(h.combatDoctrineData.storm.level,3);
assert.equal(h.combatDoctrineData.aegis.level,5);
assert.equal(h.chooseCombatDoctrine('storm'),false,'A level-one hero cannot equip locked Arcane Chain');
assert.equal(h.chooseCombatDoctrine('aegis'),false,'A level-one hero cannot equip locked Aegis Pulse');
assert.equal(h.chooseCombatDoctrine('nonsense'),false,'Unknown combat abilities are rejected');
assert.equal(p.combatDoctrine,'vanguard','Locked or invalid selections never mutate save preferences');
h.openTab('hero');
const hall=world.el('panelContent').innerHTML;
assert(hall.includes('Battle Doctrines')&&hall.includes("HUNTER'S VOLLEY"),'Real Hero Hall shows its first discipline');
assert(hall.includes('ARCANE CHAIN')&&hall.includes('AEGIS PULSE'),'Hero Hall includes distinct magic and defense classes');
assert(hall.includes('data-action="doctrine:storm" disabled'),'Level 3 discipline displays a disabled selection');
assert(hall.includes('data-action="doctrine:aegis" disabled'),'Level 5 discipline displays a disabled selection');
assert(hall.includes('aria-pressed="true"'),'Selected doctrine is distinguishable to assistive technology');

h.openTab('battle');h.enterSiege();
assert.equal(r.doctrineClock,3.5,'New siege starts with a short visible initial cast delay');
assert.equal(r.doctrineCasts,0,'No ability casts are carried forward from an old run');
const enemy=target('guardian',{y:335});
r.enemies=[enemy];r.spawnClock=99;r.shotClock=99;r.stationClock=99;
r.doctrineClock=.03;
h.tick(.05);
assert.equal(r.doctrineCasts,1,'Real battle clock automatically activates Hunter\'s Volley');
assert.equal(r.shots.length,3,'Starting hero auto-fires exactly three extra shots');
assert(r.shots.every(x=>x.target===enemy&&x.kind==='arrow'),'The three volley projectiles use real target collision and projectile logic');
assert.equal(r.doctrineClock,10,'Auto-cast starts a real 10-second cooldown after succeeding');
assert(world.el('doctrineName').textContent.includes('VOLLEY'),'Active doctrine appears in battlefield HUD');
assert(world.el('doctrineTimer').textContent.endsWith('s'),'Battle HUD shows actual cooldown');
const time=r.doctrineClock,amount=r.doctrineCasts;
h.toggleBattlePause();
h.tick(1);
assert.equal(r.doctrineClock,time,'Pausing completely freezes auto-cast cooldown');
assert.equal(r.doctrineCasts,amount,'Pausing prevents additional ability triggers');
h.toggleBattlePause();h.cycleBattleSpeed();
assert.equal(r.speed,2,'Battle can run at twice speed');
h.tick(.05);
assert(Math.abs(r.doctrineClock-(time-.1))<.0001,'2× battle speed ages ability timers by 2× simulation time');

// Projectiles obey the existing hard cap; an unavailable burst holds the ready state.
r.shots=Array.from({length:48},()=>({target:enemy,x:500,y:400,power:1,kind:'arrow',life:30,trail:[]}));
assert.equal(h.castCombatDoctrine(),false,'When 48 shots are present, Hunter\'s Volley cannot exceed projectile cap');
assert.equal(r.shots.length,48,'The hard limit of 48 projectiles remains unchanged');
r.shots=[];r.enemies=[];r.doctrineClock=0;r.spawnClock=100;r.shotClock=100;r.stationClock=100;
h.advanceCombatDoctrine(.15);
assert.equal(r.doctrineCasts,1,'No-target waves cannot farm auto-cast activations');
assert.equal(r.doctrineClock,0,'Ready doctrine holds its cooldown at zero until a target appears');
r.phase='intermission';r.rewardTimer=2;
h.advanceCombatDoctrine(3);
assert.equal(r.doctrineClock,0,'Auto-cast cannot trigger during the between-wave intermission');
r.phase='fighting';

// Arcane Chain is available at hero level 3 and interacts with existing rune and talent stats.
p.level=3;
h.openTab('hero');
let ui=world.el('panelContent').innerHTML;
assert(/data-action="doctrine:storm"\s+aria-pressed="false"/.test(ui),'Arcane discipline unlocks naturally at level 3');
h.action('doctrine:storm');
assert.equal(p.combatDoctrine,'storm','Hero Hall action equips Arcane Chain in actual saved data');
assert.equal(r.doctrineClock,3,'Changing disciplines cannot instantly cast a second ability');
assert.equal(JSON.parse(world.store.primal_knight_onslaught_save_v1).combatDoctrine,'storm','Selected discipline persists in the original local save key');
const arcane=[target('guardian',{x:200}),target('sapper',{x:450}),target('goblin',{x:670}),target('warg',{x:800})];
r.enemies=arcane;r.phase='fighting';r.speed=1;
assert.equal(h.castCombatDoctrine(),true,'Arcane Chain deals real lightning damage');
assert(arcane.slice(0,3).every(x=>x.hp<5000),'Up to three enemies take actual chain hits');
assert(arcane.slice(0,3).every(x=>x.slow>=.85),'Lightning slows the chained targets');
assert.equal(arcane.filter(x=>x.hp<5000).length,3,'A fourth enemy is not struck by a three-target chain');
const baseline=5000-Math.min(...arcane.slice(0,3).map(x=>x.hp));
p.skills.spark=5;p.skills.hail=5;
p.runes.push({id:'storm_doctrine_test',type:'storm',tier:4});p.socketed.amulet='storm_doctrine_test';
assert(h.doctrineCooldown()<12,'Trained Spark discipline reduces Arcane Chain cooldown');
const powered=[target('guardian',{x:250}),target('sapper',{x:460}),target('warg',{x:690})];
r.enemies=powered;h.castCombatDoctrine();
const boosted=5000-Math.min(...powered.map(x=>x.hp));
assert(boosted>baseline,'Spark talents and socketed Storm rune increase the actual chain damage');
assert(powered.every(x=>x.slow>1),'Hail skill deepens Arcane Chain slow effect');

// The defensive discipline unlocks at level five and saves its choice.
p.level=5;h.openTab('hero');ui=world.el('panelContent').innerHTML;
assert(/data-action="doctrine:aegis"\s+aria-pressed="false"/.test(ui),'Guardian ability unlocks at hero level 5');
h.action('doctrine:aegis');
assert.equal(p.combatDoctrine,'aegis','Selected defensive discipline is genuinely equipped');
assert.equal(h.chosenDoctrine().school,'Guardian');
r.maxHealth=1000;r.health=450;
const rush=[target('raider',{y:390}),target('warg',{y:360}),target('sapper',{y:320}),target('guardian',{y:150})];
r.enemies=rush;
assert.equal(h.castCombatDoctrine(),true,'Aegis Pulse auto-activates for a damaged fortress');
assert.equal(r.health,468,'Baseline 1.8% wall heal is bounded and real');
assert(rush.slice(0,3).every((x,i)=>x.y<[390,360,320][i]),'Three dangerous frontline units are actually repelled');
assert.equal(rush[3].y,150,'A far away enemy is not given a fictitious knockback');
r.health=1000;r.enemies=[target('skeleton',{y:150})];
assert.equal(h.castCombatDoctrine(),false,'Aegis cannot waste cooldown healing a full wall without danger');
p.skills.stone=5;p.skills.bulwark=5;
assert(h.doctrineCooldown()<14,'Bulwark ranks speed up Aegis Pulse recovery');
r.health=450;r.enemies=[target('raider',{y:390})];h.castCombatDoctrine();
assert.equal(r.health,478,'Stone talents increase Aegis healing within capped limits');
assert.equal(r.enemies[0].y,366,'Bulwark synergy strengthens pushback without displacing enemies excessively');
assert(r.health<=r.maxHealth,'Aegis Pulse never overheals the fortress');

r.phase='intermission';r.doctrineClock=4;r.rewardTimer=2;h.tick(.2);
assert.equal(r.doctrineClock,4,'Between-wave countdown never consumes active-combat ability cooldown');
r.phase='fighting';r.doctrineClock=3;
h.retreatFromSiege();
assert(h.siegeReport().doctrineCasts>=4,'After-action Chronicle reports the auto-cast count without a permanent saved field');
assert(world.el('siegeReportRange').textContent.includes('HERO AUTO-CASTS'),'Siege Chronicle communicates auto-cast contribution');
h.enterSiege();
assert.equal(r.doctrineClock,3.5,'Next siege receives fresh doctrine timer rather than reusing last run');
assert.equal(r.doctrineCasts,0,'Next siege resets auto-cast telemetry');
assert.equal(h.chosenDoctrine().id,'aegis','Chosen discipline persists across new runs');

// Imported newer and legacy saves must never erase earned progress.
const snapshot=JSON.parse(JSON.stringify(p));
const restored=createWorld(22111);
assert.equal(restored.h.restoreProgressBackup(snapshot,false),true,'Original JSON backup flow accepts the new additive preference');
assert.equal(restored.h.p().combatDoctrine,'aegis','Imported save preserves equipped Guardian discipline');
const legacy={...snapshot};delete legacy.combatDoctrine;
restored.h.restoreProgressBackup(legacy,false);
assert.equal(restored.h.p().combatDoctrine,'vanguard','Old saves without a doctrine safely default to Hunter\'s Volley');
const invalid={...snapshot,combatDoctrine:'unknown-dangerous-ability'};
restored.h.restoreProgressBackup(invalid,false);
assert.equal(restored.h.p().combatDoctrine,'vanguard','Invalid imported combat ability is never equipped');

assert(html.includes('ALPHA 0.13.6')&&html.includes('game.js?v=0.13.6'),'Safari Home Screen receives cache-busted doctrine implementation');
assert(html.includes('id="doctrineHud"'),'Battle canvas has a real doctrine cooldown HUD');
assert(css.includes('.hall-doctrine-grid')&&css.includes('.doctrine-hud'),'Visual design and accessibility classes exist');
assert(css.includes('grid-template-columns:1fr;gap:7px'),'Doctrine selector stacks into one-column mobile layout');
console.log('PASS: Alpha 0.11.0 three persisted hero doctrines, unlocks, real projectiles/multi-hit/knockback, skill/rune synergies, cooldowns at 1×/2×/paused, 48-shot cap, real Hero Hall actions, Chronicle, legacy restore and iPhone UI.');
