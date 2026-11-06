// Alpha 0.12.5 — inspect all 30 locked/unlocked artwork previews WITHOUT unlocks.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const documentListeners=Object.create(null),elements=new Map();
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this._src='';this.srcWrites=0;
  this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;
  this.hidden=['worldAtlas','atlasMatte','atlasHeraldry'].includes(id);this.disabled=false;
  this.classList={add(){},remove(){},toggle(){}}}
 set src(value){this._src=value;this.srcWrites++}get src(){return this._src}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(type,fn){this.listeners[type]=fn}
 focus(){this.focused=true}
 querySelectorAll(){return []}querySelector(){return null}
}
const el=id=>elements.get(id)||(elements.set(id,new El(id)),elements.get(id));
let created=0;
class Image{constructor(){created++;this.complete=true;this.naturalWidth=960;this.naturalHeight=540;this.src=''}}
const storage=Object.create(null);
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(t,fn){documentListeners[t]=fn},hidden:false},
 localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(game,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
for(const id of ['worldAtlas','openAtlasButton','atlasClose','atlasPrev','atlasNext','atlasHeading','atlasMatte','atlasHeraldry','atlasCount','atlasLore','atlasLock','atlasAtmosphere']){
 assert(html.includes('id="'+id+'"'),'Real Atlas HTML includes '+id);
}
assert(html.includes('aria-modal="true"'),'Atlas is correctly marked as a modal dialogue');
assert(html.includes('ART PREVIEW ONLY'),'Accessing a locked preview is labeled harmlessly');
assert.equal(el('worldAtlas').hidden,true,'World Atlas starts hidden');
const before=JSON.stringify({unlocked:p.unlockedTier,selected:p.selectedTier,gold:p.gold,essence:p.essence,sigils:p.sigils,
 inventory:p.inventory,runes:p.runes,milestones:p.milestones,phase:r.phase,wave:r.wave});
const imagesBefore=created;
assert.equal(h.openWorldAtlas(1),true);
assert.equal(el('worldAtlas').hidden,false);
assert.equal(el('atlasCount').textContent,'1 / 30');
assert.equal(el('atlasMatte').hidden,true,'Tier I shows the original painted background alone');
assert.equal(el('atlasHeraldry').hidden,true,'Tier I keeps the original red cloth, not a generated overlay');
assert(el('atlasClose').focused,'Focus is moved to the dismiss button on opening');
assert.equal(h.stepWorldAtlas(-1),false,'Previous arrow cannot move before Tier I');
assert.equal(h.stepWorldAtlas(1),true);
assert.equal(el('atlasCount').textContent,'2 / 30');
assert.equal(el('atlasLock').textContent,'LOCKED · ART PREVIEW','Locked tier remains visually labeled as locked');
assert.equal(el('atlasMatte').hidden,false);
assert.equal(el('atlasHeraldry').hidden,false);
assert(el('atlasMatte').src.startsWith('data:image/svg+xml;charset=utf-8,'));
assert(el('atlasHeraldry').src.startsWith('data:image/svg+xml;charset=utf-8,'));
assert(decodeURIComponent(el('atlasMatte').src.split(',')[1]).includes('height="346"'));
assert(decodeURIComponent(el('atlasHeraldry').src.split(',')[1]).includes('height="540"'));
const writes=el('atlasMatte').srcWrites;
assert.equal(h.renderWorldAtlas(2),2);
assert.equal(el('atlasMatte').srcWrites,writes,'Repeated Atlas refresh does not reassign the long SVG URL');
for(let tier=3;tier<=30;tier++){
 assert.equal(h.stepWorldAtlas(1),true);
 assert.equal(el('atlasCount').textContent,tier+' / 30');
 assert(el('atlasHeading').textContent.includes('TIER '));
 assert.equal(el('atlasLore').textContent,h.territoryLore[tier-1]);
 assert.equal(el('atlasLock').textContent,'LOCKED · ART PREVIEW');
}
assert.equal(h.stepWorldAtlas(1),false,'Forward button stops at the thirtieth territory');
assert.equal(el('atlasNext').disabled,true);
assert.equal(el('atlasCount').textContent,'30 / 30');
assert(el('atlasLore').textContent.includes('Origin Gate'),'Final zone previews real original lore');
assert.equal(created,imagesBefore,'Browsing 30 world images never replaces the live canvas Image cache');
assert.equal(JSON.stringify({unlocked:p.unlockedTier,selected:p.selectedTier,gold:p.gold,essence:p.essence,sigils:p.sigils,
 inventory:p.inventory,runes:p.runes,milestones:p.milestones,phase:r.phase,wave:r.wave}),before,
 'Thirty locked artwork previews never grant/alter tiers, waves, rewards, inventory or saves');
assert.equal(Object.keys(storage).filter(k=>k.includes('atlas')).length,0);
assert.equal(typeof documentListeners.keydown,'function');
documentListeners.keydown({key:'Escape',preventDefault(){}});
assert.equal(el('worldAtlas').hidden,true,'Escape dismisses modal on iPhone hardware keyboard');
assert.equal(h.stepWorldAtlas(-1),false,'Closed Atlas cannot update pictures');
assert.equal(h.closeWorldAtlas(),false,'Closing an already closed view is safe');
assert.equal(h.openWorldAtlas(30),true);
r.phase='fighting';
assert.equal(h.closeWorldAtlas(),true);
assert.equal(h.openWorldAtlas(30),false,'Cannot open the art modal during live siege');
r.phase='ready';
assert(css.includes('.world-atlas[hidden]')&&css.includes('.atlas-scene .atlas-matte'),'Composited full-battle illustration and hidden rules exist');
assert(css.includes('max-height:460px')&&css.includes('min-height:44px'),'Responsive narrow/landscape layout and touch targets are present');
assert(html.includes('ALPHA 0.12.23')&&html.includes('game.js?v=0.12.23')&&html.includes('style.css?v=0.12.23'),
 'Home Screen Safari picks up the next game release');
console.log('PASS: all 30 locked/unlocked territories have view-only full-layer illustrations, correct original Tier I, navigable boundaries, 2 SVG image types, no original-tier select/reward change, no canvas cache churn, Escape/close and iPhone layout.');
console.log('LIMIT: art quality and GPU thermals still need real iPhone device testing.');
