// Alpha 0.15.10: cross-tab/foreground save conflicts interrupt real sieges.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const SAVE='primal_knight_onslaught_save_v1',CK='primal_knight_onslaught_checkpoint_v1';
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.innerHTML='';this.textContent='';this.hidden=false;this.className='';this.scrollTop=0;this.disabled=false;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};this.listeners={};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}
 addEventListener(k,fn){this.listeners[k]=fn}setAttribute(k,v){this.attrs[k]=String(v)}querySelectorAll(){return []}querySelector(){return null}
}
function boot(store={},rules={}){
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id)),w={},d={};
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const storage={
  getItem(k){if(rules.readError===k)throw Error('denied');return Object.hasOwn(store,k)?store[k]:null},
  setItem(k,v){if(rules.reject===k)throw Error('quota');store[k]=String(v)},
  removeItem(k){delete store[k]}
 };
 const document={hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(k,fn){d[k]=fn}};
 const env={Math,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(k,fn){w[k]=fn},matchMedia(){return{matches:false}}},
  document,localStorage:storage,performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(js,env,{filename:'game.js'});
 return {h:env.window.__PK_TEST_TOOLS__,store,rules,storage,el,w,d,document};
}
assert(html.includes('ALPHA 0.15.10')&&html.includes('game.js?v=0.15.10')&&html.includes('style.css?v=0.15.10'));
const starter=boot();assert.equal(starter.h.save(),true);
const original=starter.store[SAVE],shared={...starter.store},live=boot(shared);
assert.equal(live.h.enterSiege(),true,'A legitimate unblocked siege can start');
assert.equal(live.h.run().phase,'fighting');assert(live.h.run().speed>0);
const untouchedGold=live.h.p().gold,unchangedWave=live.h.run().wave;
assert.equal(live.h.onCharacterStorageChange({key:CK,storageArea:live.storage}),false,'Unrelated checkpoint events ignored');
assert.equal(live.h.onCharacterStorageChange({key:'primal_knight_onslaught_visual_quality_v1',storageArea:live.storage}),false);
assert.equal(live.h.onCharacterStorageChange({key:SAVE,storageArea:{}}),false,'Other storage area ignored');
assert.equal(live.h.onCharacterStorageChange({key:SAVE,newValue:'stale event text',storageArea:live.storage}),true,'Event payload not trusted over current storage');
assert.equal(live.h.saveRecoverySummary().blocked,false);
const other=boot(shared);other.h.p().gold=54321;assert.equal(other.h.save(),true);
const externalRaw=shared[SAVE];assert.equal(JSON.parse(externalRaw).gold,54321);
assert.equal(typeof live.w.storage,'function');live.w.storage({key:SAVE,storageArea:live.storage,newValue:externalRaw});
assert.equal(live.h.saveRecoverySummary().blocked,true);
assert.equal(live.h.saveRecoverySummary().status,'write-failed');
assert(live.h.saveRecoverySummary().writeIssue.includes('OUTSIDE THIS SESSION'));
assert.equal(live.h.run().speed,0,'Active siege must halt at conflict');
assert.equal(live.h.run().wave,unchangedWave,'Conflict must not simulate a wave');
assert.equal(live.h.p().gold,untouchedGold,'No fabricated rewards');
assert.equal(live.el('battlePauseStatus').hidden,false);
assert(live.el('battlePauseStatus').innerHTML.includes('SAVE STORAGE LOCKED'));
assert.equal(live.el('pauseButton').disabled,true);
assert.equal(live.h.toggleBattlePause(),true);assert.equal(live.h.run().speed,0,'Must not resume unsafe siege');
assert.equal(live.h.save(),false);assert.equal(shared[SAVE],externalRaw,'Newer primary untouched');
assert.equal(live.h.enterSiege(),false,'Cannot begin another unsaveable siege');
assert.equal(shared[SAVE],externalRaw);
const fresh=boot({...starter.store});assert.equal(fresh.h.saveRecoverySummary().blocked,false);
const fore=boot({...starter.store});fore.store[SAVE]=JSON.stringify({...JSON.parse(original),gold:3100});
assert.equal(fore.h.saveRecoverySummary().blocked,false);fore.w.pageshow();
assert.equal(fore.h.saveRecoverySummary().blocked,true,'Page restoration must detect changes without storage event');
const visible=boot({...starter.store});visible.store[SAVE]=JSON.stringify({...JSON.parse(original),gold:3200});
visible.document.hidden=false;visible.d.visibilitychange();
assert.equal(visible.h.saveRecoverySummary().blocked,true,'Foreground must check continuity');
const clear=boot({...starter.store});delete clear.store[SAVE];
assert.equal(clear.h.onCharacterStorageChange({key:null,storageArea:clear.storage}),false);
assert.equal(clear.h.saveRecoverySummary().blocked,true,'Storage clear must fail closed');
const unreadable=boot({...starter.store});unreadable.rules.readError=SAVE;unreadable.w.pageshow();
assert.equal(unreadable.h.saveRecoverySummary().blocked,true,'Unreadable primary cannot be overwritten');
const normal=boot({...starter.store});normal.d.visibilitychange();
assert.equal(normal.h.saveRecoverySummary().blocked,false,'No-change foreground must not lock');
assert.equal(normal.h.enterSiege(),true,'Normal siege remains playable');
console.log('PASS Alpha 0.15.10: real siege halts on external save, no rewards, no unsafe resume, foreground detection, safe unchanged behavior');
