// 描画: 背景・地形・敵・マリオ・ボス・HUD以外の画面表示・タイトル/ショップ/メニュー画面（main.js から分離）
// ゲームの状態は読むだけ。書き換えるのは描画用のキャッシュ（_darkCv など）と演出用の G の値だけにする
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,bowserShockwaves,
  iceBalls,marioHammers,gravityZones,windZones,windParticles,
  mario,yoshi,bowser,peach,flagPole,G,W,H,TILE,LW,pinoObj} from './globals.js';
import {STAGES,getStage,getStageById,getWorlds,getWorldStages} from './stages.js';
import {ACTIONS,mainKey,ACTION_LABEL,ACTION_DESC,SLOTS,binds,keyLabel} from './input.js';
import {getProgress} from './save.js';
// main.js と相互 import になるが、ここでは関数の中でしか使わない（読み込み時に触ると未初期化エラーになる）
import {ctx,_titleBtns,_SHOP_NEXT,_SHOP_DLG,_SHOP_BUY,_SHOP_CANCEL,_menuItems,_MP,_menuRowRects,_CF,_confirmBtns,_keysLayout,_gpConnected,_SINGLE_ONLY} from './main.js';

// ================================================================
// DRAWING - Enhanced Mario-style visuals
// ================================================================
function drawBG(){
// EX-2: 宇宙テーマ背景
if(G.isExStage&&G.exStageNum===2){
  const _sg=ctx.createLinearGradient(0,0,0,H);
  _sg.addColorStop(0,'#000010');_sg.addColorStop(0.5,'#050025');_sg.addColorStop(1,'#0a0050');
  ctx.fillStyle=_sg;ctx.fillRect(0,0,W,H);
  // 星雲（パープル・ピンク・青）
  ctx.globalAlpha=0.18;
  ctx.fillStyle='#9966ff';ctx.beginPath();ctx.arc(180,80,115,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ff66cc';ctx.beginPath();ctx.arc(580,140,88,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#6699ff';ctx.beginPath();ctx.arc(400,200,95,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  // 星（80個・パララックス）
  for(let _si=0;_si<80;_si++){
    const _sx=(((_si*137.5+G.cam*0.03)%W)+W)%W;
    const _sy=(_si*53.7)%H;
    const _sr=_si%5===0?2:_si%3===0?1.5:1;
    ctx.globalAlpha=0.55+(_si%4)*0.12;
    ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(_sx,_sy,_sr,0,Math.PI*2);ctx.fill();
  }
  // 大きい星のきらめき
  [80,210,450,620,740].forEach((_spx,_spi)=>{
    const _spy=55+_spi*36;
    const _spk=(G.frame*0.04+_spi*1.2)%(Math.PI*2);
    ctx.globalAlpha=0.45+Math.sin(_spk)*0.45;
    ctx.fillStyle='#ffffcc';ctx.beginPath();ctx.arc(((_spx-G.cam*0.02)+W*2)%W,_spy,2.5,0,Math.PI*2);ctx.fill();
  });
  ctx.globalAlpha=1;
  // 惑星（2個・パララックス）
  const _pl1x=((680-G.cam*0.04)%W+W)%W;
  ctx.fillStyle='#4466aa';ctx.globalAlpha=0.72;ctx.beginPath();ctx.arc(_pl1x,85,36,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(100,140,210,0.28)';ctx.globalAlpha=1;ctx.beginPath();ctx.arc(_pl1x,85,46,0,Math.PI*2);ctx.fill();
  const _pl2x=((150-G.cam*0.02+W*4)%W+W)%W;
  ctx.fillStyle='#8866aa';ctx.globalAlpha=0.60;ctx.beginPath();ctx.arc(_pl2x,165,22,0,Math.PI*2);ctx.fill();
  ctx.globalAlpha=1;
  return;
}
if(G.ugMode&&G.pinoRoom){
  // ピノキオ部屋：明るい空テーマ
  const _pbg=ctx.createLinearGradient(0,0,0,H);
  _pbg.addColorStop(0,'#44aaff');_pbg.addColorStop(0.6,'#88ccff');_pbg.addColorStop(1,'#ccf0ff');
  ctx.fillStyle=_pbg;ctx.fillRect(0,0,W,H);
  // 雲
  ctx.fillStyle='rgba(255,255,255,0.9)';
  [[80,40,50],[200,25,40],[380,50,55],[520,30,45],[680,45,50]].forEach(([cx,cy,cr])=>{
    ctx.beginPath();ctx.arc(cx,cy+18,cr*0.6,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+cr*0.6,cy+10,cr*0.8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(cx+cr*1.2,cy+18,cr*0.5,0,Math.PI*2);ctx.fill();
    ctx.fillRect(cx-cr*0.3,cy+14,cr*1.5+cr*0.4,cr*0.6);
  });
  return;
}
if(G.ugMode){
  ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);
  if(G.pipeDungeon){
    // SMB 1-2風: 青い石レンガ背景タイル（パララックス）
    const _ts=TILE,_px=-(Math.floor(G.cam*0.5)%_ts);
    for(let _y=0;_y<H;_y+=_ts){
      for(let _x=_px;_x<W+_ts;_x+=_ts){
        const _alt=((Math.floor((_x-_px)/_ts)+Math.floor(Math.floor(G.cam*0.5)/_ts))+(Math.floor(_y/_ts)))%2;
        ctx.fillStyle=_alt?'#0d1638':'#07102a';
        ctx.fillRect(_x,_y,_ts,_ts);
        ctx.fillStyle=_alt?'#1a2858':'#0f1a40';
        ctx.fillRect(_x,_y,_ts-1,1);ctx.fillRect(_x,_y,1,_ts-1);
      }
    }
  }else{
    ctx.fillStyle='#1a1a2e';
    for(let x=0;x<W;x+=TILE*3){ctx.fillRect(x,TILE,8,8);ctx.fillRect(x+16,TILE+16,8,8);}
  }
  return;
}
// bgTheme ベース背景
{const _bgS=getStage(G.currentWorld,G.currentLevel);
if(_bgS?.bgTheme==='beach'){
  // 海辺：明るい青空 + ヤシの木 + 海面
  const bg=ctx.createLinearGradient(0,0,0,H);
  bg.addColorStop(0,'#0077cc');bg.addColorStop(0.55,'#44aaee');bg.addColorStop(0.85,'#88ccff');bg.addColorStop(1,'#c0e8ff');
  ctx.fillStyle=bg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,255,160,0.45)';ctx.beginPath();ctx.arc(690,52,48,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fffde0';ctx.beginPath();ctx.arc(690,52,34,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffe866';ctx.beginPath();ctx.arc(690,52,24,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='rgba(0,120,200,0.16)';
  for(let wx=0;wx<W;wx+=44){const wy=H-TILE*1.1+Math.sin(wx*0.04+G.frame*0.04)*5;ctx.fillRect(wx,wy,38,5);}
  ctx.fillStyle='rgba(255,255,255,0.86)';
  [80,340,620,920,1250].forEach((cx,i)=>{const dx=cx-(G.cam%1500)*0.22;if(dx<-160||dx>W+160)return;const cy=22+(i%3)*24;ctx.beginPath();ctx.arc(dx+18,cy+18,14,0,Math.PI*2);ctx.arc(dx+38,cy+10,20,0,Math.PI*2);ctx.arc(dx+60,cy+18,14,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+5,cy+18,66,14);});
  ctx.fillStyle='#2a4a12';
  [200,680,1500,2800,4000,5500,6800].forEach((px,i)=>{const dx=px-(G.cam*0.18)%7500;if(dx<-90||dx>W+90)return;const ph=52+(i%2)*18;ctx.fillRect(dx+14,H-TILE-ph,7,ph);ctx.beginPath();ctx.moveTo(dx+17,H-TILE-ph);ctx.lineTo(dx-20,H-TILE-ph-16);ctx.lineTo(dx+10,H-TILE-ph-4);ctx.fill();ctx.beginPath();ctx.moveTo(dx+17,H-TILE-ph);ctx.lineTo(dx+54,H-TILE-ph-16);ctx.lineTo(dx+24,H-TILE-ph-4);ctx.fill();ctx.beginPath();ctx.moveTo(dx+17,H-TILE-ph);ctx.lineTo(dx+18,H-TILE-ph-26);ctx.lineTo(dx+22,H-TILE-ph-4);ctx.fill();});
  return;
}
if(_bgS?.bgTheme==='underwater'){
  const ug=ctx.createLinearGradient(0,0,0,H);
  ug.addColorStop(0,'#001a33');ug.addColorStop(0.5,'#002d5c');ug.addColorStop(1,'#004080');
  ctx.fillStyle=ug;ctx.fillRect(0,0,W,H);
  // 泡
  ctx.fillStyle='rgba(120,200,255,0.25)';
  for(let i=0;i<28;i++){const bx=(i*137+G.frame*0.18)%W,by=((i*53+G.frame*0.28*(1+i%3))%H);ctx.beginPath();ctx.arc(bx,by,1.5+i%3,0,Math.PI*2);ctx.fill();}
  // 海草
  [60,240,520,840,1300,2000,2700,3500,4400,5300,6200,7100].forEach((sx,i)=>{const dx=sx-(G.cam*0.25)%7800;if(dx<-50||dx>W+50)return;const sh=45+i%4*15;ctx.fillStyle='rgba(0,140,60,0.55)';for(let s=0;s<sh;s+=7){const sw=Math.sin(s*0.25+G.frame*0.025)*6;ctx.fillRect(dx+10+sw,H-TILE-s-7,7,7)}});
  // 光の筋
  ctx.fillStyle='rgba(80,160,255,0.05)';
  for(let r=0;r<5;r++){const rx=(r*180+G.cam*0.08)%W;ctx.beginPath();ctx.moveTo(rx,0);ctx.lineTo(rx-25,H);ctx.lineTo(rx+15,H);ctx.lineTo(rx+40,0);ctx.closePath();ctx.fill();}
  return;
}
if(_bgS?.bgTheme==='castle3'){
  // 海辺要塞：暗夜 + 溶岩光
  const cg3=ctx.createLinearGradient(0,0,0,H);
  cg3.addColorStop(0,'#020a0a');cg3.addColorStop(0.5,'#071218');cg3.addColorStop(1,'#10200a');
  ctx.fillStyle=cg3;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#ff3300';ctx.globalAlpha=0.09+0.05*Math.abs(Math.sin(G.frame*0.025));ctx.fillRect(0,H-TILE*2,W,TILE*2);ctx.globalAlpha=1;
  const _c3x=G.cam*0.15;ctx.fillStyle='rgba(48,18,8,0.42)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-_c3x%64);for(let by2=0;by2<H-TILE*3;by2+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by2/32))%2===0)ctx.fillRect(ox-32,by2,62,30)}}
  return;
}
if(_bgS?.bgTheme==='mountain'){
  // 山脈：青白い空 + 雪山シルエット
  const mg=ctx.createLinearGradient(0,0,0,H);
  mg.addColorStop(0,'#a8d8f0');mg.addColorStop(0.5,'#cce8ff');mg.addColorStop(1,'#e8f4ff');
  ctx.fillStyle=mg;ctx.fillRect(0,0,W,H);
  // 遠景の山（白い雪山・パララックス弱め）
  ctx.fillStyle='#e8eef4';
  [0,500,1100,1800,2600,3500,4500,5600,6700].forEach((mx,i)=>{const dx=mx-G.cam*0.05;if(dx<-400||dx>W+400)return;const mh=120+(i%4)*40;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.7,H-TILE-mh);ctx.lineTo(dx+mh*1.4,H-TILE);ctx.fill();});
  // 雪のキャップ
  ctx.fillStyle='#ffffff';
  [0,500,1100,1800,2600,3500,4500,5600,6700].forEach((mx,i)=>{const dx=mx-G.cam*0.05;if(dx<-400||dx>W+400)return;const mh=120+(i%4)*40;ctx.beginPath();ctx.moveTo(dx+mh*0.55,H-TILE-mh*0.6);ctx.lineTo(dx+mh*0.7,H-TILE-mh);ctx.lineTo(dx+mh*0.85,H-TILE-mh*0.6);ctx.fill();});
  // 中景の山（灰青・パララックス中）
  ctx.fillStyle='#8ab4cc';
  [200,900,1700,2700,3900,5100,6300].forEach((mx,i)=>{const dx=mx-G.cam*0.12;if(dx<-300||dx>W+300)return;const mh=90+(i%3)*30;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.8,H-TILE-mh);ctx.lineTo(dx+mh*1.6,H-TILE);ctx.fill();});
  // 雲
  ctx.fillStyle='rgba(255,255,255,0.88)';
  [100,550,1000,1600,2200,3000,3900,4800,5800,6700].forEach((cx,i)=>{const dx=cx-G.cam*0.25;if(dx<-140||dx>W+140)return;const cy=20+(i%4)*22;ctx.beginPath();ctx.arc(dx+25,cy+18,16,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+48,cy+12,22,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+72,cy+18,16,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+10,cy+18,68,12);});
  return;
}
if(_bgS?.bgTheme==='ice'){
  // 氷の平原：白い雪空 + 雪山 + 降雪
  const ig=ctx.createLinearGradient(0,0,0,H);
  ig.addColorStop(0,'#b8d8f0');ig.addColorStop(0.5,'#d4ecff');ig.addColorStop(1,'#eef6ff');
  ctx.fillStyle=ig;ctx.fillRect(0,0,W,H);
  // 遠景の雪山（白）
  ctx.fillStyle='#e8f4ff';
  [0,420,950,1700,2550,3600,4700,5900,7100].forEach((mx,i)=>{const dx=mx-G.cam*0.06;if(dx<-350||dx>W+350)return;const mh=100+(i%4)*38;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.65,H-TILE-mh);ctx.lineTo(dx+mh*1.3,H-TILE);ctx.fill();});
  // 雪のキャップ
  ctx.fillStyle='#ffffff';
  [0,420,950,1700,2550,3600,4700,5900,7100].forEach((mx,i)=>{const dx=mx-G.cam*0.06;if(dx<-350||dx>W+350)return;const mh=100+(i%4)*38;ctx.beginPath();ctx.moveTo(dx+mh*0.48,H-TILE-mh*0.58);ctx.lineTo(dx+mh*0.65,H-TILE-mh);ctx.lineTo(dx+mh*0.82,H-TILE-mh*0.58);ctx.fill();});
  // 綿雲
  ctx.fillStyle='rgba(255,255,255,0.92)';
  [60,480,940,1440,1980,2700,3520,4430,5360,6260].forEach((cx,i)=>{const dx=cx-G.cam*0.22;if(dx<-140||dx>W+140)return;const cy=12+(i%4)*22;ctx.beginPath();ctx.arc(dx+22,cy+16,14,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+44,cy+10,21,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+68,cy+16,14,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+8,cy+16,64,10);});
  // 降雪エフェクト
  ctx.fillStyle='rgba(255,255,255,0.85)';
  for(let i=0;i<35;i++){const sx=((i*223+G.frame*0.55*(1+i%3))%W);const sy=((i*149+G.frame*0.9*(1+i%2))%(H+20));const sr=i%3===0?2:1;ctx.beginPath();ctx.arc(sx,sy,sr,0,Math.PI*2);ctx.fill();}
  return;
}
if(_bgS?.bgTheme==='ice_castle'){
  // 氷の城：夜の氷雪空 + 星 + オーロラ
  const icg=ctx.createLinearGradient(0,0,0,H);
  icg.addColorStop(0,'#030d1c');icg.addColorStop(0.4,'#071828');icg.addColorStop(0.75,'#0a2038');icg.addColorStop(1,'#050f20');
  ctx.fillStyle=icg;ctx.fillRect(0,0,W,H);
  // 星
  for(let i=0;i<50;i++){const sx=(i*317)%W,sy=(i*211)%(H*0.6);ctx.fillStyle=`rgba(200,230,255,${0.15+Math.abs(Math.sin(G.frame*0.04+i))*0.85})`;ctx.fillRect(sx,sy,i%4===0?2:1,i%4===0?2:1);}
  // オーロラ（水平グロー帯）
  for(let r=0;r<3;r++){const ay=55+r*30,aw=0.025+r*0.01;ctx.fillStyle=`rgba(60,200,180,${0.04+Math.abs(Math.sin(G.frame*aw+r*2.1))*0.06})`;ctx.fillRect(0,ay,W,18);}
  // 暗い氷山シルエット
  ctx.fillStyle='#0a1828';
  [0,520,1250,2100,3100,4300,5600,6900].forEach((mx,i)=>{const dx=mx-G.cam*0.07;if(dx<-400||dx>W+400)return;const mh=110+(i%3)*32;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.65,H-TILE-mh);ctx.lineTo(dx+mh*1.3,H-TILE);ctx.fill();});
  // 氷の青白いグロー（床付近）
  ctx.fillStyle='rgba(80,160,255,0.05)';ctx.fillRect(0,H-TILE*3,W,TILE*3);
  // 城ブロックパターン
  const _icx=G.cam*0.15;ctx.fillStyle='rgba(8,22,50,0.42)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-_icx%64);for(let by=0;by<H-TILE*3;by+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30)}}
  return;
}
if(_bgS?.bgTheme==='mountain_castle'){
  // 山の城：夕暮れ雪山 + 城の影
  const mcg=ctx.createLinearGradient(0,0,0,H);
  mcg.addColorStop(0,'#0d0015');mcg.addColorStop(0.4,'#2a0a2e');mcg.addColorStop(0.75,'#4a1040');mcg.addColorStop(1,'#1a0a0a');
  ctx.fillStyle=mcg;ctx.fillRect(0,0,W,H);
  // 星
  ctx.fillStyle='#fff';for(let i=0;i<40;i++){const sx=(i*317)%W,sy=(i*211)%(H*0.6);ctx.globalAlpha=0.3+Math.abs(Math.sin(G.frame*0.05+i))*0.7;ctx.fillRect(sx,sy,1,1);}ctx.globalAlpha=1;
  // 暗い山シルエット
  ctx.fillStyle='#1a0a20';
  [0,600,1400,2400,3500,4700,6000].forEach((mx,i)=>{const dx=mx-G.cam*0.08;if(dx<-400||dx>W+400)return;const mh=130+(i%3)*35;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.lineTo(dx+mh*0.7,H-TILE-mh);ctx.lineTo(dx+mh*1.4,H-TILE);ctx.fill();});
  // 溶岩グロー
  ctx.fillStyle='rgba(255,40,0,0.07)';ctx.fillRect(0,H-TILE*3,W,TILE*3);
  const _cx4=G.cam*0.15;ctx.fillStyle='rgba(60,10,20,0.4)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-_cx4%64);for(let by=0;by<H-TILE*3;by+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30)}}
  return;
}
if(_bgS?.bgTheme==='fortress'){
  // 砦：暗い石造り内部 + 溶岩グロー + 松明の光
  const _fgg=ctx.createLinearGradient(0,0,0,H);
  _fgg.addColorStop(0,'#080810');_fgg.addColorStop(0.5,'#10101a');_fgg.addColorStop(0.85,'#18100a');_fgg.addColorStop(1,'#201008');
  ctx.fillStyle=_fgg;ctx.fillRect(0,0,W,H);
  // 石ブロックパターン
  const _foff=G.cam*0.12;ctx.fillStyle='rgba(38,36,34,0.52)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-_foff%64);for(let by=0;by<H-TILE*2;by+=32){if((Math.floor((bx+_foff)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30);}}
  // 溶岩グロー（床付近）
  ctx.fillStyle=`rgba(200,50,0,${0.07+0.03*Math.abs(Math.sin(G.frame*0.04))})`;ctx.fillRect(0,H-TILE*3,W,TILE*3);
  ctx.fillStyle=`rgba(255,90,0,${0.05+0.02*Math.abs(Math.sin(G.frame*0.05+1))})`;ctx.fillRect(0,H-TILE*2,W,TILE*2);
  // 松明の光（左右交互）
  [80,350,620,900,1180,1460,1750,2030,2310,2600,2890,3180,3480,3780,4080,4380,4680,4990,5290,5600,5900,6200,6510,6820,7130,7450].forEach((tx,i)=>{
    const dx=tx-G.cam;if(dx<-60||dx>W+60)return;
    const flk=0.7+0.3*Math.abs(Math.sin(G.frame*0.09+i*1.73));
    const ty=i%2===0?TILE*1.5:TILE*2.5;
    ctx.fillStyle=`rgba(255,140,0,${0.20*flk})`;ctx.beginPath();ctx.arc(dx,ty,24,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(255,180,0,${0.13*flk})`;ctx.beginPath();ctx.arc(dx,ty,15,0,Math.PI*2);ctx.fill();
    ctx.fillStyle=`rgba(255,200,80,${0.55*flk})`;ctx.fillRect(dx-2,ty-10,4,9);
  });
  return;
}
if(_bgS?.bgTheme==='airship'){
  // 飛行船艦隊：嵐夜の空 + 艦隊シルエット + エンジン排気 + サーチライト
  const ag=ctx.createLinearGradient(0,0,0,H);
  ag.addColorStop(0,'#010306');ag.addColorStop(0.35,'#060e1a');ag.addColorStop(0.72,'#0b1520');ag.addColorStop(1,'#03070e');
  ctx.fillStyle=ag;ctx.fillRect(0,0,W,H);
  // 稲光フラッシュ（強め）
  if(!G.optReduceFlash&&Math.random()<0.005){ctx.fillStyle=`rgba(160,190,255,${0.06+Math.random()*0.1})`;ctx.fillRect(0,0,W,H);}
  // 星（嵐で揺らぐ）
  for(let i=0;i<38;i++){const sx=(i*271+(G.cam*0.01|0))%W,sy=(i*173)%(H*0.42);ctx.fillStyle=`rgba(170,195,255,${0.04+Math.abs(Math.sin(G.frame*0.022+i*1.9))*0.65})`;ctx.fillRect(sx,sy,i%8===0?2:1,i%8===0?2:1);}
  // 嵐雲（大型・重厚）
  ctx.fillStyle='rgba(10,18,32,0.78)';
  [60,500,1100,1900,2900,4000,5300,6700].forEach((cx,i)=>{const dx=cx-G.cam*0.2;if(dx<-320||dx>W+320)return;const cy=10+(i%4)*18;const cw=190+(i%3)*75;ctx.beginPath();ctx.arc(dx+cw*0.22,cy+18,32+i%3*10,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+cw*0.5,cy+9,40+i%2*13,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+cw*0.78,cy+18,28+i%3*8,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+16,cy+13,cw-32,20);
    if((G.frame+i*71)%380<3){ctx.strokeStyle='rgba(180,210,255,0.6)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(dx+cw*0.5,cy+30);ctx.lineTo(dx+cw*0.52+8,cy+58);ctx.lineTo(dx+cw*0.5+5,cy+78);ctx.stroke();}
  });
  // 遠景艦隊シルエット（低速パララックス）
  [{x:100,w:270,h:28},{x:650,w:180,h:22},{x:1280,w:260,h:30},{x:2050,w:210,h:24},{x:2950,w:310,h:34},{x:3950,w:200,h:26},{x:5100,w:280,h:30},{x:6300,w:230,h:28},{x:7500,w:260,h:32}].forEach(({x,w,h},i)=>{
    const dx=x-G.cam*0.17;if(dx<-380||dx>W+380)return;
    const by=H-TILE-h;
    ctx.fillStyle='#070c18';
    ctx.fillRect(dx,by,w,h);                          // 船体
    ctx.fillRect(dx+(w*0.2|0),by-15,(w*0.4|0),15);   // 艦橋
    ctx.fillRect(dx+(w*0.31|0),by-25,(w*0.13|0),11); // マスト
    for(let j=0;j<4;j++){ctx.fillStyle=`rgba(255,210,80,${0.1+0.09*Math.sin(G.frame*0.04+i+j)})`;ctx.fillRect(dx+(w*0.22|0)+j*16,by+5,6,5);}  // 窓
    ctx.fillStyle=`rgba(255,85,10,${0.22+0.14*Math.sin(G.frame*0.08+i)})`;
    ctx.beginPath();ctx.arc(dx+8,by+(h*0.55|0),10,0,Math.PI*2);ctx.fill(); // エンジン光
  });
  // エンジン排気煙（アニメーション）
  for(let i=0;i<8;i++){const sx=(180+i*1050)-(G.cam*0.17|0);if(sx<-80||sx>W+80)continue;for(let j=0;j<5;j++){const age=(G.frame*1.3+j*44+i*290)%260;const al=Math.max(0,0.18-age*0.0007);if(al<=0)continue;ctx.fillStyle=`rgba(30,42,60,${al})`;ctx.beginPath();ctx.arc(sx,H-TILE*2.2-age*0.72,4+age*0.09,0,Math.PI*2);ctx.fill();}}
  // 手前甲板下端（搭乗中の船体シルエット）
  ctx.fillStyle='#080d1a';ctx.fillRect(0,H-TILE*1.3,W,TILE*0.45);
  ctx.fillStyle='rgba(255,85,10,0.13)';for(let ei=0;ei<W+100;ei+=96){ctx.fillRect((ei+((G.cam*0.45)|0))%W,H-TILE*1.3+1,12,5);}
  // サーチライト（左右スイープ）
  const _sa=(G.frame*0.48)%1200;const _sx=(_sa<600?_sa:1200-_sa)*(W/600);
  const _slg=ctx.createRadialGradient(_sx,H-TILE,0,_sx,H-TILE,W*0.62);
  _slg.addColorStop(0,'rgba(200,225,255,0.055)');_slg.addColorStop(1,'rgba(200,225,255,0)');
  ctx.fillStyle=_slg;ctx.fillRect(0,0,W,H);
  return;
}
}
if(G.currentWorld===2&&G.currentLevel===3){
  // 城（暗い赤〜黒グラデーション）
  const cg=ctx.createLinearGradient(0,0,0,H);
  cg.addColorStop(0,'#0a0000');cg.addColorStop(0.5,'#1e0505');cg.addColorStop(1,'#350808');
  ctx.fillStyle=cg;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,40,0,0.07)';ctx.fillRect(0,H-TILE*3,W,TILE*3);
  const cx2=G.cam*0.15;ctx.fillStyle='rgba(55,15,15,0.4)';
  for(let bx=0;bx<W+64;bx+=64){const ox=(bx-cx2%64);for(let by=0;by<H-TILE*3;by+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30)}}
  return;
}
if(G.currentWorld===2&&G.currentLevel===2){
  // 夕焼け砂漠
  const dg2=ctx.createLinearGradient(0,0,0,H);
  dg2.addColorStop(0,'#7b1a1a');dg2.addColorStop(0.4,'#c05000');dg2.addColorStop(0.75,'#e07820');dg2.addColorStop(1,'#a05020');
  ctx.fillStyle=dg2;ctx.fillRect(0,0,W,H);
  ctx.fillStyle='#7a3000';
  ctx.beginPath();ctx.moveTo(0,H);
  for(let i=0;i<=W;i+=60)ctx.lineTo(i,H-50-Math.abs(Math.sin(i*0.015+2))*70);
  ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  // 月
  ctx.fillStyle='#fff0a0';ctx.beginPath();ctx.arc(130,65,26,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#e08020';ctx.beginPath();ctx.arc(147,58,20,0,Math.PI*2);ctx.fill();
  return;
}
if(G.currentWorld===2){
  // 砂漠の空（オレンジ〜黄色グラデーション）
  const dg=ctx.createLinearGradient(0,0,0,H);
  dg.addColorStop(0,'#f4a460');dg.addColorStop(0.6,'#daa520');dg.addColorStop(1,'#cd853f');
  ctx.fillStyle=dg;ctx.fillRect(0,0,W,H);
  // 砂丘シルエット
  ctx.fillStyle='#c8a050';
  ctx.beginPath();ctx.moveTo(0,H);
  for(let i=0;i<=W;i+=40)ctx.lineTo(i,H-30-Math.sin(i*0.02+1)*25);
  ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  // 太陽
  ctx.fillStyle='#fff7aa';ctx.beginPath();ctx.arc(680,60,40,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#ffe066';ctx.beginPath();ctx.arc(680,60,32,0,Math.PI*2);ctx.fill();
  return;
}
// Evening sky (1-2)
if(G.currentLevel===2){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#1a1060');g.addColorStop(0.3,'#c04000');g.addColorStop(0.6,'#ff8c00');g.addColorStop(0.85,'#ffd040');g.addColorStop(1,'#ffe8a0');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(255,220,80,0.35)';ctx.beginPath();ctx.arc(W*0.72-G.cam*0.02,H*0.68,52,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ffe050';ctx.beginPath();ctx.arc(W*0.72-G.cam*0.02,H*0.68,36,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#2a1500';[400,1100,2200,3600,5100,6600].forEach(mx=>{const dx=mx-G.cam*0.25;if(dx<-300||dx>W+300)return;ctx.beginPath();ctx.moveTo(dx-20,H-TILE);ctx.quadraticCurveTo(dx+90,H-TILE-85,dx+200,H-TILE);ctx.fill();});
ctx.fillStyle='#1a0e00';[200,700,1500,2400,3300,4200,5100,6000].forEach((bx,i)=>{const dx=bx-G.cam*0.3;if(dx<-100||dx>W+100)return;const bw=44+(i%3)*20;ctx.beginPath();ctx.arc(dx,H-TILE+2,bw/3,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx-bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx+bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill();});
[100,500,900,1400,2100,2900,3700,4600,5500,6400].forEach((cx,i)=>{const dx=cx-G.cam*0.35;if(dx<-140||dx>W+140)return;const cy=35+(i%3)*28;ctx.fillStyle='rgba(255,150,50,0.65)';ctx.beginPath();ctx.arc(dx+30,cy+20,20,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+55,cy+14,26,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(dx+80,cy+20,20,0,Math.PI*2);ctx.fill();ctx.fillRect(dx+12,cy+20,76,16);});
return;}
// Castle (1-3)
if(G.currentWorld===1&&G.currentLevel===3){const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#0a0000');g.addColorStop(0.5,'#200505');g.addColorStop(1,'#3a0a0a');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(255,50,0,0.08)';ctx.fillRect(0,H-TILE*3,W,TILE*3);
const cx=G.cam*0.15;ctx.fillStyle='rgba(60,20,20,0.45)';
for(let bx=0;bx<W+64;bx+=64){const ox=(bx-cx%64);for(let by=0;by<H-TILE*3;by+=32){if((Math.floor((bx+G.cam*0.15)/64)+Math.floor(by/32))%2===0)ctx.fillRect(ox-32,by,62,30)}}
ctx.fillStyle='#ff3300';ctx.globalAlpha=0.12+0.06*Math.abs(Math.sin(G.frame*0.03));ctx.fillRect(0,H-TILE*1.5,W,TILE*2);ctx.globalAlpha=1;
return;}
// NES-style sky (1-1)
const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5C94FC');g.addColorStop(0.7,'#92BBFF');g.addColorStop(1,'#B0D0FF');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
// Far mountains
ctx.fillStyle='#7aaedc';[300,900,1800,3000,4500,6000].forEach(mx=>{const dx=mx-G.cam*0.08;if(dx<-200||dx>W+200)return;ctx.beginPath();ctx.moveTo(dx,H-TILE);ctx.quadraticCurveTo(dx+60,H-TILE-100,dx+120,H-TILE);ctx.fill()});
// Hills (rounded, with highlight)
[500,1200,2500,4000,5500,7000].forEach(mx=>{const dx=mx-G.cam*0.25;if(dx<-300||dx>W+300)return;
ctx.fillStyle='#5AB552';ctx.beginPath();ctx.moveTo(dx-20,H-TILE);ctx.quadraticCurveTo(dx+90,H-TILE-80,dx+200,H-TILE);ctx.fill();
ctx.fillStyle='#6CC864';ctx.beginPath();ctx.moveTo(dx+40,H-TILE);ctx.quadraticCurveTo(dx+90,H-TILE-60,dx+140,H-TILE);ctx.fill()});
// Bushes
[200,700,1500,2300,3200,4100,5000,5900,6800].forEach((bx,i)=>{const dx=bx-G.cam*0.3;if(dx<-100||dx>W+100)return;
const bw=40+(i%3)*20;ctx.fillStyle='#4AA844';ctx.beginPath();ctx.arc(dx,H-TILE+2,bw/3,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx-bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill();ctx.beginPath();ctx.arc(dx+bw/4,H-TILE+2,bw/4,Math.PI,0);ctx.fill()});
// Clouds (puffy NES style)
[100,500,850,1300,1800,2350,2900,3600,4300,5100,5900,6700].forEach((cx,i)=>{const dx=cx-G.cam*0.35;if(dx<-140||dx>W+140)return;const cy=50+(i%3)*35;
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(dx+30,cy+20,22,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(dx+55,cy+14,28,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(dx+80,cy+20,22,0,Math.PI*2);ctx.fill();
ctx.fillRect(dx+10,cy+20,82,16);
ctx.fillStyle='rgba(200,220,255,0.4)';ctx.beginPath();ctx.arc(dx+55,cy+10,16,0,Math.PI*2);ctx.fill()});
}

function drawTile(x,y,type,hit,bounce,color){
const py=y-bounce;
if(type==='ground'){
if(color){
ctx.fillStyle=color;ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='rgba(255,255,255,0.22)';ctx.fillRect(x+1,py+1,TILE-2,3);
ctx.fillStyle='rgba(0,0,0,0.22)';ctx.fillRect(x,py+TILE-3,TILE,3);
return;
}
if(G.pipeDungeon){
// SMB 1-2風: 青い石レンガ（地下ダンジョン）
ctx.fillStyle='#4a78e0';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#80acf8';ctx.fillRect(x+1,py+1,TILE-2,3);
ctx.fillStyle='#3560c8';ctx.fillRect(x+1,py+4,TILE-2,TILE-5);
ctx.fillStyle='#1830a0';ctx.fillRect(x,py+TILE/2,TILE,1);ctx.fillRect(x+TILE/2,py,1,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,1,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,1,TILE/2-1);
}else if(G.iceMode){
ctx.fillStyle='#7ec8e8';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#b4e0f4';ctx.fillRect(x+1,py+1,TILE-2,4);
ctx.fillStyle='#5aaad0';ctx.fillRect(x+1,py+5,TILE-2,TILE-6);
ctx.fillStyle='rgba(255,255,255,0.65)';ctx.fillRect(x+2,py+2,7,1);ctx.fillRect(x+20,py+3,8,1);
ctx.fillStyle='rgba(30,100,160,0.3)';ctx.fillRect(x,py+TILE/2,TILE,1);ctx.fillRect(x+TILE/2,py,1,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,1,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,1,TILE/2-1);
}else if(G.airshipMode){
ctx.fillStyle='#28303e';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#3a4452';ctx.fillRect(x+1,py+1,TILE-2,6);ctx.fillStyle='#222a36';ctx.fillRect(x+1,py+7,TILE-2,TILE-8);
ctx.fillStyle='#5a6475';ctx.fillRect(x+2,py+2,3,3);ctx.fillRect(x+TILE-5,py+2,3,3);
ctx.fillStyle='#181f28';ctx.fillRect(x,py+TILE/2,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+2,2,TILE/2-2);ctx.fillRect(x+3*TILE/4,py+TILE/2+2,2,TILE/2-2);
ctx.fillStyle='#c89000';ctx.fillRect(x,py+TILE-4,TILE,4);ctx.fillStyle='#181f28';for(let _di=0;_di<4;_di++)ctx.fillRect(x+_di*8,py+TILE-4,4,4);
ctx.fillStyle='rgba(255,255,255,0.07)';ctx.fillRect(x+1,py+1,TILE-2,2);
}else{
ctx.fillStyle='#C84C0C';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#E09060';ctx.fillRect(x+1,py+1,TILE-2,3);
ctx.fillStyle='#D07030';ctx.fillRect(x+1,py+4,TILE-2,TILE-5);
ctx.fillStyle='#A04000';ctx.fillRect(x,py+TILE/2,TILE,1);ctx.fillRect(x+TILE/2,py,1,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,1,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,1,TILE/2-1);
}}else if(type==='brick'){
if(G.pipeDungeon){
// SMB 1-2風: 青い石レンガブロック
ctx.fillStyle='#4a78e0';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#80acf8';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#1830a0';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,2,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,2,TILE/2-1);
ctx.fillStyle='rgba(255,255,255,0.18)';ctx.fillRect(x+2,py+2,TILE-4,2);
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x,py+TILE-2,TILE,2);
}else if(G.iceMode){
ctx.fillStyle='#3a88b8';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#4ea8d8';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#2a6888';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,2,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,2,TILE/2-1);
ctx.fillStyle='rgba(200,240,255,0.22)';ctx.fillRect(x+2,py+2,TILE-4,2);
ctx.fillStyle='rgba(0,40,90,0.15)';ctx.fillRect(x,py+TILE-2,TILE,2);
}else if(G.airshipMode){
ctx.fillStyle='#2c3442';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#3c4858';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#7c8898';ctx.fillRect(x+3,py+3,3,3);ctx.fillRect(x+TILE-6,py+3,3,3);ctx.fillRect(x+3,py+TILE-6,3,3);ctx.fillRect(x+TILE-6,py+TILE-6,3,3);
ctx.fillStyle='#1c2230';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,2,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,2,TILE/2-1);
ctx.fillStyle='rgba(255,255,255,0.07)';ctx.fillRect(x+2,py+2,TILE-4,2);
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(x,py+TILE-2,TILE,2);
}else{
ctx.fillStyle='#C04020';ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle='#D85840';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#A03018';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);ctx.fillRect(x+TILE/4,py+TILE/2+1,2,TILE/2-1);ctx.fillRect(x+3*TILE/4,py+TILE/2+1,2,TILE/2-1);
ctx.fillStyle='rgba(255,255,255,0.1)';ctx.fillRect(x+2,py+2,TILE-4,2);
ctx.fillStyle='rgba(0,0,0,0.15)';ctx.fillRect(x,py+TILE-2,TILE,2);
}
}else if(type==='question'||type==='yoshiEgg'){
if(hit){ctx.fillStyle='#8B7355';ctx.fillRect(x,py,TILE,TILE);ctx.fillStyle='#A08B6B';ctx.fillRect(x+2,py+2,TILE-4,TILE-4);ctx.fillStyle='#706050';ctx.fillRect(x+10,py+8,12,16)}
else{const pulse=Math.sin(G.frame*0.12)*0.12+0.88;const isYoshi=type==='yoshiEgg';
ctx.fillStyle=isYoshi?`hsl(120,60%,${Math.floor(42*pulse)}%)`:`hsl(42,100%,${Math.floor(52*pulse)}%)`;ctx.fillRect(x,py,TILE,TILE);
ctx.fillStyle=isYoshi?'#1a6d1a':'#B8860B';ctx.fillRect(x,py,TILE,2);ctx.fillRect(x,py,2,TILE);
ctx.fillStyle=isYoshi?'#4CAF50':'#FFD700';ctx.fillRect(x,py+TILE-2,TILE,2);ctx.fillRect(x+TILE-2,py,2,TILE);
ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.textAlign='center';
ctx.fillText(isYoshi?'Y':'?',x+TILE/2,py+TILE-7);ctx.textAlign='left'}
}else if(type==='pswitch'){
if(hit){ctx.fillStyle='#2244AA';ctx.fillRect(x,py+TILE-8,TILE,8);ctx.fillStyle='#1a3388';ctx.fillRect(x+2,py+TILE-6,TILE-4,4);}
else{const _pPulse=0.9+Math.sin(G.frame*0.1)*0.1;ctx.fillStyle=`hsl(220,70%,${Math.floor(45*_pPulse)}%)`;ctx.fillRect(x,py,TILE,TILE);ctx.fillStyle='#4488EE';ctx.fillRect(x+2,py+2,TILE-4,TILE-4);ctx.fillStyle='#fff';ctx.font='bold 18px monospace';ctx.textAlign='center';ctx.fillText('P',x+TILE/2,py+TILE-8);ctx.textAlign='left';ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x+2,py+2,TILE-4,4);ctx.fillStyle='#1a3388';ctx.fillRect(x,py,TILE,2);ctx.fillRect(x,py,2,TILE);ctx.fillStyle='#66aaff';ctx.fillRect(x,py+TILE-2,TILE,2);ctx.fillRect(x+TILE-2,py,2,TILE);}
}else if(type==='pswitch_block'){
const _pbPulse=0.12+Math.sin(G.frame*0.15)*0.08;
ctx.fillStyle='#4488CC';ctx.fillRect(x,py,TILE,TILE);ctx.fillStyle='#5599DD';ctx.fillRect(x+1,py+1,TILE-2,TILE-2);
ctx.fillStyle='#3377BB';ctx.fillRect(x,py+TILE/2-1,TILE,2);ctx.fillRect(x+TILE/2,py,2,TILE/2);
ctx.fillStyle=`rgba(100,200,255,${_pbPulse})`;ctx.fillRect(x,py,TILE,TILE);
}}

const _PCOLS={green:['#1E8C2A','#27AE60','#2ECC71'],red:['#7B241C','#C0392B','#E74C3C'],yellow:['#9A6B00','#D4AC0D','#F4D03F'],blue:['#1A4E7B','#2471A3','#5DADE2'],purple:['#5B2C6F','#8E44AD','#BB8FCE'],pink:['#880E4F','#D81B60','#F48FB1'],cyan:['#0D6E6E','#17A589','#76D7C4']};
const _PCNAMES=['green','red','yellow','blue','purple','pink','cyan'];
function drawPipe(x,y,w,h,ceil,color,horizontal){
const _c=_PCOLS[color||_PCNAMES[Math.floor(x/321)%7]]||_PCOLS.green;
if(horizontal){
  // 横向き土管（開口=左）
  ctx.fillStyle=_c[0];ctx.fillRect(x,y,w,h);
  ctx.fillStyle=_c[1];ctx.fillRect(x+2,y+2,w-2,h-4);
  ctx.fillStyle=_c[2];ctx.fillRect(x+4,y+4,w-8,8);
  ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(x+4,y+6,w-8,3);
  // 左リム（開口側）
  ctx.fillStyle=_c[0];ctx.fillRect(x,y-4,16,h+8);
  ctx.fillStyle=_c[1];ctx.fillRect(x+2,y-2,12,h+4);
  ctx.fillStyle=_c[2];ctx.fillRect(x+3,y+3,8,8);
  ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(x+4,y+4,3,6);
  return;
}
ctx.fillStyle=_c[0];ctx.fillRect(x,y,w,h);
ctx.fillStyle=_c[1];ctx.fillRect(x+2,y+2,w-4,h-2);
ctx.fillStyle=_c[2];ctx.fillRect(x+4,y+2,8,h-4);
ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(x+6,y+2,3,h-4);
if(ceil){ctx.fillStyle=_c[0];ctx.fillRect(x-4,y+h-16,w+8,16);ctx.fillStyle=_c[1];ctx.fillRect(x-2,y+h-14,w+4,12);ctx.fillStyle=_c[2];ctx.fillRect(x,y+h-13,8,8);ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(x+2,y+h-12,3,6);}
else{ctx.fillStyle=_c[0];ctx.fillRect(x-4,y,w+8,16);ctx.fillStyle=_c[1];ctx.fillRect(x-2,y+2,w+4,12);ctx.fillStyle=_c[2];ctx.fillRect(x,y+3,8,8);ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(x+2,y+4,3,6);}
}

// 色の明暗シェード（キャラ描画の陰影用）。#abc / #aabbcc 両対応
// 左右反転(scale(-1,1))の中でも文字を正しい向きで描く
function _fillTextUpright(t,x,y){const m=ctx.getTransform?ctx.getTransform():null;if(m&&m.a<0){ctx.save();ctx.scale(-1,1);ctx.fillText(t,-x,y);ctx.restore();}else ctx.fillText(t,x,y);}
function _shade(hex,amt){let h=hex.slice(1);if(h.length===3)h=h.split('').map(c=>c+c).join('');const n=parseInt(h,16);const r=Math.min(255,Math.max(0,(n>>16)+amt)),g=Math.min(255,Math.max(0,((n>>8)&255)+amt)),b=Math.min(255,Math.max(0,(n&255)+amt));return 'rgb('+r+','+g+','+b+')';}

function drawMario(mx,my,facing,wf,dead,big){
ctx.save();
if(mario.inv>0&&Math.floor(G.frame/4)%2===0){ctx.restore();return}
// 重力反転時は上下反転
if(G.gravityFlipped&&!dead){ctx.translate(0,my+mario.h);ctx.scale(1,-1);ctx.translate(0,-(my));}
if(facing===-1){ctx.translate(mx+26,0);ctx.scale(-1,1);mx=0}else{ctx.translate(mx,0);mx=0}
const isFire=mario.power==='fire';const isIce=mario.power==='ice';const isHammer=mario.power==='hammer';const isMega=G.megaTimer>0;
const _isLuigi=G.character==='luigi';
const hatC=isIce?'#88ddff':isHammer?'#666':isFire?'#fff':(_isLuigi?'#27AE60':'#E52521');
const shirtC=isIce?'#2288cc':isHammer?'#444':isFire?(_isLuigi?'#27AE60':'#E52521'):(_isLuigi?'#1a55bb':'#0050C8');
const skinC='#FBD000',hairC=isHammer?'#444':'#6B3410',shoeC=isHammer?'#333':'#6B3410';
const hatD=_shade(hatC,-55),hatL=_shade(hatC,40),shirtD=_shade(shirtC,-50),skinD=_shade(skinC,-50),shoeD=_shade(shoeC,-45);
const embC=isFire?(_isLuigi?'#27AE60':'#E52521'):hatC==='#fff'?'#E52521':hatC; // 帽子エンブレムの文字色
const _air=!mario.onGround&&!G.waterMode&&!mario.crouching; // ジャンプポーズ

// 帽子エンブレム（白丸 + M/L）。cx,cy=丸の中心
const emblem=(cx,cy,r)=>{ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();ctx.fillStyle=embC;
if(_isLuigi){ctx.fillRect(cx-2,cy-2.5,2,5);ctx.fillRect(cx-2,cy+1.5,4,1.5);}
else{ctx.fillRect(cx-2.5,cy-2.5,1.5,5);ctx.fillRect(cx+1,cy-2.5,1.5,5);ctx.fillRect(cx-1,cy-1.5,2,2);}};

if(dead){
// 死亡ポーズ: X目 + 開いた口 + 両腕上げ
ctx.fillStyle=hatC;ctx.fillRect(mx+4,my,20,7);ctx.fillStyle=hatD;ctx.fillRect(mx+4,my+5,20,2);
ctx.fillStyle=skinC;ctx.fillRect(mx+4,my+7,20,10);
ctx.fillStyle='#000';ctx.fillRect(mx+8,my+9,4,4);ctx.fillRect(mx+16,my+9,4,4);
ctx.fillStyle=skinC;ctx.fillRect(mx+9,my+10,2,2);ctx.fillRect(mx+17,my+10,2,2);
ctx.fillStyle='#7a2c12';ctx.fillRect(mx+11,my+14,6,3);
ctx.fillStyle=shirtC;ctx.fillRect(mx+2,my+17,24,10);ctx.fillStyle=shirtD;ctx.fillRect(mx+2,my+25,24,2);
ctx.fillStyle='#fff';ctx.fillRect(mx-4,my+10,6,6);ctx.fillRect(mx+24,my+10,6,6);
ctx.restore();return}
if(big){
if(mario.crouching){
// Big Mario crouching (h=24px)
ctx.fillStyle=hatC;ctx.fillRect(mx+6,my,18,5);ctx.fillRect(mx+2,my+3,24,5);ctx.fillStyle=hatL;ctx.fillRect(mx+8,my+1,12,2);
ctx.fillStyle=hatC;ctx.fillRect(mx+18,my+5,10,3);ctx.fillStyle=hatD;ctx.fillRect(mx+18,my+7,10,1);
emblem(mx+11,my+4,3.5);
ctx.fillStyle=hairC;ctx.fillRect(mx+2,my+7,4,4);
ctx.fillStyle=skinC;ctx.fillRect(mx+4,my+9,20,8);
ctx.fillStyle='#fff';ctx.fillRect(mx+7,my+10,5,4);ctx.fillRect(mx+14,my+10,5,4);
ctx.fillStyle='#000';ctx.fillRect(mx+9,my+11,3,3);ctx.fillRect(mx+16,my+11,3,3);
ctx.fillStyle=skinC;ctx.fillRect(mx+19,my+12,7,5);ctx.fillStyle=skinD;ctx.fillRect(mx+19,my+15,7,2);
ctx.fillStyle=hairC;ctx.fillRect(mx+13,my+15,12,2);
ctx.fillStyle=shirtC;ctx.fillRect(mx+4,my+17,20,5);ctx.fillStyle=shirtD;ctx.fillRect(mx+4,my+20,20,2);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+18,3,2);ctx.fillRect(mx+16,my+18,3,2);
ctx.fillStyle=shoeC;ctx.fillRect(mx+2,my+22,10,2);ctx.fillRect(mx+14,my+22,10,2);
if(isHammer){ctx.fillStyle='#888';ctx.fillRect(mx+2,my-4,24,8);ctx.fillStyle='#aaa';ctx.fillRect(mx+4,my-3,20,5);ctx.fillStyle='#666';ctx.fillRect(mx+6,my-6,16,4);}
}else{
// === Big Mario standing/walking/jumping ===
// Hat（ドーム + つば前方 + ハイライト/影 + エンブレム）
ctx.fillStyle=hatC;ctx.fillRect(mx+5,my,19,6);ctx.fillRect(mx+2,my+4,22,5);
ctx.fillStyle=hatL;ctx.fillRect(mx+7,my+1,12,2);
ctx.fillStyle=hatC;ctx.fillRect(mx+17,my+6,11,4);ctx.fillStyle=hatD;ctx.fillRect(mx+17,my+8,11,2);
emblem(mx+11,my+4,4);
// Hair（後頭部＋もみあげ）
ctx.fillStyle=hairC;ctx.fillRect(mx+2,my+8,4,8);
// Face + 耳 + あご影
ctx.fillStyle=skinC;ctx.fillRect(mx+4,my+10,20,12);
ctx.fillStyle=skinD;ctx.fillRect(mx+4,my+14,3,5);ctx.fillRect(mx+6,my+20,18,2);
// Eyes（前方寄りの瞳）
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+11,5,6);ctx.fillRect(mx+15,my+11,5,6);
ctx.fillStyle='#000';ctx.fillRect(mx+10,my+12,3,4);ctx.fillRect(mx+17,my+12,3,4);
// 大きな鼻（前方に突出）
ctx.fillStyle=skinC;ctx.fillRect(mx+19,my+14,8,6);
ctx.fillStyle=skinD;ctx.fillRect(mx+19,my+18,8,2);
// ヒゲ（鼻の下）
ctx.fillStyle=hairC;ctx.fillRect(mx+13,my+19,12,3);ctx.fillRect(mx+12,my+20,2,2);
// シャツ（腕含む）と オーバーオール
ctx.fillStyle=hatC;ctx.fillRect(mx+4,my+22,20,5);
ctx.fillStyle=shirtC;ctx.fillRect(mx+6,my+25,16,11);
ctx.fillRect(mx+6,my+22,4,4);ctx.fillRect(mx+18,my+22,4,4); // 肩ストラップ
ctx.fillStyle='#FFD700';ctx.fillRect(mx+7,my+24,3,3);ctx.fillRect(mx+18,my+24,3,3);
ctx.fillStyle=shirtD;ctx.fillRect(mx+6,my+34,16,2);
// 腕（ジャンプ中は前腕を上げる）+ 白手袋
ctx.fillStyle=hatC;
if(_air){ctx.fillRect(mx-4,my+20,7,9);ctx.fillRect(mx+23,my+12,7,12);
ctx.fillStyle='#fff';ctx.fillRect(mx-5,my+26,8,6);ctx.fillRect(mx+23,my+7,8,6);}
else{ctx.fillRect(mx-4,my+22,7,9);ctx.fillRect(mx+23,my+22,7,9);
ctx.fillStyle='#fff';ctx.fillRect(mx-5,my+29,8,6);ctx.fillRect(mx+23,my+29,8,6);}
// Legs + 2トーン靴
const lo=wf===1?[-3,3]:wf===2?[3,-3]:[0,0];
ctx.fillStyle=shirtC;ctx.fillRect(mx+4+lo[0],my+36,10,6);ctx.fillRect(mx+16+lo[1],my+36,10,6);
ctx.fillStyle=shoeC;ctx.fillRect(mx+1+lo[0],my+42,13,6);ctx.fillRect(mx+14+lo[1],my+42,13,6);
ctx.fillStyle=shoeD;ctx.fillRect(mx+1+lo[0],my+46,13,2);ctx.fillRect(mx+14+lo[1],my+46,13,2);
// ハンマースーツのヘルメット
if(isHammer){ctx.fillStyle='#888';ctx.fillRect(mx+2,my-4,24,8);ctx.fillStyle='#aaa';ctx.fillRect(mx+4,my-3,20,5);ctx.fillStyle='#666';ctx.fillRect(mx+6,my-6,16,4);}
}}else{
if(mario.crouching){
// Small Mario crouching (h=20px)
ctx.fillStyle=hatC;ctx.fillRect(mx+6,my,18,5);ctx.fillRect(mx+2,my+3,24,4);ctx.fillStyle=hatL;ctx.fillRect(mx+8,my+1,12,1.5);
ctx.fillStyle=hatC;ctx.fillRect(mx+17,my+4,10,3);ctx.fillStyle=hatD;ctx.fillRect(mx+17,my+6,10,1);
emblem(mx+10,my+3.5,3);
ctx.fillStyle=skinC;ctx.fillRect(mx+4,my+7,20,7);
ctx.fillStyle='#fff';ctx.fillRect(mx+7,my+8,4,4);ctx.fillRect(mx+14,my+8,4,4);
ctx.fillStyle='#000';ctx.fillRect(mx+9,my+9,2,3);ctx.fillRect(mx+16,my+9,2,3);
ctx.fillStyle=skinC;ctx.fillRect(mx+19,my+9,7,4);ctx.fillStyle=skinD;ctx.fillRect(mx+19,my+12,7,1);
ctx.fillStyle=hairC;ctx.fillRect(mx+13,my+12,12,2);
ctx.fillStyle=shirtC;ctx.fillRect(mx+4,my+14,20,4);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+15,3,2);ctx.fillRect(mx+16,my+15,3,2);
ctx.fillStyle=shoeC;ctx.fillRect(mx+2,my+18,10,2);ctx.fillRect(mx+14,my+18,10,2);
}else{
// === Small Mario ===
ctx.fillStyle=hatC;ctx.fillRect(mx+5,my,18,5);ctx.fillRect(mx+2,my+3,22,4);
ctx.fillStyle=hatL;ctx.fillRect(mx+7,my+1,11,1.5);
ctx.fillStyle=hatC;ctx.fillRect(mx+16,my+5,10,3);ctx.fillStyle=hatD;ctx.fillRect(mx+16,my+6,10,2);
emblem(mx+10,my+3.5,3);
ctx.fillStyle=hairC;ctx.fillRect(mx+3,my+7,3,6);
ctx.fillStyle=skinC;ctx.fillRect(mx+4,my+8,20,8);
ctx.fillStyle=skinD;ctx.fillRect(mx+6,my+14,14,2);
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+9,4,5);ctx.fillRect(mx+15,my+9,4,5);
ctx.fillStyle='#000';ctx.fillRect(mx+10,my+10,2,3);ctx.fillRect(mx+17,my+10,2,3);
ctx.fillStyle=skinC;ctx.fillRect(mx+19,my+11,7,5);ctx.fillStyle=skinD;ctx.fillRect(mx+19,my+14,7,2);
ctx.fillStyle=hairC;ctx.fillRect(mx+13,my+14,12,2);
ctx.fillStyle=shirtC;ctx.fillRect(mx+4,my+16,20,10);
ctx.fillStyle=shirtD;ctx.fillRect(mx+4,my+24,20,2);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+18,3,3);ctx.fillRect(mx+16,my+18,3,3);
ctx.fillStyle=shirtC;
if(_air){ctx.fillRect(mx-3,my+15,6,5);ctx.fillRect(mx+23,my+8,6,9);
ctx.fillStyle='#fff';ctx.fillRect(mx-4,my+19,6,4);ctx.fillRect(mx+23,my+4,6,4);}
else{ctx.fillRect(mx-3,my+16,6,6);ctx.fillRect(mx+23,my+16,6,6);
ctx.fillStyle='#fff';ctx.fillRect(mx-4,my+21,6,4);ctx.fillRect(mx+23,my+21,6,4);}
const lo=wf===1?[-3,3]:wf===2?[3,-3]:[0,0];
ctx.fillStyle=shoeC;ctx.fillRect(mx+2+lo[0],my+26,12,6);ctx.fillRect(mx+14+lo[1],my+26,12,6);
ctx.fillStyle=shoeD;ctx.fillRect(mx+2+lo[0],my+30,12,2);ctx.fillRect(mx+14+lo[1],my+30,12,2);
}}
ctx.restore();
}

function drawYoshiBody(yx,yy,facing,mounted){
ctx.save();
if(facing===-1){ctx.translate(yx+30,0);ctx.scale(-1,1);yx=0}else{ctx.translate(yx,0);yx=0}
// 歩行アニメ（接地して動いている時だけ脚を交互に）
const _wo=(yoshi.onGround&&Math.abs(yoshi.vx)>0.2)?(yoshi.walkFrame===0?[-2,2]:[2,-2]):[0,0];
// Boots（2トーン + ハイライト）
ctx.fillStyle='#a04000';ctx.fillRect(yx-1+_wo[0],yy+37,14,3);ctx.fillRect(yx+17+_wo[1],yy+37,14,3);
ctx.fillStyle='#d35400';ctx.fillRect(yx-1+_wo[0],yy+33,14,5);ctx.fillRect(yx+17+_wo[1],yy+33,14,5);
ctx.fillStyle='#f39c12';ctx.fillRect(yx+1+_wo[0],yy+30,11,4);ctx.fillRect(yx+18+_wo[1],yy+30,11,4);
// Legs
ctx.fillStyle='#27ae60';ctx.fillRect(yx+3+_wo[0],yy+22,9,12);ctx.fillRect(yx+18+_wo[1],yy+22,9,12);
ctx.fillStyle='#1e8449';ctx.fillRect(yx+3+_wo[0],yy+22,2,12);ctx.fillRect(yx+18+_wo[1],yy+22,2,12);
// Body (round) + 下部シェーディング
ctx.fillStyle='#27ae60';ctx.beginPath();ctx.arc(yx+14,yy+19,13,0,Math.PI*2);ctx.fill();ctx.fillRect(yx+2,yy+15,24,14);
ctx.fillStyle='#1e8449';ctx.fillRect(yx+3,yy+27,22,3);
// White belly + ハイライト
ctx.fillStyle='#ecf0f1';ctx.beginPath();ctx.arc(yx+12,yy+22,7,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(yx+10,yy+20,3,0,Math.PI*2);ctx.fill();
// 前腕（小さな腕）
ctx.fillStyle='#2ecc71';ctx.fillRect(yx+23,yy+17,6,7);ctx.fillStyle='#1e8449';ctx.fillRect(yx+27,yy+22,2,2);
// Saddle（常時。騎乗中はマリオが上に乗る）
ctx.fillStyle='#e74c3c';ctx.fillRect(yx+2,yy+9,26,8);ctx.fillStyle='#c0392b';ctx.fillRect(yx+4,yy+11,22,4);
ctx.fillStyle='#fff';ctx.fillRect(yx+2,yy+15,26,2);
// Back spike
ctx.fillStyle='#1e8449';ctx.beginPath();ctx.arc(yx+9,yy+11,7,Math.PI,0);ctx.fill();ctx.fillStyle='#145a14';ctx.fillRect(yx+4,yy+11,10,3);
ctx.restore();
}

function drawYoshiHead(yx,yy,facing){
ctx.save();
if(facing===-1){ctx.translate(yx+30,0);ctx.scale(-1,1);yx=0}else{ctx.translate(yx,0);yx=0}
const _chewing=yoshi.chewTimer>0;
const _eating=!!yoshi.eatTarget;
// Neck
ctx.fillStyle='#2ecc71';ctx.fillRect(yx+17,yy+10,9,10);
// Head
ctx.fillStyle='#27ae60';ctx.beginPath();ctx.arc(yx+22,yy+7,11,0,Math.PI*2);ctx.fill();ctx.fillRect(yx+12,yy+2,14,12);
// Snout（飲み込み中は膨らむ）
if(_chewing){
  const _cPulse=Math.sin(yoshi.chewTimer*0.8)*2;
  ctx.fillStyle='#52be80';ctx.beginPath();ctx.arc(yx+28,yy+10,9+_cPulse,0,Math.PI*2);ctx.fill();
  // 頬の膨らみ
  ctx.fillStyle='#5fcf8b';ctx.beginPath();ctx.arc(yx+30,yy+12,5+_cPulse*0.5,0,Math.PI*2);ctx.fill();
  // 口（モグモグ）
  const _mOpen=Math.abs(Math.sin(yoshi.chewTimer*1.2))*3;
  ctx.fillStyle='#1a1a1a';ctx.fillRect(yx+31,yy+11-_mOpen/2,5,2+_mOpen);
} else if(_eating){
  // 口を大きく開けて待ち構える
  ctx.fillStyle='#52be80';ctx.beginPath();ctx.arc(yx+28,yy+10,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#c0392b';ctx.beginPath();ctx.arc(yx+33,yy+11,4,0,Math.PI*2);ctx.fill();
} else {
  ctx.fillStyle='#52be80';ctx.beginPath();ctx.arc(yx+28,yy+10,7,0,Math.PI*2);ctx.fill();
}
// Nostrils
ctx.fillStyle='#145a14';ctx.beginPath();ctx.arc(yx+26,yy+7,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(yx+30,yy+7,1.5,0,Math.PI*2);ctx.fill();
// Eye white
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(yx+19,yy+4,5,0,Math.PI*2);ctx.fill();
// Pupil（食べてる時は嬉しそうに）
if(_chewing){
  ctx.fillStyle='#1a1a1a';ctx.fillRect(yx+17,yy+4,7,2);
} else {
  ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(yx+20,yy+4,3,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(yx+22,yy+3,1.2,0,Math.PI*2);ctx.fill();
}
// Tongue + 捕まえた敵の描画
if(yoshi.tongueOut>0&&yoshi.tongueLen>0){
  ctx.fillStyle='#e91e63';const tLen=yoshi.tongueLen;
  ctx.fillRect(yx+32,yy+9,tLen,5);
  ctx.beginPath();ctx.arc(yx+32+tLen,yy+11,5,0,Math.PI*2);ctx.fill();
  // 引き戻し中：舌先に敵を描画
  if(yoshi.eatTarget){
    ctx.fillStyle=yoshi.eatTarget.color||'#8B4513';
    ctx.beginPath();ctx.arc(yx+32+tLen,yy+11,7,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.3)';
    ctx.beginPath();ctx.arc(yx+32+tLen,yy+11,7,0,Math.PI*2);ctx.fill();
  }
}
// Egg indicator
if(yoshi.eggsReady>0){ctx.fillStyle='#fff';ctx.font='bold 10px monospace';ctx.textAlign='center';_fillTextUpright('x'+yoshi.eggsReady,yx+14,yy-6);ctx.textAlign='left'}
ctx.restore();
}

function drawGoomba(x,y,squished,wf){
if(squished){ctx.fillStyle='#8B6914';ctx.fillRect(x+2,y+TILE-8,TILE-4,8);ctx.fillStyle='#A0822D';ctx.fillRect(x+4,y+TILE-6,TILE-8,4);return}
// Mushroom head（縁取り + 2トーン + ハイライト）
ctx.fillStyle='#6b3410';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.35,TILE/2,Math.PI,0);ctx.fill();
ctx.fillStyle='#8B4513';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.35,TILE/2-1.5,Math.PI,0);ctx.fill();
ctx.fillStyle='#A0522D';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.35,TILE/2-4,Math.PI,0);ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.25)';ctx.beginPath();ctx.ellipse(x+11,y+4,6,2.5,-0.3,0,Math.PI*2);ctx.fill();
// Body + 影
ctx.fillStyle='#DEB887';ctx.fillRect(x+6,y+TILE*0.35,TILE-12,TILE*0.35);
ctx.fillStyle='#c09a60';ctx.fillRect(x+6,y+TILE*0.62,TILE-12,3);
// Eyes (angry)
ctx.fillStyle='#fff';ctx.fillRect(x+5,y+8,10,8);ctx.fillRect(x+17,y+8,10,8);
ctx.fillStyle='#000';ctx.fillRect(x+8,y+10,6,5);ctx.fillRect(x+20,y+10,6,5);
// Angry eyebrows
ctx.fillStyle='#000';ctx.fillRect(x+5,y+6,10,3);ctx.fillRect(x+17,y+6,10,3);
// Mouth/fangs
ctx.fillStyle='#000';ctx.fillRect(x+10,y+18,12,3);ctx.fillStyle='#fff';ctx.fillRect(x+12,y+18,3,3);ctx.fillRect(x+18,y+18,3,3);
// Feet（2トーン）
const fo=wf===0?[-2,2]:[2,-2];
ctx.fillStyle='#1a1a1a';ctx.fillRect(x+3+fo[0],y+TILE-8,10,8);ctx.fillRect(x+19+fo[1],y+TILE-8,10,8);
ctx.fillStyle='#3a3a3a';ctx.fillRect(x+4+fo[0],y+TILE-8,8,3);ctx.fillRect(x+20+fo[1],y+TILE-8,8,3);
}

function drawKoopa(e){const x=e.x,y=e.y,h=e.h,facing=e.facing||1;
if(e.state==='shell'){
ctx.fillStyle='#145a14';ctx.beginPath();ctx.arc(x+e.w/2,y+h/2,e.w/2-1,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#27ae60';ctx.beginPath();ctx.arc(x+e.w/2,y+h/2,e.w/2-4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#145a14';ctx.fillRect(x+e.w/2-1,y+3,2,h-6);ctx.fillRect(x+3,y+h/2-1,e.w-6,2);
if(Math.abs(e.vx)>1){ctx.fillStyle='rgba(255,255,255,0.25)';ctx.fillRect(x+5+Math.sin(G.frame*0.5)*5,y+3,4,h-6)}
}else if(e.state==='dead'){ctx.fillStyle='#27ae60';ctx.fillRect(x+4,y+TILE-6,TILE-8,6);}
else{
// Wings for parakoopa
if((e.type==='parakoopa'||e.type==='parakoopaR')&&e.flying){const wf=Math.sin(G.frame*0.25)*8;
ctx.fillStyle='#ecf0f1';ctx.beginPath();ctx.moveTo(x+6,y+h*0.32);ctx.lineTo(x-10,y+h*0.32-wf);ctx.lineTo(x+2,y+h*0.55);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+e.w-6,y+h*0.32);ctx.lineTo(x+e.w+10,y+h*0.32-wf);ctx.lineTo(x+e.w-2,y+h*0.55);ctx.closePath();ctx.fill();
ctx.fillStyle='#bdc3c7';ctx.beginPath();ctx.moveTo(x+6,y+h*0.32);ctx.lineTo(x-5,y+h*0.32-wf*0.6);ctx.lineTo(x+3,y+h*0.5);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+e.w-6,y+h*0.32);ctx.lineTo(x+e.w+5,y+h*0.32-wf*0.6);ctx.lineTo(x+e.w-3,y+h*0.5);ctx.closePath();ctx.fill();}
// Feet
const fo=e.walkFrame===0?[-3,1]:[1,-3];
ctx.fillStyle='#e67e22';ctx.fillRect(x+2+fo[0],y+h-7,11,7);ctx.fillRect(x+e.w-13+fo[1],y+h-7,11,7);
// Shell body
ctx.fillStyle='#145a14';ctx.fillRect(x+3,y+h*0.28,e.w-6,h*0.58);
ctx.beginPath();ctx.arc(x+e.w/2,y+h*0.28,e.w/2-3,Math.PI,0);ctx.fill();
ctx.fillStyle='#27ae60';ctx.fillRect(x+5,y+h*0.31,e.w-10,h*0.52);
// Shell ridge
ctx.fillStyle='#1e8449';ctx.fillRect(x+e.w/2-1,y+h*0.3,2,h*0.54);ctx.fillRect(x+6,y+h*0.31,e.w-12,3);
// Neck
ctx.fillStyle='#f0d060';ctx.fillRect(x+7,y+h*0.2,e.w-14,h*0.14);
// Head
const hx=facing===1?x+e.w-18:x+2;
ctx.fillStyle='#f0d060';ctx.fillRect(hx,y+2,16,h*0.26);
ctx.beginPath();ctx.arc(hx+8,y+h*0.16,9,0,Math.PI*2);ctx.fill();
// Eye
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hx+(facing===1?9:7),y+h*0.1,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(hx+(facing===1?10:6),y+h*0.1,2.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(hx+(facing===1?11:7),y+h*0.08,1,0,Math.PI*2);ctx.fill();
// Beak
ctx.fillStyle='#e67e22';
if(facing===1)ctx.fillRect(x+e.w-5,y+h*0.2,5,4);else ctx.fillRect(x,y+h*0.2,5,4);}}

function drawBuzzy(e){const x=e.x,y=e.y;
if(e.state==='shell'){ctx.fillStyle='#1a3d6d';ctx.beginPath();ctx.arc(x+e.w/2,y+e.h/2,e.w/2-2,0,Math.PI*2);ctx.fill();ctx.fillStyle='#2980b9';ctx.beginPath();ctx.arc(x+e.w/2,y+e.h/2,e.w/2-5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#1a3d6d';ctx.fillRect(x+8,y+4,3,e.h-8);if(Math.abs(e.vx)>1){ctx.fillStyle='rgba(255,255,255,0.3)';ctx.fillRect(x+6+Math.sin(G.frame*0.4)*6,y+3,3,e.h-6)}}
else if(e.state==='dead'){ctx.fillStyle='#2c3e50';ctx.fillRect(x+4,y+TILE-8,TILE-8,8)}
else{const h=e.h;
// ドーム甲羅（縁取り + 2トーン + 艶ハイライト）
ctx.fillStyle='#102a4d';ctx.beginPath();ctx.arc(x+TILE/2,y+h*0.5,TILE/2-2,Math.PI,0);ctx.fill();ctx.fillRect(x+2,y+h*0.5,TILE-4,h*0.25);
ctx.fillStyle='#1a3d6d';ctx.beginPath();ctx.arc(x+TILE/2,y+h*0.5,TILE/2-4,Math.PI,0);ctx.fill();ctx.fillRect(x+4,y+h*0.5,TILE-8,h*0.2);
ctx.fillStyle='#2980b9';ctx.beginPath();ctx.arc(x+TILE/2,y+h*0.5,TILE/2-8,Math.PI,0);ctx.fill();
ctx.fillStyle='rgba(255,255,255,0.35)';ctx.beginPath();ctx.ellipse(x+11,y+h*0.26,5,2.5,-0.3,0,Math.PI*2);ctx.fill();
// 顔 + 目
ctx.fillStyle='#f5d76e';ctx.fillRect(x+4,y+h*0.55,10,h*0.28);
ctx.fillStyle='#fff';ctx.fillRect(x+5,y+h*0.55,5,4);ctx.fillStyle='#000';ctx.fillRect(x+6,y+h*0.57,3,3);
// 足
const fo=e.walkFrame===0?[-2,2]:[2,-2];ctx.fillStyle='#f5d76e';ctx.fillRect(x+4+fo[0],y+h-6,8,6);ctx.fillRect(x+18+fo[1],y+h-6,8,6);
ctx.fillStyle='#d0b050';ctx.fillRect(x+4+fo[0],y+h-2,8,2);ctx.fillRect(x+18+fo[1],y+h-2,8,2)}}

function drawPiranha(pr){const x=pr.x,y=pr.y,cw=pr.w,ch=pr.h,cx=x+cw/2;
const open=Math.sin(G.frame*0.12)>0;const gap=open?6:0;
if(pr.ceiling){ctx.save();ctx.translate(cx,y+ch/2);ctx.scale(1,-1);ctx.translate(-cx,-(y+ch/2));}
// Stem
ctx.fillStyle='#1e8449';ctx.fillRect(cx-3,y+ch*0.52,6,ch*0.48);
// Leaves
ctx.fillStyle='#27ae60';ctx.fillRect(x-6,y+ch*0.56,9,6);ctx.fillRect(x+cw-3,y+ch*0.56,9,6);
ctx.fillStyle='#2ecc71';ctx.fillRect(x-4,y+ch*0.58,5,4);ctx.fillRect(x+cw-1,y+ch*0.58,5,4);
// Bottom jaw
ctx.fillStyle='#c0392b';ctx.beginPath();ctx.arc(cx,y+ch*0.46,cw/2+2,0,Math.PI);ctx.fill();ctx.fillRect(x-2,y+ch*0.46,cw+4,4);
// Top jaw (moves up when open)
ctx.beginPath();ctx.arc(cx,y+ch*0.38-gap,cw/2+2,Math.PI,0);ctx.fill();ctx.fillRect(x-2,y+ch*0.3-gap,cw+4,ch*0.08+gap);
// Mouth interior
if(open){ctx.fillStyle='#7b241c';ctx.fillRect(x,y+ch*0.38,cw,gap);}
// Bottom teeth
ctx.fillStyle='#fff';ctx.fillRect(x+1,y+ch*0.43,4,5);ctx.fillRect(x+8,y+ch*0.43,4,5);
// Top teeth
ctx.fillRect(x+1,y+ch*0.38-gap,4,4);ctx.fillRect(x+8,y+ch*0.38-gap,4,4);
// White spots on head
ctx.fillStyle='rgba(255,255,255,0.55)';
ctx.beginPath();ctx.arc(x+3,y+ch*0.26-gap/2,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+12,y+ch*0.22-gap/2,2,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+4,y+ch*0.44-gap/2,1.5,0,Math.PI*2);ctx.fill();
if(pr.ceiling)ctx.restore();}

function drawMushroom(m){
if(m.type==='iceFlower'){const bob=Math.sin(G.frame*0.1)*2;ctx.fillStyle='#27AE60';ctx.fillRect(m.x+10,m.y+14,4,10);
const rot=G.frame*0.05;for(let i=0;i<4;i++){const a=rot+i*Math.PI/2;const px=m.x+12+Math.cos(a)*7,py=m.y+8+Math.sin(a)*7+bob;
ctx.fillStyle=i%2===0?'#44aaff':'#88ddff';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill()}
ctx.fillStyle='#ccf0ff';ctx.beginPath();ctx.arc(m.x+12,m.y+8+bob,5,0,Math.PI*2);ctx.fill();return}
if(m.type==='hammerSuit'){ctx.fillStyle='#666';ctx.fillRect(m.x+4,m.y+4,16,12);ctx.fillStyle='#888';ctx.fillRect(m.x+6,m.y+6,12,8);
ctx.fillStyle='#8B4513';ctx.fillRect(m.x+8,m.y+16,8,8);ctx.fillStyle='#aaa';ctx.fillRect(m.x+4,m.y,16,6);return}
if(m.type==='mega'){ctx.fillStyle='#F5E6C8';ctx.fillRect(m.x+6,m.y+18,16,14);
ctx.fillStyle='#E52521';ctx.beginPath();ctx.arc(m.x+14,m.y+14,14,Math.PI,0);ctx.fill();
ctx.fillStyle='#ff6644';ctx.beginPath();ctx.arc(m.x+14,m.y+14,11,Math.PI,0);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(m.x+8,m.y+12,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(m.x+20,m.y+12,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(m.x+9,m.y+13,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(m.x+21,m.y+13,2,0,Math.PI*2);ctx.fill();
const _megaPulse=0.85+Math.sin(G.frame*0.15)*0.15;ctx.globalAlpha=_megaPulse;ctx.strokeStyle='#ff4400';ctx.lineWidth=2;ctx.beginPath();ctx.arc(m.x+14,m.y+16,16,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;ctx.lineWidth=1;return}
if(m.type==='flower'){const bob=Math.sin(G.frame*0.1)*2;ctx.fillStyle='#27AE60';ctx.fillRect(m.x+10,m.y+14,4,10);
const rot=G.frame*0.05;for(let i=0;i<4;i++){const a=rot+i*Math.PI/2;const px=m.x+12+Math.cos(a)*7,py=m.y+8+Math.sin(a)*7+bob;
ctx.fillStyle=i%2===0?'#E74C3C':'#FF8F00';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill()}
ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(m.x+12,m.y+8+bob,5,0,Math.PI*2);ctx.fill();return}
if(m.type==='star'){const bob=Math.sin(m.bobY||0)*4;const hue=(G.frame*8)%360;ctx.save();ctx.translate(m.x+12,m.y+12+bob);
ctx.fillStyle=`hsl(${hue},100%,60%)`;ctx.beginPath();for(let i=0;i<5;i++){const a=(i*72-90)*Math.PI/180;ctx.lineTo(Math.cos(a)*12,Math.sin(a)*12);const a2=((i*72)+36-90)*Math.PI/180;ctx.lineTo(Math.cos(a2)*5,Math.sin(a2)*5)}ctx.closePath();ctx.fill();
ctx.fillStyle=`hsla(${hue},100%,80%,0.5)`;ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.restore();return}
// Mushroom / 1UP
const is1up=m.type==='1up';
ctx.fillStyle='#F5E6C8';ctx.fillRect(m.x+6,m.y+14,12,10);
ctx.fillStyle=is1up?'#2ECC71':'#E74C3C';ctx.beginPath();ctx.arc(m.x+12,m.y+10,12,Math.PI,0);ctx.fill();ctx.fillRect(m.x,m.y+10,24,6);
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(m.x+7,m.y+6,4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(m.x+17,m.y+6,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle=is1up?'#1a9c5a':'#C0392B';ctx.fillRect(m.x,m.y+14,24,3)}

function drawFireCoin(x,y){const cx=Math.round(x+7),cy=Math.round(y+7);ctx.save();const _grd=ctx.createRadialGradient(cx,cy,1,cx,cy,14);_grd.addColorStop(0,'rgba(255,220,0,0.7)');_grd.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=_grd;ctx.beginPath();ctx.arc(cx,cy,14,0,Math.PI*2);ctx.fill();const _sq=0.7+0.3*Math.abs(Math.cos(G.frame*0.22));ctx.translate(cx,cy);ctx.scale(_sq,1);ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();ctx.fillStyle='#FF9900';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 8px monospace';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('C',0,1);ctx.restore();}
function drawCoinItem(x,y){const squeeze=Math.abs(Math.cos(G.frame*0.18));ctx.save();ctx.translate(x+TILE/2,y+TILE/2);ctx.scale(squeeze,1);
ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(0,0,10,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#F39C12';ctx.beginPath();ctx.arc(0,0,7,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#FFD700';ctx.font='bold 10px monospace';ctx.textAlign='center';ctx.fillText('$',0,4);
// Sparkle
if(G.frame%20<10){ctx.fillStyle='rgba(255,255,255,0.8)';ctx.fillRect(-2,-10,2,4);ctx.fillRect(8,-6,2,4)}
ctx.restore()}

function drawFireball(fb){ctx.save();const gd=ctx.createRadialGradient(fb.x+6,fb.y+6,0,fb.x+6,fb.y+6,9);gd.addColorStop(0,'#fff');gd.addColorStop(0.35,'#ff9900');gd.addColorStop(1,'rgba(255,80,0,0)');ctx.fillStyle=gd;ctx.beginPath();ctx.arc(fb.x+6,fb.y+6,9,0,Math.PI*2);ctx.fill();ctx.fillStyle='rgba(255,200,0,0.5)';ctx.fillRect(fb.x+6-fb.vx*0.5,fb.y+4,4,4);ctx.restore()}

function drawPenguin(e){
const x=e.x,y=e.y,f=e.vx>=0?1:-1;
if(e.state==='dead'){ctx.fillStyle='#111';ctx.fillRect(x+2,y+TILE-8,TILE-4,8);ctx.fillStyle='#e0f0ff';ctx.fillRect(x+6,y+TILE-7,TILE-12,4);return;}
const fw=e.walkFrame===0?3:-3;
// 足（オレンジ）
ctx.fillStyle='#e07000';ctx.fillRect(x+4+fw,y+TILE-5,9,5);ctx.fillRect(x+17-fw,y+TILE-5,9,5);
// ボディ（黒楕円）
ctx.fillStyle='#111';ctx.beginPath();ctx.ellipse(x+16,y+19,11,13,0,0,Math.PI*2);ctx.fill();
// 頭
ctx.beginPath();ctx.arc(x+16,y+8,9,0,Math.PI*2);ctx.fill();
// 白いお腹
ctx.fillStyle='#e0f0ff';ctx.beginPath();ctx.ellipse(x+16+(f>0?1:-1),y+21,6,9,0,0,Math.PI*2);ctx.fill();
// 目（白+黒瞳）
const ex=f>0?x+21:x+9;
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,y+7,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ex+(f>0?1:-1),y+7,2,0,Math.PI*2);ctx.fill();
// くちばし（オレンジ三角）
ctx.fillStyle='#e07000';
const bx1=x+16+(f>0?8:-8),bx2=x+16+(f>0?16:-16);
ctx.beginPath();ctx.moveTo(bx1,y+10);ctx.lineTo(bx2,y+13);ctx.lineTo(bx1,y+16);ctx.closePath();ctx.fill();
}
function drawTeresa(e){
  const x=e.x,y=e.y;
  ctx.globalAlpha=e.hiding?0.30:1.0;
  // ボディ（白い幽霊型）
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(x+14,y+13,12,Math.PI,0);
  ctx.lineTo(x+26,y+27);ctx.lineTo(x+22,y+21);ctx.lineTo(x+18,y+27);
  ctx.lineTo(x+14,y+21);ctx.lineTo(x+10,y+27);ctx.lineTo(x+6,y+21);ctx.lineTo(x+2,y+27);
  ctx.closePath();ctx.fill();
  // 薄い影
  ctx.fillStyle='rgba(180,180,220,0.15)';ctx.beginPath();ctx.ellipse(x+14,y+25,9,3,0,0,Math.PI*2);ctx.fill();
  if(e.hiding){
    // 目を手で隠す
    ctx.fillStyle='#fcd0d0';ctx.fillRect(x+1,y+10,10,8);ctx.fillRect(x+17,y+10,10,8);
    ctx.fillStyle='#444';ctx.beginPath();ctx.arc(x+6,y+14,2.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+22,y+14,2.5,0,Math.PI*2);ctx.fill();
  }else{
    ctx.fillStyle='#111';ctx.beginPath();ctx.arc(x+9,y+12,4.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+20,y+12,4.5,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#dd0000';ctx.beginPath();ctx.arc(x+9,y+12,2.8,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(x+20,y+12,2.8,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='rgba(0,0,0,0.55)';ctx.beginPath();ctx.arc(x+14,y+18,3.5,0,Math.PI);ctx.fill();
  }
  ctx.globalAlpha=1.0;
}
function drawThwomp(e){
  const x=e.x,y=e.y;const falling=e.state==='fall';
  // 本体（石）
  ctx.fillStyle=falling?'#5a5a70':'#42425a';ctx.fillRect(x,y,e.w,e.h);
  // ハイライト
  ctx.fillStyle='rgba(255,255,255,0.10)';ctx.fillRect(x,y,e.w,3);ctx.fillRect(x,y,3,e.h);
  // 影
  ctx.fillStyle='rgba(0,0,0,0.30)';ctx.fillRect(x,y+e.h-3,e.w,3);ctx.fillRect(x+e.w-3,y,3,e.h);
  // ひび割れ模様
  ctx.strokeStyle='rgba(0,0,0,0.35)';ctx.lineWidth=1;
  ctx.beginPath();ctx.moveTo(x+e.w*0.3,y+5);ctx.lineTo(x+e.w*0.2,y+e.h*0.5);ctx.lineTo(x+e.w*0.38,y+e.h*0.85);ctx.stroke();
  ctx.beginPath();ctx.moveTo(x+e.w*0.68,y+8);ctx.lineTo(x+e.w*0.78,y+e.h*0.45);ctx.stroke();
  // 下スパイク
  ctx.fillStyle='#2e2e44';
  for(let s=0;s<3;s++){const sw=(e.w-12)/3,sx2=x+6+s*sw;ctx.beginPath();ctx.moveTo(sx2,y+e.h);ctx.lineTo(sx2+sw/2,y+e.h+10);ctx.lineTo(sx2+sw,y+e.h);ctx.fill();}
  // 怒り眉
  ctx.fillStyle='#1a1a1a';ctx.fillRect(x+6,y+8,18,4);ctx.fillRect(x+e.w-24,y+8,18,4);
  // 目の枠
  ctx.fillRect(x+6,y+12,18,12);ctx.fillRect(x+e.w-24,y+12,18,12);
  // 眼球（落下中は赤く光る）
  ctx.fillStyle=falling?'#ff2200':'#cc1100';ctx.fillRect(x+8,y+14,14,8);ctx.fillRect(x+e.w-22,y+14,14,8);
  // 口
  ctx.fillStyle='#1a1a1a';ctx.fillRect(x+10,Math.floor(y+e.h*0.62),e.w-20,9);
  // 歯
  ctx.fillStyle='#ddd';const tw=Math.floor((e.w-20)/4);
  for(let t=0;t<4;t++)ctx.fillRect(x+10+t*tw+1,Math.floor(y+e.h*0.62),tw-2,5);
  // 落下中の衝撃パーティクル
  if(falling&&e.vy>10){ctx.fillStyle='rgba(120,120,160,0.3)';for(let p=0;p<3;p++)ctx.fillRect(x+e.w/2-3,y+e.h+p*5,6,4);}
}
function drawMovingPlat(mp){
if(G.iceMode){const gd=ctx.createLinearGradient(mp.x,mp.y,mp.x,mp.y+mp.h);gd.addColorStop(0,'#a4d4f0');gd.addColorStop(0.5,'#c4e8ff');gd.addColorStop(1,'#78b8d8');ctx.fillStyle=gd;ctx.fillRect(mp.x,mp.y,mp.w,mp.h);ctx.fillStyle='rgba(255,255,255,0.65)';ctx.fillRect(mp.x+2,mp.y+1,mp.w-4,2);}
else{const gd=ctx.createLinearGradient(mp.x,mp.y,mp.x,mp.y+mp.h);gd.addColorStop(0,'#e67e22');gd.addColorStop(0.5,'#f39c12');gd.addColorStop(1,'#d35400');ctx.fillStyle=gd;ctx.fillRect(mp.x,mp.y,mp.w,mp.h);ctx.fillStyle='#c0392b';ctx.fillRect(mp.x+4,mp.y+3,5,5);ctx.fillRect(mp.x+mp.w-9,mp.y+3,5,5);}}
function drawSpring(sp){const comp=sp.compressed>0?8:0;ctx.fillStyle='#e74c3c';ctx.fillRect(sp.x,sp.y+sp.h-6,sp.w,6);ctx.fillStyle='#f1c40f';for(let i=0;i<3;i++)ctx.fillRect(sp.x+2,sp.y+4+i*6+comp,sp.w-4,3);ctx.fillStyle='#e74c3c';ctx.fillRect(sp.x-2,sp.y+comp,sp.w+4,5)}
function drawCheckpoint(cp){ctx.fillStyle=cp.reached?'#2ecc71':'#888';ctx.fillRect(cp.x+6,cp.y-TILE*3,4,TILE*3);ctx.fillStyle=cp.reached?'#2ecc71':'#e74c3c';ctx.beginPath();ctx.moveTo(cp.x+10,cp.y-TILE*3);ctx.lineTo(cp.x+30,cp.y-TILE*3+10);ctx.lineTo(cp.x+10,cp.y-TILE*3+20);ctx.fill();ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(cp.x+8,cp.y-TILE*3,5,0,Math.PI*2);ctx.fill()}

function drawCheep(e){const x=e.x,y=e.y,dir=(e.vx||0)<0?-1:1;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.ellipse(x+12,y+10,12,7,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return}
ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.ellipse(x+12,y+10,12,7,0,0,Math.PI*2);ctx.fill();
// 白い腹
ctx.fillStyle='#ffe8e0';ctx.beginPath();ctx.ellipse(x+12,y+13,9,4,0,0,Math.PI);ctx.fill();
// 尾びれ（羽ばたきアニメ）
const _ff=Math.sin(G.frame*0.25)*3;
ctx.fillStyle='#c0392b';ctx.beginPath();
if(dir<0){ctx.moveTo(x+22,y+5);ctx.lineTo(x+32,y+1+_ff);ctx.lineTo(x+32,y+19+_ff);ctx.closePath();}
else{ctx.moveTo(x+2,y+5);ctx.lineTo(x-8,y+1+_ff);ctx.lineTo(x-8,y+19+_ff);ctx.closePath();}
ctx.fill();
// 胸びれ（パタパタ）
ctx.fillStyle='#ff7f6f';ctx.beginPath();
if(dir<0){ctx.moveTo(x+14,y+12);ctx.lineTo(x+20,y+16+_ff);ctx.lineTo(x+12,y+15);}else{ctx.moveTo(x+10,y+12);ctx.lineTo(x+4,y+16+_ff);ctx.lineTo(x+12,y+15);}
ctx.closePath();ctx.fill();
const ex=dir<0?x+5:x+18;
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex,y+7,4,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(ex+(dir<0?1:-1),y+7,2.2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ex+(dir<0?2:-2),y+6,1,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#ff9999';ctx.beginPath();ctx.moveTo(x+12,y+3);ctx.lineTo(x+8,y-2);ctx.lineTo(x+16,y-2);ctx.closePath();ctx.fill();}

function drawBlooper(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#ddeeff';ctx.beginPath();ctx.ellipse(x+12,y+10,12,10,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return}
ctx.fillStyle='#eef6ff';ctx.beginPath();ctx.ellipse(x+12,y+10,12,10,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#cce4ff';ctx.beginPath();ctx.ellipse(x+12,y+15,12,5,0,0,Math.PI);ctx.fill();
const _bph=G.frame*0.12;for(let i=0;i<4;i++){const _tx=x+4+i*6,_ty=y+e.h-2;ctx.strokeStyle='#aad4ee';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(_tx,_ty);ctx.quadraticCurveTo(_tx+Math.sin(_bph+i)*4,_ty+6,_tx,_ty+8+Math.sin(_bph+i*1.5)*3);ctx.stroke();}
ctx.lineWidth=1;
ctx.fillStyle='#e74c3c';ctx.beginPath();ctx.arc(x+8,y+8,3,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+16,y+8,3,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#000';ctx.beginPath();ctx.arc(x+8,y+8,1.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(x+16,y+8,1.5,0,Math.PI*2);ctx.fill();}

function drawDryBones(e){
const x=Math.round(e.x),y=Math.round(e.y);const w=e.w,h=e.h;
// ── 崩れ状態：骨パイル＋復活シェイク ──
if(e.state==='collapsed'){
  const timer=e.collapseTimer||0;let sx=0,sy=0;
  if(timer>0&&timer<60){const t=1-timer/60;sx=Math.round(Math.sin(G.frame*(1+t*2))*t*3);sy=Math.round(Math.abs(Math.sin(G.frame*2.2))*t);}
  // 頭蓋骨（目の穴付き）
  ctx.fillStyle='#f0ede0';ctx.fillRect(x+sx+6,y+sy+h-20,16,12);
  ctx.fillStyle='#1a1a1a';ctx.fillRect(x+sx+8,y+sy+h-18,5,6);ctx.fillRect(x+sx+14,y+sy+h-18,5,6);
  // 歯
  ctx.fillStyle='#fffff0';ctx.fillRect(x+sx+8,y+sy+h-10,2,3);ctx.fillRect(x+sx+11,y+sy+h-10,2,3);ctx.fillRect(x+sx+14,y+sy+h-10,2,3);
  // 散らばった骨片
  ctx.fillStyle='#e0ddc8';ctx.fillRect(x+2,y+h-7,9,5);ctx.fillRect(x+sx+18,y+sy+h-6,10,4);
  return;
}
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#e8e8d0';ctx.fillRect(x+4,y+4,w-8,h-8);ctx.globalAlpha=1;return;}
const dir=e.vx>=0?1:-1;const wf=e.walkFrame||0;
// ── 足 ──
ctx.fillStyle='#d8d5c0';
ctx.fillRect(x+5,   y+h-9+(wf===0?1:0),8,9);
ctx.fillRect(x+w-13,y+h-9+(wf===1?1:0),8,9);
// かかと
ctx.fillStyle='#e8e5d0';
ctx.fillRect(x+3+(wf===0?-1:0), y+h-4,11,4);
ctx.fillRect(x+w-15+(wf===1?0:1),y+h-4,11,4);
// ── 骨盤 ──
ctx.fillStyle='#c8c5b0';ctx.fillRect(x+5,y+h-13,w-10,4);
// ── 背骨 ──
ctx.fillStyle='#c0bda8';ctx.fillRect(x+w/2-2,y+16,4,7);
// ── 肋骨（2対） ──
ctx.strokeStyle='#a8a598';ctx.lineWidth=1.5;
ctx.beginPath();ctx.moveTo(x+w/2-2,y+17);ctx.lineTo(x+4, y+21);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w/2+2,y+17);ctx.lineTo(x+w-4,y+21);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w/2-2,y+22);ctx.lineTo(x+5, y+25);ctx.stroke();
ctx.beginPath();ctx.moveTo(x+w/2+2,y+22);ctx.lineTo(x+w-5,y+25);ctx.stroke();
// ── 腕（向いている方向のみ） ──
ctx.fillStyle='#c8c5b0';
if(dir>0){ctx.fillRect(x+w-6,y+14,5,12);ctx.fillRect(x+w-8,y+24,8,3);}
else{ctx.fillRect(x+1,y+14,5,12);ctx.fillRect(x,y+24,8,3);}
// ── 頭蓋骨（円形クラニアム） ──
ctx.fillStyle='#f0ede0';
ctx.beginPath();ctx.arc(x+w/2,y+8,w/2-2,0,Math.PI*2);ctx.fill();
// あご（クラニアムより少し狭い）
ctx.fillStyle='#e2dec8';ctx.fillRect(x+6,y+13,w-12,6);
// 歯（4本）
ctx.fillStyle='#fffff5';
ctx.fillRect(x+7, y+14,3,4);ctx.fillRect(x+12,y+14,3,4);
ctx.fillRect(x+17,y+14,3,4);ctx.fillRect(x+22,y+14,3,4);
// ── 大きな目の穴（ドライボーンズの決め手） ──
ctx.fillStyle='#111';
ctx.fillRect(x+4, y+2,9,9);   // 左目ソケット
ctx.fillRect(x+19,y+2,9,9);   // 右目ソケット
// 奥行き感（少し薄い影）
ctx.fillStyle='#2a2a2a';
ctx.fillRect(x+5, y+3,5,5);
ctx.fillRect(x+20,y+3,5,5);
// 鼻の穴
ctx.fillStyle='#555';ctx.fillRect(x+13,y+10,3,3);ctx.fillRect(x+17,y+10,3,3);
ctx.lineWidth=1;
}

function drawAngrySun(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#FF8C00';ctx.beginPath();ctx.arc(x+16,y+16,14,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return}
const _apuls=1+Math.sin(G.frame*0.12)*0.07;ctx.save();ctx.translate(x+16,y+16);ctx.scale(_apuls,_apuls);
ctx.strokeStyle='#FF6600';ctx.lineWidth=3;for(let i=0;i<8;i++){const _aa=i*Math.PI/4+(G.frame*0.02);ctx.beginPath();ctx.moveTo(Math.cos(_aa)*13,Math.sin(_aa)*13);ctx.lineTo(Math.cos(_aa)*21,Math.sin(_aa)*21);ctx.stroke();}
const _asg=ctx.createRadialGradient(0,0,0,0,0,13);_asg.addColorStop(0,'#FFE040');_asg.addColorStop(0.7,'#FFB800');_asg.addColorStop(1,'#FF7700');ctx.fillStyle=_asg;ctx.beginPath();ctx.arc(0,0,13,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#222';ctx.beginPath();ctx.arc(-4,-2,2.5,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(4,-2,2.5,0,Math.PI*2);ctx.fill();
ctx.strokeStyle='#111';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,-6);ctx.lineTo(-2,-4);ctx.stroke();ctx.beginPath();ctx.moveTo(7,-6);ctx.lineTo(2,-4);ctx.stroke();
ctx.beginPath();ctx.moveTo(-5,4);ctx.lineTo(-2,6);ctx.lineTo(2,6);ctx.lineTo(5,4);ctx.stroke();
ctx.restore();ctx.lineWidth=1;}

function drawChuck(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#3a7f3a';ctx.fillRect(x+2,y+2,e.w-4,e.h-4);ctx.globalAlpha=1;return}
const dir=e.facing||1;
ctx.fillStyle='#2d6b2d';ctx.fillRect(x+3,y+e.h*0.38,e.w-6,e.h*0.62-2);
ctx.fillStyle='#4a9a4a';ctx.beginPath();ctx.arc(x+e.w/2,y+e.h*0.26,e.w/2-2,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#8B0000';ctx.beginPath();ctx.arc(x+e.w/2,y+e.h*0.16,e.w/2-2,Math.PI,0);ctx.fill();
ctx.fillStyle='#FFD700';ctx.fillRect(x+4,y+e.h*0.22,e.w-8,3);
const _cex=dir>0?x+e.w/2+3:x+e.w/2-7;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(_cex,y+e.h*0.26,3.5,0,Math.PI*2);ctx.fill();ctx.fillStyle='#222';ctx.beginPath();ctx.arc(_cex+(dir>0?1:-1),y+e.h*0.26,1.8,0,Math.PI*2);ctx.fill();
if(e.state==='charge'){ctx.fillStyle='#2d6b2d';ctx.fillRect(dir>0?x+e.w-2:x-6,y+e.h*0.4,8,6);}
const _chp=e.hp||3;if(_chp<3){ctx.fillStyle='rgba(255,80,0,0.9)';for(let i=0;i<3-_chp;i++)ctx.fillRect(x+i*7,y-7,6,4);}
const _cwf=e.walkFrame||0;ctx.fillStyle='#1e4f1e';ctx.fillRect(x+3,y+e.h-8+(_cwf===0?2:0),8,8);ctx.fillRect(x+e.w-11,y+e.h-8+(_cwf===1?2:0),8,8);}

function drawFirePlant(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.35;ctx.fillStyle='#2d7a2d';ctx.fillRect(x+9,y+8,6,e.h-8);ctx.globalAlpha=1;return}
ctx.fillStyle='#27ae60';ctx.fillRect(x+9,y+e.h-TILE+2,6,TILE-2);
ctx.fillStyle='#2ecc71';ctx.fillRect(x,y+e.h-TILE+6,10,5);ctx.fillRect(x+14,y+e.h-TILE+6,10,5);
const rot=G.frame*0.05;
for(let i=0;i<4;i++){const a=rot+i*Math.PI/2;const px=x+12+Math.cos(a)*7,py=y+10+Math.sin(a)*7;
ctx.fillStyle=i%2===0?'#e74c3c':'#ff8c00';ctx.beginPath();ctx.arc(px,py,5,0,Math.PI*2);ctx.fill()}
ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(x+12,y+10,5,0,Math.PI*2);ctx.fill();}

function drawPlantFireball(e){if(e.state==='dead')return;ctx.save();
const gd=ctx.createRadialGradient(e.x+7,e.y+7,0,e.x+7,e.y+7,9);
gd.addColorStop(0,'#fff');gd.addColorStop(0.4,'#ff8c00');gd.addColorStop(1,'rgba(255,50,0,0)');
ctx.fillStyle=gd;ctx.beginPath();ctx.arc(e.x+7,e.y+7,9,0,Math.PI*2);ctx.fill();ctx.restore();}

function drawFlag(){const fx=flagPole.x;
ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(fx+8,H-TILE,6,TILE);
const pg=ctx.createLinearGradient(fx+6,0,fx+12,0);pg.addColorStop(0,'#bbb');pg.addColorStop(0.5,'#fff');pg.addColorStop(1,'#888');
ctx.fillStyle=pg;ctx.fillRect(fx+6,H-TILE-flagPole.h,6,flagPole.h);
// Ball on top
ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(fx+9,H-TILE-flagPole.h,5,0,Math.PI*2);ctx.fill();
// Flag
ctx.fillStyle='#E52521';ctx.beginPath();ctx.moveTo(fx+12,H-TILE-flagPole.h);ctx.quadraticCurveTo(fx+42,H-TILE-flagPole.h+15+Math.sin(G.frame*0.1)*5,fx+12,H-TILE-flagPole.h+32);ctx.fill();
// Castle
const cx=fx+50;
ctx.fillStyle='#D0D0D0';ctx.fillRect(cx,H-TILE-140,100,140);
ctx.fillStyle='#B8B8B8';ctx.fillRect(cx+2,H-TILE-138,96,136);
// Turrets
[0,22,44,66,88].forEach(ox=>{ctx.fillStyle='#C8C8C8';ctx.fillRect(cx+ox,H-TILE-155,18,17);ctx.fillStyle='#A0A0A0';ctx.fillRect(cx+ox+3,H-TILE-155,3,12)});
// Door
ctx.fillStyle='#4A3728';ctx.fillRect(cx+35,H-TILE-50,30,50);
ctx.fillStyle='#6B4F3A';ctx.beginPath();ctx.arc(cx+50,H-TILE-50,15,Math.PI,0);ctx.fill();
ctx.fillStyle='#FFD700';ctx.fillRect(cx+55,H-TILE-30,4,4);
// Windows
ctx.fillStyle='#87CEEB';ctx.fillRect(cx+10,H-TILE-100,18,22);ctx.fillRect(cx+72,H-TILE-100,18,22);
ctx.fillStyle='rgba(255,255,200,0.3)';ctx.fillRect(cx+12,H-TILE-98,6,8);ctx.fillRect(cx+74,H-TILE-98,6,8);
// Small flag on castle
ctx.fillStyle='#888';ctx.fillRect(cx+48,H-TILE-175,3,22);ctx.fillStyle='#E52521';ctx.fillRect(cx+51,H-TILE-175,14,10);
}

function drawYoshiEggItem(yi){
// White egg with green spots
ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(yi.x+12,yi.y+12,12,14,0,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#4CAF50';ctx.beginPath();ctx.arc(yi.x+8,yi.y+10,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(yi.x+16,yi.y+14,3,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(yi.x+10,yi.y+18,2,0,Math.PI*2);ctx.fill();
// Crack effect near hatching
if(yi.hatchTimer<30){ctx.strokeStyle='#888';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(yi.x+10,yi.y+4);ctx.lineTo(yi.x+14,yi.y+10);ctx.lineTo(yi.x+10,yi.y+14);ctx.stroke()}}

function drawYoshiEggProj(eg){
ctx.fillStyle='#fff';ctx.beginPath();ctx.ellipse(eg.x+8,eg.y+8,8,10,eg.bounces*0.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#4CAF50';ctx.beginPath();ctx.arc(eg.x+6,eg.y+7,2,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.arc(eg.x+11,eg.y+10,2,0,Math.PI*2);ctx.fill()}

function drawHammerBro(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.fillStyle='#556b2f';ctx.fillRect(x+4,y+e.h-10,TILE-8,10);return}
// ヘルメット（ドーム + つば + ハイライト）
ctx.fillStyle='#1e4f1e';ctx.beginPath();ctx.arc(x+TILE/2,y+e.h*0.16,TILE/2-2,Math.PI,0);ctx.fill();
ctx.fillStyle='#2d6b2d';ctx.beginPath();ctx.arc(x+TILE/2,y+e.h*0.16,TILE/2-4,Math.PI,0);ctx.fill();
ctx.fillStyle='#1e4f1e';ctx.fillRect(x,y+e.h*0.14,TILE,4);
ctx.fillStyle='rgba(255,255,255,0.2)';ctx.fillRect(x+8,y+2,10,3);
// 顔（タン色）+ 目
ctx.fillStyle='#f0d060';ctx.fillRect(x+5,y+e.h*0.2,TILE-10,e.h*0.16);
ctx.fillStyle='#fff';ctx.fillRect(x+7,y+e.h*0.21,6,5);ctx.fillRect(x+18,y+e.h*0.21,6,5);
ctx.fillStyle='#000';ctx.fillRect(x+9,y+e.h*0.23,4,3);ctx.fillRect(x+20,y+e.h*0.23,4,3);
// くちばし
ctx.fillStyle='#e0b040';ctx.fillRect(x+12,y+e.h*0.31,8,4);
// 甲羅（前面）+ 腹
ctx.fillStyle='#145a14';ctx.fillRect(x+3,y+e.h*0.38,TILE-6,e.h*0.36);
ctx.fillStyle='#27ae60';ctx.fillRect(x+5,y+e.h*0.4,TILE-10,e.h*0.3);
ctx.fillStyle='#f0e0a0';ctx.fillRect(x+9,y+e.h*0.44,TILE-18,e.h*0.24);
ctx.fillStyle='#d0c080';ctx.fillRect(x+9,y+e.h*0.56,TILE-18,2);
// 足（オレンジブーツ）
const fo=e.walkFrame===0?[-2,2]:[2,-2];
ctx.fillStyle='#e67e22';ctx.fillRect(x+4+fo[0],y+e.h-8,10,8);ctx.fillRect(x+18+fo[1],y+e.h-8,10,8);
ctx.fillStyle='#d35400';ctx.fillRect(x+4+fo[0],y+e.h-3,10,3);ctx.fillRect(x+18+fo[1],y+e.h-3,10,3);
// 腕 + ハンマー（投げ構え）
ctx.fillStyle='#f0d060';ctx.fillRect(x+22,y-4,6,10);
ctx.fillStyle='#8b6914';ctx.fillRect(x+24,y-12,3,12);
ctx.fillStyle='#666';ctx.fillRect(x+20,y-16,11,7);ctx.fillStyle='#999';ctx.fillRect(x+21,y-15,9,3)}

function drawCactus(e){
const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.45;ctx.fillStyle='#2d7a2d';ctx.fillRect(x+8,y+12,16,20);ctx.globalAlpha=1;return;}
const af=e.walkFrame===0?0:2;
// Arms（2トーン）
ctx.fillStyle='#2d7a2d';ctx.fillRect(x,y+10+af,12,8);ctx.fillRect(x+20,y+12-af,12,8);
ctx.fillStyle='#3a9a3a';ctx.fillRect(x+1,y+11+af,10,3);ctx.fillRect(x+21,y+13-af,10,3);
// Body（縁 + 本体 + ハイライト）
ctx.fillStyle='#1a5c1a';ctx.fillRect(x+7,y+3,18,e.h-3);
ctx.fillStyle='#2d7a2d';ctx.fillRect(x+8,y+4,16,e.h-4);
ctx.fillStyle='#3a9a3a';ctx.fillRect(x+17,y+6,5,e.h-8);
// Spikes
ctx.fillStyle='#1a5c1a';
ctx.beginPath();ctx.moveTo(x+14,y-2);ctx.lineTo(x+18,y+6);ctx.lineTo(x+10,y+6);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x,y+10+af);ctx.lineTo(x-4,y+14+af);ctx.lineTo(x,y+18+af);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(x+32,y+12-af);ctx.lineTo(x+36,y+16-af);ctx.lineTo(x+32,y+20-af);ctx.closePath();ctx.fill();
// 白い棘（体表のドット）
ctx.fillStyle='rgba(255,255,250,0.8)';
for(let i=0;i<Math.floor((e.h-12)/12);i++){ctx.fillRect(x+11,y+10+i*12,2,2);ctx.fillRect(x+20,y+15+i*12,2,2);}
// Stripe
ctx.fillStyle='#1f6e1f';ctx.fillRect(x+10,y+8,4,e.h-8);
// Eyes + 口
ctx.fillStyle='#000';ctx.fillRect(x+10,y+10,4,4);ctx.fillRect(x+19,y+10,4,4);
ctx.fillStyle='#fff';ctx.fillRect(x+11,y+11,1.5,1.5);ctx.fillRect(x+20,y+11,1.5,1.5);
ctx.fillStyle='#000';ctx.fillRect(x+13,y+18,7,2);}

function drawLakitu(e){
const x=e.x,y=e.y;
if(e.state==='dead'){ctx.globalAlpha=0.4;ctx.fillStyle='#dde';ctx.beginPath();ctx.arc(x+18,y+26,12,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;return;}
// Cloud（白＋下面シェード＋顔つき）
ctx.fillStyle='#fff';
ctx.beginPath();ctx.arc(x+8,y+28,9,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+20,y+22,13,0,Math.PI*2);ctx.fill();
ctx.beginPath();ctx.arc(x+32,y+28,9,0,Math.PI*2);ctx.fill();
ctx.fillRect(x+2,y+28,36,10);
ctx.fillStyle='#d8d8ec';ctx.fillRect(x+2,y+34,36,4);
// 雲の顔（目＋ほっぺ）
ctx.fillStyle='#222';ctx.fillRect(x+12,y+29,3,4);ctx.fillRect(x+25,y+29,3,4);
ctx.fillStyle='#f8c0c0';ctx.fillRect(x+8,y+33,4,2);ctx.fillRect(x+28,y+33,4,2);
// Shell（縁取り）
ctx.fillStyle='#2f5c1a';ctx.fillRect(x+8,y+13,20,13);
ctx.fillStyle='#4a7c2f';ctx.fillRect(x+9,y+14,18,12);
ctx.fillStyle='#6a9c4f';ctx.fillRect(x+11,y+15,6,4);
// Head + 髪の毛
ctx.fillStyle='#c8a050';ctx.fillRect(x+11,y+4,16,12);
ctx.fillStyle='#2d6b2d';ctx.fillRect(x+13,y+1,12,4);ctx.fillRect(x+16,y-2,6,4);
// Glasses（ゴーグル風）+ ニヤリ口
ctx.fillStyle='#222';ctx.fillRect(x+12,y+6,5,5);ctx.fillRect(x+19,y+6,5,5);ctx.fillRect(x+17,y+8,2,2);
ctx.fillStyle='#7fdfff';ctx.fillRect(x+13,y+7,3,2);ctx.fillRect(x+20,y+7,3,2);
ctx.fillStyle='#7a4a10';ctx.fillRect(x+14,y+13,9,2);
// Fishing rod
ctx.fillStyle='#8b6914';ctx.fillRect(x+24,y+8,3,20);ctx.fillRect(x+24,y+8,18,3);
ctx.strokeStyle='#bbb';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(x+41,y+9);ctx.lineTo(x+41,y+6);ctx.stroke();
// Dangling koopa shell
ctx.fillStyle='#d4a020';ctx.fillRect(x+37,y+6,9,7);ctx.fillStyle='#4a7c2f';ctx.fillRect(x+36,y+10,11,5);ctx.fillStyle='#6a9c4f';ctx.fillRect(x+37,y+11,4,2);}

function drawShyGuy(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.fillStyle='#a01818';ctx.fillRect(x+2,y+TILE-8,TILE-4,8);ctx.fillStyle='#c02020';ctx.fillRect(x+4,y+TILE-6,TILE-8,4);return;}
const col=e.variant==='blue'?'#2060c0':e.variant==='green'?'#2a9a3a':'#c02020';
const colD=e.variant==='blue'?'#103060':e.variant==='green'?'#176020':'#801010';
// ローブ本体
ctx.fillStyle=col;ctx.fillRect(x+3,y+10,TILE-6,TILE-14);
// ローブ裾（波）
ctx.fillStyle=colD;ctx.fillRect(x+3,y+TILE-6,TILE-6,2);
// フード上部
ctx.fillStyle=col;ctx.beginPath();ctx.arc(x+TILE/2,y+10,11,Math.PI,0);ctx.fill();
ctx.fillStyle=colD;ctx.fillRect(x+3,y+9,TILE-6,2);
// マスク
ctx.fillStyle='#f5ecd4';ctx.fillRect(x+7,y+6,TILE-14,12);
ctx.fillStyle='#d4c9a8';ctx.fillRect(x+7,y+16,TILE-14,2);
// 目
ctx.fillStyle='#000';ctx.fillRect(x+10,y+9,3,4);ctx.fillRect(x+TILE-13,y+9,3,4);
// 口
ctx.fillStyle='#000';ctx.fillRect(x+12,y+14,TILE-24,2);
// 足
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillStyle='#4a2010';ctx.fillRect(x+4+fo[0],y+TILE-4,8,4);ctx.fillRect(x+TILE-12+fo[1],y+TILE-4,8,4);
}

function drawRex(e){const x=e.x,y=e.y,h=e.h,facing=e.facing||-1;
if(e.state==='dead'){ctx.fillStyle='#6a3caa';ctx.fillRect(x+2,y+h-6,e.w-4,6);return;}
const hurt=e.rexHurt;
// 体
ctx.fillStyle='#6a3caa';ctx.fillRect(x+2,y+h*0.35,e.w-4,h*0.5);
ctx.fillStyle='#884ccc';ctx.fillRect(x+4,y+h*0.4,e.w-8,h*0.4);
// 背びれ（2個または1個）
ctx.fillStyle='#c070dd';
if(!hurt){ctx.beginPath();ctx.moveTo(x+10,y+h*0.35);ctx.lineTo(x+14,y+4);ctx.lineTo(x+18,y+h*0.35);ctx.fill();
ctx.beginPath();ctx.moveTo(x+e.w-18,y+h*0.35);ctx.lineTo(x+e.w-14,y+6);ctx.lineTo(x+e.w-10,y+h*0.35);ctx.fill();}
else{ctx.beginPath();ctx.moveTo(x+e.w/2-4,y+h*0.35);ctx.lineTo(x+e.w/2,y+2);ctx.lineTo(x+e.w/2+4,y+h*0.35);ctx.fill();}
// 頭（facing向き）
const hx=facing>=0?x+e.w-12:x;
ctx.fillStyle='#6a3caa';ctx.fillRect(hx,y+h*0.22,12,h*0.35);
ctx.fillStyle='#884ccc';ctx.fillRect(hx+1,y+h*0.26,10,h*0.28);
// 鼻
ctx.fillStyle='#a060c8';
if(facing>=0)ctx.fillRect(hx+10,y+h*0.35,4,5);else ctx.fillRect(hx-2,y+h*0.35,4,5);
// 目
ctx.fillStyle='#fff';ctx.fillRect(hx+(facing>=0?2:6),y+h*0.26,4,4);
ctx.fillStyle='#000';ctx.fillRect(hx+(facing>=0?3:7),y+h*0.27,2,2);
// 牙
ctx.fillStyle='#fff';
if(facing>=0)ctx.fillRect(hx+9,y+h*0.45,2,3);else ctx.fillRect(hx+1,y+h*0.45,2,3);
// 足
const fo=e.walkFrame===0?[-2,2]:[2,-2];
ctx.fillStyle='#4a2078';ctx.fillRect(x+4+fo[0],y+h-4,8,4);ctx.fillRect(x+e.w-12+fo[1],y+h-4,8,4);
}

function drawBobomb(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.fillStyle='#2a2a2a';ctx.fillRect(x+2,y+TILE-6,TILE-4,6);return;}
const lit=e.state==='lit';
const flash=lit&&(e.litTimer<60?e.litTimer%6<3:e.litTimer%12<6);
// 体
ctx.fillStyle=flash?'#ff4400':'#1a1a1a';
ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.4,0,Math.PI*2);ctx.fill();
ctx.fillStyle=flash?'#ff8844':'#333';
ctx.beginPath();ctx.arc(x+TILE*0.42,y+TILE*0.5,5,0,Math.PI*2);ctx.fill();
// 導火線
ctx.fillStyle='#aaa';ctx.fillRect(x+TILE/2-1,y+4,2,8);
// 火花（点火時）
if(lit){ctx.fillStyle=`hsl(${Math.random()*60},100%,${50+Math.random()*30}%)`;
ctx.beginPath();ctx.arc(x+TILE/2,y+2,3+Math.random()*3,0,Math.PI*2);ctx.fill();
for(let i=0;i<3;i++){ctx.fillStyle=`rgba(255,${100+Math.random()*155},0,${Math.random()})`;ctx.fillRect(x+TILE/2-1+Math.random()*4-2,y-2-Math.random()*4,2,2);}}
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+10,y+TILE*0.42,4,5);ctx.fillRect(x+TILE-14,y+TILE*0.42,4,5);
ctx.fillStyle='#000';ctx.fillRect(x+11,y+TILE*0.44,2,3);ctx.fillRect(x+TILE-13,y+TILE*0.44,2,3);
// 足
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillStyle='#f5c040';ctx.fillRect(x+6+fo[0],y+TILE-4,7,4);ctx.fillRect(x+TILE-13+fo[1],y+TILE-4,7,4);
}

function drawSpiny(e){const x=e.x,y=e.y;
if(e.state==='dead'){ctx.fillStyle='#a82020';ctx.fillRect(x+4,y+TILE-8,TILE-8,8);return;}
// 頭上の大きなトゲ（踏み不可の警告マーク）
ctx.fillStyle='#fff';ctx.strokeStyle='#555';ctx.lineWidth=1.5;
ctx.beginPath();
ctx.moveTo(x+TILE/2-7,y-1);
ctx.lineTo(x+TILE/2,y-14);
ctx.lineTo(x+TILE/2+7,y-1);
ctx.closePath();ctx.fill();ctx.stroke();
ctx.lineWidth=1;
// 甲羅（赤・丸型）
ctx.fillStyle='#a82020';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.42,Math.PI,0);ctx.fill();
ctx.fillRect(x+4,y+TILE*0.55,TILE-8,TILE*0.35);
ctx.fillStyle='#d03030';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.3,Math.PI,0);ctx.fill();
// トゲ（背中に5本）
ctx.fillStyle='#fff';
for(let i=0;i<5;i++){const sx=x+5+i*5;
ctx.beginPath();ctx.moveTo(sx,y+TILE*0.45);ctx.lineTo(sx+2,y+3);ctx.lineTo(sx+4,y+TILE*0.45);ctx.closePath();ctx.fill();}
// 頭（甲羅の下から覗く）
ctx.fillStyle='#f5c080';ctx.fillRect(x+TILE*0.3,y+TILE*0.72,TILE*0.4,TILE*0.2);
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+9,y+TILE*0.72,4,4);ctx.fillRect(x+TILE-13,y+TILE*0.72,4,4);
ctx.fillStyle='#000';ctx.fillRect(x+10,y+TILE*0.74,2,3);ctx.fillRect(x+TILE-12,y+TILE*0.74,2,3);
// 足
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillStyle='#e09030';ctx.fillRect(x+5+fo[0],y+TILE-4,7,4);ctx.fillRect(x+TILE-12+fo[1],y+TILE-4,7,4);
}

function drawSpikeTop(e){const x=e.x,y=e.y;
// 天井這い：殻が上、体が下
// 殻（硬い茶色）
ctx.fillStyle='#6b3410';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.42,0,Math.PI);ctx.fill();
ctx.fillRect(x+4,y+TILE*0.2,TILE-8,TILE*0.35);
ctx.fillStyle='#8b4a1a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.3,0,Math.PI);ctx.fill();
// 下側の大きなトゲ（踏み不可の警告マーク）
ctx.fillStyle='#fff';ctx.strokeStyle='#555';ctx.lineWidth=1.5;
ctx.beginPath();
ctx.moveTo(x+TILE/2-7,y+TILE-2);
ctx.lineTo(x+TILE/2,y+TILE+12);
ctx.lineTo(x+TILE/2+7,y+TILE-2);
ctx.closePath();ctx.fill();ctx.stroke();
ctx.lineWidth=1;
// トゲ（下向き5本）
ctx.fillStyle='#fff';
for(let i=0;i<5;i++){const sx=x+5+i*5;
ctx.beginPath();ctx.moveTo(sx,y+TILE*0.65);ctx.lineTo(sx+2,y+TILE-3);ctx.lineTo(sx+4,y+TILE*0.65);ctx.closePath();ctx.fill();}
// 頭（上）
ctx.fillStyle='#f5c080';ctx.fillRect(x+TILE*0.3,y+4,TILE*0.4,TILE*0.2);
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+9,y+6,4,4);ctx.fillRect(x+TILE-13,y+6,4,4);
ctx.fillStyle='#000';ctx.fillRect(x+10,y+7,2,3);ctx.fillRect(x+TILE-12,y+7,2,3);
// 脚（上・天井に吸着）
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillStyle='#a8602a';ctx.fillRect(x+5+fo[0],y,7,5);ctx.fillRect(x+TILE-12+fo[1],y,7,5);
}

function drawPokey(e){const x=e.x,y=e.y;
const segs=e.segments||3;
// 体（黄色いサボテン、複数段）
for(let i=0;i<segs;i++){
  const sy=y+i*TILE;
  ctx.fillStyle='#e5c84a';ctx.beginPath();ctx.arc(x+TILE/2,sy+TILE/2,TILE*0.42,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f5d85a';ctx.beginPath();ctx.arc(x+TILE/2,sy+TILE/2,TILE*0.32,0,Math.PI*2);ctx.fill();
  // トゲ
  ctx.fillStyle='#8b6420';
  for(let j=0;j<4;j++){const a=(j/4)*Math.PI*2+(i%2)*0.4;const px=x+TILE/2+Math.cos(a)*TILE*0.4;const py=sy+TILE/2+Math.sin(a)*TILE*0.4;
  ctx.beginPath();ctx.moveTo(px-2,py-2);ctx.lineTo(px+Math.cos(a)*5,py+Math.sin(a)*5);ctx.lineTo(px+2,py+2);ctx.closePath();ctx.fill();}
}
// 頭（顔、最上段）
const headY=y;
ctx.fillStyle='#000';ctx.fillRect(x+10,headY+8,4,5);ctx.fillRect(x+TILE-14,headY+8,4,5);
ctx.fillStyle='#f5d85a';ctx.fillRect(x+11,headY+9,2,3);ctx.fillRect(x+TILE-13,headY+9,2,3);
// 口
ctx.fillStyle='#7a2020';ctx.fillRect(x+12,headY+18,TILE-24,3);
}

function drawFuzzy(e){const x=e.x,y=e.y;
const pulse=1+Math.sin(G.frame*0.2)*0.1;
// レール表示（簡易・うす線）
if(e.railX1!==undefined){
  ctx.strokeStyle='rgba(120,120,140,0.3)';ctx.lineWidth=1;ctx.setLineDash([4,4]);
  ctx.beginPath();ctx.moveTo(e.railX1+TILE/2,e.railY1+TILE/2);ctx.lineTo(e.railX2+TILE/2,e.railY2+TILE/2);ctx.stroke();
  ctx.setLineDash([]);
}
// 本体（黒い毛玉）
ctx.fillStyle='#1a1a1a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE/2,TILE*0.4*pulse,0,Math.PI*2);ctx.fill();
// 毛のギザギザ
ctx.fillStyle='#2a2a2a';
for(let i=0;i<12;i++){const a=(i/12)*Math.PI*2+G.frame*0.03;
const px=x+TILE/2+Math.cos(a)*TILE*0.44*pulse;const py=y+TILE/2+Math.sin(a)*TILE*0.44*pulse;
ctx.beginPath();ctx.arc(px,py,3,0,Math.PI*2);ctx.fill();}
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+10,y+10,5,5);ctx.fillRect(x+TILE-15,y+10,5,5);
ctx.fillStyle='#000';ctx.fillRect(x+11,y+11,3,3);ctx.fillRect(x+TILE-14,y+11,3,3);
}

function drawMontyMole(e){const x=e.x,y=e.y;
if(e.state==='hidden'){
  // 土の盛り上がり
  ctx.fillStyle='#8b5a2a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.8,TILE*0.5,Math.PI,0);ctx.fill();
  ctx.fillStyle='#5a3a1a';
  for(let i=0;i<4;i++)ctx.fillRect(x+6+i*5,y+TILE-8,3,4);
  return;
}
if(e.state==='emerge'){
  // 半分顔を出す
  const _h=Math.max(0,1-(e.emergeT||0)/30);
  ctx.fillStyle='#8b5a2a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.8,TILE*0.5,Math.PI,0);ctx.fill();
  ctx.fillStyle='#6a4020';ctx.fillRect(x+6,y+TILE-TILE*_h,TILE-12,TILE*_h);
  ctx.fillStyle='#3a2410';ctx.fillRect(x+10,y+TILE-TILE*_h+4,5,4);ctx.fillRect(x+TILE-15,y+TILE-TILE*_h+4,5,4);
  return;
}
if(e.state==='dead'){ctx.fillStyle='#6a4020';ctx.fillRect(x+2,y+TILE-6,TILE-4,6);return;}
// 歩き状態（茶色モグラ）
ctx.fillStyle='#6a4020';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.55,TILE*0.42,Math.PI,0);ctx.fill();
ctx.fillRect(x+4,y+TILE*0.5,TILE-8,TILE*0.4);
ctx.fillStyle='#8b5a2a';ctx.beginPath();ctx.arc(x+TILE/2,y+TILE*0.5,TILE*0.32,Math.PI,0);ctx.fill();
// 目
ctx.fillStyle='#fff';ctx.fillRect(x+9,y+TILE*0.35,4,4);ctx.fillRect(x+TILE-13,y+TILE*0.35,4,4);
ctx.fillStyle='#000';ctx.fillRect(x+10,y+TILE*0.38,2,3);ctx.fillRect(x+TILE-12,y+TILE*0.38,2,3);
// 鼻
ctx.fillStyle='#d0807a';
if((e.facing||-1)<0)ctx.fillRect(x+2,y+TILE*0.5,5,4);else ctx.fillRect(x+TILE-7,y+TILE*0.5,5,4);
// 爪
ctx.fillStyle='#fff';
const fo=e.walkFrame===0?[-2,1]:[1,-2];
ctx.fillRect(x+5+fo[0],y+TILE-4,7,4);ctx.fillRect(x+TILE-12+fo[1],y+TILE-4,7,4);
}

function drawParticles(){for(const p of particles){ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size)}ctx.globalAlpha=1}
function drawScorePopups(){for(const p of scorePopups){ctx.globalAlpha=Math.min(1,p.life*3);ctx.fillStyle=p.color;ctx.font='bold 11px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillText(p.val,p.x-G.cam,p.y)}ctx.globalAlpha=1;ctx.textAlign='left'}

// === メニュー描画 ===
function drawMenu(){const m=G.menu;if(!m)return;
  ctx.save();ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);
  if(m.type==='confirm'){_drawConfirm(m);ctx.restore();return;}
  const P=_MP;ctx.fillStyle='rgba(16,16,40,0.95)';ctx.fillRect(P.x,P.y,P.w,P.h);ctx.strokeStyle='#FFD700';ctx.lineWidth=3;ctx.strokeRect(P.x,P.y,P.w,P.h);ctx.lineWidth=1;
  ctx.textAlign='center';ctx.fillStyle='#FFD700';ctx.font='bold 16px "Press Start 2P",monospace';
  ctx.fillText({pause:'PAUSE',settings:'SETTINGS',keys:'KEY CONFIG',help:'HOW TO PLAY'}[m.type]||'',W/2,P.y+32);
  if(m.type==='pause'){ctx.fillStyle='#bbb';ctx.font='7px "Press Start 2P",monospace';ctx.fillText(`${G.isExStage?'EX-'+(G.exStageNum||1):'WORLD '+G.currentWorld+'-'+G.currentLevel}    TIME ${G.timeLeft}    LIVES ${G.lives}    COIN ${G.coins}`,W/2,P.y+50);}
  if(m.type==='help')_drawHelp();
  else if(m.type==='keys')_drawKeys(m);
  else{const items=_menuItems(),rows=_menuRowRects(items.length);
    items.forEach((it,i)=>{const r=rows[i],sel=i===m.cur,cy=r.y+r.h/2+4;
      if(sel){ctx.fillStyle='rgba(255,215,0,0.14)';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle='#FFD700';ctx.strokeRect(r.x,r.y,r.w,r.h);}
      ctx.textAlign='left';ctx.fillStyle=sel?'#fff':'#aab';ctx.font=`${sel?'bold ':''}10px "Press Start 2P",monospace`;ctx.fillText((sel?'▶ ':'  ')+it.label,r.x+10,cy);
      if(it.val){const vx=r.x+r.w-80;ctx.textAlign='center';ctx.fillStyle=sel?'#FFD700':'#ccc';ctx.fillText(it.val(),vx,cy);if(sel){ctx.fillText('◀',vx-62,cy);ctx.fillText('▶',vx+62,cy);}}
    });
    const d=items[m.cur]&&items[m.cur].desc;if(d){ctx.textAlign='center';ctx.fillStyle='#9fd';ctx.font='12px sans-serif';ctx.fillText(d,W/2,P.y+P.h-34);}
    ctx.textAlign='center';ctx.fillStyle='#888';ctx.font='10px sans-serif';
    ctx.fillText(_gpConnected?'↑↓:選択  ←→:変更  A:決定  B:もどる':'↑↓:選択  ←→:変更  SPACE:決定  ESC:もどる   (タップでも操作できます)',W/2,P.y+P.h-14);}
  ctx.restore();
}
function _drawConfirm(m){const C=_CF;
  ctx.fillStyle='rgba(20,20,50,0.97)';ctx.fillRect(C.x,C.y,C.w,C.h);ctx.strokeStyle='#FFD700';ctx.lineWidth=3;ctx.strokeRect(C.x,C.y,C.w,C.h);ctx.lineWidth=1;
  ctx.textAlign='center';ctx.fillStyle='#fff';ctx.font='bold 16px sans-serif';ctx.fillText(m.text,W/2,C.y+44);
  if(m.sub){ctx.fillStyle='#fc6';ctx.font='12px sans-serif';ctx.fillText(m.sub,W/2,C.y+74);}
  _confirmBtns().forEach((r,i)=>{const sel=m.cur===i;ctx.fillStyle=i===0?(sel?'#27ae60':'#1a4a2a'):(sel?'#c0392b':'#4a1a1a');ctx.fillRect(r.x,r.y,r.w,r.h);
    ctx.strokeStyle=sel?'#fff':'#666';ctx.lineWidth=sel?3:1;ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.lineWidth=1;ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.fillText(i===0?'はい':'いいえ',r.x+r.w/2,r.y+r.h/2+5);});
}
function _drawKeys(m){const L=_keysLayout();
  ctx.textAlign='center';ctx.fillStyle='#888';ctx.font='7px "Press Start 2P",monospace';
  for(let c=0;c<SLOTS;c++){const r=L.cell(0,c);ctx.fillText(`KEY ${c+1}`,r.x+r.w/2,L.top-6);}
  ACTIONS.forEach((a,ri)=>{const rr=L.row(ri),selRow=m.row===ri;
    ctx.textAlign='left';ctx.fillStyle=selRow?'#fff':'#aab';ctx.font=`${selRow?'bold ':''}8px "Press Start 2P",monospace`;ctx.fillText(ACTION_LABEL[a],rr.x,rr.y+rr.h/2+4);
    for(let c=0;c<SLOTS;c++){const r=L.cell(ri,c),sel=selRow&&m.col===c,code=binds[a][c];
      ctx.fillStyle=sel?(m.waiting?'rgba(255,80,80,0.35)':'rgba(255,215,0,0.2)'):'rgba(255,255,255,0.05)';ctx.fillRect(r.x,r.y,r.w,r.h);
      ctx.strokeStyle=sel?'#FFD700':'#444';ctx.strokeRect(r.x,r.y,r.w,r.h);
      ctx.textAlign='center';ctx.fillStyle=code?'#fff':'#555';ctx.font='8px "Press Start 2P",monospace';ctx.fillText(sel&&m.waiting?'...':keyLabel(code),r.x+r.w/2,r.y+r.h/2+4);}
  });
  [['RESET TO DEFAULT',ACTIONS.length],['BACK',ACTIONS.length+1]].forEach(([lb,ri])=>{const rr=L.row(ri),sel=m.row===ri;
    if(sel){ctx.fillStyle='rgba(255,215,0,0.14)';ctx.fillRect(rr.x,rr.y,rr.w,rr.h);ctx.strokeStyle='#FFD700';ctx.strokeRect(rr.x,rr.y,rr.w,rr.h);}
    ctx.textAlign='left';ctx.fillStyle=sel?'#fff':'#aab';ctx.font=`${sel?'bold ':''}8px "Press Start 2P",monospace`;ctx.fillText((sel?'▶ ':'  ')+lb,rr.x+8,rr.y+rr.h/2+4);});
  const a=ACTIONS[m.row];ctx.textAlign='center';ctx.font='12px sans-serif';ctx.fillStyle=m.msg?'#fc6':'#9fd';
  ctx.fillText(m.msg||(m.waiting?'割り当てるキーを押してください（ESCで取り消し）':a?ACTION_DESC[a]:''),W/2,_MP.y+_MP.h-34);
  ctx.fillStyle='#888';ctx.font='10px sans-serif';ctx.fillText('↑↓←→:選択   SPACE:変更   DEL:消去   ESC:もどる',W/2,_MP.y+_MP.h-14);
}
function _drawHelp(){const P=_MP,k=mainKey,H1='#FFD700';
  const lines=[
    [H1,'キーボード'],
    ['#fff',`移動 ${k('left')} ${k('right')}　ダッシュ ${k('dash')}　ジャンプ ${k('jump')}　しゃがむ ${k('down')}`],
    ['#fff',`ファイア ${k('fire')}　ヨッシー ${k('yoshi')}　ストック ${k('item')}　メニュー ${k('pause')}　ミュート M`],
    [H1,'ゲームパッド'],
    ['#fff',G.padLayout==='modern'?'下:ジャンプ　左:ダッシュ　右:ファイア　上:ヨッシー':'A:ジャンプ　B:ダッシュ　Y:ファイア　X:ヨッシー'],
    ['#fff','SELECT:ストック　START:メニュー　L/R:BGM音量（配置は設定で変更可）'],
    [H1,'テクニック'],
    ['#ddd','・ダッシュ中のジャンプは高く跳べる（ジャンプ長押しでさらに高く）'],
    ['#ddd','・空中で壁に触れてジャンプ → 壁キック'],
    ['#ddd','・空中で↓ → ヒップドロップ（着地で周りの敵も倒す）'],
    ['#ddd','・ダッシュ中に↓ → スライディング'],
    ['#ddd','・ダッシュを押したまま甲羅に触れると持てる（離すと投げる）'],
    ['#ddd','・土管の上で↓ → 土管に入る／ミス後はジャンプで早送り'],
  ];
  ctx.textAlign='left';let y=P.y+70;
  for(const [c,t] of lines){ctx.fillStyle=c;ctx.font=c===H1?'bold 13px sans-serif':'12px sans-serif';if(c===H1)y+=4;ctx.fillText(t,P.x+26,y);y+=c===H1?20:19;}
  ctx.textAlign='center';ctx.fillStyle='#888';ctx.font='10px sans-serif';ctx.fillText('SPACE / ESC / タップ : もどる',W/2,P.y+P.h-14);
}
let _darkCv=null; // 暗闇ステージ用のオフスクリーンキャンバス
function drawOverlay(title,sub,bgColor){
ctx.fillStyle='rgba(0,0,0,0.65)';ctx.fillRect(0,0,W,H);
const bw=580,bh=200,bx=(W-bw)/2,by=(H-bh)/2-20;
const boxG=ctx.createLinearGradient(bx,by,bx,by+bh);boxG.addColorStop(0,bgColor+'dd');boxG.addColorStop(1,'#000000cc');
ctx.fillStyle=boxG;ctx.fillRect(bx,by,bw,bh);
ctx.strokeStyle='rgba(255,255,255,0.3)';ctx.lineWidth=2;ctx.strokeRect(bx+1,by+1,bw-2,bh-2);ctx.lineWidth=1;
ctx.fillStyle='#fff';ctx.font='bold 30px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.shadowColor='rgba(0,0,0,0.9)';ctx.shadowBlur=8;ctx.fillText(title,W/2,by+65);
ctx.font='11px "Press Start 2P",monospace';ctx.shadowBlur=4;
sub.split('\n').forEach((l,i)=>ctx.fillText(l,W/2,by+105+i*28));ctx.shadowBlur=0;ctx.textAlign='left'}

export function draw(){
const _sk=G.optShake&&!G.paused?1:0;const sx=G.shakeX*_sk*(Math.random()*2-1),sy=G.shakeY*_sk*(Math.random()*2-1);ctx.save();ctx.translate(sx,sy);
if(G.state==='intro'){ctx.fillStyle='#000';ctx.fillRect(0,0,W,H);ctx.fillStyle='#fff';ctx.font='bold 24px "Press Start 2P",monospace';ctx.textAlign='center';
const _introTitle=G.isExStage?`EXTRA STAGE-${G.exStageNum||1}`:`WORLD  ${G.currentWorld}-${G.currentLevel}`;
ctx.fillText(_introTitle,W/2,H/2-40);
const _wNames={1:'PLAINS',2:'DESERT',3:'SEASIDE',4:'MOUNTAIN',5:'OCEAN',6:'ICE LAND',7:'FORTRESS',8:'AIRSHIP'};
const _wn=G.isExStage?(G.exStageNum===2?'SPACE':'CHALLENGE'):(_wNames[G.currentWorld]||'');const _wnAlpha=Math.min(1,(120-G.introTimer)/20);ctx.globalAlpha=_wnAlpha;ctx.fillStyle='#FFD700';ctx.font='bold 10px "Press Start 2P",monospace';ctx.fillText(`- ${_wn} -`,W/2,H/2-14);ctx.globalAlpha=1;
ctx.fillStyle='#fff';ctx.font='14px "Press Start 2P",monospace';ctx.fillText(`x ${G.lives}`,W/2+30,H/2+20);ctx.fillStyle='#E52521';ctx.fillRect(W/2-20,H/2+6,16,10);ctx.fillStyle='#FBD000';ctx.fillRect(W/2-18,H/2+16,12,6);ctx.textAlign='left';ctx.restore();return}
drawBG();
// 天候エフェクト
{const _wS=getStage(G.currentWorld,G.currentLevel);const _wt=_wS?.bgTheme;
if(!G.ugMode&&!G.isExStage&&(_wt==='mountain'||_wt==='mountain_castle'||_wt==='airship')){
  // 雨
  ctx.strokeStyle='rgba(180,200,255,0.4)';ctx.lineWidth=1;
  for(let _ri=0;_ri<40;_ri++){const _rx=((_ri*73+G.frame*3)%W);const _ry=((_ri*137+G.frame*8)%H);ctx.beginPath();ctx.moveTo(_rx,_ry);ctx.lineTo(_rx-2,_ry+12);ctx.stroke();}
}
if(_wt==='airship'){
  // 稲光フラッシュ（既存BGの補強：まれに画面全体が白くなる）
  if(!G.optReduceFlash&&G.frame%600<2){ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(0,0,W,H);}
}}
ctx.save();ctx.translate(-G.cam,0);
// Lava flames (draw below blocks)
for(const f of lavaFlames){if(f.curH<2||f.x+f.w<G.cam-10||f.x>G.cam+W+10)continue;
const ft=H-TILE-f.curH;
const g=ctx.createLinearGradient(f.x,ft,f.x,H-TILE);
g.addColorStop(0,'rgba(255,255,100,0.95)');g.addColorStop(0.25,'rgba(255,160,0,1)');g.addColorStop(0.7,'rgba(255,50,0,1)');g.addColorStop(1,'rgba(200,0,0,1)');
ctx.fillStyle=g;ctx.fillRect(f.x,ft,f.w,f.curH);
if(f.curH>30){ctx.fillStyle='rgba(255,255,200,0.55)';ctx.fillRect(f.x+f.w*0.3,ft,f.w*0.4,f.curH*0.35);}
// Flicker tip
if(f.curH>0){const fl=Math.random()*6;ctx.fillStyle='rgba(255,255,255,0.7)';ctx.fillRect(f.x+f.w*0.2,ft-fl,f.w*0.6,fl+3);}
}
// Blocks
for(const p of platforms){if((p.type==='hidden'&&!p.hit)||p.x+p.w<G.cam-10||p.x>G.cam+W+10)continue;drawTile(p.x,p.y,p.type,p.hit,p.bounceOffset||0,p.color)}
for(const mp of movingPlats)if(!(mp.falling&&mp.y>H)&&mp.x+mp.w>G.cam-20&&mp.x<G.cam+W+20)drawMovingPlat(mp);
for(const sp of springs)if(sp.x+sp.w>G.cam-20&&sp.x<G.cam+W+20)drawSpring(sp);
if(G.checkpoint)drawCheckpoint(G.checkpoint);
if(G.checkpoint2)drawCheckpoint(G.checkpoint2);
// Piranhas (drawn before pipes so pipe covers them when inside)
for(const pr of piranhas)if(pr.alive&&pr.x+pr.w>G.cam-20&&pr.x<G.cam+W+20)drawPiranha(pr);
for(const p of pipes){if(p.x+p.w<G.cam-10||p.x>G.cam+W+10)continue;drawPipe(p.x,p.y,p.w,p.h,p.ceiling,p.color,p.horizontal);
if(p.isExit){ctx.fillStyle='rgba(255,255,100,'+(0.5+Math.sin(G.frame*0.08)*0.4)+')';ctx.font='bold 14px monospace';ctx.textAlign='center';if(p.horizontal){ctx.fillText('▶ EXIT',p.x+12,p.y-10);}else{ctx.fillText('▼ EXIT',p.x+p.w/2,p.y-6);}ctx.textAlign='left'}if(p.isGoalPipe){ctx.fillStyle='rgba(255,215,0,'+(0.6+Math.sin(G.frame*0.1)*0.35)+')';ctx.font='bold 20px monospace';ctx.textAlign='center';ctx.fillText('★',p.x+p.w/2,p.y-8);ctx.textAlign='left'}}
// Gravity zones
for(const gz of gravityZones){if(gz.x+gz.w<G.cam||gz.x>G.cam+W)continue;
ctx.fillStyle='rgba(160,80,255,0.08)';ctx.fillRect(gz.x,gz.y,gz.w,gz.h);
ctx.strokeStyle='rgba(160,80,255,0.35)';ctx.lineWidth=2;ctx.setLineDash([8,8]);ctx.strokeRect(gz.x,gz.y,gz.w,gz.h);ctx.setLineDash([]);ctx.lineWidth=1;
// 矢印（上向き）
const _gzCx=gz.x+gz.w/2,_gzCy=gz.y+gz.h/2;
ctx.fillStyle='rgba(160,80,255,0.3)';ctx.beginPath();ctx.moveTo(_gzCx,_gzCy-20);ctx.lineTo(_gzCx-10,_gzCy);ctx.lineTo(_gzCx+10,_gzCy);ctx.fill();}
// Wind zones
for(const wz of windZones){if(wz.x+wz.w<G.cam||wz.x>G.cam+W)continue;
ctx.fillStyle='rgba(200,220,255,0.06)';ctx.fillRect(wz.x,wz.y,wz.w,wz.h);}
// Wind particles
for(const wp of windParticles){ctx.globalAlpha=Math.max(0,wp.life);ctx.fillStyle='rgba(220,240,255,0.7)';ctx.fillRect(wp.x,wp.y,wp.size*3,wp.size*0.5);ctx.globalAlpha=1;}
// Chasing wall
if(G.chasingWall&&G.chasingWall.active){const cw=G.chasingWall;
const cwg=ctx.createLinearGradient(cw.x-40,0,cw.x,0);cwg.addColorStop(0,'rgba(0,0,0,1)');cwg.addColorStop(0.6,'rgba(80,0,0,0.95)');cwg.addColorStop(1,'rgba(200,60,0,0.8)');
ctx.fillStyle=cwg;ctx.fillRect(cw.x-W*2,0,W*2,H);
// 先端の炎エフェクト
for(let fy=0;fy<H;fy+=12){const fw=6+Math.random()*10;ctx.fillStyle=`rgba(255,${100+Math.random()*155},0,${0.5+Math.random()*0.5})`;ctx.fillRect(cw.x-2,fy,fw,8+Math.random()*6);}}
// Cannons
for(const cn of cannons){if(cn.x+cn.w<G.cam-10||cn.x>G.cam+W+10)continue;
if(cn.dead){
  // 破壊済み：傾いてひびが入った残骸
  ctx.save();ctx.translate(cn.x+cn.w/2,cn.y+cn.h);ctx.rotate(0.28);
  ctx.fillStyle='#2a2a2a';ctx.fillRect(-cn.w/2,-cn.h,cn.w,cn.h);
  ctx.fillStyle='#3a3a3a';ctx.fillRect(-cn.w/2+2,-cn.h+2,cn.w-4,cn.h-4);
  ctx.strokeStyle='#666';ctx.lineWidth=1;ctx.setLineDash([2,3]);
  ctx.beginPath();ctx.moveTo(-5,-cn.h+4);ctx.lineTo(3,-cn.h/2-2);ctx.lineTo(-1,-6);ctx.stroke();
  ctx.beginPath();ctx.moveTo(4,-cn.h+10);ctx.lineTo(-2,-cn.h/2+4);ctx.stroke();
  ctx.setLineDash([]);ctx.restore();
  // 煙エフェクト
  if(G.frame%6<3){ctx.fillStyle=`rgba(60,60,60,${0.3+Math.random()*0.3})`;ctx.beginPath();const _sr=3+Math.random()*4;ctx.arc(cn.x+cn.w/2-4,cn.y-_sr,_sr,0,Math.PI*2);ctx.fill();}
}else{
  // 通常：HPに応じてボディ色が赤みがかる
  const _dmg=cn.hp!==undefined?(5-cn.hp):0;
  const _rc=Math.min(0x1a+_dmg*0x0f,0x5a);
  ctx.fillStyle=`rgb(${_rc},${Math.max(0x1a-_dmg*8,0)},${Math.max(0x1a-_dmg*8,0)})`;ctx.fillRect(cn.x,cn.y,cn.w,cn.h);
  ctx.fillStyle=`rgb(${_rc+0x19},${Math.max(0x33-_dmg*10,0)},${Math.max(0x33-_dmg*10,0)})`;ctx.fillRect(cn.x+2,cn.y+2,cn.w-4,cn.h-4);
  ctx.fillStyle='#888';ctx.beginPath();ctx.arc(cn.x+cn.w/2,cn.y+14,8,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#333';ctx.fillRect(cn.x+cn.w/2-4,cn.y+10,3,3);ctx.fillRect(cn.x+cn.w/2+1,cn.y+10,3,3);
  if(cn.timer<10){ctx.fillStyle=`rgba(255,${150+Math.random()*100},0,${0.5+Math.random()*0.5})`;ctx.beginPath();ctx.arc(cn.x+cn.w/2,cn.y-4,8+Math.random()*4,0,Math.PI*2);ctx.fill();}
}}
// Bullet Bills
for(const bb of bulletBills){if(!bb.alive)continue;const dir=bb.vx>0?1:-1;ctx.fillStyle='#111';ctx.fillRect(bb.x,bb.y,bb.w,bb.h);ctx.fillStyle='#333';ctx.fillRect(bb.x+(dir>0?2:4),bb.y+2,bb.w-6,bb.h-4);ctx.fillStyle='#111';ctx.fillRect(dir>0?bb.x+bb.w-2:bb.x,bb.y+2,4,bb.h-4);ctx.fillStyle='#fff';ctx.fillRect(bb.x+(dir>0?4:bb.w-8),bb.y+4,4,4);ctx.fillStyle='#000';ctx.fillRect(bb.x+(dir>0?5:bb.w-7),bb.y+5,2,2);ctx.fillStyle=`rgba(255,${100+Math.random()*100},0,0.7)`;ctx.fillRect(dir>0?bb.x-6:bb.x+bb.w+2,bb.y+4,6,bb.h-8)}
// Hammers
for(const h of hammers){ctx.save();ctx.translate(h.x+7,h.y+7);ctx.rotate(h.rot);ctx.fillStyle='#8B4513';ctx.fillRect(-2,0,4,10);ctx.fillStyle='#888';ctx.fillRect(-6,-6,12,8);ctx.restore()}
// === ワンワン描画 ===
for(const cc of chainChomps){if(!cc.alive)continue;
  const bx=cc.x,by=cc.y;
  // 鎖（postから本体へドット）
  ctx.fillStyle='#888';
  for(let s=0;s<=1;s+=0.15){
    const lx=cc.postX+4+(bx+cc.w/2-cc.postX-4)*s;
    const ly=cc.postY+(by+cc.h/2-cc.postY)*s;
    ctx.beginPath();ctx.arc(lx,ly,3,0,Math.PI*2);ctx.fill();
  }
  // 杭
  ctx.fillStyle='#8B4513';ctx.fillRect(cc.postX+10,cc.postY,12,TILE);
  // 本体（黒球）
  const hurt=cc.state==='lunge';
  ctx.fillStyle=hurt?'#333':'#111';
  ctx.beginPath();ctx.arc(bx+cc.w/2,by+cc.h/2,cc.w/2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#fff';
  ctx.beginPath();ctx.arc(bx+cc.w/2-6,by+cc.h/2-4,7,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(bx+cc.w/2+6,by+cc.h/2-4,7,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#000';
  ctx.beginPath();ctx.arc(bx+cc.w/2-5,by+cc.h/2-4,4,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(bx+cc.w/2+7,by+cc.h/2-4,4,0,Math.PI*2);ctx.fill();
  // 牙
  ctx.fillStyle='#fff';
  ctx.fillRect(bx+cc.w/2-8,by+cc.h/2+4,6,5);
  ctx.fillRect(bx+cc.w/2+2,by+cc.h/2+4,6,5);
}
// === 飛び跳ねるブロック描画 ===
for(const jb of jumpBlocks){if(!jb.alive)continue;
  // ブロック本体（レンガ色）
  ctx.fillStyle='#c8703a';ctx.fillRect(jb.x,jb.y,jb.w,jb.h);
  ctx.fillStyle='#a0522d';
  ctx.fillRect(jb.x,jb.y+8,jb.w,2);ctx.fillRect(jb.x,jb.y+18,jb.w,2);
  ctx.fillRect(jb.x+8,jb.y,2,8);ctx.fillRect(jb.x+4,jb.y+10,2,8);ctx.fillRect(jb.x+12,jb.y+10,2,8);
  // 目
  ctx.fillStyle='#fff';ctx.fillRect(jb.x+4,jb.y+3,5,5);ctx.fillRect(jb.x+15,jb.y+3,5,5);
  ctx.fillStyle='#000';ctx.fillRect(jb.x+6,jb.y+4,3,3);ctx.fillRect(jb.x+17,jb.y+4,3,3);
}
// === パイポ描画 ===
for(const pp of pipos){if(!pp.alive)continue;
  // 外炎
  const hue=(G.frame*8)%40+20;
  ctx.fillStyle=`hsl(${hue},100%,55%)`;
  ctx.beginPath();ctx.arc(pp.x+pp.w/2,pp.y+pp.h/2,pp.w/2+3,0,Math.PI*2);ctx.fill();
  // 内炎
  ctx.fillStyle='#fff8c0';
  ctx.beginPath();ctx.arc(pp.x+pp.w/2,pp.y+pp.h/2,pp.w/2-2,0,Math.PI*2);ctx.fill();
  // 目
  ctx.fillStyle='#000';
  ctx.beginPath();ctx.arc(pp.x+pp.w/2-4,pp.y+pp.h/2-2,3,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(pp.x+pp.w/2+4,pp.y+pp.h/2-2,3,0,Math.PI*2);ctx.fill();
}
// Mushrooms, stars, flowers
for(const m of mushrooms)if(m.alive)drawMushroom(m);
for(const fb of fireballs)if(fb.alive)drawFireball(fb);
// Ice balls
for(const ib of iceBalls){if(!ib.alive)continue;const ix=Math.round(ib.x),iy=Math.round(ib.y);ctx.fillStyle='#88ddff';ctx.beginPath();ctx.arc(ix+6,iy+6,7,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ccf0ff';ctx.beginPath();ctx.arc(ix+6,iy+5,4,0,Math.PI*2);ctx.fill();ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(ix+4,iy+4,2,0,Math.PI*2);ctx.fill();}
// Mario hammers
for(const mh of marioHammers){if(!mh.alive)continue;ctx.save();ctx.translate(mh.x+8,mh.y+8);ctx.rotate(mh.rot);ctx.fillStyle='#8B4513';ctx.fillRect(-3,0,6,12);ctx.fillStyle='#aaa';ctx.fillRect(-7,-7,14,9);ctx.fillStyle='#ccc';ctx.fillRect(-5,-5,10,5);ctx.restore();}
// Yoshi items (eggs hatching)
for(const yi of yoshiItems)drawYoshiEggItem(yi);
// Yoshi egg projectiles
for(const eg of yoshiEggs)if(eg.alive)drawYoshiEggProj(eg);
// Coins
for(const c of coinItems){if(c.collected||c._psHidden)continue;if(c.type==='firecoin'){if(c.x+14>=G.cam&&c.x<=G.cam+W)drawFireCoin(c.x,c.y);continue}if(c.type==='frozendrop'){if(c.x+16>=G.cam&&c.x<=G.cam+W)drawCoinItem(c.x,c.y);continue}if(c.pop){drawCoinItem(c.x,c.popY);continue}if(c.x+TILE<G.cam||c.x>G.cam+W)continue;drawCoinItem(c.x,c.y)}
// P-Switch coins (bricks turned into coins)
if(G._psCoins){for(const pc of G._psCoins){if(pc.collected)continue;if(pc.x+TILE<G.cam||pc.x>G.cam+W)continue;drawCoinItem(pc.x,pc.y);}}
// Enemies
for(const e of enemies){if(!e.alive||e.x+e.w<G.cam-10||e.x>G.cam+W+10)continue;const _sx=e.shakeX||0;if(_sx)e.x+=_sx;
if(e.type==='koopa'||e.type==='parakoopa'||e.type==='parakoopaR')drawKoopa(e);else if(e.type==='buzzy')drawBuzzy(e);else if(e.type==='hammerBro')drawHammerBro(e);else if(e.type==='cactus')drawCactus(e);else if(e.type==='lakitu')drawLakitu(e);else if(e.type==='cheepH'||e.type==='cheepV')drawCheep(e);else if(e.type==='firePlant')drawFirePlant(e);else if(e.type==='plantFire')drawPlantFireball(e);else if(e.type==='penguin')drawPenguin(e);else if(e.type==='teresa')drawTeresa(e);else if(e.type==='thwomp')drawThwomp(e);else if(e.type==='blooper')drawBlooper(e);else if(e.type==='dryBones')drawDryBones(e);else if(e.type==='angrySun')drawAngrySun(e);else if(e.type==='chuck')drawChuck(e);else if(e.type==='shyGuy')drawShyGuy(e);else if(e.type==='rex')drawRex(e);else if(e.type==='bobomb')drawBobomb(e);else if(e.type==='spiny')drawSpiny(e);else if(e.type==='spikeTop')drawSpikeTop(e);else if(e.type==='pokey')drawPokey(e);else if(e.type==='fuzzy')drawFuzzy(e);else if(e.type==='montyMole')drawMontyMole(e);
else if(e.type!=='miniBowser')drawGoomba(e.x,e.y,e.state==='dead',e.walkFrame);if(_sx)e.x-=_sx;}
// Frozen enemy overlay
for(const e of enemies){if(!e.alive||!e.frozen)continue;const sx=e.shakeX||0;ctx.globalAlpha=0.5;ctx.fillStyle='#88ddff';ctx.fillRect(e.x-2+sx,e.y-2,e.w+4,e.h+4);ctx.globalAlpha=0.3;ctx.fillStyle='#fff';ctx.fillRect(e.x+sx,e.y,e.w,e.h);ctx.globalAlpha=1;
ctx.strokeStyle='#44aaff';ctx.lineWidth=2;ctx.strokeRect(e.x-2+sx,e.y-2,e.w+4,e.h+4);ctx.lineWidth=1;}
if((G.isExStage||G.currentLevel!==3)&&!G.ugMode&&flagPole.x-G.cam>-200&&flagPole.x-G.cam<W+200)drawFlag();
// Bowser
if(bowser.alive&&bowser.x+bowser.w>G.cam-10&&bowser.x<G.cam+W+10){
const bx=Math.round(bowser.x),by=Math.round(bowser.y);
const flash=bowser.hurtTimer>0&&bowser.hurtTimer%6<3;
if(bowser.state==='dead')ctx.globalAlpha=Math.max(0,bowser.deadTimer/160);
if(flash&&bowser.state!=='dead')ctx.globalAlpha=0.35;
// Phase2 赤オーラ
if(bowser.phase===2&&bowser.state!=='dead'){
  const _aura=0.18+Math.sin(G.frame*0.15)*0.08;
  ctx.fillStyle=`rgba(255,40,0,${_aura})`;
  ctx.beginPath();ctx.arc(bx+bowser.w/2,by+bowser.h/2,50+Math.sin(G.frame*0.1)*6,0,Math.PI*2);ctx.fill();
}
// Tail（背中側に揺れる尻尾＋トゲ）
{const _tb=bowser.facing>0?bx-2:bx+66;const _td=bowser.facing>0?-1:1;const _tw=Math.sin(G.frame*0.1)*3;
ctx.fillStyle='#1e5c1e';ctx.beginPath();ctx.moveTo(_tb,by+46);ctx.lineTo(_tb+_td*16,by+50+_tw);ctx.lineTo(_tb,by+56);ctx.closePath();ctx.fill();
ctx.fillStyle='#f5f0dc';ctx.beginPath();ctx.moveTo(_tb+_td*12,by+47+_tw);ctx.lineTo(_tb+_td*20,by+50+_tw);ctx.lineTo(_tb+_td*12,by+53+_tw);ctx.closePath();ctx.fill();}
// Shell spikes（骨白＋根本の影）
for(let s=0;s<3;s++){
ctx.fillStyle='#d8d0b0';ctx.beginPath();ctx.moveTo(bx+14+s*14,by+18);ctx.lineTo(bx+20+s*14,by+4);ctx.lineTo(bx+26+s*14,by+18);ctx.fill();
ctx.fillStyle='#f5f0dc';ctx.beginPath();ctx.moveTo(bx+16+s*14,by+18);ctx.lineTo(bx+20+s*14,by+7);ctx.lineTo(bx+24+s*14,by+18);ctx.fill();}
// Back/shell（縁取り＋内側）
ctx.fillStyle='#143d14';ctx.fillRect(bx+8,by+18,48,42);
ctx.fillStyle='#1e5c1e';ctx.fillRect(bx+10,by+20,44,38);
// Belly（タン色＋節ライン）
ctx.fillStyle='#e8c87a';ctx.fillRect(bx+14,by+32,36,26);
ctx.fillStyle='#c8a050';ctx.fillRect(bx+14,by+40,36,2);ctx.fillRect(bx+14,by+48,36,2);
// Head（タン＋下部シェード）
ctx.fillStyle='#c8a050';ctx.fillRect(bx+10,by,44,26);
ctx.fillStyle='#a8843c';ctx.fillRect(bx+10,by+23,44,3);
// 赤毛（クラウンの後ろから覗くたてがみ）
ctx.fillStyle='#e74c3c';
ctx.beginPath();ctx.moveTo(bx+10,by+2);ctx.lineTo(bx+4,by-8);ctx.lineTo(bx+14,by-1);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(bx+50,by-1);ctx.lineTo(bx+60,by-8);ctx.lineTo(bx+54,by+2);ctx.closePath();ctx.fill();
// 白い角（頭の左右・先端に影）
ctx.fillStyle='#f5f0dc';
ctx.beginPath();ctx.moveTo(bx+12,by+6);ctx.lineTo(bx+1,by-5);ctx.lineTo(bx+16,by+1);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(bx+52,by+6);ctx.lineTo(bx+63,by-5);ctx.lineTo(bx+48,by+1);ctx.closePath();ctx.fill();
ctx.fillStyle='#bbb';ctx.fillRect(bx+2,by-5,3,3);ctx.fillRect(bx+59,by-5,3,3);
// Crown
ctx.fillStyle='#FFD700';
ctx.beginPath();ctx.moveTo(bx+12,by);ctx.lineTo(bx+17,by-11);ctx.lineTo(bx+22,by);ctx.fill();
ctx.beginPath();ctx.moveTo(bx+28,by);ctx.lineTo(bx+33,by-16);ctx.lineTo(bx+38,by);ctx.fill();
ctx.beginPath();ctx.moveTo(bx+42,by);ctx.lineTo(bx+47,by-11);ctx.lineTo(bx+52,by);ctx.fill();
// Eyes（怒り眉付き・向きに追従）
const ex=bowser.facing>0?bx+18:bx+30;
ctx.fillStyle='#8a1500';ctx.fillRect(ex-2,by+3,15,4);
ctx.fillStyle='#cc1100';ctx.fillRect(ex,by+6,12,9);ctx.fillStyle='#000';ctx.fillRect(ex+2,by+8,8,6);ctx.fillStyle='#fff';ctx.fillRect(ex+5,by+8,3,3);
// Nose（鼻面＋鼻孔＋牙）
ctx.fillStyle='#a06820';ctx.fillRect(bx+18,by+17,28,6);ctx.fillStyle='#000';ctx.fillRect(bx+21,by+18,5,4);ctx.fillRect(bx+38,by+18,5,4);
ctx.fillStyle='#fff';
ctx.beginPath();ctx.moveTo(bx+18,by+26);ctx.lineTo(bx+21,by+19);ctx.lineTo(bx+24,by+26);ctx.closePath();ctx.fill();
ctx.beginPath();ctx.moveTo(bx+40,by+26);ctx.lineTo(bx+43,by+19);ctx.lineTo(bx+46,by+26);ctx.closePath();ctx.fill();
// Arms（タン色＋トゲ腕輪）
ctx.fillStyle='#e8c87a';
const _a1x=bx+(bowser.facing>0?-6:60),_a2x=bx+(bowser.facing>0?54:2);
ctx.fillRect(_a1x,by+28,16,20);ctx.fillRect(_a2x,by+30,16,16);
ctx.fillStyle='#555';ctx.fillRect(_a1x,by+38,16,4);ctx.fillRect(_a2x,by+38,16,4);
ctx.fillStyle='#f5f0dc';ctx.fillRect(_a1x+3,by+37,3,6);ctx.fillRect(_a1x+10,by+37,3,6);ctx.fillRect(_a2x+3,by+37,3,6);ctx.fillRect(_a2x+10,by+37,3,6);
// Legs with walk animation
ctx.fillStyle='#1e5c1e';
const lf=bowser.onGround?(G.frame%18<9?-2:2):0;
ctx.fillRect(bx+12,by+56,18,16+lf);ctx.fillRect(bx+34,by+56,18,16-lf);
// Claws
ctx.fillStyle='#ddd';
ctx.fillRect(bx+10,by+71,8,6);ctx.fillRect(bx+19,by+71,6,5);
ctx.fillRect(bx+34,by+71,6,5);ctx.fillRect(bx+43,by+71,8,6);
ctx.globalAlpha=1;
// HP bar
if(bowser.state!=='dead'){
const hpW=80,hpX=bx+(bowser.w-hpW)/2,hpY=by-22;
ctx.fillStyle='#333';ctx.fillRect(hpX-1,hpY-1,hpW+2,12);
ctx.fillStyle=bowser.phase===2?'#ff4400':'#e74c3c';ctx.fillRect(hpX,hpY,Math.max(0,hpW*(bowser.hp/bowser.maxHp)),10);
ctx.strokeStyle=bowser.phase===2?'#ff8800':'#fff';ctx.lineWidth=1;ctx.strokeRect(hpX-1,hpY-1,hpW+2,12);
ctx.fillStyle=bowser.phase===2?(G.frame%10<5?'#ff4400':'#fff'):'#fff';ctx.font='6px "Press Start 2P"';ctx.textAlign='center';ctx.fillText(bowser.phase===2?'BOWSER !!':'BOWSER',bx+bowser.w/2,hpY-5);ctx.textAlign='left';}
}
// Bowser shockwaves
for(const sw of bowserShockwaves){if(!sw.alive)continue;
const sx=Math.round(sw.x-sw.w/2),sy=Math.round(sw.y);
if(sx+sw.w<G.cam-10||sx>G.cam+W+10)continue;
const _swAlpha=Math.min(1,sw.timer/30);
ctx.globalAlpha=_swAlpha;
ctx.fillStyle='#ff4400';ctx.fillRect(sx,sy+4,sw.w,sw.h-4);
ctx.fillStyle='#ff8800';ctx.fillRect(sx+2,sy+2,sw.w-4,sw.h-6);
ctx.fillStyle='#ffcc00';ctx.fillRect(sx+6,sy+6,sw.w-12,sw.h-10);
// 衝撃波の火花
if(G.frame%3===0){ctx.fillStyle='#ffee44';ctx.fillRect(sx+Math.random()*sw.w,sy-4+Math.random()*8,4,4);}
ctx.globalAlpha=1;}
// Bowser fire
for(const bf of bowserFire){if(!bf.alive||bf.delay>0||bf.x+bf.w<G.cam-10||bf.x>G.cam+W+10)continue;const bfx=Math.round(bf.x),bfy=Math.round(bf.y),r=9;ctx.fillStyle='#ff2200';ctx.beginPath();ctx.arc(bfx+r,bfy+r,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ff8800';ctx.beginPath();ctx.arc(bfx+r,bfy+r,6,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffee44';ctx.beginPath();ctx.arc(bfx+r,bfy+r,3,0,Math.PI*2);ctx.fill();}
// Princess Peach
if(peach.alive&&peach.x+peach.w>G.cam-10&&peach.x<G.cam+W+10){
const px=Math.round(peach.x),py=Math.round(peach.y);
const wo=peach.caught?0:(peach.walkFrame===0?-2:2);
// Dress (pink) ベル型 + 裾シェーディング + フリル
ctx.fillStyle='#f48fb1';ctx.fillRect(px+2,py+22,26,30);
ctx.fillStyle='#f06292';ctx.fillRect(px+4,py+38,22,14);
ctx.fillStyle='#d81b60';ctx.fillRect(px+2,py+49,26,3);
ctx.fillStyle='#f8bbd0';ctx.beginPath();for(let i=0;i<4;i++)ctx.arc(px+6+i*6,py+52,3,0,Math.PI);ctx.fill();
// パニエの白ライン
ctx.fillStyle='#fff';ctx.fillRect(px+8,py+26,14,18);
ctx.fillStyle='#f8bbd0';ctx.fillRect(px+8,py+42,14,2);
// 胸元のブローチ（青い宝石）
ctx.fillStyle='#1565c0';ctx.beginPath();ctx.arc(px+15,py+24,2.6,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#64b5f6';ctx.beginPath();ctx.arc(px+14,py+23,1,0,Math.PI*2);ctx.fill();
// Body
ctx.fillStyle='#ffcc99';ctx.fillRect(px+8,py+14,14,14);
// パフスリーブ + 腕
ctx.fillStyle='#f8bbd0';ctx.beginPath();ctx.arc(px+6,py+18,5,0,Math.PI*2);ctx.arc(px+24,py+18,5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#f48fb1';ctx.fillRect(px+1,py+18,8,8);ctx.fillRect(px+21,py+18,8,8);
// 白手袋
ctx.fillStyle='#fff';ctx.fillRect(px+1,py+24,7,6);ctx.fillRect(px+22,py+24,7,6);
// Hair (blonde) シェーディング入り
ctx.fillStyle='#FFD700';ctx.fillRect(px+6,py+4,18,12);
ctx.fillRect(px+4,py+8,4,16);ctx.fillRect(px+22,py+8,4,16);
ctx.fillStyle='#e6b800';ctx.fillRect(px+4,py+18,4,6);ctx.fillRect(px+22,py+18,4,6);ctx.fillRect(px+6,py+5,3,8);
// Face
ctx.fillStyle='#ffcc99';ctx.fillRect(px+8,py+8,14,10);
// 前髪
ctx.fillStyle='#FFD700';ctx.fillRect(px+8,py+6,14,3);ctx.fillRect(px+8,py+8,4,3);
// Eyes（青い瞳 + まつげ）+ 頬 + 唇
ctx.fillStyle='#000';ctx.fillRect(px+10,py+10,3,1);ctx.fillRect(px+17,py+10,3,1);
ctx.fillStyle='#1565c0';ctx.fillRect(px+10,py+11,3,3);ctx.fillRect(px+17,py+11,3,3);
ctx.fillStyle='#f8a5b0';ctx.fillRect(px+8,py+14,3,2);ctx.fillRect(px+19,py+14,3,2);
ctx.fillStyle='#e53935';ctx.fillRect(px+13,py+16,4,2);
// Crown + 宝石
ctx.fillStyle='#FFD700';ctx.fillRect(px+7,py+2,16,6);
ctx.beginPath();ctx.moveTo(px+8,py+2);ctx.lineTo(px+10,py-4);ctx.lineTo(px+12,py+2);ctx.fill();
ctx.beginPath();ctx.moveTo(px+13,py+2);ctx.lineTo(px+15,py-8);ctx.lineTo(px+17,py+2);ctx.fill();
ctx.beginPath();ctx.moveTo(px+18,py+2);ctx.lineTo(px+20,py-4);ctx.lineTo(px+22,py+2);ctx.fill();
ctx.fillStyle='#ff0000';ctx.beginPath();ctx.arc(px+15,py-6,2.5,0,Math.PI*2);ctx.fill();
ctx.fillStyle='#42a5f5';ctx.beginPath();ctx.arc(px+10,py+5,1.5,0,Math.PI*2);ctx.arc(px+20,py+5,1.5,0,Math.PI*2);ctx.fill();
// Legs（ピンクの靴）
ctx.fillStyle='#ffcc99';ctx.fillRect(px+8+wo,py+50,9,4);ctx.fillRect(px+17-wo,py+50,9,4);
ctx.fillStyle='#e91e63';ctx.fillRect(px+7+wo,py+53,10,3);ctx.fillRect(px+17-wo,py+53,10,3);
// Caught heart
if(peach.caught&&G.peachChase&&G.peachChase.catchT<80){
ctx.fillStyle=`rgba(255,100,150,${1-(G.peachChase.catchT/80)})`;
ctx.font='bold 28px monospace';ctx.textAlign='center';
ctx.fillText('♥',px+peach.w/2,py-18);ctx.textAlign='left';}
}
// Star aura
if(G.starTimer>0){const hue=(G.frame*12)%360;ctx.fillStyle=`hsla(${hue},100%,60%,0.3)`;ctx.beginPath();ctx.arc(mario.x+13,mario.y+mario.h/2,22,0,Math.PI*2);ctx.fill()}
// Yoshi body (behind Mario)
if(yoshi.alive)drawYoshiBody(yoshi.x,yoshi.y,yoshi.facing,yoshi.mounted)
// 残像エフェクト
{
for(const _ai of G.afterimages){ctx.globalAlpha=_ai.alpha;if(G.starTimer>0){const _hue=(G.frame*8+G.afterimages.indexOf(_ai)*50)%360;ctx.fillStyle=`hsl(${_hue},100%,60%)`;}drawMario(_ai.x,_ai.y,_ai.facing,_ai.wf,false,_ai.big);ctx.globalAlpha=1;}}
// Mario (Mega aura)
if(G.megaTimer>0&&!mario.dead){const _megaHue=(G.frame*6)%360;ctx.fillStyle=`hsla(${_megaHue},100%,60%,0.25)`;const _my2=yoshi.mounted&&yoshi.alive?mario.y-12:mario.y;ctx.beginPath();ctx.arc(mario.x+mario.w/2,_my2+mario.h/2,mario.h*0.8+Math.sin(G.frame*0.2)*5,0,Math.PI*2);ctx.fill();
// 拡大描画
ctx.save();const _mcx=mario.x+mario.w/2,_mcy=_my2+mario.h;ctx.translate(_mcx,_mcy);ctx.scale(1.6,1.6);ctx.translate(-_mcx,-_mcy);
drawMario(mario.x,_my2,mario.facing,mario.walkFrame,mario.dead,mario.big);ctx.restore();}else{
drawMario(mario.x,yoshi.mounted&&yoshi.alive?mario.y-12:mario.y,mario.facing,mario.walkFrame,mario.dead,mario.big);}
// Yoshi head (in front of Mario)
if(yoshi.alive)drawYoshiHead(yoshi.x,yoshi.y,yoshi.facing);
drawParticles();ctx.restore();
// === ピノキオ部屋の描画 ===
if(G.pinoRoom&&G.state==='play'){
  // 宝箱：一番近いものをハイライト選択
  let _selChest=null;
  if(!G.chestOpened){
    let _sdist=90;
    for(const p of platforms){
      if(p.type!=='chest'||p.opened)continue;
      const _d=Math.abs(mario.x+mario.w/2-(p.x+p.w/2));
      if(_d<_sdist){_sdist=_d;_selChest=p;}
    }
  }
  // 宝箱の描画
  for(const p of platforms){
    if(p.type!=='chest')continue;
    const _cx=p.x-G.cam,_cy=p.y;
    const _isSel=(_selChest===p);
    // 選択グロー
    if(_isSel&&!p.opened){
      const _ga=0.35+Math.sin(G.frame*0.18)*0.2;
      ctx.fillStyle=`rgba(255,215,0,${_ga})`;ctx.fillRect(_cx-6,_cy-6,p.w+12,p.h+12);
    }
    ctx.fillStyle=p.opened?'#8B6914':'#c8861a';ctx.fillRect(_cx,_cy,p.w,p.h);
    ctx.strokeStyle=(_isSel&&!p.opened)?'#FFD700':'#5c3d00';ctx.lineWidth=2;ctx.strokeRect(_cx,_cy,p.w,p.h);
    ctx.fillStyle='#5c3d00';ctx.fillRect(_cx,_cy+p.h/2-2,p.w,4);// 仕切り線
    ctx.fillStyle='#FFD700';ctx.fillRect(_cx+p.w/2-6,_cy+p.h/2-8,12,12);// 錠前
    if(p.opened){ctx.fillStyle='rgba(255,200,0,0.6)';ctx.fillRect(_cx,_cy-16,p.w,16);}
    // 番号ラベル（1〜5）
    if(!p.opened){ctx.fillStyle='#fff';ctx.font='bold 9px monospace';ctx.textAlign='center';ctx.fillText(p.chestIdx+1,_cx+p.w/2,_cy+p.h-4);ctx.textAlign='left';}
    ctx.lineWidth=1;
  }
  // 選択宝箱の上に「↑ OPEN」プロンプト
  if(_selChest&&!_selChest.opened&&!G.chestOpened){
    const _px=_selChest.x-G.cam+_selChest.w/2;
    const _py=_selChest.y-10-Math.abs(Math.sin(G.frame*0.12))*5;
    ctx.fillStyle='#FFD700';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
    ctx.fillText('JUMP!',_px,_py);ctx.textAlign='left';
  }
  // EXワープ土管（ピノキオ報酬9）レインボー
  for(const p of pipes){
    if(!p.isExWarp)continue;
    const _px=p.x-G.cam,_py=p.y,_pw=p.w,_ph=p.h;
    const _hue=(G.frame*4)%360;
    // パイプ本体
    ctx.fillStyle=`hsl(${_hue},90%,35%)`;ctx.fillRect(_px,_py,_pw,_ph);
    ctx.fillStyle=`hsl(${(_hue+60)%360},90%,50%)`;ctx.fillRect(_px+4,_py+4,_pw-8,_ph-4);
    ctx.fillStyle=`hsl(${(_hue+30)%360},90%,40%)`;ctx.fillRect(_px+_pw*0.55,_py+4,_pw*0.1,_ph-4);
    // 上部リム（幅広・立体感）
    ctx.fillStyle=`hsl(${(_hue+120)%360},90%,40%)`;ctx.fillRect(_px-4,_py,_pw+8,12);
    ctx.fillStyle=`hsl(${(_hue+150)%360},90%,55%)`;ctx.fillRect(_px-4,_py,_pw+8,6);
    ctx.fillStyle=`hsl(${(_hue+180)%360},90%,30%)`;ctx.fillRect(_px-4,_py+10,_pw+8,2);
    // 星スパーク
    for(let _si=0;_si<4;_si++){const _sa=(_si*Math.PI/2+(G.frame*0.12));const _sx=_px+_pw/2+Math.cos(_sa)*(_pw/2+8);const _sy=_py+_ph*0.4+Math.sin(_sa)*12;ctx.fillStyle=`hsl(${(_hue+_si*60)%360},100%,70%)`;ctx.beginPath();ctx.arc(_sx,_sy,3,0,Math.PI*2);ctx.fill();}
    // EXラベル（白・影付き）
    const _exLbl=p.exNum===2?'EX-2':'EX-1';
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.font='bold 9px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillText(_exLbl,_px+_pw/2+1,_py+_ph*0.55+1);
    ctx.fillStyle='#fff';ctx.fillText(_exLbl,_px+_pw/2,_py+_ph*0.55);ctx.textAlign='left';
  }
  // ゴールフラグポール（ピノキオ報酬8）
  if(G.pinoFlagReady){
    const _fpx=48-G.cam,_fpy=H-TILE*6,_fph=TILE*5;
    // ポール（銀）
    ctx.fillStyle='#bbb';ctx.fillRect(_fpx+6,_fpy,4,_fph);
    ctx.fillStyle='#ddd';ctx.fillRect(_fpx+7,_fpy,2,_fph);
    // 旗（赤白交互にアニメ）
    const _fc=Math.floor(G.frame/12)%2===0?'#E52521':'#fff';
    ctx.fillStyle=_fc;ctx.beginPath();ctx.moveTo(_fpx+10,_fpy+4);ctx.lineTo(_fpx+30,_fpy+14);ctx.lineTo(_fpx+10,_fpy+26);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,0.3)';ctx.lineWidth=1;ctx.strokeRect(_fpx+6,_fpy,4,_fph);ctx.lineWidth=1;
    // 台座球
    ctx.fillStyle='#FFD700';ctx.beginPath();ctx.arc(_fpx+8,_fpy,5,0,Math.PI*2);ctx.fill();
    // 台座下
    ctx.fillStyle='#888';ctx.fillRect(_fpx+2,_fpy+_fph,12,6);
    // GOAL文字（点滅）
    if(Math.floor(G.frame/20)%2===0){
      ctx.fillStyle='#FFD700';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
      ctx.fillText('GOAL',_fpx+8,_fpy-10);ctx.textAlign='left';
    }
  }
  // ピノキオエンティティの描画
  if(pinoObj.alive){
    const _ox=pinoObj.x-G.cam,_oy=pinoObj.y;
    const _flip=pinoObj.facing===-1;
    ctx.save();if(_flip){ctx.translate(_ox+pinoObj.w/2,_oy);ctx.scale(-1,1);ctx.translate(-pinoObj.w/2,0);}else{ctx.translate(_ox,_oy);}
    // ──── キノピオ（Toad）SMB2/SMW準拠スプライト再現 ────
    // パレット: 赤#D82800 / 白#F8F8F8 / 肌#FCE0C0 / 青#0058F8 / 茶#A04000
    // プロポーション: 頭:体≒6:4（頭でっかち）/ 帽子横:縦≒5:3（横長ドーム）
    // ── 帽子（赤いきのこドーム・横長楕円）──
    ctx.fillStyle='#D82800';
    ctx.beginPath();ctx.ellipse(14,12,15,11,0,Math.PI,0);ctx.fill();
    ctx.fillRect(-1,11,30,5);
    // 帽子下部のシェーディング
    ctx.fillStyle='rgba(0,0,0,0.18)';
    ctx.fillRect(-1,14,30,2);
    // 帽子上部のハイライト
    ctx.fillStyle='rgba(255,255,255,0.22)';
    ctx.beginPath();ctx.ellipse(10,5,5,2.5,0,Math.PI,0);ctx.fill();
    // ── 白い斑点5個（中央大1 + 側面中2 + 前面下小2）──
    ctx.fillStyle='#F8F8F8';
    // 中央上の大きい斑点
    ctx.beginPath();ctx.ellipse(14,4,5,4,0,0,Math.PI*2);ctx.fill();
    // 左右の中サイズ斑点
    ctx.beginPath();ctx.arc(4,9,3.5,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(24,9,3.5,0,Math.PI*2);ctx.fill();
    // 前面下の小斑点
    ctx.beginPath();ctx.arc(8,13,2.2,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(20,13,2.2,0,Math.PI*2);ctx.fill();
    // 斑点のソフトシェーディング（立体感）
    ctx.fillStyle='rgba(0,0,0,0.08)';
    ctx.beginPath();ctx.arc(15,5,3,0,Math.PI);ctx.fill();
    // ── 帽子の縁（白い細帯）──
    ctx.fillStyle='#F8F8F8';ctx.fillRect(-1,16,30,2.5);
    // 縁の下影
    ctx.fillStyle='rgba(0,0,0,0.22)';ctx.fillRect(-1,18.5,30,1);
    // ── 顔（ピンク肌の丸顔）──
    ctx.fillStyle='#FCE0C0';
    ctx.beginPath();ctx.ellipse(14,26,11,8,0,0,Math.PI*2);ctx.fill();
    ctx.fillRect(3,20,22,9);
    // 顔下部の薄い影（顎ライン）
    ctx.fillStyle='rgba(0,0,0,0.08)';
    ctx.fillRect(4,30,20,1.5);
    // ── 目（クラシック小ドット・縦長黒2×4px、wide-set）──
    ctx.fillStyle='#000';
    ctx.fillRect(8,23,2.5,4.5);
    ctx.fillRect(17.5,23,2.5,4.5);
    // ── 口（小さな黒い点1つ・SMB2準拠）──
    ctx.fillStyle='#000';
    ctx.beginPath();ctx.arc(14,30.5,0.9,0,Math.PI*2);ctx.fill();
    // ── 胴体（白い体・SMW V字襟青ベスト）──
    // 白い下地（ベストの下から見える首〜お腹）
    ctx.fillStyle='#F8F8F8';
    ctx.fillRect(7,31,14,12);
    // 青いベスト（V字襟付き、両肩から下がるカット）
    ctx.fillStyle='#0058F8';
    ctx.beginPath();
    ctx.moveTo(7,31);
    ctx.lineTo(11,31);
    ctx.lineTo(14,37);
    ctx.lineTo(17,31);
    ctx.lineTo(21,31);
    ctx.lineTo(21,43);
    ctx.lineTo(7,43);
    ctx.closePath();
    ctx.fill();
    // ベスト上部のハイライト
    ctx.fillStyle='rgba(255,255,255,0.20)';
    ctx.fillRect(7,31,14,1.5);
    // ベストの輪郭
    ctx.fillStyle='rgba(0,0,0,0.20)';
    ctx.fillRect(7,42,14,1);
    // 金色のボタン2個（V襟下中央）
    ctx.fillStyle='#FFD700';
    ctx.beginPath();ctx.arc(14,39,1.1,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(14,41.5,1.1,0,Math.PI*2);ctx.fill();
    // ボタンハイライト
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.beginPath();ctx.arc(13.7,38.7,0.4,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.arc(13.7,41.2,0.4,0,Math.PI*2);ctx.fill();
    // ── 腕（肌色・frame別アニメ）──
    const _wf=pinoObj.frame;
    ctx.fillStyle='#FCE0C0';
    if(_wf===0){
      // 通常立ち（両腕下げ）
      ctx.fillRect(0,33,6,8);
      ctx.fillRect(22,33,6,8);
      // 腕の影
      ctx.fillStyle='rgba(0,0,0,0.10)';
      ctx.fillRect(0,40,6,1);ctx.fillRect(22,40,6,1);
    }else{
      // 手を振るポーズ（左腕アップ）
      ctx.fillRect(-2,26,6,8);
      ctx.fillRect(22,33,6,8);
      // 振り効果線
      ctx.strokeStyle='rgba(255,255,255,0.55)';ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(-4,23);ctx.lineTo(-1,20);ctx.stroke();
      ctx.beginPath();ctx.moveTo(2,21);ctx.lineTo(5,18);ctx.stroke();
      ctx.lineWidth=1;
      // 通常側の影
      ctx.fillStyle='rgba(0,0,0,0.10)';
      ctx.fillRect(22,40,6,1);
    }
    // ── 茶色い靴（クラシック準拠・横長楕円）──
    ctx.fillStyle='#A04000';
    ctx.beginPath();ctx.ellipse(8,46,5.5,3,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.ellipse(20,46,5.5,3,0,0,Math.PI*2);ctx.fill();
    // 靴のハイライト（つま先側）
    ctx.fillStyle='rgba(255,200,150,0.4)';
    ctx.fillRect(3.5,44.5,3,1);
    ctx.fillRect(15.5,44.5,3,1);
    // 靴底ライン
    ctx.fillStyle='rgba(0,0,0,0.30)';
    ctx.fillRect(3,47.5,11,0.8);
    ctx.fillRect(15,47.5,11,0.8);
    ctx.restore();
    // ★ 吹き出し（大きめ・読みやすいフォント）
    if(G.pinoSpeechText){
      const _lines=G.pinoSpeechText.split('\n');
      const _bw=Math.max(180,_lines.reduce((mx,l)=>Math.max(mx,l.length*7+20),100));
      const _bh=_lines.length*16+14;
      const _bx=Math.max(4,Math.min(W-3*TILE-_bw-8,pinoObj.x-G.cam-_bw/2+14));
      const _by=Math.max(4,pinoObj.y-_bh-16);
      // 影
      ctx.fillStyle='rgba(0,0,0,0.25)';ctx.fillRect(_bx+3,_by+3,_bw,_bh);
      // 本体
      ctx.fillStyle='rgba(255,255,230,0.97)';ctx.fillRect(_bx,_by,_bw,_bh);
      ctx.strokeStyle='#bb8800';ctx.lineWidth=2;ctx.strokeRect(_bx,_by,_bw,_bh);ctx.lineWidth=1;
      // 吹き出し三角（ピノキオの位置に合わせて）
      const _tx=Math.max(_bx+10,Math.min(_bx+_bw-20,pinoObj.x-G.cam+14));
      ctx.fillStyle='rgba(255,255,230,0.97)';
      ctx.beginPath();ctx.moveTo(_tx,_by+_bh);ctx.lineTo(_tx+8,_by+_bh+12);ctx.lineTo(_tx+16,_by+_bh);ctx.fill();
      ctx.strokeStyle='#bb8800';ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(_tx,_by+_bh-1);ctx.lineTo(_tx+8,_by+_bh+12);ctx.lineTo(_tx+16,_by+_bh-1);ctx.stroke();ctx.lineWidth=1;
      // テキスト
      ctx.fillStyle='#332200';ctx.font='bold 8px "Press Start 2P",monospace';ctx.textAlign='center';
      _lines.forEach((_l,_li)=>ctx.fillText(_l,_bx+_bw/2,_by+13+_li*16));
      ctx.textAlign='left';
    }
  }
  // miniBowser の描画（クッパ Jr. スタイル - 通常クッパと同じデザイン縮小版）
  for(const e of enemies){
    if(!e.alive||e.type!=='miniBowser')continue;
    const _mx=e.x-G.cam,_my=e.y;
    const _hf=e.facing===-1;
    ctx.save();
    if(_hf){ctx.translate(_mx+e.w/2,_my);ctx.scale(-1,1);ctx.translate(-e.w/2,0);}
    else{ctx.translate(_mx,_my);}
    const _flash=e.hurtTimer>0&&Math.floor(G.frame/3)%2===0;
    if(_flash)ctx.globalAlpha=0.35;
    // 甲羅スパイク（通常クッパと同じ三角形スタイル）
    ctx.fillStyle='#7acc7a';
    for(let _s=0;_s<3;_s++){ctx.beginPath();ctx.moveTo(7+_s*12,12);ctx.lineTo(12+_s*12,2);ctx.lineTo(17+_s*12,12);ctx.closePath();ctx.fill();}
    // 甲羅・背中
    ctx.fillStyle=e.hurtTimer>0?'#885500':'#1a6a1a';ctx.fillRect(4,12,40,30);
    // 腹（明るい緑）
    ctx.fillStyle='#3aaa3a';ctx.fillRect(10,22,28,18);
    // 頭（タン色 - 通常クッパと同色）
    ctx.fillStyle='#c8a050';ctx.fillRect(8,0,32,18);
    // 王冠（通常クッパと同じ金色3つ）
    ctx.fillStyle='#FFD700';
    ctx.beginPath();ctx.moveTo(10,0);ctx.lineTo(14,-8);ctx.lineTo(18,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(20,0);ctx.lineTo(24,-12);ctx.lineTo(28,0);ctx.fill();
    ctx.beginPath();ctx.moveTo(30,0);ctx.lineTo(34,-8);ctx.lineTo(38,0);ctx.fill();
    // 目（赤 - 通常クッパと同じ）
    ctx.fillStyle='#cc1100';ctx.fillRect(10,4,10,7);
    ctx.fillStyle='#000';ctx.fillRect(12,5,6,5);
    ctx.fillStyle='#fff';ctx.fillRect(15,5,3,2);
    // 鼻（茶色）
    ctx.fillStyle='#a06820';ctx.fillRect(10,12,28,5);
    ctx.fillStyle='#000';ctx.fillRect(14,13,4,3);ctx.fillRect(26,13,4,3);
    // 腕（緑）
    ctx.fillStyle='#3a8a3a';ctx.fillRect(0,20,8,14);ctx.fillRect(40,22,8,12);
    // 足（歩きアニメ）
    ctx.fillStyle='#1a5a1a';
    const _lf=e.onGround?(G.frame%18<9?-1:1):0;
    ctx.fillRect(8,42,16,12+_lf);ctx.fillRect(24,42,16,12-_lf);
    // 爪（白）
    ctx.fillStyle='#ddd';ctx.fillRect(6,53,6,4);ctx.fillRect(14,53,4,3);ctx.fillRect(26,53,4,3);ctx.fillRect(34,53,6,4);
    ctx.globalAlpha=1;
    // HP バー
    ctx.fillStyle='#333';ctx.fillRect(0,-16,48,8);
    ctx.fillStyle='#e74c3c';ctx.fillRect(1,-15,Math.max(0,Math.ceil(46*(e.hp/3))),6);
    ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(0,-16,48,8);ctx.lineWidth=1;
    ctx.fillStyle='#FFD700';ctx.font='5px "Press Start 2P",monospace';ctx.textAlign='center';
    _fillTextUpright('BOWSER JR',24,-20);ctx.textAlign='left';
    ctx.restore();
  }
}
// === Dark Mode Spotlight ===
if(G.darkMode&&G.state==='play'&&!mario.dead){
const _dmx=mario.x+mario.w/2-G.cam,_dmy=mario.y+mario.h/2;
const _dmR=mario.power==='fire'?180:mario.power==='ice'?170:mario.power==='hammer'?160:G.megaTimer>0?220:130;
// 暗闇は別キャンバスに描き、光源の部分だけ抜いてから重ねる（本体に destination-out すると背景ごと透明になり黒い穴になる）
if(!_darkCv){_darkCv=document.createElement('canvas');_darkCv.width=W;_darkCv.height=H;}
const dc=_darkCv.getContext('2d');dc.globalCompositeOperation='source-over';dc.clearRect(0,0,W,H);
const _dmGrad=dc.createRadialGradient(_dmx,_dmy,0,_dmx,_dmy,_dmR);
_dmGrad.addColorStop(0,'rgba(0,0,0,0)');_dmGrad.addColorStop(0.55,'rgba(0,0,0,0.15)');_dmGrad.addColorStop(0.8,'rgba(0,0,0,0.7)');_dmGrad.addColorStop(1,'rgba(0,0,0,0.94)');
dc.fillStyle=_dmGrad;dc.fillRect(0,0,W,H);
// ファイアボール・アイスボールの周りを明るくする
dc.globalCompositeOperation='destination-out';
for(const b of [...fireballs,...iceBalls]){if(!b.alive)continue;const _bx=b.x+6-G.cam,_by=b.y+6,_r=fireballs.includes(b)?60:45;const _g=dc.createRadialGradient(_bx,_by,0,_bx,_by,_r);_g.addColorStop(0,'rgba(0,0,0,0.85)');_g.addColorStop(1,'rgba(0,0,0,0)');dc.fillStyle=_g;dc.beginPath();dc.arc(_bx,_by,_r,0,Math.PI*2);dc.fill();}
dc.globalCompositeOperation='source-over';
ctx.drawImage(_darkCv,0,0);
}
if(G.waterMode&&G.state==='play'){ctx.fillStyle='rgba(0,40,120,0.12)';ctx.fillRect(0,0,W,H);}
// === Sandstorm Overlay ===
if(G.sandstormMode&&G.state==='play'&&!mario.dead){
const _sandA=0.08+Math.sin(G.frame*0.008)*0.05+Math.max(0,Math.sin(G.frame*0.003))*0.08;
ctx.fillStyle=`rgba(180,140,60,${_sandA})`;ctx.fillRect(0,0,W,H);
ctx.fillStyle='rgba(210,170,80,0.45)';for(let i=0;i<40;i++){const sx=((i*137+G.frame*4)%(W+60))-30;const sy=((i*89+G.frame*1.5+i*i*7)%H);ctx.fillRect(sx,sy,2+i%3,1);}
// 突風エフェクト（周期的に砂煙の帯）
if(Math.sin(G.frame*0.006)>0.7){ctx.fillStyle='rgba(200,160,80,0.12)';for(let gy=0;gy<H;gy+=40){ctx.fillRect(0,gy+Math.sin(G.frame*0.02+gy*0.1)*10,W,8);}}}
// === Tide Overlay ===
if(G.tideMode&&G.tideLevel<H&&G.state==='play'){
ctx.fillStyle='rgba(0,60,180,0.18)';ctx.fillRect(0,G.tideLevel,W,H-G.tideLevel);
ctx.strokeStyle='rgba(100,200,255,0.5)';ctx.lineWidth=2;ctx.beginPath();
for(let wx=0;wx<W;wx+=6){const wy=G.tideLevel+Math.sin((wx+G.cam)*0.04+G.frame*0.06)*3;wx===0?ctx.moveTo(wx,wy):ctx.lineTo(wx,wy);}
ctx.stroke();ctx.lineWidth=1;
// 泡パーティクル
ctx.fillStyle='rgba(150,220,255,0.3)';for(let i=0;i<12;i++){const bx=((i*167+G.frame*0.8)%W);const by=G.tideLevel+5+((i*53+G.frame*0.3)%(H-G.tideLevel-10));ctx.beginPath();ctx.arc(bx,by,1+i%2,0,Math.PI*2);ctx.fill();}}
drawScorePopups();
// Combo HUD
if(G.combo>1&&G.comboTimer>0){const _ca=Math.min(1,G.comboTimer/20);const _cs=Math.min(40,16+G.combo*6);const _cc=G.combo>=5?'#FFD700':G.combo>=3?'#ff4400':'#ff6432';ctx.save();ctx.globalAlpha=_ca;ctx.font=`bold ${_cs}px "Press Start 2P",monospace`;ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillText(`x${G.combo} COMBO!`,W/2+2,62);ctx.fillStyle=_cc;ctx.fillText(`x${G.combo} COMBO!`,W/2,60);if(G.combo>=3){ctx.font='bold 12px "Press Start 2P",monospace';ctx.fillStyle='#fff';ctx.fillText(G.combo>=5?'1UP!!':`${Math.pow(2,G.combo)*100}pts`,W/2,60+_cs-4);}ctx.textAlign='left';ctx.restore()}
// Yoshi eat count & star countdown HUD
if(yoshi.alive&&yoshi.mounted&&yoshi.eatCount>0){ctx.fillStyle='#4CAF50';ctx.font='10px "Press Start 2P",monospace';ctx.fillText(`EAT:${yoshi.eatCount}/10`,10,H-10)}
if(G.starTimer>0&&!mario.dead){const hue2=(G.frame*8)%360;ctx.fillStyle=`hsl(${hue2},100%,55%)`;ctx.font='bold 11px "Press Start 2P",monospace';ctx.fillText(`★${Math.ceil(G.starTimer/60)}s`,yoshi.alive&&yoshi.mounted&&yoshi.eatCount>0?120:10,H-10)}
if(G.megaTimer>0&&!mario.dead){const _megaSec=Math.ceil(G.megaTimer/60);const _megaHue=(G.frame*6)%360;ctx.fillStyle=_megaSec<=5?`hsl(0,100%,${50+Math.sin(G.frame*0.3)*20}%)`:`hsl(${_megaHue},100%,55%)`;ctx.font='bold 13px "Press Start 2P",monospace';ctx.fillText(`MEGA ${_megaSec}s`,10,H-26)}
ctx.restore();
// ミニマップ
if(G.state==='play'&&!G.ugMode){
  const _mmY=2,_mmH=4,_mmW=W-20,_mmX=10;
  ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(_mmX,_mmY,_mmW,_mmH);
  // マリオ位置
  const _mPos=Math.max(0,Math.min(1,mario.x/LW));
  ctx.fillStyle='#e74c3c';ctx.fillRect(_mmX+_mPos*_mmW-2,_mmY,4,_mmH);
  // ゴール位置
  const _gPos=Math.max(0,Math.min(1,flagPole.x/LW));
  ctx.fillStyle='#2ecc71';ctx.fillRect(_mmX+_gPos*_mmW-1,_mmY,3,_mmH);
}
// P-Switch タイマー表示
if(G.pswitchTimer>0&&G.state==='play'){
  const _psPct=G.pswitchTimer/600,_psLow=G.pswitchTimer<180;
  ctx.fillStyle='rgba(0,0,50,0.6)';ctx.fillRect(W/2-102,8,204,14);
  ctx.fillStyle=_psLow?(G.frame%10<5?'#ff4444':'#ff8844'):'#4488ff';
  ctx.fillRect(W/2-100,10,200*_psPct,10);
  ctx.strokeStyle='#aaccff';ctx.lineWidth=1;ctx.strokeRect(W/2-102,8,204,14);
  ctx.fillStyle='#fff';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
  ctx.fillText(`P-SWITCH ${Math.ceil(G.pswitchTimer/60)}s`,W/2,32);ctx.textAlign='left';
}
// 撃破カウンター
if(G.state==='play'&&!mario.dead){
  ctx.fillStyle='rgba(255,255,255,0.6)';ctx.font='7px "Press Start 2P",monospace';ctx.textAlign='right';
  ctx.fillText(`KO:${G.stageKills}`,W-10,H-10);
  // アクティブ効果表示
  let _aeY2=H-26;ctx.font='6px "Press Start 2P",monospace';ctx.textAlign='right';
  if(G.retryHeart>0){ctx.fillStyle='#ff6666';ctx.fillText(`❤️ RETRY x${G.retryHeart}`,W-10,_aeY2);_aeY2-=12;}
  if(G.doubleJump){ctx.fillStyle='#66ccff';ctx.fillText('⬆️ W-JUMP',W-10,_aeY2);_aeY2-=12;}
  if(G.coinMagnet){ctx.fillStyle='#ffcc00';ctx.fillText('🧲 MAGNET',W-10,_aeY2);_aeY2-=12;}
  if(G.heldItem){const _hIcon=G.heldItem==='flower'?'🔥':G.heldItem==='hammer'?'🔨':'🍄';ctx.fillStyle='#66ccff';ctx.fillText(`[C]${_hIcon}`,W-10,_aeY2);_aeY2-=12;}
  ctx.textAlign='left';
}
// BGM音量UI
if(G.bgmMuted){ctx.fillStyle='rgba(255,100,100,0.7)';ctx.font='7px "Press Start 2P",monospace';ctx.fillText('♪ MUTE',W-80,20);}
else if(G.bgmVolume<0.95){ctx.fillStyle='rgba(255,255,255,0.4)';ctx.font='7px "Press Start 2P",monospace';ctx.fillText(`♪ ${Math.round(G.bgmVolume*100)}%`,W-80,20);}
// === SHOP UI ===
if(G.state==='shop'){
ctx.fillStyle='rgba(0,0,0,0.85)';ctx.fillRect(0,0,W,H);
ctx.textAlign='center';
// ステージクリア統計
ctx.fillStyle='#aaa';ctx.font='7px "Press Start 2P",monospace';
const _stCoins=G.stageClearCoins??(G.coins-G.stageCoinsStart);
ctx.fillText(`TIME:${G.timeLeft}  COINS:${_stCoins}  KO:${G.stageKills}  MAX COMBO:${G.stageMaxCombo}`,W/2,20);
ctx.fillStyle='#FFD700';ctx.font='bold 16px "Press Start 2P",monospace';ctx.fillText('COIN SHOP',W/2,46);
ctx.fillStyle='#FFD700';ctx.font='bold 14px "Press Start 2P",monospace';ctx.fillText(`COINS: ${G.coins}`,W/2,70);
// NEXTボタン（タップ/クリックで次のステージへ）
{const r=_SHOP_NEXT;ctx.fillStyle='#1e6b30';ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle='#6f6';ctx.lineWidth=2;ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.lineWidth=1;ctx.fillStyle='#fff';ctx.font='bold 9px "Press Start 2P",monospace';ctx.fillText('NEXT ▶',r.x+r.w/2,r.y+r.h/2+4);}
const _shopItems=[
  {name:'MUSHROOM',cost:50,  key:'mushroom', icon:'🍄', desc:'デカマリオ'},
  {name:'FIRE',    cost:100, key:'fire',     icon:'🔥', desc:'ファイアマリオ'},
  {name:'1UP',     cost:100, key:'1up',      icon:'💚', desc:'残機+1'},
  {name:'ICE',     cost:100, key:'ice',      icon:'❄️', desc:'アイスマリオ'},
  {name:'HAMMER',  cost:190, key:'hammer',   icon:'🔨', desc:'ハンマーマリオ'},
  {name:'RETRY',   cost:200, key:'retryHeart',icon:'❤️',desc:'やられた時復活 重ね可'},
  {name:'STAR 10s',cost:200, key:'star10',   icon:'⭐', desc:'10秒無敵'},
  {name:'1UP x3',  cost:250, key:'1upSet',   icon:'💚x3',desc:'残機+3'},
  {name:'1UP x6',  cost:400, key:'1upSet6',  icon:'💚x6',desc:'残機+6 お得!'},
  {name:'W-JUMP',  cost:600, key:'doubleJump',icon:'⬆️x2',desc:'2段ジャンプ やられるまで'},
  {name:'MAGNET',  cost:650, key:'magnet',    icon:'🧲', desc:'コイン吸引 やられるまで'},
  {name:'STAR 30s',cost:1000,key:'star30',    icon:'🌟', desc:'30秒無敵!'},
  {name:'SET 1300',cost:1300,key:'bundle',    icon:'🎁', desc:'磁石+2段JMP+RETRY'},
];
const _cols=5,_siW=120,_siH=100,_siGap=10,_rowGap=10;
const _siX0=(W-(_siW*_cols+_siGap*(_cols-1)))/2,_siY=86;
_shopItems.forEach((_si,_idx)=>{
  const _row=Math.floor(_idx/_cols),_col=_idx%_cols;
  const _sx=_siX0+_col*(_siW+_siGap),_sy=_siY+_row*(_siH+_rowGap);
  const _sel=G.shopCursor===_idx;
  const _single=_SINGLE_ONLY.has(_si.key);
  const _boughtVal=G.shopBought?.[_si.key]||0;
  const _sold=_single&&_boughtVal;
  const _canBuy=G.coins>=_si.cost&&!_sold;
  ctx.fillStyle=_sel?'rgba(255,200,0,0.15)':'rgba(40,40,60,0.6)';ctx.fillRect(_sx,_sy,_siW,_siH);
  ctx.strokeStyle=_sel?'#FFD700':'#555';ctx.lineWidth=_sel?3:1;ctx.strokeRect(_sx,_sy,_siW,_siH);ctx.lineWidth=1;
  ctx.font='18px monospace';ctx.fillStyle='#fff';ctx.fillText(_si.icon,_sx+_siW/2,_sy+24);
  ctx.font='bold 8px "Press Start 2P",monospace';
  if(_sold){ctx.fillStyle='#4a4';ctx.fillText('SOLD',_sx+_siW/2,_sy+44);}
  else{ctx.fillStyle='#fff';ctx.fillText(_si.name,_sx+_siW/2,_sy+44);if(_boughtVal>0&&!_single){ctx.fillStyle='#2ecc71';ctx.fillText(`x${_boughtVal}`,_sx+_siW-8,_sy+14);}}
  ctx.font='bold 8px "Press Start 2P",monospace';ctx.fillStyle=_canBuy?'#FFD700':'#888';ctx.fillText(`${_si.cost}C`,_sx+_siW/2,_sy+60);
  ctx.font='10px sans-serif';ctx.fillStyle='#ddd';ctx.fillText(_si.desc,_sx+_siW/2,_sy+80);
  if(_sel){ctx.fillStyle='#FFD700';ctx.font='10px monospace';ctx.fillText('▼',_sx+_siW/2,_sy-4);}
});
const _totalRows=Math.ceil(_shopItems.length/_cols);
// アクティブ効果表示（ショップ内）
let _aeShopY=_siY+_totalRows*(_siH+_rowGap)+6;
const _activeEffects=[];
if(G.doubleJump||(G.shopBought?.doubleJump||0)>0)_activeEffects.push('⬆️W-JUMP');
if(G.coinMagnet||(G.shopBought?.magnet||0)>0)_activeEffects.push('🧲MAGNET');
const _totalRetry=(G.retryHeart||0)+(G.shopBought?.retryHeart||0);
if(_totalRetry>0)_activeEffects.push(`❤️RETRY x${_totalRetry}`);
if(G.heldItem){const _hI2=G.heldItem==='flower'?'🔥':G.heldItem==='hammer'?'🔨':'🍄';_activeEffects.push(`HOLD:${_hI2}`);}
if(_activeEffects.length>0){ctx.fillStyle='#66ffaa';ctx.font='7px "Press Start 2P",monospace';ctx.fillText('ACTIVE: '+_activeEffects.join('  '),W/2,_aeShopY);_aeShopY+=14;}
ctx.fillStyle='#aaa';ctx.font='7px "Press Start 2P",monospace';
ctx.fillText(_gpConnected?'A:購入  B:キャンセル  START:次へ':'← → SELECT    SPACE:BUY    ENTER:NEXT    (タップでも購入できます)',W/2,_aeShopY);
// 購入確認ダイアログ
if(G.shopConfirm!=null&&_shopItems[G.shopConfirm]){
  const _ci=_shopItems[G.shopConfirm];
  ctx.fillStyle='rgba(0,0,0,0.7)';ctx.fillRect(0,0,W,H);
  const _bw=_SHOP_DLG.w,_bh=_SHOP_DLG.h,_bx=_SHOP_DLG.x,_by=_SHOP_DLG.y;
  ctx.fillStyle='#1a1a3a';ctx.fillRect(_bx,_by,_bw,_bh);
  ctx.strokeStyle='#FFD700';ctx.lineWidth=3;ctx.strokeRect(_bx,_by,_bw,_bh);ctx.lineWidth=1;
  ctx.fillStyle='#fff';ctx.font='bold 11px "Press Start 2P",monospace';
  ctx.fillText(`${_ci.icon} ${_ci.name}`,W/2,_by+30);
  ctx.fillStyle='#FFD700';ctx.font='9px "Press Start 2P",monospace';
  ctx.fillText(`${_ci.cost} COINS で購入しますか？`,W/2,_by+52);
  for(const [r,label,c1,c2] of [[_SHOP_BUY,'購入する','#1e7a3a','#2ecc71'],[_SHOP_CANCEL,'やめる','#6b1f1f','#e74c3c']]){ctx.fillStyle=c1;ctx.fillRect(r.x,r.y,r.w,r.h);ctx.strokeStyle=c2;ctx.lineWidth=2;ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.lineWidth=1;ctx.fillStyle='#fff';ctx.font='bold 12px sans-serif';ctx.fillText(label,r.x+r.w/2,r.y+r.h/2+5);}
  ctx.fillStyle='#aaa';ctx.font='7px "Press Start 2P",monospace';
  ctx.fillText(_gpConnected?'A : 購入    B : やめる':'SPACE / ENTER : 購入    ESC : やめる',W/2,_by+124);
}
ctx.textAlign='left';
}
if(G.state==='start'){
ctx.fillStyle='rgba(0,0,0,0.78)';ctx.fillRect(0,0,W,H);
ctx.textAlign='center';
ctx.fillStyle='#FFD700';ctx.font='bold 16px "Press Start 2P",monospace';ctx.fillText('SUPER MARIO',W/2,36);
// キャラクター選択（大きめボタン＋ミニスプライト）
{const _cW=120,_cH=52,_cY=42,_cGap=8;
const _cMx=W/2-_cW-_cGap/2,_cLx=W/2+_cGap/2;
const _isMario=G.character!=='luigi',_isLuigi=G.character==='luigi';
// --- MARIOボックス ---
ctx.fillStyle=_isMario?'#7a0000':'#220000';ctx.fillRect(_cMx,_cY,_cW,_cH);
ctx.strokeStyle=_isMario?'#ff4444':'#550000';ctx.lineWidth=_isMario?2:1;ctx.strokeRect(_cMx,_cY,_cW,_cH);ctx.lineWidth=1;
if(_isMario){ctx.fillStyle='rgba(255,200,200,0.08)';ctx.fillRect(_cMx,_cY,_cW,_cH/2);}
// mini Marioスプライト（ゲーム中と同じ描画）
{const mx=_cMx+8,my=_cY+4;
ctx.fillStyle='#E52521';ctx.fillRect(mx+6,my,18,5);ctx.fillRect(mx+2,my+3,24,5);
ctx.fillStyle='#FBD000';ctx.fillRect(mx+4,my+8,20,8);
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+9,5,4);ctx.fillRect(mx+16,my+9,5,4);
ctx.fillStyle='#000';ctx.fillRect(mx+9,my+10,3,3);ctx.fillRect(mx+17,my+10,3,3);
ctx.fillStyle='#6B3410';ctx.fillRect(mx+6,my+14,14,2);
ctx.fillStyle='#0050C8';ctx.fillRect(mx+4,my+16,20,10);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+18,3,3);ctx.fillRect(mx+16,my+18,3,3);
ctx.fillStyle='#FBD000';ctx.fillRect(mx-3,my+16,7,6);ctx.fillRect(mx+24,my+16,7,6);
ctx.fillStyle='#6B3410';ctx.fillRect(mx+2,my+26,12,6);ctx.fillRect(mx+14,my+26,12,6);}
ctx.fillStyle=_isMario?'#fff':'#888';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText('MARIO',_cMx+_cW/2,_cY+_cH-5);
if(_isMario){ctx.fillStyle='#FFD700';ctx.font='bold 8px monospace';ctx.fillText('▶ ノーマル',_cMx+_cW/2,_cY+_cH+10);}
else{ctx.fillStyle='#886000';ctx.font='bold 7px monospace';ctx.fillText('ノーマル',_cMx+_cW/2,_cY+_cH+10);}
// --- LUIGIボックス ---
ctx.fillStyle=_isLuigi?'#0a4a1a':'#031008';ctx.fillRect(_cLx,_cY,_cW,_cH);
ctx.strokeStyle=_isLuigi?'#44ff88':'#155520';ctx.lineWidth=_isLuigi?2:1;ctx.strokeRect(_cLx,_cY,_cW,_cH);ctx.lineWidth=1;
if(_isLuigi){ctx.fillStyle='rgba(100,255,150,0.08)';ctx.fillRect(_cLx,_cY,_cW,_cH/2);}
// mini Luigiスプライト（ゲーム中と同じ描画）
{const mx=_cLx+8,my=_cY+4;
ctx.fillStyle='#27AE60';ctx.fillRect(mx+6,my,18,5);ctx.fillRect(mx+2,my+3,24,5);
ctx.fillStyle='#FBD000';ctx.fillRect(mx+4,my+8,20,8);
ctx.fillStyle='#fff';ctx.fillRect(mx+8,my+9,5,4);ctx.fillRect(mx+16,my+9,5,4);
ctx.fillStyle='#000';ctx.fillRect(mx+9,my+10,3,3);ctx.fillRect(mx+17,my+10,3,3);
ctx.fillStyle='#6B3410';ctx.fillRect(mx+6,my+14,14,2);
ctx.fillStyle='#1a55bb';ctx.fillRect(mx+4,my+16,20,10);
ctx.fillStyle='#FFD700';ctx.fillRect(mx+9,my+18,3,3);ctx.fillRect(mx+16,my+18,3,3);
ctx.fillStyle='#FBD000';ctx.fillRect(mx-3,my+16,7,6);ctx.fillRect(mx+24,my+16,7,6);
ctx.fillStyle='#6B3410';ctx.fillRect(mx+2,my+26,12,6);ctx.fillRect(mx+14,my+26,12,6);}
ctx.fillStyle=_isLuigi?'#fff':'#5a9a5a';ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText('LUIGI',_cLx+_cW/2,_cY+_cH-5);
if(_isLuigi){ctx.fillStyle='#55ff88';ctx.font='bold 8px monospace';ctx.fillText('▶ イージー',_cLx+_cW/2,_cY+_cH+10);}
else{ctx.fillStyle='#2a6a3a';ctx.font='bold 7px monospace';ctx.fillText('イージー',_cLx+_cW/2,_cY+_cH+10);}
ctx.fillStyle='#55cc88';ctx.font='6px monospace';ctx.fillText('※ イージー（LUIGI）はコイン獲得2倍',W/2,_cY+_cH+22);
ctx.fillStyle='#555';ctx.font='5px monospace';ctx.fillText('[R]or[L]キー または クリックで切替',W/2,_cY+_cH+32);}
const _bw=72,_bh=24,_gap=8,_rowH=30,_startY=116;
const _ws2=getWorlds();
_ws2.forEach((_w,_wi)=>{
  const _wSt=getWorldStages(_w);
  const _rowW=_wSt.length*(_bw+_gap)-_gap;
  const _bx0=(W-_rowW)/2;
  const _by=_startY+_wi*_rowH;
  _wSt.forEach((_st,_si)=>{
    const _bx=_bx0+_si*(_bw+_gap);
    const _sel=G.selectedStage===_st.id;
    ctx.fillStyle=_sel?_st.selFg:_st.selBg;ctx.fillRect(_bx,_by,_bw,_bh);
    ctx.strokeStyle=_sel?'#fff':'#444';ctx.lineWidth=_sel?2:1;ctx.strokeRect(_bx,_by,_bw,_bh);
    if(_sel){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(_bx,_by,_bw,_bh/2);}
    const _t=G.stageTimes[_st.id];
    const _labelY=_t!==undefined?_by+_bh/2:_by+_bh/2+4;
    ctx.fillStyle=_sel?'#fff':'#888';ctx.font=`bold ${_sel?9:8}px "Press Start 2P",monospace`;ctx.textAlign='center';
    ctx.fillText(`${_w}-${_st.level}`,_bx+_bw/2,_labelY);
    if(_t!==undefined){ctx.font='5px monospace';ctx.fillStyle='rgba(255,220,50,0.9)';ctx.fillText(Math.floor(_t/60)+':'+String(_t%60).padStart(2,'0'),_bx+_bw/2,_by+_bh-2);}
    if(_sel){ctx.fillStyle='#FFD700';ctx.font='10px monospace';ctx.fillText('▼',_bx+_bw/2,_by+_bh+7);}
    if(G.clearedStages.includes(_st.id)){ctx.fillStyle='#FFD700';ctx.font='7px monospace';ctx.textAlign='right';ctx.fillText('★',_bx+_bw-2,_by+9);ctx.textAlign='center';}
  });
});
// EXステージボタン（EX-1 + EX-2 常時2ボタン表示）
const _exBh=22,_exBy=_startY+_ws2.length*_rowH+4;
{const _exBw2=76,_ex1x=W/2-_exBw2-6,_ex2x=W/2+6;
const _ex1Sel=G.selectedStage===STAGES.length+1,_ex2Sel=G.selectedStage===STAGES.length+2;
// EX-1ボタン（紫）
ctx.fillStyle=_ex1Sel?'#bb00ff':'#8800cc';ctx.fillRect(_ex1x,_exBy,_exBw2,_exBh);
ctx.strokeStyle=_ex1Sel?'#fff':'#cc44ff';ctx.lineWidth=_ex1Sel?2:1;ctx.strokeRect(_ex1x,_exBy,_exBw2,_exBh);ctx.lineWidth=1;
if(_ex1Sel){ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(_ex1x,_exBy,_exBw2,_exBh/2);}
ctx.fillStyle=_ex1Sel?'#fff':'#ff88ff';ctx.font='bold 8px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText('EX-1',_ex1x+_exBw2/2,_exBy+_exBh/2+4);
// EX-2ボタン（宇宙色）
ctx.fillStyle=_ex2Sel?'#1144ff':'#002299';ctx.fillRect(_ex2x,_exBy,_exBw2,_exBh);
ctx.strokeStyle=_ex2Sel?'#88aaff':'#4466cc';ctx.lineWidth=_ex2Sel?2:1;ctx.strokeRect(_ex2x,_exBy,_exBw2,_exBh);ctx.lineWidth=1;
if(_ex2Sel){ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(_ex2x,_exBy,_exBw2,_exBh/2);}
ctx.fillStyle=_ex2Sel?'#fff':'#88aaff';ctx.font='bold 8px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText('EX-2',_ex2x+_exBw2/2,_exBy+_exBh/2+4);
ctx.textAlign='left';}
// 下段: SETTINGS / CONTINUE / SLOT
const _exEnd=_exBy+_exBh;
{const _S=STAGES.length,_tb=_titleBtns(),_sv=getProgress(G.saveSlot);
const _svSt=_sv?getStageById(_sv.nextStageId):null;
const _defs=[
  [_tb.settings,_S+4,'SETTINGS',['#1a3a5a','#2980b9'],'#9cf'],
  [_tb.cont,_S+3,_sv?`▶ CONTINUE  [${_svSt?`W${_svSt.world}-${_svSt.level}`:'?'}]`:'NO SAVE DATA',_sv?['#144a24','#27ae60']:['#1a1a1a','#333'],_sv?'#88dd88':'#555'],
  [_tb.slot,_S+5,`SLOT ${G.saveSlot+1}  ★${G.clearedStages.length}`,['#3a1a4a','#8e44ad'],'#d9f'],
];
for(const [r,id,label,bg,fg] of _defs){const sel=G.selectedStage===id;
  ctx.fillStyle=sel?bg[1]:bg[0];ctx.fillRect(r.x,r.y,r.w,r.h);
  ctx.strokeStyle=sel?'#fff':'#555';ctx.lineWidth=sel?2:1;ctx.strokeRect(r.x,r.y,r.w,r.h);ctx.lineWidth=1;
  if(sel){ctx.fillStyle='rgba(255,255,255,0.12)';ctx.fillRect(r.x,r.y,r.w,r.h/2);}
  ctx.fillStyle=sel?'#fff':fg;ctx.font='bold 7px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillText(label,r.x+r.w/2,r.y+r.h/2+3);
}}
const _hintY=_exEnd+36;
ctx.fillStyle='#aaa';ctx.font='7px "Press Start 2P",monospace';ctx.textAlign='center';
ctx.fillText(`←→↑↓ / 1-${STAGES.length} : SELECT     SPACE / ENTER / CLICK : START`,W/2,_hintY);
ctx.fillStyle='#888';ctx.font='6px "Press Start 2P",monospace';
ctx.fillText(`M : MUTE       +/- : VOLUME       ${mainKey('pause')} : MENU`,W/2,_hintY+13);
ctx.fillStyle='#aaa';ctx.font='7px "Press Start 2P",monospace';
if(_gpConnected){ctx.fillStyle='#4f4';ctx.fillText('🎮 GAMEPAD OK — A:START  ←→↑↓:SELECT',W/2,_hintY+26);}
ctx.textAlign='left';}
if(G.state==='dead')drawOverlay('MISS!',`${G.lives} LEFT\nCLICK or SPACE to CONTINUE`,'#4a1a1a');
if(G.state==='over'){ctx.fillStyle='rgba(0,0,0,0.88)';ctx.fillRect(0,0,W,H);ctx.fillStyle='#ff2222';ctx.font='bold 38px "Press Start 2P",monospace';ctx.textAlign='center';ctx.shadowColor='#ff0000';ctx.shadowBlur=28;ctx.fillText('GAME OVER',W/2,H/2-18);ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='10px "Press Start 2P",monospace';ctx.textAlign='center';ctx.fillText(`SCORE: ${G.score}`,W/2,H/2+18);ctx.fillStyle='#bbb';ctx.fillText('CLICK or SPACE to RESTART',W/2,H/2+48);ctx.textAlign='left';}
if(G.state==='win'){const _curStage=getStage(G.currentWorld,G.currentLevel);const _isFinal=G.currentWorld===8&&G.currentLevel===3;const _isBoss=_curStage?.bgmTheme==='castle';if(_isFinal){ctx.fillStyle='rgba(0,0,0,0.82)';ctx.fillRect(0,0,W,H);const _wh=((G.frame*1.5)%360);if(!G.optReduceFlash){ctx.fillStyle=`hsla(${_wh},100%,55%,0.12)`;ctx.fillRect(0,0,W,H);}ctx.save();ctx.translate(-G.cam,0);drawParticles();ctx.restore();/* 花火（update で生成）は暗幕の上に描く */const _pulse=0.82+0.18*Math.sin(G.frame*0.07);ctx.globalAlpha=_pulse;ctx.fillStyle='#FFD700';ctx.font='bold 24px "Press Start 2P",monospace';ctx.textAlign='center';ctx.shadowColor='#FF8800';ctx.shadowBlur=22;ctx.fillText('CONGRATULATIONS!',W/2,H/2-58);ctx.shadowBlur=0;ctx.globalAlpha=1;ctx.fillStyle='#ff99cc';ctx.font='13px "Press Start 2P",monospace';ctx.fillText('PEACH IS SAVED!',W/2,H/2-18);ctx.fillStyle='#FFD700';ctx.font='11px "Press Start 2P",monospace';ctx.fillText(`SCORE: ${G.score}`,W/2,H/2+16);ctx.fillStyle='#aaddff';ctx.font='8px "Press Start 2P",monospace';ctx.fillText('THANK YOU FOR PLAYING!',W/2,H/2+46);ctx.fillStyle='#888';ctx.fillText('CLICK or SPACE',W/2,H/2+72);ctx.textAlign='left';}else{drawOverlay(_isBoss?'THANK YOU!':'COURSE CLEAR!',_isBoss?`PEACH IS SAVED!\nSCORE: ${G.score}\nCLICK or SPACE`:`SCORE: ${G.score}\nCLICK or SPACE`,'#0a3a0a');}}
if(G.menu)drawMenu();
}
