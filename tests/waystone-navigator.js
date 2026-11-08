// Alpha 0.15.24 — genuine earned-waystone selection and goal navigation.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const storage=Object.create(null),nodes=new Map();
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.className='';this.textContent='';this.innerHTML='';this.hidden=false;this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}}}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}
 addEventListener(k,fn){this.listeners[k]=fn}setAttribute(k,v){this.attrs[k]=String(v)}
 querySelectorAll(){return []}querySelector(){return null}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=128;this.naturalHeight=128;}}
const sandbox={Math,Date,Image,Blob,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
 document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
 performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
vm.runInNewContext(js,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.15.24')&&html.includes('game.js?v=0.15.24')&&html.includes('style.css?v=0.15.24'));
assert(css.includes('.waystone-navigator-options'));
assert.equal(h.earnedWaystones(1).join(','),'1');
assert.equal(h.renderWaystoneNavigator(1),'');
assert.equal(h.selectEarnedWaystone(1,100),false);
assert.equal(h.focusUnclaimedMilestone(1,400),true,'An unclaimed target before any checkpoint should allow wave 1');
assert.equal(h.startWaveForTier(1),1);
h.resetWaystoneNavigation();
const fullOptions=[100,250,500,1000,1500,2500,4000,6000,8000,9000];
p.unlockedTier=2;
for(const w of fullOptions)p.milestones['1:'+w]=true;
p.milestones['2:100']=true;p.milestones['2:250']=true;
assert.equal(h.earnedWaystones(1).join(','),'1,'+fullOptions.join(','));
assert.equal(h.earnedWaystones(2).join(','),'1,100,250');
assert.equal(h.earnedWaystones(3).length,0,'Locked territory must never expose a checkpoint');
assert.equal(h.nearestEarnedWaystone(1,750),500);
assert.equal(h.nearestEarnedWaystone(2,750),250);
assert.equal(h.nearestEarnedWaystone(1,99),1);
assert.equal(h.nearestEarnedWaystone(1,10001),null);
assert.equal(h.selectEarnedWaystone(1,600),false,'No invented checkpoints');
assert.equal(h.selectEarnedWaystone(1,9000),true);
assert.equal(h.startWaveForTier(1),9000);
assert.equal(h.renderWaystoneNavigator(1).includes('data-waystone-wave="9000"'),true);
assert.equal(h.renderWaystoneNavigator(1).includes('MANUAL START · WAVE 9,000'),true);
const before=JSON.stringify(p);
assert.equal(h.focusUnclaimedMilestone(1,9500),false,'Tier I does not offer Tier XVII-only milestones');
assert.equal(h.focusUnclaimedMilestone(1,7500),true);
assert.equal(h.startWaveForTier(1),6000,'Target wave 7,500 must choose last earned <= target');
assert.equal(h.selectedMilestoneTarget(),7500);
assert.equal(JSON.stringify(p),before,'Navigation cannot grant currency or change saved character');
assert.equal(h.focusUnclaimedMilestone(1,250),false,'Already claimed milestone is not a goal');
assert.equal(h.selectEarnedWaystone(1,8000),true);
assert.equal(h.selectedMilestoneTarget(),null);
assert.equal(h.startWaveForTier(1),8000);
h.enterSiege();
assert.equal(r.phase,'fighting');assert.equal(r.wave,8000);assert.equal(r.startWave,8000);
assert.equal(h.selectEarnedWaystone(1,250),false,'Cannot change start mid-siege');
assert.equal(h.focusUnclaimedMilestone(1,7500),false,'Cannot retarget live combat');
h.retreatFromSiege();
assert.equal(p.siegeHistory.length,1);
assert.equal(p.siegeHistory[0].startWave,8000,'Chronicle must record genuine chosen start');
// Normal wave-1 mode clears custom selection through actual delegated lobby click.
const list=el('milestoneList');
function clickSelector(selector,dataset){
 const element={dataset,disabled:false};
 list.listeners.click({target:{closest:q=>q===selector?element:null}});
}
clickSelector('[data-start-mode]',{startMode:'fresh'});
assert.equal(h.startWaveForTier(1),1);assert.equal(h.selectedWaystoneWave(),null);
clickSelector('[data-start-mode]',{startMode:'waystone'});
assert.equal(h.startWaveForTier(1),9000);
clickSelector('[data-waystone-wave]',{waystoneWave:'500'});
assert.equal(h.startWaveForTier(1),500);
assert.equal(el('launchTierButton').textContent.includes('WAVE 500'),true);
clickSelector('[data-milestone-target]',{milestoneTarget:'7500'});
assert.equal(h.startWaveForTier(1),6000);
assert.equal(h.selectedMilestoneTarget(),7500);
const tierButton={disabled:false,dataset:{tier:'2'}};
el('tierGrid').listeners.click({target:{closest:q=>q==='[data-tier]'?tierButton:null}});
assert.equal(p.selectedTier,2);
assert.equal(h.selectedWaystoneWave(),null);
assert.equal(h.startWaveForTier(2),250);
assert.equal(h.selectEarnedWaystone(1,9000),false,'Previous territory selection is isolated');
assert.equal(h.selectEarnedWaystone(2,250),true);
assert.equal(h.selectScoutRoute(2,'signal-347'),true);
assert.equal(h.selectedWaystoneWave(),null,'Scout Routebook overrides and clears manual choice');
assert.equal(h.startWaveForTier(2),250,'SCOUT target uses nearest earned waystone');
assert.equal(h.selectEarnedWaystone(2,100),true);
assert.equal(h.startWaveForTier(2),100);
assert.equal(h.focusUnclaimedMilestone(2,400),true);
assert.equal(h.startWaveForTier(2),250);
assert.equal(h.selectedMilestoneTarget(),400);
const backup=JSON.parse(JSON.stringify(p));
assert.equal(h.restoreProgressBackup(backup,false),true);
assert.equal(h.selectedWaystoneWave(),null);
assert.equal(h.selectedMilestoneTarget(),null);
assert.equal(h.startWaveForTier(2),250,'Import returns to latest earned per imported tier');
assert.equal(JSON.stringify(h.earnedWaystones(1)),JSON.stringify([1,...fullOptions]));
assert.equal(JSON.stringify(p).includes('selectedWaystoneWave'),false);
assert.equal(JSON.stringify(p).includes('selectedMilestoneTarget'),false);
console.log('PASS Alpha 0.15.24 Waystone Navigator: 10 real checkpoints, route priority, start-wave, target focus, save isolation');
