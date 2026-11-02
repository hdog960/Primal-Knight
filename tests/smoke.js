// Alpha 0.3: no-DOM smoke tests for battle loop, five hub navigation,
// eight functional advancement screens and permanent saves.
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
const sandbox={Image:MockImage,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem(){return null},setItem(k,v){storedSave=v}},requestAnimationFrame(fn){nextFrame=fn},performance:{now:()=>1000},setTimeout:()=>0,clearTimeout(){},console,Math,Date,Blob,URL:{createObjectURL(){return'blob:demo'},revokeObjectURL(){}},prompt(){throw Error('Native text prompt must not be used for rune selection')},confirm(){return true}};
vm.runInNewContext(fs.readFileSync('game.js','utf8'),sandbox,{filename:'game.js'});
const clickHub=hub=>el('nav').listeners.click({target:{closest:()=>({dataset:{hub}})}});
const clickSub=tab=>el('subnav').listeners.click({target:{closest:()=>({dataset:{subtab:tab}})}});
const clickButton=ds=>el('panelContent').listeners.click({target:{closest:()=>({dataset:ds,disabled:false})}});
assert(nextFrame,'frame should be scheduled');nextFrame(16);
assert(el('resources').innerHTML.includes('GOLD'));
el('startButton').onclick();assert.equal(el('startButton').disabled,true);
for(let f=1;f<240;f++)nextFrame(f*18);
assert(el('wallText').textContent.includes(' / '));
clickHub('hero');assert(el('panelTitle').textContent==='THE WARDEN');assert(!el('panel').hidden);
clickSub('skills');assert(el('panelContent').innerHTML.includes('PATHS')||el('panelContent').innerHTML.includes('Hunter'));
clickButton({school:'Arcanist'});assert(el('panelContent').innerHTML.includes('Winter Touch'));
clickHub('power');assert(el('panelContent').innerHTML.includes('Might'));
clickButton({trainFilter:'Economy'});assert(el('panelContent').innerHTML.includes('Greed'));
clickButton({trainFilter:'All'});clickButton({action:'train:power'});
assert(storedSave&&JSON.parse(storedSave).training.power===1,'Essence purchases should persist');
clickSub('research');assert(el('panelContent').innerHTML.includes('Royal Treasury'));
clickHub('gear');assert(el('panelContent').innerHTML.includes('Recurve Bow'));
clickButton({gearFilter:'weapon'});assert(el('panelContent').innerHTML.includes('Recurve Bow'));
clickSub('runes');clickButton({socketSlot:'weapon'});assert(el('panelContent').innerHTML.includes('rune-picker'));
clickButton({socketRune:'weapon:seedember'});
assert(JSON.parse(storedSave).socketed.weapon==='seedember','Inline rune selection must save');
clickHub('fortress');assert(el('panelContent').innerHTML.includes('Ironwood Ballista'));
clickSub('suppression');assert(el('panelContent').innerHTML.includes('Weakening Sigils'));
el('settingsButton').onclick();assert.equal(el('panelTitle').textContent,'SETTINGS & SAVES');
el('closePanel').onclick();assert(el('panel').hidden);
for(let f=240;f<1000;f++)nextFrame(f*30);
console.log('PASS: combat, 5 hubs, 8 progression screens, filters, rune picker, save, settings.');