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

### 実装後の確認
- `npm run build` でエラーなし
- 全レベルファイルのリセットに新変数を追加したか
