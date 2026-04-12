import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

// 8-3: 氷の魔王城 (Frozen Demon Castle)
// 氷ブロック城・テレサ×4・ドッスン×3・ハンマーブロス×2・キャノン×4
// ワープパイプ→クッパHP=7最終決戦
// Ground zones: Z1=0-2000, Z2=2300-3800, Z3=4100-5600, Z4=6000-LW
export function buildLevel_8_3(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.waterMode=false;G.swimCooldown=0;
  peach.alive=false;G.peachChase=null;bowser.alive=false;
  G.bowserRightX=0;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;
  G.iceMode=true;  // 氷モード ON
  flagPole.x=LW+1000; // flagPole無効化（ワープパイプ→クッパ部屋）

  // 地面（氷の城床：gap3を拡大=最終チャレンジ）
  const gaps=[{s:2000,e:2300},{s:3800,e:4100},{s:5600,e:6000}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ══════════════════════════════════════
  // Z1 (0-2000): 城入口〜前半
  // ══════════════════════════════════════
  addRow(350, H-5*TILE, 4,'brick'); // 350-478
  addRow(400, H-7*TILE, 3,'brick'); // 400-496
  // ドッスン x=650-714 → 真下にブロック置かない
  addRow(750, H-9*TILE, 2,'brick'); // 750-814
  addRow(1050,H-5*TILE, 5,'brick'); // 1050-1210
  addRow(1500,H-7*TILE, 3,'brick'); // 1500-1596
  addRow(1800,H-5*TILE, 4,'brick'); // 1800-1928

  // ══════════════════════════════════════
  // Z2 (2300-3800): 中盤
  // ══════════════════════════════════════
  addRow(2350,H-5*TILE, 3,'brick'); // 2350-2446
  // ドッスン x=2500-2564 → 真下にブロック置かない
  addRow(2600,H-7*TILE, 3,'brick'); // 2600-2696
  addRow(2900,H-5*TILE, 4,'brick'); // 2900-3028
  addRow(3200,H-7*TILE, 3,'brick'); // 3200-3296
  addRow(3500,H-5*TILE, 3,'brick'); // 3500-3596

  // ══════════════════════════════════════
  // Z3 (4100-5600): 後半
  // ══════════════════════════════════════
  addRow(4150,H-5*TILE, 3,'brick'); // 4150-4246
  // ドッスン x=4350-4414 → 真下にブロック置かない
  addRow(4500,H-7*TILE, 3,'brick'); // 4500-4596
  addRow(4800,H-5*TILE, 4,'brick'); // 4800-4928
  addRow(5100,H-7*TILE, 3,'brick'); // 5100-5196
  addRow(5350,H-5*TILE, 3,'brick'); // 5350-5446

  // ── 氷城追加構造物（高度バリエーション）──
  addRow(1300, H-4*TILE, 3,'brick'); // 1300-1396（Z1内・低層）
  addRow(2700, H-6*TILE, 2,'brick'); // 2700-2764（Z2内・中層。既存2600 H-7Tと干渉なし）
  addRow(4700, H-8*TILE, 2,'brick'); // 4700-4764（Z3内・上層）
  addRow(5300, H-4*TILE, 3,'brick'); // 5300-5396（Z3内・低層）

  // ══════════════════════════════════════
  // Z4 (6000-LW): 最終エリア + ワープパイプ（gap3拡大→Z4開始は6000）
  // ══════════════════════════════════════
  addRow(6050,H-5*TILE, 4,'brick'); // 6050-6178
  addRow(6300,H-7*TILE, 3,'brick'); // 6300-6396
  addRow(6550,H-5*TILE, 3,'brick'); // 6550-6646

  // ── ヨッシーブロック ──
  platforms.push({x:200, y:H-5*TILE, w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});

  // ══════════════════════════════════════
  // ? ブロック（addRow 座標重複なし確認済み）
  // ══════════════════════════════════════
  // Z1
  platforms.push({x:290, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 290<350 ✓
  platforms.push({x:510, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 510>496 ✓
  platforms.push({x:830, y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 830>814 ✓
  platforms.push({x:1220,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 1220>1210 ✓
  platforms.push({x:1610,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1610>1596 ✓
  platforms.push({x:1940,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1940>1928 ✓
  // Z2
  platforms.push({x:2460,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2460>2446 ✓
  platforms.push({x:2710,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2710>2696 ✓
  platforms.push({x:3040,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 3040>3028 ✓
  platforms.push({x:3310,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3310>3296 ✓
  platforms.push({x:3610,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3610>3596 ✓
  // Z3
  platforms.push({x:4260,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4260>4246 ✓
  platforms.push({x:4610,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4610>4596 ✓
  platforms.push({x:4940,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 4940>4928 ✓
  platforms.push({x:5210,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5210>5196 ✓
  platforms.push({x:5460,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5460>5446 ✓
  // Z4
  platforms.push({x:6190,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6190>6178 ✓
  platforms.push({x:6410,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 6410>6396 ✓

  // 隠し1UP
  platforms.push({x:600,  y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2400, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4450, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6200, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // ══════════════════════════════════════
  // 土管（パックン付き）
  // ══════════════════════════════════════
  pipes.push({x:300,  y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:1350, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:2700, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:4700, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  piranhas.push({x:pipes[0].x+24,baseY:pipes[0].y,y:pipes[0].y,w:16,h:TILE,phase:0,  alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[1].x+24,baseY:pipes[1].y,y:pipes[1].y,w:16,h:TILE,phase:1.5,alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[2].x+24,baseY:pipes[2].y,y:pipes[2].y,w:16,h:TILE,phase:3.0,alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[3].x+24,baseY:pipes[3].y,y:pipes[3].y,w:16,h:TILE,phase:4.5,alive:true,maxUp:TILE*1.5});

  // ══════════════════════════════════════
  // キャノン（4基）
  // ══════════════════════════════════════
  cannons.push({x:500,  y:H-TILE*2,w:TILE,h:TILE*2,fireRate:260,timer:30});
  cannons.push({x:1700, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:240,timer:80});
  cannons.push({x:3000, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:250,timer:50});
  cannons.push({x:5000, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:240,timer:120});

  // ══════════════════════════════════════
  // 移動足場（深淵越え）
  // ══════════════════════════════════════
  movingPlats.push({x:2060,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:2060,range:80, spd:1.6,prevX:2060});
  movingPlats.push({x:3860,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3860,range:85, spd:1.8,prevX:3860});
  movingPlats.push({x:5750,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5750,range:100,spd:2.0,prevX:5750});

  // ══════════════════════════════════════
  // 溶岩炎（全ギャップ）
  // ══════════════════════════════════════
  for(let fx=2010;fx<2290;fx+=38) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:52+((fx-2010)%3)*14,curH:0,phase:Math.floor((fx-2010)/38)*9,period:75+fx%22});
  for(let fx=3810;fx<4090;fx+=38) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:54+((fx-3810)%3)*14,curH:0,phase:Math.floor((fx-3810)/38)*9,period:78+fx%20});
  for(let fx=5610;fx<5990;fx+=38) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:56+((fx-5610)%3)*14,curH:0,phase:Math.floor((fx-5610)/38)*9,period:80+fx%22});

  // ══════════════════════════════════════
  // 敵配置
  // チェックポイント x=3500 から±300px: 3200〜3800 には敵を置かない
  // ══════════════════════════════════════

  // カロン（氷城の守護者・チェックポイント±300外）
  [600, 1200, 2000, 2800, 4200, 5000, 5800, 6300].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE*0.9,vx:-1.2,vy:0,alive:true,type:'dryBones',state:'walk',walkFrame:0,walkTimer:0,onGround:false,collapseTimer:0});
  });

  // ノコノコ（城内巡回）×8
  [550, 900, 1400, 1900, 2500, 3100, 4200, 5200].forEach(ex=>{
    enemies.push({x:ex,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1.3,vy:0,alive:true,
      type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // メット（buzzy）×4
  [700, 1600, 2800, 5100].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE*0.85,vx:-1.8,vy:0,alive:true,
      type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false});
  });

  // ハンマーブロス×2
  enemies.push({x:1600,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:80+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false});
  enemies.push({x:5050,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:100+Math.floor(Math.random()*80),onGround:false});

  // ペンギン×4（氷ステージ限定）
  [800, 2600, 4400, 5400].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE,vx:-2.0,vy:0,alive:true,
      type:'penguin',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // テレサ×4（activated:true で即追跡開始）
  [{x:500, y:H-6*TILE},{x:1200,y:H-5*TILE},{x:2800,y:H-5*TILE},{x:5300,y:H-6*TILE}].forEach(({x,y})=>{
    enemies.push({x,y,w:28,h:28,vx:-0.5,vy:0.3,alive:true,type:'teresa',hiding:false,activated:true});
  });

  // ドッスン×3（天井から落下）
  // x 範囲の真下にブロックなし確認済み
  enemies.push({x: 650, y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
  enemies.push({x:2500, y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
  enemies.push({x:4350, y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});

  // ══════════════════════════════════════
  // ワープパイプ手前のブロック壁（落下防止）+ パイプ
  // ══════════════════════════════════════
  for(let wy=H-6*TILE;wy<H-TILE;wy+=TILE){addB(6800,wy,'brick');addB(6832,wy,'brick');}
  for(let bx=6864;bx<=6944;bx+=TILE) addB(bx,H-2*TILE,'brick');

  // ワープパイプ（クッパ最終決戦へ）
  pipes.push({x:6880,y:H-TILE*2-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:true,variant:'bowser_final'});
  G.checkpoint2={x:6500,y:H-TILE,reached:false};

  // ══════════════════════════════════════
  // コイン（300枚以上）
  // ══════════════════════════════════════
  // ① ギャップアーチ（gap3拡大に対応）
  [{s:2000,e:2300},{s:3800,e:4100},{s:5600,e:6000}].forEach(({s,e})=>{
    for(let j=0;j<10;j++){const t=j/9;coinItems.push({x:s+t*(e-s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});}
  });
  // ② 城内コイン（ブロック上）
  [[100,H-7*TILE,4],[400,H-9*TILE,3],[1050,H-7*TILE,5],[2350,H-7*TILE,4],
   [4150,H-7*TILE,4],[6050,H-7*TILE,4]].forEach(([cx,cy,n])=>{
    for(let j=0;j<n;j++) coinItems.push({x:cx+j*32,y:cy,collected:false});});
  // ③ 地面ライン
  for(let j=0;j<18;j++) coinItems.push({x:200+j*100, y:H-3*TILE,collected:false}); // Z1
  for(let j=0;j<16;j++) coinItems.push({x:2350+j*90, y:H-3*TILE,collected:false}); // Z2
  for(let j=0;j<18;j++) coinItems.push({x:4150+j*80, y:H-3*TILE,collected:false}); // Z3
  for(let j=0;j<14;j++) coinItems.push({x:6050+j*55, y:H-3*TILE,collected:false}); // Z4(gap3拡大→Z4開始6000)
  // ④ クラスター：ギャップ際コイン群（旧④の退屈ラインを一部置換）
  // gap1(2000-2300)際：左端縦列クラスター
  [1960,1970,1980].forEach(cx=>[H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 9枚
  // gap3(5600-6000)際：両端リスクコイン（最終チャレンジ）
  [5560,5570,5580].forEach(cx=>[H-2*TILE,H-3*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 6枚 低空
  [6010,6020,6030].forEach(cx=>[H-10*TILE,H-11*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 6枚 超高空
  // ⑤ 新ブロック層コイン
  for(let j=0;j<3;j++) coinItems.push({x:1300+j*32,y:H-6*TILE,collected:false}); // H-4T addRow上
  for(let j=0;j<2;j++) coinItems.push({x:2700+j*32,y:H-8*TILE,collected:false}); // H-6T addRow上
  for(let j=0;j<2;j++) coinItems.push({x:4700+j*32,y:H-10*TILE,collected:false}); // H-8T addRow上
  for(let j=0;j<3;j++) coinItems.push({x:5300+j*32,y:H-6*TILE,collected:false}); // H-4T addRow上
  // ⑥ 高空コイン
  for(let j=0;j<10;j++) coinItems.push({x:500+j*150,  y:H-9*TILE,collected:false});
  for(let j=0;j<10;j++) coinItems.push({x:2500+j*130, y:H-9*TILE,collected:false});
  for(let j=0;j<10;j++) coinItems.push({x:4300+j*130, y:H-9*TILE,collected:false});
  for(let j=0;j<6;j++)  coinItems.push({x:6100+j*90,  y:H-9*TILE,collected:false});

  // チェックポイント（Z2後半・周辺300px: 3200〜3800禁止済み ✓）
  G.checkpoint={x:3500,y:H-TILE,reached:false};
  // ★ ハンマースーツ
  platforms.push({x:4400,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:1200,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:5500,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:2000,y:0,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:4000,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  piranhas.push({x:5524,baseY:3*TILE,y:3*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
}
