// Alpha 0.12.16 — independent graphical presets vs unchanged siege logic.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const saveKey='primal_knight_onslaught_save_v1',visualKey='primal_knight_onslaught_visual_quality_v1';
function make(reduced=false,stored=null,denyStorage=false){
 const storage=Object.create(null),nodes=new Map(),metrics={draws:0,weatherRects:0};
 if(stored!==null)storage[visualKey]=stored;
 const listeners={};
 const context=new Proxy({
  clearRect(){metrics.draws++},
  createLinearGradient(){return{addColorStop(){}}}
 },{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});
 class El{
  constructor(id){
   this.id=id;this.style={};this.dataset={};this.attrs={};this.listeners={};
   this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';
   this.disabled=false;this.innerHTML='';this.textContent='';this.scrollTop=0;
   this.width=960;this.height=540;this.className='';
   this.classList={add(){},remove(){},toggle(){}}}
  getContext(){return context}
  addEventListener(k,f){this.listeners[k]=f}
  setAttribute(k,v){this.attrs[k]=String(v)}
  removeAttribute(k){delete this.attrs[k]}
  querySelectorAll(){return []}
  querySelector(){return null}
  focus(){}
 }
 const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=960;this.naturalHeight=540;this.src=''}}
 const document={hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(k,f){listeners[k]=f}};
 const sandbox={Math,Image,Date,Blob,console,confirm(){return true},document,
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:reduced}}},
  localStorage:{getItem(k){if(denyStorage)throw Error('Private browsing storage denied');return storage[k]??null},
   setItem(k,v){if(denyStorage)throw Error('Quota denied');storage[k]=String(v)},
   removeItem(k){delete storage[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,el,storage,metrics,document};
}
assert(html.includes('ALPHA 0.12.16')&&html.includes('game.js?v=0.12.16')&&html.includes('style.css?v=0.12.16'));
assert(css.includes('.visual-profile-options')&&css.includes('.visual-profile.selected'));
const {h,storage,metrics,el,document}=make();
const progressFingerprint=p=>{const snapshot=JSON.parse(JSON.stringify(p));delete snapshot.battleSeconds;return JSON.stringify(snapshot);};
const before=progressFingerprint(h.p()),run=h.run();
assert.equal(h.visualQualityKey,visualKey);
assert.equal(h.visualQualityMode(),'vivid','Existing saves default to original visual quality');
assert.equal(h.effectiveVisualHz(),60);
run.phase='intermission';run.speed=1;run.rewardTimer=30;el('app').dataset.view='battle';
assert(Math.abs(h.drawInterval()-1000/60)<.001);
const weatherOriginal={mist:4,rain:18,snow:15,embers:14,stars:14};
for(const [weather,count]of Object.entries(weatherOriginal))assert.equal(h.territoryWeatherCount(weather),count);
const selector=h.renderVisualSettings();
for(const id of ['vivid','balanced','saver'])assert(selector.includes('data-action="visualMode:'+id+'"'));
assert(selector.includes('aria-pressed="true"'),'Current visual choice is accessible');
assert.equal(h.setVisualQuality('invalid'),false,'Unknown choices cannot change the renderer or stored preference');
assert.equal(h.visualQualityMode(),'vivid');
assert.equal(h.setVisualQuality('balanced'),true);
assert.equal(h.visualQualityMode(),'balanced');
assert.equal(h.effectiveVisualHz(),30);
assert(Math.abs(h.drawInterval()-1000/30)<.001);
assert.equal(h.territoryWeatherCount('rain'),12);
assert.equal(h.territoryWeatherCount('mist'),3);
assert.equal(storage[visualKey],'balanced','Selected profile persists separately');
assert.equal(storage[saveKey],undefined,'Visual choice never rewrites permanent game save');
const beforeTimer=run.rewardTimer;
h.loop(1000);h.loop(1017);h.loop(1034);
assert(run.rewardTimer<beforeTimer,'Simulation advances on RAF callbacks even if balanced rendering skips canvas paint');
assert(metrics.draws>=1&&metrics.draws<=2,'Balanced renderer cannot draw on all 60Hz callbacks');
assert.equal(h.setVisualQuality('saver'),true);
assert.equal(h.effectiveVisualHz(),20);
assert.equal(h.territoryWeatherCount('rain'),7);
assert.equal(h.territoryWeatherCount('snow'),6);
assert.equal(storage[visualKey],'saver');
assert.equal(h.setVisualQuality('vivid'),true);
assert.equal(storage[visualKey],'vivid');
run.speed=0;
assert.equal(Math.round(h.drawInterval()),83,'Pause still uses 12Hz regardless of profile');
run.speed=1;
el('app').dataset.view='menu';
assert.equal(h.drawInterval(),100,'Menu remains at 10Hz');
el('app').dataset.view='battle';
document.hidden=true;
assert.equal(h.drawInterval(),Infinity,'Hidden Safari tab never paints');
document.hidden=false;
assert.equal(progressFingerprint(h.p()),before,'Visual choices do not change level, upgrades, runes, currency, or milestones; live siege time advances normally');
const reloaded=make(false,'saver');
assert.equal(reloaded.h.visualQualityMode(),'saver','A new app session reloads only the device graphics choice');
assert.equal(reloaded.h.p().unlockedTier,h.p().unlockedTier);
const invalid=make(false,'broken-profile');
assert.equal(invalid.h.visualQualityMode(),'vivid','Bad old preference safely defaults');
const motion=make(true,'vivid');
const active=motion.h.run();active.phase='intermission';active.speed=1;
motion.el('app').dataset.view='battle';
assert.equal(motion.h.effectiveVisualHz(),30,'System Reduce Motion overrides a 60Hz preference');
assert.equal(Math.round(motion.h.drawInterval()),33);
assert.equal(motion.h.setVisualQuality('saver'),true);
assert.equal(motion.h.effectiveVisualHz(),20,'Battery Saver remains lower under Reduce Motion');
const privateSafari=make(false,null,true);
assert.equal(privateSafari.h.visualQualityMode(),'vivid');
assert.equal(privateSafari.h.setVisualQuality('balanced'),true,'Profile remains usable when localStorage is blocked');
assert.equal(privateSafari.h.visualQualityMode(),'balanced');
assert(h.deviceCheckReport().includes('Visual profile: VIVID'),'Device monitor includes active visual profile and target');
console.log('PASS: Vivid 60 / Balanced 30 / Saver 20, weather density, independent 60Hz simulation, reduced motion, saved preference isolation, private Safari fallback.');
console.log('LIMIT: graphics profiles change requested canvas rate and ambient density, not measured iPhone GPU/thermal performance.');
