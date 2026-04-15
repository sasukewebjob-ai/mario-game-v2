import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow} from '../builders.js';

export function buildLevel_5_2(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;
  G.autoScroll=0;G.waterMode=true;G.swimCooldown=0;
  peach.alive=false;G.peachChase=null;
  yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // 床（全面）
  for(let x=0;x<LW;x+=TILE)
    platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});
  // 天井（上限）
  for(let x=0;x<LW;x+=TILE)
    platforms.push({x,y:0,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // 岩礁（水中プラットフォーム）— 5-1より多め・高低差も大きい
  addRow(250,  H-5*TILE, 4, 'ground');
  addRow(700,  H-7*TILE, 3, 'ground');
  addRow(1200, H-4*TILE, 5, 'ground');
  addRow(1800, H-8*TILE, 3, 'ground');
  addRow(2500, H-5*TILE, 5, 'ground');
  addRow(3100, H-7*TILE, 4, 'ground');
  addRow(3800, H-4*TILE, 5, 'ground');
  addRow(4500, H-6*TILE, 4, 'ground');
  addRow(5100, H-8*TILE, 3, 'ground');
  addRow(5700, H-5*TILE, 5, 'ground');
  addRow(6400, H-7*TILE, 4, 'ground');

  // ★ Block Height Variety（水中の追加岩礁）
  addRow(450,  H-8*TILE, 3, 'ground');   // 高めの岩礁
  addRow(1500, H-4*TILE, 4, 'ground');   // 低めの岩礁
  addRow(3300, H-6*TILE, 3, 'ground');   // 中位の岩礁
  addRow(5400, H-4*TILE, 4, 'ground');   // 低めの岩礁

  // 土管3本
  // 土管1: warp→water3
  pipes.push({x:2000,y:H-TILE-4*TILE,w:TILE*2,h:4*TILE,bounceOffset:0,isWarp:true,variant:'water3'});
  // 土管2: warp→water4
  pipes.push({x:4800,y:H-TILE-4*TILE,w:TILE*2,h:4*TILE,bounceOffset:0,isWarp:true,variant:'water4'});
  // ゴール（フラッグポール）
  flagPole.x=7200;

  // 移動足場（難易度UP）
  movingPlats.push({x:550, y:H-6*TILE,w:TILE*2,h:12,type:'h',ox:550, range:80, spd:1.4,prevX:550});
  movingPlats.push({x:1500,y:H-7*TILE,w:TILE*2,h:12,type:'v',ox:1500,range:70, spd:1.5,prevX:1500,oy:H-7*TILE});
  movingPlats.push({x:2700,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:2700,range:90, spd:1.6,prevX:2700});
  movingPlats.push({x:3500,y:H-8*TILE,w:TILE*2,h:12,type:'v',ox:3500,range:80, spd:1.8,prevX:3500,oy:H-8*TILE});
  movingPlats.push({x:4200,y:H-6*TILE,w:TILE*2,h:12,type:'h',ox:4200,range:75, spd:1.7,prevX:4200});
  movingPlats.push({x:5500,y:H-7*TILE,w:TILE*2,h:12,type:'h',ox:5500,range:100,spd:2.0,prevX:5500});
  movingPlats.push({x:6200,y:H-5*TILE,w:TILE*2,h:12,type:'v',ox:6200,range:90, spd:1.9,prevX:6200,oy:H-5*TILE});

  // コイン（1ライン + クラスター + 縦列）
  for(let x=5050;x<7150;x+=64)  coinItems.push({x,y:H-7*TILE,collected:false,pop:false});
  // ★ Underwater Coin Clusters（旧ライン2本をクラスターに置換）
  // Cluster 1: 前半の散らばり
  [180,250,340,440,550,670,790,920,1060,1200,1350,1500,1660,1820].forEach(cx=>
    coinItems.push({x:cx,y:H-3*TILE,collected:false,pop:false}));
  [200,350,500,700,900,1100,1300,1500,1700,1900].forEach(cx=>
    coinItems.push({x:cx,y:H-9*TILE,collected:false,pop:false}));
  // Cluster 2: 中盤（高低差クラスター）
  [2300,2500,2700,2900,3100,3300,3500,3700,3900,4100,4300,4500,4700].forEach(cx=>
    coinItems.push({x:cx,y:H-4*TILE,collected:false,pop:false}));
  [2400,2600,2800,3000,3200,3400,3600,3800,4000,4200,4400,4600].forEach(cx=>
    coinItems.push({x:cx,y:H-10*TILE,collected:false,pop:false}));
  // Vertical columns (水中の縦コイン)
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:800,y:cy,collected:false,pop:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:2100,y:cy,collected:false,pop:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:4000,y:cy,collected:false,pop:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:6000,y:cy,collected:false,pop:false}));
  // Risk coins near ceiling
  [600,1600,2600,3600,4600,5600,6600].forEach(cx=>
    coinItems.push({x:cx,y:H-11*TILE,collected:false,pop:false}));
  // 土管アーチ
  [-2,-1,0,1,2].forEach(i=>coinItems.push({x:2016+i*32,y:H-10*TILE+Math.abs(i)*TILE,collected:false,pop:false}));
  [-2,-1,0,1,2].forEach(i=>coinItems.push({x:4816+i*32,y:H-10*TILE+Math.abs(i)*TILE,collected:false,pop:false}));
  [-2,-1,0,1,2].forEach(i=>coinItems.push({x:7216+i*32,y:H-10*TILE+Math.abs(i)*TILE,collected:false,pop:false}));

  // はてなブロック
  platforms.push({x:500, y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1400,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,bounceOffset:0});
  platforms.push({x:2600,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3700,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:5000,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6300,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  // かくし1UP
  platforms.push({x:900, y:H-12*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4000,y:H-12*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6700,y:H-12*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // キノコブロック追加
  platforms.push({x:350, y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1900,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4100,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6500,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});

  // チェックポイント
  G.checkpoint={x:3800,y:H-TILE,reached:false};

  // ぷくぷく横
  [{x:300, y:H-3*TILE,vx:-1.5},{x:600, y:H-5*TILE,vx:-1.75},
   {x:900, y:H-4*TILE,vx:-1.4},{x:1300,y:H-6*TILE,vx:-1.6},
   {x:1900,y:H-3*TILE,vx:-1.75},{x:2400,y:H-5*TILE,vx:-1.5},
   {x:2900,y:H-4*TILE,vx:-1.9},{x:3400,y:H-6*TILE,vx:-1.5},
   {x:4120,y:H-3*TILE,vx:-1.75},{x:4600,y:H-5*TILE,vx:-1.6},
   {x:5200,y:H-4*TILE,vx:-1.9},{x:5800,y:H-6*TILE,vx:-1.5},
   {x:6300,y:H-3*TILE,vx:-1.75},{x:6800,y:H-5*TILE,vx:-1.6}
  ].forEach(d=>enemies.push({x:d.x,y:d.y,w:24,h:20,vx:d.vx,type:'cheepH',alive:true,activated:true}));

  // クリボー（水底を歩く）
  [{x:400},{x:1000},{x:1700},{x:2600},{x:3300},{x:4120},{x:4900},{x:5600},{x:6500},{x:7000}
  ].forEach(d=>enemies.push({x:d.x,y:H-2*TILE,w:TILE,h:TILE,vx:-1,vy:0,alive:true,type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false}));

  // ぷくぷく縦（振れ幅大きい）
  [{x:800, baseY:H-6*TILE,range:90,phase:0},
   {x:1600,baseY:H-7*TILE,range:100,phase:1.0},
   {x:2300,baseY:H-5*TILE,range:80, phase:2.0},
   {x:3480,baseY:H-7*TILE,range:110,phase:0.5},
   {x:4100,baseY:H-6*TILE,range:90, phase:1.5},
   {x:5000,baseY:H-7*TILE,range:100,phase:2.5},
   {x:5900,baseY:H-5*TILE,range:85, phase:0.3},
   {x:6700,baseY:H-7*TILE,range:95, phase:1.8},
  ].forEach(d=>enemies.push({x:d.x,y:d.baseY,baseY:d.baseY,range:d.range,phase:d.phase,w:24,h:20,type:'cheepV',alive:true,activated:true}));

  // ゲッソー（水中追跡）
  [{x:700,y:H-5*TILE},{x:1900,y:H-7*TILE},{x:3100,y:H-5*TILE},
   {x:4500,y:H-8*TILE},{x:5300,y:H-6*TILE},{x:6600,y:H-4*TILE}
  ].forEach(d=>enemies.push({x:d.x,y:d.y,w:24,h:20,vx:0,vy:0,type:'blooper',alive:true}));

  // ファイアフラワー（固定設置・一定間隔でファイア）
  [{x:450, y:H-6*TILE},{x:1100,y:H-5*TILE},
   {x:2200,y:H-9*TILE},{x:3000,y:H-8*TILE},
   {x:4120,y:H-5*TILE},{x:4700,y:H-7*TILE},
   {x:5400,y:H-9*TILE},{x:6100,y:H-6*TILE},
   {x:7000,y:H-5*TILE}
  ].forEach(d=>enemies.push({
    x:d.x,y:d.y,w:20,h:20,
    type:'firePlant',alive:true,activated:true,
    fireTimer:Math.floor(80+Math.random()*60),
    maxFireTimer:Math.floor(80+Math.random()*60)
  }));
// ★ ハンマースーツ・巨大キノコ
platforms.push({x:1000,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
platforms.push({x:2500,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
platforms.push({x:3500,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
platforms.push({x:5500,y:H-10*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
platforms.push({x:4500,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
// ★ 装飾土管
pipes.push({x:1500,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
pipes.push({x:4000,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:2200,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:5800,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
piranhas.push({x:4024,baseY:6*TILE,y:6*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
pipes.push({x:1050,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:3350,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
// ★ 上空パタパタ（2段JMP対策）
enemies.push({x:800,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:0.0,shellTimer:0,walkFrame:0,walkTimer:0});
enemies.push({x:4300,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:1.6,shellTimer:0,walkFrame:0,walkTimer:0});

// ピノキオ部屋ワープ天井パイプ（1ステージに1本）
pipes.push({x:3000,y:0,w:TILE*2,h:8*TILE,bounceOffset:0,isWarp:true,ceiling:true,variant:'pinocchio'});
}
