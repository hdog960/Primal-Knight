/* Primal KnIght - Onslaught — Alpha 0.11.9. Hero Combat Depth - Automatic tactical cast timing: armor-aware hero magic and real nine-build encounter balance coverage and saved progression. Zero external dependencies.
   Original game, systems and art. All spending uses earned in-game currencies.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id),fmt=n=>{n=Math.max(0,Math.floor(n));return n>=1e12?(n/1e12).toFixed(2)+'T':n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'K':n.toLocaleString()},clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rnd=(a,b)=>a+Math.random()*(b-a);
const training=[
 ['power','Might','Base damage increases by 2 per rank.',8,1.125,1200],['haste','Reflexes','Attack interval decreases over time.',8,1.155,500],['fort','Fortitude','Maximum fortress health increases by 12.',10,1.12,1000],['crit','Precision','Improves critical strike chance.',18,1.16,220],['critDmg','Lethality','Increases critical damage.',19,1.15,500],['pierce','Armor Pierce','Ignore a portion of enemy armor.',18,1.15,250],['regen','Stone Mending','Regenerate fortress HP between waves with diminishing returns at high ranks.',24,1.16,500],['gold','Greed','Increase gold earned from slain enemies.',12,1.14,1500],['xp','Scholarship','Gain more hero experience from battle.',14,1.16,800],['essence','Attunement','Increase Hero Essence earned per wave.',30,1.17,600],['range','Longshot','Increase projectile travel speed.',14,1.15,350],['multishot','Splitshot','Every 8th rank adds an extra attack projectile.',55,1.22,40],['boss','Executioner','Increase damage dealt to bosses.',43,1.18,500],['loot','Treasure Sense','Improves drop chances after completed waves.',32,1.19,180],['resist','Rampart','Reduce damage enemies inflict on the wall.',43,1.18,200],['shock','Static Charge','Every rank boosts chance of a chain lightning effect.',66,1.2,150]
];
const skills={
 Marksman:[['aim','Hunter’s Eye','Damage +6% per rank'],['quiver','Endless Quiver','Attack speed +5% per rank'],['penetrate','Barbed Volley','Armor penetration +4% per rank'],['double','Double Draw','Every rank adds a chance for a second attack'],['focus','Deadeye','Critical damage +20% per rank'],['storm','Arrowstorm','Volley attacks strike adjacent enemies']],
 Arcanist:[['ember','Ember Arrows','Attacks ignite enemies for damage over time'],['frost','Winter Touch','Chance to slow incoming enemies'],['spark','Storm Call','Chance to chain lightning'],['inferno','Inferno','Burns spread between enemies'],['hail','Glacial Heart','Slow effects become stronger'],['tempest','Tempest','Lightning strikes an additional foe']],
 Guardian:[['stone','Stonewall','Fortress health +8% per rank'],['mend','Field Repairs','Fortress regenerates health'],['thorns','Spiked Rampart','Melee invaders take retaliation damage'],['ward','Wardkeeper','Reduce fortress damage received'],['bulwark','Adamantine','Fortress maximum health +15% per rank'],['laststand','Last Stand','Below 30% wall HP the hero fires faster']],
 Prospector:[['fortune','Gold Hunter','Gold earned +8% per rank'],['scavenger','Scavenger','Increase equipment drop chance'],['wisdom','Sage','Experience gained +7% per rank'],['midas','Golden Mark','Chance to double gold from a kill'],['salvage','Salvage Master','Equipment upgrades become cheaper'],['prosperity','Prosperity','Gain bonus currency after each cleared wave']]
};
const stationData=[['ballista','⚔','Ironwood Ballista','Fires an additional powerful bolt every few seconds.',135,1.55,80],['cryo','❄','Frostward Obelisk','Slows marching enemies across the battlefield.',165,1.6,80],['midas','✦','Midas Projector','Some defeated enemies drop a bonus burst of gold.',175,1.62,80],['thunder','ϟ','Stormcoil Turret','Discharges chain lightning at a nearby enemy.',270,1.7,80],['gravity','◉','Gravity Anchor','Weakens the approach speed of the entire horde.',350,1.7,80]];
const research=[
 ['discount','Merchant Contracts','Reduce equipment and station upgrade prices.',12,1.65,30],
 ['fusion','Runecraft Efficiency','Reduce rune fusion costs.',15,1.6,30],
 ['interest','Royal Treasury','Gain extra gold when a wave ends.',13,1.7,40],
 ['excavation','Excavation','Equipment and rune drops become more frequent.',22,1.65,40],
 ['bounties','Royal Bounties','Increase gold earned from monster kills.',18,1.65,40],
 ['studies','Advanced Studies','Increase Knowledge awarded per wave.',26,1.7,40],
 ['masonry','Stonewright Doctrine','Fortress maximum health +1.5% per rank (up to +24%).',28,1.68,16],
 ['calibration','Sharpsight Optics','Hero projectile damage +1% per rank (up to +15%).',36,1.74,15],
 ['attunement','Runic Harmonics','Socketed rune bonuses +2% per rank (up to +24%).',38,1.75,12],
 ['almanac',"Warden’s Almanac",'All Hero XP earned +1.5% per rank (up to +24%).',30,1.72,16],
 ['distillation','Essence Distillation','Hero Essence from completed waves +1.5% per rank (up to +24%).',33,1.72,16],
 ['appraisal','Guild Appraisals','Gold gained when selling gear +2% per rank (up to +30%).',28,1.68,15]
];
const suppression=[['health','Weakening Sigils','Reduce enemy maximum health, capped at 35%.',16,1.65,70],['speed','Mudbound March','Reduce enemy movement speed, capped at 35%.',14,1.64,70],['damage','Blunted Steel','Reduce damage enemies inflict on your fortress.',19,1.68,70],['armor','Rending Curse','Reduce enemy natural armor.',21,1.7,70]];
const rarities=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Ancient','Celestial','Eternal'];
const rColors=['#ddd','#66dc9e','#75bfff','#b990ff','#ffd070','#ff727f','#eee08a','#e8b6ff','#90f9ff'];
const runeNames={ember:['🔥','Ember','Burn damage'],frost:['❄','Frost','Chance to slow enemies'],fortune:['✦','Fortune','Bonus gold on kills'],storm:['ϟ','Storm','Chain lightning chance']};
const inventoryCap=200;
const gearSlots=['helm','amulet','chest','legs','boots','gauntlets','charm','ring1','ring2','ring3','ring4'];
const ringSlots=['ring1','ring2','ring3','ring4'];
const oldGearNames={weapon:['Recurve Bow','Ashwood Longbow','Moonthorn Bow','Royal Arbalest','Sunfire Repeater','Starfall Arc','Kingslayer','Astral Bow','Eternity’s Oath'],armor:['Scout Mantle','Warden Mail','Forest Cloak','Ember Hauberk','Royal Warplate','Phoenix Mantle','Titan Guard','Starforged Plate','Eternal Bastion']};
const gearNames={
 helm:['Leather Cowl','Tracker Hood','Moonveil Hood','Royal Sallet','Suncrest Helm','Phoenix Visor','Titan Crown','Astral Cowl','Eternal Halo'],
 amulet:['Copper Pendant','Hunter Pendant','Wolfsbane Amulet','Goldheart Pendant','Solar Relic','Dragon Tear','Elder Star','Celestial Prism','Eon Heart'],
 chest:['Warden Jerkin','Forest Mail','Royal Brigandine','Ember Hauberk','Lionguard Plate','Phoenix Mantle','Titan Guard','Starforged Cuirass','Eternal Bastion'],
 legs:['Trail Leggings','Storm Trousers','Royal Greaves','Flamebound Cuisses','Lionguard Platelegs','Phoenix Striders','Titan Marchers','Astral Legplates','Eternal Vanguard'],
 boots:['Scout Boots','Ridgewalk Boots','Ranger Treads','Royal Sabatons','Sunfire Greaves','Phoenix Boots','Titan Treads','Astral Walkers','Eternal March'],
 gauntlets:['Leather Grips','Hunter Grips','Royal Vambraces','Warclaw Gauntlets','Sunfire Graspers','Phoenix Grips','Titan Fists','Astral Grip','Eternal Oathgrips'],
 charm:['Copper Locket','Hunter Sigil','Wolfsbane Charm','Goldheart Pendant','Dragon Eye','Oracle Stone','Elder Star','Celestial Mark','Eonstone'],
 ring:['Tin Band','Woodland Ring','Moonstone Ring','Royal Signet','Sunfire Ring','Mythic Loop','Ancient Seal','Celestial Band','Eternal Circle']
};
function defaultState(){return {version:3,level:1,xp:0,points:0,gold:520,essence:180,knowledge:60,highestWave:1,training:{},skills:{},stations:{},research:{},suppression:{},inventory:[{id:'starterhelm',slot:'helm',rarity:0,plus:0},{id:'starteramulet',slot:'amulet',rarity:0,plus:0},{id:'starterchest',slot:'chest',rarity:0,plus:0},{id:'startercharm',slot:'charm',rarity:0,plus:0}],equipped:{helm:'starterhelm',amulet:'starteramulet',chest:'starterchest',charm:'startercharm'},runes:[{type:'ember',tier:1,id:'seedember'},{type:'fortune',tier:1,id:'seedfortune'}],socketed:{},best:0,clears:0,selectedTier:1,unlockedTier:1,bestByTier:{},milestones:{},chapterChallenges:{},relicHunts:{},pendingRelics:[],pendingGear:[],ascension:{},dominionCrests:{},sovereignOaths:{},firstWatchClaimed:[],battleSeconds:0,uniqueClears:0,sigils:0,legacy:{},legacyUnlocked:false,combatDoctrine:'vanguard',combatPassive:'hunter',doctrineTactic:'rapid',combatLoadouts:[null,null,null],banners:['Crimson Standard'],activeBanner:'Crimson Standard'};}
const storageKey='primal_knight_onslaught_save_v1';let p;try{p={...defaultState(),...JSON.parse(localStorage.getItem(storageKey)||'null')}}catch{p=defaultState()}if(!p||!p.inventory)p=defaultState();for(const k of ['training','skills','stations','research','suppression','socketed','equipped'])p[k]??={};p.runes??=[];p.bestByTier??={};p.milestones??={};p.chapterChallenges??={};p.relicHunts??={};p.pendingRelics=Array.isArray(p.pendingRelics)?p.pendingRelics:[];p.pendingGear=Array.isArray(p.pendingGear)?p.pendingGear:[];p.ascension??={};p.dominionCrests??={};p.sovereignOaths??={};p.firstWatchClaimed=Array.isArray(p.firstWatchClaimed)?p.firstWatchClaimed:[];p.battleSeconds=Math.max(0,Number(p.battleSeconds)||0);p.uniqueClears=Math.max(0,Number(p.uniqueClears)||0);p.sigils??=0;p.legacy??={};p.banners??=['Crimson Standard'];p.activeBanner??='Crimson Standard';p.unlockedTier=clamp(Number(p.unlockedTier)||1,1,30);if(p.milestones['16:20'])p.unlockedTier=Math.max(p.unlockedTier,17);p.selectedTier=clamp(Number(p.selectedTier)||1,1,p.unlockedTier);p.legacyUnlocked??=false;p.combatDoctrine=['vanguard','storm','aegis'].includes(p.combatDoctrine)&&(p.combatDoctrine==='vanguard'||Number(p.level)>=(p.combatDoctrine==='storm'?3:5))?p.combatDoctrine:'vanguard';p.combatPassive=['hunter','conductor','sentinel'].includes(p.combatPassive)&&(p.combatPassive==='hunter'||Number(p.level)>=(p.combatPassive==='conductor'?3:5))?p.combatPassive:'hunter';p.doctrineTactic=['rapid','horde','crisis'].includes(p.doctrineTactic)?p.doctrineTactic:'rapid';
// One-time additive save migration. Gold, upgrades, achievements, plus levels and IDs are untouched.
function migrateEquipmentSave(){
 if(Number(p.version)>=3)return;
 const oldEq={...(p.equipped||{})};
 p.inventory=(p.inventory||[]).map((g,i)=>{
   const upgraded={...g,id:g.id||'gear_'+i,plus:clamp(Number(g.plus)||0,0,50),rarity:clamp(Number(g.rarity)||0,0,8)};
   if(g.slot==='weapon'){upgraded.slot='amulet';upgraded.legacyName=oldGearNames.weapon[upgraded.rarity]+' · Heirloom';}
   else if(g.slot==='armor'){upgraded.slot='chest';upgraded.legacyName=oldGearNames.armor[upgraded.rarity]+' · Heirloom';}
   else if(ringSlots.includes(g.slot))upgraded.slot='ring';
   return upgraded;
 });
 p.equipped={...oldEq};
 if(oldEq.weapon){p.equipped.amulet=oldEq.weapon;delete p.equipped.weapon;}
 if(oldEq.armor){p.equipped.chest=oldEq.armor;delete p.equipped.armor;}
 // The old charm remains in its own slot. Previously socketed runes follow their gear.
 p.socketed={...p.socketed};
 if(p.socketed.weapon){p.socketed.amulet=p.socketed.weapon;delete p.socketed.weapon;}
 if(p.socketed.armor){p.socketed.chest=p.socketed.armor;delete p.socketed.armor;}
 for(const slot of ['helm','legs','boots','gauntlets']){
   if(!p.inventory.some(g=>g.slot===slot)){
      const id='migration_'+slot;
      p.inventory.push({id,slot,rarity:0,plus:0});p.equipped[slot]=id;
   }
 }
 for(const [slot,id] of Object.entries(p.equipped))if(!p.inventory.some(g=>g.id===id))delete p.equipped[slot];
 p.version=3;
}
migrateEquipmentSave();

// A backed-up Tier XXX character must not be silently reduced to the old Tier XII cap.
// Validate the original save before mutating either progression or the local backup.
const safetyBackupKey='primal_knight_onslaught_pre_import_backup_v1';
function hasImportRecovery(){try{return !!localStorage.getItem(safetyBackupKey);}catch{return false;}}
function validSaveObject(value){return !!value&&typeof value==='object'&&!Array.isArray(value);}
function validateProgressBackup(data){
 if(!validSaveObject(data)||!Array.isArray(data.inventory)||!validSaveObject(data.equipped)||!validSaveObject(data.training))throw Error('Invalid backup structure');
 if(!data.inventory.every(g=>validSaveObject(g)&&typeof g.slot==='string')||data.inventory.length>1000)throw Error('Invalid inventory');
 for(const key of ['equipped','training','skills','stations','research','suppression','socketed','bestByTier','milestones','chapterChallenges','relicHunts','ascension','dominionCrests','sovereignOaths','legacy']){
  if(data[key]!==undefined&&!validSaveObject(data[key]))throw Error('Invalid '+key);
 }
 for(const key of ['runes','pendingRelics','pendingGear','firstWatchClaimed','banners','combatLoadouts']){
  if(data[key]!==undefined&&!Array.isArray(data[key]))throw Error('Invalid '+key);
 }
 if(data.unlockedTier!==undefined&&!Number.isFinite(Number(data.unlockedTier)))throw Error('Invalid tier');
 return true;
}
function normalizeRestoredProgress(){
 const saved=defaultState();
 for(const key of ['training','skills','stations','research','suppression','socketed','equipped','bestByTier','milestones','chapterChallenges','relicHunts','ascension','dominionCrests','sovereignOaths','legacy']){
  if(!validSaveObject(p[key]))p[key]=saved[key];
 }
 for(const key of ['runes','pendingRelics','pendingGear','firstWatchClaimed','banners']){
  if(!Array.isArray(p[key]))p[key]=saved[key];
 }
 p.battleSeconds=Math.max(0,Number(p.battleSeconds)||0);
 p.uniqueClears=Math.max(0,Number(p.uniqueClears)||0);
 p.sigils=Math.max(0,Number(p.sigils)||0);
 p.unlockedTier=clamp(Math.floor(Number(p.unlockedTier)||1),1,MAX_TIER);
 if(p.milestones['16:20'])p.unlockedTier=Math.max(p.unlockedTier,17);
 p.selectedTier=clamp(Math.floor(Number(p.selectedTier)||1),1,p.unlockedTier);
 p.activeBanner=typeof p.activeBanner==='string'&&p.activeBanner?p.activeBanner:'Crimson Standard';
 p.legacyUnlocked=!!p.legacyUnlocked;
 p.combatDoctrine=['vanguard','storm','aegis'].includes(p.combatDoctrine)&&(p.combatDoctrine==='vanguard'||Number(p.level)>=(p.combatDoctrine==='storm'?3:5))?p.combatDoctrine:'vanguard';
 p.combatPassive=['hunter','conductor','sentinel'].includes(p.combatPassive)&&(p.combatPassive==='hunter'||Number(p.level)>=(p.combatPassive==='conductor'?3:5))?p.combatPassive:'hunter';
 p.doctrineTactic=['rapid','horde','crisis'].includes(p.doctrineTactic)?p.doctrineTactic:'rapid';
 p.combatLoadouts=normalizeCombatLoadouts(p.combatLoadouts);
}
function restoreProgressBackup(data,keepRecoveryCopy=false){
 validateProgressBackup(data);
 const old=p,previousTier=chosenTier,previousWaystone=useWaystone;
 try{
  // Refuse a destructive import if iPhone storage cannot hold a safety copy.
  if(keepRecoveryCopy)localStorage.setItem(safetyBackupKey,JSON.stringify(p));
  p={...defaultState(),...data};
  normalizeRestoredProgress();
  migrateEquipmentSave();
  chosenTier=p.selectedTier;useWaystone=true;
  if(!save())throw Error('Could not save restored progress');
  return true;
 }catch(error){
  p=old;chosenTier=previousTier;useWaystone=previousWaystone;
  throw error;
 }
}
function undoProgressImport(){
 const backup=localStorage.getItem(safetyBackupKey);
 if(!backup)return false;
 const data=JSON.parse(backup);
 restoreProgressBackup(data,false);
 if(typeof localStorage.removeItem==='function')localStorage.removeItem(safetyBackupKey);
 return true;
}

let ctx=$('game').getContext('2d'),c=$('game'),background=new Image();background.src='assets/battlefield.png';const foreground=new Image();foreground.src='assets/foreground.png';let sprites={};for(const type of ['hero','goblin','skeleton','warg','imp','ogre','guardian','raider','shaman','siegebeast','warlord','warlord_iron','warlord_ember','warlord_rift','frostbinder','sapper','banneret','thornweaver','riftstalker']){const i=new Image();i.src='assets/'+type+(['guardian','raider','shaman','siegebeast','warlord','warlord_iron','warlord_ember','warlord_rift','frostbinder','sapper','banneret','thornweaver','riftstalker'].includes(type)?'.svg':'.png');sprites[type]=i;}
let run={wave:1,tier:1,health:0,maxHealth:0,phase:'ready',enemies:[],shots:[],particles:[],floats:[],spawned:0,total:0,kills:0,breaches:0,spawnClock:0,shotClock:0,stationClock:0,time:0,speed:1,freeze:0,heroChill:0,rewardTimer:0,shakes:0,flashes:0,encounter:null,reinforcementPhase:false,bossCounters:0};let tab='battle',storedSpeed=1,pausedForPanel=false,saveClock=0,toastTimer=0,lastSiegeReport=null;
// The first Hero Combat Depth layer: one active, automatically casting doctrine.
// Disciplines are earned at low hero levels, not via additional paid currencies.
const combatDoctrineData={
 vanguard:{id:'vanguard',name:"HUNTER'S VOLLEY",school:'Marksman',level:1,cooldown:10,
  short:'Focus-fire up to three bonus arrows.',description:'Automatic burst fire · +1 arrow at Quiver rank III. Scales with hero damage.'},
 storm:{id:'storm',name:'ARCANE CHAIN',school:'Arcanist',level:3,cooldown:12,
  short:'Piercing chain magic strikes and slows up to three foes.',description:'Arcane Chain ignores 35% of enemy armor, hits up to three enemies and slows them. Spark, Hail and socketed Storm runes strengthen the chain; station bonuses apply only to station attacks.'},
 aegis:{id:'aegis',name:'AEGIS PULSE',school:'Guardian',level:5,cooldown:14,
  short:'Recover the wall and repel advancing threats.',description:'Restores a small fraction of wall health and repels up to three approaching foes. Stone and Bulwark training improve the pulse.'}
};
const combatPassiveData={
 hunter:{id:'hunter',name:"PREDATOR'S EYE",school:'Marksman',level:1,
  short:'Focused arrows deal +8% damage to bosses and specialist casters.',detail:'Single-target precision · helps break major-boss abilities and caster windups.'},
 conductor:{id:'conductor',name:'STORM CONDUCTOR',school:'Arcanist',level:3,
  short:'Lightning attacks deal +10% damage and chill targets briefly.',detail:'Works with Arcane Chain and lightning stations, not physical arrows.'},
 sentinel:{id:'sentinel',name:'RAMPART OATH',school:'Guardian',level:5,
  short:'Reduce wall-impact and Sapper blast damage by 10%.',detail:'Passive protection does not raise damage or improve Gold rewards.'}
};

/* Alpha 0.11.9 — player-controlled, fully automatic cast timing policies.
   Rapid is the original unchanged behavior for every existing iPhone save. */
const doctrineTacticModes={
 rapid:{name:'RAPID',detail:'Use your signature ability whenever its cooldown ends and a valid target is present.'},
 horde:{name:'HORDE',detail:'Hold it for four enemies, a dangerous special cast, or damage that needs Aegis healing.'},
 crisis:{name:'CRISIS',detail:'Save it for attackers near the wall, dangerous windups, crowded battlefields, or a damaged fortress.'}
};
function normalizeDoctrineTactic(id){return Object.prototype.hasOwnProperty.call(doctrineTacticModes,id)?id:'rapid';}
function chooseDoctrineTactic(id){
 if(run.phase==='fighting'||run.phase==='intermission'||!Object.prototype.hasOwnProperty.call(doctrineTacticModes,id))return false;
 p.doctrineTactic=id;return true;
}
function doctrineTacticEligible(){
 const mode=normalizeDoctrineTactic(p.doctrineTactic);
 if(mode==='rapid')return true; // This exactly preserves previous auto-casting.
 const alive=run.enemies.filter(e=>e&&!e.dead);
 if(!alive.length)return false;
 const damaged=run.health<=run.maxHealth*.91;
 const urgent=alive.some(e=>e.bossWardTimer>0||e.crushWindup>0||e.bossFuryWindup>0||
   e.bossBlinkWindup>0||e.type==='sapper'&&e.y>=220||
   e.type==='shaman'&&e.ritualClock<=1.4);
 const aegis=chosenDoctrine().id==='aegis';
 if(mode==='horde')return alive.length>=4||urgent||(aegis&&damaged);
 return urgent||alive.some(e=>e.y>=288)||alive.length>=9||
   run.health<=run.maxHealth*.78||(aegis&&run.health<=run.maxHealth*.91);
}
function renderDoctrineTactics(compact=false){
 const disabled=run.phase==='fighting'||run.phase==='intermission';
 return `<section class="doctrine-tactics ${compact?'doctrine-tactics-compact':''}" aria-label="Automatic signature ability cast timing">
   <div class="doctrine-tactics-head"><strong>✦ AUTOMATIC ABILITY STRATEGY</strong>
   <span>${doctrineTacticModes[normalizeDoctrineTactic(p.doctrineTactic)].name} MODE</span></div>
   <p>All choices stay fully automatic. RAPID preserves the original behavior; more selective timing can help with crowded or dangerous encounters.</p>
   <div class="doctrine-tactics-options">${Object.entries(doctrineTacticModes).map(([id,mode])=>
    `<button type="button" ${compact?'data-doctrine-tactic':'data-action'}="${compact?id:'tactic:'+id}"
    class="doctrine-tactics-choice ${p.doctrineTactic===id?'selected':''}" aria-pressed="${p.doctrineTactic===id}"
    ${disabled?'disabled':''}><strong>${mode.name}</strong><small>${mode.detail}</small></button>`).join('')}</div>
   <small>Changing strategy is free between sieges, saves on your device, and does not restart a cooldown or alter your earned items.</small>
  </section>`;
}
const combatLoadoutNames=['SCOUT','TEMPEST','BASTION'];
function passiveTrait(){return combatPassiveData[p.combatPassive]||combatPassiveData.hunter;}
function chooseCombatPassive(id){
 const passive=combatPassiveData[id];
 if(!passive||p.level<passive.level)return false;
 p.combatPassive=id;return true;
}
// A preset is a reference-only recipe. Never clone, fabricate, sell or modify gear.
function normalizeCombatLoadouts(slots){
 if(!Array.isArray(slots))return [null,null,null];
 return combatLoadoutNames.map((_,i)=>{
  const item=slots[i];
  if(!item||!validSaveObject(item)||!combatDoctrineData[item.doctrine]||!combatPassiveData[item.passive]||
     !validSaveObject(item.equipped)||!validSaveObject(item.socketed))return null;
  const acceptMap=map=>{
   const out={};const seen=new Set();
   for(const [slot,id] of Object.entries(map)){
    if(!gearSlots.includes(slot)||typeof id!=='string'||id.length>128||!id||seen.has(id))return null;
    seen.add(id);out[slot]=id;
   }
   return out;
  };
  const equipped=acceptMap(item.equipped),socketed=acceptMap(item.socketed);
  return equipped&&socketed?{doctrine:item.doctrine,passive:item.passive,tactic:normalizeDoctrineTactic(item.tactic),equipped,socketed}:null;
 });
}
p.combatLoadouts=normalizeCombatLoadouts(p.combatLoadouts);
function saveCombatLoadout(index){
 if(!Number.isInteger(index)||index<0||index>=combatLoadoutNames.length)return false;
 p.combatLoadouts[index]={
  doctrine:p.combatDoctrine,passive:p.combatPassive,tactic:normalizeDoctrineTactic(p.doctrineTactic),
  equipped:Object.fromEntries(Object.entries(p.equipped).filter(([slot,id])=>gearSlots.includes(slot)&&typeof id==='string'&&id)),
  socketed:Object.fromEntries(Object.entries(p.socketed).filter(([slot,id])=>gearSlots.includes(slot)&&typeof id==='string'&&id))
 };
 return true;
}
function loadoutReadiness(index){
 const selected=p.combatLoadouts[index];
 if(!selected)return {ready:false,reason:'EMPTY'};
 if(run.phase==='fighting'||run.phase==='intermission')return {ready:false,reason:'BETWEEN SIEGES ONLY'};
 if(!combatDoctrineData[selected.doctrine]||p.level<combatDoctrineData[selected.doctrine].level||
    !combatPassiveData[selected.passive]||p.level<combatPassiveData[selected.passive].level)
  return {ready:false,reason:'HERO LEVEL LOCKED'};
 const seenGear=new Set(),seenRune=new Set();
 for(const [slot,id] of Object.entries(selected.equipped)){
  const item=p.inventory.find(g=>g.id===id);
  if(!item||seenGear.has(id)||(ringSlots.includes(slot)?item.slot!=='ring':item.slot!==slot))
   return {ready:false,reason:'EQUIPMENT MISSING'};
  seenGear.add(id);
 }
 for(const [slot,id] of Object.entries(selected.socketed)){
  if(!p.runes.some(r=>r.id===id)||seenRune.has(id))
   return {ready:false,reason:'RUNE MISSING'};
  seenRune.add(id);
 }
 return {ready:true,reason:'READY'};
}
function applyCombatLoadout(index){
 if(!Number.isInteger(index)||index<0||index>=combatLoadoutNames.length)return false;
 const status=loadoutReadiness(index);
 if(!status.ready)return false;
 const selected=p.combatLoadouts[index];
 // All validation happens before any mutation. Broken or sold-item builds cannot partially equip.
 p.combatDoctrine=selected.doctrine;p.combatPassive=selected.passive;p.doctrineTactic=normalizeDoctrineTactic(selected.tactic);
 p.equipped={...selected.equipped};
 p.socketed={...selected.socketed};
 run.maxHealth=maxWall();run.health=Math.min(run.health,run.maxHealth);
 return true;
}
function renderCombatLoadouts(compact=false){
 const counsel=compact?warCouncilPlan(chosenTier,useWaystone?waystoneForTier(chosenTier):1):null;
 const cards=combatLoadoutNames.map((name,index)=>{
  const saved=p.combatLoadouts[index],state=loadoutReadiness(index),active=saved&&
   saved.doctrine===p.combatDoctrine&&saved.passive===p.combatPassive&&normalizeDoctrineTactic(saved.tactic)===p.doctrineTactic&&
   JSON.stringify(saved.equipped)===JSON.stringify(p.equipped)&&
   JSON.stringify(saved.socketed)===JSON.stringify(p.socketed);
  return `<div class="build-preset${active?' active':''}"><div class="build-preset-copy"><small>SLOT ${index+1} · ${name}</small><strong>${saved?combatDoctrineData[saved.doctrine].name+' / '+combatPassiveData[saved.passive].name+' · '+doctrineTacticModes[normalizeDoctrineTactic(saved.tactic)].name:'EMPTY LOADOUT'}</strong><span>${saved?(compact&&state.ready?'TACTICAL MATCH '+warCouncilFit(saved.doctrine,saved.passive,counsel.guide,saved.socketed)+'/9 · '+state.reason:state.reason):'Save your current equipment, runes and abilities here.'}</span></div><div class="build-preset-actions">${compact?'':`<button type="button" data-action="saveLoadout:${index}" aria-label="Save current build into preset ${name}">SAVE</button>`}<button type="button" data-action="applyLoadout:${index}" ${state.ready?'':'disabled'} aria-label="Apply preset ${name}">${active?'EQUIPPED':state.ready?'EQUIP':'UNAVAILABLE'}</button></div></div>`;
 }).join('');
 return `<section class="combat-build-presets" aria-label="Saved combat loadout presets"><div class="combat-build-head"><strong>✦ ${compact?'QUICK PREPARATION':'THREE BATTLE LOADOUTS'}</strong><small>${compact?'Equip a saved build before the siege':'Three free presets · equipment and runes are referenced, never copied'}</small></div><div class="combat-build-grid">${cards}</div></section>`;
}
function chosenDoctrine(){return combatDoctrineData[p.combatDoctrine]||combatDoctrineData.vanguard;}
function doctrineCooldown(){
 const id=chosenDoctrine().id;
 if(id==='vanguard')return 10-Math.min(.8,skill('quiver')*.15);
 if(id==='storm')return 12-Math.min(1,skill('spark')*.18);
 return 14-Math.min(1.2,skill('bulwark')*.22);
}
function chooseCombatDoctrine(id){
 const selected=combatDoctrineData[id];
 if(!selected||p.level<selected.level)return false;
 if(p.combatDoctrine===id)return true;
 p.combatDoctrine=id;
 // Switching disciplines in a live battle cannot instantly reset an ability.
 run.doctrineClock=Math.max(3,Number(run.doctrineClock)||0);
 return true;
}
function castCombatDoctrine(){
 if(run.phase!=='fighting')return false;
 const targets=run.enemies.filter(e=>!e.dead).sort((a,b)=>threatPriority(b)-threatPriority(a));
 if(!targets.length)return false;
 const discipline=chosenDoctrine();
 if(p.level<discipline.level)return false;
 if(discipline.id==='vanguard'){
  const count=Math.min(skill('quiver')>=3?4:3,48-run.shots.length);
  if(count<=0)return false;
  const power=damage()*(.53+Math.min(.12,skill('aim')*.018));
  for(let i=0;i<count;i++)shoot(targets[i%targets.length],power,'arrow',478+(i%2)*28,385);
  effect(490,374,'#ffd18d',9);
  float(490,335,'HUNTER’S VOLLEY','#ffdfa2');
 }else if(discipline.id==='storm'){
  const power=damage()*(.42+Math.min(.10,skill('spark')*.014)+Math.min(.10,socketValue('storm')*2.5));
  for(const enemy of targets.slice(0,3)){
   hurt(enemy,power,'arcane');
   if(!enemy.dead)enemy.slow=Math.max(enemy.slow||0,.85+Math.min(.45,skill('hail')*.1));
   effect(enemy.x,enemy.y-6,'#90eaff',7);
  }
  float(480,337,'ARCANE CHAIN','#a0edff');
 }else{
  const frontline=targets.filter(e=>e.y>=245).slice(0,3);
  if(run.health>=run.maxHealth-1&&!frontline.length)return false;
  const healed=Math.max(0,Math.min(run.maxHealth-run.health,
    Math.round(run.maxHealth*(.018+Math.min(.012,skill('stone')*.002)))));
  run.health=Math.min(run.maxHealth,run.health+healed);
  for(const enemy of frontline){
   enemy.y=Math.max(120,enemy.y-(14+Math.min(12,skill('bulwark')*2)));
   enemy.slow=Math.max(enemy.slow||0,.65);
   effect(enemy.x,enemy.y,'#b9eccb',5);
  }
  effect(490,389,'#b9e6c7',11);
  float(485,355,'AEGIS PULSE · +'+formatWave(healed),'#bcebd3');
 }
 run.doctrineCasts=(run.doctrineCasts||0)+1;
 message(discipline.name+' · AUTO-CAST');
 return true;
}
function advanceCombatDoctrine(dt){
 if(run.phase!=='fighting'||run.speed===0||!Number.isFinite(dt)||dt<=0)return false;
 run.doctrineClock=Math.max(0,(run.doctrineClock||0)-dt);
 if(run.doctrineClock>0||!doctrineTacticEligible()||!castCombatDoctrine())return false;
 run.doctrineClock=doctrineCooldown();
 return true;
}
function refreshDoctrineHud(){
 const hud=$('doctrineHud');
 if(!hud)return;
 const active=run.phase==='fighting'||run.phase==='intermission';
 hud.hidden=!active;
 if(!active)return;
 const discipline=chosenDoctrine();
 const remaining=Math.max(0,run.doctrineClock||0);
 $('doctrineName').textContent=discipline.name;
 $('doctrineTimer').textContent=remaining>0?remaining.toFixed(1)+'s':doctrineTacticEligible()?'READY':'HELD';
 hud.dataset.tactic=normalizeDoctrineTactic(p.doctrineTactic);
 hud.dataset.school=discipline.id;
 hud.dataset.ready=remaining===0?'true':'false';
}

// The Tower-inspired structure: difficulty is chosen once, then every wave
// automatically follows the previous one until the fortress falls or player retreats.
const tierNames=['Verdant March','Ashen Frontier','Frostbound Pass','Sunken Dominion','Stormscar Reach','Hollow Kingdom','Emberfall Vale','Eclipse Bastion','Ancient Wilds','Astral Descent','Shattered Crown','Primordial Siege','Cinder Throne','Obsidian Expanse','Eternal Rift','Last Kingdom','Bloodglass Frontier','Moonveil Catacombs','Sunforged Divide','Thorned Crown','Gloamwater Depths','Shattered Zenith','Dreadroot Wilds','The Hollow Star','Obsidian Choir','Thundergrave Expanse','The Golden Abyss','The Fallen Pantheon','Worldscar Dominion','The Origin Gate'];
const roman=x=>{let n=Math.floor(Number(x));if(!Number.isFinite(n)||n<1||n>3999)return String(x);let out='';for(const [v,r] of [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']])while(n>=v){out+=r;n-=v;}return out;};
const MAX_WAVE=10000;
const formatWave=value=>Math.round(Math.max(0,value)).toLocaleString('en-US');
const MAX_TIER=tierNames.length;
const milestonesAt=[1,2,3,5,8,10,12,15,20,25,35,40,50,60,75,100,125,150,225,250,375,400,500,625,750,875,1000,1250,1500,1750,2000,2500,3000,3500,4000,5000,6000,6500,7500,8000,8500,9000,9500,MAX_WAVE];
const outerMilestones=new Set([125,225,375,625,875,1250,1750,3500,6500,8500,9500]);
const newBeginningMilestones=new Set([1,2,3,8,12,25,40,60]);
const CONQUEST_HOUR_TARGET=1250;
const earlyWatchChapters=[
 [3,'First Blood',220,45,0,0],
 [7,'The First Standard',350,75,0,1],
 [13,'A Warrior Awakens',400,110,1,0],
 [22,'Bastion Keeper',650,160,0,2],
 [35,'The Spoils of Courage',900,250,0,1],
 [53,'A Rising Star',1300,320,1,2],
 [77,'The Dawn Vanguard',1700,450,0,4],
 [108,'Banner of the Dawn',2100,600,1,5],
 [147,'Unyielding',3000,800,1,7],
 [195,'The Iron Promise',3800,1100,1,8],
 [253,'The First Citadel',4700,1500,1,10],
 [322,'Bearer of the Standard',5800,2100,2,12],
 [403,'Veteran of the March',7200,2800,2,14],
 [498,'Oath of the Defender',9000,3600,2,16],
 [609,'Before the Long Road',11000,4500,2,20],
 [750,'The First Watch Complete',15000,5500,3,25]
];
const dominionTrials=[
 {tier:17,crest:'Glassheart Crest',stat:'damage',bonus:.012,trial:'Sundering Glass',trait:'armored'},
 {tier:18,crest:'Moonveil Crest',stat:'essence',bonus:.018,trial:'Lunar Hunt',trait:'swift'},
 {tier:19,crest:'Sunforged Crest',stat:'boss',bonus:.025,trial:'Solar Challenge',trait:'elite'},
 {tier:20,crest:'Thorncrown Crest',stat:'wall',bonus:.019,trial:'Rootbound Siege',trait:'crushing'},
 {tier:21,crest:'Gloamwater Crest',stat:'knowledge',bonus:.018,trial:'Sunken Testament',trait:'swift'},
 {tier:22,crest:'Zenith Crest',stat:'critical',bonus:.020,trial:'Falling Stars',trait:'elite'},
 {tier:23,crest:'Dreadroot Crest',stat:'healing',bonus:.018,trial:'The Old Roots',trait:'armored'},
 {tier:24,crest:'Hollow Star Crest',stat:'runes',bonus:.018,trial:'Starless Night',trait:'crushing'},
 {tier:25,crest:'Obsidian Crest',stat:'armor',bonus:.018,trial:'Blackglass Rebellion',trait:'armored'},
 {tier:26,crest:'Thundergrave Crest',stat:'stations',bonus:.022,trial:'Stormbound Triumph',trait:'swift'},
 {tier:27,crest:'Abyssal Gold Crest',stat:'gold',bonus:.020,trial:'The Golden Depth',trait:'crushing'},
 {tier:28,crest:'Pantheon Crest',stat:'xp',bonus:.018,trial:'Fallen Gods',trait:'elite'},
 {tier:29,crest:'Worldscar Crest',stat:'damage',bonus:.016,trial:'The Last Scars',trait:'crushing'},
 {tier:30,crest:'Origin Crest',stat:'all',bonus:.012,trial:'The First and Last Gate',trait:'elite'}
];
const sovereignOaths=[
 ['sovereignBlade','Sovereign Blade','Hero damage +1.5% per rank.',30,58,17,250,'power'],
 ['sovereignAegis','Sovereign Aegis','Fortress maximum health +1.5% per rank.',35,58,20,1000,'fort'],
 ['sovereignTribute','Sovereign Tribute','Gold, Essence, and Knowledge +1.25% per rank.',40,58,24,2500,'gold'],
 ['sovereignJudgment','Sovereign Judgment','Boss and station attack damage +2% per rank.',45,58,28,5000,'boss']
];
const oathRank=id=>Math.min(58,Math.max(0,Number(p.sovereignOaths?.[id])||0));
const oathUnlocked=row=>!!p.milestones?.[row[5]+':'+row[6]];
const oathCost=row=>{const lv=oathRank(row[0]);return Math.ceil(row[3]*(1+lv*.08+lv*lv*.012));};
const dominionCrestWaves=[250,1000,5000,MAX_WAVE];
function dominionTrial(tier){return tier>=17?dominionTrials[tier-17]||null:null;}
function dominionBonus(key){
 let total=0;for(const trial of dominionTrials){
  if(trial.stat===key||trial.stat==='all'&&['damage','wall','essence','knowledge','gold','xp','boss','runes','stations','healing'].includes(key))
   total+=Math.min(4,Number(p.dominionCrests?.[trial.tier])||0)*trial.bonus;
 }
 return total;
}
function outerDepthPressure(tier,wave){
 const t=Math.max(1,Number(tier)||1);
 if(t<=16)return 1;
 const tierProgress=Math.min(1,(t-16)/14);
 const waveProgress=Math.max(0,Math.min(1,(wave-100)/9900));
 return 1+64*Math.pow(tierProgress,1.65)*Math.pow(waveProgress,2);
}
function dominionSeals(){
 return dominionTrials.reduce((sum,trial)=>sum+Math.min(4,Math.max(0,Number(p.dominionCrests?.[trial.tier])||0)),0);
}
function dominionResonance(){return dominionSeals()*.03;}
function tierThreat(tier){const t=Math.max(1,Math.min(MAX_TIER,Number(tier)||1));return 1+(t-1)*.64+(t>16?.12*Math.pow(t-16,1.6):0);}
function tierReward(tier){const t=Math.max(1,Math.min(MAX_TIER,Number(tier)||1));return 1+(t-1)*.32+Math.max(0,t-16)*.055;}

const waystonesAt=[100,250,500,1000,1500,2500,4000,6000,8000,9000];
const ascensionPaths=[
 ['vanguard','Vanguard Doctrine','Permanent damage +6% per rank.',8,40,150],
 ['bastion','Bastion Covenant','Permanent fortress HP +7% per rank.',9,40,400],
 ['sunder','Armor Unbinding','Ignore 2.5% enemy armor per rank, up to 75%.',13,30,1000],
 ['epoch','Epoch Resonance','Damage grows by 1.5% per rank × the square root of current wave / 100.',19,40,2500],
 ['volley','Eternal Volley','Gain one additional attack arrow for every six ranks.',26,36,5000]
];
const ascRank=id=>n(p.ascension,id);
const ascUnlockWave=row=>row[5];
function waveThreat(wave){
 const w=Math.max(1,Math.min(MAX_WAVE,wave));
 return w<=100?1+w*.19:20*Math.pow(1+(w-100)/180,1.65);
}
function enemySpeedFactor(wave){
 const w=Math.max(1,Math.min(MAX_WAVE,wave));
 return 1+.023*Math.min(w,75)+.12*Math.log2(1+Math.max(0,w-75)/100);
}
function waveArmor(wave,tier){
 const w=Math.max(1,Math.min(MAX_WAVE,wave));
 return .21*Math.min(w,100)+(w>100?.20*Math.pow(w-100,.92):0)+(tier-1)*2;
}
// Alpha 0.10.0, slice 1 — deterministic encounter director; no extra save fields.
const encounterFactions=[
 {id:'mire',name:'Mirebound Swarm',units:['goblin','skeleton','raider','warg'],color:'#a8d185'},
 {id:'iron',name:'Ironbound Host',units:['guardian','guardian','skeleton','goblin'],color:'#b7cfda'},
 {id:'ash',name:'Ashen Covenant',units:['skeleton','shaman','goblin','raider'],color:'#d9a8d8'},
 {id:'night',name:'Nightpack Raiders',units:['raider','raider','warg','goblin'],color:'#e5ad87'},
 {id:'crown',name:'Crownless Legion',units:['guardian','shaman','raider','skeleton'],color:'#efd29b'},
 {id:'frostvein',name:'Frostvein Conclave',units:['frostbinder','frostbinder','guardian','warg'],color:'#a3d8ee'},
 {id:'cinder',name:'Cinder Siegecraft',units:['sapper','sapper','raider','skeleton'],color:'#f2ae82'},
 {id:'gilded',name:'Gilded Remnant',units:['banneret','banneret','guardian','shaman'],color:'#f3da91'},
 {id:'thorn',name:'Thornwake Circle',units:['thornweaver','thornweaver','guardian','warg'],color:'#b8d490'},
 {id:'rift',name:'Riftborne Court',units:['riftstalker','riftstalker','raider','skeleton'],color:'#c8ade9'}
];
const encounterLabels={standard:'PATROL',vanguard:'VANGUARD',elite:'ELITE STRIKE',commander:'SIEGE COMMANDER',chapterBoss:'CHAPTER WARLORD',treasure:'TREASURE RAID',ambush:'NIGHT AMBUSH',relic:'RELIC HUNT',bannerAssault:'STANDARD ASSAULT',arcane:'ARCANE CONVERGENCE'};
function encounterDirector(wave,tier=1){
 const w=clamp(Math.floor(Number(wave)||1),1,MAX_WAVE);
 const t=clamp(Math.floor(Number(tier)||1),1,MAX_TIER);
 const chapter=1+Math.floor((w-1)/100);
 const faction=encounterFactions[(t-1+chapter-1)%encounterFactions.length];
 const kind=w%100===0?'chapterBoss':w%25===0?'commander':w%10===0?'elite':w%5===0?'vanguard':w>=15&&w%37===0?'treasure':w>=30&&w%89===43?'relic':w>=50&&w%113===61?'bannerAssault':w>=45&&w%127===94?'arcane':w>=8&&w%17===0?'ambush':'standard';
 const bossType=kind==='chapterBoss'?'warlord':kind==='commander'?'siegebeast':['elite','vanguard'].includes(kind)?'ogre':null;
 const bossStyle=['iron','ember','rift'][(chapter-1)%3];
 const bossName={iron:'IRON TYRANT',ember:'CINDER REGENT',rift:'VOID MONARCH'}[bossStyle];
 return {wave:w,tier:t,chapter,factionId:faction.id,faction:faction.name,color:faction.color,units:faction.units,kind,bossType,bossStyle,bossName,label:kind==='chapterBoss'?bossName:encounterLabels[kind]};
}
// The War Council uses the real chapter/faction director, rather than a guessed
// enemy roster. The values are tactical match weights, NOT simulated win rates.
const factionWarCouncil={
 mire:{threat:'FAST FLANKS',risk:'Wargs and raiders can reach the fortress before slower volleys finish.',tip:'Pushback and wall protection help control a rush; Frost runes can slow arrow targets.',rune:'frost',
  doctrine:{vanguard:2,storm:3,aegis:4},passive:{hunter:2,conductor:2,sentinel:4}},
 iron:{threat:'SHIELD FORMATIONS',risk:'Guardian units shelter other infantry while they press toward the wall.',tip:'Arcane Chain can strike several targets; Storm runes improve its chain damage and arrow lightning.',rune:'storm',
  doctrine:{vanguard:3,storm:4,aegis:1},passive:{hunter:3,conductor:4,sentinel:1}},
 ash:{threat:'REAR-LINE RITUALS',risk:'Shamans can heal damaged enemies while raiders advance.',tip:'Focused arrows and Predator’s Eye damage help remove support casters; Ember runes add burn on arrows.',rune:'ember',
  doctrine:{vanguard:4,storm:3,aegis:1},passive:{hunter:4,conductor:3,sentinel:1}},
 night:{threat:'RUSHING RAIDERS',risk:'Fast raiders and wargs may breach if the defense cannot stall them.',tip:'Aegis knockback and Rampart Oath protect the wall; Frost runes can slow arrow hits.',rune:'frost',
  doctrine:{vanguard:2,storm:3,aegis:4},passive:{hunter:2,conductor:2,sentinel:4}},
 crown:{threat:'MIXED ELITE SUPPORT',risk:'Shield guards and shamans combine protection, healing and approaching troops.',tip:'Arcane Chain hits several targets, while focused volleys remain useful for shaman removal.',rune:'storm',
  doctrine:{vanguard:3,storm:4,aegis:2},passive:{hunter:3,conductor:4,sentinel:2}},
 frostvein:{threat:'FROST SPELL WINDUPS',risk:'Frostbinders telegraph rites that slow the hero’s firing rhythm.',tip:'Focused arrows and Predator’s Eye can break the Frostbinder windup before chill activates.',rune:'ember',
  doctrine:{vanguard:4,storm:3,aegis:2},passive:{hunter:4,conductor:3,sentinel:2}},
 cinder:{threat:'SAPPER EXPLOSIVES',risk:'Sappers light fuses that directly damage fortress health if they finish.',tip:'Burst arrows and Predator’s Eye help disarm a fuse; Rampart Oath can mitigate damage if one explodes.',rune:'frost',
  doctrine:{vanguard:4,storm:2,aegis:3},passive:{hunter:4,conductor:1,sentinel:3}},
 gilded:{threat:'BANNER & HEAL SUPPORT',risk:'Bannerets accelerate nearby soldiers while shamans heal them.',tip:'Predator’s Eye boosts focused arrows against both support roles; Storm runes help additional targets.',rune:'storm',
  doctrine:{vanguard:4,storm:3,aegis:1},passive:{hunter:4,conductor:3,sentinel:1}},
 thorn:{threat:'THORN WARD CASTERS',risk:'Thornweavers create temporary protection around approaching enemies.',tip:'Focused arrows and Predator’s Eye can break the Ward windup before protection activates.',rune:'ember',
  doctrine:{vanguard:4,storm:3,aegis:2},passive:{hunter:4,conductor:3,sentinel:2}},
 rift:{threat:'TELEPORT WINDUPS',risk:'Riftstalkers can blink toward the wall unless their cast is interrupted.',tip:'Predator’s Eye and focused arrows help disrupt the blink; Frost runes can slow survivors.',rune:'frost',
  doctrine:{vanguard:4,storm:3,aegis:2},passive:{hunter:4,conductor:3,sentinel:2}}
};
const trainingCouncil={threat:'FIRST WATCH PATROLS',risk:'The first seven waves use introductory goblins, skeletons and wargs, regardless of the later chapter faction.',tip:'Hunter’s Volley is a reliable starter option. Keep early rewards for useful training rather than chasing a locked build.',rune:'frost',
 doctrine:{vanguard:4,storm:2,aegis:2},passive:{hunter:4,conductor:2,sentinel:2}};
const bossCouncil={
 iron:{threat:'IRON WARD COUNTERPLAY',risk:'The Iron Tyrant briefly shields itself before it can be shattered by focused damage.',tip:'Hunter’s Volley and Predator’s Eye focus the active ward. Aegis or Rampart Oath remains a valid defensive alternative if your wall is struggling.',rune:'storm',
  doctrine:{vanguard:4,storm:3,aegis:2},passive:{hunter:4,conductor:3,sentinel:2}},
 ember:{threat:'EMBER CHARGE COUNTERPLAY',risk:'The Cinder Regent telegraphs a charge that focused damage can interrupt.',tip:'Burst arrows and Predator’s Eye create break pressure during the short charge windup; Ember runes add damage over time to arrows.',rune:'ember',
  doctrine:{vanguard:4,storm:3,aegis:2},passive:{hunter:4,conductor:3,sentinel:2}},
 rift:{threat:'VOID STEP COUNTERPLAY',risk:'The Void Monarch telegraphs a blink toward your wall.',tip:'Focused arrow bursts can break the windup, while Frost runes can slow targets if they survive.',rune:'frost',
  doctrine:{vanguard:4,storm:3,aegis:2},passive:{hunter:4,conductor:3,sentinel:2}},
 commander:{threat:'SIEGE BEAST CRUSHER',risk:'The Siege Beast prepares a crushing strike; it can be interrupted by focused damage.',tip:'Predator’s Eye empowers focused arrows against the boss. Aegis or Sentinel may be preferable when fortress health is low.',rune:'ember',
  doctrine:{vanguard:4,storm:3,aegis:2},passive:{hunter:4,conductor:3,sentinel:2}}
};
function warCouncilFit(doctrine,passive,tactics,sockets={}){
 if(!combatDoctrineData[doctrine]||!combatPassiveData[passive]||!tactics)return 0;
 const synergy=Object.values(sockets||{}).some(id=>p.runes.some(r=>r&&r.id===id&&r.type===tactics.rune))?1:0;
 return (tactics.doctrine[doctrine]||0)+(tactics.passive[passive]||0)+synergy;
}
function warCouncilPlan(tier=chosenTier,wave=useWaystone?waystoneForTier(tier):1){
 const selectedTier=clamp(Math.floor(Number(tier)||1),1,MAX_TIER);
 const start=clamp(Math.floor(Number(wave)||1),1,MAX_WAVE);
 const encounter=encounterDirector(start,selectedTier);
 const training=start<=7,guide=training?trainingCouncil:encounter.kind==='chapterBoss'?bossCouncil[encounter.bossStyle]:encounter.kind==='commander'?bossCouncil.commander:factionWarCouncil[encounter.factionId];
 const options=[];
 for(const doctrine of Object.keys(combatDoctrineData)){
  if(p.level<combatDoctrineData[doctrine].level)continue;
  for(const passive of Object.keys(combatPassiveData)){
   if(p.level<combatPassiveData[passive].level)continue;
   options.push({doctrine,passive,fit:warCouncilFit(doctrine,passive,guide,p.socketed)});
  }
 }
 options.sort((a,b)=>b.fit-a.fit||a.doctrine.localeCompare(b.doctrine)||a.passive.localeCompare(b.passive));
 const recommended=options[0]||{doctrine:'vanguard',passive:'hunter',fit:0};
 let upcoming=null;
 for(let w=start;w<=Math.min(MAX_WAVE,start+100);w++){
  const e=encounterDirector(w,selectedTier);
  if(['chapterBoss','commander','relic','arcane','bannerAssault','ambush','elite'].includes(e.kind)){
   upcoming={wave:e.wave,kind:e.kind,label:e.label,bossStyle:e.bossStyle};
   break;
  }
 }
 return {tier:selectedTier,wave:start,chapter:encounter.chapter,factionId:encounter.factionId,
  faction:encounter.faction,training,guide,upcoming,recommended,
  currentFit:warCouncilFit(p.combatDoctrine,p.combatPassive,guide,p.socketed),
  runeEquipped:Object.values(p.socketed).some(id=>p.runes.some(r=>r&&r.id===id&&r.type===guide.rune)),
  runeOwned:p.runes.filter(r=>r&&r.type===guide.rune).length};
}
function applyWarCouncil(){
 if(run.phase==='fighting'||run.phase==='intermission')return false;
 const rec=warCouncilPlan().recommended;
 if(!combatDoctrineData[rec.doctrine]||p.level<combatDoctrineData[rec.doctrine].level||
    !combatPassiveData[rec.passive]||p.level<combatPassiveData[rec.passive].level)return false;
 const changed=p.combatDoctrine!==rec.doctrine||p.combatPassive!==rec.passive;
 if(!changed)return true;
 p.combatDoctrine=rec.doctrine;p.combatPassive=rec.passive;
 run.doctrineClock=Math.max(3,Number(run.doctrineClock)||0);
 return true;
}

/* Alpha 0.11.5: actual-cost War Council training, never auto-spent. */
const councilTrainingDetails={
 power:{note:'+2 base hero damage per rank',role:'FOCUS FIRE'},
 haste:{note:'Faster basic attacks as ranks accumulate',role:'RATE OF FIRE'},
 fort:{note:'+12 base fortress maximum HP per rank',role:'WALL ENDURANCE'}
};
function councilTrainingOffers(plan=warCouncilPlan()){
 const fast=['mire','night','rift'].includes(plan.factionId);
 const ward=plan.guide===bossCouncil.commander||plan.guide===bossCouncil.iron;
 const order=plan.tier===1&&plan.wave<=20?['power','haste','fort']:
  fast?['fort','haste','power']:ward?['power','fort','haste']:
  ['ash','frostvein','cinder','gilded','thorn'].includes(plan.factionId)?['haste','power','fort']:['power','haste','fort'];
 return order.map((id,i)=>{
  const row=training.find(item=>item[0]===id),rank=t(id),cost=rank<row[5]?trainCost(row):null;
  return {id,title:row[1],rank,cap:row[5],cost,
   affordable:cost!==null&&p.essence>=cost,
   suggested:i===0,role:councilTrainingDetails[id].role,note:councilTrainingDetails[id].note};
 });
}
function purchaseCouncilTraining(id){
 if(run.phase==='fighting'||run.phase==='intermission')return false;
 if(!['power','haste','fort'].includes(id))return false;
 const row=training.find(item=>item[0]===id);
 if(!row||t(id)>=row[5])return false;
 const cost=trainCost(row);
 if(!Number.isFinite(cost)||cost<0||p.essence<cost)return false;
 p.essence-=cost;p.training[id]=t(id)+1;
 run.maxHealth=maxWall();run.health=Math.min(run.health+12,run.maxHealth);
 return true;
}
function renderCouncilQuartermaster(plan){
 const offers=councilTrainingOffers(plan);
 return '<div class="war-quartermaster" aria-label="Quartermaster permanent training">'+
  '<div class="war-quartermaster-head"><strong>⚒ THE FIELD QUARTERMASTER</strong><span>'+fmt(p.essence)+' HERO ESSENCE AVAILABLE</span></div>'+
  '<p>Buy permanent training before a siege. Suggested order reflects upcoming threats, not guaranteed victory.</p>'+
  '<div class="war-quartermaster-grid">'+offers.map(o=>
   '<div class="war-quartermaster-entry '+(o.suggested?'suggested':'')+'"><div>'+
   '<small>'+(o.suggested?'✦ SUGGESTED FIRST · ':'')+o.role+'</small>'+
   '<strong>'+o.title+' · Rank '+fmt(o.rank)+' / '+fmt(o.cap)+'</strong><span>'+o.note+'</span></div>'+
   '<button type="button" data-council-train="'+o.id+'" '+(!o.affordable||run.phase==='fighting'||run.phase==='intermission'?'disabled':'')+'>'+
   (o.cost===null?'MAX RANK':o.affordable?'TRAIN · '+fmt(o.cost)+' ESSENCE':'NEED '+fmt(o.cost)+' ESSENCE')+
   '</button></div>').join('')+'</div>'+
  '<small>Same prices and ranks as Power → Training. Each tap buys one rank; no Sigils, items or runes spent.</small></div>';
}
// Alpha 0.11.6 — optional session-based recovery, never a grant or automated purchase.
function councilRecoveryAdvice(tier=chosenTier){
 const report=lastSiegeReport;
 if(!report||report.reason!=='fallen'||report.tier!==tier)return null;
 const early=report.tier===1&&report.lastWave<=20;
 const preference=early?'power':report.breaches>=6?'fort':'haste';
 const options=councilTrainingOffers(warCouncilPlan(tier,report.lastWave));
 let next=options.find(o=>o.id===preference&&o.affordable);
 if(!next)next=options.find(o=>o.affordable);
 if(!next)next=options.find(o=>o.id===preference&&o.cost!==null);
 if(!next)next=options.find(o=>o.cost!==null);
 return {wave:report.lastWave,cleared:report.cleared,breaches:report.breaches,
  bossEscapes:report.bossEscapes,essence:p.essence,offer:next||null};
}
function renderCouncilRecovery(tier=chosenTier){
 const data=councilRecoveryAdvice(tier);
 if(!data)return '';
 const offered=data.offer;
 const note=offered?'Strengthen '+offered.title+' with a permanent rank before retrying.':'All three Field Quartermaster training lines are at maximum rank.';
 const button=offered?'<button type="button" data-council-train="'+offered.id+'" '+(offered.affordable?'':'disabled')+'>'+
  (offered.affordable?'REINFORCE · '+fmt(offered.cost)+' ESSENCE':'NEED '+fmt(offered.cost)+' ESSENCE')+'</button>':'';
 return '<div class="war-recovery" role="status" aria-label="Siege recovery and next training step">'+
  '<div class="war-recovery-header"><strong>✦ RALLY AFTER DEFEAT</strong><span>WAVE '+formatWave(data.wave)+' REACHED</span></div>'+
  '<p>Last siege: '+formatWave(data.cleared)+' waves cleared · '+formatWave(data.breaches)+
  ' breaches'+(data.bossEscapes?' · '+formatWave(data.bossEscapes)+' bosses escaped':'')+
  '. Earned rewards stay yours. You currently have '+fmt(data.essence)+' Hero Essence.</p>'+
  '<div class="war-recovery-action"><span>'+note+' No purchases are automatic.</span>'+button+'</div></div>';
}

/* 0.11.8: cost-exact permanent Sigil preparation. No automatic spending. */
function warChestOffers(tier=chosenTier,wave=useWaystone?waystoneForTier(tier):1){
 const plan=warCouncilPlan(tier,wave);
 const faction=plan.factionId,rush=['mire','night','rift'].includes(faction);
 const armored=['iron','crown','thorn'].includes(faction);
 const boss=['commander','chapterBoss'].includes(encounterDirector(plan.wave,plan.tier).kind);
 const options=[];
 for(const row of legacyPaths)if(p.legacyUnlocked&&lr(row[0])<row[4])options.push({kind:'legacy',id:row[0],name:row[1],rank:lr(row[0]),cap:row[4],cost:legacyCost(row)});
 for(const row of ascensionPaths)if(ascUnlocked(row)&&ascRank(row[0])<row[4])options.push({kind:'ascension',id:row[0],name:row[1],rank:ascRank(row[0]),cap:row[4],cost:ascCost(row)});
 for(const row of sovereignOaths)if(oathUnlocked(row)&&oathRank(row[0])<row[4])options.push({kind:'oath',id:row[0],name:row[1],rank:oathRank(row[0]),cap:row[4],cost:oathCost(row)});
 const primary={siegebreaker:4,guardianOath:4,goldenTouch:2,vanguard:7,bastion:6,sunder:7,epoch:6,volley:7,sovereignBlade:8,sovereignAegis:7,sovereignTribute:3,sovereignJudgment:7};
 for(const o of options){
  o.affordable=p.sigils>=o.cost;
  o.priority=(primary[o.id]||0)+(rush&&['bastion','guardianOath','sovereignAegis'].includes(o.id)?5:0)
    +(armored&&o.id==='sunder'?7:0)+(boss&&['siegebreaker','sovereignJudgment','vanguard'].includes(o.id)?5:0);
 }
 options.sort((a,b)=>Number(b.affordable)-Number(a.affordable)||b.priority-a.priority||a.cost-b.cost||a.id.localeCompare(b.id));
 const upcoming=tierMilestones(plan.tier).filter(w=>w>=plan.wave&&!p.milestones[milestoneKey(plan.tier,w)])
  .map(w=>({wave:w,sigils:sigilMilestoneAmount(plan.tier,w)})).find(x=>x.sigils>0)||null;
 return {tier:plan.tier,available:p.sigils,options:options.slice(0,3),totalUnlocked:options.length,
  upcoming,reason:armored?'Armored enemy pressure':rush?'Fast breach pressure':boss?'Siege boss pressure':'General frontline preparation'};
}
function purchaseWarChest(kind,id){
 if(run.phase==='fighting'||run.phase==='intermission'||typeof id!=='string')return false;
 const rows=kind==='legacy'?legacyPaths:kind==='ascension'?ascensionPaths:kind==='oath'?sovereignOaths:null;
 if(!rows)return false;
 const row=rows.find(x=>x[0]===id);
 if(!row)return false;
 const isUnlocked=kind==='legacy'?p.legacyUnlocked:kind==='ascension'?ascUnlocked(row):oathUnlocked(row);
 const rank=kind==='legacy'?lr(id):kind==='ascension'?ascRank(id):oathRank(id);
 const cost=kind==='legacy'?legacyCost(row):kind==='ascension'?ascCost(row):oathCost(row);
 if(!isUnlocked||rank>=row[4]||!Number.isSafeInteger(cost)||cost<=0||p.sigils<cost)return false;
 const budget=p.sigils;
 action(kind+':'+id); // Reuse actual Power purchase, autosave and upgrade effect.
 const newRank=kind==='legacy'?lr(id):kind==='ascension'?ascRank(id):oathRank(id);
 return newRank===rank+1&&p.sigils===budget-cost;
}
function renderWarChest(tier=chosenTier,wave=useWaystone?waystoneForTier(tier):1){
 if(!p.legacyUnlocked&&p.sigils<=0&&p.unlockedTier<=2)return '';
 const info=warChestOffers(tier,wave);
 const preview=info.upcoming?'Next unclaimed Sigil milestone: wave '+formatWave(info.upcoming.wave)+' · +'+fmt(info.upcoming.sigils)+' once if cleared.':'No further unclaimed Sigil milestone at or after this starting wave.';
 return `<details class="war-chest" aria-label="Permanent pre-siege Sigil planning">
  <summary>💠 THE SOVEREIGN WAR CHEST <span>${fmt(info.available)} HELD SIGILS · ${info.totalUnlocked} UNLOCKED PATHS</span></summary>
  <div class="war-chest-body"><p>Real permanently earned Sigils and rank prices. Order reflects ${info.reason.toLowerCase()}, not a predicted win rate. <b>No spending is automatic.</b></p>
   <div class="war-chest-offers">${info.options.length?info.options.map((o,i)=>`<article class="war-chest-offer"><div>
    <small>${i===0?'✦ FIRST SUGGESTION · ':''}${o.kind.toUpperCase()}</small><strong>${o.name}</strong>
    <span>RANK ${o.rank} / ${o.cap} · ${fmt(o.cost)} SIGILS</span></div>
    <button type="button" data-war-chest="${o.kind}:${o.id}" ${o.affordable?'':'disabled'}>${o.affordable?'BUY +1 · '+fmt(o.cost):'NEED '+fmt(o.cost)}</button></article>`).join(''):'<p>No masteries are unlocked yet, or all are mastered. Earn one-time milestones to unlock more.</p>'}</div>
   <small>${preview} Future rewards are not yet spendable. See Power → Training → Primal Sigil Ledger for the complete finite supply.</small>
  </div></details>`;
}
function renderWarCouncil(tier=chosenTier,wave=useWaystone?waystoneForTier(tier):1){
 const plan=warCouncilPlan(tier,wave),rec=plan.recommended;
 const same=p.combatDoctrine===rec.doctrine&&p.combatPassive===rec.passive;
 const runeNote=plan.runeEquipped?'SOCKETED AND READY':plan.runeOwned?'OWNED · EQUIP IN RUNE WORKSHOP':'NOT OWNED · OPTIONAL';
 const upcoming=plan.upcoming?`NEXT ${plan.upcoming.label} · WAVE ${formatWave(plan.upcoming.wave)}`:'NO FURTHER EVENTS';
 return `<section class="war-council" aria-label="Faction-aware battle preparation">
  <div class="war-council-heading"><div><small>⚔ THE WAR COUNCIL · TIER ${roman(plan.tier)} · WAVE ${formatWave(plan.wave)}</small>
  <strong>${plan.guide.threat}</strong><span>${plan.faction} · Chapter ${roman(plan.chapter)}${plan.training?' · INTRODUCTORY WAVES':''}</span></div>
  <span class="war-council-next">${upcoming}</span></div>
  <p class="war-council-risk">${plan.guide.risk}</p>
  <p class="war-council-tip">${plan.guide.tip}</p>
  ${renderCouncilRecovery(plan.tier)}
  <div class="war-council-choice"><div><small>BEST AVAILABLE TACTICAL PAIR · HERO LV ${p.level}</small>
  <strong>${combatDoctrineData[rec.doctrine].name} + ${combatPassiveData[rec.passive].name}</strong>
  <span>CURRENT BUILD FIT ${plan.currentFit}/9 · SUGGESTED PAIR FIT ${rec.fit}/9 · Guidance only, not a simulated win rate</span></div>
  <button type="button" data-war-council="apply" ${same?'disabled':''}>${same?'PAIR EQUIPPED':'EQUIP SUGGESTED PAIR'}</button></div>
  <div class="war-council-rune"><strong>◇ ${plan.guide.rune.toUpperCase()} RUNE</strong><span>${runeNote}</span></div>
  <p class="war-council-foot">The suggestion changes only your active doctrine and passive. Gear, rune sockets and saved presets stay yours. Compare your presets below before launching.</p>
  ${renderCouncilQuartermaster(plan)}
  ${renderDoctrineTactics(true)}
  ${renderWarChest(plan.tier,plan.wave)}
 </section>`;
}
function encounterUnit(encounter,spawned=0){
 if(encounter.wave<=3)return spawned%3===0?'skeleton':'goblin';
 if(encounter.wave<=7)return ['goblin','skeleton','warg'][spawned%3];
 if(encounter.kind==='ambush')return spawned%3===0?'warg':'raider';
 if(encounter.kind==='bannerAssault')return ['banneret','guardian','raider','guardian','shaman','skeleton'][spawned%6];
 if(encounter.kind==='relic')return ['guardian','skeleton','raider','guardian','warg','shaman'][spawned%6];
 if(encounter.kind==='arcane')return ['frostbinder','skeleton','shaman','guardian','thornweaver','warg'][spawned%6];
 const candidates=encounter.units.filter(type=>encounter.wave>=20||!['shaman','frostbinder','sapper','banneret','thornweaver','riftstalker'].includes(type));
 return candidates[Math.floor(Math.random()*candidates.length)]||'goblin';
}
// Arrival positions create recognizable formations without adding enemies or changing rewards.
function formationPosition(encounter,spawned,type,isBoss=false,relicGuardian=false,reinforcement=false){
 const index=Math.max(0,Math.floor(Number(spawned)||0)),slot=index%6,row=Math.floor(index/6);
 const jitter=()=>rnd(-9,9),lane=[245,340,435,525,620,715][slot];
 const back=124+row*2+rnd(0,7),front=151+row*2+rnd(0,8);
 if(reinforcement)return {x:(index%2?790:170)+jitter(),y:125+rnd(0,12)};
 if(isBoss)return {x:480+rnd(-23,23),y:134+rnd(0,9)};
 if(relicGuardian)return {x:480+rnd(-16,16),y:130+rnd(0,9)};
 if(encounter.kind==='ambush')return {x:(index%2?786:174)+jitter(),y:163+row*2+rnd(0,11)};
 if(encounter.kind==='bannerAssault'){
  if(type==='banneret')return {x:(index%2?555:405)+jitter(),y:back};
  if(type==='guardian')return {x:(index%2?606:354)+jitter(),y:front};
  if(type==='raider')return {x:(index%2?765:190)+jitter(),y:front+6};
  return {x:lane+jitter(),y:type==='shaman'?back:front};
 }
 if(encounter.kind==='relic'){
  if(type==='guardian')return {x:(index%2?605:355)+jitter(),y:front};
  if(type==='shaman')return {x:480+jitter(),y:back};
  return {x:lane+jitter(),y:front};
 }
 if(encounter.kind==='arcane'){
  if(['shaman','frostbinder','thornweaver'].includes(type))return {x:(index%3===0?270:index%3===1?480:690)+jitter(),y:back};
  if(type==='guardian')return {x:(index%2?615:345)+jitter(),y:front};
  return {x:lane+jitter(),y:front};
 }
 if(encounter.kind==='chapterBoss'||encounter.kind==='commander'){
  if(type==='guardian')return {x:(index%2?605:355)+jitter(),y:front};
  return {x:lane+jitter(),y:type==='shaman'?back:front};
 }
 return {x:rnd(140,820),y:rnd(122,154)};
}
function isSiegeBoss(enemy){return !!enemy&&(enemy.isBoss===true||['ogre','warlord','siegebeast'].includes(enemy.type));}
function shieldAuraReduction(enemy,units){
 if(!enemy||enemy.dead||enemy.type==='guardian')return 1;
 const defender=units.some(other=>other&&!other.dead&&other.type==='guardian'&&Math.hypot(other.x-enemy.x,other.y-enemy.y)<=115);
 return defender?.78:1;
}
// Thorn ward is temporary, requires a living nearby caster, and cannot stack with itself.
function thornWardReduction(enemy,units){
 if(!enemy||enemy.dead||enemy.type==='thornweaver')return 1;
 return units.some(other=>other&&!other.dead&&other.type==='thornweaver'&&other.thornWardTimer>0&&Math.hypot(other.x-enemy.x,other.y-enemy.y)<=108)?.86:1;
}
function rallyAuraFactor(enemy,units){
 if(!enemy||enemy.dead||enemy.type==='banneret')return 1;
 return units.some(other=>other&&!other.dead&&other.type==='banneret'&&Math.hypot(other.x-enemy.x,other.y-enemy.y)<=115)?1.16:1;
}
function threatPriority(enemy){
 if(!enemy||enemy.dead)return -Infinity;
 const charge=enemy.type==='sapper'&&enemy.fuseTime>0?190:0;
 const frost=enemy.type==='frostbinder'&&enemy.frostWindup>0?80:0;
 const thorn=enemy.type==='thornweaver'&&enemy.thornWindup>0?88:0;
 const rift=enemy.type==='riftstalker'&&enemy.blinkWindup>0?165:0;
 const ward=enemy.type==='thornweaver'&&enemy.thornWardTimer>0?30:0;
 const healing=enemy.type==='shaman'&&enemy.ritualClock<=1.5?40:enemy.type==='shaman'?22:0;
 const rally=enemy.type==='banneret'?38:0;
 const keeper=enemy.relicGuardian?48:0;
 const shield=enemy.type==='guardian'&&run.enemies.some(other=>other&&!other.dead&&other!==enemy&&Math.hypot(other.x-enemy.x,other.y-enemy.y)<=115)?26:0;
 const boss=isSiegeBoss(enemy)?28:0;
 const bossWindup=enemy.crushWindup>0||enemy.bossFuryWindup>0||enemy.bossBlinkWindup>0?170:0;
 // The active Iron Ward lasts just 2.2 seconds. Give it a fair focus-fire priority,
 // without overriding a Sapper whose fuse is dangerously close to the wall.
 const bossWard=enemy.type==='warlord'&&enemy.bossWardTimer>0?195:0;
 return enemy.y+charge+frost+thorn+rift+ward+healing+rally+keeper+shield+boss+bossWindup+bossWard;
}
function chapterChallenge(encounter){
 return encounter&&encounter.kind==='chapterBoss'?{key:encounter.tier+':'+encounter.chapter,desc:'HOLD THE LINE · FINISH WITH ZERO BREACHES'}:null;
}
function relicChallenge(encounter){
 return encounter&&encounter.kind==='relic'?{key:encounter.tier+':'+encounter.wave,desc:'RECOVER THE RELIC · ZERO BREACHES'}:null;
}
function encounterSpecialBonus(kind){return kind==='treasure'?1.35:kind==='bannerAssault'?1.20:1;}
function encounterKnowledgeBonus(kind){return kind==='arcane'?1.18:1;}
function encounterAdvice(kind){
 return {chapterBoss:'BREAK BOSS CASTS · FLAWLESS BONUS',commander:'CHARGE WINDUP · INTERRUPT THE SIEGE BEAST',
 treasure:'TREASURE RAID · +35% WAVE GOLD',relic:'RELIC WARDEN · NO BREACHES FOR A RUNE',
 bannerAssault:'BREAK THE BANNERS · +20% WAVE GOLD',
 arcane:'PRIORITIZE CASTERS · +18% WAVE KNOWLEDGE',
 ambush:'RUSHERS APPROACH · WATCH THE WALL'}[kind]||'';
}
const casterRoles=['shaman','frostbinder','thornweaver'];
function allowedSpecialist(type,active){
 if(casterRoles.includes(type)&&active.filter(e=>!e.dead&&casterRoles.includes(e.type)).length>=3)return 'skeleton';
 if(['shaman','frostbinder','sapper','banneret','thornweaver','riftstalker'].includes(type)&&active.filter(e=>!e.dead&&e.type===type).length>=2)return 'skeleton';
 return type;
}
function waveEnemyCount(wave){
 return Math.min(24,8+Math.floor(Math.max(1,wave)*1.5)+(wave%5===0?1:0));
}
function milestoneUnlockedAt(wave){
 return Object.keys(p.milestones||{}).some(key=>p.milestones[key]&&key.endsWith(':'+wave));
}
function ascUnlocked(row){return milestoneUnlockedAt(ascUnlockWave(row));}
function ascCost(row){const rank=ascRank(row[0]);return Math.ceil(row[3]*(1+rank*.12+rank*rank*.018));}
function waystoneForTier(tier){
 return waystonesAt.filter(w=>p.milestones[milestoneKey(tier,w)]).at(-1)||1;
}
let useWaystone=true;
const legacyPaths=[['siegebreaker','Siegebreaker','Deal +6% damage to siege bosses per rank.',2,30],['guardianOath','Guardian’s Oath','Increase permanent wall durability +3% per rank.',2,35],['goldenTouch','Golden Touch','Earn +4% gold from monster kills per rank.',3,40]];
const lr=id=>n(p.legacy,id);
function tierAdvanceWave(tier){
 if(tier>=MAX_TIER)return null;
 if(tier<=16)return 20;
 if(tier<=20)return 100;
 if(tier<=24)return 150;
 return 250;
}
function decorateTierGate(tier,wave,prize){
 if(tier<MAX_TIER&&tierAdvanceWave(tier)===wave){
  prize.unlockNext=tier+1;
  prize.detail+=' · UNLOCK TIER '+roman(tier+1);
 }
 const oath=sovereignOaths.find(row=>row[5]===tier&&row[6]===wave);
 if(oath)prize.detail+=' · UNLOCK '+oath[1]+' in Power → Training';
 return prize;
}
function tierMilestones(tier){return milestonesAt.filter(w=>tier>=17||!outerMilestones.has(w));}
function tierMilestone(tier,wave){
 const trial=dominionTrial(tier);
 const scale=1+(tier-1)*.6;
 const sigils=Math.ceil(1.4*(tier+3)*(2+Math.log2(1+wave/100))*(1+wave/MAX_WAVE));
 const early={
  1:['The First Victory',160,25,0,0],
  2:['First Spoils',190,0,22,0],
  3:['Threefold Courage',250,60,20,0],
  8:['Steady Hands',360,80,0,tier<=4?1:0],
  12:['The Rising Standard',440,100,35,0],
  25:['Fortress Sentinel',520,160,45,0],
  40:['Unbroken Resolve',650,190,55,0],
  60:['Veteran’s First Oath',820,220,70,tier<=4?1:0]
 };
 if(newBeginningMilestones.has(wave)){
  const [name,gold,essence,knowledge,points]=early[wave];
  return {icon:'✧',name,detail:fmt(Math.ceil(gold*scale))+' Gold'+(essence?' · '+fmt(Math.ceil(essence*scale))+' Essence':'')+(knowledge?' · '+fmt(Math.ceil(knowledge*scale))+' Knowledge':'')+(points?' · +'+points+' Skill Point':''),kind:'starter',gold:Math.ceil(gold*scale),essence:Math.ceil(essence*scale),knowledge:Math.ceil(knowledge*scale),points};
 }
 if(wave===5)return {icon:'🟡',name:'Spoils of the Vanguard',detail:fmt(300*scale)+' Gold',kind:'gold',amount:Math.round(300*scale)};
 if(wave===10)return {icon:'🔷',name:'Essence Cache',detail:fmt(120*scale)+' Hero Essence',kind:'essence',amount:Math.round(120*scale)};
 if(wave===15)return tier===1?{icon:'✦',name:'Legacy Training Unsealed',detail:'Unlock permanent Sigil-powered upgrades + 5 Sigils',kind:'legacy',amount:5}:{icon:'💠',name:'Primal Sigil Cache',detail:(tier+3)+' Primal Sigils',kind:'sigils',amount:tier+3};
 if(wave===20)return tier<=16?{icon:'⚔',name:'The Next Frontier',detail:'Unlock Tier '+roman(tier+1)+' + '+(2+tier)+' Sigils',kind:'tier',amount:2+tier}:{icon:'⚔',name:tier===MAX_TIER?'The Last Gate Opens':'Outer Gate Preparations',detail:(2+tier)+' Sigils · '+(tier===MAX_TIER?'The final tier awaits its conqueror':'Clear wave '+formatWave(tierAdvanceWave(tier))+' to unlock Tier '+roman(tier+1)),kind:'sigils',amount:2+tier};
 if(wave===35)return {icon:'◇',name:'Runic Expedition',detail:'A rare rune + '+fmt(350*scale)+' Gold',kind:'rune',amount:Math.round(350*scale)};
 if(wave===50)return {icon:'♛',name:'Banner of the Conqueror',detail:'A unique collectible and equippable banner',kind:'banner',amount:0};
 if(wave===75)return {icon:'💠',name:'Primal Treasury',detail:(6+tier*2)+' Sigils',kind:'sigils',amount:6+tier*2};
 if(wave===100)return decorateTierGate(tier,wave,{icon:'✦',name:trial?'The First Dominion Gate':'Century of Onslaught',detail:fmt(700*scale)+' Essence + '+(12+tier*3)+' Sigils',kind:'century',amount:Math.round(700*scale)});
 if(trial&&dominionCrestWaves.includes(wave)){
  const crestRank=dominionCrestWaves.indexOf(wave)+1;
  if(wave===MAX_WAVE)return {icon:'♛',name:trial.trial+' · Eternal Conquest',detail:fmt(sigils)+' Sigils · '+trial.crest+' Rank IV · Eternal Victory banner',kind:'eternal',amount:sigils,crestRank};
  return decorateTierGate(tier,wave,{icon:'♛',name:trial.crest+' · Seal '+crestRank,detail:fmt(sigils)+' Sigils · '+trial.crest+' grows to Rank '+crestRank+' (permanent '+trial.stat+' bonus)',kind:'dominion',amount:sigils,crestRank});
 }
 if(wave===MAX_WAVE)return {icon:'♛',name:'Eternal Conqueror',detail:fmt(sigils)+' Sigils + Eternal Victory banner',kind:'eternal',amount:sigils};
 const unlock=ascensionPaths.find(row=>row[5]===wave);
 if(unlock)return decorateTierGate(tier,wave,{icon:'✧',name:unlock[1]+' Discovery',detail:fmt(sigils)+' Sigils · Unlock '+unlock[1]+' in Power → Training'+(wave===1000?' · Ancient equipment can now drop':wave===2500?' · Celestial equipment can now drop':''),kind:'path',amount:sigils,unlock:unlock[0]});
 if(trial&&outerMilestones.has(wave)){
  const outerIndex=[125,225,375,625,875,1250,1750,3500,6500,8500,9500].indexOf(wave);
  const reward=Math.ceil(sigils*(1.15+outerIndex*.025));
  return {icon:['✦','◇','✧','❖'][outerIndex%4],name:trial.trial+' · Trial '+(outerIndex+1),detail:fmt(reward)+' Sigils · A unique conquest marker on the road to '+trial.crest,kind:'frontier',amount:reward};
 }
 const milestoneNames={250:'Warfront Waystone',500:'The Fifth Seal',750:'Veteran Vanguard',1500:'Ancestral Waystone',2000:'Siege of Ages',3000:'Chronicle of Valor',4000:'Echo of the Citadel',6000:'Fallen Kingdom',7500:'High Sovereignty',8000:'Eternal Waystone',9000:'Final Trial'};
 return {icon:'💠',name:milestoneNames[wave]||'Ascension Tribute',detail:fmt(sigils)+' Primal Sigils · One-time tier achievement'+(wave===6000?' · Eternal equipment can now drop':''),kind:'deepSigils',amount:sigils};
}
function milestoneKey(tier,wave){return tier+':'+wave;}
function nextMilestone(tier,wave){const list=tierMilestones(tier);return list.find(w=>w>=wave&&!p.milestones[milestoneKey(tier,w)])||list.find(w=>w>=wave)||null;}
// Never destroy an earned, one-time rune at the 240-rune pouch limit.
// Both milestone rewards and flawless Relic Hunts use this shared saved queue.
function storeEarnedRune(rune){
 if(!rune||typeof rune.id!=='string'||!rune.id||!runeNames[rune.type]||
  !Number.isInteger(Number(rune.tier))||Number(rune.tier)<1||Number(rune.tier)>12)return 'invalid';
 if(p.runes.some(existing=>existing&&existing.id===rune.id))return 'owned';
 if(p.pendingRelics.some(existing=>existing&&existing.id===rune.id))return 'reserved';
 if(p.runes.length>=240){p.pendingRelics.push(rune);return 'reserved';}
 p.runes.push(rune);
 return 'claimed';
}
function rewardMilestone(tier,wave){
 const key=milestoneKey(tier,wave);
 if(p.milestones[key]||!tierMilestones(tier).includes(wave))return false;
 const prize=tierMilestone(tier,wave);
 let runeReserved=false;
 p.milestones[key]=true;
 if(prize.kind==='starter'){p.gold+=prize.gold;p.essence+=prize.essence;p.knowledge+=prize.knowledge;p.points+=prize.points;}
 if(prize.kind==='gold')p.gold+=prize.amount;
 if(prize.kind==='essence')p.essence+=prize.amount;
 if(['sigils','deepSigils','path','eternal','frontier','dominion'].includes(prize.kind))p.sigils+=prize.amount;
 if(prize.kind==='legacy'){p.sigils+=prize.amount;p.legacyUnlocked=true;}
 if(prize.kind==='tier'){p.unlockedTier=Math.max(p.unlockedTier,Math.min(MAX_TIER,tier+1));p.sigils+=prize.amount;}
 if(prize.unlockNext)p.unlockedTier=Math.max(p.unlockedTier,Math.min(MAX_TIER,prize.unlockNext));
 if(prize.kind==='rune'){
  p.gold+=prize.amount;
  const rune={id:'milestone_'+key,type:['ember','storm','frost','fortune'][(tier-1)%4],tier:Math.min(12,2+Math.floor(tier/3))};
  runeReserved=storeEarnedRune(rune)==='reserved';
 }
 if(prize.kind==='banner'){const banner='Banner of '+tierNames[tier-1];if(!p.banners.includes(banner))p.banners.push(banner);}
 if(prize.kind==='eternal'){const banner='Eternal Victor of '+tierNames[tier-1];if(!p.banners.includes(banner))p.banners.push(banner);}
 if(prize.kind==='century'){p.essence+=prize.amount;p.sigils+=12+tier*3;}
 if(prize.crestRank){
  p.dominionCrests[tier]=Math.max(Number(p.dominionCrests[tier])||0,prize.crestRank);
  run.maxHealth=maxWall();run.health=Math.min(run.maxHealth,run.health+run.maxHealth*.05);
  notice(tierNames[tier-1].toUpperCase()+' · CREST RANK '+prize.crestRank);
 }
 notice('MILESTONE '+formatWave(wave)+' • '+prize.name.toUpperCase());
 message(runeReserved?'✦ WAVE '+formatWave(wave)+' · RUNE SAFELY RESERVED IN VAULT':'✦ WAVE '+formatWave(wave)+' MILESTONE UNLOCKED');
 save();return true;
}
let chosenTier=p.selectedTier;
function buildSiegeReport(reason){
 return {reason,tier:run.tier,startWave:run.startWave||1,lastWave:run.wave,
  cleared:run.wavesCleared||0,enemies:run.enemiesDefeated||0,
  bossBreaks:run.totalBossBreaks||0,specialistBreaks:run.totalSpecialistBreaks||0,
  bosses:run.bossVictories||0,bossEscapes:run.bossEscapes||0,breaches:run.totalBreaches||0,
  sabotage:run.sapperBlasts||0,doctrineCasts:run.doctrineCasts||0};
}
function finishSiege(reason){
 lastSiegeReport=buildSiegeReport(reason);
 return lastSiegeReport;
}
function renderSiegeReport(){
 const report=$('siegeReport');
 if(!report)return;
 report.hidden=!lastSiegeReport;
 if(!lastSiegeReport)return;
 const data=lastSiegeReport;
 const outcome={fallen:'FORTRESS FALLEN',retreated:'HONORABLE RETREAT',victory:'ETERNAL VICTORY'}[data.reason]||'SIEGE ENDED';
 $('siegeReportTitle').textContent='✦ SIEGE CHRONICLE · '+outcome+' · TIER '+roman(data.tier);
 $('siegeReportSummary').textContent=formatWave(data.cleared)+' WAVES · '+formatWave(data.enemies)+' FOES · '+formatWave(data.breaches)+' BREACHES';
 const metrics=[
  ['WAVES CLEARED',data.cleared],
  ['ENEMIES DEFEATED',data.enemies],
  ['BOSS CASTS BROKEN',data.bossBreaks],
  ['SPECIALISTS STOPPED',data.specialistBreaks],
  ['BOSSES DEFEATED',data.bosses],
  ['BOSSES BREACHED',data.bossEscapes],
  ['TOTAL BREACHES',data.breaches]
 ];
 $('siegeReportMetrics').innerHTML=metrics.map(([name,value])=>
  `<div class="siege-report-stat"><small>${name}</small><strong>${formatWave(value)}</strong></div>`).join('');
 $('siegeReportRange').textContent='TIER '+roman(data.tier)+' · STARTED WAVE '+formatWave(data.startWave)+' · LAST REACHED '+formatWave(data.lastWave)+
  (data.sabotage?' · '+formatWave(data.sabotage)+' SAPPER BLAST'+(data.sabotage===1?'':'S'):'')+
  ' · '+formatWave(data.doctrineCasts||0)+' HERO AUTO-CASTS';
}
function showLobby(summary=''){
 // The tier lobby belongs to Battle, not the progression chambers.
 $('app').dataset.view=tab==='battle'?'battle':'menu';
 $('tierLobby').hidden=tab!=='battle';$('lobbySummary').textContent=summary;
 $('exitRunButton').hidden=true;$('startButton').hidden=true;renderTierLobby();renderSiegeReport();
}
// One-time First Watch equipment must not be discarded when the 200-item bag is full.
function storeEarnedGear(item){
 if(!item||typeof item.id!=='string'||!item.id||!gearNames[item.slot==='ring'?'ring':item.slot]||
  !Number.isInteger(Number(item.rarity))||Number(item.rarity)<0||Number(item.rarity)>8)return 'invalid';
 if(p.inventory.some(g=>g&&g.id===item.id))return 'owned';
 if(p.pendingGear.some(g=>g&&g.id===item.id))return 'reserved';
 if(p.inventory.length>=inventoryCap){p.pendingGear.push(item);return 'reserved';}
 p.inventory.push(item);return 'claimed';
}
function claimPendingGear(){
 let claimed=0;
 while(p.pendingGear.length&&p.inventory.length<inventoryCap){
  const item=p.pendingGear.shift();
  if(item&&gearNames[item.slot==='ring'?'ring':item.slot]&&Number.isInteger(Number(item.rarity))&&
     Number(item.rarity)>=0&&Number(item.rarity)<=8&&typeof item.id==='string'&&
     !p.inventory.some(g=>g&&g.id===item.id)){p.inventory.push(item);claimed++;}
 }
 return claimed;
}
function awardFirstWatch(){
 if(!Array.isArray(p.firstWatchClaimed))p.firstWatchClaimed=[];
 for(let i=0;i<earlyWatchChapters.length;i++){
  if(p.firstWatchClaimed.includes(i))continue;
  const [atMinutes,name,gold,essence,points,sigils]=earlyWatchChapters[i];
  if(p.battleSeconds<atMinutes*60||p.uniqueClears<Math.ceil(atMinutes*1.5))break;
  p.firstWatchClaimed.push(i);
  p.gold+=gold;p.essence+=essence;p.points+=points;p.sigils+=sigils;
  if(i===2||i===6||i===10||i===15){
   const reward=randomGear(i===15?4:i>=6?3:2);
    reward.id='first_watch_gear_'+i;
    storeEarnedGear(reward);
  }
  if(i===4||i===9){
   storeEarnedRune({type:i===4?'frost':'storm',tier:i===4?2:3,id:'first_watch_'+i});
  }
  if(i===1||i===7||i===15){
   const banner=i===1?'Dawn Scout Standard':i===7?'Banner of the Vanguard':'Standard of the First Watch';
   if(!p.banners.includes(banner))p.banners.push(banner);
  }
  notice('FIRST WATCH · '+name.toUpperCase());
  message('✦ FIRST WATCH CHAPTER '+(i+1)+' UNLOCKED');
 }
}
function renderFirstWatch(){
 const claimed=Array.isArray(p.firstWatchClaimed)?p.firstWatchClaimed:[];
 const i=earlyWatchChapters.findIndex((row,n)=>!claimed.includes(n));
 const total=earlyWatchChapters.length;
 if(i<0)return '<section class="watch-ribbon watch-complete"><div><small>✦ THE FIRST WATCH</small><strong>FIRST WATCH COMPLETE</strong><p>All '+total+' opening chapters completed. The true Long Conquest begins.</p></div><span>✓ '+total+'/'+total+'</span></section>';
 const [atMinutes,name,gold,essence,points,sigils]=earlyWatchChapters[i];
 const timePct=Math.min(100,p.battleSeconds/(atMinutes*60)*100);
 const clearsPct=Math.min(100,p.uniqueClears/(Math.ceil(atMinutes*1.5))*100);
 const progress=Math.min(timePct,clearsPct);
 return '<section class="watch-ribbon" aria-label="First Watch onboarding progress"><div><small>✦ THE FIRST WATCH · CHAPTER '+(i+1)+' / '+total+'</small><strong>'+name+'</strong><p>Earn '+fmt(gold)+' Gold, '+fmt(essence)+' Essence'+(points?' and '+points+' skill point'+(points>1?'s':''):'')+(sigils?' · '+sigils+' Sigils':'')+'. Battle victories and active play both advance your first 12.5 hours.</p><div class="watch-track"><i style="width:'+progress+'%"></i></div><small>'+Math.floor(p.battleSeconds/60)+' / '+atMinutes+' active minutes · '+fmt(p.uniqueClears)+' / '+fmt(Math.ceil(atMinutes*1.5))+' new wave victories</small></div><span>'+claimed.length+'/'+total+'</span></section>';
}
function renderDominionPreview(tier){
 const trial=dominionTrial(tier);
 if(!trial)return '';
 const rank=Math.min(4,Number(p.dominionCrests[tier])||0);
 const next=dominionCrestWaves[rank]||null;
 const label={damage:'hero damage',essence:'wave Essence',boss:'boss damage',wall:'wall health',knowledge:'wave Knowledge',critical:'crit damage',healing:'wall regeneration',runes:'rune effects',armor:'armor penetration',stations:'station damage',gold:'Gold income',xp:'XP income',all:'general combat'}[trial.stat]||trial.stat;
 return '<section class="dominion-preview" aria-label="Tier '+roman(tier)+' Dominion Trial"><div><small>♛ OUTER DOMINION · '+trial.trait.toUpperCase()+' HOST</small><strong>'+trial.trial+'</strong><p>'+trial.crest+' · +'+(trial.bonus*100).toFixed(1)+'% '+label+' per seal. Permanent across all tiers.</p></div><span>RANK '+rank+' / 4<br><small>'+(next?'NEXT SEAL '+formatWave(next):'COMPLETE')+'</small></span></section>';
}

function renderEncounterIntel(tier){
 const startWave=useWaystone?waystoneForTier(tier):1;
 const focus=encounterDirector(startWave,tier);
 let upcoming=null;
 for(let w=startWave;w<=Math.min(MAX_WAVE,startWave+100);w++){
  const event=encounterDirector(w,tier);
  if(['chapterBoss','commander','treasure','relic','bannerAssault','arcane','ambush','elite','vanguard'].includes(event.kind)){upcoming=event;break;}
 }
 const roleNames={goblin:'goblins',skeleton:'skeletons',warg:'wargs',raider:'rush raiders',guardian:'shield guards',shaman:'ritual shamans',frostbinder:'frost binders (slow attacks)',sapper:'fuse sappers (interruptible)',banneret:'standard bearers (rally troops)',thornweaver:'thornweavers (temporary ward)',riftstalker:'riftstalkers (telegraphed blink)'};
 const roles=[...new Set(focus.units.map(n=>roleNames[n]||n))].join(' · ');
 return `<section class="encounter-intel" aria-label="Upcoming enemy intelligence">
  <div><small>⚔ SIEGE INTELLIGENCE · CHAPTER ${roman(focus.chapter)}</small>
   <strong>${focus.faction}</strong><p>${roles}</p><p class="encounter-intel-objective">${upcoming&&upcoming.kind==='chapterBoss'?'✦ FLAWLESS CHAPTER BONUS · ZERO BREACHES':upcoming.kind==='relic'?'✦ RELIC HUNT · DEFEND WITHOUT BREACHES':upcoming.kind==='bannerAssault'?'✦ STANDARD ASSAULT · BREAK THE BANNERS FOR BONUS GOLD':upcoming.kind==='arcane'?'✦ ARCANE CONVERGENCE · +18% WAVE KNOWLEDGE':'Shield guards, casters and siege weapons have counterplay.'}</p>
  </div><span>${upcoming?'NEXT '+upcoming.label+'<b>WAVE '+formatWave(upcoming.wave)+'</b>':'FINAL CHAPTER'} </span>
 </section>`;
}
// An expandable field manual. No extra mobile tab, storage or ongoing combat work.
function renderSiegeCodex(){
 const counterplay={
 mire:'Rushers and wargs · kill the fastest flank first.',
 iron:'Shield guards protect nearby infantry · break their protection.',
 ash:'Shamans mend wounded troops · eliminate healers first.',
 night:'Rush formations · the hero prioritizes incoming movement threats.',
 crown:'Mixed shields and ritualists · separate key support units.',
 frostvein:'Frostbinders announce slowing rites · stop the cast.',
 cinder:'Fuse sappers threaten the wall · interrupt the countdown.',
 gilded:'Bannerets accelerate nearby allies · destroy the standard.',
 thorn:'Thornweavers briefly ward allies · interrupt the green circle.',
 rift:'Riftstalkers telegraph a short blink · target the purple portal.'
 };
 const cards=encounterFactions.map((f,i)=>`<article class="codex-faction"><div class="codex-faction-title"><span style="background:${f.color}"></span><strong>${f.name}</strong></div><small>FACTION ${roman(i+1)}</small><p>${counterplay[f.id]}</p></article>`).join('');
 return `<details class="siege-codex" aria-label="Field manual and faction tactics">
  <summary>✦ FIELD MANUAL <span>10 FACTIONS · BOSS TACTICS · SPECIAL WAVES</span></summary>
  <div class="codex-body">
    <p>Every 100 waves begins a new chapter. Factions rotate between tiers and chapters. Watch the arrival patterns: ambushes split to the flanks, shield guards protect standards and relics, spellcasters hold rear lanes, and chapter bosses gather reinforcements from the wings. Live warning text identifies a dangerous cast as it happens. Focused damage during a Sapper fuse, Frost or Thorn spell, or Riftstalker blink can interrupt it without requiring a kill. The gold line above a casting enemy shows disruption progress. The hero targets support units automatically; your build determines whether the defense holds.</p>
    <div class="codex-factions">${cards}</div>
    <div class="codex-events">
      <p><strong>Hero Combat Doctrines:</strong> Visit Hero → Battle Doctrines to select Hunter's Volley (level 1), Arcane Chain (level 3) or Aegis Pulse (level 5). Each ability auto-casts during an active fight when it has eligible targets. Marksman talents boost Volley; Arcane Chain now pierces 35% of enemy armor, while Spark talents and Storm runes increase its damage. Station damage crests only strengthen actual fortress station attacks, not hero magic. Stone/Bulwark talents improve Aegis. Switching is free, but cannot reset a live cooldown.</p>
      <p><strong>Century Boss:</strong> Iron Tyrant → Cinder Regent → Void Monarch. Breaking a warned charge or warp, or shattering an Iron Ward, briefly exposes the boss to +12% damage. The auto-hero focuses an active Iron Ward; the boss timer also shows the real percentage of damage needed to break an attack or ward. Siege Beast crusher windups can be interrupted too. After the siege, the Chronicle credits only bosses actually defeated; a boss that reaches the wall is reported separately as a breach.</p>
      <p><strong>Relic Hunt:</strong> Protect the wall without a breach to earn one non-farmable rune and bonus Knowledge.</p>
      <p><strong>Standard Assault:</strong> Break support banners for +20% wave Gold.</p>
      <p><strong>Arcane Convergence:</strong> Caster-focused formations offer +18% wave Knowledge; at most three enemy casters may be active at once.</p>
      <p><strong>Treasure Raid:</strong> +35% wave Gold and an extra loot roll.</p>
    </div>
  </div>
 </details>`;
}
function renderTierLobby(){
 chosenTier=clamp(chosenTier,1,MAX_TIER);
 const tierHint=$('tierUnlockHint');if(tierHint){const gate=tierAdvanceWave(chosenTier);tierHint.textContent=gate?'Clear wave '+formatWave(gate)+' to unlock the next tier':'Final tier · conquer wave 10,000';}
 $('tierGrid').innerHTML=tierNames.map((name,i)=>{
  const tier=i+1,locked=tier>p.unlockedTier,best=Math.min(MAX_WAVE,p.bestByTier[tier]||0),conquered=best>=MAX_WAVE;
  return `<button data-tier="${tier}" ${locked?'disabled':''} class="tier-choice ${chosenTier===tier?'selected':''} ${locked?'locked':''} ${conquered?'tier-conquered':''}" aria-pressed="${chosenTier===tier}">
   <span class="tier-choice-number">${locked?'🔒':conquered?'♛':'✦'} TIER ${roman(tier)}</span><strong>${name}</strong>
   <small>${locked?'Clear wave '+formatWave(tierAdvanceWave(tier-1))+' of Tier '+roman(tier-1):conquered?'ETERNALLY CONQUERED':`BEST ${formatWave(best)} / ${formatWave(MAX_WAVE)}`}</small>
   <span class="tier-progress-track"><span style="width:${100*best/MAX_WAVE}%"></span></span>
  </button>`;
 }).join('');
 const tier=chosenTier,best=Math.min(MAX_WAVE,p.bestByTier[tier]||0),stone=waystoneForTier(tier);
 $('tierHeading').textContent='TIER '+roman(tier)+' — '+tierNames[tier-1].toUpperCase();
 $('tierDescription').textContent=`Enemy strength ×${tierThreat(tier).toFixed(2)} · Gold & XP ×${(1+(tier-1)*.32).toFixed(2)} · Record ${formatWave(best)} / ${formatWave(MAX_WAVE)} · ${best>=MAX_WAVE?'ETERNALLY CONQUERED':'Continue your legacy'}`;
 const waystone=stone>1?`<div class="milestone-waystone" role="group" aria-label="Siege starting checkpoint"><div><strong>✦ UNLOCKED WAYSTONE · WAVE ${formatWave(stone)}</strong><small>Resume an earlier tier without replaying its first ${formatWave(stone-1)} waves. Milestone rewards are earned once per tier.</small></div>
  <div class="milestone-waystone-choices">
   <button type="button" data-start-mode="fresh" ${useWaystone?'':'aria-pressed="true"'} class="${useWaystone?'':'selected'}">WAVE 1</button>
   <button type="button" data-start-mode="waystone" ${useWaystone?'aria-pressed="true"':''} class="${useWaystone?'selected':''}">WAYSTONE ${formatWave(stone)}</button>
  </div></div>`:`<div class="milestone-waystone milestone-waystone-empty"><strong>✧ YOUR FIRST WAYSTONE AWAITS AT WAVE 100</strong><small>Push deeper to permanently unlock restart checkpoints and more powerful Ascension routes.</small></div>`;
 let claimedCount=0;
 const tierLadder=tierMilestones(tier);
 const rewards=tierLadder.map(w=>{
  const prize=tierMilestone(tier,w),claimed=!!p.milestones[milestoneKey(tier,w)];
  const reservedRune=claimed&&prize.kind==='rune'&&p.pendingRelics.some(r=>r&&r.id==='milestone_'+milestoneKey(tier,w));
  if(claimed)claimedCount++;
  const reached=best>=w;
  return `<div class="milestone-entry ${claimed?'claimed':''} ${w>100?'milestone-deep':''} ${prize.kind==='path'?'milestone-path':''} ${prize.unlockNext?'milestone-gate':''} ${prize.kind==='dominion'?'milestone-dominion':''} ${outerMilestones.has(w)?'milestone-new':''} ${newBeginningMilestones.has(w)?'milestone-first':''} ${w===MAX_WAVE?'milestone-final':''}">
    <div class="milestone-medal">${claimed?'✓':prize.icon}</div>
    <div class="milestone-copy"><strong>Wave ${formatWave(w)} · ${prize.name}</strong><small>${prize.detail}</small></div>
    <span class="milestone-status">${reservedRune?'IN RUNE VAULT':claimed?'CLAIMED':reached?'AVAILABLE NEXT RUN':'TARGET'}</span>
   </div>`;
 }).join('');
 const gearNotice=p.pendingGear.length?`<div class="rune-vault-notice" role="status"><strong>⚒ ${p.pendingGear.length} EARNED EQUIPMENT REWARD${p.pendingGear.length===1?'':'S'} RESERVED</strong><small>Your equipment bag was full when First Watch granted gear. Go to <b>Gear → Equipment</b>, free a slot, and claim the saved items.</small></div>`:'';
 const vaultNotice=p.pendingRelics.length?`<div class="rune-vault-notice" role="status"><strong>✦ ${p.pendingRelics.length} EARNED RUNE${p.pendingRelics.length===1?'':'S'} RESERVED</strong><small>Your rune pouch was full. Nothing was lost. Go to <b>Gear → Rune Workshop</b>, free a rune slot, then claim your reward.</small></div>`:'';
 $('milestoneList').innerHTML=renderWarCouncil(tier,useWaystone?stone:1)+renderCombatLoadouts(true)+gearNotice+vaultNotice+renderFirstWatch()+renderEncounterIntel(tier)+renderSiegeCodex()+renderDominionPreview(tier)+waystone+`<div class="milestone-ladder-heading"><span>✧ THE 10,000-WAVE CHRONICLE</span><small>${claimedCount} / ${tierLadder.length} CLAIMED</small></div>`+rewards;
 $('launchTierButton').disabled=tier>p.unlockedTier;
 $('launchTierButton').textContent='⚔ START TIER '+roman(tier)+' · WAVE '+formatWave(useWaystone?stone:1)+' / '+formatWave(MAX_WAVE);
 $('bannerBadge').textContent='♛ '+p.activeBanner;
}
function enterSiege(){
 if(chosenTier>p.unlockedTier)return;
 p.selectedTier=chosenTier;initRun();lastSiegeReport=null;renderSiegeReport();
 run.speed=storedSpeed===2?2:1;syncBattleControls();
 run.wave=useWaystone?waystoneForTier(chosenTier):1;run.tier=chosenTier;run.startWave=run.wave;
 $('tierLobby').hidden=true;$('exitRunButton').hidden=false;$('startButton').hidden=true;
 save();beginWave();
}
function retreatFromSiege(){
 const report=finishSiege('retreated');
 const summary=`Tier ${roman(run.tier)} · Reached wave ${run.wave} · Cleared ${report.cleared} this run`;
 run.phase='ready';run.enemies=[];run.shots=[];save();showLobby(summary);refreshHUD();
}
function legacyCost(row){return Math.ceil(row[3]*(1+lr(row[0])*.35+Math.pow(lr(row[0]),1.35)*.26));}
const lvlNeed=()=>Math.floor(65*Math.pow(p.level,1.34));const n=(obj,key)=>obj[key]||0;const skill=id=>n(p.skills,id);const station=id=>n(p.stations,id);const t=id=>n(p.training,id);const res=id=>n(p.research,id);const sup=id=>n(p.suppression,id);
function xpAdd(amount){p.xp+=Math.floor(amount*(1+t('xp')*.025+skill('wisdom')*.07)*(1+Math.min(16,res('almanac'))*.015)*(1+dominionBonus('xp')));while(p.xp>=lvlNeed()){p.xp-=lvlNeed();p.level++;p.points+=2;notice('LEVEL UP! +2 SKILL POINTS');}}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(p));return true;}catch{return false;}}
function notice(s){let el=$('toast');el.textContent=s;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2300)}
function message(s){$('combatMessage').textContent=s;$('combatMessage').classList.add('show');setTimeout(()=>$('combatMessage').classList.remove('show'),1600)}
function gearStat(slot){
 const score=k=>{const g=p.inventory.find(g=>g.id===p.equipped[k]);return g?(1+g.rarity*.6)*(1+g.plus*.24)-1:0};
 if(slot==='weapon')return 1+score('amulet')+.16*(score('gauntlets')+ringSlots.reduce((n,k)=>n+score(k),0));
 if(slot==='armor')return 1+score('chest')+.14*(score('helm')+score('legs')+score('boots'));
 if(slot==='charm')return 1+score('charm');
 return 1+score(slot);
}
function socketValue(type){let total=0;for(let id of Object.values(p.socketed)){let x=p.runes.find(r=>r.id===id);if(x&&x.type===type)total+=Math.pow(1.38,x.tier-1)*.015;}return total*(1+Math.min(12,res('attunement'))*.02)*(1+dominionBonus('runes'));}
function maxWall(){return Math.floor((145+12*t('fort'))*(1+skill('stone')*.08+skill('bulwark')*.15)*(1+gearStat('armor')*.06)*(1+lr('guardianOath')*.03)*(1+Math.min(16,res('masonry'))*.015)*(1+ascRank('bastion')*.07)*(1+dominionBonus('wall')+dominionSeals()*.01)*(1+oathRank('sovereignAegis')*.015));}
function damage(){return (32+2*t('power')+p.level*.85)*(1+skill('aim')*.06)*(1+(gearStat('weapon')-1)*.22)*(1+Math.min(15,res('calibration'))*.01)*(1+ascRank('vanguard')*.06)*(1+ascRank('epoch')*.015*Math.sqrt(Math.max(1,run.wave)/100))*(1+dominionBonus('damage')+dominionResonance())*(1+oathRank('sovereignBlade')*.015);}
function attackInterval(){return Math.max(.22,.82/(1+Math.min(3,t('haste')*.025)+skill('quiver')*.05+(run.health<run.maxHealth*.3?skill('laststand')*.12:0)))*(run.heroChill>0?1.18:1);}
function trainCost(row){let [id,, ,base,mul]=row;let lv=t(id);return Math.floor(base*(1+lv*.075+lv*lv*.004)*Math.pow(1+(mul-1)*.07,Math.min(lv,120))*Math.pow(1.002,Math.max(0,lv-120))); }
function stationCost(row){let[id,,,,base,mul]=row;let lv=station(id);return Math.floor(base*(1+lv*.2+lv*lv*.04)*Math.pow(1.04,Math.min(lv,40))*Math.pow(1.015,Math.max(0,lv-40))*(1-Math.min(.42,res('discount')*.014))); }
function researchCost(row,obj){let[id,,,base,mul]=row;let lv=n(obj,id);return Math.floor(base*(1+lv*.5+lv*lv*.15)*Math.pow(1.06+(mul-1)*.04,lv)); }
function gearCost(g){return Math.floor((70+g.plus*38)*(1+g.rarity*.8)*Math.pow(1.22,g.plus)*(1-Math.min(.42,res('discount')*.014+skill('salvage')*.02)));}
function randomGear(forceRarity=null){
 const score=Math.random()+Math.min(.44,p.highestWave*.004)+res('excavation')*.007;
 let r=score>.995?5:score>.95?4:score>.85?3:score>.68?2:score>.43?1:0;
 const depth=Math.max(0,...Object.values(p.bestByTier||{}));
 if(depth>=6000&&Math.random()<.0025)r=8;
 else if(depth>=2500&&Math.random()<.009)r=Math.max(r,7);
 else if(depth>=1000&&Math.random()<.025)r=Math.max(r,6);
 if(forceRarity!==null)r=forceRarity;
 r=clamp(r,0,8);
 return {id:'item_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),slot:['helm','amulet','chest','legs','boots','gauntlets','charm','ring'][Math.floor(Math.random()*8)],rarity:r,plus:0};
}
function grantDrops(){let prob=.23+t('loot')*.002+skill('scavenger')*.025+res('excavation')*.015;if(Math.random()<prob&&p.inventory.length<inventoryCap){let g=randomGear();p.inventory.push(g);notice('FOUND '+rarities[g.rarity].toUpperCase()+' EQUIPMENT');}if(p.runes.length<240&&Math.random()<.32+res('excavation')*.013){let types=Object.keys(runeNames),kind=types[Math.floor(Math.random()*types.length)];p.runes.push({type:kind,tier:1,id:'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)});}}
function initRun(){run.wave=1;run.tier=chosenTier;run.maxHealth=maxWall();run.health=run.maxHealth;run.phase='ready';run.enemies=[];run.shots=[];run.particles=[];run.floats=[];run.spawned=0;run.total=0;run.kills=0;run.breaches=0;run.time=0;run.shotClock=0;run.stationClock=0;run.rewardTimer=0;run.heroChill=0;run.encounter=null;run.reinforcementPhase=false;run.bossCounters=0;
 run.startWave=1;run.wavesCleared=0;run.enemiesDefeated=0;run.totalBossBreaks=0;
 run.totalSpecialistBreaks=0;run.totalBreaches=0;run.bossVictories=0;run.bossEscapes=0;run.bossesKilledThisWave=0;run.sapperBlasts=0;run.doctrineClock=3.5;run.doctrineCasts=0;
}
function beginWave(){if(run.phase==='fighting'||run.phase==='fallen'||run.phase==='completed'||run.wave>MAX_WAVE)return;run.maxHealth=maxWall();run.health=clamp(run.health,0,run.maxHealth);run.phase='fighting';run.spawned=0;run.kills=0;run.breaches=0;run.enemies=[];run.shots=[];run.spawnClock=.35;run.heroChill=0;run.encounter=encounterDirector(run.wave,run.tier);run.bossesKilledThisWave=0;run.total=Math.min(run.encounter.kind==='chapterBoss'?22:24,waveEnemyCount(run.wave));run.reinforcementPhase=false;run.bossCounters=0;message(run.encounter.label+' · '+run.encounter.faction.toUpperCase());refreshHUD();}
function spawnEnemy(){
 const encounter=run.encounter&&run.encounter.wave===run.wave?run.encounter:encounterDirector(run.wave,run.tier);
 const isBoss=!!encounter.bossType&&run.wave%5===0&&!run.reinforcementPhase&&run.spawned===run.total-1;
 const relicGuardian=encounter.kind==='relic'&&run.spawned===run.total-1;
 let type=isBoss?encounter.bossType:relicGuardian?'guardian':run.reinforcementPhase&&run.spawned>=run.total-2?({iron:'guardian',ember:'raider',rift:'warg'}[encounter.bossStyle]):encounterUnit(encounter,run.spawned);
 type=allowedSpecialist(type,run.enemies);
 const trial=dominionTrial(run.tier),trait=trial?.trait||'';
 const mul=waveThreat(run.wave)*tierThreat(run.tier)*outerDepthPressure(run.tier,run.wave)*(trait==='armored'?1.15:1)*(trait==='elite'&&isBoss?1.3:1);
 const baseHp={goblin:36,skeleton:42,warg:58,imp:28,ogre:300,raider:39,guardian:82,shaman:52,siegebeast:390,warlord:445,frostbinder:49,sapper:46,banneret:73,thornweaver:56,riftstalker:45};
 const baseSpeed={goblin:17,skeleton:17,warg:25,imp:22,ogre:7,raider:33,guardian:12,shaman:14,siegebeast:7,warlord:9,frostbinder:13,sapper:24,banneret:15,thornweaver:13,riftstalker:20};
 const baseArmor={skeleton:2,ogre:7,guardian:13,siegebeast:11,warlord:14,banneret:7,sapper:2,thornweaver:3,riftstalker:4};
 const placement=formationPosition(encounter,run.spawned,type,isBoss,relicGuardian,run.reinforcementPhase&&run.spawned>=run.total-2);
 const e={type,isBoss,relicGuardian,x:placement.x,y:placement.y,
  hp:Math.max(1,(baseHp[type]||36)*mul*(relicGuardian?1.75:1)*(1-Math.min(.35,sup('health')*.005))),
  max:0,
  speed:(baseSpeed[type]||17)*(relicGuardian?.88:1)*enemySpeedFactor(run.wave)*(1+(run.tier-1)*.06)*(trait==='swift'?1.12:1)*(1-Math.min(.35,sup('speed')*.005)),
  armor:((baseArmor[type]||0)+(relicGuardian?3:0)+waveArmor(run.wave,run.tier))*Math.sqrt(outerDepthPressure(run.tier,run.wave))*(trait==='armored'?1.18:1)*(1-Math.min(.5,sup('armor')*.01)),
  buildup:0,burn:0,slow:0,wobble:rnd(0,6.28),
  dashClock:type==='raider'?rnd(1.2,3.0):0,dashTime:0,ritualClock:type==='shaman'?rnd(3.2,5.5):0,bossPhase:1,frostCastClock:type==='frostbinder'?rnd(3.4,4.6):0,frostWindup:0,fuseTime:0,fuseSpent:false,bannerGlow:0,crushStarted:false,crushWindup:0,crushSurge:0,thornCastClock:type==='thornweaver'?rnd(3.1,4.5):0,thornWindup:0,thornWardTimer:0,blinkStarted:false,blinkWindup:0,spellBreakDamage:0,bossStyle:isBoss&&type==='warlord'?encounter.bossStyle:null,bossWardTimer:0,bossFuryClock:3.8,bossFuryWindup:0,bossFurySurge:0,bossBlinkStarted:false,bossBlinkWindup:0,bossBlinkCooldown:0,bossCastDamage:0,bossWardDamage:0,bossExposedTimer:0,
  golden:encounter.kind==='treasure'||Math.random()<.02+station('midas')*.012,
  dead:false,valued:isBoss?65:relicGuardian?25:type==='guardian'?17:type==='shaman'||type==='frostbinder'?16:type==='banneret'||type==='thornweaver'?17:type==='riftstalker'?16:type==='sapper'?14:type==='raider'?13:Math.round(type==='warg'?12:10)};
 e.max=e.hp;
 run.enemies.push(e);if(relicGuardian)float(e.x,e.y-22,'RELIC WARDEN','#ffe4a3');
}
function effect(x,y,color,count=8){const available=Math.max(0,140-run.particles.length);for(let i=0;i<Math.min(count,available);i++)run.particles.push({x,y,vx:rnd(-70,70),vy:rnd(-78,35),life:rnd(.25,.7),max:.7,color,size:rnd(2,5)});}
function float(x,y,text,color='#ffe9b2'){if(run.floats.length>=28)run.floats.shift();run.floats.push({x,y,text,color,life:1.25});}
// Boss defenses and attacks have short, build-sensitive counterplay windows.
function bossCounterplay(e,dealt){
 if(!e||e.dead||e.hp<=0||!Number.isFinite(e.max)||e.max<=0)return false;
 let interrupted='';
 if(e.type==='warlord'&&e.bossWardTimer>0){
  e.bossWardDamage=(e.bossWardDamage||0)+dealt;
  if(e.bossWardDamage>=e.max*.10){
   e.bossWardTimer=0;e.bossWardDamage=0;interrupted='IRON WARD SHATTERED';
  }
 }else if((e.type==='warlord'&&e.bossFuryWindup>0)||(e.type==='warlord'&&e.bossBlinkWindup>0)||(e.type==='siegebeast'&&e.crushWindup>0)){
  e.bossCastDamage=(e.bossCastDamage||0)+dealt;
  if(e.bossCastDamage>=e.max*.09){
   if(e.type==='siegebeast'){e.crushWindup=0;e.crushSurge=0;interrupted='CRUSHER INTERRUPTED';}
   else if(e.bossFuryWindup>0){e.bossFuryWindup=0;e.bossFurySurge=0;e.bossFuryClock=4.5;interrupted='EMBER CHARGE BROKEN';}
   else{e.bossBlinkWindup=0;e.bossBlinkCooldown=5.5;interrupted='VOID STEP DISRUPTED';}
  }
 }
 if(!interrupted)return false;
 e.bossCastDamage=0;e.bossExposedTimer=1.3;
 run.bossCounters=(run.bossCounters||0)+1;run.totalBossBreaks=(run.totalBossBreaks||0)+1;
 float(e.x,e.y-38,interrupted,'#fff0a9');
 effect(e.x,e.y-15,'#f5d98e',9);
 return true;
}
// The live combat field manual promises interruptible casts. Focused damage during
// a telegraphed ability can break it without requiring a complete enemy kill.
// Bosses have separate (stronger) thresholds and are handled independently.
function specialistCast(e){
 if(!e||e.dead)return null;
 if(e.type==='sapper'&&e.fuseTime>0)return 'fuse';
 if(e.type==='frostbinder'&&e.frostWindup>0)return 'frost';
 if(e.type==='thornweaver'&&e.thornWindup>0)return 'thorn';
 if(e.type==='riftstalker'&&e.blinkWindup>0)return 'rift';
 return null;
}
function specialistCounterplay(e,dealt){
 const cast=specialistCast(e);
 if(!cast||!Number.isFinite(e.max)||e.max<=0||!Number.isFinite(dealt)||dealt<=0||e.hp<=0)return false;
 e.spellBreakDamage=(e.spellBreakDamage||0)+dealt;
 const threshold=e.max*(cast==='rift'?.22:.18);
 if(e.spellBreakDamage<threshold)return false;
 e.spellBreakDamage=0;
 let label='';
 if(cast==='fuse'){e.fuseTime=0;e.fuseSpent=true;label='FUSE DISARMED';}
 else if(cast==='frost'){e.frostWindup=0;e.frostCastClock=5.4;label='FROST RITE BROKEN';}
 else if(cast==='thorn'){e.thornWindup=0;e.thornCastClock=5.3;label='THORN WARD BROKEN';}
 else{e.blinkWindup=0;e.blinkStarted=true;label='RIFT DISRUPTED';}
 run.totalSpecialistBreaks=(run.totalSpecialistBreaks||0)+1;
 float(e.x,e.y-28,label,'#ffe1a3');
 effect(e.x,e.y-11,'#f6d699',7);
 return true;
}
function hurt(e,raw,kind='arrow'){if(e.dead)return;let armorIgnored=Math.min(.9,t('pierce')*.001+skill('penetrate')*.04+ascRank('sunder')*.025+dominionBonus('armor')+(kind==='arcane'?.35:0));let siegeOath=(isSiegeBoss(e)||kind==='ballista'||kind==='lightning')?1+oathRank('sovereignJudgment')*.02:1;let dealt=Math.max(1,raw*siegeOath*(isSiegeBoss(e)?(1+lr('siegebreaker')*.06)*(1+dominionBonus('boss')):1)*(kind==='ballista'||kind==='lightning'?1+dominionBonus('stations'):1)-e.armor*(1-armorIgnored));dealt*=shieldAuraReduction(e,run.enemies)*thornWardReduction(e,run.enemies)*(e.type==='warlord'&&e.bossWardTimer>0?.78:1)*(e.bossExposedTimer>0?1.12:1);
 if(p.combatPassive==='hunter'&&kind==='arrow'&&(isSiegeBoss(e)||['sapper','frostbinder','thornweaver','riftstalker','shaman','banneret'].includes(e.type)))dealt*=1.08;
 if(p.combatPassive==='conductor'&&(kind==='lightning'||kind==='arcane'))dealt*=1.10;
 if(p.combatPassive==='conductor'&&(kind==='lightning'||kind==='arcane')&&!e.dead)e.slow=Math.max(e.slow||0,.45);
 if(kind==='arrow'&&Math.random()<(.06+t('crit')*.002)){dealt*=(1.7+t('critDmg')*.025+skill('focus')*.2)*(1+dominionBonus('critical'));float(e.x,e.y-22,'CRIT '+Math.floor(dealt),'#ffe18a')}else if(Math.random()<.18)float(e.x,e.y-18,Math.floor(dealt),'#fff0d5');e.hp-=dealt;e.buildup=.15;bossCounterplay(e,dealt);specialistCounterplay(e,dealt);
 if(e.type==='warlord'&&e.bossPhase===1&&e.hp>0&&e.hp<=e.max*.55){
  e.bossPhase=2;e.speed*=1.14;
  if(e.bossStyle==='iron'){e.bossWardTimer=2.2;e.bossWardDamage=0;}
  if(e.bossStyle==='ember')e.bossFuryClock=.85;
  if(e.bossStyle==='rift'){e.bossBlinkWindup=1.05;e.bossCastDamage=0;}
  if(run.encounter?.kind==='chapterBoss'&&!run.reinforcementPhase){
   run.reinforcementPhase=true;run.total=Math.min(24,run.total+2);
  }
  effect(e.x,e.y-20,e.bossStyle==='rift'?'#baa3fa':'#fa9875',18);
  float(e.x,e.y-35,(run.encounter?.bossName||'WARLORD')+' · PHASE II','#ffc49b');
  message('CHAPTER BOSS · REINFORCEMENTS INCOMING');
 }
 effect(e.x,e.y,'#fbd47b',3);if(kind==='arrow'){
 if(Math.random()<skill('ember')*.06+socketValue('ember'))e.burn=Math.max(e.burn,3);
 if(Math.random()<skill('frost')*.055+socketValue('frost'))e.slow=Math.max(e.slow,2.7+skill('hail')*.5);
 if(Math.random()<skill('spark')*.04+socketValue('storm')+t('shock')*.001){const other=run.enemies.filter(o=>o!==e&&!o.dead).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];if(other){effect(other.x,other.y,'#a5efff',8);hurt(other,raw*.45,'arcane');}}
 }
 if(e.hp<=0)kill(e);
}
function kill(e){e.dead=true;run.kills++;run.enemiesDefeated=(run.enemiesDefeated||0)+1;if(e.isBoss)run.bossesKilledThisWave=(run.bossesKilledThisWave||0)+1;effect(e.x,e.y,e.type==='skeleton'?'#e7ded0':'#caa673',14);let amount=Math.ceil(e.valued*(1+t('gold')*.028+skill('fortune')*.08+socketValue('fortune')*4+res('bounties')*.03+lr('goldenTouch')*.04)*(1+run.wave*.09)*(tierReward(run.tier))*(1+dominionBonus('gold'))*(1+oathRank('sovereignTribute')*.0125));if(e.golden){amount*=2;}else if(Math.random()<skill('midas')*.02+station('midas')*.013){amount*=3;float(e.x,e.y-35,'GOLDEN!', '#ffcd59')}p.gold+=amount;xpAdd(Math.ceil((isSiegeBoss(e)?70:8)*(1+run.wave*.055)*(tierReward(run.tier))));float(e.x,e.y-10,'+'+fmt(amount)+' GOLD','#f4c864');}
function projectileCount(){return Math.min(12,1+Math.floor(t('multishot')/8)+Math.floor(ascRank('volley')/6));}
function shoot(target,power=damage(),kind='arrow',originX=496,originY=390){if(!target||run.shots.length>=48)return;run.shots.push({x:originX,y:originY,target,power,kind,life:1.8,trail:[]});run.flashes=.13;}
function sapperBlastDamage(){
 const severity=(14+run.wave*.6)*(1+(run.tier-1)*.17)*Math.sqrt(outerDepthPressure(run.tier,run.wave));
 const mitigation=(1-Math.min(.5,sup('damage')*.007))*(1-Math.min(.35,t('resist')*.006+skill('ward')*.04));
 return Math.max(1,Math.ceil(Math.min(Math.ceil(run.maxHealth*.025),Math.ceil(severity*mitigation))*(p.combatPassive==='sentinel'?.9:1)));
}
function specialEnemyMotion(e,dt){
 let motion=1;
 if(isSiegeBoss(e))e.bossExposedTimer=Math.max(0,(e.bossExposedTimer||0)-dt);
 if(e.type==='frostbinder'){
  if(e.frostWindup>0){
   e.frostWindup=Math.max(0,e.frostWindup-dt);motion=.55;
   if(e.frostWindup===0){
    run.heroChill=Math.max(run.heroChill||0,2.6);e.frostCastClock=8.2;e.spellBreakDamage=0;
    effect(e.x,e.y-14,'#9eecff',10);float(e.x,e.y-28,'FROST RITE','#bcecff');
   }
  }else{
   e.frostCastClock=(e.frostCastClock??4)-dt;
   if(e.frostCastClock<=0){
    e.frostWindup=.95;e.spellBreakDamage=0;float(e.x,e.y-22,'FROST CASTING','#a9e2fa');effect(e.x,e.y-12,'#7ec6e9',5);
   }
  }
 }
 if(e.type==='sapper'){
  if(!e.fuseSpent&&e.y>=218){
   e.fuseSpent=true;e.fuseTime=1.3;e.spellBreakDamage=0;
   float(e.x,e.y-22,'FUSE LIT','#ffb36d');effect(e.x,e.y-10,'#ffc26e',5);
  }
  if(e.fuseTime>0){
   e.fuseTime=Math.max(0,e.fuseTime-dt);motion=.50;
   if(e.fuseTime===0){
    e.spellBreakDamage=0;const blast=sapperBlastDamage();
    run.health=Math.max(0,run.health-blast);run.sapperBlasts=(run.sapperBlasts||0)+1;run.shakes=Math.max(run.shakes,.12);
    float(e.x,e.y-25,'SABOTAGE · -'+formatWave(blast),'#ffc78c');
    effect(e.x,e.y-10,'#ffae67',12);
   }
  }
 }
 if(e.type==='thornweaver'){
  e.thornWardTimer=Math.max(0,(e.thornWardTimer||0)-dt);
  if(e.thornWindup>0){
   e.thornWindup=Math.max(0,e.thornWindup-dt);motion=.50;
   if(e.thornWindup===0){
    e.thornWardTimer=2.8;e.thornCastClock=8;e.spellBreakDamage=0;
    effect(e.x,e.y-16,'#b5e58c',8);float(e.x,e.y-26,'THORN WARD','#d0ecaa');
   }
  }else{
   e.thornCastClock=(e.thornCastClock??3.5)-dt;
   if(e.thornCastClock<=0){e.thornWindup=.85;e.spellBreakDamage=0;float(e.x,e.y-24,'WARD RISING','#d5eeaa');}
  }
 }
 if(e.type==='riftstalker'){
  if(!e.blinkStarted&&e.y>=205){e.blinkStarted=true;e.blinkWindup=.95;e.spellBreakDamage=0;float(e.x,e.y-22,'RIFT OPENING','#dfb4ff');}
  if(e.blinkWindup>0){
   e.blinkWindup=Math.max(0,e.blinkWindup-dt);motion=.28;
   if(e.blinkWindup===0){e.spellBreakDamage=0;e.y=Math.min(398,e.y+36);effect(e.x,e.y,'#bd9ef0',9);float(e.x,e.y-18,'BLINK','#e3cfff');}
  }
 }
 if(e.type==='warlord'&&e.bossPhase===2){
  e.bossWardTimer=Math.max(0,(e.bossWardTimer||0)-dt);
  if(e.bossStyle==='ember'){
   if(e.bossFuryWindup>0){
    e.bossFuryWindup=Math.max(0,e.bossFuryWindup-dt);motion=.25;
    if(e.bossFuryWindup===0){e.bossFurySurge=1.0;e.bossFuryClock=6;e.bossCastDamage=0;effect(e.x,e.y,'#ffa46f',10);}
   }else if(e.bossFurySurge>0){e.bossFurySurge=Math.max(0,e.bossFurySurge-dt);motion=1.70;}
   else{e.bossFuryClock=(e.bossFuryClock??3)-dt;if(e.bossFuryClock<=0){e.bossFuryWindup=.9;e.bossCastDamage=0;motion=.25;float(e.x,e.y-28,'EMBER CHARGE','#ffad7e');}}
  }
  if(e.bossStyle==='rift'){
   e.bossBlinkCooldown=Math.max(0,(e.bossBlinkCooldown||0)-dt);
   if(e.bossBlinkWindup>0){
    e.bossBlinkWindup=Math.max(0,e.bossBlinkWindup-dt);motion=.20;
    if(e.bossBlinkWindup===0){
     e.y=Math.min(398,e.y+26);e.bossBlinkCooldown=7;e.bossCastDamage=0;
     effect(e.x,e.y,'#b29af6',12);float(e.x,e.y-28,'VOID STEP','#d9c9ff');
    }
   }else if(e.bossBlinkCooldown<=0&&e.y<325){
    e.bossBlinkWindup=1.05;e.bossCastDamage=0;motion=.20;
    float(e.x,e.y-28,'VOID RIFT OPENING','#dbc1ff');
   }
  }
 }
 if(e.type==='siegebeast'){
  if(!e.crushStarted&&e.y>=218){
   e.crushStarted=true;e.crushWindup=1.1;
   float(e.x,e.y-34,'CRUSHER WINDUP','#ffd5a7');
  }
  if(e.crushWindup>0){
   e.crushWindup=Math.max(0,e.crushWindup-dt);motion=.25;
   if(e.crushWindup===0){e.crushSurge=1.3;e.bossCastDamage=0;effect(e.x,e.y-10,'#d9b18c',12);}
  }else if(e.crushSurge>0){e.crushSurge=Math.max(0,e.crushSurge-dt);motion=1.85;}
 }
 return motion;
}
// Advance transient cosmetic effects with simulated elapsed time, not with display refreshes.
function advanceBattleVisuals(dt){
 if(!Number.isFinite(dt)||dt<=0)return;
 run.shakes=Math.max(0,run.shakes-dt*.96);
 run.flashes=Math.max(0,run.flashes-dt);
 for(let i=run.particles.length-1;i>=0;i--){
  const particle=run.particles[i];
  particle.life-=dt;particle.x+=particle.vx*dt;particle.y+=particle.vy*dt;particle.vy+=48*dt;
  if(particle.life<=0)run.particles.splice(i,1);
 }
 for(let i=run.floats.length-1;i>=0;i--){
  const label=run.floats[i];label.life-=dt;label.y-=25.8*dt;
  if(label.life<=0)run.floats.splice(i,1);
 }
}
function tick(dt){
 if((run.phase==='fighting'||run.phase==='intermission')&&run.speed===0)return;
 if((run.phase==='fighting'||run.phase==='intermission')&&run.speed>0){p.battleSeconds+=dt;saveClock+=dt;advanceBattleVisuals(dt*run.speed);if(saveClock>=30){saveClock=0;save();}}
 if(run.phase==='intermission'){run.rewardTimer-=dt*run.speed;if(run.rewardTimer<=0)beginWave();return;}if(run.phase!=='fighting')return;dt*=run.speed;run.time+=dt;run.heroChill=Math.max(0,(run.heroChill||0)-dt);run.spawnClock-=dt;run.shotClock-=dt;run.stationClock-=dt;
 if(run.spawned<run.total&&run.spawnClock<=0){spawnEnemy();run.spawned++;run.spawnClock=Math.max(.26,1.05-run.wave*.018);}
 let gravity=1-Math.min(.4,station('gravity')*.018),cryo=1-Math.min(.4,station('cryo')*.018);
 for(const e of run.enemies){
  if(e.dead)continue;
  e.wobble+=dt*2;
  let rush=1;
  if(e.type==='raider'){
   e.dashClock=(e.dashClock||0)-dt;
   if(e.dashClock<=0){e.dashTime=.55;e.dashClock=3.6;effect(e.x,e.y,'#ebad85',5);}
   if(e.dashTime>0){rush=1.65;e.dashTime-=dt;}
  }
  if(e.type==='shaman'){
   e.ritualClock=(e.ritualClock||0)-dt;
   if(e.ritualClock<=0){
    e.ritualClock=6;
    const allies=run.enemies.filter(other=>other&&!other.dead&&other!==e&&Math.abs(other.y-e.y)<130&&other.hp<other.max)
      .sort((a,b)=>(a.hp/a.max)-(b.hp/b.max)).slice(0,2);
    if(allies.length){for(const ally of allies){ally.hp=Math.min(ally.max,ally.hp+ally.max*.06);effect(ally.x,ally.y,'#baa6ea',4);}float(e.x,e.y-20,'RITUAL','#dfbfff');}
   }
  }
  rush*=specialEnemyMotion(e,dt);
  rush*=rallyAuraFactor(e,run.enemies);
  e.y+=e.speed*dt*rush*(e.slow>0?.5:1)*gravity*cryo;
  e.x+=Math.sin(e.wobble)*dt*(e.type==='imp'||e.type==='raider'?11:4);e.slow=Math.max(0,e.slow-dt);e.buildup=Math.max(0,e.buildup-dt);if(e.burn>0){e.burn-=dt;e.hp-=dt*(2+skill('ember')*1.3);if(e.hp<=0){kill(e);continue;}}if(e.y>430){e.dead=true;run.breaches++;run.totalBreaches=(run.totalBreaches||0)+1;
  if(e.isBoss&&['chapterBoss','commander'].includes(run.encounter?.kind)){
   run.bossEscapes=(run.bossEscapes||0)+1;
   notice('MAJOR BOSS BREACHED THE FORTRESS');
  }let pressure=1+Math.min(2.4,run.breaches*(.015+.09*Math.min(1,run.wave/1000)));let attack=Math.ceil(pressure*(isSiegeBoss(e)?36:13)*(e.type==='siegebeast'?2.0*(e.crushSurge>0?1.18:1):e.type==='warlord'&&e.bossPhase===2?1.4:1)*(1+run.wave*.055)*(1+(run.tier-1)*.25)*(dominionTrial(run.tier)?.trait==='crushing'?1.22:1)*Math.sqrt(outerDepthPressure(run.tier,run.wave))*(1-Math.min(.5,sup('damage')*.007))*(1-Math.min(.35,t('resist')*.006+skill('ward')*.04)));attack=Math.max(1,Math.ceil(attack*(p.combatPassive==='sentinel'?.9:1)));run.health-=attack;run.shakes=.18;float(750,450,'BREACH '+run.breaches+' · -'+attack+' WALL','#ff7777');effect(e.x,424,'#ff7361',11);if(skill('thorns'))run.health+=Math.min(attack*.3,skill('thorns')*1);}}
 if(run.health<=0){run.health=0;run.phase='fallen';finishSiege('fallen');message('THE FORTRESS HAS FALLEN');notice('Tier '+roman(run.tier)+' · Wave '+run.wave+' • Permanent progress saved');save();showLobby('FORTRESS FALLEN · Tier '+roman(run.tier)+' · Reached Wave '+run.wave+' · Select a tier to fight again');refreshHUD();return;}
 advanceCombatDoctrine(dt);
 if(run.shotClock<=0&&run.enemies.some(e=>!e.dead)){const targets=run.enemies.filter(e=>!e.dead).sort((a,b)=>threatPriority(b)-threatPriority(a));let count=projectileCount();for(let i=0;i<count;i++){const tar=targets[i%targets.length];shoot(tar);if(Math.random()<skill('double')*.08)shoot(tar,damage()*.65,'arrow',476,390);}run.shotClock=attackInterval();}
 if(run.stationClock<=0){let targets=run.enemies.filter(e=>!e.dead).sort((a,b)=>threatPriority(b)-threatPriority(a));if(targets.length){if(station('ballista'))shoot(targets[0],damage()*(.6+station('ballista')*.22),'ballista',240,360);if(station('thunder'))shoot(targets[Math.min(1,targets.length-1)],damage()*(.4+station('thunder')*.15),'lightning',760,360);}run.stationClock=Math.max(.48,2.9/(1+station('ballista')*.06+station('thunder')*.05));}
 for(let i=run.shots.length-1;i>=0;i--){let s=run.shots[i];if(s.target.dead){run.shots.splice(i,1);continue}let dx=s.target.x-s.x,dy=s.target.y-s.y,dist=Math.hypot(dx,dy),speed=(s.kind==='lightning'?1100:820)*(1+t('range')*.017);s.trail.push([s.x,s.y]);if(s.trail.length>7)s.trail.shift();s.x+=dx/(dist||1)*dt*speed;s.y+=dy/(dist||1)*dt*speed;s.life-=dt;if(dist<dt*speed+8){hurt(s.target,s.power,s.kind);effect(s.x,s.y,s.kind==='lightning'?'#97f4ff':'#ffe07c',7);run.shots.splice(i,1);}else if(s.life<=0)run.shots.splice(i,1);}
 if(run.spawned===run.total&&run.enemies.every(e=>e.dead)){completeWave();}
}
function awardChapterChallenge(tier,wave,essence,knowledge){
 const encounter=run.encounter;
 const challenge=encounter&&encounter.wave===wave?chapterChallenge(encounter):null;
 if(!challenge||run.breaches>0||p.chapterChallenges[challenge.key])return false;
 p.chapterChallenges[challenge.key]=true;
 const bonusEssence=Math.max(1,Math.ceil(essence*.12));
 const bonusKnowledge=Math.max(1,Math.ceil(knowledge*.12));
 p.essence+=bonusEssence;p.knowledge+=bonusKnowledge;
 notice('✦ FLAWLESS CHAPTER '+roman(encounter.chapter));
 message('FLAWLESS DEFENSE · +'+fmt(bonusEssence)+' ESSENCE · +'+fmt(bonusKnowledge)+' KNOWLEDGE');
 return true;
}
// Never discard a unique earned rune because a long-run player has 240 runes equipped or stored.
function claimPendingRelics(){
 let claimed=0;
 while(p.pendingRelics.length&&p.runes.length<240){
  const rune=p.pendingRelics.shift();
  if(rune&&runeNames[rune.type]&&Number(rune.tier)>=1&&Number(rune.tier)<=12&&!p.runes.some(r=>r.id===rune.id)){
   p.runes.push(rune);claimed++;
  }
 }
 return claimed;
}
function awardRelicChallenge(tier,wave,knowledge){
 const encounter=run.encounter;
 const challenge=encounter&&encounter.wave===wave?relicChallenge(encounter):null;
 if(!challenge||run.breaches>0||p.relicHunts[challenge.key])return false;
 p.relicHunts[challenge.key]=true;
 const bonus=Math.max(1,Math.ceil(knowledge*.10));p.knowledge+=bonus;
 let item='+'+fmt(bonus)+' KNOWLEDGE';
 const types=Object.keys(runeNames),type=types[(tier+wave)%types.length],rank=Math.min(12,1+Math.floor(wave/1500));
 const rune={type,tier:rank,id:'relic'+tier+'_'+wave};
 const placement=storeEarnedRune(rune);
 if(placement==='claimed')item='TIER '+rank+' '+type.toUpperCase()+' RUNE · '+item;
 else if(placement==='reserved')item='RUNE RESERVED IN WORKSHOP · '+item;
 notice('✦ RELIC RECOVERED');message('RELIC HUNT COMPLETE · '+item);return true;
}
function completeWave(){
 if(run.phase!=='fighting')return;
 const cleared=run.wave,tier=run.tier,multi=tierReward(tier);
 run.wavesCleared=(run.wavesCleared||0)+1;
 if(run.encounter?.wave===cleared&&['chapterBoss','commander'].includes(run.encounter.kind)&&run.bossesKilledThisWave>0)
  run.bossVictories=(run.bossVictories||0)+1;
 let essence=Math.round((12+cleared*4)*(1+t('essence')*.028)*multi*(1+Math.min(16,res('distillation'))*.015)*(1+dominionBonus('essence'))*(1+oathRank('sovereignTribute')*.0125));
 let knowledge=Math.round((5+cleared*1.6)*(1+res('studies')*.045)*multi*(1+dominionBonus('knowledge'))*(1+oathRank('sovereignTribute')*.0125));
 let waveGold=Math.round((35+cleared*9)*(1+res('interest')*.07+skill('prosperity')*.12)*multi*(1+dominionBonus('gold'))*(1+oathRank('sovereignTribute')*.0125));
 if(run.encounter?.wave===cleared&&['treasure','bannerAssault'].includes(run.encounter.kind))waveGold=Math.round(waveGold*encounterSpecialBonus(run.encounter.kind));
 if(run.encounter?.wave===cleared&&run.encounter.kind==='arcane')knowledge=Math.round(knowledge*encounterKnowledgeBonus(run.encounter.kind));
 p.essence+=essence;p.knowledge+=knowledge;p.gold+=waveGold;
 const firstClear=cleared>(p.bestByTier[tier]||0);
 if(firstClear)p.uniqueClears++;
 p.best=Math.max(p.best,cleared);p.bestByTier[tier]=Math.max(p.bestByTier[tier]||0,cleared);
 p.highestWave=Math.max(p.highestWave,cleared+1);p.clears++;xpAdd(15+cleared*5);grantDrops();if(run.encounter?.wave===cleared&&run.encounter.kind==='treasure')grantDrops();
 run.maxHealth=maxWall();run.health=Math.min(run.maxHealth,run.health+run.maxHealth*(.08+.42*(1-Math.exp(-t('regen')/120))+skill('mend')*.025+dominionBonus('healing')));
 if(tierMilestones(tier).includes(cleared))rewardMilestone(tier,cleared);
 else message('WAVE '+fmt(cleared)+' CLEARED · +'+fmt(essence)+' ESSENCE');
 awardFirstWatch();
 awardChapterChallenge(tier,cleared,essence,knowledge);
 awardRelicChallenge(tier,cleared,knowledge);
 if(cleared>=MAX_WAVE){
  run.phase='completed';run.wave=MAX_WAVE;finishSiege('victory');run.enemies=[];run.shots=[];
  save();showLobby('ETERNAL VICTORY · Tier '+roman(tier)+' completed at wave '+fmt(MAX_WAVE));refreshHUD();return;
 }
 run.wave++;run.phase='intermission';run.rewardTimer=1.2;run.enemies=[];run.shots=[];
 save();refreshHUD();
}
function draw(){let w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.save();if(run.shakes>0&&!reduceMotion){ctx.translate(rnd(-2,2),rnd(-2,2));}if(background.complete&&background.naturalWidth){ctx.drawImage(background,0,0,w,h)}else{ctx.fillStyle='#223c45';ctx.fillRect(0,0,w,h)}
 // Subtle animated fog and light make the illustrated environment breathe.
 const time=performance.now()/1000;let gd=ctx.createLinearGradient(0,96,0,415);gd.addColorStop(0,'rgba(5,25,39,.08)');gd.addColorStop(1,'rgba(18,10,21,.13)');ctx.fillStyle=gd;ctx.fillRect(0,90,960,350);
 // Moving battle units: distinct image sprites, shadow, perspective, HP and state effects.
 for(const e of [...run.enemies].filter(e=>!e.dead).sort((a,b)=>a.y-b.y)){let s=clamp(.28+(e.y-105)/300*.83,.27,1.18)*(e.type==='siegebeast'?2.28:e.type==='warlord'?2.05:e.type==='ogre'?2.25:e.type==='guardian'||e.type==='banneret'?1.18:1);let im=sprites[e.type==='warlord'&&e.bossStyle?'warlord_'+e.bossStyle:e.type];if(!im||!im.complete)continue;let sw=im.naturalWidth*s,sh=im.naturalHeight*s,py=e.y-sh/2+Math.sin(e.wobble*1.3)*(e.type==='imp'?6:1);ctx.fillStyle='rgba(14,26,20,.43)';ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.43,Math.max(3,6*s),0,0,Math.PI*2);ctx.fill();ctx.save();ctx.shadowColor='rgba(10,18,26,.75)';ctx.shadowBlur=Math.max(3,6*s);if(e.buildup>0)ctx.filter='brightness(1.8)';if(e.golden)ctx.filter='sepia(1) saturate(2) hue-rotate(340deg) brightness(1.15)';ctx.imageSmoothingEnabled=false;ctx.drawImage(im,e.x-sw/2,py,sw,sh);ctx.restore();
 if(e.relicGuardian){
  ctx.strokeStyle='#f9e2a2';ctx.lineWidth=Math.max(2,3*s);
  ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.40,sw*.61,Math.max(6,10*s),0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#f9e2a2';ctx.fillRect(e.x-3,py-9,6,6);ctx.fillStyle='#fff0c8';ctx.fillRect(e.x-1,py-12,2,12);
 }
 if(e.type==='guardian'){
  ctx.strokeStyle='rgba(153,219,224,.74)';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.54,Math.max(5,7*s),0,0,Math.PI*2);ctx.stroke();
 }
 if(e.type==='raider'&&e.dashTime>0){
  ctx.strokeStyle='#f2ad79';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(e.x-sw*.25,e.y+sh*.3);ctx.lineTo(e.x-sw*.4,e.y+sh*.25-14*s);ctx.stroke();
 }
 if(e.type==='shaman'){
  ctx.fillStyle='rgba(207,171,255,.78)';ctx.fillRect(e.x-2,py-5,4,4);
 }
 if(e.type==='banneret'){
  ctx.strokeStyle='rgba(247,212,140,.58)';ctx.lineWidth=2;
  ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.39,sw*.58,Math.max(5,9*s),0,0,Math.PI*2);ctx.stroke();
 }
 if(e.type==='frostbinder'&&e.frostWindup>0){
  ctx.strokeStyle='#9ce5fc';ctx.lineWidth=2;
  ctx.beginPath();ctx.arc(e.x,py+sh*.13,10+6*(1-e.frostWindup/.95),0,Math.PI*2);ctx.stroke();
 }
 if(e.type==='sapper'&&e.fuseTime>0){
  ctx.fillStyle='#281c28';ctx.fillRect(e.x-15,py-15,30,5);
  ctx.fillStyle='#ffb36e';ctx.fillRect(e.x-14,py-14,28*(1-e.fuseTime/1.3),3);
 }
 if(e.type==='thornweaver'&&e.thornWindup>0){
  ctx.strokeStyle='#c7eea1';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,py+sh*.2,12+5*(1-e.thornWindup/.85),0,Math.PI*2);ctx.stroke();
 }
 if(e.type==='thornweaver'&&e.thornWardTimer>0){
  ctx.strokeStyle='rgba(165,227,127,.72)';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.58,Math.max(5,8*s),0,0,Math.PI*2);ctx.stroke();
 }
 if(e.type==='riftstalker'&&e.blinkWindup>0){
  ctx.strokeStyle='#d4b5ff';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,py+sh*.2,14,0,Math.PI*2*(1-e.blinkWindup/.95));ctx.stroke();
 }
 if(e.bossExposedTimer>0&&isSiegeBoss(e)){
  ctx.strokeStyle='rgba(255,223,134,.9)';ctx.lineWidth=3;
  ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.55,Math.max(8,10*s),0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#ffe29f';ctx.fillRect(e.x-4,py-13,8,3);
 }
 if(e.type==='warlord'&&e.bossWardTimer>0){
  ctx.strokeStyle='#a9d4f4';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.52,Math.max(9,11*s),0,0,Math.PI*2);ctx.stroke();
 }
 if(e.type==='warlord'&&e.bossFuryWindup>0){
  ctx.strokeStyle='#ffbd81';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,py+sh*.2,Math.max(16,sw*.27),0,Math.PI*2*(1-e.bossFuryWindup/.9));ctx.stroke();
 }
 if(e.type==='warlord'&&e.bossBlinkWindup>0){
  ctx.strokeStyle='#cab3fb';ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,py+sh*.18,Math.max(16,sw*.26),0,Math.PI*2*(1-e.bossBlinkWindup/1.05));ctx.stroke();
 }
 if(e.type==='siegebeast'&&e.crushWindup>0){
  ctx.strokeStyle='#f8cb96';ctx.lineWidth=3;
  ctx.beginPath();ctx.arc(e.x,py+sh*.20,Math.max(16,sw*.26),0,Math.PI*2*(1-e.crushWindup/1.1));ctx.stroke();
 }
 if(e.type==='warlord'&&e.bossPhase===2){
  ctx.strokeStyle='#ee966d';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.48,Math.max(8,9*s),0,0,Math.PI*2);ctx.stroke();
 }
 if(e.type==='frostbinder'&&run.heroChill>0){ctx.fillStyle='rgba(166,229,248,.75)';ctx.fillRect(e.x-2,py-9,4,4);}
  // Warm interruption bar above HP only while the enemy is actually casting.
  const casting=specialistCast(e),castGoal=e.max*(casting==='rift'?.22:.18);
  if(casting&&e.spellBreakDamage>0&&castGoal>0){
   const progress=clamp(e.spellBreakDamage/castGoal,0,1),bar=Math.max(26,22*s);
   ctx.fillStyle='#1a2425';ctx.fillRect(e.x-bar/2,py-16,bar,4);
   ctx.fillStyle='#ffd898';ctx.fillRect(e.x-bar/2,py-16,bar*progress,4);
  }
 if(e.slow>0){ctx.strokeStyle='#91f1f9';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.36,6*s,0,0,7);ctx.stroke();}if(e.burn>0){ctx.fillStyle='#ffa554';ctx.fillRect(e.x-6,e.y-sh*.45-4,5,8);}let barW=clamp(26*s,20,64);ctx.fillStyle='#1e1b25';ctx.fillRect(e.x-barW/2,py-7,barW,4);ctx.fillStyle=isSiegeBoss(e)?'#ed796e':e.type==='guardian'?'#9bd6dd':e.type==='shaman'?'#c1a4ef':'#a8d675';ctx.fillRect(e.x-barW/2,py-7,barW*clamp(e.hp/e.max,0,1),4);}
 // Fortress battlements and hero are their own painted foreground layer.
 // Draw AFTER enemies: attackers remain behind the wall, never over it.
 if(foreground.complete&&foreground.naturalWidth){ctx.drawImage(foreground,0,0,w,h);}
 for(const s of run.shots){ctx.beginPath();ctx.lineWidth=s.kind==='lightning'?3:2;ctx.strokeStyle=s.kind==='lightning'?'#90f2ff':s.kind==='ballista'?'#ffd285':'#ffe8a9';ctx.moveTo(s.x,s.y);let tail=s.trail[0]||[s.x-7,s.y+6];ctx.lineTo(tail[0],tail[1]);ctx.stroke();ctx.fillStyle='#fff5b9';ctx.fillRect(s.x-2,s.y-2,4,4);}
 for(const t of run.particles){ctx.globalAlpha=clamp(t.life/t.max,0,1);ctx.fillStyle=t.color;ctx.fillRect(t.x,t.y,t.size,t.size)}ctx.globalAlpha=1;
 for(const f of run.floats){ctx.globalAlpha=clamp(f.life,0,1);ctx.fillStyle='#17101a';ctx.font='bold 15px Arial';ctx.fillText(f.text,f.x+1,f.y+2);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y)}ctx.globalAlpha=1;
 // Animated bow glow and string release marks the single hero as the shooter.
 if(run.flashes>0&&!reduceMotion){ctx.fillStyle=`rgba(255,226,142,${clamp(run.flashes*3,0,.68)})`;ctx.beginPath();ctx.arc(540,360,20+run.flashes*70,0,Math.PI*2);ctx.fill();}ctx.restore();}
// Actual active windups temporarily replace the static encounter advice; no timer spam.
function activeEncounterThreat(){
 if(run.phase!=='fighting')return null;
 let highest=null;
 for(const e of run.enemies){
  if(!e||e.dead)continue;
  let priority=0,text='';
  if(e.type==='sapper'&&e.fuseTime>0){priority=120;text='FUSE LIT · STOP THE SAPPER';}
  else if(e.type==='siegebeast'&&e.crushWindup>0){priority=110;text='CRUSHER WINDUP · FOCUS THE BOSS';}
  else if(e.type==='warlord'&&e.bossFuryWindup>0){priority=108;text='EMBER CHARGE · INTERRUPT THE BOSS';}
  else if(e.type==='warlord'&&e.bossBlinkWindup>0){priority=106;text='VOID STEP · INTERRUPT THE BOSS';}
  else if(e.type==='riftstalker'&&e.blinkWindup>0){priority=95;text='RIFT OPENING · FOCUS THE STALKER';}
  else if(e.type==='frostbinder'&&e.frostWindup>0){priority=83;text='FROST RITE · INTERRUPT THE CASTER';}
  else if(e.type==='thornweaver'&&e.thornWindup>0){priority=80;text='THORN WARD · STOP THE CAST';}
  else if(e.type==='warlord'&&e.bossWardTimer>0){priority=65;text='IRON WARD · BREAK ITS DEFENSE';}
  if(priority&&(!highest||priority>highest.priority||(priority===highest.priority&&e.y>highest.y)))highest={priority,text,y:e.y};
 }
 return highest?{priority:highest.priority,text:highest.text}:null;
}
let lastResourceMarkup='';
function bossTelegraph(boss){
 if(!boss||boss.dead)return null;
 if(boss.type==='siegebeast'&&boss.crushWindup>0)
  return {label:'CRUSHER STRIKE',remaining:boss.crushWindup,duration:1.1,ward:false};
 if(boss.type==='warlord'){
  if(boss.bossFuryWindup>0)return {label:'EMBER CHARGE',remaining:boss.bossFuryWindup,duration:.9,ward:false};
  if(boss.bossBlinkWindup>0)return {label:'VOID STEP',remaining:boss.bossBlinkWindup,duration:1.05,ward:false};
  if(boss.bossWardTimer>0)return {label:'IRON WARD',remaining:boss.bossWardTimer,duration:2.2,ward:true};
 }
 return null;
}
function refreshHUD(){
 let r=[['🟡','GOLD',p.gold],['🔷','ESSENCE',p.essence],['📖','KNOWLEDGE',p.knowledge],['💠','SIGILS',p.sigils],['✦','SKILL POINTS',p.points]];
 const resourceMarkup=r.map(a=>`<div class="resource"><span class="glyph">${a[0]}</span><div><small>${a[1]}</small><strong>${fmt(a[2])}</strong></div></div>`).join('');
 if(resourceMarkup!==lastResourceMarkup){$('resources').innerHTML=resourceMarkup;lastResourceMarkup=resourceMarkup;}
 $('stageName').textContent='TIER '+roman(run.tier)+' · '+tierNames[run.tier-1];
 $('waveName').textContent='WAVE '+formatWave(run.wave)+' / '+formatWave(MAX_WAVE);
 const bossHud=$('bossHud');
 if(bossHud){
  const boss=run.phase==='fighting'&&['chapterBoss','commander'].includes(run.encounter?.kind)?
   run.enemies.find(e=>!e.dead&&isSiegeBoss(e)):null;
  bossHud.hidden=!boss;
  const castTrack=$('bossCastTrack');
  if(castTrack){
   const cast=bossTelegraph(boss);
   castTrack.hidden=!cast;
   if(cast){
    const value=clamp(cast.ward?100*cast.remaining/cast.duration:100*(1-cast.remaining/cast.duration),0,100);
    $('bossCastFill').style.width=value+'%';
    $('bossCastLabel').textContent=cast.label+' · '+cast.remaining.toFixed(1)+'s';
    const counterAmount=cast.ward?boss.bossWardDamage:boss.bossCastDamage;
    const counterGoal=Math.max(1,(boss.max||0)*(cast.ward?.10:.09));
    $('bossCastBreak').textContent='BREAK '+Math.floor(clamp((Number(counterAmount)||0)/counterGoal,0,1)*100)+'%';
    castTrack.dataset.ward=cast.ward?'true':'false';
   }
  }
  if(boss){
   const identity=boss.type==='warlord'?run.encounter.bossName:'SIEGE BEAST';
   $('bossName').textContent=identity;
   $('bossPhase').textContent=boss.type==='warlord'?(boss.bossPhase===2?'PHASE II':'PHASE I'):'SIEGE ENGINE';
   $('bossHealth').textContent=Math.max(0,Math.ceil(100*boss.hp/(boss.max||1)))+'%';
   $('bossFill').style.width=clamp(100*boss.hp/(boss.max||1),0,100)+'%';
   const warning=boss.bossExposedTimer>0?'EXPOSED · +12% DAMAGE':
    boss.crushWindup>0?'CRUSHER · BREAK THE WINDUP':
    boss.bossFuryWindup>0?'EMBER CHARGE · INTERRUPT':
    boss.bossBlinkWindup>0?'VOID STEP · INTERRUPT':
    boss.bossWardTimer>0?'IRON WARD · SHATTER IT':
    boss.bossFurySurge>0?'REGENT SURGING':boss.bossPhase===2?'REINFORCEMENTS DEPLOYED':'WATCH FOR PHASE II';
   $('bossWarning').textContent=warning;
   bossHud.dataset.warning=Number(boss.crushWindup>0||boss.bossFuryWindup>0||boss.bossBlinkWindup>0)?'true':'false';
   bossHud.dataset.exposed=boss.bossExposedTimer>0?'true':'false';
  }
 }
 const encounterRibbon=$('encounterRibbon');
 if(encounterRibbon){
  const active=run.phase==='fighting'||run.phase==='intermission';
  const encounter=active?(run.encounter&&run.encounter.wave===run.wave?run.encounter:encounterDirector(run.wave,run.tier)):null;
  encounterRibbon.hidden=!encounter;
  const tip=$('encounterHint');if(!encounter&&tip){tip.hidden=true;encounterRibbon.dataset.threat='false';}
  if(encounter){
   encounterRibbon.dataset.kind=encounter.kind;
   $('encounterType').textContent=encounter.label;
   $('encounterFaction').textContent=encounter.faction;
   $('encounterChapter').textContent='CHAPTER '+roman(encounter.chapter);
   const tip=$('encounterHint'),threat=activeEncounterThreat();
    encounterRibbon.dataset.threat=threat?'true':'false';
    if(tip){const advice=threat?.text||encounterAdvice(encounter.kind);tip.hidden=!advice;tip.textContent=advice;}
   const goal=$('encounterGoal');if(goal){const challenge=chapterChallenge(encounter)||relicChallenge(encounter);goal.hidden=!challenge;goal.textContent=challenge?'✦ '+challenge.desc+(run.breaches?' · FAILED':' · UNBROKEN'):'';goal.dataset.failed=run.breaches?'true':'false';}
  }
 }
 $('waveFill').style.width=(run.phase==='fighting'?100*run.kills/(run.total||1):run.phase==='intermission'?100:0)+'%';
 $('wallText').textContent=Math.ceil(run.health)+' / '+run.maxHealth;
 $('wallFill').style.width=(100*run.health/(run.maxHealth||1))+'%';
 $('heroTag').innerHTML='✦ LEVEL '+p.level+' <span>'+fmt(p.xp)+' / '+fmt(lvlNeed())+' XP</span>';
 refreshDoctrineHud();
 const next=nextMilestone(run.tier,run.wave);$('milestoneHint').textContent=next?'✦ NEXT MILESTONE · WAVE '+formatWave(next)+' · '+tierMilestone(run.tier,next).name:'✦ ALL MILESTONES CLEARED · PUSH YOUR RECORD';
 syncBattleControls();
}
// ALPHA 0.3 — hub navigation and progression chambers, completely rebuilt UI.
const hubs={battle:['battle'],hero:['hero'],power:['training','research'],gear:['equipment','runes'],fortress:['stations','suppression']};
const hubLabels={battle:'Battle',hero:'Hero',power:'Power',gear:'Gear',fortress:'Fortress'};
const tabIcons={hero:'hero',skills:'skills',training:'training',research:'research',equipment:'gear',runes:'runes',stations:'stations',suppression:'suppression',settings:'power'};
const tabInfo={
 hero:['HERO HALL','The Defender','Your hero, your legend. Every upgrade serves this one warrior.','The heart of the fortress'],
 skills:['PATHS OF POWER','The Hall of Talents','Spend level points on lasting specialties. Learn talents in order, or explore other schools.','Learn and specialize'],
 training:['ASCENSION FORGE','The Eternal Ascent','Thousands of ranks, each making your hero stronger. Spend Essence to grow for the long haul.','Your strength never rests'],
 research:['ROYAL ARCHIVE','The Royal Archive','Make every reward go further. Invest Knowledge to reduce costs and boost future income.','Wisdom builds kingdoms'],
 equipment:['FORGE & ARMORY','The Royal Forge','Wear your strongest discoveries, then enhance each item with Gold.','The forge burns bright'],
 runes:['RUNIC WORKSHOP','The Rune Sanctum','Socket a rune into each item. Combine three matching runes to advance their tier.','Magic is forged here'],
 stations:['DEFENSIVE STATIONS','The Siege Works','Strengthen permanent fortress machinery for extra firepower, control and wealth.','Guard every stone'],
 suppression:['ENEMY SUPPRESSION','The War Council','Spend Knowledge studying the enemy and permanently weakening the invading horde.','Know your enemy'],
 settings:['SETTINGS & SAVES','The Chronicle','Keep your progress safe with local saves and downloadable backups.','Safeguard your journey']
};
let heroSelectedSkill='aim';
let activeByHub={battle:'battle',hero:'hero',power:'training',gear:'equipment',fortress:'stations'}, selectedSchool='Marksman',trainFilter='Offense',gearFilter='All',runePickSlot=null;
let armoryDrawerSlot=null,armorySellRarities=new Set(),lastGearSale=null;
const gearSlotLabels={helm:'HELM',amulet:'AMULET',chest:'CHEST PLATE',legs:'PLATE LEGS',boots:'BOOTS',gauntlets:'GAUNTLETS',charm:'CHARM',ring1:'RING I',ring2:'RING II',ring3:'RING III',ring4:'RING IV',ring:'RING'};
const gearSlotDescriptions={helm:'Head protection',amulet:'Relic and offensive power',chest:'Main torso armor',legs:'Leg protection',boots:'Movement and footing',gauntlets:'Strength and strikes',charm:'Utility and enchantment',ring:'Ring power'};
const gearSlotArt={helm:'hero',amulet:'runes',chest:'gear',legs:'gear',boots:'hero',gauntlets:'battle',charm:'runes',ring:'power',ring1:'power',ring2:'power',ring3:'power',ring4:'power'};
function equippedGear(slot){return p.inventory.find(g=>g.id===p.equipped[slot])||null;}
function gearTitle(g){return g.legacyName||(gearNames[g.slot]?.[g.rarity]||'Unknown Equipment');}
function gearSellPrice(g){const base=Math.floor(24*Math.pow(2.1,g.rarity));let refund=0;for(let i=0;i<Math.min(50,g.plus);i++)refund+=gearCost({...g,plus:i})*.18;return Math.max(1,Math.floor((base+refund)*(1+Math.min(15,res('appraisal'))*.02)));}
function canSellGear(g){return !!g&&!Object.values(p.equipped).includes(g.id);}

const currencyGlyph={gold:'🟡',essence:'🔷',knowledge:'📖',sigils:'💠',points:'✦'};
const currencyFor=action=>({train:'essence',skill:'points',station:'gold',research:'knowledge',suppress:'knowledge',enhance:'gold',fuse:'gold'}[String(action).split(':')[0]]||'gold');
const cardArt={train:'power',skill:'skills',station:'stations',research:'research',suppress:'suppression',equip:'gear',enhance:'gear',fuse:'runes'};
const meterPct=(n,max)=>max?Math.min(100,Math.max(0,100*n/max)):0;
const upgradeArt={
 power:'battle',haste:'power',fort:'hero',crit:'battle',critDmg:'skills',pierce:'battle',regen:'research',gold:'runes',xp:'skills',essence:'power',range:'battle',multishot:'battle',boss:'suppression',loot:'runes',resist:'hero',shock:'runes',
 aim:'battle',quiver:'battle',penetrate:'battle',double:'battle',focus:'hero',storm:'runes',ember:'runes',frost:'runes',spark:'runes',inferno:'runes',hail:'runes',tempest:'runes',
 stone:'fortress',mend:'research',thorns:'fortress',ward:'hero',bulwark:'fortress',laststand:'hero',fortune:'runes',scavenger:'gear',wisdom:'skills',midas:'runes',salvage:'gear',prosperity:'research',
 ballista:'battle',cryo:'runes',thunder:'runes',gravity:'stations',discount:'gear',fusion:'runes',interest:'research',excavation:'gear',bounties:'battle',studies:'skills',health:'suppression',speed:'suppression',damage:'suppression',armor:'suppression'
};
const chamberArt=tabName=>'assets/chambers/'+(tabName in tabInfo?tabName:'hero')+'.webp';
function card(title,description,level,cost,label,actionId,disabled=false,accent='',progress=null){
 const currency=currencyFor(actionId),kind=String(actionId).split(':')[0],item=p.inventory?.find(g=>g.id===String(actionId).split(':')[1]),art=(kind==='equip'||kind==='enhance')?(item?gearSlotArt[item.slot]:'gear'):(upgradeArt[String(actionId).split(':')[1]]||cardArt[kind]||'hero'),info=level||'',max=info.match(/(?:RANK|RESEARCH|ENHANCEMENT\s*\+)?\s*([\d,]+)\s*\/\s*([\d,]+)/i);const pct=progress!=null?progress:max?meterPct(Number(max[1].replace(/,/g,'')),Number(max[2].replace(/,/g,''))):0;
 return `<article class="upgrade-card art-card kind-${String(actionId).split(':')[0]} ${!disabled?'available-to-buy':''}"><div class="card-heading"><div class="card-art">${kind==="station"||kind==="suppress"?forgePixelIcon(String(actionId).split(":")[1]):kind==="fuse"?forgePixelIcon("rune_"+(p.runes.find(r=>r.id===String(actionId).split(":")[1])?.type||"ember")):`<span class="pixel-symbol pixel-symbol-${art}" aria-hidden="true"></span>`}</div><h3>${accent}${title}</h3></div><p>${description}</p><div class="level">${info}</div><div class="rank-track" aria-hidden="true"><span style="width:${pct}%"></span></div><div class="card-footer">${cost!==null?`<div class="card-cost ${currency}" title="Cost in ${currency}">${currencyGlyph[currency]} ${fmt(cost)}</div>`:''}<button data-action="${actionId}" ${disabled?'disabled':''}>${label}</button></div></article>`;
}
const section=(head,body)=>`<h2 class="section-title">${head}</h2>${body}`;
const cards=arr=>`<div class="cards">${arr.join('')}</div>`;
const highlight=(title,body,icon='✦')=>`<div class="highlight-banner"><div><b>${title}</b><small>${body}</small></div><div class="banner-emblem" aria-hidden="true">${icon}</div></div>`;

const schoolIcons={Marksman:'🏹',Arcanist:'✧',Guardian:'♜',Prospector:'✦'};
const heroCritChance=()=>Math.round((.06+t('crit')*.002)*1000)/10;
const heroCritDamage=()=>Math.round((1.7+t('critDmg')*.025+skill('focus')*.2)*100);
const goldBonusPct=()=>Math.round((t('gold')*.028+skill('fortune')*.08+res('bounties')*.03+lr('goldenTouch')*.04)*100);
const xpBonusPct=()=>Math.round(((1+t('xp')*.025+skill('wisdom')*.07)*(1+Math.min(16,res('almanac'))*.015)-1)*100);
const dropBonusPct=()=>Math.round((t('loot')*.002+skill('scavenger')*.025+res('excavation')*.015)*1000)/10;
const discountPct=()=>Math.round(Math.min(.42,res('discount')*.014+skill('salvage')*.02)*100);
const suppressionPct=()=>Math.round(Math.min(.35,sup('health')*.005)*100);
const schoolInvested=school=>skills[school].reduce((sum,[id])=>sum+skill(id),0);
const totalInvestedSkills=()=>Object.keys(skills).reduce((sum,school)=>sum+schoolInvested(school),0);
const heroPowerScore=()=>Math.floor(damage()*4 + maxWall()*1.35 + p.level*55 + totalInvestedSkills()*18 + stationData.reduce((sum,row)=>sum+station(row[0])*20,0));
function renderSkillTreeBlock(school,compact=false){
 const invested=schoolInvested(school), schoolArt={Marksman:'battle',Arcanist:'runes',Guardian:'fortress',Prospector:'research'};
 const nodes=skills[school].map(([id,name,desc],i)=>{
  const rank=skill(id),need=1+i*3,prior=i===0||skill(skills[school][i-1][0])>0;
  const locked=!prior||p.level<need,full=rank>=5,afford=p.points>=1;
  const state=full?'mastered':locked?'locked':rank?'learned':afford?'available':'waiting';
  const label=full?'MASTERED':locked?(!prior?'LEARN PREVIOUS NODE':'UNLOCKS AT LEVEL '+need):!afford?'NEED 1 SKILL POINT':rank?'UPGRADE TALENT':'UNLOCK TALENT';
  const pips=Array.from({length:5},(_,j)=>`<i class="${j<rank?'filled':''}" aria-hidden="true"></i>`).join('');
  return `<article class="talent-node ${state}" data-node="${id}" aria-label="${name}, rank ${rank} of 5">
    <div class="talent-node-connector" aria-hidden="true"></div>
    <div class="talent-node-head"><span class="talent-node-seal"><span class="pixel-symbol pixel-symbol-${schoolArt[school]}" aria-hidden="true"></span></span>
      <div><small>PATH ${String(i+1).padStart(2,'0')} · ${i===0?'FOUNDATION':'LEVEL '+need}</small><h3>${name}</h3></div><span class="talent-node-state" aria-hidden="true">${full?'✦':locked?'🔒':rank?'✧':'◇'}</span></div>
    <p>${desc}</p><div class="talent-node-rank"><div class="talent-gems">${pips}</div><strong>${rank} / 5</strong></div>
    <button type="button" data-action="skill:${id}" ${locked||full||!afford?'disabled':''}>${label} ${(!locked&&!full&&afford)?'· 1 POINT':''}</button>
  </article>`;
 }).join('');
 return section(`${school.toUpperCase()} · ${invested} INVESTED POINTS`,`<div class="talent-board" data-school="${school}">
   <div class="talent-board-banner"><span>${schoolIcons[school]} ${school} Ascendancy</span><small>FOLLOW THE CONNECTED TALENT PATH</small></div>
   <div class="talent-tree ${compact?'compact-tree':''}">${nodes}</div>
   <div class="talent-board-footer">✦ Each node has five ranks · New talents require their preceding node and hero level ✦</div>
 </div>`);
}
function renderHeroHall(){
  const pct=meterPct(p.xp,lvlNeed());
  const stats=[
    ['POWER',fmt(heroPowerScore())],
    ['DAMAGE',fmt(damage())],
    ['ATTACK SPEED',attackInterval().toFixed(2)+'s'],
    ['WALL HP',fmt(maxWall())],
    ['CRIT CHANCE',heroCritChance()+'%'],
    ['BEST WAVE',fmt(p.best)]
  ];
  const bonuses=[
    ['GOLD','+'+goldBonusPct()+'%'],
    ['XP','+'+xpBonusPct()+'%'],
    ['LOOT','+'+dropBonusPct()+'%'],
    ['CRIT DMG',heroCritDamage()+'%'],
    ['GEAR COST','-'+discountPct()+'%']
  ];
  const columns=['Marksman','Arcanist','Guardian','Prospector'];
  const names={Marksman:'MARKSMAN',Arcanist:'ARCANIST',Guardian:'GUARDIAN',Prospector:'PROSPECTOR'};
  const icons={Marksman:'🏹',Arcanist:'✧',Guardian:'♜',Prospector:'✦'};
  let selectedRow=null,selectedSchoolName='Marksman',selectedIndex=0;
  for(const school of columns){
    skills[school].forEach((row,i)=>{if(row[0]===heroSelectedSkill){selectedRow=row;selectedSchoolName=school;selectedIndex=i;}});
  }
  if(!selectedRow){selectedRow=skills.Marksman[0];selectedSchoolName='Marksman';selectedIndex=0;heroSelectedSkill=selectedRow[0];}
  const selectedRank=skill(selectedRow[0]);
  const selectedNeed=1+selectedIndex*3;
  const selectedPrior=selectedIndex===0||skill(skills[selectedSchoolName][selectedIndex-1][0])>0;
  const selectedLocked=!selectedPrior||p.level<selectedNeed;
  const selectedFull=selectedRank>=5;
  const selectedReady=!selectedLocked&&!selectedFull&&p.points>0;
  const selectedStatus=selectedFull?'MASTERED':!selectedPrior?'PREVIOUS TALENT REQUIRED':p.level<selectedNeed?'REQUIRES LEVEL '+selectedNeed:p.points<1?'NEED 1 SKILL POINT':'READY TO LEARN';
  const rows=Array.from({length:6},(_,i)=>{
    const cells=columns.map(school=>{
      const [id,name,desc]=skills[school][i];
      const rank=skill(id),need=1+i*3;
      const prior=i===0||skill(skills[school][i-1][0])>0;
      const locked=!prior||p.level<need,full=rank>=5,ready=!locked&&!full&&p.points>0;
      const state=full?'mastered':locked?'locked':rank?'learned':ready?'ready':'waiting';
      const pips=Array.from({length:5},(_,j)=>'<i class="'+(j<rank?'lit':'')+'"></i>').join('');
      return `<td class="hall-chart-cell hall-school-${school.toLowerCase()} state-${state}${heroSelectedSkill===id?' is-selected':''}">
        <div class="hall-chart-node">
          <button type="button" class="hall-skill-name" data-hero-inspect="${id}" title="${desc}" aria-label="${name}, ${school}, rank ${rank} out of 5">${name}</button>
          <div class="hall-skill-bottom"><span class="hall-gems" aria-label="${rank} of 5 ranks">${pips}</span><button type="button" data-action="skill:${id}" class="hall-rank-buy" ${ready?'':'disabled'} aria-label="Increase ${name} talent by one rank">${full?'✓':locked?'🔒':'+'}</button></div>
        </div>
      </td>`;
    }).join('');
    return `<tr><th scope="row" class="hall-row-index"><small>${String(i+1).padStart(2,'0')}</small><span>${i===0?'BASE':'LV '+(1+i*3)}</span></th>${cells}</tr>`;
  }).join('');
  const headers=columns.map(school=>`<th scope="col" class="hall-school-heading hall-school-${school.toLowerCase()}"><span>${icons[school]} ${names[school]}</span><small>${schoolInvested(school)} / 30 ranks</small></th>`).join('');
  const bannerOptions=p.banners.map((name,i)=>`<button type="button" data-banner="${name}" class="hall-banner-choice hue-${i%4}${p.activeBanner===name?' selected':''}" aria-pressed="${p.activeBanner===name}">
      <span class="hall-flag" aria-hidden="true"><span>♛</span></span><span class="hall-banner-name">${name}</span>${p.activeBanner===name?'<small>EQUIPPED</small>':''}
    </button>`).join('');
  return `<div class="hall-compact" aria-label="Primal Knight Hero Hall">
    <section class="hall-top">
      <div class="hall-champion">
        <div class="hall-portrait"><img src="assets/hero_front.png?v=064" alt="Primal Knight in crimson armor, facing forward"></div>
        <div class="hall-champion-copy"><small>THE LONE DEFENDER</small><h2>Primal Knight</h2><div class="hall-level-line"><b>LEVEL ${p.level}</b><span>${fmt(p.xp)} / ${fmt(lvlNeed())} XP</span></div><div class="meter hall-xp-track"><div style="width:${pct}%"></div></div></div>
      </div>
      <div class="hall-summary">
        <div class="hall-section-cap"><span>✦ CHAMPION OVERVIEW</span><small>LIVE STATS</small></div>
        <div class="hall-stat-matrix">${stats.map(([title,value])=>`<div class="hall-stat"><small>${title}</small><b>${value}</b></div>`).join('')}</div>
        <div class="hall-bonus-line"><span class="hall-bonus-label">BONUSES</span>${bonuses.map(([title,value])=>`<span class="hall-bonus"><small>${title}</small> <strong>${value}</strong></span>`).join('')}</div>
      </div>
    </section>
    <section class="hall-doctrines" aria-label="Auto-cast combat disciplines">
      <div class="hall-doctrine-head"><div><small>⚔ HERO COMBAT DEPTH · ONE ACTIVE DISCIPLINE</small><h2>Battle Doctrines</h2><p>Choose one battle style. Your champion automatically casts its signature ability whenever an eligible target is on the field. Free to switch and no new currency required.</p></div><strong>✦ ${chosenDoctrine().school.toUpperCase()} ACTIVE</strong></div>
      <div class="hall-doctrine-grid">${Object.values(combatDoctrineData).map(d=>{
       const locked=p.level<d.level,selected=p.combatDoctrine===d.id;
       return `<button class="hall-doctrine-choice hall-doctrine-${d.id}${selected?' selected':''}${locked?' locked':''}" type="button" data-action="doctrine:${d.id}" ${locked?'disabled':''} aria-pressed="${selected}" aria-label="${d.name}, ${locked?'requires hero level '+d.level:selected?'active combat doctrine':'select this combat doctrine'}">
         <span class="hall-doctrine-etching" aria-hidden="true"></span>
         <span class="hall-doctrine-copy"><small>${d.school.toUpperCase()} · ${d.cooldown}s BASE COOLDOWN</small><strong>${d.name}</strong><em>${d.short}</em><span>${d.description}</span></span>
         <span class="hall-doctrine-state">${locked?'LEVEL '+d.level+' UNLOCK':selected?'EQUIPPED':'EQUIP'}</span>
       </button>`;
      }).join('')}</div>
      <p class="hall-doctrine-footnote">Abilities scale from existing training, talents and rune sockets. Cast timing is configurable below; changing disciplines never instantly triggers another ability.</p>
      ${renderDoctrineTactics()}
    </section>
    <section class="hall-passives" aria-label="Choose one passive combat ability">
      <div class="combat-build-head"><strong>✧ PASSIVE COMBAT TRAIT · ONE ACTIVE</strong><small>Free to switch · one passive only</small></div>
      <div class="hall-passive-grid">${Object.values(combatPassiveData).map(passive=>{
        const selected=p.combatPassive===passive.id,locked=p.level<passive.level;
        return `<button class="hall-passive-choice${selected?' selected':''}" type="button" data-action="passive:${passive.id}" ${locked?'disabled':''} aria-pressed="${selected}"><small>${passive.school.toUpperCase()} · LEVEL ${passive.level}</small><strong>${passive.name}</strong><span>${passive.short}</span><em>${locked?'LEVEL LOCKED':selected?'EQUIPPED':'EQUIP PASSIVE'}</em></button>`;
      }).join('')}</div>
      <p>Passives reward different tactics rather than stacking together. Hunter amplifies precise arrows, Conductor specializes lightning, and Sentinel protects the wall. You can pair any passive with any active doctrine.</p>
    </section>
    ${renderCombatLoadouts()}
    <section class="hall-cosmetics" aria-label="Cosmetic banners">
      <div class="hall-cosmetics-title"><span>♛ THE BANNER WARDROBE</span><small>Collected cosmetics · tap a standard to equip it</small></div>
      <div class="hall-banner-rack">${bannerOptions}</div>
    </section>
    <section class="hall-skills" aria-label="Skill chart">
      <div class="hall-chart-title"><div><span>✧ THE FOUR PATHS</span><h2>Skill Ascendancy Chart</h2></div><div class="hall-points-counter"><strong>${fmt(p.points)}</strong><small>SKILL POINTS</small></div></div>
      <div class="hall-inspect" aria-live="polite"><div class="hall-inspect-copy"><small>${selectedSchoolName.toUpperCase()} · RANK ${selectedRank}/5 · ${selectedStatus}</small><strong>${selectedRow[1]}</strong><span>${selectedRow[2]}</span></div><button class="hall-inspect-buy" data-action="skill:${selectedRow[0]}" ${selectedReady?'':'disabled'}>${selectedFull?'MASTERED':selectedReady?'INVEST 1 POINT':'LOCKED'}</button></div>
      <div class="hall-chart-scroll"><table class="hall-chart-table"><thead><tr><th class="hall-row-corner">RANK</th>${headers}</tr></thead><tbody>${rows}</tbody></table></div>
      <p class="hall-chart-footnote">✦ Every column has its own progression. Learn the preceding talent and reach the displayed hero level to unlock the next row. Tap any talent name for details; press + to invest.</p>
    </section>
  </div>`;
}
function renderTreeFocus(){
 const school=selectedSchool in skills?selectedSchool:'Marksman';
 return `${highlight('Tree Focus · '+school,'Spend points in a dedicated full-width talent view. Switch disciplines any time.','✧')}
 <div class="filter-bar hero-hall-filter" role="group" aria-label="Skill discipline">${Object.keys(skills).map(s=>`<button class="hall-school-pill ${selectedSchool===s?'selected':''}" data-school="${s}">${schoolIcons[s]} <span>${s}</span><small>${schoolInvested(s)} pts</small></button>`).join('')}</div>
 <div class="tree-focus-head"><div><small>HERO PATHS</small><h3>${school} Discipline</h3><p>Each rank costs 1 Skill Point. Unlock later nodes by leveling up and learning at least one rank of the preceding node.</p></div><div class="tree-focus-points">${currencyGlyph.points} <strong>${fmt(p.points)}</strong><span>UNSPENT POINTS</span></div></div>
 ${renderSkillTreeBlock(school,false)}
 ${section('BUILD DIRECTION',`<div class="tree-focus-notes"><div class="bonus-tile"><small>OFFENSE</small><strong>${fmt(damage())}</strong><p>Marksman and Arcanist increase pressure and crowd control.</p></div><div class="bonus-tile"><small>SURVIVAL</small><strong>${fmt(maxWall())}</strong><p>Guardian improves wall integrity and stabilizes runs.</p></div><div class="bonus-tile"><small>ECONOMY</small><strong>+${goldBonusPct()}%</strong><p>Prospector improves the pace of your overall account progression.</p></div></div>`)}
 `;
}

function slotCard(slot){
 const g=equippedGear(slot),label=gearSlotLabels[slot],cost=g?gearCost(g):0;
 const name=g?gearTitle(g):'Empty slot',rarity=g?rarities[g.rarity]:'EMPTY';
 return `<section class="armory-slot armory-${slot}" aria-label="${label} equipment slot">
  <button class="armory-slot-select" type="button" data-gear-slot="${slot}" aria-label="${label}: ${name}. Tap to choose an item.">
    <span class="armory-slot-label">${label}</span>
    <span class="armory-slot-gem ${g?'has-gear rarity-outline-'+g.rarity:'is-empty'}">${forgePixelIcon("gear_"+slot)}</span>
    <span class="armory-slot-copy"><small class="${g?'rarity-'+g.rarity:'empty-rarity'}">${rarity}</small><strong>${name}</strong><em>${g?'+'+g.plus+' / 50':'Tap to equip'}</em></span>
  </button>
  ${g?`<button class="armory-enhance" type="button" data-action="enhance:${g.id}" ${g.plus>=50||p.gold<cost?'disabled':''}>${g.plus>=50?'MAXED':`+1 · 🟡${fmt(cost)}`}</button>`:''}
 </section>`;
}
function renderArmoryShowcase(){
 const left=['helm','chest','gauntlets','legs','boots','charm'],right=['amulet','ring1','ring2','ring3','ring4'];
 return `<section class="armory-showcase" aria-label="Eleven equipment slots surrounding the front-facing hero">
   <div class="armory-scene-heading">✦ THE LONE DEFENDER · THE ROYAL FORGE ✦</div>
   <div class="armory-column armory-column-left">${left.map(slotCard).join('')}</div>
   <div class="armory-hero-stage"><img src="assets/hero_front.png?v=063" alt="Primal Knight front-facing red-hooded armored champion"><span>LEVEL ${p.level} · PRIMAL KNIGHT</span></div>
   <div class="armory-column armory-column-right">${right.map(slotCard).join('')}</div>
 </section>
 <div class="armory-wardrobe-bar"><div><strong>YOUR COLLECTION</strong><small>${p.inventory.length} / ${inventoryCap} items · Nine rarities · Equipped items protected</small></div><button type="button" data-gear-slot="all">OPEN FULL INVENTORY <span aria-hidden="true">›</span></button></div>
 <p class="armory-note">✦ Tap an equipment position to view only that category, including all four interchangeable ring positions. Enhance or sell unwanted equipment in your inventory.</p>`;
}
function renderArmoryDrawer(){
 const drawer=$('armoryDrawer');if(!drawer)return;
 if(tab!=='equipment'||!armoryDrawerSlot){drawer.hidden=true;drawer.innerHTML='';return;}
 drawer.hidden=false;
 const all=armoryDrawerSlot==='all',category=all?'ALL EQUIPMENT':gearSlotLabels[armoryDrawerSlot];
 const items=p.inventory.filter(g=>all||g.slot===(ringSlots.includes(armoryDrawerSlot)?'ring':armoryDrawerSlot)).sort((a,b)=>b.rarity-a.rarity||b.plus-a.plus||gearTitle(a).localeCompare(gearTitle(b)));
 const current=!all?equippedGear(armoryDrawerSlot):null;
 const groupMarkup=rarities.map((rarity,i)=>({rarity,i,items:items.filter(g=>g.rarity===i)})).filter(g=>g.items.length).reverse().map(group=>`
 <section class="armory-rarity-group rarity-group-${group.i}" aria-label="${group.rarity} equipment">
  <h3><span class="armory-rarity-sigil rarity-${group.i}">◆</span>${group.rarity.toUpperCase()} <small>${group.items.length} ${group.items.length===1?'ITEM':'ITEMS'}</small></h3>
  <div class="armory-inventory-grid">${group.items.map(g=>{
   const inUse=Object.values(p.equipped).includes(g.id),active=ringSlots.includes(armoryDrawerSlot)?p.equipped[armoryDrawerSlot]===g.id:inUse,price=gearSellPrice(g),cost=gearCost(g);
   return `<article class="armory-inventory-item rarity-outline-${g.rarity}" data-item-id="${g.id}">
    <div class="armory-item-icon">${forgePixelIcon("gear_"+g.slot)}</div>
    <div class="armory-item-details"><small class="rarity-${g.rarity}">${rarities[g.rarity]} · ${gearSlotLabels[g.slot]}</small><strong>${gearTitle(g)}</strong><em>Enhancement +${g.plus} / 50 ${inUse?'· CURRENTLY EQUIPPED':''}</em></div>
    <div class="armory-item-buttons"><button type="button" data-action="equip:${g.id}" ${active?'disabled':''}>${active?'✓ EQUIPPED':'EQUIP'}</button><button type="button" data-action="enhance:${g.id}" ${g.plus>=50||p.gold<cost?'disabled':''}>${g.plus>=50?'MAXED':`UPGRADE · 🟡${fmt(cost)}`}</button><button type="button" class="armory-sell-item" data-gear-sell="${g.id}" ${inUse?'disabled title="Unequip before selling"':''}>${inUse?'EQUIPPED · SAFE':`SELL · 🟡${fmt(price)}`}</button></div>
   </article>`;}).join('')}</div>
 </section>`).join('');
 const rarityCounts=rarities.map((name,i)=>({name,i,count:p.inventory.filter(g=>g.rarity===i&&canSellGear(g)).length}));
 drawer.innerHTML=`<div class="armory-drawer-header"><button type="button" data-gear-back class="armory-drawer-back">‹ BACK TO HERO</button><div class="armory-drawer-title"><small>THE ROYAL ARMORY</small><h2>${category}</h2><span>${items.length} ITEMS · SORTED BY RARITY</span></div><div class="armory-drawer-gold">🟡 ${fmt(p.gold)}</div></div>
 <div class="armory-drawer-scroll" id="armoryDrawerScroll">
  ${!all?`<div class="armory-current"><span>YOUR CURRENT ${category}</span><strong>${current?gearTitle(current)+' · +'+current.plus:'EMPTY · READY TO EQUIP'}</strong>${current?`<button type="button" data-gear-unequip="${armoryDrawerSlot}">UNEQUIP ${category}</button>`:''}</div>`:''}
  <div class="armory-salvage"><div class="armory-salvage-heading"><div><small>THE SALVAGE COUNTER</small><h3>Sell gear by rarity</h3><p>Select one or more rarities. Bulk selling applies to <b>all equipment categories and ring slots</b> and never sells equipped items.</p></div><span>🟡 GOLD RETURNS</span></div>
    <div class="armory-rarity-options" role="group" aria-label="Select equipment rarities to sell">${rarityCounts.map(r=>`<label class="armory-rarity-choice rarity-choice-${r.i} ${r.count===0?'no-items':''}"><input type="checkbox" data-sell-rarity="${r.i}" ${armorySellRarities.has(r.i)?'checked':''} ${r.count===0?'disabled':''}><span class="rarity-${r.i}">${r.name}</span><small>${r.count}</small></label>`).join('')}</div>
    <div class="armory-salvage-actions"><button type="button" data-gear-bulk-sell id="armoryBulkSell">CHOOSE RARITIES TO SELL</button><span id="armoryBulkSummary">Equipped gear is always protected.</span></div>
    ${lastGearSale?`<div class="armory-undo"><span>Last sale: ${lastGearSale.items.length} item(s) for 🟡${fmt(lastGearSale.gold)}</span><button type="button" data-gear-undo ${p.gold<lastGearSale.gold||p.inventory.length+lastGearSale.items.length>inventoryCap?'disabled':''}>UNDO LAST SALE</button></div>`:''}
  </div>
  <div class="armory-items-header"><h3>${all?'ALL STORED EQUIPMENT':category+' COLLECTION'}</h3><p>Highest rarity first · Tap Equip to change your hero's loadout.</p></div>
  ${groupMarkup||`<div class="armory-empty"><strong>No equipment in this category yet.</strong><p>Defend the wall to collect gear. Empty slots can remain unequipped.</p></div>`}
 </div>`;
 refreshBulkSalePreview();
}
function refreshBulkSalePreview(){
 const button=$('armoryBulkSell'),description=$('armoryBulkSummary');if(!button||!description)return;
 const selected=p.inventory.filter(g=>armorySellRarities.has(g.rarity)&&canSellGear(g));
 const gold=selected.reduce((total,g)=>total+gearSellPrice(g),0);
 button.disabled=selected.length===0;
 button.textContent=selected.length?`SELL ${selected.length} ITEMS · 🟡 ${fmt(gold)}`:'SELECT RARITIES TO SELL';
 description.textContent=selected.length?`${selected.length} unequipped items across all slots · ${fmt(gold)} Gold`:'Equipped gear is always protected.';
}
function completeGearSale(items){
 const allowed=items.filter(g=>p.inventory.some(i=>i.id===g.id)&&canSellGear(g));if(!allowed.length){notice('NO UNEQUIPPED GEAR TO SELL');return;}
 const amount=allowed.reduce((total,g)=>total+gearSellPrice(g),0),ids=new Set(allowed.map(g=>g.id));
 p.inventory=p.inventory.filter(g=>!ids.has(g.id));p.gold+=amount;
 lastGearSale={items:allowed.map(g=>({...g})),gold:amount};save();refreshHUD();renderPanel();
 notice('SOLD '+allowed.length+' ITEM'+(allowed.length>1?'S':'')+' · +'+fmt(amount)+' GOLD');
}
function handleArmoryClick(target){
 if(target.dataset.gearBack!==undefined){armoryDrawerSlot=null;armorySellRarities.clear();renderArmoryDrawer();return;}
 if(target.dataset.gearUnequip){const slot=target.dataset.gearUnequip;delete p.equipped[slot];save();refreshHUD();renderPanel();notice(gearSlotLabels[slot]+' SLOT UNEQUIPPED');return;}
 if(target.dataset.gearSell){const g=p.inventory.find(x=>x.id===target.dataset.gearSell);if(!canSellGear(g))return;
   if((g.rarity>=4||g.plus>0)&&!confirm(`Sell ${gearTitle(g)} (+${g.plus}) for ${fmt(gearSellPrice(g))} Gold?`))return;
   completeGearSale([g]);return;}
 if(target.dataset.gearBulkSell!==undefined){const items=p.inventory.filter(g=>armorySellRarities.has(g.rarity)&&canSellGear(g));if(!items.length)return;
   const amount=items.reduce((total,g)=>total+gearSellPrice(g),0);
   if(!confirm(`Sell ${items.length} unequipped item(s) for ${fmt(amount)} Gold? Equipped items will NOT be sold.`))return;
   completeGearSale(items);return;}
 if(target.dataset.gearUndo!==undefined){if(!lastGearSale)return;const {items,gold}=lastGearSale;
   if(p.gold<gold||p.inventory.length+items.length>inventoryCap){notice('NOT ENOUGH GOLD OR INVENTORY SPACE TO UNDO');return;}
   p.gold-=gold;p.inventory.push(...items);lastGearSale=null;save();refreshHUD();renderPanel();notice('LAST SALE REVERSED');return;}
 if(target.dataset.action){action(target.dataset.action);return;}
}
function trainCostAt(row,lv){
 const [id,,,base,mul]=row;
 return Math.floor(base*(1+lv*.075+lv*lv*.004)*Math.pow(1+(mul-1)*.07,Math.min(lv,120))*Math.pow(1.002,Math.max(0,lv-120)));
}
function trainBatchQuote(row,limit=10){
 let level=t(row[0]),remaining=p.essence,cost=0,count=0;
 while(count<limit&&level<row[5]){
  const price=trainCostAt(row,level);
  if(price>remaining)break;
  remaining-=price;cost+=price;level++;count++;
 }
 return {count,cost};
}
function renderPowerHeader(kind){
 const isTraining=kind==='training';
 const trainingTotal=training.reduce((sum,row)=>sum+t(row[0]),0);
 const researchTotal=research.reduce((sum,row)=>sum+res(row[0]),0);
 const trainingMax=training.reduce((sum,row)=>sum+row[5],0);
 const researchMax=research.reduce((sum,row)=>sum+row[5],0);
 return `<div class="ascension-shell ${isTraining?'ascension-training':'ascension-research'}">
  <div class="ascension-scene" aria-hidden="true"></div>
  <div class="ascension-copy">
   <span class="ascension-kicker">${isTraining?'✦ THE ETERNAL ASCENT':'✧ THE ROYAL ARCHIVES'}</span>
   <h2>${isTraining?"The Knight's Forge":'Research the Kingdom'}</h2>
   <p>${isTraining?'Invest Hero Essence in the knight you command. Every rank endures.':'Spend Knowledge on permanent efficiencies, better rewards, and the art of advancement.'}</p>
  </div>
  <div class="ascension-treasury">
   <div class="ascension-money ${isTraining?'primary':''}"><small>🔷 HERO ESSENCE</small><strong>${fmt(p.essence)}</strong></div>
   <div class="ascension-money ${!isTraining?'primary':''}"><small>📖 KNOWLEDGE</small><strong>${fmt(p.knowledge)}</strong></div>
   <div class="ascension-money"><small>💠 PRIMAL SIGILS</small><strong>${fmt(p.sigils)}</strong></div>
  </div>
  <div class="ascension-progress"><span>${isTraining?'TRAINING RANKS':'COMPLETED RESEARCH'}</span><b>${fmt(isTraining?trainingTotal:researchTotal)} <small>/ ${fmt(isTraining?trainingMax:researchMax)}</small></b>
  <div class="ascension-progress-track"><i style="width:${meterPct(isTraining?trainingTotal:researchTotal,isTraining?trainingMax:researchMax)}%"></i></div></div>
 </div>`;
}
const forgePixelPatterns={"power":"..........sw./.........swh./........swh../.......swh.../......swh..../.....swh...../....swh....../...swh......./..gssg......./.ggg........./.ggr........./..rr........./.............","haste":"............/...ww......./..wwww....../.wwshww...../wwsshwww..../.wsshhwww.../..ssshwwww../...ssshwww../....ssshww../.....ssshw../......ssss../.......ss.../............","crit":"............./....rrrrr..../...rwwwwwr.../..rwrrrrrwr../..rwrwwrwr../..rwrssrwr../..rwrwwrwr../..rwrrrrrwr../...rwwwwwr.../....rrrrr..../......s....../......s....../.............","critDmg":"............/...rrrrrr.../..rrwwwwrr../.rrwwwwwwrr./.rwsrwwrswr./.rwsrwwrswr./.rwwwwwwwwr./.rwwrrrrwwr./..rrrssrrr../...rrssrr.../...rrrrrr.../....r..r..../............","pierce":"..........ss./.........sss./........ssww./.......ssww../......ssww.../...ggsssww.../..gggsss..../..gsssgg...../...sss......./..ss........./.ss........../ss.........../............","range":"............/............/....s......./...swwwwwws./.sggghhhhhhs./...swwwwwws./....s......./............/...s......./..sws......./.ss..s....../............/............","multishot":"............./.....s....../....swwwws../.ggghhhhhhs./....swwwws../.....s....../.....s....../....swwwws../.ggghhhhhhs./....swwwws../.....s....../....swwwws../.ggghhhhhhs.","boss":"............./...g.....g.../.ggg...ggg.../.gwg...gwg.../.ggggggggg.../.ggrgggrgg.../.ggggggggg.../.gwwwwwwwg.../.ggggggggg.../..gghghgg..../..ggggggg..../............./.............","shock":"......gg...../.....ghg...../....ghg....../...ghg......./..ghggggg..../...ghhhgg..../.....ghg...../....ghg....../...ghg......./..ghg......../.ghg........./..g........../.............","fort":"....sssss..../...swwwwws.../.sssswwsssss./.swwswwswws./.swwswwswws./.swwswwswws./.swwwwwwws./.swwshswws./.sswwhwwss../..sswhwss.../...sssss..../....sss....../.....s.......","regen":"............/..cc....cc../.cccc..cccc./.cwwcccccwc./.cwwwwwwwwc./.cwwwccwwwc./.cwwccccwwc./..cwwccwwc../...cwwwwc.../....cwwc..../.....cc...../............/............","resist":"............/...ss..ss.../..ssssssss../..swsswsws../..swwwwwws../..swwwwwws../..sswsswss../..swwwwwws../..swwwwwws../..ssssssss../..sggggggs../..ssssssss../............","gold":"............/...gggggg.../..ggghhhgg../.gghggghhgg./.ghgggggghg./.ghgggggghg./.ghgggggghg./.ghgggggghg./.gghggghhgg./..ggghhhgg../...gggggg.../............/............","xp":"............/............/.swwwwwws.../.swwsswws.../.swwsswws.../.swwsswws.../.swwsswws.../.swwsswws.../.swwsswws.../.swwsswws.../.ssssssss.../............/............","essence":"......cc...../.....ccbc..../....cbbbbc.../...cbbwwbbc../..cbbwwwwbbc./.cbbwwwwwwbc./.cbbbbwwbbbc./..cbbbbbbbc../...cbbbbbcc../....cbbbc..../.....cbc...../......c....../............","loot":"............/............/..gggggggg../.gwwwwwwwwg./.gggggggggg./.ssggssggss./.swwwwwwwws./.swwwhhwwws./.swwwhhwwws./.swwwwwwwws./.ssssssssss./............/............","excavation":"............./..ssssss...../.sswwwwss..../..s....ss..../.......ss..../.......ss..../.......ss..../.......ss..../.......ss..../.....ggssgg../.....gggggg../............./............."};
Object.assign(forgePixelPatterns,{"masonry":"............./..sssssssss../..swwswwsws../..sssssssss../..swwwwwwws../..swwswswws../..sssssssss../..swwwwwwws../..swwswswws../..sssssssss../..sgggggggs../..sssssssss../.............","calibration":"............./......g....../...g..g..g.../...ggggggg.../..gwwwwwwwg../..gw.....wg../gggw..g..wggg/..gw.....wg../..gwwwwwwwg../...ggggggg.../...g..g..g.../......g....../.............","attunement":"............./......c....../.....cwc...../...ccwbwcc.../..cwbbbbbwc../..cwbbwbbwc../..cbbbwbwwc../..cwwbbwbbc../..cwbbbbbwc../...ccwbwcc.../.....cwc...../......c....../.............","almanac":"............./..sssssssss../..swssswsss../..swswwwwss../..swswwwwss../..swswwwwss../..swswhwwss../..swswwwwss../..swswwwwss../..swswwwwss../..swwwwwwws../..sssssssss../.............","distillation":"............./.....sss...../.....sws...../.....sws...../....sswss..../...swwwwws.../..swwwbwwws../..swwbbbwws../..sbbbbbbbs../...sbbbbbs.../...ssbbbss.../....sssss..../.............","appraisal":"............./......g....../......g....../..ggggggggg../....g.g.g..../..ggg.g.ggg../..ghg.g.ghg../..ggg.g.ggg../......g....../.....ggg...../....ggggg..../...ggggggg.../............."});
Object.assign(forgePixelPatterns,{"ballista":"............./............./..g.......g../..s.......s../.s.........s./.hwwssrsswwh./..ggggghhhhwh/...h..s..h.../......s....../......r....../.....hhh...../....sssss..../.............","cryo":"......w....../.....ccc...../....bbwbb..../....ccwcc..../.c.bbwwbbb.../...bbbwwbb.c./...cccwccc.../....bbwbb..../..w.ccwcc.w../.....bbb...../...sssssss.../..sssssssss../....ggggg....","midas":"............./.h..ggggg..h./...ghhhhhg.../..gghwr.hhg../..gh.grg.hg../..gh.grg.hg../..gh.grg.hg../..ghh.rwhhg../.g.gghhhhg.g./....ggggg..../....sssss..../...sssssss.../....ggggg....","thunder":"........h..../.......h...../..c....h..c../....cchcc..../.b.ssggsss.b./....bbbggw.../...ccccchc.../....ssshs..../.....gs....../.....hs....../....h.s....../...sssssss.../....ggggg....","gravity":"............./....cccwc..../..ccbbbbbcc../..hbsssssbc../.cbbs...ssbc./.cbs.bkk.sbc./.cbs.krk.sbg./.cbs.kkk.sbc./.cbss...ssbc./..cbbssssbc../..cchbbbbcc../....ccccc..../.............","health":"............./..........ks./...rrr.rrks../..rrwrrrksr../..rrrrrksrr../...rrrksrr.../...rrrksrr.../....rksrr..../....ksrr...../...ks.r....../..ks........./.....g.g...../......g......","speed":"............./............./..sssssssss../...sssssss.../....bbbbb..../...rccbccr.../..s...b...s../....w.b.w..../.....wbw...../......w....../......b....../......g....../....ggggg....","damage":"............./...ws....sw../....ws..sw.../.....wssw..../......sw...../.....kwws..../....swk.ws.../...sw..k.ws../..rrrrrrrrr../...rrrrrrr.../....rrrrr..../....sssss..../...g.....g...","armor":"............./....sssss..../..sssssssrs../..ssbbbbrss../..ssbbbbrss../...ssbbhss.../...sscrcss.../....ssrss..../....srwss..../.....sss...../......s....../..g.......g../............."});
Object.assign(forgePixelPatterns,{"gear_helm":"......h....../.....rrr...../....rrhrr..../...ssshsss.../..sswwhwwss../..sswwhwwss../..sskkrkkss../..sgkkhkkgs../...ssshsss.../...ssshsss.../....skkks..../............./.............","gear_amulet":"............./.h.........h./.g.........g./.g.........g./..g.......g../..h.......h../..g..ggg..g../...gggwggg.../...ggbwbgg.../....gchcg..../.....ggg...../......h....../.............","gear_chest":"............./............./...sssssss.../..ssssgssss../.ssswwgwwsss./.sshwwgwwhss./..sshhrhhss../..ssswgwsss../...sswgwss.../...sssssss.../....skkks..../....sssss..../.............","gear_legs":"............./..ggggggggg../..ssssrssss../..sssssssss../...sssssss.../..shss.shss../..shws.shws../..shws.shws../..shws.shws../..shws.shws../..shss.shss../..kkkk.kkkk../.sssss.sssss.","gear_boots":"............./............./..ssss.ssss../..hwws.hwws../..hwws.hwws../..hwws.hwws../..hwws.hwws../..hsss.hsss../.sssss.sssss./.sssss.sssss./kkkkkk.kkkkkk/hhhhhh.hhhhhh/.............","gear_gauntlets":"............./.....h.h...../...h.s.s.h.../...s.s.s.s.../...s.s.s.s.../...ggggggg.../...swwwwws.../...swrrrws.../...swwhwws.../...swwwwws.../...sssssss.../...kkkkkkk.../.............","gear_charm":"............./....ggggg..../...ssswsss.../..sgsssssgs../..ssrrrrrss../..ssrrrrrss../...sshhhss.../...ssscsss.../....sssss..../....sshss..../.....ggg...../............./.............","gear_ring1":"............./............./.....ggg...../....grwrg..../...ghrrrrg.../....grrrg..../....ghhhg..../...ghh.hhg.../...gh...hg.../...ghhkhhg.../....ghkhg..../.....ggg...../.............","gear_ring2":"............./............./.....ggg...../....gbwbg..../...ghbbbbg.../....gbbbg..../....ghhhg..../...ghh.hhg.../...gh...hg.../...ghhkhhg.../....ghkhg..../.....ggg...../.............","gear_ring3":"............./............./.....ggg...../....gcwcg..../...ghccccg.../....gcccg..../....ghhhg..../...ghh.hhg.../...gh...hg.../...ghhkhhg.../....ghkhg..../.....ggg...../.............","gear_ring4":"............./............./.....ggg...../....ghwhg..../...ghhhhhg.../....ghhhg..../....ghhhg..../...ghh.hhg.../...gh...hg.../...ghhkhhg.../....ghkhg..../.....ggg...../.............","gear_ring":"............./............./.....ggg...../....grwrg..../...ghrrrrg.../....grrrg..../....ghhhg..../...ghh.hhg.../...gh...hg.../...ghhkhhg.../....ghkhg..../.....ggg...../.............","rune_ember":"............./......g....../.......r...../.....g......./...g.rrrrg.../...rrrrrrr.../...rrhhhrr.../..ggghhhggg../...rrhhhrr.../...ggwwwgg.../....ggggg..../.....rrr...../.............","rune_frost":"......w....../......b....../..c...b...c../...c..b..c.../....c.w.c..../.....cwc...../wbbbwwhwwbbbw/.....cwc...../....c.w.c..../...c..b..c.../..c...b...c../......b....../......w......","rune_fortune":"............./....ggggg..../..gghhhhhgg../..ghhgwghhg../.ghhg.r.ghhg./.ghg.grg.ghg./.ghw.grg.whg./.ghg.grg.ghg./.ghhg.r.ghhg./..ghhgwghhg../..gghhhhhgg../....ggggg..../.............","rune_storm":"............./.......ccc.../..c....c..c../.......c...../......c....../....ccccc..../....bbbbb..../.......b...../......wb...../......b....b./.....b......./....cb......./....b........"});
function forgePixelIcon(id){
 const alias={discount:'gold',fusion:'essence',interest:'gold',bounties:'boss',studies:'xp',siegebreaker:'boss',guardianOath:'fort',goldenTouch:'gold',Offense:'power',Techniques:'multishot',Defense:'fort',Economy:'gold',Legacy:'boss'};
 const key=forgePixelPatterns[id]?id:(alias[id]||'power');
 const colors={s:'#626b79',w:'#e8f0e2',h:'#ffedbc',g:'#e5a947',r:'#c64a47',c:'#56bdad',b:'#4f91d9',k:'#1c2834'};
 const lines=forgePixelPatterns[key].split('/');
 let pixels='';
 for(let y=0;y<lines.length;y++)for(let x=0;x<lines[y].length;x++){
  const char=lines[y][x],fill=colors[char];if(fill)pixels+='<rect x="'+(6+x*4)+'" y="'+(6+y*4)+'" width="4" height="4" fill="'+fill+'"/>';
 }
 return '<svg class="forge-pixel-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" role="img" aria-label="'+key+' pixel art icon" shape-rendering="crispEdges">'+pixels+'</svg>';
}

function renderAscensionChronicle(){
 const highest=Math.max(0,...Object.values(p.bestByTier||{}));
 const icons={vanguard:'critDmg',bastion:'masonry',sunder:'pierce',epoch:'attunement',volley:'multishot'};
 const owned=ascensionPaths.reduce((sum,row)=>sum+ascRank(row[0]),0);
 const capacity=ascensionPaths.reduce((sum,row)=>sum+row[4],0);
 const markup=ascensionPaths.map(row=>{
  const [id,name,desc,,max,unlockWave]=row;
  const rank=ascRank(id),cost=ascCost(row),unlocked=ascUnlocked(row),maxed=rank>=max,affordable=unlocked&&!maxed&&p.sigils>=cost;
  return `<article class="ascension-upgrade forge-upgrade-row ascension-endgame-row ${unlocked?'':'ascension-locked'}" data-ascension-row="${id}" aria-label="${name} permanent mastery">
   <div class="ascension-emblem">${forgePixelIcon(icons[id])}</div>
   <div class="ascension-upgrade-copy"><div class="ascension-upgrade-name"><strong>${name}</strong><small>${rank} / ${max}</small></div><p>${desc}</p>
    <div class="ascension-rank-track" role="progressbar" aria-label="${name} rank" aria-valuenow="${rank}" aria-valuemin="0" aria-valuemax="${max}"><span style="width:${meterPct(rank,max)}%"></span></div></div>
   <div class="ascension-action-cell"><div class="ascension-next-cost">${!unlocked?'WAVE '+fmt(unlockWave):maxed?'MASTERED':`💠 ${fmt(cost)}`}</div>
    <div class="ascension-action-buttons"><button type="button" data-action="ascension:${id}" ${affordable?'':'disabled'}>${!unlocked?'🔒':maxed?'MAX':'+1'}</button></div>
   </div>
  </article>`;
 }).join('');
 return `<section class="forge-ascension-chamber" aria-label="Ascension Chronicle">
  <div class="forge-category-head">
   <span class="forge-category-crest">${forgePixelIcon('epoch' in forgePixelPatterns?'epoch':'attunement')}</span>
   <div class="forge-category-heading"><small>✧ BEYOND THE FIRST CENTURY</small><h3>Ascension Chronicle</h3><p>Five new permanent routes. Revisit old tiers, break distant milestones and become worthy of wave ${formatWave(MAX_WAVE)}.</p></div>
   <div class="forge-category-total"><b>${fmt(owned)}</b><small>/ ${fmt(capacity)} ranks</small></div>
  </div>
  <div class="forge-ascension-rows">${markup}</div>
  <div class="forge-ascension-footer"><span>Best milestone reached: <b>${fmt(highest)}</b> / ${formatWave(MAX_WAVE)}</span><span>Unlock each mastery at its listed wave in <b>any tier</b>. Purchase with Primal Sigils.</span></div>
 </section>`;
}
// Alpha 0.11.7 — finite, one-time Sigil accounting from real milestone definitions.
// This projection does not grant anything or imply that every tier is reachable.
function sigilMilestoneAmount(tier,wave){
 const prize=tierMilestone(tier,wave);
 if(prize.kind==='century')return 12+tier*3;
 return ['sigils','deepSigils','path','eternal','frontier','dominion','legacy','tier'].includes(prize.kind)?prize.amount:0;
}
function sigilLedgerSummary(){
 let claimed=0,unclaimed=0,unlockedRemaining=0,lockedRemaining=0,achievements=0;
 for(let tier=1;tier<=MAX_TIER;tier++){
  for(const wave of tierMilestones(tier)){
   const value=sigilMilestoneAmount(tier,wave);
   if(!value)continue;
   achievements++;
   if(p.milestones[milestoneKey(tier,wave)])claimed+=value;
   else{
    unclaimed+=value;
    if(tier<=p.unlockedTier)unlockedRemaining+=value;
    else lockedRemaining+=value;
   }
  }
 }
 const earnedWatch=earlyWatchChapters.reduce((n,chapter,i)=>n+(p.firstWatchClaimed.includes(i)?chapter[5]:0),0);
 const unclaimedWatch=earlyWatchChapters.reduce((n,chapter,i)=>n+(p.firstWatchClaimed.includes(i)?0:chapter[5]),0);
 const future=unclaimed+unclaimedWatch;
 const legacyRequired=legacyPaths.reduce((sum,row)=>{
  for(let rank=lr(row[0]);rank<row[4];rank++)sum+=Math.ceil(row[3]*(1+rank*.35+Math.pow(rank,1.35)*.26));
  return sum;
 },0);
 const ascensionRequired=ascensionPaths.reduce((sum,row)=>{
  for(let rank=ascRank(row[0]);rank<row[4];rank++)sum+=Math.ceil(row[3]*(1+rank*.12+rank*rank*.018));
  return sum;
 },0);
 const oathRequired=sovereignOaths.reduce((sum,row)=>{
  for(let rank=oathRank(row[0]);rank<row[4];rank++)sum+=Math.ceil(row[3]*(1+rank*.08+rank*rank*.012));
  return sum;
 },0);
 return {held:p.sigils,claimed,earnedWatch,unclaimed,unclaimedWatch,unlockedRemaining,lockedRemaining,
  future,achievements,legacyRequired,ascensionRequired,oathRequired,
  remainingCosts:legacyRequired+ascensionRequired+oathRequired,eventualCapacity:p.sigils+future};
}
function renderSigilLedger(){
 const s=sigilLedgerSummary(),short=s.eventualCapacity<s.remainingCosts;
 return `<details class="sigil-ledger" aria-label="Permanent Sigil budget and remaining mastery costs">
  <summary>◇ PRIMAL SIGIL LEDGER <span>💠 ${fmt(s.held)} HELD · ${fmt(s.future)} UNCLAIMED</span></summary>
  <div class="sigil-ledger-body">
    <p>The kingdom's Sigils are awarded <b>once</b> through milestones and First Watch. Ordinary wave Gold, Essence and loot repeat; Sigils do not. This forecast cannot grant resources or unlock tiers.</p>
    <div class="sigil-ledger-grid">
     <div><small>HELD NOW</small><strong>${fmt(s.held)}</strong></div>
     <div><small>UNCLAIMED · ALL 30 TIERS</small><strong>${fmt(s.unclaimed)}</strong></div>
     <div><small>UNCLAIMED · FIRST WATCH</small><strong>${fmt(s.unclaimedWatch)}</strong></div>
     <div><small>REMAINING COST · ALL MASTERIES</small><strong>${fmt(s.remainingCosts)}</strong></div>
    </div>
    <p>Potential unclaimed tier rewards: ${fmt(s.unlockedRemaining)} in currently unlocked tiers; ${fmt(s.lockedRemaining)} in locked tiers. These require actual wave victories and are <b>not spendable now</b>.</p>
    <p>Remaining full-rank costs: Legacy ${fmt(s.legacyRequired)} · Ascension ${fmt(s.ascensionRequired)} · Sovereign Oaths ${fmt(s.oathRequired)}. Total held + unclaimed: ${fmt(s.eventualCapacity)} versus ${fmt(s.remainingCosts)} remaining rank costs. ${short?'The listed lifetime budget is insufficient for all remaining ranks at present.':'The listed lifetime budget is sufficient on paper, but obtaining each rank and final-wave victory is not guaranteed.'}</p>
  </div>
 </details>`;
}
function renderSovereignOaths(){
 const owned=sovereignOaths.reduce((sum,row)=>sum+oathRank(row[0]),0);
 const max=sovereignOaths.reduce((sum,row)=>sum+row[4],0);
 const lines=sovereignOaths.map(row=>{
  const [id,name,desc,,limit,tier,wave,icon]=row;
  const rank=oathRank(id),unlocked=oathUnlocked(row),cost=oathCost(row),maxed=rank>=limit,affordable=unlocked&&!maxed&&p.sigils>=cost;
  return `<article class="sovereign-oath ${unlocked?'':'sovereign-oath-locked'}" data-sovereign-oath="${id}">
    <span class="sovereign-oath-emblem">${forgePixelIcon(icon)}</span>
    <div class="sovereign-oath-info"><small>${unlocked?'✦ OATH UNSEALED':'🔒 TIER '+roman(tier)+' · WAVE '+formatWave(wave)}</small><strong>${name}</strong>
      <p>${desc}</p><div class="ascension-rank-track" role="progressbar" aria-label="${name} progress" aria-valuenow="${rank}" aria-valuemax="${limit}"><span style="width:${meterPct(rank,limit)}%"></span></div></div>
    <div class="sovereign-oath-buy"><span>${rank} / ${limit}</span><small>${maxed?'MASTERED':unlocked?'💠 '+fmt(cost):'SEALED'}</small>
      <button type="button" data-action="oath:${id}" ${affordable?'':'disabled'}>${!unlocked?'🔒':maxed?'MAX':'+1'}</button>
    </div>
  </article>`;
 }).join('');
 return `<section class="sovereign-oath-chamber" aria-label="Sovereign Oaths">
    <div class="sovereign-oath-head"><div><small>✧ THE SOVEREIGN CHAMBER · OUTER DOMINION INVESTMENTS</small><h3>Sovereign Oaths</h3>
       <p>Four expensive endgame disciplines. Unlock these at specific Dominion Trial milestones, then invest Primal Sigils to permanently specialize.</p></div>
       <div class="dominion-codex-total"><strong>${owned}</strong><small>/ ${max} ranks</small></div></div>
    <div class="sovereign-oath-grid">${lines}</div>
    <div class="sovereign-oath-foot">The combined Oath, Legacy and Ascension costs are balanced against the finite Sigils across thirty 10,000-wave tiers.</div>
  </section>`;
}
function renderDominionCodex(){
 const owned=dominionTrials.reduce((s,row)=>s+Math.min(4,Number(p.dominionCrests[row.tier])||0),0);
 const statLabels={damage:'Hero damage',essence:'Essence rewards',boss:'Boss damage',wall:'Fortress health',knowledge:'Knowledge rewards',critical:'Critical power',healing:'Fortress repairs',runes:'Rune effects',armor:'Armor penetration',stations:'Station attacks',gold:'Gold income',xp:'Experience earned',all:'All-around might'};
 const sprite={damage:'power',essence:'essence',boss:'boss',wall:'fort',knowledge:'xp',critical:'critDmg',healing:'regen',runes:'attunement',armor:'pierce',stations:'ballista',gold:'gold',xp:'xp',all:'crit'};
 return `<section class="dominion-codex" aria-label="Dominion Crest archive">
   <div class="dominion-codex-head"><div><small>♛ THE OUTER DOMINIONS · TIERS XVII–XXX</small><h3>Dominion Crest Archive</h3>
   <p>Four permanent seals per territory. Each tier has its own trial and a unique passive power, earned at waves 250, 1,000, 5,000 and 10,000.</p></div><div class="dominion-codex-total"><strong>${owned}</strong><small>/ ${dominionTrials.length*4} seals</small><small>+${(dominionResonance()*100).toFixed(0)}% dmg</small></div></div>
   <div class="dominion-codex-grid">${dominionTrials.map(row=>{
    const rank=Math.min(4,Number(p.dominionCrests[row.tier])||0);
    return `<article class="dominion-codex-entry ${rank?'unlocked':''}" data-crest-tier="${row.tier}">
      <span class="dominion-codex-icon">${forgePixelIcon(sprite[row.stat]||'power')}</span>
      <div><small>TIER ${roman(row.tier)} · ${tierNames[row.tier-1]}</small><strong>${row.crest}</strong>
      <p>${statLabels[row.stat]||row.stat}: +${(rank*row.bonus*100).toFixed(1)}% / ${(row.bonus*400).toFixed(1)}% max</p></div>
      <span class="dominion-codex-rank">${rank}/4</span>
    </article>`;
   }).join('')}</div>
   <div class="dominion-codex-foot">Each claimed seal also adds <b>+3% global hero damage</b> and <b>+1% fortress health</b> through Dominion Resonance. Reach 56 seals for the strongest endgame build. The 14 Crests also have their own unique passive powers.</div>
 </section>`;
}
function renderTrainingLedger(){
 const groups=[
  {key:'Offense',icon:'battle',subtitle:'HIT HARDER',description:'Sharpen your attacks and critical strikes.',ids:['power','haste','crit','critDmg','pierce']},
  {key:'Techniques',icon:'skills',subtitle:'CONTROL THE FIELD',description:'Develop specialized strikes and projectiles.',ids:['range','multishot','boss','shock']},
  {key:'Defense',icon:'fortress',subtitle:'HOLD THE WALL',description:'Strengthen the fortress and withstand the horde.',ids:['fort','regen','resist']},
  {key:'Economy',icon:'research',subtitle:'GROW EVERY RUN',description:'Earn more resources and better battle rewards.',ids:['gold','xp','essence','loot']}
 ];
 const icons={
  power:'battle',haste:'power',crit:'battle',critDmg:'skills',pierce:'battle',
  range:'battle',multishot:'battle',boss:'suppression',shock:'runes',
  fort:'fortress',regen:'research',resist:'hero',
  gold:'runes',xp:'skills',essence:'power',loot:'gear'
 };
 function upgradeRow(row){
  const [id,name,desc,,,max]=row,rank=t(id),cost=trainCost(row),
  full=rank>=max,ready=!full&&p.essence>=cost,batch=full?{count:0,cost:0}:trainBatchQuote(row,10);
  return `<article class="ascension-upgrade forge-upgrade-row" data-train-row="${id}">
   <div class="ascension-emblem">${forgePixelIcon(id)}</div>
   <div class="ascension-upgrade-copy"><div class="ascension-upgrade-name"><strong>${name}</strong><small>${fmt(rank)} / ${fmt(max)}</small></div>
    <p>${desc}</p><div class="ascension-rank-track" role="progressbar" aria-label="${name} rank" aria-valuenow="${rank}" aria-valuemin="0" aria-valuemax="${max}"><span style="width:${meterPct(rank,max)}%"></span></div>
   </div>
   <div class="ascension-action-cell"><div class="ascension-next-cost">${full?'MASTERED':`🔷 ${fmt(cost)}`}</div>
    <div class="ascension-action-buttons">
     <button type="button" data-action="train:${id}" ${!ready?'disabled':''}>${full?'MAX':'+1'}</button>
     <button type="button" class="ascension-multi" data-action="trainBatch:${id}" ${batch.count<2?'disabled':''} aria-label="Train ${name} up to ten ranks">${batch.count>=2?'+'+batch.count:'×10'}</button>
    </div>
   </div>
  </article>`;
 }
 const groupMarkup=groups.map(group=>{
  const rows=training.filter(row=>group.ids.includes(row[0]));
  const invested=rows.reduce((sum,row)=>sum+t(row[0]),0);
  const capacity=rows.reduce((sum,row)=>sum+row[5],0);
  return `<section class="forge-category forge-category-${group.key.toLowerCase()}" aria-label="${group.key} training">
    <div class="forge-category-head"><span class="forge-category-crest">${forgePixelIcon(group.key)}</span>
      <div class="forge-category-heading"><small>${group.subtitle}</small><h3>${group.key}</h3><p>${group.description}</p></div>
      <div class="forge-category-total"><b>${fmt(invested)}</b><small>/ ${fmt(capacity)} ranks</small></div></div>
    <div class="forge-category-rows">${rows.map(upgradeRow).join('')}</div>
   </section>`;
 }).join('');
 const legacyMarkup=p.legacyUnlocked?legacyPaths.map(row=>{
  const [id,name,desc,,max]=row,rank=lr(id),cost=legacyCost(row),full=rank>=max,ready=!full&&p.sigils>=cost;
  return `<article class="ascension-upgrade forge-upgrade-row forge-legacy-row" data-legacy-row="${id}">
   <div class="ascension-emblem">${forgePixelIcon(id)}</div>
   <div class="ascension-upgrade-copy"><div class="ascension-upgrade-name"><strong>${name}</strong><small>${rank} / ${max}</small></div><p>${desc}</p>
    <div class="ascension-rank-track"><span style="width:${meterPct(rank,max)}%"></span></div></div>
   <div class="ascension-action-cell"><div class="ascension-next-cost">${full?'MASTERED':`💠 ${fmt(cost)}`}</div>
    <div class="ascension-action-buttons"><button type="button" data-action="legacy:${id}" ${!ready?'disabled':''}>${full?'MAX':'+1'}</button></div>
   </div></article>`;
 }).join(''):`<div class="ascension-legacy-gate"><span>✦</span><strong>Masteries are sealed</strong><p>Survive Tier I, Wave 15 to unlock three permanent Sigil-powered disciplines.</p></div>`;
 return `${renderPowerHeader('training')}
 <div class="forge-ledger">
  <div class="forge-ledger-head"><div><small>✦ THE KNIGHT'S FORGE</small><h2>All your training, one place</h2></div>
   <span>16 permanent upgrades · Four disciplines · No category switching</span></div>
  <div class="forge-all-categories">${groupMarkup}</div>
  <section class="forge-legacy-chamber" aria-label="Legacy Masteries">
   <div class="forge-category-head"><span class="forge-category-crest">${forgePixelIcon('Legacy')}</span>
    <div class="forge-category-heading"><small>✦ PRIMAL SIGIL INVESTMENTS</small><h3>Legacy Masteries</h3><p>Permanent powers earned through milestone progression.</p></div>
    <div class="forge-category-total"><b>${fmt(p.sigils)}</b><small>Sigils held</small></div>
   </div><div class="forge-legacy-rows">${legacyMarkup}</div>
  </section>
  ${renderAscensionChronicle()}
  ${renderSovereignOaths()}
  ${renderSigilLedger()}
  ${renderDominionCodex()}
  <div class="forge-ledger-note">🔷 Train up to ten ranks per tap. 💠 Legacy and Ascension use Primal Sigils. All purchases are permanent.</div>
 </div>`;
}
function renderResearchArchive(){
 const branches=[
  {id:'craft',glyph:'⚒',name:'CRAFT & DISCOVERY',label:'MASTERY OF THE WORKSHOP',ids:['discount','fusion','excavation']},
  {id:'treasury',glyph:'♛',name:'THE ROYAL TREASURY',label:'PROSPERITY OF THE KINGDOM',ids:['interest','bounties','studies']},
  {id:'bastion',glyph:'⚔',name:'BASTION SCIENCES',label:'DEFENSE & BATTLECRAFT',ids:['masonry','calibration','attunement']},
  {id:'guild',glyph:'✦',name:'SCHOLARS & GUILDS',label:'WISDOM & WEALTH',ids:['almanac','distillation','appraisal']}
 ];
 const wings=branches.map(branch=>{
  const rows=branch.ids.map(id=>{
   const row=research.find(x=>x[0]===id),
    [,,desc,,,max]=row,
    rank=res(id),
    cost=researchCost(row,p.research),
    completed=rank>=max,
    ready=!completed&&p.knowledge>=cost;
   return `<article class="archive-entry" data-research-row="${id}">
     <div class="archive-emblem">${forgePixelIcon(id)}</div>
     <div class="archive-details">
      <div class="archive-entry-top"><strong>${row[1]}</strong><small>${rank} / ${max}</small></div>
      <p>${desc}</p><div class="archive-progress" role="progressbar" aria-label="${row[1]} research progress" aria-valuemin="0" aria-valuenow="${rank}" aria-valuemax="${max}"><i style="width:${meterPct(rank,max)}%"></i></div>
     </div>
     <div class="archive-action"><small>${completed?'MASTERED':`📖 ${fmt(cost)}`}</small>
      <button type="button" data-action="research:${id}" ${ready?'':'disabled'}>${completed?'✓ MAX':'+ RESEARCH'}</button>
     </div>
    </article>`;
  }).join('');
  const invested=branch.ids.reduce((sum,id)=>sum+res(id),0);
  const total=branch.ids.reduce((sum,id)=>sum+research.find(x=>x[0]===id)[5],0);
  return `<section class="archive-school archive-branch-${branch.id}" aria-label="${branch.name}">
    <h3><span><em class="archive-branch-glyph" aria-hidden="true">${branch.glyph}</em> ${branch.name}</span><small>${branch.label} · ${invested} / ${total} RANKS</small></h3>
    ${rows}
   </section>`;
 }).join('');
 return `${renderPowerHeader('research')}
 <div class="archive-room">
  <div class="archive-headline"><div><small>✧ THE GRAND RESEARCH LEDGER</small><h2>Twelve royal discoveries</h2></div><p>Four research disciplines and twelve lasting discoveries. Spend Knowledge to fortify your kingdom, master combat, and accelerate each expedition.</p></div>
  <div class="archive-grid">${wings}</div>
  <div class="archive-seal">✦ ROYAL EDICT · ALL TWELVE RESEARCH PROJECTS ARE PERMANENT ✦</div>
 </div>`;
}
function renderPanel(){
 if(tab==='battle')return;
 const [title,asideTitle,description,motto]=tabInfo[tab]||tabInfo.hero;
 $('panel').dataset.theme=tab;
 $('panelTitle').textContent=title;$('asideTitle').textContent=asideTitle;$('asideDescription').textContent=motto;
 $('panelEyebrow').textContent='PRIMAL KNIGHT · '+(tab==='settings'?'GAME OPTIONS':hubLabels[Object.keys(hubs).find(key=>hubs[key].includes(tab))].toUpperCase()+' CHAMBER');
 $('asideIcon').className='pixel-symbol pixel-symbol-'+(tabIcons[tab]||'hero');
 const asidePic=$('asideIllustration');
 asidePic.innerHTML=`<img src="${chamberArt(tab)}" alt="Illustrated ${asideTitle} fantasy chamber" loading="eager" decoding="async">`;

 const hub=Object.keys(hubs).find(key=>hubs[key].includes(tab));
 $('subnav').hidden=tab==='hero';
 $('subnav').innerHTML=tab==='settings'?`<span class="tag">YOUR SAVED JOURNEY</span>`:hubs[hub].map(page=>`<button data-subtab="${page}" class="${tab===page?'selected':''}" aria-current="${tab===page?'page':'false'}">${page==='hero'?'♜':page==='skills'?'✧':page==='training'?'↟':page==='research'?'⚗':page==='equipment'?'⚒':page==='runes'?'◇':page==='stations'?'♜':'☠'} ${ {hero:'Hero Hall',skills:'Tree Focus',training:'Training',research:'Research',equipment:'Equipment',runes:'Rune Workshop',stations:'Stations',suppression:'Enemy Suppression'}[page]}</button>`).join('')+`<span class="chamber-help">Switch sections here · Back to battle ✕</span>`;
 let html=`<div class="chamber-mobile-art" aria-hidden="true"><img src="${chamberArt(tab)}" alt=""><div class="mobile-chamber-name"><small>✦ ${title}</small><b>${asideTitle}</b></div></div><div class="section-intro"><p class="lead">${description}</p><strong>${{skills:currencyGlyph.points+' '+fmt(p.points)+' POINTS',training:currencyGlyph.essence+' '+fmt(p.essence)+' ESSENCE',research:currencyGlyph.knowledge+' '+fmt(p.knowledge)+' KNOWLEDGE',equipment:currencyGlyph.gold+' '+fmt(p.gold)+' GOLD',runes:currencyGlyph.gold+' '+fmt(p.gold)+' GOLD',stations:currencyGlyph.gold+' '+fmt(p.gold)+' GOLD',suppression:currencyGlyph.knowledge+' '+fmt(p.knowledge)+' KNOWLEDGE'}[tab]||''}</strong></div>`;
 if(tab==='hero'){
  html='';
  html+=renderHeroHall();
 }
 if(tab==='skills'){
  html+=renderTreeFocus();
 }
 if(tab==='training'){ html=renderTrainingLedger(); }
 if(tab==='research'){ html=renderResearchArchive(); }
 if(tab==='equipment'){
  if(p.pendingGear.length)html+=`<div class="relic-vault" role="status"><div><strong>⚒ FIRST WATCH ARMORY · ${p.pendingGear.length} EARNED ITEMS</strong><p>Your equipment bag was full when First Watch granted these one-time rewards. Free room among the 200 pieces you own, then claim the protected equipment. Nothing is replaced automatically.</p></div><button class="wide-btn" data-action="claimGear" ${p.inventory.length>=inventoryCap?'disabled':''}>${p.inventory.length>=inventoryCap?'FREE EQUIPMENT SPACE TO CLAIM':'CLAIM EARNED EQUIPMENT'}</button></div>`;
  html+=renderArmoryShowcase();
 }
 if(tab==='runes'){
  html+=highlight('Socket. Combine. Ascend.','Place a rune in each equipped item. To fuse, collect three of the same family and tier.','◇');
  if(p.pendingRelics.length)html+=`<div class="relic-vault"><div><strong>✦ EARNED RUNE VAULT · ${p.pendingRelics.length} RESERVED RUNES</strong><p>Your rune pouch was full when you earned a Relic Hunt or milestone rune. Free a rune slot, then claim these protected, one-time rewards.</p></div><button class="wide-btn" data-action="claimRelics" ${p.runes.length>=240?'disabled':''}>${p.runes.length>=240?'FREE RUNE SPACE TO CLAIM':'CLAIM RESERVED RUNES'}</button></div>`;
  html+=section('EQUIPMENT SOCKETS',`<div class="cards">${gearSlots.map(slot=>{
   const equippedId=p.socketed[slot],r=p.runes.find(x=>x.id===equippedId);
   return `<div class="rune-socket"><strong><span class="rune-socket-emblem">${forgePixelIcon(r?"rune_"+r.type:"gear_"+slot)}</span>${gearSlotLabels[slot]}</strong><p>${r?`${runeNames[r.type][1]} Rune · Tier ${r.tier}`:'No rune socketed'}</p><button data-socket-slot="${slot}">${r?'CHANGE / REMOVE RUNE':'CHOOSE A RUNE'}</button></div>`;
  }).join('')}</div>`);
  if(runePickSlot){
   const options=p.runes.filter(r=>!Object.values(p.socketed).includes(r.id)||p.socketed[runePickSlot]===r.id);
   html+=`<div class="rune-picker" id="runePicker"><h3>Choose a rune for ${runePickSlot.toUpperCase()}</h3><button class="rune-option" data-socket-rune="${runePickSlot}:none">✕ Clear Socket</button>${options.map(r=>`<button class="rune-option" data-socket-rune="${runePickSlot}:${r.id}"><span class="rune-choice-icon">${forgePixelIcon("rune_"+r.type)}</span>${runeNames[r.type][1]} · Tier ${r.tier}${p.socketed[runePickSlot]===r.id?' · EQUIPPED':''}</button>`).join('')||'<p>No runes available. Survive waves to find more.</p>'}</div>`;
  }
  html+=section('RUNE COLLECTION · '+p.runes.length+' OWNED',cards(p.runes.map(r=>{
   const [sym,name,desc]=runeNames[r.type],used=Object.values(p.socketed).includes(r.id),same=p.runes.filter(x=>x.type===r.type&&x.tier===r.tier&&!Object.values(p.socketed).includes(x.id)).length,cost=Math.floor(85*r.tier*r.tier*(1-Math.min(.4,res('fusion')*.012))),can= same>=3&&r.tier<12&&p.gold>=cost&&!used;
   return card(`${sym} ${name} Rune`,desc+` · ${same}/3 matching un-equipped runes`,used?'SOCKETED':`TIER ${r.tier} / 12`,cost,r.tier>=12?'MAX TIER':used?'REMOVE FROM SOCKET FIRST':same<3?'COLLECT 3 TO FUSE':p.gold<cost?'MORE GOLD NEEDED':'FUSE 3 → +1 TIER','fuse:'+r.id,!can,'',r.tier/12*100);
  })));
 }
 if(tab==='stations'){
  html+=highlight('Defend beyond the bow','Each built station automatically contributes to the siege. Upgrade them permanently with Gold.','♜');
  html+=cards(stationData.map(row=>{const [id,sym,name,desc,,,max]=row,rank=station(id),cost=stationCost(row);return card(`${sym} ${name}`,desc,`RANK ${rank} / ${max}`,cost,rank>=max?'MAXED':p.gold<cost?'MORE GOLD NEEDED':rank===0?'BUILD STATION':'UPGRADE STATION','station:'+id,rank>=max||p.gold<cost)}));
 }
 if(tab==='suppression'){
  html+=highlight('Win before the enemy arrives','Research permanent weaknesses in enemy armor, movement, strength and vitality.','☠');
  html+=cards(suppression.map(row=>{const [id,name,desc,,,max]=row,rank=sup(id),cost=researchCost(row,p.suppression);return card(name,desc,`RESEARCH ${rank} / ${max}`,cost,rank>=max?'COMPLETE':p.knowledge<cost?'MORE KNOWLEDGE NEEDED':'WEAKEN ENEMIES','suppress:'+id,rank>=max||p.knowledge<cost)}));
 }
 if(tab==='settings'){
  html+=highlight('Your progress stays yours','Your save stays on this device. Export a copy before clearing browser data.','✦');
  html+=`<div class="setting-row"><span>Download a JSON backup of permanent progression</span><button class="wide-btn" data-action="export">EXPORT SAVE</button></div><div class="setting-row"><span>Restore a saved backup from your device (up to Tier XXX)</span><input id="importFile" aria-label="Import save backup" type="file" accept="application/json,.json"></div>${hasImportRecovery()?'<div class="setting-row"><span>Made an import by mistake? Your previous save is safely available.</span><button class="wide-btn" data-action="undoImport">UNDO LAST IMPORT</button></div>':''}<div class="setting-row"><span>Current combat: ${run.phase} · Autosaved on upgrades and wave clears</span><button class="wide-btn" data-action="save">SAVE NOW</button></div><p class="lead">Alpha 0.11.8 · Free to play · No outside subscriptions, analytics or purchases.</p>`;
 }
 // Keep the Sigil Ledger expanded while permanent ranks are purchased.
 // UI-only preference: no new save schema or persistent field.
 const panelContentEl=$('panelContent');
 const ledgerOpen=tab==='training'&&!!panelContentEl.querySelector?.('details.sigil-ledger')?.open;
 panelContentEl.innerHTML=html;
 if(ledgerOpen){const ledger=panelContentEl.querySelector?.('details.sigil-ledger');if(ledger)ledger.open=true;}
 if(tab==='equipment')renderArmoryDrawer();else{const drawer=$('armoryDrawer');if(drawer){drawer.hidden=true;drawer.innerHTML='';}}
 const imp=$('importFile');if(imp)imp.onchange=async ev=>{
  const file=ev.target.files?.[0];if(!file)return;
  try{
   if(file.size>10*1024*1024)throw Error('Backup file too large');
   const obj=JSON.parse(await file.text());validateProgressBackup(obj);
   if(!confirm('Replace your current progress with this backup? A recovery copy will be saved on this device.'))return;
   restoreProgressBackup(obj,true);
   initRun();run.speed=1;storedSpeed=1;syncBattleControls();
   showLobby();refreshHUD();renderPanel();notice('SAVE RESTORED · RECOVERY COPY STORED');
  }catch(error){notice('IMPORT FAILED · CURRENT SAVE PRESERVED');}
 };
}
function openTab(next,fromHub=false){
 // Hub navigation remembers the last page, but direct subtab selection must not
 // be mistaken for a hub when a page has the same name (Hero Overview).
 if(fromHub&&next in hubs)next=activeByHub[next];
 if(next==='skills')next='hero';
 if(next!=='settings'&&next!=='battle'&&!tabInfo[next])return;
 const previous=tab;tab=next;
 if(next!=='equipment'){armoryDrawerSlot=null;armorySellRarities.clear();}
 // This is the single authoritative screen state: CSS never lets the lobby cover a menu.
 $('app').dataset.view=next==='battle'?'battle':'menu';
 const hub=Object.keys(hubs).find(key=>hubs[key].includes(next));if(hub)activeByHub[hub]=next;
 for(let b of document.querySelectorAll('[data-hub]'))b.classList.toggle('selected',b.dataset.hub===hub);
 const preSiege=run.phase==='ready'||run.phase==='fallen'||run.phase==='completed';
 // The full-screen tier selector must not cover menus before the first siege.
 // Keep the selected difficulty and milestones available when returning to Battle.
 $('tierLobby').hidden=next!=='battle'||!preSiege;
 $('panel').hidden=next==='battle';
 if(next!=='battle'){
   // Continuous siege runs do not pause when a progression screen is opened.
   renderPanel();if(previous!==next)$('panelContent').scrollTop=0;
 }else if(preSiege){
   renderTierLobby();
 }
 refreshHUD();
}
function action(text){let[type,id]=text.split(':');if(type==='train'){let row=training.find(x=>x[0]===id),cost=trainCost(row);if(p.essence>=cost&&t(id)<row[5]){p.essence-=cost;p.training[id]=t(id)+1;run.maxHealth=maxWall();run.health=Math.min(run.health+12,run.maxHealth);}}
 else if(type==='trainBatch'){let row=training.find(x=>x[0]===id);if(row){const q=trainBatchQuote(row,10);if(q.count>=2){p.essence-=q.cost;p.training[id]=t(id)+q.count;run.maxHealth=maxWall();run.health=Math.min(run.maxHealth,run.health+12*q.count);notice('TRAINED '+q.count+' RANKS');}}}
 else if(type==='legacy'){let row=legacyPaths.find(x=>x[0]===id);if(row&&p.legacyUnlocked&&lr(id)<row[4]&&p.sigils>=legacyCost(row)){p.sigils-=legacyCost(row);p.legacy[id]=lr(id)+1;run.maxHealth=maxWall();run.health=Math.min(run.maxHealth,run.health+Math.round(run.maxHealth*.03));}}
 else if(type==='ascension'){
  const row=ascensionPaths.find(x=>x[0]===id);
  if(row&&ascUnlocked(row)&&ascRank(id)<row[4]){
   const cost=ascCost(row);
   if(p.sigils>=cost){const previous=run.maxHealth;p.sigils-=cost;p.ascension[id]=ascRank(id)+1;
    run.maxHealth=maxWall();if(id==='bastion')run.health=Math.min(run.maxHealth,run.health+Math.max(0,run.maxHealth-previous));
    notice(row[1].toUpperCase()+' RANK '+p.ascension[id]);
   }
  }
 }
 else if(type==='oath'){
  const row=sovereignOaths.find(x=>x[0]===id);
  if(row&&oathUnlocked(row)&&oathRank(id)<row[4]){
   const cost=oathCost(row);
   if(p.sigils>=cost){
    const previous=run.maxHealth;p.sigils-=cost;p.sovereignOaths[id]=oathRank(id)+1;
    run.maxHealth=maxWall();if(id==='sovereignAegis')run.health=Math.min(run.maxHealth,run.health+Math.max(0,run.maxHealth-previous));
    notice(row[1].toUpperCase()+' RANK '+p.sovereignOaths[id]);
   }
  }
 }
 else if(type==='doctrine'){if(chooseCombatDoctrine(id)){notice(chosenDoctrine().name+' SELECTED');refreshDoctrineHud();}else notice('DISCIPLINE LOCKED · RAISE HERO LEVEL');}
 else if(type==='tactic'){if(chooseDoctrineTactic(id))notice('AUTO CAST · '+doctrineTacticModes[id].name);else notice('AUTO CAST · CHANGE BETWEEN SIEGES ONLY');}
 else if(type==='passive'){if(chooseCombatPassive(id))notice(passiveTrait().name+' EQUIPPED');else notice('PASSIVE LOCKED · RAISE HERO LEVEL');}
 else if(type==='saveLoadout'){const ok=saveCombatLoadout(Number(id));notice(ok?'BATTLE LOADOUT SAVED':'INVALID LOADOUT SLOT');}
 else if(type==='applyLoadout'){
  const index=Number(id),status=loadoutReadiness(index);
  if(applyCombatLoadout(index)){notice('BATTLE LOADOUT EQUIPPED');refreshDoctrineHud();}
  else notice('CANNOT EQUIP · '+status.reason);
 }
 else if(type==='skill'){let found=Object.values(skills).flat().find(x=>x[0]===id);if(found&&p.points>0&&skill(id)<5){p.points--;p.skills[id]=skill(id)+1;run.maxHealth=maxWall();}}
 else if(type==='station'){let row=stationData.find(x=>x[0]===id),cost=stationCost(row);if(row&&p.gold>=cost&&station(id)<row[6]){p.gold-=cost;p.stations[id]=station(id)+1;}}
 else if(type==='research'){let row=research.find(x=>x[0]===id);if(row){const cost=researchCost(row,p.research);if(p.knowledge>=cost&&res(id)<row[5]){const oldMax=run.maxHealth;p.knowledge-=cost;p.research[id]=res(id)+1;if(id==='masonry'){run.maxHealth=maxWall();run.health=Math.min(run.maxHealth,run.health+Math.max(0,run.maxHealth-oldMax));}}}}
 else if(type==='suppress'){let row=suppression.find(x=>x[0]===id),cost=researchCost(row,p.suppression);if(row&&p.knowledge>=cost&&sup(id)<row[5]){p.knowledge-=cost;p.suppression[id]=sup(id)+1;}}
 else if(type==='equip'){
  let g=p.inventory.find(g=>g.id===id);
  if(g){
    const target=g.slot==='ring'?(ringSlots.includes(armoryDrawerSlot)?armoryDrawerSlot:ringSlots.find(k=>!p.equipped[k])||'ring1'):g.slot;
    for(const [slot,equippedId] of Object.entries(p.equipped))if(equippedId===g.id&&slot!==target)delete p.equipped[slot];
    p.equipped[target]=g.id;notice(gearTitle(g)+' EQUIPPED · '+gearSlotLabels[target]);
  }
 }
 else if(type==='enhance'){let g=p.inventory.find(g=>g.id===id);if(g&&p.gold>=gearCost(g)&&g.plus<50){p.gold-=gearCost(g);g.plus++;}}
 else if(type==='claimGear'){const amount=claimPendingGear();notice(amount?'RETRIEVED '+amount+' FIRST WATCH GEAR':'EQUIPMENT BAG FULL');}
 else if(type==='claimRelics'){const amount=claimPendingRelics();notice(amount?'RETRIEVED '+amount+' RESERVED RUNES':'RUNE POUCH FULL');}
 else if(type==='fuse'){let r=p.runes.find(x=>x.id===id);if(!r)return;let same=p.runes.filter(x=>x.type===r.type&&x.tier===r.tier&&!Object.values(p.socketed).includes(x.id));let cost=Math.floor(85*r.tier*r.tier*(1-Math.min(.4,res('fusion')*.012)));if(same.length>=3&&p.gold>=cost&&r.tier<12){p.gold-=cost;let ids=same.slice(0,3).map(x=>x.id);p.runes=p.runes.filter(x=>!ids.includes(x.id));p.runes.push({id:'r'+Date.now()+Math.random(),type:r.type,tier:r.tier+1});notice('RUNE FUSED TO TIER '+(r.tier+1));}}
 else if(type==='socket'){runePickSlot=id;renderPanel();return;}
 else if(type==='undoImport'){
  if(!confirm('Restore the progress saved just before the last import? Your current progress will be replaced.'))return;
  try{
   if(!undoProgressImport()){notice('NO IMPORT RECOVERY COPY');return;}
   initRun();run.speed=1;storedSpeed=1;syncBattleControls();
   showLobby();notice('PREVIOUS SAVE RESTORED');
  }catch(error){notice('RECOVERY FAILED · CURRENT SAVE PRESERVED');}
 }
 else if(type==='save'){notice(save()?'PROGRESS SAVED':'SAVE FAILED · EXPORT A BACKUP')}
 else if(type==='export'){let blob=new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='primal-knight-onslaught-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);return;}
 const scrollPane=$('panelContent'),keepScroll=scrollPane.scrollTop;
 save();refreshHUD();renderPanel();
 if(['train','trainBatch','legacy','ascension','oath','research'].includes(type))scrollPane.scrollTop=keepScroll;
}
// A ProMotion iPhone may request 120+ RAF callbacks/sec. Keep combat physics responsive
// but avoid re-painting the large layered pixel-art canvas more than 60 times/sec.
// Low-motion devices use 30Hz rendering without altering wave timers or earned rewards.
const reduceMotion=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function drawInterval(){
 if(document.hidden)return Infinity;
 if($('app').dataset.view==='menu')return 100;
 return reduceMotion?1000/30:1000/60;
}
// Battle controls do not alter earned progression or permanent save data.
const siegeActive=()=>run.phase==='fighting'||run.phase==='intermission';
function syncBattleControls(){
 const paused=siegeActive()&&run.speed===0;
 const selected=paused?storedSpeed:(run.speed===2?2:1);
 const speed=$('speedButton'),button=$('pauseButton'),status=$('battlePauseStatus');
 speed.textContent=selected+'×';
 speed.title=paused?'Resume speed: '+selected+'×':'Battle speed: '+selected+'×';
 button.textContent=paused?'▶':'Ⅱ';
 button.title=paused?'Resume siege':'Pause siege';
 button.ariaLabel=paused?'Resume battle':'Pause battle';
 button.ariaPressed=paused?'true':'false';
 if(status)status.hidden=!paused;
}
function cycleBattleSpeed(){
 if(siegeActive()&&run.speed===0){
  storedSpeed=storedSpeed===2?1:2;
  notice('PAUSED · RESUME SPEED '+storedSpeed+'×');
 }else{
  run.speed=run.speed===2?1:2;storedSpeed=run.speed;
  notice('BATTLE SPEED '+run.speed+'×');
 }
 syncBattleControls();
}
function toggleBattlePause(){
 if(!siegeActive())return false;
 if(run.speed){storedSpeed=run.speed;run.speed=0;notice('BATTLE PAUSED');}
 else{run.speed=storedSpeed===2?2:1;notice('BATTLE RESUMED · '+run.speed+'×');}
 syncBattleControls();
 return run.speed===0;
}
function pauseBattleInBackground(){
 save();
 if(siegeActive()&&run.speed>0){storedSpeed=run.speed;run.speed=0;syncBattleControls();}
}
function loop(tm){
 const dt=clamp(((tm-(loop.last||tm))/1000),0,.05);
 loop.last=tm;tick(dt);
 const interval=drawInterval();
 if(Number.isFinite(interval)&&(loop.lastDraw===undefined||tm-loop.lastDraw>=interval-.5)){
  draw();loop.lastDraw=tm;
 }
 if(tm-(loop.lastHud||0)>160){refreshHUD();loop.lastHud=tm}
 requestAnimationFrame(loop);
}
$('nav').addEventListener('click',e=>{let b=e.target.closest('[data-hub]');if(b)openTab(b.dataset.hub,true)});
$('subnav').addEventListener('click',e=>{let b=e.target.closest('[data-subtab]');if(b)openTab(b.dataset.subtab)});
$('panelContent').addEventListener('click',e=>{
 let target=e.target.closest('button');if(!target||target.disabled)return;
 if(target.dataset.gearSlot){armoryDrawerSlot=target.dataset.gearSlot;armorySellRarities.clear();lastGearSale=null;renderArmoryDrawer();return;}
 if(target.dataset.action){action(target.dataset.action);return;}
 if(target.dataset.goto){openTab(target.dataset.goto);return;}
 if(target.dataset.banner){if(p.banners.includes(target.dataset.banner)){p.activeBanner=target.dataset.banner;save();renderPanel();notice('BANNER EQUIPPED');}return;}
 if(target.dataset.heroInspect){heroSelectedSkill=target.dataset.heroInspect;const sc=$('panelContent');const y=sc.scrollTop;renderPanel();sc.scrollTop=y;return;}
 if(target.dataset.school){selectedSchool=target.dataset.school;renderPanel();return;}
 if(target.dataset.trainFilter){trainFilter=target.dataset.trainFilter;renderPanel();$('panelContent').scrollTop=0;return;}
 if(target.dataset.gearFilter){gearFilter=target.dataset.gearFilter;renderPanel();return;}
 if(target.dataset.socketSlot){runePickSlot=runePickSlot===target.dataset.socketSlot?null:target.dataset.socketSlot;renderPanel();return;}
 if(target.dataset.socketRune){let [slot,id]=target.dataset.socketRune.split(':');if(id==='none')delete p.socketed[slot];else if(p.runes.some(r=>r.id===id))p.socketed[slot]=id;runePickSlot=null;save();refreshHUD();renderPanel();notice(id==='none'?'RUNE REMOVED':'RUNE SOCKETED');return;}
});
const armoryDrawerEl=$('armoryDrawer');
armoryDrawerEl.addEventListener('click',e=>{const target=e.target.closest('button');if(!target||target.disabled)return;handleArmoryClick(target);});
armoryDrawerEl.addEventListener('change',e=>{const target=e.target.closest('[data-sell-rarity]');if(!target)return;const rarity=Number(target.dataset.sellRarity);if(target.checked)armorySellRarities.add(rarity);else armorySellRarities.delete(rarity);refreshBulkSalePreview();});
$('settingsButton').onclick=()=>openTab('settings');$('closePanel').onclick=()=>openTab('battle');
$('startButton').onclick=()=>{if(!$('tierLobby').hidden)enterSiege()};
$('launchTierButton').onclick=enterSiege;
$('exitRunButton').onclick=()=>{if(confirm('End this siege and return to the tier selection? Earned rewards and milestones are saved.'))retreatFromSiege()};
$('tierGrid').addEventListener('click',e=>{const b=e.target.closest('[data-tier]');if(!b||b.disabled)return;chosenTier=Number(b.dataset.tier);useWaystone=true;p.selectedTier=chosenTier;save();renderTierLobby();});
$('milestoneList').addEventListener('click',e=>{
 const council=e.target.closest('[data-war-council]');
 if(council&&!council.disabled&&council.dataset?.warCouncil==='apply'){
  const result=applyWarCouncil();
  notice(result?'WAR COUNCIL · COMBAT PAIR EQUIPPED':'WAR COUNCIL · CHANGE BLOCKED');
  const scroll=$('milestoneList').scrollTop;save();renderTierLobby();$('milestoneList').scrollTop=scroll;
  return;
 }



 const tactic=e.target.closest('[data-doctrine-tactic]');
 if(tactic&&typeof tactic.dataset?.doctrineTactic==='string'){
  if(tactic.disabled)return;
  const scroll=$('milestoneList').scrollTop;
  const applied=chooseDoctrineTactic(tactic.dataset.doctrineTactic);
  if(applied){save();notice('AUTO CAST · '+doctrineTacticModes[p.doctrineTactic].name+' STRATEGY SELECTED');}
  else notice('AUTO CAST · CHANGE BLOCKED');
  renderTierLobby();$('milestoneList').scrollTop=scroll;
  return;
 }
 const chest=e.target.closest('[data-war-chest]');
 if(chest&&typeof chest.dataset?.warChest==='string'){
  if(chest.disabled)return;
  const [kind,id]=chest.dataset.warChest.split(':');
  const list=$('milestoneList'),scroll=list.scrollTop,open=!!list.querySelector?.('details.war-chest')?.open;
  const purchased=purchaseWarChest(kind,id);
  notice(purchased?'WAR CHEST · PERMANENT RANK PURCHASED':'WAR CHEST · UPGRADE UNAVAILABLE');
  renderTierLobby();list.scrollTop=scroll;
  if(open){const section=list.querySelector?.('details.war-chest');if(section)section.open=true;}
  return;
 }
 const quartermaster=e.target.closest('[data-council-train]');
 if(quartermaster&&typeof quartermaster.dataset?.councilTrain==='string'){
  if(quartermaster.disabled)return;
  const id=quartermaster.dataset?.councilTrain,scroll=$('milestoneList').scrollTop;
  const bought=purchaseCouncilTraining(id);
  if(bought){save();refreshHUD();notice('QUARTERMASTER · '+councilTrainingDetails[id].role+' TRAINED');}
  else notice('QUARTERMASTER · UPGRADE UNAVAILABLE');
  renderTierLobby();$('milestoneList').scrollTop=scroll;
  return;
 }
 const preset=e.target.closest('[data-action^="applyLoadout:"]');
 if(preset&&!preset.disabled&&typeof preset.dataset?.action==='string'&&preset.dataset.action.startsWith('applyLoadout:')){
  const index=Number(preset.dataset.action.split(':')[1]),status=loadoutReadiness(index);
  if(applyCombatLoadout(index)){save();notice('BATTLE LOADOUT EQUIPPED');refreshHUD();}
  else notice('CANNOT EQUIP · '+status.reason);
  const scroll=$('milestoneList').scrollTop;renderTierLobby();$('milestoneList').scrollTop=scroll;
  return;
 }
 const b=e.target.closest('[data-start-mode]');if(!b)return;
 useWaystone=b.dataset.startMode==='waystone';
 const scroll=$('milestoneList').scrollTop;renderTierLobby();$('milestoneList').scrollTop=scroll;
});
$('speedButton').onclick=cycleBattleSpeed;
$('pauseButton').onclick=toggleBattlePause;
window.addEventListener('pagehide',pauseBattleInBackground);
document.addEventListener('visibilitychange',()=>{if(document.hidden)pauseBattleInBackground();});
initRun();syncBattleControls();refreshHUD();showLobby();if(window.__PK_TEST__)window.__PK_TEST_TOOLS__={bossTelegraph,syncBattleControls,cycleBattleSpeed,toggleBattlePause,pauseBattleInBackground,hasImportRecovery,validateProgressBackup,restoreProgressBackup,undoProgressImport,safetyBackupKey,completeWave,beginWave,enterSiege,showLobby,retreatFromSiege,buildSiegeReport,renderSiegeReport,finishSiege,siegeReport:()=>lastSiegeReport,run:()=>run,p:()=>p,renderTierLobby,renderPanel,openTab,action,factionWarCouncil,trainingCouncil,warCouncilFit,warCouncilPlan,applyWarCouncil,renderWarCouncil,doctrineTacticModes,normalizeDoctrineTactic,chooseDoctrineTactic,doctrineTacticEligible,renderDoctrineTactics,warChestOffers,purchaseWarChest,renderWarChest,councilTrainingOffers,purchaseCouncilTraining,renderCouncilQuartermaster,councilRecoveryAdvice,renderCouncilRecovery,combatPassiveData,passiveTrait,chooseCombatPassive,combatLoadoutNames,normalizeCombatLoadouts,saveCombatLoadout,loadoutReadiness,applyCombatLoadout,renderCombatLoadouts,combatDoctrineData,chosenDoctrine,chooseCombatDoctrine,doctrineCooldown,castCombatDoctrine,advanceCombatDoctrine,refreshDoctrineHud,awardFirstWatch,renderFirstWatch,storeEarnedRune,storeEarnedGear,claimPendingGear,gearSellPrice,completeGearSale,renderArmoryDrawer,maxWall,damage,socketValue,xpAdd,researchCost,randomGear,tierMilestone,tierMilestones,tierAdvanceWave,oathRank,oathCost,oathUnlocked,sigilMilestoneAmount,sigilLedgerSummary,renderSigilLedger,encounterDirector,encounterUnit,formationPosition,activeEncounterThreat,renderEncounterIntel,renderSiegeCodex,refreshHUD,advanceBattleVisuals,drawInterval,draw,loop,encounterKnowledgeBonus,encounterAdvice,allowedSpecialist,shieldAuraReduction,thornWardReduction,rallyAuraFactor,threatPriority,chapterChallenge,relicChallenge,awardRelicChallenge,claimPendingRelics,attackInterval,encounterSpecialBonus,isSiegeBoss,sapperBlastDamage,specialEnemyMotion,bossCounterplay,specialistCast,specialistCounterplay,awardChapterChallenge,dominionTrial,dominionBonus,dominionSeals,dominionResonance,tierThreat,outerDepthPressure,tierReward,renderFirstWatch,renderDominionPreview,earlyWatchChapters,waveThreat,waveArmor,enemySpeedFactor,waveEnemyCount,waystoneForTier,ascCost,ascUnlocked,projectileCount,spawnEnemy,hurt,tick,rewardMilestone};requestAnimationFrame(loop);
})();