// Alpha 0.15.26 — deterministic original-default targeting and opt-in Wallguard.
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const game=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const SAVE='primal_knight_onslaught_save_v1';
class El{
 constructor(id){this.id=id;this.dataset={};this.style={};this.listeners={};this.hidden=false;this.disabled=false;this.innerHTML='';this.textContent='';this.className='';this.scrollTop=0;this.width=960;this.height=540;this.classList={add(){},remove(){},toggle(){}};}
 getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
 addEventListener(k,fn){this.listeners[k]=fn}
 querySelector(){return null}
 querySelectorAll(){return []}
}
function world(seed0=1518,source){
 let seed=seed0>>>0;const rand=Object.create(Math);
 rand.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
 const store=Object.assign(Object.create(null),source||{});
 const sandbox={Math:rand,Date,Image,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false}}},
  document:{hidden:false,getElementById:el,querySelectorAll(){return[]},addEventListener(){}},
  localStorage:{getItem(k){return Object.hasOwn(store,k)?store[k]:null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(game,sandbox,{filename:'game.js'});assert(sandbox.window.__PK_TEST_TOOLS__);
 return {h:sandbox.window.__PK_TEST_TOOLS__,store,el};
}
assert(html.includes('ALPHA 0.15.26')&&html.includes('game.js?v=0.15.26')&&html.includes('style.css?v=0.15.26'));
assert(css.includes('.focus-stance-panel')&&css.includes('min-height:76px')&&css.includes('@media(max-width:600px){.focus-stance-grid{grid-template-columns:1fr}'));
const f=world(151801),h=f.h,p=h.p(),run=h.run();
assert.equal(h.selectedFocusStance(),'threat','Existing players retain original target ordering by default');
assert.equal(h.normalizeFocusStance('evil'),'threat');
assert.equal(h.setFocusStance('invalid'),false);
assert(!Object.hasOwn(p,'focusStance'),'No new top-level character save field');
assert(h.renderFocusStances().includes('THREAT SENSE')&&h.renderFocusStances().includes('WALLGUARD'));
assert.equal(h.setFocusStance('threat'),true);
assert(h.enterSiege());
assert.equal(run.focusStance,'threat');
// These synthetic target fixtures test scoring only; not claimed as earned fights.
const specialist={type:'sapper',x:320,y:270,fuseTime:.9,dead:false,hp:100,max:100};
const imminent={type:'goblin',x:480,y:379,dead:false,hp:100,max:100};
run.enemies=[specialist,imminent];
assert.equal(h.sortedTargetEnemies()[0],specialist,'Original Threat Sense still prioritizes an armed fuse');
const beforeScore=h.threatPriority(specialist);
assert.equal(h.focusTargetScore(specialist),beforeScore,'Original focus priority is byte-for-byte unchanged');
assert.equal(h.setFocusStance('wallguard'),false,'Cannot switch targeting rules during siege');
assert.equal(run.focusStance,'threat','Attempted mid-siege change cannot change locked stance');
// Keep this fixture out of the earned history.
run.phase='ready';run.enemies=[];run.shots=[];
assert(h.setFocusStance('wallguard'),'Unlocked lobby may select Wallguard');
assert.equal(h.selectedFocusStance(),'wallguard');
assert.equal(f.store[h.focusStanceKey],'wallguard');
assert.equal(h.enterSiege(),true);
assert.equal(run.focusStance,'wallguard');
run.enemies=[specialist,imminent];specialist.dead=false;imminent.dead=false;
assert.equal(h.sortedTargetEnemies()[0],imminent,'Wallguard should prioritize true y>=365 breach zone');
assert(h.focusTargetScore(imminent)>h.focusTargetScore(specialist));
h.recordFocusRedirect(imminent);
assert.equal(run.focusRedirects,1,'Redirects are only counted after actual shot-target decisions');
assert.equal(h.threatPriority(specialist),beforeScore,'Wallguard does not redefine original threat math');
// The synthetic fixture must not create any earned rewards, or a fake archive.
run.phase='ready';run.enemies=[];run.shots=[];run.historyActive=false;
const legacy=h.normalizeSiegeHistory([{reason:'fallen',tier:1,startWave:1,lastWave:5,cleared:4,enemies:10,offenseTracked:true,wallPressureTracked:true}])[0];
assert.equal(legacy.focusStance,null,'Legacy archives cannot fabricate which stance was used');
assert.equal(legacy.focusRedirects,0);
// The original saved archive loads before device focus settings initialize.
// A veteran character with a real history must not crash on startup.
p.siegeHistory=[legacy];
assert(h.save());
const oldCharacter=world(151802,{[SAVE]:f.store[SAVE]});
assert.equal(oldCharacter.h.p().siegeHistory.length,1);
assert.equal(oldCharacter.h.p().siegeHistory[0].focusStance,null);
p.siegeHistory=[];
const forged=h.normalizeSiegeHistory([{reason:'fallen',tier:1,startWave:1,lastWave:5,cleared:4,enemies:10,focusStance:'wallguard',focusRedirects:Infinity}])[0];
assert.equal(forged.focusStance,'wallguard');
assert.equal(forged.focusRedirects,0,'Hostile imported counters are sanitized');
const summaries=[];
for(const seed of [15411,15423]){
 for(const mode of ['threat','wallguard']){
  const w=world(seed),tools=w.h,ch=tools.p(),r=tools.run();
  assert(tools.setFocusStance(mode));
  assert(tools.enterSiege(),'Only genuine game engine enters a new siege');
  assert.equal(r.focusStance,mode);
  assert.equal(tools.setFocusStance(mode==='threat'?'wallguard':'threat'),false);
  let ticks=0;
  while(r.phase!=='fallen'&&r.phase!=='completed'&&r.wavesCleared<6&&ticks<75000){
   tools.tick(.05);ticks++;
   assert(r.enemies.length<=24&&r.shots.length<=48,'Original mobile actor and projectile caps');
  }
  assert(ticks<75000&&r.wavesCleared>=1,'Genuine waves cleared, no dummy results');
  if(r.phase!=='fallen'&&r.phase!=='completed')tools.retreatFromSiege();
  const report=tools.siegeReport();
  assert.equal(report.focusStance,mode);
  assert(Number.isSafeInteger(report.focusRedirects)&&report.focusRedirects>=0);
  if(mode==='threat')assert.equal(report.focusRedirects,0);
  assert.equal(ch.siegeHistory[0].focusStance,mode);
  assert.equal(ch.siegeHistory[0].focusRedirects,report.focusRedirects);
  assert(ch.uniqueClears>0&&ch.battleSeconds>0);
  assert(ch.siegeHistory[0].offenseTracked&&ch.siegeHistory[0].wallPressureTracked);
  tools.renderSiegeReport();
  assert(w.el('siegeReportMetrics').innerHTML.includes('TARGETING STANCE'));
  assert(w.el('siegeReportMetrics').innerHTML.includes('WALLGUARD RETARGETS'));
  assert(tools.renderSiegeHistory(1).includes('TARGETING'));
  assert(tools.save());
  const saved=JSON.parse(w.store[SAVE]);
  assert.equal(saved.siegeHistory[0].focusStance,mode);
  assert(!Object.hasOwn(saved,'focusStance'),'Device stance never sneaks into original save schema');
  const reread=world(seed,{[SAVE]:w.store[SAVE],[tools.focusStanceKey]:w.store[tools.focusStanceKey]});
  assert.equal(reread.h.selectedFocusStance(),mode);
  assert.equal(reread.h.p().siegeHistory[0].focusStance,mode);
  summaries.push({seed,mode,clears:r.wavesCleared,launches:report.projectilesFired,redirects:report.focusRedirects,
   breaches:report.breaches,wallImpact:report.wallBreachDamage,firstClears:ch.uniqueClears});
 }
}
assert.equal(summaries.length,4);
console.log('ALPHA 0.15.26 GENUINE OPT-IN TARGETING OPENING SIEGES '+JSON.stringify(summaries));
console.log('PASS Alpha 0.15.26: original default preserved, real near-wall target reordering, per-siege locked opt-in, original doctrine math unaffected, no save key migration, bounded archive provenance, four authentic real-engine starting sieges, mobile stance selection');
