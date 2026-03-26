import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildUnderground(variant){
chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
// 共通構造: 床・天井・出口パイプ・右壁
const W=800;
for(let x=0;x<W;x+=TILE){platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});
if(x>0&&x<W-TILE)platforms.push({x,y:0,w:TILE,h:TILE,type:'ground',bounceOffset:0})}
pipes.push({x:W-3*TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
for(let wy=TILE;wy<H-4*TILE;wy+=TILE)platforms.push({x:W-TILE,y:wy,w:TILE,h:TILE,type:'ground',bounceOffset:0});
const Goomba=(x,y,w,h,alive=true)=>({x,y,w:w||TILE,h:h||TILE,vx:-1.3,vy:0,alive,type:'goomba',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
const K=(x,y)=>({x,y,w:TILE,h:TILE*1.2,vx:-1.3,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
if(variant==='goomba'){
// ★クリボーまつり★ クリボー10体 倒すと報酬
addRow(80,H-4*TILE,2,'brick');addRow(280,H-5*TILE,3,'brick');addRow(500,H-6*TILE,2,'brick');
for(let i=0;i<10;i++)enemies.push(Goomba(70+i*64,H-2*TILE));
for(let i=0;i<22;i++)coinItems.push({x:55+i*29,y:H-9*TILE,collected:false});
platforms.push({x:210,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:480,y:H-8*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
}else if(variant==='mushroom'){
// ★パワーアップの部屋★ きのこ×3 ＋ かくしスター
addRow(80,H-4*TILE,2,'brick');addRow(300,H-5*TILE,2,'brick');addRow(490,H-4*TILE,2,'brick');
platforms.push({x:140,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:340,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:540,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:390,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,hasStar:true,bounceOffset:0});
[{x:200},{x:420},{x:620}].forEach(({x})=>enemies.push(K(x,H-2*TILE)));
for(let i=0;i<16;i++)coinItems.push({x:65+i*40,y:H-8*TILE,collected:false});
}else if(variant==='danger1up'){
// ★1UPトリプルチャレンジ★ 1UPはてなブロック×3 ＋ 火柱4本（火柱のみ）
addRow(80,H-4*TILE,2,'brick');addRow(310,H-4*TILE,2,'brick');addRow(540,H-4*TILE,2,'brick');
platforms.push({x:140,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,has1UP:true,bounceOffset:0});
platforms.push({x:370,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,has1UP:true,bounceOffset:0});
platforms.push({x:600,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,has1UP:true,bounceOffset:0});
[{x:120,ph:0},{x:215,ph:65},{x:360,ph:30},{x:570,ph:50}].forEach(
({x,ph})=>lavaFlames.push({x,y:H-TILE,w:22,maxH:85,curH:0,phase:ph,period:130}));
}else if(variant==='star'){
// ★スターフェスティバル★ スター取って11体一斉倒し！
addRow(90,H-4*TILE,2,'brick');addRow(300,H-5*TILE,3,'brick');addRow(520,H-4*TILE,3,'brick');
platforms.push({x:370,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
platforms.push({x:220,y:H-8*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
[80,155,230,310,450,525,600,660].forEach(x=>enemies.push(Goomba(x,H-2*TILE)));
[{x:190},{x:400},{x:590}].forEach(({x})=>enemies.push(K(x,H-2*TILE)));
for(let i=0;i<26;i++)coinItems.push({x:55+i*25,y:H-8*TILE,collected:false});
platforms.push({x:480,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
}else if(variant==='desert1'){
// ★砂漠の宝箱部屋★ きのこブロック×2 + コイン30枚 + ノコノコ×2 + かくし1UP
addRow(80,H-4*TILE,2,'brick');addRow(310,H-5*TILE,2,'brick');addRow(490,H-4*TILE,2,'brick');
platforms.push({x:140,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:350,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:400,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
for(let i=0;i<30;i++)coinItems.push({x:55+i*22,y:H-7*TILE,collected:false});
[{x:200},{x:450}].forEach(({x})=>enemies.push({x,y:H-2*TILE,w:TILE,h:TILE*1.2,vx:-1.3,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0}));
jumpBlocks.push({x:550,y:H-2*TILE,w:28,h:28,vx:-1.5,vy:0,onGround:true,jumpTimer:60,alive:true});
}else if(variant==='desert2'){
// ★砂漠のコイン洞窟★ コイン大量 + コインブロック×3 + パイポ×2
addRow(80,H-4*TILE,3,'brick');addRow(300,H-6*TILE,3,'brick');addRow(520,H-4*TILE,3,'brick');
platforms.push({x:130,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:10,bounceOffset:0});
platforms.push({x:350,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:10,bounceOffset:0});
platforms.push({x:570,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:10,bounceOffset:0});
platforms.push({x:300,y:H-10*TILE,w:TILE,h:TILE,type:'hidden',hit:false,hasStar:true,bounceOffset:0});
for(let i=0;i<50;i++)coinItems.push({x:55+i*13,y:H-9*TILE,collected:false});
[{x:200,vy:-6},{x:450,vy:-7}].forEach(({x,vy})=>pipos.push({x,y:H-2*TILE-22,w:22,h:22,vx:-1.8,vy,alive:true,bounceCount:0}));
}else if(variant==='desert3'){
// ★2-2：パイポの洞窟★ パイポ×3 + jumpBlock×2 + コインブロック + 隠しきのこ
addRow(80,H-4*TILE,2,'brick');addRow(310,H-5*TILE,3,'brick');addRow(530,H-4*TILE,2,'brick');
platforms.push({x:140,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:380,y:H-7*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:8,bounceOffset:0});
platforms.push({x:500,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
for(let i=0;i<35;i++)coinItems.push({x:55+i*18,y:H-8*TILE,collected:false});
[{x:180,vy:-6},{x:350,vy:-7},{x:550,vy:-6}].forEach(({x,vy})=>pipos.push({x,y:H-2*TILE-22,w:22,h:22,vx:-1.8,vy,alive:true,bounceCount:0}));
[{x:260},{x:470}].forEach(({x})=>jumpBlocks.push({x,y:H-2*TILE,w:28,h:28,vx:-1.5,vy:0,onGround:true,jumpTimer:60,alive:true}));
}else if(variant==='desert4'){
// ★2-2：ワンワンの地下★ ワンワン×1 + パイポ×2 + 火柱×2 + 隠し1UP
addRow(80,H-4*TILE,2,'brick');addRow(300,H-5*TILE,2,'brick');addRow(520,H-4*TILE,2,'brick');
platforms.push({x:200,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
platforms.push({x:420,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
for(let i=0;i<28;i++)coinItems.push({x:55+i*24,y:H-7*TILE,collected:false});
chainChomps.push({x:420,y:H-TILE-28,w:28,h:28,postX:420,postY:H-TILE-28,vx:0,vy:0,phase:0,state:'idle',lungeTimer:0,alive:true});
[{x:180,vy:-7},{x:560,vy:-6}].forEach(({x,vy})=>pipos.push({x,y:H-2*TILE-22,w:22,h:22,vx:-1.8,vy,alive:true,bounceCount:0}));
[{x:130,ph:0},{x:340,ph:50}].forEach(({x,ph})=>lavaFlames.push({x,y:H-TILE,w:22,maxH:80,curH:0,phase:ph,period:130}));
}else{
// ★コインの楽園★ (default/'coin') コイン大量＋コインブロック×3
addRow(100,H-4*TILE,3,'brick');addRow(300,H-6*TILE,3,'brick');addRow(490,H-4*TILE,3,'brick');
for(let i=0;i<27;i++)coinItems.push({x:55+i*23,y:H-7*TILE,collected:false});
for(let i=0;i<19;i++)coinItems.push({x:95+i*29,y:H-9*TILE,collected:false});
for(let i=0;i<11;i++)coinItems.push({x:195+i*31,y:H-11*TILE,collected:false});
platforms.push({x:165,y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:12,bounceOffset:0});
platforms.push({x:385,y:H-8*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:12,bounceOffset:0});
platforms.push({x:565,y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:12,bounceOffset:0});
platforms.push({x:280,y:H-4*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:450,y:H-9*TILE,w:TILE,h:TILE,type:'hidden',hit:false,hasStar:true,bounceOffset:0});
}}
