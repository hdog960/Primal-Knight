// Alpha 0.12.0 — first Living Territories atmosphere acceptance.
// Protect the existing illustrated backgrounds, sprites, game economy and mobile budget.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const elements=new Map();
class Element{
 constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.textContent='';this.innerHTML='';this.scrollTop=0;this.width=960;this.height=540;this.hidden=false;this.disabled=false;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(type,cb){this.listeners[type]=cb;}querySelectorAll(){return [];}querySelector(){return null;}
}
const el=id=>elements.get(id)||(elements.set(id,new Element(id)),elements.get(id));
class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
const local=Object.create(null);
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return {matches:false};}},
 document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
 localStorage:{getItem(k){return local[k]??null},setItem(k,v){local[k]=String(v)},removeItem(k){delete local[k]}},
 performance:{now:()=>1000},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(source,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(h.territoryVista&&h.drawTerritoryAtmosphere,'Actual game exposes atmosphere composition');
assert.equal(h.territoryVistas.length,30,'All thirty existing tiers have explicit atmosphere identities');
const first=h.territoryVista(1),last=h.territoryVista(30);
assert.equal(first.name,'VERDANT DAWN');assert.equal(last.name,'ORIGIN ECLIPSE');
assert.equal(h.territoryVista(-20).tier,1,'Invalid low tier safely clamps');
assert.equal(h.territoryVista(999).tier,30,'Invalid high tier safely clamps');
const names=new Set(),palette=new Set(),weather=new Set();
function render(tier,seconds,still=false){
 const events=[];let state={fillStyle:''};
 const context={
  save(){events.push(['save'])},restore(){events.push(['restore'])},
  fillRect(x,y,w,h){events.push(['rect',x,y,w,h,state.fillStyle]);},
  set fillStyle(v){state.fillStyle=v;},
  get fillStyle(){return state.fillStyle;}
 };
 const profile=h.drawTerritoryAtmosphere(context,seconds,tier,still);
 assert.equal(events[0][0],'save');
 assert.equal(events.at(-1)[0],'restore');
 const rect=events.filter(e=>e[0]==='rect');
 assert(rect.length<=19,'No more than 18 tiny weather particles and one atmospheric tint per draw');
 assert.equal(rect[0][1],0);assert.equal(rect[0][2],80);
 assert.equal(rect[0][3],960);assert.equal(rect[0][4],340);
 for(const e of rect)assert(e.slice(1,5).every(Number.isFinite),'All weather geometry stays finite');
 return {profile,events,rect};
}
for(let t=1;t<=30;t++){
 const still=render(t,17.5,true),animated=render(t,17.5,false),again=render(t,17.5,false);
 assert.equal(JSON.stringify(animated.events),JSON.stringify(again.events),'Weather motion is deterministic for identical game time');
 assert.equal(still.rect.length,1,'Reduced-motion device keeps only static atmospheric light');
 assert(animated.rect.length>=5,'Every tier supplies a distinct restrained weather treatment');
 assert.equal(animated.profile.tier,t);names.add(animated.profile.name);
 palette.add(animated.profile.light);weather.add(animated.profile.weather);
 assert.equal(still.profile.name,animated.profile.name,'Accessibility mode keeps a recognizable tier identity');
}
assert.equal(names.size,30,'Distinct tier names cannot silently repeat');
assert(palette.size>=7&&weather.size>=6,'Lighting and weather diversity cover different biome families');
const a=render(1,5,false),b=render(1,8,false);
assert.notEqual(JSON.stringify(a.rect.slice(1)),JSON.stringify(b.rect.slice(1)),
 'Unpaused in-game time animates the background weather');
const before=JSON.stringify(p);const previousTime=r.time;
h.renderTierLobby();
assert(el('tierDescription').textContent.includes(first.name),
 'Actual Battle selector displays the chosen region atmosphere');
assert.equal(JSON.stringify(p),before,'Previewing a tier never changes resources, gear or saves');
assert.equal(r.time,previousTime,'Weather preview does not advance battle physics');
assert(html.includes('ALPHA 0.12.4')&&html.includes('game.js?v=0.12.4')&&html.includes('style.css?v=0.12.4'),
 'iPhone Home Screen asset cache identifiers are updated');
console.log('PASS: thirty unique tier vistas, 7+ lighting and 6+ weather families, deterministic background-only pixel ambience, reduced-motion static mode, bounded 19-rectangle render, no save/economy effects.');
console.log('LIMIT: this is a first atmospheric layer using original backdrop, not 30 independently painted battlefields or real iPhone device acceptance.');
