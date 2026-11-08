// Alpha 0.12.7 — all three painted banners must receive biome heraldry.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const nodes=new Map(),local=Object.create(null);
const paint={images:[]};let imagesCreated=0;
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.textContent='';this.innerHTML='';this.scrollTop=0;this.width=960;this.height=540;this.hidden=false;this.disabled=false;this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}},drawImage(im,...args){paint.images.push({src:im?.src||'',args})}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(t,f){this.listeners[t]=f}querySelector(){return null}querySelectorAll(){return []}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){imagesCreated++;this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540}}
const sandbox={Math,Date,Image,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return local[k]??null},setItem(k,v){local[k]=String(v)},removeItem(k){delete local[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(source,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
const previous=JSON.stringify({currency:[p.gold,p.essence,p.knowledge,p.sigils],inventory:p.inventory,runes:p.runes,
unlocked:p.unlockedTier,selected:p.selectedTier});
const hashes=new Set(),expected=[
 {cx:91,top:388,left:57,right:124,mark:'translate(91 439)'},
 {cx:277,top:384,left:246,right:310,mark:'translate(277 435)'},
 {cx:864,top:390,left:834,right:894,mark:'translate(864 441)'}
];
for(let tier=1;tier<=30;tier++){
 const svg=h.fortressHeraldrySvg(tier);
 for(const banner of expected){
  assert(svg.includes('M'+banner.left+' '+banner.top+'L'+banner.right+' '+banner.top),
   'Tier '+tier+' paints actual fabric top at x='+banner.left);
  assert(svg.includes(banner.mark),'Tier '+tier+' has embroidered heraldry centered on all 3 flag panels');
 }
 assert.equal((svg.match(/<g transform="translate\(/g)||[]).length,3,'Exactly three heraldic shields, no misplaced fourth');
 assert(!svg.includes('NaN')&&!svg.includes('undefined'));
 assert(svg.length<20000,'Three flags still use a small one-time SVG image');
 const sha=crypto.createHash('sha256').update(svg).digest('hex');
 assert(!hashes.has(sha),'All 30 matching biome flag designs are individually deterministic');
 hashes.add(sha);assert.equal(h.fortressHeraldrySvg(tier),svg);
}
r.phase='fighting';r.tier=18;r.enemies=[];
paint.images=[];h.draw();
const fortress=paint.images.findIndex(e=>e.src.endsWith('foreground.png'));
const flags=paint.images.findIndex(e=>e.src.startsWith('data:image/svg+xml')&&decodeURIComponent(e.src.split(',')[1]).includes('height="540"'));
assert(fortress>=0&&flags>fortress,'Actual game canvas composites all three colored flags on top of original painted cloth');
assert.equal(JSON.stringify(paint.images[flags].args),JSON.stringify([0,0,960,540]));
const imageCount=imagesCreated;for(let i=0;i<75;i++)h.draw();
assert.equal(imagesCreated,imageCount,'Three banners are still just one cached Image in 75 redraws');
const visual=decodeURIComponent(paint.images[flags].src.split(',')[1]);
assert(visual.includes('M246 384L310 384'),'The visually overlooked central guild banner is present in the *live* artwork');
r.tier=1;paint.images=[];h.draw();
assert(!paint.images.some(e=>e.src.startsWith('data:image/svg+xml')&&decodeURIComponent(e.src.split(',')[1]).includes('height="540"')),
 'Tier I retains the exact original three painted red banners');
assert.equal(JSON.stringify({currency:[p.gold,p.essence,p.knowledge,p.sigils],inventory:p.inventory,runes:p.runes,
unlocked:p.unlockedTier,selected:p.selectedTier}),previous,'Banner art cannot alter save, unlocks, equipment or money');
assert(html.includes('ALPHA 0.15.20')&&html.includes('game.js?v=0.15.20')&&html.includes('style.css?v=0.15.20'));
console.log('PASS: all three physically painted banners recolor in 30 deterministic realms, central guild flag no longer left red, proper actual canvas layering, one image despite 75 redraws, original Tier I and resources intact.');
