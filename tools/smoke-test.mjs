// スモークテスト: 本物のゲームループ(main.js)をNode上で動かし、全ステージで
//   ・例外(実行時エラー) ・NaN/Infinity ・残り時間マイナス などの異常を検出する
// 使い方: node tools/smoke-test.mjs [フレーム数(既定2400)] [ステージid...]
import {installEnv,step,key,storage} from './smoke/env.mjs';

// 乱数を固定（再現性のため）
let _seed=12345;Math.random=()=>{_seed=(_seed*1103515245+12345)&0x7fffffff;return _seed/0x7fffffff;};

installEnv();
const errors=[];
// 非同期に投げられた例外（setTimeout内など）も拾う
process.on('uncaughtException',e=>errors.push({where:'async',msg:e.message,stack:(e.stack||'').split('\n').slice(0,3).join(' | ')}));

const g=await import('../src/globals.js');
const {G,mario,enemies,pipes,platforms,flagPole}=g;
const {STAGES}=await import('../src/stages.js');
await import('../src/main.js');

const FRAMES=Number(process.argv[2])||2400;
const only=process.argv.slice(3).map(Number).filter(Boolean);
const STATES=new Set(['start','intro','play','dead','over','win','shop']);

let cur='boot',frameNo=0;
function tick(){
  frameNo++;
  try{step();}catch(e){errors.push({where:cur,frame:frameNo,msg:e.message,stack:(e.stack||'').split('\n').slice(1,3).join(' | ')});return false;}
  const bad=[];
  for(const k of ['x','y','vx','vy'])if(!Number.isFinite(mario[k]))bad.push('mario.'+k+'='+mario[k]);
  for(const k of ['cam','score','coins','timeLeft','lives'])if(!Number.isFinite(G[k]))bad.push('G.'+k+'='+G[k]);
  if(G.state==='play'&&G.timeLeft<0)bad.push('timeLeft<0 ('+G.timeLeft+')');
  if(!STATES.has(G.state))bad.push('unknown state '+G.state);
  for(const e of enemies)if(e.alive&&(!Number.isFinite(e.x)||!Number.isFinite(e.y))){bad.push(`enemy ${e.type} pos NaN`);break;}
  if(bad.length){errors.push({where:cur,frame:frameNo,msg:bad.join(', ')});return false;}
  return true;
}
function run(n,bot){for(let i=0;i<n;i++){if(bot)bot(i);G.lives=Math.max(G.lives,5);if(!tick())return false;}return true;}
function press(code,frames=1){key('keydown',code);run(frames);key('keyup',code);}

// 簡易ボット: 右ダッシュしながら不規則にジャンプ・しゃがみ・ファイア
function makeBot(){
  let jumpHold=0,jumpWait=10,down=0;
  return i=>{
    if(i===0){key('keydown','ArrowRight');key('keydown','ShiftLeft');}
    if(i%240===200)key('keyup','ShiftLeft');if(i%240===0)key('keydown','ShiftLeft');
    if(jumpHold>0){if(--jumpHold===0)key('keyup','Space');}
    else if(--jumpWait<=0){key('keydown','Space');jumpHold=4+Math.floor(Math.random()*14);jumpWait=jumpHold+3+Math.floor(Math.random()*30);}
    if(down>0){if(--down===0)key('keyup','ArrowDown');}else if(Math.random()<0.004){key('keydown','ArrowDown');down=8;}
    if(i%50===25)press('KeyZ');
  };
}
function releaseAll(){for(const c of ['ArrowRight','ArrowLeft','ShiftLeft','Space','ArrowDown'])key('keyup',c);}

function startStage(id){
  G.state='start';G.paused=false;G.selectedStage=id;
  key('keydown','Enter');key('keyup','Enter');
  run(200);
  if(G.state!=='play')errors.push({where:cur,msg:`開始後にplayにならない state=${G.state}`});
}

const results=[];
for(const st of STAGES){
  if(only.length&&!only.includes(st.id))continue;
  const label=`${st.world}-${st.level}`;
  const r={label,maxX:0,deaths:0,ug:false,goal:false};
  // 1) ボット走行（死亡・リスタート・CP復帰の経路も通る）
  cur=`${label} bot`;startStage(st.id);
  const bot=makeBot();let lives=G.lives;
  run(FRAMES,i=>{bot(i);r.maxX=Math.max(r.maxX,mario.x);if(G.lives<lives)r.deaths++;lives=G.lives;
    if(G.state==='dead'){key('keydown','Space');key('keyup','Space');}});
  releaseAll();
  // 2) 土管ワープ: 最初のワープ土管に乗って↓ → 地下を少し走る → 出口から戻り、地上の足場数が元に戻るか
  cur=`${label} pipe`;startStage(st.id);
  const wp=pipes.find(p=>p.isWarp&&!p.ceiling);
  if(wp){
    const before=platforms.length;
    mario.x=wp.x+wp.w/2-mario.w/2;mario.y=wp.y-mario.h;mario.vy=0;mario.onGround=true;
    run(2);press('ArrowDown',2);
    if(G.ugMode){r.ug=true;run(600,makeBot());releaseAll();
      if(G.ugMode&&!mario.dead){const ex=pipes.find(p=>p.isExit&&!p.horizontal);
        if(ex){mario.x=ex.x+ex.w/2-mario.w/2;mario.y=ex.y-mario.h;mario.vy=0;mario.onGround=true;run(2);press('ArrowDown',2);run(30);
          if(!G.ugMode&&platforms.length!==before)errors.push({where:cur,msg:`地上復帰後に足場数が変化 ${before}→${platforms.length}`});}}}
  }
  // 3) ゴール: 旗の手前に移動して右へ → ショップ → 次ステージ開始まで
  if(st.bgmTheme!=='castle'){
    cur=`${label} goal`;startStage(st.id);
    mario.x=flagPole.x-120;mario.y=0;mario.vy=0;G.starTimer=600;
    key('keydown','ArrowRight');run(600);key('keyup','ArrowRight');
    if(G.state==='shop'){r.goal=true;press('Enter');run(200);if(G.state!=='play'&&G.state!=='intro')errors.push({where:cur,msg:`ショップ後 state=${G.state}`});}
  }
  results.push(r);
}

console.log('stage  maxX  deaths  pipe goal');
for(const r of results)console.log(`${r.label.padEnd(5)} ${String(Math.round(r.maxX)).padStart(5)} ${String(r.deaths).padStart(6)}   ${r.ug?'○':'-'}    ${r.goal?'○':'-'}`);
const uniq=new Map();for(const e of errors){const k=e.msg+'|'+(e.stack||'');if(!uniq.has(k))uniq.set(k,{...e,count:0});uniq.get(k).count++;}
console.log(`\nエラー: ${errors.length}件（重複除外 ${uniq.size}種）`);
for(const e of uniq.values())console.log(`- [${e.where}${e.frame?' f'+e.frame:''}] x${e.count} ${e.msg}${e.stack?'\n    '+e.stack:''}`);
process.exit(errors.length?1:0);
