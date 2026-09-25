// ディープテスト: 本物のゲームループをNodeで長時間動かし、例外・異常状態を洗い出す
//   god   : 無敵走破（穴は引き上げ・詰まりは前送り）で全ステージを最後まで。城はクッパ戦→ピーチ→ショップまで
//   pipes : 全ステージの全ワープ土管に入って少し遊び、出口から戻る（地上の状態が戻るか）
//   monkey: キーボード＋ゲームパッドのランダム入力で全状態（タイトル/ショップ/メニュー/ゲームオーバー…）を通す
//   long  : 死亡・リスタート・ステージ移動を繰り返して配列が増え続けないか
// 使い方: node tools/deep-test.mjs [god|pipes|monkey|long ...]（省略時は全部）
import {installEnv,step,key,gamepads,storage} from './smoke/env.mjs';

let _seed=20260925;const rnd=()=>{_seed=(_seed*1103515245+12345)&0x7fffffff;return _seed/0x7fffffff;};
Math.random=rnd;
installEnv();
const findings=[];
const add=(kind,where,msg)=>findings.push({kind,where,msg});
process.on('uncaughtException',e=>add('例外(async)','-',e.message+' | '+(e.stack||'').split('\n').slice(1,3).join(' | ')));

const g=await import('../src/globals.js');
const {G,mario,enemies,platforms,pipes,coinItems,particles,scorePopups,bowser,peach,flagPole,W,H,TILE,LW}=g;
const {STAGES}=await import('../src/stages.js');
try{await import('../src/main.js');}catch(e){console.log('main.js の読み込みに失敗:',e.stack);process.exit(1);}

const parts=process.argv.slice(2);const want=p=>!parts.length||parts.includes(p);
let where='boot';
const ARRAYS=['platforms','pipes','coinItems','enemies','mushrooms','fireballs','particles','scorePopups','blockAnims','movingPlats','springs','hammers','cannons','bulletBills','lavaFlames','bowserFire','yoshiEggs','yoshiItems','chainChomps','jumpBlocks','pipos','iceBalls','marioHammers','windParticles','bowserShockwaves'];
const CAPS={particles:3000,scorePopups:400,fireballs:4,iceBalls:4,marioHammers:4,hammers:80,bulletBills:60,bowserFire:60,windParticles:1500,bowserShockwaves:20,yoshiEggs:20,blockAnims:200,pipos:80};
const seen=new Set();
function once(kind,msg){const k=kind+'|'+where.split(' ')[0]+'|'+msg;if(seen.has(k))return;seen.add(k);add(kind,where,msg);}

let embedFrames=0;const trail=[];let prevPos=null;let harnessWarp=false;
function checkInvariants(){
  // 1フレームでの瞬間移動（衝突処理の不具合の兆候）。テスト自身のワープ・死亡・部屋の出入りは除外
  const pos={x:mario.x,y:mario.y,ug:G.ugMode,dead:mario.dead,state:G.state,goal:!!G.goalSlide};
  if(prevPos&&!harnessWarp&&!pos.dead&&!prevPos.dead&&pos.ug===prevPos.ug&&pos.state==='play'&&prevPos.state==='play'&&!pos.goal){
    const dx=mario.x-prevPos.x,dy=mario.y-prevPos.y;
    if(Math.abs(dx)>40||dy<-40||dy>40){const near=platforms.filter(p=>Math.abs(p.x-mario.x)<60&&Math.abs(p.y-mario.y)<140).map(p=>`${p.type[0]}${p.x},${p.y}`).slice(0,10).join(' ');const en=enemies.filter(e=>e.alive&&Math.abs(e.x-mario.x)<80).map(e=>`${e.type}${e.frozen?'(凍)':''}@${Math.round(e.x)},${Math.round(e.y)}`).join(' ');
      once('瞬間移動',`(${Math.round(prevPos.x)},${Math.round(prevPos.y)})→(${Math.round(mario.x)},${Math.round(mario.y)}) h=${mario.h} og=${mario.onGround} 周辺[${near}] 敵[${en}] 直前: ${trail.slice(-4).join(' | ')}`);}
  }
  prevPos=pos;harnessWarp=false;
  trail.push(`${Math.round(mario.x)},${Math.round(mario.y)} v${mario.vx.toFixed(1)},${mario.vy.toFixed(1)}${mario.onGround?' G':''}${mario.wallContact?' W'+mario.wallContact:''}`);if(trail.length>40)trail.shift();
  // 地下の部屋（天井あり）から外に出ていないか
  if(G.ugMode&&G.state==='play'&&!mario.dead&&(mario.y+mario.h<0||(!G.pipeDungeon&&(mario.x<-2||mario.x+mario.w>W+2))))once('部屋の外',`地下部屋の外に出た x=${Math.round(mario.x)} y=${Math.round(mario.y)} 直前: ${trail.slice(-12).join(' | ')}`);
  for(const k of ['x','y','vx','vy','h'])if(!Number.isFinite(mario[k]))once('NaN',`mario.${k}=${mario[k]}`);
  for(const k of ['cam','score','coins','timeLeft','lives'])if(!Number.isFinite(G[k]))once('NaN',`G.${k}=${G[k]}`);
  for(const e of enemies)if(e.alive&&(!Number.isFinite(e.x)||!Number.isFinite(e.y))){once('NaN',`enemy ${e.type} 座標NaN`);break;}
  if(G.state==='play'&&G.timeLeft<0)once('状態',`timeLeft<0`);
  if(G.coins>3000)once('状態',`coins>3000 (${G.coins})`);
  if(G.lives<0)once('状態',`lives<0`);
  const maxCam=G.ugMode?(G.pipeDungeon?3200-W:0):LW-W;
  if(G.cam<-1||G.cam>maxCam+1)once('カメラ',`cam=${Math.round(G.cam)} 範囲外(0..${maxCam}) ug=${G.ugMode}`);
  for(const [k,cap] of Object.entries(CAPS))if(g[k].length>cap)once('配列の増加',`${k}.length=${g[k].length} > ${cap}`);
  // マリオがブロックに長くめり込んでいないか
  if(G.state==='play'&&!mario.dead){
    let emb=false;for(const p of platforms){if(p.type==='hidden'&&!p.hit)continue;if(p.type==='coin'||p.type==='chest')continue;if(Math.abs(p.x-mario.x)>64)continue;const py=p.y-(p.bounceOffset||0);
      const ox=Math.min(mario.x+mario.w,p.x+p.w)-Math.max(mario.x,p.x),oy=Math.min(mario.y+mario.h,py+p.h)-Math.max(mario.y,py);if(ox>6&&oy>6){emb=true;break;}}
    embedFrames=emb?embedFrames+1:0;
    if(embedFrames===45)once('めり込み',`マリオがブロックに45F以上めり込み x=${Math.round(mario.x)} y=${Math.round(mario.y)} h=${mario.h} big=${mario.big} crouch=${mario.crouching}`);
  }
}
function tick(){
  try{step();}catch(e){once('例外',e.message+' | '+(e.stack||'').split('\n').slice(1,3).join(' | '));return false;}
  checkInvariants();return true;
}
const run=(n,each)=>{for(let i=0;i<n;i++){if(each&&each(i)===false)return false;if(!tick())return false;}return true;};
const press=(code,n=1)=>{key('keydown',code);run(n);key('keyup',code);};
const releaseAll=()=>{for(const c of ['ArrowRight','ArrowLeft','ShiftLeft','Space','ArrowDown','ArrowUp','KeyZ','KeyX','KeyC'])key('keyup',c);};
function start(id){releaseAll();G.menu=null;G.paused=false;G.state='start';G.selectedStage=id;run(25);press('Enter');run(160);
  if(G.state!=='play')once('開始',`ステージ開始後に play にならない state=${G.state}`);}

// ===== 1) 無敵走破 =====
// 空いている高さを探してワープ（ブロックの中に送らない）
function freeAt(x,y){for(const p of [...platforms,...pipes]){if(p.type==='hidden'&&!p.hit)continue;if(overlapR(x,y,mario.w,mario.h,p.x,p.y-(p.bounceOffset||0),p.w,p.h))return false;}return true;}
function overlapR(ax,ay,aw,ah,bx,by,bw,bh){return ax<bx+bw&&ax+aw>bx&&ay<by+bh&&ay+ah>by;}
function safeWarp(x){harnessWarp=true;for(let y=8;y<H-60;y+=8)if(freeAt(x,y)){mario.x=x;mario.y=y;mario.vy=0;return true;}mario.x=x;mario.y=8;mario.vy=0;return false;}
const stallCount={};
function godRun(st){
  const label=st.world?`${st.world}-${st.level}`:`EX${st.ex}`;where=`${label} god`;
  start(st.id);G.lives=99;
  const castle=st.bgmTheme==='castle';
  let bestX=mario.x,stall=0,res='時間切れ',teleports=0,skips=0,jumpT=0,lastGround=mario.x,rescueHere=0,boss=false,dmg=0;
  const hold=(k,on)=>key(on?'keydown':'keyup',k);
  hold('ArrowRight',true);hold('ShiftLeft',true);
  // ワープ先の上限（旗・クッパのアリーナを飛び越えない）
  const cap=()=>G.ugMode?(G.pipeDungeon?3100:760):castle&&G.bowserArenaX&&!G.ugMode?G.bowserArenaX+120:flagPole.x-60;
  const ok=run(20000,i=>{
    G.lives=Math.max(G.lives,50);mario.inv=Math.max(mario.inv,2);
    if(castle&&mario.power!=='fire'&&!mario.dead){mario.power='fire';mario.big=true;if(mario.h<48){mario.h=48;mario.y-=16;}}
    if(--jumpT<=0){hold('Space',true);jumpT=6+Math.floor(rnd()*20);}
    if(jumpT===3)hold('Space',false);
    if(i%20===0)press('KeyZ');
    if(mario.onGround&&!mario.dead){if(Math.abs(mario.x-lastGround)>64)rescueHere=0;lastGround=mario.x;}
    // クッパ戦: 距離を保ちながら撃つ
    boss=castle&&bowser.alive&&bowser.state!=='offscreen';
    if(boss&&!mario.dead){const toward=bowser.x>mario.x?1:-1,dist=Math.abs(bowser.x-mario.x);
      hold('ArrowRight',toward>0&&dist>200);hold('ArrowLeft',toward<0&&dist>200);
      if(dist<=200){mario.facing=toward;}}
    else{hold('ArrowLeft',false);hold('ArrowRight',true);}
    // 8-3: ワープ土管でクッパ部屋へ
    if(st.world===8&&st.level===3&&!G.ugMode&&mario.x>6700&&!mario.dead){harnessWarp=true;const p=pipes.find(q=>q.variant==='bowser_final');if(p){mario.x=p.x+16;mario.y=p.y-mario.h;mario.vy=0;mario.onGround=true;hold('ArrowDown',true);run(3);hold('ArrowDown',false);}}
    // 穴に落ちたら引き上げ（最後に立っていた場所から少しずつ前へ）
    if(!mario.dead&&mario.y>H-40&&mario.vy>0){rescueHere++;safeWarp(Math.min(cap(),lastGround+48*rescueHere));teleports++;}
    // 地下の部屋で詰まったら出口土管から出る（ボットは出口に入る操作をしないため）
    if(G.ugMode&&stall>150&&!mario.dead){const ex=pipes.find(p=>p.isExit&&!p.horizontal);if(ex){harnessWarp=true;mario.x=ex.x+ex.w/2-mario.w/2;mario.y=ex.y-mario.h;mario.vy=0;mario.onGround=true;hold('ArrowDown',true);run(3);hold('ArrowDown',false);stall=0;}}
    if(mario.dead||G.state!=='play'||boss){stall=0;}else if(mario.x>bestX+4){bestX=mario.x;stall=0;}else stall++;
    if(stall>240&&!G.goalSlide&&!G.peachChase){stallCount[label]=(stallCount[label]||0)+1;if(stallCount[label]<=3){const near=platforms.filter(p=>Math.abs(p.x-mario.x)<70&&Math.abs(p.y-mario.y)<90).map(p=>`${p.type[0]}${p.x},${p.y}`).slice(0,12).join(' ');once('詰まり',`前に進めない x=${Math.round(mario.x)} y=${Math.round(mario.y)} vx=${mario.vx.toFixed(1)} og=${mario.onGround} ug=${G.ugMode} water=${G.waterMode} 周辺[${near}]`);}safeWarp(Math.min(cap(),Math.max(mario.x,bestX)+96));bestX=mario.x;stall=0;skips++;}
    if(G.state==='shop'){res='ショップ到達';return false;}
    if(G.state==='win'){res='エンディング到達';return false;}
    if(G.state==='start'){res='タイトルへ';return false;}
    if(G.state!=='play'&&G.state!=='intro'){res='state='+G.state;return false;}
  });
  releaseAll();hold('ArrowLeft',false);
  if(ok===false&&res==='時間切れ')res='例外で停止';
  return {label,res,maxX:Math.round(bestX),teleports,skips,bowser:bowser.alive?`${bowser.state}/hp${bowser.hp}`:'-'};
}

// ===== 2) 全土管 =====
const FLAGS=['waterMode','darkMode','iceMode','lowGravity','sandstormMode','tideMode','airshipMode','autoScroll','gravityFlipped','pipeDungeon','ugMode','pinoRoom'];
function pipeRun(st){
  const label=`${st.world}-${st.level}`;const out=[];
  start(st.id);const warps=pipes.map((p,i)=>({i,x:p.x,y:p.y,w:p.w,h:p.h,ceiling:!!p.ceiling,variant:p.variant,isWarp:p.isWarp})).filter(p=>p.isWarp);
  for(const wp of warps){
    where=`${label} pipe@${wp.x}(${wp.variant||'?'})`;
    start(st.id);G.lives=99;
    const before={plats:platforms.length,enemies:enemies.length,coins:coinItems.length,flags:Object.fromEntries(FLAGS.map(f=>[f,G[f]]))};
    if(wp.ceiling){harnessWarp=true;mario.x=wp.x+wp.w/2-mario.w/2;mario.y=wp.y+wp.h+4;mario.vy=-8;run(3);}
    else{harnessWarp=true;mario.x=wp.x+wp.w/2-mario.w/2;mario.y=wp.y-mario.h;mario.vy=0;mario.onGround=true;run(1);press('ArrowDown',3);}
    if(!G.ugMode){out.push(`${wp.x}:${wp.variant} 入れない`);once('土管',`ワープ土管に入れない (ceiling=${wp.ceiling})`);continue;}
    // 地下でしばらく無敵で遊ぶ
    key('keydown','ArrowRight');let t=0;
    run(900,i=>{mario.inv=Math.max(mario.inv,2);G.lives=Math.max(G.lives,50);if(--t<=0){key('keydown','Space');t=8+Math.floor(rnd()*20);}if(t===4)key('keyup','Space');if(mario.y>H-40&&mario.vy>0&&!G.waterMode){harnessWarp=true;mario.y=40;mario.vy=0;}if(!G.ugMode)return false;});
    releaseAll();
    if(G.ugMode){
      const ex=pipes.find(p=>p.isExit);
      if(!ex){once('土管',`地下に出口土管が無い variant=${wp.variant}`);continue;}
      harnessWarp=true;if(ex.horizontal){mario.x=ex.x-mario.w-1;mario.y=ex.y+ex.h-mario.h;mario.vy=0;mario.onGround=true;key('keydown','ArrowRight');key('keydown','ArrowDown');run(4);releaseAll();}
      else{harnessWarp=true;mario.x=ex.x+ex.w/2-mario.w/2;mario.y=ex.y-mario.h;mario.vy=0;mario.onGround=true;run(1);press('ArrowDown',3);}
      run(20);
    }
    if(G.ugMode){if(!G.pinoRoom)once('土管',`出口土管から出られない variant=${wp.variant}`);continue;}
    if(G.state!=='play')continue;
    // 地上の状態が戻っているか
    if(platforms.length<before.plats-2)once('状態の復元',`地上の足場が減った ${before.plats}→${platforms.length}`);
    for(const f of FLAGS){if(f==='ugMode'||f==='pipeDungeon'||f==='pinoRoom')continue;if(G[f]!==before.flags[f])once('状態の復元',`G.${f}: ${before.flags[f]}→${G[f]}`);}
    out.push(`${wp.x}:${wp.variant} OK`);
  }
  return {label,pipes:warps.length,detail:out.join(', ')};
}

// ===== 3) モンキーテスト =====
const KEYS=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','ShiftLeft','KeyZ','KeyX','KeyC','KeyP','Escape','Enter','KeyM','KeyK','KeyJ','Backspace','Delete','Digit3','KeyL','KeyQ','Equal','Minus','KeyA','KeyD','KeyS','KeyW'];
function monkey(frames,seed){
  _seed=seed;where=`monkey#${seed}`;const held=new Set();const states={};
  gamepads[0]={id:'fake pad',mapping:'standard',axes:[0,0],buttons:Array.from({length:16},()=>({pressed:false}))};
  run(frames,i=>{
    states[G.state+(G.menu?':'+G.menu.type:'')]=(states[G.state+(G.menu?':'+G.menu.type:'')]||0)+1;
    // ゲームプレイ中は右移動を優先
    if(G.state==='play'&&!G.menu&&rnd()<0.02&&!held.has('ArrowRight')){key('keydown','ArrowRight');held.add('ArrowRight');}
    if(rnd()<0.08){const k=KEYS[Math.floor(rnd()*KEYS.length)];if(held.has(k)){key('keyup',k);held.delete(k);}else{key('keydown',k,false);held.add(k);if(rnd()<0.3){key('keydown',k,true);}}}
    if(rnd()<0.05){const b=gamepads[0].buttons[Math.floor(rnd()*16)];b.pressed=!b.pressed;}
    if(rnd()<0.02)gamepads[0].axes[0]=[-1,0,1][Math.floor(rnd()*3)];
    if(G.lives<2&&rnd()<0.5)G.lives=3; // ゲームオーバーも起きるように時々だけ補充
    if(i%3000===2999&&G.state==='start'){key('keydown','Enter');key('keyup','Enter');}
    // ときどき状態を強制的に進めて、ショップ/ゲームオーバー/タイトル/地下もランダム入力にさらす
    if(i%1500===700&&G.state==='play'&&!G.menu&&!mario.dead){const r=rnd();harnessWarp=true;
      if(r<0.3&&flagPole.x<LW){mario.x=flagPole.x-60;mario.y=0;mario.vy=0;}                 // → ゴール → ショップ
      else if(r<0.5){G.lives=1;mario.inv=0;G.starTimer=0;mario.y=H+60;}                       // → ゲームオーバー
      else if(r<0.7){const p=pipes.find(q=>q.isWarp&&!q.ceiling&&!q.used);if(p){mario.x=p.x+16;mario.y=p.y-mario.h;mario.vy=0;mario.onGround=true;key('keydown','ArrowDown');}} // → 地下
      else if(r<0.85){key('keydown','Escape');key('keyup','Escape');}                          // → ポーズ
      else {G.timeLeft=3;}                                                                      // → 時間切れ
    }
  });
  for(const k of held)key('keyup',k);gamepads[0]=null;
  return states;
}

// ===== 4) 長時間 =====
function longRun(){
  where='long';const sizes=[];
  for(let round=0;round<6;round++){
    for(const st of STAGES){
      start(st.id);G.lives=99;
      key('keydown','ArrowRight');key('keydown','ShiftLeft');let t=0;
      run(500,i=>{if(--t<=0){key('keydown','Space');t=10+Math.floor(rnd()*25);}if(t===5)key('keyup','Space');if(G.state==='start')return false;});
      releaseAll();
    }
    sizes.push(Object.fromEntries(ARRAYS.map(a=>[a,g[a].length])));
  }
  // 最初と最後のラウンドで大きく増えた配列を報告
  const a=sizes[0],b=sizes[sizes.length-1];
  for(const k of ARRAYS)if(b[k]>a[k]*3+50)once('配列の増加',`${k}: ${a[k]}→${b[k]}（6周後）`);
  return sizes[sizes.length-1];
}

const t0=Date.now();
if(want('god')){
  console.log('=== 無敵走破 ===');
  const list=[...STAGES,{id:STAGES.length+1,ex:1,bgmTheme:'main'},{id:STAGES.length+2,ex:2,bgmTheme:'main'}];
  for(const st of list){const r=godRun(st);console.log(`${r.label.padEnd(5)} ${r.res.padEnd(10)} maxX=${String(r.maxX).padStart(5)} 引上げ=${r.teleports} 前送り=${r.skips} bowser=${r.bowser}`);}
}
if(want('pipes')){
  console.log('=== 全土管 ===');
  for(const st of STAGES){const r=pipeRun(st);console.log(`${r.label} warp=${r.pipes} ${r.detail}`);}
}
if(want('monkey')){
  console.log('=== モンキーテスト ===');
  for(const seed of [1,2,3,4]){const s=monkey(20000,seed);console.log(`seed ${seed}:`,Object.entries(s).map(([k,v])=>`${k}=${v}`).join(' '));}
}
if(want('long')){
  console.log('=== 長時間 ===');const s=longRun();console.log(Object.entries(s).filter(([k,v])=>v>0).map(([k,v])=>`${k}=${v}`).join(' '));
}
console.log(`\n所要 ${((Date.now()-t0)/1000).toFixed(0)}s  検出 ${findings.length}件`);
for(const f of findings)console.log(`- [${f.kind}] ${f.where}: ${f.msg}`);
process.exit(0);
