import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,BOWSER_STATS,pinoObj,chests} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildUnderground(variant){
chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;
// 共通構造: 床・天井・出口パイプ・右壁
const W=800;
for(let x=0;x<W;x+=TILE){platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});
if(x>0&&x<W-TILE)platforms.push({x,y:0,w:TILE,h:TILE,type:'ground',bounceOffset:0})}
// ピノキオ部屋は出口パイプを共通設置しない（報酬クリア後に別途生成）
if(variant!=='pinocchio'&&variant!=='pinocchio_fail')pipes.push({x:W-3*TILE,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
// ピノキオ部屋は右壁・左壁を床まで完全に埋める（出口パイプ不在＋敵脱走防止）
const _isPino=(variant==='pinocchio'||variant==='pinocchio_fail');
const _wallBottom=_isPino?H-TILE:H-4*TILE;
for(let wy=TILE;wy<_wallBottom;wy+=TILE)platforms.push({x:W-TILE,y:wy,w:TILE,h:TILE,type:'ground',bounceOffset:0});
// 左壁（ピノキオ部屋のみ）
if(_isPino){
  platforms.push({x:0,y:0,w:TILE,h:TILE,type:'ground',bounceOffset:0});// 天井左角
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
enemies.push(gm(300));enemies.push(gm(500));enemies.push(kp(620));

}else if(variant==='goomba'){
// ★ クリボーの小部屋 ★ 1-2: クリボーが少しいるコイン部屋
addRow(100,H-5*TILE,2,'brick');addRow(300,H-4*TILE,4,'brick');addRow(560,H-6*TILE,2,'brick');
platforms.push(qM(230,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,19,38);ci(60,H-9*TILE,17,42);
enemies.push(gm(300));enemies.push(gm(480));enemies.push(gm(600));

}else if(variant==='mushroom'){
// ★ ノコノコの甲羅通路 ★ 1-2: ノコノコがうろつくボーナス通路
addRow(120,H-4*TILE,2,'brick');addRow(350,H-5*TILE,2,'brick');addRow(540,H-4*TILE,3,'brick');
platforms.push(qM(260,H-6*TILE));
platforms.push(rh1());
ci(55,H-8*TILE,24,30);ci(80,H-6*TILE,14,35);
enemies.push(kp(300));enemies.push(gm(500));enemies.push(gm(200));

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
enemies.push(gm(320));enemies.push(gm(560));

// ════════════════════════════════════════
// World 2 — 砂漠
// ════════════════════════════════════════

}else if(variant==='desert1'){
// ★ 砂漠の宝箱部屋 ★ 2-1: ジャンプブロックがちょっと邪魔なコイン部屋
addRow(130,H-4*TILE,2,'brick');addRow(310,H-5*TILE,3,'brick');addRow(550,H-4*TILE,2,'brick');
platforms.push(qM(240,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(80,H-9*TILE,14,45);
enemies.push(gm(300));enemies.push(gm(500));enemies.push(kp(200));
jumpBlocks.push(jb(620));

}else if(variant==='desert2'){
// ★ パイポの洞窟 ★ 2-1: パイポが1匹跳ねてるコイン洞窟
addRow(100,H-5*TILE,3,'brick');addRow(370,H-4*TILE,2,'brick');addRow(540,H-6*TILE,2,'brick');
platforms.push(qM(260,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,26,28);ci(60,H-9*TILE,12,55);
enemies.push(gm(400));enemies.push(gm(200));
pipos.push(pp(550,-6));

}else if(variant==='desert3'){
// ★ ジャンプブロックの部屋 ★ 2-2: ジャンプブロックが跳ねるコイン部屋
addRow(130,H-4*TILE,2,'brick');addRow(340,H-6*TILE,2,'brick');addRow(530,H-4*TILE,2,'brick');
platforms.push(qM(250,H-5*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(70,H-9*TILE,14,48);
enemies.push(gm(400));enemies.push(gm(560));
jumpBlocks.push(jb(250));pipos.push(pp(550,-6));

}else if(variant==='desert4'){
// ★ 砂漠のコイン洞窟 ★ 2-2: 小さな火柱がアクセントのコイン部屋
addRow(100,H-4*TILE,2,'brick');addRow(310,H-5*TILE,2,'brick');addRow(510,H-4*TILE,2,'brick');
platforms.push(qM(230,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,19,38);ci(80,H-9*TILE,17,40);
enemies.push(gm(300));enemies.push(gm(550));enemies.push(kp(200));
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
enemies.push(gm(300));enemies.push(gm(530));
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
enemies.push(gm(300));enemies.push(kp(500));enemies.push(gm(200));

}else if(variant==='river2'){
// ★ 橋の下の宝庫 ★ 3-1: ひっそり隠れた宝の間
addRow(120,H-4*TILE,2,'brick');addRow(310,H-6*TILE,3,'brick');addRow(560,H-5*TILE,2,'brick');
platforms.push(qM(240,H-5*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(70,H-9*TILE,12,55);
enemies.push(kp(300));enemies.push(gm(500));enemies.push(gm(600));

}else if(variant==='forest1'){
// ★ 森の地下室 ★ 3-2: メットが1匹うろつくコイン部屋
addRow(100,H-4*TILE,2,'brick');addRow(290,H-5*TILE,3,'brick');addRow(530,H-4*TILE,2,'brick');
platforms.push(qM(220,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,14,48);
enemies.push(bz(350));enemies.push(gm(550));enemies.push(gm(200));

}else if(variant==='forest2'){
// ★ 暗闘の倉庫 ★ 3-2: ノコノコとクリボーのコイン倉庫
addRow(130,H-5*TILE,2,'brick');addRow(350,H-4*TILE,3,'brick');addRow(570,H-6*TILE,2,'brick');
platforms.push(qM(260,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,26,27);ci(80,H-9*TILE,12,52);
enemies.push(kp(300));enemies.push(gm(480));enemies.push(gm(620));

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
enemies.push(kp(320));enemies.push(gm(570));

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
enemies.push(gm(300));enemies.push(gm(500));enemies.push(kp(620));

}else if(variant==='water2'){
// ★ 潮溜まりの宝箱 ★ 5-1: コンパクトな宝箱部屋
addRow(120,H-5*TILE,2,'brick');addRow(330,H-4*TILE,3,'brick');addRow(570,H-6*TILE,2,'brick');
platforms.push(qM(250,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(80,H-9*TILE,14,46);
enemies.push(gm(300));enemies.push(kp(500));enemies.push(gm(200));

}else if(variant==='water3'){
// ★ 深海のコイン洞窟 ★ 5-2: ノコノコがうろつくコイン洞窟
addRow(130,H-4*TILE,2,'brick');addRow(340,H-5*TILE,3,'brick');addRow(570,H-4*TILE,2,'brick');
platforms.push(qM(260,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,18,38);
enemies.push(kp(300));enemies.push(gm(500));enemies.push(gm(620));

}else if(variant==='water4'){
// ★ 海底の秘密基地 ★ 5-2: メットがちょっといる海底基地
addRow(100,H-5*TILE,2,'brick');addRow(320,H-4*TILE,2,'brick');addRow(510,H-6*TILE,3,'brick');
platforms.push(qM(230,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,19,38);ci(80,H-9*TILE,17,40);
enemies.push(bz(350));enemies.push(gm(550));enemies.push(kp(200));

// ════════════════════════════════════════
// World 6 — 氷
// ════════════════════════════════════════

}else if(variant==='ice1'){
// ★ 氷穴のペンギン ★ 6-1: ペンギンがちょっといる氷の洞窟
addRow(120,H-4*TILE,3,'brick');addRow(380,H-5*TILE,2,'brick');addRow(560,H-4*TILE,2,'brick');
platforms.push(qM(280,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(60,H-9*TILE,14,48);
enemies.push(pg(350));enemies.push(gm(550));enemies.push(pg(200));

}else if(variant==='ice2'){
// ★ ペンギンのコイン部屋 ★ 6-1: ペンギン2匹のコイン部屋
addRow(100,H-5*TILE,2,'brick');addRow(310,H-4*TILE,3,'brick');addRow(560,H-6*TILE,2,'brick');
platforms.push(qM(230,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(80,H-9*TILE,14,46);
enemies.push(pg(300));enemies.push(pg(520));enemies.push(gm(200));

}else if(variant==='ice3'){
// ★ 凍りついたコイン部屋 ★ 6-2: コインブロック付き氷のご褒美部屋
addRow(130,H-4*TILE,2,'brick');addRow(350,H-6*TILE,3,'brick');addRow(570,H-5*TILE,2,'brick');
platforms.push(qM(260,H-5*TILE));
platforms.push(rh1());
platforms.push(qC(460,H-7*TILE,10));
ci(55,H-7*TILE,22,34);ci(60,H-9*TILE,19,36);
enemies.push(pg(300));enemies.push(gm(530));enemies.push(pg(580));

}else if(variant==='ice4'){
// ★ 氷のコイン倉庫 ★ 6-2: ペンギンとジャンプブロックのコイン倉庫
addRow(100,H-4*TILE,2,'brick');addRow(300,H-5*TILE,2,'brick');addRow(520,H-4*TILE,3,'brick');
platforms.push(qM(220,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(80,H-9*TILE,14,46);
enemies.push(pg(350));enemies.push(gm(550));enemies.push(pg(200));
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
enemies.push(te(400,H-6*TILE));enemies.push(gm(550));enemies.push(gm(200));

}else if(variant==='fortress2'){
// ★ ドッスンの通路 ★ 7-1: ドッスンが1体いるスリルのある通路
// ※ ドッスン x=320〜384 の真下にブロック禁止
addRow(100,H-4*TILE,2,'brick');addRow(420,H-5*TILE,2,'brick');addRow(580,H-4*TILE,2,'brick');
platforms.push(qM(240,H-6*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,19,38);ci(80,H-9*TILE,17,40);
enemies.push(tw(320));enemies.push(gm(500));enemies.push(gm(200));

}else if(variant==='fortress3'){
// ★ 亡霊の回廊 ★ 7-2: テレサとクリボーの回廊
addRow(120,H-4*TILE,2,'brick');addRow(340,H-6*TILE,3,'brick');addRow(570,H-4*TILE,2,'brick');
platforms.push(qM(260,H-5*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,24,30);ci(60,H-9*TILE,14,48);
enemies.push(te(400,H-5*TILE));enemies.push(gm(300));enemies.push(gm(550));

}else if(variant==='fortress4'){
// ★ ハンマーブロスの部屋 ★ 7-2: ハンマーブロスが1匹いるコイン部屋
addRow(100,H-5*TILE,2,'brick');addRow(310,H-4*TILE,2,'brick');addRow(520,H-6*TILE,3,'brick');
platforms.push(qM(230,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,22,34);ci(80,H-9*TILE,14,46);
enemies.push(hb(400));enemies.push(gm(580));

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
enemies.push(bz(340));enemies.push(gm(560));

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
enemies.push(gm(300));enemies.push(gm(480));enemies.push(bz(560));

}else if(variant==='airship_goal2'){
// ★ 飛行船最終出口 ★ 8-2: メットが1匹いるゴール部屋
for(let i=pipes.length-1;i>=0;i--){if(pipes[i].isExit)pipes.splice(i,1);}
pipes.push({x:600,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isGoalPipe:true});
addRow(130,H-5*TILE,2,'brick');addRow(350,H-4*TILE,2,'brick');
platforms.push(qM(250,H-4*TILE));
platforms.push(rh1());
ci(55,H-7*TILE,18,34);ci(80,H-9*TILE,12,48);
enemies.push(bz(300));enemies.push(gm(480));enemies.push(bz(580));

// ════════════════════════════════════════
// 8-3 クッパ最終決戦（変更なし）
// ════════════════════════════════════════

}else if(variant==='bowser_final'){
// ★8-3 クッパ最終決戦★ クッパHP=7 + ピーチ救出
for(let i=pipes.length-1;i>=0;i--){if(pipes[i].isExit)pipes.splice(i,1);}
addRow(80,H-8*TILE,2,'brick');addRow(250,H-8*TILE,2,'brick');addRow(420,H-8*TILE,2,'brick');
platforms.push({x:80, y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:314,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasStar:true,bounceOffset:0});
platforms.push({x:484,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:200,y:H-9*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
platforms.push({x:150,y:H-11*TILE,w:TILE,h:TILE,type:'hidden',hit:false,has1UP:true,bounceOffset:0});
for(let i=0;i<20;i++)coinItems.push({x:55+i*30,y:H-7*TILE,collected:false});
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
enemies.push(gm(580));enemies.push(kp(200));

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
enemies.push(gm(400));enemies.push(kp(200));

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
enemies.push(bz(560));enemies.push(gm(200));

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
enemies.push(gm(580));enemies.push(kp(220));

}else if(variant==='pinocchio'||variant==='pinocchio_fail'){
// ★ ピノキオの部屋 ★ 空テーマの選択部屋
G.pinoRoom=true;
// キノコ？ブロック1個だけ（浮き足場はなし）
platforms.push({x:384,y:H-5*TILE,w:TILE,h:TILE,type:'question',hit:false,hasMush:true,bounceOffset:0});
if(variant==='pinocchio_fail'){
  // 失敗状態：出口パイプのみ、ピノキオが一言
  pipes.push({x:696,y:H-TILE-3*TILE,w:TILE*2,h:3*TILE,bounceOffset:0,isWarp:false,isExit:true});
  pinoObj.alive=true;pinoObj.x=360;pinoObj.y=H-TILE-pinoObj.h;pinoObj.vx=0;pinoObj.vy=0;pinoObj.facing=1;pinoObj.frame=0;pinoObj.frameTimer=0;
  G.pinoState='exfail';
  G.pinoSpeechText='チャレンジは1度だけ！\n次は自分で頑張りなさい！';
  G.pinoSpeechTimer=400;
}else{
  // 通常状態：宝箱5個 + ピノキオ
  chests.length=0;
  const _cxs=[90,205,330,460,580];
  for(let _i=0;_i<5;_i++){
    platforms.push({x:_cxs[_i],y:H-2*TILE-10,w:TILE+4,h:TILE+10,type:'chest',bounceOffset:0,opened:false,chestIdx:_i});
  }
  pinoObj.alive=true;pinoObj.x=360;pinoObj.y=H-TILE-pinoObj.h;pinoObj.vx=0;pinoObj.vy=0;pinoObj.facing=1;pinoObj.frame=0;pinoObj.frameTimer=0;
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
enemies.push(gm(300));enemies.push(gm(500));
}}
