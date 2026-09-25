# システム リファレンス

## コイン消費ショップ

ステージクリア後（flagPole / pipeGoal / ボス撃破後）に表示。価格・品目の実体は main.js の `_SHOP_ITEMS`（2026-09-25 時点で 13 品）。
操作: ←→↑↓ で選択、Space/Z/A で購入確認 → もう一度で購入、ESC/B でキャンセル、Enter/START または画面右上の NEXT で次のステージへ。タップでも購入・NEXT できる。

| アイテム | 価格 | key | 効果 | 複数 |
|---------|------|-----|------|------|
| MUSHROOM | 50 | mushroom | デカマリオ（大マリオ以上は購入不可） | × |
| FIRE | 100 | fire | ファイアマリオ | × |
| 1UP | 100 | 1up | 残機+1 | ○ |
| ICE | 100 | ice | アイスマリオ | × |
| HAMMER | 190 | hammer | ハンマーマリオ | × |
| RETRY | 200 | retryHeart | やられた時その場で復活（重ね可。時間切れ等の強制死亡では発動しない） | ○ |
| STAR 10s | 200 | star10 | 10秒無敵 | ○ |
| 1UP x3 | 250 | 1upSet | 残機+3 | ○ |
| 1UP x6 | 400 | 1upSet6 | 残機+6 | ○ |
| W-JUMP | 600 | doubleJump | 2段ジャンプ（やられるまで） | ○ |
| MAGNET | 650 | magnet | コイン吸引（やられるまで） | ○ |
| STAR 30s | 1000 | star30 | 30秒無敵 | ○ |
| SET 1300 | 1300 | bundle | MAGNET+W-JUMP+RETRY | ○ |

- コイン上限: 3000枚（updateHUD で丸める。クッパ撃破ボーナスも同じ上限）
- W-JUMP/MAGNET/RETRY は死亡でリセット（チェックポイント復帰時は継続）。セーブにも保存される
- ※ 旧ドキュメントにあった HI-JUMP / SHIELD / WARP / MEGA START はショップに存在しない

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

## ゲームパッド（設定の PAD LAYOUT で切替）

| 操作 | SNES配置（既定・iBUFFALO等） | MODERN配置（Xbox/PS等） |
|------|------|------|
| ジャンプ | A = buttons[1] | 下 = buttons[0] |
| ダッシュ | B = buttons[0] | 左 = buttons[2] |
| ファイア/アイス/ハンマー | Y = buttons[2] | 右 = buttons[1] |
| ヨッシーの舌/卵 | X = buttons[3] | 上 = buttons[3] |
| メニューの決定 / 戻る | A / B | 下 / 右 |

共通: L/R = BGM音量、SELECT = ストック使用、START = ポーズメニュー。配置表は main.js の `_PAD_LAYOUT`。

---

## 入力・操作感（2026-09-25〜）

- キーボードの割当は `src/input.js`（アクションごとに最大3キー、localStorage `mario_v2_keys`）。
  **新しい処理でキーを直接見ない**: 押下中の判定は `act('left'|'right'|'down'|'jump'|'dash')`、ジャンプは `queueJump()`
- ジャンプは update 内の `_tryJump()` に一本化: 先行入力 8F（`JUMP_BUFFER`）・コヨーテタイム 6F（`COYOTE_FRAMES`）・壁キック・2段ジャンプ
- 角ずらし: 上昇中に ground/brick の角へ 6px 以内で当たったら横にずらす（?ブロック・中身入りは対象外）
- 着地補正: 落下中に足先が段差の角に 8px 以内で届かなかったら上に乗せる
- 頂点付近はジャンプ押しっぱなしで重力 0.55 倍。カメラは `_followCam()` で進行方向を先読み
- 土管は「土管の上で↓を押している間」に入る（update 内で毎フレーム判定）
- 重力反転中はブロックの下面に着地し（`_cYFlipped`）、ジャンプは下向き

## メニュー・設定

- `G.menu` = null | {type:'pause'|'settings'|'keys'|'help'|'confirm', …, prev}。プレイ中に開いたときは `G.paused` も true
- 入力は `menuCmd()` → `_menuInput()` に集約（キーボード・パッド・タッチボタン・画面タップ共通）
- 設定は localStorage `mario_v2_opts`: v(BGM) / m(ミュート) / se(効果音) / shake / flash / runFire / pad / touch / slot
- 効果音は audio.js の `seOut`（GainNode）を通るので、BGM とは別の音量になる

## セーブ（3スロット・src/save.js）

- localStorage `mario_v2_slots` = [{progress, records} × 3]。旧 `mario_v2_save` は初回起動時にスロット1へ移行
- progress（続きから遊ぶためのデータ）: ゲームオーバーで消える。パワーアップ・W-JUMP/MAGNET/RETRY・ストックも保存
- records（★・ベストタイム）: `_recordClear()` の時点で保存。ゲームオーバーでも消えない
- ベストタイムはプレイ中のフレーム数（`G.stageFrames`）で計測（ポーズ・開始画面・ゴール演出は含まない）

## タイマー

- 残り時間と死亡後の待ちは、update() 冒頭のフレームカウントで進める（`startLevelTimer()` / `G.deathTimer` → `_afterDeath()`）
- **ゲーム状態を変える処理に setInterval / setTimeout を使わない**（ポーズ中やタブの裏でもずれるため）
- ゴール演出・クッパ撃破演出・ピーチ追跡中は残り時間を減らさない

## PWA

- `public/manifest.webmanifest` と `public/sw.js`（本番ビルドのときだけ登録）。HTML はネット優先、ハッシュ付きの資産とフォントはキャッシュ優先
- 公開後に古い画面が残るときは、sw.js の `CACHE` の名前を上げる
- アイコンは `node tools/make-icons.mjs` で再生成できる

## テスト

`npm test` = controls-test（操作性）→ regression-test（過去の不具合）→ menu-test（メニュー/セーブ）→ smoke-test（全ステージを実際のゲームループで走らせ、例外・NaN を検出）。
どれも `tools/smoke/env.mjs` のブラウザ用スタブの上で main.js をそのまま動かす。開発サーバーでは `window.__game` からコマ送り・キー入力ができる。

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
