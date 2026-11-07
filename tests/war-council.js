// Alpha 0.11.2 — grounded faction-specific pre-siege intelligence and safe equip.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const game=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
function world(seedValue=1112){
 let seed=seedValue>>>0;
 const random=Object.create(Math);
 random.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class El{
  constructor(id){this.id=id;this.style={};this.dataset={};this.hidden=false;this.disabled=false;
   this.innerHTML='';this.textContent='';this.width=960;this.height=540;this.scrollTop=0;
   this.className='';this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},
    {get(o,key){return o[key]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(type,cb){this.listeners[type]=cb;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const store=Object.create(null);
 const sandbox={Math:random,Image,Date,console,Blob,
  window:{__PK_TEST__:true,addEventListener(){}},
  document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false},
  localStorage:{getItem(k){return store[k]??null;},setItem(k,v){store[k]=String(v);},removeItem(k){delete store[k];}},
  performance:{now:()=>1000},setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},confirm(){return true;},
  URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});
 const h=sandbox.window.__PK_TEST_TOOLS__;
 assert(h,'The real game exposes War Council tests');
 return {h,el,store};
}
const sim=world(),h=sim.h,p=h.p(),run=h.run();
assert.equal(p.level,1);
assert.equal(h.warCouncilPlan(1,1).training,true,'Starter wave is correctly identified as an introductory encounter');
assert.equal(h.warCouncilPlan(1,1).recommended.doctrine,'vanguard','Starter build uses the available Hunter’s Volley');
assert.equal(h.warCouncilPlan(1,1).recommended.passive,'hunter','Starter passive is Predator’s Eye');
assert.equal(h.warCouncilPlan(1,1).upcoming.wave,10,'Next event preview uses actual elite wave from encounter director');
assert.equal(h.warCouncilPlan(1,1).guide.threat,'FIRST WATCH PATROLS','Early waves do not falsely imply faction specialists appear immediately');
assert.equal(h.warCouncilPlan(2,20).recommended.doctrine,'vanguard','Level one does not recommend locked Arcane Chain');
assert.equal(h.warCouncilPlan(2,20).recommended.passive,'hunter','Level one does not recommend locked passives');
p.level=3;
assert.equal(h.warCouncilPlan(2,20).recommended.doctrine,'storm','Ironbound shields favor unlocked multi-target Arcane Chain');
assert.equal(h.warCouncilPlan(2,20).recommended.passive,'conductor','Ironbound tactical pairing includes lightning passive');
p.level=5;
const expected=[
 ['mire','aegis','sentinel'],['iron','storm','conductor'],
 ['ash','vanguard','hunter'],['night','aegis','sentinel'],
 ['crown','storm','conductor'],['frostvein','vanguard','hunter'],
 ['cinder','vanguard','hunter'],['gilded','vanguard','hunter'],
 ['thorn','vanguard','hunter'],['rift','vanguard','hunter']
];
for(let tier=1;tier<=10;tier++){
 const advice=h.warCouncilPlan(tier,20),director=h.encounterDirector(20,tier),[faction,active,passive]=expected[tier-1];
 assert.equal(advice.factionId,faction,'Tier '+tier+' uses real chapter faction, never invented opponents');
 assert.equal(advice.faction,director.faction,'War Council matches actual encounter director faction label');
 assert.equal(advice.recommended.doctrine,active,'Tier '+tier+' has strategy-specific active discipline');
 assert.equal(advice.recommended.passive,passive,'Tier '+tier+' has strategy-specific passive');
 assert(advice.guide.tip&&advice.guide.risk,'Every faction has real weakness and counterplay details');
 assert(['frost','ember','storm'].includes(advice.guide.rune),'Rune advice uses real, implemented equipment families');
 assert(advice.recommended.fit>=8,'At level five, every faction has a strong specialist pairing');
}
assert.equal(new Set(expected.map(row=>row[1])).size,3,'War Council offers three different viable active doctrines');
assert.equal(new Set(expected.map(row=>row[2])).size,3,'War Council meaningfully varies passive advice');
assert.equal(h.warCouncilPlan(1,101).factionId,'iron','New century chapter rotates to real next faction');
assert.equal(h.warCouncilPlan(2,101).factionId,'ash','Tier offset affects the next chapter as expected');
assert.equal(h.warCouncilPlan(1,99).upcoming.wave,100,'Boss preview identifies exact upcoming century boss');
assert.equal(h.warCouncilPlan(1,25).guide.threat,'SIEGE BEAST CRUSHER','Entering wave 25 recommends boss-focused counterplay');
assert.equal(h.warCouncilPlan(1,25).recommended.doctrine,'vanguard','Commander start emphasizes a true interruptible boss');
assert.equal(h.warCouncilPlan(1,100).guide.threat,'IRON WARD COUNTERPLAY','The century Iron Tyrant takes priority over ordinary faction advice');
assert.equal(h.warCouncilPlan(1,200).guide.threat,'EMBER CHARGE COUNTERPLAY','The actual Ember century boss has bespoke strategy');
assert.equal(h.warCouncilPlan(1,300).guide.threat,'VOID STEP COUNTERPLAY','The actual Rift century boss has bespoke strategy');
assert.equal(h.warCouncilPlan(30,10000).upcoming.wave,10000,'Last tier wave 10,000 has a valid in-range boss preview');
assert.equal(h.warCouncilPlan(30,10000).guide.threat,'IRON WARD COUNTERPLAY','Final boss preview respects the chapter cycle');
for(const tier of [1,7,13,17,24,30]){
 for(const wave of [1,20,25,94,100,101,500,2500,10000]){
  const counsel=h.warCouncilPlan(tier,wave);
  assert(counsel.recommended&&h.combatDoctrineData[counsel.recommended.doctrine],'Every deep-wave scenario recommends a real ability');
  assert(h.combatPassiveData[counsel.recommended.passive],'Every scenario recommends a real passive');
  assert(counsel.upcoming===null||(counsel.upcoming.wave>=wave&&counsel.upcoming.wave<=10000),
    'No deep-wave preview predicts a past encounter or wave beyond 10,000');
 }
}
// Rune synergy recommendations are based strictly on truly owned and socketed runes.
p.runes.push({id:'council_storm',type:'storm',tier:3});
let plan=h.warCouncilPlan(2,20);
assert.equal(plan.runeOwned,1,'War Council finds a real owned Storm rune');
assert.equal(plan.runeEquipped,false,'Owning a rune does not pretend it is socketed');
assert(h.renderWarCouncil(2,20).includes('OWNED · EQUIP IN RUNE WORKSHOP'),
 'War Council gives a grounded path to the actual Rune Workshop');
const base=h.warCouncilFit('storm','conductor',h.factionWarCouncil.iron,{});
p.socketed.amulet='council_storm';
plan=h.warCouncilPlan(2,20);
assert.equal(plan.runeEquipped,true,'War Council reads real socketed rune ID from current loadout');
assert.equal(plan.currentFit,h.warCouncilFit(p.combatDoctrine,p.combatPassive,plan.guide,p.socketed),
 'Current fit includes actual equipped rune synergy');
assert.equal(h.warCouncilFit('storm','conductor',plan.guide,p.socketed),base+1,
 'Socketing a matching owned rune increases tactical fit by exactly one');
assert(h.renderWarCouncil(2,20).includes('SOCKETED AND READY'),'Rune benefit status updates after socketing');
assert.equal(h.warCouncilFit('storm','conductor',plan.guide,{amulet:'nonexistent'}),base,
 'Phantom rune IDs do not create false synergy');
assert.equal(h.warCouncilFit('nonsense','hunter',plan.guide),0,'Unknown abilities never gain fit points');

// Saved presets remain evaluated independently from the currently equipped pair.
p.combatDoctrine='storm';p.combatPassive='conductor';
assert.equal(h.saveCombatLoadout(0),true,'Existing SAVE action captures lightning build');
p.combatDoctrine='vanguard';p.combatPassive='hunter';p.socketed={};
assert.equal(h.saveCombatLoadout(1),true,'Existing SAVE action captures precision build');
const savedBuild=JSON.parse(JSON.stringify(p.combatLoadouts));
p.milestones['1:100']=true;
h.renderTierLobby();
let shown=sim.el('milestoneList').innerHTML;
assert(shown.includes('THE WAR COUNCIL'),'Real Battle lobby renders the War Council');
assert(shown.includes('IRON WARD COUNTERPLAY'),'Waystone preview prioritizes actual current boss');
assert(shown.includes('TIER I · WAVE 100'),'Briefing updates to earned deep waystone start');
assert(shown.includes('TACTICAL MATCH'),'Saved preset cards show faction-based comparisons');
assert(shown.indexOf('war-council')<shown.indexOf('combat-build-presets'),'Advice appears before the three quick loadouts');
assert(shown.includes('data-war-council="apply"'),'Actual one-tap strategy action exists');
assert(shown.includes('Guidance only, not a simulated win rate'),'Fit rating is not misleadingly described as win probability');

// Applying War Council advice changes only ability pair, not owned gear or saved loadouts.
p.combatDoctrine='storm';p.combatPassive='conductor';
const before=JSON.stringify({inventory:p.inventory,runes:p.runes,equipped:p.equipped,socketed:p.socketed,
  combatLoadouts:p.combatLoadouts,gold:p.gold,essence:p.essence,sigils:p.sigils,level:p.level});
const initialScroll=117;sim.el('milestoneList').scrollTop=initialScroll;
const handler=sim.el('milestoneList').listeners.click;
handler({target:{closest(sel){
 if(sel==='[data-war-council]')return{disabled:false,dataset:{warCouncil:'apply'}};
 return null;
}}});
assert.equal(p.combatDoctrine,'vanguard','Real pre-siege click chooses boss counter active doctrine');
assert.equal(p.combatPassive,'hunter','Real pre-siege click chooses focus-fire passive');
assert.equal(sim.el('milestoneList').scrollTop,initialScroll,'Pre-siege advice click preserves long lobby scroll position');
assert.equal(JSON.stringify({inventory:p.inventory,runes:p.runes,equipped:p.equipped,socketed:p.socketed,
  combatLoadouts:p.combatLoadouts,gold:p.gold,essence:p.essence,sigils:p.sigils,level:p.level}),before,
 'War Council applies no equipment, currency, or permanent progress changes');
assert.deepEqual(JSON.parse(JSON.stringify(p.combatLoadouts)),savedBuild,
 'Saved player builds are never overwritten by War Council guidance');
assert.equal(JSON.parse(sim.store.primal_knight_onslaught_save_v1).combatDoctrine,'vanguard',
 'One-tap prep selection is saved in the existing original save key');
assert(h.renderWarCouncil(1,100).includes('PAIR EQUIPPED'),'Advice displays an accurate equipped state');
const savedBefore=sim.store.primal_knight_onslaught_save_v1;
assert.equal(h.applyWarCouncil(),true,'Applying already-equipped advice is harmless');
assert.equal(p.combatDoctrine,'vanguard','Repeat applies cannot flip away from recommended build');

// Changing starting waystone mode updates briefing without modifying owned progress.
handler({target:{closest(sel){
 if(sel==='[data-start-mode]')return{dataset:{startMode:'fresh'}};
 return null;
}}});
assert(sim.el('milestoneList').innerHTML.includes('TIER I · WAVE 1'),'Fresh start correctly shows wave-one advisory');
assert(sim.el('milestoneList').innerHTML.includes('FIRST WATCH PATROLS'),'Fresh start does not predict the century boss at wave one');
h.enterSiege();
const live={active:p.combatDoctrine,passive:p.combatPassive};
assert.equal(h.applyWarCouncil(),false,'War Council cannot change pair during live combat');
assert.deepEqual([p.combatDoctrine,p.combatPassive],[live.active,live.passive],
 'Refused live change does not partially modify build');
assert.equal(h.renderWarCouncil(1,100).includes('IRON WARD COUNTERPLAY'),true,
 'Read-only preview can still be computed without combat mutation');
h.retreatFromSiege();
assert.equal(h.applyWarCouncil(),true,'After retreat, preparation becomes available again');

// Do not permit a simplified unrelated click target to be treated as the council.
handler({target:{closest(){return {disabled:false,dataset:{startMode:'fresh'}};}}});
assert.equal(p.combatDoctrine,'vanguard','Unrelated tier navigation cannot accidentally trigger War Council apply');

// Need no saved JSON fields or unsupported stats to generate tactical advice.
const saveData=JSON.parse(sim.store.primal_knight_onslaught_save_v1);
assert.equal(Object.prototype.hasOwnProperty.call(saveData,'warCouncil'),false,'Recommendations do not add a permanent save field');
assert.equal(Object.prototype.hasOwnProperty.call(saveData,'tactics'),false,'No artificial permanent encounter data is stored');
assert(html.includes('ALPHA 0.15.3')&&html.includes('game.js?v=0.15.3'),
 'Alpha 0.11.2 has new iPhone Home Screen cache-busted assets');
assert(css.includes('.war-council-choice button')&&css.includes('min-height:44px'),
 'One-tap recommendation is a readable 44px mobile control');
assert(css.includes('.war-council-heading')&&css.includes('max-width:750px'),
 'War Council has responsive portrait and landscape rules');
console.log('PASS: Alpha 0.11.2 actual 10-faction intelligence, 3 distinct build strategies, commander and century boss exceptions, 30-tier deep-wave forecast, real owned/socketed runes, saved preset match ratings, one-tap safe preparation and zero new save fields.');
