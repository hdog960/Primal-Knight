// Alpha 0.10.0 deterministic Living Onslaught encounter and unit behavior regression.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const code=fs.readFileSync('game.js','utf8');
function createWorld(seedValue=117){
 let seed=seedValue>>>0;
 const seededMath=Object.create(Math);
 seededMath.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.classList={add(){},remove(){},toggle(){}};this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;this.onclick=null;this.listeners={};this.scrollTop=0;this.width=960;this.height=540;}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{get(obj,key){return obj[key]||(()=>{});},set(obj,key,value){obj[key]=value;return true;}});}
  addEventListener(type,cb){this.listeners[type]=cb;}
  querySelectorAll(){return[];}querySelector(){return null;}
 }
 const nodes=new Map(),el=id=>nodes.get(id)||(nodes.set(id,new Element(id)),nodes.get(id));
 class FakeImage{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const sandbox={Image:FakeImage,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},window:{__PK_TEST__:true,addEventListener(){}},
  localStorage:{getItem(){return null;},setItem(){}},Math:seededMath,Date,setTimeout:()=>0,clearTimeout(){},requestAnimationFrame(){},
  performance:{now:()=>1000},console,confirm(){return true;},Blob,URL:{createObjectURL(){return'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(code,sandbox,{filename:'game.js'});
 const hooks=sandbox.window.__PK_TEST_TOOLS__;
 assert(hooks,'Game exposes test hooks');
 return {hooks,sandbox};
}

const spriteTypes=['guardian','raider','shaman','siegebeast','warlord'];
for(const type of spriteTypes){
 const path='assets/'+type+'.svg';
 assert(fs.existsSync(path),'New enemy '+type+' has a real game sprite');
 const content=fs.readFileSync(path,'utf8');
 assert(content.includes('<svg')&&content.includes('shape-rendering="crispEdges"')&&content.includes('width="120"'),type+' has rendered standalone pixel art');
}
const {hooks}=createWorld();
const encounter=hooks.encounterDirector;
const expected=[[1,'standard'],[5,'vanguard'],[10,'elite'],[17,'ambush'],[25,'commander'],[37,'treasure'],[50,'commander'],[75,'commander'],[100,'chapterBoss'],[200,'chapterBoss'],[10000,'chapterBoss']];
for(const [wave,kind] of expected)assert.equal(encounter(wave,1).kind,kind,'Wave '+wave+' director chooses '+kind);
assert.equal(encounter(100,1).bossType,'warlord','Every century ends with a warlord');
assert.equal(encounter(25,1).bossType,'siegebeast','Each quarter century commander is a siege beast');
assert.equal(encounter(10,1).bossType,'ogre','Original ogre onslaught still occurs in elite waves');
const factions=new Set();
for(let tier=1;tier<=30;tier++)for(let chapter=0;chapter<5;chapter++){
 const e=encounter(1+100*chapter,tier);
 factions.add(e.factionId);
 assert(e.faction&&e.units.length>=4&&e.chapter===chapter+1,'Every tier/chapter has a valid faction and roster');
 assert.equal(encounter(1+100*chapter,tier).factionId,e.factionId,'Encounter choice is deterministic');
}
assert.equal(factions.size,5,'Initial Living Onslaught launches five distinct factions');
assert.equal(hooks.encounterUnit(encounter(1,1),0),'skeleton','First few waves retain familiar gentle enemies');
assert(!['guardian','shaman','raider'].includes(hooks.encounterUnit(encounter(3,2),1)),'Opening waves do not surprise players with late mechanics');
const late=[8,9,13,17,37,50,75,100,101,200,1000,2500,5000,10000];
for(const wave of late)assert(encounter(wave,30).faction,'Director is safe for Tier XXX wave '+wave);
assert.equal(hooks.encounterSpecialBonus('treasure'),1.35,'Treasure raids have real wave-gold bonus');
assert.equal(hooks.encounterSpecialBonus('standard'),1,'Normal waves keep baseline economy');
const ward={type:'guardian',x:100,y:180,dead:false};
const protectedUnit={type:'skeleton',x:155,y:185,dead:false};
assert(hooks.shieldAuraReduction(protectedUnit,[ward])<1,'Live guard protects close allies');
ward.dead=true;
assert.equal(hooks.shieldAuraReduction(protectedUnit,[ward]),1,'Guard protection disappears once guard dies');
ward.dead=false;ward.x=600;
assert.equal(hooks.shieldAuraReduction(protectedUnit,[ward]),1,'Guard cannot protect across the battlefield');
// Direct damage tests: no arrow crit randomness.
const world=createWorld(221);
const real=world.hooks,run=real.run();
run.phase='fighting';run.wave=15;run.tier=2;run.spawned=0;run.total=24;
const guarded={type:'skeleton',hp:500,max:500,armor:0,x:300,y:280,dead:false,buildup:0,burn:0,slow:0};
const shield={type:'guardian',hp:400,max:400,armor:0,x:315,y:272,dead:false,buildup:0,burn:0,slow:0};
run.enemies=[guarded,shield];
real.hurt(guarded,100,'ballista');
const prevented=500-guarded.hp;
shield.dead=true;guarded.hp=500;
real.hurt(guarded,100,'ballista');
assert(500-guarded.hp>prevented,'Removing guardian restores full outgoing damage');
const raider={type:'raider',hp:500,max:500,armor:0,x:300,y:200,speed:20,dead:false,
 buildup:0,burn:0,slow:0,wobble:0,dashClock:0,dashTime:0};
run.enemies=[raider];run.spawned=0;run.total=24;
const raiderStart=raider.y;real.tick(.05);
assert(raider.dashTime>0,'Raider entered rush state');
assert(raider.y-raiderStart>20*.05,'Raider dash visibly increases advance speed');
const shaman={type:'shaman',hp:200,max:200,armor:0,x:300,y:200,speed:0,dead:false,
 buildup:0,burn:0,slow:0,wobble:0,ritualClock:0};
const ally={type:'skeleton',hp:100,max:200,armor:0,x:315,y:210,speed:0,dead:false,
 buildup:0,burn:0,slow:0,wobble:0};
run.enemies=[shaman,ally];run.spawned=0;run.total=24;real.tick(.05);
assert(ally.hp>100&&ally.hp<=200,'Shaman ritual heals a wounded ally without creating unbounded enemies');
const phaseBoss={type:'warlord',isBoss:true,hp:180,max:300,armor:0,x:350,y:250,speed:10,bossPhase:1,dead:false,
 buildup:0,burn:0,slow:0,wobble:0};
run.enemies=[phaseBoss];real.hurt(phaseBoss,25,'ballista');
assert.equal(phaseBoss.bossPhase,2,'Warlord enters phase II when wounded');
assert(phaseBoss.speed>10,'Second boss phase affects actual movement');
const nextBoss=createWorld(515);
const finalRun=nextBoss.hooks.run();
finalRun.wave=100;finalRun.tier=1;finalRun.maxHealth=nextBoss.hooks.maxWall();finalRun.health=finalRun.maxHealth;
nextBoss.hooks.beginWave();
const roster=[];
for(let i=0;i<finalRun.total;i++){finalRun.spawned=i;nextBoss.hooks.spawnEnemy();roster.push(finalRun.enemies.at(-1).type);}
assert(roster.includes('warlord'),'Wave 100 actually spawns a warlord');
assert(roster.length<=24,'All waves still honor iPhone entity caps');
const q=createWorld(516);q.hooks.run().wave=25;q.hooks.beginWave();
const crowd=q.hooks.run();
for(let i=0;i<crowd.total;i++){crowd.spawned=i;q.hooks.spawnEnemy();}
assert(crowd.enemies.some(e=>e.type==='siegebeast'),'Wave 25 actually spawns a siege beast');
// Encounter HUD and rewards use game logic, not a mockup.
assert.equal(world.sandbox.document.getElementById('encounterRibbon').hidden,true,'Ribbon stays unobtrusive before battle');
const hudWorld=createWorld(517),hr=hudWorld.hooks.run();hr.wave=37;hr.tier=1;hr.maxHealth=hudWorld.hooks.maxWall();hr.health=hr.maxHealth;
hudWorld.hooks.beginWave();
assert.equal(hudWorld.sandbox.document.getElementById('encounterRibbon').hidden,false,'Live encounter identity is displayed');
assert.equal(hudWorld.sandbox.document.getElementById('encounterType').textContent,'TREASURE RAID','Treasure raid is clearly announced');
assert.equal(hudWorld.sandbox.document.getElementById('encounterFaction').textContent,'Mirebound Swarm','Faction is visible on the battlefield');
assert(!hr.enemies.length,'Beginning an encounter never fabricates enemies before spawn clock');
// The original milestone ledger should remain intact.
assert.equal(hudWorld.hooks.tierMilestone(1,100).kind,'century','Century boss does not replace milestone reward');
assert(hudWorld.hooks.tierMilestones(30).includes(10000),'Final victory still exists in every tier');
console.log('PASS: 5 factions, 7 encounter classes, original pixel-art sprites, protective guards, raider rushes, support rituals, boss phases, treasure wave and preserved tier milestones.');
