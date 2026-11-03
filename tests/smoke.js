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
clickHub('hero');assert(el('panelTitle').textContent==='THE WARDEN');
clickSub('skills');assert(el('panelContent').innerHTML.includes('PATHS')||el('panelContent').innerHTML.includes('Hunter'));
clickButton({school:'Arcanist'});assert(el('panelContent').innerHTML.includes('Winter Touch'));
clickHub('power');assert(el('panelContent').innerHTML.includes('Might'));
assert(el('panelContent').innerHTML.includes('Siegebreaker'),'Legacy mastery is displayed');
clickButton({action:'legacy:siegebreaker'});assert(hooks.p().legacy.siegebreaker===1);
clickButton({trainFilter:'Economy'});assert(el('panelContent').innerHTML.includes('Greed'));
clickButton({trainFilter:'All'});clickButton({action:'train:power'});
assert(storedSave&&JSON.parse(storedSave).training.power===1,'Essence purchases persist');
clickSub('research');assert(el('panelContent').innerHTML.includes('Royal Treasury'));
clickHub('gear');assert(el('panelContent').innerHTML.includes('Recurve Bow'));
clickSub('runes');clickButton({socketSlot:'weapon'});assert(el('panelContent').innerHTML.includes('rune-picker'));
clickButton({socketRune:'weapon:seedember'});assert(JSON.parse(storedSave).socketed.weapon==='seedember');
clickHub('fortress');assert(el('panelContent').innerHTML.includes('Ironwood Ballista'));
clickSub('suppression');assert(el('panelContent').innerHTML.includes('Weakening Sigils'));
clickHub('battle');assert.equal(el('tierLobby').hidden,true,'Ongoing run continues when browsing menus');
el('exitRunButton').onclick();assert.equal(el('tierLobby').hidden,false);
el('tierGrid').listeners.click({target:{closest:()=>({dataset:{tier:'2'},disabled:false})}});
assert(el('tierHeading').textContent.includes('TIER II'));
el('launchTierButton').onclick();assert.equal(hooks.run().tier,2);
assert.equal(hooks.run().wave,1);
console.log('PASS: tier selection, continuous waves, milestones, tier unlocks, no double rewards, legacy, 5 hubs, rune sockets and save.');