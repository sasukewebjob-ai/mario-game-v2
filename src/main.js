import "./style.css";
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,bowserShockwaves,
  iceBalls,marioHammers,gravityZones,windZones,windParticles,
  mario,yoshi,bowser,peach,flagPole,G,W,H,TILE,GRAVITY,LW,BOWSER_STATS,
  pinoObj,chests} from './globals.js';
import {addB,addRow,addStair,addStairD} from './builders.js';
import {buildUnderground} from './levels/underground.js';
import {buildExStage} from './levels/level1-3_archived.js';
import {buildExStage2} from './levels/level-ex2.js';
import {STAGES,getStage,getNextStage,getStageById,getWorlds,getWorldStages} from './stages.js';
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
if(n==='stomp'){if(G.starTimer>0){[523,659,784,1047,1319].forEach((f,i)=>beep(f,.06,'square',.18,i*.05))}else{beep(180,.04,'sawtooth',.15);beep(120,.1,'sawtooth',.1,.04)}}
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
if(n==='pswitch'){[523,659,784,1047,1319].forEach((f,i)=>beep(f,.08,'sine',.2,i*.06));beep(1568,.2,'sine',.15,.35)}
if(n==='pswitch_end'){[1047,784,659,523,392].forEach((f,i)=>beep(f,.08,'square',.12,i*.06))}
if(n==='pswitch_tick'){beep(1200,.03,'sine',.15)}
}catch(e){}}

const THEME_NOTES=[[330,2],[0,1],[330,1],[0,1],[330,2],[0,1],[262,1],[330,2],[392,4],[196,4],[262,3],[0,1],[196,3],[0,1],[164,3],[0,1],[220,2],[246,2],[233,1],[220,2],[0,1],[196,2],[330,2],[392,2],[440,2],[349,1],[392,1],[0,1],[330,2],[0,1],[262,2],[294,1],[247,2],[0,2],[262,3],[0,1],[196,3],[0,1],[164,3],[0,1],[220,2],[246,2],[233,1],[220,2],[0,1],[196,2],[330,2],[392,2],[440,2],[349,1],[392,1],[0,1],[330,2],[0,1],[262,2],[294,1],[247,2],[0,2]];
const BIG_MARIO_NOTES=[[660,1],[0,1],[660,1],[0,1],[660,1],[0,1],[524,1],[660,1],[784,2],[392,2],[524,1],[0,1],[392,1],[0,1],[328,1],[0,1],[440,1],[492,1],[466,1],[440,1],[0,1],[392,1],[660,1],[784,1],[880,1],[698,1],[784,1],[0,1],[660,1],[0,1],[524,1],[588,1],[494,1],[0,1],[524,1],[0,1],[392,1],[0,1],[328,1],[0,1],[440,1],[492,1],[466,1],[440,1],[0,1],[392,1],[660,1],[784,1],[880,1],[698,1],[784,1],[0,1],[660,1],[0,1],[524,1],[588,1],[494,1],[0,1]];
const UG_NOTES=[[131,2],[0,1],[131,1],[0,1],[165,2],[0,1],[131,1],[175,2],[165,2],[156,2],[147,4],[131,2],[0,1],[131,1],[0,1],[165,2],[0,1],[131,1],[175,2],[165,2],[156,2],[147,4],[110,2],[0,1],[110,1],[0,1],[131,2],[0,1],[110,1],[147,2],[131,2],[0,2]];
const STAR_NOTES=[[523,1],[659,1],[784,1],[1047,1],[784,1],[659,1],[523,1],[0,1],[587,1],[740,1],[880,1],[1175,1],[880,1],[740,1],[587,1],[0,1],[659,1],[831,1],[988,1],[1319,1],[988,1],[831,1],[659,1],[0,1],[784,1],[988,1],[1175,1],[1568,1],[1175,1],[988,1],[784,1],[0,1]];
const CASTLE_NOTES=[[220,2],[0,1],[220,1],[208,2],[0,1],[196,1],[208,2],[220,1],[0,1],[220,4],[175,2],[0,1],[175,1],[165,2],[0,1],[155,1],[165,2],[175,1],[0,1],[196,4],[220,2],[247,2],[196,2],[220,2],[175,3],[0,1],[165,3],[0,1],[155,2],[165,2],[0,2]];
const CASTLE_P2_NOTES=[[440,1],[0,1],[440,1],[415,1],[0,1],[392,1],[415,1],[440,1],[0,1],[440,2],[349,1],[0,1],[349,1],[330,1],[0,1],[311,1],[330,1],[349,1],[0,1],[392,2],[440,1],[494,1],[392,1],[440,1],[349,2],[330,2],[311,1],[330,1],[0,1]];
const WATER_NOTES=[[196,3],[0,1],[220,3],[0,1],[247,3],[0,1],[262,4],[0,2],[196,3],[0,1],[175,3],[0,1],[165,4],[0,4],[220,3],[0,1],[196,3],[0,1],[175,2],[165,2],[196,4],[0,4]];
const PSWITCH_NOTES=[[659,1],[784,1],[880,1],[784,1],[659,1],[587,1],[659,1],[784,1],[0,1],[659,1],[784,1],[880,1],[1047,1],[880,1],[784,1],[659,1],[587,1],[523,1],[587,1],[659,1],[0,1],[523,1],[659,1],[784,1],[880,1],[784,1],[659,1],[523,1],[587,1],[659,1],[784,1],[0,1]];
const FINAL_BOSS_NOTES=[[440,2],[0,1],[415,1],[392,2],[370,2],[349,3],[0,1],[330,4],[0,2],[247,1],[262,1],[294,1],[330,1],[349,1],[392,1],[440,2],[494,2],[523,4],[0,2],[440,1],[0,1],[440,1],[0,1],[440,1],[415,1],[440,1],[0,1],[392,2],[349,2],[330,4],[0,2],[165,1],[0,1],[165,1],[0,1],[220,1],[0,1],[165,1],[196,2],[220,2],[247,2],[294,2],[330,2],[370,2],[415,2],[440,4],[0,4]];
const SHOP_NOTES=[[523,2],[659,2],[784,2],[659,2],[523,2],[0,2],[440,2],[523,2],[659,2],[784,2],[880,2],[784,2],[659,4],[0,4],[523,2],[523,2],[784,2],[659,2],[784,2],[0,2],[1047,2],[880,2],[784,2],[659,2],[523,4],[440,2],[523,2],[0,4]];
// ピノキオ部屋専用BGM（明るいおとぎ話メロディ）
const PINO_NOTES=[[523,2],[659,2],[784,2],[0,1],[880,2],[784,1],[659,2],[523,4],[0,2],[659,2],[784,2],[880,2],[0,1],[1047,2],[880,1],[784,2],[659,4],[0,2],[523,2],[659,2],[784,2],[880,2],[784,2],[659,2],[523,2],[440,2],[523,4],[0,4],[659,2],[880,2],[784,2],[659,2],[523,2],[440,4],[0,4]];
let bgmStep=0,bgmTime=0;const BEAT=0.09;let _bgmWasBig=false;
function scheduleBGM(){const _bgmS=getStage(G.currentWorld,G.currentLevel);const _isFinal=G.currentWorld===8&&G.currentLevel===3;const notes=G.state==='shop'?SHOP_NOTES:(G.pinoRoom?PINO_NOTES:(G.ugMode?(_isFinal?FINAL_BOSS_NOTES:UG_NOTES):(G.starTimer>0?STAR_NOTES:(G.megaTimer>0?BIG_MARIO_NOTES:(G.pswitchTimer>0?PSWITCH_NOTES:(G.waterMode?WATER_NOTES:(_bgmS?.bgmTheme==='castle'?(bowser.alive&&bowser.phase===2?CASTLE_P2_NOTES:CASTLE_NOTES):THEME_NOTES)))))));while(bgmTime<AC.currentTime+0.5){const[freq,len]=notes[bgmStep%notes.length];if(freq>0){const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(bgmGain);o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(0.08,bgmTime);g.gain.exponentialRampToValueAtTime(0.001,bgmTime+len*BEAT-0.01);o.start(bgmTime);o.stop(bgmTime+len*BEAT)}bgmTime+=len*BEAT;bgmStep++}}
function startBGM(){stopBGM();bgmGain=AC.createGain();bgmGain.gain.value=G.bgmMuted?0:G.bgmVolume;bgmGain.connect(AC.destination);bgmStep=0;bgmTime=AC.currentTime;scheduleBGM()}
function stopBGM(){if(bgmGain){bgmGain.gain.exponentialRampToValueAtTime(0.001,AC.currentTime+0.2);bgmGain=null}}
function playGameOverJingle(){try{const _n=[[330,0.22],[294,0.22],[262,0.22],[220,0.55],[0,0.12],[196,0.95]];let _t=AC.currentTime+0.3;for(const[_f,_d]of _n){if(_f>0){const _o=AC.createOscillator(),_g=AC.createGain();_o.connect(_g);_g.connect(AC.destination);_o.type='square';_o.frequency.value=_f;_g.gain.setValueAtTime(G.bgmMuted?0:G.bgmVolume*0.12,_t);_g.gain.exponentialRampToValueAtTime(0.001,_t+_d-0.02);_o.start(_t);_o.stop(_t+_d);}_t+=_d+0.07;}}catch(ex){}}
function playVictoryFanfare(){try{const _n=[[392,0.1],[440,0.1],[494,0.1],[523,0.2],[659,0.15],[784,0.2],[0,0.1],[659,0.1],[784,0.55],[0,0.2],[880,0.7]];let _t=AC.currentTime+0.5;for(const[_f,_d]of _n){if(_f>0){const _o=AC.createOscillator(),_g=AC.createGain();_o.connect(_g);_g.connect(AC.destination);_o.type='square';_o.frequency.value=_f;_g.gain.setValueAtTime(G.bgmMuted?0:G.bgmVolume*0.15,_t);_g.gain.exponentialRampToValueAtTime(0.001,_t+_d-0.02);_o.start(_t);_o.stop(_t+_d);}_t+=_d+0.05;}}catch(ex){}}

// === GAME STATE ===

function resetMario(){
const bh=mario.power!=='none'?48:32;
Object.assign(mario,{x:80,y:H-3*TILE,w:26,h:bh,vx:0,vy:0,onGround:false,facing:1,walkFrame:0,walkTimer:0,inv:0,dead:false,crouching:false});
G.cam=0;
}
function upgradeMario(type,_fromStock=false){
// アイテムストック: すでに特殊パワー(fire/hammer/ice)持ちかつスロット空きがあれば保存
if(!_fromStock&&mario.big&&mario.power!=='none'&&mario.power!=='big'&&G.heldItem===null){
  G.heldItem=(type==='hammer')?'hammer':(type==='flower')?'flower':'mushroom';
  spawnScorePopup(mario.x+13,mario.y-10,'STORED!','#66ccff');sfx('coin');return;
}
if(type==='flower')mario.power=G.iceMode?'ice':'fire';
else if(type==='hammer')mario.power='hammer';
else mario.power='big';
if(!mario.big){mario.h=48;mario.y-=16;mario.crouching=false;}mario.big=true;sfx('power');
// メガ中にパワーアップを取得した場合、復帰先を最新のパワーに更新
if(G.megaTimer>0){G.megaPrevPower=mario.power;G.megaPrevBig=true;}
for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+24,'star');
}
function useHeldItem(){if(!G.heldItem||mario.dead)return;const _t=G.heldItem;G.heldItem=null;upgradeMario(_t,true);spawnScorePopup(mario.x+13,mario.y-16,'USE!','#66ccff');}

// === HELPERS ===
function overlap(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by}
function cX(obj,p){if(p.ceiling&&p.isWarp)return;const bo=p.bounceOffset||0;if(!overlap(obj.x,obj.y+2,obj.w,obj.h-4,p.x,p.y-bo,p.w,p.h))return;if(obj.x+obj.w/2<p.x+p.w/2){obj.x=p.x-obj.w;if(obj===mario&&!mario.onGround&&!G.waterMode){mario.wallContact=1;mario.wallContactTimer=8;}}else{obj.x=p.x+p.w;if(obj===mario&&!mario.onGround&&!G.waterMode){mario.wallContact=-1;mario.wallContactTimer=8;}}obj.vx=obj===mario?0:-obj.vx}
function cY(obj,p,onHit){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(obj.x+1,obj.y,obj.w-2,obj.h,p.x,py,p.w,p.h))return;if(obj.y+obj.h/2<py+p.h/2){if(p.ceiling)return;obj.y=py-obj.h;obj.vy=0;obj.onGround=true}else{obj.y=py+p.h;obj.vy=0;if(onHit)onHit(p)}}
function spawnParticle(x,y,type){const count=type==='brick'?8:type==='star'?6:4;for(let i=0;i<count;i++){const angle=(Math.PI*2/count)*i+Math.random()*0.5;const spd=(type==='brick'?4:type==='star'?5:2)+Math.random()*2;particles.push({x,y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd-2,life:1,decay:0.025+Math.random()*0.02,size:type==='brick'?5+Math.random()*4:type==='star'?4+Math.random()*3:3+Math.random()*3,color:type==='brick'?`hsl(${10+Math.random()*20},80%,45%)`:type==='star'?`hsl(${45+Math.random()*30},100%,65%)`:type==='dust'?`hsl(30,30%,${60+Math.random()*30}%)`:'#fff',type})}}
function spawnScorePopup(x,y,val,color='#fff'){scorePopups.push({x,y,val,vy:-1.8,life:1,color})}
function updateParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.life-=p.decay;if(p.life<=0)particles.splice(i,1)}for(let i=scorePopups.length-1;i>=0;i--){const p=scorePopups[i];p.y+=p.vy;p.vy*=0.95;p.life-=0.02;if(p.life<=0)scorePopups.splice(i,1)}}

// === INPUT ===
const keys={},btn={left:false,right:false,jump:false,dash:false,down:false};
document.addEventListener('keydown',e=>{keys[e.code]=true;
if(G.state==='start'){
  const _exId=STAGES.length+1,_exId2K=STAGES.length+2,_contId=STAGES.length+3;
  if(e.code==='ArrowLeft'){if(G.selectedStage===_exId2K)G.selectedStage=_exId;else if(G.selectedStage===_exId)G.selectedStage=STAGES.length;else if(G.selectedStage>1&&G.selectedStage!==_contId)G.selectedStage--;e.preventDefault();}
  if(e.code==='ArrowRight'){if(G.selectedStage<STAGES.length)G.selectedStage++;else if(G.selectedStage===STAGES.length)G.selectedStage=_exId;else if(G.selectedStage===_exId)G.selectedStage=_exId2K;e.preventDefault();}
  if(e.code==='ArrowUp'){if(G.selectedStage===_contId)G.selectedStage=_exId;else if(G.selectedStage===_exId||G.selectedStage===_exId2K)G.selectedStage=STAGES.length-1;else if(G.selectedStage>3)G.selectedStage-=3;e.preventDefault();}
  if(e.code==='ArrowDown'){if(G.selectedStage<STAGES.length){if(G.selectedStage+3<=STAGES.length)G.selectedStage+=3;else G.selectedStage=_exId;}else if((G.selectedStage===_exId||G.selectedStage===_exId2K)&&hasSave())G.selectedStage=_contId;e.preventDefault();}
  const _dm={'Digit1':1,'Digit2':2,'Digit3':3,'Digit4':4,'Digit5':5,'Digit6':6,'Digit7':7,'Digit8':8,'Digit9':9,'Digit0':10};
  if(_dm[e.code]&&_dm[e.code]<=STAGES.length)G.selectedStage=_dm[e.code];
  if(e.code==='Space'||e.code==='Enter'){if(G.selectedStage===_contId&&hasSave()){loadSave();}else if(G.selectedStage===_exId){G.isExStage=false;G.exStageFrom=null;startExStage(1);}else if(G.selectedStage===_exId2K){G.isExStage=false;G.exStageFrom=null;startExStage(2);}else startFromStage(G.selectedStage);}
  if(e.code==='KeyL'||e.code==='KeyR'){G.character=G.character==='luigi'?'mario':'luigi';try{localStorage.setItem('mario_v2_char',G.character);}catch(_le){}}
}
// ショップ操作
if(G.state==='shop'){
  if(e.code==='ArrowLeft'||e.code==='KeyA'){G.shopCursor=(G.shopCursor+12)%13;e.preventDefault();}
  if(e.code==='ArrowRight'||e.code==='KeyD'){G.shopCursor=(G.shopCursor+1)%13;e.preventDefault();}
  if(e.code==='ArrowUp'){const _u=G.shopCursor-5;G.shopCursor=_u<0?Math.min(12,G.shopCursor+10):_u;e.preventDefault();}
  if(e.code==='ArrowDown'){const _d=G.shopCursor+5;G.shopCursor=_d>=13?_d%5:_d;e.preventDefault();}
  if(G.shopConfirm!=null){
    if(e.code==='Space'||e.code==='KeyZ'||e.code==='Enter'){_gpShopBuy(G.shopConfirm);}
    if(e.code==='Escape'||e.code==='KeyN'||e.code==='KeyX'){G.shopConfirm=null;}
    e.preventDefault();return;
  }
  if(e.code==='Space'||e.code==='KeyZ'){
    const _it=_SHOP_ITEMS[G.shopCursor];if(!_it){e.preventDefault();return;}
    const _single=_SINGLE_ONLY.has(_it.key);
    if(G.coins>=_it.cost&&(!_single||!G.shopBought?.[_it.key])){G.shopConfirm=G.shopCursor;}
  }
  if(e.code==='Enter'){_gpShopNext();}
  e.preventDefault();return;
}
if((G.state==='dead'||G.state==='over'||G.state==='win')&&(e.code==='Space'||e.code==='Enter')){if(G.state==='over'||G.state==='win'){G.score=0;G.coins=0;G.lives=3;mario.big=false;mario.power='none';startGame()}else{restartCurrentLevel()}}
if(G.state==='play'&&(e.code==='Space'||e.code==='ArrowUp')&&!mario.dead){if(mario.onGround||G.waterMode&&G.swimCooldown<=0){G.doubleJumpUsed=false;doJump();}else if(mario.wallContact!==0&&!mario.onGround){mario.vy=G.highJump?-16:-13;mario.vx=-mario.wallContact*5;mario.facing=-mario.wallContact;mario.wallContact=0;mario.wallContactTimer=0;mario.hipDrop=false;G.doubleJumpUsed=false;sfx('jump');for(let i=0;i<6;i++)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');}else if(G.doubleJump&&!G.doubleJumpUsed&&!mario.onGround){G.doubleJumpUsed=true;mario.vy=G.highJump?-16:-13;mario.hipDrop=false;sfx('jump');for(let i=0;i<8;i++)spawnParticle(mario.x+13,mario.y+mario.h,'star');}}
if(G.state==='play'&&e.code==='KeyP'){G.paused=!G.paused;}
if(G.state==='play'&&G.paused&&G.isExStage&&e.code==='KeyQ'){giveUpExStage();}
if(G.state==='play'&&e.code==='KeyZ'&&!mario.dead){if(mario.power==='fire')shootFireball();else if(mario.power==='ice')shootIceBall();else if(mario.power==='hammer')throwMarioHammer()}
if(G.state==='play'&&e.code==='KeyC'&&!mario.dead)useHeldItem();
if(G.state==='play'&&e.code==='KeyX'&&!mario.dead){if(yoshi.mounted&&yoshi.alive)yoshiAction()}
if(G.state==='play'&&(e.code==='ArrowDown'||e.code==='KeyS')&&(mario.onGround||G.waterMode)&&!mario.dead)checkPipeEntry();
// BGM音量操作
if(e.code==='KeyM'){G.bgmMuted=!G.bgmMuted;if(bgmGain)bgmGain.gain.value=G.bgmMuted?0:G.bgmVolume;}
if(e.code==='Equal'||e.code==='NumpadAdd'){G.bgmVolume=Math.min(1,G.bgmVolume+0.1);if(bgmGain&&!G.bgmMuted)bgmGain.gain.value=G.bgmVolume;}
if(e.code==='Minus'||e.code==='NumpadSubtract'){G.bgmVolume=Math.max(0,G.bgmVolume-0.1);if(bgmGain&&!G.bgmMuted)bgmGain.gain.value=G.bgmVolume;}
e.preventDefault()});
document.addEventListener('keyup',e=>{keys[e.code]=false});

function doJump(){
if(G.waterMode){mario.vy=-3.5;G.swimCooldown=14;for(let i=0;i<4;i++)spawnParticle(mario.x+13,mario.y+mario.h,'dust');return}
const isDash=keys['ShiftLeft']||keys['ShiftRight']||btn.dash||gpad.b;
const speedBonus=Math.min(Math.abs(mario.vx)*0.15,1.5);
const _hj=G.highJump?1.25:1;
if(yoshi.mounted&&yoshi.alive){mario.vy=(isDash?-16:-14.5)*_hj-speedBonus;yoshi.flutterTimer=12}
else{mario.vy=(isDash?-15.5:-14)*_hj-speedBonus}
mario.onGround=false;mario.hipDrop=false;sfx('jump');
for(let i=0;i<6;i++)spawnParticle(mario.x+13,mario.y+mario.h,isDash?'star':'dust');
}

function checkPipeEntry(){
if(G.ugMode){
  // EXワープパイプ（ピノキオ部屋から）
  for(const p of pipes){if(!p.isExWarp)continue;const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+4;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){G.exStageFrom={world:G.currentWorld,level:G.currentLevel};startExStage(p.exNum||1);return;}}
  for(const p of pipes){if(!p.isGoalPipe)continue;const _tol2=4;const onTop2=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+_tol2;const above2=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop2&&above2){sfx('flag');stopBGM();G.goalSlide={phase:'pipeGoal',t:0};mario.vx=0;mario.vy=0;for(let _gi=0;_gi<20;_gi++)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');return}}
  for(const p of pipes){if(!p.isExit)continue;const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+4;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){exitUnderground();return}}return}
for(const p of pipes){if(!p.isGoalPipe)continue;const _tol=G.waterMode?10:4;const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+_tol;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){sfx('flag');stopBGM();G.goalSlide={phase:'pipeGoal',t:0};mario.vx=0;mario.vy=0;for(let _gi=0;_gi<20;_gi++)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');return}}
for(const p of pipes){if(!p.isWarp||p.used)continue;const _ugKey=`${G.currentWorld}-${G.currentLevel}-${p.x}`;if(G.usedUndergrounds&&G.usedUndergrounds.has(_ugKey))continue;const _tol=G.waterMode?10:4;const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+_tol;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){p.used=true;p.ugKey=_ugKey;enterUnderground(p);return}}
}
function enterUnderground(p){if(G.pswitchTimer>0)deactivatePSwitch();G.autoScroll=0;G.savedOW={platforms:[...platforms],pipes:[...pipes],coinItems:[...coinItems],enemies:[...enemies],mushrooms:[...mushrooms],piranhas:[...piranhas],movingPlats:[...movingPlats],springs:[...springs],cannons:[...cannons],chainChomps:[...chainChomps],jumpBlocks:[...jumpBlocks],pipos:[...pipos],gravityZones:[...gravityZones],windZones:[...windZones],chasingWall:G.chasingWall?{...G.chasingWall}:null,cam:G.cam,mx:mario.x,my:mario.y,waterMode:G.waterMode,darkMode:G.darkMode,ugKey:p.ugKey||null,ceilingEntry:!!p.ceiling};G.waterMode=false;G.darkMode=false;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;
platforms.length=0;pipes.length=0;coinItems.length=0;enemies.length=0;mushrooms.length=0;piranhas.length=0;movingPlats.length=0;springs.length=0;cannons.length=0;bulletBills.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;bowserShockwaves.length=0;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;
buildUnderground(p.variant||'coin');
// 地下スポーン(x=60)周辺200px以内の敵を除去（即死防止）
for(let i=enemies.length-1;i>=0;i--){if(enemies[i].x<260)enemies.splice(i,1);}
G.cam=0;mario.x=60;mario.y=H-3*TILE;mario.vx=0;mario.vy=0;G.ugMode=true;G.score+=500;sfx('flag');stopBGM();try{startBGM()}catch(ex){}}
function exitUnderground(skipBonus){if(!G.savedOW)return;if(G.pswitchTimer>0){G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;}platforms.length=0;platforms.push(...G.savedOW.platforms);pipes.length=0;pipes.push(...G.savedOW.pipes);coinItems.length=0;coinItems.push(...G.savedOW.coinItems);enemies.length=0;enemies.push(...G.savedOW.enemies);mushrooms.length=0;mushrooms.push(...G.savedOW.mushrooms);piranhas.length=0;piranhas.push(...G.savedOW.piranhas);movingPlats.length=0;movingPlats.push(...(G.savedOW.movingPlats||[]));springs.length=0;springs.push(...(G.savedOW.springs||[]));cannons.length=0;cannons.push(...(G.savedOW.cannons||[]));bulletBills.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;chainChomps.length=0;chainChomps.push(...(G.savedOW.chainChomps||[]));jumpBlocks.length=0;jumpBlocks.push(...(G.savedOW.jumpBlocks||[]));pipos.length=0;pipos.push(...(G.savedOW.pipos||[]));gravityZones.length=0;gravityZones.push(...(G.savedOW.gravityZones||[]));windZones.length=0;windZones.push(...(G.savedOW.windZones||[]));windParticles.length=0;iceBalls.length=0;marioHammers.length=0;G.darkMode=G.savedOW.darkMode||false;G.chasingWall=G.savedOW.chasingWall||null;G.gravityFlipped=false;
// 出口(元のパイプ位置)周辺200px以内の敵を除去（即死防止）
const _exitX=G.savedOW.mx;for(let i=enemies.length-1;i>=0;i--){if(Math.abs(enemies[i].x-_exitX)<200)enemies.splice(i,1);}
G.cam=G.savedOW.cam;mario.x=G.savedOW.mx;G.waterMode=G.savedOW.waterMode||false;
// 天井パイプから入った場合：パイプ底から自然落下。通常パイプ：上に飛び出す
if(G.savedOW.ceilingEntry){mario.y=G.savedOW.my+4;mario.vy=4;}
else{mario.y=G.savedOW.my-TILE*2;mario.vy=G.waterMode?-3:-10;}G.ugMode=false;if(G.savedOW.ugKey){if(!G.usedUndergrounds)G.usedUndergrounds=new Set();G.usedUndergrounds.add(G.savedOW.ugKey);}G.savedOW=null;if(!skipBonus)G.score+=1000;updateHUD();sfx('flag');stopBGM();try{startBGM()}catch(ex){}
// ピノキオ部屋をリセット
G.pinoRoom=false;pinoObj.alive=false;G.pinoFlagReady=false;G.pinoFlagDelay=0;G.pinoSpeechText='';}

// === ピノキオ部屋 ===
function startExStage(num){num=num||1;
  // EXステージ起動: ピノキオ部屋から入る場合はexStageFromが設定済み
  flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;
  G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;
  G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;
  iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;
  G.ugMode=false;G.exSavedOW=G.savedOW;G.savedOW=null;G.pinoRoom=false;pinoObj.alive=false;G.pinoFlagReady=false;G.pinoFlagDelay=0;G.pinoSpeechText='';
  G.isExStage=true;G.exStageNum=num;
  if(num===2){G.ex2Used=true;buildExStage2();}else{G.exStageUsed=true;buildExStage();}
  if(!G.exStageFrom){mario.big=false;mario.power='none';}
  fireballs.length=0;bowserFire.length=0;bowserShockwaves.length=0;
  resetMario();
  G.timeLeft=400;G.stageKills=0;G.stageMaxCombo=0;G.stageCoinsStart=G.coins;
  G.state='intro';G.introTimer=120;if(G.timerTick)clearInterval(G.timerTick);
  updateHUD();sfx('flag');stopBGM();try{startBGM()}catch(e){}
}
function giveUpExStage(){
  if(!G.isExStage||mario.dead)return;
  G.paused=false;G.isExStage=false;G.lowGravity=false;
  if(G.pswitchTimer>0){G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;}
  flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;
  G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;
  G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;
  iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;
  if(!G.exStageFrom){
    // メニューから入った場合→スタート画面へ
    G.exSavedOW=null;G.savedOW=null;mario.dead=false;mario.big=false;mario.power='none';
    resetMario();G.state='start';if(G.timerTick)clearInterval(G.timerTick);stopBGM();updateHUD();return;
  }
  // ピノキオ部屋から入った場合→ピノキオ部屋へ戻る（残機減少なし）
  G.exStageFailed=true;
  G.savedOW=G.exSavedOW||{cam:0,mx:80,my:H-TILE,waterMode:false,ugKey:null};G.exSavedOW=null;
  platforms.length=0;pipes.length=0;coinItems.length=0;enemies.length=0;mushrooms.length=0;piranhas.length=0;movingPlats.length=0;springs.length=0;cannons.length=0;bulletBills.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;bowserShockwaves.length=0;
  buildUnderground('pinocchio_fail');
  G.cam=0;mario.x=60;mario.y=H-3*TILE;mario.vx=0;mario.vy=0;mario.dead=false;
  G.ugMode=true;G.pinoRoom=true;G.timeLeft=400;
  G.state='play';if(G.timerTick)clearInterval(G.timerTick);
  G.timerTick=setInterval(()=>{if(G.state==='play'&&!G.paused){G.timeLeft--;if(G.timeLeft<=0){clearInterval(G.timerTick);killMario(true);}updateHUD()}},1000);
  updateHUD();sfx('flag');stopBGM();try{startBGM()}catch(ex){}
}
function spawnPinoCoins(amount){
  sfx('coin');
  spawnScorePopup(W/2-60,H/2-30,`コイン×${amount}！集めよう！`,'#FFD700');
  // 天井からコインシャワー（マリオが回収する）
  const _n=Math.min(amount,50);
  const _val=Math.max(1,Math.ceil(amount/_n)); // 各コインの価値（100→+2C, 200→+4Cなど）
  for(let i=0;i<_n;i++){
    coinItems.push({
      x:TILE*2+8+Math.random()*(W-TILE*4-16),y:-TILE*(1+Math.random()*4),
      vx:(Math.random()-0.5)*4,vy:1.5+Math.random()*3,
      type:'firecoin',gravity:0.28,timer:700,
      collected:false,isPinoItem:true,noLand:true,coinValue:_val
    });
  }
  return _n;
}
function spawnPinoMushroom(){
  // 天井直下からランダム位置に2個落ちてくる（y=-32は天井に引っかかるのでTILE+2から開始）
  for(let i=0;i<2;i++){
    mushrooms.push({
      x:TILE*2+20+Math.random()*(W-TILE*4-40),
      y:TILE+2,
      w:24,h:TILE,
      vx:(i===0?1.2:-1.2),
      vy:1.0,
      alive:true,type:'1up',isPinoItem:true
    });
  }
}
function spawnPinoExit(){
  // 出口パイプを画面右端付近に追加（地下の共通出口と同じ位置）
  pipes.push({x:W-3*TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
}
const _PINO_SPEECHES=[
  'わあ、ラッキー！\n1UPきのこが2個だよ！', // 0: 2x1UP
  '50コイン！\nまあまあかな…', // 1: 50coins
  '100コイン！\nそこそこね！', // 2: 100coins
  '200コイン！\nすごいじゃない！', // 3: 200coins
  '1コインだけ！\nざんねんでした♪', // 4: 1coin troll
  '3回踏めば倒せるよ！\n倒せば250コイン！\n死んだらSTAGEに戻るよ！', // 5: mini bowser
  'ハンマーブロスが2体！\nがんばってね♪', // 6: 2 hammer bros
  'クリボー20体プレゼント！\n連続で踏むと良いことあるよ！', // 7: 20 goombas
  'このステージをゴールするなら左、\n続けるなら右の土管へ！', // 8: goal or continue
  'エクストラステージに挑戦する？\nチャンスは1回だけだよ～！' // 9: EX warp
];
function applyPinoReward(reward,cx,cy){
  G.pinoReward=reward;
  G.pinoSpeechText=_PINO_SPEECHES[reward]||'はずれ！';
  G.pinoSpeechTimer=300;
  if(reward===0){
    // 2x 1UP mushroom（天井から降ってくる）
    spawnPinoMushroom();
    G.pinoNeed=0;
  }else if(reward===1){
    // 50コイン
    G.pinoNeed=spawnPinoCoins(50);
  }else if(reward===2){
    // 100コイン
    G.pinoNeed=spawnPinoCoins(100);
  }else if(reward===3){
    // 200コイン
    G.pinoNeed=spawnPinoCoins(200);
  }else if(reward===4){
    // 1コイン（ハズレ）
    G.pinoNeed=spawnPinoCoins(1);
  }else if(reward===5){
    // mini bowser (as enemy type)
    enemies.push({x:pinoObj.x+4,y:H-2.5*TILE,w:48,h:64,vx:-2.0,vy:0,alive:true,type:'miniBowser',state:'walk',
      hp:3,hurtTimer:0,walkFrame:0,walkTimer:0,facing:-1,isPinoItem:true,jumpTimer:60});
    G.pinoNeed=1; // need to defeat miniBowser
  }else if(reward===6){
    // 2 Hammer Bros
    enemies.push({x:cx-60,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,type:'hammerBro',
      state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:80,jumpTimer:120,isPinoItem:true});
    enemies.push({x:cx+60,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:0.5,vy:0,alive:true,type:'hammerBro',
      state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:80,jumpTimer:120,isPinoItem:true});
    G.pinoNeed=2; // need to defeat both
  }else if(reward===7){
    // 20 Goombas（クリボー大量！）
    for(let i=0;i<20;i++){
      enemies.push({x:TILE*2+30+i*35,y:H-2*TILE,w:TILE,h:TILE,vx:(i%2===0?-1.3:1.3),vy:0,
        alive:true,type:'goomba',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,isPinoItem:true});
    }
    G.pinoNeed=20; // need to defeat all
  }else if(reward===8){
    // ゴールフラグ → pinoSpeechTimer 後にステージクリア
    // pinoSpeechTimer=300 が 0 になったらpinoRoom updateでクリア発火
    G.pinoNeed=0;
  }else if(reward===9){
    // EX stage warp pipe（左隅）+ 出口パイプ（右隅）
    G.pinoNeed=0;
    const _exN=G.ex1Cleared?2:1;
    pipes.push({x:TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExWarp:true,exNum:_exN});
    pipes.push({x:W-3*TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
  }
}
function openChest(chestPlatform){
  if(G.chestOpened)return;
  G.chestOpened=true;
  chestPlatform.opened=true;
  // Close all other chests（逆順で splice して for...of の問題を回避）
  for(let _ci=platforms.length-1;_ci>=0;_ci--){
    if(platforms[_ci].type==='chest'&&platforms[_ci]!==chestPlatform)platforms.splice(_ci,1);
  }
  // EX-1未使用 or EX-1クリア済み&EX-2未使用 のとき reward=9（EXワープ）が出る
  const _exAvail=!G.exStageUsed||(G.ex1Cleared&&!G.ex2Used);
  const reward=_exAvail?Math.floor(Math.random()*10):Math.floor(Math.random()*9);
  const cx=chestPlatform.x+chestPlatform.w/2;
  const cy=chestPlatform.y;
  applyPinoReward(reward,cx,cy);
  sfx('qblock');
  for(let i=0;i<12;i++)spawnParticle(cx,cy,'star');
}

function shootFireball(){if(G.frame-G.lastFireFrame<18||fireballs.length>=2)return;G.lastFireFrame=G.frame;fireballs.push({x:mario.x+(mario.facing===1?mario.w-4:0),y:mario.y+mario.h/2-6,w:12,h:12,vx:mario.facing*9,vy:G.waterMode?0:-3,bounces:0,alive:true});try{beep(880,.04,'square',.12);beep(1100,.06,'square',.1,.04)}catch(e){}}
function shootIceBall(){if(G.frame-G.lastFireFrame<20||iceBalls.length>=2)return;G.lastFireFrame=G.frame;iceBalls.push({x:mario.x+(mario.facing===1?mario.w-4:0),y:mario.y+mario.h/2-6,w:12,h:12,vx:mario.facing*7,vy:G.waterMode?0:-2,bounces:0,alive:true});try{beep(1200,.04,'sine',.12);beep(1500,.06,'sine',.1,.04)}catch(e){}}
function throwMarioHammer(){if(G.frame-G.lastFireFrame<24||marioHammers.length>=2)return;G.lastFireFrame=G.frame;marioHammers.push({x:mario.x+(mario.facing===1?mario.w:0),y:mario.y,w:16,h:16,vx:mario.facing*5.5,vy:-10,alive:true,rot:0});try{beep(300,.06,'sawtooth',.15);beep(200,.08,'sawtooth',.1,.05)}catch(e){}}

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
yoshi.mounted=false;yoshi.tongueOut=0;yoshi.tongueLen=0;yoshi.eatTarget=null;yoshi.chewTimer=0;
if(hurt){yoshi.runAway=true;yoshi.runTimer=180;yoshi.vx=mario.facing*3;sfx('yoshi_dismount')}
}

function setupBtn(id,key){const el=document.getElementById(id);
const press=e=>{e.preventDefault();btn[key]=true;el.classList.add('pressed');
if(key==='jump'){if(G.state==='play'&&mario.onGround&&!mario.dead)doJump();if(G.state==='start'){const _kc=STAGES.length+3;if(G.selectedStage===_kc&&hasSave())loadSave();else if(G.selectedStage===STAGES.length+1){G.isExStage=false;G.exStageFrom=null;startExStage(1);}else if(G.selectedStage===STAGES.length+2){G.isExStage=false;G.exStageFrom=null;startExStage(2);}else startFromStage(G.selectedStage);}if(G.state==='dead'||G.state==='over'||G.state==='win'){if(G.state==='over'||G.state==='win'){G.score=0;G.coins=0;G.lives=3;mario.big=false;mario.power='none';startGame()}else{restartCurrentLevel()}}}else{if(G.state==='start')startGame()}};
const release=e=>{e.preventDefault();btn[key]=false;el.classList.remove('pressed')};
el.addEventListener('mousedown',press);el.addEventListener('touchstart',press,{passive:false});
el.addEventListener('mouseup',release);el.addEventListener('touchend',release);el.addEventListener('mouseleave',release)}
setupBtn('btn-left','left');setupBtn('btn-right','right');setupBtn('btn-jump','jump');setupBtn('btn-dash','dash');setupBtn('btn-down','down');
(function(){const el=document.getElementById('btn-fire');if(!el)return;
const press=e=>{e.preventDefault();if(G.state==='play'&&!mario.dead){if(yoshi.mounted&&yoshi.alive)yoshiAction();else if(mario.power==='fire')shootFireball();else if(mario.power==='ice')shootIceBall();else if(mario.power==='hammer')throwMarioHammer()}el.classList.add('pressed');setTimeout(()=>el.classList.remove('pressed'),150)};
el.addEventListener('mousedown',press);el.addEventListener('touchstart',press,{passive:false})})();
document.getElementById('btn-down').addEventListener('mousedown',e=>{e.preventDefault();if(G.state==='play'&&(mario.onGround||G.waterMode)&&!mario.dead)checkPipeEntry()});
document.getElementById('btn-down').addEventListener('touchstart',e=>{e.preventDefault();if(G.state==='play'&&(mario.onGround||G.waterMode)&&!mario.dead)checkPipeEntry()},{passive:false});
canvas.addEventListener('click',(ev)=>{if(G.state==='start'){const r=canvas.getBoundingClientRect(),bl=(r.width-canvas.clientWidth)/2,bt=(r.height-canvas.clientHeight)/2,sx=W/canvas.clientWidth,sy=H/canvas.clientHeight,cx=(ev.clientX-r.left-bl)*sx,cy=(ev.clientY-r.top-bt)*sy;
// キャラクターボタン（大きめ判定エリア）
{const _ccW=120,_ccH=52,_ccY=42,_ccGap=8;const _ccMx=W/2-_ccW-_ccGap/2,_ccLx=W/2+_ccGap/2;
if(cy>=_ccY&&cy<=_ccY+_ccH){
  if(cx>=_ccMx&&cx<=_ccMx+_ccW){G.character='mario';try{localStorage.setItem('mario_v2_char','mario');}catch(e){}return;}
  if(cx>=_ccLx&&cx<=_ccLx+_ccW){G.character='luigi';try{localStorage.setItem('mario_v2_char','luigi');}catch(e){}return;}
}}
// ステージボタン（キャンバス座標で正確に判定）
const _cbw=72,_cbh=24,_cgap=8,_crowH=30,_cstY=116;const _cws=getWorlds();
for(let _wi=0;_wi<_cws.length;_wi++){const _wSt=getWorldStages(_cws[_wi]);const _tot=_wSt.length*(_cbw+_cgap)-_cgap;const _bx0=(W-_tot)/2;const _by=_cstY+_wi*_crowH;for(let _si=0;_si<_wSt.length;_si++){const _bx=_bx0+_si*(_cbw+_cgap);if(cx>=_bx&&cx<=_bx+_cbw&&cy>=_by&&cy<=_by+_cbh){startFromStage(_wSt[_si].id);return;}}}
// EXボタン
const _cExY=_cstY+_cws.length*_crowH+4,_cExH=22;
if(cx>=W/2-82&&cx<=W/2-6&&cy>=_cExY&&cy<=_cExY+_cExH){G.isExStage=false;G.exStageFrom=null;startExStage(1);return;}
if(cx>=W/2+6&&cx<=W/2+82&&cy>=_cExY&&cy<=_cExY+_cExH){G.isExStage=false;G.exStageFrom=null;startExStage(2);return;}
// CONTINUEボタン
if(hasSave()){const _ctY=_cExY+_cExH+6;if(cx>=W/2-90&&cx<=W/2+90&&cy>=_ctY&&cy<=_ctY+20){loadSave();return;}}
return;}if(G.state!=='play'){if(G.state==='over'||G.state==='win'){G.score=0;G.coins=0;G.lives=3;mario.big=false;mario.power='none';startGame()}else if(G.state==='dead'){restartCurrentLevel()}}});
// タッチでキャラクター選択（モバイル対応・即時反応）
canvas.addEventListener('touchstart',(ev)=>{if(G.state==='start'){const t=ev.touches[0];const r=canvas.getBoundingClientRect(),bl=(r.width-canvas.clientWidth)/2,bt=(r.height-canvas.clientHeight)/2,sx=W/canvas.clientWidth,sy=H/canvas.clientHeight,cx=(t.clientX-r.left-bl)*sx,cy=(t.clientY-r.top-bt)*sy;
const _tcW=120,_tcH=52,_tcY=42,_tcGap=8;const _tcMx=W/2-_tcW-_tcGap/2,_tcLx=W/2+_tcGap/2;
if(cy>=_tcY&&cy<=_tcY+_tcH){
  if(cx>=_tcMx&&cx<=_tcMx+_tcW){G.character='mario';try{localStorage.setItem('mario_v2_char','mario');}catch(e){}ev.preventDefault();return;}
  if(cx>=_tcLx&&cx<=_tcLx+_tcW){G.character='luigi';try{localStorage.setItem('mario_v2_char','luigi');}catch(e){}ev.preventDefault();return;}
}}},{passive:false});

// === GAMEPAD ===
const gpad={left:false,right:false,up:false,down:false,a:false,b:false,x:false,y:false,start:false,select:false,l:false,r:false};
const _gpPrev={};let _gpConnected=false,_gpName='';
const _SHOP_ITEMS=[
  {key:'mushroom',cost:40},{key:'fire',cost:80},{key:'star10',cost:100},{key:'1up',cost:100},
  {key:'ice',cost:120},{key:'hammer',cost:160},{key:'retryHeart',cost:200},
  {key:'1upSet',cost:200},{key:'1upSet6',cost:300},{key:'doubleJump',cost:600},
  {key:'magnet',cost:700},{key:'bundle',cost:1300},{key:'star30',cost:1000}
];
const _SINGLE_ONLY=new Set(['mushroom','fire','ice','hammer']);
function _gpShopBuy(idx){
  const _it=_SHOP_ITEMS[idx];if(!_it)return;
  const _single=_SINGLE_ONLY.has(_it.key);
  if(G.coins>=_it.cost&&(!_single||!G.shopBought[_it.key])){
    G.coins-=_it.cost;
    if(_it.key==='1up'){G.lives++;sfx('1up');}
    else if(_it.key==='1upSet'){G.lives+=3;sfx('1up');}
    else if(_it.key==='1upSet6'){G.lives+=6;sfx('1up');}
    else if(_it.key==='bundle'){G.shopBought.magnet=(G.shopBought.magnet||0)+1;G.shopBought.doubleJump=(G.shopBought.doubleJump||0)+1;G.shopBought.retryHeart=(G.shopBought.retryHeart||0)+1;sfx('power');}
    else if(_single){G.shopBought[_it.key]=true;sfx('power');}
    else{G.shopBought[_it.key]=(G.shopBought[_it.key]||0)+1;sfx('power');}
    updateHUD();
  }
  G.shopConfirm=null;
}
function _gpShopNext(){
  if(!G.nextStage)return;
  const _sb=G.shopBought||{};
  let _ns=G.nextStage;
  G.currentWorld=_ns.world;G.currentLevel=_ns.level;flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.usedUndergrounds=new Set();G.lowGravity=false;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;_ns.build();fireballs.length=0;bowserFire.length=0;bowserShockwaves.length=0;resetMario();
  if(_sb.hammer){mario.big=true;mario.h=48;mario.y-=16;mario.power='hammer';}
  else if(_sb.ice){mario.big=true;mario.h=48;mario.y-=16;mario.power='ice';}
  else if(_sb.fire){mario.big=true;mario.h=48;mario.y-=16;mario.power='fire';}
  else if(_sb.mushroom){mario.big=true;mario.h=48;mario.y-=16;mario.power='big';}
  G.timeLeft=400;G.stageKills=0;G.stageMaxCombo=0;G.stageCoinsStart=G.coins;G.doubleJumpUsed=false;G.stageStartTime=performance.now();
  G.state='intro';G.introTimer=120;if(G.timerTick)clearInterval(G.timerTick);
  G.starTimer+=(_sb.star10||0)*600+(_sb.star30||0)*1800;
  if(_sb.magnet)G.coinMagnet=true;
  if(_sb.doubleJump)G.doubleJump=true;
  if(_sb.retryHeart)G.retryHeart+=(_sb.retryHeart||0);
  G.stageDamaged=false;G.shopBought=null;G.nextStage=null;updateHUD();stopBGM();try{startBGM()}catch(e){}
  saveGame();
}
function _gpDoJump(){
  if(G.state!=='play'||mario.dead)return;
  if(mario.onGround||(G.waterMode&&G.swimCooldown<=0)){G.doubleJumpUsed=false;doJump();}
  else if(mario.wallContact!==0&&!mario.onGround){mario.vy=(G.highJump?-16:-13);mario.vx=-mario.wallContact*5;mario.facing=-mario.wallContact;mario.wallContact=0;mario.wallContactTimer=0;mario.hipDrop=false;G.doubleJumpUsed=false;sfx('jump');for(let i=0;i<6;i++)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');}
  else if(G.doubleJump&&!G.doubleJumpUsed&&!mario.onGround){G.doubleJumpUsed=true;mario.vy=(G.highJump?-16:-13);mario.hipDrop=false;sfx('jump');for(let i=0;i<8;i++)spawnParticle(mario.x+13,mario.y+mario.h,'star');}
}
function pollGamepad(){
  const gps=navigator.getGamepads();let gp=null;
  for(let i=0;i<4;i++){if(gps[i]){gp=gps[i];break;}}
  if(!gp){_gpConnected=false;gpad.left=gpad.right=gpad.up=gpad.down=gpad.a=gpad.b=gpad.x=gpad.y=gpad.start=gpad.select=gpad.l=gpad.r=false;return;}
  _gpConnected=true;_gpName=gp.id||'';
  // D-pad: axes + standard d-pad buttons (12-15)
  const dz=0.5;
  gpad.left=(gp.axes[0]<-dz)||(gp.buttons[14]?.pressed||false);
  gpad.right=(gp.axes[0]>dz)||(gp.buttons[15]?.pressed||false);
  gpad.up=(gp.axes[1]<-dz)||(gp.buttons[12]?.pressed||false);
  gpad.down=(gp.axes[1]>dz)||(gp.buttons[13]?.pressed||false);
  // Face buttons: 0=B(bottom), 1=A(right), 2=Y(left), 3=X(top) — SNES layout
  gpad.b=gp.buttons[0]?.pressed||false;
  gpad.a=gp.buttons[1]?.pressed||false;
  gpad.y=gp.buttons[2]?.pressed||false;
  gpad.x=gp.buttons[3]?.pressed||false;
  gpad.l=gp.buttons[4]?.pressed||false;
  gpad.r=gp.buttons[5]?.pressed||false;
  gpad.select=gp.buttons[6]?.pressed||gp.buttons[8]?.pressed||false;
  gpad.start=gp.buttons[7]?.pressed||gp.buttons[9]?.pressed||false;
  // Just-pressed helper
  const jp=k=>gpad[k]&&!_gpPrev[k];
  // === Per-state event handling ===
  if(G.state==='start'){
    const _exId2=STAGES.length+1,_exId3=STAGES.length+2,_gpContId=STAGES.length+3;
    if(jp('left')){if(G.selectedStage===_exId3)G.selectedStage=_exId2;else if(G.selectedStage===_exId2)G.selectedStage=STAGES.length;else if(G.selectedStage>1&&G.selectedStage!==_gpContId)G.selectedStage--;}
    if(jp('right')){if(G.selectedStage<STAGES.length)G.selectedStage++;else if(G.selectedStage===STAGES.length)G.selectedStage=_exId2;else if(G.selectedStage===_exId2)G.selectedStage=_exId3;}
    if(jp('up')){if(G.selectedStage===_gpContId)G.selectedStage=_exId2;else if(G.selectedStage===_exId2||G.selectedStage===_exId3)G.selectedStage=STAGES.length-1;else if(G.selectedStage>3)G.selectedStage-=3;}
    if(jp('down')){if(G.selectedStage<STAGES.length){if(G.selectedStage+3<=STAGES.length)G.selectedStage+=3;else G.selectedStage=_exId2;}else if((G.selectedStage===_exId2||G.selectedStage===_exId3)&&hasSave())G.selectedStage=_gpContId;}
    if(jp('l')||jp('r')){G.character=G.character==='luigi'?'mario':'luigi';try{localStorage.setItem('mario_v2_char',G.character);}catch(_le){}}
    else if(jp('a')||jp('start')){if(G.selectedStage===_gpContId&&hasSave()){loadSave();}else if(G.selectedStage===_exId2){G.isExStage=false;G.exStageFrom=null;startExStage(1);}else if(G.selectedStage===_exId3){G.isExStage=false;G.exStageFrom=null;startExStage(2);}else startFromStage(G.selectedStage);}
  }
  else if(G.state==='shop'){
    if(G.shopConfirm!=null){
      if(jp('a'))_gpShopBuy(G.shopConfirm);
      if(jp('b'))G.shopConfirm=null;
    }else{
      if(jp('left'))G.shopCursor=(G.shopCursor+12)%13;
      if(jp('right'))G.shopCursor=(G.shopCursor+1)%13;
      if(jp('up')){const _u=G.shopCursor-5;G.shopCursor=_u<0?Math.min(12,G.shopCursor+10):_u;}
      if(jp('down')){const _d=G.shopCursor+5;G.shopCursor=_d>=13?_d%5:_d;}
      if(jp('a')){const _it=_SHOP_ITEMS[G.shopCursor];if(_it){const _s=_SINGLE_ONLY.has(_it.key);if(G.coins>=_it.cost&&(!_s||!G.shopBought?.[_it.key]))G.shopConfirm=G.shopCursor;}}
      if(jp('start'))_gpShopNext();
    }
  }
  else if(G.state==='play'){
    if(jp('a'))_gpDoJump();
    if(jp('y')&&!mario.dead){if(mario.power==='fire')shootFireball();else if(mario.power==='ice')shootIceBall();else if(mario.power==='hammer')throwMarioHammer();}
    if(jp('x')&&!mario.dead){if(yoshi.mounted&&yoshi.alive)yoshiAction();}
    if(jp('start')){G.paused=!G.paused;}
    if(G.paused&&G.isExStage&&jp('b')){giveUpExStage();}
    if(jp('select')&&!mario.dead)useHeldItem();
    if(jp('down')&&(mario.onGround||G.waterMode)&&!mario.dead)checkPipeEntry();
    if(jp('l')){G.bgmVolume=Math.max(0,G.bgmVolume-0.1);if(bgmGain&&!G.bgmMuted)bgmGain.gain.value=G.bgmVolume;}
    if(jp('r')){G.bgmVolume=Math.min(1,G.bgmVolume+0.1);if(bgmGain&&!G.bgmMuted)bgmGain.gain.value=G.bgmVolume;}
  }
  else if(G.state==='dead'||G.state==='over'||G.state==='win'){
    if(jp('a')||jp('start')){if(G.state==='over'||G.state==='win'){G.score=0;G.coins=0;G.lives=3;mario.big=false;mario.power='none';startGame()}else{restartCurrentLevel()}}
  }
  // Save previous state
  for(const k in gpad)_gpPrev[k]=gpad[k];
}
window.addEventListener('gamepadconnected',e=>{_gpConnected=true;_gpName=e.gamepad.id||'';});
window.addEventListener('gamepaddisconnected',()=>{_gpConnected=false;});

// === P-SWITCH ===
function activatePSwitch(p){
if(G.pswitchTimer>0)return;
p.hit=true;G.pswitchTimer=600;G.shakeX=8;G.shakeY=8;sfx('pswitch');
for(let i=0;i<20;i++)spawnParticle(p.x+16,p.y+16,'star');
// Bricks→collectible coins: remove from platforms, add to _psCoins
G._psCoins=[];
for(let i=platforms.length-1;i>=0;i--){
  const pl=platforms[i];
  if(pl.type==='brick'&&!pl.hit){G._psCoins.push({x:pl.x,y:pl.y,collected:false});platforms.splice(i,1);}
}
// Coins→solid platforms: hide coins, add temporary brick platforms
G._psBricks=[];
for(const c of coinItems){
  if(!c.collected){c._psHidden=true;G._psBricks.push(c);
    platforms.push({x:c.x,y:c.y,w:TILE,h:TILE,type:'pswitch_block',hit:false,bounceOffset:0,_psTemp:true,_coinRef:c});
  }
}
stopBGM();try{startBGM()}catch(e){}
}
function deactivatePSwitch(){
if(G.pswitchTimer<=0&&!G._psCoins)return;
// Restore uncollected brick-coins back to bricks
if(G._psCoins){for(const pc of G._psCoins){if(!pc.collected)platforms.push({x:pc.x,y:pc.y,w:TILE,h:TILE,type:'brick',hit:false,bounceOffset:0});}}
G._psCoins=null;
// Remove temp platforms, restore hidden coins
for(let i=platforms.length-1;i>=0;i--){
  if(platforms[i]._psTemp){if(platforms[i]._coinRef){platforms[i]._coinRef._psHidden=false;delete platforms[i]._coinRef._psHidden;}platforms.splice(i,1);}
}
if(G._psBricks){for(const c of G._psBricks){delete c._psHidden;}G._psBricks=null;}
G.pswitchTimer=0;sfx('pswitch_end');
stopBGM();try{startBGM()}catch(e){}
}

// === HIT BLOCK ===
function hitBlock(p){
if(p.type==='chest'){return}// 宝箱は上から踏む（pinoRoomブロックで処理）
if(p.type==='pswitch'&&!p.hit){activatePSwitch(p);return}
if(p.type==='pswitch_block'){return}// temp P-Switch blocks are not hittable
if(p.type==='yoshiEgg'&&!p.hit){p.hit=true;p.type='question';sfx('qblock');blockAnims.push({p,t:0});spawnYoshiEgg(p.x,p.y);return}
if(p.type==='hidden'&&!p.hit){p.hit=true;p.type='question';sfx('qblock');blockAnims.push({p,t:0});if(p.has1UP){mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:TILE,vx:1.5,vy:0,alive:true,type:'1up'});sfx('1up')}return}
if(p.type==='question'&&!p.hit){
if(p.coinBlock&&p.hitsLeft>0){p.hitsLeft--;if(p.hitsLeft<=0)p.hit=true;sfx('coin');blockAnims.push({p,t:0});spawnParticle(p.x+16,p.y,'coin');spawnScorePopup(p.x+16,p.y-8,200,'#FFD700');G.score+=200;G.coins+=(G.character==='luigi'?2:1);updateHUD()}
else if(p.has1UP){p.hit=true;sfx('qblock');blockAnims.push({p,t:0});mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:TILE,vx:1.5,vy:0,alive:true,type:'1up'});sfx('1up')}
else if(p.hasStar){p.hit=true;sfx('power');blockAnims.push({p,t:0});mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:24,alive:true,type:'star'})}
else{p.hit=true;sfx('qblock');blockAnims.push({p,t:0});
if(p.hasMega){mushrooms.push({x:p.x+4,y:p.y-TILE,w:28,h:TILE+8,vx:1.5,vy:0,alive:true,type:'mega'})}
else if(p.hasHammer){mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:24,alive:true,type:'hammerSuit'})}
else if(p.hasMush){if(mario.power==='none')mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:TILE,vx:1.5,vy:0,alive:true,type:'mushroom'});else mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:24,alive:true,type:G.iceMode?'iceFlower':'flower'})}
else{spawnParticle(p.x+16,p.y,'coin');spawnScorePopup(p.x+16,p.y-8,200,'#FFD700');G.score+=200;G.coins+=(G.character==='luigi'?2:1);sfx('coin');updateHUD()}}}
else if(p.type==='brick'){if(mario.big){sfx('break');G.score+=50;updateHUD();spawnParticle(p.x+16,p.y,'brick');spawnScorePopup(p.x+16,p.y-8,50,'#e67e22');const idx=platforms.indexOf(p);if(idx!==-1)platforms.splice(idx,1)}else{blockAnims.push({p,t:0})}}}

// === GAME MANAGEMENT ===
function startFromStage(id){G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;G.usedUndergrounds=new Set();yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.runAway=false;G.pinoRoom=false;G.isExStage=false;G.exStageFrom=null;pinoObj.alive=false;const _ss=getStageById(id);if(!_ss)return;G.currentWorld=_ss.world;G.currentLevel=_ss.level;flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.lowGravity=false;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;_ss.build();mario.big=false;mario.power='none';fireballs.length=0;resetMario();G.timeLeft=400;G.stageKills=0;G.stageMaxCombo=0;G.stageCoinsStart=G.coins;G.stageStartTime=performance.now();G.coinMagnet=false;G.doubleJump=false;G.doubleJumpUsed=false;G.retryHeart=0;G.highJump=false;G.shield=0;G.heldItem=null;G.stageDamaged=false;G.state='intro';G.introTimer=120;if(G.timerTick)clearInterval(G.timerTick);updateHUD();try{AC.resume()}catch(e){}}
function startGame(){G.usedUndergrounds=new Set();G.exStageUsed=false;G.ex1Cleared=false;G.ex2Used=false;G.exStageNum=1;G.lowGravity=false;G.clearedStages=[];G.stageTimes={};_saveInfo=null;try{localStorage.removeItem('mario_v2_save');}catch(_e){}G.currentWorld=1;G.currentLevel=1;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;const _sg=getStage(1,1);if(_sg){_sg.build();}mario.big=false;mario.power='none';fireballs.length=0;resetMario();G.heldItem=null;G.stageDamaged=false;G.timeLeft=400;G.state='intro';G.introTimer=120;if(G.timerTick)clearInterval(G.timerTick);updateHUD();try{AC.resume()}catch(e){}}
function restartCurrentLevel(){G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.runAway=false;G.pinoRoom=false;G.isExStage=false;G.exStageFrom=null;pinoObj.alive=false;const _rs=getStage(G.currentWorld,G.currentLevel);if(_rs){flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.lowGravity=false;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;_rs.build();}mario.big=false;mario.power='none';fireballs.length=0;resetMario();G.timeLeft=400;G.stageStartTime=performance.now();G.coinMagnet=false;G.doubleJump=false;G.doubleJumpUsed=false;G.retryHeart=0;G.highJump=false;G.shield=0;G.heldItem=null;G.stageDamaged=false;G.state='intro';G.introTimer=120;if(G.timerTick)clearInterval(G.timerTick);updateHUD();try{AC.resume()}catch(e){}}
function killMario(force=false){
if(mario.dead)return;
if(!force&&(G.starTimer>0||mario.inv>0))return;
if(!force&&yoshi.mounted&&yoshi.alive&&!mario.crouching){dismountYoshi(true);mario.inv=120;return}
G.stageDamaged=true;
if(!force&&G.megaTimer>0){G.megaTimer=0;mario.power=G.megaPrevPower;mario.big=G.megaPrevBig;mario.h=mario.big?48:32;mario.crouching=false;mario.inv=120;sfx('break');return}
if(!force&&(mario.power==='fire'||mario.power==='ice'||mario.power==='hammer')){mario.power='big';mario.crouching=false;mario.inv=120;sfx('break');return}
if(!force&&mario.power==='big'){mario.power='none';mario.big=false;mario.h=32;mario.crouching=false;mario.inv=120;sfx('break');return}
// リトライハート: 死亡回避、その場復活
if(G.retryHeart>0){G.retryHeart--;mario.inv=180;mario.vy=-10;sfx('1up');G.shakeX=10;G.shakeY=10;for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+16,'star');spawnScorePopup(mario.x+13,mario.y-20,'RETRY!','#ff4444');return;}
if(yoshi.mounted&&yoshi.alive){yoshi.mounted=false;yoshi.alive=false;}
// 死亡時に特殊効果リセット（チェックポイント復帰用に保存）
const _svMagnet=G.coinMagnet,_svJump=G.doubleJump,_svRetry=G.retryHeart,_svHighJump=G.highJump;
G.coinMagnet=false;G.doubleJump=false;G.doubleJumpUsed=false;G.retryHeart=0;G.highJump=false;
G.lives--;G.combo=0;sfx('die');stopBGM();mario.dead=true;mario.vy=-11;G.shakeX=8;G.shakeY=8;updateHUD();
setTimeout(()=>{
// EXステージ失敗→ピノキオ部屋へ戻る（残機減少を打ち消す）
if(G.isExStage){G.lives++;G.isExStage=false;G.exStageFailed=true;G.lowGravity=false;
  G.savedOW=G.exSavedOW||{cam:0,mx:80,my:H-TILE,waterMode:false,ugKey:null};G.exSavedOW=null;
  if(G.pswitchTimer>0){G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;}
  flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;
  platforms.length=0;pipes.length=0;coinItems.length=0;enemies.length=0;mushrooms.length=0;piranhas.length=0;movingPlats.length=0;springs.length=0;cannons.length=0;bulletBills.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;bowserShockwaves.length=0;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;
  buildUnderground('pinocchio_fail');
  G.cam=0;mario.x=60;mario.y=H-3*TILE;mario.vx=0;mario.vy=0;mario.dead=false;mario.big=false;mario.power='none';
  G.ugMode=true;G.pinoRoom=true;G.timeLeft=400;
  G.state='play';if(G.timerTick)clearInterval(G.timerTick);G.timerTick=setInterval(()=>{if(G.state==='play'&&!G.paused){G.timeLeft--;if(G.timeLeft<=0){clearInterval(G.timerTick);killMario(true);}updateHUD()}},1000);
  sfx('flag');stopBGM();try{startBGM()}catch(ex){};return;}
if(G.lives<=0){G.state='over';clearInterval(G.timerTick);try{playGameOverJingle();}catch(ex){}}else{
if(G.checkpointReached&&G.checkpoint){
// チェックポイント位置とクッパCP到達状態を保存
const _cpx=G.checkpoint.x,_cpy=G.checkpoint.y;const _cp2r=G.checkpoint2&&G.checkpoint2.reached;
// レベル再構築（ブロック・敵を全復活）
const _rs=getStage(G.currentWorld,G.currentLevel);if(_rs){flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;_rs.build();}
mario.power='none';mario.big=false;mario.h=32;resetMario();mario.x=_cpx;mario.y=_cpy-mario.h;G.cam=Math.max(0,Math.min(mario.x-W/3,LW-W));G.timeLeft=400;G.stageStartTime=performance.now();
// ショップ購入効果を復元（チェックポイント復帰時は継続）
G.coinMagnet=_svMagnet;G.doubleJump=_svJump;G.retryHeart=_svRetry;G.highJump=_svHighJump;
// チェックポイント到達状態を復元
G.checkpointReached=true;G.checkpoint={x:_cpx,y:_cpy,reached:true};
if(_cp2r&&G.checkpoint2){G.checkpoint2.reached=true;G.checkpoint.x=G.checkpoint2.x;G.checkpoint.y=G.checkpoint2.y;mario.x=G.checkpoint2.x;mario.y=G.checkpoint2.y-mario.h;G.cam=Math.max(0,Math.min(mario.x-W/3,LW-W));}
G.state='play';G.timerTick=setInterval(()=>{if(G.state==='play'&&!G.paused){G.timeLeft--;if(G.timeLeft<=0){clearInterval(G.timerTick);killMario(true);}updateHUD()}},1000);try{startBGM()}catch(ex){}}else{G.state='dead';clearInterval(G.timerTick)}}},2200)}
function updateHUD(){if(G.coins>=2000){G.coins=1999;}document.getElementById('hScore').textContent=String(G.score).padStart(6,'0');document.getElementById('hCoins').textContent='x'+String(G.coins).padStart(4,'0');document.getElementById('hTime').textContent=G.timeLeft;document.getElementById('hWorld').textContent=G.isExStage?'EX'+(G.exStageNum||1):G.currentWorld+'-'+G.currentLevel;const li=document.getElementById('lives-icons');li.innerHTML='';for(let i=0;i<Math.max(0,G.lives);i++){const s=document.createElement('span');s.textContent='🍄';s.style.fontSize='14px';li.appendChild(s)}}

// === SAVE / LOAD ===
let _saveInfo=null;(function(){try{const _r=localStorage.getItem('mario_v2_save');if(_r)_saveInfo=JSON.parse(_r);}catch(e){}}());
(function(){try{const _c=localStorage.getItem('mario_v2_char');if(_c==='luigi'||_c==='mario')G.character=_c;}catch(e){}})();
function hasSave(){return!!_saveInfo;}
function saveGame(){const _sid=getStage(G.currentWorld,G.currentLevel)?.id;const _nid=G.nextStage?G.nextStage.id:(_sid||1);_saveInfo={score:G.score,coins:G.coins,lives:G.lives,nextStageId:_nid,clearedStages:[...G.clearedStages],stageTimes:{...G.stageTimes},character:G.character,ex1Cleared:G.ex1Cleared,ex2Used:G.ex2Used,exStageUsed:G.exStageUsed,savedAt:new Date().toISOString()};try{localStorage.setItem('mario_v2_save',JSON.stringify(_saveInfo));}catch(e){}}
function loadSave(){if(!_saveInfo)return;G.score=_saveInfo.score||0;G.coins=Math.min(1999,_saveInfo.coins||0);G.lives=Math.max(1,_saveInfo.lives||3);G.clearedStages=Array.isArray(_saveInfo.clearedStages)?[..._saveInfo.clearedStages]:[];G.stageTimes={..._saveInfo.stageTimes||{}};G.character=_saveInfo.character||'mario';try{localStorage.setItem('mario_v2_char',G.character);}catch(_e){}G.ex1Cleared=!!_saveInfo.ex1Cleared;G.ex2Used=!!_saveInfo.ex2Used;G.exStageUsed=!!_saveInfo.exStageUsed;G.exStageNum=1;G.isExStage=false;G.lowGravity=false;updateHUD();startFromStage(getStageById(_saveInfo.nextStageId||1)?(_saveInfo.nextStageId||1):1);}

// === UPDATE ===
function update(){
G.frame++;if(G.swimCooldown>0)G.swimCooldown--;
{const _cBig=G.megaTimer>0;const _nBase=G.state==='play'&&!G.starTimer&&!G.waterMode&&!G.ugMode&&getStage(G.currentWorld,G.currentLevel)?.bgmTheme!=='castle';if(_nBase&&_cBig!==_bgmWasBig&&bgmGain){_bgmWasBig=_cBig;stopBGM();try{startBGM()}catch(e){}}else{_bgmWasBig=_cBig;if(bgmGain)try{scheduleBGM()}catch(e){bgmGain=null}}}
G.shakeX*=0.8;G.shakeY*=0.8;if(Math.abs(G.shakeX)<0.1)G.shakeX=0;if(Math.abs(G.shakeY)<0.1)G.shakeY=0;
for(let i=blockAnims.length-1;i>=0;i--){const b=blockAnims[i];b.t+=0.2;b.p.bounceOffset=Math.sin(b.t)*8*Math.max(0,1-b.t/Math.PI);if(b.t>Math.PI){b.p.bounceOffset=0;blockAnims.splice(i,1)}}
if(G.state==='shop'){updateParticles();return}
if(G.state==='intro'){G.introTimer--;updateParticles();if(G.introTimer<=0){G.state='play';G.timerTick=setInterval(()=>{if(G.state==='play'&&!G.paused){G.timeLeft--;if(G.timeLeft<=0){clearInterval(G.timerTick);killMario(true);}updateHUD()}},1000);try{startBGM()}catch(e2){}}return}
if(G.goalSlide){G.goalSlide.t++;if(G.goalSlide.phase==='slide'){mario.y+=3;mario.x=flagPole.x-4;if(mario.y>=H-TILE-mario.h){mario.y=H-TILE-mario.h;G.goalSlide.phase='walk'}}else if(G.goalSlide.phase==='walk'){mario.x+=2;mario.facing=1;mario.walkTimer++;if(mario.walkTimer>5){mario.walkTimer=0;mario.walkFrame=(mario.walkFrame+1)%3}if(G.goalSlide.t>120){G.goalSlide=null;G.score+=1000+G.timeLeft*50;clearInterval(G.timerTick);updateHUD();
  if(!G.stageDamaged){G.coins=Math.min(1999,G.coins+30);G.score+=5000;updateHUD();spawnScorePopup(mario.x+13,mario.y-30,'PERFECT! +30C','#FFD700');for(let _pf=0;_pf<30;_pf++)spawnParticle(mario.x+(Math.random()-0.5)*40,mario.y-Math.random()*60,'star');try{beep(880,.1,'sine',.15);beep(1100,.1,'sine',.15,.1);beep(1320,.1,'sine',.15,.2)}catch(ex){}}
  // 花火（スコア下1桁が1,3,6）
  const _ld=G.score%10;if(_ld===1||_ld===3||_ld===6){for(let _fw=0;_fw<6;_fw++)setTimeout(()=>{const _fx=mario.x+(Math.random()-0.5)*200,_fy=H-TILE-80-Math.random()*120;for(let _fp=0;_fp<15;_fp++)spawnParticle(_fx,_fy,'star');try{beep(600+Math.random()*400,.1,'sine',.1)}catch(ex){}},_fw*300);}
  // EXステージクリア → 元ステージをクリア扱いにする
  if(G.isExStage&&G.exStageFrom){if(G.exStageNum===1)G.ex1Cleared=true;G.lowGravity=false;const _ef=G.exStageFrom;G.isExStage=false;G.exStageFrom=null;G.currentWorld=_ef.world;G.currentLevel=_ef.level;}
  {const _cId=getStage(G.currentWorld,G.currentLevel)?.id;if(_cId){if(!G.clearedStages.includes(_cId))G.clearedStages.push(_cId);const _et=Math.round((performance.now()-G.stageStartTime)/1000);if(!G.stageTimes[_cId]||_et<G.stageTimes[_cId])G.stageTimes[_cId]=_et;}}
  const _ns=getNextStage(G.currentWorld,G.currentLevel);if(_ns){G.nextStage=_ns;G.state='shop';G.shopCursor=0;G.shopBought={};G.shopConfirm=null;try{startBGM()}catch(ex){};saveGame();}else{G.state='win';for(let i=0;i<30;i++)setTimeout(()=>spawnParticle(mario.x,H-TILE-100+Math.random()*80,'star'),i*60)}}}else if(G.goalSlide.phase==='pipeGoal'){if(G.goalSlide.t>60){G.goalSlide=null;G.score+=1000+G.timeLeft*50;clearInterval(G.timerTick);updateHUD();
  if(!G.stageDamaged){G.coins=Math.min(1999,G.coins+30);G.score+=5000;updateHUD();spawnScorePopup(mario.x+13,mario.y-30,'PERFECT! +30C','#FFD700');for(let _pf2=0;_pf2<30;_pf2++)spawnParticle(mario.x+(Math.random()-0.5)*40,mario.y-Math.random()*60,'star');try{beep(880,.1,'sine',.15);beep(1100,.1,'sine',.15,.1);beep(1320,.1,'sine',.15,.2)}catch(ex){}}
  const _ld2=G.score%10;if(_ld2===1||_ld2===3||_ld2===6){for(let _fw=0;_fw<6;_fw++)setTimeout(()=>{const _fx=mario.x+(Math.random()-0.5)*200,_fy=H-TILE-80-Math.random()*120;for(let _fp=0;_fp<15;_fp++)spawnParticle(_fx,_fy,'star');try{beep(600+Math.random()*400,.1,'sine',.1)}catch(ex){}},_fw*300);}
  // EXステージパイプゴール→元ステージクリア
  if(G.isExStage&&G.exStageFrom){if(G.exStageNum===1)G.ex1Cleared=true;G.lowGravity=false;const _ef2=G.exStageFrom;G.isExStage=false;G.exStageFrom=null;G.currentWorld=_ef2.world;G.currentLevel=_ef2.level;}
  {const _cId2=getStage(G.currentWorld,G.currentLevel)?.id;if(_cId2){if(!G.clearedStages.includes(_cId2))G.clearedStages.push(_cId2);const _et2=Math.round((performance.now()-G.stageStartTime)/1000);if(!G.stageTimes[_cId2]||_et2<G.stageTimes[_cId2])G.stageTimes[_cId2]=_et2;}}
  const _ns2=getNextStage(G.currentWorld,G.currentLevel);if(_ns2){G.nextStage=_ns2;G.state='shop';G.shopCursor=0;G.shopBought={};G.shopConfirm=null;try{startBGM()}catch(ex){};saveGame();}else{G.state='win';for(let _pi=0;_pi<30;_pi++)setTimeout(()=>spawnParticle(mario.x,H-TILE-100+Math.random()*80,'star'),_pi*60)}}}updateParticles();return}
// Moving platforms
for(const mp of movingPlats){mp.prevX=mp.x;mp.prevY=mp.y;if(mp.type==='h')mp.x=mp.ox+Math.sin(G.frame*0.015*mp.spd)*mp.range;else if(mp.type==='v')mp.y=mp.oy+Math.sin(G.frame*0.015*mp.spd)*mp.range;else if(mp.type==='fall'){if(mp.falling){mp.vy+=0.3;mp.y+=mp.vy;if(mp.y>H+100){mp.y=mp.oy;mp.vy=0;mp.falling=false;mp.fallTimer=0}}}}
if(G.starTimer>0){G.starTimer--;if(G.frame%3===0)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');if(G.starTimer<=0){mario.inv=0;stopBGM();try{startBGM()}catch(e){}}}
// P-Switch timer
if(G.pswitchTimer>0){G.pswitchTimer--;if(G.pswitchTimer<=180&&G.pswitchTimer>0&&G.frame%30===0)sfx('pswitch_tick');if(G.pswitchTimer<=0)deactivatePSwitch();
// P-Switch coin collection (bricks turned into coins)
if(G._psCoins){for(const pc of G._psCoins){if(pc.collected)continue;if(overlap(mario.x,mario.y,mario.w,mario.h,pc.x,pc.y,TILE,TILE)){pc.collected=true;G.coins+=(G.character==='luigi'?2:1);G.score+=200;sfx('coin');updateHUD();spawnScorePopup(pc.x+8,pc.y-8,200,'#FFD700');spawnParticle(pc.x+16,pc.y,'coin');}}}}
if(G.comboTimer>0){G.comboTimer--;if(G.comboTimer<=0)G.combo=0}
// Bullet Bill Cannons
for(const cn of cannons){if(cn.dead)continue;cn.timer--;if(cn.timer<=0){cn.timer=cn.fireRate;if(Math.abs(mario.x-cn.x)<600){const dir=mario.x>cn.x?1:-1;bulletBills.push({x:cn.x+(dir>0?cn.w:-20),y:cn.y+4,w:20,h:16,vx:dir*4,alive:true});try{beep(80,.15,'sawtooth',.15);beep(60,.2,'sawtooth',.1,.1)}catch(ex){}}}}
// Bullet Bills
for(let i=bulletBills.length-1;i>=0;i--){const bb=bulletBills[i];if(!bb.alive){bulletBills.splice(i,1);continue}bb.x+=bb.vx;if(bb.x<G.cam-100||bb.x>G.cam+W+100){bulletBills.splice(i,1);continue}
if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,bb.x,bb.y,bb.w,bb.h)){if(G.starTimer>0){bb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(bb.x+10,bb.y+8,'star')}else if(mario.y+mario.h-mario.vy<=bb.y+4){bb.alive=false;mario.vy=-9;G.score+=200;sfx('stomp');updateHUD();spawnParticle(bb.x+10,bb.y+8,'dust');spawnScorePopup(bb.x+10,bb.y-8,200,'#e74c3c')}else if(mario.inv===0)killMario()}
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
// 壁キック猶予タイマー
if(mario.wallContactTimer>0){mario.wallContactTimer--;}else{mario.wallContact=0;}
// ヒップドロップ（空中＋下キー）
if(!mario.onGround&&!mario.hipDrop&&!G.waterMode&&(keys['ArrowDown']||keys['KeyS']||btn.down||gpad.down)&&mario.vy>0){mario.hipDrop=true;mario.vy=16;mario.vx=0;try{beep(200,.08,'square',.15);beep(150,.1,'square',.1,.05);}catch(ex){}}
// しゃがみ
{const _isDown=keys['ArrowDown']||keys['KeyS']||btn.down||gpad.down;
const _wantCrouch=mario.onGround&&_isDown&&!mario.sliding&&!mario.hipDrop&&!G.waterMode&&!mario.dead;
const _nH=mario.big?48:32,_cH=mario.big?24:20;
if(_wantCrouch){
  if(!mario.crouching){mario.y+=_nH-_cH;mario.h=_cH;mario.crouching=true;}
  else if(mario.h!==_cH){mario.y+=mario.h-_cH;mario.h=_cH;}
}else if(mario.crouching&&!mario.sliding){
  const _testY=mario.y-(_nH-mario.h);
  let _bl=false;
  for(const p of platforms){if(overlap(mario.x,_testY,mario.w,_nH,p.x,p.y-(p.bounceOffset||0),p.w,p.h)){_bl=true;break;}}
  if(!_bl){for(const p of pipes){if(overlap(mario.x,_testY,mario.w,_nH,p.x,p.y,p.w,p.h)){_bl=true;break;}}}
  if(!_bl){mario.y=_testY;mario.h=_nH;mario.crouching=false;}
}}
// スライディング
const isDash=keys['ShiftLeft']||keys['ShiftRight']||btn.dash||gpad.b;
if(!mario.sliding&&isDash&&mario.onGround&&(keys['ArrowDown']||keys['KeyS']||btn.down||gpad.down)&&Math.abs(mario.vx)>3&&!G.waterMode){
  mario.sliding=true;mario.crouching=false;mario.slideTimer=30;const _oldH=mario.h;mario.h=mario.big?24:20;mario.y+=_oldH-mario.h;
  sfx('stomp');for(let i=0;i<4;i++)spawnParticle(mario.x+13,mario.y+mario.h,'dust');
}
if(mario.sliding){
  mario.slideTimer--;mario.vx*=0.97;
  // スライド中の敵ヒット
  for(const e of enemies){if(!e.alive||e.state==='dead')continue;if(!overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h))continue;
    if(e.type==='teresa'||e.type==='thwomp')continue;
    if(e.type==='koopa'||e.type==='buzzy'){if(e.state==='walk'){e.state='shell';e.vx=mario.facing*8;e.h=TILE*0.7;e.shellTimer=300;}else if(e.state==='shell'&&Math.abs(e.vx)<0.5){e.vx=mario.facing*8;}}
    else{e.state='dead';e.squishT=28;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');spawnScorePopup(e.x+16,e.y-8,200,'#e74c3c');}
  }
  if(mario.slideTimer<=0||Math.abs(mario.vx)<1){
    const _newH=mario.big?48:32;const _testY=mario.y-(_newH-mario.h);
    let _blocked=false;for(const p of platforms){if(overlap(mario.x,_testY,mario.w,_newH,p.x,p.y-(p.bounceOffset||0),p.w,p.h)){_blocked=true;break;}}
    for(const p of pipes){if(overlap(mario.x,_testY,mario.w,_newH,p.x,p.y,p.w,p.h)){_blocked=true;break;}}
    if(!_blocked){mario.y=_testY;mario.h=_newH;mario.sliding=false;mario.slideTimer=0;}
    else{mario.slideTimer=5;}
  }
}
const spd=G.waterMode?(isDash?3.5:2.2):(isDash?6.5:3.8);
const goL=keys['ArrowLeft']||keys['KeyA']||btn.left||gpad.left;const goR=keys['ArrowRight']||keys['KeyD']||btn.right||gpad.right;
const _af=G.iceMode?0.042:0.25,_ff=G.iceMode?0.9895:0.78;
if(mario.crouching){mario.vx*=_ff;}else if(goL){mario.vx+=(-spd-mario.vx)*_af;mario.facing=-1}else if(goR){mario.vx+=(spd-mario.vx)*_af;mario.facing=1}else mario.vx*=_ff;
if(G.ugMode&&mario.x<0)mario.x=0;if(G.ugMode&&mario.x+mario.w>W)mario.x=W-mario.w;if(G.ugMode)G.cam=0;
// Flutter jump (Yoshi)
if(yoshi.mounted&&yoshi.alive&&yoshi.flutterTimer>0&&(keys['Space']||keys['ArrowUp']||btn.jump||gpad.a)&&mario.vy>0){mario.vy*=0.6;yoshi.flutterTimer--;if(G.frame%2===0)spawnParticle(mario.x+13,mario.y+mario.h,'dust')}
if(!G.waterMode&&!(keys['Space']||keys['ArrowUp']||btn.jump||gpad.a)&&mario.vy<-4)mario.vy+=1.2;
mario.x+=mario.vx;if(G.autoScroll>0){G.cam=Math.min(G.cam+G.autoScroll,LW-W);if(mario.x<G.cam+20)mario.x=G.cam+20;if(mario.x+mario.w>G.cam+W-10)mario.x=G.cam+W-10-mario.w;}else{if(mario.x<0)mario.x=0;G.cam=Math.max(0,Math.min(mario.x-W/3,LW-W));}
for(const p of platforms){if(Math.abs((p.x+16)-mario.x)>260)continue;if(p.type==='hidden'&&!p.hit)continue;cX(mario,p)}
for(const p of pipes){if(Math.abs((p.x+32)-mario.x)>260)continue;cX(mario,p)}
const _grav=G.gravityFlipped?-GRAVITY:(G.waterMode?0.10:G.lowGravity?GRAVITY*0.42:GRAVITY);mario.vy+=_grav;
if(G.gravityFlipped){if(mario.vy<-15)mario.vy=-15;}else{if(mario.vy>(G.waterMode?3.5:G.lowGravity?9:15))mario.vy=G.waterMode?3.5:G.lowGravity?9:15;}
mario.y+=mario.vy;mario.onGround=false;
if(G.gravityFlipped&&mario.y<0){mario.y=0;mario.vy=0;mario.onGround=true;}
if(G.waterMode&&mario.y<TILE){mario.y=TILE;mario.vy=0;}
for(const p of platforms){if(Math.abs((p.x+16)-mario.x)>260)continue;
if(p.type==='hidden'&&!p.hit){const bo=p.bounceOffset||0,py=p.y-bo;if(mario.vy<0&&overlap(mario.x+1,mario.y,mario.w-2,mario.h,p.x,py,p.w,p.h)){mario.y=py+p.h;mario.vy=0;hitBlock(p)}continue}
cY(mario,p,hitBlock)}
// 天井ワープパイプ：cYより先に判定（cYがvy=0にする前に検出する必要がある）
if(!G.ugMode&&!mario.dead&&mario.vy<0){for(const p of pipes){if(!p.ceiling||!p.isWarp||p.used)continue;if(Math.abs((p.x+32)-mario.x)>160)continue;const _ugKey=`${G.currentWorld}-${G.currentLevel}-${p.x}`;if(G.usedUndergrounds&&G.usedUndergrounds.has(_ugKey))continue;if(mario.x+mario.w>p.x&&mario.x<p.x+p.w&&mario.y<=p.y+p.h&&mario.y-mario.vy>p.y+p.h-4){p.used=true;p.ugKey=_ugKey;enterUnderground(p);break;}}}
for(const p of pipes){if(Math.abs((p.x+32)-mario.x)>260)continue;cY(mario,p,null)}
// P-Switch stomp detection (landing on top)
if(G.pswitchTimer<=0&&mario.onGround){for(const p of platforms){if(p.type==='pswitch'&&!p.hit&&mario.y+mario.h>=p.y-(p.bounceOffset||0)-2&&mario.y+mario.h<=p.y-(p.bounceOffset||0)+6&&mario.x+mario.w>p.x&&mario.x<p.x+p.w){activatePSwitch(p);break;}}}
// Gravity flip: land on ceiling of blocks
if(G.gravityFlipped){for(const p of platforms){if(Math.abs((p.x+16)-mario.x)>260)continue;const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(mario.x+1,mario.y,mario.w-2,mario.h,p.x,py,p.w,p.h))continue;if(mario.vy<0&&mario.y>py+p.h/2){mario.y=py+p.h;mario.vy=0;mario.onGround=true;}}}
// Moving platform collision
for(const mp of movingPlats){if(mp.falling&&mp.y>H)continue;if(overlap(mario.x+1,mario.y,mario.w-2,mario.h,mp.x,mp.y,mp.w,mp.h)){const prevBot=mario.y-mario.vy+mario.h;const prevMpY=mp.prevY??mp.y;if(mario.vy>=0&&prevBot<=prevMpY+4){mario.y=mp.y-mario.h;mario.vy=0;mario.onGround=true;mario.x+=mp.x-(mp.prevX??mp.x);if(mp.type==='fall'&&!mp.falling){mp.fallTimer++;if(mp.fallTimer>30)mp.falling=true}}}}
// Springs
for(const sp of springs){if(sp.compressed>0){sp.compressed--;continue}if(overlap(mario.x,mario.y,mario.w,mario.h,sp.x,sp.y,sp.w,sp.h)){if(mario.y+mario.h-mario.vy<=sp.y+4){mario.vy=-20;mario.onGround=false;sp.compressed=15;sfx('jump');for(let i=0;i<6;i++)spawnParticle(sp.x+12,sp.y,'star')}}}
// ヒップドロップ着地
if(mario.hipDrop&&mario.onGround){mario.hipDrop=false;G.shakeX=5;G.shakeY=5;try{beep(80,.2,'sawtooth',.2);beep(50,.25,'sawtooth',.15,.08);}catch(ex){}
  for(let i=0;i<8;i++)spawnParticle(mario.x+13,mario.y+mario.h,'dust');
  // 着地点のブロック破壊（ビッグマリオのみ）
  if(mario.big){for(const p of platforms){if(p.type!=='brick'||p.hit)continue;if(Math.abs(p.x-mario.x)<mario.w+8&&p.y===mario.y+mario.h){p.hit=true;spawnParticle(p.x+16,p.y+16,'brick');G.score+=50;updateHUD();const idx=platforms.indexOf(p);if(idx>=0)platforms.splice(idx,1);}}}
  // 周囲の敵にダメージ
  for(const e of enemies){if(!e.alive||e.state==='dead')continue;if(Math.abs(e.x-mario.x)<TILE*2&&Math.abs(e.y-(mario.y+mario.h))<TILE){if(e.type==='goomba'||e.type==='hammerBro'||e.type==='cactus'||e.type==='penguin'||e.type==='shyGuy'||e.type==='rex'||e.type==='spiny'){e.state='dead';e.squishT=28;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');spawnScorePopup(e.x+16,e.y-8,200,'#e74c3c');}else if(e.type==='bobomb'&&e.state==='walk'){e.state='lit';e.litTimer=180;G.score+=100;sfx('stomp');spawnScorePopup(e.x+16,e.y-8,100,'#ff4400');}}}
}
if(Math.abs(mario.vx)>0.5&&mario.onGround){mario.walkTimer++;if(mario.walkTimer>5){mario.walkTimer=0;mario.walkFrame=(mario.walkFrame+1)%3}}else if(mario.onGround)mario.walkFrame=0;
if(mario.y>H+40){if(G.retryHeart>0){G.retryHeart--;mario.y=H-3*TILE;mario.x=Math.max(G.cam+32,mario.x);mario.vy=-10;mario.inv=180;sfx('1up');G.shakeX=10;G.shakeY=10;for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+16,'star');spawnScorePopup(mario.x+13,mario.y-20,'RETRY!','#ff4444');}else{killMario(true);}}
if(G.autoScroll>0&&mario.x<G.cam+10)killMario(true); // 強制スクロール挟まれ即死
if(mario.inv>0)mario.inv--;

// === YOSHI UPDATE ===
// Yoshi items (hatching eggs)
for(let i=yoshiItems.length-1;i>=0;i--){const yi=yoshiItems[i];
if(!yi.onGround){yi.vy+=GRAVITY;yi.y+=yi.vy;if(yi.y>=H-TILE-yi.h){yi.y=H-TILE-yi.h;yi.vy=0;yi.onGround=true}}
if(yi.onGround){yi.hatchTimer--;if(yi.hatchTimer<=0&&!yi.hatched){yi.hatched=true;
yoshi.x=yi.x;yoshi.y=yi.y-yoshi.h+yi.h;yoshi.alive=true;yoshi.mounted=false;yoshi.runAway=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.facing=1;yoshi.vx=0;yoshi.vy=0;yoshi.idleTimer=0;yoshi.eatTarget=null;yoshi.chewTimer=0;
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
// Tongue（当たり判定修正＋食べる→飲み込むアニメ）
if(yoshi.tongueOut>0){
if(!yoshi.eatTarget){
  // 伸ばしフェーズ
  yoshi.tongueOut--;yoshi.tongueLen=Math.min(yoshi.tongueLen+8,yoshi.tongueMaxLen);
  const tx=yoshi.x+(yoshi.facing===1?yoshi.w:0)+yoshi.facing*yoshi.tongueLen;const ty=yoshi.y+15;
  const _tR=10;
  // 敵チェック（舌先に正確にヒット）
  for(const e of enemies){if(!e.alive||e.state==='dead')continue;
    // ヨッシーが食えない敵（トゲ/爆発/ボス級/大型）
    if(e.type==='spiny'||e.type==='spikeTop'||e.type==='fuzzy'||e.type==='bobomb'||e.type==='thwomp'||e.type==='teresa'||e.type==='pokey'||e.type==='chuck'||e.type==='angrySun'||e.type==='miniBowser')continue;
    if(overlap(tx-_tR,ty-_tR,_tR*2,_tR*2,e.x,e.y,e.w,e.h)){
      const _ec=e.type==='goomba'?'#8B4513':e.type==='koopa_red'||e.type==='koopa_red_fly'?'#c0392b':'#27ae60';
      yoshi.eatTarget={color:_ec};e.state='dead';e.squishT=1;e.alive=false;
      spawnParticle(e.x+e.w/2,e.y+e.h/2,'star');break}}
  // パックンチェック
  if(!yoshi.eatTarget){for(const pr of piranhas){if(!pr.alive)continue;
    if(overlap(tx-_tR,ty-_tR,_tR*2,_tR*2,pr.x,pr.y,pr.w,pr.h)){
      yoshi.eatTarget={color:'#27ae60'};pr.alive=false;
      spawnParticle(pr.x+pr.w/2,pr.y+pr.h/2,'star');break}}}
  // パイポ（飛び跳ねる火の玉）チェック
  if(!yoshi.eatTarget){for(const pp of pipos){if(!pp.alive)continue;
    if(overlap(tx-_tR,ty-_tR,_tR*2,_tR*2,pp.x,pp.y,pp.w,pp.h)){
      yoshi.eatTarget={color:'#ff8844'};pp.alive=false;
      spawnParticle(pp.x+pp.w/2,pp.y+pp.h/2,'star');break}}}
} else {
  // 引き戻しフェーズ（敵を口に運ぶ）
  yoshi.tongueLen-=12;
  if(yoshi.tongueLen<=0){
    // 飲み込み完了
    yoshi.tongueLen=0;yoshi.tongueOut=0;yoshi.chewTimer=18;
    sfx('yoshi_eat');G.score+=200;yoshi.eatCount++;
    if(yoshi.eatCount>=10){yoshi.eatCount=0;G.starTimer=600;mario.inv=600;
      spawnScorePopup(mario.x,mario.y-30,'★STAR!','#FFD700');
      for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+24,'star');
      sfx('power');stopBGM();try{startBGM()}catch(ex){}}
    updateHUD();spawnScorePopup(yoshi.x+yoshi.w/2,yoshi.y-8,200,'#27ae60');
    yoshi.eatTarget=null;
  }
}}
if(yoshi.chewTimer>0)yoshi.chewTimer--;}
// Yoshi thrown eggs
for(let i=yoshiEggs.length-1;i>=0;i--){const eg=yoshiEggs[i];if(!eg.alive){yoshiEggs.splice(i,1);continue}
eg.vy+=0.4;eg.x+=eg.vx;eg.y+=eg.vy;
for(const p of[...platforms,...pipes]){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(eg.x,eg.y,eg.w,eg.h,p.x,py,p.w,p.h))continue;if(eg.y+eg.h/2<py+p.h/2){eg.y=py-eg.h;eg.vy=-6;eg.bounces++}else{eg.vx=-eg.vx}break}
if(eg.bounces>3||eg.x<G.cam-80||eg.x>G.cam+W+80||eg.y>H+50){eg.alive=false;continue}
for(const e of enemies){if(!e.alive||e.state==='dead')continue;if(overlap(eg.x,eg.y,eg.w,eg.h,e.x,e.y,e.w,e.h)){e.state='dead';e.squishT=20;eg.alive=false;G.score+=300;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,300,'#2ecc71')}}}

// === ピノキオ部屋の更新 ===
if(G.pinoRoom){
  // キノピオエンティティ更新（静止＋マリオ方向を向く）
  if(pinoObj.alive){
    pinoObj.vy+=GRAVITY;pinoObj.y+=pinoObj.vy;pinoObj.onGround=false;
    for(const p of platforms){const py=p.y-(p.bounceOffset||0);if(overlap(pinoObj.x,pinoObj.y,pinoObj.w,pinoObj.h,p.x,py,p.w,p.h)){if(pinoObj.vy>0&&pinoObj.y+pinoObj.h/2<py+p.h/2){pinoObj.y=py-pinoObj.h;pinoObj.vy=0;pinoObj.onGround=true;}else if(pinoObj.vy<0){pinoObj.y=py+p.h;pinoObj.vy=0;}}}
    // マリオの方向を向く
    pinoObj.facing=(mario.x+mario.w/2<pinoObj.x+pinoObj.w/2)?-1:1;
    // アイドルアニメ（ゆっくり手を振る）
    pinoObj.frameTimer++;if(pinoObj.frameTimer>20){pinoObj.frameTimer=0;pinoObj.frame=(pinoObj.frame+1)%2;}
    if(G.pinoSpeechTimer>0)G.pinoSpeechTimer--;
  }
  // 宝箱ジャンプ着地：マリオが上から宝箱を踏んで着地したら開く
  if(!G.chestOpened&&mario.onGround){
    for(const p of platforms){
      if(p.type!=='chest'||p.opened)continue;
      // マリオの底が宝箱の上端にある（着地判定）
      if(Math.abs(mario.y+mario.h-p.y)<4&&mario.x+mario.w>p.x+4&&mario.x<p.x+p.w-4){
        mario.vy=-8;mario.onGround=false;
        openChest(p);
        break;
      }
    }
  }
  // pinoNeed カウント更新（isPinoItemのアライブ敵/コイン）
  if(G.pinoNeed>0&&G.chestOpened){
    const _reward=G.pinoReward;
    if(_reward===1||_reward===2||_reward===3||_reward===4){
      // コイン系: まだ残ってるものをカウント
      const _alive=coinItems.filter(c=>c.isPinoItem&&!c.collected).length;
      if(_alive===0){G.pinoNeed=0;}
    }else if(_reward===5||_reward===6||_reward===7){
      // 敵系: まだ生きているものをカウント
      const _alive=enemies.filter(e=>e.isPinoItem&&e.alive&&e.state!=='dead').length;
      if(_alive===0){G.pinoNeed=0;}
    }
  }
  // 出口パイプを出す（pinoNeed=0, 開封済み, 報酬8/9以外, まだ出ていない）
  if(G.chestOpened&&G.pinoNeed===0&&G.pinoReward>=0&&G.pinoReward!==8&&G.pinoReward!==9&&!pipes.some(p=>p.isExit||p.isExWarp)){
    spawnPinoExit();
  }
  // 報酬#8（ゴールフラグ）: セリフ終了後にフラグポール＋出口パイプを出す
  if(G.chestOpened&&G.pinoReward===8&&G.pinoSpeechTimer===0&&!G.pinoFlagReady){
    G.pinoFlagReady=true;G.pinoFlagDelay=90; // 1.5秒猶予（選択のため）
    if(!pipes.some(p=>p.isExit))
      pipes.push({x:W-3*TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
  }
  if(G.pinoFlagDelay>0)G.pinoFlagDelay--;
  // フラグポール：猶予後にマリオが左端フラグに触れたらステージクリア（x=48が旗の x）
  if(G.pinoFlagReady&&G.pinoFlagDelay===0&&!mario.dead&&mario.x+mario.w>=48&&mario.x<=64){
    G.pinoFlagReady=false;G.pinoFlagDelay=0;G.pinoReward=-2;
    G.pinoRoom=false;pinoObj.alive=false;G.ugMode=false;G.savedOW=null;
    const _from=G.isExStage?G.exStageFrom:null;
    G.isExStage=false;G.exStageFrom=null;
    if(_from){G.currentWorld=_from.world;G.currentLevel=_from.level;}
    G.score+=2000+G.timeLeft*50;clearInterval(G.timerTick);updateHUD();
    sfx('flag');stopBGM();
    const _ns=getNextStage(G.currentWorld,G.currentLevel);
    if(_ns){G.nextStage=_ns;G.state='shop';G.shopCursor=0;G.shopBought={};G.shopConfirm=null;try{startBGM()}catch(ex){};}
    else{G.state='win';}
  }
  // miniBowser（ピノキオ報酬5）の更新 - 中ボス仕様
  // 画面全体を飛び回る・攻撃なし・踏み限定・HP減るごとに加速
  for(const e of enemies){
    if(!e.alive||e.type!=='miniBowser')continue;
    if(e.state==='dead'){e.squishT--;if(e.squishT<=0)e.alive=false;continue;}
    if(e.hurtTimer>0)e.hurtTimer--;
    // HPに応じた速度（3→2→1 で段階的に加速）
    const _spd=e.hp>=3?2.5:e.hp===2?3.8:5.2;
    const _jmpVy=e.hp>=3?-8:e.hp===2?-10:-12;
    e.vy+=GRAVITY;e.x+=e.vx;e.y+=e.vy;e.onGround=false;
    for(const p of platforms){const py=p.y-(p.bounceOffset||0);if(overlap(e.x,e.y,e.w,e.h,p.x,py,p.w,p.h)&&e.vy>=0&&e.y+e.h/2<py+p.h/2){e.y=py-e.h;e.vy=0;e.onGround=true;break;}}
    // 壁反射（画面全体を飛び回る）
    if(e.x<0){e.x=0;e.vx=_spd;}
    if(e.x+e.w>W){e.x=W-e.w;e.vx=-_spd;}
    e.facing=e.vx>=0?1:-1;
    // 地上を歩き回る（ジャンプなし、方向転換のみ）
    if(e.onGround){
      e.turnTimer=(e.turnTimer||0)-1;
      if(e.turnTimer<=0){
        // 方向: 30%でランダム反転、70%でマリオ方向追跡
        if(Math.random()<0.3)e.vx=-Math.sign(e.vx||1)*_spd;
        else e.vx=(mario.x<e.x?-1:1)*_spd;
        e.turnTimer=60+Math.floor(Math.random()*60);
      }
    }
    // 速度維持
    if(Math.abs(e.vx)<_spd*0.8)e.vx=Math.sign(e.vx||1)*_spd;
    e.walkTimer++;if(e.walkTimer>6){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
    // マリオとの衝突（踏みのみで倒せる）
    if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)&&e.hurtTimer===0){
      const mBot=mario.y+mario.h;
      if(G.starTimer>0){e.state='dead';e.squishT=28;e.alive=false;G.score+=1000;sfx('stomp');updateHUD();spawnParticle(e.x+24,e.y+32,'star');spawnScorePopup(e.x+24,e.y-8,1000,'#FFD700');}
      else if(mBot-mario.vy<=e.y+e.h*0.35){
        e.hurtTimer=42;e.hp--;mario.vy=-10;mario.inv=42;sfx('stomp');
        G.shakeX=5;G.shakeY=5;
        spawnParticle(e.x+24,e.y+32,'dust');
        if(e.hp<=0){
          e.state='dead';e.squishT=28;e.alive=false;
          G.score+=2000;sfx('stomp');updateHUD();
          spawnScorePopup(e.x+24,e.y-8,2000,'#ff4400');
          for(let i=0;i<20;i++)spawnParticle(e.x+24,e.y+32,'star');
          // 撃破ボーナス: 250コインシャワー（1コイン=5コイン分×50枚）
          spawnScorePopup(W/2,H/2-40,'VICTORY! +250コイン','#FFD700');
          for(let _ci=0;_ci<50;_ci++){
            coinItems.push({
              x:TILE*2+8+Math.random()*(W-TILE*4-16),y:-TILE*(1+Math.random()*4),
              vx:(Math.random()-0.5)*4,vy:1.5+Math.random()*3,
              type:'firecoin',gravity:0.28,timer:700,
              collected:false,noLand:true,coinValue:5
            });
          }
          sfx('1up');
        } else {
          G.score+=500;updateHUD();
          spawnScorePopup(e.x+24,e.y-8,500,'#e74c3c');
          // HP減ったら方向転換＋速度アップ（ジャンプなし）
          e.vx=(mario.x<e.x?-1:1)*_spd*1.1;e.turnTimer=30;
        }
      }
      else if(mario.inv===0){
        // 中ボス敗北 → 元ステージへ戻る（残機減らさない）
        mario.inv=120;
        spawnScorePopup(W/2,H/2,'DEFEATED... STAGEに戻る','#ff4444');
        sfx('die');stopBGM();
        e.state='dead';e.alive=false;
        G.shakeX=10;G.shakeY=10;
        setTimeout(()=>{if(G.pinoRoom&&G.ugMode)exitUnderground(true);},1200);
      }
    }
    // ファイア/アイス/ハンマーは無効（踏み限定）
    // ファイアボールの命中時は跳ね返すのみ
    for(let i=fireballs.length-1;i>=0;i--){const fb=fireballs[i];if(!fb.alive)continue;if(overlap(fb.x,fb.y,fb.w,fb.h,e.x,e.y,e.w,e.h)){fb.alive=false;spawnParticle(e.x+24,e.y+32,'dust');}}
    for(let i=iceBalls.length-1;i>=0;i--){const ib=iceBalls[i];if(!ib.alive)continue;if(overlap(ib.x,ib.y,ib.w,ib.h,e.x,e.y,e.w,e.h)){ib.alive=false;spawnParticle(e.x+24,e.y+32,'dust');}}
    for(let i=marioHammers.length-1;i>=0;i--){const mh=marioHammers[i];if(!mh.alive)continue;if(overlap(mh.x,mh.y,mh.w,mh.h,e.x,e.y,e.w,e.h)){mh.alive=false;spawnParticle(e.x+24,e.y+32,'dust');}}
  }
}

// Coins
for(const c of coinItems){if(c.collected)continue;if(c.type==='frozendrop'){c.vy+=c.gravity;c.x+=c.vx;c.y+=c.vy;c.timer--;if(c.timer<=0){c.collected=true;continue}if(!c.noCollect&&overlap(mario.x,mario.y,mario.w,mario.h,c.x,c.y,16,16)){c.collected=true;sfx('coin');G.score+=100;updateHUD();spawnScorePopup(c.x+8,c.y,'+100','#44bbff');spawnParticle(c.x+8,c.y,'coin')}continue}
if(c.type==='firecoin'){if(!c.onGround)c.vy+=c.gravity;c.x+=c.vx;c.y+=c.vy;c.timer--;if(c.y>H+20||c.timer<=0){c.collected=true;continue}c.onGround=false;if(c.vy>=0&&c.y+14>=H-TILE){c.y=H-TILE-14;c.vy=0;c.onGround=true;}if(c.noLand){if(c.x<TILE*2){c.x=TILE*2;if(c.vx<0)c.vx=-c.vx;}if(c.x+14>W-TILE*2){c.x=W-TILE*2-14;if(c.vx>0)c.vx=-c.vx;}}if(!c.noLand&&!c.onGround){for(const p of platforms){const py=p.y-(p.bounceOffset||0);if(c.vy>=0&&c.x+12>p.x&&c.x+2<p.x+p.w&&c.y+14>py&&c.y<py+p.h/2){c.y=py-14;c.vy=0;c.onGround=true;break;}}}if(c.onGround){c.vx*=0.88;if(Math.abs(c.vx)<0.05)c.vx=0;}if(!c.noCollect&&overlap(mario.x,mario.y,mario.w,mario.h,c.x,c.y,14,14)){const _cv=c.coinValue||1;c.collected=true;G.coins=Math.min(1999,G.coins+_cv*(G.character==='luigi'?2:1));G.score+=100*_cv;sfx('coin');updateHUD();spawnScorePopup(c.x+7,c.y-4,`+${_cv}C`,'#FFD700');spawnParticle(c.x+7,c.y,'coin')}continue}if(c.pop){c.popY+=c.popVy;c.popVy+=0.4;c.life--;if(c.life<=0)c.collected=true;continue}
// コイン磁石
if(G.coinMagnet&&!c.pop){const _dx=mario.x+13-c.x,_dy=mario.y+mario.h/2-c.y,_dist=Math.sqrt(_dx*_dx+_dy*_dy);if(_dist<150&&_dist>2){const _pull=3/Math.max(_dist,20)*150;c.x+=_dx/_dist*Math.min(_pull,5);c.y+=_dy/_dist*Math.min(_pull,5);}}
if(overlap(mario.x,mario.y,mario.w,mario.h,c.x,c.y,TILE,TILE)){c.collected=true;G.coins+=(G.character==='luigi'?2:1);G.score+=100;sfx('coin');updateHUD();spawnScorePopup(c.x+8,c.y,'+100','#FFD700');spawnParticle(c.x+8,c.y,'coin')}}
// Mushrooms etc
for(const m of mushrooms){if(!m.alive)continue;
if(m.type==='flower'||m.type==='iceFlower'||m.type==='hammerSuit'||m.type==='star'||m.type==='mega'){if(m.type==='star')m.bobY=(m.bobY||0)+0.1;
if(overlap(mario.x,mario.y,mario.w,mario.h,m.x,m.y+(m.type==='star'?Math.sin(m.bobY||0)*4:0),m.w,m.h)){m.alive=false;
if(m.type==='star'){G.starTimer=480;mario.inv=60;sfx('power');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'STAR!','#FFD700');for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+24,'star');stopBGM();try{startBGM()}catch(ex){}}
else if(m.type==='mega'){G.megaPrevPower=mario.power;G.megaPrevBig=mario.big;G.megaTimer=1200;sfx('power');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'MEGA!','#ff4400');for(let i=0;i<25;i++)spawnParticle(mario.x+13,mario.y+24,'star');G.shakeX=10;G.shakeY=10;}
else if(m.type==='iceFlower'){upgradeMario('flower');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'ICE!','#44bbff')}
else if(m.type==='hammerSuit'){upgradeMario('hammer');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'HAMMER!','#888')}
else{upgradeMario('flower');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'1000','#FF6B6B')}}continue}
m.x+=m.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-m.x)>220)continue;cX(m,p)}
m.vy+=GRAVITY;m.y+=m.vy;m.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-m.x)>220)continue;cY(m,p,null)}
if(m.y>H+100){m.alive=false;continue}
if(overlap(mario.x,mario.y,mario.w,mario.h,m.x,m.y,m.w,m.h)){m.alive=false;
if(m.type==='1up'){G.lives++;sfx('1up');updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'1UP!','#2ecc71');for(let i=0;i<10;i++)spawnParticle(mario.x+13,mario.y+24,'star')}
else{upgradeMario('mushroom');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'1000','#2ecc71')}}}
// Enemies
for(const e of enemies){if(!e.alive)continue;if(e.type==='miniBowser')continue;// pinoRoomループで処理
if(e.state==='dead'){e.squishT--;if(e.squishT<=0)e.alive=false;continue}
// 休眠スポーン: カメラ右端+8タイル先に入るまで physics をスキップ（parakoopa/lakitu は自前ロジックで動くので除外）
if(e.type!=='parakoopa'&&e.type!=='lakitu'&&e.type!=='cheepH'&&e.type!=='cheepV'&&e.type!=='firePlant'&&e.type!=='plantFire'&&e.type!=='blooper'&&e.type!=='angrySun'&&!e.activated){if(G.cam+W+TILE*8<e.x)continue;e.activated=true;}
if(e.frozen)continue; // 凍結中は全処理スキップ（凍結専用セクションで対応）
if(e.type==='parakoopa'&&e.flying){e.x+=e.vx;if(e.x+e.w<-100){e.alive=false;continue}e.y=e.baseY+Math.sin(G.frame*0.05+(e.phase||0))*22;if((mario.inv===0||G.starTimer>0)&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');continue}if(mario.y+mario.h-mario.vy<=e.y+e.h*0.4){e.flying=false;e.type='koopa';e.state='shell';e.vx=0;e.h=TILE*0.7;e.shellTimer=300;mario.vy=-9;sfx('stomp');G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;G.score+=200;updateHUD();spawnParticle(e.x+16,e.y,'dust');spawnScorePopup(e.x+8,e.y-8,200,'#e74c3c')}else killMario()}continue}
// === 赤パタパタ（水平飛行）===
if(e.type==='parakoopaR'&&e.flying){
  if(e.baseX===undefined){e.baseX=e.x;e.baseY=e.y;e.range=e.range||80;}
  e.x+=e.vx;e.y=e.baseY;
  if(e.x<=e.baseX-e.range){e.x=e.baseX-e.range;e.vx=Math.abs(e.vx);e.facing=1;}
  else if(e.x>=e.baseX+e.range){e.x=e.baseX+e.range;e.vx=-Math.abs(e.vx);e.facing=-1;}
  if(!mario.dead&&(mario.inv===0||G.starTimer>0)&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
    if(G.starTimer>0){e.alive=false;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');continue;}
    if(mario.y+mario.h-mario.vy<=e.y+e.h*0.4){
      e.flying=false;e.type='koopa';e.state='shell';e.vx=0;e.h=TILE*0.7;e.shellTimer=300;mario.vy=-9;sfx('stomp');
      G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;G.score+=200;updateHUD();spawnParticle(e.x+16,e.y,'dust');spawnScorePopup(e.x+8,e.y-8,200,'#e74c3c');
    } else killMario();
  }
  continue;
}
// ラキチュウ AI (空中追跡 + ノコノコ投下)
if(e.type==='lakitu'){
  if(e.baseY===undefined)e.baseY=e.y;
  const _ldx=mario.x-e.x;if(Math.abs(_ldx)>50){e.vx+=(_ldx>0?0.07:-0.07);e.vx=Math.max(-2.8,Math.min(2.8,e.vx));}else e.vx*=0.88;
  e.x+=e.vx;e.y=e.baseY+Math.sin(G.frame*0.04+(e.phase||0))*12;
  if(e.dropTimer===undefined)e.dropTimer=120+Math.floor(Math.random()*80);
  e.dropTimer--;
  if(e.dropTimer<=0&&Math.abs(mario.x-e.x)<500){
    e.dropTimer=100+Math.floor(Math.random()*80);
    enemies.push({x:e.x+4,y:e.y+TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
    try{beep(500,.04,'square',.1)}catch(ex){}
  }
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
    if(G.starTimer>0){e.state='dead';e.squishT=20;G.score+=400;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y,'star');spawnScorePopup(e.x+8,e.y-8,400,'#FFD700');}
    else if(mario.y+mario.h-mario.vy<=e.y+e.h*0.4&&mario.vy>0){e.state='dead';e.squishT=28;mario.vy=-9;sfx('stomp');G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;G.score+=400;updateHUD();spawnParticle(e.x+16,e.y,'dust');spawnScorePopup(e.x+8,e.y-8,400,'#e74c3c');}
    else if(mario.inv===0)killMario();
  }
  continue;
}
// === テレサ（Boo）===
if(e.type==='teresa'){
  const _tdx=mario.x+13-(e.x+e.w/2),_tdy=(mario.y+mario.h/2)-(e.y+e.h/2);
  const _tdist=Math.sqrt(_tdx*_tdx+_tdy*_tdy)||1;
  // _tdx<0 = テレサが右、_tdx>0 = テレサが左
  const _mFacingBoo=(mario.facing===1&&_tdx<0)||(mario.facing===-1&&_tdx>0);
  if(_mFacingBoo&&_tdist<500&&G.starTimer===0){e.vx*=0.88;e.vy*=0.88;e.hiding=true;}
  else if(!_mFacingBoo&&_tdist<500){e.hiding=false;const _ts=1.05;e.vx+=(_tdx/_tdist*_ts-e.vx)*0.042;e.vy+=(_tdy/_tdist*_ts-e.vy)*0.042;}
  else{e.vx*=0.97;e.vy*=0.97;e.hiding=false;}
  e.x+=e.vx;e.y+=e.vy;
  if(e.y<TILE){e.y=TILE;e.vy=Math.abs(e.vy);}
  if(e.y+e.h>H-TILE){e.y=H-TILE-e.h;e.vy=-Math.abs(e.vy);}
  if(e.x<0)e.x=0;if(e.x+e.w>LW)e.x=LW-e.w;
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
    if(G.starTimer>0){e.alive=false;G.score+=500;sfx('stomp');updateHUD();spawnParticle(e.x+e.w/2,e.y+e.h/2,'star');spawnScorePopup(e.x+e.w/2,e.y-8,500,'#FFD700');}
    else if(!e.hiding&&mario.inv===0)killMario();}
  continue;}
// === ドッスン（Thwomp）===
if(e.type==='thwomp'){
  if(e.baseY===undefined)e.baseY=e.y;
  if(e.state==='idle'){e.y=e.baseY;e.vy=0;const _inX=mario.x+mario.w>e.x&&mario.x<e.x+e.w;if(_inX&&mario.y>e.y+e.h){e.state='fall';try{beep(220,.06,'square',.15)}catch(ex){}}}
  else if(e.state==='fall'){e.vy=Math.min(e.vy+2.5,22);e.y+=e.vy;let _landed=false;for(const p of platforms){const py=p.y-(p.bounceOffset||0);if(overlap(e.x+2,e.y,e.w-4,e.h,p.x,py,p.w,p.h)&&e.y+e.h/2<py+p.h/2){e.y=py-e.h;e.vy=0;_landed=true;break;}}if(!_landed&&e.y+e.h>=H-TILE){e.y=H-TILE-e.h;e.vy=0;_landed=true;}if(_landed){e.state='wait';e.waitTimer=55;G.shakeX=6;G.shakeY=6;try{beep(80,.25,'sawtooth',.22);beep(60,.3,'sawtooth',.18,.1)}catch(ex){}}}
  else if(e.state==='wait'){e.waitTimer--;if(e.waitTimer<=0)e.state='rise';}
  else if(e.state==='rise'){e.y=Math.max(e.baseY,e.y-1.5);if(e.y<=e.baseY){e.y=e.baseY;e.state='idle';}}
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.alive=false;G.score+=500;sfx('stomp');updateHUD();spawnParticle(e.x+e.w/2,e.y+e.h/2,'star');spawnScorePopup(e.x+e.w/2,e.y-8,500,'#FFD700');}else if(mario.inv===0)killMario();}
  continue;}
if(e.type==='cheepH'){e.x+=e.vx;if(e.x+e.w<G.cam-100){e.x=G.cam+W+60+Math.random()*80;e.y=TILE*2+Math.floor(Math.random()*((H-3*TILE-TILE*2-e.h)/TILE))*TILE;}if(G.starTimer>0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){e.state='dead';e.squishT=20;G.score+=200;sfx('stomp');updateHUD();spawnParticle(e.x+12,e.y+10,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700')}else if(!mario.dead&&mario.inv===0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h))killMario();continue;}
if(e.type==='cheepV'){e.phase=(e.phase||0)+0.04;e.y=e.baseY+Math.sin(e.phase)*(e.range||60);if(G.starTimer>0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){e.state='dead';e.squishT=20;G.score+=200;sfx('stomp');updateHUD();spawnParticle(e.x+12,e.y+10,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700')}else if(!mario.dead&&mario.inv===0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h))killMario();continue;}
// === ゲッソー（Blooper）===
if(e.type==='blooper'){if(e.phaseTimer===undefined){e.phaseDir=0;e.phaseTimer=0;}e.phaseTimer++;if(e.phaseTimer>50){e.phaseDir=1-e.phaseDir;e.phaseTimer=0;}const _bx=mario.x+mario.w/2-(e.x+e.w/2),_by=mario.y+mario.h/2-(e.y+e.h/2),_bd=Math.sqrt(_bx*_bx+_by*_by)||1;const _bs=e.phaseDir===0?1.3:0.6;if(e.phaseDir===0){e.vx=(_bx/_bd)*_bs;e.vy=(_by/_bd)*_bs;}else{e.vx=(-_bx/_bd)*0.3;e.vy=-0.9;}e.x+=e.vx;e.y+=e.vy;if(e.y<TILE*2)e.y=TILE*2;if(e.y+e.h>H-TILE)e.y=H-TILE-e.h;if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.state='dead';e.squishT=20;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+12,e.y+12,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');}else if(mario.inv===0)killMario();}continue;}
// === おこりんぼ太陽（Angry Sun）===
if(e.type==='angrySun'){if(e.baseX===undefined){e.baseX=e.x;e.baseY=e.y;e.orbitAngle=0;e.swoopTimer=120+Math.floor(Math.random()*80);}if(e.state==='orbit'||!e.state){e.state='orbit';e.orbitAngle+=0.018;e.x=e.baseX+Math.cos(e.orbitAngle)*30;e.y=e.baseY+Math.sin(e.orbitAngle)*12;e.swoopTimer--;if(e.swoopTimer<=0&&Math.abs(mario.x+mario.w/2-e.x)<500){e.state='fall';e.vy=0;e.vx=0;e.fallTimer=0;}}else if(e.state==='fall'){e.vy=Math.min(e.vy+0.08,2.5);const _fdx=(mario.x+mario.w/2)-(e.x+e.w/2);e.vx+=_fdx*0.003;e.vx=Math.max(-1.5,Math.min(1.5,e.vx));e.x+=e.vx;e.y+=e.vy;e.fallTimer++;if(e.y>H-TILE*3||e.fallTimer>160){e.state='return';e.returnStartX=e.x;e.returnStartY=e.y;e.returnT=0;}}else if(e.state==='return'){e.returnT+=0.012;const _rt=Math.min(e.returnT,1.0);const _p1x=(e.returnStartX+e.baseX)/2;const _p1y=-TILE*4;const _t1=1-_rt;e.x=_t1*_t1*e.returnStartX+2*_t1*_rt*_p1x+_rt*_rt*e.baseX;e.y=_t1*_t1*e.returnStartY+2*_t1*_rt*_p1y+_rt*_rt*e.baseY;if(_rt>=1){e.x=e.baseX;e.y=e.baseY;e.vx=0;e.vy=0;e.state='orbit';e.swoopTimer=100+Math.floor(Math.random()*80);}}if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.state='dead';e.squishT=20;G.score+=1000;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,1000,'#FFD700');}else if(mario.inv===0)killMario();}continue;}
// === カロン（Dry Bones）===
if(e.type==='dryBones'){if(G.starTimer>0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){e.alive=false;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');continue;}if(e.state==='collapsed'){e.collapseTimer=(e.collapseTimer||180)-1;if(e.collapseTimer<=0){e.state='walk';e.vx=-1.2;}continue;}e.x+=e.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}if(e.y>H+100){e.alive=false;continue;}if(e.onGround){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;if(!platforms.some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h))e.vx=-e.vx;}if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){const _mBot=mario.y+mario.h;if(_mBot-mario.vy<=e.y+e.h*0.4){mario.vy=-9;sfx('stomp');spawnParticle(e.x+16,e.y+16,'dust');e.state='collapsed';e.collapseTimer=180;e.vx=0;G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;G.score+=100;updateHUD();spawnScorePopup(e.x+8,e.y-8,100,'#e8e8d0');}else if(mario.inv===0)killMario();}continue;}
// === チャージングチャック（Chargin' Chuck）===
if(e.type==='chuck'){if(e.hp===undefined)e.hp=3;if(e.state==='stun'){e.stunTimer--;if(e.stunTimer<=0){e.state='idle';e.vx=e.facing*1.5;}e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}if(e.y>H+100){e.alive=false;continue;}if(!mario.dead&&mario.inv===0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.state='dead';e.squishT=20;e.vx=0;G.score+=500;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,500,'#FFD700');}else killMario();}continue;}if(e.state==='idle'){if(Math.abs(e.vx)<0.1)e.vx=e.facing*1.5;if(e.onGround&&Math.abs(mario.y+mario.h-(e.y+e.h))<48&&Math.abs(mario.x-e.x)<420){e.state='charge';e.facing=mario.x>e.x?1:-1;e.vx=e.facing*4.5;}}else if(e.state==='charge')e.vx=e.facing*4.5;e.x+=e.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}if(e.y>H+100){e.alive=false;continue;}if(e.onGround){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;if(!platforms.some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=-e.facing;if(e.state==='charge')e.state='idle';}}if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.state='dead';e.squishT=20;e.vx=0;G.score+=500;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,500,'#FFD700');continue;}const _mBot=mario.y+mario.h;if(_mBot-mario.vy<=e.y+e.h*0.35){e.hp--;mario.vy=-9;sfx('stomp');spawnParticle(e.x+16,e.y+16,'dust');G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;if(e.hp<=0){e.state='dead';e.squishT=28;e.vx=0;G.score+=500;G.stageKills++;G.totalKills++;updateHUD();spawnScorePopup(e.x+8,e.y-8,500,'#e74c3c');}else{e.state='stun';e.stunTimer=60;e.vx=0;G.score+=200;updateHUD();spawnScorePopup(e.x+8,e.y-8,200,'#e74c3c');}}else if(mario.inv===0)killMario();}continue;}
// === ボム兵（Bob-omb）===
if(e.type==='bobomb'){
  if(e.state==='lit'){
    e.litTimer--;
    if(e.litTimer<=0){
      const cx=e.x+e.w/2,cy=e.y+e.h/2,r=TILE*2.5;
      G.shakeX=8;G.shakeY=8;
      for(let _ei=0;_ei<20;_ei++)spawnParticle(cx+(Math.random()-0.5)*48,cy+(Math.random()-0.5)*48,'star');
      try{beep(80,.3,'sawtooth',.3);beep(50,.4,'sawtooth',.2,.1);}catch(_ex){}
      for(const o of enemies){if(!o.alive||o===e||o.state==='dead')continue;
        const _od=Math.hypot(o.x+o.w/2-cx,o.y+o.h/2-cy);
        if(_od<r){if(o.type==='thwomp'||o.type==='teresa'||o.type==='bowser'){continue;}o.state='dead';o.squishT=20;o.vx=0;G.score+=100;G.stageKills++;G.totalKills++;sfx('stomp');spawnScorePopup(o.x+8,o.y-8,100,'#ff8844');}
      }
      for(let _pi=platforms.length-1;_pi>=0;_pi--){const p=platforms[_pi];if(p.type!=='brick'||p.hit)continue;
        const _pd=Math.hypot(p.x+p.w/2-cx,p.y+p.h/2-cy);
        if(_pd<r){spawnParticle(p.x+16,p.y+16,'brick');platforms.splice(_pi,1);G.score+=50;}
      }
      const _mdx=mario.x+mario.w/2-cx,_mdy=mario.y+mario.h/2-cy;
      if(Math.hypot(_mdx,_mdy)<r&&mario.inv===0&&G.starTimer===0&&!mario.dead)killMario();
      e.alive=false;continue;
    }
  }
  e.x+=e.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}
  e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}
  // gap落下時、lit中なら強制爆発
  if(e.y>H+50&&e.state==='lit'){e.litTimer=0;}
  if(e.y>H+100){e.alive=false;continue;}
  if(e.onGround){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
    const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;
    if(!platforms.some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=e.vx>0?1:-1;}
  }
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
    if(G.starTimer>0){e.state='dead';e.squishT=20;e.vx=0;G.score+=300;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,300,'#FFD700');continue;}
    const _mBot=mario.y+mario.h;
    if(_mBot-mario.vy<=e.y+e.h*0.4){
      mario.vy=-9;sfx('stomp');spawnParticle(e.x+16,e.y+16,'dust');G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;
      if(e.state==='walk'){e.state='lit';e.litTimer=180;e.vx*=0.6;G.score+=100;spawnScorePopup(e.x+8,e.y-8,100,'#ff4400');}
    } else if(mario.inv===0)killMario();
  }
  continue;
}
// === トゲゾー（Spiny）===
if(e.type==='spiny'){
  e.x+=e.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}
  e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}
  if(e.y>H+100){e.alive=false;continue;}
  if(e.onGround){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
    const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;
    if(!platforms.some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=e.vx>0?1:-1;}
  }
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
    if(G.starTimer>0){e.state='dead';e.squishT=20;G.score+=300;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,300,'#FFD700');}
    else if(mario.inv===0)killMario();
  }
  continue;
}
// === ポケッキー（Pokey・多段サボテン）===
if(e.type==='pokey'){
  if(e.segments===undefined)e.segments=3;
  e.x+=e.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}
  e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}
  if(e.y>H+100){e.alive=false;continue;}
  if(e.onGround){e.walkTimer++;if(e.walkTimer>10){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
    const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;
    if(!platforms.some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=e.vx>0?1:-1;}
  }
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
    if(G.starTimer>0){e.alive=false;G.score+=500;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,500,'#FFD700');continue;}
    const _mBot=mario.y+mario.h;
    if(_mBot-mario.vy<=e.y+TILE*0.9){
      mario.vy=-9;sfx('stomp');G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;
      e.segments--;
      if(e.segments<=0){e.alive=false;G.score+=300;G.stageKills++;G.totalKills++;spawnParticle(e.x+16,e.y+16,'dust');spawnScorePopup(e.x+8,e.y-8,300,'#e74c3c');updateHUD();}
      else{e.y+=TILE;e.h=Math.max(TILE,e.h-TILE);G.score+=100;spawnParticle(e.x+16,e.y,'dust');spawnScorePopup(e.x+8,e.y-8,100,'#e74c3c');updateHUD();}
    } else if(mario.inv===0)killMario();
  }
  continue;
}
// === ファジー（Fuzzy・レール移動）===
if(e.type==='fuzzy'){
  if(e.t===undefined)e.t=e.phase||0;
  e.t+=e.speed||0.010;
  const _k=0.5-Math.cos(e.t*Math.PI*2)*0.5;
  e.x=e.railX1+(e.railX2-e.railX1)*_k;
  e.y=e.railY1+(e.railY2-e.railY1)*_k;
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
    if(G.starTimer>0){e.alive=false;G.score+=400;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,400,'#FFD700');}
    else if(mario.inv===0)killMario();
  }
  continue;
}
// === モンテ（Monty Mole・地面突撃）===
if(e.type==='montyMole'){
  if(e.state==='hidden'){
    if(!mario.dead&&Math.abs(mario.x+mario.w/2-(e.x+e.w/2))<240){e.state='emerge';e.emergeT=30;try{beep(120,.08,'square',.15)}catch(_ex){}}
  } else if(e.state==='emerge'){
    e.emergeT--;
    if(e.emergeT<=0){
      // マリオと重なっていたら walk 切替をキャンセルし hidden に戻す（理不尽ダメージ回避）
      if(overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){e.state='hidden';}
      else{e.state='walk';e.facing=mario.x<e.x?-1:1;e.vx=e.facing*2.8;e.vy=-6;}
    }
  } else if(e.state==='walk'){
    e.x+=e.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}
    e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}
    if(e.y>H+100){e.alive=false;continue;}
    if(e.onGround){e.walkTimer++;if(e.walkTimer>6){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
      const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;
      if(!platforms.some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=e.vx>0?1:-1;}
    }
  }
  if(!mario.dead&&e.state==='walk'&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
    if(G.starTimer>0){e.state='dead';e.squishT=20;e.vx=0;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');continue;}
    const _mBot=mario.y+mario.h;
    if(_mBot-mario.vy<=e.y+e.h*0.4){
      mario.vy=-9;sfx('stomp');G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;
      e.state='dead';e.squishT=28;e.vx=0;G.score+=200;G.stageKills++;G.totalKills++;updateHUD();spawnParticle(e.x+16,e.y+16,'dust');spawnScorePopup(e.x+8,e.y-8,200,'#e74c3c');
    } else if(mario.inv===0)killMario();
  }
  continue;
}
// === スパイクトップ（Spike Top・天井這い）===
if(e.type==='spikeTop'){
  if(e.baseX===undefined){e.baseX=e.x;e.range=e.range||100;}
  e.x+=e.vx;
  if(e.x<=e.baseX-e.range){e.x=e.baseX-e.range;e.vx=Math.abs(e.vx);e.facing=1;}
  else if(e.x>=e.baseX+e.range){e.x=e.baseX+e.range;e.vx=-Math.abs(e.vx);e.facing=-1;}
  e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
    if(G.starTimer>0){e.alive=false;G.score+=400;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,400,'#FFD700');}
    else if(mario.inv===0)killMario();
  }
  continue;
}
if(e.type==='firePlant'){if(e.frozen)continue;if(e.fireTimer===undefined)e.fireTimer=120;e.fireTimer--;if(e.fireTimer<=0&&Math.abs(mario.x-e.x)<500){e.fireTimer=80+Math.floor(Math.random()*60);const _fpd=mario.x<e.x?-1:1;enemies.push({x:e.x+(_fpd>0?e.w:0),y:e.y+e.h/2-6,w:14,h:14,vx:_fpd*3.5,vy:0,type:'plantFire',alive:true,activated:true});try{beep(200,.06,'sawtooth',.12);beep(280,.08,'sawtooth',.1,.06)}catch(_ex){}}if(G.starTimer>0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){e.state='dead';e.squishT=20;G.score+=300;sfx('stomp');updateHUD();spawnParticle(e.x+12,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,300,'#FFD700')}else if(!mario.dead&&mario.inv===0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h))killMario();continue;}
if(e.type==='plantFire'){e.x+=e.vx;e.vy+=(G.waterMode?0:0.2);e.y+=e.vy;if(e.x<G.cam-120||e.x>G.cam+W+120||e.y<-60||e.y>H+60){e.alive=false;continue}if(!mario.dead&&mario.inv===0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.alive=false}else killMario();e.alive=false;}continue;}
// === shyGuy variant='blue': 一定距離歩き → 停止 → 再歩行 ===
if(e.type==='shyGuy'&&e.variant==='blue'){
  if(e.moveTimer===undefined)e.moveTimer=120;
  e.moveTimer--;
  if(e.moveTimer<=0){
    if(e._savedVx!==undefined){e.vx=e._savedVx;e._savedVx=undefined;e.moveTimer=100+Math.floor(Math.random()*60);}
    else{e._savedVx=(e.vx!==0?e.vx:(e.facing===1?1.3:-1.3));e.vx=0;e.moveTimer=50+Math.floor(Math.random()*30);}
  }
}
e.x+=e.vx;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p)}
e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of[...platforms,...pipes]){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null)}
if(e.y>H+100){e.alive=false;continue}
if(e.onGround&&e.state==='walk'){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2}}
if((e.type==='buzzy'||e.type==='penguin'||e.type==='shyGuy'||e.type==='rex')&&e.onGround&&e.state==='walk'){const _ax=e.vx>0?e.x+e.w+2:e.x-2;const _ay=e.y+e.h+2;if(!platforms.some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;if(e.type==='penguin'||e.type==='shyGuy'||e.type==='rex')e.facing=e.vx>0?1:-1;}}
if(e.state==='shell'&&Math.abs(e.vx)>1){for(const o of enemies){if(o===e||!o.alive||o.state==='dead')continue;if(overlap(e.x,e.y,e.w,e.h,o.x,o.y,o.w,o.h)){o.state='dead';o.squishT=20;G.score+=200;sfx('stomp');updateHUD();spawnScorePopup(o.x+8,o.y-8,200,'#e74c3c')}}}
if(e.frozen)continue; // 凍結敵は通常衝突スキップ（専用処理で対応）
if(overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
if(G.starTimer>0){e.state='dead';e.squishT=20;G.score+=200;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');continue}
if(e.type==='cheepH'||e.type==='cheepV'||e.type==='firePlant'){if(mario.inv===0)killMario();continue}
const mBot=mario.y+mario.h;if(mBot-mario.vy<=e.y+e.h*0.4){G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;const cs=G.combo<=1?200:G.combo===2?400:G.combo===3?800:G.combo===4?1600:0;if(G.combo>=5){G.lives++;sfx('1up');spawnScorePopup(e.x+8,e.y-8,'1UP!','#2ecc71')}else{G.score+=cs;spawnScorePopup(e.x+8,e.y-8,cs,'#e74c3c')}
mario.vy=-9;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'dust');
if(e.type==='goomba'||e.type==='hammerBro'||e.type==='cactus'||e.type==='penguin'||e.type==='shyGuy'){e.state='dead';e.squishT=28;G.stageKills++;G.totalKills++;}
else if(e.type==='rex'){if(!e.rexHurt){e.rexHurt=true;e.h=TILE*0.5;e.y+=TILE*0.5;e.vx=(e.vx>=0?1:-1)*Math.max(Math.abs(e.vx)*1.8,2.2);mario.inv=30;}else{e.state='dead';e.squishT=28;G.stageKills++;G.totalKills++;}}
else if(e.type==='koopa'||e.type==='buzzy'){if(e.state==='walk'){e.state='shell';e.vx=0;e.h=TILE*0.7;e.shellTimer=300}else if(e.state==='shell'&&Math.abs(e.vx)<0.5)e.vx=mario.facing*8;else{e.vx=0;e.shellTimer=300}}}
else if(e.state==='shell'&&Math.abs(e.vx)<0.5){e.vx=mario.facing*8;sfx('stomp');mario.inv=10}else if(mario.inv===0)killMario()}
if(e.state==='shell'){e.shellTimer--;if(e.shellTimer<=0){e.state='walk';e.vx=e.type==='buzzy'?-1.6:-1.3;e.h=e.type==='koopa'?TILE*1.2:e.type==='buzzy'?TILE*0.85:TILE}}}
// Piranhas
for(const pr of piranhas){if(!pr.alive)continue;const t=G.frame*0.03+pr.phase;
pr.y=pr.ceiling?pr.baseY+Math.max(0,Math.sin(t))*pr.maxUp:pr.baseY-Math.max(0,Math.sin(t))*pr.maxUp;
if(overlap(mario.x,mario.y,mario.w,mario.h,pr.x,pr.y,pr.w,pr.h)){if(G.starTimer>0){pr.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(pr.x+8,pr.y,'star');spawnScorePopup(pr.x+8,pr.y-8,200,'#FFD700')}else if(mario.inv===0)killMario();}
for(const fb of fireballs){if(!fb.alive)continue;if(overlap(fb.x,fb.y,fb.w,fb.h,pr.x,pr.y,pr.w,pr.h)){pr.alive=false;fb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(pr.x+8,pr.y,'star');spawnScorePopup(pr.x+8,pr.y-8,200,'#27ae60')}}
for(const ib of iceBalls){if(!ib.alive)continue;if(overlap(ib.x,ib.y,ib.w,ib.h,pr.x,pr.y,pr.w,pr.h)){pr.alive=false;ib.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(pr.x+8,pr.y,'star');spawnScorePopup(pr.x+8,pr.y-8,200,'#44bbff')}}
for(const mh of marioHammers){if(!mh.alive)continue;if(overlap(mh.x,mh.y,mh.w,mh.h,pr.x,pr.y,pr.w,pr.h)){pr.alive=false;mh.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(pr.x+8,pr.y,'star');spawnScorePopup(pr.x+8,pr.y-8,200,'#888')}}}
// Bowser boss
if(bowser.alive){
if(bowser.state==='offscreen'){const _bs=BOWSER_STATS[G.currentWorld]||BOWSER_STATS[1];if(mario.x>G.bowserArenaX&&mario.onGround&&mario.y+mario.h>=H-TILE*2){bowser.state='walk';if(G.stairSealX){for(let sy=H-15*TILE;sy<=H-12*TILE;sy+=TILE)platforms.push({x:G.stairSealX,y:sy,w:TILE,h:TILE,type:'ground',bounceOffset:0});G.stairSealX=null;}bowser.x=G.cam+W+150;bowser.vx=-_bs.speed;try{beep(120,.4,'sawtooth',.3);beep(80,.5,'sawtooth',.25,.15)}catch(ex){}}}
else if(bowser.state!=='dead'){
const _bs=BOWSER_STATS[G.currentWorld]||BOWSER_STATS[1];
const _p2=bowser.phase===2;
const _spd=_p2?_bs.speed*1.3:_bs.speed;
if(bowser.hurtTimer>0)bowser.hurtTimer--;
if(bowser.phaseTransition>0){bowser.phaseTransition--;if(bowser.phaseTransition%4===0)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');}
const _wasOnGround=bowser.onGround;
bowser.vy+=GRAVITY;bowser.x+=bowser.vx;bowser.y+=bowser.vy;
bowser.onGround=false;
for(const p of platforms){const py=p.y-(p.bounceOffset||0);if(overlap(bowser.x,bowser.y,bowser.w,bowser.h,p.x,py,p.w,p.h)&&bowser.vy>=0&&bowser.y+bowser.h/2<py+p.h/2){bowser.y=py-bowser.h;bowser.vy=0;bowser.onGround=true;break}}
if(bowser.y>H+50){bowser.y=H-TILE-bowser.h;bowser.vy=0;bowser.onGround=true}
if(G.ugMode&&G.currentWorld===8&&G.currentLevel===3&&bowser.y<H-6*TILE){bowser.y=H-6*TILE;if(bowser.vy<0)bowser.vy=0;}
if(bowser.x<G.bowserLeftX){bowser.x=G.bowserLeftX;bowser.vx=_spd}
const _bRx=G.bowserRightX||7750;if(bowser.x+bowser.w>_bRx){bowser.x=_bRx-bowser.w;bowser.vx=-_spd}
bowser.facing=bowser.vx>=0?1:-1;
// Phase2 着地衝撃波
if(_p2&&!_wasOnGround&&bowser.onGround){
  G.shakeX=6;G.shakeY=6;
  const swY=bowser.y+bowser.h-16;
  bowserShockwaves.push({x:bowser.x+bowser.w/2,y:swY,vx:-6,w:28,h:16,alive:true,timer:90});
  bowserShockwaves.push({x:bowser.x+bowser.w/2,y:swY,vx:6, w:28,h:16,alive:true,timer:90});
  try{beep(60,.25,'sawtooth',.2);beep(40,.3,'sawtooth',.15,.1);}catch(ex){}
}
const _jt=_p2?Math.floor(_bs.jumpTimer*0.6):_bs.jumpTimer;
bowser.jumpTimer--;if(bowser.jumpTimer<=0&&bowser.onGround){bowser.vy=_p2?-14:-12;bowser.onGround=false;bowser.jumpTimer=_jt+Math.floor(Math.random()*(_p2?40:80))}
const _ft=_p2?Math.floor(_bs.fireTimer*0.7):_bs.fireTimer;
bowser.fireTimer--;if(bowser.fireTimer<=0){bowser.fireTimer=_ft+Math.floor(Math.random()*(_p2?30:50));
  const dir=mario.x<bowser.x+bowser.w/2?-1:1;const bfx=bowser.x+(dir>0?bowser.w:0),bfy=bowser.y+24;
  const _nf=_p2?5:3;
  for(let bi=0;bi<_nf;bi++){
    const _vyMul=_p2?[1, 0.6, 1.4, 0.3, 1.7][bi]:1;
    bowserFire.push({x:bfx,y:bfy,w:18,h:18,vx:dir*(_bs.fireSpeed+bi*0.4),vy:_bs.fireVy*_vyMul,bounces:0,alive:true,delay:bi*8,armed:bi===0});
  }
  try{beep(180,.12,'sawtooth',.18);beep(140,.1,'sawtooth',.12,.06);}catch(ex){}}
if(mario.inv===0&&G.starTimer===0&&overlap(mario.x,mario.y,mario.w,mario.h,bowser.x,bowser.y,bowser.w,bowser.h)){
const mBot=mario.y+mario.h;
if(mBot-mario.vy<=bowser.y+bowser.h*0.35&&bowser.hurtTimer===0){const _hipDmg=mario.hipDrop?2:1;bowser.hurtTimer=60;bowser.hp-=_hipDmg;mario.vy=-11;mario.inv=60;mario.hipDrop=false;sfx('stomp');if(_hipDmg>1){G.shakeX=8;G.shakeY=8;spawnScorePopup(bowser.x+32,bowser.y-8,1000,'#ff4400');}else{spawnScorePopup(bowser.x+32,bowser.y-8,500,'#e74c3c');}
  // Phase2遷移チェック
  if(bowser.hp>0&&bowser.phase===1&&bowser.hp<=Math.floor(bowser.maxHp/2)){bowser.phase=2;bowser.phaseTransition=90;G.shakeX=14;G.shakeY=14;for(let pi=0;pi<30;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');try{beep(90,.5,'sawtooth',.35);beep(55,.6,'sawtooth',.3,.15);beep(35,.7,'sawtooth',.25,.3);}catch(ex){}try{stopBGM();startBGM();}catch(ex){}}
  if(bowser.hp<=0){bowser.state='dead';bowser.deadTimer=160;stopBGM();G.score+=5000;updateHUD();G.coins=Math.min(G.coins+200,999);updateHUD();{const _bx=bowser.x+bowser.w/2,_by=bowser.y+bowser.h/2;for(let _i=0;_i<200;_i++){const _a=-Math.PI*0.95+(_i/199*Math.PI*0.9);const _spd=4+Math.random()*8;coinItems.push({x:_bx-8,y:_by-8,vx:Math.cos(_a)*_spd,vy:Math.sin(_a)*_spd,type:'frozendrop',timer:300,gravity:0.35,w:16,h:16,collected:false,noCollect:true})}}for(let pi=0;pi<20;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star')}}
else killMario()}
for(let i=fireballs.length-1;i>=0;i--){const fb=fireballs[i];if(!fb.alive)continue;if(bowser.hurtTimer===0&&overlap(fb.x,fb.y,fb.w,fb.h,bowser.x,bowser.y,bowser.w,bowser.h)){if(bowser.fireImmune){fb.alive=false;spawnParticle(fb.x,fb.y,'dust');continue}fb.alive=false;bowser.hurtTimer=70;bowser.hp--;sfx('stomp');spawnScorePopup(bowser.x+32,bowser.y-8,500,'#ff9944');spawnParticle(bowser.x+32,bowser.y+20,'star');
  // Phase2遷移チェック（ファイアボールダメージ時）
  if(bowser.hp>0&&bowser.phase===1&&bowser.hp<=Math.floor(bowser.maxHp/2)){bowser.phase=2;bowser.phaseTransition=90;G.shakeX=14;G.shakeY=14;for(let pi=0;pi<30;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');try{beep(90,.5,'sawtooth',.35);beep(55,.6,'sawtooth',.3,.15);beep(35,.7,'sawtooth',.25,.3);}catch(ex){}try{stopBGM();startBGM();}catch(ex){}}
  if(bowser.hp<=0){bowser.state='dead';bowser.deadTimer=160;stopBGM();G.score+=5000;updateHUD();G.coins=Math.min(G.coins+200,999);updateHUD();{const _bx=bowser.x+bowser.w/2,_by=bowser.y+bowser.h/2;for(let _i=0;_i<200;_i++){const _a=-Math.PI*0.95+(_i/199*Math.PI*0.9);const _spd=4+Math.random()*8;coinItems.push({x:_bx-8,y:_by-8,vx:Math.cos(_a)*_spd,vy:Math.sin(_a)*_spd,type:'frozendrop',timer:300,gravity:0.35,w:16,h:16,collected:false,noCollect:true})}}for(let pi=0;pi<20;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star')}}}
}else{
bowser.deadTimer--;if(G.frame%4===0)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');
if(bowser.deadTimer<=0){bowser.alive=false;bowserShockwaves.length=0;peach.alive=true;peach.x=bowser.x+bowser.w+40;peach.y=H-TILE-peach.h;peach.vx=-2.5;peach.caught=false;peach.walkFrame=0;peach.walkTimer=0;G.peachChase={t:0};}
}
}
// Bowser shockwaves
for(let i=bowserShockwaves.length-1;i>=0;i--){const sw=bowserShockwaves[i];if(!sw.alive){bowserShockwaves.splice(i,1);continue}
sw.x+=sw.vx;sw.timer--;if(sw.timer<=0||sw.x<G.cam-100||sw.x>G.cam+W+100){sw.alive=false;continue}
if(mario.inv===0&&G.starTimer===0&&overlap(mario.x,mario.y,mario.w,mario.h,sw.x-sw.w/2,sw.y,sw.w,sw.h)){killMario()}}
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
if(G.peachChase.catchT>120){G.peachChase=null;peach.alive=false;G.score+=1000+G.timeLeft*50;clearInterval(G.timerTick);updateHUD();const _ns=getNextStage(G.currentWorld,G.currentLevel);if(_ns){G.nextStage=_ns;G.state='shop';G.shopCursor=0;G.shopBought={};G.shopConfirm=null;try{startBGM()}catch(ex){};}else{G.state='win';const _isFin=G.currentWorld===8&&G.currentLevel===3;const _wCnt=_isFin?80:30;for(let wi=0;wi<_wCnt;wi++)setTimeout(()=>spawnParticle(mario.x+Math.random()*(_isFin?400:200)-(_isFin?200:100),H-TILE-(_isFin?200:100)+Math.random()*(_isFin?160:80),'star'),wi*(_isFin?40:60));if(_isFin){try{playVictoryFanfare();}catch(ex){}}}}
}
}
// Lava flames
for(const f of lavaFlames){f.phase++;const cyc=f.phase%f.period,rise=Math.floor(f.period*0.28),stay=Math.floor(f.period*0.18);if(cyc<rise){f.curH=Math.min(f.maxH,(cyc/rise)*f.maxH*1.1)}else if(cyc<rise+stay){f.curH=f.maxH}else{f.curH=Math.max(0,f.curH-f.maxH/(rise*0.7))}if(f.curH>12){const ft=H-TILE-f.curH;if(mario.inv===0&&G.starTimer===0&&mario.x+mario.w>f.x-2&&mario.x<f.x+f.w+2&&mario.y+mario.h>ft&&mario.y<H-TILE)killMario()}}
if(G.ugMode&&G.state==='play'&&!G.peachChase&&!bowser.alive&&mario.x>W-1.5*TILE&&mario.onGround)exitUnderground();
if(G.checkpoint&&!G.checkpointReached&&mario.x>G.checkpoint.x){G.checkpointReached=true;G.checkpoint.reached=true;sfx('flag');spawnScorePopup(G.checkpoint.x,G.checkpoint.y-TILE*3,'CHECK!','#2ecc71');for(let i=0;i<10;i++)spawnParticle(G.checkpoint.x+8,G.checkpoint.y-TILE*2,'star')}
// クッパ前チェックポイント（2つ目）
if(G.checkpoint2&&!G.checkpoint2.reached&&mario.x>G.checkpoint2.x){G.checkpoint2.reached=true;G.checkpointReached=true;G.checkpoint.x=G.checkpoint2.x;G.checkpoint.y=G.checkpoint2.y;G.checkpoint.reached=true;sfx('flag');spawnScorePopup(G.checkpoint2.x,G.checkpoint2.y-TILE*3,'CHECK!','#ff4444');for(let i=0;i<10;i++)spawnParticle(G.checkpoint2.x+8,G.checkpoint2.y-TILE*2,'star')}
if(G.currentLevel!==3&&!G.ugMode&&!mario.dead&&mario.x+mario.w>=flagPole.x&&mario.x<=flagPole.x+96){sfx('flag');stopBGM();if(mario.y<=H-TILE-flagPole.h+24){G.coins=Math.min(1999,G.coins+10);updateHUD();sfx('coin');for(let _fi=0;_fi<10;_fi++){const _fa=(_fi/9)*Math.PI*2;coinItems.push({x:mario.x+13+Math.cos(_fa)*20,y:mario.y+16,collected:false,pop:true,popVy:-4-Math.random()*3,popY:0,life:35});}spawnScorePopup(mario.x+13,mario.y-20,'+10C','#FFD700');}G.goalSlide={phase:'slide',t:0};mario.vx=0;mario.vy=0}
// Fireballs
for(let i=fireballs.length-1;i>=0;i--){const fb=fireballs[i];if(!fb.alive){fireballs.splice(i,1);continue}
fb.vy+=(G.waterMode?0:0.55);fb.x+=fb.vx;fb.y+=fb.vy;
if(!G.waterMode)for(const p of[...platforms,...pipes]){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(fb.x,fb.y,fb.w,fb.h,p.x,py,p.w,p.h))continue;if(fb.y+fb.h/2<py+p.h/2){fb.y=py-fb.h;fb.vy=-8;fb.bounces++}else fb.alive=false;break}
if(fb.bounces>4||fb.x<G.cam-80||fb.x>G.cam+W+80||fb.y>H+50)fb.alive=false;
for(const e of enemies){if(!e.alive||e.state==='dead'||e.type==='miniBowser')continue;if(!overlap(fb.x,fb.y,fb.w,fb.h,e.x,e.y,e.w,e.h))continue;
if(e.type==='plantFire'){e.alive=false;fb.alive=false;G.score+=100;updateHUD();spawnParticle(e.x+7,e.y+7,'star');continue}
if(e.type==='cheepH'||e.type==='cheepV'||e.type==='firePlant'){e.state='dead';e.squishT=20;fb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(e.x+12,e.y+10,'star');spawnScorePopup(e.x+8,e.y-8,200,'#ff9944');coinItems.push({x:e.x+8,y:e.y+4,type:'firecoin',vx:(Math.random()-0.5)*2,vy:-4-Math.random()*2,gravity:0.35,timer:180,collected:false});continue}
if(e.type==='bobomb'){if(e.state==='walk'){e.state='lit';e.litTimer=120;}fb.alive=false;spawnParticle(e.x+16,e.y+16,'dust');continue;}
if(e.type==='buzzy'||e.type==='cactus'||e.type==='teresa'||e.type==='thwomp'||e.type==='dryBones'||e.type==='angrySun'||e.type==='spikeTop'||e.type==='spiny'||e.type==='fuzzy'){fb.alive=false;spawnParticle(e.x+16,e.y+16,'dust');continue}
e.state='dead';e.vx=0;e.squishT=28;fb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnScorePopup(e.x+8,e.y-8,200,'#ff9944');spawnParticle(e.x+16,e.y+16,'star');coinItems.push({x:e.x+8,y:e.y+4,type:'firecoin',vx:(Math.random()-0.5)*2,vy:-4-Math.random()*2,gravity:0.35,timer:180,collected:false})}}
// === Ice Balls ===
for(let i=iceBalls.length-1;i>=0;i--){const ib=iceBalls[i];if(!ib.alive){iceBalls.splice(i,1);continue}
ib.vy+=(G.waterMode?0:0.45);ib.x+=ib.vx;ib.y+=ib.vy;
if(!G.waterMode)for(const p of[...platforms,...pipes]){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(ib.x,ib.y,ib.w,ib.h,p.x,py,p.w,p.h))continue;if(ib.y+ib.h/2<py+p.h/2){ib.y=py-ib.h;ib.vy=-6;ib.bounces++}else ib.alive=false;break}
if(ib.bounces>5||ib.x<G.cam-80||ib.x>G.cam+W+80||ib.y>H+50)ib.alive=false;
for(const e of enemies){if(!e.alive||e.state==='dead'||e.type==='miniBowser')continue;if(!overlap(ib.x,ib.y,ib.w,ib.h,e.x,e.y,e.w,e.h))continue;
if(e.frozen){ib.alive=false;e.alive=false;e.frozen=false;e.shakeX=0;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnScorePopup(e.x+8,e.y-8,200,'#44bbff');spawnParticle(e.x+16,e.y+16,'star');coinItems.push({x:e.x+8,y:e.y+4,type:'firecoin',vx:(Math.random()-0.5)*2,vy:-4-Math.random()*2,gravity:0.35,timer:180,collected:false});break;}
if(e.type==='dryBones'||e.type==='angrySun'||e.type==='spikeTop'||e.type==='fuzzy'){ib.alive=false;spawnParticle(e.x+16,e.y+16,'dust');break;}
if(e.type==='blooper'){e.state='dead';e.squishT=20;ib.alive=false;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+12,e.y+12,'star');spawnScorePopup(e.x+8,e.y-8,200,'#44bbff');break;}
ib.alive=false;e.frozen=true;e.frozenTimer=240;e.frozenVx=e.vx;e.vx=0;G.score+=100;sfx('coin');updateHUD();spawnScorePopup(e.x+8,e.y-8,'ICE!','#44bbff');spawnParticle(e.x+16,e.y+16,'star');break}
// bowser ice hit
if(ib.alive&&bowser.alive&&bowser.state!=='dead'&&bowser.hurtTimer===0&&overlap(ib.x,ib.y,ib.w,ib.h,bowser.x,bowser.y,bowser.w,bowser.h)){
ib.alive=false;if(!bowser.fireImmune){bowser.hurtTimer=90;bowser.hp--;sfx('stomp');spawnScorePopup(bowser.x+32,bowser.y-8,500,'#44bbff');spawnParticle(bowser.x+32,bowser.y+20,'star');
if(bowser.hp>0&&bowser.phase===1&&bowser.hp<=Math.floor(bowser.maxHp/2)){bowser.phase=2;bowser.phaseTransition=90;G.shakeX=14;G.shakeY=14;for(let pi=0;pi<30;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');try{stopBGM();startBGM();}catch(ex){}}
if(bowser.hp<=0){bowser.state='dead';bowser.deadTimer=160;stopBGM();G.score+=5000;updateHUD();G.coins=Math.min(G.coins+200,999);updateHUD();{const _bx=bowser.x+bowser.w/2,_by=bowser.y+bowser.h/2;for(let _i=0;_i<200;_i++){const _a=-Math.PI*0.95+(_i/199*Math.PI*0.9);const _spd=4+Math.random()*8;coinItems.push({x:_bx-8,y:_by-8,vx:Math.cos(_a)*_spd,vy:Math.sin(_a)*_spd,type:'frozendrop',timer:300,gravity:0.35,w:16,h:16,collected:false,noCollect:true})}}for(let pi=0;pi<20;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star')}}else{spawnParticle(ib.x,ib.y,'dust')}}}
// === Mario Hammers ===
for(let i=marioHammers.length-1;i>=0;i--){const mh=marioHammers[i];if(!mh.alive){marioHammers.splice(i,1);continue}
mh.vy+=0.4;mh.x+=mh.vx;mh.y+=mh.vy;mh.rot+=0.25;
if(mh.y>H+50||mh.x<G.cam-80||mh.x>G.cam+W+80){mh.alive=false;continue}
// ハンマーでレンガ破壊
for(let pi=platforms.length-1;pi>=0;pi--){const p=platforms[pi];if(p.type!=='brick'||p.hit)continue;const bo=p.bounceOffset||0;if(overlap(mh.x,mh.y,mh.w,mh.h,p.x,p.y-bo,p.w,p.h)){mh.alive=false;sfx('break');G.score+=50;updateHUD();spawnParticle(p.x+16,p.y,'brick');platforms.splice(pi,1);break}}
if(!mh.alive)continue;
// ハンマーで全敵ダメージ（buzzy/teresa/thwomp含む）
for(const e of enemies){if(!e.alive||e.state==='dead'||e.type==='miniBowser')continue;if(!overlap(mh.x,mh.y,mh.w,mh.h,e.x,e.y,e.w,e.h))continue;
e.state='dead';e.vx=0;e.squishT=28;mh.alive=false;G.score+=300;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnScorePopup(e.x+8,e.y-8,300,'#aaa');spawnParticle(e.x+16,e.y+16,'star');break}
if(!mh.alive)continue;
// ハンマーでキャノン破壊（5回ヒットで破壊）
for(let ci=cannons.length-1;ci>=0;ci--){const cn=cannons[ci];if(cn.dead)continue;if(!overlap(mh.x,mh.y,mh.w,mh.h,cn.x,cn.y,cn.w,cn.h))continue;if(cn.hp===undefined)cn.hp=5;cn.hp--;mh.alive=false;if(cn.hp<=0){cn.dead=true;sfx('break');G.score+=500;G.stageKills++;G.totalKills++;updateHUD();for(let k=0;k<8;k++)spawnParticle(cn.x+Math.random()*cn.w,cn.y+Math.random()*cn.h,'brick');spawnScorePopup(cn.x+8,cn.y-8,500,'#aaa');G.shakeX=4;G.shakeY=4;}else{sfx('stomp');G.shakeX=2;G.shakeY=2;spawnParticle(cn.x+cn.w/2,cn.y+cn.h/2,'dust');spawnScorePopup(cn.x+8,cn.y-8,`★${cn.hp}`,'#ff8844');}break;}
if(!mh.alive)continue;
// ハンマーでクッパダメージ
if(bowser.alive&&bowser.state!=='dead'&&bowser.hurtTimer===0&&overlap(mh.x,mh.y,mh.w,mh.h,bowser.x,bowser.y,bowser.w,bowser.h)){
mh.alive=false;bowser.hurtTimer=70;bowser.hp--;sfx('stomp');spawnScorePopup(bowser.x+32,bowser.y-8,500,'#aaa');spawnParticle(bowser.x+32,bowser.y+20,'star');
if(bowser.hp>0&&bowser.phase===1&&bowser.hp<=Math.floor(bowser.maxHp/2)){bowser.phase=2;bowser.phaseTransition=90;G.shakeX=14;G.shakeY=14;for(let pi=0;pi<30;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');try{stopBGM();startBGM();}catch(ex){}}
if(bowser.hp<=0){bowser.state='dead';bowser.deadTimer=160;stopBGM();G.score+=5000;updateHUD();G.coins=Math.min(G.coins+200,999);updateHUD();{const _bx=bowser.x+bowser.w/2,_by=bowser.y+bowser.h/2;for(let _i=0;_i<200;_i++){const _a=-Math.PI*0.95+(_i/199*Math.PI*0.9);const _spd=4+Math.random()*8;coinItems.push({x:_bx-8,y:_by-8,vx:Math.cos(_a)*_spd,vy:Math.sin(_a)*_spd,type:'frozendrop',timer:300,gravity:0.35,w:16,h:16,collected:false,noCollect:true})}}for(let pi=0;pi<20;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star')}}}
// === Frozen enemies update ===
for(const e of enemies){if(!e.alive||!e.frozen)continue;e.frozenTimer--;if(e.frozenTimer<=0){e.frozen=false;e.vx=e.frozenVx||0;e.frozenVx=0;e.shakeX=0;}
// 溶ける前にブルブル震える
if(e.frozen&&e.frozenTimer>0&&e.frozenTimer<60){e.shakeX=(Math.random()-0.5)*4;}else if(e.frozen){e.shakeX=0;}
// 凍結敵との衝突（完全にダメージなし、上に乗れる）
if(e.frozen&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){const mBot=mario.y+mario.h;
if(mBot-mario.vy<=e.y+e.h*0.5&&mario.vy>=0){mario.y=e.y-mario.h;mario.vy=0;mario.onGround=true;}
else if(mario.vy<0){mario.y=e.y+e.h+1;mario.vy=0;}}
// 凍結敵を足場として使う
if(e.frozen&&mario.vy>=0&&!mario.onGround){const prevBot=mario.y-mario.vy+mario.h;if(prevBot<=e.y+4&&overlap(mario.x+2,mario.y,mario.w-4,mario.h,e.x,e.y,e.w,e.h)){mario.y=e.y-mario.h;mario.vy=0;mario.onGround=true;}}
// ↓キーで踏みつけ→コイン化
if(e.frozen&&mario.onGround&&!mario.dead&&mario.y+mario.h>=e.y-2&&mario.y+mario.h<=e.y+6&&mario.x+mario.w>e.x&&mario.x<e.x+e.w){const _isDown=keys['ArrowDown']||keys['KeyS']||btn.down||gpad.down;if(_isDown){e.alive=false;e.frozen=false;e.shakeX=0;mario.vy=-6;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnScorePopup(e.x+8,e.y-8,200,'#44bbff');spawnParticle(e.x+16,e.y+16,'star');coinItems.push({x:e.x+8,y:e.y+4,type:'firecoin',vx:(Math.random()-0.5)*2,vy:-4-Math.random()*2,gravity:0.35,timer:180,collected:false});}}}
// === Mega Timer ===
if(G.megaTimer>0){G.megaTimer--;if(G.frame%6===0)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');
// メガ状態: 敵に触れると即死
for(const e of enemies){if(!e.alive||e.state==='dead')continue;if(overlap(mario.x-8,mario.y-8,mario.w+16,mario.h+16,e.x,e.y,e.w,e.h)){e.state='dead';e.squishT=20;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');G.shakeX=3;G.shakeY=3;}}
// メガ状態: レンガ破壊
for(let pi=platforms.length-1;pi>=0;pi--){const p=platforms[pi];if(p.type!=='brick')continue;if(overlap(mario.x-4,mario.y-4,mario.w+8,mario.h+8,p.x,p.y-(p.bounceOffset||0),p.w,p.h)){sfx('break');G.score+=50;updateHUD();spawnParticle(p.x+16,p.y,'brick');platforms.splice(pi,1);G.shakeX=2;G.shakeY=2;}}
if(G.megaTimer<=0){mario.power=G.megaPrevPower;mario.big=G.megaPrevBig;mario.h=mario.big?48:32;sfx('power');}}
// === Wind Zones ===
for(const wz of windZones){if(overlap(mario.x,mario.y,mario.w,mario.h,wz.x,wz.y,wz.w,wz.h)){mario.vx+=wz.force*0.15;}
// 風パーティクル生成
if(G.frame%3===0&&wz.x<G.cam+W&&wz.x+wz.w>G.cam){const px=wz.x+Math.random()*wz.w;const py=wz.y+Math.random()*wz.h;windParticles.push({x:px,y:py,vx:wz.force*3,vy:0.5+Math.random(),life:1,size:1+Math.random()*2});}}
for(let i=windParticles.length-1;i>=0;i--){const wp=windParticles[i];wp.x+=wp.vx;wp.y+=wp.vy;wp.life-=0.02;if(wp.life<=0)windParticles.splice(i,1);}
// === Sandstorm ===
if(G.sandstormMode&&!mario.dead){const _sg=Math.sin(G.frame*0.01)*0.5+0.3;mario.vx+=_sg*0.04;}
// === Tide ===
if(G.tideMode){G.tideLevel=H-TILE+(Math.cos(G.frame*0.005)-1)*TILE*2;
if(!mario.dead&&mario.y+mario.h>G.tideLevel){if(mario.vy>0)mario.vy*=0.88;if(mario.vy>4)mario.vy=4;mario.vy-=0.08;}}
// === Gravity Zones ===
G.gravityFlipped=false;
for(const gz of gravityZones){if(overlap(mario.x,mario.y,mario.w,mario.h,gz.x,gz.y,gz.w,gz.h)){G.gravityFlipped=true;break;}}
// === Chasing Wall ===
if(G.chasingWall){const cw=G.chasingWall;if(!cw.active&&mario.x>cw.triggerX){cw.active=true;cw.x=G.cam;}
if(cw.active){cw.x+=cw.speed;if(G.frame%4===0)spawnParticle(cw.x+4,H*Math.random(),'star');
if(!mario.dead&&mario.x<cw.x)killMario(true);}}
}else{mario.vy+=GRAVITY;mario.y+=mario.vy}
updateParticles();
}

// ================================================================
// DRAWING - Enhanced Mario-style visuals
// ================================================================
function drawBG(){
// EX-2: 宇宙テーマ背景
if(G.isExStage&&G.exStageNum===2){
  const _sg=ctx.createLinearGradient(0,0,0,H);
  _sg.addColorStop(0,'#000010');_sg.addColorStop(0.5,'#050025');_sg.addColorStop(1,'#0a0050');
  ctx.fillStyle=_sg;ctx.fillRect(0,0,W,H);
  // 星雲（パープル・ピンク・青）
  ctx.globalAlpha=0.18;
  ctx.fillStyle='#9966ff';ctx.beginPath();ctx.arc(180,80,115,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ff66cc';ctx.beginPath();ctx.arc(580,140,88,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#6699ff';ctx.beginPath();ctx.arc(400,200,95,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  // 星（80個・パララックス）
  for(let _si=0;_si<80;_si++){
    const _sx=(((_si*137.5+G.cam*0.03)%W)+W)%W;
    const _sy=(_si*53.7)%H;
    const _sr=_si%5===0?2:_si%3===0?1.5:1;
    ctx.globalAlpha=0.55+(_si%4)*0.12;
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(_sx,_sy,_sr,0,Math.PI*2);ctx.fill();
  }
  // 大きい星のきらめき
  [80,210,450,620,740].forEach((_spx,_spi)=>{
    const _spy=55+_spi*36;
    const _spk=(G.frame*0.04+_spi*1.2)%(Math.PI*2);
    ctx.globalAlpha=0.45+Math.sin(_spk)*0.45;
    ctx.fillStyle='#ffffcc';ctx.beginPath();ctx.arc(((_spx-G.cam*0.02)+W*2)%W,_spy,2.5,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;
  // 惑星（2個・パララックス）
  const _pl1x=((680-G.cam*0.04)%W+W)%W;
  ctx.fillStyle='#4466aa';ctx.globalAlpha=0.72;ctx.beginPath();ctx.arc(_pl1x,85,36,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(100,140,210,0.28)';ctx.globalAlpha=1;ctx.beginPath();ctx.arc(_pl1x,85,46,0,Math.PI*2);ctx.fill();
  const _pl2x=((150-G.cam*0.02+W*4)%W+W)%W;
  ctx.fillStyle='#8866aa';ctx.globalAlpha=0.60;ctx.beginPath();ctx.arc(_pl2x,165,22,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  return;
}
if(G.ugMode&&G.pinoRoom){
  // ピノキオ部屋：明るい空テーマ
  const _pbg=ctx.createLinearGradient(0,0,0,H);
  _pbg.addColorStop(0,'#44aaff');_pbg.addColorStop(0.6,'#88ccff');_pbg.addColorStop(1,'#ccf0ff');
  ctx.fillStyle=_pbg;ctx.fillRect(0,0,W,H);
  // 雲
  ctx.fillStyle='rgba(255,255,255,0.9)';
  [[80,40,50],[200,25,40],[380,50,55],[520,30,45],[680,45,50]].forEach(([cx,cy,cr])=>{
    ctx.beginPath();ctx.arc(cx,cy+18,cr*0.6,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+cr*0.6,cy+10,cr*0.8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+cr*1.2,cy+18,cr*0.5,0,Math.PI*2);ctx.fill();
    ctx.fillRect(cx-cr*0.3,cy+14,cr*1.5+cr*0.4,cr*0.6);
  });
  return;
}
if(G.ugMode){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.fillStyle='#1a1a2e';for(let x=0;x<W;x+=TILE*3){ctx.fillRect(x,TILE,8,8);ctx.fillRect(x+16,TILE+16,8,8)}return}
// bgTheme ベース背景
{const _bgS=getStage(G.currentWorld,G.currentLevel);
if(_bgS?.bgTheme==='beach'){
  // 海辺：明るい青空 + ヤシの木 + 海面
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0077cc');bg.addColorStop(0.55,'#44aaee');bg.addColorStop(0.85,'#88ccff');bg.addColorStop(1,'#c0e8ff');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,160,0.45)';ctx.beginPath();ctx.arc(690,52,48,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fffde0';ctx.beginPath();ctx.arc(690,52,34,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffe866';ctx.beginPath();ctx.arc(690,52,24,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(0,120,200,0.16)';
  for(let wx=0;wx<W;wx+=44){const wy=H-TILE*1.1+Math.sin(wx*0.04+G.frame*0.04)*5;ctx.fillRect(wx,wy,38,5);}
  ctx.fillStyle='rgba(255,255,255,0.86)';
  [80,340,620,920,1250].forEach((cx,i)=>{const dx=cx-(G.cam%1500)*0.22;if(dx<-160||dx>W+160)return;const cy=22+(i%3)*24;ctx.beginPath();ctx.arc(dx+18,cy+18,14,0,Math.PI*2);ctx.arc(dx+38,cy+10,20,0,Math.PI*2);ctx.arc(dx+60,cy+18,14,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+5,cy+18,66,14);});
  ctx.fillStyle='#2a4a12';
  [200,680,1500,2800,4000,5500,6800].forEach((px,i)=>{const dx=px-(G.cam*0.18)%7500;if(dx<-90||dx>W+90)return;const ph=52+(i%2)*18;ctx.fillRect(dx+14,H-TILE-ph,7,ph);ctx.beginPath();ctx.moveTo(dx+17,H-TILE-ph);ctx.lineTo(dx-20,H-TILE-ph-16);ctx.lineTo(dx+10,H-TILE-ph-4);ctx.fill();ctx.beginPath();ctx.moveTo(dx+17,H-TILE-ph);ctx.lineTo(dx+54,H-TILE-ph-16);ctx.lineTo(dx+24,H-TILE-ph-4);ctx.fill();ctx.beginPath();ctx.moveTo(dx+17,H-TILE-ph);ctx.lineTo(dx+18,H-TILE-ph-26);ctx.lineTo(dx+22,H-TILE-ph-4);ctx.fill();});
  return;
}
if(_bgS?.bgTheme==='underwater'){
  const ug=ctx.createLinearGradient(0,0,0,H);
  ug.addColorStop(0,'#001a33');ug.addColorStop(0.5,'#002d5c');ug.addColorStop(1,'#004080');
  ctx.fillStyle=ug;ctx.fillRect(0,0,W,H);
  // 泡
  ctx.fillStyle='rgba(120,200,255,0.25)';
  for(let i=0;i<28;i++){const bx=(i*137+G.frame*0.18)%W,by=((i*53+G.frame*0.28*(1+i%3))%H);ctx.beginPath();ctx.arc(bx,by,1.5+i%3,0,Math.PI*2);ctx.fill();}
  // 海草
  [60,240,520,840,1300,2000,2700,3500,4400,5300,6200,7100].forEach((sx,i)=>{const dx=sx-(G.cam*0.25)%7800;if(dx<-50||dx>W+50)return;const sh=45+i%4*15;ctx.fillStyle='rgba(0,140,60,0.55)';for(let s=0;s<sh;s+=7){const sw=Math.sin(s*0.25+G.frame*0.025)*6;ctx.fillRect(dx+10+sw,H-TILE-s-7,7,7)}});
  // 光の筋
  ctx.fillStyle='rgba(80,160,255,0.05)';
  for(let r=0;r<5;r++){const rx=(r*180+G.cam*0.08)%W;ctx.beginPath();ctx.moveTo(rx,0);ctx.lineTo(rx-25,H);ctx.lineTo(rx+15,H);ctx.lineTo(rx+40,0);ctx.closePath();ctx.fill();}
  return;
}
if(_bgS?.bgTheme==='castle3'){
  // 海辺要塞：暗夜 + 溶岩光
  const cg3=ctx.createLinearGradient(0,0,0,H);
  cg3.addColorStop(0,'#020a0a');cg3.addColorStop(0.5,'#071218');cg3.addColorStop(1,'#10200a');
  ctx.fillStyle=cg3;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ff3300';ctx.globalAlpha=0.09+0.05*Math.abs(Math.sin(G.frame*0.025));ctx.fillRect(0,H-TILE*2,W,TILE*2);ctx.globalAlpha=1;
  const _c3x=G.cam*0.15;ctx.fillStyle='rgba(48,18,8,0.42)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-_c3x%64);for(let by2=0;by2<H-TILE*3;by2+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by2/32))%2===0)ctx.fillRect(ox-32,by2,62,30)}}
  return;
}
if(_bgS?.bgTheme==='mountain'){
  // 山脈：青白い空 + 雪山シルエット
  const mg=ctx.createLinearGradient(0,0,0,H);
  mg.addColorStop(0,'#a8d8f0');mg.addColorStop(0.5,'#cce8ff');mg.addColorStop(1,'#e8f4ff');
  ctx.fillStyle=mg;ctx.fillRect(0,0,W,H);
  // 遠景の山（白い雪山・パララックス弱め）
  ctx.fillStyle='#e8eef4';
  [0,500,1100,1800,2600,3500,4500,5600,6700].forEach((mx,i)=>{const dx=mx-G.cam*0.05;if(dx<-400||dx>W+400)return;const mh=120+(i%4)*40;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.7,H-TILE-mh);ctx.lineTo(dx+mh*1.4,H-TILE);ctx.fill();});
  // 雪のキャップ
  ctx.fillStyle='#ffffff';
  [0,500,1100,1800,2600,3500,4500,5600,6700].forEach((mx,i)=>{const dx=mx-G.cam*0.05;if(dx<-400||dx>W+400)return;const mh=120+(i%4)*40;ctx.beginPath();ctx.moveTo(dx+mh*0.55,H-TILE-mh*0.6);ctx.lineTo(dx+mh*0.7,H-TILE-mh);ctx.lineTo(dx+mh*0.85,H-TILE-mh*0.6);ctx.fill();});
  // 中景の山（灰青・パララックス中）
  ctx.fillStyle='#8ab4cc';
  [200,900,1700,2700,3900,5100,6300].forEach((mx,i)=>{const dx=mx-G.cam*0.12;if(dx<-300||dx>W+300)return;const mh=90+(i%3)*30;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.8,H-TILE-mh);ctx.lineTo(dx+mh*1.6,H-TILE);ctx.fill();});
  // 雲
  ctx.fillStyle='rgba(255,255,255,0.88)';
  [100,550,1000,1600,2200,3000,3900,4800,5800,6700].forEach((cx,i)=>{const dx=cx-G.cam*0.25;if(dx<-140||dx>W+140)return;const cy=20+(i%4)*22;ctx.beginPath();ctx.arc(dx+25,cy+18,16,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+48,cy+12,22,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+72,cy+18,16,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+10,cy+18,68,12);});
  return;
}
if(_bgS?.bgTheme==='ice'){
  // 氷の平原：白い雪空 + 雪山 + 降雪
  const ig=ctx.createLinearGradient(0,0,0,H);
  ig.addColorStop(0,'#b8d8f0');ig.addColorStop(0.5,'#d4ecff');ig.addColorStop(1,'#eef6ff');
  ctx.fillStyle=ig;ctx.fillRect(0,0,W,H);
  // 遠景の雪山（白）
  ctx.fillStyle='#e8f4ff';
  [0,420,950,1700,2550,3600,4700,5900,7100].forEach((mx,i)=>{const dx=mx-G.cam*0.06;if(dx<-350||dx>W+350)return;const mh=100+(i%4)*38;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.65,H-TILE-mh);ctx.lineTo(dx+mh*1.3,H-TILE);ctx.fill();});
  // 雪のキャップ
  ctx.fillStyle='#ffffff';
  [0,420,950,1700,2550,3600,4700,5900,7100].forEach((mx,i)=>{const dx=mx-G.cam*0.06;if(dx<-350||dx>W+350)return;const mh=100+(i%4)*38;ctx.beginPath();ctx.moveTo(dx+mh*0.48,H-TILE-mh*0.58);ctx.lineTo(dx+mh*0.65,H-TILE-mh);ctx.lineTo(dx+mh*0.82,H-TILE-mh*0.58);ctx.fill();});
  // 綿雲
  ctx.fillStyle='rgba(255,255,255,0.92)';
  [60,480,940,1440,1980,2700,3520,4430,5360,6260].forEach((cx,i)=>{const dx=cx-G.cam*0.22;if(dx<-140||dx>W+140)return;const cy=12+(i%4)*22;ctx.beginPath();ctx.arc(dx+22,cy+16,14,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+44,cy+10,21,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+68,cy+16,14,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+8,cy+16,64,10);});
  // 降雪エフェクト
  ctx.fillStyle='rgba(255,255,255,0.85)';
  for(let i=0;i<35;i++){const sx=((i*223+G.frame*0.55*(1+i%3))%W);const sy=((i*149+G.frame*0.9*(1+i%2))%(H+20));const sr=i%3===0?2:1;ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();}
  return;
}
if(_bgS?.bgTheme==='ice_castle'){
  // 氷の城：夜の氷雪空 + 星 + オーロラ
  const icg=ctx.createLinearGradient(0,0,0,H);
  icg.addColorStop(0,'#030d1c');icg.addColorStop(0.4,'#071828');icg.addColorStop(0.75,'#0a2038');icg.addColorStop(1,'#050f20');
  ctx.fillStyle=icg;ctx.fillRect(0,0,W,H);
  // 星
  for(let i=0;i<50;i++){const sx=(i*317)%W,sy=(i*211)%(H*0.6);ctx.fillStyle=`rgba(200,230,255,${0.15+Math.abs(Math.sin(G.frame*0.04+i))*0.85})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  // オーロラ（水平グロー帯）
  for(let r=0;r<3;r++){const ay=55+r*30,aw=0.025+r*0.01;ctx.fillStyle=`rgba(60,200,180,${0.04+Math.abs(Math.sin(G.frame*aw+r*2.1))*0.06})`;ctx.fillRect(0,ay,W,18);}
  // 暗い氷山シルエット
  ctx.fillStyle='#0a1828';
  [0,520,1250,2100,3100,4300,5600,6900].forEach((mx,i)=>{const dx=mx-G.cam*0.07;if(dx<-400||dx>W+400)return;const mh=110+(i%3)*32;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.65,H-TILE-mh);ctx.lineTo(dx+mh*1.3,H-TILE);ctx.fill();});
  // 氷の青白いグロー（床付近）
  ctx.fillStyle='rgba(80,160,255,0.05)';ctx.fillRect(0,H-TILE*3,W,TILE*3);
  // 城ブロックパターン
  const _icx=G.cam*0.15;ctx.fillStyle='rgba(8,22,50,0.42)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-_icx%64);for(let by=0;by<H-TILE*3;by+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30)}}
  return;
}
if(_bgS?.bgTheme==='mountain_castle'){
  // 山の城：夕暮れ雪山 + 城の影
  const mcg=ctx.createLinearGradient(0,0,0,H);
  mcg.addColorStop(0,'#0d0015');mcg.addColorStop(0.4,'#2a0a2e');mcg.addColorStop(0.75,'#4a1040');mcg.addColorStop(1,'#1a0a0a');
  ctx.fillStyle=mcg;ctx.fillRect(0,0,W,H);
  // 星
  ctx.fillStyle='#fff';for(let i=0;i<40;i++){const sx=(i*317)%W,sy=(i*211)%(H*0.6);ctx.globalAlpha=0.3+Math.abs(Math.sin(G.frame*0.05+i))*0.7;ctx.fillRect(sx,sy,1,1);}ctx.globalAlpha=1;
  // 暗い山シルエット
  ctx.fillStyle='#1a0a20';
  [0,600,1400,2400,3500,4700,6000].forEach((mx,i)=>{const dx=mx-G.cam*0.08;if(dx<-400||dx>W+400)return;const mh=130+(i%3)*35;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.7,H-TILE-mh);ctx.lineTo(dx+mh*1.4,H-TILE);ctx.fill();});
  // 溶岩グロー
  ctx.fillStyle='rgba(255,40,0,0.07)';ctx.fillRect(0,H-TILE*3,W,TILE*3);
  const _cx4=G.cam*0.15;ctx.fillStyle='rgba(60,10,20,0.4)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-_cx4%64);for(let by=0;by<H-TILE*3;by+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30)}}
  return;
}
if(_bgS?.bgTheme==='fortress'){
  // 砦：暗い石造り内部 + 溶岩グロー + 松明の光
  const _fgg=ctx.createLinearGradient(0,0,0,H);
  _fgg.addColorStop(0,'#080810');_fgg.addColorStop(0.5,'#10101a');_fgg.addColorStop(0.85,'#18100a');_fgg.addColorStop(1,'#201008');
  ctx.fillStyle=_fgg;ctx.fillRect(0,0,W,H);
  // 石ブロックパターン
  const _foff=G.cam*0.12;ctx.fillStyle='rgba(38,36,34,0.52)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-_foff%64);for(let by=0;by<H-TILE*2;by+=32){if((Math.floor((bx+_foff)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30);}}
  // 溶岩グロー（床付近）
  ctx.fillStyle=`rgba(200,50,0,${0.07+0.03*Math.abs(Math.sin(G.frame*0.04))})`;ctx.fillRect(0,H-TILE*3,W,TILE*3);
  ctx.fillStyle=`rgba(255,90,0,${0.05+0.02*Math.abs(Math.sin(G.frame*0.05+1))})`;ctx.fillRect(0,H-TILE*2,W,TILE*2);
  // 松明の光（左右交互）
  [80,350,620,900,1180,1460,1750,2030,2310,2600,2890,3180,3480,3780,4080,4380,4680,4990,5290,5600,5900,6200,6510,6820,7130,7450].forEach((tx,i)=>{
    const dx=tx-G.cam;if(dx<-60||dx>W+60)return;
    const flk=0.7+0.3*Math.abs(Math.sin(G.frame*0.09+i*1.73));
    const ty=i%2===0?TILE*1.5:TILE*2.5;
    ctx.fillStyle=`rgba(255,140,0,${0.20*flk})`;ctx.beginPath();ctx.arc(dx,ty,24,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(255,180,0,${0.13*flk})`;ctx.beginPath();ctx.arc(dx,ty,15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(255,200,80,${0.55*flk})`;ctx.fillRect(dx-2,ty-10,4,9);
  });
  return;
}
if(_bgS?.bgTheme==='airship'){
  // 飛行船艦隊：嵐夜の空 + 艦隊シルエット + エンジン排気 + サーチライト
  const ag=ctx.createLinearGradient(0,0,0,H);
  ag.addColorStop(0,'#010306');ag.addColorStop(0.35,'#060e1a');ag.addColorStop(0.72,'#0b1520');ag.addColorStop(1,'#03070e');
  ctx.fillStyle=ag;ctx.fillRect(0,0,W,H);
  // 稲光フラッシュ（強め）
  if(Math.random()<0.005){ctx.fillStyle=`rgba(160,190,255,${0.06+Math.random()*0.1})`;ctx.fillRect(0,0,W,H);}
  // 星（嵐で揺らぐ）
  for(let i=0;i<38;i++){const sx=(i*271+(G.cam*0.01|0))%W,sy=(i*173)%(H*0.42);ctx.fillStyle=`rgba(170,195,255,${0.04+Math.abs(Math.sin(G.frame*0.022+i*1.9))*0.65})`;ctx.fillRect(sx,sy,i%8===0?2:1,i%8===0?2:1);}
  // 嵐雲（大型・重厚）
  ctx.fillStyle='rgba(10,18,32,0.78)';
  [60,500,1100,1900,2900,4000,5300,6700].forEach((cx,i)=>{const dx=cx-G.cam*0.2;if(dx<-320||dx>W+320)return;const cy=10+(i%4)*18;const cw=190+(i%3)*75;ctx.beginPath();ctx.arc(dx+cw*0.22,cy+18,32+i%3*10,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+cw*0.5,cy+9,40+i%2*13,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+cw*0.78,cy+18,28+i%3*8,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+16,cy+13,cw-32,20);
    if((G.frame+i*71)%380<3){ctx.strokeStyle='rgba(180,210,255,0.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(dx+cw*0.5,cy+30);ctx.lineTo(dx+cw*0.52+8,cy+58);ctx.lineTo(dx+cw*0.5+5,cy+78);ctx.stroke();}
  });
  // 遠景艦隊シルエット（低速パララックス）
  [{x:100,w:270,h:28},{x:650,w:180,h:22},{x:1280,w:260,h:30},{x:2050,w:210,h:24},{x:2950,w:310,h:34},{x:3950,w:200,h:26},{x:5100,w:280,h:30},{x:6300,w:230,h:28},{x:7500,w:260,h:32}].forEach(({x,w,h},i)=>{
    const dx=x-G.cam*0.17;if(dx<-380||dx>W+380)return;
    const by=H-TILE-h;
    ctx.fillStyle='#070c18';
    ctx.fillRect(dx,by,w,h);                          // 船体
    ctx.fillRect(dx+(w*0.2|0),by-15,(w*0.4|0),15);   // 艦橋
    ctx.fillRect(dx+(w*0.31|0),by-25,(w*0.13|0),11); // マスト
    for(let j=0;j<4;j++){ctx.fillStyle=`rgba(255,210,80,${0.1+0.09*Math.sin(G.frame*0.04+i+j)})`;ctx.fillRect(dx+(w*0.22|0)+j*16,by+5,6,5);}  // 窓
    ctx.fillStyle=`rgba(255,85,10,${0.22+0.14*Math.sin(G.frame*0.08+i)})`;
    ctx.beginPath();ctx.arc(dx+8,by+(h*0.55|0),10,0,Math.PI*2);ctx.fill(); // エンジン光
  });
  // エンジン排気煙（アニメーション）
  for(let i=0;i<8;i++){const sx=(180+i*1050)-(G.cam*0.17|0);if(sx<-80||sx>W+80)continue;for(let j=0;j<5;j++){const age=(G.frame*1.3+j*44+i*290)%260;const al=Math.max(0,0.18-age*0.0007);if(al<=0)continue;ctx.fillStyle=`rgba(30,42,60,${al})`;ctx.beginPath();ctx.arc(sx,H-TILE*2.2-age*0.72,4+age*0.09,0,Math.PI*2);ctx.fill();}}
  // 手前甲板下端（搭乗中の船体シルエット）
  ctx.fillStyle='#080d1a';ctx.fillRect(0,H-TILE*1.3,W,TILE*0.45);
  ctx.fillStyle='rgba(255,85,10,0.13)';for(let ei=0;ei<W+100;ei+=96){ctx.fillRect((ei+((G.cam*0.45)|0))%W,H-TILE*1.3+1,12,5);}
  // サーチライト（左右スイープ）
  const _sa=(G.frame*0.48)%1200;const _sx=(_sa<600?_sa:1200-_sa)*(W/600);
  const _slg=ctx.createRadialGradient(_sx,H-TILE,0,_sx,H-TILE,W*0.62);
  _slg.addColorStop(0,'rgba(200,225,255,0.055)');_slg.addColorStop(1,'rgba(200,225,255,0)');
  ctx.fillStyle=_slg;ctx.fillRect(0,0,W,H);
  return;
}
}
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
// Castle (1-3)
if(G.currentWorld===1&&G.currentLevel===3){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0000');g.addColorStop(0.5,'#200505');g.addColorStop(1,'#3a0a0a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(255,50,0,0.08)';ctx.fillRect(0,H-TILE*3,W,TILE*3);
const cx=G.cam*0.15;ctx.fillStyle='rgba(60,20,20,0.45)';
for(let bx=0;bx<W+64;bx+=64){const ox=(bx-cx%64);for(let by=0;by<H-TILE*3;by+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30)}}
ctx.fillStyle='#ff3300';ctx.globalAlpha=0.12+0.06*Math.abs(Math.sin(G.frame*0.03));ctx.fillRect(0,H-TILE*1.5,W,TILE*2);ctx.globalAlpha=1;
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
if(G.iceMode){
ctx.fillStyle='#7ec8e8';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#b4e0f4';ctx.fillRect(x+1,py+1,TILE-2,4);
ctx.fillStyle='#5aaad0';ctx.fillRect(x+1,py+5,TILE-2,TILE-6);
ctx.fillStyle='rgba(255,255,255,0.65)';ctx.fillRect(x+2,py+2,7,1);ctx.fillRect(x+20,py+3,8,1);
ctx.fillStyle='rgba(30,100,160,0.3)';ctx.fillRect(x,py+TILE/2,TILE,1);ctx.fillRect(x+TILE/2,py,1,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,1,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,1,TILE/2-1);
}else if(G.airshipMode){
ctx.fillStyle='#28303e';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#3a4452';ctx.fillRect(x+1,py+1,TILE-2,6);ctx.fillStyle='#222a36';ctx.fillRect(x+1,py+7,TILE-2,TILE-8);
ctx.fillStyle='#5a6475';ctx.fillRect(x+2,py+2,3,3);ctx.fillRect(x+TILE-5,py+2,3,3);
ctx.fillStyle='#181f28';ctx.fillRect(x,py+TILE/2,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+2,2,TILE/2-2);ctx.fillRect(x+3*TILE/4,py+TILE/2+2,2,TILE/2-2);
ctx.fillStyle='#c89000';ctx.fillRect(x,py+TILE-4,TILE,4);ctx.fillStyle='#181f28';for(let _di=0;_di<4;_di++)ctx.fillRect(x+_di*8,py+TILE-4,4,4);
ctx.fillStyle='rgba(255,255,255,0.07)';ctx.fillRect(x+1,py+1,TILE-2,2);
}else{
ctx.fillStyle='#C84C0C';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#E09060';ctx.fillRect(x+1,py+1,TILE-2,3);
ctx.fillStyle='#D07030';ctx.fillRect(x+1,py+4,TILE-2,TILE-5);
ctx.fillStyle='#A04000';ctx.fillRect(x,py+TILE/2,TILE,1);ctx.fillRect(x+TILE/2,py,1,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,1,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,1,TILE/2-1);
}}else if(type==='brick'){
if(G.iceMode){
ctx.fillStyle='#3a88b8';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#4ea8d8';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#2a6888';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,2,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,2,TILE/2-1);
ctx.fillStyle='rgba(200,240,255,0.22)';ctx.fillRect(x+2,py+2,TILE-4,2);
ctx.fillStyle='rgba(0,40,90,0.15)';ctx.fillRect(x,py+TILE-2,TILE,2);
}else if(G.airshipMode){
ctx.fillStyle='#2c3442';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#3c4858';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#7c8898';ctx.fillRect(x+3,py+3,3,3);ctx.fillRect(x+TILE-6,py+3,3,3);ctx.fillRect(x+3,py+TILE-6,3,3);ctx.fillRect(x+TILE-6,py+TILE-6,3,3);
ctx.fillStyle='#1c2230';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,2,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,2,TILE/2-1);
ctx.fillStyle='rgba(255,255,255,0.07)';ctx.fillRect(x+2,py+2,TILE-4,2);
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x,py+TILE-2,TILE,2);
}else{
ctx.fillStyle='#C04020';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#D85840';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#A03018';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,2,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,2,TILE/2-1);
ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(x+2,py+2,TILE-4,2);
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(x,py+TILE-2,TILE,2);
}
}else if(type==='question'||type==='yoshiEgg'){
if(hit){ctx.fillStyle='#8B7355';ctx.fillRect(x,py,TILE,TILE);ctx.fillStyle='#A08B6B';ctx.fillRect(x+2,py+2,TILE-4,TILE-4);ctx.fillStyle='#706050';ctx.fillRect(x+10,py+8,12,16)}
else{const pulse=Math.sin(G.frame*0.12)*0.12+0.88;const isYoshi=type==='yoshiEgg';
ctx.fillStyle=isYoshi?`hsl(120,60%,${Math.floor(42*pulse)}%)`:`hsl(42,100%,${Math.floor(52*pulse)}%)`;ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle=isYoshi?'#1a6d1a':'#B8860B';ctx.fillRect(x,py,TILE,2);ctx.fillRect(x,py,2,TILE);
ctx.fillStyle=isYoshi?'#4CAF50':'#FFD700';ctx.fillRect(x,py+TILE-2,TILE,2);ctx.fillRect(x+TILE-2,py,2,TILE);
ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.textAlign='center';
ctx.fillText(isYoshi?'Y':'?',x+TILE/2,py+TILE-7);ctx.textAlign='left'}
}else if(type==='pswitch'){
if(hit){ctx.fillStyle='#2244AA';ctx.fillRect(x,py+TILE-8,TILE,8);ctx.fillStyle='#1a3388';ctx.fillRect(x+2,py+TILE-6,TILE-4,4);}
else{const _pPulse=0.9+Math.sin(G.frame*0.1)*0.1;ctx.fillStyle=`hsl(220,70%,${Math.floor(45*_pPulse)}%)`;ctx.fillRect(x,py,TILE,TILE);ctx.fillStyle='#4488EE';ctx.fillRect(x+2,py+2,TILE-4,TILE-4);ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('P',x+TILE/2,py+TILE-8);ctx.textAlign='left';ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x+2,py+2,TILE-4,4);ctx.fillStyle='#1a3388';ctx.fillRect(x,py,TILE,2);ctx.fillRect(x,py,2,TILE);ctx.fillStyle='#66aaff';ctx.fillRect(x,py+TILE-2,TILE,2);ctx.fillRect(x+TILE-2,py,2,TILE);}
}else if(type==='pswitch_block'){
const _pbPulse=0.12+Math.sin(G.frame*0.15)*0.08;
ctx.fillStyle='#4488CC';ctx.fillRect(x,py,TILE,TILE);ctx.fillStyle='#5599DD';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#3377BB';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);
ctx.fillStyle=`rgba(100,200,255,${_pbPulse})`;ctx.fillRect(x,py,TILE,TILE);
}}

const _PCOLS={green:['#1E8C2A','#27AE60','#2ECC71'],red:['#7B241C','#C0392B','#E74C3C'],yellow:['#9A6B00','#D4AC0D','#F4D03F'],blue:['#1A4E7B','#2471A3','#5DADE2'],purple:['#5B2C6F','#8E44AD','#BB8FCE'],pink:['#880E4F','#D81B60','#F48FB1'],cyan:['#0D6E6E','#17A589','#76D7C4']};
const _PCNAMES=['green','red','yellow','blue','purple','pink','cyan'];
function drawPipe(x,y,w,h,ceil,color){
const _c=_PCOLS[color||_PCNAMES[Math.floor(x/321)%7]]||_PCOLS.green;
ctx.fillStyle=_c[0];ctx.fillRect(x,y,w,h);
ctx.fillStyle=_c[1];ctx.fillRect(x+2,y+2,w-4,h-2);
ctx.fillStyle=_c[2];ctx.fillRect(x+4,y+2,8,h-4);
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(x+6,y+2,3,h-4);
if(ceil){ctx.fillStyle=_c[0];ctx.fillRect(x-4,y+h-16,w+8,16);ctx.fillStyle=_c[1];ctx.fillRect(x-2,y+h-14,w+4,12);ctx.fillStyle=_c[2];ctx.fillRect(x,y+h-13,8,8);ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(x+2,y+h-12,3,6);}
else{ctx.fillStyle=_c[0];ctx.fillRect(x-4,y,w+8,16);ctx.fillStyle=_c[1];ctx.fillRect(x-2,y+2,w+4,12);ctx.fillStyle=_c[2];ctx.fillRect(x,y+3,8,8);ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(x+2,y+4,3,6);}
}

function drawMario(mx,my,facing,wf,dead,big){
ctx.save();
if(mario.inv>0&&Math.floor(G.frame/4)%2===0){ctx.restore();return}
// 重力反転時は上下反転
if(G.gravityFlipped&&!dead){ctx.translate(0,my+mario.h);ctx.scale(1,-1);ctx.translate(0,-(my));}
if(facing===-1){ctx.translate(mx+26,0);ctx.scale(-1,1);mx=0}else{ctx.translate(mx,0);mx=0}
const isFire=mario.power==='fire';const isIce=mario.power==='ice';const isHammer=mario.power==='hammer';const isMega=G.megaTimer>0;
const _isLuigi=G.character==='luigi';
const hatC=isIce?'#88ddff':isHammer?'#666':isFire?'#fff':(_isLuigi?'#27AE60':'#E52521');
const shirtC=isIce?'#2288cc':isHammer?'#444':isFire?(_isLuigi?'#27AE60':'#E52521'):(_isLuigi?'#1a55bb':'#0050C8');
const skinC='#FBD000',hairC=isHammer?'#444':'#6B3410',shoeC=isHammer?'#333':'#6B3410';

if(dead){ctx.fillStyle=hatC;ctx.fillRect(mx+4,my,20,7);ctx.fillStyle=skinC;ctx.fillRect(mx+6,my+7,16,8);ctx.fillStyle=shirtC;ctx.fillRect(mx+2,my+15,24,12);ctx.restore();return}
if(big){
if(mario.crouching){
// Big Mario crouching (h=24px)
ctx.fillStyle=hatC;ctx.fillRect(mx+6,my,18,5);ctx.fillRect(mx+2,my+3,24,5);
ctx.fillStyle=hairC;ctx.fillRect(mx+2,my+7,4,4);
ctx.fillStyle=skinC;ctx.fillRect(mx+4,my+9,20,8);
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+10,6,4);ctx.fillRect(mx+16,my+10,6,4);
ctx.fillStyle='#000';ctx.fillRect(mx+10,my+11,4,3);ctx.fillRect(mx+18,my+11,4,3);
ctx.fillStyle=hairC;ctx.fillRect(mx+6,my+15,16,2);
ctx.fillStyle=shirtC;ctx.fillRect(mx+4,my+17,20,5);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+19,3,2);ctx.fillRect(mx+16,my+19,3,2);
ctx.fillStyle=shirtC;ctx.fillRect(mx+4,my+22,10,2);ctx.fillRect(mx+14,my+22,10,2);
ctx.fillStyle=shoeC;ctx.fillRect(mx+2,my+22,10,2);ctx.fillRect(mx+14,my+22,10,2);
if(isHammer){ctx.fillStyle='#888';ctx.fillRect(mx+2,my-4,24,8);ctx.fillStyle='#aaa';ctx.fillRect(mx+4,my-3,20,5);ctx.fillStyle='#666';ctx.fillRect(mx+6,my-6,16,4);}
}else{
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
// ハンマースーツのヘルメット
if(isHammer){ctx.fillStyle='#888';ctx.fillRect(mx+2,my-4,24,8);ctx.fillStyle='#aaa';ctx.fillRect(mx+4,my-3,20,5);ctx.fillStyle='#666';ctx.fillRect(mx+6,my-6,16,4);}
}}else{
if(mario.crouching){
// Small Mario crouching (h=20px)
ctx.fillStyle=hatC;ctx.fillRect(mx+6,my,18,5);ctx.fillRect(mx+2,my+3,24,4);
ctx.fillStyle=skinC;ctx.fillRect(mx+4,my+7,20,7);
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+8,5,4);ctx.fillRect(mx+16,my+8,5,4);
ctx.fillStyle='#000';ctx.fillRect(mx+10,my+9,3,3);ctx.fillRect(mx+17,my+9,3,3);
ctx.fillStyle=hairC;ctx.fillRect(mx+6,my+12,14,2);
ctx.fillStyle=shirtC;ctx.fillRect(mx+4,my+14,20,4);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+15,3,2);ctx.fillRect(mx+16,my+15,3,2);
ctx.fillStyle=shoeC;ctx.fillRect(mx+2,my+18,10,2);ctx.fillRect(mx+14,my+18,10,2);
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
}}
ctx.restore();
}

function drawYoshiBody(yx,yy,facing,mounted){
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
ctx.restore();
}

function drawYoshiHead(yx,yy,facing){
ctx.save();
if(facing===-1){ctx.translate(yx+30,0);ctx.scale(-1,1);yx=0}else{ctx.translate(yx,0);yx=0}
const _chewing=yoshi.chewTimer>0;
const _eating=!!yoshi.eatTarget;
// Neck
ctx.fillStyle='#2ecc71';ctx.fillRect(yx+17,yy+10,9,10);
// Head
ctx.fillStyle='#27ae60';ctx.beginPath();ctx.arc(yx+22,yy+7,11,0,Math.PI*2);ctx.fill();ctx.fillRect(yx+12,yy+2,14,12);
// Snout（飲み込み中は膨らむ）
if(_chewing){
  const _cPulse=Math.sin(yoshi.chewTimer*0.8)*2;
  ctx.fillStyle='#52be80';ctx.beginPath();ctx.arc(yx+28,yy+10,9+_cPulse,0,Math.PI*2);ctx.fill();
  // 頬の膨らみ
  ctx.fillStyle='#5fcf8b';ctx.beginPath();ctx.arc(yx+30,yy+12,5+_cPulse*0.5,0,Math.PI*2);ctx.fill();
  // 口（モグモグ）
  const _mOpen=Math.abs(Math.sin(yoshi.chewTimer*1.2))*3;
  ctx.fillStyle='#1a1a1a';ctx.fillRect(yx+31,yy+11-_mOpen/2,5,2+_mOpen);
} else if(_eating){
  // 口を大きく開けて待ち構える
  ctx.fillStyle='#52be80';ctx.beginPath();ctx.arc(yx+28,yy+10,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c0392b';ctx.beginPath();ctx.arc(yx+33,yy+11,4,0,Math.PI*2);ctx.fill();
} else {
  ctx.fillStyle='#52be80';ctx.beginPath();ctx.arc(yx+28,yy+10,7,0,Math.PI*2);ctx.fill();
}
// Nostrils
ctx.fillStyle='#145a14';ctx.beginPath();ctx.arc(yx+26,yy+7,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(yx+30,yy+7,1.5,0,Math.PI*2);ctx.fill();
// Eye white
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(yx+19,yy+4,5,0,Math.PI*2);ctx.fill();
// Pupil（食べてる時は嬉しそうに）
if(_chewing){
  ctx.fillStyle='#1a1a1a';ctx.fillRect(yx+17,yy+4,7,2);
} else {
  ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(yx+20,yy+4,3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(yx+22,yy+3,1.2,0,Math.PI*2);ctx.fill();
}
// Tongue + 捕まえた敵の描画
if(yoshi.tongueOut>0&&yoshi.tongueLen>0){
  ctx.fillStyle='#e91e63';const tLen=yoshi.tongueLen;
  ctx.fillRect(yx+32,yy+9,tLen,5);
  ctx.beginPath();ctx.arc(yx+32+tLen,yy+11,5,0,Math.PI*2);ctx.fill();
  // 引き戻し中：舌先に敵を描画
  if(yoshi.eatTarget){
    ctx.fillStyle=yoshi.eatTarget.color||'#8B4513';
    ctx.beginPath();ctx.arc(yx+32+tLen,yy+11,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath();ctx.arc(yx+32+tLen,yy+11,7,0,Math.PI*2);ctx.fill();
  }
}
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
if((e.type==='parakoopa'||e.type==='parakoopaR')&&e.flying){const wf=Math.sin(G.frame*0.25)*8;
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
if(pr.ceiling){ctx.save();ctx.translate(cx,y+ch/2);ctx.scale(1,-1);ctx.translate(-cx,-(y+ch/2));}
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
ctx.beginPath();ctx.arc(x+4,y+ch*0.44-gap/2,1.5,0,Math.PI*2);ctx.fill();
if(pr.ceiling)ctx.restore();}

function drawMushroom(m){
if(m.type==='iceFlower'){const bob=Math.sin(G.frame*0.1)*2;ctx.fillStyle='#27AE60';ctx.fillRect(m.x+10,m.y+14,4,10);
const rot=G.frame*0.05;for(let i=0;i<4;i++){const a=rot+i*Math.PI/2;const px=m.x+12+Math.cos(a)*7,py=m.y+8+Math.sin(a)*7+bob;
ctx.fillStyle=i%2===0?'#44aaff':'#88ddff';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill()}
ctx.fillStyle='#ccf0ff';ctx.beginPath();ctx.arc(m.x+12,m.y+8+bob,5,0,Math.PI*2);ctx.fill();return}
if(m.type==='hammerSuit'){ctx.fillStyle='#666';ctx.fillRect(m.x+4,m.y+4,16,12);ctx.fillStyle='#888';ctx.fillRect(m.x+6,m.y+6,12,8);
ctx.fillStyle='#8B4513';ctx.fillRect(m.x+8,m.y+16,8,8);ctx.fillStyle='#aaa';ctx.fillRect(m.x+4,m.y,16,6);return}
if(m.type==='mega'){ctx.fillStyle='#F5E6C8';ctx.fillRect(m.x+6,m.y+18,16,14);
ctx.fillStyle='#E52521';ctx.beginPath();ctx.arc(m.x+14,m.y+14,14,Math.PI,0);ctx.fill();
ctx.fillStyle='#ff6644';ctx.beginPath();ctx.arc(m.x+14,m.y+14,11,Math.PI,0);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(m.x+8,m.y+12,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(m.x+20,m.y+12,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(m.x+9,m.y+13,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(m.x+21,m.y+13,2,0,Math.PI*2);ctx.fill();
const _megaPulse=0.85+Math.sin(G.frame*0.15)*0.15;ctx.globalAlpha=_megaPulse;ctx.strokeStyle='#ff4400';ctx.lineWidth=2;ctx.beginPath();ctx.arc(m.x+14,m.y+16,16,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.lineWidth=1;return}
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

function drawFireCoin(x,y){const cx=Math.round(x+7),cy=Math.round(y+7);ctx.save();const _grd=ctx.createRadialGradient(cx,cy,1,cx,cy,14);_grd.addColorStop(0,'rgba(255,220,0,0.7)');_grd.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=_grd;ctx.beginPath();ctx.arc(cx,cy,14,0,Math.PI*2);ctx.fill();const _sq=0.7+0.3*Math.abs(Math.cos(G.frame*0.22));ctx.translate(cx,cy);ctx.scale(_sq,1);ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#FF9900';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('C',0,1);ctx.restore();}
function drawCoinItem(x,y){const squeeze=Math.abs(Math.cos(G.frame*0.18));ctx.save();ctx.translate(x+TILE/2,y+TILE/2);ctx.scale(squeeze,1);
ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#F39C12';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#FFD700';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('$',0,4);
// Sparkle
if(G.frame%20<10){ctx.fillStyle='rgba(255,255,255,0.8)';ctx.fillRect(-2,-10,2,4);ctx.fillRect(8,-6,2,4)}
ctx.restore()}

function drawFireball(fb){ctx.save();const gd=ctx.createRadialGradient(fb.x+6,fb.y+6,0,fb.x+6,fb.y+6,9);gd.addColorStop(0,'#fff');gd.addColorStop(0.35,'#ff9900');gd.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=gd;ctx.beginPath();ctx.arc(fb.x+6,fb.y+6,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,200,0,0.5)';ctx.fillRect(fb.x+6-fb.vx*0.5,fb.y+4,4,4);ctx.restore()}

function drawPenguin(e){
const x=e.x,y=e.y,f=e.vx>=0?1:-1;
if(e.state==='dead'){ctx.fillStyle='#111';ctx.fillRect(x+2,y+TILE-8,TILE-4,8);ctx.fillStyle='#e0f0ff';ctx.fillRect(x+6,y+TILE-7,TILE-12,4);return;}
const fw=e.walkFrame===0?3:-3;
// 足（オレンジ）
ctx.fillStyle='#e07000';ctx.fillRect(x+4+fw,y+TILE-5,9,5);ctx.fillRect(x+17-fw,y+TILE-5,9,5);
// ボディ（黒楕円）
ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(x+16,y+19,11,13,0,0,Math.PI*2);ctx.fill();
// 頭
ctx.beginPath();ctx.arc(x+16,y+8,9,0,Math.PI*2);ctx.fill();
// 白いお腹
ctx.fillStyle='#e0f0ff';ctx.beginPath();ctx.ellipse(x+16+(f>0?1:-1),y+21,6,9,0,0,Math.PI*2);ctx.fill();
// 目（白+黒瞳）
const ex=f>0?x+21:x+9;
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,y+7,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ex+(f>0?1:-1),y+7,2,0,Math.PI*2);ctx.fill();
// くちばし（オレンジ三角）
ctx.fillStyle='#e07000';
const bx1=x+16+(f>0?8:-8),bx2=x+16+(f>0?16:-16);
ctx.beginPath();ctx.moveTo(bx1,y+10);ctx.lineTo(bx2,y+13);ctx.lineTo(bx1,y+16);ctx.closePath();ctx.fill();
}
function drawTeresa(e){
  const x=e.x,y=e.y;
  ctx.globalAlpha=e.hiding?0.30:1.0;
  // ボディ（白い幽霊型）
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(x+14,y+13,12,Math.PI,0);
  ctx.lineTo(x+26,y+27);ctx.lineTo(x+22,y+21);ctx.lineTo(x+18,y+27);
  ctx.lineTo(x+14,y+21);ctx.lineTo(x+10,y+27);ctx.lineTo(x+6,y+21);ctx.lineTo(x+2,y+27);
  ctx.closePath();ctx.fill();
  // 薄い影
  ctx.fillStyle='rgba(180,180,220,0.15)';ctx.beginPath();ctx.ellipse(x+14,y+25,9,3,0,0,Math.PI*2);ctx.fill();
  if(e.hiding){
    // 目を手で隠す
    ctx.fillStyle='#fcd0d0';ctx.fillRect(x+1,y+10,10,8);ctx.fillRect(x+17,y+10,10,8);
    ctx.fillStyle='#444';ctx.beginPath();ctx.arc(x+6,y+14,2.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+22,y+14,2.5,0,Math.PI*2);ctx.fill();
  }else{
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(x+9,y+12,4.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+20,y+12,4.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#dd0000';ctx.beginPath();ctx.arc(x+9,y+12,2.8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+20,y+12,2.8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.55)';ctx.beginPath();ctx.arc(x+14,y+18,3.5,0,Math.PI);ctx.fill();
  }
  ctx.globalAlpha=1.0;
}
function drawThwomp(e){
  const x=e.x,y=e.y;const falling=e.state==='fall';
  // 本体（石）
  ctx.fillStyle=falling?'#5a5a70':'#42425a';ctx.fillRect(x,y,e.w,e.h);
  // ハイライト
  ctx.fillStyle='rgba(255,255,255,0.10)';ctx.fillRect(x,y,e.w,3);ctx.fillRect(x,y,3,e.h);
  // 影
  ctx.fillStyle='rgba(0,0,0,0.30)';ctx.fillRect(x,y+e.h-3,e.w,3);ctx.fillRect(x+e.w-3,y,3,e.h);
  // ひび割れ模様
  ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x+e.w*0.3,y+5);ctx.lineTo(x+e.w*0.2,y+e.h*0.5);ctx.lineTo(x+e.w*0.38,y+e.h*0.85);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+e.w*0.68,y+8);ctx.lineTo(x+e.w*0.78,y+e.h*0.45);ctx.stroke();
  // 下スパイク
  ctx.fillStyle='#2e2e44';
  for(let s=0;s<3;s++){const sw=(e.w-12)/3,sx2=x+6+s*sw;ctx.beginPath();ctx.moveTo(sx2,y+e.h);ctx.lineTo(sx2+sw/2,y+e.h+10);ctx.lineTo(sx2+sw,y+e.h);ctx.fill();}
  // 怒り眉
  ctx.fillStyle='#1a1a1a';ctx.fillRect(x+6,y+8,18,4);ctx.fillRect(x+e.w-24,y+8,18,4);
  // 目の枠
  ctx.fillRect(x+6,y+12,18,12);ctx.fillRect(x+e.w-24,y+12,18,12);
  // 眼球（落下中は赤く光る）
  ctx.fillStyle=falling?'#ff2200':'#cc1100';ctx.fillRect(x+8,y+14,14,8);ctx.fillRect(x+e.w-22,y+14,14,8);
  // 口
  ctx.fillStyle='#1a1a1a';ctx.fillRect(x+10,Math.floor(y+e.h*0.62),e.w-20,9);
  // 歯
  ctx.fillStyle='#ddd';const tw=Math.floor((e.w-20)/4);
  for(let t=0;t<4;t++)ctx.fillRect(x+10+t*tw+1,Math.floor(y+e.h*0.62),tw-2,5);
  // 落下中の衝撃パーティクル
  if(falling&&e.vy>10){ctx.fillStyle='rgba(120,120,160,0.3)';for(let p=0;p<3;p++)ctx.fillRect(x+e.w/2-3,y+e.h+p*5,6,4);}
}
function drawMovingPlat(mp){
if(G.iceMode){const gd=ctx.createLinearGradient(mp.x,mp.y,mp.x,mp.y+mp.h);gd.addColorStop(0,'#a4d4f0');gd.addColorStop(0.5,'#c4e8ff');gd.addColorStop(1,'#78b8d8');ctx.fillStyle=gd;ctx.fillRect(mp.x,mp.y,mp.w,mp.h);ctx.fillStyle='rgba(255,255,255,0.65)';ctx.fillRect(mp.x+2,mp.y+1,mp.w-4,2);}
else{const gd=ctx.createLinearGradient(mp.x,mp.y,mp.x,mp.y+mp.h);gd.addColorStop(0,'#e67e22');gd.addColorStop(0.5,'#f39c12');gd.addColorStop(1,'#d35400');ctx.fillStyle=gd;ctx.fillRect(mp.x,mp.y,mp.w,mp.h);ctx.fillStyle='#c0392b';ctx.fillRect(mp.x+4,mp.y+3,5,5);ctx.fillRect(mp.x+mp.w-9,mp.y+3,5,5);}}
function drawSpring(sp){const comp=sp.compressed>0?8:0;ctx.fillStyle='#e74c3c';ctx.fillRect(sp.x,sp.y+sp.h-6,sp.w,6);ctx.fillStyle='#f1c40f';for(let i=0;i<3;i++)ctx.fillRect(sp.x+2,sp.y+4+i*6+comp,sp.w-4,3);ctx.fillStyle='#e74c3c';ctx.fillRect(sp.x-2,sp.y+comp,sp.w+4,5)}
function drawCheckpoint(cp){ctx.fillStyle=cp.reached?'#2ecc71':'#888';ctx.fillRect(cp.x+6,cp.y-TILE*3,4,TILE*3);ctx.fillStyle=cp.reached?'#2ecc71':'#e74c3c';ctx.beginPath();ctx.moveTo(cp.x+10,cp.y-TILE*3);ctx.lineTo(cp.x+30,cp.y-TILE*3+10);ctx.lineTo(cp.x+10,cp.y-TILE*3+20);ctx.fill();ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(cp.x+8,cp.y-TILE*3,5,0,Math.PI*2);ctx.fill()}

function drawCheep(e){const x=e.x,y=e.y,dir=(e.vx||0)<0?-1:1;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.ellipse(x+12,y+10,12,7,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return}
ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.ellipse(x+12,y+10,12,7,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#c0392b';ctx.beginPath();
if(dir<0){ctx.moveTo(x+22,y+5);ctx.lineTo(x+32,y+1);ctx.lineTo(x+32,y+19);ctx.closePath();}
else{ctx.moveTo(x+2,y+5);ctx.lineTo(x-8,y+1);ctx.lineTo(x-8,y+19);ctx.closePath();}
ctx.fill();
const ex=dir<0?x+5:x+18;
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,y+7,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ex+(dir<0?1:-1),y+7,2.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff9999';ctx.beginPath();ctx.moveTo(x+12,y+3);ctx.lineTo(x+8,y-2);ctx.lineTo(x+16,y-2);ctx.closePath();ctx.fill();}

function drawBlooper(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#ddeeff';ctx.beginPath();ctx.ellipse(x+12,y+10,12,10,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return}
ctx.fillStyle='#eef6ff';ctx.beginPath();ctx.ellipse(x+12,y+10,12,10,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#cce4ff';ctx.beginPath();ctx.ellipse(x+12,y+15,12,5,0,0,Math.PI);ctx.fill();
const _bph=G.frame*0.12;for(let i=0;i<4;i++){const _tx=x+4+i*6,_ty=y+e.h-2;ctx.strokeStyle='#aad4ee';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(_tx,_ty);ctx.quadraticCurveTo(_tx+Math.sin(_bph+i)*4,_ty+6,_tx,_ty+8+Math.sin(_bph+i*1.5)*3);ctx.stroke();}
ctx.lineWidth=1;
ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.arc(x+8,y+8,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+16,y+8,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(x+8,y+8,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+16,y+8,1.5,0,Math.PI*2);ctx.fill();}

function drawDryBones(e){
const x=Math.round(e.x),y=Math.round(e.y);const w=e.w,h=e.h;
// ── 崩れ状態：骨パイル＋復活シェイク ──
if(e.state==='collapsed'){
  const timer=e.collapseTimer||0;let sx=0,sy=0;
  if(timer>0&&timer<60){const t=1-timer/60;sx=Math.round(Math.sin(G.frame*(1+t*2))*t*3);sy=Math.round(Math.abs(Math.sin(G.frame*2.2))*t);}
  // 頭蓋骨（目の穴付き）
  ctx.fillStyle='#f0ede0';ctx.fillRect(x+sx+6,y+sy+h-20,16,12);
  ctx.fillStyle='#1a1a1a';ctx.fillRect(x+sx+8,y+sy+h-18,5,6);ctx.fillRect(x+sx+14,y+sy+h-18,5,6);
  // 歯
  ctx.fillStyle='#fffff0';ctx.fillRect(x+sx+8,y+sy+h-10,2,3);ctx.fillRect(x+sx+11,y+sy+h-10,2,3);ctx.fillRect(x+sx+14,y+sy+h-10,2,3);
  // 散らばった骨片
  ctx.fillStyle='#e0ddc8';ctx.fillRect(x+2,y+h-7,9,5);ctx.fillRect(x+sx+18,y+sy+h-6,10,4);
  return;
}
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#e8e8d0';ctx.fillRect(x+4,y+4,w-8,h-8);ctx.globalAlpha=1;return;}
const dir=e.vx>=0?1:-1;const wf=e.walkFrame||0;
// ── 足 ──
ctx.fillStyle='#d8d5c0';
ctx.fillRect(x+5,   y+h-9+(wf===0?1:0),8,9);
ctx.fillRect(x+w-13,y+h-9+(wf===1?1:0),8,9);
// かかと
ctx.fillStyle='#e8e5d0';
ctx.fillRect(x+3+(wf===0?-1:0), y+h-4,11,4);
ctx.fillRect(x+w-15+(wf===1?0:1),y+h-4,11,4);
// ── 骨盤 ──
ctx.fillStyle='#c8c5b0';ctx.fillRect(x+5,y+h-13,w-10,4);
// ── 背骨 ──
ctx.fillStyle='#c0bda8';ctx.fillRect(x+w/2-2,y+16,4,7);
// ── 肋骨（2対） ──
ctx.strokeStyle='#a8a598';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(x+w/2-2,y+17);ctx.lineTo(x+4, y+21);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w/2+2,y+17);ctx.lineTo(x+w-4,y+21);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w/2-2,y+22);ctx.lineTo(x+5, y+25);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w/2+2,y+22);ctx.lineTo(x+w-5,y+25);ctx.stroke();
// ── 腕（向いている方向のみ） ──
ctx.fillStyle='#c8c5b0';
if(dir>0){ctx.fillRect(x+w-6,y+14,5,12);ctx.fillRect(x+w-8,y+24,8,3);}
else{ctx.fillRect(x+1,y+14,5,12);ctx.fillRect(x,y+24,8,3);}
// ── 頭蓋骨（円形クラニアム） ──
ctx.fillStyle='#f0ede0';
ctx.beginPath();ctx.arc(x+w/2,y+8,w/2-2,0,Math.PI*2);ctx.fill();
// あご（クラニアムより少し狭い）
ctx.fillStyle='#e2dec8';ctx.fillRect(x+6,y+13,w-12,6);
// 歯（4本）
ctx.fillStyle='#fffff5';
ctx.fillRect(x+7, y+14,3,4);ctx.fillRect(x+12,y+14,3,4);
ctx.fillRect(x+17,y+14,3,4);ctx.fillRect(x+22,y+14,3,4);
// ── 大きな目の穴（ドライボーンズの決め手） ──
ctx.fillStyle='#111';
ctx.fillRect(x+4, y+2,9,9);   // 左目ソケット
ctx.fillRect(x+19,y+2,9,9);   // 右目ソケット
// 奥行き感（少し薄い影）
ctx.fillStyle='#2a2a2a';
ctx.fillRect(x+5, y+3,5,5);
ctx.fillRect(x+20,y+3,5,5);
// 鼻の穴
ctx.fillStyle='#555';ctx.fillRect(x+13,y+10,3,3);ctx.fillRect(x+17,y+10,3,3);
ctx.lineWidth=1;
}

function drawAngrySun(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#FF8C00';ctx.beginPath();ctx.arc(x+16,y+16,14,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return}
const _apuls=1+Math.sin(G.frame*0.12)*0.07;ctx.save();ctx.translate(x+16,y+16);ctx.scale(_apuls,_apuls);
ctx.strokeStyle='#FF6600';ctx.lineWidth=3;for(let i=0;i<8;i++){const _aa=i*Math.PI/4+(G.frame*0.02);ctx.beginPath();ctx.moveTo(Math.cos(_aa)*13,Math.sin(_aa)*13);ctx.lineTo(Math.cos(_aa)*21,Math.sin(_aa)*21);ctx.stroke();}
const _asg=ctx.createRadialGradient(0,0,0,0,0,13);_asg.addColorStop(0,'#FFE040');_asg.addColorStop(0.7,'#FFB800');_asg.addColorStop(1,'#FF7700');ctx.fillStyle=_asg;ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#222';ctx.beginPath();ctx.arc(-4,-2,2.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4,-2,2.5,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,-6);ctx.lineTo(-2,-4);ctx.stroke();ctx.beginPath();ctx.moveTo(7,-6);ctx.lineTo(2,-4);ctx.stroke();
ctx.beginPath();ctx.moveTo(-5,4);ctx.lineTo(-2,6);ctx.lineTo(2,6);ctx.lineTo(5,4);ctx.stroke();
ctx.restore();ctx.lineWidth=1;}

function drawChuck(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#3a7f3a';ctx.fillRect(x+2,y+2,e.w-4,e.h-4);ctx.globalAlpha=1;return}
const dir=e.facing||1;
ctx.fillStyle='#2d6b2d';ctx.fillRect(x+3,y+e.h*0.38,e.w-6,e.h*0.62-2);
ctx.fillStyle='#4a9a4a';ctx.beginPath();ctx.arc(x+e.w/2,y+e.h*0.26,e.w/2-2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#8B0000';ctx.beginPath();ctx.arc(x+e.w/2,y+e.h*0.16,e.w/2-2,Math.PI,0);ctx.fill();
ctx.fillStyle='#FFD700';ctx.fillRect(x+4,y+e.h*0.22,e.w-8,3);
const _cex=dir>0?x+e.w/2+3:x+e.w/2-7;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(_cex,y+e.h*0.26,3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#222';ctx.beginPath();ctx.arc(_cex+(dir>0?1:-1),y+e.h*0.26,1.8,0,Math.PI*2);ctx.fill();
if(e.state==='charge'){ctx.fillStyle='#2d6b2d';ctx.fillRect(dir>0?x+e.w-2:x-6,y+e.h*0.4,8,6);}
const _chp=e.hp||3;if(_chp<3){ctx.fillStyle='rgba(255,80,0,0.9)';for(let i=0;i<3-_chp;i++)ctx.fillRect(x+i*7,y-7,6,4);}
const _cwf=e.walkFrame||0;ctx.fillStyle='#1e4f1e';ctx.fillRect(x+3,y+e.h-8+(_cwf===0?2:0),8,8);ctx.fillRect(x+e.w-11,y+e.h-8+(_cwf===1?2:0),8,8);}

function drawFirePlant(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#2d7a2d';ctx.fillRect(x+9,y+8,6,e.h-8);ctx.globalAlpha=1;return}
ctx.fillStyle='#27ae60';ctx.fillRect(x+9,y+e.h-TILE+2,6,TILE-2);
ctx.fillStyle='#2ecc71';ctx.fillRect(x,y+e.h-TILE+6,10,5);ctx.fillRect(x+14,y+e.h-TILE+6,10,5);
const rot=G.frame*0.05;
for(let i=0;i<4;i++){const a=rot+i*Math.PI/2;const px=x+12+Math.cos(a)*7,py=y+10+Math.sin(a)*7;
ctx.fillStyle=i%2===0?'#e74c3c':'#ff8c00';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill()}
ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(x+12,y+10,5,0,Math.PI*2);ctx.fill();}

function drawPlantFireball(e){if(e.state==='dead')return;ctx.save();
const gd=ctx.createRadialGradient(e.x+7,e.y+7,0,e.x+7,e.y+7,9);
gd.addColorStop(0,'#fff');gd.addColorStop(0.4,'#ff8c00');gd.addColorStop(1,'rgba(255,50,0,0)');
ctx.fillStyle=gd;ctx.beginPath();ctx.arc(e.x+7,e.y+7,9,0,Math.PI*2);ctx.fill();ctx.restore();}

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

function drawCactus(e){
const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.45;ctx.fillStyle='#2d7a2d';ctx.fillRect(x+8,y+12,16,20);ctx.globalAlpha=1;return;}
const af=e.walkFrame===0?0:2;
// Arms
ctx.fillStyle='#2d7a2d';ctx.fillRect(x,y+10+af,12,8);ctx.fillRect(x+20,y+12-af,12,8);
// Body (extends to full height)
ctx.fillRect(x+8,y+4,16,e.h-4);
// Spikes
ctx.fillStyle='#1a5c1a';
ctx.beginPath();ctx.moveTo(x+14,y-2);ctx.lineTo(x+18,y+6);ctx.lineTo(x+10,y+6);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x,y+10+af);ctx.lineTo(x-4,y+14+af);ctx.lineTo(x,y+18+af);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+32,y+12-af);ctx.lineTo(x+36,y+16-af);ctx.lineTo(x+32,y+20-af);ctx.closePath();ctx.fill();
// Stripe (extends to full height)
ctx.fillStyle='#1f6e1f';ctx.fillRect(x+10,y+8,4,e.h-8);
// Eyes
ctx.fillStyle='#000';ctx.fillRect(x+10,y+10,4,4);ctx.fillRect(x+19,y+10,4,4);}

function drawLakitu(e){
const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.4;ctx.fillStyle='#dde';ctx.beginPath();ctx.arc(x+18,y+26,12,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return;}
// Cloud
ctx.fillStyle='#e8e8f8';
ctx.beginPath();ctx.arc(x+8,y+28,9,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+20,y+22,13,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+32,y+28,9,0,Math.PI*2);ctx.fill();
ctx.fillRect(x+2,y+28,36,10);
// Shell
ctx.fillStyle='#4a7c2f';ctx.fillRect(x+9,y+14,18,12);
// Head
ctx.fillStyle='#c8a050';ctx.fillRect(x+11,y+4,16,12);
// Glasses
ctx.fillStyle='#222';ctx.fillRect(x+12,y+6,5,5);ctx.fillRect(x+19,y+6,5,5);ctx.fillRect(x+17,y+8,2,2);
// Fishing rod
ctx.fillStyle='#8b6914';ctx.fillRect(x+24,y+8,3,20);ctx.fillRect(x+24,y+8,18,3);
// Dangling koopa shell
ctx.fillStyle='#d4a020';ctx.fillRect(x+37,y+6,9,7);ctx.fillStyle='#4a7c2f';ctx.fillRect(x+36,y+10,11,5);}

function drawShyGuy(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.fillStyle='#a01818';ctx.fillRect(x+2,y+TILE-8,TILE-4,8);ctx.fillStyle='#c02020';ctx.fillRect(x+4,y+TILE-6,TILE-8,4);return;}
const col=e.variant==='blue'?'#2060c0':e.variant==='green'?'#2a9a3a':'#c02020';
const colD=e.variant==='blue'?'#103060':e.variant==='green'?'#176020':'#801010';
// ローブ本体
ctx.fillStyle=col;ctx.fillRect(x+3,y+10,TILE-6,TILE-14);
// ローブ裾（波）
ctx.fillStyle=colD;ctx.fillRect(x+3,y+TILE-6,TILE-6,2);
// フード上部
ctx.fillStyle=col;ctx.beginPath();ctx.arc(x+TILE/2,y+10,11,Math.PI,0);ctx.fill();
ctx.fillStyle=colD;ctx.fillRect(x+3,y+9,TILE-6,2);
// マスク
ctx.fillStyle='#f5ecd4';ctx.fillRect(x+7,y+6,TILE-14,12);
ctx.fillStyle='#d4c9a8';ctx.fillRect(x+7,y+16,TILE-14,2);
// 目
ctx.fillStyle='#000';ctx.fillRect(x+10,y+9,3,4);ctx.fillRect(x+TILE-13,y+9,3,4);
// 口
ctx.fillStyle='#000';ctx.fillRect(x+12,y+14,TILE-24,2);
// 足
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillStyle='#4a2010';ctx.fillRect(x+4+fo[0],y+TILE-4,8,4);ctx.fillRect(x+TILE-12+fo[1],y+TILE-4,8,4);
}

function drawRex(e){const x=e.x,y=e.y,h=e.h,facing=e.facing||-1;
if(e.state==='dead'){ctx.fillStyle='#6a3caa';ctx.fillRect(x+2,y+h-6,e.w-4,6);return;}
const hurt=e.rexHurt;
// 体
ctx.fillStyle='#6a3caa';ctx.fillRect(x+2,y+h*0.35,e.w-4,h*0.5);
ctx.fillStyle='#884ccc';ctx.fillRect(x+4,y+h*0.4,e.w-8,h*0.4);
// 背びれ（2個または1個）
ctx.fillStyle='#c070dd';
if(!hurt){ctx.beginPath();ctx.moveTo(x+10,y+h*0.35);ctx.lineTo(x+14,y+4);ctx.lineTo(x+18,y+h*0.35);ctx.fill();
ctx.beginPath();ctx.moveTo(x+e.w-18,y+h*0.35);ctx.lineTo(x+e.w-14,y+6);ctx.lineTo(x+e.w-10,y+h*0.35);ctx.fill();}
else{ctx.beginPath();ctx.moveTo(x+e.w/2-4,y+h*0.35);ctx.lineTo(x+e.w/2,y+2);ctx.lineTo(x+e.w/2+4,y+h*0.35);ctx.fill();}
// 頭（facing向き）
const hx=facing>=0?x+e.w-12:x;
ctx.fillStyle='#6a3caa';ctx.fillRect(hx,y+h*0.22,12,h*0.35);
ctx.fillStyle='#884ccc';ctx.fillRect(hx+1,y+h*0.26,10,h*0.28);
// 鼻
ctx.fillStyle='#a060c8';
if(facing>=0)ctx.fillRect(hx+10,y+h*0.35,4,5);else ctx.fillRect(hx-2,y+h*0.35,4,5);
// 目
ctx.fillStyle='#fff';ctx.fillRect(hx+(facing>=0?2:6),y+h*0.26,4,4);
ctx.fillStyle='#000';ctx.fillRect(hx+(facing>=0?3:7),y+h*0.27,2,2);
// 牙
ctx.fillStyle='#fff';
if(facing>=0)ctx.fillRect(hx+9,y+h*0.45,2,3);else ctx.fillRect(hx+1,y+h*0.45,2,3);
// 足
const fo=e.walkFrame===0?[-2,2]:[2,-2];
ctx.fillStyle='#4a2078';ctx.fillRect(x+4+fo[0],y+h-4,8,4);ctx.fillRect(x+e.w-12+fo[1],y+h-4,8,4);
}

function drawBobomb(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.fillStyle='#2a2a2a';ctx.fillRect(x+2,y+TILE-6,TILE-4,6);return;}
const lit=e.state==='lit';
const flash=lit&&(e.litTimer<60?e.litTimer%6<3:e.litTimer%12<6);
// 体
ctx.fillStyle=flash?'#ff4400':'#1a1a1a';
ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.4,0,Math.PI*2);ctx.fill();
ctx.fillStyle=flash?'#ff8844':'#333';
ctx.beginPath();ctx.arc(x+TILE*0.42,y+TILE*0.5,5,0,Math.PI*2);ctx.fill();
// 導火線
ctx.fillStyle='#aaa';ctx.fillRect(x+TILE/2-1,y+4,2,8);
// 火花（点火時）
if(lit){ctx.fillStyle=`hsl(${Math.random()*60},100%,${50+Math.random()*30}%)`;
ctx.beginPath();ctx.arc(x+TILE/2,y+2,3+Math.random()*3,0,Math.PI*2);ctx.fill();
for(let i=0;i<3;i++){ctx.fillStyle=`rgba(255,${100+Math.random()*155},0,${Math.random()})`;ctx.fillRect(x+TILE/2-1+Math.random()*4-2,y-2-Math.random()*4,2,2);}}
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+10,y+TILE*0.42,4,5);ctx.fillRect(x+TILE-14,y+TILE*0.42,4,5);
ctx.fillStyle='#000';ctx.fillRect(x+11,y+TILE*0.44,2,3);ctx.fillRect(x+TILE-13,y+TILE*0.44,2,3);
// 足
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillStyle='#f5c040';ctx.fillRect(x+6+fo[0],y+TILE-4,7,4);ctx.fillRect(x+TILE-13+fo[1],y+TILE-4,7,4);
}

function drawSpiny(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.fillStyle='#a82020';ctx.fillRect(x+4,y+TILE-8,TILE-8,8);return;}
// 甲羅（赤・丸型）
ctx.fillStyle='#a82020';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.42,Math.PI,0);ctx.fill();
ctx.fillRect(x+4,y+TILE*0.55,TILE-8,TILE*0.35);
ctx.fillStyle='#d03030';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.3,Math.PI,0);ctx.fill();
// トゲ（背中に6本）
ctx.fillStyle='#fff';
for(let i=0;i<5;i++){const sx=x+5+i*5;
ctx.beginPath();ctx.moveTo(sx,y+TILE*0.45);ctx.lineTo(sx+2,y+3);ctx.lineTo(sx+4,y+TILE*0.45);ctx.closePath();ctx.fill();}
// 頭（甲羅の下から覗く）
ctx.fillStyle='#f5c080';ctx.fillRect(x+TILE*0.3,y+TILE*0.72,TILE*0.4,TILE*0.2);
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+9,y+TILE*0.72,4,4);ctx.fillRect(x+TILE-13,y+TILE*0.72,4,4);
ctx.fillStyle='#000';ctx.fillRect(x+10,y+TILE*0.74,2,3);ctx.fillRect(x+TILE-12,y+TILE*0.74,2,3);
// 足
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillStyle='#e09030';ctx.fillRect(x+5+fo[0],y+TILE-4,7,4);ctx.fillRect(x+TILE-12+fo[1],y+TILE-4,7,4);
}

function drawSpikeTop(e){const x=e.x,y=e.y;
// 天井這い：殻が上、体が下
// 殻（硬い茶色）
ctx.fillStyle='#6b3410';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.42,0,Math.PI);ctx.fill();
ctx.fillRect(x+4,y+TILE*0.2,TILE-8,TILE*0.35);
ctx.fillStyle='#8b4a1a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.3,0,Math.PI);ctx.fill();
// トゲ（下向き5本）
ctx.fillStyle='#fff';
for(let i=0;i<5;i++){const sx=x+5+i*5;
ctx.beginPath();ctx.moveTo(sx,y+TILE*0.65);ctx.lineTo(sx+2,y+TILE-3);ctx.lineTo(sx+4,y+TILE*0.65);ctx.closePath();ctx.fill();}
// 頭（上）
ctx.fillStyle='#f5c080';ctx.fillRect(x+TILE*0.3,y+4,TILE*0.4,TILE*0.2);
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+9,y+6,4,4);ctx.fillRect(x+TILE-13,y+6,4,4);
ctx.fillStyle='#000';ctx.fillRect(x+10,y+7,2,3);ctx.fillRect(x+TILE-12,y+7,2,3);
// 脚（上・天井に吸着）
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillStyle='#a8602a';ctx.fillRect(x+5+fo[0],y,7,5);ctx.fillRect(x+TILE-12+fo[1],y,7,5);
}

function drawPokey(e){const x=e.x,y=e.y;
const segs=e.segments||3;
// 体（黄色いサボテン、複数段）
for(let i=0;i<segs;i++){
  const sy=y+i*TILE;
  ctx.fillStyle='#e5c84a';ctx.beginPath();ctx.arc(x+TILE/2,sy+TILE/2,TILE*0.42,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f5d85a';ctx.beginPath();ctx.arc(x+TILE/2,sy+TILE/2,TILE*0.32,0,Math.PI*2);ctx.fill();
  // トゲ
  ctx.fillStyle='#8b6420';
  for(let j=0;j<4;j++){const a=(j/4)*Math.PI*2+(i%2)*0.4;const px=x+TILE/2+Math.cos(a)*TILE*0.4;const py=sy+TILE/2+Math.sin(a)*TILE*0.4;
  ctx.beginPath();ctx.moveTo(px-2,py-2);ctx.lineTo(px+Math.cos(a)*5,py+Math.sin(a)*5);ctx.lineTo(px+2,py+2);ctx.closePath();ctx.fill();}
}
// 頭（顔、最上段）
const headY=y;
ctx.fillStyle='#000';ctx.fillRect(x+10,headY+8,4,5);ctx.fillRect(x+TILE-14,headY+8,4,5);
ctx.fillStyle='#f5d85a';ctx.fillRect(x+11,headY+9,2,3);ctx.fillRect(x+TILE-13,headY+9,2,3);
// 口
ctx.fillStyle='#7a2020';ctx.fillRect(x+12,headY+18,TILE-24,3);
}

function drawFuzzy(e){const x=e.x,y=e.y;
const pulse=1+Math.sin(G.frame*0.2)*0.1;
// レール表示（簡易・うす線）
if(e.railX1!==undefined){
  ctx.strokeStyle='rgba(120,120,140,0.3)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(e.railX1+TILE/2,e.railY1+TILE/2);ctx.lineTo(e.railX2+TILE/2,e.railY2+TILE/2);ctx.stroke();
  ctx.setLineDash([]);
}
// 本体（黒い毛玉）
ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE/2,TILE*0.4*pulse,0,Math.PI*2);ctx.fill();
// 毛のギザギザ
ctx.fillStyle='#2a2a2a';
for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2+G.frame*0.03;
const px=x+TILE/2+Math.cos(a)*TILE*0.44*pulse;const py=y+TILE/2+Math.sin(a)*TILE*0.44*pulse;
ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fill();}
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+10,y+10,5,5);ctx.fillRect(x+TILE-15,y+10,5,5);
ctx.fillStyle='#000';ctx.fillRect(x+11,y+11,3,3);ctx.fillRect(x+TILE-14,y+11,3,3);
}

function drawMontyMole(e){const x=e.x,y=e.y;
if(e.state==='hidden'){
  // 土の盛り上がり
  ctx.fillStyle='#8b5a2a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.8,TILE*0.5,Math.PI,0);ctx.fill();
  ctx.fillStyle='#5a3a1a';
  for(let i=0;i<4;i++)ctx.fillRect(x+6+i*5,y+TILE-8,3,4);
  return;
}
if(e.state==='emerge'){
  // 半分顔を出す
  const _h=Math.max(0,1-(e.emergeT||0)/30);
  ctx.fillStyle='#8b5a2a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.8,TILE*0.5,Math.PI,0);ctx.fill();
  ctx.fillStyle='#6a4020';ctx.fillRect(x+6,y+TILE-TILE*_h,TILE-12,TILE*_h);
  ctx.fillStyle='#3a2410';ctx.fillRect(x+10,y+TILE-TILE*_h+4,5,4);ctx.fillRect(x+TILE-15,y+TILE-TILE*_h+4,5,4);
  return;
}
if(e.state==='dead'){ctx.fillStyle='#6a4020';ctx.fillRect(x+2,y+TILE-6,TILE-4,6);return;}
// 歩き状態（茶色モグラ）
ctx.fillStyle='#6a4020';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.42,Math.PI,0);ctx.fill();
ctx.fillRect(x+4,y+TILE*0.5,TILE-8,TILE*0.4);
ctx.fillStyle='#8b5a2a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.5,TILE*0.32,Math.PI,0);ctx.fill();
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+9,y+TILE*0.35,4,4);ctx.fillRect(x+TILE-13,y+TILE*0.35,4,4);
ctx.fillStyle='#000';ctx.fillRect(x+10,y+TILE*0.38,2,3);ctx.fillRect(x+TILE-12,y+TILE*0.38,2,3);
// 鼻
ctx.fillStyle='#d0807a';
if((e.facing||-1)<0)ctx.fillRect(x+2,y+TILE*0.5,5,4);else ctx.fillRect(x+TILE-7,y+TILE*0.5,5,4);
// 爪
ctx.fillStyle='#fff';
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillRect(x+5+fo[0],y+TILE-4,7,4);ctx.fillRect(x+TILE-12+fo[1],y+TILE-4,7,4);
}

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
if(G.state==='intro'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 24px "Press Start 2P",monospace';ctx.textAlign='center';
const _introTitle=G.isExStage?`EXTRA STAGE-${G.exStageNum||1}`:`WORLD  ${G.currentWorld}-${G.currentLevel}`;
ctx.fillText(_introTitle,W/2,H/2-40);
const _wNames={1:'PLAINS',2:'DESERT',3:'SEASIDE',4:'MOUNTAIN',5:'OCEAN',6:'ICE LAND',7:'FORTRESS',8:'AIRSHIP'};
const _wn=G.isExStage?(G.exStageNum===2?'SPACE':'CHALLENGE'):(_wNames[G.currentWorld]||'');const _wnAlpha=Math.min(1,(120-G.introTimer)/20);ctx.globalAlpha=_wnAlpha;ctx.fillStyle='#FFD700';ctx.font='bold 10px "Press Start 2P",monospace';ctx.fillText(`- ${_wn} -`,W/2,H/2-14);ctx.globalAlpha=1;
ctx.fillStyle='#fff';ctx.font='14px "Press Start 2P",monospace';ctx.fillText(`x ${G.lives}`,W/2+30,H/2+20);ctx.fillStyle='#E52521';ctx.fillRect(W/2-20,H/2+6,16,10);ctx.fillStyle='#FBD000';ctx.fillRect(W/2-18,H/2+16,12,6);ctx.textAlign='left';ctx.restore();return}
drawBG();
// 天候エフェクト
{const _wS=getStage(G.currentWorld,G.currentLevel);const _wt=_wS?.bgTheme;
if(_wt==='mountain'||_wt==='mountain_castle'||_wt==='airship'){
  // 雨
  ctx.strokeStyle='rgba(180,200,255,0.4)';ctx.lineWidth=1;
  for(let _ri=0;_ri<40;_ri++){const _rx=((_ri*73+G.frame*3)%W);const _ry=((_ri*137+G.frame*8)%H);ctx.beginPath();ctx.moveTo(_rx,_ry);ctx.lineTo(_rx-2,_ry+12);ctx.stroke();}
}
if(_wt==='airship'){
  // 稲光フラッシュ（既存BGの補強：まれに画面全体が白くなる）
  if(G.frame%600<2){ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(0,0,W,H);}
}}
ctx.save();ctx.translate(-G.cam,0);
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
if(G.checkpoint2)drawCheckpoint(G.checkpoint2);
// Piranhas (drawn before pipes so pipe covers them when inside)
for(const pr of piranhas)if(pr.alive)drawPiranha(pr);
for(const p of pipes){if(p.x+p.w<G.cam-10||p.x>G.cam+W+10)continue;drawPipe(p.x,p.y,p.w,p.h,p.ceiling,p.color);
if(p.isExit){ctx.fillStyle='rgba(255,255,100,'+(0.5+Math.sin(G.frame*0.08)*0.4)+')';ctx.font='bold 14px monospace';ctx.textAlign='center';ctx.fillText('▼ EXIT',p.x+p.w/2,p.y-6);ctx.textAlign='left'}if(p.isGoalPipe){ctx.fillStyle='rgba(255,215,0,'+(0.6+Math.sin(G.frame*0.1)*0.35)+')';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText('★',p.x+p.w/2,p.y-8);ctx.textAlign='left'}}
// Gravity zones
for(const gz of gravityZones){if(gz.x+gz.w<G.cam||gz.x>G.cam+W)continue;
ctx.fillStyle='rgba(160,80,255,0.08)';ctx.fillRect(gz.x,gz.y,gz.w,gz.h);
ctx.strokeStyle='rgba(160,80,255,0.35)';ctx.lineWidth=2;ctx.setLineDash([8,8]);ctx.strokeRect(gz.x,gz.y,gz.w,gz.h);ctx.setLineDash([]);ctx.lineWidth=1;
// 矢印（上向き）
const _gzCx=gz.x+gz.w/2,_gzCy=gz.y+gz.h/2;
ctx.fillStyle='rgba(160,80,255,0.3)';ctx.beginPath();ctx.moveTo(_gzCx,_gzCy-20);ctx.lineTo(_gzCx-10,_gzCy);ctx.lineTo(_gzCx+10,_gzCy);ctx.fill();}
// Wind zones
for(const wz of windZones){if(wz.x+wz.w<G.cam||wz.x>G.cam+W)continue;
ctx.fillStyle='rgba(200,220,255,0.06)';ctx.fillRect(wz.x,wz.y,wz.w,wz.h);}
// Wind particles
for(const wp of windParticles){ctx.globalAlpha=Math.max(0,wp.life);ctx.fillStyle='rgba(220,240,255,0.7)';ctx.fillRect(wp.x,wp.y,wp.size*3,wp.size*0.5);ctx.globalAlpha=1;}
// Chasing wall
if(G.chasingWall&&G.chasingWall.active){const cw=G.chasingWall;
const cwg=ctx.createLinearGradient(cw.x-40,0,cw.x,0);cwg.addColorStop(0,'rgba(0,0,0,1)');cwg.addColorStop(0.6,'rgba(80,0,0,0.95)');cwg.addColorStop(1,'rgba(200,60,0,0.8)');
ctx.fillStyle=cwg;ctx.fillRect(cw.x-W*2,0,W*2,H);
// 先端の炎エフェクト
for(let fy=0;fy<H;fy+=12){const fw=6+Math.random()*10;ctx.fillStyle=`rgba(255,${100+Math.random()*155},0,${0.5+Math.random()*0.5})`;ctx.fillRect(cw.x-2,fy,fw,8+Math.random()*6);}}
// Cannons
for(const cn of cannons){if(cn.x+cn.w<G.cam-10||cn.x>G.cam+W+10)continue;
if(cn.dead){
  // 破壊済み：傾いてひびが入った残骸
  ctx.save();ctx.translate(cn.x+cn.w/2,cn.y+cn.h);ctx.rotate(0.28);
  ctx.fillStyle='#2a2a2a';ctx.fillRect(-cn.w/2,-cn.h,cn.w,cn.h);
  ctx.fillStyle='#3a3a3a';ctx.fillRect(-cn.w/2+2,-cn.h+2,cn.w-4,cn.h-4);
  ctx.strokeStyle='#666';ctx.lineWidth=1;ctx.setLineDash([2,3]);
  ctx.beginPath();ctx.moveTo(-5,-cn.h+4);ctx.lineTo(3,-cn.h/2-2);ctx.lineTo(-1,-6);ctx.stroke();
  ctx.beginPath();ctx.moveTo(4,-cn.h+10);ctx.lineTo(-2,-cn.h/2+4);ctx.stroke();
  ctx.setLineDash([]);ctx.restore();
  // 煙エフェクト
  if(G.frame%6<3){ctx.fillStyle=`rgba(60,60,60,${0.3+Math.random()*0.3})`;ctx.beginPath();const _sr=3+Math.random()*4;ctx.arc(cn.x+cn.w/2-4,cn.y-_sr,_sr,0,Math.PI*2);ctx.fill();}
}else{
  // 通常：HPに応じてボディ色が赤みがかる
  const _dmg=cn.hp!==undefined?(5-cn.hp):0;
  const _rc=Math.min(0x1a+_dmg*0x0f,0x5a);
  ctx.fillStyle=`rgb(${_rc},${Math.max(0x1a-_dmg*8,0)},${Math.max(0x1a-_dmg*8,0)})`;ctx.fillRect(cn.x,cn.y,cn.w,cn.h);
  ctx.fillStyle=`rgb(${_rc+0x19},${Math.max(0x33-_dmg*10,0)},${Math.max(0x33-_dmg*10,0)})`;ctx.fillRect(cn.x+2,cn.y+2,cn.w-4,cn.h-4);
  ctx.fillStyle='#888';ctx.beginPath();ctx.arc(cn.x+cn.w/2,cn.y+14,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#333';ctx.fillRect(cn.x+cn.w/2-4,cn.y+10,3,3);ctx.fillRect(cn.x+cn.w/2+1,cn.y+10,3,3);
  if(cn.timer<10){ctx.fillStyle=`rgba(255,${150+Math.random()*100},0,${0.5+Math.random()*0.5})`;ctx.beginPath();ctx.arc(cn.x+cn.w/2,cn.y-4,8+Math.random()*4,0,Math.PI*2);ctx.fill();}
}}
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
// Ice balls
for(const ib of iceBalls){if(!ib.alive)continue;const ix=Math.round(ib.x),iy=Math.round(ib.y);ctx.fillStyle='#88ddff';ctx.beginPath();ctx.arc(ix+6,iy+6,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ccf0ff';ctx.beginPath();ctx.arc(ix+6,iy+5,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ix+4,iy+4,2,0,Math.PI*2);ctx.fill();}
// Mario hammers
for(const mh of marioHammers){if(!mh.alive)continue;ctx.save();ctx.translate(mh.x+8,mh.y+8);ctx.rotate(mh.rot);ctx.fillStyle='#8B4513';ctx.fillRect(-3,0,6,12);ctx.fillStyle='#aaa';ctx.fillRect(-7,-7,14,9);ctx.fillStyle='#ccc';ctx.fillRect(-5,-5,10,5);ctx.restore();}
// Frozen enemy overlay
for(const e of enemies){if(!e.alive||!e.frozen)continue;const sx=e.shakeX||0;ctx.globalAlpha=0.5;ctx.fillStyle='#88ddff';ctx.fillRect(e.x-2+sx,e.y-2,e.w+4,e.h+4);ctx.globalAlpha=0.3;ctx.fillStyle='#fff';ctx.fillRect(e.x+sx,e.y,e.w,e.h);ctx.globalAlpha=1;
ctx.strokeStyle='#44aaff';ctx.lineWidth=2;ctx.strokeRect(e.x-2+sx,e.y-2,e.w+4,e.h+4);ctx.lineWidth=1;}
// Yoshi items (eggs hatching)
for(const yi of yoshiItems)drawYoshiEggItem(yi);
// Yoshi egg projectiles
for(const eg of yoshiEggs)if(eg.alive)drawYoshiEggProj(eg);
// Coins
for(const c of coinItems){if(c.collected||c._psHidden)continue;if(c.type==='firecoin'){if(c.x+14>=G.cam&&c.x<=G.cam+W)drawFireCoin(c.x,c.y);continue}if(c.type==='frozendrop'){if(c.x+16>=G.cam&&c.x<=G.cam+W)drawCoinItem(c.x,c.y);continue}if(c.pop){drawCoinItem(c.x,c.popY);continue}if(c.x+TILE<G.cam||c.x>G.cam+W)continue;drawCoinItem(c.x,c.y)}
// P-Switch coins (bricks turned into coins)
if(G._psCoins){for(const pc of G._psCoins){if(pc.collected)continue;if(pc.x+TILE<G.cam||pc.x>G.cam+W)continue;drawCoinItem(pc.x,pc.y);}}
// Enemies
for(const e of enemies){if(!e.alive||e.x+e.w<G.cam-10||e.x>G.cam+W+10)continue;const _sx=e.shakeX||0;if(_sx)e.x+=_sx;
if(e.type==='koopa'||e.type==='parakoopa'||e.type==='parakoopaR')drawKoopa(e);else if(e.type==='buzzy')drawBuzzy(e);else if(e.type==='hammerBro')drawHammerBro(e);else if(e.type==='cactus')drawCactus(e);else if(e.type==='lakitu')drawLakitu(e);else if(e.type==='cheepH'||e.type==='cheepV')drawCheep(e);else if(e.type==='firePlant')drawFirePlant(e);else if(e.type==='plantFire')drawPlantFireball(e);else if(e.type==='penguin')drawPenguin(e);else if(e.type==='teresa')drawTeresa(e);else if(e.type==='thwomp')drawThwomp(e);else if(e.type==='blooper')drawBlooper(e);else if(e.type==='dryBones')drawDryBones(e);else if(e.type==='angrySun')drawAngrySun(e);else if(e.type==='chuck')drawChuck(e);else if(e.type==='shyGuy')drawShyGuy(e);else if(e.type==='rex')drawRex(e);else if(e.type==='bobomb')drawBobomb(e);else if(e.type==='spiny')drawSpiny(e);else if(e.type==='spikeTop')drawSpikeTop(e);else if(e.type==='pokey')drawPokey(e);else if(e.type==='fuzzy')drawFuzzy(e);else if(e.type==='montyMole')drawMontyMole(e);
else drawGoomba(e.x,e.y,e.state==='dead',e.walkFrame);if(_sx)e.x-=_sx;}
if(G.currentLevel!==3&&!G.ugMode&&flagPole.x-G.cam>-200&&flagPole.x-G.cam<W+200)drawFlag();
// Bowser
if(bowser.alive&&bowser.x+bowser.w>G.cam-10&&bowser.x<G.cam+W+10){
const bx=Math.round(bowser.x),by=Math.round(bowser.y);
const flash=bowser.hurtTimer>0&&bowser.hurtTimer%6<3;
if(bowser.state==='dead')ctx.globalAlpha=Math.max(0,bowser.deadTimer/160);
if(flash)ctx.globalAlpha=0.35;
// Phase2 赤オーラ
if(bowser.phase===2&&bowser.state!=='dead'){
  const _aura=0.18+Math.sin(G.frame*0.15)*0.08;
  ctx.fillStyle=`rgba(255,40,0,${_aura})`;
  ctx.beginPath();ctx.arc(bx+bowser.w/2,by+bowser.h/2,50+Math.sin(G.frame*0.1)*6,0,Math.PI*2);ctx.fill();
}
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
ctx.fillStyle=bowser.phase===2?'#ff4400':'#e74c3c';ctx.fillRect(hpX,hpY,Math.max(0,hpW*(bowser.hp/bowser.maxHp)),10);
ctx.strokeStyle=bowser.phase===2?'#ff8800':'#fff';ctx.lineWidth=1;ctx.strokeRect(hpX-1,hpY-1,hpW+2,12);
ctx.fillStyle=bowser.phase===2?(G.frame%10<5?'#ff4400':'#fff'):'#fff';ctx.font='6px "Press Start 2P"';ctx.textAlign='center';ctx.fillText(bowser.phase===2?'BOWSER !!':'BOWSER',bx+bowser.w/2,hpY-5);ctx.textAlign='left';}
}
// Bowser shockwaves
for(const sw of bowserShockwaves){if(!sw.alive)continue;
const sx=Math.round(sw.x-sw.w/2-G.cam),sy=Math.round(sw.y);
if(sx+sw.w<-10||sx>W+10)continue;
const _swAlpha=Math.min(1,sw.timer/30);
ctx.globalAlpha=_swAlpha;
ctx.fillStyle='#ff4400';ctx.fillRect(sx,sy+4,sw.w,sw.h-4);
ctx.fillStyle='#ff8800';ctx.fillRect(sx+2,sy+2,sw.w-4,sw.h-6);
ctx.fillStyle='#ffcc00';ctx.fillRect(sx+6,sy+6,sw.w-12,sw.h-10);
// 衝撃波の火花
if(G.frame%3===0){ctx.fillStyle='#ffee44';ctx.fillRect(sx+Math.random()*sw.w,sy-4+Math.random()*8,4,4);}
ctx.globalAlpha=1;}
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
// Yoshi body (behind Mario)
if(yoshi.alive)drawYoshiBody(yoshi.x,yoshi.y,yoshi.facing,yoshi.mounted)
// 残像エフェクト
{const _my=yoshi.mounted&&yoshi.alive?mario.y-12:mario.y;
const _isDash2=(keys['ShiftLeft']||keys['ShiftRight']||btn.dash||gpad.b)&&Math.abs(mario.vx)>4;
if(G.starTimer>0||_isDash2){G.afterimages.push({x:mario.x,y:_my,facing:mario.facing,wf:mario.walkFrame,big:mario.big,alpha:0.35});if(G.afterimages.length>5)G.afterimages.shift();}else{G.afterimages.length=0;}
for(const _ai of G.afterimages){ctx.globalAlpha=_ai.alpha;_ai.alpha*=0.8;if(G.starTimer>0){const _hue=(G.frame*8+G.afterimages.indexOf(_ai)*50)%360;ctx.fillStyle=`hsl(${_hue},100%,60%)`;}drawMario(_ai.x,_ai.y,_ai.facing,_ai.wf,false,_ai.big);ctx.globalAlpha=1;}}
// Mario (Mega aura)
if(G.megaTimer>0&&!mario.dead){const _megaHue=(G.frame*6)%360;ctx.fillStyle=`hsla(${_megaHue},100%,60%,0.25)`;const _my2=yoshi.mounted&&yoshi.alive?mario.y-12:mario.y;ctx.beginPath();ctx.arc(mario.x+mario.w/2,_my2+mario.h/2,mario.h*0.8+Math.sin(G.frame*0.2)*5,0,Math.PI*2);ctx.fill();
// 拡大描画
ctx.save();const _mcx=mario.x+mario.w/2,_mcy=_my2+mario.h;ctx.translate(_mcx,_mcy);ctx.scale(1.6,1.6);ctx.translate(-_mcx,-_mcy);
drawMario(mario.x,_my2,mario.facing,mario.walkFrame,mario.dead,mario.big);ctx.restore();}else{
drawMario(mario.x,yoshi.mounted&&yoshi.alive?mario.y-12:mario.y,mario.facing,mario.walkFrame,mario.dead,mario.big);}
// Yoshi head (in front of Mario)
if(yoshi.alive)drawYoshiHead(yoshi.x,yoshi.y,yoshi.facing);
drawParticles();ctx.restore();
// === ピノキオ部屋の描画 ===
if(G.pinoRoom&&G.state==='play'){
  // 宝箱：一番近いものをハイライト選択
  let _selChest=null;
  if(!G.chestOpened){
    let _sdist=90;
    for(const p of platforms){
      if(p.type!=='chest'||p.opened)continue;
      const _d=Math.abs(mario.x+mario.w/2-(p.x+p.w/2));
      if(_d<_sdist){_sdist=_d;_selChest=p;}
    }
  }
  // 宝箱の描画
  for(const p of platforms){
    if(p.type!=='chest')continue;
    const _cx=p.x-G.cam,_cy=p.y;
    const _isSel=(_selChest===p);
    // 選択グロー
    if(_isSel&&!p.opened){
      const _ga=0.35+Math.sin(G.frame*0.18)*0.2;
      ctx.fillStyle=`rgba(255,215,0,${_ga})`;ctx.fillRect(_cx-6,_cy-6,p.w+12,p.h+12);
    }
    ctx.fillStyle=p.opened?'#8B6914':'#c8861a';ctx.fillRect(_cx,_cy,p.w,p.h);
    ctx.strokeStyle=(_isSel&&!p.opened)?'#FFD700':'#5c3d00';ctx.lineWidth=2;ctx.strokeRect(_cx,_cy,p.w,p.h);
    ctx.fillStyle='#5c3d00';ctx.fillRect(_cx,_cy+p.h/2-2,p.w,4);// 仕切り線
    ctx.fillStyle='#FFD700';ctx.fillRect(_cx+p.w/2-6,_cy+p.h/2-8,12,12);// 錠前
    if(p.opened){ctx.fillStyle='rgba(255,200,0,0.6)';ctx.fillRect(_cx,_cy-16,p.w,16);}
    // 番号ラベル（1〜5）
    if(!p.opened){ctx.fillStyle='#fff';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(p.chestIdx+1,_cx+p.w/2,_cy+p.h-4);ctx.textAlign='left';}
    ctx.lineWidth=1;
  }
  // 選択宝箱の上に「↑ OPEN」プロンプト
  if(_selChest&&!_selChest.opened&&!G.chestOpened){
    const _px=_selChest.x-G.cam+_selChest.w/2;
    const _py=_selChest.y-10-Math.abs(Math.sin(G.frame*0.12))*5;
    ctx.fillStyle='#FFD700';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
    ctx.fillText('JUMP!',_px,_py);ctx.textAlign='left';
  }
  // EXワープ土管（ピノキオ報酬9）レインボー
  for(const p of pipes){
    if(!p.isExWarp)continue;
    const _px=p.x-G.cam,_py=p.y,_pw=p.w,_ph=p.h;
    const _hue=(G.frame*4)%360;
    // パイプ本体
    ctx.fillStyle=`hsl(${_hue},90%,35%)`;ctx.fillRect(_px,_py,_pw,_ph);
    ctx.fillStyle=`hsl(${(_hue+60)%360},90%,50%)`;ctx.fillRect(_px+4,_py+4,_pw-8,_ph-4);
    ctx.fillStyle=`hsl(${(_hue+30)%360},90%,40%)`;ctx.fillRect(_px+_pw*0.55,_py+4,_pw*0.1,_ph-4);
    // 上部リム（幅広・立体感）
    ctx.fillStyle=`hsl(${(_hue+120)%360},90%,40%)`;ctx.fillRect(_px-4,_py,_pw+8,12);
    ctx.fillStyle=`hsl(${(_hue+150)%360},90%,55%)`;ctx.fillRect(_px-4,_py,_pw+8,6);
    ctx.fillStyle=`hsl(${(_hue+180)%360},90%,30%)`;ctx.fillRect(_px-4,_py+10,_pw+8,2);
    // 星スパーク
    for(let _si=0;_si<4;_si++){const _sa=(_si*Math.PI/2+(G.frame*0.12));const _sx=_px+_pw/2+Math.cos(_sa)*(_pw/2+8);const _sy=_py+_ph*0.4+Math.sin(_sa)*12;ctx.fillStyle=`hsl(${(_hue+_si*60)%360},100%,70%)`;ctx.beginPath();ctx.arc(_sx,_sy,3,0,Math.PI*2);ctx.fill();}
    // EXラベル（白・影付き）
    const _exLbl=p.exNum===2?'EX-2':'EX-1';
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.font='bold 9px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillText(_exLbl,_px+_pw/2+1,_py+_ph*0.55+1);
    ctx.fillStyle='#fff';ctx.fillText(_exLbl,_px+_pw/2,_py+_ph*0.55);ctx.textAlign='left';
  }
  // ゴールフラグポール（ピノキオ報酬8）
  if(G.pinoFlagReady){
    const _fpx=48-G.cam,_fpy=H-TILE*6,_fph=TILE*5;
    // ポール（銀）
    ctx.fillStyle='#bbb';ctx.fillRect(_fpx+6,_fpy,4,_fph);
    ctx.fillStyle='#ddd';ctx.fillRect(_fpx+7,_fpy,2,_fph);
    // 旗（赤白交互にアニメ）
    const _fc=Math.floor(G.frame/12)%2===0?'#E52521':'#fff';
    ctx.fillStyle=_fc;ctx.beginPath();ctx.moveTo(_fpx+10,_fpy+4);ctx.lineTo(_fpx+30,_fpy+14);ctx.lineTo(_fpx+10,_fpy+26);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;ctx.strokeRect(_fpx+6,_fpy,4,_fph);ctx.lineWidth=1;
    // 台座球
    ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(_fpx+8,_fpy,5,0,Math.PI*2);ctx.fill();
    // 台座下
    ctx.fillStyle='#888';ctx.fillRect(_fpx+2,_fpy+_fph,12,6);
    // GOAL文字（点滅）
    if(Math.floor(G.frame/20)%2===0){
      ctx.fillStyle='#FFD700';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
      ctx.fillText('GOAL',_fpx+8,_fpy-10);ctx.textAlign='left';
    }
  }
  // ピノキオエンティティの描画
  if(pinoObj.alive){
    const _ox=pinoObj.x-G.cam,_oy=pinoObj.y;
    const _flip=pinoObj.facing===-1;
    ctx.save();if(_flip){ctx.translate(_ox+pinoObj.w/2,_oy);ctx.scale(-1,1);ctx.translate(-pinoObj.w/2,0);}else{ctx.translate(_ox,_oy);}
    // キノピオ（Toad）- きのこ型の帽子・青いベスト
    // ── キノピオ（可愛いちびデザイン）──
    // きのこ帽子：大きな赤いドーム（頭の大部分を占める）
    ctx.fillStyle='#dd2200';
    ctx.beginPath();ctx.arc(14,6,15,Math.PI,0);ctx.fill();
    ctx.fillRect(0,6,28,10);
    // 帽子のハイライト
    ctx.fillStyle='rgba(255,255,255,0.25)';
    ctx.beginPath();ctx.arc(10,3,5,Math.PI,0);ctx.fill();
    // 白い水玉スポット（大き目で可愛く）
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(7,4,4.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(21,4,4.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(14,0,3,0,Math.PI*2);ctx.fill();
    // スポットのシェーディング
    ctx.fillStyle='rgba(220,220,220,0.4)';
    ctx.beginPath();ctx.arc(8,5,2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(22,5,2,0,Math.PI*2);ctx.fill();
    // 帽子の縁（クリーム色）
    ctx.fillStyle='#fff8e8';ctx.fillRect(0,15,28,4);
    // 帽子縁のシャドウ
    ctx.fillStyle='rgba(0,0,0,0.12)';ctx.fillRect(0,18,28,1);
    // 顔（ぷっくり丸い・クリーム色）
    ctx.fillStyle='#fff8e8';
    ctx.beginPath();ctx.arc(14,26,12,0,Math.PI*2);ctx.fill();
    ctx.fillRect(3,19,22,14);
    // ほっぺ（ピンクのまる）
    ctx.fillStyle='rgba(255,130,130,0.55)';
    ctx.beginPath();ctx.arc(5,27,4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(23,27,4,0,Math.PI*2);ctx.fill();
    // 目（大きな黒い丸目 + 白ハイライト2個）
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.arc(9,24,4.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(19,24,4.5,0,Math.PI*2);ctx.fill();
    // 目の中の青いリング
    ctx.fillStyle='#3366ee';
    ctx.beginPath();ctx.arc(9,24,3,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(19,24,3,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#111';
    ctx.beginPath();ctx.arc(9.5,24,1.8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(19.5,24,1.8,0,Math.PI*2);ctx.fill();
    // 白ハイライト（2か所）
    ctx.fillStyle='#fff';
    ctx.beginPath();ctx.arc(10.5,22.5,1.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(20.5,22.5,1.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(8,25.5,0.7,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(18,25.5,0.7,0,Math.PI*2);ctx.fill();
    // 口（かわいいアーチ笑顔）
    ctx.strokeStyle='#aa3300';ctx.lineWidth=1.5;
    ctx.beginPath();ctx.arc(14,29,4,0.1*Math.PI,0.9*Math.PI);ctx.stroke();ctx.lineWidth=1;
    // 口角のドット
    ctx.fillStyle='#aa3300';
    ctx.beginPath();ctx.arc(10.5,29,1,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(17.5,29,1,0,Math.PI*2);ctx.fill();
    // 胴体（青いベスト・小さくコンパクト）
    ctx.fillStyle='#2255cc';ctx.fillRect(6,32,16,10);
    ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(6,32,16,3);// ハイライト
    // ベルト中央線
    ctx.fillStyle='#fff';ctx.fillRect(13,32,2,10);
    // ボタン（ゴールド）
    ctx.fillStyle='#FFD700';
    ctx.beginPath();ctx.arc(14,35,1.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(14,39,1.5,0,Math.PI*2);ctx.fill();
    // 腕（アイドルアニメ：frame0=通常, frame1=手を振る）
    const _wf=pinoObj.frame;
    ctx.fillStyle='#fff8e8';
    if(_wf===0){// 通常
      ctx.fillRect(-1,33,6,7);ctx.fillRect(23,33,6,7);
      ctx.fillStyle='#fff';ctx.fillRect(-2,39,7,4);ctx.fillRect(23,39,7,4);
    }else{// 手を振る（左腕が上がる）
      ctx.fillRect(-3,27,6,7);ctx.fillRect(23,33,6,7);// 左腕が上
      ctx.fillStyle='#fff';ctx.fillRect(-4,23,7,5);ctx.fillRect(23,39,7,4);// 左手が上
    }
    // 靴（白い丸い靴・左右交互に小bounce）
    ctx.fillStyle='#eeeeff';
    ctx.beginPath();ctx.arc(9,44,5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(19,44,5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#aaaacc';ctx.fillRect(4,44,10,2);ctx.fillRect(14,44,10,2);
    ctx.restore();
    // ★ 吹き出し（大きめ・読みやすいフォント）
    if(G.pinoSpeechText){
      const _lines=G.pinoSpeechText.split('\n');
      const _bw=Math.max(180,_lines.reduce((mx,l)=>Math.max(mx,l.length*7+20),100));
      const _bh=_lines.length*16+14;
      const _bx=Math.max(4,Math.min(W-3*TILE-_bw-8,pinoObj.x-G.cam-_bw/2+14));
      const _by=Math.max(4,pinoObj.y-_bh-16);
      // 影
      ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(_bx+3,_by+3,_bw,_bh);
      // 本体
      ctx.fillStyle='rgba(255,255,230,0.97)';ctx.fillRect(_bx,_by,_bw,_bh);
      ctx.strokeStyle='#bb8800';ctx.lineWidth=2;ctx.strokeRect(_bx,_by,_bw,_bh);ctx.lineWidth=1;
      // 吹き出し三角（ピノキオの位置に合わせて）
      const _tx=Math.max(_bx+10,Math.min(_bx+_bw-20,pinoObj.x-G.cam+14));
      ctx.fillStyle='rgba(255,255,230,0.97)';
      ctx.beginPath();ctx.moveTo(_tx,_by+_bh);ctx.lineTo(_tx+8,_by+_bh+12);ctx.lineTo(_tx+16,_by+_bh);ctx.fill();
      ctx.strokeStyle='#bb8800';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(_tx,_by+_bh-1);ctx.lineTo(_tx+8,_by+_bh+12);ctx.lineTo(_tx+16,_by+_bh-1);ctx.stroke();ctx.lineWidth=1;
      // テキスト
      ctx.fillStyle='#332200';ctx.font='bold 8px "Press Start 2P",monospace';ctx.textAlign='center';
      _lines.forEach((_l,_li)=>ctx.fillText(_l,_bx+_bw/2,_by+13+_li*16));
      ctx.textAlign='left';
    }
  }
  // miniBowser の描画（クッパ Jr. スタイル - 通常クッパと同じデザイン縮小版）
  for(const e of enemies){
    if(!e.alive||e.type!=='miniBowser')continue;
    const _mx=e.x-G.cam,_my=e.y;
    const _hf=e.facing===-1;
    ctx.save();
    if(_hf){ctx.translate(_mx+e.w/2,_my);ctx.scale(-1,1);ctx.translate(-e.w/2,0);}
    else{ctx.translate(_mx,_my);}
    const _flash=e.hurtTimer>0&&Math.floor(G.frame/3)%2===0;
    if(_flash)ctx.globalAlpha=0.35;
    // 甲羅スパイク（通常クッパと同じ三角形スタイル）
    ctx.fillStyle='#7acc7a';
    for(let _s=0;_s<3;_s++){ctx.beginPath();ctx.moveTo(7+_s*12,12);ctx.lineTo(12+_s*12,2);ctx.lineTo(17+_s*12,12);ctx.closePath();ctx.fill();}
    // 甲羅・背中
    ctx.fillStyle=e.hurtTimer>0?'#885500':'#1a6a1a';ctx.fillRect(4,12,40,30);
    // 腹（明るい緑）
    ctx.fillStyle='#3aaa3a';ctx.fillRect(10,22,28,18);
    // 頭（タン色 - 通常クッパと同色）
    ctx.fillStyle='#c8a050';ctx.fillRect(8,0,32,18);
    // 王冠（通常クッパと同じ金色3つ）
    ctx.fillStyle='#FFD700';
    ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(14,-8);ctx.lineTo(18,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(24,-12);ctx.lineTo(28,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(30,0);ctx.lineTo(34,-8);ctx.lineTo(38,0);ctx.fill();
    // 目（赤 - 通常クッパと同じ）
    ctx.fillStyle='#cc1100';ctx.fillRect(10,4,10,7);
    ctx.fillStyle='#000';ctx.fillRect(12,5,6,5);
    ctx.fillStyle='#fff';ctx.fillRect(15,5,3,2);
    // 鼻（茶色）
    ctx.fillStyle='#a06820';ctx.fillRect(10,12,28,5);
    ctx.fillStyle='#000';ctx.fillRect(14,13,4,3);ctx.fillRect(26,13,4,3);
    // 腕（緑）
    ctx.fillStyle='#3a8a3a';ctx.fillRect(0,20,8,14);ctx.fillRect(40,22,8,12);
    // 足（歩きアニメ）
    ctx.fillStyle='#1a5a1a';
    const _lf=e.onGround?(G.frame%18<9?-1:1):0;
    ctx.fillRect(8,42,16,12+_lf);ctx.fillRect(24,42,16,12-_lf);
    // 爪（白）
    ctx.fillStyle='#ddd';ctx.fillRect(6,53,6,4);ctx.fillRect(14,53,4,3);ctx.fillRect(26,53,4,3);ctx.fillRect(34,53,6,4);
    ctx.globalAlpha=1;
    // HP バー
    ctx.fillStyle='#333';ctx.fillRect(0,-16,48,8);
    ctx.fillStyle='#e74c3c';ctx.fillRect(1,-15,Math.max(0,Math.ceil(46*(e.hp/3))),6);
    ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(0,-16,48,8);ctx.lineWidth=1;
    ctx.fillStyle='#FFD700';ctx.font='5px "Press Start 2P",monospace';ctx.textAlign='center';
    ctx.fillText('BOWSER JR',24,-20);ctx.textAlign='left';
    ctx.restore();
  }
}
// === Dark Mode Spotlight ===
if(G.darkMode&&G.state==='play'&&!mario.dead){
const _dmx=mario.x+mario.w/2-G.cam,_dmy=mario.y+mario.h/2;
const _dmR=mario.power==='fire'?180:mario.power==='ice'?170:mario.power==='hammer'?160:G.megaTimer>0?220:130;
const _dmGrad=ctx.createRadialGradient(_dmx,_dmy,0,_dmx,_dmy,_dmR);
_dmGrad.addColorStop(0,'rgba(0,0,0,0)');_dmGrad.addColorStop(0.55,'rgba(0,0,0,0.15)');_dmGrad.addColorStop(0.8,'rgba(0,0,0,0.7)');_dmGrad.addColorStop(1,'rgba(0,0,0,0.94)');
ctx.fillStyle=_dmGrad;ctx.fillRect(0,0,W,H);
// ファイアボールの光源
for(const fb of fireballs){if(!fb.alive)continue;const _fx=fb.x+6-G.cam,_fy=fb.y+6;const _fg=ctx.createRadialGradient(_fx,_fy,0,_fx,_fy,50);_fg.addColorStop(0,'rgba(0,0,0,0)');_fg.addColorStop(1,'rgba(0,0,0,0)');ctx.globalCompositeOperation='destination-out';ctx.fillStyle=_fg;ctx.beginPath();ctx.arc(_fx,_fy,50,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';}
// アイスボールの光源
for(const ib of iceBalls){if(!ib.alive)continue;const _ix=ib.x+6-G.cam,_iy=ib.y+6;ctx.globalCompositeOperation='destination-out';const _ig=ctx.createRadialGradient(_ix,_iy,0,_ix,_iy,40);_ig.addColorStop(0,'rgba(0,0,0,0.7)');_ig.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=_ig;ctx.beginPath();ctx.arc(_ix,_iy,40,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';}
}
if(G.waterMode&&G.state==='play'){ctx.fillStyle='rgba(0,40,120,0.12)';ctx.fillRect(0,0,W,H);}
// === Sandstorm Overlay ===
if(G.sandstormMode&&G.state==='play'&&!mario.dead){
const _sandA=0.08+Math.sin(G.frame*0.008)*0.05+Math.max(0,Math.sin(G.frame*0.003))*0.08;
ctx.fillStyle=`rgba(180,140,60,${_sandA})`;ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(210,170,80,0.45)';for(let i=0;i<40;i++){const sx=((i*137+G.frame*4)%(W+60))-30;const sy=((i*89+G.frame*1.5+i*i*7)%H);ctx.fillRect(sx,sy,2+i%3,1);}
// 突風エフェクト（周期的に砂煙の帯）
if(Math.sin(G.frame*0.006)>0.7){ctx.fillStyle='rgba(200,160,80,0.12)';for(let gy=0;gy<H;gy+=40){ctx.fillRect(0,gy+Math.sin(G.frame*0.02+gy*0.1)*10,W,8);}}}
// === Tide Overlay ===
if(G.tideMode&&G.tideLevel<H&&G.state==='play'){
ctx.fillStyle='rgba(0,60,180,0.18)';ctx.fillRect(0,G.tideLevel,W,H-G.tideLevel);
ctx.strokeStyle='rgba(100,200,255,0.5)';ctx.lineWidth=2;ctx.beginPath();
for(let wx=0;wx<W;wx+=6){const wy=G.tideLevel+Math.sin((wx+G.cam)*0.04+G.frame*0.06)*3;wx===0?ctx.moveTo(wx,wy):ctx.lineTo(wx,wy);}
ctx.stroke();ctx.lineWidth=1;
// 泡パーティクル
ctx.fillStyle='rgba(150,220,255,0.3)';for(let i=0;i<12;i++){const bx=((i*167+G.frame*0.8)%W);const by=G.tideLevel+5+((i*53+G.frame*0.3)%(H-G.tideLevel-10));ctx.beginPath();ctx.arc(bx,by,1+i%2,0,Math.PI*2);ctx.fill();}}
drawScorePopups();
// Combo HUD
if(G.combo>1&&G.comboTimer>0){const _ca=Math.min(1,G.comboTimer/20);const _cs=Math.min(40,16+G.combo*6);const _cc=G.combo>=5?'#FFD700':G.combo>=3?'#ff4400':'#ff6432';ctx.save();ctx.globalAlpha=_ca;ctx.font=`bold ${_cs}px "Press Start 2P",monospace`;ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillText(`x${G.combo} COMBO!`,W/2+2,62);ctx.fillStyle=_cc;ctx.fillText(`x${G.combo} COMBO!`,W/2,60);if(G.combo>=3){ctx.font='bold 12px "Press Start 2P",monospace';ctx.fillStyle='#fff';ctx.fillText(G.combo>=5?'1UP!!':`${Math.pow(2,G.combo)*100}pts`,W/2,60+_cs-4);}ctx.textAlign='left';ctx.restore()}
// Yoshi eat count & star countdown HUD
if(yoshi.alive&&yoshi.mounted&&yoshi.eatCount>0){ctx.fillStyle='#4CAF50';ctx.font='10px "Press Start 2P",monospace';ctx.fillText(`EAT:${yoshi.eatCount}/10`,10,H-10)}
if(G.starTimer>0&&!mario.dead){const hue2=(G.frame*8)%360;ctx.fillStyle=`hsl(${hue2},100%,55%)`;ctx.font='bold 11px "Press Start 2P",monospace';ctx.fillText(`★${Math.ceil(G.starTimer/60)}s`,yoshi.alive&&yoshi.mounted&&yoshi.eatCount>0?120:10,H-10)}
if(G.megaTimer>0&&!mario.dead){const _megaSec=Math.ceil(G.megaTimer/60);const _megaHue=(G.frame*6)%360;ctx.fillStyle=_megaSec<=5?`hsl(0,100%,${50+Math.sin(G.frame*0.3)*20}%)`:`hsl(${_megaHue},100%,55%)`;ctx.font='bold 13px "Press Start 2P",monospace';ctx.fillText(`MEGA ${_megaSec}s`,10,H-26)}
ctx.restore();
// ミニマップ
if(G.state==='play'&&!G.ugMode){
  const _mmY=2,_mmH=4,_mmW=W-20,_mmX=10;
  ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(_mmX,_mmY,_mmW,_mmH);
  // マリオ位置
  const _mPos=Math.max(0,Math.min(1,mario.x/LW));
  ctx.fillStyle='#e74c3c';ctx.fillRect(_mmX+_mPos*_mmW-2,_mmY,4,_mmH);
  // ゴール位置
  const _gPos=Math.max(0,Math.min(1,flagPole.x/LW));
  ctx.fillStyle='#2ecc71';ctx.fillRect(_mmX+_gPos*_mmW-1,_mmY,3,_mmH);
}
// P-Switch タイマー表示
if(G.pswitchTimer>0&&G.state==='play'){
  const _psPct=G.pswitchTimer/600,_psLow=G.pswitchTimer<180;
  ctx.fillStyle='rgba(0,0,50,0.6)';ctx.fillRect(W/2-102,8,204,14);
  ctx.fillStyle=_psLow?(G.frame%10<5?'#ff4444':'#ff8844'):'#4488ff';
  ctx.fillRect(W/2-100,10,200*_psPct,10);
  ctx.strokeStyle='#aaccff';ctx.lineWidth=1;ctx.strokeRect(W/2-102,8,204,14);
  ctx.fillStyle='#fff';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
  ctx.fillText(`P-SWITCH ${Math.ceil(G.pswitchTimer/60)}s`,W/2,32);ctx.textAlign='left';
}
// 撃破カウンター
if(G.state==='play'&&!mario.dead){
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='7px "Press Start 2P",monospace';ctx.textAlign='right';
  ctx.fillText(`KO:${G.stageKills}`,W-10,H-10);
  // アクティブ効果表示
  let _aeY2=H-26;ctx.font='6px "Press Start 2P",monospace';ctx.textAlign='right';
  if(G.retryHeart>0){ctx.fillStyle='#ff6666';ctx.fillText(`❤️ RETRY x${G.retryHeart}`,W-10,_aeY2);_aeY2-=12;}
  if(G.doubleJump){ctx.fillStyle='#66ccff';ctx.fillText('⬆️ W-JUMP',W-10,_aeY2);_aeY2-=12;}
  if(G.coinMagnet){ctx.fillStyle='#ffcc00';ctx.fillText('🧲 MAGNET',W-10,_aeY2);_aeY2-=12;}
  if(G.heldItem){const _hIcon=G.heldItem==='flower'?'🔥':G.heldItem==='hammer'?'🔨':'🍄';ctx.fillStyle='#66ccff';ctx.fillText(`[C]${_hIcon}`,W-10,_aeY2);_aeY2-=12;}
  ctx.textAlign='left';
}
// BGM音量UI
if(G.bgmMuted){ctx.fillStyle='rgba(255,100,100,0.7)';ctx.font='7px "Press Start 2P",monospace';ctx.fillText('♪ MUTE',W-80,20);}
else if(G.bgmVolume<0.95){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='7px "Press Start 2P",monospace';ctx.fillText(`♪ ${Math.round(G.bgmVolume*100)}%`,W-80,20);}
// === SHOP UI ===
if(G.state==='shop'){
ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,W,H);
ctx.textAlign='center';
// ステージクリア統計
ctx.fillStyle='#aaa';ctx.font='7px "Press Start 2P",monospace';
const _stCoins=G.coins-G.stageCoinsStart;
ctx.fillText(`TIME:${G.timeLeft}  COINS:${_stCoins}  KO:${G.stageKills}  MAX COMBO:${G.stageMaxCombo}`,W/2,20);
ctx.fillStyle='#FFD700';ctx.font='bold 16px "Press Start 2P",monospace';ctx.fillText('COIN SHOP',W/2,46);
ctx.fillStyle='#FFD700';ctx.font='bold 14px "Press Start 2P",monospace';ctx.fillText(`COINS: ${G.coins}`,W/2,70);
const _shopItems=[
  {name:'MUSHROOM',cost:40,  key:'mushroom', icon:'🍄', desc:'デカマリオ'},
  {name:'FIRE',    cost:80,  key:'fire',     icon:'🔥', desc:'ファイアマリオ'},
  {name:'STAR 10s',cost:100, key:'star10',   icon:'⭐', desc:'10秒無敵'},
  {name:'1UP',     cost:100, key:'1up',      icon:'💚', desc:'残機+1'},
  {name:'ICE',     cost:120, key:'ice',      icon:'❄️', desc:'アイスマリオ'},
  {name:'HAMMER',  cost:160, key:'hammer',   icon:'🔨', desc:'ハンマーマリオ'},
  {name:'RETRY',   cost:200, key:'retryHeart',icon:'❤️',desc:'やられた時復活 重ね可'},
  {name:'1UP x3',  cost:200, key:'1upSet',   icon:'💚x3',desc:'残機+3'},
  {name:'1UP x6',  cost:300, key:'1upSet6',  icon:'💚x6',desc:'残機+6 お得!'},
  {name:'W-JUMP',  cost:600, key:'doubleJump',icon:'⬆️x2',desc:'2段ジャンプ やられるまで'},
  {name:'MAGNET',  cost:700, key:'magnet',    icon:'🧲', desc:'コイン吸引 やられるまで'},
  {name:'SET 1300',cost:1300,key:'bundle',    icon:'🎁', desc:'磁石+2段JMP+RETRY'},
  {name:'STAR 30s',cost:1000,key:'star30',    icon:'🌟', desc:'30秒無敵!'},
];
const _cols=5,_siW=120,_siH=100,_siGap=10,_rowGap=10;
const _siX0=(W-(_siW*_cols+_siGap*(_cols-1)))/2,_siY=86;
_shopItems.forEach((_si,_idx)=>{
  const _row=Math.floor(_idx/_cols),_col=_idx%_cols;
  const _sx=_siX0+_col*(_siW+_siGap),_sy=_siY+_row*(_siH+_rowGap);
  const _sel=G.shopCursor===_idx;
  const _single=_SINGLE_ONLY.has(_si.key);
  const _boughtVal=G.shopBought?.[_si.key]||0;
  const _sold=_single&&_boughtVal;
  const _canBuy=G.coins>=_si.cost&&!_sold;
  ctx.fillStyle=_sel?'rgba(255,200,0,0.15)':'rgba(40,40,60,0.6)';ctx.fillRect(_sx,_sy,_siW,_siH);
  ctx.strokeStyle=_sel?'#FFD700':'#555';ctx.lineWidth=_sel?3:1;ctx.strokeRect(_sx,_sy,_siW,_siH);
  ctx.font='18px monospace';ctx.fillStyle='#fff';ctx.fillText(_si.icon,_sx+_siW/2,_sy+24);
  ctx.font='bold 8px "Press Start 2P",monospace';
  if(_sold){ctx.fillStyle='#4a4';ctx.fillText('SOLD',_sx+_siW/2,_sy+44);}
  else{ctx.fillStyle='#fff';ctx.fillText(_si.name,_sx+_siW/2,_sy+44);if(_boughtVal>0&&!_single){ctx.fillStyle='#2ecc71';ctx.fillText(`x${_boughtVal}`,_sx+_siW-8,_sy+14);}}
  ctx.font='bold 8px "Press Start 2P",monospace';ctx.fillStyle=_canBuy?'#FFD700':'#888';ctx.fillText(`${_si.cost}C`,_sx+_siW/2,_sy+60);
  ctx.font='10px sans-serif';ctx.fillStyle='#ddd';ctx.fillText(_si.desc,_sx+_siW/2,_sy+80);
  if(_sel){ctx.fillStyle='#FFD700';ctx.font='10px monospace';ctx.fillText('▼',_sx+_siW/2,_sy-4);}
});
const _totalRows=Math.ceil(_shopItems.length/_cols);
// アクティブ効果表示（ショップ内）
let _aeShopY=_siY+_totalRows*(_siH+_rowGap)+6;
const _activeEffects=[];
if(G.doubleJump||(G.shopBought?.doubleJump||0)>0)_activeEffects.push('⬆️W-JUMP');
if(G.coinMagnet||(G.shopBought?.magnet||0)>0)_activeEffects.push('🧲MAGNET');
const _totalRetry=(G.retryHeart||0)+(G.shopBought?.retryHeart||0);
if(_totalRetry>0)_activeEffects.push(`❤️RETRY x${_totalRetry}`);
if(G.heldItem){const _hI2=G.heldItem==='flower'?'🔥':G.heldItem==='hammer'?'🔨':'🍄';_activeEffects.push(`HOLD:${_hI2}`);}
if(_activeEffects.length>0){ctx.fillStyle='#66ffaa';ctx.font='7px "Press Start 2P",monospace';ctx.fillText('ACTIVE: '+_activeEffects.join('  '),W/2,_aeShopY);_aeShopY+=14;}
ctx.fillStyle='#aaa';ctx.font='7px "Press Start 2P",monospace';
ctx.fillText(_gpConnected?'A:購入  B:キャンセル  START:次へ':'← → SELECT    SPACE:BUY    ENTER:NEXT',W/2,_aeShopY);
// 購入確認ダイアログ
if(G.shopConfirm!=null&&_shopItems[G.shopConfirm]){
  const _ci=_shopItems[G.shopConfirm];
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  const _bw=360,_bh=120,_bx=(W-_bw)/2,_by=(H-_bh)/2-10;
  ctx.fillStyle='#1a1a3a';ctx.fillRect(_bx,_by,_bw,_bh);
  ctx.strokeStyle='#FFD700';ctx.lineWidth=3;ctx.strokeRect(_bx,_by,_bw,_bh);ctx.lineWidth=1;
  ctx.fillStyle='#fff';ctx.font='bold 11px "Press Start 2P",monospace';
  ctx.fillText(`${_ci.icon} ${_ci.name}`,W/2,_by+30);
  ctx.fillStyle='#FFD700';ctx.font='9px "Press Start 2P",monospace';
  ctx.fillText(`${_ci.cost} COINS で購入しますか？`,W/2,_by+56);
  ctx.fillStyle='#2ecc71';ctx.font='8px "Press Start 2P",monospace';
  ctx.fillText(_gpConnected?'A : 購入':'SPACE / ENTER : 購入',W/2,_by+82);
  ctx.fillStyle='#e74c3c';
  ctx.fillText(_gpConnected?'B : キャンセル':'ESC / N : キャンセル',W/2,_by+100);
}
ctx.textAlign='left';
}
if(G.state==='start'){
ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
ctx.textAlign='center';
ctx.fillStyle='#FFD700';ctx.font='bold 16px "Press Start 2P",monospace';ctx.fillText('SUPER MARIO',W/2,36);
// キャラクター選択（大きめボタン＋ミニスプライト）
{const _cW=120,_cH=52,_cY=42,_cGap=8;
const _cMx=W/2-_cW-_cGap/2,_cLx=W/2+_cGap/2;
const _isMario=G.character!=='luigi',_isLuigi=G.character==='luigi';
// --- MARIOボックス ---
ctx.fillStyle=_isMario?'#7a0000':'#220000';ctx.fillRect(_cMx,_cY,_cW,_cH);
ctx.strokeStyle=_isMario?'#ff4444':'#550000';ctx.lineWidth=_isMario?2:1;ctx.strokeRect(_cMx,_cY,_cW,_cH);ctx.lineWidth=1;
if(_isMario){ctx.fillStyle='rgba(255,200,200,0.08)';ctx.fillRect(_cMx,_cY,_cW,_cH/2);}
// mini Marioスプライト（ゲーム中と同じ描画）
{const mx=_cMx+8,my=_cY+4;
ctx.fillStyle='#E52521';ctx.fillRect(mx+6,my,18,5);ctx.fillRect(mx+2,my+3,24,5);
ctx.fillStyle='#FBD000';ctx.fillRect(mx+4,my+8,20,8);
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+9,5,4);ctx.fillRect(mx+16,my+9,5,4);
ctx.fillStyle='#000';ctx.fillRect(mx+9,my+10,3,3);ctx.fillRect(mx+17,my+10,3,3);
ctx.fillStyle='#6B3410';ctx.fillRect(mx+6,my+14,14,2);
ctx.fillStyle='#0050C8';ctx.fillRect(mx+4,my+16,20,10);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+18,3,3);ctx.fillRect(mx+16,my+18,3,3);
ctx.fillStyle='#FBD000';ctx.fillRect(mx-3,my+16,7,6);ctx.fillRect(mx+24,my+16,7,6);
ctx.fillStyle='#6B3410';ctx.fillRect(mx+2,my+26,12,6);ctx.fillRect(mx+14,my+26,12,6);}
ctx.fillStyle=_isMario?'#fff':'#888';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText('MARIO',_cMx+_cW/2,_cY+_cH-5);
if(_isMario){ctx.fillStyle='#FFD700';ctx.font='bold 8px monospace';ctx.fillText('▶ ノーマル',_cMx+_cW/2,_cY+_cH+10);}
else{ctx.fillStyle='#886000';ctx.font='bold 7px monospace';ctx.fillText('ノーマル',_cMx+_cW/2,_cY+_cH+10);}
// --- LUIGIボックス ---
ctx.fillStyle=_isLuigi?'#0a4a1a':'#031008';ctx.fillRect(_cLx,_cY,_cW,_cH);
ctx.strokeStyle=_isLuigi?'#44ff88':'#155520';ctx.lineWidth=_isLuigi?2:1;ctx.strokeRect(_cLx,_cY,_cW,_cH);ctx.lineWidth=1;
if(_isLuigi){ctx.fillStyle='rgba(100,255,150,0.08)';ctx.fillRect(_cLx,_cY,_cW,_cH/2);}
// mini Luigiスプライト（ゲーム中と同じ描画）
{const mx=_cLx+8,my=_cY+4;
ctx.fillStyle='#27AE60';ctx.fillRect(mx+6,my,18,5);ctx.fillRect(mx+2,my+3,24,5);
ctx.fillStyle='#FBD000';ctx.fillRect(mx+4,my+8,20,8);
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+9,5,4);ctx.fillRect(mx+16,my+9,5,4);
ctx.fillStyle='#000';ctx.fillRect(mx+9,my+10,3,3);ctx.fillRect(mx+17,my+10,3,3);
ctx.fillStyle='#6B3410';ctx.fillRect(mx+6,my+14,14,2);
ctx.fillStyle='#1a55bb';ctx.fillRect(mx+4,my+16,20,10);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+18,3,3);ctx.fillRect(mx+16,my+18,3,3);
ctx.fillStyle='#FBD000';ctx.fillRect(mx-3,my+16,7,6);ctx.fillRect(mx+24,my+16,7,6);
ctx.fillStyle='#6B3410';ctx.fillRect(mx+2,my+26,12,6);ctx.fillRect(mx+14,my+26,12,6);}
ctx.fillStyle=_isLuigi?'#fff':'#5a9a5a';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText('LUIGI',_cLx+_cW/2,_cY+_cH-5);
if(_isLuigi){ctx.fillStyle='#55ff88';ctx.font='bold 8px monospace';ctx.fillText('▶ イージー',_cLx+_cW/2,_cY+_cH+10);}
else{ctx.fillStyle='#2a6a3a';ctx.font='bold 7px monospace';ctx.fillText('イージー',_cLx+_cW/2,_cY+_cH+10);}
ctx.fillStyle='#55cc88';ctx.font='6px monospace';ctx.fillText('※ イージー（LUIGI）はコイン獲得2倍',W/2,_cY+_cH+22);
ctx.fillStyle='#555';ctx.font='5px monospace';ctx.fillText('[R]or[L]キー または クリックで切替',W/2,_cY+_cH+32);}
const _bw=72,_bh=24,_gap=8,_rowH=30,_startY=116;
const _ws2=getWorlds();
_ws2.forEach((_w,_wi)=>{
  const _wSt=getWorldStages(_w);
  const _rowW=_wSt.length*(_bw+_gap)-_gap;
  const _bx0=(W-_rowW)/2;
  const _by=_startY+_wi*_rowH;
  _wSt.forEach((_st,_si)=>{
    const _bx=_bx0+_si*(_bw+_gap);
    const _sel=G.selectedStage===_st.id;
    ctx.fillStyle=_sel?_st.selFg:_st.selBg;ctx.fillRect(_bx,_by,_bw,_bh);
    ctx.strokeStyle=_sel?'#fff':'#444';ctx.lineWidth=_sel?2:1;ctx.strokeRect(_bx,_by,_bw,_bh);
    if(_sel){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(_bx,_by,_bw,_bh/2);}
    const _t=G.stageTimes[_st.id];
    const _labelY=_t!==undefined?_by+_bh/2:_by+_bh/2+4;
    ctx.fillStyle=_sel?'#fff':'#888';ctx.font=`bold ${_sel?9:8}px "Press Start 2P",monospace`;ctx.textAlign='center';
    ctx.fillText(`${_w}-${_st.level}`,_bx+_bw/2,_labelY);
    if(_t!==undefined){ctx.font='5px monospace';ctx.fillStyle='rgba(255,220,50,0.9)';ctx.fillText(Math.floor(_t/60)+':'+String(_t%60).padStart(2,'0'),_bx+_bw/2,_by+_bh-2);}
    if(_sel){ctx.fillStyle='#FFD700';ctx.font='10px monospace';ctx.fillText('▼',_bx+_bw/2,_by+_bh+7);}
    if(G.clearedStages.includes(_st.id)){ctx.fillStyle='#FFD700';ctx.font='7px monospace';ctx.textAlign='right';ctx.fillText('★',_bx+_bw-2,_by+9);ctx.textAlign='center';}
  });
});
// EXステージボタン（EX-1 + EX-2 常時2ボタン表示）
const _exBh=22,_exBy=_startY+_ws2.length*_rowH+4;
{const _exBw2=76,_ex1x=W/2-_exBw2-6,_ex2x=W/2+6;
const _ex1Sel=G.selectedStage===STAGES.length+1,_ex2Sel=G.selectedStage===STAGES.length+2;
// EX-1ボタン（紫）
ctx.fillStyle=_ex1Sel?'#bb00ff':'#8800cc';ctx.fillRect(_ex1x,_exBy,_exBw2,_exBh);
ctx.strokeStyle=_ex1Sel?'#fff':'#cc44ff';ctx.lineWidth=_ex1Sel?2:1;ctx.strokeRect(_ex1x,_exBy,_exBw2,_exBh);ctx.lineWidth=1;
if(_ex1Sel){ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(_ex1x,_exBy,_exBw2,_exBh/2);}
ctx.fillStyle=_ex1Sel?'#fff':'#ff88ff';ctx.font='bold 8px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText('EX-1',_ex1x+_exBw2/2,_exBy+_exBh/2+4);
if(_ex1Sel){ctx.fillStyle='#FFD700';ctx.font='10px monospace';ctx.fillText('▼',_ex1x+_exBw2/2,_exBy+_exBh+10);}
// EX-2ボタン（宇宙色）
ctx.fillStyle=_ex2Sel?'#1144ff':'#002299';ctx.fillRect(_ex2x,_exBy,_exBw2,_exBh);
ctx.strokeStyle=_ex2Sel?'#88aaff':'#4466cc';ctx.lineWidth=_ex2Sel?2:1;ctx.strokeRect(_ex2x,_exBy,_exBw2,_exBh);ctx.lineWidth=1;
if(_ex2Sel){ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(_ex2x,_exBy,_exBw2,_exBh/2);}
ctx.fillStyle=_ex2Sel?'#fff':'#88aaff';ctx.font='bold 8px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText('EX-2',_ex2x+_exBw2/2,_exBy+_exBh/2+4);
if(_ex2Sel){ctx.fillStyle='#FFD700';ctx.font='10px monospace';ctx.fillText('▼',_ex2x+_exBw2/2,_exBy+_exBh+10);}
ctx.textAlign='left';}
// CONTINUEボタン（セーブデータがある場合）
const _exEnd=_exBy+_exBh;
if(hasSave()){
  const _ctId=STAGES.length+3,_ctSel=G.selectedStage===_ctId;
  const _ctW=180,_ctH=20,_ctX=W/2-90,_ctY=_exEnd+6;
  ctx.fillStyle=_ctSel?'#27ae60':'#144a24';ctx.fillRect(_ctX,_ctY,_ctW,_ctH);
  ctx.strokeStyle=_ctSel?'#88ff88':'#3a8a4a';ctx.lineWidth=_ctSel?2:1;ctx.strokeRect(_ctX,_ctY,_ctW,_ctH);ctx.lineWidth=1;
  if(_ctSel){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(_ctX,_ctY,_ctW,_ctH/2);}
  const _svSt=_saveInfo?getStageById(_saveInfo.nextStageId):null;
  const _svLbl=_svSt?`W${_svSt.world}-${_svSt.level}`:'?';
  ctx.fillStyle=_ctSel?'#fff':'#88dd88';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
  ctx.fillText(`▶ CONTINUE  [${_svLbl}]`,W/2,_ctY+_ctH/2+3);
  if(_ctSel){ctx.fillStyle='#FFD700';ctx.font='10px monospace';ctx.fillText('▼',W/2,_ctY+_ctH+10);}
  ctx.textAlign='left';
}
const _hintY=_exEnd+(hasSave()?32:8);
ctx.fillStyle='#aaa';ctx.font='7px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText(`← → ↑ ↓ or 1-${STAGES.length} key : SELECT`,W/2,_hintY);
ctx.fillText('SPACE / ENTER / CLICK : START',W/2,_hintY+14);
if(_gpConnected){ctx.fillStyle='#4f4';ctx.fillText('🎮 GAMEPAD OK — A:START  ←→↑↓:SELECT',W/2,_hintY+28);}
ctx.textAlign='left';}
if(G.state==='dead')drawOverlay('MISS!',`${G.lives} LEFT\nCLICK or SPACE to CONTINUE`,'#4a1a1a');
if(G.state==='over'){ctx.fillStyle='rgba(0,0,0,0.88)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ff2222';ctx.font='bold 38px "Press Start 2P",monospace';ctx.textAlign='center';ctx.shadowColor='#ff0000';ctx.shadowBlur=28;ctx.fillText('GAME OVER',W/2,H/2-18);ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='10px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillText(`SCORE: ${G.score}`,W/2,H/2+18);ctx.fillStyle='#bbb';ctx.fillText('CLICK or SPACE to RESTART',W/2,H/2+48);ctx.textAlign='left';}
if(G.state==='win'){const _curStage=getStage(G.currentWorld,G.currentLevel);const _isFinal=G.currentWorld===8&&G.currentLevel===3;const _isBoss=_curStage?.bgmTheme==='castle';if(_isFinal){ctx.fillStyle='rgba(0,0,0,0.82)';ctx.fillRect(0,0,W,H);const _wh=((G.frame*1.5)%360);ctx.fillStyle=`hsla(${_wh},100%,55%,0.12)`;ctx.fillRect(0,0,W,H);if(G.frame%10===0){const _fx=60+Math.random()*(W-120),_fy=40+Math.random()*200;for(let _fp=0;_fp<14;_fp++)spawnParticle(_fx,_fy,'star');}const _pulse=0.82+0.18*Math.sin(G.frame*0.07);ctx.globalAlpha=_pulse;ctx.fillStyle='#FFD700';ctx.font='bold 24px "Press Start 2P",monospace';ctx.textAlign='center';ctx.shadowColor='#FF8800';ctx.shadowBlur=22;ctx.fillText('CONGRATULATIONS!',W/2,H/2-58);ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.fillStyle='#ff99cc';ctx.font='13px "Press Start 2P",monospace';ctx.fillText('PEACH IS SAVED!',W/2,H/2-18);ctx.fillStyle='#FFD700';ctx.font='11px "Press Start 2P",monospace';ctx.fillText(`SCORE: ${G.score}`,W/2,H/2+16);ctx.fillStyle='#aaddff';ctx.font='8px "Press Start 2P",monospace';ctx.fillText('THANK YOU FOR PLAYING!',W/2,H/2+46);ctx.fillStyle='#888';ctx.fillText('CLICK or SPACE',W/2,H/2+72);ctx.textAlign='left';}else{drawOverlay(_isBoss?'THANK YOU!':'COURSE CLEAR!',_isBoss?`PEACH IS SAVED!\nSCORE: ${G.score}\nCLICK or SPACE`:`SCORE: ${G.score}\nCLICK or SPACE`,'#0a3a0a');}}
if(G.paused&&G.state==='play'){ctx.fillStyle='rgba(0,0,0,0.55)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 20px "Press Start 2P"';ctx.textAlign='center';ctx.fillText('PAUSED',W/2,H/2-10);ctx.font='11px "Press Start 2P"';ctx.fillText(_gpConnected?'START / P : RESUME':'P : RESUME',W/2,H/2+24);
if(G.isExStage){ctx.fillStyle='#ff8888';ctx.font='10px "Press Start 2P"';ctx.fillText(_gpConnected?'B : GIVE UP':'Q : GIVE UP',W/2,H/2+46);}
ctx.textAlign='left';}
}

let _prevT=performance.now(),_acc=0;const _STEP=1000/60;
(function _loop(){const _now=performance.now();_acc+=Math.min(_now-_prevT,200);_prevT=_now;while(_acc>=_STEP){pollGamepad();if(!(G.state==='play'&&G.paused))update();_acc-=_STEP;}draw();requestAnimationFrame(_loop)})();
