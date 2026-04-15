# Mario Game v2

## 開発環境
```bash
npm run dev     # 開発サーバー（ホットリロード）http://localhost:5173/mario-game-v2/
npm run build   # ビルド確認
npm run deploy  # GitHub Pages デプロイ（masterにpushしただけでは反映されない）
```
公開URL: https://sasukewebjob-ai.github.io/mario-game-v2/

## ファイル構成
```
src/
├── globals.js    ← 定数・配列・G オブジェクト・ゲームオブジェクト
├── builders.js   ← addB, addRow, addStair, addStairD
├── main.js       ← ゲームループ・update・draw・audio・入力
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

## killMario(force) — 使い分けに注意

```javascript
killMario()      // 通常死亡: star/inv/パワーアップ/retryHeart の保護あり
killMario(true)  // 強制死亡: 全保護スキップ（穴落下・タイムアウト・追いかけ壁 専用）
```
⚠️ タイムアウト・追いかけ壁では必ず `killMario(true)` を使うこと。  
`killMario()` を使うと inv>0 のとき死なず、タイマーがマイナスになり続ける。

## スキル

```
.claude/skills/mario-new-level.md  → /mario-new-level  新ステージ追加
.claude/skills/mario-feature.md   → /mario-feature    新機能追加
```

## 参照ドキュメント

| ファイル | 内容 |
|---|---|
| `docs/level-template.md` | レベルテンプレート・新ステージ追加手順・実装状況一覧 |
| `docs/boss-reference.md` | クッパ難易度テーブル・城ステージ座標・Phase2仕様 |
| `docs/underground-reference.md` | 地下バリアント設計ルール・キノピオ部屋仕様 |
| `docs/world-rules.md` | 氷/砦/飛行船/砂嵐/潮/暗闇/風/重力 ワールド別ルール・敵仕様 |
| `docs/systems-reference.md` | ショップ・パワーアップ・ギミック・ゲームパッド・演出 |
