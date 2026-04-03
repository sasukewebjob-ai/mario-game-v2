import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel3(){
[platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,particles,scorePopups,blockAnims,movingPlats,springs,cannons,bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
hammers.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;

// Ground with gaps
const gaps=[{s:1700,e:1870},{s:3100,e:3300},{s:4100,e:4260},{s:5000,e:5180},{s:5800,e:5940},{s:6600,e:6780}];
for(let x=0;x<LW;x+=TILE)if(!gaps.some(g=>x>=g.s&&x<g.e))platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

// Zone 1
addRow(160,H-5*TILE,1,'q');addRow(320,H-5*TILE,1,'q',true);addRow(480,H-5*TILE,2,'brick');
addRow(640,H-7*TILE,2,'q');addRow(800,H-5*TILE,3,'brick');
addRow(900,H-7*TILE,2,'q');addRow(1120,H-5*TILE,1,'q',true);
addRow(1300,H-5*TILE,2,'brick');addRow(1480,H-7*TILE,3,'brick');addStairD(1560,4);
// Zone 2
addRow(1900,H-5*TILE,3,'g');addRow(2050,H-7*TILE,2,'q');addRow(2200,H-5*TILE,2,'brick');
addRow(2380,H-7*TILE,1,'q',true);addRow(2520,H-5*TILE,3,'brick');
addRow(2680,H-5*TILE,3,'g');addRow(2830,H-7*TILE,3,'g');addRow(2980,H-5*TILE,2,'q');addStair(3040,3);
// Zone 3
addRow(3340,H-5*TILE,2,'brick');addRow(3500,H-7*TILE,2,'q',true);
addRow(3650,H-5*TILE,3,'brick');addRow(3820,H-7*TILE,2,'q');addStairD(3980,5);
// Zone 4
addRow(4290,H-5*TILE,2,'q');addRow(4450,H-5*TILE,3,'brick');
addRow(4600,H-7*TILE,3,'q',true);addRow(4780,H-5*TILE,2,'brick');addStair(4900,5);
// Zone 5
addRow(5210,H-5*TILE,2,'q');addRow(5370,H-7*TILE,2,'brick');
addRow(5510,H-5*TILE,3,'brick');addRow(5660,H-7*TILE,2,'q',true);
// Zone 6
addRow(5960,H-5*TILE,3,'q');addRow(6120,H-7*TILE,2,'brick');
addRow(6270,H-5*TILE,3,'brick');addRow(6430,H-7*TILE,2,'q',true);
// Zone 7
addRow(6810,H-5*TILE,2,'q');addRow(6970,H-7*TILE,2,'brick');addStair(7050,8);

// Pipes
[[680,2,false],[1350,3,'danger1up'],[2150,2,false],[3380,2,false],[4350,3,'star'],[5600,2,false],[6200,3,false],[7150,4,false]].forEach(([px,ph,warp])=>{
pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
pipes.forEach((p,i)=>{if(p.isWarp)return;piranhas.push({x:p.x+8,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});

// Coins
for(let i=0;i<50;i++)coinItems.push({x:180+i*150,y:H-10*TILE,collected:false});
for(let i=0;i<8;i++)coinItems.push({x:3400+i*60,y:H-(7+i%3)*TILE,collected:false});
for(let i=0;i<6;i++)coinItems.push({x:5200+i*60,y:H-(8-i%3)*TILE,collected:false});

// Enemies
[{x:280,t:'goomba'},{x:340,t:'goomba'},{x:400,t:'koopa'},{x:460,t:'goomba'},{x:520,t:'buzzy'},{x:600,t:'koopa'},{x:680,t:'goomba'},{x:750,t:'buzzy'},{x:820,t:'goomba'},{x:880,t:'koopa'},
{x:980,t:'hammerBro'},
{x:1030,t:'goomba'},{x:1100,t:'buzzy'},{x:1180,t:'koopa'},{x:1250,t:'goomba'},{x:1320,t:'koopa'},{x:1380,t:'buzzy'},{x:1450,t:'goomba'},{x:1530,t:'koopa'},{x:1600,t:'goomba'},{x:1650,t:'buzzy'},
{x:1960,t:'goomba'},{x:2030,t:'koopa'},{x:2100,t:'buzzy'},{x:2180,t:'goomba'},{x:2250,t:'koopa'},{x:2320,t:'goomba'},{x:2400,t:'buzzy'},{x:2480,t:'goomba'},{x:2560,t:'koopa'},{x:2640,t:'goomba'},{x:2750,t:'buzzy'},{x:2830,t:'koopa'},{x:2920,t:'goomba'},{x:3000,t:'buzzy'},{x:3050,t:'goomba'},
{x:3150,t:'hammerBro'},
{x:3360,t:'goomba'},{x:3430,t:'koopa'},{x:3510,t:'buzzy'},{x:3590,t:'goomba'},{x:3670,t:'koopa'},{x:3750,t:'buzzy'},{x:3840,t:'goomba'},{x:3930,t:'koopa'},
{x:4020,t:'hammerBro'},
{x:4290,t:'goomba'},{x:4370,t:'koopa'},{x:4450,t:'buzzy'},{x:4540,t:'goomba'},{x:4620,t:'koopa'},{x:4700,t:'goomba'},{x:4790,t:'buzzy'},{x:4870,t:'koopa'},
{x:4960,t:'hammerBro'},
{x:5200,t:'goomba'},{x:5280,t:'buzzy'},{x:5350,t:'koopa'},{x:5430,t:'goomba'},{x:5510,t:'koopa'},{x:5590,t:'buzzy'},{x:5680,t:'goomba'},{x:5760,t:'koopa'},
{x:5820,t:'hammerBro'},
{x:5970,t:'goomba'},{x:6040,t:'koopa'},{x:6120,t:'buzzy'},{x:6200,t:'goomba'},{x:6280,t:'koopa'},{x:6360,t:'buzzy'},{x:6450,t:'goomba'},{x:6530,t:'koopa'},{x:6620,t:'buzzy'},
{x:6820,t:'hammerBro'},{x:6900,t:'hammerBro'},
{x:6970,t:'goomba'},{x:7050,t:'koopa'},{x:7130,t:'buzzy'},{x:7250,t:'goomba'},{x:7330,t:'koopa'}
].forEach(({x,t})=>{
if(t==='hammerBro'){enemies.push({x,y:H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5+Math.random(),vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80)})}
else{enemies.push({x,y:H-2*TILE,w:TILE,h:t==='koopa'?TILE*1.2:t==='buzzy'?TILE*0.85:TILE,vx:t==='buzzy'?-1.8:-1.5,vy:0,alive:true,type:t,state:'walk',shellTimer:0,walkFrame:0,walkTimer:0})}
});

// Moving platforms (one over each gap)
movingPlats.push(
{x:1730,y:H-5*TILE,w:TILE*2.5,h:12,type:'h',ox:1730,range:70,spd:2.0},
{x:3120,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:3120,range:80,spd:1.8},
{x:3210,y:H-7*TILE,w:TILE*2,h:12,type:'h',ox:3210,range:60,spd:2.2},
{x:4130,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:4130,range:60,spd:2.4},
{x:5020,y:H-6*TILE,w:TILE*2.5,h:12,type:'h',ox:5020,range:80,spd:1.9},
{x:5820,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:5820,range:60,spd:2.1},
{x:6620,y:H-5*TILE,w:TILE*2,h:12,type:'h',ox:6620,range:80,spd:2.0},
{x:1980,y:H-7*TILE,w:TILE*2,h:12,type:'v',oy:H-7*TILE,range:80,spd:1.5},
{x:4700,y:H-5*TILE,w:TILE*2,h:12,type:'v',oy:H-5*TILE,range:90,spd:1.4},
{x:2600,y:H-8*TILE,w:TILE*1.5,h:12,type:'fall',fallTimer:0,falling:false,oy:H-8*TILE,vy:0},
{x:4500,y:H-7*TILE,w:TILE*1.5,h:12,type:'fall',fallTimer:0,falling:false,oy:H-7*TILE,vy:0},
{x:6900,y:H-6*TILE,w:TILE*1.5,h:12,type:'fall',fallTimer:0,falling:false,oy:H-6*TILE,vy:0});

// Springs
springs.push({x:900,y:H-TILE-24,w:24,h:24,compressed:0},{x:2080,y:H-TILE-24,w:24,h:24,compressed:0},
{x:3480,y:H-TILE-24,w:24,h:24,compressed:0},{x:5950,y:H-TILE-24,w:24,h:24,compressed:0});

// Cannons
cannons.push({x:1050,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:130,timer:70},
{x:2600,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:110,timer:50},
{x:4880,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:100,timer:40},
{x:5750,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:105,timer:60},
{x:6500,y:H-TILE*2,w:TILE,h:TILE*2,fireRate:95,timer:30});

// Checkpoint
G.checkpoint={x:4000,y:H-TILE,reached:false};
// Star block
platforms.push({x:1900,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
// 1UP hidden block
platforms.push({x:2800,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
// Coin blocks
platforms.push({x:750,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
platforms.push({x:4350,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:6,bounceOffset:0});
// Yoshi egg block
platforms.push({x:450,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
// チェックポイント以降: きのこ×2 スター×2
platforms.push({x:4720,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:6060,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:5280,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
platforms.push({x:6820,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
}
