// Alpha 0.14.2: finite territorial Atlas Seal mastery, live stats and old-save recovery.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const saved=Object.create(null),nodes=new Map();
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=String(v);}
 querySelectorAll(){return [];}querySelector(){return null;}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=128;this.naturalHeight=128;}}
const ctx={Math,Date,Image,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return saved[k]??null;},setItem(k,v){saved[k]=String(v);},removeItem(k){delete saved[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(js,ctx,{filename:'game.js'});
const h=ctx.window.__PK_TEST_TOOLS__;let p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.14.2')&&html.includes('game.js?v=0.14.2')&&html.includes('style.css?v=0.14.2'));
assert(css.includes('.atlas-seal-entry'));
assert.equal(h.atlasSealObjectiveCount,6);
assert.equal(h.atlasSealBonusPerRealm,.0025);
assert.equal(h.atlasSealCount(),0);
assert.equal(h.atlasSealProgress(0),null);
assert.equal(h.atlasSealProgress(31),null);
assert.equal(h.atlasSealProgress(1.5),null);
assert.equal(h.atlasSealBanner(31),null);
assert.equal(h.reconcileAtlasSeals(),0,'Fresh character receives no false masteries');
const names=new Set();
for(let tier=1;tier<=30;tier++){
 const progress=h.atlasSealProgress(tier);
 assert.equal(progress.total,0);assert.equal(progress.signals,0);assert.equal(progress.complete,false);
 assert.equal(h.atlasSealEligible(tier),false);
 assert.equal(h.atlasSealBanner(tier),'Atlas Keeper of '+h.cartographerOath(tier).banner.slice('Cartographer of '.length));
 names.add(h.atlasSealBanner(tier));
 const charter=h.renderLostSignalLedger(tier,1);
 assert(charter.includes('ATLAS SEAL · 0 / 6 OBJECTIVES'));
 assert(charter.includes('REVISIT TO COMPLETE'));
}
assert.equal(names.size,30);
const oldGold=p.gold,oldSigils=p.sigils,oldKnowledge=p.knowledge,oldEssence=p.essence,oldPoints=p.points;
const sealsBefore=p.banners.length;
const baseDamage=h.damage();
p.training.fort=500;
const baseWall=h.maxWall();
// One missing item in a real tier must never create a seal.
for(const w of h.lostSignalWaves)p.explorationFinds['1:'+w]=true;
p.cartographerOaths[1]=true;
assert.equal(h.atlasSealProgress(1).total,5);
assert.equal(h.atlasSealEligible(1),false);
assert.equal(h.awardAtlasSeals(),0);
assert.equal(h.atlasSealBonus(),0);
assert(h.renderLostSignalLedger(1,1).includes('ATLAS SEAL · 5 / 6 OBJECTIVES'));
// Finish the sixth requirement through a genuine wave-117 SCOUT Echo Return kill.
p.bestByTier[1]=250;p.milestones['1:100']=true;p.milestones['1:250']=true;
r.phase='ready';r.tier=1;r.wave=117;r.explorationEnabled=true;
h.beginWave();
assert(r.echoCurrent,'Echo Return must be real and active in an eligible territory');
for(let i=0;i<r.total;i++){r.spawned=i;h.spawnEnemy();}
r.spawned=r.total;
assert.equal(r.enemies.filter(e=>e.echoRole).length,2);
for(const enemy of r.enemies){if(enemy.echoRole)h.hurt(enemy,enemy.max*100,'arcane');else enemy.dead=true;}
assert.equal(r.echoDefeatedMask,3);
r.health=r.maxHealth*.75;r.breaches=0;
h.completeWave();
assert.equal(p.echoReturns[1],true,'Real Echo challenge was claimed');
assert.equal(p.atlasSeals[1],true,'A genuine sixth objective seals the realm automatically');
assert.equal(h.atlasSealCount(),1);
assert.equal(h.atlasSealBonus(),.0025);
assert.equal(p.banners.length,sealsBefore+1);
assert(p.banners.includes('Atlas Keeper of '+h.cartographerOath(1).banner.slice('Cartographer of '.length)));
assert.equal(p.gold>=oldGold,true); // normal combat gold is preserved
assert.equal(p.sigils,oldSigils,'No Sigils granted by seal');
const pointsAfterCombat=p.points;
assert(pointsAfterCombat>=oldPoints,'Genuine normal combat may legitimately level up the hero');
const earnedSeal=p.atlasSeals[1];p.atlasSeals[1]=false;
const unsealedDamage=h.damage(),unsealedWall=h.maxWall();
p.atlasSeals[1]=earnedSeal;
assert(h.damage()>unsealedDamage,'Atlas Seal improves the real damage formula');
assert(h.maxWall()>unsealedWall,'Atlas Seal improves the real fortress HP formula');
assert(h.damage()>baseDamage,'Normal combat and earned mastery improve damage');
assert(h.maxWall()>baseWall,'Mastery retains earlier training bonuses');
assert(h.renderLostSignalLedger(1,100).includes('ATLAS SEAL · 6 / 6 OBJECTIVES'));
assert(h.renderLostSignalLedger(1,100).includes('ATLAS KEEPER BANNER'));
h.renderTierLobby();
assert(el('tierGrid').innerHTML.includes('ATLAS SEALED'));
assert(h.renderHeroHall().includes('ATLAS SEALS'));
assert.equal(h.reconcileAtlasSeals(),0,'Repeated render and load must not mint another title');
assert.equal(h.awardAtlasSeals(),0,'An already completed realm never repeats');
assert.equal(p.banners.filter(n=>n.startsWith('Atlas Keeper of ')).length,1);
// All 30 tiers independently earned from existing finite objectives, with capped benefit.
for(let tier=2;tier<=30;tier++){
 for(const wave of h.lostSignalWaves)p.explorationFinds[tier+':'+wave]=true;
 p.cartographerOaths[tier]=true;p.echoReturns[tier]=true;
 assert.equal(h.atlasSealEligible(tier),true);
}
assert.equal(h.reconcileAtlasSeals()>0,true);
assert.equal(h.atlasSealCount(),30);
assert.equal(h.atlasSealBonus(),.075);
assert.equal(p.banners.filter(n=>n.startsWith('Atlas Keeper of ')).length,30);
assert.equal(h.reconcileAtlasSeals(),0);
assert.equal(p.sigils,oldSigils);
assert.equal(p.points,pointsAfterCombat,'No extra skill points from seal reconciliation');
assert.equal(h.atlasSealCount(),30,'Exactly thirty mastery positions exist');
// Validate and save back the new ledger, without losing old rewards or item provenance.
const backup=JSON.parse(JSON.stringify(p));
assert.equal(h.validateProgressBackup(backup),true);
assert.equal(h.restoreProgressBackup(backup),true);
p=h.p();
assert.equal(h.atlasSealCount(),30);
assert.equal(h.atlasSealBonus(),.075);
assert.equal(h.reconcileAtlasSeals(),0);
assert.equal(p.banners.filter(n=>n.startsWith('Atlas Keeper of ')).length,30);
assert.equal(p.sigils,backup.sigils);
assert.equal(p.echoReturns[1],true);
assert.equal(p.cartographerOaths[1],true);
assert.equal(p.explorationFinds['1:47'],true);
assert(saved.primal_knight_onslaught_save_v1);
// Older backup with six claims but no Atlas ledger or banner should backfill all six.
const legacy=JSON.parse(JSON.stringify(backup));
delete legacy.atlasSeals;
legacy.banners=legacy.banners.filter(n=>!n.startsWith('Atlas Keeper of '));
assert.equal(h.restoreProgressBackup(legacy),true);
p=h.p();
assert.equal(h.atlasSealCount(),30,'Backfill all old legitimately-earned masteries');
assert.equal(p.banners.filter(n=>n.startsWith('Atlas Keeper of ')).length,30);
assert.equal(p.sigils,legacy.sigils);
assert.equal(h.reconcileAtlasSeals(),0);
// Inconsistent imports with forged seal flags but missing achievements are stripped safely.
const incomplete=JSON.parse(JSON.stringify(legacy));
incomplete.echoReturns={};incomplete.atlasSeals={'1':true,'2':true};
const savedSigils=incomplete.sigils;
assert.equal(h.restoreProgressBackup(incomplete),true);
assert.equal(h.atlasSealCount(),0,'Prerequisite-less mastery must not become permanent power');
assert.equal(h.atlasSealBonus(),0);
assert.equal(h.p().sigils,savedSigils);
assert.equal(h.atlasSealProgress(1).total,5);
assert.throws(()=>h.validateProgressBackup({...incomplete,atlasSeals:[]}),/Invalid atlasSeals/);
console.log('PASS: six-objective Atlas Seal across 30 realms, true last-objective reward, real damage/wall power, capped 7.5%, 30 equippable titles, old-save backfill, no extra Sigils/skill points and strict imported ledger validation.');
console.log('LIMIT: physical iPhone art and endurance acceptance deferred to the end of locked Alpha 0.15.');
