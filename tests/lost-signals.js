// Alpha 0.15.2 — real Lost Signals encounter and permanent reward regression.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const saved=Object.create(null),nodes=new Map();
class El{
 constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.textContent='';this.innerHTML='';this.className='';this.hidden=id==='worldAtlas'||id==='deviceCheckPanel';this.disabled=false;this.width=960;this.height=540;this.scrollTop=0;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
 addEventListener(k,fn){this.listeners[k]=fn;}setAttribute(k,v){this.attrs[k]=String(v);}
 querySelectorAll(){return [];}querySelector(){return null;}
}
const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
class Image{constructor(){this.src='';this.complete=true;this.naturalWidth=96;this.naturalHeight=96;}}
const sandbox={Math,Date,Blob,Image,console,confirm(){return true},
 window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:el,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return saved[k]??null;},setItem(k,v){saved[k]=String(v);},removeItem(k){delete saved[k];}},
 performance:{now(){return 1000;}},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},
 URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
vm.runInNewContext(source,sandbox,{filename:'game.js'});
const h=sandbox.window.__PK_TEST_TOOLS__,p=h.p(),r=h.run();
assert(html.includes('ALPHA 0.15.2')&&html.includes('game.js?v=0.15.2')&&html.includes('style.css?v=0.15.2'));
assert(css.includes('.lost-signals')&&css.includes('min-height:44px'));
assert.equal(h.scoutSignalsSelected(),false,'Original play path defaults to NORMAL');
const waves=[47,147,347,747],slots=['helm','amulet','charm','gauntlets'],keys=new Set();
for(let tier=1;tier<=30;tier++){
 for(let i=0;i<waves.length;i++){
  const event=h.lostSignal(tier,waves[i]);
  assert(event&&event.key===tier+':'+waves[i],'Every tier has all four events');
  assert.equal(event.slot,slots[i]);assert.equal(event.rarity,i+1);
  assert.equal(h.encounterDirector(waves[i],tier).kind,'standard','Existing special encounter never overwritten');
  assert.equal(h.activeLostSignal(tier,waves[i],false),null);
  assert.equal(h.activeLostSignal(tier,waves[i],true).key,event.key);
  keys.add(event.key);
 }
 assert(h.renderLostSignalLedger(tier,1).includes('data-exploration-choice="on"'));
}
assert.equal(keys.size,120,'120 unique discoveries across 30 tiers');
for(const w of [1,7,10,20,25,35,37,43,50,100,10000])assert.equal(h.lostSignal(1,w),null);
assert.equal(h.lostSignal(0,47),null);assert.equal(h.lostSignal(31,47),null);
// The real Battle lobby click delegates route selection, not a fake separate menu.
const scout={dataset:{explorationChoice:'on'}};
el('milestoneList').listeners.click({target:{closest(selector){return selector==='[data-exploration-choice]'?scout:null;}}});
assert.equal(h.scoutSignalsSelected(),true);
assert(h.renderLostSignalLedger(1,1).includes('aria-pressed="true" class="selected">SCOUT'));
assert.equal(saved.primal_knight_onslaught_save_v1,undefined,'Choosing a route is session-only');
const before=JSON.stringify(p);
r.phase='ready';r.tier=1;r.wave=47;r.explorationEnabled=false;h.beginWave();
assert.equal(r.discoveryCurrent,null);
for(let i=0;i<r.total;i++){r.spawned=i;h.spawnEnemy();}
assert.equal(r.enemies.filter(e=>e.discoveryWarden).length,0,'NORMAL has no secret unit');
assert.equal(JSON.stringify(p),before);
r.phase='intermission';r.wave=47;r.explorationEnabled=true;h.beginWave();
assert.equal(r.discoveryCurrent.key,'1:47');
assert.equal(el('encounterType').textContent,'LOST SIGNAL','In-game banner announces live event');
for(let i=0;i<r.total;i++){r.spawned=i;h.spawnEnemy();}
const guards=r.enemies.filter(e=>e.discoveryWarden);
assert.equal(guards.length,1,'SCOUT spawns precisely one guardian');
const guard=guards[0];assert.equal(guard.type,'guardian');assert.equal(guard.isBoss,false);
assert(guard.max>0&&guard.armor>0);
assert.equal(r.enemies.length,r.total,'Guardian replaces an existing enemy slot');
assert(r.total<=24,'Mobile unit cap is preserved');
assert.equal(h.awardLostSignal(),false,'No loot before guardian death');
r.breaches=1;
h.hurt(guard,guard.max*100,'arcane');
assert.equal(r.discoveryWardenKilled,true,'Actual combat death identifies the guardian');
assert.equal(h.awardLostSignal(),false,'A breach forfeits the challenge');
r.breaches=0;
assert.equal(h.awardLostSignal(),true,'Defeated guardian and flawless wave award heirloom');
assert.equal(p.explorationFinds['1:47'],true);
const gear=p.inventory.find(g=>g.id==='signal_1_47');
assert(gear&&gear.legacyName.includes('WAYFINDER BEACON'));
assert.equal(gear.slot,'helm');assert.equal(gear.rarity,1);
const earnedKnowledge=p.knowledge,earnedItems=p.inventory.length;
assert.equal(h.awardLostSignal(),false,'First-clear reward never duplicates');
assert.equal(h.activeLostSignal(1,47,true),null,'Claimed encounter no longer adds a new guardian');
assert.equal(p.knowledge,earnedKnowledge);assert.equal(p.inventory.length,earnedItems);
r.phase='intermission';r.tier=2;r.wave=147;r.explorationEnabled=true;h.beginWave();
for(let i=0;i<r.total;i++){r.spawned=i;h.spawnEnemy();}
const next=r.enemies.find(e=>e.discoveryWarden);assert(next);
h.hurt(next,next.max*100,'arcane');
assert.equal(h.awardLostSignal(),true);
assert(p.inventory.some(g=>g.id==='signal_2_147'&&g.slot==='amulet'));
r.phase='intermission';r.tier=3;r.wave=347;r.explorationEnabled=true;h.beginWave();
for(let i=0;i<r.total;i++){r.spawned=i;h.spawnEnemy();}
const third=r.enemies.find(e=>e.discoveryWarden);assert(third);
h.hurt(third,third.max*100,'arcane');
p.inventory=Array.from({length:200},(_,i)=>({id:'full_'+i,slot:'helm',rarity:0,plus:0}));
const vaulted=p.pendingGear.length;
assert.equal(h.awardLostSignal(),true,'Full inventory protects the event reward');
assert.equal(p.pendingGear.length,vaulted+1);
assert.equal(p.pendingGear.at(-1).id,'signal_3_347');
assert.equal(h.awardLostSignal(),false);
assert.equal(p.pendingGear.filter(g=>g.id==='signal_3_347').length,1);
const backup=JSON.parse(JSON.stringify(p));
assert.equal(h.validateProgressBackup(backup),true,'Existing backup validates exploration ledger');
assert.equal(h.restoreProgressBackup(backup),true,'Old save importer accepts additive discovery records');
assert.equal(h.p().explorationFinds['3:347'],true);
assert(h.p().pendingGear.some(g=>g.id==='signal_3_347'),'Reserved heirloom survives an import');
assert.equal(h.p().sigils,backup.sigils,'No hidden Sigil farming');
assert.equal(h.p().milestones['3:347'],undefined,'No forged tier milestone');
assert(saved.primal_knight_onslaught_save_v1,'Still uses the original character save key');
console.log('PASS: 120 one-time discovery identities, real opt-in Battle control, capped guardian spawn and kill, breach-free requirement, 3 distinct claims, vault protection, import and Sigil safety.');
console.log('LIMIT: user deferred all manual iPhone testing until roadmap end (Alpha 0.15).');
