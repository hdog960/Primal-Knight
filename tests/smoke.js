// Alpha 0.4: Tier lobby, continuous waves, persistent rewards, tier progression,
// skills, legacy purchases, save and menu navigation, with no browser dependencies.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
let nextFrame=null,storedSave=null;
const canvasContext=new Proxy({createLinearGradient(){return{addColorStop(){}}}}, {get(obj,key){return obj[key]||(()=>{});},set(obj,key,val){obj[key]=val;return true;}});
class Element{
 constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.classList={add(){},remove(){},toggle(){}};this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;this.onclick=null;this.listeners={};this.width=960;this.height=540;this.scrollTop=0;}
 getContext(){return canvasContext}addEventListener(type,cb){this.listeners[type]=cb}
 querySelectorAll(){return[]}querySelector(){return null}
}
const elements=new Map(),el=id=>elements.get(id)||(elements.set(id,new Element(id)),elements.get(id));
class MockImage{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
let testMode=true;
const sandbox={__testMode:testMode,Image:MockImage,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},window:{__PK_TEST__:true,addEventListener(){}},localStorage:{getItem(){return null},setItem(k,v){storedSave=v}},requestAnimationFrame(fn){nextFrame=fn},performance:{now:()=>1000},setTimeout:()=>0,clearTimeout(){},console,Math,Date,Blob,URL:{createObjectURL(){return'blob:demo'},revokeObjectURL(){}},confirm(){return true}};
vm.runInNewContext(fs.readFileSync('game.js','utf8'),sandbox,{filename:'game.js'});
const hooks=sandbox.window.__PK_TEST_TOOLS__,clickHub=hub=>el('nav').listeners.click({target:{closest:()=>({dataset:{hub}})}}),clickSub=tab=>el('subnav').listeners.click({target:{closest:()=>({dataset:{subtab:tab}})}}),clickButton=ds=>el('panelContent').listeners.click({target:{closest:()=>({dataset:ds,disabled:false})}});
assert(hooks&&nextFrame,'Game initialized with test hooks and game loop');
assert.equal(el('tierLobby').hidden,false,'Pregame tier selection shown');
assert(el('tierGrid').innerHTML.includes('TIER XII'),'Twelve difficulty choices available');
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
assert(el('waveName').textContent.includes('ENDLESS'),'No fixed stage cap');
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
const sigils=hooks.p().sigils;hooks.renderTierLobby();assert(el('tierGrid').innerHTML.includes('BEST WAVE 20'));
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
clickHub('power');assert(el('panelContent').innerHTML.includes('Might'));
assert(el('panelContent').innerHTML.includes('Siegebreaker'),'Legacy mastery is displayed');
clickButton({action:'legacy:siegebreaker'});assert(hooks.p().legacy.siegebreaker===1);
clickButton({trainFilter:'Economy'});assert(el('panelContent').innerHTML.includes('Greed'));
clickButton({trainFilter:'All'});clickButton({action:'train:power'});
assert(storedSave&&JSON.parse(storedSave).training.power===1,'Essence purchases persist');
clickSub('research');assert(el('panelContent').innerHTML.includes('Royal Treasury'));
clickHub('gear');assert(el('panelContent').innerHTML.includes('Leather Cowl'));
clickSub('runes');clickButton({socketSlot:'helm'});assert(el('panelContent').innerHTML.includes('rune-picker'));
clickButton({socketRune:'helm:seedember'});assert(JSON.parse(storedSave).socketed.helm==='seedember');
clickHub('fortress');assert(el('panelContent').innerHTML.includes('Ironwood Ballista'));
clickSub('suppression');assert(el('panelContent').innerHTML.includes('Weakening Sigils'));
clickHub('battle');assert.equal(el('tierLobby').hidden,true,'Ongoing run continues when browsing menus');
el('exitRunButton').onclick();assert.equal(el('tierLobby').hidden,false);
el('tierGrid').listeners.click({target:{closest:()=>({dataset:{tier:'2'},disabled:false})}});
assert(el('tierHeading').textContent.includes('TIER II'));
el('launchTierButton').onclick();assert.equal(hooks.run().tier,2);
assert.equal(hooks.run().wave,1);
// Alpha 0.6 regression: Diablo-style body slots, inventory drawer and gear salvage.
clickHub('gear');clickSub('equipment');
assert(el('panelContent').innerHTML.includes('armory-hero-stage'),'Armory shows the front-facing hero');
for(const slot of ['helm','amulet','chest','legs','boots','gauntlets','charm','ring1','ring2','ring3','ring4'])assert(el('panelContent').innerHTML.includes('data-gear-slot="'+slot+'"'),'Body-positioned '+slot+' slot');
clickButton({gearSlot:'helm'});
assert.equal(el('armoryDrawer').hidden,false,'Tapped slot opens inventory drawer');
assert(el('armoryDrawer').innerHTML.includes('SORTED BY RARITY'));
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
console.log('PASS: tier selection, endless battle, milestones, legacy, five hubs, armory slots, rarity selling, undo, protected equipped gear, runes and saves.');