// Alpha 0.12.28 — four painted battle setpieces, 30 biomes, real canvas order.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const stored=Object.create(null),nodes=new Map(),paint={events:[]};
let images=0;
const ctx=new Proxy({
 createLinearGradient(){return{addColorStop(){}}},
 clearRect(){paint.events.push({kind:'clear'})},
 fillRect(x,y,w,h){paint.events.push({kind:'rect',x,y,w,h})},
 drawImage(img,...args){paint.events.push({kind:'image',src:img?.src||'',args})}
},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});
class Element{
 constructor(id){this.id=id;this.style={};this.dataset={};this.listeners={};this.textContent='';
  this.innerHTML='';this.hidden=false;this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;
  this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return ctx;}addEventListener(t,fn){this.listeners[t]=fn;}
 querySelectorAll(){return[];}querySelector(){return null;}
}
const el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
class Image{constructor(){images++;this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;}}
const sandbox={Math,Date,Image,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return stored[k]??null},setItem(k,v){stored[k]=String(v)},removeItem(k){delete stored[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(game,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,run=h.run(),player=h.p(),before=JSON.stringify(player);
assert(html.includes('ALPHA 0.12.28')&&html.includes('game.js?v=0.12.28')&&html.includes('style.css?v=0.12.28'));
assert.deepEqual(Object.keys(h.bossStageTemplates).sort(),['beast','ember','iron','rift']);
assert.equal(h.bossStageEdges.length,8);
for(const list of Object.values(h.bossStageTemplates)){
 assert.equal(list.length,12,'Each painted motif is limited to twelve small brush rectangles per side');
 assert(list.every(p=>p.length===5&&p.slice(0,4).every(Number.isFinite)),'All motif coordinates are finite');
}
function staging(tier,style='iron',opt={}){
 const marks=[],record={alpha:1,color:''};
 const sketch={save(){marks.push(['save'])},restore(){marks.push(['restore'])},
  fillRect(x,y,w,h){marks.push(['rect',x,y,w,h,record.color,record.alpha])},
  set fillStyle(v){record.color=v},set globalAlpha(v){record.alpha=v}};
 const boss={type:style==='beast'?'siegebeast':'warlord',bossStyle:style,isBoss:true,dead:false,bossPhase:opt.phase2?2:1};
 const state={phase:opt.state||'fighting',encounter:{kind:opt.kind||'chapterBoss'},
  time:opt.time??10,enemies:opt.empty?[]:[boss]};
 const summary=h.territoryBossStaging(sketch,tier,state,!!opt.still);
 return {summary,marks,rects:marks.filter(p=>p[0]==='rect')};
}
const first=staging(1,'iron');
assert.equal(first.summary.style,'iron');
assert.equal(first.summary.phase,1);
assert.equal(first.summary.marks,32,'Eight original fringe-light marks + 24 new region stage marks');
assert.equal(first.rects.length,32);
assert.equal(first.rects[0][1],18,'First original torchlight anchor is unchanged');
assert.equal(first.rects[0][3],3,'Original torchlight remains three pixels wide');
assert(first.rects.every(p=>p[1]<=130||p[1]>=845),'All stage geometry remains outside the center road');
assert(first.rects.every(p=>p.slice(1,5).every(Number.isFinite)),'No invalid stage rectangle dimensions');
assert(first.rects.every(p=>p[3]>0&&p[4]>0),'All stage brush strokes have area');
assert.equal(JSON.stringify(staging(1,'iron').marks),JSON.stringify(first.marks),'Fixed render time is deterministic');
for(let tier=1;tier<=30;tier++){
 const colors=new Set();
 for(const style of ['iron','ember','rift','beast']){
  const active=staging(tier,style),still=staging(tier,style,{still:true}),later=staging(tier,style,{time:19});
  assert.equal(active.summary.active,true);
  assert.equal(active.summary.tier,tier);
  assert.equal(active.summary.style,style);
  assert.equal(active.rects.length,32);
  assert.equal(still.rects.length,32,'Reduced Motion retains static original illustrated stage');
  assert.equal(JSON.stringify(still.marks),JSON.stringify(staging(tier,style,{still:true,time:19}).marks),
   'Reduced Motion never pulses scenery');
  assert.notEqual(JSON.stringify(active.marks),JSON.stringify(later.marks),
   'Normal scenery responds subtly to game time');
  assert(active.rects.every(p=>p[1]<=130||p[1]>=845),'Boss stage never obstructs the main siege path');
  assert(active.rects.every(p=>p[2]>=100&&p[2]<325),'Fringe stage art remains inside the authored scenery area');
  assert(active.rects.length<=40,'Mobile canvas budget remains bounded');
  const signature=JSON.stringify(active.rects.slice(8).map(p=>p.slice(2,7)));
  colors.add(signature);
  const phaseII=staging(tier,style,{phase2:true});
  assert.equal(phaseII.summary.phase,2);
  assert.notEqual(JSON.stringify(active.marks),JSON.stringify(phaseII.marks),
   'Visible escalation follows live phase II, never an arbitrary timer');
 }
 assert.equal(colors.size,4,'All four bosses paint distinct environment silhouettes in tier '+tier);
}
assert.equal(staging(1,'iron',{empty:true}).summary.active,false);
assert.equal(staging(1,'iron',{state:'ready'}).summary.active,false);
assert.equal(staging(1,'iron',{kind:'standard'}).summary.active,false);
assert.equal(staging(1,'iron',{empty:true}).marks.length,0);
const styleImageCount=images;
run.tier=17;run.phase='fighting';run.time=9;run.encounter={kind:'chapterBoss'};
run.enemies=[{type:'warlord',isBoss:true,bossStyle:'rift',bossPhase:2,dead:false,
 x:480,y:220,hp:100,max:100,wobble:0,slow:0,burn:0}];run.shots=[];
const preCombat=JSON.stringify(run.enemies);
paint.events=[];h.draw();
const stageMark=paint.events.findIndex(p=>p.kind==='rect'&&p.x===18&&p.w===3);
const bossSprite=paint.events.findIndex(p=>p.kind==='image'&&p.src.endsWith('warlord_rift.svg'));
const foreground=paint.events.findIndex(p=>p.kind==='image'&&p.src.endsWith('foreground.png'));
assert(stageMark>=0&&bossSprite>stageMark&&foreground>bossSprite,
 'Real canvas places the stage behind enemies and the original foreground');
const decoded=images;
for(let i=0;i<50;i++)h.draw();
assert.equal(images,decoded,'Boss stage does not allocate images during 50 real paints');
assert.equal(JSON.stringify(run.enemies),preCombat,'Illustration does not simulate or mutate enemies');
assert.equal(JSON.stringify(player),before,'No permanent currency, reward, gear or progression mutations');
assert.equal(Object.keys(stored).length,0,'Setpieces never write storage');
run.phase='ready';paint.events=[];h.draw();
assert(!paint.events.some(p=>p.kind==='rect'&&p.x===18&&p.w===3),'Boss imagery disappears from lobby');
console.log('PASS: 4 distinct authored boss-stage styles × 30 territories, 32 side-only brush strokes, phase II subtle escalation, Reduced Motion static, correct canvas depth, no new images, no gameplay/save changes.');
console.log('LIMIT: iPhone Safari art, thermal and frame pacing remain unverified physically.');
