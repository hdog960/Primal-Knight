// DOM-free smoke test for data/setup/combat loop; not a substitute for browser testing.
const fs=require('fs'),vm=require('vm'),assert=require('assert');
const callbacks={};let nextFrame=null;
const canvasContext=new Proxy({createLinearGradient(){return{addColorStop(){}}}}, {get(obj,key){return obj[key]||(()=>{});},set(obj,key,val){obj[key]=val;return true;}});
class Element{constructor(id){this.id=id;this.style={};this.dataset={};this.classList={add(){},remove(){},toggle(){}};this.innerHTML='';this.textContent='';this.disabled=false;this.hidden=false;this.onclick=null;this.listeners={};this.width=960;this.height=540;}getContext(){return canvasContext}addEventListener(type,cb){this.listeners[type]=cb}querySelectorAll(){return[]}querySelector(){return null}}
let els=new Map();const el=id=>els.get(id)||(els.set(id,new Element(id)),els.get(id));
class MockImage{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src=''}}
const sandbox={Image:MockImage,document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){}},window:{addEventListener(){}},localStorage:{getItem(){return null},setItem(){}},requestAnimationFrame(fn){nextFrame=fn},performance:{now:()=>1000},setTimeout:()=>0,clearTimeout(){},console,Math,Date,Blob,URL:{createObjectURL(){return'blob:demo'},revokeObjectURL(){}},prompt(){return null},confirm(){return true}};
vm.runInNewContext(fs.readFileSync('game.js','utf8'),sandbox,{filename:'game.js'});
assert(nextFrame,'game loop should schedule a frame');
nextFrame(16); assert(el('resources').innerHTML.includes('GOLD'));
el('startButton').onclick();assert.equal(el('startButton').disabled,true);
for(let f=1;f<240;f++)nextFrame(f*18);
assert(el('wallText').textContent.includes(' / '));assert(el('heroTag').innerHTML.includes('LEVEL'));
el('settingsButton').onclick();assert.equal(el('panelTitle').textContent,'SETTINGS');assert(!el('panel').hidden);
el('closePanel').onclick();assert(el('panel').hidden);
const tabs=['hero','skills','equipment','runes','stations','research','training','suppression'];
for(const t of tabs){const b=new Element('b');b.dataset.tab=t;el('nav').listeners.click({target:{closest:()=>b}});assert(el('panelContent').innerHTML.length>50,`${t} renders`)}
el('closePanel').onclick(); for(let f=240;f<3000;f++)nextFrame(f*50);
console.log('PASS: setup, combat, eight upgrade screens. Status:',el('startButton').textContent,'Wall:',el('wallText').textContent,'Wave:',el('waveName').textContent);
