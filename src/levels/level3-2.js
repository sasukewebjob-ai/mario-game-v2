import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,
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

  // 地面 (ギャップ×5 — 最後は足場なしで難しい)
  const gaps=[{s:1600,e:1950},{s:3100,e:3450},{s:4700,e:5050},{s:5900,e:6200},{s:6800,e:7050}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Zone 1 (0-1600)
  addRow(300,H-5*TILE,3,'brick');           // x:300,332,364
  addRow(632,H-7*TILE,2,'q');               // x:632,664 (600はpush)
  addRow(950,H-5*TILE,4,'brick');           // x:950..1046
  addRow(1250,H-8*TILE,1,'q');              // x:1250 (1220はpush)
  addRow(1400,H-5*TILE,3,'brick');          // x:1400,1432,1464

  // Zone 2 (1950-3100)
  addRow(2050,H-5*TILE,4,'brick');          // x:2050..2146
  addRow(2350,H-7*TILE,3,'q');              // x:2350,2382,2414
  addRow(2700,H-5*TILE,3,'brick');          // x:2700,2732,2764
  addRow(2982,H-9*TILE,1,'q');              // x:2982 (2950はpush)

  // Zone 3 (3450-4700)
  addRow(3520,H-5*TILE,4,'brick');          // x:3520..3616
  addRow(3832,H-8*TILE,1,'q');              // x:3832 (3800はpush)
  addRow(4100,H-5*TILE,3,'brick');          // x:4100,4132,4164
  addRow(4450,H-7*TILE,2,'q');              // x:4450,4482 (4420はpush)

  // Zone 4 (5050-5900)
  addRow(5120,H-5*TILE,4,'brick');          // x:5120..5216
  addRow(5432,H-9*TILE,1,'q');              // x:5432 (5400はpush)
  addRow(5700,H-5*TILE,2,'brick');          // x:5700,5732

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
  platforms.push({x:3800,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4420,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5400,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6520,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});

  // パイプ (ワープ×2: forest1/forest2、通常×2 — 高さをバラバラにしてオリジナリティを演出)
  // ph=3の巨大ワープ管(x=800)、ph=2の通常管(x=2500)、ph=4の超高ワープ管(x=4200)、ph=2の通常管(x=6400)
  // ※旧x=6000はギャップ内に浮いていたため x=6400 に修正
  [[800,3,'forest1'],[2500,2,false],[4200,4,'forest2'],[6400,2,false]].forEach(([px,ph,warp])=>{
    pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
  pipes.forEach((p,i)=>{if(p.isWarp)return;
    piranhas.push({x:p.x+8,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*2})});

  // コイン
  for(let i=0;i<32;i++)coinItems.push({x:220+i*230,y:H-9*TILE,collected:false});

  // 地上敵 (goomba / koopa / cactus / hammerBro)
  [{x:380,t:'goomba'},{x:520,t:'cactus'},
   {x:800,t:'koopa'},{x:1000,t:'cactus'},{x:1150,t:'goomba'},{x:1380,t:'hammerBro'},
   {x:2100,t:'goomba'},{x:2250,t:'cactus'},{x:2500,t:'koopa'},
   {x:2800,t:'cactus'},{x:2960,t:'hammerBro'},
   {x:3580,t:'goomba'},{x:3750,t:'cactus'},{x:3950,t:'koopa'},
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

  // ワンワン (3体)
  [{x:1300},{x:4600},{x:6600}].forEach(({x})=>{
    chainChomps.push({x,y:H-TILE-36,w:36,h:36,postX:x,postY:H-TILE-36,
      vx:0,vy:0,phase:Math.random()*Math.PI*2,state:'idle',lungeTimer:0,alive:true});
  });

  // 移動足場 (ギャップ1〜4; ギャップ5は移動足場なし)
  movingPlats.push({x:1650,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:1650,range:90,spd:1.7});
  movingPlats.push({x:3150,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3150,range:90,spd:1.9});
  movingPlats.push({x:4750,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:4750,range:90,spd:2.0});
  movingPlats.push({x:5950,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5950,range:75,spd:2.2});

  G.checkpoint={x:3800,y:H-TILE,reached:false};
}
