// Alpha 0.15.21 — real-device endurance telemetry logic (synthetic RAF time).
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const store=Object.create(null),nodes=new Map(),listeners={};
class Element{
 constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.textContent='';this.innerHTML='';this.scrollTop=0;this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.attrs={};this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(type,cb){this.listeners[type]=cb;}setAttribute(name,value){this.attrs[name]=String(value);}
 querySelectorAll(){return [];}querySelector(){return null;}focus(){}
}
const el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=120;this.naturalHeight=120;}}
const fakeDocument={getElementById:el,querySelectorAll(){return[];},addEventListener(k,cb){listeners[k]=cb;},hidden:false};
const env={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return {matches:false};}},
 document:fakeDocument,localStorage:{getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(js,env,{filename:'game.js'});
const h=env.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.15.21')&&html.includes('game.js?v=0.15.21')&&html.includes('style.css?v=0.15.21'));
assert(html.includes('id="deviceCheckEndurance"')&&html.includes('id="deviceCheckReset"'));
assert(css.includes('.device-check-buttons')&&css.includes('#deviceCheckEndurance'));
const oldSave=JSON.stringify(p),oldStorage=JSON.stringify(store);
assert.equal(h.deviceEnduranceProgress().complete,false,'Default is not a fake completed run');
assert.equal(h.restartDeviceEndurance(),false,'Cannot restart hidden/inactive diagnostics');
assert.equal(h.toggleDeviceCheck(),true);
assert.equal(el('deviceCheckPanel').hidden,false);
assert(el('deviceCheckEndurance').textContent.includes('0:00 / 30:00'));
r.phase='fighting';r.speed=1;r.wave=35;r.tier=7;el('app').dataset.view='battle';
let stamp=0;
function sample(duration,step=200){
 const count=Math.ceil(duration/step);
 for(let i=0;i<count;i++){stamp+=step;h.sampleDeviceCheck(stamp,i%2===0);}
}
h.sampleDeviceCheck(stamp,false);
sample(5*60*1000+200);
let d=h.deviceCheckSnapshot();
assert.equal(d.checkpointCount,1,'Exactly one real five-minute checkpoint recorded');
assert.equal(d.checkpoints[0].minute,5);
assert.equal(d.checkpoints[0].tier,7);
assert.equal(d.checkpoints[0].wave,35);
assert(d.checkpoints[0].rafRate>4&&d.checkpoints[0].rafRate<6,'Callback rate grounded in synthetic RAF frequency');
assert(d.checkpoints[0].paintRate>2&&d.checkpoints[0].paintRate<3,'Paint-call frequency independent of RAF count');
assert(d.checkpoints[0].slow>=1400,'Recorded active-mode callback gaps belong to that checkpoint');
const priorMs=d.activeMs,priorCheckpoints=d.checkpointCount;
r.speed=0;sample(8000);
assert.equal(d.activeMs,priorMs,'Paused siege never advances the active-play timeline');
assert.equal(d.checkpointCount,priorCheckpoints,'Paused timer cannot manufacture checkpoints');
r.speed=1;
sample(2000);
assert(d.activeMs>priorMs,'Resuming progresses active siege time');
fakeDocument.hidden=true;
const hiddenMs=d.activeMs;stamp+=200000;h.sampleDeviceCheck(stamp,true);
assert.equal(d.activeMs,hiddenMs,'Safari background cannot inflate active time');
fakeDocument.hidden=false;
stamp+=200;h.sampleDeviceCheck(stamp,false);
assert.equal(d.activeMs,hiddenMs,'Return from background cannot inflate active time');
sample(2000);
assert(d.activeMs>hiddenMs,'Actual resumed foreground callbacks accumulate time');
assert.equal(d.checkpointCount,1);
const sessionBefore=JSON.stringify(p);
r.wave=101;r.tier=12;
sample(25*60*1000+2000);
d=h.deviceCheckSnapshot();
assert.equal(d.checkpointCount,6,'A full 30-minute session has exactly six five-minute checkpoints');
assert.equal(h.deviceEnduranceProgress().complete,true);
assert(el('deviceCheckEndurance').textContent.includes('30-MIN REVIEW READY'));
assert.equal(d.checkpoints.length,6);
assert.equal(d.checkpoints[5].minute,30);
assert.equal(d.checkpoints[5].tier,12);
assert(h.deviceCheckReport().includes('30-MIN TARGET REACHED'));
assert(h.deviceCheckReport().includes('Manual iPhone observations'));
assert(h.deviceCheckReport().includes('Canvas paint calls are not GPU FPS'));
assert(h.deviceCheckReport().includes('At 5m'));
assert(h.deviceCheckReport().includes('At 30m'));
assert(!h.deviceCheckReport().includes('Measured battery percentage:'));
sample(35*60*1000+1000);
assert(d.checkpointCount>=13,'Longer sessions keep accumulating active checkpoints');
assert.equal(d.checkpoints.length,12,'Memory remains bounded to latest twelve checkpoints');
assert(d.checkpoints[0].minute>=10,'Oldest records roll off rather than growing endlessly');
assert.equal(JSON.stringify(p),sessionBefore,'Device sampling never changes player currency, gear or progression');
assert.equal(JSON.stringify(store),oldStorage,'No session telemetry persists in local storage');
assert.equal(h.restartDeviceEndurance(),true,'Explicit RESET starts a fresh active test');
assert.equal(h.deviceCheckSnapshot().checkpointCount,0);
assert.equal(h.deviceCheckSnapshot().activeMs,0);
assert.equal(h.deviceCheckSnapshot().checkpoints.length,0);
assert(el('deviceCheckEndurance').textContent.includes('0:00 / 30:00'));
assert(h.toggleDeviceCheck()===false);
assert(el('deviceCheckPanel').hidden);
assert.equal(h.deviceCheckSnapshot().checkpointCount,0,'Disabling FPS discards all session reports');
assert.equal(JSON.stringify(p),oldSave,'Permanent character save remains byte-for-byte unchanged');
console.log('PASS: five-minute checkpoint timing, six checkpoint 30-minute completion, 12-entry memory cap, pause/background exclusions, real RAF/paint counts, reset, copyable report, iPhone CSS and unchanged character save.');
console.log('LIMIT: synthetic timestamps prove telemetry logic only; physical iPhone temperature, battery and rendered FPS still need player observation.');
