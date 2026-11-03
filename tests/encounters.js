// Alpha 0.10.5 deterministic Living Onslaught encounter, tactical unit and boss challenge regression.
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
const expected=[[1,'standard'],[5,'vanguard'],[10,'elite'],[17,'ambush'],[25,'commander'],[37,'treasure'],[43,'relic'],[50,'commander'],[61,'bannerAssault'],[75,'commander'],[94,'arcane'],[100,'chapterBoss'],[200,'chapterBoss'],[10000,'chapterBoss']];
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
assert.equal(battle.enemies.filter(e=>e.type==='guardian').length>=2,true,'Iron Tyrant reinforcements feature defenders');
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
// Phase 4: previously generic special encounters now have distinct formations and payout.
const banners=encounter(61,1);
assert.equal(banners.kind,'bannerAssault','Standard Assault occurs on rare predictable wave 61');
assert.equal(hooks.encounterUnit(banners,0),'banneret','Standard Assault begins with the enemy battle flag');
assert.equal(hooks.encounterUnit(banners,1),'guardian','Standard Assault uses a defensive front line');
assert.equal(hooks.encounterSpecialBonus('bannerAssault'),1.20,'Standard Assault pays a bounded twenty-percent Gold bonus');
const bannerWorld=createWorld(1249),bw=bannerWorld.hooks,bar=bw.run();
bar.tier=1;bar.wave=61;bar.maxHealth=bw.maxWall();bar.health=bar.maxHealth;bw.beginWave();
for(let i=0;i<bar.total;i++){bar.spawned=i;bw.spawnEnemy();}
assert.equal(bar.enemies.length,bar.total,'Standard Assault uses standard capped enemy count');
assert(bar.enemies.some(e=>e.type==='banneret')&&bar.enemies.some(e=>e.type==='guardian'),'Banner assault loads its designed mixed battle formation');
assert(bar.enemies.filter(e=>e.type==='banneret'&&!e.dead).length<=2,'Banner assault never stacks more than two live banners');
// The Relic Warden is a physical special-encounter foe, not just a reward label.
const keeperWorld=createWorld(1251),kh=keeperWorld.hooks,kr=kh.run();
kr.tier=1;kr.wave=43;kr.maxHealth=kh.maxWall();kr.health=kr.maxHealth;kh.beginWave();
for(let i=0;i<kr.total;i++){kr.spawned=i;kh.spawnEnemy();}
const relicWarden=kr.enemies.find(e=>e.relicGuardian);
const standardGuardian=kr.enemies.find(e=>e.type==='guardian'&&!e.relicGuardian);
assert(relicWarden&&relicWarden.type==='guardian','Relic Hunt contains a real distinguished Relic Warden');
assert(standardGuardian&&relicWarden.hp>standardGuardian.hp*1.4,'Relic Warden has a materially stronger but bounded health pool');
assert.equal(kr.enemies.filter(e=>e.relicGuardian).length,1,'Exactly one marked warden per Relic Hunt');
// Boss phase HUD accurately reflects live encounter state and its telegraph.
bh.refreshHUD();
const bossHud=bossWorld.sandbox.document.getElementById('bossHud');
assert(!bossHud.hidden,'Chapter boss gets a readable overlay while present');
assert.equal(bossWorld.sandbox.document.getElementById('bossName').textContent,'IRON TYRANT','Hero is shown the real boss identity');
assert.equal(bossWorld.sandbox.document.getElementById('bossPhase').textContent,'PHASE II','Hud switches to actual boss phase');
assert(bossWorld.sandbox.document.getElementById('bossWarning').textContent.includes('IRON WARD'),'Boss HUD reports temporary defense stance');
// Guarantee a one-time rune reward even when the live rune pouch has reached its hard cap.
const vaultWorld=createWorld(1261),vh=vaultWorld.hooks,vr=vh.run(),progress=vh.p();
vr.wave=43;vr.tier=1;vr.maxHealth=vh.maxWall();vr.health=vr.maxHealth;vh.beginWave();
progress.runes=Array.from({length:240},(_,i)=>({id:'full_'+i,type:'ember',tier:1}));
const knowledgeBeforeVault=progress.knowledge;
assert(vh.awardRelicChallenge(1,43,100),'Full bag still lets players earn one-time relic objective');
assert.equal(progress.runes.length,240,'Full inventory is not overflowed by the relic');
assert.equal(progress.pendingRelics.length,1,'Rune is safely reserved for later collection');
assert(progress.knowledge>knowledgeBeforeVault,'Knowledge reward still pays on successful vault');
assert.equal(vh.awardRelicChallenge(1,43,100),false,'Replaying earned reward cannot enqueue duplicates');
progress.runes.pop();
assert.equal(vh.claimPendingRelics(),1,'Vault releases one earned rune once space is free');
assert.equal(progress.runes.length,240,'Recovering rune respects inventory cap');
assert(progress.runes.some(r=>r.id==='relic1_43'),'Original earned rune identity survives recovery');
assert.equal(progress.pendingRelics.length,0,'Claimed rune is removed from temporary vault');
assert.equal(vh.claimPendingRelics(),0,'Recovered rune cannot be claimed twice');
// Phase 5: Arcane Convergence is real playable content, capped and readable.
const arcane=encounter(94,1);
assert.equal(arcane.kind,'arcane','Wave 94 is a specialist Arcane Convergence encounter');
assert.equal(encounter(221,1).kind,'relic','Higher-priority Relic Hunt is never displaced by arcane wave scheduling');
assert.equal(encounter(4539,1).kind,'arcane','Arcane cycle takes precedence over an ordinary night ambush');
assert.equal(hooks.encounterUnit(arcane,0),'frostbinder','Arcane wave opens with a visible slow-caster threat');
assert.equal(hooks.encounterUnit(arcane,2),'shaman','Arcane wave recruits healing support');
assert.equal(hooks.encounterUnit(arcane,4),'thornweaver','Arcane wave recruits protective ward casters');
assert.equal(hooks.encounterKnowledgeBonus('arcane'),1.18,'Caster event Knowledge bonus is bounded to 18%');
assert.equal(hooks.encounterKnowledgeBonus('standard'),1,'Ordinary Knowledge reward is unchanged');
assert(hooks.encounterAdvice('arcane').includes('CASTERS'),'Encounter HUD gives practical counterplay');
const arcWorld=createWorld(1397),ah=arcWorld.hooks,ar=ah.run();
ar.tier=1;ar.wave=94;ar.maxHealth=ah.maxWall();ar.health=ar.maxHealth;ah.beginWave();
const arcHint=arcWorld.sandbox.document.getElementById('encounterHint');
assert(!arcHint.hidden&&arcHint.textContent.includes('+18% WAVE KNOWLEDGE'),'Real Arcane bonus is advertised on battlefield');
for(let i=0;i<ar.total;i++){ar.spawned=i;ah.spawnEnemy();}
const casters=ar.enemies.filter(e=>['shaman','frostbinder','thornweaver'].includes(e.type)&&!e.dead);
assert.equal(ar.enemies.length,ar.total,'Arcane formation respects normal wave enemy budget');
assert(casters.some(e=>e.type==='shaman')&&casters.some(e=>e.type==='frostbinder')&&casters.some(e=>e.type==='thornweaver'),'All three forms of magic are physically present');
assert(casters.length<=3,'No more than three spellcasters can be active simultaneously');
assert.equal(ah.allowedSpecialist('shaman',casters),'skeleton','Enemy wave blocks extra casters under pressure');
casters.forEach(e=>e.dead=true);
assert.equal(ah.allowedSpecialist('shaman',casters),'shaman','New caster can appear when prior casters die');
assert.equal(ah.allowedSpecialist('sapper',[{type:'sapper',dead:false},{type:'sapper',dead:false}]),'skeleton','Original explosive specialist cap remains two');
const normalWorld=createWorld(1398),nh=normalWorld.hooks,nr=nh.run(),np=nh.p();
nr.tier=1;nr.wave=94;nr.maxHealth=nh.maxWall();nr.health=nr.maxHealth;nr.phase='fighting';
nr.encounter={...nh.encounterDirector(94,1),kind:'standard'};
const noBonusKnowledge=np.knowledge;nh.completeWave();
const normalGain=np.knowledge-noBonusKnowledge;
const eventWorld=createWorld(1398),eh=eventWorld.hooks,er=eh.run(),ep=eh.p();
er.tier=1;er.wave=94;er.maxHealth=eh.maxWall();er.health=er.maxHealth;er.phase='fighting';er.encounter=eh.encounterDirector(94,1);
const beforeArcane=ep.knowledge;eh.completeWave();
const eventGain=ep.knowledge-beforeArcane;
assert.equal(eventGain,Math.round(normalGain*1.18),'Knowledge bonus is awarded through actual completion, not just UI');
assert.equal(ep.sigils,np.sigils,'Arcane rewards do not mint extra finite Sigils');
const codex=ah.renderSiegeCodex();
assert(codex.includes('FIELD MANUAL')&&codex.includes('Thornwake Circle')&&codex.includes('Riftborne Court'),'Faction codex describes all real factions');
assert(codex.includes('Arcane Convergence')&&codex.includes('Relic Hunt'),'Field manual explains optional wave rewards');
assert(ah.threatPriority({type:'banneret',dead:false,y:200,x:300})>ah.threatPriority({type:'goblin',dead:false,y:226,x:300}),'Auto-combat prioritizes rallying standard bearers');
assert(ah.threatPriority({type:'shaman',dead:false,y:200,x:300,ritualClock:1})>ah.threatPriority({type:'goblin',dead:false,y:230,x:300}),'Auto-combat responds to impending support heals');
const basicWorld=createWorld(1400),basic=basicWorld.hooks,bas=basic.run();
bas.tier=1;bas.wave=1;bas.maxHealth=basic.maxWall();bas.health=bas.maxHealth;basic.beginWave();
for(let i=0;i<bas.total;i++){bas.spawned=i;basic.spawnEnemy();}
assert(!bas.enemies.some(e=>['shaman','frostbinder','thornweaver'].includes(e.type)),'Early tutorial remains protected from new magic specialists');
// Alpha 0.10.5: boss counterplay must be earned by hits during real, interruptible windups.
const counterWorld=createWorld(1544),counter=counterWorld.hooks,combat=counter.run();
const ironCounter={type:'warlord',bossStyle:'iron',bossPhase:2,bossWardTimer:2.2,bossWardDamage:0,bossExposedTimer:0,hp:800,max:1000,x:300,y:240,dead:false};
assert.equal(counter.bossCounterplay(ironCounter,60),false,'Partial pressure does not instantly shatter the Iron Ward');
assert.equal(ironCounter.bossWardTimer,2.2,'Iron Tyrant retains protection until counter threshold');
assert.equal(counter.bossCounterplay(ironCounter,45),true,'Accumulated ten-percent damage shatters Iron Ward');
assert.equal(ironCounter.bossWardTimer,0,'Successful counter removes real defense');
assert(ironCounter.bossExposedTimer>1,'Countered Iron Tyrant exposes a short vulnerability window');
assert.equal(combat.bossCounters,1,'Successful mechanic counters are counted once');
assert.equal(counter.bossCounterplay(ironCounter,120),false,'An already shattered ward cannot be farmed for counters');
counter.specialEnemyMotion(ironCounter,.5);
assert(ironCounter.bossExposedTimer<1.3,'Exposure timer expires during live combat');

const emberCounter={type:'warlord',bossStyle:'ember',bossPhase:2,bossFuryWindup:.9,bossFurySurge:0,bossFuryClock:0,bossCastDamage:0,bossExposedTimer:0,hp:700,max:1000,x:350,y:250,dead:false};
assert(counter.threatPriority({...emberCounter,bossFuryWindup:.9})>counter.threatPriority({type:'goblin',dead:false,x:350,y:315}),'Hero responds to major-boss casting windows');
assert.equal(counter.bossCounterplay(emberCounter,40),false,'Small hit alone does not cancel Ember charge');
assert.equal(counter.bossCounterplay(emberCounter,55),true,'Focused damage can cancel Cinder Regent charge');
assert.equal(emberCounter.bossFuryWindup,0,'Countered Cinder Regent cannot complete its pending charge');
assert(emberCounter.bossFuryClock>=4,'Interrupted charge incurs meaningful recovery time');
assert(emberCounter.bossExposedTimer>0,'Interrupted Cinder Regent exposes its weak point');
assert(counter.specialEnemyMotion(emberCounter,.1)<=1,'Countered Regent cannot surge immediately');

const voidCounter={type:'warlord',bossStyle:'rift',bossPhase:2,bossBlinkWindup:1.05,bossCastDamage:0,bossBlinkCooldown:0,bossExposedTimer:0,hp:650,max:1000,x:360,y:220,dead:false};
const oldVoidY=voidCounter.y;
assert.equal(counter.bossCounterplay(voidCounter,95),true,'Focused damage disrupts Void Step');
assert.equal(voidCounter.bossBlinkWindup,0,'Void Monarch cannot warp after its interrupted windup');
assert(voidCounter.bossBlinkCooldown>=5,'Interrupted warp imposes a retry cooldown');
counter.specialEnemyMotion(voidCounter,.1);
assert.equal(voidCounter.y,oldVoidY,'Interrupted Void Step advances no distance');
counter.specialEnemyMotion(voidCounter,5.5);
assert(voidCounter.bossBlinkWindup>0,'Void Monarch can try again after a cooldown');
counter.specialEnemyMotion(voidCounter,1.1);
assert(voidCounter.y>oldVoidY&&voidCounter.y<=oldVoidY+26.1,'Successful retry remains bounded to only 26 pixels');
assert(voidCounter.bossBlinkCooldown>=6,'Successful Void Step has a long refractory period');
voidCounter.bossBlinkCooldown=0;voidCounter.bossBlinkWindup=0;voidCounter.y=341;
counter.specialEnemyMotion(voidCounter,.1);
assert.equal(voidCounter.bossBlinkWindup,0,'Void Monarch cannot begin a new surprise blink near the fortress');

const beastCounter={type:'siegebeast',bossPhase:1,crushStarted:true,crushWindup:1.1,crushSurge:0,bossExposedTimer:0,bossCastDamage:0,hp:750,max:1000,x:370,y:240,dead:false};
assert.equal(counter.bossCounterplay(beastCounter,95),true,'Siege Beast crusher can be stopped while telegraphed');
assert.equal(beastCounter.crushWindup,0,'Interrupted siege crusher has no remaining windup');
assert.equal(beastCounter.crushSurge,0,'Interrupted crusher produces no phantom speed surge');
counter.specialEnemyMotion(beastCounter,.1);
assert.equal(beastCounter.crushSurge,0,'Once interrupted, Siege Beast does not immediately restart the attack');

const plainHit={type:'warlord',bossPhase:2,bossStyle:'iron',bossWardTimer:0,bossExposedTimer:0,armor:0,hp:1000,max:1000,dead:false,x:320,y:220};
const exposedHit={...plainHit,bossExposedTimer:1};
counter.hurt(plainHit,100,'ballista');
counter.hurt(exposedHit,100,'ballista');
assert(exposedHit.hp<plainHit.hp,'Exposed boss truly takes more damage, not just visual feedback');
assert.equal(counter.bossCounterplay({type:'warlord',bossWardTimer:1,hp:0,max:1000},300),false,'Dead bosses cannot generate extra counters');
const totalCounters=combat.bossCounters;
assert.equal(totalCounters,4,'One ward shatter and three interrupted attacks produce four legitimate counters');
combat.phase='ready';combat.wave=100;counter.beginWave();
assert.equal(combat.bossCounters,0,'Boss counter statistics reset per wave');
const counterHudWorld=createWorld(1545),counterHud=counterHudWorld.hooks,counterHudRun=counterHud.run();
counterHudRun.phase='fighting';counterHudRun.tier=1;counterHudRun.wave=100;counterHudRun.encounter=counterHud.encounterDirector(100,1);
counterHudRun.enemies=[{type:'warlord',isBoss:true,bossPhase:2,bossStyle:'iron',bossExposedTimer:1,bossWardTimer:0,dead:false,x:320,y:220,hp:700,max:1000}];
counterHud.refreshHUD();
assert.equal(counterHudWorld.sandbox.document.getElementById('bossWarning').textContent,'EXPOSED · +12% DAMAGE','On-screen HUD explains real vulnerability payoff');
assert.equal(counterHudWorld.sandbox.document.getElementById('bossHud').dataset.exposed,'true','Exposure status is available for distinct gold on-field styling');
console.log('PASS: Alpha 0.10.5 boss ward shatter, Cinder/void/crusher interrupt windows, real exposure damage, restrained repeated steps, priority targeting, stat resets and readable HUD.');
