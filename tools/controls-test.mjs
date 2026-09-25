// 操作性テスト: コヨーテタイム・先行入力・角ずらし・着地補正・キー割当変更を、本物のゲームループで確認する
// 使い方: node tools/controls-test.mjs
import {installEnv,step,key} from './smoke/env.mjs';
installEnv();
const {G,mario,enemies,platforms,pipes,movingPlats,springs,H,TILE}=await import('../src/globals.js');
await import('../src/main.js');
const input=await import('../src/input.js');

let fails=0;
const ok=(cond,msg)=>{console.log(`${cond?'✅':'❌'} ${msg}`);if(!cond)fails++;};
const run=n=>{for(let i=0;i<n;i++)step();};

// 1-1を開始して、テスト用の平らな地形に置き換える
function setup(){
  G.state='start';G.selectedStage=1;key('keydown','Enter');key('keyup','Enter');run(200);
  enemies.length=0;pipes.length=0;movingPlats.length=0;springs.length=0;platforms.length=0;
  G.starTimer=0;mario.inv=0;G.timeLeft=400;
}
function ground(x0,x1){for(let x=x0;x<x1;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',hit:false,bounceOffset:0});}
function block(x,y,type='ground'){platforms.push({x,y,w:TILE,h:TILE,type,hit:false,bounceOffset:0});}
function place(x,y){mario.x=x;mario.y=y;mario.vx=0;mario.vy=0;mario.onGround=false;}

// --- コヨーテタイム: 足場から落ちて3F後にジャンプ → 跳べる ---
{setup();ground(0,400);ground(700,2000);place(300,H-TILE-mario.h);run(3);
 key('keydown','ArrowRight');let n=0;while(mario.onGround&&n++<200)step();
 run(2);key('keydown','Space');step();const vy=mario.vy;key('keyup','Space');key('keyup','ArrowRight');
 ok(vy<-10,`コヨーテタイム: 落下開始3F後のジャンプが出る (vy=${vy.toFixed(1)})`);}
// --- コヨーテ切れ: 落ちて12F後 → 跳べない ---
{setup();ground(0,400);place(300,H-TILE-mario.h);run(3);
 key('keydown','ArrowRight');let n=0;while(mario.onGround&&n++<200)step();
 run(11);key('keydown','Space');step();const vy=mario.vy;key('keyup','Space');key('keyup','ArrowRight');
 ok(vy>0,`コヨーテ切れ: 落下12F後はジャンプしない (vy=${vy.toFixed(1)})`);}
// --- 先行入力: 着地の数F前に押して離す → 着地時にジャンプ ---
{setup();ground(0,2000);place(300,H-TILE-mario.h-60);let n=0;
 while(mario.y+mario.h<H-TILE-18&&n++<200)step(); // 地面の18px上まで落ちたら押す
 key('keydown','Space');step();key('keyup','Space');
 let jumped=false;for(let i=0;i<12;i++){step();if(mario.vy<-5){jumped=true;break;}}
 ok(jumped,'先行入力: 着地直前に押したジャンプが着地後に出る');}
// --- 押しっぱなし（キーリピート）では連続ジャンプしない ---
{setup();ground(0,2000);place(300,H-TILE-mario.h);run(3);
 key('keydown','Space');run(90); // 1回跳んで着地
 let again=false;for(let i=0;i<30;i++){key('keydown','Space',true);step();if(mario.vy<-5)again=true;}
 key('keyup','Space');ok(!again,'キーリピートでは再ジャンプしない');}
// --- 角ずらし: 頭がブロックの角に4pxだけ当たる → 横にずれて上へ抜ける ---
{setup();ground(0,2000);const bx=500,by=H-TILE-110;block(bx,by);
 place(bx-mario.w+5,H-TILE-mario.h);run(2);const x0=mario.x;
 key('keydown','Space');run(25);key('keyup','Space');
 ok(mario.y<by,`角ずらし: ブロックの横を抜けて上まで跳べた (x ${x0.toFixed(0)}→${mario.x.toFixed(0)}, y=${mario.y.toFixed(0)})`);}
// --- ?ブロックは角ずらししない（角でも叩ける） ---
{setup();ground(0,2000);const bx=500,by=H-TILE-110;block(bx,by,'question');
 place(bx-mario.w+5,H-TILE-mario.h);run(2);
 key('keydown','Space');run(25);key('keyup','Space');
 ok(platforms.find(p=>p.x===bx&&p.y===by)?.hit===true,'?ブロック: 角に当たったら叩ける（ずらさない）');}
// --- 着地補正: 足先が段差の上端より5px下の高さで横から当たる → 上に乗る ---
{setup();ground(0,2000);const bx=600,by=H-TILE*3;block(bx,by);block(bx+TILE,by);
 place(bx-mario.w-2,by-mario.h+5);mario.vy=1;key('keydown','ArrowRight');run(3);key('keyup','ArrowRight');
 ok(Math.abs(mario.y+mario.h-by)<1,`着地補正: 段差の上に乗れた (feet=${(mario.y+mario.h).toFixed(1)} top=${by})`);}
// --- キー割当変更: ジャンプを KeyQ に割り当て → Q でジャンプ ---
{setup();ground(0,2000);place(300,H-TILE-mario.h);run(3);
 input.setBind('jump',0,'KeyQ');key('keydown','KeyQ');step();const vy=mario.vy;key('keyup','KeyQ');
 ok(vy<-10,`キーコンフィグ: 割り当てたキー(Q)でジャンプ (vy=${vy.toFixed(1)})`);
 input.resetAndSaveBinds();ok(input.isBound('Space','jump')&&!input.isBound('KeyQ','jump'),'キーコンフィグ: 初期化で元に戻る');}
// --- 二重割当の解消: 既に FIRE の Z を JUMP に割り当てると FIRE から外れる ---
{input.setBind('jump',2,'KeyZ');ok(input.isBound('KeyZ','jump')&&!input.isBound('KeyZ','fire'),'キーコンフィグ: 二重割当は自動で外れる');input.resetAndSaveBinds();}
// --- ポーズ中はジャンプ入力を受け付けない ---
{setup();ground(0,2000);place(300,H-TILE-mario.h);run(3);G.paused=true;key('keydown','Space');key('keyup','Space');G.paused=false;step();
 ok(mario.vy>=0,'ポーズ中の入力は解除後に実行されない');}

console.log(fails?`\n失敗 ${fails} 件`:'\nすべて成功');
process.exit(fails?1:0);
