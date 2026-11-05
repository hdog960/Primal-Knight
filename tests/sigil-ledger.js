// Alpha 0.11.7 — finite, player-visible Sigil economy accounting.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
function world(){
 class El{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.textContent='';this.innerHTML='';this.hidden=false;this.disabled=false;this.scrollTop=0;this.width=960;this.height=540;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(t,fn){this.listeners[t]=fn;}querySelectorAll(){return [];}querySelector(){return null;}
 }
 const els=new Map(),el=id=>els.get(id)||(els.set(id,new El(id)),els.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const storage=Object.create(null);
 const sandbox={Math,Image,Blob,Date,console,confirm(){return true;},window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
  localStorage:{getItem(k){return storage[k]??null;},setItem(k,v){storage[k]=String(v);},removeItem(k){delete storage[k];}},
  setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},performance:{now:()=>1000},
  URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,el,storage};
}
const {h,el,storage}=world(),p=h.p();
const start=h.sigilLedgerSummary();
assert.equal(start.held,0,'Starting Sigils are not fabricated');
assert.equal(start.claimed,0,'Starter has not won any Sigil milestone');
assert.equal(start.earnedWatch,0,'Starter has not earned First Watch Sigils');
let directMilestoneTotal=0,awardCount=0;
for(let tier=1;tier<=30;tier++){
 for(const wave of h.tierMilestones(tier)){
  const amt=h.sigilMilestoneAmount(tier,wave);
  assert(Number.isSafeInteger(amt)&&amt>=0,'Every milestone has a nonnegative finite Sigil value');
  if(amt)awardCount++;
  directMilestoneTotal+=amt;
  const prize=h.tierMilestone(tier,wave);
  if(prize.kind==='century')assert.equal(amt,12+3*tier,'Century milestones use their separate Sigil rule');
  if(prize.kind==='starter'||prize.kind==='rune'||prize.kind==='essence'||prize.kind==='gold'||prize.kind==='banner')
   assert.equal(amt,0,'Gold, Gear and Essence awards are never counted as Sigils');
 }
}
assert.equal(start.unclaimed,directMilestoneTotal,'Ledger covers all live rewards in 30 real tiers');
assert.equal(start.achievements,awardCount,'Only actual Sigil-bearing achievements are counted');
assert.equal(start.unlockedRemaining+start.lockedRemaining,start.unclaimed,'Locked and unlocked budgets partition exactly');
assert.equal(start.unclaimedWatch,h.earlyWatchChapters.reduce((n,row)=>n+row[5],0),
 'All remaining First Watch Sigils use actual chapter amounts');
assert.equal(start.future,start.unclaimed+start.unclaimedWatch,'Total future grants count each reward once');
assert.equal(start.eventualCapacity,start.held+start.future,'No Sigil purchasing power is invented');
assert(start.future>=start.remainingCosts,'Full finite reward schedule must cover all current Legacy, Ascension and Oath ranks');
assert(start.remainingCosts>0&&start.legacyRequired>0&&start.ascensionRequired>0&&start.oathRequired>0,
 'All three permanent Sigil-consuming progression categories are audited');
let markup=h.renderSigilLedger();
assert(markup.includes('PRIMAL SIGIL LEDGER')&&markup.includes('UNCLAIMED · ALL 30 TIERS'),
 'Expandable real Power → Training ledger is rendered');
assert(markup.includes('not spendable now'),'Locked-tiers forecast is clearly not current purchasing power');
assert(css.includes('.sigil-ledger-grid')&&css.includes('@media(max-width:780px)'),
 'Responsive phone layout is present');
h.openTab('training');
assert(el('panelContent').innerHTML.includes('PRIMAL SIGIL LEDGER'),
 'Actual Training panel includes the new long-term Sigil ledger');
const incomeBefore=p.sigils;
assert.equal(h.rewardMilestone(1,15),true,'Starter can claim legitimate First Watch-era Legacy milestone');
assert.equal(p.sigils,incomeBefore+5,'Legacy first gate pays exactly five Sigils');
const afterGate=h.sigilLedgerSummary();
assert.equal(afterGate.unclaimed,start.unclaimed-5,'Claimed milestone leaves future pool once');
assert.equal(afterGate.claimed,start.claimed+5,'Claimed ledger records exact earned value');
assert.equal(afterGate.eventualCapacity,start.eventualCapacity,'Claiming only transfers future Sigils to held');
assert.equal(h.rewardMilestone(1,15),false,'No repeated claiming of one-time Sigils');
assert.equal(h.sigilLedgerSummary().eventualCapacity,afterGate.eventualCapacity,'Retry cannot duplicate projected wealth');
const beforeLegacy=p.sigils;
h.action('legacy:siegebreaker');
assert(p.sigils<beforeLegacy,'Legacy investment spends real finite currency');
const afterSpent=h.sigilLedgerSummary();
assert.equal(afterSpent.eventualCapacity,start.eventualCapacity-(beforeLegacy-p.sigils),
 'Spending changes total future purchasing capacity by exactly the spent amount');
assert.equal(start.remainingCosts-afterSpent.remainingCosts,beforeLegacy-p.sigils,
 'The one-rank future cost is removed only after that rank is purchased');
const beforeOath=h.sigilLedgerSummary();
p.milestones['17:250']=true; // TEST ONLY: unlock a late path, not a simulated player.
p.sigils=1000;
const originalOath=p.sovereignOaths.sovereignBlade||0;
const oathPrice=h.oathCost(['sovereignBlade','Sovereign Blade','',30,58,17,250,'power']);
h.action('oath:sovereignBlade');
assert.equal(p.sovereignOaths.sovereignBlade,originalOath+1,'Real Sovereign Blade rank purchased');
assert.equal(p.sigils,1000-oathPrice,'Oath costs use the authentic rank formula');
assert.equal(beforeOath.oathRequired-h.sigilLedgerSummary().oathRequired,oathPrice,
 'Next Oath cost decreases by exactly the spent purchased rank');
assert(html.includes('ALPHA 0.12.17')&&html.includes('game.js?v=0.12.17')&&html.includes('style.css?v=0.12.17'),
 'New Safari release keeps its original save URL but refreshes code assets');
console.log('SIGIL AUDIT: '+JSON.stringify({milestoneGrants:directMilestoneTotal,firstWatchGrants:start.unclaimedWatch,
 totalFiniteSupply:start.future,allPermanentRanksCost:start.remainingCosts,
 remainingSurplus:start.future-start.remainingCosts,awardCount}));
console.log('PASS: live Sigil sources, separate century rewards, double-claim protection, exact Legacy/Oath spending, 30-tier forecasts, true Power screen and iPhone asset version.');
console.log('LIMIT: full lifetime supply assumes all 30 tiers and First Watch completed; not an attainable playtime estimate.');
