import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

// 7-1: 砦の入口 (Fortress Entrance)
// 暗闇ステージ入門・クリボー＆ノコノコのみ・ワープ土管×2
// Ground zones: Z1=0-800, Z1b=880-2200, Z2=2500-3800, Z3=4200-5500, Z4=5800-8000
export function buildLevel_7_1(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.waterMode=false;G.swimCooldown=0;G.iceMode=false;
  G.darkMode=true; // ★ 暗闇ステージ
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // 地面（砦の割れ目×4：gap1をマイクロ化、gap3を拡大）
  const gaps=[{s:800,e:880},{s:2200,e:2500},{s:3800,e:4200},{s:5500,e:5800}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ── 砦ブロック（石レンガ） ──
  addRow(350, H-5*TILE, 4,'brick'); // 350,382,414,446 → 末端478
  addRow(450, H-7*TILE, 3,'brick'); // 450,482,514 → 末端546
  addRow(1200, H-5*TILE, 2,'brick'); // 1200,1232 → 末端1264（ドッスン1280-1344の下にブロック置かない）
  addRow(1650, H-7*TILE, 3,'brick'); // 1650,1682,1714 → 末端1746
  addRow(2600, H-5*TILE, 4,'brick'); // 2600,2632,2664,2696 → 末端2728
  addRow(2950, H-7*TILE, 3,'brick'); // 2950,2982,3014 → 末端3046
  addRow(3300, H-5*TILE, 5,'brick'); // 3300,3332,3364,3396,3428 → 末端3460
  addRow(4200, H-5*TILE, 4,'brick'); // 4200,4232,4264,4296 → 末端4328
  addRow(4650, H-7*TILE, 3,'brick'); // 4650,4682,4714 → 末端4746
  addRow(5000, H-5*TILE, 4,'brick'); // 5000,5032,5064,5096 → 末端5128
  addRow(5900, H-5*TILE, 5,'brick'); // 5900,5932,5964,5996,6028 → 末端6060
  addRow(6300, H-7*TILE, 3,'brick'); // 6300,6332,6364 → 末端6396
  addRow(6750, H-5*TILE, 4,'brick'); // 6750,6782,6814,6846 → 末端6878
  addRow(7100, H-5*TILE, 3,'brick'); // 7100,7132,7164 → 末端7196
  // ── 砦ダンジョン追加層 ──
  addRow(1400, H-4*TILE, 3,'brick'); // 1400,1432,1464 → 末端1496（Z2内・低層）
  addRow(2850, H-6*TILE, 3,'brick'); // 2850,2882,2914 → 末端2946（Z3内・中層）
  addRow(4500, H-8*TILE, 2,'brick'); // 4500,4532 → 末端4564（Z4内・上層）
  addRow(6100, H-4*TILE, 3,'brick'); // 6100,6132,6164 → 末端6196（Z5内・低層）
  addStair(7250, 6);                 // 6段登り階段→フラッグポール前

  // ── ヨッシーブロック（オープニング）──
  platforms.push({x:200, y:H-5*TILE, w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0}); // 200<350(addRow) ✓

  // ── ? ブロック（addRowと (x,y) 重複なし確認済み）──
  // Z1
  platforms.push({x:290, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 290<350(addRow) ✓
  platforms.push({x:560, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 560>546 ✓
  // Z2
  platforms.push({x:1100, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1100<1200 ✓
  platforms.push({x:1376, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 1376>1344(ドッスン右端) ✓
  platforms.push({x:1760, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1760>1746 ✓
  // Z3
  platforms.push({x:2500, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2500<2600 ✓
  platforms.push({x:2740, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2740>2728 ✓
  platforms.push({x:3060, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 3060>3046 ✓
  platforms.push({x:3472, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3472>3460 ✓
  // Z4
  platforms.push({x:4100, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4100<4200 ✓
  platforms.push({x:4340, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4340>4328 ✓
  platforms.push({x:4760, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4760>4746 ✓
  platforms.push({x:5140, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 5140>5128 ✓
  // Z5
  platforms.push({x:5800, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 5800<5900 ✓
  platforms.push({x:6070, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6070>6060 ✓
  platforms.push({x:6410, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6410>6396 ✓
  platforms.push({x:6890, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 6890>6878 ✓
  platforms.push({x:7210, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 7210>7196 ✓

  // 隠し1UP
  platforms.push({x:200, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2700, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:5050, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6800, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // 土管（グラウンドゾーン内）
  pipes.push({x:380,  y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:2000, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:4900, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:6600, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  // ワープ土管（地下へ）
  pipes.push({x:1500, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0,isWarp:true,variant:'fortress1'});
  pipes.push({x:3200, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0,isWarp:true,variant:'fortress2'});
  // パックンフラワー（ワープ土管以外）
  pipes.forEach((p,i)=>{if(p.isWarp)return;piranhas.push({x:p.x+24,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5});});


  // 移動足場（ギャップ上・gap1はマイクロなので不要→gap3拡大分を補強）
  movingPlats.push({x:2300,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:2300,range:85,spd:1.5,prevX:2300});
  movingPlats.push({x:3950,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3950,range:100,spd:1.6,prevX:3950});
  movingPlats.push({x:5600,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5600,range:85,spd:1.7,prevX:5600});

  // 溶岩炎（ギャップ2・4）
  for(let fx=2210;fx<2490;fx+=40) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:45+((fx-2210)%3)*12,curH:0,phase:Math.floor((fx-2210)/40)*9,period:75+fx%25});
  for(let fx=5510;fx<5790;fx+=40) lavaFlames.push({x:fx,y:H-TILE,w:12,maxH:48+((fx-5510)%3)*12,curH:0,phase:Math.floor((fx-5510)/40)*9,period:80+fx%25});

  // ── 敵配置 ──
  // チェックポイント x=3600 から±300px離す: 3300〜3900 には敵を置かない

  // クリボー
  [500, 650, 1250, 1850, 2650, 3050,  4200, 4500, 5000, 5950, 6400, 6800, 7150].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,
      type:'goomba',state:'walk',walkFrame:0,walkTimer:0,onGround:false});
  });

  // ノコノコ
  [550, 1350, 2800, 4350, 5050, 6500].forEach(ex=>{
    enemies.push({x:ex,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1.3,vy:0,alive:true,
      type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // テレサ・ドッスン・キラーなし（暗闇ステージ入門のため）

  // ── コイン（300枚以上）──
  // ① ギャップアーチ（更新されたギャップに対応）
  [{s:800,e:880},{s:2200,e:2500},{s:3800,e:4200},{s:5500,e:5800}].forEach(({s,e})=>{
    for(let j=0;j<10;j++){const t=j/9;coinItems.push({x:s+t*(e-s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});}
  });
  // ② 高台上空コイン（addRowの上）
  [[150,H-7*TILE,4],[1200,H-7*TILE,4],[2600,H-7*TILE,4],[3300,H-7*TILE,5],
   [4200,H-7*TILE,4],[5900,H-7*TILE,5],[6750,H-7*TILE,4]
  ].forEach(([cx,cy,n])=>{for(let j=0;j<n;j++) coinItems.push({x:cx+j*32,y:cy,collected:false});});
  // ③ 地面ライン（各グラウンドゾーン・Z1拡大分追加）
  for(let j=0;j<16;j++) coinItems.push({x:120+j*40, y:H-3*TILE,collected:false}); // Z1(0-800+880-2200)
  for(let j=0;j<18;j++) coinItems.push({x:1130+j*60,y:H-3*TILE,collected:false}); // Z2
  for(let j=0;j<20;j++) coinItems.push({x:2530+j*62,y:H-3*TILE,collected:false}); // Z3
  for(let j=0;j<23;j++) coinItems.push({x:4230+j*54,y:H-3*TILE,collected:false}); // Z4(gap3拡大→開始位置調整)
  for(let j=0;j<30;j++) coinItems.push({x:5830+j*70,y:H-3*TILE,collected:false}); // Z5
  // ④ クラスター：ギャップ際の暗闇コイン群（旧④⑤の退屈ラインを置換）
  // gap2(2200-2500)際：左端クラスター
  [2160,2170,2180].forEach(cx=>[H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 9枚 縦列×3
  // gap3(3800-4200)際：右端クラスター
  [4210,4220,4230,4240].forEach(cx=>[H-2*TILE,H-3*TILE,H-4*TILE].forEach(cy=>coinItems.push({x:cx,y:cy,collected:false}))); // 12枚
  // gap4(5500-5800)際：両端リスクコイン
  [5460,5470,5480].forEach(cx=>coinItems.push({x:cx,y:H-2*TILE,collected:false})); // 3枚 超低空
  [5810,5820,5830].forEach(cx=>coinItems.push({x:cx,y:H-10*TILE,collected:false})); // 3枚 超高空
  // ⑤ ダンジョン層コイン（新ブロック上のご褒美）
  for(let j=0;j<3;j++) coinItems.push({x:1400+j*32,y:H-6*TILE,collected:false}); // H-4T addRow上
  for(let j=0;j<3;j++) coinItems.push({x:2850+j*32,y:H-8*TILE,collected:false}); // H-6T addRow上
  for(let j=0;j<3;j++) coinItems.push({x:6100+j*32,y:H-6*TILE,collected:false}); // H-4T addRow上
  // ⑥ 暗闘内散在コイン（旧④⑤の補完・高度にバラつき）
  for(let j=0;j<15;j++) coinItems.push({x:300+j*500,y:H-5*TILE,collected:false});
  for(let j=0;j<18;j++) coinItems.push({x:200+j*420,y:H-9*TILE,collected:false});
  // ⑦ 高空リスクコイン（H-11T）
  for(let j=0;j<6;j++) coinItems.push({x:1000+j*1100,y:H-11*TILE,collected:false});

  // チェックポイント（Z3の安全地帯）
  // 周辺±300px: 3300〜3900 に敵なし ✓（敵は 3050, 4200 のみ → 距離OK）
  G.checkpoint={x:3600,y:H-TILE,reached:false};

  // フラッグポール: デフォルト LW-500=7500（stair終端 7250+5*32=7410 の後 ✓）

  // ★ 暗闇モード有効化は buildLevel_7_1 冒頭で設定済み（G.darkMode=true）
  // ★ ハンマースーツ・巨大キノコ
  platforms.push({x:4400,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  platforms.push({x:2700,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:1300,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:4700,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
}
