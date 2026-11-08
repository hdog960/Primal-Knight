// Alpha 0.15.22 — four authentic secret guardian archetypes, real finite-set bonuses.
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
const env={Math,Image,Date,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=String(v);},removeItem(k){delete storage[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(js,env,{filename:'game.js'});
const h=env.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.15.22')&&html.includes('game.js?v=0.15.22')&&html.includes('style.css?v=0.15.22'));
assert(css.includes('.explorer-bond')&&css.includes('.armory-explorer-bond'));
const waves=[47,147,347,747],types=['guardian','raider','warg','ogre'];
const names=['WAYFINDER SENTINEL','STAR-MAP COURIER','RELIQUARY HOWLER','CROWNLESS COLOSSUS'];
assert.equal(h.lostSignalGuardians.length,4);
assert.equal(h.explorerSetStatus().count,0);
assert.equal(h.explorerSetStatus().damage,0);
assert.equal(h.explorerSetStatus().wall,0);
assert.equal(h.explorerSetStatus().knowledge,0);
for(let tier=1;tier<=30;tier++){
 for(let i=0;i<waves.length;i++){
  const sig=h.lostSignal(tier,waves[i]);
  assert.equal(sig.guardian.type,types[i]);
  assert.equal(sig.guardian.name,names[i]);
  assert(sig.guardian.hp>0&&sig.guardian.speed>0&&sig.guardian.armor>=0);
  assert.equal(h.encounterDirector(waves[i],tier).kind,'standard');
 }
}
assert(h.renderLostSignalLedger(1,1).includes('STAR-MAP COURIER'),'Explore chart shows real role');
assert(h.renderLostSignalLedger(1,1).includes('EXPLORER HEIRLOOMS'));
r.explorationEnabled=true;
for(let i=0;i<waves.length;i++){
 r.phase='intermission';r.tier=1;r.wave=waves[i];r.breaches=0;
 h.beginWave();
 assert.equal(r.discoveryCurrent.guardian.type,types[i]);
 assert.equal(el('encounterType').textContent,'LOST SIGNAL');
 for(let n=0;n<r.total;n++){r.spawned=n;h.spawnEnemy();}
 const special=r.enemies.filter(e=>e.discoveryWarden);
 assert.equal(special.length,1,'Exactly one secret role, no new spawn slots');
 const enemy=special[0];
 assert.equal(enemy.type,types[i],'Real existing engine enemy role matches discovery variant');
 assert.equal(enemy.discoveryAspect,i,'Variant carries stable appearance identity');
 assert.equal(enemy.isBoss,false,'Secret encounter never becomes a tier milestone boss');
 assert.equal(r.enemies.length,r.total);assert(r.total<=24);
 assert(enemy.hp>0&&enemy.speed>0&&enemy.armor>=0);
 if(types[i]==='raider')assert(enemy.dashClock>0,'Courier has real raider dash ability');
 if(types[i]==='ogre')assert(h.isSiegeBoss(enemy),'Colossus uses real heavy siege enemy mechanics');
 assert.equal(el('encounterGoal').hidden,false,'Optional objective visible in live combat');
 assert(el('encounterGoal').textContent.includes(names[i]));
 assert.equal(h.awardLostSignal(),false,'Cannot claim before killing the real role');
 h.hurt(enemy,enemy.max*100,'arcane');
 assert.equal(r.discoveryWardenKilled,true);
 assert.equal(h.awardLostSignal(),true,'Completed secret role awards the original finite heirloom');
 assert.equal(p.explorationFinds['1:'+waves[i]],true);
 const gear=p.inventory.find(g=>g.id==='signal_1_'+waves[i]);
 assert(gear,'Named reward exists in normal inventory');
 assert(gear.legacyName.includes('Tier')===false||gear.legacyName.length>15);
 assert.equal(h.isProtectedExplorerHeirloom(gear),true,'One-time reward permanently protected against salvage');
 assert.equal(h.awardLostSignal(),false,'No duplicate claim after first award');
}
assert.equal(p.inventory.filter(g=>g.id.startsWith('signal_1_')).length,4);
assert(h.renderArmoryShowcase===undefined||typeof h.renderArmoryShowcase==='function');
// The two-piece damage bond works with a helmet that otherwise has no offensive contribution.
p.equipped.amulet='signal_1_147';
const damageOne=h.damage(),wallOne=h.maxWall();
assert.equal(h.explorerSetStatus().count,1);assert.equal(h.explorerSetStatus().damage,0);
p.equipped.helm='signal_1_47';
assert.equal(h.explorerSetStatus().count,2);
assert.equal(h.explorerSetStatus().damage,.04);
assert(Math.abs(h.damage()-damageOne*1.04)<1e-7,'Two matching pieces grant exactly +4% hero damage');
const wallTwo=h.maxWall();
assert(wallTwo>wallOne,'Equipped real helm contributes normal protection even without the 3-piece bond');
p.equipped.charm='signal_1_347';
assert.equal(h.explorerSetStatus().count,3);
assert.equal(h.explorerSetStatus().wall,.04);
assert(h.maxWall()>wallTwo,'Third matching piece grants bonus wall HP');
assert(h.maxWall()<wallTwo*1.051,'Wall bonus stays finite and bounded at 4%');
assert(h.explorerSetLabel().includes('3 / 4 MATCHED'));
assert(h.renderLostSignalLedger(1,1).includes('3 / 4 MATCHED'),'Live Battle charter communicates bond progress');
// A real cleared wave tests wave-income, not a fake calculation in the test.
function earnWaveKnowledge(){
 r.phase='fighting';r.wave=21;r.tier=1;r.breaches=0;r.discoveryCurrent=null;
 r.encounter=h.encounterDirector(21,1);r.enemies=[];r.shots=[];r.kills=0;r.spawned=0;
 r.maxHealth=h.maxWall();r.health=r.maxHealth;
 p.knowledge=100000;
 h.completeWave();
 return p.knowledge-100000;
}
const threePieceKnowledge=earnWaveKnowledge();
p.equipped.gauntlets='signal_1_747';
assert.equal(h.explorerSetStatus().count,4);
assert.equal(h.explorerSetStatus().knowledge,.08);
const fourPieceKnowledge=earnWaveKnowledge();
assert.equal(fourPieceKnowledge,Math.round(threePieceKnowledge*1.08),'Four-piece set increases genuinely earned per-wave Knowledge by 8%');
assert(!h.explorerSetLabel().includes('NONE ACTIVE'));
const fourPieceBackup=JSON.parse(JSON.stringify(p));
assert.equal(h.validateProgressBackup(fourPieceBackup),true);
assert.equal(h.restoreProgressBackup(fourPieceBackup),true);
assert.equal(h.explorerSetStatus().count,4,'Set bonus survives original save migration/import');
assert.equal(h.explorerSetStatus().knowledge,.08);
// Mixed territories cannot stack or fake additional bonuses.
const state=h.p();
state.inventory.push({id:'signal_2_47',slot:'helm',rarity:1,plus:0});
state.explorationFinds['2:47']=true;
state.equipped.helm='signal_2_47';
assert.equal(h.explorerSetStatus().count,3,'Mixed-tier set drops back to 3, never sums to 4');
assert.equal(h.explorerSetStatus().knowledge,0,'Knowledge bonus requires one complete same-tier set');
state.equipped.helm='signal_1_47';
assert.equal(h.explorerSetStatus().count,4);
const unique=state.inventory.find(g=>g.id==='signal_1_47');
delete state.equipped.helm;
assert.equal(h.canSellGear(unique),false,'Even unequipped finite heirloom is un-sellable');
const size=state.inventory.length,gold=state.gold;
h.completeGearSale([unique]);
assert.equal(state.inventory.length,size,'Direct sale cannot delete the only unique heirloom');
assert.equal(state.gold,gold,'Forbidden sale cannot grant Gold');
assert.equal(h.explorerSetStatus().count,3,'Unequipping genuinely removes the 4th set benefit');
assert.equal(h.canSellGear({id:'ordinary',slot:'helm',rarity:0,plus:0}),true,'Normal gear salvage remains available');
assert.equal(state.sigils,fourPieceBackup.sigils,'Heirloom system does not create or farm Sigils');
console.log('PASS: 30×4 distinct secret combat roles, real spawning/dash/siege mechanics, one-time guard rewards, non-stacking 2/3/4 set effects on real damage/wall/wave payouts, protected salvage and save compatibility.');
console.log('LIMIT: physical iPhone visual/thermal acceptance deferred by user until the locked roadmap ends.');
