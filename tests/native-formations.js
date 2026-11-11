// Alpha 0.15.27 — native march formation geometry and real battle spawn isolation.
'use strict';
const { assetVersionAtLeast } = require('./asset-version.js');
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('game.js','utf8'),html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
function world(randomMath=Math){
 const elements=new Map(),saved=Object.create(null);
 class El{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.textContent='';this.innerHTML='';this.scrollTop=0;this.width=960;this.height=540;this.hidden=false;this.disabled=false;this.listeners={};this.classList={add(){},remove(){},toggle(){}};}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(o,k){return o[k]||(()=>{});},set(o,k,v){o[k]=v;return true;}});}
  addEventListener(k,cb){this.listeners[k]=cb;}querySelectorAll(){return [];}querySelector(){return null;}
 }
 const get=id=>elements.get(id)||(elements.set(id,new El(id)),elements.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const sandbox={Math:randomMath,Image,Date,Blob,console,confirm(){return true},window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:false};}},
 document:{getElementById:get,querySelectorAll(){return[];},addEventListener(){},hidden:false},
 localStorage:{getItem(k){return saved[k]??null;},setItem(k,v){saved[k]=String(v);},removeItem(k){delete saved[k]}},
 setTimeout(){return 0;},clearTimeout(){},requestAnimationFrame(){},performance:{now(){return 1000;}},URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(code,sandbox,{filename:'game.js'});
 return {h:sandbox.window.__PK_TEST_TOOLS__,get,saved};
}
const {h,p}=(()=>{const w=world();return {h:w.h,p:w.h.p()};})();
const orders=h.nativeMarchOrders;
assert.equal(Object.keys(orders).length,8,'Every existing native role receives a distinct march order');
assert.equal(new Set(Object.values(orders).map(x=>x.name)).size,8,'Eight formations have unique labels');
assert.equal(new Set(Object.values(orders).map(x=>x.lanes.join(','))).size,8,'Eight formations use genuinely different lane layouts');
for(const [unit,order] of Object.entries(orders)){
 assert.equal(order.lanes.length,6,'All roles use the established six battlefield lanes');
 assert(order.lanes.every(x=>Number.isFinite(x)&&x>=160&&x<=800),'No lane points outside the playable approach');
 assert(order.note.length>=20&&order.name.length>=8,'Honest, readable tactical field guidance');
}
const original=JSON.stringify(p);
for(let tier=1;tier<=30;tier++){
 const native=h.territoryVanguard(tier),plan=h.nativeMarchOrder(tier),enc=h.encounterDirector(35,tier);
 assert.equal(plan,orders[native.unit],'Every realm inherits its native role formation');
 assert(h.hasNativeVanguard(enc),'Wave 35 is eligible for real native formations');
 assert(h.renderEncounterIntel(tier).includes(plan.name),'Pre-siege panel shows true formation');
 for(let index=0;index<23;index++){
  const type=index===2||index===8?native.unit:'skeleton';
  const pos=h.formationPosition(enc,index,type,false,false,false);
  assert(Number.isFinite(pos.x)&&pos.x>=145&&pos.x<=815,'All marching x positions stay within the battle width');
  assert(Number.isFinite(pos.y)&&pos.y>=124&&pos.y<=163,'Marching starts behind the fortress approach');
  assert(Math.abs(pos.x-plan.lanes[index%6])<=37,'Real formation geometry follows regional six-lane pattern');
  if(['shaman','banneret','frostbinder','thornweaver'].includes(type))assert(pos.y<=142,'Support casters deploy in the rear');
  else assert(pos.y>=145,'Frontline troops deploy in front of caster ranks');
 }
 const boss=h.formationPosition(enc,23,'ogre',true,false,false);
 assert(boss.x>=457&&boss.x<=503&&boss.y>=134&&boss.y<=143,'Original vanguard elite ogre uses the legacy central boss placement');
 for(const wave of [5,10,25,37,50,100,10000])assert.equal(h.hasNativeVanguard(h.encounterDirector(wave,tier)),false,'Tutorial, bosses and other events never gain native formations');
}
// Night ambush: a real center feint now splits the old two-lane pincer into
// three targetable groups, while retaining the exact existing spawn budget.
for(const tier of [1,4,15,30]){
 const enc=h.encounterDirector(17,tier);
 assert.equal(enc.kind,'ambush','Wave 17 remains an existing ambush encounter');
 for(let i=0;i<24;i++){
  const pos=h.formationPosition(enc,i,i%3===0?'warg':'raider');
  assert(pos.x>=145&&pos.x<=815&&pos.y>=143&&pos.y<=183,'Ambush units stay in the playable approach');
  if(i%3===0)assert(pos.x>=157&&pos.x<=193,'Left flank approaches the left lane');
  if(i%3===1)assert(pos.x>=767&&pos.x<=803,'Right flank approaches the right lane');
  if(i%3===2)assert(pos.x>=438&&pos.x<=522&&pos.y<170,'Center feint deploys between the two flanks');
 }
}
// Successive night ambushes use different center-feint lanes without changing
// the established left-warg/right-raider flanks or saved progression.
for(const [wave,center] of [[34,412],[51,548],[68,412],[85,548]]){
 const enc=h.encounterDirector(wave,4);
 if(enc.kind!=='ambush')continue; // existing higher-priority wave events win
 for(let i=0;i<18;i++){
  const pos=h.formationPosition(enc,i,i%3===0?'warg':'raider');
  if(i%3===2)assert(Math.abs(pos.x-center)<=32,'Later ambush center feint sweeps into its planned lane');
  const tighter=Math.floor(wave/17)%2===1;
  const left=tighter?225:175,right=tighter?735:785;
  if(i%3===0)assert(Math.abs(pos.x-left)<=9,'Warg flank alternates outer and inner approach');
  if(i%3===1)assert(Math.abs(pos.x-right)<=9,'Raider flank alternates outer and inner approach');
 }
}
// Verify actual alternating geometry on eligible ambush waves, without
// accidentally skipping every candidate due to higher-priority encounters.
let checkedWide=0,checkedTight=0;
for(let wave=34;wave<=170;wave+=17){
 const enc=h.encounterDirector(wave,4);
 if(enc.kind!=='ambush')continue;
 const tight=Math.floor(wave/17)%2===1;
 const left=h.formationPosition(enc,0,'warg'),right=h.formationPosition(enc,1,'raider');
 assert(Math.abs(left.x-(tight?225:175))<=9,'Left flank respects alternating approach');
 assert(Math.abs(right.x-(tight?735:785))<=9,'Right flank respects alternating approach');
 if(tight)checkedTight++;else checkedWide++;
}
assert(checkedWide>0&&checkedTight>0,'Both later ambush formation variants must be exercised');
assert.equal(JSON.stringify(p),original,'Inspecting territory formation plans does not change character progression');
for(let tier=1;tier<=30;tier++){
 const w=world(),g=w.h,r=g.run(),plan=g.nativeMarchOrder(tier);
 r.wave=35;r.tier=tier;r.maxHealth=g.maxWall();r.health=r.maxHealth;
 g.beginWave();
 assert.equal(w.get('encounterType').textContent,'NATIVE VANGUARD');
 assert(w.get('encounterHint').textContent.includes(plan.name),'Actual in-battle warning names the formation');
 for(let i=0;i<r.total;i++){r.spawned=i;g.spawnEnemy();}
 assert(r.enemies.length<=24,'Full actual native wave respects the 24-enemy cap');
 for(let i=0;i<r.enemies.length;i++){
  const e=r.enemies[i];if(e.isBoss)continue;
  assert(Math.abs(e.x-plan.lanes[i%6])<=37,'Spawned enemy uses actual native marching order');
 }
 assert(r.enemies.some(e=>e.nativeVanguard),'At least one true native unit deploys');
 assert(r.enemies.filter(e=>e.nativeVanguard).length<=2,'No extra regional units are spawned');
 assert(r.enemies.filter(e=>['shaman','frostbinder','thornweaver'].includes(e.type)).length<=3,'Caster safety cap is intact');
 assert.equal(w.saved.primal_knight_onslaught_save_v1,undefined,'Native formations do not write new character data');
}
// Adversarial seeded spawns: previous code could exhaust both specialist slots
// before the two regional slots, leaving a named Native Vanguard with zero natives.
const firstChoice=Object.create(Math);firstChoice.random=()=>0;
for(const tier of [7,9,10]){
 const w=world(firstChoice),g=w.h,r=g.run(),native=g.territoryVanguard(tier);
 r.tier=tier;r.wave=35;r.maxHealth=g.maxWall();r.health=r.maxHealth;
 g.beginWave();
 for(let i=0;i<r.total;i++){r.spawned=i;g.spawnEnemy();}
 assert.equal(r.enemies[0].type,'skeleton','Early faction specialist must defer to reserved native in '+native.name);
 assert.equal(r.enemies[1].type,'skeleton','Both early generic specialists defer to native in '+native.name);
 assert.equal(r.enemies[2].type,native.unit,'Reserved native specialist always spawns at slot 2');
 assert.equal(r.enemies[2].nativeVanguard,true,'Reserved native troop is marked on the real field');
 assert(r.enemies.filter(e=>e.nativeVanguard).length>=1,'At least one native identity is guaranteed');
 for(const type of ['shaman','frostbinder','thornweaver','sapper','riftstalker','banneret'])
  assert(r.enemies.filter(e=>e.type===type).length<=2,'Two-of-kind cap still enforced for '+type);
 assert(r.enemies.filter(e=>['shaman','frostbinder','thornweaver'].includes(e.type)).length<=3,'Global active caster cap is preserved');
}
// Frostvein and Gilded randomized specialists are DIFFERENT from the native role.
// They should not be replaced merely for being casters; the true native still appears.
for(const tier of [6,8]){
 const w=world(firstChoice),g=w.h,r=g.run(),native=g.territoryVanguard(tier);
 r.tier=tier;r.wave=35;r.maxHealth=g.maxWall();r.health=r.maxHealth;
 g.beginWave();for(let i=0;i<r.total;i++){r.spawned=i;g.spawnEnemy();}
 assert.notEqual(r.enemies[0].type,'skeleton','Unrelated faction specialist is not removed');
 assert.equal(r.enemies[2].type,native.unit,'Different-role native specialist still receives reserved slot');
 assert.equal(r.enemies[2].nativeVanguard,true,'True regional native appears');
 assert(r.enemies.filter(e=>['shaman','frostbinder','thornweaver'].includes(e.type)).length<=3,'Cross-type caster safety cap still enforced');
}
assert(html.includes('ALPHA 0.15.27')&&assetVersionAtLeast(html,'game.js','0.15.27')&&assetVersionAtLeast(html,'style.css','0.15.27'),'Mobile Home Screen receives the new asset versions');
assert(css.includes('.encounter-intel-native em'),'The in-game formation label is styled for readability');
console.log('PASS: eight distinctive formation geometries, 30 live native battlefield rosters, protected elite-ogre spawn and nonnative waves, safe caster and enemy caps, accurate in-game intel, no save or economy effects.');
console.log('LIMIT: iPhone physical-art, battery, thermal and long-session acceptance still requires device testing.');
