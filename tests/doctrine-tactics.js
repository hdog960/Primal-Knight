// Alpha 0.11.9 — deliberate fully-automatic ability strategy with safe save migration.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
function world(initialSave=null){
 class El{
  constructor(id){this.id=id;this.dataset={};this.style={};this.className='';this.innerHTML='';this.textContent='';this.hidden=false;this.disabled=false;this.scrollTop=0;this.width=960;this.height=540;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}})}
  addEventListener(k,fn){this.listeners[k]=fn}querySelector(){return null}querySelectorAll(){return []}
 }
 const els=new Map(),el=id=>els.get(id)||(els.set(id,new El(id)),els.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const storage=Object.create(null);
 if(initialSave)storage.primal_knight_onslaught_save_v1=JSON.stringify(initialSave);
 const sandbox={Math,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll(){return []},addEventListener(){},hidden:false},
  localStorage:{getItem(k){return storage[k]??null},setItem(k,v){storage[k]=String(v)},removeItem(k){delete storage[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,storage,el};
}
const {h,storage,el}=world(),p=h.p(),r=h.run();
const original=JSON.stringify({gold:p.gold,essence:p.essence,sigils:p.sigils,inventory:p.inventory,runes:p.runes});
assert.equal(p.doctrineTactic,'rapid','Fresh and legacy characters start with original auto-cast behavior');
assert.equal(Object.keys(h.doctrineTacticModes).length,3);
assert.equal(h.doctrineTacticEligible(),true,'Rapid preserves original unconditional ready-to-cast check');
assert.equal(h.chooseDoctrineTactic('__proto__'),false,'Malformed tactic strings are rejected');
assert.equal(h.chooseDoctrineTactic('horde'),true,'New automatic strategy may be chosen between sieges');
assert.equal(p.doctrineTactic,'horde');
assert.equal(h.doctrineTacticEligible(),false,'Horde mode holds when no enemy is present');
const closeEnemy={type:'goblin',dead:false,y:150};
r.enemies=[closeEnemy];r.health=r.maxHealth; // Synthetic scene used only for decision unit tests.
assert.equal(h.doctrineTacticEligible(),false,'Horde does not waste a ready ability on lone harmless enemy');
r.doctrineClock=0;r.phase='fighting';r.speed=1;const castCount=r.doctrineCasts||0;
assert.equal(h.advanceCombatDoctrine(.05),false,'Auto-cast clock waits at zero for required threat');
assert.equal(r.doctrineClock,0,'Waiting does not reset cooldown');
assert.equal(r.doctrineCasts||0,castCount,'Waiting creates no ghost ability cast');
assert.equal(h.chooseDoctrineTactic('crisis'),false,'Cannot change an automatic tactic during combat');
assert.equal(p.doctrineTactic,'horde','Blocked mid-siege change preserves chosen tactic');
r.enemies=[...Array.from({length:4},(_,i)=>({type:'goblin',y:150+i,dead:false}))];
assert.equal(h.doctrineTacticEligible(),true,'Horde activates on crowd of four');
r.phase='ready';r.enemies=[closeEnemy];r.health=r.maxHealth;
assert.equal(h.chooseDoctrineTactic('crisis'),true);
assert.equal(h.doctrineTacticEligible(),false,'Crisis saves an ability with no danger');
r.enemies[0].y=300;
assert.equal(h.doctrineTacticEligible(),true,'Crisis reacts to a foe close to the wall');
r.enemies[0].y=150;r.enemies[0].bossFuryWindup=.5;
assert.equal(h.doctrineTacticEligible(),true,'Crisis responds to an interrupted boss windup');
r.enemies[0].bossFuryWindup=0;
r.health=r.maxHealth*.7;
assert.equal(h.doctrineTacticEligible(),true,'Crisis automatically activates when the wall is damaged');
r.health=r.maxHealth;r.enemies=[];
const wallPrior=r.health,gearPrior=JSON.stringify(p.inventory);
const clockBefore=r.doctrineClock;
const tacticUI=h.renderDoctrineTactics(true);
assert(tacticUI.includes('data-doctrine-tactic="crisis"')&&tacticUI.includes('data-doctrine-tactic="rapid"'),
 'Battle UI offers original, crowd and crisis automatic strategies');
assert(tacticUI.includes('aria-pressed="true"'),'Selected mode is accessible');
h.openTab('hero');
assert(el('panelContent').innerHTML.includes('AUTOMATIC ABILITY STRATEGY'),
 'Hero Hall displays automatic strategy choices');
h.openTab('battle');h.renderTierLobby();
const list=el('milestoneList');assert(list.innerHTML.includes('AUTOMATIC ABILITY STRATEGY'));
const click=list.listeners.click;assert.equal(typeof click,'function');
list.scrollTop=155;
click({target:{closest(sel){
 if(sel==='[data-doctrine-tactic]')return {disabled:false,dataset:{doctrineTactic:'horde'}};
 return null;
}}});
assert.equal(p.doctrineTactic,'horde','Real Battle touch changes strategy');
assert.equal(list.scrollTop,155,'Mobile preparation scroll is restored');
assert.equal(JSON.parse(storage.primal_knight_onslaught_save_v1).doctrineTactic,'horde',
 'The mode is saved under the unchanged original iPhone save key');
assert.equal(r.doctrineClock,clockBefore,'Switching outside combat never resets or accelerates cooldown');
assert.equal(JSON.stringify({gold:p.gold,essence:p.essence,sigils:p.sigils,inventory:p.inventory,runes:p.runes}),original,
 'Choosing a tactic does not invent currency, duplicate equipment or consume runes');
assert.equal(JSON.stringify(p.inventory),gearPrior);
p.level=5;assert.equal(h.saveCombatLoadout(0),true);
assert.equal(p.combatLoadouts[0].tactic,'horde','New preset records automatic timing strategy');
assert.equal(h.chooseDoctrineTactic('crisis'),true);
assert.equal(h.applyCombatLoadout(0),true);
assert.equal(p.doctrineTactic,'horde','Loading a preset restores chosen timing strategy');
assert.equal(h.normalizeCombatLoadouts([{doctrine:'vanguard',passive:'hunter',equipped:{},socketed:{}},null,null])[0].tactic,'rapid',
 'Old saved builds without a timing field retain Rapid behavior');
const legacy={...JSON.parse(JSON.stringify(p))};
delete legacy.doctrineTactic;
const oldWorld=world(legacy);
assert.equal(oldWorld.h.p().doctrineTactic,'rapid','Old on-device save without tactics field is loaded safely');
assert.equal(oldWorld.h.p().combatLoadouts[0].tactic,'horde','Existing valid saved preset retains new own tactic');
const missing={...JSON.parse(JSON.stringify(p))};delete missing.doctrineTactic;
assert.equal(h.restoreProgressBackup(missing,false),true,'Old backup can be restored');
assert.equal(h.p().doctrineTactic,'rapid','Old backup normalizes to original ability timing');
const bad={...JSON.parse(JSON.stringify(p)),doctrineTactic:'__proto__'};
assert.equal(h.restoreProgressBackup(bad,false),true);
assert.equal(h.p().doctrineTactic,'rapid','Untrusted stored strategy is normalized');
assert(css.includes('.doctrine-tactics-options')&&css.includes('min-height:48px'),
 'Mobile strategy touch controls have accessible height');
assert(html.includes('ALPHA 0.12.8')&&html.includes('game.js?v=0.12.8')&&html.includes('style.css?v=0.12.8'),
 'Safari cache busting matches current release');
console.log('PASS: tactical auto-cast gates, preserved Rapid baseline, no cooldown exploits, actual iPhone Battle click, saved strategy presets, old-save and backup migration, HUD and mobile controls.');
