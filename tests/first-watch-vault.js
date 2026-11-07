// Alpha 0.10.12 — permanent First Watch rewards survive full bags.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
function game(seedValue=12012){
 let seed=seedValue>>>0;
 const math=Object.create(Math);math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';
   this.classList={add(){},remove(){},toggle(){}};this.innerHTML='';this.textContent='';
   this.disabled=false;this.hidden=false;this.scrollTop=0;this.width=960;this.height=540;
   this.listeners={};this.onclick=null;}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(t,callback){this.listeners[t]=callback;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null),localStorage={getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}};
 const sandbox={Math:math,Image,window:{__PK_TEST__:true,addEventListener(){}},document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
 localStorage,Date,performance:{now:()=>1000},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},console,confirm(){return true;},Blob,
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(code,sandbox,{filename:'game.js'});
 const h=sandbox.window.__PK_TEST_TOOLS__;assert(h,'Actual game test tools exist');
 return {h,el,store};
}
const w=game(),h=w.h,p=h.p();
assert.equal(p.pendingGear.length,0,'Existing players default to no queued equipment');
p.inventory=Array.from({length:200},(_,i)=>({id:'bag_'+i,slot:'helm',rarity:0,plus:0}));
p.runes=Array.from({length:240},(_,i)=>({id:'pouch_'+i,type:'ember',tier:1}));
p.uniqueClears=3000;p.battleSeconds=750*60;
const original={gold:p.gold,essence:p.essence,points:p.points,sigils:p.sigils};
const watch=h.earlyWatchChapters,totals=watch.reduce((sum,row)=>({
 gold:sum.gold+row[2],essence:sum.essence+row[3],points:sum.points+row[4],sigils:sum.sigils+row[5]
}),{gold:0,essence:0,points:0,sigils:0});
h.awardFirstWatch();
assert.equal(p.firstWatchClaimed.length,16,'All sixteen First Watch chapters complete once earned');
assert.equal(p.inventory.length,200,'A full equipment inventory never overflows');
assert.equal(p.runes.length,240,'A full rune pouch never overflows');
assert.equal(p.pendingGear.length,4,'All four one-time First Watch equipment rewards are reserved');
assert.equal(p.pendingRelics.length,2,'Both First Watch bonus runes are reserved in existing Rune Vault');
for(const [index,rank] of [[2,2],[6,3],[10,3],[15,4]]){
 const gear=p.pendingGear.find(x=>x.id==='first_watch_gear_'+index);
 assert(gear,'First Watch chapter '+(index+1)+' queues its own permanent unique gear');
 assert.equal(gear.rarity,rank,'Gear rarity for chapter '+(index+1)+' is unchanged');
 assert(gear.plus===0,'First Watch equipment has no invented enhancement rank');
}
for(const [index,family,tier] of [[4,'frost',2],[9,'storm',3]]){
 const rune=p.pendingRelics.find(x=>x.id==='first_watch_'+index);
 assert(rune,'First Watch rune '+index+' is reserved by original earned ID');
 assert.equal(rune.type,family,'Original rune family is preserved');
 assert.equal(rune.tier,tier,'Original rune tier is preserved');
}
assert.equal(p.gold-original.gold,totals.gold,'Full inventory does not alter First Watch gold');
assert.equal(p.essence-original.essence,totals.essence,'Full inventory does not alter First Watch essence');
assert.equal(p.points-original.points,totals.points,'Full inventory does not alter First Watch points');
assert.equal(p.sigils-original.sigils,totals.sigils,'No new Sigils are created by reservation');
const reserved=JSON.stringify({gear:p.pendingGear,runes:p.pendingRelics});
h.awardFirstWatch();
assert.equal(JSON.stringify({gear:p.pendingGear,runes:p.pendingRelics}),reserved,'Repeating completed First Watch cannot create duplicate loot');
assert.equal(h.storeEarnedGear({...p.pendingGear[0]}),'reserved','Duplicate reserved equipment IDs cannot create additional gear');
assert.equal(p.pendingGear.length,4,'Duplicate gear does not grow vault');
assert.equal(h.storeEarnedGear({id:'invalid',slot:'bogus',rarity:1}),'invalid','Invalid gear category is rejected');
assert.equal(h.storeEarnedGear({id:'invalid',slot:'helm',rarity:99}),'invalid','Invalid rarity is rejected');

h.renderTierLobby();
const lobby=w.el('milestoneList').innerHTML;
assert(lobby.includes('4 EARNED EQUIPMENT REWARDS RESERVED'),'Battle tier lobby explains deferred First Watch equipment');
assert(lobby.includes('Gear → Equipment'),'Lobby directs player to actual claim screen');
assert(lobby.includes('2 EARNED RUNES RESERVED'),'Both First Watch runes appear in existing Rune Vault reminder');
h.openTab('equipment');
const equipHtml=w.el('panelContent').innerHTML;
assert(equipHtml.includes('FIRST WATCH ARMORY · 4 EARNED ITEMS'),'Real equipment panel displays queued gear');
assert(equipHtml.includes('data-action="claimGear"'),'Claim action is present in the live equipment panel');
assert(equipHtml.includes('FREE EQUIPMENT SPACE TO CLAIM'),'Full bag prevents a destructive or futile gear claim');
assert.equal(h.claimPendingGear(),0,'No new gear can be retrieved into a full bag');
p.inventory.pop();
h.action('claimGear');
assert.equal(p.pendingGear.length,3,'Actual claim button behavior retrieves one earned item after room is made');
assert.equal(p.inventory.length,200,'First Watch equipment claim respects maximum 200 items');
assert.equal(p.inventory.at(-1).id,'first_watch_gear_2','Oldest earned gear is reclaimed first');
assert(w.el('panelContent').innerHTML.includes('FIRST WATCH ARMORY · 3 EARNED ITEMS'),'Equipment vault UI refreshes after successful claim');
const state=JSON.parse(JSON.stringify(p));
const second=game(12013),h2=second.h;
assert(h2.validateProgressBackup(state),'Exported backup with additive pendingGear validates');
assert.equal(h2.restoreProgressBackup(state,false),true,'Real backup restore accepts queued gear and runes');
assert.equal(h2.p().pendingGear.length,3,'All unclaimed gear survives save restore');
assert.equal(h2.p().pendingRelics.length,2,'All deferred First Watch runes survive save restore');
assert.deepEqual(JSON.parse(JSON.stringify(h2.p().pendingGear)),state.pendingGear,'Exact earned gear IDs, slot, rarity and order survive import');
h2.p().inventory.splice(0,3);h2.p().runes.splice(0,2);
assert.equal(h2.claimPendingGear(),3,'Three freed equipment slots collect three queued rewards');
assert.equal(h2.claimPendingRelics(),2,'Two freed rune slots collect both First Watch runes');
assert.equal(h2.p().pendingGear.length,0,'Gear queue empties only on verified retrieval');
assert.equal(h2.p().pendingRelics.length,0,'Rune queue empties only after claim');
assert.equal(h2.p().inventory.length,200,'No equipment cap overflow after mass claim');
assert.equal(h2.p().runes.length,240,'No rune cap overflow after mass claim');
assert(h2.p().inventory.some(g=>g.id==='first_watch_gear_15'),'Legendary First Watch gear is fully recoverable');
assert(h2.p().runes.some(r=>r.id==='first_watch_9'),'Later First Watch rune is fully recoverable');
assert.equal(h2.claimPendingGear(),0,'Already claimed gear cannot be claimed again');
assert.equal(h2.claimPendingRelics(),0,'Already claimed runes cannot be claimed again');
const ids=h2.p().inventory.map(g=>g.id);
assert.equal(ids.length,new Set(ids).size,'No duplicate gear is generated across restore/claim');
h2.renderTierLobby();
assert(!second.el('milestoneList').innerHTML.includes('EARNED EQUIPMENT REWARDS RESERVED'),'Lobby clears earned gear alert after claiming all');
const fresh=game(12014),fh=fresh.h,fp=fh.p();
fp.battleSeconds=750*60;fp.uniqueClears=3000;
const origCount=fp.inventory.length,origRunes=fp.runes.length;
fh.awardFirstWatch();
assert.equal(fp.inventory.length,origCount+4,'First Watch gear still grants immediately with free space');
assert.equal(fp.runes.length,origRunes+2,'First Watch runes still grant immediately with free space');
assert.equal(fp.pendingGear.length,0,'No unnecessary gear vault when inventory has room');
assert.equal(fp.pendingRelics.length,0,'No unnecessary rune vault when pouch has room');
assert(html.includes('ALPHA 0.15.3')&&html.includes('game.js?v=0.15.3'),'Safari receives the updated version without old cached assets');
console.log('PASS: Alpha 0.10.12 all sixteen First Watch rewards, 4 protected gear pieces and 2 protected runes, actual claim UI/action, no duplicate payouts, full-bag caps, save restore, and normal free-space grants.');
