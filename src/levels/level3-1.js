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
  G.iceMode=false;G.tideMode=true;

  // 地面 (水ギャップ×4 + micro-gap — gap4 widened)
  const gaps=[{s:1400,e:1480},{s:2000,e:2380},{s:3800,e:4150},{s:5300,e:5650},{s:6700,e:7100}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Zone 1 (0-2000) — wave-like height profile
  addRow(300,H-5*TILE,3,'brick');           // x:300,332,364
  addRow(500,H-4*TILE,2,'brick');           // low wave crest
  addRow(650,H-7*TILE,2,'q');               // x:650,682 (620はpush)
  addRow(850,H-6*TILE,2,'brick');           // mid wave
  addRow(1050,H-5*TILE,4,'brick');          // x:1050..1146
  addRow(1250,H-8*TILE,2,'brick');          // high wave peak
  addRow(1550,H-4*TILE,2,'brick');          // low wave (after micro-gap)
  addRow(1700,H-5*TILE,3,'brick');          // x:1700,1732,1764

  // Zone 2 (2380-3800) — wave-like height profile
  addRow(2450,H-5*TILE,4,'brick');          // x:2450..2546
  addRow(2650,H-4*TILE,2,'brick');          // low wave crest
  addRow(2800,H-7*TILE,3,'q');              // x:2800,2832,2864
  addRow(3000,H-6*TILE,2,'brick');          // mid wave
  addRow(3150,H-5*TILE,3,'brick');          // x:3150,3182,3214
  addRow(3350,H-8*TILE,2,'brick');          // high wave peak
  addRow(3500,H-8*TILE,1,'q');              // x:3500 (3470はpush)

  // Zone 3 (4150-5300) — wave-like height profile
  addRow(4220,H-5*TILE,4,'brick');          // x:4220..4316
  addRow(4420,H-4*TILE,2,'brick');          // low wave crest
  addRow(4650,H-7*TILE,2,'q');              // x:4650,4682 (4620はpush)
  addRow(4800,H-6*TILE,2,'brick');          // mid wave
  addRow(4980,H-5*TILE,3,'brick');          // x:4980,5012,5044
  addRow(5150,H-8*TILE,2,'brick');          // high wave peak

  // Zone 4 (5650-6700) — wave-like height profile
  addRow(5720,H-5*TILE,4,'brick');          // x:5720..5816
  addRow(5900,H-4*TILE,2,'brick');          // low wave crest
  addRow(6050,H-8*TILE,1,'q');              // x:6050 (6020はpush)
  addRow(6200,H-6*TILE,2,'brick');          // mid wave
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
  // チェックポイント(x=4200)周辺 — gap終端(x=4150)直後にきのこ×2、スター×1
  // x=4155: gap end直後の地面上、addRow(4220,H-5T)とは別y
  // x=4350: addRow(4220,H-5T)終端x=4316より右、addRow(4420,H-4T)のx=4420,4452とは別
  // x=4250,H-8T: addRow(4220,H-5T)と異なるy、パイプ(x=4700)からも十分離れる
  platforms.push({x:4155,y:H-4*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4350,y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4250,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});

  // パイプ (ワープ×2: river1/river2、通常×1)
  [[700,2,'river1'],[2600,2,'river2'],[4700,2,false],[5300,3,'yoshi3']].forEach(([px,ph,warp])=>{
    pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
  pipes.forEach((p,i)=>{if(p.isWarp)return;
    piranhas.push({x:p.x+24,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});

  // コイン — >=300枚: gap arches + ground lines + wave clusters + tide-risk
  // Gap arches (10-12 coins each, 5 gaps)
  [{s:1400,e:1480},{s:2000,e:2380},{s:3800,e:4150},{s:5300,e:5650},{s:6700,e:7100}].forEach(g=>{
    const n=11;for(let j=0;j<n;j++){const t=j/(n-1);
      coinItems.push({x:g.s+t*(g.e-g.s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});}
  }); // 55 coins
  // Ground-level coin lines (H-3*TILE, dense)
  for(let j=0;j<20;j++) coinItems.push({x:300+j*32,y:H-3*TILE,collected:false});   // Z1: 20
  for(let j=0;j<22;j++) coinItems.push({x:2450+j*32,y:H-3*TILE,collected:false});  // Z2: 22
  for(let j=0;j<20;j++) coinItems.push({x:4220+j*32,y:H-3*TILE,collected:false});  // Z3: 20
  for(let j=0;j<18;j++) coinItems.push({x:5720+j*32,y:H-3*TILE,collected:false});  // Z4: 18
  for(let j=0;j<15;j++) coinItems.push({x:7050+j*32,y:H-3*TILE,collected:false});  // Z5: 15
  // High scattered coins
  for(let j=0;j<25;j++) coinItems.push({x:200+j*280,y:H-9*TILE,collected:false});  // 25
  // Mid-height wave clusters (on wave blocks)
  for(let j=0;j<20;j++) coinItems.push({x:350+j*340,y:H-5*TILE,collected:false});  // 20
  // Wave-height coins (H-6*TILE, H-8*TILE)
  for(let j=0;j<15;j++) coinItems.push({x:400+j*450,y:H-6*TILE,collected:false});  // 15
  for(let j=0;j<10;j++) coinItems.push({x:500+j*650,y:H-8*TILE,collected:false});  // 10
  // Tide-risk coins (low, submerged during high tide — high reward)
  for(let i=0;i<5;i++)coinItems.push({x:1700+i*35,y:H-2*TILE,collected:false});
  for(let i=0;i<5;i++)coinItems.push({x:3200+i*35,y:H-2*TILE,collected:false});
  for(let i=0;i<5;i++)coinItems.push({x:5000+i*35,y:H-2*TILE,collected:false});
  for(let i=0;i<5;i++)coinItems.push({x:6450+i*35,y:H-2*TILE,collected:false});
  // Total: 55+95+25+20+15+10+20 = ~310+

  // 地上敵 (goomba / koopa / cactus)
  [{x:400,t:'goomba'},{x:560,t:'cactus'},
   {x:900,t:'koopa'},{x:1100,t:'goomba'},{x:1260,t:'cactus'},{x:1560,t:'koopa'},
   {x:2500,t:'goomba'},{x:2660,t:'cactus'},{x:2900,t:'koopa'},
   {x:3200,t:'goomba'},{x:3420,t:'cactus'},
   {x:4520,t:'goomba'},{x:4620,t:'cactus'},{x:4780,t:'koopa'},
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
  movingPlats.push({x:6750,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:6750,range:130,spd:2.2});

  G.checkpoint={x:4200,y:H-TILE,reached:false};

  // ★ 重力反転ゾーン（海辺の不思議空間）※ワープ土管(x=700,2600)を避ける
  gravityZones.push({x:1200,y:0,w:350,h:H});  // Z1後半（土管なし）
  gravityZones.push({x:5000,y:0,w:300,h:H});   // Z3後半（土管x=4700から十分離れる）
  // ★ ハンマースーツ・巨大キノコ
  platforms.push({x:5200,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  platforms.push({x:1500,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:3500,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:5800,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:1800,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:4200,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
piranhas.push({x:5824,baseY:6*TILE,y:6*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
pipes.push({x:1050,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:2700,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
// ★ 上空パタパタ（2段JMP対策）
enemies.push({x:800,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:0.0,shellTimer:0,walkFrame:0,walkTimer:0});
enemies.push({x:4300,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:1.6,shellTimer:0,walkFrame:0,walkTimer:0});
}
