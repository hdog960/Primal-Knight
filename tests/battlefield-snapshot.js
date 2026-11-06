// Alpha 0.12.23 — one-tap iPhone PNG share, fallback, privacy and save safety.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),
 css=fs.readFileSync('style.css','utf8');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP8/5+hHgAHggJ/PX4csgAAAABJRU5ErkJggg==';
function make(kind='download'){
 const store=Object.create(null),nodes=new Map(),anchors=[],shared=[];
 let screenshots=0,paints=0;
 class El{
  constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};
   this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.listeners={};
   this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;
   this.width=960;this.height=540;this.disabled=false;this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}},
   clearRect(){paints++;}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
  toDataURL(type){assert.equal(type,'image/png');screenshots++;return PNG;}
  addEventListener(k,v){this.listeners[k]=v;}
  setAttribute(k,v){this.attrs[k]=String(v);}
  querySelectorAll(){return [];}querySelector(){return null;}focus(){}
 }
 const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=960;this.naturalHeight=540;this.src=''}}
 class File{constructor(parts,name,options){this.parts=parts;this.name=name;this.type=options.type;}}
 const sandbox={Math,Image,File,Date,Blob,Uint8Array,console,confirm(){return true},
  atob:raw=>Buffer.from(raw,'base64').toString('binary'),
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false,
   createElement(tag){assert.equal(tag,'a');const a={href:'',download:'',click(){a.clicked=true}};anchors.push(a);return a;}},
  navigator:kind==='share'?{canShare(data){return data.files.length===1},async share(data){shared.push(data);}}:
   kind==='cancel'?{canShare(){return true},async share(){const e=Error('cancelled');e.name='AbortError';throw e;}}:
   kind==='unsupported'?{canShare(){return false},async share(){throw Error('not supported')}}:{},
  localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(src,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,store,anchors,shared,el,
  shots:()=>screenshots,draws:()=>paints,canvas:el('game')};
}
async function test(){
 assert(html.includes('ALPHA 0.12.23')&&html.includes('game.js?v=0.12.23')&&html.includes('style.css?v=0.12.23'));
 assert(html.includes('id="deviceCheckFrame"')&&html.includes('Share a PNG snapshot of the painted battlefield without HUD overlays'));
 assert(css.includes('.device-check-frame')&&css.includes('min-height:44px'));
 const a=make('download'),p=a.h.p(),r=a.h.run();
 const initial=JSON.stringify(p),storeBefore=JSON.stringify(a.store);
 assert.equal(a.h.battlefieldSnapshotName(),'primal-knight-tier-01-wave-00001.png');
 r.wave=384;r.tier=14;
 assert.equal(a.h.battlefieldSnapshotName(),'primal-knight-tier-14-wave-00384.png');
 const previousImages=a.draws();
 assert.equal(await a.h.shareBattlefieldFrame(),true,'Without Web Share, a real PNG download is prepared');
 assert(a.draws()>previousImages,'Capture paints the actual current 960×540 composite');
 assert.equal(a.shots(),1,'Capture encodes exactly one canvas PNG');
 assert.equal(a.anchors.length,1);
 assert.equal(a.anchors[0].href,PNG);
 assert.equal(a.anchors[0].download,'primal-knight-tier-14-wave-00384.png');
 assert.equal(a.anchors[0].clicked,true);
 assert.equal(JSON.stringify(p),initial,'Frame capture cannot change currency, level, runes, Sigils, milestones or gear');
 assert.equal(JSON.stringify(a.store),storeBefore,'PNG export does not mutate stored progress');
 assert.equal(a.canvas.width,960);
 assert.equal(a.canvas.height,540);
 assert.equal(typeof a.el('deviceCheckFrame').onclick,'function','Device Check button invokes capture');
 a.h.openTab('settings');
 assert(a.el('panelContent').innerHTML.includes('data-action="battleSnapshot"'),'Settings also offers snapshot export');
 assert(a.el('panelContent').innerHTML.includes('The HUD is not included'));
 const b=make('share');
 b.h.run().tier=2;b.h.run().wave=52;
 const startState=JSON.stringify(b.h.p());
 assert.equal(await b.h.shareBattlefieldFrame(),true,'User may invoke native iPhone file share');
 assert.equal(b.shared.length,1);
 assert.equal(b.shared[0].title,'Primal Knight · Battlefield Artwork');
 const file=b.shared[0].files[0];
 assert.equal(file.name,'primal-knight-tier-02-wave-00052.png');
 assert.equal(file.type,'image/png');
 assert(file.parts[0].length>40,'Share contains PNG binary rather than a text-only link');
 assert.equal(b.anchors.length,0,'Working native share should not also download');
 assert.equal(JSON.stringify(b.h.p()),startState);
 assert.equal(Object.keys(b.store).length,0,'Native share never writes localStorage');
 const c=make('cancel');
 assert.equal(await c.h.shareBattlefieldFrame(),false,'Closing the iOS share sheet is not an error');
 assert.equal(c.anchors.length,0,'Cancelling a share must not trigger surprise download');
 const d=make('unsupported');
 assert.equal(await d.h.shareBattlefieldFrame(),true,'Unsupported file share falls back to download');
 assert.equal(d.anchors.length,1);
 const e=make('download');
 e.canvas.toDataURL=()=>{throw Error('Canvas tainted');};
 assert.equal(await e.h.shareBattlefieldFrame(),false,'Security/tainted canvas fails safely');
 assert.equal(e.anchors.length,0);
 assert(e.el('toast').textContent.includes('USE AN IPHONE SCREENSHOT'));
 console.log('PASS: current-layer 960×540 PNG, Safari native file share, local download fallback, user cancellation, error handling, Settings/FPS access, no game-state mutation or upload.');
 console.log('LIMIT: real Home Screen Share Sheet/Files behavior must be tested on a physical iPhone.');
}
test().catch(e=>{console.error(e);process.exitCode=1});
