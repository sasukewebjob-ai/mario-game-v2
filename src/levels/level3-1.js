import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

// 3-1: 海辺の砂浜 (Sandy Beach)
// テーマ: 明るい海辺、水ギャップ×4、サボテン登場、ラキチュウ2体
export function buildLevel_3_1(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // 地面 (水ギャップ×4 — 広め)
  const gaps=[{s:2000,e:2380},{s:3800,e:4150},{s:5300,e:5650},{s:6700,e:7000}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Zone 1 (0-2000)
  addRow(300,H-5*TILE,3,'brick');           // x:300,332,364
  addRow(650,H-7*TILE,2,'q');               // x:650,682 (620はpush)
  addRow(1050,H-5*TILE,4,'brick');          // x:1050..1146
  addRow(1400,H-8*TILE,1,'q');              // x:1400 (1370はpush)
  addRow(1700,H-5*TILE,3,'brick');          // x:1700,1732,1764

  // Zone 2 (2380-3800)
  addRow(2450,H-5*TILE,4,'brick');          // x:2450..2546
  addRow(2800,H-7*TILE,3,'q');              // x:2800,2832,2864
  addRow(3150,H-5*TILE,3,'brick');          // x:3150,3182,3214
  addRow(3500,H-8*TILE,1,'q');              // x:3500 (3470はpush)

  // Zone 3 (4150-5300)
  addRow(4220,H-5*TILE,4,'brick');          // x:4220..4316
  addRow(4650,H-7*TILE,2,'q');              // x:4650,4682 (4620はpush)
  addRow(4980,H-5*TILE,3,'brick');          // x:4980,5012,5044

  // Zone 4 (5650-6700)
  addRow(5720,H-5*TILE,4,'brick');          // x:5720..5816
  addRow(6050,H-8*TILE,1,'q');              // x:6050 (6020はpush)
  addRow(6400,H-5*TILE,3,'brick');          // x:6400,6432,6464

  // Zone 5 (7000-8000)
  addRow(7050,H-5*TILE,4,'brick');          // x:7050..7146
  addStair(7250,6);

  // 特殊ブロック (pushのみ、addRowと座標重複なし)
  platforms.push({x:250,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
  platforms.push({x:620,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1370,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3470,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:4620,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6020,y:H-8*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // パイプ (ワープ×2: river1/river2、通常×1)
  [[700,2,'river1'],[2600,2,'river2'],[4700,2,false]].forEach(([px,ph,warp])=>{
    pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
  pipes.forEach((p,i)=>{if(p.isWarp)return;
    piranhas.push({x:p.x+8,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});

  // コイン
  for(let i=0;i<28;i++)coinItems.push({x:280+i*260,y:H-9*TILE,collected:false});

  // 地上敵 (goomba / koopa / cactus)
  [{x:400,t:'goomba'},{x:560,t:'cactus'},
   {x:900,t:'koopa'},{x:1100,t:'goomba'},{x:1260,t:'cactus'},{x:1560,t:'koopa'},
   {x:2500,t:'goomba'},{x:2660,t:'cactus'},{x:2900,t:'koopa'},
   {x:3200,t:'goomba'},{x:3420,t:'cactus'},
   {x:4300,t:'goomba'},{x:4480,t:'cactus'},{x:4780,t:'koopa'},
   {x:5060,t:'goomba'},
   {x:5760,t:'cactus'},{x:5920,t:'koopa'},{x:6060,t:'goomba'},
   {x:6460,t:'cactus'},{x:6600,t:'goomba'},
   {x:7060,t:'goomba'},{x:7160,t:'koopa'},{x:7310,t:'cactus'}
  ].forEach(({x,t})=>{
    let e;
    if(t==='goomba')e={x,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,type:'goomba',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0};
    else if(t==='koopa')e={x,y:H-2*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0};
    else if(t==='cactus')e={x,y:H-5*TILE,w:TILE,h:TILE*4,vx:-0.8,vy:0,alive:true,type:'cactus',state:'walk',walkFrame:0,walkTimer:0};
    if(e)enemies.push(e);
  });

  // ラキチュウ (2体)
  [{x:3200,bY:H-9*TILE},{x:6000,bY:H-8*TILE}].forEach(({x,bY})=>{
    enemies.push({x,y:bY,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,
      type:'lakitu',state:'fly',baseY:bY,phase:Math.random()*Math.PI*2,dropTimer:150});
  });

  // 移動足場 (水ギャップ全4か所)
  movingPlats.push({x:2050,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:2050,range:95,spd:1.6});
  movingPlats.push({x:3850,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3850,range:90,spd:1.8});
  movingPlats.push({x:5350,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5350,range:90,spd:2.0});
  movingPlats.push({x:6750,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:6750,range:75,spd:2.2});

  G.checkpoint={x:4200,y:H-TILE,reached:false};

  // ★ 重力反転ゾーン（海辺の不思議空間）※ワープ土管(x=700,2600)を避ける
  gravityZones.push({x:1200,y:0,w:350,h:H});  // Z1後半（土管なし）
  gravityZones.push({x:5000,y:0,w:300,h:H});   // Z3後半（土管x=4700から十分離れる）
  // ★ ハンマースーツ・巨大キノコ
  platforms.push({x:5200,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  platforms.push({x:1500,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:3500,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:5800,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
}
