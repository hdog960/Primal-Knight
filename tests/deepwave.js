// Alpha 0.10.7 — extended territory/wave simulation and save-backup integrity.
// Real game VM, actual spawning and combat ticks; no browser or external packages.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('game.js','utf8');
function world(seedValue=119,options={}){
 let seed=seedValue>>>0;
 const seededMath=Object.create(Math);
 seededMath.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const storage=Object.create(null);
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.classList={add(){},remove(){},toggle(){}};this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;this.listeners={};this.scrollTop=0;this.width=960;this.height=540;}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(obj,key){return obj[key]||(()=>{});},set(obj,key,value){obj[key]=value;return true;}});}
  addEventListener(type,callback){this.listeners[type]=callback;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const localStorage={
  getItem(key){return storage[key]??null;},
  setItem(key,value){if(options.rejectSafetyCopy&&key==='primal_knight_onslaught_pre_import_backup_v1')throw Error('Storage quota exceeded');storage[key]=String(value);},
  removeItem(key){delete storage[key];}
 };
 const sandbox={Image,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},
  window:{__PK_TEST__:true,addEventListener(){}},localStorage,Math:seededMath,Date,
  setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},
  performance:{now:()=>1000},console,confirm(){return true;},Blob,URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(code,sandbox,{filename:'game.js'});
 const h=sandbox.window.__PK_TEST_TOOLS__;
 assert(h,'Game test hooks load correctly');
 return {h,storage,localStorage,el};
}
function clone(x){return JSON.parse(JSON.stringify(x));}
const save=world(707),h=save.h;
const before=JSON.stringify(h.p());
const thirty=clone(h.p());
Object.assign(thirty,{unlockedTier:30,selectedTier:29,sigils:48932,level:310,points:29,
 highestWave:10000,highestWaveSeen:10000,battleSeconds:450000,
 bestByTier:{1:10000,16:200,17:420,29:9000,30:9875},
 milestones:{'1:10000':true,'16:20':true,'29:250':true,'30:9500':true},
 chapterChallenges:{'29:90':true,'30:94':true},
 relicHunts:{'29:132':true,'30:941':true},
 pendingRelics:[{id:'relic29_132',type:'ember',tier:9}],
 dominionCrests:{17:2,29:3,30:4},sovereignOaths:{sovereignBlade:12},
 ascension:{epoch:15,volley:4},legacy:{siegebreaker:17},firstWatchClaimed:[3,7,13,22],
});
const originalItems=clone(thirty.inventory);
assert(h.validateProgressBackup(thirty),'Real Tier XXX JSON backup passes validation');
assert.equal(h.restoreProgressBackup(thirty,true),true,'Confirmed backup is restored and saved');
assert.equal(save.storage[h.safetyBackupKey],before,'Pre-import recovery copy captures previous player progress');
assert.equal(h.hasImportRecovery(),true,'Settings can offer an undo action');
const imported=h.p();
assert.equal(imported.unlockedTier,30,'Import never clamps a Tier XXX unlock to Tier XII');
assert.equal(imported.selectedTier,29,'Current higher territory selection is preserved');
assert.equal(imported.sigils,48932,'Unspent finite Sigils are preserved exactly');
assert.equal(imported.battleSeconds,450000,'Long-term playtime rewards survive round-trip');
assert.equal(imported.bestByTier[30],9875,'Deep-wave Tier XXX record survives round-trip');
assert.equal(imported.milestones['30:9500'],true,'Deep-tier finite milestone claims survive');
assert.equal(imported.chapterChallenges['29:90'],true,'Flawless chapter ledger survives');
assert.equal(imported.relicHunts['30:941'],true,'One-time Relic Hunt ledger survives');
assert.equal(imported.pendingRelics[0].id,'relic29_132','Queued earned rune survives');
assert.equal(imported.dominionCrests[30],4,'Deep Dominion Crest ranks survive');
assert.equal(imported.sovereignOaths.sovereignBlade,12,'Sovereign Oaths survive');
assert.equal(imported.ascension.epoch,15,'Ascension skills survive');
assert.equal(JSON.stringify(imported.inventory),JSON.stringify(originalItems),'Owned equipment IDs and levels are unchanged');
assert.equal(JSON.parse(save.storage.primal_knight_onslaught_save_v1).unlockedTier,30,'Restored data is really persisted');
h.renderTierLobby();
assert(save.el('tierGrid').innerHTML.includes('TIER XXX'),'Tier XXX is available in the restored lobby');
const preserved=JSON.stringify(h.p());
for(const corrupt of [{},null,[],{inventory:[],equipped:{},training:[],unlockedTier:30},
 {inventory:[],equipped:{},training:{},milestones:[]},
 {inventory:[],equipped:{},training:{},runes:'not-an-array'},
 {inventory:[null],equipped:{},training:{}}]){
 assert.throws(()=>h.restoreProgressBackup(corrupt,true),'Invalid or incompatible backup is safely rejected');
 assert.equal(JSON.stringify(h.p()),preserved,'Bad backups never replace player progress');
}
assert.equal(h.undoProgressImport(),true,'Undo restores a saved pre-import snapshot');
assert.equal(JSON.stringify(h.p()),before,'Undo gives back the exact previous progress');
assert.equal(save.storage[h.safetyBackupKey],undefined,'Recovery copy is consumed only on successful undo');
assert.equal(h.undoProgressImport(),false,'An already consumed recovery cannot be replayed');

const guard=world(709,{rejectSafetyCopy:true}),guardBefore=JSON.stringify(guard.h.p());
assert.throws(()=>guard.h.restoreProgressBackup(thirty,true),/Storage quota/,'Import refuses to destroy a save without a safety copy');
assert.equal(JSON.stringify(guard.h.p()),guardBefore,'Storage failure keeps original progress intact');

// Pre-v3 backups still migrate equipment slots, socket IDs, currencies and legitimate unlocks.
const legacy=clone(thirty);
Object.assign(legacy,{version:2,unlockedTier:14,selectedTier:13,
 inventory:[{id:'oldbow',slot:'weapon',rarity:4,plus:20},{id:'oldcoat',slot:'armor',rarity:3,plus:12}],
 equipped:{weapon:'oldbow',armor:'oldcoat'},socketed:{weapon:'seedember',armor:'seedfortune'},
 milestones:{'13:20':true},sigils:9999});
const oldWorld=world(710),old=oldWorld.h;
assert.equal(old.restoreProgressBackup(legacy,false),true,'Legacy backup accepted');
assert.equal(old.p().version,3,'Legacy equipment is migrated on import');
assert.equal(old.p().unlockedTier,14,'Legacy tier XIII-plus territory remains unlocked');
assert.equal(old.p().equipped.amulet,'oldbow','Legacy weapon becomes an amulet without losing ID');
assert.equal(old.p().equipped.chest,'oldcoat','Legacy armor becomes chest equipment');
assert.equal(old.p().socketed.amulet,'seedember','Legacy socketed rune follows its equipped item');
assert.equal(old.p().sigils,9999,'Legacy spent/unspent currency is not reset');
assert.equal(old.p().inventory.find(x=>x.id==='oldbow').plus,20,'Legacy high gear upgrade remains intact');
assert.equal(old.p().inventory.find(x=>x.id==='oldcoat').rarity,3,'Legacy rarity remains intact');

const clampWorld=world(711),cap=clone(thirty);
cap.unlockedTier=999;cap.selectedTier=999;
clampWorld.h.restoreProgressBackup(cap,false);
assert.equal(clampWorld.h.p().unlockedTier,30,'Corrupted numeric tier is bounded at current cap');
assert.equal(clampWorld.h.p().selectedTier,30,'Selected tier is clamped to real game territories');
console.log('PASS: Tier XXX/late-wave backup restores with exact currencies, milestones, relic ledger, crests and gear; recovery/rollback, old equipment migration, input validation and quota safety.');

// Exercise the real battle loop across major difficulty breakpoints, including wave 10,000.
const seeds=[1021,2047],tiers=[1,7,13,16,17,24,30],waves=[1,20,100,250,1000,5000,10000];
let scenarios=0,bosses=0,frames=0;
for(const seed of seeds)for(const tier of tiers)for(const wave of waves){
 const {h}=world(seed+tier*10037+wave),run=h.run(),p=h.p();
 run.tier=tier;run.wave=wave;run.maxHealth=h.maxWall();run.health=run.maxHealth;
 h.beginWave();
 const spec=h.encounterDirector(wave,tier);
 assert.equal(run.encounter.kind,spec.kind,'Actual battle uses deterministic encounter director');
 assert(run.total>=1&&run.total<=24,'Deep-wave spawn count never exceeds the mobile 24-enemy cap');
 const reserved=run.total;
 for(let i=0;i<reserved;i++){run.spawned=i;h.spawnEnemy();}
 run.spawned=reserved;
 assert.equal(run.enemies.length,reserved,'All scheduled enemies spawn without overflow');
 const seenBoss=run.enemies.filter(e=>e.isBoss);
 if(spec.bossType){assert.equal(seenBoss.length,1,'Exactly one chapter/elite commander spawns');bosses++;}
 else assert.equal(seenBoss.length,0,'Nonboss waves never spawn a fake boss');
 for(const e of run.enemies){
  for(const key of ['x','y','hp','max','speed','armor'])assert(Number.isFinite(e[key])&&e[key]>=0,'Spawned high-wave '+key+' must be finite');
  assert(e.x>=120&&e.x<=850&&e.y>=115&&e.y<=195,'All encounters arrive inside the battlefield');
 }
 for(let step=0;step<80;step++){
  if(run.phase!=='fighting')break;
  h.tick(.05);frames++;
  assert(Number.isFinite(run.health)&&Number.isFinite(run.time),'Deep-wave simulation stays numerically stable');
  assert(run.enemies.length<=24,'Enemies stay inside the 24-actor pool');
  assert(run.shots.length<=48,'Projectile pool stays at or below 48');
  assert(run.particles.length<=140,'Particle pool stays at or below 140');
  assert(run.floats.length<=28,'Floating combat text pool stays at or below 28');
 }
 assert(Number.isFinite(p.gold)&&Number.isFinite(p.knowledge)&&Number.isFinite(p.essence),'Player resources remain finite in extreme waves');
 scenarios++;
}
assert.equal(scenarios,seeds.length*tiers.length*waves.length);
console.log('PASS: '+scenarios+' seeded full-spawn siege simulations, '+bosses+' bosses, '+frames+' actual combat ticks across 7 tiers and 7 wave checkpoints, bounded actors/shots/particles and finite progression.');
