// Alpha 0.10.11 — full earned-rune vault regression across all 30 tiers.
'use strict';
const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm');
const code=fs.readFileSync('game.js','utf8');
function createWorld(seedValue=9911){
 let seed=seedValue>>>0;
 const seededMath=Object.create(Math);
 seededMath.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';
   this.classList={add(){},remove(){},toggle(){}};this.innerHTML='';this.textContent='';
   this.disabled=false;this.hidden=false;this.listeners={};this.width=960;this.height=540;this.scrollTop=0;}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(obj,key){return obj[key]||(()=>{});},set(obj,key,val){obj[key]=val;return true;}});}
  addEventListener(type,cb){this.listeners[type]=cb;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const els=new Map(),el=id=>els.get(id)||(els.set(id,new Element(id)),els.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null);
 const storage={getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}};
 const sandbox={Image,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
  window:{__PK_TEST__:true,addEventListener(){}},localStorage:storage,Math:seededMath,Date,performance:{now:()=>1000},
  setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},console,confirm(){return true;},Blob,
  URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(code,sandbox,{filename:'game.js'});
 const h=sandbox.window.__PK_TEST_TOOLS__;
 assert(h,'Real game exports its automated test hooks');
 return {h,el,store};
}
const {h,el,store}=createWorld(),p=h.p(),r=h.run();
const firstGold=p.gold,firstSigils=p.sigils,firstKnowledge=p.knowledge;
p.unlockedTier=30;
p.runes=Array.from({length:240},(_,i)=>({id:'owned_'+i,type:'ember',tier:1}));
let expectedGold=0;
for(let tier=1;tier<=30;tier++){
 const prize=h.tierMilestone(tier,35);
 assert.equal(prize.kind,'rune','All 30 tiers contain the one-time wave 35 rune');
 expectedGold+=prize.amount;
 assert.equal(h.rewardMilestone(tier,35),true,'Tier '+tier+' awards its first-clear prize');
 assert.equal(p.pendingRelics.length,tier,'Each full-pouch milestone queues its earned rune');
 assert.equal(p.runes.length,240,'Milestone '+tier+' never overflows the rune pouch cap');
 const got=p.pendingRelics[tier-1];
 assert.equal(got.id,'milestone_'+tier+':35','One-time rune keeps its unique, stable identity');
 assert(got.tier>=2&&got.tier<=12,'Rune tier is always in the legitimate 1–12 range');
 assert.equal(got.type,['ember','storm','frost','fortune'][(tier-1)%4],'Milestone rune family follows the original schedule');
 assert.equal(p.milestones[tier+':35'],true,'Milestone ledger prevents future farming');
}
assert.equal(p.gold-firstGold,expectedGold,'All one-time wave 35 Gold payouts still arrive');
assert.equal(p.sigils,firstSigils,'Moving rune into vault cannot mint extra Sigils');
assert.equal(p.knowledge,firstKnowledge,'Moving rune into vault does not change unrelated Knowledge');
assert.equal(h.rewardMilestone(1,35),false,'Replaying wave 35 cannot pay or enqueue its reward twice');
assert.equal(p.pendingRelics.length,30,'Replaying a milestone does not duplicate vault rewards');
assert.equal(h.storeEarnedRune({id:'milestone_1:35',tier:2,type:'ember'}),'reserved','Direct attempts to duplicate a queued milestone are rejected');
assert.equal(p.pendingRelics.length,30,'Duplicate rune ID cannot add a second queued copy');
assert.equal(h.storeEarnedRune({id:'invalid',tier:2,type:'made-up'}),'invalid','Unknown rune families are rejected');
assert.equal(h.storeEarnedRune({id:'invalid',tier:13,type:'ember'}),'invalid','Impossible rune tiers are rejected');
assert.equal(p.pendingRelics.length,30,'Rejected input does not consume inventory or vault slots');

h.renderTierLobby();
let milestoneView=el('milestoneList').innerHTML;
assert(milestoneView.includes('30 EARNED RUNES RESERVED'),'Battle lobby warns about all 30 safely queued milestone prizes');
assert(milestoneView.includes('Gear → Rune Workshop'),'Battle lobby points to real claim screen');
assert(milestoneView.includes('IN RUNE VAULT'),'A claimed but undelivered milestone visibly says its rune is in the vault');
// Relic Hunts and milestones must share the SAME preservation queue.
r.tier=1;r.wave=43;r.encounter=h.encounterDirector(43,1);r.breaches=0;
assert.equal(h.awardRelicChallenge(1,43,100),true,'Flawless Relic Hunt still awards once with a full pouch');
assert.equal(p.pendingRelics.length,31,'Relic Hunt joins the same ordered reward vault');
assert.equal(p.pendingRelics.at(-1).id,'relic1_43','Relic Hunt keeps its original distinct reward identity');
assert.equal(h.awardRelicChallenge(1,43,100),false,'Relic Hunt cannot farm duplicate vault entries');
assert.equal(h.claimPendingRelics(),0,'No rewards can overflow a completely full rune pouch');
p.runes.pop();
assert.equal(h.claimPendingRelics(),1,'Freeing one slot redeems exactly one queued prize');
assert.equal(p.runes.length,240,'Redeeming a reserved rune obeys 240-item cap');
assert.equal(p.runes.at(-1).id,'milestone_1:35','Oldest earned reward is claimed before newer ones');
assert.equal(p.pendingRelics.length,30,'Unclaimed earned runes remain in protected first-in queue');
h.renderTierLobby();
milestoneView=el('milestoneList').innerHTML;
assert(!milestoneView.includes('IN RUNE VAULT'),'Wave 35 returns to CLAIMED after its rune is collected');
assert(milestoneView.includes('30 EARNED RUNES RESERVED'),'The remaining queued rewards stay visible in the Battle lobby');

const snapshot=JSON.parse(JSON.stringify(p));
const other=createWorld(9912),reh=other.h;
assert.equal(reh.restoreProgressBackup(snapshot,false),true,'A saved full-pouch Rune Vault is accepted by real import');
assert.equal(reh.p().pendingRelics.length,30,'Import restores every unclaimed milestone or Relic Hunt rune');
assert.deepEqual(JSON.parse(JSON.stringify(reh.p().pendingRelics)),snapshot.pendingRelics,'Import preserves the original reward queue order and IDs');
assert.equal(reh.p().runes.length,240,'Imported pouch stays at its cap');
reh.p().runes.splice(0,30);
assert.equal(reh.claimPendingRelics(),30,'Freeing sufficient space redeems all still-reserved rewards');
assert.equal(reh.p().pendingRelics.length,0,'Reward vault empties when every rune is collected');
assert.equal(reh.p().runes.length,240,'Mass redemption never overfills the pouch');
assert.equal(reh.claimPendingRelics(),0,'Already claimed rewards cannot be collected again');
const recoveredIds=reh.p().runes.map(x=>x.id);
assert.equal(new Set(recoveredIds).size,recoveredIds.length,'Claimed earned runes never duplicate existing inventory IDs');
assert(recoveredIds.includes('milestone_30:35')&&recoveredIds.includes('relic1_43'),'Highest-tier milestone and Relic Hunt rewards both survive export/import');
assert(JSON.parse(other.store.primal_knight_onslaught_save_v1).milestones['30:35'],'Full restored save retains later milestone claim records');

const fresh=createWorld(9913),fh=fresh.h;
const countBefore=fh.p().runes.length,goldBefore=fh.p().gold;
assert.equal(fh.rewardMilestone(1,35),true,'Wave 35 still awards instantly if there is free pouch space');
assert.equal(fh.p().runes.length,countBefore+1,'Ordinary first-clear milestone gives rune directly');
assert.equal(fh.p().pendingRelics.length,0,'No needless queue when pouch space exists');
assert.equal(fh.p().gold-goldBefore,fh.tierMilestone(1,35).amount,'Ordinary milestone Gold reward is unchanged');
assert.equal(fh.storeEarnedRune({id:'milestone_1:35',type:'ember',tier:2}),'owned','Already-owned unique runes cannot be cloned');
assert.equal(fh.p().runes.length,countBefore+1,'Duplicate owned ID never creates a second rune');
console.log('PASS: Alpha 0.10.11 all 30 full-pouch wave-35 milestone rewards, one-time ledgers, shared Relic Hunt vault, first-in redemptions, lobby statuses, duplicate safety and save round-trips.');
