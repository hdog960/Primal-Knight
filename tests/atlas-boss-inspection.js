// Alpha 0.15.23 — view-only World Atlas displays exact live boss stage art.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),
 css=fs.readFileSync('style.css','utf8');
const nodes=new Map(),storage=Object.create(null),listeners={};
let created=0;
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.listeners={};
  this.hidden=['worldAtlas','atlasMatte','atlasHeraldry','atlasBossStage'].includes(id);
  this.disabled=false;this._src='';this.srcWrites=0;this.removals=0;this.textContent='';
  this.innerHTML='';this.className='';this.scrollTop=0;this.width=960;this.height=540;
  this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},
  {get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 set src(x){this._src=x;this.srcWrites++}get src(){return this._src}
 removeAttribute(k){if(k==='src'){this._src='';this.removals++}else delete this.attrs[k]}
 setAttribute(k,v){this.attrs[k]=String(v)}
 addEventListener(k,v){this.listeners[k]=v}
 querySelectorAll(){return[]}
 querySelector(){return null}
 getBoundingClientRect(){return{width:320,height:180}}
 focus(){}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){created++;this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;}}
const sandbox={Image,Math,Date,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(k,v){listeners[k]=v},hidden:false},
 localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(js,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,player=h.p(),run=h.run();
const saveFingerprint=()=>JSON.stringify(player),before=saveFingerprint(),count=created;
assert(html.includes('ALPHA 0.15.23')&&html.includes('game.js?v=0.15.23')&&html.includes('style.css?v=0.15.23'));
for(const id of ['atlasBossStage','atlasBossNone','atlasBossIron','atlasBossEmber','atlasBossRift','atlasBossBeast','atlasBossPhase','atlasBossStatus'])
 assert(html.includes('id="'+id+'"'),'Required view-only selector '+id);
assert(html.indexOf('id="atlasMatte"')<html.indexOf('id="atlasBossStage"'));
assert(html.indexOf('id="atlasBossStage"')<html.indexOf('class="atlas-foreground"'),
 'Boss is between the terrain and fortress in real displayed composition');
assert(css.includes('.atlas-boss-controls button')&&css.includes('min-height:44px'));
assert(css.includes('.atlas-scene .atlas-boss-stage')&&css.includes('touch-action:pan-x'));
const art=el('atlasBossStage');
assert.equal(h.chooseAtlasBossStyle('iron'),false,'No boss inspector outside the modal');
assert.equal(h.toggleAtlasBossPhase(),false);
assert.equal(h.openWorldAtlas(2),true);
assert.equal(h.atlasBossSnapshot().style,'none');
assert.equal(art.hidden,true);
assert.equal(el('atlasBossPhase').disabled,true);
assert.equal(h.chooseAtlasBossStyle('wrong'),false,'Unrecognized styles are rejected');
assert.equal(h.chooseAtlasBossStyle('iron'),true);
assert.equal(art.hidden,false);
assert(art.src.startsWith('data:image/svg+xml;charset=utf-8,'));
let layer=decodeURIComponent(art.src.split(',')[1]);
assert.equal((layer.match(/<rect /g)||[]).length,32,'Atlas uses all 32 REAL boss marks');
assert(layer.includes('viewBox="0 0 960 540"'));
assert.equal(el('atlasBossIron').attrs['aria-pressed'],'true');
assert.equal(el('atlasBossNone').attrs['aria-pressed'],'false');
assert.equal(el('atlasBossPhase').disabled,false);
const initialWrites=art.srcWrites;
assert.equal(h.chooseAtlasBossStyle('iron'),true);
assert.equal(art.srcWrites,initialWrites,'Repeat selection does not reassign SVG data URL');
assert.equal(h.toggleAtlasBossPhase(),true);
assert.equal(h.atlasBossSnapshot().phase,2);
assert.equal(el('atlasBossPhase').attrs['aria-pressed'],'true');
assert.equal(el('atlasBossPhase').textContent,'PHASE II · ACTIVE');
assert.notEqual(decodeURIComponent(art.src.split(',')[1]),layer,'Phase II uses genuine new ambient intensity');
const phaseArt=art.src;
assert.equal(h.stepWorldAtlas(1),true);
assert.equal(h.atlasBossSnapshot().tier,3);
assert.equal(h.atlasBossSnapshot().style,'iron','Keep same boss type when comparing realms');
assert.equal(h.atlasBossSnapshot().phase,2);
assert.notEqual(art.src,phaseArt);
assert.equal(h.toggleAtlasComparison(),true);
assert.equal(art.hidden,true,'Original-art comparison hides boss overlays together with new terrain and flags');
const comparisonWrites=art.srcWrites;
assert.equal(h.toggleAtlasComparison(),true);
assert.equal(art.hidden,false);
assert.equal(art.srcWrites,comparisonWrites,'Toggling comparison does not decode another boss image');
assert.equal(h.chooseAtlasBossStyle('none'),true);
assert.equal(art.hidden,true);assert.equal(art.src,'');
assert.equal(el('atlasBossPhase').disabled,true);
assert.equal(h.atlasBossSnapshot().phase,1);
const labels=new Set(),svgs=new Set(),perTierDistinct=new Map();
for(let tier=1;tier<=30;tier++){
 for(const style of ['iron','ember','rift','beast']){
  const svg=h.atlasBossStageSvg(tier,style,1);
  assert(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"'));
  assert(svg.endsWith('</svg>'));
  assert(svg.length<6500,'Static boss overlay should remain tiny and fast to decode');
  assert(!/<script|<foreignObject|<image|<iframe|NaN|undefined/i.test(svg));
  const rects=[...svg.matchAll(/<rect x="([0-9.]+)" y="([0-9.]+)" width="([0-9.]+)" height="([0-9.]+)" fill="([^"]+)" opacity="([0-9.]+)"\/>/g)];
  assert.equal(rects.length,32,'Exact 8 light marks and 24 stage marks for '+tier+'/'+style);
  assert(rects.every(p=>{const x=Number(p[1]),y=Number(p[2]);return(x<=130||x>=845)&&y>=120&&y<325;}));
  assert(rects.every(p=>Number(p[3])>0&&Number(p[4])>0&&Number(p[6])>0&&Number(p[6])<=1));
  const digest=crypto.createHash('sha256').update(svg).digest('hex');
  // Regions sharing the same material palette legitimately reuse color and geometry.
  // Each individual realm must still show four genuinely different boss shapes.
  svgs.add(digest);
  const seen=perTierDistinct.get(tier)||new Set();
  assert(!seen.has(digest),'Different boss styles must be visually distinct within tier '+tier);
  seen.add(digest);perTierDistinct.set(tier,seen);
  assert.equal(h.atlasBossStageSvg(tier,style,1),svg,'Frozen art inspection remains deterministic');
  if(style==='beast')assert.equal(h.atlasBossStageSvg(tier,style,2),svg,'Siege Beast has no actual Phase II');
  else assert.notEqual(h.atlasBossStageSvg(tier,style,2),svg,'Real Warlord Phase II is inspectable without a fight');
  labels.add(style);
 }
}
assert.equal(perTierDistinct.size,30);
assert([...perTierDistinct.values()].every(set=>set.size===4));
assert(svgs.size>=48,'Thirteen regional palettes must yield many distinct boss-stage images');
assert.equal(labels.size,4);
assert.equal(h.atlasBossStageSvg(1,'none',2),'');
assert.equal(h.atlasBossStageSvg(1,'unknown',1),'');
assert.equal(created,count,'Atlas preview does not allocate or replace the active battle Image caches');
assert.equal(h.closeWorldAtlas(),true);
assert.equal(art.src,'','Closing Atlas releases the boss SVG data URL');
assert.equal(art.dataset.stageKey,'');
assert.equal(art.hidden,true);
assert.equal(h.atlasBossSnapshot().style,'none');
assert.equal(h.toggleAtlasBossPhase(),false);
assert.equal(h.openWorldAtlas(30),true);
assert.equal(art.src,'','Reopen never resurrects a previous boss-stage overlay');
assert.equal(el('atlasBossPhase').disabled,true);
assert.equal(h.chooseAtlasBossStyle('beast'),true);
assert.equal(el('atlasBossPhase').disabled,true,'Beast does not offer an invented Warlord Phase II');
assert.equal(el('atlasBossPhase').textContent,'NO PHASE II');
assert.equal(h.toggleAtlasBossPhase(),false);
assert.equal(h.atlasBossSnapshot().tier,30);
assert.equal(art.hidden,false);
assert.equal(h.closeWorldAtlas(),true);
run.phase='fighting';
assert.equal(h.openWorldAtlas(30),false,'No inspector can open mid-siege');
assert.equal(saveFingerprint(),before,'No boss preview changes currency, runes, gear, unlocked tiers or milestones');
assert.equal(Object.keys(storage).length,0,'View-only boss art never writes persistent data');
console.log('PASS: exact live static boss geometry, 4×30 realms, both phases, correct depth, zoom wrapper, comparison, modal controls and image release, zero save changes.');
console.log('LIMIT: physical iPhone Safari visual and memory acceptance still require device inspection.');
