// Alpha 0.11.8 — purchases must match the real finite Sigil economy and Battle UI.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.textContent='';this.innerHTML='';this.scrollTop=0;this.width=960;this.height=540;this.listeners={};this.hidden=false;this.disabled=false;this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}
 addEventListener(k,fn){this.listeners[k]=fn}querySelectorAll(){return []}querySelector(){return null}
}
const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
const storage=Object.create(null);
const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){}},
 document:{getElementById:el,querySelectorAll(){return []},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(game,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert.equal(p.sigils,0);
assert.equal(h.renderWarChest(1,1),'','Fresh heroes do not see a meaningless locked mastery store');
assert.equal(h.purchaseWarChest('legacy','siegebreaker'),false,'Legacy is locked before real first milestone');
const gear=JSON.stringify(p.inventory),runes=JSON.stringify(p.runes),initialSigilCapacity=h.sigilLedgerSummary().eventualCapacity;
assert.equal(h.rewardMilestone(1,15),true,'Actual one-time legacy milestone grants Sigils');
assert.equal(p.sigils,5);
assert.equal(p.legacyUnlocked,true);
const offers=h.warChestOffers(1,1);
assert.equal(offers.available,5);
assert.equal(offers.totalUnlocked,3,'All three authentic Legacy paths are unlocked');
assert.equal(offers.upcoming.wave,20,'Wave 15 is claimed; next unclaimed Tier I wave 20 grants one-time Sigils');
assert(offers.options.every(x=>x.cost>0&&x.rank===0&&x.affordable));
const markup=h.renderWarChest(1,1);
assert(markup.includes('SOVEREIGN WAR CHEST')&&markup.includes('data-war-chest="legacy:siegebreaker"'),
 'Actual battle-prep War Chest displays priced legal upgrades');
h.renderTierLobby();
assert(el('milestoneList').innerHTML.includes('SOVEREIGN WAR CHEST'),'Real lobby contains War Chest');
const first=offers.options[0],beforeRank=p.legacy[first.id]||0,before=p.sigils;
const saveKey='primal_knight_onslaught_save_v1',click=el('milestoneList').listeners.click;
assert.equal(typeof click,'function','Real delegated iPhone click handler exists');
el('milestoneList').scrollTop=142;
click({target:{closest(selector){
 if(selector==='[data-war-chest]')return {disabled:false,dataset:{warChest:first.kind+':'+first.id}};
 return null;
}}});
assert.equal(p.legacy[first.id],beforeRank+1,'One real tap buys exactly one permanent Legacy rank');
assert.equal(p.sigils,before-first.cost,'Live mastery purchase spends the actual quoted Sigil price');
assert.equal(JSON.parse(storage[saveKey]).legacy[first.id],beforeRank+1,'Purchase persisted in original iPhone save key');
assert.equal(el('milestoneList').scrollTop,142,'Battle scroll position stays unchanged');
assert.equal(JSON.stringify(p.inventory),gear,'No equipped or owned gear was touched');
assert.equal(JSON.stringify(p.runes),runes,'No runes were touched');
assert.equal(h.sigilLedgerSummary().eventualCapacity,initialSigilCapacity-first.cost,
 'Finite budget decreases only by the exact Sigils actually spent');
const beforeInvalid=JSON.stringify({sigils:p.sigils,legacy:p.legacy,ascension:p.ascension,sovereignOaths:p.sovereignOaths});
for(const [kind,id] of [['legacy','__proto__'],['oath','sovereignAegis'],['ascension','vanguard'],['invalid','test']])
 assert.equal(h.purchaseWarChest(kind,id),false,'Forged or not-yet-unlocked purchase rejected');
assert.equal(JSON.stringify({sigils:p.sigils,legacy:p.legacy,ascension:p.ascension,sovereignOaths:p.sovereignOaths}),
 beforeInvalid,'Rejected War Chest attempts never change saved resources or ranks');
r.phase='fighting';
assert.equal(h.purchaseWarChest('legacy','guardianOath'),false,'Cannot buy permanent ranks during a battle');
r.phase='intermission';
assert.equal(h.purchaseWarChest('legacy','guardianOath'),false,'Cannot buy ranks between waves');
r.phase='fallen';
const affordableNext=h.warChestOffers(1,1).options.find(x=>x.affordable);
assert(affordableNext,'At least one genuine rank remains affordable');
assert.equal(h.purchaseWarChest(affordableNext.kind,affordableNext.id),true,'Can buy a real rank after a defeat');
assert.equal(h.rewardMilestone(1,15),false,'No duplicate Sigils on replay');
const current=h.sigilLedgerSummary();
assert.equal(current.eventualCapacity,initialSigilCapacity-(5-p.sigils),'No repeat-claim increases total budget');
assert(css.includes('.war-chest-offer button')&&css.includes('min-height:44px')&&css.includes('max-width:750px'),
 'Large iPhone portrait tap controls and compact narrow layout exist');
assert(html.includes('ALPHA 0.12.17')&&html.includes('game.js?v=0.12.17')&&html.includes('style.css?v=0.12.17'),
 'Release banner and cache-busting assets use current version');
console.log('PASS: one-tap genuine Battle Sigil purchases, actual unlocks/caps/prices, zero duplication, original saves, first-view UI, scroll and touch sizes.');
