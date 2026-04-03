import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow} from '../builders.js';

export function buildLevel_5_1(){
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

  // 岩礁（水中のプラットフォーム）
  addRow(320,  H-4*TILE, 5, 'ground');   // x=320〜448
  addRow(900,  H-6*TILE, 4, 'ground');   // x=900〜1024
  addRow(1650, H-5*TILE, 5, 'ground');   // x=1650〜1778
  addRow(2600, H-4*TILE, 6, 'ground');   // x=2600〜2760
  addRow(3400, H-7*TILE, 4, 'ground');   // x=3400〜3524
  addRow(4050, H-5*TILE, 5, 'ground');   // x=4050〜4178
  addRow(4900, H-4*TILE, 5, 'ground');   // x=4900〜5028
  addRow(5700, H-6*TILE, 4, 'ground');   // x=5700〜5824
  addRow(6300, H-5*TILE, 5, 'ground');   // x=6300〜6428

  // 土管3本（下に↓押すと入れる）
  // 土管1: warp→water1 (コイン部屋)
  pipes.push({x:1800,y:H-TILE-4*TILE,w:TILE*2,h:4*TILE,bounceOffset:0,isWarp:true,variant:'water1'});
  // 土管2: warp→water2 (1UP部屋)
  pipes.push({x:4400,y:H-TILE-4*TILE,w:TILE*2,h:4*TILE,bounceOffset:0,isWarp:true,variant:'water2'});
  // 土管3: ★ゴールパイプ★
  pipes.push({x:6900,y:H-TILE-4*TILE,w:TILE*2,h:4*TILE,bounceOffset:0,isGoalPipe:true});

  // コイン（横ライン）
  for(let x=200;x<1750;x+=64)  coinItems.push({x,y:H-5*TILE,collected:false,pop:false});
  for(let x=2100;x<4300;x+=64) coinItems.push({x,y:H-7*TILE,collected:false,pop:false});
  for(let x=4700;x<6850;x+=64) coinItems.push({x,y:H-6*TILE,collected:false,pop:false});
  // 土管周りのコインアーチ
  [-2,-1,0,1,2].forEach(i=>coinItems.push({x:1816+i*32,y:H-9*TILE+Math.abs(i)*TILE,collected:false,pop:false}));
  [-2,-1,0,1,2].forEach(i=>coinItems.push({x:4416+i*32,y:H-9*TILE+Math.abs(i)*TILE,collected:false,pop:false}));
  [-2,-1,0,1,2].forEach(i=>coinItems.push({x:6916+i*32,y:H-9*TILE+Math.abs(i)*TILE,collected:false,pop:false}));

  // はてなブロック（特殊ブロックはpushのみ）
  platforms.push({x:600,  y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,bounceOffset:0});
  platforms.push({x:2300, y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3600, y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:5200, y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  // かくし1UP
  platforms.push({x:6100,y:H-12*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // キノコブロック追加
  platforms.push({x:1200,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2800,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4500,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6400,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});

  // チェックポイント（岩礁上）
  G.checkpoint={x:3500,y:H-TILE,reached:false};

  // ぷくぷく（横・右→左）速度を半分に
  [{x:350,y:H-3*TILE,vx:-1.25},{x:750,y:H-5*TILE,vx:-1.5},
   {x:1100,y:H-4*TILE,vx:-1.0},{x:2000,y:H-6*TILE,vx:-1.4},
   {x:2500,y:H-3*TILE,vx:-1.25},{x:3000,y:H-5*TILE,vx:-1.5},
   {x:3800,y:H-4*TILE,vx:-1.0},{x:4800,y:H-6*TILE,vx:-1.25},
   {x:5400,y:H-3*TILE,vx:-1.5},{x:6000,y:H-5*TILE,vx:-1.0},
   {x:6500,y:H-4*TILE,vx:-1.4}
  ].forEach(d=>enemies.push({x:d.x,y:d.y,w:24,h:20,vx:d.vx,type:'cheepH',alive:true,activated:true}));

  // クリボー（水底を歩く）
  [{x:500},{x:1200},{x:2100},{x:2900},{x:3600},{x:4300},{x:5100},{x:5900},{x:6600}
  ].forEach(d=>enemies.push({x:d.x,y:H-2*TILE,w:TILE,h:TILE,vx:-1,vy:0,alive:true,type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false}));

  // ぷくぷく（縦・上下移動）
  [{x:1400,baseY:H-5*TILE,range:55,phase:0},
   {x:2800,baseY:H-6*TILE,range:70,phase:1.5},
   {x:3700,baseY:H-5*TILE,range:60,phase:0.8},
   {x:4950,baseY:H-6*TILE,range:65,phase:2.1},
   {x:5800,baseY:H-5*TILE,range:55,phase:0.4},
  ].forEach(d=>enemies.push({x:d.x,y:d.baseY,baseY:d.baseY,range:d.range,phase:d.phase,w:24,h:20,type:'cheepV',alive:true,activated:true}));
// ★ ハンマースーツ・巨大キノコ
platforms.push({x:2500,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
platforms.push({x:4800,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
// ★ 装飾土管
pipes.push({x:3000,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false});
pipes.push({x:5500,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
}
