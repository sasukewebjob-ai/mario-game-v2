import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,W,flagPole} from '../globals.js';

export function buildExStage2(){
[platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,particles,scorePopups,blockAnims,movingPlats,springs,cannons,bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
hammers.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.autoScroll=0;
G.lowGravity=true; // 宇宙：低重力ON
if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

// スタート足場（x=0〜5TILE）
for(let x=0;x<6*TILE;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

// ── セクション1: x=220〜980 ──────────────────────────────────
[[220,H-4*TILE,3],[380,H-7*TILE,2],[520,H-5*TILE,3],[680,H-8*TILE,2],[820,H-4*TILE,3],[960,H-6*TILE,2]].forEach(([x,y,w])=>{
  for(let i=0;i<w;i++)platforms.push({x:x+i*TILE,y,w:TILE,h:TILE,type:'ground',bounceOffset:0});
});

// ── セクション2: x=1080〜1700 ────────────────────────────────
[[1080,H-5*TILE,3],[1220,H-8*TILE,2],[1360,H-4*TILE,3],[1500,H-7*TILE,2],[1600,H-5*TILE,4]].forEach(([x,y,w])=>{
  for(let i=0;i<w;i++)platforms.push({x:x+i*TILE,y,w:TILE,h:TILE,type:'ground',bounceOffset:0});
});

// チェックポイント（x=1720）
G.checkpoint={x:1720,y:H-5*TILE,reached:false};

// ── セクション3: x=1900〜2800 ────────────────────────────────
[[1900,H-6*TILE,3],[2060,H-4*TILE,3],[2220,H-8*TILE,2],[2380,H-5*TILE,3],[2540,H-7*TILE,2],[2700,H-4*TILE,3]].forEach(([x,y,w])=>{
  for(let i=0;i<w;i++)platforms.push({x:x+i*TILE,y,w:TILE,h:TILE,type:'ground',bounceOffset:0});
});

// ── セクション4: ゴール前 x=2900〜3180 ──────────────────────
[[2900,H-6*TILE,3],[3060,H-5*TILE,3],[3180,H-4*TILE,4]].forEach(([x,y,w])=>{
  for(let i=0;i<w;i++)platforms.push({x:x+i*TILE,y,w:TILE,h:TILE,type:'ground',bounceOffset:0});
});

// ゴール足場
for(let x=3300;x<=3530;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});
flagPole.x=3360;

// ── 移動足場（14個）─────────────────────────────────────────
movingPlats.push(
  {x:160, y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:160, range:55,spd:1.4},
  {x:300, y:H-6*TILE,w:TILE*2,h:12,type:'v',oy:H-6*TILE,range:65,spd:1.3},
  {x:460, y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:460, range:55,spd:1.6},
  {x:620, y:H-7*TILE,w:TILE*2,h:12,type:'v',oy:H-7*TILE,range:70,spd:1.5},
  {x:760, y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:760, range:60,spd:1.8},
  {x:1140,y:H-6*TILE,w:TILE*2,h:12,type:'v',oy:H-6*TILE,range:75,spd:1.4},
  {x:1440,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:1440,range:50,spd:1.7},
  {x:1740,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:1740,range:65,spd:1.9},
  {x:1980,y:H-6*TILE,w:TILE*2,h:12,type:'v',oy:H-6*TILE,range:80,spd:1.6},
  {x:2280,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:2280,range:55,spd:1.8},
  {x:2480,y:H-7*TILE,w:TILE*2,h:12,type:'v',oy:H-7*TILE,range:70,spd:1.7},
  {x:2760,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:2760,range:60,spd:1.5},
  {x:2980,y:H-6*TILE,w:TILE*2,h:12,type:'v',oy:H-6*TILE,range:75,spd:1.9},
  {x:3120,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3120,range:50,spd:2.0}
);

// ── テレサ（宇宙幽霊 × 10体）────────────────────────────────
[
  {x:350, y:H-6*TILE},{x:650, y:H-8*TILE},{x:900, y:H-5*TILE},
  {x:1150,y:H-7*TILE},{x:1380,y:H-6*TILE},{x:2060,y:H-9*TILE},
  {x:2130,y:H-7*TILE},{x:2300,y:H-6*TILE},{x:2600,y:H-8*TILE},
  {x:2900,y:H-5*TILE}
].forEach(({x,y})=>{
  enemies.push({x,y,w:TILE,h:TILE,vx:0,vy:0,alive:true,type:'teresa',hiding:false});
});

// ── コイン（421枚）───────────────────────────────────────────
// ① 上部横断2列 (65+65=130枚)
for(let i=0;i<65;i++)coinItems.push({x:60+i*46,y:H-12*TILE,collected:false});
for(let i=0;i<65;i++)coinItems.push({x:60+i*46,y:H-14*TILE,collected:false});
// ② 波状コイン2段 (55+55=110枚)
for(let i=0;i<55;i++)coinItems.push({x:200+i*54,y:H-7*TILE+Math.sin(i*0.55)*TILE*2,collected:false});
for(let i=0;i<55;i++)coinItems.push({x:200+i*54,y:H-10*TILE+Math.sin(i*0.45+1)*TILE*1.5,collected:false});
// ③ 星座円弧×5箇所 (18×5=90枚)
[300,800,1300,1900,2600].forEach(cx=>{
  for(let i=0;i<18;i++){const a=Math.PI*i/17;coinItems.push({x:cx-80+i*9,y:H-7*TILE-Math.sin(a)*TILE*2.5,collected:false});}
});
// ④ ゴール前ラッシュ (55枚)
for(let i=0;i<55;i++)coinItems.push({x:2900+i*7,y:H-6*TILE-Math.sin(i*0.4)*TILE*1.5,collected:false});
// ⑤ 縦コイン柱×6本 (6×6=36枚)
[[420,3],[720,4],[1020,3],[1520,5],[2100,4],[2700,3]].forEach(([px,row])=>{
  for(let i=0;i<6;i++)coinItems.push({x:px,y:H-(row+i)*TILE,collected:false});
});
// 合計: 130+110+90+55+36 = 421枚 ✓
}
