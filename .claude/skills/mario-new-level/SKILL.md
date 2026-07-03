---
name: mario-new-level
description: マリオゲーム（Vite版）に新しいステージを追加する。stages.js登録→ファイル作成→ブロック重複チェックまで行う。
---

新ステージの追加を依頼されました: $ARGUMENTS

## ⚠️ 毎回必ず行うこと（指示がなくても）

1. **stages.js に登録** → import + STAGES 配列への1行追加（goalSlide/restart/BGMは自動）
2. **ブロック重複チェック** → `addRow` と `platforms.push` が同じ (x,y) を使っていないか確認
3. **地上敵をギャップ外に配置** → gaps.some() でギャップ内に敵が入っていないか確認
4. **土管周辺に敵を置かない** → 土管入口・出口から 200px 以内は空ける
5. **コイン300枚以上** → 城以外のアクションステージは必須

---

## ステップ1: 既存コード確認

- `src/stages.js` の末尾（最後の id 番号・最後の world/level 確認）
- 直前のステージファイル（難易度・ギミック密度の参考）
- `src/main.js` の `drawBG()` に新 bgTheme が必要か確認

## ステップ2: ステージ設計

### テーマと難易度
- X-1: 易〜中、ワールド導入
- X-2: 中、ギミック組み合わせ
- X-3: 中〜難、ギャップ多め / 城テーマ（boss）

### 利用可能な bgTheme 一覧
| bgTheme | 説明 |
|---|---|
| `'sky'` | 青空（デフォルト） |
| `'evening'` | 夕方 |
| `'castle'` / `'castle3'` | 暗い城（溶岩グロー）|
| `'desert'` / `'desert2'` | 砂漠 |
| `'beach'` | 海辺 |
| `'underwater'` | 水中 |
| `'mountain'` | 山脈 |
| `'mountain_castle'` | 山岳城 |
| `'ice'` | 氷平原 |
| `'ice_castle'` | 氷の城（オーロラ）|
| `'fortress'` | **砦（暗い石造り・松明・溶岩）** |

### bgmTheme
- `'main'` → 通常BGM
- `'castle'` → 城BGM

## ステップ3: ファイル作成

### import ヘッダー（必ずこの形式）
```javascript
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  chainChomps,jumpBlocks,pipos,gravityZones,windZones,
  yoshi,peach,bowser,flagPole,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';
```

### リセット（全項目・漏れ厳禁）
```javascript
export function buildLevel_X_Y(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  chainChomps.length=0;jumpBlocks.length=0;pipos.length=0;  // ← 必須！
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;G.autoScroll=0;
  G.waterMode=false;G.swimCooldown=0;G.iceMode=false;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;
```

### 城ステージのクッパ前チェックポイント（必須）
```javascript
// bowserArenaX の約400px手前に配置
G.checkpoint2={x:bowserArenaX-400, y:H-TILE, reached:false};
```
死亡→復帰時はレベル全体が再構築される（ブロック・敵が全復活）。
checkpoint2 到達後はクッパ手前から復帰する。

### 地面テンプレート
```javascript
  const gaps=[{s:2500,e:2800},{s:4000,e:4300}];
  for(let x=0;x<LW;x+=TILE)
    if(!gaps.some(g=>x>=g.s&&x<g.e))
      platforms.push({x,y:H-TILE,w:TILE,h:TILE,type:'ground',bounceOffset:0});
```

### 敵の配置ルール
```javascript
// 地上敵（goomba/koopa/buzzy/penguin/cactus）はギャップ外のみ
// parakoopa は x>=2000 のみ
// テレサ（teresa）は activated:true を設定すること
enemies.push({x:1200,y:H-6*TILE,w:28,h:28,vx:-0.5,vy:0.2,alive:true,
  type:'teresa',hiding:false,activated:true});
// ドッスン（thwomp）は y=TILE（天井付近）に配置
// ⚠️ ドッスンの x〜x+64 の真下にはブロックを置かない
enemies.push({x:2500,y:TILE,w:TILE*2,h:TILE*2,vx:0,vy:0,alive:true,
  type:'thwomp',state:'idle',waitTimer:0});
```

### ワープ土管（地下バリアント）
地下＝ボーナス部屋。敵は2〜3体（弱め）、コイン30枚以上、きのこ？×1、隠し1UP×1、スターなし。
各ワールド固有のバリアント名を使う（共有禁止）：
- W1: `coin`, `goomba`, `mushroom`
- W2: `desert1`〜`desert4`
- W3: `river1`, `river2`, `forest1`, `forest2`
- W5: `water1`〜`water4`
- W6: `ice1`〜`ice4`
- W7: `fortress1`〜`fortress4`
- W8: `airship_goal1`, `airship_goal2`
新バリアント追加は `underground.js` に分岐追加 + レベルファイルで `variant:'xxx'` 指定。

### フラッグポール
```javascript
// stairが x<7000 の短縮ステージは明示的に設定
flagPole.x = 3970;  // stair終端+α
// デフォルトは LW-500=7500（設定不要）
```

## ステップ4: stages.js に登録（⭐ 最重要 ⭐）

以前は main.js に import・goalSlide・restart の3箇所を書き換えていたが、
**現在は stages.js に1行追加するだけで自動接続される**。

```javascript
// src/stages.js
import {buildLevel_X_Y} from './levels/levelX-Y.js';  // importを追加

export const STAGES = [
  ...
  // 前のステージの次に追加
  {world:X, level:Y, id:N, build:buildLevel_X_Y, bgTheme:'fortress', bgmTheme:'castle',
   selBg:'#101010', selFg:'#a0a0c0'},
];
```

- `id` は前のステージの id+1（連番）
- `build` に関数を設定するだけで goalSlide・restart・BGM がすべて自動動作する
- 新 bgTheme が必要な場合は `src/main.js` の `drawBG()` にケースを追加する

## ステップ5: ブロック重複チェック（毎回必須・最重要）

`addRow(x, y, n, t)` は x, x+32, x+64, ... x+(n-1)*32 の座標を使う。
Q/hidden/yoshiEgg ブロックと (x, y) が一致したら重複バグ。

```javascript
// NG: 同じ (x, y) に addRow と push が共存
addRow(1100, H-5*TILE, 5, 'brick');  // x=1100,1132,1164,1196,1228
platforms.push({x:1100, y:H-5*TILE, ..., hasMush:true});  // ← 重複！

// OK: addRow 末端 x+(n-1)*32 よりも大きい x を使う
addRow(1100, H-5*TILE, 5, 'brick');  // ends at x=1228
platforms.push({x:1260, y:H-5*TILE, ..., hasMush:true});  // 1260>1228 ✓
// または異なる y を使う
platforms.push({x:1100, y:H-7*TILE, ..., hasMush:true});  // y が違えば OK ✓
```

コメントに末端座標を記載する習慣をつけること：
```javascript
addRow(350, H-5*TILE, 4, 'brick'); // 350,382,414,446 → 末端478
platforms.push({x:490, y:H-5*TILE, ...}); // 490>478 ✓
```

## ステップ6: チェックリスト

### 設計
- [ ] スポーン地点 x=0〜350 にブロック列・敵を置いていないか（最初のaddRowはx≥350、敵はx≥500）
- [ ] gaps 内に地上敵を置いていないか
- [ ] チェックポイント x がギャップ外か、y が地面またはブロック上か
- [ ] チェックポイント ±300px に敵なしか
- [ ] コイン300枚以上（城以外）
- [ ] flagPole.x が stair 終端より右か（短縮ステージは明示設定）

### 実装
- [ ] import ヘッダーに chainChomps/jumpBlocks/pipos/gravityZones/windZones が含まれているか
- [ ] リセット行に chainChomps.length=0 等が含まれているか
- [ ] G.autoScroll=0; G.iceMode=false; G.waterMode=false; G.pswitchTimer=0; が入っているか
- [ ] 新ギミック使用時: G.darkMode/gravityZones/windZones/G.chasingWall/Pスイッチ を適切に設定したか
- [ ] Pスイッチパイプ使用時: variant に 'pswitch_bridge' or 'pswitch_wall' を設定したか
- [ ] 城ステージ: G.checkpoint2 をクッパアリーナ~400px手前に配置したか
- [ ] テレサに activated:true を設定したか
- [ ] ドッスンを y=TILE 付近の天井に配置したか
- [ ] addRow と platforms.push の座標重複チェック済みか
- [ ] stages.js に import と STAGES エントリを追加したか

### ビルド
- [ ] `npm run build` でエラーなし

## ブロック高さバリエーション（全ステージ必須）
H-5*TILE, H-7*TILE だけでなく、以下の高さも使うこと：
- H-3*TILE（低い台地）, H-4*TILE, H-6*TILE, H-8*TILE, H-10*TILE
- 1ステージにつき最低4種の高さを使用

## ギャップサイズのルール（全ステージ必須）
- マイクロギャップ（60-96px）を1つ以上含める
- 隣接するギャップは異なるサイズにする
- 1つは300px以上の大ギャップを入れる（W1-1除く）

## コイン配置ルール（全ステージ必須）
一直線パターン（`for(j) push({x:X+j*SP, y:固定})` ）の使用は最小限に。代わりに：
- ギャップ際クラスター（3-5枚、リスク/リワード）
- 縦列コイン（3枚スタック）
- リスクコイン（H-2T, H-10T, H-11T）
- 新ブロック層上のご褒美コイン
合計300枚以上（城除く）

## 砂漠ワールド追加時の注意（G.sandstormMode）
```javascript
G.sandstormMode=true;
// bgTheme: 'desert' / 'desert2'
// 砂嵐の視覚エフェクト＋右方向の微風が自動適用
```

## 海辺ワールド追加時の注意（G.tideMode）
```javascript
G.tideMode=true;
// 潮の満ち引きが自動適用（約21秒周期）
// 城ステージでは使わない（室内）
// 水面下のコインをリスクコインとして配置可能
```

## 氷ワールド追加時の注意（G.iceMode）

```javascript
// リセット後に設定
G.iceMode=true;
// bgTheme: 'ice'（通常）/ 'ice_castle'（城）
// bgmTheme: 'main'（通常）/ 'castle'（城）
// 敵: ペンギン（type:'penguin'）使用可
// 氷物理: _af=0.042（加速）, _ff=0.9895（摩擦）→ 非常に滑る
// 小さな落とし穴（96px）を通常ギャップに加えて3個追加すると難度UP
```

## 砦ワールド追加時の注意（bgTheme:'fortress'）

```javascript
// G.iceMode は不要
// bgTheme:'fortress'・bgmTheme:'castle' を stages.js に設定
// 敵: テレサ（activated:true必須）・ドッスン（y=TILE）が適している
// 全ギャップに溶岩炎を推奨
// ヨッシーブロックは x=200 付近に配置（スポーンから少し先）
// 最初のaddRowは x≥350、敵は x≥500（開始即死防止）
```

### テレサの挙動（重要）
- マリオが**背を向けている**とき → 背後から追跡（hiding=false）
- マリオが**正面を向いている**とき → 隠れて停止（hiding=true・衝突無効）
- 追跡速度: `_ts=1.05`（旧1.5から30%減）
- 隠れ/追跡距離: 両方500px
- `_mFacingBoo = (facing===1&&_tdx<0)||(facing===-1&&_tdx>0)` — _tdxはmario-teresaなので符号注意

### ドッスン下ブロック禁止ルール
ドッスンの x〜x+64 の垂直ライン上には **いかなるブロックも置かない**こと。
addRow・platforms.push・隠しブロックすべて対象。ブロックがあると地面まで落ちずにそこで止まる。

```
// NG: ドッスン x=1280 → 範囲 1280-1344
addRow(1200, H-5*TILE, 4, 'brick'); // x=1264 と x=1296 がドッスン下に入る ✗

// OK: ドッスン範囲の手前で終わらせる
addRow(1200, H-5*TILE, 2, 'brick'); // x=1200, 1232 → 末端1264 < 1280 ✓
```
