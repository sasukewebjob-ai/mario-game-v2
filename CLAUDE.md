# Mario Game v2 - プロジェクト仕様書

## 概要
Vite + Vanilla JS によるモジュール分割版 Mario ゲーム。
旧版（mario-game/index.html）から Vite に移行。ゲームロジックは同一。

## 開発環境
```bash
cd mario-game-v2
npm run dev     # 開発サーバー起動（ホットリロードあり）
npm run build   # 本番ビルド（エラーチェックに使う）
```

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
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
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

## クッパ offscreen 登場パターン（城ステージ共通）

1-4 / 2-3 / 3-3 の城ステージは、クッパが最初から見えないデザイン：
```javascript
// レベルファイル末尾（城ステージのみ）
G.bowserArenaX = 7000;  // Mario がこの X を超えたらクッパが登場
Object.assign(bowser, {
  alive: true,
  x: 9000,              // 画面外（LW=8000 より右）
  state: 'offscreen',   // 専用ステート — physics をスキップ
  ...
});
```
`main.js` の Bowser 更新ループで `state==='offscreen'` のとき `mario.x > G.bowserArenaX` をチェックし、
満たされたら `bowser.x = G.cam + W + 150` にセットして `state='walk'` に遷移（画面右端から入場）。

## 城ステージのレイアウト（登り→くぐり→降り→戦闘）

ファイアボール入口チーズ対策として、城門の**内側**に下り階段を設置済み：
```javascript
addStair(6300, 5);      // 上り階段（城門手前）
// 城門壁（y=192-255 が通路）
[0,32,64,96,128,160,256,288,320,352,384].forEach(wy=>{ addB(6560,wy,'brick'); addB(6592,wy,'brick'); });
addStairD(6624, 5);     // 下り階段（城門内側）— 降りるまでクッパが出現しない
G.bowserArenaX = 7000;  // Mario が x=7000 に到達して初めてクッパ登場
```

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

## 移動足場でマリオを一緒に動かす仕組み

`main.js` の移動足場ループで `mp.prevX` を保存し、Mario が乗っているときに差分を加算：
```javascript
// 更新時（毎フレーム）
mp.prevX = mp.x;
mp.x = mp.ox + Math.sin(G.frame * 0.015 * mp.spd) * mp.range;

// 衝突時（Mario が上に乗っているとき）
mario.x += mp.x - (mp.prevX ?? mp.x);
```

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
- **全レベルの reset に `G.autoScroll=0;` が必要**（既存レベルもすべて設定済み）

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

---

## スキル一覧
```
.claude/skills/
├── mario-new-level.md   ← 新ステージ追加（/mario-new-level）
└── mario-feature.md     ← 新機能追加（/mario-feature）
```
