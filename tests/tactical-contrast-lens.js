// Alpha 0.15.22 — real-game opt-in high-contrast lens; render-only invariants.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
function make(initial=''){
 const saved=Object.create(null),nodes=new Map(),paints=[],images=[];
 if(initial)saved.primal_knight_onslaught_clarity_lens_v1=initial;
 class El{
  constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.classList={add(){},remove(){},toggle(){}};}
  getContext(){const context={createLinearGradient(){return{addColorStop(){}}},fillRect(x,y,w,h){paints.push({x,y,w,h,color:this.fillStyle})}};return new Proxy(context,{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(){}setAttribute(k,v){this.attrs[k]=String(v);}querySelectorAll(){return [];}querySelector(){return null;}
 }
 const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){images.push(this);this.src='';this.complete=true;this.naturalWidth=72;this.naturalHeight=72;}}
 const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},localStorage:{getItem(k){return saved[k]??null;},setItem(k,v){saved[k]=String(v);},removeItem(k){delete saved[k];}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},performance:{now(){return 1000;}},URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 return{h:sandbox.window.__PK_TEST_TOOLS__,el,saved,paints,images};
}
assert(html.includes('ALPHA 0.15.22')&&html.includes('game.js?v=0.15.22')&&html.includes('style.css?v=0.15.22'),'Cache versions all match');
assert(html.includes('id="clarityLensToggle"')&&html.includes('aria-pressed="false"'),'Optional lens has a real battlefield control');
assert(css.includes('.clarity-lens-toggle:focus-visible')&&css.includes('min-height:44px'),'Keyboard and iPhone portrait target are visible');
const w=make(),{h,el,saved,paints,images}=w,r=h.run(),p=h.p(),characterBefore=JSON.stringify(p),imageCount=images.length;
assert.equal(h.clarityLensEnabled(),false,'Default preserves original territory art');
assert.equal(el('clarityLensToggle').textContent,'LENS');
assert.equal(el('clarityLensToggle').attrs['aria-pressed'],'false');
assert.equal(saved.primal_knight_onslaught_save_v1,undefined);
r.phase='fighting';r.speed=1;r.wave=35;r.tier=1;r.maxHealth=100;r.health=100;r.encounter=h.encounterDirector(35,1);
function foe(type,coords={}){
 return{type,hp:75,max:100,dead:false,x:480,y:230,wobble:0,speed:0,armor:0,buildup:0,burn:0,slow:0,golden:false,spellBreakDamage:0,crushWindup:0,bossFuryWindup:0,bossBlinkWindup:0,bossWardTimer:0,fuseTime:0,blinkWindup:0,frostWindup:0,thornWindup:0,nativeVanguard:false,relicGuardian:false,isBoss:false,bossPhase:1,...coords};
}
r.enemies=[foe('goblin'),foe('guardian',{x:300}),foe('shaman',{x:600})];r.shots=[];r.particles=[];r.floats=[];
const positions=r.enemies.map(x=>({x:x.x,y:x.y,hp:x.hp,type:x.type}));
h.refreshHUD();h.draw();
const normal=paints.splice(0);
assert.equal(normal.some(x=>x.color==='rgba(9,17,27,.34)'&&x.w===960&&x.h===340),false,'Normal scene stays originally authored');
assert.equal(normal.filter(x=>x.color==='#1e1b25'&&x.h===4).length,3,'Normal HP bar height remains original');
assert.equal(h.toggleClarityLens(),true,'Button toggles to high contrast');
assert.equal(saved.primal_knight_onslaught_clarity_lens_v1,'on','Only visual preference is stored');
assert.equal(saved.primal_knight_onslaught_save_v1,undefined,'Character save is not touched');
assert.equal(el('clarityLensToggle').attrs['aria-pressed'],'true');
assert.equal(el('clarityLensToggle').textContent,'LENS ON');
h.draw();const lens=paints.splice(0);
assert.equal(lens.filter(x=>x.color==='rgba(9,17,27,.34)'&&x.x===0&&x.y===96&&x.w===960&&x.h===340).length,1,'Exactly one background-only contrast wash');
assert.equal(lens.filter(x=>x.color==='#071221'&&x.h===6).length,3,'All live HP bars are six high-contrast pixels');
assert.equal(lens.filter(x=>x.color==='#d0f489'&&x.h===6).length,1,'Normal enemy HP becomes brighter');
assert.equal(lens.filter(x=>x.color==='#b1edfa'&&x.h===6).length,1,'Guardian retains a bright distinct tint');
assert.equal(lens.filter(x=>x.color==='#e2bcff'&&x.h===6).length,1,'Shaman retains a bright distinct tint');
const lensBar=lens.find(x=>x.color==='#071221');
const normalBar=normal.find(x=>x.color==='#1e1b25');
assert(lensBar.w>normalBar.w,'Tactical lens HP bar is genuinely wider');
assert.equal(images.length,imageCount,'Mode toggle creates no new image assets');
assert.deepEqual(r.enemies.map(x=>({x:x.x,y:x.y,hp:x.hp,type:x.type})),positions,'Toggle never alters enemy positions or health');
assert.equal(JSON.stringify(p),characterBefore,'Currency, XP, items, runes, milestones remain identical');
assert.equal(h.toggleClarityLens(),false,'Second toggle instantly restores original art');
h.draw();const restored=paints.splice(0);
assert.equal(restored.filter(x=>x.color==='#1e1b25'&&x.h===4).length,3,'Normal HP appearance returns with one tap');
assert.equal(restored.some(x=>x.color==='rgba(9,17,27,.34)'),false,'Normal scenery restores without the veil');
assert.equal(saved.primal_knight_onslaught_clarity_lens_v1,'off');
assert.equal(saved.primal_knight_onslaught_save_v1,undefined);
const reload=make('on');
assert.equal(reload.h.clarityLensEnabled(),true,'Separate device visual preference loads on restart');
assert.equal(reload.el('clarityLensToggle').attrs['aria-pressed'],'true');
const malformed=make('accidental');
assert.equal(malformed.h.clarityLensEnabled(),false,'Invalid visual preference defaults to original');
assert.equal(JSON.stringify(p),characterBefore,'Visual-only updates preserve the entire character progression');
console.log('PASS: opt-in accessible lens, true background contrast and thicker role-specific HP bars, iPhone cache/version, immediate reversible toggle, separate persistence, untouched enemy and character state.');
console.log('LIMIT: physical iPhone visual art and battery/thermal performance still require device acceptance.');
