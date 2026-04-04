import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_4_1(){
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
  G.autoScroll=0.8;

  // 地面（ギャップ6か所 / 半分サイズ）
  // Z1=0-380, Z2=560-870, Z3=1110-1380, Z4=1660-1960, Z5=2240-2580, Z6=2880-3180, Z7=3500+
  const gaps=[
    {s:380, e:560},
    {s:870, e:1110},
    {s:1280,e:1360},  // ★ micro-gap (80px)
    {s:1380,e:1660},
    {s:1960,e:2240},
    {s:2580,e:2880},
    {s:3180,e:3500},
  ];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // 空中レンガ足場 と ？ブロック（addRow と push の座標重複なし）
  // Yoshi egg (early)
  platforms.push({x:224,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});

  // Zone 1 (0-380): レンガ@160-224, Q@280(H-7T), hidden@350(H-9T)
  addRow(160, H-5*TILE, 2,'brick');
  platforms.push({x:280, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:350, y:H-9*TILE, w:TILE,h:TILE,type:'hidden', hit:false,has1UP:true, bounceOffset:0});

  // Zone 2 (560-870): レンガ@600-664, Q@720(H-5T), hidden@800(H-9T)
  addRow(600, H-6*TILE, 3,'brick');
  platforms.push({x:720, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:800, y:H-9*TILE, w:TILE,h:TILE,type:'hidden', hit:false,has1UP:true, bounceOffset:0});

  // Zone 3 (1110-1380): レンガ@1120-1152, Q@1220(H-7T), hidden@1300(H-9T)
  addRow(1120, H-5*TILE, 2,'brick');
  platforms.push({x:1220, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true, bounceOffset:0});
  platforms.push({x:1300, y:H-9*TILE, w:TILE,h:TILE,type:'hidden', hit:false,has1UP:true, bounceOffset:0});

  // Zone 4 (1660-1960): レンガ@1680-1744, Q@1800(H-5T), hidden@1900(H-9T)
  addRow(1680, H-7*TILE, 3,'brick');
  platforms.push({x:1800, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1900, y:H-9*TILE, w:TILE,h:TILE,type:'hidden', hit:false,has1UP:true, bounceOffset:0});

  // Zone 5 (2240-2580): レンガ@2260-2324, Q@2400(H-7T), hidden@2500(H-9T)
  addRow(2260, H-5*TILE, 3,'brick');
  platforms.push({x:2400, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2500, y:H-9*TILE, w:TILE,h:TILE,type:'hidden', hit:false,has1UP:true, bounceOffset:0});

  // Zone 6 (2880-3180): レンガ@2900-2932, Q@3000(H-5T), hidden@3100(H-9T)
  addRow(2900, H-7*TILE, 2,'brick');
  platforms.push({x:3000, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true, bounceOffset:0});
  platforms.push({x:3100, y:H-9*TILE, w:TILE,h:TILE,type:'hidden', hit:false,has1UP:true, bounceOffset:0});

  // Zone 7 (3500+): レンガ + コインブロック + 階段
  addRow(3540, H-5*TILE, 2,'brick');
  platforms.push({x:3660, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
  addStair(3750,6);

  // ★ Block Height Variety（安全な地面ゾーンに配置）
  addRow(700, H-3*TILE, 2,'brick');   // Z2 (560-870) 低空
  addRow(1700, H-8*TILE, 2,'brick');  // Z4 (1660-1960) 高空
  addRow(2960, H-3*TILE, 2,'brick');  // Z6 (2880-3180) 低空
  flagPole.x=3970;

  // 動く足場（ギャップ6か所 / 各1〜3台）
  const mp=(x,y,w,range,spd)=>movingPlats.push({x,y,w,h:12,type:'h',ox:x,range,spd,prevX:x});
  mp(400,  H-4*TILE, TILE*3, 55,  1.2);
  mp(890,  H-4*TILE, TILE*3, 80,  1.5);
  mp(1000, H-7*TILE, TILE*2, 45,  2.0);
  mp(1400, H-4*TILE, TILE*3, 100, 1.6);
  mp(1540, H-6*TILE, TILE*2, 55,  2.2);
  mp(1980, H-3*TILE, TILE*4, 85,  1.3);
  mp(2110, H-6*TILE, TILE*2, 50,  2.1);
  mp(2600, H-4*TILE, TILE*3, 100, 1.7);
  mp(2740, H-7*TILE, TILE*2, 60,  2.3);
  mp(3200, H-4*TILE, TILE*3, 88,  1.5);
  mp(3310, H-6*TILE, TILE*2, 65,  2.1);
  mp(3420, H-4*TILE, TILE*2, 48,  2.7);

  // 入れない土管（5本）
  [{x:590,ph:3},{x:1150,ph:3},{x:1830,ph:3},{x:2440,ph:3},{x:2960,ph:3}].forEach(({x,ph})=>{
    pipes.push({x,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:false,variant:null});
  });

  // コイン（3ライン + クラスター + ギャップアーチ）
  for(let i=0;i<25;i++) coinItems.push({x:150+i*145,y:H-9*TILE, collected:false});
  for(let i=0;i<18;i++) coinItems.push({x:200+i*200,y:H-11*TILE,collected:false});
  for(let i=0;i<10;i++) coinItems.push({x:600+i*340,y:H-8*TILE, collected:false});
  // ★ Coin Clusters（ギャップ端に集中配置 + 縦列）
  // Z2 gap edge clusters
  [565,580,600,620,640].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  [850,835,815,795,775].forEach(cx=>coinItems.push({x:cx,y:H-7*TILE,collected:false}));
  // Vertical columns (risk coins)
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:1180,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:2300,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:3520,y:cy,collected:false}));
  // Risk coins at unusual heights
  [700,1200,1800,2400,3000,3600].forEach(cx=>coinItems.push({x:cx,y:H-2*TILE,collected:false}));
  [500,1100,1700,2500,3100].forEach(cx=>coinItems.push({x:cx,y:H-10*TILE,collected:false}));
  gaps.forEach(({s,e})=>{
    const m=Math.round((s+e)/2);
    [-80,-48,-16,16,48,80].forEach(dx=>coinItems.push({x:m+dx,y:H-5*TILE,collected:false}));
    [-96,-64,-32,32,64,96].forEach(dx=>coinItems.push({x:m+dx,y:H-7*TILE,collected:false}));
  });

  // 敵（x<600 はスタート安全圏）
  // クリボー ×5
  [690,1240,1600,2350,3060].forEach(x=>{
    enemies.push({x,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,
      type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false});
  });
  // メット（buzzy）×15（地面10 + ブロック上5）
  [810,1310,2240,2520,3130, 650,1200,1600,2280,2960].forEach(x=>{
    enemies.push({x,y:H-2*TILE,w:TILE,h:TILE*0.85,vx:-1.8,vy:0,alive:true,
      type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false});
  });
  // ブロック上メット×5
  [
    {x:192, y:H-6*TILE},  // addRow(160,H-5T)上
    {x:632, y:H-7*TILE},  // addRow(600,H-6T)上
    {x:2292,y:H-6*TILE},  // addRow(2260,H-5T)上
    {x:2932,y:H-8*TILE},  // addRow(2900,H-7T)上
    {x:3556,y:H-6*TILE},  // addRow(3540,H-5T)上
  ].forEach(({x,y})=>{
    enemies.push({x,y,w:TILE,h:TILE*0.85,vx:-1.8,vy:0,alive:true,
      type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false});
  });
  // 飛びノコノコ（parakoopa）×8（各ギャップ上 + ゾーン上空）
  [
    {x:470, baseY:H-4*TILE,phase:0  },
    {x:990, baseY:H-5*TILE,phase:1.0},
    {x:1520,baseY:H-4*TILE,phase:0.5},
    {x:2240,baseY:H-5*TILE,phase:1.5},
    {x:2720,baseY:H-4*TILE,phase:0.8},
    {x:3330,baseY:H-6*TILE,phase:0.3},
    {x:2350,baseY:H-5*TILE,phase:0.7},
    {x:3060,baseY:H-4*TILE,phase:1.6},
  ].forEach(({x,baseY,phase})=>{
    enemies.push({x,y:baseY,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,
      type:'parakoopa',flying:true,baseY,phase,
      state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // チェックポイント（Z4地面上）
  // チェックポイント（Z4地面上 / パイプx=1830+64=1894の外）
  G.checkpoint={x:1920,y:H-TILE,reached:false};

  // ★ 風ゾーン（山岳の強風）
  windZones.push({x:560,y:0,w:310,h:H,force:2.5});   // Z2: 右風（軽め）
  windZones.push({x:1660,y:0,w:300,h:H,force:-3.5});  // Z4: 左風（強め）
  windZones.push({x:2880,y:0,w:300,h:H,force:4});     // Z6: 右風（かなり強い）
  // ★ ハンマースーツ
  platforms.push({x:2400,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:200,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:2500,y:0,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false,ceiling:true});
}
