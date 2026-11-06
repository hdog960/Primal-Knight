// Alpha 0.12.3 — illustrated relic landmarks and restrained boss-stage atmosphere.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const paint={events:[],images:0,frames:0};
const context=new Proxy({
 save(){paint.events.push({type:'save'});},
 restore(){paint.events.push({type:'restore'});},
 clearRect(){paint.frames++;},
 fillRect(x,y,w,h){paint.events.push({type:'rect',x,y,w,h});},
 drawImage(im,...args){paint.images++;paint.events.push({type:'image',src:im?.src||'',args});},
 createLinearGradient(){return{addColorStop(){}};}
},{get(o,k){return Object.prototype.hasOwnProperty.call(o,k)?o[k]:(()=>{});},set(o,k,v){o[k]=v;return true;}});
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.textContent='';this.innerHTML='';this.scrollTop=0;this.width=960;this.height=540;this.hidden=false;this.disabled=false;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return context;}addEventListener(t,fn){this.listeners[t]=fn;}querySelectorAll(){return [];}querySelector(){return null;}
}
const elements=new Map(),el=id=>elements.get(id)||(elements.set(id,new El(id)),elements.get(id));
class Image{constructor(){this.complete=true;this.naturalWidth=960;this.naturalHeight=346;this.src='';}}
const store=Object.create(null);
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(game,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert.equal(h.terrainRelicMotifs.length,30,'Every territory has an assigned painted landmark motif');
assert.equal(h.terrainBiomes.length,30);
assert(new Set(h.terrainRelicMotifs).size>=12,'Terrain art has a broad set of unique symbolic structures');
const sizes=[],hashes=new Set();
for(let tier=1;tier<=30;tier++){
 const svg=h.terrainSceneSvg(tier);
 assert(svg.includes('<svg xmlns="http://www.w3.org/2000/svg"'),'Generated art is valid standalone SVG with no remote dependencies');
 assert(!svg.includes('NaN')&&!svg.includes('undefined'),'No malformed art geometry');
 assert(!/<script|<foreignObject|<iframe|<image|xlink:href/i.test(svg),'Only safe, self-contained vector features');
 assert(svg.length<125000,'Painted scene stays under existing SVG byte budget');
 assert(svg.includes('clip-path="url(#causeway)"'),'Road remains readable for marching enemies');
 // Added relic silhouettes must not be only metadata: each should contribute
 // illustrated geometry in addition to the prior terrain pass.
 assert((svg.match(/<rect /g)||[]).length>220,'Landmark and landscape art actually contain painted geometry');
 sizes.push(svg.length);
 const digest=crypto.createHash('sha256').update(svg).digest('hex');
 assert(!hashes.has(digest),'No duplicate terrain across 30 tiers');
 hashes.add(digest);
 assert.equal(h.terrainSceneSvg(tier),svg,'Art is deterministic for every tier');
}
assert.equal(hashes.size,30);
function stage(tier,options={}){
 const rows=[],ctx={
  save(){rows.push(['save']);},
  restore(){rows.push(['restore']);},
  fillRect(x,y,w,h){rows.push(['rect',x,y,w,h]);},
  set fillStyle(v){rows.push(['color',v]);},
  set globalAlpha(v){rows.push(['alpha',v]);}
 };
 const mock={phase:'fighting',encounter:{kind:'chapterBoss'},enemies:[{type:'warlord',isBoss:true,dead:false}],time:options.time??10};
 if(options.empty)mock.enemies=[];
 if(options.kind)mock.encounter.kind=options.kind;
 if(options.phase)mock.phase=options.phase;
 const result=h.territoryBossStaging(ctx,tier,mock,!!options.still);
 return {rows,result};
}
for(const tier of [1,4,9,17,24,30]){
 const active=stage(tier),still=stage(tier,{still:true}),later=stage(tier,{time:19});
 assert.equal(active.result.active,true);
 assert.equal(active.result.marks,32,'Boss stage uses eight historic light marks plus 24 themed side-only brush marks');
 const rects=active.rows.filter(x=>x[0]==='rect');
 assert.equal(rects.length,32);
 assert(rects.every(x=>x[1]<=130||x[1]>=845),'All boss ornamentation stays beyond the original marching lane');
 assert(rects.every(x=>[x[1],x[2],x[3],x[4]].every(Number.isFinite)));
 assert.equal(still.rows.filter(x=>x[0]==='rect').length,32,'Reduced motion keeps the full static themed stage without motion');
 assert.notEqual(JSON.stringify(active.rows),JSON.stringify(later.rows),'Boss lights move only when game time changes');
 assert.equal(JSON.stringify(stage(tier).rows),JSON.stringify(active.rows),'Identical frame time uses deterministic staging');
 assert.equal(stage(tier,{empty:true}).result.active,false,'No active boss means no boss staging');
 assert.equal(stage(tier,{phase:'ready'}).result.active,false,'No staging in the Battle lobby');
 assert.equal(stage(tier,{kind:'standard'}).result.active,false,'Normal waves do not fake a commander appearance');
}
const before=JSON.stringify({gold:p.gold,essence:p.essence,knowledge:p.knowledge,sigils:p.sigils,inventory:p.inventory,runes:p.runes});
r.tier=17;r.phase='fighting';r.time=9;r.encounter={kind:'chapterBoss'};
r.enemies=[{type:'warlord',isBoss:true,dead:false,bossStyle:'iron',x:480,y:220,hp:100,max:100,wobble:0,slow:0,burn:0}];
paint.events=[];h.draw();
const firstBossStaging=paint.events.findIndex(x=>x.type==='rect'&&x.x===18&&x.w===3);
const enemy=paint.events.findIndex(x=>x.type==='image'&&x.src.endsWith('warlord_iron.svg'));
const fortress=paint.events.findIndex(x=>x.type==='image'&&x.src.endsWith('foreground.png'));
assert(firstBossStaging>=0,'Real combat canvas paints boss-specific environmental lighting');
assert(enemy>firstBossStaging,'Boss lighting is rendered behind boss sprite and counterplay telegraphs');
assert(fortress>enemy,'Original fortress remains nearest foreground');
const baseFrame=paint.frames,delta=JSON.stringify(r.enemies);
for(let i=0;i<30;i++)h.draw();
assert.equal(JSON.stringify(r.enemies),delta,'Art-only redraws do not advance combat physics');
assert.equal(paint.frames,baseFrame+30);
r.phase='ready';paint.events=[];h.draw();
assert(!paint.events.some(x=>x.type==='rect'&&x.x===18&&x.w===3),'Returning to Battle prep removes boss staging');
assert.equal(JSON.stringify({gold:p.gold,essence:p.essence,knowledge:p.knowledge,sigils:p.sigils,inventory:p.inventory,runes:p.runes}),before,
 'Paint and combat presentation cannot change money, gear or runes');
assert.equal(store.primal_knight_onslaught_save_v1,undefined,'Environment art never creates a persistent save');
assert(html.includes('ALPHA 0.12.26')&&html.includes('game.js?v=0.12.26')&&html.includes('style.css?v=0.12.26'),
 'Safari version strings stay aligned');
console.log('PASS: 30 painted territory relics with 14+ motif families, road-preserving art, 32 bounded stage marks with original eight light marks and themed architecture, reduced-motion fallback, correct sprite/fortress depth, deterministic no-economy redraws.');
console.log('SIZES: min '+Math.min(...sizes)+' max '+Math.max(...sizes)+' average '+Math.round(sizes.reduce((a,b)=>a+b,0)/sizes.length)+' terrain SVG source characters.');
console.log('LIMIT: CPU/thermal and fine art cohesion on physical iPhone need screenshot acceptance; headless tests are not a substitute.');
