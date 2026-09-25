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

// ===== 2回目の徹底調査で直した不具合 =====
const {coinItems,mushrooms,lavaFlames,yoshi,movingPlats,springs,G:_G}=g;
const releaseKeys=()=>{for(const c of ['ArrowRight','ArrowLeft','ShiftLeft','ArrowDown','Space'])key('keyup',c);};
const koopa=(x,y)=>({type:'koopa',x,y,w:TILE,h:TILE*1.2,vx:-1.3,vy:0,alive:true,state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,activated:true});
// 地面に数pxめり込んだノコノコが押し出されてワープしない
{start(1);enemies.length=0;flat();mario.x=100;enemies.push(koopa(600,H-2*TILE));run(60);
 ok(enemies[0].alive&&Math.abs(enemies[0].x-600)<120&&Math.abs(enemies[0].y+enemies[0].h-(H-TILE))<1,`めり込み配置のノコノコがワープしない (x 600→${Math.round(enemies[0].x)})`);}
// スライディングで敵を倒せる（先にやられない）
{start(1);enemies.length=0;flat();mario.power='big';mario.big=true;mario.h=48;mario.y=H-TILE-48;mario.x=200;mario.inv=0;
 enemies.push({type:'goomba',x:480,y:H-2*TILE,w:TILE,h:TILE,vx:0,vy:0,alive:true,state:'walk',activated:true});
 key('keydown','ArrowRight');key('keydown','ShiftLeft');let _n=0;while(mario.x<400&&_n++<120)step();
 key('keydown','ArrowDown');run(2);const _slid=mario.sliding;run(30);releaseKeys();
 ok(_slid&&enemies[0].state==='dead'&&!mario.dead&&mario.power==='big',`スライディングでクリボーを倒せる（マリオは無傷: slide=${_slid} power=${mario.power}）`);}
// 動く甲羅でドッスンは倒れない・チャックはファイア1発で倒れない
{start(1);enemies.length=0;flat();mario.x=100;
 const tw={type:'thwomp',x:700,y:H-TILE-64,w:64,h:64,vx:0,vy:0,alive:true,state:'idle',waitTimer:0,activated:true};
 enemies.push(tw,{type:'koopa',x:600,y:H-TILE-TILE*0.7,w:TILE,h:TILE*0.7,vx:8,vy:0,alive:true,state:'shell',shellTimer:300,activated:true});run(20);
 ok(tw.alive&&tw.state!=='dead','動く甲羅でドッスンは倒れない');
 enemies.length=0;const ch={type:'chuck',x:mario.x+120,y:H-TILE-TILE*1.4,w:TILE,h:TILE*1.4,vx:0,vy:0,alive:true,state:'idle',facing:-1,hp:3,activated:true,onGround:true};enemies.push(ch);
 mario.power='fire';mario.big=true;mario.h=48;mario.y=H-TILE-48;mario.facing=1;press('KeyZ');run(20);
 ok(ch.alive&&ch.state!=='dead'&&ch.hp===2,`チャックはファイア1発で倒れずHPが減る (hp=${ch.hp}, state=${ch.state})`);}
// Pスイッチ中にコイン磁石で「足場に変わったコイン」を拾わない
{start(1);enemies.length=0;flat();coinItems.length=0;G.coinMagnet=true;mario.x=100;
 for(let i=0;i<4;i++)coinItems.push({x:220+i*32,y:H-4*TILE,collected:false});
 platforms.push({x:400,y:H-2*TILE,w:TILE,h:TILE,type:'pswitch',hit:false,bounceOffset:0});
 mario.x=400;mario.y=H-2*TILE-mario.h-4;mario.vy=1;run(10);const c0=G.coins;run(60);
 ok(G.pswitchTimer>0&&G.coins===c0,`Pスイッチ中は隠れたコインを磁石で拾わない (coins ${c0}→${G.coins})`);G.coinMagnet=false;}
// ?ブロックの真上がふさがっていたらアイテムは下に出る（埋まらない）
{start(1);enemies.length=0;flat();mushrooms.length=0;const qx=400,qy=H-TILE-128;
 platforms.push({x:qx,y:qy,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0},{x:qx,y:qy-TILE,w:TILE,h:TILE,type:'brick',hit:false,bounceOffset:0});
 mario.x=qx+3;mario.y=H-TILE-mario.h;run(2);key('keydown','Space');run(12);key('keyup','Space');run(5);
 const m=mushrooms[0];ok(m&&m.y>=qy,`上がふさがった?ブロックのアイテムは下に出る (item y=${m?Math.round(m.y):'なし'} ブロック=${qy})`);}
// ヨッシーが敵を食べるとタマゴがたまる
{start(1);enemies.length=0;flat();Object.assign(yoshi,{alive:true,mounted:true,eggsReady:0,eatCount:0,tongueOut:0,tongueLen:0,eatTarget:null,chewTimer:0,x:mario.x,y:mario.y,facing:1});mario.facing=1;
 enemies.push({type:'goomba',x:mario.x+60,y:H-2*TILE,w:TILE,h:TILE,vx:0,vy:0,alive:true,state:'walk',activated:true});
 press('KeyX');run(60);ok(yoshi.eggsReady===1,`ヨッシーが食べるとタマゴが1個たまる (eggsReady=${yoshi.eggsReady})`);yoshi.alive=false;yoshi.mounted=false;}
// 火柱は上のブロックで止まり、ブロックの上に立つマリオを焼かない
{start(1);enemies.length=0;flat();lavaFlames.length=0;lavaFlames.push({x:400,w:22,maxH:200,period:60,phase:0,curH:0});
 for(let i=0;i<3;i++)platforms.push({x:380+i*TILE,y:H-TILE-4*TILE,w:TILE,h:TILE,type:'brick',hit:false,bounceOffset:0});
 mario.x=400;mario.y=H-TILE-5*TILE-mario.h;mario.vy=0;mario.inv=0;const lv=G.lives;run(240);
 ok(!mario.dead&&G.lives===lv,'火柱はブロックで止まり、上に立つマリオを焼かない');lavaFlames.length=0;}
// 中間地点から復帰した直後は無敵時間がある
{start(STAGES.find(s=>s.world===2&&s.level===2).id);const cp=G.checkpoint;G.checkpointReached=true;cp.reached=true;mario.y=H+100;run(150);
 ok(G.state==='play'&&!mario.dead&&mario.inv>0,`中間地点から復帰した直後は無敵時間がある (inv=${mario.inv})`);}
// ゲームループは例外が出ても止まらない
{start(1);const f0=G.frame;let threw=false;enemies.push({get alive(){throw new Error('test');}});
 try{step();}catch(e){threw=true;}enemies.length=0;run(5);ok(threw&&G.frame>f0+3,`ループ内の例外で止まらない (frame ${f0}→${G.frame})`);}
// ブロックや土管に埋まったコインは取れる位置へ移される
{const {sanitizeLevel}=await import('../src/sanitize.js');coinItems.length=0;pipes.length=0;platforms.length=0;
 pipes.push({x:500,y:H-TILE-96,w:64,h:96,bounceOffset:0});coinItems.push({x:510,y:H-TILE-64,collected:false});sanitizeLevel();
 ok(coinItems.length===1&&coinItems[0].y+24<=H-TILE-96,`土管に埋まったコインは上に移される (y=${coinItems[0]?.y})`);}

console.log(fails?`\n失敗 ${fails} 件`:'\nすべて成功');
process.exit(fails?1:0);
