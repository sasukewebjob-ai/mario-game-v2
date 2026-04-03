import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel(){
[platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,particles,scorePopups,blockAnims,movingPlats,springs,cannons,bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
hammers.length=0;lavaFlames.length=0;chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
yoshi.alive=false;yoshi.mounted=false;yoshi.eatCount=0;yoshi.eggsReady=0;yoshi.runAway=false;

// Ground - 2 narrow gaps only (easy)
const gaps=[{s:2300,e:2400},{s:4800,e:4900}];
for(let x=0;x<LW;x+=TILE)if(!gaps.some(g=>x>=g.s&&x<g.e))platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});

// Zone 1 - tutorial
addRow(160,H-5*TILE,1,'q',true);addRow(288,H-5*TILE,2,'brick');
addRow(576,H-5*TILE,2,'brick');addRow(640,H-5*TILE,1,'q',true);addRow(800,H-5*TILE,3,'brick');
// Zone 2
addRow(1024,H-5*TILE,1,'q');addRow(1152,H-7*TILE,2,'brick');
addRow(1440,H-5*TILE,2,'brick');addRow(1600,H-5*TILE,2,'g');addRow(1700,H-7*TILE,2,'g');
// Zone 3
addRow(1900,H-5*TILE,2,'q');addRow(2050,H-5*TILE,3,'brick');addRow(2100,H-7*TILE,1,'q',true);
addStair(2150,3);
// Zone 4 (after gap 1)
addRow(2450,H-5*TILE,2,'q');addRow(2600,H-5*TILE,3,'brick');addRow(2750,H-7*TILE,2,'q',true);
addRow(2900,H-5*TILE,2,'brick');
addRow(3300,H-5*TILE,2,'g');addRow(3400,H-7*TILE,2,'g');addRow(3550,H-5*TILE,2,'g');
// Zone 5
addRow(3750,H-5*TILE,1,'q');addRow(3900,H-5*TILE,2,'brick');addRow(4050,H-7*TILE,2,'q',true);
addRow(4250,H-5*TILE,2,'brick');
// Zone 6 (after gap 2)
addRow(4950,H-5*TILE,2,'q');addRow(5100,H-5*TILE,3,'brick');addRow(5250,H-7*TILE,2,'q',true);
addRow(5450,H-5*TILE,2,'brick');addRow(5650,H-5*TILE,3,'brick');addRow(5800,H-7*TILE,2,'q');
// Zone 7 - final
addRow(6000,H-5*TILE,2,'q',true);addRow(6150,H-5*TILE,3,'brick');
addRow(6350,H-5*TILE,2,'brick');addRow(6500,H-7*TILE,2,'q');addStair(6700,8);

// Pipes
[[500,2,false],[1350,3,'coin'],[3200,2,false],[5500,2,false],[7200,4,false]].forEach(([px,ph,warp])=>{
pipes.push({x:px,y:H-TILE-ph*TILE,w:TILE*2,h:ph*TILE,bounceOffset:0,isWarp:!!warp,variant:warp||null})});
pipes.forEach((p,i)=>{if(p.isWarp)return;piranhas.push({x:p.x+8,baseY:p.y,y:p.y,w:16,h:TILE,phase:i*1.5,alive:true,maxUp:TILE*1.5})});

// Coins
for(let i=0;i<50;i++)coinItems.push({x:150+i*148,y:H-8*TILE,collected:false});

// Enemies - goombas & few koopas only, well spaced
[{x:350,t:'goomba'},{x:450,t:'goomba'},{x:550,t:'goomba'},{x:700,t:'goomba'},{x:820,t:'goomba'},
{x:1050,t:'koopa'},{x:1150,t:'goomba'},{x:1250,t:'goomba'},{x:1370,t:'goomba'},{x:1480,t:'goomba'},{x:1580,t:'goomba'},
{x:1700,t:'goomba'},{x:1800,t:'goomba'},{x:1900,t:'goomba'},{x:2000,t:'goomba'},
{x:2050,t:'koopa'},{x:2500,t:'goomba'},{x:2600,t:'goomba'},{x:2700,t:'goomba'},{x:2820,t:'goomba'},
{x:2900,t:'goomba'},{x:3100,t:'koopa'},{x:3250,t:'goomba'},{x:3400,t:'goomba'},{x:3520,t:'goomba'},
{x:3650,t:'goomba'},{x:3800,t:'goomba'},{x:3900,t:'goomba'},{x:4050,t:'goomba'},{x:4200,t:'koopa'},
{x:4350,t:'goomba'},{x:4450,t:'goomba'},{x:4550,t:'goomba'},{x:5000,t:'goomba'},{x:5100,t:'goomba'},{x:5200,t:'goomba'},
{x:5450,t:'koopa'},{x:5600,t:'goomba'},{x:5700,t:'goomba'},{x:5820,t:'goomba'},
{x:5950,t:'goomba'},{x:6100,t:'goomba'},{x:6200,t:'goomba'},{x:6300,t:'goomba'},{x:6450,t:'koopa'},
{x:6600,t:'goomba'},{x:6700,t:'goomba'},{x:6800,t:'goomba'},{x:6900,t:'goomba'},{x:7050,t:'goomba'},{x:7200,t:'goomba'},{x:7350,t:'goomba'},
{x:2800,t:'parakoopa'},{x:5300,t:'parakoopa'}
].forEach(({x,t})=>{
if(t==='parakoopa'){const by=H-5*TILE;enemies.push({x,y:by,w:TILE,h:TILE*1.2,vx:-1.5,vy:0,alive:true,type:'parakoopa',state:'walk',flying:true,baseY:by,phase:Math.random()*Math.PI*2,shellTimer:0,walkFrame:0,walkTimer:0})}
else enemies.push({x,y:H-2*TILE,w:TILE,h:t==='koopa'?TILE*1.2:TILE,vx:-1.5,vy:0,alive:true,type:t,state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
});

// Moving platforms (over gaps)
movingPlats.push(
{x:2330,y:H-5*TILE,w:TILE*3,h:12,type:'h',ox:2330,range:50,spd:1.5},
{x:4820,y:H-5*TILE,w:TILE*3,h:12,type:'h',ox:4820,range:50,spd:1.5});

// Springs
springs.push({x:850,y:H-TILE-24,w:24,h:24,compressed:0},{x:4100,y:H-TILE-24,w:24,h:24,compressed:0});

// Checkpoint
G.checkpoint={x:3600,y:H-TILE,reached:false};
// Star block
platforms.push({x:1280,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
// 1UP hidden block
platforms.push({x:1900,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
// Coin blocks
platforms.push({x:352,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:10,bounceOffset:0});
platforms.push({x:3100,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
// Yoshi egg (early)
platforms.push({x:224,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
// ★ 新パワーアップテスト用
platforms.push({x:700,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMega:true,bounceOffset:0}); // 巨大キノコ
platforms.push({x:950,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0}); // ハンマースーツ
// ★ 装飾土管
pipes.push({x:1800,y:H-TILE-2*TILE,w:TILE*2,h:2*TILE,bounceOffset:0,isWarp:false});
pipes.push({x:4400,y:0,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,ceiling:true});
}
