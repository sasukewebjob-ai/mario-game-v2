import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

// 6-2: 氷の崖 (Icy Cliffs)
// 高台多め・落下プラットフォーム・キャノン・JumpBlock・難度↑
// Ground zones: Z1=0-480, Z2=740-1350, Z3=1680-2200/2296-2500, Z4=2850-3700, Z5=4100-4650/4746-5200, Z6=5600-6300, Z7=6600-7050/7146-8000
export function buildLevel_6_2(){
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

  // 地面（氷の割れ目×6）
  const gaps=[{s:480,e:740},{s:1350,e:1680},{s:2200,e:2296},{s:2500,e:2850},{s:3700,e:4100},{s:4650,e:4746},{s:5200,e:5600},{s:6300,e:6600},{s:7050,e:7146}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ── 高台ブロック ──
  // Z1 (0-480)
  addRow(150, H-5*TILE, 3,'brick'); // 150,182,214 → 末端246
  addRow(350, H-7*TILE, 4,'brick'); // 350,382,414,446 → 末端478
  // Z2 (740-1350)
  addRow(780, H-5*TILE, 4,'brick'); // 780,812,844,876 → 末端908
  addRow(1000,H-9*TILE, 3,'brick'); // 1000,1032,1064 → 末端1096
  addRow(1200,H-7*TILE, 3,'brick'); // 1200,1232,1264 → 末端1296
  // Z3 (1680-2500)
  addRow(1740,H-5*TILE, 4,'brick'); // 1740,1772,1804,1836 → 末端1868
  addRow(1980,H-9*TILE, 3,'brick'); // 1980,2012,2044 → 末端2076
  addRow(2200,H-7*TILE, 3,'brick'); // 2200,2232,2264 → 末端2296
  addRow(2380,H-5*TILE, 3,'brick'); // 2380,2412,2444 → 末端2476
  // Z4 (2850-3700)
  addRow(2920,H-5*TILE, 4,'brick'); // 2920,2952,2984,3016 → 末端3048
  addRow(3150,H-7*TILE, 3,'brick'); // 3150,3182,3214 → 末端3246
  addRow(3400,H-9*TILE, 3,'brick'); // 3400,3432,3464 → 末端3496
  addRow(3560,H-5*TILE, 3,'brick'); // 3560,3592,3624 → 末端3656
  // Z5 (4100-5200)
  addRow(4160,H-5*TILE, 4,'brick'); // 4160,4192,4224,4256 → 末端4288
  addRow(4400,H-7*TILE, 3,'brick'); // 4400,4432,4464 → 末端4496
  addRow(4700,H-9*TILE, 3,'brick'); // 4700,4732,4764 → 末端4796
  addRow(5000,H-5*TILE, 4,'brick'); // 5000,5032,5064,5096 → 末端5128
  // Z6 (5600-6300)
  addRow(5660,H-5*TILE, 4,'brick'); // 5660,5692,5724,5756 → 末端5788
  addRow(5900,H-7*TILE, 3,'brick'); // 5900,5932,5964 → 末端5996
  addRow(6080,H-9*TILE, 3,'brick'); // 6080,6112,6144 → 末端6176
  // Z7 (6600-8000)
  addRow(6660,H-5*TILE, 4,'brick'); // 6660,6692,6724,6756 → 末端6788
  addRow(6900,H-7*TILE, 3,'brick'); // 6900,6932,6964 → 末端6996
  addRow(7150,H-5*TILE, 3,'brick'); // 7150,7182,7214 → 末端7246
  addStair(7300, 6);

  // ── ? ブロック（各addRowと座標重複なし確認済み）──
  // Z1
  platforms.push({x:260, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 260>246 ✓
  platforms.push({x:480, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 480>478 ✓ (ギャップ直前)
  // Z2
  platforms.push({x:748, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 748<780 ✓
  platforms.push({x:920, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 920>908 ✓
  platforms.push({x:1100,y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1100>1096 ✓
  // Z3
  platforms.push({x:1690,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1690<1740 ✓
  platforms.push({x:1880,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1880>1868 ✓
  platforms.push({x:2090,y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 2090>2076 ✓
  platforms.push({x:2310,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2310>2296 ✓
  // Z4
  platforms.push({x:2870,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2870<2920 ✓
  platforms.push({x:3060,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3060>3048 ✓
  platforms.push({x:3510,y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 3510>3496 ✓
  // Z5
  platforms.push({x:4300,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4300>4288 ✓
  platforms.push({x:4510,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4510>4496 ✓
  platforms.push({x:4810,y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4810>4796 ✓
  platforms.push({x:5140,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5140>5128 ✓
  // Z6
  platforms.push({x:5610,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5610<5660 ✓
  platforms.push({x:5800,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 5800<5900 ✓
  platforms.push({x:6010,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6010>5996 ✓
  // Z7
  platforms.push({x:6640,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6640<6660 ✓
  platforms.push({x:6800,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6800<6900 ✓
  platforms.push({x:7010,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 7010>6996 ✓

  // 隠し1UP
  platforms.push({x:100, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2500,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4900,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:7000,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // ヨッシーブロック
  platforms.push({x:1300,y:H-9*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0}); // y=H-9T ✓
  platforms.push({x:3660,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0}); // チェックポイント近く(3660>3624 addRow末端 ✓)

  // 土管（グラウンドゾーン内）
  pipes.push({x:300, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:2100,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:5000,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:7050,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  // ワープ土管（地下へ）
  pipes.push({x:950, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0,isWarp:true,variant:'ice3'});
  pipes.push({x:3100,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0,isWarp:true,variant:'ice4'});
  pipes.forEach((p,i)=>{if(p.isWarp)return;piranhas.push({x:p.x+8,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5});});

  // キャノン（2基）
  cannons.push({x:1900,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:280,timer:40});
  cannons.push({x:4600,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:260,timer:100});

  // 移動足場（落下型・スリル感）
  movingPlats.push({x:560, y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:560, range:90, spd:1.4,prevX:560});
  movingPlats.push({x:1430,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:1430,range:100,spd:1.6,prevX:1430});
  movingPlats.push({x:2580,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:2580,range:90, spd:1.5,prevX:2580});
  // 落下足場（ギャップ4・5の中）
  movingPlats.push({x:3820,y:H-5*TILE,w:TILE*3,h:12,type:'fall',ox:3820,range:0,spd:1,prevX:3820,oy:H-5*TILE,vy:0,fallTimer:0,falling:false});
  movingPlats.push({x:5310,y:H-5*TILE,w:TILE*3,h:12,type:'fall',ox:5310,range:0,spd:1,prevX:5310,oy:H-5*TILE,vy:0,fallTimer:0,falling:false});

  // ── 敵配置 ──
  // ペンギン（グラウンドゾーンのみ）
  // チェックポイント x=3600 から±300px: 3300〜3900 には敵を置かない
  [800,1100,1760,2050,2360,2950,3050,3100,
   4380,4820,5700,5950,6200,6710,7200
  ].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE,vx:-2.0,vy:0,alive:true,
      type:'penguin',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // コンバット（地上）
  [{x:1050},{x:2320},{x:2700}].forEach(({x})=>{
    enemies.push({x,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1.3,vy:0,alive:true,
      type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // パラコンバット（空飛び）
  [{x:620,phase:0},{x:2620,phase:0.8},{x:4200,phase:1.4},{x:6420,phase:0.3}].forEach(({x,phase})=>{
    enemies.push({x,y:H-7*TILE,w:TILE,h:TILE*1.2,vx:-1.3,vy:0,alive:true,
      type:'parakoopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
      flying:true,baseY:H-7*TILE,phase,facing:-1});
  });

  // JumpBlock（3体・高台から飛び跳ねる）
  jumpBlocks.push({x:1050,y:H-6*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,onGround:false,jumpTimer:50});
  jumpBlocks.push({x:3200,y:H-6*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,onGround:false,jumpTimer:35});
  jumpBlocks.push({x:5850,y:H-6*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,onGround:false,jumpTimer:60});

  // ワンワン（2体）
  chainChomps.push({x:2750,y:H-TILE-36,w:36,h:36,postX:2750,postY:H-TILE-36,vx:0,vy:0,phase:0,   state:'idle',lungeTimer:0,alive:true});
  chainChomps.push({x:6750,y:H-TILE-36,w:36,h:36,postX:6750,postY:H-TILE-36,vx:0,vy:0,phase:1.2, state:'idle',lungeTimer:0,alive:true});

  // ── コイン（300枚以上）──
  // ① ギャップアーチ（各10枚 × 6 = 60枚）
  [{s:480,e:740},{s:1350,e:1680},{s:2200,e:2296},{s:2500,e:2850},{s:3700,e:4100},{s:4650,e:4746},{s:5200,e:5600},{s:6300,e:6600},{s:7050,e:7146}].forEach(({s,e})=>{
    for(let j=0;j<10;j++){
      const t=j/9;
      coinItems.push({x:s+t*(e-s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});
    }
  });
  // ② 高台上コイン
  [[150,H-7*TILE,3],[780,H-7*TILE,4],[1740,H-7*TILE,4],[2920,H-7*TILE,4],
   [4160,H-7*TILE,4],[5660,H-7*TILE,4],[6660,H-7*TILE,4]
  ].forEach(([cx,cy,n])=>{for(let j=0;j<n;j++) coinItems.push({x:cx+j*32,y:cy,collected:false});});
  // ③ 地面ライン
  for(let j=0;j<12;j++) coinItems.push({x:100 +j*32,y:H-3*TILE,collected:false}); // Z1
  for(let j=0;j<17;j++) coinItems.push({x:780 +j*32,y:H-3*TILE,collected:false}); // Z2
  for(let j=0;j<22;j++) coinItems.push({x:1710+j*32,y:H-3*TILE,collected:false}); // Z3
  for(let j=0;j<22;j++) coinItems.push({x:2900+j*32,y:H-3*TILE,collected:false}); // Z4
  for(let j=0;j<27;j++) coinItems.push({x:4150+j*32,y:H-3*TILE,collected:false}); // Z5
  for(let j=0;j<18;j++) coinItems.push({x:5640+j*32,y:H-3*TILE,collected:false}); // Z6
  for(let j=0;j<32;j++) coinItems.push({x:6640+j*32,y:H-3*TILE,collected:false}); // Z7
  // ④ スカイライン
  for(let j=0;j<25;j++) coinItems.push({x:200+j*300,y:H-9*TILE,collected:false});

  // チェックポイント（Z4地面上・周辺300px以内に敵なし: 3300〜3900 配置禁止済み）
  G.checkpoint={x:3600,y:H-TILE,reached:false};

  // フラッグポール: デフォルト LW-500=7500
// ★ ハンマースーツ・巨大キノコ
platforms.push({x:3500,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
platforms.push({x:2700,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
// ★ 装飾土管
pipes.push({x:1900,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
pipes.push({x:4800,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
}
