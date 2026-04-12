import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW,BOWSER_STATS} from '../globals.js';
import {addB,addRow,addStair} from '../builders.js';

export function buildLevel_5_3(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;
  G.autoScroll=0;G.waterMode=false;G.swimCooldown=0;
  peach.alive=false;G.peachChase=null;
  yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // 地面（溶岩穴3か所）
  const gaps=[{s:2000,e:2320},{s:3700,e:3920},{s:5400,e:5630}]; // ★ gap1 widened by 100px
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // 城内ブロック
  addRow(0,   H-5*TILE, 3,'brick');
  addRow(300, H-5*TILE, 4,'brick');
  addRow(550, H-9*TILE, 3,'brick');
  addRow(900, H-7*TILE, 3,'brick');
  addRow(1200,H-5*TILE, 5,'brick');
  addRow(1650,H-7*TILE, 3,'brick');
  addRow(2300,H-5*TILE, 4,'brick');
  addRow(2300,H-9*TILE, 3,'brick');
  addRow(2750,H-7*TILE, 3,'brick');
  addRow(3100,H-5*TILE, 4,'brick');
  addRow(4000,H-5*TILE, 4,'brick');
  addRow(4000,H-9*TILE, 3,'brick');
  addRow(4400,H-7*TILE, 3,'brick');
  addRow(4800,H-5*TILE, 4,'brick');
  addRow(5100,H-7*TILE, 3,'brick');
  addRow(5700,H-5*TILE, 4,'brick');
  addRow(5700,H-9*TILE, 3,'brick');
  addRow(6100,H-7*TILE, 3,'brick');
  addRow(6400,H-5*TILE, 4,'brick');

  // ★ Block Height Variety
  addRow(500, H-4*TILE, 3,'brick');   // 前半 低空
  addRow(1500,H-6*TILE, 3,'brick');   // 前半 中空
  addRow(3500,H-4*TILE, 3,'brick');   // 中盤 低空
  addRow(5000,H-6*TILE, 3,'brick');   // 後半 中空

  // 大型上り階段（10段）— クッパアリーナへ
  addStair(6600,10);

  // 移動足場（溶岩穴）
  movingPlats.push({x:2050,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:2050,range:80,spd:1.6,prevX:2050});
  movingPlats.push({x:3750,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3750,range:90,spd:1.8,prevX:3750});
  movingPlats.push({x:5450,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5450,range:85,spd:2.0,prevX:5450});

  // キャノン（発射間隔半分）
  cannons.push(
    {x:650, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:20},
    {x:1700,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:60},
    {x:3000,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:100},
    {x:4700,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:140},
    {x:6000,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:40}
  );

  // 敵
  [{x:700, t:'koopa'},{x:950, t:'goomba'},{x:1300,t:'koopa'},
   {x:1550,t:'goomba'},{x:2350,t:'koopa'},{x:2600,t:'goomba'},
   {x:2850,t:'koopa'},{x:3150,t:'goomba'},{x:4320,t:'koopa'},
   {x:4350,t:'goomba'},{x:4600,t:'koopa'},{x:4850,t:'goomba'},
   {x:5750,t:'koopa'},{x:6000,t:'goomba'},{x:6770,t:'koopa'}
  ].forEach(({x,t})=>{
    let e;
    if(t==='goomba') e={x,y:H-2*TILE,w:TILE,h:TILE,       vx:-1,vy:0,alive:true,type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false};
    else             e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1,vy:0,alive:true,type:'koopa', state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1};
    if(e) enemies.push(e);
  });

  // 特殊ブロック
  platforms.push({x:200, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:600, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1000,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:1400,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2464,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2848,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3200,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:4160,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4500,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4900,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5100,y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:5800,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6150,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  // かくし1UP
  platforms.push({x:450, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:1100,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:3050,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4700,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6300,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // ヨッシーブロック（2個）
  platforms.push({x:1800,y:H-7*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
  platforms.push({x:4500,y:H-7*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});

  // キノコブロック追加
  platforms.push({x:750, y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1900,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3600,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5500,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});

  // ハンマーブロス（1体）
  enemies.push({x:3400,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5+Math.random(),vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false});

  // ワンワン（1体）
  chainChomps.push({x:5000,y:H-TILE-36,w:36,h:36,postX:5000,postY:H-TILE-36,vx:0,vy:0,phase:0,state:'idle',lungeTimer:0,alive:true});

  // コイン（クラスター + 縦列 + リスクコイン）
  // ★ Coin Clusters near gap edges
  [2010,2040,2080,2120,2160].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  [3710,3740,3770,3810,3850].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  [5410,5450,5490,5530,5570].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  // Vertical columns
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:800,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:2600,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:4300,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:5900,y:cy,collected:false}));

  // カロン（城内守護者・チェックポイント±300外）
  [600, 1200, 2000, 2800, 4500, 5200, 6000].forEach(ex=>{
    enemies.push({x:ex,y:H-2*TILE,w:TILE,h:TILE*0.9,vx:-1.2,vy:0,alive:true,type:'dryBones',state:'walk',walkFrame:0,walkTimer:0,onGround:false,collapseTimer:0});
  });

  // チェックポイント
  G.checkpoint={x:4000,y:H-TILE,reached:false};

  // アリーナ壁（7ブロック高）
  for(let wy=H-8*TILE;wy<H-TILE;wy+=TILE){addB(6920,wy,'brick');addB(6952,wy,'brick');}
  // アリーナ内 ? ブロック
  platforms.push({x:7060,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:7300,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});

  // クッパ — HP=5+、最終ボス
  G.bowserArenaX=6855;G.checkpoint2={x:6450,y:H-TILE,reached:false};
  G.bowserLeftX=6986;
  const _bs=BOWSER_STATS[5];Object.assign(bowser,{
    alive:true,x:9000,y:H-TILE-bowser.h,w:64,h:72,
    hp:_bs.hp,maxHp:_bs.hp,vx:-_bs.speed,vy:0,facing:-1,
    hurtTimer:0,fireTimer:_bs.fireTimer,jumpTimer:_bs.jumpTimer,
    onGround:false,state:'offscreen',deadTimer:0,fireImmune:_bs.fireImmune,phase:1,phaseTransition:0
  });

  // ピーチ（クッパ撃破後に自動スポーン）
// ★ ハンマースーツ
platforms.push({x:5200,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
// ★ 装飾土管
pipes.push({x:1500,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
pipes.push({x:4300,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
piranhas.push({x:4324,baseY:3*TILE,y:3*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
}
