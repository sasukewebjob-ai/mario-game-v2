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
├── main.js       ← ゲームループ・update・draw・audio
└── levels/
    ├── level1-1.js 〜 level1-4.js
    ├── underground.js
    └── level2-1.js（追加時）
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

3. **全レベルファイル**（level1-1〜level1-4, underground, level2-x...）の
   リセット行に `newArray.length=0` または `G.newVar=0` を追加

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
G.ugMode > G.starTimer > (G.currentLevel===4 && G.currentWorld===1) > THEME_NOTES
```

### クッパ offscreen 登場（城ステージ）
城ステージでクッパを最初から配置せず、Mario が奥まで進んだときに画面右端から歩いて入場させるパターン：
```javascript
// レベルファイル末尾
G.bowserArenaX = 7000;  // トリガーX座標
Object.assign(bowser, { alive:true, x:9000, state:'offscreen', ... });
```
`main.js` では `bowser.state==='offscreen'` のとき物理演算をスキップし、
`mario.x > G.bowserArenaX` になったら `bowser.x = G.cam + W + 150; bowser.state='walk'` に遷移。

### ワープ土管で敵が消えるバグ（修正済み・再発注意）
`enterUnderground()` の `G.savedOW` に保存していない配列は、地上復帰時に `exitUnderground()` で消滅する。
現在 `chainChomps`・`jumpBlocks`・`pipos` は保存・復元済み。
新たな敵配列を追加した場合は `enterUnderground` の savedOW と `exitUnderground` の復元処理の**両方**に追記すること。

### 移動足場でマリオを運ぶ（バグ修正済み）
移動足場に乗ったときマリオが横移動しないバグは修正済み（`mp.prevX` 差分を `mario.x` に加算）。
新たに垂直移動足場（type:'v'）を追加する場合は同様に `prevY` 差分を `mario.y` に加算すること。

### キーバインド（現在）
| キー | 動作 |
|---|---|
| ← → / A D | 移動 |
| ↑ / W / Space | ジャンプ |
| Z | ファイアボール（fire パワー時・ヨッシー搭乗中も使用可） |
| X | ヨッシーの舌（ヨッシー搭乗中のみ） |
| Shift | ダッシュ |

> **Z と X は独立している** — ヨッシー搭乗中でも Z はファイアボール。X でヨッシーの舌。
> キーバインドを変更するときは keydown ハンドラの行 73 付近を編集する。

### スター効果中の当たり判定ルール
- スター取得中（G.starTimer>0）は全敵に触れるだけで撃破（starTimer確認は `e.squishT=20` で処理）
- スター撃破 SE：`sfx('stomp')` を呼ぶと G.starTimer>0 のとき自動的に上昇アルペジオ（5音）に切り替わる
- 通常踏みつけ SE：`sfx('stomp')` → 低いサワウトゥース2音
- 敵撃破でスター専用音を出したい場合は **`sfx('stomp')` をそのまま呼べばよい**（sfx内で分岐）

### 無敵時間中の踏みつけ
- `mario.inv > 0` 中でも踏みつけ（上から着地）は有効
- 敵の横接触・正面衝突は無効（mario.inv===0 の場合のみ killMario 呼び出し）
- 敵の外側衝突チェックから `mario.inv===0` を除去し、内側の `killMario()` に `if(mario.inv===0)` を残す形で実装

### 実装後の確認
- `npm run build` でエラーなし
- 全レベルファイルのリセットに新変数を追加したか
