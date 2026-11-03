/* Primal KnIght - Onslaught — Alpha 0.6. Character armory, equipment wardrobe and safe gear selling. Zero external dependencies.
   Original game, systems and art. All spending uses earned in-game currencies.
*/
(()=>{'use strict';
const $=id=>document.getElementById(id),fmt=n=>{n=Math.max(0,Math.floor(n));return n>=1e12?(n/1e12).toFixed(2)+'T':n>=1e9?(n/1e9).toFixed(2)+'B':n>=1e6?(n/1e6).toFixed(2)+'M':n>=1e4?(n/1e3).toFixed(1)+'K':n.toLocaleString()},clamp=(v,a,b)=>Math.min(b,Math.max(a,v)),rnd=(a,b)=>a+Math.random()*(b-a);
const training=[
 ['power','Might','Base damage increases by 2 per rank.',8,1.125,1200],['haste','Reflexes','Attack interval decreases over time.',8,1.155,500],['fort','Fortitude','Maximum fortress health increases by 12.',10,1.12,1000],['crit','Precision','Improves critical strike chance.',18,1.16,220],['critDmg','Lethality','Increases critical damage.',19,1.15,500],['pierce','Armor Pierce','Ignore a portion of enemy armor.',18,1.15,250],['regen','Stone Mending','Fortress regenerates between volleys.',24,1.16,500],['gold','Greed','Increase gold earned from slain enemies.',12,1.14,1500],['xp','Scholarship','Gain more hero experience from battle.',14,1.16,800],['essence','Attunement','Increase Hero Essence earned per wave.',30,1.17,600],['range','Longshot','Increase projectile travel speed.',14,1.15,350],['multishot','Splitshot','Every 8th rank adds an extra attack projectile.',55,1.22,40],['boss','Executioner','Increase damage dealt to bosses.',43,1.18,500],['loot','Treasure Sense','Improves drop chances after completed waves.',32,1.19,180],['resist','Rampart','Reduce damage enemies inflict on the wall.',43,1.18,200],['shock','Static Charge','Every rank boosts chance of a chain lightning effect.',66,1.2,150]
];
const skills={
 Marksman:[['aim','Hunter’s Eye','Damage +6% per rank'],['quiver','Endless Quiver','Attack speed +5% per rank'],['penetrate','Barbed Volley','Armor penetration +4% per rank'],['double','Double Draw','Every rank adds a chance for a second attack'],['focus','Deadeye','Critical damage +20% per rank'],['storm','Arrowstorm','Volley attacks strike adjacent enemies']],
 Arcanist:[['ember','Ember Arrows','Attacks ignite enemies for damage over time'],['frost','Winter Touch','Chance to slow incoming enemies'],['spark','Storm Call','Chance to chain lightning'],['inferno','Inferno','Burns spread between enemies'],['hail','Glacial Heart','Slow effects become stronger'],['tempest','Tempest','Lightning strikes an additional foe']],
 Guardian:[['stone','Stonewall','Fortress health +8% per rank'],['mend','Field Repairs','Fortress regenerates health'],['thorns','Spiked Rampart','Melee invaders take retaliation damage'],['ward','Wardkeeper','Reduce fortress damage received'],['bulwark','Adamantine','Fortress maximum health +15% per rank'],['laststand','Last Stand','Below 30% wall HP the hero fires faster']],
 Prospector:[['fortune','Gold Hunter','Gold earned +8% per rank'],['scavenger','Scavenger','Increase equipment drop chance'],['wisdom','Sage','Experience gained +7% per rank'],['midas','Golden Mark','Chance to double gold from a kill'],['salvage','Salvage Master','Equipment upgrades become cheaper'],['prosperity','Prosperity','Gain bonus currency after each cleared wave']]
};
const stationData=[['ballista','⚔','Ironwood Ballista','Fires an additional powerful bolt every few seconds.',135,1.55,80],['cryo','❄','Frostward Obelisk','Slows marching enemies across the battlefield.',165,1.6,80],['midas','✦','Midas Projector','Some defeated enemies drop a bonus burst of gold.',175,1.62,80],['thunder','ϟ','Stormcoil Turret','Discharges chain lightning at a nearby enemy.',270,1.7,80],['gravity','◉','Gravity Anchor','Weakens the approach speed of the entire horde.',350,1.7,80]];
const research=[['discount','Merchant Contracts','Reduce equipment and station upgrade prices.',12,1.65,30],['fusion','Runecraft Efficiency','Reduce rune fusion costs.',15,1.6,30],['interest','Royal Treasury','Gain extra gold when a wave ends.',13,1.7,40],['excavation','Excavation','Equipment and rune drops become more frequent.',22,1.65,40],['bounties','Royal Bounties','Increases gold from elite monsters and bosses.',18,1.65,40],['studies','Advanced Studies','Increase Knowledge awarded per wave.',26,1.7,40]];
const suppression=[['health','Weakening Sigils','Reduce enemy maximum health, capped at 35%.',16,1.65,70],['speed','Mudbound March','Reduce enemy movement speed, capped at 35%.',14,1.64,70],['damage','Blunted Steel','Reduce damage enemies inflict on your fortress.',19,1.68,70],['armor','Rending Curse','Reduce enemy natural armor.',21,1.7,70]];
const rarities=['Common','Uncommon','Rare','Epic','Legendary','Mythic','Ancient','Celestial','Eternal'];
const rColors=['#ddd','#66dc9e','#75bfff','#b990ff','#ffd070','#ff727f','#eee08a','#e8b6ff','#90f9ff'];
const runeNames={ember:['🔥','Ember','Burn damage'],frost:['❄','Frost','Chance to slow enemies'],fortune:['✦','Fortune','Bonus gold on kills'],storm:['ϟ','Storm','Chain lightning chance']};
const gearNames={weapon:['Recurve Bow','Ashwood Longbow','Moonthorn Bow','Royal Arbalest','Sunfire Repeater','Starfall Arc','Kingslayer','Astral Bow','Eternity’s Oath'],armor:['Scout Mantle','Warden Mail','Forest Cloak','Ember Hauberk','Royal Warplate','Phoenix Mantle','Titan Guard','Starforged Plate','Eternal Bastion'],charm:['Copper Locket','Hunter’s Sigil','Wolfsbane Amulet','Goldheart Pendant','Dragon Eye','Oracle Stone','Elder Star','Celestial Mark','Eonstone']};
function defaultState(){return {version:1,level:1,xp:0,points:0,gold:520,essence:180,knowledge:60,highestWave:1,training:{},skills:{},stations:{},research:{},suppression:{},inventory:[{id:'starterbow',slot:'weapon',rarity:0,plus:0},{id:'starterarmor',slot:'armor',rarity:0,plus:0},{id:'startercharm',slot:'charm',rarity:0,plus:0}],equipped:{weapon:'starterbow',armor:'starterarmor',charm:'startercharm'},runes:[{type:'ember',tier:1,id:'seedember'},{type:'fortune',tier:1,id:'seedfortune'}],socketed:{},best:0,clears:0,selectedTier:1,unlockedTier:1,bestByTier:{},milestones:{},sigils:0,legacy:{},legacyUnlocked:false,banners:['Crimson Standard'],activeBanner:'Crimson Standard'};}
const storageKey='primal_knight_onslaught_save_v1';let p;try{p={...defaultState(),...JSON.parse(localStorage.getItem(storageKey)||'null')}}catch{p=defaultState()}if(!p||!p.inventory)p=defaultState();for(const k of ['training','skills','stations','research','suppression','socketed','equipped'])p[k]??={};p.runes??=[];p.bestByTier??={};p.milestones??={};p.sigils??=0;p.legacy??={};p.banners??=['Crimson Standard'];p.activeBanner??='Crimson Standard';p.unlockedTier=clamp(Number(p.unlockedTier)||1,1,12);p.selectedTier=clamp(Number(p.selectedTier)||1,1,p.unlockedTier);p.legacyUnlocked??=false;
let ctx=$('game').getContext('2d'),c=$('game'),background=new Image();background.src='assets/battlefield.png';const foreground=new Image();foreground.src='assets/foreground.png';let sprites={};for(const type of ['hero','goblin','skeleton','warg','imp','ogre']){const i=new Image();i.src='assets/'+type+'.png';sprites[type]=i;}
let run={wave:1,tier:1,health:0,maxHealth:0,phase:'ready',enemies:[],shots:[],particles:[],floats:[],spawned:0,total:0,kills:0,spawnClock:0,shotClock:0,stationClock:0,time:0,speed:1,freeze:0,rewardTimer:0,shakes:0,flashes:0};let tab='battle',storedSpeed=1,pausedForPanel=false,saveClock=0,toastTimer=0;
// The Tower-inspired structure: difficulty is chosen once, then every wave
// automatically follows the previous one until the fortress falls or player retreats.
const tierNames=['Verdant March','Ashen Frontier','Frostbound Pass','Sunken Dominion','Stormscar Reach','Hollow Kingdom','Emberfall Vale','Eclipse Bastion','Ancient Wilds','Astral Descent','Shattered Crown','Primordial Siege'];
const roman=x=>['','I','II','III','IV','V','VI','VII','VIII','IX','X','XI','XII'][x]||String(x);
const milestonesAt=[5,10,15,20,35,50,75,100];
const legacyPaths=[['siegebreaker','Siegebreaker','Deal +6% damage to siege bosses per rank.',2,30],['guardianOath','Guardian’s Oath','Increase permanent wall durability +3% per rank.',2,35],['goldenTouch','Golden Touch','Earn +4% gold from monster kills per rank.',3,40]];
const lr=id=>n(p.legacy,id);
function tierMilestone(tier,wave){
 const scale=1+(tier-1)*.6;
 if(wave===5)return {icon:'🟡',name:'Spoils of the Vanguard',detail:fmt(300*scale)+' Gold',kind:'gold',amount:Math.round(300*scale)};
 if(wave===10)return {icon:'🔷',name:'Essence Cache',detail:fmt(120*scale)+' Hero Essence',kind:'essence',amount:Math.round(120*scale)};
 if(wave===15)return tier===1?{icon:'✦',name:'Legacy Training Unsealed',detail:'Unlock permanent Sigil-powered upgrades + 5 Sigils',kind:'legacy',amount:5}:{icon:'💠',name:'Primal Sigil Cache',detail:(tier+3)+' Primal Sigils',kind:'sigils',amount:tier+3};
 if(wave===20)return tier<12?{icon:'⚔',name:'The Next Frontier',detail:'Unlock Tier '+roman(tier+1)+' + '+(2+tier)+' Sigils',kind:'tier',amount:2+tier}:{icon:'💠',name:'Final Frontier',detail:'12 Primal Sigils',kind:'sigils',amount:12};
 if(wave===35)return {icon:'◇',name:'Runic Expedition',detail:'A rare rune + '+fmt(350*scale)+' Gold',kind:'rune',amount:Math.round(350*scale)};
 if(wave===50)return {icon:'♛',name:'Banner of the Conqueror',detail:'A unique collectible and equippable banner',kind:'banner',amount:0};
 if(wave===75)return {icon:'💠',name:'Primal Treasury',detail:(6+tier*2)+' Sigils',kind:'sigils',amount:6+tier*2};
 return {icon:'✦',name:'Century of Onslaught',detail:fmt(700*scale)+' Essence + '+(12+tier*3)+' Sigils',kind:'century',amount:Math.round(700*scale)};
}
function milestoneKey(tier,wave){return tier+':'+wave;}
function nextMilestone(tier,wave){return milestonesAt.find(x=>x>=wave)||null;}
function rewardMilestone(tier,wave){
 const key=milestoneKey(tier,wave);if(p.milestones[key])return false;
 const prize=tierMilestone(tier,wave);p.milestones[key]=true;
 if(prize.kind==='gold')p.gold+=prize.amount;
 if(prize.kind==='essence')p.essence+=prize.amount;
 if(prize.kind==='sigils')p.sigils+=prize.amount;
 if(prize.kind==='legacy'){p.sigils+=prize.amount;p.legacyUnlocked=true;}
 if(prize.kind==='tier'){p.unlockedTier=Math.max(p.unlockedTier,Math.min(12,tier+1));p.sigils+=prize.amount;}
 if(prize.kind==='rune'){p.gold+=prize.amount;p.runes.push({id:'milestone_'+key,type:['ember','storm','frost','fortune'][(tier-1)%4],tier:Math.min(12,2+Math.floor(tier/3))});}
 if(prize.kind==='banner'){const banner='Banner of '+tierNames[tier-1];if(!p.banners.includes(banner))p.banners.push(banner);}
 if(prize.kind==='century'){p.essence+=prize.amount;p.sigils+=12+tier*3;}
 notice('MILESTONE '+wave+' • '+prize.name.toUpperCase());message('✦ WAVE '+wave+' MILESTONE UNLOCKED');
 save();return true;
}
let chosenTier=p.selectedTier;
function showLobby(summary=''){
 // The tier lobby belongs to Battle, not the progression chambers.
 $('app').dataset.view=tab==='battle'?'battle':'menu';
 $('tierLobby').hidden=tab!=='battle';$('lobbySummary').textContent=summary;
 $('exitRunButton').hidden=true;$('startButton').hidden=true;renderTierLobby();
}
function renderTierLobby(){
 chosenTier=clamp(chosenTier,1,12);
 $('tierGrid').innerHTML=tierNames.map((name,i)=>{let tier=i+1,locked=tier>p.unlockedTier,best=p.bestByTier[tier]||0;
  return `<button data-tier="${tier}" ${locked?'disabled':''} class="tier-choice ${chosenTier===tier?'selected':''} ${locked?'locked':''}" aria-pressed="${chosenTier===tier}"><span class="tier-choice-number">${locked?'🔒':'✦'} TIER ${roman(tier)}</span><strong>${name}</strong><small>${locked?'Clear wave 20 of Tier '+roman(tier-1):'BEST WAVE '+best}</small></button>`;
 }).join('');
 const tier=chosenTier,best=p.bestByTier[tier]||0;
 $('tierHeading').textContent='TIER '+roman(tier)+' — '+tierNames[tier-1].toUpperCase();
 $('tierDescription').textContent=`Enemy strength ×${(1+(tier-1)*.64).toFixed(2)} · Gold & XP ×${(1+(tier-1)*.32).toFixed(2)} · Best wave ${best}`;
 $('milestoneList').innerHTML=milestonesAt.map(w=>{let prize=tierMilestone(tier,w),claimed=!!p.milestones[milestoneKey(tier,w)];return `<div class="milestone-entry ${claimed?'claimed':''}"><div class="milestone-medal">${claimed?'✓':prize.icon}</div><div class="milestone-copy"><strong>Wave ${w} · ${prize.name}</strong><small>${prize.detail}</small></div><span class="milestone-status">${claimed?'CLAIMED':best>=w?'AVAILABLE NEXT RUN':'TARGET'}</span></div>`}).join('');
 $('launchTierButton').disabled=tier>p.unlockedTier;
 $('launchTierButton').textContent='⚔ START TIER '+roman(tier)+' • ENDLESS SIEGE';
 $('bannerBadge').textContent='♛ '+p.activeBanner;
}
function enterSiege(){if(chosenTier>p.unlockedTier)return;p.selectedTier=chosenTier;initRun();run.tier=chosenTier;$('tierLobby').hidden=true;$('exitRunButton').hidden=false;$('startButton').hidden=true;save();beginWave();}
function retreatFromSiege(){const cleared=run.wave-(run.phase==='intermission'?1:run.phase==='fallen'?0:1);const summary=`Tier ${roman(run.tier)} · Reached wave ${run.wave} · Cleared ${Math.max(0,cleared)} this run`;
 run.phase='ready';run.enemies=[];run.shots=[];save();showLobby(summary);refreshHUD();}
function legacyCost(row){return Math.ceil(row[3]*(1+lr(row[0])*.35+Math.pow(lr(row[0]),1.35)*.26));}
const lvlNeed=()=>Math.floor(65*Math.pow(p.level,1.34));const n=(obj,key)=>obj[key]||0;const skill=id=>n(p.skills,id);const station=id=>n(p.stations,id);const t=id=>n(p.training,id);const res=id=>n(p.research,id);const sup=id=>n(p.suppression,id);
function xpAdd(amount){p.xp+=Math.floor(amount*(1+t('xp')*.025+skill('wisdom')*.07));while(p.xp>=lvlNeed()){p.xp-=lvlNeed();p.level++;p.points+=2;notice('LEVEL UP! +2 SKILL POINTS');}}
function save(){try{localStorage.setItem(storageKey,JSON.stringify(p))}catch{}}
function notice(s){let el=$('toast');el.textContent=s;el.classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('visible'),2300)}
function message(s){$('combatMessage').textContent=s;$('combatMessage').classList.add('show');setTimeout(()=>$('combatMessage').classList.remove('show'),1600)}
function gearStat(slot){const g=p.inventory.find(g=>g.id===p.equipped[slot]);return g?(1+g.rarity*.6)*(1+g.plus*.24):1}
function socketValue(type){let total=0;for(let id of Object.values(p.socketed)){let x=p.runes.find(r=>r.id===id);if(x&&x.type===type)total+=Math.pow(1.38,x.tier-1)*.015;}return total;}
function maxWall(){return Math.floor((145+12*t('fort'))*(1+skill('stone')*.08+skill('bulwark')*.15)*(1+gearStat('armor')*.06)*(1+lr('guardianOath')*.03));}
function damage(){return (32+2*t('power')+p.level*.85)*(1+skill('aim')*.06)*(1+(gearStat('weapon')-1)*.22)}
function attackInterval(){return Math.max(.22,.82/(1+Math.min(3,t('haste')*.025)+skill('quiver')*.05+(run.health<run.maxHealth*.3?skill('laststand')*.12:0)));}
function trainCost(row){let [id,, ,base,mul]=row;let lv=t(id);return Math.floor(base*(1+lv*.075+lv*lv*.004)*Math.pow(1+(mul-1)*.07,Math.min(lv,120))*Math.pow(1.002,Math.max(0,lv-120))); }
function stationCost(row){let[id,,,base,mul]=row;let lv=station(id);return Math.floor(base*(1+lv*.2+lv*lv*.04)*Math.pow(1.04,Math.min(lv,40))*Math.pow(1.015,Math.max(0,lv-40))*(1-Math.min(.42,res('discount')*.014))); }
function researchCost(row,obj){let[id,,,base,mul]=row;let lv=n(obj,id);return Math.floor(base*(1+lv*.5+lv*lv*.15)*Math.pow(1.06+(mul-1)*.04,lv)); }
function gearCost(g){return Math.floor((70+g.plus*38)*(1+g.rarity*.8)*Math.pow(1.22,g.plus)*(1-Math.min(.42,res('discount')*.014+skill('salvage')*.02)));}
function randomGear(forceRarity=null){let score=Math.random()+Math.min(.44,p.highestWave*.004)+res('excavation')*.007;let r=forceRarity??(score>.995?5:score>.95?4:score>.85?3:score>.68?2:score>.43?1:0);r=clamp(r,0,8);return {id:'item_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8),slot:['weapon','armor','charm'][Math.floor(Math.random()*3)],rarity:r,plus:0};}
function grantDrops(){let prob=.23+t('loot')*.002+skill('scavenger')*.025+res('excavation')*.015;if(Math.random()<prob&&p.inventory.length<100){let g=randomGear();p.inventory.push(g);notice('FOUND '+rarities[g.rarity].toUpperCase()+' EQUIPMENT');}if(Math.random()<.32+res('excavation')*.013){let types=Object.keys(runeNames),kind=types[Math.floor(Math.random()*types.length)];p.runes.push({type:kind,tier:1,id:'r'+Date.now().toString(36)+Math.random().toString(36).slice(2,7)});}}
function initRun(){run.wave=1;run.tier=chosenTier;run.maxHealth=maxWall();run.health=run.maxHealth;run.phase='ready';run.enemies=[];run.shots=[];run.particles=[];run.floats=[];run.spawned=0;run.total=0;run.kills=0;run.time=0;run.shotClock=0;run.stationClock=0;run.rewardTimer=0;}
function beginWave(){if(run.phase==='fighting'||run.phase==='fallen')return;run.maxHealth=maxWall();run.health=clamp(run.health,0,run.maxHealth);run.phase='fighting';run.spawned=0;run.kills=0;run.enemies=[];run.shots=[];run.spawnClock=.35;run.total=8+run.wave*2+(run.wave%5===0?1:0);message(run.wave%5===0?'ELITE HORDE INCOMING':'WAVE '+run.wave+' BEGINS');refreshHUD();}
function spawnEnemy(){const isBoss=run.wave%5===0&&run.spawned===run.total-1;let type=isBoss?'ogre':(run.wave>=6?['goblin','skeleton','warg','warg']:run.wave>=3?['goblin','skeleton','warg']:['goblin','skeleton'])[Math.floor(Math.random()*(run.wave>=6?4:run.wave>=3?3:2))];let mul=(1+run.wave*.19)*(1+(run.tier-1)*.64);let hp=(type==='ogre'?300:type==='warg'?58:type==='skeleton'?42:type==='imp'?28:36)*mul*(1-Math.min(.35,sup('health')*.005));const e={type,x:rnd(140,820),y:rnd(122,154),hp,max:hp,speed:(type==='ogre'?7:type==='warg'?25:type==='imp'?22:17)*(1+run.wave*.023)*(1+(run.tier-1)*.06)*(1-Math.min(.35,sup('speed')*.005)),armor:((type==='ogre'?7:type==='skeleton'?2:0)+run.wave*.21+(run.tier-1)*2)*(1-Math.min(.5,sup('armor')*.01)),buildup:0,burn:0,slow:0,wobble:rnd(0,6.28),golden:Math.random()<.02+station('midas')*.012,dead:false,valued:isBoss?45:Math.round(type==='warg'?12:10)};run.enemies.push(e);}
function effect(x,y,color,count=8){for(let i=0;i<count;i++)run.particles.push({x,y,vx:rnd(-70,70),vy:rnd(-78,35),life:rnd(.25,.7),max:.7,color,size:rnd(2,5)});}
function float(x,y,text,color='#ffe9b2'){run.floats.push({x,y,text,color,life:1.25});}
function hurt(e,raw,kind='arrow'){if(e.dead)return;let dealt=Math.max(1,raw*(e.type==='ogre'?1+lr('siegebreaker')*.06:1)-e.armor);if(kind==='arrow'&&Math.random()<(.06+t('crit')*.002)){dealt*=(1.7+t('critDmg')*.025+skill('focus')*.2);float(e.x,e.y-22,'CRIT '+Math.floor(dealt),'#ffe18a')}else if(Math.random()<.18)float(e.x,e.y-18,Math.floor(dealt),'#fff0d5');e.hp-=dealt;e.buildup=.15;effect(e.x,e.y,'#fbd47b',3);if(kind==='arrow'){
 if(Math.random()<skill('ember')*.06+socketValue('ember'))e.burn=Math.max(e.burn,3);
 if(Math.random()<skill('frost')*.055+socketValue('frost'))e.slow=Math.max(e.slow,2.7+skill('hail')*.5);
 if(Math.random()<skill('spark')*.04+socketValue('storm')+t('shock')*.001){const other=run.enemies.filter(o=>o!==e&&!o.dead).sort((a,b)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(b.x-e.x,b.y-e.y))[0];if(other){effect(other.x,other.y,'#a5efff',8);hurt(other,raw*.45,'lightning');}}
 }
 if(e.hp<=0)kill(e);
}
function kill(e){e.dead=true;run.kills++;effect(e.x,e.y,e.type==='skeleton'?'#e7ded0':'#caa673',14);let amount=Math.ceil(e.valued*(1+t('gold')*.028+skill('fortune')*.08+socketValue('fortune')*4+res('bounties')*.03+lr('goldenTouch')*.04)*(1+run.wave*.09)*(1+(run.tier-1)*.32));if(e.golden||Math.random()<skill('midas')*.02+station('midas')*.013){amount*=3;float(e.x,e.y-35,'GOLDEN!', '#ffcd59')}p.gold+=amount;xpAdd(Math.ceil((e.type==='ogre'?70:8)*(1+run.wave*.055)*(1+(run.tier-1)*.32)));float(e.x,e.y-10,'+'+fmt(amount)+' GOLD','#f4c864');}
function shoot(target,power=damage(),kind='arrow',originX=496,originY=390){if(!target)return;run.shots.push({x:originX,y:originY,target,power,kind,life:1.8,trail:[]});run.flashes=.13;}
function tick(dt){if(run.phase==='intermission'){run.rewardTimer-=dt*run.speed;if(run.rewardTimer<=0)beginWave();return;}if(run.phase!=='fighting')return;dt*=run.speed;run.time+=dt;run.spawnClock-=dt;run.shotClock-=dt;run.stationClock-=dt;
 if(run.spawned<run.total&&run.spawnClock<=0){spawnEnemy();run.spawned++;run.spawnClock=Math.max(.26,1.05-run.wave*.018);}
 let gravity=1-Math.min(.4,station('gravity')*.018),cryo=1-Math.min(.4,station('cryo')*.018);
 for(const e of run.enemies){if(e.dead)continue;e.wobble+=dt*2;e.y+=e.speed*dt*(e.slow>0?.5:1)*gravity*cryo;e.x+=Math.sin(e.wobble)*dt*(e.type==='imp'?11:4);e.slow=Math.max(0,e.slow-dt);e.buildup=Math.max(0,e.buildup-dt);if(e.burn>0){e.burn-=dt;e.hp-=dt*(2+skill('ember')*1.3);if(e.hp<=0){kill(e);continue;}}if(e.y>430){e.dead=true;let attack=Math.ceil((e.type==='ogre'?36:13)*(1+run.wave*.055)*(1+(run.tier-1)*.25)*(1-Math.min(.5,sup('damage')*.007))*(1-Math.min(.35,t('resist')*.006+skill('ward')*.04)));run.health-=attack;run.shakes=.18;float(750,450,'-'+attack+' WALL','#ff7777');effect(e.x,424,'#ff7361',11);if(skill('thorns'))run.health+=Math.min(attack*.3,skill('thorns')*1);}}
 if(run.health<=0){run.health=0;run.phase='fallen';message('THE FORTRESS HAS FALLEN');notice('Tier '+roman(run.tier)+' · Wave '+run.wave+' • Permanent progress saved');save();showLobby('FORTRESS FALLEN · Tier '+roman(run.tier)+' · Reached Wave '+run.wave+' · Select a tier to fight again');refreshHUD();return;}
 if(run.shotClock<=0&&run.enemies.some(e=>!e.dead)){const targets=run.enemies.filter(e=>!e.dead).sort((a,b)=>b.y-a.y);let count=1+Math.floor(t('multishot')/8);for(let i=0;i<count;i++){const tar=targets[i%targets.length];shoot(tar);if(Math.random()<skill('double')*.08)shoot(tar,damage()*.65,'arrow',476,390);}run.shotClock=attackInterval();}
 if(run.stationClock<=0){let targets=run.enemies.filter(e=>!e.dead).sort((a,b)=>b.y-a.y);if(targets.length){if(station('ballista'))shoot(targets[0],damage()*(.6+station('ballista')*.22),'ballista',240,360);if(station('thunder'))shoot(targets[Math.min(1,targets.length-1)],damage()*(.4+station('thunder')*.15),'lightning',760,360);}run.stationClock=Math.max(.48,2.9/(1+station('ballista')*.06+station('thunder')*.05));}
 for(let i=run.shots.length-1;i>=0;i--){let s=run.shots[i];if(s.target.dead){run.shots.splice(i,1);continue}let dx=s.target.x-s.x,dy=s.target.y-s.y,dist=Math.hypot(dx,dy),speed=(s.kind==='lightning'?1100:820)*(1+t('range')*.017);s.trail.push([s.x,s.y]);if(s.trail.length>7)s.trail.shift();s.x+=dx/(dist||1)*dt*speed;s.y+=dy/(dist||1)*dt*speed;s.life-=dt;if(dist<dt*speed+8){hurt(s.target,s.power,s.kind);effect(s.x,s.y,s.kind==='lightning'?'#97f4ff':'#ffe07c',7);run.shots.splice(i,1);}else if(s.life<=0)run.shots.splice(i,1);}
 if(run.spawned===run.total&&run.enemies.every(e=>e.dead)){completeWave();}
}
function completeWave(){
 if(run.phase!=='fighting')return;
 const cleared=run.wave,tier=run.tier,multi=1+(tier-1)*.32;
 let essence=Math.round((12+cleared*4)*(1+t('essence')*.028)*multi);
 let knowledge=Math.round((5+cleared*1.6)*(1+res('studies')*.045)*multi);
 let waveGold=Math.round((35+cleared*9)*(1+res('interest')*.07+skill('prosperity')*.12)*multi);
 p.essence+=essence;p.knowledge+=knowledge;p.gold+=waveGold;
 p.best=Math.max(p.best,cleared);p.bestByTier[tier]=Math.max(p.bestByTier[tier]||0,cleared);
 p.highestWave=Math.max(p.highestWave,cleared+1);p.clears++;xpAdd(15+cleared*5);grantDrops();
 run.maxHealth=maxWall();run.health=Math.min(run.maxHealth,run.health+run.maxHealth*(.08+t('regen')*.005+skill('mend')*.025));
 if(milestonesAt.includes(cleared))rewardMilestone(tier,cleared);
 else message('WAVE '+cleared+' CLEARED · +'+fmt(essence)+' ESSENCE');
 run.wave++;run.phase='intermission';run.rewardTimer=1.2;run.enemies=[];run.shots=[];
 save();refreshHUD();
}
function draw(){let w=c.width,h=c.height;ctx.clearRect(0,0,w,h);ctx.save();if(run.shakes>0){ctx.translate(rnd(-2,2),rnd(-2,2));run.shakes-=.016;}if(background.complete&&background.naturalWidth){ctx.drawImage(background,0,0,w,h)}else{ctx.fillStyle='#223c45';ctx.fillRect(0,0,w,h)}
 // Subtle animated fog and light make the illustrated environment breathe.
 const time=performance.now()/1000;let gd=ctx.createLinearGradient(0,96,0,415);gd.addColorStop(0,'rgba(5,25,39,.08)');gd.addColorStop(1,'rgba(18,10,21,.13)');ctx.fillStyle=gd;ctx.fillRect(0,90,960,350);
 // Moving battle units: distinct image sprites, shadow, perspective, HP and state effects.
 for(const e of [...run.enemies].filter(e=>!e.dead).sort((a,b)=>a.y-b.y)){let s=clamp(.28+(e.y-105)/300*.83,.27,1.18)*(e.type==='ogre'?2.25:1);let im=sprites[e.type];if(!im||!im.complete)continue;let sw=im.naturalWidth*s,sh=im.naturalHeight*s,py=e.y-sh/2+Math.sin(e.wobble*1.3)*(e.type==='imp'?6:1);ctx.fillStyle='rgba(14,26,20,.43)';ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.43,Math.max(3,6*s),0,0,Math.PI*2);ctx.fill();ctx.save();ctx.shadowColor='rgba(10,18,26,.75)';ctx.shadowBlur=Math.max(3,6*s);if(e.buildup>0)ctx.filter='brightness(1.8)';if(e.golden)ctx.filter='sepia(1) saturate(2) hue-rotate(340deg) brightness(1.15)';ctx.imageSmoothingEnabled=false;ctx.drawImage(im,e.x-sw/2,py,sw,sh);ctx.restore();if(e.slow>0){ctx.strokeStyle='#91f1f9';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(e.x,e.y+sh*.4,sw*.36,6*s,0,0,7);ctx.stroke();}if(e.burn>0){ctx.fillStyle='#ffa554';ctx.fillRect(e.x-6,e.y-sh*.45-4,5,8);}let barW=clamp(26*s,20,64);ctx.fillStyle='#1e1b25';ctx.fillRect(e.x-barW/2,py-7,barW,4);ctx.fillStyle=e.type==='ogre'?'#ed796e':'#a8d675';ctx.fillRect(e.x-barW/2,py-7,barW*clamp(e.hp/e.max,0,1),4);}
 // Fortress battlements and hero are their own painted foreground layer.
 // Draw AFTER enemies: attackers remain behind the wall, never over it.
 if(foreground.complete&&foreground.naturalWidth){ctx.drawImage(foreground,0,0,w,h);}
 for(const s of run.shots){ctx.beginPath();ctx.lineWidth=s.kind==='lightning'?3:2;ctx.strokeStyle=s.kind==='lightning'?'#90f2ff':s.kind==='ballista'?'#ffd285':'#ffe8a9';ctx.moveTo(s.x,s.y);let tail=s.trail[0]||[s.x-7,s.y+6];ctx.lineTo(tail[0],tail[1]);ctx.stroke();ctx.fillStyle='#fff5b9';ctx.fillRect(s.x-2,s.y-2,4,4);}
 for(let i=run.particles.length-1;i>=0;i--){let t=run.particles[i];t.life-=1/60;t.x+=t.vx/60;t.y+=t.vy/60;t.vy+=48/60;if(t.life<=0){run.particles.splice(i,1);continue}ctx.globalAlpha=clamp(t.life/t.max,0,1);ctx.fillStyle=t.color;ctx.fillRect(t.x,t.y,t.size,t.size)}ctx.globalAlpha=1;
 for(let i=run.floats.length-1;i>=0;i--){let f=run.floats[i];f.life-=1/60;f.y-=.43;ctx.globalAlpha=clamp(f.life,0,1);ctx.fillStyle='#17101a';ctx.font='bold 15px Arial';ctx.fillText(f.text,f.x+1,f.y+2);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);if(f.life<=0)run.floats.splice(i,1)}ctx.globalAlpha=1;
 // Animated bow glow and string release marks the single hero as the shooter.
 if(run.flashes>0){run.flashes-=1/60;ctx.fillStyle=`rgba(255,226,142,${clamp(run.flashes*3,0,.68)})`;ctx.beginPath();ctx.arc(540,360,20+run.flashes*70,0,Math.PI*2);ctx.fill();}ctx.restore();}
function refreshHUD(){
 let r=[['🟡','GOLD',p.gold],['🔷','ESSENCE',p.essence],['📖','KNOWLEDGE',p.knowledge],['💠','SIGILS',p.sigils],['✦','SKILL POINTS',p.points]];
 $('resources').innerHTML=r.map(a=>`<div class="resource"><span class="glyph">${a[0]}</span><div><small>${a[1]}</small><strong>${fmt(a[2])}</strong></div></div>`).join('');
 $('stageName').textContent='TIER '+roman(run.tier)+' · '+tierNames[run.tier-1];
 $('waveName').textContent='WAVE '+run.wave+' · ENDLESS';
 $('waveFill').style.width=(run.phase==='fighting'?100*run.kills/(run.total||1):run.phase==='intermission'?100:0)+'%';
 $('wallText').textContent=Math.ceil(run.health)+' / '+run.maxHealth;
 $('wallFill').style.width=(100*run.health/(run.maxHealth||1))+'%';
 $('heroTag').innerHTML='✦ LEVEL '+p.level+' <span>'+fmt(p.xp)+' / '+fmt(lvlNeed())+' XP</span>';
 const next=nextMilestone(run.tier,run.wave);$('milestoneHint').textContent=next?'✦ NEXT MILESTONE · WAVE '+next+' · '+tierMilestone(run.tier,next).name:'✦ ALL MILESTONES CLEARED · PUSH YOUR RECORD';
}
// ALPHA 0.3 — hub navigation and progression chambers, completely rebuilt UI.
const hubs={battle:['battle'],hero:['hero','skills'],power:['training','research'],gear:['equipment','runes'],fortress:['stations','suppression']};
const hubLabels={battle:'Battle',hero:'Hero',power:'Power',gear:'Gear',fortress:'Fortress'};
const tabIcons={hero:'hero',skills:'skills',training:'training',research:'research',equipment:'gear',runes:'runes',stations:'stations',suppression:'suppression',settings:'power'};
const tabInfo={
 hero:['THE WARDEN','The Defender','Your hero, your legend. Every upgrade serves this one warrior.','The heart of the fortress'],
 skills:['PATHS OF POWER','The Hall of Talents','Spend level points on lasting specialties. Learn talents in order, or explore other schools.','Learn and specialize'],
 training:['HERO TRAINING','The Eternal Ascent','Thousands of ranks, each making your hero stronger. Spend Essence to grow for the long haul.','Your strength never rests'],
 research:['ROYAL RESEARCH','The Royal Archive','Make every reward go further. Invest Knowledge to reduce costs and boost future income.','Wisdom builds kingdoms'],
 equipment:['FORGE & ARMORY','The Royal Forge','Wear your strongest discoveries, then enhance each item with Gold.','The forge burns bright'],
 runes:['RUNIC WORKSHOP','The Rune Sanctum','Socket a rune into each item. Combine three matching runes to advance their tier.','Magic is forged here'],
 stations:['DEFENSIVE STATIONS','The Siege Works','Strengthen permanent fortress machinery for extra firepower, control and wealth.','Guard every stone'],
 suppression:['ENEMY SUPPRESSION','The War Council','Spend Knowledge studying the enemy and permanently weakening the invading horde.','Know your enemy'],
 settings:['SETTINGS & SAVES','The Chronicle','Keep your progress safe with local saves and downloadable backups.','Safeguard your journey']
};
let activeByHub={battle:'battle',hero:'hero',power:'training',gear:'equipment',fortress:'stations'}, selectedSchool='Marksman',trainFilter='All',gearFilter='All',runePickSlot=null;
let armoryDrawerSlot=null,armorySellRarities=new Set(),lastGearSale=null;
const gearSlotLabels={weapon:'WEAPON',armor:'ARMOR',charm:'CHARM'};
const gearSlotDescriptions={weapon:'Damage and ranged attacks',armor:'Fortress vitality',charm:'Overall combat power'};
const gearSlotArt={weapon:'battle',armor:'gear',charm:'runes'};
function equippedGear(slot){return p.inventory.find(g=>g.id===p.equipped[slot])||null;}
function gearTitle(g){return gearNames[g.slot][g.rarity]||'Unknown Equipment';}
function gearSellPrice(g){const base=Math.floor(24*Math.pow(2.1,g.rarity));let refund=0;for(let i=0;i<Math.min(50,g.plus);i++)refund+=gearCost({...g,plus:i})*.18;return Math.max(1,Math.floor(base+refund));}
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
 const currency=currencyFor(actionId),kind=String(actionId).split(':')[0],item=p.inventory?.find(g=>g.id===String(actionId).split(':')[1]),art=(kind==='equip'||kind==='enhance')?(item?.slot==='weapon'?'battle':item?.slot==='armor'?'gear':'runes'):(upgradeArt[String(actionId).split(':')[1]]||cardArt[kind]||'hero'),info=level||'',max=info.match(/(?:RANK|RESEARCH|ENHANCEMENT\s*\+)?\s*([\d,]+)\s*\/\s*([\d,]+)/i);const pct=progress!=null?progress:max?meterPct(Number(max[1].replace(/,/g,'')),Number(max[2].replace(/,/g,''))):0;
 return `<article class="upgrade-card art-card kind-${String(actionId).split(':')[0]} ${!disabled?'available-to-buy':''}"><div class="card-heading"><div class="card-art"><span class="pixel-symbol pixel-symbol-${art}" aria-hidden="true"></span></div><h3>${accent}${title}</h3></div><p>${description}</p><div class="level">${info}</div><div class="rank-track" aria-hidden="true"><span style="width:${pct}%"></span></div><div class="card-footer">${cost!==null?`<div class="card-cost ${currency}" title="Cost in ${currency}">${currencyGlyph[currency]} ${fmt(cost)}</div>`:''}<button data-action="${actionId}" ${disabled?'disabled':''}>${label}</button></div></article>`;
}
const section=(head,body)=>`<h2 class="section-title">${head}</h2>${body}`;
const cards=arr=>`<div class="cards">${arr.join('')}</div>`;
const highlight=(title,body,icon='✦')=>`<div class="highlight-banner"><div><b>${title}</b><small>${body}</small></div><div class="banner-emblem" aria-hidden="true">${icon}</div></div>`;

function slotCard(slot){
 const g=equippedGear(slot),label=gearSlotLabels[slot],icon=gearSlotArt[slot],cost=g?gearCost(g):0;
 const name=g?gearTitle(g):'Empty '+slot.charAt(0).toUpperCase()+slot.slice(1)+' Slot';
 const rarity=g?rarities[g.rarity]:'EMPTY SLOT';
 return `<section class="armory-slot armory-${slot}" aria-label="${label} equipment slot">
  <div class="armory-slot-label"><span>${label}</span><span>${g?'✦ EQUIPPED':'◇ AVAILABLE'}</span></div>
  <button class="armory-slot-select" type="button" data-gear-slot="${slot}" aria-label="Choose ${slot} equipment: ${name}">
    <span class="armory-slot-gem ${g?'has-gear rarity-outline-'+g.rarity:'is-empty'}"><span class="pixel-symbol pixel-symbol-${icon}" aria-hidden="true"></span></span>
    <span class="armory-slot-copy"><small class="${g?'rarity-'+g.rarity:'empty-rarity'}">${rarity}</small><strong>${name}</strong><em>${g?'Enhancement +'+g.plus+' / 50':'Tap to equip'}</em></span>
    <span class="armory-slot-prompt">${g?'CHANGE ITEM':'EQUIP ITEM'} <span aria-hidden="true">›</span></span>
  </button>
  ${g?`<button type="button" class="armory-enhance" data-action="enhance:${g.id}" ${g.plus>=50||p.gold<cost?'disabled':''}>${g.plus>=50?'MAX ENHANCEMENT':`✦ ENHANCE +1 · 🟡 ${fmt(cost)}`}</button>`:''}
 </section>`;
}
function renderArmoryShowcase(){
 const slots=['weapon','armor','charm'];
 return `<div class="armory-intro"><div><span>THE WARDEN'S ARMORY</span><h2>Equip your champion</h2><p>Every piece has its own place. Tap a slot to browse its equipment, compare rarity and enhancements, or sell unwanted loot.</p></div><div class="armory-wallet">🟡 <strong>${fmt(p.gold)}</strong><small>GOLD</small></div></div>
 <section class="armory-showcase" aria-label="Hero equipment screen">
   <div class="armory-scene-heading">✦ THE LONE DEFENDER ✦</div>
   <div class="armory-hero-plinth"><div class="armory-halo" aria-hidden="true"></div><img src="assets/hero.png" alt="Your red-cloaked Primal Knight seen from behind, ready to equip gear"><span class="armory-hero-level">LEVEL ${p.level} · PRIMAL KNIGHT</span></div>
   ${slots.map(slotCard).join('')}
 </section>
 <div class="armory-wardrobe-bar"><div><strong>YOUR COLLECTION</strong><small>${p.inventory.length} / 100 items · Nine rarities · Equipped items protected</small></div><button type="button" data-gear-slot="all">OPEN FULL INVENTORY <span aria-hidden="true">›</span></button></div>
 <div class="armory-note">✦ <b>Tip:</b> Empty a slot from its inventory drawer, or equip a different item to replace what you're wearing. All selling uses Gold and updates your save immediately.</div>`;
}
function renderArmoryDrawer(){
 const drawer=$('armoryDrawer');if(!drawer)return;
 if(tab!=='equipment'||!armoryDrawerSlot){drawer.hidden=true;drawer.innerHTML='';return;}
 drawer.hidden=false;
 const all=armoryDrawerSlot==='all',category=all?'ALL EQUIPMENT':gearSlotLabels[armoryDrawerSlot];
 const items=p.inventory.filter(g=>all||g.slot===armoryDrawerSlot).sort((a,b)=>b.rarity-a.rarity||b.plus-a.plus||gearTitle(a).localeCompare(gearTitle(b)));
 const current=!all?equippedGear(armoryDrawerSlot):null;
 const groupMarkup=rarities.map((rarity,i)=>({rarity,i,items:items.filter(g=>g.rarity===i)})).filter(g=>g.items.length).reverse().map(group=>`
 <section class="armory-rarity-group rarity-group-${group.i}" aria-label="${group.rarity} equipment">
  <h3><span class="armory-rarity-sigil rarity-${group.i}">◆</span>${group.rarity.toUpperCase()} <small>${group.items.length} ${group.items.length===1?'ITEM':'ITEMS'}</small></h3>
  <div class="armory-inventory-grid">${group.items.map(g=>{
   const active=p.equipped[g.slot]===g.id,price=gearSellPrice(g),cost=gearCost(g);
   return `<article class="armory-inventory-item rarity-outline-${g.rarity}" data-item-id="${g.id}">
    <div class="armory-item-icon"><span class="pixel-symbol pixel-symbol-${gearSlotArt[g.slot]}" aria-hidden="true"></span></div>
    <div class="armory-item-details"><small class="rarity-${g.rarity}">${rarities[g.rarity]} · ${gearSlotLabels[g.slot]}</small><strong>${gearTitle(g)}</strong><em>Enhancement +${g.plus} / 50 ${active?'· CURRENTLY EQUIPPED':''}</em></div>
    <div class="armory-item-buttons"><button type="button" data-action="equip:${g.id}" ${active?'disabled':''}>${active?'✓ EQUIPPED':'EQUIP'}</button><button type="button" data-action="enhance:${g.id}" ${g.plus>=50||p.gold<cost?'disabled':''}>${g.plus>=50?'MAXED':`UPGRADE · 🟡${fmt(cost)}`}</button><button type="button" class="armory-sell-item" data-gear-sell="${g.id}" ${active?'disabled title="Unequip before selling"':''}>${active?'EQUIPPED · SAFE':`SELL · 🟡${fmt(price)}`}</button></div>
   </article>`;}).join('')}</div>
 </section>`).join('');
 const rarityCounts=rarities.map((name,i)=>({name,i,count:p.inventory.filter(g=>g.rarity===i&&canSellGear(g)).length}));
 drawer.innerHTML=`<div class="armory-drawer-header"><button type="button" data-gear-back class="armory-drawer-back">‹ BACK TO HERO</button><div class="armory-drawer-title"><small>THE ROYAL ARMORY</small><h2>${category}</h2><span>${items.length} ITEMS · SORTED BY RARITY</span></div><div class="armory-drawer-gold">🟡 ${fmt(p.gold)}</div></div>
 <div class="armory-drawer-scroll" id="armoryDrawerScroll">
  ${!all?`<div class="armory-current"><span>YOUR CURRENT ${category}</span><strong>${current?gearTitle(current)+' · +'+current.plus:'EMPTY · READY TO EQUIP'}</strong>${current?`<button type="button" data-gear-unequip="${armoryDrawerSlot}">UNEQUIP ${category}</button>`:''}</div>`:''}
  <div class="armory-salvage"><div class="armory-salvage-heading"><div><small>THE SALVAGE COUNTER</small><h3>Sell gear by rarity</h3><p>Select one or more rarities. Bulk selling applies to <b>all three equipment categories</b> and never sells equipped items.</p></div><span>🟡 GOLD RETURNS</span></div>
    <div class="armory-rarity-options" role="group" aria-label="Select equipment rarities to sell">${rarityCounts.map(r=>`<label class="armory-rarity-choice rarity-choice-${r.i} ${r.count===0?'no-items':''}"><input type="checkbox" data-sell-rarity="${r.i}" ${armorySellRarities.has(r.i)?'checked':''} ${r.count===0?'disabled':''}><span class="rarity-${r.i}">${r.name}</span><small>${r.count}</small></label>`).join('')}</div>
    <div class="armory-salvage-actions"><button type="button" data-gear-bulk-sell id="armoryBulkSell">CHOOSE RARITIES TO SELL</button><span id="armoryBulkSummary">Equipped gear is always protected.</span></div>
    ${lastGearSale?`<div class="armory-undo"><span>Last sale: ${lastGearSale.items.length} item(s) for 🟡${fmt(lastGearSale.gold)}</span><button type="button" data-gear-undo ${p.gold<lastGearSale.gold||p.inventory.length+lastGearSale.items.length>100?'disabled':''}>UNDO LAST SALE</button></div>`:''}
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
   if(p.gold<gold||p.inventory.length+items.length>100){notice('NOT ENOUGH GOLD OR INVENTORY SPACE TO UNDO');return;}
   p.gold-=gold;p.inventory.push(...items);lastGearSale=null;save();refreshHUD();renderPanel();notice('LAST SALE REVERSED');return;}
 if(target.dataset.action){action(target.dataset.action);return;}
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
 $('subnav').innerHTML=tab==='settings'?`<span class="tag">YOUR SAVED JOURNEY</span>`:hubs[hub].map(page=>`<button data-subtab="${page}" class="${tab===page?'selected':''}" aria-current="${tab===page?'page':'false'}">${page==='hero'?'♜':page==='skills'?'✧':page==='training'?'↟':page==='research'?'⚗':page==='equipment'?'⚒':page==='runes'?'◇':page==='stations'?'♜':'☠'} ${ {hero:'Overview',skills:'Skill Trees',training:'Training',research:'Research',equipment:'Equipment',runes:'Rune Workshop',stations:'Stations',suppression:'Enemy Suppression'}[page]}</button>`).join('')+`<span class="chamber-help">Switch sections here · Back to battle ✕</span>`;
 let html=`<div class="chamber-mobile-art" aria-hidden="true"><img src="${chamberArt(tab)}" alt=""><div class="mobile-chamber-name"><small>✦ ${title}</small><b>${asideTitle}</b></div></div><div class="section-intro"><p class="lead">${description}</p><strong>${{skills:currencyGlyph.points+' '+fmt(p.points)+' POINTS',training:currencyGlyph.essence+' '+fmt(p.essence)+' ESSENCE',research:currencyGlyph.knowledge+' '+fmt(p.knowledge)+' KNOWLEDGE',equipment:currencyGlyph.gold+' '+fmt(p.gold)+' GOLD',runes:currencyGlyph.gold+' '+fmt(p.gold)+' GOLD',stations:currencyGlyph.gold+' '+fmt(p.gold)+' GOLD',suppression:currencyGlyph.knowledge+' '+fmt(p.knowledge)+' KNOWLEDGE'}[tab]||''}</strong></div>`;
 if(tab==='hero'){
  let percent=meterPct(p.xp,lvlNeed());
  html+=highlight('Level '+p.level+' · '+fmt(p.points)+' unspent skill points','Gain XP in combat, then visit Skill Trees to choose your path.','♜');
  html+=`<div class="hero-grid"><div class="hero-frame"><img src="assets/hero.png" alt="One red-cloaked defender facing the battlefield"></div><div><div class="stat-grid">
   ${[['ATTACK POWER',fmt(damage())],['ATTACK INTERVAL',attackInterval().toFixed(2)+' sec'],['FORTRESS HEALTH',fmt(maxWall())],['CRITICAL CHANCE',Math.round((.06+t('crit')*.002)*100)+'%'],['BEST WAVE',fmt(p.best)],['WAVES CLEARED',fmt(p.clears)]].map(([name,val])=>`<div class="stat-tile"><small>${name}</small><strong>${val}</strong></div>`).join('')}</div><p class="statline">Level ${p.level} progress · ${fmt(p.xp)} / ${fmt(lvlNeed())} XP</p><div class="meter"><div style="width:${percent}%"></div></div><button class="wide-btn" data-goto="skills">OPEN YOUR SKILL TREES →</button></div></div>`;
  html+=section('BATTLE BANNERS · COSMETIC REWARDS',`<div class="banner-picks">${p.banners.map(name=>`<button class="banner-choice ${p.activeBanner===name?'selected':''}" data-banner="${name}">♛ ${name}${p.activeBanner===name?' ✓':''}</button>`).join('')}</div>`);
 }
 if(tab==='skills'){
  html+=highlight('Choose a discipline','Learn talents in order. Each rank costs 1 Skill Point; later ranks require higher hero levels.','✧');
  html+=`<div class="filter-bar" role="group" aria-label="Skill discipline">${Object.keys(skills).map(s=>`<button class="${selectedSchool===s?'selected':''}" data-school="${s}">${({Marksman:'🏹',Arcanist:'✧',Guardian:'♜',Prospector:'✦'})[s]} ${s}</button>`).join('')}</div>`;
  const school=selectedSchool in skills?selectedSchool:'Marksman';
  html+=section(`${school.toUpperCase()} · ${skills[school].reduce((sum,n)=>sum+skill(n[0]),0)} INVESTED POINTS`,`<div class="school-path">${skills[school].map(([id,name,desc],i)=>{
   const rank=skill(id),need=1+i*3,prior=i===0||skill(skills[school][i-1][0])>0,locked=!prior||p.level<need,full=rank>=5,afford=p.points>=1;
   const label=full?'MASTERED':locked?(!prior?'PREVIOUS TALENT FIRST':'UNLOCKS AT LV '+need):!afford?'NEED A SKILL POINT':'LEARN TALENT';
   return card(`${i+1}. ${name}`,desc,`RANK ${rank} / 5 • ${i===0?'STARTER':'LEVEL '+need}`,1,label,'skill:'+id,locked||full||!afford,'',20*rank);
  }).join('')}</div>`);
 }
 if(tab==='training'){
  html+=highlight('The long road to mastery','Hero Essence is separate from Gold. These upgrades are permanent and many have hundreds of levels.','↟');
  let groups={All:training.map(x=>x[0]),Offense:['power','haste','crit','critDmg','pierce','range','multishot','boss','shock'],Defense:['fort','regen','resist'],Economy:['gold','xp','essence','loot']};
  html+=`<div class="filter-bar" role="group" aria-label="Training category">${Object.keys(groups).map(g=>`<button class="${g===trainFilter?'selected':''}" data-train-filter="${g}">${g}</button>`).join('')}</div>`;
  html+=cards(training.filter(row=>groups[trainFilter]?.includes(row[0])).map(row=>{const [id,name,desc,,,max]=row,rank=t(id),cost=trainCost(row);return card(name,desc,`RANK ${fmt(rank)} / ${fmt(max)}`,cost,rank>=max?'MAXED':p.essence<cost?'MORE ESSENCE NEEDED':'TRAIN +1','train:'+id,rank>=max||p.essence<cost)}));
  html+=section('LEGACY MASTERIES · PRIMAL SIGILS',p.legacyUnlocked?cards(legacyPaths.map(row=>{const [id,name,desc,,max]=row,rank=lr(id),cost=legacyCost(row);return card(name,desc,`RANK ${rank} / ${max}`,cost,rank>=max?'MAXED':p.sigils<cost?'MORE SIGILS NEEDED':'MASTER +1','legacy:'+id,rank>=max||p.sigils<cost)})):'<div class="legacy-lock">🔒 Clear Wave 15 on Tier I to unlock your first three permanent Sigil-powered mastery paths.</div>');
 }
 if(tab==='research'){
  html+=highlight('Invest in your future','Knowledge earned from waves builds economic advantages. Discounts are capped for balance.','⚗');
  html+=cards(research.map(row=>{const [id,name,desc,,,max]=row,rank=res(id),cost=researchCost(row,p.research);return card(name,desc,`RESEARCH ${rank} / ${max}`,cost,rank>=max?'COMPLETE':p.knowledge<cost?'MORE KNOWLEDGE NEEDED':'RESEARCH +1','research:'+id,rank>=max||p.knowledge<cost)}));
 }
 if(tab==='equipment'){
  html+=renderArmoryShowcase();
 }
 if(tab==='runes'){
  html+=highlight('Socket. Combine. Ascend.','Place a rune in each equipped item. To fuse, collect three of the same family and tier.','◇');
  html+=section('EQUIPMENT SOCKETS',`<div class="cards">${['weapon','armor','charm'].map(slot=>{
   const equippedId=p.socketed[slot],r=p.runes.find(x=>x.id===equippedId);
   return `<div class="rune-socket"><strong>◇ ${slot.toUpperCase()}</strong><p>${r?`${runeNames[r.type][1]} Rune · Tier ${r.tier}`:'No rune socketed'}</p><button data-socket-slot="${slot}">${r?'CHANGE / REMOVE RUNE':'CHOOSE A RUNE'}</button></div>`;
  }).join('')}</div>`);
  if(runePickSlot){
   const options=p.runes.filter(r=>!Object.values(p.socketed).includes(r.id)||p.socketed[runePickSlot]===r.id);
   html+=`<div class="rune-picker" id="runePicker"><h3>Choose a rune for ${runePickSlot.toUpperCase()}</h3><button class="rune-option" data-socket-rune="${runePickSlot}:none">✕ Clear Socket</button>${options.map(r=>`<button class="rune-option" data-socket-rune="${runePickSlot}:${r.id}">${runeNames[r.type][0]} ${runeNames[r.type][1]} · Tier ${r.tier}${p.socketed[runePickSlot]===r.id?' · EQUIPPED':''}</button>`).join('')||'<p>No runes available. Survive waves to find more.</p>'}</div>`;
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
  html+=`<div class="setting-row"><span>Download a JSON backup of permanent progression</span><button class="wide-btn" data-action="export">EXPORT SAVE</button></div><div class="setting-row"><span>Restore a saved backup from your device</span><input id="importFile" aria-label="Import save backup" type="file" accept="application/json,.json"></div><div class="setting-row"><span>Current combat: ${run.phase} · Autosaved on upgrades and wave clears</span><button class="wide-btn" data-action="save">SAVE NOW</button></div><p class="lead">Alpha 0.4 · Free to play · No outside subscriptions, analytics or purchases.</p>`;
 }
 $('panelContent').innerHTML=html;
 if(tab==='equipment')renderArmoryDrawer();else{const drawer=$('armoryDrawer');if(drawer){drawer.hidden=true;drawer.innerHTML='';}}
 const imp=$('importFile');if(imp)imp.onchange=async ev=>{let file=ev.target.files?.[0];if(!file)return;try{let obj=JSON.parse(await file.text());if(!obj.inventory||!obj.equipped||!obj.training)throw Error('Invalid save');if(!confirm('Replace your current progress with this backup?'))return;p={...defaultState(),...obj};p.bestByTier??={};p.milestones??={};p.legacy??={};p.banners??=['Crimson Standard'];p.sigils??=0;p.unlockedTier=clamp(Number(p.unlockedTier)||1,1,12);chosenTier=clamp(Number(p.selectedTier)||1,1,p.unlockedTier);save();initRun();showLobby();refreshHUD();renderPanel();notice('SAVE RESTORED');}catch(e){notice('Invalid save file')}};
}
function openTab(next,fromHub=false){
 // Hub navigation remembers the last page, but direct subtab selection must not
 // be mistaken for a hub when a page has the same name (Hero Overview).
 if(fromHub&&next in hubs)next=activeByHub[next];
 if(next!=='settings'&&next!=='battle'&&!tabInfo[next])return;
 const previous=tab;tab=next;
 if(next!=='equipment'){armoryDrawerSlot=null;armorySellRarities.clear();}
 // This is the single authoritative screen state: CSS never lets the lobby cover a menu.
 $('app').dataset.view=next==='battle'?'battle':'menu';
 const hub=Object.keys(hubs).find(key=>hubs[key].includes(next));if(hub)activeByHub[hub]=next;
 for(let b of document.querySelectorAll('[data-hub]'))b.classList.toggle('selected',b.dataset.hub===hub);
 const preSiege=run.phase==='ready'||run.phase==='fallen';
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
 else if(type==='legacy'){let row=legacyPaths.find(x=>x[0]===id);if(row&&p.legacyUnlocked&&lr(id)<row[4]&&p.sigils>=legacyCost(row)){p.sigils-=legacyCost(row);p.legacy[id]=lr(id)+1;run.maxHealth=maxWall();run.health=Math.min(run.maxHealth,run.health+Math.round(run.maxHealth*.03));}}
 else if(type==='skill'){let found=Object.values(skills).flat().find(x=>x[0]===id);if(found&&p.points>0&&skill(id)<5){p.points--;p.skills[id]=skill(id)+1;run.maxHealth=maxWall();}}
 else if(type==='station'){let row=stationData.find(x=>x[0]===id),cost=stationCost(row);if(row&&p.gold>=cost&&station(id)<row[6]){p.gold-=cost;p.stations[id]=station(id)+1;}}
 else if(type==='research'){let row=research.find(x=>x[0]===id),cost=researchCost(row,p.research);if(row&&p.knowledge>=cost&&res(id)<row[5]){p.knowledge-=cost;p.research[id]=res(id)+1;}}
 else if(type==='suppress'){let row=suppression.find(x=>x[0]===id),cost=researchCost(row,p.suppression);if(row&&p.knowledge>=cost&&sup(id)<row[5]){p.knowledge-=cost;p.suppression[id]=sup(id)+1;}}
 else if(type==='equip'){let g=p.inventory.find(g=>g.id===id);if(g){p.equipped[g.slot]=g.id;notice(gearTitle(g)+' EQUIPPED');}}
 else if(type==='enhance'){let g=p.inventory.find(g=>g.id===id);if(g&&p.gold>=gearCost(g)&&g.plus<50){p.gold-=gearCost(g);g.plus++;}}
 else if(type==='fuse'){let r=p.runes.find(x=>x.id===id);if(!r)return;let same=p.runes.filter(x=>x.type===r.type&&x.tier===r.tier&&!Object.values(p.socketed).includes(x.id));let cost=Math.floor(85*r.tier*r.tier*(1-Math.min(.4,res('fusion')*.012)));if(same.length>=3&&p.gold>=cost&&r.tier<12){p.gold-=cost;let ids=same.slice(0,3).map(x=>x.id);p.runes=p.runes.filter(x=>!ids.includes(x.id));p.runes.push({id:'r'+Date.now()+Math.random(),type:r.type,tier:r.tier+1});notice('RUNE FUSED TO TIER '+(r.tier+1));}}
 else if(type==='socket'){runePickSlot=id;renderPanel();return;}
 else if(type==='save'){save();notice('PROGRESS SAVED')}
 else if(type==='export'){let blob=new Blob([JSON.stringify(p,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='primal-knight-onslaught-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);return;}
 save();refreshHUD();renderPanel();}
function loop(tm){let dt=clamp(((tm-(loop.last||tm))/1000),0,.05);loop.last=tm;tick(dt);draw();if(tm-(loop.lastHud||0)>160){refreshHUD();loop.lastHud=tm}requestAnimationFrame(loop)}
$('nav').addEventListener('click',e=>{let b=e.target.closest('[data-hub]');if(b)openTab(b.dataset.hub,true)});
$('subnav').addEventListener('click',e=>{let b=e.target.closest('[data-subtab]');if(b)openTab(b.dataset.subtab)});
$('panelContent').addEventListener('click',e=>{
 let target=e.target.closest('button');if(!target||target.disabled)return;
 if(target.dataset.gearSlot){armoryDrawerSlot=target.dataset.gearSlot;armorySellRarities.clear();lastGearSale=null;renderArmoryDrawer();return;}
 if(target.dataset.action){action(target.dataset.action);return;}
 if(target.dataset.goto){openTab(target.dataset.goto);return;}
 if(target.dataset.banner){if(p.banners.includes(target.dataset.banner)){p.activeBanner=target.dataset.banner;save();renderPanel();notice('BANNER EQUIPPED');}return;}
 if(target.dataset.school){selectedSchool=target.dataset.school;renderPanel();return;}
 if(target.dataset.trainFilter){trainFilter=target.dataset.trainFilter;renderPanel();return;}
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
$('tierGrid').addEventListener('click',e=>{const b=e.target.closest('[data-tier]');if(!b||b.disabled)return;chosenTier=Number(b.dataset.tier);p.selectedTier=chosenTier;save();renderTierLobby();});
$('speedButton').onclick=()=>{run.speed=run.speed===2?1:2;storedSpeed=run.speed;$('speedButton').textContent=run.speed+'×';notice('BATTLE SPEED '+run.speed+'×')};
$('pauseButton').onclick=()=>{if(run.speed){storedSpeed=run.speed;run.speed=0;$('pauseButton').textContent='▶';notice('BATTLE PAUSED')}else{run.speed=storedSpeed;$('pauseButton').textContent='Ⅱ';notice('BATTLE RESUMED')}};
window.addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden){save();if(run.phase==='fighting'&&run.speed){storedSpeed=run.speed;run.speed=0;$('pauseButton').textContent='▶';}}});
initRun();refreshHUD();showLobby();if(window.__PK_TEST__)window.__PK_TEST_TOOLS__={completeWave,beginWave,enterSiege,showLobby,retreatFromSiege,run:()=>run,p:()=>p,renderTierLobby,gearSellPrice,completeGearSale,renderArmoryDrawer};requestAnimationFrame(loop);
})();
