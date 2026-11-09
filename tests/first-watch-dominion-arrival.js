// Alpha 0.15.28 shell; Alpha 0.15.28 new Glassheart arrival checks.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,fn){this.listeners[k]=fn;}querySelectorAll(){return [];}querySelector(){return null;}
}
function world(seed0=1523){
 let seed=seed0>>>0,rand=Object.create(Math);
 rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null);
 const box={Math:rand,Date,Image,Blob,console,confirm(){return true;},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{hidden:false,getElementById:el,querySelectorAll(){return[];},addEventListener(){}},
 localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(game,box,{filename:'game.js'});
 assert(box.window.__PK_TEST_TOOLS__);
 return {h:box.window.__PK_TEST_TOOLS__,store};
}
assert(html.includes('ALPHA 0.15.28')&&css.includes('.dominion-arrival-note'));
assert(css.includes('@media(max-width:760px){.dominion-arrival-note{padding:12px'));
const h=world().h,f=h.outerDominionArrivalFactor;
for(const tier of [1,2,16,18,20,30])for(const wave of [1,20,21,60,99,100,101,10000])
 assert.equal(f(tier,wave),1,'Only Tier XVII arrival is changed');
assert.equal(f(17,1),.90);assert.equal(f(17,20),.90);
assert(f(17,21)>.90&&f(17,21)<f(17,99));
assert(Math.abs(f(17,60)-.95)<1e-10);
assert(f(17,99)<1&&f(17,99)>.99);
assert.equal(f(17,100),1,'Original wave-100 Tier XVIII gate challenge unchanged');
assert.equal(f(17,1000),1);assert.equal(f(17,10000),1);
const p=h.p(),prior=JSON.stringify(p);
assert.equal(h.renderDominionArrivalNotice(1),'','No unrelated Tier text');
assert(h.renderDominionArrivalNotice(17).includes('GLASSHEART PASSAGE'));
assert(h.renderDominionArrivalNotice(17).includes('10% less HP'));
assert.equal(JSON.stringify(p),prior,'No character upgrades or persistence changes');
assert(!Object.hasOwn(p,'arrivalRamp'),'No new save fields');
const fixture=world(1766),x=fixture.h,r=x.run();
r.tier=17;r.wave=20;x.beginWave();x.spawnEnemy();
assert(r.enemies.length===1,'Original enemy spawner accepts Tier XVII arrival');
const e=r.enemies[0];assert(e.hp>0&&Number.isFinite(e.armor));
assert(e.max===e.hp,'Spawned combat HP is initialized from original engine');
assert.equal(f(17,20),.9);
assert.equal(x.p().unlockedTier,1,'Synthetic test enemy cannot unlock Tier XVII');
assert.equal(x.p().uniqueClears,0);assert.equal(x.p().sigils,0);
console.log('PASS Alpha 0.15.28: bounded Tier XVII HP/armor on-ramp, original enemy spawn, unchanged wave-100 and other tiers, no grants/save schema');
console.log('LIMIT: A synthetic spawn checks formulas, not earned Tier XVII victories. Existing full original-price earned-career suite supplies separate actual results.');
