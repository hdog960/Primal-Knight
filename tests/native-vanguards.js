// Alpha 0.15.13 — native territorial vanguard mechanics and save safety.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
function createWorld(){
 const nodes=new Map(),save=Object.create(null);
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.textContent='';this.innerHTML='';this.scrollTop=0;this.width=960;this.height=540;this.hidden=false;this.disabled=false;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(t,fn){this.listeners[t]=fn;}querySelectorAll(){return [];}querySelector(){return null;}
 }
 const get=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},document:{getElementById:get,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return save[k]??null;},setItem(k,v){save[k]=String(v);},removeItem(k){delete save[k]}},
 setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},performance:{now(){return 1000;}},URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(code,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,get,save};
}
const {h,get,save}=createWorld(),p=h.p();
assert.equal(h.territoryVanguards.length,30,'All thirty existing realms have a native patrol');
const names=new Set(),types=new Set(),valid=new Set(['raider','sapper','frostbinder','guardian','banneret','shaman','thornweaver','riftstalker']);
const pristine=JSON.stringify(p);
for(let tier=1;tier<=30;tier++){
 const region=h.territoryVanguard(tier);
 assert.equal(region.tier,tier);assert(region.name&&region.counter&&valid.has(region.unit));
 names.add(region.name);types.add(region.unit);
 const wave35=h.encounterDirector(35,tier);
 assert.equal(wave35.kind,'vanguard');assert.equal(h.hasNativeVanguard(wave35),true);
 assert.equal(h.encounterUnit(wave35,2),region.unit,'Native slot 2 replaces the existing unit');
 assert.equal(h.encounterUnit(wave35,8),region.unit,'Native slot 8 replaces the existing unit');
 for(const wave of [1,5,7,10,25,37,50,100,10000])assert.equal(h.hasNativeVanguard(h.encounterDirector(wave,tier)),false,'Bosses, rewards and tutorial are isolated');
 assert(h.renderEncounterIntel(tier).includes(region.name),'Battle briefing truthfully names regional threat');
}
assert.equal(names.size,30,'All patrol names are distinct');assert(types.size>=7,'Many genuinely different roles');
assert.equal(h.territoryVanguard(-5).tier,1);assert.equal(h.territoryVanguard(10000).tier,30);
assert.equal(JSON.stringify(p),pristine,'Previewing all regions never alters player state');
assert.equal(save.primal_knight_onslaught_save_v1,undefined,'No new save created by preview');
for(const tier of [1,2,3,5,9,10,20,30]){
 const world=createWorld(),g=world.h,r=g.run();r.tier=tier;r.wave=35;r.maxHealth=g.maxWall();r.health=r.maxHealth;
 g.beginWave();assert.equal(world.get('encounterType').textContent,'NATIVE VANGUARD');
 assert(world.get('encounterHint').textContent.includes(g.territoryVanguard(tier).name),'Actual battle HUD shows regional counterplay');
 for(let i=0;i<r.total;i++){r.spawned=i;g.spawnEnemy();}
 assert(r.enemies.length<=24,'Native patrols cannot increase the enemy cap');
 assert(r.enemies.every(e=>e.hp>0&&e.max===e.hp),'Actual battle mechanics construct live native enemies');
 assert(r.enemies.filter(e=>e.nativeVanguard).length<=2,'Never more than two marked natives');
 assert(r.enemies.every(e=>!e.nativeVanguard||e.type===g.territoryVanguard(tier).unit),'Gold crest only marks real native troops');
 for(const type of ['shaman','frostbinder','thornweaver','sapper','riftstalker','banneret'])
 assert(r.enemies.filter(e=>e.type===type).length<=2,'Existing specialist cap remains active');
 assert(r.enemies.filter(e=>['shaman','frostbinder','thornweaver'].includes(e.type)).length<=3,'Existing three-caster cap remains active');
 assert.equal(world.save.primal_knight_onslaught_save_v1,undefined,'Native spawns never mutate permanent saves');
}
assert(html.includes('ALPHA 0.15.13')&&html.includes('game.js?v=0.15.13')&&html.includes('style.css?v=0.15.13'),'Safari asset versions updated together');
console.log('PASS: 30 distinct regional vanguards, real capped slot replacements, live HUD and counterplay, no boss/tutorial/reward interference, no save changes.');
console.log('LIMIT: physical iPhone visual and long-session thermal acceptance remains open.');
