import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

// 8-2: 空中艦隊 (Airship Fleet)
// 強制スクロール(1.0) + 4隻の飛行船 + キャノン×6 + ハンマーブロス×2
// Ground zones (ship decks):
//   Ship A: Z1=0-900
//   Gap1: 900-1100
//   Ship B: Z2=1100-2100
//   Gap2: 2100-2350
//   Ship C: Z3=2350-3500
//   Gap3: 3500-3700
//   Ship D: Z4=3700-4500
//   Gap4: 4500-4700
//   Landing: Z5=4700-5500 (warp pipe)
export function buildLevel_8_2(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.waterMode=false;G.swimCooldown=0;G.iceMode=false;
  peach.alive=false;G.peachChase=null;bowser.alive=false;
  G.bowserRightX=0;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;
  G.autoScroll=1.0;
  flagPole.x=LW+1000; // flagPole無効化

  // 地面（船の甲板）
  const gaps=[{s:900,e:1100},{s:2100,e:2350},{s:3500,e:3700},{s:4500,e:4700}];
  for(let x=0;x<5500;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // ── 船A (0-900): 小型偵察船 ──
  addRow(350, H-5*TILE, 3,'brick'); // 350-446
  addRow(600, H-7*TILE, 2,'brick'); // 600-664

  // ── 船B (1100-2100): 中型戦闘船 ──
  addRow(1150,H-5*TILE, 4,'brick'); // 1150-1278
  addRow(1450,H-7*TILE, 3,'brick'); // 1450-1546
  addRow(1700,H-5*TILE, 4,'brick'); // 1700-1828
  addRow(1950,H-7*TILE, 2,'brick'); // 1950-2014

  // ── 船C (2350-3500): 重装甲艦 ──
  addRow(2400,H-5*TILE, 5,'brick'); // 2400-2560
  addRow(2700,H-7*TILE, 3,'brick'); // 2700-2796
  addRow(2950,H-5*TILE, 4,'brick'); // 2950-3078
  addRow(3200,H-7*TILE, 3,'brick'); // 3200-3296
  addRow(3350,H-5*TILE, 3,'brick'); // 3350-3446

  // ── 船D (3700-4500): 司令船 ──
  addRow(3750,H-5*TILE, 4,'brick'); // 3750-3878
  addRow(4000,H-7*TILE, 3,'brick'); // 4000-4096
  addRow(4200,H-5*TILE, 4,'brick'); // 4200-4328

  // ── Landing (4700-5500): 着陸甲板 ──
  addRow(4750,H-5*TILE, 3,'brick'); // 4750-4846
  addRow(5050,H-5*TILE, 2,'brick'); // 5050-5114

  // ── ヨッシーブロック ──
  platforms.push({x:200, y:H-5*TILE, w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});

  // ── ? ブロック ──
  // Ship A
  platforms.push({x:460, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 460>446 ✓
  platforms.push({x:680, y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 680>664 ✓
  // Ship B
  platforms.push({x:1290,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1290>1278 ✓
  platforms.push({x:1560,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1560>1546 ✓
  platforms.push({x:1840,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 1840>1828 ✓
  platforms.push({x:2030,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 2030>2014 ✓
  // Ship C
  platforms.push({x:2580,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2580>2560 ✓
  platforms.push({x:2810,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 2810>2796 ✓
  platforms.push({x:3090,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3090>3078 ✓
  platforms.push({x:3310,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 3310>3296 ✓
  // Ship D
  platforms.push({x:3890,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 3890>3878 ✓
  platforms.push({x:4110,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4110>4096 ✓
  platforms.push({x:4340,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0}); // 4340>4328 ✓
  // Landing
  platforms.push({x:4860,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0}); // 4860>4846 ✓

  // 隠し1UP
  platforms.push({x:500,  y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:1600, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2800, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4100, y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // ── 移動足場（ギャップ越え）──
  movingPlats.push({x: 950,y:H-3*TILE,w:TILE*2,h:12,type:'h',ox: 950,range:55, spd:1.6,prevX: 950});
  movingPlats.push({x:2150,y:H-3*TILE,w:TILE*2,h:12,type:'h',ox:2150,range:65, spd:1.8,prevX:2150});
  movingPlats.push({x:3550,y:H-3*TILE,w:TILE*2,h:12,type:'h',ox:3550,range:55, spd:2.0,prevX:3550});
  movingPlats.push({x:4550,y:H-3*TILE,w:TILE*2,h:12,type:'h',ox:4550,range:60, spd:1.8,prevX:4550});

  // ── キャノン（6基）──
  cannons.push({x:400,  y:H-TILE*2,w:TILE,h:TILE*2,fireRate:260,timer:30});
  cannons.push({x:800,  y:H-TILE*2,w:TILE,h:TILE*2,fireRate:240,timer:100});
  cannons.push({x:1600, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:230,timer:50});
  cannons.push({x:2600, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:220,timer:80});
  cannons.push({x:3400, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:230,timer:120});
  cannons.push({x:4300, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:240,timer:60});

  // ── 土管（パックン付き）──
  pipes.push({x:650,  y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:1800, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:3100, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  pipes.push({x:4100, y:H-3*TILE,w:TILE*2,h:TILE*2,bounceOffset:0});
  piranhas.push({x:pipes[0].x+8,baseY:pipes[0].y,y:pipes[0].y,w:16,h:TILE,phase:0,  alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[1].x+8,baseY:pipes[1].y,y:pipes[1].y,w:16,h:TILE,phase:1.5,alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[2].x+8,baseY:pipes[2].y,y:pipes[2].y,w:16,h:TILE,phase:3.0,alive:true,maxUp:TILE*1.5});
  piranhas.push({x:pipes[3].x+8,baseY:pipes[3].y,y:pipes[3].y,w:16,h:TILE,phase:4.5,alive:true,maxUp:TILE*1.5});

  // ── ワープパイプ手前のブロック壁（落下防止）──
  for(let wy=H-6*TILE;wy<H-TILE;wy+=TILE){addB(5120,wy,'brick');addB(5152,wy,'brick');}
  for(let bx=5184;bx<=5264;bx+=TILE) addB(bx,H-2*TILE,'brick');

  // ── ワープパイプ（ゴールへ）──
  pipes.push({x:5200,y:H-TILE*2-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:true,variant:'airship_goal2'});

  // ── 敵配置 ──
  // チェックポイント x=3000 から±300px: 2700〜3300 には敵を置かない

  // ノコノコ ×6
  [500, 1200, 1500, 2500, 3400, 4200].forEach(ex=>{
    enemies.push({x:ex,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1.3,vy:0,alive:true,
      type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // メット（buzzy）×5
  [600, 1400, 2400, 3350, 4400].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE*0.85,vx:-1.8,vy:0,alive:true,
      type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false});
  });

  // ハンマーブロス×2
  enemies.push({x:1900,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:80+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false});
  enemies.push({x:4000,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5,vy:0,alive:true,
    type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,
    hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:100+Math.floor(Math.random()*80),onGround:false});

  // 飛びノコノコ（ギャップ上空）
  [{x:960,baseY:H-4*TILE,phase:0},{x:2200,baseY:H-5*TILE,phase:1.0},
   {x:3580,baseY:H-4*TILE,phase:0.5},{x:4580,baseY:H-5*TILE,phase:1.5}].forEach(({x,baseY,phase})=>{
    enemies.push({x,y:baseY,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,
      type:'parakoopa',flying:true,baseY,phase,
      state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1});
  });

  // ── コイン ──
  // ① ギャップアーチ（各10枚 × 4 = 40枚）
  [{s:900,e:1100},{s:2100,e:2350},{s:3500,e:3700},{s:4500,e:4700}].forEach(({s,e})=>{
    for(let j=0;j<10;j++){const t=j/9;coinItems.push({x:s+t*(e-s)-8,y:H-4*TILE-Math.sin(t*Math.PI)*TILE*2,collected:false});}
  });
  // ② 甲板上コイン
  for(let j=0;j<10;j++) coinItems.push({x:100+j*80,  y:H-3*TILE,collected:false});  // Ship A
  for(let j=0;j<12;j++) coinItems.push({x:1120+j*80, y:H-3*TILE,collected:false}); // Ship B
  for(let j=0;j<14;j++) coinItems.push({x:2370+j*80, y:H-3*TILE,collected:false}); // Ship C
  for(let j=0;j<10;j++) coinItems.push({x:3720+j*76, y:H-3*TILE,collected:false}); // Ship D
  for(let j=0;j<8;j++)  coinItems.push({x:4720+j*70, y:H-3*TILE,collected:false}); // Landing
  // ③ ブロック上ライン
  for(let j=0;j<8;j++)  coinItems.push({x:380+j*60,  y:H-7*TILE,collected:false});
  for(let j=0;j<10;j++) coinItems.push({x:1200+j*90, y:H-7*TILE,collected:false});
  for(let j=0;j<12;j++) coinItems.push({x:2450+j*85, y:H-7*TILE,collected:false});
  for(let j=0;j<8;j++)  coinItems.push({x:3780+j*85, y:H-7*TILE,collected:false});
  // ④ 高空コイン
  for(let j=0;j<6;j++)  coinItems.push({x:400+j*120, y:H-9*TILE,collected:false});
  for(let j=0;j<8;j++)  coinItems.push({x:1300+j*100,y:H-9*TILE,collected:false});
  for(let j=0;j<10;j++) coinItems.push({x:2500+j*100,y:H-9*TILE,collected:false});
  for(let j=0;j<6;j++)  coinItems.push({x:3800+j*110,y:H-9*TILE,collected:false});

  // チェックポイント（Ship C中央・周辺300px: 2700〜3300禁止済み ✓）
  G.checkpoint={x:3000,y:H-TILE,reached:false};
  // ★ ハンマースーツ
  platforms.push({x:4400,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:800,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:3600,y:0,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false,ceiling:true});
}
