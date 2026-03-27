import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

// 3-3: 海辺の要塞 (Seaside Fortress)
// テーマ: 海辺の城、溶岩ピット×3、大砲×5、ラキチュウ2体
// クッパ HP=5 (1-4の1.66倍)
export function buildLevel_3_3(){
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

  // 地面 (溶岩ピット×3)
  const gaps=[{s:1900,e:2120},{s:3400,e:3640},{s:5200,e:5440}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

  // 城ブロック
  addRow(0,H-5*TILE,3,'brick');
  addRow(350,H-5*TILE,4,'brick');addRow(450,H-9*TILE,3,'q');
  addRow(800,H-7*TILE,3,'brick');
  addRow(1100,H-5*TILE,5,'brick');
  addRow(1500,H-7*TILE,3,'brick');
  addRow(2200,H-5*TILE,4,'brick');addRow(2200,H-9*TILE,3,'q');
  addRow(2600,H-7*TILE,3,'brick');
  addRow(2900,H-5*TILE,5,'brick');
  addRow(3700,H-5*TILE,4,'brick');addRow(3700,H-9*TILE,3,'q');
  addRow(4100,H-7*TILE,3,'brick');
  addRow(4450,H-5*TILE,4,'brick');
  addRow(4850,H-7*TILE,3,'brick');
  addRow(5500,H-5*TILE,4,'brick');addRow(5500,H-9*TILE,3,'q');
  addRow(5900,H-7*TILE,3,'brick');
  addRow(6200,H-5*TILE,4,'brick');
  // ボスアリーナへの階段
  addStair(6400,5);
  // 城ゲート壁 (y=192~255はマリオが通れる隙間)
  [0,32,64,96,128,160,256,288,320,352,384].forEach(wy=>{addB(6660,wy,'brick');addB(6692,wy,'brick');});
  // 城門内の下り階段 — 上って → くぐって → 降りて → 戦う動線
  addStairD(6724,5);

  // 特殊ブロック (pushのみ)
  platforms.push({x:200,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
  platforms.push({x:600,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1050,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:2500,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3200,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:3900,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:4550,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5050,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:5650,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:6000,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  platforms.push({x:1380,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:4900,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
  platforms.push({x:2800,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});

  // コイン
  for(let i=0;i<18;i++)coinItems.push({x:350+i*320,y:H-9*TILE,collected:false});

  // 地上敵
  [{x:620,t:'goomba'},{x:880,t:'koopa'},
   {x:1100,t:'cactus'},{x:1380,t:'koopa'},{x:1490,t:'goomba'},{x:1600,t:'cactus'},
   {x:2200,t:'koopa'},{x:2380,t:'cactus'},{x:2600,t:'hammerBro'},{x:2700,t:'goomba'},
   {x:3700,t:'koopa'},{x:3820,t:'cactus'},{x:3940,t:'koopa'},
   {x:4200,t:'goomba'},{x:4300,t:'cactus'},{x:4700,t:'goomba'},{x:4820,t:'koopa'},
   {x:5500,t:'cactus'},{x:5620,t:'hammerBro'},{x:5740,t:'cactus'},
   {x:5960,t:'koopa'},{x:6060,t:'cactus'}
  ].forEach(({x,t})=>{
    let e;
    if(t==='goomba')e={x,y:H-2*TILE,w:TILE,h:TILE,vx:-1,vy:0,alive:true,type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false};
    else if(t==='koopa')e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1};
    else if(t==='cactus')e={x,y:H-2*TILE,w:TILE,h:TILE,vx:-0.8,vy:0,alive:true,type:'cactus',state:'walk',walkFrame:0,walkTimer:0};
    else if(t==='hammerBro')e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5+Math.random(),vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false};
    if(e)enemies.push(e);
  });

  // ラキチュウ (2体)
  [{x:1800,bY:H-9*TILE},{x:4400,bY:H-9*TILE}].forEach(({x,bY})=>{
    enemies.push({x,y:bY,w:TILE,h:TILE,vx:-1.5,vy:0,alive:true,
      type:'lakitu',state:'fly',baseY:bY,phase:Math.random()*Math.PI*2,dropTimer:100});
  });

  // 移動足場 (溶岩ピット越え)
  movingPlats.push(
    {x:1960,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:1960,range:80,spd:1.3},
    {x:3470,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3470,range:90,spd:1.5},
    {x:5270,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5270,range:90,spd:1.6}
  );

  // 大砲 (5門)
  cannons.push(
    {x:580, y:H-TILE*2,w:TILE,h:TILE*2,fireRate:130,timer:65},
    {x:1650,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:115,timer:45},
    {x:2950,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:120,timer:85},
    {x:4400,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:105,timer:35},
    {x:5780,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:100,timer:55}
  );

  // 溶岩 (ピット内間欠泉×6 + 地上火柱×12)
  [
    {x:1965,w:22,maxH:200,period:165,phase:0},
    {x:2060,w:18,maxH:165,period:165,phase:50},
    {x:3475,w:22,maxH:200,period:150,phase:0},
    {x:3570,w:18,maxH:165,period:150,phase:65},
    {x:5280,w:22,maxH:200,period:140,phase:0},
    {x:5375,w:18,maxH:165,period:140,phase:40},
    // 地上火柱
    {x:450, w:16,maxH:80,period:220,phase:70},
    {x:700, w:16,maxH:90,period:210,phase:40},
    {x:960, w:16,maxH:75,period:200,phase:130},
    {x:1290,w:16,maxH:80,period:190,phase:0},
    {x:1680,w:16,maxH:85,period:215,phase:90},
    {x:2250,w:16,maxH:90,period:205,phase:50},
    {x:2650,w:16,maxH:80,period:200,phase:80},
    {x:3050,w:16,maxH:85,period:185,phase:160},
    {x:3760,w:16,maxH:80,period:195,phase:30},
    {x:4150,w:16,maxH:85,period:180,phase:110},
    {x:4650,w:16,maxH:75,period:210,phase:170},
    {x:4980,w:16,maxH:85,period:190,phase:60}
  ].forEach(f=>lavaFlames.push({...f,curH:0}));

  // チェックポイント
  G.checkpoint={x:3800,y:H-TILE,reached:false};

  // クッパ戦直前キノコ
  platforms.push({x:6880,y:H-3*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
  // 制高点階段
  addStair(7100,6);
  // クッパ (HP=5) — offscreen 登場: Mario が x=7000 に達したとき画面右端から歩いて入ってくる
  G.bowserArenaX=7000;
  Object.assign(bowser,{alive:true,x:9000,y:H-TILE-72,w:64,h:72,hp:5,maxHp:5,
    vx:-1.5,vy:0,facing:-1,hurtTimer:0,fireTimer:100,jumpTimer:200,
    onGround:false,state:'offscreen',deadTimer:0});
}
