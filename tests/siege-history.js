// Alpha 0.15.4: saved Siege Chronicle and real earned-progress attribution.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),
      css=fs.readFileSync('style.css','utf8');
const storage=Object.create(null),nodes=new Map();
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=String(v);}
 querySelectorAll(){return [];}querySelector(){return null;}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=128;this.naturalHeight=128;}}
const sandbox={Math,Date,Image,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=String(v);},removeItem(k){delete storage[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(js,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__;let p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.15.4')&&html.includes('game.js?v=0.15.4')&&html.includes('style.css?v=0.15.4'));
assert(css.includes('.siege-history-entry'));
assert.equal(h.siegeHistoryLimit,24);
assert(Array.isArray(p.siegeHistory));assert.equal(p.siegeHistory.length,0);
assert.equal(h.siegeHistoryForTier().length,0);
assert(h.renderSiegeHistory().includes('NO RECORDED SIEGES HERE YET'));
assert(h.renderSiegeHistory(1).includes('TIER I'));
const startSave=JSON.stringify(p);
assert.equal(h.finishSiege('retreated').reason,'retreated');
assert.equal(p.siegeHistory.length,0,'Synthetic finish without actual player launch must not write history');
assert.equal(JSON.stringify(p),startSave,'History reporting itself cannot mint currency, points or rewards');
// Live gameplay launch captures legitimate before-run achievements.
h.enterSiege();
assert.equal(r.historyActive,true);assert.equal(r.historyWritten,false);
assert.equal(r.startWave,1);assert.equal(r.tier,1);
const oldMilestones=Object.keys(p.milestones).filter(k=>p.milestones[k]).length;
const beforeUnique=p.uniqueClears;
// Complete an actual combat wave with an already defined one-time milestone.
r.wave=20;r.phase='fighting';r.encounter=h.encounterDirector(20,1);
r.enemiesDefeated=18;r.totalBreaches=2;r.bossVictories=1;
h.completeWave();
assert.equal(p.uniqueClears,beforeUnique+1,'Real first-time wave clear counted');
assert.equal(p.milestones['1:20'],true,'Real milestone claim processed');
assert.equal(p.siegeHistory.length,0,'History is recorded at the END of a siege, not per wave');
h.retreatFromSiege();
assert.equal(p.siegeHistory.length,1);
const first=p.siegeHistory[0];
assert.equal(first.reason,'retreated');assert.equal(first.tier,1);
assert.equal(first.startWave,1);assert(first.lastWave>=20);
assert.equal(first.cleared,1);assert.equal(first.enemies,18);
assert.equal(first.breaches,2);assert.equal(first.bosses,1);
assert.equal(first.earned.firstClears,1);
assert.equal(first.earned.milestones,Object.keys(p.milestones).filter(k=>p.milestones[k]).length-oldMilestones);
assert(first.earned.milestones>=1);
assert(Number.isSafeInteger(first.finishedAt)&&first.finishedAt>0);
assert.equal(first.id,1);
assert.equal(p.siegeHistorySeq,1);
assert.equal(h.renderSiegeHistory().includes('FIRST CLEARS: 1'),true);
assert(h.renderSiegeHistory(1).includes('MILESTONES: 1'));
assert(h.renderSiegeHistory(2).includes('NO RECORDED SIEGES HERE YET'));
assert(el('milestoneList').innerHTML.includes('SIEGE ARCHIVE'));
assert.equal(h.finishSiege('retreated').reason,'retreated');
assert.equal(p.siegeHistory.length,1,'Repeated finish must not create a second record');
assert.equal(p.siegeHistorySeq,1);
assert(JSON.parse(storage.primal_knight_onslaught_save_v1).siegeHistory.length===1);
// Retreatment after zero waves is still a real attempt and tracked once.
h.enterSiege();
h.retreatFromSiege();
assert.equal(p.siegeHistory.length,2);
assert.equal(p.siegeHistory[0].earned.firstClears,0);
assert.equal(p.siegeHistory[0].earned.milestones,0);
assert.equal(p.siegeHistory[0].id,2);
// Synthetic end events while no real launch is active must never appear.
r.historyActive=false;
h.finishSiege('fallen');assert.equal(p.siegeHistory.length,2);
// Produce >24 *legitimately launched* no-wave sorties and verify bounded, newest first.
for(let i=0;i<30;i++){h.enterSiege();h.retreatFromSiege();}
assert.equal(p.siegeHistory.length,24);
assert.equal(p.siegeHistorySeq,32);
assert.equal(p.siegeHistory[0].id,32);
assert.equal(p.siegeHistory.at(-1).id,9);
assert.equal(p.siegeHistory[0].reason,'retreated');
assert.equal(h.siegeHistoryForTier(1).length,24);
assert(h.renderSiegeHistory().includes('24 RECENT / 24 MAX'));
const saved=JSON.parse(storage.primal_knight_onslaught_save_v1);
assert.equal(saved.siegeHistory.length,24);
assert.equal(saved.siegeHistorySeq,32);
// Export/import preserves exact ordered history; no currencies or milestones are altered.
const backup=JSON.parse(JSON.stringify(p));
assert.equal(h.validateProgressBackup(backup),true);
assert.equal(h.restoreProgressBackup(backup),true);
p=h.p();r=h.run();
assert.equal(p.siegeHistory.length,24);
assert.equal(p.siegeHistory[0].id,32);
assert.equal(p.siegeHistorySeq,32);
assert.equal(p.milestones['1:20'],true);
assert.equal(p.sigils,backup.sigils);
assert.equal(p.gold,backup.gold);
assert.equal(p.uniqueClears,backup.uniqueClears);
// Old character backups without the new fields do not invent historical runs.
const old=JSON.parse(JSON.stringify(backup));
delete old.siegeHistory;delete old.siegeHistorySeq;
assert.equal(h.restoreProgressBackup(old),true);
p=h.p();assert.equal(p.siegeHistory.length,0);assert.equal(p.siegeHistorySeq,0);
assert.equal(p.gold,old.gold);assert.equal(p.milestones['1:20'],true);
// Tampered imports cannot inject HTML, overflow history or forge progress.
const polluted=JSON.parse(JSON.stringify(old));
polluted.siegeHistory=[{reason:'<img src=x onerror=alert(1)>',tier:1,startWave:1,lastWave:100},
 ...Array.from({length:200},(_,i)=>({id:i+1,finishedAt:1000+i,reason:'retreated',
 tier:i%2?2:1,startWave:1,lastWave:20,cleared:20,
 earned:{milestones:i,atlasSeals:0,lostSignals:0}}))];
polluted.siegeHistorySeq=200;
assert.equal(h.restoreProgressBackup(polluted),true);
p=h.p();assert.equal(p.siegeHistory.length,24);
assert.equal(p.siegeHistory.some(e=>e.reason.includes('<')),false);
assert(!h.renderSiegeHistory().includes('<img'));
assert.equal(p.siegeHistorySeq,200);
assert.equal(h.siegeHistoryForTier(2).length,12);
assert.equal(p.sigils,polluted.sigils);
assert.equal(p.milestones['1:20'],true);
assert.throws(()=>h.validateProgressBackup({...polluted,siegeHistory:{}}),/Invalid siegeHistory/);
console.log('PASS: real 20-wave campaign milestone and first-clear history, de-duplication, 24-run cap, on-device persistence, per-tier Archive, legacy/current saves and sanitized malicious imports without new currency.');
console.log('LIMIT: no physical iPhone art/touch/endurance acceptance until locked Alpha 0.15 is complete.');
