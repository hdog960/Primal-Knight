// Alpha 0.13.1 — actual frontline breach UI and canvas marker, no gameplay rewrites.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const storage=Object.create(null),nodes=new Map(),draws=[];
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.innerHTML='';this.textContent='';this.hidden=id==='deviceCheckPanel'||id==='worldAtlas';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){const ctx={fillStyle:'',strokeStyle:'',createLinearGradient(){return{addColorStop(){}}},fillRect(x,y,w,h){if(this.fillStyle==='#4d3029'&&w===2&&h===5)draws.push([x,y]);}};return new Proxy(ctx,{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(){}querySelectorAll(){return [];}querySelector(){return null;}setAttribute(k,v){this.attrs[k]=String(v);}
}
const get=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;}}
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:get,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=String(v);},removeItem(k){delete storage[k];}},
 setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},performance:{now(){return 1000;}},URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(src,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),run=h.run();
const saved=JSON.stringify(p),priorStorage=JSON.stringify(storage);
assert(html.includes('ALPHA 0.13.1')&&html.includes('game.js?v=0.13.1')&&html.includes('style.css?v=0.13.1'));
assert(css.includes('.encounter-ribbon[data-breach="true"]'));
assert.equal(h.frontlineBreachRisk(),null,'No proximity warning outside fighting');
const make=(x,y,extras={})=>({x,y,type:'goblin',hp:100,max:100,dead:false,...extras});
run.phase='fighting';run.speed=1;run.tier=1;run.wave=35;run.encounter=h.encounterDirector(35,1);run.maxHealth=100;run.health=100;
let a=make(220,365),b=make(700,399),c=make(480,385),d=make(300,405,{dead:true});
run.enemies=[a,b,c,d];
let risk=h.frontlineBreachRisk();
assert.strictEqual(risk.enemy,b,'Highest active y is true nearest-to-wall enemy');
assert.equal(risk.lane,'RIGHT');assert.equal(risk.critical,true);assert.equal(risk.count,3);
assert(risk.text.includes('BREACH IMMINENT · RIGHT FLANK · 3 FOES'));
h.refreshHUD();
assert.equal(get('encounterRibbon').dataset.breach,'true');
assert.equal(get('encounterRibbon').dataset.threat,'false');
assert.strictEqual(h.frontlineFocus(),b,'Real leading enemy is selected for painting');
assert.equal(get('encounterHint').textContent,risk.text);
assert.equal(get('encounterHint').hidden,false);
for(const [x,lane] of [[369,'LEFT'],[370,'CENTER'],[590,'CENTER'],[591,'RIGHT']]){
 b.x=x;assert.equal(h.frontlineBreachRisk().lane,lane,'Lane boundary matches world-canvas position');
}
b.x=700;b.y=395;assert.equal(h.frontlineBreachRisk().critical,true,'Critical threshold begins at 395');
b.y=394.9;assert.equal(h.frontlineBreachRisk().critical,false);assert(h.frontlineBreachRisk().text.startsWith('BREACH WATCH'));
b.y=400;c.y=400;
assert.strictEqual(h.frontlineBreachRisk().enemy,b,'Equal depth preserves encounter array order');
b.hp=0;assert.strictEqual(h.frontlineBreachRisk().enemy,c,'Defeated unit cannot retain focus');
b.hp=100;b.dead=true;assert.equal(h.frontlineBreachRisk().count,2,'Dead units are not counted');
b.dead=false;
let boss=make(480,410,{type:'siegebeast',crushWindup:.55});
run.enemies=[a,b,c,boss];run.encounter=h.encounterDirector(25,1);
h.refreshHUD();
assert.equal(get('encounterRibbon').dataset.threat,'true','Real boss cast always outranks breach cue');
assert.equal(get('encounterRibbon').dataset.breach,'false');
assert.strictEqual(h.frontlineFocus(),null,'Field marker does not distract from active boss spell');
assert(get('encounterHint').textContent.includes('CRUSHER WINDUP'));
boss.crushWindup=0;
h.refreshHUD();assert.equal(get('encounterRibbon').dataset.breach,'true');
assert.strictEqual(h.frontlineFocus(),boss,'Boss can be leading wall threat outside special casts');
run.phase='intermission';h.refreshHUD();
assert.equal(get('encounterRibbon').dataset.breach,'false','Wave intermission clears wall danger');
assert.strictEqual(h.frontlineFocus(),null);
run.phase='fallen';h.refreshHUD();assert.strictEqual(h.frontlineFocus(),null,'Defeat clears highlight');
run.phase='fighting';run.encounter=h.encounterDirector(35,1);run.wave=35;run.enemies=[];h.refreshHUD();
assert.equal(get('encounterRibbon').dataset.breach,'false','No live enemies means no old danger');
assert.strictEqual(h.frontlineFocus(),null);
run.enemies=[];run.phase='ready';run.wave=35;run.tier=1;h.beginWave();
run.enemies=[];run.spawned=0;h.spawnEnemy();
const actual=run.enemies[0];actual.y=401;actual.x=310;run.phase='fighting';h.refreshHUD();
assert.strictEqual(h.frontlineFocus(),actual);
draws.length=0;h.draw();assert.equal(draws.length,1,'Actual painted enemy receives exactly one high contrast marker');
actual.y=200;h.refreshHUD();draws.length=0;h.draw();
assert.equal(draws.length,0,'Painting removes the marker when enemy leaves danger range');
assert.equal(JSON.stringify(p),saved,'No permanent player state changes');
assert.equal(JSON.stringify(storage),priorStorage,'HUD never saves or uploads risk telemetry');
console.log('PASS: actual wall-distance and lane readout, stable danger selection, boss spell precedence, wave cleanup and one real canvas highlight with no new saves.');
console.log('LIMIT: physical iPhone marker contrast, size and extended siege performance require player review.');
