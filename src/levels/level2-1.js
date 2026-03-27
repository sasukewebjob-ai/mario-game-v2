import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_2_1(){
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

  // 地面（ギャップ2つ、低難易度）
  const gaps=[{s:2800,e:2960},{s:5200,e:5360}];
  for(let x=0;x<LW;x+=TILE)if(!gaps.some(g=>x>=g.s&&x<g.e))
    platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // Zone 1 (0-1000) 導入
  // 特殊ブロック(x=300: yoshiEgg, x=332: hasMush)はpushのみで追加するため、
  // addRowはそれら以外の座標(x=364)のみ
  addRow(364,H-5*TILE,1,'q');           // plain q（特殊なし）
  addRow(600,H-5*TILE,4,'brick');
  // x=800,832はpushでcoinBlockを置くため addRow しない（plain qなし）

  // Zone 2 (1000-2000)
  addRow(1100,H-5*TILE,3,'brick');
  // x=1300はpushでhasMushを置くため addRow しない。x=1332のみplain q
  addRow(1332,H-8*TILE,1,'q');
  addRow(1600,H-5*TILE,2,'brick');
  // x=1600はpushでcoinBlockを置くため addRow(H-9*TILE)はx=1632,1664のみ
  addRow(1632,H-9*TILE,2,'q');
  addRow(1850,H-5*TILE,4,'brick');

  // Zone 3 (2000-3000) ギャップ前後
  // x=2100はpushでhasMushを置くため addRow しない。x=2132のみplain q
  addRow(2132,H-5*TILE,1,'q');
  addRow(2300,H-7*TILE,3,'brick');
  addRow(2600,H-5*TILE,2,'brick');
  // ギャップ: 2800-2960
  addRow(3000,H-5*TILE,3,'q');
  addRow(3200,H-7*TILE,2,'brick');

  // Zone 4 (3000-4500) チェックポイント付近
  addRow(3500,H-5*TILE,4,'brick');
  // x=3700はpushでhasStar。x=3732,3764のみplain q
  addRow(3732,H-9*TILE,2,'q');
  addRow(4000,H-5*TILE,2,'q');
  addRow(4200,H-7*TILE,4,'brick');

  // Zone 5 (4500-6000) ギャップ前後
  addRow(4600,H-5*TILE,3,'brick');
  // x=4900はpushでhasMush。x=4932のみplain q
  addRow(4932,H-8*TILE,1,'q');
  addRow(5000,H-5*TILE,2,'brick');
  // ギャップ: 5200-5360
  addRow(5400,H-5*TILE,3,'q');
  addRow(5650,H-7*TILE,3,'brick');
  // x=5900はpushでhasMush。x=5932のみplain q
  addRow(5932,H-5*TILE,1,'q');

  // Zone 6 (6000-7500) 終盤
  addRow(6100,H-5*TILE,4,'brick');
  // x=6400はpushでhidden(1UP)。x=6432,6464のみplain q
  addRow(6432,H-9*TILE,2,'q');
  addRow(6700,H-5*TILE,3,'brick');
  addStair(7000,6);

  // 特殊ブロック（push のみ、addRow と同座標禁止）
  platforms.push({x:300,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
  platforms.push({x:332,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1300,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2100,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3700,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:4900,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5900,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6400,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // コインブロック（addRow と同座標禁止）
  platforms.push({x:800,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
  platforms.push({x:832,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,bounceOffset:0});
  platforms.push({x:1600,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});

  // パイプ（ワープ2本、通常2本）
  [[500,2,'desert1'],[1400,3,false],[3100,2,'desert2'],[5600,2,false]].forEach(([px,ph,warp])=>{
    pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
  pipes.forEach((p,i)=>{if(p.isWarp)return;
    piranhas.push({x:p.x+8,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});

  // コイン
  for(let i=0;i<40;i++)coinItems.push({x:200+i*185,y:H-8*TILE,collected:false});

  // 通常敵（低密度）
  [{x:350,t:'goomba'},{x:480,t:'goomba'},
   {x:900,t:'koopa'},{x:1050,t:'goomba'},{x:1200,t:'goomba'},
   {x:1700,t:'goomba'},{x:1900,t:'koopa'},
   {x:2200,t:'goomba'},{x:2400,t:'goomba'},{x:2600,t:'koopa'},
   {x:3100,t:'goomba'},{x:3300,t:'goomba'},
   {x:3600,t:'koopa'},{x:3900,t:'goomba'},
   {x:4300,t:'goomba'},{x:4500,t:'koopa'},
   {x:4700,t:'goomba'},
   {x:5400,t:'goomba'},{x:5550,t:'goomba'},{x:5750,t:'koopa'},
   {x:6000,t:'goomba'},{x:6200,t:'goomba'},{x:6400,t:'koopa'},
   {x:6600,t:'goomba'},{x:6800,t:'goomba'}
  ].forEach(({x,t})=>{
    enemies.push({x,y:H-2*TILE,w:TILE,h:t==='koopa'?TILE*1.2:TILE,
      vx:-1.5,vy:0,alive:true,type:t,state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
  });

  // 飛び跳ねるブロック（Zone 1-6、増量）
  [{x:700},{x:1100},{x:1800},{x:2300},{x:3400},{x:4200},{x:5000},{x:5650},{x:6500}].forEach(({x})=>{
    jumpBlocks.push({x,y:H-2*TILE,w:28,h:28,vx:-1.5,vy:0,onGround:true,jumpTimer:60+Math.floor(Math.random()*40),alive:true});
  });

  // パイポ（Zone 2-6、増量）
  [{x:1500},{x:2200},{x:2700},{x:3300},{x:3800},{x:4400},{x:4800},{x:5500},{x:5900},{x:6300},{x:6700}].forEach(({x})=>{
    pipos.push({x,y:H-2*TILE-22,w:22,h:22,vx:-1.8,vy:-6,alive:true,bounceCount:0});
  });

  // ワンワン（Zone 4-6、チェックポイント後）
  [{x:3450},{x:5100},{x:6100}].forEach(({x})=>{
    chainChomps.push({x,y:H-TILE-36,w:36,h:36,postX:x,postY:H-TILE-36,
      vx:0,vy:0,phase:Math.random()*Math.PI*2,state:'idle',lungeTimer:0,alive:true});
  });

  // 移動足場（ギャップ越え補助）
  movingPlats.push({x:2850,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:2850,range:60,spd:1.5});
  movingPlats.push({x:5230,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:5230,range:60,spd:1.5});

  // チェックポイント（y=H-TILE で地面に接地）
  G.checkpoint={x:4000,y:H-TILE,reached:false};
}
