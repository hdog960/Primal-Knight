// Alpha 0.14.3 — capture actual Atlas pixels without unlocks or live combat.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),
 css=fs.readFileSync('style.css','utf8');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP8/5+hHgAHggJ/PX4csgAAAABJRU5ErkJggg==';
function session(type='download'){
 const nodes=new Map(),storage=Object.create(null),draws=[],files=[],links=[];
 let encoded=0,newImages=0,canvasBlocked=false;
 class El{
  constructor(id){
   this.id=id;this.style={};this.dataset={};this.attrs={};this.listeners={};this.complete=true;
   this.naturalWidth=960;this.naturalHeight=540;this.src='';this.textContent='';this.innerHTML='';
   this.disabled=false;this.className='';this.scrollTop=0;this.width=960;this.height=540;
   this.hidden=['worldAtlas','atlasMatte','atlasBossStage','atlasHeraldry','deviceCheckPanel'].includes(id);
   this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{
   get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
  setAttribute(k,v){this.attrs[k]=String(v)}
  removeAttribute(k){delete this.attrs[k];if(k==='src')this.src=''}
  addEventListener(k,v){this.listeners[k]=v}
  querySelectorAll(){return[]}
  getBoundingClientRect(){return{width:320,height:180}}
  focus(){}
 }
 const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){newImages++;this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;}}
 class File{constructor(parts,name,options){this.parts=parts;this.name=name;this.type=options.type;}}
 const document={getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false,
  createElement(tag){
   if(tag==='canvas')return{width:0,height:0,getContext(){return{drawImage(img,...args){draws.push([img.id,...args])}}},
    toDataURL(mime){assert.equal(mime,'image/png');encoded++;if(canvasBlocked)throw Error('SecurityError');return png;}};
   if(tag==='a'){const anchor={href:'',download:'',click(){anchor.clicked=true}};links.push(anchor);return anchor;}
   throw Error('Unexpected element '+tag);
  }};
 const navigator=type==='native'?{canShare(v){return v.files.length===1},async share(v){files.push(v)}}:
  type==='cancel'?{canShare(){return true},async share(){let error=Error('Dismissed');error.name='AbortError';throw error}}:
  type==='unsupported'?{canShare(){return false},async share(){throw Error('unavailable')}}:{};
 const sandbox={Math,Image,Date,Blob,File,Uint8Array,console,confirm(){return true},document,navigator,
  atob:s=>Buffer.from(s,'base64').toString('binary'),
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(js,sandbox,{filename:'game.js'});
 return{h:sandbox.window.__PK_TEST_TOOLS__,el,storage,draws,files,links,
  encoded:()=>encoded,images:()=>newImages,block:()=>{canvasBlocked=true}};
}
async function main(){
 assert(html.includes('ALPHA 0.14.3')&&html.includes('game.js?v=0.14.3')&&html.includes('style.css?v=0.14.3'));
 assert(html.includes('id="atlasBase"')&&html.includes('id="atlasForeground"')&&html.includes('id="atlasExport"'));
 assert(css.includes('.atlas-inspect-row #atlasExport')&&css.includes('min-height:44px'));
 const w=session('download'),{h,el}=w,p=h.p(),before=JSON.stringify(p),run=h.run();
 assert.equal(await h.shareAtlasArtwork(),false,'Cannot export art outside the view-only Atlas');
 assert.equal(h.openWorldAtlas(2),true);
 assert.equal(h.atlasExportFilename(),'primal-knight-atlas-tier-02-realm.png');
 assert.equal(w.el('atlasExport').listeners.click,h.shareAtlasArtwork,'Real Atlas button is wired to PNG export');
 assert.equal(await h.shareAtlasArtwork(),true);
 assert.deepEqual(w.draws.slice(0,4).map(x=>x[0]),['atlasBase','atlasMatte','atlasForeground','atlasHeraldry']);
 assert.deepEqual(w.draws[1].slice(1),[0,0,960,346],'Terrain renders at the exact 346px scenic height');
 assert.deepEqual(w.draws[3].slice(1),[0,0,960,540]);
 assert.equal(w.encoded(),1);
 assert.equal(w.links.length,1);
 assert.equal(w.links[0].download,'primal-knight-atlas-tier-02-realm.png');
 assert.equal(w.links[0].href,png);
 assert.equal(w.links[0].clicked,true);
 const artBefore=w.images();
 assert.equal(h.chooseAtlasBossStyle('iron'),true);
 assert.equal(h.toggleAtlasBossPhase(),true);
 assert.equal(h.atlasExportFilename(),'primal-knight-atlas-tier-02-iron-phase-ii.png');
 w.draws.length=0;
 assert.equal(await h.shareAtlasArtwork(),true);
 assert.deepEqual(w.draws.map(x=>x[0]),['atlasBase','atlasMatte','atlasBossStage','atlasForeground','atlasHeraldry']);
 assert.equal(w.images(),artBefore,'Export does not regenerate game Image caches');
 assert(h.toggleAtlasZoom(),'Can inspect zoomed art');
 w.draws.length=0;
 assert.equal(await h.shareAtlasArtwork(),true);
 assert.deepEqual(w.draws[0].slice(1),[0,0,960,540],'PNG exports full original-resolution image, never a zoomed crop');
 assert.equal(h.toggleAtlasComparison(),true);
 assert.equal(h.atlasExportFilename(),'primal-knight-atlas-tier-02-original.png');
 w.draws.length=0;
 assert.equal(await h.shareAtlasArtwork(),true);
 assert.deepEqual(w.draws.map(x=>x[0]),['atlasBase','atlasForeground'],'Compare Original exports exactly the visible baseline');
 assert.equal(h.toggleAtlasComparison(),true);
 assert.equal(h.stepWorldAtlas(1),true);
 assert.equal(h.atlasExportFilename(),'primal-knight-atlas-tier-03-iron-phase-ii.png');
 const prev=w.encoded(),prevDraw=w.draws.length;
 el('atlasMatte').complete=false;
 assert.equal(await h.shareAtlasArtwork(),false,'Incomplete Safari artwork never exports as a falsely complete PNG');
 assert.equal(w.encoded(),prev,'Loading images prevent PNG encoding');
 assert.equal(w.draws.length,prevDraw,'No partially layered drawing while a visible image is still loading');
 assert(el('toast').textContent.includes('ART STILL LOADING'));
 el('atlasMatte').complete=true;
 assert.equal(await h.shareAtlasArtwork(),true);
 assert.equal(h.closeWorldAtlas(),true);
 assert.equal(JSON.stringify(p),before,'Atlas screenshots do not change gear, levels, rewards, Sigils or milestone unlocks');
 assert.equal(Object.keys(w.storage).length,0,'Atlas capture makes zero save/storage writes');
 const a=session('native'),state=JSON.stringify(a.h.p());
 assert.equal(a.h.openWorldAtlas(30),true);
 a.h.chooseAtlasBossStyle('beast');
 assert.equal(a.h.atlasExportFilename(),'primal-knight-atlas-tier-30-beast-phase-i.png');
 assert.equal(await a.h.shareAtlasArtwork(),true);
 assert.equal(a.files.length,1,'Native iPhone file sharing invoked');
 assert.equal(a.links.length,0,'Successful share never triggers duplicate download');
 assert.equal(a.files[0].title,'Primal Knight · World Atlas Artwork');
 assert.equal(a.files[0].files[0].type,'image/png');
 assert.equal(a.files[0].files[0].name,'primal-knight-atlas-tier-30-beast-phase-i.png');
 assert(a.files[0].files[0].parts[0].length>40);
 assert.equal(JSON.stringify(a.h.p()),state);
 const b=session('cancel');b.h.openWorldAtlas(2);
 assert.equal(await b.h.shareAtlasArtwork(),false,'Cancelled Share Sheet is not an error');
 assert.equal(b.links.length,0,'Cancelling a native share must not secretly download artwork');
 const c=session('unsupported');c.h.openWorldAtlas(2);
 assert.equal(await c.h.shareAtlasArtwork(),true,'Unsupported Web Share uses local PNG fallback');
 assert.equal(c.links.length,1);
 const d=session('download');d.h.openWorldAtlas(2);d.block();
 assert.equal(await d.h.shareAtlasArtwork(),false,'Tainted canvas fails safely');
 assert.equal(d.links.length,0);
 assert(d.el('toast').textContent.includes('USE AN IPHONE SCREENSHOT'));
 run.phase='fighting';
 assert.equal(await w.h.shareAtlasArtwork(),false,'Closed Atlas cannot export into an active battle');
 console.log('PASS: native layered 960x540 Atlas PNG, current boss stage and Phase II, original compare, no zoom crop, image-load safety, iPhone share/cancel/download, no save mutations.');
 console.log('LIMIT: native Safari Share Sheet, actual painted image alignment and thermals require physical iPhone confirmation.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
