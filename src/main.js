import "./style.css";
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,
  mario,yoshi,bowser,peach,flagPole,G,W,H,TILE,GRAVITY,LW} from './globals.js';
import {addB,addRow,addStair,addStairD} from './builders.js';
import {buildLevel} from './levels/level1-1.js';
import {buildLevel2} from './levels/level1-2.js';
import {buildLevel3} from './levels/level1-3.js';
import {buildLevel4} from './levels/level1-4.js';
import {buildUnderground} from './levels/underground.js';
import {buildLevel_2_1} from './levels/level2-1.js';
import {buildLevel_2_2} from './levels/level2-2.js';
import {buildLevel_2_3} from './levels/level2-3.js';
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');

// === AUDIO ===
const AC=new(window.AudioContext||window.webkitAudioContext)();
let bgmGain=null;
function beep(freq,dur,type='square',vol=0.12,delay=0){
const t=AC.currentTime+delay,o=AC.createOscillator(),g=AC.createGain();
o.connect(g);g.connect(AC.destination);o.type=type;o.frequency.setValueAtTime(freq,t);
g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.start(t);o.stop(t+dur+0.01);
}
function sfx(n){try{
if(n==='jump'){beep(220,.05,'square',.1);beep(440,.08,'square',.12,.04);beep(660,.06,'sine',.1,.1)}
if(n==='coin'){beep(988,.05,'sine',.18);beep(1319,.14,'sine',.18,.05)}
if(n==='stomp'){beep(180,.04,'sawtooth',.15);beep(120,.1,'sawtooth',.1,.04)}
if(n==='die'){beep(494,.07,'square',.15);beep(370,.07,'square',.12,.1);beep(277,.07,'square',.1,.2);beep(196,.4,'square',.1,.3)}
if(n==='break'){beep(320,.04,'sawtooth',.12);beep(220,.06,'sawtooth',.1,.04);beep(160,.08,'sawtooth',.08,.08)}
if(n==='qblock'){beep(660,.06,'sine',.18);beep(784,.06,'sine',.16,.06);beep(988,.12,'sine',.15,.12)}
if(n==='flag'){[523,659,784,1047].forEach((f,i)=>beep(f,.12,'sine',.2,i*.12))}
if(n==='power'){[262,330,392,524].forEach((f,i)=>beep(f,.08,'sine',.18,i*.08))}
if(n==='1up'){[784,988,784,988,1175,1319].forEach((f,i)=>beep(f,.07,'sine',.18,i*.07))}
if(n==='yoshi_mount'){beep(523,.06,'sine',.2);beep(659,.06,'sine',.2,.06);beep(784,.06,'sine',.2,.12);beep(1047,.12,'sine',.18,.18)}
if(n==='yoshi_tongue'){beep(300,.03,'sawtooth',.15);beep(500,.05,'sawtooth',.12,.03)}
if(n==='yoshi_eat'){beep(350,.04,'square',.15);beep(450,.04,'square',.12,.04);beep(550,.06,'sine',.1,.08)}
if(n==='yoshi_dismount'){beep(400,.06,'square',.15);beep(300,.08,'square',.12,.06);beep(200,.1,'square',.1,.12)}
if(n==='yoshi_egg'){beep(600,.04,'sine',.15);beep(800,.06,'sine',.12,.04)}
}catch(e){}}

const THEME_NOTES=[[330,2],[0,1],[330,1],[0,1],[330,2],[0,1],[262,1],[330,2],[392,4],[196,4],[262,3],[0,1],[196,3],[0,1],[164,3],[0,1],[220,2],[246,2],[233,1],[220,2],[0,1],[196,2],[330,2],[392,2],[440,2],[349,1],[392,1],[0,1],[330,2],[0,1],[262,2],[294,1],[247,2],[0,2],[262,3],[0,1],[196,3],[0,1],[164,3],[0,1],[220,2],[246,2],[233,1],[220,2],[0,1],[196,2],[330,2],[392,2],[440,2],[349,1],[392,1],[0,1],[330,2],[0,1],[262,2],[294,1],[247,2],[0,2]];
const UG_NOTES=[[131,2],[0,1],[131,1],[0,1],[165,2],[0,1],[131,1],[175,2],[165,2],[156,2],[147,4],[131,2],[0,1],[131,1],[0,1],[165,2],[0,1],[131,1],[175,2],[165,2],[156,2],[147,4],[110,2],[0,1],[110,1],[0,1],[131,2],[0,1],[110,1],[147,2],[131,2],[0,2]];
const STAR_NOTES=[[523,1],[659,1],[784,1],[1047,1],[784,1],[659,1],[523,1],[0,1],[587,1],[740,1],[880,1],[1175,1],[880,1],[740,1],[587,1],[0,1],[659,1],[831,1],[988,1],[1319,1],[988,1],[831,1],[659,1],[0,1],[784,1],[988,1],[1175,1],[1568,1],[1175,1],[988,1],[784,1],[0,1]];
const CASTLE_NOTES=[[220,2],[0,1],[220,1],[208,2],[0,1],[196,1],[208,2],[220,1],[0,1],[220,4],[175,2],[0,1],[175,1],[165,2],[0,1],[155,1],[165,2],[175,1],[0,1],[196,4],[220,2],[247,2],[196,2],[220,2],[175,3],[0,1],[165,3],[0,1],[155,2],[165,2],[0,2]];
let bgmStep=0,bgmTime=0;const BEAT=0.09;
function scheduleBGM(){const notes=G.ugMode?UG_NOTES:(G.starTimer>0?STAR_NOTES:((G.currentLevel===4||(G.currentWorld===2&&G.currentLevel===3))?CASTLE_NOTES:THEME_NOTES));while(bgmTime<AC.currentTime+0.5){const[freq,len]=notes[bgmStep%notes.length];if(freq>0){const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(bgmGain);o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(0.08,bgmTime);g.gain.exponentialRampToValueAtTime(0.001,bgmTime+len*BEAT-0.01);o.start(bgmTime);o.stop(bgmTime+len*BEAT)}bgmTime+=len*BEAT;bgmStep++}}
function startBGM(){stopBGM();bgmGain=AC.createGain();bgmGain.gain.value=1;bgmGain.connect(AC.destination);bgmStep=0;bgmTime=AC.currentTime;scheduleBGM()}
function stopBGM(){if(bgmGain){bgmGain.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.2);bgmGain=null}}

// === GAME STATE ===

function resetMario(){
const bh=mario.power!=='none'?48:32;
Object.assign(mario,{x:80,y:H-3*TILE,w:26,h:bh,vx:0,vy:0,onGround:false,facing:1,walkFrame:0,walkTimer:0,inv:0,dead:false});
G.cam=0;
}
function upgradeMario(type){
if(type==='flower')mario.power='fire';else mario.power='big';
if(!mario.big){mario.h=48;mario.y-=16}mario.big=true;sfx('power');
for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+24,'star');
}

// === HELPERS ===
function overlap(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by}
function cX(obj,p){const bo=p.bounceOffset||0;if(!overlap(obj.x,obj.y+2,obj.w,obj.h-4,p.x,p.y-bo,p.w,p.h))return;if(obj.x+obj.w/2<p.x+p.w/2)obj.x=p.x-obj.w;else obj.x=p.x+p.w;obj.vx=obj===mario?0:-obj.vx}
function cY(obj,p,onHit){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(obj.x+1,obj.y,obj.w-2,obj.h,p.x,py,p.w,p.h))return;if(obj.y+obj.h/2<py+p.h/2){obj.y=py-obj.h;obj.vy=0;obj.onGround=true}else{obj.y=py+p.h;obj.vy=0;if(onHit)onHit(p)}}
function spawnParticle(x,y,type){const count=type==='brick'?8:type==='star'?6:4;for(let i=0;i<count;i++){const angle=(Math.PI*2/count)*i+Math.random()*0.5;const spd=(type==='brick'?4:type==='star'?5:2)+Math.random()*2;particles.push({x,y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd-2,life:1,decay:0.025+Math.random()*0.02,size:type==='brick'?5+Math.random()*4:type==='star'?4+Math.random()*3:3+Math.random()*3,color:type==='brick'?`hsl(${10+Math.random()*20},80%,45%)`:type==='star'?`hsl(${45+Math.random()*30},100%,65%)`:type==='dust'?`hsl(30,30%,${60+Math.random()*30}%)`:'#fff',type})}}
function spawnScorePopup(x,y,val,color='#fff'){scorePopups.push({x,y,val,vy:-1.8,life:1,color})}
function updateParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.life-=p.decay;if(p.life<=0)particles.splice(i,1)}for(let i=scorePopups.length-1;i>=0;i--){const p=scorePopups[i];p.y+=p.vy;p.vy*=0.95;p.life-=0.02;if(p.life<=0)scorePopups.splice(i,1)}}

// === INPUT ===
const keys={},btn={left:false,right:false,jump:false,dash:false,down:false};
document.addEventListener('keydown',e=>{keys[e.code]=true;
if(G.state==='start'){if(e.code==='ArrowLeft'&&G.selectedStage>1){G.selectedStage--;e.preventDefault();}if(e.code==='ArrowRight'&&G.selectedStage<7){G.selectedStage++;e.preventDefault();}if(e.code==='Digit1')G.selectedStage=1;if(e.code==='Digit2')G.selectedStage=2;if(e.code==='Digit3')G.selectedStage=3;if(e.code==='Digit4')G.selectedStage=4;if(e.code==='Digit5')G.selectedStage=5;if(e.code==='Digit6')G.selectedStage=6;if(e.code==='Digit7')G.selectedStage=7;if(e.code==='Space'||e.code==='Enter')startFromStage(G.selectedStage);}
if((G.state==='dead'||G.state==='over'||G.state==='win')&&(e.code==='Space'||e.code==='Enter')){if(G.state==='over'||G.state==='win'){G.score=0;G.coins=0;G.lives=3;mario.big=false;mario.power='none';startGame()}else{restartCurrentLevel()}}
if(G.state==='play'&&(e.code==='Space'||e.code==='ArrowUp')&&mario.onGround&&!mario.dead)doJump();
if(G.state==='play'&&e.code==='KeyZ'&&!mario.dead){if(yoshi.mounted&&yoshi.alive)yoshiAction();else if(mario.power==='fire')shootFireball()}
if(G.state==='play'&&e.code==='ArrowDown'&&mario.onGround&&!mario.dead)checkPipeEntry();
e.preventDefault()});
document.addEventListener('keyup',e=>{keys[e.code]=false});

function doJump(){
const isDash=keys['ShiftLeft']||keys['ShiftRight']||btn.dash;
if(yoshi.mounted&&yoshi.alive){mario.vy=isDash?-16:-14.5;yoshi.flutterTimer=12}
else{mario.vy=isDash?-15.5:-14}
mario.onGround=false;sfx('jump');
for(let i=0;i<6;i++)spawnParticle(mario.x+13,mario.y+mario.h,isDash?'star':'dust');
}

function checkPipeEntry(){
if(G.ugMode){for(const p of pipes){if(!p.isExit)continue;const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+4;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){exitUnderground();return}}return}
for(const p of pipes){if(!p.isWarp||p.used)continue;const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+4;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){p.used=true;enterUnderground(p);return}}
}
function enterUnderground(p){G.savedOW={platforms:[...platforms],pipes:[...pipes],coinItems:[...coinItems],enemies:[...enemies],mushrooms:[...mushrooms],piranhas:[...piranhas],movingPlats:[...movingPlats],springs:[...springs],cannons:[...cannons],cam:G.cam,mx:mario.x,my:mario.y};
platforms.length=0;pipes.length=0;coinItems.length=0;enemies.length=0;mushrooms.length=0;piranhas.length=0;movingPlats.length=0;springs.length=0;cannons.length=0;bulletBills.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
buildUnderground(p.variant||'coin');G.cam=0;mario.x=60;mario.y=H-3*TILE;mario.vx=0;mario.vy=0;G.ugMode=true;G.score+=500;sfx('flag');stopBGM();try{startBGM()}catch(ex){}}
function exitUnderground(){if(!G.savedOW)return;platforms.length=0;platforms.push(...G.savedOW.platforms);pipes.length=0;pipes.push(...G.savedOW.pipes);coinItems.length=0;coinItems.push(...G.savedOW.coinItems);enemies.length=0;enemies.push(...G.savedOW.enemies);mushrooms.length=0;mushrooms.push(...G.savedOW.mushrooms);piranhas.length=0;piranhas.push(...G.savedOW.piranhas);movingPlats.length=0;movingPlats.push(...(G.savedOW.movingPlats||[]));springs.length=0;springs.push(...(G.savedOW.springs||[]));cannons.length=0;cannons.push(...(G.savedOW.cannons||[]));bulletBills.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;G.cam=G.savedOW.cam;mario.x=G.savedOW.mx;mario.y=G.savedOW.my-TILE*2;mario.vy=-10;G.ugMode=false;G.savedOW=null;G.score+=1000;updateHUD();sfx('flag');stopBGM();try{startBGM()}catch(ex){}}

function shootFireball(){if(G.frame-G.lastFireFrame<18||fireballs.length>=2)return;G.lastFireFrame=G.frame;fireballs.push({x:mario.x+(mario.facing===1?mario.w-4:0),y:mario.y+mario.h/2-6,w:12,h:12,vx:mario.facing*9,vy:-3,bounces:0,alive:true});try{beep(880,.04,'square',.12);beep(1100,.06,'square',.1,.04)}catch(e){}}

// === YOSHI FUNCTIONS ===
function yoshiAction(){
if(yoshi.eggsReady>0){// Throw egg
yoshi.eggsReady--;
yoshiEggs.push({x:mario.x+(mario.facing===1?mario.w:0),y:mario.y+10,w:16,h:16,vx:mario.facing*7,vy:-4,bounces:0,alive:true});
sfx('yoshi_egg');return}
if(yoshi.tongueOut<=0){yoshi.tongueOut=20;yoshi.tongueLen=0;sfx('yoshi_tongue')}
}
function spawnYoshiEgg(x,y){yoshiItems.push({x,y:y-TILE,w:24,h:24,vy:-6,hatchTimer:90,hatched:false,onGround:false})}
function mountYoshi(){yoshi.mounted=true;sfx('yoshi_mount');spawnScorePopup(mario.x,mario.y-20,'YOSHI!','#2ecc71')}
function dismountYoshi(hurt){
yoshi.mounted=false;
if(hurt){yoshi.runAway=true;yoshi.runTimer=180;yoshi.vx=mario.facing*3;sfx('yoshi_dismount')}
}

function setupBtn(id,key){const el=document.getElementById(id);
const press=e=>{e.preventDefault();btn[key]=true;el.classList.add('pressed');
if(key==='jump'){if(G.state==='play'&&mario.onGround&&!mario.dead)doJump();if(G.state==='start')startFromStage(G.selectedStage);if(G.state==='dead'||G.state==='over'||G.state==='win'){if(G.state==='over'||G.state==='win'){G.score=0;G.coins=0;G.lives=3;mario.big=false;mario.power='none';startGame()}else{restartCurrentLevel()}}}else{if(G.state==='start')startGame()}};
const release=e=>{e.preventDefault();btn[key]=false;el.classList.remove('pressed')};
el.addEventListener('mousedown',press);el.addEventListener('touchstart',press,{passive:false});
el.addEventListener('mouseup',release);el.addEventListener('touchend',release);el.addEventListener('mouseleave',release)}
setupBtn('btn-left','left');setupBtn('btn-right','right');setupBtn('btn-jump','jump');setupBtn('btn-dash','dash');setupBtn('btn-down','down');
(function(){const el=document.getElementById('btn-fire');if(!el)return;
const press=e=>{e.preventDefault();if(G.state==='play'&&!mario.dead){if(yoshi.mounted&&yoshi.alive)yoshiAction();else if(mario.power==='fire')shootFireball()}el.classList.add('pressed');setTimeout(()=>el.classList.remove('pressed'),150)};
el.addEventListener('mousedown',press);el.addEventListener('touchstart',press,{passive:false})})();
document.getElementById('btn-down').addEventListener('mousedown',e=>{e.preventDefault();if(G.state==='play'&&mario.onGround&&!mario.dead)checkPipeEntry()});
document.getElementById('btn-down').addEventListener('touchstart',e=>{e.preventDefault();if(G.state==='play'&&mario.onGround&&!mario.dead)checkPipeEntry()},{passive:false});
canvas.addEventListener('click',(ev)=>{if(G.state==='start'){const r=canvas.getBoundingClientRect(),sx=W/r.width,sy=H/r.height,cx=(ev.clientX-r.left)*sx,cy=(ev.clientY-r.top)*sy;const bw=130,bh=60,gap=20,bx0=(W-(4*bw+3*gap))/2,by=248;for(let i=0;i<4;i++){if(cx>=bx0+i*(bw+gap)&&cx<=bx0+i*(bw+gap)+bw&&cy>=by&&cy<=by+bh){startFromStage(i+1);return;}}const bw2=130,bh2=60,gap2=18,row2lbl=[5,6,7],row2bx0=(W-(3*bw2+2*gap2))/2,by21=315;for(let i=0;i<3;i++){const bx2=row2bx0+i*(bw2+gap2);if(cx>=bx2&&cx<=bx2+bw2&&cy>=by21&&cy<=by21+bh2){startFromStage(row2lbl[i]);return;}}return;}if(G.state!=='play'){if(G.state==='over'||G.state==='win'){G.score=0;G.coins=0;G.lives=3;mario.big=false;mario.power='none';startGame()}else if(G.state==='dead'){restartCurrentLevel()}}});

// === HIT BLOCK ===
function hitBlock(p){
if(p.type==='yoshiEgg'&&!p.hit){p.hit=true;p.type='question';sfx('qblock');blockAnims.push({p,t:0});spawnYoshiEgg(p.x,p.y);return}
if(p.type==='hidden'&&!p.hit){p.hit=true;p.type='question';sfx('qblock');blockAnims.push({p,t:0});if(p.has1UP){mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:TILE,vx:1.5,vy:0,alive:true,type:'1up'});sfx('1up')}return}
if(p.type==='question'&&!p.hit){
if(p.coinBlock&&p.hitsLeft>0){p.hitsLeft--;if(p.hitsLeft<=0)p.hit=true;sfx('coin');blockAnims.push({p,t:0});spawnParticle(p.x+16,p.y,'coin');spawnScorePopup(p.x+16,p.y-8,200,'#FFD700');G.score+=200;G.coins++;updateHUD()}
else if(p.has1UP){p.hit=true;sfx('qblock');blockAnims.push({p,t:0});mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:TILE,vx:1.5,vy:0,alive:true,type:'1up'});sfx('1up')}
else if(p.hasStar){p.hit=true;sfx('power');blockAnims.push({p,t:0});mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:24,alive:true,type:'star'})}
else{p.hit=true;sfx('qblock');blockAnims.push({p,t:0});
if(p.hasMush){if(mario.power==='none')mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:TILE,vx:1.5,vy:0,alive:true,type:'mushroom'});else mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:24,alive:true,type:'flower'})}
else{spawnParticle(p.x+16,p.y,'coin');spawnScorePopup(p.x+16,p.y-8,200,'#FFD700');G.score+=200;G.coins++;sfx('coin');updateHUD()}}}
else if(p.type==='brick'){if(mario.big){sfx('break');G.score+=50;updateHUD();spawnParticle(p.x+16,p.y,'brick');spawnScorePopup(p.x+16,p.y-8,50,'#e67e22');const idx=platforms.indexOf(p);if(idx!==-1)platforms.splice(idx,1)}else{blockAnims.push({p,t:0})}}}

// === GAME MANAGEMENT ===
function startFromStage(n){yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.runAway=false;if(n===5){G.currentWorld=2;G.currentLevel=1;buildLevel_2_1();}else if(n===6){G.currentWorld=2;G.currentLevel=2;buildLevel_2_2();}else if(n===7){G.currentWorld=2;G.currentLevel=3;buildLevel_2_3();}else{G.currentLevel=n;G.currentWorld=1;if(n===1)buildLevel();else if(n===2)buildLevel2();else if(n===3)buildLevel3();else buildLevel4();}mario.big=false;mario.power='none';fireballs.length=0;resetMario();G.timeLeft=400;G.state='intro';G.introTimer=120;if(G.timerTick)clearInterval(G.timerTick);updateHUD();try{AC.resume()}catch(e){}}
function startGame(){G.currentLevel=1;buildLevel();mario.big=false;mario.power='none';fireballs.length=0;resetMario();G.timeLeft=400;G.state='intro';G.introTimer=120;if(G.timerTick)clearInterval(G.timerTick);updateHUD();try{AC.resume()}catch(e){}}
function restartCurrentLevel(){yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.runAway=false;if(G.currentWorld===2&&G.currentLevel===1)buildLevel_2_1();else if(G.currentWorld===2&&G.currentLevel===2)buildLevel_2_2();else if(G.currentWorld===2&&G.currentLevel===3)buildLevel_2_3();else if(G.currentLevel===1)buildLevel();else if(G.currentLevel===2)buildLevel2();else if(G.currentLevel===3)buildLevel3();else buildLevel4();mario.big=false;mario.power='none';fireballs.length=0;resetMario();G.timeLeft=400;G.state='intro';G.introTimer=120;if(G.timerTick)clearInterval(G.timerTick);updateHUD();try{AC.resume()}catch(e){}}
function killMario(force=false){
if(!force&&(G.starTimer>0||mario.inv>0))return;
if(!force&&yoshi.mounted&&yoshi.alive){dismountYoshi(true);mario.inv=120;return}
if(!force&&mario.power==='fire'){mario.power='big';mario.inv=120;sfx('break');return}
if(!force&&mario.power==='big'){mario.power='none';mario.big=false;mario.h=32;mario.inv=120;sfx('break');return}
if(yoshi.mounted&&yoshi.alive){yoshi.mounted=false;yoshi.alive=false;}
G.lives--;G.combo=0;sfx('die');stopBGM();mario.dead=true;mario.vy=-11;G.shakeX=8;G.shakeY=8;updateHUD();
setTimeout(()=>{if(G.lives<=0){G.state='over';clearInterval(G.timerTick)}else{if(G.checkpointReached&&G.checkpoint){resetMario();mario.x=G.checkpoint.x;mario.y=G.checkpoint.y-mario.h;G.cam=Math.max(0,Math.min(mario.x-W/3,LW-W));G.state='play';G.timerTick=setInterval(()=>{if(G.state==='play'){G.timeLeft--;if(G.timeLeft<=0)killMario();updateHUD()}},1000);try{startBGM()}catch(ex){}}else{G.state='dead';clearInterval(G.timerTick)}}},2200)}
function updateHUD(){if(G.coins>=100){G.coins-=100;G.lives++;sfx('1up');spawnScorePopup(mario.x+13,mario.y-20,'1UP!','#2ecc71');for(let i=0;i<10;i++)spawnParticle(mario.x+13,mario.y+24,'star')}document.getElementById('hScore').textContent=String(G.score).padStart(6,'0');document.getElementById('hCoins').textContent='x'+String(G.coins).padStart(2,'0');document.getElementById('hTime').textContent=G.timeLeft;document.getElementById('hWorld').textContent=G.currentWorld+'-'+G.currentLevel;const li=document.getElementById('lives-icons');li.innerHTML='';for(let i=0;i<Math.max(0,G.lives);i++){const s=document.createElement('span');s.textContent='🍄';s.style.fontSize='14px';li.appendChild(s)}}

// === UPDATE ===
function update(){
G.frame++;
if(bgmGain)try{scheduleBGM()}catch(e){bgmGain=null}
G.shakeX*=0.8;G.shakeY*=0.8;if(Math.abs(G.shakeX)<0.1)G.shakeX=0;if(Math.abs(G.shakeY)<0.1)G.shakeY=0;
for(let i=blockAnims.length-1;i>=0;i--){const b=blockAnims[i];b.t+=0.2;b.p.bounceOffset=Math.sin(b.t)*8*Math.max(0,1-b.t/Math.PI);if(b.t>Math.PI){b.p.bounceOffset=0;blockAnims.splice(i,1)}}
if(G.state==='intro'){G.introTimer--;updateParticles();if(G.introTimer<=0){G.state='play';G.timerTick=setInterval(()=>{if(G.state==='play'){G.timeLeft--;if(G.timeLeft<=0)killMario();updateHUD()}},1000);try{startBGM()}catch(e2){}}return}
if(G.goalSlide){G.goalSlide.t++;if(G.goalSlide.phase==='slide'){mario.y+=3;mario.x=flagPole.x-4;if(mario.y>=H-TILE-mario.h){mario.y=H-TILE-mario.h;G.goalSlide.phase='walk'}}else if(G.goalSlide.phase==='walk'){mario.x+=2;mario.facing=1;mario.walkTimer++;if(mario.walkTimer>5){mario.walkTimer=0;mario.walkFrame=(mario.walkFrame+1)%3}if(G.goalSlide.t>120){G.goalSlide=null;G.score+=1000+G.timeLeft*50;clearInterval(G.timerTick);updateHUD();if(G.currentWorld===1&&G.currentLevel===1){G.currentLevel=2;buildLevel2();fireballs.length=0;resetMario();G.timeLeft=400;G.state='intro';G.introTimer=120;try{startBGM()}catch(e){}updateHUD()}else if(G.currentWorld===1&&G.currentLevel===2){G.currentLevel=3;buildLevel3();fireballs.length=0;resetMario();G.timeLeft=400;G.state='intro';G.introTimer=120;try{startBGM()}catch(e){}updateHUD()}else if(G.currentWorld===1&&G.currentLevel===3){G.currentLevel=4;buildLevel4();fireballs.length=0;resetMario();G.timeLeft=400;G.state='intro';G.introTimer=120;try{startBGM()}catch(e){}updateHUD()}else if(G.currentLevel===4&&G.currentWorld===1){G.currentLevel=1;G.currentWorld=2;buildLevel_2_1();fireballs.length=0;resetMario();G.timeLeft=400;G.state='intro';G.introTimer=120;try{startBGM()}catch(e){}updateHUD()}else if(G.currentWorld===2&&G.currentLevel===1){G.currentLevel=2;buildLevel_2_2();fireballs.length=0;resetMario();G.timeLeft=400;G.state='intro';G.introTimer=120;try{startBGM()}catch(e){}updateHUD()}else if(G.currentWorld===2&&G.currentLevel===2){G.currentLevel=3;buildLevel_2_3();fireballs.length=0;resetMario();G.timeLeft=400;G.state='intro';G.introTimer=120;try{startBGM()}catch(e){}updateHUD()}else{G.state='win';for(let i=0;i<30;i++)setTimeout(()=>spawnParticle(mario.x,H-TILE-100+Math.random()*80,'star'),i*60)}}}updateParticles();return}
// Moving platforms
for(const mp of movingPlats){if(mp.type==='h')mp.x=mp.ox+Math.sin(G.frame*0.015*mp.spd)*mp.range;else if(mp.type==='v')mp.y=mp.oy+Math.sin(G.frame*0.015*mp.spd)*mp.range;else if(mp.type==='fall'){if(mp.falling){mp.vy+=0.3;mp.y+=mp.vy;if(mp.y>H+100){mp.y=mp.oy;mp.vy=0;mp.falling=false;mp.fallTimer=0}}}}
if(G.starTimer>0){G.starTimer--;if(G.frame%3===0)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');if(G.starTimer<=0){mario.inv=0;stopBGM();try{startBGM()}catch(e){}}}
if(G.comboTimer>0){G.comboTimer--;if(G.comboTimer<=0)G.combo=0}
// Bullet Bill Cannons
for(const cn of cannons){cn.timer--;if(cn.timer<=0){cn.timer=cn.fireRate;if(Math.abs(mario.x-cn.x)<600){const dir=mario.x>cn.x?1:-1;bulletBills.push({x:cn.x+(dir>0?cn.w:-20),y:cn.y+4,w:20,h:16,vx:dir*4,alive:true});try{beep(80,.15,'sawtooth',.15);beep(60,.2,'sawtooth',.1,.1)}catch(ex){}}}}
// Bullet Bills
for(let i=bulletBills.length-1;i>=0;i--){const bb=bulletBills[i];if(!bb.alive){bulletBills.splice(i,1);continue}bb.x+=bb.vx;if(bb.x<G.cam-100||bb.x>G.cam+W+100){bulletBills.splice(i,1);continue}
if((mario.inv===0||G.starTimer>0)&&!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,bb.x,bb.y,bb.w,bb.h)){if(G.starTimer>0){bb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(bb.x+10,bb.y+8,'star')}else if(mario.y+mario.h-mario.vy<=bb.y+4){bb.alive=false;mario.vy=-9;G.score+=200;sfx('stomp');updateHUD();spawnParticle(bb.x+10,bb.y+8,'dust');spawnScorePopup(bb.x+10,bb.y-8,200,'#e74c3c')}else killMario()}
for(const fb of fireballs){if(!fb.alive)continue;if(overlap(fb.x,fb.y,fb.w,fb.h,bb.x,bb.y,bb.w,bb.h)){bb.alive=false;fb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(bb.x+10,bb.y+8,'star')}}}
// Hammer Bros AI
for(const e of enemies){if(!e.alive||e.type!=='hammerBro'||e.state==='dead')continue;
if(e.hammerTimer!==undefined){e.hammerTimer--;if(e.hammerTimer<=0){e.hammerTimer=80+Math.floor(Math.random()*60);const dir=mario.x>e.x?1:-1;hammers.push({x:e.x+8,y:e.y-8,w:14,h:14,vx:dir*3.5,vy:-8,alive:true,rot:0});try{beep(440,.04,'sawtooth',.12)}catch(ex){}}}
if(e.jumpTimer!==undefined){e.jumpTimer--;if(e.jumpTimer<=0&&e.onGround){e.vy=-10;e.onGround=false;e.jumpTimer=100+Math.floor(Math.random()*60)}}
if(e.onGround&&Math.random()<0.01)e.vx=-e.vx}
// Hammers
for(let i=hammers.length-1;i>=0;i--){const h=hammers[i];h.x+=h.vx;h.vy+=0.35;h.y+=h.vy;h.rot+=0.3;if(h.y>H+50){hammers.splice(i,1);continue}
if(mario.inv===0&&!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,h.x,h.y,h.w,h.h)){if(G.starTimer>0){hammers.splice(i,1);G.score+=100;updateHUD()}else killMario()}}

// === ワンワン更新 ===
for(let i=chainChomps.length-1;i>=0;i--){
  const cc=chainChomps[i];if(!cc.alive){chainChomps.splice(i,1);continue}
  const dx=mario.x+13-cc.postX;
  if(cc.state==='idle'){
    cc.phase+=0.08;cc.y=cc.postY+Math.sin(cc.phase)*18-18;
    if(Math.abs(dx)<180&&G.starTimer===0){cc.state='lunge';cc.vx=dx>0?8:-8;cc.vy=-4;cc.lungeTimer=60}}
  else if(cc.state==='lunge'){
    cc.x+=cc.vx;cc.y+=cc.vy;cc.vy+=0.4;cc.lungeTimer--;
    if(cc.y>cc.postY){cc.y=cc.postY;cc.vy=0}
    if(cc.lungeTimer<=0){cc.state='return'}}
  else if(cc.state==='return'){
    cc.x+=(cc.postX-cc.x)*0.12;cc.y+=(cc.postY-cc.y)*0.12;
    if(Math.abs(cc.x-cc.postX)<2&&Math.abs(cc.y-cc.postY)<2){cc.x=cc.postX;cc.y=cc.postY;cc.state='idle'}}
  // マリオとの衝突
  if(overlap(mario.x,mario.y,mario.w,mario.h,cc.x,cc.y,cc.w,cc.h)){
    if(G.starTimer>0){cc.alive=false;G.score+=500;sfx('stomp');spawnScorePopup(cc.x,cc.y-8,500,'#e74c3c')}
    else if(mario.inv===0)killMario();
  }
}

// === 飛び跳ねるブロック更新 ===
for(let i=jumpBlocks.length-1;i>=0;i--){
  const jb=jumpBlocks[i];if(!jb.alive){jumpBlocks.splice(i,1);continue}
  jb.vy+=GRAVITY;jb.x+=jb.vx;jb.y+=jb.vy;jb.onGround=false;
  for(const p of platforms){
    if(Math.abs((p.x+16)-jb.x)>200)continue;
    const py=p.y-(p.bounceOffset||0);
    if(overlap(jb.x,jb.y,jb.w,jb.h,p.x,py,p.w,p.h)){
      if(jb.vy>0&&jb.y+jb.h/2<py+p.h/2){jb.y=py-jb.h;jb.vy=0;jb.onGround=true}
      else if(jb.vy<0){jb.y=py+p.h;jb.vy=0}
      else{jb.vx=-jb.vx}
    }
  }
  if(jb.onGround){jb.jumpTimer--;if(jb.jumpTimer<=0){jb.vy=-10;jb.jumpTimer=60+Math.floor(Math.random()*40)}}
  if(jb.x<-100||jb.x>LW+100||jb.y>H+100){jb.alive=false;continue}
  // マリオとの衝突
  const mBot=mario.y+mario.h;
  if(overlap(mario.x,mario.y,mario.w,mario.h,jb.x,jb.y,jb.w,jb.h)){
    if(G.starTimer>0){jb.alive=false;G.score+=400;sfx('stomp');spawnScorePopup(jb.x,jb.y-8,400,'#e67e22');for(let k=0;k<5;k++)spawnParticle(jb.x+14,jb.y+14,'brick')}
    else if(mBot-mario.vy<=jb.y+jb.h*0.4&&mario.vy>0){jb.alive=false;mario.vy=-9;G.score+=400;sfx('stomp');spawnScorePopup(jb.x,jb.y-8,400,'#e67e22');for(let k=0;k<5;k++)spawnParticle(jb.x+14,jb.y+14,'brick')}
    else if(mario.inv===0)killMario();
  }
}

// === パイポ更新 ===
for(let i=pipos.length-1;i>=0;i--){
  const pp=pipos[i];if(!pp.alive){pipos.splice(i,1);continue}
  pp.vy+=GRAVITY;pp.x+=pp.vx;pp.y+=pp.vy;
  for(const p of platforms){
    if(Math.abs((p.x+16)-pp.x)>200)continue;
    const py=p.y-(p.bounceOffset||0);
    if(overlap(pp.x,pp.y,pp.w,pp.h,p.x,py,p.w,p.h)){
      if(pp.vy>0&&pp.y+pp.h/2<py+p.h/2){pp.y=py-pp.h;pp.vy=-7;pp.bounceCount++}
      else{pp.vx=-pp.vx}
    }
  }
  if(pp.x<-100||pp.x>LW+100||pp.y>H+200){pp.alive=false;continue}
  // マリオとの衝突
  const mBot2=mario.y+mario.h;
  if(overlap(mario.x,mario.y,mario.w,mario.h,pp.x,pp.y,pp.w,pp.h)){
    if(G.starTimer>0){pp.alive=false;G.score+=300;sfx('stomp');spawnScorePopup(pp.x,pp.y-8,300,'#e74c3c')}
    else if(mBot2-mario.vy<=pp.y+pp.h*0.4&&mario.vy>0){pp.alive=false;mario.vy=-9;G.score+=300;sfx('stomp');spawnScorePopup(pp.x,pp.y-8,300,'#e74c3c')}
    else if(mario.inv===0)killMario();
  }
}

if(G.state!=='play'&&!mario.dead){updateParticles();return}
if(!mario.dead){
const isDash=keys['ShiftLeft']||keys['ShiftRight']||btn.dash;const spd=isDash?6.5:3.8;
const goL=keys['ArrowLeft']||keys['KeyA']||btn.left;const goR=keys['ArrowRight']||keys['KeyD']||btn.right;
if(goL){mario.vx+=(-spd-mario.vx)*0.25;mario.facing=-1}else if(goR){mario.vx+=(spd-mario.vx)*0.25;mario.facing=1}else mario.vx*=0.78;
if(G.ugMode&&mario.x<0)mario.x=0;if(G.ugMode&&mario.x+mario.w>W)mario.x=W-mario.w;if(G.ugMode)G.cam=0;
// Flutter jump (Yoshi)
if(yoshi.mounted&&yoshi.alive&&yoshi.flutterTimer>0&&(keys['Space']||keys['ArrowUp']||btn.jump)&&mario.vy>0){mario.vy*=0.6;yoshi.flutterTimer--;if(G.frame%2===0)spawnParticle(mario.x+13,mario.y+mario.h,'dust')}
if(!(keys['Space']||keys['ArrowUp']||btn.jump)&&mario.vy<-4)mario.vy+=1.2;
mario.x+=mario.vx;if(mario.x<0)mario.x=0;G.cam=Math.max(0,Math.min(mario.x-W/3,LW-W));
for(const p of platforms){if(Math.abs((p.x+16)-mario.x)>260)continue;cX(mario,p)}
for(const p of pipes){if(Math.abs((p.x+32)-mario.x)>260)continue;cX(mario,p)}
mario.vy+=GRAVITY;if(mario.vy>15)mario.vy=15;mario.y+=mario.vy;mario.onGround=false;
for(const p of platforms){if(Math.abs((p.x+16)-mario.x)>260)continue;
if(p.type==='hidden'&&!p.hit){const bo=p.bounceOffset||0,py=p.y-bo;if(overlap(mario.x+1,mario.y,mario.w-2,mario.h,p.x,py,p.w,p.h)){if(mario.y+mario.h/2>=py+p.h/2){mario.y=py+p.h;mario.vy=0;hitBlock(p)}}continue}
cY(mario,p,hitBlock)}
for(const p of pipes){if(Math.abs((p.x+32)-mario.x)>260)continue;cY(mario,p,null)}
// Moving platform collision
for(const mp of movingPlats){if(mp.falling&&mp.y>H)continue;if(overlap(mario.x+1,mario.y,mario.w-2,mario.h,mp.x,mp.y,mp.w,mp.h)){if(mario.y+mario.h/2<mp.y+mp.h/2){mario.y=mp.y-mario.h;mario.vy=0;mario.onGround=true;if(mp.type==='fall'&&!mp.falling){mp.fallTimer++;if(mp.fallTimer>30)mp.falling=true}}}}
// Springs
for(const sp of springs){if(sp.compressed>0){sp.compressed--;continue}if(overlap(mario.x,mario.y,mario.w,mario.h,sp.x,sp.y,sp.w,sp.h)){if(mario.y+mario.h-mario.vy<=sp.y+4){mario.vy=-20;mario.onGround=false;sp.compressed=15;sfx('jump');for(let i=0;i<6;i++)spawnParticle(sp.x+12,sp.y,'star')}}}
if(Math.abs(mario.vx)>0.5&&mario.onGround){mario.walkTimer++;if(mario.walkTimer>5){mario.walkTimer=0;mario.walkFrame=(mario.walkFrame+1)%3}}else if(mario.onGround)mario.walkFrame=0;
if(mario.y>H+40)killMario(true);
if(mario.inv>0)mario.inv--;

// === YOSHI UPDATE ===
// Yoshi items (hatching eggs)
for(let i=yoshiItems.length-1;i>=0;i--){const yi=yoshiItems[i];
if(!yi.onGround){yi.vy+=GRAVITY;yi.y+=yi.vy;if(yi.y>=H-TILE-yi.h){yi.y=H-TILE-yi.h;yi.vy=0;yi.onGround=true}}
if(yi.onGround){yi.hatchTimer--;if(yi.hatchTimer<=0&&!yi.hatched){yi.hatched=true;
yoshi.x=yi.x;yoshi.y=yi.y-yoshi.h+yi.h;yoshi.alive=true;yoshi.mounted=false;yoshi.runAway=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.facing=1;yoshi.vx=0;yoshi.vy=0;yoshi.idleTimer=0;
sfx('power');for(let j=0;j<15;j++)spawnParticle(yi.x+12,yi.y,'star');yoshiItems.splice(i,1)}}}
// Yoshi free-roaming / run away
if(yoshi.alive&&!yoshi.mounted){
if(yoshi.runAway){yoshi.runTimer--;yoshi.x+=yoshi.vx;yoshi.vy+=GRAVITY;yoshi.y+=yoshi.vy;yoshi.onGround=false;
for(const p of platforms){if(Math.abs((p.x+16)-yoshi.x)>260)continue;cY(yoshi,p,null)}
if(yoshi.y>H+100){yoshi.alive=false;}else if(yoshi.runTimer<=0){yoshi.runAway=false;yoshi.vx=0;yoshi.vy=0;yoshi.idleTimer=480;}}
else{// Idle yoshi, Mario can mount
if(yoshi.idleTimer>0){yoshi.idleTimer--;if(yoshi.idleTimer<=0){yoshi.alive=false;}}
if(yoshi.alive&&overlap(mario.x,mario.y,mario.w,mario.h,yoshi.x,yoshi.y,yoshi.w,yoshi.h)){mountYoshi();yoshi.idleTimer=0;}}}
// Yoshi mounted - follow Mario
if(yoshi.alive&&yoshi.mounted){yoshi.x=mario.x-2;yoshi.y=mario.y+mario.h-yoshi.h+8;yoshi.facing=mario.facing;
// Tongue
if(yoshi.tongueOut>0){yoshi.tongueOut--;yoshi.tongueLen=Math.min(yoshi.tongueLen+8,yoshi.tongueMaxLen);
const tx=yoshi.x+(yoshi.facing===1?yoshi.w:0)+yoshi.facing*yoshi.tongueLen;const ty=yoshi.y+15;
for(const e of enemies){if(!e.alive||e.state==='dead')continue;if(overlap(tx-10,ty-90,20,110,e.x,e.y,e.w,e.h)){e.state='dead';e.squishT=1;e.alive=false;sfx('yoshi_eat');G.score+=200;yoshi.eatCount++;if(yoshi.eatCount>=10){yoshi.eatCount=0;G.starTimer=600;mario.inv=600;spawnScorePopup(mario.x,mario.y-30,'★STAR!','#FFD700');for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+24,'star');sfx('power');stopBGM();try{startBGM()}catch(ex){}}updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,200,'#27ae60');break}}}}
// Yoshi thrown eggs
for(let i=yoshiEggs.length-1;i>=0;i--){const eg=yoshiEggs[i];if(!eg.alive){yoshiEggs.splice(i,1);continue}
eg.vy+=0.4;eg.x+=eg.vx;eg.y+=eg.vy;
for(const p of[...platforms,...pipes]){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(eg.x,eg.y,eg.w,eg.h,p.x,py,p.w,p.h))continue;if(eg.y+eg.h/2<py+p.h/2){eg.y=py-eg.h;eg.vy=-6;eg.bounces++}else{eg.vx=-eg.vx}break}
if(eg.bounces>3||eg.x<G.cam-80||eg.x>G.cam+W+80||eg.y>H+50){eg.alive=false;continue}
for(const e of enemies){if(!e.alive||e.state==='dead')continue;if(overlap(eg.x,eg.y,eg.w,eg.h,e.x,e.y,e.w,e.h)){e.state='dead';e.squishT=20;eg.alive=false;G.score+=300;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,300,'#2ecc71')}}}

// Coins
for(const c of coinItems){if(c.collected)continue;if(c.pop){c.popY+=c.popVy;c.popVy+=0.4;c.life--;if(c.life<=0)c.collected=true;continue}
if(overlap(mario.x,mario.y,mario.w,mario.h,c.x,c.y,TILE,TILE)){c.collected=true;G.coins++;G.score+=100;sfx('coin');updateHUD();spawnScorePopup(c.x+8,c.y,'+100','#FFD700');spawnParticle(c.x+8,c.y,'coin')}}
// Mushrooms etc
for(const m of mushrooms){if(!m.alive)continue;
if(m.type==='flower'||m.type==='star'){if(m.type==='star')m.bobY=(m.bobY||0)+0.1;
if(overlap(mario.x,mario.y,mario.w,mario.h,m.x,m.y+(m.type==='star'?Math.sin(m.bobY||0)*4:0),m.w,m.h)){m.alive=false;
if(m.type==='star'){G.starTimer=480;mario.inv=60;sfx('power');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'STAR!','#FFD700');for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+24,'star');stopBGM();try{startBGM()}catch(ex){}}
else{upgradeMario('flower');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'1000','#FF6B6B')}}continue}
m.x+=m.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-m.x)>220)continue;cX(m,p)}
m.vy+=GRAVITY;m.y+=m.vy;m.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-m.x)>220)continue;cY(m,p,null)}
if(m.y>H+100){m.alive=false;continue}
if(overlap(mario.x,mario.y,mario.w,mario.h,m.x,m.y,m.w,m.h)){m.alive=false;
if(m.type==='1up'){G.lives++;sfx('1up');updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'1UP!','#2ecc71');for(let i=0;i<10;i++)spawnParticle(mario.x+13,mario.y+24,'star')}
else{upgradeMario('mushroom');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'1000','#2ecc71')}}}
// Enemies
for(const e of enemies){if(!e.alive)continue;if(e.state==='dead'){e.squishT--;if(e.squishT<=0)e.alive=false;continue}
if(e.type==='parakoopa'&&e.flying){e.x+=e.vx;if(e.x+e.w<-100){e.alive=false;continue}e.y=e.baseY+Math.sin(G.frame*0.05+(e.phase||0))*22;if((mario.inv===0||G.starTimer>0)&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');continue}if(mario.y+mario.h-mario.vy<=e.y+e.h*0.4){e.flying=false;e.type='koopa';e.state='shell';e.vx=0;e.h=TILE*0.7;e.shellTimer=300;mario.vy=-9;sfx('stomp');G.combo++;G.comboTimer=60;G.score+=200;updateHUD();spawnParticle(e.x+16,e.y,'dust');spawnScorePopup(e.x+8,e.y-8,200,'#e74c3c')}else killMario()}continue}
e.x+=e.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p)}
e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null)}
if(e.y>H+100){e.alive=false;continue}
if(e.onGround&&e.state==='walk'){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2}}
if(e.state==='shell'&&Math.abs(e.vx)>1){for(const o of enemies){if(o===e||!o.alive||o.state==='dead')continue;if(overlap(e.x,e.y,e.w,e.h,o.x,o.y,o.w,o.h)){o.state='dead';o.squishT=20;G.score+=200;sfx('stomp');updateHUD();spawnScorePopup(o.x+8,o.y-8,200,'#e74c3c')}}}
if((mario.inv===0||G.starTimer>0)&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
if(G.starTimer>0){e.state='dead';e.squishT=20;G.score+=200;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');continue}
const mBot=mario.y+mario.h;if(mBot-mario.vy<=e.y+e.h*0.4){G.combo++;G.comboTimer=60;const cs=G.combo<=1?200:G.combo===2?400:G.combo===3?800:G.combo===4?1600:0;if(G.combo>=5){G.lives++;sfx('1up');spawnScorePopup(e.x+8,e.y-8,'1UP!','#2ecc71')}else{G.score+=cs;spawnScorePopup(e.x+8,e.y-8,cs,'#e74c3c')}
mario.vy=-9;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'dust');
if(e.type==='goomba'||e.type==='hammerBro'){e.state='dead';e.squishT=28}
else if(e.type==='koopa'||e.type==='buzzy'){if(e.state==='walk'){e.state='shell';e.vx=0;e.h=TILE*0.7;e.shellTimer=300}else if(e.state==='shell'&&Math.abs(e.vx)<0.5)e.vx=mario.facing*8;else{e.vx=0;e.shellTimer=300}}}
else if(e.state==='shell'&&Math.abs(e.vx)<0.5){e.vx=mario.facing*8;sfx('stomp');mario.inv=10}else killMario()}
if(e.state==='shell'){e.shellTimer--;if(e.shellTimer<=0){e.state='walk';e.vx=e.type==='buzzy'?-1.6:-1.3;e.h=e.type==='koopa'?TILE*1.2:e.type==='buzzy'?TILE*0.85:TILE}}}
// Piranhas
for(const pr of piranhas){if(!pr.alive)continue;const t=G.frame*0.03+pr.phase;pr.y=pr.baseY-Math.max(0,Math.sin(t))*pr.maxUp;
if(overlap(mario.x,mario.y,mario.w,mario.h,pr.x,pr.y,pr.w,pr.h)){if(G.starTimer>0){pr.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(pr.x+8,pr.y,'star');spawnScorePopup(pr.x+8,pr.y-8,200,'#FFD700')}else if(mario.inv===0)killMario();}
for(const fb of fireballs){if(!fb.alive)continue;if(overlap(fb.x,fb.y,fb.w,fb.h,pr.x,pr.y,pr.w,pr.h)){pr.alive=false;fb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(pr.x+8,pr.y,'star');spawnScorePopup(pr.x+8,pr.y-8,200,'#27ae60')}}}
// Bowser boss
if(bowser.alive){
if(bowser.state!=='dead'){
if(bowser.hurtTimer>0)bowser.hurtTimer--;
bowser.vy+=GRAVITY;bowser.x+=bowser.vx;bowser.y+=bowser.vy;
bowser.onGround=false;
for(const p of platforms){const py=p.y-(p.bounceOffset||0);if(overlap(bowser.x,bowser.y,bowser.w,bowser.h,p.x,py,p.w,p.h)&&bowser.vy>=0&&bowser.y+bowser.h/2<py+p.h/2){bowser.y=py-bowser.h;bowser.vy=0;bowser.onGround=true;break}}
if(bowser.y>H+50){bowser.y=H-TILE-bowser.h;bowser.vy=0;bowser.onGround=true}
if(bowser.x<6700){bowser.x=6700;bowser.vx=Math.abs(bowser.vx)}
if(bowser.x+bowser.w>7750){bowser.x=7750-bowser.w;bowser.vx=-Math.abs(bowser.vx)}
bowser.facing=bowser.vx>=0?1:-1;
bowser.jumpTimer--;if(bowser.jumpTimer<=0&&bowser.onGround){bowser.vy=-12;bowser.onGround=false;bowser.jumpTimer=200+Math.floor(Math.random()*80)}
bowser.fireTimer--;if(bowser.fireTimer<=0){bowser.fireTimer=(G.currentWorld===2?60:90)+Math.floor(Math.random()*50);const dir=mario.x<bowser.x+bowser.w/2?-1:1;const bfx=bowser.x+(dir>0?bowser.w:0),bfy=bowser.y+24;for(let bi=0;bi<3;bi++){bowserFire.push({x:bfx,y:bfy,w:18,h:18,vx:dir*(5.5+bi*0.4),vy:-3.5,bounces:0,alive:true,delay:bi*8,armed:bi===0});}try{beep(180,.12,'sawtooth',.18);beep(140,.1,'sawtooth',.12,.06);}catch(ex){}}
if(mario.inv===0&&G.starTimer===0&&overlap(mario.x,mario.y,mario.w,mario.h,bowser.x,bowser.y,bowser.w,bowser.h)){
const mBot=mario.y+mario.h;
if(mBot-mario.vy<=bowser.y+bowser.h*0.35&&bowser.hurtTimer===0){bowser.hurtTimer=70;bowser.hp--;mario.vy=-11;sfx('stomp');spawnScorePopup(bowser.x+32,bowser.y-8,500,'#e74c3c');if(bowser.hp<=0){bowser.state='dead';bowser.deadTimer=160;stopBGM();G.score+=5000;updateHUD();for(let pi=0;pi<20;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star')}}
else killMario()}
for(let i=fireballs.length-1;i>=0;i--){const fb=fireballs[i];if(!fb.alive)continue;if(bowser.hurtTimer===0&&overlap(fb.x,fb.y,fb.w,fb.h,bowser.x,bowser.y,bowser.w,bowser.h)){fb.alive=false;bowser.hurtTimer=70;bowser.hp--;sfx('stomp');spawnScorePopup(bowser.x+32,bowser.y-8,500,'#ff9944');spawnParticle(bowser.x+32,bowser.y+20,'star');if(bowser.hp<=0){bowser.state='dead';bowser.deadTimer=160;stopBGM();G.score+=5000;updateHUD();for(let pi=0;pi<20;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star')}}}
}else{
bowser.deadTimer--;if(G.frame%4===0)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');
if(bowser.deadTimer<=0){bowser.alive=false;peach.alive=true;peach.x=bowser.x+bowser.w+40;peach.y=H-TILE-peach.h;peach.vx=3.5;peach.caught=false;peach.walkFrame=0;peach.walkTimer=0;G.peachChase={t:0};}
}
}
// Bowser fire projectiles
for(let i=bowserFire.length-1;i>=0;i--){const bf=bowserFire[i];if(!bf.alive){bowserFire.splice(i,1);continue}
if(bf.delay>0){bf.delay--;continue}if(!bf.armed){bf.armed=true;}
bf.vy+=0.45;bf.x+=bf.vx;bf.y+=bf.vy;
let hit=false;for(const p of platforms){const py=p.y-(p.bounceOffset||0);if(!overlap(bf.x,bf.y,bf.w,bf.h,p.x,py,p.w,p.h))continue;if(bf.y+bf.h/2<py+p.h/2&&bf.vy>0){bf.y=py-bf.h;bf.vy=-(Math.abs(bf.vy)*0.72+1.5);bf.bounces++;if(bf.vy<-9)bf.vy=-9;}else{bf.alive=false;}hit=true;break;}
if(bf.bounces>6||bf.y>H+40||bf.x<-200||bf.x>LW+200)bf.alive=false;
if(mario.inv===0&&bf.armed&&overlap(bf.x,bf.y,bf.w,bf.h,mario.x,mario.y,mario.w,mario.h)){if(G.starTimer>0){bf.alive=false}else killMario()}}
// Peach chase
if(G.peachChase&&peach.alive){
G.peachChase.t++;
if(!peach.caught){
peach.x+=peach.vx;peach.walkTimer++;if(peach.walkTimer>7){peach.walkTimer=0;peach.walkFrame=(peach.walkFrame+1)%2;}
mario.vx=3;mario.x+=3;mario.facing=1;mario.walkTimer++;if(mario.walkTimer>5){mario.walkTimer=0;mario.walkFrame=(mario.walkFrame+1)%3;}
G.cam=Math.max(0,Math.min(mario.x-W/3,LW-W));
if(mario.x+mario.w>=peach.x){peach.caught=true;peach.vx=0;G.peachChase.catchT=0;sfx('power');for(let pi=0;pi<20;pi++)spawnParticle(peach.x+15,peach.y+20,'star');}
}else{
G.peachChase.catchT++;
if(G.peachChase.catchT===1){G.score+=10000;updateHUD();}
if(G.peachChase.catchT>120){G.peachChase=null;peach.alive=false;G.state='win';for(let wi=0;wi<30;wi++)setTimeout(()=>spawnParticle(mario.x+Math.random()*200-100,H-TILE-100+Math.random()*80,'star'),wi*60);}
}
}
// Lava flames
for(const f of lavaFlames){f.phase++;const cyc=f.phase%f.period,rise=Math.floor(f.period*0.28),stay=Math.floor(f.period*0.18);if(cyc<rise){f.curH=Math.min(f.maxH,(cyc/rise)*f.maxH*1.1)}else if(cyc<rise+stay){f.curH=f.maxH}else{f.curH=Math.max(0,f.curH-f.maxH/(rise*0.7))}if(f.curH>12){const ft=H-TILE-f.curH;if(mario.inv===0&&G.starTimer===0&&mario.x+mario.w>f.x-2&&mario.x<f.x+f.w+2&&mario.y+mario.h>ft&&mario.y<H-TILE)killMario()}}
if(G.ugMode&&mario.x>W-1.5*TILE&&mario.onGround)exitUnderground();
if(G.checkpoint&&!G.checkpointReached&&mario.x>G.checkpoint.x){G.checkpointReached=true;G.checkpoint.reached=true;sfx('flag');spawnScorePopup(G.checkpoint.x,G.checkpoint.y-TILE*3,'CHECK!','#2ecc71');for(let i=0;i<10;i++)spawnParticle(G.checkpoint.x+8,G.checkpoint.y-TILE*2,'star')}
if(G.currentLevel!==4&&!(G.currentWorld===2&&G.currentLevel===3)&&!G.ugMode&&!mario.dead&&mario.x+mario.w>=flagPole.x&&mario.x<=flagPole.x+20){sfx('flag');stopBGM();G.goalSlide={phase:'slide',t:0};mario.vx=0;mario.vy=0}
// Fireballs
for(let i=fireballs.length-1;i>=0;i--){const fb=fireballs[i];if(!fb.alive){fireballs.splice(i,1);continue}
fb.vy+=0.55;fb.x+=fb.vx;fb.y+=fb.vy;
for(const p of[...platforms,...pipes]){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(fb.x,fb.y,fb.w,fb.h,p.x,py,p.w,p.h))continue;if(fb.y+fb.h/2<py+p.h/2){fb.y=py-fb.h;fb.vy=-8;fb.bounces++}else fb.alive=false;break}
if(fb.bounces>4||fb.x<G.cam-80||fb.x>G.cam+W+80||fb.y>H+50)fb.alive=false;
for(const e of enemies){if(!e.alive||e.state==='dead')continue;if(!overlap(fb.x,fb.y,fb.w,fb.h,e.x,e.y,e.w,e.h))continue;
if(e.type==='buzzy'){fb.alive=false;spawnParticle(e.x+16,e.y+16,'dust');continue}
e.state='dead';e.vx=0;e.squishT=28;fb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnScorePopup(e.x+8,e.y-8,200,'#ff9944');spawnParticle(e.x+16,e.y+16,'star')}}
}else{mario.vy+=GRAVITY;mario.y+=mario.vy}
updateParticles();
}

// ================================================================
// DRAWING - Enhanced Mario-style visuals
// ================================================================
function drawBG(){
if(G.ugMode){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.fillStyle='#1a1a2e';for(let x=0;x<W;x+=TILE*3){ctx.fillRect(x,TILE,8,8);ctx.fillRect(x+16,TILE+16,8,8)}return}
if(G.currentWorld===2&&G.currentLevel===3){
  // 城（暗い赤〜黒グラデーション）
  const cg=ctx.createLinearGradient(0,0,0,H);
  cg.addColorStop(0,'#0a0000');cg.addColorStop(0.5,'#1e0505');cg.addColorStop(1,'#350808');
  ctx.fillStyle=cg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,40,0,0.07)';ctx.fillRect(0,H-TILE*3,W,TILE*3);
  const cx2=G.cam*0.15;ctx.fillStyle='rgba(55,15,15,0.4)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-cx2%64);for(let by=0;by<H-TILE*3;by+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30)}}
  return;
}
if(G.currentWorld===2&&G.currentLevel===2){
  // 夕焼け砂漠
  const dg2=ctx.createLinearGradient(0,0,0,H);
  dg2.addColorStop(0,'#7b1a1a');dg2.addColorStop(0.4,'#c05000');dg2.addColorStop(0.75,'#e07820');dg2.addColorStop(1,'#a05020');
  ctx.fillStyle=dg2;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#7a3000';
  ctx.beginPath();ctx.moveTo(0,H);
  for(let i=0;i<=W;i+=60)ctx.lineTo(i,H-50-Math.abs(Math.sin(i*0.015+2))*70);
  ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  // 月
  ctx.fillStyle='#fff0a0';ctx.beginPath();ctx.arc(130,65,26,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e08020';ctx.beginPath();ctx.arc(147,58,20,0,Math.PI*2);ctx.fill();
  return;
}
if(G.currentWorld===2){
  // 砂漠の空（オレンジ〜黄色グラデーション）
  const dg=ctx.createLinearGradient(0,0,0,H);
  dg.addColorStop(0,'#f4a460');dg.addColorStop(0.6,'#daa520');dg.addColorStop(1,'#cd853f');
  ctx.fillStyle=dg;ctx.fillRect(0,0,W,H);
  // 砂丘シルエット
  ctx.fillStyle='#c8a050';
  ctx.beginPath();ctx.moveTo(0,H);
  for(let i=0;i<=W;i+=40)ctx.lineTo(i,H-30-Math.sin(i*0.02+1)*25);
  ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  // 太陽
  ctx.fillStyle='#fff7aa';ctx.beginPath();ctx.arc(680,60,40,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(680,60,32,0,Math.PI*2);ctx.fill();
  return;
}
// Evening sky (1-2)
if(G.currentLevel===2){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1060');g.addColorStop(0.3,'#c04000');g.addColorStop(0.6,'#ff8c00');g.addColorStop(0.85,'#ffd040');g.addColorStop(1,'#ffe8a0');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(255,220,80,0.35)';ctx.beginPath();ctx.arc(W*0.72-G.cam*0.02,H*0.68,52,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffe050';ctx.beginPath();ctx.arc(W*0.72-G.cam*0.02,H*0.68,36,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#2a1500';[400,1100,2200,3600,5100,6600].forEach(mx=>{const dx=mx-G.cam*0.25;if(dx<-300||dx>W+300)return;ctx.beginPath();ctx.moveTo(dx-20,H-TILE);ctx.quadraticCurveTo(dx+90,H-TILE-85,dx+200,H-TILE);ctx.fill();});
ctx.fillStyle='#1a0e00';[200,700,1500,2400,3300,4200,5100,6000].forEach((bx,i)=>{const dx=bx-G.cam*0.3;if(dx<-100||dx>W+100)return;const bw=44+(i%3)*20;ctx.beginPath();ctx.arc(dx,H-TILE+2,bw/3,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx-bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx+bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill();});
[100,500,900,1400,2100,2900,3700,4600,5500,6400].forEach((cx,i)=>{const dx=cx-G.cam*0.35;if(dx<-140||dx>W+140)return;const cy=35+(i%3)*28;ctx.fillStyle='rgba(255,150,50,0.65)';ctx.beginPath();ctx.arc(dx+30,cy+20,20,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+55,cy+14,26,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+80,cy+20,20,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+12,cy+20,76,16);});
return;}
// Castle (1-4)
if(G.currentLevel===4){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0000');g.addColorStop(0.5,'#200505');g.addColorStop(1,'#3a0a0a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(255,50,0,0.08)';ctx.fillRect(0,H-TILE*3,W,TILE*3);
const cx=G.cam*0.15;ctx.fillStyle='rgba(60,20,20,0.45)';
for(let bx=0;bx<W+64;bx+=64){const ox=(bx-cx%64);for(let by=0;by<H-TILE*3;by+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30)}}
ctx.fillStyle='#ff3300';ctx.globalAlpha=0.12+0.06*Math.abs(Math.sin(G.frame*0.03));ctx.fillRect(0,H-TILE*1.5,W,TILE*2);ctx.globalAlpha=1;
return;}
// Night sky (1-3)
if(G.currentLevel===3){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#000510');g.addColorStop(0.5,'#080f28');g.addColorStop(1,'#101520');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.fillStyle='#fff';for(let i=0;i<60;i++){const sx=(i*223)%W;const sy=(i*157)%(H*0.68);ctx.globalAlpha=0.4+Math.abs(Math.sin(G.frame*0.04+i*0.8))*0.6;ctx.fillRect(sx,sy,i%5===0?2:1,i%5===0?2:1);}ctx.globalAlpha=1;
ctx.fillStyle='#fffde0';ctx.beginPath();ctx.arc(W*0.8-G.cam*0.01,55,28,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#080f28';ctx.beginPath();ctx.arc(W*0.8-G.cam*0.01+10,50,22,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#0a0f18';[500,1300,2600,4000,5600,7100].forEach(mx=>{const dx=mx-G.cam*0.2;if(dx<-300||dx>W+300)return;ctx.beginPath();ctx.moveTo(dx-30,H-TILE);ctx.quadraticCurveTo(dx+100,H-TILE-75,dx+230,H-TILE);ctx.fill();});
ctx.fillStyle='#050a10';[200,700,1500,2400,3300,4200,5100,6000].forEach((bx,i)=>{const dx=bx-G.cam*0.3;if(dx<-100||dx>W+100)return;const bw=44+(i%3)*20;ctx.beginPath();ctx.arc(dx,H-TILE+2,bw/3,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx-bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx+bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill();});
return;}
// NES-style sky (1-1)
const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5C94FC');g.addColorStop(0.7,'#92BBFF');g.addColorStop(1,'#B0D0FF');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
// Far mountains
ctx.fillStyle='#7aaedc';[300,900,1800,3000,4500,6000].forEach(mx=>{const dx=mx-G.cam*0.08;if(dx<-200||dx>W+200)return;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.quadraticCurveTo(dx+60,H-TILE-100,dx+120,H-TILE);ctx.fill()});
// Hills (rounded, with highlight)
[500,1200,2500,4000,5500,7000].forEach(mx=>{const dx=mx-G.cam*0.25;if(dx<-300||dx>W+300)return;
ctx.fillStyle='#5AB552';ctx.beginPath();ctx.moveTo(dx-20,H-TILE);ctx.quadraticCurveTo(dx+90,H-TILE-80,dx+200,H-TILE);ctx.fill();
ctx.fillStyle='#6CC864';ctx.beginPath();ctx.moveTo(dx+40,H-TILE);ctx.quadraticCurveTo(dx+90,H-TILE-60,dx+140,H-TILE);ctx.fill()});
// Bushes
[200,700,1500,2300,3200,4100,5000,5900,6800].forEach((bx,i)=>{const dx=bx-G.cam*0.3;if(dx<-100||dx>W+100)return;
const bw=40+(i%3)*20;ctx.fillStyle='#4AA844';ctx.beginPath();ctx.arc(dx,H-TILE+2,bw/3,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx-bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx+bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill()});
// Clouds (puffy NES style)
[100,500,850,1300,1800,2350,2900,3600,4300,5100,5900,6700].forEach((cx,i)=>{const dx=cx-G.cam*0.35;if(dx<-140||dx>W+140)return;const cy=50+(i%3)*35;
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(dx+30,cy+20,22,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(dx+55,cy+14,28,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(dx+80,cy+20,22,0,Math.PI*2);ctx.fill();
ctx.fillRect(dx+10,cy+20,82,16);
ctx.fillStyle='rgba(200,220,255,0.4)';ctx.beginPath();ctx.arc(dx+55,cy+10,16,0,Math.PI*2);ctx.fill()});
}

function drawTile(x,y,type,hit,bounce){
const py=y-bounce;
if(type==='ground'){
ctx.fillStyle='#C84C0C';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#E09060';ctx.fillRect(x+1,py+1,TILE-2,3);
ctx.fillStyle='#D07030';ctx.fillRect(x+1,py+4,TILE-2,TILE-5);
ctx.fillStyle='#A04000';ctx.fillRect(x,py+TILE/2,TILE,1);ctx.fillRect(x+TILE/2,py,1,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,1,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,1,TILE/2-1);
}else if(type==='brick'){
ctx.fillStyle='#C04020';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#D85840';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#A03018';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,2,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,2,TILE/2-1);
ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(x+2,py+2,TILE-4,2);
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(x,py+TILE-2,TILE,2);
}else if(type==='question'||type==='yoshiEgg'){
if(hit){ctx.fillStyle='#8B7355';ctx.fillRect(x,py,TILE,TILE);ctx.fillStyle='#A08B6B';ctx.fillRect(x+2,py+2,TILE-4,TILE-4);ctx.fillStyle='#706050';ctx.fillRect(x+10,py+8,12,16)}
else{const pulse=Math.sin(G.frame*0.12)*0.12+0.88;const isYoshi=type==='yoshiEgg';
ctx.fillStyle=isYoshi?`hsl(120,60%,${Math.floor(42*pulse)}%)`:`hsl(42,100%,${Math.floor(52*pulse)}%)`;ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle=isYoshi?'#1a6d1a':'#B8860B';ctx.fillRect(x,py,TILE,2);ctx.fillRect(x,py,2,TILE);
ctx.fillStyle=isYoshi?'#4CAF50':'#FFD700';ctx.fillRect(x,py+TILE-2,TILE,2);ctx.fillRect(x+TILE-2,py,2,TILE);
ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.textAlign='center';
ctx.fillText(isYoshi?'Y':'?',x+TILE/2,py+TILE-7);ctx.textAlign='left'}}}

function drawPipe(x,y,w,h){
ctx.fillStyle='#1E8C2A';ctx.fillRect(x,y,w,h);
ctx.fillStyle='#27AE60';ctx.fillRect(x+2,y+2,w-4,h-2);
ctx.fillStyle='#2ECC71';ctx.fillRect(x+4,y+2,8,h-4);
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(x+6,y+2,3,h-4);
ctx.fillStyle='#1E8C2A';ctx.fillRect(x-4,y,w+8,16);
ctx.fillStyle='#27AE60';ctx.fillRect(x-2,y+2,w+4,12);
ctx.fillStyle='#2ECC71';ctx.fillRect(x,y+3,8,8);
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(x+2,y+4,3,6);
}

function drawMario(mx,my,facing,wf,dead,big){
ctx.save();
if(mario.inv>0&&Math.floor(G.frame/4)%2===0){ctx.restore();return}
if(facing===-1){ctx.translate(mx+26,0);ctx.scale(-1,1);mx=0}else{ctx.translate(mx,0);mx=0}
const isFire=mario.power==='fire';
const hatC=isFire?'#fff':'#E52521',shirtC=isFire?'#E52521':'#0050C8',skinC='#FBD000',hairC='#6B3410',shoeC='#6B3410';

if(dead){ctx.fillStyle=hatC;ctx.fillRect(mx+4,my,20,7);ctx.fillStyle=skinC;ctx.fillRect(mx+6,my+7,16,8);ctx.fillStyle=shirtC;ctx.fillRect(mx+2,my+15,24,12);ctx.restore();return}
if(big){
// Hat
ctx.fillStyle=hatC;ctx.fillRect(mx+6,my,18,6);ctx.fillRect(mx+2,my+4,24,6);
// Hair
ctx.fillStyle=hairC;ctx.fillRect(mx+2,my+8,4,6);
// Face
ctx.fillStyle=skinC;ctx.fillRect(mx+4,my+10,20,12);
// Eyes
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+12,6,5);ctx.fillRect(mx+16,my+12,6,5);
ctx.fillStyle='#000';ctx.fillRect(mx+10,my+13,4,4);ctx.fillRect(mx+18,my+13,4,4);
// Mustache
ctx.fillStyle=hairC;ctx.fillRect(mx+6,my+18,16,3);
// Shirt
ctx.fillStyle=shirtC;ctx.fillRect(mx+4,my+22,20,14);
// Overall buttons
ctx.fillStyle='#FFD700';ctx.fillRect(mx+8,my+25,4,4);ctx.fillRect(mx+16,my+25,4,4);
// Arms
ctx.fillStyle=skinC;ctx.fillRect(mx-4,my+22,8,10);ctx.fillRect(mx+24,my+22,8,10);
// Legs
const lo=wf===1?[-3,3]:wf===2?[3,-3]:[0,0];
ctx.fillStyle=shirtC;ctx.fillRect(mx+4+lo[0],my+36,10,6);ctx.fillRect(mx+16+lo[1],my+36,10,6);
ctx.fillStyle=shoeC;ctx.fillRect(mx+2+lo[0],my+42,12,6);ctx.fillRect(mx+14+lo[1],my+42,12,6);
}else{
// Small Mario
ctx.fillStyle=hatC;ctx.fillRect(mx+6,my,18,5);ctx.fillRect(mx+2,my+3,24,5);
ctx.fillStyle=skinC;ctx.fillRect(mx+4,my+8,20,8);
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+9,5,4);ctx.fillRect(mx+16,my+9,5,4);
ctx.fillStyle='#000';ctx.fillRect(mx+9,my+10,3,3);ctx.fillRect(mx+17,my+10,3,3);
ctx.fillStyle=hairC;ctx.fillRect(mx+6,my+14,14,2);
ctx.fillStyle=shirtC;ctx.fillRect(mx+4,my+16,20,10);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+18,3,3);ctx.fillRect(mx+16,my+18,3,3);
ctx.fillStyle=skinC;ctx.fillRect(mx-3,my+16,7,6);ctx.fillRect(mx+24,my+16,7,6);
const lo=wf===1?[-3,3]:wf===2?[3,-3]:[0,0];
ctx.fillStyle=shoeC;ctx.fillRect(mx+2+lo[0],my+26,12,6);ctx.fillRect(mx+14+lo[1],my+26,12,6);
}
ctx.restore();
}

function drawYoshi(yx,yy,facing,mounted){
ctx.save();
if(facing===-1){ctx.translate(yx+30,0);ctx.scale(-1,1);yx=0}else{ctx.translate(yx,0);yx=0}
// Boots
ctx.fillStyle='#d35400';ctx.fillRect(yx-1,yy+33,14,7);ctx.fillRect(yx+17,yy+33,14,7);
ctx.fillStyle='#e67e22';ctx.fillRect(yx+1,yy+30,11,8);ctx.fillRect(yx+18,yy+30,11,8);
// Legs
ctx.fillStyle='#27ae60';ctx.fillRect(yx+3,yy+22,9,12);ctx.fillRect(yx+18,yy+22,9,12);
// Body (round)
ctx.fillStyle='#27ae60';ctx.beginPath();ctx.arc(yx+14,yy+19,13,0,Math.PI*2);ctx.fill();ctx.fillRect(yx+2,yy+15,24,14);
// White belly
ctx.fillStyle='#ecf0f1';ctx.beginPath();ctx.arc(yx+12,yy+22,7,0,Math.PI*2);ctx.fill();
// Saddle
if(mounted){ctx.fillStyle='#e74c3c';ctx.fillRect(yx+2,yy+9,26,8);ctx.fillStyle='#c0392b';ctx.fillRect(yx+4,yy+11,22,4);}
// Back spike
ctx.fillStyle='#1e8449';ctx.beginPath();ctx.arc(yx+9,yy+11,7,Math.PI,0);ctx.fill();ctx.fillStyle='#145a14';ctx.fillRect(yx+4,yy+11,10,3);
// Neck
ctx.fillStyle='#2ecc71';ctx.fillRect(yx+17,yy+10,9,10);
// Head
ctx.fillStyle='#27ae60';ctx.beginPath();ctx.arc(yx+22,yy+7,11,0,Math.PI*2);ctx.fill();ctx.fillRect(yx+12,yy+2,14,12);
// Big round snout
ctx.fillStyle='#52be80';ctx.beginPath();ctx.arc(yx+28,yy+10,7,0,Math.PI*2);ctx.fill();
// Nostrils
ctx.fillStyle='#145a14';ctx.beginPath();ctx.arc(yx+26,yy+7,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(yx+30,yy+7,1.5,0,Math.PI*2);ctx.fill();
// Eye white
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(yx+19,yy+4,5,0,Math.PI*2);ctx.fill();
// Pupil
ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(yx+20,yy+4,3,0,Math.PI*2);ctx.fill();
// Eye shine
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(yx+22,yy+3,1.2,0,Math.PI*2);ctx.fill();
// Tongue
if(yoshi.tongueOut>0&&yoshi.tongueLen>0){ctx.fillStyle='#e91e63';const tLen=yoshi.tongueLen;ctx.fillRect(yx+32,yy+9,tLen,5);ctx.beginPath();ctx.arc(yx+32+tLen,yy+11,5,0,Math.PI*2);ctx.fill();}
// Egg indicator
if(yoshi.eggsReady>0){ctx.fillStyle='#fff';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('x'+yoshi.eggsReady,yx+14,yy-6);ctx.textAlign='left'}
ctx.restore();
}

function drawGoomba(x,y,squished,wf){
if(squished){ctx.fillStyle='#8B6914';ctx.fillRect(x+2,y+TILE-8,TILE-4,8);ctx.fillStyle='#A0822D';ctx.fillRect(x+4,y+TILE-6,TILE-8,4);return}
// Mushroom head
ctx.fillStyle='#8B4513';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.35,TILE/2,Math.PI,0);ctx.fill();
ctx.fillStyle='#A0522D';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.35,TILE/2-2,Math.PI,0);ctx.fill();
// Body
ctx.fillStyle='#DEB887';ctx.fillRect(x+6,y+TILE*0.35,TILE-12,TILE*0.35);
// Eyes (angry)
ctx.fillStyle='#fff';ctx.fillRect(x+5,y+8,10,8);ctx.fillRect(x+17,y+8,10,8);
ctx.fillStyle='#000';ctx.fillRect(x+8,y+10,6,5);ctx.fillRect(x+20,y+10,6,5);
// Angry eyebrows
ctx.fillStyle='#000';ctx.fillRect(x+5,y+6,10,3);ctx.fillRect(x+17,y+6,10,3);
// Mouth/fangs
ctx.fillStyle='#000';ctx.fillRect(x+10,y+18,12,3);ctx.fillStyle='#fff';ctx.fillRect(x+12,y+18,3,3);ctx.fillRect(x+18,y+18,3,3);
// Feet
const fo=wf===0?[-2,2]:[2,-2];
ctx.fillStyle='#000';ctx.fillRect(x+3+fo[0],y+TILE-8,10,8);ctx.fillRect(x+19+fo[1],y+TILE-8,10,8);
}

function drawKoopa(e){const x=e.x,y=e.y,h=e.h,facing=e.facing||1;
if(e.state==='shell'){
ctx.fillStyle='#145a14';ctx.beginPath();ctx.arc(x+e.w/2,y+h/2,e.w/2-1,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#27ae60';ctx.beginPath();ctx.arc(x+e.w/2,y+h/2,e.w/2-4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#145a14';ctx.fillRect(x+e.w/2-1,y+3,2,h-6);ctx.fillRect(x+3,y+h/2-1,e.w-6,2);
if(Math.abs(e.vx)>1){ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x+5+Math.sin(G.frame*0.5)*5,y+3,4,h-6)}
}else if(e.state==='dead'){ctx.fillStyle='#27ae60';ctx.fillRect(x+4,y+TILE-6,TILE-8,6);}
else{
// Wings for parakoopa
if(e.type==='parakoopa'&&e.flying){const wf=Math.sin(G.frame*0.25)*8;
ctx.fillStyle='#ecf0f1';ctx.beginPath();ctx.moveTo(x+6,y+h*0.32);ctx.lineTo(x-10,y+h*0.32-wf);ctx.lineTo(x+2,y+h*0.55);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+e.w-6,y+h*0.32);ctx.lineTo(x+e.w+10,y+h*0.32-wf);ctx.lineTo(x+e.w-2,y+h*0.55);ctx.closePath();ctx.fill();
ctx.fillStyle='#bdc3c7';ctx.beginPath();ctx.moveTo(x+6,y+h*0.32);ctx.lineTo(x-5,y+h*0.32-wf*0.6);ctx.lineTo(x+3,y+h*0.5);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+e.w-6,y+h*0.32);ctx.lineTo(x+e.w+5,y+h*0.32-wf*0.6);ctx.lineTo(x+e.w-3,y+h*0.5);ctx.closePath();ctx.fill();}
// Feet
const fo=e.walkFrame===0?[-3,1]:[1,-3];
ctx.fillStyle='#e67e22';ctx.fillRect(x+2+fo[0],y+h-7,11,7);ctx.fillRect(x+e.w-13+fo[1],y+h-7,11,7);
// Shell body
ctx.fillStyle='#145a14';ctx.fillRect(x+3,y+h*0.28,e.w-6,h*0.58);
ctx.beginPath();ctx.arc(x+e.w/2,y+h*0.28,e.w/2-3,Math.PI,0);ctx.fill();
ctx.fillStyle='#27ae60';ctx.fillRect(x+5,y+h*0.31,e.w-10,h*0.52);
// Shell ridge
ctx.fillStyle='#1e8449';ctx.fillRect(x+e.w/2-1,y+h*0.3,2,h*0.54);ctx.fillRect(x+6,y+h*0.31,e.w-12,3);
// Neck
ctx.fillStyle='#f0d060';ctx.fillRect(x+7,y+h*0.2,e.w-14,h*0.14);
// Head
const hx=facing===1?x+e.w-18:x+2;
ctx.fillStyle='#f0d060';ctx.fillRect(hx,y+2,16,h*0.26);
ctx.beginPath();ctx.arc(hx+8,y+h*0.16,9,0,Math.PI*2);ctx.fill();
// Eye
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hx+(facing===1?9:7),y+h*0.1,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(hx+(facing===1?10:6),y+h*0.1,2.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hx+(facing===1?11:7),y+h*0.08,1,0,Math.PI*2);ctx.fill();
// Beak
ctx.fillStyle='#e67e22';
if(facing===1)ctx.fillRect(x+e.w-5,y+h*0.2,5,4);else ctx.fillRect(x,y+h*0.2,5,4);}}

function drawBuzzy(e){const x=e.x,y=e.y;
if(e.state==='shell'){ctx.fillStyle='#1a3d6d';ctx.beginPath();ctx.arc(x+e.w/2,y+e.h/2,e.w/2-2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2980b9';ctx.beginPath();ctx.arc(x+e.w/2,y+e.h/2,e.w/2-5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a3d6d';ctx.fillRect(x+8,y+4,3,e.h-8);if(Math.abs(e.vx)>1){ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(x+6+Math.sin(G.frame*0.4)*6,y+3,3,e.h-6)}}
else if(e.state==='dead'){ctx.fillStyle='#2c3e50';ctx.fillRect(x+4,y+TILE-8,TILE-8,8)}
else{const h=e.h;ctx.fillStyle='#1a3d6d';ctx.fillRect(x+2,y+2,TILE-4,h*0.7);ctx.fillStyle='#2980b9';ctx.fillRect(x+4,y+4,TILE-8,h*0.6);ctx.fillStyle='#3498db';ctx.fillRect(x+8,y+4,5,h*0.5);
ctx.fillStyle='#f5d76e';ctx.fillRect(x+4,y+h*0.5,10,h*0.3);ctx.fillStyle='#fff';ctx.fillRect(x+5,y+h*0.5,5,4);ctx.fillStyle='#000';ctx.fillRect(x+6,y+h*0.52,3,3);
const fo=e.walkFrame===0?[-2,2]:[2,-2];ctx.fillStyle='#f5d76e';ctx.fillRect(x+4+fo[0],y+h-6,8,6);ctx.fillRect(x+18+fo[1],y+h-6,8,6)}}

function drawPiranha(pr){const x=pr.x,y=pr.y,cw=pr.w,ch=pr.h,cx=x+cw/2;
const open=Math.sin(G.frame*0.12)>0;const gap=open?6:0;
// Stem
ctx.fillStyle='#1e8449';ctx.fillRect(cx-3,y+ch*0.52,6,ch*0.48);
// Leaves
ctx.fillStyle='#27ae60';ctx.fillRect(x-6,y+ch*0.56,9,6);ctx.fillRect(x+cw-3,y+ch*0.56,9,6);
ctx.fillStyle='#2ecc71';ctx.fillRect(x-4,y+ch*0.58,5,4);ctx.fillRect(x+cw-1,y+ch*0.58,5,4);
// Bottom jaw
ctx.fillStyle='#c0392b';ctx.beginPath();ctx.arc(cx,y+ch*0.46,cw/2+2,0,Math.PI);ctx.fill();ctx.fillRect(x-2,y+ch*0.46,cw+4,4);
// Top jaw (moves up when open)
ctx.beginPath();ctx.arc(cx,y+ch*0.38-gap,cw/2+2,Math.PI,0);ctx.fill();ctx.fillRect(x-2,y+ch*0.3-gap,cw+4,ch*0.08+gap);
// Mouth interior
if(open){ctx.fillStyle='#7b241c';ctx.fillRect(x,y+ch*0.38,cw,gap);}
// Bottom teeth
ctx.fillStyle='#fff';ctx.fillRect(x+1,y+ch*0.43,4,5);ctx.fillRect(x+8,y+ch*0.43,4,5);
// Top teeth
ctx.fillRect(x+1,y+ch*0.38-gap,4,4);ctx.fillRect(x+8,y+ch*0.38-gap,4,4);
// White spots on head
ctx.fillStyle='rgba(255,255,255,0.55)';
ctx.beginPath();ctx.arc(x+3,y+ch*0.26-gap/2,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+12,y+ch*0.22-gap/2,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+4,y+ch*0.44-gap/2,1.5,0,Math.PI*2);ctx.fill();}

function drawMushroom(m){
if(m.type==='flower'){const bob=Math.sin(G.frame*0.1)*2;ctx.fillStyle='#27AE60';ctx.fillRect(m.x+10,m.y+14,4,10);
const rot=G.frame*0.05;for(let i=0;i<4;i++){const a=rot+i*Math.PI/2;const px=m.x+12+Math.cos(a)*7,py=m.y+8+Math.sin(a)*7+bob;
ctx.fillStyle=i%2===0?'#E74C3C':'#FF8F00';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill()}
ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(m.x+12,m.y+8+bob,5,0,Math.PI*2);ctx.fill();return}
if(m.type==='star'){const bob=Math.sin(m.bobY||0)*4;const hue=(G.frame*8)%360;ctx.save();ctx.translate(m.x+12,m.y+12+bob);
ctx.fillStyle=`hsl(${hue},100%,60%)`;ctx.beginPath();for(let i=0;i<5;i++){const a=(i*72-90)*Math.PI/180;ctx.lineTo(Math.cos(a)*12,Math.sin(a)*12);const a2=((i*72)+36-90)*Math.PI/180;ctx.lineTo(Math.cos(a2)*5,Math.sin(a2)*5)}ctx.closePath();ctx.fill();
ctx.fillStyle=`hsla(${hue},100%,80%,0.5)`;ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.restore();return}
// Mushroom / 1UP
const is1up=m.type==='1up';
ctx.fillStyle='#F5E6C8';ctx.fillRect(m.x+6,m.y+14,12,10);
ctx.fillStyle=is1up?'#2ECC71':'#E74C3C';ctx.beginPath();ctx.arc(m.x+12,m.y+10,12,Math.PI,0);ctx.fill();ctx.fillRect(m.x,m.y+10,24,6);
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(m.x+7,m.y+6,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(m.x+17,m.y+6,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle=is1up?'#1a9c5a':'#C0392B';ctx.fillRect(m.x,m.y+14,24,3)}

function drawCoinItem(x,y){const squeeze=Math.abs(Math.cos(G.frame*0.18));ctx.save();ctx.translate(x+TILE/2,y+TILE/2);ctx.scale(squeeze,1);
ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#F39C12';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#FFD700';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('$',0,4);
// Sparkle
if(G.frame%20<10){ctx.fillStyle='rgba(255,255,255,0.8)';ctx.fillRect(-2,-10,2,4);ctx.fillRect(8,-6,2,4)}
ctx.restore()}

function drawFireball(fb){ctx.save();const gd=ctx.createRadialGradient(fb.x+6,fb.y+6,0,fb.x+6,fb.y+6,9);gd.addColorStop(0,'#fff');gd.addColorStop(0.35,'#ff9900');gd.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=gd;ctx.beginPath();ctx.arc(fb.x+6,fb.y+6,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,200,0,0.5)';ctx.fillRect(fb.x+6-fb.vx*0.5,fb.y+4,4,4);ctx.restore()}

function drawMovingPlat(mp){const gd=ctx.createLinearGradient(mp.x,mp.y,mp.x,mp.y+mp.h);gd.addColorStop(0,'#e67e22');gd.addColorStop(0.5,'#f39c12');gd.addColorStop(1,'#d35400');ctx.fillStyle=gd;ctx.fillRect(mp.x,mp.y,mp.w,mp.h);ctx.fillStyle='#c0392b';ctx.fillRect(mp.x+4,mp.y+3,5,5);ctx.fillRect(mp.x+mp.w-9,mp.y+3,5,5)}
function drawSpring(sp){const comp=sp.compressed>0?8:0;ctx.fillStyle='#e74c3c';ctx.fillRect(sp.x,sp.y+sp.h-6,sp.w,6);ctx.fillStyle='#f1c40f';for(let i=0;i<3;i++)ctx.fillRect(sp.x+2,sp.y+4+i*6+comp,sp.w-4,3);ctx.fillStyle='#e74c3c';ctx.fillRect(sp.x-2,sp.y+comp,sp.w+4,5)}
function drawCheckpoint(cp){ctx.fillStyle=cp.reached?'#2ecc71':'#888';ctx.fillRect(cp.x+6,cp.y-TILE*3,4,TILE*3);ctx.fillStyle=cp.reached?'#2ecc71':'#e74c3c';ctx.beginPath();ctx.moveTo(cp.x+10,cp.y-TILE*3);ctx.lineTo(cp.x+30,cp.y-TILE*3+10);ctx.lineTo(cp.x+10,cp.y-TILE*3+20);ctx.fill();ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(cp.x+8,cp.y-TILE*3,5,0,Math.PI*2);ctx.fill()}

function drawFlag(){const fx=flagPole.x;
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(fx+8,H-TILE,6,TILE);
const pg=ctx.createLinearGradient(fx+6,0,fx+12,0);pg.addColorStop(0,'#bbb');pg.addColorStop(0.5,'#fff');pg.addColorStop(1,'#888');
ctx.fillStyle=pg;ctx.fillRect(fx+6,H-TILE-flagPole.h,6,flagPole.h);
// Ball on top
ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(fx+9,H-TILE-flagPole.h,5,0,Math.PI*2);ctx.fill();
// Flag
ctx.fillStyle='#E52521';ctx.beginPath();ctx.moveTo(fx+12,H-TILE-flagPole.h);ctx.quadraticCurveTo(fx+42,H-TILE-flagPole.h+15+Math.sin(G.frame*0.1)*5,fx+12,H-TILE-flagPole.h+32);ctx.fill();
// Castle
const cx=fx+50;
ctx.fillStyle='#D0D0D0';ctx.fillRect(cx,H-TILE-140,100,140);
ctx.fillStyle='#B8B8B8';ctx.fillRect(cx+2,H-TILE-138,96,136);
// Turrets
[0,22,44,66,88].forEach(ox=>{ctx.fillStyle='#C8C8C8';ctx.fillRect(cx+ox,H-TILE-155,18,17);ctx.fillStyle='#A0A0A0';ctx.fillRect(cx+ox+3,H-TILE-155,3,12)});
// Door
ctx.fillStyle='#4A3728';ctx.fillRect(cx+35,H-TILE-50,30,50);
ctx.fillStyle='#6B4F3A';ctx.beginPath();ctx.arc(cx+50,H-TILE-50,15,Math.PI,0);ctx.fill();
ctx.fillStyle='#FFD700';ctx.fillRect(cx+55,H-TILE-30,4,4);
// Windows
ctx.fillStyle='#87CEEB';ctx.fillRect(cx+10,H-TILE-100,18,22);ctx.fillRect(cx+72,H-TILE-100,18,22);
ctx.fillStyle='rgba(255,255,200,0.3)';ctx.fillRect(cx+12,H-TILE-98,6,8);ctx.fillRect(cx+74,H-TILE-98,6,8);
// Small flag on castle
ctx.fillStyle='#888';ctx.fillRect(cx+48,H-TILE-175,3,22);ctx.fillStyle='#E52521';ctx.fillRect(cx+51,H-TILE-175,14,10);
}

function drawYoshiEggItem(yi){
// White egg with green spots
ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(yi.x+12,yi.y+12,12,14,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#4CAF50';ctx.beginPath();ctx.arc(yi.x+8,yi.y+10,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(yi.x+16,yi.y+14,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(yi.x+10,yi.y+18,2,0,Math.PI*2);ctx.fill();
// Crack effect near hatching
if(yi.hatchTimer<30){ctx.strokeStyle='#888';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(yi.x+10,yi.y+4);ctx.lineTo(yi.x+14,yi.y+10);ctx.lineTo(yi.x+10,yi.y+14);ctx.stroke()}}

function drawYoshiEggProj(eg){
ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(eg.x+8,eg.y+8,8,10,eg.bounces*0.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#4CAF50';ctx.beginPath();ctx.arc(eg.x+6,eg.y+7,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(eg.x+11,eg.y+10,2,0,Math.PI*2);ctx.fill()}

function drawHammerBro(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.fillStyle='#556b2f';ctx.fillRect(x+4,y+e.h-10,TILE-8,10);return}
ctx.fillStyle='#556b2f';ctx.fillRect(x+2,y,TILE-4,e.h*0.3);ctx.fillStyle='#6b8e23';ctx.fillRect(x+4,y+2,TILE-8,e.h*0.25);
ctx.fillStyle='#8fbc8f';ctx.fillRect(x+4,y+e.h*0.3,TILE-8,e.h*0.4);
ctx.fillStyle='#fff';ctx.fillRect(x+6,y+e.h*0.12,7,5);ctx.fillRect(x+18,y+e.h*0.12,7,5);
ctx.fillStyle='#000';ctx.fillRect(x+8,y+e.h*0.14,4,3);ctx.fillRect(x+20,y+e.h*0.14,4,3);
const fo=e.walkFrame===0?[-2,2]:[2,-2];
ctx.fillStyle='#556b2f';ctx.fillRect(x+4+fo[0],y+e.h-8,10,8);ctx.fillRect(x+18+fo[1],y+e.h-8,10,8);
ctx.fillStyle='#8fbc8f';ctx.fillRect(x+22,y-6,6,10);ctx.fillStyle='#666';ctx.fillRect(x+20,y-12,10,6);ctx.fillStyle='#888';ctx.fillRect(x+21,y-11,8,4)}

function drawParticles(){for(const p of particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size)}ctx.globalAlpha=1}
function drawScorePopups(){for(const p of scorePopups){ctx.globalAlpha=Math.min(1,p.life*3);ctx.fillStyle=p.color;ctx.font='bold 11px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillText(p.val,p.x-G.cam,p.y)}ctx.globalAlpha=1;ctx.textAlign='left'}

function drawOverlay(title,sub,bgColor){
ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
const bw=580,bh=200,bx=(W-bw)/2,by=(H-bh)/2-20;
const boxG=ctx.createLinearGradient(bx,by,bx,by+bh);boxG.addColorStop(0,bgColor+'dd');boxG.addColorStop(1,'#000000cc');
ctx.fillStyle=boxG;ctx.fillRect(bx,by,bw,bh);
ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=2;ctx.strokeRect(bx+1,by+1,bw-2,bh-2);
ctx.fillStyle='#fff';ctx.font='bold 30px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=8;ctx.fillText(title,W/2,by+65);
ctx.font='11px "Press Start 2P",monospace';ctx.shadowBlur=4;
sub.split('\n').forEach((l,i)=>ctx.fillText(l,W/2,by+105+i*28));ctx.shadowBlur=0;ctx.textAlign='left'}

function draw(){
const sx=G.shakeX*(Math.random()*2-1),sy=G.shakeY*(Math.random()*2-1);ctx.save();ctx.translate(sx,sy);
if(G.state==='intro'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 24px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillText(`WORLD  ${G.currentWorld}-${G.currentLevel}`,W/2,H/2-30);ctx.font='14px "Press Start 2P",monospace';ctx.fillText(`x ${G.lives}`,W/2+30,H/2+20);ctx.fillStyle='#E52521';ctx.fillRect(W/2-20,H/2+6,16,10);ctx.fillStyle='#FBD000';ctx.fillRect(W/2-18,H/2+16,12,6);ctx.textAlign='left';ctx.restore();return}
drawBG();ctx.save();ctx.translate(-G.cam,0);
// Lava flames (draw below blocks)
for(const f of lavaFlames){if(f.curH<2||f.x+f.w<G.cam-10||f.x>G.cam+W+10)continue;
const ft=H-TILE-f.curH;
const g=ctx.createLinearGradient(f.x,ft,f.x,H-TILE);
g.addColorStop(0,'rgba(255,255,100,0.95)');g.addColorStop(0.25,'rgba(255,160,0,1)');g.addColorStop(0.7,'rgba(255,50,0,1)');g.addColorStop(1,'rgba(200,0,0,1)');
ctx.fillStyle=g;ctx.fillRect(f.x,ft,f.w,f.curH);
if(f.curH>30){ctx.fillStyle='rgba(255,255,200,0.55)';ctx.fillRect(f.x+f.w*0.3,ft,f.w*0.4,f.curH*0.35);}
// Flicker tip
if(f.curH>0){const fl=Math.random()*6;ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillRect(f.x+f.w*0.2,ft-fl,f.w*0.6,fl+3);}
}
// Blocks
for(const p of platforms){if((p.type==='hidden'&&!p.hit)||p.x+p.w<G.cam-10||p.x>G.cam+W+10)continue;drawTile(p.x,p.y,p.type,p.hit,p.bounceOffset||0)}
for(const mp of movingPlats)if(!(mp.falling&&mp.y>H))drawMovingPlat(mp);
for(const sp of springs)drawSpring(sp);
if(G.checkpoint)drawCheckpoint(G.checkpoint);
for(const p of pipes){if(p.x+p.w<G.cam-10||p.x>G.cam+W+10)continue;drawPipe(p.x,p.y,p.w,p.h);
if(p.isWarp&&!p.used){ctx.fillStyle='rgba(255,255,255,'+(0.5+Math.sin(G.frame*0.08)*0.3)+')';ctx.font='bold 16px monospace';ctx.textAlign='center';ctx.fillText('▼',p.x+p.w/2,p.y-6);ctx.textAlign='left'}
if(p.isExit){ctx.fillStyle='rgba(255,255,100,'+(0.5+Math.sin(G.frame*0.08)*0.4)+')';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('▼ EXIT',p.x+p.w/2,p.y-6);ctx.textAlign='left'}}
for(const pr of piranhas)if(pr.alive)drawPiranha(pr);
// Cannons
for(const cn of cannons){if(cn.x+cn.w<G.cam-10||cn.x>G.cam+W+10)continue;ctx.fillStyle='#1a1a1a';ctx.fillRect(cn.x,cn.y,cn.w,cn.h);ctx.fillStyle='#333';ctx.fillRect(cn.x+2,cn.y+2,cn.w-4,cn.h-4);ctx.fillStyle='#888';ctx.beginPath();ctx.arc(cn.x+cn.w/2,cn.y+14,8,0,Math.PI*2);ctx.fill();ctx.fillStyle='#333';ctx.fillRect(cn.x+cn.w/2-4,cn.y+10,3,3);ctx.fillRect(cn.x+cn.w/2+1,cn.y+10,3,3);if(cn.timer<10){ctx.fillStyle=`rgba(255,${150+Math.random()*100},0,${0.5+Math.random()*0.5})`;ctx.beginPath();ctx.arc(cn.x+cn.w/2,cn.y-4,8+Math.random()*4,0,Math.PI*2);ctx.fill()}}
// Bullet Bills
for(const bb of bulletBills){if(!bb.alive)continue;const dir=bb.vx>0?1:-1;ctx.fillStyle='#111';ctx.fillRect(bb.x,bb.y,bb.w,bb.h);ctx.fillStyle='#333';ctx.fillRect(bb.x+(dir>0?2:4),bb.y+2,bb.w-6,bb.h-4);ctx.fillStyle='#111';ctx.fillRect(dir>0?bb.x+bb.w-2:bb.x,bb.y+2,4,bb.h-4);ctx.fillStyle='#fff';ctx.fillRect(bb.x+(dir>0?4:bb.w-8),bb.y+4,4,4);ctx.fillStyle='#000';ctx.fillRect(bb.x+(dir>0?5:bb.w-7),bb.y+5,2,2);ctx.fillStyle=`rgba(255,${100+Math.random()*100},0,0.7)`;ctx.fillRect(dir>0?bb.x-6:bb.x+bb.w+2,bb.y+4,6,bb.h-8)}
// Hammers
for(const h of hammers){ctx.save();ctx.translate(h.x+7,h.y+7);ctx.rotate(h.rot);ctx.fillStyle='#8B4513';ctx.fillRect(-2,0,4,10);ctx.fillStyle='#888';ctx.fillRect(-6,-6,12,8);ctx.restore()}
// === ワンワン描画 ===
for(const cc of chainChomps){if(!cc.alive)continue;
  const bx=cc.x,by=cc.y;
  // 鎖（postから本体へドット）
  ctx.fillStyle='#888';
  for(let s=0;s<=1;s+=0.15){
    const lx=cc.postX+4+(bx+cc.w/2-cc.postX-4)*s;
    const ly=cc.postY+(by+cc.h/2-cc.postY)*s;
    ctx.beginPath();ctx.arc(lx,ly,3,0,Math.PI*2);ctx.fill();
  }
  // 杭
  ctx.fillStyle='#8B4513';ctx.fillRect(cc.postX+10,cc.postY,12,TILE);
  // 本体（黒球）
  const hurt=cc.state==='lunge';
  ctx.fillStyle=hurt?'#333':'#111';
  ctx.beginPath();ctx.arc(bx+cc.w/2,by+cc.h/2,cc.w/2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(bx+cc.w/2-6,by+cc.h/2-4,7,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(bx+cc.w/2+6,by+cc.h/2-4,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#000';
  ctx.beginPath();ctx.arc(bx+cc.w/2-5,by+cc.h/2-4,4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(bx+cc.w/2+7,by+cc.h/2-4,4,0,Math.PI*2);ctx.fill();
  // 牙
  ctx.fillStyle='#fff';
  ctx.fillRect(bx+cc.w/2-8,by+cc.h/2+4,6,5);
  ctx.fillRect(bx+cc.w/2+2,by+cc.h/2+4,6,5);
}
// === 飛び跳ねるブロック描画 ===
for(const jb of jumpBlocks){if(!jb.alive)continue;
  // ブロック本体（レンガ色）
  ctx.fillStyle='#c8703a';ctx.fillRect(jb.x,jb.y,jb.w,jb.h);
  ctx.fillStyle='#a0522d';
  ctx.fillRect(jb.x,jb.y+8,jb.w,2);ctx.fillRect(jb.x,jb.y+18,jb.w,2);
  ctx.fillRect(jb.x+8,jb.y,2,8);ctx.fillRect(jb.x+4,jb.y+10,2,8);ctx.fillRect(jb.x+12,jb.y+10,2,8);
  // 目
  ctx.fillStyle='#fff';ctx.fillRect(jb.x+4,jb.y+3,5,5);ctx.fillRect(jb.x+15,jb.y+3,5,5);
  ctx.fillStyle='#000';ctx.fillRect(jb.x+6,jb.y+4,3,3);ctx.fillRect(jb.x+17,jb.y+4,3,3);
}
// === パイポ描画 ===
for(const pp of pipos){if(!pp.alive)continue;
  // 外炎
  const hue=(G.frame*8)%40+20;
  ctx.fillStyle=`hsl(${hue},100%,55%)`;
  ctx.beginPath();ctx.arc(pp.x+pp.w/2,pp.y+pp.h/2,pp.w/2+3,0,Math.PI*2);ctx.fill();
  // 内炎
  ctx.fillStyle='#fff8c0';
  ctx.beginPath();ctx.arc(pp.x+pp.w/2,pp.y+pp.h/2,pp.w/2-2,0,Math.PI*2);ctx.fill();
  // 目
  ctx.fillStyle='#000';
  ctx.beginPath();ctx.arc(pp.x+pp.w/2-4,pp.y+pp.h/2-2,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(pp.x+pp.w/2+4,pp.y+pp.h/2-2,3,0,Math.PI*2);ctx.fill();
}
// Mushrooms, stars, flowers
for(const m of mushrooms)if(m.alive)drawMushroom(m);
for(const fb of fireballs)if(fb.alive)drawFireball(fb);
// Yoshi items (eggs hatching)
for(const yi of yoshiItems)drawYoshiEggItem(yi);
// Yoshi egg projectiles
for(const eg of yoshiEggs)if(eg.alive)drawYoshiEggProj(eg);
// Coins
for(const c of coinItems){if(c.collected)continue;if(c.pop){drawCoinItem(c.x,c.popY);continue}if(c.x+TILE<G.cam||c.x>G.cam+W)continue;drawCoinItem(c.x,c.y)}
// Enemies
for(const e of enemies){if(!e.alive||e.x+e.w<G.cam-10||e.x>G.cam+W+10)continue;
if(e.type==='koopa'||e.type==='parakoopa')drawKoopa(e);else if(e.type==='buzzy')drawBuzzy(e);else if(e.type==='hammerBro')drawHammerBro(e);
else drawGoomba(e.x,e.y,e.state==='dead',e.walkFrame)}
if(G.currentLevel!==4&&!(G.currentWorld===2&&G.currentLevel===3)&&!G.ugMode&&flagPole.x-G.cam>-200&&flagPole.x-G.cam<W+200)drawFlag();
// Bowser
if(bowser.alive&&bowser.x+bowser.w>G.cam-10&&bowser.x<G.cam+W+10){
const bx=Math.round(bowser.x),by=Math.round(bowser.y);
const flash=bowser.hurtTimer>0&&bowser.hurtTimer%6<3;
if(bowser.state==='dead')ctx.globalAlpha=Math.max(0,bowser.deadTimer/160);
if(flash)ctx.globalAlpha=0.35;
// Shell spikes
ctx.fillStyle='#8fbc8f';
for(let s=0;s<3;s++){ctx.beginPath();ctx.moveTo(bx+14+s*14,by+18);ctx.lineTo(bx+20+s*14,by+4);ctx.lineTo(bx+26+s*14,by+18);ctx.fill()}
// Back/shell
ctx.fillStyle='#1e5c1e';ctx.fillRect(bx+8,by+18,48,42);
// Belly
ctx.fillStyle='#3a8a3a';ctx.fillRect(bx+14,by+32,36,24);
// Head
ctx.fillStyle='#c8a050';ctx.fillRect(bx+10,by,44,26);
// Crown
ctx.fillStyle='#FFD700';
ctx.beginPath();ctx.moveTo(bx+12,by);ctx.lineTo(bx+17,by-11);ctx.lineTo(bx+22,by);ctx.fill();
ctx.beginPath();ctx.moveTo(bx+28,by);ctx.lineTo(bx+33,by-16);ctx.lineTo(bx+38,by);ctx.fill();
ctx.beginPath();ctx.moveTo(bx+42,by);ctx.lineTo(bx+47,by-11);ctx.lineTo(bx+52,by);ctx.fill();
// Eyes (face direction)
const ex=bowser.facing>0?bx+18:bx+30;
ctx.fillStyle='#cc1100';ctx.fillRect(ex,by+6,12,9);ctx.fillStyle='#000';ctx.fillRect(ex+2,by+8,8,6);ctx.fillStyle='#fff';ctx.fillRect(ex+5,by+8,3,3);
// Nose
ctx.fillStyle='#a06820';ctx.fillRect(bx+18,by+17,28,6);ctx.fillStyle='#000';ctx.fillRect(bx+21,by+18,5,4);ctx.fillRect(bx+38,by+18,5,4);
// Arms
ctx.fillStyle='#3a8a3a';
ctx.fillRect(bx+(bowser.facing>0?-6:60),by+28,16,20);
ctx.fillRect(bx+(bowser.facing>0?54:2),by+30,16,16);
// Legs with walk animation
ctx.fillStyle='#1e5c1e';
const lf=bowser.onGround?(G.frame%18<9?-2:2):0;
ctx.fillRect(bx+12,by+56,18,16+lf);ctx.fillRect(bx+34,by+56,18,16-lf);
// Claws
ctx.fillStyle='#ddd';
ctx.fillRect(bx+10,by+71,8,6);ctx.fillRect(bx+19,by+71,6,5);
ctx.fillRect(bx+34,by+71,6,5);ctx.fillRect(bx+43,by+71,8,6);
ctx.globalAlpha=1;
// HP bar
if(bowser.state!=='dead'){
const hpW=80,hpX=bx+(bowser.w-hpW)/2,hpY=by-22;
ctx.fillStyle='#333';ctx.fillRect(hpX-1,hpY-1,hpW+2,12);
ctx.fillStyle='#e74c3c';ctx.fillRect(hpX,hpY,Math.max(0,hpW*(bowser.hp/bowser.maxHp)),10);
ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(hpX-1,hpY-1,hpW+2,12);
ctx.fillStyle='#fff';ctx.font='6px "Press Start 2P"';ctx.textAlign='center';ctx.fillText('BOWSER',bx+bowser.w/2,hpY-5);ctx.textAlign='left';}
}
// Bowser fire
for(const bf of bowserFire){if(!bf.alive||bf.delay>0||bf.x+bf.w<G.cam-10||bf.x>G.cam+W+10)continue;const bfx=Math.round(bf.x),bfy=Math.round(bf.y),r=9;ctx.fillStyle='#ff2200';ctx.beginPath();ctx.arc(bfx+r,bfy+r,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff8800';ctx.beginPath();ctx.arc(bfx+r,bfy+r,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffee44';ctx.beginPath();ctx.arc(bfx+r,bfy+r,3,0,Math.PI*2);ctx.fill();}
// Princess Peach
if(peach.alive&&peach.x+peach.w>G.cam-10&&peach.x<G.cam+W+10){
const px=Math.round(peach.x),py=Math.round(peach.y);
const wo=peach.caught?0:(peach.walkFrame===0?-2:2);
// Dress (pink)
ctx.fillStyle='#f48fb1';ctx.fillRect(px+2,py+22,26,30);
ctx.fillStyle='#f06292';ctx.fillRect(px+4,py+38,22,14);
// White apron
ctx.fillStyle='#fff';ctx.fillRect(px+8,py+26,14,20);
// Body
ctx.fillStyle='#ffcc99';ctx.fillRect(px+8,py+14,14,14);
// Arms
ctx.fillStyle='#f48fb1';ctx.fillRect(px+1,py+16,8,10);ctx.fillRect(px+21,py+16,8,10);
// Hands
ctx.fillStyle='#ffcc99';ctx.fillRect(px+1,py+24,7,6);ctx.fillRect(px+22,py+24,7,6);
// Hair (blonde)
ctx.fillStyle='#FFD700';ctx.fillRect(px+6,py+4,18,12);
ctx.fillRect(px+4,py+8,4,14);ctx.fillRect(px+22,py+8,4,14);
// Face
ctx.fillStyle='#ffcc99';ctx.fillRect(px+8,py+8,14,10);
// Eyes
ctx.fillStyle='#1a0080';ctx.fillRect(px+10,py+11,3,3);ctx.fillRect(px+17,py+11,3,3);
// Crown
ctx.fillStyle='#FFD700';ctx.fillRect(px+7,py+2,16,6);
ctx.beginPath();ctx.moveTo(px+8,py+2);ctx.lineTo(px+10,py-4);ctx.lineTo(px+12,py+2);ctx.fill();
ctx.beginPath();ctx.moveTo(px+13,py+2);ctx.lineTo(px+15,py-8);ctx.lineTo(px+17,py+2);ctx.fill();
ctx.beginPath();ctx.moveTo(px+18,py+2);ctx.lineTo(px+20,py-4);ctx.lineTo(px+22,py+2);ctx.fill();
ctx.fillStyle='#ff0000';ctx.beginPath();ctx.arc(px+15,py-6,2.5,0,Math.PI*2);ctx.fill();
// Legs
ctx.fillStyle='#ffcc99';ctx.fillRect(px+8+wo,py+50,9,6);ctx.fillRect(px+17-wo,py+50,9,6);
// Caught heart
if(peach.caught&&G.peachChase&&G.peachChase.catchT<80){
ctx.fillStyle=`rgba(255,100,150,${1-(G.peachChase.catchT/80)})`;
ctx.font='bold 28px monospace';ctx.textAlign='center';
ctx.fillText('♥',px+peach.w/2,py-18);ctx.textAlign='left';}
}
// Star aura
if(G.starTimer>0){const hue=(G.frame*12)%360;ctx.fillStyle=`hsla(${hue},100%,60%,0.3)`;ctx.beginPath();ctx.arc(mario.x+13,mario.y+mario.h/2,22,0,Math.PI*2);ctx.fill()}
// Yoshi (behind Mario if mounted)
if(yoshi.alive){if(yoshi.mounted)drawYoshi(yoshi.x,yoshi.y,yoshi.facing,true);else drawYoshi(yoshi.x,yoshi.y,yoshi.facing,false)}
// Mario
drawMario(mario.x,yoshi.mounted&&yoshi.alive?mario.y-12:mario.y,mario.facing,mario.walkFrame,mario.dead,mario.big);
drawParticles();ctx.restore();drawScorePopups();
// Combo HUD
if(G.combo>1&&G.comboTimer>0){ctx.fillStyle=`rgba(255,100,50,${Math.min(1,G.comboTimer/20)})`;ctx.font='bold 16px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillText(`x${G.combo} COMBO!`,W/2,60);ctx.textAlign='left'}
// Yoshi eat count & star countdown HUD
if(yoshi.alive&&yoshi.mounted&&yoshi.eatCount>0){ctx.fillStyle='#4CAF50';ctx.font='10px "Press Start 2P",monospace';ctx.fillText(`EAT:${yoshi.eatCount}/10`,10,H-10)}
if(G.starTimer>0&&!mario.dead){const hue2=(G.frame*8)%360;ctx.fillStyle=`hsl(${hue2},100%,55%)`;ctx.font='bold 11px "Press Start 2P",monospace';ctx.fillText(`★${Math.ceil(G.starTimer/60)}s`,yoshi.alive&&yoshi.mounted&&yoshi.eatCount>0?120:10,H-10)}
ctx.restore();
if(G.state==='start'){
ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
ctx.textAlign='center';
ctx.fillStyle='#FFD700';ctx.font='bold 22px "Press Start 2P",monospace';ctx.fillText('SUPER MARIO',W/2,100);
ctx.fillStyle='#ff9944';ctx.font='9px "Press Start 2P",monospace';ctx.fillText('▶  TEST MODE — STAGE SELECT  ◀',W/2,130);
const bw=130,bh=62,gap=18,bx0=(W-(4*bw+3*gap))/2,by=230;
const bgC=['#1a3a1a','#1a2a3a','#2a1a3a','#3a1a1a'],selC=['#27ae60','#2980b9','#8e44ad','#c0392b'],lbl=['1-1','1-2','1-3','1-4'];
for(let i=0;i<4;i++){const bx=bx0+i*(bw+gap),sel=G.selectedStage===i+1;
ctx.fillStyle=sel?selC[i]:bgC[i];ctx.fillRect(bx,by,bw,bh);
ctx.strokeStyle=sel?'#fff':'#444';ctx.lineWidth=sel?3:1;ctx.strokeRect(bx,by,bw,bh);
if(sel){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(bx,by,bw,bh/2);}
ctx.fillStyle=sel?'#fff':'#888';ctx.font=`bold ${sel?17:15}px "Press Start 2P",monospace`;ctx.fillText(lbl[i],bx+bw/2,by+bh/2+7);
if(sel){ctx.fillStyle='#FFD700';ctx.font='14px monospace';ctx.fillText('▼',bx+bw/2,by+bh+18);}}
{const bw2=130,bh2=62,gap2=18,by2=315,bx2_0=(W-(3*bw2+2*gap2))/2;
const bgC2=['#3a1800','#1a0a3a','#1a2a0a'],selC2=['#d35400','#7b2fbe','#1a7a2a'],lbl2=['2-1','2-2','2-3'];
for(let i=0;i<3;i++){const bx2=bx2_0+i*(bw2+gap2),sel2=G.selectedStage===i+5;
ctx.fillStyle=sel2?selC2[i]:bgC2[i];ctx.fillRect(bx2,by2,bw2,bh2);
ctx.strokeStyle=sel2?'#fff':'#444';ctx.lineWidth=sel2?3:1;ctx.strokeRect(bx2,by2,bw2,bh2);
if(sel2){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(bx2,by2,bw2,bh2/2);}
ctx.fillStyle=sel2?'#fff':'#888';ctx.font=`bold ${sel2?17:15}px "Press Start 2P",monospace`;ctx.fillText(lbl2[i],bx2+bw2/2,by2+bh2/2+7);
if(sel2){ctx.fillStyle='#FFD700';ctx.font='14px monospace';ctx.fillText('▼',bx2+bw2/2,by2+bh2+18);}}}
ctx.fillStyle='#aaa';ctx.font='8px "Press Start 2P",monospace';
ctx.fillText('← → or 1-7 key : SELECT',W/2,420);
ctx.fillText('SPACE / ENTER / CLICK : START',W/2,436);
ctx.textAlign='left';}
if(G.state==='dead')drawOverlay('MISS!',`${G.lives} LEFT\nCLICK or SPACE to CONTINUE`,'#4a1a1a');
if(G.state==='over')drawOverlay('GAME OVER','CLICK or SPACE to RESTART','#2d0000');
if(G.state==='win')drawOverlay(G.currentLevel===4?'THANK YOU!':'COURSE CLEAR!',G.currentLevel===4?`PEACH IS SAVED!\nSCORE: ${G.score}\nCLICK or SPACE`:`SCORE: ${G.score}\nCLICK or SPACE`,'#0a3a0a');
}

(function loop(){update();draw();requestAnimationFrame(loop)})();
