import "./style.css";
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,bowserShockwaves,
  iceBalls,marioHammers,gravityZones,windZones,windParticles,rings,
  mario,yoshi,bowser,peach,flagPole,G,W,H,TILE,GRAVITY,LW,BOWSER_STATS,
  pinoObj,chests} from './globals.js';
import {addB,addRow,addStair,addStairD} from './builders.js';
import {buildUnderground as _buildUG} from './levels/underground.js';
import {buildExStage as _buildEX1} from './levels/level1-3_archived.js';
import {buildExStage2 as _buildEX2} from './levels/level-ex2.js';
import {sanitizeLevel} from './sanitize.js';
// 組み立て直後に sanitizeLevel()（ブロックや土管に埋まったコインを取れる位置へ）を通す
const buildUnderground=v=>{_buildUG(v);sanitizeLevel();};
const buildExStage=()=>{_buildEX1();sanitizeLevel();};
const buildExStage2=()=>{_buildEX2();sanitizeLevel();};
import {STAGES,getStage,getNextStage,getStageById,getWorlds,getWorldStages} from './stages.js';
import {AC,beep,sfx,playGameOverJingle,playVictoryFanfare,playStageClearFanfare,
  THEME_NOTES,BIG_MARIO_NOTES,UG_NOTES,STAR_NOTES,CASTLE_NOTES,
  CASTLE_P2_NOTES,WATER_NOTES,PSWITCH_NOTES,FINAL_BOSS_NOTES,
  SHOP_NOTES,PINO_NOTES,setSeVolume} from './audio.js';
import {canvasPoint} from './layout.js';
import {keys,held,isBound,ACTIONS,mainKey,ACTION_LABEL,ACTION_DESC,SLOTS,RESERVED,binds,setBind,clearBind,resetAndSaveBinds,keyLabel} from './input.js';
import {SLOT_COUNT,getProgress,getRecords,writeProgress,clearProgress,writeRecords} from './save.js';
import {draw} from './draw.js'; // 描画（canvas への書き込み）はすべて draw.js
export const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');

// === AUDIO ===
// AC/beep/sfx/playGameOverJingle/playVictoryFanfare とBGMノートデータは src/audio.js に移動済み。
// scheduleBGM/startBGM/stopBGM はmutable状態（bgmGain/bgmStep等）と密結合のためこちらに残置。
let bgmGain=null;
let bgmStep=0,bgmTime=0;const BEAT=0.09;let _bgmWasBig=false;
function scheduleBGM(){if(bgmTime<AC.currentTime)bgmTime=AC.currentTime;const _bgmS=getStage(G.currentWorld,G.currentLevel);const _isFinal=G.currentWorld===8&&G.currentLevel===3;const notes=G.state==='shop'?SHOP_NOTES:(G.starTimer>0?STAR_NOTES:(G.pinoRoom?PINO_NOTES:(G.ugMode?(_isFinal?FINAL_BOSS_NOTES:UG_NOTES):(G.megaTimer>0?BIG_MARIO_NOTES:(G.pswitchTimer>0?PSWITCH_NOTES:(G.waterMode?WATER_NOTES:(_bgmS?.bgmTheme==='castle'?(bowser.alive&&bowser.phase===2?CASTLE_P2_NOTES:CASTLE_NOTES):THEME_NOTES)))))));const _beat=(G.timeLeft<100&&G.timeLeft>0&&G.state==='play')?0.062:BEAT;while(bgmTime<AC.currentTime+0.5){const[freq,len]=notes[bgmStep%notes.length];if(freq>0){const o=AC.createOscillator(),g=AC.createGain();o.connect(g);g.connect(bgmGain);o.type='square';o.frequency.value=freq;g.gain.setValueAtTime(0.08,bgmTime);g.gain.exponentialRampToValueAtTime(0.001,bgmTime+len*_beat-0.01);o.start(bgmTime);o.stop(bgmTime+len*_beat)}bgmTime+=len*_beat;bgmStep++}}
function startBGM(){stopBGM();bgmGain=AC.createGain();bgmGain.gain.value=G.bgmMuted?0:G.bgmVolume;bgmGain.connect(AC.destination);bgmStep=0;bgmTime=AC.currentTime;scheduleBGM()}
function stopBGM(){if(bgmGain){const g=bgmGain.gain,t=AC.currentTime;try{g.cancelScheduledValues(t);g.setValueAtTime(Math.max(0.0001,g.value),t);g.exponentialRampToValueAtTime(0.0001,t+0.2);}catch(e){}bgmGain=null}}

// クッパ撃破共通処理（4箇所のダメージ源で重複していたブロックを集約＋演出強化）
function _defeatBowser(){
  bowser.state='dead';bowser.deadTimer=160;
  bowserFire.length=0;bowserShockwaves.length=0;mario.inv=Math.max(mario.inv,60); // 撃破後の残り弾でやられないように
  G.shakeX=22;G.shakeY=22; // 大型シェイク（撃破の重み）
  stopBGM();sfx('bossWin'); // 専用ジングル
  G.score+=5000;updateHUD();
  G.coins=Math.min(G.coins+200,3000);updateHUD();
  const _bx=bowser.x+bowser.w/2,_by=bowser.y+bowser.h/2;
  for(let _i=0;_i<80;_i++){const _a=-Math.PI*0.95+(_i/79*Math.PI*0.9);const _spd=4+Math.random()*8;coinItems.push({x:_bx-8,y:_by-8,vx:Math.cos(_a)*_spd,vy:Math.sin(_a)*_spd,type:'frozendrop',timer:300,gravity:0.35,w:16,h:16,collected:false,noCollect:true});}
  for(let pi=0;pi<20;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');
  for(let pi=0;pi<30;pi++)spawnParticle(_bx+(Math.random()-0.5)*200,_by+(Math.random()-0.5)*120,'star'); // 広域バースト
}

// === GAME STATE ===

function resetMario(){
const bh=mario.power!=='none'?48:32;
Object.assign(mario,{x:80,y:H-3*TILE,w:26,h:bh,vx:0,vy:0,onGround:false,facing:1,walkFrame:0,walkTimer:0,inv:0,dead:false,crouching:false,heldShell:null});
G.cam=0;G.camLead=0;G.camDir=1;G.jumpBuf=0;G.jumpFresh=false;G.coyote=0;
}
function upgradeMario(type,_fromStock=false){
// アイテムストック: すでに特殊パワー(fire/hammer/ice)持ちかつスロット空きがあれば保存
// メガ中(G.megaTimer>0)はストックせず直接パワー更新→メガ復帰時に新パワーが反映される
if(!_fromStock&&G.megaTimer===0&&mario.big&&mario.power!=='none'&&mario.power!=='big'&&G.heldItem===null){
  G.heldItem=(type==='hammer')?'hammer':(type==='flower')?'flower':'mushroom';
  spawnScorePopup(mario.x+13,mario.y-10,'STORED!','#66ccff');sfx('coin');return;
}
if(type==='flower')mario.power=G.iceMode?'ice':'fire';
else if(type==='hammer')mario.power='hammer';
else if(mario.power==='none')mario.power='big';
if(!mario.big){if(mario.crouching){mario.y+=mario.h-24;mario.h=24;}else{mario.y-=48-mario.h;mario.h=48;}}mario.big=true;sfx('power');
// メガ中にパワーアップを取得した場合、復帰先を最新のパワーに更新
if(G.megaTimer>0){G.megaPrevPower=mario.power;G.megaPrevBig=true;}
for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+24,'star');
}
function useHeldItem(){if(!G.heldItem||mario.dead)return;if(G.heldItem==='mushroom'&&mario.big)return; // 大マリオ以上ならキノコは使わずに取っておく
const _t=G.heldItem;G.heldItem=null;upgradeMario(_t,true);spawnScorePopup(mario.x+13,mario.y-16,'USE!','#66ccff');}

// === HELPERS ===
function overlap(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by}
// 足場＋土管を x 順に並べた配列（毎フレーム update の最初に作り直す）。_solidsNear(x) で近くだけ取り出す
// 以前は敵1体ごとに [...platforms,...pipes] をコピーして全部を調べていて、update 時間の大半を占めていた
let _solids=[];
function _buildSolids(){_solids=platforms.concat(pipes);_solids.sort((a,b)=>a.x-b.x);}
function _solidsNear(x,r=260){const L=x-r-128,R=x+r;let lo=0,hi=_solids.length;while(lo<hi){const m=(lo+hi)>>1;if(_solids[m].x<L)lo=m+1;else hi=m;}let e=lo;while(e<_solids.length&&_solids[e].x<=R)e++;return _solids.slice(lo,e);}
function cX(obj,p){const bo=p.bounceOffset||0;if(!overlap(obj.x,obj.y+2,obj.w,obj.h-4,p.x,p.y-bo,p.w,p.h))return;
// 敵やアイテムの足元が床に数pxめり込んでいるだけなら横に押さない（縦判定で上に乗せる）。押すと床タイルを次々に押し出されて穴まで一気にワープしていた
if(obj!==mario&&obj.y+obj.h-(p.y-bo)<=8)return;if(obj.x+obj.w/2<p.x+p.w/2){obj.x=p.x-obj.w;if(obj===mario&&!mario.onGround&&!G.waterMode){mario.wallContact=1;mario.wallContactTimer=8;}}else{obj.x=p.x+p.w;if(obj===mario&&!mario.onGround&&!G.waterMode){mario.wallContact=-1;mario.wallContactTimer=8;}}obj.vx=obj===mario?0:-obj.vx}
function cY(obj,p,onHit){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(obj.x+1,obj.y,obj.w-2,obj.h,p.x,py,p.w,p.h))return;
// 当たった面は「前フレームの位置」で判定する
//  ・前フレームでブロックより上にいた → 上に着地（高速ヒップドロップでもすり抜けない）
//  ・前フレームでブロックより下にいた → 頭をぶつけた
//  ・どちらでもない（横から重なった/跳ね返るブロックと重なった等）→ 中心の位置で判定
//  以前は縦速度の向きだけで決めていたため、横から重なると一気にブロックの上/下へワープしていた
const _vy=obj.vy||0,_pTop=obj.y-_vy,_pBot=_pTop+obj.h,_up=_vy<0;
const _fromTop=_pBot<=py+1?true:(_pTop>=py+p.h-1?false:obj.y+obj.h/2<py+p.h/2);
if(_fromTop){obj.y=py-obj.h;obj.vy=0;obj.onGround=true}else{obj.y=py+p.h;obj.vy=0;if(onHit&&_up)onHit(p)}}
function spawnParticle(x,y,type){const count=type==='brick'?8:type==='star'?6:4;for(let i=0;i<count;i++){const angle=(Math.PI*2/count)*i+Math.random()*0.5;const spd=(type==='brick'?4:type==='star'?5:2)+Math.random()*2;particles.push({x,y,vx:Math.cos(angle)*spd,vy:Math.sin(angle)*spd-2,life:1,decay:0.025+Math.random()*0.02,size:type==='brick'?5+Math.random()*4:type==='star'?4+Math.random()*3:3+Math.random()*3,color:type==='brick'?`hsl(${10+Math.random()*20},80%,45%)`:type==='star'?`hsl(${45+Math.random()*30},100%,65%)`:type==='dust'?`hsl(30,30%,${60+Math.random()*30}%)`:'#fff',type})}}
function spawnScorePopup(x,y,val,color='#fff'){scorePopups.push({x,y,val,vy:-1.8,life:1,color})}
function updateParticles(){for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.18;p.life-=p.decay;if(p.life<=0)particles.splice(i,1)}for(let i=scorePopups.length-1;i>=0;i--){const p=scorePopups[i];p.y+=p.vy;p.vy*=0.95;p.life-=0.02;if(p.life<=0)scorePopups.splice(i,1)}}

// === INPUT ===
// ブラウザの自動再生制限対策: ユーザー操作のたびにAudioContextが止まっていれば再開（iOSは割り込み後に再停止することがある）
{const _unlockAudio=()=>{try{if(AC.state!=='running')AC.resume();}catch(e){}};['pointerdown','keydown','touchstart'].forEach(_ev=>document.addEventListener(_ev,_unlockAudio,{capture:true,passive:true}));}
// BGM音量・ミュートの永続化（リロードしても設定が残るように）
// 設定の保存（BGM/効果音の音量・ミュート・画面揺れ・点滅軽減・操作・セーブスロット）
function saveAudioOpts(){try{localStorage.setItem('mario_v2_opts',JSON.stringify({v:G.bgmVolume,m:G.bgmMuted,se:G.seVolume,shake:G.optShake,flash:G.optReduceFlash,runFire:G.runFire,pad:G.padLayout,touch:G.touchSize,slot:G.saveSlot}));}catch(e){}}
function applyTouchSize(){try{document.documentElement.style.setProperty('--btn-scale',String(G.touchSize));}catch(e){}}
(function(){try{const _o=JSON.parse(localStorage.getItem('mario_v2_opts'));if(_o){const num=(x,d,lo,hi)=>typeof x==='number'&&isFinite(x)?Math.min(hi,Math.max(lo,x)):d;
  G.bgmVolume=num(_o.v,1,0,1);G.bgmMuted=!!_o.m;G.seVolume=num(_o.se,1,0,1);if(typeof _o.shake==='boolean')G.optShake=_o.shake;G.optReduceFlash=!!_o.flash;G.runFire=!!_o.runFire;
  if(_o.pad==='modern'||_o.pad==='snes')G.padLayout=_o.pad;G.touchSize=[1,1.25,1.5].includes(_o.touch)?_o.touch:1;G.saveSlot=Number.isInteger(_o.slot)&&_o.slot>=0&&_o.slot<3?_o.slot:0;}}catch(e){}
  setSeVolume(G.seVolume);applyTouchSize();})();
const btn={left:false,right:false,jump:false,dash:false,down:false,fire:false};
// アクション入力（キーボード割当＋タッチボタン＋ゲームパッド）が押されているか
function act(a){
  if(held(a))return true;
  switch(a){
    case'left':return btn.left||gpad.left;
    case'right':return btn.right||gpad.right;
    case'down':return btn.down||gpad.down;
    case'jump':return btn.jump||gpad.a;
    // SMB式（ダッシュ＋ファイア一体化）ならファイアボタン押しっぱなしでもダッシュ
    case'dash':return btn.dash||gpad.b||(G.runFire&&(held('fire')||btn.fire||gpad.y));
  }
  return false;
}
// 攻撃（パワーアップに応じてファイア/アイス/ハンマー）
function marioAttack(){if(mario.power==='fire')shootFireball();else if(mario.power==='ice')shootIceBall();else if(mario.power==='hammer')throwMarioHammer();}
function toggleCharacter(){G.character=G.character==='luigi'?'mario':'luigi';try{localStorage.setItem('mario_v2_char',G.character);}catch(_le){}}
// ミス/ゲームオーバー/全クリア画面からの続行
function continueAfterEnd(){if(G.state==='over'||G.state==='win'){G.score=0;G.coins=0;G.lives=3;mario.big=false;mario.power='none';startGame()}else if(G.state==='dead'){restartCurrentLevel()}}

// === メニュー操作（キーボード・ゲームパッド・タッチ共通） ===
// c: 'left'|'right'|'up'|'down'|'ok'|'back'|'start'|'char'
// タイトル下段のボタン配置（描画とクリック判定で共通）
export function _titleBtns(){const y=116+getWorlds().length*30+4+22+6;return{settings:{x:W/2-90-8-112,y,w:112,h:20},cont:{x:W/2-90,y,w:180,h:20},slot:{x:W/2+90+8,y,w:112,h:20}};}
function _openSettings(){G.menu={type:'settings',cur:0,prev:null};}
function _titleNav(c){
  const S=STAGES.length,_exId=S+1,_exId2=S+2,_contId=S+3,_setId=S+4,_slotId=S+5,sel=G.selectedStage;
  // 下段（SETTINGS / CONTINUE / SLOT）
  if(sel>=_contId){const row=[_setId,...(hasSave()?[_contId]:[]),_slotId];const i=row.indexOf(sel);
    if(i<0){G.selectedStage=_setId;return;}
    if(c==='left'&&i>0)G.selectedStage=row[i-1];
    if(c==='right'&&i<row.length-1)G.selectedStage=row[i+1];
    if(c==='up')G.selectedStage=_exId;
    return;}
  if(c==='left'){if(sel===_exId2)G.selectedStage=_exId;else if(sel===_exId)G.selectedStage=S;else if(sel>1)G.selectedStage--;}
  if(c==='right'){if(sel<S)G.selectedStage++;else if(sel===S)G.selectedStage=_exId;else if(sel===_exId)G.selectedStage=_exId2;}
  if(c==='up'){if(sel===_exId||sel===_exId2)G.selectedStage=S-1;else if(sel>3)G.selectedStage-=3;}
  if(c==='down'){if(sel<=S){if(sel+3<=S)G.selectedStage+=3;else G.selectedStage=_exId;}else if(sel===_exId||sel===_exId2)G.selectedStage=hasSave()?_contId:_setId;}
}
function _titleStart(){
  const S=STAGES.length;
  if(G.selectedStage===S+3){if(hasSave())loadSave();}
  else if(G.selectedStage===S+4)_openSettings();
  else if(G.selectedStage===S+5)switchSlot();
  else if(G.selectedStage===S+1){G.isExStage=false;G.exStageFrom=null;startExStage(1);}
  else if(G.selectedStage===S+2){G.isExStage=false;G.exStageFrom=null;startExStage(2);}
  else startFromStage(G.selectedStage);
}
// 購入可能なら確認ダイアログを開く
function _shopSelect(i){const it=_SHOP_ITEMS[i];if(!it)return;if(it.key==='mushroom'&&mario.power!=='none')return; // すでに大マリオ以上
const single=_SINGLE_ONLY.has(it.key);if(G.coins>=it.cost&&(!single||!G.shopBought?.[it.key]))G.shopConfirm=i;}
function _shopCmd(c){
  const N=_SHOP_ITEMS.length,rows=Math.ceil(N/5);
  if(G.shopConfirm!=null){if(c==='ok'||c==='start')_gpShopBuy(G.shopConfirm);else if(c==='back')G.shopConfirm=null;return;}
  if(c==='left')G.shopCursor=(G.shopCursor+N-1)%N;
  if(c==='right')G.shopCursor=(G.shopCursor+1)%N;
  if(c==='up'){const u=G.shopCursor-5;G.shopCursor=u>=0?u:Math.min(N-1,G.shopCursor+(rows-1)*5);}
  if(c==='down'){const d=G.shopCursor+5;G.shopCursor=d<N?d:G.shopCursor%5;}
  if(c==='ok')_shopSelect(G.shopCursor);
  if(c==='start')_gpShopNext();
}
// ショップ画面の配置（描画とタップ/クリック判定で共通）
export const _SHOP_NEXT={x:W-124,y:30,w:108,h:26};
function _shopItemRect(i){const x0=(W-(120*5+10*4))/2;return{x:x0+(i%5)*130,y:86+Math.floor(i/5)*110,w:120,h:100};}
export const _SHOP_DLG={x:(W-360)/2,y:(H-140)/2-10,w:360,h:140};
export const _SHOP_BUY={x:_SHOP_DLG.x+30,y:_SHOP_DLG.y+68,w:140,h:32},_SHOP_CANCEL={x:_SHOP_DLG.x+190,y:_SHOP_DLG.y+68,w:140,h:32};
function _inRect(x,y,r){return x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h;}
function _shopTap(x,y){
  if(G.frame-(G._stateFrame||0)<20)return;
  if(G.shopConfirm!=null){if(_inRect(x,y,_SHOP_BUY))_gpShopBuy(G.shopConfirm);else G.shopConfirm=null;return;}
  if(_inRect(x,y,_SHOP_NEXT)){_gpShopNext();return;}
  for(let i=0;i<_SHOP_ITEMS.length;i++)if(_inRect(x,y,_shopItemRect(i))){G.shopCursor=i;_shopSelect(i);return;}
}
function menuCmd(c){
  if(G.menu){_menuInput(c);return;}
  // 画面が切り替わった直後の入力は無視（ボタン連打でゲームオーバー画面や購入を飛ばさないように）
  const _since=G.frame-(G._stateFrame||0);
  if(G.state!=='start'&&_since<(G.state==='over'||G.state==='win'?45:20))return;
  if(G.state==='start'){if(c==='ok'||c==='start')_titleStart();else if(c==='char')toggleCharacter();else _titleNav(c);return;}
  if(G.state==='shop'){_shopCmd(c);return;}
  // ステージ開始画面はジャンプ/決定で飛ばせる
  if(G.state==='intro'){if((c==='ok'||c==='start')&&G.introTimer<100)G.introTimer=1;return;}
  if(G.state==='dead'||G.state==='over'||G.state==='win'){if(c==='ok'||c==='start')continueAfterEnd();}
}
// メニュー画面でのキー → メニュー操作
function _menuCmdOfKey(code){
  // 固定キーを先に判定（割り当てたキーより優先。Space等を移動に割り当てても決定に使える）
  const fixed={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',KeyW:'up',Enter:'start',Space:'ok',KeyZ:'ok',Escape:'back',KeyX:'back',KeyN:'back',Backspace:'back'};
  if(fixed[code])return fixed[code];
  if(G.state==='start'&&(code==='KeyL'||code==='KeyR'))return'char';
  if(isBound(code,'left'))return'left';
  if(isBound(code,'right'))return'right';
  if(isBound(code,'down'))return'down';
  if(isBound(code,'jump'))return'ok';
  return null;
}
// ゲームで使うキーだけブラウザの既定動作を止める（F5・F11・Ctrl+R などは効くように）
const _GAME_KEYS=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','Enter','Escape','Backspace','Tab','KeyZ','KeyX','KeyN','KeyW','KeyA','KeyS','KeyD','KeyL','KeyR','KeyQ','KeyM','Equal','Minus','NumpadAdd','NumpadSubtract']);
const _DIGIT_STAGE={'Digit1':1,'Digit2':2,'Digit3':3,'Digit4':4,'Digit5':5,'Digit6':6,'Digit7':7,'Digit8':8,'Digit9':9,'Digit0':10};
document.addEventListener('keydown',e=>{
const _modKey=/^(Control|Alt|Meta|Shift)/.test(e.code);
if(G.menu&&G.menu.type==='keys'&&G.menu.waiting&&_modKey){e.preventDefault();if(!e.repeat)_keyCapture(e.code);return;}
if(e.ctrlKey||e.metaKey||e.altKey)return;
keys[e.code]=true;
if(_GAME_KEYS.has(e.code)||_DIGIT_STAGE[e.code]||ACTIONS.some(a=>isBound(e.code,a)))e.preventDefault();
// キーコンフィグの入力待ち／キー消去
if(G.menu&&G.menu.type==='keys'&&G.menu.waiting){if(!e.repeat)_keyCapture(e.code);return;}
if(G.menu&&G.menu.type==='keys'&&(e.code==='Delete'||e.code==='Backspace')){_keyClear();return;}
if(G.menu){
  const _mc=_menuCmdOfKey(e.code)||(isBound(e.code,'pause')?'back':null);
  if(_mc&&(!e.repeat||['left','right','up','down'].includes(_mc)))menuCmd(_mc);
}else if(G.state!=='play'){
  if(G.state==='start'&&_DIGIT_STAGE[e.code]&&_DIGIT_STAGE[e.code]<=STAGES.length&&!ACTIONS.some(a=>isBound(e.code,a)))G.selectedStage=_DIGIT_STAGE[e.code];
  // 方向キーは押しっぱなしで連続移動、決定系はキーリピートを無視
  const _mc=_menuCmdOfKey(e.code);
  if(_mc&&(!e.repeat||['left','right','up','down'].includes(_mc)))menuCmd(_mc);
}else{
  if(!G.paused&&!e.repeat&&isBound(e.code,'jump'))queueJump(); // ミス演出中は早送り
  if(!G.paused&&!mario.dead&&!e.repeat){
    if(isBound(e.code,'fire')||(G.runFire&&isBound(e.code,'dash')))marioAttack();
    if(isBound(e.code,'item'))useHeldItem();
    if(isBound(e.code,'yoshi')&&yoshi.mounted&&yoshi.alive)yoshiAction();
  }
  if(isBound(e.code,'pause')&&!e.repeat&&!mario.dead)openPause();
}
// BGM音量操作
if(e.code==='KeyM'&&!e.repeat){G.bgmMuted=!G.bgmMuted;if(bgmGain)bgmGain.gain.value=G.bgmMuted?0:G.bgmVolume;saveAudioOpts();}
if(e.code==='Equal'||e.code==='NumpadAdd'){G.bgmVolume=Math.min(1,G.bgmVolume+0.1);if(bgmGain&&!G.bgmMuted)bgmGain.gain.value=G.bgmVolume;saveAudioOpts();}
if(e.code==='Minus'||e.code==='NumpadSubtract'){G.bgmVolume=Math.max(0,G.bgmVolume-0.1);if(bgmGain&&!G.bgmMuted)bgmGain.gain.value=G.bgmVolume;saveAudioOpts();}
});
document.addEventListener('keyup',e=>{keys[e.code]=false});
// 画面下の操作説明を現在のキー割当から生成（キーコンフィグ変更時にも呼ぶ）
function updateKeyHint(){const el=document.getElementById('key-hint');if(!el)return;const k=mainKey;el.innerHTML=`${k('left')}${k('right')}:MOVE ${k('dash')}:DASH ${k('jump')}:JUMP<br>${k('fire')}:FIRE ${k('yoshi')}:YOSHI ${k('item')}:ITEM ${k('pause')}:MENU`;}
updateKeyHint();
// ウィンドウのフォーカスが外れたら押下状態をクリア（キーが押しっぱなし扱いになるのを防ぐ）
window.addEventListener('blur',()=>{for(const k in keys)keys[k]=false;});
// タブが非アクティブになったら自動ポーズ（バックグラウンドでタイマーだけ進む問題の防止）
document.addEventListener('visibilitychange',()=>{if(document.hidden&&G.state==='play'&&!mario.dead)openPause();});

function doJump(){
if(G.waterMode){mario.vy=-3.5;G.swimCooldown=14;for(let i=0;i<4;i++)spawnParticle(mario.x+13,mario.y+mario.h,'dust');return}
const isDash=act('dash');
const speedBonus=Math.min(Math.abs(mario.vx)*0.15,1.5);
const _hj=G.highJump?1.25:1;
if(yoshi.mounted&&yoshi.alive){mario.vy=(isDash?-16:-14.5)*_hj-speedBonus;yoshi.flutterTimer=12}
else{mario.vy=(isDash?-15.5:-14)*_hj-speedBonus}
mario.onGround=false;mario.hipDrop=false;sfx('jump');
if(G.gravityFlipped)mario.vy=-mario.vy; // 重力反転中は天井から下へ跳ぶ
for(let i=0;i<6;i++)spawnParticle(mario.x+13,mario.y+mario.h,isDash?'star':'dust');
}
// === ジャンプ入力（キーボード・タッチ・パッド共通） ===
// 押した瞬間を最大 JUMP_BUFFER フレーム覚えておき（着地直前の入力を拾う）、
// 足場から落ちても COYOTE_FRAMES フレーム以内ならジャンプできる
const JUMP_BUFFER=8,COYOTE_FRAMES=6;
function queueJump(){if(G.state!=='play'||G.paused)return;if(mario.dead){if(G.deathTimer>0&&G.deathTimer<100)G.deathTimer=1;return;} // 死亡演出はジャンプで飛ばせる
G.jumpBuf=JUMP_BUFFER;G.jumpFresh=true;}
function _wallKick(){mario.vy=G.highJump?-16:-13;mario.vx=-mario.wallContact*5;mario.facing=-mario.wallContact;mario.wallContact=0;mario.wallContactTimer=0;mario.hipDrop=false;G.doubleJumpUsed=false;sfx('jump');for(let i=0;i<6;i++)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');}
function _airJump(){G.doubleJumpUsed=true;mario.vy=G.highJump?-16:-13;mario.hipDrop=false;sfx('jump');for(let i=0;i<8;i++)spawnParticle(mario.x+13,mario.y+mario.h,'star');}
// fresh: このフレームで押されたばかりか（2段ジャンプは先行入力では出さない）
function _tryJump(fresh){
  const _coyote=!G.waterMode&&!G.gravityFlipped&&G.coyote>0&&mario.vy>=0;
  if(mario.onGround||_coyote||(G.waterMode&&G.swimCooldown<=0)){G.doubleJumpUsed=false;G.coyote=0;doJump();return true;}
  if(mario.wallContact!==0){_wallKick();return true;}
  if(fresh&&G.doubleJump&&!G.doubleJumpUsed){_airJump();return true;}
  return false;
}
// === 角ずらし・着地補正 ===
// 上昇中に頭がブロックの角に数pxだけ当たった→横にずらして通す／落下中に足先が段差の角に数pxだけ届かなかった→上に乗せる
const CORNER_PX=6,LEDGE_PX=8;
// 中身入りブロック・?ブロックは角でも叩けるように対象外
function _nudgeable(p){return(p.type==='ground'||p.type==='brick')&&!p.coinBlock&&!p.hasMush&&!p.hasStar&&!p.has1UP&&!p.hasHammer&&!p.hasMega;}
function _spaceFree(x,y,w,h){for(const p of platforms){if(p.type==='hidden'&&!p.hit)continue;if(Math.abs(p.x-x)>96)continue;if(overlap(x,y,w,h,p.x,p.y-(p.bounceOffset||0),p.w,p.h))return false;}for(const p of pipes){if(Math.abs(p.x-x)>160)continue;if(overlap(x,y,w,h,p.x,p.y,p.w,p.h))return false;}return true;}
function _cornerNudge(){
  for(const p of platforms){if(!_nudgeable(p)||Math.abs(p.x-mario.x)>64)continue;const py=p.y-(p.bounceOffset||0);
    if(!overlap(mario.x+1,mario.y,mario.w-2,mario.h,p.x,py,p.w,p.h)||mario.y<py+p.h/2)continue;
    // 重なり量（縦判定は左右1px内側なので -1）が CORNER_PX 以下なら、フル幅で重ならない位置までずらす
    const oL=mario.x+mario.w-p.x,oR=p.x+p.w-mario.x;
    const dx=oL-1<=CORNER_PX?-oL:oR-1<=CORNER_PX?oR:0;
    if(dx&&_spaceFree(mario.x+dx,mario.y,mario.w,mario.h))mario.x+=dx;
    return;
  }
}
function _ledgeAssist(p){
  if(mario.vy<0||G.gravityFlipped||G.waterMode||p.ceiling||(p.type==='hidden'&&!p.hit))return false;
  const py=p.y-(p.bounceOffset||0);
  if(!overlap(mario.x,mario.y+2,mario.w,mario.h-4,p.x,py,p.w,p.h))return false;
  const dy=mario.y+mario.h-py;if(dy<=0||dy>LEDGE_PX)return false;
  if(!_spaceFree(mario.x,py-mario.h,mario.w,mario.h))return false;
  mario.y=py-mario.h;return true;
}
// === カメラ: 進行方向の先を多めに見せる（左へ走るときはマリオを画面右寄りに） ===
// 重力反転中の縦判定: 上向き(=落下方向)に当たったらブロック下面に着地、下向きなら上面で止まる（叩き判定なし）
function _cYFlipped(p){const py=p.y-(p.bounceOffset||0);if(!overlap(mario.x+1,mario.y,mario.w-2,mario.h,p.x,py,p.w,p.h))return;const _pTop=mario.y-mario.vy,_pBot=_pTop+mario.h,_down=mario.vy>0;const _below=_pTop>=py+p.h-1?true:(_pBot<=py+1?false:mario.y+mario.h/2>py+p.h/2);if(_below){mario.y=py+p.h;mario.vy=0;mario.onGround=true;}else{mario.y=py-mario.h;mario.vy=0;if(_down&&p.type)hitBlock(p);}}
function _followCam(limit){if(Math.abs(mario.vx)>1.5)G.camDir=mario.vx>0?1:-1;const lead=G.camDir<0?W*0.27:0;G.camLead+=(lead-G.camLead)*0.05;G.cam=Math.max(0,Math.min(mario.x-W/3-G.camLead,limit-W));}

function checkPipeEntry(){
if(G.ugMode){
  // EXワープパイプ（ピノキオ部屋から）
  for(const p of pipes){if(!p.isExWarp)continue;const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+4;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){G.exStageFrom={world:G.currentWorld,level:G.currentLevel};startExStage(p.exNum||1);return;}}
  for(const p of pipes){if(!p.isGoalPipe)continue;const _tol2=4;const onTop2=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+_tol2;const above2=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop2&&above2){sfx('flag');stopBGM();G.goalSlide={phase:'pipeGoal',t:0};mario.vx=0;mario.vy=0;for(let _gi=0;_gi<20;_gi++)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');return}}
  for(const p of pipes){if(!p.isExit)continue;if(p.horizontal){const touchLeft=mario.x+mario.w>=p.x-4&&mario.x+mario.w<=p.x+8;const vOverlap=mario.y+mario.h>p.y&&mario.y<p.y+p.h;if(touchLeft&&vOverlap){exitUnderground();return}}else{const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+4;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){exitUnderground();return}}}return}
for(const p of pipes){if(!p.isGoalPipe)continue;const _tol=G.waterMode?10:4;const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+_tol;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){sfx('flag');stopBGM();G.goalSlide={phase:'pipeGoal',t:0};mario.vx=0;mario.vy=0;for(let _gi=0;_gi<20;_gi++)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');return}}
for(const p of pipes){if(!p.isWarp||p.used)continue;const _ugKey=`${G.currentWorld}-${G.currentLevel}-${p.x}`;if(G.usedUndergrounds&&G.usedUndergrounds.has(_ugKey))continue;const _tol=G.waterMode?10:4;const onTop=mario.y+mario.h>=p.y-2&&mario.y+mario.h<=p.y+_tol;const above=mario.x+mario.w>p.x&&mario.x<p.x+p.w;if(onTop&&above){p.used=true;p.ugKey=_ugKey;enterUnderground(p);return}}
}
function enterUnderground(p){if(G.pswitchTimer>0)deactivatePSwitch();G.autoScroll=0;G.savedOW={platforms:[...platforms],pipes:[...pipes],coinItems:[...coinItems],enemies:[...enemies],mushrooms:[...mushrooms],piranhas:[...piranhas],movingPlats:[...movingPlats],springs:[...springs],cannons:[...cannons],chainChomps:[...chainChomps],jumpBlocks:[...jumpBlocks],pipos:[...pipos],gravityZones:[...gravityZones],windZones:[...windZones],rings:[...rings],lavaFlames:[...lavaFlames],sandstormMode:G.sandstormMode,tideMode:G.tideMode,tideLevel:G.tideLevel,chasingWall:G.chasingWall?{...G.chasingWall}:null,cam:G.cam,mx:mario.x,my:mario.y,waterMode:G.waterMode,darkMode:G.darkMode,lowGravity:G.lowGravity,checkpoint2:G.checkpoint2,ugKey:p.ugKey||null,ceilingEntry:!!p.ceiling,pipeBottom:p.ceiling?p.y+p.h:null};G.waterMode=false;G.darkMode=false;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.lowGravity=false;
// 土管ミニダンジョン（横長3200px）判定フラグ
G.pipeDungeon=!!(p.variant&&p.variant.indexOf('pipe')===0);
// 土管ミニダンジョンは入った瞬間に再入不可化（死亡後・チェックポイント再開でも戻れない）
if(p.ugKey){if(!G.usedUndergrounds)G.usedUndergrounds=new Set();G.usedUndergrounds.add(p.ugKey);}
platforms.length=0;pipes.length=0;coinItems.length=0;enemies.length=0;mushrooms.length=0;piranhas.length=0;movingPlats.length=0;springs.length=0;cannons.length=0;bulletBills.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;bowserShockwaves.length=0;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;rings.length=0;
buildUnderground(p.variant||'coin');
// 地下スポーン(x=60)周辺200px以内の敵を除去（即死防止）
for(let i=enemies.length-1;i>=0;i--){if(enemies[i].x<260)enemies.splice(i,1);}
G.cam=0;
mario.x=60;mario.y=H-3*TILE;mario.vx=0;mario.vy=0;
G.ugMode=true;G.score+=500;sfx('flag');stopBGM();try{startBGM()}catch(ex){}}
function exitUnderground(skipBonus){if(!G.savedOW||!G.savedOW.platforms)return;if(G.pswitchTimer>0){G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;}platforms.length=0;platforms.push(...G.savedOW.platforms);pipes.length=0;pipes.push(...G.savedOW.pipes);coinItems.length=0;coinItems.push(...G.savedOW.coinItems);enemies.length=0;enemies.push(...G.savedOW.enemies);mushrooms.length=0;mushrooms.push(...G.savedOW.mushrooms);piranhas.length=0;piranhas.push(...G.savedOW.piranhas);movingPlats.length=0;movingPlats.push(...(G.savedOW.movingPlats||[]));springs.length=0;springs.push(...(G.savedOW.springs||[]));cannons.length=0;cannons.push(...(G.savedOW.cannons||[]));bulletBills.length=0;fireballs.length=0;bowserFire.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;lavaFlames.push(...(G.savedOW.lavaFlames||[]));chainChomps.length=0;chainChomps.push(...(G.savedOW.chainChomps||[]));jumpBlocks.length=0;jumpBlocks.push(...(G.savedOW.jumpBlocks||[]));pipos.length=0;pipos.push(...(G.savedOW.pipos||[]));gravityZones.length=0;gravityZones.push(...(G.savedOW.gravityZones||[]));windZones.length=0;windZones.push(...(G.savedOW.windZones||[]));windParticles.length=0;iceBalls.length=0;marioHammers.length=0;rings.length=0;rings.push(...(G.savedOW.rings||[]));G.darkMode=G.savedOW.darkMode||false;G.chasingWall=G.savedOW.chasingWall||null;G.gravityFlipped=false;G.sandstormMode=G.savedOW.sandstormMode||false;G.tideMode=G.savedOW.tideMode||false;G.tideLevel=G.savedOW.tideLevel||H;
// 出口(元のパイプ位置)周辺200px以内の敵を除去（即死防止）
const _exitX=G.savedOW.mx;for(let i=enemies.length-1;i>=0;i--){if(Math.abs(enemies[i].x-_exitX)<200)enemies.splice(i,1);}
G.cam=G.savedOW.cam;mario.x=G.savedOW.mx;G.waterMode=G.savedOW.waterMode||false;
// 天井パイプから入った場合：パイプ底から自然落下。通常パイプ：上に飛び出す
if(G.savedOW.ceilingEntry){mario.y=(G.savedOW.pipeBottom??G.savedOW.my)+2;mario.vy=4;}
else{mario.y=G.savedOW.my-TILE*2;mario.vy=G.waterMode?-3:-10;}mario.inv=Math.max(mario.inv,90);G.ugMode=false;G.pipeDungeon=false;G.lowGravity=G.savedOW.lowGravity||false;if(G.savedOW.checkpoint2)G.checkpoint2=G.savedOW.checkpoint2;if(G.savedOW.ugKey){if(!G.usedUndergrounds)G.usedUndergrounds=new Set();G.usedUndergrounds.add(G.savedOW.ugKey);}G.savedOW=null;if(!skipBonus)G.score+=1000;updateHUD();sfx('flag');stopBGM();try{startBGM()}catch(ex){}
// ピノキオ部屋をリセット
G.pinoRoom=false;pinoObj.alive=false;G.pinoFlagReady=false;G.pinoFlagDelay=0;G.pinoSpeechText='';}

// === ピノキオ部屋 ===
function startExStage(num){num=num||1;
  // EXステージ起動: ピノキオ部屋から入る場合はexStageFromが設定済み
  // 元ステージの状態（中間地点・氷・旗位置・クッパ）は、下でリセットする前に保存しておく
  if(G.exStageFrom)G._exOrigin={checkpoint:G.checkpoint,checkpointReached:G.checkpointReached,checkpoint2:G.checkpoint2,iceMode:G.iceMode,flagX:flagPole.x,airshipMode:G.airshipMode,bowserRightX:G.bowserRightX,bowser:{...bowser}};
  flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;
  G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;
  G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.bowserRightX=0;
  iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;
  bowser.alive=false;bowserFire.length=0;bowserShockwaves.length=0;
  G.ugMode=false;G.exSavedOW=G.savedOW;G.savedOW=null;G.pinoRoom=false;pinoObj.alive=false;G.pinoFlagReady=false;G.pinoFlagDelay=0;G.pinoSpeechText='';
  G.isExStage=true;G.exStageNum=num;
  if(num===2){if(G.exStageFrom)G.ex2Used=true;buildExStage2();}else{if(G.exStageFrom)G.exStageUsed=true;buildExStage();}
  if(!G.exStageFrom){mario.big=false;mario.power='none';}
  fireballs.length=0;bowserFire.length=0;bowserShockwaves.length=0;
  resetMario();
  G.timeLeft=400;G.stageKills=0;G.stageMaxCombo=0;G.stageCoinsStart=G.coins;
  G.state='intro';G.introTimer=120;G.timerTick=null;
  updateHUD();sfx('flag');stopBGM();
}
function giveUpExStage(){
  if(!G.isExStage||mario.dead)return;
  G.paused=false;G.isExStage=false;G.lowGravity=false;G.pipeDungeon=false;
  if(G.pswitchTimer>0){G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;}
  flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;
  G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;
  G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.bowserRightX=0;
  iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;
  if(!G.exStageFrom){
    // メニューから入った場合→スタート画面へ
    G.exSavedOW=null;G.savedOW=null;mario.dead=false;mario.big=false;mario.power='none';
    resetMario();G.state='start';G.timerTick=null;stopBGM();updateHUD();return;
  }
  // ピノキオ部屋から入った場合→ピノキオ部屋へ戻る（残機減少なし）
  G.exStageFailed=true;
  G.savedOW=G.exSavedOW||{cam:0,mx:80,my:H-TILE,waterMode:false,ugKey:null};G.exSavedOW=null;_restoreExOrigin();
  platforms.length=0;pipes.length=0;coinItems.length=0;enemies.length=0;mushrooms.length=0;piranhas.length=0;movingPlats.length=0;springs.length=0;cannons.length=0;bulletBills.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;bowserShockwaves.length=0;
  buildUnderground('pinocchio_fail');
  G.cam=0;mario.x=60;mario.y=H-3*TILE;mario.vx=0;mario.vy=0;mario.dead=false;
  G.ugMode=true;G.pinoRoom=true;G.timeLeft=400;
  G.state='play';G.timerTick=null;
  startLevelTimer();
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
// 部屋の中に土管を生やす。マリオが立っている所に出たら土管の上に乗せる
// （乗せないと横判定で右の壁へ押し出され、土管と壁の間に閉じ込められて出られなくなっていた）
function _pushRoomPipe(p){
  pipes.push(p);
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,p.x,p.y,p.w,p.h)){mario.y=p.y-mario.h;mario.vy=0;mario.onGround=true;}
}
function spawnPinoExit(){
  // 出口パイプを画面右端付近に追加（地下の共通出口と同じ位置）
  _pushRoomPipe({x:W-3*TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
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
    _pushRoomPipe({x:TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExWarp:true,exNum:_exN});
    _pushRoomPipe({x:W-3*TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
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
  const _exAvail=G.ex1Cleared?!G.ex2Used:!G.exStageUsed;
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
function spawnYoshiEgg(x,y){yoshiItems.push({x,y:y-TILE,w:24,h:24,vy:-6,hatchTimer:75,hatched:false,onGround:false})}
function mountYoshi(){yoshi.mounted=true;sfx('yoshi_mount');spawnScorePopup(mario.x,mario.y-20,'YOSHI!','#2ecc71')}
function dismountYoshi(hurt){
yoshi.mounted=false;yoshi.tongueOut=0;yoshi.tongueLen=0;yoshi.eatTarget=null;yoshi.chewTimer=0;
if(hurt){yoshi.runAway=true;yoshi.runTimer=180;yoshi.vx=mario.facing*3;sfx('yoshi_dismount')}
}

// === タッチ/マウスのボタン操作 ===
// 指ごとに「今どのボタンの上にあるか」を追跡（ボタン間を指でスライドしても反応・マルチタッチ対応）
const _BTN_KEY={'btn-left':'left','btn-right':'right','btn-down':'down','btn-jump':'jump','btn-dash':'dash','btn-fire':'fire','btn-item':'item','btn-pause':'pause'};
function _btnPress(k){
  if(k in btn)btn[k]=true;
  if(G.menu){const m={left:'left',right:'right',down:'down',jump:'ok',fire:'back',dash:'back',pause:'back'}[k];if(m)menuCmd(m);return;}
  // メニュー画面: ◀▶▼=選択 / ジャンプ=決定 / ファイア=戻る / ポーズ=次へ
  if(G.state!=='play'){const m={left:'left',right:'right',down:'down',jump:'ok',fire:'back',pause:'start'}[k];if(m)menuCmd(m);return;}
  if(k==='jump')queueJump();
  else if(k==='pause'){if(!mario.dead)openPause();}
  else if(G.paused||mario.dead)return;
  else if(k==='fire'){if(yoshi.mounted&&yoshi.alive)yoshiAction();else marioAttack();}
  else if(k==='dash'){if(G.runFire)marioAttack();}
  else if(k==='item')useHeldItem();
}
function _btnRelease(k){if(k in btn)btn[k]=false;}
let _touchOn=new Set();
function _touchTrack(ev){
  ev.preventDefault();
  const now=new Set();
  for(const t of ev.touches){const el=document.elementFromPoint(t.clientX,t.clientY);const b=el&&el.closest?el.closest('.ctrl-btn'):null;if(b&&_BTN_KEY[b.id])now.add(b.id);}
  for(const id of now)if(!_touchOn.has(id)){document.getElementById(id).classList.add('pressed');_btnPress(_BTN_KEY[id]);}
  for(const id of _touchOn)if(!now.has(id)){document.getElementById(id).classList.remove('pressed');_btnRelease(_BTN_KEY[id]);}
  _touchOn=now;
}
{const _ctl=document.getElementById('controls');
if(_ctl)for(const t of ['touchstart','touchmove','touchend','touchcancel'])_ctl.addEventListener(t,_touchTrack,{passive:false});
for(const id in _BTN_KEY){const el=document.getElementById(id);if(!el)continue;
  // HUD上のボタン（ポーズ）は #controls の外なので個別にタッチを拾う
  if(!_ctl||!_ctl.contains(el))el.addEventListener('touchstart',e=>{e.preventDefault();_btnPress(_BTN_KEY[id]);setTimeout(()=>_btnRelease(_BTN_KEY[id]),50);},{passive:false});
  // PCでボタンをマウスでクリックした場合
  el.addEventListener('mousedown',e=>{e.preventDefault();el.classList.add('pressed');_btnPress(_BTN_KEY[id]);});
  const up=()=>{if(el.classList.contains('pressed')){el.classList.remove('pressed');_btnRelease(_BTN_KEY[id]);}};
  el.addEventListener('mouseup',up);el.addEventListener('mouseleave',up);}
// 全画面ボタン（タッチ端末のみ表示）
const _fs=document.getElementById('btn-fs');
if(_fs){if(!document.fullscreenEnabled)_fs.style.display='none';
  _fs.addEventListener('click',()=>{try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen().then(()=>{try{screen.orientation.lock('landscape').catch(()=>{});}catch(e){}}).catch(()=>{});}catch(e){}});}}
canvas.addEventListener('click',(ev)=>{if(G.menu){const _p=canvasPoint(canvas,ev.clientX,ev.clientY);_menuTap(_p.x,_p.y);return;}if(G.state==='start'){const {x:cx,y:cy}=canvasPoint(canvas,ev.clientX,ev.clientY);
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
{const _tb=_titleBtns();if(_inRect(cx,cy,_tb.cont)){if(hasSave())loadSave();return;}if(_inRect(cx,cy,_tb.settings)){G.selectedStage=STAGES.length+4;_openSettings();return;}if(_inRect(cx,cy,_tb.slot)){G.selectedStage=STAGES.length+5;switchSlot();return;}}
return;}if(G.state==='shop'){const {x:cx,y:cy}=canvasPoint(canvas,ev.clientX,ev.clientY);_shopTap(cx,cy);return;}if(G.state!=='play')menuCmd('ok');});
// タッチでキャラクター選択（モバイル対応・即時反応）
canvas.addEventListener('touchstart',(ev)=>{if(G.state==='start'&&!G.menu){const t=ev.touches[0];const {x:cx,y:cy}=canvasPoint(canvas,t.clientX,t.clientY);
const _tcW=120,_tcH=52,_tcY=42,_tcGap=8;const _tcMx=W/2-_tcW-_tcGap/2,_tcLx=W/2+_tcGap/2;
if(cy>=_tcY&&cy<=_tcY+_tcH){
  if(cx>=_tcMx&&cx<=_tcMx+_tcW){G.character='mario';try{localStorage.setItem('mario_v2_char','mario');}catch(e){}ev.preventDefault();return;}
  if(cx>=_tcLx&&cx<=_tcLx+_tcW){G.character='luigi';try{localStorage.setItem('mario_v2_char','luigi');}catch(e){}ev.preventDefault();return;}
}}},{passive:false});

// === メニュー（ポーズ・設定・キーコンフィグ・操作説明・確認） ===
// G.menu に開いている画面を持つ（prev=戻り先）。プレイ中に開いたときは G.paused でゲームを止める
function openPause(){if(G.state!=='play'||mario.dead||G.menu||G.goalSlide||G.peachChase||(bowser.alive&&bowser.state==='dead'))return;G.paused=true;G.menu={type:'pause',cur:0};try{beep(660,.05,'square',.08);beep(990,.08,'square',.08,.05)}catch(e){}}
function closeMenus(){G.menu=null;G.paused=false;}
function _menuBack(){const m=G.menu;if(!m)return;if(m.type==='pause')closeMenus();else G.menu=m.prev||null;}
function _confirm(text,sub,onYes){G.menu={type:'confirm',text,sub,cur:1,onYes,prev:G.menu};}
function _pauseItems(){
  const it=[{label:'RESUME',desc:'ゲームにもどる',act:closeMenus}];
  if(G.isExStage)it.push({label:'GIVE UP',desc:G.exStageFrom?'EXステージをあきらめてピノキオ部屋へ':'EXステージをやめてタイトルへ',act:()=>{G.menu=null;giveUpExStage();}});
  else it.push({label:'RETRY',desc:'ミス扱いでやりなおす（中間地点から・残機-1）',act:()=>_confirm('やりなおしますか？',G.lives<=1?'残機が0になりゲームオーバーです':`残機が1減ります（のこり ${G.lives-1}）`,()=>{closeMenus();killMario(true);})});
  it.push({label:'SETTINGS',desc:'音量・操作・画面の設定',act:()=>{G.menu={type:'settings',cur:0,prev:G.menu};}});
  it.push({label:'HOW TO PLAY',desc:'操作説明',act:()=>{G.menu={type:'help',prev:G.menu};}});
  it.push({label:'TITLE',desc:'タイトル画面にもどる',act:()=>_confirm('タイトルにもどりますか？','最後にセーブしてからの進行は失われます',returnToTitle)});
  return it;
}
const _pct=v=>Math.round(v*100)+'%',_onoff=b=>b?'ON':'OFF';
function _applyAudio(){if(bgmGain)bgmGain.gain.value=G.bgmMuted?0:G.bgmVolume;setSeVolume(G.seVolume);}
function _settingsItems(){const m=G.menu;const cyc=(arr,v,d)=>arr[(arr.indexOf(v)+d+arr.length)%arr.length];const step=(v,d)=>Math.round(Math.min(1,Math.max(0,v+d*0.1))*10)/10;return[
  {label:'BGM VOLUME',desc:'BGMの音量（Mキーでミュート）',val:()=>G.bgmMuted?'MUTE':_pct(G.bgmVolume),adj:d=>{G.bgmMuted=false;G.bgmVolume=step(G.bgmVolume,d);_applyAudio();}},
  {label:'SE VOLUME',desc:'効果音の音量',val:()=>_pct(G.seVolume),adj:d=>{G.seVolume=step(G.seVolume,d);_applyAudio();sfx('coin');}},
  {label:'SCREEN SHAKE',desc:'画面の揺れ',val:()=>_onoff(G.optShake),adj:()=>{G.optShake=!G.optShake;}},
  {label:'REDUCE FLASH',desc:'稲光などの画面の点滅をおさえる',val:()=>_onoff(G.optReduceFlash),adj:()=>{G.optReduceFlash=!G.optReduceFlash;}},
  {label:'RUN + FIRE',desc:'ダッシュとファイアを同じボタンにする（SMB式）',val:()=>_onoff(G.runFire),adj:()=>{G.runFire=!G.runFire;}},
  {label:'PAD LAYOUT',desc:G.padLayout==='modern'?'下=ジャンプ 左=ダッシュ 右=ファイア 上=ヨッシー':'下=B(ダッシュ) 右=A(ジャンプ) 左=Y(ファイア) 上=X(ヨッシー)',val:()=>G.padLayout==='modern'?'MODERN':'SNES',adj:()=>{G.padLayout=G.padLayout==='modern'?'snes':'modern';}},
  {label:'TOUCH BUTTONS',desc:'タッチ操作ボタンの大きさ',val:()=>_pct(G.touchSize),adj:d=>{G.touchSize=cyc([1,1.25,1.5],G.touchSize,d);applyTouchSize();}},
  {label:'KEY CONFIG',desc:'キーボードの割り当てを変える',act:()=>{G.menu={type:'keys',row:0,col:0,msg:'',prev:m};}},
  {label:'HOW TO PLAY',desc:'操作説明',act:()=>{G.menu={type:'help',prev:m};}},
  {label:'BACK',desc:'',act:_menuBack},
];}
export function _menuItems(){const m=G.menu;return m.type==='pause'?_pauseItems():m.type==='settings'?_settingsItems():[];}
function _menuInput(c){const m=G.menu;if(!m)return;
  if(m.type==='confirm'){if(c==='left'||c==='right'||c==='up'||c==='down')m.cur=1-m.cur;else if(c==='ok'||c==='start'){G.menu=m.prev;if(m.cur===0)m.onYes();}else if(c==='back')G.menu=m.prev;return;}
  if(m.type==='help'){if(c==='ok'||c==='back'||c==='start')G.menu=m.prev;return;}
  if(m.type==='keys'){_keysInput(c);return;}
  const items=_menuItems(),n=items.length;
  if(c==='up')m.cur=(m.cur+n-1)%n;else if(c==='down')m.cur=(m.cur+1)%n;
  else if(c==='back')_menuBack();
  else{const it=items[m.cur];if(!it)return;
    if((c==='left'||c==='right')&&it.adj){it.adj(c==='left'?-1:1);saveAudioOpts();}
    else if(c==='ok'||c==='start'){if(it.act)it.act();else if(it.adj){it.adj(1);saveAudioOpts();}}}
  if(c==='up'||c==='down')try{beep(520,.03,'square',.05)}catch(e){}
}
// キーコンフィグ: 行=アクション(+初期化/もどる)、列=キー1〜3
const _KEY_ROWS=ACTIONS.length+2;
function _keysInput(c){const m=G.menu;
  if(m.waiting){if(c==='back'){m.waiting=false;m.msg='';}return;}
  if(c==='up')m.row=(m.row+_KEY_ROWS-1)%_KEY_ROWS;
  else if(c==='down')m.row=(m.row+1)%_KEY_ROWS;
  else if(c==='left'&&m.row<ACTIONS.length)m.col=(m.col+SLOTS-1)%SLOTS;
  else if(c==='right'&&m.row<ACTIONS.length)m.col=(m.col+1)%SLOTS;
  else if(c==='back')_menuBack();
  else if(c==='ok'||c==='start'){
    if(m.row===ACTIONS.length){resetAndSaveBinds();updateKeyHint();m.msg='初期設定にもどしました';}
    else if(m.row===ACTIONS.length+1)_menuBack();
    else{m.waiting=true;m.msg='';}}
}
// 入力待ち中に押されたキーを割り当てる（ESCで取り消し。他アクションの唯一のキーは奪わない）
function _keyCapture(code){const m=G.menu,a=ACTIONS[m.row];
  if(code==='Escape'){m.waiting=false;m.msg='';return;}
  if(RESERVED.has(code)){m.msg='そのキーは使えません';return;}
  for(const o of ACTIONS)if(o!==a&&binds[o].length===1&&binds[o][0]===code){m.msg=`${ACTION_LABEL[o]} のただ1つのキーなので使えません`;return;}
  setBind(a,m.col,code);m.waiting=false;m.msg=`${ACTION_LABEL[a]} に ${keyLabel(code)} を割り当てました`;updateKeyHint();
}
function _keyClear(){const m=G.menu;if(m.row>=ACTIONS.length)return;const a=ACTIONS[m.row];if(m.col>=binds[a].length)return;
  if(binds[a].length<=1){m.msg='キーが無くなるため消せません';return;}clearBind(a,m.col);m.msg='';updateKeyHint();}
// メニューの配置（描画とタップ判定で共通）
export const _MP={x:(W-500)/2,y:34,w:500,h:382};
export function _menuRowRects(n){const top=_MP.y+62,rh=Math.min(30,Math.floor(270/n)),r=[];for(let i=0;i<n;i++)r.push({x:_MP.x+24,y:top+i*rh,w:_MP.w-48,h:rh-3});return r;}
export const _CF={x:(W-420)/2,y:(H-170)/2,w:420,h:170};
export function _confirmBtns(){return[{x:_CF.x+50,y:_CF.y+110,w:140,h:36},{x:_CF.x+230,y:_CF.y+110,w:140,h:36}];}
export function _keysLayout(){const top=_MP.y+62,rh=24,x0=_MP.x+30,labelW=150,cw=96;return{top,cell:(r,c)=>({x:x0+labelW+c*(cw+6),y:top+r*rh,w:cw,h:rh-4}),row:r=>({x:x0,y:top+r*rh,w:_MP.w-60,h:rh-4})};}
function _menuTap(x,y){const m=G.menu;
  if(m.type==='confirm'){const b=_confirmBtns();if(_inRect(x,y,b[0])){m.cur=0;_menuInput('ok');}else if(_inRect(x,y,b[1])){m.cur=1;_menuInput('ok');}return;}
  if(m.type==='help'){_menuInput('back');return;}
  if(m.type==='keys'){if(m.waiting)return;const L=_keysLayout();
    for(let r=0;r<ACTIONS.length;r++)for(let c=0;c<SLOTS;c++)if(_inRect(x,y,L.cell(r,c))){m.row=r;m.col=c;_keysInput('ok');return;}
    for(const r of [ACTIONS.length,ACTIONS.length+1])if(_inRect(x,y,L.row(r))){m.row=r;_keysInput('ok');return;}
    return;}
  const items=_menuItems(),rows=_menuRowRects(items.length);
  for(let i=0;i<rows.length;i++){if(!_inRect(x,y,rows[i]))continue;m.cur=i;const it=items[i];
    if(it.adj){it.adj(x<rows[i].x+rows[i].w-80?-1:1);saveAudioOpts();}else if(it.act)it.act();return;}
}

// === GAMEPAD ===
const gpad={ok:false,back:false,left:false,right:false,up:false,down:false,a:false,b:false,x:false,y:false,start:false,select:false,l:false,r:false};
const _gpPrev={};export let _gpConnected=false,_gpName='';
const _SHOP_ITEMS=[
  {key:'mushroom',cost:50},
  {key:'fire',cost:100},{key:'1up',cost:100},{key:'ice',cost:100},
  {key:'hammer',cost:190},
  {key:'retryHeart',cost:200},{key:'star10',cost:200},
  {key:'1upSet',cost:250},
  {key:'1upSet6',cost:400},
  {key:'doubleJump',cost:600},
  {key:'magnet',cost:650},
  {key:'star30',cost:1000},
  {key:'bundle',cost:1300}
];
export const _SINGLE_ONLY=new Set(['mushroom','fire','ice','hammer']);
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
  let _ns=G.nextStage;bowser.alive=false;bowserFire.length=0;bowserShockwaves.length=0;peach.alive=false;G.peachChase=null;
  G.currentWorld=_ns.world;G.currentLevel=_ns.level;flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.usedUndergrounds=new Set();G.lowGravity=false;G.pipeDungeon=false;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;_ns.build();fireballs.length=0;bowserFire.length=0;bowserShockwaves.length=0;resetMario();
  {const _up=_sb.hammer?'hammer':_sb.ice?'ice':_sb.fire?'fire':(_sb.mushroom&&mario.power==='none')?'big':null;
  if(_up){if(mario.h!==48){mario.h=48;mario.y-=16;}mario.big=true;mario.power=_up;}}
  G.timeLeft=400;G.stageKills=0;G.stageMaxCombo=0;G.stageCoinsStart=G.coins;G.doubleJumpUsed=false;G.stageFrames=0;
  G.state='intro';G.introTimer=120;G.timerTick=null;
  G.starTimer+=(_sb.star10||0)*600+(_sb.star30||0)*1800;
  if(_sb.magnet)G.coinMagnet=true;
  if(_sb.doubleJump)G.doubleJump=true;
  if(_sb.retryHeart)G.retryHeart+=(_sb.retryHeart||0);
  G.stageDamaged=false;G.shopBought=null;G.nextStage=null;updateHUD();stopBGM();
  saveGame();
}
// ゲームパッドのボタン配置（設定で切替）
// snes  : スーファミ配置 下=B(ダッシュ) 右=A(ジャンプ) 左=Y(ファイア) 上=X(ヨッシー)
// modern: 現行機配置   下=ジャンプ 左=ダッシュ 右=ファイア 上=ヨッシー（決定=下/戻る=右）
let _gpLayoutSeen=null;
const _PAD_LAYOUT={snes:{jump:1,dash:0,fire:2,yoshi:3,ok:1,back:0},modern:{jump:0,dash:2,fire:1,yoshi:3,ok:0,back:1}};
function pollGamepad(){
  const gps=navigator.getGamepads?navigator.getGamepads():[];let gp=null;
  for(let i=0;i<4;i++){if(gps[i]){gp=gps[i];break;}}
  if(!gp){_gpConnected=false;for(const k in gpad)gpad[k]=false;return;}
  _gpConnected=true;_gpName=gp.id||'';
  const dz=0.5,B=i=>gp.buttons[i]?.pressed||false;
  // 十字キー: アナログスティック + 標準配置の十字ボタン(12-15)
  gpad.left=(gp.axes[0]<-dz)||B(14);gpad.right=(gp.axes[0]>dz)||B(15);
  gpad.up=(gp.axes[1]<-dz)||B(12);gpad.down=(gp.axes[1]>dz)||B(13);
  const P=_PAD_LAYOUT[G.padLayout]||_PAD_LAYOUT.snes;
  gpad.a=B(P.jump);gpad.b=B(P.dash);gpad.y=B(P.fire);gpad.x=B(P.yoshi);gpad.ok=B(P.ok);gpad.back=B(P.back);
  gpad.l=B(4);gpad.r=B(5);gpad.select=B(6)||B(8);gpad.start=B(7)||B(9);
  if(_gpLayoutSeen!==G.padLayout){_gpLayoutSeen=G.padLayout;for(const k in gpad)_gpPrev[k]=gpad[k];}
  const jp=k=>gpad[k]&&!_gpPrev[k]; // 押した瞬間
  if(G.menu){
    for(const d of ['left','right','up','down'])if(jp(d))menuCmd(d);
    if(jp('ok'))menuCmd('ok');else if(jp('back')||jp('start'))menuCmd('back');
  }else if(G.state==='play'){
    if(jp('a'))queueJump();
    if(!G.paused&&!mario.dead){
      if(jp('y')||(G.runFire&&jp('b')))marioAttack();
      if(jp('x')&&yoshi.mounted&&yoshi.alive)yoshiAction();
      if(jp('select'))useHeldItem();
    }
    if(jp('start')&&!mario.dead)openPause();
    if(jp('l')){G.bgmVolume=Math.max(0,G.bgmVolume-0.1);if(bgmGain&&!G.bgmMuted)bgmGain.gain.value=G.bgmVolume;saveAudioOpts();}
    if(jp('r')){G.bgmVolume=Math.min(1,G.bgmVolume+0.1);if(bgmGain&&!G.bgmMuted)bgmGain.gain.value=G.bgmVolume;saveAudioOpts();}
  }else{
    for(const d of ['left','right','up','down'])if(jp(d))menuCmd(d);
    if(jp('ok'))menuCmd('ok');else if(jp('back'))menuCmd('back');
    if(jp('start'))menuCmd('start');
    if(G.state==='start'&&(jp('l')||jp('r')))menuCmd('char');
  }
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
  if(!c.collected&&!c.type&&!c.pop){c._psHidden=true;G._psBricks.push(c);
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
if(!mario.dead&&G.state==='play'){stopBGM();try{startBGM()}catch(e){}}
}

// === 敵の耐性（スライディング・甲羅・ブロック下叩き・ヨッシーのタマゴ・アイス・ファイア共通） ===
// 戻り値: 'kill'=呼び出し側で通常どおり倒す / 'handled'=ここで特別な反応をした / 'immune'=効かない
// 以前は手段ごとにバラバラで、ドッスン・テレサが甲羅やアイスで倒せたり、チャック(HP3)が一撃だったりした
function _enemyHit(e,src){
  const t=e.type;
  if(t==='thwomp'||t==='teresa'||t==='miniBowser'||t==='bowser')return'immune';
  if(e._hitCD>0)return'immune'; // 同じ攻撃が数フレーム重なっても1回だけ
  e._hitCD=20;
  if(t==='chuck'){e.hp=(e.hp||3)-1;G.score+=200;sfx('stomp');spawnScorePopup(e.x+8,e.y-8,200,'#e74c3c');
    if(e.hp<=0){e.state='dead';e.squishT=28;e.vx=0;G.stageKills++;G.totalKills++;}else{e.state='stun';e.stunTimer=60;e.vx=0;}updateHUD();return'handled';}
  if(t==='dryBones'){if(e.state!=='collapsed'){e.state='collapsed';e.collapseTimer=180;e.vx=0;G.score+=100;sfx('stomp');spawnScorePopup(e.x+8,e.y-8,100,'#ddd');}return'handled';}
  if(t==='bobomb'){if(e.state==='walk'){e.state='lit';e.litTimer=120;sfx('stomp');}return'handled';}
  return'kill';
}
// スライディング中に触れた敵を倒す（移動の前と後の2回呼ぶ: 敵との接触判定で先にやられていた）
function _slideHits(){for(const e of enemies){if(!e.alive||e.state==='dead'||e.frozen)continue;if(!overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h))continue;
  if(e.type==='koopa'||e.type==='buzzy'){if(e.state==='walk'){const _oh=e.h;e.state='shell';e.vx=mario.facing*8;e.h=TILE*0.7;e.y+=_oh-e.h;e.shellTimer=300;mario.inv=Math.max(mario.inv,10);}else if(e.state==='shell'&&Math.abs(e.vx)<0.5){e.vx=mario.facing*8;mario.inv=Math.max(mario.inv,10);}}
  else if(_enemyHit(e,'slide')==='kill'){e.state='dead';e.squishT=28;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');spawnScorePopup(e.x+16,e.y-8,200,'#e74c3c');}
}}

// === HIT BLOCK ===
function hitBlock(p,fromAbove=false){
if(p.type==='chest'){return}// 宝箱は上から踏む（pinoRoomブロックで処理）
// 真上がブロックや土管でふさがっていたら下に出す（上に出すと埋まって取れなかった）
const _below=fromAbove||_solidsNear(p.x,96).some(q=>q!==p&&q.type!=='hidden'&&q.type!=='coin'&&overlap(p.x+4,p.y-TILE+2,p.w-8,TILE-4,q.x,q.y-(q.bounceOffset||0),q.w,q.h));
const _sy=_below?p.y+p.h:p.y-TILE; // アイテムスポーン位置（上叩き=上/下踏み=下）
const _svy=_below?3:0; // 下から出る場合は落下速度付与
// ブロックを下から叩いた時、上に乗っている敵を倒す
for(const _be of enemies){
  if(!_be.alive||_be.state==='dead')continue;
  if(_be.type==='miniBowser'||_be.type==='thwomp'||_be.type==='teresa'||_be.type==='bowser'||_be.type==='angrySun'||_be.type==='lakitu'||_be.type==='fuzzy'||_be.type==='blooper'||_be.type==='cheepH'||_be.type==='cheepV'||_be.type==='firePlant'||_be.type==='plantFire')continue;
  if(_be===mario.heldShell)continue;
  if(Math.abs((_be.x+_be.w/2)-(p.x+p.w/2))<p.w/2+_be.w/2 && _be.y+_be.h>=p.y-6 && _be.y+_be.h<=p.y+10 && _enemyHit(_be,'block')==='kill'){
    _be.alive=false;
    G.score+=200;G.stageKills++;G.totalKills++;updateHUD();
    for(let _bi=0;_bi<6;_bi++)spawnParticle(_be.x+_be.w/2+(Math.random()-0.5)*_be.w,_be.y+_be.h/2,'star');
    spawnScorePopup(_be.x+8,_be.y-8,200,'#e74c3c');
    sfx('stomp');
  }
}
if(p.type==='pswitch'&&!p.hit){activatePSwitch(p);return}
if(p.type==='pswitch_block'){return}// temp P-Switch blocks are not hittable
if(p.type==='yoshiEgg'&&!p.hit){p.hit=true;p.type='question';sfx('qblock');blockAnims.push({p,t:0});spawnYoshiEgg(p.x,p.y);return}
if(p.type==='hidden'&&!p.hit){p.hit=true;p.type='question';sfx('qblock');blockAnims.push({p,t:0});if(p.has1UP){mushrooms.push({x:p.x+4,y:p.y-TILE,w:24,h:TILE,vx:1.5,vy:0,alive:true,type:'1up'});sfx('1up')}return}
if(p.type==='question'&&!p.hit){
if(p.coinBlock&&p.hitsLeft>0){p.hitsLeft--;if(p.hitsLeft<=0)p.hit=true;sfx('coin');blockAnims.push({p,t:0});spawnParticle(p.x+16,p.y,'coin');spawnScorePopup(p.x+16,p.y-8,200,'#FFD700');G.score+=200;G.coins+=(G.character==='luigi'?2:1);updateHUD()}
else if(p.has1UP){p.hit=true;sfx('qblock');blockAnims.push({p,t:0});mushrooms.push({x:p.x+4,y:_sy,w:24,h:TILE,vx:1.5,vy:_svy,alive:true,type:'1up'});sfx('1up')}
else if(p.hasStar){p.hit=true;sfx('power');blockAnims.push({p,t:0});mushrooms.push({x:p.x+4,y:_sy,w:24,h:24,vx:0,vy:_svy,alive:true,type:'star',fromAbove:fromAbove})}
else{p.hit=true;sfx('qblock');blockAnims.push({p,t:0});
if(p.hasMega){mushrooms.push({x:p.x+4,y:_sy,w:28,h:TILE+8,vx:1.5,vy:_svy,alive:true,type:'mega',fromAbove:fromAbove})}
else if(p.hasHammer){mushrooms.push({x:p.x+4,y:_sy,w:24,h:24,vx:0,vy:_svy,alive:true,type:'hammerSuit',fromAbove:fromAbove})}
else if(p.hasMush){if(mario.power==='none')mushrooms.push({x:p.x+4,y:_sy,w:24,h:TILE,vx:1.5,vy:_svy,alive:true,type:'mushroom'});else mushrooms.push({x:p.x+4,y:_sy,w:24,h:24,vx:0,vy:_svy,alive:true,type:G.iceMode?'iceFlower':'flower',fromAbove:fromAbove})}
else{spawnParticle(p.x+16,p.y,'coin');spawnScorePopup(p.x+16,p.y-8,200,'#FFD700');G.score+=200;G.coins+=(G.character==='luigi'?2:1);sfx('coin');updateHUD()}}}
else if(p.type==='brick'){if(mario.big){sfx('break');G.score+=50;updateHUD();spawnParticle(p.x+16,p.y,'brick');spawnScorePopup(p.x+16,p.y-8,50,'#e67e22');const idx=platforms.indexOf(p);if(idx!==-1)platforms.splice(idx,1)}else{blockAnims.push({p,t:0})}}}

// === GAME MANAGEMENT ===
function startFromStage(id){G.deathTimer=0;G.pinoExitTimer=0;bowser.alive=false;bowserFire.length=0;bowserShockwaves.length=0;peach.alive=false;G.peachChase=null;G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;G.usedUndergrounds=new Set();yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.runAway=false;G.pinoRoom=false;G.isExStage=false;G.exStageFrom=null;pinoObj.alive=false;const _ss=getStageById(id);if(!_ss)return;G.currentWorld=_ss.world;G.currentLevel=_ss.level;flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.bowserRightX=0;G.lowGravity=false;G.pipeDungeon=false;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;_ss.build();mario.big=false;mario.power='none';fireballs.length=0;resetMario();G.timeLeft=400;G.stageKills=0;G.stageMaxCombo=0;G.stageCoinsStart=G.coins;G.stageFrames=0;G.coinMagnet=false;G.doubleJump=false;G.doubleJumpUsed=false;G.retryHeart=0;G.highJump=false;G.heldItem=null;G.stageDamaged=false;G.state='intro';G.introTimer=120;G.timerTick=null;updateHUD();try{AC.resume()}catch(e){}}
function startGame(){G.deathTimer=0;G.pinoExitTimer=0;bowser.alive=false;bowserFire.length=0;bowserShockwaves.length=0;peach.alive=false;G.peachChase=null;G.usedUndergrounds=new Set();G.exStageUsed=false;G.ex1Cleared=false;G.ex2Used=false;G.exStageNum=1;G.lowGravity=false;G.pipeDungeon=false;clearProgress(G.saveSlot);
// ゲームオーバー→完全リセット：全モードフラグ/タイマー/特殊配列をクリア
G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.runAway=false;G.pinoRoom=false;G.isExStage=false;G.exStageFrom=null;pinoObj.alive=false;
G.currentWorld=1;G.currentLevel=1;flagPole.x=LW-500;
G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint=null;G.checkpointReached=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.bowserRightX=0;G.autoScroll=0;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.starTimer=0;G.combo=0;G.comboTimer=0;
iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;bowserShockwaves.length=0;
const _sg=getStage(1,1);if(_sg){_sg.build();}mario.big=false;mario.power='none';fireballs.length=0;resetMario();G.heldItem=null;G.stageDamaged=false;G.timeLeft=400;G.stageKills=0;G.stageMaxCombo=0;G.stageCoinsStart=G.coins;G.stageFrames=0;G.coinMagnet=false;G.doubleJump=false;G.doubleJumpUsed=false;G.retryHeart=0;G.highJump=false;G.state='intro';G.introTimer=120;G.timerTick=null;updateHUD();try{AC.resume()}catch(e){}}
function restartCurrentLevel(){G.deathTimer=0;G.pinoExitTimer=0;bowser.alive=false;bowserFire.length=0;bowserShockwaves.length=0;peach.alive=false;G.peachChase=null;G.checkpoint=null;G.checkpointReached=false;G.starTimer=0;G.autoScroll=0;G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.runAway=false;G.pinoRoom=false;G.isExStage=false;G.exStageFrom=null;pinoObj.alive=false;const _rs=getStage(G.currentWorld,G.currentLevel);if(_rs){flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.bowserRightX=0;G.lowGravity=false;G.pipeDungeon=false;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;_rs.build();}mario.big=false;mario.power='none';fireballs.length=0;resetMario();G.timeLeft=400;G.stageFrames=0;G.coinMagnet=false;G.doubleJump=false;G.doubleJumpUsed=false;G.retryHeart=0;G.highJump=false;G.heldItem=null;G.stageDamaged=false;G.state='intro';G.introTimer=120;G.timerTick=null;updateHUD();try{AC.resume()}catch(e){}}
function killMario(force=false){
if(mario.dead||G.state!=='play')return;
if(G.goalSlide||G.peachChase||(bowser.alive&&bowser.state==='dead'))return; // クリア演出中はやられない
if(!force&&(G.starTimer>0||mario.inv>0||G.megaTimer>0))return;
if(!force&&yoshi.mounted&&yoshi.alive&&!mario.crouching){dismountYoshi(true);mario.inv=120;return}
G.stageDamaged=true;
if(!force&&G.megaTimer>0){G.megaTimer=0;mario.power=G.megaPrevPower;mario.big=G.megaPrevBig;{const _nh=mario.big?48:32;mario.y+=mario.h-_nh;mario.h=_nh;}mario.crouching=false;mario.inv=120;sfx('break');return}
if(!force&&(mario.power==='fire'||mario.power==='ice'||mario.power==='hammer')){mario.power='big';mario.inv=120;sfx('break');return}
if(!force&&mario.power==='big'){mario.power='none';mario.big=false;{const _nh=mario.crouching?20:32;mario.y+=mario.h-_nh;mario.h=_nh;}mario.inv=120;sfx('break');return}
// リトライハート: 死亡回避、その場復活
if(!force&&G.retryHeart>0){G.retryHeart--;mario.inv=240;mario.vy=-14;sfx('1up');sfx('power');try{beep(880,0.15,'square',0.2);beep(1320,0.2,'square',0.18,0.05);beep(1760,0.25,'triangle',0.15,0.12);}catch(e){}G.shakeX=22;G.shakeY=22;for(let i=0;i<50;i++)spawnParticle(mario.x+13+(Math.random()-0.5)*48,mario.y+16+(Math.random()-0.5)*48,'star');spawnScorePopup(mario.x+13,mario.y-20,'REVIVE!!','#ff3355');spawnScorePopup(mario.x+13,mario.y-44,`❤️ x${G.retryHeart}`,'#ff88aa');return;}
if(yoshi.mounted&&yoshi.alive){yoshi.mounted=false;yoshi.alive=false;}
// 死亡時に特殊効果リセット（チェックポイント復帰用に保存）
G._deathSv={magnet:G.coinMagnet,jump:G.doubleJump,retry:G.retryHeart,highJump:G.highJump};
G.coinMagnet=false;G.doubleJump=false;G.doubleJumpUsed=false;G.retryHeart=0;G.highJump=false;
G.lives--;G.combo=0;sfx('die');stopBGM();mario.dead=true;mario.vy=-11;G.shakeX=8;G.shakeY=8;updateHUD();
G.deathTimer=132;} // 死亡演出後の処理はフレーム数で待つ（ポーズ中に進まないように）
// 死亡演出が終わった後の処理（EX失敗→ピノキオ部屋／残機0→ゲームオーバー／CP復帰／最初から）
function _afterDeath(){
if(G.state!=='play')return; // 演出中に画面が切り替わっていたら何もしない（保険）
// EXステージ失敗→ピノキオ部屋へ戻る（残機減少を打ち消す）
if(G.isExStage&&!G.exStageFrom){G.lives++;mario.dead=false;startExStage(G.exStageNum||1);return;}
if(G.isExStage){G.lives++;G.isExStage=false;G.exStageFailed=true;G.lowGravity=false;G.pipeDungeon=false;
  G.savedOW=G.exSavedOW||{cam:0,mx:80,my:H-TILE,waterMode:false,ugKey:null};G.exSavedOW=null;
  if(G.pswitchTimer>0){G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;}
  flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.bowserRightX=0;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;
  platforms.length=0;pipes.length=0;coinItems.length=0;enemies.length=0;mushrooms.length=0;piranhas.length=0;movingPlats.length=0;springs.length=0;cannons.length=0;bulletBills.length=0;hammers.length=0;yoshiEggs.length=0;yoshiItems.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;bowserShockwaves.length=0;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;
  _restoreExOrigin(); // 元ステージの状態は上のリセットの後で戻す
  buildUnderground('pinocchio_fail');
  G.cam=0;mario.x=60;mario.y=H-3*TILE;mario.vx=0;mario.vy=0;mario.dead=false;mario.big=false;mario.power='none';
  G.ugMode=true;G.pinoRoom=true;G.timeLeft=400;
  G.state='play';startLevelTimer();
  sfx('flag');stopBGM();try{startBGM()}catch(ex){};return;}
if(G.lives<=0){G.state='over';clearProgress(G.saveSlot);G.timerTick=null;try{playGameOverJingle();}catch(ex){}}else{
if(G.checkpointReached&&G.checkpoint){
// チェックポイント位置とクッパCP到達状態を保存
const _cpx=G.checkpoint.x,_cpy=G.checkpoint.y;const _cp2r=G.checkpoint2&&G.checkpoint2.reached;
G.pinoRoom=false;pinoObj.alive=false;G.pinoFlagReady=false;G.pinoFlagDelay=0;G.pipeDungeon=false;G.lowGravity=false;G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;G.ugMode=false;G.savedOW=null;yoshi.alive=false;yoshi.mounted=false;G.starTimer=0;G.autoScroll=0;bowser.alive=false;bowserFire.length=0;bowserShockwaves.length=0;peach.alive=false;G.peachChase=null;
// レベル再構築（ブロック・敵を全復活）
const _rs=getStage(G.currentWorld,G.currentLevel);if(_rs){flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.swimCooldown=0;G.darkMode=false;G.megaTimer=0;G.chasingWall=null;G.gravityFlipped=false;G.checkpoint2=null;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.bowserRightX=0;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;_rs.build();}
mario.power='none';mario.big=false;mario.h=32;resetMario();mario.x=_cpx;mario.y=_cpy-mario.h;G.cam=Math.max(0,Math.min(mario.x-W/3,LW-W));G.timeLeft=400;
// ショップ購入効果を復元（チェックポイント復帰時は継続）
{const _sv=G._deathSv||{};G.coinMagnet=!!_sv.magnet;G.doubleJump=!!_sv.jump;G.retryHeart=_sv.retry||0;G.highJump=!!_sv.highJump;}
// チェックポイント到達状態を復元
G.checkpointReached=true;G.checkpoint={x:_cpx,y:_cpy,reached:true};mario.inv=120;
if(_cp2r&&G.checkpoint2){G.checkpoint2.reached=true;G.checkpoint.x=G.checkpoint2.x;G.checkpoint.y=G.checkpoint2.y;mario.x=G.checkpoint2.x;mario.y=G.checkpoint2.y-mario.h;G.cam=Math.max(0,Math.min(mario.x-W/3,LW-W));}
G.state='play';startLevelTimer();try{startBGM()}catch(ex){}}else{G.timerTick=null;restartCurrentLevel();}}}
// 残り時間カウント開始（1秒=60フレーム。実際の減算は update() 冒頭）
function startLevelTimer(){G.timerTick=true;G.timerFrames=0;}
// ステージクリアの記録（★とベストタイム）。旗・土管ゴール・ピーチ救出の全経路から呼ぶ
// ピノキオ部屋から入ったEXで失敗/ギブアップ → 元ステージの状態（中間地点・氷・旗位置・クッパ）を戻す
function _restoreExOrigin(){const o=G._exOrigin;G._exOrigin=null;if(!o)return;G.checkpoint=o.checkpoint;G.checkpointReached=o.checkpointReached;G.checkpoint2=o.checkpoint2;G.iceMode=o.iceMode;flagPole.x=o.flagX;G.airshipMode=o.airshipMode;G.bowserRightX=o.bowserRightX;Object.assign(bowser,o.bowser);}
// タイトルから遊んだEXステージをクリア → 記録やショップは無しでタイトルへ
function _exTitleClear(){if(G.exStageNum===1)G.ex1Cleared=true;G.goalSlide=null;G.timerTick=null;returnToTitle();}
// タイトル画面へ戻る。ステージ固有の状態を片付けて、背景用に1-1を組み直す
function returnToTitle(){G.menu=null;G.paused=false;stopBGM();G.timerTick=null;G.deathTimer=0;G.goalSlide=null;G.peachChase=null;
G.ugMode=false;G.savedOW=null;G.exSavedOW=null;G._exOrigin=null;G.pinoRoom=false;pinoObj.alive=false;G.pinoFlagReady=false;G.isExStage=false;G.exStageFrom=null;G.pipeDungeon=false;G.lowGravity=false;G.autoScroll=0;G.starTimer=0;G.megaTimer=0;G.pswitchTimer=0;G._psCoins=null;G._psBricks=null;G.gravityFlipped=false;G.chasingWall=null;
yoshi.alive=false;yoshi.mounted=false;bowser.alive=false;bowserFire.length=0;bowserShockwaves.length=0;peach.alive=false;
G.currentWorld=1;G.currentLevel=1;flagPole.x=LW-500;G.waterMode=false;G.iceMode=false;G.darkMode=false;G.sandstormMode=false;G.tideMode=false;G.tideLevel=H;G.airshipMode=false;G.bowserRightX=0;G.checkpoint=null;G.checkpointReached=false;G.checkpoint2=null;iceBalls.length=0;marioHammers.length=0;gravityZones.length=0;windZones.length=0;windParticles.length=0;fireballs.length=0;
const _s=getStage(1,1);if(_s)_s.build();
G.score=0;G.coins=0;G.lives=3;G.coinMagnet=false;G.doubleJump=false;G.retryHeart=0;G.highJump=false;G.heldItem=null;G.stageDamaged=false;
mario.dead=false;mario.big=false;mario.power='none';resetMario();G.state='start';updateHUD();}
function _recordClear(){G.stageClearCoins=G.coins-G.stageCoinsStart;const _cId=getStage(G.currentWorld,G.currentLevel)?.id;if(!_cId)return;if(!G.clearedStages.includes(_cId))G.clearedStages.push(_cId);const _et=Math.round(G.stageFrames/60);if(!G.stageTimes[_cId]||_et<G.stageTimes[_cId])G.stageTimes[_cId]=_et;_saveRecords();}
function updateHUD(){if(G.coins>3000){G.coins=3000;}document.getElementById('hScore').textContent=String(G.score).padStart(6,'0');document.getElementById('hCoins').textContent='x'+String(G.coins).padStart(4,'0');document.getElementById('hTime').textContent=G.timeLeft;document.getElementById('hWorld').textContent=G.isExStage?'EX'+(G.exStageNum||1):G.currentWorld+'-'+G.currentLevel;if(G._hudLives!==G.lives){G._hudLives=G.lives;const li=document.getElementById('lives-icons');li.innerHTML='';const n=Math.max(0,G.lives);if(n>8){const s=document.createElement('span');s.textContent='🍄x'+n;s.style.fontSize='13px';li.appendChild(s);}else for(let i=0;i<n;i++){const s=document.createElement('span');s.textContent='🍄';s.style.fontSize='14px';li.appendChild(s)}}}

// === SAVE / LOAD ===
// セーブは3スロット（src/save.js）。G.saveSlot が今のスロット
// 記録（★・ベストタイム）はスロットごとに保存し、ゲームオーバーでも消えない
(function(){try{const _c=localStorage.getItem('mario_v2_char');if(_c==='luigi'||_c==='mario')G.character=_c;}catch(e){}})();
function _loadSlotRecords(){const r=getRecords(G.saveSlot);G.clearedStages=[...r.clearedStages];G.stageTimes={...r.stageTimes};}
function _saveRecords(){writeRecords(G.saveSlot,G.clearedStages,G.stageTimes);}
_loadSlotRecords();
function hasSave(){return!!getProgress(G.saveSlot);}
function switchSlot(){G.saveSlot=(G.saveSlot+1)%SLOT_COUNT;_loadSlotRecords();saveAudioOpts();try{beep(660,.05,'square',.08)}catch(e){}}
function saveGame(){const _sid=getStage(G.currentWorld,G.currentLevel)?.id;const _nid=G.nextStage?G.nextStage.id:(_sid||1);
  writeProgress(G.saveSlot,{score:G.score,coins:G.coins,lives:G.lives,nextStageId:_nid,character:G.character,ex1Cleared:G.ex1Cleared,ex2Used:G.ex2Used,exStageUsed:G.exStageUsed,
    power:mario.power,doubleJump:G.doubleJump,coinMagnet:G.coinMagnet,retryHeart:G.retryHeart,highJump:G.highJump,heldItem:G.heldItem,savedAt:new Date().toISOString()});
  _saveRecords();}
function loadSave(){const sv=getProgress(G.saveSlot);if(!sv)return;G.score=sv.score||0;G.coins=Math.min(3000,sv.coins||0);G.lives=Math.max(1,sv.lives||3);G.character=sv.character==='luigi'?'luigi':'mario';try{localStorage.setItem('mario_v2_char',G.character);}catch(_e){}
  G.ex1Cleared=!!sv.ex1Cleared;G.ex2Used=!!sv.ex2Used;G.exStageUsed=!!sv.exStageUsed;G.exStageNum=1;G.isExStage=false;G.lowGravity=false;G.pipeDungeon=false;updateHUD();
  startFromStage(getStageById(sv.nextStageId||1)?(sv.nextStageId||1):1);
  // ショップで買った効果とパワーアップも復元（以前は保存されず失われていた）
  if(['big','fire','ice','hammer'].includes(sv.power)){mario.power=sv.power;mario.big=true;mario.h=48;mario.y-=16;}
  G.doubleJump=!!sv.doubleJump;G.coinMagnet=!!sv.coinMagnet;G.retryHeart=sv.retryHeart|0;G.highJump=!!sv.highJump;G.heldItem=['mushroom','flower','hammer'].includes(sv.heldItem)?sv.heldItem:null;}

// === UPDATE ===
function update(){
G.frame++;if(G.state!==G._prevState){G._prevState=G.state;G._stateFrame=G.frame;}if(G.swimCooldown>0)G.swimCooldown--;
// 残り時間・ベストタイム・死亡演出はフレーム数で進める（setInterval/setTimeoutだとポーズ中やタブ裏でもずれるため）
if(G.deathTimer>0&&--G.deathTimer===0)_afterDeath();
if(G.pinoExitTimer>0&&--G.pinoExitTimer===0&&G.pinoRoom&&G.ugMode&&!mario.dead)exitUnderground(true);
if(G.timerTick&&G.state==='play'&&!G.goalSlide&&!G.peachChase&&!(bowser.alive&&bowser.state==='dead')){if(!mario.dead)G.stageFrames++;if(++G.timerFrames>=60){G.timerFrames=0;G.timeLeft--;if(G.timeLeft===99)sfx('timeWarning');if(G.timeLeft<=0){G.timerTick=null;killMario(true);}updateHUD();}}
{const _cBig=G.megaTimer>0;const _nBase=G.state==='play'&&!G.starTimer&&!G.ugMode&&getStage(G.currentWorld,G.currentLevel)?.bgmTheme!=='castle';if(_nBase&&_cBig!==_bgmWasBig&&bgmGain){_bgmWasBig=_cBig;stopBGM();try{startBGM()}catch(e){}}else{_bgmWasBig=_cBig;if(bgmGain)try{scheduleBGM()}catch(e){bgmGain=null}}}
G.shakeX*=0.8;G.shakeY*=0.8;if(Math.abs(G.shakeX)<0.1)G.shakeX=0;if(Math.abs(G.shakeY)<0.1)G.shakeY=0;
for(let i=blockAnims.length-1;i>=0;i--){const b=blockAnims[i];b.t+=0.2;b.p.bounceOffset=Math.sin(b.t)*8*Math.max(0,1-b.t/Math.PI);if(b.t>Math.PI){b.p.bounceOffset=0;blockAnims.splice(i,1)}}
if(G.state==='shop'){updateParticles();return}
if(G.state==='intro'){G.introTimer--;updateParticles();if(G.introTimer<=0){G.state='play';startLevelTimer();try{startBGM()}catch(e2){}}return}
if(G.goalSlide){G.goalSlide.t++;if(G.goalSlide.phase==='slide'){mario.y+=3;mario.x=flagPole.x-4;if(mario.y>=H-TILE-mario.h){mario.y=H-TILE-mario.h;G.goalSlide.phase='walk'}}else if(G.goalSlide.phase==='walk'){mario.x+=2;mario.facing=1;mario.walkTimer++;if(mario.walkTimer>5){mario.walkTimer=0;mario.walkFrame=(mario.walkFrame+1)%3}if(G.goalSlide.t>240){G.goalSlide=null;G.score+=1000+G.timeLeft*50;G.timerTick=null;updateHUD();
  if(!G.stageDamaged){G.coins=Math.min(3000,G.coins+30);G.score+=5000;updateHUD();spawnScorePopup(mario.x+13,mario.y-30,'PERFECT! +30C','#FFD700');for(let _pf=0;_pf<30;_pf++)spawnParticle(mario.x+(Math.random()-0.5)*40,mario.y-Math.random()*60,'star');try{beep(880,.1,'sine',.15);beep(1100,.1,'sine',.15,.1);beep(1320,.1,'sine',.15,.2)}catch(ex){}}
  // 花火（スコア下1桁が1,3,6）
  const _ld=G.score%10;if(_ld===1||_ld===3||_ld===6){for(let _fw=0;_fw<6;_fw++)setTimeout(()=>{const _fx=mario.x+(Math.random()-0.5)*200,_fy=H-TILE-80-Math.random()*120;for(let _fp=0;_fp<15;_fp++)spawnParticle(_fx,_fy,'star');try{beep(600+Math.random()*400,.1,'sine',.1)}catch(ex){}},_fw*300);}
  // EXステージクリア → 元ステージをクリア扱いにする
  if(G.isExStage&&!G.exStageFrom){_exTitleClear();updateParticles();return;}
  if(G.isExStage&&G.exStageFrom){if(G.exStageNum===1)G.ex1Cleared=true;G.lowGravity=false;G.pipeDungeon=false;const _ef=G.exStageFrom;G.isExStage=false;G.exStageFrom=null;G.currentWorld=_ef.world;G.currentLevel=_ef.level;}
  _recordClear();
  const _ns=getNextStage(G.currentWorld,G.currentLevel);if(_ns){G.nextStage=_ns;G.state='shop';G.shopCursor=0;G.shopBought={};G.shopConfirm=null;try{startBGM()}catch(ex){};saveGame();}else{G.state='win';for(let i=0;i<30;i++)setTimeout(()=>spawnParticle(mario.x,H-TILE-100+Math.random()*80,'star'),i*60)}}}else if(G.goalSlide.phase==='pipeGoal'){if(G.goalSlide.t>60){G.goalSlide=null;G.score+=1000+G.timeLeft*50;G.timerTick=null;updateHUD();
  if(!G.stageDamaged){G.coins=Math.min(3000,G.coins+30);G.score+=5000;updateHUD();spawnScorePopup(mario.x+13,mario.y-30,'PERFECT! +30C','#FFD700');for(let _pf2=0;_pf2<30;_pf2++)spawnParticle(mario.x+(Math.random()-0.5)*40,mario.y-Math.random()*60,'star');try{beep(880,.1,'sine',.15);beep(1100,.1,'sine',.15,.1);beep(1320,.1,'sine',.15,.2)}catch(ex){}}
  const _ld2=G.score%10;if(_ld2===1||_ld2===3||_ld2===6){for(let _fw=0;_fw<6;_fw++)setTimeout(()=>{const _fx=mario.x+(Math.random()-0.5)*200,_fy=H-TILE-80-Math.random()*120;for(let _fp=0;_fp<15;_fp++)spawnParticle(_fx,_fy,'star');try{beep(600+Math.random()*400,.1,'sine',.1)}catch(ex){}},_fw*300);}
  // EXステージパイプゴール→元ステージクリア
  if(G.isExStage&&!G.exStageFrom){_exTitleClear();updateParticles();return;}
  if(G.isExStage&&G.exStageFrom){if(G.exStageNum===1)G.ex1Cleared=true;G.lowGravity=false;G.pipeDungeon=false;const _ef2=G.exStageFrom;G.isExStage=false;G.exStageFrom=null;G.currentWorld=_ef2.world;G.currentLevel=_ef2.level;}
  _recordClear();
  const _ns2=getNextStage(G.currentWorld,G.currentLevel);if(_ns2){G.nextStage=_ns2;G.state='shop';G.shopCursor=0;G.shopBought={};G.shopConfirm=null;try{startBGM()}catch(ex){};saveGame();}else{G.state='win';for(let _pi=0;_pi<30;_pi++)setTimeout(()=>spawnParticle(mario.x,H-TILE-100+Math.random()*80,'star'),_pi*60)}}}updateParticles();return}
_buildSolids();
if(G.frame%120===0){for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];if(!e.alive&&e!==mario.heldShell)enemies.splice(i,1);}}
// Moving platforms
for(const mp of movingPlats){mp.prevX=mp.x;mp.prevY=mp.y;if(mp.type==='h')mp.x=mp.ox+Math.sin(G.frame*0.015*mp.spd)*mp.range;else if(mp.type==='v')mp.y=mp.oy+Math.sin(G.frame*0.015*mp.spd)*mp.range;else if(mp.type==='fall'){if(mp.falling){mp.vy+=0.3;mp.y+=mp.vy;if(mp.y>H+100){mp.y=mp.oy;mp.vy=0;mp.falling=false;mp.fallTimer=0}}}}
if(G.starTimer>0){G.starTimer--;if(G.frame%3===0)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');if(G.starTimer<=0){mario.inv=0;if(!mario.dead&&G.state==='play'){stopBGM();try{startBGM()}catch(e){}}}}
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
for(const e of enemies){if(!e.alive||e.type!=='hammerBro'||e.state==='dead')continue;if(!e.activated||e.frozen||Math.abs(e.x-mario.x)>W)continue;
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
    cc.x+=cc.vx;cc.y+=cc.vy;cc.vy+=0.4;cc.lungeTimer--;if(Math.abs(cc.x-cc.postX)>120){cc.x=cc.postX+Math.sign(cc.x-cc.postX)*120;cc.state='return';}
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
  if(!jb.activated){if(G.cam+W+TILE*8<jb.x)continue;jb.activated=true;} // 画面に近づくまで動かない
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
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,jb.x,jb.y,jb.w,jb.h)){
    if(G.starTimer>0){jb.alive=false;G.score+=400;sfx('stomp');spawnScorePopup(jb.x,jb.y-8,400,'#e67e22');for(let k=0;k<5;k++)spawnParticle(jb.x+14,jb.y+14,'brick')}
    else if(mBot-mario.vy<=jb.y+jb.h*0.4&&mario.vy>0){jb.alive=false;mario.vy=-9;G.score+=400;sfx('stomp');spawnScorePopup(jb.x,jb.y-8,400,'#e67e22');for(let k=0;k<5;k++)spawnParticle(jb.x+14,jb.y+14,'brick')}
    else if(mario.inv===0)killMario();
  }
}

// === パイポ更新 ===
for(let i=pipos.length-1;i>=0;i--){
  const pp=pipos[i];if(!pp.alive){pipos.splice(i,1);continue}
  if(!pp.activated){if(G.cam+W+TILE*8<pp.x)continue;pp.activated=true;} // 画面に近づくまで動かない
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
  if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,pp.x,pp.y,pp.w,pp.h)){
    if(G.starTimer>0){pp.alive=false;G.score+=300;sfx('stomp');spawnScorePopup(pp.x,pp.y-8,300,'#e74c3c')}
    else if(mBot2-mario.vy<=pp.y+pp.h*0.4&&mario.vy>0){pp.alive=false;mario.vy=-9;G.score+=300;sfx('stomp');spawnScorePopup(pp.x,pp.y-8,300,'#e74c3c')}
    else if(mario.inv===0)killMario();
  }
}

// エンディングの花火（生成は update で行う: 描画回数＝画面のHzに左右されないように）
if(G.state==='win'&&G.currentWorld===8&&G.currentLevel===3&&G.frame%10===0){const _fx=G.cam+60+Math.random()*(W-120),_fy=40+Math.random()*200;for(let _fp=0;_fp<14;_fp++)spawnParticle(_fx,_fy,'star');}
if(G.state!=='play'&&!mario.dead){updateParticles();return}
if(!mario.dead){
if(mario.hipDrop&&mario.vy<0&&!G.gravityFlipped)mario.hipDrop=false;
// ジャンプ入力の処理（先行入力＋コヨーテタイム）
if(mario.onGround)G.coyote=COYOTE_FRAMES;else if(G.coyote>0)G.coyote--;
if(G.jumpBuf>0){G.jumpBuf--;if(_tryJump(G.jumpFresh))G.jumpBuf=0;G.jumpFresh=false;}
// 土管に入る（土管の上で↓を押している間。キーボード/タッチ/パッド共通）
if(act('down')&&(mario.onGround||G.waterMode))checkPipeEntry();
// 壁キック猶予タイマー
if(mario.wallContactTimer>0){mario.wallContactTimer--;}else{mario.wallContact=0;}
// ヒップドロップ（空中＋下キー）
if(!mario.onGround&&!mario.hipDrop&&!G.waterMode&&act('down')&&mario.vy>0){mario.hipDrop=true;mario.vy=16;mario.vx=0;try{beep(200,.08,'square',.15);beep(150,.1,'square',.1,.05);}catch(ex){}}
// しゃがみ
{const _isDown=act('down');
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
const isDash=act('dash');
// Shell投げ（持っている shell を離すと前方に投げる）
if(mario.heldShell&&(!isDash||mario.dead||!mario.heldShell.alive)){
  const _sh=mario.heldShell;
  if(_sh.alive){_sh.vx=mario.facing*9;_sh.shellTimer=300;sfx('stomp');}
  mario.heldShell=null;
}
if(!mario.sliding&&isDash&&mario.onGround&&act('down')&&Math.abs(mario.vx)>3&&!G.waterMode){
  mario.sliding=true;mario.crouching=false;mario.slideTimer=30;const _oldH=mario.h;mario.h=mario.big?24:20;mario.y+=_oldH-mario.h;
  sfx('stomp');for(let i=0;i<4;i++)spawnParticle(mario.x+13,mario.y+mario.h,'dust');
}
if(mario.sliding){
  mario.slideTimer--;mario.vx*=0.97;
  // スライド中の敵ヒット
  _slideHits();
  if(mario.slideTimer<=0||Math.abs(mario.vx)<1){
    const _newH=mario.big?48:32;const _testY=mario.y-(_newH-mario.h);
    let _blocked=false;for(const p of platforms){if(overlap(mario.x,_testY,mario.w,_newH,p.x,p.y-(p.bounceOffset||0),p.w,p.h)){_blocked=true;break;}}
    for(const p of pipes){if(overlap(mario.x,_testY,mario.w,_newH,p.x,p.y,p.w,p.h)){_blocked=true;break;}}
    if(!_blocked){mario.y=_testY;mario.h=_newH;mario.sliding=false;mario.slideTimer=0;}
    else{mario.slideTimer=5;}
  }
}
let spd=G.waterMode?(isDash?3.5:2.2):(isDash?6.5:3.8);
if(G.megaTimer>0)spd*=0.7;
const goL=act('left');const goR=act('right');
const _af=G.iceMode?0.042:0.25,_ff=G.iceMode?0.9895:0.78;
if(mario.crouching){mario.vx*=_ff;}else if(goL){mario.vx+=(-spd-mario.vx)*_af;mario.facing=-1}else if(goR){mario.vx+=(spd-mario.vx)*_af;mario.facing=1}else mario.vx*=_ff;
if(G.ugMode&&mario.x<0)mario.x=0;{const _ugW=G.pipeDungeon?3200:W;if(G.ugMode&&mario.x+mario.w>_ugW)mario.x=_ugW-mario.w;}if(G.ugMode&&!G.pipeDungeon)G.cam=0;
// Flutter jump (Yoshi)
if(yoshi.mounted&&yoshi.alive&&yoshi.flutterTimer>0&&act('jump')&&mario.vy>0){mario.vy*=0.6;yoshi.flutterTimer--;if(G.frame%2===0)spawnParticle(mario.x+13,mario.y+mario.h,'dust')}
if(!G.waterMode&&!G.gravityFlipped&&!act('jump')&&mario.vy<-4)mario.vy+=1.2;
mario.x+=mario.vx;if(G.autoScroll>0){G.cam=Math.min(G.cam+G.autoScroll,LW-W);if(mario.x<G.cam+20)mario.x=G.cam+20;if(mario.x+mario.w>G.cam+W-10)mario.x=G.cam+W-10-mario.w;}else if(G.ugMode&&G.pipeDungeon){if(mario.x<0)mario.x=0;if(mario.x+mario.w>3200)mario.x=3200-mario.w;_followCam(3200);}else if(G.ugMode){if(mario.x<0)mario.x=0;if(mario.x+mario.w>W)mario.x=W-mario.w;G.cam=0;}else{if(mario.x<0)mario.x=0;if(mario.x+mario.w>LW)mario.x=LW-mario.w;_followCam(LW);}
for(const p of platforms){if(Math.abs((p.x+16)-mario.x)>260)continue;if(p.type==='hidden'&&!p.hit)continue;if(_ledgeAssist(p))continue;cX(mario,p)}
for(const p of pipes){if(Math.abs((p.x+32)-mario.x)>260)continue;if(_ledgeAssist(p))continue;cX(mario,p)}
const _grav=G.gravityFlipped?-GRAVITY:(G.waterMode?0.10:G.lowGravity?GRAVITY*0.42:GRAVITY);const _apex=!G.gravityFlipped&&!G.waterMode&&Math.abs(mario.vy)<1.2&&act('jump');mario.vy+=_apex?_grav*0.55:_grav;
if(G.gravityFlipped){if(mario.vy<-15)mario.vy=-15;}else{const _maxVy=G.waterMode?3.5:G.lowGravity?9:(mario.hipDrop?20:15);if(mario.vy>_maxVy)mario.vy=_maxVy;}
mario.y+=mario.vy;mario.onGround=false;
if(mario.vy<0&&!G.gravityFlipped)_cornerNudge();
if(G.gravityFlipped&&mario.y<0){mario.y=0;mario.vy=0;mario.onGround=true;}
if(G.waterMode&&mario.y<TILE){mario.y=TILE;mario.vy=0;}
for(let _pi=platforms.length-1;_pi>=0;_pi--){const p=platforms[_pi];if(Math.abs((p.x+16)-mario.x)>260)continue;
if(G.gravityFlipped){if(p.type==='hidden'&&!p.hit)continue;_cYFlipped(p);continue;}
if(p.type==='hidden'&&!p.hit){const bo=p.bounceOffset||0,py=p.y-bo;if(mario.vy<0&&mario.y-mario.vy>=py+p.h-4&&overlap(mario.x+1,mario.y,mario.w-2,mario.h,p.x,py,p.w,p.h)){mario.y=py+p.h;mario.vy=0;hitBlock(p)}continue}
cY(mario,p,hitBlock)}
// 天井ワープパイプ：cYより先に判定（cYがvy=0にする前に検出する必要がある）
if(!G.ugMode&&!mario.dead&&mario.vy<0){for(const p of pipes){if(!p.ceiling||!p.isWarp||p.used)continue;if(Math.abs((p.x+32)-mario.x)>160)continue;const _ugKey=`${G.currentWorld}-${G.currentLevel}-${p.x}`;if(G.usedUndergrounds&&G.usedUndergrounds.has(_ugKey))continue;if(mario.x+mario.w>p.x&&mario.x<p.x+p.w&&mario.y<=p.y+p.h&&mario.y-mario.vy>p.y+p.h-4){p.used=true;p.ugKey=_ugKey;enterUnderground(p);break;}}}
for(const p of pipes){if(Math.abs((p.x+32)-mario.x)>260)continue;if(G.gravityFlipped){_cYFlipped(p);continue;}cY(mario,p,null)}
// P-Switch stomp detection (landing on top)
if(G.pswitchTimer<=0&&mario.onGround){for(const p of platforms){if(p.type==='pswitch'&&!p.hit&&mario.y+mario.h>=p.y-(p.bounceOffset||0)-2&&mario.y+mario.h<=p.y-(p.bounceOffset||0)+6&&mario.x+mario.w>p.x&&mario.x<p.x+p.w){activatePSwitch(p);break;}}}
// Gravity flip: land on ceiling of blocks
if(G.gravityFlipped){for(const p of platforms){if(Math.abs((p.x+16)-mario.x)>260)continue;const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(mario.x+1,mario.y,mario.w-2,mario.h,p.x,py,p.w,p.h))continue;if(mario.vy<0&&mario.y>py+p.h/2){mario.y=py+p.h;mario.vy=0;mario.onGround=true;}}}
// Moving platform collision
if(G._ride&&!mario.onGround&&mario.vy>=0&&!G.gravityFlipped){const mp=G._ride,_dy=mp.y-(mp.prevY??mp.y);if(_dy>0&&mario.x+mario.w>mp.x&&mario.x<mp.x+mp.w&&mario.y+mario.h<=mp.y+1&&mp.y-(mario.y+mario.h)<=_dy+2){mario.y=mp.y-mario.h;mario.vy=0;mario.onGround=true;mario.x+=mp.x-(mp.prevX??mp.x);}}
G._ride=null;
for(const mp of movingPlats){if(mp.falling&&mp.y>H)continue;if(overlap(mario.x+1,mario.y,mario.w-2,mario.h,mp.x,mp.y,mp.w,mp.h)){const prevBot=mario.y-mario.vy+mario.h;const prevMpY=mp.prevY??mp.y;if(mario.vy>=0&&prevBot<=prevMpY+4){mario.y=mp.y-mario.h;mario.vy=0;mario.onGround=true;G._ride=mp;mario.x+=mp.x-(mp.prevX??mp.x);if(mp.type==='fall'&&!mp.falling){mp.fallTimer++;if(mp.fallTimer>30)mp.falling=true}}}}
// Springs
for(const sp of springs){if(sp.compressed>0){sp.compressed--;continue}if(overlap(mario.x,mario.y,mario.w,mario.h,sp.x,sp.y,sp.w,sp.h)){if(mario.y+mario.h-mario.vy<=sp.y+4){mario.vy=-20;mario.onGround=false;sp.compressed=15;sfx('jump');for(let i=0;i<6;i++)spawnParticle(sp.x+12,sp.y,'star')}}}
// ヒップドロップ着地
if(mario.hipDrop&&mario.onGround){mario.hipDrop=false;G.shakeX=5;G.shakeY=5;try{beep(80,.2,'sawtooth',.2);beep(50,.25,'sawtooth',.15,.08);}catch(ex){}
  for(let i=0;i<8;i++)spawnParticle(mario.x+13,mario.y+mario.h,'dust');
  // ?ブロックを上から踏み下ろした場合：アイテムを下方向にスポーン
  for(const p of platforms){if(p.type!=='question'||p.hit)continue;const py=p.y-(p.bounceOffset||0);if(mario.x+mario.w>p.x+2&&mario.x<p.x+p.w-2&&Math.abs(mario.y+mario.h-py)<4)hitBlock(p,true);}
  // 着地点のブロック破壊（ビッグマリオのみ）
  if(mario.big){for(let _bi=platforms.length-1;_bi>=0;_bi--){const p=platforms[_bi];if(p.type!=='brick'||p.hit)continue;if(Math.abs(p.x-mario.x)<mario.w+8&&p.y===mario.y+mario.h){p.hit=true;spawnParticle(p.x+16,p.y+16,'brick');G.score+=50;updateHUD();const idx=platforms.indexOf(p);if(idx>=0)platforms.splice(idx,1);}}}
  // 周囲の敵にダメージ
  for(const e of enemies){if(!e.alive||e.state==='dead')continue;if(Math.abs((e.x+e.w/2)-(mario.x+mario.w/2))<TILE*2&&Math.abs((e.y+e.h)-(mario.y+mario.h))<TILE/2){if(e.type==='goomba'||e.type==='hammerBro'||e.type==='cactus'||e.type==='penguin'||e.type==='shyGuy'||e.type==='rex'||e.type==='spiny'){e.state='dead';e.squishT=28;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');spawnScorePopup(e.x+16,e.y-8,200,'#e74c3c');}else if(e.type==='bobomb'&&e.state==='walk'){e.state='lit';e.litTimer=180;G.score+=100;sfx('stomp');spawnScorePopup(e.x+16,e.y-8,100,'#ff4400');}}}
}
if(mario.sliding)_slideHits(); // 移動後にもう一度（敵との接触判定より先に倒す）
// 残像（スター中・ダッシュ中）: 1フレーム1個追加して薄くしていく
if(G.starTimer>0||(act('dash')&&Math.abs(mario.vx)>4)){for(const _ai of G.afterimages)_ai.alpha*=0.8;G.afterimages.push({x:mario.x,y:yoshi.mounted&&yoshi.alive?mario.y-12:mario.y,facing:mario.facing,wf:mario.walkFrame,big:mario.big,alpha:0.35});if(G.afterimages.length>5)G.afterimages.shift();}else if(G.afterimages.length)G.afterimages.length=0;
if(Math.abs(mario.vx)>0.5&&mario.onGround){mario.walkTimer++;if(mario.walkTimer>5){mario.walkTimer=0;mario.walkFrame=(mario.walkFrame+1)%3}}else if(mario.onGround)mario.walkFrame=0;
{if(mario.y>H+40){if(G.retryHeart>0){G.retryHeart--;mario.y=H-3*TILE;mario.x=Math.max(G.cam+32,mario.x);mario.vy=-14;mario.inv=240;sfx('1up');sfx('power');try{beep(880,0.15,'square',0.2);beep(1320,0.2,'square',0.18,0.05);beep(1760,0.25,'triangle',0.15,0.12);}catch(e){}G.shakeX=22;G.shakeY=22;for(let i=0;i<50;i++)spawnParticle(mario.x+13+(Math.random()-0.5)*48,mario.y+16+(Math.random()-0.5)*48,'star');spawnScorePopup(mario.x+13,mario.y-20,'REVIVE!!','#ff3355');spawnScorePopup(mario.x+13,mario.y-44,`❤️ x${G.retryHeart}`,'#ff88aa');}else{killMario(true);}}}
if(G.autoScroll>0&&mario.x<G.cam+10)killMario(true); // 強制スクロール挟まれ即死
if(mario.inv>0)mario.inv--;

// === YOSHI UPDATE ===
// Yoshi items (hatching eggs)
for(let i=yoshiItems.length-1;i>=0;i--){const yi=yoshiItems[i];
if(!yi.onGround){yi.vy+=GRAVITY;yi.y+=yi.vy;for(const p of _solidsNear(yi.x,96)){const py=p.y-(p.bounceOffset||0);if(yi.vy>=0&&yi.y+yi.h-yi.vy<=py+2&&overlap(yi.x,yi.y,yi.w,yi.h,p.x,py,p.w,p.h)){yi.y=py-yi.h;yi.vy=0;yi.onGround=true;break;}}if(!yi.onGround&&yi.y>H+50){yoshiItems.splice(i,1);continue;}}
if(yi.onGround){yi.hatchTimer--;if(yi.hatchTimer<=0&&!yi.hatched){yi.hatched=true;
yoshi.x=yi.x;yoshi.y=yi.y-yoshi.h+yi.h;yoshi.alive=true;yoshi.mounted=false;yoshi.runAway=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.facing=1;yoshi.vx=0;yoshi.vy=0;yoshi.idleTimer=0;yoshi.eatTarget=null;yoshi.chewTimer=0;
sfx('power');for(let j=0;j<15;j++)spawnParticle(yi.x+12,yi.y,'star');yoshiItems.splice(i,1)}}}
// Yoshi free-roaming / run away
if(yoshi.alive&&!yoshi.mounted){
if(yoshi.runAway){yoshi.runTimer--;yoshi.x+=yoshi.vx;for(const p of _solidsNear(yoshi.x)){if(Math.abs((p.x+p.w/2)-yoshi.x)>260)continue;cX(yoshi,p)}yoshi.vy+=GRAVITY;yoshi.y+=yoshi.vy;yoshi.onGround=false;
for(const p of _solidsNear(yoshi.x)){if(Math.abs((p.x+p.w/2)-yoshi.x)>260)continue;cY(yoshi,p,null)}
if(yoshi.y>H+100){yoshi.alive=false;}else if(yoshi.runTimer<=0){yoshi.runAway=false;yoshi.vx=0;yoshi.vy=0;yoshi.idleTimer=480;}}
else{// Idle yoshi, Mario can mount
// 待機中も重力（空中で逃走が終わると浮いたままだった）
yoshi.vy+=GRAVITY;yoshi.y+=yoshi.vy;yoshi.onGround=false;for(const p of _solidsNear(yoshi.x)){if(Math.abs((p.x+p.w/2)-yoshi.x)>260)continue;cY(yoshi,p,null)}if(yoshi.y>H+100)yoshi.alive=false;
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
  for(const e of enemies){if(!e.alive||e.state==='dead'||e.frozen)continue;
    // ヨッシーが食えない敵（トゲ/爆発/ボス級/大型・凍結中）
    if(e.type==='spiny'||e.type==='spikeTop'||e.type==='fuzzy'||e.type==='bobomb'||e.type==='thwomp'||e.type==='teresa'||e.type==='pokey'||e.type==='chuck'||e.type==='angrySun'||e.type==='miniBowser'||e.type==='dryBones'||e.type==='bowser')continue;
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
    sfx('yoshi_eat');G.score+=200;yoshi.eatCount++;yoshi.eggsReady=Math.min(3,yoshi.eggsReady+1);
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
for(const p of _solidsNear(eg.x,96)){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(eg.x,eg.y,eg.w,eg.h,p.x,py,p.w,p.h))continue;if(eg.y+eg.h/2<py+p.h/2){eg.y=py-eg.h;eg.vy=-6;eg.bounces++}else{eg.vx=-eg.vx}break}
if(eg.bounces>3||eg.x<G.cam-80||eg.x>G.cam+W+80||eg.y>H+50){eg.alive=false;continue}
for(const e of enemies){if(!e.alive||e.state==='dead'||e.type==='miniBowser')continue;if(overlap(eg.x,eg.y,eg.w,eg.h,e.x,e.y,e.w,e.h)){eg.alive=false;if(_enemyHit(e,'egg')==='kill'){e.state='dead';e.squishT=20;G.score+=300;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,300,'#2ecc71')}break;}}}

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
      _pushRoomPipe({x:W-3*TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
  }
  if(G.pinoFlagDelay>0)G.pinoFlagDelay--;
  // フラグポール：猶予後にマリオが左端フラグに触れたらステージクリア（x=48が旗の x）
  if(G.pinoFlagReady&&G.pinoFlagDelay===0&&!mario.dead&&mario.x+mario.w>=48&&mario.x<=64){
    G.pinoFlagReady=false;G.pinoFlagDelay=0;G.pinoReward=-2;
    G.pinoRoom=false;pinoObj.alive=false;G.ugMode=false;G.savedOW=null;
    const _from=G.isExStage?G.exStageFrom:null;
    G.isExStage=false;G.exStageFrom=null;
    if(_from){G.currentWorld=_from.world;G.currentLevel=_from.level;}
    G.score+=2000+G.timeLeft*50;G.timerTick=null;updateHUD();_recordClear();
    sfx('flag');stopBGM();
    const _ns=getNextStage(G.currentWorld,G.currentLevel);
    if(_ns){G.nextStage=_ns;G.state='shop';G.shopCursor=0;G.shopBought={};G.shopConfirm=null;try{startBGM()}catch(ex){};saveGame();}
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
    e.vy+=GRAVITY;e.x+=e.vx;e.y+=e.vy;e.onGround=false;
    for(const p of platforms){const py=p.y-(p.bounceOffset||0);if(overlap(e.x,e.y,e.w,e.h,p.x,py,p.w,p.h)&&e.vy>=0&&e.y+e.h/2<py+p.h/2){e.y=py-e.h;e.vy=0;e.onGround=true;break;}}
    // 壁反射（画面全体を飛び回る）
    if(e.x<0){e.x=0;e.vx=_spd;}
    if(e.x+e.w>W){e.x=W-e.w;e.vx=-_spd;}
    e.facing=e.vx>=0?1:-1;
    // 地上を歩き回る（時々2タイルの小ジャンプ）
    if(e.onGround){
      e.turnTimer=(e.turnTimer||0)-1;
      if(e.turnTimer<=0){
        // 方向: 30%でランダム反転、70%でマリオ方向追跡
        if(Math.random()<0.3)e.vx=-Math.sign(e.vx||1)*_spd;
        else e.vx=(mario.x<e.x?-1:1)*_spd;
        e.turnTimer=60+Math.floor(Math.random()*60);
      }
      // 小ジャンプ（2タイル高）: HP減ると頻度UP
      e.jumpTimer=(e.jumpTimer||0)-1;
      if(e.jumpTimer<=0){
        e.vy=-8.2;
        const _jInt=e.hp>=3?120:e.hp===2?90:60;
        e.jumpTimer=_jInt+Math.floor(Math.random()*60);
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
        e.hurtTimer=75;e.hp--;mario.vy=-10;mario.inv=90;sfx('stomp');
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
        // パワーあり: 横接触ならパワーダウン（敗北にはしない）
        if(mario.power==='fire'||mario.power==='ice'||mario.power==='hammer'){
          mario.power='big';mario.inv=120;mario.vy=-6;sfx('break');
          spawnScorePopup(mario.x,mario.y-20,'POWER DOWN','#ff8844');
        } else if(mario.power==='big'||mario.big){
          mario.power='none';mario.big=false;mario.h=32;mario.inv=120;mario.vy=-6;sfx('break');
          spawnScorePopup(mario.x,mario.y-20,'SHRUNK!','#ff8844');
        } else {
          // 小マリオのみ敗北 → 元ステージへ戻る（残機減らさない）
          mario.inv=120;
          spawnScorePopup(W/2,H/2,'DEFEATED... STAGEに戻る','#ff4444');
          sfx('die');stopBGM();
          e.state='dead';e.alive=false;
          G.shakeX=10;G.shakeY=10;
          G.pinoExitTimer=72;
        }
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
for(const c of coinItems){if(c.collected||c._psHidden)continue;if(c.type==='frozendrop'){c.vy+=c.gravity;c.x+=c.vx;c.y+=c.vy;c.timer--;if(c.timer<=0||c.y>H+20){c.collected=true;continue}if(!c.noCollect&&overlap(mario.x,mario.y,mario.w,mario.h,c.x,c.y,16,16)){c.collected=true;sfx('coin');G.score+=100;updateHUD();spawnScorePopup(c.x+8,c.y,'+100','#44bbff');spawnParticle(c.x+8,c.y,'coin')}continue}
if(c.type==='firecoin'){if(!c.onGround)c.vy+=c.gravity;c.x+=c.vx;c.y+=c.vy;c.timer--;if(c.y>H+20||c.timer<=0){c.collected=true;continue}c.onGround=false;if(c.vy>=0&&c.y+14>=H-TILE&&c.y+14<=H-TILE+20&&_solidsNear(c.x,64).some(p=>p.y===H-TILE&&c.x+7>=p.x&&c.x+7<p.x+p.w)){c.y=H-TILE-14;c.vy=0;c.onGround=true;}if(c.noLand){if(c.x<TILE*2){c.x=TILE*2;if(c.vx<0)c.vx=-c.vx;}if(c.x+14>W-TILE*2){c.x=W-TILE*2-14;if(c.vx>0)c.vx=-c.vx;}}if(!c.noLand&&!c.onGround){for(const p of platforms){const py=p.y-(p.bounceOffset||0);if(c.vy>=0&&c.x+12>p.x&&c.x+2<p.x+p.w&&c.y+14>py&&c.y<py+p.h/2){c.y=py-14;c.vy=0;c.onGround=true;break;}}}if(c.onGround){c.vx*=0.88;if(Math.abs(c.vx)<0.05)c.vx=0;}if(!c.noCollect&&overlap(mario.x,mario.y,mario.w,mario.h,c.x,c.y,14,14)){const _cv=c.coinValue||1;c.collected=true;G.coins=Math.min(3000,G.coins+_cv*(G.character==='luigi'?2:1));G.score+=100*_cv;sfx('coin');updateHUD();spawnScorePopup(c.x+7,c.y-4,`+${_cv}C`,'#FFD700');spawnParticle(c.x+7,c.y,'coin')}continue}if(c.pop){c.popY+=c.popVy;c.popVy+=0.4;c.life--;if(c.life<=0)c.collected=true;continue}
// コイン磁石
if(G.coinMagnet&&!c.pop){const _dx=mario.x+13-c.x,_dy=mario.y+mario.h/2-c.y,_dist=Math.sqrt(_dx*_dx+_dy*_dy);if(_dist<150&&_dist>2){const _pull=3/Math.max(_dist,20)*150;c.x+=_dx/_dist*Math.min(_pull,5);c.y+=_dy/_dist*Math.min(_pull,5);}}
if(overlap(mario.x,mario.y,mario.w,mario.h,c.x,c.y,TILE,TILE)){c.collected=true;G.coins+=(G.character==='luigi'?2:1);G.score+=100;sfx('coin');updateHUD();spawnScorePopup(c.x+8,c.y,'+100','#FFD700');spawnParticle(c.x+8,c.y,'coin')}}
// Mushrooms etc
for(const m of mushrooms){if(!m.alive)continue;
if(m.type==='flower'||m.type==='iceFlower'||m.type==='hammerSuit'||m.type==='star'||m.type==='mega'){if(m.type==='star')m.bobY=(m.bobY||0)+0.1;
// fromAbove: ?ブロックの下から出たアイテムを落下させる
if(m.fromAbove&&!m.landed){m.vy=(m.vy||0)+GRAVITY;if(m.vy>10)m.vy=10;m.y+=m.vy;for(const p of[...platforms,...pipes,...movingPlats]){const py=p.y-(p.bounceOffset||0);if(m.vy>=0&&m.x+m.w>p.x&&m.x<p.x+p.w&&m.y+m.h>py&&m.y+m.h-m.vy<=py+4){m.y=py-m.h;m.vy=0;m.landed=true;break;}}if(m.y>H+100){m.alive=false;continue;}}
if(overlap(mario.x,mario.y,mario.w,mario.h,m.x,m.y+(m.type==='star'?Math.sin(m.bobY||0)*4:0),m.w,m.h)){m.alive=false;
if(m.type==='star'){G.starTimer=480;mario.inv=60;sfx('power');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'STAR!','#FFD700');for(let i=0;i<20;i++)spawnParticle(mario.x+13,mario.y+24,'star');stopBGM();try{startBGM()}catch(ex){}}
else if(m.type==='mega'){G.megaPrevPower=mario.power;G.megaPrevBig=mario.big;G.megaTimer=1200;sfx('power');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'MEGA!','#ff4400');for(let i=0;i<25;i++)spawnParticle(mario.x+13,mario.y+24,'star');G.shakeX=10;G.shakeY=10;}
else if(m.type==='iceFlower'){upgradeMario('flower');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'ICE!','#44bbff')}
else if(m.type==='hammerSuit'){upgradeMario('hammer');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'HAMMER!','#888')}
else{upgradeMario('flower');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'1000','#FF6B6B')}}continue}
m.x+=m.vx;for(const p of[...platforms,...pipes,...movingPlats]){if(Math.abs((p.x+p.w/2)-m.x)>220)continue;cX(m,p)}
m.vy+=GRAVITY;m.y+=m.vy;m.onGround=false;for(const p of[...platforms,...pipes,...movingPlats]){if(Math.abs((p.x+p.w/2)-m.x)>220)continue;cY(m,p,null)}
if(m.y>H+100){m.alive=false;continue}
if(overlap(mario.x,mario.y,mario.w,mario.h,m.x,m.y,m.w,m.h)){m.alive=false;
if(m.type==='1up'){G.lives++;sfx('1up');updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'1UP!','#2ecc71');for(let i=0;i<10;i++)spawnParticle(mario.x+13,mario.y+24,'star')}
else{upgradeMario('mushroom');G.score+=1000;updateHUD();spawnScorePopup(mario.x+13,mario.y-10,'1000','#2ecc71')}}}
// Enemies
for(const e of enemies){if(!e.alive)continue;if(e.type==='miniBowser')continue;// pinoRoomループで処理
// マリオが持ち上げ中のshellはマリオに追従
if(e===mario.heldShell){e.x=mario.x+(mario.facing===1?mario.w-4:-e.w+4);e.y=mario.y+mario.h-e.h-2;e.vx=0;e.vy=0;e.shellTimer=300;
// マリオ3仕様: 持っている甲羅が敵に接触したら敵を倒す（甲羅は維持）
for(const o of enemies){if(o===e||!o.alive||o.state==='dead'||o.frozen)continue;if(overlap(e.x,e.y,e.w,e.h,o.x,o.y,o.w,o.h)&&_enemyHit(o,'shell')==='kill'){o.state='dead';o.squishT=20;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnScorePopup(o.x+8,o.y-8,200,'#e74c3c');spawnParticle(o.x+16,o.y+16,'dust');}}
continue;}
if(e.state==='dead'){e.squishT--;if(e.squishT<=0)e.alive=false;continue}
if(e._hitCD>0)e._hitCD--;
// 休眠スポーン: カメラ右端+8タイル先に入るまで physics をスキップ（parakoopa/lakitu は自前ロジックで動くので除外）
if(e.type!=='lakitu'&&e.type!=='cheepV'&&e.type!=='firePlant'&&e.type!=='plantFire'&&e.type!=='angrySun'&&!e.activated){if(G.cam+W+TILE*8<e.x)continue;e.activated=true;}
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
    if(enemies.filter(o=>o.alive&&o.fromLakitu).length<3)enemies.push({x:e.x+4,y:e.y+TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,fromLakitu:true}); // ジュゲムの投下は同時3体まで
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
  if(e.state==='idle'){e.y=e.baseY;e.vy=0;const _inX=mario.x+mario.w>e.x-16&&mario.x<e.x+e.w+16;if(_inX&&mario.y>e.y+e.h){e.state='fall';try{beep(220,.06,'square',.15)}catch(ex){}}}
  else if(e.state==='fall'){e.vy=Math.min(e.vy+2.5,22);e.y+=e.vy;let _landed=false;for(const p of _solidsNear(e.x,96)){const py=p.y-(p.bounceOffset||0);if(overlap(e.x+2,e.y,e.w-4,e.h,p.x,py,p.w,p.h)&&e.y+e.h/2<py+p.h/2){e.y=py-e.h;e.vy=0;_landed=true;break;}}if(!_landed&&e.y+e.h>=H-TILE){e.y=H-TILE-e.h;e.vy=0;_landed=true;}if(_landed){e.state='wait';e.waitTimer=55;G.shakeX=6;G.shakeY=6;try{beep(80,.25,'sawtooth',.22);beep(60,.3,'sawtooth',.18,.1)}catch(ex){}}}
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
if(e.type==='dryBones'){if(G.starTimer>0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){e.alive=false;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');continue;}if(e.state==='collapsed'){e.collapseTimer=(e.collapseTimer||180)-1;if(e.collapseTimer<=0){e.state='walk';e.vx=-1.2;}continue;}e.x+=e.vx;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}if(e.y>H+100){e.alive=false;continue;}if(e.onGround){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;if(!_solidsNear(_ax,64).some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h))e.vx=-e.vx;}if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){const _mBot=mario.y+mario.h;if(_mBot-mario.vy<=e.y+e.h*0.4||(yoshi.mounted&&yoshi.alive)){mario.vy=-9;sfx('stomp');spawnParticle(e.x+16,e.y+16,'dust');e.state='collapsed';e.collapseTimer=180;e.vx=0;G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;G.score+=100;updateHUD();spawnScorePopup(e.x+8,e.y-8,100,'#e8e8d0');}else if(mario.inv===0)killMario();}continue;}
// === チャージングチャック（Chargin' Chuck）===
if(e.type==='chuck'){if(e.hp===undefined)e.hp=3;if(e.state==='stun'){e.stunTimer--;if(e.stunTimer<=0){e.state='idle';e.vx=e.facing*1.5;}e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}if(e.y>H+100){e.alive=false;continue;}if(!mario.dead&&mario.inv===0&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.state='dead';e.squishT=20;e.vx=0;G.score+=500;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,500,'#FFD700');}else if(mario.vy<0||mario.y+mario.h-mario.vy<=e.y+e.h*0.5){if(mario.vy>=0){mario.vy=-9;mario.hipDrop=false;sfx('stomp');}}else killMario();}continue;}if(e.state==='idle'){if(Math.abs(e.vx)<0.1)e.vx=e.facing*1.5;if(e.onGround&&Math.abs(mario.y+mario.h-(e.y+e.h))<48&&Math.abs(mario.x-e.x)<420){e.state='charge';e.facing=mario.x>e.x?1:-1;e.vx=e.facing*4.5;}}else if(e.state==='charge')e.vx=e.facing*4.5;e.x+=e.vx;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}if(e.y>H+100){e.alive=false;continue;}if(e.onGround){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;if(!_solidsNear(_ax,64).some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=-e.facing;if(e.state==='charge')e.state='idle';}}if(!mario.dead&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){if(G.starTimer>0){e.state='dead';e.squishT=20;e.vx=0;G.score+=500;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,500,'#FFD700');continue;}const _mBot=mario.y+mario.h;if(_mBot-mario.vy<=e.y+e.h*0.35){e.hp--;mario.vy=-9;sfx('stomp');spawnParticle(e.x+16,e.y+16,'dust');G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;if(e.hp<=0){e.state='dead';e.squishT=28;e.vx=0;G.score+=500;G.stageKills++;G.totalKills++;updateHUD();spawnScorePopup(e.x+8,e.y-8,500,'#e74c3c');}else{e.state='stun';e.stunTimer=60;e.vx=0;G.score+=200;updateHUD();spawnScorePopup(e.x+8,e.y-8,200,'#e74c3c');}}else if(mario.inv===0)killMario();}continue;}
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
        if(_od<r){if(o.type==='thwomp'||o.type==='teresa'||o.type==='bowser'||o.type==='miniBowser'){continue;}o.state='dead';o.squishT=20;o.vx=0;G.score+=100;G.stageKills++;G.totalKills++;sfx('stomp');spawnScorePopup(o.x+8,o.y-8,100,'#ff8844');}
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
  e.x+=e.vx;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}
  e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}
  // gap落下時、lit中なら強制爆発
  if(e.y>H+50&&e.state==='lit'){e.litTimer=0;}
  if(e.y>H+100){e.alive=false;continue;}
  if(e.onGround){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
    const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;
    if(!_solidsNear(_ax,64).some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=e.vx>0?1:-1;}
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
  e.x+=e.vx;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}
  e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}
  if(e.y>H+100){e.alive=false;continue;}
  if(e.onGround){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
    const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;
    if(!_solidsNear(_ax,64).some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=e.vx>0?1:-1;}
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
  e.x+=e.vx;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}
  e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}
  if(e.y>H+100){e.alive=false;continue;}
  if(e.onGround){e.walkTimer++;if(e.walkTimer>10){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
    const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;
    if(!_solidsNear(_ax,64).some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=e.vx>0?1:-1;}
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
    e.x+=e.vx;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p);}
    e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null);}
    if(e.y>H+100){e.alive=false;continue;}
    if(e.onGround){e.walkTimer++;if(e.walkTimer>6){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2;}
      const _ax=e.vx>0?e.x+e.w+2:e.x-2,_ay=e.y+e.h+2;
      if(!_solidsNear(_ax,64).some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;e.facing=e.vx>0?1:-1;}
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
e.x+=e.vx;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cX(e,p)}
e.vy+=GRAVITY;e.y+=e.vy;e.onGround=false;for(const p of _solidsNear(e.x)){if(Math.abs((p.x+p.w/2)-e.x)>220)continue;cY(e,p,null)}
if(e.y>H+100){e.alive=false;continue}
if(e.onGround&&e.state==='walk'){e.walkTimer++;if(e.walkTimer>8){e.walkTimer=0;e.walkFrame=(e.walkFrame+1)%2}}
if((e.type==='buzzy'||e.type==='penguin'||e.type==='shyGuy'||e.type==='rex')&&e.onGround&&e.state==='walk'){const _ax=e.vx>0?e.x+e.w+2:e.x-2;const _ay=e.y+e.h+2;if(!_solidsNear(_ax,64).some(p=>_ax>=p.x&&_ax<p.x+p.w&&_ay>=p.y&&_ay<p.y+p.h)){e.vx=-e.vx;if(e.type==='penguin'||e.type==='shyGuy'||e.type==='rex')e.facing=e.vx>0?1:-1;}}
if(e.state==='shell'&&Math.abs(e.vx)>1){for(const o of enemies){if(o===e||!o.alive||o.state==='dead'||o.frozen)continue;if(overlap(e.x,e.y,e.w,e.h,o.x,o.y,o.w,o.h)&&_enemyHit(o,'shell')==='kill'){o.state='dead';o.squishT=20;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnScorePopup(o.x+8,o.y-8,200,'#e74c3c')}}}
if(e.frozen)continue; // 凍結敵は通常衝突スキップ（専用処理で対応）
if(overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){
if(G.starTimer>0){e.state='dead';e.squishT=20;G.score+=200;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');spawnScorePopup(e.x+8,e.y-8,200,'#FFD700');continue}
if(e.type==='cheepH'||e.type==='cheepV'||e.type==='firePlant'){if(mario.inv===0)killMario();continue}
const mBot=mario.y+mario.h;if(mBot-mario.vy<=e.y+e.h*0.4){G.combo++;G.comboTimer=60;if(G.combo>G.stageMaxCombo)G.stageMaxCombo=G.combo;const cs=G.combo<=1?200:G.combo===2?400:G.combo===3?800:G.combo===4?1600:0;if(G.combo>=5){G.lives++;sfx('1up');spawnScorePopup(e.x+8,e.y-8,'1UP!','#2ecc71')}else{G.score+=cs;spawnScorePopup(e.x+8,e.y-8,cs,'#e74c3c')}
mario.vy=-9;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'dust');
if(e.type==='goomba'||e.type==='hammerBro'||e.type==='cactus'||e.type==='penguin'||e.type==='shyGuy'){e.state='dead';e.squishT=28;G.stageKills++;G.totalKills++;}
else if(e.type==='rex'){if(!e.rexHurt){e.rexHurt=true;e.h=TILE*0.5;e.y+=TILE*0.5;e.vx=(e.vx>=0?1:-1)*Math.max(Math.abs(e.vx)*1.8,2.2);mario.inv=30;}else{e.state='dead';e.squishT=28;G.stageKills++;G.totalKills++;}}
else if(e.type==='koopa'||e.type==='buzzy'){if(e.state==='walk'){e.state='shell';e.vx=0;e.h=TILE*0.7;e.shellTimer=300}else if(e.state==='shell'&&Math.abs(e.vx)<0.5)e.vx=mario.facing*8;else{e.vx=0;e.shellTimer=300}}}
else if(e.state==='shell'){if(isDash&&!mario.heldShell){mario.heldShell=e;e.vx=0;sfx('stomp');mario.inv=30;}else if(Math.abs(e.vx)<0.5){e.vx=mario.facing*8;sfx('stomp');mario.inv=10;}else if(mario.inv===0)killMario();}else if(mario.inv===0)killMario()}
if(e.state==='shell'){if(Math.abs(e.vx)<0.5)e.shellTimer--;if(e.shellTimer<=0){e.state='walk';e.vx=e.type==='buzzy'?-1.6:-1.3;const _oh=e.h;e.h=e.type==='koopa'?TILE*1.2:e.type==='buzzy'?TILE*0.85:TILE;e.y-=e.h-_oh;}}}
// Piranhas
for(const pr of piranhas){if(!pr.alive)continue;
// マリオが土管のすぐそばにいる間は、引っ込んでいれば出てこない（本家と同じ）
if(pr.t===undefined)pr.t=G.frame*0.03;{const _hid=Math.sin(pr.t+pr.phase)<=0,_near=!pr.ceiling&&Math.abs((mario.x+mario.w/2)-(pr.x+pr.w/2))<48;if(!(_hid&&_near))pr.t+=0.03;}const t=pr.t+pr.phase;
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
if(mBot-mario.vy<=bowser.y+bowser.h*0.35&&bowser.hurtTimer>0){mario.vy=-9;mario.hipDrop=false;mario.inv=Math.max(mario.inv,20);}else if(mBot-mario.vy<=bowser.y+bowser.h*0.35&&bowser.hurtTimer===0){const _hipDmg=mario.hipDrop?2:1;bowser.hurtTimer=60;bowser.hp-=_hipDmg;mario.vy=-11;mario.inv=60;mario.hipDrop=false;sfx('stomp');if(_hipDmg>1){G.shakeX=8;G.shakeY=8;spawnScorePopup(bowser.x+32,bowser.y-8,1000,'#ff4400');}else{spawnScorePopup(bowser.x+32,bowser.y-8,500,'#e74c3c');}
  // Phase2遷移チェック
  if(bowser.hp>0&&bowser.phase===1&&bowser.hp<=Math.floor(bowser.maxHp/2)){bowser.phase=2;bowser.phaseTransition=90;G.shakeX=14;G.shakeY=14;for(let pi=0;pi<30;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');try{beep(90,.5,'sawtooth',.35);beep(55,.6,'sawtooth',.3,.15);beep(35,.7,'sawtooth',.25,.3);}catch(ex){}try{stopBGM();startBGM();}catch(ex){}}
  if(bowser.hp<=0)_defeatBowser()}
else killMario()}
for(let i=fireballs.length-1;i>=0;i--){const fb=fireballs[i];if(!fb.alive)continue;if(bowser.hurtTimer===0&&overlap(fb.x,fb.y,fb.w,fb.h,bowser.x,bowser.y,bowser.w,bowser.h)){if(bowser.fireImmune){fb.alive=false;spawnParticle(fb.x,fb.y,'dust');continue}fb.alive=false;bowser.hurtTimer=70;bowser.hp--;sfx('stomp');spawnScorePopup(bowser.x+32,bowser.y-8,500,'#ff9944');spawnParticle(bowser.x+32,bowser.y+20,'star');
  // Phase2遷移チェック（ファイアボールダメージ時）
  if(bowser.hp>0&&bowser.phase===1&&bowser.hp<=Math.floor(bowser.maxHp/2)){bowser.phase=2;bowser.phaseTransition=90;G.shakeX=14;G.shakeY=14;for(let pi=0;pi<30;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');try{beep(90,.5,'sawtooth',.35);beep(55,.6,'sawtooth',.3,.15);beep(35,.7,'sawtooth',.25,.3);}catch(ex){}try{stopBGM();startBGM();}catch(ex){}}
  if(bowser.hp<=0)_defeatBowser()}}
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
mario.vx=0;mario.x+=3;mario.facing=1;mario.walkTimer++;if(mario.walkTimer>5){mario.walkTimer=0;mario.walkFrame=(mario.walkFrame+1)%3;}
G.cam=(G.ugMode&&!G.pipeDungeon)?0:Math.max(0,Math.min(mario.x-W/3,(G.pipeDungeon?3200:LW)-W));
if(mario.x+mario.w>=peach.x){peach.caught=true;peach.vx=0;G.peachChase.catchT=0;sfx('power');for(let pi=0;pi<20;pi++)spawnParticle(peach.x+15,peach.y+20,'star');}
}else{
G.peachChase.catchT++;
if(G.peachChase.catchT===1){G.score+=10000;updateHUD();}
if(G.peachChase.catchT>120){G.peachChase=null;peach.alive=false;G.score+=1000+G.timeLeft*50;G.timerTick=null;updateHUD();_recordClear();const _ns=getNextStage(G.currentWorld,G.currentLevel);if(_ns){G.nextStage=_ns;G.state='shop';G.shopCursor=0;G.shopBought={};G.shopConfirm=null;try{startBGM()}catch(ex){};saveGame();}else{G.state='win';const _isFin=G.currentWorld===8&&G.currentLevel===3;const _wCnt=_isFin?80:30;for(let wi=0;wi<_wCnt;wi++)setTimeout(()=>spawnParticle(mario.x+Math.random()*(_isFin?400:200)-(_isFin?200:100),H-TILE-(_isFin?200:100)+Math.random()*(_isFin?160:80),'star'),wi*(_isFin?40:60));if(_isFin){try{playVictoryFanfare();}catch(ex){}}}}
}
}
// Lava flames（周期を1.8倍に延長してゆっくり出現）
for(const f of lavaFlames){f.phase++;if(f.capH===undefined||f.phase%30===0){let _cap=Infinity;for(const p of _solidsNear(f.x,96)){if(p.x<f.x+f.w&&p.x+p.w>f.x&&p.y+p.h<=H-TILE&&p.type!=='hidden'&&p.type!=='coin')_cap=Math.min(_cap,H-TILE-(p.y+p.h));}f.capH=_cap;}const _per=f.period*1.8;const cyc=f.phase%_per,rise=Math.floor(_per*0.28),stay=Math.floor(_per*0.18);if(cyc<rise){f.curH=Math.min(f.maxH,(cyc/rise)*f.maxH*1.1)}else if(cyc<rise+stay){f.curH=f.maxH}else{f.curH=Math.max(0,f.curH-f.maxH/(rise*0.7))}f.curH=Math.min(f.curH,f.capH);if(f.curH>12){const ft=H-TILE-f.curH;if(mario.inv===0&&G.starTimer===0&&mario.x+mario.w>f.x-2&&mario.x<f.x+f.w+2&&mario.y+mario.h>ft&&mario.y<H-TILE)killMario()}}
if(G.ugMode&&G.state==='play'&&!G.peachChase&&!bowser.alive&&!G.pipeDungeon&&mario.x>W-1.5*TILE&&mario.onGround)exitUnderground();
if(G.checkpoint&&!G.checkpointReached&&mario.x>G.checkpoint.x){G.checkpointReached=true;G.checkpoint.reached=true;sfx('flag');spawnScorePopup(G.checkpoint.x,G.checkpoint.y-TILE*3,'CHECK!','#2ecc71');for(let i=0;i<10;i++)spawnParticle(G.checkpoint.x+8,G.checkpoint.y-TILE*2,'star')}
// クッパ前チェックポイント（2つ目）
if(G.checkpoint2&&!G.checkpoint2.reached&&mario.x>G.checkpoint2.x){G.checkpoint2.reached=true;G.checkpointReached=true;G.checkpoint.x=G.checkpoint2.x;G.checkpoint.y=G.checkpoint2.y;G.checkpoint.reached=true;sfx('flag');spawnScorePopup(G.checkpoint2.x,G.checkpoint2.y-TILE*3,'CHECK!','#ff4444');for(let i=0;i<10;i++)spawnParticle(G.checkpoint2.x+8,G.checkpoint2.y-TILE*2,'star')}
if(G.currentLevel!==3&&!G.ugMode&&!mario.dead&&mario.x+mario.w>=flagPole.x&&mario.x<=flagPole.x+96){sfx('flag');stopBGM();playStageClearFanfare();if(mario.y<=H-TILE-flagPole.h+24){G.coins=Math.min(3000,G.coins+10);updateHUD();sfx('coin');for(let _fi=0;_fi<10;_fi++){const _fa=(_fi/9)*Math.PI*2;coinItems.push({x:mario.x+13+Math.cos(_fa)*20,y:mario.y+16,collected:false,pop:true,popVy:-4-Math.random()*3,popY:0,life:35});}spawnScorePopup(mario.x+13,mario.y-20,'+10C','#FFD700');}G.goalSlide={phase:'slide',t:0};mario.vx=0;mario.vy=0}
// Fireballs
for(let i=fireballs.length-1;i>=0;i--){const fb=fireballs[i];if(!fb.alive){fireballs.splice(i,1);continue}
fb.vy+=(G.waterMode?0:0.55);fb.x+=fb.vx;fb.y+=fb.vy;
if(!G.waterMode)for(const p of _solidsNear(fb.x,96)){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(fb.x,fb.y,fb.w,fb.h,p.x,py,p.w,p.h))continue;if(fb.y+fb.h/2<py+p.h/2){fb.y=py-fb.h;fb.vy=-8;fb.bounces++}else fb.alive=false;break}
if(fb.bounces>4||fb.x<G.cam-80||fb.x>G.cam+W+80||fb.y>H+50)fb.alive=false;
for(const e of enemies){if(!fb.alive)break;if(!e.alive||e.state==='dead'||e.type==='miniBowser')continue;if(!overlap(fb.x,fb.y,fb.w,fb.h,e.x,e.y,e.w,e.h))continue;
if(e.type==='plantFire'){e.alive=false;fb.alive=false;G.score+=100;updateHUD();spawnParticle(e.x+7,e.y+7,'star');continue}
if(e.type==='cheepH'||e.type==='cheepV'||e.type==='firePlant'){e.state='dead';e.squishT=20;fb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnParticle(e.x+12,e.y+10,'star');spawnScorePopup(e.x+8,e.y-8,200,'#ff9944');coinItems.push({x:e.x+8,y:e.y+4,type:'firecoin',vx:(Math.random()-0.5)*2,vy:-4-Math.random()*2,gravity:0.35,timer:180,collected:false});continue}
if(e.type==='bobomb'){if(e.state==='walk'){e.state='lit';e.litTimer=120;}fb.alive=false;spawnParticle(e.x+16,e.y+16,'dust');continue;}
if(e.type==='buzzy'||e.type==='cactus'||e.type==='teresa'||e.type==='thwomp'||e.type==='dryBones'||e.type==='angrySun'||e.type==='spikeTop'||e.type==='spiny'||e.type==='fuzzy'){fb.alive=false;spawnParticle(e.x+16,e.y+16,'dust');continue}
if(e.type==='chuck'){fb.alive=false;_enemyHit(e,'fire');continue}
e.state='dead';e.vx=0;e.squishT=28;fb.alive=false;G.score+=200;sfx('stomp');updateHUD();spawnScorePopup(e.x+8,e.y-8,200,'#ff9944');spawnParticle(e.x+16,e.y+16,'star');coinItems.push({x:e.x+8,y:e.y+4,type:'firecoin',vx:(Math.random()-0.5)*2,vy:-4-Math.random()*2,gravity:0.35,timer:180,collected:false})}}
// === Ice Balls ===
for(let i=iceBalls.length-1;i>=0;i--){const ib=iceBalls[i];if(!ib.alive){iceBalls.splice(i,1);continue}
ib.vy+=(G.waterMode?0:0.45);ib.x+=ib.vx;ib.y+=ib.vy;
if(!G.waterMode)for(const p of _solidsNear(ib.x,96)){const bo=p.bounceOffset||0,py=p.y-bo;if(!overlap(ib.x,ib.y,ib.w,ib.h,p.x,py,p.w,p.h))continue;if(ib.y+ib.h/2<py+p.h/2){ib.y=py-ib.h;ib.vy=-6;ib.bounces++}else ib.alive=false;break}
if(ib.bounces>5||ib.x<G.cam-80||ib.x>G.cam+W+80||ib.y>H+50)ib.alive=false;
for(const e of enemies){if(!e.alive||e.state==='dead'||e.type==='miniBowser')continue;if(!overlap(ib.x,ib.y,ib.w,ib.h,e.x,e.y,e.w,e.h))continue;
if(e.frozen){ib.alive=false;e.alive=false;e.frozen=false;e.shakeX=0;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnScorePopup(e.x+8,e.y-8,200,'#44bbff');spawnParticle(e.x+16,e.y+16,'star');coinItems.push({x:e.x+8,y:e.y+4,type:'firecoin',vx:(Math.random()-0.5)*2,vy:-4-Math.random()*2,gravity:0.35,timer:180,collected:false});break;}
if(e.type==='dryBones'||e.type==='angrySun'||e.type==='spikeTop'||e.type==='fuzzy'){ib.alive=false;spawnParticle(e.x+16,e.y+16,'dust');break;}
if(e.type!=='blooper'&&_enemyHit(e,'ice')!=='kill'){ib.alive=false;spawnParticle(e.x+16,e.y+16,'dust');break;}
if(e.type==='blooper'){e.state='dead';e.squishT=20;ib.alive=false;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+12,e.y+12,'star');spawnScorePopup(e.x+8,e.y-8,200,'#44bbff');break;}
ib.alive=false;e.frozen=true;e.frozenTimer=240;e.frozenVx=e.vx;e.vx=0;G.score+=100;sfx('coin');updateHUD();spawnScorePopup(e.x+8,e.y-8,'ICE!','#44bbff');spawnParticle(e.x+16,e.y+16,'star');break}
// bowser ice hit
if(ib.alive&&bowser.alive&&bowser.state!=='dead'&&bowser.hurtTimer===0&&overlap(ib.x,ib.y,ib.w,ib.h,bowser.x,bowser.y,bowser.w,bowser.h)){
ib.alive=false;if(!bowser.fireImmune){bowser.hurtTimer=90;bowser.hp--;sfx('stomp');spawnScorePopup(bowser.x+32,bowser.y-8,500,'#44bbff');spawnParticle(bowser.x+32,bowser.y+20,'star');
if(bowser.hp>0&&bowser.phase===1&&bowser.hp<=Math.floor(bowser.maxHp/2)){bowser.phase=2;bowser.phaseTransition=90;G.shakeX=14;G.shakeY=14;for(let pi=0;pi<30;pi++)spawnParticle(bowser.x+Math.random()*64,bowser.y+Math.random()*72,'star');try{stopBGM();startBGM();}catch(ex){}}
if(bowser.hp<=0)_defeatBowser()}else{spawnParticle(ib.x,ib.y,'dust')}}}
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
if(bowser.hp<=0)_defeatBowser()}}
// === Frozen enemies update ===
for(const e of enemies){if(!e.alive||!e.frozen)continue;if(e.state==='dead'){e.frozen=false;continue;}e.frozenTimer--;if(e.frozenTimer<=0){e.frozen=false;e.vx=e.frozenVx||0;e.frozenVx=0;e.shakeX=0;}
// 溶ける前にブルブル震える
if(e.frozen&&e.frozenTimer>0&&e.frozenTimer<60){e.shakeX=(Math.random()-0.5)*4;}else if(e.frozen){e.shakeX=0;}
// 凍結敵との衝突（完全にダメージなし、上に乗れる）
if(e.frozen&&overlap(mario.x,mario.y,mario.w,mario.h,e.x,e.y,e.w,e.h)){const mBot=mario.y+mario.h;
if(mBot-mario.vy<=e.y+e.h*0.5&&mario.vy>=0){mario.y=e.y-mario.h;mario.vy=0;mario.onGround=true;}
else if(mario.vy<0&&mario.y-mario.vy>=e.y+e.h-6){mario.y=e.y+e.h+1;mario.vy=0;}}
// 凍結敵を足場として使う
if(e.frozen&&mario.vy>=0&&!mario.onGround){const prevBot=mario.y-mario.vy+mario.h;if(prevBot<=e.y+4&&overlap(mario.x+2,mario.y,mario.w-4,mario.h,e.x,e.y,e.w,e.h)){mario.y=e.y-mario.h;mario.vy=0;mario.onGround=true;}}
// ↓キーで踏みつけ→コイン化
if(e.frozen&&mario.onGround&&!mario.dead&&mario.y+mario.h>=e.y-2&&mario.y+mario.h<=e.y+6&&mario.x+mario.w>e.x&&mario.x<e.x+e.w){const _isDown=act('down');if(_isDown){e.alive=false;e.frozen=false;e.shakeX=0;mario.vy=-6;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnScorePopup(e.x+8,e.y-8,200,'#44bbff');spawnParticle(e.x+16,e.y+16,'star');coinItems.push({x:e.x+8,y:e.y+4,type:'firecoin',vx:(Math.random()-0.5)*2,vy:-4-Math.random()*2,gravity:0.35,timer:180,collected:false});}}}
// === Mega Timer ===
if(G.megaTimer>0){G.megaTimer--;if(G.frame%6===0)spawnParticle(mario.x+13,mario.y+mario.h/2,'star');
// メガ状態: 敵に触れると即死
for(const e of enemies){if(!e.alive||e.state==='dead'||e.type==='miniBowser')continue;if(overlap(mario.x-8,mario.y-8,mario.w+16,mario.h+16,e.x,e.y,e.w,e.h)){e.state='dead';e.squishT=20;G.score+=200;G.stageKills++;G.totalKills++;sfx('stomp');updateHUD();spawnParticle(e.x+16,e.y+16,'star');G.shakeX=3;G.shakeY=3;}}
// メガ状態: レンガ破壊
for(let pi=platforms.length-1;pi>=0;pi--){const p=platforms[pi];if(p.type!=='brick')continue;if(overlap(mario.x-4,mario.y-4,mario.w+8,mario.h+8,p.x,p.y-(p.bounceOffset||0),p.w,p.h)){sfx('break');G.score+=50;updateHUD();spawnParticle(p.x+16,p.y,'brick');platforms.splice(pi,1);G.shakeX=2;G.shakeY=2;}}
if(G.megaTimer<=0){mario.power=G.megaPrevPower;mario.big=G.megaPrevBig;{const _nh=mario.crouching?(mario.big?24:20):(mario.big?48:32);mario.y+=mario.h-_nh;mario.h=_nh;}sfx('power');}}
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
// DRAWING → src/draw.js
// ================================================================

// 開発用フック（npm run dev のときだけ有効）: コンソールから状態確認・コマ送り・キー入力ができる
if(import.meta.env&&import.meta.env.DEV){window.__game={G,mario,step:(n=1)=>{for(let i=0;i<n;i++){pollGamepad();if(!(G.state==='play'&&G.paused))update();}draw();},key:(type,code)=>document.dispatchEvent(new KeyboardEvent(type,{code}))};}
// PWA: 本番ビルドのときだけ Service Worker を登録（オフラインで遊べる・ホーム画面に追加できる）
if(import.meta.env&&import.meta.env.PROD&&'serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register(import.meta.env.BASE_URL+'sw.js').catch(()=>{});});}
let _prevT=performance.now(),_acc=0;const _STEP=1000/60;
// メインループ（60回/秒の固定更新）
// ・次のフレームの予約を先に行い、例外が出てもゲームが止まらないようにする（以前は1回の例外で永久に停止した）
// ・rAF のタイムスタンプを使う（performance.now() だと揺らぎで更新回数が0/2回になりカクついた）
// ・更新が1回も無かったフレームは描かない（120Hz以上の画面で無駄な描画を省く。ポーズ中は描く）
(function _loop(ts){requestAnimationFrame(_loop);
  const _now=typeof ts==='number'?ts:performance.now();_acc+=Math.min(Math.max(0,_now-_prevT),200);_prevT=_now;
  let _n=0;
  try{while(_acc>=_STEP){pollGamepad();if(!(G.state==='play'&&G.paused))update();_acc-=_STEP;_n++;}if(_n>0||G.paused||G.menu)draw();}
  catch(err){_acc=0;console.error('[game loop]',err);}
})();
