// Alpha 0.15.26 — battle plans use only earned existing abilities and real paid combat.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El {
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}});}
 addEventListener(k,f){this.listeners[k]=f;}
 querySelectorAll(){return [];}
 querySelector(){return null;}
}
function world(seed0=1520,source){
 let seed=seed0>>>0,rand=Object.create(Math);
 rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.assign(Object.create(null),source||{});
 const box={Math:rand,Date,Image,Blob,console,confirm(){return true;},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[];},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
  performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(game,box,{filename:'game.js'});
 assert(box.window.__PK_TEST_TOOLS__,'Original game QA hooks remain available');
 return {h:box.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.26')&&html.includes('style.css?v=0.15.26')&&html.includes('game.js?v=0.15.26'),
 'Live shell must reference the current version');
assert(css.includes('.siege-plans-grid')&&css.includes('min-height:48px')&&css.includes('@media(max-width:820px){.siege-plans-grid{grid-template-columns:1fr}'));
const instance=world(),h=instance.h,p=h.p(),r=h.run();
assert.equal(h.siegePlanData.length,3);
assert.equal(h.siegePlanStatus('vanguard').unlocked,true,'Original level-one plan is available');
assert.equal(h.siegePlanStatus('bastion').unlocked,false,'No unearned Guardian abilities');
assert.equal(h.siegePlanStatus('tempest').unlocked,false,'No unearned arcane abilities');
assert.equal(h.siegePlanStatus('unknown'),null);
const original=JSON.stringify(p),focusBefore=h.selectedFocusStance();
assert.equal(h.applySiegePlan('bastion'),false,'Locked plan never buys or grants abilities');
assert.equal(h.applySiegePlan('unknown'),false);
assert.equal(JSON.stringify(p),original);
assert.equal(h.selectedFocusStance(),focusBefore);
assert.equal(h.renderSiegePlans().includes('UNLOCK AT HERO LEVEL 5'),true);
assert.equal(h.renderSiegePlans().includes('UNLOCK AT HERO LEVEL 3'),true);
assert(h.applySiegePlan('vanguard'),'Existing level-one plan can be selected safely');
assert.equal(p.combatDoctrine,'vanguard');
assert.equal(p.combatPassive,'hunter');
assert.equal(p.doctrineTactic,'rapid');
assert.equal(h.selectedFocusStance(),'wallguard');
assert(h.siegePlanStatus('vanguard').active);
assert.equal(instance.store[h.focusStanceKey],'wallguard');
assert(!Object.hasOwn(JSON.parse(instance.store[SAVE]),'siegePlan'));
const reread=world(1521,{[SAVE]:instance.store[SAVE],[h.focusStanceKey]:instance.store[h.focusStanceKey]});
assert(reread.h.siegePlanStatus('vanguard').active,'Original character save plus device focus restore the exact plan');
h.renderTierLobby();
assert(instance.el('milestoneList').innerHTML.includes('BATTLE PLANS'));
assert(instance.el('milestoneList').innerHTML.includes('ARROWSTORM ADVANCE'));
assert(instance.el('milestoneList').innerHTML.includes('BASTION HOLD'));
assert(instance.el('milestoneList').innerHTML.includes('TEMPEST SCREEN'));
assert(h.enterSiege());
const immutableDuringBattle=JSON.stringify(p),focusInBattle=h.selectedFocusStance();
assert.equal(h.applySiegePlan('vanguard'),false,'No mid-siege plan changes even to active plan');
assert.equal(h.applySiegePlan('bastion'),false);
assert.equal(JSON.stringify(p),immutableDuringBattle);
assert.equal(h.selectedFocusStance(),focusInBattle);
h.retreatFromSiege();
const results=[];
for(const seed of [15411,15423]){
 const w=world(seed),tool=w.h,ch=tool.p(),battle=tool.run();
 let spent=0;
 for(let i=0;i<6;i++){
  const before=ch.essence;
  assert(tool.purchaseCouncilTraining('power'),'Earned original-price Might ranks before opening combat');
  spent+=before-ch.essence;
 }
 assert(spent>0&&ch.essence>=0);
 assert(tool.applySiegePlan('vanguard'));
 assert(tool.enterSiege());
 let loops=0;
 while(battle.phase!=='fallen'&&battle.phase!=='completed'&&battle.wavesCleared<8&&loops<95000){
  tool.tick(.05);loops++;
  assert(battle.enemies.length<=24&&battle.shots.length<=48,'Original actor/projectile budgets');
 }
 assert(loops<95000&&battle.wavesCleared>=6,'Level-up actually earned by real combat');
 if(battle.phase!=='fallen'&&battle.phase!=='completed')tool.retreatFromSiege();
 assert(ch.level>=5,'Guardian plan unlocked by genuine first battle rather than fabricated level');
 assert(tool.siegePlanStatus('bastion').unlocked);
 const prior={essence:ch.essence,gold:ch.gold,sigils:ch.sigils,
  firstClears:ch.uniqueClears,chapters:ch.firstWatchClaimed.length,history:ch.siegeHistory.length};
 assert(tool.applySiegePlan('bastion'),'Unlocked defensive plan uses existing abilities');
 assert.equal(ch.combatDoctrine,'aegis');
 assert.equal(ch.combatPassive,'sentinel');
 assert.equal(ch.doctrineTactic,'crisis');
 assert.equal(tool.selectedFocusStance(),'wallguard');
 assert.equal(ch.essence,prior.essence,'Choosing plan spends no Essence');
 assert.equal(ch.gold,prior.gold,'Choosing plan spends no Gold');
 assert.equal(ch.sigils,prior.sigils,'Choosing plan spends no Sigils');
 assert.equal(ch.uniqueClears,prior.firstClears,'Choosing plan awards no cleared waves');
 assert.equal(ch.firstWatchClaimed.length,prior.chapters);
 assert.equal(ch.siegeHistory.length,prior.history);
 assert(tool.enterSiege(),'Chosen plan plays real combat with saved earned level');
 assert.equal(tool.applySiegePlan('tempest'),false,'Even unlocked alternate plan cannot switch during battle');
 let ticks=0;
 while(battle.phase!=='fallen'&&battle.phase!=='completed'&&battle.wavesCleared<4&&ticks<95000){
  tool.tick(.05);ticks++;
 }
 assert(ticks<95000&&battle.wavesCleared>=1,'Earned defense battle progressed');
 if(battle.phase!=='fallen'&&battle.phase!=='completed')tool.retreatFromSiege();
 assert.equal(ch.siegeHistory[0].focusStance,'wallguard');
 assert(ch.siegeHistory[0].offenseTracked&&ch.siegeHistory[0].wavePressureTracked);
 assert(tool.applySiegePlan('tempest'),'Already earned level-three plan is selectable');
 assert.equal(ch.combatDoctrine,'storm');
 assert.equal(ch.combatPassive,'conductor');
 assert.equal(ch.doctrineTactic,'horde');
 assert.equal(tool.selectedFocusStance(),'threat');
 assert(tool.save());
 const reload=world(seed,{[SAVE]:w.store[SAVE],[tool.focusStanceKey]:w.store[tool.focusStanceKey]});
 assert(reload.h.siegePlanStatus('tempest').active,'All existing settings persisted to original save and device preference');
 assert.equal(reload.h.p().uniqueClears,ch.uniqueClears);
 assert.equal(reload.h.p().sigils,ch.sigils);
 assert.equal(reload.h.p().siegeHistory.length,ch.siegeHistory.length);
 assert(!Object.hasOwn(reload.h.p(),'siegePlan'),'No new top-level schema fields');
 results.push({seed,realPaidMightEssence:spent,firstClears:ch.uniqueClears,activeMinutes:+(ch.battleSeconds/60).toFixed(2),
  earnedLevel:ch.level,sieges:ch.siegeHistory.length,finalPlan:'tempest'});
}
assert.equal(results.length,2);
console.log('ALPHA 0.15.26 TRUE PAID BATTLE PLAN CAREERS '+JSON.stringify(results));
console.log('PASS Alpha 0.15.26: three coherent opt-in battle plans, original level locks and partial-failure protection, real paid original-game combat progression, real unlocked Guardian and Storm play, save/device preference reload, bounded siege archive, original target-cap integrity, responsive iPhone controls, no new character data or invented reward');
