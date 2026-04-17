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
  {x:2170,y:H-3*TILE,w:TILE*3,h:12,type:'v',oy:H-3*TILE,range:50,spd:1.5},
  // ★ 最下段コイン列（H-3*TILE）の下に長い動く足場を追加（位置をH-2*TILEに調整）
  {x:250, y:H-2*TILE,w:TILE*5,h:12,type:'h',ox:250, range:110,spd:1.3},
  {x:750, y:H-2*TILE,w:TILE*5,h:12,type:'h',ox:750, range:120,spd:1.4},
  {x:1250,y:H-2*TILE,w:TILE*5,h:12,type:'h',ox:1250,range:120,spd:1.3},
  {x:1750,y:H-2*TILE,w:TILE*5,h:12,type:'h',ox:1750,range:130,spd:1.5},
  {x:2100,y:H-2*TILE,w:TILE*5,h:12,type:'h',ox:2100,range:100,spd:1.3}
);

// パタパタ 5体（適度な間隔で配置）
[
  {x:600,y:H-7*TILE,phase:0.0},
  {x:1000,y:H-9*TILE,phase:1.2},
  {x:1400,y:H-6*TILE,phase:2.4},
  {x:1750,y:H-8*TILE,phase:0.7},
  {x:2100,y:H-7*TILE,phase:1.8}
].forEach(({x,y,phase})=>{
  enemies.push({x,y,w:TILE,h:TILE*1.2,vx:-1.8,vy:0,alive:true,type:'parakoopa',
    state:'walk',flying:true,baseY:y,phase,shellTimer:0,walkFrame:0,walkTimer:0});
});

// コイン モリモリ 500枚以上
// ① ステージ上部 横断コイン列 2本（細かく密に）
for(let i=0;i<70;i++)coinItems.push({x:60+i*32,y:H-11*TILE,collected:false});
for(let i=0;i<70;i++)coinItems.push({x:60+i*32,y:H-9*TILE,collected:false});
// ② 波状コイン 2段（下段）
for(let i=0;i<60;i++)coinItems.push({x:300+i*36,y:H-5*TILE+Math.sin(i*0.7)*TILE,collected:false});
for(let i=0;i<60;i++)coinItems.push({x:300+i*36,y:H-7*TILE+Math.sin(i*0.7+1.5)*TILE,collected:false});
// ③ 大アーチ 5箇所（各20枚）
[300,700,1100,1550,2000].forEach(cx=>{
  for(let i=0;i<20;i++){
    const a=Math.PI*i/19;
    coinItems.push({x:cx-90+i*10,y:H-5*TILE-Math.sin(a)*TILE*3,collected:false});
  }
});
// ④ ゴール前ラッシュ（60枚・密集）
for(let i=0;i<60;i++)coinItems.push({x:1900+i*8,y:H-5*TILE-Math.sin(i*0.3)*TILE*2,collected:false});
// ⑤ 縦コイン柱（足場間の誘導）各6枚×6本
[[500,3],[700,4],[1050,3],[1350,5],[1650,4],[2020,3]].forEach(([px,row])=>{
  for(let i=0;i<6;i++)coinItems.push({x:px,y:H-(row+i)*TILE,collected:false});
});
// ⑥ 横スキャッター（等間隔）
for(let i=0;i<50;i++)coinItems.push({x:100+i*44,y:H-3*TILE,collected:false});
// ⑦ 中段密集帯
for(let i=0;i<80;i++)coinItems.push({x:500+i*20,y:H-8*TILE+Math.sin(i*0.4)*TILE*1.5,collected:false});
// 合計: 140+120+100+60+36+50+80 = 586枚 ✓
}
