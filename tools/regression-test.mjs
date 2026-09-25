// 回帰テスト: 過去に見つかった不具合が再発していないかを、本物のゲームループで確認する
// 使い方: node tools/regression-test.mjs
import {installEnv,step,key} from './smoke/env.mjs';
installEnv();
const g=await import('../src/globals.js');
const {G,mario,enemies,platforms,pipes,bowser,flagPole,H,TILE}=g;
const {STAGES}=await import('../src/stages.js');
await import('../src/main.js');

let fails=0;
const ok=(cond,msg)=>{console.log(`${cond?'✅':'❌'} ${msg}`);if(!cond)fails++;};
const run=(n,each)=>{for(let i=0;i<n;i++){if(each)each(i);step();}};
const press=(code,n=1)=>{key('keydown',code);run(n);key('keyup',code);};
function start(id){G.menu=null;G.paused=false;G.state='start';G.selectedStage=id;run(25);press('Enter');run(200);}
// テスト用の平らな地面（ステージの地形と干渉しないように）
function flat(){platforms.length=0;pipes.length=0;for(let x=0;x<3000;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',hit:false,bounceOffset:0});}
const stageId=(w,l)=>STAGES.find(s=>s.world===w&&s.level===l).id;

// 甲羅から戻ったノコノコがワープしない
{start(1);enemies.length=0;flat();const gx=400;
 enemies.push({type:'koopa',x:gx,y:H-TILE-TILE*0.7,w:TILE,h:TILE*0.7,vx:0,vy:0,alive:true,state:'shell',shellTimer:5,activated:true,onGround:true,facing:-1});
 mario.x=100;run(40);const k=enemies[0];
 ok(k.state==='walk'&&k.x<=gx+2&&Math.abs(k.y+k.h-(H-TILE))<1,`甲羅→歩き復帰でワープせず地面に立つ (x ${gx}→${Math.round(k.x)}, 足元y=${Math.round(k.y+k.h)})`);}
// 蹴った甲羅は滑っている途中で歩きに戻らない
{start(1);enemies.length=0;
 enemies.push({type:'koopa',x:600,y:H-TILE-TILE*0.7,w:TILE,h:TILE*0.7,vx:8,vy:0,alive:true,state:'shell',shellTimer:3,activated:true,onGround:true,facing:1});
 mario.x=100;run(20);ok(enemies[0].state==='shell','蹴った甲羅は滑走中に歩きへ戻らない');}
// ゴール演出中にタイムアップしない
{start(1);mario.x=flagPole.x-120;mario.y=0;mario.vy=0;G.starTimer=600;G.timeLeft=2;
 key('keydown','ArrowRight');run(600);key('keyup','ArrowRight');
 ok(G.state==='shop'&&G.lives>=1&&!mario.dead,`残り2秒で旗に触れてもショップへ進める (state=${G.state})`);}
// リトライハートがあってもタイムアップでは復活しない（タイマー停止の防止）
{start(1);G.retryHeart=2;G.timeLeft=1;const lv=G.lives;run(200);
 ok(G.lives===lv-1&&G.retryHeart===0,`タイムアップはハートで防がない (lives ${lv}→${G.lives}, heart=${G.retryHeart})`);}
// 城のクッパが次のステージに持ち越されない
{start(stageId(1,3));ok(bowser.alive,'1-3 ではクッパが存在する');start(1);ok(!bowser.alive,'1-1 に切り替えるとクッパは消える');}
// 土管に入って戻っても2つ目のチェックポイントが残る（1-3）
{start(stageId(1,3));const cp2=G.checkpoint2;const wp=pipes.find(p=>p.isWarp&&!p.ceiling);
 if(cp2&&wp){mario.x=wp.x+wp.w/2-mario.w/2;mario.y=wp.y-mario.h;mario.vy=0;mario.onGround=true;run(2);press('ArrowDown',2);
  const ex=pipes.find(p=>p.isExit&&!p.horizontal);if(G.ugMode&&ex){mario.x=ex.x+ex.w/2-mario.w/2;mario.y=ex.y-mario.h;mario.vy=0;mario.onGround=true;run(2);press('ArrowDown',2);run(20);}
  ok(!G.ugMode&&G.checkpoint2&&G.checkpoint2.x===cp2.x,'土管の出入り後も2つ目のCPが残る');}
 else ok(false,'1-3 に CP2 またはワープ土管が見つからない');}
// ヒップドロップの衝撃波が同じ床の敵に当たる
{start(1);enemies.length=0;flat();const gx=360;
 enemies.push({type:'goomba',x:gx,y:H-TILE-TILE,w:TILE,h:TILE,vx:0,vy:0,alive:true,state:'walk',activated:true,onGround:true});
 mario.x=gx-40;mario.y=H-TILE-mario.h-120;mario.vy=2;mario.onGround=false;key('keydown','ArrowDown');run(40);key('keyup','ArrowDown');
 ok(enemies[0].state==='dead'||!enemies[0].alive,'ヒップドロップ着地で横のクリボーを倒せる');}
// タイトルから遊んだEX: ミス → EXをやり直し（クラッシュしない）／ クリア → タイトルへ
{start(STAGES.length+1);ok(G.isExStage&&G.state==='play','タイトルからEX-1を開始できる');
 mario.y=H+100;run(200);ok(G.isExStage&&(G.state==='play'||G.state==='intro')&&!G.pinoRoom,`EXでミス → EXを最初から (state=${G.state}, pino=${G.pinoRoom})`);
 run(150);mario.x=flagPole.x-120;mario.y=0;mario.vy=0;G.starTimer=600;key('keydown','ArrowRight');run(600);key('keyup','ArrowRight');
 ok(G.state==='start'&&!G.isExStage,`EXクリア → タイトルへ戻り、別ステージをクリア扱いにしない (state=${G.state})`);}
// タイトル画面で敵の弾に当たっても死なない
{G.state='start';const lv=G.lives;mario.inv=0;run(5);
 enemies.push({type:'goomba',x:mario.x,y:mario.y,w:TILE,h:TILE,vx:0,vy:0,alive:true,state:'walk',activated:true});run(30);
 ok(G.state==='start'&&G.lives===lv,'タイトル画面中は死なない');enemies.length=0;}
// 重力反転ゾーンでブロックの下面に着地できる（毎フレーム叩き判定にならない）
{start(stageId(3,1));const z=g.gravityZones[0];
 if(z){platforms.length=0;enemies.length=0;const bx=z.x+100,by=120;for(let i=0;i<4;i++)platforms.push({x:bx+i*TILE,y:by,w:TILE,h:TILE,type:'brick',hit:false,bounceOffset:0});
  for(let x=z.x-300;x<z.x+z.w+300;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',hit:false,bounceOffset:0});
  mario.x=bx+20;mario.y=H-TILE-mario.h;mario.vy=0;run(120);
  ok(G.gravityFlipped&&mario.onGround&&Math.abs(mario.y-(by+TILE))<2,`重力反転: ブロック下面に着地 (y=${mario.y.toFixed(0)}, onGround=${mario.onGround})`);
  ok(platforms.filter(p=>p.type==='brick').length===4,'重力反転: 下面に張り付いてもレンガを壊し続けない');}
 else ok(false,'3-1 に重力ゾーンが無い');}

console.log(fails?`\n失敗 ${fails} 件`:'\nすべて成功');
process.exit(fails?1:0);
