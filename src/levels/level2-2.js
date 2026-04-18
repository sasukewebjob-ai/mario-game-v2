import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_2_2(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  peach.alive=false;G.peachChase=null;G.sandstormMode=true;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // 地面（ギャップ3つ、2-1より難しめ）
  const gaps=[{s:2400,e:2480},{s:4200,e:4400},{s:5900,e:6200}];
  for(let x=0;x<LW;x+=TILE)if(!gaps.some(g=>x>=g.s&&x<g.e))
    platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Zone 1 (0-1500)
  // x=200: yoshiEgg（スタート地点）
  platforms.push({x:200,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
  // x=300: hasMush（pushのみ）, x=332-396: addRow
  addRow(332,H-6*TILE,3,'brick');
  addRow(650,H-5*TILE,3,'brick');
  // x=950: hasMush（pushのみ）, x=982-1014: addRow
  addRow(982,H-8*TILE,2,'q');
  addRow(1200,H-5*TILE,4,'brick');

  // Zone 2 (1500-2400)
  addRow(1500,H-5*TILE,3,'brick');
  // x=1700: coinBlock（pushのみ）, x=1732-1764: addRow
  addRow(1732,H-9*TILE,2,'q');
  addRow(1950,H-6*TILE,3,'brick');
  addRow(2200,H-5*TILE,2,'brick');
  // Gap: 2400-2600

  // Zone 3 (2600-4200)
  addRow(2650,H-5*TILE,4,'brick');
  // x=2900: hasStar（pushのみ）, x=2932-2964: addRow
  addRow(2932,H-7*TILE,2,'q');
  addRow(3200,H-5*TILE,3,'brick');
  addRow(3450,H-9*TILE,4,'brick');
  addRow(3700,H-5*TILE,3,'brick');
  // Gap: 4200-4400

  // Zone 4 (4400-5900)
  addRow(4450,H-5*TILE,4,'brick');
  // x=4700: hidden 1UP（pushのみ）, x=4732-4796: addRow
  addRow(4732,H-8*TILE,3,'q');
  addRow(5000,H-5*TILE,3,'brick');
  // x=5200: hasMush（pushのみ）, x=5232-5264: addRow
  addRow(5232,H-7*TILE,2,'brick');
  addRow(5600,H-5*TILE,3,'brick');
  // Gap: 5900-6100

  // Zone 5 (6100-7500)
  addRow(6150,H-5*TILE,4,'brick');
  // x=6400: hasMush（pushのみ）, x=6432-6464: addRow
  addRow(6432,H-8*TILE,2,'q');
  addRow(6700,H-5*TILE,4,'brick');
  // Block height variety (desert)
  addRow(500,H-3*TILE,2,'g');addRow(1400,H-8*TILE,2,'brick');
  addRow(3100,H-3*TILE,3,'g');addRow(4900,H-8*TILE,2,'brick');
  addStair(7100,7);

  // 特殊ブロック（pushのみ、addRowと座標重複なし）
  platforms.push({x:300,y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:950,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1700,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
  platforms.push({x:2900,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:4700,y:H-8*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6400,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});

  // パイプ（ワープ2本 desert3/desert4、通常2本）
  [[800,2,'desert3'],[2100,3,false],[3800,2,'fallDesert2'],[5700,2,false]].forEach(([px,ph,warp])=>{
    pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
  pipes.forEach((p,i)=>{if(p.isWarp)return;
    piranhas.push({x:p.x+24,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});

  // コイン
  // Desert clusters near gap edges
  [{x:2300,y:H-3*TILE},{x:2330,y:H-4*TILE},{x:2360,y:H-3*TILE},{x:2390,y:H-5*TILE}].forEach(c=>coinItems.push({...c,collected:false})); // cluster before gap1
  [{x:4100,y:H-4*TILE},{x:4100,y:H-5*TILE},{x:4100,y:H-6*TILE}].forEach(c=>coinItems.push({...c,collected:false})); // vertical column before gap2
  [{x:4410,y:H-3*TILE},{x:4440,y:H-4*TILE},{x:4470,y:H-3*TILE}].forEach(c=>coinItems.push({...c,collected:false})); // cluster after gap2
  [{x:5880,y:H-4*TILE},{x:5880,y:H-5*TILE},{x:5880,y:H-6*TILE}].forEach(c=>coinItems.push({...c,collected:false})); // vertical column before gap3
  // Risk coins
  [{x:1600,y:H-11*TILE},{x:1630,y:H-11*TILE},{x:3600,y:H-2*TILE},{x:3630,y:H-2*TILE}].forEach(c=>coinItems.push({...c,collected:false}));
  // Trail coins near warp pipes
  for(let j=0;j<4;j++)coinItems.push({x:770+j*28,y:H-3*TILE,collected:false});
  for(let j=0;j<4;j++)coinItems.push({x:3770+j*28,y:H-3*TILE,collected:false});
  // Spread coins + gap arches
  for(let i=0;i<30;i++)coinItems.push({x:180+i*240,y:H-8*TILE,collected:false});
  gaps.forEach(g=>{const cx=(g.s+g.e)/2;for(let j=0;j<8;j++){const a=Math.PI*j/7;coinItems.push({x:cx-50+j*14,y:H-5*TILE-Math.sin(a)*60,collected:false})}});
  // Extra coins to reach 300+
  for(let i=0;i<230;i++)coinItems.push({x:100+i*34,y:H-6*TILE,collected:false});

  // 通常敵（2-1より密度高め）
  [{x:350,t:'goomba'},{x:500,t:'goomba'},{x:750,t:'koopa'},
   {x:1000,t:'goomba'},{x:1100,t:'goomba'},{x:1350,t:'koopa'},
   {x:1550,t:'goomba'},{x:1650,t:'goomba'},{x:1850,t:'koopa'},{x:2050,t:'goomba'},{x:2250,t:'goomba'},
   {x:2700,t:'goomba'},{x:2800,t:'goomba'},{x:3000,t:'koopa'},{x:3250,t:'goomba'},{x:3300,t:'goomba'},{x:3550,t:'koopa'},{x:3680,t:'goomba'},{x:4320,t:'goomba'},
   {x:4500,t:'goomba'},{x:4650,t:'goomba'},{x:4750,t:'koopa'},{x:5050,t:'goomba'},{x:5150,t:'goomba'},{x:5300,t:'koopa'},{x:5650,t:'goomba'},{x:5800,t:'goomba'},
   {x:6200,t:'goomba'},{x:6350,t:'goomba'},{x:6500,t:'koopa'},{x:6600,t:'goomba'},{x:6750,t:'goomba'},{x:6900,t:'koopa'},{x:7050,t:'goomba'}
  ].forEach(({x,t})=>{
    if(t==='parakoopa'){const by=H-5*TILE;enemies.push({x,y:by,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:by,phase:Math.random()*Math.PI*2,shellTimer:0,walkFrame:0,walkTimer:0})}
    else enemies.push({x,y:H-2*TILE,w:TILE,h:t==='koopa'?TILE*1.2:TILE,vx:-1.5,vy:0,alive:true,type:t,state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
  });

  // パラクーパは削除（敵密度調整）

  // 飛び跳ねるブロック（12体、2-1より多め）
  [{x:450},{x:900},{x:1450},{x:2000},{x:2700},{x:3300},{x:4000},{x:4600},{x:5100},{x:5700},{x:6300},{x:6800}].forEach(({x})=>{
    jumpBlocks.push({x,y:H-2*TILE,w:28,h:28,vx:-1.5,vy:0,onGround:true,jumpTimer:60+Math.floor(Math.random()*40),alive:true});
  });

  // パイポ（14体、2-1より多め）
  [{x:600},{x:1100},{x:1600},{x:2300},{x:2850},{x:3150},{x:3600},{x:4050},{x:4550},{x:5050},{x:5450},{x:5850},{x:6250},{x:6750}].forEach(({x})=>{
    pipos.push({x,y:H-2*TILE-22,w:22,h:22,vx:-1.8,vy:-6,alive:true,bounceCount:0});
  });

  // ワンワン（2体）
  [{x:1800},{x:5300}].forEach(({x})=>{
    chainChomps.push({x,y:H-TILE-36,w:36,h:36,postX:x,postY:H-TILE-36,
      vx:0,vy:0,phase:Math.random()*Math.PI*2,state:'idle',lungeTimer:0,alive:true});
  });

  // 移動足場（各ギャップに1つ、速度上げ）
  movingPlats.push({x:2450,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:2450,range:70,spd:1.8});
  movingPlats.push({x:4250,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:4250,range:70,spd:2.0});
  movingPlats.push({x:5950,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:5950,range:70,spd:2.2});

  // おこりんぼ太陽（砂漠の空・チェックポイント±300外）
  [{x:600,y:TILE*2},{x:2000,y:TILE*2},{x:5000,y:TILE*2},{x:6700,y:TILE*2}
  ].forEach(d=>enemies.push({x:d.x,y:d.y,w:32,h:32,vx:0,vy:0,type:'angrySun',alive:true,state:'orbit'}));

  // チェックポイント
  G.checkpoint={x:4000,y:H-TILE,reached:false};
// ★ ハンマースーツ・巨大キノコ
platforms.push({x:4700,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
platforms.push({x:1800,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
// ★ 装飾土管
pipes.push({x:3300,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
pipes.push({x:5500,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:2000,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:4000,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
piranhas.push({x:5524,baseY:6*TILE,y:6*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
pipes.push({x:1050,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:2700,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
// 上空パタパタは削除（敵密度調整）

// ★ 新敵（CP後・赤パタパタ水平飛行）
enemies.push({x:5150,y:H-5*TILE,w:TILE,h:TILE*1.2,vx:1.8,vy:0,alive:true,type:'parakoopaR',state:'walk',flying:true,baseX:5150,baseY:H-5*TILE,range:100,shellTimer:0,walkFrame:0,walkTimer:0,facing:1});
// ★ ボム兵（CP後）
enemies.push({x:4400,y:H-2*TILE,w:TILE,h:TILE,vx:-1.2,vy:0,alive:true,type:'bobomb',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1,litTimer:0});
// ★ ポケッキー（CP後・砂漠サボテン）
enemies.push({x:5700,y:H-4*TILE,w:TILE,h:TILE*3,vx:-0.8,vy:0,alive:true,type:'pokey',state:'walk',segments:3,walkFrame:0,walkTimer:0,onGround:false,facing:-1});

// ピノキオ部屋ワープ天井パイプ（1ステージに1本）
pipes.push({x:3400,y:0,w:TILE*2,h:8*TILE,bounceOffset:0,isWarp:true,ceiling:true,variant:'pinocchio'});
}
