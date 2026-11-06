// Alpha 0.12.10 — preserve portrait-safe button zoom, swipe and modal keyboard focus.
'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const listeners={},nodes=new Map(),storage=Object.create(null);
let doc;
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.listeners={};
  this.hidden=id==='worldAtlas';this.disabled=false;this.innerHTML='';this.textContent='';
  this.className='';this.scrollTop=0;this.width=960;this.height=540;
  this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,v){this.listeners[k]=v;}
 getBoundingClientRect(){return{width:320,height:180};}
 setPointerCapture(){}
 querySelectorAll(sel){
  if(this.id==='worldAtlas'&&sel==='button:not([disabled])')
   return ['atlasClose','atlasBossNone','atlasBossIron','atlasBossEmber','atlasBossRift','atlasBossBeast','atlasBossPhase','atlasWeatherToggle','atlasCompare','atlasZoom','atlasExport','atlasPrev','atlasNext'].map(el).filter(x=>!x.disabled);
  return [];
 }
 querySelector(){return null;}
 focus(){doc.activeElement=this;}
 setAttribute(k,v){this.attrs[k]=String(v);}
 removeAttribute(k){delete this.attrs[k];if(k==='src')this.src='';}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;}}
doc={getElementById:el,querySelectorAll(){return[]},addEventListener(k,fn){listeners[k]=fn},hidden:false,activeElement:null};
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:doc,localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(game,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p();
for(const id of ['atlasScene','atlasArtwork','atlasZoom'])assert(html.includes('id="'+id+'"'));
assert(html.includes('aria-pressed="false"'));
assert(css.includes('.atlas-artwork{')&&css.includes('.atlas-scene[data-zoom="true"]'));
assert(css.includes('.atlas-scene{touch-action:none')&&css.includes('.atlas-scene[data-zoom="true"]'));
const previous=JSON.stringify({tier:p.unlockedTier,selected:p.selectedTier,gold:p.gold,essence:p.essence,sigils:p.sigils,inventory:p.inventory});
assert.equal(h.openWorldAtlas(2),true);
assert.equal(el('atlasCount').textContent,'2 / 30');
assert.equal(h.toggleAtlasZoom(),true);
assert(el('atlasArtwork').style.transform.includes('scale(1.8)'),'All painted art layers enlarge together');
assert.equal(el('atlasZoom').attrs['aria-pressed'],'true');
const terrainSrc=el('atlasMatte').src,bannerSrc=el('atlasHeraldry').src;
assert.equal(h.atlasPointerDown({pointerId:7,clientX:150,clientY:80}),true);
assert.equal(h.atlasPointerMove({pointerId:7,clientX:450,clientY:260}),true);
assert.equal(el('atlasArtwork').style.transform,'translate(40.00%,40.00%) scale(1.8)','Pan stays within clamped artwork bounds');
assert.equal(h.atlasPointerUp({pointerId:7,clientX:450,clientY:260}),false,'Dragging magnified art never changes territory');
assert.equal(el('atlasCount').textContent,'2 / 30');
assert.equal(el('atlasMatte').src,terrainSrc,'Magnifying does not regenerate the expensive SVG');
assert.equal(el('atlasHeraldry').src,bannerSrc);
assert.equal(h.toggleAtlasZoom(),false);
assert.equal(el('atlasArtwork').style.transform,'none');
assert.equal(el('atlasZoom').attrs['aria-pressed'],'false');
assert.equal(h.atlasPointerDown({pointerId:3,clientX:220,clientY:90}),true);
assert.equal(h.atlasPointerUp({pointerId:3,clientX:120,clientY:93}),true,'Swipe left selects next illustrated realm');
assert.equal(el('atlasCount').textContent,'3 / 30');
assert.equal(h.atlasPointerDown({pointerId:3,clientX:110,clientY:90}),true);
assert.equal(h.atlasPointerUp({pointerId:3,clientX:190,clientY:90}),true,'Swipe right returns to previous realm');
assert.equal(el('atlasCount').textContent,'2 / 30');
assert.equal(h.atlasPointerDown({pointerId:3,clientX:220,clientY:90}),true);
assert.equal(h.atlasPointerUp({pointerId:3,clientX:195,clientY:190}),false,'Vertical scroll does not navigate to another tier');
assert.equal(el('atlasCount').textContent,'2 / 30');
assert.equal(h.toggleAtlasZoom(),true);
assert(h.stepWorldAtlas(1),'Next button remains usable while zoomed');
assert.equal(el('atlasArtwork').style.transform,'none','New realm resets pan and zoom to avoid stale crops');
assert.equal(el('atlasZoom').attrs['aria-pressed'],'false');
const options=el('worldAtlas').querySelectorAll('button:not([disabled])');
options.at(-1).focus();
let prevented=0;
listeners.keydown({key:'Tab',shiftKey:false,preventDefault(){prevented++}});
assert.equal(doc.activeElement,options[0],'Modal keyboard Tab wraps to first available control');
options[0].focus();
listeners.keydown({key:'Tab',shiftKey:true,preventDefault(){prevented++}});
assert.equal(doc.activeElement,options.at(-1),'Modal Shift+Tab wraps to last available control');
assert.equal(prevented,2);
assert(options.includes(el('atlasBossIron'))&&options.includes(el('atlasWeatherToggle'))&&options.includes(el('atlasExport')),'Boss, weather, and PNG export controls remain reachable within modal keyboard focus');
assert.equal(h.closeWorldAtlas(),true);
assert.equal(h.toggleAtlasZoom(),false,'No accidental zoom when modal closed');
assert.equal(h.atlasPointerDown({pointerId:3,clientX:220,clientY:90}),false);
assert.equal(el('atlasArtwork').style.transform,'none');
assert.equal(JSON.stringify({tier:p.unlockedTier,selected:p.selectedTier,gold:p.gold,essence:p.essence,sigils:p.sigils,inventory:p.inventory}),previous,
 'Swipe, pan and zoom are art inspection only: no new tier, money or equipment changes');
assert(html.includes('ALPHA 0.14.2')&&html.includes('game.js?v=0.14.2')&&html.includes('style.css?v=0.14.2'));
console.log('PASS: single-wrapper 1.8x zoom, pan clamp, swipe without scrolling false positives, unchanged decoded art, reset on navigation/close, keyboard focus trap and zero progression changes.');
