import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

// 3-2: 磯浜の断崖 (Rocky Cliff Beach)
// テーマ: 海辺、落とし穴×5、サボテン多め、ラキチュウ3体、ワンワン3体
export function buildLevel_3_2(){
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

  // 地面 (ギャップ×5 — gap1 micro, gap3 widened)
  const gaps=[{s:1600,e:1680},{s:3100,e:3450},{s:4700,e:5150},{s:5900,e:6200},{s:6800,e:7050}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Zone 1 (0-1600) — wave-like height profile
  addRow(300,H-5*TILE,3,'brick');           // x:300,332,364
  addRow(500,H-4*TILE,2,'brick');           // low wave crest
  addRow(632,H-7*TILE,2,'q');               // x:632,664 (600はpush)
  addRow(800,H-6*TILE,2,'brick');           // mid wave
  addRow(950,H-5*TILE,4,'brick');           // x:950..1046
  addRow(1100,H-8*TILE,2,'brick');          // high wave peak
  addRow(1250,H-8*TILE,1,'q');              // x:1250 (1220はpush)
  addRow(1400,H-5*TILE,3,'brick');          // x:1400,1432,1464

  // Zone 2 (1680-3100) — gap1 now micro, more room
  addRow(1750,H-4*TILE,2,'brick');          // low wave crest after micro-gap
  addRow(2050,H-5*TILE,4,'brick');          // x:2050..2146
  addRow(2250,H-6*TILE,2,'brick');          // mid wave
  addRow(2350,H-7*TILE,3,'q');              // x:2350,2382,2414
  addRow(2550,H-8*TILE,2,'brick');          // high wave peak
  addRow(2700,H-5*TILE,3,'brick');          // x:2700,2732,2764
  addRow(2982,H-9*TILE,1,'q');              // x:2982 (2950はpush)

  // Zone 3 (3450-4700) — wave-like height profile
  addRow(3520,H-5*TILE,4,'brick');          // x:3520..3616
  addRow(3700,H-4*TILE,2,'brick');          // low wave crest
  addRow(3832,H-8*TILE,1,'q');              // x:3832 (3800はpush)
  addRow(3950,H-6*TILE,2,'brick');          // mid wave
  addRow(4100,H-5*TILE,3,'brick');          // x:4100,4132,4164
  addRow(4300,H-8*TILE,2,'brick');          // high wave peak
  addRow(4450,H-7*TILE,2,'q');              // x:4450,4482 (4420はpush)

  // Zone 4 (5150-5900) — gap3 widened, zone shifted
  addRow(5220,H-5*TILE,4,'brick');          // x:5220..5316
  addRow(5420,H-4*TILE,2,'brick');          // low wave crest
  addRow(5532,H-9*TILE,1,'q');              // x:5532 (5500はpush)
  addRow(5650,H-6*TILE,2,'brick');          // mid wave
  addRow(5800,H-5*TILE,2,'brick');          // x:5800,5832

  // Zone 5 (6200-6800)
  addRow(6280,H-5*TILE,3,'brick');          // x:6280,6312,6344
  addRow(6550,H-7*TILE,2,'q');              // x:6550,6582 (6520はpush)

  // Zone 6 (7050-8000)
  addRow(7100,H-5*TILE,4,'brick');          // x:7100..7196
  addStair(7280,6);

  // 特殊ブロック (pushのみ)
  platforms.push({x:260,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
  platforms.push({x:600,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1220,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2950,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:4420,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5500,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6520,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});

  // パイプ (ワープ×2: forest1/forest2、通常×2 — 高さをバラバラにしてオリジナリティを演出)
  // ph=3の巨大ワープ管(x=800)、ph=2の通常管(x=2500)、ph=4の超高ワープ管(x=4200)、ph=2の通常管(x=6400)
  // ※旧x=6000はギャップ内に浮いていたため x=6400 に修正
  [[800,3,'forest1'],[2500,2,false],[3500,3,'fallForest1'],[4200,4,'forest2'],[6400,2,false]].forEach(([px,ph,warp])=>{
    pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
  pipes.forEach((p,i)=>{if(p.isWarp)return;
    piranhas.push({x:p.x+24,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*2})});

  // コイン — >=300枚: gap arches + ground lines + wave clusters + tide-risk
  // Gap arches (10-12 coins each, 5 gaps — gap1 is micro so smaller arch)
  [{s:1600,e:1680},{s:3100,e:3450},{s:4700,e:5150},{s:5900,e:6200},{s:6800,e:7050}].forEach(g=>{
    const n=(g.e-g.s<100)?5:11;for(let j=0;j<n;j++){const t=j/(n-1);
      coinItems.push({x:g.s+t*(g.e-g.s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});}
  }); // ~49 coins
  // Ground-level coin lines (H-3*TILE, dense)
  for(let j=0;j<18;j++) coinItems.push({x:300+j*32,y:H-3*TILE,collected:false});   // Z1: 18
  for(let j=0;j<18;j++) coinItems.push({x:1750+j*32,y:H-3*TILE,collected:false});  // Z2a: 18
  for(let j=0;j<18;j++) coinItems.push({x:2700+j*32,y:H-3*TILE,collected:false});  // Z2b: 18
  for(let j=0;j<18;j++) coinItems.push({x:3520+j*32,y:H-3*TILE,collected:false});  // Z3: 18
  for(let j=0;j<14;j++) coinItems.push({x:5220+j*32,y:H-3*TILE,collected:false});  // Z4: 14
  for(let j=0;j<10;j++) coinItems.push({x:6280+j*32,y:H-3*TILE,collected:false});  // Z5: 10
  for(let j=0;j<14;j++) coinItems.push({x:7100+j*32,y:H-3*TILE,collected:false});  // Z6: 14
  // High scattered coins
  for(let j=0;j<25;j++) coinItems.push({x:200+j*280,y:H-9*TILE,collected:false});  // 25
  // Mid-height wave clusters
  for(let j=0;j<20;j++) coinItems.push({x:300+j*340,y:H-5*TILE,collected:false});  // 20
  // Wave-height coins
  for(let j=0;j<15;j++) coinItems.push({x:400+j*450,y:H-6*TILE,collected:false});  // 15
  for(let j=0;j<10;j++) coinItems.push({x:500+j*650,y:H-8*TILE,collected:false});  // 10
  // Tide-risk coins (low, submerged during high tide — high reward)
  for(let i=0;i<5;i++)coinItems.push({x:1450+i*35,y:H-2*TILE,collected:false});
  for(let i=0;i<5;i++)coinItems.push({x:2750+i*35,y:H-2*TILE,collected:false});
  for(let i=0;i<5;i++)coinItems.push({x:4150+i*35,y:H-2*TILE,collected:false});
  for(let i=0;i<5;i++)coinItems.push({x:5700+i*35,y:H-2*TILE,collected:false});
  // Total: 49+110+25+20+15+10+20 = ~319+

  // 地上敵 (goomba / koopa / cactus / hammerBro)
  [{x:380,t:'goomba'},{x:520,t:'cactus'},
   {x:800,t:'koopa'},{x:1000,t:'cactus'},{x:1150,t:'goomba'},{x:1380,t:'hammerBro'},
   {x:2100,t:'goomba'},{x:2250,t:'cactus'},{x:2500,t:'koopa'},
   {x:2800,t:'cactus'},{x:2960,t:'hammerBro'},
   {x:3480,t:'goomba'},{x:3380,t:'cactus'},{x:4120,t:'koopa'},
   {x:4200,t:'cactus'},{x:4380,t:'hammerBro'},{x:4580,t:'goomba'},
   {x:5180,t:'cactus'},{x:5350,t:'koopa'},{x:5600,t:'goomba'},
   {x:5760,t:'cactus'},
   {x:6340,t:'goomba'},{x:6480,t:'cactus'},{x:6680,t:'koopa'},
   {x:7150,t:'goomba'},{x:7300,t:'cactus'},{x:7420,t:'koopa'}
  ].forEach(({x,t})=>{
    let e;
    if(t==='goomba')e={x,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,type:'goomba',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0};
    else if(t==='koopa')e={x,y:H-2*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0};
    else if(t==='cactus')e={x,y:H-5*TILE,w:TILE,h:TILE*4,vx:-0.8,vy:0,alive:true,type:'cactus',state:'walk',walkFrame:0,walkTimer:0};
    else if(t==='hammerBro')e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5+Math.random(),vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false};
    if(e)enemies.push(e);
  });

  // パラクーパ (x>=2000)
  [2050,2150,3200,3300,3380,4800,4900,5000,5960,6050,6860,6940,7350].forEach(x=>{
    const by=H-(4+Math.floor(Math.random()*4))*TILE;
    enemies.push({x,y:by,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,
      type:'parakoopa',state:'walk',flying:true,baseY:by,
      phase:Math.random()*Math.PI*2,shellTimer:0,walkFrame:0,walkTimer:0});
  });

  // ラキチュウ (3体)
  [{x:2500,bY:H-9*TILE},{x:4500,bY:H-8*TILE},{x:6700,bY:H-9*TILE}].forEach(({x,bY})=>{
    enemies.push({x,y:bY,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,
      type:'lakitu',state:'fly',baseY:bY,phase:Math.random()*Math.PI*2,dropTimer:130});
  });

  // 飛び跳ねるブロック
  [{x:450},{x:1100},{x:2200},{x:3600},{x:4350},{x:5250},{x:6350},{x:7150}].forEach(({x})=>{
    jumpBlocks.push({x,y:H-2*TILE,w:28,h:28,vx:-1.5,vy:0,onGround:true,
      jumpTimer:60+Math.floor(Math.random()*40),alive:true});
  });

  // パイポ
  [{x:1400},{x:2300},{x:3550},{x:4500},{x:5200},{x:6050},{x:6900},{x:7300}].forEach(({x})=>{
    pipos.push({x,y:H-2*TILE-22,w:22,h:22,vx:-1.8,vy:-6,alive:true,bounceCount:0});
  });

  // ワンワン (2体) ※冒頭のx=1300は撤去
  [{x:4600},{x:6600}].forEach(({x})=>{
    chainChomps.push({x,y:H-TILE-36,w:36,h:36,postX:x,postY:H-TILE-36,
      vx:0,vy:0,phase:Math.random()*Math.PI*2,state:'idle',lungeTimer:0,alive:true});
  });

  // 移動足場 (ギャップ1〜4; ギャップ5は移動足場なし)
  // gap1 is now micro (80px) — no moving plat needed, jumpable
  movingPlats.push({x:3150,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3150,range:90,spd:1.9});
  movingPlats.push({x:4750,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:4750,range:150,spd:2.0});  // wider range for widened gap3
  movingPlats.push({x:5950,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5950,range:75,spd:2.2});

  G.checkpoint={x:3800,y:H-TILE,reached:false};
  // ★ ハンマースーツ・巨大キノコ
  platforms.push({x:4500,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  platforms.push({x:1850,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:2300,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:5500,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:1800,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:3800,y:0,w:TILE*2,h:7*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  piranhas.push({x:5524,baseY:6*TILE,y:6*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
  pipes.push({x:1050,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:2700,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  // ★ 上空パタパタ（2段JMP対策）
  enemies.push({x:800,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:0.0,shellTimer:0,walkFrame:0,walkTimer:0});
  enemies.push({x:4300,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:1.6,shellTimer:0,walkFrame:0,walkTimer:0});

// ★ 新敵（CP後・ブル）
enemies.push({x:4050,y:H-2*TILE,w:TILE,h:TILE,vx:-1.3,vy:0,alive:true,type:'rex',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});
// ★ トゲゾー（CP後）
enemies.push({x:4600,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,type:'spiny',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});

// ピノキオ部屋ワープ天井パイプ（1ステージに1本）
pipes.push({x:2200,y:0,w:TILE*2,h:8*TILE,bounceOffset:0,isWarp:true,ceiling:true,variant:'pinocchio'});
}
