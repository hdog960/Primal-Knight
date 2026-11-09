// Alpha 0.15.27 shell; Alpha 0.15.27 interactive historical/replay route compass.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,f){this.listeners[k]=f;}querySelectorAll(){return [];}querySelector(){return null;}
}
function world(seed0=1526){
 let seed=seed0>>>0,rand=Object.create(Math);rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
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
 assert(box.window.__PK_TEST_TOOLS__,'Actual source must expose QA helpers');
 return {h:box.window.__PK_TEST_TOOLS__,el,store};
}
assert(html.includes('ALPHA 0.15.27'));
assert(css.includes('.veteran-route-compass button{')&&css.includes('min-height:48px'));
assert(css.includes('@media(max-width:610px){.veteran-route-compass{grid-template-columns:1fr}'));
const w=world(),h=w.h,p=h.p();
assert.equal(h.veteranRouteOrder(),'replay','Default protects previous release behavior');
assert.equal(h.setVeteranRouteOrder('fake'),false);
assert.equal(h.setVeteranRouteOrder('__proto__'),false);
p.firstWatchClaimed=Array.from({length:11},(_,i)=>i);
p.uniqueClears=474;p.battleSeconds=322*60;p.unlockedTier=4;
p.bestByTier={1:40,2:30,3:15,4:0};
const mk=(id,tier,cleared,earned)=>({
 id,reason:'retreated',tier,startWave:1,lastWave:Math.max(1,cleared+1),cleared,
 earned:{firstClears:earned}
});
p.siegeHistory=h.normalizeSiegeHistory([
 mk(1,1,40,1),
 mk(2,2,30,10),
 mk(3,3,15,2),
 mk(4,2,28,5),
 mk(5,1,25,0)
]);
const baseline=JSON.stringify(p);
assert.equal(h.veteranClearRoutes().order,'replay');
assert.deepEqual(Array.from(h.veteranClearRoutes().routes.map(x=>x.tier)),[4,3,2,1]);
assert(h.renderVeteranClearRoutes().includes('SHORTEST REPLAY'));
assert(h.renderVeteranClearRoutes().includes('aria-pressed="true"'));
h.renderTierLobby();
const list=w.el('milestoneList');list.scrollTop=143;
const click=mode=>{const el={disabled:false,dataset:{veteranRouteOrder:mode}};
 list.listeners.click({target:{closest(selector){return selector==='[data-veteran-route-order]'?el:null;}}});};
click('history');
assert.equal(h.veteranRouteOrder(),'history');
assert.equal(list.scrollTop,143,'Touch switch preserves iPhone scroll position');
assert.deepEqual(Array.from(h.veteranClearRoutes().routes.map(x=>x.tier)),[2,3,1,4],
 'Prior earned first clears, then recorded attempts, not wave count');
const route=h.veteranClearRoutes();
assert.equal(route.routes[0].recent.firstClears,15);
assert.equal(route.routes[0].replayWaves,30);
assert(h.renderVeteranClearRoutes().includes('THIS IS NOT A SUCCESS FORECAST'));
assert.equal(JSON.stringify(p),baseline,'Display and sorting never mutate player state');
click('invalid');assert.equal(h.veteranRouteOrder(),'history','Unknown mode cannot alter selection');
click('replay');
assert.deepEqual(Array.from(h.veteranClearRoutes().routes.map(x=>x.tier)),[4,3,2,1]);
assert.equal(JSON.stringify(p),baseline);
assert(!Object.hasOwn(p,'veteranRouteOrder'));
assert.equal(h.selectFrontierTier(5),false,'Still impossible to unlock a locked realm by viewing routes');
// Historical statistics with no recorded outcomes remain zero, never fabricated.
p.siegeHistory=[];
assert(h.setVeteranRouteOrder('history'));
assert.deepEqual(Array.from(h.veteranClearRoutes().routes.map(x=>x.tier)),[4,3,2,1],
 'No-history fallback preserves shortest replay routes');
console.log('PASS Alpha 0.15.27: real game touch controls, actual 3-sortie first clear histories, no guessed rates, exact historic/replay order, safety bounds, no character/save mutations, responsive iPhone UI');
console.log('LIMIT: Earned combat from the original-price Chapter XII/XIII career is separately executed in first-watch-siege-pressure.');
