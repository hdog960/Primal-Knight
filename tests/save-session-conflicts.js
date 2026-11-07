// Alpha 0.15.7: cross-session conflicts and retryable recovery writes.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const SAVE='primal_knight_onslaught_save_v1',UNDO='primal_knight_onslaught_pre_import_backup_v1',CK='primal_knight_onslaught_checkpoint_v1';
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.innerHTML='';this.textContent='';this.hidden=false;this.className='';this.scrollTop=0;this.disabled=false;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};this.listeners={}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}
 addEventListener(k,fn){this.listeners[k]=fn}setAttribute(k,v){this.attrs[k]=String(v)}querySelectorAll(){return []}querySelector(){return null}
}
function boot(store={},rules={}){
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const storage={getItem(k){if(rules.readError===k)throw Error('read denied');return Object.hasOwn(store,k)?store[k]:null},
  setItem(k,v){if(rules.reject===k)throw Error('quota');if(rules.silent===k)return;store[k]=String(v)},
  removeItem(k){delete store[k]}};
 const env={Math,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
  localStorage:storage,performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(js,env,{filename:'game.js'});return {h:env.window.__PK_TEST_TOOLS__,store,rules,el};
}
assert(html.includes('ALPHA 0.15.7')&&html.includes('game.js?v=0.15.7')&&html.includes('style.css?v=0.15.7'));
const seed=boot();assert.equal(seed.h.save(),true);
const original=seed.store[SAVE],checkpoint=seed.store[CK],source=JSON.parse(original);
const external=boot({...seed.store}),newer=JSON.stringify({...source,level:64,gold:69000});
external.store[SAVE]=newer;external.h.p().gold=9999;
assert.equal(external.h.save(),false,'Old tab cannot overwrite newer character');
assert.equal(external.store[SAVE],newer);assert.equal(external.store[CK],checkpoint);
assert.equal(external.h.saveRecoverySummary().blocked,true);
assert.equal(external.h.saveRecoverySummary().status,'write-failed');
assert(external.h.saveRecoverySummary().writeIssue.includes('OUTSIDE THIS SESSION'));
assert(external.h.renderSaveRecoveryPanel().includes('Another tab or window'));
assert.equal(external.h.save(),false);
assert.throws(()=>external.h.restoreProgressBackup(source,true),/outside this session/);
assert.equal(external.store[SAVE],newer);assert.equal(external.store[UNDO],undefined);
const reloaded=boot({...external.store});assert.equal(reloaded.h.p().gold,69000);
const eviction=boot({...seed.store});delete eviction.store[SAVE];eviction.h.p().gold=100000;
assert.equal(eviction.h.save(),false);assert.equal(eviction.store[SAVE],undefined);
assert.equal(eviction.h.saveRecoverySummary().blocked,true);
const unreadable=boot({...seed.store});unreadable.rules.readError=SAVE;
assert.equal(unreadable.h.save(),false);assert.equal(unreadable.store[SAVE],original);
assert.equal(unreadable.h.saveRecoverySummary().blocked,true);
const quota=boot({...seed.store});quota.h.p().gold=4040;quota.rules.reject=SAVE;
assert.equal(quota.h.save(),false);assert.equal(quota.h.saveRecoverySummary().blocked,false);
assert.equal(quota.store[CK],checkpoint,'A rejected primary must not rotate checkpoint');
delete quota.rules.reject;assert.equal(quota.h.save(),true);
assert.equal(JSON.parse(quota.store[SAVE]).gold,4040);
assert.equal(JSON.parse(quota.store[CK]).raw,original,'Successful retry can safely refresh a valid older checkpoint');
assert.equal(JSON.parse(quota.store[CK]).digest,quota.h.recoveryDigest(original));
const damaged='{interrupted write',recovered=boot({...seed.store,[SAVE]:damaged},{reject:SAVE});
assert.equal(recovered.h.saveRecoverySummary().status,'recovered');
assert.equal(recovered.h.saveRecoverySummary().blocked,false,'Rejected recovery must remain retryable');
assert.equal(recovered.store[SAVE],damaged);assert.equal(recovered.store[CK],checkpoint);
delete recovered.rules.reject;assert.equal(recovered.h.save(),true);
assert.equal(recovered.h.saveRecoverySummary().blocked,false);
assert.equal(JSON.parse(recovered.store[SAVE]).gold,source.gold);
const imported=boot({...seed.store});
assert.equal(imported.h.restoreProgressBackup({...source,gold:1777},true),true);
assert.equal(imported.h.save(),true);assert.equal(imported.h.undoProgressImport(),true);
assert.equal(JSON.parse(imported.store[SAVE]).gold,source.gold);
assert.equal(imported.store[UNDO],undefined);
console.log('PASS Alpha 0.15.7: cross-tab safety, eviction, read errors, retryable recovery and import/undo');
