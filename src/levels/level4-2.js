import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_4_2(){
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
  G.autoScroll=1.2;

  // 地面（ギャップ5か所 / 最初の穴をブロックで埋めた）
  // Z1=0-800, Z2=1080-1250(micro:1180-1240), Z3=1250-1600, Z4=1850-2200, Z5=2450-2800, Z6=3050-3450+
  const gaps=[
    {s:800, e:1080},
    {s:1180,e:1240},  // ★ micro-gap (60px)
    {s:1250,e:1600},
    {s:1850,e:2200},
    {s:2450,e:2800},
    {s:3050,e:3450},
    // ★ 長尺化 (2026-06-10): Z8-Z12 のギャップ（micro-gap連打が4-2の個性）
    {s:3750,e:4150},
    {s:4400,e:4480},  // micro-gap
    {s:4750,e:5150},
    {s:5400,e:5480},  // micro-gap
    {s:5750,e:6100},
    {s:6500,e:6800},
  ];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Yoshi egg (early)
  platforms.push({x:432,y:H-4*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});

  // 空中レンガ足場（各ゾーン交互高度）
  addRow(1100,H-5*TILE, 2,'brick');
  addRow(1650,H-7*TILE, 2,'brick');
  addRow(2200,H-5*TILE, 2,'brick');
  addRow(2800,H-7*TILE, 2,'brick');
  addRow(3450,H-5*TILE, 2,'brick');

  // ★ Block Height Variety（安全な地面ゾーンに配置）
  addRow(750, H-3*TILE, 2,'brick');   // Z2 (630-800) 低空
  addRow(1700, H-8*TILE, 2,'brick');  // Z4 (1600-1850) 高空

  // ★ 長尺化 (2026-06-10): Zone 8-12 (3750-7500)（階段3700を撤去して続行）
  // Z8 (4150-4400)
  addRow(4200, H-5*TILE, 3,'brick');
  platforms.push({x:4310, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  // Z9 (4480-4750): CP2の休息地帯
  addRow(4550, H-7*TILE, 2,'brick');
  // Z10 (5150-5400)
  addRow(5200, H-6*TILE, 3,'brick');
  platforms.push({x:5320, y:H-8*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  // Z11 (5480-5750)
  platforms.push({x:5520, y:H-9*TILE, w:TILE,h:TILE,type:'hidden', hit:false,has1UP:true, bounceOffset:0});
  addRow(5600, H-3*TILE, 2,'brick');
  // ギャップ5750-6100の上空に浮きレンガ（足場ルート）
  addRow(5870, H-6*TILE, 3,'brick');
  // Z12 (6100-6500 / 6800-7300)
  addRow(6200, H-5*TILE, 2,'brick');
  platforms.push({x:6320, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
  addRow(6900, H-5*TILE, 3,'brick');
  pipes.push({x:4320,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,variant:null});
  pipes.push({x:7050,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,variant:null});
  addStair(7300,6);
  flagPole.x=7500;

  // 特殊ブロック（addRow座標と必ず異なるx/yに配置）
  // addRow位置: Z3@1100(H-5T), Z4@1650(H-7T),
  //             Z5@2200(H-5T), Z6@2800(H-7T), Z7@3450(H-5T)
  // → Q/hiddenブロックは全て +90〜110px ずらして配置
  platforms.push({x:270, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // Z1
  platforms.push({x:300, y:H-9*TILE, w:TILE,h:TILE,type:'question', hit:false,has1UP:true, bounceOffset:0});
  platforms.push({x:720, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // Z2 ★ was 750 (addRow750と同x) → 720へ
  platforms.push({x:660, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',  hit:false,has1UP:true, bounceOffset:0}); // ★ was 770 (pit:800直前) → 660へ
  platforms.push({x:1115,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // Z2後半（x=1115: ブロック左寄り、敵x=1150と分離）
  platforms.push({x:1610,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',  hit:false,has1UP:true, bounceOffset:0}); // ★ was 1158 (micro-gap:1180直前の小島) → Z4地面1610へ
  platforms.push({x:2240,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',  hit:false,has1UP:true, bounceOffset:0}); // ★ was 1780 (pit:1850直前) → Z5レンガ上空2240へ
  platforms.push({x:2310,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // Z5
  platforms.push({x:2340,y:H-9*TILE, w:TILE,h:TILE,type:'question', hit:false,has1UP:true, bounceOffset:0});
  platforms.push({x:2910,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // Z6
  platforms.push({x:2940,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',  hit:false,has1UP:true, bounceOffset:0}); // ★ H-11T→H-9T,hidden
  platforms.push({x:3560,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0}); // Z7

  // コイン（3ライン + クラスター + ギャップアーチ）
  for(let i=0;i<25;i++) coinItems.push({x:150+i*145,y:H-9*TILE, collected:false});
  for(let i=0;i<18;i++) coinItems.push({x:200+i*200,y:H-11*TILE,collected:false});
  for(let i=0;i<10;i++) coinItems.push({x:600+i*340,y:H-8*TILE, collected:false});
  // ★ Coin Clusters（ギャップ端に集中配置 + 縦列）
  [355,375,395,420,445].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  [620,605,585,565,545].forEach(cx=>coinItems.push({x:cx,y:H-5*TILE,collected:false}));
  // Vertical columns
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:1120,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:2250,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:3480,y:cy,collected:false}));
  // Risk coins at unusual heights
  [700,1300,1900,2500,3100].forEach(cx=>coinItems.push({x:cx,y:H-2*TILE,collected:false}));
  [650,1200,1800,2400,3000].forEach(cx=>coinItems.push({x:cx,y:H-10*TILE,collected:false}));
  gaps.forEach(({s,e})=>{
    const m=Math.round((s+e)/2);
    [-80,-48,-16,16,48,80].forEach(dx=>coinItems.push({x:m+dx,y:H-5*TILE,collected:false}));
    [-96,-64,-32,32,64,96].forEach(dx=>coinItems.push({x:m+dx,y:H-7*TILE,collected:false}));
    // ★ ルール⑦対応の増量: 低空（落下回収）と高空（足場ジャンプ）の2ライン追加
    [-96,-64,-32,0,32,64,96].forEach(dx=>coinItems.push({x:m+dx,y:H-3*TILE,collected:false}));
    [-96,-64,-32,0,32,64,96].forEach(dx=>coinItems.push({x:m+dx,y:H-9*TILE,collected:false}));
  });
  // ★ ルール⑦対応の増量: 中空ライン + 最上空ライン（天井土管1700/2300を回避）+ 縦列
  for(let i=0;i<25;i++) coinItems.push({x:320+i*145,y:H-6*TILE, collected:false});
  for(let i=0;i<22;i++) coinItems.push({x:350+i*160,y:H-12*TILE,collected:false});
  [H-2*TILE,H-3*TILE,H-4*TILE,H-5*TILE,H-6*TILE,H-8*TILE,H-9*TILE].forEach(cy=>coinItems.push({x:3520,y:cy,collected:false}));
  // ★ 長尺化エリア (3700-7300) のコイン
  for(let i=0;i<25;i++) coinItems.push({x:3700+i*145,y:H-9*TILE, collected:false});
  for(let i=0;i<17;i++) coinItems.push({x:3850+i*200,y:H-11*TILE,collected:false});
  for(let i=0;i<24;i++){const _cx=3750+i*150;if(_cx<5180||_cx>5296)coinItems.push({x:_cx,y:H-6*TILE, collected:false});} // 岩レンガ5200-5296を回避
  [4300,5000,5700,6400,7100].forEach(cx=>coinItems.push({x:cx,y:H-2*TILE,collected:false}));
  [4350,5050,5650,6450].forEach(cx=>coinItems.push({x:cx,y:H-10*TILE,collected:false}));

  // 動く足場（各ギャップに2個・速め）
  movingPlats.push({x:820, y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:820, range:110,spd:1.8,prevX:820});
  movingPlats.push({x:950, y:H-7*TILE,w:TILE*3,h:12,type:'h',ox:950, range:80, spd:2.2,prevX:950});
  movingPlats.push({x:1270,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:1270,range:110,spd:1.8,prevX:1270});
  movingPlats.push({x:1430,y:H-7*TILE,w:TILE*3,h:12,type:'h',ox:1430,range:90, spd:2.2,prevX:1430});
  movingPlats.push({x:1870,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:1870,range:110,spd:2.0,prevX:1870});
  movingPlats.push({x:2040,y:H-7*TILE,w:TILE*3,h:12,type:'h',ox:2040,range:90, spd:2.4,prevX:2040});
  movingPlats.push({x:2470,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:2470,range:110,spd:2.0,prevX:2470});
  movingPlats.push({x:2630,y:H-7*TILE,w:TILE*3,h:12,type:'h',ox:2630,range:90, spd:2.4,prevX:2630});
  movingPlats.push({x:3070,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:3070,range:120,spd:2.0,prevX:3070});
  movingPlats.push({x:3250,y:H-7*TILE,w:TILE*3,h:12,type:'h',ox:3250,range:90, spd:2.6,prevX:3250});
  // ★ 長い動く足場（TILE*5）はユーザー指示で撤去
  // ★ 長尺化: Z8-Z12ギャップ用
  movingPlats.push({x:3770,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:3770,range:110,spd:1.9,prevX:3770});
  movingPlats.push({x:3950,y:H-7*TILE,w:TILE*3,h:12,type:'h',ox:3950,range:90, spd:2.3,prevX:3950});
  movingPlats.push({x:4770,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:4770,range:110,spd:2.0,prevX:4770});
  movingPlats.push({x:4950,y:H-7*TILE,w:TILE*3,h:12,type:'h',ox:4950,range:90, spd:2.4,prevX:4950});
  movingPlats.push({x:5770,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:5770,range:100,spd:2.1,prevX:5770});
  movingPlats.push({x:6520,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:6520,range:100,spd:2.2,prevX:6520});
  movingPlats.push({x:6660,y:H-7*TILE,w:TILE*2,h:12,type:'h',ox:6660,range:60, spd:2.5,prevX:6660});

  // 敵（スタート直後 x<600 は安全）
  // クリボー ×5
  [700,1150,1272,2300,2900].forEach(x=>{
    enemies.push({x,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,
      type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false});
  });
  // メット（buzzy）×13（地面10 + ブロック上3）
  [760,1176,1848,2370,2970, 720,1150,1272,2250,2850].forEach(x=>{
    enemies.push({x,y:H-2*TILE,w:TILE,h:TILE*0.85,vx:-1.8,vy:0,alive:true,
      type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false});
  });
  // ブロック上メット×3（Z1@150/Z2@650の2行を削除済み）
  [
    {x:1576,y:H-8*TILE},  // addRow(1650,H-7T)上付近の足場へ(ギャップ上スポーン修正)
    {x:2232,y:H-6*TILE},  // addRow(2200,H-5T)上
    {x:2832,y:H-8*TILE},  // addRow(2800,H-7T)上
  ].forEach(({x,y})=>{
    enemies.push({x,y,w:TILE,h:TILE*0.85,vx:-1.8,vy:0,alive:true,
      type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false});
  });
  // 飛びノコノコ（parakoopa）×3（11体→3体に削減）
  [
    {x:940, baseY:H-5*TILE,phase:1.0},
    {x:2120,baseY:H-5*TILE,phase:1.5},
    {x:3250,baseY:H-6*TILE,phase:0.3},
  ].forEach(({x,baseY,phase})=>{
    enemies.push({x,y:baseY,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,
      type:'parakoopa',flying:true,baseY,phase,
      state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // チャージングチャック（チェックポイント±300外）
  [{x:700,facing:-1},{x:1150,facing:-1},{x:2300,facing:-1},{x:2950,facing:-1},{x:3500,facing:-1}
  ].forEach(d=>enemies.push({x:d.x,y:H-2*TILE-4,w:TILE,h:TILE*1.4,vx:d.facing*1.5,vy:0,alive:true,type:'chuck',state:'idle',facing:d.facing,hp:3,walkFrame:0,walkTimer:0,onGround:false,stunTimer:0}));

  // ★ 長尺化エリアの敵（ギャップ外・CP2±300(4300-4900)に地上歩き敵を置かない）
  [4180,5250,6250].forEach(x=>{
    enemies.push({x,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,
      type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false});
  });
  [4250,5300,6350,6900].forEach(x=>{
    enemies.push({x,y:H-2*TILE,w:TILE,h:TILE*0.85,vx:-1.8,vy:0,alive:true,
      type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false});
  });
  // トゲゾー（踏めない脅威）
  [5650,6150].forEach(x=>enemies.push({x,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,type:'spiny',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1}));
  // ファジー（ギャップ5750-6100のレール横断）
  enemies.push({x:5800,y:H-5*TILE,w:TILE,h:TILE,vx:0,vy:0,alive:true,type:'fuzzy',state:'walk',railX1:5800,railY1:H-5*TILE,railX2:6050,railY2:H-7*TILE,t:0,speed:0.012});
  // ハンマーブロス（Z12の門番）
  enemies.push({x:6230,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:80,jumpTimer:150,onGround:false});
  // チャック＋飛びノコノコ
  [{x:5550,facing:-1},{x:6950,facing:-1}].forEach(d=>enemies.push({x:d.x,y:H-2*TILE-4,w:TILE,h:TILE*1.4,vx:d.facing*1.5,vy:0,alive:true,type:'chuck',state:'idle',facing:d.facing,hp:3,walkFrame:0,walkTimer:0,onGround:false,stunTimer:0}));
  [
    {x:4950,baseY:H-5*TILE,phase:0.7},
    {x:6650,baseY:H-6*TILE,phase:1.4},
  ].forEach(({x,baseY,phase})=>{
    enemies.push({x,y:baseY,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,
      type:'parakoopa',flying:true,baseY,phase,
      state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });
  enemies.push({x:7000,y:H-2*TILE,w:TILE,h:TILE,vx:-1.3,vy:0,alive:true,type:'rex',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});

  // ★ 第2チェックポイント（Z9休息地帯）
  G.checkpoint2={x:4600,y:H-TILE,reached:false};

  // チェックポイント（Z4地面上）
  G.checkpoint={x:1800,y:H-TILE,reached:false};
  // ★ ハンマースーツ（★ was x=1200 micro-gap内で取れない → Z5地面x=2370へ移動）
  platforms.push({x:2370,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:200,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:2300,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:1700,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  piranhas.push({x:2324,baseY:5*TILE,y:5*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
  pipes.push({x:4750,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  // 上空パタパタ削減（2体→0）

  // ★ トゲゾー（CP後・地面 2200-2450）
  enemies.push({x:2400,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,type:'spiny',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  // ★ ファジー（CP後・レール沿い）
  enemies.push({x:2500,y:H-5*TILE,w:TILE,h:TILE,vx:0,vy:0,alive:true,type:'fuzzy',state:'walk',railX1:2500,railY1:H-5*TILE,railX2:2700,railY2:H-7*TILE,t:0,speed:0.012});
}
