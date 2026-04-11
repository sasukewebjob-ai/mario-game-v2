# Mario Game v2 - プロジェクト仕様書

## 概要
Vite + Vanilla JS によるモジュール分割版 Mario ゲーム。
旧版（mario-game/index.html）から Vite に移行。ゲームロジックは同一。

## 開発環境
```bash
cd mario-game-v2
npm run dev     # 開発サーバー起動（ホットリロードあり）
npm run build   # 本番ビルド（エラーチェックに使う）
npm run deploy  # ビルド＋GitHub Pages へデプロイ（gh-pages ブランチ更新）
```

## デプロイ
- 公開URL: https://sasukewebjob-ai.github.io/mario-game-v2/
- コマンド: `npm run deploy`（vite build → gh-pages -d dist）
- **コミット後は必ず `npm run deploy` を実行すること**（master に push しただけでは反映されない）

## ファイル構成
```
src/
├── globals.js        ← 定数・配列・G オブジェクト・ゲームオブジェクト
├── builders.js       ← addB, addRow, addStair, addStairD
├── style.css         ← CSS
├── main.js           ← ゲームループ・update・draw・audio・入力
└── levels/
    ├── level1-1.js   ← buildLevel()
    ├── level1-2.js   ← buildLevel2()
    ├── level1-3.js   ← buildLevel3()
    ├── level1-4.js   ← buildLevel4()
    ├── underground.js ← buildUnderground(variant)
    └── level2-1.js   ← 次に追加（まだ未作成）
```

## 変数の書き方ルール（最重要）

### スカラー変数は G.xxx
```javascript
// NG: starTimer = 0
// OK: G.starTimer = 0

G.starTimer    G.ugMode    G.goalSlide    G.checkpointReached
G.checkpoint   G.combo     G.comboTimer   G.savedOW
G.peachChase   G.score     G.coins        G.lives
G.cam          G.frame     G.currentWorld G.currentLevel
G.state        G.timeLeft  G.shakeX       G.shakeY
G.bowserArenaX  // クッパoffscreen登場トリガーX座標（城ステージで設定）
```

### 配列・オブジェクトはそのまま
```javascript
// 配列（globals.js からimportしたもの）
platforms.push(...)   // OK
enemies.length = 0    // OK

// オブジェクト
yoshi.alive = false   // OK
bowser.hp--           // OK
mario.vx = 0          // OK
```

## レベルファイルのテンプレート

```javascript
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,G,H,TILE,LW,BOWSER_STATS} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_2_1(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;
  // ...
  // ★ 新ギミック有効化（必要なものだけ設定）
  // G.darkMode=true;  // 暗闇ステージ
  // gravityZones.push({x:2000,y:0,w:400,h:H});  // 重力反転ゾーン
  // windZones.push({x:1500,y:0,w:600,h:H,force:3});  // 風ゾーン（正=右、負=左）
  // G.chasingWall={x:-200,speed:1.5,triggerX:500,active:false};  // 追いかけ壁
  // platforms.push({x:800,y:H-5*TILE,...,hasMega:true});  // 巨大キノコブロック
  // platforms.push({x:900,y:H-5*TILE,...,hasHammer:true});  // ハンマースーツブロック
}
```

## 新ステージ追加手順（チェックリスト）

1. `src/levels/level2-1.js` を新規作成（上記テンプレート使用）
2. `src/main.js` の import に追加
3. `src/main.js` の goalSlide ハンドラを更新
4. `src/main.js` の `restartCurrentLevel()` にケースを追加
5. `src/main.js` の `drawBG()` に背景を追加（新テーマの場合）
6. `npm run build` でエラーなし確認

## main.js の接続ポイント

### import ブロック（先頭）
```javascript
import {buildLevel} from './levels/level1-1.js';
import {buildLevel2} from './levels/level1-2.js';
// ↑ 新レベルはここに追加
```

### goalSlide 完了ハンドラ
```javascript
else if(G.currentLevel===3){G.currentLevel=4;buildLevel4();...}
// ↓ ここを変更して 2-1 に接続
else{G.state='win';...}
```

### restartCurrentLevel()
```javascript
if(G.currentLevel===1)buildLevel();
else if(G.currentLevel===2)buildLevel2();
else if(G.currentLevel===3)buildLevel3();
else buildLevel4();
// ↓ World 2 追加時はここに分岐追加
```

## クッパ難易度テーブル（BOWSER_STATS）

`globals.js` の `BOWSER_STATS` でワールド1〜8のクッパパラメータを一元管理。

| W | HP | ファイア耐性 | 移動速度 | 火球速度 | 火球角度(vy) | fireTimer | jumpTimer |
|---|-----|------------|---------|---------|------------|-----------|-----------|
| 1 | 3 | 効く | 1.2 | 4.5 | -2.5 | 130 | 240 |
| 2 | 3 | 効く | 1.5 | 5.0 | -3.0 | 110 | 230 |
| 3 | 3 | 効く | 1.8 | 5.5 | -3.5 | 95 | 220 |
| 4 | 4 | 効く | 2.0 | 6.0 | -3.5 | 80 | 210 |
| 5 | 4 | **無効** | 2.2 | 6.5 | -4.0 | 70 | 200 |
| 6 | 4 | **無効** | 2.5 | 7.0 | -4.0 | 60 | 190 |
| 7 | 5 | **無効** | 2.8 | 7.5 | -4.5 | 55 | 180 |
| 8 | 5 | **無効** | 3.0 | 8.0 | -5.0 | 50 | 160 |

- **ファイア耐性**: `fireImmune:true` のとき、マリオのファイアボールはダストパーティクルのみ（ダメージなし）
- **踏みつけ無敵**: 踏みつけ成功後、マリオ・クッパ双方に1秒（60フレーム）の無敵付与（`mario.inv=60`, `bowser.hurtTimer=60`）
- **main.js** が `BOWSER_STATS[G.currentWorld]` を毎フレーム参照し、移動速度・火球パラメータを適用
- **レベルファイル** は `const _bs=BOWSER_STATS[N]` でHP・fireImmune・速度を初期化

### クッパ第2形態（Phase 2）

HPが `Math.floor(maxHp/2)` 以下になると Phase 2 に遷移。一度きり（`phase===1` ガード）。

**遷移演出:**
- 画面揺れ（shakeX/Y=14）、パーティクル30個、低音3連ビープ
- `bowser.phaseTransition=90`（1.5秒間パーティクルが出続ける）

**Phase 2 の変化:**
| 項目 | Phase 1 | Phase 2 |
|------|---------|---------|
| 移動速度 | _bs.speed | _bs.speed × 1.3 |
| ジャンプ高度 | vy=-12 | vy=-14 |
| ジャンプ間隔 | jumpTimer + rand(0-80) | jumpTimer×0.6 + rand(0-40) |
| 火球数 | 3発 | **5発（扇状）** |
| 火球間隔 | fireTimer + rand(0-50) | fireTimer×0.7 + rand(0-30) |
| 着地衝撃波 | なし | **左右に1つずつ** |

**衝撃波（bowserShockwaves）:**
- 着地時に左右2方向に発射（vx=±6, w=28, h=16）
- 90フレーム存続 or 画面外で消滅
- マリオが接触すると即死（inv/star時は無効）
- 画面揺れ＋低音SEを伴う
- `bowserShockwaves` 配列で管理。レベルリセット・enterUnderground・bowser死亡時にクリア

**Phase 2 遷移タイミング（HPごと）:**
| maxHp | 遷移HP | Phase1で耐える回数 |
|-------|--------|-------------------|
| 3 | 1 | 2回 |
| 4 | 2 | 2回 |
| 5 | 2 | 3回 |

### 城ステージのクッパ初期化テンプレート
```javascript
const _bs=BOWSER_STATS[N]; // N=ワールド番号
G.bowserArenaX = XXXX;
G.bowserLeftX  = XXXX;
Object.assign(bowser, {
  alive:true, x:9000, y:H-TILE-72, w:64, h:72,
  hp:_bs.hp, maxHp:_bs.hp, vx:-_bs.speed, vy:0, facing:-1,
  hurtTimer:0, fireTimer:_bs.fireTimer, jumpTimer:_bs.jumpTimer,
  onGround:false, state:'offscreen', deadTimer:0,
  fireImmune:_bs.fireImmune, phase:1, phaseTransition:0
});
```

## クッパ offscreen 登場パターン（城ステージ共通）

城ステージはマリオが階段を完全に降りて地面に着地したとき、クッパが画面右端から入場するデザイン。
`main.js` の Bowser 更新ループで `state==='offscreen'` のとき以下の3条件すべてをチェック：
1. `mario.x > G.bowserArenaX`（アリーナ範囲に到達）
2. `mario.onGround`（着地している）
3. `mario.y + mario.h >= H - TILE*2`（地面レベルまで降りている）
満たされたら `bowser.x = G.cam + W + 150` にセットして `state='walk'` に遷移（画面右端から入場）。
※ 階段の上からファイアを撃って一方的に倒す戦法を防止。
Bowser の左 x 制限は `G.bowserLeftX`（旧ハードコード `6900` から変更済み）。

## 城ステージのレイアウト（登り→高台→アリーナ）

**大型上り階段 + 壁 + 平地アリーナ（addStairDは廃止）**

Bowserはプラットフォームとの水平衝突がない（垂直のみ）。addStairDを設置すると
ジャンプで1段ずつ登られてしまう。壁は視覚的バリアのみ、実際の制限は `G.bowserLeftX`。

```javascript
// ★ 城ステージ共通テンプレート ★
addStair(startX, 10);   // 10段上り階段（top = H-11*TILE）
// アリーナ壁（7ブロック高 = 224px > Bowserジャンプ上限144px）
for(let wy=H-8*TILE; wy<H-TILE; wy+=TILE){ addB(wallX, wy,'brick'); addB(wallX+32, wy,'brick'); }
// アリーナ内 ? ブロック（壁の右側）
platforms.push({x:qX1, y:H-5*TILE, ..., hasMush:true});
platforms.push({x:qX2, y:H-5*TILE, ..., hasStar:true});
G.bowserArenaX = stairRightEdge - 33;  // 階段頂上付近
G.bowserLeftX  = wallX + 64 + 2;       // 壁右端+余裕
```

**各城ステージの座標：**
| ステージ | addStair | 壁x | bowserArenaX | bowserLeftX |
|---|---|---|---|---|
| 1-4 | (6200, 10) | 6520,6552 | 6455 | 6586 |
| 2-3 | (6000, 10) | 6320,6352 | 6255 | 6386 |
| 3-3 | (6400, 10) | 6720,6752 | 6655 | 6786 |
| 4-3 | (6400, 10) | 6720,6752 | 6655 | 6786 |

## 地下バリアント設計ルール（underground.js）

地下＝**ボーナス部屋**。入ったら得するご褒美設計。

### 必須アイテム（全バリアント共通）
- きのこ？ブロック×1（`type:'question', hasMush:true`）
- 隠し1UP×1（`type:'hidden', has1UP:true`）
- コイン30枚以上（コインブロック含む）
- **スターは不要**

### 敵の配置ルール
- 敵は**2〜3体**（弱い敵中心: goomba, koopa）
- ステージのテーマ敵を1体混ぜる程度（ペンギン, テレサ等）
- 落下地点（x < 150）に敵を置かない
- 強敵（ハンマーブロス, ドッスン等）は**最大1体**
- ワンワン・火柱は控えめに（0〜1）

### ？ブロックとレンガの重複禁止
`addRow(x, y, n, 'brick')` と `platforms.push({x, y, type:'question'})` を同じ (x, y) に置かない。

### バリアント命名規則
各ワールドごとに固有バリアント名を使う（共有禁止）：
| ワールド | バリアント名 |
|---|---|
| 1 | `coin`, `goomba`, `mushroom` |
| 2 | `desert1`〜`desert4`, `pswitch_bridge` |
| 3 | `river1`, `river2`, `forest1`, `forest2` |
| 5 | `water1`〜`water4`, `pswitch_wall` |
| 6 | `ice1`〜`ice4` |
| 7 | `fortress1`〜`fortress4` |
| 8 | `airship_goal1`, `airship_goal2`, `bowser_final` |

### 新バリアント追加時
1. `underground.js` に `else if(variant==='xxx'){...}` を追加
2. レベルファイルの `pipes.push({...variant:'xxx'})` で参照
3. ヘルパー関数（`gm`, `kp`, `bz`, `pg`, `te`, `tw`, `hb` 等）を活用

---

## 死亡時のチェックポイント復帰（修正済み）

チェックポイント復帰時に**レベル全体を再構築**する（`_rs.build()` 呼び出し）。
これにより叩いた？ブロック・壊したレンガ・倒した敵がすべて復活する。
復帰後にチェックポイント到達状態（G.checkpointReached, G.checkpoint2.reached）を復元。

## クッパ前チェックポイント（G.checkpoint2）

城ステージにはクッパアリーナ手前 ~400px に第2チェックポイントを配置。
```javascript
G.checkpoint2={x:bowserArenaX-400, y:H-TILE, reached:false};
```
- 到達時に G.checkpoint が更新され、以降の死亡はクッパ手前から復帰
- 描画: drawCheckpoint(G.checkpoint2) で旗マーカー表示
- リセット: 全リセットポイントで `G.checkpoint2=null`

## コインショップ価格

| アイテム | 価格 | 効果 | 複数購入 |
|---------|------|------|---------|
| MUSHROOM | 30 | デカマリオ | × |
| FIRE | 60 | ファイアマリオ | × |
| ICE | 60 | アイスマリオ | × |
| HAMMER | 80 | ハンマーマリオ | × |
| 1UP | 100 | 残機+1 | ○ |
| 1UP x3 | 200 | 残機+3 | ○ |
| STAR 10s | 50 | 10秒無敵（重ね可） | ○ |
| STAR 30s | 500 | 30秒無敵（重ね可） | ○ |
| W-JUMP | 150 | 2段ジャンプ（死ぬまで継続） | ○ |
| MAGNET | 300 | コイン吸引（死ぬまで継続） | ○ |
| RETRY | 100 | 死亡時復活（重ね可） | ○ |
| 1UP x6 | 280 | 残機+6 お得! | ○ |

---

## ワープ土管でワンワン/jumpBlock/パイポが消えるバグ（修正済み）

`enterUnderground()` の `G.savedOW` に `chainChomps`・`jumpBlocks`・`pipos` が**保存されていなかった**ため、
地下から復帰すると `exitUnderground()` でクリアされてそのまま消滅していた。

**修正内容（main.js）：**
```javascript
// enterUnderground: savedOW に3配列を追加
G.savedOW = { ..., chainChomps:[...chainChomps], jumpBlocks:[...jumpBlocks], pipos:[...pipos], ... };

// exitUnderground: savedOW から3配列を復元
chainChomps.length=0; chainChomps.push(...(G.savedOW.chainChomps||[]));
jumpBlocks.length=0;  jumpBlocks.push(...(G.savedOW.jumpBlocks||[]));
pipos.length=0;       pipos.push(...(G.savedOW.pipos||[]));
```

**新しく `G.savedOW` に保存が必要な配列を追加したときも同様に対応すること。**

## タイムアウトで残機全滅するバグ（修正済み）

タイムアウト（TIME=0）時に `killMario()` (force=false) を使っていたため、
star/inv/パワーアップの保護チェーンで死なず、タイマーがマイナスになっても毎秒 killMario が呼ばれ続けて
保護が切れた瞬間に全ライフ分の死亡が発生していた。

**修正内容：**
- `clearInterval(G.timerTick)` でタイマー停止 → `killMario(true)` で確実に1回だけ死亡
- 全てのtimerTick生成箇所（intro開始時 + チェックポイント復帰時）を修正

## 移動足場（ワンウェイプラットフォーム）

移動足場は**すり抜け床**方式。下からジャンプしてもすり抜け、上から落下したときだけ着地できる。

```javascript
// 更新時（毎フレーム）
mp.prevX = mp.x;
mp.prevY = mp.y;

// 衝突判定（main.js）
// 条件: mario.vy>=0（落下中） かつ 前フレームでマリオの底辺が足場上端より上にいた
const prevBot = mario.y - mario.vy + mario.h;
const prevMpY = mp.prevY ?? mp.y;
if(mario.vy >= 0 && prevBot <= prevMpY + 4){
  mario.y = mp.y - mario.h;  // 着地
  mario.x += mp.x - (mp.prevX ?? mp.x);  // 横移動追従
}
```

**ワンウェイ判定のポイント:**
- `mario.vy >= 0`: 上昇中（ジャンプ中）は衝突しない
- `prevBot <= prevMpY + 4`: 前フレームで足場の上にいた（+4は許容マージン）
- これにより下からのジャンプ貫通と、上からの着地を両立

## 現在の実装状況

| ワールド | ステージ | ファイル | 状態 |
|---|---|---|---|
| 1 | 1-1 | `levels/level1-1.js` | ✅ |
| 1 | 1-2 | `levels/level1-2.js` | ✅ |
| 1 | 1-3 | `levels/level1-3.js` | ✅ |
| 1 | 1-4 | `levels/level1-4.js` | ✅ クッパoffscreen・下り階段・城門 |
| 地下 | - | `levels/underground.js` | ✅ |
| 2 | 2-1 | `levels/level2-1.js` | ✅ |
| 2 | 2-2 | `levels/level2-2.js` | ✅ |
| 2 | 2-3 | `levels/level2-3.js` | ✅ クッパoffscreen・下り階段 |
| 3 | 3-1 | `levels/level3-1.js` | ✅ |
| 3 | 3-2 | `levels/level3-2.js` | ✅ 高さ変化パイプ（ph=3/2/4/2）|
| 3 | 3-3 | `levels/level3-3.js` | ✅ クッパoffscreen・下り階段 |
| 4 | 4-1 | `levels/level4-1.js` | ✅ 山脈・強制スクロール(0.8)・動く足場・1UP多め |
| 4 | 4-2 | `levels/level4-2.js` | ✅ 山脈・強制スクロール(1.2)・動く足場・難易度高め |
| 4 | 4-3 | `levels/level4-3.js` | ✅ 山脈城・火柱地獄・クッパHP=5・高速FIRE |
| 5 | 5-1 | `levels/level5-1.js` | ✅ |
| 5 | 5-2 | `levels/level5-2.js` | ✅ |
| 5 | 5-3 | `levels/level5-3.js` | ✅ クッパoffscreen・下り階段 |
| 6 | 6-1 | `levels/level6-1.js` | ✅ 氷平原・G.iceMode・ペンギン初登場・ギャップ×8 |
| 6 | 6-2 | `levels/level6-2.js` | ✅ 氷崖・落下足場・ペンギン多め・ギャップ×9 |
| 6 | 6-3 | `levels/level6-3.js` | ✅ 氷城・クッパHP=4・offscreen登場・ギャップ×6 |
| 7 | 7-1 | `levels/level7-1.js` | ✅ 砦入口・テレサ×4・ドッスン×2・安全スポーン |
| 7 | 7-2 | `levels/level7-2.js` | ✅ 砦深部・テレサ×5・ドッスン×3・安全スポーン |
| 7 | 7-3 | `levels/level7-3.js` | ✅ 砦玉座・テレサ×5・ドッスン×4・クッパHP=5・安全スポーン |
| 8 | 8-1 | `levels/level8-1.js` | ✅ 飛行船・強制スクロール(0.8)・キャノン×5・ワープ→ゴール |
| 8 | 8-2 | `levels/level8-2.js` | ✅ 飛行船・強制スクロール(1.0)・キャノン×6・ハンマーブロス×2・ワープ→ゴール |
| 8 | 8-3 | `levels/level8-3.js` | ✅ 氷城・G.iceMode・テレサ×4・ドッスン×3・ペンギン×4・ワープ→クッパHP=7最終決戦 |

## 強制スクロール（G.autoScroll）

`G.autoScroll > 0` のとき、カメラが毎フレーム `G.autoScroll` px 自動で進む：
```javascript
// main.js camera ロジック
if(G.autoScroll>0){
  G.cam=Math.min(G.cam+G.autoScroll,LW-W);
  if(mario.x<G.cam+20)mario.x=G.cam+20;          // 左端に押される
  if(mario.x+mario.w>G.cam+W-10)mario.x=G.cam+W-10-mario.w; // 右端制限
}else{...通常カメラ...}
```
- 4-1: `G.autoScroll=0.8`（ゆっくり）
- 4-2: `G.autoScroll=1.2`（速め）
- 8-1: `G.autoScroll=0.8`（飛行船入門）
- 8-2: `G.autoScroll=1.0`（飛行船中級）
- 8-3: スクロールなし（氷城）
- **全レベルの reset に `G.autoScroll=0;` が必要**（既存レベルもすべて設定済み）
- **enterUnderground() で `G.autoScroll=0` に自動リセット**（修正済み）

## レベル設計の必須チェックリスト（繰り返しバグ防止）

新しいレベルを作成・修正するたびに以下を必ず確認すること。

### ① Q/hiddenブロックと addRow の座標重複禁止（最重要）
```javascript
// NG: addRow と platforms.push が同じ (x, y) → 2つのブロックが重なる
//     チビマリオだと叩けない・視覚バグの原因
addRow(350, H-5*TILE, 4,'brick');
platforms.push({x:350, y:H-5*TILE, ...type:'question'...}); // ← 重複！
addRow(1100, H-5*TILE, 5,'brick');
platforms.push({x:1100, y:H-5*TILE, ...});  // ← x=1100 が addRow の先頭と重複！

// OK: addRow の終端 x+(n-1)*32 より大きい x か、異なる y に配置
addRow(350, H-5*TILE, 4,'brick');           // bricks at x=350,382,414,446
platforms.push({x:480, y:H-5*TILE, ...});  // x=480 > 446 ✓
// または同じ x でも異なる y でOK
platforms.push({x:350, y:H-7*TILE, ...});  // y を変える ✓
```
`addRow(x, y, n, ...)` は **x, x+32, x+64, ..., x+(n-1)*32** にブロックを作る。
Q/hidden を追加するときは **全 n 個の (x座標, y) の組み合わせ**すべてと異なることを確認。
特殊ブロックは `addRow` に含めず必ず `platforms.push` のみで配置すること。

### ② 地上敵はギャップ外に配置
```javascript
// NG: gaps 配列内の x に goomba/koopa/buzzy を置く → 即落下
{x:2100, t:'goomba'}  // gap が {s:1960, e:2240} ならギャップ内！

// OK: ギャップ位置をコメントに明記し、地面セクション内の x だけ使う
// Ground zones: Z1=0-350, Z2=560-870, Z3=1110-1380, ...
```
飛ぶ敵（parakoopa/lakitu）はギャップ上でOK。

### ③ チェックポイントの x はギャップ外・y は適切に
```javascript
// NG: x がギャップ内 → 空中に浮いて見える
G.checkpoint={x:3900, y:H-TILE, reached:false};  // gap が {s:3700,e:4100} → 空中！

// OK: 地面がある x か、ブロックの上に乗せる
G.checkpoint={x:3470, y:H-5*TILE, reached:false}; // addRow(3450,H-5T)のブロック上
// cp.y はポールの基点。cp.y=H-TILE → 地面, cp.y=H-5*TILE → ブロック上
```

### ④ 全レベルリセット時に G.autoScroll=0 を含める
```javascript
G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
```

### ⑤ コインは300枚以上（城以外のアクションステージ）
ギャップアーチ（各ギャップ10-12枚）＋ 複数ラインで合計300枚以上を目安に。

### ⑥ flagPole.x をステージ終端に合わせる（短縮ステージ）
デフォルト `flagPole.x = LW-500 = 7500`。ステージが短い場合（stair が x<7000）は
レベルファイルで `flagPole` を import して明示的に設定すること。
```javascript
import {... flagPole, ...} from '../globals.js';

// buildLevel 内で stair の直後に設定
addStair(3750, 6);
flagPole.x = 3970;  // stair終端(3750+5*32=3910)+α
```
`startFromStage` / `restartCurrentLevel` / `goalSlide完了` では `flagPole.x=LW-500` にリセット済み（main.js）。
カスタム値を設定するレベルは build 関数内で上書きすれば確実に反映される。

### ⑦ メット（buzzy）はブロック上に配置可
main.js に崖折り返しロジック実装済み。進行方向に地面がない場合に自動で反転するため、
ブロック上に配置しても落ちない。
```javascript
// ブロック上に配置する場合: y = ブロックy - enemy.h
// addRow(160, H-5*TILE) のブロック上 → y = H-6*TILE（1タイル余裕を持つと確実）
{x:192, y:H-6*TILE, w:TILE, h:TILE*0.85, type:'buzzy', ...}
```

### ⑧ ピーチ追跡 peach.vx は負値（マリオに向かって走る）
```javascript
// NG: peach.vx = 3.5  → ピーチ(3.5)がマリオ(3)より速く永遠に追いつけない
// OK: peach.vx = -2.5  → ピーチが左（マリオ方向）に走り約2秒で合流
peach.vx = -2.5;
```
main.js の peachChase ロジックは修正済み。新しい城ステージを追加する場合も同仕様を維持。

### ⑨ サボテン（cactus）の標準サイズ
```javascript
// NG: h:TILE (低くて踏めてしまう)
// OK: h:TILE*4, y:H-5*TILE (4倍高さ・地面基準)
e={x, y:H-5*TILE, w:TILE, h:TILE*4, vx:-0.8, ...type:'cactus'...}
```

### ⑩ スポーン地点（x=0〜350）に敵・頭上ブロックを置かない
```javascript
// NG: スポーン直後にブロック・敵がある → 開始即死の原因
addRow(100, H-5*TILE, 4,'brick');  // x=100〜228 が頭上に → ×
enemies.push({x:200, ...});        // スポーン地点から近すぎる → ×

// OK: 最初のブロック列は x=350 以降、敵は x=500 以降
addRow(350, H-5*TILE, 4,'brick');  // ✓
enemies.push({x:500, ...});        // ✓
// ヨッシーブロックは x=200 付近に配置OK（1個だけ・プレイヤーへの報酬）
```

### ⑪ チェックポイント周辺 ±300px は敵を置かない
```javascript
// チェックポイントを x=3600 に置く場合、敵の x は 3300 未満か 3900 超にすること
// NG: enemies.push({x:3650, ...})   // ← checkpoint±300 内！
// OK: enemies.push({x:3100, ...})   // 3300 未満 ✓
//     enemies.push({x:3980, ...})   // 3900 超 ✓
G.checkpoint={x:3600, y:H-TILE, reached:false};
```
この原則はコメントにも記載する（`// チェックポイントから±300px離す: XXXX〜XXXX には敵を置かない`）。

---

## 氷ワールド（G.iceMode）設計ルール

### G.iceMode フラグの仕組み
```javascript
// globals.js の G オブジェクト
G.iceMode = false;  // デフォルトは false

// 氷レベルの buildLevel_X_X() 先頭で true に設定
G.iceMode = true;

// main.js の以下 4 箇所で自動リセット（false に戻す）:
//   startFromStage() / restartCurrentLevel() / goalSlide完了×2
// enterUnderground() ではリセットしない → 地下でも滑る（仕様）
```

**ice 物理パラメータ（main.js）:**
| 状態 | 加速係数 (_af) | 摩擦係数 (_ff) |
|------|--------------|--------------|
| 通常 | 0.25 | 0.78 |
| 氷上 | 0.042 | 0.9895 |

### 氷レベルのテンプレート
```javascript
export function buildLevel_6_X(){
  // ... 通常 reset ...
  G.autoScroll=0;
  G.iceMode=true;  // ← 氷フラグ ON（最初のリセット後に設定）
  G.waterMode=false;G.swimCooldown=0;
  // ...
}
```
- 通常ステージ: `bgTheme:'ice'` + `bgmTheme:'main'`
- 城ステージ: `bgTheme:'ice_castle'` + `bgmTheme:'castle'`

### ペンギン敵（type:'penguin'）仕様
```javascript
// 配置
enemies.push({
  x: ex, y: H-2*TILE,
  w: TILE, h: TILE,
  vx: -2.0, vy: 0,
  alive: true,
  type: 'penguin',
  state: 'walk',
  walkFrame: 0, walkTimer: 0,
  onGround: false,
  facing: -1
});
```
- **撃破条件**: 踏む → squish死（goombaと同じ）/ ファイアボール → 死
- **崖折り返し**: buzzy と同じ崖回避ロジック（`main.js` に実装済み）
- **向き管理**: `facing` は `vx flip` 時に手動更新。`drawPenguin()` は `e.vx >= 0 ? 1 : -1` で描画方向を決定
- **配置制限**: ギャップ内には置かない（即落下するため）

### 氷ワールドの実装状況
| ステージ | ファイル | bgTheme | 特徴 |
|---|---|---|---|
| 6-1 | `levels/level6-1.js` | `ice` | 氷平原・ペンギン初登場・ギャップ×8（小落とし穴+3） |
| 6-2 | `levels/level6-2.js` | `ice` | 氷崖・ペンギン多め・ギャップ×9（小落とし穴+3） |
| 6-3 | `levels/level6-3.js` | `ice_castle` | 氷城・クッパHP=4・ギャップ×6（小落とし穴+3） |

**6-3 クッパ座標:**
| addStair | 壁x | bowserArenaX | bowserLeftX |
|---|---|---|---|
| (6700, 10) | 7020, 7052 | 6955 | 7086 |

---

## 砦ワールド（World 7）設計ルール

### bgTheme: 'fortress'
暗い石造り内部 + 溶岩グロー + 松明の光。`bgmTheme:'castle'` を使用。

### テレサ（type:'teresa'）仕様
```javascript
// 配置（activated:true 必須 — スリープスポーン無効化）
enemies.push({
  x: ex, y: H-6*TILE,
  w: 28, h: 28,
  vx: -0.5, vy: 0.2,
  alive: true,
  type: 'teresa',
  hiding: false,
  activated: true   // ← 必須！設定しないとカメラ外で即活性にならない
});
```
- **動作**: マリオが**背を向けている**とテレサが背後から追跡。マリオが**正面を向く**とテレサは隠れて停止
- **速度**: 追跡速度 `_ts=1.05`（※旧1.5から30%減済み）
- **撃破条件**: スター / ハンマーのみ（踏みつけ不可・ファイアボール・アイスボール免疫）
- **隠れ判定**: `_mFacingBoo` = `(facing===1&&_tdx<0)||(facing===-1&&_tdx>0)` → マリオがテレサの方を向いている → hiding=true、衝突無効
- **隠れ/追跡距離**: 両方500px（旧: 隠れ320/追跡500でギャップがあり向きに関係なく追ってくるバグがあった）
- **配置**: ギャップ内でも配置可（浮遊するため落下しない）
- **⚠️ 過去バグ**: `_tdx=mario.x-teresa.x`なのでテレサが右なら_tdx<0。facing===1のとき`_tdx>0`で判定すると符号が逆になる

### ドッスン（type:'thwomp'）仕様
```javascript
// 配置（天井付近に設置・baseY は自動設定）
enemies.push({
  x: ex, y: TILE,        // y=TILE（天井付近）
  w: TILE*2, h: TILE*2,  // 2×2タイル
  vx: 0, vy: 0,
  alive: true,
  type: 'thwomp',
  state: 'idle',
  waitTimer: 0
  // activated は不要（通常のスリープスポーンでOK）
});
```
- **動作**: idle → fall（高速落下）→ wait（着地後50f待機）→ rise（ゆっくり上昇）→ idle
- **トリガー**: マリオが水平方向で一致 && マリオの y > thwomp の底辺
- **撃破条件**: スターのみ（踏みつけ不可・ファイアボール免疫）
- **着地時**: `G.shakeX=6;G.shakeY=6;` で画面揺れ + 低音SFX
- **配置注意**: y=TILE（32px）が標準。地面がある x に配置すること
- **ブロック禁止**: ドッスンの x 範囲（x〜x+64）の**真下には一切ブロックを置かない**（addRow/platforms.push/隠しブロック含む）。ブロックがあると地面まで落ちずにそこで止まってしまう

### World 7 座標（7-3 クッパ）
| addStair | 壁x | bowserArenaX | bowserLeftX |
|---|---|---|---|
| (6500, 10) | 6820, 6852 | 6755 | 6886 |

---

## 飛行船ワールド（World 8）設計ルール

### bgTheme: 'airship'
暗黒の夜空 + 星 + 暗雲 + 稲光フラッシュ。`bgmTheme:'castle'` を使用。

### 構造
- **強制スクロール** + **地面なし**（ギャップ落下=死）
- 船の甲板 = ground タイル（H-TILE）、構造物 = brick タイル
- 船と船の間はギャップ（移動足場で渡る）
- 最終エリアにワープパイプ → 地下ゴール部屋 or クッパ部屋

### ゴールパイプ方式（8-1, 8-2）
```javascript
// ワープパイプ（ゴールへ）
pipes.push({x:XXXX, y:H-TILE-3*TILE, w:TILE*2, h:3*TILE,
  bounceOffset:0, isWarp:true, variant:'airship_goal1'});
flagPole.x = LW+1000;  // flagPole無効化
```
underground.js の `airship_goal1` / `airship_goal2` バリアントにゴールパイプ（`isGoalPipe:true`）あり。

### クッパ最終決戦（8-3）
```javascript
// ワープパイプ（クッパ部屋へ）
pipes.push({...isWarp:true, variant:'bowser_final'});
```
underground.js の `bowser_final` バリアントで:
- `bowser.state='walk'`（offscreenではなく即座に戦闘開始）
- `G.bowserRightX = W-TILE*3`（地下部屋の右境界）
- `bowser.hp=7`（最高HP）

### main.js の修正点（World 8 対応）
- `enterUnderground()` で `G.autoScroll=0` を自動リセット
- Bowser 右端制限: `G.bowserRightX||7750` で動的に設定可能
- exitUnderground: `G.state==='play'&&!G.peachChase` ガードで地下クッパ戦中の誤発動防止

---

## 新アクション

### ダッシュジャンプ
走行中のジャンプは `|mario.vx| * 0.15`（最大1.5）だけvy追加。速いほど高く飛ぶ。

### 壁キック
- 空中で壁に接触すると `mario.wallContact` が設定される（8フレーム猶予）
- 猶予中にジャンプキー → vy=-13, vx=壁と反対方向に5で跳ね返る
- `cX()` 関数内で壁接触を検出

### ヒップドロップ（スタンプ）
- 空中で↓キー（mario.vy>0 時）→ `mario.hipDrop=true`, vy=16で急降下
- 着地時: 画面揺れ、周囲敵を倒す、ビッグマリオならブロック破壊
- クッパへのヒップドロップ: **2倍ダメージ**（1000点）
- パイプ入場とは競合しない（パイプはonGround時のkeydown、ヒップドロップは空中のupdate判定）

---

## コイン消費ショップ

ステージクリア後（flagPole / pipeGoal / **ボス撃破後**）にショップ画面（`G.state='shop'`）が表示される。

- **操作**: ←→↑↓選択、A/Space購入、B/ESCキャンセル、START/Enter次ステージ
- ゲームパッド接続時は「A:購入 B:キャンセル START:次へ」と表示
- `_SHOP_ITEMS` 配列と `_SINGLE_ONLY` セットで購入ロジックを管理
- `_gpShopBuy()` / `_gpShopNext()` が共通関数（キーボード・ゲームパッド両対応）

---

## 演出機能

### コンボカウンター演出強化
- コンボ数に応じてフォントサイズ拡大（16px → 最大40px）
- 色変化: 2x=オレンジ, 3-4x=赤, 5x+=金
- 3x以上でスコア倍率表示、5x以上で「1UP!!」表示

### ステージ進入時の世界名表示
イントロ画面に「- PLAINS -」「- MOUNTAIN -」等のワールドテーマ名をフェードイン表示。
ワールド名マッピング: 1=PLAINS, 2=DESERT, 3=SEASIDE, 4=MOUNTAIN, 5=OCEAN, 6=ICE LAND, 7=FORTRESS, 8=AIRSHIP

### ステージクリア時の花火
ゴール時のスコア下1桁が1, 3, 6のとき、6連花火（各15パーティクル）を0.3秒間隔で打ち上げ。

### 天候エフェクト
- mountain / mountain_castle / airship テーマ: 雨（40本の斜線パーティクル）
- airship テーマ: 追加で稲光フラッシュ（600フレームに1回）
- drawBG() 直後に描画

### ボス戦BGM Phase2切り替え
Phase2遷移時に `stopBGM(); startBGM();` でBGMを再起動。
`scheduleBGM()` が `bowser.phase===2` を検出し `CASTLE_P2_NOTES`（1オクターブ上・テンポ2倍）を使用。

### スライディング
- ダッシュ(Shift)+地上+↓キー かつ `|mario.vx|>3` で発動
- `mario.h` を縮小（big:24, small:20）、30フレーム持続
- スライド中に敵にヒット → 撃破（koopa→shell発射）
- 終了時に天井チェック：ブロックがあれば自動延長（5F猶予）

### 残像エフェクト
- スター or ダッシュ(vx>4)時にマリオの残像を最大5フレーム分描画
- `G.afterimages` 配列で管理、alpha 0.35 → 0.8倍減衰
- スター中は虹色（hueシフト）

### ミニマップ
- 画面上部に4px高のバー（`G.state==='play'` かつ非地下時のみ）
- 赤: マリオ位置（mario.x/LW）、緑: ゴール位置

### 撃破カウンター
- `G.stageKills`（ステージ単位）と `G.totalKills`（累計）
- 画面右下に `KO:N` 表示（プレイ中のみ）
- ステージ開始時に stageKills=0 リセット

### BGMミュート/音量
- Mキー: ミュートON/OFF
- +/-キー: 音量10%刻み調整（0〜100%）
- `G.bgmMuted`, `G.bgmVolume` で管理
- ミュート時は右上に `♪ MUTE`、音量変更時は `♪ XX%` 表示

### ステージクリア統計
- ショップ画面上部に表示: TIME / COINS / KO / MAX COMBO
- `G.stageCoinsStart` でステージ開始時のコイン数を記録、差分で表示

### コイン磁石
- ショップで40コイン購入 → 次ステージで `G.coinMagnet=true`
- 半径150px以内のコインがマリオに吸い寄せられる
- 吸引速度は距離に反比例（近いほど速い、最大5px/frame）

### コイン消費ショップ（拡張版）

**コイン上限: 999枚**（100枚での自動1UPは廃止）

| アイテム | 価格 | key | 効果 | 複数購入 |
|---------|------|-----|------|---------|
| きのこ | 30 | mushroom | デカマリオで開始 | × (SOLD) |
| ファイア | 60 | fire | ファイアマリオで開始 | × (SOLD) |
| アイス | 60 | ice | アイスマリオで開始 | × (SOLD) |
| ハンマー | 80 | hammer | ハンマーマリオで開始 | × (SOLD) |
| 1UP | 100 | 1up | 残機+1 | ○ |
| 1UP x3 | 200 | 1upSet | 残機+3 | ○ |
| スター10秒 | 50 | star10 | 10秒無敵（重ね可） | ○ |
| スター30秒 | 500 | star30 | 30秒無敵（重ね可） | ○ |
| W-JUMP | 150 | doubleJump | 空中2段ジャンプ（死ぬまで） | ○ |
| MAGNET | 300 | magnet | コイン吸引（死ぬまで） | ○ |
| RETRY | 100 | retryHeart | 死亡時復活（重ね可） | ○ |
| 1UP x6 | 280 | 1upSet6 | 残機+6 お得! | ○ |

- **2段6列レイアウト**、↑↓←→で選択
- `_SINGLE_ONLY` = mushroom, fire, ice, hammer のみ1回購入制限
- それ以外は何度でも購入可能（カウント表示）
- fire > ice > mushroom の優先度（複数買った場合上位が適用）
- **効果の持続**: W-JUMP, MAGNET, RETRY はステージ跨ぎで継続、**死亡時にリセット**
- **スター**: 購入数 × 秒数を加算（star10を2個買えば20秒）
- **リトライ**: G.retryHeart は数値（購入数=復活回数）、`killMario()` で1消費
- アクティブ効果（W-JUMP/MAGNET/RETRY）は画面右下にテキスト表示
- ショップ画面内にもアクティブ効果を「ACTIVE:」行で表示

---

## 新パワーアップシステム（v2追加）

### mario.power の全状態
| 値 | 取得元 | 攻撃（Zキー） | 被ダメージ |
|---|--------|--------------|-----------|
| `'none'` | 初期状態 | なし | 死亡 |
| `'big'` | キノコ | なし | → none |
| `'fire'` | ファイアフラワー | ファイアボール | → big |
| `'ice'` | アイスフラワー（氷ワールド） | アイスボール（敵凍結） | → big |
| `'hammer'` | ハンマースーツ（hasHammer） | 放物線ハンマー | → big |

### アイスフラワー（G.iceMode時にファイアフラワー→自動変換）
- アイスボール: vx=7, バウンス5回, 敵を凍結（240f=4秒）
- 凍結敵: 動かない、足場として使える、踏みor横蹴りで粉砕（400pts + コイン3枚散乱）
  - 散乱コインは放物線で飛び、触れると+100pts/枚。45f後に消滅。type='frozendrop'
- クッパにも有効（fireImmuneでない場合）: 1HP + 90f hurtTimer（通常より長い）
- `iceBalls[]` 配列で管理、最大2発

### ハンマースーツ（hasHammer:true ブロック）
- 放物線ハンマー: vx=5.5, vy=-10, 重力0.4
- **全敵タイプにダメージ**（buzzy/teresa/thwomp含む）300pts
- レンガブロック破壊可能
- クッパにも有効（fireImmune無視）: 1HP + 70f hurtTimer
- `marioHammers[]` 配列で管理、最大2発

### 巨大キノコ（hasMega:true ブロック）
- `G.megaTimer=480`（8秒）の一時バフ
- 敵は接触即死、レンガは接触破壊
- 描画: 1.6倍スケール + 虹オーラ
- 被ダメージで即終了（元のパワーに復帰）
- `G.megaPrevPower`/`G.megaPrevBig` で元状態を保存

## 新ステージギミック（v2追加）

### 暗闇モード（G.darkMode）
レベルファイルで `G.darkMode=true` を設定。マリオ周囲のみスポットライト。
- 半径: none=130, fire=180, ice=170, hammer=160, mega=220
- ファイアボール/アイスボールが追加光源になる
- drawのctx.restore後にradialGradientオーバーレイ

### 重力反転ゾーン（gravityZones）
```javascript
gravityZones.push({x:2000, y:0, w:400, h:H});
```
- ゾーン内で `G.gravityFlipped=true` → GRAVITY が反転
- マリオは天井に着地、上下反転描画
- 紫の破線ボーダー + 上向き矢印で視覚表示

### 風ゾーン（windZones）
```javascript
windZones.push({x:1500, y:0, w:600, h:H, force:3}); // 正=右風、負=左風
```
- `mario.vx += force * 0.15` 毎フレーム
- 斜め白線パーティクル（windParticles）で風向き表示
- 半透明の青白オーバーレイ

### 追いかけ壁（G.chasingWall）
```javascript
G.chasingWall = {x:-200, speed:1.5, triggerX:500, active:false};
```
- `mario.x > triggerX` で起動、以降毎フレーム `x += speed`
- `mario.x < wall.x` で `killMario(true)` 即死
- 赤黒グラデーション + 先端に炎エフェクト

### 新ブロックプロパティ
```javascript
platforms.push({x, y, w:TILE, h:TILE, type:'question', hit:false, hasMega:true, bounceOffset:0});
platforms.push({x, y, w:TILE, h:TILE, type:'question', hit:false, hasHammer:true, bounceOffset:0});
```

## killMario(force) の仕様

```javascript
killMario()        // 通常: star/inv/ヨッシー/パワーアップ/リトライハート保護あり
killMario(true)    // 強制: 全保護スキップ（穴落下・タイムアウト・追いかけ壁）
```

### 保護チェーン（force=false のとき順にチェック）
1. `starTimer>0 || mario.inv>0` → 何もしない
2. `yoshi.mounted` → ヨッシー逃走（dismountYoshi）、mario.inv=120
3. `megaTimer>0` → メガ解除、mario.inv=120
4. `power==='fire'|'ice'|'hammer'` → power='big'、mario.inv=120
5. `power==='big'` → power='none'、big=false、mario.inv=120
6. `retryHeart>0` → retryHeart--、その場復活（mario.inv=180）
7. 上記すべて不成立 → **実際の死亡**（lives--）

### タイムアウト（TIME=0）
- `clearInterval(G.timerTick)` → `killMario(true)` で**確実に1回死亡**
- パワーアップ/スター/リトライハートの保護を全スキップ
- 死亡後はチェックポイント or ステージ最初から再開（通常死亡と同じ）
- タイムは復帰時に400にリセット
- ⚠️ `killMario()` (force=false) をタイムアウトに使うと、inv>0 で弾かれて死なないバグが再発する

### 死亡時のリセット
- 特殊効果: `G.coinMagnet=false; G.doubleJump=false; G.retryHeart=0;`
- ステージ跨ぎで継続する効果も**死亡で全リセット**

---

## 砂嵐モード（G.sandstormMode）- W2専用

W2（砂漠）の全ステージで有効。レベルファイルで `G.sandstormMode=true` を設定。
- **視覚**: 茶色半透明オーバーレイ（脈動）+ 砂パーティクル40個（右方向）+ 突風時の砂煙帯
- **物理**: 毎フレーム微小な右方向の力 `mario.vx += sin(frame*0.01)*0.5+0.3 * 0.04`
- リセット: 全リセットポイントで `G.sandstormMode=false`

## 潮モード（G.tideMode）- W3専用

W3（海辺）の通常ステージで有効（城ステージは室内なのでなし）。`G.tideMode=true` を設定。
- **潮位**: `G.tideLevel = H-TILE + (cos(frame*0.005)-1)*TILE*2` → H-TILE（干潮）〜H-5*TILE（満潮）を約21秒周期で往復
- **物理**: マリオが水面下のとき落下速度×0.88、最大落下4、微浮力-0.08
- **視覚**: 青半透明オーバーレイ（水面下）+ 波線アニメ + 泡パーティクル
- リセット: `G.tideMode=false;G.tideLevel=H`

## Pスイッチ（G.pswitchTimer）

ステージ内に配置された青い「P」ブロックを叩く/踏むと発動。10秒間、レンガ↔コイン変換が起こる。

### 基本仕様
- **発動**: hitBlock（下から叩く）または踏みつけ（上から着地）で起動
- **持続時間**: 600フレーム（10秒）
- **効果**: レンガブロック（未ヒット）→ 回収可能なコインに変化、未回収コイン → 固い足場ブロック（pswitch_block）に変化
- **終了時**: 未回収のコインレンガは元のレンガに復帰、固まったコインは元のコインに復帰
- **BGM**: 発動中は専用BGM（PSWITCH_NOTES）に切り替わる（starTimer より低優先、waterMode より高優先）
- **残り3秒**: ティック音（pswitch_tick）が30フレーム毎に鳴る
- **タイマーUI**: 画面上部中央に青いバー + 残り秒数表示。残り3秒で赤点滅

### 実装構造
```javascript
// globals.js
G.pswitchTimer: 0,   // 残りフレーム数（0=非アクティブ）
G._psCoins: null,    // レンガから変化したコインアイテム配列
G._psBricks: null,   // コインから変化した元コイン参照配列

// main.js
activatePSwitch(p)   // Pスイッチ起動（レンガ除去→_psCoins化、コイン非表示→pswitch_block足場追加）
deactivatePSwitch()  // Pスイッチ終了（_psCoins→レンガ復帰、pswitch_block除去→コイン復帰）
```

### ブロックタイプ
| type | 説明 |
|------|------|
| `pswitch` | Pスイッチブロック。青い「P」表示。hit=true で押下状態（薄くなる） |
| `pswitch_block` | Pスイッチ中にコインから変化した一時足場。青い半透明ブロック。`_psTemp:true` マーク付き |
| `pswitch_used` | 使用済みPスイッチ（activatePSwitch内でtypeを変更） |

### レベルファイルでの配置
```javascript
// Pスイッチブロックを配置（?ブロックのように1個ずつpushで）
platforms.push({x:128, y:H-5*TILE, w:TILE, h:TILE, type:'pswitch', hit:false, bounceOffset:0});
```

### 地下Pスイッチパズルバリアント

| variant | 名前 | パズル内容 |
|---------|------|-----------|
| `pswitch_bridge` | ブリッジ | ギャップの上にコインが並ぶ → Pスイッチで足場化 → 渡って出口へ |
| `pswitch_wall` | ウォール | レンガ壁が出口を塞ぐ → Pスイッチでコイン化 → 回収して通過 |

### リセット・遷移時の処理
- `startFromStage()` / `restartCurrentLevel()`: `G.pswitchTimer=0; G._psCoins=null; G._psBricks=null;`
- `enterUnderground()`: Pスイッチ発動中なら `deactivatePSwitch()` してから savedOW 保存
- `exitUnderground()`: Pスイッチ状態をクリア（地下のPスイッチ効果は地上に持ち込まない）

### scheduleBGM 優先順位（更新後）
```
G.ugMode > G.starTimer > G.pswitchTimer > G.waterMode > castle > THEME_NOTES
```

### 配置済みステージ
| ステージ | パイプvariant | パズル |
|---------|-------------|--------|
| 2-1 | `pswitch_bridge` | コイン橋渡し |
| 5-1 | `pswitch_wall` | レンガ壁突破 |

## レベルデザイン改善（v2大規模改修）

### ブロック高さバリエーション
全24ステージで H-5*TILE / H-7*TILE の2パターンだけでなく、
H-3*TILE, H-4*TILE, H-6*TILE, H-8*TILE, H-10*TILE を使用。
各ワールドで「地形プロファイル」が異なる：
- W1: 緩やかな丘（H-4T, H-6T）
- W2: 砂漠台地と渓谷（H-3T, H-8T）
- W3: 波のような高低差（H-4T, H-6T, H-8T）
- W4: 山岳の極端な高低差（H-3T, H-8T）
- W5: 水中棚（H-4T, H-6T, H-8T）
- W6: 氷棚（H-4T, H-8T, H-10T）
- W7: ダンジョン層（H-4T, H-6T, H-8T）
- W8: 船甲板（H-3T, H-6T, H-8T）

### ギャップサイズの緩急
- 各ステージにマイクロギャップ（60-96px）を1つ追加
- 既存ギャップの1つを80-150px拡張
- 隣接するギャップのサイズが異なるよう配慮

### コイン配置の多様化
従来の一直線パターン（`for(j) push({x:START+j*SPACING, y:固定})`）を廃止し：
- **クラスター**: ギャップ際に3-5枚（リスク/リワード）
- **縦列**: 同x座標にy=H-3T〜H-5Tの3枚スタック
- **リスクコイン**: H-2*TILE（超低空）やH-10T/H-11*TILE（超高空）
- **ご褒美コイン**: 新ブロック層の上に少数配置
- ギャップアーチ（sin()パターン）は維持

## ゲームパッド対応（実装済み）

iBUFFALO Classic USB Gamepad 等のSNES型USBコントローラーに対応。
`main.js` の `pollGamepad()` でGamepad APIをフレーム毎にポーリング。

### ボタンマッピング
| ボタン | ゲーム操作 | gpad プロパティ |
|--------|-----------|----------------|
| 十字キー | 移動/ヒップドロップ(↓) | gpad.left/right/up/down |
| B (底面) | ダッシュ | gpad.b (buttons[0]) |
| A (右) | ジャンプ | gpad.a (buttons[1]) |
| Y (左) | ファイア/アイス/ハンマー | gpad.y (buttons[2]) |
| X (上) | ヨッシーの舌/卵 | gpad.x (buttons[3]) |
| START | 開始/ポーズ/次ステージ | gpad.start (buttons[7]) |
| SELECT | - | gpad.select (buttons[6]) |
| L | 音量ダウン | gpad.l (buttons[4]) |
| R | 音量アップ | gpad.r (buttons[5]) |

### 実装構造
- `gpad` オブジェクト: ゲームパッドのボタン状態（毎フレーム更新）
- `_gpPrev` オブジェクト: 前フレームの状態（just-pressed検出用）
- 継続入力: `btn.left||gpad.left` 等で既存チェックにOR追加
- イベント入力: `pollGamepad()` 内で `jp()` ヘルパーでjust-pressed検出、各stateごとにアクション発火
- ショップロジック: `_gpShopBuy()`, `_gpShopNext()` に共通化（キーボードも同関数を使用）

### ボタンマッピング変更方法
`main.js` の `pollGamepad()` 内で `gp.buttons[N]` のインデックスを変更する。
iBUFFALOが別のマッピングで認識された場合、buttons[0]〜[3] の割り当てを入れ替える。

## 実装予定（TODO）

- なし（現時点）

---

## スキル一覧
```
.claude/skills/
├── mario-new-level.md   ← 新ステージ追加（/mario-new-level）
└── mario-feature.md     ← 新機能追加（/mario-feature）
```
