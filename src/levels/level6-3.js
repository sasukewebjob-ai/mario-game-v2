import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW,BOWSER_STATS} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

// 6-3: 氷の城 (Ice Castle)
// 全面氷スライド・クッパHP=4・ピーチ救出
// 溶岩なし（氷の城）→ 代わりに移動足場+キャノンで難度確保
// Ground zones: Z1=0-1100/1196-2000, Z2=2300-3000/3096-3700, Z3=4000-4800/4896-5500, Z4=5800-LW
export function buildLevel_6_3(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.waterMode=false;G.swimCooldown=0;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  G.iceMode=true;

  // 地面（氷の深淵×3）
  const gaps=[{s:1100,e:1196},{s:2000,e:2400},{s:3000,e:3096},{s:3700,e:4000},{s:4800,e:4896},{s:5500,e:5800}]; // ★ gap2 widened by 100px
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ── 城内ブロック（氷のレンガ壁） ──
  // Z1: 城入口〜前半
  addRow(0,   H-5*TILE, 3,'brick'); // 0,32,64 → 末端96
  addRow(300, H-5*TILE, 4,'brick'); // 300,332,364,396 → 末端428
  addRow(550, H-9*TILE, 3,'brick'); // 550,582,614 → 末端646
  addRow(900, H-7*TILE, 3,'brick'); // 900,932,964 → 末端996
  addRow(1200,H-5*TILE, 5,'brick'); // 1200,1232,1264,1296,1328 → 末端1360
  addRow(1650,H-7*TILE, 3,'brick'); // 1650,1682,1714 → 末端1746
  // Z2: 中盤
  addRow(2380,H-5*TILE, 4,'brick'); // 2380,2412,2444,2476 → 末端2508
  addRow(2380,H-9*TILE, 3,'brick'); // 2380,2412,2444 → 末端2476  (y異なるので重複なし)
  addRow(2750,H-7*TILE, 3,'brick'); // 2750,2782,2814 → 末端2846
  addRow(3100,H-5*TILE, 4,'brick'); // 3100,3132,3164,3196 → 末端3228
  addRow(3450,H-7*TILE, 3,'brick'); // 3450,3482,3514 → 末端3546
  // Z3: 後半
  addRow(4060,H-5*TILE, 4,'brick'); // 4060,4092,4124,4156 → 末端4188
  addRow(4060,H-9*TILE, 3,'brick'); // 同x・y異なる ✓
  addRow(4450,H-7*TILE, 3,'brick'); // 4450,4482,4514 → 末端4546
  addRow(4800,H-5*TILE, 4,'brick'); // 4800,4832,4864,4896 → 末端4928
  addRow(5100,H-7*TILE, 3,'brick'); // 5100,5132,5164 → 末端5196
  addRow(5350,H-5*TILE, 3,'brick'); // 5350,5382,5414 → 末端5446
  // Z4: アリーナ手前〜大階段
  addRow(5860,H-5*TILE, 4,'brick'); // 5860,5892,5924,5956 → 末端5988
  addRow(6200,H-7*TILE, 3,'brick'); // 6200,6232,6264 → 末端6296
  addRow(6450,H-5*TILE, 4,'brick'); // 6450,6482,6514,6546 → 末端6578

  // ★ Block Height Variety
  addRow(400, H-4*TILE, 3,'brick');   // Z1 低空 (400,432,464)
  addRow(1500,H-6*TILE, 3,'brick');   // Z1 中空 (1500,1532,1564)
  addRow(3200,H-4*TILE, 3,'brick');   // Z2 低空 (3200,3232,3264)
  addRow(5000,H-6*TILE, 3,'brick');   // Z3 中空 — wait 5100 at H-7T, 5000 at H-6T ok

  // 大型上り階段（クッパアリーナへ）
  addStair(6700, 10);
  G.stairSealX=6956;

  // アリーナ壁（7ブロック高 > クッパジャンプ上限 144px）
  for(let wy=H-8*TILE;wy<H-TILE;wy+=TILE){addB(7020,wy,'brick');addB(7052,wy,'brick');}
  // ★ アリーナ内 ? ブロック + 足場
  platforms.push({x:7150,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:7390,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  addRow(7220,H-7*TILE,2,'brick');   // 中段足場（左側）
  addRow(7400,H-6*TILE,2,'brick');   // 中段足場（右側）

  // ── ? ブロック（addRowと座標重複なし確認済み）──
  // Z1
  platforms.push({x:100, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 100>96 ✓
  platforms.push({x:440, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 440>428 ✓
  platforms.push({x:660, y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 660>646 ✓
  platforms.push({x:1010,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1010>996 ✓
  platforms.push({x:1370,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1370>1360 ✓
  platforms.push({x:1760,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 1760>1746 ✓
  // Z2
  platforms.push({x:2520,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2520>2508 ✓
  platforms.push({x:2860,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2860>2846 ✓
  platforms.push({x:3240,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3240>3228 ✓
  platforms.push({x:3560,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 3560>3546 ✓
  // Z3
  platforms.push({x:4200,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4200>4188 ✓
  platforms.push({x:4560,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4560>4546 ✓
  platforms.push({x:4940,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4940>4928 ✓
  platforms.push({x:5210,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5210>5196 ✓
  platforms.push({x:5460,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 5460>5446 ✓
  // Z4
  platforms.push({x:6000,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6000>5988 ✓
  platforms.push({x:6310,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6310>6296 ✓
  // アリーナ内 ? ブロック（壁右側）
  platforms.push({x:7160,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:7400,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});

  // 隠し1UP
  platforms.push({x:800, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2600,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4300,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6100,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // 土管（グラウンドゾーン内・パックンなし）
  pipes.push({x:700, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:1800,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:3600,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:5200,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  // 城はパックン2本のみ（難度調整）
  piranhas.push({x:pipes[0].x+24,baseY:pipes[0].y,y:pipes[0].y,w:16,h:TILE,phase:0,  alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[2].x+24,baseY:pipes[2].y,y:pipes[2].y,w:16,h:TILE,phase:1.8,alive:true,maxUp:TILE*1.5});

  // キャノン（4基）
  cannons.push({x:500, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:320,timer:20});
  cannons.push({x:1450,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:80});
  cannons.push({x:3000,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:280,timer:50});
  cannons.push({x:5000,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:260,timer:120});

  // 移動足場（氷の深淵越え）
  movingPlats.push({x:2060,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:2060,range:85, spd:1.5,prevX:2060});
  movingPlats.push({x:3760,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3760,range:90, spd:1.7,prevX:3760});
  movingPlats.push({x:5560,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5560,range:80, spd:1.9,prevX:5560});

  // ── 敵配置 ──
  // カロン（氷城の守護者・チェックポイント±300外）
  [600, 1200, 2000, 4000, 4700, 5500, 6300].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE*0.9,vx:-1.2,vy:0,alive:true,type:'dryBones',state:'walk',walkFrame:0,walkTimer:0,onGround:false,collapseTimer:0});
  });

  // ペンギン（グラウンドゾーンのみ）
  // チェックポイント x=3500 から±300px: 3200〜3800 には敵を置かない
  [750,1250,1350,1700,2400,2700,2950,3150,
   4300,4550,4950,5200,5950,6230,6870
  ].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE,vx:-2.0,vy:0,alive:true,
      type:'penguin',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // コンバット（ノコノコ）
  [{x:600},{x:1200},{x:2500},{x:2900},{x:4400},{x:5100},{x:6230}].forEach(({x})=>{
    enemies.push({x,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1.3,vy:0,alive:true,
      type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // ハンマーブロス（2体・チェックポイントから遠い場所）
  enemies.push({x:2850,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:80+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false});
  enemies.push({x:5050,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:100+Math.floor(Math.random()*80),onGround:false});

  // ── コイン ──
  // ① ギャップアーチ（各10枚 × 3 = 30枚）
  [{s:1100,e:1196},{s:2000,e:2300},{s:3000,e:3096},{s:3700,e:4000},{s:4800,e:4896},{s:5500,e:5800}].forEach(({s,e})=>{
    for(let j=0;j<10;j++){
      const t=j/9;
      coinItems.push({x:s+t*(e-s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});
    }
  });
  // ② 城内コイン（高台上）
  [[0,H-7*TILE,3],[300,H-7*TILE,4],[1200,H-7*TILE,5],[2380,H-7*TILE,4],[4060,H-7*TILE,4],[5860,H-7*TILE,4]
  ].forEach(([cx,cy,n])=>{for(let j=0;j<n;j++) coinItems.push({x:cx+j*32,y:cy,collected:false});});
  // ③ 地面ライン — ★ Z1前半をクラスターに置換
  // Z1 clusters (gap edge + vertical columns)
  [160,200,250,300,350].forEach(cx=>coinItems.push({x:cx,y:H-4*TILE,collected:false}));
  [500,550,600,660,720].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  [900,960,1020,1050].forEach(cx=>coinItems.push({x:cx,y:H-4*TILE,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:450,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:850,y:cy,collected:false}));
  // Risk coins at unusual heights
  [400,1200,2500,3500,4500,5500,6300].forEach(cx=>coinItems.push({x:cx,y:H-11*TILE,collected:false})); // Z1 前半
  for(let j=0;j<18;j++) coinItems.push({x:2400+j*70, y:H-3*TILE,collected:false}); // Z2
  for(let j=0;j<20;j++) coinItems.push({x:4100+j*70, y:H-3*TILE,collected:false}); // Z3
  for(let j=0;j<18;j++) coinItems.push({x:5900+j*35, y:H-3*TILE,collected:false}); // Z4

  // チェックポイント（Z2後半地面上・周辺300px以内に敵なし: 3200〜3800禁止済み）
  G.checkpoint={x:3500,y:H-TILE,reached:false};

  // ── クッパ（offscreen 登場パターン）──
  // addStair(6700, 10) → 最右端: 6700+9*32=6988。壁は 7020,7052。
  G.bowserArenaX=6955;G.checkpoint2={x:6550,y:H-TILE,reached:false}; // 階段頂上付近
  G.bowserLeftX=7086;  // 壁右端+34px
  const _bs=BOWSER_STATS[6];Object.assign(bowser,{
    alive:true,x:9000,y:H-TILE-bowser.h,w:64,h:72,
    hp:_bs.hp,maxHp:_bs.hp,vx:-_bs.speed,vy:0,facing:-1,
    hurtTimer:0,fireTimer:_bs.fireTimer,jumpTimer:_bs.jumpTimer,
    onGround:false,state:'offscreen',deadTimer:0,fireImmune:_bs.fireImmune,phase:1,phaseTransition:0
  });

  // ピーチ（クッパ撃破後に自動スポーン）
  // ★ ハンマースーツ
  platforms.push({x:5100,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:2500,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:4500,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:2200,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:6000,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  piranhas.push({x:4524,baseY:6*TILE,y:6*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
  pipes.push({x:1050,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:3350,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  // ★ 上空パタパタ（2段JMP対策）
  enemies.push({x:800,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:0.0,shellTimer:0,walkFrame:0,walkTimer:0});
  enemies.push({x:4300,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:1.6,shellTimer:0,walkFrame:0,walkTimer:0});
  // 追いかけ壁（氷床スライド + 壁で難度最大）
  G.chasingWall={x:-200,speed:0.95,triggerX:3700,active:false};

// ピノキオ部屋ワープ天井パイプ（1ステージに1本）
pipes.push({x:3400,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:true,ceiling:true,variant:'pinocchio'});
}
