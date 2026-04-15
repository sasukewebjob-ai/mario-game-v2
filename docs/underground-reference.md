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

## 新バリアント追加手順

1. `underground.js` に `else if(variant==='xxx'){...}` を追加
2. レベルファイルの `pipes.push({...variant:'xxx'})` で参照
3. ヘルパー関数（`gm`, `kp`, `bz`, `pg`, `te`, `tw`, `hb`, `ci`, `rh1` 等）を活用

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
