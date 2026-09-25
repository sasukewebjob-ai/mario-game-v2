// メニュー・設定・セーブのテスト（ポーズメニュー / 設定 / キーコンフィグ / すぐリトライ / セーブ3スロット）
// 使い方: node tools/menu-test.mjs
import {installEnv,step,key,storage} from './smoke/env.mjs';
installEnv();
// 旧形式のセーブを用意して、スロット1への移行を確認する
storage.set('mario_v2_save',JSON.stringify({score:1234,coins:50,lives:4,nextStageId:5,clearedStages:[1,2,3,4],stageTimes:{1:90},character:'mario'}));
const {G,mario,H,TILE}=await import('../src/globals.js');
const {STAGES}=await import('../src/stages.js');
await import('../src/main.js');
const input=await import('../src/input.js');
const save=await import('../src/save.js');

let fails=0;
const ok=(cond,msg)=>{console.log(`${cond?'✅':'❌'} ${msg}`);if(!cond)fails++;};
const run=n=>{for(let i=0;i<n;i++)step();};
const press=(code,n=1)=>{key('keydown',code);run(n);key('keyup',code);};
function start(id){G.menu=null;G.paused=false;G.state='start';G.selectedStage=id;run(25);press('Enter');run(200);}

// --- セーブ移行と記録 ---
ok(save.getProgress(0)?.nextStageId===5&&!storage.has('mario_v2_save'),'旧セーブがスロット1へ移行される');
ok(G.clearedStages.length===4&&G.stageTimes[1]===90,'起動直後からタイトルに★とベストタイムが表示される（CONTINUE前でも）');

// --- ポーズメニュー ---
start(1);press('KeyP');
ok(G.menu?.type==='pause'&&G.paused,'P でポーズメニューが開く');
const x0=mario.x;key('keydown','ArrowRight');run(30);key('keyup','ArrowRight');
ok(mario.x===x0,'ポーズ中はマリオが動かない');
press('Escape');ok(!G.menu&&!G.paused,'ESC でゲームに戻る');

// --- 設定: 効果音の音量を下げて保存される ---
press('KeyP');press('ArrowDown');press('ArrowDown');press('Space'); // RESUME→RETRY→SETTINGS
ok(G.menu?.type==='settings','ポーズ → SETTINGS が開く');
const se0=G.seVolume;press('ArrowDown');press('ArrowLeft');
ok(G.seVolume<se0&&JSON.parse(storage.get('mario_v2_opts')).se===G.seVolume,`効果音の音量を変えると保存される (${se0}→${G.seVolume})`);
for(let i=0;i<6;i++)press('ArrowDown'); // SE(1)→KEY CONFIG(7)
press('Space');ok(G.menu?.type==='keys','SETTINGS → KEY CONFIG が開く');
press('Space');ok(G.menu.waiting,'キー欄で決定 → 入力待ち');
press('KeyQ');ok(input.isBound('KeyQ','left')&&!G.menu.waiting,'押したキー(Q)が LEFT に割り当てられる');
press('Space');press('Enter');ok(G.menu.msg.includes('使えません'),'予約キー(Enter)は割り当てられない');press('Escape');
press('Escape');press('Escape');press('Escape');ok(!G.menu&&!G.paused,'ESC を重ねてゲームへ戻る');
input.resetAndSaveBinds();

// --- ポーズ → RETRY（確認 → 残機-1で再開） ---
{const lv=G.lives;press('KeyP');press('ArrowDown');press('Space');ok(G.menu?.type==='confirm','RETRY で確認ダイアログ');
 press('ArrowLeft');press('Space');run(10);ok(mario.dead&&!G.menu,'「はい」でミス扱いになる');
 run(30);const dt=G.deathTimer;press('Space');
 ok(dt>1&&G.deathTimer===0&&G.state==='intro',`ミス演出はキーボードのジャンプで早送りでき、ミス画面を挟まず開始画面へ (deathTimer ${dt}→${G.deathTimer}, state=${G.state})`);
 ok(G.lives===lv-1,`残機が1減る (${lv}→${G.lives})`);}

// --- ポーズ → TITLE ---
start(1);press('KeyP');for(let i=0;i<4;i++)press('ArrowDown');press('Space');press('ArrowLeft');press('Space');run(5);
ok(G.state==='start'&&!G.menu&&!G.paused,'ポーズ → TITLE（確認「はい」）でタイトルへ戻る');

// --- タイトル: スロット切替 ---
G.selectedStage=STAGES.length+5;press('Space');
ok(G.saveSlot===1&&G.clearedStages.length===0,'SLOT を押すとスロット2へ（記録も切り替わる）');
G.selectedStage=STAGES.length+5;press('Space');press('Space');ok(G.saveSlot===0&&G.clearedStages.length===4,'一周してスロット1に戻る');

// --- 旗ゴールでクリア記録がすぐ保存される ---
start(STAGES.find(s=>s.world===2&&s.level===1).id);
const {flagPole}=await import('../src/globals.js');
mario.x=flagPole.x-120;mario.y=0;mario.vy=0;G.starTimer=600;key('keydown','ArrowRight');run(600);key('keyup','ArrowRight');
ok(save.getRecords(0).clearedStages.includes(4),'クリアした時点で★がスロットに保存される');
ok(save.getProgress(0)?.nextStageId===5,'ショップに入った時点で進行がセーブされる');

// --- ゲームオーバーでも★は消えない ---
{const cleared=save.getRecords(0).clearedStages.length;G.state='over';G._stateFrame=G.frame-100;press('Space');run(5);
 ok(save.getRecords(0).clearedStages.length===cleared&&!save.getProgress(0),'ゲームオーバー後: 進行は消えるが★は残る');}

// --- ショップで買ったW-JUMPがセーブ/ロードで引き継がれる ---
start(1);G.doubleJump=true;G.coinMagnet=true;mario.power='fire';mario.big=true;G.nextStage=STAGES[1];
// saveGame はショップ経由でしか呼ばれないので、ゴールまで進める
mario.x=flagPole.x-120;mario.y=0;mario.vy=0;G.starTimer=600;key('keydown','ArrowRight');run(600);key('keyup','ArrowRight');
G.state='start';G.selectedStage=STAGES.length+3;run(25);press('Space');run(5);
ok(G.doubleJump&&G.coinMagnet&&mario.power==='fire',`CONTINUE でW-JUMP・MAGNET・パワーアップも復元 (power=${mario.power})`);

console.log(fails?`\n失敗 ${fails} 件`:'\nすべて成功');
process.exit(fails?1:0);
