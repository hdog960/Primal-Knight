// Alpha 0.12.11 — opt-in real-loop device diagnostics, no persistence.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),
 css=fs.readFileSync('style.css','utf8');
const storage=Object.create(null),nodes=new Map(),listeners={};
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.listeners={};
  this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;
  this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;
  this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,v){this.listeners[k]=v;}
 setAttribute(k,v){this.attrs[k]=String(v);}
 removeAttribute(k){delete this.attrs[k];if(k==='src')this.src='';}
 getBoundingClientRect(){return{width:320,height:180};}
 setPointerCapture(){}
 querySelectorAll(){return[];}querySelector(){return null;}
 focus(){}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;}}
const document={hidden:false,getElementById:el,querySelectorAll(){return[]},
 addEventListener(k,f){listeners[k]=f}};
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},document,
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(game,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),run=h.run();
assert(html.includes('id="deviceCheckToggle"')&&html.includes('id="deviceCheckPanel"'));
assert(html.includes('id="deviceCheckCopy"')&&html.includes('aria-pressed="false"'));
assert(css.includes('.device-check-panel[hidden]')&&css.includes('min-height:44px'));
assert(html.includes('ALPHA 0.14.3')&&html.includes('game.js?v=0.14.3')&&html.includes('style.css?v=0.14.3'));
const before=JSON.stringify(p),savedBefore=JSON.stringify(storage);
assert.equal(el('deviceCheckPanel').hidden,true);
assert.equal(h.toggleDeviceCheck(),true);
assert.equal(el('deviceCheckPanel').hidden,false);
assert.equal(el('deviceCheckToggle').attrs['aria-pressed'],'true');
assert.equal(h.deviceCheckReport().includes('WARMING UP'),true);
run.phase='fighting';run.speed=1;el('app').dataset.view='battle';
for(let i=0;i<=120;i++)h.sampleDeviceCheck(i*1000/60,i%4===0);
const d=h.deviceCheckSnapshot();
assert.equal(d.sample.mode,'FIGHTING');
assert(d.sample.frameRate>58&&d.sample.frameRate<62,'60Hz RAF callbacks are correctly sampled');
assert(d.sample.drawRate>14&&d.sample.drawRate<17,'15Hz canvas paints are counted separately');
assert(d.activeMs>1900&&d.activeMs<2100);
assert(d.totalDraws>=30&&d.totalFrames>=120);
assert(h.deviceCheckReport().includes('Canvas paint calls are not GPU FPS'));
const activeBefore=d.activeMs;
run.speed=0;
h.sampleDeviceCheck(2200,false);h.sampleDeviceCheck(2250,false);
assert.equal(d.activeMs,activeBefore,'Pausing a siege does not count active playtime');
assert.equal(h.deviceCheckMode(),'PAUSED');
run.speed=1;
h.sampleDeviceCheck(2340,false);
assert(d.totalSlow>=2,'Slow callback gaps are counted, even without a canvas paint');
const slowBefore=d.totalSlow;
document.hidden=true;h.sampleDeviceCheck(4000,false);
assert.equal(d.totalSlow,slowBefore,'Hidden Safari wake-up gap is not misdiagnosed as stutter');
assert.equal(h.deviceCheckMode(),'HIDDEN');
document.hidden=false;
const framesBefore=d.totalFrames;const snapshotBefore=JSON.stringify(p);
assert.equal(h.toggleDeviceCheck(),false);
assert.equal(el('deviceCheckPanel').hidden,true);
assert.equal(el('deviceCheckToggle').attrs['aria-pressed'],'false');
assert.equal(h.sampleDeviceCheck(4400,true),false,'Turning off diagnostic removes callback processing');
assert.equal(h.deviceCheckSnapshot().totalFrames,0,'Turning off discards session counters');
assert.equal(framesBefore>0,true);
assert.equal(JSON.stringify(p),snapshotBefore);
assert.equal(JSON.stringify(p),before,'Diagnostics never change the permanent character');
assert.equal(JSON.stringify(storage),savedBefore,'No localStorage write or saved telemetry');
assert.equal(h.toggleDeviceCheck(),true);
assert.equal(h.deviceCheckSnapshot().totalDraws,0,'New session starts with no stale data');
assert.equal(h.deviceCheckSnapshot().totalSlow,0);
assert.equal(el('deviceCheckReadout').textContent.startsWith('SAMPLING'),true);
assert.equal(h.toggleDeviceCheck(),false);
console.log('PASS: 60Hz RAF vs 15Hz canvas paints, slow-frame gaps, pause/hidden behavior, toggle resets, on-device only, no saved progression mutation.');
console.log('LIMIT: the counters are browser callback/paint-call measurements, not compositor FPS, power draw, temperature or verified iPhone hardware metrics.');
