import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW,BOWSER_STATS} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

// 7-3: 砦の玉座 (Fortress Throne)
// テレサ×5・ドッスン×4・クッパHP=5・ピーチ救出
// Ground zones: Z1=0-2000, Z2=2300-3700, Z3=4000-5500, Z4=5800-LW
export function buildLevel_7_3(){
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

  // 地面（玉座の深淵×3：gap2を100px拡大）
  const gaps=[{s:2000,e:2300},{s:3700,e:4100},{s:5500,e:5800}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ── 砦ブロック ──
  // Z1: 城入口〜前半
  addRow(350, H-5*TILE, 4,'brick'); // 350,382,414,446 → 末端478
  addRow(400, H-7*TILE, 3,'brick'); // 400,432,464 → 末端496
  addRow(736, H-9*TILE, 2,'brick'); // 736,768 → 末端800（ドッスン650-714の下にブロック置かない）
  addRow(1050,H-5*TILE, 5,'brick'); // 1050,1082,1114,1146,1178 → 末端1210
  addRow(1500,H-7*TILE, 3,'brick'); // 1500,1532,1564 → 末端1596
  addRow(1800,H-5*TILE, 4,'brick'); // 1800,1832,1864,1896 → 末端1928
  // Z2: 中盤
  addRow(2350,H-5*TILE, 3,'brick'); // 2350,2382,2414 → 末端2446（ドッスン2450-2514の下にブロック置かない）
  addRow(2750,H-7*TILE, 3,'brick'); // 2750,2782,2814 → 末端2846
  addRow(3050,H-5*TILE, 4,'brick'); // 3050,3082,3114,3146 → 末端3178
  addRow(3400,H-7*TILE, 3,'brick'); // 3400,3432,3464 → 末端3496
  // Z3: 後半（gap2拡大→Z3開始は4100）
  addRow(4250,H-5*TILE, 2,'brick'); // 4250,4282 → 末端4314（ドッスン4150-4214の右側に退避）
  addRow(4450,H-7*TILE, 3,'brick'); // 4450,4482,4514 → 末端4546
  addRow(4800,H-5*TILE, 4,'brick'); // 4800,4832,4864,4896 → 末端4928
  addRow(5200,H-7*TILE, 3,'brick'); // 5200,5232,5264 → 末端5296
  addRow(5350,H-5*TILE, 3,'brick'); // 5350,5382,5414 → 末端5446
  // ── 砦追加層 ──
  addRow(3100, H-6*TILE, 3,'brick'); // 3100,3132,3164 → 末端3196（Z2内・中層。既存3050 H-5Tと干渉なし）
  // Z4: アリーナ手前〜大階段
  addRow(5860,H-5*TILE, 4,'brick'); // 5860,5892,5924,5956 → 末端5988
  addRow(6150,H-7*TILE, 3,'brick'); // 6150,6182,6214 → 末端6246
  addRow(6400,H-5*TILE, 3,'brick'); // 6400,6432,6464 → 末端6496
  // 大型上り階段（クッパアリーナへ）
  addStair(6500, 10);               // stair: 6500〜6788。右端 6820
  G.stairSealX=6756;

  // アリーナ壁（7ブロック高 > クッパジャンプ上限144px）
  for(let wy=H-8*TILE;wy<H-TILE;wy+=TILE){addB(6820,wy,'brick');addB(6852,wy,'brick');}

  // ── ヨッシーブロック（オープニング）──
  platforms.push({x:200, y:H-5*TILE, w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0}); // 200<350(addRow) ✓

  // ── ? ブロック（addRowと座標重複なし確認済み）──
  // Z1
  platforms.push({x:290, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 290<350(addRow) ✓
  platforms.push({x:510, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 510>496 ✓
  platforms.push({x:810, y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 810>796 ✓
  platforms.push({x:1220,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 1220>1210 ✓
  platforms.push({x:1610,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1610>1596 ✓
  platforms.push({x:1940,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1940>1928 ✓
  // Z2
  platforms.push({x:2520,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2520>2514(ドッスン右端) ✓
  platforms.push({x:2860,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2860>2846 ✓
  platforms.push({x:3190,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 3190>3178 ✓
  platforms.push({x:3510,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3510>3496 ✓
  // Z3
  platforms.push({x:4326,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4326>4314(新addRow末端) ✓
  platforms.push({x:4560,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4560>4546 ✓
  platforms.push({x:4940,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4940>4928 ✓
  platforms.push({x:5310,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5310>5296 ✓
  platforms.push({x:5460,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 5460>5446 ✓
  // Z4
  platforms.push({x:6000,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6000>5988 ✓
  platforms.push({x:6260,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6260>6246 ✓
  // アリーナ内 ? ブロック（壁右側）
  platforms.push({x:6980,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:7300,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});

  // 隠し1UP
  platforms.push({x:600,  y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2400, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4256, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0}); // 4256>4214(ドッスン右端) ✓
  platforms.push({x:6100, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // 土管（パックン付き）
  pipes.push({x:300,  y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:1350, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:2500, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:4500, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  piranhas.push({x:pipes[0].x+24,baseY:pipes[0].y,y:pipes[0].y,w:16,h:TILE,phase:0,  alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[1].x+24,baseY:pipes[1].y,y:pipes[1].y,w:16,h:TILE,phase:1.5,alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[2].x+24,baseY:pipes[2].y,y:pipes[2].y,w:16,h:TILE,phase:3.0,alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[3].x+24,baseY:pipes[3].y,y:pipes[3].y,w:16,h:TILE,phase:4.5,alive:true,maxUp:TILE*1.5});

  // キャノン（4基）
  cannons.push({x:500,  y:H-TILE*2,w:TILE,h:TILE*2,fireRate:280,timer:20});
  cannons.push({x:1700, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:260,timer:80});
  cannons.push({x:2800, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:280,timer:50});
  cannons.push({x:4800, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:260,timer:120});

  // 移動足場（深淵越え）
  movingPlats.push({x:2060,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:2060,range:80, spd:1.6,prevX:2060});
  movingPlats.push({x:3850,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3850,range:100,spd:1.8,prevX:3850});
  movingPlats.push({x:5560,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5560,range:80, spd:2.0,prevX:5560});

  // 溶岩炎（全ギャップ）
  for(let fx=2010;fx<2290;fx+=38) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:52+((fx-2010)%3)*14,curH:0,phase:Math.floor((fx-2010)/38)*9,period:75+fx%22});
  for(let fx=3710;fx<4090;fx+=38) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:54+((fx-3710)%3)*14,curH:0,phase:Math.floor((fx-3710)/38)*9,period:78+fx%20});
  for(let fx=5510;fx<5790;fx+=38) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:56+((fx-5510)%3)*14,curH:0,phase:Math.floor((fx-5510)/38)*9,period:80+fx%22});

  // ── 敵配置 ──
  // チェックポイント x=3600 から±300px: 3300〜3900 には敵を置かない

  // カロン（砦の守護者・チェックポイント±300外）
  [600, 1200, 2000, 2800, 4200, 5000, 5800, 6200].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE*0.9,vx:-1.2,vy:0,alive:true,type:'dryBones',state:'walk',walkFrame:0,walkTimer:0,onGround:false,collapseTimer:0});
  });

  // ノコノコ（城内巡回）
  [550, 900, 1400, 1900, 2500, 3000, 4100, 4700, 5100, 5900, 6670].forEach(ex=>{
    enemies.push({x:ex,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1.3,vy:0,alive:true,
      type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // ハンマーブロス（2体）
  enemies.push({x:1600,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:80+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false});
  enemies.push({x:5050,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:100+Math.floor(Math.random()*80),onGround:false});

  // テレサ×5（activated:true で即追跡開始）
  [{x:500, y:H-6*TILE},{x:1200,y:H-5*TILE},{x:2800,y:H-5*TILE},
   {x:4600,y:H-6*TILE},{x:5700,y:H-5*TILE}].forEach(({x,y})=>{
    enemies.push({x,y,w:28,h:28,vx:-0.5,vy:0.3,alive:true,type:'teresa',hiding:false,activated:true});
  });

  // ドッスン×4（天井から落下）
  enemies.push({x: 650, y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
  enemies.push({x:1300, y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
  enemies.push({x:1364, y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
  enemies.push({x:2450, y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
  enemies.push({x:4150, y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});

  // ── コイン ──
  // ① ギャップアーチ（更新されたギャップに対応）
  [{s:2000,e:2300},{s:3700,e:4100},{s:5500,e:5800}].forEach(({s,e})=>{
    for(let j=0;j<10;j++){const t=j/9;coinItems.push({x:s+t*(e-s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});}
  });
  // ② 城内コイン（高台上）
  [[100,H-7*TILE,4],[400,H-9*TILE,3],[1050,H-7*TILE,5],[2350,H-7*TILE,4],
   [4250,H-7*TILE,4],[5860,H-7*TILE,4]].forEach(([cx,cy,n])=>{
    for(let j=0;j<n;j++) coinItems.push({x:cx+j*32,y:cy,collected:false});});
  // ③ 地面ライン
  for(let j=0;j<18;j++) coinItems.push({x:200+j*100, y:H-3*TILE,collected:false}); // Z1前半
  for(let j=0;j<16;j++) coinItems.push({x:2350+j*84, y:H-3*TILE,collected:false}); // Z2
  for(let j=0;j<17;j++) coinItems.push({x:4130+j*86, y:H-3*TILE,collected:false}); // Z3(gap2拡大→開始位置調整)
  for(let j=0;j<16;j++) coinItems.push({x:5860+j*38, y:H-3*TILE,collected:false}); // Z4前半
  // ③-b クラスター：ギャップ際リスクコイン（旧③の退屈な等間隔ラインから分離）
  // gap1(2000-2300)際：縦列クラスター
  [1960,1970,1980].forEach(cx=>[H-2*TILE,H-3*TILE,H-4*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 9枚
  // gap2(3700-4100)際：右端リスクコイン
  [4110,4120].forEach(cx=>[H-2*TILE,H-3*TILE,H-10*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 6枚
  // ③-c 新ブロック層コイン
  for(let j=0;j<3;j++) coinItems.push({x:3100+j*32,y:H-8*TILE,collected:false}); // H-6T addRow上

  // チェックポイント（Z2の安全地帯・周辺300px: 3300〜3900禁止済み ✓）
  G.checkpoint={x:3600,y:H-TILE,reached:false};

  // ── クッパ（offscreen 登場パターン）──
  // addStair(6500, 10) → 最右端: 6500+9*32=6788。壁は 6820,6852
  G.bowserArenaX=6755;G.checkpoint2={x:6350,y:H-TILE,reached:false}; // 階段頂上付近（6788-33）
  G.bowserLeftX=6886;  // 壁右端+2（6820+64+2）
  const _bs=BOWSER_STATS[7];Object.assign(bowser,{
    alive:true,x:9000,y:H-TILE-bowser.h,w:64,h:72,
    hp:_bs.hp,maxHp:_bs.hp,vx:-_bs.speed,vy:0,facing:-1,
    hurtTimer:0,fireTimer:_bs.fireTimer,jumpTimer:_bs.jumpTimer,
    onGround:false,state:'offscreen',deadTimer:0,fireImmune:_bs.fireImmune,phase:1,phaseTransition:0
  });

  // ピーチ（クッパ撃破後に自動スポーン）
  // ★ ハンマースーツ
  platforms.push({x:4400,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:1200,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:5500,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:2200,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  pipes.push({x:4000,y:0,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  piranhas.push({x:5524,baseY:3*TILE,y:3*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
  // 暗闇モード（テレサ + ドッスン in 暗闇 — スポットライトのみ）
  G.darkMode=true;
}
