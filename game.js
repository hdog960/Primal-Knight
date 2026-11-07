/* Primal KnIght - Onslaught — Alpha 0.15.13. Progression & First Watch Balancing - Essence Price Ladder: armor-aware hero magic and real nine-build encounter balance coverage and saved progression. Zero external dependencies.
   Original game, systems and art. All spending uses earned in-game currencies.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id),fmt=n=>{n=Math.max(0,Math.floor(n));return n>=1e12?(n/1e12).toFixed(2)+'T':n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'K':n.toLocaleString()},clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rnd=(a,b)=>a+Math.random()*(b-a);
const training=[
 ['power','Might','Base damage increases by 2 per rank.',8,1.125,1200],['haste','Reflexes','Attack interval decreases over time.',8,1.155,500],['fort','Fortitude','Maximum fortress health +12 per rank; first 6 ranks also reduce incoming breach damage by 4% each (24% maximum).',10,1.12,1000],['crit','Precision','Improves critical strike chance.',18,1.16,220],['critDmg','Lethality','Increases critical damage.',19,1.15,500],['pierce','Armor Pierce','Ignore a portion of enemy armor.',18,1.15,250],['regen','Stone Mending','Regenerate fortress HP between waves with diminishing returns at high ranks.',24,1.16,500],['gold','Greed','Increase gold earned from slain enemies.',12,1.14,1500],['xp','Scholarship','Gain more hero experience from battle.',14,1.16,800],['essence','Attunement','Increase Hero Essence earned per wave.',30,1.17,600],['range','Longshot','Increase projectile travel speed.',14,1.15,350],['multishot','Splitshot','Every 8th rank adds an extra attack projectile.',55,1.22,40],['boss','Executioner','Increase damage dealt to bosses.',43,1.18,500],['loot','Treasure Sense','Improves drop chances after completed waves.',32,1.19,180],['resist','Rampart','Reduce damage enemies inflict on the wall.',43,1.18,200],['shock','Static Charge','Every rank boosts chance of a chain lightning effect.',66,1.2,150]
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
function defaultState(){return {version:3,level:1,xp:0,points:0,gold:520,essence:180,knowledge:60,highestWave:1,training:{},skills:{},stations:{},research:{},suppression:{},inventory:[{id:'starterhelm',slot:'helm',rarity:0,plus:0},{id:'starteramulet',slot:'amulet',rarity:0,plus:0},{id:'starterchest',slot:'chest',rarity:0,plus:0},{id:'startercharm',slot:'charm',rarity:0,plus:0}],equipped:{helm:'starterhelm',amulet:'starteramulet',chest:'starterchest',charm:'startercharm'},runes:[{type:'ember',tier:1,id:'seedember'},{type:'fortune',tier:1,id:'seedfortune'}],socketed:{},best:0,clears:0,selectedTier:1,unlockedTier:1,bestByTier:{},milestones:{},chapterChallenges:{},relicHunts:{},explorationFinds:{},cartographerOaths:{},echoReturns:{},atlasSeals:{},pendingRelics:[],pendingGear:[],ascension:{},dominionCrests:{},sovereignOaths:{},firstWatchClaimed:[],siegeHistory:[],siegeHistorySeq:0,battleSeconds:0,uniqueClears:0,sigils:0,legacy:{},legacyUnlocked:false,combatDoctrine:'vanguard',combatPassive:'hunter',doctrineTactic:'rapid',combatLoadouts:[null,null,null],banners:['Crimson Standard'],activeBanner:'Crimson Standard'};}
const siegeHistoryLimit=24;
const historyEarnedKeys=['firstClears','milestones','lostSignals','oaths','echoes','atlasSeals'];
 // Alpha 0.14.0: keep the original readable character JSON and save key.
 // An older checksum-verified checkpoint protects it from truncated or broken saves.
 const storageKey='primal_knight_onslaught_save_v1';
 const recoveryCheckpointKey='primal_knight_onslaught_checkpoint_v1';
 const damagedOriginalKey='primal_knight_onslaught_damaged_original_v1';
 const recoveryCadence=12;
 function recoveryDigest(raw){
  let hash=2166136261;
  for(let i=0;i<raw.length;i++){hash^=raw.charCodeAt(i);hash=Math.imul(hash,16777619);}
  return (hash>>>0).toString(16).padStart(8,'0');
 }
// A later client may add character fields this build cannot safely migrate.
// Never load and then overwrite a later version; keep the exact original bytes.
function newerCharacterSave(raw){
 if(typeof raw!=='string'||raw.length>10*1024*1024)return false;
 try{
  const obj=JSON.parse(raw);
  return validSaveObject(obj)&&Number.isInteger(obj.version)&&obj.version>defaultState().version;
 }catch{return false;}
}
 function parseCharacterRaw(raw){
  if(typeof raw!=='string'||!raw||raw.length>10*1024*1024)return null;
  try{
   const candidate=JSON.parse(raw);
   if(!validSaveObject(candidate)||!Array.isArray(candidate.inventory))return null;
   if(candidate.version!==undefined&&(!Number.isInteger(candidate.version)||candidate.version<0||candidate.version>defaultState().version))return null;
   validateProgressBackup({...defaultState(),...candidate});
   for(const field of ['level','xp','points','gold','essence','knowledge',
      'sigils','best','highestWave','unlockedTier']){
    if(candidate[field]!==undefined&&
       (typeof candidate[field]!=='number'||!Number.isFinite(candidate[field])||
        candidate[field]<0))return null;
   }
   return candidate;
  }catch{return null;}
 }
 function readRecoveryCheckpoint(){
  try{
   const raw=localStorage.getItem(recoveryCheckpointKey);
   if(!raw)return null;
   const envelope=JSON.parse(raw);
   if(!validSaveObject(envelope)||envelope.schema!==1||
      typeof envelope.raw!=='string'||typeof envelope.digest!=='string'||
      recoveryDigest(envelope.raw)!==envelope.digest)return null;
   const data=parseCharacterRaw(envelope.raw);
   return data?{raw:envelope.raw,data,createdAt:envelope.createdAt}:null;
  }catch{return null;}
 }
 function writeRecoveryCheckpoint(raw){
  if(!parseCharacterRaw(raw))return false;
  try{
   const contents=JSON.stringify({schema:1,createdAt:Date.now(),
    digest:recoveryDigest(raw),raw});
   localStorage.setItem(recoveryCheckpointKey,contents);
   return localStorage.getItem(recoveryCheckpointKey)===contents;
  }catch{return false;}
 }
 let p,saveRecoveryStatus='healthy',saveWriteBlocked=false,
  lastVerifiedSaveRaw=null,lastObservedPrimaryRaw=null,unrecoverableSaveRaw=null,recoveryWrites=0,
  recoverySnapshotFailed=false,saveWriteIssue=null;
 try{
  const raw=localStorage.getItem(storageKey),data=parseCharacterRaw(raw);
  lastObservedPrimaryRaw=raw;
  if(data){p={...defaultState(),...data};lastVerifiedSaveRaw=raw;}
  else if(raw!=null){
   unrecoverableSaveRaw=raw;
   // A newer-version primary is neither corrupt nor permission to downgrade
   // from an older checkpoint. Stay read-only and retain original bytes.
   if(newerCharacterSave(raw)){
    p=defaultState();saveWriteBlocked=true;saveRecoveryStatus='future';
   }else{
    const checkpoint=readRecoveryCheckpoint();
    if(checkpoint){
     p={...defaultState(),...checkpoint.data};
     lastVerifiedSaveRaw=checkpoint.raw;saveRecoveryStatus='recovered';
    }else{
     p=defaultState();saveWriteBlocked=true;saveRecoveryStatus='blocked';
    }
   }
  }else p=defaultState();
 }catch{p=defaultState();saveWriteBlocked=true;saveRecoveryStatus='blocked';}for(const k of ['training','skills','stations','research','suppression','socketed','equipped'])p[k]??={};p.runes??=[];p.bestByTier??={};p.milestones??={};p.chapterChallenges??={};p.relicHunts??={};p.explorationFinds=validSaveObject(p.explorationFinds)?p.explorationFinds:{};p.cartographerOaths=validSaveObject(p.cartographerOaths)?p.cartographerOaths:{};p.echoReturns=validSaveObject(p.echoReturns)?p.echoReturns:{};p.atlasSeals=validSaveObject(p.atlasSeals)?p.atlasSeals:{};p.pendingRelics=Array.isArray(p.pendingRelics)?p.pendingRelics:[];p.pendingGear=Array.isArray(p.pendingGear)?p.pendingGear:[];p.ascension??={};p.dominionCrests??={};p.sovereignOaths??={};p.firstWatchClaimed=Array.isArray(p.firstWatchClaimed)?p.firstWatchClaimed:[];
p.siegeHistory=normalizeSiegeHistory(p.siegeHistory);
p.siegeHistorySeq=Math.max(safeHistoryCount(p.siegeHistorySeq),...p.siegeHistory.map(e=>e.id),0);
p.battleSeconds=Math.max(0,Number(p.battleSeconds)||0);p.uniqueClears=Math.max(0,Number(p.uniqueClears)||0);p.sigils??=0;p.legacy??={};p.banners??=['Crimson Standard'];p.activeBanner??='Crimson Standard';p.unlockedTier=clamp(Number(p.unlockedTier)||1,1,30);if(p.milestones['16:20'])p.unlockedTier=Math.max(p.unlockedTier,17);p.selectedTier=clamp(Number(p.selectedTier)||1,1,p.unlockedTier);p.legacyUnlocked??=false;p.combatDoctrine=['vanguard','storm','aegis'].includes(p.combatDoctrine)&&(p.combatDoctrine==='vanguard'||Number(p.level)>=(p.combatDoctrine==='storm'?3:5))?p.combatDoctrine:'vanguard';p.combatPassive=['hunter','conductor','sentinel'].includes(p.combatPassive)&&(p.combatPassive==='hunter'||Number(p.level)>=(p.combatPassive==='conductor'?3:5))?p.combatPassive:'hunter';p.doctrineTactic=['rapid','horde','crisis'].includes(p.doctrineTactic)?p.doctrineTactic:'rapid';
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
 if(data&&data.version!==undefined){
  if(!Number.isInteger(data.version)||data.version<0)throw Error('Invalid character save version');
  if(data.version>defaultState().version)throw Error('Newer save version requires a newer game build');
 }
 if(!validSaveObject(data)||!Array.isArray(data.inventory)||!validSaveObject(data.equipped)||!validSaveObject(data.training))throw Error('Invalid backup structure');
 if(!data.inventory.every(g=>validSaveObject(g)&&typeof g.slot==='string')||data.inventory.length>1000)throw Error('Invalid inventory');
 for(const key of ['equipped','training','skills','stations','research','suppression','socketed','bestByTier','milestones','chapterChallenges','relicHunts','explorationFinds','cartographerOaths','echoReturns','atlasSeals','ascension','dominionCrests','sovereignOaths','legacy']){
  if(data[key]!==undefined&&!validSaveObject(data[key]))throw Error('Invalid '+key);
 }
 for(const key of ['runes','pendingRelics','pendingGear','firstWatchClaimed','banners','combatLoadouts','siegeHistory']){
  if(data[key]!==undefined&&!Array.isArray(data[key]))throw Error('Invalid '+key);
 }
 if(data.unlockedTier!==undefined&&!Number.isFinite(Number(data.unlockedTier)))throw Error('Invalid tier');
 return true;
}
function normalizeRestoredProgress(){
 const saved=defaultState();
 for(const key of ['training','skills','stations','research','suppression','socketed','equipped','bestByTier','milestones','chapterChallenges','relicHunts','explorationFinds','cartographerOaths','echoReturns','atlasSeals','ascension','dominionCrests','sovereignOaths','legacy']){
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
 p.siegeHistory=normalizeSiegeHistory(p.siegeHistory);
 p.siegeHistorySeq=Math.max(safeHistoryCount(p.siegeHistorySeq),...p.siegeHistory.map(e=>e.id),0);
 lastSiegeReport=p.siegeHistory[0]||null;
}
/* Alpha 0.14.4 — portable, explicitly checksummed backup exchange.
   This format is OPTIONAL: original plain JSON exports, localStorage keys and
   earlier game saves remain supported. The checksum catches accidental bytes
   changed in transit; it is not a cryptographic signature. */
const portableBackupFormat='primal-knight-verified-v1';
function createVerifiedBackup(data=p){
 const raw=JSON.stringify(data);
 if(!parseCharacterRaw(raw))throw Error('Cannot export an invalid or unsupported character');
 return {format:portableBackupFormat,schema:1,createdAt:Date.now(),
  characterVersion:data.version??0,digest:recoveryDigest(raw),raw};
}
function backupImportSummary(candidate,format){
 const number=(obj,key)=>Math.floor(Math.max(0,Number(obj[key])||0));
 const progress=obj=>'TIER '+number(obj,'unlockedTier')+
  ' · LEVEL '+number(obj,'level')+' · BEST WAVE '+number(obj,'best')+
  ' · '+number(obj,'sigils')+' SIGILS';
 const count=obj=>Object.values(validSaveObject(obj)?obj:{}).filter(Boolean).length;
 const before=saveWriteBlocked?'CURRENT DEVICE SAVE IS WRITE-LOCKED':progress(p);
 const after=progress(candidate);
 const lost=[];
 if(!saveWriteBlocked){
  if(number(candidate,'level')<number(p,'level'))lost.push('hero level');
  if(number(candidate,'unlockedTier')<number(p,'unlockedTier'))lost.push('unlocked tiers');
  if(number(candidate,'best')<number(p,'best'))lost.push('best wave');
  if(count(candidate.milestones)<count(p.milestones))lost.push('earned milestones');
 }
 return 'IMPORT PREVIEW · '+format+'\n\nCURRENT: '+before+
  '\nBACKUP: '+after+
  '\n\nMILESTONES · DEVICE '+count(p.milestones)+' / BACKUP '+count(candidate.milestones)+
  '\nEQUIPMENT · DEVICE '+(p.inventory?.length||0)+' / BACKUP '+candidate.inventory.length+
  '\n\n'+(lost.length?'WARNING: Backup has lower '+lost.join(', ')+'.\n\n':'')+
  (saveRecoveryStatus==='future'?
   'WARNING: A newer-version local save will be preserved separately as original text before replacement. Prefer opening it in a newer game build instead.\n\n':'')+
  'Import replaces the current character and ends the current siege. A local undo copy is requested; device storage must accept it. Continue?';
}
function inspectBackupImport(payload){
 if(!validSaveObject(payload))throw Error('Backup must contain a JSON object');
 let candidate,format='LEGACY CHARACTER JSON';
 const packaged=payload.format===portableBackupFormat||
  Object.prototype.hasOwnProperty.call(payload,'raw')||
  Object.prototype.hasOwnProperty.call(payload,'digest');
 if(packaged){
  if(payload.format!==portableBackupFormat||payload.schema!==1||
    typeof payload.raw!=='string'||typeof payload.digest!=='string'||
    payload.raw.length>10*1024*1024||
    recoveryDigest(payload.raw)!==payload.digest)
   throw Error('Portable backup checksum or envelope invalid');
  candidate=parseCharacterRaw(payload.raw);
  if(!candidate||payload.characterVersion!==candidate.version&&
     !(payload.characterVersion===0&&candidate.version===undefined))
   throw Error('Portable backup character version mismatch or invalid data');
  format='CHECKSUM-VERIFIED CHARACTER JSON';
 }else{
  const raw=JSON.stringify(payload);
  candidate=parseCharacterRaw(raw);
  if(!candidate)throw Error('Plain character backup invalid or incompatible');
 }
 return {data:candidate,format,summary:backupImportSummary(candidate,format)};
}
function renderPortableBackupPanel(){
 return '<section class="portable-backup-panel" role="group" aria-label="Verified portable save backup">'+
  '<strong>✦ VERIFIED PORTABLE BACKUP</strong><p>Download a second copy with a checksum. On import, the game checks it before asking permission to replace your hero. Existing plain JSON backups still work. Neither backup format includes device-only visual or Siege Guard preferences.</p>'+
  '<button class="wide-btn" data-action="exportVerified" '+(saveWriteBlocked?'disabled title="Current character save is write-locked"':'')+
  '>DOWNLOAD VERIFIED BACKUP</button><small>Checksums detect accidental corruption, not intentional tampering. Your original plain JSON export remains available below.</small></section>';
}

// Alpha 0.14.5: a failed import cannot claim success merely because a write
// returned. Keep the original stored bytes and undo slot stable on failure.
// These are localStorage operations, not a claim of transactional browser storage:
// a device that refuses rollback enters write-protected recovery mode.
function restoreProgressBackup(data,keepRecoveryCopy=false){
 validateProgressBackup(data);
 const old=p,previousTier=chosenTier,previousWaystone=useWaystone,previousCustomWaystone=selectedWaystoneWave,previousGoal=selectedMilestoneTarget,previousEcho=echoStartSelected,previousRoute=selectedScoutRouteId,previousScout=scoutSignalsSelected,previousBlock=saveWriteBlocked,previousStatus=saveRecoveryStatus,previousVerified=lastVerifiedSaveRaw,previousReport=lastSiegeReport;
 const previousIssue=saveWriteIssue,previousWrites=recoveryWrites,previousCheckpointFailure=recoverySnapshotFailed,previousObserved=lastObservedPrimaryRaw;
 // Failure to READ the original bytes must abort before any state is changed.
 const primaryBefore=localStorage.getItem(storageKey);
 // A stale tab must not import over another session's newer character.
 if(primaryBefore!==lastObservedPrimaryRaw){
  saveWriteBlocked=true;saveRecoveryStatus='write-failed';
  saveWriteIssue='PRIMARY SAVE CHANGED OUTSIDE THIS SESSION · AUTOSAVE LOCKED';
  pauseForUnsafeSave();
  throw Error('Primary save changed outside this session; reload before importing');
 }
 const undoBefore=keepRecoveryCopy?localStorage.getItem(safetyBackupKey):null;
 const quarantineBefore=keepRecoveryCopy?localStorage.getItem(damagedOriginalKey):null;
 let undoTouched=false,quarantineTouched=false;
 function restoreSlot(key,raw){
  try{
   if(localStorage.getItem(key)===raw)return true;
   if(raw===null){if(typeof localStorage.removeItem!=='function')return false;localStorage.removeItem(key);}
   else localStorage.setItem(key,raw);
   return localStorage.getItem(key)===raw;
  }catch{return false;}
 }
 try{
  // Record an undo backup before mutation; a silent/no-op storage write is
  // not sufficient. An incompatible primary is quarantined as raw text.
  if(keepRecoveryCopy){
   if(saveWriteBlocked&&unrecoverableSaveRaw!==null){
    quarantineTouched=true;
    localStorage.setItem(damagedOriginalKey,unrecoverableSaveRaw);
    if(localStorage.getItem(damagedOriginalKey)!==unrecoverableSaveRaw)
     throw Error('Could not verify original incompatible save quarantine');
   }else{
    const copy=JSON.stringify(p);
    if(!parseCharacterRaw(copy))throw Error('Cannot back up current character before import');
    undoTouched=true;
    localStorage.setItem(safetyBackupKey,copy);
    if(localStorage.getItem(safetyBackupKey)!==copy)
     throw Error('Could not verify pre-import undo backup');
   }
  }
  p={...defaultState(),...data};
  saveWriteBlocked=false;saveRecoveryStatus='healthy';
  normalizeRestoredProgress();
  migrateEquipmentSave();
  reconcileMilestoneKeepsakes();
  reconcileAtlasSeals();
  chosenTier=p.selectedTier;useWaystone=true;resetWaystoneNavigation();echoStartSelected=false;selectedScoutRouteId=null;
  if(!save())throw Error('Imported character did not persist and pass readback');
  return true;
 }catch(error){
  // If a setItem wrote partial bytes before failing, try to restore exactly
  // what was stored before the import. Never report success without readback.
  // Do not roll stale bytes back over a newly detected concurrent writer.
  const externalConflict=saveWriteIssue==='PRIMARY SAVE CHANGED OUTSIDE THIS SESSION · AUTOSAVE LOCKED';
  const primaryRestored=externalConflict?false:restoreSlot(storageKey,primaryBefore);
  const undoRestored=!undoTouched||restoreSlot(safetyBackupKey,undoBefore);
  // On an unverified primary rollback KEEP the quarantined original.
  const quarantineRestored=!quarantineTouched||!primaryRestored||
   restoreSlot(damagedOriginalKey,quarantineBefore);
  p=old;chosenTier=previousTier;useWaystone=previousWaystone;
  selectedWaystoneWave=previousCustomWaystone;selectedMilestoneTarget=previousGoal;
  echoStartSelected=previousEcho;selectedScoutRouteId=previousRoute;
  scoutSignalsSelected=previousScout;lastVerifiedSaveRaw=previousVerified;
  lastObservedPrimaryRaw=primaryRestored?primaryBefore:previousObserved;
  lastSiegeReport=previousReport;recoveryWrites=previousWrites;
  recoverySnapshotFailed=previousCheckpointFailure;
  saveWriteBlocked=previousBlock;saveRecoveryStatus=previousStatus;
  saveWriteIssue=previousIssue;
  if(externalConflict){
   saveWriteBlocked=true;saveRecoveryStatus='write-failed';
   saveWriteIssue='PRIMARY SAVE CHANGED OUTSIDE THIS SESSION · AUTOSAVE LOCKED';
  }else if(!primaryRestored){
   saveWriteBlocked=true;saveRecoveryStatus='write-failed';
   saveWriteIssue='ROLLBACK UNVERIFIED · EXPORT YOUR AVAILABLE CHARACTER BACKUP';
  }else if(!undoRestored||!quarantineRestored){
   saveWriteIssue='IMPORT FAILED · PREVIOUS UNDO OR QUARANTINE COPY NOT VERIFIED';
  }
  throw error;
 }
}
function undoProgressImport(){
 const backup=localStorage.getItem(safetyBackupKey);
 if(!backup)return false;
 const data=JSON.parse(backup);
 restoreProgressBackup(data,false);
 // Removal only follows a VERIFIED restored primary. A cleanup failure should
 // not misreport the restoration itself as failed; warn and retain the copy.
 try{
  if(typeof localStorage.removeItem==='function'){
   localStorage.removeItem(safetyBackupKey);
   if(localStorage.getItem(safetyBackupKey)!==null)
    saveWriteIssue='UNDO RESTORED · OLD UNDO COPY COULD NOT BE CLEARED';
  }
 }catch{saveWriteIssue='UNDO RESTORED · OLD UNDO COPY COULD NOT BE CLEARED';}
 return true;
}

let ctx=$('game').getContext('2d'),c=$('game'),background=new Image();background.src='assets/battlefield.png';const foreground=new Image();foreground.src='assets/foreground.png';let sprites={};for(const type of ['hero','goblin','skeleton','warg','imp','ogre','guardian','raider','shaman','siegebeast','warlord','warlord_iron','warlord_ember','warlord_rift','frostbinder','sapper','banneret','thornweaver','riftstalker']){const i=new Image();i.src='assets/'+type+(['guardian','raider','shaman','siegebeast','warlord','warlord_iron','warlord_ember','warlord_rift','frostbinder','sapper','banneret','thornweaver','riftstalker'].includes(type)?'.svg':'.png');sprites[type]=i;}
let run={wave:1,tier:1,health:0,maxHealth:0,phase:'ready',enemies:[],shots:[],particles:[],floats:[],spawned:0,total:0,kills:0,breaches:0,spawnClock:0,shotClock:0,stationClock:0,time:0,speed:1,freeze:0,heroChill:0,rewardTimer:0,shakes:0,flashes:0,encounter:null,reinforcementPhase:false,bossCounters:0};let tab='battle',storedSpeed=1,pausedForPanel=false,saveClock=0,toastTimer=0,lastSiegeReport=p.siegeHistory[0]||null;
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
// Also runs during initial saved siege-history normalization, before the
// later doctrineTacticModes catalogue is initialized. Keep this primitive
// validator independent of that catalogue to avoid a saved-game load crash.
function normalizeDoctrineTactic(id){return id==='rapid'||id==='horde'||id==='crisis'?id:'rapid';}
function chooseDoctrineTactic(id){
 if(run.phase==='fighting'||run.phase==='intermission'||!Object.prototype.hasOwnProperty.call(doctrineTacticModes,id))return false;
 p.doctrineTactic=id;return true;
}
// The assessment mirrors the player-chosen tactical rules and additionally
// reports WHY a cast is being held or released. Rapid retains legacy eligibility.
function doctrineTacticAssessment(){
 const mode=normalizeDoctrineTactic(p.doctrineTactic);
 const alive=run.enemies.filter(e=>e&&!e.dead);
 if(mode==='rapid')return {eligible:true,reason:'rapid',targets:alive.length};
 if(!alive.length)return {eligible:false,reason:'no-target',targets:0};
 const damaged=run.health<=run.maxHealth*.91;
 const urgent=alive.some(e=>e.bossWardTimer>0||e.crushWindup>0||e.bossFuryWindup>0||
  e.bossBlinkWindup>0||e.type==='sapper'&&e.y>=220||
  e.type==='shaman'&&e.ritualClock<=1.4);
 const aegis=chosenDoctrine().id==='aegis';
 if(mode==='horde'){
  if(urgent)return {eligible:true,reason:'urgent',targets:alive.length};
  if(alive.length>=4)return {eligible:true,reason:'crowd',targets:alive.length};
  if(aegis&&damaged)return {eligible:true,reason:'repair',targets:alive.length};
  return {eligible:false,reason:'hold',targets:alive.length};
 }
 if(urgent)return {eligible:true,reason:'urgent',targets:alive.length};
 if(alive.some(e=>e.y>=288))return {eligible:true,reason:'frontline',targets:alive.length};
 if(alive.length>=9)return {eligible:true,reason:'crowd',targets:alive.length};
 if(run.health<=run.maxHealth*.78||(aegis&&damaged))
  return {eligible:true,reason:'repair',targets:alive.length};
 return {eligible:false,reason:'hold',targets:alive.length};
}
function doctrineTacticEligible(){return doctrineTacticAssessment().eligible;}
function doctrineCanCastNow(){
 const enemies=run.enemies.filter(e=>e&&!e.dead);
 if(!enemies.length)return false;
 return chosenDoctrine().id!=='aegis'||run.health<run.maxHealth-1||enemies.some(e=>e.y>=245);
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
 const counsel=compact?warCouncilPlan(chosenTier,startWaveForTier(chosenTier)):null;
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
 if(run.doctrineClock>0){run.doctrineHolding=false;return false;}
 const decision=doctrineTacticAssessment();
 if(!decision.eligible){
  if(decision.reason==='hold'&&decision.targets>0){
   if(!run.doctrineHolding){run.doctrineHoldEvents=(run.doctrineHoldEvents||0)+1;}
   run.doctrineHolding=true;
   // In-game battle seconds, not wall-clock time. Held time costs no resources.
   run.doctrineHeldSeconds=(run.doctrineHeldSeconds||0)+dt;
  }else run.doctrineHolding=false;
  return false;
 }
 run.doctrineHolding=false;
 if(!castCombatDoctrine())return false;
 run.doctrineCastReasons??={};
 run.doctrineCastReasons[decision.reason]=(run.doctrineCastReasons[decision.reason]||0)+1;
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
 const state=remaining>0?'cooldown':!doctrineCanCastNow()?'waiting':doctrineTacticEligible()?'ready':'held';
 $('doctrineTimer').textContent=state==='cooldown'?remaining.toFixed(1)+'s':state.toUpperCase();
 hud.dataset.status=state;
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
 [2,'First Blood',220,45,0,0],
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
// Alpha 0.12.21: two existing vanguard slots can carry region-specific real combat roles.
const territoryVanguards=[["MARCH RIDERS","raider","Rushers need Frost or Aegis."],["ASHEN FUSEMEN","sapper","Interrupt lit wall-damaging fuses."],["FROST CHANTERS","frostbinder","Break the attack-slowing frost rite."],["DROWNED SENTRIES","guardian","Pierce shield guards defending allies."],["STORM STANDARD","banneret","Destroy the speed-boosting rally standard."],["HOLLOW CHOIR","shaman","Focus the healing ritual."],["EMBER SABOTEURS","sapper","Disarm fuses before detonation."],["ECLIPSE STRIDERS","riftstalker","Break the blink windup."],["ELDER BRIARS","thornweaver","Interrupt protective thorn wards."],["ASTRAL STALKERS","riftstalker","Stop the violet blink."],["CROWN SENTRIES","guardian","Pierce the armored guard line."],["FIRST-FLAME FUSES","sapper","Prioritize wall-blasting fuses."],["THRONE BANNERS","banneret","Eliminate rallying bannerets."],["BLACKROAD RAIDERS","raider","Slow the raider sprint."],["RIFT SEEKERS","riftstalker","Disrupt short-range teleports."],["LAST WATCH GUARD","guardian","Break shield protection."],["GLASSWOUND GUARD","guardian","Pierce the glass shields."],["MOONVEIL BINDERS","frostbinder","Interrupt the moonlit frost rite."],["SUNFORGED FUSES","sapper","Stop the sunfire countdown."],["CROWN BRIARS","thornweaver","Shatter the temporary root-ward."],["DEPTH CHANTERS","shaman","Eliminate the healing casters."],["ZENITH BLINKERS","riftstalker","Stop the star-step blink."],["DREADROOT WARDENS","thornweaver","Interrupt the green thorn ward."],["HOLLOW STAR FLAGS","banneret","Break the supporting flags."],["BLACKGLASS SENTRIES","guardian","Pierce their protective armor."],["THUNDER COURIERS","raider","Freeze or repel storm rushers."],["GOLDEN STANDARD","banneret","Break the gilded rally banner."],["PANTHEON BINDERS","frostbinder","Stop the winter frost cast."],["SCARLAND RUSHERS","raider","Deny the rapid flank."],["ORIGIN CHOIR","shaman","Silence the ancient healers."]];
function territoryVanguard(tier){const n=clamp(Math.floor(Number(tier)||1),1,MAX_TIER),row=territoryVanguards[n-1];return {tier:n,name:row[0],unit:row[1],counter:row[2]};}
function hasNativeVanguard(encounter){return !!encounter&&encounter.kind==='vanguard'&&encounter.wave>=35;}
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
// Alpha 0.13.0 — opt-in guarded discoveries on four fixed rare waves per tier.
const lostSignalWaves=[47,147,347,747];
const lostSignalNames=['WAYFINDER BEACON','BROKEN STAR MAP','FORGOTTEN RELIQUARY','CROWNLESS OBSERVATORY'];
const lostSignalGear=['helm','amulet','charm','gauntlets'],lostSignalRarity=[1,2,3,4];
// Each deep signal reveals a distinct existing combat role, without introducing
// extra entities, a new caster cap exception or untested enemy physics.
const lostSignalGuardians=[
 {name:'WAYFINDER SENTINEL',type:'guardian',hp:1.4,speed:.90,armor:3,
  color:'#a4f6e8',tactic:'SHIELDING: break the guard line with armor penetration.'},
 {name:'STAR-MAP COURIER',type:'raider',hp:2.0,speed:1.05,armor:2,
  color:'#ffe19d',tactic:'DASHING: use Frost or Aegis to slow the sprint.'},
 {name:'RELIQUARY HOWLER',type:'warg',hp:1.75,speed:1.08,armor:3,
  color:'#c5b4ff',tactic:'FAST PACK: secure the wall before it breaks through.'},
 {name:'CROWNLESS COLOSSUS',type:'ogre',hp:.90,speed:.92,armor:5,
  color:'#ffaf99',tactic:'HEAVY ARMOR: aim focused volleys at the ancient giant.'}
];
const explorerSetSlots=['helm','amulet','charm','gauntlets'];
function explorerSetStatus(){
 // Count ONLY currently equipped genuine heirloom pieces, all from one tier.
 // The strongest single tier set wins; 30 sets never stack cumulatively.
 const counts=new Array(MAX_TIER+1).fill(0);
 for(const slot of explorerSetSlots){
  const id=p.equipped?.[slot];
  if(typeof id!=='string')continue;
  const match=/^signal_(\d+)_(47|147|347|747)$/.exec(id);
  if(!match)continue;
  const tier=Number(match[1]),wave=Number(match[2]);
  const signal=lostSignal(tier,wave);
  if(!signal||signal.slot!==slot||!p.inventory.some(g=>g&&g.id===id&&g.slot===slot))continue;
  counts[tier]++;
 }
 let tier=0,count=0;
 for(let i=1;i<=MAX_TIER;i++)if(counts[i]>count||(counts[i]===count&&count>0&&i>tier)){tier=i;count=counts[i];}
 return {tier,count,damage:count>=2?.04:0,wall:count>=3?.04:0,knowledge:count>=4?.08:0};
}
function explorerSetLabel(){
 const set=explorerSetStatus();
 return '✦ EXPLORER HEIRLOOMS · '+set.count+' / 4 MATCHED'+(set.tier?' · TIER '+roman(set.tier):'')+
  ' · 2 PCS +4% DAMAGE · 3 PCS +4% WALL · 4 PCS +8% WAVE KNOWLEDGE'+
  (set.count<2?' · NONE ACTIVE':' · ACTIVE');
}
// Alpha 0.13.2 — a consecutive three-wave SCOUT oath with finite territory rewards.
const cartographerRouteWaves=[1001,1002,1003];
function cartographerOath(tier){
 const t=Number(tier);
 if(!Number.isInteger(t)||t<1||t>MAX_TIER)return null;
 return {tier:t,start:1001,end:1003,banner:'Cartographer of '+tierNames[t-1],
  rune:{id:'cartographer_'+t,type:['frost','storm','ember','fortune'][(t-1)%4],
   tier:Math.min(12,2+Math.floor((t-1)/3))}};
}
function activeCartographerOath(tier,wave,enabled=run.explorationEnabled){
 const oath=cartographerOath(tier),step=cartographerRouteWaves.indexOf(wave);
 if(!enabled||!oath||step<0||p.cartographerOaths[tier]||run.cartographerBroken||
    run.cartographerStages!==step)return null;
 return {...oath,step:step+1,wave};
}
// Alpha 0.13.4 — genuine return trip: finish wave 250 first, then defend wave 117 on SCOUT.
// Two tactically different champions replace normal troops in the original capped roster.
// Alpha 0.13.5 — six existing SCOUT objectives yield one permanent, finite realm seal.
const atlasSealObjectiveCount=6;
const atlasSealBonusPerRealm=.0025; // 30 realms × 0.25% each = 7.5% maximum.
function atlasSealBanner(tier){
 const t=Number(tier);
 return Number.isInteger(t)&&t>=1&&t<=MAX_TIER?'Atlas Keeper of '+tierNames[t-1]:null;
}
function atlasSealProgress(tier){
 const t=Number(tier);
 if(!Number.isInteger(t)||t<1||t>MAX_TIER)return null;
 const signals=lostSignalWaves.reduce((sum,w)=>sum+(p.explorationFinds[t+':'+w]?1:0),0);
 const oath=!!p.cartographerOaths[t],echo=!!p.echoReturns[t];
 return {tier:t,signals,oath,echo,total:signals+Number(oath)+Number(echo),
  complete:signals===4&&oath&&echo};
}
function atlasSealEligible(tier){return !!atlasSealProgress(tier)?.complete;}
function atlasSealCount(){
 let count=0;
 for(let tier=1;tier<=MAX_TIER;tier++)if(p.atlasSeals[tier])count++;
 return count;
}
function atlasSealBonus(){return atlasSealCount()*atlasSealBonusPerRealm;}
function reconcileAtlasSeals(){
 // Earlier saves with all six discoveries earn the seal now, without replayed currency.
 let changed=0;
 for(let tier=1;tier<=MAX_TIER;tier++){
  if(!atlasSealEligible(tier)){
   if(p.atlasSeals[tier]){delete p.atlasSeals[tier];changed++;}
   continue;
  }
  if(!p.atlasSeals[tier]){p.atlasSeals[tier]=true;changed++;}
  const banner=atlasSealBanner(tier);
  if(!p.banners.includes(banner)){p.banners.push(banner);changed++;}
 }
 return changed;
}
function awardAtlasSeals(){
 const before=atlasSealCount(),changed=reconcileAtlasSeals();
 if(changed&&atlasSealCount()>before){
  notice('✦ ATLAS SEAL COMPLETE · '+tierNames[run.tier-1].toUpperCase());
  message('✦ ATLAS MASTERY +0.25% HERO DAMAGE & WALL · PERMANENT');
 }
 return atlasSealCount()-before;
}
const echoReturnWave=117;
const echoReturnEnemies=[
 {role:'shield',name:'MEMORY ANCHOR',type:'guardian',hp:1.75,speed:.91,armor:4,color:'#c3f7e7'},
 {role:'runner',name:'REVENANT COURIER',type:'raider',hp:2.25,speed:1.06,armor:2,color:'#ffdba0'}
];
function echoReturn(tier){
 const t=Number(tier);
 if(!Number.isInteger(t)||t<1||t>MAX_TIER||encounterDirector(echoReturnWave,t).kind!=='standard')return null;
 return {tier:t,wave:echoReturnWave,key:String(t),item:{
  id:'echo_'+t+'_'+echoReturnWave,slot:'ring',
  rarity:Math.min(7,2+Math.floor((t-1)/5)),plus:0,
  legacyName:'Memorybound Signet · '+tierNames[t-1]}};
}
function echoReturnEligible(tier){
 return !!echoReturn(tier)&&Number(p.bestByTier?.[tier])>=250&&!!p.milestones?.[tier+':100'];
}
function activeEchoReturn(tier,wave,enabled=run.explorationEnabled){
 const event=echoReturn(tier);
 return enabled&&event&&wave===event.wave&&echoReturnEligible(tier)&&
   !p.echoReturns[tier]?event:null;
}
function awardEchoReturn(wallRatio=run.health/Math.max(1,run.maxHealth)){
 const event=run.echoCurrent;
 if(!event||!run.explorationEnabled||run.phase!=='fighting'||
   run.tier!==event.tier||run.wave!==event.wave||!echoReturnEligible(event.tier)||
   p.echoReturns[event.key]||run.echoDefeatedMask!==3||run.breaches>0||
   !Number.isFinite(wallRatio)||wallRatio<.5||run.spawned!==run.total||
   run.enemies.some(e=>!e.dead))return false;
 const placement=storeEarnedGear(event.item);
 if(placement==='invalid')return false;
 p.echoReturns[event.key]=true;
 notice('✦ ECHO RETURN COMPLETE · '+tierNames[event.tier-1].toUpperCase());
 message(placement==='reserved'?'✦ MEMORYBOUND SIGNET SAVED IN EQUIPMENT VAULT':
  '✦ MEMORYBOUND SIGNET EARNED');
 return true;
}
let scoutSignalsSelected=false,selectedScoutRouteId=null;
// Alpha 0.13.6 — transient exploration routing; never forge milestones or rewards.
function scoutRouteWaystone(tier,wave){
 const t=Number(tier),w=Number(wave);
 if(!Number.isInteger(t)||t<1||t>MAX_TIER||!Number.isInteger(w)||w<1||w>MAX_WAVE)return null;
 return waystonesAt.filter(stone=>stone<=w&&p.milestones[milestoneKey(t,stone)]===true).at(-1)||1;
}
function scoutRouteOptions(tier){
 const t=Number(tier);
 if(!Number.isInteger(t)||t<1||t>MAX_TIER)return [];
 const routes=lostSignalWaves.map(w=>{
  const signal=lostSignal(t,w);
  return {id:'signal-'+w,kind:'signal',wave:w,label:signal.name,
   claimed:!!p.explorationFinds[signal.key],locked:false,
   hint:'DEFEAT GUARDIAN · ZERO BREACHES'};
 });
 routes.push({id:'echo',kind:'echo',wave:echoReturnWave,label:'Echo Return',
  claimed:!!p.echoReturns[t],locked:!echoReturnEligible(t),
  hint:'TWO CHAMPIONS · ZERO BREACHES · 50% WALL'});
 routes.push({id:'oath',kind:'oath',wave:1001,label:"Cartographer's Oath",
  claimed:!!p.cartographerOaths[t],locked:false,
  hint:'THREE CONSECUTIVE WAVES · ZERO BREACHES'});
 return routes.map(route=>({...route,start:scoutRouteWaystone(t,route.wave)}))
  .sort((a,b)=>a.wave-b.wave);
}
function selectedScoutRoute(tier){
 return scoutRouteOptions(tier).find(route=>route.id===selectedScoutRouteId&&
  !route.claimed&&!route.locked)||null;
}
function selectScoutRoute(tier,id){
 if(tier!==chosenTier||tier>p.unlockedTier)return false;
 const route=scoutRouteOptions(tier).find(item=>item.id===id&&!item.claimed&&!item.locked);
 if(!route)return false;
 selectedScoutRouteId=route.id;scoutSignalsSelected=true;
 resetWaystoneNavigation();useWaystone=true;echoStartSelected=false;
 return true;
}
function renderScoutRoutebook(tier){
 const routes=scoutRouteOptions(tier);
 if(!routes.length)return '';
 const selected=selectedScoutRoute(tier);
 const open=routes.filter(route=>!route.claimed&&!route.locked).length;
 const buttons=routes.map(route=>{
  const chosen=selected?.id===route.id,blocked=route.claimed||route.locked;
  const state=route.claimed?'CLAIMED':route.locked?'LOCKED · CLEAR WAVE 250':chosen?'READY TO LAUNCH':'SELECT SCOUT ROUTE';
  return '<button type="button" data-scout-route="'+route.id+'" class="scout-route-option'+
   (chosen?' selected':'')+(route.claimed?' claimed':'')+'"'+
   ' aria-pressed="'+chosen+'" '+(blocked?'disabled':'')+'>'+
   '<strong>'+route.label+' · WAVE '+formatWave(route.wave)+'</strong>'+
   '<small>FROM '+formatWave(route.start)+' → '+formatWave(route.wave)+' · '+state+'</small>'+
   '<small>'+route.hint+'</small></button>';
 }).join('');
 return '<section class="scout-routebook" aria-label="Scout Routebook · select an unfinished objective">'+
  '<div class="scout-route-heading"><strong>✦ SCOUT ROUTEBOOK</strong><span>'+
  open+' AVAILABLE / '+routes.length+' ROUTES</span></div>'+
  '<p>Choose a mission to automatically select SCOUT and start from the nearest <b>earned</b> waystone. '+
  'No unopened checkpoints or battle rewards are skipped.</p>'+
  '<div class="scout-route-grid">'+buttons+'</div>'+
  (selected?'<div class="scout-route-ready" role="status">ROUTE SET · '+selected.label.toUpperCase()+
   ' · START WAVE '+formatWave(selected.start)+' · OBJECTIVE WAVE '+formatWave(selected.wave)+'</div>':
   open===0?'<div class="scout-route-ready" role="status">ALL AVAILABLE ROUTES COMPLETE</div>':'')+
  '</section>';
}
function lostSignal(tier,wave){
 const t=Math.floor(Number(tier)),w=Math.floor(Number(wave));
 if(!Number.isInteger(t)||t<1||t>MAX_TIER)return null;
 const index=lostSignalWaves.indexOf(w);
 if(index<0||encounterDirector(w,t).kind!=='standard')return null;
 return {key:t+':'+w,tier:t,wave:w,index,name:lostSignalNames[index],
  slot:lostSignalGear[index],rarity:lostSignalRarity[index],guardian:lostSignalGuardians[index]};
}
function activeLostSignal(tier,wave,enabled=run.explorationEnabled){
 const signal=lostSignal(tier,wave);
 return enabled&&signal&&!p.explorationFinds[signal.key]?signal:null;
}
function discoveryName(signal){return signal.name+' · '+tierNames[signal.tier-1];}
function renderLostSignalLedger(tier,startWave){
 const rows=lostSignalWaves.map(wave=>{
  const signal=lostSignal(tier,wave);if(!signal)return '';
  const claimed=!!p.explorationFinds[signal.key],missed=wave<startWave&&!claimed;
  return '<div class="lost-signal-entry '+(claimed?'claimed':'')+'"><span>'+
   (claimed?'✓':missed?'◌':'✦')+'</span><div><strong>WAVE '+formatWave(wave)+' · '+signal.name+
   '</strong><small>'+(claimed?'DISCOVERED · ONE-TIME REWARD CLAIMED':
   missed?'BEFORE WAYSTONE · REVISIT FROM WAVE 1':
   'SECRET '+signal.guardian.name+' · NO BREACHES · '+rarities[signal.rarity].toUpperCase()+' HEIRLOOM')+
   '</small></div></div>';
 }).join('');
 const found=lostSignalWaves.reduce((count,w)=>count+(p.explorationFinds[tier+':'+w]?1:0),0);
 const oath=cartographerOath(tier),oathClaimed=!!p.cartographerOaths[tier];
 const echo=echoReturn(tier),echoOpen=echoReturnEligible(tier),echoClaimed=!!p.echoReturns[tier],seal=atlasSealProgress(tier);
 const oathRow='<div class="lost-signal-entry '+(oathClaimed?'claimed':'')+'"><span>'+
  (oathClaimed?'✓':oath.end<startWave?'◌':'✦')+'</span><div><strong>WAVES '+
  formatWave(oath.start)+'–'+formatWave(oath.end)+" · CARTOGRAPHER'S OATH"+'</strong><small>'+
  (oathClaimed?'COMPLETED · UNIQUE BANNER & RUNE CLAIMED':
   oath.end<startWave?'BEFORE WAYSTONE · REVISIT FROM WAVE 1':
   'SCOUT ONLY · THREE BREACH-FREE WAVES · UNIQUE BANNER + TIER '+oath.rune.tier+
   ' '+oath.rune.type.toUpperCase()+' RUNE')+'</small></div></div>';
 const echoRow='<div class="lost-signal-entry echo-return-entry '+(echoClaimed?'claimed':'')+'"><span>'+
  (echoClaimed?'✓':!echoOpen?'🔒':startWave>echo.wave?'◌':'✦')+'</span><div><strong>WAVE 117 · ECHO RETURN</strong><small>'+
  (echoClaimed?'CLEARED · MEMORYBOUND SIGNET SECURED':!echoOpen?'UNLOCK AFTER WAVE 250 IN THIS TERRITORY':
   startWave>echo.wave?'REVISIT FROM THE WAVE 100 WAYSTONE':
   'SCOUT ONLY · DEFEAT TWO MARKED CHAMPIONS · ZERO BREACHES · KEEP 50% WALL')+
  '</small></div></div>';
 const sealRow='<div class="lost-signal-entry atlas-seal-entry '+(p.atlasSeals[tier]?'claimed':'')+'"><span>'+
  (p.atlasSeals[tier]?'♛':'✧')+'</span><div><strong>ATLAS SEAL · '+seal.total+' / '+atlasSealObjectiveCount+
  ' OBJECTIVES</strong><small>'+(p.atlasSeals[tier]?'MASTERED · PERMANENT +0.25% DAMAGE & WALL · ATLAS KEEPER BANNER':
   seal.signals+' / 4 LOST SIGNALS · CARTOGRAPHER '+(seal.oath?'✓':'—')+
   ' · ECHO '+(seal.echo?'✓':'—')+' · REVISIT TO COMPLETE')+
  '</small></div></div>';
 return '<section class="lost-signals" aria-label="Optional exploration and rare guarded discoveries">'+
  '<div class="lost-signals-heading"><div><small>✦ THE LOST SIGNALS · EXPLORER\'S CHARTER</small>'+
  '<strong>'+found+' / '+lostSignalWaves.length+' DISCOVERIES · TIER '+roman(tier)+'</strong></div>'+
  '<div class="lost-signal-choice" role="group" aria-label="Scout rare discovery encounters">'+
  '<button type="button" data-exploration-choice="off" aria-pressed="'+!scoutSignalsSelected+
  '" class="'+(!scoutSignalsSelected?'selected':'')+'">NORMAL</button>'+
  '<button type="button" data-exploration-choice="on" aria-pressed="'+scoutSignalsSelected+
  '" class="'+(scoutSignalsSelected?'selected':'')+'">SCOUT</button></div></div>'+
  '<p>Optional SCOUT route: earn 120 guardian heirlooms, complete Cartographer’s Oaths at waves 1,001–1,003, or revisit a territory after wave 250 to face two Echo champions at wave 117. The Echo Return requires zero breaches and at least half the wall remaining to earn a unique ring. NORMAL remains unchanged; finite prizes never repeat. Complete all six objectives in one territory to earn its Atlas Seal, a unique banner and permanent +0.25% hero damage and wall health, capped at +7.5% total. Use the Scout Routebook to reach missed objectives from their nearest earned waystones.</p>'+
  '<div class="explorer-bond">'+explorerSetLabel()+'</div>'+renderScoutRoutebook(tier)+ '<div class="lost-signal-list">'+rows+oathRow+echoRow+sealRow+'</div></section>';
}
function awardLostSignal(){
 const signal=run.discoveryCurrent;
 if(!signal||!run.explorationEnabled||run.breaches>0||
    !run.discoveryWardenKilled||p.explorationFinds[signal.key])return false;
 const item={id:'signal_'+signal.key.replace(':','_'),slot:signal.slot,
  rarity:signal.rarity,plus:0,legacyName:discoveryName(signal)+' · '+rarities[signal.rarity]+' Heirloom'};
 const placement=storeEarnedGear(item);
 if(placement==='invalid')return false;
 p.explorationFinds[signal.key]=true;
 p.knowledge+=Math.max(1,Math.ceil((5+signal.wave*1.6)*tierReward(signal.tier)*.12));
 notice('✦ LOST SIGNAL DISCOVERED · '+signal.name);
 message(placement==='reserved'?'✦ HEIRLOOM RESERVED IN EQUIPMENT VAULT':
   '✦ '+signal.name+' · HEIRLOOM RECOVERED');
 return true;
}
function awardCartographerOath(){
 const oath=run.cartographerCurrent;
 if(!oath||run.phase!=='fighting'||!run.explorationEnabled||
    p.cartographerOaths[oath.tier]||run.cartographerBroken||
    run.cartographerStages!==oath.step-1||run.spawned!==run.total||
    run.enemies.some(enemy=>!enemy.dead))return false;
 if(run.breaches>0){
  run.cartographerBroken=true;
  notice("CARTOGRAPHER'S OATH BROKEN · RETRY IN A NEW SCOUT SIEGE");
  return false;
 }
 run.cartographerStages++;
 if(oath.step<3){
  notice("✦ CARTOGRAPHER'S OATH · "+oath.step+' / 3 WAVES HELD');
  return true;
 }
 const placement=storeEarnedRune(oath.rune);
 if(placement==='invalid'){run.cartographerStages--;return false;}
 p.cartographerOaths[oath.tier]=true;
 if(!p.banners.includes(oath.banner))p.banners.push(oath.banner);
 notice("✦ CARTOGRAPHER'S OATH COMPLETE · "+oath.banner.toUpperCase());
 message(placement==='reserved'?'✦ CARTOGRAPHER RUNE SAFE IN RUNE VAULT':
  '✦ CARTOGRAPHER BANNER AND RUNE EARNED');
 return true;
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
function warCouncilPlan(tier=chosenTier,wave=startWaveForTier(tier)){
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
 fort:{note:'+12 max wall HP per rank. First 6 ranks block 4% breach damage each (max 24%).',role:'WALL ENDURANCE'}
};
// Alpha 0.15.1: price paths from the actual training economy.
// Goal ranks are an optional shopping guide, never a stored build or auto-spend.
const firstWatchInvestmentPaths=[
 {id:'might',name:'BLADE FIRST',summary:'Prioritize damage and rate of fire.',ranks:[['power',4],['haste',2]]},
 {id:'balanced',name:'EVEN WATCH',summary:'Spread early investment between offense and wall.',ranks:[['power',2],['haste',2],['fort',2]]},
 {id:'guardian',name:'STONEGUARD',summary:'Raise wall HP and block breaches, with a little offense.',ranks:[['fort',4],['haste',1],['power',1]]}
];
function firstWatchInvestmentQuote(id){
 const path=firstWatchInvestmentPaths.find(x=>x.id===id);
 if(!path)return null;
 let remainingCost=0,missingRanks=0,nextId=null,nextCost=null;
 const goals=[];
 for(const [stat,goal] of path.ranks){
  const row=training.find(x=>x[0]===stat);
  if(!row)continue;
  const current=t(stat),target=Math.min(goal,row[5]);
  goals.push(row[1]+' '+target);
  for(let rank=current;rank<target;rank++){
   const cost=trainCostAt(row,rank);
   if(!Number.isSafeInteger(cost)||cost<0)return null;
   remainingCost+=cost;missingRanks++;
   if(nextId===null){nextId=stat;nextCost=cost;}
  }
 }
 return {id:path.id,name:path.name,summary:path.summary,goals:goals.join(' · '),
  missingRanks,remainingCost,nextId,nextCost,
  nextAffordable:nextId!==null&&p.essence>=nextCost,
  planAffordable:p.essence>=remainingCost};
}
function purchaseFirstWatchInvestmentRank(id){
 // One explicit tap buys one priced permanent rank, never the whole plan.
 if(saveWriteBlocked||chosenTier!==1||run.phase==='fighting'||run.phase==='intermission')return false;
 const quote=firstWatchInvestmentQuote(id);
 if(!quote||!quote.nextAffordable)return false;
 const before=p.essence,rank=t(quote.nextId);
 if(!purchaseCouncilTraining(quote.nextId))return false;
 return t(quote.nextId)===rank+1&&p.essence===before-quote.nextCost;
}
// Alpha 0.15.3: earned offensive recovery for defense-heavy first-watch
// characters stalled below chapter II's 11 authentic unique-wave clears.
// Only the original owned ranks matter; no saved plan ID or automatic grants.
function breakthroughRallyQuote(){
 if((p.bestByTier[1]||0)<5||p.uniqueClears>=11||
   p.firstWatchClaimed.includes(1)||t('fort')<4)return null;
 const goals=[['power',8],['haste',5]];
 let remainingCost=0,missingRanks=0,nextId=null,nextCost=null;
 for(const [id,target] of goals){
  const row=training.find(r=>r[0]===id);
  for(let rank=t(id);rank<target;rank++){
   const price=trainCostAt(row,rank);
   if(!Number.isSafeInteger(price)||price<0)return null;
   remainingCost+=price;missingRanks++;
   if(nextId===null){nextId=id;nextCost=price;}
  }
 }
 return {nextId,nextCost,remainingCost,missingRanks,
  affordable:nextId!==null&&p.essence>=nextCost,
  affordableFull:p.essence>=remainingCost,
  uniqueRemaining:Math.max(0,11-p.uniqueClears),
  activeSecondsRemaining:Math.max(0,420-p.battleSeconds),
  might:t('power'),reflexes:t('haste'),fortitude:t('fort')};
}
function purchaseBreakthroughRallyRank(){
 if(saveWriteBlocked||chosenTier!==1||
   run.phase==='fighting'||run.phase==='intermission')return false;
 const quote=breakthroughRallyQuote();
 if(!quote||!quote.affordable)return false;
 const before=p.essence,prior=t(quote.nextId);
 if(!purchaseCouncilTraining(quote.nextId))return false;
 return p.essence===before-quote.nextCost&&t(quote.nextId)===prior+1;
}
function renderBreakthroughRally(){
 const quote=breakthroughRallyQuote();if(!quote)return '';
 const next=quote.nextId;
 const button=next?(quote.affordable?
  'TRAIN '+councilTrainingDetails[next].role+' · '+fmt(quote.nextCost)+' ESSENCE':
  'NEED '+fmt(quote.nextCost)+' ESSENCE'):'OFFENSIVE TARGET REACHED';
 return '<section class="watch-breakthrough" aria-label="Stoneguard earned breakthrough route">'+
  '<div class="watch-breakthrough-heading"><strong>⚔ BREAKTHROUGH RALLY · STONEGUARD RECOVERY</strong>'+
  '<span>'+quote.uniqueRemaining+' NEW WAVE CLEARS TO CHAPTER II</span></div>'+
  '<p>Your Fortitude investment remains permanent. Defense buys time, but Might and Reflexes help stop breaches before they reach the wall. An optional offense pivot is available without refunds, free rewards or resetting your knight.</p>'+
  '<div class="watch-breakthrough-info"><span>MIGHT '+fmt(quote.might)+' / 8 · REFLEXES '+fmt(quote.reflexes)+' / 5</span>'+
  '<span>'+fmt(quote.missingRanks)+' RANKS REMAINING · '+fmt(quote.remainingCost)+' HERO ESSENCE</span>'+
  '<span>'+fmt(Math.ceil(quote.activeSecondsRemaining/60))+' ACTIVE MIN STILL NEEDED · '+fmt(quote.uniqueRemaining)+' NEW WAVE CLEARS</span></div>'+
  '<button type="button" data-breakthrough-rally="one" '+(!quote.affordable?'disabled':'')+'>'+button+'</button>'+
  '<small>Each tap buys exactly one real rank at the normal Training price. No auto-spend or reward changes. This is guidance, not a promised win.</small></section>';
}
function renderFirstWatchInvestmentPaths(){
 return '<div class="watch-investment" aria-label="First Watch earned investment comparisons">'+
  '<div class="watch-investment-head"><strong>✦ FIRST WATCH · CHOOSE YOUR INVESTMENT</strong><small>REAL RANK PRICES · NO AUTO-SPEND</small></div>'+
  '<p>Seeded starter runs showed early damage-first builds advancing further than wall-first builds. These are optional six-rank goals, not guaranteed outcomes. Every tap purchases <b>one</b> permanent rank.</p>'+
  '<div class="watch-investment-grid">'+firstWatchInvestmentPaths.map(path=>{
   const q=firstWatchInvestmentQuote(path.id);
   if(!q)return '';
   const label=q.missingRanks===0?'PLAN MET':q.nextAffordable?
    'BUY '+councilTrainingDetails[q.nextId].role+' · '+fmt(q.nextCost)+' ESSENCE':
    'NEED '+fmt(q.nextCost)+' ESSENCE';
   return '<article class="watch-investment-card"><small>✦ '+q.name+'</small>'+
    '<strong>'+q.goals+'</strong><p>'+q.summary+'</p>'+
    '<span>'+(q.missingRanks?'REMAINING · '+q.missingRanks+' RANKS · '+fmt(q.remainingCost)+' ESSENCE':'TARGET RANKS REACHED')+'</span>'+
    '<button type="button" data-first-watch-invest="'+q.id+'" '+(!q.nextAffordable||saveWriteBlocked?'disabled':'')+'>'+label+'</button></article>';
  }).join('')+'</div>'+
  '<small class="watch-investment-note">Prices and remaining ranks update after each real purchase. Power → Training uses identical prices. Each tap is optional.</small></div>';
}
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
// 0.15.4 — live three-currency investment accounting. No payback promise.
const prosperityInvestments=[
 {key:'essence',currency:'essence',source:'training',id:'essence',name:'ATTUNEMENT',group:'HERO TRAINING',benefit:'+2.8% Hero Essence per cleared wave per rank'},
 {key:'knowledge',currency:'knowledge',source:'research',id:'studies',name:'ADVANCED STUDIES',group:'ROYAL RESEARCH',benefit:'+4.5% Knowledge per cleared wave per rank'},
 {key:'gold',currency:'gold',source:'station',id:'midas',name:'MIDAS PROJECTOR',group:'FORTRESS STATION',benefit:'Additional Gold from certain enemy kills'}
];
function prosperityLedgerQuote(key){
 const choice=prosperityInvestments.find(x=>x.key===key);if(!choice)return null;
 const row=choice.source==='training'?training.find(r=>r[0]===choice.id):
  choice.source==='research'?research.find(r=>r[0]===choice.id):
  stationData.find(r=>r[0]===choice.id);
 if(!row)return null;
 const rank=choice.source==='training'?t(choice.id):choice.source==='research'?res(choice.id):station(choice.id);
 const cap=choice.source==='station'?row[6]:row[5],maxed=rank>=cap;
 const raw=maxed?null:choice.source==='training'?trainCost(row):
  choice.source==='research'?researchCost(row,p.research):stationCost(row);
 const cost=raw!==null&&Number.isSafeInteger(raw)&&raw>=0?raw:null;
 const balance=Number(p[choice.currency])||0;
 return {key,source:choice.source,id:choice.id,currency:choice.currency,
  name:choice.name,group:choice.group,benefit:choice.benefit,rank,cap,maxed,cost,balance,
  deficit:cost===null?null:Math.max(0,cost-balance),affordable:!maxed&&cost!==null&&balance>=cost,
  action:choice.source==='station'?'station:'+choice.id:
   choice.source==='research'?'research:'+choice.id:'train:'+choice.id};
}
function purchaseProsperityLedgerRank(key){
 if(saveWriteBlocked||!verifyPrimaryContinuity()||run.phase==='fighting'||run.phase==='intermission')return false;
 const quote=prosperityLedgerQuote(key);if(!quote||!quote.affordable)return false;
 const before=p[quote.currency],rank=quote.rank;
 // Reuse the original normal-price Power / Fortress action and save path.
 action(quote.action);
 const after=prosperityLedgerQuote(key);
 return !!after&&after.rank===rank+1&&p[quote.currency]===before-quote.cost;
}
function renderProsperityLedger(){
 return '<section class="prosperity-ledger" aria-label="Earned three currency economy">'+
  '<div class="prosperity-heading"><strong>✦ THE PROSPERITY LEDGER</strong><small>ESSENCE · KNOWLEDGE · GOLD</small></div>'+
  '<p>Compare live prices for optional growth upgrades in Training, Research and Fortress. Future income depends on actual waves; no guaranteed payback time.</p>'+
  '<div class="prosperity-grid">'+prosperityInvestments.map(item=>{
   const q=prosperityLedgerQuote(item.key);if(!q)return '';
   const label=q.maxed?'MAX RANK':q.cost===null?'PRICE UNAVAILABLE':
    q.affordable?'BUY 1 RANK · '+fmt(q.cost)+' '+q.currency.toUpperCase():
    'NEED '+fmt(q.deficit)+' MORE '+q.currency.toUpperCase();
   return '<article class="prosperity-card"><small>'+q.group+'</small>'+
    '<strong>'+q.name+' · '+fmt(q.rank)+' / '+fmt(q.cap)+'</strong>'+
    '<p>'+q.benefit+'</p><span>OWN '+fmt(q.balance)+' '+q.currency.toUpperCase()+
    (q.cost===null?'':' · NEXT '+fmt(q.cost))+'</span>'+
    '<button type="button" data-prosperity="'+q.key+'" '+
    (!q.affordable||saveWriteBlocked?'disabled':'')+'>'+label+'</button></article>';
  }).join('')+'</div>'+
  '<small class="prosperity-foot">Each tap buys one permanent rank at its original price. No auto-spend, offline rewards or new saved fields.</small></section>';
}
function renderCouncilQuartermaster(plan){
 const offers=councilTrainingOffers(plan);
 const investment=plan.tier===1&&plan.wave<=20?renderFirstWatchInvestmentPaths():'';
 const breakthrough=plan.tier===1&&plan.wave<=20?renderBreakthroughRally():'';
 return '<div class="war-quartermaster" aria-label="Quartermaster permanent training">'+
  '<div class="war-quartermaster-head"><strong>⚒ THE FIELD QUARTERMASTER</strong><span>'+fmt(p.essence)+' HERO ESSENCE AVAILABLE</span></div>'+
  '<p>Buy permanent training before a siege. Suggested order reflects upcoming threats, not guaranteed victory.</p>'+breakthrough+investment+
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
function warChestOffers(tier=chosenTier,wave=startWaveForTier(tier)){
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
function renderWarChest(tier=chosenTier,wave=startWaveForTier(tier)){
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
function renderWarCouncil(tier=chosenTier,wave=startWaveForTier(tier)){
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
  ${renderProsperityLedger()}
  ${renderDoctrineTactics(true)}
  ${renderWarChest(plan.tier,plan.wave)}
 </section>`;
}
function encounterUnit(encounter,spawned=0){
 if(encounter.wave<=3)return spawned%3===0?'skeleton':'goblin';
 if(encounter.wave<=7)return ['goblin','skeleton','warg'][spawned%3];
 if(hasNativeVanguard(encounter)&&(spawned===2||spawned===8))return territoryVanguards[encounter.tier-1][1];
 if(encounter.kind==='ambush')return spawned%3===0?'warg':'raider';
 if(encounter.kind==='bannerAssault')return ['banneret','guardian','raider','guardian','shaman','skeleton'][spawned%6];
 if(encounter.kind==='relic')return ['guardian','skeleton','raider','guardian','warg','shaman'][spawned%6];
 if(encounter.kind==='arcane')return ['frostbinder','skeleton','shaman','guardian','thornweaver','warg'][spawned%6];
 const candidates=encounter.units.filter(type=>encounter.wave>=20||!['shaman','frostbinder','sapper','banneret','thornweaver','riftstalker'].includes(type));
 return candidates[Math.floor(Math.random()*candidates.length)]||'goblin';
}
// Alpha 0.12.22 — eight readable territorial marching orders, using the existing
// six-lane battlefield and identical unit/spawn caps. No new stats or save fields.
const nativeMarchOrders={
 raider:{name:'PINCHER FLANKS',lanes:[175,235,350,610,725,785],note:'Fast raiders threaten both outside lanes.'},
 sapper:{name:'BREACH WEDGE',lanes:[235,325,430,530,635,725],note:'Fuse teams push through a broad central wedge.'},
 frostbinder:{name:'WINTER ARC',lanes:[205,315,405,555,645,755],note:'Frost casters trail a shallow protective arc.'},
 guardian:{name:'SHIELD WALL',lanes:[235,315,410,550,645,725],note:'Armored sentries screen the central causeway.'},
 banneret:{name:'WAR BANNERS',lanes:[215,325,430,530,635,745],note:'Two columns advance beside rallying flags.'},
 shaman:{name:'RITUAL SCREEN',lanes:[185,295,405,555,665,775],note:'Healers remain behind marching infantry.'},
 thornweaver:{name:'THORN CRESCENT',lanes:[205,285,385,575,675,755],note:'Ward casters anchor the outer crescent.'},
 riftstalker:{name:'SHADOW PINCERS',lanes:[165,240,325,635,720,795],note:'Blinkers threaten the left and right flanks.'}
};
function nativeMarchOrder(tier){return nativeMarchOrders[territoryVanguards[clamp(Math.floor(Number(tier)||1),1,MAX_TIER)-1][1]];}
function nativeMarchPosition(encounter,index,type){
 const order=nativeMarchOrder(encounter.tier),slot=index%6,row=Math.floor(index/6);
 // Alternate neighboring ranks; the two marked units must not overlap.
 const shift=(row%2?24:-24)*(slot<3?1:-1)+((encounter.tier%3)-1)*5;
 const x=clamp(order.lanes[slot]+shift+rnd(-8,8),145,815);
 const support=['frostbinder','shaman','thornweaver','banneret'].includes(type);
 const y=(support?124:145)+(row%3)*4+(slot%2?3:0)+rnd(0,7);
 return {x,y};
}
// Arrival positions create recognizable formations without adding enemies or changing rewards.
function formationPosition(encounter,spawned,type,isBoss=false,relicGuardian=false,reinforcement=false){
 const index=Math.max(0,Math.floor(Number(spawned)||0)),slot=index%6,row=Math.floor(index/6);
 const jitter=()=>rnd(-9,9),lane=[245,340,435,525,620,715][slot];
 const back=124+row*2+rnd(0,7),front=151+row*2+rnd(0,8);
 if(reinforcement)return {x:(index%2?790:170)+jitter(),y:125+rnd(0,12)};
 if(isBoss)return {x:480+rnd(-23,23),y:134+rnd(0,9)};
 if(relicGuardian)return {x:480+rnd(-16,16),y:130+rnd(0,9)};
 // Every troop in a qualifying native vanguard follows its regional formation.
 // The existing elite ogre and all other encounter kinds retain their original placement.
 if(hasNativeVanguard(encounter))return nativeMarchPosition(encounter,index,type);
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
// Alpha 0.12.23 — validate real specialist limits in one bounded scan,
// not two throwaway arrays per spawn. Keep the same 3-caster / 2-role caps.
const casterRoles=['shaman','frostbinder','thornweaver'];
const limitedSpecialistRoles=new Set(['shaman','frostbinder','sapper','banneret','thornweaver','riftstalker']);
function allowedSpecialist(type,active){
 const caster=casterRoles.includes(type),limited=limitedSpecialistRoles.has(type);
 if(!caster&&!limited)return type;
 let casters=0,same=0;
 for(const enemy of active){
  if(!enemy||enemy.dead)continue;
  if(caster&&casterRoles.includes(enemy.type))casters++;
  if(limited&&enemy.type===type)same++;
  if((caster&&casters>=3)||(limited&&same>=2))return 'skeleton';
 }
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
let useWaystone=true,echoStartSelected=false;
// Alpha 0.14.3: all custom waystone choices are ephemeral UI state, never new save fields.
// Original earned tier milestone flags remain the sole authority for checkpoint access.
let selectedWaystoneWave=null,selectedMilestoneTarget=null;
function earnedWaystones(tier){
 const n=Number(tier);
 if(!Number.isInteger(n)||n<1||n>MAX_TIER||n>p.unlockedTier)return [];
 return [1,...waystonesAt.filter(w=>p.milestones[milestoneKey(n,w)]===true)];
}
function resetWaystoneNavigation(){selectedWaystoneWave=null;selectedMilestoneTarget=null;}
function nearestEarnedWaystone(tier,target){
 const options=earnedWaystones(tier),wave=Number(target);
 if(!Number.isInteger(wave)||wave<1||wave>MAX_WAVE||!options.length)return null;
 return options.filter(w=>w<=wave).at(-1)||1;
}
function selectEarnedWaystone(tier,wave){
 const value=Number(wave);
 if(!Number.isInteger(value)||value===1||tier!==chosenTier||
    (run.phase==='fighting'||run.phase==='intermission')||
    !earnedWaystones(tier).includes(value))return false;
 selectedWaystoneWave=value;selectedMilestoneTarget=null;
 useWaystone=true;echoStartSelected=false;selectedScoutRouteId=null;
 return true;
}
function focusUnclaimedMilestone(tier,wave){
 const target=Number(wave);
 if(!Number.isInteger(target)||tier!==chosenTier||
    (run.phase==='fighting'||run.phase==='intermission')||
    !tierMilestones(tier).includes(target)||p.milestones[milestoneKey(tier,target)])return false;
 const starting=nearestEarnedWaystone(tier,target);
 if(starting===null)return false;
 selectedWaystoneWave=starting>1?starting:null;
 selectedMilestoneTarget=target;
 useWaystone=starting>1;echoStartSelected=false;selectedScoutRouteId=null;
 return true;
}
function renderWaystoneNavigator(tier){
 const earned=earnedWaystones(tier);
 if(earned.length<=1)return '';
 const custom=selectedWaystoneWave!==null&&earned.includes(selectedWaystoneWave);
 const start=startWaveForTier(tier);
 const best=Math.min(MAX_WAVE,Math.max(0,Number(p.bestByTier[tier])||0));
 const remaining=tierMilestones(tier).filter(w=>!p.milestones[milestoneKey(tier,w)]);
 const before=remaining.filter(w=>w<best).slice(0,2);
 const after=remaining.filter(w=>w>=best).slice(0,3);
 const goals=[...before,...after].slice(0,4);
 const waypointButtons=earned.filter(w=>w>1).map(w=>{
  const selected=custom&&selectedWaystoneWave===w&&selectedMilestoneTarget===null;
  return '<button type="button" data-waystone-wave="'+w+'" class="waystone-choice'+(selected?' selected':'')+
   '" aria-pressed="'+selected+'"><strong>WAVE '+formatWave(w)+'</strong>'+
   '<small>✦ EARNED CHECKPOINT</small></button>';
 }).join('');
 const goalButtons=goals.map(w=>{
  const from=nearestEarnedWaystone(tier,w);
  const chosen=selectedMilestoneTarget===w;
  const info=tierMilestone(tier,w);
  return '<button type="button" data-milestone-target="'+w+'" class="waystone-goal'+(chosen?' selected':'')+
   '" aria-pressed="'+chosen+'"><strong>WAVE '+formatWave(w)+' · '+info.name+'</strong>'+
   '<small>START '+formatWave(from)+' · '+(w<best?'MISSED REWARD · REVISIT':'NEXT UNCLAIMED REWARD')+'</small></button>';
 }).join('');
 return '<details class="waystone-navigator" aria-label="Earned waystone navigator">'+
  '<summary><strong>✦ WAYSTONE NAVIGATOR</strong><span>'+formatWave(earned.length-1)+' CHECKPOINTS EARNED · START WAVE '+formatWave(start)+'</span></summary>'+
  '<div class="waystone-navigator-body"><p>Return to any checkpoint <b>already earned in this tier</b>. Every skipped wave stays skipped: no free XP, loot, Sigils, objectives or milestone claims.</p>'+
  '<div class="waystone-navigator-heading">CHOOSE AN EARNED WAYSTONE</div><div class="waystone-navigator-options">'+waypointButtons+'</div>'+
  '<div class="waystone-navigator-heading">NEARBY UNCLAIMED MILESTONES</div>'+
  (goalButtons?'<div class="waystone-goals">'+goalButtons+'</div>':'<p>All milestones in this tier have been claimed.</p>')+
  (selectedMilestoneTarget!==null?'<div class="waystone-navigator-status" role="status">FOCUS WAVE '+formatWave(selectedMilestoneTarget)+
   ' · START AT '+formatWave(start)+' · COMPLETE REAL WAVES TO EARN THE REWARD</div>':
   custom?'<div class="waystone-navigator-status" role="status">MANUAL START · WAVE '+formatWave(start)+'</div>':'')+
  '<small>Scout objectives use the separate Scout Routebook. Choosing a waypoint or milestone target clears a selected Scout route; NORMAL/SCOUT setting remains under your control.</small></div></details>';
}

function startWaveForTier(tier){
 const route=tier===chosenTier?selectedScoutRoute(tier):null;
 if(route&&scoutSignalsSelected)return route.start;
 const latest=waystoneForTier(tier);
 if(echoStartSelected&&echoReturnEligible(tier)&&latest>=100)return 100;
 if(!useWaystone)return 1;
 return selectedWaystoneWave!==null&&earnedWaystones(tier).includes(selectedWaystoneWave)?
  selectedWaystoneWave:latest;
}
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
// Alpha 0.13.3: 90 genuinely useful one-time deep-milestone equipment
// rewards, using the existing item stats, inventory, enhancement and Vault.
const keepsakeWaves=[1500,3000,6000];
const keepsakeTraits=[
 {slot:'boots',name:'Waystone Striders',rarity:2},
 {slot:'ring',name:'Chronicle Signet',rarity:3},
 {slot:'chest',name:'Fallen Kingdom Regalia',rarity:4}
];
function milestoneKeepsake(tier,wave){
 const t=Number(tier),w=Number(wave);
 if(!Number.isInteger(t)||t<1||t>MAX_TIER||!Number.isInteger(w))return null;
 const index=keepsakeWaves.indexOf(w);
 if(index<0||!tierMilestones(t).includes(w))return null;
 const trait=keepsakeTraits[index];
 return {id:'keepsake_'+t+'_'+w,slot:trait.slot,
  rarity:Math.min(8,trait.rarity+Math.floor((t-1)/10)),plus:0,
  legacyName:trait.name+' · '+tierNames[t-1]};
}
function reconcileMilestoneKeepsakes(){
 // A player who already earned the original currency-only milestone receives
 // its new unique equipment on load/import, never a duplicated Sigil payout.
 let restored=0;
 for(let tier=1;tier<=MAX_TIER;tier++){
  for(const wave of keepsakeWaves){
   if(!p.milestones[tier+':'+wave])continue;
   const item=milestoneKeepsake(tier,wave);
   if(!item||p.inventory.some(g=>g&&g.id===item.id)||
      p.pendingGear.some(g=>g&&g.id===item.id))continue;
   const placement=storeEarnedGear(item);
   if(placement==='claimed'||placement==='reserved')restored++;
  }
 }
 return restored;
}
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
 const keepsake=milestoneKeepsake(tier,wave);
 return {icon:keepsake?'◆':'💠',name:milestoneNames[wave]||'Ascension Tribute',
  detail:fmt(sigils)+' Primal Sigils · One-time tier achievement'+
   (keepsake?' · UNIQUE '+rarities[keepsake.rarity].toUpperCase()+' '+gearSlotLabels[keepsake.slot].toUpperCase()+' · '+keepsake.legacyName:'')+
   (wave===6000?' · Eternal equipment can now drop':''),
  kind:'deepSigils',amount:sigils};
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
 let runeReserved=false,gearReserved=false;
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
 const keepsake=milestoneKeepsake(tier,wave);
 if(keepsake)gearReserved=storeEarnedGear(keepsake)==='reserved';
 if(prize.kind==='banner'){const banner='Banner of '+tierNames[tier-1];if(!p.banners.includes(banner))p.banners.push(banner);}
 if(prize.kind==='eternal'){const banner='Eternal Victor of '+tierNames[tier-1];if(!p.banners.includes(banner))p.banners.push(banner);}
 if(prize.kind==='century'){p.essence+=prize.amount;p.sigils+=12+tier*3;}
 if(prize.crestRank){
  p.dominionCrests[tier]=Math.max(Number(p.dominionCrests[tier])||0,prize.crestRank);
  run.maxHealth=maxWall();run.health=Math.min(run.maxHealth,run.health+run.maxHealth*.05);
  notice(tierNames[tier-1].toUpperCase()+' · CREST RANK '+prize.crestRank);
 }
 notice('MILESTONE '+formatWave(wave)+' • '+prize.name.toUpperCase());
 message(gearReserved?'✦ WAVE '+formatWave(wave)+' · UNIQUE KEEPSAKE RESERVED IN EQUIPMENT VAULT':runeReserved?'✦ WAVE '+formatWave(wave)+' · RUNE SAFELY RESERVED IN VAULT':keepsake?'✦ WAVE '+formatWave(wave)+' · UNIQUE EQUIPMENT EARNED':'✦ WAVE '+formatWave(wave)+' MILESTONE UNLOCKED');
 save();return true;
}
let chosenTier=p.selectedTier;
// Alpha 0.14.1 — a finite account journal, not a second reward source.
// Imported records are read-only, type-normalized and capped to 24.
function safeHistoryCount(value){
 const n=Number(value);
 return Number.isSafeInteger(n)&&n>=0?Math.min(n,Number.MAX_SAFE_INTEGER-1):0;
}
function earnedProgressTotals(){
 const count=obj=>Object.values(obj||{}).filter(Boolean).length;
 return {firstClears:safeHistoryCount(p.uniqueClears),
  milestones:count(p.milestones),lostSignals:count(p.explorationFinds),
  oaths:count(p.cartographerOaths),echoes:count(p.echoReturns),
  atlasSeals:count(p.atlasSeals)};
}
function normalizeSiegeHistory(value){
 if(!Array.isArray(value))return [];
 const valid=[];
 for(const rec of value.slice(0,siegeHistoryLimit*2)){
  if(!rec||typeof rec!=='object'||Array.isArray(rec)||
   !['fallen','retreated','victory'].includes(rec.reason))continue;
  const tier=Number(rec.tier),start=Number(rec.startWave),last=Number(rec.lastWave);
  if(!Number.isInteger(tier)||tier<1||tier>30||
   !Number.isInteger(start)||start<1||start>10000||
   !Number.isInteger(last)||last<start||last>10000)continue;
  const clean={id:safeHistoryCount(rec.id),finishedAt:safeHistoryCount(rec.finishedAt),
   reason:rec.reason,tier,startWave:start,lastWave:last,
   doctrineTactic:normalizeDoctrineTactic(rec.doctrineTactic)};
  for(const key of ['cleared','enemies','bossBreaks','specialistBreaks',
   'bosses','bossEscapes','breaches','sabotage','doctrineCasts','doctrineHoldEvents'])
   clean[key]=safeHistoryCount(rec[key]);
  const held=Number(rec.doctrineHeldSeconds);
  clean.doctrineHeldSeconds=Number.isFinite(held)&&held>=0?Math.min(held,1e9):0;
  clean.earned={};
  for(const key of historyEarnedKeys)clean.earned[key]=safeHistoryCount(rec.earned?.[key]);
  valid.push(clean);
  if(valid.length>=siegeHistoryLimit)break;
 }
 return valid;
}
function siegeHistoryForTier(tier=null){
 return p.siegeHistory.filter(entry=>tier===null||entry.tier===tier);
}
function renderSiegeHistory(tier=null){
 const entries=siegeHistoryForTier(tier),scope=tier===null?'ALL TERRITORIES':'TIER '+roman(tier);
 const cards=entries.map(entry=>{
  const outcome={fallen:'FORTRESS FALLEN',retreated:'HONORABLE RETREAT',victory:'ETERNAL VICTORY'}[entry.reason];
  const earned=historyEarnedKeys.filter(k=>entry.earned[k]>0).map(k=>
   ({firstClears:'FIRST CLEARS',milestones:'MILESTONES',lostSignals:'LOST SIGNALS',
     oaths:'OATHS',echoes:'ECHO RETURNS',atlasSeals:'ATLAS SEALS'}[k]+
    ': '+formatWave(entry.earned[k]))).join(' · ');
  const when=entry.finishedAt?new Date(entry.finishedAt).toLocaleDateString():'LEGACY RECORD';
  return '<article class="siege-history-entry"><div><strong>TIER '+roman(entry.tier)+' · '+outcome+
   '</strong><small>'+when+' · WAVE '+formatWave(entry.startWave)+' → '+
   formatWave(entry.lastWave)+'</small></div>'+
   '<p>'+formatWave(entry.cleared)+' WAVES · '+formatWave(entry.enemies)+
   ' FOES · '+formatWave(entry.breaches)+' BREACHES · '+formatWave(entry.bosses)+
   ' BOSSES</p>'+(earned?'<small class="siege-history-earned">EARNED · '+earned+
   '</small>':'<small>NO NEW ONE-TIME OBJECTIVES THIS RUN</small>')+'</article>';
 }).join('');
 return '<details class="siege-history" aria-label="Persistent recent siege history"><summary>✦ SIEGE ARCHIVE · '+
  scope+' <span>'+entries.length+' RECENT / '+siegeHistoryLimit+' MAX</span></summary>'+
  '<div class="siege-history-body"><p>Recent '+siegeHistoryLimit+
  ' completed sorties across all territories, newest first. Earned progress counts represent one-time achievements, not repeatable loot. Older versions did not log sieges.</p>'+
  (cards||'<p class="siege-history-empty">NO RECORDED SIEGES HERE YET. COMPLETE A SIEGE TO ADD ITS RESULT.</p>')+
  '</div></details>';
}
function buildSiegeReport(reason){
 return {reason,tier:run.tier,startWave:run.startWave||1,lastWave:run.wave,
  cleared:run.wavesCleared||0,enemies:run.enemiesDefeated||0,
  bossBreaks:run.totalBossBreaks||0,specialistBreaks:run.totalSpecialistBreaks||0,
  bosses:run.bossVictories||0,bossEscapes:run.bossEscapes||0,breaches:run.totalBreaches||0,
  sabotage:run.sapperBlasts||0,doctrineCasts:run.doctrineCasts||0,
  doctrineTactic:normalizeDoctrineTactic(p.doctrineTactic),
  doctrineHeldSeconds:Math.max(0,Number(run.doctrineHeldSeconds)||0),
  doctrineHoldEvents:run.doctrineHoldEvents||0,
  doctrineCastReasons:{...(run.doctrineCastReasons||{})}};
}
function finishSiege(reason){
 lastSiegeReport=buildSiegeReport(reason);
 if(run.historyActive&&!run.historyWritten&&
  ['fallen','retreated','victory'].includes(reason)){
  const now=earnedProgressTotals(),start=run.historyStartTotals||now;
  const earned={};
  for(const key of historyEarnedKeys)earned[key]=Math.max(0,now[key]-(start[key]||0));
  const entry={...lastSiegeReport,earned,finishedAt:Date.now(),
   id:safeHistoryCount(p.siegeHistorySeq)+1};
  p.siegeHistorySeq=entry.id;
  const normalized=normalizeSiegeHistory([entry])[0];
  if(normalized){
   p.siegeHistory.unshift(normalized);
   p.siegeHistory.length=Math.min(p.siegeHistory.length,siegeHistoryLimit);
  }
  run.historyWritten=true;
 }
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
  ['TOTAL BREACHES',data.breaches],
  ['SIGNATURE AUTO-CASTS',data.doctrineCasts||0],
  ['CHARGE HOLDS',data.doctrineHoldEvents||0],
  ['COMBAT TIME HELD',(data.doctrineHeldSeconds||0).toFixed(1)+'s']
 ];
 $('siegeReportMetrics').innerHTML=metrics.map(([name,value])=>
  `<div class="siege-report-stat"><small>${name}</small><strong>${typeof value==='number'?formatWave(value):value}</strong></div>`).join('');
 $('siegeReportRange').textContent='TIER '+roman(data.tier)+' · STARTED WAVE '+formatWave(data.startWave)+' · LAST REACHED '+formatWave(data.lastWave)+
  (data.sabotage?' · '+formatWave(data.sabotage)+' SAPPER BLAST'+(data.sabotage===1?'':'S'):'')+
  ' · '+formatWave(data.doctrineCasts||0)+' HERO AUTO-CASTS'+
  ' · '+doctrineTacticModes[normalizeDoctrineTactic(data.doctrineTactic)].name+' TIMING'+
  ((data.doctrineCastReasons?.urgent||0)?' · '+formatWave(data.doctrineCastReasons.urgent)+' URGENT CASTS':'');
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
// Alpha 0.15.5: read-only progress toward the next three existing Watch chapters.
function firstWatchHorizon(count=3){
 const claimed=Array.isArray(p.firstWatchClaimed)?p.firstWatchClaimed:[];
 const next=earlyWatchChapters.findIndex((_,i)=>!claimed.includes(i));if(next<0)return [];
 const howMany=Math.max(1,Math.min(3,Math.floor(Number(count)||3)));
 const active=Math.max(0,Number(p.battleSeconds)||0),clears=Math.max(0,Number(p.uniqueClears)||0);
 return earlyWatchChapters.slice(next,next+howMany).map((chapter,offset)=>{
  const [minutes,name,gold,essence,points,sigils]=chapter;
  const waveGate=Math.ceil(minutes*1.5),timeRemainingSeconds=Math.max(0,minutes*60-active),waveRemaining=Math.max(0,waveGate-clears);
  return {index:next+offset,name,minutes,waveGate,timeRemainingSeconds,waveRemaining,
   timeReady:timeRemainingSeconds===0,wavesReady:waveRemaining===0,gold,essence,points,sigils};
 });
}
function renderFirstWatchHorizon(){
 const goals=firstWatchHorizon();if(!goals.length)return '';
 return '<details class="watch-horizon" aria-label="First Watch next chapter requirements">'+
  '<summary><strong>✦ THE FIRST WATCH · THREE-CHAPTER HORIZON</strong>'+
  '<span>'+fmt(p.firstWatchClaimed.length)+' / 16 CLAIMED · VIEW BOTH REQUIRED GATES</span></summary>'+
  '<p>Each chapter requires <b>both</b> actual active combat minutes and new first-time wave victories. Replaying already cleared waves can add time, but not first clears. These are fixed requirements, not an earnings forecast.</p>'+
  '<div class="watch-horizon-grid">'+goals.map(q=>
   '<article class="watch-horizon-card"><small>CHAPTER '+(q.index+1)+' · '+q.minutes+' ACTIVE MINUTES</small>'+
   '<strong>'+q.name+'</strong>'+
   '<div class="watch-horizon-gates"><span class="'+(q.timeReady?'gate-ready':'')+'">'+
   (q.timeReady?'✓ TIME MET':'◷ '+Math.ceil(q.timeRemainingSeconds/60)+' MIN STILL NEEDED')+'</span>'+
   '<span class="'+(q.wavesReady?'gate-ready':'')+'">'+
   (q.wavesReady?'✓ NEW WAVES MET':'⚔ '+fmt(q.waveRemaining)+' FIRST CLEARS NEEDED')+'</span></div>'+
   '<small>GOALS · '+fmt(q.minutes)+' MIN / '+fmt(q.waveGate)+' UNIQUE WAVES</small></article>').join('')+
  '</div><small class="watch-horizon-foot">Only verified combat grants chapters, in order. No automatic claims, offline time or additional save data.</small></details>';
}
// Alpha 0.15.6 — earned Watch frontier guidance, no new wave or reward economy.
function firstWatchFrontiers(){
 const watch=firstWatchHorizon(1)[0];
 if(!watch||watch.waveRemaining===0)return null;
 const unlocked=Math.min(MAX_TIER,Math.max(1,Math.floor(Number(p.unlockedTier)||1)));
 const options=tierNames.slice(0,unlocked).map((name,i)=>({
  tier:i+1,name,best:Math.max(0,Math.min(MAX_WAVE,Math.floor(Number(p.bestByTier[i+1])||0)))
 })).sort((a,b)=>a.best-b.best||a.tier-b.tier).slice(0,3);
 return {watch,unlocked,options};
}
function renderFirstWatchFrontiers(){
 const data=firstWatchFrontiers();if(!data)return '';
 return '<section class="watch-frontiers" aria-label="First Watch earned frontier routes">'+
  '<div class="watch-frontiers-head"><strong>✦ THE FRONTIER WATCH · FIND NEW WAVE CLEARS</strong>'+
  '<small>'+fmt(data.watch.waveRemaining)+' FIRST-TIME WAVE VICTORIES STILL NEEDED</small></div>'+
  '<p>First Watch counts <b>new wave victories in each territory</b> once. You may revisit earlier tiers or try unlocked realms to earn new first clears. Higher tiers can be harder; these routes are not promised wins.</p>'+
  (data.unlocked===1?
   '<small class="watch-frontiers-locked">TIER II REMAINS LOCKED · Clear Tier I wave 20 in real combat to open the next frontier.</small>':
   '<small class="watch-frontiers-locked">'+fmt(data.unlocked)+' TERRITORIES UNLOCKED · Showing up to three least-explored realms. The full tier grid remains available.</small>')+
  '<div class="watch-frontiers-grid">'+data.options.map(o=>
   '<article class="watch-frontier-card"><small>TIER '+roman(o.tier)+(o.best===0?' · UNTRIED':' · PREVIOUS BEST '+fmt(o.best))+'</small>'+
    '<strong>'+o.name+'</strong>'+
    '<p>'+(o.best===0?'Start at wave 1; each authentic victory may add one new first clear.':
       'To earn more unique clears here, beat your previous best wave '+fmt(o.best)+'.')+'</p>'+
    '<button type="button" data-watch-frontier="'+o.tier+'" '+
    (o.tier===chosenTier||saveWriteBlocked||run.phase==='fighting'||run.phase==='intermission'?'disabled':'')+'>'+
    (o.tier===chosenTier?'CURRENTLY SELECTED':'PREPARE THIS TIER')+'</button></article>').join('')+
  '</div><small class="watch-frontiers-foot">Selecting a tier only opens its existing lobby and battle preparation. It never starts combat, skips waves or awards resources.</small></section>';
}
// Alpha 0.15.7 — post-fifth-chapter readiness is computed from earned inventory.
function expeditionReadiness(){
 if(!Array.isArray(p.firstWatchClaimed)||!p.firstWatchClaimed.includes(4)||!firstWatchHorizon(1).length)return null;
 const equippedIds=new Set(Object.values(p.equipped||{})),runeIds=new Set((p.runes||[]).map(r=>r.id));
 const owned=(p.inventory||[]),runes=p.runes||[];
 const score=g=>(1+(Number(g.rarity)||0)*.6)*(1+(Number(g.plus)||0)*.24);
 const matchingSlots=g=>g.slot==='ring'?ringSlots:gearSlots.filter(slot=>slot===g.slot);
 const upgrades=owned.filter(g=>!equippedIds.has(g.id)&&matchingSlots(g).some(slot=>{
  const current=owned.find(x=>x.id===p.equipped[slot]);return !current||score(g)>score(current);
 })).length;
 const equipped=gearSlots.filter(slot=>owned.some(g=>g.id===p.equipped[slot])).length;
 const sockets=Object.values(p.socketed||{}).filter(id=>runeIds.has(id));
 const socketedCount=sockets.length,unsocketed=runes.filter(r=>!sockets.includes(r.id)).length;
 const offers=councilTrainingOffers(warCouncilPlan(chosenTier,startWaveForTier(chosenTier)));
 const training=offers.find(o=>o.cost!==null)||null;
 const tierIII=p.unlockedTier>=3;
 return {equipped,gearSlots:gearSlots.length,owned:owned.length,upgrades,gearReserved:(p.pendingGear||[]).length,
  runes:runes.length,socketed:socketedCount,unsocketed,runeReserved:(p.pendingRelics||[]).length,
  training:training?{name:training.title,role:training.role,rank:training.rank,
   cost:training.cost,affordable:training.affordable,shortfall:Math.max(0,training.cost-p.essence)}:null,
  tierIII,tierIIWave:p.bestByTier[2]||0,readyForIII:tierIII&&chosenTier===3};
}
function renderExpeditionReadiness(){
 const q=expeditionReadiness();if(!q)return '';
 const training=q.training?(q.training.affordable?'READY TO TRAIN · '+fmt(q.training.cost)+' ESSENCE':
  'NEED '+fmt(q.training.shortfall)+' MORE ESSENCE'):'ALL FIELD TRAINING MAXED';
 return '<details class="expedition-readiness" aria-label="Earned post-First-Watch expedition readiness">'+
  '<summary><strong>✦ EXPEDITION READINESS · THE LONG MARCH</strong><span>GEAR · RUNES · TRAINING · TIER III</span></summary>'+
  '<p>Chapter V earned. Prepare for deeper territory without free upgrades or predicted wins. Every count, rank and price below comes from your current saved character.</p>'+
  '<div class="expedition-readiness-grid">'+
   '<article><small>⚒ EQUIPMENT VAULT</small><strong>'+fmt(q.equipped)+' / '+q.gearSlots+' SLOTS EQUIPPED</strong>'+
   '<p>'+fmt(q.owned)+' owned · '+fmt(q.upgrades)+' unequipped candidates that could improve a slot'+
   (q.gearReserved?' · '+fmt(q.gearReserved)+' reserved gear':'')+'</p>'+
   '<button type="button" data-expedition-open="equipment">INSPECT EQUIPMENT</button></article>'+
   '<article><small>◇ RUNE WORKSHOP</small><strong>'+fmt(q.socketed)+' / '+q.gearSlots+' SOCKETS USED</strong>'+
   '<p>'+fmt(q.runes)+' owned · '+fmt(q.unsocketed)+' unsocketed'+
   (q.runeReserved?' · '+fmt(q.runeReserved)+' reserved runes':'')+'</p>'+
   '<button type="button" data-expedition-open="runes">INSPECT RUNES</button></article>'+
   '<article><small>↟ FIELD QUARTERMASTER</small><strong>'+(q.training?q.training.name+' · RANK '+fmt(q.training.rank):'TRAINING MASTERED')+'</strong>'+
   '<p>'+training+'</p><button type="button" data-expedition-open="training">REVIEW TRAINING</button></article>'+
   '<article><small>♛ THE THIRD TERRITORY</small><strong>'+(q.tierIII?'TIER III · FROSTBOUND PASS':'TIER III · SEALED')+'</strong>'+
   '<p>'+(q.tierIII?'Tier II wave 20 earned. Enter Tier III only if your build is ready.':
     'Earn Tier II wave 20 to open this realm · Best Tier II wave '+fmt(q.tierIIWave)+'.')+'</p>'+
   '<button type="button" data-watch-frontier="3" '+
    (!q.tierIII||q.readyForIII||saveWriteBlocked||run.phase==='fighting'||run.phase==='intermission'?'disabled':'')+'>'+
   (q.readyForIII?'TIER III SELECTED':q.tierIII?'PREPARE TIER III':'LOCKED · TIER II WAVE 20')+'</button></article>'+
  '</div><small class="expedition-readiness-foot">Inspection opens the existing Forge, Armory or Rune Workshop. Nothing purchases, equips, claims or launches automatically. Higher tiers are not guaranteed easier.</small></details>';
}
// Alpha 0.15.8: Chapters VII–X and genuine price quotes, derived without altering saves.
function longMarchLedger(){
 if(!Array.isArray(p.firstWatchClaimed)||!p.firstWatchClaimed.includes(5)||p.firstWatchClaimed.includes(9))return null;
 const active=Math.max(0,Number(p.battleSeconds)||0),clears=Math.max(0,Number(p.uniqueClears)||0);
 const goals=earlyWatchChapters.slice(6,10).map((row,offset)=>{
  const [minutes,name,gold,essence,points,sigils]=row,index=offset+6,waves=Math.ceil(minutes*1.5);
  return {index,name,minutes,waves,claimed:p.firstWatchClaimed.includes(index),
   timeLeft:Math.max(0,minutes*60-active),wavesLeft:Math.max(0,waves-clears)};
 });
 const priced=(rows,currency,getRank,getCost,getCap)=>{
  const offers=rows.map(row=>({id:row[0],name:row[1],rank:getRank(row),cap:getCap(row),cost:getCost(row)}))
    .filter(o=>o.rank<o.cap&&Number.isSafeInteger(o.cost)&&o.cost>=0)
    .sort((a,b)=>a.cost-b.cost||a.name.localeCompare(b.name));
  const o=offers[0]||null,balance=Math.max(0,Math.floor(Number(p[currency])||0));
  return {currency,balance,name:o?o.name:null,rank:o?o.rank:null,cost:o?o.cost:null,
   affordable:!!o&&balance>=o.cost,shortfall:o?Math.max(0,o.cost-balance):null,eligible:offers.length};
 };
 const essence=priced(training,'essence',row=>t(row[0]),row=>trainCost(row),row=>row[5]);
 const knowledge=priced(research,'knowledge',row=>res(row[0]),row=>researchCost(row,p.research),row=>row[5]);
 const equipped=Object.values(p.equipped||{}).map(id=>p.inventory.find(g=>g.id===id)).filter(Boolean);
 const gold=priced(equipped.map(g=>[g.id,gearTitle(g),g]),'gold',row=>row[2].plus,row=>gearCost(row[2]),()=>50);
 return {goals,essence,knowledge,gold,unlocked:p.unlockedTier,selected:chosenTier,clears,active};
}
function renderLongMarchLedger(){
 const data=longMarchLedger();if(!data)return '';
 const purchases=[{title:'HERO TRAINING',tab:'training',q:data.essence},
  {title:'ROYAL RESEARCH',tab:'research',q:data.knowledge},
  {title:'EQUIPPED GEAR ENHANCEMENT',tab:'equipment',q:data.gold}];
 return '<details class="long-march-ledger" aria-label="Chapters seven through ten requirements and real upgrade costs">'+
  '<summary><strong>✦ THE LONG MARCH · CHAPTERS VII–X</strong><small>TIME · FIRST CLEARS · ORIGINAL PRICES</small></summary>'+
  '<p>Both active battle time and distinct first-time wave victories are required. New territories can provide fresh clears, but no route guarantees success. These are current thresholds, not projected playtime.</p>'+
  '<div class="long-march-goals">'+data.goals.map(q=>
   '<article><small>CHAPTER '+roman(q.index+1)+' · '+q.name+'</small>'+
   '<strong>'+fmt(q.minutes)+' MIN · '+fmt(q.waves)+' UNIQUE WAVES</strong>'+
   '<span>'+(q.claimed?'✓ REWARD ALREADY CLAIMED':(q.timeLeft?'◷ '+Math.ceil(q.timeLeft/60)+' MIN STILL NEEDED':'✓ TIME GATE MET')+
    ' · '+(q.wavesLeft?'⚔ '+fmt(q.wavesLeft)+' FIRST CLEARS NEEDED':'✓ WAVE GATE MET'))+'</span></article>').join('')+'</div>'+
  '<p class="long-march-caption">Lowest currently available one-rank prices by currency—not recommendations or predicted income. Equipped gear only for the Gold quote; unequipped items can be reviewed in Equipment.</p>'+
  '<div class="long-march-economy">'+purchases.map(item=>{
   const q=item.q;
   const status=q.name?(q.affordable?'AFFORDABLE NOW':fmt(q.shortfall)+' MORE '+q.currency.toUpperCase()+' NEEDED'):'NO ELIGIBLE UPGRADE';
   return '<article><small>'+item.title+'</small>'+
    '<strong>'+(q.name?q.name+' · RANK '+fmt(q.rank):'MAXED OR UNAVAILABLE')+'</strong>'+
    '<span>OWN '+fmt(q.balance)+' '+q.currency.toUpperCase()+(q.name?' · NEXT '+fmt(q.cost):'')+'</span>'+
    '<em>'+status+'</em><button type="button" data-long-march-open="'+item.tab+'">INSPECT '+item.title+'</button></article>';
  }).join('')+'</div>'+
  '<small class="long-march-foot">Inspection opens the existing upgrade menu. No auto-spend, claimed rewards, hidden currencies, guaranteed returns or saved forecast data.</small></details>';
}
// Alpha 0.15.9 — pure inspection of real owned gear, rune effects and prices.
function marchBuildAudit(){
 const claimed=Array.isArray(p.firstWatchClaimed)?p.firstWatchClaimed:[];
 if(!claimed.includes(6)||claimed.includes(9))return null;
 const worn=new Set(Object.values(p.equipped||{})),owned=p.inventory||[];
 const score=g=>(1+(Number(g.rarity)||0)*.6)*(1+(Number(g.plus)||0)*.24);
 const upgrades=owned.filter(g=>g&&typeof g.id==='string'&&!worn.has(g.id)).flatMap(g=>{
  const slots=g.slot==='ring'?ringSlots:gearSlots.filter(slot=>slot===g.slot);
  return slots.map(slot=>{
   const current=owned.find(x=>x&&x.id===p.equipped[slot]),gain=score(g)-(current?score(current):1);
   return {slot,name:gearTitle(g),gain:+gain.toFixed(3)};
  }).filter(x=>x.gain>0);
 }).sort((a,b)=>b.gain-a.gain||a.slot.localeCompare(b.slot)).slice(0,3);
 const sockets=Object.values(p.socketed||{}),runes=p.runes||[];
 const effects=Object.keys(runeNames).map(type=>{
  const available=runes.filter(r=>r&&r.type===type);
  const equipped=available.filter(r=>sockets.includes(r.id));
  const coefficient=socketValue(type)*(type==='fortune'?4:1);
  return {type,name:runeNames[type][1],owned:available.length,slotted:equipped.length,
   effectPct:+(coefficient*100).toFixed(2),description:
    type==='fortune'?'Gold from kills (rune component)':
    type==='frost'?'Arrow slow chance (rune component)':
    type==='storm'?'Arrow chain chance (rune component)':'Arrow burn chance (rune component)'};
 });
 const quote=(key,currency)=>{
  const row=(currency==='essence'?training:research).find(r=>r[0]===key);
  const rank=currency==='essence'?t(key):res(key),cap=row[5],maxed=rank>=cap;
  const cost=maxed?null:currency==='essence'?trainCost(row):researchCost(row,p.research);
  const balance=Math.max(0,Number(p[currency])||0);
  return {key,name:row[1],rank,cap,currency,maxed,cost,balance,
   shortfall:cost===null?null:Math.max(0,cost-balance),
   affordable:cost!==null&&balance>=cost};
 };
 return {damage:+damage().toFixed(1),wall:maxWall(),shotSeconds:+attackInterval().toFixed(2),
  upgrades,effects,ownedGear:owned.length,ownedRunes:runes.length,
  quotes:[quote('power','essence'),quote('fort','essence'),quote('attunement','knowledge')]};
}
function renderMarchBuildAudit(){
 const q=marchBuildAudit();if(!q)return '';
 const money=x=>x.maxed?'MAX RANK':
  x.affordable?'AFFORDABLE · '+fmt(x.cost)+' '+x.currency.toUpperCase():
  'NEED '+fmt(x.shortfall)+' MORE '+x.currency.toUpperCase();
 return '<details class="march-build-audit" aria-label="Actual owned gear, rune and upgrade comparisons">'+
  '<summary><strong>✦ ARMORY FIELD AUDIT · CHAPTERS VIII–X</strong><small>OWNED BUILDS · ORIGINAL PRICES</small></summary>'+
  '<p>Compare your actual build with owned alternatives. A higher raw equipment score does not guarantee victory or imply an exact DPS improvement. All decisions remain yours.</p>'+
  '<div class="march-build-stats"><span>HERO HIT <b>'+q.damage.toFixed(1)+'</b></span>'+
   '<span>WALL HP <b>'+fmt(q.wall)+'</b></span><span>SHOT INTERVAL <b>'+q.shotSeconds.toFixed(2)+'s</b></span></div>'+
  '<div class="march-build-sections">'+
   '<article><small>⚒ EQUIPMENT CANDIDATES</small><strong>'+fmt(q.ownedGear)+' OWNED · UP TO THREE OPTIONS</strong>'+
    (q.upgrades.length?q.upgrades.map(x=>'<p>'+gearSlotLabels[x.slot]+' · '+x.name+
     ' · RAW SLOT SCORE +'+x.gain.toFixed(2)+'</p>').join(''):
      '<p>No unequipped item currently exceeds the score of the matching equipped slot.</p>')+
    '<button type="button" data-march-build-open="equipment">INSPECT EQUIPMENT</button></article>'+
   '<article><small>◇ RUNE CONTRIBUTIONS</small><strong>'+fmt(q.ownedRunes)+' OWNED RUNES</strong>'+
    q.effects.map(x=>'<p>'+x.name+' · '+x.slotted+' SOCKETED / '+x.owned+' OWNED · +'+
     x.effectPct.toFixed(2)+'% '+x.description+'</p>').join('')+
    '<button type="button" data-march-build-open="runes">INSPECT RUNE SOCKETS</button></article>'+
   '<article><small>↟ SPECIFIC PERMANENT COSTS</small><strong>MIGHT · FORTITUDE · RUNIC HARMONICS</strong>'+
    q.quotes.map(x=>'<p>'+x.name+' '+fmt(x.rank)+' / '+fmt(x.cap)+' · '+money(x)+'</p>').join('')+
    '<div class="march-build-actions"><button type="button" data-march-build-open="training">HERO TRAINING</button>'+
     '<button type="button" data-march-build-open="research">ROYAL RESEARCH</button></div></article>'+
  '</div><small class="march-build-foot">Gear comparison uses original raw slot scores, not a DPS prediction. Rune figures are each type’s independent contribution before other skills. No auto-equipping, charges, or saved forecast fields.</small></details>';
}
// Alpha 0.15.10 — quoted Essence ladder, no hypothetical income or saved plan.
function essencePriceLadder(){
 const claimed=Array.isArray(p.firstWatchClaimed)?p.firstWatchClaimed:[];
 if(!claimed.includes(7)||claimed.includes(9))return null;
 const balance=Math.max(0,Math.floor(Number(p.essence)||0));
 const paths=['power','haste','fort','essence'].map(id=>{
  const row=training.find(r=>r[0]===id);
  const rank=t(id),cap=row[5],prices=[];
  let budget=balance,affordableRanks=0;
  for(let i=0;i<3&&rank+i<cap;i++){
   const amount=trainCostAt(row,rank+i);
   if(!Number.isSafeInteger(amount)||amount<0)break;
   prices.push(amount);
   if(amount<=budget&&affordableRanks===i){budget-=amount;affordableRanks++;}
  }
  const threeCost=prices.reduce((sum,x)=>sum+x,0),next=prices.length?prices[0]:null;
  return {id,name:row[1],rank,cap,balance,prices,levelsQuoted:prices.length,
   next,threeCost,shortfallNext:next===null?null:Math.max(0,next-balance),
   shortfallThree:prices.length?Math.max(0,threeCost-balance):null,
   affordableRanks};
 });
 const chapter=firstWatchHorizon(1)[0]||null;
 return {balance,paths,chapter:chapter?{
  index:chapter.index,minutes:chapter.minutes,waves:chapter.waveGate,
  minutesLeft:Math.ceil(chapter.timeRemainingSeconds/60),wavesLeft:chapter.waveRemaining}:null};
}
function renderEssencePriceLadder(){
 const q=essencePriceLadder();if(!q)return '';
 return '<details class="essence-price-ladder" aria-label="Actual high-rank Hero Essence affordability">'+
  '<summary><strong>✦ THE QUARTERMASTER · ESSENCE LADDER</strong>'+
   '<span>FOUR PATHS · NEXT THREE RANKS</span></summary>'+
  '<p>Current rank prices are quoted from the real Training formula. Each row shows the next rank and cumulative cost for up to three ranks, assuming you buy only that path. No expected farming income, guaranteed returns, or automatic purchases.</p>'+
  '<div class="essence-ladder-balance">HELD HERO ESSENCE <strong>'+fmt(q.balance)+'</strong></div>'+
  '<div class="essence-ladder-grid">'+q.paths.map(x=>{
   const next=x.next===null?'MAXIMUM RANK':
    x.shortfallNext===0?'NEXT RANK AFFORDABLE':
    fmt(x.shortfallNext)+' MORE ESSENCE FOR NEXT RANK';
   return '<article><small>'+x.name.toUpperCase()+' · RANK '+fmt(x.rank)+' / '+fmt(x.cap)+'</small>'+
    '<strong>'+(x.next===null?'MAXED':fmt(x.next)+' ESSENCE · NEXT RANK')+'</strong>'+
    '<p>'+(x.levelsQuoted?'NEXT '+x.levelsQuoted+' RANK'+(x.levelsQuoted===1?'':'S')+
     ' TOTAL · '+fmt(x.threeCost)+' ESSENCE':'NO FURTHER RANKS')+'</p>'+
    '<span>'+next+'</span>'+
    (x.levelsQuoted?'<small>'+x.affordableRanks+' / '+x.levelsQuoted+
     ' CONSECUTIVE RANKS AFFORDABLE NOW</small>':'')+'</article>';
  }).join('')+'</div>'+
  '<div class="essence-ladder-footer"><button type="button" data-essence-ladder-open="training">OPEN HERO TRAINING</button>'+
   '<small>Ranks are priced sequentially. Buying one path reduces the Essence available for every other path. The game never spends automatically here.</small></div>'+
  '</details>';
}

// Alpha 0.15.11 — honest remaining Watch gates and side-by-side earned-budget quotes.
// This is a price comparison, not a build recommendation or a simulated outcome.
function veteranWatchStrategy(){
 const claimed=Array.isArray(p.firstWatchClaimed)?p.firstWatchClaimed:[];
 if(!claimed.includes(8)||claimed.includes(15))return null;
 const seconds=Math.max(0,Number(p.battleSeconds)||0),clears=Math.max(0,Number(p.uniqueClears)||0);
 const goals=earlyWatchChapters.slice(10,16).map((chapter,i)=>{
  const [minutes,name]=chapter,index=i+10,waves=Math.ceil(minutes*1.5);
  return {index,name,minutes,waves,claimed:claimed.includes(index),
   secondsLeft:Math.max(0,minutes*60-seconds),wavesLeft:Math.max(0,waves-clears)};
 });
 const balance=Math.max(0,Math.floor(Number(p.essence)||0));
 const plans=[
  {id:'concentrated',name:'MIGHT · THREE CONSECUTIVE RANKS',steps:[['power',3]]},
  {id:'distributed',name:'MIGHT · REFLEXES · FORTITUDE',steps:[['power',1],['haste',1],['fort',1]]}
 ].map(plan=>{
  const items=[],prices=[];
  for(const [id,amount] of plan.steps){
   const row=training.find(r=>r[0]===id),rank=t(id);
   for(let i=0;i<amount&&rank+i<row[5];i++){
    const cost=trainCostAt(row,rank+i);
    if(!Number.isSafeInteger(cost)||cost<0)break;
    prices.push(cost);items.push({id,name:row[1],rank:rank+i+1,cost});
   }
  }
  const total=prices.reduce((sum,cost)=>sum+cost,0);
  return {id:plan.id,name:plan.name,items,total,affordable:items.length===3&&balance>=total,
   complete:items.length===3,shortfall:items.length===3?Math.max(0,total-balance):null};
 });
 return {balance,goals,plans};
}

// Alpha 0.15.13 — local-only player-controlled preview percentage (no saved field).
let veteranEnvelopePercent=50;
function setVeteranEnvelopePercent(value){
 const n=Number(value);
 if(![25,50,75].includes(n))return false;
 veteranEnvelopePercent=n;return true;
}
// Alpha 0.15.12 — deterministic original-cost previews, now with a selectable
// 25 / 50 / 75 percent spending envelope. Never buys or reserves anything.
function veteranWatchEnvelope(){
 const claimed=Array.isArray(p.firstWatchClaimed)?p.firstWatchClaimed:[];
 if(!claimed.includes(9)||claimed.includes(15))return null;
 const held=Math.max(0,Math.floor(Number(p.essence)||0)),percent=veteranEnvelopePercent,budget=Math.floor(held*percent/100);
 const paths=[
  {id:'might',name:'MIGHT FOCUS',order:['power','power','power','power','power','power']},
  {id:'spread',name:'MIGHT · REFLEXES · FORTITUDE',order:['power','haste','fort','power','haste','fort']}
 ].map(path=>{
  const ranks={},items=[];let spent=0,blocked=null;
  for(const id of path.order){
   const row=training.find(r=>r[0]===id),rank=t(id)+(ranks[id]||0);
   if(rank>=row[5]){blocked={id,reason:'MAX RANK',price:null};break;}
   const price=trainCostAt(row,rank);
   if(!Number.isSafeInteger(price)||price<0){blocked={id,reason:'PRICE UNAVAILABLE',price:null};break;}
   if(price>budget-spent){blocked={id,reason:'OUTSIDE ENVELOPE',price};break;}
   spent+=price;ranks[id]=(ranks[id]||0)+1;
   items.push({id,name:row[1],rank:rank+1,price});
  }
  return {id:path.id,name:path.name,items,spent,remaining:budget-spent,
   blocked,full:items.length===path.order.length};
 });
 return {held,percent,budget,paths};
}
function renderVeteranWatchEnvelope(){
 const q=veteranWatchEnvelope();if(!q)return '';
 return '<section class="veteran-envelope" aria-label="Player-selectable Hero Essence original-price spending preview">'+
  '<div class="veteran-envelope-head"><strong>✦ FIELD SPENDING ENVELOPE · '+q.percent+'% OF HELD ESSENCE</strong>'+
   '<span>'+fmt(q.budget)+' / '+fmt(q.held)+' ESSENCE</span></div>'+
  '<div class="veteran-envelope-options" role="group" aria-label="Select temporary preview budget percentage">'+
   [25,50,75].map(percent=>'<button type="button" data-veteran-envelope="'+percent+'" aria-pressed="'+(q.percent===percent)+'" class="'+(q.percent===percent?'selected':'')+'">'+percent+'% PREVIEW</button>').join('')+'</div>'+
  '<p>Each independent example may spend at most the selected portion of your <b>currently held</b> Essence on up to six next ranks. It stops at the first rank outside its own budget, using exact original prices and caps. Leftovers differ; these are not equal-power builds or guaranteed battle outcomes.</p>'+
  '<div class="veteran-envelope-paths">'+q.paths.map(path=>
   '<article><small>'+path.name+'</small><strong>'+fmt(path.spent)+' SPENT · '+fmt(path.remaining)+' LEFT</strong>'+
    '<span>'+path.items.length+' / 6 NEXT RANKS WITHIN ENVELOPE</span>'+
    '<p>'+(path.items.length?path.items.map(x=>x.name+' '+fmt(x.rank)+' ('+fmt(x.price)+')').join(' · '):'No next rank fits this envelope.')+'</p>'+
    (path.blocked?'<em>NEXT '+(path.blocked.price===null?path.blocked.reason:fmt(path.blocked.price)+' ESSENCE · '+path.blocked.reason)+'</em>':
      '<em>ALL SIX QUOTED RANKS FIT</em>')+'</article>').join('')+'</div>'+
  '<small>Inspection only. The percentage choice resets when the game reloads; nothing is saved, reserved, purchased or forecast. Open Hero Training to choose real upgrades.</small></section>';
}
function renderVeteranWatchStrategy(){
 const q=veteranWatchStrategy();if(!q)return '';
 return '<details class="veteran-watch" aria-label="First Watch chapters eleven through sixteen and original training cost comparison">'+
  '<summary><strong>✦ VETERAN WATCH · CHAPTERS XI–XVI</strong><small>REAL GATES · EARNED ESSENCE OPTIONS</small></summary>'+
  '<p>Every remaining chapter needs both active battle time and genuinely new first-cleared waves. A timer alone does not award progress. These are exact existing requirements, not completion forecasts.</p>'+
  '<div class="veteran-watch-goals">'+q.goals.map(g=>
   '<article><small>CHAPTER '+roman(g.index+1)+' · '+g.name+'</small>'+
   '<strong>'+fmt(g.minutes)+' MIN / '+fmt(g.waves)+' FIRST CLEARS</strong>'+
   '<span>'+(g.claimed?'✓ ALREADY EARNED':(g.secondsLeft?'◷ '+Math.ceil(g.secondsLeft/60)+' MIN NEEDED':'✓ TIME MET')+
    ' · '+(g.wavesLeft?'⚔ '+fmt(g.wavesLeft)+' NEW WAVES NEEDED':'✓ WAVE GATE MET'))+'</span></article>').join('')+'</div>'+
  '<div class="veteran-watch-budget">ACTUALLY HELD HERO ESSENCE <strong>'+fmt(q.balance)+'</strong></div>'+
  '<p>Compare the <b>present cost</b> of investing three ranks in Might versus one each in Might, Reflexes and Fortitude. The alternatives are not equally powerful and no combat result is predicted. Each option is quoted independently from the same unspent balance.</p>'+
  '<div class="veteran-watch-plans">'+q.plans.map(plan=>
   '<article><small>'+plan.name+'</small>'+
   '<strong>'+(plan.complete?fmt(plan.total)+' ESSENCE':'RANK CAP REACHED')+'</strong>'+
   '<p>'+plan.items.map(item=>item.name+' '+fmt(item.rank)+' ('+fmt(item.cost)+')').join(' · ')+'</p>'+
   '<span>'+(plan.complete?(plan.affordable?'FULL PLAN AFFORDABLE NOW':fmt(plan.shortfall)+' MORE ESSENCE NEEDED'):'THREE NEW RANKS NOT AVAILABLE')+'</span></article>').join('')+'</div>'+
  renderVeteranWatchEnvelope()+
  '<div class="veteran-watch-footer"><button type="button" data-veteran-watch-open="training">REVIEW HERO TRAINING</button>'+
   '<small>Illustrative spending choices only. No automatic purchases, future income estimates, rule changes, or saved planning data.</small></div></details>';
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
 const startWave=startWaveForTier(tier);
 const focus=encounterDirector(startWave,tier);
 let upcoming=null;
 for(let w=startWave;w<=Math.min(MAX_WAVE,startWave+100);w++){
  const event=encounterDirector(w,tier);
  if(['chapterBoss','commander','treasure','relic','bannerAssault','arcane','ambush','elite','vanguard'].includes(event.kind)){upcoming=event;break;}
 }
 const roleNames={goblin:'goblins',skeleton:'skeletons',warg:'wargs',raider:'rush raiders',guardian:'shield guards',shaman:'ritual shamans',frostbinder:'frost binders (slow attacks)',sapper:'fuse sappers (interruptible)',banneret:'standard bearers (rally troops)',thornweaver:'thornweavers (temporary ward)',riftstalker:'riftstalkers (telegraphed blink)'};
 const roles=[...new Set(focus.units.map(n=>roleNames[n]||n))].join(' · ');
 const native=territoryVanguard(tier);
 return `<section class="encounter-intel" aria-label="Upcoming enemy intelligence">
  <div><small>⚔ SIEGE INTELLIGENCE · CHAPTER ${roman(focus.chapter)}</small>
   <strong>${focus.faction}</strong><p>${roles}</p><p class="encounter-intel-native"><b>✦ NATIVE VANGUARD · ${native.name}</b> · <em>${nativeMarchOrder(tier).name}</em> · ${nativeMarchOrder(tier).note} ${native.counter} Appears from wave 35 onward on ordinary vanguard waves.</p><p class="encounter-intel-objective">${upcoming&&upcoming.kind==='chapterBoss'?'✦ FLAWLESS CHAPTER BONUS · ZERO BREACHES':upcoming.kind==='relic'?'✦ RELIC HUNT · DEFEND WITHOUT BREACHES':upcoming.kind==='bannerAssault'?'✦ STANDARD ASSAULT · BREAK THE BANNERS FOR BONUS GOLD':upcoming.kind==='arcane'?'✦ ARCANE CONVERGENCE · +18% WAVE KNOWLEDGE':'Shield guards, casters and siege weapons have counterplay.'}</p>
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
      <p><strong>Native Vanguard:</strong> Each territory contributes two regional troop slots to ordinary vanguard waves from wave 35. Their eight role-matched march orders alter real on-field spacing, with casters further back and raiders on the flanks. The gold crest identifies true native troops; all specialist caps remain in force and no extra enemies or rewards are created.</p>
      <p><strong>Lost Signals (Exploration):</strong> From the Battle lobby, choose SCOUT to voluntarily challenge hidden shield wardens at waves 47, 147, 347 and 747 in each tier. The new Scout Routebook selects the nearest already-earned earlier checkpoint for any missed discovery and enables SCOUT automatically, without ever unlocking new waystones. Each guardian replaces one ordinary enemy. Defeat it and clear without a breach to earn a named one-time heirloom. Gear is saved in the Equipment Vault if your bag is full. Return to any older tier for missed discoveries; rewards cannot be claimed twice.</p>
      <p><strong>Relic Hunt:</strong> Protect the wall without a breach to earn one non-farmable rune and bonus Knowledge.</p>
      <p><strong>Standard Assault:</strong> Break support banners for +20% wave Gold.</p>
      <p><strong>Arcane Convergence:</strong> Caster-focused formations offer +18% wave Knowledge; at most three enemy casters may be active at once.</p>
      <p><strong>Treasure Raid:</strong> +35% wave Gold and an extra loot roll.</p>
    </div>
  </div>
 </details>`;
}
// Alpha 0.15.6 — verified tier selection shared by the tier grid and Frontier Watch.
function selectFrontierTier(value){
 const tier=Number(value);
 if(!Number.isInteger(tier)||tier<1||tier>MAX_TIER||tier>p.unlockedTier)return false;
 if(run.phase==='fighting'||run.phase==='intermission'||saveWriteBlocked||!verifyPrimaryContinuity())return false;
 if(tier===chosenTier)return true;
 const old=p.selectedTier;
 p.selectedTier=tier;
 if(!save()){p.selectedTier=old;return false;}
 chosenTier=tier;useWaystone=true;resetWaystoneNavigation();
 echoStartSelected=false;selectedScoutRouteId=null;
 return true;
}
function renderTierLobby(){
 const guardLobby=$('siegeGuardLobby');if(guardLobby)guardLobby.innerHTML=siegeGuardSettings();
 chosenTier=clamp(chosenTier,1,MAX_TIER);
 const tierHint=$('tierUnlockHint');if(tierHint){const gate=tierAdvanceWave(chosenTier);tierHint.textContent=gate?'Clear wave '+formatWave(gate)+' to unlock the next tier':'Final tier · conquer wave 10,000';}
 $('tierGrid').innerHTML=tierNames.map((name,i)=>{
  const tier=i+1,locked=tier>p.unlockedTier,best=Math.min(MAX_WAVE,p.bestByTier[tier]||0),conquered=best>=MAX_WAVE,sealed=!!p.atlasSeals[tier];
  return `<button data-tier="${tier}" ${locked?'disabled':''} class="tier-choice ${chosenTier===tier?'selected':''} ${locked?'locked':''} ${conquered?'tier-conquered':''}" aria-pressed="${chosenTier===tier}">
   <span class="tier-choice-number">${locked?'🔒':conquered?'♛':'✦'} TIER ${roman(tier)}</span><strong>${name}</strong>
   <small>${locked?'Clear wave '+formatWave(tierAdvanceWave(tier-1))+' of Tier '+roman(tier-1):conquered?'ETERNALLY CONQUERED':`BEST ${formatWave(best)} / ${formatWave(MAX_WAVE)}${sealed?' · ATLAS SEALED':''}`}</small>
   <span class="tier-progress-track"><span style="width:${100*best/MAX_WAVE}%"></span></span>
  </button>`;
 }).join('');
 const tier=chosenTier,best=Math.min(MAX_WAVE,p.bestByTier[tier]||0),stone=waystoneForTier(tier);
 $('tierHeading').textContent='TIER '+roman(tier)+' — '+tierNames[tier-1].toUpperCase();
 $('tierDescription').textContent=`Enemy strength ×${tierThreat(tier).toFixed(2)} · Gold & XP ×${(1+(tier-1)*.32).toFixed(2)} · Record ${formatWave(best)} / ${formatWave(MAX_WAVE)} · ${best>=MAX_WAVE?'ETERNALLY CONQUERED':'Continue your legacy'} · ${territoryVista(tier).name}`;
  updateTerritoryPreview(tier);
  if(saveWriteBlocked){
   $('tierDescription').textContent=saveRecoveryStatus==='write-failed'?
    '⚠ STORAGE READBACK OR IMPORT ROLLBACK FAILED · AUTOSAVE LOCKED · EXPORT YOUR CHARACTER IN SETTINGS.':
    saveRecoveryStatus==='future'?
    '⚠ NEWER SAVE VERSION FOUND · NO AUTOMATIC DOWNGRADE · AUTOSAVE LOCKED · OPEN SETTINGS & SAVES TO EXPORT ORIGINAL.':
    '⚠ SAVED CHARACTER MAY BE DAMAGED · AUTOSAVE LOCKED TO PROTECT THE ORIGINAL FILE · OPEN SETTINGS & SAVES FOR RECOVERY OR IMPORT.';
  }else if(saveRecoveryStatus==='recovered'){
   $('tierDescription').textContent+=' · ✦ RESTORED FROM AN OLDER VERIFIED CHECKPOINT · CONSIDER EXPORTING A BACKUP';
  }
 const activeRoute=selectedScoutRoute(tier);
  const waystone=stone>1?`<div class="milestone-waystone" role="group" aria-label="Siege starting checkpoint"><div><strong>✦ UNLOCKED WAYSTONE · WAVE ${formatWave(stone)}</strong><small>Resume an earlier tier without replaying its first ${formatWave(stone-1)} waves. Milestone rewards are earned once per tier.</small></div>
  <div class="milestone-waystone-choices">
   <button type="button" data-start-mode="fresh" ${!useWaystone&&!echoStartSelected&&!activeRoute?'aria-pressed="true"':''} class="${!useWaystone&&!echoStartSelected&&!activeRoute?'selected':''}">WAVE 1</button>
   <button type="button" data-start-mode="waystone" ${useWaystone&&selectedWaystoneWave===null&&!echoStartSelected&&!activeRoute?'aria-pressed="true"':''} class="${useWaystone&&selectedWaystoneWave===null&&!echoStartSelected&&!activeRoute?'selected':''}">WAYSTONE ${formatWave(stone)}</button>
    ${echoReturnEligible(tier)&&stone>=250? `<button type="button" data-start-mode="echo" ${echoStartSelected?'aria-pressed="true"':''} class="${echoStartSelected&&!activeRoute?'selected':''}">REVISIT WAVE 100</button>`:''}
    ${activeRoute?`<span class="scout-waystone-active" role="status">SCOUT ROUTE · START ${formatWave(activeRoute.start)} → ${formatWave(activeRoute.wave)}</span>`:''}
  </div></div>`:`<div class="milestone-waystone milestone-waystone-empty"><strong>✧ YOUR FIRST WAYSTONE AWAITS AT WAVE 100</strong><small>Push deeper to permanently unlock restart checkpoints and more powerful Ascension routes.</small></div>`;
 let claimedCount=0;
 const tierLadder=tierMilestones(tier);
 const rewards=tierLadder.map(w=>{
  const prize=tierMilestone(tier,w),claimed=!!p.milestones[milestoneKey(tier,w)];
  const reservedRune=claimed&&prize.kind==='rune'&&p.pendingRelics.some(r=>r&&r.id==='milestone_'+milestoneKey(tier,w));
  const reservedKeepsake=claimed&&p.pendingGear.some(g=>g&&g.id==='keepsake_'+tier+'_'+w);
  if(claimed)claimedCount++;
  const reached=best>=w;
  return `<div class="milestone-entry ${claimed?'claimed':''} ${milestoneKeepsake(tier,w)?'milestone-keepsake':''} ${w>100?'milestone-deep':''} ${prize.kind==='path'?'milestone-path':''} ${prize.unlockNext?'milestone-gate':''} ${prize.kind==='dominion'?'milestone-dominion':''} ${outerMilestones.has(w)?'milestone-new':''} ${newBeginningMilestones.has(w)?'milestone-first':''} ${w===MAX_WAVE?'milestone-final':''}">
    <div class="milestone-medal">${claimed?'✓':prize.icon}</div>
    <div class="milestone-copy"><strong>Wave ${formatWave(w)} · ${prize.name}</strong><small>${prize.detail}</small></div>
    <span class="milestone-status">${reservedKeepsake?'IN EQUIPMENT VAULT':reservedRune?'IN RUNE VAULT':claimed?'CLAIMED':reached?'AVAILABLE NEXT RUN':'TARGET'}</span>
   </div>`;
 }).join('');
 const gearNotice=p.pendingGear.length?`<div class="rune-vault-notice" role="status"><strong>⚒ ${p.pendingGear.length} EARNED EQUIPMENT REWARD${p.pendingGear.length===1?'':'S'} RESERVED</strong><small>Your equipment bag was full when First Watch, exploration or a milestone granted unique gear. Go to <b>Gear → Equipment</b>, free a slot, and claim the saved items.</small></div>`:'';
 const vaultNotice=p.pendingRelics.length?`<div class="rune-vault-notice" role="status"><strong>✦ ${p.pendingRelics.length} EARNED RUNE${p.pendingRelics.length===1?'':'S'} RESERVED</strong><small>Your rune pouch was full. Nothing was lost. Go to <b>Gear → Rune Workshop</b>, free a rune slot, then claim your reward.</small></div>`:'';
 const waystoneDetailsOpen=!!$('milestoneList').querySelector?.('details.waystone-navigator')?.open;
 $('milestoneList').innerHTML=renderWarCouncil(tier,startWaveForTier(tier))+renderCombatLoadouts(true)+gearNotice+vaultNotice+renderFirstWatch()+renderFirstWatchHorizon()+renderFirstWatchFrontiers()+renderExpeditionReadiness()+renderLongMarchLedger()+renderMarchBuildAudit()+renderEssencePriceLadder()+renderVeteranWatchStrategy()+renderLostSignalLedger(tier,startWaveForTier(tier))+renderSiegeHistory(tier)+renderEncounterIntel(tier)+renderSiegeCodex()+renderDominionPreview(tier)+waystone+renderWaystoneNavigator(tier)+`<div class="milestone-ladder-heading"><span>✧ THE 10,000-WAVE CHRONICLE</span><small>${claimedCount} / ${tierLadder.length} CLAIMED</small></div>`+rewards;
 if(waystoneDetailsOpen){const nav=$('milestoneList').querySelector?.('details.waystone-navigator');if(nav)nav.open=true;}
 $('launchTierButton').disabled=tier>p.unlockedTier;
 $('launchTierButton').textContent='⚔ START TIER '+roman(tier)+' · WAVE '+formatWave(startWaveForTier(tier))+' / '+formatWave(MAX_WAVE);
 $('bannerBadge').textContent='♛ '+p.activeBanner;
}
function enterSiege(){
 if(chosenTier>p.unlockedTier)return false;
 if(saveWriteBlocked||!verifyPrimaryContinuity()){
  notice('SAVE PROTECTION ACTIVE · EXPORT OR RESTORE YOUR CHARACTER FIRST');
  renderTierLobby();return false;
 }
 $('worldAtlas').hidden=true;atlasOpen=false;
 atlasCompareOriginal=false;atlasBossStyle='none';atlasBossPhase=1;atlasWeatherOn=false;resetAtlasZoom();
 releaseWorldAtlasImages();
 p.selectedTier=chosenTier;initRun();lastSiegeReport=null;run.historyActive=true;run.historyStartTotals=earnedProgressTotals();renderSiegeReport();
 run.speed=storedSpeed===2?2:1;syncBattleControls();
 run.wave=startWaveForTier(chosenTier);run.tier=chosenTier;run.startWave=run.wave;run.explorationEnabled=scoutSignalsSelected;
 $('tierLobby').hidden=true;$('exitRunButton').hidden=false;$('startButton').hidden=true;
 const persisted=save();
 if(!persisted&&saveWriteBlocked){
  initRun();showLobby();refreshHUD();
  notice('SIEGE NOT STARTED · SAVE STORAGE LOCKED');
  return false;
 }
 beginWave();return true;
}
function retreatFromSiege(){
 const report=finishSiege('retreated');
 const summary=`Tier ${roman(run.tier)} · Reached wave ${run.wave} · Cleared ${report.cleared} this run`;
 run.phase='ready';run.enemies=[];run.shots=[];save();showLobby(summary);refreshHUD();
}
function legacyCost(row){return Math.ceil(row[3]*(1+lr(row[0])*.35+Math.pow(lr(row[0]),1.35)*.26));}
const lvlNeed=()=>Math.floor(65*Math.pow(p.level,1.34));const n=(obj,key)=>obj[key]||0;const skill=id=>n(p.skills,id);const station=id=>n(p.stations,id);const t=id=>n(p.training,id);const res=id=>n(p.research,id);const sup=id=>n(p.suppression,id);
function xpAdd(amount){p.xp+=Math.floor(amount*(1+t('xp')*.025+skill('wisdom')*.07)*(1+Math.min(16,res('almanac'))*.015)*(1+dominionBonus('xp')));while(p.xp>=lvlNeed()){p.xp-=lvlNeed();p.level++;p.points+=2;notice('LEVEL UP! +2 SKILL POINTS');}}
// Alpha 0.14.7: detect external changes on storage/foreground events as well
// as during synchronous saves. Never mutate another session's primary bytes.
function pauseForUnsafeSave(){
 if(siegeActive()&&run.speed>0){storedSpeed=run.speed;run.speed=0;}
 syncBattleControls();
 if(run.phase==='ready'||run.phase==='fallen'||run.phase==='completed')renderTierLobby();
 if(tab==='settings')renderPanel();
 notice('SAVE STORAGE UNSAFE · SIEGE STOPPED · EXPORT CURRENT PROGRESS');
}
function verifyPrimaryContinuity(){
 if(saveWriteBlocked)return false;
 try{
  if(localStorage.getItem(storageKey)===lastObservedPrimaryRaw)return true;
  saveWriteBlocked=true;saveRecoveryStatus='write-failed';
  saveWriteIssue='PRIMARY SAVE CHANGED OUTSIDE THIS SESSION · AUTOSAVE LOCKED';
 }catch{
  saveWriteBlocked=true;saveRecoveryStatus='write-failed';
  saveWriteIssue='PRIMARY SAVE PREFLIGHT UNREADABLE · AUTOSAVE LOCKED';
 }
 pauseForUnsafeSave();return false;
}
function onCharacterStorageChange(event){
 // Safari fires storage events in OTHER windows. Ignore preference changes.
 if(!event||(event.key!==storageKey&&event.key!==null))return false;
 if(event.storageArea&&event.storageArea!==localStorage)return false;
 return verifyPrimaryContinuity();
}
// The last verified primary is only rotated into a checkpoint after commit.
function save(){
 if(saveWriteBlocked)return false;
 let serialized;
 try{
  serialized=JSON.stringify(p);
  if(!parseCharacterRaw(serialized))throw Error('Invalid character snapshot');
 }catch{
  saveWriteIssue='INVALID CURRENT CHARACTER · EXPORT A BACKUP';
  return false;
 }
 const previous=lastVerifiedSaveRaw;
 // Best-effort synchronous preflight. localStorage has no cross-tab CAS.
 try{
  if(localStorage.getItem(storageKey)!==lastObservedPrimaryRaw){
   saveWriteBlocked=true;saveRecoveryStatus='write-failed';
   saveWriteIssue='PRIMARY SAVE CHANGED OUTSIDE THIS SESSION · AUTOSAVE LOCKED';
   pauseForUnsafeSave();return false;
  }
 }catch{
  saveWriteBlocked=true;saveRecoveryStatus='write-failed';
  saveWriteIssue='PRIMARY SAVE PREFLIGHT UNREADABLE · AUTOSAVE LOCKED';
  pauseForUnsafeSave();return false;
 }
 let stored;
 try{
  localStorage.setItem(storageKey,serialized);
  stored=localStorage.getItem(storageKey);
  if(stored!==serialized)throw Error('Primary write readback mismatch');
 }catch{
  saveWriteIssue='PRIMARY SAVE WRITE FAILED · LATEST PROGRESS NOT CONFIRMED';
  // A rejected/quota write that left the previous primary unchanged may
  // be retried. Unknown/partial bytes require a manual recovery decision.
  try{
   stored=localStorage.getItem(storageKey);
   if(stored!==lastObservedPrimaryRaw){
    saveWriteBlocked=true;saveRecoveryStatus='write-failed';
    saveWriteIssue='PRIMARY SAVE UNVERIFIED · AUTOSAVE LOCKED';
   }
  }catch{
   saveWriteBlocked=true;saveRecoveryStatus='write-failed';
   saveWriteIssue='PRIMARY SAVE READBACK FAILED · AUTOSAVE LOCKED';
  }
  if(saveWriteBlocked)pauseForUnsafeSave();
  return false;
 }
 const rotate=!!previous&&(recoveryWrites===0||recoveryWrites>=recoveryCadence);
 lastObservedPrimaryRaw=serialized;
 lastVerifiedSaveRaw=serialized;saveWriteIssue=null;
 if(rotate){
  recoverySnapshotFailed=!writeRecoveryCheckpoint(previous);
  recoveryWrites=0;
 }
 recoveryWrites++;
 if(!readRecoveryCheckpoint()&&recoveryWrites===1)
  recoverySnapshotFailed=!writeRecoveryCheckpoint(serialized);
 return true;
}
function saveRecoverySummary(){
 const snapshot=readRecoveryCheckpoint();
 return {status:saveRecoveryStatus,blocked:saveWriteBlocked,
  hasCheckpoint:!!snapshot,checkpointAt:snapshot?.createdAt||null,
  checkpointFailed:recoverySnapshotFailed,writeIssue:saveWriteIssue};
}
function restoreVerifiedCheckpoint(){
 const snapshot=readRecoveryCheckpoint();
 return snapshot?restoreProgressBackup(snapshot.data,true):false;
}
function damagedOriginalRaw(){
 try{return unrecoverableSaveRaw!==null?unrecoverableSaveRaw:localStorage.getItem(damagedOriginalKey);}
 catch{return unrecoverableSaveRaw;}
}
function renderSaveRecoveryPanel(){
 const info=saveRecoverySummary();
 const headline=info.status==='write-failed'?'SAVE STORAGE UNVERIFIED · AUTOSAVE LOCKED':
  info.writeIssue?'LATEST SAVE WAS NOT VERIFIED':
  info.status==='future'?'NEWER SAVE VERSION · WRITE-LOCKED':
  info.blocked?'SAVE PROTECTION ACTIVE · AUTOSAVE LOCKED':
  info.status==='recovered'?'RECOVERED FROM A VERIFIED CHECKPOINT':
  info.hasCheckpoint?'CHECKPOINT VERIFIED · CHARACTER SAVE HEALTHY':
  'SAVE HEALTHY · CHECKPOINT NOT YET AVAILABLE';
 const detail=info.status==='write-failed'?
  (info.writeIssue&&info.writeIssue.includes('OUTSIDE THIS SESSION')?
   'Another tab or window changed this device\'s saved character while this game was open. This session did NOT overwrite those bytes. Autosave is locked. Export any progress from this tab before reloading to inspect the updated device save. Do not keep playing in this tab.':
   'The device did not confirm the latest save or a required rollback. Autosave is locked to avoid overwriting uncertain bytes. Export your current in-memory character JSON and inspect your older verified backup or undo copy. No automatic recovery is claimed.'):
  info.writeIssue?'The most recent storage operation was not fully verified ('+info.writeIssue+'). Recent waves or purchases may exist only in memory. Export a JSON backup before leaving the game.':
  info.status==='future'?
  'This device contains a character saved by a newer game version. The exact original is untouched, and automatic writes are BLOCKED to prevent downgrading. Export the original text below. Prefer opening it in the newer game; importing an older backup is an explicit replacement.':
  info.blocked?
  'The saved character is damaged and no valid checkpoint was found. Its original bytes were NOT overwritten. Export the damaged save or import a known-good JSON backup.':
  info.status==='recovered'?
  'A damaged primary was restored from an older checkpoint. Progress since that checkpoint might not be present; export a new backup now.':
  info.checkpointFailed?'This device rejected a checkpoint write. Keep an exported JSON backup as well.':
  info.hasCheckpoint?'An older copy was checksum-verified. It may trail current progress by several successful saves.':
  'The first successful save creates a checkpoint. An exported JSON backup provides extra protection.';
 return '<section class="save-recovery-panel '+(info.blocked||info.writeIssue?'save-recovery-danger':'')+
  '" role="status" aria-label="Local save integrity and recovery">'+
  '<strong>✦ '+headline+'</strong><p>'+detail+'</p>'+
  (info.hasCheckpoint?'<button class="wide-btn" data-action="restoreCheckpoint">RESTORE LAST VERIFIED CHECKPOINT</button>':'')+
  (damagedOriginalRaw()!==null?
   '<button class="wide-btn" data-action="exportDamaged">'+(info.status==='future'?'EXPORT NEWER ORIGINAL SAVE (NO RESET)':'EXPORT DAMAGED SAVE (NO RESET)')+'</button>':'')+
  '</section>';
}
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
// Alpha 0.15.2: cheap opening Fortitude ranks now defend against actual
// breaches rather than only enlarging the health bar. This capped, separate
// layer is multiplicative with Rampart, Wardkeeper and Sentinel. All tiers use
// the same rule; later Fortitude ranks still grow max HP without extra ward.
function fortitudeBreachWard(){return .04*Math.min(6,t('fort'));}
function maxWall(){return Math.floor((145+12*t('fort'))*(1+skill('stone')*.08+skill('bulwark')*.15)*(1+gearStat('armor')*.06)*(1+lr('guardianOath')*.03)*(1+Math.min(16,res('masonry'))*.015)*(1+ascRank('bastion')*.07)*(1+dominionBonus('wall')+dominionSeals()*.01)*(1+oathRank('sovereignAegis')*.015)*(1+explorerSetStatus().wall)*(1+atlasSealBonus()));}
function damage(){return (32+2*t('power')+p.level*.85)*(1+skill('aim')*.06)*(1+(gearStat('weapon')-1)*.22)*(1+Math.min(15,res('calibration'))*.01)*(1+ascRank('vanguard')*.06)*(1+ascRank('epoch')*.015*Math.sqrt(Math.max(1,run.wave)/100))*(1+dominionBonus('damage')+dominionResonance())*(1+oathRank('sovereignBlade')*.015)*(1+explorerSetStatus().damage)*(1+atlasSealBonus());}
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
 run.guardActiveSeconds=0;run.guardWallLatched=false;run.guardReason='';
 run.startWave=1;run.wavesCleared=0;run.enemiesDefeated=0;run.totalBossBreaks=0;run.historyActive=false;run.historyWritten=false;run.historyStartTotals=null;
 run.explorationEnabled=false;run.discoveryCurrent=null;run.discoveryWardenKilled=false;run.echoCurrent=null;run.echoDefeatedMask=0;run.cartographerStages=0;run.cartographerBroken=false;run.cartographerCurrent=null;run.totalSpecialistBreaks=0;run.totalBreaches=0;run.bossVictories=0;run.bossEscapes=0;run.bossesKilledThisWave=0;run.sapperBlasts=0;run.doctrineClock=3.5;run.doctrineCasts=0;run.doctrineHeldSeconds=0;run.doctrineHoldEvents=0;run.doctrineHolding=false;run.doctrineCastReasons={};
}
function beginWave(){if(run.phase==='fighting'||run.phase==='fallen'||run.phase==='completed'||run.wave>MAX_WAVE)return;run.maxHealth=maxWall();run.health=clamp(run.health,0,run.maxHealth);run.phase='fighting';run.spawned=0;run.kills=0;run.breaches=0;run.enemies=[];run.shots=[];run.spawnClock=.35;run.heroChill=0;run.encounter=encounterDirector(run.wave,run.tier);run.discoveryCurrent=activeLostSignal(run.tier,run.wave);run.discoveryWardenKilled=false;if(run.wave===1001){run.cartographerStages=0;run.cartographerBroken=false;}run.cartographerCurrent=activeCartographerOath(run.tier,run.wave);run.echoCurrent=activeEchoReturn(run.tier,run.wave);run.echoDefeatedMask=0;run.bossesKilledThisWave=0;run.total=Math.min(run.encounter.kind==='chapterBoss'?22:24,waveEnemyCount(run.wave));run.reinforcementPhase=false;run.bossCounters=0;run.doctrineHolding=false;message((run.echoCurrent?'✦ ECHO RETURN · MEMORY ANCHOR + REVENANT COURIER':run.cartographerCurrent?'✦ CARTOGRAPHER OATH · STAGE '+run.cartographerCurrent.step+' / 3':run.discoveryCurrent?'✦ '+run.discoveryCurrent.name+' · '+run.discoveryCurrent.guardian.name:hasNativeVanguard(run.encounter)?territoryVanguard(run.tier).name+' · '+nativeMarchOrder(run.tier).name:run.encounter.label)+' · '+run.encounter.faction.toUpperCase());refreshHUD();}
function spawnEnemy(){
 const encounter=run.encounter&&run.encounter.wave===run.wave?run.encounter:encounterDirector(run.wave,run.tier);
 const isBoss=!!encounter.bossType&&run.wave%5===0&&!run.reinforcementPhase&&run.spawned===run.total-1;
 const relicGuardian=encounter.kind==='relic'&&run.spawned===run.total-1;
 const nativeSlot=hasNativeVanguard(encounter)&&!run.reinforcementPhase&&(run.spawned===2||run.spawned===8);
 const discoveryWarden=!!run.discoveryCurrent&&!run.reinforcementPhase&&run.spawned===run.total-1;
 const echoRole=run.echoCurrent&&!run.reinforcementPhase?
  (run.spawned===2?'shield':run.spawned===run.total-1?'runner':null):null;
 const echoProfile=echoRole?echoReturnEnemies.find(e=>e.role===echoRole):null;
 let type=isBoss?encounter.bossType:relicGuardian?'guardian':discoveryWarden?run.discoveryCurrent.guardian.type:echoProfile?echoProfile.type:run.reinforcementPhase&&run.spawned>=run.total-2?({iron:'guardian',ember:'raider',rift:'warg'}[encounter.bossStyle]):encounterUnit(encounter,run.spawned);
 // Reserve one genuinely native specialist at slot 2. The first two random
 // faction troops cannot consume its existing 2-of-type safety cap first.
 // Never create a bonus enemy or weaken the global three-caster limit.
 if(hasNativeVanguard(encounter)&&run.spawned<2&&type===territoryVanguards[encounter.tier-1][1]&&
   ['shaman','frostbinder','sapper','banneret','thornweaver','riftstalker'].includes(type))type='skeleton';
 type=allowedSpecialist(type,run.enemies);
 const nativeMark=nativeSlot&&type===territoryVanguards[encounter.tier-1][1];
 const trial=dominionTrial(run.tier),trait=trial?.trait||'',discoveryProfile=discoveryWarden?run.discoveryCurrent.guardian:null;
 const mul=waveThreat(run.wave)*tierThreat(run.tier)*outerDepthPressure(run.tier,run.wave)*(trait==='armored'?1.15:1)*(trait==='elite'&&isBoss?1.3:1);
 const baseHp={goblin:36,skeleton:42,warg:58,imp:28,ogre:300,raider:39,guardian:82,shaman:52,siegebeast:390,warlord:445,frostbinder:49,sapper:46,banneret:73,thornweaver:56,riftstalker:45};
 const baseSpeed={goblin:17,skeleton:17,warg:25,imp:22,ogre:7,raider:33,guardian:12,shaman:14,siegebeast:7,warlord:9,frostbinder:13,sapper:24,banneret:15,thornweaver:13,riftstalker:20};
 const baseArmor={skeleton:2,ogre:7,guardian:13,siegebeast:11,warlord:14,banneret:7,sapper:2,thornweaver:3,riftstalker:4};
 const placement=formationPosition(encounter,run.spawned,type,isBoss,relicGuardian||discoveryWarden||!!echoProfile,run.reinforcementPhase&&run.spawned>=run.total-2);
 const e={type,isBoss,relicGuardian,discoveryWarden,echoRole,discoveryAspect:discoveryWarden?run.discoveryCurrent.index:-1,nativeVanguard:nativeMark,x:placement.x,y:placement.y,
  hp:Math.max(1,(baseHp[type]||36)*mul*(relicGuardian?1.75:discoveryProfile?discoveryProfile.hp:echoProfile?echoProfile.hp:1)*(1-Math.min(.35,sup('health')*.005))),
  max:0,
  speed:(baseSpeed[type]||17)*(relicGuardian?.88:discoveryProfile?discoveryProfile.speed:echoProfile?echoProfile.speed:1)*enemySpeedFactor(run.wave)*(1+(run.tier-1)*.06)*(trait==='swift'?1.12:1)*(1-Math.min(.35,sup('speed')*.005)),
  armor:((baseArmor[type]||0)+(relicGuardian?3:discoveryProfile?discoveryProfile.armor:echoProfile?echoProfile.armor:0)+waveArmor(run.wave,run.tier))*Math.sqrt(outerDepthPressure(run.tier,run.wave))*(trait==='armored'?1.18:1)*(1-Math.min(.5,sup('armor')*.01)),
  buildup:0,burn:0,slow:0,wobble:rnd(0,6.28),
  dashClock:type==='raider'?rnd(1.2,3.0):0,dashTime:0,ritualClock:type==='shaman'?rnd(3.2,5.5):0,bossPhase:1,frostCastClock:type==='frostbinder'?rnd(3.4,4.6):0,frostWindup:0,fuseTime:0,fuseSpent:false,bannerGlow:0,crushStarted:false,crushWindup:0,crushSurge:0,thornCastClock:type==='thornweaver'?rnd(3.1,4.5):0,thornWindup:0,thornWardTimer:0,blinkStarted:false,blinkWindup:0,spellBreakDamage:0,bossStyle:isBoss&&type==='warlord'?encounter.bossStyle:null,bossWardTimer:0,bossFuryClock:3.8,bossFuryWindup:0,bossFurySurge:0,bossBlinkStarted:false,bossBlinkWindup:0,bossBlinkCooldown:0,bossCastDamage:0,bossWardDamage:0,bossExposedTimer:0,
  golden:encounter.kind==='treasure'||Math.random()<.02+station('midas')*.012,
  dead:false,valued:isBoss?65:relicGuardian?25:type==='guardian'?17:type==='shaman'||type==='frostbinder'?16:type==='banneret'||type==='thornweaver'?17:type==='riftstalker'?16:type==='sapper'?14:type==='raider'?13:Math.round(type==='warg'?12:10)};
 e.max=e.hp;
 run.enemies.push(e);if(relicGuardian)float(e.x,e.y-22,'RELIC WARDEN','#ffe4a3');if(discoveryWarden)float(e.x,e.y-25,discoveryProfile.name,discoveryProfile.color);if(echoProfile)float(e.x,e.y-25,echoProfile.name,echoProfile.color);
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
 if(Math.random()<skill('spark')*.04+socketValue('storm')+t('shock')*.001){const other=nearestShockTarget(e);if(other){effect(other.x,other.y,'#a5efff',8);hurt(other,raw*.45,'arcane');}}
 }
 if(e.hp<=0)kill(e);
}
// Retain the old stable nearest-enemy tie order without building/sorting a list.
function nearestShockTarget(origin,enemies=run.enemies){
 let closest=null,distance=Infinity;
 for(const other of enemies){
  if(!other||other===origin||other.dead)continue;
  const d=Math.hypot(other.x-origin.x,other.y-origin.y);
  if(closest===null||d<distance){closest=other;distance=d;}
 }
 return closest;
}
function kill(e){e.dead=true;if(e.discoveryWarden)run.discoveryWardenKilled=true;if(e.echoRole)run.echoDefeatedMask|=(e.echoRole==='shield'?1:2);run.kills++;run.enemiesDefeated=(run.enemiesDefeated||0)+1;if(e.isBoss)run.bossesKilledThisWave=(run.bossesKilledThisWave||0)+1;effect(e.x,e.y,e.type==='skeleton'?'#e7ded0':'#caa673',14);let amount=Math.ceil(e.valued*(1+t('gold')*.028+skill('fortune')*.08+socketValue('fortune')*4+res('bounties')*.03+lr('goldenTouch')*.04)*(1+run.wave*.09)*(tierReward(run.tier))*(1+dominionBonus('gold'))*(1+oathRank('sovereignTribute')*.0125));if(e.golden){amount*=2;}else if(Math.random()<skill('midas')*.02+station('midas')*.013){amount*=3;float(e.x,e.y-35,'GOLDEN!', '#ffcd59')}p.gold+=amount;xpAdd(Math.ceil((isSiegeBoss(e)?70:8)*(1+run.wave*.055)*(tierReward(run.tier))));float(e.x,e.y-10,'+'+fmt(amount)+' GOLD','#f4c864');}
function projectileCount(){return Math.min(12,1+Math.floor(t('multishot')/8)+Math.floor(ascRank('volley')/6));}
// Seven history points in one fixed-size ring, allocated only at shot creation.
function shoot(target,power=damage(),kind='arrow',originX=496,originY=390){
 if(!target||run.shots.length>=48)return;
 run.shots.push({x:originX,y:originY,target,power,kind,life:1.8,
  trail:new Float32Array(14),trailHead:0,trailCount:0});
 run.flashes=.13;
}
function recordShotTrail(shot){
 const slot=(shot.trailHead+shot.trailCount)%7;
 shot.trail[slot*2]=shot.x;shot.trail[slot*2+1]=shot.y;
 if(shot.trailCount<7)shot.trailCount++;
 else shot.trailHead=(shot.trailHead+1)%7;
}
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
/* Alpha 0.12.20 — battle scratch arrays. Reuse stable draw-depth and
   combat-target sorting buffers instead of allocating two or more arrays and
   comparators on each paint and attack. Never reorder run.enemies. */
const renderEnemyScratch=[],targetEnemyScratch=[];
function enemyDepthOrder(a,b){return a.y-b.y;}
function enemyThreatOrder(a,b){return threatPriority(b)-threatPriority(a);}
function collectAliveSorted(enemies,scratch,comparator){
 scratch.length=0;
 for(const e of enemies)if(e&&!e.dead)scratch.push(e);
 scratch.sort(comparator);
 return scratch;
}
function sortedRenderEnemies(enemies=run.enemies){
 return collectAliveSorted(enemies,renderEnemyScratch,enemyDepthOrder);
}
function sortedTargetEnemies(enemies=run.enemies){
 return collectAliveSorted(enemies,targetEnemyScratch,enemyThreatOrder);
}
// Choose the same two most-wounded nearby allies as stable filter/sort/slice
// without allocations. Equal wound ratios keep the original array order.
function healShamanAllies(caster,enemies=run.enemies){
 let first=null,second=null,firstRatio=Infinity,secondRatio=Infinity;
 for(const ally of enemies){
  if(!ally||ally.dead||ally===caster||Math.abs(ally.y-caster.y)>=130||!(ally.hp<ally.max))continue;
  const ratio=ally.hp/ally.max;
  if(first===null||ratio<firstRatio){
   second=first;secondRatio=firstRatio;first=ally;firstRatio=ratio;
  }else if(second===null||ratio<secondRatio){
   second=ally;secondRatio=ratio;
  }
 }
 if(!first)return 0;
 first.hp=Math.min(first.max,first.hp+first.max*.06);effect(first.x,first.y,'#baa6ea',4);
 if(second){second.hp=Math.min(second.max,second.hp+second.max*.06);effect(second.x,second.y,'#baa6ea',4);}
 float(caster.x,caster.y-20,'RITUAL','#dfbfff');
 return second?2:1;
}
function tick(dt){
 if((run.phase==='fighting'||run.phase==='intermission')&&run.speed===0)return;
 if((run.phase==='fighting'||run.phase==='intermission')&&run.speed>0){
  // Real elapsed active seconds, not 2x-simulated combat time; never accrue when paused.
  run.guardActiveSeconds=(run.guardActiveSeconds||0)+clamp(Number(dt)||0,0,.05);
  if(siegeGuard.minutes>0&&run.guardActiveSeconds>=siegeGuard.minutes*60){
   run.guardActiveSeconds=0;pauseForSiegeGuard(siegeGuard.minutes+' MIN ACTIVE REST');return;
  }
  // First Watch is earned at genuine active time and new-wave thresholds.
  // A player who crosses the clock threshold during a wave no longer has
  // to survive another wave before receiving and persisting the award.
  const previousBattleSeconds=p.battleSeconds;
  p.battleSeconds+=dt;saveClock+=dt;advanceBattleVisuals(dt*run.speed);
  if(p.firstWatchClaimed.length<earlyWatchChapters.length){
   const nextWatch=earlyWatchChapters.findIndex((_,i)=>!p.firstWatchClaimed.includes(i));
   if(nextWatch>=0){
    const minutes=earlyWatchChapters[nextWatch][0],threshold=minutes*60;
    if(previousBattleSeconds<threshold&&p.battleSeconds>=threshold&&
      p.uniqueClears>=Math.ceil(minutes*1.5)){
     awardFirstWatch();save();
    }
   }
  }
  if(saveClock>=30){saveClock=0;save();}
 }
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
   if(e.ritualClock<=0){e.ritualClock=6;healShamanAllies(e,run.enemies);}
  }
  rush*=specialEnemyMotion(e,dt);
  rush*=rallyAuraFactor(e,run.enemies);
  e.y+=e.speed*dt*rush*(e.slow>0?.5:1)*gravity*cryo;
  e.x+=Math.sin(e.wobble)*dt*(e.type==='imp'||e.type==='raider'?11:4);e.slow=Math.max(0,e.slow-dt);e.buildup=Math.max(0,e.buildup-dt);if(e.burn>0){e.burn-=dt;e.hp-=dt*(2+skill('ember')*1.3);if(e.hp<=0){kill(e);continue;}}if(e.y>430){e.dead=true;run.breaches++;run.totalBreaches=(run.totalBreaches||0)+1;
  if(e.isBoss&&['chapterBoss','commander'].includes(run.encounter?.kind)){
   run.bossEscapes=(run.bossEscapes||0)+1;
   notice('MAJOR BOSS BREACHED THE FORTRESS');
  }let pressure=1+Math.min(2.4,run.breaches*(.015+.09*Math.min(1,run.wave/1000)));let attack=Math.ceil(pressure*(isSiegeBoss(e)?36:13)*(e.type==='siegebeast'?2.0*(e.crushSurge>0?1.18:1):e.type==='warlord'&&e.bossPhase===2?1.4:1)*(1+run.wave*.055)*(1+(run.tier-1)*.25)*(dominionTrial(run.tier)?.trait==='crushing'?1.22:1)*Math.sqrt(outerDepthPressure(run.tier,run.wave))*(1-Math.min(.5,sup('damage')*.007))*(1-Math.min(.35,t('resist')*.006+skill('ward')*.04))*(1-fortitudeBreachWard()));attack=Math.max(1,Math.ceil(attack*(p.combatPassive==='sentinel'?.9:1)));run.health-=attack;run.shakes=.18;float(750,450,'BREACH '+run.breaches+' · -'+attack+' WALL','#ff7777');effect(e.x,424,'#ff7361',11);if(skill('thorns'))run.health+=Math.min(attack*.3,skill('thorns')*1);}}
 if(run.health<=0){run.health=0;run.phase='fallen';finishSiege('fallen');message('THE FORTRESS HAS FALLEN');notice('Tier '+roman(run.tier)+' · Wave '+run.wave+' • Permanent progress saved');save();showLobby('FORTRESS FALLEN · Tier '+roman(run.tier)+' · Reached Wave '+run.wave+' · Select a tier to fight again');refreshHUD();return;}
 advanceCombatDoctrine(dt);
 if(run.shotClock<=0){const targets=sortedTargetEnemies();if(targets.length){let count=projectileCount();for(let i=0;i<count;i++){const tar=targets[i%targets.length];shoot(tar);if(Math.random()<skill('double')*.08)shoot(tar,damage()*.65,'arrow',476,390);}run.shotClock=attackInterval();}}
 if(run.stationClock<=0){const targets=sortedTargetEnemies();if(targets.length){if(station('ballista'))shoot(targets[0],damage()*(.6+station('ballista')*.22),'ballista',240,360);if(station('thunder'))shoot(targets[Math.min(1,targets.length-1)],damage()*(.4+station('thunder')*.15),'lightning',760,360);}run.stationClock=Math.max(.48,2.9/(1+station('ballista')*.06+station('thunder')*.05));}
 for(let i=run.shots.length-1;i>=0;i--){let s=run.shots[i];if(s.target.dead){run.shots.splice(i,1);continue}let dx=s.target.x-s.x,dy=s.target.y-s.y,dist=Math.hypot(dx,dy),speed=(s.kind==='lightning'?1100:820)*(1+t('range')*.017);recordShotTrail(s);s.x+=dx/(dist||1)*dt*speed;s.y+=dy/(dist||1)*dt*speed;s.life-=dt;if(dist<dt*speed+8){hurt(s.target,s.power,s.kind);effect(s.x,s.y,s.kind==='lightning'?'#97f4ff':'#ffe07c',7);run.shots.splice(i,1);}else if(s.life<=0)run.shots.splice(i,1);}
 // Release all transient target references after the combat update.
 targetEnemyScratch.length=0;
 if(run.spawned===run.total&&run.enemies.every(e=>e.dead)){completeWave();}
 // Only interrupt a still-fighting live wave; finished waves naturally repair HP.
 if(run.phase==='fighting'){
  if(run.health>run.maxHealth*.35)run.guardWallLatched=false;
  if(siegeGuard.wall&&!run.guardWallLatched&&run.health>0&&run.health<=run.maxHealth*.20){
   run.guardWallLatched=true;pauseForSiegeGuard('FORTRESS BELOW 20% HP');
  }
 }
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
 knowledge=Math.round(knowledge*(1+explorerSetStatus().knowledge));
 p.essence+=essence;p.knowledge+=knowledge;p.gold+=waveGold;
 const echoWallAtClear=run.health/Math.max(1,run.maxHealth);
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
 awardLostSignal();
 awardCartographerOath();
 awardEchoReturn(echoWallAtClear);
 awardAtlasSeals();
 if(cleared>=MAX_WAVE){
  run.phase='completed';run.wave=MAX_WAVE;finishSiege('victory');run.enemies=[];run.shots=[];
  save();showLobby('ETERNAL VICTORY · Tier '+roman(tier)+' completed at wave '+fmt(MAX_WAVE));refreshHUD();return;
 }
 run.wave++;run.phase='intermission';run.rewardTimer=1.2;run.enemies=[];run.shots=[];
 // Rest only after all original legitimate wave rewards and one-time grants.
 if(siegeGuardWaveRest(cleared))pauseForSiegeGuard('WAVE '+formatWave(cleared)+' CLEARED');
 save();refreshHUD();
}

/* Alpha 0.12.0, Living Territories & Art — first restrained atmospheric pass.
   Keep the authored battlefield painting, perspective and warm fortress foreground.
   Thirty deterministic vistas; never recolor the enemy sprites or telegraph arcs. */
const territoryVistas=[
 ['VERDANT DAWN','mist','dawn'],['ASHEN SUNSET','ash','sunset'],
 ['FROST MOON','snow','moon'],['DROWNED TWILIGHT','mist','twilight'],
 ['STORMSCAR SKIES','rain','storm'],['HOLLOW MIDNIGHT','mist','night'],
 ['EMBERFALL DUSK','embers','sunset'],['ECLIPSE ASH','ash','eclipse'],
 ['ANCIENT BLOOM','pollen','dawn'],['ASTRAL NIGHT','stars','moon'],
 ['SHATTERED RAIN','rain','twilight'],['PRIMORDIAL CINDERS','ash','dawn'],
 ['CINDER THRONE','embers','ember'],['OBSIDIAN DUST','dust','twilight'],
 ['ETERNAL STARS','stars','rift'],['LAST MORNING','rain','dawn'],
 ['BLOODGLASS EMBERS','embers','twilight'],['MOONVEIL HAZE','mist','moon'],
 ['SUNFORGED DUST','dust','noon'],['THORNED BLOOM','pollen','twilight'],
 ['GLOAMWATER STORM','rain','moon'],['ZENITH FROST','snow','dawn'],
 ['DREADROOT SPORES','pollen','night'],['HOLLOW CONSTELLATION','stars','rift'],
 ['OBSIDIAN NIGHTFALL','ash','moon'],['THUNDERGRAVE STORM','rain','storm'],
 ['GOLDEN WASTES','dust','sunset'],['PANTHEON WINTER','snow','twilight'],
 ['WORLDSCAR ASH','ash','ember'],['ORIGIN ECLIPSE','stars','eclipse']
];
const territoryLight={
 dawn:'rgba(241,174,93,.065)',sunset:'rgba(255,132,73,.085)',
 moon:'rgba(76,119,168,.09)',twilight:'rgba(105,91,147,.078)',
 storm:'rgba(44,89,118,.115)',night:'rgba(44,63,113,.105)',
 eclipse:'rgba(93,72,123,.095)',ember:'rgba(198,79,44,.09)',
 rift:'rgba(100,86,179,.095)',noon:'rgba(240,190,112,.055)'
};
const territoryWeatherColor={
 mist:'rgba(194,220,216,.11)',ash:'rgba(205,185,168,.42)',
 snow:'rgba(228,241,246,.63)',rain:'rgba(171,216,238,.48)',
 embers:'rgba(255,188,94,.58)',pollen:'rgba(210,231,163,.47)',
 dust:'rgba(214,185,138,.41)',stars:'rgba(224,229,255,.59)'
};
function territoryVista(tier=run.tier){
 const index=Math.min(territoryVistas.length,Math.max(1,Math.floor(Number(tier)||1)))-1;
 const [name,weather,light]=territoryVistas[index];
 return {tier:index+1,name,weather,light,tint:territoryLight[light],
  particleColor:territoryWeatherColor[weather]};
}
/* Alpha 0.12.13 — eight recognizably different weather signatures across
   thirty territories. No new textures, gradients, sprites, physics or saved
   data. One flat light wash and at most 18 pixel marks per draw; respects
   Vivid/Balanced/Saver density and system Reduce Motion. */
function territoryWeatherSignature(tier=run.tier){
 const vista=territoryVista(tier);
 return vista.name+' · '+vista.weather.toUpperCase()+' · '+vista.light.toUpperCase()+' LIGHT';
}
function drawTerritoryAtmosphere(context,seconds=run.time,tier=run.tier,still=reduceMotion){
 const vista=territoryVista(tier);
 const time=Number.isFinite(seconds)?seconds:0;
 const wrap=(value,span)=>((value%span)+span)%span;
 context.save();
 context.fillStyle=vista.tint;
 context.fillRect(0,80,960,340);
 if(!still){
  const type=vista.weather,count=territoryWeatherCount(type);
  const seed=vista.tier*47;
  context.fillStyle=vista.particleColor;
  for(let i=0;i<count;i++){
   if(type==='mist'){
    // Slow drifting veils: four broad, translucent layers, not rain flecks.
    const x=-34+(i%2)*72+Math.sin(time*.14+i*1.6+seed*.016)*25;
    const y=119+i*67+Math.sin(time*.21+i*1.33+seed*.009)*11;
    context.fillRect(x,y,730-i*54,5+(i%2)*3);
    continue;
   }
   // Each territory receives a distinct stable starting field. The weather
   // movement is deterministic from game time; no Math.random() or arrays.
   const depth=.75+(i%4)*.16;
   const fall=type==='rain'?165:type==='snow'?30:type==='embers'?-24:
    type==='stars'?-4:type==='pollen'?-12:type==='ash'?21:26;
   const wind=type==='rain'?35:type==='snow'?14:type==='dust'?29:
    type==='pollen'?17:type==='ash'?9:type==='embers'?-8:2;
   const wobble=type==='snow'||type==='pollen'?Math.sin(time*.8+i*1.47+seed*.01)*12:0;
   const x=8+wrap(i*97+seed*11+time*wind*depth+wobble,940);
   const y=100+wrap(i*61+seed*5+time*fall*depth,298);
   if(type==='rain')context.fillRect(x,y,1+i%2,8+(i%3)*2);
   else if(type==='snow')context.fillRect(x,y,2+i%3,2+i%3);
   else if(type==='stars'){
    // Stars shimmer gently at night; avoid full-screen or boss-time flashes.
    const glint=(Math.floor(time*.8+i*1.3+seed*.1)%5===0)?3:2;
    context.fillRect(x,y,glint,glint);
   }else if(type==='embers')context.fillRect(x,y,2+i%2,2+i%2);
   else if(type==='pollen')context.fillRect(x,y,2+(i%4===0?1:0),2);
   else if(type==='dust')context.fillRect(x,y,3+i%3,1+(i%5===0?1:0));
   else context.fillRect(x,y,2+i%3,2);
  }
 }
 context.restore();
 return vista;
}

/* Alpha 0.12.1 — 29 additional authored-style illustrated terrain mattes.
   The original Tier I painted battlefield remains unchanged. The other tiers
   use reproducible, offline-composable SVG landscape art, decoded once per
   selected tier; no network calls, per-frame geometry builds, or save changes. */
/* Each tier carries a short piece of grounded local history, not a generated reward. */
const territoryLore=[
 'The first watchfires still burn along the orchard road.',
 'Old frontier braziers glow beneath cliffs blackened by war.',
 'Frozen wardstones mark the pass that no caravan crosses twice.',
 'The drowned sentries keep vigil in waterlogged ruins.',
 'Storm-lashed watchposts stand against the thunder beyond the ridge.',
 "A forgotten kingdom's towers lean toward the last pale horizon.",
 'Cinders drift across the homes the mountain swallowed.',
 'Black citadel stones drink what little daylight remains.',
 'The oldest groves shelter ruins older than the crown.',
 'Stars hang unnaturally low above the broken descent.',
 'Shattered battlements remember the oaths of fallen kings.',
 'A primordial furnace still burns beneath the battered road.',
 'The Cinder Throne casts its red shadow over every approach.',
 'Obsidian cliffs bear the scars of ancient siege engines.',
 'Rift-born monuments hover where the world once fractured.',
 'The last banners of the kingdom hang above shattered gates.',
 'Glassheart spires ring like bells before the approaching storm.',
 'Moonlit catacombs hold the memory of vanished sentinels.',
 'The Sunforged Divide glows with buried golden veins.',
 'Ancient roots have grown through the stones of the Thorned Crown.',
 'Gloamwater floods the ruins no king could reclaim.',
 'At the Zenith, frost gathers on the relics of falling stars.',
 'Dreadroot trees guard the buried road to forgotten dominions.',
 'The Hollow Star is reflected in the ruins of its own temple.',
 'Blackglass choir towers echo with long-silent hymns.',
 'Thundergrave pillars spark above the restless storm plains.',
 'The Golden Abyss has claimed every empire that sought its riches.',
 'Broken divine arches frame the silence of the fallen pantheon.',
 'The last scar across the world still burns beneath its surface.',
 'Beyond the Origin Gate, the beginning and the ending meet.'
];
/* Alpha 0.12.3 — regional landmark relics. Names follow local territory lore,
   but the silhouettes stay consistent with the painted pixel terrain. */
const terrainRelicMotifs=[
 'beacon','monolith','wardstone','lantern','conduit','arch',
 'brazier','obelisk','roots','stargate','crown','furnace',
 'throne','obelisk','stargate','banner','glass','crypt',
 'solar','thorn','floodgate','mirror','roots','stargate',
 'obelisk','conduit','solar','arch','brazier','stargate'
];
const terrainBiomes=[
 'verdant','ash','frost','marsh','storm','ruin','ember','obsidian','grove','astral',
 'ruin','ember','ember','obsidian','astral','ruin','crystal','astral','desert','thorn',
 'marsh','frost','thorn','astral','obsidian','storm','desert','ruin','ember','astral'
];
const terrainColors={
 verdant:{sky:['#777db0','#e6b1ad','#ffd4a1'],mount:['#777993','#4d667a'],land:['#50654d','#84936b'],road:['#805d4a','#b89073'],dark:'#2b5145',light:'#c2cd8c',accent:'#deb86f'},
 ash:{sky:['#4e536b','#be776d','#dfaaa0'],mount:['#675a66','#554955'],land:['#6d5551','#927465'],road:['#5f4e53','#b5927c'],dark:'#49434a',light:'#c5aaa0',accent:'#f3a56f'},
 frost:{sky:['#3e577d','#a6bbd2','#ecdbda'],mount:['#8299ae','#546d8d'],land:['#748d98','#b2c7c9'],road:['#718a97','#b3c7cd'],dark:'#4b6580',light:'#f5f3e6',accent:'#b2eaf5'},
 marsh:{sky:['#435b64','#a1a98e','#c8baa0'],mount:['#556e6a','#395d60'],land:['#425d4e','#64816b'],road:['#544f47','#948575'],dark:'#2b4d42',light:'#9cbd91',accent:'#a7dfbd'},
 storm:{sky:['#273954','#79869f','#ad9eaa'],mount:['#4e6379','#334659'],land:['#455f6a','#71868a'],road:['#536478','#a1a2a4'],dark:'#253e57',light:'#a3c4d3',accent:'#b4d4ed'},
 ruin:{sky:['#544d70','#c3a08a','#e5c8a2'],mount:['#6c6076','#55566c'],land:['#6e6762','#9b8d76'],road:['#615651','#b3a08a'],dark:'#48424c',light:'#d2bca0',accent:'#f7cf91'},
 ember:{sky:['#4c364f','#aa534c','#f6a26a'],mount:['#68414b','#442b3b'],land:['#613f3c','#86574a'],road:['#4e3741','#a27564'],dark:'#342a35',light:'#e18d62',accent:'#ffc175'},
 obsidian:{sky:['#2e334c','#74536b','#c88d84'],mount:['#4b4059','#28283e'],land:['#403c43','#686068'],road:['#3d3a4c','#867c89'],dark:'#252534',light:'#ab9aa9',accent:'#b8a0f5'},
 grove:{sky:['#535e89','#a4b2ad','#d9c09b'],mount:['#56736f','#3f6671'],land:['#3a644f','#74905d'],road:['#6c6250','#b4a27b'],dark:'#245441',light:'#c2c78b',accent:'#d5d384'},
 astral:{sky:['#262e58','#65639b','#aaa1c8'],mount:['#4b4e83','#313c6c'],land:['#49476d','#7274a0'],road:['#4c4969','#9690ae'],dark:'#26294e',light:'#b6b7e6',accent:'#c6a8f9'},
 crystal:{sky:['#493c67','#a17baf','#d3b1c3'],mount:['#6b6589','#464e83'],land:['#625773','#94829d'],road:['#554c65','#ae92b5'],dark:'#3c365a',light:'#cfb1dc',accent:'#a5d8f5'},
 desert:{sky:['#62728b','#ddb08b','#f3cf9a'],mount:['#ad8f7d','#8e746b'],land:['#ab895d','#d2b27b'],road:['#947354','#d4ae83'],dark:'#806148',light:'#ffe0a5',accent:'#ffcb7f'},
 thorn:{sky:['#455471','#a99b96','#d4bd93'],mount:['#5b696f','#3f5666'],land:['#47594b','#71805b'],road:['#54534c','#9b8a73'],dark:'#354639',light:'#afbc80',accent:'#bc9e91'}
};
function terrainSeeded(tier){
 let seed=(Math.imul(tier,2654435761)^0x6c8e9cf5)>>>0;
 return ()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
}
function terrainSceneSvg(tier){
 const scene=territoryVista(tier),biome=terrainBiomes[scene.tier-1],colors=terrainColors[biome],rand=terrainSeeded(scene.tier);
 const pieces=[],choose=list=>list[Math.floor(rand()*list.length)],n=(low,high)=>Math.round(low+rand()*(high-low));
 const alpha=(low,high)=>Number((low+rand()*(high-low)).toFixed(2));
 const patch=(x,y,w,h,color,opacity=1)=>pieces.push('<rect x="'+x+'" y="'+y+'" width="'+Math.max(1,w)+'" height="'+Math.max(1,h)+'" fill="'+color+'" opacity="'+opacity+'"/>');
 const poly=(points,color,opacity=1)=>pieces.push('<polygon points="'+points+'" fill="'+color+'" opacity="'+opacity+'"/>');
 const line=(x1,y1,x2,y2,color,width=2,opacity=1)=>pieces.push('<path d="M'+x1+' '+y1+'L'+x2+' '+y2+'" fill="none" stroke="'+color+'" stroke-width="'+width+'" opacity="'+opacity+'"/>');
 const land=colors.land,sky=colors.sky;
 pieces.push('<svg xmlns="http://www.w3.org/2000/svg" width="960" height="346" viewBox="0 0 960 346" shape-rendering="crispEdges">');
 pieces.push('<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+sky[0]+'"/><stop offset=".62" stop-color="'+sky[1]+'"/><stop offset="1" stop-color="'+sky[2]+'"/></linearGradient>');
 pieces.push('<linearGradient id="soil" x1="0" y1="0" x2="0" y2="1"><stop stop-color="'+land[0]+'"/><stop offset="1" stop-color="'+land[1]+'"/></linearGradient>');
 pieces.push('<linearGradient id="road" x1="0" y1="0" x2=".7" y2="1"><stop stop-color="'+colors.road[0]+'"/><stop offset=".55" stop-color="'+colors.road[1]+'"/><stop offset="1" stop-color="'+colors.road[0]+'"/></linearGradient>');
 pieces.push('<clipPath id="causeway"><path d="M449 99C438 152 418 168 403 198C382 232 362 266 306 346H662C625 277 595 231 580 198C561 160 533 125 516 99Z"/></clipPath></defs>');
 patch(0,0,960,148,'url(#sky)');
 // A painted dusk, moon or eerie sun low on the horizon; no per-frame blur.
 pieces.push('<ellipse cx="'+n(520,740)+'" cy="'+n(13,55)+'" rx="'+n(34,57)+'" ry="'+n(20,38)+'" fill="'+colors.accent+'" opacity=".16"/>');
 pieces.push('<circle cx="'+n(560,745)+'" cy="'+n(17,49)+'" r="'+n(16,25)+'" fill="'+colors.accent+'" opacity=".64"/>');
 if(['astral','crystal','frost','obsidian'].includes(biome)){
  for(let i=0;i<46;i++)patch(n(8,949),n(3,93),choose([1,2,2,3]),choose([1,1,2]),colors.light,alpha(.27,.75));
 }
 // Far mountains use overlapping faceted silhouettes and intermittent light on cliffs.
 for(let layer=0;layer<3;layer++){
  let path='M0 '+(94+layer*19);
  for(let x=0;x<=1010;x+=38){const rise=n(17,52),y=78+layer*19-rise+(rand()-.5)*17;path+='L'+x+' '+Math.round(y)+'L'+(x+14)+' '+Math.round(y+rise*.32);}
  path+='L960 147L0 147Z';
  pieces.push('<path d="'+path+'" fill="'+colors.mount[layer===0?0:1]+'" opacity="'+[.78,.88,.94][layer]+'"/>');
 }
 for(let i=0;i<55;i++){
  const x=n(0,945),y=n(67,112);
  line(x,y,x+n(10,35),y-n(2,8),choose([colors.light,colors.mount[0]]),n(1,3),.25);
 }
 // Horizon, painted coarse brush texture, faint distant trees and battlements.
 patch(0,104,960,242,'url(#soil)');
 for(let i=0;i<44;i++){
  const x=i*24-10+n(-4,6),height=n(8,26);
  if(['forest','verdant','grove','thorn','marsh'].includes(biome)){
   poly((x-7)+',113 '+x+','+(113-height)+' '+(x+10)+',113',colors.dark,.75);
   line(x,108,x,115,colors.dark,2,.65);
  }else{
   poly((x-6)+',118 '+(x-2)+','+(118-height)+' '+(x+4)+','+(116-height*.5)+' '+(x+10)+',118',colors.dark,.65);
  }
 }
 // Midground land slopes and illustrated shaded earth ridges.
 pieces.push('<path d="M0 116Q160 102 342 130Q398 143 432 142L400 206Q257 166 0 203Z" fill="'+colors.land[1]+'" opacity=".5"/>');
 pieces.push('<path d="M960 118Q790 100 621 139L573 159L615 205Q758 160 960 211Z" fill="'+colors.dark+'" opacity=".25"/>');
 // Varied brush flecks / grasses / stones: dense but STATIC, rasterized by SVG decoder once.
 for(let i=0;i<420;i++){
  const x=n(1,956),y=n(116,345);
  if(x>395-(y-130)*.36&&x<565+(y-130)*.48)continue;
  const w=n(2,y>235?10:6),h=n(1,3),color=choose([colors.light,colors.dark,land[0],land[1],colors.accent]);
  patch(x,y,w,h,color,alpha(.18,.52));
  if(i%18===0)line(x,y+2,x+n(-2,2),y-n(3,7),colors.dark,1,.36);
 }
 // Flat, natural readable marching road is intentionally free from permanent landmarks.
 pieces.push('<path d="M449 99C438 152 418 168 403 198C382 232 362 266 306 346H662C625 277 595 231 580 198C561 160 533 125 516 99Z" fill="url(#road)"/>');
 pieces.push('<path d="M449 99C438 152 418 168 403 198C382 232 362 266 306 346" stroke="'+colors.dark+'" stroke-width="7" fill="none" opacity=".36"/>');
 pieces.push('<path d="M516 99C533 125 561 160 580 198C595 231 625 277 662 346" stroke="'+colors.light+'" stroke-width="7" fill="none" opacity=".22"/>');
 pieces.push('<g clip-path="url(#causeway)">');
 for(let row=0;row<19;row++){
  const y=102+row*(6+row*.45),step=16+row*.85;
  const offset=row%2?step*.53:0;
  for(let x=300+offset;x<663;x+=step){
   const w=n(10,Math.max(12,Math.round(step-2)));
   patch(Math.round(x+n(-2,2)),Math.round(y),w,n(2,Math.max(3,Math.round(step*.31))),choose([colors.road[0],colors.road[1],colors.light]),alpha(.16,.48));
  }
 }
 for(let i=0;i<120;i++)patch(n(310,648),n(113,344),n(2,9),n(1,3),choose([colors.road[0],colors.road[1],colors.dark]),.27);
 pieces.push('</g>');
 // Regional landmarks are lavishly shadowed, fractured and textured: not icon stamps.
 function tower(cx,base,scale,metal=false){
  const w=Math.round(42*scale),height=Math.round(120*scale),x=Math.round(cx-w/2),top=Math.round(base-height);
  const face=metal?colors.dark:colors.mount[1];
  patch(x,top+13,w,height-12,face);
  poly(x+','+(top+13)+' '+(x+12)+','+(top-4)+' '+(x+w-10)+','+(top-4)+' '+(x+w)+','+(top+13),colors.dark);
  patch(x+4,top+20,8,height-19,colors.light,.2);
  patch(x+w-13,top+20,11,height-19,colors.dark,.65);
  for(let k=0;k<4;k++)patch(x+k*(w/3),top+n(2,7),n(6,10),n(9,13),face);
  for(let j=0;j<Math.floor(height/14);j++){
   line(x+2,top+24+j*13,x+w-3,top+23+j*13,colors.light,1,.24);
   line(x+(j%2?Math.round(w*.36):Math.round(w*.62)),top+23+j*13,x+(j%2?Math.round(w*.36):Math.round(w*.62)),top+35+j*13,colors.dark,1,.45);
  }
  patch(x+Math.floor(w*.42),top+37,Math.max(3,Math.floor(w*.16)),n(14,25),colors.dark);
  patch(x+Math.floor(w*.4),top+34,Math.max(2,Math.floor(w*.08)),12,colors.accent,.25);
  patch(x-11,base-10,w+22,10,colors.mount[1]);
  for(let k=0;k<5;k++)patch(x+n(0,w-2),n(top+16,base-10),n(2,5),n(2,7),colors.light,.27);
 }
 function pine(x,base,s){
  const h=Math.round(n(72,125)*s),w=Math.round(h*.38);
  patch(x-4,base-h*.5,8,h*.53,colors.dark);
  for(let i=0;i<4;i++){
   const cy=base-h+i*(h*.18),radius=Math.round(w*(.55+i*.24));
   poly((x-radius)+','+(cy+h*.24)+' '+x+','+(cy-h*.12)+' '+(x+radius)+','+(cy+h*.24),i%2?colors.dark:colors.mount[1]);
   for(let j=0;j<5;j++)patch(x+n(-radius*.7,radius*.7),Math.round(cy+n(0,h*.12)),n(2,7),n(1,3),colors.light,.32);
  }
  patch(x-2,base-12,4,10,colors.light,.16);
 }
 function crystal(x,base,s){
  const h=Math.round(n(66,118)*s),w=Math.round(23*s);
  poly((x-w)+','+base+' '+(x-8)+','+(base-h*.7)+' '+(x+2)+','+(base-h)+' '+(x+w)+','+base,colors.dark);
  poly((x-7)+','+(base-6)+' '+(x+2)+','+(base-h)+' '+(x+10)+','+(base-5),colors.accent,.78);
  poly((x+12)+','+(base-5)+' '+(x+w+8)+','+(base-h*.55)+' '+(x+w+16)+','+base,colors.light,.65);
  line(x+1,base-h*.87,x+1,base-11,colors.light,2,.6);
  for(let i=0;i<4;i++)patch(x+n(-w,w),base-n(4,24),n(2,8),n(3,12),colors.light,.42);
 }
 function basalt(x,base,s){
  const h=Math.round(n(77,137)*s),w=Math.round(n(20,38)*s);
  poly((x-w)+','+base+' '+(x-w*.55)+','+(base-h*.55)+' '+(x-4)+','+(base-h)+' '+(x+w*.65)+','+(base-h*.7)+' '+(x+w)+','+base,colors.dark);
  poly((x-w*.4)+','+(base-8)+' '+(x-4)+','+(base-h*.82)+' '+(x+7)+','+(base-9),colors.mount[1]);
  for(let i=0;i<4;i++)line(x+n(-w*.5,w*.5),base-n(12,h*.63),x+n(-w*.6,w*.3),base-n(3,11),colors.accent,n(1,3),.5);
 }
 function oak(x,base,s){
  const h=Math.round(n(84,130)*s),w=Math.round(h*.40),top=base-h;
  poly((x-10)+','+base+' '+(x-15)+','+(base-h*.55)+' '+(x-7)+','+top+' '+(x+12)+','+(top+9)+' '+(x+9)+','+base,colors.dark);
  for(let k=0;k<5;k++){
   const ax=x+n(-w,w),ay=top+n(0,h*.48),r=n(20,34)*s;
   pieces.push('<ellipse cx="'+ax+'" cy="'+ay+'" rx="'+Math.round(r*1.25)+'" ry="'+Math.round(r*.76)+'" fill="'+(k%2?colors.mount[1]:colors.land[0])+'" opacity=".97"/>');
   for(let j=0;j<7;j++)patch(ax+n(-r,r),ay+n(-r*.36,r*.36),n(2,7),n(2,5),colors.light,.32);
  }
  line(x+4,base-24,x+Math.round(w*.7),base-h*.73,colors.dark,5);
 }
 function ruinArch(x,base,s){
  const w=Math.round(110*s),h=Math.round(105*s),left=x-w/2,top=base-h;
  patch(left,top+18,Math.round(20*s),h-18,colors.mount[1]);
  patch(left+w-20*s,top+18,Math.round(20*s),h-18,colors.mount[1]);
  poly(left+','+(top+18)+' '+(left+25*s)+','+top+' '+(left+w-24*s)+','+top+' '+(left+w)+','+(top+18)+' '+(left+w-10*s)+','+(top+34),colors.dark);
  patch(left+Math.round(18*s),top+13,w-Math.round(36*s),Math.round(16*s),colors.mount[1]);
  for(let k=0;k<6;k++)patch(Math.round(left+k*w/6),Math.round(top+n(6,14)),n(5,12),n(5,11),colors.light,.24);
  for(let k=0;k<8;k++)line(left+n(0,w),top+n(24,h),left+n(0,w),top+n(24,h),colors.light,1,.3);
  patch(left-7,base-8,w+14,8,colors.dark);
 }
 // Painted artifacts, one signature architectural subject per territory.
 // Located outside the 310–660 road lane; static inside the already-cached SVG.
 const relicType=terrainRelicMotifs[scene.tier-1];
 function paintRelic(cx,base,scale,subject){
  const h=n(54,85)*scale,w=n(20,32)*scale;
  const x=Math.round(cx),y=Math.round(base),top=Math.round(y-h);
  const dark=colors.dark,stone=colors.mount[1],sun=colors.accent,shine=colors.light;
  const block=(a,b,ww,hh,col,op=1)=>patch(Math.round(a),Math.round(b),Math.round(ww),Math.round(hh),col,op);
  const shape=(pts,col,op=1)=>poly(pts.map(pt=>Math.round(pt[0])+','+Math.round(pt[1])).join(' '),col,op);
  if(['beacon','brazier','furnace'].includes(subject)){
   // Forged stone well with visible molten core, not a floating icon.
   shape([[x-w,y],[x-w*.77,y-17*scale],[x+w*.77,y-17*scale],[x+w,y]],dark);
   block(x-w*.63,y-31*scale,w*1.26,15*scale,stone);
   block(x-w*.78,y-32*scale,w*1.56,6*scale,shine,.36);
   for(let k=0;k<4;k++)block(x-w*.46+k*w*.31,y-15*scale,w*.19,10*scale,stone,.9);
   const flame=subject==='furnace'?1.35:1;
   shape([[x-8*scale,y-34*scale],[x-13*scale,y-48*scale*flame],
    [x-2*scale,y-43*scale*flame],[x+3*scale,y-70*scale*flame],
    [x+12*scale,y-45*scale*flame],[x+7*scale,y-34*scale]],sun,.91);
   shape([[x-3*scale,y-35*scale],[x,y-55*scale*flame],[x+6*scale,y-38*scale]],shine,.9);
   for(let k=0;k<7;k++)block(x+n(-22,22)*scale,y-n(34,75)*scale,2*scale,2*scale,sun,.48);
  }else if(['monolith','wardstone','obelisk'].includes(subject)){
   shape([[x-w,y],[x-w*.9,top+18*scale],[x-7*scale,top],
    [x+w*.6,top+12*scale],[x+w,y]],dark);
   shape([[x-w*.82,y-5*scale],[x-w*.7,top+18*scale],[x-5*scale,top+8*scale],
    [x+1*scale,y-7*scale]],stone);
   line(x-7*scale,top+17*scale,x+7*scale,top+18*scale,sun,2*scale,.5);
   line(x,top+23*scale,x-4*scale,top+39*scale,sun,2*scale,.7);
   for(let k=0;k<3;k++)line(x+n(-16,17)*scale,top+n(29,49)*scale,
    x+n(-17,16)*scale,top+n(48,64)*scale,shine,1,.26);
   shape([[x-w-9*scale,y],[x-w,y-16*scale],[x-w*.65,y]],stone,.74);
  }else if(['lantern','conduit','floodgate'].includes(subject)){
   block(x-4*scale,top,7*scale,h,dark);
   block(x-13*scale,top+8*scale,29*scale,7*scale,stone);
   shape([[x-19*scale,top+13*scale],[x,top-5*scale],
    [x+20*scale,top+13*scale]],dark);
   block(x-13*scale,top+17*scale,25*scale,23*scale,stone);
   block(x-9*scale,top+21*scale,17*scale,14*scale,sun,.78);
   line(x-5*scale,top+21*scale,x+6*scale,top+34*scale,shine,2*scale,.7);
   if(subject==='conduit')for(let k=0;k<4;k++)line(x-24*scale+k*13*scale,
    top-11*scale,x-17*scale+k*13*scale,top+3*scale,shine,2*scale,.38);
   if(subject==='floodgate')for(let k=0;k<4;k++)block(x-36*scale,
    y-(4+k*5)*scale,72*scale,2*scale,shine,.21);
   block(x-18*scale,y-6*scale,38*scale,6*scale,dark);
  }else if(['arch','crypt','stargate','throne'].includes(subject)){
   block(x-w*1.13,top+13*scale,12*scale,h-8*scale,dark);
   block(x+w*.56,top+13*scale,12*scale,h-8*scale,dark);
   shape([[x-w*1.3,top+21*scale],[x-w*1.1,top],
    [x+w*1.11,top],[x+w*1.31,top+21*scale]],stone);
   block(x-w,top+6*scale,w*1.97,7*scale,shine,.25);
   if(subject==='stargate'){
    shape([[x-13*scale,top+31*scale],[x,top+20*scale],
     [x+13*scale,top+31*scale],[x+10*scale,y-7*scale],
     [x-11*scale,y-7*scale]],sun,.65);
    block(x-2*scale,top+37*scale,4*scale,h*.4,shine,.64);
   }
   if(subject==='crypt')for(let k=0;k<3;k++)block(x-13*scale+k*8*scale,y-13*scale,5*scale,17*scale,dark);
   if(subject==='throne')block(x-16*scale,y-29*scale,32*scale,29*scale,stone);
   for(let k=0;k<8;k++)block(x+n(-w,w)*scale,y-n(4,30)*scale,n(1,5)*scale,2*scale,shine,.25);
  }else if(['roots','thorn'].includes(subject)){
   shape([[x-10*scale,y],[x-8*scale,top+30*scale],[x-14*scale,top+10*scale],
    [x-1*scale,top],[x+16*scale,top+10*scale],
    [x+7*scale,top+33*scale],[x+12*scale,y]],dark);
   for(let k=0;k<7;k++){
    const dx=n(-44,44)*scale,dy=n(-21,24)*scale;
    line(x+(dx>0?4:-5)*scale,top+28*scale,x+dx,top+dy,stone,n(2,5)*scale,.84);
    block(x+dx-5*scale,top+dy-4*scale,n(9,19)*scale,
     n(6,10)*scale,k%2?colors.land[0]:colors.mount[1],.82);
   }
   if(subject==='thorn')for(let k=0;k<6;k++)
    shape([[x+n(-43,43)*scale,top+n(3,53)*scale],[x+n(-45,45)*scale,top+n(0,54)*scale],
     [x+n(-46,44)*scale,top+n(-7,49)*scale]],shine,.58);
   for(let k=0;k<4;k++)line(x+n(-13,13)*scale,y-15*scale,x+n(-27,27)*scale,y,
    shine,2*scale,.32);
  }else if(['glass','solar','mirror','crown'].includes(subject)){
   shape([[x-24*scale,y],[x-12*scale,top+23*scale],[x,top],
    [x+20*scale,top+16*scale],[x+24*scale,y]],dark);
   shape([[x-11*scale,y-8*scale],[x,top+11*scale],
    [x+8*scale,y-8*scale]],sun,.74);
   shape([[x+12*scale,y],[x+25*scale,top+36*scale],
    [x+39*scale,y]],shine,.36);
   if(subject==='solar'){
    for(let k=0;k<8;k++){
     const angle=k*Math.PI/4;
     line(x+Math.cos(angle)*24*scale,top+36*scale+Math.sin(angle)*24*scale,
      x+Math.cos(angle)*35*scale,top+36*scale+Math.sin(angle)*35*scale,sun,2*scale,.62);
    }
   }
   if(subject==='crown')for(let k=0;k<3;k++)
    shape([[x+(k*13-19)*scale,y-13*scale],[x+(k*13-14)*scale,y-33*scale],
     [x+(k*13-6)*scale,y-14*scale]],sun,.6);
   line(x-6*scale,top+20*scale,x+9*scale,y-6*scale,shine,2*scale,.7);
  }else if(subject==='banner'){
   block(x-3*scale,top-8*scale,5*scale,h+8*scale,dark);
   shape([[x+2*scale,top-5*scale],[x+45*scale,top+1*scale],
    [x+35*scale,top+25*scale],[x+4*scale,top+35*scale]],colors.land[1]);
   shape([[x+5*scale,top-1*scale],[x+34*scale,top+5*scale],
    [x+16*scale,top+29*scale],[x+3*scale,top+31*scale]],sun,.38);
   for(let k=0;k<4;k++)line(x+4*scale,top+(k*8+3)*scale,
    x+29*scale,top+(k*8+7)*scale,shine,1,.33);
   block(x-12*scale,y-5*scale,27*scale,7*scale,stone);
  }
  // Tiny painted edge chips give each relic material depth.
  for(let k=0;k<9;k++)block(x+n(-w,w)*scale,y-n(2,h*.6)*scale,
   n(1,4)*scale,n(1,3)*scale,k%2?shine:stone,.3);
 }
 paintRelic(n(103,161),n(235,263),alpha(.74,.98),relicType);
 if(scene.tier>=10||scene.tier%4===0)paintRelic(n(790,865),n(225,256),alpha(.45,.68),relicType);
 // Landmark pair placement stays to field edges so it cannot confuse combat.
 const leftX=n(92,205),rightX=n(758,870),nearY=n(243,273);
 if(['verdant','grove','thorn'].includes(biome)){
  oak(leftX,nearY,1.05);pine(rightX,nearY+8,.9);
  for(let k=0;k<4;k++)pine(n(0,285),n(182,263),alpha(.35,.72));
  if(biome==='thorn')for(let k=0;k<8;k++)line(n(0,305),n(233,341),n(0,305),n(208,231),colors.dark,2,.55);
 }else if(['frost','crystal','astral'].includes(biome)){
  crystal(leftX,nearY,alpha(.8,1.3));crystal(rightX,nearY,alpha(.7,1.2));
  for(let k=0;k<5;k++)crystal(n(0,955),n(175,267),alpha(.28,.65));
  if(biome==='astral')ruinArch(n(700,820),n(196,230),.62);
 }else if(['ruin','obsidian'].includes(biome)){
  tower(leftX,nearY,alpha(.78,1.25),biome==='obsidian');
  ruinArch(rightX,nearY,alpha(.77,1.06));
  for(let k=0;k<4;k++)basalt(n(30,930),n(208,280),alpha(.27,.68));
 }else if(['ember','ash','storm'].includes(biome)){
  basalt(leftX,nearY,alpha(.85,1.2));tower(rightX,nearY,n(.8,1.22),true);
  for(let k=0;k<6;k++)basalt(n(0,960),n(179,265),alpha(.27,.7));
  if(biome==='storm')for(let k=0;k<4;k++)line(n(0,960),n(68,128),n(0,960),n(134,168),colors.accent,2,.38);
 }else if(biome==='marsh'){
  oak(leftX,nearY,alpha(.8,1.12));ruinArch(rightX,nearY,.7);
  for(let k=0;k<9;k++)patch(n(0,950),n(222,333),n(15,40),n(2,5),colors.light,.14);
 }else if(biome==='desert'){
  tower(leftX,nearY,alpha(.65,.95));basalt(rightX,nearY,alpha(.9,1.16));
  for(let k=0;k<5;k++)poly(n(0,945)+','+n(251,278)+' '+n(0,940)+','+n(214,244)+' '+n(0,960)+','+n(249,274),colors.road[0],.5);
 }
 // Near-field sparse tuft and rock texture; never over the road marching lane.
 for(let i=0;i<52;i++){
  const x=n(2,958),y=n(261,345);
  if(x>330&&x<644)continue;
  if(rand()>.57){
   poly((x-5)+','+(y+2)+' '+x+','+(y-7)+' '+(x+7)+','+(y+1),colors.dark,.45);
   patch(x-1,y-3,3,2,colors.light,.44);
  }else{
   line(x,y,x-2,y-n(3,8),colors.light,1,.52);
   line(x+3,y+1,x+4,y-n(3,8),colors.dark,1,.42);
  }
 }
 pieces.push('</svg>');
 return pieces.join('');
}
let terrainCachedTier=0,terrainCachedImage=null;
function territorySceneImage(tier){
 const normalized=territoryVista(tier).tier;
 if(normalized===terrainCachedTier)return terrainCachedImage;
 terrainCachedTier=normalized;
 if(normalized===1){terrainCachedImage=null;return null;} // Original painted Verdant March retained.
 const image=new Image();
 image.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(terrainSceneSvg(normalized));
 terrainCachedImage=image;
 return image;
}
/* Alpha 0.12.7 — dress ALL THREE original painted banners consistently:
   the previously missed middle guild banner stays red if only edges change.
   Banners remain behind the hero and projectiles; Tier I stays original. */
const heraldrySigils={
 verdant:'M0 -16V15M0 -4L-8 -13M0 3L9 -8M0 9L-7 4',
 ash:'M-9 13Q-14 2-4-9L1-18Q4-5 11 0Q15 10 5 15M-3 12Q-4 3 3-3',
 frost:'M0 -17V17M-15 0H15M-11-11L11 11M11 -11L-11 11',
 marsh:'M-11 14Q-15-3 1-12Q18-3 11 14M-9 2Q0 9 9 2',
 storm:'M4 -17L-9 2H1L-4 17L12-3H3Z',
 ruin:'M-15-3L-10-14H10L16-3M-12-1V14M12-1V14M-16 14H16',
 ember:'M0-19Q16-7 8 6Q4 17-2 15Q-16 5-5-5M0 5Q9 1 3 12',
 obsidian:'M0-17L14-1L0 17L-14-1ZM0-16V17',
 grove:'M0 -16V15M0-6Q-15-17-13-4Q-12 3 0 2M0-3Q14-17 13-4Q12 4 0 3',
 astral:'M0-19L5-5L18 0L5 5L0 18L-5 5L-18 0L-5-5ZM0-11V11M-11 0H11',
 crystal:'M0-18L11-5L7 10L0 18L-9 5L-11-6ZM0-18V18',
 desert:'M0-17L15 13H-15ZM-8 5H8M-4-2H4',
 thorn:'M0-17L-7-7L0-3L-12 4L-2 8L-8 16L8 8L12-3L4-5Z'
};
function fortressHeraldrySvg(tier){
 const t=territoryVista(tier).tier,biome=terrainBiomes[t-1],pallet=terrainColors[biome];
 const silk=pallet.land[0],fold=pallet.land[1],gold=pallet.accent,edge=pallet.dark,light=pallet.light;
 const symbol=heraldrySigils[biome];
 // Coordinates are based on the original hand-painted 960×540 art:
 // outer left 57–124, guild center 246–310, outer right 834–894.
 // All three red cloth panels are covered; do not draw over the center knight.
 const banners=[
  {cx:91,top:388,left:57,right:124,point:517},
  {cx:277,top:384,left:246,right:310,point:507},
  {cx:864,top:390,left:834,right:894,point:513}
 ];
 const parts=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" shape-rendering="crispEdges">',
  '<defs><linearGradient id="cloth" x1="0" y1="0" x2="1" y2="0">',
  '<stop stop-color="'+edge+'"/><stop offset=".17" stop-color="'+silk+'"/>',
  '<stop offset=".55" stop-color="'+fold+'"/><stop offset=".84" stop-color="'+silk+'"/>',
  '<stop offset="1" stop-color="'+edge+'"/></linearGradient></defs>'];
 for(let k=0;k<banners.length;k++){
  const b=banners[k],cx=b.cx,left=b.left,right=b.right,top=b.top,point=b.point;
  const base=point-20;
  const tip=point-(t%4)*2;
  const bannerPath='M'+left+' '+top+'L'+right+' '+top+'L'+(right-3)+' '+base+
   'L'+cx+' '+tip+'L'+(left+3)+' '+base+'Z';
  parts.push('<path d="'+bannerPath+'" fill="url(#cloth)" stroke="'+gold+'" stroke-width="3"/>');
  parts.push('<path d="M'+(left+7)+' '+(top+5)+'V'+(base-8)+'L'+cx+' '+(tip-11)+
   '" fill="none" stroke="'+light+'" stroke-width="2" opacity=".26"/>');
  parts.push('<path d="M'+(right-8)+' '+(top+5)+'V'+(base-8)+'" fill="none" stroke="'+edge+
   '" stroke-width="4" opacity=".55"/>');
  parts.push('<path d="M'+left+' '+(top+1)+'L'+right+' '+(top+1)+
   '" fill="none" stroke="'+gold+'" stroke-width="4" opacity=".8"/>');
  // Heraldic symbol is all threadwork, not a UI icon pasted on scenery.
  parts.push('<g transform="translate('+cx+' '+(top+51)+')" fill="none" stroke="'+gold+
   '" stroke-width="3.3" stroke-linejoin="round" stroke-linecap="round"><path d="'+symbol+'"/></g>');
  parts.push('<path d="M'+(cx-15)+' '+(top+76)+'Q'+cx+' '+(top+80)+' '+(cx+15)+' '+(top+76)+
   '" fill="none" stroke="'+light+'" stroke-width="2" opacity=".57"/>');
  for(let j=0;j<11;j++){
   const x=left+6+((j*17+t*7+k*9)%(right-left-11));
   const y=top+7+((j*29+t*3)%(point-top-26));
   parts.push('<rect x="'+x+'" y="'+y+'" width="'+(j%3+1)+'" height="'+(j%2+2)+
    '" fill="'+(j%2?gold:light)+'" opacity=".2"/>');
  }
  // Delicate gold fringe on the tattered lower hem; no new sprites or particles.
  for(let j=0;j<7;j++){
   const x=left+8+j*(right-left-16)/6;
   const lower=base+((j%3)===1?8:3);
   parts.push('<path d="M'+Math.round(x)+' '+lower+'l0 4" stroke="'+gold+
    '" stroke-width="2" opacity=".6"/>');
  }
 }
 parts.push('</svg>');
 return parts.join('');
}
let heraldryCachedTier=0,heraldryCachedImage=null;
function fortressHeraldryImage(tier){
 const t=territoryVista(tier).tier;
 if(t===heraldryCachedTier)return heraldryCachedImage;
 heraldryCachedTier=t;
 if(t===1){heraldryCachedImage=null;return null;} // Respect original Verdant March painting.
 const im=new Image();
 im.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(fortressHeraldrySvg(t));
 heraldryCachedImage=im;
 return im;
}
/* Alpha 0.12.5 — view-only realm atlas. Uses the identical terrain and banner
   generators, but NEVER alters chosenTier, unlockedTier, run or the game art cache.
   Only the currently visible atlas picture is decoded in the DOM. */
let atlasCurrentTier=1,atlasCompareOriginal=false,atlasOpen=false;
let atlasBossStyle='none',atlasBossPhase=1,atlasWeatherOn=false;
let atlasZoomed=false,atlasScale=1,atlasPanX=0,atlasPanY=0,atlasPointer=null;
const atlasPointers=new Map();let atlasPinch=null;
function releaseWorldAtlasImages(){
 // Safari can keep very large percent-encoded SVG URLs alive while hidden.
 // Drop only DOM preview references, never the battle's two live Image caches.
 for(const id of ['atlasMatte','atlasHeraldry','atlasWeather','atlasBossStage']){
  const picture=$(id);
  picture.hidden=true;
  picture.removeAttribute?.('src');
  picture.dataset.atlasTier='';
  picture.dataset.stageKey='';
  picture.dataset.weatherKey='';
 }
}
function updateAtlasComparison(){
 const original=atlasCompareOriginal||atlasCurrentTier===1;
 $('atlasMatte').hidden=original;
 $('atlasHeraldry').hidden=original;
 updateAtlasWeather();
 updateAtlasBossStage();
 const button=$('atlasCompare');
 button.disabled=atlasCurrentTier===1;
 button.textContent=atlasCompareOriginal?'SHOW TERRITORY ART':'COMPARE ORIGINAL ART';
 button.setAttribute?.('aria-pressed',String(atlasCompareOriginal));
 return atlasCompareOriginal;
}
function toggleAtlasComparison(){
 if($('worldAtlas').hidden||atlasCurrentTier===1)return false;
 atlasCompareOriginal=!atlasCompareOriginal;
 updateAtlasComparison();
 return true;
}
/* Alpha 0.12.19 — inspect the exact battle lighting and an authentic,
   frozen 12-second weather sample in the view-only Atlas. The same
   drawTerritoryAtmosphere() function provides all painted rectangles.
   No RAF/timer, new particle system, unlocked tier, or save mutation. */
function atlasWeatherSvg(tier=atlasCurrentTier,seconds=12){
 const art=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" shape-rendering="crispEdges">'];
 let fill='#fff';
 const ctx={
  save(){},restore(){},
  set fillStyle(value){fill=value;},
  fillRect(x,y,w,h){
   if(![x,y,w,h].every(Number.isFinite)||w<=0||h<=0)return;
   art.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+'"/>');
  }
 };
 drawTerritoryAtmosphere(ctx,seconds,tier,reduceMotion);
 art.push('</svg>');
 return art.join('');
}
function updateAtlasWeather(){
 const image=$('atlasWeather');
 const key=atlasWeatherOn?atlasCurrentTier+':'+visualQuality+':'+(reduceMotion?'still':'weather'):'';
 if(image.dataset.weatherKey!==key){
  if(key)image.src='data:image/svg+xml;charset=utf-8,'+
   encodeURIComponent(atlasWeatherSvg(atlasCurrentTier,12));
  else image.removeAttribute?.('src');
  image.dataset.weatherKey=key;
 }
 image.hidden=!atlasWeatherOn||atlasCompareOriginal;
 const button=$('atlasWeatherToggle');
 button.setAttribute?.('aria-pressed',String(atlasWeatherOn));
 button.textContent=atlasWeatherOn?'HIDE WEATHER':'PREVIEW WEATHER';
 $('atlasWeatherStatus').textContent=atlasWeatherOn?
  'WEATHER ON · '+territoryVista(atlasCurrentTier).weather.toUpperCase()+
  ' · STATIC BATTLE SAMPLE · '+(reduceMotion?'REDUCED MOTION':'12s FRAME'):
  'WEATHER OFF · ORIGINAL SKY COLOR';
 return atlasWeatherOn;
}
function toggleAtlasWeather(){
 if(!atlasOpen)return false;
 atlasWeatherOn=!atlasWeatherOn;
 return updateAtlasWeather();
}
/* Alpha 0.12.17 — inspect exact live boss-stage geometry without
   unlocking tiers or simulating combat. The preview serializes the existing
   territoryBossStaging() canvas calls as static SVG, with the same shapes,
   biome colors, depth and phase effects; it never touches a real run. */
const atlasBossStyles=['none','iron','ember','rift','beast'];
function atlasBossStageSvg(tier,style,phase=1){
 if(!atlasBossStyles.includes(style)||style==='none')return '';
 const normalized=territoryVista(tier).tier;
 const pieces=['<svg xmlns="http://www.w3.org/2000/svg" width="960" height="540" viewBox="0 0 960 540" shape-rendering="crispEdges">'];
 let fill='#fff',alpha=1;
 const recorder={
  save(){},restore(){},
  set fillStyle(value){fill=value;},
  set globalAlpha(value){alpha=Number(value);},
  fillRect(x,y,w,h){
   if(![x,y,w,h,alpha].every(Number.isFinite)||w<=0||h<=0)return;
   pieces.push('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+fill+
    '" opacity="'+clamp(alpha,0,1).toFixed(3)+'"/>');
  }
 };
 const unit={type:style==='beast'?'siegebeast':'warlord',isBoss:true,
  dead:false,hp:100,max:100,bossStyle:style,bossPhase:style!=='beast'&&phase===2?2:1};
 const mock={phase:'fighting',encounter:{kind:'chapterBoss'},time:0,enemies:[unit]};
 if(!territoryBossStaging(recorder,normalized,mock,true).active)return '';
 pieces.push('</svg>');
 return pieces.join('');
}
function updateAtlasBossStage(){
 const picture=$('atlasBossStage');
 const key=atlasBossStyle==='none'?'':atlasCurrentTier+':'+atlasBossStyle+':'+atlasBossPhase;
 if(picture.dataset.stageKey!==key){
  if(key)picture.src='data:image/svg+xml;charset=utf-8,'+
   encodeURIComponent(atlasBossStageSvg(atlasCurrentTier,atlasBossStyle,atlasBossPhase));
  else picture.removeAttribute?.('src');
  picture.dataset.stageKey=key;
 }
 picture.hidden=!key||atlasCompareOriginal;
 for(const style of atlasBossStyles){
  $('atlasBoss'+style[0].toUpperCase()+style.slice(1)).
   setAttribute?.('aria-pressed',String(atlasBossStyle===style));
 }
 const phase=$('atlasBossPhase');
 phase.disabled=atlasBossStyle==='none'||atlasBossStyle==='beast';
 phase.setAttribute?.('aria-pressed',String(atlasBossStyle!=='beast'&&atlasBossPhase===2));
 phase.textContent=atlasBossStyle==='beast'?'NO PHASE II':atlasBossPhase===2?'PHASE II · ACTIVE':'PHASE II';
 $('atlasBossStatus').textContent=atlasBossStyle==='none'?
  'BOSS STAGE OFF · SELECT A STYLE TO INSPECT':
  atlasBossStyle.toUpperCase()+' · PHASE '+(atlasBossPhase===2?'II':'I')+
  ' · ART ONLY · NO FIGHT OR REWARDS';
 return !!key;
}
function chooseAtlasBossStyle(style){
 if(!atlasOpen||!atlasBossStyles.includes(style))return false;
 atlasBossStyle=style;if(style==='none'||style==='beast')atlasBossPhase=1;
 updateAtlasBossStage();
 return true;
}
function toggleAtlasBossPhase(){
 if(!atlasOpen||atlasBossStyle==='none'||atlasBossStyle==='beast')return false;
 atlasBossPhase=atlasBossPhase===1?2:1;
 updateAtlasBossStage();
 return true;
}
/* Alpha 0.12.10 — the four illustration layers zoom as ONE canvas-sized
   group. Two-finger touch scales 1–3× around the gesture midpoint, without
   re-decoding any landscape or changing the selected/unlocked territory.
   CSS translation percentages are relative to the unscaled illustration. */
function atlasPanLimit(scale=atlasScale){return Math.max(0,(scale-1)*50);}
function applyAtlasZoom(){
 atlasZoomed=atlasScale>1.01;
 const bound=atlasPanLimit();
 atlasPanX=clamp(atlasPanX,-bound,bound);
 atlasPanY=clamp(atlasPanY,-bound,bound);
 const viewport=$('atlasScene'),art=$('atlasArtwork'),button=$('atlasZoom');
 viewport.dataset.zoom=String(atlasZoomed);
 art.style.transform=atlasZoomed?
  'translate('+atlasPanX.toFixed(2)+'%,'+atlasPanY.toFixed(2)+'%) scale('+Number(atlasScale.toFixed(2))+')':'none';
 button.textContent=atlasZoomed?'ZOOM OUT · '+atlasScale.toFixed(1)+'×':'ZOOM IN · 1.8×';
 button.setAttribute?.('aria-pressed',String(atlasZoomed));
 return atlasZoomed;
}
function resetAtlasZoom(){
 atlasScale=1;atlasZoomed=false;atlasPanX=0;atlasPanY=0;
 atlasPointer=null;atlasPinch=null;atlasPointers.clear();
 return applyAtlasZoom();
}
function toggleAtlasZoom(){
 if(!atlasOpen)return false;
 atlasScale=atlasZoomed?1:1.8;
 atlasPanX=0;atlasPanY=0;atlasPointer=null;atlasPinch=null;atlasPointers.clear();
 return applyAtlasZoom();
}
function atlasPointerDown(e){
 if(!atlasOpen||!Number.isFinite(e.clientX)||!Number.isFinite(e.clientY))return false;
 const id=e.pointerId??0;
 if(atlasPointers.has(id)||atlasPointers.size>=2)return false;
 atlasPointers.set(id,{x:e.clientX,y:e.clientY});
 if(e.pointerId!==undefined)$('atlasScene').setPointerCapture?.(e.pointerId);
 if(atlasPointers.size===2){
  const [a,b]=[...atlasPointers.values()];
  atlasPinch={distance:Math.max(1,Math.hypot(b.x-a.x,b.y-a.y)),
   scale:atlasScale,panX:atlasPanX,panY:atlasPanY,
   midX:(a.x+b.x)/2,midY:(a.y+b.y)/2};
  atlasPointer=null;
 }else{
  atlasPointer={id,x:e.clientX,y:e.clientY,panX:atlasPanX,panY:atlasPanY};
 }
 return true;
}
function atlasPointerMove(e){
 const id=e.pointerId??0;
 if(!atlasOpen||!atlasPointers.has(id)||!Number.isFinite(e.clientX)||!Number.isFinite(e.clientY))return false;
 atlasPointers.set(id,{x:e.clientX,y:e.clientY});
 const view=$('atlasScene'),rect=view.getBoundingClientRect?.();
 const w=Math.max(1,rect?.width||960),h=Math.max(1,rect?.height||540);
 if(atlasPinch&&atlasPointers.size===2){
  const [a,b]=[...atlasPointers.values()],distance=Math.hypot(b.x-a.x,b.y-a.y);
  const next=clamp(atlasPinch.scale*distance/atlasPinch.distance,1,3);
  const midX=(a.x+b.x)/2,midY=(a.y+b.y)/2;
  const x0=(atlasPinch.midX-(rect?.left||0)-w/2)*100/w;
  const y0=(atlasPinch.midY-(rect?.top||0)-h/2)*100/h;
  const x1=(midX-(rect?.left||0)-w/2)*100/w;
  const y1=(midY-(rect?.top||0)-h/2)*100/h;
  const factor=next/atlasPinch.scale,bound=atlasPanLimit(next);
  atlasPanX=clamp(x1-factor*(x0-atlasPinch.panX),-bound,bound);
  atlasPanY=clamp(y1-factor*(y0-atlasPinch.panY),-bound,bound);
  atlasScale=next;applyAtlasZoom();
  return true;
 }
 if(!atlasZoomed||!atlasPointer||atlasPointer.id!==id)return false;
 const bound=atlasPanLimit();
 atlasPanX=clamp(atlasPointer.panX+(e.clientX-atlasPointer.x)*100/w,-bound,bound);
 atlasPanY=clamp(atlasPointer.panY+(e.clientY-atlasPointer.y)*100/h,-bound,bound);
 applyAtlasZoom();
 return true;
}
function atlasPointerUp(e){
 const id=e.pointerId??0;
 if(!atlasPointers.has(id))return false;
 const wasPinching=!!atlasPinch;
 atlasPointers.delete(id);
 if(wasPinching){
  // The surviving finger starts a new drag, never an accidental realm swipe.
  atlasPinch=null;atlasPointer=null;
  if(atlasPointers.size===1){
   const [remainingId,point]=[...atlasPointers.entries()][0];
   atlasPointer={id:remainingId,x:point.x,y:point.y,panX:atlasPanX,panY:atlasPanY};
  }
  return false;
 }
 if(!atlasPointer||atlasPointer.id!==id)return false;
 const dx=e.clientX-atlasPointer.x,dy=e.clientY-atlasPointer.y;
 atlasPointer=null;
 if(!atlasZoomed&&Math.abs(dx)>=46&&Math.abs(dx)>Math.abs(dy)*1.35)
  return stepWorldAtlas(dx<0?1:-1);
 return false;
}
function atlasPointerCancel(e){
 const id=e.pointerId??0;
 atlasPointers.delete(id);
 atlasPinch=null;atlasPointer=null;
 if(atlasPointers.size===1){
  const [remainingId,point]=[...atlasPointers.entries()][0];
  atlasPointer={id:remainingId,x:point.x,y:point.y,panX:atlasPanX,panY:atlasPanY};
 }else atlasPointers.clear();
 return false;
}
/* Alpha 0.12.18 — on-demand capture of the actual, currently visible
   Atlas artwork layers. Never regenerates or advances any gameplay objects. */
const atlasExportLayers=['atlasBase','atlasMatte','atlasWeather','atlasBossStage','atlasForeground','atlasHeraldry'];
function atlasExportFilename(){
 const tier=String(atlasCurrentTier).padStart(2,'0');
 const variant=atlasCompareOriginal?'original':atlasBossStyle==='none'?'realm':
  atlasBossStyle+(atlasBossPhase===2?'-phase-ii':'-phase-i');
 return 'primal-knight-atlas-tier-'+tier+'-'+variant+(atlasWeatherOn&&!atlasCompareOriginal?'-weather':'')+'.png';
}
function paintAtlasExport(context){
 if(!atlasOpen)return false;
 // Never produce a silently incomplete export before Safari decodes the SVGs.
 for(const id of atlasExportLayers){
  const picture=$(id);
  if(!picture.hidden&&(!picture.complete||!(picture.naturalWidth>0)))return false;
 }
 for(const id of atlasExportLayers){
  const picture=$(id);
  if(!picture.hidden)context.drawImage(picture,0,0,960,id==='atlasMatte'?346:540);
 }
 return true;
}
async function shareAtlasArtwork(){
 if(!atlasOpen)return false;
 try{
  if(typeof document.createElement!=='function')throw Error('Canvas unavailable');
  const canvas=document.createElement('canvas');
  canvas.width=960;canvas.height=540;
  const context=canvas.getContext?.('2d');
  if(!context||!paintAtlasExport(context)){
   notice('ATLAS ART STILL LOADING · TRY AGAIN');return false;
  }
  // The PNG is encoded synchronously within the original iPhone tap.
  const data=canvas.toDataURL('image/png');
  if(!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data))throw Error('Invalid PNG');
  const name=atlasExportFilename();
  if(typeof navigator!=='undefined'&&typeof navigator.share==='function'&&
      typeof File==='function'&&typeof atob==='function'){
   const raw=atob(data.slice(data.indexOf(',')+1));
   const bytes=Uint8Array.from(raw,c=>c.charCodeAt(0));
   const file=new File([bytes],name,{type:'image/png'});
   const payload={files:[file],title:'Primal Knight · World Atlas Artwork'};
   if(!navigator.canShare||navigator.canShare(payload)){
    try{await navigator.share(payload);notice('ATLAS ARTWORK SHARED');return true;}
    catch(error){
     if(error?.name==='AbortError')return false;
     // A rejected native share falls back to a user-requested download.
    }
   }
  }
  const anchor=document.createElement('a');
  anchor.href=data;anchor.download=name;
  if(typeof anchor.click!=='function')throw Error('Download unavailable');
  anchor.click();notice('ATLAS PNG READY · CHECK FILES OR DOWNLOADS');
  return true;
 }catch(error){
  notice('ATLAS EXPORT UNAVAILABLE · USE AN IPHONE SCREENSHOT');
  return false;
 }
}
function renderWorldAtlas(tier=atlasCurrentTier){
 const t=territoryVista(tier).tier;
 if(t!==atlasCurrentTier){atlasCompareOriginal=false;resetAtlasZoom();}
 atlasCurrentTier=t;
 const matte=$('atlasMatte'),cloth=$('atlasHeraldry');
 if(matte.dataset.atlasTier!==String(t)){
  if(t>1){
   matte.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(terrainSceneSvg(t));
   cloth.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(fortressHeraldrySvg(t));
  }else{
   // Release the previous large URL when returning to original Tier I.
   matte.removeAttribute?.('src');cloth.removeAttribute?.('src');
  }
  matte.dataset.atlasTier=String(t);
  cloth.dataset.atlasTier=String(t);
 }
 updateAtlasComparison();
 const scene=territoryVista(t);
 $('atlasHeading').textContent='TIER '+roman(t)+' — '+tierNames[t-1].toUpperCase();
 $('atlasAtmosphere').textContent=scene.name+' · '+scene.weather.toUpperCase()+' · '+scene.light.toUpperCase()+' LIGHT';
 $('atlasLore').textContent=territoryLore[t-1];
 $('atlasCount').textContent=t+' / '+MAX_TIER;
 $('atlasLock').textContent=t<=p.unlockedTier?'AVAILABLE IN BATTLE':'LOCKED · ART PREVIEW';
 $('atlasPrev').disabled=t===1;
 $('atlasNext').disabled=t===MAX_TIER;
 applyAtlasZoom();
 return t;
}
function openWorldAtlas(tier=chosenTier){
 if(run.phase==='fighting'||run.phase==='intermission')return false;
 const modal=$('worldAtlas');
 modal.hidden=false;atlasOpen=true;
 atlasCompareOriginal=false;atlasBossStyle='none';atlasBossPhase=1;atlasWeatherOn=false;resetAtlasZoom();
 renderWorldAtlas(tier);
 $('atlasClose').focus?.();
 return true;
}
function closeWorldAtlas(){
 const modal=$('worldAtlas');
 if(modal.hidden)return false;
 modal.hidden=true;atlasOpen=false;
 atlasCompareOriginal=false;atlasBossStyle='none';atlasBossPhase=1;atlasWeatherOn=false;resetAtlasZoom();
 releaseWorldAtlasImages();
 $('openAtlasButton').focus?.();
 return true;
}
function stepWorldAtlas(amount){
 if($('worldAtlas').hidden||!Number.isInteger(amount))return false;
 if(atlasCurrentTier+amount<1||atlasCurrentTier+amount>MAX_TIER)return false;
 renderWorldAtlas(atlasCurrentTier+amount);
 return true;
}
function updateTerritoryPreview(tier=chosenTier){
 const image=$('tierVistaPreview'),card=$('tierVistaCard');
 if(!image||!card)return false;
 const profile=territoryVista(tier),newScene=territorySceneImage(profile.tier);
 const src=newScene?newScene.src:'assets/battlefield.png';
 // Never reassign a long SVG image URL while the player upgrades/scrolls.
 if(image.dataset.previewTier!==String(profile.tier)){
  image.src=src;
  image.dataset.previewTier=String(profile.tier);
 }
 image.alt='Illustrated battlefield for Tier '+roman(profile.tier)+' — '+tierNames[profile.tier-1];
 card.dataset.biome=terrainBiomes[profile.tier-1];
 $('tierVistaName').textContent=profile.name;
 $('tierVistaWeather').textContent=profile.weather.toUpperCase()+' · '+profile.light.toUpperCase()+' LIGHT';
 $('tierVistaLore').textContent=territoryLore[profile.tier-1];
 return true;
}
function visibleTerritoryTier(){
 return run.phase==='fighting'||run.phase==='intermission'?run.tier:chosenTier;
}

/* Alpha 0.12.16 — painterly boss-stage silhouettes. The three Warlord
   schools and the Siege Beast get different *environmental* setpieces:
   iron watchtowers, ember braziers, split rift obelisks and churned earth.
   Every miniature feature lives in the left/right scenery margins, behind
   enemies, warnings and the original fortress/embroidered banners.
   Static, reusable pixel-brush templates: no image decode or per-frame SVG,
   no particles, no arena hitboxes, no change to battle mechanics. */
const bossStageEdges=[18,46,82,112,846,878,918,944];
const bossStageTemplates={
 iron:[
  [7,31,68,11,0],[18,2,15,55,0],[45,13,18,46,0],[11,2,25,9,0],
  [43,9,23,8,0],[6,45,70,3,1],[23,13,3,29,2],[50,21,3,26,2],
  [10,28,26,4,1],[44,30,24,3,1],[15,52,52,2,1],[31,36,12,6,0]
 ],
 ember:[
  [10,58,65,8,0],[34,15,11,46,0],[21,22,39,8,0],[23,15,35,5,1],
  [25,31,33,7,1],[37,0,7,21,2],[33,9,7,16,2],[43,6,7,14,2],
  [26,42,5,7,1],[55,43,4,7,1],[29,53,38,3,1],[17,61,62,3,0]
 ],
 rift:[
  [14,61,67,7,0],[32,6,21,58,0],[24,24,13,33,0],[51,33,12,24,0],
  [39,0,7,12,2],[34,19,18,3,2],[35,33,16,3,2],[36,45,16,3,2],
  [15,53,19,4,1],[55,51,22,4,1],[23,62,45,2,2],[43,13,2,40,1]
 ],
 beast:[
  [3,59,80,6,0],[11,48,59,6,0],[7,37,17,6,0],[37,33,26,5,0],
  [18,20,8,21,1],[47,18,7,25,1],[68,29,7,20,1],[21,23,4,15,2],
  [51,22,3,16,2],[7,60,66,2,1],[29,52,12,5,1],[58,45,18,6,0]
 ]
};
function territoryBossStaging(context,tier=run.tier,state=run,still=reduceMotion){
 const normalized=territoryVista(tier).tier;
 if(state.phase!=='fighting'||!['commander','chapterBoss'].includes(state.encounter?.kind))
  return {active:false,tier:normalized,marks:0};
 const enemy=state.enemies?.find(e=>e&&!e.dead&&isSiegeBoss(e));
 if(!enemy)return {active:false,tier:normalized,marks:0};
 const style=enemy.type==='siegebeast'?'beast':
  enemy.bossStyle==='ember'?'ember':enemy.bossStyle==='rift'?'rift':'iron';
 const phase=enemy.bossPhase===2?2:1;
 const palette=terrainColors[terrainBiomes[normalized-1]];
 const time=Number.isFinite(state.time)?state.time:0;
 const baseAlpha=still?.17:.16+.025*Math.sin(time*.75+normalized*.3);
 const material=bossStageTemplates[style];
 const y0=style==='beast'?208:style==='ember'?171:158;
 context.save();
 context.globalAlpha=baseAlpha;
 context.fillStyle=palette.accent;
 for(let i=0;i<bossStageEdges.length;i++){
  const x=bossStageEdges[i];
  const h=(i%3===0?18:12)+(still?0:Math.round(3*Math.sin(time*.9+i)));
  context.fillRect(x,120+(i%3)*37,3,Math.max(6,h));
 }
 for(let side=0;side<2;side++){
  const baseX=side===0?18:854;
  for(const brush of material){
   const [dx,dy,w,h,ink]=brush;
   // A clear visual signal of a real phase II without blinking the canvas.
   context.globalAlpha=(ink===2?.39:ink===1?.28:.32)*(phase===2?1.12:1);
   context.fillStyle=ink===2?palette.accent:ink===1?palette.light:palette.dark;
   context.fillRect(baseX+dx,y0+dy,w,h);
  }
 }
 context.restore();
 return {active:true,tier:normalized,marks:bossStageEdges.length+material.length*2,style,phase};
}
let staticSkyVignette=null; // Fixed resolution: reuse a single CanvasGradient, never allocate one per frame.
function draw(){let w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.save();if(run.shakes>0&&!reduceMotion){ctx.translate(rnd(-2,2),rnd(-2,2));}if(background.complete&&background.naturalWidth){ctx.drawImage(background,0,0,w,h)}else{ctx.fillStyle='#223c45';ctx.fillRect(0,0,w,h)}const sceneTier=visibleTerritoryTier(),matte=territorySceneImage(sceneTier);if(matte&&matte.complete&&matte.naturalWidth)ctx.drawImage(matte,0,0,960,346);
 // Subtle animated fog and light make the illustrated environment breathe.
 if(!staticSkyVignette){staticSkyVignette=ctx.createLinearGradient(0,96,0,415);staticSkyVignette.addColorStop(0,'rgba(5,25,39,.08)');staticSkyVignette.addColorStop(1,'rgba(18,10,21,.13)');}
 ctx.fillStyle=staticSkyVignette;ctx.fillRect(0,90,960,350);
 drawTerritoryAtmosphere(ctx,run.time,sceneTier,reduceMotion);
 territoryBossStaging(ctx,sceneTier,run,reduceMotion);
 // Optional visual-only tactical lens: one static veil behind enemies.
 // Preserves painted depth, original boss staging and all attack markers.
 if(clarityLensEnabled){ctx.fillStyle='rgba(9,17,27,.34)';ctx.fillRect(0,96,960,340);}
 // Moving battle units: distinct image sprites, shadow, perspective, HP and state effects.
 for(const e of sortedRenderEnemies()){let s=clamp(.28+(e.y-105)/300*.83,.27,1.18)*(e.type==='siegebeast'?2.28:e.type==='warlord'?2.05:e.type==='ogre'?2.25:e.type==='guardian'||e.type==='banneret'?1.18:1);let im=sprites[e.type==='warlord'&&e.bossStyle?'warlord_'+e.bossStyle:e.type];if(!im||!im.complete)continue;let sw=im.naturalWidth*s,sh=im.naturalHeight*s,py=e.y-sh/2+Math.sin(e.wobble*1.3)*(e.type==='imp'?6:1);ctx.fillStyle='rgba(14,26,20,.43)';ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.43,Math.max(3,6*s),0,0,Math.PI*2);ctx.fill();ctx.save();ctx.shadowColor='rgba(10,18,26,.75)';ctx.shadowBlur=Math.max(3,6*s);if(e.buildup>0)ctx.filter='brightness(1.8)';if(e.golden)ctx.filter='sepia(1) saturate(2) hue-rotate(340deg) brightness(1.15)';ctx.imageSmoothingEnabled=false;ctx.drawImage(im,e.x-sw/2,py,sw,sh);ctx.restore();
 if(e===castFocus&&run.phase==='fighting'&&castFocusActive(e,castFocusKind)){
  // One static cast-specific target marker; no extra images or HUD panel.
  const color=castFocusColors[castFocusKind]||'#ffd899',by=Math.max(114,py-32);
  ctx.strokeStyle=color;ctx.lineWidth=Math.max(2,3*s);
  ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,Math.max(17,sw*.57),Math.max(6,9*s),0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#1c222e';ctx.fillRect(e.x-10,by-2,20,8);
  ctx.fillStyle=color;ctx.fillRect(e.x-9,by,18,4);
  ctx.fillRect(e.x-2,by-6,4,16);
 }
 if(e===frontlineFocus&&run.phase==='fighting'){
  // Static high-contrast ring and caret around only the lead wall threat.
  // Does not alter enemy collision, animations, shadows, rewards or speed.
  ctx.strokeStyle='#ff845f';ctx.lineWidth=Math.max(2,3*s);
  ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,Math.max(17,sw*.56),Math.max(6,9*s),0,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#ffd7a0';ctx.beginPath();ctx.moveTo(e.x,py-27);
  ctx.lineTo(e.x-8,py-16);ctx.lineTo(e.x+8,py-16);ctx.closePath();ctx.fill();
  ctx.fillStyle='#4d3029';ctx.fillRect(e.x-1,py-24,2,5);
 }
 if(e.discoveryWarden){
  const mark=lostSignalGuardians[e.discoveryAspect]||lostSignalGuardians[0];
  ctx.fillStyle=mark.color;ctx.fillRect(e.x-6,py-25,12,3);
  ctx.fillStyle='#f7ffff';ctx.fillRect(e.x-1,py-31,2,12);
 }
 if(e.nativeVanguard){
  ctx.fillStyle='#f1c878';ctx.fillRect(e.x-4,py-22,8,3);
  ctx.fillStyle='#fff0b1';ctx.fillRect(e.x-1,py-25,2,9);
 }
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
 if(e.slow>0){ctx.strokeStyle='#91f1f9';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.36,6*s,0,0,7);ctx.stroke();}if(e.burn>0){ctx.fillStyle='#ffa554';ctx.fillRect(e.x-6,e.y-sh*.45-4,5,8);}let barW=clarityLensEnabled?clamp(34*s,28,72):clamp(26*s,20,64),barH=clarityLensEnabled?6:4;
  ctx.fillStyle=clarityLensEnabled?'#071221':'#1e1b25';ctx.fillRect(e.x-barW/2,py-7,barW,barH);
  ctx.fillStyle=clarityLensEnabled?(isSiegeBoss(e)?'#ff9e82':e.type==='guardian'?'#b1edfa':e.type==='shaman'?'#e2bcff':'#d0f489'):(isSiegeBoss(e)?'#ed796e':e.type==='guardian'?'#9bd6dd':e.type==='shaman'?'#c1a4ef':'#a8d675');
  ctx.fillRect(e.x-barW/2,py-7,barW*clamp(e.hp/e.max,0,1),barH);}
 renderEnemyScratch.length=0; // Do not retain a finished siege's enemy objects.
 // Fortress battlements and hero are their own painted foreground layer.
 // Draw AFTER enemies: attackers remain behind the wall, never over it.
 if(foreground.complete&&foreground.naturalWidth){ctx.drawImage(foreground,0,0,w,h);}const heraldry=fortressHeraldryImage(sceneTier);if(heraldry&&heraldry.complete&&heraldry.naturalWidth)ctx.drawImage(heraldry,0,0,w,h);
 for(const s of run.shots){ctx.beginPath();ctx.lineWidth=s.kind==='lightning'?3:2;ctx.strokeStyle=s.kind==='lightning'?'#90f2ff':s.kind==='ballista'?'#ffd285':'#ffe8a9';ctx.moveTo(s.x,s.y);const history=s.trailHead*2;ctx.lineTo(s.trailCount?s.trail[history]:s.x-7,s.trailCount?s.trail[history+1]:s.y+6);ctx.stroke();ctx.fillStyle='#fff5b9';ctx.fillRect(s.x-2,s.y-2,4,4);}
 for(const t of run.particles){ctx.globalAlpha=clamp(t.life/t.max,0,1);ctx.fillStyle=t.color;ctx.fillRect(t.x,t.y,t.size,t.size)}ctx.globalAlpha=1;
 for(const f of run.floats){ctx.globalAlpha=clamp(f.life,0,1);ctx.fillStyle='#17101a';ctx.font='bold 15px Arial';ctx.fillText(f.text,f.x+1,f.y+2);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y)}ctx.globalAlpha=1;
 // Animated bow glow and string release marks the single hero as the shooter.
 if(run.flashes>0&&!reduceMotion){ctx.fillStyle=`rgba(255,226,142,${clamp(run.flashes*3,0,.68)})`;ctx.beginPath();ctx.arc(540,360,20+run.flashes*70,0,Math.PI*2);ctx.fill();}ctx.restore();}
/* Alpha 0.12.14 — truthful specialist cast timer and interruption progress.
   Uses only the same live enemy windup and damage fields as combat; never
   interpolates fake warning time, changes enemy mechanics, or saves state. */
const specialistAlertKinds={
 fuse:{name:'SAPPER FUSE',duration:1.3,rank:4},
 rift:{name:'RIFT BLINK',duration:.95,rank:3},
 frost:{name:'FROST RITE',duration:.95,rank:2},
 thorn:{name:'THORN WARD',duration:.85,rank:1}
};
function specialistTelegraph(e){
 const kind=specialistCast(e),def=specialistAlertKinds[kind];
 if(!kind||!def||!(e.hp>0)||!(e.max>0))return null;
 const remaining=kind==='fuse'?e.fuseTime:kind==='rift'?e.blinkWindup:
  kind==='frost'?e.frostWindup:e.thornWindup;
 if(!(remaining>0)||!Number.isFinite(remaining))return null;
 const threshold=e.max*(kind==='rift'?.22:.18);
 return {kind,label:def.name,rank:def.rank,remaining,
  duration:def.duration,castPct:clamp(100*(1-remaining/def.duration),0,100),
  breakPct:clamp(100*(Math.max(0,Number(e.spellBreakDamage)||0))/threshold,0,100),
  y:Number.isFinite(e.y)?e.y:0};
}
function currentSpecialistAlert(){
 if(run.phase!=='fighting')return null;
 let chosen=null,count=0;
 for(const e of run.enemies){
  if(!e||e.dead)continue;
  const cast=specialistTelegraph(e);
  if(!cast)continue;
  count++;
  // Protect the imminent fuse, then blinks and debilitating casters. For the
  // same threat choose the closest-to-completion attack; stable tie by depth.
  if(!chosen||cast.rank>chosen.rank||(cast.rank===chosen.rank&&(
   cast.remaining<chosen.remaining||cast.remaining===chosen.remaining&&cast.y>chosen.y)))chosen=cast;
 }
 return chosen?{...chosen,count}:null;
}
// Actual active windups temporarily replace the static encounter advice; no timer spam.
function activeEncounterThreat(){
 if(run.phase!=='fighting')return null;
 let highest=null;
 for(const e of run.enemies){
  if(!e||e.dead)continue;
  let priority=0,text='',kind='';
  if(e.type==='sapper'&&e.fuseTime>0){priority=120;kind='fuse';text='FUSE LIT · STOP THE SAPPER';}
  else if(e.type==='siegebeast'&&e.crushWindup>0){priority=110;kind='crush';text='CRUSHER WINDUP · FOCUS THE BOSS';}
  else if(e.type==='warlord'&&e.bossFuryWindup>0){priority=108;kind='ember';text='EMBER CHARGE · INTERRUPT THE BOSS';}
  else if(e.type==='warlord'&&e.bossBlinkWindup>0){priority=106;kind='void';text='VOID STEP · INTERRUPT THE BOSS';}
  else if(e.type==='riftstalker'&&e.blinkWindup>0){priority=95;kind='rift';text='RIFT OPENING · FOCUS THE STALKER';}
  else if(e.type==='frostbinder'&&e.frostWindup>0){priority=83;kind='frost';text='FROST RITE · INTERRUPT THE CASTER';}
  else if(e.type==='thornweaver'&&e.thornWindup>0){priority=80;kind='thorn';text='THORN WARD · STOP THE CAST';}
  else if(e.type==='warlord'&&e.bossWardTimer>0){priority=65;kind='iron';text='IRON WARD · BREAK ITS DEFENSE';}
  if(priority&&(!highest||priority>highest.priority||(priority===highest.priority&&e.y>highest.y)))highest={priority,text,y:e.y,enemy:e,kind};
 }
 return highest?{priority:highest.priority,text:highest.text,enemy:highest.enemy,kind:highest.kind}:null;
}
// Alpha 0.12.26: a real spell enemy gets one static, high-contrast field beacon.
// Never guess timers, allocate combat effects, persist data, or mark dead foes.
const castFocusColors={fuse:'#ffa06e',crush:'#ffbf7d',ember:'#ff996e',
 void:'#ccaaff',rift:'#c6afff',frost:'#94e5ff',thorn:'#bfea90',iron:'#a3d9fa'};
let castFocus=null,castFocusKind='';
function castFocusActive(enemy,kind){
 if(!enemy||enemy.dead||!(enemy.hp>0)||run.phase!=='fighting')return false;
 let remaining=0;
 if(kind==='fuse'&&enemy.type==='sapper')remaining=enemy.fuseTime;
 else if(kind==='crush'&&enemy.type==='siegebeast')remaining=enemy.crushWindup;
 else if(kind==='ember'&&enemy.type==='warlord')remaining=enemy.bossFuryWindup;
 else if(kind==='void'&&enemy.type==='warlord')remaining=enemy.bossBlinkWindup;
 else if(kind==='rift'&&enemy.type==='riftstalker')remaining=enemy.blinkWindup;
 else if(kind==='frost'&&enemy.type==='frostbinder')remaining=enemy.frostWindup;
 else if(kind==='thorn'&&enemy.type==='thornweaver')remaining=enemy.thornWindup;
 else if(kind==='iron'&&enemy.type==='warlord')remaining=enemy.bossWardTimer;
 return Number.isFinite(remaining)&&remaining>0;
}
// Alpha 0.12.25: show actual last-65-units wall danger; breach occurs at y>430.
// Stable first-in tie, no guessed seconds-to-impact and no additional entities.
let frontlineFocus=null;
function frontlineBreachRisk(enemies=run.enemies){
 if(run.phase!=='fighting')return null;
 let lead=null,count=0;
 for(const enemy of enemies){
  if(!enemy||enemy.dead||!(enemy.hp>0)||!Number.isFinite(enemy.y)||enemy.y<365)continue;
  count++;
  if(!lead||enemy.y>lead.y)lead=enemy;
 }
 if(!lead)return null;
 const x=Number.isFinite(lead.x)?lead.x:480;
 const lane=x<370?'LEFT':x>590?'RIGHT':'CENTER';
 const critical=lead.y>=395;
 const title=critical?'BREACH IMMINENT':'BREACH WATCH';
 return {enemy:lead,count,lane,critical,
  text:title+' · '+lane+' FLANK · '+count+' '+(count===1?'FOE':'FOES')+' NEAR WALL'};
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
 $('realmAtmosphere').textContent=territoryWeatherSignature(run.tier);
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
 const alertEl=$('specialistAlert');
 if(alertEl){
  const warning=currentSpecialistAlert();
  alertEl.hidden=!warning;
  if(warning){
   alertEl.dataset.kind=warning.kind;
   $('specialistAlertTitle').textContent=warning.label;
   $('specialistAlertTime').textContent=warning.remaining.toFixed(1)+'s LEFT'+(warning.count>1?' · '+warning.count+' CASTS':'');
   $('specialistAlertBreak').textContent='BREAK '+Math.floor(warning.breakPct)+'%';
   $('specialistAlertCastFill').style.width=warning.castPct.toFixed(1)+'%';
   $('specialistAlertBreakFill').style.width=warning.breakPct.toFixed(1)+'%';
  }
 }
 const encounterRibbon=$('encounterRibbon');
 frontlineFocus=null;castFocus=null;castFocusKind='';
 if(encounterRibbon){
  const active=run.phase==='fighting'||run.phase==='intermission';
  const encounter=active?(run.encounter&&run.encounter.wave===run.wave?run.encounter:encounterDirector(run.wave,run.tier)):null;
  encounterRibbon.hidden=!encounter;
  const tip=$('encounterHint');if(!encounter&&tip){tip.hidden=true;encounterRibbon.dataset.threat='false';encounterRibbon.dataset.breach='false';encounterRibbon.dataset.focus='false';}
  if(encounter){
   encounterRibbon.dataset.kind=encounter.kind;
   $('encounterType').textContent=run.echoCurrent?'ECHO RETURN':run.discoveryCurrent?'LOST SIGNAL':run.cartographerCurrent?'CARTOGRAPHER OATH':hasNativeVanguard(encounter)?'NATIVE VANGUARD':encounter.label;
   $('encounterFaction').textContent=encounter.faction;
   $('encounterChapter').textContent='CHAPTER '+roman(encounter.chapter);
   const tip=$('encounterHint'),threat=activeEncounterThreat(),breach=frontlineBreachRisk();
   frontlineFocus=!threat&&breach?breach.enemy:null;
   castFocus=threat?.enemy||null;castFocusKind=threat?.kind||'';
   encounterRibbon.dataset.focus=castFocus?'true':'false';
   encounterRibbon.dataset.threat=threat?'true':'false';
   encounterRibbon.dataset.breach=!threat&&breach?'true':'false';
   if(tip){const advice=threat?.text||(!threat&&breach?.text)||(run.echoCurrent?'SHIELD ANCHOR + DASH COURIER · 0 BREACHES · KEEP 50% WALL':run.discoveryCurrent?run.discoveryCurrent.guardian.name+' · HOLD THE WALL WITHOUT BREACHES':run.cartographerCurrent?'THREE CONSECUTIVE WAVES · ZERO BREACHES · UNIQUE BANNER + RUNE':hasNativeVanguard(encounter)?territoryVanguard(encounter.tier).name+' · '+nativeMarchOrder(encounter.tier).name+' · '+territoryVanguard(encounter.tier).counter:encounterAdvice(encounter.kind));tip.hidden=!advice;tip.textContent=advice;}
   const goal=$('encounterGoal');if(goal){const challenge=run.echoCurrent?{desc:'ECHO RETURN · '+((run.echoDefeatedMask&1)?'ANCHOR ✓':'ANCHOR')+
  ' + '+((run.echoDefeatedMask&2)?'COURIER ✓':'COURIER')+' · ZERO BREACHES · 50% WALL'}:
  run.discoveryCurrent?{desc:run.discoveryCurrent.guardian.name+' · '+(run.discoveryWardenKilled?'GUARDIAN DEFEATED':'DEFEAT GUARDIAN')+' · ZERO BREACHES'}:run.cartographerCurrent?{desc:'CARTOGRAPHER OATH · STAGE '+run.cartographerCurrent.step+' / 3 · ZERO BREACHES'}:chapterChallenge(encounter)||relicChallenge(encounter);goal.hidden=!challenge;goal.textContent=challenge?'✦ '+challenge.desc+(run.breaches?' · FAILED':' · UNBROKEN'):'';goal.dataset.failed=run.breaches?'true':'false';}
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
function isProtectedExplorerHeirloom(g){
 if(!g||typeof g.id!=='string')return false;
 const match=/^signal_(\d+)_(47|147|347|747)$/.exec(g.id);
 if(!match)return false;
 const signal=lostSignal(Number(match[1]),Number(match[2]));
 return !!signal&&signal.slot===g.slot&&!!p.explorationFinds[signal.key];
}
function isProtectedEchoSignet(g){
 if(!g||typeof g.id!=='string')return false;
 const match=/^echo_(\d+)_117$/.exec(g.id);
 if(!match)return false;
 const event=echoReturn(Number(match[1]));
 return !!event&&g.slot===event.item.slot&&!!p.echoReturns[event.key];
}
function isProtectedMilestoneKeepsake(g){
 if(!g||typeof g.id!=='string')return false;
 const match=/^keepsake_(\d+)_(1500|3000|6000)$/.exec(g.id);
 if(!match)return false;
 const item=milestoneKeepsake(Number(match[1]),Number(match[2]));
 return !!item&&item.slot===g.slot&&!!p.milestones[match[1]+':'+match[2]];
}
function canSellGear(g){
 return !!g&&!Object.values(p.equipped).includes(g.id)&&
  !isProtectedExplorerHeirloom(g)&&!isProtectedMilestoneKeepsake(g)&&!isProtectedEchoSignet(g);
}

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
    ['GEAR COST','-'+discountPct()+'%'],
    ['ATLAS SEALS',atlasSealCount()+' / '+MAX_TIER+' · +'+(atlasSealBonus()*100).toFixed(2)+'% DAMAGE/WALL']
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
      <div class="hall-doctrine-head"><div><small>⚔ HERO COMBAT DEPTH · ONE ACTIVE DISCIPLINE</small><h2>Battle Doctrines</h2><p>Choose one battle style and set when your champion automatically casts below. The original Rapid timing remains the default; all strategies use existing cooldowns and cost no additional currency.</p></div><strong>✦ ${chosenDoctrine().school.toUpperCase()} ACTIVE</strong></div>
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
 <div class="explorer-bond armory-explorer-bond">${explorerSetLabel()}</div>
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
   const inUse=Object.values(p.equipped).includes(g.id),active=ringSlots.includes(armoryDrawerSlot)?p.equipped[armoryDrawerSlot]===g.id:inUse,protectedHeirloom=isProtectedExplorerHeirloom(g)||isProtectedMilestoneKeepsake(g)||isProtectedEchoSignet(g),price=gearSellPrice(g),cost=gearCost(g);
   return `<article class="armory-inventory-item rarity-outline-${g.rarity}" data-item-id="${g.id}">
    <div class="armory-item-icon">${forgePixelIcon("gear_"+g.slot)}</div>
    <div class="armory-item-details"><small class="rarity-${g.rarity}">${rarities[g.rarity]} · ${gearSlotLabels[g.slot]}</small><strong>${gearTitle(g)}</strong><em>Enhancement +${g.plus} / 50 ${inUse?'· CURRENTLY EQUIPPED':''}</em></div>
    <div class="armory-item-buttons"><button type="button" data-action="equip:${g.id}" ${active?'disabled':''}>${active?'✓ EQUIPPED':'EQUIP'}</button><button type="button" data-action="enhance:${g.id}" ${g.plus>=50||p.gold<cost?'disabled':''}>${g.plus>=50?'MAXED':`UPGRADE · 🟡${fmt(cost)}`}</button><button type="button" class="armory-sell-item" data-gear-sell="${g.id}" ${protectedHeirloom?'disabled title="One-time unique reward cannot be sold"':inUse?'disabled title="Unequip before selling"':''}>${protectedHeirloom?'HEIRLOOM · SAFE':inUse?'EQUIPPED · SAFE':`SELL · 🟡${fmt(price)}`}</button></div>
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
  html+=renderSaveRecoveryPanel();
  html+=renderPortableBackupPanel();
  html+=renderSiegeHistory();
  html+=siegeGuardSettings();
  html+=`<div class="setting-row"><span>Download a JSON backup of permanent progression</span><button class="wide-btn" data-action="export">EXPORT SAVE</button></div><div class="setting-row"><span>Restore a saved backup from your device (up to Tier XXX)</span><input id="importFile" aria-label="Import save backup" type="file" accept="application/json,.json"></div>${hasImportRecovery()?'<div class="setting-row"><span>Made an import by mistake? Your previous save is safely available.</span><button class="wide-btn" data-action="undoImport">UNDO LAST IMPORT</button></div>':''}<div class="setting-row"><span>Current combat: ${run.phase} · Autosaved on upgrades and wave clears</span><button class="wide-btn" data-action="save">SAVE NOW</button></div>${renderVisualSettings()}<div class="setting-row"><span>Save or share a clean 960×540 PNG of the current battlefield art, including terrain, flags, creatures and projectiles. The HUD is not included; the image is never uploaded automatically.</span><button class="wide-btn" data-action="battleSnapshot">SHARE BATTLEFIELD PNG</button></div><div class="setting-row"><span>Compare the same live battlefield twice in one PNG: original artwork on the left, tactical LENS on the right. Your current visual setting is restored after capture.</span><button class="wide-btn" data-action="battleCompare">COMPARE LENS PNG</button></div><div class="setting-row"><span>Optional iPhone Device Check: track canvas paints, animation callbacks and frame gaps on this device. No upload or saved telemetry.</span><button class="wide-btn" data-action="deviceCheck">${deviceCheckEnabled?'STOP DEVICE CHECK':'START DEVICE CHECK'}</button></div><p class="lead">Alpha 0.14.5 · Transactional Save Recovery · Free to play · No purchases or subscriptions.</p>`;
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
   const inspected=inspectBackupImport(JSON.parse(await file.text()));
   if(!confirm(inspected.summary))return;
   restoreProgressBackup(inspected.data,true);
   initRun();run.speed=1;storedSpeed=1;syncBattleControls();
   showLobby();refreshHUD();renderPanel();notice('SAVE RESTORED · RECOVERY COPY STORED');
  }catch(error){notice(saveRecoveryStatus==='write-failed'?'IMPORT FAILED · STORAGE ROLLBACK UNVERIFIED · EXPORT BACKUP':'IMPORT FAILED · ORIGINAL SAVE RESTORED OR UNCHANGED');}
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
 else if(type==='restoreCheckpoint'){
  if(!confirm('Restore the verified checkpoint? It may be older than your current progress. A recovery copy will be saved first.'))return;
  try{
   if(!restoreVerifiedCheckpoint()){notice('NO VALID RECOVERY CHECKPOINT');return;}
   initRun();run.speed=1;storedSpeed=1;syncBattleControls();
   showLobby();refreshHUD();renderPanel();
   notice('VERIFIED CHECKPOINT RESTORED');
  }catch(error){notice(saveRecoveryStatus==='write-failed'?'CHECKPOINT RESTORE FAILED · STORAGE UNVERIFIED':'CHECKPOINT RESTORE FAILED · ORIGINAL PRESERVED');}
  return;
 }
 else if(type==='exportDamaged'){
  const damaged=damagedOriginalRaw();if(damaged===null)return;
  const blob=new Blob([damaged],{type:'text/plain'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download='primal-knight-damaged-save.txt';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1500);return;
 }
 else if(type==='undoImport'){
  if(!confirm('Restore the progress saved just before the last import? Your current progress will be replaced.'))return;
  try{
   if(!undoProgressImport()){notice('NO IMPORT RECOVERY COPY');return;}
   initRun();run.speed=1;storedSpeed=1;syncBattleControls();
   showLobby();notice('PREVIOUS SAVE RESTORED');
  }catch(error){notice(saveRecoveryStatus==='write-failed'?'UNDO FAILED · STORAGE UNVERIFIED':'RECOVERY FAILED · ORIGINAL SAVE PRESERVED');}
 }
 else if(type==='guardWaves'||type==='guardMinutes'||type==='guardWall'){
  const ok=setSiegeGuardOption(type,id);
  notice(ok?'SIEGE GUARD · REST CONTROL UPDATED':'SIEGE GUARD · OPTION UNAVAILABLE');
  renderPanel();return;
 }
 else if(type==='visualMode'){
  if(setVisualQuality(id))notice('VISUAL PERFORMANCE · '+visualQualityProfiles[visualQuality].name);
  else notice('VISUAL PROFILE UNAVAILABLE');
  renderPanel();return;
 }
 else if(type==='battleSnapshot'){shareBattlefieldFrame();return;}
 else if(type==='battleCompare'){shareBattlefieldComparison();return;}
 else if(type==='deviceCheck'){toggleDeviceCheck();renderPanel();return;}
 else if(type==='save'){notice(save()?'PROGRESS SAVED':'SAVE FAILED · EXPORT A BACKUP')}
 else if(type==='exportVerified'){
  try{
   const contents=JSON.stringify(createVerifiedBackup(),null,2);
   const blob=new Blob([contents],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');
   a.href=url;a.download='primal-knight-verified-backup.json';a.click();
   setTimeout(()=>URL.revokeObjectURL(url),1500);
   notice('VERIFIED BACKUP PREPARED');
  }catch(error){notice('VERIFIED EXPORT FAILED · ORIGINAL UNCHANGED');}
  return;
 }
 else if(type==='export'){let blob=new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='primal-knight-onslaught-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);return;}
 const scrollPane=$('panelContent'),keepScroll=scrollPane.scrollTop;
 save();refreshHUD();renderPanel();
 if(['train','trainBatch','legacy','ascension','oath','research','tactic'].includes(type))scrollPane.scrollTop=keepScroll;
}
// A ProMotion iPhone may request 120+ RAF callbacks/sec. Keep combat physics responsive
// but avoid re-painting the large layered pixel-art canvas more than 60 times/sec.
// Low-motion devices use 30Hz rendering without altering wave timers or earned rewards.
const reduceMotion=typeof window.matchMedia==='function'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
/* Alpha 0.12.12: local-only visual profiles. These affect presentation only;
   no wave ticks, enemy spawns, boss telegraphs, rewards or permanent saves.
   Default Vivid preserves the prior 60Hz / full-weather visual experience. */
const visualQualityKey='primal_knight_onslaught_visual_quality_v1';
// Alpha 0.12.27: only visual contrast, separate from the earned character save.
const clarityLensKey='primal_knight_onslaught_clarity_lens_v1';
let clarityLensEnabled=false;
try{clarityLensEnabled=localStorage.getItem(clarityLensKey)==='on';}
catch(error){/* Private Safari may block localStorage reads. */}
function syncClarityLens(){
 const button=$('clarityLensToggle');
 if(!button)return;
 button.textContent=clarityLensEnabled?'LENS ON':'LENS';
 button.setAttribute?.('aria-pressed',String(clarityLensEnabled));
 button.title=clarityLensEnabled?'Disable high-contrast battlefield lens':'Enable high-contrast battlefield lens';
}
function setClarityLens(enabled){
 clarityLensEnabled=!!enabled;
 try{localStorage.setItem(clarityLensKey,clarityLensEnabled?'on':'off');}catch(error){}
 syncClarityLens();
 return clarityLensEnabled;
}
function toggleClarityLens(){return setClarityLens(!clarityLensEnabled);}

const visualQualityProfiles={
 vivid:{name:'VIVID',hz:60,weather:1,description:'Original illustrated detail and up to 60 canvas paints per second.'},
 balanced:{name:'BALANCED',hz:30,weather:.65,description:'Up to 30 canvas paints per second, with lighter ambient weather.'},
 saver:{name:'BATTERY SAVER',hz:20,weather:.35,description:'Up to 20 canvas paints per second and sparse ambient weather.'}
};
let visualQuality='vivid';
try{const savedVisual=localStorage.getItem(visualQualityKey);
 if(Object.prototype.hasOwnProperty.call(visualQualityProfiles,savedVisual))visualQuality=savedVisual;
}catch(error){/* Storage may be unavailable in private Safari; keep a safe default. */}
function effectiveVisualHz(){
 return Math.min(visualQualityProfiles[visualQuality].hz,reduceMotion?30:60);
}
function territoryWeatherCount(weather){
 const base=weather==='mist'?4:weather==='rain'?18:weather==='snow'?15:14;
 return Math.max(1,Math.ceil(base*visualQualityProfiles[visualQuality].weather));
}
function setVisualQuality(value){
 if(!Object.prototype.hasOwnProperty.call(visualQualityProfiles,value))return false;
 if(visualQuality===value)return true;
 visualQuality=value;
 // Separate device preference; never modifies the exported character save.
 try{localStorage.setItem(visualQualityKey,value);}catch(error){}
 if(deviceCheckEnabled)updateDeviceCheckPanel();
 return true;
}
/* Alpha 0.14.2 — player-opted long-siege pauses. Device-only preferences;
   neither character saves nor export/import gain a field, and no automation
   can spend, clear waves, or automatically resume a paused battle. */
const siegeGuardKey='primal_knight_onslaught_siege_guard_v1';
const siegeGuardIntervals=[0,25,100,500],siegeGuardMinutes=[0,15,30,60];
const siegeGuard={waves:0,minutes:0,wall:false};
try{
 const saved=JSON.parse(localStorage.getItem(siegeGuardKey)||'null');
 if(saved&&typeof saved==='object'&&!Array.isArray(saved)){
  if(siegeGuardIntervals.includes(saved.waves))siegeGuard.waves=saved.waves;
  if(siegeGuardMinutes.includes(saved.minutes))siegeGuard.minutes=saved.minutes;
  if(typeof saved.wall==='boolean')siegeGuard.wall=saved.wall;
 }
}catch(error){/* Invalid or unavailable device storage uses safe OFF defaults. */}
function siegeGuardSettings(){
 const group=(label,field,values,textFn)=>
  '<div class="siege-guard-choice"><small>'+label+'</small><div class="siege-guard-buttons">'+
  values.map(v=>'<button type="button" data-action="guard'+field+':'+v+
   '" aria-pressed="'+(siegeGuard[field.toLowerCase()]===v)+'" class="'+
   (siegeGuard[field.toLowerCase()]===v?'selected':'')+'">'+textFn(v)+'</button>').join('')+'</div></div>';
 return '<section class="siege-guard-panel" role="group" aria-label="Optional long siege rest controls">'+
  '<strong>✦ SIEGE GUARD · OPTIONAL REST CONTROLS</strong>'+
  '<p>Pauses real combat, never ends a sortie or claims a reward. All options start OFF; resume manually with ▶. Battle speed stays 1× or 2×.</p>'+
  group('REST AFTER EACH COMPLETED WAVE INTERVAL','Waves',siegeGuardIntervals,v=>v?('EVERY '+v):'OFF')+
  group('REST AFTER REAL ACTIVE PLAY (PAUSE/HIDDEN TIME EXCLUDED)','Minutes',siegeGuardMinutes,v=>v?(v+' MIN'):'OFF')+
  '<div class="siege-guard-choice"><small>CRITICAL FORTRESS WARNING</small><div class="siege-guard-buttons">'+
  [false,true].map(v=>'<button type="button" data-action="guardWall:'+(v?'on':'off')+
   '" aria-pressed="'+(siegeGuard.wall===v)+'" class="'+(siegeGuard.wall===v?'selected':'')+'">'+(v?'PAUSE AT 20% HP':'OFF')+'</button>').join('')+'</div></div>'+
  '<small class="siege-guard-foot">Rest occurs after a legitimate wave clear, at elapsed active time, or upon a living fortress dropping to 20% HP. No offline combat or auto-resume. Preferences are device-local, not part of the character backup.</small></section>';
}
function setSiegeGuardOption(kind,value){
 if(kind==='guardWaves'){
  const v=Number(value);
  if(!siegeGuardIntervals.includes(v))return false;
  siegeGuard.waves=v;
 }else if(kind==='guardMinutes'){
  const v=Number(value);
  if(!siegeGuardMinutes.includes(v))return false;
  siegeGuard.minutes=v;run.guardActiveSeconds=0;
 }else if(kind==='guardWall'){
  if(value!=='on'&&value!=='off')return false;
  siegeGuard.wall=value==='on';
  run.guardWallLatched=false;
 }else return false;
 try{localStorage.setItem(siegeGuardKey,JSON.stringify(siegeGuard));}
 catch(error){/* Session controls still work without browser storage. */}
 syncBattleControls();
 return true;
}
function siegeGuardWaveRest(cleared){
 return siegeGuard.waves>0&&Number.isInteger(cleared)&&cleared>=run.startWave&&
  cleared%siegeGuard.waves===0&&cleared<MAX_WAVE;
}
function pauseForSiegeGuard(reason){
 if(!siegeActive()||run.speed===0)return false;
 storedSpeed=run.speed;run.speed=0;run.guardReason=reason;
 syncBattleControls();notice('SIEGE GUARD · '+reason);
 return true;
}

function renderVisualSettings(){
 return '<section class="visual-settings" role="group" aria-label="iPhone visual performance profile">'+
  '<div class="visual-settings-heading"><strong>✦ BATTLEFIELD PERFORMANCE</strong><small>VISUALS ONLY · NO GAME SPEED CHANGES</small></div>'+
  '<p>Choose the canvas presentation rate for long sieges. All enemies, projectiles, boss warnings, rewards and saved progression work identically. System Reduce Motion still caps visual refresh at 30Hz.</p>'+
  '<div class="visual-profile-options">'+Object.entries(visualQualityProfiles).map(([id,profile])=>
   '<button type="button" data-action="visualMode:'+id+'" aria-pressed="'+(visualQuality===id)+
   '" class="visual-profile '+(visualQuality===id?'selected':'')+'"><strong>'+profile.name+
   '</strong><span>'+Math.min(profile.hz,reduceMotion?30:60)+' PAINTS/s CAP</span><small>'+profile.description+'</small></button>').join('')+
  '</div><small class="visual-settings-note">This choice stays only on this device (when browser storage is available). It is not a paid upgrade, does not alter battle speed, and is not sent online.</small></section>';
}
function drawInterval(){
 // Battery-aware, *visual-only* pacing. Battle simulation still uses real RAF dt.
 // Atlas is fully opaque, and non-fighting scenes/paused sieges are static.
 if(document.hidden||atlasOpen)return Infinity;
 if($('app').dataset.view==='menu')return 100;
 const active=(run.phase==='fighting'||run.phase==='intermission')&&run.speed>0;
 if(!active)return 1000/12;
 return 1000/effectiveVisualHz();
}

/* Alpha 0.12.24 — optional device-side 30-minute endurance observation.
   Measures actual RAF callbacks and canvas draw() calls, NOT GPU FPS or battery.
   A bounded rolling record of five-minute checkpoints survives pauses within the
   opt-in FPS session only. No save writes, uploads, or persistent telemetry. */
let deviceCheckEnabled=false,deviceCheckState=null;
const enduranceCheckpointMs=5*60*1000,enduranceTargetMs=30*60*1000;
function resetDeviceCheck(){
 deviceCheckState={windowStart:null,lastFrame:null,lastMode:null,frames:0,draws:0,slow:0,worst:0,
  totalFrames:0,totalDraws:0,totalSlow:0,totalWorst:0,activeMs:0,sample:null,
  activeFrames:0,activeDraws:0,activeSlow:0,activeWorst:0,
  windowFrames:0,windowDraws:0,windowSlow:0,windowWorst:0,windowStartActiveMs:0,
  checkpointCount:0,checkpoints:[]};
}
function deviceEnduranceProgress(){
 const d=deviceCheckState;
 if(!d)return {elapsedSeconds:0,minutesCompleted:0,complete:false};
 return {elapsedSeconds:Math.floor(d.activeMs/1000),minutesCompleted:d.checkpointCount*5,
  complete:d.activeMs>=enduranceTargetMs};
}
function deviceEnduranceStatus(){
 const d=deviceCheckState,progress=deviceEnduranceProgress();
 const duration=progress.elapsedSeconds,mins=Math.floor(duration/60),secs=String(duration%60).padStart(2,'0');
 return (progress.complete?'30-MIN REVIEW READY':'ENDURANCE '+mins+':'+secs+' / 30:00')+
  ' · '+Math.min(6,d.checkpointCount)+'/6 CHECKPOINTS';
}
function recordDeviceEnduranceCheckpoint(){
 const d=deviceCheckState;
 if(d.activeMs<(d.checkpointCount+1)*enduranceCheckpointMs)return false;
 const seconds=Math.max(.001,(d.activeMs-d.windowStartActiveMs)/1000);
 const entry={minute:(d.checkpointCount+1)*5,tier:run.tier,wave:run.wave,
  profile:visualQualityProfiles[visualQuality].name,
  rafRate:(d.activeFrames-d.windowFrames)/seconds,
  paintRate:(d.activeDraws-d.windowDraws)/seconds,
  slow:d.activeSlow-d.windowSlow,worst:d.windowWorst};
 d.checkpoints.push(entry);
 if(d.checkpoints.length>12)d.checkpoints.shift();
 d.checkpointCount++;
 d.windowStartActiveMs=d.activeMs;
 d.windowFrames=d.activeFrames;d.windowDraws=d.activeDraws;d.windowSlow=d.activeSlow;d.windowWorst=0;
 return true;
}
function restartDeviceEndurance(){
 if(!deviceCheckEnabled)return false;
 resetDeviceCheck();
 updateDeviceCheckPanel();
 notice('DEVICE CHECK · NEW 30-MIN SESSION');
 return true;
}
function deviceCheckMode(){
 if(document.hidden)return 'HIDDEN';
 if(atlasOpen)return 'ATLAS';
 if($('app').dataset.view==='menu')return 'MENU';
 if(run.speed===0&&(run.phase==='fighting'||run.phase==='intermission'))return 'PAUSED';
 if(run.phase==='fighting'||run.phase==='intermission')return 'FIGHTING';
 return 'LOBBY';
}
function deviceCheckReport(){
 const d=deviceCheckState,s=d?.sample,progress=deviceEnduranceProgress();
 const checkpoints=d.checkpoints.length?
  d.checkpoints.map(c=>'At '+c.minute+'m · Tier '+roman(c.tier)+' Wave '+formatWave(c.wave)+
   ' · '+c.profile+' · RAF '+c.rafRate.toFixed(1)+'/s'+
   ' · paints '+c.paintRate.toFixed(1)+'/s'+
   ' · active gaps ≥34ms '+c.slow+' · longest '+c.worst.toFixed(0)+'ms'):
  ['No completed five-minute active-play checkpoints yet.'];
 return ['PRIMAL KNIGHT · ALPHA 0.12.24 · IPHONE ENDURANCE REVIEW',
  'Mode: '+deviceCheckMode()+' · Tier '+roman(run.tier)+' · Wave '+formatWave(run.wave),
  'Visual profile: '+visualQualityProfiles[visualQuality].name+' · active paint target '+effectiveVisualHz()+'Hz',
  'Requested canvas paints/s: '+(s?s.drawRate.toFixed(1):'WARMING UP'),
  'Animation callbacks/s: '+(s?s.frameRate.toFixed(1):'WARMING UP'),
  'Gaps ≥34ms per 2s sample (all visible modes): '+(s?s.slow:0)+' · Worst: '+(s?s.worst.toFixed(0):'—')+'ms',
  'Total paint calls: '+d.totalDraws+' · Total RAF callback gaps ≥34ms: '+d.totalSlow,
  'Active siege time: '+progress.elapsedSeconds+'s · '+(progress.complete?'30-MIN TARGET REACHED':'30-MIN TARGET NOT YET REACHED'),
  'Active-only callback gaps ≥34ms: '+d.activeSlow+' · Worst active callback gap: '+d.activeWorst.toFixed(0)+'ms',
  'Completed five-minute checkpoints: '+d.checkpointCount,
  ...checkpoints,
  'Manual iPhone observations (fill in after testing):',
  'Battery start/end: ____% / ____% · Device warmth: ____ · Visual problems: ____',
  'Canvas paint calls are not GPU FPS, battery draw or temperature; RAF callbacks are not rendered frame rate.',
  'Time excludes paused/hidden intervals and callback gaps ≥250ms; no data saved or uploaded.'
 ].join('\n');
}
function updateDeviceCheckPanel(){
 if(!deviceCheckEnabled)return;
 const d=deviceCheckState,s=d.sample;
 const line=$('deviceCheckReadout');
 if(line)line.textContent=(s?'PAINT '+s.drawRate.toFixed(0)+'/s · RAF '+s.frameRate.toFixed(0)+'/s · SLOW '+s.slow+' · MAX '+s.worst.toFixed(0)+'ms':'SAMPLING · COLLECTING 2 SECONDS')+
  ' · ACTIVE '+Math.floor(d.activeMs/1000)+'s';
 const mode=$('deviceCheckMode');if(mode)mode.textContent=deviceCheckMode()+' · '+visualQualityProfiles[visualQuality].name+' '+effectiveVisualHz()+'Hz · TIER '+roman(run.tier)+' · WAVE '+formatWave(run.wave);
 const endurance=$('deviceCheckEndurance');if(endurance)endurance.textContent=deviceEnduranceStatus();
}
function toggleDeviceCheck(){
 deviceCheckEnabled=!deviceCheckEnabled;resetDeviceCheck();
 $('deviceCheckPanel').hidden=!deviceCheckEnabled;
 const button=$('deviceCheckToggle');
 button.textContent=deviceCheckEnabled?'FPS ON':'FPS';
 button.setAttribute?.('aria-pressed',String(deviceCheckEnabled));
 if(deviceCheckEnabled)updateDeviceCheckPanel();
 return deviceCheckEnabled;
}
function sampleDeviceCheck(tm,painted){
 if(!deviceCheckEnabled||!Number.isFinite(tm))return false;
 const d=deviceCheckState,mode=deviceCheckMode();
 if(d.windowStart===null)d.windowStart=tm;
 const gap=d.lastFrame===null?0:Math.max(0,tm-d.lastFrame);
 const activeGap=mode==='FIGHTING'&&d.lastMode==='FIGHTING'&&gap>0&&gap<250;
 d.lastFrame=tm;d.lastMode=mode;
 if(mode==='FIGHTING'){
  d.activeFrames++;
  if(painted)d.activeDraws++;
 }
 if(activeGap){
  d.activeMs+=gap;
  d.activeWorst=Math.max(d.activeWorst,gap);
  d.windowWorst=Math.max(d.windowWorst,gap);
  if(gap>=34)d.activeSlow++;
  recordDeviceEnduranceCheckpoint();
 }
 if(gap>0&&gap<250){
  d.worst=Math.max(d.worst,gap);d.totalWorst=Math.max(d.totalWorst,gap);
  if(gap>=34){d.slow++;d.totalSlow++;}
 }
 d.frames++;d.totalFrames++;
 if(painted){d.draws++;d.totalDraws++;}
 const elapsed=tm-d.windowStart;
 if(elapsed<2000)return false;
 const sec=Math.max(.001,elapsed/1000);
 d.sample={frameRate:d.frames/sec,drawRate:d.draws/sec,slow:d.slow,worst:d.worst,mode};
 d.frames=0;d.draws=0;d.slow=0;d.worst=0;d.windowStart=tm;
 updateDeviceCheckPanel();
 return true;
}
/* Alpha 0.12.15 — player-triggered, local 960×540 artwork snapshot.
   Draw the actual layered battle canvas once, never simulate a frame or touch
   progression, then offer a user-controlled iOS share sheet. The synchronous
   PNG encoding keeps the Web Share call in the original tap's activation.
   A local download is the fallback; nothing is transmitted by the game. */
/* Alpha 0.12.28 — same-state original and optional contrast comparison export. */
function battlefieldComparisonName(){return battlefieldSnapshotName().replace('.png','-lens-comparison.png');}
function buildBattlefieldComparison(){
 if(typeof document.createElement!=='function')throw Error('Canvas unavailable');
 const comparison=document.createElement('canvas');
 comparison.width=1920;comparison.height=624;
 const out=comparison.getContext?.('2d');
 if(!out||typeof out.drawImage!=='function')throw Error('Comparison canvas unavailable');
 const priorLens=clarityLensEnabled,priorShake=run.shakes;
 try{
  // Prevent camera-shake jitter from shifting the two otherwise identical frames.
  run.shakes=0;
  clarityLensEnabled=false;draw();out.drawImage(c,0,64,960,540);
  clarityLensEnabled=true;draw();out.drawImage(c,960,64,960,540);
 }finally{
  clarityLensEnabled=priorLens;run.shakes=priorShake;draw();
 }
 out.fillStyle='#142431';out.fillRect(0,0,1920,64);out.fillRect(0,604,1920,20);
 out.fillStyle='#f8dba7';out.font='bold 26px Arial';
 out.fillText('ORIGINAL · LENS OFF',28,42);
 out.fillText('TACTICAL CONTRAST · LENS ON',988,42);
 out.fillStyle='#b9d9cb';out.font='bold 16px Arial';
 out.fillText('TIER '+roman(run.tier)+' · WAVE '+formatWave(run.wave),1690,42);
 out.font='bold 14px Arial';
 out.fillText('ONE BATTLE STATE · TWO VISUAL PRESENTATIONS · NO HUD PANELS',24,619);
 return comparison;
}
async function shareBattlefieldComparison(){
 try{
  const image=buildBattlefieldComparison();
  if(typeof image.toDataURL!=='function')throw Error('PNG export unavailable');
  const data=image.toDataURL('image/png');
  if(!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data))throw Error('Invalid PNG');
  const name=battlefieldComparisonName();
  if(typeof navigator!=='undefined'&&typeof navigator.share==='function'&&
     typeof File==='function'&&typeof atob==='function'){
   const raw=atob(data.slice(data.indexOf(',')+1));
   const bytes=Uint8Array.from(raw,ch=>ch.charCodeAt(0));
   const payload={files:[new File([bytes],name,{type:'image/png'})],
    title:'Primal Knight · Original vs Tactical Lens'};
   if(!navigator.canShare||navigator.canShare(payload)){
    try{await navigator.share(payload);notice('LENS COMPARISON SHARED');return true;}
    catch(error){if(error?.name==='AbortError')return false;}
   }
  }
  const link=document.createElement('a');
  link.href=data;link.download=name;
  if(typeof link.click!=='function')throw Error('PNG download unavailable');
  link.click();notice('LENS COMPARISON PNG READY · CHECK FILES OR DOWNLOADS');
  return true;
 }catch(error){
  notice('COMPARISON UNAVAILABLE · USE TWO IPHONE SCREENSHOTS');
  return false;
 }
}
function battlefieldSnapshotName(){
 const tier=String(territoryVista(run.tier).tier).padStart(2,'0');
 const wave=String(Math.max(1,Math.floor(Number(run.wave)||1))).padStart(5,'0');
 return 'primal-knight-tier-'+tier+'-wave-'+wave+'.png';
}
async function shareBattlefieldFrame(){
 try{
  if(typeof c.toDataURL!=='function')throw Error('Canvas export unavailable');
  // The full-screen panel and DOM controls are never drawn on the canvas.
  // Render current painted layers for snapshots taken from Settings or paused.
  draw();
  const data=c.toDataURL('image/png');
  if(!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(data))
   throw Error('Invalid PNG canvas export');
  const name=battlefieldSnapshotName();
  if(typeof navigator!=='undefined'&&typeof navigator.share==='function'&&
      typeof File==='function'&&typeof atob==='function'){
   const raw=atob(data.slice(data.indexOf(',')+1));
   const bytes=Uint8Array.from(raw,ch=>ch.charCodeAt(0));
   const file=new File([bytes],name,{type:'image/png'});
   const payload={files:[file],title:'Primal Knight · Battlefield Artwork'};
   if(!navigator.canShare||navigator.canShare(payload)){
    try{await navigator.share(payload);notice('BATTLEFIELD FRAME SHARED');return true;}
    catch(error){
     if(error&&error.name==='AbortError')return false; // Dismissed iOS sheet.
     // In unsupported Home Screen modes fall through to local PNG download.
    }
   }
  }
  if(typeof document.createElement!=='function')throw Error('PNG download unavailable');
  const link=document.createElement('a');
  link.href=data;link.download=name;
  if(typeof link.click!=='function')throw Error('PNG download unsupported');
  link.click();notice('BATTLEFIELD PNG READY · CHECK FILES OR DOWNLOADS');
  return true;
 }catch(error){
  notice('FRAME EXPORT UNAVAILABLE · USE AN IPHONE SCREENSHOT');
  return false;
 }
}
async function copyDeviceCheck(){
 const report=deviceCheckReport();
 if(typeof navigator!=='undefined'&&navigator.clipboard?.writeText){
  try{await navigator.clipboard.writeText(report);notice('DEVICE REPORT COPIED');return true;}catch(error){}
 }
 notice('COPY NOT AVAILABLE · SCREENSHOT THE REPORT');
 return false;
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
 const unsafe=saveWriteBlocked&&saveRecoveryStatus==='write-failed';
 button.disabled=!!(unsafe&&paused);
 if(status){
  status.hidden=!paused;
  if(unsafe&&paused)status.innerHTML='<strong>⚠ SAVE STORAGE LOCKED · SIEGE STOPPED</strong><small>Open Settings to export this session\'s character before reloading. Do not continue this siege.</small>';
 }
 const guard=$('siegeGuardStatus');
 if(guard){
  const enabled=siegeGuard.waves||siegeGuard.minutes||siegeGuard.wall;
  guard.hidden=!siegeActive()||unsafe||!(enabled||run.guardReason);
  guard.textContent=paused&&run.guardReason?'✦ SIEGE GUARD REST · '+run.guardReason+' · TAP ▶ TO RESUME':
   '✦ SIEGE GUARD ACTIVE · '+(siegeGuard.waves?'REST EVERY '+siegeGuard.waves+' WAVES':'NO WAVE REST')+
   ' · '+(siegeGuard.minutes?siegeGuard.minutes+' MIN ACTIVE REST':'NO TIME REST')+
   (siegeGuard.wall?' · 20% HP ALERT':'');
 }
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
 if(saveWriteBlocked&&saveRecoveryStatus==='write-failed'){
  notice('SIEGE LOCKED · EXPORT CURRENT PROGRESS IN SETTINGS');
  syncBattleControls();return true;
 }
 if(run.speed){storedSpeed=run.speed;run.speed=0;notice('BATTLE PAUSED');}
 else{run.speed=storedSpeed===2?2:1;run.guardReason='';notice('BATTLE RESUMED · '+run.speed+'×');}
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
 let painted=false;
 if(Number.isFinite(interval)&&(loop.lastDraw===undefined||tm-loop.lastDraw>=interval-.5)){
  draw();loop.lastDraw=tm;painted=true;
 }
 if(deviceCheckEnabled)sampleDeviceCheck(tm,painted);
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
$('openAtlasButton').addEventListener('click',()=>openWorldAtlas(chosenTier));
$('atlasClose').addEventListener('click',closeWorldAtlas);
$('atlasCompare').addEventListener('click',toggleAtlasComparison);
$('atlasZoom').addEventListener('click',toggleAtlasZoom);
 for(const style of atlasBossStyles){
  $('atlasBoss'+style[0].toUpperCase()+style.slice(1)).addEventListener('click',()=>chooseAtlasBossStyle(style));
 }
 $('atlasBossPhase').addEventListener('click',toggleAtlasBossPhase);
$('atlasWeatherToggle').addEventListener('click',toggleAtlasWeather);
$('atlasExport').addEventListener('click',shareAtlasArtwork);
$('atlasScene').addEventListener('pointerdown',atlasPointerDown);
$('atlasScene').addEventListener('pointermove',atlasPointerMove);
$('atlasScene').addEventListener('pointerup',atlasPointerUp);
$('atlasScene').addEventListener('pointercancel',atlasPointerCancel);
$('atlasPrev').addEventListener('click',()=>stepWorldAtlas(-1));
$('atlasNext').addEventListener('click',()=>stepWorldAtlas(1));
document.addEventListener('keydown',event=>{
 if($('worldAtlas').hidden)return;
 if(event.key==='Escape'){closeWorldAtlas();event.preventDefault?.();}
 else if(event.key==='ArrowLeft'){stepWorldAtlas(-1);event.preventDefault?.();}
 else if(event.key==='ArrowRight'){stepWorldAtlas(1);event.preventDefault?.();}
 else if(event.key==='Tab'){
  // Aria-modal must not allow keyboard focus to leak behind the closed-off battle.
  const options=[...$('worldAtlas').querySelectorAll('button:not([disabled])')];
  if(!options.length)return;
  const index=options.indexOf(document.activeElement);
  if(index<0){options[0].focus();event.preventDefault?.();}
  else if(event.shiftKey&&index===0){options[options.length-1].focus();event.preventDefault?.();}
  else if(!event.shiftKey&&index===options.length-1){options[0].focus();event.preventDefault?.();}
 }
});
$('siegeGuardLobby').addEventListener('click',e=>{
 const button=e.target.closest('[data-action]');if(!button||button.disabled)return;
 const [kind,value]=button.dataset.action.split(':');
 if(!setSiegeGuardOption(kind,value))return;
 $('siegeGuardLobby').innerHTML=siegeGuardSettings();
 notice('SIEGE GUARD · REST CONTROL UPDATED');
});
$('tierGrid').addEventListener('click',e=>{const b=e.target.closest('[data-tier]');if(!b||b.disabled)return;if(selectFrontierTier(b.dataset.tier))renderTierLobby();});
$('milestoneList').addEventListener('click',e=>{
 const envelopeOption=e.target.closest('[data-veteran-envelope]');
 if(envelopeOption){
  if(envelopeOption.disabled)return;
  const list=$('milestoneList'),scroll=list.scrollTop,open=!!list.querySelector?.('details.veteran-watch')?.open;
  if(setVeteranEnvelopePercent(envelopeOption.dataset.veteranEnvelope)){
   renderTierLobby();list.scrollTop=scroll;
   if(open){const panel=list.querySelector?.('details.veteran-watch');if(panel)panel.open=true;}
  }
  return;
 }
 const veteran=e.target.closest('[data-veteran-watch-open]');
 if(veteran&&veteran.dataset?.veteranWatchOpen==='training'){
  if(!veteran.disabled)openTab('training');
  return;
 }
 const ladder=e.target.closest('[data-essence-ladder-open]');
 if(ladder&&ladder.dataset?.essenceLadderOpen==='training'){
  if(!ladder.disabled)openTab('training');
  return;
 }
 const audit=e.target.closest('[data-march-build-open]');
 if(audit&&['equipment','runes','training','research'].includes(audit.dataset?.marchBuildOpen)){
  if(!audit.disabled)openTab(audit.dataset.marchBuildOpen);
  return;
 }
 const longMarch=e.target.closest('[data-long-march-open]');
 if(longMarch&&['training','research','equipment'].includes(longMarch.dataset?.longMarchOpen)){
  if(!longMarch.disabled)openTab(longMarch.dataset.longMarchOpen);
  return;
 }
 const expedition=e.target.closest('[data-expedition-open]');
 if(expedition&&['equipment','runes','training'].includes(expedition.dataset?.expeditionOpen)){
  if(!expedition.disabled)openTab(expedition.dataset.expeditionOpen);
  return;
 }
 const frontier=e.target.closest('[data-watch-frontier]');
 if(frontier&&typeof frontier.dataset?.watchFrontier==='string'){
  if(frontier.disabled)return;
  const list=$('milestoneList'),scroll=list.scrollTop;
  if(selectFrontierTier(frontier.dataset.watchFrontier)){
   renderTierLobby();list.scrollTop=scroll;notice('FRONTIER WATCH · TIER '+roman(chosenTier)+' SELECTED');
  }else notice('FRONTIER WATCH · ROUTE UNAVAILABLE OR SAVE NOT VERIFIED');
  return;
 }
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
  const list=$('milestoneList'),scroll=list.scrollTop,chestOpen=!!list.querySelector?.('details.war-chest')?.open;
  const applied=chooseDoctrineTactic(tactic.dataset.doctrineTactic);
  if(applied){save();notice('AUTO CAST · '+doctrineTacticModes[p.doctrineTactic].name+' STRATEGY SELECTED');}
  else notice('AUTO CAST · CHANGE BLOCKED');
  renderTierLobby();list.scrollTop=scroll;
  if(chestOpen){const chestView=list.querySelector?.('details.war-chest');if(chestView)chestView.open=true;}
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
 const prosperity=e.target.closest('[data-prosperity]');
 if(prosperity&&typeof prosperity.dataset?.prosperity==='string'){
  if(prosperity.disabled)return;
  const list=$('milestoneList'),scroll=list.scrollTop;
  const quote=prosperityLedgerQuote(prosperity.dataset.prosperity);
  const purchased=purchaseProsperityLedgerRank(prosperity.dataset.prosperity);
  if(purchased){
   const persisted=save();
   refreshHUD();
   notice(persisted?'PROSPERITY LEDGER · '+quote.name+' +1':
    'PURCHASE IN MEMORY · SAVE NOT VERIFIED · EXPORT BACKUP');
  }else notice('PROSPERITY LEDGER · UPGRADE UNAVAILABLE');
  renderTierLobby();list.scrollTop=scroll;return;
 }
 const breakthrough=e.target.closest('[data-breakthrough-rally]');
 if(breakthrough&&typeof breakthrough.dataset?.breakthroughRally==='string'){
  if(breakthrough.disabled)return;
  const list=$('milestoneList'),scroll=list.scrollTop,quote=breakthroughRallyQuote();
  const purchased=purchaseBreakthroughRallyRank();
  if(purchased){
   const verified=save();
   refreshHUD();
   notice(verified?'BREAKTHROUGH RALLY · '+councilTrainingDetails[quote.nextId].role+' TRAINED':
    'BREAKTHROUGH RANK IN MEMORY · SAVE NOT VERIFIED · EXPORT BACKUP');
  }else notice('BREAKTHROUGH RALLY · PURCHASE UNAVAILABLE');
  renderTierLobby();list.scrollTop=scroll;return;
 }
 const investment=e.target.closest('[data-first-watch-invest]');
 if(investment&&typeof investment.dataset?.firstWatchInvest==='string'){
  if(investment.disabled)return;
  const list=$('milestoneList'),scroll=list.scrollTop;
  const quote=firstWatchInvestmentQuote(investment.dataset.firstWatchInvest);
  const purchased=purchaseFirstWatchInvestmentRank(investment.dataset.firstWatchInvest);
  if(purchased){
   const verified=save();
   refreshHUD();
   notice(verified?'FIRST WATCH · '+councilTrainingDetails[quote.nextId].role+' TRAINED':
    'TRAINED IN MEMORY · SAVE NOT CONFIRMED · EXPORT BACKUP');
  }else notice('FIRST WATCH · RANK UNAVAILABLE');
  renderTierLobby();list.scrollTop=scroll;
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
 const routeButton=e.target.closest('[data-scout-route]');
 if(routeButton&&typeof routeButton.dataset?.scoutRoute==='string'){
  if(routeButton.disabled||!selectScoutRoute(chosenTier,routeButton.dataset.scoutRoute))return;
  const scroll=$('milestoneList').scrollTop;
  renderTierLobby();$('milestoneList').scrollTop=scroll;
  return;
 }
 const scout=e.target.closest('[data-exploration-choice]');
 if(scout&&['on','off'].includes(scout.dataset.explorationChoice)){
  scoutSignalsSelected=scout.dataset.explorationChoice==='on';if(!scoutSignalsSelected)selectedScoutRouteId=null;
  const scroll=$('milestoneList').scrollTop;renderTierLobby();$('milestoneList').scrollTop=scroll;
  return;
 }
 const waypoint=e.target.closest('[data-waystone-wave]');
 if(waypoint&&typeof waypoint.dataset?.waystoneWave==='string'){
  if(waypoint.disabled||!selectEarnedWaystone(chosenTier,waypoint.dataset.waystoneWave))return;
  const scroll=$('milestoneList').scrollTop;renderTierLobby();$('milestoneList').scrollTop=scroll;
  notice('WAYSTONE · EARNED WAVE '+formatWave(startWaveForTier(chosenTier)));
  return;
 }
 const target=e.target.closest('[data-milestone-target]');
 if(target&&typeof target.dataset?.milestoneTarget==='string'){
  if(target.disabled||!focusUnclaimedMilestone(chosenTier,target.dataset.milestoneTarget))return;
  const scroll=$('milestoneList').scrollTop;renderTierLobby();$('milestoneList').scrollTop=scroll;
  notice('MILESTONE FOCUS · WAVE '+formatWave(Number(target.dataset.milestoneTarget)));
  return;
 }
 const b=e.target.closest('[data-start-mode]');if(!b)return;
 const mode=b.dataset.startMode;
 if(!['fresh','waystone','echo'].includes(mode)||mode==='echo'&&!echoReturnEligible(chosenTier))return;
 selectedScoutRouteId=null;resetWaystoneNavigation();echoStartSelected=mode==='echo';useWaystone=mode!=='fresh';
 const scroll=$('milestoneList').scrollTop;renderTierLobby();$('milestoneList').scrollTop=scroll;
});
$('speedButton').onclick=cycleBattleSpeed;
$('pauseButton').onclick=toggleBattlePause;
$('deviceCheckToggle').onclick=toggleDeviceCheck;
$('clarityLensToggle').onclick=toggleClarityLens;
$('deviceCheckCopy').onclick=copyDeviceCheck;
$('deviceCheckReset').onclick=restartDeviceEndurance;
$('deviceCheckFrame').onclick=shareBattlefieldFrame;
$('deviceCheckCompare').onclick=shareBattlefieldComparison;
window.addEventListener('pagehide',pauseBattleInBackground);
window.addEventListener('storage',onCharacterStorageChange);
// Some Safari/Home Screen switches miss storage events; revalidate on return.
window.addEventListener('pageshow',()=>verifyPrimaryContinuity());
document.addEventListener('visibilitychange',()=>{
 if(document.hidden)pauseBattleInBackground();
 else verifyPrimaryContinuity();
});
const recoveredKeepsakes=reconcileMilestoneKeepsakes(),recoveredSeals=reconcileAtlasSeals();if(saveRecoveryStatus==='recovered'||recoveredKeepsakes||recoveredSeals)save();resetDeviceCheck();initRun();syncBattleControls();syncClarityLens();refreshHUD();showLobby();if(window.__PK_TEST__)window.__PK_TEST_TOOLS__={saveWriteIssue:()=>saveWriteIssue,saveWriteBlocked:()=>saveWriteBlocked,saveRecoveryStatus:()=>saveRecoveryStatus,portableBackupFormat,newerCharacterSave,createVerifiedBackup,inspectBackupImport,backupImportSummary,renderPortableBackupPanel,earnedWaystones,nearestEarnedWaystone,selectEarnedWaystone,focusUnclaimedMilestone,renderWaystoneNavigator,resetWaystoneNavigation,selectedWaystoneWave:()=>selectedWaystoneWave,selectedMilestoneTarget:()=>selectedMilestoneTarget,siegeGuardKey,siegeGuard, siegeGuardSettings,setSiegeGuardOption,siegeGuardWaveRest,pauseForSiegeGuard,tick,bossTelegraph,syncBattleControls,cycleBattleSpeed,toggleBattlePause,pauseBattleInBackground,hasImportRecovery,validateProgressBackup,restoreProgressBackup,undoProgressImport,safetyBackupKey,siegeHistoryLimit,safeHistoryCount,earnedProgressTotals,normalizeSiegeHistory,siegeHistoryForTier,renderSiegeHistory,recoveryCheckpointKey,recoveryCadence,recoveryDigest,parseCharacterRaw,readRecoveryCheckpoint,saveRecoverySummary,restoreVerifiedCheckpoint,renderSaveRecoveryPanel,damagedOriginalKey,damagedOriginalRaw,verifyPrimaryContinuity,onCharacterStorageChange,save,completeWave,beginWave,enterSiege,showLobby,retreatFromSiege,buildSiegeReport,renderSiegeReport,finishSiege,siegeReport:()=>lastSiegeReport,run:()=>run,p:()=>p,renderTierLobby,renderPanel,renderHeroHall,openTab,action,factionWarCouncil,trainingCouncil,warCouncilFit,warCouncilPlan,applyWarCouncil,renderWarCouncil,doctrineTacticModes,normalizeDoctrineTactic,chooseDoctrineTactic,doctrineTacticAssessment,doctrineCanCastNow,doctrineTacticEligible,renderDoctrineTactics,warChestOffers,purchaseWarChest,renderWarChest,fortitudeBreachWard,firstWatchHorizon,renderFirstWatchHorizon,firstWatchFrontiers,renderFirstWatchFrontiers,expeditionReadiness,renderExpeditionReadiness,longMarchLedger,renderLongMarchLedger,marchBuildAudit,renderMarchBuildAudit,essencePriceLadder,renderEssencePriceLadder,veteranWatchStrategy,renderVeteranWatchStrategy,veteranWatchEnvelope,renderVeteranWatchEnvelope,setVeteranEnvelopePercent,veteranEnvelopePercent:()=>veteranEnvelopePercent,selectFrontierTier,prosperityInvestments,prosperityLedgerQuote,purchaseProsperityLedgerRank,renderProsperityLedger,breakthroughRallyQuote,purchaseBreakthroughRallyRank,renderBreakthroughRally,firstWatchInvestmentPaths,firstWatchInvestmentQuote,renderFirstWatchInvestmentPaths,purchaseFirstWatchInvestmentRank,councilTrainingOffers,purchaseCouncilTraining,renderCouncilQuartermaster,councilRecoveryAdvice,renderCouncilRecovery,combatPassiveData,passiveTrait,chooseCombatPassive,combatLoadoutNames,normalizeCombatLoadouts,saveCombatLoadout,loadoutReadiness,applyCombatLoadout,renderCombatLoadouts,combatDoctrineData,chosenDoctrine,chooseCombatDoctrine,doctrineCooldown,castCombatDoctrine,advanceCombatDoctrine,refreshDoctrineHud,awardFirstWatch,renderFirstWatch,earlyWatchChapters,storeEarnedRune,storeEarnedGear,claimPendingGear,gearSellPrice,completeGearSale,renderArmoryDrawer,isProtectedExplorerHeirloom,isProtectedMilestoneKeepsake,isProtectedEchoSignet,echoReturnWave,echoReturnEnemies,echoReturn,echoReturnEligible,activeEchoReturn,awardEchoReturn,atlasSealObjectiveCount,atlasSealBonusPerRealm,atlasSealBanner,atlasSealProgress,atlasSealEligible,atlasSealCount,atlasSealBonus,reconcileAtlasSeals,awardAtlasSeals,startWaveForTier,echoStartSelected:()=>echoStartSelected,keepsakeWaves,milestoneKeepsake,reconcileMilestoneKeepsakes,canSellGear,maxWall,damage,socketValue,xpAdd,researchCost,randomGear,tierMilestone,tierMilestones,tierAdvanceWave,oathRank,oathCost,oathUnlocked,sigilMilestoneAmount,sigilLedgerSummary,renderSigilLedger,encounterDirector,encounterUnit,lostSignalWaves,lostSignal,lostSignalGuardians,cartographerRouteWaves,cartographerOath,activeCartographerOath,awardCartographerOath,explorerSetStatus,explorerSetLabel,activeLostSignal,awardLostSignal,renderLostSignalLedger,scoutSignalsSelected:()=>scoutSignalsSelected,setScoutSignalsSelected:v=>(scoutSignalsSelected=!!v),scoutRouteWaystone,scoutRouteOptions,selectedScoutRoute,selectScoutRoute,renderScoutRoutebook,selectedScoutRouteId:()=>selectedScoutRouteId,territoryVanguards,territoryVanguard,hasNativeVanguard,nativeMarchOrders,nativeMarchOrder,nativeMarchPosition,formationPosition,activeEncounterThreat,frontlineBreachRisk,frontlineFocus:()=>frontlineFocus,castFocus:()=>castFocus,castFocusKind:()=>castFocusKind,castFocusActive,castFocusColors,specialistTelegraph,currentSpecialistAlert,renderEncounterIntel,renderSiegeCodex,refreshHUD,advanceBattleVisuals,drawInterval,visualQualityProfiles,visualQualityKey,clarityLensKey,clarityLensEnabled:()=>clarityLensEnabled,setClarityLens,toggleClarityLens,syncClarityLens,visualQualityMode:()=>visualQuality,setVisualQuality,effectiveVisualHz,territoryWeatherCount,renderVisualSettings,toggleDeviceCheck,sampleDeviceCheck,deviceCheckMode,deviceCheckReport,deviceEnduranceProgress,deviceEnduranceStatus,recordDeviceEnduranceCheckpoint,restartDeviceEndurance,deviceCheckSnapshot:()=>deviceCheckState,copyDeviceCheck,battlefieldSnapshotName,shareBattlefieldFrame,battlefieldComparisonName,buildBattlefieldComparison,shareBattlefieldComparison,territoryVistas,territoryVista,drawTerritoryAtmosphere,territoryWeatherSignature,terrainBiomes,terrainColors,terrainRelicMotifs,terrainSceneSvg,territorySceneImage,territoryLore,territoryBossStaging,bossStageTemplates,bossStageEdges,heraldrySigils,fortressHeraldrySvg,fortressHeraldryImage,renderWorldAtlas,openWorldAtlas,closeWorldAtlas,stepWorldAtlas,toggleAtlasComparison,toggleAtlasZoom,atlasBossStageSvg,chooseAtlasBossStyle,toggleAtlasBossPhase,atlasWeatherSvg,toggleAtlasWeather,atlasWeatherSnapshot:()=>({enabled:atlasWeatherOn,tier:atlasCurrentTier}),atlasExportFilename,paintAtlasExport,shareAtlasArtwork,atlasBossSnapshot:()=>({style:atlasBossStyle,phase:atlasBossPhase,tier:atlasCurrentTier}),atlasPointerDown,atlasPointerMove,atlasPointerUp,atlasPointerCancel,updateTerritoryPreview,visibleTerritoryTier,collectAliveSorted,sortedRenderEnemies,sortedTargetEnemies,renderScratch:()=>renderEnemyScratch,targetScratch:()=>targetEnemyScratch,draw,loop,encounterKnowledgeBonus,encounterAdvice,allowedSpecialist,healShamanAllies,nearestShockTarget,shoot,recordShotTrail,shieldAuraReduction,thornWardReduction,rallyAuraFactor,threatPriority,chapterChallenge,relicChallenge,awardRelicChallenge,claimPendingRelics,attackInterval,encounterSpecialBonus,isSiegeBoss,sapperBlastDamage,specialEnemyMotion,bossCounterplay,specialistCast,specialistCounterplay,awardChapterChallenge,dominionTrial,dominionBonus,dominionSeals,dominionResonance,tierThreat,outerDepthPressure,tierReward,renderFirstWatch,renderDominionPreview,earlyWatchChapters,waveThreat,waveArmor,enemySpeedFactor,waveEnemyCount,waystoneForTier,ascCost,ascUnlocked,projectileCount,spawnEnemy,hurt,tick,rewardMilestone};requestAnimationFrame(loop);
})();