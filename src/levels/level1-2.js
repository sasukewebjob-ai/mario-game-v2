import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel2(){
[platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,particles,scorePopups,blockAnims,movingPlats,springs,cannons,bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
hammers.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

// Ground - 3 gaps (medium)
const gaps=[{s:1800,e:1900},{s:2500,e:2580},{s:3300,e:3460},{s:4300,e:4520},{s:5050,e:5210},{s:6500,e:6660}];
for(let x=0;x<LW;x+=TILE)if(!gaps.some(g=>x>=g.s&&x<g.e))platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

// Zone 1
addRow(128,H-5*TILE,1,'q');addRow(256,H-5*TILE,1,'q',true);addRow(416,H-5*TILE,1,'q');
addRow(512,H-9*TILE,2,'brick');addStair(640,4);
addRow(800,H-7*TILE,3,'brick');addRow(864,H-11*TILE,2,'q');
// Zone 2
addRow(1024,H-5*TILE,1,'q');addRow(1152,H-9*TILE,1,'q');
addRow(1280,H-5*TILE,2,'brick');
addRow(1440,H-3*TILE,3,'g');addRow(1600,H-5*TILE,3,'g');
addRow(1920,H-7*TILE,2,'q');addRow(2000,H-5*TILE,3,'brick');
// Zone 3
addRow(2200,H-5*TILE,1,'q');addRow(2300,H-9*TILE,2,'brick');
addRow(2500,H-5*TILE,3,'brick');addRow(2600,H-9*TILE,1,'q');
addRow(2800,H-3*TILE,3,'g');addRow(2900,H-5*TILE,3,'g');addRow(3000,H-7*TILE,3,'g');
addRow(3100,H-5*TILE,2,'q');
// Zone 4
addRow(3500,H-5*TILE,3,'brick');addRow(3700,H-9*TILE,2,'q',true);addStairD(3900,5);
// Zone 5
addRow(4100,H-5*TILE,4,'brick');addRow(4200,H-9*TILE,2,'q');
addRow(4500,H-9*TILE,3,'brick');addStair(4700,6);
// Zone 6
addRow(5300,H-7*TILE,2,'q');addRow(5500,H-4*TILE,3,'brick');
addRow(5600,H-8*TILE,2,'q');addRow(5700,H-5*TILE,2,'brick');
// Zone 7
addRow(5900,H-5*TILE,2,'q',true);addRow(6050,H-9*TILE,2,'brick');
addRow(6200,H-5*TILE,3,'brick');addRow(6300,H-9*TILE,2,'q');
addStair(6700,8);addRow(7000,H-5*TILE,2,'q');
// Block height variety
addRow(400,H-4*TILE,2,'brick');addRow(1800,H-6*TILE,3,'brick');
addRow(3800,H-8*TILE,2,'q');addRow(5000,H-6*TILE,2,'brick');

// Pipes
[[700,2,false],[1400,3,'pipeGrass2'],[2200,2,false],[4050,3,'mushroom'],[5700,2,false],[6300,2,false],[7200,4,false]].forEach(([px,ph,warp])=>{
pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
// Piranhas
pipes.forEach((p,i)=>{if(p.isWarp)return;piranhas.push({x:p.x+24,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});
// Coins
// Clusters near gap edges
[{x:1700,y:H-4*TILE},{x:1730,y:H-5*TILE},{x:1760,y:H-4*TILE},{x:1790,y:H-3*TILE}].forEach(c=>coinItems.push({...c,collected:false}));
[{x:1910,y:H-3*TILE},{x:1940,y:H-4*TILE},{x:1970,y:H-3*TILE}].forEach(c=>coinItems.push({...c,collected:false}));
// Vertical columns
[{x:3200,y:H-4*TILE},{x:3200,y:H-5*TILE},{x:3200,y:H-6*TILE}].forEach(c=>coinItems.push({...c,collected:false}));
[{x:5000,y:H-3*TILE},{x:5000,y:H-4*TILE},{x:5000,y:H-5*TILE}].forEach(c=>coinItems.push({...c,collected:false}));
// Risk coins
[{x:6000,y:H-2*TILE},{x:6050,y:H-2*TILE},{x:6100,y:H-11*TILE},{x:6150,y:H-11*TILE}].forEach(c=>coinItems.push({...c,collected:false}));
// Trail coins near pipe
for(let j=0;j<4;j++)coinItems.push({x:670+j*30,y:H-3*TILE,collected:false});
// Spread coins + gap arches
for(let i=0;i<30;i++)coinItems.push({x:200+i*230,y:H-10*TILE,collected:false});
gaps.forEach(g=>{const cx=(g.s+g.e)/2;for(let j=0;j<8;j++){const a=Math.PI*j/7;coinItems.push({x:cx-50+j*14,y:H-5*TILE-Math.sin(a)*60,collected:false})}});
// Extra coins to reach 300+
for(let i=0;i<220;i++)coinItems.push({x:120+i*34,y:H-6*TILE,collected:false});
// Enemies（密度バランス調整: 89→60前後、CLAUDE.md⑤遵守でx>=350）
[{x:400,t:'goomba'},{x:480,t:'koopa'},
{x:550,t:'goomba'},{x:680,t:'koopa'},{x:780,t:'goomba'},
{x:1050,t:'goomba'},{x:1150,t:'koopa'},
{x:1300,t:'koopa'},{x:1350,t:'goomba'},{x:1450,t:'koopa'},
{x:1650,t:'koopa'},{x:1750,t:'goomba'},{x:1950,t:'hammerBro'},
{x:2050,t:'goomba'},{x:2150,t:'koopa'},{x:2250,t:'goomba'},{x:2350,t:'koopa'},
{x:2450,t:'buzzy'},{x:2650,t:'koopa'},{x:2800,t:'buzzy'},
{x:2900,t:'koopa'},{x:3100,t:'buzzy'},
{x:3200,t:'hammerBro'},{x:3480,t:'goomba'},
{x:4120,t:'goomba'},{x:4320,t:'buzzy'},
{x:4420,t:'goomba'},{x:4720,t:'buzzy'},
{x:4500,t:'hammerBro'},{x:4600,t:'koopa'},{x:4750,t:'buzzy'},{x:4800,t:'koopa'},
{x:5350,t:'koopa'},{x:5500,t:'koopa'},{x:5600,t:'goomba'},
{x:5700,t:'hammerBro'},{x:5850,t:'koopa'},
{x:6100,t:'koopa'},
{x:6200,t:'goomba'},{x:6400,t:'koopa'},{x:6500,t:'buzzy'},
{x:6700,t:'goomba'},{x:6850,t:'buzzy'},{x:6900,t:'goomba'},
{x:7100,t:'goomba'},{x:7200,t:'buzzy'},{x:7300,t:'koopa'},
{x:400,t:'parakoopa'},{x:2500,t:'parakoopa'},{x:5800,t:'parakoopa'},{x:7000,t:'parakoopa'}
].forEach(({x,t})=>{
if(t==='hammerBro'){enemies.push({x,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5+Math.random(),vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80)})}
else if(t==='parakoopa'){const by=H-5*TILE;enemies.push({x,y:by,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:by,phase:Math.random()*Math.PI*2,shellTimer:0,walkFrame:0,walkTimer:0})}
else{enemies.push({x,y:H-2*TILE,w:TILE,h:t==='koopa'?TILE*1.2:t==='buzzy'?TILE*0.85:TILE,vx:t==='buzzy'?-1.8:-1.5,vy:0,alive:true,type:t,state:'walk',shellTimer:0,walkFrame:0,walkTimer:0})}
});

// Moving platforms
movingPlats.push(
{x:1850,y:H-4*TILE,w:TILE*2.5,h:12,type:'h',ox:1850,range:60,spd:1.8},
{x:3350,y:H-4*TILE,w:TILE*2.5,h:12,type:'h',ox:3350,range:120,spd:1.5},
{x:4350,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:4350,range:60,spd:2.0},
{x:5100,y:H-5*TILE,w:TILE*2.5,h:12,type:'h',ox:5100,range:100,spd:1.8},
{x:6550,y:H-3*TILE,w:TILE*2,h:12,type:'h',ox:6550,range:100,spd:1.6},
{x:1700,y:H-7*TILE,w:TILE*2,h:12,type:'v',oy:H-7*TILE,range:80,spd:1.2},
{x:4600,y:H-4*TILE,w:TILE*2,h:12,type:'v',oy:H-4*TILE,range:100,spd:1.3},
{x:2400,y:H-8*TILE,w:TILE*2,h:12,type:'fall',fallTimer:0,falling:false,oy:H-8*TILE,vy:0},
{x:3100,y:H-6*TILE,w:TILE*1.5,h:12,type:'fall',fallTimer:0,falling:false,oy:H-6*TILE,vy:0},
{x:5400,y:H-6*TILE,w:TILE*1.5,h:12,type:'fall',fallTimer:0,falling:false,oy:H-6*TILE,vy:0},
{x:6200,y:H-7*TILE,w:TILE*2,h:12,type:'fall',fallTimer:0,falling:false,oy:H-7*TILE,vy:0});
// Springs
springs.push({x:920,y:H-TILE-24,w:24,h:24,compressed:0},{x:2100,y:H-TILE-24,w:24,h:24,compressed:0},
{x:3480,y:H-TILE-24,w:24,h:24,compressed:0},{x:4900,y:H-TILE-24,w:24,h:24,compressed:0},
{x:5850,y:H-TILE-24,w:24,h:24,compressed:0},{x:6100,y:H-TILE-24,w:24,h:24,compressed:0});
// Checkpoint
G.checkpoint={x:3800,y:H-TILE,reached:false};
// Star block
platforms.push({x:2000,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
// 1UP hidden block
platforms.push({x:1600,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
// Coin blocks
platforms.push({x:800,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
platforms.push({x:4280,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:6,bounceOffset:0});

// === YOSHI EGG BLOCKS (green ? blocks) ===
platforms.push({x:500,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
platforms.push({x:3600,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
// ★ ハンマースーツ・巨大キノコ
platforms.push({x:960,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
platforms.push({x:2350,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0});
// ★ 装飾土管
pipes.push({x:1650,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
pipes.push({x:4600,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:2200,y:0,w:TILE*2,h:7*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:6000,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
piranhas.push({x:4624,baseY:6*TILE,y:6*TILE,w:16,h:TILE,phase:piranhas.length*0.7,alive:true,maxUp:TILE*1.5,ceiling:true});
pipes.push({x:1050,y:0,w:TILE*2,h:6*TILE,bounceOffset:0,isWarp:false,ceiling:true});
pipes.push({x:3350,y:0,w:TILE*2,h:5*TILE,bounceOffset:0,isWarp:false,ceiling:true});
// ★ 上空パタパタ（2段JMP対策、密度調整で2→1）
enemies.push({x:800,y:H-11*TILE,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:H-11*TILE,phase:0.0,shellTimer:0,walkFrame:0,walkTimer:0});

// ★ モンテ（CP後・地面突撃）
enemies.push({x:4800,y:H-2*TILE,w:TILE,h:TILE,vx:0,vy:0,alive:true,type:'montyMole',state:'hidden',walkFrame:0,walkTimer:0,onGround:false,facing:-1,emergeT:0});

// ピノキオ部屋ワープ天井パイプ（1ステージに1本）
pipes.push({x:2600,y:0,w:TILE*2,h:8*TILE,bounceOffset:0,isWarp:true,ceiling:true,variant:'pinocchio'});
}
