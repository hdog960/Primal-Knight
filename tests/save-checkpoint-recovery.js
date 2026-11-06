// Alpha 0.14.7 — honest two-copy save recovery, checksum, quota and legacy import.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),
      css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1',
      CK='primal_knight_onslaught_checkpoint_v1';
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=String(v);}
 querySelectorAll(){return [];}querySelector(){return null;}
}
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=128;this.naturalHeight=128;}}
function boot(store={},blockedKey=null){
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 const localStorage={
  getItem(k){return Object.hasOwn(store,k)?store[k]:null;},
  setItem(k,value){if(k===blockedKey)throw Error('QuotaExceededError');
   store[k]=String(value);},
  removeItem(k){delete store[k];}
 };
 const ctx={Math,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
  document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
  localStorage,performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},
  requestAnimationFrame(){},URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(js,ctx,{filename:'game.js'});
 return {h:ctx.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.14.7')&&html.includes('game.js?v=0.14.7')&&html.includes('style.css?v=0.14.7'));
assert(css.includes('.save-recovery-panel'));
const fresh=boot(),{h,store}=fresh;
assert.equal(h.saveRecoverySummary().status,'healthy');
assert.equal(h.saveRecoverySummary().hasCheckpoint,false);
assert.equal(h.recoveryCadence,12);
assert.equal(h.save(),true,'Fresh character stores original plain-JSON save');
assert.equal(JSON.parse(store[SAVE]).gold,520);
assert.equal(h.saveRecoverySummary().hasCheckpoint,true);
let envelope=JSON.parse(store[CK]);
assert.equal(envelope.schema,1);
assert.equal(envelope.digest,h.recoveryDigest(envelope.raw));
assert.equal(JSON.parse(envelope.raw).gold,520);
assert(!store[SAVE].includes('"schema":1'),'Primary character save format unchanged');
assert(h.renderSaveRecoveryPanel().includes('CHECKPOINT VERIFIED'));
const oldGold=JSON.parse(envelope.raw).gold;
h.p().gold=2000;h.p().essence=123456;h.p().milestones['1:100']=true;
h.p().bestByTier[1]=999;h.p().runes.push({id:'custom_forever',tier:3,type:'frost'});
assert.equal(h.save(),true);
assert.equal(JSON.parse(store[SAVE]).gold,2000);
assert.equal(JSON.parse(store[CK]).digest,envelope.digest,'Single wave does not overwrite last safe snapshot');
for(let i=0;i<12;i++){h.p().gold=2001+i;assert.equal(h.save(),true);}
envelope=JSON.parse(store[CK]);
assert(envelope.digest===h.recoveryDigest(envelope.raw));
assert.notEqual(JSON.parse(envelope.raw).gold,oldGold,'Snapshot rotates on bounded cadence');
assert.equal(JSON.parse(store[SAVE]).gold,2012);
assert.equal(h.saveRecoverySummary().checkpointFailed,false);
// Primary takes precedence when valid, even if checkpoint is older.
const newer=boot({...store});
assert.equal(newer.h.saveRecoverySummary().status,'healthy');
assert.equal(newer.h.p().gold,2012);
assert.equal(newer.h.p().essence,123456);
assert.equal(newer.h.p().milestones['1:100'],true);
assert(newer.h.p().runes.some(x=>x.id==='custom_forever'));
assert.equal(newer.h.saveRecoverySummary().hasCheckpoint,true);
// Deliberately corrupt the live character: boot must recover from validated older snapshot.
const damaged=boot({...store,[SAVE]:'{broken JSON...'});
assert.equal(damaged.h.saveRecoverySummary().status,'recovered');
assert.equal(damaged.h.saveRecoverySummary().blocked,false);
const restoredGold=JSON.parse(envelope.raw).gold;
assert.equal(damaged.h.p().gold,restoredGold);
assert.equal(JSON.parse(damaged.store[SAVE]).gold,restoredGold,'Recovered primary was persisted without resetting player');
assert(damaged.h.renderSaveRecoveryPanel().includes('RECOVERED FROM A VERIFIED CHECKPOINT'));
damaged.h.renderTierLobby();
assert(damaged.el('tierDescription').textContent.includes('OLDER VERIFIED CHECKPOINT'));
// Valid recovered character can still create real backup exports/imports.
const backup=JSON.parse(JSON.stringify(damaged.h.p()));
assert.equal(damaged.h.validateProgressBackup(backup),true);
assert.equal(damaged.h.restoreProgressBackup(backup,true),true);
assert.equal(damaged.h.saveRecoverySummary().status,'healthy');
assert(damaged.store.primal_knight_onslaught_pre_import_backup_v1);
// An intact primary with corrupt snapshot must remain fully intact.
const invalidCheckpoint=JSON.stringify({...envelope,digest:'00000000'});
const intact=boot({...store,[CK]:invalidCheckpoint});
assert.equal(intact.h.p().gold,2012);
assert.equal(intact.h.saveRecoverySummary().status,'healthy');
assert.equal(intact.h.saveRecoverySummary().hasCheckpoint,false);
// A broken primary plus invalid checksum must NOT result in silent character reset.
const loneBroken=boot({[SAVE]:'{cut off',[CK]:invalidCheckpoint});
assert.equal(loneBroken.h.saveRecoverySummary().status,'blocked');
assert.equal(loneBroken.h.saveRecoverySummary().blocked,true);
assert.equal(loneBroken.h.save(),false,'Unrecoverable save must not be overwritten by a fresh save');
assert.equal(loneBroken.store[SAVE],'{cut off');
assert.equal(loneBroken.h.saveRecoverySummary().hasCheckpoint,false);
assert(loneBroken.h.renderSaveRecoveryPanel().includes('EXPORT DAMAGED SAVE'));
assert(loneBroken.h.renderSaveRecoveryPanel().includes('AUTOSAVE LOCKED'));
loneBroken.h.renderTierLobby();
assert(loneBroken.el('tierDescription').textContent.includes('AUTOSAVE LOCKED'));
assert.equal(loneBroken.h.restoreVerifiedCheckpoint(),false);
// Explicit validated player import releases write lock without altering old save key.
assert.equal(loneBroken.h.restoreProgressBackup(backup,true),true);
assert.equal(loneBroken.store[loneBroken.h.damagedOriginalKey],'{cut off','Original invalid save bytes are quarantined before manual import');
assert.equal(loneBroken.h.damagedOriginalRaw(),'{cut off');
assert.equal(loneBroken.h.saveRecoverySummary().blocked,false);
assert.equal(loneBroken.h.p().gold,restoredGold);
assert.equal(JSON.parse(loneBroken.store[SAVE]).gold,restoredGold);
assert.equal(loneBroken.h.save(),true);
// Invalid JSON structure (not only syntax) also must fail closed.
const malformed=boot({[SAVE]:JSON.stringify({inventory:[{x:'not a gear slot'}],gold:1234})});
assert.equal(malformed.h.saveRecoverySummary().blocked,true);
assert.equal(malformed.h.save(),false);
assert.equal(JSON.parse(malformed.store[SAVE]).gold,1234);
// Manual rollback to a valid snapshot preserves an undo-import safety copy.
const recoverable=boot({...store});
const previous=JSON.parse(recoverable.store[SAVE]);
const earlier=JSON.parse(JSON.parse(recoverable.store[CK]).raw);
assert.equal(recoverable.h.restoreVerifiedCheckpoint(),true);
assert.equal(recoverable.h.p().gold,earlier.gold);
assert.equal(recoverable.h.hasImportRecovery(),true);
assert.equal(recoverable.h.undoProgressImport(),true);
assert.equal(recoverable.h.p().gold,previous.gold);
// iPhone quota or private-storage errors must NOT turn a checkpoint failure into
// a false primary-save failure, and failed primary writes keep original data.
const noCheckpoint=boot({},CK);
assert.equal(noCheckpoint.h.save(),true);
assert.equal(JSON.parse(noCheckpoint.store[SAVE]).gold,520);
assert.equal(noCheckpoint.h.saveRecoverySummary().checkpointFailed,true);
assert.equal(noCheckpoint.h.saveRecoverySummary().hasCheckpoint,false);
const noPrimary=boot({[SAVE]:JSON.stringify(backup)},SAVE);
const preserved=noPrimary.store[SAVE];noPrimary.h.p().gold+=3000;
assert.equal(noPrimary.h.save(),false);
assert.equal(noPrimary.store[SAVE],preserved);
assert.equal(noPrimary.h.p().gold,backup.gold+3000);
// All previous durable achievements are unchanged by saving and loading.
assert.equal(h.p().milestones['1:100'],true);
assert(h.p().runes.some(x=>x.id==='custom_forever'));
assert.equal(JSON.parse(store[SAVE]).milestones['1:100'],true);
assert.equal(h.p().sigils,0);
console.log('PASS: original save format, rolling verified 12-write checkpoint, intact-primary precedence, truncated/structural corruption recovery, fail-closed lock without silent reset, explicit rollback and undo, older imports, quota warnings, achievement and rune preservation.');
console.log('LIMIT: localStorage headless checks are not a physical iPhone Safari/thermal acceptance run; user defers all manual device QA through locked Alpha 0.15.');
