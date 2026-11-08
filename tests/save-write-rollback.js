// Alpha 0.15.24: import transaction, exact storage readback, and rollback-failure warnings.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),
      css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1',UNDO='primal_knight_onslaught_pre_import_backup_v1',
      CK='primal_knight_onslaught_checkpoint_v1';
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.innerHTML='';this.textContent='';this.hidden=false;this.className='';this.scrollTop=0;this.disabled=false;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};this.listeners={}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}
 addEventListener(k,fn){this.listeners[k]=fn}setAttribute(k,v){this.attrs[k]=String(v)}querySelectorAll(){return []}querySelector(){return null}
}
function boot(store={},rules={}){
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=120;this.naturalHeight=120}}
 const storage={
  getItem(k){if(rules.readError===k)throw Error('Safari read failed');return Object.hasOwn(store,k)?store[k]:null},
  setItem(k,v){
   if(rules.reject===k)throw Error('QuotaExceededError');
   if(rules.silent===k)return;
   if(rules.partial===k){
    store[k]='{partial';
    if(rules.partialOnce)delete rules.partial;
    if(rules.rejectAfterPartial)rules.reject=k;
    return;
   }
   store[k]=String(v);
  },
  removeItem(k){if(rules.reject===k)throw Error('storage removal rejected');delete store[k]}
 };
 const env={Math,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
  localStorage:storage,performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(js,env,{filename:'game.js'});
 return {h:env.window.__PK_TEST_TOOLS__,store,rules,el};
}
assert(html.includes('ALPHA 0.15.24')&&html.includes('game.js?v=0.15.24'));
assert(css.includes('.save-recovery-panel.save-recovery-danger'));
const original=boot();assert.equal(original.h.save(),true);
const base=JSON.parse(original.store[SAVE]),primary=original.store[SAVE],ck=original.store[CK];
const imported={...base,gold:7777,level:9};
const test=function(init){return boot({...original.store},init||{})};
// A rejected/untouched primary save must not rotate or overwrite last verified snapshot.
const rejected=test(),beforeCK=rejected.store[CK];
rejected.h.p().gold=9999;rejected.rules.reject=SAVE;
assert.equal(rejected.h.save(),false);assert.equal(rejected.store[SAVE],primary);
assert.equal(rejected.store[CK],beforeCK);
assert.equal(rejected.h.saveRecoverySummary().blocked,false);
assert(rejected.h.saveRecoverySummary().writeIssue.includes('FAILED'));
assert(rejected.h.renderSaveRecoveryPanel().includes('LATEST SAVE WAS NOT VERIFIED'));
delete rejected.rules.reject;assert.equal(rejected.h.save(),true);
assert.equal(JSON.parse(rejected.store[SAVE]).gold,9999);
assert.equal(rejected.h.saveRecoverySummary().writeIssue,null);
// Silent no-op writes must NEVER claim success.
const silent=test();silent.h.p().gold=12345;silent.rules.silent=SAVE;
assert.equal(silent.h.save(),false);assert.equal(silent.store[SAVE],primary);
assert.equal(silent.h.saveRecoverySummary().blocked,false);
delete silent.rules.silent;assert.equal(silent.h.save(),true);
// Verify original earlier checkpoint never changes after a failed primary import.
const failImport=test();const stableCharacter=JSON.stringify(failImport.h.p());
const stableUndo='{"previous":"import backup"}';failImport.store[UNDO]=stableUndo;
failImport.rules.reject=SAVE;
assert.throws(()=>failImport.h.restoreProgressBackup(imported,true),/persist/);
assert.equal(JSON.stringify(failImport.h.p()),stableCharacter);
assert.equal(failImport.store[SAVE],primary);
assert.equal(failImport.store[UNDO],stableUndo,'Failed import must restore previous undo slot');
assert.equal(failImport.store[CK],ck,'Failed primary never rotates valid checkpoint');
assert.equal(failImport.h.saveRecoverySummary().blocked,false);
// A rejected undo snapshot must abort BEFORE replacing the primary.
const badUndo=test();badUndo.store[UNDO]='old undo bytes';badUndo.rules.reject=UNDO;
const oldChar=JSON.stringify(badUndo.h.p());
assert.throws(()=>badUndo.h.restoreProgressBackup(imported,true),/QuotaExceededError/);
assert.equal(badUndo.store[SAVE],primary);assert.equal(badUndo.store[UNDO],'old undo bytes');
assert.equal(JSON.stringify(badUndo.h.p()),oldChar);
// No-op undo writes also fail readback, with no character mutation.
const noUndo=test();noUndo.rules.silent=UNDO;
assert.throws(()=>noUndo.h.restoreProgressBackup(imported,true),/verify pre-import undo backup/);
assert.equal(noUndo.store[SAVE],primary);
// Partial overwritten primary is restored byte for byte, not reported as successful.
const partial=test();partial.rules.partial=SAVE;partial.rules.partialOnce=true;
assert.throws(()=>partial.h.restoreProgressBackup(imported,true),/persist/);
assert.equal(partial.store[SAVE],primary);
assert.equal(partial.h.saveRecoverySummary().blocked,false);
assert.equal(JSON.stringify(partial.h.p()),JSON.stringify(base));
// If rollback itself is blocked the app must NOT claim the old bytes survived.
const locked=test();locked.rules.partial=SAVE;locked.rules.partialOnce=true;locked.rules.rejectAfterPartial=true;
assert.throws(()=>locked.h.restoreProgressBackup(imported,true),/persist/);
assert.equal(locked.store[SAVE],'{partial');
assert.equal(locked.h.saveRecoverySummary().blocked,true);
assert.equal(locked.h.saveRecoverySummary().status,'write-failed');
assert(locked.h.renderSaveRecoveryPanel().includes('STORAGE UNVERIFIED'));
assert.equal(locked.h.save(),false,'Automatic writes must stop once rollback cannot be verified');
// A standalone partial primary write also locks; the checkpoint remains intact.
const partialNormal=test();partialNormal.rules.partial=SAVE;partialNormal.rules.partialOnce=true;
partialNormal.h.p().gold=4567;
assert.equal(partialNormal.h.save(),false);
assert.equal(partialNormal.h.saveRecoverySummary().blocked,true);
assert.equal(partialNormal.store[CK],ck);
// Undo removes its copy only AFTER a verified import, never after rejected writes.
const undo=test();assert.equal(undo.h.restoreProgressBackup(imported,true),true);
assert.equal(undo.h.p().gold,7777);
assert.equal(undo.h.hasImportRecovery(),true);
undo.rules.reject=SAVE;
assert.throws(()=>undo.h.undoProgressImport(),/persist/);
assert.equal(undo.h.hasImportRecovery(),true);
assert.equal(undo.h.p().gold,7777);
delete undo.rules.reject;
assert.equal(undo.h.undoProgressImport(),true);
assert.equal(undo.h.p().gold,base.gold);
assert.equal(undo.store[UNDO],undefined);
// Ordinary successful import still creates an accurate pre-import copy.
const success=test();assert.equal(success.h.restoreProgressBackup(imported,true),true);
assert.equal(JSON.parse(success.store[UNDO]).gold,base.gold);
assert.equal(JSON.parse(success.store[SAVE]).gold,7777);
assert.equal(success.h.p().gold,7777);
assert.equal(success.h.saveRecoverySummary().blocked,false);
console.log('PASS Alpha 0.15.24: storage readback, failed-write checkpoint preservation, verified import rollback, critical write lock, safe undo');
