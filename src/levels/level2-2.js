import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,
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
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

  // 地面（ギャップ3つ、2-1より難しめ）
  const gaps=[{s:2400,e:2600},{s:4200,e:4400},{s:5900,e:6100}];
  for(let x=0;x<LW;x+=TILE)if(!gaps.some(g=>x>=g.s&&x<g.e))
    platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Zone 1 (0-1500)
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
  addStair(7100,7);

  // 特殊ブロック（pushのみ、addRowと座標重複なし）
  platforms.push({x:300,y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:950,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1700,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
  platforms.push({x:2900,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:4700,y:H-8*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
  platforms.push({x:5200,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6400,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});

  // パイプ（ワープ2本 desert3/desert4、通常2本）
  [[800,2,'desert3'],[2100,3,false],[3800,2,'desert4'],[5700,2,false]].forEach(([px,ph,warp])=>{
    pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
  pipes.forEach((p,i)=>{if(p.isWarp)return;
    piranhas.push({x:p.x+8,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});

  // コイン
  for(let i=0;i<45;i++)coinItems.push({x:180+i*168,y:H-8*TILE,collected:false});

  // 通常敵（2-1より密度高め）
  [{x:350,t:'goomba'},{x:500,t:'goomba'},{x:750,t:'koopa'},
   {x:1000,t:'goomba'},{x:1100,t:'goomba'},{x:1350,t:'koopa'},
   {x:1550,t:'goomba'},{x:1650,t:'goomba'},{x:1850,t:'koopa'},{x:2050,t:'goomba'},{x:2250,t:'goomba'},
   {x:2700,t:'goomba'},{x:2800,t:'goomba'},{x:3000,t:'koopa'},{x:3250,t:'goomba'},{x:3300,t:'goomba'},{x:3550,t:'koopa'},{x:3900,t:'goomba'},{x:4050,t:'goomba'},
   {x:4500,t:'goomba'},{x:4650,t:'goomba'},{x:4750,t:'koopa'},{x:5050,t:'goomba'},{x:5150,t:'goomba'},{x:5300,t:'koopa'},{x:5650,t:'goomba'},{x:5800,t:'goomba'},
   {x:6200,t:'goomba'},{x:6350,t:'goomba'},{x:6500,t:'koopa'},{x:6600,t:'goomba'},{x:6750,t:'goomba'},{x:6900,t:'koopa'},{x:7050,t:'goomba'}
  ].forEach(({x,t})=>{
    if(t==='parakoopa'){const by=H-5*TILE;enemies.push({x,y:by,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:by,phase:Math.random()*Math.PI*2,shellTimer:0,walkFrame:0,walkTimer:0})}
    else enemies.push({x,y:H-2*TILE,w:TILE,h:t==='koopa'?TILE*1.2:TILE,vx:-1.5,vy:0,alive:true,type:t,state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
  });

  // パラクーパ（26体、ランダムな高さ）
  [200,500,850,1150,1450,1800,2200,2500,2800,3100,3400,3700,
   4000,4300,4600,4900,5200,5500,5800,6100,6300,6500,6600,6700,6800,6950].forEach(x=>{
    const by=H-(4+Math.floor(Math.random()*4))*TILE;
    enemies.push({x,y:by,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:by,phase:Math.random()*Math.PI*2,shellTimer:0,walkFrame:0,walkTimer:0});
  });

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

  // チェックポイント
  G.checkpoint={x:4000,y:H-TILE,reached:false};
}
