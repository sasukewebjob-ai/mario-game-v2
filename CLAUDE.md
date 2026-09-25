# Mario Game v2

## 開発環境
```bash
npm run dev     # 開発サーバー（ホットリロード）http://localhost:5173/mario-game-v2/
npm run build   # ビルド確認
npm run deploy  # GitHub Pages デプロイ（masterにpushしただけでは反映されない）
npm test        # 操作性・回帰・メニュー/セーブ・全ステージのスモークテスト（変更後は必ず実行）
node tools/check-geometry.mjs   # 配置検査（部分重なり・土管/ブロック内の敵やアイテム・CP近くの危険物など）
node tools/deep-test.mjs        # 無敵走破・全土管・モンキー・長時間（瞬間移動・部屋の外・めり込み等を検知）
```
公開URL: https://sasukewebjob-ai.github.io/mario-game-v2/

## ファイル構成
```
src/
├── globals.js    ← 定数・配列・G オブジェクト・ゲームオブジェクト
├── builders.js   ← addB, addRow, addStair, addStairD
├── main.js       ← ゲームループ・update・draw・メニュー・入力処理
├── audio.js      ← 効果音・BGMデータ（効果音は seOut 経由）
├── input.js      ← キー割当（キーコンフィグ）
├── save.js       ← セーブ3スロット（進行と記録）
├── layout.js     ← 画面の縮小・タッチ用レイアウト
├── stages.js     ← ステージ登録
├── style.css
└── levels/
    ├── underground.js         ← buildUnderground(variant)
    └── level1-1.js 〜 level8-3.js（全24ステージ）
```

## 変数ルール（最重要）

スカラー値は **必ず `G.xxx`**。配列・オブジェクトはそのまま。

```javascript
// NG: starTimer = 0        OK: G.starTimer = 0
// OK: platforms.push(...)  mario.vx = 0  bowser.hp--
```

よく使う G フラグ: `G.starTimer` `G.ugMode` `G.savedOW` `G.checkpoint` `G.goalSlide`
`G.iceMode` `G.waterMode` `G.darkMode` `G.autoScroll` `G.airshipMode` `G.sandstormMode`
`G.tideMode` `G.chasingWall` `G.bowserArenaX` `G.bowserLeftX` `G.pinoRoom` `G.pinoReward`
`G.pipeDungeon`（土管ミニダンジョン入場中=true, W=3200px幅）

## レベル設計 必須チェック（毎回確認）

| # | ルール |
|---|--------|
| ① | **addRow と platforms.push を同 (x,y) に置かない**（ブロック重複バグの元凶） |
| ② | 地上歩き敵（goomba/koopa/buzzy）はギャップ内に置かない（即落下） |
| ③ | チェックポイント x はギャップ外・地面のある座標に |
| ④ | レベルリセット時に必ず `G.autoScroll=0` を含める |
| ⑤ | スポーン地点（x=0〜350）に敵・頭上ブロックを置かない |
| ⑥ | チェックポイント周辺 ±300px は敵を置かない |
| ⑦ | コインは300枚以上（城以外のアクションステージ） |
| ⑧ | ステージが短い場合 `flagPole.x` をレベルファイル内で明示的に設定 |
| ⑨ | ドッスン（thwomp）の x〜x+64 の真下にブロックを置かない |
| ⑩ | 新配列を globals.js に追加したら enterUnderground/exitUnderground の savedOW にも追加 |
| ⑪ | 敵を階段・ブロック・土管の中に置かない（押し出されてワープする。城の大階段の敵はアリーナへ侵入した） |
| ⑫ | ?ブロック・隠しブロックの真下に足場を置かない（下から叩けない）。土管（天井土管含む）の中にも置かない |
| ⑬ | 移動足場の往復範囲にブロック・土管を入れない（乗っているマリオが挟まる） |
| ⑭ | 旗竿の位置に階段などを重ねない（addStair(x,n) は x〜x+n*32 を占める。最後の段の右端に注意） |

⑪〜⑭と①⑤⑥は `node tools/check-geometry.mjs` で検出できる（変更後は 0 件を確認）。

## 入力・タイマー・敵処理のルール

- キーを直接見ない: 押下中は `act('jump')` など、ジャンプは `queueJump()`（キーコンフィグ・タッチ・パッドが共通で効く）
- ゲーム状態を変える処理に setInterval / setTimeout を使わない（フレームで数える。`startLevelTimer()` / `G.deathTimer`）
- 敵・弾と地形の当たり判定は `_solidsNear(x)` で近くの足場だけを取る（`[...platforms,...pipes]` を毎回コピーしない）
- 新しい攻撃手段で敵を倒すときは `_enemyHit(e,'種類')` を通す（ドッスン/テレサ無効・チャックはHP制・カロンは崩れる等の耐性が共通）
- ステージ・地下・EX は組み立て直後に `sanitizeLevel()` が埋まったコインを取れる位置へ移す（データ側の検査は tools で）
- main.js は1行が長いので、スクリプトで書き換えるとき行の途中に `//` コメントを入れない（行の残りがコメントになり壊れる。`/* */` を使う）
- 詳細は `docs/systems-reference.md` の「入力・操作感」「メニュー・設定」「セーブ」「タイマー」

## killMario(force) — 使い分けに注意

```javascript
killMario()      // 通常死亡: star/inv/パワーアップ/retryHeart の保護あり
killMario(true)  // 強制死亡: 全保護スキップ（リトライハートも無効。穴落下・タイムアウト・追いかけ壁・ポーズのRETRY）
```
⚠️ タイムアウト・追いかけ壁では必ず `killMario(true)` を使うこと。  
`killMario()` を使うと inv>0 のとき死なず、タイマーがマイナスになり続ける。

## スキル

```
.claude/skills/mario-new-level/SKILL.md  → /mario-new-level  新ステージ追加
.claude/skills/mario-feature/SKILL.md    → /mario-feature    新機能追加
.claude/skills/mario-boss/SKILL.md       → /mario-boss       ボス/城ステージ調整
.claude/skills/mario-review/SKILL.md     → /mario-review     ステージレビュー
```

## 参照ドキュメント

| ファイル | 内容 |
|---|---|
| `docs/level-template.md` | レベルテンプレート・新ステージ追加手順・実装状況一覧 |
| `docs/boss-reference.md` | クッパ難易度テーブル・城ステージ座標・Phase2仕様 |
| `docs/underground-reference.md` | 地下バリアント設計ルール・キノピオ部屋仕様 |
| `docs/world-rules.md` | 氷/砦/飛行船/砂嵐/潮/暗闇/風/重力 ワールド別ルール・敵仕様 |
| `docs/systems-reference.md` | ショップ・パワーアップ・ギミック・ゲームパッド・演出 |
