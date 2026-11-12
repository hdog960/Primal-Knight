// Alpha 0.10.8 — deterministic iPhone render pacing and legibility QA.
'use strict';
const { assetVersionAtLeast } = require('./asset-version.js');
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=fs.readFileSync('game.js','utf8'),css=fs.readFileSync('style.css','utf8'),html=fs.readFileSync('index.html','utf8');
function world(reducedMotion=false){
 const metrics={frames:0,shakes:0,requests:0};
 const canvas=new Proxy({
  createLinearGradient(){return{addColorStop(){}};},
  clearRect(){metrics.frames++;},
  translate(){metrics.shakes++;}
 },{get(obj,k){return k in obj?obj[k]:(()=>{});},set(obj,k,val){obj[k]=val;return true;}});
 class Element{
  constructor(id){this.id=id;this.style={};this.dataset={};this.className='';this.classList={add(){},remove(){},toggle(){}};
   this._html='';this.htmlWrites=0;this.textContent='';this.disabled=false;this.hidden=false;
   this.onclick=null;this.listeners={};this.width=960;this.height=540;this.scrollTop=0;}
  set innerHTML(v){this._html=v;this.htmlWrites++;}
  get innerHTML(){return this._html;}
  getContext(){return canvas;}
  addEventListener(t,cb){this.listeners[t]=cb;}
  querySelectorAll(){return [];}querySelector(){return null;}
 }
 const els=new Map(),el=id=>els.get(id)||(els.set(id,new Element(id)),els.get(id));
 class Image{constructor(){this.complete=true;this.naturalWidth=120;this.naturalHeight=120;this.src='';}}
 const document={getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false};
 const window={__PK_TEST__:true,addEventListener(){},matchMedia(){return{matches:reducedMotion};}};
 const sandbox={document,window,Image,Math,Date,localStorage:{getItem(){return null;},setItem(){},removeItem(){}},
  requestAnimationFrame(){metrics.requests++;},performance:{now:()=>2000},setTimeout(){return 0;},clearTimeout(){},
  console,confirm(){return true;},Blob,URL:{createObjectURL(){return 'blob:test';},revokeObjectURL(){}}};
 vm.runInNewContext(source,sandbox,{filename:'game.js'});
 assert(window.__PK_TEST_TOOLS__,'Actual game exposes timing hooks');
 return {h:window.__PK_TEST_TOOLS__,el,metrics,document,window};
}
const clock=world(),h=clock.h,run=h.run();
assert(Math.abs(h.drawInterval()-1000/12)<.001,'Idle battlefield now paints no more than 12Hz');
run.phase='intermission';run.rewardTimer=20;run.speed=1;
assert(Math.abs(h.drawInterval()-1000/60)<.001,'Active siege still targets at most 60 frames per second');
run.phase='ready';
assert.equal(clock.metrics.frames,0,'Startup schedules a frame rather than performing unnecessary initial paint');
// HUD resource cards should not be rebuilt six times each second when the numbers have not changed.
const resourceBox=clock.el('resources'),originalWrites=resourceBox.htmlWrites;
for(let i=0;i<30;i++)h.refreshHUD();
assert.equal(resourceBox.htmlWrites,originalWrites,'Unchanged mobile resource values avoid repeated DOM replacement');
h.p().gold+=25;h.refreshHUD();
assert.equal(resourceBox.htmlWrites,originalWrites+1,'Real earned Gold refreshes resource cards immediately');
h.refreshHUD();
assert.equal(resourceBox.htmlWrites,originalWrites+1,'Newly refreshed resources are cached');
// Rendering must not consume cosmetic effect lifetimes or simulation state.
run.phase='intermission';run.rewardTimer=10;run.speed=1;
run.particles=[{x:100,y:150,vx:30,vy:-20,life:1.5,max:1.5,color:'#e4cd9a',size:3}];
run.floats=[{x:140,y:180,text:'BOSS INTERRUPTED',color:'#ffe1ac',life:1.5}];
run.shakes=.18;run.flashes=.12;
const cosmeticBefore=JSON.stringify({particles:run.particles,floats:run.floats,shakes:run.shakes,flashes:run.flashes});
for(let i=0;i<8;i++)h.draw();
assert.equal(JSON.stringify({particles:run.particles,floats:run.floats,shakes:run.shakes,flashes:run.flashes}),cosmeticBefore,
 'Repeated high-refresh redraws do not accelerate particles, damage text, flashes or screen shake');
h.tick(.25);
assert(Math.abs(run.particles[0].life-1.25)<.00001,'Particles age using real simulated duration');
assert(Math.abs(run.particles[0].x-107.5)<.00001,'Particles move with elapsed duration');
assert(Math.abs(run.floats[0].y-(180-25.8*.25))<.0001,'Floating text moves at the same nominal 60Hz visual speed');
assert.equal(run.flashes,0,'Muzzle flash ends after 120ms regardless of refresh rate');
const pausedState=JSON.stringify({particle:run.particles[0],float:run.floats[0],shakes:run.shakes,clock:run.rewardTimer});
run.speed=0;h.tick(2);h.draw();
assert.equal(JSON.stringify({particle:run.particles[0],float:run.floats[0],shakes:run.shakes,clock:run.rewardTimer}),pausedState,
 'Pausing freezes cosmetic animation, screen shake and intermission time too');

const hi=world(),low=world();
function setup(w){
 const r=w.h.run();r.phase='intermission';r.rewardTimer=10;r.speed=1;
 r.particles=[{x:100,y:150,vx:24,vy:-25,life:1.5,max:1.5,color:'#aabbbb',size:3}];
 r.floats=[{x:140,y:180,text:'HIT',color:'#ffffff',life:1.5}];
 r.shakes=.9;r.flashes=.9;
}
setup(hi);setup(low);
for(let i=0;i<120;i++)hi.h.tick(1/120);
for(let i=0;i<30;i++)low.h.tick(1/30);
const fast=hi.h.run(),slow=low.h.run();
for(const key of ['life','x']){
 assert(Math.abs(fast.particles[0][key]-slow.particles[0][key])<.0001,'30Hz and 120Hz particle '+key+' match');
}
assert(Math.abs(fast.particles[0].y-slow.particles[0].y)<1,'Euler particle trajectory differs by under 1px across mobile refresh rates');
assert(Math.abs(fast.floats[0].life-slow.floats[0].life)<.0001,'30Hz and 120Hz floating text lasts the same game time');
assert(Math.abs(fast.floats[0].y-slow.floats[0].y)<.0001,'30Hz and 120Hz floating text moves the same distance');
assert(Math.abs(fast.rewardTimer-slow.rewardTimer)<.0001,'30Hz and 120Hz wave timer progression match');
// Actual RAF callbacks can run at 120+Hz without repainting 120 large canvas scenes.
const fps=world();fps.h.run().phase='intermission';fps.h.run().rewardTimer=30;fps.h.run().speed=1;
fps.h.loop(1000);assert.equal(fps.metrics.frames,1,'First frame is painted');
fps.h.loop(1008);assert.equal(fps.metrics.frames,1,'120Hz callback does not force repaint');
fps.h.loop(1017);assert.equal(fps.metrics.frames,2,'A new frame is painted after normal 60Hz interval');
fps.el('app').dataset.view='menu';
assert.equal(fps.h.drawInterval(),100,'Hidden-under-menu battlefield runs at 10Hz visual redraw rate');
fps.h.loop(1050);assert.equal(fps.metrics.frames,2,'Menu avoids unnecessary 30ms repaint');
fps.h.loop(1119);assert.equal(fps.metrics.frames,3,'Menu still refreshes the underlying battlefield periodically');
fps.document.hidden=true;assert.equal(fps.h.drawInterval(),Infinity,'Hidden Safari tab schedules no expensive canvas redraw');
fps.h.loop(1250);assert.equal(fps.metrics.frames,3,'Backgrounded page does not paint the canvas');
const reduce=world(true),reducedRun=reduce.h.run();
reducedRun.phase='intermission';reducedRun.rewardTimer=30;reducedRun.speed=1;
assert(Math.abs(reduce.h.drawInterval()-1000/30)<.001,'Active system reduced motion caps the visual presentation to 30Hz');
reducedRun.shakes=.2;reducedRun.flashes=.1;
reduce.h.draw();assert.equal(reduce.metrics.shakes,0,'Reduced motion suppresses battlefield camera shake');
// Static CSS coverage checks new rules without claiming physical iPhone device testing.
assert(css.includes('(orientation:portrait) and (max-width:540px)'),'Compact iPhone portrait rules exist');
assert(css.includes('.hud-top{display:grid;grid-template-columns:repeat(3,minmax(0,1fr))'),'Mobile HUD prevents the three resource blocks from overflowing narrow viewports');
assert(css.includes('.fight-actions button{min-height:44px;min-width:44px'),'Portrait battle controls meet 44px touch target guidance');
assert(css.includes('.encounter-ribbon .encounter-goal,.encounter-ribbon .encounter-hint{font-size:10px'),'Objective and attack warnings have larger text');
assert(html.includes('ALPHA 0.15.27')&&assetVersionAtLeast(html,'game.js','0.15.27'),'Release assets are cache-busted for Safari and Home Screen updates');
console.log('PASS: Alpha 0.10.8 time-independent VFX, visual pause, 120/60/30Hz frame pacing, low-refresh menu and background behavior, DOM resource cache and iPhone HUD CSS.');


// Alpha 0.10.9 — battle controls must not contradict the actual pause state.
const phone=world(),battle=phone.h,active=battle.run(),pauseButton=phone.el('pauseButton'),speedButton=phone.el('speedButton'),pausedLabel=phone.el('battlePauseStatus');
battle.enterSiege();
assert.equal(active.phase,'fighting','Mobile control test uses a real started siege');
assert.equal(speedButton.textContent,'1×','A fresh battle shows normal speed');
assert.equal(pausedLabel.hidden,true,'Pause banner is hidden while combat runs');
assert.equal(battle.toggleBattlePause(),true,'Pause action actually stops active siege');
assert.equal(active.speed,0,'Paused combat has zero simulation speed');
assert.equal(pauseButton.textContent,'▶','Pausing visibly presents resume icon');
assert.equal(pauseButton.ariaPressed,'true','Pause controls expose their pressed state accessibly');
assert.equal(pausedLabel.hidden,false,'Player sees an unmistakable paused state');
const timeBeforePause=active.time,spawnBeforePause=active.spawned,playtimeBeforePause=battle.p().battleSeconds;
battle.cycleBattleSpeed();
assert.equal(active.speed,0,'Tapping speed while paused cannot secretly resume combat');
assert.equal(speedButton.textContent,'2×','Speed button displays chosen resume speed even when paused');
battle.tick(25);
assert.equal(active.time,timeBeforePause,'Pausing freezes battle timers despite speed selection');
assert.equal(active.spawned,spawnBeforePause,'Pause still prevents enemy spawning');
assert.equal(battle.p().battleSeconds,playtimeBeforePause,'Pause cannot generate playtime progression');
assert.equal(battle.toggleBattlePause(),false,'Resume action clears paused state');
assert.equal(active.speed,2,'Resuming applies the 2× speed picked during pause');
assert.equal(pauseButton.textContent,'Ⅱ','Active combat shows the pause icon again');
assert.equal(pauseButton.ariaPressed,'false','Pressed accessibility state clears on resume');
assert.equal(pausedLabel.hidden,true,'Pause banner disappears when battle resumes');
battle.tick(.35);
assert(active.spawned>spawnBeforePause,'Resumed 2× combat progresses normally');

battle.pauseBattleInBackground();
assert.equal(active.speed,0,'Switching away from Safari pauses running battle');
assert.equal(pausedLabel.hidden,false,'Automatic background pause is visibly reflected');
battle.toggleBattlePause();
assert.equal(active.speed,2,'Foreground return resumes the correct chosen speed');
battle.retreatFromSiege();
battle.enterSiege();
assert.equal(active.speed,2,'A fresh siege never inherits a stale paused state from prior run');
active.phase='intermission';active.rewardTimer=1.0;
battle.pauseBattleInBackground();
assert.equal(active.speed,0,'Backgrounding during a between-wave countdown pauses too');
battle.tick(30);
assert.equal(active.rewardTimer,1.0,'Backgrounded intermission does not auto-launch the next wave');
battle.toggleBattlePause();
assert.equal(active.speed,2,'Intermission resumes at remembered 2× speed');
battle.tick(.1);
assert(active.rewardTimer<1.0,'Intermission advances again after manual resume');
active.phase='fallen';battle.syncBattleControls();
assert.equal(pausedLabel.hidden,true,'Paused indicator cannot remain over the fallen/lobby view');

// Live boss countdown meter tracks real combat states and hides when counterplay ends.
const worldBoss=world(),bh=worldBoss.h,br=bh.run();
br.tier=1;br.wave=200;br.phase='fighting';br.encounter=bh.encounterDirector(200,1);
const caster={type:'warlord',isBoss:true,dead:false,hp:500,max:1000,bossPhase:2,bossStyle:'ember',
 bossFuryWindup:.45,bossFurySurge:0,bossWardTimer:0,bossBlinkWindup:0};
br.enemies=[caster];bh.refreshHUD();
const castTrack=worldBoss.el('bossCastTrack'),castFill=worldBoss.el('bossCastFill'),castLabel=worldBoss.el('bossCastLabel');
assert.equal(castTrack.hidden,false,'Real Ember charge displays the attack countdown meter');
assert(castLabel.textContent.includes('EMBER CHARGE'),'Attack meter identifies the actual boss ability');
assert.equal(castFill.style.width,'50%','Half-complete charge displays 50% filled countdown');
assert.equal(worldBoss.el('bossWarning').textContent,'EMBER CHARGE · INTERRUPT','Major boss instruction remains visible');
caster.bossFuryWindup=0;caster.bossExposedTimer=1.3;bh.refreshHUD();
assert.equal(castTrack.hidden,true,'Interrupted attacks no longer display a phantom countdown');
assert(worldBoss.el('bossWarning').textContent.includes('EXPOSED'),'HUD switches to true exposed bonus after interrupt');

br.wave=100;br.encounter=bh.encounterDirector(100,1);
caster.bossStyle='iron';caster.bossExposedTimer=0;caster.bossWardTimer=2.2;
bh.refreshHUD();
assert.equal(castTrack.hidden,false,'Iron defensive stance has a visible lifetime');
assert.equal(castFill.style.width,'100%','Active ward begins at full remaining duration');
assert.equal(castTrack.dataset.ward,'true','Ward countdown is visibly distinguished from attacking windups');
caster.bossWardTimer=1.1;bh.refreshHUD();
assert.equal(castFill.style.width,'50%','Ward bar shrinks as the protective state expires');

br.wave=25;br.encounter=bh.encounterDirector(25,1);
br.enemies=[{type:'siegebeast',isBoss:true,dead:false,hp:400,max:500,crushWindup:.55,bossExposedTimer:0}];
bh.refreshHUD();
assert.equal(castTrack.hidden,false,'Siege Beast crusher has a real telegraph timeline');
assert.equal(castFill.style.width,'50%','Crusher countdown reflects its 1.1-second windup');
assert(castLabel.textContent.includes('CRUSHER STRIKE'),'Siege Beast ability is labelled');
br.enemies=[];bh.refreshHUD();
assert.equal(castTrack.hidden,true,'Countdown hides when boss dies or leaves the field');
br.phase='ready';bh.refreshHUD();
assert.equal(worldBoss.el('bossHud').hidden,true,'Major boss HUD does not linger after a battle');
assert(css.includes('.boss-cast-track[hidden],.battle-paused[hidden]'),'Boss meter and pause panel hide cleanly');
assert(css.includes('.boss-cast-track[data-ward="true"]'),'Defensive ward has its own timer treatment');
assert(html.includes('id="bossCastTrack"')&&html.includes('id="battlePauseStatus"'),'Real game HTML includes battle pause and boss timer');
console.log('PASS: Alpha 0.10.9 pause-safe 1×/2× selection, background/intermission pause, clear state accessibility, live Ember/ward/crusher countdowns, and automatic HUD recovery.');

// First Watch hero-cloak visual regression: the animation is drawn from live
// combat/chill state and reduced-motion preference, without persistent fields.
assert(source.includes("const chilled=run.heroChill>0;"),'Defender cloak reacts to real hero chill');
assert(source.includes("const capeSwing=moving?Math.sin(run.time*(chilled?1.2:3.1))*2.5:0;"),'Reduced-motion disables cape sway');
assert(source.includes("const capeKick=phase==='release'?5:phase==='followthrough'?-3:0;"),'Cloak responds to real attack poses');
assert(source.includes("ctx.fillStyle=chilled?'#648ea4':'#7b3444';"),'Chill changes the cloak palette');

// First Watch grounded marching animation remains a bounded render-only
// effect, keyed to existing wobble and omitted for reduced-motion players.
assert(source.includes("const pace=mass?.85:caster?1.1:1.7;"),'Marching cadence distinguishes heavy and caster units');
assert(source.includes("const step=Math.sin(e.wobble*pace),contact=Math.abs(step);"),'Alternating footfalls follow existing enemy motion');
assert(source.includes("if(contact>.84&&!caster){"),'Dust is bounded to planted non-caster footsteps');
assert(source.includes("if(!reduceMotion&&run.phase==='fighting'&&e.y<370){"),'Marching effects respect reduced motion and battle state');
