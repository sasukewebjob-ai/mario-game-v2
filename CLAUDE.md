# Mario Game v2 - プロジェクト仕様書

## 概要
Vite + Vanilla JS によるモジュール分割版 Mario ゲーム。
旧版（mario-game/index.html）から Vite に移行。ゲームロジックは同一。

## 開発環境
```bash
cd mario-game-v2
npm run dev     # 開発サーバー起動（ホットリロードあり）
npm run build   # 本番ビルド（エラーチェックに使う）
```

## ファイル構成
```
src/
├── globals.js        ← 定数・配列・G オブジェクト・ゲームオブジェクト
├── builders.js       ← addB, addRow, addStair, addStairD
├── style.css         ← CSS
├── main.js           ← ゲームループ・update・draw・audio・入力
└── levels/
    ├── level1-1.js   ← buildLevel()
    ├── level1-2.js   ← buildLevel2()
    ├── level1-3.js   ← buildLevel3()
    ├── level1-4.js   ← buildLevel4()
    ├── underground.js ← buildUnderground(variant)
    └── level2-1.js   ← 次に追加（まだ未作成）
```

## 変数の書き方ルール（最重要）

### スカラー変数は G.xxx
```javascript
// NG: starTimer = 0
// OK: G.starTimer = 0

G.starTimer    G.ugMode    G.goalSlide    G.checkpointReached
G.checkpoint   G.combo     G.comboTimer   G.savedOW
G.peachChase   G.score     G.coins        G.lives
G.cam          G.frame     G.currentWorld G.currentLevel
G.state        G.timeLeft  G.shakeX       G.shakeY
```

### 配列・オブジェクトはそのまま
```javascript
// 配列（globals.js からimportしたもの）
platforms.push(...)   // OK
enemies.length = 0    // OK

// オブジェクト
yoshi.alive = false   // OK
bowser.hp--           // OK
mario.vx = 0          // OK
```

## レベルファイルのテンプレート

```javascript
import {platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
  particles,scorePopups,blockAnims,movingPlats,springs,hammers,
  cannons,bulletBills,yoshiEggs,yoshiItems,lavaFlames,bowserFire,
  yoshi,peach,bowser,G,H,TILE,LW} from '../globals.js';
import {addB,addRow,addStair,addStairD} from '../builders.js';

export function buildLevel_2_1(){
  [platforms,pipes,coinItems,enemies,mushrooms,fireballs,piranhas,
   particles,scorePopups,blockAnims,movingPlats,springs,cannons,
   bulletBills,yoshiEggs,yoshiItems].forEach(a=>a.length=0);
  hammers.length=0;bowserFire.length=0;lavaFlames.length=0;
  G.starTimer=0;G.combo=0;G.comboTimer=0;G.checkpointReached=false;
  G.checkpoint=null;G.goalSlide=null;G.ugMode=false;G.savedOW=null;
  peach.alive=false;G.peachChase=null;
  if(!yoshi.mounted){yoshi.alive=false;yoshi.eatCount=0;}
  yoshi.runAway=false;yoshi.runTimer=0;yoshi.eggsReady=0;yoshi.idleTimer=0;
  // ...
}
```

## 新ステージ追加手順（チェックリスト）

1. `src/levels/level2-1.js` を新規作成（上記テンプレート使用）
2. `src/main.js` の import に追加
3. `src/main.js` の goalSlide ハンドラを更新
4. `src/main.js` の `restartCurrentLevel()` にケースを追加
5. `src/main.js` の `drawBG()` に背景を追加（新テーマの場合）
6. `npm run build` でエラーなし確認

## main.js の接続ポイント

### import ブロック（先頭）
```javascript
import {buildLevel} from './levels/level1-1.js';
import {buildLevel2} from './levels/level1-2.js';
// ↑ 新レベルはここに追加
```

### goalSlide 完了ハンドラ
```javascript
else if(G.currentLevel===3){G.currentLevel=4;buildLevel4();...}
// ↓ ここを変更して 2-1 に接続
else{G.state='win';...}
```

### restartCurrentLevel()
```javascript
if(G.currentLevel===1)buildLevel();
else if(G.currentLevel===2)buildLevel2();
else if(G.currentLevel===3)buildLevel3();
else buildLevel4();
// ↓ World 2 追加時はここに分岐追加
```

## 現在の実装状況

| ワールド | ステージ | ファイル | 状態 |
|---|---|---|---|
| 1 | 1-1 | `levels/level1-1.js` | ✅ |
| 1 | 1-2 | `levels/level1-2.js` | ✅ |
| 1 | 1-3 | `levels/level1-3.js` | ✅ |
| 1 | 1-4 | `levels/level1-4.js` | ✅ クッパ・城門・専用BGM |
| 地下 | - | `levels/underground.js` | ✅ 5バリアント |
| 2 | 2-1 | `levels/level2-1.js` | 🔲 未作成 |

## スキル一覧
```
.claude/skills/
├── mario-new-level.md   ← 新ステージ追加（/mario-new-level）
└── mario-feature.md     ← 新機能追加（/mario-feature）
```
