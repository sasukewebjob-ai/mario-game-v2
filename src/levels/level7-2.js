import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

// 7-2: 砦の深部 (Fortress Interior)
// テレサ×5・ドッスン×3・溶岩多め・ワープ土管×2
// Ground zones: Z1=0-900, Z2=1200-2100, Z3=2400-3500, Z4=3900-5000, Z5=5300-6200, Z6=6500-8000
export function buildLevel_7_2(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.waterMode=false;G.swimCooldown=0;G.iceMode=false;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // 地面（砦の深淵×5：gap1をマイクロ化、gap3を拡大）
  const gaps=[{s:900,e:980},{s:2100,e:2400},{s:3500,e:4000},{s:5000,e:5300},{s:6200,e:6500}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ── 砦ブロック ──
  addRow(350, H-5*TILE, 4,'brick'); // 350,382,414,446 → 末端478
  addRow(350, H-7*TILE, 3,'brick'); // 350,382,414 → 末端446
  addRow(650, H-9*TILE, 3,'brick'); // 650,682,714 → 末端746
  addRow(1250, H-5*TILE, 4,'brick'); // 1250,1282,1314,1346 → 末端1378
  addRow(1600, H-7*TILE, 3,'brick'); // 1600,1632,1664 → 末端1696
  addRow(1900, H-5*TILE, 3,'brick'); // 1900,1932,1964 → 末端1996
  addRow(2450, H-5*TILE, 4,'brick'); // 2450,2482,2514,2546 → 末端2578
  addRow(2800, H-7*TILE, 3,'brick'); // 2800,2832,2864 → 末端2896
  addRow(3100, H-5*TILE, 4,'brick'); // 3100,3132,3164,3196 → 末端3228
  addRow(4000, H-5*TILE, 4,'brick'); // 4000,4032,4064,4096 → 末端4128
  addRow(4350, H-7*TILE, 3,'brick'); // 4350,4382,4414 → 末端4446
  addRow(4700, H-5*TILE, 4,'brick'); // 4700,4732,4764,4796 → 末端4828
  addRow(5380, H-5*TILE, 4,'brick'); // 5380,5412,5444,5476 → 末端5508
  addRow(5750, H-7*TILE, 3,'brick'); // 5750,5782,5814 → 末端5846
  addRow(6050, H-5*TILE, 3,'brick'); // 6050,6082,6114 → 末端6146
  addRow(6580, H-5*TILE, 4,'brick'); // 6580,6612,6644,6676 → 末端6708
  addRow(6950, H-7*TILE, 3,'brick'); // 6950,6982,7014 → 末端7046
  addRow(7200, H-5*TILE, 3,'brick'); // 7200,7232,7264 → 末端7296
  // ── 砦ダンジョン追加層 ──
  addRow(1350, H-4*TILE, 3,'brick'); // 1350,1382,1414 → 末端1446（Z2内・低層）
  addRow(2550, H-6*TILE, 3,'brick'); // 2550,2582,2614 → 末端2646（Z3内・中層）
  addRow(4150, H-8*TILE, 2,'brick'); // 4150,4182 → 末端4214（Z4内・上層）
  addRow(5900, H-4*TILE, 3,'brick'); // 5900,5932,5964 → 末端5996（Z5内・低層）
  addStair(7350, 6);                 // 6段登り階段

  // ── ヨッシーブロック（オープニング）──
  platforms.push({x:200, y:H-5*TILE, w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0}); // 200<350(addRow) ✓

  // ── ? ブロック ──
  // Z1
  platforms.push({x:290, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 290<350(addRow) ✓
  platforms.push({x:460, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 460>446 ✓
  platforms.push({x:760, y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 760>746 ✓
  // Z2
  platforms.push({x:1200, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1200<1250 ✓
  platforms.push({x:1710, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1710>1696 ✓
  platforms.push({x:2010, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 2010>1996 ✓
  // Z3
  platforms.push({x:2400, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2400<2450 ✓
  platforms.push({x:2910, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2910>2896 ✓
  platforms.push({x:3240, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 3240>3228 ✓
  // Z4
  platforms.push({x:3380, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3380<3500(gap) ✓
  platforms.push({x:4140, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4140>4128 ✓
  platforms.push({x:4460, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4460>4446 ✓
  platforms.push({x:4840, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 4840>4828 ✓
  // Z5
  platforms.push({x:5300, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5300<5380 ✓
  platforms.push({x:5860, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5860>5846 ✓
  platforms.push({x:6160, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6160>6146 ✓
  // Z6
  platforms.push({x:6500, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6500<6580 ✓
  platforms.push({x:6720, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 6720>6708 ✓
  platforms.push({x:7060, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 7060>7046 ✓

  // 隠し1UP
  platforms.push({x:500,  y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2500, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4500, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6700, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // 土管（グラウンドゾーン内）
  pipes.push({x:500,  y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:1800, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:4800, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:6050, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  // ワープ土管（地下へ）
  pipes.push({x:1400, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0,isWarp:true,variant:'fortress3'});
  pipes.push({x:2700, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0,isWarp:true,variant:'fortress4'});
  // パックンフラワー（ワープ土管以外）
  pipes.forEach((p,i)=>{if(p.isWarp)return;piranhas.push({x:p.x+24,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5});});

  // キャノン（4基・砦の壁）
  cannons.push({x:750,  y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:20});
  cannons.push({x:1900, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:280,timer:80});
  cannons.push({x:3200, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:280,timer:50});
  cannons.push({x:5500, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:260,timer:110});

  // 移動足場（ギャップ上・gap1はマイクロなので足場不要、gap3拡大分を補強）
  movingPlats.push({x:2200,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:2200,range:85, spd:1.6,prevX:2200});
  movingPlats.push({x:3680,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3680,range:110,spd:1.7,prevX:3680});
  movingPlats.push({x:5100,y:H-4*TILE,w:TILE*2,h:12,type:'v',oy:H-4*TILE,range:60,spd:1.4,prevX:5100});
  movingPlats.push({x:6310,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:6310,range:80, spd:1.8,prevX:6310});

  // 溶岩炎（ギャップ上・gap1マイクロなので削除、gap3拡大分を調整）
  for(let fx=3510;fx<3990;fx+=40) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:48+((fx-3510)%3)*12,curH:0,phase:Math.floor((fx-3510)/40)*8,period:75+fx%20});
  for(let fx=5010;fx<5290;fx+=40) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:50+((fx-5010)%3)*14,curH:0,phase:Math.floor((fx-5010)/40)*10,period:80+fx%22});

  // ── 敵配置 ──
  // チェックポイント x=4200 から±300px離す: 3900〜4500 には敵を置かない

  // メット（ブロック上にも配置可能）
  [500, 700, 1280, 1700, 2500, 3000, 3300, 4600, 4900, 5500, 6000, 6600, 7100].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE*0.85,vx:-1.6,vy:0,alive:true,
      type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // ノコノコ
  [550, 1350, 1950, 2600, 3100, 4700, 5400, 6100, 6800].forEach(ex=>{
    enemies.push({x:ex,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1.3,vy:0,alive:true,
      type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // ハンマーブロス（2体）
  enemies.push({x:3200,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:90+Math.floor(Math.random()*60),jumpTimer:130+Math.floor(Math.random()*80),onGround:false});
  enemies.push({x:5800,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:70+Math.floor(Math.random()*60),jumpTimer:110+Math.floor(Math.random()*80),onGround:false});

  // カロン（砦の深部・チェックポイント±300外）
  [{x:700},{x:1500},{x:2100},{x:2700},{x:4000},{x:5000},{x:6300},{x:7200}
  ].forEach(({x})=>enemies.push({x,y:H-2*TILE,w:TILE,h:TILE*1.2,vx:-1.2,vy:0,alive:true,type:'dryBones',state:'walk',walkFrame:0,walkTimer:0,onGround:false}));

  // テレサ×5（砦内を漂う幽霊）
  [{x:1050,y:H-6*TILE},{x:2200,y:H-5*TILE},{x:3650,y:H-5*TILE},
   {x:5150,y:H-6*TILE},{x:6800,y:H-5*TILE}].forEach(({x,y})=>{
    enemies.push({x,y,w:28,h:28,vx:-0.5,vy:0.3,alive:true,type:'teresa',hiding:false,activated:true});
  });

  // ドッスン×3（天井から落下）
  enemies.push({x:1500,y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
  enemies.push({x:3000,y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
  enemies.push({x:4600,y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});

  // ── コイン（300枚以上）──
  // ① ギャップアーチ（更新されたギャップに対応）
  [{s:900,e:980},{s:2100,e:2400},{s:3500,e:4000},{s:5000,e:5300},{s:6200,e:6500}].forEach(({s,e})=>{
    for(let j=0;j<10;j++){const t=j/9;coinItems.push({x:s+t*(e-s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});}
  });
  // ② 高台上空コイン
  [[100,H-7*TILE,4],[1250,H-7*TILE,4],[2450,H-7*TILE,4],[3100,H-7*TILE,4],
   [4000,H-7*TILE,4],[5380,H-7*TILE,4],[6580,H-7*TILE,4],[7200,H-7*TILE,3]
  ].forEach(([cx,cy,n])=>{for(let j=0;j<n;j++) coinItems.push({x:cx+j*32,y:cy,collected:false});});
  // ③ 地面ライン（各グラウンドゾーン）
  for(let j=0;j<14;j++) coinItems.push({x:120+j*55, y:H-3*TILE,collected:false}); // Z1
  for(let j=0;j<14;j++) coinItems.push({x:1010+j*62,y:H-3*TILE,collected:false}); // Z2(gap1マイクロ化→Z2開始早め)
  for(let j=0;j<15;j++) coinItems.push({x:2430+j*70,y:H-3*TILE,collected:false}); // Z3
  for(let j=0;j<14;j++) coinItems.push({x:4030+j*68,y:H-3*TILE,collected:false}); // Z4(gap3拡大→開始位置調整)
  for(let j=0;j<13;j++) coinItems.push({x:5330+j*70,y:H-3*TILE,collected:false}); // Z5
  for(let j=0;j<22;j++) coinItems.push({x:6530+j*65,y:H-3*TILE,collected:false}); // Z6
  // ④ クラスター：ギャップ際コイン群（旧④の退屈ラインを置換）
  // gap2(2100-2400)際：左端縦列クラスター
  [2060,2070,2080].forEach(cx=>[H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 9枚
  // gap3(3500-4000)際：右端クラスター
  [4010,4020,4030,4040].forEach(cx=>[H-2*TILE,H-3*TILE,H-4*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 12枚
  // ⑤ ダンジョン層コイン（新ブロック上のご褒美）
  for(let j=0;j<3;j++) coinItems.push({x:1350+j*32,y:H-6*TILE,collected:false}); // H-4T addRow上
  for(let j=0;j<3;j++) coinItems.push({x:2550+j*32,y:H-8*TILE,collected:false}); // H-6T addRow上
  for(let j=0;j<3;j++) coinItems.push({x:5900+j*32,y:H-6*TILE,collected:false}); // H-4T addRow上
  // ⑥ リスクコイン（H-10T, H-11T）
  for(let j=0;j<5;j++) coinItems.push({x:1500+j*1200,y:H-10*TILE,collected:false});
  for(let j=0;j<4;j++) coinItems.push({x:800+j*1600,y:H-11*TILE,collected:false});
  // ⑦ 散在コイン（補完）
  for(let j=0;j<18;j++) coinItems.push({x:200+j*400,y:H-9*TILE,collected:false});

  // チェックポイント（Z4入口・周辺300px以内に敵なし: 3900〜4500禁止済み）
  G.checkpoint={x:4200,y:H-TILE,reached:false};

  // フラッグポール: デフォルト LW-500=7500（stair終端 7350+5*32=7510 の後 ✓）
  flagPole.x=7500;
  // ★ ハンマースーツ
  platforms.push({x:4400,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:1300,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:5600,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:2500,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:4000,y:0,w:TILE*2,h:7*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  piranhas.push({x:5624,baseY:6*TILE,y:6*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
  pipes.push({x:1050,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:3350,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  // ★ 上空パタパタ（2段JMP対策）
  enemies.push({x:800,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:0.0,shellTimer:0,walkFrame:0,walkTimer:0});
  enemies.push({x:4300,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:1.6,shellTimer:0,walkFrame:0,walkTimer:0});

// ピノキオ部屋ワープ天井パイプ（1ステージに1本）
pipes.push({x:3000,y:0,w:TILE*2,h:8*TILE,bounceOffset:0,isWarp:true,ceiling:true,variant:'pinocchio'});
}
