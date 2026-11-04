// Alpha 0.11.1 — live single-slot passives, safe three-slot loadouts, save round trips.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
function fixture(){
 class Element {
  constructor(id){this.id=id;this.style={};this.dataset={};this.innerHTML='';this.textContent='';this.hidden=false;
   this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};
   this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},
    {get(obj,k){return obj[k]||(()=>{});},set(obj,k,v){obj[k]=v;return true;}});}
  addEventListener(k,fn){this.listeners[k]=fn;}querySelectorAll(){return [];}querySelector(){return null;}
 }
 const elements=new Map(),el=id=>elements.get(id)||(elements.set(id,new Element(id)),elements.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store={};
 const sandbox={Image,window:{__PK_TEST__:true,addEventListener(){}},
 document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
 localStorage:{getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
 Math:Object.assign(Object.create(Math),{random:()=>.99}),Date,console,
 requestAnimationFrame(){},setTimeout(){return 0;},clearTimeout(){},performance:{now:()=>1000},
 Blob,URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}},confirm(){return true;}};
 vm.runInNewContext(js,sandbox,{filename:'game.js'});
 const hooks=sandbox.window.__PK_TEST_TOOLS__;assert(hooks,'Live game exports passive and preset hooks');
 return {h:hooks,el,store};
}
function foe(type='sapper',extra={}){
 return {type,x:520,y:320,hp:10000,max:10000,speed:0,armor:0,dead:false,
  slow:0,burn:0,buildup:0,wobble:0,golden:false,valued:11,
  ...extra};
}
const v=fixture(),h=v.h,p=h.p(),run=h.run();
assert.equal(p.combatPassive,'hunter','Legacy saves select the free starting Hunter passive');
assert.equal(p.combatLoadouts.length,3,'Exactly three reference-only build slots exist');
assert(p.combatLoadouts.every(x=>x===null),'First-time player starts with empty presets');
assert.equal(h.passiveTrait().name,"PREDATOR'S EYE");
assert.equal(h.chooseCombatPassive('conductor'),false,'New level-one players cannot bypass Storm level-three gate');
assert.equal(h.chooseCombatPassive('sentinel'),false,'New level-one players cannot bypass Sentinel level-five gate');
assert.equal(h.chooseCombatPassive('not-a-passive'),false,'Unknown passive ability is rejected');
assert.equal(p.combatPassive,'hunter','Invalid passive attempts cannot alter the active build');
h.openTab('hero');
let hall=v.el('panelContent').innerHTML;
assert(hall.includes('PASSIVE COMBAT TRAIT')&&hall.includes('PREDATOR'), 'Hero Hall includes actual passive trait chooser');
assert(hall.includes('RAMPART OATH')&&hall.includes('STORM CONDUCTOR'),'All three distinct passives have cards');
assert(hall.includes('data-action="passive:sentinel" disabled'),'Locked Sentinel cannot be selected early');
assert(hall.includes('THREE BATTLE LOADOUTS')&&hall.includes('data-action="saveLoadout:0"'),'Three saveable presets appear inside live Hero Hall');
assert.equal(h.loadoutReadiness(0).reason,'EMPTY','Unused slots cannot magically equip items');
assert.equal(h.applyCombatLoadout(0),false,'Applying an empty loadout has no effect');

const enemy=foe(),normal=foe();run.enemies=[enemy,normal];
h.hurt(enemy,100,'arrow');
const hunterHit=10000-enemy.hp;
p.combatPassive='conductor';h.hurt(normal,100,'arrow');
const normalHit=10000-normal.hp;
assert(hunterHit>normalHit,'Predator passive genuinely increases physical arrow damage to specialist casters');
assert(Math.abs(hunterHit/normalHit-1.08)<.001,'Predator damage bonus is bounded to precisely 8%');
const common=foe('goblin'),commonBase=foe('goblin');run.enemies=[common,commonBase];
p.combatPassive='hunter';h.hurt(common,100,'arrow');
p.combatPassive='conductor';h.hurt(commonBase,100,'arrow');
assert.equal(common.hp,commonBase.hp,'Predator does not boost every ordinary enemy, preserving a real trade-off');

const lightningBase=foe(),lightningBuff=foe();run.enemies=[lightningBase,lightningBuff];
p.combatPassive='hunter';h.hurt(lightningBase,100,'lightning');
p.combatPassive='conductor';h.hurt(lightningBuff,100,'lightning');
assert(10000-lightningBuff.hp>10000-lightningBase.hp,'Storm Conductor boosts actual lightning damage');
assert(Math.abs((10000-lightningBuff.hp)/(10000-lightningBase.hp)-1.10)<.001,'Conductor bonus is bounded to precisely 10%');
assert(lightningBuff.slow>=.45,'Conductor applies a real short slow on lightning hit');
assert.equal(lightningBase.slow,0,'Other passives do not silently gain the lightning slow');

p.level=5;
assert.equal(h.chooseCombatPassive('sentinel'),true,'Guardian passive unlocks at hero level five');
run.maxHealth=1000;run.wave=75;run.tier=1;
const baseBlast=(()=>{p.combatPassive='hunter';return h.sapperBlastDamage();})();
const reducedBlast=(()=>{p.combatPassive='sentinel';return h.sapperBlastDamage();})();
assert(reducedBlast<baseBlast,'Rampart Oath reduces actual Sapper blast damage');
assert(reducedBlast>=1,'Sapper blast mitigation never creates zero/negative damage');
function breach(passive){
 const w=fixture(),r=w.h.run(),player=w.h.p();
 player.level=5;player.combatPassive=passive;
 r.phase='fighting';r.tier=1;r.wave=20;r.maxHealth=20000;r.health=20000;
 r.spawned=0;r.total=24;r.spawnClock=99;r.shotClock=99;r.stationClock=99;r.doctrineClock=99;
 r.encounter=w.h.encounterDirector(20,1);
 r.enemies=[foe('goblin',{x:525,y:429.9,speed:100,hp:20000,max:20000})];
 w.h.tick(.05);
 assert.equal(r.totalBreaches,1,'Actual fortress crossing triggers one real breach');
 return 20000-r.health;
}
const baseImpact=breach('hunter'),guardedImpact=breach('sentinel');
assert(guardedImpact<baseImpact,'Sentinel protects fortress against real wall impacts');
assert(guardedImpact>=1&&guardedImpact>=baseImpact*.87,'Sentinel protection is bounded, not invulnerability');

p.level=5;p.combatDoctrine='storm';p.combatPassive='sentinel';
p.runes.push({id:'stored-storm',type:'storm',tier:3});
p.equipped.helm='starterhelm';p.socketed.helm='stored-storm';
h.openTab('hero');h.action('saveLoadout:0');
const saved=p.combatLoadouts[0];
assert(saved&&saved.doctrine==='storm'&&saved.passive==='sentinel','Saved slot holds both active and passive selection');
assert.equal(saved.equipped.helm,'starterhelm','Slot records actual owned equipment ID');
assert.equal(saved.socketed.helm,'stored-storm','Slot records the selected owned rune ID');
assert.equal(JSON.parse(v.store.primal_knight_onslaught_save_v1).combatLoadouts[0].socketed.helm,'stored-storm','Real action writes preset to existing save key');
const countBefore=p.inventory.length,runesBefore=p.runes.length,goldBefore=p.gold;
p.combatDoctrine='vanguard';p.combatPassive='hunter';delete p.socketed.helm;
h.action('applyLoadout:0');
assert.equal(p.combatDoctrine,'storm','Apply action restores the active ability');
assert.equal(p.combatPassive,'sentinel','Apply action restores passive trait');
assert.equal(p.socketed.helm,'stored-storm','Apply action restores selected socketed rune');
assert.equal(p.inventory.length,countBefore,'Applying a preset never duplicates equipment');
assert.equal(p.runes.length,runesBefore,'Applying a preset never duplicates runes');
assert.equal(p.gold,goldBefore,'Loadout switching does not cost or mint any currency');
assert.equal(h.loadoutReadiness(0).ready,true,'Saved valid loadout remains reusable');
assert(v.el('panelContent').innerHTML.includes('EQUIPPED'),'Hero Hall visibly marks equipped build');

// Three independent named slots, including the complete ring/armor layout.
p.combatDoctrine='aegis';p.combatPassive='hunter';p.socketed={};
assert.equal(h.saveCombatLoadout(1),true,'Second distinct preset can be saved');
p.combatDoctrine='vanguard';p.combatPassive='conductor';
assert.equal(h.saveCombatLoadout(2),true,'Third distinct preset can be saved');
assert.equal(h.saveCombatLoadout(3),false,'Fourth loadout is not silently created');
assert.equal(p.combatLoadouts.length,3,'Preset capacity is fixed');
assert.equal(h.applyCombatLoadout(1),true,'Another saved preset switches correctly');
assert.equal(p.combatDoctrine,'aegis','Second slot restores the Guardian active');
assert.equal(p.combatPassive,'hunter','Second slot restores the original precision passive');
assert.equal(h.applyCombatLoadout(0),true,'Switching back to prior saved build works');
assert.equal(p.socketed.helm,'stored-storm','Previously saved rune socket returns on preset switch');

// Presets referencing sold or fused items must fail atomically.
p.inventory=p.inventory.filter(g=>g.id!=='starterhelm');
const stable={doctrine:p.combatDoctrine,passive:p.combatPassive,equipped:JSON.stringify(p.equipped),socketed:JSON.stringify(p.socketed)};
assert.equal(h.loadoutReadiness(0).reason,'EQUIPMENT MISSING','Sold gear is detected before applying any part of a build');
assert.equal(h.applyCombatLoadout(0),false,'Missing equipment blocks entire preset');
assert.equal(p.combatDoctrine,stable.doctrine,'Failed preset never partially changes active doctrine');
assert.equal(p.combatPassive,stable.passive,'Failed preset never partially changes passive');
assert.equal(JSON.stringify(p.equipped),stable.equipped,'Failed preset leaves equipped items unchanged');
assert.equal(JSON.stringify(p.socketed),stable.socketed,'Failed preset leaves socketed runes unchanged');
p.inventory.push({id:'starterhelm',slot:'helm',rarity:0,plus:0});
p.runes=p.runes.filter(r=>r.id!=='stored-storm');
assert.equal(h.loadoutReadiness(0).reason,'RUNE MISSING','Fused/sold runes are detected before any changes');
assert.equal(h.applyCombatLoadout(0),false,'Missing rune cannot partially apply preset');
p.runes.push({id:'stored-storm',type:'storm',tier:3});
assert.equal(h.applyCombatLoadout(0),true,'Restoring missing owned equipment makes preset available again');

// Battle lobby presents real one-tap loading of a saved preset.
h.openTab('battle');h.renderTierLobby();
let prep=v.el('milestoneList').innerHTML;
assert(prep.includes('QUICK PREPARATION'),'Battle lobby presents combat presets before launch');
assert(prep.includes('data-action="applyLoadout:1"'),'One-tap second preset control exists in real battle lobby');
p.combatDoctrine='vanguard';p.combatPassive='conductor';
const priorScroll=42;v.el('milestoneList').scrollTop=priorScroll;
v.el('milestoneList').listeners.click({target:{closest(selector){
 if(selector.includes('applyLoadout'))return {disabled:false,dataset:{action:'applyLoadout:1'}};
 return null;
}}});
assert.equal(p.combatDoctrine,'aegis','Real Battle lobby click equips the second preset');
assert.equal(p.combatPassive,'hunter','Battle quick apply restores the full passive choice');
assert.equal(v.el('milestoneList').scrollTop,priorScroll,'Battle preparation click preserves scroll position');

h.enterSiege();
const snapshot={doctrine:p.combatDoctrine,passive:p.combatPassive};
assert.equal(h.loadoutReadiness(0).reason,'BETWEEN SIEGES ONLY','Presets cannot bypass active combat preparation boundary');
assert.equal(h.applyCombatLoadout(0),false,'An in-progress siege cannot instant-swap whole loadouts');
assert.equal(p.combatDoctrine,snapshot.doctrine,'Refused mid-combat loadout leaves the active build untouched');
assert.equal(p.combatPassive,snapshot.passive,'Refused mid-combat loadout leaves the passive untouched');
h.retreatFromSiege();
assert.equal(h.loadoutReadiness(0).ready,true,'Presets become available again between sieges');
const legacy=fixture();
const prior=JSON.parse(JSON.stringify(p));prior.inventory=prior.inventory.slice();
assert.equal(legacy.h.restoreProgressBackup(prior,false),true,'Updated progress backup accepts three saved presets');
assert.equal(legacy.h.p().combatLoadouts.length,3,'All saved presets survive JSON export/import');
assert.equal(legacy.h.p().combatLoadouts[0].socketed.helm,'stored-storm','Saved rune references survive intact');
assert.equal(legacy.h.p().combatPassive,'hunter','Current equipped passive survives import');
const old={...prior};delete old.combatPassive;delete old.combatLoadouts;
legacy.h.restoreProgressBackup(old,false);
assert.equal(legacy.h.p().combatPassive,'hunter','Old saves without passive fallback safely to basic choice');
assert(legacy.h.p().combatLoadouts.every(x=>x===null),'Old saves have safe empty loadout slots');
const bad={...prior,combatPassive:'unknown',combatLoadouts:[{doctrine:'storm',passive:'unknown',equipped:{},socketed:{}},null,null]};
legacy.h.restoreProgressBackup(bad,false);
assert.equal(legacy.h.p().combatPassive,'hunter','Malformed selected passive cannot be equipped');
assert.equal(legacy.h.p().combatLoadouts[0],null,'Malformed saved build is safely ignored');
assert.throws(()=>legacy.h.validateProgressBackup({...prior,combatLoadouts:{bad:true}}),/Invalid combatLoadouts/,
 'Incorrect preset container structure is rejected by save validation');
assert.equal(h.normalizeCombatLoadouts([null,null,null,null]).length,3,'Imported presets cannot exceed three slots');
assert(html.includes('ALPHA 0.12.1')&&html.includes('game.js?v=0.12.1'),'Home Screen receives cache-busted iPhone build');
assert(css.includes('.hall-passive-grid')&&css.includes('.combat-build-grid'),'Hero Hall shows real passive and build visual sections');
assert(css.includes('grid-template-columns:1fr;gap:7px'),'Portrait selector and quick-load buttons stack legibly');
console.log('PASS: Alpha 0.11.1 one-slot passive damage and wall mechanics, three safe build presets, full owned-item validation, no duplication, iPhone quick loading, active-siege restrictions, and backwards-compatible saves.');
