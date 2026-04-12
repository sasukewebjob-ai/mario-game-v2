import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,BOWSER_STATS} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_2_3(){
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
  G.iceMode=false;G.sandstormMode=true;

  // 地面（溶岩ピット3つ — gap2を100px拡大）
  const gaps=[{s:1600,e:1820},{s:3000,e:3320},{s:4800,e:5020}];
  for(let x=0;x<LW;x+=TILE)if(!gaps.some(g=>x>=g.s&&x<g.e))
    platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Zone 1 (0-1600)
  addRow(0,H-5*TILE,3,'brick');
  addRow(350,H-5*TILE,4,'brick');
  addRow(450,H-9*TILE,3,'q');
  addRow(800,H-7*TILE,3,'brick');
  addRow(1100,H-5*TILE,5,'brick');
  addRow(1400,H-7*TILE,3,'brick');

  // Zone 2 (1820-3000) — castle variety blocks at H-4*TILE, H-6*TILE
  addRow(1870,H-5*TILE,4,'brick');
  addRow(1870,H-9*TILE,3,'q');
  addRow(2100,H-4*TILE,3,'brick');          // low stepping stones
  addRow(2250,H-7*TILE,3,'brick');
  addRow(2550,H-5*TILE,5,'brick');
  addRow(2750,H-6*TILE,2,'brick');          // mid-height perch

  // Zone 3 (3320-4800) — gap2 widened, zone shifted
  addRow(3370,H-5*TILE,4,'brick');
  addRow(3370,H-9*TILE,3,'q');
  addRow(3700,H-7*TILE,3,'brick');
  addRow(3900,H-4*TILE,2,'brick');          // low castle ledge
  addRow(4050,H-5*TILE,4,'brick');
  addRow(4250,H-6*TILE,3,'brick');          // mid-height castle ledge
  addRow(4450,H-7*TILE,3,'brick');

  // Zone 4 (5020-7500)
  addRow(5050,H-5*TILE,4,'brick');
  addRow(5050,H-9*TILE,3,'q');
  addRow(5250,H-6*TILE,2,'brick');          // mid-height castle ledge
  addRow(5450,H-7*TILE,3,'brick');
  addRow(5600,H-4*TILE,2,'brick');          // low stepping stones
  addRow(5750,H-5*TILE,4,'brick');
  // 大型上り階段（10段）— マリオが高台に上ってクッパアリーナへ
  addStair(6000,10);

  // 特殊ブロック（pushのみ、addRowと座標重複なし）
  platforms.push({x:200,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
  platforms.push({x:550,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1000,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1250,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:2000,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3550,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4200,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:4750,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:5300,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5950,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});

  // パイプ（すべて通常、ワープなし）
  [[600,2,false],[2300,3,false],[4600,2,false]].forEach(([px,ph,warp])=>{
    pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:false,variant:null})});
  pipes.forEach((p,i)=>{
    piranhas.push({x:p.x+24,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});

  // コイン — risk coins near lava pits + safe arches
  // Safe coin lines
  for(let i=0;i<8;i++)coinItems.push({x:350+i*180,y:H-9*TILE,collected:false});
  for(let i=0;i<6;i++)coinItems.push({x:3400+i*200,y:H-9*TILE,collected:false});
  // Risk coins hovering over lava pit edges (high reward, near flames)
  for(let i=0;i<4;i++)coinItems.push({x:1620+i*50,y:H-3*TILE,collected:false});
  for(let i=0;i<5;i++)coinItems.push({x:3020+i*55,y:H-3*TILE,collected:false});
  for(let i=0;i<4;i++)coinItems.push({x:4820+i*50,y:H-3*TILE,collected:false});

  // 通常敵
  [{x:620,t:'goomba'},{x:880,t:'koopa'},
   {x:1100,t:'goomba'},{x:1250,t:'goomba'},{x:1380,t:'koopa'},{x:1480,t:'goomba'},
   {x:1900,t:'koopa'},{x:2050,t:'goomba'},{x:2200,t:'goomba'},{x:2400,t:'koopa'},
   {x:2600,t:'goomba'},{x:2700,t:'hammerBro'},
   {x:3180,t:'koopa'},{x:3820,t:'goomba'},{x:3920,t:'goomba'},
   {x:4100,t:'goomba'},{x:4200,t:'koopa'},{x:4350,t:'hammerBro'},{x:4600,t:'goomba'},
   {x:5100,t:'koopa'},{x:5250,t:'goomba'},{x:5400,t:'goomba'},
   {x:5530,t:'koopa'},{x:6170,t:'goomba'}
  ].forEach(({x,t})=>{
    let e;
    if(t==='goomba')e={x,y:H-2*TILE,w:TILE,h:TILE,vx:-1,vy:0,alive:true,type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false};
    else if(t==='koopa')e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1};
    else if(t==='hammerBro')e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5+Math.random(),vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false};
    if(e)enemies.push(e);
  });

  // ワンワン（城内に配置）
  [{x:1050},{x:2750},{x:4550}].forEach(({x})=>{
    chainChomps.push({x,y:H-TILE-36,w:36,h:36,postX:x,postY:H-TILE-36,
      vx:0,vy:0,phase:Math.random()*Math.PI*2,state:'idle',lungeTimer:0,alive:true});
  });

  // パイポ（城内追加ハザード）
  [{x:700},{x:1500},{x:2400},{x:3800},{x:4400},{x:5500}].forEach(({x})=>{
    pipos.push({x,y:H-2*TILE-22,w:22,h:22,vx:-1.8,vy:-6,alive:true,bounceCount:0});
  });

  // 移動足場（溶岩ピット越え）
  movingPlats.push(
    {x:1660,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:1660,range:80,spd:1.5},
    {x:3060,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3060,range:130,spd:1.7},
    {x:4860,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:4860,range:90,spd:1.9}
  );

  // 大砲（6門、1-4より多め）
  cannons.push(
    {x:500,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:20},
    {x:1350,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:60},
    {x:2600,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:100},
    {x:4100,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:140},
    {x:5650,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:30},
    {x:5900,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:90}
  );

  // チェックポイント
  G.checkpoint={x:3500,y:H-TILE,reached:false};

  // 溶岩（1-4より多め）
  [
    // ピット内の間欠泉（各ピット2本）
    {x:1665,w:22,maxH:220,period:165,phase:0},
    {x:1760,w:18,maxH:180,period:165,phase:50},
    {x:3065,w:22,maxH:220,period:150,phase:0},
    {x:3160,w:18,maxH:180,period:150,phase:65},
    {x:4865,w:22,maxH:220,period:140,phase:0},
    {x:4960,w:18,maxH:180,period:140,phase:40},
    // 地上の火柱（15本）
    {x:300,w:16,maxH:85,period:220,phase:70},
    {x:650,w:16,maxH:90,period:210,phase:40},
    {x:950,w:16,maxH:80,period:200,phase:130},
    {x:1200,w:16,maxH:85,period:190,phase:0},
    {x:1450,w:16,maxH:90,period:215,phase:90},
    {x:1900,w:16,maxH:85,period:205,phase:50},
    {x:2100,w:16,maxH:90,period:195,phase:110},
    {x:2450,w:16,maxH:85,period:185,phase:30},
    {x:2800,w:16,maxH:80,period:205,phase:170},
    {x:3350,w:16,maxH:90,period:195,phase:60},
    {x:3600,w:16,maxH:85,period:185,phase:20},
    {x:4150,w:16,maxH:90,period:175,phase:80},
    {x:4500,w:16,maxH:85,period:200,phase:150},
    {x:5100,w:16,maxH:90,period:190,phase:40},
    {x:5400,w:16,maxH:85,period:195,phase:120}
  ].forEach(f=>lavaFlames.push({...f,curH:0}));

  // アリーナ壁（7ブロック高・Bowserジャンプ144px < 壁高224px）
  for(let wy=H-8*TILE;wy<H-TILE;wy+=TILE){addB(6320,wy,'brick');addB(6352,wy,'brick');}
  // アリーナ内 ? ブロック
  platforms.push({x:6480,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6720,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  // クッパ — 階段頂上をマリオが越えたとき画面右端から登場
  G.bowserArenaX=6255;G.checkpoint2={x:5850,y:H-TILE,reached:false};
  G.bowserLeftX=6386;
  const _bs=BOWSER_STATS[2];Object.assign(bowser,{alive:true,x:9000,y:H-TILE-72,w:64,h:72,hp:_bs.hp,maxHp:_bs.hp,
    vx:-_bs.speed,vy:0,facing:-1,hurtTimer:0,fireTimer:_bs.fireTimer,jumpTimer:_bs.jumpTimer,
    onGround:false,state:'offscreen',deadTimer:0,fireImmune:_bs.fireImmune,phase:1,phaseTransition:0});
  // ★ ハンマースーツ
  platforms.push({x:4700,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
  // ★ 装飾土管
  pipes.push({x:1500,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
  pipes.push({x:4200,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
  piranhas.push({x:4224,baseY:3*TILE,y:3*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
  // 追いかけ壁（砂嵐 + 壁でチェックポイント後に緊張感）
  G.chasingWall={x:-200,speed:0.9,triggerX:3600,active:false};
}
