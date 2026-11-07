// Alpha 0.15.13 — 90 authentic deep-milestone keepsakes and retroactive save safety.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const saved=Object.create(null),nodes=new Map();
class El {
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=String(v);}
 querySelectorAll(){return [];}querySelector(){return null;}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=128;this.naturalHeight=128;}}
const sandbox={Math,Date,Image,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return saved[k]??null;},setItem(k,v){saved[k]=String(v);},removeItem(k){delete saved[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(js,sandbox,{filename:'game.js'});
let h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.15.13')&&html.includes('game.js?v=0.15.13')&&html.includes('style.css?v=0.15.13'));
assert(css.includes('.milestone-entry.milestone-keepsake'),'Deep reward has themed visible identity');
assert.deepEqual(Array.from(h.keepsakeWaves),[1500,3000,6000]);
assert.equal(h.milestoneKeepsake(0,1500),null);assert.equal(h.milestoneKeepsake(31,1500),null);
assert.equal(h.milestoneKeepsake(1.5,1500),null);assert.equal(h.milestoneKeepsake(1,1250),null);
const ids=new Set(),names=new Set(),slots=['boots','ring','chest'];
for(let tier=1;tier<=30;tier++){
 const list=h.tierMilestones(tier);
 for(let i=0;i<3;i++){
  const wave=h.keepsakeWaves[i],item=h.milestoneKeepsake(tier,wave);
  assert(list.includes(wave),'Original one-time milestone exists in every territory');
  assert.equal(item.id,'keepsake_'+tier+'_'+wave);
  assert.equal(item.slot,slots[i]);assert.equal(item.rarity,2+i+Math.floor((tier-1)/10));
  assert.equal(item.plus,0);assert(item.legacyName.length>15);
  ids.add(item.id);names.add(item.legacyName);
  const prize=h.tierMilestone(tier,wave);
  assert.equal(prize.kind,'deepSigils','Original finite currency kind untouched');
  assert(prize.amount>0&&prize.detail.includes(item.legacyName));
  assert(prize.detail.includes('UNIQUE')&&prize.detail.includes('Primal Sigils'));
  assert.equal(h.tierMilestones(tier).filter(w=>w===wave).length,1);
 }
}
assert.equal(ids.size,90);assert.equal(names.size,90);
assert.equal(h.reconcileMilestoneKeepsakes(),0,'Fresh characters do not receive unearned gear');
assert.equal(p.pendingGear.length,0);
const sigilsBefore=p.sigils;
const keep=h.milestoneKeepsake(1,1500),prize=h.tierMilestone(1,1500);
assert.equal(h.rewardMilestone(1,1500),true);
assert.equal(p.milestones['1:1500'],true);
assert.equal(p.sigils,sigilsBefore+prize.amount,'Original Sigil payout remains unchanged');
assert.equal(p.inventory.filter(g=>g.id===keep.id).length,1,'One unique item actually awarded');
assert.equal(h.isProtectedMilestoneKeepsake(keep),true);
assert.equal(h.canSellGear(keep),false,'Finite earned keepsake cannot be salvaged');
const previousGold=p.gold,previousItems=p.inventory.length;
h.completeGearSale([keep]);
assert.equal(p.gold,previousGold);assert.equal(p.inventory.length,previousItems);
assert.equal(h.rewardMilestone(1,1500),false,'No second milestone or equipment reward');
assert.equal(p.sigils,sigilsBefore+prize.amount);
assert.equal(p.inventory.filter(g=>g.id===keep.id).length,1);
assert.equal(h.isProtectedMilestoneKeepsake({...keep,id:'keepsake_31_1500'}),false);
assert.equal(h.isProtectedMilestoneKeepsake({...keep,id:'keepsake_1_3000'}),false);
assert.equal(h.isProtectedMilestoneKeepsake({...keep,id:'keepsake_1_1500',slot:'chest'}),false);
assert.equal(h.canSellGear({id:'ordinary_unworn',slot:'boots',rarity:0,plus:0}),true);
// Same-tier real item rarity contributes to existing equip-based stat formulas.
const d0=h.damage(),wall0=h.maxWall();
const newChest=h.milestoneKeepsake(1,6000);
assert.equal(h.rewardMilestone(1,6000),true);
assert(p.inventory.some(g=>g.id===newChest.id));
p.equipped.chest=newChest.id;
assert(h.maxWall()>wall0,'Keepsake chest uses real armor multiplier when equipped');
assert(h.damage()>=d0,'Adding chest gear cannot harm offensive damage');
// Full 200-gear pouch reserves a unique reward instead of discarding it.
const existingKeepsakes=p.inventory.filter(g=>String(g.id).startsWith('keepsake_'));
p.inventory=existingKeepsakes.concat(Array.from({length:200-existingKeepsakes.length},(_,i)=>({id:'full_'+i,slot:'helm',rarity:0,plus:0})));
const beforeVault=p.pendingGear.length,second=h.milestoneKeepsake(2,3000);
const secondSigils=p.sigils;
assert.equal(h.rewardMilestone(2,3000),true);
assert.equal(p.sigils,secondSigils+h.tierMilestone(2,3000).amount);
assert.equal(p.pendingGear.length,beforeVault+1);
assert.equal(p.pendingGear.at(-1).id,second.id);
assert.equal(p.inventory.length,200);
assert.equal(h.rewardMilestone(2,3000),false);
assert.equal(p.pendingGear.filter(g=>g.id===second.id).length,1);
// Missing original milestone rewards are restored from legitimately claimed old records.
p.milestones['3:1500']=true;p.milestones['3:3000']=true;p.milestones['3:6000']=true;
const sigilsNoBackpay=p.sigils,itemsBeforeRetro=p.pendingGear.length;
assert.equal(h.reconcileMilestoneKeepsakes(),3,'Already-earned territory receives all missing keepsakes');
assert.equal(p.sigils,sigilsNoBackpay,'Retroactive gear never reissues milestone Sigils');
assert.equal(p.pendingGear.length,itemsBeforeRetro+3);
assert.equal(h.reconcileMilestoneKeepsakes(),0,'Repeated load cannot mint another keepsake');
assert.equal(p.pendingGear.length,itemsBeforeRetro+3);
p.inventory.pop();
assert.equal(h.claimPendingGear(),1,'Normal equipment vault claims reserved keepsake');
assert.equal(p.inventory.length,200);
assert.equal(p.pendingGear.length,itemsBeforeRetro+2);
assert.equal(h.isProtectedMilestoneKeepsake(p.inventory.at(-1)),true);
// Current backup restores claims, reserved gear, and original currencies.
const backup=JSON.parse(JSON.stringify(p));
assert.equal(h.validateProgressBackup(backup),true);
assert.equal(h.restoreProgressBackup(backup),true);
p=h.p();
assert.equal(p.sigils,backup.sigils);
assert.equal(p.milestones['3:6000'],true);
assert(p.inventory.some(g=>g.id==='keepsake_2_3000'));
assert.equal(p.pendingGear.filter(g=>g.id.startsWith('keepsake_3_')).length,3);
assert.equal(h.reconcileMilestoneKeepsakes(),0);
assert(saved.primal_knight_onslaught_save_v1);
// Old backups containing earned milestone flags but no new gear are backfilled on import.
const old=JSON.parse(JSON.stringify(backup));
old.inventory=old.inventory.filter(g=>!String(g.id).startsWith('keepsake_'));
old.pendingGear=old.pendingGear.filter(g=>!String(g.id).startsWith('keepsake_'));
old.milestones['4:1500']=true;
const oldSigils=old.sigils;
assert.equal(h.restoreProgressBackup(old),true);
p=h.p();
for(const key of ['1_1500','1_6000','2_3000','3_1500','3_3000','3_6000','4_1500'])
 assert(p.inventory.concat(p.pendingGear).some(g=>g.id==='keepsake_'+key),'Old legitimate claim backfilled '+key);
assert.equal(p.sigils,oldSigils);
assert.equal(h.reconcileMilestoneKeepsakes(),0);
assert.equal(p.explorationFinds['1:47'],backup.explorationFinds['1:47']);
console.log('PASS: 90 named/equippable deep keepsakes, original 30x10k and Sigil payouts, protected salvage, 200-bag Vault, retroactive 3-wave claims, original and legacy imports without duplication.');
console.log('LIMIT: physical iPhone art, device thermal and battery acceptance deferred by user to Alpha 0.15.');
