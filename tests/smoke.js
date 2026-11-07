// Alpha 0.9.0: 30-tier 10000-wave progression, First Watch 12.5h rewards, Dominion Crests and saved progression,
// skills, legacy purchases, save and menu navigation, with no browser dependencies.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let nextFrame=null,storedSave=null;
// Faithful storage readback: route selection verifies writes and rejects stale saves.
const mockStorage=new Map();
const canvasContext=new Proxy({createLinearGradient(){return{addColorStop(){}}}}, {get(obj,key){return obj[key]||(()=>{});},set(obj,key,val){obj[key]=val;return true;}});
class Element{
 constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.classList={add(){},remove(){},toggle(){}};this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;this.onclick=null;this.listeners={};this.width=960;this.height=540;this.scrollTop=0;}
 getContext(){return canvasContext}addEventListener(type,cb){this.listeners[type]=cb}
 querySelectorAll(){return[]}querySelector(){return null}
}
const elements=new Map(),el=id=>elements.get(id)||(elements.set(id,new Element(id)),elements.get(id));
class MockImage{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
let testMode=true;
const sandbox={__testMode:testMode,Image:MockImage,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},window:{__PK_TEST__:true,addEventListener(){}},localStorage:{getItem(k){return mockStorage.has(k)?mockStorage.get(k):null},setItem(k,v){mockStorage.set(k,String(v));storedSave=String(v)},removeItem(k){mockStorage.delete(k)}},requestAnimationFrame(fn){nextFrame=fn},performance:{now:()=>1000},setTimeout:()=>0,clearTimeout(){},console,Math,Date,Blob,URL:{createObjectURL(){return'blob:demo'},revokeObjectURL(){}},confirm(){return true}};
vm.runInNewContext(fs.readFileSync('game.js','utf8'),sandbox,{filename:'game.js'});
const hooks=sandbox.window.__PK_TEST_TOOLS__,clickHub=hub=>el('nav').listeners.click({target:{closest:()=>({dataset:{hub}})}}),clickSub=tab=>el('subnav').listeners.click({target:{closest:()=>({dataset:{subtab:tab}})}}),clickButton=ds=>el('panelContent').listeners.click({target:{closest:()=>({dataset:ds,disabled:false})}});
assert(hooks&&nextFrame,'Game initialized with test hooks and game loop');
assert.equal(el('tierLobby').hidden,false,'Pregame tier selection shown');
assert(el('tierGrid').innerHTML.includes('TIER XVI'),'Sixteen difficulty tiers available');
assert(el('tierGrid').innerHTML.includes('TIER XXX'),'All 30 difficulty tiers available');
assert(el('milestoneList').innerHTML.includes('THE FIRST WATCH'),'Gradually spaced early player rewards are shown on the Battle lobby');
assert(el('tierGrid').innerHTML.includes('disabled'),'Higher tiers initially locked');
assert(el('milestoneList').innerHTML.includes('Wave 20'),'Milestones are visible');
assert(el('milestoneList').innerHTML.includes('Legacy Training'),'Gameplay unlocks are visible');
// The tier-selection lobby must not block ANY progression chamber before combat.
for(const hub of ['hero','power','gear','fortress']){
 clickHub(hub);
 assert.equal(el('panel').hidden,false,hub+' panel opens before siege');
 assert.equal(el('tierLobby').hidden,true,hub+' is not obscured by tier lobby');
 assert.equal(hooks.run().phase,'ready','Opening '+hub+' never starts combat');
 const subtab=({hero:'hero',power:'research',gear:'runes',fortress:'suppression'})[hub];
 clickSub(subtab);
 assert(el('panelContent').innerHTML.length>100,subtab+' renders before siege');
 assert.equal(el('tierLobby').hidden,true,'Tier lobby stays hidden in '+subtab);
 clickSub(({hero:'hero',power:'training',gear:'equipment',fortress:'stations'})[hub]);
}
clickHub('battle');
assert.equal(el('panel').hidden,true,'Battle returns from pre-siege menus');
assert.equal(el('tierLobby').hidden,false,'Returning to Battle restores tier selection');
assert.equal(hooks.run().phase,'ready','Browsing and returning never launches siege');
assert(el('milestoneList').innerHTML.includes('Wave 20'),'Milestones still display after menu browsing');
// Settings from the lobby must work and return the player to their chosen tier.
el('settingsButton').onclick();
assert.equal(el('tierLobby').hidden,true,'Settings is not covered by lobby');
assert.equal(el('panel').hidden,false,'Settings opens before siege');
el('closePanel').onclick();
assert.equal(el('tierLobby').hidden,false,'Closing settings returns to tier selection');
el('launchTierButton').onclick();assert.equal(el('tierLobby').hidden,true);assert.equal(hooks.run().phase,'fighting');
assert.equal(hooks.run().tier,1);assert.equal(el('exitRunButton').hidden,false);
assert(el('waveName').textContent.includes('10,000'),'Wave HUD shows the 10,000-wave tier goal');
// Complete waves in test mode; in real gameplay these are cleared by kills.
for(let w=1;w<=20;w++){
 assert.equal(hooks.run().wave,w);
 hooks.completeWave();
 assert.equal(hooks.run().phase,'intermission','Wave advances automatically rather than waiting for a button');
 hooks.beginWave();
}
assert.equal(hooks.p().unlockedTier,2,'Tier II unlocked by Tier I wave 20');
assert(hooks.p().milestones['1:5']&&hooks.p().milestones['1:10']&&hooks.p().milestones['1:15']&&hooks.p().milestones['1:20']);
assert.equal(hooks.p().legacyUnlocked,true);
assert(hooks.p().sigils>0,'Special currency is awarded');
assert.equal(hooks.p().bestByTier[1],20);
const sigils=hooks.p().sigils;hooks.renderTierLobby();assert(el('tierGrid').innerHTML.includes('BEST 20 / 10,000'));
// Replaying never duplicates a previously claimed tier milestone.
hooks.retreatFromSiege();hooks.enterSiege();for(let w=1;w<=20;w++){hooks.completeWave();hooks.beginWave();}
assert.equal(hooks.p().sigils,sigils,'Milestone currencies only pay once');
clickHub('hero');assert(el('panelTitle').textContent==='HERO HALL');
const hall=el('panelContent').innerHTML;
assert(hall.includes('hall-compact'),'Hero uses compact character sheet');
assert(hall.includes('hall-chart-table'),'All skills shown in matrix instead of talent cards');
for(const id of ['aim','ember','stone','fortune','prosperity','tempest'])assert(hall.includes('data-hero-inspect="'+id+'"'),'Skill '+id+' appears in full four-path chart');
assert(hall.includes('hall-banner-rack'),'Banners shown as cosmetics instead of generic cards');
assert(!hall.includes('build-source-grid'),'Unnecessary Power Sources removed');
assert(!hall.includes('hall-school-pill'),'No single-discipline selection or redundant tree');
assert.equal(el('subnav').hidden,true,'Hero Hall does not waste space on duplicate Tree Focus');
clickButton({heroInspect:'frost'});assert(el('panelContent').innerHTML.includes('Winter Touch'),'Tapping a skill reveals its detail');
hooks.p().points=Math.max(1,hooks.p().points);
const beforeSkill=hooks.p().skills.aim||0,beforePoints=hooks.p().points;
clickButton({action:'skill:aim'});assert.equal(hooks.p().skills.aim,beforeSkill+1,'Skill chart upgrades a talent');
assert.equal(hooks.p().points,beforePoints-1,'Skill chart consumes one point');
clickHub('power');
const forge=el('panelContent').innerHTML;
assert(forge.includes('ascension-shell'),'Power Training retains its illustrated chamber');
assert(forge.includes('forge-ledger'),'Knight\'s Forge uses a single organized ledger');
assert(forge.includes('forge-all-categories'),'All four Forge categories displayed together');
for(const category of ['offense','techniques','defense','economy']){
 assert(forge.includes('forge-category-'+category),'Category '+category+' always visible');
}
for(const row of ['power','haste','crit','critDmg','pierce','range','multishot','boss','shock','fort','regen','resist','gold','xp','essence','loot']){
 assert(forge.includes('data-train-row="'+row+'"'),'Training '+row+' immediately visible');
}
assert.equal((forge.match(/data-train-row="/g)||[]).length,16,'All 16 training paths are present without switching');
assert((forge.match(/class="forge-pixel-icon"/g)||[]).length>=23,'Forge icons render as isolated pixel art rather than sliced texture crops');
assert(!forge.includes('pixel-symbol-'),'No legacy cropped icons remain inside the Forge ledger');
assert(forge.includes('aria-label="power pixel art icon"')&&forge.includes('aria-label="essence pixel art icon"'),'Attack and currency training have distinct emblems');
assert(!forge.includes('data-train-filter'),'No Forge category-switching controls remain');
assert(forge.includes('Siegebreaker'),'Unlocked Legacy Masteries are present alongside all training');
assert(!forge.includes('upgrade-card'),'Oversized old training cards removed');
clickButton({action:'legacy:siegebreaker'});assert(hooks.p().legacy.siegebreaker===1);
clickButton({action:'train:power'});
assert(storedSave&&JSON.parse(storedSave).training.power===1,'Essence purchases persist');
hooks.p().essence=100000;
const beforeBatchRank=hooks.p().training.power, beforeBatchEssence=hooks.p().essence;
const oneCostAt=lv=>Math.floor(8*(1+lv*.075+lv*lv*.004)*Math.pow(1+(1.125-1)*.07,Math.min(lv,120))*Math.pow(1.002,Math.max(0,lv-120)));
const tenCost=Array.from({length:10},(_,i)=>oneCostAt(beforeBatchRank+i)).reduce((a,b)=>a+b,0);
clickButton({action:'trainBatch:power'});
assert.equal(hooks.p().training.power,beforeBatchRank+10,'Training can purchase 10 affordable ranks');
assert.equal(hooks.p().essence,beforeBatchEssence-tenCost,'Batch costs exactly the sum of individual ranks');
clickSub('research');
let archive=el('panelContent').innerHTML;
assert(archive.includes('archive-room'),'Research uses the Royal Archive');
assert(archive.includes('Twelve royal discoveries'),'New 12-project Royal Archive header');
for(const branch of ['craft','treasury','bastion','guild'])
 assert(archive.includes('archive-branch-'+branch),'Research wing '+branch+' is available');
const researchIds=['discount','fusion','excavation','interest','bounties','studies',
 'masonry','calibration','attunement','almanac','distillation','appraisal'];
for(const id of researchIds)
 assert(archive.includes('data-research-row="'+id+'"'),'Research '+id+' is available without extra navigation');
assert.equal((archive.match(/data-research-row="/g)||[]).length,12,'Exactly 12 Royal Archive projects rendered');
assert.equal((archive.match(/class="forge-pixel-icon"/g)||[]).length,12,'All 12 research projects display their own pixel icon');
assert(!archive.includes('upgrade-card'),'Old research cards were replaced');
hooks.p().knowledge+=100000;
const prevResearch=hooks.p().research.discount||0;
clickButton({action:'research:discount'});
assert.equal(hooks.p().research.discount,prevResearch+1,'Original six research upgrades still work');
const researchSave=hooks.p().research;
const olderRanks={discount:researchSave.discount,fusion:researchSave.fusion||0,interest:researchSave.interest||0,excavation:researchSave.excavation||0,bounties:researchSave.bounties||0,studies:researchSave.studies||0};
const baselineDamage=hooks.damage(),baselineWall=hooks.maxWall();
const testGear={id:'test_gear',slot:'chest',rarity:3,plus:0};
const baselineSale=hooks.gearSellPrice(testGear);
const oldRuneSocket=hooks.p().socketed.helm;
hooks.p().socketed.helm='seedember';
const baselineRune=hooks.socketValue('ember');
const oldLevel=hooks.p().level,oldXp=hooks.p().xp;
hooks.p().level=70;hooks.p().xp=0;hooks.xpAdd(200);const baselineXp=hooks.p().xp;
hooks.p().level=oldLevel;hooks.p().xp=oldXp;
const battle=hooks.run();
battle.phase='fighting';battle.wave=34;battle.tier=1;battle.maxHealth=hooks.maxWall();battle.health=battle.maxHealth;
const oldEssence=hooks.p().essence;
hooks.completeWave();const baselineWaveEssence=hooks.p().essence-oldEssence;
for(const id of ['masonry','calibration','attunement','almanac','distillation','appraisal']){
 const previous=hooks.p().research[id]||0;
 const funds=hooks.p().knowledge;
 clickButton({action:'research:'+id});
 assert.equal(hooks.p().research[id],previous+1,'New '+id+' research upgrades by one rank');
 assert(hooks.p().knowledge<funds,'New '+id+' consumes Knowledge');
}
assert(hooks.damage()>baselineDamage,'Sharpsight Optics increases attack damage');
assert(hooks.maxWall()>baselineWall,'Stonewright Doctrine increases maximum wall health');
assert.equal(hooks.run().maxHealth,hooks.maxWall(),'Stonewright Doctrine updates the active fortress immediately');
assert(hooks.socketValue('ember')>baselineRune,'Runic Harmonics increases socketed rune effects');
assert(hooks.gearSellPrice(testGear)>baselineSale,'Guild Appraisals increases gear sale prices');
hooks.p().level=70;hooks.p().xp=0;hooks.xpAdd(200);
assert(hooks.p().xp>baselineXp,'Warden Almanac increases XP rewards');
hooks.p().level=oldLevel;hooks.p().xp=oldXp;
battle.phase='fighting';battle.wave=34;battle.tier=1;battle.maxHealth=hooks.maxWall();battle.health=battle.maxHealth;
const essenceBeforeDistilledWave=hooks.p().essence;
hooks.completeWave();
assert(hooks.p().essence-essenceBeforeDistilledWave>baselineWaveEssence,'Essence Distillation increases completed wave income');
if(oldRuneSocket)hooks.p().socketed.helm=oldRuneSocket;
else delete hooks.p().socketed.helm;
for(const [id,rank] of Object.entries(olderRanks))
 assert.equal(hooks.p().research[id]||0,rank,'Original research '+id+' rank preserved');
assert(JSON.parse(storedSave).research.appraisal===1,'Research additions persist in the existing save');
clickHub('gear');
const gearShowcase=el('panelContent').innerHTML;
assert(gearShowcase.includes('Leather Cowl'),'Gear equipment panel remains functional');
for(const slot of ['helm','amulet','chest','legs','boots','gauntlets','charm','ring1','ring2','ring3','ring4']){
 assert(gearShowcase.includes('aria-label="gear_'+slot+' pixel art icon"'),'Equipment slot '+slot+' has a standalone, slot-specific pixel emblem');
}
assert.equal((gearShowcase.match(/class="forge-pixel-icon"/g)||[]).length,11,'All 11 equipped slots use consistent pixel emblems');
assert(!gearShowcase.includes('armory-slot-gem"><span class="pixel-symbol'),'Old cropped Gear slot texture no longer used');
clickSub('runes');
const runeScreen=el('panelContent').innerHTML;
assert(runeScreen.includes('rune-socket-emblem'),'Rune sockets have standalone pixel-art emblems');
for(const slot of ['helm','amulet','chest','legs','boots','gauntlets','charm','ring1','ring2','ring3','ring4']){
 assert(runeScreen.includes('data-socket-slot="'+slot+'"'),'Rune socket '+slot+' remains selectable');
}
assert(runeScreen.includes('aria-label="rune_ember pixel art icon"'),'Rune collection uses unique Ember art');
assert(runeScreen.includes('class="forge-pixel-icon"'),'Rune collection icons are vector pixel sprites');
clickButton({socketSlot:'helm'});
assert(el('panelContent').innerHTML.includes('rune-picker'));
assert(el('panelContent').innerHTML.includes('rune-choice-icon'),'Rune picker uses matching pixel icons');
clickButton({socketRune:'helm:seedember'});assert(JSON.parse(storedSave).socketed.helm==='seedember');
clickHub('fortress');
const stationScreen=el('panelContent').innerHTML;
assert(stationScreen.includes('Ironwood Ballista'),'Existing Station panel remains intact');
for(const id of ['ballista','cryo','midas','thunder','gravity']){
 assert(stationScreen.includes('aria-label="'+id+' pixel art icon"'),'Unique standalone sprite for Station '+id);
 assert(stationScreen.includes('data-action="station:'+id+'"'),'Existing Station upgrade action preserved');
}
assert.equal((stationScreen.match(/class="forge-pixel-icon"/g)||[]).length,5,'Every Station card uses a self-contained pixel-art icon');
assert(!stationScreen.includes('card-art"><span class="pixel-symbol'),'No Station card uses a cropped menu texture');
hooks.p().gold+=100000;
const stationRankBefore=hooks.p().stations.ballista||0;
clickButton({action:'station:ballista'});
assert.equal(hooks.p().stations.ballista,stationRankBefore+1,'Station upgrades remain functional');
clickSub('suppression');
const suppressionScreen=el('panelContent').innerHTML;
assert(suppressionScreen.includes('Weakening Sigils'),'Existing Suppression panel remains intact');
for(const id of ['health','speed','damage','armor']){
 assert(suppressionScreen.includes('aria-label="'+id+' pixel art icon"'),'Unique standalone sprite for Suppression '+id);
 assert(suppressionScreen.includes('data-action="suppress:'+id+'"'),'Existing Suppression upgrade action preserved');
}
assert.equal((suppressionScreen.match(/class="forge-pixel-icon"/g)||[]).length,4,'Every Suppression card uses a self-contained pixel-art icon');
assert(!suppressionScreen.includes('card-art"><span class="pixel-symbol'),'No Suppression card uses a cropped menu texture');
hooks.p().knowledge+=10000;
const suppressionRankBefore=hooks.p().suppression.health||0;
clickButton({action:'suppress:health'});
assert.equal(hooks.p().suppression.health,suppressionRankBefore+1,'Suppression upgrades remain functional');
clickHub('battle');assert.equal(el('tierLobby').hidden,true,'Ongoing run continues when browsing menus');
el('exitRunButton').onclick();assert.equal(el('tierLobby').hidden,false);
el('tierGrid').listeners.click({target:{closest:()=>({dataset:{tier:'2'},disabled:false})}});
assert(el('tierHeading').textContent.includes('TIER II'));
el('launchTierButton').onclick();assert.equal(hooks.run().tier,2);
assert.equal(hooks.run().wave,1);
// Alpha 0.6 regression: Diablo-style body slots, inventory drawer and gear salvage.
clickHub('gear');clickSub('equipment');
assert(el('panelContent').innerHTML.includes('armory-hero-stage'),'Armory shows the front-facing hero');
for(const slot of ['helm','amulet','chest','legs','boots','gauntlets','charm','ring1','ring2','ring3','ring4'])
 assert(el('panelContent').innerHTML.includes('aria-label="gear_'+slot+' pixel art icon"'),'Equipped slot artwork remains on re-entry');
for(const slot of ['helm','amulet','chest','legs','boots','gauntlets','charm','ring1','ring2','ring3','ring4'])assert(el('panelContent').innerHTML.includes('data-gear-slot="'+slot+'"'),'Body-positioned '+slot+' slot');
clickButton({gearSlot:'helm'});
assert.equal(el('armoryDrawer').hidden,false,'Tapped slot opens inventory drawer');
assert(el('armoryDrawer').innerHTML.includes('SORTED BY RARITY'));
assert(el('armoryDrawer').innerHTML.includes('aria-label="gear_helm pixel art icon"'),'Inventory drawers show the matching Helm pixel art');
assert(!el('armoryDrawer').innerHTML.includes('armory-item-icon"><span class="pixel-symbol'),'Inventory no longer uses generic cropped menu textures');
const armoryClick=ds=>el('armoryDrawer').listeners.click({target:{closest:()=>({dataset:ds,disabled:false})}});
const armoryChange=(rank,checked)=>el('armoryDrawer').listeners.change({target:{closest:()=>({dataset:{sellRarity:String(rank)},checked})}});
const testLoot={id:'qa06_loot',slot:'helm',rarity:2,plus:0};
hooks.p().inventory.push(testLoot);
const sellPrice=hooks.gearSellPrice(testLoot),beforeSell=hooks.p().gold;
hooks.completeGearSale([testLoot]);
assert.equal(hooks.p().gold,beforeSell+sellPrice,'Selling awards the quoted Gold');
assert(!hooks.p().inventory.some(g=>g.id==='qa06_loot'),'Sold gear leaves inventory');
assert(hooks.p().inventory.some(g=>g.id==='starterhelm'),'Equipped gear is never sold');
armoryClick({gearUndo:''});
assert(hooks.p().inventory.some(g=>g.id==='qa06_loot'),'Last sale can be reversed');
assert.equal(hooks.p().gold,beforeSell,'Undo removes refunded Gold');
// Attempt to sell equipped items must have no effect.
const beforeProtected=hooks.p().gold;
hooks.completeGearSale([hooks.p().inventory.find(g=>g.id===hooks.p().equipped.helm)]);
assert.equal(hooks.p().gold,beforeProtected,'Equipped helm is unsellable');
// Ring pieces may be equipped in any of the four positions without duplication.
armoryClick({gearBack:''});
clickButton({gearSlot:'ring3'});
const testRing={id:'qa063_ring',slot:'ring',rarity:4,plus:3};hooks.p().inventory.push(testRing);
armoryClick({action:'equip:qa063_ring'});
assert.equal(hooks.p().equipped.ring3,'qa063_ring','Ring equips to the ring slot tapped');
armoryClick({gearBack:''});
clickButton({gearSlot:'ring4'});armoryClick({action:'equip:qa063_ring'});
assert.equal(hooks.p().equipped.ring3,undefined,'Ring moved out of previous slot');
assert.equal(hooks.p().equipped.ring4,'qa063_ring','Ring may be moved to a different position');
armoryClick({gearBack:''});
assert.equal(el('armoryDrawer').hidden,true,'Back to hero closes inventory');

// Existing Alpha 0.6.1 saves retain their earned loot, enhancement levels and currencies.
const legacySave={version:1,gold:13337,essence:881,knowledge:77,level:12,points:6,
 inventory:[{id:'owned_bow',slot:'weapon',rarity:3,plus:7},{id:'owned_armor',slot:'armor',rarity:2,plus:5},{id:'owned_charm',slot:'charm',rarity:2,plus:2}],
 equipped:{weapon:'owned_bow',armor:'owned_armor',charm:'owned_charm'},socketed:{weapon:'seedember'},runes:[{id:'seedember',type:'ember',tier:1}]};
const oldElements=new Map(),oldEl=id=>oldElements.get(id)||(oldElements.set(id,new Element(id)),oldElements.get(id));
const oldSandbox={Image:MockImage,document:{getElementById:oldEl,querySelectorAll:()=>[],addEventListener(){}},window:{__PK_TEST__:true,addEventListener(){}},localStorage:{getItem(){return JSON.stringify(legacySave)},setItem(){}},requestAnimationFrame(){},performance:{now:()=>1000},setTimeout:()=>0,clearTimeout(){},console,Math,Date,Blob,URL:{createObjectURL(){return'blob:old'},revokeObjectURL(){}},confirm(){return true}};
vm.runInNewContext(fs.readFileSync('game.js','utf8'),oldSandbox,{filename:'game.js'});
const restored=oldSandbox.window.__PK_TEST_TOOLS__.p();
assert.equal(restored.gold,13337);assert.equal(restored.essence,881);assert.equal(restored.level,12);
assert.equal(restored.inventory.find(g=>g.id==='owned_bow').plus,7,'Old enhancement preserved');
assert.equal(restored.inventory.find(g=>g.id==='owned_armor').plus,5,'Old chest armor preserved');
assert.equal(restored.equipped.amulet,'owned_bow','Old bow converted to an heirloom in amulet slot');
assert.equal(restored.equipped.chest,'owned_armor','Old armor converted to chest plate');
assert.equal(restored.socketed.amulet,'seedember','Old socketed rune follows old bow');
assert.equal(new Set(restored.inventory.map(g=>g.id)).size,restored.inventory.length,'No duplicated item IDs');
assert.equal(restored.version,3,'Save migration version updated');

// Alpha 0.8.0 — long-range combat, 10,000-wave milestones, return waystones and permanent Ascension.
assert.equal(hooks.waveEnemyCount(1),9,'First wave stays small');
for(const wave of [5,20,100,400,1000,2500,5000,8000,10000]){
 const threat=hooks.waveThreat(wave);
 assert(Number.isFinite(threat)&&threat>0&&threat<100000,'Threat curve finite at wave '+wave);
 assert(hooks.waveEnemyCount(wave)<=24&&hooks.waveEnemyCount(wave)>=9,'Wave '+wave+' uses bounded enemy count');
 assert(hooks.enemySpeedFactor(wave)<=4&&hooks.enemySpeedFactor(wave)>=1,'Enemy speed does not explode at wave '+wave);
 assert(hooks.waveArmor(wave,16)>hooks.waveArmor(wave,1),'Higher tiers retain a defensive challenge');
}
assert(hooks.waveThreat(20)<hooks.waveThreat(100),'First century difficulty grows');
assert(hooks.waveThreat(100)<hooks.waveThreat(1000)&&hooks.waveThreat(1000)<hooks.waveThreat(10000),'Late-wave threats keep increasing');
const tier13Wave20NormalHp=36*hooks.waveThreat(20)*(1+12*.64);
const tier1Wave10000NormalHp=36*hooks.waveThreat(10000);
assert(tier1Wave10000NormalHp>tier13Wave20NormalHp*100,'Tier XIII can unlock while Tier I wave 10000 remains far harder');
const deepBossAt16=300*hooks.waveThreat(10000)*(1+15*.64);
assert(deepBossAt16>tier1Wave10000NormalHp*50,'Tier XVI final boss stays a serious challenge');
clickHub('power');clickSub('training');
const ascBefore=el('panelContent').innerHTML;
for(const id of ['vanguard','bastion','sunder','epoch','volley']){
 assert(ascBefore.includes('data-ascension-row="'+id+'"'),'Ascension route '+id+' shown in Forge');
}
assert(!hooks.ascUnlocked(['vanguard','', '',8,40,150]),'Deep path initially locked before wave 150');
hooks.p().sigils+=50000;
const lockedBefore=hooks.p().ascension.vanguard||0;
clickButton({action:'ascension:vanguard'});
assert.equal(hooks.p().ascension.vanguard||0,lockedBefore,'Locked Ascension cannot be purchased for Sigils');
const deepRun=hooks.run();
deepRun.phase='fighting';deepRun.wave=100;deepRun.tier=1;
hooks.completeWave();
assert.equal(hooks.waystoneForTier(1),100,'Completing wave 100 unlocks first return waystone');
assert(hooks.p().milestones['1:100'],'Tier I original century reward still works');
const originalTier1Sigils=hooks.p().sigils;
deepRun.phase='fighting';deepRun.wave=150;deepRun.tier=1;
hooks.completeWave();
assert(hooks.p().milestones['1:150'],'Wave 150 milestone persisted');
assert(hooks.ascUnlocked(['vanguard','', '',8,40,150]),'Wave 150 unlocks Vanguard Doctrine in any tier');
const afterWave150Sigils=hooks.p().sigils;
deepRun.phase='fighting';deepRun.wave=150;deepRun.tier=1;
hooks.completeWave();
assert.equal(hooks.p().sigils,afterWave150Sigils,'Tier milestone Sigils never pay twice');
clickHub('power');clickSub('training');
const oldDamage=hooks.damage(),sigilsBeforeAsc=hooks.p().sigils;
clickButton({action:'ascension:vanguard'});
assert.equal(hooks.p().ascension.vanguard,1,'Ascension Vanguard purchase persists');
assert(hooks.p().sigils<sigilsBeforeAsc,'Ascension costs real Sigils');
assert(hooks.damage()>oldDamage,'Vanguard Doctrine permanently raises hero damage');
for(const wave of [400,1000,2500,5000]){
 deepRun.phase='fighting';deepRun.wave=wave;deepRun.tier=1;
 hooks.completeWave();
 assert(hooks.p().milestones['1:'+wave],'Deep-wave achievement '+wave+' earned');
}
for(const [id,wave] of [['bastion',400],['sunder',1000],['epoch',2500],['volley',5000]]){
 assert(hooks.ascUnlocked([id,'','',8,40,wave]),'Wave '+wave+' unlocks '+id);
}
clickHub('power');clickSub('training');
const oldMaxWall=hooks.maxWall();
clickButton({action:'ascension:bastion'});
assert.equal(hooks.p().ascension.bastion,1,'Bastion Covenant purchased');
assert(hooks.maxWall()>oldMaxWall&&deepRun.maxHealth===hooks.maxWall(),'Bastion Covenant immediately reinforces the fortress');
const hurtTarget=()=>({type:'goblin',hp:1000,max:1000,armor:100,dead:false,x:250,y:200,buildup:0,burn:0,slow:0});
const firstTarget=hurtTarget();hooks.hurt(firstTarget,200,'ballista');
clickButton({action:'ascension:sunder'});
const secondTarget=hurtTarget();hooks.hurt(secondTarget,200,'ballista');
assert(secondTarget.hp<firstTarget.hp,'Armor Unbinding pierces more armor');
deepRun.wave=2500;const epochBefore=hooks.damage();
clickButton({action:'ascension:epoch'});
const epochDeep=hooks.damage();
deepRun.wave=100;const epochShallow=hooks.damage();
assert(epochDeep>epochBefore&&epochDeep>epochShallow,'Epoch Resonance amplifies damage more at later waves');
const volleyBefore=hooks.projectileCount();
for(let i=0;i<6;i++)clickButton({action:'ascension:volley'});
assert.equal(hooks.p().ascension.volley,6,'Six Eternal Volley ranks purchased');
assert.equal(hooks.projectileCount(),Math.min(12,volleyBefore+1),'Eternal Volley grants one extra projectile every six ranks');
// Close the synthetic deep siege before selecting another territory: live combat may not switch tiers.
hooks.retreatFromSiege();hooks.renderTierLobby();
el('tierGrid').listeners.click({target:{closest:()=>({dataset:{tier:'1'},disabled:false})}});
assert(el('tierGrid').innerHTML.includes('TIER XVI'),'Late-game lobby offers Tier XVI');
assert(el('milestoneList').innerHTML.includes('Wave 10,000'),'Tier milestone ledger shows final wave');
assert(el('milestoneList').innerHTML.includes('data-start-mode="waystone"'),'Return waystone restart button present');
assert(el('milestoneList').innerHTML.includes('Ascension')||el('milestoneList').innerHTML.includes('Doctrine'),'Long-wave rewards show mastery routes');
// The deep run was already retired before selecting Tier I.
const waystone=hooks.waystoneForTier(1);
assert(waystone>=100&&waystone<=5000,'Cleared milestones unlock legal tier return checkpoints');
el('milestoneList').listeners.click({target:{closest:()=>({dataset:{startMode:'waystone'}})}});
hooks.enterSiege();
assert.equal(hooks.run().wave,waystone,'Return siege starts at last earned waystone');
hooks.retreatFromSiege();
el('milestoneList').listeners.click({target:{closest:()=>({dataset:{startMode:'fresh'}})}});
hooks.enterSiege();
assert.equal(hooks.run().wave,1,'Players can always choose a fresh wave-1 run');
hooks.retreatFromSiege();
hooks.p().unlockedTier=13;
hooks.renderTierLobby();
el('tierGrid').listeners.click({target:{closest:()=>({dataset:{tier:'13'},disabled:false})}});
assert(el('tierHeading').textContent.includes('TIER XIII'),'Thirteenth tier is a real selectable challenge');
hooks.enterSiege();
assert.equal(hooks.run().tier,13,'Tier XIII launches');
assert(hooks.run().total<=24,'Enemy cap applies in high tiers');
hooks.retreatFromSiege();
el('tierGrid').listeners.click({target:{closest:()=>({dataset:{tier:'1'},disabled:false})}});
hooks.enterSiege();
const finalRun=hooks.run();finalRun.phase='fighting';finalRun.wave=10000;finalRun.tier=1;
finalRun.maxHealth=hooks.maxWall();finalRun.health=finalRun.maxHealth;
hooks.completeWave();
assert.equal(finalRun.phase,'completed','Wave 10000 finishes the tier, not wave 10001');
assert.equal(finalRun.wave,10000,'Completed tier stays at wave 10000');
assert.equal(hooks.p().bestByTier[1],10000,'Wave 10000 permanently recorded');
assert(hooks.p().milestones['1:10000'],'Final tier milestone persists');
assert(hooks.p().banners.includes('Eternal Victor of Verdant March'),'Eternal victory unlocks its cosmetic banner');
hooks.beginWave();
assert.equal(finalRun.phase,'completed','Completed tier cannot accidentally advance');
clickHub('battle');
assert.equal(el('tierLobby').hidden,false,'Returning to Battle after final victory shows the tier lobby');
assert(el('tierGrid').innerHTML.includes('ETERNALLY CONQUERED'),'Victory clearly marked in the tier selector');
const runeMax=240;
hooks.p().runes=Array.from({length:runeMax},(_,i)=>({id:'test_max_rune_'+i,type:'frost',tier:1}));
finalRun.phase='fighting';finalRun.wave=75;finalRun.tier=1;hooks.completeWave();
assert.equal(hooks.p().runes.length,runeMax,'Long runs never grow rune inventories beyond safe mobile cap');
assert(restored.ascension&&typeof restored.ascension==='object','Older saves receive an empty Ascension investment map without resetting progress');


// Alpha 0.9.0 — thirty-tier progression, First Watch opening cadence and Dominion seals.
const chapters=hooks.earlyWatchChapters;
assert.equal(chapters.length,16,'Opening First Watch contains 16 reward chapters');
assert.equal(chapters[chapters.length-1][0],750,'First Watch concludes after 12.5 active combat hours');
let lastSpacing=0,lastMinute=0;
for(let i=0;i<chapters.length;i++){
 const minute=chapters[i][0],spacing=minute-lastMinute;
 assert(spacing>=lastSpacing,'First Watch reward intervals never become shorter: chapter '+(i+1));
 lastMinute=minute;lastSpacing=spacing;
}
assert.equal(hooks.tierMilestones(16).length,33,'Old tiers get eight new first-victory achievements without outer-specific trials');
assert.equal(hooks.tierMilestones(17).length,44,'Outer tiers get an expanded 44-milestone conquest ladder');
assert(!hooks.tierMilestones(16).includes(125),'Outer-only milestones do not appear in earlier territories');
assert(hooks.tierMilestones(30).includes(9500),'Final tier has a penultimate Trial at wave 9500');
assert.equal(hooks.tierThreat(16),1+15*.64,'Original Tier XVI strength preserved');
assert(hooks.tierThreat(30)>hooks.tierThreat(16)*2,'Tier XXX adds meaningful endgame difficulty');
assert(hooks.tierReward(30)>hooks.tierReward(16),'Higher-tier wave resources appropriately reward the additional risk');
const startWatch=hooks.renderFirstWatch();
assert(startWatch.includes('THE FIRST WATCH'),'First Watch UI renders in Battle');
assert(startWatch.includes('3 /')||startWatch.includes('/ 3'),'First reward starts at three minutes of active siege');
const p09=hooks.p();
const previousGold=p09.gold;
p09.battleSeconds=chapters[0][0]*60-1;p09.uniqueClears=1000;
const watchRun=hooks.run();watchRun.tier=1;watchRun.wave=26;watchRun.phase='fighting';
hooks.completeWave();
assert.equal(p09.firstWatchClaimed.length,0,'First Watch cannot be earned from victories alone without active battle time');
p09.battleSeconds=chapters[0][0]*60;p09.uniqueClears=1000;watchRun.phase='fighting';watchRun.wave=27;
hooks.completeWave();
assert.equal(p09.firstWatchClaimed.length,1,'First chapter unlocked by both real battle time and unique victories');
assert(p09.gold>previousGold,'First Watch grants permanent earned currency');
watchRun.phase='fighting';watchRun.wave=28;hooks.completeWave();
assert.equal(p09.firstWatchClaimed.length,1,'First Watch rewards are not farmable');
p09.battleSeconds=750*60;p09.uniqueClears=15000;watchRun.phase='fighting';watchRun.wave=29;hooks.completeWave();
assert.equal(p09.firstWatchClaimed.length,16,'All opening chapters gradually become eligible through the first 12.5 hours');
assert(p09.banners.includes('Standard of the First Watch'),'Completion grants a permanent decorative banner');
assert.equal(new Set(p09.firstWatchClaimed).size,16,'First Watch chapters cannot duplicate');
assert(hooks.renderFirstWatch().includes('FIRST WATCH COMPLETE'),'First Watch completion state has a celebratory view');
p09.unlockedTier=30;
assert.equal(hooks.tierMilestone(30,20).kind,'sigils','Final-tier wave-20 milestone never unlocks Tier XXXI');
assert.equal(hooks.tierMilestone(17,125).kind,'frontier','Outer tier creates named exclusive conquest trial');
assert.equal(hooks.tierMilestone(17,250).kind,'dominion','Outer tier wave 250 grants a real crest seal');
assert(hooks.tierMilestone(17,250).name.includes('Glassheart Crest'),'Each new tier has its own named crest');
assert(hooks.tierMilestone(30,10000).name.includes('The First and Last Gate'),'Tier XXX ends in a unique final challenge');
const crestRun=hooks.run();const crestDamageBefore=hooks.damage(),crestMaxBefore=hooks.maxWall();
for(const [tier,wave] of [[17,250],[17,1000],[17,5000],[17,10000]]){
 crestRun.tier=tier;crestRun.wave=wave;crestRun.phase='fighting';crestRun.maxHealth=hooks.maxWall();crestRun.health=crestRun.maxHealth;
 hooks.completeWave();
 assert.equal(p09.dominionCrests[17],([250,1000,5000,10000].indexOf(wave)+1),'Crest increases exactly once at milestone '+wave);
 assert(p09.milestones[tier+':'+wave],'Crest milestone '+wave+' persisted');
}
assert(hooks.damage()>crestDamageBefore,'Glassheart Crest permanently raises hero damage');
assert.equal(p09.dominionCrests[17],4,'Dominion Crest capped at rank IV');
assert(p09.banners.includes('Eternal Victor of Bloodglass Frontier'),'Outer territory wave 10000 awards its unique eternal banner');
crestRun.phase='fighting';crestRun.tier=17;crestRun.wave=10000;crestRun.maxHealth=hooks.maxWall();crestRun.health=crestRun.maxHealth;hooks.completeWave();
assert.equal(p09.dominionCrests[17],4,'Repeating wave 10000 does not grant extra crest rank');
assert(hooks.dominionTrial(30).crest==='Origin Crest','Final tier has an Origin Crest of its own');
for(const tier of [18,19,20,21,22,23,24,25,26,27,28,29,30]){
 const row=hooks.dominionTrial(tier);
 assert(row&&row.crest&&row.trial,'Tier '+tier+' has distinct trial lore and reward');
 p09.dominionCrests[tier]=2;
 assert(hooks.dominionBonus(row.stat)>0,'Tier '+tier+' crest changes an actual gameplay bonus');
}
assert(hooks.maxWall()>crestMaxBefore,'Dominion wall crest reinforces fortress across all territories');
clickHub('power');clickSub('training');
const newTraining=el('panelContent').innerHTML;
assert(newTraining.includes('dominion-codex'),'All Dominion Crests have a visible permanent progression archive');
for(let tier=17;tier<=30;tier++)assert(newTraining.includes('data-crest-tier="'+tier+'"'),'Archive lists Tier '+tier+' crest');
clickHub('battle');
el('tierGrid').listeners.click({target:{closest:()=>({dataset:{tier:'30'},disabled:false})}});
assert(el('tierHeading').textContent.includes('TIER XXX'),'Tier XXX selectable with proper Roman numeral');
assert(el('milestoneList').innerHTML.includes('data-start-mode="waystone"')===false,'New Tier XXX has no falsely granted Waystone');
assert(el('milestoneList').innerHTML.includes('The First and Last Gate'),'Origin Gate narrative is visible in the final tier');
assert(el('milestoneList').innerHTML.includes('THE FIRST WATCH'),'First Watch remains accessible on the new tier selection screen');


// Dominion tier gates spread out earned progression after the first 16 tiers.
for(const [tier,wave] of [[1,20],[13,20],[16,20],[17,100],[20,100],[21,150],[24,150],[25,250],[29,250],[30,null]])
 assert.equal(hooks.tierAdvanceWave(tier),wave,'Tier '+tier+' requires a deliberately paced frontier milestone');
assert.equal(hooks.tierMilestone(17,100).unlockNext,18,'Tier XVII 100th-wave win opens Tier XVIII');
assert.equal(hooks.tierMilestone(21,150).unlockNext,22,'Tier XXI 150th-wave win opens Tier XXII');
assert.equal(hooks.tierMilestone(25,250).unlockNext,26,'Tier XXV first Crest unlocks Tier XXVI');
assert.equal(hooks.tierMilestone(29,250).unlockNext,30,'Tier XXIX Crest opens the final tier');
p09.unlockedTier=17;
assert(!p09.milestones['17:100'],'Tier XVII century reward initially unclaimed');
hooks.rewardMilestone(17,100);
assert.equal(p09.unlockedTier,18,'Outer Tier XVII does not unlock its next region until wave 100');
p09.unlockedTier=25;
hooks.rewardMilestone(25,20);
assert.equal(p09.unlockedTier,25,'Tier XXV wave 20 rewards the player but does not prematurely unlock the next tier');
hooks.rewardMilestone(25,250);
assert.equal(p09.unlockedTier,26,'Tier XXV wave 250 unlocks Tier XXVI and a Dominion Crest');
p09.unlockedTier=30;
assert(hooks.outerDepthPressure(16,10000)===1,'Earlier sixteen tiers keep their existing difficulty');
assert(hooks.outerDepthPressure(30,10000)>=50,'Final tier gains meaningful deep-wave pressure');
assert(hooks.outerDepthPressure(30,20)===1,'Final-tier early waves remain approachable before deep-wave escalation');
assert(hooks.dominionSeals()>=4,'Earned four-stage Dominion Crests contribute to account-wide Resonance');
assert(hooks.dominionResonance()>0,'Every earned Dominion seal adds measurable universal damage');
const cappedSave={...legacySave,version:3,unlockedTier:16,selectedTier:16,milestones:{'16:20':true},ascension:{vanguard:8},dominionCrests:{}};
const completedOldRun={...oldSandbox,window:{__PK_TEST__:true,addEventListener(){}},
 localStorage:{getItem(){return JSON.stringify(cappedSave)},setItem(){}}};
vm.runInNewContext(fs.readFileSync('game.js','utf8'),completedOldRun,{filename:'game.js'});
const completedOldData=completedOldRun.window.__PK_TEST_TOOLS__.p();
assert.equal(completedOldData.unlockedTier,17,'Previously completed Tier XVI wave 20 auto-unlocks new Tier XVII');
assert.equal(completedOldData.selectedTier,16,'Save migration retains the chosen tier');
assert.equal(completedOldData.ascension.vanguard,8,'Save migration retains deep Ascension investments');
assert(completedOldData.milestones['16:20'],'Save migration retains claimed historical milestones');


// Alpha 0.9.0 Sovereign Oaths: permanent, earned, capped and actually change combat/economy.
const oathRows=[
 ['sovereignBlade','Sovereign Blade','',30,58,17,250,'power'],
 ['sovereignAegis','Sovereign Aegis','',35,58,20,1000,'fort'],
 ['sovereignTribute','Sovereign Tribute','',40,58,24,2500,'gold'],
 ['sovereignJudgment','Sovereign Judgment','',45,58,28,5000,'boss']
];
assert(hooks.oathUnlocked(oathRows[0]),'First Sovereign Oath unlocks with the Tier XVII Crest');
assert(!hooks.oathUnlocked(oathRows[1]),'Other Sovereign Oaths require individual Dominion milestones');
clickHub('power');clickSub('training');
const sovereignScreen=el('panelContent').innerHTML;
assert.equal((sovereignScreen.match(/data-sovereign-oath="/g)||[]).length,4,'All four Sovereign Oaths appear with permanent ranks');
assert(sovereignScreen.includes('Sovereign Blade')&&sovereignScreen.includes('Sovereign Judgment'),'Sovereign Oath names are visible');
p09.sigils+=250000;
let currentOathDamage=hooks.damage(),sigilsBeforeOath=p09.sigils;
clickButton({action:'oath:sovereignBlade'});
assert.equal(p09.sovereignOaths.sovereignBlade,1,'First Sovereign Blade rank is purchased');
assert(hooks.damage()>currentOathDamage,'Sovereign Blade changes actual hero damage');
assert(p09.sigils<sigilsBeforeOath,'Sovereign Oaths spend Primal Sigils');
const beforeIllegal=p09.sovereignOaths.sovereignAegis||0;
clickButton({action:'oath:sovereignAegis'});
assert.equal(p09.sovereignOaths.sovereignAegis||0,beforeIllegal,'Locked Sovereign Oath cannot be purchased');
hooks.rewardMilestone(20,1000);
assert(hooks.oathUnlocked(oathRows[1]),'Tier XX wave 1000 unlocks Sovereign Aegis');
const beforeAegis=hooks.maxWall();clickButton({action:'oath:sovereignAegis'});
assert(hooks.maxWall()>beforeAegis,'Sovereign Aegis increases actual fortress health');
hooks.rewardMilestone(24,2500);
assert(hooks.oathUnlocked(oathRows[2]),'Tier XXIV wave 2500 unlocks Sovereign Tribute');
const incomeRun=hooks.run();
incomeRun.tier=1;incomeRun.wave=69;incomeRun.phase='fighting';incomeRun.maxHealth=hooks.maxWall();incomeRun.health=incomeRun.maxHealth;
const incomeBefore=[p09.gold,p09.essence,p09.knowledge];hooks.completeWave();
const baselineIncome=[p09.gold-incomeBefore[0],p09.essence-incomeBefore[1],p09.knowledge-incomeBefore[2]];
clickButton({action:'oath:sovereignTribute'});
incomeRun.tier=1;incomeRun.wave=69;incomeRun.phase='fighting';incomeRun.maxHealth=hooks.maxWall();incomeRun.health=incomeRun.maxHealth;
const incomeAfterStart=[p09.gold,p09.essence,p09.knowledge];hooks.completeWave();
const boostedIncome=[p09.gold-incomeAfterStart[0],p09.essence-incomeAfterStart[1],p09.knowledge-incomeAfterStart[2]];
assert(boostedIncome[1]>baselineIncome[1]&&boostedIncome[2]>baselineIncome[2],'Sovereign Tribute increases Essence and Knowledge income');
hooks.rewardMilestone(28,5000);
assert(hooks.oathUnlocked(oathRows[3]),'Tier XXVIII wave 5000 unlocks Sovereign Judgment');
const testSiegeTarget=()=>({type:'ogre',hp:100000,max:100000,armor:20,dead:false,x:220,y:170,buildup:0,burn:0,slow:0});
const noOathBoss=testSiegeTarget();hooks.hurt(noOathBoss,1000,'ballista');
clickButton({action:'oath:sovereignJudgment'});
const oathBoss=testSiegeTarget();hooks.hurt(oathBoss,1000,'ballista');
assert(oathBoss.hp<noOathBoss.hp,'Sovereign Judgment increases attack damage against bosses and from stations');
p09.sovereignOaths.sovereignBlade=57;
const rankBeforeLast=p09.sigils;clickButton({action:'oath:sovereignBlade'});
assert.equal(p09.sovereignOaths.sovereignBlade,58,'Sovereign Oath final rank is attainable');
assert(p09.sigils<rankBeforeLast,'Final rank consumes exact Sigils');
const spentFinal=p09.sigils;clickButton({action:'oath:sovereignBlade'});
assert.equal(p09.sovereignOaths.sovereignBlade,58,'Sovereign Oath cannot exceed 58 ranks');
assert.equal(p09.sigils,spentFinal,'At max rank, Sovereign Oath cannot waste Sigils');
assert(JSON.parse(storedSave).sovereignOaths.sovereignBlade===58,'Sovereign Oaths persist to the existing save');

console.log('PASS: 10,000-wave chronicle, 30 tiers, waystones, Ascension routes, balance limits, original research, Forge, Gear, legacy and save migration.');