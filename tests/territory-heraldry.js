// Alpha 0.12.4 — region battlement cloth without repainting hero or abilities.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const source=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const paint={ops:[]};
const ctx=new Proxy({save(){},restore(){},createLinearGradient(){return{addColorStop(){}}},
 clearRect(){},drawImage(image,...args){paint.ops.push({kind:'image',src:image?.src||'',args})},
 moveTo(x,y){paint.ops.push({kind:'shot',x,y})}},
 {get(o,k){return Object.prototype.hasOwnProperty.call(o,k)?o[k]:(()=>{})},set(o,k,v){o[k]=v;return true}});
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.disabled=false;this.hidden=false;this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return ctx}addEventListener(t,fn){this.listeners[t]=fn}querySelectorAll(){return []}querySelector(){return null}
}
const elements=new Map(),el=id=>elements.get(id)||(elements.set(id,new El(id)),elements.get(id));
let imagesCreated=0;
class Image{constructor(){imagesCreated++;this.complete=true;this.naturalWidth=960;this.naturalHeight=540;this.src=''}}
const store=Object.create(null);
const box={Image,Math,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(source,box,{filename:'game.js'});
const h=box.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(h.fortressHeraldrySvg&&h.fortressHeraldryImage);
assert.equal(Object.keys(h.heraldrySigils).length,Object.keys(h.terrainColors).length);
const fingerprints=new Set(),sizes=[];
for(let tier=1;tier<=30;tier++){
 const svg=h.fortressHeraldrySvg(tier);
 assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540"'));
 assert(svg.endsWith('</svg>')&&svg.includes('shape-rendering="crispEdges"'));
 assert(svg.includes('translate(91 439)')&&svg.includes('translate(277 435)')&&svg.includes('translate(864 441)'),'Heraldic embroidery covers all THREE original castle flags, including the center guild banner');
 assert(svg.includes('M57 388L124 388')&&svg.includes('M246 384L310 384')&&svg.includes('M834 390L894 390'),'All three regional cloth panels begin at the actual painted tops');
 assert(!svg.includes('M56 446')&&!svg.includes('M831 445'),'No old misaligned lower-half banner shapes remain');
 assert(!/<script|<foreignObject|<iframe|<image|xlink:href/i.test(svg),'Safe offline art only');
 assert(!svg.includes('NaN')&&!svg.includes('undefined'));
 assert(svg.length<20000,'Three tiny transparent banners remain a small image, not a second landscape');
 const xcoords=[...svg.matchAll(/<rect x="([^"]+)"/g)].map(m=>Number(m[1]));
 assert(xcoords.every(x=>x<=150||(x>=230&&x<=325)||x>=810),'Paint remains on the three original banner columns and never crosses the central knight/skills');
 const digest=crypto.createHash('sha256').update(svg).digest('hex');
 assert(!fingerprints.has(digest),'Each tier creates unique cloth colors and heraldic weathering');
 fingerprints.add(digest);sizes.push(svg.length);
 assert.equal(svg,h.fortressHeraldrySvg(tier),'Stable art under repeated draws');
}
assert.equal(fingerprints.size,30);
const saved=JSON.stringify({gold:p.gold,essence:p.essence,sigils:p.sigils,inventory:p.inventory,runes:p.runes});
const initialImages=imagesCreated;
assert.equal(h.fortressHeraldryImage(1),null,'Original first-tier fortress remains unchanged');
assert.equal(imagesCreated,initialImages);
const first=h.fortressHeraldryImage(2);
assert(first.src.startsWith('data:image/svg+xml;charset=utf-8,'));
assert.equal(imagesCreated,initialImages+1);
assert.equal(h.fortressHeraldryImage(2),first);
r.phase='fighting';r.tier=2;r.enemies=[];r.shots=[{x:700,y:370,kind:'arrow',trail:[[693,379]]}];
paint.ops=[];h.draw();
const normal=paint.ops.findIndex(x=>x.kind==='image'&&x.src==='assets/foreground.png');
const painted=paint.ops.findIndex(x=>x.kind==='image'&&x.src.startsWith('data:image/svg+xml')&&decodeURIComponent(x.src.split(',')[1]).includes('height="540"'));
const arrow=paint.ops.findIndex(x=>x.kind==='shot');
assert(normal>=0&&painted>normal,'Heraldry sits on original battlements');
assert(arrow>painted,'Combat projectile remains above banners');
assert.equal(JSON.stringify(paint.ops[painted].args),JSON.stringify([0,0,960,540]));
const count=imagesCreated;for(let i=0;i<75;i++)h.draw();
assert.equal(imagesCreated,count,'Canvas repaints never allocate or rebuild banner image');
r.tier=18;paint.ops=[];h.draw();
assert.equal(imagesCreated,count+2,'Changing tier decodes one terrain and one banner image');
assert.notEqual(h.fortressHeraldryImage(18),first);
r.tier=1;paint.ops=[];h.draw();
assert.equal(h.fortressHeraldryImage(1),null);
assert(!paint.ops.some(x=>x.kind==='image'&&x.src.startsWith('data:image/svg+xml')&&decodeURIComponent(x.src.split(',')[1]).includes('height="540"')),
 'Original Tier I fortress receives no replacement cloth');
assert.equal(JSON.stringify({gold:p.gold,essence:p.essence,sigils:p.sigils,inventory:p.inventory,runes:p.runes}),saved,
 'Changing visual banners never changes resources, gear or runes');
assert(!Object.keys(store).some(k=>k.includes('heraldry')));
assert(html.includes('ALPHA 0.12.18')&&html.includes('game.js?v=0.12.18')&&html.includes('style.css?v=0.12.18'));
console.log('PASS: 13 region banner glyph families, full-height aligned fabric, 30 deterministic heraldic cloth variants, hero-safe x bounds, real fortress/projectile draw ordering, original Tier I and 75 redraws without allocations.');
console.log('SOURCE SIZE: min '+Math.min(...sizes)+' max '+Math.max(...sizes)+' average '+Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)+'.');
console.log('LIMIT: iPhone screenshots, visuals and long-session energy use not measured.');
