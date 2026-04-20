import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,rings,
  yoshi,peach,bowser,G,H,TILE,LW,BOWSER_STATS,pinoObj,chests} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildUnderground(variant){
chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
// 共通構造: 床・天井・出口パイプ・右壁
const _isFall=variant&&variant.indexOf('fall')===0;
const W=_isFall?3200:800; // 落下ミニダンジョンは4倍長
// 天井（全variant共通）
for(let x=TILE;x<W-TILE;x+=TILE)platforms.push({x,y:0,w:TILE,h:TILE,type:'ground',bounceOffset:0});
// 床（通常variantのみ全面。fallは各variantで穴付き床を設置する）
if(!_isFall){
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

// ════════════════════════════════════════
// 落下ボーナス（15 variant）: 横長の超短縮ボーナス部屋
// 共通: 壊せるブロック多数＋？×2＋隠し1UP＋大量コイン＋特色敵
// ════════════════════════════════════════

}else if(variant&&variant.indexOf('fall')===0){
// ══════ ミニダンジョン共通ヘルパー ══════
const dB=(x)=>({x,y:H-2*TILE,w:TILE,h:TILE*1.2,vx:-1.2,vy:0,alive:true,type:'dryBones',state:'walk',walkFrame:0,walkTimer:0,onGround:false});
const ch=(x,dir)=>({x,y:H-2*TILE-4,w:TILE,h:TILE*1.4,vx:(dir||-1)*1.5,vy:0,alive:true,type:'chuck',state:'idle',facing:dir||-1,hp:3,walkFrame:0,walkTimer:0,onGround:false,stunTimer:0});
const aS=(x,y)=>({x,y:y??80,w:32,h:32,vx:0,vy:0,type:'angrySun',alive:true,state:'orbit'});
const ct=(x,h)=>({x,y:H-TILE-(h||TILE*4),w:TILE,h:h||TILE*4,vx:-0.6,vy:0,alive:true,type:'cactus',state:'walk',walkFrame:0,walkTimer:0});
// 穴付き床（gaps=[[x始,幅T],...]）。即死の落とし穴
const flr=(gaps)=>{for(let x=0;x<W;x+=TILE){let inG=false;for(const [gx,gw] of gaps)if(x>=gx&&x<gx+gw*TILE){inG=true;break;}if(!inG)platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});}};
// Pブロック
const pB=(x,y)=>({x,y,w:TILE,h:TILE,type:'pswitch',hit:false,bounceOffset:0});
// 4倍長用ランダム隠し1UP
const rh1f=()=>{const xs=[500,900,1400,1900,2400,2800];return h1(xs[Math.floor(Math.random()*xs.length)],H-9*TILE);};
// 浮き足場（水平/垂直）
const mp=(x,y,w,rg,sp)=>({x,y,w:w||TILE*2,h:12,type:'h',ox:x,range:rg||100,spd:sp||1,prevX:x,oy:y,vy:0});
const mpv=(x,y,w,rg,sp)=>({x,y,w:w||TILE*2,h:12,type:'v',ox:x,range:rg||80,spd:sp||1,prevX:x,oy:y,vy:0});

// ══════ 共通ベース地形（全面再設計・落とし穴11／qM2／Pスイッチ1／1UP2）══════
// 落とし穴11箇所（2T/3T幅、各穴の上に浮き足場1個）
flr([[300,2],[580,2],[900,3],[1180,2],[1400,2],[1620,3],[1900,2],[2120,2],[2380,3],[2700,2],[2900,2]]);
// 壊せるブロック列（20列・敵の足場・ブロック上に敵多数）
// 低段(H-4T) 11列（落とし穴の間）
addRow(400,H-4*TILE,3,'brick');
addRow(700,H-4*TILE,3,'brick');
addRow(1020,H-4*TILE,3,'brick');
addRow(1280,H-4*TILE,3,'brick');
addRow(1500,H-4*TILE,3,'brick');
addRow(1750,H-4*TILE,3,'brick');
addRow(2000,H-4*TILE,4,'brick');
addRow(2220,H-4*TILE,3,'brick');
addRow(2500,H-4*TILE,3,'brick');
addRow(2800,H-4*TILE,2,'brick');
addRow(3000,H-4*TILE,2,'brick');
// 中段(H-5T) 6列
addRow(500,H-5*TILE,2,'brick');
addRow(850,H-5*TILE,2,'brick');
addRow(1350,H-5*TILE,3,'brick');
addRow(1800,H-5*TILE,3,'brick');
addRow(2300,H-5*TILE,2,'brick');
addRow(2600,H-5*TILE,2,'brick');
// 高段(H-6T) 3列
addRow(650,H-6*TILE,3,'brick');
addRow(1550,H-6*TILE,3,'brick');
addRow(2450,H-6*TILE,3,'brick');
// ？ブロック（キノコ）2個だけ
platforms.push(qM(1100,H-7*TILE));
platforms.push(qM(2160,H-7*TILE));
// 連打コインブロック qC×3（コイン多めのため維持）
platforms.push(qC(820,H-7*TILE,12));
platforms.push(qC(1680,H-8*TILE,12));
platforms.push(qC(2560,H-7*TILE,12));
// 隠し1UPブロック×2（ランダム位置・重複防止）
{const _1ups=[[450,H-8*TILE],[770,H-9*TILE],[1070,H-8*TILE],[1800,H-9*TILE],[2250,H-8*TILE],[2750,H-9*TILE]];
 const _i1=Math.floor(Math.random()*_1ups.length);let _i2=Math.floor(Math.random()*_1ups.length);if(_i2===_i1)_i2=(_i2+3)%_1ups.length;
 platforms.push(h1(_1ups[_i1][0],_1ups[_i1][1]));platforms.push(h1(_1ups[_i2][0],_1ups[_i2][1]));}
// Pスイッチ 1個だけ（中央・H-6T高段ブロックと重複しないようH-5Tに配置）
platforms.push(pB(1540,H-5*TILE));
// 浮き足場×11（各落とし穴の上に1個ずつ）
movingPlats.push(mp(316,H-5*TILE,TILE*2,60,1.3));
movingPlats.push(mp(604,H-5*TILE,TILE*2,60,1.2));
movingPlats.push(mp(924,H-6*TILE,TILE*2,80,1.3));
movingPlats.push(mp(1204,H-5*TILE,TILE*2,60,1.4));
movingPlats.push(mp(1424,H-6*TILE,TILE*2,60,1.2));
movingPlats.push(mp(1644,H-6*TILE,TILE*2,80,1.3));
movingPlats.push(mp(1924,H-5*TILE,TILE*2,60,1.1));
movingPlats.push(mp(2144,H-6*TILE,TILE*2,60,1.3));
movingPlats.push(mp(2404,H-6*TILE,TILE*2,80,1.4));
movingPlats.push(mp(2724,H-5*TILE,TILE*2,60,1.2));
movingPlats.push(mp(2924,H-5*TILE,TILE*2,60,1.3));
// コイン列（多め・260枚以上）
ci(80,H-9*TILE,28,30);
ci(410,H-6*TILE,12,32);ci(710,H-6*TILE,12,32);
ci(1030,H-6*TILE,12,32);ci(1290,H-6*TILE,12,32);
ci(1510,H-6*TILE,12,32);ci(1760,H-6*TILE,12,32);
ci(2010,H-6*TILE,15,32);ci(2230,H-6*TILE,12,32);
ci(2510,H-6*TILE,12,32);ci(2810,H-6*TILE,10,32);
ci(3010,H-6*TILE,8,32);
ci(650,H-7*TILE,14,32);ci(1550,H-7*TILE,14,32);ci(2450,H-7*TILE,14,32);
ci(500,H-8*TILE,10,32);ci(1100,H-8*TILE,10,32);ci(2150,H-8*TILE,10,32);

// ══════ variantごとの特色（敵22体以上＋装飾）══════
// 地面(H-2T)安全x: 450,780,1100,1320,1580,1820,2060,2290,2580,2830,3030
// 低段上(H-5T): 430,730,1050,1310,1530,1780,2040,2250,2530,2820,3020
// 中段上(H-6T): 530,880,1380,1830,2330,2630
// 高段上(H-7T): 680,1580,2480

if(variant==='fallGrass1'){
// 🌱 W1 草原: クリボー中心の入門
enemies.push(gm(450));enemies.push(gm(780));enemies.push(gm(1100));enemies.push(gm(1320));enemies.push(kp(1580));enemies.push(gm(1820));enemies.push(gm(2060));enemies.push(kp(2290));enemies.push(gm(2580));enemies.push(kp(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(gm(730,H-5*TILE));enemies.push(kp(1050,H-5*TILE));enemies.push(gm(1310,H-5*TILE));enemies.push(kp(1780,H-5*TILE));enemies.push(gm(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(gm(530,H-6*TILE));enemies.push(kp(1380,H-6*TILE));enemies.push(gm(1830,H-6*TILE));enemies.push(kp(2330,H-6*TILE));
enemies.push(gm(680,H-7*TILE));enemies.push(gm(2480,H-7*TILE));
}
else if(variant==='fallGrass2'){
// 🌱 W1 草原2: ノコノコ多め
enemies.push(kp(450));enemies.push(kp(780));enemies.push(gm(1100));enemies.push(kp(1320));enemies.push(kp(1580));enemies.push(kp(1820));enemies.push(gm(2060));enemies.push(kp(2290));enemies.push(kp(2580));enemies.push(kp(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(kp(730,H-5*TILE));enemies.push(kp(1050,H-5*TILE));enemies.push(kp(1310,H-5*TILE));enemies.push(kp(1780,H-5*TILE));enemies.push(kp(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(kp(530,H-6*TILE));enemies.push(kp(880,H-6*TILE));enemies.push(kp(1380,H-6*TILE));enemies.push(kp(2330,H-6*TILE));
enemies.push(kp(680,H-7*TILE));enemies.push(kp(1580,H-7*TILE));
}
else if(variant==='fallGrass3'){
// 🌱 W1 草原3: バズ＋ノコノコ
enemies.push(bz(450));enemies.push(bz(780));enemies.push(kp(1100));enemies.push(bz(1320));enemies.push(bz(1580));enemies.push(kp(1820));enemies.push(bz(2060));enemies.push(bz(2290));enemies.push(kp(2580));enemies.push(bz(2830));
enemies.push(bz(430,H-5*TILE));enemies.push(kp(730,H-5*TILE));enemies.push(bz(1050,H-5*TILE));enemies.push(kp(1310,H-5*TILE));enemies.push(bz(1780,H-5*TILE));enemies.push(bz(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(bz(530,H-6*TILE));enemies.push(bz(1380,H-6*TILE));enemies.push(kp(1830,H-6*TILE));enemies.push(bz(2330,H-6*TILE));
enemies.push(bz(680,H-7*TILE));enemies.push(bz(2480,H-7*TILE));
}
else if(variant==='fallGrass4'){
// 🌱 W1 草原4: ハンマーブロス2体
enemies.push(hb(780));enemies.push(hb(2060));
enemies.push(gm(450));enemies.push(kp(1100));enemies.push(gm(1320));enemies.push(kp(1580));enemies.push(gm(1820));enemies.push(kp(2290));enemies.push(gm(2580));enemies.push(kp(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(gm(730,H-5*TILE));enemies.push(kp(1050,H-5*TILE));enemies.push(gm(1310,H-5*TILE));enemies.push(kp(1780,H-5*TILE));enemies.push(gm(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(gm(530,H-6*TILE));enemies.push(kp(1380,H-6*TILE));enemies.push(gm(1830,H-6*TILE));
enemies.push(gm(680,H-7*TILE));enemies.push(kp(2480,H-7*TILE));
}
else if(variant==='fallDesert1'){
// 🏜 W2 砂漠1: チャック突進
enemies.push(ch(780,-1));enemies.push(ch(2060,-1));
enemies.push(gm(450));enemies.push(kp(1100));enemies.push(gm(1320));enemies.push(gm(1580));enemies.push(kp(1820));enemies.push(gm(2290));enemies.push(kp(2580));enemies.push(gm(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(gm(730,H-5*TILE));enemies.push(kp(1050,H-5*TILE));enemies.push(gm(1310,H-5*TILE));enemies.push(kp(1780,H-5*TILE));enemies.push(gm(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(gm(530,H-6*TILE));enemies.push(kp(1380,H-6*TILE));enemies.push(gm(1830,H-6*TILE));
enemies.push(kp(680,H-7*TILE));enemies.push(gm(2480,H-7*TILE));
}
else if(variant==='fallDesert2'){
// 🏜 W2 砂漠2: おこりんぼ太陽2体
enemies.push(aS(900,80));enemies.push(aS(2400,80));
enemies.push(gm(450));enemies.push(kp(780));enemies.push(gm(1100));enemies.push(kp(1320));enemies.push(gm(1580));enemies.push(kp(1820));enemies.push(gm(2060));enemies.push(kp(2290));enemies.push(gm(2580));enemies.push(kp(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(gm(730,H-5*TILE));enemies.push(kp(1050,H-5*TILE));enemies.push(gm(1310,H-5*TILE));enemies.push(kp(1780,H-5*TILE));enemies.push(gm(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(gm(530,H-6*TILE));enemies.push(kp(1380,H-6*TILE));enemies.push(gm(1830,H-6*TILE));enemies.push(kp(2330,H-6*TILE));
enemies.push(gm(680,H-7*TILE));enemies.push(kp(2480,H-7*TILE));
}
else if(variant==='fallDesert3'){
// 🏜 W2 砂漠3: カロン3体＋クリボー
enemies.push(dB(1100));enemies.push(dB(1820));enemies.push(dB(2580));
enemies.push(gm(450));enemies.push(gm(780));enemies.push(kp(1320));enemies.push(gm(1580));enemies.push(kp(2060));enemies.push(gm(2290));enemies.push(gm(2830));
enemies.push(gm(430,H-5*TILE));enemies.push(kp(730,H-5*TILE));enemies.push(gm(1050,H-5*TILE));enemies.push(gm(1310,H-5*TILE));enemies.push(kp(1780,H-5*TILE));enemies.push(gm(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(gm(530,H-6*TILE));enemies.push(kp(1380,H-6*TILE));enemies.push(gm(1830,H-6*TILE));
enemies.push(gm(680,H-7*TILE));enemies.push(gm(2480,H-7*TILE));
}
else if(variant==='fallRiver1'){
// 🌊 W3 川: 追加浮き足場＋ノコノコ多め
movingPlats.push(mp(1100,H-4*TILE,TILE*2,120,1.5));movingPlats.push(mpv(2060,H-5*TILE,TILE*2,80,1.2));
enemies.push(kp(450));enemies.push(kp(780));enemies.push(bz(1100));enemies.push(kp(1320));enemies.push(kp(1580));enemies.push(bz(1820));enemies.push(kp(2060));enemies.push(kp(2290));enemies.push(bz(2580));enemies.push(kp(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(bz(730,H-5*TILE));enemies.push(kp(1050,H-5*TILE));enemies.push(kp(1310,H-5*TILE));enemies.push(bz(1780,H-5*TILE));enemies.push(kp(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(bz(530,H-6*TILE));enemies.push(kp(880,H-6*TILE));enemies.push(bz(1830,H-6*TILE));enemies.push(kp(2330,H-6*TILE));
enemies.push(kp(680,H-7*TILE));enemies.push(kp(2480,H-7*TILE));
}
else if(variant==='fallForest1'){
// 🌳 W3 森: ハンマーブロス2体＋ノコノコ
enemies.push(hb(1100));enemies.push(hb(2290));
enemies.push(kp(450));enemies.push(kp(780));enemies.push(gm(1320));enemies.push(kp(1580));enemies.push(gm(1820));enemies.push(kp(2580));enemies.push(kp(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(kp(730,H-5*TILE));enemies.push(gm(1050,H-5*TILE));enemies.push(kp(1310,H-5*TILE));enemies.push(gm(1780,H-5*TILE));enemies.push(kp(2250,H-5*TILE));enemies.push(gm(2820,H-5*TILE));
enemies.push(gm(530,H-6*TILE));enemies.push(kp(1380,H-6*TILE));enemies.push(gm(1830,H-6*TILE));enemies.push(kp(2330,H-6*TILE));
enemies.push(kp(680,H-7*TILE));enemies.push(gm(2480,H-7*TILE));
}
else if(variant==='fallWater1'){
// 🏖 W5 海辺1: サボテン小3体を飛越え
enemies.push(ct(450,TILE*2));enemies.push(ct(1320,TILE*2));enemies.push(ct(2290,TILE*2));
enemies.push(gm(780));enemies.push(kp(1100));enemies.push(kp(1580));enemies.push(gm(1820));enemies.push(kp(2060));enemies.push(gm(2580));enemies.push(kp(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(gm(730,H-5*TILE));enemies.push(kp(1050,H-5*TILE));enemies.push(gm(1310,H-5*TILE));enemies.push(kp(1780,H-5*TILE));enemies.push(gm(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(gm(530,H-6*TILE));enemies.push(kp(1380,H-6*TILE));enemies.push(gm(1830,H-6*TILE));
enemies.push(gm(680,H-7*TILE));
}
else if(variant==='fallWater2'){
// 🏖 W5 海辺2: サボテン大3体を飛越え
enemies.push(ct(450,TILE*4));enemies.push(ct(1320,TILE*4));enemies.push(ct(2290,TILE*4));
enemies.push(kp(780));enemies.push(gm(1100));enemies.push(kp(1580));enemies.push(gm(1820));enemies.push(kp(2060));enemies.push(kp(2580));enemies.push(kp(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(kp(730,H-5*TILE));enemies.push(gm(1050,H-5*TILE));enemies.push(kp(1310,H-5*TILE));enemies.push(kp(1780,H-5*TILE));enemies.push(kp(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(kp(530,H-6*TILE));enemies.push(gm(1380,H-6*TILE));enemies.push(kp(1830,H-6*TILE));
enemies.push(kp(680,H-7*TILE));
}
else if(variant==='fallIce1'){
// ❄ W6 氷1: ペンギン多数
enemies.push(pg(450));enemies.push(pg(780));enemies.push(pg(1100));enemies.push(kp(1320));enemies.push(pg(1580));enemies.push(pg(1820));enemies.push(pg(2060));enemies.push(kp(2290));enemies.push(pg(2580));enemies.push(pg(2830));
enemies.push(pg(430,H-5*TILE));enemies.push(kp(730,H-5*TILE));enemies.push(pg(1050,H-5*TILE));enemies.push(pg(1310,H-5*TILE));enemies.push(pg(1780,H-5*TILE));enemies.push(kp(2250,H-5*TILE));enemies.push(pg(2820,H-5*TILE));
enemies.push(pg(530,H-6*TILE));enemies.push(pg(1380,H-6*TILE));enemies.push(kp(1830,H-6*TILE));enemies.push(pg(2330,H-6*TILE));
enemies.push(pg(680,H-7*TILE));enemies.push(pg(2480,H-7*TILE));
}
else if(variant==='fallIce2'){
// ❄ W6 氷2: ペンギン＋カロン
enemies.push(pg(450));enemies.push(pg(1100));enemies.push(pg(1580));enemies.push(pg(2060));enemies.push(pg(2580));enemies.push(pg(2830));
enemies.push(dB(780));enemies.push(dB(1320));enemies.push(dB(1820));enemies.push(dB(2290));
enemies.push(pg(430,H-5*TILE));enemies.push(pg(730,H-5*TILE));enemies.push(pg(1050,H-5*TILE));enemies.push(pg(1310,H-5*TILE));enemies.push(pg(1780,H-5*TILE));enemies.push(pg(2250,H-5*TILE));enemies.push(pg(2820,H-5*TILE));
enemies.push(pg(530,H-6*TILE));enemies.push(pg(1380,H-6*TILE));enemies.push(pg(1830,H-6*TILE));
enemies.push(pg(680,H-7*TILE));
}
else if(variant==='fallFort1'){
// 🔥 W7 砦1: ドッスン＋ハンマーブロス＋溶岩炎
lavaFlames.push({x:950,y:H-TILE,w:22,maxH:90,curH:0,phase:0,period:120});
lavaFlames.push({x:2080,y:H-TILE,w:22,maxH:90,curH:0,phase:60,period:120});
enemies.push(tw(500));enemies.push(tw(1500));enemies.push(tw(2600));
enemies.push(hb(780));enemies.push(hb(2290));
enemies.push(kp(450));enemies.push(gm(1100));enemies.push(kp(1320));enemies.push(gm(1580));enemies.push(kp(1820));enemies.push(gm(2060));enemies.push(kp(2580));enemies.push(gm(2830));
enemies.push(kp(430,H-5*TILE));enemies.push(gm(730,H-5*TILE));enemies.push(kp(1050,H-5*TILE));enemies.push(gm(1310,H-5*TILE));enemies.push(kp(1780,H-5*TILE));enemies.push(gm(2250,H-5*TILE));enemies.push(kp(2820,H-5*TILE));
enemies.push(kp(530,H-6*TILE));enemies.push(gm(1830,H-6*TILE));
enemies.push(kp(680,H-7*TILE));
}
else if(variant==='fallFort2'){
// 🔥 W7 砦2: キャノン＋ドッスン＋カロン＋溶岩炎
cannons.push({x:640,y:H-3*TILE,w:TILE,h:TILE*2,fireRate:180,timer:30});
cannons.push({x:1600,y:H-3*TILE,w:TILE,h:TILE*2,fireRate:180,timer:80});
cannons.push({x:2560,y:H-3*TILE,w:TILE,h:TILE*2,fireRate:180,timer:120});
lavaFlames.push({x:1060,y:H-TILE,w:22,maxH:100,curH:0,phase:30,period:110});
lavaFlames.push({x:2060,y:H-TILE,w:22,maxH:100,curH:0,phase:60,period:110});
enemies.push(tw(380));enemies.push(tw(2400));
enemies.push(dB(1100));enemies.push(dB(1580));enemies.push(dB(2580));
enemies.push(gm(450));enemies.push(kp(780));enemies.push(kp(1320));enemies.push(gm(1820));enemies.push(kp(2290));enemies.push(gm(2830));
enemies.push(gm(430,H-5*TILE));enemies.push(kp(730,H-5*TILE));enemies.push(gm(1050,H-5*TILE));enemies.push(kp(1310,H-5*TILE));enemies.push(gm(1780,H-5*TILE));enemies.push(kp(2250,H-5*TILE));enemies.push(gm(2820,H-5*TILE));
enemies.push(gm(530,H-6*TILE));enemies.push(kp(1380,H-6*TILE));enemies.push(gm(1830,H-6*TILE));
enemies.push(gm(680,H-7*TILE));
}

}else if(variant==='pinocchio'||variant==='pinocchio_fail'){
// ★ ピノキオの部屋 ★ 空テーマの選択部屋
G.pinoRoom=true;
// キノコ？ブロック1個だけ（浮き足場はなし）
platforms.push({x:384,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
if(variant==='pinocchio_fail'){
  // 失敗状態：出口パイプのみ、キノピオが一言
  // 防御的リセット（前回の状態が残っていても安全に）
  G.chestOpened=false;G.pinoReward=-1;G.pinoNeed=0;
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
