import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,BOWSER_STATS} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel4(){
[platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,particles,scorePopups,blockAnims,movingPlats,springs,cannons,bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
hammers.length=0;bowserFire.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;peach.alive=false;G.peachChase=null;
if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;
// Ground with lava pits
const gaps=[{s:1800,e:2010},{s:3200,e:3420},{s:5050,e:5270}];
for(let x=0;x<LW;x+=TILE)if(!gaps.some(g=>x>=g.s&&x<g.e))platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});
// Castle brick walls and blocks
addRow(0,H-5*TILE,3,'brick');
addRow(350,H-5*TILE,4,'brick');addRow(450,H-9*TILE,3,'q');
addRow(800,H-7*TILE,3,'brick');
addRow(1100,H-5*TILE,5,'brick');
addRow(1500,H-7*TILE,3,'brick');
addRow(2050,H-5*TILE,4,'brick');addRow(2050,H-9*TILE,3,'q');
addRow(2450,H-7*TILE,3,'brick');
addRow(2750,H-5*TILE,5,'brick');
addRow(3500,H-5*TILE,4,'brick');addRow(3500,H-9*TILE,3,'q');
addRow(3900,H-7*TILE,3,'brick');
addRow(4250,H-5*TILE,4,'brick');
addRow(4650,H-7*TILE,3,'brick');
addRow(5350,H-5*TILE,4,'brick');addRow(5350,H-9*TILE,3,'q');
addRow(5750,H-7*TILE,3,'brick');
addRow(6050,H-5*TILE,4,'brick');
// Block height variety (castle - confined)
addRow(650,H-4*TILE,2,'brick');addRow(1350,H-6*TILE,3,'brick');
addRow(3000,H-4*TILE,2,'brick');addRow(4000,H-6*TILE,2,'brick');
// 大型上り階段（10段）— マリオが高台に上ってクッパアリーナへ
addStair(6200,10);
G.stairSealX=6456;
// Coins
// Risk coins near lava pits + varied placement
[{x:1780,y:H-2*TILE},{x:1810,y:H-2*TILE},{x:1840,y:H-2*TILE}].forEach(c=>coinItems.push({...c,collected:false})); // risk coins at lava edge
[{x:3180,y:H-2*TILE},{x:3210,y:H-2*TILE},{x:3240,y:H-2*TILE}].forEach(c=>coinItems.push({...c,collected:false})); // risk coins at lava edge
[{x:5030,y:H-2*TILE},{x:5060,y:H-2*TILE},{x:5090,y:H-2*TILE}].forEach(c=>coinItems.push({...c,collected:false})); // risk coins at lava edge
// Vertical columns near castle walls
[{x:850,y:H-4*TILE},{x:850,y:H-5*TILE},{x:850,y:H-6*TILE}].forEach(c=>coinItems.push({...c,collected:false}));
[{x:4550,y:H-4*TILE},{x:4550,y:H-5*TILE},{x:4550,y:H-6*TILE}].forEach(c=>coinItems.push({...c,collected:false}));
// Remaining spread coins
for(let i=0;i<14;i++)coinItems.push({x:350+i*400,y:H-9*TILE,collected:false});
// Enemies
[{x:620,t:'goomba'},{x:880,t:'koopa'},
{x:1100,t:'goomba'},{x:1380,t:'koopa'},{x:1480,t:'goomba'},{x:1600,t:'goomba'},
{x:2050,t:'koopa'},{x:2180,t:'goomba'},{x:2300,t:'goomba'},{x:2600,t:'koopa'},{x:2700,t:'goomba'},
{x:3380,t:'koopa'},{x:4020,t:'goomba'},{x:4140,t:'koopa'},
{x:4100,t:'goomba'},{x:4200,t:'goomba'},{x:4600,t:'goomba'},{x:4720,t:'koopa'},
{x:5350,t:'koopa'},{x:5480,t:'goomba'},{x:5600,t:'goomba'},
{x:5730,t:'koopa'},{x:6370,t:'goomba'}
].forEach(({x,t})=>{
let e;
if(t==='goomba')e={x,y:H-2*TILE,w:TILE,h:TILE,vx:-1,vy:0,alive:true,type:'goomba',state:'walk',squishT:0,walkFrame:0,walkTimer:0,onGround:false};
else if(t==='koopa')e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.25,vx:-1,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,onGround:false,facing:-1};
else if(t==='hammerBro')e={x,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5+Math.random(),vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false};
if(e)enemies.push(e);
});
// Moving platforms over lava pits
movingPlats.push(
{x:1860,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:1860,range:80,spd:1.2},
{x:3270,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3270,range:90,spd:1.4},
{x:5110,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5110,range:90,spd:1.5}
);
// Cannons
cannons.push(
{x:580,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:20},
{x:1550,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:60},
{x:2800,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:100},
{x:4300,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:140},
{x:5680,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:300,timer:40}
);
// ドッスン×3（W1-4初登場：Z1/Z2/Z3に1体ずつ）
// ブロック禁止確認: x=1580-1643(H-7T 1500-1596の右), x=2650-2713(H-7T 2450-2514の右), x=4100-4163(H-6T 4000-4032の右)
enemies.push({x:1596,y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
enemies.push({x:2650,y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
enemies.push({x:4100,y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
// Checkpoint
G.checkpoint={x:3700,y:H-TILE,reached:false};
// Special blocks (push only – no addRow at same coordinates)
platforms.push({x:200,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
platforms.push({x:600,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:1000,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:2400,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:3050,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:3700,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:4400,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:4950,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:5450,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:5800,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:1380,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
platforms.push({x:4800,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
platforms.push({x:2752,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
platforms.push({x:4672,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
// Lava flames: geysers (in pits) and floor jets (on solid ground)
// {x, w, maxH, period, phase, curH}
[
  // Geysers inside lava pits (tall, dangerous for moving platform crossings)
  {x:1875,w:22,maxH:210,period:170,phase:0},
  {x:1940,w:18,maxH:170,period:170,phase:55},
  {x:3305,w:22,maxH:210,period:155,phase:0},
  {x:3375,w:18,maxH:170,period:155,phase:70},
  {x:5120,w:22,maxH:210,period:145,phase:0},
  {x:5200,w:18,maxH:170,period:145,phase:45},
  // Floor jets on solid ground (shorter, duck/jump to avoid)
  {x:450,w:16,maxH:80,period:220,phase:70},
  {x:700,w:16,maxH:90,period:210,phase:40},
  {x:950,w:16,maxH:75,period:200,phase:130},
  {x:1280,w:16,maxH:80,period:190,phase:0},
  {x:1680,w:16,maxH:85,period:215,phase:90},
  {x:2150,w:16,maxH:90,period:205,phase:50},
  {x:2560,w:16,maxH:90,period:200,phase:80},
  {x:2950,w:16,maxH:80,period:185,phase:160},
  {x:3600,w:16,maxH:85,period:195,phase:30},
  {x:4020,w:16,maxH:85,period:180,phase:110},
  {x:4180,w:16,maxH:75,period:210,phase:170},
  {x:4550,w:16,maxH:85,period:190,phase:60},
  {x:4870,w:16,maxH:90,period:175,phase:20},
  {x:5480,w:16,maxH:80,period:200,phase:100},
  {x:5620,w:16,maxH:85,period:195,phase:150},
  {x:5800,w:16,maxH:75,period:185,phase:40}
].forEach(f=>lavaFlames.push({...f,curH:0}));
// アリーナ壁（7ブロック高・Bowserジャンプ144px < 壁高224px）
for(let wy=H-8*TILE;wy<H-TILE;wy+=TILE){addB(6520,wy,'brick');addB(6552,wy,'brick');}
// アリーナ内 ? ブロック（壁右側の平地）
platforms.push({x:6660,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:6900,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
// ★ アリーナ足場（高低差でジャンプルート多様化）
addRow(6720,H-7*TILE,3,'brick');   // 中段足場（左側）
addRow(7000,H-6*TILE,2,'brick');   // 中段足場（右側）
// Bowser — 階段頂上(x=6488)をマリオが越えたとき画面右端から登場
G.bowserArenaX=6455;G.checkpoint2={x:6050,y:H-TILE,reached:false};
G.bowserLeftX=6586;
const _bs=BOWSER_STATS[1];Object.assign(bowser,{alive:true,x:9000,y:H-TILE-72,w:64,h:72,hp:_bs.hp,maxHp:_bs.hp,vx:-_bs.speed,vy:0,facing:-1,hurtTimer:0,fireTimer:_bs.fireTimer,jumpTimer:_bs.jumpTimer,onGround:false,state:'offscreen',deadTimer:0,fireImmune:_bs.fireImmune,phase:1,phaseTransition:0});
// ★ ハンマースーツ
platforms.push({x:4500,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
// ★ 装飾土管
pipes.push({x:2700,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
// 城の天井土管は撤去（落とし穴上の火柱との競合回避）
// ★ 上空パタパタ（2段JMP対策）
enemies.push({x:800,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:0.0,shellTimer:0,walkFrame:0,walkTimer:0});
enemies.push({x:4300,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:1.6,shellTimer:0,walkFrame:0,walkTimer:0});

// ★ 新敵（CP2以降・クッパアリーナ前廊下）
enemies.push({x:6250,y:2*TILE,w:TILE,h:TILE,vx:-1.2,vy:0,alive:true,type:'spikeTop',state:'walk',baseX:6250,range:100,walkFrame:0,walkTimer:0,facing:-1});
enemies.push({x:6400,y:H-2*TILE,w:TILE,h:TILE,vx:-1.2,vy:0,alive:true,type:'bobomb',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1,litTimer:0});

// ピノキオ部屋ワープ天井パイプ（1ステージに1本）
pipes.push({x:3000,y:0,w:TILE*2,h:8*TILE,bounceOffset:0,isWarp:true,ceiling:true,variant:'pinocchio'});
}
