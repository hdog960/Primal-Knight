// Alpha 0.15.12: optional verified portable saves, import preview and future-format lock.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1',CK='primal_knight_onslaught_checkpoint_v1';
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=false;this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}
 addEventListener(k,fn){this.listeners[k]=fn}setAttribute(k,v){this.attrs[k]=String(v)}
 querySelectorAll(){return []}querySelector(){return null}
}
function boot(store={}){
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=120;this.naturalHeight=120;}}
 const sandbox={Math,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(js,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,store,el};
}
const {h,store}=boot();let p=h.p();
assert(html.includes('ALPHA 0.15.12')&&html.includes('game.js?v=0.15.12'));
assert(css.includes('.portable-backup-panel'));
assert.equal(h.portableBackupFormat,'primal-knight-verified-v1');
assert(h.renderPortableBackupPanel().includes('DOWNLOAD VERIFIED BACKUP'));
const charBefore=JSON.stringify(p),storageBefore=JSON.stringify(store);
const envelope=h.createVerifiedBackup();
assert.equal(envelope.format,h.portableBackupFormat);
assert.equal(envelope.schema,1);
assert.equal(envelope.characterVersion,3);
assert.equal(envelope.digest,h.recoveryDigest(envelope.raw));
assert.equal(JSON.stringify(p),charBefore,'Creating backup must not modify character');
assert.equal(JSON.stringify(store),storageBefore,'Creating backup must not write storage');
const verified=h.inspectBackupImport(JSON.parse(JSON.stringify(envelope)));
assert.equal(verified.format,'CHECKSUM-VERIFIED CHARACTER JSON');
assert.equal(verified.data.gold,p.gold);assert(verified.summary.includes('CURRENT:'));
assert(verified.summary.includes('BACKUP:'));
assert.equal(JSON.stringify(p),charBefore);
assert.equal(JSON.stringify(store),storageBefore);
const tampered={...envelope,raw:envelope.raw.replace('"gold":520','"gold":999999')};
assert.throws(()=>h.inspectBackupImport(tampered),/checksum/i);
assert.throws(()=>h.inspectBackupImport({...envelope,digest:'00000000'}),/checksum/i);
assert.throws(()=>h.inspectBackupImport({...envelope,schema:2}),/envelope/i);
assert.throws(()=>h.inspectBackupImport({...envelope,characterVersion:4}),/version/i);
assert.throws(()=>h.inspectBackupImport({...envelope,format:'fake'}),/envelope/i);
const plain=JSON.parse(JSON.stringify(p));
plain.level=2;plain.gold=1420;
const parsed=h.inspectBackupImport(plain);
assert.equal(parsed.format,'LEGACY CHARACTER JSON');assert.equal(parsed.data.level,2);
assert.equal(h.restoreProgressBackup(parsed.data,true),true);
assert.equal(h.p().gold,1420);
assert.equal(JSON.parse(store[SAVE]).gold,1420);
assert(!Object.hasOwn(JSON.parse(store[SAVE]),'format'),'Primary stays plain character JSON');
const older=JSON.parse(JSON.stringify(h.p()));older.level=1;older.unlockedTier=1;older.best=0;
h.p().level=25;h.p().best=1200;h.p().unlockedTier=10;
const warning=h.inspectBackupImport(older).summary;
assert(warning.includes('WARNING: Backup has lower hero level'));
assert(warning.includes('unlocked tiers'));
assert(warning.includes('best wave'));
const stable=JSON.stringify(h.p());assert.throws(()=>h.inspectBackupImport({...older,version:4}),/incompatible/i);
assert.equal(JSON.stringify(h.p()),stable,'Rejected future import must not change live character');
assert.throws(()=>h.restoreProgressBackup({...older,version:4},true),/Newer save version/);
assert.equal(JSON.stringify(h.p()),stable);
const futureRaw=JSON.stringify({...older,version:5,level:123,gold:987654});
const validCheckpointRaw=JSON.stringify({...plain,version:3});
const validCheckpoint=JSON.stringify({schema:1,createdAt:Date.now(),digest:h.recoveryDigest(validCheckpointRaw),raw:validCheckpointRaw});
const future=boot({[SAVE]:futureRaw,[CK]:validCheckpoint});
assert.equal(future.h.newerCharacterSave(futureRaw),true);
assert.equal(future.h.saveRecoverySummary().status,'future');
assert.equal(future.h.saveRecoverySummary().blocked,true);
assert.equal(future.h.p().gold,520,'Never silently load unsupported version');
assert.equal(future.h.p().level,1,'Never downgrade to older checkpoint');
assert.equal(future.h.save(),false,'Version incompatible save must block writes');
assert.equal(future.store[SAVE],futureRaw,'Original future bytes kept exactly');
assert(future.h.renderSaveRecoveryPanel().includes('NEWER SAVE VERSION'));
assert(future.h.renderSaveRecoveryPanel().includes('EXPORT NEWER ORIGINAL SAVE'));
assert(future.h.renderPortableBackupPanel().includes('disabled'));
future.h.renderTierLobby();assert(future.el('tierDescription').textContent.includes('NO AUTOMATIC DOWNGRADE'));
const priorRaw=future.store[SAVE];
assert.throws(()=>future.h.inspectBackupImport({...older,version:99}),/incompatible/i);
assert.equal(future.store[SAVE],priorRaw);
assert.equal(future.h.restoreProgressBackup(plain,true),true,'Explicit older import is allowed after intended overwrite');
assert.equal(future.store[future.h.damagedOriginalKey],priorRaw,'Later-version raw bytes quarantined');
assert.equal(future.h.saveRecoverySummary().status,'healthy');
assert.equal(future.h.saveRecoverySummary().blocked,false);
assert.equal(future.h.p().gold,1420);
const legacy={...plain,version:1};
const legacyPreview=h.inspectBackupImport(legacy);
assert.equal(legacyPreview.format,'LEGACY CHARACTER JSON');
assert.equal(h.restoreProgressBackup(legacyPreview.data),true);
assert.equal(h.p().version,3,'Old equipment migration still updates supported version');
assert.equal(JSON.stringify(h.p()).includes('portableBackupFormat'),false);
console.log('PASS Alpha 0.15.12: verified envelopes, forward-format lock, legacy migration, previews, original preservation');
