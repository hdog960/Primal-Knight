// Alpha 0.12.2 — original landscape preview, lore and selected-tier cache regression.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),css=fs.readFileSync('style.css','utf8'),html=fs.readFileSync('index.html','utf8');
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.listeners={};this._src='';this.srcWrites=0;
  this.innerHTML='';this.textContent='';this.alt='';this.className='';this.scrollTop=0;
  this.width=960;this.height=540;this.hidden=false;this.disabled=false;this.classList={add(){},remove(){},toggle(){}}}
 set src(v){this._src=v;this.srcWrites++}get src(){return this._src}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,fn){this.listeners[k]=fn}querySelector(){return null}querySelectorAll(){return []}
}
const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
let imagesCreated=0;
class Image{constructor(){imagesCreated++;this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=346}}
const saveState=Object.create(null);
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return []},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return saveState[k]??null},setItem(k,v){saveState[k]=String(v)},removeItem(k){delete saveState[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(source,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert.equal(h.territoryLore.length,30,'All 30 locked territories have authored lore');
assert.equal(new Set(h.territoryLore).size,30,'Territories cannot silently duplicate the same lore');
assert(h.territoryLore.every(text=>text.length>=35&&text.length<=125),'Short local-history lines fit compact iPhones');
for(const id of ['tierVistaPreview','tierVistaCard','tierVistaName','tierVistaWeather','tierVistaLore'])
 assert(html.includes('id="'+id+'"'),'The real tier lobby includes '+id);
const preview=el('tierVistaPreview');
assert.equal(preview.src,'assets/battlefield.png','Original Tier I painting is previewed instead of a generic replacement');
assert.equal(preview.dataset.previewTier,'1');
assert.equal(el('tierVistaName').textContent,'VERDANT DAWN');
assert(el('tierVistaLore').textContent.includes('watchfires'));
assert(preview.alt.includes('Tier I'),'Preview image is meaningful for accessibility');
const tierOneWrites=preview.srcWrites,imagesAtStart=imagesCreated;
for(let i=0;i<70;i++)h.renderTierLobby();
assert.equal(preview.srcWrites,tierOneWrites,'Seventy shop/gear refreshes never reassign the same picture');
assert.equal(imagesCreated,imagesAtStart,'No needless tier image is created by repeated lobby updates');
const initial=JSON.stringify({gold:p.gold,essence:p.essence,knowledge:p.knowledge,sigils:p.sigils,inventory:p.inventory,runes:p.runes});
p.unlockedTier=30;
const chooseTier=(tier)=>el('tierGrid').listeners.click({target:{closest(sel){
 return sel==='[data-tier]'?{disabled:false,dataset:{tier:String(tier)}}:null;
}}});
chooseTier(2);
assert.equal(p.selectedTier,2);
assert.equal(el('tierVistaName').textContent,h.territoryVista(2).name);
assert.equal(preview.dataset.previewTier,'2');
assert(preview.src.startsWith('data:image/svg+xml;charset=utf-8,'),'Battle selectors show the actual illustrated terrain');
assert.equal(el('tierVistaCard').dataset.biome,'ash');
assert(el('tierVistaWeather').textContent.includes('ASH'));
assert(preview.alt.includes('Ashen Frontier'));
const secondWrites=preview.srcWrites,sceneCount=imagesCreated;
for(let i=0;i<35;i++)h.renderTierLobby();
assert.equal(preview.srcWrites,secondWrites,'Repeated War Council and milestone redraws reuse the selected SVG URL');
assert.equal(imagesCreated,sceneCount,'No additional SVG image objects while same tier stays selected');
chooseTier(30);
assert.equal(p.selectedTier,30);
assert.equal(el('tierVistaName').textContent,'ORIGIN ECLIPSE');
assert.equal(el('tierVistaCard').dataset.biome,'astral');
assert(el('tierVistaLore').textContent.includes('Origin Gate'));
assert(preview.src.startsWith('data:image/svg+xml'));
assert.equal(imagesCreated,sceneCount+1,'Changing tier creates only one new decoded landscape');
chooseTier(1);
assert.equal(preview.src,'assets/battlefield.png','Back to Tier I restores original background preview');
assert.equal(el('tierVistaCard').dataset.biome,'verdant');
assert.equal(el('tierVistaName').textContent,'VERDANT DAWN');
assert.equal(JSON.stringify({gold:p.gold,essence:p.essence,knowledge:p.knowledge,sigils:p.sigils,inventory:p.inventory,runes:p.runes}),initial,
 'Selecting regional artwork never spends currency or edits equipment');
assert(css.includes('.tier-vista-card')&&css.includes('.tier-vista-caption'),'Preview uses authentic castle-palette composition');
assert(css.includes('max-height:470px')&&css.includes('max-width:370px'),'Very short and narrow iPhone layouts have dedicated preview heights');
assert(html.includes('ALPHA 0.15.24')&&html.includes('game.js?v=0.15.24')&&html.includes('style.css?v=0.15.24'),
 'Safari Home Screen assets and release banner are updated');
console.log('PASS: 30 distinct territorial lore excerpts, real selected-painting preview, no 30 eager image loads, one per newly selected tier, zero repeated assignment on 70+ lobby refreshes, accessibility, original Tier I, currency integrity and small iPhone layout.');
