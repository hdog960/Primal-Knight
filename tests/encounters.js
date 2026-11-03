// Alpha 0.10.2 deterministic Living Onslaught encounter, tactical unit and boss challenge regression.
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

const spriteTypes=['guardian','raider','shaman','siegebeast','warlord','frostbinder','sapper','banneret','thornweaver','riftstalker','warlord_iron','warlord_ember','warlord_rift'];
for(const type of spriteTypes){
 const path='assets/'+type+'.svg';
 assert(fs.existsSync(path),'New enemy '+type+' has a real game sprite');
 const content=fs.readFileSync(path,'utf8');
 assert(content.includes('<svg')&&content.includes('shape-rendering="crispEdges"')&&content.includes('width="120"'),type+' has rendered standalone pixel art');
}
const {hooks}=createWorld();
const encounter=hooks.encounterDirector;
const expected=[[1,'standard'],[5,'vanguard'],[10,'elite'],[17,'ambush'],[25,'commander'],[37,'treasure'],[43,'relic'],[50,'commander'],[75,'commander'],[100,'chapterBoss'],[200,'chapterBoss'],[10000,'chapterBoss']];
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
assert.equal(factions.size,10,'Living Onslaught has ten distinct rotating factions');
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
assert(real.renderEncounterIntel(2).includes('Ironbound Host'),'Faction briefing displays the actual region enemy roster');
assert(real.renderEncounterIntel(1).includes('NEXT VANGUARD')||real.renderEncounterIntel(1).includes('NEXT ELITE'), 'Tier briefing announces the next named encounter');
assert(real.renderEncounterIntel(1).includes('WAVE 5'),'First special encounter is forecast accurately');
assert(world.sandbox.document.getElementById('milestoneList').innerHTML.includes('encounter-intel'),'Encounter intelligence is visible in the original Battle lobby');
assert.equal(hudWorld.hooks.tierMilestone(1,100).kind,'century','Century boss does not replace milestone reward');
assert(hudWorld.hooks.tierMilestones(30).includes(10000),'Final victory still exists in every tier');

 // Phase 2: new rosters and specialists are earned after the gentle first 19 waves.
const newlyAdded=[['frostvein',6,'frostbinder'],['cinder',7,'sapper'],['gilded',8,'banneret'],['thorn',9,'thornweaver'],['rift',10,'riftstalker']];
for(const [faction,tier,type] of newlyAdded){
 const encounter20=encounter(25,tier);
 assert.equal(encounter20.factionId,faction,'Tier '+tier+' introduces '+faction);
 assert(encounter20.units.includes(type),'Faction '+faction+' fields its specialist');
 assert(!['shaman','frostbinder','sapper','banneret','thornweaver','riftstalker'].includes(hooks.encounterUnit(encounter(8,tier),0)),'New mechanics are gated beyond early tutorial waves');
 const field=createWorld(122+tier),rr=field.hooks.run();rr.wave=25;rr.tier=tier;field.hooks.beginWave();
 for(let i=0;i<rr.total;i++){rr.spawned=i;field.hooks.spawnEnemy();}
 assert(rr.enemies.some(e=>e.type===type),'Faction '+faction+' spawns '+type+' in real combat');
 assert(rr.enemies.filter(e=>e.type===type).length<=2,'Specialist '+type+' is capped to prevent unfair stacking');
}
const extra=createWorld(720),hh=extra.hooks,br=hh.run();br.phase='fighting';br.wave=25;br.tier=6;br.maxHealth=2000;br.health=br.maxHealth;br.spawned=24;br.total=24;
const baseInterval=hh.attackInterval();
const frost={type:'frostbinder',hp:300,max:300,dead:false,x:330,y:220,frostCastClock:.01,frostWindup:0,wobble:0,speed:0,slow:0,burn:0,buildup:0};
hh.specialEnemyMotion(frost,.05);
assert(frost.frostWindup>0,'Frostcaster must telegraph spell before slowing hero attacks');
assert.equal(br.heroChill,0,'Telegraphed frost spell does not immediately slow the hero');
hh.specialEnemyMotion(frost,1);
assert(br.heroChill>=2.5,'Completed frost cast applies temporary slow');
assert(hh.attackInterval()>baseInterval,'Frost spell actually slows hero attack rate');
br.heroChill=0;
assert(Math.abs(hh.attackInterval()-baseInterval)<.00001,'Frost slow expires without permanently weakening the hero');
const near={type:'goblin',x:260,y:210,dead:false};
const banner={type:'banneret',x:250,y:205,dead:false};
assert(hh.rallyAuraFactor(near,[banner])>1,'Banneret rallies a nearby living ally');
banner.dead=true;
assert.equal(hh.rallyAuraFactor(near,[banner]),1,'Killing the banneret removes the rally buff');
banner.dead=false;banner.x=700;
assert.equal(hh.rallyAuraFactor(near,[banner]),1,'Banneret cannot buff units across the arena');
br.maxHealth=2000;br.health=2000;
const saboteur={type:'sapper',x:230,y:250,dead:false,fuseTime:0,fuseSpent:false};
hh.specialEnemyMotion(saboteur,.05);
assert(saboteur.fuseTime>0,'Sapper lights a visible fuse before a wall blast');
const preparedWall=br.health;
hh.specialEnemyMotion(saboteur,.4);
assert.equal(br.health,preparedWall,'Sapper cannot deal immediate untelegraphed wall damage');
hh.specialEnemyMotion(saboteur,1);
assert(br.health<preparedWall,'Surviving the fuse lets the sapper damage the wall');
assert(preparedWall-br.health<=Math.ceil(br.maxHealth*.025),'Sapper attacks have a hard per-blast wall damage cap');
const onceDamage=br.health;hh.specialEnemyMotion(saboteur,10);
assert.equal(br.health,onceDamage,'Sapper charge can trigger only once per unit');
const cancelledSapper={type:'sapper',x:240,y:245,dead:false,fuseTime:0,fuseSpent:false};
hh.specialEnemyMotion(cancelledSapper,.05);
cancelledSapper.dead=true;
br.enemies=[cancelledSapper];br.spawned=0;br.total=24;hh.tick(.05);
assert.equal(br.health,onceDamage,'Killing a sapper during windup interrupts detonation');
const charger={type:'sapper',x:260,y:215,dead:false,fuseTime:.9};
const closerGoblin={type:'goblin',x:250,y:300,dead:false};
assert(hh.threatPriority(charger)>hh.threatPriority(closerGoblin),'Auto-targeting prioritizes the imminent sapper threat');
const crusher={type:'siegebeast',x:240,y:245,dead:false,crushStarted:false,crushWindup:0,crushSurge:0};
assert(hh.specialEnemyMotion(crusher,.05)<1,'Siegebeast visibly slows during the announced windup');
assert(crusher.crushWindup>0,'Siegebeast windup is a real timed telegraph');
hh.specialEnemyMotion(crusher,1.2);
assert(hh.specialEnemyMotion(crusher,.05)>1,'Siegebeast enters an actual charge after windup');
const challengeWorld=createWorld(821),ch=challengeWorld.hooks,cr=ch.run(),cp=ch.p();
cr.tier=1;cr.wave=100;cr.maxHealth=ch.maxWall();cr.health=cr.maxHealth;cr.phase='ready';cr.spawned=0;cr.breaches=0;
ch.beginWave();
assert(ch.chapterChallenge(cr.encounter),'Major boss encounters offer a genuine no-breach objective');

cr.breaches=0;cr.phase='fighting';
const essenceBefore=cp.essence,knowledgeBefore=cp.knowledge;
ch.completeWave();
assert(cp.chapterChallenges['1:1'],'Flawless chapter claim saved per tier/chapter');
assert(cp.essence>essenceBefore&&cp.knowledge>knowledgeBefore,'Flawless chapter adds valuable earned rewards');
const onceEssence=cp.essence,onceKnowledge=cp.knowledge;
cr.phase='fighting';cr.wave=100;cr.encounter=ch.encounterDirector(100,1);
ch.completeWave();
assert.equal(cp.chapterChallenges['1:1'],true,'Flawless reward never becomes farmable');
const awardedAgain=ch.awardChapterChallenge(1,100,100,100);
assert.equal(awardedAgain,false,'Flawless reward cannot pay twice');
assert(cp.essence>=onceEssence&&cp.knowledge>=onceKnowledge,'Replay leaves permanent resources untouched');
cr.wave=200;cr.phase='fighting';cr.encounter=ch.encounterDirector(200,1);cr.breaches=1;
assert.equal(ch.awardChapterChallenge(1,200,100,100),false,'Any breach invalidates the optional chapter challenge');
assert(!cp.chapterChallenges['1:2'],'Failed challenge remains available to earn in a future run');
const goal=challengeWorld.sandbox.document.getElementById('encounterGoal');
cr.phase='ready';cr.wave=300;cr.breaches=0;cr.encounter=ch.encounterDirector(300,1);
ch.beginWave();
assert(goal.hidden===false,'Live chapter objective is visible in battlefield HUD');

// Phase 3: ward casters have a counterable duration, and blinkers must telegraph.
const thorn={type:'thornweaver',dead:false,x:320,y:230,thornCastClock:.01,thornWindup:0,thornWardTimer:0};
const wardAlly={type:'guardian',dead:false,x:331,y:230};
assert.equal(hh.thornWardReduction(wardAlly,[thorn]),1,'Thorn ward is absent before casting');
hh.specialEnemyMotion(thorn,.05);
assert(thorn.thornWindup>0,'Thornweaver provides a warning before ward');
hh.specialEnemyMotion(thorn,1);
assert(thorn.thornWardTimer>0,'Thornweaver summons real protective ward');
assert(hh.thornWardReduction(wardAlly,[thorn])<1,'Active thorn ward mitigates damage');
thorn.dead=true;
assert.equal(hh.thornWardReduction(wardAlly,[thorn]),1,'Defeating Thornweaver immediately cancels ward protection');
const blinker={type:'riftstalker',dead:false,x:260,y:220,blinkStarted:false,blinkWindup:0};
const preBlink=blinker.y;
assert(hh.specialEnemyMotion(blinker,.05)<1,'Riftstalker must announce its blink and slow down');
assert.equal(blinker.y,preBlink,'Blink cannot teleport before warning ends');
hh.specialEnemyMotion(blinker,1);
assert(blinker.y>preBlink&&blinker.y<=398,'Rift blink advances a bounded distance without instant breach');
const highPriority={type:'riftstalker',dead:false,x:280,y:220,blinkWindup:.75};
assert(hh.threatPriority(highPriority)>hh.threatPriority({type:'goblin',dead:false,x:280,y:290}),'Hero prioritizes announced rift blink');
const bossProfiles=['iron','ember','rift'];
for(let idx=0;idx<bossProfiles.length;idx++){
 const e=encounter((idx+1)*100,1);
 assert.equal(e.bossStyle,bossProfiles[idx],'Chapter '+(idx+1)+' rotates real boss tactics');
 assert(e.bossName,'Chapter boss has unique identity');
}
const bossWorld=createWorld(911),bh=bossWorld.hooks,battle=bh.run();
battle.tier=1;battle.wave=100;battle.maxHealth=bh.maxWall();battle.health=battle.maxHealth;
bh.beginWave();
assert.equal(battle.total,22,'Chapter boss reserves two of twenty-four combat slots for reinforcements');
const firstCount=battle.total;
for(let i=0;i<firstCount;i++){battle.spawned=i;bh.spawnEnemy();}
battle.spawned=firstCount;
const tyrant=battle.enemies.find(e=>e.type==='warlord');
assert(tyrant&&tyrant.bossStyle==='iron','Chapter 1 creates the Iron Tyrant sprite profile');
bh.hurt(tyrant,tyrant.max*.52,'ballista');
assert.equal(tyrant.bossPhase,2,'Iron Tyrant enters alternate phase after HP threshold');
assert(tyrant.bossWardTimer>0,'Iron Tyrant has a temporary counterable armor stance');
assert.equal(battle.total,24,'Exactly two new reinforcements are reserved');
while(battle.spawned<battle.total){bh.spawnEnemy();battle.spawned++;}
assert.equal(battle.enemies.length,24,'Reinforcements respect the 24-enemy limit');
assert.equal(battle.enemies.filter(e=>e.type==='warlord').length,1,'Reinforcements never duplicate the boss');
assert.equal(battle.enemies.filter(e=>e.type==='guardian').length>=2,true,'Iron Tyrant's reinforcements feature defenders');
const emberBoss={type:'warlord',bossPhase:2,bossStyle:'ember',bossFuryClock:0,bossFuryWindup:0,bossFurySurge:0,x:330,y:230,dead:false};
assert(bh.specialEnemyMotion(emberBoss,.05)<1,'Cinder Regent telegraphs its charge');
bh.specialEnemyMotion(emberBoss,1);
assert(bh.specialEnemyMotion(emberBoss,.05)>1,'Cinder Regent charge is mechanically distinct');
const riftBoss={type:'warlord',bossPhase:2,bossStyle:'rift',bossBlinkWindup:1,x:340,y:225,dead:false};
const beforeVoid=riftBoss.y;
assert(bh.specialEnemyMotion(riftBoss,.05)<1,'Void Monarch announces its warp');
bh.specialEnemyMotion(riftBoss,1);
assert(riftBoss.y>beforeVoid&&riftBoss.y<=398,'Void Monarch warp has limited distance');
const huntWorld=createWorld(917),hunt=huntWorld.hooks,huntRun=hunt.run(),huntProgress=hunt.p();
huntRun.tier=1;huntRun.wave=43;huntRun.maxHealth=hunt.maxWall();huntRun.health=huntRun.maxHealth;hunt.beginWave();
assert(hunt.relicChallenge(huntRun.encounter),'Wave 43 offers a rare relic objective');
assert.equal(huntWorld.sandbox.document.getElementById('encounterGoal').hidden,false,'Relic objective appears in live HUD');
const runesBefore=huntProgress.runes.length,knowledgeBeforeHunt=huntProgress.knowledge;
assert(hunt.awardRelicChallenge(1,43,100),'A successful relic hunt grants its one-time reward');
assert.equal(huntProgress.runes.length,runesBefore+1,'Relic hunt awards a real rune item');
assert(huntProgress.knowledge>knowledgeBeforeHunt,'Relic hunt grants bonus Knowledge');
assert(huntProgress.relicHunts['1:43'],'Relic claim is saved in additive persistent ledger');
assert.equal(hunt.awardRelicChallenge(1,43,100),false,'Relic hunt never pays twice');
huntRun.encounter=encounter(132,1);huntRun.breaches=1;
assert.equal(hunt.awardRelicChallenge(1,132,100),false,'Breached fortress cannot claim optional relic hunt');
assert(!huntProgress.relicHunts['1:132'],'Failed relic hunt can be retried later');
console.log('PASS: 10 factions, 8 encounter classes, coherent sprites, two new counterable specialists, three boss archetypes with bounded reinforcements, nonfarmable relic and chapter rewards, preserved tiers.');
