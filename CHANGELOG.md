# Mario Game v2 - 変更ログ

---

## 2026-05-01 (2回目)

### [fix] 第2弾5エージェント調査の結果反映
**ファイル:** `src/main.js`

第2弾の5並列エージェントで前回未カバーの領域（ヨッシー、ボス戦、ショップ/セーブ、特殊モード、描画）を調査。UltraThink検証で誤検出をフィルタし、真のバグ2件を修正。

**修正内容:**

| 箇所 | 問題 | 修正 |
|---|---|---|
| ヨッシー舌の敵チェック (main.js:873) | 凍結中の敵 (`e.frozen`) を除外せず、舌で捕食可能だった | `e.frozen` 除外を `continue` 条件に追加 |
| Peachチェイス中のマリオ移動 (main.js:1403) | `mario.vx=3` と `mario.x+=3` の併用で line 811 の物理移動と二重加算され、6px/F移動になっていた | `mario.vx=0` に変更し物理側の加算をゼロ化、明示的な `mario.x+=3` のみで3px/F固定 |

**検証で誤検出と判明した報告（修正不要）:**
- Bowser fireImmune逃げ穴（BOWSER_STATSで全Wが `fireImmune:false` 固定、該当パス無効）
- Bowser撃破時の二重スコア加算（`hurtTimer` で同フレーム重複完全防止）
- shopBought null参照（`state='shop'` 開始時に `={}` 初期化済）
- 星タイマー加算ゼロ（購入時に書き込まれた後で読まれる）
- lives-icons毎フレーム再構築（updateHUDはイベント駆動、毎フレームでない）
- ヨッシー卵の地下ロスト（短命projectile、保存不要）

---

## 2026-05-01

### [fix] 5エージェント徹底バグ調査の結果反映
**ファイル:** `src/main.js`, `src/levels/underground.js`

5つの並列エージェントによる多角的バグ調査を実施。報告された候補をUltraThink検証し、実コードで確認できた真のバグのみ修正。

**修正内容:**

| 箇所 | 問題 | 修正 |
|---|---|---|
| `restartCurrentLevel()` (main.js) | 死亡後の再開で `G.checkpoint` / `G.checkpointReached` / `G.starTimer` / `G.autoScroll` が初期化されず、前ステージの状態が残留する可能性 | 4フラグの初期化を関数冒頭に追加 |
| `exitUnderground()` (main.js) | 地下から出た時に `fireballs` / `bowserFire` がクリアされず、地下で発射した飛び道具が地上に残存 | `bulletBills.length=0` の直後に2配列のクリアを追加 |
| `pinocchio_fail` variant (underground.js) | EX失敗で戻った際に `G.pinoFlagReady` / `G.pinoFlagDelay` が未リセット（前回ピノキオ部屋で報酬8を選んだ状態の残留リスク） | 防御的リセットを追加 |

**検証で誤検出と判明した報告（修正不要）:**
- キノピオ部屋EX→pinoRoom復帰のパワー喪失：CHANGELOG既記載の修正済み
- miniBowser hurtTimer/inv の非対称：inv=90 > hurtTimer=75 でマリオ有利側
- koopa踏み後の continue 忘れ：if/else if 連鎖で同フレーム重複は発生しない
- shell化直後の inv 不足：踏みのバウンス vy=-9 で分離・shellロジックに inv あり
- type:'fall' 残骸：moving platform の現役機能（main.js でハンドラあり）

---

## 2026-04-07

### [fix] ヨッシーの顔がマリオに隠れるバグ修正
**ファイル:** `src/main.js`

**問題:** drawYoshiがマリオより先に描画されるため、騎乗時にヨッシーの頭（目・鼻・口）がマリオの背後に隠れて見えなかった。

**修正内容:**
- `drawYoshi` を `drawYoshiBody`（体・足・鞍）と `drawYoshiHead`（首・頭・顔・舌）に分割
- 描画順: ヨッシー体 → マリオ → ヨッシー頭（頭がマリオの前面に表示される）

### [fix] パックンフラワーが土管に隠れないバグ修正
**ファイル:** `src/main.js`

**問題:** パックンフラワーが土管の後に描画されるため、土管の中にいる時も常に見えていた。

**修正内容:**
- 描画順をパックンフラワー → 土管に変更（土管がパックンを覆い隠す）

### [fix] パックンフラワーの位置が土管の左寄りだったバグ修正
**ファイル:** 全レベルファイル（17ファイル）

**問題:** パックンのスポーンX座標が `p.x+8` で、土管幅64・パックン幅16に対して左寄りだった。

**修正内容:**
- 全レベルの `p.x+8` を `p.x+24`（= 土管中央）に修正

---

## 2026-04-05

### [fix] 高リフレッシュレートモニターでゲーム速度が倍速になるバグ修正
**ファイル:** `src/main.js`

**問題:** ゲームループが `requestAnimationFrame` の呼び出しごとに `update()` を実行していたため、144Hzモニターで約2.4倍速、120Hzで約2倍速になっていた。すべてのゲームロジック（物理・AI・タイマー）が60fps前提のフレームベースだった。

**修正内容:**
- 固定タイムステップ・アキュムレーターパターンを導入
- `performance.now()` で経過時間を計測し、1/60秒（≒16.67ms）ごとに `update()` を1回実行
- `draw()` はモニターのリフレッシュレートで実行（描画は滑らか）
- 既存のゲームロジックは一切変更なし
- タブがバックグラウンドから復帰した際の暴走防止（dt上限200ms）

```javascript
// 旧: フレームレート依存（モニターHz = ゲーム速度）
(function loop(){pollGamepad();if(...)update();draw();requestAnimationFrame(loop)})();

// 新: 固定60fpsタイムステップ
let _prevT=performance.now(),_acc=0;const _STEP=1000/60;
(function _loop(){const _now=performance.now();_acc+=Math.min(_now-_prevT,200);_prevT=_now;
  while(_acc>=_STEP){pollGamepad();if(...)update();_acc-=_STEP;}
  draw();requestAnimationFrame(_loop)})();
```

### [chore] フォルダ統合
- 旧版 `mario-game/`（1ファイル構成 index.html、World 1のみ）を削除
- `mario-game-v2/` の内容を `mario-game/` にもコピー
- `mario-game-v2/` は引き続きGitHubリポジトリとして使用（デプロイ元）

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
