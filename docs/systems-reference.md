# システム リファレンス

## コイン消費ショップ

ステージクリア後（flagPole / pipeGoal / ボス撃破後）に表示。  
操作: ←→↑↓選択、A/Space購入、B/ESCキャンセル、START/Enter次ステージ

| アイテム | 価格 | key | 効果 | 複数 |
|---------|------|-----|------|------|
| きのこ | 30 | mushroom | デカマリオ | × |
| ファイア | 60 | fire | ファイアマリオ | × |
| アイス | 60 | ice | アイスマリオ | × |
| ハンマー | 80 | hammer | ハンマーマリオ | × |
| 1UP | 100 | 1up | 残機+1 | ○ |
| 1UP×3 | 200 | 1upSet | 残機+3 | ○ |
| 1UP×6 | 280 | 1upSet6 | 残機+6 | ○ |
| STAR 10s | 50 | star10 | 10秒無敵 | ○ |
| STAR 30s | 500 | star30 | 30秒無敵 | ○ |
| W-JUMP | 150 | doubleJump | 2段ジャンプ（死ぬまで） | ○ |
| MAGNET | 300 | magnet | コイン吸引（死ぬまで） | ○ |
| RETRY | 100 | retryHeart | 死亡時復活（重ね可） | ○ |
| HI-JUMP | 120 | highJump | ジャンプ高さ×1.25 | × |
| SHIELD | 80 | shield | ダメージ1回無効 | ○ |
| WARP | 300 | warp | ステージ1つスキップ | ○ |
| SET 500 | 500 | bundle | MAGNET+W-JUMP+RETRY | ○ |
| MEGA START | 250 | megaStart | 開始時メガマリオ8秒 | × |

- コイン上限: 999枚
- W-JUMP/MAGNET/RETRY は死亡でリセット
- アクティブ効果は画面右下に表示

---

## パワーアップ状態

| power | 取得元 | 攻撃 | ダメージ時 |
|---|---|---|---|
| none | 初期 | — | 死亡 |
| big | キノコ | — | → none |
| fire | ファイアフラワー | ファイアボール | → big |
| ice | アイスフラワー（氷ワールド） | アイスボール | → big |
| hammer | ハンマースーツ | 放物線ハンマー | → big |

### アイスフラワー（G.iceMode 時にファイアフラワー→自動変換）
- アイスボール: バウンス5回、敵を240f凍結
- 凍結敵: 踏みor横蹴りで粉砕（400pts + コイン3枚）
- `iceBalls[]` 配列、最大2発

### ハンマースーツ
- vx=5.5, vy=-10, 重力0.4。全敵タイプにダメージ（buzzy/teresa/thwomp含む）
- クッパにも有効（fireImmune無視）
- `marioHammers[]` 配列、最大2発

### 巨大キノコ（hasMega:true）
- `G.megaTimer=480`（8秒）。敵接触即死、レンガ接触破壊
- `G.megaPrevPower` / `G.megaPrevBig` で元状態を保存

---

## アクション

### ダッシュジャンプ
走行中のジャンプで `|vx| * 0.15`（最大+1.5）vy追加。

### 壁キック
空中で壁接触 → 8フレーム猶予中にジャンプキー → `vy=-13, vx=反対方向×5`

### ヒップドロップ
空中で↓キー（vy>0）→ `mario.hipDrop=true, vy=16`。着地時に周囲敵を倒す。
クッパへは2倍ダメージ。

### スライディング
Shift+地上+↓ かつ `|vx|>3` で発動。30フレーム持続。スライド中に敵ヒット → 撃破。

---

## Pスイッチ（G.pswitchTimer）

```javascript
platforms.push({x, y:H-5*TILE, w:TILE, h:TILE, type:'pswitch', hit:false, bounceOffset:0});
```
- 10秒間: レンガ → コイン、コイン → 固い足場（pswitch_block）
- BGM優先順位: `ugMode > starTimer > pswitchTimer > waterMode > castle`
- リセット: `G.pswitchTimer=0; G._psCoins=null; G._psBricks=null`
- enterUnderground 時に deactivatePSwitch() してから savedOW 保存

---

## ゲームパッド（iBUFFALO SNES型）

| ボタン | gpad | 操作 |
|--------|------|------|
| B | buttons[0] | ダッシュ |
| A | buttons[1] | ジャンプ |
| Y | buttons[2] | ファイア/アイス/ハンマー |
| X | buttons[3] | ヨッシーの舌/卵 |
| L | buttons[4] | 音量ダウン |
| R | buttons[5] | 音量アップ |
| SELECT | buttons[6] | — |
| START | buttons[7] | 開始/ポーズ/次ステージ |

マッピング変更: `main.js` の `pollGamepad()` 内 `gp.buttons[N]` のインデックスを変更。

---

## 演出機能まとめ

| 機能 | 概要 |
|------|------|
| コンボカウンター | 倍率に応じてフォントサイズ・色変化。5x以上で1UP!! |
| 世界名フェードイン | イントロ時に PLAINS / DESERT 等を表示 |
| 花火 | ゴール時スコア下1桁が1,3,6のとき6連花火 |
| 天候エフェクト | mountain/airship テーマで雨・稲光 |
| 残像エフェクト | スター・ダッシュ時に最大5フレーム残像 |
| ミニマップ | 画面上部4pxバー（マリオ赤・ゴール緑） |
| BGMミュート | Mキー / +−キーで音量調整 |
| ステージクリア統計 | ショップ画面にTIME/COINS/KO/MAX COMBO表示 |

### scheduleBGM 優先順位
```
ugMode > starTimer > megaTimer > pswitchTimer > waterMode > castle/normal
```

### BGM Phase2切り替え（クッパ）
Phase2遷移時に stopBGM→startBGM。`CASTLE_P2_NOTES`（1オクターブ上・テンポ2倍）を使用。
