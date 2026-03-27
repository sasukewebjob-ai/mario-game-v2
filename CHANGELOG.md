# Mario Game v2 - 変更ログ

---

## 2026-03-26

### mario-game → mario-game-v2 の関係について
- `mario-game/` は旧バージョン（1ファイル構成の index.html）、実装は 1-1〜1-4のみ
- `mario-game-v2/` は Vite によるモジュール分割版。World 2 ステージが実装済み
- どちらも別プロジェクト。同じフォルダには入れない

---

### [fix] 土管スポーン安全地帯の実装
**ファイル:** `src/main.js`

**問題:** 土管に入った直後（地下スポーン）・土管から出た直後（地上復帰）に敵がいると即死する

**修正内容:**
- `enterUnderground()`: `buildUnderground()` 呼び出し後、mario スポーン(x=60)から 200px 以内の enemies を除去
- `exitUnderground()`: 地上配列を復元後、元のパイプ位置(savedOW.mx)から 200px 以内の enemies を除去
- 「向かってくる敵はOK」→ 距離チェックのみで、遠くにいる敵は除去しない

```javascript
// enterUnderground に追加
for(let i=enemies.length-1;i>=0;i--){if(enemies[i].x<260)enemies.splice(i,1);}

// exitUnderground に追加
const _exitX=G.savedOW.mx;
for(let i=enemies.length-1;i>=0;i--){if(Math.abs(enemies[i].x-_exitX)<200)enemies.splice(i,1);}
```

---

### [fix/balance] 2-2 ステージ調整
**ファイル:** `src/levels/level2-2.js`, `src/levels/underground.js`

| 項目 | 変更前 | 変更後 |
|---|---|---|
| 地下(desert4)のワンワン | 1体 | 削除 |
| 地上ワンワン数 | 5体(x:3100,4300,5350,6050,6650) | 3体(x:2800,4600,6400) |
| パラクーパ数 | 6体・固定高さ(H-5*TILE) | 26体・ランダム高さ(H-4〜7*TILE) |

**パラクーパの高さランダム化:**
```javascript
const by = H - (4 + Math.floor(Math.random() * 4)) * TILE;
```
26体の x 座標: 200, 500, 850, 1150, 1450, 1800, 2200, 2500, 2800, 3100, 3400, 3700,
4000, 4300, 4600, 4900, 5200, 5500, 5800, 6100, 6300, 6500, 6600, 6700, 6800, 6950

---

### [add] 2-3 クッパ手前にきのこボックス追加
**ファイル:** `src/levels/level2-3.js`

- x=6100, y=H-5*TILE に `hasMush:true` のはてなブロックを追加
- 配置場所: 階段(x=6300)の手前・addRow との座標重複なし確認済み

---

## テストプレイフィードバック記録

| 日付 | フィードバック | 対応 |
|---|---|---|
| 2026-03-26 | 2-2後半地下のワンワンが邪魔 | desert4 variant から削除 |
| 2026-03-26 | 地上のワンワンを3ヶ所に | 5体→3体、位置調整 |
| 2026-03-26 | パラクーパが単調・少ない | 6体→26体、高さランダム化 |
| 2026-03-26 | 2-3クッパ前がキツい | 階段手前にきのこボックス追加 |
| 2026-03-26 | 土管の出入りで即死する | スポーン安全地帯(200px)を実装 |
