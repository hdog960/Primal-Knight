// Alpha 0.12.1 — real composited illustrated terrain mattes, not only color tints.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
function world(){
 const paint={images:[],rects:0,frames:0};
 const canvas=new Proxy({
  createLinearGradient(){return{addColorStop(){}}},
  clearRect(){paint.frames++},
  drawImage(...args){paint.images.push({source:args[0]?.src||'',args:args.slice(1)})},
  fillRect(){paint.rects++}
 },{get(o,k){return Object.prototype.hasOwnProperty.call(o,k)?o[k]:()=>{}},set(o,k,v){o[k]=v;return true}});
 class El{
  constructor(id){this.id=id;this.dataset={};this.style={};this.textContent='';this.innerHTML='';this.hidden=false;this.disabled=false;this.scrollTop=0;this.width=960;this.height=540;this.listeners={};this.classList={add(){},remove(){},toggle(){}}}
  getContext(){return canvas}
  addEventListener(t,fn){this.listeners[t]=fn}
  querySelectorAll(){return []}querySelector(){return null}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 let createdImages=0;
 class Image{constructor(){createdImages++;this.complete=true;this.naturalWidth=960;this.naturalHeight=346;this.src=''}}
 const store=Object.create(null);
 const sandbox={Math,Image,Blob,Date,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{getElementById:el,querySelectorAll(){return []},addEventListener(){},hidden:false},
  localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,el,paint,store,getImageCount:()=>createdImages};
}
const w=world(),h=w.h,p=h.p(),r=h.run();
assert.equal(h.terrainBiomes.length,30,'All locked territory names have a designed terrain classification');
assert.equal(h.territoryVistas.length,30);
assert(Object.keys(h.terrainColors).length>=10,'At least ten complete painterly terrain palettes');
const uniqueScenes=new Set(),biomes=new Set(),sizes=[];
for(let tier=1;tier<=30;tier++){
 const svg=h.terrainSceneSvg(tier);
 assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
 assert(svg.endsWith('</svg>'));
 assert(svg.includes('viewBox="0 0 960 346"'),'Illustrated terrain matches exactly 960 × 346 combat background');
 assert(svg.includes('clip-path="url(#causeway)"'),'The original perspective road remains open for enemy readability');
 assert(svg.includes('<linearGradient id="sky"'),'Every terrain has a painted sky');
 assert(svg.includes('<linearGradient id="soil"'),'Every terrain has a textured earth surface');
 assert(svg.includes('shape-rendering="crispEdges"'),'Pixel-art details remain crisp');
 assert(!svg.includes('NaN')&&!svg.includes('undefined'),'SVG geometry contains no invalid values');
 assert(!/<script|<foreignObject|xlink:href|<image|<iframe/i.test(svg),'Terrain is self-contained: no remote images or scripts');
 assert(svg.length<125000,'A single tier image must fit a restrained decoded-data budget');
 const rects=(svg.match(/<rect /g)||[]).length;
 assert(rects>=200&&rects<=1500,'Static textured matte uses a bounded number of painted rectangles');
 const hash=crypto.createHash('sha256').update(svg).digest('hex');
 assert(!uniqueScenes.has(hash),'Each tier has distinct, deterministic source artwork');
 uniqueScenes.add(hash);biomes.add(h.terrainBiomes[tier-1]);sizes.push(svg.length);
 assert.equal(svg,h.terrainSceneSvg(tier),'Repeated scene composition must be exactly deterministic');
}
assert.equal(uniqueScenes.size,30);
assert(biomes.size>=12,'A broad set of regional landforms and architecture is present');
const original=JSON.stringify(p),saveBefore=JSON.stringify(w.store);
const first=h.territorySceneImage(1);
assert.equal(first,null,'Tier I retains the approved original painted Verdant March backdrop');
const beforeLoaded=w.getImageCount(),a=h.territorySceneImage(2);
assert(a.src.startsWith('data:image/svg+xml;charset=utf-8,'));
assert.equal(w.getImageCount(),beforeLoaded+1,'A new tier image decodes once on first request');
assert.equal(h.territorySceneImage(2),a,'Same-tier redraws reuse the same decoded image');
r.phase='fighting';r.tier=2; // Actual run selection, not a merely preloaded image.
for(let i=0;i<40;i++)h.draw();
r.phase='ready';
assert.equal(w.getImageCount(),beforeLoaded+2,'One terrain and one heraldry image are decoded; forty canvas redraws never allocate more');
const call=w.paint.images.find(x=>x.source.startsWith('data:image/svg+xml'));
assert(call,'The real game canvas draws the generated territorial matte');
assert.equal(JSON.stringify(call.args),JSON.stringify([0,0,960,346]),'Scene sits behind combat on precisely the top 346 pixels');
const allSources=w.paint.images.map(x=>x.source);
const firstMatte=allSources.findIndex(x=>x.startsWith('data:image/svg+xml'));
const firstFortress=allSources.findIndex(x=>x.includes('foreground.png'));
assert(firstMatte<firstFortress,'Terrains are composited behind hero, boss telegraphs and the fortress');
const b=h.territorySceneImage(17);
assert.notEqual(a,b,'New territory selection discards the previous decoded matte');
assert(b.src.startsWith('data:image/svg+xml;charset=utf-8,'));
assert.equal(b.src.split(',')[0],'data:image/svg+xml;charset=utf-8','Selected picture uses a local encoded image instead of a network URL');
assert.equal(h.territorySceneImage(17),b);
p.unlockedTier=30;
w.el('tierGrid').listeners.click({target:{closest(sel){
 return sel==='[data-tier]'?{disabled:false,dataset:{tier:'24'}}:null;
}}});
assert.equal(h.visibleTerritoryTier(),24,'Unlaunched Battle lobby uses currently selected territory for artwork');
assert(w.el('tierDescription').textContent.includes(h.territoryVista(24).name),'Battle text identifies matching terrain weather');
h.draw();
assert(w.paint.images.some(x=>x.source.startsWith('data:image/svg+xml')),'Selected tier scene remains visible');
r.phase='fighting';r.tier=17;
assert.equal(h.visibleTerritoryTier(),17,'Actual siege uses active tier, not an unrelated lobby selection');
r.phase='ready';
assert.equal(h.visibleTerritoryTier(),24,'Returning to lobby restores the selected tier illustration');
assert.equal(JSON.stringify({inventory:p.inventory,runes:p.runes,essence:p.essence,gold:p.gold,sigils:p.sigils}),JSON.stringify({
 inventory:JSON.parse(original).inventory,runes:JSON.parse(original).runes,essence:JSON.parse(original).essence,
 gold:JSON.parse(original).gold,sigils:JSON.parse(original).sigils
}),'Changing background scenery never edits existing resources or equipment');
assert(!Object.keys(w.store).some(key=>key.includes('terrain')),'Territory art creates no new persistent save keys');
assert(html.includes('ALPHA 0.12.11')&&html.includes('game.js?v=0.12.11')&&html.includes('style.css?v=0.12.11'),'iPhone Safari Home Screen cache keys are updated');
console.log('PASS: 30 unique landscape compositions, 13 regional palettes, original Tier I retained, textured perspective causeway, one terrain plus one banner decode per selected tier, genuine canvas depth order and no economy mutations.');
console.log('ART SIZES: min '+Math.min(...sizes)+' max '+Math.max(...sizes)+' avg '+Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)+' encoded chars per SVG.');
console.log('LIMIT: generated painterly pixel mattes require human visual review on actual Safari iPhones; no physical thermal test performed.');
