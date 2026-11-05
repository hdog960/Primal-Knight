// Alpha 0.12.10 — real two-pointer Atlas gestures; no reward/save mutations.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const listeners={},nodes=new Map(),storage=Object.create(null);
let doc;
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.listeners={};
  this.hidden=id==='worldAtlas';this.disabled=false;this.innerHTML='';this.textContent='';
  this.className='';this.scrollTop=0;this.width=960;this.height=540;this.src='';
  this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,v){this.listeners[k]=v;}
 getBoundingClientRect(){return{width:320,height:180,left:0,top:0};}
 setPointerCapture(){}
 querySelectorAll(){return[];}
 querySelector(){return null;}
 focus(){doc.activeElement=this;}
 setAttribute(k,v){this.attrs[k]=String(v);}
 removeAttribute(k){delete this.attrs[k];if(k==='src')this.src='';}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
let images=0;
class Image{constructor(){images++;this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;}}
doc={getElementById:el,querySelectorAll(){return[]},addEventListener(k,fn){listeners[k]=fn},hidden:false,activeElement:null};
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:doc,localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(game,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p();
assert(html.includes('Pinch 1–3× to inspect'),'On-screen instructions explain native two-finger pinch');
assert(css.includes('.atlas-scene{touch-action:none'),'Native scrolling must not cancel the canvas gesture');
const before=JSON.stringify({tier:p.unlockedTier,selected:p.selectedTier,gold:p.gold,essence:p.essence,
 sigils:p.sigils,inventory:p.inventory,runes:p.runes,milestones:p.milestones});
assert.equal(h.openWorldAtlas(2),true);
const picture=el('atlasArtwork'),matte=el('atlasMatte').src,cloth=el('atlasHeraldry').src;
const imageCount=images;
assert.equal(h.atlasPointerDown({pointerId:11,clientX:100,clientY:90}),true);
assert.equal(h.atlasPointerDown({pointerId:12,clientX:200,clientY:90}),true);
assert.equal(h.atlasPointerMove({pointerId:12,clientX:300,clientY:90}),true);
assert.equal(picture.style.transform,'translate(18.75%,0.00%) scale(2)','Pinch grows at the gesture midpoint with scene-relative pan');
assert.equal(el('atlasZoom').attrs['aria-pressed'],'true');
assert(el('atlasZoom').textContent.includes('2.0×'),'Button displays actual pinch magnification');
assert.equal(h.atlasPointerUp({pointerId:12,clientX:300,clientY:90}),false,'Pinch completion is not a swipe');
assert.equal(h.atlasPointerMove({pointerId:11,clientX:-900,clientY:-900}),true,'Remaining finger pans the enlarged composition');
assert.equal(picture.style.transform,'translate(-50.00%,-50.00%) scale(2)','Pinch pan clamp scales with the magnification');
assert.equal(h.atlasPointerUp({pointerId:11,clientX:-900,clientY:-900}),false);
assert.equal(el('atlasCount').textContent,'2 / 30','Pinch/drag cannot change tiers');
assert.equal(el('atlasMatte').src,matte);
assert.equal(el('atlasHeraldry').src,cloth);
assert.equal(images,imageCount,'Gestures do not decode or allocate new illustrated Image objects');
assert.equal(h.toggleAtlasComparison(),true,'Original-art compare works after pinch');
assert.equal(el('atlasMatte').hidden,true);
assert.equal(h.toggleAtlasComparison(),true);
assert.equal(h.toggleAtlasZoom(),false,'Button resets pinch back to full-picture 1×');
assert.equal(picture.style.transform,'none');
assert.equal(h.atlasPointerDown({pointerId:21,clientX:100,clientY:90}),true);
assert.equal(h.atlasPointerDown({pointerId:22,clientX:200,clientY:90}),true);
assert.equal(h.atlasPointerMove({pointerId:22,clientX:150,clientY:90}),true);
assert.equal(picture.style.transform,'none','Pinch cannot shrink below 1×');
assert.equal(h.atlasPointerMove({pointerId:22,clientX:500,clientY:90}),true);
assert(picture.style.transform.endsWith('scale(3)'),'Pinch cannot exceed 3×');
assert.equal(h.atlasPointerCancel({pointerId:22}),false,'Cancelled second contact has no side effects');
assert.equal(h.atlasPointerCancel({pointerId:21}),false,'Lost pointer capture is cleared');
assert.equal(h.atlasPointerUp({pointerId:21,clientX:600,clientY:90}),false,'Cancelled touch cannot swipe');
assert.equal(el('atlasCount').textContent,'2 / 30');
assert.equal(h.stepWorldAtlas(1),true);
assert.equal(picture.style.transform,'none','New realm resets pinch zoom and pan');
assert.equal(el('atlasZoom').attrs['aria-pressed'],'false');
assert.equal(h.toggleAtlasZoom(),true,'Old 1.8× accessibility button still works');
assert(picture.style.transform.includes('scale(1.8)'));
assert.equal(h.closeWorldAtlas(),true);
assert.equal(picture.style.transform,'none','Closing the Atlas resets all gesture state');
assert.equal(h.atlasPointerDown({pointerId:100,clientX:100,clientY:100}),false);
assert.equal(el('atlasMatte').src,'','Atlas releases generated landscape references when closed');
assert.equal(el('atlasHeraldry').src,'','Atlas releases generated banner references when closed');
assert.equal(JSON.stringify({tier:p.unlockedTier,selected:p.selectedTier,gold:p.gold,essence:p.essence,
 sigils:p.sigils,inventory:p.inventory,runes:p.runes,milestones:p.milestones}),before,'All gestures remain preview-only');
assert.equal(Object.keys(storage).length,0,'No touch inspection writes permanent save data');
console.log('PASS: true 2-pointer pinch 1–3×, midpoint anchoring, scale-dependent pan limits, safe cancel, no false realm swipes, all art layers together, no image decode/save changes.');
console.log('LIMIT: actual iPhone Safari gesture arbitration and frame/thermal measurements still require physical device QA.');
