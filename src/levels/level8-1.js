import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

// 8-1: 戦艦アプローチ (Battleship Approach)
// 強制スクロール(0.8) + 3隻の戦艦 + キャノン×5 + ワープパイプ→ゴール
// Ground zones (ship decks):
//   Ship A: Z1=0-1200
//   Gap1: 1200-1450
//   Ship B: Z2=1450-2900
//   Gap2: 2900-3150
//   Ship C: Z3=3150-4400
//   Gap3: 4400-4600
//   Landing: Z4=4600-5200 (warp pipe)
export function buildLevel_8_1(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.waterMode=false;G.swimCooldown=0;G.iceMode=false;
  peach.alive=false;G.peachChase=null;bowser.alive=false;
  G.bowserRightX=0;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;
  G.autoScroll=0.8;
  flagPole.x=5040; // フラッグポール（階段ゴール）

  // 地面（船の甲板：micro-gap追加 at x=700）
  const gaps=[{s:700,e:780},{s:1200,e:1450},{s:2900,e:3150},{s:4400,e:4600}];
  for(let x=0;x<5200;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ── 船A (0-1200): 入門戦艦 ──
  // 甲板上の構造物
  addRow(350, H-5*TILE, 4,'brick'); // 350-478
  addRow(700, H-7*TILE, 3,'brick'); // 700-796
  addRow(900, H-5*TILE, 3,'brick'); // 900-996

  // ── 船B (1450-2900): 中型戦艦 ──
  addRow(1500,H-5*TILE, 4,'brick'); // 1500-1628
  addRow(1800,H-7*TILE, 3,'brick'); // 1800-1896
  addRow(2100,H-5*TILE, 5,'brick'); // 2100-2260
  addRow(2500,H-7*TILE, 3,'brick'); // 2500-2596
  addRow(2700,H-5*TILE, 3,'brick'); // 2700-2796

  // ── 船C (3150-4400): 大型戦艦 ──
  addRow(3200,H-5*TILE, 4,'brick'); // 3200-3328
  addRow(3500,H-7*TILE, 3,'brick'); // 3500-3596
  addRow(3800,H-5*TILE, 5,'brick'); // 3800-3960
  addRow(4100,H-7*TILE, 3,'brick'); // 4100-4196

  // ── 甲板追加構造物（高度バリエーション）──
  addRow(450, H-3*TILE, 2,'brick'); // 450-514（Ship A低層・micro-gap前）
  addRow(1600,H-6*TILE, 2,'brick'); // 1600-1664（Ship B上層）
  addRow(2300,H-8*TILE, 2,'brick'); // 2300-2364（Ship B高層）
  addRow(3400,H-3*TILE, 2,'brick'); // 3400-3464（Ship C低層）
  addRow(3700,H-6*TILE, 2,'brick'); // 3700-3764（Ship C上層）

  // ── Landing (4600-5200): 最終甲板 ──
  addRow(4650,H-5*TILE, 3,'brick'); // 4650-4746

  // ── ヨッシーブロック ──
  platforms.push({x:200, y:H-5*TILE, w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});

  // ── ? ブロック（座標重複なし確認済み）──
  // Ship A
  platforms.push({x:500, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 500>478 ✓
  platforms.push({x:810, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 810>796 ✓
  platforms.push({x:1010,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 1010>996 ✓
  // Ship B
  platforms.push({x:1640,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1640>1628 ✓
  platforms.push({x:1910,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1910>1896 ✓
  platforms.push({x:2280,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2280>2260 ✓
  platforms.push({x:2610,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 2610>2596 ✓
  // Ship C
  platforms.push({x:3340,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3340>3328 ✓
  platforms.push({x:3610,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3610>3596 ✓
  platforms.push({x:3980,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3980>3960 ✓
  platforms.push({x:4210,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 4210>4196 ✓
  // Landing
  platforms.push({x:4760,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4760>4746 ✓

  // 隠し1UP
  platforms.push({x:600,  y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2000, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:3700, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // ── 移動足場（ギャップ越え）──
  movingPlats.push({x:1260,y:H-3*TILE,w:TILE*3,h:12,type:'h',ox:1260,range:60, spd:1.4,prevX:1260});
  movingPlats.push({x:2960,y:H-3*TILE,w:TILE*3,h:12,type:'h',ox:2960,range:70, spd:1.6,prevX:2960});
  movingPlats.push({x:4440,y:H-3*TILE,w:TILE*3,h:12,type:'h',ox:4440,range:55, spd:1.8,prevX:4440});

  // ── キャノン（5基）──
  cannons.push({x:550,  y:H-TILE*2,w:TILE,h:TILE*2,fireRate:280,timer:40});
  cannons.push({x:1000, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:260,timer:100});
  cannons.push({x:2000, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:250,timer:60});
  cannons.push({x:2800, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:240,timer:130});
  cannons.push({x:4000, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:260,timer:80});

  // ── 土管（パックン付き）──
  pipes.push({x:800,  y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:2300, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:3600, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  piranhas.push({x:pipes[0].x+24,baseY:pipes[0].y,y:pipes[0].y,w:16,h:TILE,phase:0,  alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[1].x+24,baseY:pipes[1].y,y:pipes[1].y,w:16,h:TILE,phase:1.5,alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[2].x+24,baseY:pipes[2].y,y:pipes[2].y,w:16,h:TILE,phase:3.0,alive:true,maxUp:TILE*1.5});

  // ── 階段＋フラッグポール（ゴール）──
  addStair(4832, 6); // 6段上り階段（x=4832〜4992, top=H-7*TILE）

  // ── 敵配置 ──
  // チェックポイント x=2200 から±300px: 1900〜2500 には敵を置かない

  // クリボー ×6
  [500, 750, 1550, 2600, 3300, 4150].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE,vx:-1.3,vy:0,alive:true,
      type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false});
  });

  // ノコノコ ×5
  [650, 1700, 2700, 3500, 4300].forEach(ex=>{
    enemies.push({x:ex,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1.3,vy:0,alive:true,
      type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // メット（buzzy）×4
  [850, 1880, 3200, 4050].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE*0.85,vx:-1.8,vy:0,alive:true,
      type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false});
  });

  // 飛びノコノコ（ギャップ上空）
  [{x:1320,baseY:H-4*TILE,phase:0},{x:3000,baseY:H-5*TILE,phase:1.2},{x:4480,baseY:H-4*TILE,phase:0.5}].forEach(({x,baseY,phase})=>{
    enemies.push({x,y:baseY,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,
      type:'parakoopa',flying:true,baseY,phase,
      state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // ── コイン ──
  // ① ギャップアーチ（micro-gap + 既存3ギャップ = 4つ）
  [{s:700,e:780},{s:1200,e:1450},{s:2900,e:3150},{s:4400,e:4600}].forEach(({s,e})=>{
    for(let j=0;j<10;j++){const t=j/9;coinItems.push({x:s+t*(e-s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});}
  });
  // ② 甲板上コイン
  for(let j=0;j<8;j++)  coinItems.push({x:100+j*72,  y:H-3*TILE,collected:false});  // Ship A前半(0-700)
  for(let j=0;j<5;j++)  coinItems.push({x:800+j*76,  y:H-3*TILE,collected:false});  // Ship A後半(780-1200)
  for(let j=0;j<18;j++) coinItems.push({x:1470+j*78, y:H-3*TILE,collected:false}); // Ship B
  for(let j=0;j<16;j++) coinItems.push({x:3170+j*76, y:H-3*TILE,collected:false}); // Ship C
  for(let j=0;j<8;j++)  coinItems.push({x:4620+j*70, y:H-3*TILE,collected:false}); // Landing
  // ③ クラスター：ギャップ際コイン群（旧③の退屈ラインを一部置換）
  // gap1(1200-1450)際：左端縦列
  [1160,1170,1180].forEach(cx=>[H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 9枚
  // gap2(2900-3150)際：右端クラスター
  [3160,3170,3180].forEach(cx=>[H-2*TILE,H-3*TILE,H-4*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 9枚
  // ③-b ブロック上ライン（一部残す）
  for(let j=0;j<10;j++) coinItems.push({x:400+j*80,  y:H-7*TILE,collected:false});
  for(let j=0;j<12;j++) coinItems.push({x:3250+j*90, y:H-7*TILE,collected:false});
  // ④ 新ブロック層コイン
  for(let j=0;j<2;j++) coinItems.push({x:1600+j*32,y:H-8*TILE,collected:false}); // H-6T addRow上
  for(let j=0;j<2;j++) coinItems.push({x:2300+j*32,y:H-10*TILE,collected:false}); // H-8T addRow上
  for(let j=0;j<2;j++) coinItems.push({x:3700+j*32,y:H-8*TILE,collected:false}); // H-6T addRow上
  // ⑤ 高空コイン
  for(let j=0;j<8;j++) coinItems.push({x:500+j*130, y:H-9*TILE,collected:false});
  for(let j=0;j<10;j++) coinItems.push({x:1700+j*120,y:H-9*TILE,collected:false});
  for(let j=0;j<10;j++) coinItems.push({x:3300+j*110,y:H-9*TILE,collected:false});

  // チェックポイント（Ship B中央・周辺300px: 1900〜2500禁止済み ✓）
  G.checkpoint={x:2200,y:H-TILE,reached:false};

  // ★ ハンマースーツ・巨大キノコ
  platforms.push({x:4300,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  platforms.push({x:1100,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:600,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:3400,y:0,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  piranhas.push({x:3424,baseY:2*TILE,y:2*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});

  // ★ 追いかけ壁（飛行船の爆発が迫る）
  G.chasingWall={x:-300,speed:0.95,triggerX:2400,active:false}; // チェックポイント(x=2200)通過後に起動
}
