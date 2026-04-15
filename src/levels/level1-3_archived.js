import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,W,flagPole} from '../globals.js';

export function buildExStage(){
[platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,particles,scorePopups,blockAnims,movingPlats,springs,cannons,bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
hammers.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.autoScroll=0;
if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

// EXステージ: スタートとゴール以外すべて落とし穴
// スタート足場 (x=0 ~ 5*TILE)
for(let x=0;x<5*TILE;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

// ゴール足場 (x=2240 ~ 2432)
for(let x=2240;x<=2432;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

// ゴールポール
flagPole.x=2350;

// 空中移動足場 12個（水平6・垂直6）
movingPlats.push(
  {x:380,y:H-5*TILE,w:TILE*3,h:12,type:'h',ox:380,range:65,spd:1.8},
  {x:570,y:H-7*TILE,w:TILE*3,h:12,type:'v',oy:H-7*TILE,range:80,spd:1.5},
  {x:740,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:740,range:70,spd:2.0},
  {x:930,y:H-8*TILE,w:TILE*3,h:12,type:'v',oy:H-8*TILE,range:90,spd:1.7},
  {x:1100,y:H-5*TILE,w:TILE*3,h:12,type:'h',ox:1100,range:80,spd:2.2},
  {x:1270,y:H-3*TILE,w:TILE*3,h:12,type:'h',ox:1270,range:55,spd:1.6},
  {x:1440,y:H-7*TILE,w:TILE*3,h:12,type:'v',oy:H-7*TILE,range:75,spd:1.9},
  {x:1600,y:H-5*TILE,w:TILE*3,h:12,type:'h',ox:1600,range:65,spd:2.0},
  {x:1770,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:1770,range:80,spd:1.8},
  {x:1930,y:H-8*TILE,w:TILE*3,h:12,type:'v',oy:H-8*TILE,range:100,spd:1.6},
  {x:2060,y:H-5*TILE,w:TILE*3,h:12,type:'h',ox:2060,range:60,spd:2.1},
  {x:2170,y:H-3*TILE,w:TILE*3,h:12,type:'v',oy:H-3*TILE,range:50,spd:1.5}
);

// パタパタ 15体（右から左に飛んでくる）
[
  {x:460,y:H-6*TILE,phase:0.0},{x:640,y:H-9*TILE,phase:0.8},
  {x:810,y:H-5*TILE,phase:1.5},{x:980,y:H-8*TILE,phase:0.3},
  {x:1150,y:H-6*TILE,phase:2.1},{x:1300,y:H-10*TILE,phase:1.0},
  {x:1470,y:H-5*TILE,phase:0.5},{x:1630,y:H-7*TILE,phase:1.8},
  {x:1790,y:H-9*TILE,phase:0.2},{x:1960,y:H-6*TILE,phase:2.5},
  {x:2080,y:H-8*TILE,phase:0.9},{x:2200,y:H-5*TILE,phase:1.4},
  {x:700,y:H-11*TILE,phase:3.0},{x:1520,y:H-10*TILE,phase:2.2},
  {x:2150,y:H-11*TILE,phase:0.7}
].forEach(({x,y,phase})=>{
  enemies.push({x,y,w:TILE,h:TILE*1.2,vx:-1.8,vy:0,alive:true,type:'parakoopa',
    state:'walk',flying:true,baseY:y,phase,shellTimer:0,walkFrame:0,walkTimer:0});
});

// コイン 300枚以上
// ① ステージ上部を横断するコイン列 (60枚)
for(let i=0;i<60;i++)coinItems.push({x:80+i*36,y:H-11*TILE,collected:false});
// ② 波状コイン列（低め）(50枚)
for(let i=0;i<50;i++)coinItems.push({x:350+i*40,y:H-6*TILE+Math.sin(i*0.8)*TILE,collected:false});
// ③ 中央密集コイン (80枚)
for(let i=0;i<80;i++)coinItems.push({x:820+i*18,y:H-8*TILE+Math.sin(i*0.5)*TILE*2,collected:false});
// ④ アーチ型コイン 3箇所 (45枚)
[500,1200,1900].forEach(cx=>{
  for(let i=0;i<15;i++){
    const a=Math.PI*i/14;
    coinItems.push({x:cx-70+i*10,y:H-6*TILE-Math.sin(a)*80,collected:false});
  }
});
// ⑤ ゴール前コイン (30枚)
for(let i=0;i<30;i++)coinItems.push({x:1920+i*12,y:H-6*TILE,collected:false});
// ⑥ 縦コイン柱 各足場間に誘導 (20枚)
for(let i=0;i<5;i++)coinItems.push({x:660,y:H-(3+i)*TILE,collected:false});
for(let i=0;i<5;i++)coinItems.push({x:1560,y:H-(3+i)*TILE,collected:false});
for(let i=0;i<5;i++)coinItems.push({x:2040,y:H-(3+i)*TILE,collected:false});
for(let i=0;i<5;i++)coinItems.push({x:1340,y:H-(3+i)*TILE,collected:false});
// ⑦ 補完スキャッター (36枚)
for(let i=0;i<36;i++)coinItems.push({x:110+i*60,y:H-4*TILE,collected:false});
// 合計: 60+50+80+45+30+20+36 = 321枚 ✓
}
