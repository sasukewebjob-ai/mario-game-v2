# Mario Game v2 - 変更ログ

---

## 2026-03-31

### [fix] クッパが城ステージの階段を乗り越えてくるバグ修正
**ファイル:** `src/globals.js`, `src/main.js`, `src/levels/level1-4.js`, `level2-3.js`, `level3-3.js`, `level4-3.js`

**問題:** Bowser はプラットフォームとの水平衝突がなく垂直のみ。addStairD（下り階段）や arena addStair の段差をジャンプで1段ずつ登ってマリオ側に来てしまっていた。

**修正内容:**
- `addStairD`・城門壁・アリーナ内上り階段を全城ステージから削除
- 大型上り階段（10段、H-11*TILE）に変更 → マリオが高台からアリーナへ飛び降りる動線
- アリーナ壁（7ブロック高 = 224px）を追加。Bowserジャンプ上限 ≈ 144px なので越えられない
- `G.bowserLeftX` を追加（旧ハードコード `6900` を廃止）
- main.js: `if(bowser.x<G.bowserLeftX)` に変更
- アリーナ内 ? ブロック×2（きのこ・スター）を各城ステージに追加

**各ステージ座標:**
| ステージ | 階段 | 壁 | bowserArenaX | bowserLeftX |
|---|---|---|---|---|
| 1-4 | addStair(6200,10) | x=6520,6552 | 6455 | 6586 |
| 2-3 | addStair(6000,10) | x=6320,6352 | 6255 | 6386 |
| 3-3 | addStair(6400,10) | x=6720,6752 | 6655 | 6786 |
| 4-3 | addStair(6400,10) | x=6720,6752 | 6655 | 6786 |

### [fix] ブロック重複バグ調査
全14レベルファイルの addRow 座標と platforms.push 座標を全数照合 → **重複なし**を確認済み。

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
