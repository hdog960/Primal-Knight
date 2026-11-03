// Alpha 0.10.8 — deterministic iPhone render pacing and legibility QA.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),css=fs.readFileSync('style.css','utf8'),html=fs.readFileSync('index.html','utf8');
function world(reducedMotion=false){
 const metrics={frames:0,shakes:0,requests:0};
 const canvas=new Proxy({
  createLinearGradient(){return{addColorStop(){}};},
  clearRect(){metrics.frames++;},
  translate(){metrics.shakes++;}
 },{get(obj,k){return k in obj?obj[k]:(()=>{});},set(obj,k,val){obj[k]=val;return true;}});
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.classList={add(){},remove(){},toggle(){}};
   this._html='';this.htmlWrites=0;this.textContent='';this.disabled=false;this.hidden=false;
   this.onclick=null;this.listeners={};this.width=960;this.height=540;this.scrollTop=0;}
  set innerHTML(v){this._html=v;this.htmlWrites++;}
  get innerHTML(){return this._html;}
  getContext(){return canvas;}
  addEventListener(t,cb){this.listeners[t]=cb;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const els=new Map(),el=id=>els.get(id)||(els.set(id,new Element(id)),els.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const document={getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false};
 const window={__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:reducedMotion};}};
 const sandbox={document,window,Image,Math,Date,localStorage:{getItem(){return null;},setItem(){},removeItem(){}},
  requestAnimationFrame(){metrics.requests++;},performance:{now:()=>2000},setTimeout(){return 0;},clearTimeout(){},
  console,confirm(){return true;},Blob,URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 assert(window.__PK_TEST_TOOLS__,'Actual game exposes timing hooks');
 return {h:window.__PK_TEST_TOOLS__,el,metrics,document,window};
}
const clock=world(),h=clock.h,run=h.run();
assert(Math.abs(h.drawInterval()-1000/60)<.001,'Normal battle targets at most 60 render frames per second');
assert.equal(clock.metrics.frames,0,'Startup schedules a frame rather than performing unnecessary initial paint');
// HUD resource cards should not be rebuilt six times each second when the numbers have not changed.
const resourceBox=clock.el('resources'),originalWrites=resourceBox.htmlWrites;
for(let i=0;i<30;i++)h.refreshHUD();
assert.equal(resourceBox.htmlWrites,originalWrites,'Unchanged mobile resource values avoid repeated DOM replacement');
h.p().gold+=25;h.refreshHUD();
assert.equal(resourceBox.htmlWrites,originalWrites+1,'Real earned Gold refreshes resource cards immediately');
h.refreshHUD();
assert.equal(resourceBox.htmlWrites,originalWrites+1,'Newly refreshed resources are cached');
// Rendering must not consume cosmetic effect lifetimes or simulation state.
run.phase='intermission';run.rewardTimer=10;run.speed=1;
run.particles=[{x:100,y:150,vx:30,vy:-20,life:1.5,max:1.5,color:'#e4cd9a',size:3}];
run.floats=[{x:140,y:180,text:'BOSS INTERRUPTED',color:'#ffe1ac',life:1.5}];
run.shakes=.18;run.flashes=.12;
const cosmeticBefore=JSON.stringify({particles:run.particles,floats:run.floats,shakes:run.shakes,flashes:run.flashes});
for(let i=0;i<8;i++)h.draw();
assert.equal(JSON.stringify({particles:run.particles,floats:run.floats,shakes:run.shakes,flashes:run.flashes}),cosmeticBefore,
 'Repeated high-refresh redraws do not accelerate particles, damage text, flashes or screen shake');
h.tick(.25);
assert(Math.abs(run.particles[0].life-1.25)<.00001,'Particles age using real simulated duration');
assert(Math.abs(run.particles[0].x-107.5)<.00001,'Particles move with elapsed duration');
assert(Math.abs(run.floats[0].y-(180-25.8*.25))<.0001,'Floating text moves at the same nominal 60Hz visual speed');
assert.equal(run.flashes,0,'Muzzle flash ends after 120ms regardless of refresh rate');
const pausedState=JSON.stringify({particle:run.particles[0],float:run.floats[0],shakes:run.shakes,clock:run.rewardTimer});
run.speed=0;h.tick(2);h.draw();
assert.equal(JSON.stringify({particle:run.particles[0],float:run.floats[0],shakes:run.shakes,clock:run.rewardTimer}),pausedState,
 'Pausing freezes cosmetic animation, screen shake and intermission time too');

const hi=world(),low=world();
function setup(w){
 const r=w.h.run();r.phase='intermission';r.rewardTimer=10;r.speed=1;
 r.particles=[{x:100,y:150,vx:24,vy:-25,life:1.5,max:1.5,color:'#aabbbb',size:3}];
 r.floats=[{x:140,y:180,text:'HIT',color:'#ffffff',life:1.5}];
 r.shakes=.9;r.flashes=.9;
}
setup(hi);setup(low);
for(let i=0;i<120;i++)hi.h.tick(1/120);
for(let i=0;i<30;i++)low.h.tick(1/30);
const fast=hi.h.run(),slow=low.h.run();
for(const key of ['life','x']){
 assert(Math.abs(fast.particles[0][key]-slow.particles[0][key])<.0001,'30Hz and 120Hz particle '+key+' match');
}
assert(Math.abs(fast.particles[0].y-slow.particles[0].y)<1,'Euler particle trajectory differs by under 1px across mobile refresh rates');
assert(Math.abs(fast.floats[0].life-slow.floats[0].life)<.0001,'30Hz and 120Hz floating text lasts the same game time');
assert(Math.abs(fast.floats[0].y-slow.floats[0].y)<.0001,'30Hz and 120Hz floating text moves the same distance');
assert(Math.abs(fast.rewardTimer-slow.rewardTimer)<.0001,'30Hz and 120Hz wave timer progression match');
// Actual RAF callbacks can run at 120+Hz without repainting 120 large canvas scenes.
const fps=world();
fps.h.loop(1000);assert.equal(fps.metrics.frames,1,'First frame is painted');
fps.h.loop(1008);assert.equal(fps.metrics.frames,1,'120Hz callback does not force repaint');
fps.h.loop(1017);assert.equal(fps.metrics.frames,2,'A new frame is painted after normal 60Hz interval');
fps.el('app').dataset.view='menu';
assert.equal(fps.h.drawInterval(),100,'Hidden-under-menu battlefield runs at 10Hz visual redraw rate');
fps.h.loop(1050);assert.equal(fps.metrics.frames,2,'Menu avoids unnecessary 30ms repaint');
fps.h.loop(1119);assert.equal(fps.metrics.frames,3,'Menu still refreshes the underlying battlefield periodically');
fps.document.hidden=true;assert.equal(fps.h.drawInterval(),Infinity,'Hidden Safari tab schedules no expensive canvas redraw');
fps.h.loop(1250);assert.equal(fps.metrics.frames,3,'Backgrounded page does not paint the canvas');
const reduce=world(true),reducedRun=reduce.h.run();
assert(Math.abs(reduce.h.drawInterval()-1000/30)<.001,'System reduced motion caps the visual presentation to 30Hz');
reducedRun.shakes=.2;reducedRun.flashes=.1;
reduce.h.draw();assert.equal(reduce.metrics.shakes,0,'Reduced motion suppresses battlefield camera shake');
// Static CSS coverage checks new rules without claiming physical iPhone device testing.
assert(css.includes('(orientation:portrait) and (max-width:540px)'),'Compact iPhone portrait rules exist');
assert(css.includes('.hud-top{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'),'Mobile HUD prevents the three resource blocks from overflowing narrow viewports');
assert(css.includes('.fight-actions button{min-height:44px;min-width:44px'),'Portrait battle controls meet 44px touch target guidance');
assert(css.includes('.encounter-ribbon .encounter-goal,.encounter-ribbon .encounter-hint{font-size:10px'),'Objective and attack warnings have larger text');
assert(html.includes('ALPHA 0.10.8')&&html.includes('game.js?v=0.10.8'),'Release assets are cache-busted for Safari and Home Screen updates');
console.log('PASS: Alpha 0.10.8 time-independent VFX, visual pause, 120/60/30Hz frame pacing, low-refresh menu and background behavior, DOM resource cache and iPhone HUD CSS.');
