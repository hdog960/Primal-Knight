// Alpha 0.15.3 — actual specialist danger timers and interruption progress.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),
 css=fs.readFileSync('style.css','utf8');
const store=Object.create(null),nodes=new Map();let images=0;
class Element{
 constructor(id){this.id=id;this.style={};this.dataset={};this.listeners={};this.attrs={};
  this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;
  this.height=540;this.disabled=false;this.hidden=['worldAtlas','specialistAlert','deviceCheckPanel'].includes(id);
  this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{
  get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(type,cb){this.listeners[type]=cb}
 querySelectorAll(){return []}querySelector(){return null}focus(){}
}
const el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
class Image{constructor(){images++;this.complete=true;this.naturalWidth=960;this.naturalHeight=540;this.src=''}}
const sandbox={Math,Date,Blob,Image,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(source,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,run=h.run(),p=h.p();
assert(html.includes('ALPHA 0.15.3')&&html.includes('game.js?v=0.15.3')&&html.includes('style.css?v=0.15.3'));
assert(html.includes('id="specialistAlert"')&&html.includes('id="specialistAlertTime"')&&html.includes('id="specialistAlertBreak"'));
assert(html.includes('aria-label="Live enemy casting and interruption progress"')&&html.includes('aria-live="off"'));
assert(css.includes('.encounter-ribbon .specialist-alert[hidden]')&&css.includes('.specialist-alert-tracks'));
const saved=JSON.stringify(p),imagesBefore=images;
assert.equal(h.currentSpecialistAlert(),null,'No warning outside combat');
function unit(type,rest={}){return{type,hp:100,max:100,y:200,dead:false,spellBreakDamage:0,
 fuseTime:0,blinkWindup:0,frostWindup:0,thornWindup:0,...rest};}
assert.equal(h.specialistTelegraph(unit('shaman')),null,'Normal support casters have no false urgent warning');
assert.equal(h.specialistTelegraph(unit('sapper',{fuseTime:0})),null,'Spent fuse is not an active warning');
assert.equal(h.specialistTelegraph(unit('frostbinder',{frostWindup:.4,hp:0})),null,'Defeated enemy has no warning');
assert.equal(h.specialistTelegraph(unit('thornweaver',{thornWindup:Infinity})),null,'Invalid timer cannot render NaN');
const sapper=unit('sapper',{fuseTime:1,spellBreakDamage:9,y:218});
const rift=unit('riftstalker',{blinkWindup:.25,spellBreakDamage:11,y:250});
const frost=unit('frostbinder',{frostWindup:.48,spellBreakDamage:4,y:210});
const thorn=unit('thornweaver',{thornWindup:.45,spellBreakDamage:2,y:240});
const shapes=[sapper,rift,frost,thorn];
for(const [n,u]of shapes.entries()){
 const data=h.specialistTelegraph(u);
 assert(data&&Number.isFinite(data.castPct)&&Number.isFinite(data.breakPct));
 assert(data.castPct>=0&&data.castPct<=100&&data.breakPct>=0&&data.breakPct<=100);
 assert(Number.isFinite(data.remaining)&&data.remaining>0);
}
run.phase='fighting';run.speed=1;run.wave=25;run.tier=2;run.encounter=h.encounterDirector(25,2);
run.enemies=shapes;run.shots=[];run.particles=[];run.floats=[];
let selected=h.currentSpecialistAlert();
assert.equal(selected.kind,'fuse','Sapper explosive outranks concurrent threats');
assert.equal(selected.count,4,'All simultaneously active casts are counted');
assert.equal(selected.breakPct,50,'Interrupt progress uses the same 18% HP threshold as actual combat');
assert(Math.abs(selected.castPct-100*(1-1/1.3))<.0001);
h.refreshHUD();
assert.equal(el('specialistAlert').hidden,false);
assert.equal(el('specialistAlert').dataset.kind,'fuse');
assert.equal(el('specialistAlertTitle').textContent,'SAPPER FUSE');
assert.equal(el('specialistAlertTime').textContent,'1.0s LEFT · 4 CASTS');
assert.equal(el('specialistAlertBreak').textContent,'BREAK 50%');
assert.equal(el('specialistAlertCastFill').style.width,selected.castPct.toFixed(1)+'%');
assert.equal(el('specialistAlertBreakFill').style.width,'50.0%');
assert.equal(h.specialistCounterplay(sapper,9),true,'Existing damage threshold actually interrupts a fuse');
assert.equal(sapper.fuseTime,0);
assert.equal(h.specialistTelegraph(sapper),null,'Interrupted fuse exits HUD');
selected=h.currentSpecialistAlert();
assert.equal(selected.kind,'rift','Next-priority active blink takes focus');
assert.equal(selected.count,3);
h.refreshHUD();
assert.equal(el('specialistAlert').dataset.kind,'rift');
assert.equal(el('specialistAlertBreak').textContent,'BREAK 50%','Rift uses its 22% HP break threshold');
rift.blinkWindup=0;
selected=h.currentSpecialistAlert();
assert.equal(selected.kind,'frost');
assert.equal(selected.count,2);
frost.frostWindup=0;selected=h.currentSpecialistAlert();assert.equal(selected.kind,'thorn');
thorn.thornWindup=0;
assert.equal(h.currentSpecialistAlert(),null);
h.refreshHUD();
assert.equal(el('specialistAlert').hidden,true,'Warning disappears immediately on completed/interrupted casts');
sapper.fuseTime=.2;sapper.hp=0;
assert.equal(h.currentSpecialistAlert(),null,'Dead specialists do not leave phantom warnings');
sapper.hp=100;sapper.fuseTime=.2;
run.phase='intermission';h.refreshHUD();
assert.equal(el('specialistAlert').hidden,true,'No stale alerts between waves');
run.phase='fallen';h.refreshHUD();
assert.equal(el('specialistAlert').hidden,true,'No stale alerts after defeat');
assert.equal(JSON.stringify(p),saved,'Live visual warning never changes saved currency, runes, progress or milestones');
assert.equal(images,imagesBefore,'Warning HUD never allocates images or SVG assets');
assert.equal(Object.keys(store).length,0,'Warning HUD never writes localStorage');
console.log('PASS: four specialists, real interrupt thresholds, priority, cast countdown, multi-caster count, HUD update/hide, pause/end, mobile style, save integrity.');
console.log('LIMIT: actual iPhone portrait/landscape appearance and thermal performance still need physical testing.');
