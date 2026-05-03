import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,rings,
  yoshi,peach,bowser,G,H,TILE,LW,BOWSER_STATS,pinoObj,chests} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildUnderground(variant){
chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
// 共通構造: 床・天井・出口パイプ・右壁
const _isPipe=variant&&variant.indexOf('pipe')===0;
const W=_isPipe?3200:800; // 土管ミニダンジョンは4倍長
// 天井（全variant共通）
for(let x=TILE;x<W-TILE;x+=TILE)platforms.push({x,y:0,w:TILE,h:TILE,type:'ground',bounceOffset:0});
// 床（通常variantのみ全面。土管ミニダンジョンは各variantで穴付き床を設置する）
if(!_isPipe){
  for(let x=0;x<W;x+=TILE)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});
}
// ピノキオ部屋は出口パイプを共通設置しない（報酬クリア後に別途生成）
if(variant!=='pinocchio'&&variant!=='pinocchio_fail'){
  pipes.push({x:W-3*TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
}
// 右壁・左壁（ピノキオ部屋は全高、通常は地上部のみ）
const _isPino=(variant==='pinocchio'||variant==='pinocchio_fail');
const _wallBottom=_isPino?H-TILE:H-4*TILE;
for(let wy=TILE;wy<_wallBottom;wy+=TILE)platforms.push({x:W-TILE,y:wy,w:TILE,h:TILE,type:'ground',bounceOffset:0});
if(_isPino){
  platforms.push({x:0,y:0,w:TILE,h:TILE,type:'ground',bounceOffset:0});
  for(let wy=TILE;wy<H-TILE;wy+=TILE)platforms.push({x:0,y:wy,w:TILE,h:TILE,type:'ground',bounceOffset:0});
}

// ── ヘルパー関数 ──
const gm=(x,y)=>({x,y:y??H-2*TILE,w:TILE,h:TILE,vx:-1.3,vy:0,alive:true,type:'goomba',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
const kp=(x,y)=>({x,y:y??H-2*TILE,w:TILE,h:TILE*1.2,vx:-1.3,vy:0,alive:true,type:'koopa',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
const bz=(x,y)=>({x,y:y??H-2*TILE,w:TILE,h:TILE*0.85,vx:-1.3,vy:0,alive:true,type:'buzzy',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0});
const pg=(x,y)=>({x,y:y??H-2*TILE,w:TILE,h:TILE,vx:-2.0,vy:0,alive:true,type:'penguin',state:'walk',walkFrame:0,walkTimer:0,onGround:false,facing:-1});
const te=(x,y)=>({x,y:y??H-6*TILE,w:28,h:28,vx:-0.5,vy:0.2,alive:true,type:'teresa',hiding:false,activated:true});
const tw=(x,y)=>({x,y:y??TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,type:'thwomp',state:'idle',waitTimer:0});
const hb=(x,y)=>({x,y:y??H-2.5*TILE,w:TILE,h:TILE*1.3,vx:-0.5+Math.random(),vy:0,alive:true,type:'hammerBro',state:'walk',shellTimer:0,walkFrame:0,walkTimer:0,hammerTimer:60+Math.floor(Math.random()*60),jumpTimer:120+Math.floor(Math.random()*80),onGround:false});
const cc=(x)=>({x,y:H-TILE-36,w:36,h:36,postX:x,postY:H-TILE-36,vx:0,vy:0,phase:0,state:'idle',lungeTimer:0,alive:true});
const jb=(x)=>({x,y:H-2*TILE,w:28,h:28,vx:-1.5,vy:0,onGround:true,jumpTimer:60+Math.floor(Math.random()*40),alive:true});
const pp=(x,vy)=>({x,y:H-2*TILE-22,w:22,h:22,vx:-1.8,vy:vy||-6,alive:true,bounceCount:0});
const lf=(x,ph)=>({x,y:H-TILE,w:22,maxH:85,curH:0,phase:ph??0,period:130});
const qM=(x,y)=>({x,y,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
const h1=(x,y)=>({x,y,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
const qC=(x,y,n)=>({x,y,w:TILE,h:TILE,type:'question',hit:false,coinBlock:true,hitsLeft:n||8,bounceOffset:0});
const qH=(x,y)=>({x,y,w:TILE,h:TILE,type:'question',hit:false,hasHammer:true,bounceOffset:0});
const ci=(sx,y,n,sp)=>{for(let i=0;i<n;i++)coinItems.push({x:sx+i*(sp||24),y,collected:false})};
// ランダム隠し1UP（每入室ごとに位置が変わる）
const rh1=()=>{const xs=[200,260,330,390,450],ys=[H-8*TILE,H-9*TILE,H-10*TILE];return h1(xs[Math.floor(Math.random()*xs.length)],ys[Math.floor(Math.random()*ys.length)]);};

// ════════════════════════════════════════
// World 1
// ════════════════════════════════════════

if(variant==='coin'){
// ★ コインの楽園 ★ 1-1: コインざくざくのご褒美部屋
addRow(150,H-4*TILE,3,'brick');addRow(380,H-6*TILE,3,'brick');addRow(560,H-4*TILE,2,'brick');
platforms.push(qM(280,H-5*TILE));
platforms.push(rh1());
platforms.push(qC(510,H-7*TILE,8));
ci(55,H-7*TILE,22,34);ci(55,H-9*TILE,18,40);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(gm(430));enemies.push(gm(500));enemies.push(kp(620));

}else if(variant==='goomba'){
// ★ クリボーの小部屋 ★ 1-2: クリボーが少しいるコイン部屋
addRow(100,H-5*TILE,2,'brick');addRow(300,H-4*TILE,4,'brick');addRow(560,H-6*TILE,2,'brick');
platforms.push(qM(230,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,19,38);ci(60,H-9*TILE,17,42);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(gm(400));enemies.push(gm(480));enemies.push(gm(600));

}else if(variant==='mushroom'){
// ★ ノコノコの甲羅通路 ★ 1-2: ノコノコがうろつくボーナス通路
addRow(120,H-4*TILE,2,'brick');addRow(350,H-5*TILE,2,'brick');addRow(540,H-4*TILE,3,'brick');
platforms.push(qM(260,H-6*TILE));
platforms.push(rh1());
ci(55,H-8*TILE,24,30);ci(80,H-6*TILE,14,35);
enemies.push(bz(150));enemies.push(kp(300));enemies.push(gm(420));enemies.push(gm(500));enemies.push(gm(200));

// ════════════════════════════════════════
// World 1 — ヨッシー秘密部屋
// ════════════════════════════════════════

}else if(variant==='yoshi1'){
// ★ ヨッシーの秘密基地 ★ 1-1: ヨッシーの卵が眠る草原の隠し部屋
addRow(200,H-4*TILE,2,'brick');addRow(400,H-5*TILE,3,'brick');addRow(590,H-4*TILE,2,'brick');
platforms.push({x:464,y:H-6*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
platforms.push(qM(300,H-5*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,18,38);
enemies.push(gm(150));enemies.push(gm(320));enemies.push(gm(440));enemies.push(gm(560));

// ════════════════════════════════════════
// World 2 — 砂漠
// ════════════════════════════════════════

}else if(variant==='desert1'){
// ★ 砂漠の宝箱部屋 ★ 2-1: ジャンプブロックがちょっと邪魔なコイン部屋
addRow(130,H-4*TILE,2,'brick');addRow(310,H-5*TILE,3,'brick');addRow(550,H-4*TILE,2,'brick');
platforms.push(qM(240,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(80,H-9*TILE,14,45);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(gm(430));enemies.push(gm(500));enemies.push(kp(200));
jumpBlocks.push(jb(620));

}else if(variant==='desert2'){
// ★ パイポの洞窟 ★ 2-1: パイポが1匹跳ねてるコイン洞窟
addRow(100,H-5*TILE,3,'brick');addRow(370,H-4*TILE,2,'brick');addRow(540,H-6*TILE,2,'brick');
platforms.push(qM(260,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,26,28);ci(60,H-9*TILE,12,55);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(gm(400));enemies.push(gm(200));
pipos.push(pp(550,-6));

}else if(variant==='desert3'){
// ★ ジャンプブロックの部屋 ★ 2-2: ジャンプブロックが跳ねるコイン部屋
addRow(130,H-4*TILE,2,'brick');addRow(340,H-6*TILE,2,'brick');addRow(530,H-4*TILE,2,'brick');
platforms.push(qM(250,H-5*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(70,H-9*TILE,14,48);
enemies.push(gm(200));enemies.push(gm(400));enemies.push(gm(500));enemies.push(gm(560));
jumpBlocks.push(jb(250));pipos.push(pp(550,-6));

}else if(variant==='desert4'){
// ★ 砂漠のコイン洞窟 ★ 2-2: 小さな火柱がアクセントのコイン部屋
addRow(100,H-4*TILE,2,'brick');addRow(310,H-5*TILE,2,'brick');addRow(510,H-4*TILE,2,'brick');
platforms.push(qM(230,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,19,38);ci(80,H-9*TILE,17,40);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(gm(450));enemies.push(gm(550));enemies.push(kp(200));
lavaFlames.push(lf(420,0));

// ════════════════════════════════════════
// World 2 — ヨッシー秘密部屋
// ════════════════════════════════════════

}else if(variant==='yoshi2'){
// ★ 砂漠のヨッシー巣 ★ 2-1: 砂の奥に眠るヨッシーの卵
addRow(180,H-5*TILE,2,'brick');addRow(380,H-4*TILE,3,'brick');addRow(570,H-5*TILE,2,'brick');
platforms.push({x:432,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
platforms.push(qM(280,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,18,38);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(gm(430));enemies.push(gm(530));
jumpBlocks.push(jb(600));

// ════════════════════════════════════════
// World 3 — 川・森
// ════════════════════════════════════════

}else if(variant==='river1'){
// ★ 川底の秘密部屋 ★ 3-1: 静かな川の下のコイン部屋
addRow(130,H-5*TILE,3,'brick');addRow(390,H-4*TILE,2,'brick');addRow(560,H-6*TILE,2,'brick');
platforms.push(qM(280,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(65,H-9*TILE,18,38);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(kp(420));enemies.push(kp(500));enemies.push(gm(200));

}else if(variant==='river2'){
// ★ 橋の下の宝庫 ★ 3-1: ひっそり隠れた宝の間
addRow(120,H-4*TILE,2,'brick');addRow(310,H-6*TILE,3,'brick');addRow(560,H-5*TILE,2,'brick');
platforms.push(qM(240,H-5*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(70,H-9*TILE,12,55);
enemies.push(gm(150));enemies.push(kp(300));enemies.push(gm(420));enemies.push(gm(500));enemies.push(gm(600));

}else if(variant==='forest1'){
// ★ 森の地下室 ★ 3-2: メットが1匹うろつくコイン部屋
addRow(100,H-4*TILE,2,'brick');addRow(290,H-5*TILE,3,'brick');addRow(530,H-4*TILE,2,'brick');
platforms.push(qM(220,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,14,48);
enemies.push(bz(150));enemies.push(bz(350));enemies.push(gm(470));enemies.push(gm(550));enemies.push(gm(200));

}else if(variant==='forest2'){
// ★ 暗闘の倉庫 ★ 3-2: ノコノコとクリボーのコイン倉庫
addRow(130,H-5*TILE,2,'brick');addRow(350,H-4*TILE,3,'brick');addRow(570,H-6*TILE,2,'brick');
platforms.push(qM(260,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,26,27);ci(80,H-9*TILE,12,52);
enemies.push(gm(150));enemies.push(kp(300));enemies.push(gm(400));enemies.push(gm(480));enemies.push(gm(620));

// ════════════════════════════════════════
// World 3 — ヨッシー秘密部屋
// ════════════════════════════════════════

}else if(variant==='yoshi3'){
// ★ 川辺のヨッシー ★ 3-1: 水の音が聞こえる秘密の部屋
addRow(190,H-4*TILE,2,'brick');addRow(390,H-6*TILE,3,'brick');addRow(580,H-4*TILE,2,'brick');
platforms.push({x:448,y:H-7*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
platforms.push(qM(300,H-5*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,18,38);
enemies.push(gm(150));enemies.push(kp(320));enemies.push(gm(450));enemies.push(gm(570));

// ════════════════════════════════════════
// World 5 — 水辺
// ════════════════════════════════════════

}else if(variant==='water1'){
// ★ 海底の隠れ家 ★ 5-1: コインブロック付きのご褒美部屋
addRow(100,H-4*TILE,3,'brick');addRow(360,H-6*TILE,2,'brick');addRow(540,H-4*TILE,2,'brick');
platforms.push(qM(260,H-5*TILE));
platforms.push(rh1());
platforms.push(qC(400,H-5*TILE,10));
ci(55,H-7*TILE,26,27);ci(60,H-9*TILE,19,36);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(gm(430));enemies.push(gm(500));enemies.push(kp(620));

}else if(variant==='water2'){
// ★ 潮溜まりの宝箱 ★ 5-1: コンパクトな宝箱部屋
addRow(120,H-5*TILE,2,'brick');addRow(330,H-4*TILE,3,'brick');addRow(570,H-6*TILE,2,'brick');
platforms.push(qM(250,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(80,H-9*TILE,14,46);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(kp(420));enemies.push(kp(500));enemies.push(gm(200));

}else if(variant==='water3'){
// ★ 深海のコイン洞窟 ★ 5-2: ノコノコがうろつくコイン洞窟
addRow(130,H-4*TILE,2,'brick');addRow(340,H-5*TILE,3,'brick');addRow(570,H-4*TILE,2,'brick');
platforms.push(qM(260,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,18,38);
enemies.push(gm(150));enemies.push(kp(300));enemies.push(gm(420));enemies.push(gm(500));enemies.push(gm(620));

}else if(variant==='water4'){
// ★ 海底の秘密基地 ★ 5-2: メットがちょっといる海底基地
addRow(100,H-5*TILE,2,'brick');addRow(320,H-4*TILE,2,'brick');addRow(510,H-6*TILE,3,'brick');
platforms.push(qM(230,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,19,38);ci(80,H-9*TILE,17,40);
enemies.push(bz(150));enemies.push(bz(350));enemies.push(gm(450));enemies.push(gm(550));enemies.push(kp(200));

// ════════════════════════════════════════
// World 6 — 氷
// ════════════════════════════════════════

}else if(variant==='ice1'){
// ★ 氷穴のペンギン ★ 6-1: ペンギンがちょっといる氷の洞窟
addRow(120,H-4*TILE,3,'brick');addRow(380,H-5*TILE,2,'brick');addRow(560,H-4*TILE,2,'brick');
platforms.push(qM(280,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(60,H-9*TILE,14,48);
enemies.push(pg(150));enemies.push(pg(350));enemies.push(gm(450));enemies.push(gm(550));enemies.push(pg(200));

}else if(variant==='ice2'){
// ★ ペンギンのコイン部屋 ★ 6-1: ペンギン2匹のコイン部屋
addRow(100,H-5*TILE,2,'brick');addRow(310,H-4*TILE,3,'brick');addRow(560,H-6*TILE,2,'brick');
platforms.push(qM(230,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(80,H-9*TILE,14,46);
enemies.push(pg(150));enemies.push(pg(300));enemies.push(gm(420));enemies.push(pg(520));enemies.push(gm(200));

}else if(variant==='ice3'){
// ★ 凍りついたコイン部屋 ★ 6-2: コインブロック付き氷のご褒美部屋
addRow(130,H-4*TILE,2,'brick');addRow(350,H-6*TILE,3,'brick');addRow(570,H-5*TILE,2,'brick');
platforms.push(qM(260,H-5*TILE));
platforms.push(rh1());
platforms.push(qC(460,H-7*TILE,10));
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,19,36);
enemies.push(pg(150));enemies.push(pg(300));enemies.push(gm(420));enemies.push(gm(530));enemies.push(pg(580));

}else if(variant==='ice4'){
// ★ 氷のコイン倉庫 ★ 6-2: ペンギンとジャンプブロックのコイン倉庫
addRow(100,H-4*TILE,2,'brick');addRow(300,H-5*TILE,2,'brick');addRow(520,H-4*TILE,3,'brick');
platforms.push(qM(220,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(80,H-9*TILE,14,46);
enemies.push(pg(150));enemies.push(pg(350));enemies.push(gm(450));enemies.push(gm(550));enemies.push(pg(200));
jumpBlocks.push(jb(460));

// ════════════════════════════════════════
// World 7 — 砦
// ════════════════════════════════════════

}else if(variant==='fortress1'){
// ★ テレサの部屋 ★ 7-1: テレサが1匹漂うちょっと不気味な部屋
addRow(130,H-5*TILE,3,'brick');addRow(400,H-4*TILE,2,'brick');addRow(580,H-6*TILE,2,'brick');
platforms.push(qM(290,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(70,H-9*TILE,14,46);
enemies.push(gm(150));enemies.push(te(400,H-6*TILE));enemies.push(gm(470));enemies.push(gm(550));enemies.push(gm(200));

}else if(variant==='fortress2'){
// ★ ドッスンの通路 ★ 7-1: ドッスンが1体いるスリルのある通路
// ※ ドッスン x=320〜384 の真下にブロック禁止
addRow(100,H-4*TILE,2,'brick');addRow(420,H-5*TILE,2,'brick');addRow(580,H-4*TILE,2,'brick');
platforms.push(qM(240,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,19,38);ci(80,H-9*TILE,17,40);
enemies.push(gm(150));enemies.push(tw(320));enemies.push(gm(420));enemies.push(gm(500));enemies.push(gm(200));

}else if(variant==='fortress3'){
// ★ 亡霊の回廊 ★ 7-2: テレサとクリボーの回廊
addRow(120,H-4*TILE,2,'brick');addRow(340,H-6*TILE,3,'brick');addRow(570,H-4*TILE,2,'brick');
platforms.push(qM(260,H-5*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(60,H-9*TILE,14,48);
enemies.push(gm(150));enemies.push(te(400,H-5*TILE));enemies.push(gm(300));enemies.push(gm(470));enemies.push(gm(550));

}else if(variant==='fortress4'){
// ★ ハンマーブロスの部屋 ★ 7-2: ハンマーブロスが1匹いるコイン部屋
addRow(100,H-5*TILE,2,'brick');addRow(310,H-4*TILE,2,'brick');addRow(520,H-6*TILE,3,'brick');
platforms.push(qM(230,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(80,H-9*TILE,14,46);
enemies.push(gm(150));enemies.push(hb(400));enemies.push(kp(490));enemies.push(gm(580));

// ════════════════════════════════════════
// World 4 — ヨッシー秘密部屋
// ════════════════════════════════════════

}else if(variant==='yoshi4'){
// ★ 山のヨッシー ★ 4-1: 山頂の秘密洞窟に眠るヨッシー
addRow(200,H-5*TILE,2,'brick');addRow(400,H-4*TILE,2,'brick');addRow(560,H-6*TILE,3,'brick');
platforms.push({x:464,y:H-5*TILE,w:TILE,h:TILE,type:'yoshiEgg',hit:false,bounceOffset:0});
platforms.push(qM(300,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,18,38);
enemies.push(gm(150));enemies.push(bz(340));enemies.push(gm(460));enemies.push(gm(560));

// ════════════════════════════════════════
// World 8 — 飛行船
// ════════════════════════════════════════

}else if(variant==='airship_goal1'){
// ★ 飛行船脱出口 ★ 8-1: コイン回収してゴールパイプへ
for(let i=pipes.length-1;i>=0;i--){if(pipes[i].isExit)pipes.splice(i,1);}
pipes.push({x:600,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isGoalPipe:true});
addRow(150,H-4*TILE,3,'brick');addRow(380,H-5*TILE,2,'brick');
platforms.push(qM(300,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,18,34);ci(80,H-9*TILE,12,48);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(gm(420));enemies.push(gm(480));enemies.push(bz(560));

}else if(variant==='airship_goal2'){
// ★ 飛行船最終出口 ★ 8-2: メットが1匹いるゴール部屋
for(let i=pipes.length-1;i>=0;i--){if(pipes[i].isExit)pipes.splice(i,1);}
pipes.push({x:600,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isGoalPipe:true});
addRow(130,H-5*TILE,2,'brick');addRow(350,H-4*TILE,2,'brick');
platforms.push(qM(250,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,18,34);ci(80,H-9*TILE,12,48);
enemies.push(gm(150));enemies.push(bz(300));enemies.push(gm(420));enemies.push(gm(480));enemies.push(bz(580));

// ════════════════════════════════════════
// 8-3 クッパ最終決戦（変更なし）
// ════════════════════════════════════════

}else if(variant==='bowser_final'){
// ★8-3 クッパ最終決戦★ クッパHP=7 + ピーチ救出
for(let i=pipes.length-1;i>=0;i--){if(pipes[i].isExit)pipes.splice(i,1);}
// ── キノコ(?)ブロック×5個（画面中段に配置）──
platforms.push({x:80, y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:200,y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:320,y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:440,y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:560,y:H-6*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
// ── クッパ周辺の多彩な足場 ──
// 横移動足場（中段・左右）
movingPlats.push({x:120,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:120,range:40,spd:1.2,prevX:120});
movingPlats.push({x:500,y:H-4*TILE,w:TILE*2,h:12,type:'h',ox:500,range:40,spd:1.4,prevX:500});
// 縦移動足場（中央・高低差）
movingPlats.push({x:300,y:H-8*TILE,w:TILE*2,h:12,type:'v',oy:H-8*TILE,range:70,spd:1.5,prevY:H-8*TILE});
// 足場用固定ブロック（クッパが歩ける高台）
addRow(60, H-4*TILE,1,'brick');
addRow(600,H-4*TILE,1,'brick');
// コイン（参加意欲誘う）
for(let i=0;i<10;i++)coinItems.push({x:55+i*60,y:H-9*TILE,collected:false});
G.bowserArenaX=-1;
G.bowserLeftX=TILE*2;
G.bowserRightX=W-TILE*3;
const _bs=BOWSER_STATS[8];Object.assign(bowser,{
  alive:true,x:W-TILE*5,y:H-TILE-72,w:64,h:72,
  hp:_bs.hp,maxHp:_bs.hp,vx:-_bs.speed,vy:0,facing:-1,
  hurtTimer:0,fireTimer:_bs.fireTimer,jumpTimer:_bs.jumpTimer,
  onGround:false,state:'walk',deadTimer:0,fireImmune:_bs.fireImmune,phase:1,phaseTransition:0
});
// ピーチ（クッパ撃破後に自動スポーン）

// ════════════════════════════════════════
// P-Switch パズル部屋
// ════════════════════════════════════════

}else if(variant==='pswitch_bridge'){
// ★ Pスイッチ・ブリッジ ★ コインが足場に変わる橋渡しパズル
// 地面にギャップを作る（x=224〜544）
for(let i=platforms.length-1;i>=0;i--){const pl=platforms[i];if(pl.type==='ground'&&pl.y===H-TILE&&pl.x>=224&&pl.x<544)platforms.splice(i,1);}
// Pスイッチブロック（左の安全地帯に配置）
platforms.push({x:128,y:H-5*TILE,w:TILE,h:TILE,type:'pswitch',hit:false,bounceOffset:0});
// ギャップ上にコイン（Pスイッチで足場化する）
for(let cx=224;cx<544;cx+=TILE)coinItems.push({x:cx,y:H-TILE,collected:false});
// ヒント用のレンガ足場（ギャップ上空に短い足場）
addRow(320,H-5*TILE,3,'brick');
// アイテム
platforms.push(qM(64,H-5*TILE));
platforms.push(rh1());
ci(64,H-8*TILE,6,32);ci(560,H-4*TILE,5,32);
// 軽い敵
enemies.push(bz(155));enemies.push(gm(565));enemies.push(gm(580));enemies.push(kp(200));

}else if(variant==='pswitch_wall'){
// ★ Pスイッチ・ウォール ★ レンガ壁がコインに変わる突破パズル
// レンガ壁（出口パイプの手前を塞ぐ: x=480,512 × 4段）
for(let wy=H-5*TILE;wy<H-TILE;wy+=TILE){addB(480,wy,'brick');addB(512,wy,'brick');}
// Pスイッチブロック（壁の手前に配置）
platforms.push({x:300,y:H-5*TILE,w:TILE,h:TILE,type:'pswitch',hit:false,bounceOffset:0});
// 左側にコイン（Pスイッチで固まるボーナスエリア）
ci(55,H-7*TILE,12,38);ci(55,H-4*TILE,7,45);
// 高い位置にもレンガ（Pスイッチで大量コイン化）
addRow(100,H-6*TILE,4,'brick');addRow(200,H-8*TILE,3,'brick');addRow(380,H-7*TILE,2,'brick');
// アイテム
platforms.push(qM(160,H-5*TILE));
platforms.push(rh1());
// 軽い敵
enemies.push(gm(150));enemies.push(gm(400));enemies.push(bz(555));enemies.push(kp(200));

}else if(variant==='pswitch_maze'){
// ★ Pスイッチ・迷路 ★ レンガ迷路がコインの嵐に変わる！
// レンガ列を縦横に配置（列間に通路を残す）
addRow(160,H-3*TILE,1,'brick');addRow(160,H-4*TILE,1,'brick');addRow(160,H-5*TILE,1,'brick');
addRow(224,H-4*TILE,1,'brick');addRow(224,H-5*TILE,1,'brick');addRow(224,H-6*TILE,1,'brick');
addRow(288,H-3*TILE,1,'brick');addRow(288,H-4*TILE,1,'brick');addRow(288,H-5*TILE,1,'brick');
addRow(352,H-4*TILE,1,'brick');addRow(352,H-5*TILE,1,'brick');addRow(352,H-6*TILE,1,'brick');
addRow(416,H-3*TILE,1,'brick');addRow(416,H-4*TILE,1,'brick');addRow(416,H-5*TILE,1,'brick');
addRow(480,H-4*TILE,1,'brick');addRow(480,H-5*TILE,1,'brick');addRow(480,H-6*TILE,1,'brick');
addRow(544,H-3*TILE,1,'brick');addRow(544,H-4*TILE,1,'brick');
// Pスイッチブロック（左入口）
platforms.push({x:80,y:H-6*TILE,w:TILE,h:TILE,type:'pswitch',hit:false,bounceOffset:0});
// アイテム
platforms.push(qM(80,H-7*TILE));
platforms.push(rh1());
ci(55,H-9*TILE,8,48);ci(600,H-7*TILE,3,32);
// 敵（迷路の先に待ち構える）
enemies.push(gm(150));enemies.push(bz(380));enemies.push(bz(560));enemies.push(gm(200));

}else if(variant==='pswitch_grid'){
// ★ Pスイッチ・グリッド ★ 大量レンガがコインの洪水に！（Pスイッチ2個）
// 横3列 × 縦2段のレンガブロック群
addRow(120,H-6*TILE,5,'brick');addRow(120,H-4*TILE,5,'brick');
addRow(300,H-8*TILE,5,'brick');addRow(300,H-5*TILE,2,'brick');
addRow(470,H-6*TILE,5,'brick');addRow(470,H-4*TILE,5,'brick');
// Pスイッチブロック2個
platforms.push({x:80,y:H-5*TILE,w:TILE,h:TILE,type:'pswitch',hit:false,bounceOffset:0});
platforms.push({x:420,y:H-9*TILE,w:TILE,h:TILE,type:'pswitch',hit:false,bounceOffset:0});
// アイテム
platforms.push(qM(360,H-9*TILE));
platforms.push(rh1());
ci(55,H-9*TILE,6,48);ci(640,H-7*TILE,3,32);
// 敵
enemies.push(gm(150));enemies.push(gm(430));enemies.push(gm(580));enemies.push(kp(220));

// ════════════════════════════════════════════════════════════
// ◆◆◆ 土管ミニダンジョン（全15 variant / W=3200px） ◆◆◆
// ════════════════════════════════════════════════════════════
// 命名: pipeGrass1-4 / pipeDesert1-3 / pipeRiver1 / pipeForest1
//      / pipeWater1-2 / pipeIce1-2 / pipeFort1-2
// 共通ベース: 床（14穴）・壊せるブロック20列・？×2・qC×3・隠し1UP×2・Pスイッチ×1
//           ・浮き足場×14・囲いブロック×3・コイン約185枚（30%減・散布配置）
// ヘルパー:   dB=カロン / ch=チャック / aS=怒り太陽 / ct=サボテン
//           flr=穴付き床 / pB=Pスイッチ / rh1p=4倍長版ランダム1UP
//           mp/mpv=浮き足場(h/v) / box=囲いブロック
// 修正ポイント索引:
//   ヘルパー定義      → L460-473付近
//   共通ベース地形    → L475-543付近
//   variant別の敵配置 → L553以降（各variantごとに「enemies.push のみ」が並ぶ）
// ════════════════════════════════════════════════════════════

}else if(variant&&variant.indexOf('pipe')===0){
// ══════ 土管ミニダンジョン共通ヘルパー ══════
const dB=(x)=>({x,y:H-2*TILE,w:TILE,h:TILE*1.2,vx:-1.2,vy:0,alive:true,type:'dryBones',state:'walk',walkFrame:0,walkTimer:0,onGround:false});
const ch=(x,dir)=>({x,y:H-2*TILE-4,w:TILE,h:TILE*1.4,vx:(dir||-1)*1.5,vy:0,alive:true,type:'chuck',state:'idle',facing:dir||-1,hp:3,walkFrame:0,walkTimer:0,onGround:false,stunTimer:0});
const aS=(x,y)=>({x,y:y??80,w:32,h:32,vx:0,vy:0,type:'angrySun',alive:true,state:'orbit'});
const ct=(x,h)=>({x,y:H-TILE-(h||TILE*4),w:TILE,h:h||TILE*4,vx:-0.6,vy:0,alive:true,type:'cactus',state:'walk',walkFrame:0,walkTimer:0});
// 穴付き床（gaps=[[x始,幅T],...]）。即死の落とし穴
const flr=(gaps)=>{for(let x=0;x<W;x+=TILE){let inG=false;for(const [gx,gw] of gaps)if(x>=gx&&x<gx+gw*TILE){inG=true;break;}if(!inG)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});}};
// Pブロック
const pB=(x,y)=>({x,y,w:TILE,h:TILE,type:'pswitch',hit:false,bounceOffset:0});
// 4倍長用ランダム隠し1UP（土管ミニダンジョン用）
const rh1p=()=>{const xs=[500,900,1400,1900,2400,2800];return h1(xs[Math.floor(Math.random()*xs.length)],H-9*TILE);};
// 浮き足場（水平/垂直）
const mp=(x,y,w,rg,sp)=>({x,y,w:w||TILE*2,h:12,type:'h',ox:x,range:rg||100,spd:sp||1,prevX:x,oy:y,vy:0});
const mpv=(x,y,w,rg,sp)=>({x,y,w:w||TILE*2,h:12,type:'v',ox:x,range:rg||80,spd:sp||1,prevX:x,oy:y,vy:0});
// 囲いブロック「│_底w_│」 底H-4T+両壁H-5Tで敵を閉じ込める
const box=(x,w)=>{addRow(x+TILE,H-4*TILE,w,'brick');addB(x,H-5*TILE,'brick');addB(x+(w+1)*TILE,H-5*TILE,'brick');};

// ══════ 各variantが独自の地形・コイン・敵を構築（多彩構造化）══════
// 共通基盤を廃止し、6人のクリエイター視点で15バリアントを別物に再設計
// 落下足場ヘルパー（一部variantで使用）
const fp=(x,y,w)=>({x,y,w:w||TILE*3,h:12,type:'fall',ox:x,oy:y,vy:0,fallTimer:0,falling:false,prevX:x});

// ──────── pipeGrass1: 縦軸建築家「垂直跳躍チェーン」 ────────
if(variant==='pipeGrass1'){
flr([[300,2],[800,3],[1400,2],[2000,3],[2700,2]]);
addRow(150,H-4*TILE,3,'brick');addRow(450,H-4*TILE,3,'brick');addRow(620,H-6*TILE,3,'brick');
addRow(950,H-6*TILE,4,'brick');addRow(1200,H-4*TILE,3,'brick');addRow(1550,H-6*TILE,3,'brick');
addRow(1750,H-4*TILE,3,'brick');addRow(2200,H-6*TILE,4,'brick');addRow(2400,H-4*TILE,3,'brick');addRow(2850,H-6*TILE,3,'brick');
platforms.push(qM(750,H-7*TILE),qC(1100,H-8*TILE,8),h1(2700,H-9*TILE),pB(1900,H-5*TILE),qH(1500,H-9*TILE));
ci(120,H-9*TILE,28,38);
ci(160,H-3*TILE,4,30);ci(900,H-3*TILE,4,30);ci(1500,H-3*TILE,4,30);ci(2100,H-3*TILE,4,30);ci(2800,H-3*TILE,4,30);
ci(160,H-5*TILE,3,32);ci(460,H-5*TILE,3,32);ci(1210,H-5*TILE,3,32);ci(1760,H-5*TILE,3,32);ci(2410,H-5*TILE,3,32);
ci(630,H-7*TILE,4,32);ci(960,H-7*TILE,5,32);ci(1560,H-7*TILE,4,32);ci(2210,H-7*TILE,5,32);ci(2860,H-7*TILE,4,32);
ci(150,H-8*TILE,3,32);ci(800,H-8*TILE,3,32);ci(1500,H-8*TILE,3,32);ci(2200,H-8*TILE,3,32);
enemies.push(bz(620,H-7*TILE),bz(960,H-7*TILE),bz(1550,H-7*TILE),bz(2200,H-7*TILE),bz(2850,H-7*TILE));
enemies.push(kp(220),kp(1100),kp(1700),kp(2500));
enemies.push(gm(450,H-5*TILE),gm(1200,H-5*TILE),gm(1750,H-5*TILE),gm(2400,H-5*TILE));
}
// ──────── pipeGrass2: 縦軸建築家「浮遊路線」 ────────
else if(variant==='pipeGrass2'){
flr([[200,2],[500,2],[850,3],[1200,2],[1500,3],[1850,2],[2150,3],[2500,2],[2800,2]]);
movingPlats.push(mp(220,H-4*TILE,TILE*2,80,1.3),mp(540,H-4*TILE,TILE*2,80,1.4),
  mpv(900,H-5*TILE,TILE*2,80,1.2),mpv(1240,H-4*TILE,TILE*2,100,1.5),
  mp(1540,H-5*TILE,TILE*2,90,1.3),mp(1880,H-4*TILE,TILE*2,80,1.4),
  mpv(2200,H-5*TILE,TILE*2,100,1.2),mp(2540,H-4*TILE,TILE*2,80,1.3),mp(2840,H-4*TILE,TILE*2,80,1.4));
addRow(700,H-7*TILE,3,'brick');addRow(1300,H-7*TILE,3,'brick');addRow(2300,H-7*TILE,3,'brick');
platforms.push(qC(1300,H-9*TILE,10),qM(2350,H-9*TILE),h1(2950,H-10*TILE),pB(720,H-8*TILE),qH(1500,H-9*TILE));
ci(80,H-9*TILE,26,40);
ci(240,H-5*TILE,3,30);ci(560,H-5*TILE,3,30);ci(920,H-6*TILE,3,30);ci(1260,H-5*TILE,3,30);
ci(1560,H-6*TILE,3,30);ci(1900,H-5*TILE,3,30);ci(2220,H-6*TILE,3,30);ci(2560,H-5*TILE,3,30);ci(2860,H-5*TILE,3,30);
ci(720,H-8*TILE,4,32);ci(1320,H-8*TILE,4,32);ci(2320,H-8*TILE,4,32);
ci(120,H-3*TILE,4,30);ci(620,H-3*TILE,4,30);ci(1300,H-3*TILE,4,30);ci(1980,H-3*TILE,4,30);ci(2620,H-3*TILE,4,30);
enemies.push(bz(720,H-8*TILE),bz(1320,H-8*TILE),bz(2320,H-8*TILE));
enemies.push(kp(150),kp(620),kp(1080),kp(1480),kp(1780),kp(2080),kp(2480),kp(2780));
}
// ──────── pipeGrass3: タイミング「シンクロノトーム」（位相同期） ────────
else if(variant==='pipeGrass3'){
flr([[400,2],[800,2],[1200,2],[1600,2],[2000,2],[2400,2],[2800,2]]);
movingPlats.push(mpv(700,H-4*TILE,TILE*2,120,1.0),mpv(1200,H-5*TILE,TILE*2,100,1.2),
  mpv(1700,H-4*TILE,TILE*2,120,1.0),mpv(2200,H-5*TILE,TILE*2,100,1.2),
  mpv(2700,H-3*TILE,TILE*2,80,1.4));
addRow(150,H-5*TILE,4,'brick');addRow(900,H-5*TILE,4,'brick');addRow(1900,H-5*TILE,4,'brick');addRow(2900,H-5*TILE,3,'brick');
platforms.push(qM(180,H-7*TILE),qC(1380,H-7*TILE,9),qC(2080,H-8*TILE,8),h1(2700,H-9*TILE),pB(1500,H-4*TILE),qH(1600,H-9*TILE));
ci(60,H-9*TILE,26,42);
ci(720,H-7*TILE,4,28);ci(1220,H-8*TILE,4,28);ci(1720,H-7*TILE,4,28);ci(2220,H-8*TILE,4,28);ci(2720,H-6*TILE,4,28);
ci(160,H-6*TILE,4,32);ci(940,H-6*TILE,4,32);ci(1940,H-6*TILE,4,32);ci(2940,H-6*TILE,3,32);
ci(180,H-3*TILE,3,30);ci(580,H-3*TILE,3,30);ci(980,H-3*TILE,3,30);ci(1380,H-3*TILE,3,30);ci(1780,H-3*TILE,3,30);ci(2180,H-3*TILE,3,30);ci(2580,H-3*TILE,3,30);
enemies.push(bz(220),bz(1020),bz(2020),bz(2920));
enemies.push(hb(450),hb(2450));
enemies.push(kp(950,H-6*TILE),kp(1950,H-6*TILE));
}
// ──────── pipeGrass4: タイミング「不規則レールランナー」（高速水平） ────────
else if(variant==='pipeGrass4'){
flr([[350,3],[900,2],[1350,3],[1850,2],[2300,3],[2750,2]]);
movingPlats.push(mp(500,H-5*TILE,TILE*2,200,1.8),mp(1000,H-6*TILE,TILE*2,150,1.5),
  mp(1500,H-4*TILE,TILE*2,180,2.0),mp(2000,H-5*TILE,TILE*2,140,1.6),
  mp(2450,H-3*TILE,TILE*2,120,1.9),mp(2900,H-5*TILE,TILE*2,100,1.4));
addRow(200,H-7*TILE,3,'brick');addRow(700,H-7*TILE,3,'brick');addRow(1100,H-8*TILE,3,'brick');
addRow(1700,H-7*TILE,3,'brick');addRow(2150,H-8*TILE,3,'brick');addRow(2600,H-7*TILE,3,'brick');
platforms.push(qM(220,H-9*TILE),qC(1130,H-9*TILE,9),h1(2630,H-9*TILE),pB(1800,H-6*TILE),qH(1500,H-9*TILE));
ci(80,H-9*TILE,28,38);
ci(220,H-8*TILE,3,32);ci(720,H-8*TILE,3,32);ci(1120,H-9*TILE,3,32);ci(1720,H-8*TILE,3,32);ci(2170,H-9*TILE,3,32);ci(2620,H-8*TILE,3,32);
ci(220,H-3*TILE,3,30);ci(720,H-3*TILE,3,30);ci(1180,H-3*TILE,3,30);ci(1700,H-3*TILE,3,30);ci(2200,H-3*TILE,3,30);ci(2620,H-3*TILE,3,30);
ci(520,H-6*TILE,3,32);ci(1020,H-7*TILE,3,32);ci(1520,H-5*TILE,3,32);ci(2020,H-6*TILE,3,32);ci(2470,H-4*TILE,3,32);
enemies.push(hb(550),hb(2050));
enemies.push(kp(220),kp(700),kp(1100),kp(1700),kp(2150),kp(2600));
enemies.push(bz(220,H-8*TILE),bz(720,H-8*TILE),bz(2620,H-8*TILE));
}
// ──────── pipeDesert1: 謎解き「壁抜けの秘宝」（隠し下層通路） ────────
else if(variant==='pipeDesert1'){
flr([[300,3],[800,4],[1500,5],[2200,2],[2700,2]]);
addRow(280,H-4*TILE,5,'brick');addRow(780,H-4*TILE,6,'brick');addRow(1480,H-4*TILE,7,'brick');
addRow(150,H-6*TILE,3,'brick');addRow(2300,H-5*TILE,3,'brick');addRow(2750,H-5*TILE,3,'brick');
platforms.push(qM(400,H-5*TILE),qC(1200,H-6*TILE,7),h1(840,H-10*TILE),pB(1700,H-5*TILE),qH(1500,H-9*TILE));
ci(80,H-9*TILE,22,42);
ci(310,H-2*TILE,6,28);ci(810,H-2*TILE,8,28);ci(1510,H-2*TILE,10,28);
ci(2350,H-6*TILE,5,30);ci(2810,H-6*TILE,5,30);
ci(160,H-7*TILE,3,32);ci(800,H-7*TILE,4,32);ci(1500,H-7*TILE,5,32);ci(2300,H-6*TILE,3,32);
ci(290,H-5*TILE,3,32);ci(790,H-5*TILE,3,32);ci(1490,H-5*TILE,3,32);
enemies.push(dB(330),dB(820),dB(1530));
enemies.push(gm(280),gm(1080),gm(1900),gm(2300),kp(2400),kp(2800));
}
// ──────── pipeDesert2: 謎解き「太陽神殿」（3部屋＋angrySun） ────────
else if(variant==='pipeDesert2'){
flr([[250,2],[700,3],[1100,2],[1450,3],[1850,2],[2200,3],[2600,2],[2900,2]]);
box(330,3);box(1140,3);box(1900,3);
addRow(550,H-4*TILE,3,'brick');addRow(1300,H-4*TILE,3,'brick');addRow(2050,H-4*TILE,3,'brick');addRow(2680,H-4*TILE,3,'brick');
platforms.push(qM(640,H-6*TILE),qM(1380,H-6*TILE),qC(2120,H-7*TILE,9),h1(2750,H-9*TILE),pB(2700,H-5*TILE),qH(1500,H-9*TILE));
ci(60,H-9*TILE,24,40);
ci(560,H-5*TILE,4,32);ci(1310,H-5*TILE,4,32);ci(2060,H-5*TILE,4,32);ci(2690,H-5*TILE,4,32);
ci(360,H-3*TILE,4,28);ci(1170,H-3*TILE,4,28);ci(1930,H-3*TILE,4,28);
ci(360,H-7*TILE,4,32);ci(1170,H-7*TILE,4,32);ci(1930,H-7*TILE,4,32);
ci(140,H-3*TILE,4,30);ci(870,H-3*TILE,4,30);ci(1620,H-3*TILE,4,30);ci(2350,H-3*TILE,4,30);
enemies.push(aS(380,80),aS(1180,100),aS(1950,80));
enemies.push(gm(550),kp(1300),gm(2080),kp(2700));
enemies.push(dB(620),dB(1380),dB(2150));
}
// ──────── pipeDesert3: 謎解き「カロンの墓所」（多層dB群） ────────
else if(variant==='pipeDesert3'){
flr([[400,2],[800,2],[1200,2],[1600,2],[2000,2],[2400,2],[2800,2]]);
addRow(150,H-5*TILE,4,'brick');addRow(550,H-5*TILE,4,'brick');addRow(950,H-5*TILE,4,'brick');
addRow(1350,H-5*TILE,4,'brick');addRow(1750,H-5*TILE,4,'brick');addRow(2150,H-5*TILE,4,'brick');addRow(2550,H-5*TILE,4,'brick');addRow(2900,H-5*TILE,3,'brick');
addRow(300,H-8*TILE,4,'brick');addRow(1100,H-8*TILE,4,'brick');addRow(1900,H-8*TILE,4,'brick');addRow(2700,H-8*TILE,4,'brick');
platforms.push(qM(600,H-7*TILE),qC(820,H-7*TILE,10),h1(1900,H-10*TILE),pB(1200,H-2*TILE),qH(1500,H-9*TILE));
ci(60,H-9*TILE,24,42);
ci(180,H-6*TILE,4,30);ci(580,H-6*TILE,4,30);ci(980,H-6*TILE,4,30);ci(1380,H-6*TILE,4,30);
ci(1780,H-6*TILE,4,30);ci(2180,H-6*TILE,4,30);ci(2580,H-6*TILE,4,30);
ci(330,H-9*TILE,4,32);ci(1130,H-9*TILE,4,32);ci(1930,H-9*TILE,4,32);ci(2730,H-9*TILE,4,32);
ci(180,H-3*TILE,3,30);ci(680,H-3*TILE,3,30);ci(1280,H-3*TILE,3,30);ci(1880,H-3*TILE,3,30);ci(2480,H-3*TILE,3,30);
enemies.push(dB(220),dB(450),dB(680),dB(950),dB(1280),dB(1580),dB(1880),dB(2180),dB(2480),dB(2820));
enemies.push(ct(1050,TILE*4),ct(2280,TILE*4));
}
// ──────── pipeRiver1: 戦闘「甲羅ボウリング廊下」（kp連鎖） ────────
else if(variant==='pipeRiver1'){
flr([[2950,2]]);
addRow(150,H-3*TILE,2,'brick');addRow(2700,H-3*TILE,2,'brick');
addRow(500,H-4*TILE,3,'brick');addRow(1100,H-4*TILE,3,'brick');addRow(1700,H-4*TILE,3,'brick');addRow(2300,H-4*TILE,3,'brick');
addRow(800,H-6*TILE,3,'brick');addRow(1400,H-6*TILE,3,'brick');addRow(2000,H-6*TILE,3,'brick');addRow(2600,H-6*TILE,3,'brick');
platforms.push(qM(900,H-7*TILE),qC(1500,H-7*TILE,10),h1(2100,H-9*TILE),pB(2400,H-7*TILE),qH(1900,H-9*TILE));
ci(80,H-9*TILE,26,42);
ci(360,H-2*TILE,8,28);ci(900,H-2*TILE,8,28);ci(1500,H-2*TILE,8,28);ci(2100,H-2*TILE,8,28);
ci(820,H-7*TILE,4,32);ci(1420,H-7*TILE,4,32);ci(2020,H-7*TILE,4,32);ci(2620,H-7*TILE,4,32);
ci(520,H-5*TILE,3,32);ci(1120,H-5*TILE,3,32);ci(1720,H-5*TILE,3,32);ci(2320,H-5*TILE,3,32);
enemies.push(kp(360),kp(450),kp(560),kp(680),kp(900),kp(1100),kp(1300),kp(1550),kp(1850),kp(2150),kp(2400),kp(2650));
enemies.push(gm(530,H-5*TILE),gm(1130,H-5*TILE),gm(1730,H-5*TILE),gm(2330,H-5*TILE));
}
// ──────── pipeForest1: 戦闘「ハンマーブロス決闘場」（hb 3アリーナ） ────────
else if(variant==='pipeForest1'){
flr([[700,2],[1200,2],[1900,3],[2400,2]]);
addRow(550,H-4*TILE,2,'brick');addRow(550,H-7*TILE,4,'brick');
addRow(1300,H-5*TILE,3,'brick');addRow(1500,H-7*TILE,3,'brick');addRow(1700,H-5*TILE,3,'brick');
addRow(2100,H-4*TILE,3,'brick');addRow(2200,H-7*TILE,4,'brick');addRow(2600,H-4*TILE,3,'brick');
platforms.push(qM(580,H-8*TILE),qC(1530,H-8*TILE,8),h1(2230,H-9*TILE),pB(1400,H-6*TILE),qH(1900,H-9*TILE));
ci(80,H-9*TILE,24,42);
ci(220,H-3*TILE,5,30);ci(900,H-3*TILE,5,30);ci(1330,H-6*TILE,4,32);ci(1530,H-8*TILE,4,32);
ci(1730,H-6*TILE,4,32);ci(2230,H-8*TILE,5,32);ci(2700,H-3*TILE,5,30);
ci(560,H-5*TILE,4,32);ci(560,H-8*TILE,4,32);ci(2110,H-5*TILE,4,32);ci(2610,H-5*TILE,4,32);
enemies.push(hb(800),hb(2200),hb(2700));
enemies.push(gm(220),kp(450),gm(1300),kp(1700),gm(2100),kp(2500));
enemies.push(bz(580,H-8*TILE),bz(1530,H-8*TILE),bz(2230,H-8*TILE));
}
// ──────── pipeWater1: ハザード「沈む足場の連鎖」（fall足場） ────────
else if(variant==='pipeWater1'){
flr([[200,3],[600,3],[1000,3],[1400,3],[1800,3],[2200,3],[2600,3]]);
movingPlats.push(fp(200,H-4*TILE),fp(600,H-4*TILE),fp(1000,H-4*TILE),fp(1400,H-4*TILE));
movingPlats.push(mp(1820,H-4*TILE,TILE*3,80,1.4),mp(2220,H-4*TILE,TILE*3,80,1.5),mp(2620,H-4*TILE,TILE*3,80,1.6));
addRow(150,H-7*TILE,3,'brick');addRow(900,H-7*TILE,3,'brick');addRow(1700,H-7*TILE,3,'brick');addRow(2500,H-7*TILE,3,'brick');
platforms.push(qM(170,H-9*TILE),qC(1750,H-8*TILE,8),h1(2920,H-9*TILE),pB(2900,H-3*TILE),qH(1500,H-9*TILE));
ci(80,H-9*TILE,26,42);
ci(220,H-5*TILE,4,28);ci(620,H-5*TILE,4,28);ci(1020,H-5*TILE,4,28);ci(1420,H-5*TILE,4,28);
ci(1820,H-5*TILE,4,28);ci(2220,H-5*TILE,4,28);ci(2620,H-5*TILE,4,28);
ci(170,H-8*TILE,3,30);ci(920,H-8*TILE,3,30);ci(1720,H-8*TILE,3,30);ci(2520,H-8*TILE,3,30);
ci(180,H-3*TILE,3,30);ci(580,H-3*TILE,3,30);ci(980,H-3*TILE,3,30);ci(1380,H-3*TILE,3,30);ci(1780,H-3*TILE,3,30);ci(2580,H-3*TILE,3,30);
enemies.push(ct(950,TILE*2),ct(1950,TILE*2),ct(2750,TILE*2));
enemies.push(bz(170,H-8*TILE),bz(920,H-8*TILE),bz(1720,H-8*TILE),bz(2520,H-8*TILE));
enemies.push(kp(450),kp(1450),kp(2450));
}
// ──────── pipeWater2: ハザード「高所狭棚＆巨大穴」 ────────
else if(variant==='pipeWater2'){
flr([[200,4],[700,5],[1300,4],[1900,5],[2500,3]]);
addRow(180,H-7*TILE,2,'brick');addRow(360,H-6*TILE,2,'brick');addRow(540,H-7*TILE,2,'brick');
addRow(700,H-6*TILE,2,'brick');addRow(900,H-7*TILE,2,'brick');addRow(1100,H-6*TILE,2,'brick');
addRow(1300,H-7*TILE,2,'brick');addRow(1500,H-6*TILE,2,'brick');addRow(1700,H-7*TILE,2,'brick');
addRow(1900,H-6*TILE,2,'brick');addRow(2100,H-7*TILE,2,'brick');addRow(2300,H-6*TILE,2,'brick');
addRow(2500,H-7*TILE,2,'brick');addRow(2700,H-6*TILE,2,'brick');addRow(2900,H-7*TILE,2,'brick');
platforms.push(qM(560,H-9*TILE),qC(1530,H-9*TILE,8),h1(2710,H-9*TILE),pB(180,H-9*TILE),qH(1700,H-9*TILE));
ci(60,H-9*TILE,24,40);
ci(190,H-8*TILE,3,28);ci(370,H-7*TILE,3,28);ci(550,H-8*TILE,3,28);ci(710,H-7*TILE,3,28);
ci(910,H-8*TILE,3,28);ci(1110,H-7*TILE,3,28);ci(1310,H-8*TILE,3,28);ci(1510,H-7*TILE,3,28);
ci(1710,H-8*TILE,3,28);ci(1910,H-7*TILE,3,28);ci(2110,H-8*TILE,3,28);ci(2310,H-7*TILE,3,28);
ci(2510,H-8*TILE,3,28);ci(2710,H-7*TILE,3,28);ci(2910,H-8*TILE,3,28);
enemies.push(ct(180,TILE*4),ct(900,TILE*4),ct(1500,TILE*4),ct(2100,TILE*4),ct(2700,TILE*4));
enemies.push(kp(370,H-7*TILE),kp(710,H-7*TILE),kp(1110,H-7*TILE),kp(1510,H-7*TILE),kp(1910,H-7*TILE),kp(2310,H-7*TILE));
}
// ──────── pipeIce1: ハザード「滑る大穴」（高速mp/mpv） ────────
else if(variant==='pipeIce1'){
flr([[300,2],[700,3],[1200,2],[1700,3],[2300,2],[2800,2]]);
movingPlats.push(mp(280,H-4*TILE,TILE*2,100,2.4),mp(680,H-4*TILE,TILE*2,120,2.5),mp(1180,H-4*TILE,TILE*2,100,2.6),
  mp(1680,H-4*TILE,TILE*2,140,2.4),mp(2280,H-4*TILE,TILE*2,100,2.5),mp(2780,H-4*TILE,TILE*2,80,2.0));
movingPlats.push(mpv(450,H-5*TILE,TILE*2,80,2.0),mpv(950,H-5*TILE,TILE*2,90,2.2),mpv(1450,H-5*TILE,TILE*2,80,2.0),
  mpv(2050,H-5*TILE,TILE*2,90,2.2),mpv(2550,H-5*TILE,TILE*2,80,2.0));
addRow(150,H-7*TILE,3,'brick');addRow(1500,H-7*TILE,3,'brick');addRow(2900,H-7*TILE,3,'brick');
platforms.push(qM(170,H-9*TILE),qC(1530,H-9*TILE,8),h1(2920,H-9*TILE),pB(900,H-7*TILE),qH(1700,H-9*TILE));
ci(80,H-9*TILE,26,42);
ci(180,H-8*TILE,3,30);ci(1530,H-8*TILE,3,30);ci(2930,H-8*TILE,3,30);
ci(310,H-3*TILE,3,28);ci(720,H-3*TILE,3,28);ci(1220,H-3*TILE,3,28);ci(1720,H-3*TILE,3,28);ci(2320,H-3*TILE,3,28);ci(2820,H-3*TILE,3,28);
ci(460,H-7*TILE,3,30);ci(960,H-7*TILE,3,30);ci(2060,H-7*TILE,3,30);ci(2560,H-7*TILE,3,30);
ci(150,H-5*TILE,3,32);ci(1500,H-5*TILE,3,32);ci(2900,H-5*TILE,3,32);
enemies.push(pg(150),pg(550),pg(1100),pg(1550),pg(2150),pg(2650));
enemies.push(kp(220),kp(1300),kp(2400));
}
// ──────── pipeIce2: ハザード「動く足場ラッシュ」（mpv大量） ────────
else if(variant==='pipeIce2'){
flr([[200,3],[700,3],[1200,3],[1700,3],[2200,3],[2700,3]]);
movingPlats.push(mpv(220,H-3*TILE,TILE*2,80,2.5),mpv(420,H-4*TILE,TILE*2,90,2.8),
  mpv(720,H-3*TILE,TILE*2,80,2.5),mpv(920,H-4*TILE,TILE*2,90,2.8),
  mpv(1220,H-3*TILE,TILE*2,80,2.5),mpv(1420,H-4*TILE,TILE*2,90,2.8),
  mpv(1720,H-3*TILE,TILE*2,80,2.5),mpv(1920,H-4*TILE,TILE*2,90,2.8),
  mpv(2220,H-3*TILE,TILE*2,80,2.5),mpv(2420,H-4*TILE,TILE*2,90,2.8),
  mpv(2720,H-3*TILE,TILE*2,80,2.5),mpv(2920,H-4*TILE,TILE*2,90,2.8));
addRow(150,H-7*TILE,3,'brick');addRow(1500,H-7*TILE,3,'brick');addRow(2900,H-7*TILE,3,'brick');
platforms.push(qM(170,H-9*TILE),qC(1530,H-9*TILE,8),h1(2920,H-9*TILE),pB(450,H-7*TILE),qH(1700,H-9*TILE));
ci(80,H-9*TILE,24,42);
ci(440,H-6*TILE,3,28);ci(940,H-6*TILE,3,28);ci(1440,H-6*TILE,3,28);ci(1940,H-6*TILE,3,28);ci(2440,H-6*TILE,3,28);
ci(180,H-8*TILE,3,30);ci(1530,H-8*TILE,3,30);ci(2930,H-8*TILE,3,30);
ci(540,H-8*TILE,4,30);ci(1540,H-8*TILE,4,30);ci(2540,H-8*TILE,4,30);
ci(150,H-5*TILE,3,32);ci(1500,H-5*TILE,3,32);ci(2900,H-5*TILE,3,32);
ci(150,H-3*TILE,3,30);ci(1480,H-3*TILE,3,30);ci(2880,H-3*TILE,3,30);
enemies.push(pg(550,H-5*TILE),pg(1050,H-5*TILE),pg(1550,H-5*TILE),pg(2050,H-5*TILE),pg(2550,H-5*TILE));
enemies.push(dB(380),dB(880),dB(1380),dB(1880),dB(2380),dB(2880));
}
// ──────── pipeFort1: アクロバ「ドッスン回廊」（バネ＋tw＋火柱） ────────
else if(variant==='pipeFort1'){
flr([[400,2],[1100,3],[1900,2],[2600,2]]);
springs.push({x:280,y:H-TILE-24,w:24,h:24,compressed:0});
springs.push({x:870,y:H-TILE-24,w:24,h:24,compressed:0});
springs.push({x:1020,y:H-TILE-24,w:24,h:24,compressed:0});
springs.push({x:1950,y:H-TILE-24,w:24,h:24,compressed:0});
springs.push({x:2100,y:H-TILE-24,w:24,h:24,compressed:0});
springs.push({x:2250,y:H-TILE-24,w:24,h:24,compressed:0});
addRow(150,H-7*TILE,3,'brick');addRow(1300,H-7*TILE,3,'brick');addRow(2400,H-7*TILE,3,'brick');
addRow(700,H-4*TILE,3,'brick');addRow(1500,H-4*TILE,3,'brick');addRow(2700,H-4*TILE,3,'brick');
enemies.push(tw(550),tw(1700),tw(2900));
lavaFlames.push({x:950,y:H-TILE,w:22,maxH:90,curH:0,phase:0,period:120});
lavaFlames.push({x:2080,y:H-TILE,w:22,maxH:90,curH:0,phase:60,period:120});
platforms.push(qM(170,H-9*TILE),qC(1320,H-9*TILE,8),h1(2420,H-9*TILE),pB(720,H-6*TILE),qH(1500,H-9*TILE));
ci(80,H-9*TILE,26,42);
ci(170,H-8*TILE,3,30);ci(1320,H-8*TILE,3,30);ci(2420,H-8*TILE,3,30);
ci(720,H-5*TILE,3,30);ci(1520,H-5*TILE,3,30);ci(2720,H-5*TILE,3,30);
ci(280,H-5*TILE,3,28);ci(880,H-5*TILE,3,28);ci(1980,H-5*TILE,3,28);
ci(180,H-3*TILE,3,30);ci(820,H-3*TILE,3,30);ci(1320,H-3*TILE,3,30);ci(2080,H-3*TILE,3,30);ci(2780,H-3*TILE,3,30);
enemies.push(hb(450),hb(1850),hb(2500));
enemies.push(bz(220),bz(1450),bz(2350));
}
// ──────── pipeFort2: アクロバ「キャノン火柱シンフォニー」 ────────
else if(variant==='pipeFort2'){
flr([[300,2],[800,2],[1500,3],[2100,2],[2700,2]]);
cannons.push({x:640,y:H-3*TILE,w:TILE,h:TILE*2,fireRate:180,timer:30});
cannons.push({x:1600,y:H-3*TILE,w:TILE,h:TILE*2,fireRate:180,timer:80});
cannons.push({x:2360,y:H-3*TILE,w:TILE,h:TILE*2,fireRate:180,timer:120});
lavaFlames.push({x:1060,y:H-TILE,w:22,maxH:100,curH:0,phase:30,period:110});
lavaFlames.push({x:2060,y:H-TILE,w:22,maxH:100,curH:0,phase:60,period:110});
jumpBlocks.push(jb(420),jb(1280),jb(2200));
springs.push({x:200,y:H-TILE-24,w:24,h:24,compressed:0});
springs.push({x:1200,y:H-TILE-24,w:24,h:24,compressed:0});
addRow(150,H-6*TILE,3,'brick');addRow(900,H-6*TILE,3,'brick');addRow(1700,H-6*TILE,3,'brick');addRow(2400,H-6*TILE,3,'brick');
addRow(450,H-8*TILE,3,'brick');addRow(1300,H-8*TILE,3,'brick');addRow(2200,H-8*TILE,3,'brick');
platforms.push(qM(170,H-7*TILE),qC(920,H-7*TILE,8),h1(2420,H-7*TILE),pB(1730,H-7*TILE),qH(1500,H-9*TILE));
ci(80,H-9*TILE,24,40);
ci(170,H-7*TILE,3,30);ci(920,H-7*TILE,3,30);ci(1720,H-7*TILE,3,30);ci(2420,H-7*TILE,3,30);
ci(470,H-9*TILE,3,30);ci(1320,H-9*TILE,3,30);ci(2220,H-9*TILE,3,30);
ci(150,H-5*TILE,3,32);ci(900,H-5*TILE,3,32);ci(1700,H-5*TILE,3,32);ci(2400,H-5*TILE,3,32);
ci(140,H-3*TILE,3,30);ci(840,H-3*TILE,3,30);ci(1640,H-3*TILE,3,30);ci(2340,H-3*TILE,3,30);
enemies.push(tw(380),tw(2520));
enemies.push(dB(550),dB(1150),dB(1850),dB(2750));
enemies.push(bz(220),bz(1100),bz(1900),bz(2650));
}

}else if(variant==='pinocchio'||variant==='pinocchio_fail'){
// ★ ピノキオの部屋 ★ 空テーマの選択部屋
G.pinoRoom=true;
// キノコ？ブロック1個だけ（浮き足場はなし）
platforms.push({x:384,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
if(variant==='pinocchio_fail'){
  // 失敗状態：出口パイプのみ、キノピオが一言
  // 防御的リセット（前回の状態が残っていても安全に）
  G.chestOpened=false;G.pinoReward=-1;G.pinoNeed=0;G.pinoFlagReady=false;G.pinoFlagDelay=0;
  pipes.push({x:704,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
  pinoObj.alive=true;pinoObj.x=660;pinoObj.y=H-TILE-pinoObj.h;pinoObj.vx=0;pinoObj.vy=0;pinoObj.facing=-1;pinoObj.frame=0;pinoObj.frameTimer=0;
  G.pinoState='exfail';
  G.pinoSpeechText='チャレンジは1度だけ！\n次は自分で頑張りなさい！';
  G.pinoSpeechTimer=400;
}else{
  // 通常状態：宝箱5個 + ピノキオ
  chests.length=0;
  const _cxs=[130,360,590];
  for(let _i=0;_i<3;_i++){
    platforms.push({x:_cxs[_i],y:H-2*TILE-10,w:TILE+4,h:TILE+10,type:'chest',bounceOffset:0,opened:false,chestIdx:_i});
  }
  pinoObj.alive=true;pinoObj.x=660;pinoObj.y=H-TILE-pinoObj.h;pinoObj.vx=0;pinoObj.vy=0;pinoObj.facing=-1;pinoObj.frame=0;pinoObj.frameTimer=0;
  G.pinoState='idle';G.pinoReward=-1;G.pinoNeed=0;G.chestOpened=false;G.exStageFailed=false;
  G.pinoSpeechText='好きな宝箱を１個選んで！\nいいものも悪いものもあるよ…';G.pinoSpeechTimer=400;
}
}else{
// ★ デフォルト ★ coin と同じレイアウト
addRow(150,H-4*TILE,3,'brick');addRow(380,H-6*TILE,3,'brick');addRow(560,H-4*TILE,2,'brick');
platforms.push(qM(280,H-5*TILE));
platforms.push(rh1());
platforms.push(qC(510,H-7*TILE,8));
ci(55,H-7*TILE,22,34);ci(55,H-9*TILE,18,40);
enemies.push(gm(150));enemies.push(gm(300));enemies.push(gm(430));enemies.push(gm(500));
}}
