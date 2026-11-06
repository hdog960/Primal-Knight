// Alpha 0.13.3 — real consecutive-wave Cartographer's Oath, finite banner/rune rewards.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const storage=Object.create(null),nodes=new Map();
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=String(v);}
 querySelectorAll(){return [];}querySelector(){return null;}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=128;this.naturalHeight=128;}}
const env={Math,Image,Date,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=String(v);},removeItem(k){delete storage[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(js,env,{filename:'game.js'});
const h=env.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.13.3')&&html.includes('game.js?v=0.13.3')&&html.includes('style.css?v=0.13.3'));
assert.deepEqual(Array.from(h.cartographerRouteWaves),[1001,1002,1003]);
assert.equal(h.cartographerOath(0),null);
assert.equal(h.cartographerOath(31),null);
assert.equal(h.cartographerOath(1.5),null);
assert.equal(Object.keys(p.cartographerOaths).length,0);
const ids=new Set(),banners=new Set();
for(let tier=1;tier<=30;tier++){
 const oath=h.cartographerOath(tier);
 assert.equal(oath.tier,tier);
 assert.equal(oath.start,1001);assert.equal(oath.end,1003);
 assert.equal(oath.rune.id,'cartographer_'+tier);
 assert(oath.rune.tier>=2&&oath.rune.tier<=12);
 assert(['frost','storm','ember','fortune'].includes(oath.rune.type));
 assert(oath.banner.startsWith('Cartographer of '));
 ids.add(oath.rune.id);banners.add(oath.banner);
 assert(h.renderLostSignalLedger(tier,1).includes("CARTOGRAPHER'S OATH"));
 for(let wave=1001;wave<=1003;wave++)assert.equal(h.activeCartographerOath(tier,wave,false),null);
}
assert.equal(ids.size,30);assert.equal(banners.size,30);
assert.equal(h.activeCartographerOath(1,999,true),null);
assert.equal(h.activeCartographerOath(1,1004,true),null);
// NORMAL must not stage the oath, change the director or add extra foes.
r.phase='ready';r.tier=1;r.wave=1001;r.explorationEnabled=false;
h.beginWave();
assert.equal(r.cartographerCurrent,null);
assert.equal(r.total,Math.min(24,h.waveEnemyCount(1001)));
for(let n=0;n<r.total;n++){r.spawned=n;h.spawnEnemy();}
assert.equal(r.enemies.length,r.total);
assert.equal(r.enemies.some(e=>e.discoveryWarden),false);
assert.equal(p.cartographerOaths[1],undefined);
// Entering in the middle of the three-wave interval does not fabricate stages.
r.phase='ready';r.wave=1002;r.explorationEnabled=true;r.cartographerStages=0;r.cartographerBroken=false;
h.beginWave();assert.equal(r.cartographerCurrent,null);
assert.equal(h.awardCartographerOath(),false);
// Failure at any wave prevents an in-run reward; a new siege can retry.
function startStage(tier,wave){
 r.phase='intermission';r.tier=tier;r.wave=wave;r.explorationEnabled=true;
 h.beginWave();
}
function finishStage(breaches=0){
 for(let n=0;n<r.total;n++){r.spawned=n;h.spawnEnemy();}
 r.spawned=r.total;
 assert.equal(r.enemies.length,r.total,'Oath never adds a spawned foe');
 assert(r.total<=24,'Mobile encounter cap retained');
 r.enemies.forEach(e=>{e.dead=true;});
 r.breaches=breaches;
 h.completeWave();
}
startStage(1,1001);
assert.equal(r.cartographerCurrent.step,1);
assert.equal(el('encounterType').textContent,'CARTOGRAPHER OATH');
assert(el('encounterGoal').textContent.includes('STAGE 1 / 3'));
assert.equal(h.awardCartographerOath(),false,'Cannot claim with live enemies still pending');
finishStage(0);
assert.equal(r.cartographerStages,1);
startStage(1,1002);
assert.equal(r.cartographerCurrent.step,2);
finishStage(1);
assert.equal(r.cartographerBroken,true);
startStage(1,1003);
assert.equal(r.cartographerCurrent,null,'Breach prevents third-stage credit');
finishStage(0);
assert.equal(p.cartographerOaths[1],undefined);
assert(!p.banners.includes(h.cartographerOath(1).banner));
assert(!p.runes.some(x=>x.id==='cartographer_1'));
// Restarting at the real first oath wave resets transient failure, but not the ledger.
r.phase='ready';r.wave=1001;
h.beginWave();
assert.equal(r.cartographerBroken,false);assert.equal(r.cartographerCurrent.step,1);
const beforeSigils=p.sigils,oldBannerCount=p.banners.length;
finishStage(0);
assert.equal(r.cartographerStages,1);assert.equal(p.cartographerOaths[1],undefined);
startStage(1,1002);assert.equal(r.cartographerCurrent.step,2);finishStage(0);
assert.equal(r.cartographerStages,2);assert.equal(p.cartographerOaths[1],undefined);
startStage(1,1003);assert.equal(r.cartographerCurrent.step,3);finishStage(0);
assert.equal(p.cartographerOaths[1],true,'Three consecutive flawless actual waves claim one oath');
assert.equal(p.banners.length,oldBannerCount+1,'One permanent equipable banner granted');
assert(p.banners.includes(h.cartographerOath(1).banner));
assert.equal(p.runes.filter(x=>x.id==='cartographer_1').length,1);
assert.equal(p.sigils,beforeSigils,'Oath creates no repeatable Sigils');
assert.equal(h.awardCartographerOath(),false,'Cannot claim twice');
assert.equal(h.activeCartographerOath(1,1001,true),null,'Claimed oath will not reactivate');
assert(h.renderLostSignalLedger(1,1).includes('UNIQUE BANNER & RUNE CLAIMED'));
assert(h.renderLostSignalLedger(1,1500).includes('UNIQUE BANNER & RUNE CLAIMED'));
// Second tier with a full 240-rune pouch stores exactly one deterministic reward.
p.runes=Array.from({length:240},(_,i)=>({id:'bag_'+i,type:'ember',tier:1}));
r.phase='ready';r.tier=2;r.wave=1001;r.explorationEnabled=true;
h.beginWave();finishStage(0);
startStage(2,1002);finishStage(0);
startStage(2,1003);finishStage(0);
assert.equal(p.cartographerOaths[2],true);
assert(p.banners.includes(h.cartographerOath(2).banner));
assert.equal(p.pendingRelics.filter(x=>x.id==='cartographer_2').length,1);
assert.equal(p.runes.length,240);
assert.equal(h.awardCartographerOath(),false);
const backup=JSON.parse(JSON.stringify(p));
assert.equal(h.validateProgressBackup(backup),true);
assert.equal(h.restoreProgressBackup(backup),true);
assert.equal(h.p().cartographerOaths[1],true);
assert.equal(h.p().cartographerOaths[2],true);
assert(h.p().banners.includes('Cartographer of Verdant March'));
assert(h.p().pendingRelics.some(x=>x.id==='cartographer_2'));
assert.equal(h.p().sigils,backup.sigils);
assert(storage.primal_knight_onslaught_save_v1);
// Older backups missing the additive field must import and initialize without loss.
const legacy=JSON.parse(JSON.stringify(backup));delete legacy.cartographerOaths;
assert.equal(h.restoreProgressBackup(legacy),true);
assert.equal(Object.keys(h.p().cartographerOaths).length,0);
assert.equal(h.p().milestones['2:1003'],undefined,'No forged old milestone');
console.log('PASS: 30 unique Cartographer oaths, opt-in normal isolation, 3 real consecutive waves, live HUD, failure/retry, finite banner/rune, full-bag Vault, old and new save imports, original Sigil economy.');
console.log('LIMIT: user-deferred physical iPhone review remains pending through Alpha 0.15.');
