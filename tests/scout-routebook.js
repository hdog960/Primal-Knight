// Alpha 0.15.13 — real Scout Routebook mission launches from existing earned waystones.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const storage=Object.create(null),nodes=new Map();
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=String(v);}
 querySelectorAll(){return [];}querySelector(){return null;}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=128;this.naturalHeight=128;}}
const sandbox={Math,Date,Blob,Image,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=String(v);},removeItem(k){delete storage[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(js,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.15.13')&&html.includes('game.js?v=0.15.13')&&html.includes('style.css?v=0.15.13'));
assert(css.includes('.scout-routebook')&&css.includes('.scout-route-option'));
assert(css.includes('touch-action:manipulation'));
assert.deepEqual(Array.from(h.scoutRouteOptions(1).map(x=>x.wave)),[47,117,147,347,747,1001]);
assert.equal(h.scoutRouteOptions(0).length,0);
assert.equal(h.scoutRouteOptions(31).length,0);
assert.equal(h.scoutRouteOptions(1.5).length,0);
assert.equal(h.scoutRouteWaystone(0,347),null);
assert.equal(h.scoutRouteWaystone(31,347),null);
assert.equal(h.scoutRouteWaystone(1,99999),null);
assert.equal(h.scoutRouteWaystone(1,0),null);
assert.equal(h.selectedScoutRouteId(),null);
assert.equal(h.scoutSignalsSelected(),false);
const startingLedger=JSON.stringify(p.milestones),startingSigils=p.sigils;
// Thirty sets of six real missions, no invented checkpoints or currency.
for(let tier=1;tier<=30;tier++){
 const routes=h.scoutRouteOptions(tier);
 assert.equal(routes.length,6);
 assert.equal(routes.filter(x=>x.kind==='signal').length,4);
 assert.equal(routes.filter(x=>x.kind==='echo').length,1);
 assert.equal(routes.filter(x=>x.kind==='oath').length,1);
 assert.equal(routes.find(x=>x.id==='echo').locked,true);
 assert(routes.every(x=>x.start===1));
 assert(routes.every(x=>x.start<=x.wave));
 assert(routes.every(x=>!x.claimed));
 const book=h.renderScoutRoutebook(tier);
 assert(book.includes('SCOUT ROUTEBOOK'));
 assert(book.includes('AVAILABLE / 6 ROUTES')||book.includes('5 AVAILABLE / 6 ROUTES'));
 assert(book.includes('data-scout-route="signal-347"'));
 assert(book.includes('data-scout-route="oath"'));
}
assert.equal(JSON.stringify(p.milestones),startingLedger);
assert.equal(p.sigils,startingSigils);
// Earn only tier I waystones. A tier II waypoint may never be borrowed.
for(const w of [100,250,500,1000,1500])p.milestones['1:'+w]=true;
p.bestByTier[1]=1500;p.unlockedTier=2;
const routes=h.scoutRouteOptions(1),expected={47:1,117:100,147:100,347:250,747:500,1001:1000};
for(const route of routes)assert.equal(route.start,expected[route.wave],'Correct preceding earned milestone for '+route.wave);
assert.equal(h.waystoneForTier(1),1500);
assert.equal(h.startWaveForTier(1),1500,'Latest-waystone normal default unchanged');
assert.equal(h.scoutRouteWaystone(2,747),1);
assert.equal(h.scoutRouteOptions(1).find(x=>x.id==='echo').locked,false);
assert.equal(h.selectScoutRoute(1,'invalid'),false);
assert.equal(h.selectScoutRoute(1,'signal-999'),false);
assert.equal(h.selectScoutRoute(2,'signal-47'),false,'Not allowed to route a different active tier');
assert.equal(h.selectScoutRoute(1,'signal-347'),true);
assert.equal(h.selectedScoutRouteId(),'signal-347');
assert.equal(h.scoutSignalsSelected(),true);
assert.equal(h.selectedScoutRoute(1).wave,347);
assert.equal(h.startWaveForTier(1),250);
assert.equal(p.milestones['1:347'],undefined,'Route selection does not forge objective completion');
h.renderTierLobby();
assert(el('milestoneList').innerHTML.includes('data-scout-route="signal-347"'));
assert(el('milestoneList').innerHTML.includes('SCOUT ROUTE · START 250 → 347'));
assert(el('launchTierButton').textContent.includes('WAVE 250'));
assert(el('milestoneList').innerHTML.includes('aria-pressed="true"'));
const previousSave=storage.primal_knight_onslaught_save_v1||null;
function clickRoute(id,disabled=false){
 el('milestoneList').listeners.click({target:{closest(selector){
  return selector==='[data-scout-route]'?{dataset:{scoutRoute:id},disabled}:null;}}});
}
function clickStart(mode){
 el('milestoneList').listeners.click({target:{closest(selector){
  return selector==='[data-start-mode]'?{dataset:{startMode:mode}}:null;}}});
}
function clickScout(mode){
 el('milestoneList').listeners.click({target:{closest(selector){
  return selector==='[data-exploration-choice]'?{dataset:{explorationChoice:mode}}:null;}}});
}
clickRoute('signal-747');
assert.equal(h.selectedScoutRouteId(),'signal-747');
assert.equal(h.startWaveForTier(1),500);
assert.equal(storage.primal_knight_onslaught_save_v1||null,previousSave,'Changing an unsaved route does not overwrite character save');
clickStart('waystone');
assert.equal(h.selectedScoutRouteId(),null);
assert.equal(h.startWaveForTier(1),1500);
clickStart('fresh');
assert.equal(h.startWaveForTier(1),1);
clickStart('echo');
assert.equal(h.startWaveForTier(1),100,'Existing Echo Return option remains working');
clickRoute('echo');
assert.equal(h.startWaveForTier(1),100,'Routebook Echo start remains genuinely earned');
clickScout('off');
assert.equal(h.selectedScoutRouteId(),null,'NORMAL cancels the scout mission');
assert.equal(h.scoutSignalsSelected(),false);
clickRoute('oath');
assert.equal(h.startWaveForTier(1),1000);
assert.equal(h.scoutSignalsSelected(),true);
clickStart('waystone');
assert.equal(h.startWaveForTier(1),1500);
clickRoute('signal-347');
assert.equal(h.startWaveForTier(1),250);
// A real siege, not only HTML or state: SCOUT is enabled, wave starts at 250.
h.enterSiege();
assert.equal(r.tier,1);
assert.equal(r.wave,250);
assert.equal(r.startWave,250);
assert.equal(r.explorationEnabled,true);
assert.equal(p.sigils,startingSigils);
r.phase='ready';r.wave=347;
h.beginWave();
assert.equal(r.discoveryCurrent?.key,'1:347','Genuine original Lost Signal encounter must run at planned target');
assert.equal(r.total,Math.min(24,h.waveEnemyCount(347)));
for(let i=0;i<r.total;i++){r.spawned=i;h.spawnEnemy();}
r.spawned=r.total;
assert.equal(r.enemies.length,r.total);
const wardens=r.enemies.filter(e=>e.discoveryWarden);
assert.equal(wardens.length,1,'No extra enemies; real guardian substituted once');
for(const e of r.enemies){if(e.discoveryWarden)h.hurt(e,e.max*100,'arcane');else e.dead=true;}
assert.equal(r.discoveryWardenKilled,true);
r.breaches=0;r.health=r.maxHealth;
h.completeWave();
assert.equal(p.explorationFinds['1:347'],true);
assert(p.inventory.some(g=>g.id==='signal_1_347'),'Real one-time heirloom issued by existing reward system');
assert.equal(h.selectedScoutRoute(1),null,'Completed mission cannot be offered again');
assert.equal(h.selectScoutRoute(1,'signal-347'),false);
assert.equal(h.startWaveForTier(1),1500,'Stale chosen route no longer overrides normal waystone');
assert.equal(p.sigils,startingSigils,'Routing grants no bonus Sigils');
// Remaining routes stay selectable, and do not leak across tier changes.
// End the test's Tier I siege: the real UI intentionally forbids live tier changes.
h.retreatFromSiege();
clickRoute('signal-747');assert.equal(h.startWaveForTier(1),500);
// This is an explicit fixture-only Tier II unlock and tier-specific waypoint,
// not a claim of earned Tier II wave-100 combat; real unlocks are tested separately.
p.unlockedTier=Math.max(p.unlockedTier,2);p.milestones['2:100']=true;assert(h.save());
el('tierGrid').listeners.click({target:{closest(sel){
 return sel==='[data-tier]'?{dataset:{tier:'2'},disabled:false}:null;}}});
assert.equal(h.selectedScoutRouteId(),null,'Tier switch invalidates any previous route');
assert.equal(h.scoutRouteWaystone(2,747),100,'Cannot borrow tier I 500 waypoint');
assert.equal(h.startWaveForTier(2),100);
assert.equal(h.scoutSignalsSelected(),true,'Changing tier does not silently disable SCOUT');
assert.equal(h.selectScoutRoute(2,'echo'),false,'Echo locked without tier II wave-250 record');
clickRoute('signal-747');
assert.equal(h.startWaveForTier(2),100);
assert.equal(h.selectedScoutRoute(2)?.id,'signal-747');
// Backup restore resets only transient route, preserves legitimate achievements.
const backup=JSON.parse(JSON.stringify(p));
assert.equal(h.validateProgressBackup(backup),true);
assert.equal(h.restoreProgressBackup(backup),true);
assert.equal(h.selectedScoutRouteId(),null);
assert.equal(h.p().explorationFinds['1:347'],true);
assert.equal(h.p().milestones['1:1000'],true);
assert.equal(h.p().milestones['2:100'],true);
assert.equal(h.p().sigils,backup.sigils);
assert(storage.primal_knight_onslaught_save_v1);
console.log('PASS: 30×6 Routebook missions, nearest strictly earned checkpoints, 147/347/747/1001 navigation, real SCOUT wave launch, capped guardian and true heirloom, controls/normal mode, tier isolation and save compatibility.');
console.log('LIMIT: iPhone touch, art and thermal acceptance deferred until the locked Alpha 0.15 development work finishes.');
