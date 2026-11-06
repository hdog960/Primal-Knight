// Alpha 0.12.8 — idle, pause and Atlas rendering cadence on mobile.
'use strict';
const fs=require('fs');
const vm=require('vm');
const assert=require('node:assert/strict');
const src=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
function make(reduced=false){
 const stats={frames:0,gradients:0};
 const context=new Proxy({
  clearRect(){stats.frames++;},
  createLinearGradient(){stats.gradients++;return {addColorStop(){}};}
 },{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});
 class Element{
  constructor(id){
   this.id=id;this.dataset={};this.style={};this.listeners={};
   this.textContent='';this.innerHTML='';this.hidden=id==='worldAtlas';
   this.width=960;this.height=540;this.scrollTop=0;this.disabled=false;
   this.classList={add(){},remove(){},toggle(){}};
  }
  getContext(){return context;}
  addEventListener(name,fn){this.listeners[name]=fn;}
  querySelectorAll(){return [];}
  querySelector(){return null;}
  focus(){}
 }
 const nodes=new Map();
 const el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=960;this.naturalHeight=540;this.src='';}}
 const state={};
 const doc={getElementById:el,querySelectorAll(){return [];},addEventListener(){},hidden:false};
 const sandbox={Math,Image,Date,Blob,console,confirm(){return true;},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return {matches:reduced};}},
  document:doc,
  localStorage:{getItem(k){return state[k]??null;},setItem(k,v){state[k]=String(v);},removeItem(k){delete state[k];}},
  performance:{now(){return 1000;}},
  setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}}
 };
 vm.runInNewContext(src,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,stats,el,doc};
}
const x=make(),h=x.h,r=h.run();
assert.equal(Math.round(h.drawInterval()),83,'A static idle scene draws at 12Hz.');
h.loop(1000);assert.equal(x.stats.frames,1);
h.loop(1017);assert.equal(x.stats.frames,1,'The idle scene skips a 60Hz redraw.');
h.loop(1084);assert.equal(x.stats.frames,2);
r.phase='intermission';r.rewardTimer=30;r.speed=1;
assert.equal(Math.round(h.drawInterval()),17,'Active battle uses 60Hz.');
h.loop(1101);assert.equal(x.stats.frames,3);
const timer=r.rewardTimer;
h.loop(1109);assert.equal(x.stats.frames,3);
assert(r.rewardTimer<timer,'Simulation runs even when the canvas skips a frame.');
r.speed=0;
assert.equal(Math.round(h.drawInterval()),83,'Paused scene uses 12Hz.');
h.loop(1190);assert.equal(x.stats.frames,4);
const still=r.rewardTimer;h.loop(1200);assert.equal(r.rewardTimer,still);
r.phase='ready';
assert.equal(h.openWorldAtlas(2),true);
assert.equal(h.drawInterval(),Infinity,'Opaque Atlas suspends the underlying battle canvas.');
h.loop(1350);assert.equal(x.stats.frames,4);
assert.equal(h.closeWorldAtlas(),true);
h.loop(1450);assert.equal(x.stats.frames,5,'Closing the Atlas redraws the battlefield.');
x.el('app').dataset.view='menu';
assert.equal(h.drawInterval(),100,'Original 10Hz menu behavior is preserved.');
x.doc.hidden=true;
assert.equal(h.drawInterval(),Infinity,'Hidden Safari tab does not paint.');
x.doc.hidden=false;
for(let i=0;i<40;i++)h.draw();
assert.equal(x.stats.gradients,1,'One cached ambient gradient is reused for 40 redraws.');
const y=make(true),yr=y.h.run();
assert.equal(Math.round(y.h.drawInterval()),83,'Reduced motion also caps idle scenes.');
yr.phase='intermission';yr.speed=1;
assert.equal(Math.round(y.h.drawInterval()),33,'Reduced motion retains active 30Hz rendering.');
assert(html.includes('ALPHA 0.12.28')&&html.includes('game.js?v=0.12.28'));
console.log('PASS: active 60Hz, reduced-motion combat 30Hz, static/paused 12Hz, 10Hz menu, hidden/opaque Atlas skip, game-time continuity and cached gradient.');
