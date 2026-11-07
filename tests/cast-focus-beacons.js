// Alpha 0.15.11 — live spell target beacon, highest threat prioritization and cleanup.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const storage=Object.create(null),elements=new Map(),paint=[];
class Element{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){const c={createLinearGradient(){return{addColorStop(){}}},fillRect(x,y,w,h){if(w===18&&h===4)paint.push({x,y,color:this.fillStyle});}};return new Proxy(c,{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(){}setAttribute(k,v){this.attrs[k]=String(v);}querySelectorAll(){return [];}querySelector(){return null;}
}
const get=id=>elements.get(id)||(elements.set(id,new Element(id)),elements.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=72;this.naturalHeight=72;}}
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},document:{getElementById:get,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=String(v);},removeItem(k){delete storage[k];}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},performance:{now(){return 1000;}},URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(src,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,run=h.run(),player=h.p(),old=JSON.stringify(player);
assert(html.includes('ALPHA 0.15.11')&&html.includes('game.js?v=0.15.11')&&html.includes('style.css?v=0.15.11'));
assert(css.includes('.encounter-ribbon[data-focus="true"]'));
assert.equal(Object.keys(h.castFocusColors).length,8,'Exactly eight existing spell-warning types have static colors');
assert.equal(h.castFocus(),null,'No target highlighted in lobby');
assert.equal(h.activeEncounterThreat(),null,'Outside real siege no spell warning');
const cases=[
 ['sapper','fuseTime',1.1,'fuse',120],
 ['siegebeast','crushWindup',.8,'crush',110],
 ['warlord','bossFuryWindup',.5,'ember',108],
 ['warlord','bossBlinkWindup',.6,'void',106],
 ['riftstalker','blinkWindup',.6,'rift',95],
 ['frostbinder','frostWindup',.6,'frost',83],
 ['thornweaver','thornWindup',.5,'thorn',80],
 ['warlord','bossWardTimer',1.3,'iron',65]
];
function unit(type,extra={}){
 return {type,dead:false,hp:100,max:100,x:480,y:385,wobble:0,speed:0,armor:0,buildup:0,
 slow:0,burn:0,golden:false,spellBreakDamage:0,crushWindup:0,bossFuryWindup:0,
 bossBlinkWindup:0,bossWardTimer:0,fuseTime:0,blinkWindup:0,frostWindup:0,thornWindup:0,
 nativeVanguard:false,relicGuardian:false,isBoss:false,bossPhase:1,...extra};
}
run.phase='fighting';run.speed=1;run.wave=35;run.tier=1;run.maxHealth=100;run.health=100;
run.encounter=h.encounterDirector(35,1);run.shots=[];run.particles=[];run.floats=[];
for(const [type,key,remaining,kind,rank] of cases){
 const candidate=unit(type,{[key]:remaining});
 run.enemies=[candidate];
 const threat=h.activeEncounterThreat();
 assert(threat&&threat.kind===kind&&threat.priority===rank,kind+' real existing threat ranking remains unchanged');
 assert.strictEqual(threat.enemy,candidate,kind+' returns the exact enemy responsible for the warning');
 assert.equal(h.castFocusActive(candidate,kind),true,kind+' is really casting');
 h.refreshHUD();
 assert.strictEqual(h.castFocus(),candidate,'Actual live HUD focuses chosen '+kind);
 assert.equal(h.castFocusKind(),kind);
 assert.equal(get('encounterRibbon').dataset.threat,'true');
 assert.equal(get('encounterRibbon').dataset.focus,'true');
 assert.equal(get('encounterRibbon').dataset.breach,'false');
 assert.strictEqual(h.frontlineFocus(),null,'Caster mark displaces old breach mark');
 assert.equal(get('encounterHint').textContent,threat.text,'Existing threat warning language remains');
 paint.length=0;h.draw();
 const markers=paint.filter(x=>x.color===h.castFocusColors[kind]);
 assert.equal(markers.length,1,'Exactly one static in-field enemy beacon painted for '+kind);
 assert.equal(markers[0].x,candidate.x-9,'Cast marker is placed on real sprite world x');
 candidate[key]=0;
 assert.equal(h.castFocusActive(candidate,kind),false,'Cancelled/completed cast loses active state before a HUD update');
 paint.length=0;h.draw();
 assert.equal(paint.filter(x=>x.color===h.castFocusColors[kind]).length,0,'No stale beacon painted on cancelled '+kind);
 h.refreshHUD();
 assert.strictEqual(h.castFocus(),null,'HUD clears resolved spell '+kind);
 assert.equal(get('encounterRibbon').dataset.focus,'false');
 assert.strictEqual(h.frontlineFocus(),candidate,'Existing near-wall focus resumes after spell resolves');
}
// Ranking stays identical when multiple real threats overlap.
const fuse=unit('sapper',{x:220,y:370,fuseTime:.6});
const boss=unit('siegebeast',{x:660,y:420,crushWindup:.8});
const caster=unit('frostbinder',{x:500,y:410,frostWindup:.1});
run.enemies=[caster,boss,fuse];
assert.strictEqual(h.activeEncounterThreat().enemy,fuse,'Active fuse still outranks all boss/spell warnings');
h.refreshHUD();assert.strictEqual(h.castFocus(),fuse);
fuse.fuseTime=0;assert.strictEqual(h.activeEncounterThreat().enemy,boss,'Crusher windup outranks ordinary frost spell');
h.refreshHUD();assert.strictEqual(h.castFocus(),boss);
boss.crushWindup=0;h.refreshHUD();assert.strictEqual(h.castFocus(),caster);
const fuseBack=unit('sapper',{x:180,y:390,fuseTime:.4});
const fuseFront=unit('sapper',{x:770,y:414,fuseTime:.4});
run.enemies=[fuseBack,fuseFront];
assert.strictEqual(h.activeEncounterThreat().enemy,fuseFront,'Equal threat rank chooses front-most danger');
fuseFront.y=390;
assert.strictEqual(h.activeEncounterThreat().enemy,fuseBack,'Depth ties remain stable, first in encounter order');
run.enemies=[caster];caster.dead=true;h.refreshHUD();assert.strictEqual(h.castFocus(),null,'Dead enemy never retains marker');
run.enemies=[unit('sapper',{fuseTime:1})];run.phase='intermission';h.refreshHUD();assert.strictEqual(h.castFocus(),null,'Intermission clears spell focus');
run.phase='fallen';h.refreshHUD();assert.strictEqual(h.castFocus(),null,'Defeat clears spell focus');
run.phase='fighting';run.enemies=[];h.refreshHUD();assert.strictEqual(h.castFocus(),null,'Empty wave cannot retain stale focus');
assert.equal(JSON.stringify(player),old,'Cast target visualization never changes currencies, milestones or gear');
assert.equal(Object.keys(storage).length,0,'No new save fields or local telemetry');
console.log('PASS: 8 authentic spell types, priority/tie ranking, one in-field beacon, stale-cast suppression, breach fallback, HUD cleanup, no character save writes.');
console.log('LIMIT: actual iPhone portrait/landscape legibility, touch and thermals require physical acceptance.');
