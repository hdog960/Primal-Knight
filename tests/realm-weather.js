// Alpha 0.15.2 — all thirty battle atmospheres and real HUD identity.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const nodes=new Map(),storage=Object.create(null);
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.listeners={};
  this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;
  this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;
  this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(t,f){this.listeners[t]=f;}
 querySelectorAll(){return [];}querySelector(){return null;}
 focus(){}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.complete=true;this.src='';this.naturalWidth=960;this.naturalHeight=540;}}
const sandbox={Math,Date,Blob,Image,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(game,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),run=h.run();
assert(html.includes('id="realmAtmosphere"')&&html.includes('aria-label="Current battlefield weather"'));
assert(css.includes('.hudbox .realm-atmosphere')&&css.includes('text-overflow:ellipsis'));
assert(html.includes('ALPHA 0.15.2')&&html.includes('game.js?v=0.15.2')&&html.includes('style.css?v=0.15.2'));
const before=JSON.stringify(p),events=[],style={fillStyle:''};
const context={save(){events.push(['save'])},restore(){events.push(['restore'])},
 fillRect(x,y,w,h){events.push(['rect',x,y,w,h,style.fillStyle])},
 set fillStyle(c){style.fillStyle=c},get fillStyle(){return style.fillStyle}};
const signatures=new Set(),patterns=new Set(),weathers=new Set();
function sample(tier,time,still=false){
 events.length=0;
 const profile=h.drawTerritoryAtmosphere(context,time,tier,still);
 const out=JSON.stringify(events);
 const rects=events.filter(x=>x[0]==='rect');
 assert.equal(events[0][0],'save');
 assert.equal(events.at(-1)[0],'restore');
 assert(rects.length<=19,'No more than 18 weather marks plus one wash');
 assert(rects.every(x=>x.slice(1,5).every(Number.isFinite)),'No NaN or Infinity enters canvas coordinates');
 assert.deepEqual(rects[0].slice(1,5),[0,80,960,340]);
 assert(rects.slice(1).every(x=>x[3]>=1&&x[4]>=1),'Every weather mark is sized to be visible');
 if(still)assert.equal(rects.length,1,'Reduced motion draws only a static tint');
 return {profile,out,rects};
}
for(let tier=1;tier<=30;tier++){
 const signature=h.territoryWeatherSignature(tier);
 signatures.add(signature);
 assert(signature.includes(' LIGHT'));
 assert(signature.includes(h.territoryVista(tier).name));
 const a=sample(tier,10),b=sample(tier,10);
 assert.equal(a.out,b.out,'A realm must draw deterministically from a fixed game timestamp');
 const still=sample(tier,11,true);
 assert.equal(still.rects.length,1);
 assert.equal(a.profile.tier,tier);
 assert(a.rects.length>1);
 patterns.add(a.out);weathers.add(a.profile.weather);
 // The actual live battlefield HUD uses the identical weather signature.
 run.tier=tier;
 h.refreshHUD();
 assert.equal(el('realmAtmosphere').textContent,signature);
 assert.equal(h.territoryWeatherSignature(),signature);
}
assert.equal(signatures.size,30,'All territories have distinct living weather labels');
assert.equal(patterns.size,30,'Every territory gets a distinct animated sky phase even when the weather family repeats');
assert.equal(weathers.size,8,'All eight weather families remain supported');
for(const type of ['mist','ash','snow','rain','embers','pollen','dust','stars'])assert(weathers.has(type));
const beforeHud=el('realmAtmosphere').textContent;
assert.equal(sample(30,Number.NaN).rects.length,15,'Nonfinite render clock falls back to zero without breaking the atmosphere');
assert.equal(el('realmAtmosphere').textContent,beforeHud,'Drawing atmosphere never mutates DOM');
for(const [weather,tier] of [['rain',5],['snow',3],['pollen',9],['stars',10],['embers',7],['ash',2],['dust',14],['mist',1]]){
 assert.equal(h.territoryVista(tier).weather,weather);
 const early=sample(tier,3),late=sample(tier,11);
 assert.notEqual(early.out,late.out,'Weather '+weather+' should move or sparkle over actual game time');
}
assert.equal(h.setVisualQuality('balanced'),true);
const balanced=sample(5,10);
assert.equal(balanced.rects.length-1,12,'Balanced reduces rain to 12 marks');
assert.equal(h.setVisualQuality('saver'),true);
assert.equal(sample(5,10).rects.length-1,7,'Battery Saver reduces rain to 7 marks');
assert.equal(sample(1,10).rects.length-1,2,'Battery Saver reduces mist to 2 bands');
assert.equal(sample(7,10,true).rects.length,1,'Reduce Motion wins over all quality modes');
assert.equal(JSON.stringify(p),before,'Weather rendering and HUD updates do not change saveable progression');
assert.equal(storage.primal_knight_onslaught_save_v1,undefined,'No character save writes from weather inspection');
console.log('PASS: 30 distinct deterministic weather signatures, 8 weather families, animated tier-seeded parallax, accessible live HUD, 19-mark cap, Reduced Motion and quality profile compatibility, zero character save mutations.');
console.log('LIMIT: physical iPhone inspection of painted layers, banner placement and long-session thermals is still required.');
