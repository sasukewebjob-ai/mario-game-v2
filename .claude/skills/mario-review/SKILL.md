---
name: mario-review
description: mario-game-v2の指定レベルファイルをレビューし、CLAUDE.mdに定義されたバグパターンを全件検出・修正する。新ステージ完成後に必ず実行する。
---

レベルファイルのレビューを依頼されました: $ARGUMENTS

## ステップ1: コード収集（Explore Agent）

Explore サブエージェントで以下を収集してください：

- `src/levels/$ARGUMENTS` の全コード
- `src/globals.js` のエクスポート一覧（配列名・定数名）
- `src/stages.js` の STAGES 配列（该当ステージが登録されているか確認）
- `src/main.js` の以下の箇所：
  - `enterUnderground` 関数の `G.savedOW` 保存内容
  - `exitUnderground` 関数の復元処理
  - `drawBG()` の分岐（新 bgTheme が必要な場合）
- `src/levels/underground.js` のバリアント一覧

## ステップ2: 9項目チェック（全件必須）

収集したコードに対し、以下を順番に検証してください。問題があれば即座に修正します。

---

### チェック①：addRow と platforms.push の座標重複（最重要）

`addRow(x, y, n, type)` は `x, x+32, x+64, ..., x+(n-1)*32` の座標にブロックを生成する。
各 `addRow` 呼び出しの全座標リストを作成し、`platforms.push({x:px, y:py})` の (px,py) と照合する。

**重複していたら必ず修正：**
- `addRow` の範囲を調整して特殊ブロックと重ならないようにする
- または特殊ブロック側の x をずらす（+32 以上）
- 特殊ブロック（Q/hidden/yoshiEgg）は `addRow` に含めず `platforms.push` のみで配置すること

---

### チェック②：地上敵がギャップ内に置かれていないか

`const gaps=[...]` で定義された全ギャップ区間を取得する。
各地上敵（goomba/koopa/buzzy/hammerBro/penguin/cactus）の x 座標が `gaps.some(g=>e.x>=g.s&&e.x<g.e)` に該当しないか確認する。

> テレサ（teresa）とドッスン（thwomp）はギャップ内でも配置可（浮遊/天井固定）。

**該当していたら：** 最寄りの地面セクションに x を移動する。

---

### チェック③：チェックポイントの座標

`G.checkpoint` が設定されている場合：
- `G.checkpoint.x` がギャップ外か確認
- `G.checkpoint.y` が地面（`H-TILE`）またはブロック上（`H-n*TILE`）か確認
- ギャップ内の x だと旗が空中に浮くバグになる
- チェックポイント ±300px に敵が置かれていないか確認

---

### チェック④：リセット漏れ確認

buildLevel 関数の先頭リセット部分に以下が全て含まれているか確認する：

```javascript
[platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
 particles,scorePopups,blockAnims,movingPlats,springs,cannons,
 bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
hammers.length=0; bowserFire.length=0; lavaFlames.length=0;
chainChomps.length=0; jumpBlocks.length=0; pipos.length=0;  // ← 必須
G.starTimer=0; G.combo=0; G.comboTimer=0; G.checkpointReached=false;
G.checkpoint=null; G.goalSlide=null; G.ugMode=false; G.savedOW=null;
G.autoScroll=0; G.waterMode=false; G.swimCooldown=0; G.iceMode=false;
peach.alive=false; G.peachChase=null;
if(!yoshi.mounted){yoshi.alive=false; yoshi.eatCount=0;}
yoshi.runAway=false; yoshi.runTimer=0; yoshi.eggsReady=0; yoshi.idleTimer=0;
```

**漏れていたら追記する。**

特に `G.autoScroll=0` は強制スクロールステージ後に、`G.iceMode=false` は氷ワールド後に影響するため必須。

---

### チェック⑤：土管周辺の敵配置（安全地帯 200px）

各パイプの x 座標（ワープ・非ワープ問わず）から 200px 以内に地上敵が置かれていないか確認する。

- NG: `pipes.push({x:700,...})` + `enemies.push({x:800,...})` → 100px（NG）
- OK: 900px 以上離す

**該当していたら：** 敵の x を安全な位置に移動する。

---

### チェック⑥：コイン枚数（城以外のアクションステージ）

`bgmTheme !== 'castle'`（城ステージでない）の場合、コインの総数を確認する。

コイン系アイテムの種類：
- `coinItems.push(...)` の個数
- `platforms.push({coinBlock:true, hitsLeft:n})` → n 枚分
- `addRow(...,'coin')` → n 個

合計が **300枚未満** の場合はギャップアーチコインや coin ブロックを追加する。

---

### チェック⑦：flagPole.x の設定

ステージ内の `addStair` の x 座標を確認する。

`addStair(x, n)` の終端は `x + n*32`。この値が `7500`（`LW-500`）より小さい場合、
`flagPole` を import して `flagPole.x = addStair終端 + 数十px` を明示設定する。

```javascript
import {... flagPole ...} from '../globals.js';
// buildLevel 内で
flagPole.x = stairX + n*32 + 60;
```

---

### チェック⑧：stages.js への登録確認

以下が全て対応しているか確認する：

1. `src/stages.js` に `import {buildLevel_X_Y} from './levels/...';` があるか
2. `src/stages.js` の STAGES 配列にエントリが追加されているか（id は連番か）
3. `bgTheme` が新テーマの場合、`src/main.js` の `drawBG()` にケースが追加されているか

> **注意**: 以前の main.js 手動接続（goalSlide/restart/scheduleBGM）は不要。
> stages.js への登録のみで自動接続される。

---

### チェック⑨：テレサ・ドッスンの設定確認（砦/城ステージのみ）

テレサ（teresa）が配置されている場合：
- `activated:true` が設定されているか確認（ないとカメラ外で追跡しない）
- テレサの挙動: マリオが**背を向けている**と追跡、**正面を向く**と隠れる

ドッスン（thwomp）が配置されている場合：
- `y:TILE`（天井付近）に配置されているか
- `state:'idle'`, `waitTimer:0` が設定されているか
- **ドッスンの x〜x+64 の真下にブロックがないか確認**（addRow・platforms.push・隠しブロック含む全種類）
  - ブロックがあると地面まで落ちずにそこで止まる
  - addRow の場合: 各ブロックの終端座標（x+32）がドッスン左端より小さいことを確認

---

## ステップ3: 修正の実施

上記チェックで問題が見つかった場合、全て修正する。

修正後、`npm run build` が通ることを確認する（ビルドフックが自動実行されるため、エラーがなければ成功）。

## ステップ4: レビュー結果のサマリー

以下の形式で報告する：

```
✅ チェック① addRow重複：なし
✅ チェック② 敵ギャップ：なし
⚠️ チェック③ チェックポイント：x=3200がgap{s:3000,e:3300}内 → x=3400に修正済み
✅ チェック④ リセット漏れ：なし（chainChomps/jumpBlocks/pipos含む）
✅ チェック⑤ 土管安全地帯：なし
✅ チェック⑥ コイン枚数：342枚
✅ チェック⑦ flagPole.x：LW-500で問題なし
✅ チェック⑧ stages.js登録：全項目OK
✅ チェック⑨ テレサ/ドッスン：activated:true確認済み
```
