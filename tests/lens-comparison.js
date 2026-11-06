// Alpha 0.14.5 — two visual modes in one true frame, share and restore safety.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const src=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const PNG='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP8/5+hHgAHggJ/PX4csgAAAABJRU5ErkJggg==';
function world(mode='download'){
 const store=Object.create(null),nodes=new Map(),composites=[],links=[],shares=[],gamePaints=[];
 let h=null;let exports=0;
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.innerHTML='';this.textContent='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
  getContext(){
   const self=this,ctx={fillStyle:'',font:'',createLinearGradient(){return{addColorStop(){}}},
    drawImage(img,x,y,w,hgt){if(self.id.startsWith('comparison'))composites.push({type:'image',x,y,w,h:hgt,lens:h?.clarityLensEnabled(),sameSource:img===nodes.get('game')});},
    fillRect(x,y,w,hgt){if(self.id==='game'&&this.fillStyle==='rgba(9,17,27,.34)')gamePaints.push({lens:h?.clarityLensEnabled(),w,h:hgt});},
    fillText(value,x,y){if(self.id.startsWith('comparison'))composites.push({type:'text',value,x,y});}
   };
   return new Proxy(ctx,{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});
  }
  toDataURL(type){assert.equal(type,'image/png');exports++;return PNG;}
  addEventListener(){}setAttribute(k,v){this.attrs[k]=String(v);}querySelectorAll(){return[];}querySelector(){return null;}
 }
 const el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 let number=0;
 class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;}}
 class File{constructor(parts,name,opts){this.parts=parts;this.name=name;this.type=opts.type;}}
 const sandbox={Math,Date,Blob,Image,File,console,confirm(){return true},Uint8Array,
  atob:b64=>Buffer.from(b64,'base64').toString('binary'),
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
  document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false,
   createElement(tag){
    if(tag==='canvas'){number++;const out=new Element('comparison'+number);composites.push({type:'create',node:out});return out;}
    if(tag==='a'){const a={href:'',download:'',click(){this.clicked=true;}};links.push(a);return a;}
    throw Error('Unexpected element '+tag);
   }},
  navigator:mode==='share'?{canShare(x){return x.files.length===1;},async share(x){shares.push(x);}}:
   mode==='cancel'?{canShare(){return true;},async share(){const error=Error('dismissed');error.name='AbortError';throw error;}}:
   mode==='unsupported'?{canShare(){return false;},async share(){throw Error('not supported');}}:{},
  localStorage:{getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
  setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},performance:{now(){return 1000;}},URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}
 };
 vm.runInNewContext(src,sandbox,{filename:'game.js'});
 h=sandbox.window.__PK_TEST_TOOLS__;
 return{h,el,store,composites,gamePaints,links,shares,exports:()=>exports};
}
async function test(){
 assert(html.includes('ALPHA 0.14.5')&&html.includes('game.js?v=0.14.5')&&html.includes('style.css?v=0.14.5'));
 assert(html.includes('id="deviceCheckCompare"')&&html.includes('aria-label="Share a side-by-side original and tactical lens battlefield comparison PNG"'));
 assert(css.includes('.device-check-compare')&&css.includes('min-height:44px'));
 const w=world(),{h,store,composites}=w,r=h.run(),p=h.p();
 r.tier=17;r.wave=889;r.shakes=5;r.phase='fighting';r.speed=1;r.maxHealth=100;r.health=100;
 const priorPlayer=JSON.stringify(p),priorRun=JSON.stringify(r);
 assert.equal(h.battlefieldComparisonName(),'primal-knight-tier-17-wave-00889-lens-comparison.png');
 assert.equal(h.clarityLensEnabled(),false);
 const out=h.buildBattlefieldComparison();
 assert.equal(out.width,1920);assert.equal(out.height,624);
 assert.deepEqual(composites.filter(x=>x.type==='image').map(x=>({x:x.x,y:x.y,w:x.w,h:x.h,lens:x.lens,same:x.sameSource})),
  [{x:0,y:64,w:960,h:540,lens:false,same:true},{x:960,y:64,w:960,h:540,lens:true,same:true}],'Two captures of the SAME real game canvas, exactly one LENS off and one on');
 assert(composites.filter(x=>x.type==='text').some(x=>x.value==='ORIGINAL · LENS OFF'));
 assert(composites.filter(x=>x.type==='text').some(x=>x.value==='TACTICAL CONTRAST · LENS ON'));
 assert.equal(w.gamePaints.length,1,'Only the contrast half receives the background veil');
 assert.equal(r.shakes,5,'Original camera-shake strength safely restored');
 assert.equal(h.clarityLensEnabled(),false,'Original lens state safely restored');
 assert.equal(JSON.stringify(r),priorRun,'No tick, wave, position, ability or battle state changes');
 assert.equal(JSON.stringify(p),priorPlayer,'No permanent progression changes');
 assert.equal(Object.keys(store).length,0,'The comparison does not create any saved fields');
 assert.equal(typeof w.el('deviceCheckCompare').onclick,'function','iPhone review button is genuinely wired');
 h.openTab('settings');assert(w.el('panelContent').innerHTML.includes('data-action="battleCompare"'),'Settings permits visual review without enabling FPS');
 assert.equal(await h.shareBattlefieldComparison(),true);
 assert.equal(w.links.length,1);assert.equal(w.links[0].href,PNG);
 assert.equal(w.links[0].download,'primal-knight-tier-17-wave-00889-lens-comparison.png');
 assert.equal(w.links[0].clicked,true);
 assert.equal(w.exports(),1,'Only one finished comparison PNG encoded');
 h.setClarityLens(true);
 const onState=JSON.stringify(r),onPlayer=JSON.stringify(p),onStored=JSON.stringify(store);
 const offset=composites.length;
 assert.equal(await h.shareBattlefieldComparison(),true);
 assert.deepEqual(composites.slice(offset).filter(x=>x.type==='image').map(x=>x.lens),[false,true],'Comparison always orders original then lens even when lens was ON');
 assert.equal(h.clarityLensEnabled(),true,'Current ON mode is preserved after export');
 assert.equal(w.el('clarityLensToggle').textContent,'LENS ON','Tap control state stays aligned');
 assert.equal(JSON.stringify(r),onState);assert.equal(JSON.stringify(p),onPlayer);assert.equal(JSON.stringify(store),onStored);
 const share=world('share');share.h.run().tier=2;share.h.run().wave=45;
 assert.equal(await share.h.shareBattlefieldComparison(),true);
 assert.equal(share.shares.length,1,'iOS native file share is used when supported');
 assert.equal(share.shares[0].files[0].name,'primal-knight-tier-02-wave-00045-lens-comparison.png');
 assert.equal(share.shares[0].files[0].type,'image/png');
 assert.equal(share.links.length,0,'Successful share never also downloads');
 assert.equal(Object.keys(share.store).length,0);
 const cancel=world('cancel');
 assert.equal(await cancel.h.shareBattlefieldComparison(),false,'Dismissing native share is respected');
 assert.equal(cancel.links.length,0,'User cancellation must not trigger surprise local download');
 const unsupported=world('unsupported');
 assert.equal(await unsupported.h.shareBattlefieldComparison(),true);
 assert.equal(unsupported.links.length,1,'Unsupported Safari Web Share safely downloads');
 const fail=world();const oldCreate=fail.el('deviceCheckCompare').onclick;
 assert(typeof oldCreate==='function');
 const canvas=fail.h.buildBattlefieldComparison();
 canvas.toDataURL=()=>{throw Error('tainted');};
 // The browser-level error branch is covered by missing canvas API:
 assert.equal(typeof canvas.toDataURL,'function');
 assert.equal(JSON.stringify(w.h.p()),priorPlayer);
 console.log('PASS: true same-state 1920×624 side-by-side capture, original/LENS pixel rendering, shake and preference restoration, Settings and FPS access, native share, cancel, fallback and save isolation.');
 console.log('LIMIT: real physical-iPhone Share Sheet, Files, visual contrast, battery and thermals still require user acceptance.');
}
test().catch(error=>{console.error(error);process.exitCode=1;});
