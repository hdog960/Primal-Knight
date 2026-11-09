// Alpha 0.15.28 — exact battlefield weather in Atlas image and native PNG exports.
'use strict';
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const js=fs.readFileSync('game.js','utf8');
const html=fs.readFileSync('index.html','utf8'),css=fs.readFileSync('style.css','utf8');
const png='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADElEQVR42mP8/5+hHgAHggJ/PX4csgAAAABJRU5ErkJggg==';
function create(reduceMotion=false){
 const store=Object.create(null),nodes=new Map(),draws=[],downloads=[];
 let images=0;
 class El{
  constructor(id){this.id=id;this.style={};this.dataset={};this.attrs={};this.listeners={};
   this.hidden=['worldAtlas','atlasMatte','atlasWeather','atlasBossStage','atlasHeraldry','deviceCheckPanel'].includes(id);
   this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;
   this.innerHTML='';this.textContent='';this.disabled=false;this.scrollTop=0;
   this.width=960;this.height=540;this.className='';
   this.classList={add(){},remove(){},toggle(){}}}
  getContext(){return new Proxy({createLinearGradient(){return{addColorStop(){}}}},{
   get(o,k){return o[k]||(()=>{})},set(o,k,v){o[k]=v;return true}})}
  setAttribute(k,v){this.attrs[k]=String(v)}
  removeAttribute(k){if(k==='src')this.src='';else delete this.attrs[k]}
  addEventListener(k,v){this.listeners[k]=v}
  querySelectorAll(){return[]}
  getBoundingClientRect(){return{width:320,height:180}}
  focus(){}
 }
 const el=id=>nodes.get(id)||(nodes.set(id,new El(id)),nodes.get(id));
 class Image{constructor(){images++;this.src='';this.complete=true;this.naturalWidth=960;this.naturalHeight=540;}}
 const sandbox={Math,Image,Date,Blob,console,confirm(){return true},
  window:{__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:reduceMotion}}},
  document:{getElementById:el,querySelectorAll(){return[]},addEventListener(){},hidden:false,
   createElement(tag){
    if(tag==='canvas')return{width:0,height:0,getContext(){return{drawImage(img,...args){draws.push([img.id,...args]);}}},
     toDataURL(mime){assert.equal(mime,'image/png');return png}};
    if(tag==='a'){const a={href:'',download:'',click(){a.clicked=true}};downloads.push(a);return a;}
    throw Error(tag);
   }},
  localStorage:{getItem(k){return store[k]??null},setItem(k,v){store[k]=String(v)},removeItem(k){delete store[k]}},
  performance:{now(){return 1000}},setTimeout(){return 0},clearTimeout(){},requestAnimationFrame(){},
  URL:{createObjectURL(){return'blob:test'},revokeObjectURL(){}}};
 vm.runInNewContext(js,sandbox,{filename:'game.js'});
 return{h:sandbox.window.__PK_TEST_TOOLS__,el,store,draws,downloads,images:()=>images};
}
async function main(){
 assert(html.includes('ALPHA 0.15.28')&&html.includes('game.js?v=0.15.28')&&html.includes('style.css?v=0.15.28'));
 assert(html.indexOf('id="atlasMatte"')<html.indexOf('id="atlasWeather"'));
 assert(html.indexOf('id="atlasWeather"')<html.indexOf('id="atlasBossStage"'));
 assert(html.indexOf('id="atlasBossStage"')<html.indexOf('id="atlasForeground"'));
 assert(html.includes('id="atlasWeatherToggle"')&&html.includes('aria-pressed="false"'));
 assert(html.includes('id="atlasWeatherStatus"')&&html.includes('aria-live="polite"'));
 assert(css.includes('.atlas-scene img[hidden]{display:none!important}'),
  'Off/compare/closed artwork layers must truly disappear in Safari');
 assert(css.includes('.atlas-weather-controls button')&&css.includes('min-height:44px'));
 const {h,el,store,draws,downloads}=create(),p=h.p(),before=JSON.stringify(p);
 assert.equal(h.toggleAtlasWeather(),false,'The weather switch cannot work outside Atlas');
 assert.equal(h.openWorldAtlas(2),true);
 assert.equal(h.atlasWeatherSnapshot().enabled,false);
 assert.equal(el('atlasWeather').hidden,true);
 assert.equal(el('atlasWeather').src,'','Preview OFF creates no SVG');
 assert.equal(h.atlasExportFilename(),'primal-knight-atlas-tier-02-realm.png');
 assert.equal(typeof el('atlasWeatherToggle').listeners.click,'function');
 const original=await h.shareAtlasArtwork();
 assert.equal(original,true);
 assert.deepEqual(draws.map(x=>x[0]),['atlasBase','atlasMatte','atlasForeground','atlasHeraldry']);
 assert.equal(h.toggleAtlasWeather(),true);
 assert.equal(h.atlasWeatherSnapshot().enabled,true);
 assert.equal(el('atlasWeather').hidden,false);
 assert.equal(el('atlasWeatherToggle').attrs['aria-pressed'],'true');
 assert.equal(el('atlasWeatherToggle').textContent,'HIDE WEATHER');
 assert(el('atlasWeatherStatus').textContent.includes('STATIC BATTLE SAMPLE'));
 assert.equal(h.atlasExportFilename(),'primal-knight-atlas-tier-02-realm-weather.png');
 assert(el('atlasWeather').src.startsWith('data:image/svg+xml;charset=utf-8,'));
 draws.length=0;
 assert.equal(await h.shareAtlasArtwork(),true);
 assert.deepEqual(draws.map(x=>x[0]),['atlasBase','atlasMatte','atlasWeather','atlasForeground','atlasHeraldry'],
  'Export includes weather at the exact battlefield depth');
 assert.deepEqual(draws[2].slice(1),[0,0,960,540]);
 assert.equal(downloads.at(-1).download,'primal-knight-atlas-tier-02-realm-weather.png');
 const sampled=decodeURIComponent(el('atlasWeather').src.split(',')[1]);
 assert.equal(sampled,h.atlasWeatherSvg(2,12),'Atlas uses real battle draw state, not a separate invented image');
 assert.equal((sampled.match(/<rect /g)||[]).length,1+h.territoryWeatherCount(h.territoryVista(2).weather));
 assert(sampled.includes(h.territoryVista(2).tint),'Atlas captures real sky tint');
 const savedImages=el('atlasWeather').src;
 assert.equal(h.toggleAtlasZoom(),true);
 assert.equal(el('atlasWeather').src,savedImages,'Zoom never regenerates a weather bitmap');
 assert.equal(h.chooseAtlasBossStyle('rift'),true);
 assert.equal(h.toggleAtlasBossPhase(),true);
 draws.length=0;
 assert.equal(await h.shareAtlasArtwork(),true);
 assert.deepEqual(draws.map(x=>x[0]),['atlasBase','atlasMatte','atlasWeather','atlasBossStage','atlasForeground','atlasHeraldry']);
 assert.equal(h.atlasExportFilename(),'primal-knight-atlas-tier-02-rift-phase-ii-weather.png');
 assert.equal(h.toggleAtlasComparison(),true);
 assert.equal(el('atlasWeather').hidden,true,'Original art mode hides new battle weather');
 draws.length=0;
 assert.equal(await h.shareAtlasArtwork(),true);
 assert.deepEqual(draws.map(x=>x[0]),['atlasBase','atlasForeground']);
 assert.equal(h.atlasExportFilename(),'primal-knight-atlas-tier-02-original.png');
 assert.equal(h.toggleAtlasComparison(),true);
 assert.equal(el('atlasWeather').hidden,false,'Comparison restores weather without changing selected sky');
 assert.equal(el('atlasWeather').src,savedImages,'Compare switch never re-encodes sky');
 assert.equal(h.stepWorldAtlas(1),true);
 assert.equal(h.atlasWeatherSnapshot().tier,3);
 assert.notEqual(el('atlasWeather').src,savedImages,'Each new realm receives its actual own battle weather');
 const signatures=new Set(),samples=new Set();
 for(let tier=1;tier<=30;tier++){
  const profile=h.territoryVista(tier),svg=h.atlasWeatherSvg(tier,12);
  assert(svg.startsWith('<svg ')&&svg.endsWith('</svg>'));
  assert(svg.length<7500,'Weather SVG is tiny, not a framebuffer');
  assert(svg.includes('viewBox="0 0 960 540"'));
  assert(svg.includes(profile.tint));
  assert(svg.includes(profile.particleColor));
  assert(!/<script|<foreignObject|<image|<iframe|NaN|undefined/i.test(svg));
  assert.equal((svg.match(/<rect /g)||[]).length,1+h.territoryWeatherCount(profile.weather));
  assert.equal(svg,h.atlasWeatherSvg(tier,12),'12s sample is deterministic');
  const shapes=[],recorder={save(){},restore(){},set fillStyle(v){this.paint=v},
   fillRect(x,y,w,h){shapes.push([x,y,w,h,this.paint])}};
  h.drawTerritoryAtmosphere(recorder,12,tier,false);
  assert.equal(shapes.length,1+h.territoryWeatherCount(profile.weather));
  for(const [x,y,w,height,fill]of shapes)
   assert(svg.includes('<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+height+'" fill="'+fill+'"/>'),
    'Every generated SVG mark equals an actual combat weather canvas instruction');
  signatures.add(profile.weather);samples.add(svg);
 }
 assert.equal(signatures.size,8,'All eight regional weather families are visible');
 assert.equal(samples.size,30,'Every realm receives its own deterministic weather layout');
 const beforeNew=h.atlasWeatherSvg(3,12);
 assert.equal(h.setVisualQuality('saver'),true);
 const lighter=h.atlasWeatherSvg(3,12);
 assert(lighter.length<beforeNew.length,'Lower quality profile reduces rain/snow/ash effects');
 assert.equal(h.toggleAtlasWeather(),false);
 assert.equal(el('atlasWeather').hidden,true);
 assert.equal(el('atlasWeather').src,'','Turning off releases data URL immediately');
 assert.equal(h.closeWorldAtlas(),true);
 assert.equal(el('atlasWeather').dataset.weatherKey,'','Close clears old cache keys');
 assert.equal(h.openWorldAtlas(30),true);
 assert.equal(h.atlasWeatherSnapshot().enabled,false,'Reopen cannot resurrect old weather');
 assert.equal(el('atlasWeather').src,'');
 assert.equal(h.closeWorldAtlas(),true);
 assert.equal(JSON.stringify(p),before,'Weather art never changes currency, gear, tiers or progression');
 assert.equal(store.primal_knight_onslaught_save_v1,undefined,'No save writes from weather display or export');
 const reduced=create(true),H=reduced.h;
 assert.equal(H.openWorldAtlas(17),true);
 assert.equal(H.toggleAtlasWeather(),true);
 const still=decodeURIComponent(reduced.el('atlasWeather').src.split(',')[1]);
 assert.equal((still.match(/<rect /g)||[]).length,1,'System Reduce Motion renders static tint only');
 assert(still.includes(H.territoryVista(17).tint));
 assert.equal(reduced.store.primal_knight_onslaught_save_v1,undefined);
 console.log('PASS: same battle weather renderer, 30 realm samples/8 families, exact 960x540 SVG and PNG depth, compare, zoom, boss Phase II, export naming, low visual presets, reduced motion, Safari [hidden], save safety.');
 console.log('LIMIT: visual quality, Share Sheet behavior and thermal metrics still require actual iPhone testing.');
}
main().catch(e=>{console.error(e);process.exitCode=1});
