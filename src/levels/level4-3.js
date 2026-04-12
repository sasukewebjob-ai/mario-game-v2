import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,BOWSER_STATS} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_4_3(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;
  G.autoScroll=0;

  // 地面（溶岩穴3か所）
  const gaps=[{s:1900,e:2200},{s:3400,e:3620},{s:5200,e:5430}]; // ★ gap1 widened by 80px
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Yoshi egg (early)
  platforms.push({x:200,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});

  // 城内ブロック
  addRow(0,  H-5*TILE,3,'brick');
  addRow(350,H-5*TILE,4,'brick');
  addRow(800,H-7*TILE,3,'brick');
  addRow(1100,H-5*TILE,5,'brick');
  addRow(1550,H-7*TILE,3,'brick');
  addRow(2200,H-5*TILE,4,'brick');
  addRow(2600,H-7*TILE,3,'brick');
  addRow(2900,H-5*TILE,5,'brick');
  addRow(3700,H-5*TILE,4,'brick');
  addRow(4100,H-7*TILE,3,'brick');
  addRow(4500,H-5*TILE,4,'brick');
  addRow(4900,H-7*TILE,3,'brick');
  addRow(5500,H-5*TILE,4,'brick');
  addRow(5900,H-7*TILE,3,'brick');
  addRow(6200,H-5*TILE,4,'brick');

  // ★ Block Height Variety
  addRow(700, H-4*TILE, 3,'brick');   // 前半 低空
  addRow(1800,H-6*TILE, 3,'brick');   // 中盤 中空
  addRow(3300,H-4*TILE, 3,'brick');   // 中盤 低空
  addRow(5000,H-6*TILE, 3,'brick');   // 後半 中空

  // 大型上り階段（10段）— マリオが高台に上ってクッパアリーナへ
  addStair(6400,10);
  G.stairSealX=6656;

  // 移動足場（溶岩穴）
  movingPlats.push({x:1950,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:1950,range:80,spd:1.5,prevX:1950});
  movingPlats.push({x:3450,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3450,range:90,spd:1.7,prevX:3450});
  movingPlats.push({x:5250,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5250,range:90,spd:1.8,prevX:5250});

  // キャノン
  cannons.push(
    {x:600, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:20},
    {x:1650,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:60},
    {x:2900,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:100},
    {x:4600,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:140},
    {x:5800,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:40}
  );

  // 敵
  [{x:650,t:'koopa'},{x:900,t:'goomba'},{x:1200,t:'koopa'},
   {x:1500,t:'goomba'},{x:2250,t:'koopa'},{x:2450,t:'goomba'},
   {x:2700,t:'koopa'},{x:3000,t:'goomba'},{x:3480,t:'koopa'},
   {x:4120,t:'goomba'},{x:4300,t:'koopa'},{x:4550,t:'goomba'},
   {x:5600,t:'koopa'},{x:5850,t:'goomba'},{x:6570,t:'koopa'}
  ].forEach(({x,t})=>{
    let e;
    if(t==='goomba') e={x,y:H-2*TILE,w:TILE,h:TILE,    vx:-1,vy:0,alive:true,type:'goomba',  state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false};
    else             e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1};
    if(e) enemies.push(e);
  });

  // 特殊ブロック（addRow座標と重複しないように配置）
  // addRow H-5T: 0-64, 350-446, 1100-1228, 2200-2296, 2900-3028, 3700-3796, 4500-4596, 5500-5596, 6200-6296
  // addRow H-7T: 800-864, 1550-1614, 2600-2664, 4100-4164, 4900-4964, 5900-5964
  platforms.push({x:500, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:900, y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:1250,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2330,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2700,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3060,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:3830,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4200,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4630,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4932,y:H-9*TILE, w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:5630,y:H-7*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5970,y:H-5*TILE, w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  // 1UPヒドゥン
  platforms.push({x:350, y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:1000,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:2900,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:4500,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:6100,y:H-9*TILE, w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // コイン（クラスター + 縦列 + リスクコイン）
  // ★ Coin Clusters near gap edges
  [1905,1930,1960,1990,2020].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  [3405,3430,3460,3490,3520].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  [5210,5240,5270,5310,5350].forEach(cx=>coinItems.push({x:cx,y:H-6*TILE,collected:false}));
  // Vertical columns
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:750,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:2500,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:4200,y:cy,collected:false}));
  [H-3*TILE,H-4*TILE,H-5*TILE].forEach(cy=>coinItems.push({x:5800,y:cy,collected:false}));

  // チャージングチャック（チェックポイント±300外・アリーナ手前除外）
  [{x:700,facing:-1},{x:1500,facing:-1},{x:2300,facing:-1},{x:4200,facing:-1},{x:5500,facing:-1}
  ].forEach(d=>enemies.push({x:d.x,y:H-2*TILE-4,w:TILE,h:TILE*1.4,vx:d.facing*1.5,vy:0,alive:true,type:'chuck',state:'idle',facing:d.facing,hp:3,walkFrame:0,walkTimer:0,onGround:false,stunTimer:0}));

  // チェックポイント
  G.checkpoint={x:3800,y:H-TILE,reached:false};

  // 火柱地獄（lavaFlames）— 前半は短め・後半は激しく
  [
    // 地面火柱（前半：穏やか）
    {x:250, w:18,maxH:100,period:240,phase:0},
    {x:550, w:18,maxH:110,period:220,phase:60},
    {x:750, w:18,maxH:90, period:200,phase:120},
    {x:1050,w:18,maxH:110,period:230,phase:30},
    {x:1300,w:18,maxH:100,period:210,phase:90},
    {x:1700,w:18,maxH:120,period:190,phase:50},
    // 地面火柱（中盤：高さ増）
    {x:2300,w:20,maxH:140,period:175,phase:10},
    {x:2500,w:18,maxH:120,period:185,phase:80},
    {x:2750,w:20,maxH:150,period:170,phase:40},
    {x:3000,w:18,maxH:130,period:180,phase:100},
    {x:3100,w:20,maxH:160,period:165,phase:20},
    // 溶岩穴ガイザー
    {x:1930,w:24,maxH:220,period:160,phase:0},
    {x:2010,w:20,maxH:180,period:160,phase:50},
    {x:3430,w:24,maxH:220,period:155,phase:0},
    {x:3510,w:20,maxH:180,period:155,phase:60},
    {x:5220,w:24,maxH:220,period:150,phase:0},
    {x:5310,w:20,maxH:180,period:150,phase:55},
    // 地面火柱（後半：激しい・高い）
    {x:4000,w:20,maxH:170,period:160,phase:70},
    {x:4200,w:22,maxH:180,period:155,phase:10},
    {x:4400,w:20,maxH:160,period:165,phase:120},
    {x:4600,w:22,maxH:170,period:155,phase:55},
    {x:4750,w:20,maxH:150,period:170,phase:90},
    {x:5000,w:20,maxH:160,period:160,phase:20},
    {x:5550,w:22,maxH:180,period:155,phase:45},
    {x:5700,w:20,maxH:170,period:160,phase:100},
    {x:5900,w:22,maxH:190,period:150,phase:30},
    {x:6050,w:20,maxH:170,period:155,phase:80},
    {x:6200,w:22,maxH:180,period:145,phase:15},
    // クッパ直前の巨大火柱
    {x:6900,w:24,maxH:200,period:140,phase:0},
    {x:6980,w:20,maxH:180,period:145,phase:45},
  ].forEach(f=>lavaFlames.push({...f,curH:0}));

  // アリーナ壁（7ブロック高・Bowserジャンプ144px < 壁高224px）
  for(let wy=H-8*TILE;wy<H-TILE;wy+=TILE){addB(6720,wy,'brick');addB(6752,wy,'brick');}
  // アリーナ内 ? ブロック
  platforms.push({x:6860,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:7100,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  // クッパ — 階段頂上をマリオが越えたとき画面右端から登場、HP=5
  G.bowserArenaX=6655;G.checkpoint2={x:6250,y:H-TILE,reached:false};
  G.bowserLeftX=6786;
  const _bs=BOWSER_STATS[4];Object.assign(bowser,{
    alive:true,x:9000,y:H-TILE-bowser.h,w:64,h:72,
    hp:_bs.hp,maxHp:_bs.hp,vx:-_bs.speed,vy:0,facing:-1,
    hurtTimer:0,fireTimer:_bs.fireTimer,jumpTimer:_bs.jumpTimer,
    onGround:false,state:'offscreen',deadTimer:0,fireImmune:_bs.fireImmune,phase:1,phaseTransition:0
  });
// ★ ハンマースーツ
platforms.push({x:5000,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
// ★ 装飾土管
pipes.push({x:1500,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
pipes.push({x:4300,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
piranhas.push({x:4324,baseY:3*TILE,y:3*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
// 風ゾーン（2廊下：前半向かい風・後半強風）
windZones.push({x:500,y:0,w:900,h:H,force:-1.5});  // Z1廊下（向かい風）
windZones.push({x:3600,y:0,w:1400,h:H,force:-2.0}); // Z3廊下（強風）
}
