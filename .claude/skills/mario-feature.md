---
name: mario-feature
description: マリオゲーム（Vite版）に新機能を追加する。Explore→Plan→実装の3ステップで進める。
---

新機能の追加を依頼されました: $ARGUMENTS

## ステップ1: 現状把握（Explore Agent）

Explore サブエージェントで関連コードを調べてください：
- `src/main.js` の関連する変数・関数を特定する
- `src/globals.js` に追加が必要な変数があるか確認
- どこに追加コードを挿入すべきか把握する

## ステップ2: 設計（Plan Agent）

Plan サブエージェントで実装計画を立ててください：
- 何をどこに追加するか
- globals.js に追加が必要か
- 各レベルファイルへの影響範囲

## ステップ3: 実装

### ファイル構成
```
src/
├── globals.js    ← 定数・配列・G オブジェクト・ゲームオブジェクト
├── builders.js   ← addB, addRow, addStair, addStairD
├── stages.js     ← ステージ一覧（新ステージはここに登録）
├── main.js       ← ゲームループ・update・draw・audio
└── levels/
    ├── level1-1.js 〜 levelX-Y.js
    └── underground.js
```

### 変数の書き方（重要）

| 種類 | 書き方 | 場所 |
|---|---|---|
| スカラー変数の読み書き | `G.starTimer`, `G.ugMode` 等 | main.js・レベルファイル共通 |
| 配列の操作 | `platforms.push(...)` 等（そのまま） | importして使う |
| ゲームオブジェクト | `yoshi.alive`, `bowser.hp` 等（そのまま） | importして使う |
| 新しいスカラー追加 | `G` オブジェクトに追加 → `globals.js` を編集 | globals.js |
| 新しい配列追加 | `export const xxx = []` を追加 | globals.js |

### 新しいグローバル変数を追加する場合

1. `src/globals.js` に追加：
   ```javascript
   // 配列の場合
   export const newArray = [];
   // スカラーの場合（G オブジェクトに追加）
   export const G = {
     ...,
     newVar: 0,  // ← 追加
   };
   ```

2. 使用するすべてのファイルの import 文に追加

3. **全レベルファイル**のリセット行に `newArray.length=0` または `G.newVar=0` を追加

### 座標系（重要）
- `ctx.translate(-G.cam, 0)` の内側 → **ワールド座標**（cam を引かない）
- HUD・UI は translate の外 → **スクリーン座標**

### 踏みつけ判定
```javascript
// 全敵共通（固定px値は使わない）
if(mBot - mario.vy <= e.y + e.h*0.4)

// クッパのみ（少し厳しめ）
if(mBot - mario.vy <= bowser.y + bowser.h*0.35)
```

### BGM 優先順位
```javascript
G.ugMode > G.starTimer > (castle bgm) > THEME_NOTES
```

### クッパ offscreen 登場（城ステージ）
城ステージでクッパを最初から配置せず、Mario が奥まで進んだときに画面右端から歩いて入場させるパターン：
```javascript
// レベルファイル末尾
G.bowserArenaX = XXXX;  // トリガーX座標
G.bowserLeftX  = XXXX;  // クッパ左端制限
Object.assign(bowser, { alive:true, x:9000, state:'offscreen', ... });
```
`main.js` では `bowser.state==='offscreen'` のとき物理演算をスキップし、
`mario.x > G.bowserArenaX` になったら `bowser.x = G.cam + W + 150; bowser.state='walk'` に遷移。

### ワープ土管で敵が消えるバグ（修正済み・再発注意）
`enterUnderground()` の `G.savedOW` に保存していない配列は、地上復帰時に `exitUnderground()` で消滅する。
現在 `chainChomps`・`jumpBlocks`・`pipos` は保存・復元済み。
新たな敵配列を追加した場合は `enterUnderground` の savedOW と `exitUnderground` の復元処理の**両方**に追記すること。

### 移動足場（ワンウェイプラットフォーム）
移動足場はすり抜け床方式。下からジャンプすると貫通し、上から落下したときだけ着地。
判定条件: `mario.vy>=0`（落下中）かつ前フレームでマリオ底辺が足場上端より上。
横移動追従は `mp.prevX` 差分を `mario.x` に加算。

### キーバインド（現在）
| キー | 動作 |
|---|---|
| ← → / A D | 移動 |
| ↑ / W / Space | ジャンプ |
| Z | ファイアボール/アイスボール/ハンマー（パワー状態による） |
| X | ヨッシーの舌（ヨッシー搭乗中のみ） |
| Shift | ダッシュ |

### スター効果中の当たり判定ルール
- スター取得中（G.starTimer>0）は全敵に触れるだけで撃破
- テレサ・ドッスン・ブンブン・クッパもスターで撃破可能

### 無敵時間中の踏みつけ
- `mario.inv > 0` 中でも踏みつけ（上から着地）は有効
- 敵の横接触・正面衝突は無効（mario.inv===0 の場合のみ killMario 呼び出し）

### 敵タイプ一覧（現在実装済み）
| タイプ | 説明 | 撃破方法 |
|---|---|---|
| `goomba` | クリボー（基本敵） | 踏む / ファイアボール / アイスボール(凍結) / ハンマー / スター |
| `koopa` | ノコノコ | 踏む(甲羅) / ファイアボール / アイスボール(凍結) / ハンマー / スター |
| `buzzy` | メット | 踏む(甲羅) / **ハンマー** / スター（ファイア・アイス免疫） |
| `penguin` | ペンギン（氷ワールド） | 踏む / ファイアボール / アイスボール(凍結) / ハンマー / スター |
| `cactus` | サボテン（砂漠） | ファイアボール / **ハンマー** / スター（踏めない） |
| `parakoopa` | パラノコノコ | 踏む(2回) / ファイアボール / アイスボール(凍結) / ハンマー / スター |
| `piranha` | パックンフラワー | ファイアボール / スター（踏めない） |
| `hammerBro` | ハンマーブロス | 踏む / ファイアボール / アイスボール(凍結) / ハンマー / スター |
| `lakitu` | ジュゲム | ファイアボール / **ハンマー** / スター（踏めない） |
| `teresa` | テレサ（砦・城） | **ハンマー** / スターのみ（ファイア・アイス免疫・踏み不可）|
| `thwomp` | ドッスン（砦・城） | **ハンマー** / スターのみ（ファイア・アイス免疫・踏み不可）|

**テレサ配置時の注意: `activated:true` 必須**（設定しないとカメラ外で追跡しない）

### パワーアップ一覧
| mario.power | 取得 | Zキー攻撃 |
|---|---|---|
| `'none'` | 初期 | なし |
| `'big'` | キノコ | なし |
| `'fire'` | ファイアフラワー | ファイアボール（vx=9） |
| `'ice'` | アイスフラワー（G.iceMode時） | アイスボール（vx=7、敵凍結240f）|
| `'hammer'` | ハンマースーツ（hasHammer） | 放物線ハンマー（全敵撃破可能）|

### 新ステージギミック
| ギミック | 設定 | 効果 |
|---|---|---|
| 暗闇 | `G.darkMode=true` | マリオ周囲のみスポットライト |
| 砂嵐 | `G.sandstormMode=true` | 視界制限＋右風（W2用）|
| 潮の満ち引き | `G.tideMode=true` | 水面が周期的に昇降（W3用）|
| 重力反転 | `gravityZones.push({x,y,w,h})` | ゾーン内で重力反転 |
| 風ゾーン | `windZones.push({x,y,w,h,force})` | 横風で押される（正=右、負=左）|
| 追いかけ壁 | `G.chasingWall={x,speed,triggerX,active:false}` | 左から壁が迫る（触れたら即死）|
| 巨大キノコ | `hasMega:true` ブロック | 20秒巨大化・全破壊 |
| ハンマースーツ | `hasHammer:true` ブロック | 放物線ハンマー・全敵タイプ撃破 |

### チェックポイント復帰時の挙動
死亡→チェックポイント復帰時に**レベル全体が再構築**される（build()再呼び出し）。
ブロック・敵・アイテムがすべて復活する。checkpoint/checkpoint2の到達状態は復元される。

### クッパ前チェックポイント（G.checkpoint2）
城ステージでは bowserArenaX の ~400px 手前に第2チェックポイントを配置する。
```javascript
G.checkpoint2={x:bowserArenaX-400, y:H-TILE, reached:false};
```
到達時に G.checkpoint が自動更新され、以降の死亡はクッパ手前から復帰。

### コインショップ価格（主要）
MUSHROOM:30, FIRE:60, 1UP:50, 1UP SET:120, **MAGNET:200**, STAR10:100, STAR30:250, W-JUMP:150, GOLD:200, RETRY:300

### savedOW に保存が必要な配列（ワープ土管）
新たな配列を追加した場合は `enterUnderground` の savedOW と `exitUnderground` の復元処理に追記すること。
現在保存済み: platforms, pipes, coinItems, enemies, mushrooms, piranhas, movingPlats, springs, cannons, chainChomps, jumpBlocks, pipos, gravityZones, windZones, chasingWall, darkMode

### 実装後の確認
- `npm run build` でエラーなし
- 全レベルファイルのリセットに新変数を追加したか
