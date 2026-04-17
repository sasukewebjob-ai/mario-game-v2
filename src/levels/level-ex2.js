import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,W,flagPole} from '../globals.js';

export function buildExStage2(){
[platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,particles,scorePopups,blockAnims,movingPlats,springs,cannons,bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
hammers.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;gravityZones.length=0;
G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.autoScroll=0;
G.lowGravity=true; // 宇宙：低重力ON
if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

// スタート足場（固定）
for(let x=0;x<6*TILE;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

// ゴール足場（固定）
for(let x=3280;x<=3520;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});
flagPole.x=3340;

// ── 移動足場（左右・下段 16個）y=H-4T〜H-6T ───────────────────
movingPlats.push(
  {x:150, y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:150, range:65,spd:1.5},
  {x:330, y:H-6*TILE,w:TILE*2,h:12,type:'h',ox:330, range:70,spd:1.7},
  {x:510, y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:510, range:60,spd:1.6},
  {x:690, y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:690, range:75,spd:1.8},
  {x:870, y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:870, range:65,spd:1.5},
  {x:1050,y:H-6*TILE,w:TILE*2,h:12,type:'h',ox:1050,range:70,spd:1.9},
  {x:1230,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:1230,range:60,spd:1.6},
  {x:1410,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:1410,range:75,spd:1.7},
  {x:1590,y:H-6*TILE,w:TILE*2,h:12,type:'h',ox:1590,range:65,spd:1.8},
  {x:1770,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:1770,range:70,spd:1.5},
  {x:1950,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:1950,range:60,spd:1.9},
  {x:2130,y:H-6*TILE,w:TILE*2,h:12,type:'h',ox:2130,range:75,spd:1.6},
  {x:2310,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:2310,range:65,spd:1.7},
  {x:2490,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:2490,range:70,spd:1.8},
  {x:2670,y:H-6*TILE,w:TILE*2,h:12,type:'h',ox:2670,range:60,spd:1.5},
  {x:2850,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:2850,range:75,spd:1.9},
  // ── 移動足場（左右・上段 12個）y=H-9T〜H-11T ──────────────────
  {x:240, y:H-9*TILE, w:TILE*2,h:12,type:'h',ox:240, range:60,spd:1.4},
  {x:440, y:H-11*TILE,w:TILE*2,h:12,type:'h',ox:440, range:55,spd:1.6},
  {x:640, y:H-9*TILE, w:TILE*2,h:12,type:'h',ox:640, range:70,spd:1.5},
  {x:840, y:H-11*TILE,w:TILE*2,h:12,type:'h',ox:840, range:60,spd:1.7},
  {x:1040,y:H-9*TILE, w:TILE*2,h:12,type:'h',ox:1040,range:55,spd:1.4},
  {x:1240,y:H-11*TILE,w:TILE*2,h:12,type:'h',ox:1240,range:65,spd:1.6},
  {x:1440,y:H-9*TILE, w:TILE*2,h:12,type:'h',ox:1440,range:70,spd:1.5},
  {x:1640,y:H-11*TILE,w:TILE*2,h:12,type:'h',ox:1640,range:60,spd:1.7},
  {x:1840,y:H-9*TILE, w:TILE*2,h:12,type:'h',ox:1840,range:55,spd:1.4},
  {x:2040,y:H-11*TILE,w:TILE*2,h:12,type:'h',ox:2040,range:65,spd:1.6},
  {x:2560,y:H-9*TILE, w:TILE*2,h:12,type:'h',ox:2560,range:70,spd:1.5},
  {x:2780,y:H-11*TILE,w:TILE*2,h:12,type:'h',ox:2780,range:60,spd:1.7},
  // ── 移動足場（上下 8個）──────────────────────────────────────
  {x:390, y:H-7*TILE,w:TILE*2,h:12,type:'v',oy:H-7*TILE, range:85,spd:1.3},
  {x:730, y:H-8*TILE,w:TILE*2,h:12,type:'v',oy:H-8*TILE, range:90,spd:1.5},
  {x:1060,y:H-7*TILE,w:TILE*2,h:12,type:'v',oy:H-7*TILE, range:80,spd:1.4},
  {x:1380,y:H-8*TILE,w:TILE*2,h:12,type:'v',oy:H-8*TILE, range:85,spd:1.6},
  {x:1700,y:H-7*TILE,w:TILE*2,h:12,type:'v',oy:H-7*TILE, range:90,spd:1.3},
  {x:2000,y:H-8*TILE,w:TILE*2,h:12,type:'v',oy:H-8*TILE, range:80,spd:1.5},
  {x:2600,y:H-7*TILE,w:TILE*2,h:12,type:'v',oy:H-7*TILE, range:85,spd:1.4},
  {x:2980,y:H-8*TILE,w:TILE*2,h:12,type:'v',oy:H-8*TILE, range:90,spd:1.6},
  // ★ 最下段コイン（縦コイン柱底部 H-3*TILE）の下に長い動く足場を追加
  {x:250, y:H-3*TILE,w:TILE*5,h:12,type:'h',ox:250, range:120,spd:1.3},
  {x:800, y:H-3*TILE,w:TILE*5,h:12,type:'h',ox:800, range:120,spd:1.4},
  {x:1400,y:H-3*TILE,w:TILE*5,h:12,type:'h',ox:1400,range:130,spd:1.3},
  {x:2000,y:H-3*TILE,w:TILE*5,h:12,type:'h',ox:2000,range:130,spd:1.5},
  {x:2550,y:H-3*TILE,w:TILE*5,h:12,type:'h',ox:2550,range:120,spd:1.3}
);

// ── 重力反転エリア（4つ・幅80px・縦断）────────────────────────
// マリオが通過すると一時的に重力が反転する
[780, 1520, 2240, 2980].forEach(gx=>{
  gravityZones.push({x:gx, y:0, w:80, h:H});
});

// ── テレサ（宇宙幽霊 × 10体）────────────────────────────────
// スポーン地点x=0〜350に配置しない、重力反転ゾーン±100pxも避ける
[
  {x:420, y:H-6*TILE},{x:630, y:H-9*TILE},{x:920, y:H-5*TILE},
  {x:1180,y:H-8*TILE},{x:1380,y:H-6*TILE},{x:1680,y:H-10*TILE},
  {x:1900,y:H-7*TILE},{x:2100,y:H-5*TILE},{x:2500,y:H-9*TILE},
  {x:2850,y:H-6*TILE}
].forEach(({x,y})=>{
  enemies.push({x,y,w:TILE,h:TILE,vx:0,vy:0,alive:true,type:'teresa',hiding:false});
});

// ── コイン（約420枚）─────────────────────────────────────────
// ① 上部横断2列（65+65=130枚）
for(let i=0;i<65;i++)coinItems.push({x:60+i*46,y:H-12*TILE,collected:false});
for(let i=0;i<65;i++)coinItems.push({x:60+i*46,y:H-14*TILE,collected:false});
// ② 波状コイン中段2段（55+55=110枚）
for(let i=0;i<55;i++)coinItems.push({x:200+i*54,y:H-7*TILE+Math.sin(i*0.55)*TILE*2,collected:false});
for(let i=0;i<55;i++)coinItems.push({x:200+i*54,y:H-10*TILE+Math.sin(i*0.45+1)*TILE*1.5,collected:false});
// ③ 星座円弧×5箇所（18×5=90枚）
[300,800,1300,1900,2600].forEach(cx=>{
  for(let i=0;i<18;i++){const a=Math.PI*i/17;coinItems.push({x:cx-80+i*9,y:H-7*TILE-Math.sin(a)*TILE*2.5,collected:false});}
});
// ④ ゴール前ラッシュ（55枚）
for(let i=0;i<55;i++)coinItems.push({x:2900+i*7,y:H-6*TILE-Math.sin(i*0.4)*TILE*1.5,collected:false});
// ⑤ 縦コイン柱×6本（6×6=36枚）
[[420,3],[720,4],[1200,3],[1700,5],[2050,4],[2700,3]].forEach(([px,row])=>{
  for(let i=0;i<6;i++)coinItems.push({x:px,y:H-(row+i)*TILE,collected:false});
});
// 合計: 130+110+90+55+36 = 421枚 ✓
}
