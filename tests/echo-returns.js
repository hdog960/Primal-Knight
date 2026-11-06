// Alpha 0.14.3 — real revisit route, paired enemy kills and finite ring integrity.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const storage=Object.create(null),nodes=new Map();
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.textContent='';this.innerHTML='';this.className='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
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
assert(html.includes('ALPHA 0.14.3')&&html.includes('game.js?v=0.14.3')&&html.includes('style.css?v=0.14.3'));
assert(css.includes('.echo-return-entry')&&css.includes('data-start-mode="echo"'));
assert.equal(h.echoReturnWave,117);
assert.equal(h.echoReturn(0),null);assert.equal(h.echoReturn(31),null);assert.equal(h.echoReturn(1.5),null);
assert.equal(h.echoReturnEligible(1),false);
const names=new Set(),ids=new Set();
for(let tier=1;tier<=30;tier++){
 const e=h.echoReturn(tier);
 assert(e&&e.wave===117&&e.item.slot==='ring');
 assert.equal(e.item.id,'echo_'+tier+'_117');
 assert.equal(e.item.rarity,Math.min(7,2+Math.floor((tier-1)/5)));
 assert.equal(e.item.plus,0);
 assert(e.item.legacyName.startsWith('Memorybound Signet'));
 assert.equal(h.encounterDirector(117,tier).kind,'standard','No boss or existing special encounter overwritten');
 names.add(e.item.legacyName);ids.add(e.item.id);
 assert.equal(h.activeEchoReturn(tier,117,false),null);
 assert.equal(h.activeEchoReturn(tier,117,true),null);
}
assert.equal(names.size,30);assert.equal(ids.size,30);
assert.equal(h.echoReturnEnemies.length,2);
assert.equal(h.echoReturnEnemies[0].type,'guardian');
assert.equal(h.echoReturnEnemies[1].type,'raider');
// A player must first genuinely conquer 250 waves in that realm and own wave-100 waystone.
p.bestByTier[1]=250;
assert.equal(h.echoReturnEligible(1),false,'Record without waystone is not enough');
p.milestones['1:100']=true;p.milestones['1:250']=true;
assert.equal(h.echoReturnEligible(1),true);
assert.equal(h.activeEchoReturn(1,116,true),null);
assert.equal(h.activeEchoReturn(1,118,true),null);
assert.equal(h.activeEchoReturn(1,117,true).wave,117);
h.renderTierLobby();
assert(el('milestoneList').innerHTML.includes('data-start-mode="echo"'));
assert(el('milestoneList').innerHTML.includes('WAVE 117 · ECHO RETURN'));
assert(el('milestoneList').innerHTML.includes('REVISIT FROM THE WAVE 100 WAYSTONE'));
function startMode(mode){
 el('milestoneList').listeners.click({target:{closest(selector){return selector==='[data-start-mode]'?{dataset:{startMode:mode}}:null;}}});
}
startMode('echo');
assert.equal(h.echoStartSelected(),true);
assert.equal(h.startWaveForTier(1),100,'Real old waystone is selectable even after higher checkpoints');
assert(el('milestoneList').innerHTML.includes('REVISIT WAVE 100'));
startMode('fresh');assert.equal(h.startWaveForTier(1),1);
startMode('waystone');assert.equal(h.startWaveForTier(1),250);
startMode('echo');assert.equal(h.startWaveForTier(1),100);
// Real launch path uses the selected wave, not merely decorative text.
h.enterSiege();
assert.equal(r.wave,100);
assert.equal(r.startWave,100);
assert.equal(r.echoCurrent,null);
assert.equal(r.explorationEnabled,false,'NORMAL remains default');
// NORMAL wave 117 never spawns a special enemy even in an eligible territory.
r.phase='ready';r.wave=117;h.beginWave();
assert.equal(r.echoCurrent,null);
for(let i=0;i<r.total;i++){r.spawned=i;h.spawnEnemy();}
assert(!r.enemies.some(e=>e.echoRole),'NORMAL leaves old roster unchanged');
assert(r.total<=24);
// Actual opted-in siege with two marked roles inside original capped 24-unit wave.
function prepareWave(tier,enabled=true){
 r.phase='ready';r.tier=tier;r.wave=117;r.explorationEnabled=enabled;
 h.beginWave();
 assert.equal(r.total,Math.min(24,h.waveEnemyCount(117)));
 for(let i=0;i<r.total;i++){r.spawned=i;h.spawnEnemy();}
 r.spawned=r.total;
 assert.equal(r.enemies.length,r.total);
 return r.enemies.filter(e=>e.echoRole);
}
let special=prepareWave(1);
assert.equal(special.length,2);
assert.equal(special[0].echoRole,'shield');assert.equal(special[0].type,'guardian');
assert.equal(special[1].echoRole,'runner');assert.equal(special[1].type,'raider');
assert(special[0].max>0&&special[1].max>0&&special[1].dashClock>0);
assert.equal(el('encounterType').textContent,'ECHO RETURN');
assert(el('encounterGoal').textContent.includes('50% WALL'));
assert.equal(r.echoDefeatedMask,0);
assert.equal(h.awardEchoReturn(),false,'Cannot claim with both enemies alive');
function finishMarked(killBoth=true){
 for(const e of special){
  if(e.echoRole==='runner'&&!killBoth)continue;
  h.hurt(e,e.max*100,'arcane');
 }
 for(const e of r.enemies)if(!e.echoRole)e.dead=true;
 if(!killBoth){const remaining=special.find(x=>!x.dead);if(remaining)remaining.dead=true;}
}
finishMarked(false);
assert.equal(r.echoDefeatedMask,1);
assert.equal(h.awardEchoReturn(),false,'Only one real marked kill is insufficient');
h.completeWave();
assert.equal(p.echoReturns[1],undefined,'Artificial kill or missing second marked death gives no prize');
// A real double kill with a breach does not count.
special=prepareWave(1);finishMarked(true);
assert.equal(r.echoDefeatedMask,3);
r.health=r.maxHealth;r.breaches=1;
h.completeWave();
assert.equal(p.echoReturns[1],undefined);
// A clean victory with insufficient remaining wall is still invalid.
special=prepareWave(1);finishMarked(true);
r.health=r.maxHealth*.49;r.breaches=0;
h.completeWave();
assert.equal(p.echoReturns[1],undefined);
// Genuine qualified completion awards one actual equipable ring and never any extra Sigils.
special=prepareWave(1);finishMarked(true);
r.health=r.maxHealth*.65;r.breaches=0;
const sigils=p.sigils, before=p.inventory.length;
h.completeWave();
assert.equal(p.echoReturns[1],true);
assert(p.inventory.length>=before+1,'One earned unique ring is kept even if an ordinary loot roll also drops gear');
assert.equal(p.inventory.filter(g=>g.id==='echo_1_117').length,1,'The real finite Echo Return ring is awarded exactly once');
const ring=p.inventory.find(g=>g.id==='echo_1_117');
assert(ring&&ring.slot==='ring'&&ring.rarity===2);
assert.equal(p.sigils,sigils,'No hidden farmable Sigils');
assert.equal(h.isProtectedEchoSignet(ring),true);
assert.equal(h.canSellGear(ring),false);
const oldGold=p.gold,oldBag=p.inventory.length;
h.completeGearSale([ring]);
assert.equal(p.gold,oldGold);assert.equal(p.inventory.length,oldBag);
assert.equal(h.activeEchoReturn(1,117,true),null,'Claimed event does not respawn');
assert(h.renderLostSignalLedger(1,100).includes('MEMORYBOUND SIGNET SECURED'));
assert.equal(h.isProtectedEchoSignet({...ring,slot:'amulet'}),false);
assert.equal(h.isProtectedEchoSignet({...ring,id:'echo_0_117'}),false);
// Full normal equipment pouch redirects the second unique tier reward to existing vault.
p.bestByTier[2]=260;p.milestones['2:100']=true;p.milestones['2:250']=true;
p.inventory=p.inventory.concat(Array.from({length:200-p.inventory.length},(_,i)=>({id:'filler_'+i,slot:'helm',rarity:0,plus:0})));
assert.equal(p.inventory.length,200);
special=prepareWave(2);finishMarked(true);
r.health=r.maxHealth*.80;
const vaultBefore=p.pendingGear.length;
h.completeWave();
assert.equal(p.echoReturns[2],true);
assert.equal(p.pendingGear.length,vaultBefore+1);
assert.equal(p.pendingGear.at(-1).id,'echo_2_117');
assert.equal(p.inventory.length,200);
assert.equal(h.activeEchoReturn(2,117,true),null);
// Existing save/restore path must retain both claims and exact pending gear.
const backup=JSON.parse(JSON.stringify(p));
assert.equal(h.validateProgressBackup(backup),true);
assert.equal(h.restoreProgressBackup(backup),true);
assert.equal(h.p().echoReturns['1'],true);
assert.equal(h.p().echoReturns['2'],true);
assert(h.p().pendingGear.some(g=>g.id==='echo_2_117'));
assert.equal(h.p().sigils,backup.sigils);
assert(storage.primal_knight_onslaught_save_v1);
// Older saves without new optional ledger remain valid.
const old=JSON.parse(JSON.stringify(backup));delete old.echoReturns;
assert.equal(h.restoreProgressBackup(old),true);
assert.equal(Object.keys(h.p().echoReturns).length,0);
assert.equal(h.p().sigils,backup.sigils);
console.log('PASS: 30 late-unlocked Echo Returns, real wave-100 replay launcher, capped two-role combat and kill masks, 50% wall condition, breach failures, finite rings, protected salvage/vault, old/new imports and Sigil integrity.');
console.log('LIMIT: manual iPhone acceptance intentionally deferred through completion of Alpha 0.15.');
