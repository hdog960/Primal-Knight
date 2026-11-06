// Alpha 0.12.6 — Atlas comparison and short-lived SVG preview references.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.attributes={};
  this.hidden=['worldAtlas','atlasMatte','atlasHeraldry'].includes(id);
  this.disabled=false;this._src='';this.srcWrites=0;this.removals=0;
  this.textContent='';this.innerHTML='';this.className='';this.scrollTop=0;this.width=960;this.height=540;
  this.listeners={};this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},
  {get(o,k){return Object.prototype.hasOwnProperty.call(o,k)?o[k]:(()=>{})},set(o,k,v){o[k]=v;return true}})}
 set src(v){this._src=v;this.srcWrites++}get src(){return this._src}
 removeAttribute(a){if(a==='src'){this._src='';this.removals++}else delete this.attributes[a]}
 setAttribute(a,v){this.attributes[a]=String(v)}
 addEventListener(t,fn){this.listeners[t]=fn}
 focus(){this.focused=true}
 querySelectorAll(){return []}querySelector(){return null}
}
const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
let created=0;
class Image{constructor(){created++;this.src='';this.naturalWidth=960;this.naturalHeight=540;this.complete=true}}
const store=Object.create(null),documentListeners={};
const box={Image,Math,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(t,fn){documentListeners[t]=fn},hidden:false},
 localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(game,box,{filename:'game.js'});
const h=box.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert.equal(typeof h.toggleAtlasComparison,'function','The actual game exports the compare toggle for regression testing');
assert(html.includes('id="atlasCompare"')&&html.includes('aria-pressed="false"'),'The real UI offers an accessible original-art comparison');
assert(css.includes('.atlas-compare-row')&&css.includes('min-height:44px'),'Comparison button is styled with a normal iPhone touch target');
const snapshot=JSON.stringify({unlocked:p.unlockedTier,selected:p.selectedTier,gold:p.gold,essence:p.essence,sigils:p.sigils,
 inventory:p.inventory,runes:p.runes,training:p.training});
const cacheStart=created;
const matte=el('atlasMatte'),cloth=el('atlasHeraldry'),button=el('atlasCompare');
assert.equal(h.toggleAtlasComparison(),false,'No outside-modal toggle is allowed');
assert.equal(h.openWorldAtlas(2),true);
assert.equal(matte.hidden,false);assert.equal(cloth.hidden,false);
assert.equal(button.disabled,false);
assert.equal(button.attributes['aria-pressed'],'false');
const actualArt=matte.src,actualFlags=cloth.src;
assert(actualArt.startsWith('data:image/svg+xml;charset=utf-8,'));
assert(actualFlags.startsWith('data:image/svg+xml;charset=utf-8,'));
assert.equal(h.toggleAtlasComparison(),true);
assert.equal(matte.hidden,true,'Comparing original art hides the generated terrain');
assert.equal(cloth.hidden,true,'Comparing original art hides new banner cloth as well');
assert.equal(button.attributes['aria-pressed'],'true');
assert.equal(button.textContent,'SHOW TERRITORY ART');
assert.equal(el('atlasCount').textContent,'2 / 30');
const beforeRefresh=matte.srcWrites;
h.renderWorldAtlas(2);
assert.equal(button.attributes['aria-pressed'],'true','Same-tier label update does not unexpectedly disable comparison');
assert.equal(matte.srcWrites,beforeRefresh,'Comparison never reassigns the giant inline SVG');
assert.equal(h.toggleAtlasComparison(),true);
assert.equal(matte.hidden,false);assert.equal(cloth.hidden,false);
assert.equal(matte.src,actualArt,'Restoring territory art reuses the same exact image');
assert.equal(cloth.src,actualFlags);
assert.equal(button.attributes['aria-pressed'],'false');
assert.equal(h.toggleAtlasComparison(),true);
assert(h.stepWorldAtlas(1));
assert.equal(el('atlasCount').textContent,'3 / 30');
assert.equal(button.attributes['aria-pressed'],'false','Navigating to a new tier displays the real artwork by default');
assert.equal(matte.hidden,false);assert.equal(cloth.hidden,false);
assert.notEqual(matte.src,actualArt);
const imageCount=created,previousMatte=matte.src;
assert.equal(h.closeWorldAtlas(),true);
assert.equal(el('worldAtlas').hidden,true);
assert.equal(matte.src,'','Closing discards the live DOM reference to the large percent-encoded terrain SVG');
assert.equal(cloth.src,'','Closing discards the live DOM reference to the banner SVG');
assert(matte.removals>0&&cloth.removals>0,'The browser API removes stale img src attributes (not src="")');
assert.equal(matte.dataset.atlasTier,'');
assert.equal(cloth.dataset.atlasTier,'');
assert.equal(matte.hidden,true);assert.equal(cloth.hidden,true);
assert(el('openAtlasButton').focused,'Keyboard focus returns to the Atlas entry button');
assert.equal(created,imageCount,'Opening/comparing/closing Atlas never overwrites the cached battle Image instances');
assert.equal(h.openWorldAtlas(3),true);
assert.equal(matte.src,previousMatte,'Reopening same tier restores the same deterministic scene, not a blank stale preview');
assert.equal(button.attributes['aria-pressed'],'false');
h.renderWorldAtlas(1);
assert.equal(matte.src,'','Returning to original Tier I immediately discards previous inline terrain art');
assert.equal(cloth.src,'','Returning to original Tier I immediately discards previous inline banner art');
assert.equal(matte.hidden,true);assert.equal(cloth.hidden,true);
assert.equal(button.disabled,true);
assert.equal(h.toggleAtlasComparison(),false,'Tier I is already the baseline, so Compare is disabled');
h.renderWorldAtlas(30);
assert.equal(button.disabled,false);
assert.equal(h.toggleAtlasComparison(),true);
assert.equal(matte.hidden,true);
assert.equal(h.closeWorldAtlas(),true);
assert.equal(h.openWorldAtlas(30),true);
assert.equal(button.attributes['aria-pressed'],'false','Reopen always shows true territory artwork');
assert.equal(matte.hidden,false);
assert.equal(JSON.stringify({unlocked:p.unlockedTier,selected:p.selectedTier,gold:p.gold,essence:p.essence,sigils:p.sigils,
 inventory:p.inventory,runes:p.runes,training:p.training}),snapshot,
 'Comparison and memory reclamation cannot buy, unlock, select a tier, spend money or change equipment');
assert.equal(Object.keys(store).filter(k=>k.includes('atlas')||k.includes('heraldry')).length,0);
const noMore=created;
r.phase='ready';h.enterSiege();
assert.equal(el('worldAtlas').hidden,true,'Beginning a real siege dismisses the view-only Atlas');
assert.equal(matte.src,'','Starting a siege releases hidden atlas SVGs');
assert.equal(cloth.src,'');
assert(created<=noMore+2,'Live canvas only loads its own selected tier backgrounds');
assert(html.includes('ALPHA 0.14.6')&&html.includes('game.js?v=0.14.6')&&html.includes('style.css?v=0.14.6'));
console.log('PASS: original-vs-regional full artwork compare, correct aria toggle, reset on navigation, releases SVG URLs on close/Tier I/siege, deterministic reopens and no saved progress/equipment mutation.');
console.log('LIMIT: browser GC and iPhone memory/thermals cannot be measured in headless DOM mocks.');
