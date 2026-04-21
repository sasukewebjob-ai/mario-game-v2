# 地下（underground.js）バリアント リファレンス

## 設計方針

地下 = **ボーナス部屋**。入ったら必ず得をするご褒美設計。

### 必須アイテム（全バリアント共通）
- きのこ？ブロック × 1（`type:'question', hasMush:true`）
- 隠し1UP × 1（`type:'hidden', has1UP:true`）
- コイン 30枚以上（コインブロック含む）

### 敵の配置ルール
- 敵は **2〜3体**（弱い敵中心: goomba, koopa）
- 落下地点（x < 150）に敵を置かない
- 強敵（ハンマーブロス、ドッスン等）は **最大1体**

### ？ブロックとレンガの重複禁止
`addRow(x, y, n, 'brick')` と `platforms.push({x, y, type:'question'})` を同じ (x,y) に置かない。

### 一度入ったら再入不可
`G.usedUndergrounds` Set で管理。enterUG 時に pipe.ugKey を保存し exitUG 時に登録。
`restartCurrentLevel()` はリセットしない（死んでも塞がれる仕様）。

## バリアント命名規則

### 通常ボーナス部屋（W=800px）
| ワールド | バリアント名 |
|---|---|
| 1 | `coin`, `goomba`, `mushroom`, `yoshi1` |
| 2 | `desert1`〜`desert4`, `pswitch_bridge`, `yoshi2` |
| 3 | `river1`, `river2`, `forest1`, `forest2`, `yoshi3` |
| 4 | `yoshi4` |
| 5 | `water1`〜`water4`, `pswitch_wall` |
| 6 | `ice1`〜`ice4` |
| 7 | `fortress1`〜`fortress4` |
| 8 | `airship_goal1`, `airship_goal2`, `bowser_final` |
| EX | `pinocchio`, `pinocchio_fail`, `pswitch_maze`, `pswitch_grid` |

### 土管ミニダンジョン（W=3200px・横長 / 全15 variant）
命名: `pipe` + ワールド系統 + 連番。判定は `variant.indexOf('pipe')===0`。

| ワールド | バリアント名 | 特色敵 |
|---|---|---|
| 1 草原 | `pipeGrass1`〜`pipeGrass4` | buzzy / koopa / hammerBro |
| 2 砂漠 | `pipeDesert1`〜`pipeDesert3` | chuck / angrySun / dryBones |
| 3 川森 | `pipeRiver1`, `pipeForest1` | buzzy + 浮き足場 / hammerBro |
| 5 海辺 | `pipeWater1`, `pipeWater2` | cactus小3体 / cactus大3体 |
| 6 氷 | `pipeIce1`, `pipeIce2` | penguin多数 / penguin + dryBones |
| 7 砦 | `pipeFort1`, `pipeFort2` | thwomp + hammerBro + lavaFlames / cannon + dryBones |

#### 共通仕様
- **幅**: 3200px（通常部屋の4倍）。入場時 `G.pipeDungeon=true` にセット
- **共通ベース地形**（underground.js L475-543付近）:
  - 落とし穴14箇所（2T/3T幅）
  - 壊せるブロック20列（H-4T×11列 / H-5T×6列 / H-6T×3列）
  - `qM`×2 / `qC`×3（連打コインブロック）
  - 隠し1UP×2（6候補からランダム2箇所）
  - Pスイッチ×1（中央）
  - 浮き足場×14（各穴の上に1個ずつ）
  - 囲いブロック×3（敵閉じ込め用）
  - コイン260枚以上
- **variantごとに違うのは敵配置のみ**（L553以降、`enemies.push` が並ぶブロック）
- **再入不可**: 土管に入った瞬間 `G.usedUndergrounds` 登録（死亡後も戻れない）

#### 土管ミニダンジョン専用ヘルパー（underground.js L460-473）
| ヘルパー | 役割 |
|---|---|
| `dB(x, y?)` | カロン（dryBones）- 落ちない |
| `ch(x, dir)` | チャック（突進） |
| `aS(x, y?)` | おこりんぼ太陽 |
| `ct(x, h?)` | サボテン（高さ可変） |
| `flr(gaps)` | 穴付き床生成（gaps=`[[gx,gw],...]`） |
| `pB(x, y)` | Pスイッチ |
| `rh1p()` | 4倍長用ランダム隠し1UP |
| `mp(x,y,w,rg,sp)` / `mpv(...)` | 浮き足場（水平/垂直） |
| `box(x, w)` | 囲いブロック3段 |

#### 土管ミニダンジョンの修正ポイント
- **敵バランス調整**: 該当 variant の `enemies.push` ブロックのみ触る（L553以降）
- **共通地形の調整**（穴位置・浮き足場・コイン等）: L475-543 を全 variant 共通として修正
- **ヘルパー追加**: L460-473 に追加 → 全 variant で使える

## 新バリアント追加手順

### 通常ボーナス部屋
1. `underground.js` の適切なワールドセクションに `else if(variant==='xxx'){...}` を追加
2. レベルファイルの `pipes.push({...variant:'xxx'})` で参照
3. ヘルパー関数（`gm`, `kp`, `bz`, `pg`, `te`, `tw`, `hb`, `ci`, `rh1` 等）を活用

### 土管ミニダンジョン
1. `underground.js` の土管ミニダンジョンセクション（L457以降）に `else if(variant==='pipeXxxN'){...}` を追加
2. `// ──────── pipeXxxN (W? 系統名) ────────` の見出しコメントを挿入
3. variant 固有の敵だけを `enemies.push` で定義（共通地形は自動）
4. レベルファイルで `pipes.push({...variant:'pipeXxxN'})` または配列形式で参照

## savedOW への配列追加ルール

enterUnderground / exitUnderground で `G.savedOW` を使って地上配列を保存・復元している。
新しい配列を globals.js に追加したときは、この2箇所にも追加すること。

```javascript
// enterUnderground
G.savedOW = { ..., newArray:[...newArray], ... };

// exitUnderground
newArray.length=0; newArray.push(...(G.savedOW.newArray||[]));
```

## キノピオ部屋（pinocchio バリアント）仕様

- 宝箱5個から1個選ぶ → `openChest()` → `applyPinoReward()` → `spawnPinoExit()`
- 報酬 0〜9: 1UP×2 / 50コイン / 100コイン / 200コイン / 1コイン / miniBowser / ハンマーブロス×2 / ブンブン×5 / ゴール / EX扉
- コイン報酬: 天井から落下（noLand:true）、マリオが回収する方式
- `G.pinoNeed` が 0 かつ `G.chestOpened` かつ reward が 0〜7 のとき出口パイプを出現
- `G.pinoRoom`, `G.pinoReward`, `G.pinoNeed`, `G.chestOpened`, `G.pinoSpeechText/Timer` で管理
