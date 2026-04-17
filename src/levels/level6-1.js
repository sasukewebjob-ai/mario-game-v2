import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

// 6-1: 氷の平原 (Ice Plains)
// 新敵・ペンギン初登場。全面氷でマリオがスライドする。
// Ground zones: Z1=0-600, Z2=870-1060/1130-1500, Z3=1800-2350/2446-2600, Z4=2920-3200/3296-3800, Z5=4250-5100, Z6=5420-5800/5896-8000
export function buildLevel_6_1(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.waterMode=false;G.swimCooldown=0;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  G.iceMode=true;

  // 地面（氷の割れ目×5）
  const gaps=[{s:600,e:870},{s:1060,e:1130},{s:1500,e:1800},{s:2350,e:2446},{s:2600,e:2920},{s:3200,e:3296},{s:3800,e:4250},{s:5100,e:5420},{s:5800,e:5896}]; // ★ added micro-gap 1060-1130, widened 3800-4120→4250
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ── 高台ブロック ──
  // 重複チェック済み。各addRowの末端+32px以降かつ同一y座標に?ブロックを配置する。
  addRow(200, H-5*TILE, 3,'brick'); // 200,232,264 → 末端296
  addRow(400, H-7*TILE, 3,'brick'); // 400,432,464 → 末端496
  addRow(920, H-5*TILE, 4,'brick'); // 920,952,984,1016 → 末端1048
  addRow(1150,H-7*TILE, 3,'brick'); // 1150,1182,1214 → 末端1246
  addRow(1860,H-5*TILE, 4,'brick'); // 1860,1892,1924,1956 → 末端1988
  addRow(2150,H-7*TILE, 3,'brick'); // 2150,2182,2214 → 末端2246
  addRow(3000,H-5*TILE, 4,'brick'); // 3000,3032,3064,3096 → 末端3128
  addRow(3300,H-7*TILE, 3,'brick'); // 3300,3332,3364 → 末端3396
  addRow(4200,H-5*TILE, 4,'brick'); // 4200,4232,4264,4296 → 末端4328
  addRow(4550,H-7*TILE, 3,'brick'); // 4550,4582,4614 → 末端4646
  addRow(5480,H-5*TILE, 4,'brick'); // 5480,5512,5544,5576 → 末端5608
  addRow(5900,H-7*TILE, 3,'brick'); // 5900,5932,5964 → 末端5996
  addRow(6300,H-5*TILE, 5,'brick'); // 6300,6332,6364,6396,6428 → 末端6460
  addRow(6700,H-7*TILE, 3,'brick'); // 6700,6732,6764 → 末端6796
  addRow(7050,H-5*TILE, 3,'brick'); // 7050,7082,7114 → 末端7146

  // ★ Block Height Variety
  addRow(500, H-4*TILE, 3,'brick');   // Z1 低空 (500,532,564)
  addRow(1400,H-8*TILE, 3,'brick');   // Z2 高空 (1400,1432,1464)
  addRow(2500,H-10*TILE,2,'brick');   // Z3 超高空 (2500,2532)
  addRow(4700,H-4*TILE, 3,'brick');   // Z5 低空 (4700,4732,4764)

  addStair(7200, 6);

  // ── ? ブロック（addRowと (x,y) 重複なし確認済み）──
  // Z1 (0-600)
  platforms.push({x:300, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 300>296 ✓
  // Z2 (870-1500)
  platforms.push({x:870, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 870<920 ✓
  platforms.push({x:1250,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 1250>1246 ✓
  // Z3 (1800-2600)
  platforms.push({x:1800,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1800<1860 ✓
  // Z4 (2920-3800)
  platforms.push({x:2950,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2950<3000 ✓
  platforms.push({x:3160,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 3160>3128 ✓
  platforms.push({x:3420,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3420>3396 ✓
  // Z5 (4250-5100) — gap widened to 4250
  platforms.push({x:4340,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4340>4328 ✓
  // Z6 (5420-8000)
  platforms.push({x:5620,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5620>5608 ✓
  platforms.push({x:6010,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6010>5996 ✓
  platforms.push({x:6470,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 6470>6460 ✓
  platforms.push({x:6810,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6810>6796 ✓
  platforms.push({x:7160,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 7160>7146 ✓

  // 隠し1UP
  platforms.push({x:150, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2050,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4380,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6500,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // ヨッシーブロック（yoshiEgg, y=H-9T で addRow と重複なし）
  platforms.push({x:1000,y:H-9*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
  platforms.push({x:4900,y:H-7*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0}); // 4900>4646 ✓

  // 土管（グラウンドゾーン内）
  pipes.push({x:420, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:2000,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:4500,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:6800,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  // ワープ土管（地下へ）
  pipes.push({x:1100,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0,isWarp:true,variant:'ice1'});
  pipes.push({x:3400,y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0,isWarp:true,variant:'ice2'});
  // パックンフラワー
  pipes.forEach((p,i)=>{if(p.isWarp)return;piranhas.push({x:p.x+24,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5});});

  // 移動足場（ギャップ上）
  movingPlats.push({x:700, y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:700, range:80, spd:1.3,prevX:700});
  movingPlats.push({x:1620,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:1620,range:90, spd:1.5,prevX:1620});
  movingPlats.push({x:2730,y:H-4*TILE,w:TILE*3,h:12,type:'h',ox:2730,range:85, spd:1.4,prevX:2730});
  // チェックポイント後の大ギャップ(3800-4250)と ワンワンギャップ(5100-5420) に縦移動床
  movingPlats.push({x:4000,y:H-4*TILE,w:TILE*2,h:12,type:'v',ox:4000,range:85,spd:1.5,prevX:4000,oy:H-4*TILE});
  movingPlats.push({x:5220,y:H-4*TILE,w:TILE*2,h:12,type:'v',ox:5220,range:85,spd:1.6,prevX:5220,oy:H-4*TILE});

  // ── 敵配置 ──
  // ペンギン（新敵・グラウンドゾーンのみ）
  // チェックポイント x=3600 から±300px離す: 3300〜3900 には敵を置かない
  [950,1300,1950,2200,2450,3100,4260,4300,4700,
   5600,5900,6350,6750,7060
  ].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE,vx:-2.0,vy:0,alive:true,
      type:'penguin',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // パラコンバット（空飛び・ギャップ上）
  [{x:730,phase:0},{x:1650,phase:1.2},{x:2760,phase:0.5},{x:3910,phase:1.8}].forEach(({x,phase})=>{
    enemies.push({x,y:H-6*TILE,w:TILE,h:TILE*1.2,vx:-1.3,vy:0,alive:true,
      type:'parakoopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
      flying:true,baseY:H-6*TILE,phase,facing:-1});
  });

  // ワンワン（2体・チェックポイントから500px以上離れた場所）
  chainChomps.push({x:5460,y:H-TILE-36,w:36,h:36,postX:5460,postY:H-TILE-36,vx:0,vy:0,phase:0,   state:'idle',lungeTimer:0,alive:true});
  chainChomps.push({x:6950,y:H-TILE-36,w:36,h:36,postX:6950,postY:H-TILE-36,vx:0,vy:0,phase:1.5, state:'idle',lungeTimer:0,alive:true});

  // ── コイン（300枚以上）──
  // ① ギャップアーチ（各10枚 × 5 = 50枚）
  [{s:600,e:870},{s:1060,e:1130},{s:1500,e:1800},{s:2350,e:2446},{s:2600,e:2920},{s:3200,e:3296},{s:3800,e:4250},{s:5100,e:5420},{s:5800,e:5896}].forEach(({s,e})=>{
    for(let j=0;j<10;j++){
      const t=j/9;
      coinItems.push({x:s+t*(e-s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});
    }
  });
  // ② 高台上空コイン
  [[200,H-7*TILE,3],[920,H-7*TILE,4],[1860,H-7*TILE,4],[3000,H-7*TILE,4],
   [4200,H-7*TILE,4],[5480,H-7*TILE,4],[6300,H-7*TILE,5]
  ].forEach(([cx,cy,n])=>{for(let j=0;j<n;j++) coinItems.push({x:cx+j*32,y:cy,collected:false});});
  // ③ 地面ライン（各グラウンドゾーン）— ★ Z1,Z2をクラスターに置換
  // Z1 clusters (gap edge + vertical columns)
  [100,130,165,200,240].forEach(cx=>coinItems.push({x:cx,y:H-4*TILE,collected:false}));
  [380,420,460,500,540].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:300,y:cy,collected:false}));
  // Z2 clusters
  [880,920,960,1000,1040].forEach(cx=>coinItems.push({x:cx,y:H-4*TILE,collected:false}));
  [1200,1250,1300,1350,1400].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:1100,y:cy,collected:false}));
  // Risk coins at unusual heights
  [600,1500,2500,3500,4500,5500,6500].forEach(cx=>coinItems.push({x:cx,y:H-11*TILE,collected:false}));
  for(let j=0;j<22;j++) coinItems.push({x:1860+j*32,y:H-3*TILE,collected:false}); // Z3
  for(let j=0;j<25;j++) coinItems.push({x:2960+j*32,y:H-3*TILE,collected:false}); // Z4
  for(let j=0;j<24;j++) coinItems.push({x:4260+j*32,y:H-3*TILE,collected:false}); // Z5 (starts 4250)
  for(let j=0;j<13;j++) coinItems.push({x:5450+j*32,y:H-3*TILE,collected:false}); // Z6前半
  for(let j=0;j<10;j++) coinItems.push({x:6000+j*32,y:H-3*TILE,collected:false}); // Z6中
  for(let j=0;j<12;j++) coinItems.push({x:6360+j*32,y:H-3*TILE,collected:false}); // Z6後半
  for(let j=0;j<11;j++) coinItems.push({x:6750+j*32,y:H-3*TILE,collected:false}); // Z6末
  // ④ H-9T スカイライン（27枚）
  for(let j=0;j<27;j++) coinItems.push({x:200+j*280,y:H-9*TILE,collected:false});
  // ⑤ 中高度ライン（H-5T・ブロック間空き地）
  for(let j=0;j<20;j++) coinItems.push({x:300+j*340,y:H-5*TILE,collected:false});

  // チェックポイント（Z4の安全地帯・周辺200px以内に敵なし）
  // x=3600: 敵配置は 3100,3450,3650 → 3600-3450=150 < 200 なので 3450→3400 に変更済
  G.checkpoint={x:3600,y:H-TILE,reached:false};

  // フラッグポール: デフォルト LW-500=7500
// ★ ハンマースーツ・巨大キノコ
platforms.push({x:3500,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
platforms.push({x:2940,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
// ★ 装飾土管
pipes.push({x:5000,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
pipes.push({x:5600,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:2580,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:4000,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
piranhas.push({x:5624,baseY:6*TILE,y:6*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
pipes.push({x:1050,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
// ピノキオ部屋ワープ天井パイプ（Z1スタート近く x=220, addRow(200,H-5T)上からジャンプで入れる）
pipes.push({x:220,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:true,ceiling:true,variant:'pinocchio'});
// ★ 上空パタパタ（2段JMP対策）
enemies.push({x:800,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:0.0,shellTimer:0,walkFrame:0,walkTimer:0});
enemies.push({x:4300,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:1.6,shellTimer:0,walkFrame:0,walkTimer:0});

// 装飾天井パイプ
pipes.push({x:3200,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
}
